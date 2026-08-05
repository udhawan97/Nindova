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

function runAct(actIndex, warningDelayMs = 0) {
  let state = Runner.createRunnerState(actIndex);
  let laneInputs = 0;
  const frames = Runner.RUNNER_ACT_SECONDS * 60 + 4;
  for (let frame = 0; frame < frames && !state.failed && !state.finished; frame += 1) {
    const instruction = Runner.runnerUpcomingInstruction(state);
    let input = {};
    if (instruction && instruction.timeToContactMs <= Runner.RUNNER_ACTS[actIndex].obstacles.find((obstacle) => obstacle.id === instruction.obstacleId).warningMs - warningDelayMs) {
      const obstacle = Runner.RUNNER_ACTS[actIndex].obstacles.find((candidate) => candidate.id === instruction.obstacleId);
      if (obstacle.safeLane !== state.targetLane) {
        input = { laneDelta: obstacle.safeLane < state.targetLane ? -1 : 1 };
        laneInputs += 1;
      }
    }
    state = Runner.stepRunner(state, input, Runner.RUNNER_FIXED_STEP_MS);
  }
  return { state, laneInputs };
}

function elapsedForWorldDistance(actIndex, distance) {
  let low = 0;
  let high = Runner.RUNNER_ACT_SECONDS * 1_000;
  for (let iteration = 0; iteration < 32; iteration += 1) {
    const middle = (low + high) / 2;
    if (Runner.runnerWorldDistanceAt(actIndex, middle) < distance) low = middle;
    else high = middle;
  }
  return (low + high) / 2;
}

test("Sector Sprint uses discrete lanes and progressive speed instead of input hammering", () => {
  assert.doesNotMatch(source, /thrustHeld|RUNNER_GRAVITY|RUNNER_THRUST_ACCELERATION/);
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.obstacles.length), [5, 6, 7, 8, 9]);
  assert.deepEqual(Runner.RUNNER_SPEED_RANGES, [
    { start: 94, end: 104 },
    { start: 104, end: 116 },
    { start: 116, end: 130 },
    { start: 130, end: 146 },
    { start: 146, end: 164 },
  ]);
  assert.deepEqual(Runner.RUNNER_LANE_TRANSITION_MS, [260, 240, 220, 200, 180]);
  assert.deepEqual(Runner.RUNNER_WARNING_SECONDS, [1.8, 1.6, 1.4, 1.15, 0.95]);
});

test("five fixed Acts keep deterministic adjacent routes and fair warning", () => {
  assert.equal(Runner.RUNNER_ACTS.length, 5);
  assert.equal(Runner.RUNNER_ACT_SECONDS, 32);
  assert.equal(Runner.RUNNER_SESSION_SECONDS, 240);
  assert.equal(
    Runner.RUNNER_ACTION_ROUTE_MINIMUM_MS,
    (32_000 + Runner.RUNNER_FIXED_STEP_MS * Runner.RUNNER_MAX_CATCH_UP_STEPS) * 5 + 720 * 5 + 1,
  );
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.sign), ["SECTOR 22", "SECTOR 26", "SECTOR 17", "MADHYA MARG", "GHAR THIS WAY"]);
  const obstacleIds = Runner.RUNNER_ACTS.flatMap((act) => act.obstacles.map((obstacle) => obstacle.id));
  assert.equal(new Set(obstacleIds).size, obstacleIds.length);
  for (const [actIndex, act] of Runner.RUNNER_ACTS.entries()) {
    assert.equal(act.storyBeats.length, 3);
    assert.equal(act.targets.length, 5 + actIndex);
    assert.equal(act.pickups.length, 1);
    assert.equal(act.complications.length, 1);
    assert.equal(act.obstacles[0].safeLane, 1, `${act.id} opens in the middle lane`);
    assert.ok(act.obstacles.every((obstacle) => obstacle.gapHeight / Runner.RUNNER_PLAYER_HITBOX.height >= 1.8));
    assert.ok(act.obstacles.every((obstacle) => obstacle.warningMs >= 950));
    assert.ok(32_000 - act.obstacles.at(-1).contactMs >= 3_000, `${act.id} leaves a closing clearance`);
    for (let index = 1; index < act.obstacles.length; index += 1) {
      assert.ok(Math.abs(act.obstacles[index].safeLane - act.obstacles[index - 1].safeLane) <= 1, `${act.id} gate ${index + 1} takes at most one move`);
      assert.ok(act.obstacles[index].contactMs > act.obstacles[index - 1].contactMs);
    }
  }
  assert.equal(Runner.RUNNER_DPR_CAP, 2);
  assert.ok(Math.abs(Runner.RUNNER_FIXED_STEP_MS - 1_000 / 60) < 0.001);
  assert.equal(Runner.RUNNER_MAX_CATCH_UP_STEPS, 120);
  assert.ok(Runner.RUNNER_EFFECT_PARTICLE_CAP <= 24);
  assert.ok(Runner.RUNNER_PROJECTILE_CAP <= 6);
  assert.ok(Runner.RUNNER_CAMERA_SHAKE_CAP <= 6);
  assert.doesNotMatch(source, /Math\.random/);
});

test("speed rises within every Act and stays continuous across Act boundaries", () => {
  for (let actIndex = 0; actIndex < Runner.RUNNER_ACTS.length; actIndex += 1) {
    const start = Runner.runnerWorldSpeedAt(actIndex, 0);
    const middle = Runner.runnerWorldSpeedAt(actIndex, 16_000);
    const end = Runner.runnerWorldSpeedAt(actIndex, 32_000);
    assert.ok(start < middle && middle < end);
    assert.ok(Runner.runnerWorldDistanceAt(actIndex, 8_000) < Runner.runnerWorldDistanceAt(actIndex, 24_000));
    if (actIndex < Runner.RUNNER_ACTS.length - 1) {
      assert.equal(end, Runner.runnerWorldSpeedAt(actIndex + 1, 0));
      assert.ok(Runner.runnerWorldSpeedAt(actIndex, 31_999) < Runner.runnerWorldSpeedAt(actIndex + 1, 1));
    }
  }
});

test("one fresh lane request moves one adjacent lane with eased simulation motion", () => {
  const start = Runner.createRunnerState(0);
  const moving = Runner.stepRunner(start, { laneDelta: -1 }, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(moving.lane, 1);
  assert.equal(moving.targetLane, 0);
  assert.ok(moving.y < start.y && moving.y > Runner.RUNNER_LANE_Y[0]);
  assert.equal(moving.lastAction, "lane-change");
  let settled = moving;
  for (let frame = 0; frame < 20; frame += 1) settled = Runner.stepRunner(settled, {}, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(settled.lane, 0);
  assert.equal(settled.targetLane, 0);
  assert.equal(settled.y, Runner.RUNNER_LANE_Y[0]);
  assert.equal(settled.pendingLaneDelta, null);
  assert.ok(settled.landingMs > 0 && settled.landingMs <= 240);
  assert.equal(Runner.runnerAuthoredPoseIndex(settled), 4);
});

test("one buffered fresh request is consumed exactly once after settlement", () => {
  let state = Runner.stepRunner(Runner.createRunnerState(0), { laneDelta: -1 }, Runner.RUNNER_FIXED_STEP_MS);
  state = Runner.stepRunner(state, { laneDelta: 1 }, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(state.pendingLaneDelta, 1);
  for (let frame = 0; frame < 40; frame += 1) state = Runner.stepRunner(state, {}, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(state.lane, 1);
  assert.equal(state.targetLane, 1);
  assert.equal(state.pendingLaneDelta, null);
  assert.equal(state.y, Runner.RUNNER_LANE_Y[1]);
});

test("a low-input deterministic controller clears every Act with timing tolerance", () => {
  for (const warningDelayMs of [0, 100, 300]) {
    for (let actIndex = 0; actIndex < Runner.RUNNER_ACTS.length; actIndex += 1) {
      const { state, laneInputs } = runAct(actIndex, warningDelayMs);
      assert.equal(state.failed, false, `Act ${actIndex + 1} clears with ${warningDelayMs}ms delay`);
      assert.equal(state.finished, true, `Act ${actIndex + 1} reaches its fixed curtain`);
      assert.equal(state.elapsedMs, 32_000);
      assert.equal(laneInputs, 4 + actIndex);
    }
  }
});

test("Act V remains fair when the move starts near the latest valid warning point", () => {
  const { state, laneInputs } = runAct(4, 770);
  assert.equal(state.failed, false);
  assert.equal(state.finished, true);
  assert.equal(laneInputs, 8);
});

test("interactive lane mode without input eventually contacts an authored face", () => {
  let state = Runner.createRunnerState(0);
  for (let frame = 0; frame < Runner.RUNNER_ACT_SECONDS * 60 && !state.failed; frame += 1) {
    state = Runner.stepRunner(state, {}, Runner.RUNNER_FIXED_STEP_MS);
  }
  assert.equal(state.failed, true);
  assert.equal(state.failureReason, "corridor");
  assert.ok(state.elapsedMs > Runner.RUNNER_ACTS[0].obstacles[0].contactMs);
  assert.ok(state.elapsedMs < Runner.RUNNER_ACT_SECONDS * 1_000);
});

test("swept collision catches a lane face and failure is idempotent", () => {
  const obstacle = Runner.RUNNER_ACTS[4].obstacles[1];
  const unsafeLane = obstacle.safeLane === 0 ? 1 : 0;
  const before = {
    ...Runner.createRunnerState(4),
    elapsedMs: obstacle.contactMs - 50,
    worldX: Runner.runnerWorldDistanceAt(4, obstacle.contactMs - 50),
    lane: unsafeLane,
    targetLane: unsafeLane,
    y: Runner.RUNNER_LANE_Y[unsafeLane],
    laneFromY: Runner.RUNNER_LANE_Y[unsafeLane],
  };
  const hit = Runner.stepRunner(before, {}, 50);
  assert.equal(hit.failed, true);
  assert.equal(hit.failureReason, "corridor");
  assert.equal(hit.failedObstacleId, obstacle.id);
  assert.equal(hit.projectiles.length, 0);
  assert.equal(hit.pendingLaneDelta, null);
  assert.deepEqual(Runner.stepRunner(hit, { laneDelta: 1, toolPressed: true }, 2_000), hit);
});

test("road, upper edge, targets, pickups, and complications remain harmless", () => {
  for (const y of [-120, 350]) {
    const elapsedMs = 1_000;
    const state = {
      ...Runner.createRunnerState(0),
      elapsedMs,
      worldX: Runner.runnerWorldDistanceAt(0, elapsedMs),
      y,
      laneFromY: y,
    };
    assert.equal(Runner.stepRunner(state, {}, Runner.RUNNER_FIXED_STEP_MS).failed, false);
  }

  const act = Runner.RUNNER_ACTS[0];
  for (const candidate of [act.targets[2], act.pickups[0], act.complications[0]]) {
    const desiredWorldX = candidate.x - Runner.RUNNER_PLAYER_SCREEN_X;
    const elapsedMs = elapsedForWorldDistance(0, desiredWorldX);
    const state = {
      ...Runner.createRunnerState(0),
      elapsedMs,
      worldX: Runner.runnerWorldDistanceAt(0, elapsedMs),
    };
    assert.equal(Runner.stepRunner(state, {}, Runner.RUNNER_FIXED_STEP_MS).failed, false, `${candidate.id} cannot fail Action`);
  }
});

test("warning instruction uses text and direction before each contact", () => {
  const state = Runner.createRunnerState(2);
  const obstacle = Runner.RUNNER_ACTS[2].obstacles[1];
  const warning = Runner.runnerUpcomingInstruction({ ...state, elapsedMs: obstacle.contactMs - obstacle.warningMs, targetLane: 1 });
  assert.equal(warning.obstacleId, obstacle.id);
  assert.equal(warning.direction, obstacle.safeLane < 1 ? "up" : "down");
  assert.match(warning.label, /^Move (up|down)$/);
});

test("render quality never changes simulation state", () => {
  assert.equal(Runner.runnerRenderQualityForIntervals(Array(90).fill(16)), "high");
  assert.equal(Runner.runnerRenderQualityForIntervals([...Array(85).fill(16), ...Array(5).fill(25)]), "balanced");
  assert.equal(Runner.runnerRenderQualityForIntervals([...Array(85).fill(16), ...Array(5).fill(45)]), "quiet");
  const state = Runner.createRunnerState(2);
  const expected = Runner.stepRunner(state, { laneDelta: -1 }, Runner.RUNNER_FIXED_STEP_MS);
  for (const tier of ["high", "balanced", "quiet"]) {
    assert.deepEqual(Runner.stepRunner(state, { laneDelta: -1 }, Runner.RUNNER_FIXED_STEP_MS), expected, `${tier} cannot enter game state`);
  }
});

test("all lead variants share lane lean and stable pose blends", () => {
  assert.deepEqual(Runner.RUNNER_ACTS.map((act) => act.lead), ["son", "mother", "duo", "duo", "duo"]);
  const start = Runner.createRunnerState(0);
  const movingUp = Runner.stepRunner(start, { laneDelta: -1 }, Runner.RUNNER_FIXED_STEP_MS);
  const movingDown = Runner.stepRunner(start, { laneDelta: 1 }, Runner.RUNNER_FIXED_STEP_MS);
  assert.ok(Runner.runnerLanePitch(movingUp) < 0);
  assert.ok(Runner.runnerLanePitch(movingDown) > 0);
  assert.equal(Runner.runnerLanePitch({ ...start, failed: true }), 0.09);
  const movingBlend = Runner.runnerAuthoredPoseBlend({ ...movingUp, elapsedMs: 80 });
  assert.equal(movingBlend.from, 0);
  assert.ok(movingBlend.mix > 0 && movingBlend.mix <= 0.38);
  const failedBlend = Runner.runnerAuthoredPoseBlend({ ...start, failed: true, impactMs: 420 });
  assert.equal(failedBlend.mix, 0);
});

test("duo riders share one compact formation around the collision hull", () => {
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

test("pause freezes the engine and a fresh Act has no failure or buffered move", () => {
  const paused = { ...Runner.createRunnerState(2), paused: true, pendingLaneDelta: -1 };
  assert.deepEqual(Runner.stepRunner(paused, { laneDelta: 1, toolPressed: true }, 1_000), paused);
  const fresh = Runner.createRunnerState(2);
  assert.equal(fresh.failed, false);
  assert.equal(fresh.failureReason, null);
  assert.equal(fresh.failedObstacleId, null);
  assert.equal(fresh.pendingLaneDelta, null);
});

test("authored and shipped engine copy avoids comparisons and obsolete controls", () => {
  const shippedCopy = JSON.stringify(Runner.RUNNER_ACTS).toLowerCase();
  assert.doesNotMatch(shippedCopy, /contra|subway surfers|flappy|chrome dino/);
  assert.doesNotMatch(shippedCopy, /\bpulse\b|\bglide\b|\bthrust\b|\bgravity\b|\bceiling\b|\bflight\b|\baerial\b|rise and fall/);
  assert.doesNotMatch(shippedCopy, /\bleaderboard\b|\bhigh score\b|\bbest score\b|\bkill\b|\benemy\b|\bgun\b|\bbullet\b/);
});
