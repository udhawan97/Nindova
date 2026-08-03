import { NindovaDawn } from "./dawn-core.js";
import { NindovaNight, type NightCapture, type NightCompletion, type NightState, type RasoiCompletion } from "./night-core.js";
import { NindovaRasoi, type RasoiBoard, type RasoiMotifId } from "./rasoi-core.js";
import type { RasoiDebug, SessionState } from "./contracts.js";

const ACTIVE_SESSION_KEY = "nindova:active-session:v3";
const PRODUCTION_CAP_SECONDS = 15 * 60;
const PRODUCTION_WIND_DOWN_SECONDS = 12 * 60;
const REVIEW_CAP_SECONDS = 120;
const REVIEW_WIND_DOWN_SECONDS = 90;

const reviewerMode = new URLSearchParams(location.search).get("review") === "1";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hardCapSeconds = reviewerMode ? REVIEW_CAP_SECONDS : PRODUCTION_CAP_SECONDS;
const windDownSeconds = reviewerMode ? REVIEW_WIND_DOWN_SECONDS : PRODUCTION_WIND_DOWN_SECONDS;

function element<T extends HTMLElement>(id: string) {
  const value = document.getElementById(id);
  if (!value) throw new Error(`Missing #${id}`);
  return value as T;
}

const views = {
  intake: element<HTMLElement>("intake"),
  dismissed: element<HTMLElement>("dismissed"),
  play: element<HTMLElement>("play"),
  end: element<HTMLElement>("end"),
  rest: element<HTMLElement>("rest"),
  dawn: element<HTMLElement>("dawn"),
};
const boardElement = element<HTMLDivElement>("board");
const boardShell = element<HTMLDivElement>("boardShell");
const boardStatus = element<HTMLParagraphElement>("boardStatus");
const muteButton = element<HTMLButtonElement>("muteBtn");
const dawnButton = element<HTMLButtonElement>("dawnBtn");
const dawnCanvas = element<HTMLCanvasElement>("dawnCanvas");
const dawnVideo = element<HTMLVideoElement>("dawnVideo");
const dawnStatus = element<HTMLParagraphElement>("dawnStatus");
const loopActions = element<HTMLDivElement>("loopActions");

const motifNames: Record<RasoiMotifId, string> = Object.fromEntries(
  NindovaRasoi.RASOI_MOTIFS.map((motif) => [motif.id, motif.label]),
) as Record<RasoiMotifId, string>;
const motifShortNames: Record<RasoiMotifId, string> = {
  belan: "Belan",
  chakla: "Chakla",
  tawa: "Tawa",
  chimta: "Chimta",
  katori: "Katori",
  tiffin: "Tiffin",
  masala: "Masala",
  chai: "Chai",
  cooker: "Cooker",
};

let state: SessionState = "intake";
let board: RasoiBoard | null = null;
let currentNight: NightCapture | null = null;
let removed = new Set<string>();
let selectedTile: string | null = null;
let startedAtMs = 0;
let deadlineAtMs = 0;
let windDownAtMs = 0;
let clockAnchorWallMs = 0;
let clockAnchorMonotonicMs = 0;
let virtualOffsetMs = 0;
let audioEnabled = false;
let audioContext: AudioContext | null = null;
let endReason: "completed" | "production-cap" = "completed";
let settlementTimer: number | null = null;
let dawnNowOverride: Date | null = null;
let forceLoopUnsupported = false;
let hintTimer: number | null = null;
let nightStateResult = NindovaNight.readStorage(safeStorage("local"));
let nightState = nightStateResult.state;
let loopResult: null | { blob: Blob; type: string; extension: string; durationMs: number } = null;
let loopLease: null | { url: string; revoke(): void } = null;

function safeStorage(kind: "local" | "session") {
  try {
    return kind === "local" ? localStorage : sessionStorage;
  } catch {
    return null;
  }
}

function setStatus(message: string) {
  boardStatus.textContent = message;
}

function showView(next: SessionState) {
  state = next;
  document.body.dataset.view = next;
  const visible = next === "settling" ? "play" : next;
  for (const [name, view] of Object.entries(views)) {
    const hidden = name !== visible;
    view.hidden = hidden;
    view.setAttribute("aria-hidden", String(hidden));
  }
}

function iconSvg(motif: RasoiMotifId) {
  const common = 'viewBox="0 0 64 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"';
  const drawings: Record<RasoiMotifId, string> = {
    belan: '<path d="M13 24h38"/><path d="M19 17h26a7 7 0 0 1 0 14H19a7 7 0 0 1 0-14Z"/><path d="M3 24h10M51 24h10"/>',
    chakla: '<ellipse cx="32" cy="22" rx="21" ry="13"/><path d="M16 30l-2 7M32 35v5M48 30l2 7"/><path d="M22 21c6-5 14-5 20 0"/>',
    tawa: '<circle cx="26" cy="23" r="15"/><path d="M41 23h18M48 20v6"/><path d="M19 20c4-4 10-4 14 0"/>',
    chimta: '<path d="M13 7c4 17 10 28 19 35M51 7c-4 17-10 28-19 35"/><path d="M13 7l7 3M51 7l-7 3"/><circle cx="32" cy="41" r="2"/>',
    katori: '<path d="M12 17h40c-2 17-9 23-20 23S14 34 12 17Z"/><path d="M16 20c10 4 22 4 32 0"/><path d="M18 40h28"/>',
    tiffin: '<path d="M17 15h30v26H17Z"/><path d="M15 23h34M15 32h34M22 15v-5h20v5"/><path d="M13 20v16M51 20v16"/>',
    masala: '<circle cx="32" cy="24" r="20"/><circle cx="32" cy="24" r="5"/><circle cx="20" cy="18" r="4"/><circle cx="44" cy="18" r="4"/><circle cx="20" cy="32" r="4"/><circle cx="44" cy="32" r="4"/>',
    chai: '<path d="M18 14h28l-3 28H21Z"/><path d="M22 23h20M23 31h18"/><path d="M25 9c-3-3 2-5 0-8M34 9c-3-3 2-5 0-8M42 9c-3-3 2-5 0-8"/>',
    cooker: '<path d="M12 19h39v21H12Z"/><path d="M16 15h31l4 4H12Z"/><path d="M24 12h16M32 12V7M51 25h10"/><circle cx="32" cy="7" r="2"/>',
  };
  return `<svg ${common}>${drawings[motif]}</svg>`;
}

function createBoardDom() {
  if (!board) return;
  boardElement.replaceChildren();
  for (const tile of board.tiles) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.dataset.tileId = tile.id;
    button.dataset.motif = tile.motif;
    button.dataset.layer = String(tile.layer);
    button.style.setProperty("--x", String(tile.x));
    button.style.setProperty("--y", String(tile.y));
    button.style.setProperty("--layer", String(tile.layer));
    button.style.setProperty("--left", `${tile.x / 12 * 100}%`);
    button.style.setProperty("--top", `${tile.y / 8 * 100}%`);
    button.style.zIndex = String(10 + tile.layer * 10);
    button.innerHTML = `${iconSvg(tile.motif)}<span class="tile-label">${motifShortNames[tile.motif]}</span>`;
    button.addEventListener("click", () => selectTile(tile.id, true));
    boardElement.append(button);
  }
  updateBoardDom();
}

function tileById(tileId: string) {
  return board?.tiles.find((tile) => tile.id === tileId) ?? null;
}

function tileButton(tileId: string) {
  return boardElement.querySelector<HTMLButtonElement>(`[data-tile-id="${tileId}"]`);
}

function updateBoardDom(focusId: string | null = null) {
  if (!board) return;
  for (const tile of board.tiles) {
    const button = tileButton(tile.id);
    if (!button) continue;
    const availability = NindovaRasoi.availabilityReason(board, removed, tile.id);
    const isRemoved = availability === "removed";
    const isFree = availability === "free";
    const isSelected = selectedTile === tile.id;
    const isHinted = button.classList.contains("is-hinted");
    button.disabled = !isFree || isRemoved || state !== "play";
    button.classList.toggle("is-removed", isRemoved);
    button.classList.toggle("is-covered", availability === "covered");
    button.classList.toggle("is-side-blocked", availability === "side-blocked");
    button.classList.toggle("is-selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
    const position = availability === "covered"
      ? "covered by a tile above"
      : availability === "side-blocked"
        ? "blocked on both sides"
        : availability === "free"
          ? "free, uncovered with an open side"
          : "settled";
    button.setAttribute("aria-label", `${motifNames[tile.motif]}, ${position}${isSelected ? ", selected" : ""}${isHinted ? ", suggested safe pair" : ""}`);
  }
  boardShell.style.setProperty("--warmth", String(1 - removed.size / board.tiles.length));
  if (focusId) requestAnimationFrame(() => tileButton(focusId)?.focus());
}

function persistActiveSession() {
  if (!board || !currentNight || (state !== "play" && state !== "settling")) return;
  try {
    safeStorage("session")?.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
      version: 3,
      phase: state,
      endReason,
      night: currentNight,
      boardId: board.id,
      removed: [...removed],
      startedAtMs,
      deadlineAtMs,
      windDownAtMs,
    }));
  } catch {
    // Ephemeral resume is optional; the game remains usable without it.
  }
}

function clearActiveSession() {
  try { safeStorage("session")?.removeItem(ACTIVE_SESSION_KEY); } catch { /* no-op */ }
}

function anchorSessionClock(wallMs: number) {
  clockAnchorWallMs = wallMs;
  clockAnchorMonotonicMs = performance.now();
}

function restoreActiveSession() {
  try {
    const raw = safeStorage("session")?.getItem(ACTIVE_SESSION_KEY);
    if (!raw) return false;
    const candidate = JSON.parse(raw);
    const restoredNight = NindovaNight.sanitizeCapture(candidate.night);
    if (candidate.version !== 3 || !restoredNight || !Array.isArray(candidate.removed)
      || (candidate.phase !== "play" && candidate.phase !== "settling")
      || (candidate.endReason !== "completed" && candidate.endReason !== "production-cap")) {
      clearActiveSession();
      return false;
    }
    const restoredBoard = NindovaRasoi.createBoard(restoredNight.nightId);
    if (restoredBoard.id !== candidate.boardId) {
      clearActiveSession();
      return false;
    }
    const allowed = new Set(restoredBoard.tiles.map((tile) => tile.id));
    if (candidate.removed.some((tileId: unknown) => typeof tileId !== "string" || !allowed.has(tileId))
      || new Set(candidate.removed).size !== candidate.removed.length) {
      clearActiveSession();
      return false;
    }
    const restoredRemoved = new Set<string>(candidate.removed);
    if (!NindovaRasoi.isReachableState(restoredBoard, restoredRemoved)) {
      clearActiveSession();
      return false;
    }
    const restoredComplete = NindovaRasoi.isComplete(restoredBoard, restoredRemoved);
    if ((candidate.phase === "play" && candidate.endReason !== "completed")
      || (candidate.phase === "settling" && candidate.endReason === "completed" && !restoredComplete)) {
      clearActiveSession();
      return false;
    }
    currentNight = restoredNight;
    board = restoredBoard;
    removed = restoredRemoved;
    selectedTile = null;
    startedAtMs = Number(candidate.startedAtMs);
    deadlineAtMs = Number(candidate.deadlineAtMs);
    windDownAtMs = Number(candidate.windDownAtMs);
    const expectedStartedAtMs = Date.parse(restoredNight.startedAt);
    const restoredAtMs = Date.now();
    if (![startedAtMs, deadlineAtMs, windDownAtMs].every(Number.isFinite)
      || startedAtMs !== expectedStartedAtMs
      || startedAtMs > restoredAtMs + 5000
      || deadlineAtMs - startedAtMs !== hardCapSeconds * 1000
      || windDownAtMs - startedAtMs !== windDownSeconds * 1000) {
      clearActiveSession();
      return false;
    }
    anchorSessionClock(Math.max(restoredAtMs, startedAtMs));
    showView("play");
    createBoardDom();
    if (candidate.phase === "settling" || restoredComplete) {
      settle(candidate.endReason);
      return true;
    }
    setStatus("The same kitchen is still here.");
    enforceBoundary();
    return true;
  } catch {
    clearActiveSession();
    return false;
  }
}

function beginSession() {
  currentNight = NindovaNight.captureNight();
  board = NindovaRasoi.createBoard(currentNight.nightId);
  const verification = NindovaRasoi.verifyBoard(board);
  if (!verification.valid) throw new Error(`Unverified Rasoi board: ${verification.reason}`);
  removed = new Set();
  selectedTile = null;
  startedAtMs = Date.parse(currentNight.startedAt);
  deadlineAtMs = startedAtMs + hardCapSeconds * 1000;
  windDownAtMs = startedAtMs + windDownSeconds * 1000;
  anchorSessionClock(Date.now());
  virtualOffsetMs = 0;
  endReason = "completed";
  boardShell.classList.remove("is-settling");
  showView("play");
  createBoardDom();
  setStatus("Six free tiles sit above the quiet layers.");
  persistActiveSession();
}

async function playPairSound(row: number) {
  if (!audioEnabled) return;
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(.055, now + .01);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .22);
    gain.connect(audioContext.destination);
    for (const [offset, ratio] of [[0, 1], [.055, 1.52]] as const) {
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime((330 + row * 34) * ratio, now + offset);
      oscillator.connect(gain);
      oscillator.start(now + offset);
      oscillator.stop(now + .24);
    }
  } catch {
    audioEnabled = false;
    updateMuteButton();
  }
}

function animatePair(firstId: string, secondId: string) {
  const firstButton = tileButton(firstId);
  const secondButton = tileButton(secondId);
  if (!firstButton || !secondButton) return;
  const firstBox = firstButton.getBoundingClientRect();
  const secondBox = secondButton.getBoundingClientRect();
  const boardBox = boardElement.getBoundingClientRect();
  const midpoint = {
    x: (firstBox.left + firstBox.width / 2 + secondBox.left + secondBox.width / 2) / 2,
    y: (firstBox.top + firstBox.height / 2 + secondBox.top + secondBox.height / 2) / 2,
  };
  for (const [button, box] of [[firstButton, firstBox], [secondButton, secondBox]] as const) {
    button.style.setProperty("--pair-dx", `${(midpoint.x - (box.left + box.width / 2)) * .18}px`);
    button.style.setProperty("--pair-dy", `${(midpoint.y - (box.top + box.height / 2)) * .18}px`);
    button.classList.add("is-pairing");
  }
  const bloom = document.createElement("span");
  bloom.className = "pair-bloom";
  bloom.setAttribute("aria-hidden", "true");
  bloom.style.setProperty("--bloom-x", `${midpoint.x - boardBox.left}px`);
  bloom.style.setProperty("--bloom-y", `${midpoint.y - boardBox.top}px`);
  boardElement.append(bloom);
  window.setTimeout(() => {
    firstButton.classList.remove("is-pairing");
    secondButton.classList.remove("is-pairing");
    bloom.remove();
  }, reduceMotion ? 40 : 460);
}

function selectTile(tileId: string, restoreFocus = false) {
  if (!board || state !== "play" || !NindovaRasoi.isFree(board, removed, tileId)) return false;
  const tile = tileById(tileId)!;
  if (!selectedTile) {
    selectedTile = tileId;
    setStatus(`${motifShortNames[tile.motif]} lifted. Find its matching free tile.`);
    updateBoardDom(restoreFocus ? tileId : null);
    persistActiveSession();
    return true;
  }
  if (selectedTile === tileId) {
    selectedTile = null;
    setStatus("Tile set back down.");
    updateBoardDom(restoreFocus ? tileId : null);
    persistActiveSession();
    return true;
  }
  const first = tileById(selectedTile)!;
  const result = NindovaRasoi.removePair(board, removed, selectedTile, tileId);
  if (!result.changed) {
    selectedTile = tileId;
    setStatus(`${motifShortNames[first.motif]} and ${motifShortNames[tile.motif]} differ. The new tile is lifted.`);
    updateBoardDom(restoreFocus ? tileId : null);
    persistActiveSession();
    return false;
  }
  animatePair(selectedTile, tileId);
  removed = new Set(result.removed);
  selectedTile = null;
  void playPairSound(tile.layer);
  setStatus(`${motifShortNames[tile.motif]} meets its pair and settles.`);
  const nextFocus = restoreFocus ? NindovaRasoi.hintPair(board, removed)?.[0] ?? null : null;
  updateBoardDom(nextFocus);
  persistActiveSession();
  if (NindovaRasoi.isComplete(board, removed)) settle("completed");
  return true;
}

function hint() {
  if (!board || state !== "play") return null;
  const pair = NindovaRasoi.hintPair(board, removed);
  if (hintTimer !== null) window.clearTimeout(hintTimer);
  boardElement.querySelectorAll(".is-hinted").forEach((tile) => tile.classList.remove("is-hinted"));
  if (!pair) return null;
  pair.forEach((tileId) => tileButton(tileId)?.classList.add("is-hinted"));
  updateBoardDom();
  const motif = tileById(pair[0])?.motif;
  setStatus(`Hint: the two free ${motif ? motifShortNames[motif] : "matching"} tiles are a safe pair.`);
  hintTimer = window.setTimeout(() => {
    pair.forEach((tileId) => tileButton(tileId)?.classList.remove("is-hinted"));
    updateBoardDom();
    hintTimer = null;
  }, reduceMotion ? 30 : 2600);
  return pair;
}

function settle(reason: "completed" | "production-cap") {
  if (!board || !currentNight || state === "settling" || state === "end") return;
  endReason = reason;
  selectedTile = null;
  showView("settling");
  boardShell.classList.add("is-settling");
  updateBoardDom();
  setStatus(reason === "completed" ? "The last pair rests. The kitchen is closing." : "The kitchen is settling under its lid.");
  persistActiveSession();
  if (settlementTimer !== null) clearTimeout(settlementTimer);
  settlementTimer = window.setTimeout(finishSession, reduceMotion || reviewerMode ? 80 : 1300);
}

function finishSession() {
  if (!board || !currentNight) return;
  const completion: RasoiCompletion = {
    kind: "rasoi-pairs",
    nightId: currentNight.nightId,
    dawnDate: currentNight.dawnDate,
    timeZone: currentNight.timeZone,
    recipeVersion: currentNight.recipeVersion,
    boardId: board.id,
    motifOrder: board.motifOrder,
  };
  const completed = NindovaNight.completeState(nightState, completion);
  nightState = completed.state;
  NindovaNight.writeStorage(safeStorage("local"), nightState);
  clearActiveSession();
  boardShell.classList.remove("is-settling");
  showView("end");
  element<HTMLButtonElement>("dimRestBtn").focus();
  updateDawnButton();
}

function nowMs() {
  const monotonicNow = clockAnchorWallMs + (performance.now() - clockAnchorMonotonicMs);
  return Math.max(monotonicNow, Date.now()) + virtualOffsetMs;
}

function enforceBoundary() {
  if (state !== "play") return false;
  const current = nowMs();
  if (current >= deadlineAtMs || current >= windDownAtMs) {
    settle("production-cap");
    return true;
  }
  return false;
}

function advanceBy(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return false;
  virtualOffsetMs += seconds * 1000;
  return enforceBoundary();
}

function updateMuteButton() {
  muteButton.textContent = audioEnabled ? "sound on" : "sound off";
  muteButton.setAttribute("aria-pressed", String(audioEnabled));
}

function currentDawnEligibility() {
  return NindovaDawn.eligibility(nightState.lastCompleted, dawnNowOverride ?? new Date());
}

function updateDawnButton() {
  const eligibility = currentDawnEligibility();
  dawnButton.hidden = !eligibility.available;
}

function setDawnNow(instant: string) {
  const value = new Date(instant);
  if (Number.isNaN(value.getTime())) return false;
  dawnNowOverride = value;
  updateDawnButton();
  return currentDawnEligibility().available;
}

function drawCanvasMotif(context: CanvasRenderingContext2D, motif: string, x: number, y: number, scale: number, progress = 0) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.strokeStyle = "#61372b";
  context.fillStyle = "rgba(177,112,49,.14)";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.lineJoin = "round";
  const circle = (cx: number, cy: number, radius: number) => { context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke(); };
  if (motif === "belan") {
    context.beginPath(); context.moveTo(-38, 0); context.lineTo(38, 0); context.stroke();
    context.strokeRect(-26, -9, 52, 18);
  } else if (motif === "chakla") {
    context.beginPath(); context.ellipse(0, 0, 29, 18, 0, 0, Math.PI * 2); context.fill(); context.stroke();
    context.beginPath(); context.moveTo(-20, 14); context.lineTo(-24, 25); context.moveTo(20, 14); context.lineTo(24, 25); context.stroke();
  } else if (motif === "tawa") {
    circle(-7, 0, 21); context.beginPath(); context.moveTo(14, 0); context.lineTo(41, 0); context.stroke();
  } else if (motif === "chimta") {
    context.beginPath(); context.moveTo(-22, -23); context.quadraticCurveTo(-12, 12, 0, 25); context.moveTo(22, -23); context.quadraticCurveTo(12, 12, 0, 25); context.stroke();
  } else if (motif === "katori") {
    context.beginPath(); context.moveTo(-28, -10); context.quadraticCurveTo(-22, 22, 0, 23); context.quadraticCurveTo(22, 22, 28, -10); context.closePath(); context.fill(); context.stroke();
  } else if (motif === "tiffin") {
    context.strokeRect(-23, -24, 46, 48); context.beginPath(); context.moveTo(-23, -8); context.lineTo(23, -8); context.moveTo(-23, 9); context.lineTo(23, 9); context.moveTo(-13, -24); context.quadraticCurveTo(0, -39, 13, -24); context.stroke();
  } else if (motif === "masala") {
    circle(0, 0, 29); for (const [dx, dy] of [[0,0],[-14,-9],[14,-9],[-14,10],[14,10]]) circle(dx, dy, 5);
  } else if (motif === "chai") {
    context.beginPath(); context.moveTo(-21, -18); context.lineTo(21, -18); context.lineTo(17, 24); context.lineTo(-17, 24); context.closePath(); context.fill(); context.stroke();
    context.beginPath(); context.moveTo(-8, -25 + progress * 4); context.quadraticCurveTo(-15, -34, -7, -40); context.moveTo(7, -26 - progress * 4); context.quadraticCurveTo(15, -36, 7, -42); context.stroke();
  } else {
    context.strokeRect(-28, -15, 50, 35); context.beginPath(); context.moveTo(-23, -15); context.quadraticCurveTo(0, -31, 20, -15); context.moveTo(22, 0); context.lineTo(39, 0); context.stroke(); circle(0, -27, 3);
  }
  context.restore();
}

function renderDawnFrame(progress = 0) {
  const context = dawnCanvas.getContext("2d");
  const completion = nightState.lastCompleted;
  if (!context || !completion) return;
  const width = dawnCanvas.width;
  const height = dawnCanvas.height;
  const sky = context.createLinearGradient(0, 0, 0, height);
  sky.addColorStop(0, "#d9b678");
  sky.addColorStop(.46, "#f0d3a0");
  sky.addColorStop(1, "#8f513f");
  context.fillStyle = sky;
  context.fillRect(0, 0, width, height);
  context.fillStyle = "rgba(255,238,185,.62)";
  context.beginPath(); context.arc(width * .78, height * .22, 88, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#4a2b28";
  context.fillRect(0, height * .67, width, height * .33);
  context.fillStyle = "#674035";
  context.fillRect(0, height * .69, width, 17);
  context.strokeStyle = "rgba(128,65,48,.34)";
  context.lineWidth = 2;
  for (let x = -height; x < width + height; x += 48) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x + height, height); context.stroke();
  }

  if (completion.kind === "rasoi-pairs") {
    const positions = completion.motifOrder.map((motif, index) => ({
      motif,
      x: 150 + (index % 5) * 225 + (index >= 5 ? 110 : 0),
      y: index < 5 ? 500 : 625,
    }));
    for (const item of positions) {
      context.fillStyle = "#dfc18a";
      context.beginPath(); context.ellipse(item.x, item.y + 9, 76, 42, 0, 0, Math.PI * 2); context.fill();
      context.strokeStyle = "#9b6b35"; context.lineWidth = 3; context.stroke();
      drawCanvasMotif(context, item.motif, item.x, item.y - 4, .82, progress);
    }
    dawnCanvas.setAttribute("aria-label", "Last night's nine kitchen motifs resting on brass plates at first light.");
  } else {
    context.fillStyle = "#d9b877";
    context.beginPath(); context.ellipse(width / 2, 545, 230, 86, 0, 0, Math.PI * 2); context.fill();
    context.strokeStyle = "#82562d"; context.lineWidth = 5; context.stroke();
    context.fillStyle = "#6b3a32";
    context.font = "44px Georgia";
    context.textAlign = "center";
    context.fillText("An earlier Nindova night, kept safely", width / 2, 540);
    dawnCanvas.setAttribute("aria-label", "A safely migrated Dawn from an earlier Nindova night.");
  }
}

async function openDawn() {
  if (!currentDawnEligibility().available || !nightState.lastCompleted) return false;
  showView("dawn");
  renderDawnFrame(0);
  dawnStatus.textContent = "The still is ready on this device.";
  return true;
}

async function dawnStillBlob() {
  renderDawnFrame(0);
  return NindovaDawn.stillBlob(dawnCanvas);
}

function downloadBlob(blob: Blob, filename: string) {
  const lease = NindovaDawn.leaseUrl(blob);
  const anchor = document.createElement("a");
  anchor.href = lease.url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(lease.revoke, 1200);
}

async function shareOrExplain(blob: Blob, filename: string) {
  const result = await NindovaDawn.shareBlob(blob, filename, "Nindova Dawn");
  dawnStatus.textContent = result === "shared" ? "Shared." : result === "cancelled" ? "Sharing cancelled. The still remains here." : "Sharing is unavailable here. Save the file instead.";
}

async function makeLoop() {
  loopLease?.revoke();
  loopLease = null;
  loopResult = null;
  dawnVideo.hidden = true;
  loopActions.hidden = true;
  dawnStatus.textContent = "Making a silent loop…";
  try {
    loopResult = await NindovaDawn.recordLoop(dawnCanvas, renderDawnFrame, {
      MediaRecorderCtor: forceLoopUnsupported ? null : undefined,
      durationMs: reviewerMode ? 240 : NindovaDawn.LOOP_DURATION_MS,
      fps: 15,
    });
    loopLease = NindovaDawn.leaseUrl(loopResult.blob);
    dawnVideo.src = loopLease.url;
    dawnVideo.hidden = false;
    loopActions.hidden = false;
    await dawnVideo.play().catch(() => {});
    dawnStatus.textContent = "The silent loop is ready.";
  } catch {
    dawnStatus.textContent = "A loop is unavailable in this browser. The still is still ready.";
  }
}

function closeDawn() {
  loopLease?.revoke();
  loopLease = null;
  dawnVideo.removeAttribute("src");
  dawnVideo.load();
  dawnVideo.hidden = true;
  loopActions.hidden = true;
  showView("intake");
}

function returnToIntake() {
  showView("intake");
  element<HTMLButtonElement>("beginBtn").focus();
}

function setLoopUnsupported(value: boolean) {
  forceLoopUnsupported = value;
  return forceLoopUnsupported;
}

element<HTMLButtonElement>("beginBtn").addEventListener("click", beginSession);
element<HTMLButtonElement>("notNowBtn").addEventListener("click", () => showView("dismissed"));
element<HTMLButtonElement>("returnBtn").addEventListener("click", returnToIntake);
element<HTMLButtonElement>("hintBtn").addEventListener("click", hint);
muteButton.addEventListener("click", () => { audioEnabled = !audioEnabled; updateMuteButton(); });
dawnButton.addEventListener("click", () => void openDawn());
element<HTMLButtonElement>("closeDawnBtn").addEventListener("click", closeDawn);
element<HTMLButtonElement>("dimRestBtn").addEventListener("click", () => {
  showView("rest");
  element<HTMLElement>("restTitle").focus({ preventScroll: true });
});
element<HTMLButtonElement>("tomorrowBtn").addEventListener("click", () => {
  if (!nightState.lastCompleted) return;
  const next = NindovaNight.setTomorrowIntention(nightState, nightState.lastCompleted.nightId);
  nightState = next.state;
  NindovaNight.writeStorage(safeStorage("local"), nightState);
  element<HTMLParagraphElement>("tomorrowStatus").textContent = "Held quietly on this device. No notification will be sent.";
});
element<HTMLButtonElement>("saveStillBtn").addEventListener("click", async () => {
  try { downloadBlob(await dawnStillBlob(), "nindova-dawn.png"); dawnStatus.textContent = "Still saved."; }
  catch { dawnStatus.textContent = "This browser could not save the still."; }
});
element<HTMLButtonElement>("shareStillBtn").addEventListener("click", async () => {
  try { await shareOrExplain(await dawnStillBlob(), "nindova-dawn.png"); }
  catch { dawnStatus.textContent = "Sharing did not complete. The still remains here."; }
});
element<HTMLButtonElement>("makeLoopBtn").addEventListener("click", () => void makeLoop());
element<HTMLButtonElement>("saveLoopBtn").addEventListener("click", () => {
  if (!loopResult) return;
  downloadBlob(loopResult.blob, `nindova-dawn.${loopResult.extension}`);
  dawnStatus.textContent = "Loop saved.";
});
element<HTMLButtonElement>("shareLoopBtn").addEventListener("click", async () => {
  if (!loopResult) return;
  try { await shareOrExplain(loopResult.blob, `nindova-dawn.${loopResult.extension}`); }
  catch { dawnStatus.textContent = "Sharing did not complete. The loop remains here."; }
});

document.addEventListener("visibilitychange", () => { if (!document.hidden) enforceBoundary(); });
window.addEventListener("pagehide", () => { loopLease?.revoke(); persistActiveSession(); });
window.setInterval(enforceBoundary, 1000);

const debug = {
  version: 1 as const,
  selectTile: (tileId: string) => selectTile(tileId),
  hint,
  finish: () => settle("completed"),
  advanceBy,
  setDawnNow,
  setLoopUnsupported,
  openDawn,
} as Partial<RasoiDebug>;

Object.defineProperties(debug, {
  state: { get: () => state },
  board: { get: () => board },
  tiles: { get: () => board?.tiles.map((tile) => ({
    ...tile,
    availability: NindovaRasoi.availabilityReason(board!, removed, tile.id),
    free: NindovaRasoi.isFree(board!, removed, tile.id),
    removed: removed.has(tile.id),
    selected: selectedTile === tile.id,
  })) ?? [] },
  selectedTile: { get: () => selectedTile },
  legalPairs: { get: () => board ? NindovaRasoi.legalPairs(board, removed) : [] },
  removedTileCount: { get: () => removed.size },
  reviewerMode: { get: () => reviewerMode },
  reduceMotion: { get: () => reduceMotion },
  audioEnabled: { get: () => audioEnabled },
  sessionElapsed: { get: () => startedAtMs ? Math.max(0, (nowMs() - startedAtMs) / 1000) : 0 },
  hardCapSeconds: { get: () => hardCapSeconds },
  endReason: { get: () => endReason },
  night: { get: () => currentNight ? {
    nightId: currentNight.nightId,
    dawnDate: currentNight.dawnDate,
    timeZone: currentNight.timeZone,
    recipeVersion: currentNight.recipeVersion,
  } : null },
  memory: { get: () => nightState },
  localRecovery: { get: () => ({ recovered: nightStateResult.recovered, reason: nightStateResult.reason }) },
  dawnEligibility: { get: currentDawnEligibility },
});

window.__rasoi = debug as RasoiDebug;
window.__ct = window.__rasoi;

updateMuteButton();
updateDawnButton();
if (!restoreActiveSession()) showView("intake");
