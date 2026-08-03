import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const port = 4193;
const server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs"), resolve(root, "dist")], {
  cwd: root,
  env: { ...process.env, NINDOVA_PREVIEW_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

await new Promise((resolveReady, reject) => {
  const timer = setTimeout(() => reject(new Error("preview server did not start")), 5_000);
  server.once("error", reject);
  server.stdout.on("data", (chunk) => {
    if (!chunk.toString().includes("Nindova preview")) return;
    clearTimeout(timer);
    resolveReady();
  });
});

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

try {
  await page.goto(`http://127.0.0.1:${port}/play/`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.evaluate(() => window.__ct.reviewerMode), false);
  assert.equal(await page.evaluate(() => window.__ct.hardCapSeconds), 900);

  const startedAt = Date.now();
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "end", null, { timeout: 920_000, polling: 100 });
  const elapsedToEndSeconds = (Date.now() - startedAt) / 1000;
  const resultAtEnd = await page.evaluate(() => ({
    state: window.__ct.state,
    sessionElapsed: window.__ct.sessionElapsed,
    hardCapSeconds: window.__ct.hardCapSeconds,
    endReason: window.__ct.endReason,
  }));

  assert.ok(elapsedToEndSeconds >= 600 && elapsedToEndSeconds < 900, `${elapsedToEndSeconds}s wall-clock duration`);
  assert.equal(resultAtEnd.state, "end");
  assert.equal(resultAtEnd.hardCapSeconds, 900);
  assert.equal(resultAtEnd.endReason, "completed");
  assert.ok(Math.abs(resultAtEnd.sessionElapsed - elapsedToEndSeconds) <= 2.5, JSON.stringify(resultAtEnd));

  const remainingToCeiling = Math.max(0, startedAt + 900_000 - Date.now());
  await new Promise((resolveWait) => setTimeout(resolveWait, remainingToCeiling));
  const observedWallSeconds = (Date.now() - startedAt) / 1000;
  const resultAtCeiling = await page.evaluate(() => ({ state: window.__ct.state, endReason: window.__ct.endReason }));
  assert.ok(observedWallSeconds >= 899.5 && observedWallSeconds <= 905, `${observedWallSeconds}s ceiling observation`);
  assert.deepEqual(resultAtCeiling, { state: "end", endReason: "completed" });
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ elapsedToEndSeconds, observedWallSeconds, resultAtEnd, resultAtCeiling, errors }));
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
