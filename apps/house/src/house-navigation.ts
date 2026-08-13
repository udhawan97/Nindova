import { DOOR_CATEGORIES, GRAND_SALON, type DoorCategoryId, type GameId } from "./salon-catalog.js";

export type HouseView = "home" | "category" | "gallery" | "game";
export type HistoryMode = "push" | "replace" | "none";
export type HouseViewOptions = { readonly historyMode?: HistoryMode; readonly scrollY?: number; readonly focusSelector?: string };
export type HouseDestination =
  | { readonly view: "home" }
  | { readonly view: "gallery" }
  | { readonly view: "category"; readonly categoryId: DoorCategoryId }
  | { readonly view: "game"; readonly gameId: GameId; readonly categoryId: DoorCategoryId };

export type HouseNavigationState = {
  readonly view: HouseView;
  readonly selectedCategory: DoorCategoryId | null;
  readonly gameId: GameId | null;
  readonly exitConfirmationPending: boolean;
};

type NavigationOptions = {
  readonly initial: HouseDestination;
  readonly discardedRunner: boolean;
  readonly main: HTMLElement;
  readonly leaveDialog: HTMLDialogElement;
  readonly hasActiveTable: () => boolean;
  readonly restoreDecisionPending: () => boolean;
  readonly hasMeaningfulProgress: () => boolean;
  readonly leaveGame: () => void;
  readonly clearTable: () => void;
  readonly suspendForExit: () => void;
  readonly resumeFromExit: (fromGesture: boolean) => void;
  readonly resetViewState: () => void;
  readonly render: () => void;
  readonly openGame: (gameId: GameId, options: HouseViewOptions) => void;
  readonly changed: (state: HouseNavigationState) => void;
};

type PendingDestination = { readonly destination: HouseDestination; readonly scrollY: number };

function destinationKey(destination: HouseDestination): string {
  if (destination.view === "category") return `${destination.view}:${destination.categoryId}`;
  if (destination.view === "game") return `${destination.view}:${destination.gameId}`;
  return destination.view;
}

export function createHouseNavigation(options: NavigationOptions) {
  let destination = options.initial;
  let exitConfirmationPending = false;
  let pendingExitDestination: PendingDestination | null = null;
  let cancelledExitDestination: PendingDestination | null = null;
  let exitReturnFocus: HTMLElement | null = null;

  function state(): HouseNavigationState {
    return {
      view: destination.view,
      selectedCategory: destination.view === "category" || destination.view === "game" ? destination.categoryId : null,
      gameId: destination.view === "game" ? destination.gameId : null,
      exitConfirmationPending,
    };
  }

  function publish(): void {
    options.changed(state());
  }

  function hashFor(next: HouseDestination): string {
    if (next.view === "category") return `#door/${next.categoryId}`;
    if (next.view === "game") return `#game/${next.gameId}`;
    if (next.view === "gallery") return "#gallery";
    return "";
  }

  function currentHistoryDepth(): number {
    const depth = Number(history.state?.nindovaHouseDepth ?? 0);
    return Number.isSafeInteger(depth) && depth >= 0 ? depth : 0;
  }

  function viewFromLocationHash(): HouseView {
    if (location.hash.startsWith("#door/")) return "category";
    if (location.hash.startsWith("#game/")) return "game";
    if (location.hash === "#gallery") return "gallery";
    return "home";
  }

  function rememberCurrentScroll(): void {
    history.replaceState({ ...history.state, nindovaHouse: true, nindovaHouseDepth: currentHistoryDepth(), scrollY: window.scrollY }, "", location.href);
  }

  function writeRouteHash(next: HouseDestination, mode: Exclude<HistoryMode, "none"> = "push"): void {
    const hash = hashFor(next);
    if (location.hash === hash) return;
    if (mode === "push") rememberCurrentScroll();
    const url = `${location.pathname}${location.search}${hash}`;
    const depth = currentHistoryDepth() + (mode === "push" ? 1 : 0);
    const currentStateView = history.state?.nindovaHouseView as HouseView | undefined;
    const parentView = mode === "push" ? currentStateView ?? viewFromLocationHash() : history.state?.nindovaHouseParentView;
    history[mode === "replace" ? "replaceState" : "pushState"]({
      nindovaHouse: true,
      nindovaHouseDepth: depth,
      nindovaHouseView: next.view,
      nindovaHouseParentView: parentView,
      scrollY: 0,
    }, "", url);
  }

  function settle({ scrollY = 0, focusSelector }: Pick<HouseViewOptions, "scrollY" | "focusSelector"> = {}): void {
    const top = Math.max(0, scrollY);
    window.scrollTo({ left: 0, top, behavior: "auto" });
    requestAnimationFrame(() => {
      window.scrollTo({ left: 0, top, behavior: "auto" });
      const target = focusSelector ? document.querySelector<HTMLElement>(focusSelector) : options.main;
      target?.focus({ preventScroll: true });
    });
  }

  function commit(next: HouseDestination, viewOptions: HouseViewOptions = {}): void {
    const leavingGame = destination.view === "game" && next.view !== "game";
    cancelledExitDestination = null;
    if (leavingGame) options.leaveGame();
    destination = next;
    if (next.view !== "game") {
      options.clearTable();
      exitConfirmationPending = false;
    }
    options.resetViewState();
    const historyMode = viewOptions.historyMode ?? (leavingGame ? "replace" : "push");
    if (historyMode !== "none") writeRouteHash(next, historyMode);
    publish();
    options.render();
    settle(viewOptions);
  }

  function request(next: HouseDestination, invoker: HTMLElement | null = null, viewOptions: HouseViewOptions = {}): void {
    if (next.view !== "game" && destination.view === "game" && options.hasActiveTable() && !options.restoreDecisionPending() && options.hasMeaningfulProgress()) {
      const candidate = invoker ?? document.querySelector<HTMLElement>("[data-history-back]") ?? document.querySelector<HTMLElement>("#gameTitle");
      exitReturnFocus = candidate?.isConnected && candidate !== options.main && candidate !== document.body && candidate !== document.documentElement ? candidate : null;
      const requestedScroll = Math.max(0, viewOptions.scrollY ?? 0);
      const remembered = cancelledExitDestination && destinationKey(cancelledExitDestination.destination) === destinationKey(next) ? cancelledExitDestination.scrollY : 0;
      pendingExitDestination = { destination: next, scrollY: requestedScroll || remembered };
      if (!cancelledExitDestination || destinationKey(cancelledExitDestination.destination) !== destinationKey(next)) cancelledExitDestination = null;
      exitConfirmationPending = true;
      publish();
      options.suspendForExit();
      options.leaveDialog.showModal();
      document.querySelector<HTMLElement>("#keepPlayingButton")?.focus({ preventScroll: true });
      return;
    }
    commit(next, viewOptions);
  }

  function confirmExit(): void {
    const fallback: HouseDestination = state().selectedCategory
      ? { view: "category", categoryId: state().selectedCategory! }
      : { view: "home" };
    const next = pendingExitDestination ?? { destination: fallback, scrollY: 0 };
    if (options.leaveDialog.open) options.leaveDialog.close("leave");
    exitConfirmationPending = false;
    pendingExitDestination = null;
    cancelledExitDestination = null;
    exitReturnFocus = null;
    commit(next.destination, { scrollY: next.scrollY });
  }

  function cancelExit(fromGesture: boolean): void {
    if (options.leaveDialog.open) options.leaveDialog.close("keep");
    exitConfirmationPending = false;
    cancelledExitDestination = pendingExitDestination ?? cancelledExitDestination;
    pendingExitDestination = null;
    const focusTarget = exitReturnFocus;
    exitReturnFocus = null;
    publish();
    options.resumeFromExit(fromGesture);
    requestAnimationFrame(() => {
      const target = focusTarget?.isConnected ? focusTarget : document.querySelector<HTMLElement>("[data-history-back]") ?? document.querySelector<HTMLElement>("#gameTitle");
      target?.focus({ preventScroll: true });
    });
  }

  function back(fallback: HouseDestination, invoker: HTMLElement): void {
    if (currentHistoryDepth() > 0 && history.state?.nindovaHouseParentView === fallback.view) history.back();
    else request(fallback, invoker);
  }

  function destinationFromHash(): HouseDestination {
    const [kind, rawId] = location.hash.slice(1).split("/");
    const category = DOOR_CATEGORIES.find((candidate) => candidate.id === rawId);
    if (kind === "door" && category) return { view: "category", categoryId: category.id };
    if (kind === "game" && GRAND_SALON.hasGame(rawId)) {
      const game = GRAND_SALON.game(rawId);
      return { view: "game", gameId: game.id, categoryId: game.categoryId };
    }
    if (kind === "gallery") return { view: "gallery" };
    return { view: "home" };
  }

  function applyLocation(initial = false, restoredScroll = 0): void {
    const next = destinationFromHash();
    if (initial && options.discardedRunner) {
      history.replaceState({ nindovaHouse: true, nindovaHouseDepth: currentHistoryDepth(), nindovaHouseView: "home", nindovaHouseParentView: history.state?.nindovaHouseParentView, scrollY: 0 }, "", `${location.pathname}${location.search}`);
      commit({ view: "home" }, { historyMode: "none" });
      return;
    }
    if (initial && destination.view === "game" && options.hasActiveTable()) {
      writeRouteHash(destination, "replace");
      publish();
      options.render();
      settle({ scrollY: restoredScroll });
      return;
    }
    if (!initial && destination.view === "game" && options.hasActiveTable() && options.hasMeaningfulProgress()) {
      writeRouteHash(destination, "replace");
      request(next, null, { scrollY: restoredScroll });
      return;
    }
    if (next.view === "game") {
      options.openGame(next.gameId, { historyMode: "none", scrollY: restoredScroll });
      return;
    }
    if (location.hash && next.view === "home") {
      history.replaceState({ nindovaHouse: true, nindovaHouseDepth: currentHistoryDepth(), nindovaHouseView: "home", nindovaHouseParentView: history.state?.nindovaHouseParentView, scrollY: 0 }, "", `${location.pathname}${location.search}`);
    }
    commit(next, { historyMode: "none", scrollY: restoredScroll });
  }

  function start(): void {
    history.scrollRestoration = "manual";
    if (!history.state?.nindovaHouse) {
      history.replaceState({ ...history.state, nindovaHouse: true, nindovaHouseDepth: 0, nindovaHouseView: viewFromLocationHash(), scrollY: window.scrollY }, "", location.href);
    }
    addEventListener("popstate", (event) => applyLocation(false, Number(event.state?.scrollY ?? 0)));
    applyLocation(true);
  }

  publish();
  return Object.freeze({ state, commit, request, back, confirmExit, cancelExit, settle, start });
}
