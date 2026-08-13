import { evaluateClassicChoice, getClassicStudy } from "./classic-studies.js";
import type { ActiveGame } from "./house-state.js";
import { GRAND_SALON, type GameId } from "./salon-catalog.js";
import { initialPegs, isLegalStackMove, moveStackDisc, stackSolved } from "./stack-architect.js";

export type SalonTableView = {
  readonly active: ActiveGame | null;
  readonly restoreDecisionPending: boolean;
  readonly pendingRunnerChoice: boolean;
  readonly focusSelector: string;
};

export type SalonTableInteraction =
  | { readonly type: "answer"; readonly choiceIndex: number }
  | { readonly type: "memory"; readonly covered: boolean }
  | { readonly type: "peg"; readonly pegIndex: number }
  | { readonly type: "reset-stack" };

export type SalonTableEffect = {
  readonly kind: "noop" | "updated" | "blocked" | "wrong" | "chapter-complete";
  readonly message?: string;
  readonly focusSelector?: string;
  readonly completedChapter?: number;
  readonly placedDisk?: { readonly peg: number; readonly disk: number };
};

type LifecycleOptions = {
  readonly initial: ActiveGame | null;
  readonly createRunId: () => string;
  readonly persist: (active: ActiveGame | null) => void;
  readonly changed: (view: SalonTableView) => void;
};

function cloneActive(active: ActiveGame | null): ActiveGame | null {
  return active ? { ...active, pegs: active.pegs.map((peg) => [...peg]) } : null;
}

function initialSession(gameId: GameId, runId: string): ActiveGame {
  const game = GRAND_SALON.game(gameId);
  return {
    gameId,
    chapter: 0,
    runId,
    memoryCovered: false,
    pegs: initialPegs(game.kind === "stack" ? game.diskCounts[0] ?? 0 : 0),
    selectedPeg: null,
    resolving: false,
    storyBeat: null,
    touched: false,
  };
}

function preferredFocus(active: ActiveGame | null, runnerFocus = '[data-runner-action="up"]'): string {
  if (!active) return runnerFocus;
  const game = GRAND_SALON.game(active.gameId);
  if (game.kind === "runner") return runnerFocus;
  if (game.kind === "stack") return '[data-peg="0"]';
  if (game.kind === "memory" && !active.memoryCovered) return "[data-cover-memory]";
  return '[data-answer="0"]';
}

export function createSalonTableLifecycle(options: LifecycleOptions) {
  let active = cloneActive(options.initial);
  let restoreDecisionPending = Boolean(active);
  let pendingRunnerChoice = false;
  let runnerFocus = '[data-runner-action="up"]';

  function view(): SalonTableView {
    return {
      active: cloneActive(active),
      restoreDecisionPending,
      pendingRunnerChoice,
      focusSelector: preferredFocus(active, runnerFocus),
    };
  }

  function publish(persist = true): void {
    const snapshot = cloneActive(active);
    if (persist) options.persist(snapshot);
    options.changed(view());
  }

  function open(gameId: GameId, reducedMotion: boolean): { readonly runnerRoute?: "narrated" } {
    const game = GRAND_SALON.game(gameId);
    restoreDecisionPending = false;
    if (game.kind === "runner") {
      active = null;
      pendingRunnerChoice = !reducedMotion;
      publish();
      return reducedMotion ? { runnerRoute: "narrated" } : {};
    }
    pendingRunnerChoice = false;
    active = initialSession(gameId, options.createRunId());
    publish();
    return {};
  }

  function chooseRunnerRoute(): void {
    restoreDecisionPending = false;
    pendingRunnerChoice = false;
    publish(false);
  }

  function syncRunner(next: ActiveGame | null, focusSelector?: string): void {
    if (next && GRAND_SALON.game(next.gameId).kind !== "runner") throw new Error("Sector Sprint may only publish its own active session");
    active = cloneActive(next);
    restoreDecisionPending = false;
    pendingRunnerChoice = false;
    if (focusSelector) runnerFocus = focusSelector;
    publish();
  }

  function restore(choice: "continue" | "restart" | "exit"): { readonly gameId?: GameId; readonly focusSelector?: string } {
    if (!active) return {};
    const gameId = active.gameId;
    if (choice === "continue") {
      restoreDecisionPending = false;
      publish(false);
      return { focusSelector: preferredFocus(active, runnerFocus) };
    }
    if (choice === "restart") {
      open(gameId, false);
      return { gameId, focusSelector: preferredFocus(active, runnerFocus) };
    }
    clear();
    return { gameId };
  }

  function clear(): void {
    active = null;
    restoreDecisionPending = false;
    pendingRunnerChoice = false;
    publish();
  }

  function hasMeaningfulProgress(): boolean {
    if (!active) return false;
    const game = GRAND_SALON.game(active.gameId);
    if (game.kind === "runner") return true;
    if (active.chapter > 0 || active.memoryCovered || active.touched || active.selectedPeg !== null) return true;
    if (game.kind !== "stack") return false;
    const diskCount = game.diskCounts[active.chapter] ?? 0;
    return JSON.stringify(active.pegs) !== JSON.stringify(initialPegs(diskCount));
  }

  function interact(action: SalonTableInteraction): SalonTableEffect {
    if (!active || active.resolving) return { kind: "noop" };
    const game = GRAND_SALON.game(active.gameId);
    if (action.type === "memory") {
      if (game.kind !== "memory") return { kind: "noop" };
      active.memoryCovered = action.covered;
      active.touched = true;
      publish();
      return {
        kind: "updated",
        message: action.covered ? "The procession is covered. Choose the line you held." : "The same fixed procession is visible again. Cover it when ready.",
        focusSelector: action.covered ? '[data-answer="0"]' : "[data-cover-memory]",
      };
    }
    if (action.type === "answer") {
      if (game.kind === "stack" || game.kind === "runner") return { kind: "noop" };
      if (game.kind === "memory" && !active.memoryCovered) return { kind: "blocked", message: "Cover the procession before choosing." };
      const chapter = game.kind === "classic" ? getClassicStudy(game.classicStudyId).chapters[active.chapter] : game.chapters[active.chapter];
      if (!chapter) return { kind: "noop" };
      active.touched = true;
      const correct = game.kind === "classic"
        ? evaluateClassicChoice(game.classicStudyId, active.chapter, action.choiceIndex)
        : action.choiceIndex === game.chapters[active.chapter]?.answerIndex;
      if (!correct) {
        publish();
        return {
          kind: "wrong",
          message: game.kind === "classic" ? "That move does not satisfy this authored position. Read the drawn lines and rule once more." : "Not this inscription. Read the order once more.",
        };
      }
      active.resolving = true;
      const completedChapter = active.chapter;
      publish();
      return { kind: "chapter-complete", completedChapter };
    }
    if (action.type === "reset-stack") {
      if (game.kind !== "stack") return { kind: "noop" };
      const diskCount = game.diskCounts[active.chapter] ?? 0;
      active.pegs = initialPegs(diskCount);
      active.selectedPeg = null;
      active.touched = true;
      publish();
      return { kind: "updated", message: `The ${diskCount}-disc tower is reset to the first plinth.`, focusSelector: '[data-peg="0"]' };
    }
    if (game.kind !== "stack") return { kind: "noop" };
    const pegIndex = action.pegIndex;
    if (active.selectedPeg === null) {
      if ((active.pegs[pegIndex]?.length ?? 0) === 0) return { kind: "updated", message: "That plinth is empty.", focusSelector: `[data-peg="${pegIndex}"]` };
      active.selectedPeg = pegIndex;
      active.touched = true;
      publish();
      return { kind: "updated", message: `Disc lifted from the ${["first", "second", "third"][pegIndex]} plinth.`, focusSelector: `[data-peg="${pegIndex}"]` };
    }
    const from = active.selectedPeg;
    if (!isLegalStackMove(active.pegs, from, pegIndex)) {
      active.selectedPeg = null;
      publish();
      return { kind: "updated", message: from === pegIndex ? "The disc remains where it is." : "A larger disc cannot rest on a smaller one.", focusSelector: `[data-peg="${pegIndex}"]` };
    }
    const moving = active.pegs[from]?.at(-1);
    active.pegs = moveStackDisc(active.pegs, from, pegIndex);
    active.selectedPeg = null;
    active.touched = true;
    const diskCount = game.diskCounts[active.chapter] ?? 0;
    const solved = stackSolved(active.pegs, diskCount);
    if (solved) active.resolving = true;
    const completedChapter = active.chapter;
    publish();
    return {
      kind: solved ? "chapter-complete" : "updated",
      message: "Disc placed.",
      focusSelector: `[data-peg="${pegIndex}"]`,
      completedChapter: solved ? completedChapter : undefined,
      placedDisk: moving === undefined ? undefined : { peg: pegIndex, disk: moving },
    };
  }

  function finishChapter(completedChapter: number): { readonly kind: "noop" | "advanced" | "table-complete"; readonly gameId?: GameId; readonly runId?: string; readonly focusSelector?: string } {
    if (!active || active.chapter !== completedChapter || !active.resolving) return { kind: "noop" };
    if (completedChapter === 4) return { kind: "table-complete", gameId: active.gameId, runId: active.runId };
    const game = GRAND_SALON.game(active.gameId);
    active.chapter += 1;
    active.memoryCovered = false;
    active.selectedPeg = null;
    active.pegs = initialPegs(game.kind === "stack" ? game.diskCounts[active.chapter] ?? 0 : 0);
    active.resolving = false;
    publish();
    return { kind: "advanced", focusSelector: preferredFocus(active, runnerFocus) };
  }

  options.changed(view());
  return Object.freeze({ view, open, chooseRunnerRoute, syncRunner, restore, clear, hasMeaningfulProgress, interact, finishChapter });
}
