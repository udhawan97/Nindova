import "@fontsource-variable/newsreader";
import "@fontsource-variable/geist";
import "../../../tokens.css";
import "./house.css";
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
  RUNNER_ACT_SECONDS,
  RUNNER_HEIGHT,
  RUNNER_PLAYER_SCREEN_X,
  RUNNER_SESSION_SECONDS,
  RUNNER_WIDTH,
  createRunnerState,
  drawRunnerFrame,
  stepRunner,
  type RunnerInput,
  type RunnerPalette,
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
};

type DebugHouse = {
  readonly view: View;
  readonly active: ActiveGame | null;
  readonly memory: HouseState;
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
const celebration = requiredElement<HTMLElement>("#celebration");

const ACTIVE_KEY = "nindova:house:active:v1";
const PRAISE = ["Well seen.", "Exact.", "Beautifully read.", "The order holds.", "A complete reading."] as const;
let memory = readHouseState(localStorage).state;
let view: View = "home";
let runnerRestoreWasDiscarded = false;
let active: ActiveGame | null = restoreActiveGame();
let soundOn = false;
let statusMessage = "";
let celebrationTimer = 0;
let runnerState: RunnerState | null = null;
let runnerFrame = 0;
let runnerLastTimestamp = 0;
let runnerSessionElapsedMs = 0;
let runnerInput: RunnerInput = {};
let runnerPaused = false;
let runnerInterrupted = false;
let runnerBoundaryTimer = 0;
let runnerBoundaryStartedAt = 0;
let runnerPaletteCache: RunnerPalette | null = null;
let runnerTransitionTimer = 0;
let runnerTransitionRemainingMs = 0;
let runnerTransitionStartedAt: number | null = null;
let runnerTransitionCallback: (() => void) | null = null;

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
  if (next !== "game") clearRunnerTransition();
  view = next;
  if (next !== "game") {
    active = null;
    saveActiveGame();
  }
  statusMessage = "";
  render();
  main.focus({ preventScroll: true });
}

function startGame(gameId: GameId) {
  const game = getGame(gameId);
  stopRunnerLoop();
  clearRunnerTransition();
  runnerState = null;
  runnerSessionElapsedMs = 0;
  runnerPaused = false;
  runnerPaletteCache = null;
  active = {
    gameId,
    chapter: 0,
    runId: crypto.randomUUID(),
    memoryCovered: false,
    pegs: initialPegs(game.diskCounts?.[0] ?? 0),
    selectedPeg: null,
    resolving: false,
    storyBeat: game.kind === "runner" && matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : null,
  };
  view = "game";
  statusMessage = "";
  saveActiveGame();
  render();
  main.focus({ preventScroll: true });
}

function escape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
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
  if (game.kind === "runner") focusElement(active.storyBeat === null ? '[data-runner-action="jump"]' : "[data-story-advance]");
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
  if (!active) return route("home");
  const game = getGame(active.gameId);
  const chapterTitle = game.kind === "stack"
    ? `${game.diskCounts?.[active.chapter]}-disc tower`
    : game.kind === "runner"
      ? RUNNER_ACTS[active.chapter]?.title
      : game.chapters[active.chapter]?.title;
  main.innerHTML = `
    <section class="game-view" aria-labelledby="gameTitle">
      <header class="game-masthead">
        <button class="back-link" type="button" data-route="home"><span aria-hidden="true">←</span> Grand Salon</button>
        <div class="chapter-mark"><span>${game.kind === "runner" ? "Act" : "Chapter"} ${active.chapter + 1}</span><i aria-hidden="true"></i><span>of 5</span></div>
      </header>
      <div class="game-title-block">
        <p class="kicker">Table ${game.number} · ${escape(chapterTitle ?? (game.kind === "runner" ? "Act" : "Chapter"))}</p>
        <h1 id="gameTitle">${escape(game.title)}</h1>
        <p>${escape(game.description)}</p>
      </div>
      <div class="game-chamber">
        ${game.kind === "runner" ? renderRunner() : game.kind === "stack" ? renderStack(game) : renderChoice(game)}
      </div>
      <p id="gameStatus" class="game-status" role="status" aria-live="polite">${escape(statusMessage)}</p>
    </section>
  `;
  if (game.kind === "runner") mountRunner();
}

function renderRunner(): string {
  if (!active) return "";
  const act = RUNNER_ACTS[active.chapter];
  if (!act) return "";
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
        <div><span>${escape(act.location)}</span><h2 id="runnerActTitle">${escape(act.title)}</h2></div>
        <div><p>${escape(act.opening)}</p><p>${escape(act.houseCall)}</p></div>
      </header>
      <figure class="runner-stage-frame">
        <div class="runner-canvas-window"><canvas id="runnerCanvas" width="${RUNNER_WIDTH}" height="${RUNNER_HEIGHT}" aria-label="${escape(act.title)}. An original auto-running Chandigarh city scene. Use Jump or ${escape(act.sparkLabel)} for optional comic interactions." aria-describedby="runnerInstructions runnerApproach runnerLive"></canvas></div>
        <figcaption>${escape(act.location)} · original code-drawn miniature · fixed authored city route</figcaption>
      </figure>
      <p id="runnerApproach" class="runner-approach"><span>Approaching</span><strong>${escape(act.targets[0]?.label ?? act.closing)}</strong></p>
      <div class="runner-controls" aria-label="Sector Sprint controls">
        <button type="button" data-runner-action="jump"><span>Jump</span><small>↑ · W · Space</small></button>
        <button type="button" data-runner-action="spark"><span>${escape(act.sparkLabel)}</span><small>J · K · X</small></button>
        <button type="button" data-runner-pause aria-pressed="${runnerPaused}"><span>${runnerPaused ? "Resume city" : "Pause city"}</span><small>Movement and sound</small></button>
        <button type="button" data-runner-story><span>Narrated route</span><small>No precision needed</small></button>
      </div>
      <p id="runnerInstructions" class="runner-instructions">The street moves forward on its own and closes this Act automatically. Jump and sparks change the comic choreography; collisions never stop or reset the run.</p>
      <p id="runnerLive" class="runner-live" role="status" aria-live="polite">${escape(runnerState?.message ?? act.opening)}</p>
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
      <div class="inscription ${covered ? "is-covered" : ""}" aria-label="${covered ? "Sequence covered" : escape(chapter.display.replaceAll("\n", ", "))}">
        ${covered ? "The velvet is drawn." : escape(chapter.display).replaceAll("\n", "<br>")}
      </div>
      ${game.kind === "memory" && !covered ? `<button class="primary-action seal-action" type="button" data-cover-memory>Cover the procession</button>` : ""}
    </div>
    <div class="answer-column ${game.kind === "memory" && !covered ? "is-waiting" : ""}">
      <p>${escape(chapter.prompt)}</p>
      <div class="answer-list">
        ${chapter.choices.map((choice, index) => `<button type="button" data-answer="${index}" ${game.kind === "memory" && !covered ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span>${escape(choice)}</button>`).join("")}
      </div>
    </div>
  `;
}

function renderStack(game: GameDefinition): string {
  if (!active) return "";
  const diskCount = game.diskCounts?.[active.chapter] ?? 2;
  return `
    <div class="stack-instruction">
      <p>Move every disc from the first plinth to the third.</p>
      <p>Only the top disc may move. A larger disc may never rest on a smaller one.</p>
    </div>
    <div class="stack-board" style="--disc-count: ${diskCount}" aria-label="Three-plinth tower puzzle">
      ${active.pegs.map((peg, pegIndex) => `
        <button class="peg ${active?.selectedPeg === pegIndex ? "is-selected" : ""}" type="button" data-peg="${pegIndex}" aria-pressed="${active?.selectedPeg === pegIndex}" aria-label="${describePeg(peg, pegIndex)}">
          <span class="peg-post" aria-hidden="true"></span>
          <span class="discs" aria-hidden="true">
            ${[...peg].reverse().map((disk) => `<i class="disc" data-disc="${disk}" style="--disc: ${disk}"></i>`).join("")}
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
  };
  return runnerPaletteCache;
}

function runnerIsSuspended(): boolean {
  return runnerPaused || runnerInterrupted || document.hidden;
}

function clearRunnerTransition() {
  if (runnerTransitionTimer) window.clearTimeout(runnerTransitionTimer);
  runnerTransitionTimer = 0;
  runnerTransitionRemainingMs = 0;
  runnerTransitionStartedAt = null;
  runnerTransitionCallback = null;
}

function pauseRunnerTransition() {
  if (!runnerTransitionCallback || runnerTransitionStartedAt === null) return;
  if (runnerTransitionTimer) window.clearTimeout(runnerTransitionTimer);
  runnerTransitionTimer = 0;
  runnerTransitionRemainingMs = Math.max(0, runnerTransitionRemainingMs - (performance.now() - runnerTransitionStartedAt));
  runnerTransitionStartedAt = null;
}

function resumeRunnerTransition() {
  if (!runnerTransitionCallback || runnerTransitionTimer || runnerIsSuspended()) return;
  if (runnerTransitionRemainingMs <= 0) {
    const callback = runnerTransitionCallback;
    clearRunnerTransition();
    callback();
    return;
  }
  runnerTransitionStartedAt = performance.now();
  runnerTransitionTimer = window.setTimeout(() => {
    const callback = runnerTransitionCallback;
    clearRunnerTransition();
    callback?.();
  }, runnerTransitionRemainingMs);
}

function scheduleRunnerTransition(delay: number, callback: () => void) {
  clearRunnerTransition();
  if (delay <= 0) {
    callback();
    return;
  }
  runnerTransitionRemainingMs = delay;
  runnerTransitionCallback = callback;
  resumeRunnerTransition();
}

function stopRunnerLoop() {
  if (runnerFrame) cancelAnimationFrame(runnerFrame);
  runnerFrame = 0;
  if (runnerBoundaryTimer) window.clearTimeout(runnerBoundaryTimer);
  runnerBoundaryTimer = 0;
  if (runnerBoundaryStartedAt) {
    runnerSessionElapsedMs += Math.max(0, performance.now() - runnerBoundaryStartedAt);
    runnerBoundaryStartedAt = 0;
  }
  runnerLastTimestamp = 0;
  runnerInput = {};
  pauseRunnerTransition();
}

function startRunnerStoryBoundary() {
  if (!active || active.storyBeat === null || runnerIsSuspended() || view !== "game") return;
  const remaining = Math.max(0, RUNNER_SESSION_SECONDS * 1_000 - runnerSessionElapsedMs);
  if (remaining === 0) {
    closeRunnerAtBoundary();
    return;
  }
  runnerBoundaryStartedAt = performance.now();
  runnerBoundaryTimer = window.setTimeout(() => {
    runnerBoundaryTimer = 0;
    runnerBoundaryStartedAt = 0;
    runnerSessionElapsedMs = RUNNER_SESSION_SECONDS * 1_000;
    closeRunnerAtBoundary();
  }, remaining);
}

function drawCurrentRunnerFrame() {
  const canvas = document.querySelector<HTMLCanvasElement>("#runnerCanvas");
  const context = canvas?.getContext("2d");
  if (!context || !runnerState) return;
  drawRunnerFrame(
    context,
    { ...runnerState, paused: runnerIsSuspended() },
    runnerPalette(),
    matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
}

function updateRunnerLive(message: string) {
  const live = document.querySelector<HTMLElement>("#runnerLive");
  if (live && live.textContent !== message) live.textContent = message;
}

function updateRunnerApproach() {
  if (!runnerState) return;
  const act = RUNNER_ACTS[runnerState.actIndex];
  const next = act.targets.find((target) => (
    target.x + target.width >= runnerState!.worldX + RUNNER_PLAYER_SCREEN_X
    && !runnerState!.transformedTargetIds.includes(target.id)
    && !runnerState!.encounteredTargetIds.includes(target.id)
  ));
  const label = document.querySelector<HTMLElement>("#runnerApproach strong");
  if (label) label.textContent = next?.label ?? "The Act curtain";
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
  runnerSessionElapsedMs += activeDelta;
  if (runnerSessionElapsedMs >= RUNNER_SESSION_SECONDS * 1_000) {
    closeRunnerAtBoundary();
    return;
  }

  if (active.storyBeat === null && runnerState) {
    let remaining = activeDelta;
    let firstStep = true;
    while (remaining > 0) {
      const step = Math.min(remaining, 50);
      runnerState = stepRunner(runnerState, firstStep ? runnerInput : {}, step);
      runnerInput = {};
      firstStep = false;
      remaining -= step;
    }
    drawCurrentRunnerFrame();
    updateRunnerApproach();
    updateRunnerLive(runnerState.message);
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
    resumeRunnerTransition();
    return;
  }
  stopRunnerLoop();
  if (active.storyBeat === null) {
    if (!runnerState || runnerState.actIndex !== active.chapter) runnerState = createRunnerState(active.chapter);
    runnerLastTimestamp = 0;
    drawCurrentRunnerFrame();
    if (!runnerIsSuspended()) runnerFrame = requestAnimationFrame(runRunnerFrame);
  } else {
    startRunnerStoryBoundary();
  }
}

function queueRunnerAction(action: "jump" | "spark") {
  if (!active || getGame(active.gameId).kind !== "runner" || active.storyBeat !== null || runnerIsSuspended()) return;
  runnerInput = { ...runnerInput, [action]: true };
  updateRunnerLive(action === "jump" ? "Jump queued." : `${RUNNER_ACTS[active.chapter].sparkLabel} queued.`);
}

function setRunnerPaused(paused: boolean) {
  if (!active || getGame(active.gameId).kind !== "runner") return;
  if (paused) stopRunnerLoop();
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
  active.storyBeat = 0;
  runnerState = null;
  runnerPaused = false;
  saveActiveGame();
  render();
  focusElement("[data-story-advance]");
}

function advanceStoryBeat() {
  if (!active || active.storyBeat === null) return;
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
    render();
    return;
  }
  if (choiceIndex !== chapter.answerIndex) {
    statusMessage = "Not this inscription. Read the order once more.";
    render();
    focusElement(`[data-answer="${choiceIndex}"]`);
    return;
  }
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
    if (currentGame.kind === "runner") runnerSessionElapsedMs += delay;
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
  if (currentGame.kind === "runner") scheduleRunnerTransition(delay, finishTransition);
  else window.setTimeout(finishTransition, delay);
}

function finishGame() {
  if (!active) return;
  stopRunnerLoop();
  clearRunnerTransition();
  runnerState = null;
  runnerPaused = false;
  celebration.hidden = true;
  const game = getGame(active.gameId);
  const completed = completeEntertainmentGame(memory, game, active.runId, new Date().toISOString());
  memory = completed.state;
  writeHouseState(localStorage, memory);
  sessionStorage.removeItem(ACTIVE_KEY);
  main.innerHTML = `
    <section class="curtain-call" aria-labelledby="curtainTitle">
      <p class="kicker">The curtain call</p>
      <div class="curtain-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
      <h1 id="curtainTitle">${escape(game.title)}<br><em>is complete.</em></h1>
      <p>You completed all five authored chapters, ending with ${escape(completed.result.completionFacts.finalChapter)}.</p>
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
  clearRunnerTransition();
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
      statusMessage = `Disc lifted from the ${["first", "second", "third"][pegIndex]} plinth.`;
    }
  } else {
    const from = active.selectedPeg;
    if (!isLegalStackMove(active.pegs, from, pegIndex)) {
      statusMessage = from === pegIndex ? "The disc remains where it is." : "A larger disc cannot rest on a smaller one.";
      active.selectedPeg = null;
    } else {
      active.pegs = moveStackDisc(active.pegs, from, pegIndex);
      active.selectedPeg = null;
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

function showCelebration(message: string) {
  window.clearTimeout(celebrationTimer);
  celebration.innerHTML = `<div class="celebration-inlay" aria-hidden="true">${Array.from({ length: 11 }, (_, index) => `<i style="--spark: ${index}"></i>`).join("")}</div><strong>${escape(message)}</strong>`;
  celebration.hidden = false;
  celebrationTimer = window.setTimeout(() => { celebration.hidden = true; }, 980);
}

function playChime(chapter: number) {
  if (!soundOn) return;
  const AudioContextClass = window.AudioContext;
  if (!AudioContextClass) return;
  let context: AudioContext | null = null;
  const closeContext = () => {
    if (!context) return;
    try { void context.close().catch(() => {}); } catch { /* Audio is always optional. */ }
  };
  try {
    context = new AudioContextClass();
    const now = context.currentTime;
    [0, 4, 7].forEach((offset, index) => {
      const oscillator = context!.createOscillator();
      const gain = context!.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 220 * 2 ** ((chapter + offset) / 12);
      gain.gain.setValueAtTime(0.0001, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.045, now + index * 0.07 + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.07 + 0.22);
      oscillator.connect(gain).connect(context!.destination);
      oscillator.start(now + index * 0.07);
      oscillator.stop(now + index * 0.07 + 0.24);
    });
    window.setTimeout(closeContext, 600);
  } catch {
    closeContext();
  }
}

document.addEventListener("click", (event) => {
  const target = event.target as Element;
  const routeButton = target.closest<HTMLElement>("[data-route]");
  if (routeButton) {
    route(routeButton.dataset.route as View);
    return;
  }
  const gameButton = target.closest<HTMLElement>("[data-game]");
  if (gameButton) {
    startGame(gameButton.dataset.game as GameId);
    return;
  }
  const runnerAction = target.closest<HTMLElement>("[data-runner-action]");
  if (runnerAction) {
    queueRunnerAction(runnerAction.dataset.runnerAction as "jump" | "spark");
    return;
  }
  if (target.closest("[data-runner-pause]")) {
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
    statusMessage = "The procession is covered. Choose the line you held.";
    saveActiveGame();
    render();
    focusElement('[data-answer="0"]');
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
  const control = (event.target as Element).closest<HTMLElement>("[data-runner-action]");
  if (control) control.dataset.pressed = "true";
});

for (const eventName of ["pointerup", "pointercancel"] as const) {
  document.addEventListener(eventName, () => {
    document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => {
      delete control.dataset.pressed;
    });
  });
}

document.addEventListener("keydown", (event) => {
  if (!active || getGame(active.gameId).kind !== "runner" || active.storyBeat !== null) return;
  const target = event.target as HTMLElement;
  if (target.matches("button, a, input, textarea, select")) return;
  const key = event.key.toLowerCase();
  if (["arrowup", "w", " "].includes(key)) {
    event.preventDefault();
    queueRunnerAction("jump");
  } else if (["j", "k", "x"].includes(key)) {
    event.preventDefault();
    queueRunnerAction("spark");
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) stopRunnerLoop();
  else mountRunner();
  drawCurrentRunnerFrame();
});

window.addEventListener("blur", () => {
  runnerInterrupted = true;
  stopRunnerLoop();
  document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => {
    delete control.dataset.pressed;
  });
  drawCurrentRunnerFrame();
});

window.addEventListener("focus", () => {
  runnerInterrupted = false;
  mountRunner();
  drawCurrentRunnerFrame();
});

matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", (event) => {
  if (event.matches && active && getGame(active.gameId).kind === "runner" && active.storyBeat === null) chooseNarratedRoute();
});

soundButton.addEventListener("click", () => {
  soundOn = !soundOn;
  soundButton.ariaPressed = String(soundOn);
  soundButton.textContent = soundOn ? "Sound on" : "Sound off";
});

enterHouseButton.addEventListener("click", () => {
  try { localStorage.setItem(HOUSE_AUDIENCE_KEY, "acknowledged"); } catch { /* The acknowledgement may remain session-only. */ }
});

audienceDialog.addEventListener("cancel", (event) => event.preventDefault());

try {
  if (localStorage.getItem(HOUSE_AUDIENCE_KEY) !== "acknowledged") audienceDialog.showModal();
} catch {
  audienceDialog.showModal();
}

window.__house = {
  get view() { return view; },
  get active() { return active ? structuredClone(active) : null; },
  get memory() { return structuredClone(memory); },
  start: startGame,
  answer: answerChoice,
};

if ("serviceWorker" in navigator) {
  addEventListener("load", () => { navigator.serviceWorker.register("./sw.js"); });
}

render();
