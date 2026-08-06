import "@fontsource-variable/newsreader";
import "@fontsource-variable/geist";
import "../../../tokens.css";
import "./house.css";
import runnerCharacterSheetUrl from "./assets/sector-sprint-characters.png?url";
import {
  DOOR_CATEGORIES,
  GAMES,
  HOUSE_AUDIENCE_KEY,
  HOUSE_LEGACY_STORAGE_KEY,
  HOUSE_STORAGE_KEY,
  completeEntertainmentGame,
  getDoorCategory,
  getGame,
  initialPegs,
  isLegalStackMove,
  isValidStackState,
  moveStackDisc,
  readHouseState,
  stackSolved,
  writeHouseState,
  type GameDefinition,
  type GameId,
  type HouseState,
  type DoorCategoryId,
} from "./house-core";
import {
  AADU_LINES,
  AADU_POINTS,
  NAVAKANKARI_MILLS,
  NAVAKANKARI_POINTS,
  PALLANGUZHI_TRAVERSAL,
  describeAaduChapter,
  describeAaduOption,
  describeNavakankariChapter,
  describeNavakankariOption,
  describePallanguzhiChapter,
  describePallanguzhiOption,
  getClassicStudy,
  type AaduChapter,
  type NavakankariChapter,
  type PallanguzhiChapter,
} from "./classic-studies";
import {
  RUNNER_ACTS,
  RUNNER_ACTION_ROUTE_MINIMUM_MS,
  RUNNER_ACT_SECONDS,
  RUNNER_DPR_CAP,
  RUNNER_FIXED_STEP_MS,
  RUNNER_HEIGHT,
  RUNNER_MAX_CATCH_UP_STEPS,
  RUNNER_PLAYER_SCREEN_X,
  RUNNER_SESSION_SECONDS,
  RUNNER_WIDTH,
  createRunnerState,
  drawRunnerFrame,
  runnerRenderQualityForIntervals,
  runnerUpcomingInstruction,
  stepRunner,
  type RunnerInput,
  type RunnerPalette,
  type RunnerRenderQuality,
  type RunnerState,
} from "./sector-sprint";

type View = "home" | "category" | "gallery" | "game";

type ActiveGame = {
  gameId: GameId;
  chapter: number;
  runId: string;
  memoryCovered: boolean;
  pegs: number[][];
  selectedPeg: number | null;
  resolving: boolean;
  storyBeat: number | null;
  touched: boolean;
};

type DebugHouse = {
  readonly view: View;
  readonly active: ActiveGame | null;
  readonly memory: HouseState;
  readonly runner: RunnerState | null;
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
const celebration = requiredElement<HTMLElement>("#celebration");

const ACTIVE_KEY = "nindova:house:active:v1";
const runnerReviewMode = new URLSearchParams(location.search).get("review") === "1";
const PRAISE = ["Well seen.", "Exact.", "Beautifully read.", "The order holds.", "A complete reading."] as const;
let memory = readHouseState(localStorage).state;
let view: View = "home";
let selectedCategory: DoorCategoryId | null = null;
let runnerRestoreWasDiscarded = false;
let active: ActiveGame | null = restoreActiveGame();
let restoreDecisionPending = Boolean(active);
let pendingRunnerChoice = false;
let exitReturnFocus: HTMLElement | null = null;
let exitConfirmationPending = false;
let soundOn = false;
let statusMessage = "";
let celebrationTimer = 0;
let runnerState: RunnerState | null = null;
let runnerFrame = 0;
let runnerLastTimestamp = 0;
let runnerSessionElapsedMs = 0;
let runnerInput: RunnerInput = {};
let runnerActivePointerId: number | null = null;
let runnerActivePointerAction: "up" | "down" | "tool" | null = null;
let runnerAccumulatorMs = 0;
let runnerRenderQuality: RunnerRenderQuality = "high";
let runnerFrameIntervals: number[] = [];
let runnerPaused = false;
let runnerInterrupted = false;
let runnerBoundaryTimer = 0;
let runnerBoundaryStartedAt: number | null = null;
let runnerPaletteCache: RunnerPalette | null = null;
let chapterTransitionTimer = 0;
let chapterTransitionRemainingMs = 0;
let chapterTransitionStartedAt: number | null = null;
let chapterTransitionCallback: (() => void) | null = null;
let runnerRenderSequence = 0;
let houseAudioContext: AudioContext | null = null;
const houseAudioVoices = new Set<OscillatorNode>();
let lastStackMove: { peg: number; disk: number } | null = null;
let runnerCharacterSheet: HTMLImageElement | null = null;

function ensureRunnerCharacterSheet() {
  if (runnerCharacterSheet) return;
  const sheet = new Image();
  sheet.decoding = "async";
  sheet.addEventListener("load", () => drawCurrentRunnerFrame());
  sheet.src = runnerCharacterSheetUrl;
  runnerCharacterSheet = sheet;
  void sheet.decode().then(() => drawCurrentRunnerFrame(), () => undefined);
}

if (active) {
  view = "game";
  selectedCategory = getGame(active.gameId).categoryId;
}

function restoreActiveGame(): ActiveGame | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(ACTIVE_KEY) ?? "null") as Partial<ActiveGame> | null;
    if (!parsed || !GAMES.some((game) => game.id === parsed.gameId)) return null;
    const game = getGame(parsed.gameId as GameId);
    const chapter = Number(parsed.chapter);
    if (!Number.isInteger(chapter) || chapter < 0 || chapter > 4 || typeof parsed.runId !== "string") return null;
    if (game.kind === "runner") {
      sessionStorage.removeItem(ACTIVE_KEY);
      runnerRestoreWasDiscarded = true;
      return null;
    }
    const diskCount = game.diskCounts?.[chapter] ?? 0;
    const pegs = game.kind === "stack" && isValidStackState(parsed.pegs, diskCount)
      ? parsed.pegs.map((peg) => [...peg])
      : initialPegs(diskCount);
    return {
      gameId: game.id,
      chapter,
      runId: parsed.runId,
      memoryCovered: Boolean(parsed.memoryCovered),
      pegs,
      selectedPeg: null,
      resolving: false,
      storyBeat: null,
      touched: Boolean(parsed.touched)
        || chapter > 0
        || Boolean(parsed.memoryCovered)
        || (game.kind === "stack" && JSON.stringify(pegs) !== JSON.stringify(initialPegs(diskCount))),
    };
  } catch {
    return null;
  }
}

function saveActiveGame() {
  try {
    if (active) {
      const game = getGame(active.gameId);
      const stored = game.kind === "runner"
        ? { gameId: active.gameId, chapter: active.chapter, runId: active.runId, storyBeat: active.storyBeat }
        : active;
      sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(stored));
    }
    else sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Same-tab recovery is optional; the games remain fully usable without storage.
  }
}

function hashForView(next: View): string {
  if (next === "category" && selectedCategory) return `#door/${selectedCategory}`;
  if (next === "game" && (active || pendingRunnerChoice)) return `#game/${active?.gameId ?? "sector-sprint"}`;
  if (next === "gallery") return "#gallery";
  return "";
}

function writeRouteHash(next: View, replace = false) {
  const hash = hashForView(next);
  if (location.hash === hash) return;
  const url = `${location.pathname}${location.search}${hash}`;
  history[replace ? "replaceState" : "pushState"]({ nindovaHouse: true }, "", url);
}

function route(next: View) {
  const leavingGame = view === "game" && next !== "game";
  stopRunnerLoop();
  closeHouseAudio();
  if (next !== "game") clearChapterTransition();
  view = next;
  if (next === "home") selectedCategory = null;
  if (next !== "game") {
    active = null;
    pendingRunnerChoice = false;
    restoreDecisionPending = false;
    exitConfirmationPending = false;
    saveActiveGame();
  }
  statusMessage = "";
  writeRouteHash(next, leavingGame);
  render();
  main.focus({ preventScroll: true });
}

function hasMeaningfulProgress(candidate: ActiveGame): boolean {
  const game = getGame(candidate.gameId);
  if (game.kind === "runner") return true;
  if (candidate.chapter > 0 || candidate.memoryCovered || candidate.touched || candidate.selectedPeg !== null) return true;
  if (game.kind !== "stack") return false;
  const diskCount = game.diskCounts?.[candidate.chapter] ?? 0;
  return JSON.stringify(candidate.pegs) !== JSON.stringify(initialPegs(diskCount));
}

function requestRoute(next: View, invoker: HTMLElement | null = null) {
  if (next !== "game" && view === "game" && active && !restoreDecisionPending && hasMeaningfulProgress(active)) {
    exitReturnFocus = invoker ?? document.activeElement as HTMLElement | null;
    exitConfirmationPending = true;
    stopRunnerLoop();
    pauseChapterTransition();
    suspendHouseAudio();
    leaveDialog.showModal();
    focusElement("#keepPlayingButton");
    return;
  }
  route(next);
}

function discardActiveGame() {
  leaveDialog.close("leave");
  exitConfirmationPending = false;
  active = null;
  restoreDecisionPending = false;
  pendingRunnerChoice = false;
  saveActiveGame();
  route(selectedCategory ? "category" : "home");
}

function openCategory(categoryId: DoorCategoryId) {
  getDoorCategory(categoryId);
  selectedCategory = categoryId;
  route("category");
}

function startGame(gameId: GameId) {
  const game = getGame(gameId);
  selectedCategory = game.categoryId;
  stopRunnerLoop();
  closeHouseAudio();
  clearChapterTransition();
  runnerState = null;
  runnerSessionElapsedMs = 0;
  runnerPaused = false;
  runnerPaletteCache = null;
  runnerAccumulatorMs = 0;
  runnerRenderQuality = "high";
  runnerFrameIntervals = [];
  lastStackMove = null;
  restoreDecisionPending = false;
  if (game.kind === "runner" && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    ensureRunnerCharacterSheet();
    active = null;
    pendingRunnerChoice = true;
    view = "game";
    statusMessage = "";
    saveActiveGame();
    writeRouteHash("game");
    render();
    focusElement('[data-runner-route="action"]');
    return;
  }
  pendingRunnerChoice = false;
  active = {
    gameId,
    chapter: 0,
    runId: crypto.randomUUID(),
    memoryCovered: false,
    pegs: initialPegs(game.diskCounts?.[0] ?? 0),
    selectedPeg: null,
    resolving: false,
    storyBeat: game.kind === "runner" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : null,
    touched: false,
  };
  view = "game";
  statusMessage = "";
  saveActiveGame();
  writeRouteHash("game");
  render();
  main.focus({ preventScroll: true });
}

function beginRunnerRoute(routeChoice: "action" | "narrated") {
  if (!pendingRunnerChoice && active) return;
  const game = getGame("sector-sprint");
  pendingRunnerChoice = false;
  active = {
    gameId: game.id,
    chapter: 0,
    runId: crypto.randomUUID(),
    memoryCovered: false,
    pegs: [],
    selectedPeg: null,
    resolving: false,
    storyBeat: routeChoice === "narrated" ? 0 : null,
    touched: false,
  };
  view = "game";
  if (routeChoice === "action") {
    ensureRunnerCharacterSheet();
    runnerRenderQuality = matchMedia("(max-width: 480px)").matches ? "balanced" : "high";
  }
  statusMessage = routeChoice === "narrated" ? "The narrated city route is ready." : "The lane route begins gently. One architectural contact pauses this Action attempt.";
  saveActiveGame();
  render();
  focusFirstGameControl();
}

function escape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function gameSigil(gameId: GameId): string {
  const pieces = gameId === "sector-sprint" ? 5 : gameId === "stack-architect" ? 3 : 4;
  return `<span class="game-sigil game-sigil-${gameId}" aria-hidden="true">${Array.from({ length: pieces }, (_, index) => `<i style="--sigil-index:${index}"></i>`).join("")}</span>`;
}

function categorySigil(categoryId: DoorCategoryId): string {
  return `<span class="category-sigil category-sigil-${categoryId}" aria-hidden="true">${Array.from({ length: 5 }, (_, index) => `<i style="--sigil-index:${index}"></i>`).join("")}</span>`;
}

function render() {
  if (view === "home") renderHome();
  else if (view === "category") renderCategory();
  else if (view === "gallery") renderGallery();
  else renderGame();
}

function focusElement(selector: string) {
  requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }));
}

function focusFirstGameControl() {
  if (!active) return;
  const game = getGame(active.gameId);
  if (game.kind === "runner") focusElement(
    runnerState?.failed
      ? runnerRetryAvailable() ? "[data-runner-retry]" : "[data-runner-story]"
      : active.storyBeat === null ? '[data-runner-action="up"]' : "[data-story-advance]",
  );
  else if (game.kind === "stack") focusElement('[data-peg="0"]');
  else if (game.kind === "memory" && !active.memoryCovered) focusElement("[data-cover-memory]");
  else focusElement('[data-answer="0"]');
}

function renderHome() {
  main.innerHTML = `
    <section class="house-intro" aria-labelledby="houseTitle">
      <p class="kicker">A private house of authored games</p>
      <h1 id="houseTitle">Choose a room.<br><em>Stay for the pleasure of solving.</em></h1>
      <p class="house-lede">Five doors hold eight games, each arranged in five deliberate chapters or studies. Nothing is ranked, broadcast, or compared with other people.</p>
      ${runnerRestoreWasDiscarded ? '<p class="runner-restore-note" role="status">A previous Sector Sprint page closed on reload so its authored boundary could not be extended. No completion was recorded.</p>' : ""}
    </section>
    <section class="floor-plan" aria-label="Nindova House rooms">
      <a class="room room-night" href="../play/">
        <span class="room-number">North wing</span>
        <span class="room-title">The Night Room</span>
        <span class="room-copy">Masala Mound keeps its bounded Night contract, protected by the full regression suite.</span>
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
              ${categorySigil(category.id)}
              <span class="game-number">${category.number}</span>
              <span class="game-title">${escape(category.title)}</span>
              <span class="game-line">${escape(category.houseLine)}</span>
              <span class="game-enter">Open door · ${category.gameIds.length} ${category.gameIds.length === 1 ? "table" : "tables"}</span>
            </button>
          `).join("")}
          <div class="salon-compass" aria-hidden="true"><span>N</span><i></i></div>
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
        <button class="back-link" type="button" data-route="home"><span aria-hidden="true">←</span> Grand Salon</button>
        <span class="category-door-mark">Door ${category.number}</span>
      </header>
      <div class="category-aperture" aria-hidden="true"><i></i><i></i><i></i><i></i><span></span></div>
      <div class="category-heading">
        <p class="kicker">Door ${category.number}</p>
        <h1 id="categoryTitle">${escape(category.title)}</h1>
        <p class="house-lede">${escape(category.description)}</p>
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
  main.innerHTML = `
    <section class="gallery-view" aria-labelledby="galleryTitle">
      <button class="back-link" type="button" data-route="home"><span aria-hidden="true">←</span> House plan</button>
      <p class="kicker">The west gallery</p>
      <h1 id="galleryTitle">Recent readings,<br><em>kept without judgment.</em></h1>
      <p class="house-lede">This is a local continuity ledger, not a profile. Each game replaces its own previous entry.</p>
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
      <button class="clear-gallery" type="button" data-clear-gallery>Clear this Gallery</button>
    </section>
  `;
}

function renderGame() {
  if (!active && !pendingRunnerChoice) return route("home");
  const game = pendingRunnerChoice ? getGame("sector-sprint") : getGame(active!.gameId);
  const chapter = active?.chapter ?? 0;
  const chapterTitle = pendingRunnerChoice
    ? "Choose your route"
    : game.kind === "classic"
      ? getClassicStudy(game.classicStudyId!).chapters[chapter]?.title
      : game.kind === "stack"
      ? `${game.diskCounts?.[chapter]}-disc tower`
      : game.kind === "runner"
        ? RUNNER_ACTS[chapter]?.title
        : game.chapters[chapter]?.title;
  const authoredUnit = game.kind === "runner" ? "Act" : game.kind === "classic" ? "Study" : "Chapter";
  main.innerHTML = `
    <section class="game-view game-view-${game.id}" aria-labelledby="gameTitle">
      <header class="game-masthead">
        <button class="back-link" type="button" data-route="category"><span aria-hidden="true">←</span> ${escape(getDoorCategory(game.categoryId).title)}</button>
        <div class="chapter-mark"><span>${pendingRunnerChoice ? "Before Act I" : `${authoredUnit} ${chapter + 1}`}</span><i aria-hidden="true"></i><span>${pendingRunnerChoice ? "Route choice" : "of 5"}</span></div>
      </header>
      <div class="game-title-block ${game.kind === "runner" ? "game-title-block-runner" : ""}">
        <p class="kicker">Table ${game.number} · ${escape(chapterTitle ?? authoredUnit)}</p>
        <h1 id="gameTitle">${escape(game.title)}</h1>
        <p>${escape(game.description)}</p>
      </div>
      <div class="game-chamber game-chamber-${game.id}">
        ${pendingRunnerChoice
          ? renderRunnerPrelude()
          : restoreDecisionPending
            ? renderRestoreGate(game)
            : game.kind === "runner"
              ? renderRunner()
              : game.kind === "stack"
                ? renderStack(game)
                : game.kind === "classic"
                  ? renderClassicStudy(game)
                  : renderChoice(game)}
      </div>
      <p id="gameStatus" class="game-status" role="status" aria-live="polite">${escape(statusMessage)}</p>
    </section>
  `;
  if (game.kind === "runner" && active && !restoreDecisionPending) mountRunner();
}

function renderRestoreGate(game: GameDefinition): string {
  if (!active) return "";
  const unit = game.kind === "runner" ? "Act" : game.kind === "classic" ? "Study" : "Chapter";
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
  return `
    <section class="table-gate runner-prelude" aria-labelledby="runnerPreludeTitle">
      <div class="route-miniature" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><span></span></div>
      <p class="kicker">Choose how the city moves</p>
      <h2 id="runnerPreludeTitle">One route. Two ways through.</h2>
      <p>Action starts a progressively faster three-lane route. Follow each marker: Hold lane, Move up, or Move down. Every gate requires at most one adjacent move across five authored Acts. Narrated follows the same city with text controls and no precision requirement. Both remain inside the same fixed table boundary.</p>
      <div class="route-choices">
        <button class="route-choice route-choice-action" type="button" data-runner-route="action">
          <span>Action route</span><strong>Enter the lane route</strong><small>Keyboard or touch · follow each lane marker</small>
        </button>
        <button class="route-choice" type="button" data-runner-route="narrated">
          <span>Narrated route</span><strong>Read the city</strong><small>No motion, precision, sight, or sound required</small>
        </button>
      </div>
      <p class="gate-note">The authored foreground boundary begins only after you choose a route. Reloading an active Sector Sprint still closes it without recording a completion.</p>
    </section>
  `;
}

function runnerEffectLabel(state: RunnerState | null, act: (typeof RUNNER_ACTS)[number]): string {
  if (!state) return "No temporary effect";
  if (state.activeComplicationId) {
    return act.complications.find((candidate) => candidate.id === state.activeComplicationId)?.label ?? "Comic complication";
  }
  if (state.activePower) return act.pickups.find((candidate) => candidate.kind === state.activePower)?.label ?? "Temporary effect";
  return "No temporary effect";
}

function renderRunner(): string {
  if (!active) return "";
  const act = RUNNER_ACTS[active.chapter];
  if (!act) return "";
  const activePowerLabel = runnerEffectLabel(runnerState, act);
  const failed = Boolean(runnerState?.failed);
  const retryAvailable = failed && runnerRetryAvailable();
  if (active.storyBeat !== null) {
    const beat = act.storyBeats[active.storyBeat] ?? act.storyBeats[0];
    return `
      <section class="runner-story" aria-labelledby="runnerStoryTitle">
        <div class="runner-story-heading">
          <span>${escape(act.location)}</span>
          <h2 id="runnerStoryTitle">The narrated route</h2>
          <p>${escape(act.houseCall)}</p>
        </div>
        <article class="runner-story-beat">
          <span>City beat ${active.storyBeat + 1} of ${act.storyBeats.length}</span>
          <p>${escape(beat)}</p>
        </article>
        <div class="runner-story-actions">
          <button class="primary-action" type="button" data-story-advance>${active.storyBeat === act.storyBeats.length - 1 ? "Finish this Act" : "Next city beat"}</button>
          <button class="quiet-action" type="button" data-runner-pause aria-pressed="${runnerPaused}">${runnerPaused ? "Resume city" : "Pause city"}</button>
        </div>
        <p class="runner-route-note">Same story, same curtain call, and the same private entertainment provenance. No timed response, precision, sound, or visual interpretation is required. The table still closes at its authored boundary; Pause city holds time while narrated beats remain available.</p>
      </section>
    `;
  }
  return `
    <section class="runner-shell" aria-labelledby="runnerActTitle">
      <header class="runner-brief">
        <div><span>Act ${active.chapter + 1} scene · ${escape(act.location)}</span><h2 id="runnerActTitle">${escape(act.title)}</h2></div>
      </header>
      <figure class="runner-stage-frame">
        <div class="runner-canvas-window" ${failed ? 'data-runner-failed="true"' : ""}><canvas id="runnerCanvas" width="${RUNNER_WIDTH}" height="${RUNNER_HEIGHT}" aria-label="${escape(act.title)}. An original three-lane route through Chandigarh. Follow the next marker: Hold lane, Move up, or Move down. Each gate requires at most one adjacent move. One architectural contact ends this Action attempt." aria-describedby="runnerInstructions runnerApproach runnerLive runnerToolLine"></canvas></div>
        <div class="runner-action-hud" aria-label="Current action set"><span>Act-local tool</span><strong id="runnerToolLabel">${escape(act.toolLabel)}</strong><span id="runnerPowerLabel">${escape(activePowerLabel)}</span></div>
        <figcaption><span>${escape(act.sign)}</span><span>Original illustrated action theatre · fixed authored route</span></figcaption>
      </figure>
      <div class="runner-status-deck">
        <p id="runnerApproach" class="runner-approach"><span>${failed ? "Route state" : "Next passage"}</span><strong>${failed ? "One-hit wipeout" : escape(act.obstacles[0]?.label ?? act.closing)}</strong></p>
        <p id="runnerLive" class="runner-live" role="status" aria-live="polite">${escape(runnerState?.message ?? act.opening)}</p>
      </div>
      ${failed ? `
        <section class="runner-recovery" aria-labelledby="runnerRecoveryTitle" aria-describedby="runnerInstructions runnerRecoveryBoundary">
          <div><p class="kicker">Action route paused</p><h3 id="runnerRecoveryTitle">The lane closed. The city holds.</h3></div>
          <p id="runnerInstructions">This attempt ended on one contact. No life, score, checkpoint, or failure history is kept.</p>
          <div class="runner-recovery-actions">
            <button class="primary-action" type="button" data-runner-retry ${retryAvailable ? "" : "disabled"}>Retry Action from Act I</button>
            <button class="quiet-action" type="button" data-runner-story>Continue narrated</button>
            <button class="text-action" type="button" data-runner-abandon>Return to the Grand Salon</button>
          </div>
          <p id="runnerRecoveryBoundary" class="runner-route-note">${retryAvailable ? "Retry uses the same foreground boundary; it does not restart the table." : "The boundary is too near for a complete five-Act Action retry."} Narrated beats remain available from this Act while the same boundary remains, and may close before the final curtain.</p>
          <p id="runnerToolLine" class="runner-recovery-detail"><strong>${escape(act.toolLabel)}</strong> remains harmless choreography; only a lit architectural face ends an attempt.</p>
        </section>
      ` : `
        <div class="runner-controls" aria-label="Sector Sprint controls">
          <button class="runner-control-primary" type="button" data-runner-action="up"><i class="runner-control-mark runner-control-mark-up" aria-hidden="true"></i><span>Move up</span><small>↑ · W · one press</small></button>
          <button class="runner-control-primary" type="button" data-runner-action="down"><i class="runner-control-mark runner-control-mark-down" aria-hidden="true"></i><span>Move down</span><small>↓ · S · one press</small></button>
          <button class="runner-control-primary" type="button" data-runner-action="tool"><i class="runner-control-mark runner-control-mark-spark" aria-hidden="true"></i><span>${escape(act.toolLabel)}</span><small>J · K · X</small></button>
          <button class="runner-control-quiet" type="button" data-runner-pause aria-pressed="${runnerPaused}"><i class="runner-control-mark runner-control-mark-pause" aria-hidden="true"></i><span>${runnerPaused ? "Resume city" : "Pause city"}</span><small>Movement and sound</small></button>
          <button class="runner-control-quiet" type="button" data-runner-story><i class="runner-control-mark runner-control-mark-story" aria-hidden="true"></i><span>Narrated route</span><small>No precision needed</small></button>
        </div>
        <div class="runner-copy-deck">
          <p id="runnerToolLine"><strong>${escape(act.toolLabel)}</strong> · ${escape(act.toolLine)}</p>
          <p id="runnerInstructions" class="runner-instructions">Follow the marker: Hold lane, Move up, or Move down. Each gate requires at most one adjacent move. The route begins gently and gains speed across the five Acts. One touch on a lit architectural face ends this Action attempt. Comic targets and tools are harmless.</p>
          <p class="runner-house-call">${escape(act.houseCall)}</p>
        </div>
      `}
    </section>
  `;
}

function renderChoice(game: GameDefinition): string {
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
    if (covered) return `<div class="lantern-veil" aria-hidden="true"><i></i><span>The velvet is drawn.</span><i></i></div>`;
    const lanterns = display.split(" · ");
    return `<div class="lantern-procession" aria-hidden="true">${lanterns.map((name, index) => `
      <span class="lantern lantern-${name.toLowerCase()}" style="--lantern-index:${index}"><i></i><small>${escape(name)}</small></span>
    `).join("")}</div>`;
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

function renderClassicStudy(game: GameDefinition): string {
  if (!active || !game.classicStudyId) return "";
  const study = getClassicStudy(game.classicStudyId);
  const chapter = study.chapters[active.chapter];
  let studyBoard = "";
  if (study.id === "navakankari") studyBoard = renderNavakankariStudy(chapter as NavakankariChapter);
  if (study.id === "aadu-puli-attam") studyBoard = renderAaduStudy(chapter as AaduChapter);
  if (study.id === "pallanguzhi") studyBoard = renderPallanguzhiStudy(chapter as PallanguzhiChapter);
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

function renderNavakankariStudy(chapter: NavakankariChapter): string {
  const optionIndex = new Map(chapter.options.map((point, index) => [point, index]));
  return `
    <div class="line-board navakankari-board" role="group" aria-label="Navakankari placement study" aria-describedby="classicStudyDescription">
      <p id="classicStudyDescription" class="sr-only classic-study-description">${escape(describeNavakankariChapter(chapter))}</p>
      <svg viewBox="-4 -4 108 108" aria-hidden="true"><g>${renderBoardLines(NAVAKANKARI_POINTS, NAVAKANKARI_MILLS)}</g></svg>
      ${NAVAKANKARI_POINTS.map((point) => {
        const choice = optionIndex.get(point.id);
        const state = chapter.own.includes(point.id) ? "own" : chapter.occupied.includes(point.id) ? "occupied" : "empty";
        if (choice !== undefined) return `<button class="board-point is-option" type="button" data-answer="${choice}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-label="${escape(describeNavakankariOption(chapter, choice))}"><span>${String.fromCharCode(65 + choice)}</span></button>`;
        return `<i class="board-point is-${state}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-hidden="true"></i>`;
      }).join("")}
    </div>
  `;
}

function renderAaduStudy(chapter: AaduChapter): string {
  const optionIndex = new Map(chapter.options.map((point, index) => [point, index]));
  return `
    <div class="line-board aadu-board" role="group" aria-label="Aadu Puli Aattam movement study" aria-describedby="classicStudyDescription">
      <p id="classicStudyDescription" class="sr-only classic-study-description">${escape(describeAaduChapter(chapter))}</p>
      <svg viewBox="-4 0 108 100" aria-hidden="true"><g>${renderBoardLines(AADU_POINTS, AADU_LINES)}</g></svg>
      ${AADU_POINTS.map((point) => {
        const choice = optionIndex.get(point.id);
        if (choice !== undefined) return `<button class="board-point is-option" type="button" data-answer="${choice}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-label="${escape(describeAaduOption(chapter, choice))}"><span>${String.fromCharCode(65 + choice)}</span></button>`;
        const isTiger = chapter.tigers.includes(point.id);
        const isGoat = chapter.goats.includes(point.id);
        const selected = point.id === chapter.source;
        const state = isTiger ? "tiger" : isGoat ? "goat" : "empty";
        return `<i class="board-point is-${state} ${selected ? "is-selected-piece" : ""}" style="--point-x:${point.x}%;--point-y:${point.y}%" aria-hidden="true"></i>`;
      }).join("")}
    </div>
  `;
}

function renderPallanguzhiStudy(chapter: PallanguzhiChapter): string {
  const optionIndex = new Map(chapter.options.map((pit, index) => [pit, index]));
  const renderPit = (pit: number) => {
    const choice = optionIndex.get(pit);
    const seeds = chapter.board[pit];
    const seedDots = Array.from({ length: Math.min(seeds, 8) }, () => "<i></i>").join("");
    if (choice === undefined) return `<span class="pallanguzhi-pit" aria-label="Pit with ${seeds} seeds"><span class="seed-cup" aria-hidden="true">${seedDots}</span><small>${seeds}</small></span>`;
    return `<button class="pallanguzhi-pit is-option" type="button" data-answer="${choice}" aria-label="${escape(describePallanguzhiOption(chapter, choice))}"><span class="seed-cup" aria-hidden="true">${seedDots}</span><small>${String.fromCharCode(65 + choice)} · ${seeds}</small></button>`;
  };
  return `
    <div class="pallanguzhi-board" role="group" aria-label="Pallanguzhi one-turn sowing study" aria-describedby="classicStudyDescription">
      <p id="classicStudyDescription" class="sr-only classic-study-description">${escape(describePallanguzhiChapter(chapter))}</p>
      <span class="sowing-arrow" aria-hidden="true">Anti-clockwise sowing <i>→</i></span>
      <div class="pit-row pit-row-top">${[...PALLANGUZHI_TRAVERSAL].slice(7).map(renderPit).join("")}</div>
      <div class="pit-row pit-row-bottom">${[...PALLANGUZHI_TRAVERSAL].slice(0, 7).map(renderPit).join("")}</div>
    </div>
  `;
}

function renderStack(game: GameDefinition): string {
  if (!active) return "";
  const diskCount = game.diskCounts?.[active.chapter] ?? 2;
  return `
    <div class="stack-instruction">
      <div><p>Move every disc from the first plinth to the third.</p><p>Only the top disc may move. A larger disc may never rest on a smaller one.</p></div>
      <button class="quiet-action reset-stack" type="button" data-reset-stack>Reset this tower</button>
    </div>
    <div class="stack-board" style="--disc-count: ${diskCount}" aria-label="Three-plinth tower puzzle">
      ${active.pegs.map((peg, pegIndex) => `
        <button class="peg ${active?.selectedPeg === pegIndex ? "is-selected" : ""}" type="button" data-peg="${pegIndex}" aria-pressed="${active?.selectedPeg === pegIndex}" aria-label="${describePeg(peg, pegIndex)}">
          <span class="peg-post" aria-hidden="true"></span>
          <span class="discs" aria-hidden="true">
            ${[...peg].reverse().map((disk) => `<i class="disc ${lastStackMove?.peg === pegIndex && lastStackMove.disk === disk ? "is-placed" : ""}" data-disc="${disk}" style="--disc: ${disk}"></i>`).join("")}
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

function runnerPalette(): RunnerPalette {
  if (runnerPaletteCache) return runnerPaletteCache;
  const styles = getComputedStyle(document.documentElement);
  const token = (name: string) => styles.getPropertyValue(name).trim();
  runnerPaletteCache = {
    paper: token("--color-paper"),
    paper2: token("--color-paper-2"),
    paper3: token("--color-paper-3"),
    rule: token("--color-rule-strong"),
    neutral: token("--color-neutral"),
    muted: token("--color-muted"),
    ink: token("--color-ink"),
    inkSoft: token("--color-ink-soft"),
    accent: token("--color-accent"),
    accentSoft: token("--color-accent-soft"),
    ruby: token("--color-jewel-ruby"),
    sapphire: token("--color-jewel-sapphire"),
    jade: token("--color-jewel-jade"),
    fontDisplay: token("--font-display"),
    fontBody: token("--font-body"),
    fontMono: token("--font-mono"),
  };
  return runnerPaletteCache;
}

function runnerIsSuspended(): boolean {
  return runnerPaused || runnerInterrupted || exitConfirmationPending || document.hidden;
}

function runnerRemainingMs(): number {
  const activeBoundaryTime = runnerBoundaryStartedAt !== null ? Math.max(0, performance.now() - runnerBoundaryStartedAt) : 0;
  return Math.max(0, RUNNER_SESSION_SECONDS * 1_000 - runnerSessionElapsedMs - activeBoundaryTime);
}

function runnerRetryAvailable(): boolean {
  return runnerRemainingMs() >= RUNNER_ACTION_ROUTE_MINIMUM_MS;
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
  if (!chapterTransitionCallback || chapterTransitionTimer || runnerIsSuspended()) return;
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

function stopRunnerLoop() {
  if (runnerFrame) cancelAnimationFrame(runnerFrame);
  runnerFrame = 0;
  if (runnerBoundaryTimer) window.clearTimeout(runnerBoundaryTimer);
  runnerBoundaryTimer = 0;
  if (runnerBoundaryStartedAt !== null) {
    runnerSessionElapsedMs += Math.max(0, performance.now() - runnerBoundaryStartedAt);
    runnerBoundaryStartedAt = null;
  }
  runnerLastTimestamp = 0;
  runnerAccumulatorMs = 0;
  runnerActivePointerId = null;
  runnerActivePointerAction = null;
  runnerInput = {};
  if (runnerState) runnerState = { ...runnerState, pendingLaneDelta: null };
  document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => {
    delete control.dataset.pressed;
  });
  pauseChapterTransition();
}

function startRunnerStoryBoundary() {
  if (!active || (active.storyBeat === null && !runnerState?.failed && !active.resolving) || runnerIsSuspended() || view !== "game") return;
  const remaining = runnerRemainingMs();
  if (remaining === 0) {
    closeRunnerAtBoundary();
    return;
  }
  runnerBoundaryStartedAt = performance.now();
  runnerBoundaryTimer = window.setTimeout(() => {
    runnerBoundaryTimer = 0;
    runnerBoundaryStartedAt = null;
    runnerSessionElapsedMs = RUNNER_SESSION_SECONDS * 1_000;
    closeRunnerAtBoundary();
  }, remaining);
}

function prepareRunnerCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
  const ratio = Math.min(RUNNER_DPR_CAP, Math.max(1, window.devicePixelRatio || 1));
  const pixelWidth = Math.round(RUNNER_WIDTH * ratio);
  const pixelHeight = Math.round(RUNNER_HEIGHT * ratio);
  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }
  canvas.dataset.logicalWidth = String(RUNNER_WIDTH);
  canvas.dataset.logicalHeight = String(RUNNER_HEIGHT);
  canvas.dataset.pixelRatio = String(ratio);
  const context = canvas.getContext("2d");
  context?.setTransform(ratio, 0, 0, ratio, 0, 0);
  return context;
}

function drawCurrentRunnerFrame() {
  const canvas = document.querySelector<HTMLCanvasElement>("#runnerCanvas");
  const context = canvas ? prepareRunnerCanvas(canvas) : null;
  if (!canvas || !context || !runnerState) return;
  const illustratedLeadReady = Boolean(runnerCharacterSheet?.complete && runnerCharacterSheet.naturalWidth > 0);
  drawRunnerFrame(
    context,
    { ...runnerState, paused: runnerIsSuspended() },
    runnerPalette(),
    matchMedia("(prefers-reduced-motion: reduce)").matches,
    illustratedLeadReady ? runnerCharacterSheet : null,
    runnerRenderQuality,
  );
  runnerRenderSequence += 1;
  canvas.dataset.renderSequence = String(runnerRenderSequence);
  canvas.dataset.lastAction = runnerState.lastAction ?? "idle";
  canvas.dataset.art = illustratedLeadReady ? "illustrated" : "vector-fallback";
  canvas.dataset.quality = runnerRenderQuality;
  canvas.dataset.camera = matchMedia("(max-width: 480px) and (orientation: portrait)").matches ? "portrait-close" : "full-stage";
  const playerWorldX = runnerState.worldX + RUNNER_PLAYER_SCREEN_X;
  const nextObstacle = RUNNER_ACTS[runnerState.actIndex].obstacles.find((obstacle) => obstacle.x + obstacle.width >= playerWorldX);
  if (nextObstacle) {
    canvas.dataset.nextGapCenter = String(nextObstacle.gapY + nextObstacle.gapHeight / 2);
    canvas.dataset.nextGapHeight = String(nextObstacle.gapHeight);
    canvas.dataset.nextMaterial = nextObstacle.material;
    canvas.dataset.nextSafeLane = String(nextObstacle.safeLane);
    canvas.dataset.nextContactMs = String(nextObstacle.contactMs);
  } else {
    delete canvas.dataset.nextGapCenter;
    delete canvas.dataset.nextGapHeight;
    delete canvas.dataset.nextMaterial;
    delete canvas.dataset.nextSafeLane;
    delete canvas.dataset.nextContactMs;
  }
}

function updateRunnerLive(message: string) {
  const live = document.querySelector<HTMLElement>("#runnerLive");
  if (live && live.textContent !== message) live.textContent = message;
}

function updateRunnerApproach() {
  if (!runnerState) return;
  const act = RUNNER_ACTS[runnerState.actIndex];
  const instruction = runnerUpcomingInstruction(runnerState);
  const next = [
    ...act.obstacles
      .map((obstacle) => ({ x: obstacle.x + obstacle.width, label: obstacle.label })),
    ...act.targets
      .filter((target) => !runnerState!.transformedTargetIds.includes(target.id) && !runnerState!.encounteredTargetIds.includes(target.id))
      .map((target) => ({ x: target.x + target.width, label: target.label })),
    ...act.complications
      .filter((candidate) => !runnerState!.encounteredComplicationIds.includes(candidate.id))
      .map((candidate) => ({ x: candidate.x, label: candidate.label })),
  ].filter((candidate) => candidate.x >= runnerState!.worldX + RUNNER_PLAYER_SCREEN_X).sort((left, right) => left.x - right.x)[0];
  const label = document.querySelector<HTMLElement>("#runnerApproach strong");
  if (label) label.textContent = instruction?.label ?? next?.label ?? "The Act curtain";
}

function updateRunnerActionHud() {
  if (!runnerState) return;
  const power = document.querySelector<HTMLElement>("#runnerPowerLabel");
  if (power) power.textContent = runnerEffectLabel(runnerState, RUNNER_ACTS[runnerState.actIndex]);
}

function sampleRunnerQuality(frameInterval: number) {
  if (runnerReviewMode) return;
  if (frameInterval <= 0 || frameInterval > 250) return;
  runnerFrameIntervals.push(frameInterval);
  if (runnerFrameIntervals.length < 90) return;
  runnerRenderQuality = runnerRenderQualityForIntervals(runnerFrameIntervals);
  runnerFrameIntervals = runnerFrameIntervals.slice(-30);
}

function runRunnerFrame(timestamp: number) {
  if (!active || getGame(active.gameId).kind !== "runner" || view !== "game") return stopRunnerLoop();
  if (!runnerLastTimestamp) runnerLastTimestamp = timestamp;
  const rawDelta = Math.max(0, timestamp - runnerLastTimestamp);
  runnerLastTimestamp = timestamp;
  if (runnerIsSuspended()) {
    drawCurrentRunnerFrame();
    stopRunnerLoop();
    return;
  }

  const activeDelta = Math.min(rawDelta, 2_000);
  sampleRunnerQuality(rawDelta);
  runnerSessionElapsedMs += activeDelta;
  if (runnerSessionElapsedMs >= RUNNER_SESSION_SECONDS * 1_000) {
    closeRunnerAtBoundary();
    return;
  }

  if (active.storyBeat === null && runnerState) {
    const previousState = runnerState;
    const frameInput: RunnerInput = { ...runnerInput };
    runnerAccumulatorMs = Math.min(
      runnerAccumulatorMs + activeDelta,
      RUNNER_FIXED_STEP_MS * RUNNER_MAX_CATCH_UP_STEPS,
    );
    let firstStep = true;
    let catchUpSteps = 0;
    while (runnerAccumulatorMs + 0.001 >= RUNNER_FIXED_STEP_MS && catchUpSteps < RUNNER_MAX_CATCH_UP_STEPS) {
      runnerState = stepRunner(runnerState, firstStep ? frameInput : {}, RUNNER_FIXED_STEP_MS);
      runnerInput = {};
      firstStep = false;
      catchUpSteps += 1;
      runnerAccumulatorMs -= RUNNER_FIXED_STEP_MS;
    }
    playRunnerStateCue(previousState, runnerState, frameInput);
    drawCurrentRunnerFrame();
    updateRunnerApproach();
    updateRunnerActionHud();
    updateRunnerLive(runnerState.message);
    if (runnerState.failed) {
      stopRunnerLoop();
      suspendHouseAudio();
      render();
      focusFirstGameControl();
      return;
    }
    if (runnerState.finished) {
      stopRunnerLoop();
      advanceChapter();
      return;
    }
  }
  runnerFrame = requestAnimationFrame(runRunnerFrame);
}

function mountRunner() {
  if (!active || getGame(active.gameId).kind !== "runner" || view !== "game") return;
  if (active.resolving) {
    resumeChapterTransition();
    startRunnerStoryBoundary();
    return;
  }
  stopRunnerLoop();
  if (active.storyBeat === null) {
    if (!runnerState || runnerState.actIndex !== active.chapter) runnerState = createRunnerState(active.chapter);
    runnerLastTimestamp = 0;
    drawCurrentRunnerFrame();
    if (runnerState.failed) startRunnerStoryBoundary();
    else if (!runnerIsSuspended()) runnerFrame = requestAnimationFrame(runRunnerFrame);
  } else {
    startRunnerStoryBoundary();
  }
}

function queueRunnerAction(action: "up" | "down" | "tool") {
  if (!active || getGame(active.gameId).kind !== "runner" || active.storyBeat !== null || runnerState?.failed || runnerIsSuspended()) return;
  if (action === "up") runnerInput = { ...runnerInput, laneDelta: -1 };
  else if (action === "down") runnerInput = { ...runnerInput, laneDelta: 1 };
  else runnerInput = { ...runnerInput, toolPressed: true };
  const act = RUNNER_ACTS[active.chapter];
  updateRunnerLive(action === "up" ? "Move up queued." : action === "down" ? "Move down queued." : `${act.toolLabel} queued.`);
}

function setRunnerPaused(paused: boolean) {
  if (!active || getGame(active.gameId).kind !== "runner") return;
  if (paused) {
    stopRunnerLoop();
    suspendHouseAudio();
  }
  runnerPaused = paused;
  runnerLastTimestamp = 0;
  if (runnerState) runnerState = { ...runnerState, paused, pendingLaneDelta: null };
  document.querySelectorAll<HTMLButtonElement>("[data-runner-pause]").forEach((button) => {
    button.ariaPressed = String(paused);
    const label = button.querySelector("span");
    if (label) label.textContent = paused ? "Resume city" : "Pause city";
    else button.textContent = paused ? "Resume city" : "Pause city";
  });
  updateRunnerLive(paused ? "The city is paused. Progress and optional sound are still." : "The city resumes from the same place.");
  drawCurrentRunnerFrame();
  if (!paused) mountRunner();
}

function chooseNarratedRoute() {
  if (!active || getGame(active.gameId).kind !== "runner") return;
  stopRunnerLoop();
  if (runnerSessionElapsedMs >= RUNNER_SESSION_SECONDS * 1_000) {
    closeRunnerAtBoundary();
    return;
  }
  closeHouseAudio();
  active.storyBeat = 0;
  runnerState = null;
  runnerPaused = false;
  saveActiveGame();
  render();
  focusElement("[data-story-advance]");
}

function retryRunnerAction() {
  if (!active || getGame(active.gameId).kind !== "runner" || !runnerState?.failed) return;
  stopRunnerLoop();
  if (runnerSessionElapsedMs >= RUNNER_SESSION_SECONDS * 1_000) {
    closeRunnerAtBoundary();
    return;
  }
  if (!runnerRetryAvailable()) {
    render();
    document.querySelector<HTMLElement>("[data-runner-story]")?.focus({ preventScroll: true });
    return;
  }
  closeHouseAudio();
  active.chapter = 0;
  active.storyBeat = null;
  active.resolving = false;
  active.touched = true;
  runnerState = createRunnerState(0);
  runnerPaused = false;
  statusMessage = "A fresh Action attempt begins inside the same table boundary.";
  saveActiveGame();
  render();
  focusElement('[data-runner-action="up"]');
}

function abandonRunnerAttempt() {
  if (!active || getGame(active.gameId).kind !== "runner") return;
  stopRunnerLoop();
  closeHouseAudio();
  active = null;
  pendingRunnerChoice = false;
  saveActiveGame();
  route("home");
}

function advanceStoryBeat() {
  if (!active || active.storyBeat === null) return;
  active.touched = true;
  const act = RUNNER_ACTS[active.chapter];
  if (active.storyBeat >= act.storyBeats.length - 1) {
    advanceChapter();
    return;
  }
  active.storyBeat += 1;
  statusMessage = "The narrated route moves to its next city beat.";
  saveActiveGame();
  render();
  focusElement("[data-story-advance]");
}

function answerChoice(choiceIndex: number) {
  if (!active || active.resolving) return;
  const game = getGame(active.gameId);
  if (game.kind === "stack") return;
  const chapter = game.kind === "classic"
    ? getClassicStudy(game.classicStudyId!).chapters[active.chapter]
    : game.chapters[active.chapter];
  if (!chapter) return;
  if (game.kind === "memory" && !active.memoryCovered) {
    statusMessage = "Cover the procession before choosing.";
    const status = document.querySelector<HTMLElement>("#gameStatus");
    if (status) status.textContent = statusMessage;
    return;
  }
  active.touched = true;
  const choice = document.querySelector<HTMLElement>(`[data-answer="${choiceIndex}"]`);
  if (choiceIndex !== chapter.answerIndex) {
    statusMessage = game.kind === "classic" ? "That move does not satisfy this authored position. Read the drawn lines and rule once more." : "Not this inscription. Read the order once more.";
    choice?.classList.remove("is-wrong");
    void choice?.offsetWidth;
    choice?.classList.add("is-wrong");
    const status = document.querySelector<HTMLElement>("#gameStatus");
    if (status) status.textContent = statusMessage;
    saveActiveGame();
    choice?.focus({ preventScroll: true });
    return;
  }
  choice?.classList.add("is-correct");
  advanceChapter();
}

function advanceChapter() {
  if (!active || active.resolving) return;
  const currentGame = getGame(active.gameId);
  if (currentGame.kind === "runner") stopRunnerLoop();
  active.resolving = true;
  statusMessage = "";
  const status = document.querySelector<HTMLElement>("#gameStatus");
  if (status) status.textContent = "";
  const completedChapter = active.chapter;
  const keepStoryPaused = currentGame.kind === "runner" && active.storyBeat !== null && runnerPaused;
  showCelebration(currentGame.kind === "runner" ? RUNNER_ACTS[completedChapter].praise : PRAISE[completedChapter]);
  if (!(currentGame.kind === "runner" && runnerPaused)) playChime(completedChapter);
  saveActiveGame();
  const baseDelay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 720;
  const delay = currentGame.kind === "runner" && keepStoryPaused ? 0 : baseDelay;
  const finishTransition = () => {
    if (!active) return;
    if (currentGame.kind === "runner") {
      stopRunnerLoop();
      if (runnerSessionElapsedMs >= RUNNER_SESSION_SECONDS * 1_000) {
        closeRunnerAtBoundary();
        return;
      }
    }
    if (completedChapter === 4) {
      finishGame();
      return;
    }
    const game = getGame(active.gameId);
    active.chapter += 1;
    active.memoryCovered = false;
    active.selectedPeg = null;
    active.pegs = initialPegs(game.diskCounts?.[active.chapter] ?? 0);
    if (game.kind === "runner") {
      active.storyBeat = active.storyBeat === null ? null : 0;
      runnerState = null;
      runnerPaused = keepStoryPaused;
    }
    active.resolving = false;
    statusMessage = "";
    saveActiveGame();
    render();
    focusFirstGameControl();
  };
  scheduleChapterTransition(delay, finishTransition);
  if (currentGame.kind === "runner") startRunnerStoryBoundary();
}

function finishGame() {
  if (!active) return;
  stopRunnerLoop();
  closeHouseAudio();
  clearChapterTransition();
  exitConfirmationPending = false;
  runnerState = null;
  runnerPaused = false;
  celebration.hidden = true;
  const game = getGame(active.gameId);
  const authoredUnit = game.kind === "runner" ? "Acts" : game.kind === "classic" ? "studies" : "chapters";
  const completed = completeEntertainmentGame(memory, game, active.runId, new Date().toISOString());
  memory = completed.state;
  writeHouseState(localStorage, memory);
  sessionStorage.removeItem(ACTIVE_KEY);
  main.innerHTML = `
    <section class="curtain-call" aria-labelledby="curtainTitle">
      <p class="kicker">The curtain call</p>
      <div class="curtain-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
      <h1 id="curtainTitle">${escape(game.title)}<br><em>is complete.</em></h1>
      <p>You completed all five authored ${authoredUnit}, ending with ${escape(completed.result.completionFacts.finalChapter)}.</p>
      <p class="result-boundary">Entertainment result · ruleset ${escape(completed.result.rulesetVersion)} · stored only on this device</p>
      <div class="curtain-actions">
        <button class="primary-action" type="button" data-route="category">Return to ${escape(getDoorCategory(game.categoryId).title)}</button>
        <button class="quiet-action" type="button" data-route="home">Grand Salon</button>
        <button class="quiet-action" type="button" data-route="gallery">Visit the Gallery</button>
      </div>
    </section>
  `;
  active = null;
  focusElement('[data-route="category"]');
}

function closeRunnerAtBoundary() {
  if (!active || getGame(active.gameId).kind !== "runner") return;
  stopRunnerLoop();
  closeHouseAudio();
  clearChapterTransition();
  exitConfirmationPending = false;
  runnerState = null;
  runnerPaused = false;
  celebration.hidden = true;
  sessionStorage.removeItem(ACTIVE_KEY);
  main.innerHTML = `
    <section class="curtain-call" aria-labelledby="curtainTitle">
      <p class="kicker">The quiet boundary</p>
      <div class="curtain-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
      <h1 id="curtainTitle">Sector Sprint<br><em>has closed.</em></h1>
      <p>The city route reached its authored boundary before all five Acts were completed. No completion reading was recorded.</p>
      <p class="result-boundary">Entertainment boundary · private by design · nothing added to the Gallery</p>
      <div class="curtain-actions">
        <button class="primary-action" type="button" data-route="home">Return to the Grand Salon</button>
        <button class="quiet-action" type="button" data-route="gallery">Visit the Gallery</button>
      </div>
    </section>
  `;
  active = null;
  focusElement('[data-route="home"]');
}

function selectPeg(pegIndex: number) {
  if (!active || active.resolving) return;
  const game = getGame(active.gameId);
  if (game.kind !== "stack") return;
  if (active.selectedPeg === null) {
    if ((active.pegs[pegIndex]?.length ?? 0) === 0) {
      statusMessage = "That plinth is empty.";
    } else {
      active.selectedPeg = pegIndex;
      active.touched = true;
      statusMessage = `Disc lifted from the ${["first", "second", "third"][pegIndex]} plinth.`;
    }
  } else {
    const from = active.selectedPeg;
    if (!isLegalStackMove(active.pegs, from, pegIndex)) {
      statusMessage = from === pegIndex ? "The disc remains where it is." : "A larger disc cannot rest on a smaller one.";
      active.selectedPeg = null;
    } else {
      const moving = active.pegs[from]?.at(-1);
      active.pegs = moveStackDisc(active.pegs, from, pegIndex);
      active.selectedPeg = null;
      active.touched = true;
      if (moving !== undefined) {
        lastStackMove = { peg: pegIndex, disk: moving };
        window.setTimeout(() => { lastStackMove = null; }, 520);
      }
      statusMessage = "Disc placed.";
      const diskCount = game.diskCounts?.[active.chapter] ?? 0;
      if (stackSolved(active.pegs, diskCount)) {
        render();
        focusElement(`[data-peg="${pegIndex}"]`);
        advanceChapter();
        return;
      }
    }
  }
  saveActiveGame();
  render();
  focusElement(`[data-peg="${pegIndex}"]`);
}

function resetStackChapter() {
  if (!active) return;
  const game = getGame(active.gameId);
  if (game.kind !== "stack" || active.resolving) return;
  const diskCount = game.diskCounts?.[active.chapter] ?? 0;
  active.pegs = initialPegs(diskCount);
  active.selectedPeg = null;
  active.touched = true;
  lastStackMove = null;
  statusMessage = `The ${diskCount}-disc tower is reset to the first plinth.`;
  saveActiveGame();
  render();
  focusElement('[data-peg="0"]');
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

function playRunnerStateCue(previous: RunnerState, next: RunnerState, input: RunnerInput) {
  if (!active || active.storyBeat !== null || runnerIsSuspended()) return;
  if (next.collectedPickupIds.length > previous.collectedPickupIds.length) {
    playToneSequence([294, 392, 523, 698], "sine", 0.034, 0.045);
  } else if (next.transformedTargetIds.length > previous.transformedTargetIds.length) {
    playToneSequence([196, 392, 523, 659], "sine", 0.036, 0.04);
  } else if (next.impactMs > previous.impactMs) {
    playToneSequence([110, 147, 98], "sawtooth", 0.025, 0.028);
  } else if (next.encounteredComplicationIds.length > previous.encounteredComplicationIds.length) {
    playToneSequence(next.activeComplication === "sabzi-load" ? [196, 174, 147] : [330, 294, 247], "triangle", 0.024, 0.06);
  } else if (previous.activeComplication && !next.activeComplication) {
    playToneSequence([220, 330, 440], "sine", 0.022, 0.05);
  } else if (input.laneDelta) {
    playToneSequence(input.laneDelta < 0 ? [247, 330] : [330, 247], "sine", 0.018, 0.04);
  } else if (input.toolPressed) {
    const toolNotes = [[440, 587], [196, 247, 330], [294, 440, 587], [220, 330, 440], [262, 392, 523]] as const;
    playToneSequence(toolNotes[active.chapter], active.chapter === 2 ? "triangle" : "sine", 0.024, 0.035);
  } else if (Math.floor(next.elapsedMs / 1_600) > Math.floor(previous.elapsedMs / 1_600)) {
    const tone = [82, 98, 110, 73, 92][active.chapter];
    playToneSequence([tone, tone * 1.5], "triangle", 0.009, 0.12);
  }
}

function playChime(chapter: number) {
  playToneSequence([0, 4, 7].map((offset) => 220 * 2 ** ((chapter + offset) / 12)), "sine", 0.045, 0.07);
}

document.addEventListener("click", (event) => {
  const target = event.target as Element;
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
  const gameButton = target.closest<HTMLElement>("[data-game]");
  if (gameButton) {
    startGame(gameButton.dataset.game as GameId);
    return;
  }
  const restoreButton = target.closest<HTMLElement>("[data-restore]");
  if (restoreButton && active) {
    const choice = restoreButton.dataset.restore;
    if (choice === "continue") {
      restoreDecisionPending = false;
      const game = getGame(active.gameId);
      const unit = game.kind === "runner" ? "Act" : game.kind === "classic" ? "Study" : "Chapter";
      statusMessage = `${unit} ${active.chapter + 1} restored in this tab.`;
      render();
      focusFirstGameControl();
    } else if (choice === "restart") {
      const gameId = active.gameId;
      active = null;
      saveActiveGame();
      startGame(gameId);
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
  if (target.closest("[data-runner-retry]")) {
    retryRunnerAction();
    return;
  }
  if (target.closest("[data-runner-abandon]")) {
    abandonRunnerAttempt();
    return;
  }
  const runnerAction = target.closest<HTMLElement>("[data-runner-action]");
  if (runnerAction) {
    if (event.detail > 0) return;
    resumeHouseAudioFromGesture();
    queueRunnerAction(runnerAction.dataset.runnerAction as "up" | "down" | "tool");
    return;
  }
  if (target.closest("[data-runner-pause]")) {
    if (runnerPaused) resumeHouseAudioFromGesture();
    setRunnerPaused(!runnerPaused);
    return;
  }
  if (target.closest("[data-runner-story]")) {
    chooseNarratedRoute();
    return;
  }
  if (target.closest("[data-story-advance]")) {
    advanceStoryBeat();
    return;
  }
  const answerButton = target.closest<HTMLElement>("[data-answer]");
  if (answerButton) {
    answerChoice(Number(answerButton.dataset.answer));
    return;
  }
  if (target.closest("[data-cover-memory]") && active) {
    active.memoryCovered = true;
    active.touched = true;
    statusMessage = "The procession is covered. Choose the line you held.";
    saveActiveGame();
    render();
    focusElement('[data-answer="0"]');
    return;
  }
  if (target.closest("[data-reveal-memory]") && active) {
    active.memoryCovered = false;
    active.touched = true;
    statusMessage = "The same fixed procession is visible again. Cover it when ready.";
    saveActiveGame();
    render();
    focusElement("[data-cover-memory]");
    return;
  }
  if (target.closest("[data-reset-stack]")) {
    resetStackChapter();
    return;
  }
  if (target.closest("[data-clear-gallery]")) {
    memory = readHouseState({ getItem: () => null }).state;
    try {
      localStorage.removeItem(HOUSE_STORAGE_KEY);
      localStorage.removeItem(HOUSE_LEGACY_STORAGE_KEY);
    } catch { /* The in-memory Gallery is still cleared. */ }
    renderGallery();
    focusElement("[data-clear-gallery]");
    return;
  }
  const pegButton = target.closest<HTMLElement>("[data-peg]");
  if (pegButton) selectPeg(Number(pegButton.dataset.peg));
});

document.addEventListener("pointerdown", (event) => {
  const target = event.target as Element;
  const control = target.closest<HTMLElement>("[data-runner-action]");
  if (!control) return;
  if (runnerActivePointerId !== null) return;
  runnerActivePointerId = event.pointerId;
  const resolvedAction = control.dataset.runnerAction as "up" | "down" | "tool";
  runnerActivePointerAction = resolvedAction;
  resumeHouseAudioFromGesture();
  control.dataset.pressed = "true";
  queueRunnerAction(resolvedAction);
});

for (const eventName of ["pointerup", "pointercancel"] as const) {
  document.addEventListener(eventName, (event) => {
    if (runnerActivePointerId === null || event.pointerId !== runnerActivePointerId) return;
    runnerActivePointerId = null;
    runnerActivePointerAction = null;
    if (eventName === "pointercancel") {
      runnerInput = {};
      if (runnerState) runnerState = { ...runnerState, pendingLaneDelta: null };
    }
    document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => {
      delete control.dataset.pressed;
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (!active || getGame(active.gameId).kind !== "runner" || active.storyBeat !== null) return;
  const target = event.target as HTMLElement;
  const key = event.key.toLowerCase();
  const isEditable = target.matches("input, textarea, select") || target.isContentEditable;
  const isButtonOrLink = target.matches("button, a");
  const runnerButton = target.closest<HTMLElement>("[data-runner-action]");
  if (runnerButton && (key === "enter" || key === " ")) {
    event.preventDefault();
    if (!event.repeat) {
      resumeHouseAudioFromGesture();
      queueRunnerAction(runnerButton.dataset.runnerAction as "up" | "down" | "tool");
    }
    return;
  }
  if (isEditable || (isButtonOrLink && (key === "enter" || key === " "))) return;
  if (["arrowup", "w"].includes(key)) {
    event.preventDefault();
    resumeHouseAudioFromGesture();
    if (!event.repeat) queueRunnerAction("up");
  } else if (["arrowdown", "s"].includes(key)) {
    event.preventDefault();
    resumeHouseAudioFromGesture();
    if (!event.repeat) queueRunnerAction("down");
  } else if (["j", "k", "x"].includes(key)) {
    event.preventDefault();
    resumeHouseAudioFromGesture();
    if (!event.repeat) queueRunnerAction("tool");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopRunnerLoop();
    suspendHouseAudio();
  }
  else {
    resumeChapterTransition();
    mountRunner();
  }
  drawCurrentRunnerFrame();
});

window.addEventListener("blur", () => {
  runnerInterrupted = true;
  stopRunnerLoop();
  suspendHouseAudio();
  document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => {
    delete control.dataset.pressed;
  });
  drawCurrentRunnerFrame();
});

window.addEventListener("focus", () => {
  runnerInterrupted = false;
  resumeChapterTransition();
  mountRunner();
  drawCurrentRunnerFrame();
});

window.addEventListener("resize", () => drawCurrentRunnerFrame());
window.addEventListener("orientationchange", () => {
  runnerActivePointerId = null;
  runnerActivePointerAction = null;
  runnerInput = {};
  if (runnerState) runnerState = { ...runnerState, pendingLaneDelta: null };
  document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => {
    delete control.dataset.pressed;
  });
  drawCurrentRunnerFrame();
});

matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
  if (!event.matches) return;
  if (pendingRunnerChoice) beginRunnerRoute("narrated");
  else if (active && getGame(active.gameId).kind === "runner" && active.storyBeat === null) chooseNarratedRoute();
});

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  if (!soundOn) closeHouseAudio();
  soundButton.ariaPressed = String(soundOn);
  soundButton.textContent = soundOn ? "Sound on" : "Sound off";
});

enterHouseButton.addEventListener("click", () => {
  try { localStorage.setItem(HOUSE_AUDIENCE_KEY, "acknowledged"); } catch { /* The acknowledgement may remain session-only. */ }
});

audienceDialog.addEventListener("cancel", (event) => event.preventDefault());

keepPlayingButton.addEventListener("click", () => {
  leaveDialog.close("keep");
  exitConfirmationPending = false;
  const focusTarget = exitReturnFocus;
  exitReturnFocus = null;
  resumeChapterTransition();
  resumeHouseAudioFromGesture();
  mountRunner();
  requestAnimationFrame(() => focusTarget?.focus({ preventScroll: true }));
});

leaveTableButton.addEventListener("click", () => {
  exitReturnFocus = null;
  discardActiveGame();
});

leaveDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  leaveDialog.close("keep");
  exitConfirmationPending = false;
  const focusTarget = exitReturnFocus;
  exitReturnFocus = null;
  resumeChapterTransition();
  mountRunner();
  requestAnimationFrame(() => focusTarget?.focus({ preventScroll: true }));
});

try {
  if (localStorage.getItem(HOUSE_AUDIENCE_KEY) !== "acknowledged") audienceDialog.showModal();
} catch {
  audienceDialog.showModal();
}

window.__house = {
  get view() { return view; },
  get active() { return active ? structuredClone(active) : null; },
  get memory() { return structuredClone(memory); },
  get runner() { return runnerState ? structuredClone(runnerState) : null; },
  start: startGame,
  openCategory,
  answer: answerChoice,
};

function applyLocationHash(initial = false) {
  const [kind, rawId] = location.hash.slice(1).split("/");
  const categoryId = DOOR_CATEGORIES.some((category) => category.id === rawId) ? rawId as DoorCategoryId : null;
  const gameId = GAMES.some((game) => game.id === rawId) ? rawId as GameId : null;
  if (initial && runnerRestoreWasDiscarded) {
    history.replaceState({ nindovaHouse: true }, "", `${location.pathname}${location.search}`);
    route("home");
    return;
  }
  if (initial && active) {
    writeRouteHash("game", true);
    return;
  }
  if (!initial && view === "game" && active && hasMeaningfulProgress(active)) {
    writeRouteHash("game", true);
    requestRoute(kind === "gallery" ? "gallery" : kind === "door" ? "category" : "home");
    return;
  }
  if (kind === "door" && categoryId) {
    selectedCategory = categoryId;
    route("category");
    return;
  }
  if (kind === "game" && gameId) {
    startGame(gameId);
    return;
  }
  if (kind === "gallery") {
    route("gallery");
    return;
  }
  if (location.hash) history.replaceState({ nindovaHouse: true }, "", `${location.pathname}${location.search}`);
  route("home");
}

addEventListener("popstate", () => applyLocationHash());

if ("serviceWorker" in navigator) {
  addEventListener("load", () => { navigator.serviceWorker.register("./sw.js"); });
}

applyLocationHash(true);
render();
