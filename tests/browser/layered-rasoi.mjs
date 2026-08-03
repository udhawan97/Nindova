import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
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

try {
  const normal = await open();
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
  await normal.page.evaluate((pair) => {
    window.__ct.selectTile(pair[0]);
    window.__ct.selectTile(pair[1]);
  }, firstPair);
  assert.equal(await normal.page.evaluate(() => window.__ct.removedTileCount), 2);
  assert.equal(await normal.page.locator(".tile.is-pairing").count(), 2);
  assert.equal(await normal.page.locator(".pair-bloom").count(), 1);
  assert.match(await normal.page.locator(".tile.is-pairing").first().evaluate((tile) => getComputedStyle(tile).animationName), /brass-settle/);
  await normal.page.waitForFunction(() => !document.querySelector(".pair-bloom"));

  while (await normal.page.evaluate(() => window.__ct.state === "play")) {
    await normal.page.evaluate(() => {
      const pair = window.__ct.legalPairs[0];
      window.__ct.selectTile(pair[0]);
      window.__ct.selectTile(pair[1]);
    });
  }
  await normal.page.waitForFunction(() => window.__ct.state === "end");
  assert.equal(await normal.page.evaluate(() => document.activeElement?.id), "dimRestBtn");
  await normal.page.click("#dimRestBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "rest");
  assert.match(await normal.page.locator("#rest").innerText(), /Put the phone down/);
  await normal.page.click("#restBackBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "intake");
  const completedBoard = await normal.page.evaluate(() => window.__ct.board.id);
  await normal.page.click("#beginBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "play");
  assert.equal(await normal.page.evaluate(() => window.__ct.board.id), completedBoard);
  assert.equal(await normal.page.evaluate(() => window.__ct.removedTileCount), 0);
  assert.deepEqual(normal.errors, []);
  await normal.context.close();

  const reduced = await open({ reducedMotion: "reduce" });
  const reducedPair = await reduced.page.evaluate(() => window.__ct.legalPairs[0]);
  await reduced.page.evaluate((pair) => {
    window.__ct.selectTile(pair[0]);
    window.__ct.selectTile(pair[1]);
  }, reducedPair);
  assert.match(await reduced.page.locator(".tile.is-pairing").first().evaluate((tile) => getComputedStyle(tile).animationName), /pair-fade/);
  assert.equal(await reduced.page.locator(".pair-bloom").evaluate((bloom) => getComputedStyle(bloom).display), "none");
  assert.deepEqual(reduced.errors, []);
  await reduced.context.close();

  console.log("Layered occlusion, brass bloom, reduced motion, rest, and deliberate same-night return passed.");
} finally {
  await browser.close();
}
