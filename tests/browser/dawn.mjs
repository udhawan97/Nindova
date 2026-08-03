import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";
import { recipeTwoCompletion } from "../fixtures/recipe-two.mjs";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/rasoi-dawn");
const port = 4187;
await mkdir(output, { recursive: true });
const server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs"), resolve(root, "dist")], {
  cwd: root,
  env: { ...process.env, NINDOVA_PREVIEW_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});
await new Promise((resolveReady, reject) => {
  const timer = setTimeout(() => reject(new Error("preview server did not start")), 5_000);
  server.once("error", reject);
  server.stdout.on("data", (chunk) => { if (chunk.toString().includes("Nindova preview")) { clearTimeout(timer); resolveReady(); } });
});

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
const validNow = "2026-08-03T14:00:00.000Z";

try {
  await page.goto(`http://127.0.0.1:${port}/play/?review=1`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  await page.evaluate((completion) => {
    NindovaNight.writeStorage(localStorage, NindovaNight.completeState(NindovaNight.emptyState(), completion).state);
  }, recipeTwoCompletion);
  await page.reload();
  await page.evaluate((instant) => window.__ct.setDawnNow(instant), validNow);
  assert.equal(await page.locator("#dawnBtn").isVisible(), true);
  assert.equal(await page.evaluate(() => window.__ct.dawnEligibility.reason), "available");

  await page.evaluate(() => window.__ct.setDawnNow("2026-08-03T10:59:00.000Z"));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  await page.evaluate(() => window.__ct.setDawnNow("2026-08-03T17:00:00.000Z"));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  await page.evaluate((instant) => window.__ct.setDawnNow(instant), validNow);
  await page.click("#dawnBtn");
  await page.locator("#dawn").waitFor({ state: "visible" });
  assert.equal(await page.evaluate(() => window.__ct.state), "dawn");
  assert.ok((await page.locator("#dawnCanvas").getAttribute("aria-label")).includes("nine kitchen motifs"));
  await page.screenshot({ path: resolve(output, "dawn-375x812.png"), fullPage: true });

  const downloadPromise = page.waitForEvent("download");
  await page.click("#saveStillBtn");
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), "nindova-dawn.png");
  assert.ok(await download.path());

  await page.evaluate(() => {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", { configurable: true, value: async () => { throw new DOMException("cancelled", "AbortError"); } });
  });
  await page.click("#shareStillBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("cancelled"));

  await page.evaluate(() => window.__ct.setLoopUnsupported(true));
  await page.click("#makeLoopBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("unavailable"));
  assert.equal(await page.locator("#saveStillBtn").isEnabled(), true);

  await page.evaluate(() => window.__ct.setLoopUnsupported(false));
  await page.click("#makeLoopBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("loop is ready"), null, { timeout: 10_000 });
  assert.equal(await page.locator("#dawnVideo").isVisible(), true);
  assert.equal(await page.locator("#dawnVideo").getAttribute("muted"), "");
  await page.click("#closeDawnBtn");
  assert.equal(await page.locator("#intake").isVisible(), true);
  assert.deepEqual(errors, []);
  console.log("Rasoi Dawn eligibility, first-light still, local export, share cancellation, and loop fallback checks passed.");
} finally {
  await context.close();
  await browser.close();
  server.kill("SIGTERM");
}
