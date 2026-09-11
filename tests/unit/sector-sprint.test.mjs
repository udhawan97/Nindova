import assert from "node:assert/strict";
import test from "node:test";
import ts from "typescript";
import { readFile } from "node:fs/promises";
const source = await readFile(
  new URL("../../apps/house/src/sector-sprint.ts", import.meta.url),
  "utf8",
);
const code = ts.transpileModule(source, {
  compilerOptions: {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ES2022,
  },
}).outputText;
const G = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);
test("standing still never advances the character or animates walking", () => {
  let s = G.createJourney();
  for (let i = 0; i < 600; i++) s = G.stepJourney(s, { x: 0, y: 0 }, 16.67);
  assert.equal(s.x, 720);
  assert.equal(s.y, 600);
  assert.equal(s.walking, false);
  assert.equal(s.stride, 0);
});
test("all authored destinations are connected and paths stay on the walk mesh", () => {
  for (const from of G.PLACES)
    for (const to of G.PLACES) {
      const route = G.routeTo(from.point, to.point);
      assert.ok(route.length, `${from.id} to ${to.id}`);
      assert.ok(route.every((p) => G.walkable(p.x, p.y)));
      assert.ok(
        Math.hypot(route.at(-1).x - to.point.x, route.at(-1).y - to.point.y) <
          18,
      );
    }
});
test("a commanded walk arrives, stops, and manual input cancels its route", () => {
  let s = G.createJourney();
  s = { ...s, route: G.routeTo(s, G.place("market").point) };
  for (let i = 0; i < 3000 && s.route.length; i++)
    s = G.stepJourney(s, { x: 0, y: 0 }, 16.67);
  assert.equal(s.route.length, 0);
  assert.equal(G.nearby(s)?.id, "market");
  s = G.stepJourney(s, { x: 0, y: 0 }, 16.67);
  assert.equal(s.walking, false);
  s = { ...s, route: G.routeTo(s, G.place("home").point) };
  s = G.stepJourney(s, { x: 1, y: 0 }, 16.67);
  assert.equal(s.route.length, 0);
});
test("buildings, rose beds and lake are solid; diagonal travel has no speed bonus", () => {
  assert.equal(G.walkable(1350, 100), false);
  assert.equal(G.walkable(810, 520), false);
  assert.equal(G.walkable(800, 380), false);
  const s = G.createJourney();
  const straight = G.stepJourney(s, { x: 1, y: 0 }, 16);
  const diagonal = G.stepJourney(s, { x: 1, y: 1 }, 16);
  assert.ok(
    Math.abs(
      Math.hypot(diagonal.x - s.x, diagonal.y - s.y) - (straight.x - s.x),
    ) < 0.001,
  );
});
test("three errands work in every order; meeting Ma is gated and props are idempotent", () => {
  for (const order of [
    ["market", "roses", "craft"],
    ["craft", "market", "roses"],
    ["roses", "craft", "market"],
  ]) {
    let s = G.createJourney();
    assert.equal(G.acceptEncounter(s, "lake", 0), s);
    for (const id of order) {
      s = G.acceptEncounter(s, id, 1);
      assert.equal(G.acceptEncounter(s, id, 0), s);
    }
    assert.equal(s.bag.length, 3);
    s = G.acceptEncounter(s, "lake", 0);
    assert.equal(s.companion, true);
    s = G.acceptEncounter(s, "home", 0);
    assert.equal(G.completedJourney(s), true);
    assert.equal(s.finished, true);
    assert.equal(G.stepJourney(s, { x: 1, y: 0 }, 50), s);
  }
});
test("early home does not claim a full journey; long frames are bounded", () => {
  let s = G.acceptEncounter(G.createJourney(), "home", 0);
  assert.equal(s.finished, true);
  assert.equal(G.completedJourney(s), false);
  s = G.stepJourney(G.createJourney(), { x: 1, y: 0 }, 20000);
  assert.ok(s.x - 720 <= G.WALK_SPEED * 0.05 + 0.001);
  assert.equal(G.JOURNEY_BOUNDARY_MS, 600000);
});
test("power-ups change jump height, air time and dash reach", () => {
  function flight(power) {
    let s = { ...G.createJourney(), power, x: 700, y: 600 };
    s = G.stepJourney(s, { x: 0, y: 0, jump: true }, 16);
    let peak = s.z,
      frames = 1;
    while (s.z > 0 && frames < 400) {
      s = G.stepJourney(s, { x: 0, y: 0 }, 16);
      peak = Math.max(peak, s.z);
      frames++;
    }
    return { peak, frames };
  }
  const plain = flight(null),
    spring = flight("spring"),
    glide = flight("glide");
  assert.ok(spring.peak > plain.peak * 1.6);
  assert.ok(glide.frames > plain.frames * 1.7);
  function dash(power) {
    let s = {
      ...G.createJourney(),
      power,
      x: 700,
      y: 600,
      facing: { x: 1, y: 0 },
    };
    s = G.stepJourney(s, { x: 1, y: 0, dash: true }, 16);
    for (let i = 0; i < 18; i++) s = G.stepJourney(s, { x: 1, y: 0 }, 16);
    return s.x;
  }
  assert.ok(dash("dash") > dash(null) + 30);
});
test("airborne marks require a jump and completed courses put one real errand prop in the bag", () => {
  let s = G.createJourney();
  for (const mark of G.COURSE_MARKS.filter((m) => m.owner === "market")) {
    s = { ...s, x: mark.point.x, y: mark.point.y, z: 0, vz: 0, route: [] };
    s = G.stepJourney(s, { x: 0, y: 0 }, 16);
    assert.equal(s.marks.includes(mark.id), false);
    s = G.stepJourney(s, { x: 0, y: 0, jump: true }, 16);
    for (let i = 0; i < 65; i++) s = G.stepJourney(s, { x: 0, y: 0 }, 16);
    assert.ok(s.marks.includes(mark.id));
  }
  assert.deepEqual(s.bag, ["sabzi"]);
  assert.ok(s.visited.includes("market"));
});
test("spring pads bounce and grounded crates stop travel without erasing progress", () => {
  let s = { ...G.createJourney(), x: 745, y: 583 };
  s = G.stepJourney(s, { x: 0, y: 0 }, 16);
  assert.ok(s.vz > 300);
  s = { ...G.createJourney(), x: 1173, y: 682, bag: ["sketch"] };
  s = G.stepJourney(s, { x: 1, y: 0 }, 50);
  assert.ok(s.bumpMs > 0);
  assert.deepEqual(s.bag, ["sketch"]);
});

const worldSource = await readFile(new URL('../../apps/house/src/sector-sprint-world.ts', import.meta.url), 'utf8');
const frames = await readFile(new URL('../../apps/house/src/assets/gurpreet-frames.json', import.meta.url), 'utf8');
const worldCode = ts.transpileModule(worldSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
}).outputText
  .replace(/import characterFrames from "[^"]+";/, `const characterFrames = ${frames};`)
  .replace('"./sector-sprint.js"', JSON.stringify(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`));
const { cameraFor } = await import(`data:text/javascript;base64,${Buffer.from(worldCode).toString('base64')}`);
test('camera fills short wide windows without extending beyond the painted world', () => {
  for (const [width, height] of [[1228, 430], [2500, 400], [1300, 610], [360, 570]]) {
    for (const position of [{x: 0, y: 0}, {x: 720, y: 600}, {x: 1500, y: 990}]) {
      const camera = cameraFor(position, width, height);
      assert.ok(camera.x >= 0 && camera.y >= 0);
      assert.ok(camera.x + camera.width <= G.WORLD_WIDTH + 1e-8);
      assert.ok(camera.y + camera.height <= G.WORLD_HEIGHT + 1e-8);
      assert.ok(Math.abs(camera.width / camera.height - width / height) < 1e-8);
    }
  }
});
