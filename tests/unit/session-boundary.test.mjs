import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/session-boundary.js");
const Boundary = globalThis.NindovaBoundary;

const START = 1_000_000;
const PRODUCTION = Object.freeze({ startedAtMs: START, windDownAtMs: START + 720_000, deadlineAtMs: START + 900_000 });

function outcomeAt(phase, elapsedSeconds, thresholds = PRODUCTION) {
  return Boundary.boundaryOutcome(phase, thresholds.startedAtMs + elapsedSeconds * 1000, thresholds);
}

test("an open Session continues until the wind-down instant", () => {
  assert.equal(outcomeAt("play", 0), "continue");
  assert.equal(outcomeAt("play", 719), "continue");
  assert.equal(outcomeAt("play", 719.999), "continue");
});

test("the wind-down instant closes the board under its lid", () => {
  assert.equal(outcomeAt("play", 720), "settle");
  assert.equal(outcomeAt("play", 899), "settle");
  assert.equal(outcomeAt("play", 900), "settle");
  assert.equal(outcomeAt("play", 5000), "settle");
});

test("a settling Session cannot outlive the hard cap", () => {
  // Regression: settling had no boundary branch, so a Session that failed to
  // finish stayed open past the fifteen-minute product cap forever.
  assert.equal(outcomeAt("settling", 0), "continue");
  assert.equal(outcomeAt("settling", 899), "continue");
  assert.equal(outcomeAt("settling", 900), "rest");
  assert.equal(outcomeAt("settling", 100_000), "rest");
});

test("the end card and Drift return to Rest at the hard cap", () => {
  for (const phase of ["end", "drift"]) {
    assert.equal(outcomeAt(phase, 0), "continue");
    assert.equal(outcomeAt(phase, 899), "continue");
    assert.equal(outcomeAt(phase, 900), "rest");
  }
});

test("quiet phases are never forced anywhere", () => {
  for (const phase of ["intake", "dismissed", "rest", "dawn"]) {
    assert.equal(outcomeAt(phase, 0), "continue");
    assert.equal(outcomeAt(phase, 100_000), "continue");
  }
});

test("reviewer thresholds compress duration without changing the order of outcomes", () => {
  const review = { startedAtMs: 5_000, windDownAtMs: 5_000 + 90_000, deadlineAtMs: 5_000 + 120_000 };
  assert.equal(outcomeAt("play", 89, review), "continue");
  assert.equal(outcomeAt("play", 90, review), "settle");
  assert.equal(outcomeAt("settling", 119, review), "continue");
  assert.equal(outcomeAt("settling", 120, review), "rest");
  assert.equal(outcomeAt("end", 120, review), "rest");
});

test("an out-of-order threshold pair still closes the Session at the earliest bound", () => {
  // Equivalent to the original `now >= deadline || now >= windDown` disjunction,
  // so a corrupted or reordered pair can never leave play unbounded.
  const reversed = { startedAtMs: 0, windDownAtMs: 900_000, deadlineAtMs: 720_000 };
  assert.equal(outcomeAt("play", 719, reversed), "continue");
  assert.equal(outcomeAt("play", 720, reversed), "settle");
});

test("a non-finite instant or threshold never closes a Session by accident", () => {
  assert.equal(Boundary.boundaryOutcome("play", Number.NaN, PRODUCTION), "continue");
  assert.equal(Boundary.boundaryOutcome("play", PRODUCTION.deadlineAtMs, { startedAtMs: 0, windDownAtMs: Number.NaN, deadlineAtMs: Number.NaN }), "continue");
});
