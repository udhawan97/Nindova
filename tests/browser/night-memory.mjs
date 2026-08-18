import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";

await import("../../apps/session/dist/night-core.js");
const Night = globalThis.NindovaNight;
const root = resolve(import.meta.dirname, "../..");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
const activeSessionKey = "nindova:active-session:v4";
const legacyActiveSessionKey = "nindova:active-session:v3";
const harness = await createBrowserEvidenceHarness();
const { context, page, errors } = await harness.open({ contextOptions: { viewport: { width: 375, height: 812 } } });

try {
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.evaluate(() => localStorage.setItem(NindovaNight.STORAGE_KEY, "{broken"));
  await page.reload();
  await page.evaluate((key) => sessionStorage.setItem(key, "{stale"), legacyActiveSessionKey);
  await page.reload();
  assert.equal(await page.evaluate((key) => sessionStorage.getItem(key), legacyActiveSessionKey), null);
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
  assert.deepEqual(
    { version: JSON.parse(validActiveRecord).version, phase: JSON.parse(validActiveRecord).phase, profile: JSON.parse(validActiveRecord).profile },
    { version: 4, phase: "play", profile: "gentle" },
  );
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
  const invalidProfileRecord = JSON.parse(validActiveRecord);
  invalidProfileRecord.profile = "expert";
  await page.addInitScript(({ key, value }) => {
    if (!sessionStorage.getItem("nindova:test:invalid-profile-injected")) {
      sessionStorage.setItem(key, value);
      sessionStorage.setItem("nindova:test:invalid-profile-injected", "1");
    }
  }, { key: activeSessionKey, value: JSON.stringify(invalidProfileRecord) });
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

  await page.reload();
  await page.check('input[name="rasoi-profile"][value="deeper"]');
  await page.click("#beginBtn");
  const deeperBoardId = await page.evaluate(() => window.__ct.board.id);
  const deeperPair = await page.evaluate(() => window.__ct.legalPairs[0]);
  await page.evaluate((pair) => { window.__ct.selectTile(pair[0]); window.__ct.selectTile(pair[1]); }, deeperPair);
  await page.reload();
  await page.waitForFunction(() => window.__ct.state === "play");
  assert.equal(await page.evaluate(() => window.__ct.board.profile), "deeper");
  assert.equal(await page.evaluate(() => window.__ct.board.id), deeperBoardId);
  assert.equal(await page.evaluate(() => window.__ct.removedTileCount), 2);
  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  await page.waitForFunction(() => window.__ct.state === "rest");

  // A Session that was already settling when its tab went away must still record
  // its Night when it resumes past the cap. Cancelling that final response would
  // silently cost the person their Dawn and leave the record poisoning the tab.
  //
  // This runs at PRODUCTION timings deliberately. The reviewer cut settles in
  // 80ms and would beat the one-second boundary tick, hiding the race; at the
  // real 1300ms the tick lands first, which is the case that must stay correct.
  const staleSettling = await harness.open({
    contextOptions: { viewport: { width: 375, height: 812 } },
    target: pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href,
  });
  await staleSettling.page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await staleSettling.page.evaluate(() => window.__ct.hardCapSeconds), 900);
  await staleSettling.page.evaluate((key) => {
    localStorage.clear();
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const night = NindovaNight.captureNight(new Date(Date.now() - 40 * 60 * 1000), zone);
    const board = NindovaRasoi.createBoard(night.nightId, "gentle");
    const startedAtMs = Date.parse(night.startedAt);
    sessionStorage.setItem(key, JSON.stringify({
      version: 4,
      profile: "gentle",
      phase: "settling",
      endReason: "production-cap",
      night,
      boardId: board.id,
      removed: [],
      startedAtMs,
      deadlineAtMs: startedAtMs + 900_000,
      windDownAtMs: startedAtMs + 720_000,
    }));
  }, activeSessionKey);
  await staleSettling.page.reload();
  await staleSettling.page.waitForFunction(() => window.__ct.state === "rest");
  assert.equal(
    await staleSettling.page.evaluate(() => window.__ct.memory.lastCompleted?.kind ?? null),
    "rasoi-pairs",
    "a resumed settling Session must record its Night before Rest",
  );
  assert.equal(
    await staleSettling.page.evaluate((key) => sessionStorage.getItem(key), activeSessionKey),
    null,
    "a resumed settling Session must clear its stored record, or the tab stays poisoned",
  );
  // NOT asserted here, deliberately: that entering Rest cancels the pending
  // settlement. Removing that cancel changes nothing observable — the stale timer
  // calls finishSession, which calls scheduleRest, which past the deadline re-enters
  // Rest synchronously in the same turn, so no paint and no state sample can catch
  // it. The cancel is defence in depth and is guarded by a source assertion in
  // tests/unit/session-architecture.test.mjs instead of a test that would pass
  // whether or not it were there.
  assert.deepEqual(staleSettling.errors, []);
  await staleSettling.context.close();

  assert.deepEqual(errors, []);
  assert.equal(Night.SCHEMA_VERSION, 3);
  console.log("Rasoi dismissal return, strict clock-bound resume, deterministic replay, and idempotent local memory checks passed.");
} finally {
  await harness.close();
}
