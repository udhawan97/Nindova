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
  server.stdout.on("data", (chunk) => {
    if (!chunk.toString().includes("Nindova preview")) return;
    clearTimeout(timer);
    resolveReady();
  });
});

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
await context.addInitScript(() => {
  class DeniedAudioContext {
    constructor() { throw new Error("audio unavailable in test"); }
  }
  Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: DeniedAudioContext });
  Object.defineProperty(globalThis, "webkitAudioContext", { configurable: true, value: DeniedAudioContext });
  globalThis.__notificationRequests = 0;
  if (globalThis.Notification) {
    Object.defineProperty(globalThis.Notification, "requestPermission", {
      configurable: true,
      value: async () => { globalThis.__notificationRequests += 1; return "denied"; },
    });
  }
});

const page = await context.newPage();
const errors = [];
const requests = [];
page.on("request", (request) => requests.push(request.url()));
page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

const base = `http://127.0.0.1:${port}/${mountPath ? `${mountPath}/` : ""}play/`;
const artifactBase = `http://127.0.0.1:${port}/${mountPath ? `${mountPath}/` : ""}`;

try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 414, height: 896 },
    { width: 768, height: 1024 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(artifactBase);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), viewport.width);
    const productLanguage = await page.locator("body").innerText();
    assert.ok(productLanguage.includes("Nothing to win. Nothing tracked. Nothing you can do wrong."));
    assert.ok(productLanguage.includes("Behavioral design study · 13+"));
    assert.ok(productLanguage.includes("not a sleep tracker or treatment"));
    assert.ok(productLanguage.includes("CBT-I"));
    assert.equal(/improves? (your )?sleep|better sleep guaranteed|sleep performance score/i.test(productLanguage), false);
    const wrappedAffordances = await page.locator(".nav-action, .action-primary, .action-text, .foot-meta a").evaluateAll((elements) =>
      elements.filter((element) => getComputedStyle(element).whiteSpace !== "nowrap").map((element) => element.textContent?.trim()),
    );
    assert.deepEqual(wrappedAffordances, []);
    if (viewport.width === 1280) {
      const fold = await page.evaluate(() => ({
        ctaBottom: document.querySelector(".hero-actions .action-primary").getBoundingClientRect().bottom,
        mediaBottom: document.querySelector(".phulkari-frame").getBoundingClientRect().bottom,
        height: innerHeight,
      }));
      assert.ok(fold.ctaBottom < fold.height && fold.mediaBottom < fold.height, JSON.stringify(fold));
    }
  }

  assert.equal(await page.locator('a[href$="/play/"]').first().getAttribute("href"), `/${mountPath ? `${mountPath}/` : ""}play/`);
  assert.equal(await page.locator('a[href$="/docs/"]').first().getAttribute("href"), `/${mountPath ? `${mountPath}/` : ""}docs/`);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(`${artifactBase}docs/research-receipts/`);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), 375);

  await page.evaluate(async () => {
    await caches.open("nindova-session-obsolete");
    await caches.open("another-project-cache");
  });
  await page.goto(`${base}?review=1`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#intake .footnote").innerText(), "Nothing to win. Nothing tracked. Nothing you can do wrong.");
  assert.equal((await page.locator("#endCard .end-title").textContent())?.trim(), "The session is over. That's the point.");
  const disclaimer = (await page.locator("#endCard .disclaimer").textContent()) ?? "";
  assert.ok(disclaimer.includes("13+"));
  assert.ok(disclaimer.includes("not a treatment for insomnia"));
  assert.ok(disclaimer.includes("CBT-I"));
  assert.equal(await page.getAttribute('link[rel="manifest"]', "href"), "./manifest.webmanifest");
  const manifest = await page.evaluate(() => fetch("./manifest.webmanifest").then((response) => response.json()));
  assert.equal(manifest.start_url, "./");
  assert.equal(manifest.scope, "./");
  assert.equal(manifest.display, "standalone");

  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const cdp = await context.newCDPSession(page);
  assert.deepEqual(await cdp.send("Page.getInstallabilityErrors"), { installabilityErrors: [] });
  const parsedManifest = await cdp.send("Page.getAppManifest");
  assert.deepEqual(parsedManifest.errors, []);
  assert.ok(parsedManifest.data.includes('"display": "standalone"'));
  const worker = await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const keys = await caches.keys();
    const cache = await caches.open("nindova-session-v2");
    const entries = (await cache.keys()).map((request) => request.url);
    return { scope: registration.scope, keys, entries };
  });
  assert.equal(worker.scope, base);
  assert.deepEqual(worker.keys.sort(), ["another-project-cache", "nindova-session-v2"]);
  assert.ok(worker.entries.some((url) => url.endsWith("/play/index.html")));
  assert.ok(worker.entries.every((url) => url.startsWith(base)));
  assert.ok(worker.entries.every((url) => !url.startsWith("blob:") && !url.includes("night-state")));

  await page.evaluate(async () => {
    const cache = await caches.open("nindova-session-v2");
    const stalePage = new Response("<!doctype html><title>stale shell</title>", {
      headers: { "content-type": "text/html" },
    });
    await cache.put(new URL("./", location.href), stalePage.clone());
    await cache.put(new URL("index.html", location.href), stalePage);
  });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  const refreshedPages = await page.evaluate(async () => {
    const cache = await caches.open("nindova-session-v2");
    return Promise.all([
      cache.match(new URL("./", location.href)).then((response) => response.text()),
      cache.match(new URL("index.html", location.href)).then((response) => response.text()),
    ]);
  });
  assert.ok(refreshedPages.every((html) => html.includes("Nothing to win. Nothing tracked.")));

  const legacyCompletion = {
    nightId: "2026-08-03|America/Chicago|r1",
    dawnDate: "2026-08-03",
    timeZone: "America/Chicago",
    recipeVersion: 1,
    startedAt: "2026-08-03T03:00:00.000Z",
    vista: "meadow",
    finalKind: "rabbit",
    completedAt: "2026-08-03T03:45:00.000Z",
  };
  await page.evaluate((completion) => {
    localStorage.clear();
    localStorage.setItem(NindovaNight.LEGACY_STORAGE_KEY, JSON.stringify({
      version: 1,
      lastCompleted: completion,
      meadowEcho: { nightId: completion.nightId, kind: completion.finalKind },
      harborEchoes: [],
    }));
  }, legacyCompletion);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.deepEqual(await page.evaluate(() => window.__ct.localRecovery), { recovered: false, reason: "migrated" });
  assert.deepEqual(await page.evaluate(() => Object.keys(localStorage)), ["nindova:night-state:v2"]);

  await page.evaluate(() => localStorage.setItem(NindovaNight.STORAGE_KEY, "{broken"));
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.deepEqual(await page.evaluate(() => window.__ct.localRecovery), { recovered: true, reason: "corrupt" });

  await page.click("#muteBtn");
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "arrive");
  const firstRecipe = await page.evaluate(() => window.__ct.recipe);
  await page.evaluate(() => window.__ct.lightLamp());
  await page.waitForFunction(() => window.__ct.state === "play");
  await page.evaluate(() => window.__ct.storeNext());

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#beginBtn").isVisible(), true);
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "arrive");
  assert.deepEqual(await page.evaluate(() => window.__ct.recipe), firstRecipe);

  await context.setOffline(true);
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.waitForFunction(() => window.__ct.spriteReady);
  await page.click("#beginBtn");
  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  assert.equal(await page.evaluate(() => window.__ct.state), "end");
  const completionMemory = await page.evaluate(() => window.__ct.memory);
  assert.ok(completionMemory.lastCompleted?.nightId);

  await page.click("#tomorrowBtn");
  const heldMemory = await page.evaluate(() => window.__ct.memory);
  assert.equal(heldMemory.tomorrowIntention.nightId, heldMemory.lastCompleted.nightId);
  assert.equal(await page.locator("#tomorrowBtn").isDisabled(), true);
  assert.equal(await page.evaluate(() => globalThis.__notificationRequests), 0);

  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.locator("#beginBtn").isVisible(), true);
  assert.deepEqual(await page.evaluate(() => window.__ct.memory), heldMemory);
  await page.click("#beginBtn");
  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  assert.deepEqual(await page.evaluate(() => window.__ct.memory), heldMemory);

  await context.setOffline(false);
  const portable = await context.newPage();
  const portableErrors = [];
  portable.on("pageerror", (error) => portableErrors.push(error.message));
  await portable.goto(`${artifactBase}nindova.html?review=1`);
  await portable.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await portable.locator('link[rel="manifest"]').count(), 0);
  assert.equal(await portable.evaluate(() => navigator.serviceWorker.controller), null);
  assert.equal(await portable.evaluate(() => Boolean(window.NindovaNight && window.NindovaDawn)), true);
  await portable.click("#beginBtn");
  await portable.waitForFunction(() => window.__ct.state === "arrive");
  assert.deepEqual(await portable.evaluate(() => window.__ct.recipe), firstRecipe);
  assert.deepEqual(portableErrors, []);

  assert.ok(requests.every((url) => new URL(url).origin === new URL(base).origin));
  assert.deepEqual(errors, []);
  console.log("PWA install, migration, offline arc, quiet return, privacy, and standalone-independence checks passed.");
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
  server.kill("SIGTERM");
}
