export const RUNNER_ACT_SECONDS = 32;
export const RUNNER_SESSION_SECONDS = 240;
export const RUNNER_WIDTH = 960;
export const RUNNER_HEIGHT = 432;
export const RUNNER_DPR_CAP = 2;
export const RUNNER_EFFECT_PARTICLE_CAP = 24;
export const RUNNER_PROJECTILE_CAP = 6;
export const RUNNER_CAMERA_SHAKE_CAP = 6;
export const RUNNER_FIXED_STEP_MS = 1_000 / 60;
export const RUNNER_MAX_CATCH_UP_STEPS = 120;
export const RUNNER_PLAYER_HITBOX = { offsetX: 10, offsetY: 14, width: 34, height: 48 } as const;
export const RUNNER_ACTION_ROUTE_MINIMUM_MS = (RUNNER_ACT_SECONDS * 1_000 + RUNNER_FIXED_STEP_MS * RUNNER_MAX_CATCH_UP_STEPS) * 5 + 720 * 5 + 1;

export type RunnerLead = "son" | "mother" | "duo";
export type RunnerTargetKind =
  | "missed-call"
  | "price-tag"
  | "puddle-splash"
  | "produce-basket"
  | "traffic-bubble"
  | "streamer"
  | "grocery-list";

export type RunnerToolKind = "phone-flare" | "bargain-burst" | "dhaaga-arc" | "umbrella-wave" | "ghar-flare";
export type RunnerPowerKind = "phulkari-guard" | "chaa-overdrive" | "monsoon-lift";
export type RunnerComplicationKind = "sabzi-load" | "monsoon-headwind";
export type RunnerActionKind = "lane-change" | "tool" | "power" | "complication" | "collision";
export type RunnerRenderQuality = "high" | "balanced" | "quiet";
export type RunnerObstacleMaterial = "sandstone" | "market-timber" | "hammered-brass" | "wet-terrazzo" | "phulkari-inlay";
export type RunnerFailureReason = "corridor";
export type RunnerLane = 0 | 1 | 2;

export function runnerRenderQualityForIntervals(frameIntervals: readonly number[]): RunnerRenderQuality {
  const ordered = frameIntervals.filter((interval) => interval > 0 && interval <= 250).sort((left, right) => left - right);
  if (ordered.length === 0) return "high";
  const p95 = ordered[Math.max(0, Math.ceil(ordered.length * 0.95) - 1)];
  return p95 <= 21 ? "high" : p95 <= 38 ? "balanced" : "quiet";
}

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
  "phone-flare": ["missed-call", "grocery-list", "puddle-splash"],
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

export type RunnerComplication = {
  id: string;
  kind: RunnerComplicationKind;
  x: number;
  label: string;
  arrivalLine: string;
  closingLine: string;
  durationMs: number;
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
  complications: readonly RunnerComplication[];
  obstacles: readonly RunnerObstacle[];
};

export type RunnerObstacle = {
  id: string;
  x: number;
  width: number;
  gapY: number;
  gapHeight: number;
  safeLane: RunnerLane;
  contactMs: number;
  warningMs: number;
  material: RunnerObstacleMaterial;
  label: string;
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
  lane: RunnerLane;
  targetLane: RunnerLane;
  laneFromY: number;
  laneTransitionMs: number;
  laneTransitionDurationMs: number;
  pendingLaneDelta: -1 | 1 | null;
  stumbleMs: number;
  toolRecoveryMs: number;
  pendingTool: boolean;
  activePower: RunnerPowerKind | null;
  activeComplication: RunnerComplicationKind | null;
  activeComplicationId: string | null;
  activeComplicationRemainingMs: number;
  encounteredComplicationIds: string[];
  lastComplicationId: string | null;
  complicationFlourishMs: number;
  collectedPickupIds: string[];
  lastCollectedPickupId: string | null;
  pickupFlourishMs: number;
  lastAction: RunnerActionKind | null;
  paused: boolean;
  finished: boolean;
  failed: boolean;
  failureReason: RunnerFailureReason | null;
  failedObstacleId: string | null;
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
  spark?: boolean;
  tool?: boolean;
  laneDelta?: -1 | 1;
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
const TOOL_RECOVERY_MS = 260;
export const RUNNER_LANE_Y: readonly [number, number, number] = [68, 168, 268];
export const RUNNER_SPEED_RANGES = [
  { start: 94, end: 104 },
  { start: 104, end: 116 },
  { start: 116, end: 130 },
  { start: 130, end: 146 },
  { start: 146, end: 164 },
] as const;
export const RUNNER_LANE_TRANSITION_MS = [260, 240, 220, 200, 180] as const;
export const RUNNER_WARNING_SECONDS = [1.8, 1.6, 1.4, 1.15, 0.95] as const;

export function runnerWorldSpeedAt(actIndex: number, elapsedMs: number): number {
  const range = RUNNER_SPEED_RANGES[actIndex];
  const progress = Math.max(0, Math.min(1, elapsedMs / (RUNNER_ACT_SECONDS * 1_000)));
  return range.start + (range.end - range.start) * progress;
}

export function runnerWorldDistanceAt(actIndex: number, elapsedMs: number): number {
  const range = RUNNER_SPEED_RANGES[actIndex];
  const seconds = Math.max(0, Math.min(RUNNER_ACT_SECONDS, elapsedMs / 1_000));
  return range.start * seconds + 0.5 * ((range.end - range.start) / RUNNER_ACT_SECONDS) * seconds * seconds;
}

const OBSTACLE_MATERIALS: readonly RunnerObstacleMaterial[] = [
  "sandstone",
  "market-timber",
  "hammered-brass",
  "wet-terrazzo",
  "phulkari-inlay",
] as const;
const OBSTACLE_GAPS = [104, 100, 96, 92, 88] as const;
const OBSTACLE_CONTACT_SECONDS = [
  [5.8, 10.8, 15.8, 20.8, 25.8],
  [5.2, 9.6, 14, 18.4, 22.8, 27.2],
  [4.8, 8.7, 12.6, 16.5, 20.4, 24.3, 28.2],
  [4.4, 7.9, 11.4, 14.9, 18.4, 21.9, 25.4, 28.9],
  [4, 7.1, 10.2, 13.3, 16.4, 19.5, 22.6, 25.7, 28.8],
] as const;
const OBSTACLE_SAFE_LANES: readonly (readonly RunnerLane[])[] = [
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1, 2],
  [1, 0, 1, 2, 1, 0, 1],
  [1, 2, 1, 0, 1, 2, 1, 0],
  [1, 0, 1, 2, 1, 0, 1, 2, 1],
] as const;

function runnerObstacles(actIndex: number): readonly RunnerObstacle[] {
  const gapHeight = OBSTACLE_GAPS[actIndex];
  const material = OBSTACLE_MATERIALS[actIndex];
  return OBSTACLE_CONTACT_SECONDS[actIndex].map((contactSeconds, index) => {
    const safeLane = OBSTACLE_SAFE_LANES[actIndex][index];
    const center = RUNNER_LANE_Y[safeLane] + RUNNER_PLAYER_HITBOX.offsetY + RUNNER_PLAYER_HITBOX.height / 2;
    return {
      id: `act-${actIndex + 1}-gate-${index + 1}`,
      x: runnerWorldDistanceAt(actIndex, contactSeconds * 1_000) + RUNNER_PLAYER_SCREEN_X + RUNNER_PLAYER_HITBOX.offsetX + RUNNER_PLAYER_HITBOX.width,
      width: 78 + ((index + actIndex) % 3) * 8,
      gapY: center - gapHeight / 2,
      gapHeight,
      safeLane,
      contactMs: contactSeconds * 1_000,
      warningMs: RUNNER_WARNING_SECONDS[actIndex] * 1_000,
      material,
      label: `${material.replaceAll("-", " ")} lane gate ${index + 1}`,
    };
  });
}

export function runnerWorldToScreen(worldX: number, cameraWorldX: number): number {
  return worldX - cameraWorldX;
}

export function runnerUpcomingInstruction(state: Pick<RunnerState, "actIndex" | "elapsedMs" | "targetLane">) {
  const obstacle = RUNNER_ACTS[state.actIndex].obstacles.find((candidate) => candidate.contactMs >= state.elapsedMs);
  if (!obstacle) return null;
  const timeToContactMs = obstacle.contactMs - state.elapsedMs;
  if (timeToContactMs > obstacle.warningMs) return null;
  const direction = obstacle.safeLane < state.targetLane ? "up" : obstacle.safeLane > state.targetLane ? "down" : "hold";
  return {
    obstacleId: obstacle.id,
    direction,
    label: direction === "up" ? "Move up" : direction === "down" ? "Move down" : "Hold lane",
    timeToContactMs,
  } as const;
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

function complication(
  id: string,
  kind: RunnerComplicationKind,
  x: number,
  label: string,
  arrivalLine: string,
  closingLine: string,
  durationMs = 4_200,
): RunnerComplication {
  return { id, kind, x, label, arrivalLine, closingLine, durationMs };
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
    tool: "phone-flare",
    toolLabel: "Phone Flare",
    toolLine: "A focused reply flare turns missed-call noise into a clear route home.",
    sparkLabel: "Send apology note",
    praise: "Shabaash — apology delivered with the groceries intact.",
    closing: "The front gate appears. Gurpreet arrives with dignity, groceries, and a revised estimate of ‘five minutes.’",
    storyBeats: [
      "Gurpreet reads the first amber lane marker, moves up once, and keeps the grocery bag clear through Sector 22.",
      "A Phone Flare turns the missed-call wall into one calm ‘On my way’ note; Phulkari Guard folds a puddle splash into the route pattern.",
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
    complications: [complication("gw-load", "sabzi-load", 1_080, "Sabzi Load", "Sabzi Load: the bag settles low while the marked lane stays steady.", "Sabzi Load balanced. The coriander remains dignified.")],
    obstacles: runnerObstacles(0),
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
      "Harjit enters the mandi with a cloth bag, a written list, and one measured lane change through the opening timber aisle.",
      "Her Bargain Burst settles a whole cone of theatrical price tags; Chaa Overdrive returns runaway tomatoes to formation.",
      "She leaves with every item, exact change, and enough coriander to make the fridge smell optimistic.",
    ],
    targets: [
      target("sc-price-1", "price-tag", 690, 232, 82, 64, "₹480, final?", "Fair price", "The price tag remembers arithmetic.", "This price tag has hired its own publicist."),
      target("sc-basket-0", "produce-basket", 990, 292, 96, 58, "Pea escape", "Peas parked", "The peas return to their assigned sector.", "Five peas attempt a tiny green jailbreak."),
      target("sc-basket-1", "produce-basket", 1_280, 292, 106, 60, "Runaway tomatoes", "Basket settled", "Tomatoes return to formation.", "Three tomatoes attempt municipal independence."),
      target("sc-price-2", "price-tag", 1_980, 222, 92, 70, "Today only!", "Receipt ready", "Drama removed. Receipt retained.", "The exclamation mark is doing most of the pricing."),
      target("sc-list-1", "grocery-list", 2_590, 238, 76, 92, "Dhania?", "Dhania ✓", "The most important line is now impossible to miss.", "Without dhania, this mission has no closing argument."),
      target("sc-basket-2", "produce-basket", 3_290, 286, 116, 66, "Rolling bhindi", "Bhindi packed", "Bhindi contained with cabinet-level efficiency.", "The bhindi has mistaken the aisle for Madhya Marg."),
    ],
    pickups: [pickup("sc-overdrive", "chaa-overdrive", 1_610, 240, "Chaa Overdrive", "Chaa Overdrive ready. The next bargain fills the whole aisle.")],
    complications: [complication("sc-load", "sabzi-load", 2_250, "Full Jhola", "Full Jhola: the bag sway softens while Harjit balances the market properly.", "Full Jhola settled. Exact change survives.")],
    obstacles: runnerObstacles(1),
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
      "Harjit calls the side lane while Gurpreet sends a piercing Dhaaga Arc through only the loose ribbons; one shared move clears the tangle.",
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
    pickups: [pickup("bd-lift", "monsoon-lift", 1_705, 214, "Monsoon Lift", "Monsoon Lift ready. Brass light opens along the next marked lane.")],
    complications: [complication("bd-headwind", "monsoon-headwind", 1_535, "Dhol Headwind", "Dhol Headwind: ribbons lean, scarves stream, and the safe line stays exactly where it was.", "Dhol Headwind bows out on the beat.")],
    obstacles: runnerObstacles(2),
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
      "Harjit and Gurpreet move into the dry-side glow together. Neither mentions who forgot to check the forecast.",
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
    complications: [complication("mp-headwind", "monsoon-headwind", 1_455, "Monsoon Headwind", "Monsoon Headwind: the weather performs sideways while the lane marker stays honest.", "Monsoon Headwind passes. The umbrella files no complaint.")],
    obstacles: runnerObstacles(3),
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
    complications: [complication("rr-load", "sabzi-load", 2_435, "Dinner Cargo", "Dinner Cargo: both bags settle into one slower, steadier home line.", "Dinner Cargo balanced. Roti approach restored.")],
    obstacles: runnerObstacles(4),
  },
] as const;

export function createRunnerState(actIndex: number): RunnerState {
  if (!Number.isInteger(actIndex) || actIndex < 0 || actIndex >= RUNNER_ACTS.length) throw new Error(`Unknown runner act: ${actIndex}`);
  return {
    actIndex,
    elapsedMs: 0,
    worldX: 0,
    y: RUNNER_LANE_Y[1],
    lane: 1,
    targetLane: 1,
    laneFromY: RUNNER_LANE_Y[1],
    laneTransitionMs: 0,
    laneTransitionDurationMs: RUNNER_LANE_TRANSITION_MS[actIndex],
    pendingLaneDelta: null,
    stumbleMs: 0,
    toolRecoveryMs: 0,
    pendingTool: false,
    activePower: null,
    activeComplication: null,
    activeComplicationId: null,
    activeComplicationRemainingMs: 0,
    encounteredComplicationIds: [],
    lastComplicationId: null,
    complicationFlourishMs: 0,
    collectedPickupIds: [],
    lastCollectedPickupId: null,
    pickupFlourishMs: 0,
    lastAction: null,
    paused: false,
    finished: false,
    failed: false,
    failureReason: null,
    failedObstacleId: null,
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

export function runnerPlayerHitbox(state: Pick<RunnerState, "worldX" | "y">) {
  return {
    x: state.worldX + RUNNER_PLAYER_SCREEN_X + RUNNER_PLAYER_HITBOX.offsetX,
    y: state.y + RUNNER_PLAYER_HITBOX.offsetY,
    width: RUNNER_PLAYER_HITBOX.width,
    height: RUNNER_PLAYER_HITBOX.height,
  };
}

function sweptHitTime(
  start: { x: number; y: number; width: number; height: number },
  end: { x: number; y: number; width: number; height: number },
  obstacle: { x: number; y: number; width: number; height: number },
): number | null {
  if (overlaps(start, obstacle)) return 0;
  const expanded = {
    left: obstacle.x - start.width,
    right: obstacle.x + obstacle.width,
    top: obstacle.y - start.height,
    bottom: obstacle.y + obstacle.height,
  };
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;
  let near = 0;
  let far = 1;
  for (const [origin, delta, minimum, maximum] of [
    [start.x, deltaX, expanded.left, expanded.right],
    [start.y, deltaY, expanded.top, expanded.bottom],
  ] as const) {
    if (Math.abs(delta) < 0.00001) {
      if (origin < minimum || origin > maximum) return null;
      continue;
    }
    const first = (minimum - origin) / delta;
    const second = (maximum - origin) / delta;
    near = Math.max(near, Math.min(first, second));
    far = Math.min(far, Math.max(first, second));
    if (near > far) return null;
  }
  return near >= 0 && near <= 1 ? near : null;
}

function firstLethalContact(previous: RunnerState, next: RunnerState) {
  const start = runnerPlayerHitbox(previous);
  const end = runnerPlayerHitbox(next);
  const act = RUNNER_ACTS[next.actIndex];
  const candidates: Array<{ id: string; reason: RunnerFailureReason; time: number }> = [];
  const addCandidate = (id: string, reason: RunnerFailureReason, rect: { x: number; y: number; width: number; height: number }) => {
    const time = sweptHitTime(start, end, rect);
    if (time !== null) candidates.push({ id, reason, time });
  };
  for (const obstacle of act.obstacles) {
    addCandidate(`${obstacle.id}-top`, "corridor", { x: obstacle.x, y: 0, width: obstacle.width, height: obstacle.gapY });
    addCandidate(`${obstacle.id}-bottom`, "corridor", {
      x: obstacle.x,
      y: obstacle.gapY + obstacle.gapHeight,
      width: obstacle.width,
      height: FLOOR_Y - obstacle.gapY - obstacle.gapHeight,
    });
  }
  return candidates.sort((left, right) => left.time - right.time || left.id.localeCompare(right.id))[0] ?? null;
}

function failRunner(state: RunnerState, contact: { id: string; reason: RunnerFailureReason }) {
  state.failed = true;
  state.failureReason = contact.reason;
  state.failedObstacleId = contact.id.replace(/-(top|bottom)$/, "");
  state.laneTransitionMs = 0;
  state.pendingLaneDelta = null;
  state.pendingTool = false;
  state.projectiles = [];
  state.impactMs = 420;
  state.lastAction = "collision";
  state.message = "Route paused at the gate. The city holds the same boundary.";
}

function laneEase(progress: number): number {
  const clamped = Math.max(0, Math.min(1, progress));
  return clamped * clamped * (3 - 2 * clamped);
}

function beginLaneTransition(state: RunnerState, delta: -1 | 1): boolean {
  const nextLane = state.targetLane + delta;
  if (nextLane < 0 || nextLane > 2) return false;
  state.laneFromY = state.y;
  state.targetLane = nextLane as RunnerLane;
  state.laneTransitionDurationMs = RUNNER_LANE_TRANSITION_MS[state.actIndex];
  state.laneTransitionMs = state.laneTransitionDurationMs;
  state.lastAction = "lane-change";
  state.message = delta < 0 ? "Moving up one lane." : "Moving down one lane.";
  return true;
}

function requestLaneTransition(state: RunnerState, delta: -1 | 1) {
  if (state.laneTransitionMs > 0) {
    if (state.pendingLaneDelta !== null) return;
    const bufferedLane = state.targetLane + delta;
    if (bufferedLane >= 0 && bufferedLane <= 2) state.pendingLaneDelta = delta;
    return;
  }
  beginLaneTransition(state, delta);
}

function advanceLaneTransition(state: RunnerState, stepMs: number) {
  if (state.laneTransitionMs <= 0) return;
  state.laneTransitionMs = Math.max(0, state.laneTransitionMs - stepMs);
  const progress = 1 - state.laneTransitionMs / state.laneTransitionDurationMs;
  const destinationY = RUNNER_LANE_Y[state.targetLane];
  state.y = state.laneFromY + (destinationY - state.laneFromY) * laneEase(progress);
  if (state.laneTransitionMs > 0) return;
  state.lane = state.targetLane;
  state.y = destinationY;
  const buffered = state.pendingLaneDelta;
  state.pendingLaneDelta = null;
  state.landingMs = 240;
  if (buffered !== null) {
    state.landingMs = 0;
    beginLaneTransition(state, buffered);
  }
}

export function stepRunner(previous: RunnerState, input: RunnerInput, deltaMs: number): RunnerState {
  const state: RunnerState = {
    ...previous,
    projectiles: previous.projectiles.map((projectile) => ({ ...projectile })),
    transformedTargetIds: [...previous.transformedTargetIds],
    encounteredTargetIds: [...previous.encounteredTargetIds],
    collectedPickupIds: [...previous.collectedPickupIds],
    encounteredComplicationIds: [...previous.encounteredComplicationIds],
  };
  if (state.finished || state.failed || state.paused) return state;
  const stepMs = Math.max(0, Math.min(deltaMs, 50));
  state.flourishMs = Math.max(0, state.flourishMs - stepMs);
  state.landingMs = Math.max(0, state.landingMs - stepMs);
  state.impactMs = Math.max(0, state.impactMs - stepMs);
  state.pickupFlourishMs = Math.max(0, state.pickupFlourishMs - stepMs);
  state.complicationFlourishMs = Math.max(0, state.complicationFlourishMs - stepMs);
  state.stumbleMs = Math.max(0, state.stumbleMs - stepMs);
  state.toolRecoveryMs = Math.max(0, state.toolRecoveryMs - stepMs);
  const dt = stepMs / 1_000;
  const toolPressed = Boolean(input.toolPressed || input.tool || input.spark);

  if (state.activeComplication && state.activeComplicationRemainingMs > 0) {
    state.activeComplicationRemainingMs = Math.max(0, state.activeComplicationRemainingMs - stepMs);
    if (state.activeComplicationRemainingMs === 0) {
      const completed = RUNNER_ACTS[state.actIndex].complications.find((candidate) => candidate.id === state.activeComplicationId);
      state.activeComplication = null;
      state.activeComplicationId = null;
      state.complicationFlourishMs = 520;
      state.lastAction = "complication";
      if (completed) state.message = completed.closingLine;
    }
  }

  if (input.laneDelta) requestLaneTransition(state, input.laneDelta);

  if (toolPressed) {
    if (state.toolRecoveryMs > 0) state.pendingTool = true;
    else launchRunnerTool(state);
  } else if (state.pendingTool && state.toolRecoveryMs === 0) {
    state.pendingTool = false;
    launchRunnerTool(state);
  }
  state.elapsedMs = Math.min(RUNNER_ACT_SECONDS * 1_000, state.elapsedMs + stepMs);
  state.worldX = runnerWorldDistanceAt(state.actIndex, state.elapsedMs);
  advanceLaneTransition(state, stepMs);
  state.projectiles = state.projectiles
    .map((projectile) => advanceProjectile(projectile, stepMs, dt))
    .filter((projectile) => projectile.ageMs < projectile.ttlMs && projectile.x < state.worldX + RUNNER_WIDTH + 180);

  const lethalContact = firstLethalContact(previous, state);
  if (lethalContact) {
    failRunner(state, lethalContact);
    return state;
  }

  const act = RUNNER_ACTS[state.actIndex];
  const playerWorld = { x: state.worldX + RUNNER_PLAYER_SCREEN_X - 12, y: state.y - 14, width: PLAYER_WIDTH + 32, height: PLAYER_HEIGHT + 28 };
  for (const candidate of act.complications) {
    if (state.encounteredComplicationIds.includes(candidate.id)) continue;
    const gate = { x: candidate.x - 26, y: 0, width: 112, height: FLOOR_Y };
    if (overlaps(playerWorld, gate)) {
      state.encounteredComplicationIds.push(candidate.id);
      state.activeComplication = candidate.kind;
      state.activeComplicationId = candidate.id;
      state.activeComplicationRemainingMs = candidate.durationMs;
      state.lastComplicationId = candidate.id;
      state.complicationFlourishMs = 760;
      state.lastAction = "complication";
      state.message = candidate.arrivalLine;
    }
  }
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
  if (act.tool === "phone-flare") additions.push(projectile(state, act.tool, -24, 660, 0, empowered ? 34 : 20, 1_350, empowered));
  else if (act.tool === "bargain-burst") {
    const lanes = empowered ? [-26, 0, 26] : [-15, 15];
    lanes.forEach((lane) => additions.push(projectile(state, act.tool, lane, 520, lane * 0.45, empowered ? 42 : 30, 680, empowered)));
  } else if (act.tool === "dhaaga-arc") additions.push(projectile(state, act.tool, 0, 540, -95, empowered ? 40 : 28, 1_500, true));
  else if (act.tool === "umbrella-wave") {
    additions.push(projectile(state, act.tool, 12, 480, -165, empowered ? 50 : 38, 1_300, true));
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

function drawTarget(context: CanvasRenderingContext2D, candidate: RunnerTarget, screenX: number, transformed: boolean, palette: RunnerPalette, quality: RunnerRenderQuality = "high") {
  const x = Math.round(screenX);
  const y = candidate.y;
  const grade = ACT_GRADES[Math.max(0, Math.min(4, RUNNER_ACTS.findIndex((act) => act.targets.includes(candidate))))];
  const ink = transformed ? palette.jade : grade.energy;
  context.save();
  context.translate(x, y);
  context.shadowColor = transformed ? palette.jade : grade.glow;
  context.shadowBlur = quality === "quiet" ? 0 : transformed ? 20 : 12;
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

const OBSTACLE_COLORS: Readonly<Record<RunnerObstacleMaterial, { light: string; mid: string; dark: string; line: string }>> = {
  sandstone: { light: "#c98f5d", mid: "#865337", dark: "#321f20", line: "#f1c98d" },
  "market-timber": { light: "#a8673d", mid: "#603921", dark: "#251719", line: "#eab36d" },
  "hammered-brass": { light: "#d8aa45", mid: "#806326", dark: "#292019", line: "#ffe09a" },
  "wet-terrazzo": { light: "#6c8d94", mid: "#34545d", dark: "#17252c", line: "#b8edf0" },
  "phulkari-inlay": { light: "#b84768", mid: "#6e264d", dark: "#25152d", line: "#ffd06a" },
};

function drawObstacleTexture(
  context: CanvasRenderingContext2D,
  obstacle: RunnerObstacle,
  x: number,
  y: number,
  width: number,
  height: number,
  quality: RunnerRenderQuality,
) {
  const colors = OBSTACLE_COLORS[obstacle.material];
  const detail = quality === "high" ? 1 : quality === "balanced" ? 0.68 : 0.38;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.globalAlpha = 0.42;
  context.strokeStyle = colors.line;
  context.fillStyle = colors.line;
  context.lineWidth = 1;
  if (obstacle.material === "sandstone") {
    for (let line = y + 18; line < y + height; line += quality === "high" ? 21 : 32) {
      context.beginPath();
      context.moveTo(x, line);
      context.lineTo(x + width, line);
      context.stroke();
      if (quality !== "quiet") {
        const offset = Math.floor((line - y) / 21) % 2 ? width * 0.35 : width * 0.68;
        context.beginPath();
        context.moveTo(x + offset, line - 21);
        context.lineTo(x + offset, line);
        context.stroke();
      }
    }
  } else if (obstacle.material === "market-timber") {
    for (let plank = x + 16; plank < x + width; plank += 22) {
      context.beginPath();
      context.moveTo(plank, y);
      context.lineTo(plank, y + height);
      context.stroke();
      if (quality === "high") {
        context.beginPath();
        context.ellipse(plank - 8, y + 32 + (plank % 3) * 19, 5, 11, 0, 0, Math.PI * 2);
        context.stroke();
      }
    }
  } else if (obstacle.material === "hammered-brass") {
    const step = quality === "high" ? 18 : 28;
    for (let row = y + step / 2; row < y + height; row += step) {
      for (let column = x + step / 2; column < x + width; column += step) {
        context.globalAlpha = detail * 0.46;
        context.beginPath();
        context.arc(column, row, quality === "quiet" ? 1.4 : 2.4, 0, Math.PI * 2);
        context.fill();
      }
    }
  } else if (obstacle.material === "wet-terrazzo") {
    const chips = Math.floor(height * width / (quality === "high" ? 520 : 940));
    for (let chip = 0; chip < chips; chip += 1) {
      const seed = hashText(`${obstacle.id}-${y}-${chip}`);
      const chipX = x + 6 + (seed % Math.max(1, Math.floor(width - 12)));
      const chipY = y + 6 + ((seed >>> 8) % Math.max(1, Math.floor(height - 12)));
      drawDiamond(context, chipX, chipY, 2 + (seed % 3), chip % 3 === 0 ? "#f4b32b" : colors.line);
    }
  } else {
    const step = quality === "high" ? 22 : 32;
    for (let row = y + step / 2; row < y + height; row += step) {
      for (let column = x + step / 2; column < x + width; column += step) {
        drawDiamond(context, column, row, quality === "quiet" ? 5 : 7, (Math.round(row / step) + Math.round(column / step)) % 2 ? colors.line : "#69d1c5", false);
      }
    }
  }
  context.restore();
}

function drawObstacleFace(
  context: CanvasRenderingContext2D,
  obstacle: RunnerObstacle,
  screenX: number,
  y: number,
  height: number,
  innerEdgeY: number,
  edgeDirection: 1 | -1,
  quality: RunnerRenderQuality,
) {
  if (height <= 0) return;
  const colors = OBSTACLE_COLORS[obstacle.material];
  const gradient = quality === "quiet" ? null : context.createLinearGradient(screenX, 0, screenX + obstacle.width, 0);
  gradient?.addColorStop(0, colors.dark);
  gradient?.addColorStop(0.22, colors.mid);
  gradient?.addColorStop(0.72, colors.light);
  gradient?.addColorStop(1, colors.dark);
  context.save();
  context.shadowColor = quality === "quiet" ? "transparent" : "#000000a8";
  context.shadowBlur = quality === "high" ? 16 : quality === "balanced" ? 6 : 0;
  context.shadowOffsetX = quality === "quiet" ? 0 : -6;
  context.fillStyle = gradient ?? colors.mid;
  context.fillRect(screenX, y, obstacle.width, height);
  context.shadowBlur = 0;
  if (quality !== "quiet") drawObstacleTexture(context, obstacle, screenX, y, obstacle.width, height, quality);
  context.fillStyle = colors.dark;
  context.fillRect(screenX, y, 7, height);
  context.fillStyle = `${colors.line}42`;
  context.fillRect(screenX + obstacle.width - 9, y, 4, height);
  context.strokeStyle = colors.line;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(screenX, innerEdgeY);
  context.lineTo(screenX + obstacle.width, innerEdgeY);
  context.stroke();
  context.strokeStyle = "#fff1c2";
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(screenX, innerEdgeY + edgeDirection * 5);
  context.lineTo(screenX + obstacle.width, innerEdgeY + edgeDirection * 5);
  context.stroke();
  context.fillStyle = colors.line;
  for (let notch = 12; notch < obstacle.width - 5; notch += 22) {
    context.beginPath();
    context.moveTo(screenX + notch - 5, innerEdgeY);
    context.lineTo(screenX + notch, innerEdgeY - edgeDirection * 7);
    context.lineTo(screenX + notch + 5, innerEdgeY);
    context.closePath();
    context.fill();
  }
  context.strokeStyle = "#080a12";
  context.lineWidth = 2;
  context.strokeRect(screenX + 1, y + 1, obstacle.width - 2, Math.max(0, height - 2));
  context.restore();
}

function drawRunnerObstacles(context: CanvasRenderingContext2D, state: RunnerState, quality: RunnerRenderQuality) {
  const act = RUNNER_ACTS[state.actIndex];
  for (const obstacle of act.obstacles) {
    const screenX = runnerWorldToScreen(obstacle.x, state.worldX);
    if (screenX < -obstacle.width - 24 || screenX > RUNNER_WIDTH + 24) continue;
    const gapBottom = obstacle.gapY + obstacle.gapHeight;
    drawObstacleFace(context, obstacle, screenX, 0, obstacle.gapY, obstacle.gapY, -1, quality);
    drawObstacleFace(context, obstacle, screenX, gapBottom, FLOOR_Y - gapBottom, gapBottom, 1, quality);
    if (quality !== "quiet" && gapBottom + 40 < FLOOR_Y) {
      context.save();
      context.fillStyle = "#090d18d9";
      context.strokeStyle = OBSTACLE_COLORS[obstacle.material].line;
      context.lineWidth = 1;
      context.fillRect(screenX + 9, gapBottom + 15, obstacle.width - 18, 25);
      context.strokeRect(screenX + 9, gapBottom + 15, obstacle.width - 18, 25);
      context.fillStyle = "#fff1c2";
      context.font = "700 8px ui-monospace, monospace";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(act.obstacles.indexOf(obstacle) + 1).padStart(2, "0"), screenX + obstacle.width / 2, gapBottom + 27.5);
      context.restore();
    }
  }
  const instruction = runnerUpcomingInstruction(state);
  if (instruction) {
    context.save();
    const centerX = RUNNER_PLAYER_SCREEN_X + 28;
    const panelY = 90;
    context.fillStyle = "#090d18e8";
    context.strokeStyle = "#f4c66d";
    context.lineWidth = 2;
    context.fillRect(centerX - 54, panelY - 22, 108, 44);
    context.strokeRect(centerX - 54, panelY - 22, 108, 44);
    context.fillStyle = "#fff1c2";
    context.font = "800 11px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const marker = instruction.direction === "up" ? "↑" : instruction.direction === "down" ? "↓" : "◆";
    context.fillText(`${marker} ${instruction.label.toUpperCase()}`, centerX, panelY);
    context.restore();
  }
}

function drawLeadSprite(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  role: "son" | "mother",
  state: RunnerState,
  palette: RunnerPalette,
  scale = 1.22,
  reducedMotion = false,
) {
  const runFrame = Math.floor(state.elapsedMs / 95) % 4;
  const stride = [-6, 1, 6, -1][runFrame];
  const bounce = state.laneTransitionMs === 0 ? [0, -1.5, 0, -0.75][runFrame] : 0;
  const laneDistance = Math.abs(RUNNER_LANE_Y[state.targetLane] - state.y);
  const travelStretch = reducedMotion ? 0 : Math.min(0.06, laneDistance / 1_600);
  const settlement = reducedMotion ? 0 : state.landingMs / 240;
  const squash = state.failed ? 0.94 : state.laneTransitionMs > 0 ? 0.98 : 1 + settlement * 0.05;
  const stretch = state.failed ? 1.02 : 1 + travelStretch - settlement * 0.05;
  const cloth = role === "mother" ? "#9d304f" : "#244e8e";
  const skin = "#d3a06f";
  const recoil = state.stumbleMs > 0 ? Math.sin(state.stumbleMs * 0.08) * 4 : 0;
  const lean = reducedMotion ? 0 : runnerLanePitch(state);
  context.save();
  context.translate(Math.round(x + PLAYER_WIDTH / 2 + recoil), Math.round(y + PLAYER_HEIGHT));
  context.rotate(lean);
  context.scale(scale * squash, scale * stretch);
  context.translate(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT + bounce);

  context.fillStyle = "#b68135";
  context.strokeStyle = palette.ink;
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(2, 29, 13, 30, 4);
  context.fill();
  context.stroke();
  context.strokeStyle = state.failed ? palette.muted : palette.accent;
  context.lineWidth = state.laneTransitionMs > 0 ? 5 : 3;
  context.beginPath();
  context.moveTo(4, 58);
  const laneLag = reducedMotion ? 0 : Math.sign(RUNNER_LANE_Y[state.targetLane] - state.y) * 8;
  context.lineTo(-8 - (state.laneTransitionMs > 0 ? 12 : 4), 58 + laneLag);
  context.stroke();

  context.globalAlpha = 0.32;
  context.fillStyle = "#000000";
  context.beginPath();
  context.ellipse(29, 78, state.laneTransitionMs > 0 ? 31 : 24, 5, 0, 0, Math.PI * 2);
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

export function runnerAuthoredPoseIndex(state: RunnerState): number {
  if (state.impactMs > 0 || state.stumbleMs > 0) return 3;
  if (state.toolRecoveryMs > 80 && state.lastAction === "tool") return 2;
  if (state.laneTransitionMs > 0) return state.targetLane < state.lane ? 0 : 4;
  if (state.landingMs > 0) return 4;
  return Math.floor(state.elapsedMs / 180) % 2 === 0 ? 1 : 4;
}

export function runnerLanePitch(state: Pick<RunnerState, "y" | "targetLane" | "laneTransitionMs" | "failed">): number {
  if (state.failed) return 0.09;
  if (state.laneTransitionMs <= 0) return 0;
  return Math.max(-0.16, Math.min(0.16, (RUNNER_LANE_Y[state.targetLane] - state.y) / 420));
}

export function runnerAuthoredPoseBlend(state: RunnerState) {
  const pose = runnerAuthoredPoseIndex(state);
  if (state.failed || state.impactMs > 0) return { from: pose, to: pose, mix: 0 };
  const phase = (state.elapsedMs % 160) / 160;
  const adjacent = state.laneTransitionMs > 0 ? 1 : pose === 1 ? 4 : 1;
  return { from: pose, to: adjacent, mix: Math.min(0.38, phase * 0.76) };
}

export function runnerLeadFormation(lead: RunnerLead) {
  if (lead === "duo") return [
    { role: "mother", offsetX: -12, offsetY: 6, scale: 0.82 },
    { role: "son", offsetX: 8, offsetY: 0, scale: 0.9 },
  ] as const;
  return [{ role: lead, offsetX: 0, offsetY: 0, scale: lead === "mother" ? 1.05 : 1.05 }] as const;
}

function drawFlightRig(
  context: CanvasRenderingContext2D,
  destinationX: number,
  destinationY: number,
  destinationWidth: number,
  destinationHeight: number,
  role: "son" | "mother",
  state: RunnerState,
  reducedMotion: boolean,
) {
  const rigX = destinationX + destinationWidth * 0.26;
  const rigY = destinationY + destinationHeight * 0.49;
  const lag = reducedMotion ? 0 : Math.max(-14, Math.min(14, (RUNNER_LANE_Y[state.targetLane] - state.y) * 0.16));
  context.save();
  context.fillStyle = "#9a7130";
  context.strokeStyle = "#f4c66d";
  context.lineWidth = 1.5;
  context.beginPath();
  context.roundRect(rigX, rigY, 12, 25, 3);
  context.fill();
  context.stroke();
  context.strokeStyle = role === "mother" ? "#f4b32b" : "#55d6e8";
  context.lineWidth = 4;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(rigX + 2, rigY + 6);
  context.bezierCurveTo(rigX - 20, rigY + 2 + lag, rigX - 29, rigY + 19 + lag, rigX - 42, rigY + 12 + lag);
  context.stroke();
  context.fillStyle = "#bb7c39";
  context.beginPath();
  context.roundRect(rigX + 5, rigY + 17 + lag * 0.18, 15, 18, 4);
  context.fill();
  if (state.laneTransitionMs > 0 || state.failed) {
    context.globalAlpha = state.failed ? 0.56 : 0.9;
    context.strokeStyle = state.failed ? "#c6bca7" : "#70e7f0";
    context.lineWidth = state.laneTransitionMs > 0 ? 5 : 3;
    context.beginPath();
    context.moveTo(rigX + 2, rigY + 23);
    context.lineTo(rigX - (state.laneTransitionMs > 0 ? 26 : 14), rigY + 24 + lag * 0.22);
    context.stroke();
    context.strokeStyle = "#f7c35c";
    context.lineWidth = state.laneTransitionMs > 0 ? 2.5 : 1.5;
    context.beginPath();
    context.moveTo(rigX + 1, rigY + 23);
    context.lineTo(rigX - (state.laneTransitionMs > 0 ? 18 : 8), rigY + 24 + lag * 0.16);
    context.stroke();
  }
  context.restore();
}

function drawAuthoredLead(
  context: CanvasRenderingContext2D,
  spriteSheet: HTMLImageElement,
  x: number,
  y: number,
  role: "son" | "mother",
  state: RunnerState,
  scale = 1,
  reducedMotion = false,
): boolean {
  if (!spriteSheet.complete || spriteSheet.naturalWidth <= 0 || spriteSheet.naturalHeight <= 0) return false;
  const sourceWidth = spriteSheet.naturalWidth / 5;
  const sourceHeight = spriteSheet.naturalHeight / 2;
  const blend = reducedMotion
    ? { from: runnerAuthoredPoseIndex(state), to: runnerAuthoredPoseIndex(state), mix: 0 }
    : runnerAuthoredPoseBlend(state);
  const destinationHeight = 112 * scale;
  const destinationWidth = destinationHeight * (sourceWidth / sourceHeight);
  const destinationX = PLAYER_WIDTH / 2 - destinationWidth / 2;
  const destinationY = PLAYER_HEIGHT - destinationHeight;
  const recoil = state.failed && !reducedMotion ? 4 : 0;
  const laneStretch = reducedMotion ? 0 : Math.min(0.06, Math.abs(RUNNER_LANE_Y[state.targetLane] - state.y) / 1_600);
  context.save();
  context.translate(Math.round(x + PLAYER_WIDTH / 2 + recoil), Math.round(y + PLAYER_HEIGHT / 2));
  context.rotate(reducedMotion ? 0 : runnerLanePitch(state));
  context.scale(state.laneTransitionMs > 0 ? 0.98 : 1, 1 + laneStretch);
  context.translate(-PLAYER_WIDTH / 2, -PLAYER_HEIGHT / 2);
  context.shadowColor = state.laneTransitionMs > 0 ? "#55d6e8" : "#000000b8";
  context.shadowBlur = state.laneTransitionMs > 0 ? 12 : 6;
  drawFlightRig(context, destinationX, destinationY, destinationWidth, destinationHeight, role, state, reducedMotion);
  context.globalAlpha = 1 - blend.mix;
  context.drawImage(
    spriteSheet,
    blend.from * sourceWidth,
    role === "mother" ? sourceHeight : 0,
    sourceWidth,
    sourceHeight,
    destinationX,
    destinationY,
    destinationWidth,
    destinationHeight,
  );
  if (blend.mix > 0) {
    context.globalAlpha = blend.mix;
    context.drawImage(
      spriteSheet,
      blend.to * sourceWidth,
      role === "mother" ? sourceHeight : 0,
      sourceWidth,
      sourceHeight,
      destinationX,
      destinationY,
      destinationWidth,
      destinationHeight,
    );
  }
  context.globalAlpha = 1;
  context.restore();
  return true;
}

function drawPerson(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  lead: RunnerLead,
  palette: RunnerPalette,
  spriteSheet: HTMLImageElement | null,
  reducedMotion = false,
) {
  const x = RUNNER_PLAYER_SCREEN_X;
  const formation = runnerLeadFormation(lead);
  const grade = ACT_GRADES[state.actIndex];
  context.save();
  const portraitLight = context.createRadialGradient(x + 26, state.y + 42, 8, x + 26, state.y + 42, 92);
  portraitLight.addColorStop(0, `${grade.glow}36`);
  portraitLight.addColorStop(0.46, `${grade.energy}18`);
  portraitLight.addColorStop(1, "#00000000");
  context.fillStyle = portraitLight;
  context.fillRect(x - 74, state.y - 62, 212, 214);
  context.globalAlpha = 0.72;
  context.strokeStyle = grade.energy;
  context.lineWidth = 1.5;
  context.beginPath();
  context.ellipse(x + 26, state.y + PLAYER_HEIGHT + 9, 48, 9, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
  if (spriteSheet?.complete && spriteSheet.naturalWidth > 0) {
    for (const rider of formation) {
      drawAuthoredLead(context, spriteSheet, x + rider.offsetX, state.y + rider.offsetY, rider.role, state, rider.scale, reducedMotion);
    }
    return;
  }
  for (const rider of formation) {
    drawLeadSprite(context, x + rider.offsetX, state.y + rider.offsetY, rider.role, state, palette, rider.scale, reducedMotion);
  }
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

function drawCityLayers(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  palette: RunnerPalette,
  reducedMotion: boolean,
  quality: RunnerRenderQuality,
) {
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
      context.fillStyle = `${grade.glow}${layerIndex === 2 ? "45" : "26"}`;
      context.fillRect(x + 8, layer.y - height + 7, buildingWidth - 16, layerIndex === 2 ? 3 : 2);
      const rows = quality === "high" ? 3 : quality === "balanced" ? 2 : 1;
      for (let row = 0; row < rows; row += 1) {
        for (let windowIndex = 0; windowIndex < 5; windowIndex += 1) {
          const lit = (windowIndex + row + index + state.actIndex) % 3 === 0;
          const windowX = x + 14 + windowIndex * Math.max(18, buildingWidth / 6);
          const windowY = layer.y - height + 24 + row * 22;
          if (windowY > layer.y - 14) continue;
          pixelRect(context, windowX, windowY, 7, 10, lit ? `${grade.glow}${layerIndex === 2 ? "96" : "68"}` : "#17283a");
        }
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

function drawLaneTheatre(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  palette: RunnerPalette,
  quality: RunnerRenderQuality,
) {
  const grade = ACT_GRADES[state.actIndex];
  const instruction = runnerUpcomingInstruction(state);
  const safeLane = instruction
    ? RUNNER_ACTS[state.actIndex].obstacles.find((obstacle) => obstacle.id === instruction.obstacleId)?.safeLane
    : null;
  context.save();
  for (const [lane, laneY] of RUNNER_LANE_Y.entries()) {
    const isSafe = safeLane === lane;
    const band = context.createLinearGradient(0, laneY, RUNNER_WIDTH, laneY);
    band.addColorStop(0, "#00000000");
    band.addColorStop(0.14, isSafe ? `${grade.energy}22` : `${grade.horizon}20`);
    band.addColorStop(0.72, isSafe ? `${grade.energy}16` : `${grade.horizon}12`);
    band.addColorStop(1, "#00000000");
    context.fillStyle = band;
    context.fillRect(0, laneY - 8, RUNNER_WIDTH, PLAYER_HEIGHT + 16);
    context.globalAlpha = isSafe ? 0.74 : 0.28;
    context.strokeStyle = isSafe ? grade.energy : palette.rule;
    context.lineWidth = isSafe ? 2 : 1;
    if (quality !== "quiet") context.setLineDash(isSafe ? [16, 12] : [4, 18]);
    context.beginPath();
    context.moveTo(0, laneY + PLAYER_HEIGHT + 5);
    context.lineTo(RUNNER_WIDTH, laneY + PLAYER_HEIGHT + 5);
    context.stroke();
    context.setLineDash([]);
    context.globalAlpha = 1;
  }
  context.globalAlpha = quality === "high" ? 0.5 : quality === "balanced" ? 0.34 : 0.2;
  context.strokeStyle = palette.accent;
  context.lineWidth = 1;
  for (let rail = 0; rail < 4; rail += 1) {
    context.beginPath();
    context.moveTo(RUNNER_WIDTH * 0.54, 208);
    context.lineTo(RUNNER_WIDTH * (0.22 + rail * 0.24), FLOOR_Y);
    context.stroke();
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
  road.addColorStop(0, "#203a50");
  road.addColorStop(0.18, "#132538");
  road.addColorStop(1, "#050911");
  context.fillStyle = road;
  context.fillRect(0, FLOOR_Y, RUNNER_WIDTH, RUNNER_HEIGHT - FLOOR_Y);
  context.fillStyle = grade.glow;
  context.shadowColor = grade.glow;
  context.shadowBlur = 18;
  context.fillRect(0, FLOOR_Y, RUNNER_WIDTH, 4);
  context.shadowBlur = 0;
  context.globalAlpha = 0.5;
  context.fillStyle = grade.energy;
  context.fillRect(0, FLOOR_Y + 8, RUNNER_WIDTH, 1);
  context.globalAlpha = 1;
  for (let mark = -80; mark < RUNNER_WIDTH + 80; mark += 150) {
    const roadOffset = reducedMotion ? 0 : (state.worldX * 0.92) % 150;
    const x = mark - roadOffset;
    context.fillStyle = grade.glow;
    context.globalAlpha = 0.44;
    context.beginPath();
    context.moveTo(x, FLOOR_Y + 43);
    context.lineTo(x + 72, FLOOR_Y + 43);
    context.lineTo(x + 80, FLOOR_Y + 50);
    context.lineTo(x - 5, FLOOR_Y + 50);
    context.closePath();
    context.fill();
    context.globalAlpha = 1;
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

  context.globalAlpha = 0.28;
  context.fillStyle = palette.inkSoft;
  const curbOffset = reducedMotion ? 0 : (state.worldX * 1.18) % 84;
  for (let curb = -84; curb < RUNNER_WIDTH + 84; curb += 84) {
    context.beginPath();
    context.moveTo(curb - curbOffset, FLOOR_Y + 12);
    context.lineTo(curb + 50 - curbOffset, FLOOR_Y + 12);
    context.lineTo(curb + 58 - curbOffset, FLOOR_Y + 18);
    context.lineTo(curb + 4 - curbOffset, FLOOR_Y + 18);
    context.closePath();
    context.fill();
  }
  context.globalAlpha = 1;
}

function drawComplicationGate(
  context: CanvasRenderingContext2D,
  candidate: RunnerComplication,
  screenX: number,
  state: RunnerState,
  palette: RunnerPalette,
  reducedMotion: boolean,
) {
  const grade = ACT_GRADES[state.actIndex];
  const sway = reducedMotion ? 0 : Math.sin(state.elapsedMs * 0.004) * 8;
  context.save();
  context.translate(Math.round(screenX), 118);
  context.globalAlpha = 0.82;
  context.strokeStyle = candidate.kind === "sabzi-load" ? grade.glow : grade.energy;
  context.fillStyle = "#071321d9";
  context.lineWidth = 2;
  context.shadowColor = context.strokeStyle;
  context.shadowBlur = 16;
  context.beginPath();
  context.roundRect(-48, -26, 116, 54, 8);
  context.fill();
  context.stroke();
  context.shadowBlur = 0;
  if (candidate.kind === "sabzi-load") {
    drawDiamond(context, -24, 1, 18, grade.glow, false);
    drawDiamond(context, -24, 1, 9, palette.jade);
  } else {
    for (let line = 0; line < 3; line += 1) {
      context.beginPath();
      context.moveTo(-38 + sway, -12 + line * 12);
      context.bezierCurveTo(-14 + sway, -22 + line * 12, 2, -2 + line * 12, 22, -10 + line * 12);
      context.stroke();
    }
  }
  context.fillStyle = palette.ink;
  context.font = `800 10px ${palette.fontMono}`;
  context.textAlign = "start";
  context.fillText(candidate.label.toUpperCase(), -4, 5, 64);
  context.restore();
}

function drawComplicationAura(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  palette: RunnerPalette,
  reducedMotion: boolean,
) {
  const authoredComplication = RUNNER_ACTS[state.actIndex].complications.find(
    (candidate) => candidate.id === state.lastComplicationId,
  );
  const complicationKind = state.activeComplication ?? (
    state.complicationFlourishMs > 0 ? authoredComplication?.kind ?? null : null
  );
  if (!complicationKind) return;
  const grade = ACT_GRADES[state.actIndex];
  context.save();
  context.strokeStyle = complicationKind === "sabzi-load" ? grade.glow : grade.energy;
  context.fillStyle = context.strokeStyle;
  context.lineWidth = 3;
  context.globalAlpha = state.activeComplication ? 0.58 : Math.min(0.58, state.complicationFlourishMs / 520);
  if (complicationKind === "sabzi-load") {
    const breath = reducedMotion ? 0 : Math.sin(state.elapsedMs * 0.01) * 4;
    context.beginPath();
    context.ellipse(RUNNER_PLAYER_SCREEN_X + 28, FLOOR_Y + 2, 44 + breath, 9, 0, 0, Math.PI * 2);
    context.stroke();
    drawDiamond(context, RUNNER_PLAYER_SCREEN_X + 28, FLOOR_Y - 18, 10, palette.jade, false);
  } else {
    const lean = reducedMotion ? 0 : 18;
    for (let line = 0; line < 5; line += 1) {
      context.globalAlpha = 0.24 + line * 0.07;
      context.beginPath();
      context.moveTo(RUNNER_PLAYER_SCREEN_X - 78 - line * 11, state.y + 8 + line * 15);
      context.lineTo(RUNNER_PLAYER_SCREEN_X - 14 + lean, state.y + 4 + line * 15);
      context.stroke();
    }
  }
  context.restore();
}

function drawPickup(context: CanvasRenderingContext2D, power: RunnerPickup, screenX: number, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  const grade = ACT_GRADES[state.actIndex];
  const breath = reducedMotion ? 0 : Math.sin(state.elapsedMs * 0.006) * 5;
  context.save();
  context.translate(screenX, power.y);
  context.shadowColor = power.kind === "phulkari-guard" ? "#e7495e" : power.kind === "chaa-overdrive" ? grade.glow : grade.energy;
  context.shadowBlur = 24;
  context.strokeStyle = context.shadowColor;
  context.lineWidth = 2;
  context.globalAlpha = 0.78;
  context.beginPath();
  context.arc(0, 0, 24 + breath, 0, Math.PI * 2);
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
  context.fillText(power.label.toUpperCase(), 0, 48, 112);
  context.restore();
}

function drawPowerAura(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion: boolean) {
  if (!state.activePower) return;
  const color = state.activePower === "phulkari-guard" ? "#e7495e" : state.activePower === "chaa-overdrive" ? "#f4b32b" : "#55d6e8";
  const breath = reducedMotion ? 0 : Math.sin(state.elapsedMs * 0.012) * 4;
  context.save();
  context.globalAlpha = 0.58;
  context.strokeStyle = color;
  context.lineWidth = 3;
  context.shadowColor = color;
  context.shadowBlur = 18;
  context.beginPath();
  context.ellipse(RUNNER_PLAYER_SCREEN_X + 27, state.y + 40, 42 + breath, 58 + breath, 0, 0, Math.PI * 2);
  context.stroke();
  context.shadowBlur = 0;
  context.restore();
}

function drawMovementFx(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  palette: RunnerPalette,
  reducedMotion: boolean,
  quality: RunnerRenderQuality,
) {
  if (reducedMotion) return;
  const grade = ACT_GRADES[state.actIndex];
  context.save();
  const trailCount = quality === "high" ? 5 : quality === "balanced" ? 3 : 2;
  for (let trail = 1; trail <= trailCount; trail += 1) {
    context.globalAlpha = 0.18 - trail * 0.02;
    context.strokeStyle = trail % 2 ? grade.energy : grade.glow;
    context.lineWidth = Math.max(1, 5 - trail * 0.65);
    context.beginPath();
    context.moveTo(RUNNER_PLAYER_SCREEN_X - trail * 17, state.y + 34 + trail * 5);
    context.lineTo(RUNNER_PLAYER_SCREEN_X - 64 - trail * 24, state.y + 34 + trail * 5);
    context.stroke();
  }
  if (state.laneTransitionMs > 0) {
    const destinationY = RUNNER_LANE_Y[state.targetLane] + PLAYER_HEIGHT / 2;
    context.globalAlpha = 0.52;
    context.strokeStyle = grade.energy;
    context.lineWidth = 3;
    context.setLineDash([8, 8]);
    context.beginPath();
    context.moveTo(RUNNER_PLAYER_SCREEN_X + PLAYER_WIDTH / 2, state.y + PLAYER_HEIGHT / 2);
    context.quadraticCurveTo(RUNNER_PLAYER_SCREEN_X + 86, (state.y + destinationY) / 2, RUNNER_PLAYER_SCREEN_X + 116, destinationY);
    context.stroke();
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

function drawFlourish(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  act: RunnerAct,
  palette: RunnerPalette,
  quality: RunnerRenderQuality,
) {
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

  const particleCount = Math.min(RUNNER_EFFECT_PARTICLE_CAP, quality === "high" ? 18 : quality === "balanced" ? 10 : 4);
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
  const settleY = Math.min(FLOOR_Y - 5, state.y + PLAYER_HEIGHT - 5);
  context.globalAlpha = 1 - progress;
  for (let index = 0; index < 8; index += 1) {
    const direction = index < 4 ? -1 : 1;
    const local = index % 4;
    pixelRect(
      context,
      RUNNER_PLAYER_SCREEN_X + PLAYER_WIDTH / 2 + direction * (18 + local * 9 + progress * 26),
      settleY - local * 3 - progress * 9,
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
  const shimmer = Math.floor(projectile.ageMs / 60) % 2;
  const color = projectile.tool === "dhaaga-arc" ? "#e7495e" : projectile.tool === "umbrella-wave" ? "#55d6e8" : grade.glow;
  context.save();
  context.shadowColor = color;
  context.shadowBlur = 18;
  if (projectile.tool === "phone-flare") {
    context.strokeStyle = color;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(screenX - 48, projectile.y);
    context.lineTo(screenX, projectile.y);
    context.stroke();
    drawDiamond(context, screenX, projectile.y, shimmer ? 15 : 12, color);
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

export function drawRunnerFrame(
  context: CanvasRenderingContext2D,
  state: RunnerState,
  palette: RunnerPalette,
  reducedMotion = false,
  spriteSheet: HTMLImageElement | null = null,
  quality: RunnerRenderQuality = "high",
) {
  const act = RUNNER_ACTS[state.actIndex];
  const ambientReduced = reducedMotion || quality === "quiet";
  context.save();
  context.imageSmoothingEnabled = true;
  context.clearRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  const impactKick = state.impactMs > 0 ? Math.sin(state.impactMs * 0.09) * RUNNER_CAMERA_SHAKE_CAP : 0;
  const cameraKick = ambientReduced ? 0 : Math.round(Math.max(-RUNNER_CAMERA_SHAKE_CAP, Math.min(RUNNER_CAMERA_SHAKE_CAP, impactKick)));
  context.translate(cameraKick, Math.abs(cameraKick) * 0.28);
  drawSky(context, state, palette, ambientReduced);
  drawCityLayers(context, state, palette, ambientReduced, quality);
  drawActSetting(context, state, palette, ambientReduced);
  drawLaneTheatre(context, state, palette, quality);
  drawForeground(context, state, palette, ambientReduced);
  drawRunnerObstacles(context, state, quality);

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
  const statusLine = state.failed
    ? "ROUTE WIPED"
    : state.activeComplication
    ? state.activeComplication.replaceAll("-", " ").toUpperCase()
    : state.activePower
      ? state.activePower.replaceAll("-", " ").toUpperCase()
      : "ACTION READY";
  context.fillText(statusLine, RUNNER_WIDTH - 30, 58);

  for (const candidate of act.complications) {
    if (state.encounteredComplicationIds.includes(candidate.id)) continue;
    const screenX = runnerWorldToScreen(candidate.x, state.worldX);
    if (screenX > -120 && screenX < RUNNER_WIDTH + 120) drawComplicationGate(context, candidate, screenX, state, palette, ambientReduced);
  }

  for (const candidate of act.targets) {
    const screenX = runnerWorldToScreen(candidate.x, state.worldX);
    if (screenX > -candidate.width - 20 && screenX < RUNNER_WIDTH + 20) {
      drawTarget(context, candidate, screenX, state.transformedTargetIds.includes(candidate.id), palette, quality);
    }
  }
  for (const power of act.pickups) {
    if (state.collectedPickupIds.includes(power.id)) continue;
    const screenX = runnerWorldToScreen(power.x, state.worldX);
    if (screenX > -100 && screenX < RUNNER_WIDTH + 100) drawPickup(context, power, screenX, state, palette, ambientReduced);
  }
  for (const projectile of state.projectiles) {
    drawSpark(context, projectile, state, palette);
  }
  drawMovementFx(context, state, palette, reducedMotion, quality);
  drawPowerAura(context, state, palette, ambientReduced);
  drawComplicationAura(context, state, palette, ambientReduced);
  if (!reducedMotion) {
    drawFlourish(context, state, act, palette, quality);
    drawImpact(context, state, act, palette);
    drawLandingDust(context, state, palette);
  }
  drawPerson(context, state, act.lead, palette, spriteSheet, ambientReduced);
  drawCinematicGrade(context, state);

  if (state.failed) {
    const wash = context.createLinearGradient(0, 0, RUNNER_WIDTH, 0);
    wash.addColorStop(0, "#080b14b8");
    wash.addColorStop(0.48, "#080b1440");
    wash.addColorStop(1, "#080b14d1");
    context.fillStyle = wash;
    context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
    context.fillStyle = palette.accent;
    context.font = `700 12px ${palette.fontMono}`;
    context.textAlign = "right";
    context.fillText("LANE CONTACT · CURTAIN HELD", RUNNER_WIDTH - 30, RUNNER_HEIGHT - 28);
  }

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
