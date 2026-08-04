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

type View = "home" | "gallery" | "game";

type ActiveGame = {
  gameId: GameId;
  chapter: number;
  runId: string;
  memoryCovered: boolean;
  pegs: number[][];
  selectedPeg: number | null;
  resolving: boolean;
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
let active: ActiveGame | null = restoreActiveGame();
let soundOn = false;
let statusMessage = "";
let celebrationTimer = 0;

if (active) view = "game";

function restoreActiveGame(): ActiveGame | null {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(ACTIVE_KEY) ?? "null") as Partial<ActiveGame> | null;
    if (!parsed || !GAMES.some((game) => game.id === parsed.gameId)) return null;
    const game = getGame(parsed.gameId as GameId);
    const chapter = Number(parsed.chapter);
    if (!Number.isInteger(chapter) || chapter < 0 || chapter > 4 || typeof parsed.runId !== "string") return null;
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
    };
  } catch {
    return null;
  }
}

function saveActiveGame() {
  try {
    if (active) sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(active));
    else sessionStorage.removeItem(ACTIVE_KEY);
  } catch {
    // Same-tab recovery is optional; the games remain fully usable without storage.
  }
}

function route(next: View) {
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
  active = {
    gameId,
    chapter: 0,
    runId: crypto.randomUUID(),
    memoryCovered: false,
    pegs: initialPegs(game.diskCounts?.[0] ?? 0),
    selectedPeg: null,
    resolving: false,
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
  if (game.kind === "stack") focusElement('[data-peg="0"]');
  else if (game.kind === "memory" && !active.memoryCovered) focusElement("[data-cover-memory]");
  else focusElement('[data-answer="0"]');
}

function renderHome() {
  main.innerHTML = `
    <section class="house-intro" aria-labelledby="houseTitle">
      <p class="kicker">A private house of authored games</p>
      <h1 id="houseTitle">Choose a room.<br><em>Stay for the pleasure of solving.</em></h1>
      <p class="house-lede">Four games, each arranged in five deliberate chapters. Nothing is ranked, broadcast, or compared with other people.</p>
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
  const chapterTitle = game.kind === "stack" ? `${game.diskCounts?.[active.chapter]}-disc tower` : game.chapters[active.chapter]?.title;
  main.innerHTML = `
    <section class="game-view" aria-labelledby="gameTitle">
      <header class="game-masthead">
        <button class="back-link" type="button" data-route="home"><span aria-hidden="true">←</span> Grand Salon</button>
        <div class="chapter-mark"><span>Chapter ${active.chapter + 1}</span><i aria-hidden="true"></i><span>of 5</span></div>
      </header>
      <div class="game-title-block">
        <p class="kicker">Table ${game.number} · ${escape(chapterTitle ?? "Chapter")}</p>
        <h1 id="gameTitle">${escape(game.title)}</h1>
        <p>${escape(game.description)}</p>
      </div>
      <div class="game-chamber">
        ${game.kind === "stack" ? renderStack(game) : renderChoice(game)}
      </div>
      <p id="gameStatus" class="game-status" role="status" aria-live="polite">${escape(statusMessage)}</p>
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
  active.resolving = true;
  statusMessage = "";
  const status = document.querySelector<HTMLElement>("#gameStatus");
  if (status) status.textContent = "";
  const completedChapter = active.chapter;
  showCelebration(PRAISE[completedChapter]);
  playChime(completedChapter);
  saveActiveGame();
  const delay = matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 720;
  window.setTimeout(() => {
    if (!active) return;
    if (completedChapter === 4) {
      finishGame();
      return;
    }
    const game = getGame(active.gameId);
    active.chapter += 1;
    active.memoryCovered = false;
    active.selectedPeg = null;
    active.pegs = initialPegs(game.diskCounts?.[active.chapter] ?? 0);
    active.resolving = false;
    statusMessage = "";
    saveActiveGame();
    render();
    focusFirstGameControl();
  }, delay);
}

function finishGame() {
  if (!active) return;
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
