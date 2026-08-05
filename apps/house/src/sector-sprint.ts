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
      "Gurpreet cuts through Sector 22 beneath long amber lamps, using a street dash and a high air step to keep the grocery bag clear.",
      "A Phone Pulse turns the missed-call wall into one calm ‘On my way’ note; Phulkari Guard folds a puddle splash into the road pattern.",
      "At the gate, Harjit checks the grocery bag first and the explanation second. The last home flare lands, and affection wins on a technicality.",
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
      "Harjit enters the mandi with a cloth bag, a written list, and a low vault through the opening aisle.",
      "Her Bargain Burst settles a whole cone of theatrical price tags; Chaa Overdrive returns runaway tomatoes to formation.",
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
      "The road fills with layered streamers and a cheerful ‘just two minutes’ bubble of uncertain legal meaning.",
      "Harjit finds the side lane while Gurpreet sends a piercing Dhaaga Arc through only the loose ribbons; Monsoon Lift holds their air step above the tangle.",
      "They pass without touching the celebration or interrupting one dance step. This counts as excellent city diplomacy.",
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
      "Rain cuts across Madhya Marg in lit sheets while a puddle spreads as if it received planning permission.",
      "An Umbrella Wave rises through water, paper, and one uncertain route bubble, turning each into a brass-edged clear line.",
      "Harjit and Gurpreet stomp into the dry-side glow together. Neither mentions who forgot to check the forecast.",
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
      "The home lane gathers every loose reminder into three clear lines: grocery list, rain splash, festive ribbon, missed-call bubble.",
      "Mother and son divide the work without debate, then send the synchronized Ghar Flare around each other and only through the loose abstractions.",
      "They cross the final pool of lamplight together. Dinner resumes, and the great household emergency becomes tomorrow’s best story.",
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

const ACT_GRADES = [
  { sky: "#06111f", horizon: "#14345a", glow: "#f4b32b", energy: "#55d6e8" },
  { sky: "#101628", horizon: "#4a2634", glow: "#ffc857", energy: "#87d37c" },
  { sky: "#140d24", horizon: "#4a1748", glow: "#ffcc62", energy: "#e7495e" },
  { sky: "#071421", horizon: "#174f67", glow: "#7ce8f2", energy: "#55d6e8" },
  { sky: "#060d19", horizon: "#52283b", glow: "#ffbd52", energy: "#f7e8c6" },
] as const;

function drawTarget(context: CanvasRenderingContext2D, candidate: RunnerTarget, screenX: number, transformed: boolean, palette: RunnerPalette) {
  const x = Math.round(screenX);
  const y = candidate.y;
  const grade = ACT_GRADES[Math.max(0, Math.min(4, RUNNER_ACTS.findIndex((act) => act.targets.includes(candidate))))];
  const ink = transformed ? palette.jade : grade.energy;
  context.save();
  context.translate(x, y);
  context.shadowColor = transformed ? palette.jade : grade.glow;
  context.shadowBlur = transformed ? 20 : 12;
  const surface = context.createLinearGradient(0, 0, candidate.width, candidate.height);
  surface.addColorStop(0, transformed ? "#173e39" : "#101f36");
  surface.addColorStop(1, transformed ? "#0b2525" : "#07111f");
  context.fillStyle = surface;
  context.strokeStyle = ink;
  context.lineWidth = transformed ? 3 : 2;

  if (candidate.kind === "puddle-splash") {
    context.beginPath();
    context.ellipse(candidate.width / 2, candidate.height / 2, candidate.width / 2, candidate.height / 2, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.globalAlpha = 0.28;
    context.fillStyle = transformed ? palette.jade : grade.energy;
    context.beginPath();
    context.ellipse(candidate.width * 0.62, candidate.height * 0.38, candidate.width * 0.28, candidate.height * 0.24, 0, 0, Math.PI * 2);
    context.fill();
    context.globalAlpha = 1;
    if (transformed) {
      context.beginPath();
      context.ellipse(candidate.width / 2, candidate.height / 2, candidate.width / 4, candidate.height / 4, 0, 0, Math.PI * 2);
      context.stroke();
    }
  } else if (candidate.kind === "streamer") {
    for (let strip = 0; strip < 4; strip += 1) {
      const sway = transformed ? strip * 15 : (strip % 2) * 10;
      context.strokeStyle = strip % 2 ? palette.ruby : ink;
      context.lineWidth = 5;
      context.lineCap = "round";
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
    context.fillStyle = transformed ? "#173e39" : "#5d3527";
    context.beginPath();
    context.roundRect(0, 20, candidate.width, candidate.height - 20, 5);
    context.fill();
    for (let rail = 1; rail < 4; rail += 1) pixelRect(context, rail * candidate.width / 4 - 2, 24, 4, candidate.height - 28, palette.rule);
    for (let item = 0; item < 5; item += 1) {
      context.fillStyle = item % 2 ? "#e7495e" : transformed ? "#78d7a7" : "#f4b32b";
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
    context.beginPath();
    context.roundRect(0, 0, candidate.width, candidate.height, 6);
    context.fill();
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

  context.shadowBlur = 0;
  context.globalAlpha = 0.5;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(8, 8);
  context.lineTo(Math.max(8, candidate.width - 15), 8);
  context.stroke();
  context.globalAlpha = 1;

  if (candidate.kind !== "streamer" && candidate.kind !== "puddle-splash") {
    context.fillStyle = transformed ? "#f7e8c6" : palette.ink;
    context.font = `700 12px ${palette.fontMono}`;
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
  const stride = state.grounded ? [-9, 1, 9, -1][runFrame] : state.stompMs > 0 ? 1 : 5;
  const bounce = state.grounded && state.landingMs === 0 ? [0, -2.5, 0, -1.5][runFrame] : 0;
  const squash = state.landingMs > 0 ? 0.9 : 1;
  const stretch = state.grounded ? 1 : 1.07;
  const cloth = role === "mother" ? "#9d304f" : "#244e8e";
  const skin = "#d3a06f";
  const recoil = state.stumbleMs > 0 ? Math.sin(state.stumbleMs * 0.08) * 4 : 0;
  const lean = state.dashMs > 0 ? 0.12 : state.stompMs > 0 ? -0.06 : 0;
  context.save();
  context.translate(Math.round(x + PLAYER_WIDTH / 2 + recoil), Math.round(y + PLAYER_HEIGHT));
  context.rotate(lean);
  context.scale(scale * squash, scale * stretch);
  context.translate(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT + bounce);

  context.globalAlpha = 0.32;
  context.fillStyle = "#000000";
  context.beginPath();
  context.ellipse(29, 78, state.dashMs > 0 ? 34 : 24, 5, 0, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 1;

  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = palette.ink;
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(22, 53);
  context.lineTo(18 + stride, 72);
  context.lineTo(8 + Math.max(0, stride), 75);
  context.moveTo(36, 53);
  context.lineTo(40 - stride, 72);
  context.lineTo(51 + Math.min(0, stride), 75);
  context.stroke();

  const coat = context.createLinearGradient(7, 21, 48, 58);
  coat.addColorStop(0, role === "mother" ? "#cf4962" : "#3774c5");
  coat.addColorStop(1, cloth);
  context.fillStyle = coat;
  context.beginPath();
  context.moveTo(17, 21);
  context.quadraticCurveTo(29, 15, 42, 22);
  context.lineTo(47, 57);
  context.quadraticCurveTo(29, 64, 8, 56);
  context.closePath();
  context.fill();
  context.strokeStyle = role === "mother" ? "#f4b32b" : "#55d6e8";
  context.lineWidth = 2.5;
  context.stroke();

  context.strokeStyle = skin;
  context.lineWidth = 7;
  context.beginPath();
  context.moveTo(14, 29);
  context.lineTo(4 - stride * 0.45, 48);
  context.moveTo(41, 29);
  context.lineTo(54 + stride * 0.45, 44);
  context.stroke();

  context.fillStyle = skin;
  context.beginPath();
  context.arc(29, 12, 11, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#111827";
  context.beginPath();
  context.arc(28, 9, 11, Math.PI, Math.PI * 2);
  context.fill();
  if (role === "mother") {
    context.strokeStyle = "#f4b32b";
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(18, 15);
    context.quadraticCurveTo(6, 31, 9, 52);
    context.stroke();
    context.fillStyle = "#f4b32b";
    context.beginPath();
    context.roundRect(49, 43, 13, 18, 3);
    context.fill();
  } else {
    context.fillStyle = "#55d6e8";
    context.beginPath();
    context.roundRect(8, 38, 8, 18, 3);
    context.fill();
  }
  context.restore();
}

function drawPerson(context: CanvasRenderingContext2D, state: RunnerState, lead: RunnerLead, palette: RunnerPalette) {
  const x = RUNNER_PLAYER_SCREEN_X;
  if (lead === "duo") drawLeadSprite(context, x - 46, state.y + 8, "mother", state, palette, 1.08);
  drawLeadSprite(context, x, state.y, lead === "mother" ? "mother" : "son", state, palette, 1.28);
}

function drawSky(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  const grade = ACT_GRADES[state.actIndex];
  const gradient = context.createLinearGradient(0, 0, 0, FLOOR_Y);
  gradient.addColorStop(0, grade.sky);
  gradient.addColorStop(0.64, grade.horizon);
  gradient.addColorStop(1, "#09121f");
  context.fillStyle = gradient;
  context.fillRect(0, 0, RUNNER_WIDTH, FLOOR_Y);

  const horizonGlow = context.createRadialGradient(690, 215, 0, 690, 215, 360);
  horizonGlow.addColorStop(0, `${grade.glow}52`);
  horizonGlow.addColorStop(0.45, `${grade.energy}18`);
  horizonGlow.addColorStop(1, "#00000000");
  context.fillStyle = horizonGlow;
  context.fillRect(250, 0, 710, FLOOR_Y);

  if ([0, 2, 4].includes(state.actIndex)) {
    context.globalAlpha = 0.68;
    for (let star = 0; star < 24; star += 1) {
      const seed = hashText(`${state.actIndex}-star-${star}`);
      const drift = reducedMotion ? 0 : (state.worldX * (0.018 + (star % 3) * 0.006)) % RUNNER_WIDTH;
      const starX = (seed % RUNNER_WIDTH - drift + RUNNER_WIDTH) % RUNNER_WIDTH;
      const starY = 28 + ((seed >>> 9) % 116);
      drawDiamond(context, starX, starY, star % 5 === 0 ? 3.5 : 1.6, star % 4 === 0 ? grade.glow : palette.inkSoft);
    }
    context.globalAlpha = 1;
  }

  if (state.actIndex === 0 || state.actIndex === 4) {
    context.globalAlpha = 0.76;
    context.fillStyle = grade.glow;
    context.shadowColor = grade.glow;
    context.shadowBlur = 36;
    context.beginPath();
    context.arc(820, 72, state.actIndex === 4 ? 38 : 28, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
    context.globalAlpha = 1;
  }

  const hillDrift = reducedMotion ? 0 : (state.worldX * 0.12) % 180;
  context.fillStyle = "#081426";
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
  const grade = ACT_GRADES[state.actIndex];
  const layers = [
    { speed: 0.08, spacing: 118, y: 172, color: "#10243d", alpha: 0.42 },
    { speed: 0.19, spacing: 152, y: 204, color: "#0b1c31", alpha: 0.72 },
    { speed: 0.36, spacing: 196, y: 236, color: "#071523", alpha: 0.94 },
  ];
  layers.forEach((layer, layerIndex) => {
    const offset = reducedMotion ? 0 : (state.worldX * layer.speed) % layer.spacing;
    context.globalAlpha = layer.alpha;
    for (let index = -1; index < Math.ceil(RUNNER_WIDTH / layer.spacing) + 2; index += 1) {
      const x = index * layer.spacing - offset;
      const seed = hashText(`${state.actIndex}-${layerIndex}-${index}`);
      const height = 70 + (seed % (62 + layerIndex * 18));
      const buildingWidth = layer.spacing - 20 - (seed % 22);
      context.fillStyle = layer.color;
      context.beginPath();
      context.roundRect(x, layer.y - height, buildingWidth, height + FLOOR_Y - layer.y, layerIndex === 2 ? 3 : 1);
      context.fill();
      context.fillStyle = `${grade.glow}${layerIndex === 2 ? "33" : "20"}`;
      context.fillRect(x + 8, layer.y - height + 7, buildingWidth - 16, 2);
      for (let windowIndex = 0; windowIndex < 5; windowIndex += 1) {
        const lit = (windowIndex + index + state.actIndex) % 3 === 0;
        const windowX = x + 15 + windowIndex * Math.max(18, buildingWidth / 6);
        pixelRect(context, windowX, layer.y - height + 24, 7, Math.max(18, height - 48), lit ? `${grade.glow}70` : "#17283a");
      }
    }
    context.globalAlpha = 1;
  });

  context.save();
  context.globalAlpha = state.actIndex === 3 ? 0.08 : 0.13;
  context.fillStyle = grade.glow;
  for (let beam = 0; beam < 4; beam += 1) {
    const beamX = 80 + beam * 270 - (reducedMotion ? 0 : (state.worldX * 0.17) % 270);
    context.beginPath();
    context.moveTo(beamX, 140);
    context.lineTo(beamX + 96, FLOOR_Y);
    context.lineTo(beamX - 28, FLOOR_Y);
    context.closePath();
    context.fill();
  }
  context.restore();
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
  const grade = ACT_GRADES[state.actIndex];
  const road = context.createLinearGradient(0, FLOOR_Y, 0, RUNNER_HEIGHT);
  road.addColorStop(0, "#17283a");
  road.addColorStop(1, "#03070d");
  context.fillStyle = road;
  context.fillRect(0, FLOOR_Y, RUNNER_WIDTH, RUNNER_HEIGHT - FLOOR_Y);
  context.fillStyle = grade.glow;
  context.shadowColor = grade.glow;
  context.shadowBlur = 18;
  context.fillRect(0, FLOOR_Y, RUNNER_WIDTH, 3);
  context.shadowBlur = 0;
  for (let mark = -80; mark < RUNNER_WIDTH + 80; mark += 150) {
    const roadOffset = reducedMotion ? 0 : (state.worldX * 0.92) % 150;
    const x = mark - roadOffset;
    context.fillStyle = "#7d6b50";
    context.beginPath();
    context.moveTo(x, FLOOR_Y + 43);
    context.lineTo(x + 72, FLOOR_Y + 43);
    context.lineTo(x + 80, FLOOR_Y + 50);
    context.lineTo(x - 5, FLOOR_Y + 50);
    context.closePath();
    context.fill();
  }
  context.globalAlpha = 0.42;
  const nearOffset = reducedMotion ? 0 : (state.worldX * 1.04) % 260;
  for (let x = -260; x < RUNNER_WIDTH + 260; x += 260) {
    const postX = x - nearOffset;
    pixelRect(context, postX, FLOOR_Y + 8, 4, 58, "#26384a");
    pixelRect(context, postX - 24, FLOOR_Y + 8, 52, 3, grade.energy);
  }
  context.globalAlpha = 1;

  const reflection = context.createLinearGradient(0, FLOOR_Y, 0, RUNNER_HEIGHT);
  reflection.addColorStop(0, `${grade.energy}20`);
  reflection.addColorStop(1, "#00000000");
  context.fillStyle = reflection;
  context.fillRect(0, FLOOR_Y, RUNNER_WIDTH, RUNNER_HEIGHT - FLOOR_Y);
}

function drawPickup(context: CanvasRenderingContext2D, power: RunnerPickup, screenX: number, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  const grade = ACT_GRADES[state.actIndex];
  const pulse = reducedMotion ? 0 : Math.sin(state.elapsedMs * 0.006) * 5;
  const label = power.kind === "phulkari-guard" ? "GUARD" : power.kind === "chaa-overdrive" ? "OVERDRIVE" : "LIFT";
  context.save();
  context.translate(screenX, power.y);
  context.shadowColor = power.kind === "phulkari-guard" ? "#e7495e" : power.kind === "chaa-overdrive" ? grade.glow : grade.energy;
  context.shadowBlur = 24;
  context.strokeStyle = context.shadowColor;
  context.lineWidth = 2;
  context.globalAlpha = 0.78;
  context.beginPath();
  context.arc(0, 0, 24 + pulse, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;
  context.rotate(Math.PI / 4 + (reducedMotion ? 0 : state.elapsedMs * 0.00045));
  context.fillStyle = "#091728";
  context.fillRect(-16, -16, 32, 32);
  context.strokeRect(-16, -16, 32, 32);
  context.rotate(-Math.PI / 4 - (reducedMotion ? 0 : state.elapsedMs * 0.00045));
  context.shadowBlur = 0;
  context.fillStyle = palette.ink;
  context.font = `800 10px ${palette.fontMono}`;
  context.textAlign = "center";
  context.fillText(label, 0, 48);
  context.restore();
}

function drawPowerAura(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  if (!state.activePower) return;
  const color = state.activePower === "phulkari-guard" ? "#e7495e" : state.activePower === "chaa-overdrive" ? "#f4b32b" : "#55d6e8";
  const pulse = reducedMotion ? 0 : Math.sin(state.elapsedMs * 0.012) * 4;
  context.save();
  context.globalAlpha = 0.58;
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.beginPath();
  context.ellipse(RUNNER_PLAYER_SCREEN_X + 27, state.y + 40, 42 + pulse, 58 + pulse, 0, 0, Math.PI * 2);
  context.stroke();
  context.shadowBlur = 0;
  context.restore();
}

function drawMovementFx(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  if (reducedMotion) return;
  const grade = ACT_GRADES[state.actIndex];
  context.save();
  if (state.dashMs > 0) {
    const progress = 1 - state.dashMs / 420;
    for (let trail = 1; trail <= 4; trail += 1) {
      context.globalAlpha = (0.24 - trail * 0.035) * (1 - progress * 0.6);
      context.strokeStyle = trail % 2 ? grade.energy : grade.glow;
      context.lineWidth = 7 - trail;
      context.beginPath();
      context.moveTo(RUNNER_PLAYER_SCREEN_X - trail * 18, state.y + 35 + trail * 4);
      context.lineTo(RUNNER_PLAYER_SCREEN_X - 72 - trail * 28, state.y + 35 + trail * 4);
      context.stroke();
    }
  }
  if (state.airStepMs > 0) {
    const progress = 1 - state.airStepMs / 340;
    context.globalAlpha = 1 - progress;
    context.strokeStyle = grade.energy;
    context.lineWidth = 4;
    context.beginPath();
    context.ellipse(RUNNER_PLAYER_SCREEN_X + 25, state.y + 68, 18 + progress * 40, 7 + progress * 14, 0, 0, Math.PI * 2);
    context.stroke();
  }
  if (state.stompMs > 0 && !state.grounded) {
    context.globalAlpha = 0.48;
    context.fillStyle = grade.glow;
    context.beginPath();
    context.moveTo(RUNNER_PLAYER_SCREEN_X + 16, state.y - 54);
    context.lineTo(RUNNER_PLAYER_SCREEN_X + 40, state.y - 54);
    context.lineTo(RUNNER_PLAYER_SCREEN_X + 30, state.y + 60);
    context.closePath();
    context.fill();
  }
  context.restore();
}

function drawCinematicGrade(context: CanvasRenderingContext2D, state: RunnerState) {
  const grade = ACT_GRADES[state.actIndex];
  const vignette = context.createRadialGradient(RUNNER_WIDTH * 0.55, RUNNER_HEIGHT * 0.48, 90, RUNNER_WIDTH * 0.55, RUNNER_HEIGHT * 0.48, 620);
  vignette.addColorStop(0, "#00000000");
  vignette.addColorStop(0.68, `${grade.energy}08`);
  vignette.addColorStop(1, "#000000a8");
  context.fillStyle = vignette;
  context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  const bars = 7;
  context.fillStyle = "#02050a";
  context.fillRect(0, 0, RUNNER_WIDTH, bars);
  context.fillRect(0, RUNNER_HEIGHT - bars, RUNNER_WIDTH, bars);
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
  const grade = ACT_GRADES[state.actIndex];
  const pulse = Math.floor(projectile.ageMs / 60) % 2;
  const color = projectile.tool === "dhaaga-arc" ? "#e7495e" : projectile.tool === "umbrella-wave" ? "#55d6e8" : grade.glow;
  context.save();
  context.shadowColor = color;
  context.shadowBlur = 18;
  if (projectile.tool === "phone-pulse") {
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(screenX - 48, projectile.y);
    context.lineTo(screenX, projectile.y);
    context.stroke();
    drawDiamond(context, screenX, projectile.y, pulse ? 15 : 12, color);
    drawDiamond(context, screenX, projectile.y, 5, palette.ink);
  } else if (projectile.tool === "bargain-burst") {
    const spread = projectile.radius + projectile.ageMs * 0.035;
    context.globalAlpha = Math.max(0.15, 1 - projectile.ageMs / projectile.ttlMs);
    context.fillStyle = `${color}66`;
    context.beginPath();
    context.moveTo(screenX - spread, projectile.y - spread * 0.45);
    context.lineTo(screenX + spread, projectile.y);
    context.lineTo(screenX - spread, projectile.y + spread * 0.45);
    context.closePath();
    context.fill();
    context.strokeStyle = color;
    context.stroke();
  } else if (projectile.tool === "dhaaga-arc") {
    context.strokeStyle = color;
    context.lineWidth = projectile.pierce ? 7 : 5;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(screenX - 42, projectile.y + 18);
    context.bezierCurveTo(screenX - 16, projectile.y - 34, screenX + 22, projectile.y - 34, screenX + 44, projectile.y + 8);
    context.stroke();
    drawDiamond(context, screenX + 40, projectile.y + 8, 9, grade.glow, false);
  } else if (projectile.tool === "umbrella-wave") {
    context.strokeStyle = color;
    context.lineWidth = 7;
    context.beginPath();
    context.arc(screenX, projectile.y + 22, projectile.radius, Math.PI, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 0.22;
    context.fillStyle = color;
    context.beginPath();
    context.arc(screenX, projectile.y + 22, projectile.radius, Math.PI, Math.PI * 2);
    context.fill();
  } else {
    context.strokeStyle = color;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(screenX - 54, projectile.y);
    context.lineTo(screenX + 14, projectile.y);
    context.stroke();
    context.fillStyle = color;
    context.beginPath();
    context.arc(screenX + 16, projectile.y, projectile.radius * 0.42, 0, Math.PI * 2);
    context.fill();
  }
  context.shadowBlur = 0;
  context.restore();
}

export function drawRunnerFrame(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion = false) {
  const act = RUNNER_ACTS[state.actIndex];
  context.save();
  context.imageSmoothingEnabled = true;
  context.clearRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  const impactKick = state.impactMs > 0 ? Math.sin(state.impactMs * 0.09) * RUNNER_CAMERA_SHAKE_CAP : 0;
  const stompKick = state.landingMs > 0 && state.lastAction === "stomp" ? Math.sin(state.landingMs * 0.11) * 4 : 0;
  const cameraKick = reducedMotion ? 0 : Math.round(Math.max(-RUNNER_CAMERA_SHAKE_CAP, Math.min(RUNNER_CAMERA_SHAKE_CAP, impactKick + stompKick)));
  context.translate(cameraKick, Math.abs(cameraKick) * 0.28);
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

  context.fillStyle = ACT_GRADES[state.actIndex].energy;
  context.font = `800 11px ${palette.fontMono}`;
  context.textAlign = "right";
  context.fillText(act.toolLabel.toUpperCase(), RUNNER_WIDTH - 30, 42);
  context.fillStyle = palette.inkSoft;
  context.font = `600 10px ${palette.fontMono}`;
  context.fillText(state.activePower ? state.activePower.replaceAll("-", " ").toUpperCase() : "ACTION READY", RUNNER_WIDTH - 30, 58);

  for (const candidate of act.targets) {
    const screenX = runnerWorldToScreen(candidate.x, state.worldX);
    if (screenX > -candidate.width - 20 && screenX < RUNNER_WIDTH + 20) {
      drawTarget(context, candidate, screenX, state.transformedTargetIds.includes(candidate.id), palette);
    }
  }
  for (const power of act.pickups) {
    if (state.collectedPickupIds.includes(power.id)) continue;
    const screenX = runnerWorldToScreen(power.x, state.worldX);
    if (screenX > -100 && screenX < RUNNER_WIDTH + 100) drawPickup(context, power, screenX, state, palette, reducedMotion);
  }
  for (const projectile of state.projectiles) {
    drawSpark(context, projectile, state, palette);
  }
  drawMovementFx(context, state, palette, reducedMotion);
  drawPowerAura(context, state, palette, reducedMotion);
  if (!reducedMotion) {
    drawFlourish(context, state, act, palette);
    drawImpact(context, state, act, palette);
    drawLandingDust(context, state, palette);
  }
  drawPerson(context, state, act.lead, palette);
  drawCinematicGrade(context, state);

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
