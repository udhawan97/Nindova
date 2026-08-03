import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

await import("../../apps/session/dist/night-core.js");
const Night = globalThis.NindovaNight;
const root = resolve(import.meta.dirname, "../..");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
const activeSessionKey = "nindova:active-session:v3";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
const page = await context.newPage();
const errors = [];
page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.evaluate(() => localStorage.setItem(NindovaNight.STORAGE_KEY, "{broken"));
  await page.reload();
  assert.deepEqual(await page.evaluate(() => window.__ct.localRecovery), { recovered: true, reason: "corrupt" });
  await page.evaluate(() => localStorage.removeItem(NindovaNight.STORAGE_KEY));
  await page.reload();

  await page.click("#notNowBtn");
  assert.equal(await page.locator("#dismissed").isVisible(), true);
  await page.click("#returnBtn");
  assert.equal(await page.locator("#beginBtn").isVisible(), true);

  await page.click("#beginBtn");
  const started = await page.evaluate(() => ({ night: window.__ct.night, board: window.__ct.board }));
  const firstPair = await page.evaluate(() => window.__ct.legalPairs[0]);
  await page.evaluate((pair) => { window.__ct.selectTile(pair[0]); window.__ct.selectTile(pair[1]); }, firstPair);
  assert.equal(await page.evaluate(() => window.__ct.removedTileCount), 2);

  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  assert.equal(await page.evaluate(() => window.__ct.removedTileCount), 2);
  assert.equal(await page.evaluate(() => window.__ct.board.id), started.board.id);

  const validActiveRecord = await page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey);
  assert.equal(JSON.parse(validActiveRecord).phase, "play");
  const futureRecord = JSON.parse(validActiveRecord);
  futureRecord.startedAtMs += 86_400_000;
  futureRecord.windDownAtMs += 86_400_000;
  futureRecord.deadlineAtMs += 86_400_000;
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem("nindova:test:future-clock-injected")) {
      sessionStorage.setItem(key, value);
      sessionStorage.setItem("nindova:test:future-clock-injected", "1");
    }
  }, { key: activeSessionKey, value: JSON.stringify(futureRecord) });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.evaluate(() => window.__ct.state), "intake");
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey), null);

  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, value), { key: activeSessionKey, value: validActiveRecord });
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  const corruptNightRecord = JSON.parse(validActiveRecord);
  delete corruptNightRecord.night.dawnDate;
  delete corruptNightRecord.night.timeZone;
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem("nindova:test:invalid-night-injected")) {
      sessionStorage.setItem(key, value);
      sessionStorage.setItem("nindova:test:invalid-night-injected", "1");
    }
  }, { key: activeSessionKey, value: JSON.stringify(corruptNightRecord) });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.evaluate(() => window.__ct.state), "intake");
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey), null);

  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, value), { key: activeSessionKey, value: validActiveRecord });
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  const unreachableRecord = JSON.parse(validActiveRecord);
  unreachableRecord.removed = ["t-1", "t-2"];
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem("nindova:test:unreachable-state-injected")) {
      sessionStorage.setItem(key, value);
      sessionStorage.setItem("nindova:test:unreachable-state-injected", "1");
    }
  }, { key: activeSessionKey, value: JSON.stringify(unreachableRecord) });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.evaluate(() => window.__ct.state), "intake");
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey), null);

  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, value), { key: activeSessionKey, value: validActiveRecord });
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  const impossibleSettlement = JSON.parse(validActiveRecord);
  impossibleSettlement.phase = "settling";
  impossibleSettlement.endReason = "completed";
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem("nindova:test:impossible-settlement-injected")) {
      sessionStorage.setItem(key, value);
      sessionStorage.setItem("nindova:test:impossible-settlement-injected", "1");
    }
  }, { key: activeSessionKey, value: JSON.stringify(impossibleSettlement) });
  await page.reload();
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.evaluate(() => window.__ct.state), "intake");
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey), null);

  await page.evaluate(({ key, value }) => sessionStorage.setItem(key, value), { key: activeSessionKey, value: validActiveRecord });
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  await page.evaluate(() => {
    while (window.__ct.state === "play") {
      const pair = window.__ct.legalPairs[0];
      window.__ct.selectTile(pair[0]);
      window.__ct.selectTile(pair[1]);
    }
    location.reload();
  }).catch(() => {});
  await page.waitForFunction(() => window.__ct.state === "end");
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey), null);
  const firstMemory = await page.evaluate(() => window.__ct.memory);
  assert.equal(firstMemory.lastCompleted.kind, "rasoi-pairs");
  assert.equal(firstMemory.lastCompleted.boardId, started.board.id);
  assert.equal(JSON.stringify(firstMemory).includes("startedAt"), false);
  assert.equal(JSON.stringify(firstMemory).includes("completedAt"), false);

  await page.reload();
  await page.click("#beginBtn");
  const replay = await page.evaluate(() => ({ night: window.__ct.night, board: window.__ct.board }));
  assert.equal(replay.night.nightId, started.night.nightId);
  assert.equal(replay.board.id, started.board.id);
  assert.deepEqual(replay.board.motifOrder, started.board.motifOrder);
  await page.evaluate(() => window.__ct.finish());
  await page.waitForFunction(() => window.__ct.state === "end");
  assert.deepEqual(await page.evaluate(() => window.__ct.memory), firstMemory);
  assert.deepEqual(Object.keys(firstMemory).sort(), ["lastCompleted", "legacyMemory", "tomorrowIntention", "version"]);
  assert.deepEqual(errors, []);
  assert.equal(Night.SCHEMA_VERSION, 3);
  console.log("Rasoi dismissal return, strict clock-bound resume, deterministic replay, and idempotent local memory checks passed.");
} finally {
  await context.close();
  await browser.close();
}
