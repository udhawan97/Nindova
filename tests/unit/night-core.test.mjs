import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/night-core.js");
const Night = globalThis.NindovaNight;

const chicagoBeforeNoon = Night.captureNight(new Date("2026-08-02T16:59:00Z"), "America/Chicago");
const chicagoAtNoon = Night.captureNight(new Date("2026-08-02T17:00:00Z"), "America/Chicago");

test("night capture switches Dawn date at local noon", () => {
  assert.deepEqual(chicagoBeforeNoon, {
    nightId: "2026-08-02|America/Chicago|r1",
    dawnDate: "2026-08-02",
    timeZone: "America/Chicago",
    recipeVersion: 1,
    startedAt: "2026-08-02T16:59:00.000Z",
  });
  assert.deepEqual(chicagoAtNoon, {
    nightId: "2026-08-03|America/Chicago|r1",
    dawnDate: "2026-08-03",
    timeZone: "America/Chicago",
    recipeVersion: 1,
    startedAt: "2026-08-02T17:00:00.000Z",
  });
  assert.equal(Object.isFrozen(chicagoAtNoon), true);
});

test("DST fallback does not split one local night", () => {
  const first = Night.captureNight(new Date("2026-11-01T06:30:00Z"), "America/Chicago");
  const second = Night.captureNight(new Date("2026-11-01T07:30:00Z"), "America/Chicago");
  assert.equal(first.nightId, "2026-11-01|America/Chicago|r1");
  assert.equal(second.nightId, first.nightId);
});

test("PRNG parity vector is stable", () => {
  const random = Night.createPrng("parity-v1");
  assert.deepEqual(
    Array.from({ length: 5 }, () => random()),
    [0.5748063018545508, 0.29486549459397793, 0.5327974210958928, 0.37433884968049824, 0.0510505260899663],
  );
});

test("representative night recipes are stable", () => {
  assert.deepEqual(Night.recipeForNight("2026-08-03|America/Chicago|r1"), {
    version: 1,
    weather: "soft-monsoon",
    moon: "veiled",
    objectKinds: ["photo", "leaf", "letter", "watch", "coin"],
    meadowSpecies: ["rabbit", "sheep", "tortoise", "goose"],
    harborBoats: ["skiff", "tug"],
    meadowAccent: "saffron",
    harborPaint: "indigo",
  });
  assert.deepEqual(Night.recipeForNight("2026-08-03|Asia/Kolkata|r1"), {
    version: 1,
    weather: "still-haze",
    moon: "veiled",
    objectKinds: ["key", "pencil", "letter", "watch", "spool"],
    meadowSpecies: ["sheep", "tortoise", "goose", "rabbit"],
    harborBoats: ["tug", "skiff"],
    meadowAccent: "marigold",
    harborPaint: "marigold",
  });
});

test("missing, stale, and corrupt state recover without throwing", () => {
  assert.deepEqual(Night.decodeState(null), {
    state: { version: 2, lastCompleted: null, meadowEcho: null, harborEchoes: [], tomorrowIntention: null },
    recovered: false,
    reason: "missing",
  });
  assert.equal(Night.decodeState("not json").reason, "corrupt");
  assert.equal(Night.decodeState('{"version":99}').reason, "unsupported");
});

function completion(nightId, vista, finalKind) {
  return {
    nightId,
    dawnDate: nightId.slice(0, 10),
    timeZone: "America/Chicago",
    recipeVersion: 1,
    vista,
    finalKind,
  };
}

test("same-night completion is idempotent and meadow keeps one Echo", () => {
  const first = Night.completeState(Night.emptyState(), completion("2026-08-03-a", "meadow", "rabbit"));
  assert.equal(first.changed, true);
  assert.deepEqual(first.state.meadowEcho, { nightId: "2026-08-03-a", kind: "rabbit" });
  const replay = Night.completeState(first.state, completion("2026-08-03-a", "meadow", "sheep"));
  assert.equal(replay.changed, false);
  assert.deepEqual(replay.state, first.state);
  const next = Night.completeState(replay.state, completion("2026-08-04-b", "meadow", "sheep"));
  assert.deepEqual(next.state.meadowEcho, { nightId: "2026-08-04-b", kind: "sheep" });
});

test("v1 state migrates once and keeps its bounded memory", () => {
  const legacy = {
    version: 1,
    lastCompleted: {
      ...completion("2026-08-03-a", "meadow", "rabbit"),
      startedAt: "2026-08-03T02:00:00.000Z",
      completedAt: "2026-08-03T03:00:00.000Z",
    },
    meadowEcho: { nightId: "2026-08-03-a", kind: "rabbit" },
    harborEchoes: [],
  };
  const values = new Map([[Night.LEGACY_STORAGE_KEY, JSON.stringify(legacy)]]);
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); },
  };
  const result = Night.readStorage(storage);
  assert.equal(result.reason, "migrated");
  assert.equal(result.state.version, 2);
  assert.deepEqual(result.state.meadowEcho, legacy.meadowEcho);
  assert.equal(values.has(Night.LEGACY_STORAGE_KEY), false);
  assert.equal(values.has(Night.STORAGE_KEY), true);
  assert.equal(values.get(Night.STORAGE_KEY).includes("startedAt"), false);
  assert.equal(values.get(Night.STORAGE_KEY).includes("completedAt"), false);
});

test("current state sanitization removes persisted interaction timestamps", () => {
  const raw = {
    version: 2,
    lastCompleted: {
      ...completion("2026-08-03-a", "meadow", "rabbit"),
      startedAt: "2026-08-03T02:00:00.000Z",
      completedAt: "2026-08-03T03:00:00.000Z",
    },
    meadowEcho: null,
    harborEchoes: [],
    tomorrowIntention: { nightId: "2026-08-03-a", heldAt: "2026-08-03T03:05:00.000Z" },
  };
  const values = new Map([[Night.STORAGE_KEY, JSON.stringify(raw)]]);
  const storage = {
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) { values.set(key, value); },
  };
  const result = Night.readStorage(storage);
  assert.deepEqual(result.state.tomorrowIntention, { nightId: "2026-08-03-a" });
  const persisted = values.get(Night.STORAGE_KEY);
  assert.equal(persisted.includes("startedAt"), false);
  assert.equal(persisted.includes("completedAt"), false);
  assert.equal(persisted.includes("heldAt"), false);
});

test("tomorrow intention is quiet, completion-bound, and idempotent", () => {
  const completed = Night.completeState(
    Night.emptyState(),
    completion("2026-08-03-a", "meadow", "rabbit"),
  ).state;
  const rejected = Night.setTomorrowIntention(completed, "another-night");
  assert.equal(rejected.changed, false);
  const held = Night.setTomorrowIntention(completed, "2026-08-03-a");
  assert.equal(held.changed, true);
  assert.deepEqual(held.state.tomorrowIntention, {
    nightId: "2026-08-03-a",
  });
  assert.equal(Night.setTomorrowIntention(held.state, "2026-08-03-a").changed, false);
  const next = Night.completeState(held.state, completion("2026-08-04-b", "harbor", "skiff")).state;
  assert.equal(next.tomorrowIntention, null);
});

test("harbor keeps five boats and skipped dates do not mutate memory", () => {
  let state = Night.emptyState();
  for (let index = 1; index <= 6; index += 1) {
    state = Night.completeState(
      state,
      completion(`2026-08-${String(index).padStart(2, "0")}-h`, "harbor", index % 2 ? "skiff" : "tug"),
    ).state;
  }
  assert.equal(state.harborEchoes.length, 5);
  assert.equal(state.harborEchoes[0].nightId, "2026-08-02-h");
  const unchanged = Night.decodeState(JSON.stringify(state)).state;
  assert.deepEqual(unchanged.harborEchoes, state.harborEchoes);
});

test("storage failures fail open", () => {
  const unavailable = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("blocked");
    },
  };
  assert.equal(Night.readStorage(unavailable).reason, "unavailable");
  assert.equal(Night.writeStorage(unavailable, Night.emptyState()), false);
});
