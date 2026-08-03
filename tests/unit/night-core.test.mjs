import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/night-core.js");
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
    state: { version: 1, lastCompleted: null, meadowEcho: null, harborEchoes: [] },
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
    startedAt: `${nightId.slice(0, 10)}T02:00:00.000Z`,
    vista,
    finalKind,
    completedAt: `${nightId.slice(0, 10)}T03:00:00.000Z`,
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
