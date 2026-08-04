import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const House = await import(resolve(root, "apps/house/dist/house-core.js"));

test("the Grand Salon exposes four distinct five-chapter games", () => {
  assert.deepEqual(House.GAMES.map((game) => game.id), [
    "pattern-court",
    "mirror-forge",
    "stack-architect",
    "lantern-ledger",
  ]);
  for (const game of House.GAMES) {
    const chapterCount = game.kind === "stack" ? game.diskCounts.length : game.chapters.length;
    assert.equal(chapterCount, 5, `${game.id} chapter count`);
    assert.equal(game.version, "1.0.0");
  }
});

test("entertainment results carry immutable provenance and replace per game", () => {
  const state = House.emptyHouseState();
  const game = House.getGame("pattern-court");
  const first = House.completeEntertainmentGame(state, game, "run-one", "2026-08-04T10:00:00.000Z");
  assert.equal(first.result.mode, "entertainment");
  assert.equal(first.result.schemaVersion, 1);
  assert.equal(first.result.gameVersion, "1.0.0");
  assert.equal(first.result.rulesetVersion, "entertainment-1");
  assert.equal(first.result.completionFacts.authoredChapters, 5);

  const second = House.completeEntertainmentGame(first.state, game, "run-two", "2026-08-04T11:00:00.000Z");
  assert.equal(Object.keys(second.state.latestByGame).length, 1);
  assert.equal(second.state.latestByGame[game.id].runId, "run-two");
});

test("House storage recovers safely from absent, corrupt, and partially invalid data", () => {
  const absent = House.readHouseState({ getItem: () => null });
  assert.equal(absent.reason, "empty");
  assert.deepEqual(absent.state, House.emptyHouseState());

  const corrupt = House.readHouseState({ getItem: () => "{" });
  assert.equal(corrupt.reason, "unavailable");
  assert.deepEqual(corrupt.state, House.emptyHouseState());

  const wrongSchema = House.readHouseState({ getItem: () => JSON.stringify({ schemaVersion: 99, latestByGame: {} }) });
  assert.equal(wrongSchema.reason, "invalid");

  let value = "";
  assert.equal(House.writeHouseState({ setItem: (_key, next) => { value = next; } }, House.emptyHouseState()), true);
  assert.equal(JSON.parse(value).schemaVersion, 1);

  const pattern = House.completeEntertainmentGame(House.emptyHouseState(), House.getGame("pattern-court"), "misfiled", "2026-08-04T12:00:00.000Z").result;
  const mismatched = House.readHouseState({ getItem: () => JSON.stringify({
    schemaVersion: 1,
    latestByGame: { "mirror-forge": pattern },
  }) });
  assert.deepEqual(mismatched.state.latestByGame, {}, "result gameId must match its Gallery slot");
});

test("Stack Architect enforces the three-plinth law", () => {
  const start = House.initialPegs(3);
  assert.deepEqual(start, [[3, 2, 1], [], []]);
  assert.equal(House.isLegalStackMove(start, 0, 2), true);
  const afterSmall = House.moveStackDisc(start, 0, 2);
  assert.deepEqual(afterSmall, [[3, 2], [], [1]]);
  assert.equal(House.isLegalStackMove(afterSmall, 0, 2), false);
  assert.equal(House.stackSolved([[], [], [3, 2, 1]], 3), true);
  assert.equal(House.isValidStackState([[3, 2, 1], [], []], 3), true);
  assert.equal(House.isValidStackState([[3, 1], [1], []], 3), false, "duplicate and missing discs");
  assert.equal(House.isValidStackState([[2, 3, 1], [], []], 3), false, "illegal peg order");
});
