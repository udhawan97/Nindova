import "@fontsource-variable/newsreader";
import "@fontsource-variable/geist";
import "../../../tokens.css";
import "./house.css";
import runnerCharacterSheetUrl from "./assets/sector-sprint-characters.png?url";
import {
  GAMES,
  HOUSE_AUDIENCE_KEY,
  completeEntertainmentGame,
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
} from "./house-core";
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
  stepRunner,
  type RunnerInput,
  type RunnerPalette,
  type RunnerRenderQuality,
  type RunnerState,
} from "./sector-sprint";

type View = "home" | "gallery" | "game";

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
let runnerThrustHeld = false;
let runnerActivePointerId: number | null = null;
let runnerActivePointerAction: "thrust" | "dash" | "tool" | null = null;
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
}

if (active) view = "game";

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

function route(next: View) {
  stopRunnerLoop();
  closeHouseAudio();
  if (next !== "game") clearChapterTransition();
  view = next;
  if (next !== "game") {
    active = null;
    pendingRunnerChoice = false;
    restoreDecisionPending = false;
    exitConfirmationPending = false;
    saveActiveGame();
  }
  statusMessage = "";
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
  if (next === "home" && view === "game" && active && !restoreDecisionPending && hasMeaningfulProgress(active)) {
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
  route("home");
}

function startGame(gameId: GameId) {
  const game = getGame(gameId);
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
    active = null;
    pendingRunnerChoice = true;
    view = "game";
    statusMessage = "";
    saveActiveGame();
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
  statusMessage = routeChoice === "narrated" ? "The narrated city route is ready." : "The jetpack corridor begins. One contact wipes this Action attempt.";
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

function render() {
  if (view === "home") renderHome();
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
      : active.storyBeat === null ? '[data-runner-action="thrust"]' : "[data-story-advance]",
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
      <p class="house-lede">Five games, each arranged in five deliberate chapters. Nothing is ranked, broadcast, or compared with other people.</p>
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
          ${GAMES.map((game) => `
            <button class="game-door game-door-${escape(game.id)}" type="button" data-game="${escape(game.id)}">
              ${gameSigil(game.id)}
              <span class="game-number">${game.number}</span>
              <span class="game-title">${escape(game.title)}</span>
              <span class="game-line">${escape(game.houseLine)}</span>
              <span class="game-enter">Open table</span>
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
            <div><h2>${escape(game.title)}</h2><p>${result ? `${result.completionFacts.authoredChapters} authored chapters completed · ${escape(result.completionFacts.finalChapter)}` : "No completed reading is kept."}</p></div>
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
    : game.kind === "stack"
      ? `${game.diskCounts?.[chapter]}-disc tower`
      : game.kind === "runner"
        ? RUNNER_ACTS[chapter]?.title
        : game.chapters[chapter]?.title;
  main.innerHTML = `
    <section class="game-view game-view-${game.id}" aria-labelledby="gameTitle">
      <header class="game-masthead">
        <button class="back-link" type="button" data-route="home"><span aria-hidden="true">←</span> Grand Salon</button>
        <div class="chapter-mark"><span>${pendingRunnerChoice ? "Before Act I" : `${game.kind === "runner" ? "Act" : "Chapter"} ${chapter + 1}`}</span><i aria-hidden="true"></i><span>${pendingRunnerChoice ? "Route choice" : "of 5"}</span></div>
      </header>
      <div class="game-title-block ${game.kind === "runner" ? "game-title-block-runner" : ""}">
        <p class="kicker">Table ${game.number} · ${escape(chapterTitle ?? (game.kind === "runner" ? "Act" : "Chapter"))}</p>
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
                : renderChoice(game)}
      </div>
      <p id="gameStatus" class="game-status" role="status" aria-live="polite">${escape(statusMessage)}</p>
    </section>
  `;
  if (game.kind === "runner" && active && !restoreDecisionPending) mountRunner();
}

function renderRestoreGate(game: GameDefinition): string {
  if (!active) return "";
  const unit = game.kind === "runner" ? "Act" : "Chapter";
  return `
    <section class="table-gate restore-gate" aria-labelledby="restoreTitle">
      <div class="gate-sigil" aria-hidden="true"><i></i><span></span><i></i></div>
      <p class="kicker">Unfinished table found</p>
      <h2 id="restoreTitle">Continue ${escape(game.title)}?</h2>
      <p>${unit} ${active.chapter + 1} is still held in this tab. Continuing keeps that exact chapter; starting over creates a fresh five-${unit.toLowerCase()} reading.</p>
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
      <p>Action starts a one-hit jetpack corridor: pulse to rise, release to descend, and clear five authored Acts. Narrated follows the same city with text controls and no precision requirement. Both remain inside the same fixed table boundary.</p>
      <div class="route-choices">
        <button class="route-choice route-choice-action" type="button" data-runner-route="action">
          <span>Action route</span><strong>Enter the gauntlet</strong><small>Keyboard or touch · one contact wipes the route</small>
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
        <div class="runner-canvas-window" ${failed ? 'data-runner-failed="true"' : "data-runner-thrust-zone"}><canvas id="runnerCanvas" width="${RUNNER_WIDTH}" height="${RUNNER_HEIGHT}" aria-label="${escape(act.title)}. An original jetpack corridor through Chandigarh. Hold the movement area to thrust, release to descend, and avoid the architectural faces. One contact ends this Action attempt." aria-describedby="runnerInstructions runnerApproach runnerLive runnerToolLine"></canvas>${failed ? "" : '<span class="runner-thrust-prompt" aria-hidden="true">Hold stage to thrust</span>'}</div>
        <div class="runner-action-hud" aria-label="Current action set"><span>Act-local tool</span><strong id="runnerToolLabel">${escape(act.toolLabel)}</strong><span id="runnerPowerLabel">${escape(activePowerLabel)}</span></div>
        <figcaption><span>${escape(act.sign)}</span><span>Original illustrated action theatre · fixed authored route</span></figcaption>
      </figure>
      <div class="runner-status-deck">
        <p id="runnerApproach" class="runner-approach"><span>${failed ? "Route state" : "Next passage"}</span><strong>${failed ? "One-hit wipeout" : escape(act.obstacles[0]?.label ?? act.closing)}</strong></p>
        <p id="runnerLive" class="runner-live" role="status" aria-live="polite">${escape(runnerState?.message ?? act.opening)}</p>
      </div>
      ${failed ? `
        <section class="runner-recovery" aria-labelledby="runnerRecoveryTitle" aria-describedby="runnerInstructions runnerRecoveryBoundary">
          <div><p class="kicker">Action route wiped</p><h3 id="runnerRecoveryTitle">The jetpack sputters. The city holds.</h3></div>
          <p id="runnerInstructions">This attempt ended on one contact. No life, score, checkpoint, or failure history is kept.</p>
          <div class="runner-recovery-actions">
            <button class="primary-action" type="button" data-runner-retry ${retryAvailable ? "" : "disabled"}>Retry Action from Act I</button>
            <button class="quiet-action" type="button" data-runner-story>Continue narrated</button>
            <button class="text-action" type="button" data-runner-abandon>Return to the Grand Salon</button>
          </div>
          <p id="runnerRecoveryBoundary" class="runner-route-note">${retryAvailable ? "Retry uses the same foreground boundary; it does not restart the table." : "The boundary is too near for a complete five-Act Action retry."} Narrated beats remain available from this Act while the same boundary remains, and may close before the final curtain.</p>
          <p id="runnerToolLine" class="runner-recovery-detail"><strong>${escape(act.toolLabel)}</strong> remains harmless choreography; only the lit architectural faces, road, and ceiling end an attempt.</p>
        </section>
      ` : `
        <div class="runner-controls" aria-label="Sector Sprint controls">
          <button class="runner-control-primary runner-control-thrust" type="button" data-runner-action="thrust"><i class="runner-control-mark runner-control-mark-jump" aria-hidden="true"></i><span>Pulse / Glide</span><small>Hold ↑ · W · Space</small></button>
          <button class="runner-control-primary" type="button" data-runner-action="tool"><i class="runner-control-mark runner-control-mark-spark" aria-hidden="true"></i><span>${escape(act.toolLabel)}</span><small>J · K · X</small></button>
          <button class="runner-control-quiet" type="button" data-runner-pause aria-pressed="${runnerPaused}"><i class="runner-control-mark runner-control-mark-pause" aria-hidden="true"></i><span>${runnerPaused ? "Resume city" : "Pause city"}</span><small>Movement and sound</small></button>
          <button class="runner-control-quiet" type="button" data-runner-story><i class="runner-control-mark runner-control-mark-story" aria-hidden="true"></i><span>Narrated route</span><small>No precision needed</small></button>
        </div>
        <div class="runner-copy-deck">
          <p id="runnerToolLine"><strong>${escape(act.toolLabel)}</strong> · ${escape(act.toolLine)}</p>
          <p id="runnerInstructions" class="runner-instructions">Hold the stage or Pulse control for thrust; release early and let inertia carry the line. One touch on a lit architectural face, the ceiling, or the road ends this Action attempt. Comic targets and tools are harmless.</p>
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
  runnerThrustHeld = false;
  document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"], [data-runner-thrust-zone][data-pressed="true"]').forEach((control) => {
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
  } else {
    delete canvas.dataset.nextGapCenter;
    delete canvas.dataset.nextGapHeight;
    delete canvas.dataset.nextMaterial;
  }
}

function updateRunnerLive(message: string) {
  const live = document.querySelector<HTMLElement>("#runnerLive");
  if (live && live.textContent !== message) live.textContent = message;
}

function updateRunnerApproach() {
  if (!runnerState) return;
  const act = RUNNER_ACTS[runnerState.actIndex];
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
  if (label) label.textContent = next?.label ?? "The Act curtain";
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
    const frameInput: RunnerInput = { ...runnerInput, thrustHeld: runnerThrustHeld };
    runnerAccumulatorMs = Math.min(
      runnerAccumulatorMs + activeDelta,
      RUNNER_FIXED_STEP_MS * RUNNER_MAX_CATCH_UP_STEPS,
    );
    let firstStep = true;
    let catchUpSteps = 0;
    while (runnerAccumulatorMs + 0.001 >= RUNNER_FIXED_STEP_MS && catchUpSteps < RUNNER_MAX_CATCH_UP_STEPS) {
      runnerState = stepRunner(runnerState, firstStep ? frameInput : { thrustHeld: runnerThrustHeld }, RUNNER_FIXED_STEP_MS);
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

function queueRunnerAction(action: "thrust" | "dash" | "tool") {
  if (!active || getGame(active.gameId).kind !== "runner" || active.storyBeat !== null || runnerState?.failed || runnerIsSuspended()) return;
  if (action === "thrust") runnerInput = { ...runnerInput, thrustPressed: true };
  else if (action === "dash") runnerInput = { ...runnerInput, dashPressed: true };
  else runnerInput = { ...runnerInput, toolPressed: true };
  const act = RUNNER_ACTS[active.chapter];
  updateRunnerLive(action === "thrust" ? "Jetpack pulse engaged. Release early and ride the inertia." : action === "dash" ? "Flight trim queued." : `${act.toolLabel} queued.`);
}

function releaseRunnerThrust() {
  if (!runnerThrustHeld) return;
  runnerThrustHeld = false;
  runnerInput = { ...runnerInput, thrustReleased: true };
}

function setRunnerPaused(paused: boolean) {
  if (!active || getGame(active.gameId).kind !== "runner") return;
  if (paused) {
    stopRunnerLoop();
    suspendHouseAudio();
  }
  runnerPaused = paused;
  runnerLastTimestamp = 0;
  if (runnerState) runnerState = { ...runnerState, paused };
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
  focusElement('[data-runner-action="thrust"]');
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
  const chapter = game.chapters[active.chapter];
  if (game.kind === "memory" && !active.memoryCovered) {
    statusMessage = "Cover the procession before choosing.";
    const status = document.querySelector<HTMLElement>("#gameStatus");
    if (status) status.textContent = statusMessage;
    return;
  }
  active.touched = true;
  const choice = document.querySelector<HTMLElement>(`[data-answer="${choiceIndex}"]`);
  if (choiceIndex !== chapter.answerIndex) {
    statusMessage = "Not this inscription. Read the order once more.";
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
  const authoredUnit = game.kind === "runner" ? "Acts" : "chapters";
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
        <button class="primary-action" type="button" data-route="home">Return to the Grand Salon</button>
        <button class="quiet-action" type="button" data-route="gallery">Visit the Gallery</button>
      </div>
    </section>
  `;
  active = null;
  focusElement('[data-route="home"]');
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
  } else if (next.landingMs > previous.landingMs) {
    playToneSequence(next.lastAction === "stomp" ? [98, 147, 196] : [164, 196], "triangle", 0.023, 0.028);
  } else if (next.encounteredComplicationIds.length > previous.encounteredComplicationIds.length) {
    playToneSequence(next.activeComplication === "sabzi-load" ? [196, 174, 147] : [330, 294, 247], "triangle", 0.024, 0.06);
  } else if (previous.activeComplication && !next.activeComplication) {
    playToneSequence([220, 330, 440], "sine", 0.022, 0.05);
  } else if (input.thrustPressed && !next.grounded) {
    playToneSequence([196, 294, 440], "sine", 0.022, 0.04);
  } else if (input.jumpPressed && !next.grounded) {
    playToneSequence(next.lastAction === "air-step" ? [330, 494, 659] : [220, 330], "sine", 0.021, 0.038);
  } else if (input.dashPressed) {
    playToneSequence(next.lastAction === "stomp" ? [174, 116] : [196, 294, 392], "triangle", 0.021, 0.032);
  } else if (input.toolPressed) {
    const toolNotes = [[440, 587], [196, 247, 330], [294, 440, 587], [220, 330, 440], [262, 392, 523]] as const;
    playToneSequence(toolNotes[active.chapter], active.chapter === 2 ? "triangle" : "sine", 0.024, 0.035);
  } else if (Math.floor(next.elapsedMs / 1_600) > Math.floor(previous.elapsedMs / 1_600)) {
    const pulse = [82, 98, 110, 73, 92][active.chapter];
    playToneSequence([pulse, pulse * 1.5], "triangle", 0.009, 0.12);
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
      statusMessage = `Chapter ${active.chapter + 1} restored in this tab.`;
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
    queueRunnerAction(runnerAction.dataset.runnerAction as "thrust" | "dash" | "tool");
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
    try { localStorage.removeItem("nindova:house:v1"); } catch { /* The in-memory Gallery is still cleared. */ }
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
  const thrustZone = target.closest<HTMLElement>("[data-runner-thrust-zone]");
  if (!control && !thrustZone) return;
  if (runnerActivePointerId !== null) return;
  runnerActivePointerId = event.pointerId;
  const action = control?.dataset.runnerAction as "thrust" | "dash" | "tool" | undefined;
  const inputSurface = control ?? thrustZone!;
  const resolvedAction = action ?? "thrust";
  runnerActivePointerAction = resolvedAction;
  resumeHouseAudioFromGesture();
  inputSurface.dataset.pressed = "true";
  if (resolvedAction === "thrust") runnerThrustHeld = true;
  queueRunnerAction(resolvedAction);
});

for (const eventName of ["pointerup", "pointercancel"] as const) {
  document.addEventListener(eventName, (event) => {
    if (runnerActivePointerId === null || event.pointerId !== runnerActivePointerId) return;
    const completedAction = runnerActivePointerAction;
    runnerActivePointerId = null;
    runnerActivePointerAction = null;
    if (completedAction === "thrust") releaseRunnerThrust();
    document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"], [data-runner-thrust-zone][data-pressed="true"]').forEach((control) => {
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
  const isFocusedThrust = target.matches('[data-runner-action="thrust"]');
  if (isEditable || (isButtonOrLink && (key === "enter" || (key === " " && !isFocusedThrust)))) return;
  if (["arrowup", "w", " "].includes(key)) {
    event.preventDefault();
    resumeHouseAudioFromGesture();
    if (!event.repeat) queueRunnerAction("thrust");
    runnerThrustHeld = true;
  } else if (["arrowdown", "s", "d"].includes(key)) {
    event.preventDefault();
    resumeHouseAudioFromGesture();
    if (!event.repeat) queueRunnerAction("dash");
  } else if (["j", "k", "x"].includes(key)) {
    event.preventDefault();
    resumeHouseAudioFromGesture();
    if (!event.repeat) queueRunnerAction("tool");
  }
});

document.addEventListener("keyup", (event) => {
  if (!active || getGame(active.gameId).kind !== "runner" || active.storyBeat !== null) return;
  if (["arrowup", "w", " "].includes(event.key.toLowerCase())) {
    event.preventDefault();
    releaseRunnerThrust();
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
  releaseRunnerThrust();
  document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"], [data-runner-thrust-zone][data-pressed="true"]').forEach((control) => {
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
  answer: answerChoice,
};

if ("serviceWorker" in navigator) {
  addEventListener("load", () => { navigator.serviceWorker.register("./sw.js"); });
}

render();
