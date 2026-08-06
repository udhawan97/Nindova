import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { chromium } from "playwright";
import publicFacts from "../../public-facts.json" with { type: "json" };

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
  assert.match(publicCopy, /Five doors\.\s+Eight clean endings\./);
  assert.ok(publicCopy.includes("no account · no comparison · no app telemetry"));
  const rootPath = mountPath ? `/${mountPath}/` : "/";
  const landingLinks = {
    house: await page.locator('a.button-primary').first().getAttribute("href"),
    docs: await page.locator('nav a[href$="/docs/"]').first().getAttribute("href"),
    standalone: await page.locator("a[download]").first().getAttribute("href"),
    release: await page.locator('a[href="https://github.com/udhawan97/Nindova/releases"]').first().getAttribute("href"),
  };
  assert.deepEqual(landingLinks, {
    house: `${rootPath}house/`,
    docs: `${rootPath}docs/`,
    standalone: `${rootPath}nindova.html`,
    release: "https://github.com/udhawan97/Nindova/releases",
  });
  for (const image of await page.locator(".brand-lockup, .house-proof img, .sector-proof img, .night-proof img").all()) {
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((element) => element.decode());
  }
  assert.equal(await page.locator(".brand-lockup").count(), 2);
  assert.equal(await page.locator(".table-directory li").count(), 5);
  assert.match(await page.locator('meta[property="og:image"]').getAttribute("content") ?? "", /\/Nindova\/brand\/nindova-og\.png$/);
  for (const href of [landingLinks.house, landingLinks.docs, landingLinks.standalone]) {
    const linkedPage = await context.newPage();
    const response = await linkedPage.goto(new URL(href, prefix).href);
    assert.equal(response?.ok(), true);
    await linkedPage.close();
  }
  const qrPage = await context.newPage();
  await qrPage.setContent(`<img id="qr" src="${new URL(`${rootPath}play-qr.svg`, prefix).href}" alt="">`);
  await qrPage.locator("#qr").waitFor({ state: "visible" });
  const qrPng = PNG.sync.read(await qrPage.locator("#qr").screenshot());
  await qrPage.close();
  const decodedQr = jsQR(new Uint8ClampedArray(qrPng.data), qrPng.width, qrPng.height);
  assert.equal(decodedQr?.data, publicFacts.canonicalPlayUrl);
  for (const licensePath of ["licenses/geist-OFL-1.1.txt", "licenses/newsreader-OFL-1.1.txt"]) {
    const license = await page.evaluate((url) => fetch(url).then(async (response) => ({ ok: response.ok, text: await response.text() })), licensePath);
    assert.equal(license.ok, true);
    assert.match(license.text, /SIL OPEN FONT LICENSE Version 1\.1/);
  }

  const houseBase = `${prefix}house/`;
  const houseContext = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const housePage = await houseContext.newPage();
  const houseErrors = [];
  const houseRequests = [];
  housePage.on("pageerror", (error) => houseErrors.push(error.message));
  housePage.on("console", (message) => { if (message.type() === "error") houseErrors.push(message.text()); });
  housePage.on("request", (request) => houseRequests.push(request.url()));
  await housePage.goto(prefix);
  await housePage.evaluate(async () => {
    const legacy = await caches.open("nindova-house-v3");
    await legacy.put(new Request(`${location.origin}/legacy-house-shell`), new Response("old"));
  });
  await housePage.goto(houseBase);
  await housePage.waitForFunction(() => Boolean(window.__house));
  await housePage.click("#enterHouseButton");
  await housePage.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await housePage.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const houseRegistration = await housePage.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    const keys = await caches.keys();
    const cache = await caches.open("nindova-house-v7");
    return { scope: ready.scope, keys, entries: (await cache.keys()).map((request) => request.url) };
  });
  assert.equal(houseRegistration.scope, houseBase);
  assert.ok(houseRegistration.keys.includes("nindova-house-v7"));
  assert.equal(houseRegistration.keys.includes("nindova-house-v3"), false);
  assert.ok(houseRegistration.entries.length > 0);
  const cachedRunnerSheet = houseRegistration.entries.find((url) => /sector-sprint-characters-.*\.png$/.test(url));
  assert.ok(cachedRunnerSheet, "the original illustrated Sector Sprint sheet is precached");
  assert.ok(houseRegistration.entries.every((url) => url.startsWith(houseBase) && !url.includes("assessment-readiness")));
  assert.equal((await houseContext.request.get(`${houseBase}assessment-readiness.js`)).status(), 404);
  assert.doesNotMatch(await (await houseContext.request.get(`${houseBase}sw.js`)).text(), /assessment-readiness/);
  const houseCdp = await houseContext.newCDPSession(housePage);
  await houseCdp.send("Network.enable");
  await houseCdp.send("Network.clearBrowserCache");
  await housePage.close();
  await houseContext.setOffline(true);
  const coldHouse = await houseContext.newPage();
  const coldHouseResponse = await coldHouse.goto(houseBase);
  assert.equal(coldHouseResponse?.ok(), true);
  await coldHouse.waitForFunction(() => Boolean(window.__house));
  assert.equal(await coldHouse.locator(".game-door").count(), 5);
  const offlineRunnerSheet = await coldHouse.evaluate((source) => new Promise((resolveImage) => {
    const image = new Image();
    image.onload = () => resolveImage({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolveImage({ width: 0, height: 0 });
    image.src = source;
  }), cachedRunnerSheet);
  assert.deepEqual(offlineRunnerSheet, { width: 1_536, height: 1_024 }, "the illustrated character sheet decodes while fully offline");
  await coldHouse.evaluate(() => window.__house.start("sector-sprint"));
  await coldHouse.click('[data-runner-route="action"]');
  await coldHouse.waitForSelector("#runnerCanvas");
  await coldHouse.waitForFunction(() => document.querySelector("#runnerCanvas")?.dataset.art === "illustrated");
  assert.equal(await coldHouse.locator("#runnerCanvas").isVisible(), true, "the offline House enters the action route");
  assert.ok(houseRequests.every((url) => new URL(url).origin === new URL(houseBase).origin));
  assert.deepEqual(houseErrors, []);
  await houseContext.setOffline(false);
  await houseContext.close();

  await page.evaluate(async () => {
    const legacy = await caches.open("nindova-session-v3");
    await legacy.put(new Request(`${location.origin}/legacy-shell`), new Response("old"));
    localStorage.setItem("nindova:test:update-sentinel", "kept");
  });

  await page.goto(`${base}?review=1`);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.match(await page.locator("body").innerText(), /Nothing to win\. Nothing tracked\. Nothing you can do wrong\./);
  assert.equal(await page.getAttribute('link[rel="manifest"]', "href"), "./manifest.webmanifest");
  const manifest = await page.evaluate(() => fetch("./manifest.webmanifest").then((response) => response.json()));
  assert.deepEqual({ start_url: manifest.start_url, scope: manifest.scope, display: manifest.display }, { start_url: "./", scope: "./", display: "standalone" });
  assert.deepEqual(manifest.icons.map((icon) => icon.purpose), ["any", "any", "any", "maskable"]);
  assert.equal(await page.evaluate(async (icons) => (
    await Promise.all(icons.map((icon) => fetch(icon.src)))
  ).every((response) => response.ok), manifest.icons), true);
  await page.waitForFunction(async () => Boolean(await navigator.serviceWorker.ready));
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const registration = await page.evaluate(async () => {
    const ready = await navigator.serviceWorker.ready;
    const keys = await caches.keys();
    const cache = await caches.open("nindova-session-v5");
    return { scope: ready.scope, keys, entries: (await cache.keys()).map((request) => request.url) };
  });
  assert.equal(registration.scope, base);
  assert.ok(registration.keys.includes("nindova-session-v5"));
  assert.equal(registration.keys.includes("nindova-session-v3"), false);
  assert.ok(registration.entries.every((url) => url.startsWith(base) && !url.includes("night-state") && !url.startsWith("blob:")));
  assert.equal(await page.evaluate(() => localStorage.getItem("nindova:test:update-sentinel")), "kept");

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
  await page.waitForFunction(() => window.__ct.state === "rest");
  assert.equal(await page.evaluate(() => window.__ct.endReason), "production-cap");
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "intake");
  await page.click("#beginBtn");
  await page.evaluate(() => window.__ct.finish());
  await page.waitForFunction(() => window.__ct.state === "end");
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
  console.log("House base-path cache migration/cold offline plus Rasoi PWA update, QR, license, resume, denied audio, offline closure, privacy, and standalone checks passed.");
} finally {
  await context.setOffline(false).catch(() => {});
  await context.close();
  await browser.close();
  server.kill("SIGTERM");
}
