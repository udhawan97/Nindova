import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
const browser = await chromium.launch();

async function open(options = {}) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "play");
  return { context, page, errors };
}

async function tapTile(page, tileId) {
  const box = await page.locator(`[data-tile-id="${tileId}"]`).boundingBox();
  assert.ok(box, `${tileId} should have a touchable box`);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

function meanLuminance(buffer) {
  const png = PNG.sync.read(buffer);
  let total = 0;
  for (let index = 0; index < png.data.length; index += 4) {
    total += (0.2126 * png.data[index]) + (0.7152 * png.data[index + 1]) + (0.0722 * png.data[index + 2]);
  }
  return total / (png.width * png.height);
}

try {
  const normal = await open({ hasTouch: true });
  assert.deepEqual(await normal.page.evaluate(() => [0, 1, 2].map(
    (layer) => window.__ct.tiles.filter((tile) => tile.layer === layer).length,
  )), [24, 8, 4]);
  assert.match(await normal.page.locator('[data-tile-id="b0-0"]').getAttribute("aria-label") ?? "", /covered by a tile above/);
  assert.match(await normal.page.locator('[data-tile-id="t-1"]').getAttribute("aria-label") ?? "", /blocked on both sides/);

  const overlap = await normal.page.evaluate(() => {
    const lower = document.querySelector('[data-tile-id="b0-0"]').getBoundingClientRect();
    const higher = document.querySelector('[data-tile-id="m0-0"]').getBoundingClientRect();
    const intersects = Math.min(lower.right, higher.right) > Math.max(lower.left, higher.left)
      && Math.min(lower.bottom, higher.bottom) > Math.max(lower.top, higher.top);
    return {
      intersects,
      lowerZ: Number(getComputedStyle(document.querySelector('[data-tile-id="b0-0"]')).zIndex),
      higherZ: Number(getComputedStyle(document.querySelector('[data-tile-id="m0-0"]')).zIndex),
    };
  });
  assert.equal(overlap.intersects, true);
  assert.ok(overlap.higherZ > overlap.lowerZ);

  const firstPair = await normal.page.evaluate(() => window.__ct.legalPairs[0]);
  const warmthBefore = Number(await normal.page.locator("#boardShell").evaluate((shell) => getComputedStyle(shell).getPropertyValue("--warmth")));
  const luminanceBefore = meanLuminance(await normal.page.locator("#boardShell").screenshot({ animations: "disabled" }));
  await tapTile(normal.page, firstPair[0]);
  await tapTile(normal.page, firstPair[1]);
  assert.equal(await normal.page.evaluate(() => window.__ct.removedTileCount), 2);
  assert.equal(await normal.page.locator(".tile.is-pairing").count(), 2);
  assert.equal(await normal.page.locator(".pair-bloom").count(), 1);
  const warmthAfter = Number(await normal.page.locator("#boardShell").evaluate((shell) => getComputedStyle(shell).getPropertyValue("--warmth")));
  assert.ok(warmthAfter < warmthBefore);
  await normal.page.waitForTimeout(50);
  assert.equal(await normal.page.locator(".pair-bloom").evaluate((bloom) => {
    const box = bloom.getBoundingClientRect();
    const style = getComputedStyle(bloom);
    return box.width > 0 && box.height > 0 && Number(style.opacity) > 0 && style.visibility === "visible";
  }), true);
  assert.match(await normal.page.locator(".tile.is-pairing").first().evaluate((tile) => getComputedStyle(tile).animationName), /brass-settle/);
  await normal.page.waitForFunction(() => !document.querySelector(".pair-bloom"));
  const luminanceAfter = meanLuminance(await normal.page.locator("#boardShell").screenshot({ animations: "disabled" }));
  assert.ok(luminanceAfter <= luminanceBefore + 0.5, `settled board should not brighten (${luminanceBefore} -> ${luminanceAfter})`);

  while (await normal.page.evaluate(() => window.__ct.state === "play")) {
    const pair = await normal.page.evaluate(() => window.__ct.legalPairs[0]);
    await tapTile(normal.page, pair[0]);
    await tapTile(normal.page, pair[1]);
  }
  await normal.page.waitForFunction(() => window.__ct.state === "end");
  const firstMemory = await normal.page.evaluate(() => window.__ct.memory);
  const completedBoard = await normal.page.evaluate(() => window.__ct.board.id);
  assert.equal(await normal.page.evaluate(() => document.activeElement?.id), "dimRestBtn");
  await normal.page.click("#dimRestBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "rest");
  assert.match(await normal.page.locator("#rest").innerText(), /Put the phone down/);
  assert.equal(await normal.page.locator("#rest button").count(), 0);
  await normal.page.reload();
  await normal.page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "intake");
  await normal.page.click("#beginBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "play");
  assert.equal(await normal.page.evaluate(() => window.__ct.board.id), completedBoard);
  assert.equal(await normal.page.evaluate(() => window.__ct.removedTileCount), 0);
  while (await normal.page.evaluate(() => window.__ct.state === "play")) {
    const pair = await normal.page.evaluate(() => window.__ct.legalPairs[0]);
    await tapTile(normal.page, pair[0]);
    await tapTile(normal.page, pair[1]);
  }
  await normal.page.waitForFunction(() => window.__ct.state === "end");
  assert.deepEqual(await normal.page.evaluate(() => window.__ct.memory), firstMemory);
  assert.deepEqual(normal.errors, []);
  await normal.context.close();

  const reduced = await open({ reducedMotion: "reduce" });
  const reducedPair = await reduced.page.evaluate(() => window.__ct.legalPairs[0]);
  await reduced.page.click(`[data-tile-id="${reducedPair[0]}"]`);
  await reduced.page.click(`[data-tile-id="${reducedPair[1]}"]`);
  assert.match(await reduced.page.locator(".tile.is-pairing").first().evaluate((tile) => getComputedStyle(tile).animationName), /pair-fade/);
  assert.equal(await reduced.page.locator(".pair-bloom").evaluate((bloom) => getComputedStyle(bloom).display), "none");
  assert.deepEqual(reduced.errors, []);
  await reduced.context.close();

  console.log("Layered occlusion, brass bloom, reduced motion, rest, and deliberate same-night return passed.");
} finally {
  await browser.close();
}
