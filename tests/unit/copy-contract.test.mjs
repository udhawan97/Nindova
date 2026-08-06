import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");

async function source(path) {
  return readFile(resolve(root, path), "utf8");
}

test("release-facing copy preserves the quiet-depth contract", async () => {
  const session = await source("apps/session/index.html");
  const runtime = await source("apps/session/src/session.ts");
  const houseShell = await source("apps/house/index.html");
  const houseRuntime = await source("apps/house/src/house.ts");
  const houseState = await source("apps/house/src/house-state.ts");
  const landing = await source("apps/site/src/pages/index.astro");
  const docsRoot = resolve(root, "apps/site/src/content/docs");
  const docPaths = (await readdir(docsRoot, { recursive: true }))
    .filter((path) => typeof path === "string" && path.endsWith(".md"));
  const docs = (await Promise.all(docPaths.map((path) => readFile(resolve(docsRoot, path), "utf8")))).join("\n");
  const interactiveCopy = `${session}\n${runtime}\n${houseShell}\n${houseRuntime}\n${houseState}\n${landing}`;
  const releaseCopy = `${interactiveCopy}\n${docs}`;

  for (const required of [
    "Nothing to win. Nothing tracked. Nothing you can do wrong.",
    "The session is over. That's the point.",
    "Gentle stack",
    "Deeper stack",
    "triple-crown mound",
    "whole Session closes itself within 15 minutes",
    "Dim and rest",
    "Carry three objects",
  ]) assert.match(releaseCopy, new RegExp(required.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  for (const prohibited of [
    /improves? your memory/i,
    /weekly rank/i,
    /personal best/i,
    /leaderboard/i,
    /sleep score/i,
    /\b(?:\d+|one|two|three|four|five|six) free tiles\b/i,
  ]) assert.doesNotMatch(interactiveCopy, prohibited);

  for (const prohibited of [
    /\bIQ(?: score| test| result)?\b/i,
    /\bintelligence (?:score|grade|test|result)\b/i,
    /\b(?:brain speed|faster brain|quicker brain)\b/i,
    /\b(?:performance|ability) (?:score|grade|rank)\b/i,
  ]) assert.doesNotMatch(releaseCopy, prohibited);

  for (const prohibited of [
    /boosts? dopamine/i,
    /dopamine hit/i,
    /\b(?:max(?:imum)?|more|extra) dopamine\b/i,
    /\bdopamine (?:hit|boost|rush|score)\b/i,
    /\b(?:generate|produce|trigger|deliver)s? dopamine\b/i,
  ]) assert.doesNotMatch(interactiveCopy, prohibited);

  assert.ok(session.indexOf('id="dimRestBtn"') < session.indexOf('id="driftBtn"'), "Rest must remain the primary completion action");
  assert.doesNotMatch(session, /replay|play again|one more/i);
  assert.match(interactiveCopy, /adults 18/i);
  assert.match(houseState, /mode: "entertainment"/);
  assert.match(houseRuntime, /no account · no telemetry/i);
  assert.doesNotMatch(landing, /Nothing to win\. Nothing tracked\. Nothing you can do wrong\./);
  assert.match(session, /Nothing to win\. Nothing tracked\. Nothing you can do wrong\./);
});
