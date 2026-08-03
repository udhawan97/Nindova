import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

await import("../../apps/session/night-core.js");
const Night = globalThis.NindovaNight;
const root = resolve(import.meta.dirname, "../..");
const target = `${pathToFileURL(resolve(root, "apps/session/index.html")).href}?review=1`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

try {
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));

  await page.evaluate(() => localStorage.setItem(NindovaNight.STORAGE_KEY, "{broken"));
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.deepEqual(await page.evaluate(() => window.__ct.localRecovery), { recovered: true, reason: "corrupt" });

  await page.evaluate(() => localStorage.removeItem(NindovaNight.STORAGE_KEY));
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.deepEqual(await page.evaluate(() => window.__ct.localRecovery), { recovered: false, reason: "missing" });

  const parityId = "2026-08-03|America/Chicago|r1";
  assert.deepEqual(await page.evaluate((nightId) => window.__ct.recipeForNight(nightId), parityId), Night.recipeForNight(parityId));

  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "arrive");
  const started = await page.evaluate(() => ({
    night: window.__ct.night,
    recipe: window.__ct.recipe,
    objectKinds: window.__ct.objects.map((object) => object.kind),
  }));
  assert.ok(started.night?.nightId);
  assert.deepEqual(started.objectKinds, started.recipe.objectKinds);

  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  assert.equal(await page.evaluate(() => window.__ct.state), "end");
  const firstMemory = await page.evaluate(() => window.__ct.memory);
  assert.equal(firstMemory.lastCompleted.nightId, started.night.nightId);
  assert.deepEqual(firstMemory.meadowEcho, {
    nightId: started.night.nightId,
    kind: firstMemory.lastCompleted.finalKind,
  });
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), [Night.STORAGE_KEY]);

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.click("#beginBtn");
  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  const replay = await page.evaluate(() => ({ night: window.__ct.night, memory: window.__ct.memory }));
  assert.equal(replay.night.nightId, started.night.nightId);
  assert.deepEqual(replay.memory, firstMemory);
  assert.deepEqual(errors, []);

  console.log("Deterministic recipe, corrupt-state recovery, Echo, and same-night idempotence checks passed.");
} finally {
  await context.close();
  await browser.close();
}
