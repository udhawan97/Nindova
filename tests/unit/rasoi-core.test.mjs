import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/rasoi-core.js");
const Rasoi = globalThis.NindovaRasoi;

test("Rasoi board has thirty-six tiles and four of every kitchen motif", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r2");
  assert.equal(board.tiles.length, 36);
  const counts = Object.groupBy(board.tiles, (tile) => tile.motif);
  for (const motif of Rasoi.RASOI_MOTIFS) assert.equal(counts[motif.id].length, 4);
});

test("only exposed rack ends are free and they form three readable pairs", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r2");
  const removed = new Set();
  assert.deepEqual(Rasoi.freeTiles(board, removed).map((tile) => tile.id), [
    "r0-s0", "r0-s11", "r1-s0", "r1-s11", "r2-s0", "r2-s11",
  ]);
  assert.equal(Rasoi.legalPairs(board, removed).length, 3);
});

test("a legal pair reveals the next matching pair on its rack", () => {
  const board = Rasoi.createBoard("2026-08-04|America/Chicago|r2");
  const pair = Rasoi.legalPairs(board, new Set())[0];
  const result = Rasoi.removePair(board, new Set(), pair[0], pair[1]);
  assert.equal(result.changed, true);
  assert.equal(Rasoi.isFree(board, result.removed, "r0-s1"), true);
  assert.equal(Rasoi.isFree(board, result.removed, "r0-s10"), true);
  assert.equal(
    board.tiles.find((tile) => tile.id === "r0-s1").motif,
    board.tiles.find((tile) => tile.id === "r0-s10").motif,
  );
});

test("an exhaustive reachability check finds no dead state after any legal choice", () => {
  for (const nightId of [
    "2026-08-04|America/Chicago|r2",
    "2026-11-01|America/Chicago|r2",
    "2026-08-04|Asia/Kolkata|r2",
  ]) {
    const verification = Rasoi.verifyBoard(Rasoi.createBoard(nightId));
    assert.equal(verification.valid, true);
    assert.equal(verification.deadStates, 0);
    assert.equal(verification.terminalStates, 1);
    assert.equal(verification.reachableStates, 343);
  }
});

test("the same night is identical while different nights can reorder motifs", () => {
  const first = Rasoi.createBoard("2026-08-04|America/Chicago|r2");
  const replay = Rasoi.createBoard("2026-08-04|America/Chicago|r2");
  const next = Rasoi.createBoard("2026-08-05|America/Chicago|r2");
  assert.deepEqual(replay, first);
  assert.notDeepEqual(next.motifOrder, first.motifOrder);
});
