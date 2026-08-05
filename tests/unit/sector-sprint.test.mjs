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
  for (const forbidden of ["human", "animal", "vehicle", "building"]) assert.equal(allowlist.has(forbidden), false, `${forbidden} can never enter the target collision set`);
  const tools = new Set();
  const powers = new Set();
  const targetIds = [];
  const pickupIds = [];
  const complicationIds = [];
  for (const [actIndex, act] of Runner.RUNNER_ACTS.entries()) {
    assert.equal(act.storyBeats.length, 3, `${act.id} narrated beats`);
    assert.equal(act.targets.length, 5 + actIndex, `${act.id} authored target density`);
    assert.ok(act.targets.every((target) => allowlist.has(target.kind)), `${act.id} target allowlist`);
    assert.ok(Runner.RUNNER_TOOL_TARGETS[act.tool].every((kind) => allowlist.has(kind)), `${act.id} tool target allowlist`);
    assert.equal(act.pickups.length, 1, `${act.id} has one broad authored temporary-effect gate`);
    assert.equal(act.complications.length, 1, `${act.id} has one authored comic complication`);
    assert.ok(["sabzi-load", "monsoon-headwind"].includes(act.complications[0].kind));
    assert.ok(act.complications[0].durationMs >= 2_500 && act.complications[0].durationMs <= 5_000, `${act.id} complication stays brief`);
    tools.add(act.tool);
    powers.add(act.pickups[0].kind);
    targetIds.push(...act.targets.map((target) => target.id));
    pickupIds.push(...act.pickups.map((power) => power.id));
    complicationIds.push(...act.complications.map((complication) => complication.id));
  }
  assert.equal(tools.size, 5, "every Act has a mechanically distinct tool");
  assert.equal(powers.size, 3, "the route authors all three temporary effects");
  assert.equal(new Set(targetIds).size, targetIds.length, "every authored target id is globally unique");
  assert.equal(new Set(pickupIds).size, pickupIds.length, "every authored pickup id is globally unique");
  assert.equal(new Set(complicationIds).size, complicationIds.length, "every authored complication id is globally unique");
  assert.equal(Runner.RUNNER_DPR_CAP, 2);
  assert.ok(Math.abs(Runner.RUNNER_FIXED_STEP_MS - (1_000 / 60)) < 0.001);
  assert.equal(Runner.RUNNER_MAX_CATCH_UP_STEPS, 120, "the accumulator can catch up to the two-second visibility cap");
  assert.ok(Runner.RUNNER_EFFECT_PARTICLE_CAP <= 24, "effect work stays explicitly bounded");
  assert.ok(Runner.RUNNER_PROJECTILE_CAP <= 6, "active tool objects stay bounded");
  assert.ok(Runner.RUNNER_CAMERA_SHAKE_CAP <= 6, "camera response stays bounded");
  assert.doesNotMatch(source, /Math\.random/, "scene choreography remains deterministic");
  const shippedCopy = JSON.stringify(Runner.RUNNER_ACTS).toLowerCase();
  assert.doesNotMatch(shippedCopy, /contra|subway surfers|flappy bird|chrome dino/);
  assert.doesNotMatch(shippedCopy, /\bleaderboard\b|\bhigh score\b|\bbest score\b|\bkill\b|\benemy\b|\bgun\b|\bbullet\b/);
});

test("hold-to-lift thrust is responsive, bounded, and releases into a glide", () => {
  const start = Runner.createRunnerState(0);
  const launched = Runner.stepRunner(start, { thrustPressed: true, thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(launched.grounded, false);
  assert.equal(launched.thrusting, true);
  assert.equal(launched.lastAction, "thrust");
  assert.ok(launched.y < start.y);

  let held = launched;
  for (let frame = 0; frame < 30; frame += 1) {
    held = Runner.stepRunner(held, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  }
  assert.ok(held.velocityY >= -690 * 1.14, "continuous thrust never exceeds the authored rise-speed cap");
  const released = Runner.stepRunner(held, { thrustReleased: true }, Runner.RUNNER_FIXED_STEP_MS);
  assert.equal(released.thrusting, false);
  assert.ok(released.velocityY > held.velocityY, "release immediately softens the climb into a glide");
});

test("a sustained hold stays on-stage and cannot fly over authored complication gates", () => {
  let state = Runner.createRunnerState(0);
  for (let frame = 0; frame < 600; frame += 1) {
    state = Runner.stepRunner(state, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
    assert.ok(state.y >= Runner.RUNNER_PLAYER_CEILING_Y, "the illustrated lead remains inside the visible flight lane");
  }
  assert.equal(state.y, Runner.RUNNER_PLAYER_CEILING_Y);
  assert.equal(state.velocityY, 0, "the ceiling absorbs upward velocity instead of accumulating a hidden launch");
  assert.ok(state.encounteredComplicationIds.includes("gw-load"), "the full-height complication stays reachable during a continuous hold");
  assert.equal(state.finished, false, "the fixed Act continues without a fail state");
});

test("illustrated thrust and glide poses follow held input rather than ground state", () => {
  const grounded = Runner.createRunnerState(0);
  assert.equal(Runner.runnerAuthoredPoseIndex({ ...grounded, thrusting: true, grounded: false }), 0, "held thrust uses the rising pose");
  assert.equal(Runner.runnerAuthoredPoseIndex({ ...grounded, thrusting: false, grounded: false }), 1, "release in the air uses the authored glide pose");
  assert.equal(Runner.runnerAuthoredPoseIndex({ ...grounded, impactMs: 100 }), 3, "comic impact remains visually explicit");
  assert.equal(Runner.runnerAuthoredPoseIndex({ ...grounded, landingMs: 100 }), 4, "landing remains visually explicit");
});

test("adaptive visual quality has deterministic thresholds and never enters game state", () => {
  assert.equal(Runner.runnerRenderQualityForIntervals(Array(90).fill(16)), "high");
  assert.equal(Runner.runnerRenderQualityForIntervals([...Array(85).fill(16), ...Array(5).fill(25)]), "balanced");
  assert.equal(Runner.runnerRenderQualityForIntervals([...Array(85).fill(16), ...Array(5).fill(45)]), "quiet");
  assert.equal(Runner.runnerRenderQualityForIntervals([0, 300, 16]), "high", "background and invalid intervals are excluded");
  const state = Runner.createRunnerState(2);
  const expected = Runner.stepRunner(state, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS);
  for (const tier of ["high", "balanced", "quiet"]) {
    assert.deepEqual(Runner.stepRunner(state, { thrustHeld: true }, Runner.RUNNER_FIXED_STEP_MS), expected, `${tier} cannot alter simulation state`);
  }
});

test("comic complications trigger on a full-height safe gate and expire without persistence", () => {
  for (const [actIndex, act] of Runner.RUNNER_ACTS.entries()) {
    const authored = act.complications[0];
    const worldX = authored.x - Runner.RUNNER_PLAYER_SCREEN_X;
    let state = {
      ...Runner.createRunnerState(actIndex),
      elapsedMs: (worldX / 4_080) * Runner.RUNNER_ACT_SECONDS * 1_000,
      worldX,
      y: 40,
      velocityY: 0,
      grounded: false,
    };
    state = Runner.stepRunner(state, {}, 0);
    assert.equal(state.activeComplication, authored.kind, `${authored.id} is reachable at aerial height`);
    assert.deepEqual(state.encounteredComplicationIds, [authored.id]);
    assert.equal(state.lastAction, "complication");

    const fresh = Runner.createRunnerState(actIndex);
    assert.equal(fresh.activeComplication, null, "complications never persist into a fresh Act");
    assert.deepEqual(fresh.encounteredComplicationIds, []);

    for (let elapsed = 0; elapsed < authored.durationMs; elapsed += 50) state = Runner.stepRunner(state, {}, 50);
    assert.equal(state.activeComplication, null, `${authored.id} expires deterministically`);
    assert.equal(state.lastComplicationId, authored.id);
    assert.ok(state.complicationFlourishMs > 0, `${authored.id} closes with bounded feedback`);
  }
});

test("Sabzi Load changes vertical pacing while headwind stays visual-only", () => {
  const airborne = {
    ...Runner.createRunnerState(0),
    y: 150,
    velocityY: -240,
    grounded: false,
  };
  const normal = Runner.stepRunner(airborne, {}, 50);
  const loaded = Runner.stepRunner({
    ...airborne,
    activeComplication: "sabzi-load",
    activeComplicationId: "test-load",
    activeComplicationRemainingMs: 1_000,
  }, {}, 50);
  assert.ok(loaded.y > normal.y, "the load deliberately reduces vertical travel without blocking completion");

  const headwind = Runner.stepRunner({
    ...airborne,
    activeComplication: "monsoon-headwind",
    activeComplicationId: "test-wind",
    activeComplicationRemainingMs: 1_000,
  }, {}, 50);
  assert.equal(headwind.y, normal.y, "headwind never separates the rendered hero from the collision body");
  assert.equal(headwind.velocityY, normal.velocityY);
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
  assert.equal(collided.impactMs, 320);
  assert.equal(collided.stumbleMs, 420);
  assert.equal(collided.finished, false);
  assert.ok(collided.worldX > collisionSetup.worldX, "collision never resets forward motion");
});

test("variable leap, air step, dash, vault, and stomp are distinct optional movement expressions", () => {
  const jump = Runner.stepRunner(Runner.createRunnerState(0), { jumpPressed: true, jumpHeld: true }, 50);
  const held = Runner.stepRunner(jump, { jumpHeld: true }, 50);
  const released = Runner.stepRunner(jump, { jumpReleased: true }, 50);
  assert.ok(held.y < released.y, "holding Leap produces a higher authored arc");

  const airStep = Runner.stepRunner(jump, { jumpPressed: true }, 50);
  assert.equal(airStep.lastAction, "air-step");
  assert.equal(airStep.airStepsRemaining, 0);

  const dash = Runner.stepRunner(Runner.createRunnerState(0), { dashPressed: true }, 0);
  assert.equal(dash.lastAction, "dash");
  assert.ok(dash.dashMs > 0);

  const vaultSetup = { ...Runner.createRunnerState(0), worldX: 500, elapsedMs: (500 / 4_080) * 32_000 };
  const vault = Runner.stepRunner(vaultSetup, { dashPressed: true }, 0);
  assert.equal(vault.lastAction, "vault");
  assert.equal(vault.grounded, false);

  const stomp = Runner.stepRunner(jump, { dashPressed: true }, 0);
  assert.equal(stomp.lastAction, "stomp");
  assert.ok(stomp.velocityY > 0);
});

test("five Act-local tools use distinct deterministic projectile grammars", () => {
  const signatures = Runner.RUNNER_ACTS.map((act, actIndex) => {
    const fired = Runner.stepRunner(Runner.createRunnerState(actIndex), { toolPressed: true }, 0);
    assert.ok(fired.projectiles.length > 0 && fired.projectiles.length <= Runner.RUNNER_PROJECTILE_CAP);
    assert.ok(fired.projectiles.every((shot) => shot.tool === act.tool));
    return fired.projectiles.map((shot) => [shot.velocityX, shot.velocityY, shot.radius, shot.pierce]);
  });
  assert.equal(new Set(signatures.map((signature) => JSON.stringify(signature))).size, 5);
});

test("temporary effects are deterministic, meaningful, and reset in fresh Acts", () => {
  const act = Runner.RUNNER_ACTS[0];
  const power = act.pickups[0];
  const pickupSetup = { ...Runner.createRunnerState(0), worldX: power.x - Runner.RUNNER_PLAYER_SCREEN_X, elapsedMs: ((power.x - Runner.RUNNER_PLAYER_SCREEN_X) / 4_080) * 32_000 };
  const acquired = Runner.stepRunner(pickupSetup, {}, 0);
  assert.equal(acquired.activePower, "phulkari-guard");
  assert.deepEqual(acquired.collectedPickupIds, [power.id]);

  const collisionSetup = {
    ...Runner.createRunnerState(0),
    activePower: "phulkari-guard",
    elapsedMs: (1_104 / 4_080) * 32_000,
    worldX: 1_104,
  };
  const guarded = Runner.stepRunner(collisionSetup, {}, 50);
  assert.ok(guarded.transformedTargetIds.includes("gw-puddle-1"));
  assert.equal(guarded.stumbleMs, 0, "Guard replaces the cosmetic stumble");
  assert.equal(guarded.activePower, null);

  const normalTool = Runner.stepRunner(Runner.createRunnerState(1), { toolPressed: true }, 0);
  const overdriveTool = Runner.stepRunner({ ...Runner.createRunnerState(1), activePower: "chaa-overdrive" }, { toolPressed: true }, 0);
  assert.ok(overdriveTool.projectiles.length > normalTool.projectiles.length, "Overdrive widens the next tool action");
  assert.equal(overdriveTool.activePower, null);

  const normalJump = Runner.stepRunner(Runner.createRunnerState(2), { jumpPressed: true }, 0);
  const liftedJump = Runner.stepRunner({ ...Runner.createRunnerState(2), activePower: "monsoon-lift" }, { jumpPressed: true }, 0);
  assert.ok(liftedJump.velocityY < normalJump.velocityY, "Lift extends the next aerial sequence");
  assert.equal(liftedJump.activePower, null);
  assert.equal(Runner.createRunnerState(3).activePower, null, "temporary effects never persist into a fresh Act");
});

test("tactile effects and optional tool objects stay bounded", () => {
  let state = Runner.createRunnerState(0);
  for (let attempt = 0; attempt < 12; attempt += 1) {
    state = Runner.stepRunner(state, { toolPressed: true }, 0);
    state = Runner.stepRunner(state, {}, 300);
  }
  assert.ok(state.projectiles.length <= Runner.RUNNER_PROJECTILE_CAP, "queued tool objects have a hard cap");

  state = Runner.stepRunner(Runner.createRunnerState(0), { jump: true }, 50);
  for (let frame = 0; frame < 60 && !state.grounded; frame += 1) state = Runner.stepRunner(state, {}, 50);
  assert.equal(state.grounded, true);
  assert.ok(state.landingMs > 0 && state.landingMs <= 280, "landing feedback is brief and bounded");
});

test("pause freezes the engine without changing its deterministic state", () => {
  const paused = { ...Runner.createRunnerState(2), paused: true };
  assert.deepEqual(Runner.stepRunner(paused, { jump: true, spark: true }, 1_000), paused);
});
