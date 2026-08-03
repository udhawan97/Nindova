import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/rasoi-responsive");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
await mkdir(output, { recursive: true });
const browser = await chromium.launch();

async function open(viewport, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  return { context, page, errors };
}

try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    const { context, page, errors } = await open(viewport);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    assert.doesNotMatch(await page.locator('meta[name="viewport"]').getAttribute("content") ?? "", /maximum-scale|user-scalable/);
    await page.click("#beginBtn");
    await page.waitForFunction(() => window.__ct.state === "play");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    const freeBoxes = await page.locator(".tile:not(:disabled)").evaluateAll((buttons) => buttons.map((button) => {
      const box = button.getBoundingClientRect();
      return { width: box.width, height: box.height, label: button.getAttribute("aria-label") };
    }));
    assert.equal(freeBoxes.length, 6);
    assert.ok(freeBoxes.every((box) => box.width >= 44 && box.height >= 44 && box.label?.includes("free at the rack edge")));
    if (viewport.width === 375 || viewport.width === 1440) {
      await page.screenshot({ path: resolve(output, `board-${viewport.width}x${viewport.height}.png`), fullPage: true });
    }
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
    await keyboard.page.locator(`[data-tile-id="${pair[0]}"]`).scrollIntoViewIfNeeded();
    await keyboard.page.locator(`[data-tile-id="${pair[0]}"]`).focus();
    await keyboard.page.keyboard.press("Enter");
    assert.equal(await keyboard.page.evaluate(() => window.__ct.selectedTile), pair[0]);
    await keyboard.page.locator(`[data-tile-id="${pair[1]}"]`).scrollIntoViewIfNeeded();
    await keyboard.page.locator(`[data-tile-id="${pair[1]}"]`).focus();
    await keyboard.page.keyboard.press("Enter");
  }
  await keyboard.page.waitForFunction(() => window.__ct.state === "end");
  assert.equal(await keyboard.page.evaluate(() => window.__ct.removedTileCount), 36);
  assert.deepEqual(keyboard.errors, []);
  await keyboard.context.close();

  const reduced = await open({ width: 375, height: 812 }, { reducedMotion: "reduce" });
  assert.equal(await reduced.page.evaluate(() => window.__ct.reduceMotion), true);
  await reduced.context.close();
  console.log("Rasoi Pairs responsive, keyboard, target-size, zoom, and reduced-motion checks passed.");
} finally {
  await browser.close();
}
