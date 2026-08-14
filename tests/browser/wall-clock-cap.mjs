import assert from "node:assert/strict";
import { resolve } from "node:path";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";

const root = resolve(import.meta.dirname, "../..");
const port = 4193;
const harness = await createBrowserEvidenceHarness({ root, previewRoot: resolve(root, "dist"), port });
const opened = await harness.open({ contextOptions: { viewport: { width: 375, height: 812 } } });
const { page, errors } = opened;

try {
  await page.goto(`http://127.0.0.1:${port}/play/`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.deepEqual(await page.evaluate(() => ({ reviewer: window.__ct.reviewerMode, cap: window.__ct.hardCapSeconds })), { reviewer: false, cap: 900 });
  const startedAt = Date.now();
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "end", null, { timeout: 905_000, polling: 250 });
  const elapsedToEndSeconds = (Date.now() - startedAt) / 1000;
  const resultAtEnd = await page.evaluate(() => ({
    state: window.__ct.state,
    sessionElapsed: window.__ct.sessionElapsed,
    hardCapSeconds: window.__ct.hardCapSeconds,
    endReason: window.__ct.endReason,
  }));
  assert.ok(elapsedToEndSeconds >= 719 && elapsedToEndSeconds < 900, `${elapsedToEndSeconds}s wall-clock duration`);
  assert.equal(resultAtEnd.endReason, "production-cap");
  const remaining = Math.max(0, startedAt + 900_000 - Date.now());
  await new Promise((resolveWait) => setTimeout(resolveWait, remaining));
  const observedWallSeconds = (Date.now() - startedAt) / 1000;
  assert.ok(observedWallSeconds >= 899.5 && observedWallSeconds <= 905, `${observedWallSeconds}s ceiling observation`);
  assert.equal(await page.evaluate(() => window.__ct.state), "rest");
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ elapsedToEndSeconds, observedWallSeconds, resultAtEnd, errors }));
} finally {
  await harness.close();
}
