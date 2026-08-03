import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("release-facing copy preserves the quiet-depth contract", async () => {
  const session = await source("apps/session/index.html");
  const landing = await source("apps/site/src/pages/index.astro");
  const releaseCopy = `${session}\n${landing}`;

  for (const required of [
    "Nothing to win. Nothing tracked. Nothing you can do wrong.",
    "The session is over. That's the point.",
    "Gentle stack",
    "Deeper stack",
    "Dim and rest",
    "Carry three objects",
  ]) assert.match(releaseCopy, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  for (const prohibited of [
    /boosts? dopamine/i,
    /dopamine hit/i,
    /improves? your memory/i,
    /weekly rank/i,
    /personal best/i,
    /leaderboard/i,
    /sleep score/i,
  ]) assert.doesNotMatch(releaseCopy, prohibited);

  assert.ok(session.indexOf('id="dimRestBtn"') < session.indexOf('id="driftBtn"'), "Rest must remain the primary completion action");
  assert.doesNotMatch(session, /replay|play again|one more/i);
});
