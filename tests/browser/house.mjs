import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

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
const server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs"), previewRoot], {
  cwd: root,
  env: { ...process.env, NINDOVA_PREVIEW_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
await new Promise((resolveReady, reject) => {
  const timer = setTimeout(() => reject(new Error("preview server did not start")), 5_000);
  server.once("error", reject);
  server.stdout.on("data", (chunk) => {
    if (chunk.toString().includes("Nindova preview")) {
      clearTimeout(timer);
      resolveReady();
    }
  });
});

const browser = await chromium.launch({ headless: true });
const errors = [];
const externalRequests = [];

async function openHouse(viewport, options = {}, {
  audioProbe = false,
  audioDenied = false,
  acceleratedRaf = false,
  manualRaf = false,
  fakeClock = false,
  controllableVisibility = false,
} = {}) {
  const context = await browser.newContext({ viewport, ...options });
  if (acceleratedRaf) {
    await context.addInitScript(() => {
      const nativeRequestAnimationFrame = globalThis.requestAnimationFrame.bind(globalThis);
      let authoredTimestamp = 0;
      Object.defineProperty(globalThis, "requestAnimationFrame", {
        configurable: true,
        value: (callback) => nativeRequestAnimationFrame(() => {
          authoredTimestamp += 800;
          callback(authoredTimestamp);
        }),
      });
    });
  }
  if (manualRaf) {
    await context.addInitScript(() => {
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
      globalThis.__advanceHouseTestFrames = (count) => {
        for (let frame = 0; frame < count; frame += 1) {
          const callbacks = [...queuedFrames.values()];
          queuedFrames.clear();
          authoredTimestamp += 800;
          callbacks.forEach((callback) => callback(authoredTimestamp));
        }
      };
    });
  }
  if (controllableVisibility) {
    await context.addInitScript(() => {
      let testHidden = false;
      Object.defineProperty(document, "hidden", { configurable: true, get: () => testHidden });
      globalThis.__setHouseTestHidden = (hidden) => {
        testHidden = hidden;
        document.dispatchEvent(new Event("visibilitychange"));
      };
    });
  }
  if (audioDenied) {
    await context.addInitScript(() => {
      class DeniedAudioContext { constructor() { throw new Error("audio unavailable in test"); } }
      Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: DeniedAudioContext });
    });
  } else if (audioProbe) {
    await context.addInitScript(() => {
      globalThis.__houseAudioContexts = 0;
      globalThis.__houseAudioCloses = 0;
      class ProbeAudioContext {
        constructor() { globalThis.__houseAudioContexts += 1; this.currentTime = 0; this.destination = {}; this.state = "running"; }
        createOscillator() { return { type: "sine", frequency: { value: 0 }, connect: (destination) => destination, start() {}, stop() { this.onended?.(); }, onended: null }; }
        createGain() { return { gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; } }; }
        close() { this.state = "closed"; globalThis.__houseAudioCloses += 1; return Promise.resolve(); }
      }
      Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: ProbeAudioContext });
    });
  }
  const page = await context.newPage();
  if (fakeClock) await page.clock.install();
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1") externalRequests.push(request.url());
  });
  const response = await page.goto(`http://127.0.0.1:${port}/house/`);
  assert.equal(response?.ok(), true);
  await page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await page.locator("#audienceDialog").getAttribute("open"), "");
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#audienceDialog").getAttribute("open"), "", "adult boundary requires an explicit choice");
  await page.click("#enterHouseButton");
  return { context, page };
}

async function completeChoiceGame(page, gameId, answers, { memory = false } = {}) {
  await page.locator(`[data-game="${gameId}"]`).first().click();
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

function hanoiMoves(discCount, from = 0, to = 2, spare = 1, moves = []) {
  if (discCount === 0) return moves;
  hanoiMoves(discCount - 1, from, spare, to, moves);
  moves.push([from, to]);
  hanoiMoves(discCount - 1, spare, to, from, moves);
  return moves;
}

async function completeStackGame(page) {
  await page.locator('[data-game="stack-architect"]').first().click();
  for (let chapter = 0; chapter < 5; chapter += 1) {
    for (const [from, to] of hanoiMoves(chapter + 2)) {
      await page.click(`[data-peg="${from}"]`);
      await page.click(`[data-peg="${to}"]`);
    }
    if (chapter < 4) await page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await page.waitForSelector(".curtain-call");
  }
}

async function completeRunnerStory(page) {
  await page.locator('[data-game="sector-sprint"]').first().click();
  const narratedRoute = page.locator("[data-runner-story]");
  if (await narratedRoute.count()) await narratedRoute.click();
  await page.click("[data-runner-pause]");
  assert.equal(await page.locator("[data-runner-pause]").getAttribute("aria-pressed"), "true");
  assert.equal(await page.locator("[data-story-advance]").isEnabled(), true, "Pause holds boundary time without blocking narrated completion");
  for (let act = 0; act < 5; act += 1) {
    assert.equal(await page.evaluate(() => window.__house.active?.storyBeat), 0);
    for (let beat = 0; beat < 3; beat += 1) {
      await page.click("[data-story-advance]");
      if (beat < 2) {
        await page.waitForFunction((next) => window.__house.active?.storyBeat === next, beat + 1);
      } else if (act < 4) {
        await page.waitForFunction((next) => window.__house.active?.chapter === next && window.__house.active?.storyBeat === 0, act + 1);
        assert.equal(await page.locator("[data-runner-pause]").getAttribute("aria-pressed"), "true", "narrated Pause persists between Acts");
      } else {
        await page.waitForSelector(".curtain-call");
      }
    }
  }
}

async function keyboardActivate(page, selector) {
  await page.waitForSelector(selector, { state: "visible" });
  for (let attempt = 0; attempt < 120; attempt += 1) {
    if (await page.evaluate((candidate) => document.activeElement?.matches(candidate), selector)) {
      await page.keyboard.press("Enter");
      return;
    }
    await page.keyboard.press("Tab");
  }
  throw new Error(`Keyboard could not reach ${selector}`);
}

try {
  const boundaryContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const boundaryPage = await boundaryContext.newPage();
  await boundaryPage.goto(`http://127.0.0.1:${port}/house/`);
  await boundaryPage.waitForFunction(() => Boolean(window.__house));
  await boundaryPage.locator(".quiet-link").click();
  await boundaryPage.waitForURL(`http://127.0.0.1:${port}/`);
  assert.equal(await boundaryPage.evaluate(() => localStorage.getItem("nindova:house:adult-audience:v1")), null, "leaving does not acknowledge the adult boundary");
  await boundaryContext.close();

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

  const narrow = await openHouse({ width: 320, height: 568 }, { reducedMotion: "reduce" });
  await narrow.page.click('[data-game="lantern-ledger"]');
  for (const [chapter, answer] of [0, 1, 0, 1].entries()) {
    await narrow.page.click("[data-cover-memory]");
    await narrow.page.click(`[data-answer="${answer}"]`);
    await narrow.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
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
  await narrow.page.click('[data-game="stack-architect"]');
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

  const pattern = await openHouse({ width: 375, height: 812 });
  await pattern.page.click('[data-game="pattern-court"]');
  assert.equal(await pattern.page.evaluate(() => window.__house.active?.chapter), 0);
  await pattern.page.screenshot({ path: resolve(output, "pattern-court-375x812.png"), fullPage: true, animations: "disabled" });
  await pattern.page.click('[data-answer="1"]');
  assert.match(await pattern.page.locator("#gameStatus").innerText(), /Not this inscription/);
  for (const answer of [0, 1, 2, 1, 2]) {
    await pattern.page.evaluate((choice) => window.__house.answer(choice), answer);
    assert.equal(await pattern.page.locator("#celebration").isVisible(), true);
    if (answer === 0) await pattern.page.screenshot({ path: resolve(output, "pattern-celebration-375x812.png"), fullPage: true });
    if (answer !== 2 || await pattern.page.evaluate(() => window.__house.active?.chapter) !== 4) {
      await pattern.page.waitForTimeout(760);
    }
  }
  await pattern.page.waitForSelector(".curtain-call");
  await pattern.page.screenshot({ path: resolve(output, "pattern-curtain-call-375x812.png"), fullPage: true, animations: "disabled" });
  const patternResult = await pattern.page.evaluate(() => window.__house.memory.latestByGame["pattern-court"]);
  assert.equal(patternResult.mode, "entertainment");
  assert.equal(patternResult.rulesetVersion, "entertainment-1");
  assert.equal(patternResult.completionFacts.authoredChapters, 5);
  await pattern.context.close();

  const memory = await openHouse({ width: 768, height: 1024 });
  await memory.page.click('[data-game="lantern-ledger"]');
  assert.equal(await memory.page.locator(".answer-list button").first().isDisabled(), true);
  await memory.page.click("[data-cover-memory]");
  assert.equal(await memory.page.locator(".answer-list button").first().isEnabled(), true);
  await memory.page.reload();
  await memory.page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await memory.page.evaluate(() => window.__house.active?.gameId), "lantern-ledger");
  assert.equal(await memory.page.evaluate(() => window.__house.active?.memoryCovered), true);
  await memory.context.close();

  const stack = await openHouse({ width: 414, height: 896 });
  await stack.page.click('[data-game="stack-architect"]');
  await stack.page.screenshot({ path: resolve(output, "stack-architect-414x896.png"), fullPage: true, animations: "disabled" });
  const renderedDiscs = await stack.page.locator('[data-peg="0"] .disc').evaluateAll((discs) => discs.map((disc) => {
    const box = disc.getBoundingClientRect();
    return { disc: Number(disc.getAttribute("data-disc")), top: box.top, width: box.width };
  }));
  assert.deepEqual(renderedDiscs.map((disc) => disc.disc), [1, 2]);
  assert.ok(renderedDiscs[0].top < renderedDiscs[1].top, "top disc renders above the bottom disc");
  assert.ok(renderedDiscs[0].width < renderedDiscs[1].width, "top disc renders narrower than the bottom disc");
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="1"]');
  assert.deepEqual(await stack.page.evaluate(() => window.__house.active?.pegs), [[2], [1], []]);
  await stack.page.click('[data-peg="0"]');
  await stack.page.click('[data-peg="2"]');
  await stack.page.click('[data-peg="1"]');
  await stack.page.click('[data-peg="2"]');
  await stack.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await stack.page.evaluate(() => window.__house.active?.chapter), 1);
  await stack.context.close();

  const runner = await openHouse({ width: 375, height: 812 });
  await runner.page.click('[data-game="sector-sprint"]');
  await runner.page.waitForSelector("#runnerCanvas");
  assert.deepEqual(await runner.page.locator("#runnerCanvas").evaluate((canvas) => ({
    width: canvas.width,
    height: canvas.height,
    ratio: canvas.dataset.pixelRatio,
    logicalWidth: canvas.dataset.logicalWidth,
    logicalHeight: canvas.dataset.logicalHeight,
  })), { width: 960, height: 432, ratio: "1", logicalWidth: "960", logicalHeight: "432" });
  assert.ok((await runner.page.locator(".runner-stage-frame").boundingBox())?.y < 812, "the moving miniature enters the first phone viewport");
  assert.deepEqual(await runner.page.evaluate(() => {
    const saved = JSON.parse(sessionStorage.getItem("nindova:house:active:v1") ?? "{}");
    return { keys: Object.keys(saved).sort(), value: saved };
  }), {
    keys: ["chapter", "gameId", "runId", "storyBeat"],
    value: {
      gameId: "sector-sprint",
      chapter: 0,
      runId: await runner.page.evaluate(() => window.__house.active?.runId),
      storyBeat: null,
    },
  });
  for (const control of await runner.page.locator(".runner-controls button").all()) {
    const box = await control.boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44, "runner controls remain operable by touch");
  }
  await runner.page.screenshot({ path: resolve(output, "sector-sprint-375x812.png"), fullPage: true, animations: "disabled" });
  await runner.page.click('[data-runner-action="tool"]');
  await runner.page.waitForFunction(() => /Message delivered|number 12 has left/i.test(document.querySelector("#runnerLive")?.textContent ?? ""), null, { timeout: 4_000 });
  await runner.page.evaluate(() => document.querySelector("#houseMain")?.focus());
  await runner.page.keyboard.press("Space");
  await runner.page.waitForFunction(() => /leap|air step/i.test(document.querySelector("#runnerLive")?.textContent ?? ""));
  await runner.page.click("[data-runner-pause]");
  assert.equal(await runner.page.locator("[data-runner-pause]").getAttribute("aria-pressed"), "true");
  const pausedFrame = await runner.page.locator("#runnerCanvas").evaluate((canvas) => canvas.toDataURL());
  const pausedMessage = await runner.page.locator("#runnerLive").innerText();
  await runner.page.locator('[data-runner-action="jump"]').dispatchEvent("pointerdown", { pointerId: 7 });
  await runner.page.locator("body").dispatchEvent("pointercancel", { pointerId: 7 });
  await runner.page.waitForTimeout(250);
  assert.equal(await runner.page.locator('[data-runner-action="jump"]').getAttribute("data-pressed"), null, "a cancelled pointer leaves no stuck pressed state");
  assert.equal(await runner.page.locator("#runnerLive").innerText(), pausedMessage, "a cancelled pointer does not activate the control");
  assert.equal(await runner.page.locator("#runnerCanvas").evaluate((canvas) => canvas.toDataURL()), pausedFrame, "the paused city remains still");
  await runner.page.click("[data-runner-pause]");
  await runner.page.waitForTimeout(250);
  assert.notEqual(await runner.page.locator("#runnerCanvas").evaluate((canvas) => canvas.toDataURL()), pausedFrame, "the city resumes from the paused scene");
  await runner.page.waitForFunction(() => /security deposit|Chandigarh splash/i.test(document.querySelector("#runnerLive")?.textContent ?? ""), null, { timeout: 9_000 });
  assert.equal(await runner.page.evaluate(() => window.__house.active?.chapter), 0, "a comic collision never resets or loses the Act");
  await runner.context.close();

  for (const viewport of [{ width: 320, height: 568 }, { width: 1280, height: 800 }]) {
    const runnerVisual = await openHouse(viewport);
    await runnerVisual.page.click('[data-game="sector-sprint"]');
    assert.equal(await runnerVisual.page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    assert.equal(await runnerVisual.page.locator("#runnerCanvas").isVisible(), true);
    assert.ok(Number.parseFloat(await runnerVisual.page.locator("#runnerApproach strong").evaluate((element) => getComputedStyle(element).fontSize)) >= 18);
    await runnerVisual.page.screenshot({ path: resolve(output, `sector-sprint-${viewport.width}x${viewport.height}.png`), fullPage: true, animations: "disabled" });
    await runnerVisual.context.close();
  }

  const sharpRunner = await openHouse({ width: 414, height: 896 }, { deviceScaleFactor: 3 });
  await sharpRunner.page.click('[data-game="sector-sprint"]');
  assert.deepEqual(await sharpRunner.page.locator("#runnerCanvas").evaluate((canvas) => ({
    width: canvas.width,
    height: canvas.height,
    ratio: canvas.dataset.pixelRatio,
  })), { width: 1_920, height: 864, ratio: "2" }, "the Canvas honors high-density displays with a bounded DPR");
  const sharpChapter = await sharpRunner.page.evaluate(() => window.__house.active?.chapter);
  await sharpRunner.page.setViewportSize({ width: 768, height: 1_024 });
  assert.equal(await sharpRunner.page.evaluate(() => window.__house.active?.chapter), sharpChapter, "a resize redraw cannot change the authored Act");
  await sharpRunner.page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  assert.equal(await sharpRunner.page.evaluate(() => document.documentElement.scrollWidth), 768, "200% text scaling preserves horizontal reflow");
  await sharpRunner.context.close();

  const visualActs = await openHouse({ width: 375, height: 812 }, {}, { manualRaf: true });
  await visualActs.page.click('[data-game="sector-sprint"]');
  for (let act = 0; act < 5; act += 1) {
    await visualActs.page.waitForFunction((expected) => window.__house.active?.chapter === expected && !window.__house.active?.resolving, act, { polling: 50, timeout: 8_000 });
    await visualActs.page.locator("#celebration").waitFor({ state: "hidden" });
    assert.deepEqual(await visualActs.page.evaluate(() => {
      const frame = document.querySelector(".runner-stage-frame")?.getBoundingClientRect();
      const approach = document.querySelector("#runnerApproach")?.getBoundingClientRect();
      const live = document.querySelector("#runnerLive")?.getBoundingClientRect();
      const controls = document.querySelector(".runner-controls")?.getBoundingClientRect();
      const copy = document.querySelector(".runner-copy-deck")?.getBoundingClientRect();
      const shell = document.querySelector(".runner-shell")?.getBoundingClientRect();
      const visibleText = [...document.querySelectorAll(
        ".runner-stage-frame figcaption span, #runnerApproach span, #runnerApproach strong, #runnerLive, .runner-controls button span, .runner-controls button small, .runner-copy-deck p",
      )];
      return {
        stageBeforeStatus: Boolean(frame && approach && frame.bottom <= approach.top),
        approachBeforeLive: Boolean(approach && live && approach.bottom <= live.top),
        statusBeforeControls: Boolean(live && controls && live.bottom <= controls.top),
        controlsBeforeCopy: Boolean(controls && copy && controls.bottom <= copy.top),
        copyInsideShell: Boolean(copy && shell && copy.bottom <= shell.bottom + 1),
        visibleTextFits: visibleText.every((label) => label.scrollWidth <= label.clientWidth + 1),
      };
    }), {
      stageBeforeStatus: true,
      approachBeforeLive: true,
      statusBeforeControls: true,
      controlsBeforeCopy: true,
      copyInsideShell: true,
      visibleTextFits: true,
    }, `Act ${act + 1} keeps an intact stage, status deck, control bar, helper labels, caption, and copy`);
    await visualActs.page.locator(".runner-shell").screenshot({ path: resolve(output, `sector-sprint-act-${act + 1}-375x812.png`), animations: "disabled" });
    await visualActs.page.evaluate(() => globalThis.__advanceHouseTestFrames(44));
  }
  await visualActs.page.waitForSelector(".curtain-call", { timeout: 12_000 });
  await visualActs.context.close();

  const autoRunner = await openHouse(
    { width: 414, height: 896 },
    {},
    { acceleratedRaf: true, controllableVisibility: true },
  );
  await autoRunner.page.click('[data-game="sector-sprint"]');
  await autoRunner.page.evaluate(() => globalThis.__setHouseTestHidden(true));
  await autoRunner.page.waitForTimeout(1_200);
  assert.equal(await autoRunner.page.evaluate(() => window.__house.active?.chapter), 0, "hidden time cannot complete an Act");
  await autoRunner.page.evaluate(() => globalThis.__setHouseTestHidden(false));
  await autoRunner.page.waitForFunction(() => window.__house.active?.chapter === 0 && window.__house.active?.resolving, null, { timeout: 5_000 });
  await autoRunner.page.evaluate(() => globalThis.__setHouseTestHidden(true));
  await autoRunner.page.waitForTimeout(1_000);
  assert.deepEqual(await autoRunner.page.evaluate(() => ({ chapter: window.__house.active?.chapter, resolving: window.__house.active?.resolving })), { chapter: 0, resolving: true }, "hidden time cannot consume the inter-Act transition");
  await autoRunner.page.evaluate(() => globalThis.__setHouseTestHidden(false));
  await autoRunner.page.waitForFunction(() => window.__house.active?.chapter === 1 && !window.__house.active?.resolving, null, { timeout: 5_000 });
  await autoRunner.page.waitForFunction(() => window.__house.active?.chapter === 1 && window.__house.active?.resolving, null, { timeout: 5_000 });
  await autoRunner.page.locator("[data-runner-pause]").evaluate((button) => button.click());
  await autoRunner.page.waitForTimeout(1_000);
  assert.deepEqual(await autoRunner.page.evaluate(() => ({ chapter: window.__house.active?.chapter, resolving: window.__house.active?.resolving })), { chapter: 1, resolving: true }, "Pause holds a committed inter-Act transition");
  await autoRunner.page.locator("[data-runner-pause]").evaluate((button) => button.click());
  await autoRunner.page.waitForFunction(() => window.__house.active?.chapter === 2 && !window.__house.active?.resolving, null, { timeout: 5_000 });
  await autoRunner.page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await autoRunner.page.waitForTimeout(1_200);
  assert.equal(await autoRunner.page.evaluate(() => window.__house.active?.chapter), 2, "blurred time cannot complete an Act");
  await autoRunner.page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await autoRunner.page.waitForFunction(() => window.__house.active?.chapter === 3 && !window.__house.active?.resolving, null, { timeout: 8_000 });
  await autoRunner.page.locator("[data-runner-pause]").evaluate((button) => button.click());
  await autoRunner.page.locator("#celebration").waitFor({ state: "hidden" });
  await autoRunner.page.screenshot({ path: resolve(output, "sector-sprint-monsoon-414x896.png"), fullPage: true, animations: "disabled" });
  await autoRunner.page.locator("[data-runner-pause]").evaluate((button) => button.click());
  await autoRunner.page.waitForSelector(".curtain-call", { timeout: 15_000 });
  assert.equal(await autoRunner.page.evaluate(() => window.__house.memory.latestByGame["sector-sprint"]?.completionFacts.finalChapter), "Roti Relay", "the production action route advances and closes through all five Acts");
  await autoRunner.context.close();

  const reloadedBoundary = await openHouse({ width: 375, height: 812 }, {}, { fakeClock: true });
  await reloadedBoundary.page.click('[data-game="sector-sprint"]');
  await reloadedBoundary.page.click("[data-runner-story]");
  await reloadedBoundary.page.clock.fastForward(239_000);
  assert.equal(await reloadedBoundary.page.evaluate(() => window.__house.active?.gameId), "sector-sprint");
  await reloadedBoundary.page.reload();
  await reloadedBoundary.page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await reloadedBoundary.page.evaluate(() => window.__house.active), null, "reload cannot reset and extend the runner boundary");
  assert.equal(await reloadedBoundary.page.evaluate(() => sessionStorage.getItem("nindova:house:active:v1")), null);
  assert.equal(await reloadedBoundary.page.evaluate(() => window.__house.memory.latestByGame["sector-sprint"]), undefined);
  assert.match(await reloadedBoundary.page.locator(".runner-restore-note").innerText(), /closed on reload/i);
  await reloadedBoundary.context.close();

  const boundedStory = await openHouse({ width: 375, height: 812 }, {}, { fakeClock: true });
  await boundedStory.page.click('[data-game="sector-sprint"]');
  await boundedStory.page.click("[data-runner-story]");
  await boundedStory.page.clock.fastForward(240_000);
  await boundedStory.page.waitForSelector(".curtain-call");
  assert.match(await boundedStory.page.locator(".curtain-call").innerText(), /No completion reading was recorded/i);
  assert.equal(await boundedStory.page.evaluate(() => window.__house.memory.latestByGame["sector-sprint"]), undefined, "the absolute boundary cannot create a false five-Act result");
  assert.equal(await boundedStory.page.evaluate(() => sessionStorage.getItem("nindova:house:active:v1")), null);
  await boundedStory.page.reload();
  await boundedStory.page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await boundedStory.page.evaluate(() => window.__house.active), null, "a boundary exit cannot revive as a completed or active route after reload");
  assert.equal(await boundedStory.page.evaluate(() => window.__house.memory.latestByGame["sector-sprint"]), undefined);
  await boundedStory.context.close();

  const keyboard = await openHouse({ width: 768, height: 1024 }, { reducedMotion: "reduce" });
  await keyboard.page.evaluate(() => document.querySelector("#houseMain")?.focus());
  await keyboardActivate(keyboard.page, '[data-game="pattern-court"]');
  await keyboardActivate(keyboard.page, '[data-answer="1"]');
  await keyboard.page.waitForFunction(() => document.activeElement?.matches('[data-answer="1"]'));
  for (const [chapter, answer] of [0, 1, 2, 1, 2].entries()) {
    await keyboardActivate(keyboard.page, `[data-answer="${answer}"]`);
    if (chapter < 4) await keyboard.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await keyboard.page.waitForSelector(".curtain-call");
  }
  await keyboard.page.waitForFunction(() => document.activeElement?.matches('[data-route="home"]'));
  await keyboardActivate(keyboard.page, '[data-route="home"]');
  await keyboardActivate(keyboard.page, '[data-game="lantern-ledger"]');
  for (const [chapter, answer] of [0, 1, 0, 1, 2].entries()) {
    await keyboardActivate(keyboard.page, "[data-cover-memory]");
    await keyboard.page.waitForFunction(() => document.activeElement?.matches('[data-answer="0"]'));
    await keyboardActivate(keyboard.page, `[data-answer="${answer}"]`);
    if (chapter < 4) await keyboard.page.waitForFunction((next) => window.__house.active?.chapter === next, chapter + 1);
    else await keyboard.page.waitForSelector(".curtain-call");
  }
  await keyboardActivate(keyboard.page, '[data-route="home"]');
  await keyboardActivate(keyboard.page, '[data-game="stack-architect"]');
  await keyboard.page.waitForFunction(() => document.activeElement?.id === "houseMain");
  const keyboardMoves = hanoiMoves(2);
  for (const [moveIndex, [from, to]] of keyboardMoves.entries()) {
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
  const definitions = [
    ["pattern-court", [0, 1, 2, 1, 2], false],
    ["mirror-forge", [1, 0, 0, 0, 0], false],
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
  assert.equal(await catalog.page.evaluate(() => window.__house.memory.latestByGame["sector-sprint"]?.completionFacts.finalChapter), "Roti Relay");
  await catalog.page.click('[data-route="gallery"]');
  assert.equal(await catalog.page.locator(".gallery-ledger article").filter({ hasText: "authored chapters completed" }).count(), 5);
  const mirrorRun = await catalog.page.evaluate(() => window.__house.memory.latestByGame["mirror-forge"].runId);
  await completeChoiceGame(catalog.page, "mirror-forge", [1, 0, 0, 0, 0]);
  const replacement = await catalog.page.evaluate(() => ({
    keys: Object.keys(window.__house.memory.latestByGame),
    runId: window.__house.memory.latestByGame["mirror-forge"].runId,
  }));
  assert.equal(replacement.keys.length, 5);
  assert.notEqual(replacement.runId, mirrorRun);
  await catalog.page.click('[data-route="gallery"]');
  await catalog.page.click("[data-clear-gallery]");
  assert.equal(await catalog.page.evaluate(() => Object.keys(window.__house.memory.latestByGame).length), 0);
  assert.equal(await catalog.page.locator(".gallery-ledger article").filter({ hasText: "No completed reading is kept." }).count(), 5);
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
  await reduced.page.click('[data-game="sector-sprint"]');
  assert.equal(await reduced.page.locator(".runner-story").isVisible(), true, "reduced motion starts with the complete narrated route");
  assert.equal(await reduced.page.locator("#runnerCanvas").count(), 0);
  await reduced.context.close();

  const restoredReduced = await openHouse({ width: 375, height: 812 });
  await restoredReduced.page.click('[data-game="sector-sprint"]');
  await restoredReduced.page.emulateMedia({ reducedMotion: "reduce" });
  await restoredReduced.page.waitForSelector(".runner-story");
  await restoredReduced.page.evaluate(() => {
    const saved = JSON.parse(sessionStorage.getItem("nindova:house:active:v1"));
    saved.storyBeat = null;
    sessionStorage.setItem("nindova:house:active:v1", JSON.stringify(saved));
  });
  await restoredReduced.page.reload();
  await restoredReduced.page.waitForFunction(() => Boolean(window.__house));
  assert.equal(await restoredReduced.page.evaluate(() => window.__house.active), null, "a restored action route fails closed when reduced motion is now preferred");
  assert.equal(await restoredReduced.page.locator("#runnerCanvas").count(), 0);
  assert.equal(await restoredReduced.page.locator(".runner-restore-note").isVisible(), true);
  await restoredReduced.context.close();

  const activeRunnerSound = await openHouse({ width: 375, height: 812 }, {}, { audioProbe: true });
  await activeRunnerSound.page.click("#soundButton");
  await activeRunnerSound.page.click('[data-game="sector-sprint"]');
  await activeRunnerSound.page.click('[data-runner-action="jump"]');
  await activeRunnerSound.page.waitForFunction(() => globalThis.__houseAudioContexts === 1);
  await activeRunnerSound.page.click("[data-runner-pause]");
  await activeRunnerSound.page.waitForFunction(() => globalThis.__houseAudioCloses === 1);
  await activeRunnerSound.page.click("[data-runner-pause]");
  await activeRunnerSound.page.waitForTimeout(250);
  assert.equal(await activeRunnerSound.page.evaluate(() => globalThis.__houseAudioContexts), 1, "resume never queues or invents a sound");
  await activeRunnerSound.context.close();

  const pausedRunnerSound = await openHouse({ width: 375, height: 812 }, { reducedMotion: "reduce" }, { audioProbe: true });
  await pausedRunnerSound.page.click("#soundButton");
  await pausedRunnerSound.page.click('[data-game="sector-sprint"]');
  await pausedRunnerSound.page.click("[data-runner-pause]");
  for (let beat = 0; beat < 3; beat += 1) await pausedRunnerSound.page.click("[data-story-advance]");
  await pausedRunnerSound.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await pausedRunnerSound.page.evaluate(() => globalThis.__houseAudioContexts), 0, "paused narration never plays an optional chime");
  await pausedRunnerSound.context.close();

  const sound = await openHouse({ width: 375, height: 812 }, { reducedMotion: "reduce" }, { audioProbe: true });
  await sound.page.click('[data-game="pattern-court"]');
  await sound.page.click('[data-answer="0"]');
  await sound.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await sound.page.evaluate(() => globalThis.__houseAudioContexts), 0);
  await sound.page.click("#soundButton");
  assert.equal(await sound.page.locator("#soundButton").getAttribute("aria-pressed"), "true");
  assert.equal((await sound.page.locator("#soundButton").innerText()).trim(), "Sound on");
  await sound.page.click('[data-answer="1"]');
  await sound.page.waitForFunction(() => window.__house.active?.chapter === 2);
  assert.equal(await sound.page.evaluate(() => globalThis.__houseAudioContexts), 1);
  await sound.page.click("#soundButton");
  assert.equal(await sound.page.locator("#soundButton").getAttribute("aria-pressed"), "false");
  assert.equal((await sound.page.locator("#soundButton").innerText()).trim(), "Sound off");
  await sound.context.close();

  const deniedSound = await openHouse({ width: 375, height: 812 }, { reducedMotion: "reduce" }, { audioDenied: true });
  await deniedSound.page.click("#soundButton");
  await deniedSound.page.click('[data-game="pattern-court"]');
  await deniedSound.page.click('[data-answer="0"]');
  await deniedSound.page.waitForFunction(() => window.__house.active?.chapter === 1);
  assert.equal(await deniedSound.page.evaluate(() => window.__house.active?.resolving), false, "denied audio cannot stall chapter progression");
  await deniedSound.context.close();

  const night = await browser.newPage({ viewport: { width: 375, height: 812 } });
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
  const cold = await offline.context.newPage();
  cold.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  cold.on("pageerror", (error) => errors.push(error.message));
  const coldResponse = await cold.goto(`http://127.0.0.1:${port}/house/`);
  assert.equal(coldResponse?.ok(), true);
  await cold.waitForFunction(() => Boolean(window.__house));
  assert.equal(await cold.locator(".game-door").count(), 5);
  await offline.context.close();

  assert.deepEqual(externalRequests, []);
  assert.deepEqual(errors, []);
  console.log("Nindova House adult boundary, all five five-chapter games, runner controls/narration, keyboard/nonvisual play, replacement provenance, corrupt recovery, responsive layout, Night isolation, and cold-start offline shell passed.");
} finally {
  await browser.close();
  server.kill("SIGTERM");
  await rm(previewRoot, { recursive: true, force: true });
}
