import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/rasoi-core.js");
const Rasoi = globalThis.NindovaRasoi;

test("Rasoi board has thirty-six tiles and four of every kitchen motif", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  assert.equal(board.tiles.length, 36);
  const counts = Object.groupBy(board.tiles, (tile) => tile.motif);
  for (const motif of Rasoi.RASOI_MOTIFS) assert.equal(counts[motif.id].length, 4);
  assert.deepEqual(
    [0, 1, 2].map((layer) => board.tiles.filter((tile) => tile.layer === layer).length),
    [24, 8, 4],
  );
});

test("only uncovered tiles with an open side are free and they form three readable pairs", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const removed = new Set();
  assert.deepEqual(Rasoi.freeTiles(board, removed).map((tile) => tile.id), [
    "b0-5", "b1-5", "b2-0", "b3-0", "t-0", "t-3",
  ]);
  assert.equal(Rasoi.legalPairs(board, removed).length, 3);
  assert.equal(Rasoi.availabilityReason(board, removed, "b0-0"), "covered");
  assert.equal(Rasoi.availabilityReason(board, removed, "t-1"), "side-blocked");
  assert.equal(Rasoi.availabilityReason(board, removed, "t-0"), "free");
  const availability = Object.groupBy(board.tiles, (tile) => Rasoi.availabilityReason(board, removed, tile.id));
  assert.deepEqual(
    { covered: availability.covered.length, sideBlocked: availability["side-blocked"].length, free: availability.free.length },
    { covered: 28, sideBlocked: 2, free: 6 },
  );
});

test("a legal pair settles synchronously and changes layered availability", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const before = new Set(Rasoi.freeTiles(board, new Set()).map((tile) => tile.id));
  const result = Rasoi.removePair(board, new Set(), "b1-5", "b2-0");
  assert.equal(result.changed, true);
  assert.equal(result.removed.has("b1-5"), true);
  assert.equal(result.removed.has("b2-0"), true);
  assert.equal(Rasoi.availabilityReason(board, result.removed, "b1-5"), "removed");
  assert.notDeepEqual(new Set(Rasoi.freeTiles(board, result.removed).map((tile) => tile.id)), before);
});

test("active-session removal state accepts only reachable legal histories", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const first = Rasoi.removePair(board, new Set(), "b1-5", "b2-0").removed;
  assert.equal(Rasoi.isReachableState(board, new Set()), true);
  assert.equal(Rasoi.isReachableState(board, first), true);
  assert.equal(Rasoi.isReachableState(board, new Set(["t-1", "t-2"])), false);
  assert.equal(Rasoi.isReachableState(board, new Set(["not-a-tile"])), false);
});

test("an exhaustive reachability check finds no dead state after any legal choice", () => {
  for (const nightId of [
    "2026-08-04|America/Chicago|r3",
    "2026-11-01|America/Chicago|r3",
    "2026-08-04|Asia/Kolkata|r3",
  ]) {
    const verification = Rasoi.verifyBoard(Rasoi.createBoard(nightId));
    assert.equal(verification.valid, true);
    assert.equal(verification.deadStates, 0);
    assert.equal(verification.terminalStates, 1);
    assert.equal(verification.reachableStates, 382);
  }
});

test("the same night is identical while different nights can reorder motifs", () => {
  const first = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const replay = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const next = Rasoi.createBoard("2026-08-05|America/Chicago|r3");
  assert.deepEqual(replay, first);
  assert.notDeepEqual(next.motifOrder, first.motifOrder);
});
