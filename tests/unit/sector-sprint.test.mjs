import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

const root = resolve(import.meta.dirname, "../..");
const source = await readFile(resolve(root, "apps/house/src/sector-sprint.ts"), "utf8");
const emitted = ts.transpileModule(source, {
  fileName: "sector-sprint.ts",
  reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.ES2022 },
});
assert.deepEqual(emitted.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) ?? [], []);
const Runner = await import(`data:text/javascript;base64,${Buffer.from(emitted.outputText).toString("base64")}`);

test("Sector Sprint has five fixed original Acts and only allowlisted comic-object targets", () => {
  assert.equal(Runner.RUNNER_ACTS.length, 5);
  assert.equal(Runner.RUNNER_ACT_SECONDS, 32);
  assert.equal(Runner.RUNNER_SESSION_SECONDS, 240);
  assert.ok(Runner.RUNNER_ACTS.length * Runner.RUNNER_ACT_SECONDS < Runner.RUNNER_SESSION_SECONDS, "the authored action route closes before its absolute backstop");
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.sign), ["SECTOR 22", "SECTOR 26", "SECTOR 17", "MADHYA MARG", "GHAR THIS WAY"]);
  const allowlist = new Set(Runner.RUNNER_TARGET_KINDS);
  const targetIds = [];
  for (const [actIndex, act] of Runner.RUNNER_ACTS.entries()) {
    assert.equal(act.storyBeats.length, 3, `${act.id} narrated beats`);
    assert.equal(act.targets.length, 5 + actIndex, `${act.id} authored target density`);
    assert.ok(act.targets.every((target) => allowlist.has(target.kind)), `${act.id} target allowlist`);
    targetIds.push(...act.targets.map((target) => target.id));
  }
  assert.equal(new Set(targetIds).size, targetIds.length, "every authored target id is globally unique");
  assert.equal(Runner.RUNNER_DPR_CAP, 2);
  assert.ok(Runner.RUNNER_EFFECT_PARTICLE_CAP <= 24, "effect work stays explicitly bounded");
  assert.doesNotMatch(source, /Math\.random/, "scene choreography remains deterministic");
  const shippedCopy = JSON.stringify(Runner.RUNNER_ACTS).toLowerCase();
  assert.doesNotMatch(shippedCopy, /contra|subway surfers|flappy bird|chrome dino/);
  assert.doesNotMatch(shippedCopy, /\bleaderboard\b|\bhigh score\b|\bbest score\b|\bkill\b|\benemy\b|\bgun\b|\bbullet\b/);
});

test("the action route closes deterministically at the exact Act boundary", () => {
  let first = Runner.createRunnerState(0);
  let second = Runner.createRunnerState(0);
  for (let frame = 0; frame < Runner.RUNNER_ACT_SECONDS * 20; frame += 1) {
    first = Runner.stepRunner(first, {}, 50);
    second = Runner.stepRunner(second, {}, 50);
  }
  assert.deepEqual(first, second);
  assert.equal(first.finished, true);
  assert.equal(first.elapsedMs, 32_000);
  assert.match(first.message, /front gate/i);
});

test("world projection aligns a colliding target with the visible player", () => {
  const target = Runner.RUNNER_ACTS[0].targets[0];
  const collisionCamera = target.x - Runner.RUNNER_PLAYER_SCREEN_X;
  assert.equal(Runner.runnerWorldToScreen(target.x, collisionCamera), Runner.RUNNER_PLAYER_SCREEN_X);
});

test("jump and spark change choreography while forward progress never becomes failure", () => {
  const start = Runner.createRunnerState(0);
  const jumped = Runner.stepRunner(start, { jump: true }, 50);
  assert.equal(jumped.grounded, false);
  assert.ok(jumped.y < start.y);
  assert.ok(jumped.worldX > start.worldX);

  const nearTarget = {
    ...Runner.createRunnerState(0),
    elapsedMs: (500 / 4_080) * 32_000,
    worldX: 500,
  };
  const sparked = Runner.stepRunner(nearTarget, { spark: true }, 50);
  assert.ok(sparked.transformedTargetIds.includes("gw-call-1"));
  assert.match(sparked.message, /delivered/i);
  assert.equal(sparked.lastTransformedTargetId, "gw-call-1");
  assert.equal(sparked.flourishMs, 720);
  assert.equal(sparked.projectiles.length, 0, "the transforming spark is consumed");

  const collisionSetup = {
    ...Runner.createRunnerState(0),
    elapsedMs: (1_104 / 4_080) * 32_000,
    worldX: 1_104,
  };
  const collided = Runner.stepRunner(collisionSetup, {}, 50);
  assert.ok(collided.encounteredTargetIds.includes("gw-puddle-1"));
  assert.equal(collided.lastEncounteredTargetId, "gw-puddle-1");
  assert.equal(collided.impactMs, 260);
  assert.equal(collided.finished, false);
  assert.ok(collided.worldX > collisionSetup.worldX, "collision never resets forward motion");
});

test("tactile effects and optional spark objects stay bounded", () => {
  let state = Runner.createRunnerState(0);
  for (let attempt = 0; attempt < 12; attempt += 1) state = Runner.stepRunner(state, { spark: true }, 0);
  assert.equal(state.projectiles.length, 4, "queued spark objects have a hard cap");

  state = Runner.stepRunner(Runner.createRunnerState(0), { jump: true }, 50);
  for (let frame = 0; frame < 60 && !state.grounded; frame += 1) state = Runner.stepRunner(state, {}, 50);
  assert.equal(state.grounded, true);
  assert.ok(state.landingMs > 0 && state.landingMs <= 240, "landing feedback is brief and bounded");
});

test("pause freezes the engine without changing its deterministic state", () => {
  const paused = { ...Runner.createRunnerState(2), paused: true };
  assert.deepEqual(Runner.stepRunner(paused, { jump: true, spark: true }, 1_000), paused);
});
