import assert from "node:assert/strict";
import test from "node:test";
import { recipeTwoCompletion } from "../fixtures/recipe-two.mjs";

await import("../../apps/session/dist/rasoi-core.js");
await import("../../apps/session/dist/night-core.js");
const Night = globalThis.NindovaNight;
const Rasoi = globalThis.NindovaRasoi;

test("night capture switches Dawn date at local noon and uses recipe three", () => {
  assert.deepEqual(Night.captureNight(new Date("2026-08-02T16:59:00Z"), "America/Chicago"), {
    nightId: "2026-08-02|America/Chicago|r3",
    dawnDate: "2026-08-02",
    timeZone: "America/Chicago",
    recipeVersion: 3,
    startedAt: "2026-08-02T16:59:00.000Z",
  });
  assert.equal(Night.captureNight(new Date("2026-08-02T17:00:00Z"), "America/Chicago").dawnDate, "2026-08-03");
});

test("DST fallback does not split one local night", () => {
  const first = Night.captureNight(new Date("2026-11-01T06:30:00Z"), "America/Chicago");
  const second = Night.captureNight(new Date("2026-11-01T07:30:00Z"), "America/Chicago");
  assert.equal(first.nightId, second.nightId);
});

test("active-session Night captures are fully validated and normalized", () => {
  const capture = Night.captureNight(new Date("2026-08-03T03:00:00Z"), "America/Chicago");
  assert.deepEqual(Night.sanitizeCapture(capture), capture);
  assert.equal(Night.sanitizeCapture({ ...capture, dawnDate: "2026-08-04" }), null);
  assert.equal(Night.sanitizeCapture({ ...capture, timeZone: "Not/AZone" }), null);
  assert.equal(Night.sanitizeCapture({ ...capture, startedAt: "not-an-instant" }), null);
  assert.equal(Night.sanitizeCapture({ nightId: capture.nightId }), null);
});

/** Built exactly as `finishSession` writes a completed Night. */
function rasoiCompletion(nightId = "2026-08-03|America/Chicago|r3", profile = "gentle") {
  const board = Rasoi.createBoard(nightId, profile);
  return {
    kind: "rasoi-pairs",
    nightId,
    dawnDate: nightId.slice(0, 10),
    timeZone: "America/Chicago",
    recipeVersion: Night.RECIPE_VERSION,
    boardId: board.id,
    motifOrder: board.motifOrder,
  };
}

test("the completion a finished Session actually writes survives the round trip", () => {
  for (const profile of ["gentle", "deeper"]) {
    const completion = rasoiCompletion("2026-08-03|America/Chicago|r3", profile);
    const stored = Night.completeState(Night.emptyState(), completion);
    assert.equal(stored.changed, true);
    assert.deepEqual(stored.state.lastCompleted, { ...completion, motifOrder: [...completion.motifOrder] });
  }
});

// An independent witness. `night-core` now derives its vocabulary from
// `rasoi-core`, so comparing the two would be a tautology: a change to the board
// would silently invalidate every stored Dawn keepsake with a green suite. These
// nine ids are written out so that change has to be made here, deliberately.
const KITCHEN_FORMS = ["belan", "chakla", "tawa", "chimta", "katori", "tiffin", "masala", "chai", "cooker"];

test("the nine kitchen forms are fixed, because stored Dawn keepsakes depend on them", () => {
  assert.deepEqual([...Rasoi.RASOI_MOTIFS.map((motif) => motif.id)].sort(), [...KITCHEN_FORMS].sort());
  const completion = rasoiCompletion();
  assert.deepEqual([...completion.motifOrder].sort(), [...KITCHEN_FORMS].sort());
});

test("local memory validates completions against the one Masala Mound vocabulary", () => {
  const completion = rasoiCompletion();
  assert.equal(completion.motifOrder.length, KITCHEN_FORMS.length);
  const foreign = { ...completion, motifOrder: [...completion.motifOrder.slice(0, -1), "samovar"] };
  assert.throws(() => Night.completeState(Night.emptyState(), foreign), TypeError);
  assert.equal(
    Night.decodeState(JSON.stringify({ ...Night.emptyState(), lastCompleted: foreign })).state.lastCompleted,
    null,
  );
});

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

test("recipe-two Rasoi completion remains available after the layered recipe upgrade", () => {
  const values = new Map([[Night.STORAGE_KEY, JSON.stringify({
    ...Night.emptyState(),
    lastCompleted: recipeTwoCompletion,
  })]]);
  const storage = {
    getItem(name) { return values.get(name) ?? null; },
    setItem(name, value) { values.set(name, value); },
  };
  const restored = Night.readStorage(storage);
  assert.equal(restored.reason, "ok");
  assert.deepEqual(restored.state.lastCompleted, { ...recipeTwoCompletion, motifOrder: [...recipeTwoCompletion.motifOrder] });
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
