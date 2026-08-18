import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/rasoi-core.js");
await import("../../apps/session/dist/night-core.js");
await import("../../apps/session/dist/active-session.js");
const Rasoi = globalThis.NindovaRasoi;
const Night = globalThis.NindovaNight;
const Active = globalThis.NindovaActiveSession;

const HARD_CAP_SECONDS = 15 * 60;
const WIND_DOWN_SECONDS = 12 * 60;

const capture = Night.captureNight(new Date("2026-08-03T03:00:00Z"), "America/Chicago");
const board = Rasoi.createBoard(capture.nightId, "gentle");
const startedAtMs = Date.parse(capture.startedAt);

function snapshot(overrides = {}) {
  return {
    version: 4,
    profile: "gentle",
    phase: "play",
    endReason: "completed",
    night: capture,
    boardId: board.id,
    removed: [],
    startedAtMs,
    deadlineAtMs: startedAtMs + HARD_CAP_SECONDS * 1000,
    windDownAtMs: startedAtMs + WIND_DOWN_SECONDS * 1000,
    ...overrides,
  };
}

function decode(value, restoredAtMs = startedAtMs + 1000) {
  return Active.decodeActiveSession(typeof value === "string" ? value : JSON.stringify(value), {
    hardCapSeconds: HARD_CAP_SECONDS,
    windDownSeconds: WIND_DOWN_SECONDS,
    restoredAtMs,
  });
}

test("an untouched Session record is accepted and fully rebuilt", () => {
  const result = decode(snapshot());
  assert.equal(result.status, "accepted");
  assert.equal(result.record.board.id, board.id);
  assert.equal(result.record.night.nightId, capture.nightId);
  assert.equal(result.record.phase, "play");
  assert.equal(result.record.endReason, "completed");
  assert.equal(result.record.removed.size, 0);
  assert.equal(result.record.complete, false);
  assert.equal(result.record.startedAtMs, startedAtMs);
});

test("a Session partway through its board keeps exactly the settled tiles", () => {
  const [first, second] = Rasoi.legalPairs(board, new Set())[0];
  const result = decode(snapshot({ removed: [first, second] }));
  assert.equal(result.status, "accepted");
  assert.deepEqual([...result.record.removed].sort(), [first, second].sort());
});

test("missing and unreadable records start a fresh Night rather than throwing", () => {
  assert.equal(Active.decodeActiveSession(null, { hardCapSeconds: HARD_CAP_SECONDS, windDownSeconds: WIND_DOWN_SECONDS, restoredAtMs: startedAtMs }).status, "empty");
  assert.equal(decode("not json").status, "rejected");
  assert.equal(decode("not json").reason, "unreadable");
});

test("hostile stored state is refused rather than thrown, so the Night Room still opens", () => {
  // The Session surface calls this at start-up; an escaped throw would leave the
  // Night Room unopenable, which is worse than starting fresh.
  const hostile = [
    "null", "[]", "0", '"a string"', "{}", '{"version":4}', "[[[[[]]]]]",
    JSON.stringify({ ...snapshot(), night: null }),
    JSON.stringify({ ...snapshot(), removed: [{}, []] }),
    JSON.stringify({ ...snapshot(), night: { nightId: "x".repeat(500) } }),
    JSON.stringify({ ...snapshot(), profile: { nested: true } }),
    JSON.stringify({ ...snapshot(), removed: Array.from({ length: 500 }, (_, index) => `tile-${index}`) }),
  ];
  for (const raw of hostile) {
    const result = decode(raw);
    assert.equal(result.status, "rejected", `refused rather than accepted: ${raw.slice(0, 40)}`);
    assert.ok(typeof result.reason === "string" && result.reason.length > 0);
  }
});

test("a record from another schema, profile, phase, or ending is refused", () => {
  assert.equal(decode(snapshot({ version: 3 })).reason, "schema");
  assert.equal(decode(snapshot({ profile: "impossible" })).reason, "schema");
  assert.equal(decode(snapshot({ phase: "rest" })).reason, "schema");
  assert.equal(decode(snapshot({ endReason: "abandoned" })).reason, "schema");
  assert.equal(decode(snapshot({ removed: "everything" })).reason, "schema");
  assert.equal(decode(snapshot({ night: { ...capture, dawnDate: "2026-08-09" } })).reason, "schema");
});

test("a board identity that does not re-derive is refused", () => {
  // Unreachable from the browser suite today: proves a stored Session cannot be
  // replayed onto a different Masala Mound than the one it was played on.
  assert.equal(decode(snapshot({ boardId: "rasoi-r5-gentle-tampered" })).reason, "board-identity");
  assert.equal(decode(snapshot({ profile: "deeper" })).reason, "board-identity");
});

test("unknown, repeated, and non-text settled tiles are refused", () => {
  const [first, second] = Rasoi.legalPairs(board, new Set())[0];
  assert.equal(decode(snapshot({ removed: ["not-a-tile"] })).reason, "settled-tiles");
  assert.equal(decode(snapshot({ removed: [first, first] })).reason, "settled-tiles");
  assert.equal(decode(snapshot({ removed: [first, 7] })).reason, "settled-tiles");
  assert.equal(decode(snapshot({ removed: [first, second, first] })).reason, "settled-tiles");
});

test("a settled set that no legal play could reach is refused", () => {
  const covered = board.tiles.filter((tile) => Rasoi.availabilityReason(board, new Set(), tile.id) === "covered");
  assert.ok(covered.length >= 2, "the Gentle stack must hide tiles under its upper layer");
  assert.equal(decode(snapshot({ removed: [covered[0].id, covered[1].id] })).reason, "unreachable");
});

test("a phase that contradicts its ending is refused", () => {
  assert.equal(decode(snapshot({ phase: "play", endReason: "production-cap" })).reason, "settlement");
  assert.equal(decode(snapshot({ phase: "settling", endReason: "completed" })).reason, "settlement");
});

test("a Session settling under the lid is accepted without a finished board", () => {
  const result = decode(snapshot({ phase: "settling", endReason: "production-cap" }));
  assert.equal(result.status, "accepted");
  assert.equal(result.record.phase, "settling");
  assert.equal(result.record.complete, false);
});

test("a clock that drifted, was rewritten, or arrived non-finite is refused", () => {
  // Unreachable from the browser suite today.
  assert.equal(decode(snapshot({ startedAtMs: Number.NaN })).reason, "clock");
  assert.equal(decode(snapshot({ deadlineAtMs: "soon" })).reason, "clock");
  assert.equal(decode(snapshot({ windDownAtMs: Number.POSITIVE_INFINITY })).reason, "clock");
  assert.equal(decode(snapshot({ startedAtMs: startedAtMs + 1 })).reason, "clock");
  assert.equal(decode(snapshot({ deadlineAtMs: startedAtMs + 60_000 })).reason, "clock");
  assert.equal(decode(snapshot({ windDownAtMs: startedAtMs + 60_000 })).reason, "clock");
});

test("a Session whose cap has already passed still decodes, so its Night can be recorded", () => {
  // Deliberately accepted rather than refused: the person really played this
  // Night, and the Session surface closes it immediately and records the
  // completion. Refusing it here would discard a Dawn keepsake instead.
  const staleAt = startedAtMs + 40 * 60 * 1000;
  const settling = decode(snapshot({ phase: "settling", endReason: "production-cap" }), staleAt);
  assert.equal(settling.status, "accepted");
  assert.equal(settling.record.phase, "settling");
  const open = decode(snapshot(), staleAt);
  assert.equal(open.status, "accepted");
  assert.equal(open.record.deadlineAtMs < staleAt, true, "the cap really is in the past");
});

test("a Session captured far in the future of this device is refused", () => {
  assert.equal(decode(snapshot(), startedAtMs - 60_000).reason, "clock");
  assert.equal(decode(snapshot(), startedAtMs - 4_000).status, "accepted");
});

test("reviewer thresholds decode against their own compressed cap", () => {
  const reviewStarted = startedAtMs;
  const record = {
    ...snapshot(),
    deadlineAtMs: reviewStarted + 120 * 1000,
    windDownAtMs: reviewStarted + 90 * 1000,
  };
  const result = Active.decodeActiveSession(JSON.stringify(record), {
    hardCapSeconds: 120,
    windDownSeconds: 90,
    restoredAtMs: reviewStarted + 1000,
  });
  assert.equal(result.status, "accepted");
  // The same record must not decode against production thresholds.
  assert.equal(decode(record).reason, "clock");
});
