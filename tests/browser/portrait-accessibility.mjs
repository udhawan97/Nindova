import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/rasoi-responsive");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
await mkdir(output, { recursive: true });
const harness = await createBrowserEvidenceHarness();

async function open(viewport, options = {}) {
  const { context, page, errors } = await harness.open({ contextOptions: { viewport, ...options }, target });
  await page.waitForFunction(() => Boolean(window.__ct));
  return { context, page, errors };
}

async function tabToTile(page, tileId) {
  for (let step = 0; step < 24; step += 1) {
    if (await page.evaluate((id) => document.activeElement?.getAttribute("data-tile-id") === id, tileId)) return;
    await page.keyboard.press("Tab");
  }
  assert.fail(`Keyboard focus did not reach ${tileId}`);
}

async function assertReachable(page, selector, viewport) {
  const reachable = await page.locator(selector).first().evaluate((action) => {
    action.scrollIntoView({ block: "center" });
    const box = action.getBoundingClientRect();
    return box.width >= 44 && box.height >= 44 && box.top >= 0 && box.bottom <= innerHeight;
  });
  assert.equal(reachable, true, `${selector} should be reachable at ${viewport.width}x${viewport.height}`);
}

try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 667 },
    { width: 375, height: 812 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    const { context, page, errors } = await open(viewport);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    assert.doesNotMatch(await page.locator('meta[name="viewport"]').getAttribute("content") ?? "", /maximum-scale|user-scalable/);
    await assertReachable(page, "#beginBtn", viewport);
    await assertReachable(page, "#notNowBtn", viewport);
    await page.click("#beginBtn");
    await page.waitForFunction(() => window.__ct.state === "play");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    const freeBoxes = await page.locator(".tile:not(:disabled)").evaluateAll((buttons) => buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height, label: button.getAttribute("aria-label") };
    }));
    assert.equal(freeBoxes.length, 6);
    assert.ok(freeBoxes.every((box) => box.width >= 44 && box.height >= 44 && box.label?.includes("free, uncovered with an open side")));
    for (const selector of ["#muteBtn", "#hintBtn", ".tile:not(:disabled)"]) {
      await assertReachable(page, selector, viewport);
    }
    if ((viewport.width === 320 && viewport.height === 568) || viewport.width === 375 || viewport.width === 1440) {
      await page.screenshot({ path: resolve(output, `board-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
    await page.evaluate(() => window.__ct.finish());
    await page.waitForFunction(() => window.__ct.state === "end");
    await assertReachable(page, "#dimRestBtn", viewport);
    await assertReachable(page, "#driftBtn", viewport);
    await assertReachable(page, "#tomorrowBtn", viewport);
    assert.deepEqual(errors, []);
    await context.close();
  }

  const keyboard = await open({ width: 375, height: 812 });
  await keyboard.page.click("#beginBtn");
  await keyboard.page.waitForFunction(() => window.__ct.state === "play");
  const cdp = await keyboard.context.newCDPSession(keyboard.page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  assert.equal(await keyboard.page.evaluate(() => visualViewport?.scale), 2);
  assert.equal(await keyboard.page.evaluate(() => document.documentElement.scrollWidth), 375);
  while (await keyboard.page.evaluate(() => window.__ct.state === "play")) {
    const pair = await keyboard.page.evaluate(() => window.__ct.legalPairs[0]);
    await tabToTile(keyboard.page, pair[0]);
    assert.equal(await keyboard.page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return style.outlineStyle !== "none" && Number.parseFloat(style.outlineWidth) >= 3;
    }), true);
    await keyboard.page.keyboard.press("Enter");
    assert.equal(await keyboard.page.evaluate(() => window.__ct.selectedTile), pair[0]);
    await tabToTile(keyboard.page, pair[1]);
    await keyboard.page.keyboard.press("Enter");
    if (await keyboard.page.evaluate(() => window.__ct.state === "play")) {
      const next = await keyboard.page.evaluate(() => window.__ct.legalPairs[0][0]);
      await keyboard.page.waitForFunction((id) => document.activeElement?.getAttribute("data-tile-id") === id, next);
    }
  }
  await keyboard.page.waitForFunction(() => window.__ct.state === "end");
  assert.equal(await keyboard.page.evaluate(() => window.__ct.removedTileCount), 36);
  assert.deepEqual(keyboard.errors, []);
  await keyboard.context.close();

  const reduced = await open({ width: 375, height: 812 }, { reducedMotion: "reduce" });
  assert.equal(await reduced.page.evaluate(() => window.__ct.reduceMotion), true);
  await reduced.context.close();
  assert.deepEqual(harness.errors, []);
  console.log("Rasoi Pairs responsive, keyboard, target-size, zoom, and reduced-motion checks passed.");
} finally {
  await harness.close();
}
