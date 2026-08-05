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

function runAct(actIndex, decide, phase = 0) {
  let state = Runner.createRunnerState(actIndex);
  let held = false;
  let pulses = 0;
  const frames = Runner.RUNNER_ACT_SECONDS * 60;
  for (let frame = 0; frame < frames && !state.failed && !state.finished; frame += 1) {
    if ((frame + phase) % 6 === 0) {
      const nextHeld = decide(state, actIndex, held);
      if (nextHeld && !held) pulses += 1;
      held = nextHeld;
    }
    state = Runner.stepRunner(state, { thrustHeld: held }, Runner.RUNNER_FIXED_STEP_MS);
  }
  return { state, pulses };
}

function corridorController(state, actIndex) {
  const hitbox = Runner.runnerPlayerHitbox(state);
  const next = Runner.RUNNER_ACTS[actIndex].obstacles.find((obstacle) => obstacle.x + obstacle.width >= hitbox.x);
  const targetY = (next ? next.gapY + next.gapHeight / 2 : 220)
    - Runner.RUNNER_PLAYER_HITBOX.offsetY
    - Runner.RUNNER_PLAYER_HITBOX.height / 2;
  return state.y + state.velocityY * 0.15 > targetY;
}

test("Sector Sprint keeps five fixed Acts and adds deterministic architectural corridors", () => {
  assert.equal(Runner.RUNNER_ACTS.length, 5);
  assert.equal(Runner.RUNNER_ACT_SECONDS, 32);
  assert.equal(Runner.RUNNER_SESSION_SECONDS, 240);
  assert.equal(
    Runner.RUNNER_ACTION_ROUTE_MINIMUM_MS,
    (32_000 + Runner.RUNNER_FIXED_STEP_MS * Runner.RUNNER_MAX_CATCH_UP_STEPS) * 5 + 720 * 5 + 1,
  );
  assert.equal(Runner.RUNNER_LAUNCH_GRACE_MS, 900);
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.sign), ["SECTOR 22", "SECTOR 26", "SECTOR 17", "MADHYA MARG", "GHAR THIS WAY"]);
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.obstacles.length), [8, 9, 10, 11, 12]);
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.obstacles[0].gapHeight), [132, 128, 124, 120, 116]);
  const obstacleIds = Runner.RUNNER_ACTS.flatMap((act) => act.obstacles.map((obstacle) => obstacle.id));
  assert.equal(new Set(obstacleIds).size, obstacleIds.length);
  for (const [actIndex, act] of Runner.RUNNER_ACTS.entries()) {
    assert.equal(act.storyBeats.length, 3);
    assert.equal(act.targets.length, 5 + actIndex);
    assert.equal(act.pickups.length, 1);
    assert.equal(act.complications.length, 1);
    assert.ok(act.obstacles.every((obstacle) => obstacle.x >= 620 && obstacle.x + obstacle.width < 4_080));
    assert.ok(act.obstacles.every((obstacle) => obstacle.gapHeight / Runner.RUNNER_PLAYER_HITBOX.height >= 2.4));
    const openingReaction = (act.obstacles[0].x - Runner.runnerPlayerHitbox(Runner.createRunnerState(actIndex)).x) / Runner.RUNNER_WORLD_SPEED;
    assert.ok(openingReaction >= 1.8, `${act.id} keeps at least 1.8 seconds of visible opening reaction`);
  }
  assert.equal(Runner.RUNNER_DPR_CAP, 2);
  assert.ok(Math.abs(Runner.RUNNER_FIXED_STEP_MS - 1_000 / 60) < 0.001);
  assert.equal(Runner.RUNNER_MAX_CATCH_UP_STEPS, 120);
  assert.ok(Runner.RUNNER_EFFECT_PARTICLE_CAP <= 24);
  assert.ok(Runner.RUNNER_PROJECTILE_CAP <= 6);
  assert.ok(Runner.RUNNER_CAMERA_SHAKE_CAP <= 6);
  assert.doesNotMatch(source, /Math\.random/);
  const shippedCopy = JSON.stringify(Runner.RUNNER_ACTS).toLowerCase();
  assert.doesNotMatch(shippedCopy, /contra|subway surfers|flappy bird|chrome dino/);
  assert.doesNotMatch(shippedCopy, /\bleaderboard\b|\bhigh score\b|\bbest score\b|\bkill\b|\benemy\b|\bgun\b|\bbullet\b/);
});

test("pulse thrust has constant inertia and explicit velocity caps", () => {
  const start = { ...Runner.createRunnerState(0), launchGraceMs: 0 };
  const pulsed = Runner.stepRunner(start, { thrustPressed: true, thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  const gliding = Runner.stepRunner(start, {}, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(start.grounded, false);
  assert.equal(pulsed.thrusting, true);
  assert.equal(pulsed.lastAction, "thrust");
  assert.ok(pulsed.velocityY < gliding.velocityY, "thrust counters gravity instead of jumping to a scripted arc");
  assert.ok(pulsed.y < gliding.y);

  let rising = { ...Runner.createRunnerState(0), y: 220, launchGraceMs: 0 };
  for (let frame = 0; frame < 20 && !rising.failed; frame += 1) rising = Runner.stepRunner(rising, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  assert.ok(rising.velocityY >= Runner.RUNNER_MAX_RISE_SPEED);
  let falling = { ...Runner.createRunnerState(0), y: 80, velocityY: 0, launchGraceMs: 0 };
  for (let frame = 0; frame < 20 && !falling.failed; frame += 1) falling = Runner.stepRunner(falling, {}, Runner.RUNNER_FIXED_STEP_MS);
  assert.ok(falling.velocityY <= Runner.RUNNER_MAX_FALL_SPEED);
});

test("one contact creates an idempotent terminal Action state", () => {
  let road = Runner.createRunnerState(0);
  for (let frame = 0; frame < 120 && !road.failed; frame += 1) road = Runner.stepRunner(road, {}, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(road.failed, true);
  assert.equal(road.failureReason, "road");
  assert.equal(road.finished, false);
  assert.equal(road.projectiles.length, 0);
  const frozen = Runner.stepRunner(road, { thrustHeld: true, toolPressed: true }, 2_000);
  assert.deepEqual(frozen, road, "failure cannot retrigger, advance, or accept held input");

  let ceiling = Runner.createRunnerState(0);
  for (let frame = 0; frame < 120 && !ceiling.failed; frame += 1) ceiling = Runner.stepRunner(ceiling, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(ceiling.failed, true);
  assert.equal(ceiling.failureReason, "ceiling");
});

test("swept collision catches a corridor face without making comic targets lethal", () => {
  const obstacle = Runner.RUNNER_ACTS[0].obstacles[0];
  const beforeX = obstacle.x - Runner.RUNNER_PLAYER_SCREEN_X - Runner.RUNNER_PLAYER_HITBOX.offsetX - Runner.RUNNER_PLAYER_HITBOX.width - 2;
  const nearFace = {
    ...Runner.createRunnerState(0),
    worldX: beforeX,
    elapsedMs: beforeX / Runner.RUNNER_WORLD_SPEED * 1_000,
    y: obstacle.gapY - Runner.RUNNER_PLAYER_HITBOX.offsetY - Runner.RUNNER_PLAYER_HITBOX.height + 3,
    velocityY: 0,
  };
  const hit = Runner.stepRunner(nearFace, {}, 50);
  assert.equal(hit.failed, true);
  assert.equal(hit.failureReason, "corridor");
  assert.equal(hit.failedObstacleId, obstacle.id);

  const target = Runner.RUNNER_ACTS[0].targets[0];
  const targetWorldX = target.x - Runner.RUNNER_PLAYER_SCREEN_X - Runner.RUNNER_PLAYER_HITBOX.offsetX;
  const harmless = Runner.stepRunner({
    ...Runner.createRunnerState(0),
    worldX: targetWorldX,
    elapsedMs: targetWorldX / Runner.RUNNER_WORLD_SPEED * 1_000,
    y: target.y - Runner.RUNNER_PLAYER_HITBOX.offsetY,
    velocityY: 0,
  }, {}, 0);
  assert.equal(harmless.failed, false);
  assert.deepEqual(harmless.encounteredTargetIds, []);
});

test("a reproducible 100 ms pulse controller clears every Act with phase tolerance", () => {
  for (let phase = 0; phase < 6; phase += 1) {
    for (let actIndex = 0; actIndex < Runner.RUNNER_ACTS.length; actIndex += 1) {
      const { state, pulses } = runAct(actIndex, corridorController, phase);
      assert.equal(state.failed, false, `Act ${actIndex + 1} clears at phase ${phase}`);
      assert.equal(state.finished, true, `Act ${actIndex + 1} reaches its fixed boundary at phase ${phase}`);
      assert.equal(state.elapsedMs, 32_000);
      assert.ok(pulses >= 80 && pulses <= 130, "the trace uses bounded pulse decisions rather than frame-perfect input");
    }
  }
});

test("no input and continuous hold both wipe the first Act", () => {
  const noInput = runAct(0, () => false).state;
  const continuousHold = runAct(0, () => true).state;
  assert.equal(noInput.failed, true);
  assert.equal(noInput.failureReason, "road");
  assert.equal(continuousHold.failed, true);
  assert.equal(continuousHold.failureReason, "ceiling");
  assert.ok(noInput.elapsedMs < Runner.RUNNER_ACT_SECONDS * 1_000);
  assert.ok(continuousHold.elapsedMs < Runner.RUNNER_ACT_SECONDS * 1_000);
});

test("difficulty geometry tightens by Act without changing the simulation per quality tier", () => {
  const gaps = Runner.RUNNER_ACTS.map((act) => act.obstacles[0].gapHeight);
  const cadence = Runner.RUNNER_ACTS.map((act) => (act.obstacles[1].x - act.obstacles[0].x) / Runner.RUNNER_WORLD_SPEED);
  assert.deepEqual(gaps, [132, 128, 124, 120, 116]);
  assert.ok(cadence.every((seconds, index) => index === 0 || seconds < cadence[index - 1]));
  assert.equal(Runner.runnerRenderQualityForIntervals(Array(90).fill(16)), "high");
  assert.equal(Runner.runnerRenderQualityForIntervals([...Array(85).fill(16), ...Array(5).fill(25)]), "balanced");
  assert.equal(Runner.runnerRenderQualityForIntervals([...Array(85).fill(16), ...Array(5).fill(45)]), "quiet");
  const state = Runner.createRunnerState(2);
  const expected = Runner.stepRunner(state, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  for (const tier of ["high", "balanced", "quiet"]) {
    assert.deepEqual(Runner.stepRunner(state, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS), expected, `${tier} cannot enter game state`);
  }
});

test("all lead variants share expressive velocity motion and stable pose blends", () => {
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.lead), ["son", "mother", "duo", "duo", "duo"]);
  const start = Runner.createRunnerState(0);
  assert.ok(Runner.runnerVelocityPitch({ ...start, velocityY: -560 }) < 0);
  assert.ok(Runner.runnerVelocityPitch({ ...start, velocityY: 760 }) > 0);
  assert.equal(Runner.runnerVelocityPitch({ ...start, failed: true }), 0.09);
  const thrustBlend = Runner.runnerAuthoredPoseBlend({ ...start, thrusting: true, elapsedMs: 80 });
  assert.equal(thrustBlend.from, 0);
  assert.ok(thrustBlend.mix > 0 && thrustBlend.mix <= 0.38);
  const failedBlend = Runner.runnerAuthoredPoseBlend({ ...start, failed: true, impactMs: 420 });
  assert.equal(failedBlend.mix, 0);
});

test("duo riders share one compact flight formation around the collision hull", () => {
  const duo = Runner.runnerLeadFormation("duo");
  assert.deepEqual(duo.map(({ role }) => role), ["mother", "son"]);
  assert.ok(Math.max(...duo.map(({ offsetX }) => offsetX)) - Math.min(...duo.map(({ offsetX }) => offsetX)) <= 20);
  assert.ok(duo.every(({ offsetY }) => offsetY >= 0 && offsetY <= 6));
  assert.deepEqual(Runner.runnerLeadFormation("mother"), [{ role: "mother", offsetX: 0, offsetY: 0, scale: 1.05 }]);
});

test("five harmless Act tools retain distinct deterministic grammars and hard caps", () => {
  const signatures = Runner.RUNNER_ACTS.map((act, actIndex) => {
    const fired = Runner.stepRunner(Runner.createRunnerState(actIndex), { toolPressed: true }, 0);
    assert.ok(fired.projectiles.length > 0 && fired.projectiles.length <= Runner.RUNNER_PROJECTILE_CAP);
    assert.ok(fired.projectiles.every((shot) => shot.tool === act.tool));
    return fired.projectiles.map((shot) => [shot.velocityX, shot.velocityY, shot.radius, shot.pierce]);
  });
  assert.equal(new Set(signatures.map((signature) => JSON.stringify(signature))).size, 5);
});

test("pause freezes the engine and failure state never persists into a fresh Act", () => {
  const paused = { ...Runner.createRunnerState(2), paused: true };
  assert.deepEqual(Runner.stepRunner(paused, { thrustHeld: true, toolPressed: true }, 1_000), paused);
  const fresh = Runner.createRunnerState(2);
  assert.equal(fresh.failed, false);
  assert.equal(fresh.failureReason, null);
  assert.equal(fresh.failedObstacleId, null);
});
