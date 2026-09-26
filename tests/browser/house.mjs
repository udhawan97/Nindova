import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/house");
const port = 4198;
await mkdir(output, { recursive: true });
const previewRoot = await mkdtemp(join(tmpdir(), "nindova-house-test-"));
await cp(resolve(root, "dist"), previewRoot, { recursive: true });
const publishedHouseFiles = await readdir(resolve(previewRoot, "house"), { recursive: true });
assert.equal(publishedHouseFiles.some((path) => String(path).includes("assessment-readiness")), false, "assessment contract stays out of the production House");
assert.doesNotMatch(await readFile(resolve(previewRoot, "house/sw.js"), "utf8"), /assessment-readiness/);
const publishedHouseText = (await Promise.all(publishedHouseFiles
  .filter((path) => /\.(?:html|js|css|webmanifest)$/.test(String(path)))
  .map((path) => readFile(resolve(previewRoot, "house", String(path)), "utf8")))).join("\n");
assert.doesNotMatch(publishedHouseText, /\b(?:Contra|Subway Surfers|Flappy Bird)\b/i, "the shipped game remains an original work");
assert.doesNotMatch(publishedHouseText, /Hold lane|progressively faster three-lane/i, "the obsolete lane runner is not shipped beside the new game");
const harness = await createBrowserEvidenceHarness({
  root,
  previewRoot,
  port,
  launchOptions: { headless: true },
  cleanup: [() => rm(previewRoot, { recursive: true, force: true })],
});
const { errors } = harness;
const externalRequests = [];

async function openHouse(viewport, options = {}, {
  audioProbe = false,
  audioDenied = false,
  acceleratedRaf = false,
  manualRaf = false,
  fakeClock = false,
  controllableVisibility = false,
  reviewMode = false,
  galleryWriteDenied = false,
} = {}) {
  const context = await harness.context({ viewport, ...options });
  if (galleryWriteDenied) {
    await harness.adapt(context, () => {
      const nativeSetItem = Storage.prototype.setItem;
      globalThis.__denyHouseGalleryWrite = true;
      Storage.prototype.setItem = function setItem(key, value) {
        if (key === "nindova:house:v2" && globalThis.__denyHouseGalleryWrite) {
          throw new DOMException("Gallery storage denied by test fixture", "QuotaExceededError");
        }
        return nativeSetItem.call(this, key, value);
      };
    });
  }
  if (acceleratedRaf) {
    await harness.adapt(context, { script: (stepMs) => {
      const nativeRequestAnimationFrame = globalThis.requestAnimationFrame.bind(globalThis);
      let authoredTimestamp = 0;
      let nextFrameId = 1;
      let scheduled = false;
      const queuedFrames = new Map();
      const scheduleFrame = () => {
        if (scheduled || queuedFrames.size === 0) return;
        scheduled = true;
        nativeRequestAnimationFrame(() => {
          scheduled = false;
          authoredTimestamp += stepMs;
          const callbacks = [...queuedFrames.values()];
          queuedFrames.clear();
          callbacks.forEach((callback) => callback(authoredTimestamp));
          scheduleFrame();
        });
      };
      Object.defineProperty(globalThis, "requestAnimationFrame", {
        configurable: true,
        value: (callback) => {
          const frameId = nextFrameId;
          nextFrameId += 1;
          queuedFrames.set(frameId, callback);
          scheduleFrame();
          return frameId;
        },
      });
      Object.defineProperty(globalThis, "cancelAnimationFrame", {
        configurable: true,
        value: (frameId) => queuedFrames.delete(frameId),
      });
    }, argument: typeof acceleratedRaf === "number" ? acceleratedRaf : 100 });
  }
  if (manualRaf) {
    await harness.adapt(context, () => {
      let authoredTimestamp = 0;
      let nextFrameId = 1;
      const queuedFrames = new Map();
      Object.defineProperty(globalThis, "requestAnimationFrame", {
        configurable: true,
        value: (callback) => {
          const frameId = nextFrameId;
          nextFrameId += 1;
          queuedFrames.set(frameId, callback);
          return frameId;
        },
      });
      Object.defineProperty(globalThis, "cancelAnimationFrame", {
        configurable: true,
        value: (frameId) => queuedFrames.delete(frameId),
      });
      globalThis.__advanceHouseTestFrames = (count, stepMs = 800) => {
        for (let frame = 0; frame < count; frame += 1) {
          const callbacks = [...queuedFrames.values()];
          queuedFrames.clear();
          authoredTimestamp += stepMs;
          callbacks.forEach((callback) => callback(authoredTimestamp));
        }
      };
    });
  }
  if (controllableVisibility) {
    await harness.adapt(context, () => {
      let testHidden = false;
      Object.defineProperty(document, "hidden", { configurable: true, get: () => testHidden });
      globalThis.__setHouseTestHidden = (hidden) => {
        testHidden = hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      };
    });
  }
  if (audioDenied) {
    await harness.adapt(context, () => {
      class DeniedAudioContext { constructor() { throw new Error("audio unavailable in test"); } }
      Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: DeniedAudioContext });
    });
  } else if (audioProbe) {
    await harness.adapt(context, () => {
      globalThis.__houseAudioContexts = 0;
      globalThis.__houseAudioCloses = 0;
      globalThis.__houseAudioSuspends = 0;
      globalThis.__houseAudioResumes = 0;
      class ProbeAudioContext {
        constructor() { globalThis.__houseAudioContexts += 1; this.currentTime = 0; this.destination = {}; this.state = "running"; }
        createOscillator() { return { type: "sine", frequency: { value: 0 }, connect: (destination) => destination, start() {}, stop() { this.onended?.(); }, onended: null }; }
        createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
        suspend() { this.state = "suspended"; globalThis.__houseAudioSuspends += 1; return Promise.resolve(); }
        resume() { this.state = "running"; globalThis.__houseAudioResumes += 1; return Promise.resolve(); }
        close() { this.state = "closed"; globalThis.__houseAudioCloses += 1; return Promise.resolve(); }
      }
      Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: ProbeAudioContext });
    });
  }
  const { page } = await harness.page(context);
  if (fakeClock) await page.clock.install();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") externalRequests.push(request.url());
  });
  const response = await page.goto(`http://127.0.0.1:${port}/house/${reviewMode ? "?review=1" : ""}`);
  assert.equal(response?.ok(), true);
  await page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await page.locator("#audienceDialog").getAttribute("open"), "");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#audienceDialog").getAttribute("open"), "", "adult boundary requires an explicit choice");
  await page.click("#enterHouseButton");
  await page.waitForFunction(() => document.activeElement?.id === "houseTitle");
  return { context, page };
}

async function completeChoiceGame(page, gameId, answers, { memory = false } = {}) {
  await page.evaluate((id) => window.__house.start(id), gameId);
  for (let chapter = 0; chapter < answers.length; chapter += 1) {
    if (memory) await page.click("[data-cover-memory]");
    await page.click(`[data-answer="${answers[chapter]}"]`);
    if (chapter < answers.length - 1) {
      await page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    } else {
      await page.waitForSelector(".curtain-call");
    }
  }
}

async function solvePatternChapter(page, chapter) {
  for (let placement = 0; placement < 9; placement += 1) {
    if (await page.evaluate(() => Boolean(window.__house.active?.resolving))) break;
    await page.click("[data-pattern-assist]");
  }
  await page.waitForFunction(
    (expected) => window.__house.active?.chapter === expected && window.__house.active?.resolving,
    chapter,
  );
}

async function completePatternGame(page, { start = true } = {}) {
  if (start) await page.evaluate(() => window.__house.start("pattern-court"));
  for (let chapter = 0; chapter < 5; chapter += 1) {
    await solvePatternChapter(page, chapter);
    if (chapter < 4)
      await page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await page.waitForSelector(".curtain-call");
  }
}

async function solvePatternChapterKeyboard(page, chapter) {
  for (let placement = 0; placement < 9; placement += 1) {
    if (await page.evaluate(() => Boolean(window.__house.active?.resolving))) break;
    await keyboardActivate(page, "[data-pattern-assist]");
  }
  await page.waitForFunction(
    (expected) => window.__house.active?.chapter === expected && window.__house.active?.resolving,
    chapter,
  );
}

function hanoiMoves(discCount, from = 0, to = 2, spare = 1, moves = []) {
  if (discCount === 0) return moves;
  hanoiMoves(discCount - 1, from, spare, to, moves);
  moves.push([from, to]);
  hanoiMoves(discCount - 1, spare, to, from, moves);
  return moves;
}

async function completeStackGame(page) {
  await page.evaluate(() => window.__house.start("stack-architect"));
  for (let chapter = 0; chapter < 5; chapter += 1) {
    for (const [from, to] of hanoiMoves(chapter + 2)) {
      await page.click(`[data-peg="${from}"]`);
      await page.click(`[data-peg="${to}"]`);
    }
    if (chapter < 4) await page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await page.waitForSelector(".curtain-call");
  }
}

async function enterRunnerAction(page) {
  await page.evaluate(() => window.__house.start("sector-sprint"));
  await page.click('[data-runner-route="action"]');
  await page.waitForSelector("#runnerCanvas");
}

async function enterRunnerNarrated(page) {
  await page.evaluate(() => window.__house.start("sector-sprint"));
  const routeChoice = page.locator('[data-runner-route="narrated"]');
  if (await routeChoice.count()) await routeChoice.click();
  else {
    const narratedRoute = page.locator("[data-runner-story]");
    if (await narratedRoute.count()) await narratedRoute.click();
  }
  await page.waitForSelector(".runner-story");
}

async function completeRunnerStory(page) {
  await enterRunnerNarrated(page);
  await page.click('[data-encounter-choice="0"]');
  await page.click('[data-dialog-close]');
  await page.click('[data-runner-pause]');
  for (const id of ['market','roses','craft','lake','home']) {
    await page.click(`[data-visit="${id}"]`);
    await page.click('[data-encounter-choice="0"]');
    await page.click('[data-dialog-close]');
  }
  await page.waitForSelector('.curtain-call');
}

async function keyboardActivate(page, selector) {
  await page.waitForSelector(selector, { state: "visible" });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await page.evaluate((candidate) => document.activeElement?.matches(candidate), selector)) {
      await page.keyboard.press("Enter");
      await page.evaluate(() => new Promise(requestAnimationFrame));
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error(`Keyboard could not reach ${selector}`);
}

try {
  const boundaryContext = await harness.context({ viewport: { width: 320, height: 568 } });
  const { page: boundaryPage } = await harness.page(boundaryContext);
  await boundaryPage.goto(`http://127.0.0.1:${port}/house/`);
  await boundaryPage.waitForFunction(() => Boolean(window.__house));
  const audienceDialogBox = await boundaryPage.locator("#audienceDialog").boundingBox();
  const leaveHouseBox = await boundaryPage.locator(".quiet-link").boundingBox();
  assert.ok(audienceDialogBox && leaveHouseBox && leaveHouseBox.y + leaveHouseBox.height <= audienceDialogBox.y + audienceDialogBox.height, "both audience-boundary choices are visible at 320×568");
  await boundaryPage.locator(".quiet-link").click();
  await boundaryPage.waitForURL(`http://127.0.0.1:${port}/`);
  assert.equal(await boundaryPage.evaluate(() => localStorage.getItem("nindova:house:adult-audience:v1")), null, "leaving does not acknowledge the adult boundary");
  await boundaryContext.close();

  for (const [hash, heading] of [["#gallery", "galleryTitle"], ["#door/pattern-line", "categoryTitle"]]) {
    const directContext = await harness.context({ viewport: { width: 320, height: 568 } });
    const { page: directPage } = await harness.page(directContext);
    await directPage.goto(`http://127.0.0.1:${port}/house/${hash}`);
    await directPage.waitForFunction(() => Boolean(window.__house));
    await directPage.click("#enterHouseButton");
    await directPage.waitForFunction((id) => document.activeElement?.id === id, heading);
    assert.equal(await directPage.evaluate(() => window.scrollY), 0, `${hash} acceptance exposes the current view from its top`);
    await directContext.close();
  }

  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    const { context, page } = await openHouse(viewport);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    assert.equal(await page.locator(".game-door").count(), 5);
    assert.equal(await page.locator("text=For adults 18+").first().isVisible(), true);
    assert.doesNotMatch((await page.locator("body").innerText()).toLowerCase(), /\biq\b|intelligence result|leaderboard/);
    for (const button of await page.locator(".game-door").all()) {
      const box = await button.boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, `game door target at ${viewport.width}px`);
    }
    if (viewport.width === 320) {
      const browseBox = await page.locator(".house-browse").boundingBox();
      assert.ok(browseBox && browseBox.y + browseBox.height <= viewport.height, "the mobile House exposes a first-viewport path to its five doors");
    }
    if ([320, 375, 1440].includes(viewport.width)) {
      await page.screenshot({ path: resolve(output, `house-${viewport.width}x${viewport.height}.png`), fullPage: true, animations: "disabled" });
    }
    if (viewport.width === 320) {
      assert.equal(await page.evaluate(() => localStorage.getItem("nindova:house:adult-audience:v1")), "acknowledged");
      await page.reload();
      await page.waitForFunction(() => Boolean(window.__house));
      assert.equal(await page.locator("#audienceDialog").getAttribute("open"), null, "acknowledgement suppresses the dialog after reload");
    }
    await context.close();
  }

  const navigation = await openHouse({ width: 320, height: 568 }, { reducedMotion: "reduce" });
  await navigation.page.locator('[data-category="pattern-line"]').scrollIntoViewIfNeeded();
  const rememberedHomeScroll = await navigation.page.evaluate(() => window.scrollY);
  assert.ok(rememberedHomeScroll > 0, "the mobile House has a meaningful list position to restore");
  await navigation.page.click('[data-category="pattern-line"]');
  await navigation.page.waitForSelector("#categoryTitle");
  await navigation.page.waitForFunction(() => window.scrollY === 0);
  assert.ok((await navigation.page.locator("#categoryTitle").boundingBox())?.y >= 0, "a forward door transition shows its heading");
  await navigation.page.goBack();
  await navigation.page.waitForSelector(".floor-plan");
  await navigation.page.waitForFunction((expected) => Math.abs(window.scrollY - expected) <= 2, rememberedHomeScroll);
  await navigation.page.click('[data-category="pattern-line"]');
  await navigation.page.locator('[data-game="pattern-court"]').scrollIntoViewIfNeeded();
  const rememberedCategoryScroll = await navigation.page.evaluate(() => window.scrollY);
  assert.ok(rememberedCategoryScroll > 0, "the category has a meaningful table position to restore");
  await navigation.page.click('[data-game="pattern-court"]');
  await navigation.page.waitForSelector("#gameTitle");
  await navigation.page.waitForFunction(() => window.scrollY === 0);
  assert.ok((await navigation.page.locator("#gameTitle").boundingBox())?.y >= 0, "a forward table transition shows its task context");
  await navigation.page.click('.game-view [data-history-back="category"]');
  await navigation.page.waitForSelector("#categoryTitle");
  await navigation.page.waitForFunction((expected) => Math.abs(window.scrollY - expected) <= 2, rememberedCategoryScroll);
  await navigation.page.click('.category-view [data-history-back="home"]');
  await navigation.page.waitForSelector(".floor-plan");
  await navigation.page.waitForFunction((expected) => Math.abs(window.scrollY - expected) <= 2, rememberedHomeScroll);
  await navigation.context.close();

  for (const backMethod of ["browser", "visible"]) {
    const confirmedBack = await openHouse({ width: 320, height: 568 }, { reducedMotion: "reduce" });
    await confirmedBack.page.click('[data-category="pattern-line"]');
    await confirmedBack.page.locator('[data-game="pattern-court"]').scrollIntoViewIfNeeded();
    const confirmedCategoryScroll = await confirmedBack.page.evaluate(() => window.scrollY);
    assert.ok(confirmedCategoryScroll > 0, `${backMethod} confirmation starts from a meaningful category position`);
    await confirmedBack.page.click('[data-game="pattern-court"]');
    await confirmedBack.page.click('[data-pattern-assist]');
    if (backMethod === "browser") await confirmedBack.page.goBack();
    else await confirmedBack.page.click('.game-view [data-history-back="category"]');
    await confirmedBack.page.waitForSelector("#leaveDialog[open]");
    await confirmedBack.page.click("#leaveTableButton");
    await confirmedBack.page.waitForSelector("#categoryTitle");
    await confirmedBack.page.waitForFunction((expected) => Math.abs(window.scrollY - expected) <= 2, confirmedCategoryScroll);
    await confirmedBack.context.close();
  }

  const deniedCompletion = await openHouse(
    { width: 1280, height: 800 },
    { reducedMotion: "reduce" },
    { galleryWriteDenied: true },
  );
  await completePatternGame(deniedCompletion.page);
  assert.match(await deniedCompletion.page.locator(".result-boundary").innerText(), /could not be stored/i);
  assert.equal(await deniedCompletion.page.locator("[data-retry-completion]").isVisible(), true);
  assert.equal(await deniedCompletion.page.locator('[data-route="gallery"]').count(), 0, "an unsaved completion does not offer a misleading Gallery path");
  assert.equal(await deniedCompletion.page.evaluate(() => localStorage.getItem("nindova:house:v2")), null);
  assert.equal(await deniedCompletion.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]), undefined);
  await deniedCompletion.page.evaluate(() => { globalThis.__denyHouseGalleryWrite = false; });
  await deniedCompletion.page.click("[data-retry-completion]");
  assert.match(await deniedCompletion.page.locator(".result-boundary").innerText(), /stored only on this device/i);
  assert.equal(await deniedCompletion.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]?.runId), await deniedCompletion.page.evaluate(() => JSON.parse(localStorage.getItem("nindova:house:v2")).latestByGame["pattern-court"].runId));
  await deniedCompletion.context.close();

  const classicDoors = await openHouse({ width: 414, height: 896 }, { reducedMotion: "reduce" });
  await classicDoors.page.click('[data-category="turn-trap"]');
  assert.equal(await classicDoors.page.locator(".category-table").count(), 2);
  assert.match(await classicDoors.page.locator(".category-view").innerText(), /Authored tactical rule study/i);
  await classicDoors.page.click('[data-game="aadu-puli-attam"]');
  assert.equal(await classicDoors.page.locator(".aadu-board .board-point").count(), 23);
  assert.notEqual(
    await classicDoors.page.locator(".aadu-board").evaluate((element) => getComputedStyle(element, "::before").backgroundImage),
    "none",
    "classic line boards render a crafted table surface beneath canonical geometry",
  );
  assert.match(await classicDoors.page.locator(".classic-study-description").textContent(), /selected tiger is at point 1.*Goats occupy point 4, point 2, point 7/);
  assert.match(await classicDoors.page.locator('.aadu-board [data-answer="0"]').getAttribute("aria-label"), /Choice A, point 10.*a goat at point 4 between/);
  for (const option of await classicDoors.page.locator(".aadu-board button").all()) {
    const box = await option.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, "Aadu destination remains a 44px target");
  }
  assert.match(await classicDoors.page.locator(".study-provenance").innerText(), /Source and scope/);
  assert.equal(await classicDoors.page.evaluate(() => document.documentElement.scrollWidth), 414);
  await classicDoors.page.screenshot({ path: resolve(output, "aadu-puli-study-414x896.png"), fullPage: true, animations: "disabled" });
  await classicDoors.page.click('[data-history-back="category"]');
  await classicDoors.page.click('[data-history-back="home"]');
  await classicDoors.page.click('[data-category="pattern-line"]');
  await classicDoors.page.click('[data-game="navakankari"]');
  assert.equal(await classicDoors.page.locator(".navakankari-board .board-point").count(), 24);
  assert.match(await classicDoors.page.locator(".classic-study-description").textContent(), /Your brass pieces are at point 1, point 2/);
  assert.match(await classicDoors.page.locator('.navakankari-board [data-answer="0"]').getAttribute("aria-label"), /Choice A, point 3.*containing 2 of your existing pieces/);
  await classicDoors.page.click('[data-history-back="category"]');
  await classicDoors.page.click('[data-history-back="home"]');
  await classicDoors.page.click('[data-category="count-carry"]');
  await classicDoors.page.click('[data-game="pallanguzhi"]');
  assert.equal(await classicDoors.page.locator(".pallanguzhi-pit").count(), 14);
  assert.notEqual(
    await classicDoors.page.locator(".pallanguzhi-pit").first().evaluate((element) => getComputedStyle(element).boxShadow),
    "none",
    "Pallanguzhi pits read as recessed carved cups",
  );
  assert.match(await classicDoors.page.locator(".classic-study-description").textContent(), /Lower row left to right: pit 1: 2.*Top row left to right: pit 14: 0/);
  assert.match(await classicDoors.page.locator('button.pallanguzhi-pit[data-answer="0"]').getAttribute("aria-label"), /Choice A, lower pit 1.*2 deposits.*final deposit at pit 3/);
  for (const option of await classicDoors.page.locator("button.pallanguzhi-pit").all()) {
    const box = await option.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, "Pallanguzhi starting pit remains a 44px target");
  }
  assert.equal(await classicDoors.page.evaluate(() => document.documentElement.scrollWidth), 414);
  await classicDoors.page.click('[data-history-back="category"]');
  await classicDoors.page.click('[data-history-back="home"]');
  await classicDoors.page.click('[data-category="memory-sequence"]');
  assert.equal(await classicDoors.page.locator('[data-game="lantern-ledger"]').count(), 1, "Memory & Sequence opens through Door IV");
  await classicDoors.page.click('[data-history-back="home"]');
  await classicDoors.page.click('[data-category="motion-route"]');
  assert.equal(await classicDoors.page.locator('[data-game="sector-sprint"]').count(), 1, "Motion & Route opens through Door V");
  await classicDoors.context.close();

  const narrow = await openHouse({ width: 320, height: 568 }, { reducedMotion: "reduce" });
  await narrow.page.evaluate(() => window.__house.start("navakankari"));
  assert.equal(await narrow.page.evaluate(() => document.documentElement.scrollWidth), 320);
  for (const option of await narrow.page.locator(".navakankari-board button").all()) {
    await option.scrollIntoViewIfNeeded();
    const box = await option.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44 && box.x >= 0 && box.x + box.width <= 320, `320px Navakankari chapter-one choice is fully actionable (${JSON.stringify(box)})`);
  }
  await narrow.page.click('.navakankari-board [data-answer="0"]');
  await narrow.page.waitForFunction(() => window.__house.active?.chapter === 1);
  await narrow.page.evaluate(() => window.__house.start("lantern-ledger"));
  assert.equal(await narrow.page.locator(".lantern-flame").first().evaluate((element) => getComputedStyle(element).animationName), "none", "reduced motion shows the finished Lantern truth without ignition motion");
  assert.equal(await narrow.page.locator(".lantern-flame").first().evaluate((element) => getComputedStyle(element).opacity), "1");
  for (const [chapter, answer] of [0, 1, 0, 1].entries()) {
    await narrow.page.click("[data-cover-memory]");
    await narrow.page.click(`[data-answer="${answer}"]`);
    await narrow.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
  }
  assert.equal(await narrow.page.locator(".lantern").count(), 7, "the final authored procession keeps all seven positions visible at 320px");
  for (const lantern of await narrow.page.locator(".lantern-body").all()) {
    const box = await lantern.boundingBox();
    assert.ok(box && box.x >= 0 && box.x + box.width <= 320, "every final-procession lantern stays inside the phone viewport");
  }
  await narrow.page.click("[data-cover-memory]");
  assert.equal(await narrow.page.evaluate(() => document.documentElement.scrollWidth), 320);
  for (const answer of await narrow.page.locator(".answer-list button").all()) {
    const box = await answer.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44 && box.x >= 0 && box.x + box.width <= 320, "320px Lantern chapter-five answer stays operable");
  }
  await narrow.page.click('[data-answer="2"]');
  await narrow.page.waitForSelector(".curtain-call");
  await narrow.page.click('[data-route="home"]');
  await narrow.page.evaluate(() => window.__house.start("stack-architect"));
  for (let chapter = 0; chapter < 4; chapter += 1) {
    for (const [from, to] of hanoiMoves(chapter + 2)) {
      await narrow.page.click(`[data-peg="${from}"]`);
      await narrow.page.click(`[data-peg="${to}"]`);
    }
    await narrow.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
  }
  assert.equal(await narrow.page.evaluate(() => document.documentElement.scrollWidth), 320);
  for (const peg of await narrow.page.locator("[data-peg]").all()) {
    const box = await peg.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44 && box.x >= 0 && box.x + box.width <= 320, "320px six-disc Stack plinth stays operable");
  }
  const finalDiscs = await narrow.page.locator('[data-peg="0"] .disc').all();
  assert.equal(finalDiscs.length, 6);
  assert.ok((await Promise.all(finalDiscs.map((disc) => disc.boundingBox()))).every((box) => box && box.width > 0 && box.height > 0));
  assert.match(await narrow.page.locator('[data-peg="0"]').getAttribute("aria-label"), /Discs from bottom to top: 6, 5, 4, 3, 2, 1\. Top disc: 1\./);
  assert.equal(await narrow.page.evaluate(() => document.activeElement?.matches('[data-peg="0"]')), true);
  const [finalFrom, finalTo] = hanoiMoves(6)[0];
  await keyboardActivate(narrow.page, `[data-peg="${finalFrom}"]`);
  await keyboardActivate(narrow.page, `[data-peg="${finalTo}"]`);
  await narrow.page.waitForFunction((peg) => document.activeElement?.matches(`[data-peg="${peg}"]`), finalTo);
  assert.equal(await narrow.page.evaluate((peg) => document.activeElement?.matches(`[data-peg="${peg}"]`), finalTo), true);
  await narrow.context.close();

  const recovery = await openHouse({ width: 375, height: 812 });
  await recovery.page.evaluate(() => window.__house.start("pattern-court"));
  await recovery.page.click('[data-pattern-assist]');
  await recovery.page.click('[data-history-back="category"]');
  assert.equal(await recovery.page.locator("#leaveDialog").getAttribute("open"), "", "unfinished progress asks before leaving");
  await recovery.page.click("#keepPlayingButton");
  assert.equal(await recovery.page.evaluate(() => window.__house.active?.gameId), "pattern-court", "Keep playing preserves the active table");
  assert.equal(await recovery.page.evaluate(() => document.activeElement?.matches('[data-history-back="category"]')), true, "cancel returns focus to the exit control");
  await recovery.page.click('[data-history-back="category"]');
  await recovery.page.click("#leaveTableButton");
  assert.equal(await recovery.page.evaluate(() => window.__house.active), null, "confirmed exit clears unfinished state");
  assert.equal(await recovery.page.evaluate(() => sessionStorage.getItem("nindova:house:active:v1")), null);
  assert.equal(await recovery.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]), undefined, "exit records no completion");
  await recovery.page.goBack();
  await recovery.page.waitForFunction(() => window.__house.active === null);
  assert.doesNotMatch(new URL(recovery.page.url()).hash, /#game\//, "Back after confirmed leave cannot restart the abandoned game");
  await recovery.page.evaluate(() => window.__house.start("pattern-court"));
  await recovery.page.click('[data-history-back="category"]');
  assert.equal(await recovery.page.locator("#leaveDialog").getAttribute("open"), null, "an untouched first chapter exits without interruption");
  await recovery.context.close();

  const cancelledBack = await openHouse({ width: 320, height: 568 });
  await cancelledBack.page.click('[data-category="pattern-line"]');
  await cancelledBack.page.locator('[data-game="navakankari"]').scrollIntoViewIfNeeded();
  await cancelledBack.page.evaluate(() => window.scrollBy(0, 180));
  const categoryScroll = await cancelledBack.page.evaluate(() => window.scrollY);
  assert.ok(categoryScroll > 0, "the lower category table establishes a meaningful return position");
  await cancelledBack.page.click('[data-game="navakankari"]');
  await cancelledBack.page.click('[data-answer="1"]');
  await cancelledBack.page.goBack();
  await cancelledBack.page.waitForSelector("#leaveDialog[open]");
  await cancelledBack.page.keyboard.press("Escape");
  await cancelledBack.page.waitForFunction(() => !document.querySelector("#leaveDialog")?.hasAttribute("open"));
  await cancelledBack.page.waitForFunction(() => document.activeElement?.matches('[data-history-back="category"]'));
  assert.equal(await cancelledBack.page.evaluate(() => document.activeElement?.matches('[data-history-back="category"]')), true, "Escape from a browser-Back leave request restores the visible table exit");
  await cancelledBack.page.click('[data-history-back="category"]');
  await cancelledBack.page.waitForSelector("#leaveDialog[open]");
  await cancelledBack.page.click("#leaveTableButton");
  await cancelledBack.page.waitForFunction(() => window.__house.view === "category" && window.__house.active === null);
  const returnedScroll = await cancelledBack.page.evaluate(() => window.scrollY);
  assert.ok(Math.abs(returnedScroll - categoryScroll) <= 2, `cancel → retry → leave restores category scroll (${returnedScroll} vs ${categoryScroll})`);
  assert.equal(await cancelledBack.page.evaluate(() => window.__house.memory.latestByGame.navakankari), undefined, "cancelled and confirmed unfinished exits never create a Gallery reading");
  await cancelledBack.context.close();

  const finalChoiceExit = await openHouse({ width: 375, height: 812 });
  await finalChoiceExit.page.evaluate(() => window.__house.start("pattern-court"));
  for (let chapter = 0; chapter < 4; chapter += 1) {
    await solvePatternChapter(finalChoiceExit.page, chapter);
    await finalChoiceExit.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
  }
  await solvePatternChapter(finalChoiceExit.page, 4);
  await finalChoiceExit.page.click('[data-history-back="category"]');
  await finalChoiceExit.page.waitForTimeout(900);
  assert.equal(await finalChoiceExit.page.locator("#leaveDialog").getAttribute("open"), "", "the final-chapter confirmation remains open past the completion delay");
  assert.deepEqual(await finalChoiceExit.page.evaluate(() => ({ chapter: window.__house.active?.chapter, resolving: window.__house.active?.resolving })), { chapter: 4, resolving: true }, "the final chapter cannot complete behind its exit confirmation");
  assert.equal(await finalChoiceExit.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]), undefined);
  await finalChoiceExit.page.click("#leaveTableButton");
  await finalChoiceExit.page.waitForTimeout(900);
  assert.equal(await finalChoiceExit.page.evaluate(() => window.__house.active), null);
  assert.equal(await finalChoiceExit.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]), undefined, "leaving during the final transition records no completion");
  await finalChoiceExit.context.close();

  const pattern = await openHouse({ width: 375, height: 812 });
  await pattern.page.evaluate(() => window.__house.start("pattern-court"));
  assert.equal(await pattern.page.evaluate(() => window.__house.active?.chapter), 0);
  assert.equal(await pattern.page.locator(".pattern-court-grid .pattern-cell").count(), 9, "Pattern Court presents a complete nine-cell construction board");
  assert.ok(await pattern.page.locator("[data-pattern-piece]").count() >= 5, "loose pieces make the rule playable rather than a multiple-choice prompt");
  await pattern.page.locator('[data-pattern-piece][data-mark="sun"]').first().click();
  await pattern.page.click('[data-pattern-cell="2"]');
  assert.equal(await pattern.page.locator('[data-pattern-cell="2"]').getAttribute("data-mark"), "sun");
  assert.equal(await pattern.page.locator('[data-pattern-cell="2"]').getAttribute("class").then((value) => value.includes("is-conflict")), true, "a wrong manual placement gets clear conflict feedback");
  assert.match(await pattern.page.locator("#gameStatus").innerText(), /breaks this court's rule/i);
  await pattern.page.locator('[data-pattern-piece][data-mark="diamond"]').first().click();
  await pattern.page.click('[data-pattern-cell="2"]');
  assert.equal(await pattern.page.locator('[data-pattern-cell="2"]').getAttribute("data-mark"), "diamond", "placing onto a filled cell swaps the loose piece");
  const inProgressPattern = await pattern.page.evaluate(() => window.__house.active?.pattern);
  await pattern.page.reload();
  await pattern.page.waitForSelector(".restore-gate");
  await pattern.page.click('[data-restore="continue"]');
  assert.deepEqual(await pattern.page.evaluate(() => window.__house.active?.pattern), inProgressPattern, "an in-progress construction restores exactly");
  await pattern.page.click("[data-pattern-undo]");
  assert.equal(await pattern.page.locator('[data-pattern-cell="2"]').getAttribute("data-mark"), "sun", "Undo restores the displaced piece");
  await pattern.page.click("[data-pattern-reset]");
  assert.equal(await pattern.page.locator('[data-pattern-cell="2"]').getAttribute("data-mark"), "open", "Reset returns every changeable cell to the authored start");
  for (const [mark, cell] of [["sun", 1], ["diamond", 2], ["sun", 5], ["diamond", 6], ["sun", 7]]) {
    await pattern.page.locator(`[data-pattern-piece][data-mark="${mark}"]`).first().click();
    await pattern.page.click(`[data-pattern-cell="${cell}"]`);
  }
  await pattern.page.waitForFunction(() => Boolean(window.__house.active?.resolving));
  await pattern.page.screenshot({ path: resolve(output, "pattern-court-375x812.png"), fullPage: true, animations: "disabled" });
  assert.equal(await pattern.page.locator("#celebration").isVisible(), true);
  await pattern.page.screenshot({ path: resolve(output, "pattern-celebration-375x812.png"), fullPage: true });
  await pattern.page.waitForFunction(() => window.__house.active?.chapter === 1);
  for (let chapter = 1; chapter < 5; chapter += 1) {
    await solvePatternChapter(pattern.page, chapter);
    assert.equal(await pattern.page.locator("#celebration").isVisible(), true);
    if (chapter < 4) await pattern.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
  }
  await pattern.page.waitForSelector(".curtain-call");
  assert.match(await pattern.page.locator(".curtain-call").innerText(), /five authored chapters/);
  await pattern.page.screenshot({ path: resolve(output, "pattern-curtain-call-375x812.png"), fullPage: true, animations: "disabled" });
  const patternResult = await pattern.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]);
  assert.equal(patternResult.mode, "entertainment");
  assert.equal(patternResult.rulesetVersion, "entertainment-1");
  assert.equal(patternResult.completionFacts.authoredChapters, 5);
  await pattern.context.close();

  for (const viewport of [{ width: 320, height: 568 }, { width: 375, height: 812 }]) {
    const patternBounds = await openHouse(viewport);
    const assertPatternBoardFits = async (label) => {
      assert.equal(await patternBounds.page.locator(".pattern-court-grid .pattern-cell").count(), 9, `${label} renders all nine construction cells`);
      const bounds = await patternBounds.page.locator(".pattern-court-grid").boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= viewport.width + 0.5, `${label} keeps the court inside the viewport`);
      assert.equal(await patternBounds.page.evaluate(() => document.documentElement.scrollWidth), viewport.width, `${label} creates no horizontal overflow`);
    };
    await patternBounds.page.evaluate(() => window.__house.start("pattern-court"));
    const mastheadLines = await patternBounds.page.locator('[data-history-back="category"]').evaluate((button) => {
      const range = document.createRange();
      range.selectNodeContents(button);
      return new Set([...range.getClientRects()].filter((rect) => rect.width > 0).map((rect) => Math.round(rect.top))).size;
    });
    assert.equal(mastheadLines, 1, `${viewport.width}px keeps the full game destination on one visible line`);
    await solvePatternChapter(patternBounds.page, 0);
    await patternBounds.page.waitForFunction(() => window.__house.active?.chapter === 1);
    await assertPatternBoardFits(`${viewport.width}px chapter 2`);
    await patternBounds.page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    assert.equal(await patternBounds.page.evaluate(() => document.documentElement.scrollWidth), viewport.width, `${viewport.width}px Pattern Court reflows at 200% text scaling`);
    await assertPatternBoardFits(`${viewport.width}px chapter 2 at 200% text scaling`);
    await patternBounds.page.evaluate(() => { document.documentElement.style.fontSize = ""; });
    await solvePatternChapter(patternBounds.page, 1);
    await patternBounds.page.waitForFunction(() => window.__house.active?.chapter === 2);
    await solvePatternChapter(patternBounds.page, 2);
    await patternBounds.page.waitForFunction(() => window.__house.active?.chapter === 3);
    await assertPatternBoardFits(`${viewport.width}px chapter 4`);
    await patternBounds.page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
    assert.equal(await patternBounds.page.evaluate(() => document.documentElement.scrollWidth), viewport.width, `${viewport.width}px chapter 4 reflows at 200% text scaling`);
    await assertPatternBoardFits(`${viewport.width}px chapter 4 at 200% text scaling`);
    await patternBounds.context.close();
  }

  const mirror = await openHouse({ width: 414, height: 896 });
  await mirror.page.evaluate(() => window.__house.start("mirror-forge"));
  assert.notEqual(await mirror.page.locator(".mirror-ring-outer").evaluate((element) => getComputedStyle(element).animationName), "none", "Mirror Forge has an enabled-motion compass entrance");
  assert.notEqual(
    await mirror.page.locator(".mirror-stage").evaluate((element) => getComputedStyle(element, "::before").backgroundImage),
    "none",
    "Mirror Forge renders a smoked reflective plate behind the compass rings",
  );
  await mirror.page.click('[data-answer="0"]');
  assert.match(await mirror.page.locator("#gameStatus").innerText(), /Not this inscription/);
  await mirror.page.click('[data-answer="1"]');
  await mirror.page.screenshot({ path: resolve(output, "mirror-forge-response-414x896.png"), fullPage: true });
  await mirror.context.close();

  const memory = await openHouse({ width: 768, height: 1024 });
  await memory.page.evaluate(() => window.__house.start("lantern-ledger"));
  assert.equal(await memory.page.locator(".answer-list button").first().isDisabled(), true);
  const processionLabel = await memory.page.locator(".inscription").getAttribute("aria-label");
  assert.deepEqual(await memory.page.locator(".lantern").evaluateAll((lanterns) => lanterns.map((lantern) => ({ position: lantern.getAttribute("data-lantern-position"), order: lantern.querySelector(".lantern-order")?.textContent }))), [
    { position: "1", order: "I" }, { position: "2", order: "II" }, { position: "3", order: "III" },
  ], "Lantern positions encode the authored left-to-right order");
  assert.equal(await memory.page.locator(".lantern-flame").first().evaluate((element) => getComputedStyle(element).animationName), "lantern-ignite", "Lantern Ledger has an authored ignition sequence");
  const ignitionDelays = await memory.page.locator(".lantern-flame").evaluateAll((flames) => flames.map((flame) => Number.parseFloat(getComputedStyle(flame).animationDelay) * 1_000));
  assert.ok(ignitionDelays.every((delay, index) => index === 0 || delay > ignitionDelays[index - 1]), "each flame ignites after the preceding authored position");
  assert.equal(await memory.page.locator(".lantern-even-glow").evaluate((element) => getComputedStyle(element).animationName), "lantern-even-glow", "the procession resolves into one bounded even-glow line");
  assert.notEqual(
    await memory.page.locator(".lantern i").first().evaluate((element) => getComputedStyle(element, "::before").content),
    "none",
    "Lantern Ledger lights contain a visible flame and cap assembly",
  );
  await memory.page.waitForTimeout(1_700);
  await memory.page.screenshot({ path: resolve(output, "lantern-procession-768x1024.png"), fullPage: true });
  await memory.page.click("[data-cover-memory]");
  assert.equal(await memory.page.locator(".answer-list button").first().isEnabled(), true);
  assert.equal(await memory.page.locator(".lantern-veil-panel").count(), 2, "covering draws two deterministic velvet panels");
  assert.deepEqual(await memory.page.locator(".lantern-veil-panel").evaluateAll((panels) => panels.map((panel) => getComputedStyle(panel).animationName)), ["veil-close-left", "veil-close-right"]);
  await memory.page.screenshot({ path: resolve(output, "lantern-covered-768x1024.png"), fullPage: true, animations: "disabled" });
  await memory.page.click("[data-reveal-memory]");
  assert.equal(await memory.page.locator(".answer-list button").first().isDisabled(), true, "revealing again disables answers until the procession is covered");
  assert.equal(await memory.page.locator(".inscription").getAttribute("aria-label"), processionLabel, "replay shows the same authored procession");
  await memory.page.click("[data-cover-memory]");
  await memory.page.reload();
  await memory.page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await memory.page.evaluate(() => window.__house.active?.gameId), "lantern-ledger");
  assert.equal(await memory.page.evaluate(() => window.__house.active?.memoryCovered), true);
  assert.equal(await memory.page.locator(".restore-gate").isVisible(), true, "restored non-runner sessions require an explicit choice");
  await memory.page.click('[data-restore="continue"]');
  assert.equal(await memory.page.locator(".answer-list button").first().isEnabled(), true);
  assert.match(await memory.page.locator("#gameStatus").innerText(), /restored in this tab/i);
  await memory.page.reload();
  await memory.page.waitForSelector(".restore-gate");
  await memory.page.click('[data-restore="restart"]');
  assert.equal(await memory.page.evaluate(() => window.__house.active?.chapter), 0);
  assert.equal(await memory.page.evaluate(() => window.__house.active?.memoryCovered), false, "Start over creates a fresh first chapter");
  await memory.page.click("[data-cover-memory]");
  await memory.page.reload();
  await memory.page.waitForSelector(".restore-gate");
  await memory.page.click('[data-restore="exit"]');
  assert.equal(await memory.page.evaluate(() => window.__house.active), null, "restored-session Exit clears the held table");
  assert.equal(await memory.page.evaluate(() => sessionStorage.getItem("nindova:house:active:v1")), null);
  await memory.context.close();

  const lanternSurfaces = await openHouse({ width: 414, height: 896 });
  await lanternSurfaces.page.evaluate(() => window.__house.start("lantern-ledger"));
  assert.equal(await lanternSurfaces.page.evaluate(() => document.documentElement.scrollWidth), 414);
  await lanternSurfaces.page.screenshot({ path: resolve(output, "lantern-ledger-414x896.png"), fullPage: true, animations: "disabled" });
  await lanternSurfaces.page.setViewportSize({ width: 1_440, height: 900 });
  const desktopInstrument = await lanternSurfaces.page.locator(".lantern-instrument").boundingBox();
  assert.ok(desktopInstrument && desktopInstrument.y < 900 && desktopInstrument.width >= 440, "the Lantern instrument enters and uses the first desktop viewport");
  assert.equal(await lanternSurfaces.page.evaluate(() => document.documentElement.scrollWidth), 1_440);
  await lanternSurfaces.page.screenshot({ path: resolve(output, "lantern-ledger-1440x900.png"), fullPage: true, animations: "disabled" });
  await lanternSurfaces.context.close();

  const stack = await openHouse({ width: 414, height: 896 });
  await stack.page.evaluate(() => window.__house.start("stack-architect"));
  assert.notEqual(
    await stack.page.locator(".peg").first().evaluate((element) => getComputedStyle(element, "::before").backgroundImage),
    "none",
    "Stack Architect plinths sit on a crafted rosewood table bed",
  );
  await stack.page.screenshot({ path: resolve(output, "stack-architect-414x896.png"), fullPage: true, animations: "disabled" });
  const renderedDiscs = await stack.page.locator('[data-peg="0"] .disc').evaluateAll((discs) => discs.map((disc) => {
    const box = disc.getBoundingClientRect();
    return { disc: Number(disc.getAttribute("data-disc")), top: box.top, width: box.width };
  }));
  assert.deepEqual(renderedDiscs.map((disc) => disc.disc), [1, 2]);
  assert.ok(renderedDiscs[0].top < renderedDiscs[1].top, "top disc renders above the bottom disc");
  assert.ok(renderedDiscs[0].width < renderedDiscs[1].width, "top disc renders narrower than the bottom disc");
  await stack.page.click('[data-peg="0"]');
  assert.equal(await stack.page.locator(".stack-board").getAttribute("data-stack-state"), "lifted");
  assert.equal(await stack.page.locator('[data-peg="0"] .disc.is-lifted').getAttribute("data-disc"), "1", "only the movable top disc receives the lift treatment");
  await stack.page.click('[data-peg="1"]');
  assert.deepEqual(await stack.page.evaluate(() => window.__house.active?.pegs), [[2], [1], []]);
  assert.equal(await stack.page.locator('.stack-move-trace[data-stack-from="0"][data-stack-to="1"]').count(), 1, "the visible traverse follows the actual legal move");
  assert.notEqual(await stack.page.locator(".stack-move-trace b").evaluate((element) => getComputedStyle(element).animationName), "none", "the moved disc receives a bounded traverse response");
  assert.notEqual(await stack.page.locator('[data-peg="1"] .disc.is-placed').evaluate((element) => getComputedStyle(element).animationName), "none", "a placed Stack disc has a settle response");
  await stack.page.waitForTimeout(300);
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="2"]');
  await stack.page.waitForTimeout(350);
  await stack.page.click('[data-peg="1"]');
  assert.equal(await stack.page.locator('.stack-move-trace[data-stack-from="0"][data-stack-to="2"]').count(), 1, "a prior move timer cannot erase a newer traverse during rapid legal play");
  await stack.page.click("[data-reset-stack]");
  assert.deepEqual(await stack.page.evaluate(() => window.__house.active?.pegs), [[2, 1], [], []], "reset affects only the current tower chapter");
  assert.equal(await stack.page.evaluate(() => window.__house.active?.chapter), 0);
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="1"]');
  await stack.page.waitForTimeout(650);
  assert.equal(await stack.page.locator('.stack-move-trace[data-stack-from="0"][data-stack-to="1"]').count(), 0, "the current move trace retires from the DOM after its bounded presentation window");
  assert.equal(await stack.page.locator(".disc.is-placed").count(), 0, "the settle class retires without waiting for another interaction");
  assert.equal(await stack.page.locator(".stack-board").getAttribute("data-stack-state"), "ready");
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="0"]');
  await stack.page.click("[data-reset-stack]");
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="1"]');
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="2"]');
  await stack.page.click('[data-peg="1"]');
  await stack.page.click('[data-peg="2"]');
  await stack.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await stack.page.evaluate(() => window.__house.active?.chapter), 1);
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="2"]');
  await stack.page.click("[data-reset-stack]");
  assert.equal(await stack.page.evaluate(() => window.__house.active?.chapter), 1, "reset preserves the higher authored chapter");
  assert.deepEqual(await stack.page.evaluate(() => window.__house.active?.pegs), [[3, 2, 1], [], []], "reset rebuilds only the current higher-chapter tower");
  await stack.context.close();

  const quietStack = await openHouse({ width: 414, height: 896 });
  await quietStack.page.emulateMedia({ reducedMotion: "reduce" });
  await quietStack.page.evaluate(() => window.__house.start("stack-architect"));
  await quietStack.page.click('[data-peg="0"]');
  assert.equal(await quietStack.page.locator('[data-peg="0"] .disc.is-lifted').evaluate((element) => getComputedStyle(element).transform), "none", "reduced motion preserves selection without lifting the disc");
  await quietStack.page.click('[data-peg="1"]');
  assert.equal(await quietStack.page.locator(".stack-move-trace").evaluate((element) => getComputedStyle(element).display), "none", "reduced motion removes the traverse presentation");
  assert.equal(await quietStack.page.locator('[data-peg="1"] .disc.is-placed').evaluate((element) => getComputedStyle(element).animationName), "none", "reduced motion removes the settle animation");
  assert.deepEqual(await quietStack.page.evaluate(() => window.__house.active?.pegs), [[2], [1], []], "reduced motion never changes the legal move result");
  await quietStack.context.close();

  const desktopStack = await openHouse({ width: 1_440, height: 900 });
  await desktopStack.page.evaluate(() => window.__house.start("stack-architect"));
  const desktopStackGeometry = await desktopStack.page.locator(".stack-board").evaluate((board) => {
    const box = board.getBoundingClientRect();
    return { top: box.top, width: box.width, pageWidth: document.documentElement.scrollWidth };
  });
  assert.ok(desktopStackGeometry.top < 900, "the crafted Stack board enters the first desktop viewport");
  assert.ok(desktopStackGeometry.width >= 720, "the desktop Stack board uses the wider cabinetmaker composition");
  assert.equal(desktopStackGeometry.pageWidth, 1_440, "the desktop Stack composition creates no horizontal overflow");
  await desktopStack.page.click('[data-peg="0"]');
  await desktopStack.page.click('[data-peg="1"]');
  assert.equal(await desktopStack.page.locator('.stack-move-trace[data-stack-from="0"][data-stack-to="1"]').count(), 1);
  await desktopStack.page.screenshot({ path: resolve(output, "stack-architect-1440x900.png"), fullPage: true, animations: "disabled" });
  await desktopStack.context.close();

  // Exploration, suspension, boundary and movement acceptance live in sector-sprint-feel.mjs.

  const keyboard = await openHouse({ width: 768, height: 1024 }, { reducedMotion: "reduce" });
  await keyboard.page.evaluate(() => document.querySelector("#houseMain")?.focus());
  await keyboardActivate(keyboard.page, '[data-category="pattern-line"]');
  await keyboardActivate(keyboard.page, '[data-game="pattern-court"]');
  await keyboardActivate(keyboard.page, '[data-pattern-piece="0"]');
  await keyboardActivate(keyboard.page, '.pattern-cell.is-open');
  for (let chapter = 0; chapter < 5; chapter += 1) {
    await solvePatternChapterKeyboard(keyboard.page, chapter);
    if (chapter < 4) await keyboard.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await keyboard.page.waitForSelector(".curtain-call");
  }
  await keyboard.page.waitForFunction(() => document.activeElement?.matches('[data-route="category"]'));
  await keyboardActivate(keyboard.page, '[data-route="category"]');
  await keyboardActivate(keyboard.page, '[data-route="home"]');
  await keyboardActivate(keyboard.page, '[data-category="memory-sequence"]');
  await keyboardActivate(keyboard.page, '[data-game="lantern-ledger"]');
  for (const [chapter, answer] of [0, 1, 0, 1, 2].entries()) {
    await keyboardActivate(keyboard.page, "[data-cover-memory]");
    await keyboard.page.waitForFunction(() => document.activeElement?.matches('[data-answer="0"]'));
    await keyboardActivate(keyboard.page, `[data-answer="${answer}"]`);
    if (chapter < 4) await keyboard.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await keyboard.page.waitForSelector(".curtain-call");
  }
  await keyboardActivate(keyboard.page, '[data-route="category"]');
  await keyboardActivate(keyboard.page, '[data-route="home"]');
  await keyboardActivate(keyboard.page, '[data-category="count-carry"]');
  await keyboardActivate(keyboard.page, '[data-game="stack-architect"]');
  await keyboard.page.waitForFunction(() => document.activeElement?.id === "houseMain");
  const keyboardMoves = hanoiMoves(2);
  for (const [moveIndex, [from, to]] of keyboardMoves.entries()) {
    assert.deepEqual(await keyboard.page.evaluate(() => ({ view: window.__house.view, gameId: window.__house.active?.gameId, pegCount: document.querySelectorAll("[data-peg]").length })), { view: "game", gameId: "stack-architect", pegCount: 3 }, `Stack keyboard move ${moveIndex + 1} remains on its rendered table`);
    await keyboardActivate(keyboard.page, `[data-peg="${from}"]`);
    await keyboard.page.waitForFunction((peg) => document.activeElement?.matches(`[data-peg="${peg}"]`), from);
    await keyboardActivate(keyboard.page, `[data-peg="${to}"]`);
    if (moveIndex < keyboardMoves.length - 1) {
      await keyboard.page.waitForFunction((peg) => document.activeElement?.matches(`[data-peg="${peg}"]`), to);
    }
  }
  await keyboard.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.match(await keyboard.page.locator('[data-peg="0"]').getAttribute("aria-label"), /Discs from bottom to top: 3, 2, 1\. Top disc: 1\./);
  await keyboard.context.close();

  const catalog = await openHouse({ width: 768, height: 1024 }, { reducedMotion: "reduce" });
  await completePatternGame(catalog.page);
  assert.equal(await catalog.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]?.mode), "entertainment");
  await catalog.page.click('[data-route="home"]');
  const definitions = [
    ["navakankari", [0, 1, 2, 0, 1], false],
    ["mirror-forge", [1, 0, 0, 0, 0], false],
    ["aadu-puli-attam", [0, 1, 2, 0, 1], false],
    ["pallanguzhi", [0, 1, 2, 0, 1], false],
    ["lantern-ledger", [0, 1, 0, 1, 2], true],
  ];
  for (const [gameId, answers, isMemory] of definitions) {
    await completeChoiceGame(catalog.page, gameId, answers, { memory: isMemory });
    assert.equal(await catalog.page.evaluate((id) => window.__house.memory.latestByGame[id]?.mode, gameId), "entertainment");
    await catalog.page.click('[data-route="home"]');
  }
  await completeStackGame(catalog.page);
  assert.equal(await catalog.page.evaluate(() => window.__house.memory.latestByGame["stack-architect"]?.completionFacts.authoredChapters), 5);
  await catalog.page.click('[data-route="home"]');
  await completeRunnerStory(catalog.page);
  assert.equal(await catalog.page.evaluate(() => window.__house.memory.latestByGame["sector-sprint"]?.completionFacts.finalChapter), "Paper in the plaza");
  await catalog.page.click('[data-route="gallery"]');
  assert.equal(await catalog.page.locator(".gallery-ledger article").filter({ hasText: "authored chapters completed" }).count(), 4);
  assert.equal(await catalog.page.locator(".gallery-ledger article").filter({ hasText: "authored studies completed" }).count(), 3);
  assert.equal(await catalog.page.locator(".gallery-ledger article").filter({ hasText: "authored Acts completed" }).count(), 1);
  const mirrorRun = await catalog.page.evaluate(() => window.__house.memory.latestByGame["mirror-forge"].runId);
  await completeChoiceGame(catalog.page, "mirror-forge", [1, 0, 0, 0, 0]);
  const replacement = await catalog.page.evaluate(() => ({
    keys: Object.keys(window.__house.memory.latestByGame),
    runId: window.__house.memory.latestByGame["mirror-forge"].runId,
  }));
  assert.equal(replacement.keys.length, 8);
  assert.notEqual(replacement.runId, mirrorRun);
  await catalog.page.click('[data-route="gallery"]');
  await catalog.page.click("[data-clear-gallery]");
  await catalog.page.keyboard.press("Escape");
  await catalog.page.waitForFunction(() => !document.querySelector("#galleryClearDialog")?.hasAttribute("open"));
  await catalog.page.waitForFunction(() => document.activeElement?.matches("[data-clear-gallery]"));
  assert.equal(await catalog.page.evaluate(() => document.activeElement?.matches("[data-clear-gallery]")), true, "Escape from Gallery clear restores the destructive-action invoker");
  assert.equal(await catalog.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 8, "Escape preserves every Gallery reading");
  await catalog.page.evaluate(() => {
    globalThis.__nativeHouseRemoveItem = Storage.prototype.removeItem;
    globalThis.__nativeHouseSetItem = Storage.prototype.setItem;
    Storage.prototype.removeItem = function removeItem(key) {
      if (key === "nindova:house:v1") throw new DOMException("Legacy removal denied by test fixture", "SecurityError");
      return globalThis.__nativeHouseRemoveItem.call(this, key);
    };
    Storage.prototype.setItem = function setItem(key, value) {
      if (key === "nindova:house:v2") throw new DOMException("Canonical write denied by test fixture", "QuotaExceededError");
      return globalThis.__nativeHouseSetItem.call(this, key, value);
    };
  });
  await catalog.page.click("[data-clear-gallery]");
  assert.equal(await catalog.page.locator("#galleryClearDialog").getAttribute("open"), "");
  assert.equal(await catalog.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 8, "opening confirmation preserves every reading");
  await catalog.page.click("#cancelGalleryClearButton");
  assert.equal(await catalog.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 8, "cancel preserves every reading");
  await catalog.page.click("[data-clear-gallery]");
  await catalog.page.click("#confirmGalleryClearButton");
  assert.equal(await catalog.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 8, "a partial storage failure retains the visible Gallery");
  assert.match(await catalog.page.locator(".gallery-status").innerText(), /could not be fully cleared/i);
  assert.equal(await catalog.page.evaluate(() => JSON.parse(localStorage.getItem("nindova:house:v2")).latestByGame["pattern-court"]?.mode), "entertainment", "compounded clear failure preserves the canonical v2 record");
  await catalog.page.reload();
  await catalog.page.waitForFunction(() => Object.keys(window.__house?.memory.latestByGame ?? {}).length === 8);
  assert.equal(await catalog.page.locator("[data-clear-gallery]").isVisible(), true, "preserved readings survive a reload after compounded clear failure");
  await catalog.page.click("[data-clear-gallery]");
  await catalog.page.click("#confirmGalleryClearButton");
  assert.equal(await catalog.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 0);
  assert.equal(await catalog.page.locator(".gallery-ledger article").filter({ hasText: "No completed reading is kept." }).count(), 8);
  assert.match(await catalog.page.locator(".gallery-status").innerText(), /Gallery cleared/i);
  assert.equal(await catalog.page.locator("[data-clear-gallery]").count(), 0, "an empty Gallery exposes no destructive action");
  await catalog.context.close();

  const provenance = await openHouse({ width: 375, height: 812 });
  await provenance.page.evaluate(() => {
    localStorage.setItem("nindova:house:v1", JSON.stringify({ schemaVersion: 1, latestByGame: {
      "mirror-forge": {
        schemaVersion: 1, mode: "entertainment", gameId: "pattern-court", gameVersion: "1.0.0",
        rulesetVersion: "entertainment-1", runId: "misfiled", completedAt: "2026-08-04T12:00:00.000Z",
        completionFacts: { authoredChapters: 5, finalChapter: "Court lattice" },
      },
    } }));
  });
  await provenance.page.reload();
  await provenance.page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await provenance.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 0);
  await provenance.context.close();

  const corrupt = await openHouse({ width: 375, height: 812 });
  await corrupt.page.evaluate(() => {
    sessionStorage.setItem("nindova:house:active:v1", JSON.stringify({
      gameId: "stack-architect", chapter: 1, runId: "corrupt-stack", memoryCovered: false,
      pegs: [[3, 1], [1], []], selectedPeg: null, resolving: false,
    }));
  });
  await corrupt.page.reload();
  await corrupt.page.waitForFunction(() => Boolean(window.__house));
  assert.deepEqual(await corrupt.page.evaluate(() => window.__house.active?.pegs), [[3, 2, 1], [], []]);
  await corrupt.context.close();

  const reduced = await openHouse({ width: 375, height: 812 }, { reducedMotion: "reduce" });
  assert.match(await reduced.page.locator(".game-door").first().evaluate((element) => getComputedStyle(element).transitionDuration), /0\.00001s|1e-05s|1e-08s|0s/);
  await reduced.page.evaluate(() => window.__house.start("pattern-court"));
  assert.equal(await reduced.page.locator(".pattern-cell").first().evaluate((element) => getComputedStyle(element).animationName), "none", "reduced motion removes decorative inlay movement");
  await reduced.page.evaluate(() => window.__house.start("sector-sprint"));
  assert.equal(await reduced.page.locator(".runner-story").isVisible(), true, "reduced motion starts with the complete narrated route");
  assert.equal(await reduced.page.locator("#runnerCanvas").count(), 0);
  await reduced.page.screenshot({ path: resolve(output, "sector-sprint-reduced-motion-narrated.png"), fullPage: true, animations: "disabled" });
  await reduced.context.close();

  const sound = await openHouse({ width: 375, height: 812 }, { reducedMotion: "reduce" }, { audioProbe: true });
  await sound.page.evaluate(() => window.__house.start("pattern-court"));
  await solvePatternChapter(sound.page, 0);
  await sound.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await sound.page.evaluate(() => globalThis.__houseAudioContexts), 0);
  await sound.page.click("#soundButton");
  assert.equal(await sound.page.locator("#soundButton").getAttribute("aria-pressed"), "true");
  assert.equal((await sound.page.locator("#soundButton").innerText()).trim(), "Sound on");
  await solvePatternChapter(sound.page, 1);
  await sound.page.waitForFunction(() => window.__house.active?.chapter === 2);
  assert.equal(await sound.page.evaluate(() => globalThis.__houseAudioContexts), 1);
  await sound.page.click("#soundButton");
  assert.equal(await sound.page.locator("#soundButton").getAttribute("aria-pressed"), "false");
  assert.equal((await sound.page.locator("#soundButton").innerText()).trim(), "Sound off");
  await sound.context.close();

  const deniedSound = await openHouse({ width: 375, height: 812 }, { reducedMotion: "reduce" }, { audioDenied: true });
  await deniedSound.page.click("#soundButton");
  await deniedSound.page.evaluate(() => window.__house.start("pattern-court"));
  await solvePatternChapter(deniedSound.page, 0);
  await deniedSound.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await deniedSound.page.evaluate(() => window.__house.active?.resolving), false, "denied audio cannot stall chapter progression");
  await deniedSound.context.close();

  const nightContext = await harness.context({ viewport: { width: 375, height: 812 } });
  const { page: night } = await harness.page(nightContext);
  const nightResponse = await night.goto(`http://127.0.0.1:${port}/play/`);
  assert.equal(nightResponse?.ok(), true, `Night response ${nightResponse?.status()}: ${(await night.locator("body").innerText()).slice(0, 200)}`);
  await night.waitForFunction(() => Boolean(window.__ct));
  assert.match(await night.locator("#intake").innerText(), /Adults 18\+/i);
  assert.equal(await night.evaluate(() => window.__ct.state), "intake");
  await night.close();

  const offline = await openHouse({ width: 375, height: 812 });
  await offline.page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await offline.page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cdp = await offline.context.newCDPSession(offline.page);
  await cdp.send("Network.enable");
  await cdp.send("Network.clearBrowserCache");
  await offline.page.close();
  await offline.context.setOffline(true);
  const { page: cold } = await harness.page(offline.context);
  const coldResponse = await cold.goto(`http://127.0.0.1:${port}/house/`);
  assert.equal(coldResponse?.ok(), true);
  await cold.waitForFunction(() => Boolean(window.__house));
  assert.equal(await cold.locator(".game-door").count(), 5);
  await offline.context.close();

  assert.deepEqual(externalRequests, []);
  assert.deepEqual(errors, []);
  console.log("Nindova House adult boundary, five category doors and all eight five-part games, runner controls/narration, keyboard/nonvisual play, replacement provenance, corrupt recovery, responsive layout, Night isolation, and cold-start offline shell passed.");
} finally {
  await harness.close();
}
