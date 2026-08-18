import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const read = (relative) => readFile(resolve(root, relative), "utf8");

// Following ADR 0020's precedent for the House: once a boundary is drawn, an
// assertion keeps the surface from quietly reacquiring what moved behind it.

test("the Session surface applies the closure decision without re-owning it", async () => {
  const session = await read("apps/session/src/session.ts");
  const boundary = await read("apps/session/src/session-boundary.ts");
  assert.match(session, /NindovaBoundary\.boundaryOutcome/);
  assert.doesNotMatch(session, /state === "play" && \(current >=/);
  assert.doesNotMatch(session, /\(state === "end" \|\| state === "drift"\) && current >=/);
  // Every phase must keep an answer, including the one that had none.
  assert.match(boundary, /phase === "settling"/);
  assert.match(boundary, /"continue" \| "settle" \| "rest"/);
  // ADR 0005: a still-settling board completes its final response before Rest,
  // so the Night is recorded rather than cancelled at the cap.
  assert.match(session, /if \(state === "settling"\) finishSession\(\)/);
  // And Rest must stay unconditional, so a failure to record cannot strand the
  // Session in settling while the boundary retries every second.
  assert.match(session, /finally \{[\s\S]*?enterRest\(\);[\s\S]*?\}/);
  // Cancelling closure timers must also cancel a pending settlement, or a
  // finished Session could reopen its end card behind Rest.
  // The load-bearing half is the clearTimeout, not the reset: keeping only the
  // reset would leave the stale settlement armed.
  assert.match(session, /function clearClosureTimers\(\)[\s\S]*?clearTimeout\(settlementTimer\)/);
});

test("the Session surface applies a decoded resume without re-owning its rules", async () => {
  const session = await read("apps/session/src/session.ts");
  const active = await read("apps/session/src/active-session.ts");
  assert.match(session, /NindovaActiveSession\.decodeActiveSession/);
  assert.doesNotMatch(session, /isReachableState|sanitizeCapture/);
  for (const rule of [/sanitizeCapture/, /createBoard/, /isReachableState/, /isComplete/, /Number\.isFinite/]) {
    assert.match(active, rule, `the resume decoder must keep the ${rule} rule`);
  }
});

test("local memory keeps one Masala Mound vocabulary and no board recipe of its own", async () => {
  const night = await read("apps/session/src/night-core.ts");
  assert.match(night, /RASOI_MOTIFS/);
  assert.doesNotMatch(night, /recipeForNight|createPrng|shuffled|CLOTHS/);
});

test("the Dawn keepsake frame lives with Dawn, not on the Session surface", async () => {
  const session = await read("apps/session/src/session.ts");
  const dawn = await read("apps/session/src/dawn-core.ts");
  assert.match(dawn, /function renderFrame/);
  assert.match(dawn, /DAWN_PALETTE/);
  assert.doesNotMatch(session, /DAWN_PALETTE|drawDawnPlate|drawDawnLattice|drawCanvasMotif/);
  assert.match(session, /NindovaDawn\.renderFrame/);
});
