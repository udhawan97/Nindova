import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const Catalog = await import(resolve(root, "apps/house/dist/salon-catalog.js"));
const Lifecycle = await import(resolve(root, "apps/house/dist/salon-table-lifecycle.js"));

function create(initial = null) {
  const persisted = [];
  const changed = [];
  let run = 0;
  const lifecycle = Lifecycle.createSalonTableLifecycle({
    initial,
    createRunId: () => `run-${++run}`,
    persist(active) { persisted.push(active); },
    changed(view) { changed.push(view); },
  });
  return { lifecycle, persisted, changed };
}

test("the Grand Salon lifecycle owns opening, answer resolution, and chapter advance", () => {
  const { lifecycle, persisted } = create();
  lifecycle.open("pattern-court", false);
  const first = lifecycle.view().active;
  assert.equal(first.runId, "run-1");
  assert.equal(lifecycle.hasMeaningfulProgress(), false);

  const answerIndex = Catalog.GRAND_SALON.game("pattern-court").chapters[0].answerIndex;
  const solved = lifecycle.interact({ type: "answer", choiceIndex: answerIndex });
  assert.equal(solved.kind, "chapter-complete");
  assert.equal(lifecycle.view().active.resolving, true);
  assert.equal(lifecycle.hasMeaningfulProgress(), true);

  const advanced = lifecycle.finishChapter(solved.completedChapter);
  assert.equal(advanced.kind, "advanced");
  assert.equal(lifecycle.view().active.chapter, 1);
  assert.equal(lifecycle.view().active.resolving, false);
  assert.equal(persisted.at(-1).chapter, 1);
});

test("memory gating and focus policy stay inside the lifecycle", () => {
  const { lifecycle } = create();
  lifecycle.open("lantern-ledger", false);
  assert.equal(lifecycle.view().focusSelector, "[data-cover-memory]");
  assert.equal(lifecycle.interact({ type: "answer", choiceIndex: 0 }).kind, "blocked");
  const covered = lifecycle.interact({ type: "memory", covered: true });
  assert.equal(covered.focusSelector, '[data-answer="0"]');
  assert.equal(lifecycle.view().active.memoryCovered, true);
});

test("restore, runner choice, and runner fail-closed state share one lifecycle", () => {
  const initial = {
    gameId: "mirror-forge",
    chapter: 2,
    runId: "restored",
    memoryCovered: false,
    pegs: [[], [], []],
    selectedPeg: null,
    resolving: false,
    storyBeat: null,
    touched: true,
  };
  const { lifecycle } = create(initial);
  assert.equal(lifecycle.view().restoreDecisionPending, true);
  lifecycle.restore("continue");
  assert.equal(lifecycle.view().restoreDecisionPending, false);

  lifecycle.open("sector-sprint", false);
  assert.equal(lifecycle.view().pendingRunnerChoice, true);
  assert.equal(lifecycle.view().active, null);
  lifecycle.chooseRunnerRoute();
  lifecycle.syncRunner({ ...initial, gameId: "sector-sprint", chapter: 0, runId: "runner" });
  assert.equal(lifecycle.hasMeaningfulProgress(), true);
  lifecycle.syncRunner(null);
  assert.equal(lifecycle.view().active, null);
});
