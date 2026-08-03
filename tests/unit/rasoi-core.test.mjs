import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/rasoi-core.js");
const Rasoi = globalThis.NindovaRasoi;

test("both authored profiles have thirty-six tiles and four of every kitchen motif", () => {
  for (const profile of Rasoi.RASOI_PROFILES) {
    const board = Rasoi.createBoard("2026-08-04|America/Chicago|r3", profile.id);
    assert.equal(board.profile, profile.id);
    assert.equal(board.tiles.length, 36);
    const counts = Object.groupBy(board.tiles, (tile) => tile.motif);
    for (const motif of Rasoi.RASOI_MOTIFS) assert.equal(counts[motif.id].length, 4);
  }
  assert.deepEqual(
    [0, 1, 2].map((layer) => Rasoi.createBoard("2026-08-04|America/Chicago|r3", "gentle").tiles.filter((tile) => tile.layer === layer).length),
    [24, 8, 4],
  );
  assert.deepEqual(
    [0, 1, 2, 3].map((layer) => Rasoi.createBoard("2026-08-04|America/Chicago|r3", "deeper").tiles.filter((tile) => tile.layer === layer).length),
    [20, 10, 4, 2],
  );
});

test("Deeper adds structural occlusion and look-ahead without adding a dead state", () => {
  const gentle = Rasoi.createBoard("2026-08-04|America/Chicago|r3", "gentle");
  const deeper = Rasoi.createBoard("2026-08-04|America/Chicago|r3", "deeper");
  const deeperAvailability = Object.groupBy(deeper.tiles, (tile) => Rasoi.availabilityReason(deeper, new Set(), tile.id));
  assert.equal(gentle.tiles.filter((tile) => tile.layer > 0).length, 12);
  assert.equal(deeper.tiles.filter((tile) => tile.layer > 0).length, 16);
  assert.equal(deeperAvailability.covered.length, 32);
  assert.equal(deeperAvailability.free.length, 4);
  assert.equal(Rasoi.legalPairs(deeper, new Set()).length, 2);
  assert.deepEqual(Rasoi.verifyBoard(deeper), {
    valid: true,
    reachableStates: 517,
    terminalStates: 1,
    deadStates: 0,
    reason: "verified",
  });
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
    for (const profile of Rasoi.RASOI_PROFILES) {
      const verification = Rasoi.verifyBoard(Rasoi.createBoard(nightId, profile.id));
      assert.equal(verification.valid, true);
      assert.equal(verification.deadStates, 0);
      assert.equal(verification.terminalStates, 1);
      assert.equal(verification.reachableStates, profile.id === "gentle" ? 382 : 517);
    }
  }
});

test("the same night is identical while different nights can reorder motifs", () => {
  const first = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const replay = Rasoi.createBoard("2026-08-04|America/Chicago|r3");
  const next = Rasoi.createBoard("2026-08-05|America/Chicago|r3");
  assert.deepEqual(replay, first);
  assert.notDeepEqual(next.motifOrder, first.motifOrder);
  assert.notEqual(Rasoi.createBoard("2026-08-04|America/Chicago|r3", "deeper").id, first.id);
  assert.throws(() => Rasoi.createBoard("night", "expert"), /Unknown Rasoi profile/);
});
