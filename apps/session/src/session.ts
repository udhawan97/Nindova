import { NindovaActiveSession } from "./active-session.js";
import { NindovaDawn } from "./dawn-core.js";
import { NindovaNight, type NightCapture, type RasoiCompletion } from "./night-core.js";
import { NindovaRasoi, type RasoiBoard, type RasoiMotifId, type RasoiProfileId } from "./rasoi-core.js";
import { NindovaBoundary } from "./session-boundary.js";
import type { RasoiDebug, SessionState } from "./contracts.js";

const ACTIVE_SESSION_KEY = "nindova:active-session:v4";
const LEGACY_ACTIVE_SESSION_KEYS = ["nindova:active-session:v3"] as const;
const PRODUCTION_CAP_SECONDS = 15 * 60;
const PRODUCTION_WIND_DOWN_SECONDS = 12 * 60;
const REVIEW_CAP_SECONDS = 120;
const REVIEW_WIND_DOWN_SECONDS = 90;

const reviewerMode = new URLSearchParams(location.search).get("review") === "1";
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hardCapSeconds = reviewerMode ? REVIEW_CAP_SECONDS : PRODUCTION_CAP_SECONDS;
const windDownSeconds = reviewerMode ? REVIEW_WIND_DOWN_SECONDS : PRODUCTION_WIND_DOWN_SECONDS;
const END_AUTO_REST_MS = reviewerMode ? 4000 : 45_000;
const DRIFT_AUTO_REST_MS = reviewerMode ? 4000 : 30_000;

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
  drift: element<HTMLElement>("drift"),
  rest: element<HTMLElement>("rest"),
  dawn: element<HTMLElement>("dawn"),
};
const boardElement = element<HTMLDivElement>("board");
const boardShell = element<HTMLDivElement>("boardShell");
const boardStatus = element<HTMLParagraphElement>("boardStatus");
const profileBadge = element<HTMLParagraphElement>("profileBadge");
const pathNoteTitle = element<HTMLElement>("pathNoteTitle");
const pathNoteText = element<HTMLElement>("pathNoteText");
const driftObjects = element<HTMLDivElement>("driftObjects");
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
let endRestTimer: number | null = null;
let driftRestTimer: number | null = null;
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
  const common = 'viewBox="0 0 48 48" aria-hidden="true" fill="currentColor"';
  const drawings: Record<RasoiMotifId, string> = {
    belan: '<rect x="9" y="20" width="30" height="8" rx="4"/><rect x="2" y="22" width="8" height="4" rx="2"/><rect x="38" y="22" width="8" height="4" rx="2"/>',
    chakla: '<path fill-rule="evenodd" d="M24 8a16 16 0 1 0 .01 0Z M24 13.5a10.5 10.5 0 1 0 .01 0Z M24 15a9 9 0 1 0 .01 0Z"/>',
    tawa: '<circle cx="20" cy="24" r="14"/><rect x="32" y="21" width="14" height="6" rx="3"/>',
    chimta: '<g stroke="currentColor" stroke-width="3.5" stroke-linecap="round" fill="none"><path d="M24 9 16 39"/><path d="M24 9 32 39"/></g><circle cx="24" cy="8" r="4"/>',
    katori: '<rect x="8" y="17.5" width="32" height="3" rx="1.5"/><path d="M10 22a14 10 0 0 0 28 0Z"/><rect x="20" y="31.5" width="8" height="4" rx="1.5"/>',
    tiffin: '<path d="M19 15v-4q0-3 3-3h4q3 0 3 3v4" stroke="currentColor" stroke-width="3" fill="none"/><rect x="12" y="15" width="24" height="7" rx="3"/><rect x="12" y="24" width="24" height="7" rx="3"/><rect x="12" y="33" width="24" height="7" rx="3"/>',
    masala: '<path fill-rule="evenodd" d="M24 8a16 16 0 1 0 .01 0ZM33.5 20a4 4 0 1 0 .01 0ZM19.25 11.8a4 4 0 1 0 .01 0ZM28.75 11.8a4 4 0 1 0 .01 0ZM14.5 20a4 4 0 1 0 .01 0ZM24 20a4 4 0 1 0 .01 0ZM19.25 28.2a4 4 0 1 0 .01 0ZM28.75 28.2a4 4 0 1 0 .01 0Z"/>',
    chai: '<path fill-rule="evenodd" d="M15 9h18l-2.5 30q-.2 2-2.2 2h-8.6q-2 0-2.2-2Zm1.5 4.5v2.5h15v-2.5Z"/>',
    cooker: '<rect x="8" y="14" width="32" height="5" rx="2.5"/><rect x="20.5" y="7" width="7" height="6" rx="2"/><rect x="38" y="20" width="8" height="5" rx="2.5"/><path d="M10 21h28v11q0 8-8 8H18q-8 0-8-8Z"/>',
  };
  return `<svg ${common}>${drawings[motif]}</svg>`;
}

function createBoardDom() {
  if (!board) return;
  boardElement.replaceChildren();
  const profile = NindovaRasoi.profileDefinition(board.profile);
  boardElement.setAttribute("aria-label", `Thirty-six kitchen tiles in ${profile.layers} overlapping layers, ${profile.label}`);
  boardShell.dataset.profile = board.profile;
  profileBadge.textContent = board.profile === "deeper"
    ? `${profile.label} · triple crown · ${profile.layers} tight layers`
    : `${profile.label} · ${profile.layers} woven layers`;
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
    button.setAttribute("aria-label", `${motifNames[tile.motif]}, layer ${tile.layer + 1}, ${position}${isSelected ? ", selected" : ""}${isHinted ? ", suggested safe pair" : ""}`);
  }
  boardShell.style.setProperty("--warmth", String(1 - removed.size / board.tiles.length));
  if (focusId) requestAnimationFrame(() => tileButton(focusId)?.focus());
}

function persistActiveSession() {
  if (!board || !currentNight || (state !== "play" && state !== "settling")) return;
  try {
    safeStorage("session")?.setItem(ACTIVE_SESSION_KEY, JSON.stringify({
      // The writer takes its version from the decoder, so the two cannot drift.
      version: NindovaActiveSession.ACTIVE_SESSION_VERSION,
      profile: board.profile,
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
  try {
    const storage = safeStorage("session");
    storage?.removeItem(ACTIVE_SESSION_KEY);
    LEGACY_ACTIVE_SESSION_KEYS.forEach((key) => storage?.removeItem(key));
  } catch { /* no-op */ }
}

function anchorSessionClock(wallMs: number) {
  clockAnchorWallMs = wallMs;
  clockAnchorMonotonicMs = performance.now();
}

function readActiveSessionRaw() {
  try {
    return safeStorage("session")?.getItem(ACTIVE_SESSION_KEY) ?? null;
  } catch {
    return null;
  }
}

function restoreActiveSession() {
  const restoredAtMs = Date.now();
  const decoded = NindovaActiveSession.decodeActiveSession(readActiveSessionRaw(), {
    hardCapSeconds,
    windDownSeconds,
    restoredAtMs,
  });
  if (decoded.status !== "accepted") {
    clearActiveSession();
    return false;
  }
  const record = decoded.record;
  try {
    currentNight = record.night;
    board = record.board;
    removed = new Set(record.removed);
    selectedTile = null;
    startedAtMs = record.startedAtMs;
    deadlineAtMs = record.deadlineAtMs;
    windDownAtMs = record.windDownAtMs;
    anchorSessionClock(Math.max(restoredAtMs, startedAtMs));
    showView("play");
    createBoardDom();
    if (record.phase === "settling" || record.complete) {
      settle(record.endReason);
      return true;
    }
    setStatus("The same kitchen is still here.");
    enforceBoundary();
    return true;
  } catch {
    // Applying a resume must never leave the Night Room unopenable; a fresh
    // intake is always better than a boot that throws.
    clearActiveSession();
    return false;
  }
}

function chosenProfile() {
  const value = document.querySelector<HTMLInputElement>('input[name="rasoi-profile"]:checked')?.value;
  return value === "deeper" ? "deeper" : "gentle";
}

function beginSession(profile: RasoiProfileId = chosenProfile()) {
  clearClosureTimers();
  currentNight = NindovaNight.captureNight();
  board = NindovaRasoi.createBoard(currentNight.nightId, profile);
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
  setStatus("Open-side tiles sit above the quiet layers.");
  persistActiveSession();
}

async function playPairSound(layer: number) {
  if (!audioEnabled) return;
  try {
    audioContext ??= new AudioContext();
    await audioContext.resume();
    const now = audioContext.currentTime;
    const master = audioContext.createGain();
    master.gain.setValueAtTime(.0001, now);
    master.gain.exponentialRampToValueAtTime(.045, now + .012);
    master.gain.exponentialRampToValueAtTime(.0001, now + .34);
    master.connect(audioContext.destination);
    const toneFilter = audioContext.createBiquadFilter();
    toneFilter.type = "lowpass";
    toneFilter.frequency.setValueAtTime(2200, now);
    toneFilter.Q.setValueAtTime(.8, now);
    toneFilter.connect(master);
    for (const [offset, ratio, type] of [[0, 1, "sine"], [.052, 1.5, "triangle"], [.11, 2.01, "sine"]] as const) {
      const oscillator = audioContext.createOscillator();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime((294 + layer * 26) * ratio, now + offset);
      oscillator.connect(toneFilter);
      oscillator.start(now + offset);
      oscillator.stop(now + .34);
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
  void playPairSound(Math.max(first.layer, tile.layer));
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
  setStatus(`Hint: a free ${motif ? motifShortNames[motif] : "matching"} pair is ready.`);
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
  // Retire the resume record first. If recording the Night ever failed, the
  // record would otherwise survive and every later boot would replay the same
  // failure on this tab.
  clearActiveSession();
  const completed = NindovaNight.completeState(nightState, completion);
  nightState = completed.state;
  NindovaNight.writeStorage(safeStorage("local"), nightState);
  boardShell.classList.remove("is-settling");
  renderPathNote();
  showView("end");
  element<HTMLButtonElement>("dimRestBtn").focus();
  updateDawnButton();
  scheduleRest(END_AUTO_REST_MS, "end");
}

function renderPathNote() {
  if (!board) return;
  if (endReason === "production-cap") {
    pathNoteTitle.textContent = "The lid kept the boundary";
    pathNoteText.textContent = "The mound closed without a grade or penalty. Leaving it unfinished is part of the design.";
    return;
  }
  if (board.profile === "deeper") {
    pathNoteTitle.textContent = "You opened the triple crown";
    pathNoteText.textContent = "One match hid among the opening tiles; settling it revealed the next crown match, then the next.";
    return;
  }
  pathNoteTitle.textContent = "You read the woven layers";
  pathNoteText.textContent = "Open sides gave the woven mound more than one way in; each settled pair made the next part legible.";
}

function nowMs() {
  const monotonicNow = clockAnchorWallMs + (performance.now() - clockAnchorMonotonicMs);
  return Math.max(monotonicNow, Date.now()) + virtualOffsetMs;
}

function clearClosureTimers() {
  if (endRestTimer !== null) window.clearTimeout(endRestTimer);
  if (driftRestTimer !== null) window.clearTimeout(driftRestTimer);
  // A settlement that has not finished must not reopen the end card behind Rest.
  if (settlementTimer !== null) window.clearTimeout(settlementTimer);
  endRestTimer = null;
  driftRestTimer = null;
  settlementTimer = null;
}

function enterRest() {
  clearClosureTimers();
  showView("rest");
  element<HTMLElement>("restTitle").focus({ preventScroll: true });
}

function scheduleRest(delayMs: number, source: "end" | "drift") {
  const remainingMs = Math.max(0, deadlineAtMs - nowMs());
  const boundedDelay = Math.min(delayMs, remainingMs);
  const callback = () => {
    if (state === source) enterRest();
  };
  if (boundedDelay === 0) {
    callback();
    return;
  }
  if (source === "end") endRestTimer = window.setTimeout(callback, boundedDelay);
  else driftRestTimer = window.setTimeout(callback, boundedDelay);
}

function renderDrift() {
  if (!board) return;
  const motifs = [board.motifOrder[0], board.motifOrder[4], board.motifOrder[8]] as const;
  driftObjects.replaceChildren(...motifs.map((motif) => {
    const item = document.createElement("div");
    item.className = "drift-object";
    item.setAttribute("role", "listitem");
    item.innerHTML = `${iconSvg(motif)}<span>${motifNames[motif]}</span>`;
    return item;
  }));
}

function enterDrift() {
  if (state !== "end" || !board) return;
  clearClosureTimers();
  renderDrift();
  showView("drift");
  element<HTMLElement>("driftTitle").focus({ preventScroll: true });
  scheduleRest(DRIFT_AUTO_REST_MS, "drift");
}

function enforceBoundary() {
  const outcome = NindovaBoundary.boundaryOutcome(state, nowMs(), { windDownAtMs, deadlineAtMs });
  if (outcome === "settle") {
    settle("production-cap");
    return true;
  }
  if (outcome === "rest") {
    // ADR 0005: at the cap the Session completes one final response and then
    // continues into the return. A board still settling must therefore record
    // its Night before Rest, or the person silently loses their Dawn and the
    // stored record is never cleared. `enterRest` then cancels the pending
    // settlement so the end card cannot reappear behind Rest.
    try {
      if (state === "settling") finishSession();
    } finally {
      // Rest is unconditional. If recording the Night ever failed, the Session
      // must still close rather than retry the failure every second.
      enterRest();
    }
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

function renderDawnFrame(progress = 0) {
  NindovaDawn.renderFrame(dawnCanvas, nightState.lastCompleted, progress);
}

async function openDawn() {
  if (!currentDawnEligibility().available || !nightState.lastCompleted) return false;
  showView("dawn");
  renderDawnFrame(0);
  dawnStatus.textContent = "The still is ready on this device.";
  element<HTMLElement>("dawnTitle").focus({ preventScroll: true });
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
  returnToIntake();
}

function returnToIntake() {
  showView("intake");
  element<HTMLButtonElement>("beginBtn").focus();
}

function setLoopUnsupported(value: boolean) {
  forceLoopUnsupported = value;
  return forceLoopUnsupported;
}

element<HTMLButtonElement>("beginBtn").addEventListener("click", () => beginSession());
element<HTMLButtonElement>("notNowBtn").addEventListener("click", () => showView("dismissed"));
element<HTMLButtonElement>("returnBtn").addEventListener("click", returnToIntake);
element<HTMLButtonElement>("hintBtn").addEventListener("click", hint);
muteButton.addEventListener("click", () => { audioEnabled = !audioEnabled; updateMuteButton(); });
dawnButton.addEventListener("click", () => void openDawn());
element<HTMLButtonElement>("closeDawnBtn").addEventListener("click", closeDawn);
element<HTMLButtonElement>("dimRestBtn").addEventListener("click", enterRest);
element<HTMLButtonElement>("driftBtn").addEventListener("click", enterDrift);
element<HTMLButtonElement>("skipDriftBtn").addEventListener("click", enterRest);
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
