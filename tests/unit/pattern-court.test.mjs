import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const Pattern = await import(resolve(import.meta.dirname, "../../apps/house/dist/pattern-court.js"));

test("each authored court can be solved through the same reversible construction actions", () => {
  for (let chapter = 0; chapter < Pattern.PATTERN_PUZZLES.length; chapter++) {
    let state = Pattern.createPatternState(chapter);
    const initialLoose = state.tray.length;
    state = Pattern.selectPatternPiece(state, 0);
    const cell = state.board.findIndex((mark) => mark === null);
    state = Pattern.placePatternPiece(state, chapter, cell);
    assert.equal(state.history.length, 1);
    state = Pattern.undoPattern(state);
    assert.equal(state.tray.length, initialLoose);
    while (!Pattern.patternSolved(state, chapter))
      state = Pattern.assistPattern(state, chapter);
    assert.equal(state.tray.length, 0);
    assert.deepEqual(state.board, Pattern.PATTERN_PUZZLES[chapter].target);
  }
});

test("the returning-leaf and finished-courtyard rules describe their authored layouts", () => {
  const returningLeaf = Pattern.PATTERN_PUZZLES[1];
  assert.deepEqual(returningLeaf.target.slice(0, 3), ["diamond", "sun", "leaf"]);
  assert.deepEqual([0, 3, 6].map((index) => returningLeaf.target[index]), ["diamond", "diamond", "diamond"]);
  assert.match(returningLeaf.rule, /Each column repeats one mark/);

  const courtyard = Pattern.PATTERN_PUZZLES[4];
  assert.deepEqual([courtyard.target[0], courtyard.target[2], courtyard.target[6], courtyard.target[8]], Array(4).fill("arch"));
  assert.deepEqual([courtyard.target[3], courtyard.target[5]], ["leaf", "leaf"]);
  assert.deepEqual([courtyard.target[1], courtyard.target[7]], ["sun", "sun"]);
  assert.equal(courtyard.target[4], "diamond");
});

test("Pattern Court restore rejects malformed or duplicated inventories", () => {
  const initial = Pattern.createPatternState(0);
  const malformed = Pattern.sanitizePatternState({ ...initial, board: ["sun"], tray: [] }, 0);
  assert.deepEqual(malformed, initial);
  const duplicated = Pattern.sanitizePatternState({ ...initial, tray: [...initial.tray, "sun"] }, 0);
  assert.deepEqual(duplicated, initial);
  const poisonedHistory = Pattern.sanitizePatternState({
    ...initial,
    history: [{ board: Array(9).fill("sun"), tray: [] }],
  }, 0);
  assert.deepEqual(poisonedHistory.history, []);
});
