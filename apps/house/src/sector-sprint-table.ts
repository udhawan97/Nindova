import characterUrl from "./assets/gurpreet-walk.webp?url";
import worldUrl from "./assets/chandigarh-world.webp?url";
import {
  PLACES,
  CITY_FACTS,
  COURSE_MARKS,
  POWERUPS,
  JOURNEY_BOUNDARY_MS,
  createJourney,
  stepJourney,
  routeTo,
  nearby,
  place,
  canMeet,
  acceptEncounter,
  completedJourney,
  objective,
  type JourneyState,
  type PlaceId,
  type Point,
} from "./sector-sprint.js";
import { cameraFor, drawWorld, type Camera } from "./sector-sprint-world.js";
import type { ActiveGame } from "./house-state.js";
export {
  WORLD_HEIGHT as SECTOR_SPRINT_HEIGHT,
  WORLD_WIDTH as SECTOR_SPRINT_WIDTH,
} from "./sector-sprint.js";
export type SectorSprintRunnerSnapshot = JourneyState & {
  readonly mechanicsVersion: 3;
  readonly elapsedMs: number;
  readonly paused: boolean;
};
export type SectorSprintTerminal = {
  readonly kind: "completed" | "boundary-closed" | "abandoned";
  readonly runId: string;
};
export type SectorSprintTone =
  | "pickup"
  | "transform"
  | "impact"
  | "complication"
  | "release"
  | "lane-up"
  | "lane-down"
  | "tool"
  | "cadence"
  | "chime";
export type SectorSprintTableView = {
  readonly markup: string;
  readonly status: string;
  readonly focusSelector: string;
  readonly runner: SectorSprintRunnerSnapshot | null;
};
type TableOptions = {
  readonly reviewMode: boolean;
  readonly audio: {
    resumeFromGesture: () => void;
    suspend: () => void;
    close: () => void;
    tone: (
      tone: SectorSprintTone,
      act: number,
      complication?: string | null,
    ) => void;
  };
  readonly persist: (active: ActiveGame | null) => void;
  readonly renderShell: () => void;
  readonly celebrate: (message: string, chapter: number) => void;
  readonly terminal: (outcome: SectorSprintTerminal) => void;
  readonly focus: (
    selector: string,
    options?: { readonly reveal?: boolean },
  ) => void;
};
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
export function createSectorSprintTable(options: TableOptions) {
  let session: ActiveGame | null = null,
    state: JourneyState | null = null,
    terminalOutcome: SectorSprintTerminal | null = null;
  let narrated = false,
    paused = false,
    interrupted = false,
    exitSuspended = false,
    frame = 0,
    lastFrame = 0,
    clockStart: number | null = null,
    elapsedMs = 0,
    boundaryTimer = 0,
    generation = 0;
  let characterSheet: HTMLImageElement | null = null;
  let art: HTMLImageElement | null = null,
    camera: Camera | undefined,
    dialog: PlaceId | null = null,
    reply = false,
    mapOpen = false,
    journalOpen = false,
    statusMessage = "";
  let shiftPending = false;
  let jumpQueued = false,
    dashQueued = false;
  let renderedNearby = "",
    frameCount = 0,
    slowFrames = 0,
    lowQuality = false,
    sceneTime = 0;
  const keys = new Set<string>();
  const pointers = new Map<number, string>();
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const isSuspended = () =>
    paused || interrupted || exitSuspended || document.hidden;
  const focusSelector = () =>
    dialog
      ? "[data-encounter-choice], [data-dialog-close]"
      : narrated
        ? "[data-visit]"
        : "#runnerCanvas";
  function settleClock() {
    if (clockStart !== null) {
      elapsedMs += Math.max(0, performance.now() - clockStart);
      clockStart = null;
    }
  }
  function startClock() {
    if (session && !terminalOutcome && !isSuspended() && clockStart === null)
      clockStart = performance.now();
  }
  function elapsed() {
    return (
      elapsedMs +
      (clockStart === null ? 0 : Math.max(0, performance.now() - clockStart))
    );
  }
  function clearInput() {
    keys.clear();
    pointers.clear();
    jumpQueued = false;
    dashQueued = false;
    shiftPending = false;
    if (state)
      state = { ...state, route: [], walking: false, stride: 0, dashMs: 0 };
  }
  function stopLoop() {
    cancelAnimationFrame(frame);
    frame = 0;
    lastFrame = 0;
  }
  function emitTerminal(kind: SectorSprintTerminal["kind"]) {
    if (!session || terminalOutcome) return;
    settleClock();
    terminalOutcome = Object.freeze({ kind, runId: session.runId });
    stopLoop();
    clearInput();
    clearInterval(boundaryTimer);
    options.audio.close();
    options.persist(null);
    options.terminal(terminalOutcome);
  }
  function enforceBoundary() {
    settleClock();
    if (elapsedMs >= JOURNEY_BOUNDARY_MS) {
      emitTerminal("boundary-closed");
      return;
    }
    startClock();
  }
  function publish(focus = focusSelector()) {
    if (!session || !state || terminalOutcome) return;
    session = {
      ...session,
      chapter: Math.min(
        4,
        state.visited.filter((id) => id !== "plaza" && id !== "home").length,
      ),
      storyBeat: narrated ? 0 : null,
      touched: true,
    };
    options.persist({ ...session });
    options.renderShell();
    options.focus(focus);
  }
  function updateLive(message: string) {
    statusMessage = message;
    const live = document.querySelector("#gameStatus");
    if (live) live.textContent = message;
    const toast = document.querySelector("[data-toast]");
    if (toast) toast.textContent = message;
  }
  function loadArt() {
    if (art) return;
    const token = generation;
    art = new Image();
    art.decoding = "async";
    art.onload = () => {
      if (token === generation) draw();
    };
    art.onerror = () => {
      if (token === generation) {
        updateLive(
          "The city artwork could not load. Read the city offers the complete journey.",
        );
      }
    };
    art.src = worldUrl;
    characterSheet = new Image();
    characterSheet.decoding = "async";
    characterSheet.src = characterUrl;
  }
  function draw() {
    if (!state || narrated) return;
    const canvas = document.querySelector<HTMLCanvasElement>("#runnerCanvas");
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(lowQuality ? 1 : 1.75, devicePixelRatio || 1);
    const w = Math.round(rect.width * dpr),
      h = Math.round(rect.height * dpr);
    if (!w || !h) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      camera = undefined;
    }
    const c = canvas.getContext("2d", { alpha: false });
    if (!c) return;
    camera = cameraFor(state, rect.width, rect.height, camera, reduced.matches);
    drawWorld(
      c,
      state,
      camera,
      art,
      sceneTime,
      reduced.matches,
      lowQuality,
      characterSheet,
    );
    const renderFacts = {
      art: art?.complete && art.naturalWidth ? "illustrated" : "fallback",
      quality: lowQuality ? "balanced" : "high",
      mechanicsVersion: "3",
      character: characterSheet?.complete && characterSheet.naturalWidth ? "atlas" : "vector",
    };
    for (const [name, value] of Object.entries(renderFacts)) {
      if (canvas.dataset[name] !== value) canvas.dataset[name] = value;
    }
    const near = nearby(state);
    const id = near?.id ?? "";
    if (renderedNearby !== id) {
      renderedNearby = id;
      const button =
        document.querySelector<HTMLButtonElement>("[data-interact]");
      if (button) {
        button.disabled = !near;
        button.textContent = near
          ? near.id === "home"
            ? "Go inside"
            : `Talk to ${near.person.split(" · ")[0]}`
          : "Find a neighbor";
      }
      const label = document.querySelector("[data-location]");
      if (label)
        label.textContent = near?.district ?? "Chandigarh · the long way home";
    }
  }
  function tick(timestamp: number) {
    frame = 0;
    if (!state || terminalOutcome || narrated || isSuspended()) return;
    const interval = lastFrame ? timestamp - lastFrame : 16.67;
    lastFrame = timestamp;
    sceneTime += Math.min(50, interval) / 1000;
    if (interval > 28) slowFrames++;
    if (++frameCount === 90) {
      if (slowFrames > 18) lowQuality = true;
      frameCount = 0;
      slowFrames = 0;
    }
    if (!dialog && !mapOpen && !journalOpen) {
      const pressed = [...keys, ...pointers.values()];
      const x =
        Number(pressed.some((k) => k === "ArrowRight" || k === "d")) -
        Number(pressed.some((k) => k === "ArrowLeft" || k === "a"));
      const y =
        Number(pressed.some((k) => k === "ArrowDown" || k === "s")) -
        Number(pressed.some((k) => k === "ArrowUp" || k === "w"));
      const previous = state;
      state = stepJourney(
        state,
        { x, y, jump: jumpQueued, dash: dashQueued },
        interval,
      );
      jumpQueued = false;
      dashQueued = false;
      if (state.message !== previous.message) updateLive(state.message);
      if (state.toyPhase !== previous.toyPhase) {
        const objectiveNode = document.querySelector(".journey-objective p");
        if (objectiveNode) objectiveNode.textContent = objective(state);
        options.audio.tone("impact", state.toyPhase);
      }
      if (state.bag.length !== previous.bag.length) {
        session = {
          ...session!,
          chapter: Math.min(4, state.bag.length),
          touched: true,
        };
        options.persist({ ...session });
        options.audio.tone("pickup", Math.min(4, state.bag.length - 1));
        const objectiveNode = document.querySelector(".journey-objective p");
        if (objectiveNode) objectiveNode.textContent = objective(state);
      }
      if (state.power !== previous.power) {
        const powerNode = document.querySelector("[data-power-name]");
        if (powerNode)
          powerNode.textContent = state.power
            ? POWERUPS.find((p) => p.id === state!.power)!.label
            : "Jump + dash";
      }
    }
    draw();
    frame = requestAnimationFrame(tick);
  }
  function mount() {
    if (!session || terminalOutcome) return;
    loadArt();
    renderedNearby = "__refresh";
    draw();
    if (!frame && !narrated && !isSuspended())
      frame = requestAnimationFrame(tick);
  }
  function start(route: "action" | "narrated", runId: string) {
    destroy();
    generation++;
    state = createJourney();
    session = {
      gameId: "sector-sprint",
      chapter: 0,
      runId,
      memoryCovered: false,
      pegs: [[], [], []],
      selectedPeg: null,
      resolving: false,
      storyBeat: route === "narrated" ? 0 : null,
      touched: false,
    };
    narrated = route === "narrated";
    dialog = narrated ? "plaza" : null;
    statusMessage =
      "Carry the paper city from Sector 22 to the Sector 17 plaza. The route opens one encounter at a time.";
    boundaryTimer = window.setInterval(enforceBoundary, 250);
    startClock();
    publish();
  }
  function openEncounter(id: PlaceId) {
    if (!state || terminalOutcome || exitSuspended || interrupted) return;
    enforceBoundary();
    if (terminalOutcome) return;
    clearInput();
    mapOpen = false;
    journalOpen = false;
    dialog = id;
    reply = state.visited.includes(id);
    publish();
  }
  function travel(id: PlaceId) {
    if (
      !state ||
      terminalOutcome ||
      exitSuspended ||
      interrupted ||
      document.hidden ||
      (!narrated && paused)
    )
      return;
    if (narrated) {
      openEncounter(id);
      return;
    }
    state = {
      ...state,
      route: routeTo(
        state,
        COURSE_MARKS.find((m) =>
          (id === "market" || id === "craft") &&
          m.owner === id &&
          !state!.marks.includes(m.id),
        )
          ?.point ?? place(id).point,
      ),
      walking: false,
    };
    mapOpen = false;
    journalOpen = false;
    dialog = null;
    updateLive(
      `Walking to ${place(id).district}. Press a direction or Escape to stop.`,
    );
    publish("#runnerCanvas");
  }
  function choose(choice: number) {
    if (!state || !dialog || terminalOutcome || exitSuspended || interrupted)
      return;
    enforceBoundary();
    if (terminalOutcome) return;
    if (!canMeet(state, dialog)) {
      updateLive(
        "This stop opens after the encounter before it. Follow the paper route from Sector 22 toward Sector 17.",
      );
      return;
    }
    state = acceptEncounter(state, dialog, choice);
    reply = true;
    if (!paused)
      options.audio.tone("pickup", Math.min(4, state.visited.length - 1));
    publish("[data-dialog-close]");
  }
  function closeDialog() {
    if (!state) return;
    if (state.finished) {
      emitTerminal(completedJourney(state) ? "completed" : "boundary-closed");
      return;
    }
    dialog = null;
    reply = false;
    publish(narrated ? "[data-visit]" : "#runnerCanvas");
  }
  function suspend(next: boolean, reason: "blur" | "exit" | "pause") {
    settleClock();
    if (reason === "blur") interrupted = next;
    if (reason === "exit") exitSuspended = next;
    if (reason === "pause") paused = next;
    clearInput();
    stopLoop();
    if (isSuspended()) options.audio.suspend();
    else startClock();
    draw();
    mount();
  }
  function destroy() {
    generation++;
    settleClock();
    stopLoop();
    clearInterval(boundaryTimer);
    clearInput();
    options.audio.close();
    session = null;
    state = null;
    terminalOutcome = null;
    art = null;
    characterSheet = null;
    camera = undefined;
    dialog = null;
    reply = false;
    mapOpen = false;
    journalOpen = false;
    narrated = false;
    paused = false;
    interrupted = false;
    exitSuspended = false;
    elapsedMs = 0;
    clockStart = null;
    statusMessage = "";
    lowQuality = false;
    slowFrames = 0;
    frameCount = 0;
    sceneTime = 0;
  }
  function bag() {
    return (
      state?.bag
        .map((id) => {
          const p = PLACES.find((p) => p.item === id)!;
          return `<span class="journey-item" data-item="${id}"><i aria-hidden="true"></i>${p.itemLabel}</span>`;
        })
        .join("") || '<span class="bag-empty">Room for the afternoon.</span>'
    );
  }
  function destinations() {
    return PLACES.filter((p) => p.id !== "plaza")
      .map(
        (p) =>
          `<button type="button" data-visit="${p.id}"><span>${escape(p.district)}</span><strong>${escape(p.title)}</strong><small>${state?.visited.includes(p.id) ? "Visit again" : canMeet(state!, p.id) ? (!narrated && (p.id === "market" || p.id === "craft") ? "A playable encounter" : "Ready to visit") : "Follow the route to open this stop"}</small></button>`,
      )
      .join("");
  }
  function dialogue() {
    if (!dialog || !state) return "";
    const current = state;
    const p = place(dialog);
    const blocked = !canMeet(current, dialog);
    const text = reply
      ? p.replies[current.choices[dialog] === 1 ? 1 : 0]
      : blocked
        ? "“Take your time with the neighbors. I will be right here when you are ready.”"
        : p.introduction;
    const actionChoices =
      !narrated && dialog === "market"
        ? ["Cross the verandah course", "Ask Simran to set the tab"]
        : !narrated && dialog === "craft"
          ? [
              COURSE_MARKS.filter((mark) => mark.owner === "craft").every((mark) => current.marks.includes(mark.id))
                ? "Face the courtyard toy"
                : "Follow its three paper signals",
              "Let Iqbal hold the toy still",
            ]
          : p.choices;
    return `<section class="journey-dialog" aria-labelledby="encounterTitle" role="region"><div class="journey-portrait" style="--person-color:${p.color}" aria-hidden="true"><i></i></div><div class="journey-dialog-copy"><p class="kicker">${escape(p.person)}</p><h2 id="encounterTitle" tabindex="-1">${escape(p.title)}</h2><p>${escape(text)}</p><div class="journey-dialog-actions">${reply || blocked ? `<button class="primary-action" type="button" data-dialog-close>${current.finished ? "Close the afternoon" : "Back to the city"}</button>` : actionChoices.map((choice, i) => `<button class="${i ? "quiet-action" : "primary-action"}" type="button" ${!narrated && (dialog === "market" || dialog === "craft") && i === 0 ? "data-course-start" : `data-encounter-choice="${i}"`}>${escape(choice)}</button>`).join("")}${!reply && !blocked && dialog !== "plaza" ? '<button class="text-action" type="button" data-dialog-close>Maybe in a moment</button>' : ""}</div></div></section>`;
  }
  function render() {
    if (!state || !session) return "";
    const current = state;
    if (narrated)
      return `<section class="journey-narrated runner-story"><header><p class="kicker">Chandigarh · Sector 22 to Sector 17</p><h2>The long way home, at your pace.</h2><p>${escape(objective(state))}</p><p>Choose the next open stop. Every action route, route choice, city fact and ending is available here without timing, movement or visual interpretation.</p></header><div class="journey-bag" aria-label="Route objects">${bag()}</div>${dialogue()}${!dialog ? `<div class="journey-destinations">${destinations()}</div>` : ""}<aside class="journey-facts" aria-label="Chandigarh facts"><strong>City notes</strong><ul>${CITY_FACTS.map((fact) => `<li>${escape(fact)}</li>`).join("")}</ul></aside><button type="button" class="quiet-action" data-runner-pause aria-pressed="${paused}">${paused ? "Resume city" : "Pause city"}</button><p class="journey-disclosure">The places are based on Chandigarh; the people, paper-display errand and courtyard toy are fictional. Distances are compressed and this is not a navigation map. The table closes after ten foreground minutes.</p></section>`;
    const toyReady = COURSE_MARKS.filter((mark) => mark.owner === "craft").every((mark) => current.marks.includes(mark.id)) && !current.visited.includes("craft");
    return `<section class="journey-shell" aria-label="Chandigarh: The Long Way Home"><div class="journey-world"><canvas id="runnerCanvas" width="960" height="620" tabindex="0" aria-label="Playable Chandigarh route. Arrow keys or W A S D move; release to stop. Tap a path to walk there. Space or J jumps. Shift or K uses the scarf. E or Enter talks. Escape stops walking." aria-describedby="journeyHelp"></canvas><div class="journey-topline"><div><span class="journey-eyebrow">SECTOR 22 → SECTOR 17</span><strong data-location>Chandigarh · the long way home</strong></div><button type="button" data-map aria-expanded="${mapOpen}">Route + facts <span aria-hidden="true">↗</span></button></div><div class="journey-toast" data-toast>${escape(state.message)}</div><div class="journey-objective"><span data-power-name>${escape(state.power ? POWERUPS.find((p) => p.id === state!.power)!.label : "Jump + scarf")}</span><p>${escape(objective(state))}</p></div>${paused ? '<div class="journey-paused">The afternoon is on hold.<button type="button" data-runner-pause>Resume city</button></div>' : ""}${mapOpen || journalOpen ? `<section class="journey-map" aria-label="${mapOpen ? "Route and Chandigarh facts" : "Route objects"}"><header><h2>${mapOpen ? "Sector 22 → Sector 17" : "What you carry"}</h2><button type="button" data-close-panel aria-label="Close ${mapOpen ? "route and facts" : "bag"}">×</button></header>${mapOpen ? `<img src="${worldUrl}" alt="A fictional compressed play space connecting a Sector 22 home and market to a crossing, courtyard, wayfinder and Sector 17 plaza."><aside class="journey-facts"><strong>City notes</strong><ul>${CITY_FACTS.map((fact) => `<li>${escape(fact)}</li>`).join("")}</ul></aside>` : ""}<div class="journey-bag">${bag()}</div><div class="journey-destinations">${destinations()}</div></section>` : ""}</div>${dialogue()}<div class="journey-controls"><div class="journey-pad" role="group" aria-label="Walk"><button type="button" data-walk="ArrowUp" aria-label="Walk north">↑</button><button type="button" data-walk="ArrowLeft" aria-label="Walk west">←</button><button type="button" data-walk="ArrowDown" aria-label="Walk south">↓</button><button type="button" data-walk="ArrowRight" aria-label="Walk east">→</button></div><div class="journey-moves"><button type="button" data-jump>Jump <small>J / Space</small></button><button type="button" data-dash>${toyReady ? "Scarf deflect" : "Scarf dash"} <small>K / Shift</small></button></div><button class="journey-interact" type="button" data-interact disabled>Find the next encounter</button><div class="journey-utilities"><button type="button" data-bag aria-expanded="${journalOpen}">Carry</button><button type="button" data-runner-pause aria-pressed="${paused}">${paused ? "Resume" : "Pause"}</button><button type="button" data-runner-story>Read the route</button></div></div><p id="journeyHelp" class="journey-help">Move: WASD / arrows · Jump: Space / J · Scarf: Shift / K · Talk: E · tap paths to travel. <span>Real city references, fictional story and compressed distances.</span></p></section>`;
  }
  document.addEventListener("click", (event) => {
    if (!session || terminalOutcome || exitSuspended || interrupted) return;
    const t = event.target as Element;
    const visit = t.closest<HTMLElement>("[data-visit]");
    if (visit) {
      const id = visit.dataset.visit as PlaceId;
      if (PLACES.some((p) => p.id === id)) travel(id);
      return;
    }
    if (t.closest("[data-jump], [data-dash]")) {
      if (!isSuspended() && !dialog && !mapOpen && !journalOpen) {
        if (t.closest("[data-jump]")) jumpQueued = true;
        else dashQueued = true;
        options.audio.resumeFromGesture();
      }
      return;
    }
    if (t.closest("[data-course-start]") && dialog) {
      const id = dialog;
      dialog = null;
      reply = false;
      travel(id);
      return;
    }
    const choice = t.closest<HTMLElement>("[data-encounter-choice]");
    if (choice) {
      choose(Number(choice.dataset.encounterChoice));
      return;
    }
    if (t.closest("[data-dialog-close]")) {
      closeDialog();
      return;
    }
    if (t.closest("[data-runner-pause]")) {
      suspend(!paused, "pause");
      if (!paused) options.audio.resumeFromGesture();
      publish();
      return;
    }
    if (t.closest("[data-runner-story]")) {
      clearInput();
      stopLoop();
      narrated = true;
      mapOpen = false;
      journalOpen = false;
      dialog = null;
      publish("[data-visit]");
      return;
    }
    if (t.closest("[data-interact]")) {
      const p = state && nearby(state);
      if (p && !isSuspended()) openEncounter(p.id);
      return;
    }
    if (t.closest("[data-map], [data-bag], [data-close-panel]")) {
      clearInput();
      dialog = null;
      reply = false;
      mapOpen = t.closest("[data-map]") ? !mapOpen : false;
      journalOpen = t.closest("[data-bag]") ? !journalOpen : false;
      publish(mapOpen || journalOpen ? "[data-close-panel]" : "#runnerCanvas");
      return;
    }
    if (
      t instanceof HTMLCanvasElement &&
      t.id === "runnerCanvas" &&
      state &&
      camera &&
      !isSuspended() &&
      !dialog &&
      !mapOpen &&
      !journalOpen
    ) {
      const e = event as MouseEvent;
      const r = t.getBoundingClientRect();
      state = {
        ...state,
        route: routeTo(state, {
          x: camera.x + ((e.clientX - r.left) / r.width) * camera.width,
          y: camera.y + ((e.clientY - r.top) / r.height) * camera.height,
        }),
      };
      t.focus({ preventScroll: true });
      options.audio.resumeFromGesture();
    }
  });
  document.addEventListener("pointerdown", (event) => {
    if (
      !session ||
      !state ||
      narrated ||
      isSuspended() ||
      dialog ||
      mapOpen ||
      journalOpen
    )
      return;
    const t = (event.target as Element).closest<HTMLElement>("[data-walk]");
    if (!t) return;
    event.preventDefault();
    pointers.set(event.pointerId, t.dataset.walk!);
    state = { ...state, route: [] };
    try {
      t.setPointerCapture(event.pointerId);
    } catch {
      /* A released pointer still clears through the document handlers. */
    }
    options.audio.resumeFromGesture();
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    document.addEventListener(name, (event) => {
      pointers.delete((event as PointerEvent).pointerId);
    });
  document.addEventListener("keydown", (event) => {
    if (!session || !state || terminalOutcome || narrated || isSuspended())
      return;
    if ((event.target as Element).closest("input,textarea,select,dialog"))
      return;
    if (event.key === "Escape") {
      clearInput();
      if (mapOpen || journalOpen) {
        mapOpen = false;
        journalOpen = false;
        publish();
      }
      return;
    }
    if (event.key === "Tab") {
      shiftPending = false;
      return;
    }
    if (
      document.activeElement?.id !== "runnerCanvas" ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (dialog || mapOpen || journalOpen) return;
    if (event.key === "Shift") {
      if (!event.repeat) shiftPending = true;
      return;
    }
    const k = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    if ((k === " " || k === "j" || k === "k") && !event.repeat) {
      if (k === " " && (event.target as Element).closest("button")) return;
      event.preventDefault();
      if (k === " " || k === "j") jumpQueued = true;
      else dashQueued = true;
      options.audio.resumeFromGesture();
      return;
    }
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
      ].includes(k)
    ) {
      event.preventDefault();
      keys.add(k);
      state = { ...state, route: [] };
      options.audio.resumeFromGesture();
    } else if (
      (k === "e" || k === "Enter") &&
      !event.repeat &&
      (event.target as Element).id === "runnerCanvas"
    ) {
      const p = nearby(state);
      if (p) {
        event.preventDefault();
        openEncounter(p.id);
      }
    }
  });
  document.addEventListener("focusout", (event) => {
    if ((event.target as Element)?.id !== "runnerCanvas") return;
    keys.clear();
    shiftPending = false;
    const next = event.relatedTarget;
    if (
      !(next instanceof Element) ||
      !next.closest("[data-walk], [data-jump], [data-dash]")
    )
      clearInput();
  });
  document.addEventListener("keyup", (event) => {
    if (event.key === "Shift") {
      if (
        shiftPending &&
        session &&
        state &&
        !terminalOutcome &&
        !isSuspended() &&
        !dialog &&
        !mapOpen &&
        !journalOpen &&
        document.activeElement?.id === "runnerCanvas"
      )
        dashQueued = true;
      shiftPending = false;
    }
    keys.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
  });
  document.addEventListener("visibilitychange", () => {
    settleClock();
    clearInput();
    stopLoop();
    if (document.hidden) options.audio.suspend();
    else startClock();
    mount();
  });
  window.addEventListener("blur", () => {
    if (session) suspend(true, "blur");
  });
  window.addEventListener("focus", () => {
    if (session) suspend(false, "blur");
  });
  window.addEventListener("resize", () => {
    camera = undefined;
    draw();
  });
  reduced.addEventListener("change", (event) => {
    if (event.matches && session) {
      clearInput();
      stopLoop();
      narrated = true;
      dialog = null;
      mapOpen = false;
      journalOpen = false;
      publish("[data-visit]");
    }
  });
  return Object.freeze({
    start,
    view(): SectorSprintTableView {
      return {
        markup: render(),
        status: statusMessage,
        focusSelector: focusSelector(),
        runner: state
          ? {
              ...structuredClone(state),
              mechanicsVersion: 3,
              elapsedMs: elapsed(),
              paused: isSuspended(),
            }
          : null,
      };
    },
    afterRender: mount,
    setExitSuspended(next: boolean, fromGesture = false) {
      suspend(next, "exit");
      if (!next && fromGesture) options.audio.resumeFromGesture();
    },
    close: destroy,
  });
}
