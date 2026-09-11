import "@fontsource-variable/newsreader";
import "@fontsource-variable/geist";
import "../../../tokens.css";
import "./house.css";
import { courtyardArt, doorArt } from "./house-art";
import {
  createHouseStateStore,
  type ActiveGame,
  type HouseState,
} from "./house-state";
import { HOUSE_ACTIVE_SESSION_CODEC } from "./house-session-codec";
import { createSalonTableLifecycle, type SalonTableEffect } from "./salon-table-lifecycle";
import {
  createHouseNavigation,
  type HouseDestination,
  type HouseView as View,
  type HouseViewOptions as ViewOptions,
} from "./house-navigation";
import {
  DOOR_CATEGORIES,
  GAMES,
  GRAND_SALON,
  type ChoiceGameDefinition,
  type ClassicGameDefinition,
  type DoorCategoryId,
  type GameDefinition,
  type GameId,
  type MemoryGameDefinition,
  type StackGameDefinition,
} from "./salon-catalog";
import {
  getClassicStudy,
  type ClassicChapterView,
} from "./classic-studies";
import {
  createSectorSprintTable,
  type SectorSprintRunnerSnapshot,
  type SectorSprintTerminal,
  type SectorSprintTone,
} from "./sector-sprint-table";

type PendingCompletion = { readonly gameId: GameId; readonly runId: string; readonly completedAt: string };
type StackMovePresentation = NonNullable<SalonTableEffect["placedDisk"]>;

const getGame = GRAND_SALON.game.bind(GRAND_SALON);
const getDoorCategory = GRAND_SALON.door.bind(GRAND_SALON);

type DebugHouse = {
  readonly view: View;
  readonly active: ActiveGame | null;
  readonly memory: HouseState;
  readonly runner: SectorSprintRunnerSnapshot | null;
  start: (gameId: GameId) => void;
  openCategory: (categoryId: DoorCategoryId) => void;
  answer: (choiceIndex: number) => void;
};

declare global {
  interface Window { __house: DebugHouse; }
}

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`House shell is missing ${selector}`);
  return element;
}

const main = requiredElement<HTMLElement>("#houseMain");
const soundButton = requiredElement<HTMLButtonElement>("#soundButton");
const audienceDialog = requiredElement<HTMLDialogElement>("#audienceDialog");
const enterHouseButton = requiredElement<HTMLButtonElement>("#enterHouseButton");
const leaveDialog = requiredElement<HTMLDialogElement>("#leaveDialog");
const keepPlayingButton = requiredElement<HTMLButtonElement>("#keepPlayingButton");
const leaveTableButton = requiredElement<HTMLButtonElement>("#leaveTableButton");
const galleryClearDialog = requiredElement<HTMLDialogElement>("#galleryClearDialog");
const galleryClearCount = requiredElement<HTMLElement>("#galleryClearCount");
const cancelGalleryClearButton = requiredElement<HTMLButtonElement>("#cancelGalleryClearButton");
const confirmGalleryClearButton = requiredElement<HTMLButtonElement>("#confirmGalleryClearButton");
const celebration = requiredElement<HTMLElement>("#celebration");

const runnerReviewMode = new URLSearchParams(location.search).get("review") === "1";
const PRAISE = ["Well seen.", "Exact.", "Beautifully read.", "The order holds.", "A complete reading."] as const;
const houseStateStore = createHouseStateStore({ galleryStorage: localStorage, activeStorage: sessionStorage, activeCodec: HOUSE_ACTIVE_SESSION_CODEC });
const restoredActive = houseStateStore.restoreActive();
let memory = houseStateStore.gallery();
let view: View = "home";
let selectedCategory: DoorCategoryId | null = null;
let runnerRestoreWasDiscarded = restoredActive.discardedRunner;
let active: ActiveGame | null = restoredActive.active;
let restoreDecisionPending = Boolean(active);
let pendingRunnerChoice = false;
let pendingCompletion: PendingCompletion | null = null;
let galleryClearReturnFocus: HTMLElement | null = null;
let exitConfirmationPending = false;
let soundOn = false;
let statusMessage = "";
let celebrationTimer = 0;
let chapterTransitionTimer = 0;
let chapterTransitionRemainingMs = 0;
let chapterTransitionStartedAt: number | null = null;
let chapterTransitionCallback: (() => void) | null = null;
let houseAudioContext: AudioContext | null = null;
const houseAudioVoices = new Set<OscillatorNode>();
let lastStackMove: StackMovePresentation | null = null;
let stackMoveTimer = 0;

function clearStackMove(): void {
  window.clearTimeout(stackMoveTimer);
  stackMoveTimer = 0;
  lastStackMove = null;
}

const tableLifecycle = createSalonTableLifecycle({
  initial: active,
  createRunId: () => crypto.randomUUID(),
  persist: (next) => { houseStateStore.saveActive(next); },
  changed(next) {
    active = next.active;
    restoreDecisionPending = next.restoreDecisionPending;
    pendingRunnerChoice = next.pendingRunnerChoice;
  },
});

const sectorTable = createSectorSprintTable({
  reviewMode: runnerReviewMode,
  audio: {
    resumeFromGesture: resumeHouseAudioFromGesture,
    suspend: suspendHouseAudio,
    close: closeHouseAudio,
    tone: playSectorTone,
  },
  persist(next) {
    tableLifecycle.syncRunner(next);
  },
  renderShell: render,
  celebrate: showCelebration,
  terminal: handleSectorTerminal,
  focus: focusElement,
});

const initialDestination: HouseDestination = active
  ? { view: "game", gameId: active.gameId, categoryId: getGame(active.gameId).categoryId }
  : { view: "home" };

const navigation = createHouseNavigation({
  initial: initialDestination,
  discardedRunner: runnerRestoreWasDiscarded,
  main,
  leaveDialog,
  hasActiveTable: () => Boolean(active || pendingRunnerChoice),
  restoreDecisionPending: () => restoreDecisionPending,
  hasMeaningfulProgress: () => tableLifecycle.hasMeaningfulProgress(),
  leaveGame() {
    sectorTable.close();
    closeHouseAudio();
    clearChapterTransition();
  },
  clearTable: () => { tableLifecycle.clear(); },
  suspendForExit() {
    sectorTable.setExitSuspended(true);
    pauseChapterTransition();
    suspendHouseAudio();
  },
  resumeFromExit(fromGesture) {
    resumeChapterTransition();
    sectorTable.setExitSuspended(false, fromGesture);
  },
  resetViewState() {
    statusMessage = "";
    pendingCompletion = null;
  },
  render,
  openGame: startGame,
  changed(next) {
    view = next.view;
    selectedCategory = next.selectedCategory;
    exitConfirmationPending = next.exitConfirmationPending;
  },
});

function currentViewHeadingSelector(): string {
  if (view === "category") return "#categoryTitle";
  if (view === "gallery") return "#galleryTitle";
  if (view === "game") return "#gameTitle";
  return "#houseTitle";
}

function destinationForView(next: View): HouseDestination {
  if (next === "category" && selectedCategory) return { view: "category", categoryId: selectedCategory };
  if (next === "game") {
    const gameId = active?.gameId ?? (pendingRunnerChoice ? "sector-sprint" : null);
    if (gameId) {
      const game = getGame(gameId);
      return { view: "game", gameId, categoryId: game.categoryId };
    }
  }
  if (next === "gallery") return { view: "gallery" };
  return { view: "home" };
}

function route(next: View, options: ViewOptions = {}) {
  navigation.commit(destinationForView(next), options);
}

function requestRoute(next: View, invoker: HTMLElement | null = null, options: ViewOptions = {}) {
  navigation.request(destinationForView(next), invoker, options);
}

function discardActiveGame() {
  navigation.confirmExit();
}

function openCategory(categoryId: DoorCategoryId) {
  getDoorCategory(categoryId);
  navigation.commit({ view: "category", categoryId });
}

function startGame(gameId: GameId, options: ViewOptions = {}) {
  const game = getGame(gameId);
  sectorTable.close();
  closeHouseAudio();
  clearChapterTransition();
  clearStackMove();
  const opened = tableLifecycle.open(gameId, matchMedia("(prefers-reduced-motion: reduce)").matches);
  navigation.commit(
    { view: "game", gameId, categoryId: game.categoryId },
    game.kind === "runner" ? { ...options, focusSelector: '[data-runner-route="action"]' } : options,
  );
  if (game.kind === "runner") {
    if (opened.runnerRoute) {
      sectorTable.start(opened.runnerRoute, crypto.randomUUID());
      navigation.settle({ focusSelector: "[data-encounter-choice]" });
    }
    return;
  }
}

function beginRunnerRoute(routeChoice: "action" | "narrated") {
  if (!pendingRunnerChoice && active) return;
  tableLifecycle.chooseRunnerRoute();
  sectorTable.start(routeChoice, crypto.randomUUID());
  navigation.settle({ focusSelector: routeChoice === "action" ? "#runnerCanvas" : "[data-encounter-choice]" });
}

function escape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function gameSigil(gameId: GameId): string {
  const pieces = gameId === "sector-sprint" ? 5 : gameId === "stack-architect" ? 3 : 4;
  return `<span class="game-sigil game-sigil-${gameId}" aria-hidden="true">${Array.from({ length: pieces }, (_, index) => `<i style="--sigil-index:${index}"></i>`).join("")}</span>`;
}

function render() {
  if (view === "home") renderHome();
  else if (view === "category") renderCategory();
  else if (view === "gallery") renderGallery();
  else renderGame();
}

function focusElement(selector: string, options: { readonly reveal?: boolean } = {}) {
  requestAnimationFrame(() => {
    const target = document.querySelector<HTMLElement>(selector);
    if (!target) return;
    if (options.reveal) target.closest<HTMLElement>(".runner-recovery")?.scrollIntoView({ block: "start", inline: "nearest", behavior: "auto" });
    target.focus({ preventScroll: true });
  });
}

function clearChapterTransition() {
  if (chapterTransitionTimer) window.clearTimeout(chapterTransitionTimer);
  chapterTransitionTimer = 0;
  chapterTransitionRemainingMs = 0;
  chapterTransitionStartedAt = null;
  chapterTransitionCallback = null;
}

function pauseChapterTransition() {
  if (!chapterTransitionCallback || chapterTransitionStartedAt === null) return;
  if (chapterTransitionTimer) window.clearTimeout(chapterTransitionTimer);
  chapterTransitionTimer = 0;
  chapterTransitionRemainingMs = Math.max(0, chapterTransitionRemainingMs - (performance.now() - chapterTransitionStartedAt));
  chapterTransitionStartedAt = null;
}

function resumeChapterTransition() {
  if (!chapterTransitionCallback || chapterTransitionTimer || document.hidden || exitConfirmationPending) return;
  if (chapterTransitionRemainingMs <= 0) {
    const callback = chapterTransitionCallback;
    clearChapterTransition();
    callback();
    return;
  }
  chapterTransitionStartedAt = performance.now();
  chapterTransitionTimer = window.setTimeout(() => {
    const callback = chapterTransitionCallback;
    clearChapterTransition();
    callback?.();
  }, chapterTransitionRemainingMs);
}

function scheduleChapterTransition(delay: number, callback: () => void) {
  clearChapterTransition();
  if (delay <= 0) {
    callback();
    return;
  }
  chapterTransitionRemainingMs = delay;
  chapterTransitionCallback = callback;
  resumeChapterTransition();
}

function renderHome() {
  main.innerHTML = `
    ${runnerRestoreWasDiscarded ? `
      <section class="runner-restore-banner" aria-labelledby="runnerRestoreTitle" role="status">
        <p class="kicker">Route settled safely</p>
        <h2 id="runnerRestoreTitle">Sector Sprint closed on reload.</h2>
        <p>Its remaining boundary could not be extended, so no completion was recorded.</p>
        <button class="primary-action" type="button" data-browse-salon>Browse five doors</button>
      </section>
    ` : ""}
    <section class="house-intro" aria-labelledby="houseTitle">
      <div class="house-intro-copy"><p class="kicker">A private house of authored games</p>
      <h1 id="houseTitle" tabindex="-1">Choose a room.<br><em>Stay for the pleasure of solving.</em></h1>
      <button class="primary-action house-browse" type="button" data-browse-salon>Browse five doors</button>
      <p class="house-lede">Five doors hold eight games, each arranged in five deliberate chapters or studies. Nothing is ranked, broadcast, or compared with other people.</p></div>
      ${courtyardArt}
    </section>
    <section class="floor-plan" aria-label="Nindova House rooms">
      <a class="room room-night" href="../play/">
        <span class="room-number">North wing</span>
        <span class="room-title">The Night Room</span>
        <span class="room-copy">Find familiar kitchen pairs on a carved tray, then let the room settle into quiet.</span>
        <span class="room-enter">Enter the Night Room <span aria-hidden="true">→</span></span>
      </a>
      <div class="room room-salon">
        <header class="salon-heading">
          <div><span class="room-number">The centre of the House</span><h2>The Grand Salon</h2></div>
          <p>Entertainment first. Every table is authored, finite, and replayable by choice.</p>
        </header>
        <div class="salon-plan">
          ${DOOR_CATEGORIES.map((category) => `
            <button class="game-door category-door category-door-${escape(category.id)}" type="button" data-category="${escape(category.id)}">
              ${doorArt(category.id)}
              <span class="game-number">${category.number}</span>
              <span class="game-title">${escape(category.title)}</span>
              <span class="game-line">${escape(category.houseLine)}</span>
              <span class="game-enter">Open door · ${category.gameIds.length} ${category.gameIds.length === 1 ? "table" : "tables"}</span>
            </button>
          `).join("")}
        </div>
      </div>
      <button class="room room-gallery" type="button" data-route="gallery">
        <span class="room-number">West gallery</span>
        <span class="room-title">The Gallery</span>
        <span class="room-copy">See the most recent completed reading kept on this device—never a rank or comparison.</span>
        <span class="room-enter">Visit the Gallery <span aria-hidden="true">→</span></span>
      </button>
    </section>
    <section class="house-boundary" aria-labelledby="boundaryTitle">
      <p class="kicker">The House rules</p>
      <h2 id="boundaryTitle">Pleasure, privacy, and a clean exit.</h2>
      <dl>
        <div><dt>Authored</dt><dd>Every chapter and outcome is fixed by design. There are no random prizes.</dd></div>
        <div><dt>Private</dt><dd>Only the latest completion fact per game may stay in this browser. Nothing is sent.</dd></div>
        <div><dt>Honest</dt><dd>Entertainment play is not presented as a cognitive, educational, or clinical assessment.</dd></div>
      </dl>
    </section>
  `;
}

function renderCategory() {
  if (!selectedCategory) return route("home");
  const category = getDoorCategory(selectedCategory);
  const games = category.gameIds.map(getGame);
  main.innerHTML = `
    <section class="category-view category-view-${category.id}" aria-labelledby="categoryTitle">
      <header class="game-masthead">
        <button class="back-link" type="button" data-history-back="home"><span aria-hidden="true">←</span> Grand Salon</button>
        <span class="category-door-mark">Door ${category.number}</span>
      </header>
      <div class="category-heading">
        <div class="category-heading-copy"><p class="kicker">Door ${category.number}</p>
        <h1 id="categoryTitle" tabindex="-1">${escape(category.title)}</h1>
        <p class="house-lede">${escape(category.description)}</p></div>
        <div class="category-portrait" aria-hidden="true">${doorArt(category.id)}</div>
      </div>
      <div class="category-tables">
        ${games.map((game) => `
          <article class="category-table category-table-${game.id}">
            ${gameSigil(game.id)}
            <p class="game-number">Table ${game.number}</p>
            <h2>${escape(game.title)}</h2>
            <p>${escape(game.description)}</p>
            ${game.format === "authored-rule-study" ? '<p class="study-mark">Authored tactical rule study</p>' : '<p class="study-mark">Nindova House original</p>'}
            <button class="primary-action" type="button" data-game="${game.id}">Open table</button>
          </article>
        `).join("")}
      </div>
      ${games.some((game) => game.format === "authored-rule-study") ? '<p class="category-note">Rule studies use named documented sources and disclose what they omit. They are not presented as definitive or complete traditional matches.</p>' : ""}
    </section>
  `;
}

function renderGallery() {
  const entries = GAMES.map((game) => ({ game, result: memory.latestByGame[game.id] }));
  const completedCount = entries.filter(({ result }) => Boolean(result)).length;
  main.innerHTML = `
    <section class="gallery-view" aria-labelledby="galleryTitle">
      <button class="back-link" type="button" data-history-back="home"><span aria-hidden="true">←</span> House plan</button>
      <p class="kicker">The west gallery</p>
      <h1 id="galleryTitle" tabindex="-1">Recent readings,<br><em>kept without judgment.</em></h1>
      <p class="house-lede">This is a local continuity ledger, not a profile. Each game replaces its own previous entry.</p>
      ${statusMessage ? `<p class="gallery-status" role="status" aria-live="polite">${escape(statusMessage)}</p>` : ""}
      <div class="gallery-ledger">
        ${entries.map(({ game, result }) => `
          <article>
            <span class="game-number">${game.number}</span>
            <div><h2>${escape(game.title)}</h2><p>${result ? `${result.completionFacts.authoredChapters} authored ${game.kind === "runner" ? "Acts" : game.kind === "classic" ? "studies" : "chapters"} completed · ${escape(result.completionFacts.finalChapter)}` : "No completed reading is kept."}</p></div>
            <button type="button" data-game="${game.id}">${result ? "Visit again" : "Open table"}</button>
          </article>
        `).join("")}
      </div>
      <p class="privacy-note">Storage scope: this browser only · one replaceable result per game · no account · no telemetry</p>
      ${completedCount > 0 ? '<button class="clear-gallery" type="button" data-clear-gallery>Clear this Gallery</button>' : ""}
    </section>
  `;
}

function renderGame() {
  if (!active && !pendingRunnerChoice) return route("home");
  const game = pendingRunnerChoice ? getGame("sector-sprint") : getGame(active!.gameId);
  const runnerView = game.kind === "runner" ? sectorTable.view() : null;
  const chapter = active?.chapter ?? 0;
  const part = pendingRunnerChoice ? null : GRAND_SALON.part(game.id, chapter);
  const chapterTitle = pendingRunnerChoice ? "Choose your route" : part!.title;
  const authoredUnit = part?.unit ?? "Act";
  const displayedStatus = runnerView?.status ?? statusMessage;
  main.innerHTML = `
    <section class="game-view game-view-${game.id}" aria-labelledby="gameTitle">
      <header class="game-masthead">
        <button class="back-link" type="button" data-history-back="category"><span aria-hidden="true">←</span> ${escape(getDoorCategory(game.categoryId).title)}</button>
        <div class="chapter-mark" ${game.kind === "runner" ? 'hidden' : ''}><span>${pendingRunnerChoice ? "Before Act I" : `${authoredUnit} ${chapter + 1}`}</span><i aria-hidden="true"></i><span>${pendingRunnerChoice ? "Route choice" : "of 5"}</span></div>
      </header>
      <div class="game-title-block ${game.kind === "runner" ? "game-title-block-runner" : ""}">
        <p class="kicker">Table ${game.number} · ${escape(chapterTitle ?? authoredUnit)}</p>
        <h1 id="gameTitle" tabindex="-1">${escape(game.title)}</h1>
        <p>${escape(game.description)}</p>
      </div>
      <div class="game-chamber game-chamber-${game.id}">
        ${pendingRunnerChoice
          ? renderRunnerPrelude()
          : restoreDecisionPending
            ? renderRestoreGate(game)
            : game.kind === "runner"
              ? runnerView?.markup ?? ""
              : game.kind === "stack"
                ? renderStack(game)
                : game.kind === "classic"
                  ? renderClassicStudy(game)
                  : renderChoice(game)}
      </div>
      <p id="gameStatus" class="game-status" role="status" aria-live="polite">${escape(displayedStatus)}</p>
    </section>
  `;
  if (game.kind === "runner" && active && !restoreDecisionPending) sectorTable.afterRender();
}

function renderRestoreGate(game: GameDefinition): string {
  if (!active) return "";
  const unit = GRAND_SALON.part(game.id, active.chapter).unit;
  return `
    <section class="table-gate restore-gate" aria-labelledby="restoreTitle">
      <div class="gate-sigil" aria-hidden="true"><i></i><span></span><i></i></div>
      <p class="kicker">Unfinished table found</p>
      <h2 id="restoreTitle">Continue ${escape(game.title)}?</h2>
      <p>${unit} ${active.chapter + 1} is still held in this tab. Continuing keeps that exact ${unit.toLowerCase()}; starting over creates a fresh five-${unit.toLowerCase()} reading.</p>
      <div class="gate-actions">
        <button class="primary-action" type="button" data-restore="continue">Continue ${unit.toLowerCase()}</button>
        <button class="quiet-action" type="button" data-restore="restart">Start over</button>
        <button class="text-action" type="button" data-restore="exit">Exit to the Salon</button>
      </div>
      <p class="gate-note">Nothing is recorded until the fifth ${unit.toLowerCase()} closes.</p>
    </section>
  `;
}

function renderRunnerPrelude(): string {
  return `<section class="table-gate journey-prelude" aria-labelledby="runnerPreludeTitle"><div class="journey-prelude-art" aria-hidden="true"></div><p class="kicker">A Chandigarh homecoming</p><h2 id="runnerPreludeTitle">The long way home.</h2><p>Spring over crates. Dash through the courtyard chimes. Float through the garden petals. Find playful power-ups, bring a little of Chandigarh home, and meet Ma by Sukhna.</p><div class="route-choices"><button class="route-choice route-choice-action" type="button" data-runner-route="action"><span>Explore the city</span><strong>Step into Chandigarh</strong><small>Move · jump · dash · explore</small></button><button class="route-choice" type="button" data-runner-route="narrated"><span>Narrated homecoming</span><strong>Read the city</strong><small>The same objects and ending, without movement</small></button></div><p class="gate-note">An original fictional walk through a compressed Chandigarh. Your bag belongs only to this afternoon. You can always head home. The table closes after ten foreground minutes; pause whenever you need.</p></section>`;
}

function renderChoice(game: ChoiceGameDefinition | MemoryGameDefinition): string {
  if (!active) return "";
  const chapter = game.chapters[active.chapter];
  if (!chapter) return "";
  const covered = game.kind === "memory" && active.memoryCovered;
  return `
    <div class="prompt-column">
      <span class="prompt-label">${game.kind === "memory" ? "The procession" : "The inscription"}</span>
      <div class="inscription inscription-${game.id} ${covered ? "is-covered" : ""}" aria-label="${covered ? "Sequence covered" : escape(chapter.display.replaceAll("\n", ", "))}">
        ${renderChoiceVisual(game, chapter.display, covered)}
      </div>
      ${game.kind === "memory" && !covered ? `<button class="primary-action seal-action" type="button" data-cover-memory>Cover the procession</button>` : ""}
      ${game.kind === "memory" && covered ? `<button class="quiet-action reveal-action" type="button" data-reveal-memory>Show the procession again</button>` : ""}
    </div>
    <div class="answer-column ${game.kind === "memory" && !covered ? "is-waiting" : ""}">
      <p>${escape(chapter.prompt)}</p>
      <div class="answer-list">
        ${chapter.choices.map((choice, index) => `<button type="button" data-answer="${index}" ${game.kind === "memory" && !covered ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span>${escape(choice)}</button>`).join("")}
      </div>
    </div>
  `;
}

function renderChoiceVisual(game: GameDefinition, display: string, covered: boolean): string {
  if (game.kind === "memory") {
    if (covered) return `<div class="lantern-veil" aria-hidden="true"><i class="lantern-veil-panel lantern-veil-panel-left"></i><i class="lantern-veil-panel lantern-veil-panel-right"></i><span class="lantern-veil-clasp"><b></b><small>The velvet is drawn.</small><b></b></span></div>`;
    const lanterns = display.split(" · ");
    const numerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
    return `<div class="lantern-instrument" style="--lantern-count:${lanterns.length}" aria-hidden="true">
      <span class="lantern-reading-line"><i></i><b>Read left to right</b><i></i></span>
      <div class="lantern-procession">${lanterns.map((name, index) => `
        <span class="lantern lantern-${name.toLowerCase()}" data-lantern-position="${index + 1}" style="--lantern-index:${index}">
          <b class="lantern-order">${numerals[index]}</b><i class="lantern-body"><em class="lantern-flame"></em></i><small>${escape(name)}</small>
        </span>
      `).join("")}</div>
      <span class="lantern-even-glow"><i></i><b>One fixed procession</b><i></i></span>
    </div>`;
  }
  if (game.id === "mirror-forge") {
    const arrows = display.trim().split(/\s+/);
    return `<div class="mirror-stage" aria-hidden="true"><i class="mirror-ring mirror-ring-outer"></i><i class="mirror-ring mirror-ring-inner"></i><div class="mirror-orbit">${arrows.map((arrow, index) => `<span style="--glyph-index:${index}">${escape(arrow)}</span>`).join("")}</div></div>`;
  }
  const rows = display.split("\n").map((row) => row.trim().split(/\s+/));
  let tokenIndex = 0;
  return `<div class="pattern-matrix" aria-hidden="true">${rows.map((row) => `<div class="pattern-row">${row.map((token) => {
    const index = tokenIndex;
    tokenIndex += 1;
    return `<span class="${token === "?" ? "is-missing" : ""}" style="--glyph-index:${index}">${escape(token)}</span>`;
  }).join("")}</div>`).join("")}</div>`;
}

function renderBoardLines(points: readonly { id: number; x: number; y: number }[], lines: readonly (readonly number[])[]): string {
  const byId = new Map(points.map((point) => [point.id, point]));
  return lines.map((line) => {
    const coordinates = line.map((id) => byId.get(id)).filter((point): point is { id: number; x: number; y: number } => Boolean(point));
    return `<polyline points="${coordinates.map((point) => `${point.x},${point.y}`).join(" ")}" />`;
  }).join("");
}

function renderClassicStudy(game: ClassicGameDefinition): string {
  if (!active) return "";
  const study = getClassicStudy(game.classicStudyId);
  const chapter = study.chapters[active.chapter];
  let studyBoard = "";
  if (chapter.board.kind === "navakankari") studyBoard = renderNavakankariStudy(chapter);
  if (chapter.board.kind === "aadu-puli-attam") studyBoard = renderAaduStudy(chapter);
  if (chapter.board.kind === "pallanguzhi") studyBoard = renderPallanguzhiStudy(chapter);
  return `
    <div class="classic-study">
      <div class="classic-study-board">
        <p class="prompt-label">Authored tactical rule study</p>
        ${studyBoard}
      </div>
      <div class="classic-study-copy">
        <p>${escape(chapter.prompt)}</p>
        <p class="study-instruction">Choose one marked destination or starting pit. Every position and outcome is fixed.</p>
        <details class="study-provenance">
          <summary>Source and scope</summary>
          <dl>
            <div><dt>Documented scope</dt><dd>${escape(study.documentedScope)}</dd></div>
            <div><dt>Included</dt><dd>${escape(study.included)}</dd></div>
            <div><dt>Omitted</dt><dd>${escape(study.omitted)}</dd></div>
          </dl>
          <a href="${escape(study.sourceUrl)}" target="_blank" rel="noreferrer">${escape(study.sourceLabel)} <span aria-hidden="true">↗</span></a>
        </details>
      </div>
    </div>
  `;
}

function renderNavakankariStudy(chapter: ClassicChapterView): string {
  if (chapter.board.kind !== "navakankari") return "";
  const board = chapter.board;
  const optionIndex = new Map(chapter.options.map((option) => [option.target, option.index]));
  return `
    <div class="line-board navakankari-board" role="group" aria-label="Navakankari placement study" aria-describedby="classicStudyDescription">
      <p id="classicStudyDescription" class="sr-only classic-study-description">${escape(chapter.description)}</p>
      <svg viewBox="-4 -4 108 108" aria-hidden="true"><g>${renderBoardLines(board.points, board.lines)}</g></svg>
      ${board.points.map((point) => {
        const choice = optionIndex.get(point.id);
        const state = board.own.includes(point.id) ? "own" : board.occupied.includes(point.id) ? "occupied" : "empty";
        if (choice !== undefined) return `<button class="board-point is-option" type="button" data-answer="${choice}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-label="${escape(chapter.options[choice].description)}"><span>${chapter.options[choice].label}</span></button>`;
        return `<i class="board-point is-${state}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-hidden="true"></i>`;
      }).join("")}
    </div>
  `;
}

function renderAaduStudy(chapter: ClassicChapterView): string {
  if (chapter.board.kind !== "aadu-puli-attam") return "";
  const board = chapter.board;
  const optionIndex = new Map(chapter.options.map((option) => [option.target, option.index]));
  return `
    <div class="line-board aadu-board" role="group" aria-label="Aadu Puli Aattam movement study" aria-describedby="classicStudyDescription">
      <p id="classicStudyDescription" class="sr-only classic-study-description">${escape(chapter.description)}</p>
      <svg viewBox="-4 0 108 100" aria-hidden="true"><g>${renderBoardLines(board.points, board.lines)}</g></svg>
      ${board.points.map((point) => {
        const choice = optionIndex.get(point.id);
        if (choice !== undefined) return `<button class="board-point is-option" type="button" data-answer="${choice}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-label="${escape(chapter.options[choice].description)}"><span>${chapter.options[choice].label}</span></button>`;
        const isTiger = board.tigers.includes(point.id);
        const isGoat = board.goats.includes(point.id);
        const selected = point.id === board.source;
        const state = isTiger ? "tiger" : isGoat ? "goat" : "empty";
        return `<i class="board-point is-${state} ${selected ? "is-selected-piece" : ""}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-hidden="true"></i>`;
      }).join("")}
    </div>
  `;
}

function renderPallanguzhiStudy(chapter: ClassicChapterView): string {
  if (chapter.board.kind !== "pallanguzhi") return "";
  const board = chapter.board;
  const optionIndex = new Map(chapter.options.map((option) => [option.target, option.index]));
  const renderPit = (pit: number) => {
    const choice = optionIndex.get(pit);
    const seeds = board.pits[pit];
    const seedDots = Array.from({ length: Math.min(seeds, 8) }, () => "<i></i>").join("");
    if (choice === undefined) return `<span class="pallanguzhi-pit" aria-label="Pit with ${seeds} seeds"><span class="seed-cup" aria-hidden="true">${seedDots}</span><small>${seeds}</small></span>`;
    return `<button class="pallanguzhi-pit is-option" type="button" data-answer="${choice}" aria-label="${escape(chapter.options[choice].description)}"><span class="seed-cup" aria-hidden="true">${seedDots}</span><small>${chapter.options[choice].label} · ${seeds}</small></button>`;
  };
  return `
    <div class="pallanguzhi-board" role="group" aria-label="Pallanguzhi one-turn sowing study" aria-describedby="classicStudyDescription">
      <p id="classicStudyDescription" class="sr-only classic-study-description">${escape(chapter.description)}</p>
      <span class="sowing-arrow" aria-hidden="true">Anti-clockwise sowing <i>→</i></span>
      <div class="pit-row pit-row-top">${board.traversal.slice(7).map(renderPit).join("")}</div>
      <div class="pit-row pit-row-bottom">${board.traversal.slice(0, 7).map(renderPit).join("")}</div>
    </div>
  `;
}

function renderStack(game: StackGameDefinition): string {
  if (!active) return "";
  const diskCount = game.diskCounts[active.chapter] ?? 2;
  const selectedPeg = active.selectedPeg;
  const sourcePosition = lastStackMove ? ((lastStackMove.from + .5) / 3) * 100 : 0;
  const destinationPosition = lastStackMove ? ((lastStackMove.peg + .5) / 3) * 100 : 0;
  const traceLeft = Math.min(sourcePosition, destinationPosition);
  const traceWidth = Math.abs(destinationPosition - sourcePosition);
  const travel = destinationPosition - sourcePosition;
  const traceDiscWidth = lastStackMove ? (18 + lastStackMove.disk * 11) / 3 : 0;
  return `
    <div class="stack-instruction">
      <div class="stack-brief"><p>Move every disc from the first plinth to the third.</p><p>Only the top disc may move. A larger disc may never rest on a smaller one.</p></div>
      <span class="stack-action-rhythm" aria-hidden="true"><i>Lift</i><b></b><i>Traverse</i><b></b><i>Settle</i></span>
      <button class="quiet-action reset-stack" type="button" data-reset-stack>Reset this tower</button>
    </div>
    <div class="stack-board" data-stack-state="${lastStackMove ? "placed" : selectedPeg === null ? "ready" : "lifted"}" style="--disc-count: ${diskCount}" aria-label="Three-plinth tower puzzle">
      <span class="stack-datum" aria-hidden="true"><i></i><b>01</b><i></i><b>02</b><i></i><b>03</b><i></i></span>
      ${lastStackMove ? `<span class="stack-move-trace" data-stack-from="${lastStackMove.from}" data-stack-to="${lastStackMove.peg}" style="--stack-source: ${sourcePosition}%; --stack-travel: ${travel}cqw; --trace-left: ${traceLeft}%; --trace-width: ${traceWidth}%; --trace-disc-width: ${traceDiscWidth}cqw" aria-hidden="true"><i></i><b></b></span>` : ""}
      ${active.pegs.map((peg, pegIndex) => `
        <button class="peg ${selectedPeg === pegIndex ? "is-selected" : ""}" type="button" data-peg="${pegIndex}" aria-pressed="${selectedPeg === pegIndex}" aria-label="${describePeg(peg, pegIndex)}">
          <span class="peg-post" aria-hidden="true"></span>
          <span class="discs" aria-hidden="true">
            ${[...peg].reverse().map((disk) => `<i class="disc ${selectedPeg === pegIndex && peg.at(-1) === disk ? "is-lifted" : ""} ${lastStackMove?.peg === pegIndex && lastStackMove.disk === disk ? "is-placed" : ""}" data-disc="${disk}" style="--disc: ${disk}"></i>`).join("")}
          </span>
          <span class="peg-label">${["First", "Second", "Third"][pegIndex]} plinth</span>
        </button>
      `).join("")}
    </div>
  `;
}

function describePeg(peg: readonly number[], pegIndex: number): string {
  const name = ["First", "Second", "Third"][pegIndex];
  if (peg.length === 0) return `${name} plinth. No discs.`;
  return `${name} plinth. Discs from bottom to top: ${peg.join(", ")}. Top disc: ${peg.at(-1)}.`;
}

function answerChoice(choiceIndex: number) {
  const choice = document.querySelector<HTMLElement>(`[data-answer="${choiceIndex}"]`);
  const effect = tableLifecycle.interact({ type: "answer", choiceIndex });
  if (effect.message) {
    statusMessage = effect.message;
    const status = document.querySelector<HTMLElement>("#gameStatus");
    if (status) status.textContent = statusMessage;
  }
  if (effect.kind === "wrong") {
    choice?.classList.remove("is-wrong");
    void choice?.offsetWidth;
    choice?.classList.add("is-wrong");
    choice?.focus({ preventScroll: true });
    return;
  }
  if (effect.kind !== "chapter-complete") return;
  choice?.classList.add("is-correct");
  completeSalonChapter(effect);
}

function completeSalonChapter(effect: SalonTableEffect) {
  if (effect.kind !== "chapter-complete" || effect.completedChapter === undefined) return;
  statusMessage = "";
  const status = document.querySelector<HTMLElement>("#gameStatus");
  if (status) status.textContent = "";
  const completedChapter = effect.completedChapter;
  showCelebration(PRAISE[completedChapter]);
  playChime(completedChapter);
  const baseDelay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 720;
  const finishTransition = () => {
    const next = tableLifecycle.finishChapter(completedChapter);
    if (next.kind === "table-complete" && next.gameId && next.runId) {
      finishCompletedGame(next.gameId, next.runId);
      return;
    }
    if (next.kind !== "advanced") return;
    statusMessage = "";
    render();
    navigation.settle({ focusSelector: next.focusSelector });
  };
  scheduleChapterTransition(baseDelay, finishTransition);
}

function finishCompletedGame(gameId: GameId, runId: string, completedAt = new Date().toISOString()) {
  closeHouseAudio();
  clearChapterTransition();
  exitConfirmationPending = false;
  celebration.hidden = true;
  const game = getGame(gameId);
  const authoredUnit = game.kind === "runner" ? "Acts" : game.kind === "classic" ? "studies" : "chapters";
  const completed = houseStateStore.complete(game.id, runId, completedAt);
  memory = completed.state;
  pendingCompletion = completed.persisted ? null : { gameId, runId, completedAt };
  tableLifecycle.clear();
  main.innerHTML = `
    <section class="curtain-call" aria-labelledby="curtainTitle">
      <p class="kicker">The curtain call</p>
      <div class="curtain-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
      <h1 id="curtainTitle">${escape(game.title)}<br><em>is complete.</em></h1>
      <p>You completed all five authored ${authoredUnit}, ending with ${escape(completed.result.completionFacts.finalChapter)}.</p>
      ${completed.persisted
        ? `<p class="result-boundary" role="status">Entertainment result · ruleset ${escape(completed.result.rulesetVersion)} · stored only on this device</p>`
        : `<p class="result-boundary result-boundary-warning" role="status">Completion is safe on this screen, but it could not be stored in the Gallery.</p>`}
      <div class="curtain-actions">
        ${completed.persisted
          ? `<button class="primary-action" type="button" data-route="category">Return to ${escape(getDoorCategory(game.categoryId).title)}</button>`
          : '<button class="primary-action" type="button" data-retry-completion>Try saving again</button>'}
        ${completed.persisted ? "" : `<button class="quiet-action" type="button" data-route="category">Continue without saving</button>`}
        <button class="quiet-action" type="button" data-route="home">Grand Salon</button>
        ${completed.persisted ? '<button class="quiet-action" type="button" data-route="gallery">Visit the Gallery</button>' : ""}
      </div>
    </section>
  `;
  navigation.settle({ focusSelector: completed.persisted ? '[data-route="category"]' : "[data-retry-completion]" });
}

function renderRunnerBoundary() {
  closeHouseAudio();
  clearChapterTransition();
  exitConfirmationPending = false;
  celebration.hidden = true;
  main.innerHTML = `
    <section class="curtain-call" aria-labelledby="curtainTitle">
      <p class="kicker">The afternoon closes</p>
      <div class="curtain-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
      <h1 id="curtainTitle">Sector Sprint<br><em>has closed.</em></h1>
      <p>The afternoon has come to a close. The rest of the city can wait. No completed journey was added to the Gallery.</p>
      <p class="result-boundary">Entertainment boundary · private by design · nothing added to the Gallery</p>
      <div class="curtain-actions">
        <button class="primary-action" type="button" data-route="home">Return to the Grand Salon</button>
        <button class="quiet-action" type="button" data-route="gallery">Visit the Gallery</button>
      </div>
    </section>
  `;
  tableLifecycle.clear();
  navigation.settle({ focusSelector: '[data-route="home"]' });
}

function handleSectorTerminal(outcome: SectorSprintTerminal) {
  if (outcome.kind === "completed") finishCompletedGame("sector-sprint", outcome.runId);
  else if (outcome.kind === "boundary-closed") renderRunnerBoundary();
  else route("home");
}

function selectPeg(pegIndex: number) {
  const effect = tableLifecycle.interact({ type: "peg", pegIndex });
  if (effect.kind === "noop") return;
  statusMessage = effect.message ?? "";
  if (effect.placedDisk) {
    window.clearTimeout(stackMoveTimer);
    lastStackMove = effect.placedDisk;
    stackMoveTimer = window.setTimeout(() => {
      stackMoveTimer = 0;
      lastStackMove = null;
      document.querySelector(".stack-move-trace")?.remove();
      document.querySelectorAll(".disc.is-placed").forEach((disc) => disc.classList.remove("is-placed"));
      const board = document.querySelector<HTMLElement>(".stack-board");
      if (board?.dataset.stackState === "placed") board.dataset.stackState = active?.selectedPeg === null ? "ready" : "lifted";
    }, 620);
  }
  render();
  focusElement(effect.focusSelector ?? `[data-peg="${pegIndex}"]`);
  completeSalonChapter(effect);
}

function resetStackChapter() {
  const effect = tableLifecycle.interact({ type: "reset-stack" });
  if (effect.kind === "noop") return;
  clearStackMove();
  statusMessage = effect.message ?? "";
  render();
  focusElement(effect.focusSelector ?? '[data-peg="0"]');
}

function showCelebration(message: string) {
  window.clearTimeout(celebrationTimer);
  celebration.dataset.game = active?.gameId ?? "house";
  celebration.innerHTML = `<div class="celebration-inlay" aria-hidden="true">${Array.from({ length: 11 }, (_, index) => `<i style="--spark: ${index}"></i>`).join("")}</div><strong>${escape(message)}</strong>`;
  celebration.hidden = false;
  celebrationTimer = window.setTimeout(() => { celebration.hidden = true; }, 980);
}

function stopHouseAudioVoices() {
  for (const voice of houseAudioVoices) {
    try { voice.stop(); } catch { /* An ended optional voice needs no further work. */ }
  }
  houseAudioVoices.clear();
}

function suspendHouseAudio() {
  stopHouseAudioVoices();
  if (!houseAudioContext || houseAudioContext.state !== "running") return;
  try { void houseAudioContext.suspend().catch(() => {}); } catch { /* Audio is always optional. */ }
}

function closeHouseAudio() {
  stopHouseAudioVoices();
  const context = houseAudioContext;
  houseAudioContext = null;
  if (!context) return;
  try { void context.close().catch(() => {}); } catch { /* Audio is always optional. */ }
}

function resumeHouseAudioFromGesture() {
  if (!soundOn) return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  try {
    if (!houseAudioContext || houseAudioContext.state === "closed") houseAudioContext = new AudioContextClass();
    if (houseAudioContext.state === "suspended") void houseAudioContext.resume().catch(() => {});
  } catch { /* Sound never blocks the game. */ }
}

function playToneSequence(notes: readonly number[], type: OscillatorType, volume: number, spacing = 0.055) {
  if (!soundOn) return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  try {
    if (!houseAudioContext || houseAudioContext.state === "closed") houseAudioContext = new AudioContextClass();
    const context = houseAudioContext;
    if (context.state !== "running") return;
    const now = context.currentTime;
    notes.slice(0, Math.max(0, 8 - houseAudioVoices.size)).forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startAt = now + index * spacing;
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(volume, startAt + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.16);
      oscillator.connect(gain).connect(context.destination);
      oscillator.onended = () => houseAudioVoices.delete(oscillator);
      houseAudioVoices.add(oscillator);
      oscillator.start(startAt);
      oscillator.stop(startAt + 0.18);
    });
  } catch {
    closeHouseAudio();
  }
}

function playSectorTone(tone: SectorSprintTone, actIndex: number, complication?: string | null) {
  if (tone === "pickup") playToneSequence([294, 392, 523, 698], "sine", 0.034, 0.045);
  else if (tone === "transform") playToneSequence([196, 392, 523, 659], "sine", 0.036, 0.04);
  else if (tone === "impact") playToneSequence([110, 147, 98], "sawtooth", 0.025, 0.028);
  else if (tone === "complication") playToneSequence(complication === "sabzi-load" ? [196, 174, 147] : [330, 294, 247], "triangle", 0.024, 0.06);
  else if (tone === "release") playToneSequence([220, 330, 440], "sine", 0.022, 0.05);
  else if (tone === "lane-up") playToneSequence([247, 330], "sine", 0.018, 0.04);
  else if (tone === "lane-down") playToneSequence([330, 247], "sine", 0.018, 0.04);
  else if (tone === "tool") {
    const toolNotes = [[440, 587], [196, 247, 330], [294, 440, 587], [220, 330, 440], [262, 392, 523]] as const;
    playToneSequence(toolNotes[actIndex], actIndex === 2 ? "triangle" : "sine", 0.024, 0.035);
  } else if (tone === "cadence") {
    const frequency = [82, 98, 110, 73, 92][actIndex];
    playToneSequence([frequency, frequency * 1.5], "triangle", 0.009, 0.12);
  } else playChime(actIndex);
}

function playChime(chapter: number) {
  playToneSequence([0, 4, 7].map((offset) => 220 * 2 ** ((chapter + offset) / 12)), "sine", 0.045, 0.07);
}

document.addEventListener("click", (event) => {
  const target = event.target as Element;
  const backButton = target.closest<HTMLElement>("[data-history-back]");
  if (backButton) {
    const fallback = backButton.dataset.historyBack as View;
    navigation.back(destinationForView(fallback), backButton);
    return;
  }
  const routeButton = target.closest<HTMLElement>("[data-route]");
  if (routeButton) {
    requestRoute(routeButton.dataset.route as View, routeButton);
    return;
  }
  const categoryButton = target.closest<HTMLElement>("[data-category]");
  if (categoryButton) {
    openCategory(categoryButton.dataset.category as DoorCategoryId);
    return;
  }
  if (target.closest("[data-browse-salon]")) {
    const firstDoor = document.querySelector<HTMLElement>(".category-door");
    firstDoor?.scrollIntoView({ block: "start", behavior: "auto" });
    requestAnimationFrame(() => firstDoor?.focus({ preventScroll: true }));
    return;
  }
  const gameButton = target.closest<HTMLElement>("[data-game]");
  if (gameButton) {
    startGame(gameButton.dataset.game as GameId);
    return;
  }
  const restoreButton = target.closest<HTMLElement>("[data-restore]");
  if (restoreButton && active) {
    const choice = restoreButton.dataset.restore;
    if (choice === "continue") {
      const game = getGame(active.gameId);
      const unit = game.kind === "runner" ? "Act" : game.kind === "classic" ? "Study" : "Chapter";
      const restored = tableLifecycle.restore("continue");
      statusMessage = `${unit} ${active.chapter + 1} restored in this tab.`;
      render();
      navigation.settle({ focusSelector: restored.focusSelector });
    } else if (choice === "restart") {
      const gameId = active.gameId;
      startGame(gameId, { historyMode: "none" });
    } else if (choice === "exit") {
      discardActiveGame();
    }
    return;
  }
  const runnerRoute = target.closest<HTMLElement>("[data-runner-route]");
  if (runnerRoute) {
    beginRunnerRoute(runnerRoute.dataset.runnerRoute as "action" | "narrated");
    return;
  }
  const answerButton = target.closest<HTMLElement>("[data-answer]");
  if (answerButton) {
    answerChoice(Number(answerButton.dataset.answer));
    return;
  }
  if (target.closest("[data-cover-memory]") && active) {
    const effect = tableLifecycle.interact({ type: "memory", covered: true });
    statusMessage = effect.message ?? "";
    render();
    focusElement(effect.focusSelector ?? '[data-answer="0"]');
    return;
  }
  if (target.closest("[data-reveal-memory]") && active) {
    const effect = tableLifecycle.interact({ type: "memory", covered: false });
    statusMessage = effect.message ?? "";
    render();
    focusElement(effect.focusSelector ?? "[data-cover-memory]");
    return;
  }
  if (target.closest("[data-reset-stack]")) {
    resetStackChapter();
    return;
  }
  if (target.closest("[data-retry-completion]") && pendingCompletion) {
    const retry = pendingCompletion;
    finishCompletedGame(retry.gameId, retry.runId, retry.completedAt);
    return;
  }
  if (target.closest("[data-clear-gallery]")) {
    const completedCount = Object.keys(memory.latestByGame).length;
    if (completedCount === 0) return;
    galleryClearReturnFocus = target.closest<HTMLElement>("[data-clear-gallery]");
    galleryClearCount.textContent = `${completedCount} saved ${completedCount === 1 ? "reading" : "readings"}`;
    galleryClearDialog.showModal();
    requestAnimationFrame(() => cancelGalleryClearButton.focus({ preventScroll: true }));
    return;
  }
  const pegButton = target.closest<HTMLElement>("[data-peg]");
  if (pegButton) selectPeg(Number(pegButton.dataset.peg));
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    pauseChapterTransition();
  }
  else {
    resumeChapterTransition();
  }
});

window.addEventListener("blur", () => {
  pauseChapterTransition();
});

window.addEventListener("focus", () => {
  resumeChapterTransition();
});

matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
  if (!event.matches) return;
  if (pendingRunnerChoice) beginRunnerRoute("narrated");
});

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  if (!soundOn) closeHouseAudio();
  soundButton.ariaPressed = String(soundOn);
  soundButton.textContent = soundOn ? "Sound on" : "Sound off";
});

enterHouseButton.addEventListener("click", (event) => {
  event.preventDefault();
  houseStateStore.acknowledgeAudience();
  audienceDialog.close("enter");
  window.scrollTo({ left: 0, top: 0, behavior: "auto" });
  document.querySelector<HTMLElement>(currentViewHeadingSelector())?.focus({ preventScroll: true });
});

audienceDialog.addEventListener("cancel", (event) => event.preventDefault());

galleryClearDialog.addEventListener("close", () => {
  const focusTarget = galleryClearReturnFocus;
  galleryClearReturnFocus = null;
  if (galleryClearDialog.returnValue === "cancel" && focusTarget?.isConnected) {
    requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
  }
});

galleryClearDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  galleryClearDialog.close("cancel");
});

confirmGalleryClearButton.addEventListener("click", () => {
  const cleared = houseStateStore.clearGallery();
  memory = houseStateStore.gallery();
  galleryClearDialog.close("confirmed");
  statusMessage = cleared
    ? "Gallery cleared. No completed readings remain in this browser."
    : "The Gallery could not be fully cleared. Your visible readings were kept.";
  renderGallery();
  navigation.settle({ focusSelector: cleared ? "#galleryTitle" : "[data-clear-gallery]" });
});

keepPlayingButton.addEventListener("click", () => {
  navigation.cancelExit(true);
});

leaveTableButton.addEventListener("click", () => {
  discardActiveGame();
});

leaveDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  navigation.cancelExit(false);
});

if (!houseStateStore.audienceAcknowledged()) audienceDialog.showModal();

window.__house = {
  get view() { return view; },
  get active() { return active ? structuredClone(active) : null; },
  get memory() { return structuredClone(memory); },
  get runner() { return sectorTable.view().runner; },
  start: startGame,
  openCategory,
  answer: answerChoice,
};

if ("serviceWorker" in navigator) {
  addEventListener("load", () => { navigator.serviceWorker.register("./sw.js"); });
}

navigation.start();
