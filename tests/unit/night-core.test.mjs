import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/night-core.js");
const Night = globalThis.NindovaNight;

test("night capture switches Dawn date at local noon and uses recipe two", () => {
  assert.deepEqual(Night.captureNight(new Date("2026-08-02T16:59:00Z"), "America/Chicago"), {
    nightId: "2026-08-02|America/Chicago|r2",
    dawnDate: "2026-08-02",
    timeZone: "America/Chicago",
    recipeVersion: 2,
    startedAt: "2026-08-02T16:59:00.000Z",
  });
  assert.equal(Night.captureNight(new Date("2026-08-02T17:00:00Z"), "America/Chicago").dawnDate, "2026-08-03");
});

test("DST fallback does not split one local night", () => {
  const first = Night.captureNight(new Date("2026-11-01T06:30:00Z"), "America/Chicago");
  const second = Night.captureNight(new Date("2026-11-01T07:30:00Z"), "America/Chicago");
  assert.equal(first.nightId, second.nightId);
});

test("the nightly Rasoi recipe is deterministic", () => {
  const first = Night.recipeForNight("2026-08-03|America/Chicago|r2");
  const replay = Night.recipeForNight("2026-08-03|America/Chicago|r2");
  assert.deepEqual(replay, first);
  assert.equal(first.motifOrder.length, 9);
  assert.equal(new Set(first.motifOrder).size, 9);
});

function rasoiCompletion(nightId = "2026-08-03|America/Chicago|r2") {
  const recipe = Night.recipeForNight(nightId);
  return {
    kind: "rasoi-pairs",
    nightId,
    dawnDate: nightId.slice(0, 10),
    timeZone: "America/Chicago",
    recipeVersion: 2,
    boardId: recipe.boardId,
    motifOrder: recipe.motifOrder,
  };
}

test("missing, stale, and corrupt state recover without throwing", () => {
  assert.deepEqual(Night.decodeState(null), {
    state: { version: 3, lastCompleted: null, legacyMemory: null, tomorrowIntention: null },
    recovered: false,
    reason: "missing",
  });
  assert.equal(Night.decodeState("not json").reason, "corrupt");
  assert.equal(Night.decodeState('{"version":99}').reason, "unsupported");
});

test("same-night completion is idempotent and stores no interaction timing", () => {
  const first = Night.completeState(Night.emptyState(), rasoiCompletion());
  assert.equal(first.changed, true);
  const replay = Night.completeState(first.state, rasoiCompletion());
  assert.equal(replay.changed, false);
  assert.equal(JSON.stringify(replay.state).includes("startedAt"), false);
  assert.equal(JSON.stringify(replay.state).includes("completedAt"), false);
});

test("v2 Dawn data migrates into the v3 union without deleting its source", () => {
  const legacy = {
    version: 2,
    lastCompleted: {
      nightId: "2026-08-03|America/Chicago|r1",
      dawnDate: "2026-08-03",
      timeZone: "America/Chicago",
      recipeVersion: 1,
      vista: "meadow",
      finalKind: "rabbit",
      completedAt: "2026-08-03T03:00:00.000Z",
    },
    meadowEcho: { nightId: "2026-08-03|America/Chicago|r1", kind: "rabbit" },
    harborEchoes: [],
    tomorrowIntention: null,
  };
  const key = Night.LEGACY_STORAGE_KEYS[0];
  const values = new Map([[key, JSON.stringify(legacy)]]);
  const storage = {
    getItem(name) { return values.get(name) ?? null; },
    setItem(name, value) { values.set(name, value); },
  };
  const result = Night.readStorage(storage);
  assert.equal(result.reason, "migrated");
  assert.equal(result.state.version, 3);
  assert.equal(result.state.lastCompleted.kind, "legacy-vista");
  assert.deepEqual(result.state.legacyMemory.meadowEcho, legacy.meadowEcho);
  assert.equal(values.has(key), true);
  assert.equal(values.has(Night.STORAGE_KEY), true);
  assert.equal(values.get(Night.STORAGE_KEY).includes("completedAt"), false);
});

test("tomorrow intention is quiet, completion-bound, and idempotent", () => {
  const completed = Night.completeState(Night.emptyState(), rasoiCompletion()).state;
  assert.equal(Night.setTomorrowIntention(completed, "another-night").changed, false);
  const held = Night.setTomorrowIntention(completed, completed.lastCompleted.nightId);
  assert.equal(held.changed, true);
  assert.equal(Night.setTomorrowIntention(held.state, completed.lastCompleted.nightId).changed, false);
});

test("storage failures fail open", () => {
  const unavailable = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  assert.equal(Night.readStorage(unavailable).reason, "unavailable");
  assert.equal(Night.writeStorage(unavailable, Night.emptyState()), false);
});
