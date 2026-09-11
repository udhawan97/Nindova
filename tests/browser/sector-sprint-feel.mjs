import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";
const root = resolve(import.meta.dirname, "../.."),
  output = resolve(root, "artifacts/chandigarh-redesign");
await mkdir(output, { recursive: true });
const harness = await createBrowserEvidenceHarness({
  root,
  previewRoot: resolve(root, "dist"),
  port: 4199,
  launchOptions: { headless: true },
});
const external = [];
const results = [];
async function open(viewport, { narrated = false, clock = false } = {}) {
  const context = await harness.context({
    viewport,
    reducedMotion: narrated ? "reduce" : "no-preference",
  });
  await context.addInitScript(() =>
    localStorage.setItem("nindova:house:adult-audience:v1", "acknowledged"),
  );
  const { page } = await harness.page(context);
  page.on("request", (r) => {
    if (
      !r.url().startsWith("http://127.0.0.1:4199") &&
      !r.url().startsWith("data:")
    )
      external.push(r.url());
  });
  if (clock) await page.clock.install();
  await page.goto("http://127.0.0.1:4199/house/#game/sector-sprint");
  await page.waitForFunction(() => Boolean(window.__house));
  if (!narrated) await page.click('[data-runner-route="action"]');
  if (narrated) {
    await page.click('[data-encounter-choice="0"]');
    await page.click("[data-dialog-close]");
  }
  return { context, page };
}
async function talk(page, id) {
  await page.click(`[data-visit="${id}"]`);
  await page.click('[data-encounter-choice="1"]');
  await page.click("[data-dialog-close]");
}
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 375, height: 812 },
    { width: 320, height: 568 },
  ]) {
    const { context, page } = await open(viewport);
    await page.waitForFunction(
      () =>
        document.querySelector("#runnerCanvas")?.dataset.art ===
          "illustrated" &&
        document.querySelector("#runnerCanvas")?.dataset.character === "atlas",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth),
      viewport.width,
    );
    const edgePixel = await page.locator("#runnerCanvas").evaluate(canvas =>
      [...canvas.getContext("2d").getImageData(canvas.width - 20, Math.floor(canvas.height / 2), 1, 1).data],
    );
    assert.ok(edgePixel[0] + edgePixel[1] + edgePixel[2] > 0, "the city fills the wide canvas instead of leaving an unpainted strip");
    const idle = await page.evaluate(() => window.__house.runner);
    await page.waitForTimeout(250);
    assert.equal(await page.evaluate(() => window.__house.runner.x), idle.x);
    assert.equal(
      await page.evaluate(() => window.__house.runner.walking),
      false,
    );
    await page.locator("#runnerCanvas").focus();
    await page.keyboard.down("ArrowRight");
    await page.waitForTimeout(200);
    await page.keyboard.up("ArrowRight");
    await page.waitForTimeout(50);
    const stopped = await page.evaluate(() => window.__house.runner);
    assert.ok(stopped.x > idle.x);
    assert.equal(stopped.walking, false);
    await page.waitForTimeout(150);
    assert.equal(await page.evaluate(() => window.__house.runner.x), stopped.x);
    await page.screenshot({
      path: resolve(output, `world-${viewport.width}.png`),
      fullPage: true,
    });
    const box = await page.locator('[data-walk="ArrowLeft"]').boundingBox();
    assert.ok(box.width >= 44 && box.height >= 44);
    await page.locator('[data-walk="ArrowLeft"]').dispatchEvent("pointerdown", {
      pointerId: 13,
      pointerType: "touch",
      bubbles: true,
    });
    await page.waitForTimeout(150);
    await page
      .locator('[data-walk="ArrowLeft"]')
      .dispatchEvent("pointercancel", {
        pointerId: 13,
        pointerType: "touch",
        bubbles: true,
      });
    await page.waitForTimeout(50);
    assert.equal(
      await page.evaluate(() => window.__house.runner.walking),
      false,
    );
    // Rebuilding the canvas for overlays must preserve the active power label.
    const powerLabel = await page.locator("[data-power-name]").innerText();
    await page.click("[data-map]");
    assert.equal(await page.locator("[data-power-name]").innerText(), powerLabel);
    await page.click("[data-close-panel]");
    await page.click(".journey-controls [data-runner-pause]");
    assert.equal(await page.locator("[data-power-name]").innerText(), powerLabel);
    await page.click(".journey-controls [data-runner-pause]");
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.locator("#runnerCanvas").focus();
    const startPosition = await page.evaluate(() => ({
      x: window.__house.runner.x,
      y: window.__house.runner.y,
    }));
    await page.keyboard.press("Shift+Tab");
    await page.waitForTimeout(100);
    assert.deepEqual(
      await page.evaluate(() => ({
        x: window.__house.runner.x,
        y: window.__house.runner.y,
      })),
      startPosition,
    );
    assert.equal(await page.evaluate(() => window.__house.runner.dashMs), 0);
    const frameSamples = [];
    const sampleP95 = [];
    for (let run = 0; run < 3; run++) {
      await page.locator("#runnerCanvas").focus();
      const direction = run % 2 === 0 ? "ArrowRight" : "ArrowLeft";
      await page.keyboard.down(direction);
      await page.keyboard.press("Space");
      await page.keyboard.press("k");
      const intervals = await page.evaluate(
        () => new Promise((resolve) => {
          const times = [];
          let last = 0;
          const sample = (t) => {
            if (last) times.push(t - last);
            last = t;
            if (times.length < 120) requestAnimationFrame(sample);
            else resolve(times);
          };
          requestAnimationFrame(sample);
        }),
      );
      await page.keyboard.up(direction);
      frameSamples.push(intervals);
      const sorted = [...intervals].sort((a, b) => a - b);
      sampleP95.push(sorted[Math.ceil(sorted.length * 0.95) - 1]);
    }
    assert.equal(await page.locator("#runnerCanvas").getAttribute("data-character"), "atlas");
    const p95 = [...sampleP95].sort((a, b) => a - b)[1];
    results.push({
      viewport,
      p95,
      sampleP95,
      worstSampleP95: Math.max(...sampleP95),
      frameSamples,
      activity: "three active movement/jump/dash samples, character atlas loaded",
      quality: await page.locator("#runnerCanvas").getAttribute("data-quality"),
    });
    await writeFile(resolve(output, "performance.json"), JSON.stringify(results, null, 2));
    assert.ok(p95 < 35, `4x CPU median sampled p95 ${p95}ms at ${viewport.width}; samples ${sampleP95.join(", ")}`);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
    if (viewport.width === 1440) {
      // Play every course with real movement and jump input; no state teleports or item injection.
      for (const id of ["craft", "roses", "market"]) {
        for (let ribbon = 0; ribbon < 3; ribbon++) {
          await page.click("[data-map]");
          await page.click(`[data-visit="${id}"]`);
          await page.waitForFunction(
            () => window.__house.runner?.route.length === 0,
            null,
            { timeout: 35000 },
          );
          await page.locator("#runnerCanvas").focus();
          await page.keyboard.press("Space");
          await page.waitForFunction(
            (expected) => window.__house.runner?.marks.length >= expected,
            ribbon + 1 + (id === "craft" ? 0 : id === "roses" ? 3 : 6),
          );
          await page.waitForFunction(() => window.__house.runner?.z === 0);
        }
        await page.screenshot({
          path: resolve(output, `course-${id}.png`),
          fullPage: true,
        });
      }
      for (const id of ["lake", "home"]) {
        await page.click("[data-map]");
        await page.click(`[data-visit="${id}"]`);
        await page.waitForFunction(
          () => window.__house.runner?.route.length === 0,
          null,
          { timeout: 35000 },
        );
        await page.click("[data-interact]");
        await page.click('[data-encounter-choice="0"]');
        await page.screenshot({
          path: resolve(output, `encounter-${id}.png`),
          fullPage: true,
        });
        await page.click("[data-dialog-close]");
      }
      await page.waitForSelector(".curtain-call");
      const result = await page.evaluate(
        () => window.__house.memory.latestByGame["sector-sprint"],
      );
      assert.equal(result.gameVersion, "2.0.0");
      assert.equal(result.completionFacts.finalChapter, "Ghar wapsi");
      assert.doesNotMatch(
        await page.evaluate(() => localStorage.getItem("nindova:house:v2")),
        /\"(?:bag|visited|x|y|elapsedMs|choices)\"/,
      );
    }
    await context.close();
  }
  // Same encounters and choices without motion; Pause holds time without disabling reading.
  const story = await open(
    { width: 375, height: 812 },
    { narrated: true, clock: true },
  );
  await story.page.click("[data-runner-pause]");
  await story.page.clock.fastForward(700000);
  for (const id of ["roses", "market", "craft", "lake", "home"])
    await talk(story.page, id);
  await story.page.waitForSelector(".curtain-call");
  assert.equal(await story.page.locator("#runnerCanvas").count(), 0);
  await story.context.close();
  const capped = await open(
    { width: 375, height: 812 },
    { narrated: true, clock: true },
  );
  await capped.page.clock.fastForward(600001);
  await capped.page.waitForSelector(".curtain-call");
  assert.equal(
    await capped.page.evaluate(
      () => window.__house.memory.latestByGame["sector-sprint"],
    ),
    undefined,
  );
  await capped.context.close();
  const early = await open({ width: 375, height: 812 }, { narrated: true });
  await talk(early.page, "home");
  assert.equal(
    await early.page.evaluate(
      () => window.__house.memory.latestByGame["sector-sprint"],
    ),
    undefined,
  );
  await early.context.close();
  const reload = await open({ width: 375, height: 812 });
  await reload.page.reload();
  await reload.page.waitForSelector(".runner-restore-banner");
  assert.equal(await reload.page.evaluate(() => window.__house.active), null);
  await reload.context.close();
  const blur = await open({ width: 375, height: 812 });
  await blur.page.click("[data-map]");
  await blur.page.click('[data-visit="market"]');
  await blur.page.waitForFunction(() => window.__house.runner.walking);
  await blur.page.evaluate(() => window.dispatchEvent(new Event("blur")));
  const before = await blur.page.evaluate(() => window.__house.runner);
  await blur.page.waitForTimeout(150);
  assert.equal(
    await blur.page.evaluate(() => window.__house.runner.x),
    before.x,
  );
  await blur.page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await blur.page.waitForTimeout(150);
  assert.equal(
    await blur.page.evaluate(() => window.__house.runner.walking),
    false,
  );
  await blur.context.close();
  assert.deepEqual(external, []);
  assert.deepEqual(harness.errors, []);
  await writeFile(
    resolve(output, "performance.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(
    "Chandigarh exploration, all destinations, idle/release/cancel/blur, completion, early home, cap, narrated equivalence, phone layouts and 4x CPU frames passed.",
    JSON.stringify(results.map(({ frameSamples, ...result }) => result)),
  );
} finally {
  await harness.close();
}
