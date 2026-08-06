import runnerCharacterSheetUrl from "./assets/sector-sprint-characters.png?url";
import {
  RUNNER_ACTS,
  RUNNER_ACTION_ROUTE_MINIMUM_MS,
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
} from "./sector-sprint.js";
import type { ActiveGame } from "./house-state.js";

export { RUNNER_ACTS as SECTOR_SPRINT_ACTS, RUNNER_HEIGHT as SECTOR_SPRINT_HEIGHT, RUNNER_WIDTH as SECTOR_SPRINT_WIDTH };
export type SectorSprintRunnerSnapshot = RunnerState;
export type SectorSprintTerminal =
  | { readonly kind: "completed"; readonly runId: string }
  | { readonly kind: "boundary-closed"; readonly runId: string }
  | { readonly kind: "abandoned"; readonly runId: string };
export type SectorSprintTone = "pickup" | "transform" | "impact" | "complication" | "release" | "lane-up" | "lane-down" | "tool" | "cadence" | "chime";

type AudioPort = {
  readonly resumeFromGesture: () => void;
  readonly suspend: () => void;
  readonly close: () => void;
  readonly tone: (tone: SectorSprintTone, actIndex: number, complication?: string | null) => void;
};

type TableOptions = {
  readonly reviewMode: boolean;
  readonly audio: AudioPort;
  readonly persist: (active: ActiveGame | null) => void;
  readonly renderShell: () => void;
  readonly celebrate: (message: string, chapter: number) => void;
  readonly terminal: (outcome: SectorSprintTerminal) => void;
  readonly focus: (selector: string) => void;
};

function escape(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function createSectorSprintTable(options: TableOptions) {
  let session: ActiveGame | null = null;
  let runnerState: RunnerState | null = null;
  let frame = 0;
  let lastTimestamp = 0;
  let elapsedMs = 0;
  let input: RunnerInput = {};
  let activePointerId: number | null = null;
  let activePointerAction: "up" | "down" | "tool" | null = null;
  let accumulatorMs = 0;
  let renderQuality: RunnerRenderQuality = "high";
  let frameIntervals: number[] = [];
  let paused = false;
  let interrupted = false;
  let exitSuspended = false;
  let boundaryTimer = 0;
  let boundaryStartedAt: number | null = null;
  let transitionTimer = 0;
  let transitionRemainingMs = 0;
  let transitionStartedAt: number | null = null;
  let transitionCallback: (() => void) | null = null;
  let renderSequence = 0;
  let paletteCache: RunnerPalette | null = null;
  let characterSheet: HTMLImageElement | null = null;
  let terminalOutcome: SectorSprintTerminal | null = null;
  let generation = 0;
  let statusMessage = "";

  function activeSnapshot(): ActiveGame | null {
    return session ? structuredClone(session) : null;
  }

  function snapshotRunner(): RunnerState | null {
    return runnerState ? structuredClone(runnerState) : null;
  }

  function isSuspended(): boolean {
    return paused || interrupted || exitSuspended || document.hidden;
  }

  function remainingMs(): number {
    const activeBoundaryTime = boundaryStartedAt !== null ? Math.max(0, performance.now() - boundaryStartedAt) : 0;
    return Math.max(0, RUNNER_SESSION_SECONDS * 1_000 - elapsedMs - activeBoundaryTime);
  }

  function retryAvailable(): boolean {
    return remainingMs() >= RUNNER_ACTION_ROUTE_MINIMUM_MS;
  }

  function emitTerminal(kind: SectorSprintTerminal["kind"]): void {
    if (!session || terminalOutcome) return;
    const outcome = Object.freeze({ kind, runId: session.runId }) as SectorSprintTerminal;
    terminalOutcome = outcome;
    stopLoop();
    clearTransition();
    options.audio.close();
    options.persist(null);
    options.terminal(outcome);
  }

  function ensureCharacterSheet(): void {
    const currentGeneration = generation;
    if (characterSheet) {
      void characterSheet.decode().then(() => { if (currentGeneration === generation && !terminalOutcome) drawCurrentFrame(); }, () => undefined);
      return;
    }
    const sheet = new Image();
    sheet.decoding = "async";
    const redraw = () => { if (currentGeneration === generation && !terminalOutcome) drawCurrentFrame(); };
    sheet.addEventListener("load", redraw);
    sheet.src = runnerCharacterSheetUrl;
    characterSheet = sheet;
    void sheet.decode().then(redraw, () => undefined);
  }

  function palette(): RunnerPalette {
    if (paletteCache) return paletteCache;
    const styles = getComputedStyle(document.documentElement);
    const token = (name: string) => styles.getPropertyValue(name).trim();
    paletteCache = {
      paper: token("--color-paper"), paper2: token("--color-paper-2"), paper3: token("--color-paper-3"),
      rule: token("--color-rule-strong"), neutral: token("--color-neutral"), muted: token("--color-muted"),
      ink: token("--color-ink"), inkSoft: token("--color-ink-soft"), accent: token("--color-accent"), accentSoft: token("--color-accent-soft"),
      ruby: token("--color-jewel-ruby"), sapphire: token("--color-jewel-sapphire"), jade: token("--color-jewel-jade"),
      fontDisplay: token("--font-display"), fontBody: token("--font-body"), fontMono: token("--font-mono"),
    };
    return paletteCache;
  }

  function prepareCanvas(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
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

  function drawCurrentFrame(): void {
    const canvas = document.querySelector<HTMLCanvasElement>("#runnerCanvas");
    const context = canvas ? prepareCanvas(canvas) : null;
    if (!canvas || !context || !runnerState) return;
    const illustrated = Boolean(characterSheet?.complete && characterSheet.naturalWidth > 0);
    drawRunnerFrame(context, { ...runnerState, paused: isSuspended() }, palette(), matchMedia("(prefers-reduced-motion: reduce)").matches, illustrated ? characterSheet : null, renderQuality);
    renderSequence += 1;
    canvas.dataset.renderSequence = String(renderSequence);
    canvas.dataset.lastAction = runnerState.lastAction ?? "idle";
    canvas.dataset.art = illustrated ? "illustrated" : "vector-fallback";
    canvas.dataset.quality = renderQuality;
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
      for (const key of ["nextGapCenter", "nextGapHeight", "nextMaterial", "nextSafeLane", "nextContactMs"] as const) delete canvas.dataset[key];
    }
  }

  function effectLabel(): string {
    if (!runnerState || !session) return "No temporary effect";
    const act = RUNNER_ACTS[session.chapter];
    if (runnerState.activeComplicationId) return act.complications.find((candidate) => candidate.id === runnerState!.activeComplicationId)?.label ?? "Comic complication";
    if (runnerState.activePower) return act.pickups.find((candidate) => candidate.kind === runnerState!.activePower)?.label ?? "Temporary effect";
    return "No temporary effect";
  }

  function updateLive(message: string): void {
    const live = document.querySelector<HTMLElement>("#runnerLive");
    if (live && live.textContent !== message) live.textContent = message;
  }

  function updateApproach(): void {
    if (!runnerState) return;
    const act = RUNNER_ACTS[runnerState.actIndex];
    const instruction = runnerUpcomingInstruction(runnerState);
    const next = [
      ...act.obstacles.map((obstacle) => ({ x: obstacle.x + obstacle.width, label: obstacle.label })),
      ...act.targets.filter((target) => !runnerState!.transformedTargetIds.includes(target.id) && !runnerState!.encounteredTargetIds.includes(target.id)).map((target) => ({ x: target.x + target.width, label: target.label })),
      ...act.complications.filter((candidate) => !runnerState!.encounteredComplicationIds.includes(candidate.id)).map((candidate) => ({ x: candidate.x, label: candidate.label })),
    ].filter((candidate) => candidate.x >= runnerState!.worldX + RUNNER_PLAYER_SCREEN_X).sort((left, right) => left.x - right.x)[0];
    const label = document.querySelector<HTMLElement>("#runnerApproach strong");
    if (label) label.textContent = instruction?.label ?? next?.label ?? "The Act curtain";
  }

  function updateHud(): void {
    const power = document.querySelector<HTMLElement>("#runnerPowerLabel");
    if (power) power.textContent = effectLabel();
  }

  function sampleQuality(interval: number): void {
    if (options.reviewMode || interval <= 0 || interval > 250) return;
    frameIntervals.push(interval);
    if (frameIntervals.length < 90) return;
    renderQuality = runnerRenderQualityForIntervals(frameIntervals);
    frameIntervals = frameIntervals.slice(-30);
  }

  function toneFor(previous: RunnerState, next: RunnerState, frameInput: RunnerInput): void {
    if (!session || session.storyBeat !== null || isSuspended()) return;
    let tone: SectorSprintTone | null = null;
    if (next.collectedPickupIds.length > previous.collectedPickupIds.length) tone = "pickup";
    else if (next.transformedTargetIds.length > previous.transformedTargetIds.length) tone = "transform";
    else if (next.impactMs > previous.impactMs) tone = "impact";
    else if (next.encounteredComplicationIds.length > previous.encounteredComplicationIds.length) tone = "complication";
    else if (previous.activeComplication && !next.activeComplication) tone = "release";
    else if (frameInput.laneDelta) tone = frameInput.laneDelta < 0 ? "lane-up" : "lane-down";
    else if (frameInput.toolPressed) tone = "tool";
    else if (Math.floor(next.elapsedMs / 1_600) > Math.floor(previous.elapsedMs / 1_600)) tone = "cadence";
    if (tone) options.audio.tone(tone, session.chapter, next.activeComplication);
  }

  function clearPressed(): void {
    document.querySelectorAll<HTMLElement>('[data-runner-action][data-pressed="true"]').forEach((control) => { delete control.dataset.pressed; });
  }

  function stopLoop(): void {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    if (boundaryTimer) window.clearTimeout(boundaryTimer);
    boundaryTimer = 0;
    if (boundaryStartedAt !== null) {
      elapsedMs += Math.max(0, performance.now() - boundaryStartedAt);
      boundaryStartedAt = null;
    }
    lastTimestamp = 0;
    accumulatorMs = 0;
    activePointerId = null;
    activePointerAction = null;
    input = {};
    if (runnerState) runnerState = { ...runnerState, pendingLaneDelta: null };
    clearPressed();
    pauseTransition();
  }

  function runFrame(timestamp: number): void {
    const currentGeneration = generation;
    if (!session || terminalOutcome) return stopLoop();
    if (!lastTimestamp) lastTimestamp = timestamp;
    const rawDelta = Math.max(0, timestamp - lastTimestamp);
    lastTimestamp = timestamp;
    if (isSuspended()) { drawCurrentFrame(); stopLoop(); return; }
    const activeDelta = Math.min(rawDelta, 2_000);
    sampleQuality(rawDelta);
    elapsedMs += activeDelta;
    if (elapsedMs >= RUNNER_SESSION_SECONDS * 1_000) { emitTerminal("boundary-closed"); return; }
    if (session.storyBeat === null && runnerState) {
      const previous = runnerState;
      const frameInput = { ...input };
      accumulatorMs = Math.min(accumulatorMs + activeDelta, RUNNER_FIXED_STEP_MS * RUNNER_MAX_CATCH_UP_STEPS);
      let firstStep = true;
      let steps = 0;
      while (accumulatorMs + 0.001 >= RUNNER_FIXED_STEP_MS && steps < RUNNER_MAX_CATCH_UP_STEPS) {
        runnerState = stepRunner(runnerState, firstStep ? frameInput : {}, RUNNER_FIXED_STEP_MS);
        input = {};
        firstStep = false;
        steps += 1;
        accumulatorMs -= RUNNER_FIXED_STEP_MS;
      }
      toneFor(previous, runnerState, frameInput);
      drawCurrentFrame(); updateApproach(); updateHud(); updateLive(runnerState.message);
      if (runnerState.failed) {
        stopLoop(); options.audio.suspend(); options.renderShell(); options.focus(retryAvailable() ? "[data-runner-retry]" : "[data-runner-story]"); return;
      }
      if (runnerState.finished) { completeAct(); return; }
    }
    if (currentGeneration === generation && !terminalOutcome) frame = requestAnimationFrame(runFrame);
  }

  function startBoundaryTimer(): void {
    if (!session || terminalOutcome || (session.storyBeat === null && !runnerState?.failed && !session.resolving) || isSuspended()) return;
    const remaining = remainingMs();
    if (remaining === 0) { emitTerminal("boundary-closed"); return; }
    const currentGeneration = generation;
    boundaryStartedAt = performance.now();
    boundaryTimer = window.setTimeout(() => {
      if (currentGeneration !== generation || terminalOutcome) return;
      boundaryTimer = 0; boundaryStartedAt = null; elapsedMs = RUNNER_SESSION_SECONDS * 1_000; emitTerminal("boundary-closed");
    }, remaining);
  }

  function clearTransition(): void {
    if (transitionTimer) window.clearTimeout(transitionTimer);
    transitionTimer = 0; transitionRemainingMs = 0; transitionStartedAt = null; transitionCallback = null;
  }

  function pauseTransition(): void {
    if (!transitionCallback || transitionStartedAt === null) return;
    if (transitionTimer) window.clearTimeout(transitionTimer);
    transitionTimer = 0;
    transitionRemainingMs = Math.max(0, transitionRemainingMs - (performance.now() - transitionStartedAt));
    transitionStartedAt = null;
  }

  function resumeTransition(): void {
    if (!transitionCallback || transitionTimer || isSuspended()) return;
    if (transitionRemainingMs <= 0) {
      const callback = transitionCallback; clearTransition(); callback(); return;
    }
    const currentGeneration = generation;
    transitionStartedAt = performance.now();
    transitionTimer = window.setTimeout(() => {
      if (currentGeneration !== generation || terminalOutcome) return;
      const callback = transitionCallback; clearTransition(); callback?.();
    }, transitionRemainingMs);
  }

  function scheduleTransition(delay: number, callback: () => void): void {
    clearTransition();
    if (delay <= 0) { callback(); return; }
    transitionRemainingMs = delay; transitionCallback = callback; resumeTransition();
  }

  function persistAndRender(focusSelector?: string): void {
    options.persist(activeSnapshot());
    options.renderShell();
    if (focusSelector) options.focus(focusSelector);
  }

  function completeAct(): void {
    if (!session || session.resolving || terminalOutcome) return;
    stopLoop();
    session.resolving = true;
    statusMessage = "";
    const completedChapter = session.chapter;
    const keepNarratedPaused = session.storyBeat !== null && paused;
    options.celebrate(RUNNER_ACTS[completedChapter].praise, completedChapter);
    if (!paused) options.audio.tone("chime", completedChapter);
    options.persist(activeSnapshot());
    const delay = keepNarratedPaused ? 0 : matchMedia("(prefers-reduced-motion: reduce)").matches ? 20 : 720;
    scheduleTransition(delay, () => {
      if (!session || terminalOutcome) return;
      stopLoop();
      if (elapsedMs >= RUNNER_SESSION_SECONDS * 1_000) { emitTerminal("boundary-closed"); return; }
      if (completedChapter === 4) { emitTerminal("completed"); return; }
      session.chapter += 1;
      session.storyBeat = session.storyBeat === null ? null : 0;
      session.resolving = false;
      runnerState = null;
      paused = keepNarratedPaused;
      statusMessage = "";
      persistAndRender();
      mount();
      options.focus(session.storyBeat === null ? '[data-runner-action="up"]' : "[data-story-advance]");
    });
    startBoundaryTimer();
  }

  function start(route: "action" | "narrated", runId: string): void {
    generation += 1;
    stopLoop(); clearTransition(); terminalOutcome = null; elapsedMs = 0; paused = false; interrupted = false; exitSuspended = false;
    renderQuality = matchMedia("(max-width: 480px)").matches ? "balanced" : "high";
    session = { gameId: "sector-sprint", chapter: 0, runId, memoryCovered: false, pegs: [], selectedPeg: null, resolving: false, storyBeat: route === "narrated" ? 0 : null, touched: false };
    runnerState = route === "action" ? createRunnerState(0) : null;
    statusMessage = route === "narrated" ? "The narrated city route is ready." : "The lane route begins gently. One architectural contact pauses this Action attempt.";
    if (route === "action") ensureCharacterSheet();
    persistAndRender();
    mount();
    options.focus(route === "action" ? '[data-runner-action="up"]' : "[data-story-advance]");
  }

  function mount(): void {
    if (!session || terminalOutcome) return;
    if (session.resolving) { resumeTransition(); startBoundaryTimer(); return; }
    stopLoop();
    if (session.storyBeat === null) {
      if (!runnerState || runnerState.actIndex !== session.chapter) runnerState = createRunnerState(session.chapter);
      lastTimestamp = 0; drawCurrentFrame();
      if (runnerState.failed) startBoundaryTimer();
      else if (!isSuspended()) frame = requestAnimationFrame(runFrame);
    } else startBoundaryTimer();
  }

  function queueAction(action: "up" | "down" | "tool"): void {
    if (!session || session.storyBeat !== null || runnerState?.failed || isSuspended()) return;
    if (action === "up") input = { ...input, laneDelta: -1 };
    else if (action === "down") input = { ...input, laneDelta: 1 };
    else input = { ...input, toolPressed: true };
    updateLive(action === "up" ? "Move up queued." : action === "down" ? "Move down queued." : `${RUNNER_ACTS[session.chapter].toolLabel} queued.`);
  }

  function setPaused(next: boolean): void {
    if (!session || terminalOutcome) return;
    if (next) { stopLoop(); options.audio.suspend(); }
    paused = next; lastTimestamp = 0;
    if (runnerState) runnerState = { ...runnerState, paused, pendingLaneDelta: null };
    document.querySelectorAll<HTMLButtonElement>("[data-runner-pause]").forEach((button) => {
      button.ariaPressed = String(paused);
      const label = button.querySelector("span");
      if (label) label.textContent = paused ? "Resume city" : "Pause city";
      else button.textContent = paused ? "Resume city" : "Pause city";
    });
    updateLive(paused ? "The city is paused. Progress and optional sound are still." : "The city resumes from the same place.");
    drawCurrentFrame();
    if (!paused) { resumeTransition(); mount(); }
  }

  function chooseNarrated(): void {
    if (!session || terminalOutcome) return;
    stopLoop();
    if (elapsedMs >= RUNNER_SESSION_SECONDS * 1_000) { emitTerminal("boundary-closed"); return; }
    options.audio.close();
    session.storyBeat = 0; runnerState = null; paused = false;
    persistAndRender("[data-story-advance]");
    mount();
  }

  function retry(): void {
    if (!session || !runnerState?.failed || terminalOutcome) return;
    stopLoop();
    if (elapsedMs >= RUNNER_SESSION_SECONDS * 1_000) { emitTerminal("boundary-closed"); return; }
    if (!retryAvailable()) {
      options.renderShell();
      document.querySelector<HTMLElement>("[data-runner-story]")?.focus({ preventScroll: true });
      return;
    }
    options.audio.close();
    session.chapter = 0; session.storyBeat = null; session.resolving = false; session.touched = true;
    runnerState = createRunnerState(0); paused = false;
    statusMessage = "A fresh Action attempt begins inside the same table boundary.";
    persistAndRender('[data-runner-action="up"]'); mount();
  }

  function advanceStory(): void {
    if (!session || session.storyBeat === null || terminalOutcome) return;
    session.touched = true;
    const act = RUNNER_ACTS[session.chapter];
    if (session.storyBeat >= act.storyBeats.length - 1) { completeAct(); return; }
    session.storyBeat += 1;
    statusMessage = "The narrated route moves to its next city beat.";
    persistAndRender("[data-story-advance]"); mount();
  }

  function suspend(reason: "visibility" | "blur" | "exit"): void {
    if (reason === "blur") interrupted = true;
    if (reason === "exit") exitSuspended = true;
    stopLoop(); options.audio.suspend(); drawCurrentFrame();
  }

  function resume(reason: "visibility" | "focus" | "exit"): void {
    if (reason === "focus") interrupted = false;
    if (reason === "exit") exitSuspended = false;
    resumeTransition(); mount(); drawCurrentFrame();
  }

  function pointerDown(pointerId: number, action: "up" | "down" | "tool", control: HTMLElement): void {
    if (activePointerId !== null) return;
    activePointerId = pointerId; activePointerAction = action; options.audio.resumeFromGesture(); control.dataset.pressed = "true"; queueAction(action);
  }

  function pointerEnd(pointerId: number, cancelled: boolean): void {
    if (activePointerId === null || pointerId !== activePointerId) return;
    activePointerId = null; activePointerAction = null;
    if (cancelled) { input = {}; if (runnerState) runnerState = { ...runnerState, pendingLaneDelta: null }; }
    clearPressed();
  }

  function orientationChanged(): void {
    activePointerId = null; activePointerAction = null; input = {};
    if (runnerState) runnerState = { ...runnerState, pendingLaneDelta: null };
    clearPressed(); drawCurrentFrame();
  }

  function destroy(optionsForDestroy: { abandon?: boolean } = {}): void {
    if (optionsForDestroy.abandon && session && !terminalOutcome) emitTerminal("abandoned");
    generation += 1; stopLoop(); clearTransition(); session = null; runnerState = null; terminalOutcome = null; characterSheet = null;
  }

  function render(): string {
    if (!session) return "";
    const act = RUNNER_ACTS[session.chapter];
    const failed = Boolean(runnerState?.failed);
    if (session.storyBeat !== null) {
      const beat = act.storyBeats[session.storyBeat] ?? act.storyBeats[0];
      return `<section class="runner-story" aria-labelledby="runnerStoryTitle"><div class="runner-story-heading"><span>${escape(act.location)}</span><h2 id="runnerStoryTitle">The narrated route</h2><p>${escape(act.houseCall)}</p></div><article class="runner-story-beat"><span>City beat ${session.storyBeat + 1} of ${act.storyBeats.length}</span><p>${escape(beat)}</p></article><div class="runner-story-actions"><button class="primary-action" type="button" data-story-advance>${session.storyBeat === act.storyBeats.length - 1 ? "Finish this Act" : "Next city beat"}</button><button class="quiet-action" type="button" data-runner-pause aria-pressed="${paused}">${paused ? "Resume city" : "Pause city"}</button></div><p class="runner-route-note">Same story, same curtain call, and the same private entertainment provenance. No timed response, precision, sound, or visual interpretation is required. The table still closes at its authored boundary; Pause city holds time while narrated beats remain available.</p></section>`;
    }
    return `<section class="runner-shell" aria-labelledby="runnerActTitle"><header class="runner-brief"><div><span>Act ${session.chapter + 1} scene · ${escape(act.location)}</span><h2 id="runnerActTitle">${escape(act.title)}</h2></div></header><figure class="runner-stage-frame"><div class="runner-canvas-window" ${failed ? 'data-runner-failed="true"' : ""}><canvas id="runnerCanvas" width="${RUNNER_WIDTH}" height="${RUNNER_HEIGHT}" aria-label="${escape(act.title)}. An original three-lane route through Chandigarh. Follow the next marker: Hold lane, Move up, or Move down. Each gate requires at most one adjacent move. One architectural contact ends this Action attempt." aria-describedby="runnerInstructions runnerApproach runnerLive runnerToolLine"></canvas></div><div class="runner-action-hud" aria-label="Current action set"><span>Act-local tool</span><strong id="runnerToolLabel">${escape(act.toolLabel)}</strong><span id="runnerPowerLabel">${escape(effectLabel())}</span></div><figcaption><span>${escape(act.sign)}</span><span>Original illustrated action theatre · fixed authored route</span></figcaption></figure><div class="runner-status-deck"><p id="runnerApproach" class="runner-approach"><span>${failed ? "Route state" : "Next passage"}</span><strong>${failed ? "One-hit wipeout" : escape(act.obstacles[0]?.label ?? act.closing)}</strong></p><p id="runnerLive" class="runner-live" role="status" aria-live="polite">${escape(runnerState?.message ?? act.opening)}</p></div>${failed ? `<section class="runner-recovery" aria-labelledby="runnerRecoveryTitle" aria-describedby="runnerInstructions runnerRecoveryBoundary"><div><p class="kicker">Action route paused</p><h3 id="runnerRecoveryTitle">The lane closed. The city holds.</h3></div><p id="runnerInstructions">This attempt ended on one contact. No life, score, checkpoint, or failure history is kept.</p><div class="runner-recovery-actions"><button class="primary-action" type="button" data-runner-retry ${retryAvailable() ? "" : "disabled"}>Retry Action from Act I</button><button class="quiet-action" type="button" data-runner-story>Continue narrated</button><button class="text-action" type="button" data-runner-abandon>Return to the Grand Salon</button></div><p id="runnerRecoveryBoundary" class="runner-route-note">${retryAvailable() ? "Retry uses the same foreground boundary; it does not restart the table." : "The boundary is too near for a complete five-Act Action retry."} Narrated beats remain available from this Act while the same boundary remains, and may close before the final curtain.</p><p id="runnerToolLine" class="runner-recovery-detail"><strong>${escape(act.toolLabel)}</strong> remains harmless choreography; only a lit architectural face ends an attempt.</p></section>` : `<div class="runner-controls" aria-label="Sector Sprint controls"><button class="runner-control-primary" type="button" data-runner-action="up"><i class="runner-control-mark runner-control-mark-up" aria-hidden="true"></i><span>Move up</span><small>↑ · W · one press</small></button><button class="runner-control-primary" type="button" data-runner-action="down"><i class="runner-control-mark runner-control-mark-down" aria-hidden="true"></i><span>Move down</span><small>↓ · S · one press</small></button><button class="runner-control-primary" type="button" data-runner-action="tool"><i class="runner-control-mark runner-control-mark-spark" aria-hidden="true"></i><span>${escape(act.toolLabel)}</span><small>J · K · X</small></button><button class="runner-control-quiet" type="button" data-runner-pause aria-pressed="${paused}"><i class="runner-control-mark runner-control-mark-pause" aria-hidden="true"></i><span>${paused ? "Resume city" : "Pause city"}</span><small>Movement and sound</small></button><button class="runner-control-quiet" type="button" data-runner-story><i class="runner-control-mark runner-control-mark-story" aria-hidden="true"></i><span>Narrated route</span><small>No precision needed</small></button></div><div class="runner-copy-deck"><p id="runnerToolLine"><strong>${escape(act.toolLabel)}</strong> · ${escape(act.toolLine)}</p><p id="runnerInstructions" class="runner-instructions">Follow the marker: Hold lane, Move up, or Move down. Each gate requires at most one adjacent move. The route begins gently and gains speed across the five Acts. One touch on a lit architectural face ends this Action attempt. Comic targets and tools are harmless.</p><p class="runner-house-call">${escape(act.houseCall)}</p></div>`}</section>`;
  }

  return Object.freeze({
    start, mount, render, queueAction, setPaused, chooseNarrated, retry, advanceStory, completeAct,
    suspend, resume, pointerDown, pointerEnd, orientationChanged, draw: drawCurrentFrame, destroy,
    abandon() { emitTerminal("abandoned"); },
    prepare() { ensureCharacterSheet(); },
    audioGesture() { options.audio.resumeFromGesture(); },
    active: activeSnapshot,
    runner: snapshotRunner,
    isPaused: () => paused,
    canRetry: retryAvailable,
    status: () => statusMessage,
    isActive: () => Boolean(session && !terminalOutcome),
  });
}
