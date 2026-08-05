export const RUNNER_ACT_SECONDS = 32;
export const RUNNER_SESSION_SECONDS = 240;
export const RUNNER_WIDTH = 960;
export const RUNNER_HEIGHT = 432;
export const RUNNER_DPR_CAP = 2;
export const RUNNER_EFFECT_PARTICLE_CAP = 24;
export const RUNNER_PROJECTILE_CAP = 6;
export const RUNNER_CAMERA_SHAKE_CAP = 6;

export type RunnerLead = "son" | "mother" | "duo";
export type RunnerTargetKind =
  | "missed-call"
  | "price-tag"
  | "puddle-splash"
  | "produce-basket"
  | "traffic-bubble"
  | "streamer"
  | "grocery-list";

export type RunnerToolKind = "phone-pulse" | "bargain-burst" | "dhaaga-arc" | "umbrella-wave" | "ghar-flare";
export type RunnerPowerKind = "phulkari-guard" | "chaa-overdrive" | "monsoon-lift";
export type RunnerActionKind = "leap" | "air-step" | "dash" | "vault" | "stomp" | "tool" | "power" | "collision";

export const RUNNER_TARGET_KINDS: readonly RunnerTargetKind[] = [
  "missed-call",
  "price-tag",
  "puddle-splash",
  "produce-basket",
  "traffic-bubble",
  "streamer",
  "grocery-list",
] as const;

export const RUNNER_TOOL_TARGETS: Readonly<Record<RunnerToolKind, readonly RunnerTargetKind[]>> = {
  "phone-pulse": ["missed-call", "grocery-list", "puddle-splash"],
  "bargain-burst": ["price-tag", "produce-basket", "grocery-list"],
  "dhaaga-arc": ["streamer", "traffic-bubble"],
  "umbrella-wave": ["puddle-splash", "grocery-list", "traffic-bubble"],
  "ghar-flare": RUNNER_TARGET_KINDS,
};

export type RunnerTarget = {
  id: string;
  kind: RunnerTargetKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  transformedLabel: string;
  sparkQuip: string;
  collisionQuip: string;
};

export type RunnerPickup = {
  id: string;
  kind: RunnerPowerKind;
  x: number;
  y: number;
  label: string;
  acquiredLine: string;
};

export type RunnerAct = {
  id: string;
  title: string;
  location: string;
  sign: string;
  lead: RunnerLead;
  opening: string;
  houseCall: string;
  tool: RunnerToolKind;
  toolLabel: string;
  toolLine: string;
  sparkLabel: string;
  praise: string;
  closing: string;
  storyBeats: readonly string[];
  targets: readonly RunnerTarget[];
  pickups: readonly RunnerPickup[];
};

export type RunnerProjectile = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  ageMs: number;
  ttlMs: number;
  radius: number;
  tool: RunnerToolKind;
  pierce: boolean;
};

export type RunnerState = {
  actIndex: number;
  elapsedMs: number;
  worldX: number;
  y: number;
  velocityY: number;
  grounded: boolean;
  coyoteMs: number;
  jumpBufferMs: number;
  jumpHoldMs: number;
  airStepsRemaining: number;
  airStepMs: number;
  dashMs: number;
  vaultMs: number;
  stompMs: number;
  stumbleMs: number;
  toolRecoveryMs: number;
  pendingTool: boolean;
  activePower: RunnerPowerKind | null;
  collectedPickupIds: string[];
  lastCollectedPickupId: string | null;
  pickupFlourishMs: number;
  lastAction: RunnerActionKind | null;
  paused: boolean;
  finished: boolean;
  projectiles: RunnerProjectile[];
  transformedTargetIds: string[];
  encounteredTargetIds: string[];
  message: string;
  flourishMs: number;
  lastTransformedTargetId: string | null;
  landingMs: number;
  impactMs: number;
  lastEncounteredTargetId: string | null;
};

export type RunnerInput = {
  jump?: boolean;
  spark?: boolean;
  dash?: boolean;
  tool?: boolean;
  jumpPressed?: boolean;
  jumpHeld?: boolean;
  jumpReleased?: boolean;
  dashPressed?: boolean;
  toolPressed?: boolean;
};

export type RunnerPalette = {
  paper: string;
  paper2: string;
  paper3: string;
  rule: string;
  neutral: string;
  muted: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accentSoft: string;
  ruby: string;
  sapphire: string;
  jade: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
};

const FLOOR_Y = 350;
const PLAYER_HEIGHT = 76;
const PLAYER_WIDTH = 54;
export const RUNNER_PLAYER_SCREEN_X = 176;
const WORLD_LENGTH = 4_080;
const GRAVITY = 2_120;
const JUMP_VELOCITY = -790;
const AIR_STEP_VELOCITY = -650;
const STOMP_VELOCITY = 920;
const COYOTE_MS = 120;
const JUMP_BUFFER_MS = 140;
const JUMP_HOLD_MS = 180;
const TOOL_RECOVERY_MS = 260;

export function runnerWorldToScreen(worldX: number, cameraWorldX: number): number {
  return worldX - cameraWorldX;
}

function target(
  id: string,
  kind: RunnerTargetKind,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  transformedLabel: string,
  sparkQuip: string,
  collisionQuip: string,
): RunnerTarget {
  return { id, kind, x, y, width, height, label, transformedLabel, sparkQuip, collisionQuip };
}

function pickup(id: string, kind: RunnerPowerKind, x: number, y: number, label: string, acquiredLine: string): RunnerPickup {
  return { id, kind, x, y, label, acquiredLine };
}

export const RUNNER_ACTS: readonly RunnerAct[] = [
  {
    id: "ghar-wapsi",
    title: "Ghar Wapsi",
    location: "Sector 22 · the late-return lane",
    sign: "SECTOR 22",
    lead: "son",
    opening: "Gurpreet is an adult with a key, a plan, and twelve missed calls from home.",
    houseCall: "Harjit’s voice note: ‘Beta, the roti has cooled twice. Bring your explanation warm.’",
    tool: "phone-pulse",
    toolLabel: "Phone Pulse",
    toolLine: "A focused reply flare turns missed-call noise into a clear route home.",
    sparkLabel: "Send apology note",
    praise: "Shabaash — apology delivered with the groceries intact.",
    closing: "The front gate appears. Gurpreet arrives with dignity, groceries, and a revised estimate of ‘five minutes.’",
    storyBeats: [
      "Gurpreet leaves Sector 22 with one careful apology and no heroic shortcut.",
      "A missed-call bubble becomes a tidy ‘On my way’ note; the puddle keeps only his reflection, not his shoe.",
      "At the gate, Harjit checks the grocery bag first and the explanation second. Affection wins on a technicality.",
    ],
    targets: [
      target("gw-call-1", "missed-call", 760, 230, 86, 52, "12 missed calls", "On my way", "Message delivered. The number 12 has left the building.", "Oho. The missed calls have formed a committee."),
      target("gw-puddle-1", "puddle-splash", 1_330, 324, 112, 28, "Monsoon puddle", "Neat ripple", "Puddle negotiated. Pajama cuffs remain respectable.", "The puddle accepts one shoe as a security deposit."),
      target("gw-list-1", "grocery-list", 2_030, 245, 76, 88, "Forgotten list", "List folded", "List recovered: dhania was, in fact, important.", "A grocery list arrives with documentary evidence."),
      target("gw-call-2", "missed-call", 2_820, 220, 96, 58, "Where are you?", "At the gate", "Location updated with unusual accuracy.", "The speech bubble is faster than the shortcut."),
      target("gw-puddle-2", "puddle-splash", 3_420, 320, 126, 32, "Last puddle", "Brass ripple", "A final clean hop for the household record.", "No fall. Only a very Chandigarh splash."),
    ],
    pickups: [pickup("gw-guard", "phulkari-guard", 1_665, 244, "Phulkari Guard", "Phulkari Guard ready. The next interference becomes part of the pattern.")],
  },
  {
    id: "sabzi-command",
    title: "Sabzi Command",
    location: "Sector 26 · morning mandi",
    sign: "SECTOR 26",
    lead: "mother",
    opening: "Gurpreet’s mother, Harjit, takes the market route with exact change and the calm authority of a cabinet minister.",
    houseCall: "House message: ‘Bhindi, tomatoes, dhania—and do not let one dramatic price tag write the budget.’",
    tool: "bargain-burst",
    toolLabel: "Bargain Burst",
    toolLine: "A broad close-range wave settles price tags and runaway produce together.",
    sparkLabel: "Send bargain burst",
    praise: "Kamaal — Harjit has balanced the bag and the budget.",
    closing: "The sabzi bag is balanced, the bill is legible, and the coriander has arrived free of unnecessary suspense.",
    storyBeats: [
      "Harjit enters the mandi with a cloth bag, a written list, and no interest in theatrical pricing.",
      "A giant price tag folds into a fair receipt. Runaway tomatoes return to their basket without a chase scene.",
      "She leaves with every item, exact change, and enough coriander to make the fridge smell optimistic.",
    ],
    targets: [
      target("sc-price-1", "price-tag", 690, 232, 82, 64, "₹??", "Fair price", "The price tag remembers arithmetic.", "This price tag has hired its own publicist."),
      target("sc-basket-0", "produce-basket", 990, 292, 96, 58, "Pea escape", "Peas parked", "The peas return to their assigned sector.", "Five peas attempt a tiny green jailbreak."),
      target("sc-basket-1", "produce-basket", 1_280, 292, 106, 60, "Runaway tomatoes", "Basket settled", "Tomatoes return to formation.", "Three tomatoes attempt municipal independence."),
      target("sc-price-2", "price-tag", 1_980, 222, 92, 70, "Today only!", "Receipt ready", "Drama removed. Receipt retained.", "The exclamation mark is doing most of the pricing."),
      target("sc-list-1", "grocery-list", 2_590, 238, 76, 92, "Dhania?", "Dhania ✓", "The most important line is now impossible to miss.", "Without dhania, this mission has no closing argument."),
      target("sc-basket-2", "produce-basket", 3_290, 286, 116, 66, "Rolling bhindi", "Bhindi packed", "Bhindi contained with cabinet-level efficiency.", "The bhindi has mistaken the aisle for Madhya Marg."),
    ],
    pickups: [pickup("sc-overdrive", "chaa-overdrive", 1_610, 240, "Chaa Overdrive", "Chaa Overdrive ready. The next bargain fills the whole aisle.")],
  },
  {
    id: "baraat-detour",
    title: "Baraat Detour",
    location: "Sector 17 · the festive crossing",
    sign: "SECTOR 17",
    lead: "duo",
    opening: "Gurpreet and Harjit meet a cheerful road-wide celebration. Going around is now the family strategy.",
    houseCall: "Joint decision: ‘Respect the dhol. Also respect that the paneer is waiting.’",
    tool: "dhaaga-arc",
    toolLabel: "Dhaaga Arc",
    toolLine: "A returning ribbon arc passes through festive tangles without touching the celebration.",
    sparkLabel: "Send polite path",
    praise: "Wah ji wah — full celebration, zero lane argument.",
    closing: "The celebration keeps dancing, the family keeps moving, and nobody has attempted to overtake a dhol.",
    storyBeats: [
      "The road fills with streamers and a cheerful ‘just two minutes’ bubble of uncertain legal meaning.",
      "Harjit finds the side lane; Gurpreet sends a polite path note. Even the ribbon agrees to make room.",
      "They pass without interrupting one dance step. This counts as excellent city diplomacy.",
    ],
    targets: [
      target("bd-stream-1", "streamer", 720, 180, 90, 146, "Ribbon curtain", "Ribbon parted", "The ribbon performs one elegant side-step.", "Festive ribbon: beautiful, committed, exactly at face height."),
      target("bd-bubble-0", "traffic-bubble", 1_030, 228, 104, 62, "Dhol ahead", "Side beat →", "The beat stays loud; the route becomes clear.", "The dhol has excellent timing and no lane map."),
      target("bd-bubble-1", "traffic-bubble", 1_350, 218, 106, 64, "Two minutes", "Side lane open", "A practical route replaces elastic time.", "In city mathematics, two minutes may contain a full song."),
      target("bd-stream-2", "streamer", 2_020, 186, 96, 140, "More ribbon", "Ribbon bowed", "The streamer acknowledges right of passage.", "The ribbon has strong opinions about lane discipline."),
      target("bd-stream-mid", "streamer", 2_380, 194, 84, 132, "Sehra ribbon", "Ribbon twirled", "A small flourish, then a perfectly civil opening.", "One ribbon has mistaken Gurpreet for the choreography."),
      target("bd-bubble-2", "traffic-bubble", 2_720, 210, 112, 70, "Bas, bas!", "After you", "Politeness creates a lane of its own.", "Everyone says ‘bas’; nobody has defined the unit."),
      target("bd-stream-3", "streamer", 3_390, 176, 96, 150, "Final streamer", "Path complete", "Celebration preserved. Route restored.", "One last streamer requests a dance audition."),
    ],
    pickups: [pickup("bd-lift", "monsoon-lift", 1_705, 214, "Monsoon Lift", "Monsoon Lift ready. The next aerial line stays open longer.")],
  },
  {
    id: "monsoon-protocol",
    title: "Monsoon Protocol",
    location: "Madhya Marg · rain with opinions",
    sign: "MADHYA MARG",
    lead: "duo",
    opening: "The rain has arrived sideways. Harjit and Gurpreet’s umbrella has entered coalition government.",
    houseCall: "Harjit: ‘We are not fighting the rain. We are negotiating with its paperwork.’",
    tool: "umbrella-wave",
    toolLabel: "Umbrella Wave",
    toolLine: "A rising guard wave clears water and paper while opening a higher route.",
    sparkLabel: "Send umbrella signal",
    praise: "Balle — the umbrella coalition survives another crossing.",
    closing: "The clouds keep their dignity. So do the groceries. The umbrella is promoted without a ceremony.",
    storyBeats: [
      "A puddle spreads across the lane like it has received planning permission.",
      "The umbrella signal turns a splash into a brass ripple and a detour bubble into a useful arrow.",
      "Harjit and Gurpreet reach the dry side together. Neither mentions who forgot to check the forecast.",
    ],
    targets: [
      target("mp-puddle-1", "puddle-splash", 650, 320, 132, 32, "Wide puddle", "Quiet ripple", "Rainwater accepts a smaller footprint.", "This puddle has applied for sector status."),
      target("mp-list-0", "grocery-list", 980, 238, 80, 90, "Paper bag", "Bag tucked", "The paper bag receives a sensible rain posting.", "The bag has discovered weather without consenting."),
      target("mp-bubble-1", "traffic-bubble", 1_270, 222, 116, 68, "Road closed?", "Dry lane →", "The question mark becomes useful civic information.", "The sign has outsourced certainty."),
      target("mp-puddle-mid", "puddle-splash", 1_620, 322, 118, 30, "Sneaky puddle", "Small ripple", "A suspicious puddle is reduced to a footnote.", "This puddle arrived without planning permission."),
      target("mp-puddle-2", "puddle-splash", 1_940, 316, 146, 36, "Wider puddle", "Umbrella ripple", "A clean arc over ambitious water.", "The puddle is now offering waterfront property."),
      target("mp-list-1", "grocery-list", 2_630, 236, 82, 94, "Keep dry", "Bag covered", "Groceries receive immediate monsoon protection.", "The paper bag is reconsidering its career."),
      target("mp-bubble-mid", "traffic-bubble", 3_000, 224, 110, 66, "Cloud meeting", "Clear patch →", "The clouds adjourn without another motion.", "Three clouds have formed a very wet committee."),
      target("mp-puddle-3", "puddle-splash", 3_340, 318, 138, 34, "Final splash", "Rain settled", "The last splash becomes a quiet line of brass.", "Rain makes one final strongly worded submission."),
    ],
    pickups: [pickup("mp-guard", "phulkari-guard", 2_315, 232, "Phulkari Guard", "Phulkari Guard ready. The rain can make one dramatic entrance.")],
  },
  {
    id: "roti-relay",
    title: "Roti Relay",
    location: "The home lane · dinner approach",
    sign: "GHAR THIS WAY",
    lead: "duo",
    opening: "One bag, two umbrellas, and a dinner that has waited with admirable restraint.",
    houseCall: "Family bulletin: ‘Come home safely. The rotis can be reheated; your filmi entrance cannot.’",
    tool: "ghar-flare",
    toolLabel: "Ghar Flare",
    toolLine: "Mother and son send a three-lane home signal through the last loose reminders.",
    sparkLabel: "Send ghar spark",
    praise: "Kya baat — sabzi home, story ready, dinner resumed.",
    closing: "Door open. Sabzi accounted for. Roti reheated. The city keeps the punchline and lets the family eat.",
    storyBeats: [
      "The home lane gathers every loose reminder: grocery list, rain splash, festive ribbon, missed-call bubble.",
      "Mother and son divide the work without debate: she carries the sabzi; he carries the explanation.",
      "They enter together. Dinner resumes, and the great household emergency becomes tomorrow’s best story.",
    ],
    targets: [
      target("rr-call-1", "missed-call", 690, 220, 104, 66, "Roti report", "Reheat ready", "Dinner logistics become manageable.", "The roti status desk is highly responsive."),
      target("rr-list-0", "grocery-list", 990, 242, 80, 90, "Key check", "Keys ready", "The house key reports for final duty.", "The key is hiding in the bag with seniority."),
      target("rr-stream-1", "streamer", 1_310, 184, 92, 142, "Lane ribbon", "Ribbon folded", "One tidy bow for the final lane.", "A leftover streamer seeks one more scene."),
      target("rr-call-mid", "missed-call", 1_640, 224, 100, 62, "Gate update", "Gate open", "The gate receives a remarkably accurate update.", "The gate has joined the family group chat."),
      target("rr-list-1", "grocery-list", 1_980, 238, 82, 94, "Sabzi check", "All packed", "Every vegetable reports present.", "The grocery list requests roll call."),
      target("rr-basket-mid", "produce-basket", 2_320, 290, 106, 62, "Dhania top", "Dhania safe", "Coriander survives the final handoff with honour.", "The dhania has chosen the most dramatic seat."),
      target("rr-puddle-1", "puddle-splash", 2_690, 320, 144, 32, "Home puddle", "Doorstep ripple", "Even the puddle knows the run is nearly done.", "The doorstep puddle wants a cameo."),
      target("rr-stream-mid", "streamer", 3_030, 188, 88, 138, "Gate ribbon", "Welcome bow", "The gate ribbon performs the smallest possible welcome.", "The ribbon is holding one final family function."),
      target("rr-bubble-1", "traffic-bubble", 3_360, 214, 118, 72, "Welcome home", "Dinner this way", "The final bubble points toward dinner.", "The house has issued a warm summons."),
    ],
    pickups: [pickup("rr-overdrive", "chaa-overdrive", 1_805, 236, "Chaa Overdrive", "Chaa Overdrive ready. The home signal now reaches every lane.")],
  },
] as const;

export function createRunnerState(actIndex: number): RunnerState {
  if (!Number.isInteger(actIndex) || actIndex < 0 || actIndex >= RUNNER_ACTS.length) throw new Error(`Unknown runner act: ${actIndex}`);
  return {
    actIndex,
    elapsedMs: 0,
    worldX: 0,
    y: FLOOR_Y - PLAYER_HEIGHT,
    velocityY: 0,
    grounded: true,
    coyoteMs: COYOTE_MS,
    jumpBufferMs: 0,
    jumpHoldMs: 0,
    airStepsRemaining: 1,
    airStepMs: 0,
    dashMs: 0,
    vaultMs: 0,
    stompMs: 0,
    stumbleMs: 0,
    toolRecoveryMs: 0,
    pendingTool: false,
    activePower: null,
    collectedPickupIds: [],
    lastCollectedPickupId: null,
    pickupFlourishMs: 0,
    lastAction: null,
    paused: false,
    finished: false,
    projectiles: [],
    transformedTargetIds: [],
    encounteredTargetIds: [],
    message: RUNNER_ACTS[actIndex].opening,
    flourishMs: 0,
    lastTransformedTargetId: null,
    landingMs: 0,
    impactMs: 0,
    lastEncounteredTargetId: null,
  };
}

function overlaps(a: { x: number; y: number; width: number; height: number }, b: { x: number; y: number; width: number; height: number }): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

export function stepRunner(previous: RunnerState, input: RunnerInput, deltaMs: number): RunnerState {
  const state: RunnerState = {
    ...previous,
    projectiles: previous.projectiles.map((projectile) => ({ ...projectile })),
    transformedTargetIds: [...previous.transformedTargetIds],
    encounteredTargetIds: [...previous.encounteredTargetIds],
    collectedPickupIds: [...previous.collectedPickupIds],
  };
  if (state.finished || state.paused) return state;
  const stepMs = Math.max(0, Math.min(deltaMs, 50));
  state.flourishMs = Math.max(0, state.flourishMs - stepMs);
  state.landingMs = Math.max(0, state.landingMs - stepMs);
  state.impactMs = Math.max(0, state.impactMs - stepMs);
  state.pickupFlourishMs = Math.max(0, state.pickupFlourishMs - stepMs);
  state.airStepMs = Math.max(0, state.airStepMs - stepMs);
  state.dashMs = Math.max(0, state.dashMs - stepMs);
  state.vaultMs = Math.max(0, state.vaultMs - stepMs);
  state.stompMs = Math.max(0, state.stompMs - stepMs);
  state.stumbleMs = Math.max(0, state.stumbleMs - stepMs);
  state.toolRecoveryMs = Math.max(0, state.toolRecoveryMs - stepMs);
  state.jumpBufferMs = Math.max(0, state.jumpBufferMs - stepMs);
  const dt = stepMs / 1_000;
  const wasGrounded = state.grounded;
  state.coyoteMs = state.grounded ? COYOTE_MS : Math.max(0, state.coyoteMs - stepMs);
  const jumpPressed = Boolean(input.jumpPressed || input.jump);
  const dashPressed = Boolean(input.dashPressed || input.dash);
  const toolPressed = Boolean(input.toolPressed || input.tool || input.spark);
  if (jumpPressed) state.jumpBufferMs = JUMP_BUFFER_MS;

  const beginJump = (velocity: number, action: RunnerActionKind, line: string) => {
    const lifted = state.activePower === "monsoon-lift";
    state.velocityY = velocity * (lifted ? 1.14 : 1);
    state.grounded = false;
    state.coyoteMs = 0;
    state.jumpBufferMs = 0;
    state.jumpHoldMs = lifted ? JUMP_HOLD_MS + 120 : JUMP_HOLD_MS;
    state.lastAction = action;
    state.message = lifted ? `${line} Monsoon Lift opens the air.` : line;
    if (lifted) state.activePower = null;
  };

  if (state.jumpBufferMs > 0 && (state.grounded || state.coyoteMs > 0)) {
    state.airStepsRemaining = 1;
    beginJump(JUMP_VELOCITY, "leap", "Leap committed. The city drops away.");
  } else if (jumpPressed && !state.grounded && state.airStepsRemaining > 0) {
    state.airStepsRemaining -= 1;
    state.airStepMs = 340;
    beginJump(AIR_STEP_VELOCITY, "air-step", "Air step. One more line through the skyline.");
  }

  if (input.jumpReleased) {
    state.jumpHoldMs = 0;
    if (state.velocityY < -300) state.velocityY *= 0.58;
  }

  if (dashPressed) {
    if (state.grounded) {
      const act = RUNNER_ACTS[state.actIndex];
      const nextLow = act.targets.find((candidate) => (
        !state.transformedTargetIds.includes(candidate.id)
        && candidate.x >= state.worldX + RUNNER_PLAYER_SCREEN_X + 20
        && candidate.x <= state.worldX + RUNNER_PLAYER_SCREEN_X + 190
        && candidate.height <= 72
      ));
      if (nextLow) {
        state.vaultMs = 420;
        state.airStepsRemaining = 1;
        beginJump(-570, "vault", `Context vault. ${nextLow.label} stays below the line.`);
      } else {
        state.dashMs = 420;
        state.lastAction = "dash";
        state.message = "Street dash. Same route, sharper silhouette.";
      }
    } else {
      state.stompMs = 420;
      state.velocityY = Math.max(STOMP_VELOCITY, state.velocityY);
      state.jumpHoldMs = 0;
      state.lastAction = "stomp";
      state.message = "Aerial stomp. The road answers in brass.";
    }
  }

  if (toolPressed) {
    if (state.toolRecoveryMs > 0) state.pendingTool = true;
    else launchRunnerTool(state);
  } else if (state.pendingTool && state.toolRecoveryMs === 0) {
    state.pendingTool = false;
    launchRunnerTool(state);
  }
  state.elapsedMs = Math.min(RUNNER_ACT_SECONDS * 1_000, state.elapsedMs + stepMs);
  state.worldX = WORLD_LENGTH * (state.elapsedMs / (RUNNER_ACT_SECONDS * 1_000));
  const heldGravity = input.jumpHeld && state.jumpHoldMs > 0 && state.velocityY < 0 ? GRAVITY * 0.34 : GRAVITY;
  state.jumpHoldMs = Math.max(0, state.jumpHoldMs - stepMs);
  state.velocityY += heldGravity * dt;
  state.y += state.velocityY * dt;
  const restingY = FLOOR_Y - PLAYER_HEIGHT;
  if (state.y >= restingY && state.velocityY >= 0) {
    state.y = restingY;
    state.velocityY = 0;
    state.grounded = true;
    state.airStepsRemaining = 1;
    state.stompMs = 0;
    if (!wasGrounded) {
      state.landingMs = 280;
      if (state.jumpBufferMs > 0) beginJump(JUMP_VELOCITY, "leap", "Buffered leap. The landing becomes another launch.");
    }
  }
  state.projectiles = state.projectiles
    .map((projectile) => advanceProjectile(projectile, stepMs, dt))
    .filter((projectile) => projectile.ageMs < projectile.ttlMs && projectile.x < state.worldX + RUNNER_WIDTH + 180);

  const act = RUNNER_ACTS[state.actIndex];
  const playerWorld = { x: state.worldX + RUNNER_PLAYER_SCREEN_X - 12, y: state.y - 14, width: PLAYER_WIDTH + 32, height: PLAYER_HEIGHT + 28 };
  for (const power of act.pickups) {
    if (state.collectedPickupIds.includes(power.id)) continue;
    const gate = { x: power.x - 54, y: power.y - 62, width: 156, height: 170 };
    if (overlaps(playerWorld, gate)) {
      state.collectedPickupIds.push(power.id);
      state.lastCollectedPickupId = power.id;
      state.activePower = power.kind;
      state.pickupFlourishMs = 900;
      state.lastAction = "power";
      state.message = power.acquiredLine;
    }
  }
  for (const candidate of act.targets) {
    if (!state.transformedTargetIds.includes(candidate.id)) {
      const hit = state.projectiles.find((projectile) => overlaps(
        projectileBounds(projectile),
        candidate,
      ) && runnerToolTargets(projectile.tool, candidate.kind));
      if (hit) {
        state.transformedTargetIds.push(candidate.id);
        if (!hit.pierce) state.projectiles = state.projectiles.filter((projectile) => projectile !== hit);
        state.message = candidate.sparkQuip;
        state.flourishMs = 720;
        state.lastTransformedTargetId = candidate.id;
        state.lastAction = "tool";
      }
    }
    if (!state.encounteredTargetIds.includes(candidate.id) && !state.transformedTargetIds.includes(candidate.id)) {
      if (overlaps(playerWorld, candidate)) {
        state.encounteredTargetIds.push(candidate.id);
        if (state.activePower === "phulkari-guard") {
          state.transformedTargetIds.push(candidate.id);
          state.activePower = null;
          state.flourishMs = 720;
          state.lastTransformedTargetId = candidate.id;
          state.message = `Phulkari Guard: ${candidate.transformedLabel}.`;
        } else {
          state.message = candidate.collisionQuip;
          state.stumbleMs = 420;
        }
        state.impactMs = 320;
        state.lastEncounteredTargetId = candidate.id;
        state.lastAction = "collision";
      }
    }
  }
  if (state.elapsedMs >= RUNNER_ACT_SECONDS * 1_000) {
    state.finished = true;
    state.message = act.closing;
  }
  return state;
}

function runnerToolTargets(tool: RunnerToolKind, kind: RunnerTargetKind): boolean {
  return RUNNER_TOOL_TARGETS[tool].includes(kind);
}

function projectile(
  state: RunnerState,
  tool: RunnerToolKind,
  yOffset: number,
  velocityX: number,
  velocityY: number,
  radius: number,
  ttlMs: number,
  pierce: boolean,
): RunnerProjectile {
  return {
    x: state.worldX + RUNNER_PLAYER_SCREEN_X + 66,
    y: state.y + 28 + yOffset,
    velocityX,
    velocityY,
    ageMs: 0,
    ttlMs,
    radius,
    tool,
    pierce,
  };
}

function launchRunnerTool(state: RunnerState) {
  if (state.projectiles.length >= RUNNER_PROJECTILE_CAP) return;
  const act = RUNNER_ACTS[state.actIndex];
  const empowered = state.activePower === "chaa-overdrive";
  const additions: RunnerProjectile[] = [];
  if (act.tool === "phone-pulse") additions.push(projectile(state, act.tool, -24, 660, 0, empowered ? 34 : 20, 1_350, empowered));
  else if (act.tool === "bargain-burst") {
    const lanes = empowered ? [-26, 0, 26] : [-15, 15];
    lanes.forEach((lane) => additions.push(projectile(state, act.tool, lane, 520, lane * 0.45, empowered ? 42 : 30, 680, empowered)));
  } else if (act.tool === "dhaaga-arc") additions.push(projectile(state, act.tool, 0, 540, -95, empowered ? 40 : 28, 1_500, true));
  else if (act.tool === "umbrella-wave") {
    additions.push(projectile(state, act.tool, 12, 480, -165, empowered ? 50 : 38, 1_300, true));
    if (!state.grounded) state.velocityY = Math.min(state.velocityY, -260);
  } else {
    const lanes = empowered ? [-54, -27, 0, 27, 54] : [-38, 0, 38];
    lanes.forEach((lane) => additions.push(projectile(state, act.tool, lane, 610, lane * 0.7, empowered ? 32 : 22, 1_250, true)));
  }
  state.projectiles.push(...additions.slice(0, RUNNER_PROJECTILE_CAP - state.projectiles.length));
  state.toolRecoveryMs = TOOL_RECOVERY_MS;
  state.pendingTool = false;
  state.lastAction = "tool";
  state.message = empowered ? `${act.toolLabel} overdrive.` : `${act.toolLabel}.`;
  if (empowered) state.activePower = null;
}

function advanceProjectile(projectileState: RunnerProjectile, stepMs: number, dt: number): RunnerProjectile {
  const next = {
    ...projectileState,
    x: projectileState.x + projectileState.velocityX * dt,
    y: projectileState.y + projectileState.velocityY * dt,
    ageMs: projectileState.ageMs + stepMs,
  };
  if (next.tool === "dhaaga-arc") next.y += Math.sin((next.ageMs / next.ttlMs) * Math.PI * 2) * 4;
  if (next.tool === "umbrella-wave") next.velocityY += 280 * dt;
  return next;
}

function projectileBounds(projectileState: RunnerProjectile) {
  const growth = projectileState.tool === "bargain-burst" ? projectileState.ageMs * 0.035 : 0;
  const radius = projectileState.radius + growth;
  return { x: projectileState.x - radius, y: projectileState.y - radius, width: radius * 2, height: radius * 2 };
}

function pixelRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function hashText(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function drawDiamond(context: CanvasRenderingContext2D, x: number, y: number, size: number, color: string, filled = true) {
  context.save();
  context.translate(Math.round(x), Math.round(y));
  context.rotate(Math.PI / 4);
  if (filled) {
    context.fillStyle = color;
    context.fillRect(-size / 2, -size / 2, size, size);
  } else {
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.strokeRect(-size / 2, -size / 2, size, size);
  }
  context.restore();
}

function drawTarget(context: CanvasRenderingContext2D, candidate: RunnerTarget, screenX: number, transformed: boolean, palette: RunnerPalette) {
  const x = Math.round(screenX);
  const y = candidate.y;
  const ink = transformed ? palette.jade : palette.accent;
  context.save();
  context.translate(x, y);
  context.fillStyle = transformed ? palette.paper3 : palette.paper2;
  context.strokeStyle = ink;
  context.lineWidth = transformed ? 4 : 3;

  if (candidate.kind === "puddle-splash") {
    context.beginPath();
    context.ellipse(candidate.width / 2, candidate.height / 2, candidate.width / 2, candidate.height / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    if (transformed) {
      context.beginPath();
      context.ellipse(candidate.width / 2, candidate.height / 2, candidate.width / 4, candidate.height / 4, 0, 0, Math.PI * 2);
      context.stroke();
    }
  } else if (candidate.kind === "streamer") {
    for (let strip = 0; strip < 4; strip += 1) {
      const sway = transformed ? strip * 15 : (strip % 2) * 10;
      context.strokeStyle = strip % 2 ? palette.ruby : ink;
      context.lineWidth = 7;
      context.beginPath();
      context.moveTo(strip * 22 + 6, 0);
      context.bezierCurveTo(strip * 22 + 24, candidate.height * 0.3, strip * 22 - 8, candidate.height * 0.66, strip * 22 + 9 + sway, candidate.height);
      context.stroke();
    }
  } else if (candidate.kind === "produce-basket") {
    context.strokeStyle = ink;
    context.lineWidth = 4;
    context.beginPath();
    context.arc(candidate.width / 2, 26, candidate.width * 0.33, Math.PI, 0);
    context.stroke();
    pixelRect(context, 0, 20, candidate.width, candidate.height - 20, palette.accentSoft);
    for (let rail = 1; rail < 4; rail += 1) pixelRect(context, rail * candidate.width / 4 - 2, 24, 4, candidate.height - 28, palette.rule);
    for (let item = 0; item < 5; item += 1) {
      context.fillStyle = item % 2 ? palette.ruby : transformed ? palette.jade : palette.accent;
      context.beginPath();
      context.arc(14 + item * 19, transformed ? 20 : 11 + (item % 2) * 9, 9, 0, Math.PI * 2);
      context.fill();
    }
  } else if (candidate.kind === "price-tag") {
    context.beginPath();
    context.moveTo(0, 10);
    context.lineTo(candidate.width * 0.72, 0);
    context.lineTo(candidate.width, candidate.height / 2);
    context.lineTo(candidate.width * 0.72, candidate.height);
    context.lineTo(0, candidate.height - 10);
    context.closePath();
    context.fill();
    context.stroke();
    context.fillStyle = ink;
    context.beginPath();
    context.arc(candidate.width * 0.78, candidate.height / 2, 4, 0, Math.PI * 2);
    context.fill();
  } else if (candidate.kind === "grocery-list") {
    context.fillRect(0, 0, candidate.width, candidate.height);
    context.strokeRect(0, 0, candidate.width, candidate.height);
    pixelRect(context, candidate.width * 0.25, -6, candidate.width * 0.5, 12, ink);
    for (let line = 0; line < 3; line += 1) pixelRect(context, 13, 42 + line * 13, candidate.width - 26, 2, line === 2 && transformed ? palette.jade : palette.rule);
  } else {
    context.beginPath();
    context.roundRect(0, 0, candidate.width, candidate.height, 12);
    context.fill();
    context.stroke();
    context.beginPath();
    context.moveTo(18, candidate.height);
    context.lineTo(28, candidate.height);
    context.lineTo(20, candidate.height + 11);
    context.closePath();
    context.fill();
    context.stroke();
  }

  if (candidate.kind !== "streamer" && candidate.kind !== "puddle-splash") {
    context.fillStyle = transformed ? palette.ink : palette.inkSoft;
    context.font = `700 13px ${palette.fontMono}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    const label = transformed ? candidate.transformedLabel : candidate.label;
    const labelY = candidate.kind === "grocery-list" ? 24 : candidate.height / 2;
    context.fillText(label, candidate.width / 2, labelY, candidate.width - 12);
  }
  if (transformed) drawDiamond(context, candidate.width - 6, 5, 9, palette.jade);
  context.restore();
}

function drawLeadSprite(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  role: "son" | "mother",
  state: RunnerState,
  palette: RunnerPalette,
  scale = 1.22,
) {
  const runFrame = Math.floor(state.elapsedMs / 95) % 4;
  const stride = state.grounded ? [-7, 0, 7, 0][runFrame] : 3;
  const bounce = state.grounded && state.landingMs === 0 ? [0, -2, 0, -1][runFrame] : 0;
  const squash = state.landingMs > 0 ? 1 - state.landingMs / 1_600 : 1;
  const stretch = state.grounded ? 1 : 1.06;
  const cloth = role === "mother" ? palette.ruby : palette.sapphire;
  context.save();
  context.translate(Math.round(x + PLAYER_WIDTH / 2), Math.round(y + PLAYER_HEIGHT));
  context.scale(scale * squash, scale * stretch);
  context.translate(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT + bounce);

  pixelRect(context, 17, 0, 25, 20, palette.inkSoft);
  pixelRect(context, 13, 17, 33, 8, role === "mother" ? palette.accent : palette.ink);
  pixelRect(context, 10, 24, 38, 32, cloth);
  pixelRect(context, 14, 30, 30, 5, role === "mother" ? palette.accent : palette.jade);
  pixelRect(context, 7, 29, 8, 27, role === "mother" ? palette.accent : cloth);
  pixelRect(context, 46, 29, 9, 25, palette.inkSoft);
  pixelRect(context, 12, 55, 11, 20 + Math.min(0, stride), palette.accent);
  pixelRect(context, 35, 55, 11, 20 - Math.max(0, stride), palette.accent);
  pixelRect(context, 8 + Math.max(0, stride), 71, 18, 5, palette.ink);
  pixelRect(context, 32 + Math.min(0, stride), 71, 18, 5, palette.ink);

  if (role === "mother") {
    pixelRect(context, 6, 5, 8, 45, palette.accent);
    pixelRect(context, 3, 42, 13, 8, palette.ruby);
    context.strokeStyle = palette.accent;
    context.lineWidth = 3;
    context.strokeRect(46, 43, 13, 19);
  } else {
    pixelRect(context, 22, 3, 21, 5, palette.ink);
    pixelRect(context, 14, 39, 7, 17, palette.jade);
  }
  context.restore();
}

function drawPerson(context: CanvasRenderingContext2D, state: RunnerState, lead: RunnerLead, palette: RunnerPalette) {
  const x = RUNNER_PLAYER_SCREEN_X;
  if (lead === "duo") drawLeadSprite(context, x - 48, state.y + 9, "mother", state, palette, 1.02);
  drawLeadSprite(context, x, state.y, lead === "mother" ? "mother" : "son", state, palette);
}

function drawSky(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  const gradient = context.createLinearGradient(0, 0, 0, FLOOR_Y);
  gradient.addColorStop(0, state.actIndex === 1 ? palette.paper3 : palette.paper);
  gradient.addColorStop(1, state.actIndex === 3 ? palette.sapphire : palette.paper2);
  context.fillStyle = gradient;
  context.fillRect(0, 0, RUNNER_WIDTH, FLOOR_Y);

  if ([0, 2, 4].includes(state.actIndex)) {
    context.globalAlpha = 0.68;
    for (let star = 0; star < 24; star += 1) {
      const seed = hashText(`${state.actIndex}-star-${star}`);
      const drift = reducedMotion ? 0 : (state.worldX * (0.018 + (star % 3) * 0.006)) % RUNNER_WIDTH;
      const starX = (seed % RUNNER_WIDTH - drift + RUNNER_WIDTH) % RUNNER_WIDTH;
      const starY = 28 + ((seed >>> 9) % 116);
      drawDiamond(context, starX, starY, star % 5 === 0 ? 4 : 2, star % 4 === 0 ? palette.accent : palette.inkSoft);
    }
    context.globalAlpha = 1;
  }

  if (state.actIndex === 0 || state.actIndex === 4) {
    context.globalAlpha = 0.76;
    context.fillStyle = palette.accentSoft;
    context.beginPath();
    context.arc(820, 72, state.actIndex === 4 ? 38 : 28, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
  }

  const hillDrift = reducedMotion ? 0 : (state.worldX * 0.12) % 180;
  context.fillStyle = palette.sapphire;
  context.globalAlpha = state.actIndex === 1 ? 0.32 : 0.58;
  context.beginPath();
  context.moveTo(0, 190);
  for (let x = -180; x <= RUNNER_WIDTH + 180; x += 180) {
    const peak = x - hillDrift;
    context.lineTo(peak + 90, 74 + ((x / 180 + state.actIndex) % 3) * 24);
    context.lineTo(peak + 180, 190);
  }
  context.lineTo(RUNNER_WIDTH, 250);
  context.lineTo(0, 250);
  context.closePath();
  context.fill();
  context.globalAlpha = 1;
}

function drawCityLayers(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  const layers = [
    { speed: 0.2, spacing: 142, y: 176, color: palette.paper3, alpha: 0.62 },
    { speed: 0.38, spacing: 188, y: 205, color: palette.paper2, alpha: 0.9 },
  ];
  layers.forEach((layer, layerIndex) => {
    const offset = reducedMotion ? 0 : (state.worldX * layer.speed) % layer.spacing;
    context.globalAlpha = layer.alpha;
    for (let index = -1; index < Math.ceil(RUNNER_WIDTH / layer.spacing) + 2; index += 1) {
      const x = index * layer.spacing - offset;
      const seed = hashText(`${state.actIndex}-${layerIndex}-${index}`);
      const height = 74 + (seed % 68);
      pixelRect(context, x, layer.y - height, layer.spacing - 24, height + FLOOR_Y - layer.y, layer.color);
      for (let windowIndex = 0; windowIndex < 4; windowIndex += 1) {
        const lit = (windowIndex + index + state.actIndex) % 3 === 0;
        pixelRect(context, x + 16 + windowIndex * 25, layer.y - height + 25, 9, Math.max(24, height - 42), lit ? palette.accentSoft : palette.rule);
      }
    }
    context.globalAlpha = 1;
  });
}

function drawActSetting(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  const drift = reducedMotion ? 0 : (state.worldX * 0.56) % 248;
  if (state.actIndex === 0) {
    for (let x = -160; x < RUNNER_WIDTH + 160; x += 210) {
      const lampX = x - ((reducedMotion ? 0 : state.worldX * 0.62) % 210);
      pixelRect(context, lampX, 180, 6, 170, palette.rule);
      pixelRect(context, lampX - 12, 180, 30, 7, palette.accent);
      context.globalAlpha = 0.45;
      pixelRect(context, lampX - 20, 190, 46, 7, palette.accentSoft);
      context.globalAlpha = 1;
    }
  } else if (state.actIndex === 1) {
    for (let x = -248; x < RUNNER_WIDTH + 248; x += 248) {
      const stallX = x - drift;
      pixelRect(context, stallX, 236, 190, 14, palette.ruby);
      for (let awning = 0; awning < 6; awning += 1) pixelRect(context, stallX + awning * 32, 250, 22, 12, awning % 2 ? palette.accent : palette.inkSoft);
      pixelRect(context, stallX + 12, 262, 166, 54, palette.paper3);
      for (let basket = 0; basket < 5; basket += 1) pixelRect(context, stallX + 18 + basket * 31, 286, 24, 22, basket % 2 ? palette.jade : palette.ruby);
    }
  } else if (state.actIndex === 2) {
    context.globalAlpha = 0.86;
    for (let x = -80; x < RUNNER_WIDTH + 80; x += 100) {
      const ribbonX = x - ((reducedMotion ? 0 : state.worldX * 0.44) % 100);
      context.strokeStyle = x % 200 === 0 ? palette.ruby : palette.accent;
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(ribbonX, 138);
      context.quadraticCurveTo(ribbonX + 26, 190, ribbonX + 54, 148);
      context.stroke();
      drawDiamond(context, ribbonX + 26, 174, 7, palette.inkSoft);
    }
    context.globalAlpha = 1;
    pixelRect(context, 760, 250, 92, 45, palette.ruby);
    context.strokeStyle = palette.accent;
    context.lineWidth = 5;
    context.beginPath();
    context.arc(806, 272, 30, 0, Math.PI * 2);
    context.stroke();
  } else if (state.actIndex === 3) {
    context.globalAlpha = 0.7;
    context.fillStyle = palette.paper3;
    for (let cloud = 0; cloud < 5; cloud += 1) {
      const cloudX = 70 + cloud * 210 - ((reducedMotion ? 0 : state.worldX * 0.08) % 210);
      context.beginPath();
      context.arc(cloudX, 82 + (cloud % 2) * 26, 44, 0, Math.PI * 2);
      context.arc(cloudX + 44, 88 + (cloud % 2) * 26, 54, 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = palette.inkSoft;
    context.lineWidth = 2;
    for (let rain = 0; rain < 44; rain += 1) {
      const rainX = (rain * 37 - (reducedMotion ? 0 : (state.worldX * 1.25) % 37) + RUNNER_WIDTH) % RUNNER_WIDTH;
      const rainY = 108 + (rain % 8) * 29;
      context.beginPath();
      context.moveTo(rainX, rainY);
      context.lineTo(rainX - 12, rainY + 22);
      context.stroke();
    }
    context.globalAlpha = 1;
  } else {
    pixelRect(context, 708, 198, 220, 152, palette.paper3);
    pixelRect(context, 742, 238, 38, 48, palette.accentSoft);
    pixelRect(context, 850, 238, 38, 48, palette.accentSoft);
    pixelRect(context, 796, 296, 42, 54, palette.accent);
    context.strokeStyle = palette.accent;
    context.lineWidth = 6;
    context.beginPath();
    context.moveTo(684, 198);
    context.lineTo(818, 126);
    context.lineTo(948, 198);
    context.stroke();
    for (let lamp = 0; lamp < 5; lamp += 1) drawDiamond(context, 724 + lamp * 42, 184, 8, palette.accent);
  }
}

function drawForeground(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  pixelRect(context, 0, FLOOR_Y, RUNNER_WIDTH, RUNNER_HEIGHT - FLOOR_Y, palette.paper2);
  pixelRect(context, 0, FLOOR_Y, RUNNER_WIDTH, 5, palette.accent);
  for (let road = -80; road < RUNNER_WIDTH + 80; road += 150) {
    const roadOffset = reducedMotion ? 0 : (state.worldX * 0.92) % 150;
    pixelRect(context, road - roadOffset, FLOOR_Y + 45, 72, 5, palette.rule);
  }
  context.globalAlpha = 0.34;
  const nearOffset = reducedMotion ? 0 : (state.worldX * 1.04) % 260;
  for (let x = -260; x < RUNNER_WIDTH + 260; x += 260) {
    pixelRect(context, x - nearOffset, FLOOR_Y + 10, 5, 52, palette.ink);
    pixelRect(context, x - nearOffset - 20, FLOOR_Y + 9, 45, 4, palette.rule);
  }
  context.globalAlpha = 1;
}

function drawFlourish(context: CanvasRenderingContext2D, state: RunnerState, act: RunnerAct, palette: RunnerPalette) {
  if (state.flourishMs <= 0 || !state.lastTransformedTargetId) return;
  const candidate = act.targets.find((target) => target.id === state.lastTransformedTargetId);
  if (!candidate) return;
  const centerX = runnerWorldToScreen(candidate.x, state.worldX) + candidate.width / 2;
  const centerY = candidate.y + candidate.height / 2;
  const progress = (720 - state.flourishMs) / 720;
  const reach = 34 + progress * 72;
  context.save();
  context.translate(centerX, centerY);
  context.globalAlpha = 1 - progress * 0.6;
  context.rotate(Math.PI / 4 + progress * 0.45);
  context.strokeStyle = palette.accent;
  context.lineWidth = 3;
  context.strokeRect(-reach / 2, -reach / 2, reach, reach);
  context.strokeStyle = palette.jade;
  context.strokeRect(-reach / 3, -reach / 3, reach * 0.66, reach * 0.66);
  context.restore();

  const particleCount = Math.min(RUNNER_EFFECT_PARTICLE_CAP, 18);
  for (let index = 0; index < particleCount; index += 1) {
    const seed = hashText(`${candidate.id}-${index}`);
    const angle = ((seed % 628) / 100) + progress * 0.4;
    const distance = 18 + progress * (24 + (seed % 52));
    context.globalAlpha = Math.max(0, 1 - progress);
    drawDiamond(
      context,
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance,
      index % 4 === 0 ? 7 : 4,
      index % 3 === 0 ? palette.jade : palette.accent,
    );
  }
  context.globalAlpha = 1;
}

function drawImpact(context: CanvasRenderingContext2D, state: RunnerState, act: RunnerAct, palette: RunnerPalette) {
  if (state.impactMs <= 0 || !state.lastEncounteredTargetId) return;
  const candidate = act.targets.find((target) => target.id === state.lastEncounteredTargetId);
  if (!candidate) return;
  const progress = (260 - state.impactMs) / 260;
  const centerX = runnerWorldToScreen(candidate.x, state.worldX) + candidate.width / 2;
  const centerY = candidate.y + candidate.height / 2;
  context.globalAlpha = 1 - progress;
  for (let index = 0; index < 8; index += 1) {
    const angle = index * Math.PI / 4;
    const distance = 14 + progress * 38;
    pixelRect(context, centerX + Math.cos(angle) * distance, centerY + Math.sin(angle) * distance, 6, 6, index % 2 ? palette.ruby : palette.accent);
  }
  context.globalAlpha = 1;
}

function drawLandingDust(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette) {
  if (state.landingMs <= 0) return;
  const progress = (240 - state.landingMs) / 240;
  context.globalAlpha = 1 - progress;
  for (let index = 0; index < 8; index += 1) {
    const direction = index < 4 ? -1 : 1;
    const local = index % 4;
    pixelRect(
      context,
      RUNNER_PLAYER_SCREEN_X + PLAYER_WIDTH / 2 + direction * (18 + local * 9 + progress * 26),
      FLOOR_Y - 5 - local * 3 - progress * 9,
      8 - local,
      4,
      local % 2 ? palette.rule : palette.accentSoft,
    );
  }
  context.globalAlpha = 1;
}

function drawSpark(context: CanvasRenderingContext2D, projectile: RunnerProjectile, state: RunnerState, palette: RunnerPalette) {
  const screenX = runnerWorldToScreen(projectile.x, state.worldX);
  const pulse = Math.floor(projectile.ageMs / 70) % 2;
  context.globalAlpha = 0.36;
  for (let trail = 3; trail > 0; trail -= 1) drawDiamond(context, screenX - trail * 10, projectile.y + 5, 4, palette.accentSoft);
  context.globalAlpha = 1;
  drawDiamond(context, screenX, projectile.y + 5, pulse ? 13 : 11, palette.accent);
  drawDiamond(context, screenX, projectile.y + 5, 5, palette.ink);
}

export function drawRunnerFrame(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion = false) {
  const act = RUNNER_ACTS[state.actIndex];
  context.save();
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  const cameraKick = !reducedMotion && state.impactMs > 0 ? Math.round(Math.sin(state.impactMs * 0.09) * 2) : 0;
  context.translate(cameraKick, 0);
  drawSky(context, state, palette, reducedMotion);
  drawCityLayers(context, state, palette, reducedMotion);
  drawActSetting(context, state, palette, reducedMotion);
  drawForeground(context, state, palette, reducedMotion);

  pixelRect(context, 28, 24, 158, 58, palette.paper2);
  context.strokeStyle = palette.accent;
  context.lineWidth = 3;
  context.strokeRect(28, 24, 158, 58);
  drawDiamond(context, 48, 53, 8, palette.accent);
  context.fillStyle = palette.ink;
  context.font = `700 15px ${palette.fontMono}`;
  context.textAlign = "start";
  context.fillText(act.sign, 68, 58);

  for (const candidate of act.targets) {
    const screenX = runnerWorldToScreen(candidate.x, state.worldX);
    if (screenX > -candidate.width - 20 && screenX < RUNNER_WIDTH + 20) {
      drawTarget(context, candidate, screenX, state.transformedTargetIds.includes(candidate.id), palette);
    }
  }
  for (const projectile of state.projectiles) {
    drawSpark(context, projectile, state, palette);
  }
  if (!reducedMotion) {
    drawFlourish(context, state, act, palette);
    drawImpact(context, state, act, palette);
    drawLandingDust(context, state, palette);
  }
  drawPerson(context, state, act.lead, palette);

  if (state.paused) {
    context.globalAlpha = 0.66;
    context.fillStyle = palette.paper2;
    context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
    context.globalAlpha = 1;
    pixelRect(context, 440, 170, 18, 88, palette.accent);
    pixelRect(context, 476, 170, 18, 88, palette.accent);
  }
  context.restore();
}
