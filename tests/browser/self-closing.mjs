import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const source = pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href;
const browser = await chromium.launch();

async function open(review = true) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${source}${review ? "?review=1" : ""}`);
  await page.waitForFunction(() => Boolean(window.__ct));
  return { context, page, errors };
}

async function expectBoundaryCloses(instance, partial = false) {
  await instance.page.click("#beginBtn");
  await instance.page.waitForFunction(() => window.__ct.state === "play");
  if (partial) {
    await instance.page.evaluate(() => {
      const pair = window.__ct.legalPairs[0];
      window.__ct.selectTile(pair[0]);
      window.__ct.selectTile(pair[1]);
    });
  }
  await instance.page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  await instance.page.waitForFunction(() => window.__ct.state === "rest");
  assert.equal(await instance.page.evaluate(() => window.__ct.endReason), "production-cap");
  assert.equal((await instance.page.locator("#endTitle").textContent())?.trim(), "The session is over. That's the point.");
  assert.deepEqual(instance.errors, []);
}

try {
  const production = await open(false);
  assert.deepEqual(await production.page.evaluate(() => ({ reviewer: window.__ct.reviewerMode, cap: window.__ct.hardCapSeconds })), { reviewer: false, cap: 900 });
  assert.equal(/\b\d{1,2}:\d{2}\b/.test(await production.page.locator("body").innerText()), false);
  await production.context.close();

  const hintOnly = await open();
  await hintOnly.page.click("#beginBtn");
  const before = await hintOnly.page.evaluate(() => window.__ct.removedTileCount);
  await hintOnly.page.click("#hintBtn");
  assert.equal(await hintOnly.page.evaluate(() => window.__ct.removedTileCount), before);
  assert.equal(await hintOnly.page.locator(".is-hinted").count(), 2);
  assert.equal(await hintOnly.page.locator('.is-hinted[aria-label*="suggested safe pair"]').count(), 2);
  assert.match((await hintOnly.page.locator("#boardStatus").textContent()) ?? "", /^Hint: the two free .+ tiles are a safe pair\.$/);
  await hintOnly.page.evaluate(() => window.__ct.advanceBy(89));
  assert.equal(await hintOnly.page.evaluate(() => window.__ct.state), "play");
  await hintOnly.context.close();

  const noInput = await open();
  await expectBoundaryCloses(noInput);
  await noInput.context.close();

  const partial = await open();
  await expectBoundaryCloses(partial, true);
  await partial.context.close();

  const selected = await open();
  await selected.page.click("#beginBtn");
  await selected.page.evaluate(() => window.__ct.selectTile(window.__ct.legalPairs[0][0]));
  await selected.page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  await selected.page.waitForFunction(() => window.__ct.state === "rest");
  assert.equal(await selected.page.evaluate(() => window.__ct.endReason), "production-cap");
  await selected.context.close();

  const rolledBackClock = await open();
  await rolledBackClock.page.click("#beginBtn");
  await rolledBackClock.page.evaluate(() => {
    const realNow = Date.now;
    Date.now = () => realNow() - 7_200_000;
    window.__ct.advanceBy(window.__ct.hardCapSeconds);
  });
  await rolledBackClock.page.waitForFunction(() => window.__ct.state === "rest");
  assert.equal(await rolledBackClock.page.evaluate(() => window.__ct.endReason), "production-cap");
  await rolledBackClock.context.close();
  console.log("Rasoi hint, no-input, partial-input, selected-tile, clock-rollback, and production-boundary checks passed.");
} finally {
  await browser.close();
}
