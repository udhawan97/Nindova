import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/public-surface");
const port = 4194;
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
    if (chunk.toString().includes("Nindova preview")) {
      clearTimeout(timer);
      resolveReady();
    }
  });
});

const browser = await chromium.launch({ headless: true });
const errors = [];

async function open(viewport, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", (error) => errors.push(error.message));
  const response = await page.goto(`http://127.0.0.1:${port}/`);
  assert.equal(response?.ok(), true);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
  return { context, page };
}

try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 },
  ]) {
    const { context, page } = await open(viewport);
    assert.match(await page.locator("header .brand-lockup").evaluate((image) => image.currentSrc), /nindova-logo-horizontal-animated\.svg$/);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    for (const selector of [".nav-play", ".button-primary", ".button-secondary"]) {
      const box = await page.locator(selector).first().boundingBox();
      assert.ok(box && box.width >= 44 && box.height >= 44, `${selector} target at ${viewport.width}px`);
    }
    assert.equal(await page.locator(".motif-line img").count(), 9);
    if ([320, 375, 1440].includes(viewport.width)) {
      await page.screenshot({ path: resolve(output, `landing-${viewport.width}x${viewport.height}.png`), fullPage: true, animations: "disabled" });
    }
    const docsResponse = await page.goto(`http://127.0.0.1:${port}/docs/visual-identity/`);
    assert.equal(docsResponse?.ok(), true);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    await context.close();
  }

  const zoomed = await open({ width: 375, height: 812 });
  const cdp = await zoomed.context.newCDPSession(zoomed.page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  assert.equal(await zoomed.page.evaluate(() => visualViewport?.scale), 2);
  assert.equal(await zoomed.page.evaluate(() => document.documentElement.scrollWidth), 375);
  await zoomed.page.locator(".button-primary").first().scrollIntoViewIfNeeded();
  assert.equal(await zoomed.page.locator(".button-primary").first().isVisible(), true);
  await zoomed.context.close();

  const reduced = await open({ width: 375, height: 812 }, { reducedMotion: "reduce" });
  assert.match(await reduced.page.locator(".button-primary").first().evaluate((element) => getComputedStyle(element).transitionDuration), /0\.00001s|1e-05s|0s/);
  assert.match(await reduced.page.locator("header .brand-lockup").evaluate((image) => image.currentSrc), /nindova-logo-horizontal\.svg$/);
  await reduced.context.close();

  assert.deepEqual(errors, []);
  console.log("Public site responsive, asset, docs, target-size, zoom, and reduced-motion checks passed.");
} finally {
  await browser.close();
  server.kill("SIGTERM");
}
