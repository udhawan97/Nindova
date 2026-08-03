import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const port = 4189;
const mountPath = process.env.NINDOVA_PREVIEW_BASE?.replace(/^\/+|\/+$/g, "") ?? "";
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
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
await context.addInitScript(() => {
  class DeniedAudioContext { constructor() { throw new Error("audio unavailable in test"); } }
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: DeniedAudioContext });
});
const page = await context.newPage();
const errors = [];
const requests = [];
page.on("request", (request) => requests.push(request.url()));
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));
const prefix = `http://127.0.0.1:${port}/${mountPath ? `${mountPath}/` : ""}`;
const base = `${prefix}play/`;

try {
  await page.goto(prefix);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375);
  const publicCopy = await page.locator("body").innerText();
  assert.ok(publicCopy.includes("Nothing to win. Nothing tracked. Nothing you can do wrong."));

  await page.goto(`${base}?review=1`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.getAttribute('link[rel="manifest"]', "href"), "./manifest.webmanifest");
  const manifest = await page.evaluate(() => fetch("./manifest.webmanifest").then((response) => response.json()));
  assert.deepEqual({ start_url: manifest.start_url, scope: manifest.scope, display: manifest.display }, { start_url: "./", scope: "./", display: "standalone" });
  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    const keys = await caches.keys();
    const cache = await caches.open("nindova-session-v4");
    return { scope: ready.scope, keys, entries: (await cache.keys()).map((request) => request.url) };
  });
  assert.equal(registration.scope, base);
  assert.ok(registration.keys.includes("nindova-session-v4"));
  assert.ok(registration.entries.every((url) => url.startsWith(base) && !url.includes("night-state") && !url.startsWith("blob:")));

  await page.click("#notNowBtn");
  await page.click("#returnBtn");
  await page.click("#muteBtn");
  await page.click("#beginBtn");
  const firstBoard = await page.evaluate(() => window.__ct.board.id);
  const pair = await page.evaluate(() => window.__ct.legalPairs[0]);
  await page.evaluate((value) => { window.__ct.selectTile(value[0]); window.__ct.selectTile(value[1]); }, pair);
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  assert.equal(await page.evaluate(() => window.__ct.board.id), firstBoard);
  assert.equal(await page.evaluate(() => window.__ct.removedTileCount), 2);

  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  await page.waitForFunction(() => window.__ct.state === "end");
  assert.equal(await page.evaluate(() => window.__ct.endReason), "production-cap");
  await page.click("#tomorrowBtn");
  assert.equal(await page.evaluate(() => window.__ct.memory.tomorrowIntention.nightId === window.__ct.memory.lastCompleted.nightId), true);

  await context.setOffline(false);
  const portable = await context.newPage();
  const portableErrors = [];
  portable.on("pageerror", (error) => portableErrors.push(error.message));
  await portable.goto(`${prefix}nindova.html?review=1`);
  await portable.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await portable.locator('link[rel="manifest"]').count(), 0);
  assert.equal(await portable.evaluate(() => navigator.serviceWorker.controller), null);
  assert.equal(await portable.evaluate(() => Boolean(window.NindovaNight && window.NindovaDawn && window.NindovaRasoi)), true);
  await portable.click("#beginBtn");
  assert.equal(await portable.evaluate(() => window.__ct.board.tiles.length), 36);
  assert.deepEqual(portableErrors, []);
  assert.ok(requests.every((url) => new URL(url).origin === new URL(base).origin));
  assert.deepEqual(errors, []);
  console.log("Rasoi PWA install, same-tab resume, denied audio, offline closure, local return, privacy, and standalone checks passed.");
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
  server.kill("SIGTERM");
}
