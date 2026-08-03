import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/dawn");
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
  server.stdout.on("data", (chunk) => {
    if (!chunk.toString().includes("Nindova preview")) return;
    clearTimeout(timer);
    resolveReady();
  });
});

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

const base = `http://127.0.0.1:${port}/play/`;
const validNow = "2026-08-03T14:00:00.000Z";
const completion = {
  nightId: "2026-08-03|America/Chicago|r1",
  dawnDate: "2026-08-03",
  timeZone: "America/Chicago",
  recipeVersion: 1,
  startedAt: "2026-08-03T03:00:00.000Z",
  vista: "meadow",
  finalKind: "rabbit",
  completedAt: "2026-08-03T03:45:00.000Z",
};

try {
  await page.goto(`${base}?review=1&dawnNow=${encodeURIComponent(validNow)}`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);

  await page.evaluate((value) => {
    const next = NindovaNight.completeState(NindovaNight.emptyState(), value).state;
    NindovaNight.writeStorage(localStorage, next);
  }, completion);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#dawnBtn").isVisible(), true);
  assert.equal(await page.evaluate(() => window.__ct.dawnEligibility.reason), "available");

  await page.evaluate(() => window.__ct.setDawnNow("2026-08-03T10:59:00.000Z"));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  await page.evaluate(() => window.__ct.setDawnNow("2026-08-03T17:00:00.000Z"));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  await page.evaluate(() => window.__ct.setDawnNow("2026-08-04T14:00:00.000Z"));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  await page.evaluate((instant) => window.__ct.setDawnNow(instant), validNow);

  await page.click("#dawnBtn");
  await page.locator("#dawnCard").waitFor({ state: "visible" });
  await page.waitForTimeout(1_300);
  assert.equal(await page.locator("#dawnCanvas").isVisible(), true);
  assert.equal(await page.locator("#intake").getAttribute("aria-hidden"), "true");
  await page.screenshot({ path: resolve(output, "dawn-375x812.png"), fullPage: true });

  const stillDownloadPromise = page.waitForEvent("download");
  await page.click("#saveStillBtn");
  const stillDownload = await stillDownloadPromise;
  assert.equal(stillDownload.suggestedFilename(), "nindova-dawn-2026-08-03.png");
  assert.ok(await stillDownload.path());

  await page.evaluate(() => {
    Object.defineProperty(navigator, "canShare", { configurable: true, value: () => true });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: async () => {
        throw new DOMException("cancelled", "AbortError");
      },
    });
  });
  await page.click("#shareStillBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("cancelled"));
  assert.equal(await page.locator("#dawnCard").isVisible(), true);

  await page.evaluate(() => window.__ct.setLoopUnsupported(true));
  await page.click("#makeLoopBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("could not make"));
  assert.equal(await page.locator("#saveStillBtn").isEnabled(), true);
  assert.equal(await page.locator("#dawnCanvas").isVisible(), true);

  await page.evaluate(() => {
    window.__revokedDawnUrls = [];
    const original = URL.revokeObjectURL.bind(URL);
    URL.revokeObjectURL = (url) => {
      window.__revokedDawnUrls.push(url);
      return original(url);
    };
    window.__ct.setLoopUnsupported(false);
  });
  assert.ok(await page.evaluate(() => window.__ct.dawnLoopType));
  await page.click("#makeLoopBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("loop is ready"), null, {
    timeout: 12_000,
  });
  const loop = await page.evaluate(() => window.__ct.dawnLoop);
  assert.equal(loop.durationMs, 3000);
  assert.ok(loop.size > 0);
  assert.match(loop.type, /^video\//);
  assert.equal(await page.locator("#dawnVideo").isVisible(), true);
  assert.equal(await page.locator("#dawnVideo").getAttribute("muted"), "");

  await page.click("#shareLoopBtn");
  await page.waitForFunction(() => document.querySelector("#dawnStatus").textContent.includes("cancelled"));
  assert.equal(await page.locator("#dawnCard").isVisible(), true);

  await page.click("#closeDawnBtn");
  await page.locator("#dawnCard").waitFor({ state: "hidden" });
  assert.equal(await page.locator("#dawnCard").isHidden(), true);
  assert.ok((await page.evaluate(() => window.__revokedDawnUrls.length)) >= 1);

  await page.evaluate(() => localStorage.setItem(NindovaNight.STORAGE_KEY, "{corrupt"));
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#dawnBtn").isHidden(), true);
  assert.equal(await page.locator("#beginBtn").isVisible(), true);
  assert.deepEqual(errors, []);

  console.log("Dawn eligibility, still, silent loop, cancellation, cleanup, and corrupt-state checks passed.");
} finally {
  await context.close();
  await browser.close();
  server.kill("SIGTERM");
}
