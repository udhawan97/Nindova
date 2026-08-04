export const RUNNER_ACT_SECONDS = 32;
export const RUNNER_SESSION_SECONDS = 240;
export const RUNNER_WIDTH = 960;
export const RUNNER_HEIGHT = 432;

export type RunnerLead = "son" | "mother" | "duo";
export type RunnerTargetKind =
  | "missed-call"
  | "price-tag"
  | "puddle-splash"
  | "produce-basket"
  | "traffic-bubble"
  | "streamer"
  | "grocery-list";

export const RUNNER_TARGET_KINDS: readonly RunnerTargetKind[] = [
  "missed-call",
  "price-tag",
  "puddle-splash",
  "produce-basket",
  "traffic-bubble",
  "streamer",
  "grocery-list",
] as const;

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

export type RunnerAct = {
  id: string;
  title: string;
  location: string;
  sign: string;
  lead: RunnerLead;
  opening: string;
  houseCall: string;
  sparkLabel: string;
  praise: string;
  closing: string;
  storyBeats: readonly string[];
  targets: readonly RunnerTarget[];
};

export type RunnerProjectile = { x: number; y: number };

export type RunnerState = {
  actIndex: number;
  elapsedMs: number;
  worldX: number;
  y: number;
  velocityY: number;
  grounded: boolean;
  paused: boolean;
  finished: boolean;
  projectiles: RunnerProjectile[];
  transformedTargetIds: string[];
  encounteredTargetIds: string[];
  message: string;
  flourishMs: number;
  lastTransformedTargetId: string | null;
};

export type RunnerInput = { jump?: boolean; spark?: boolean };

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
};

const FLOOR_Y = 350;
const PLAYER_HEIGHT = 58;
export const RUNNER_PLAYER_SCREEN_X = 176;
const WORLD_LENGTH = 4_080;
const GRAVITY = 2_120;
const JUMP_VELOCITY = -790;
const PROJECTILE_SPEED = 540;

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

export const RUNNER_ACTS: readonly RunnerAct[] = [
  {
    id: "ghar-wapsi",
    title: "Ghar Wapsi",
    location: "Sector 22 · the late-return lane",
    sign: "SECTOR 22",
    lead: "son",
    opening: "Gurpreet is an adult with a key, a plan, and twelve missed calls from home.",
    houseCall: "Harjit’s voice note: ‘Beta, the roti has cooled twice. Bring your explanation warm.’",
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
  },
  {
    id: "sabzi-command",
    title: "Sabzi Command",
    location: "Sector 26 · morning mandi",
    sign: "SECTOR 26",
    lead: "mother",
    opening: "Gurpreet’s mother, Harjit, takes the market route with exact change and the calm authority of a cabinet minister.",
    houseCall: "House message: ‘Bhindi, tomatoes, dhania—and do not let one dramatic price tag write the budget.’",
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
  },
  {
    id: "baraat-detour",
    title: "Baraat Detour",
    location: "Sector 17 · the festive crossing",
    sign: "SECTOR 17",
    lead: "duo",
    opening: "Gurpreet and Harjit meet a cheerful road-wide celebration. Going around is now the family strategy.",
    houseCall: "Joint decision: ‘Respect the dhol. Also respect that the paneer is waiting.’",
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
  },
  {
    id: "monsoon-protocol",
    title: "Monsoon Protocol",
    location: "Madhya Marg · rain with opinions",
    sign: "MADHYA MARG",
    lead: "duo",
    opening: "The rain has arrived sideways. Harjit and Gurpreet’s umbrella has entered coalition government.",
    houseCall: "Harjit: ‘We are not fighting the rain. We are negotiating with its paperwork.’",
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
  },
  {
    id: "roti-relay",
    title: "Roti Relay",
    location: "The home lane · dinner approach",
    sign: "GHAR THIS WAY",
    lead: "duo",
    opening: "One bag, two umbrellas, and a dinner that has waited with admirable restraint.",
    houseCall: "Family bulletin: ‘Come home safely. The rotis can be reheated; your filmi entrance cannot.’",
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
    paused: false,
    finished: false,
    projectiles: [],
    transformedTargetIds: [],
    encounteredTargetIds: [],
    message: RUNNER_ACTS[actIndex].opening,
    flourishMs: 0,
    lastTransformedTargetId: null,
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
  };
  if (state.finished || state.paused) return state;
  const stepMs = Math.max(0, Math.min(deltaMs, 50));
  state.flourishMs = Math.max(0, state.flourishMs - stepMs);
  const dt = stepMs / 1_000;
  if (input.jump && state.grounded) {
    state.velocityY = JUMP_VELOCITY;
    state.grounded = false;
    state.message = "Clean jump. The city keeps moving.";
  }
  if (input.spark && state.projectiles.length < 4) {
    state.projectiles.push({ x: state.worldX + RUNNER_PLAYER_SCREEN_X + 46, y: state.y + 24 });
    state.message = `${RUNNER_ACTS[state.actIndex].sparkLabel}.`;
  }
  state.elapsedMs = Math.min(RUNNER_ACT_SECONDS * 1_000, state.elapsedMs + stepMs);
  state.worldX = WORLD_LENGTH * (state.elapsedMs / (RUNNER_ACT_SECONDS * 1_000));
  state.velocityY += GRAVITY * dt;
  state.y += state.velocityY * dt;
  const restingY = FLOOR_Y - PLAYER_HEIGHT;
  if (state.y >= restingY) {
    state.y = restingY;
    state.velocityY = 0;
    state.grounded = true;
  }
  state.projectiles = state.projectiles
    .map((projectile) => ({ ...projectile, x: projectile.x + PROJECTILE_SPEED * dt }))
    .filter((projectile) => projectile.x < state.worldX + RUNNER_WIDTH + 100);

  const act = RUNNER_ACTS[state.actIndex];
  for (const candidate of act.targets) {
    if (!state.transformedTargetIds.includes(candidate.id)) {
      const hit = state.projectiles.find((projectile) => overlaps(
        { x: projectile.x, y: projectile.y - 48, width: 18, height: 96 },
        candidate,
      ));
      if (hit) {
        state.transformedTargetIds.push(candidate.id);
        state.projectiles = state.projectiles.filter((projectile) => projectile !== hit);
        state.message = candidate.sparkQuip;
        state.flourishMs = 720;
        state.lastTransformedTargetId = candidate.id;
      }
    }
    if (!state.encounteredTargetIds.includes(candidate.id) && !state.transformedTargetIds.includes(candidate.id)) {
      const playerWorld = { x: state.worldX + RUNNER_PLAYER_SCREEN_X, y: state.y, width: 44, height: PLAYER_HEIGHT };
      if (overlaps(playerWorld, candidate)) {
        state.encounteredTargetIds.push(candidate.id);
        state.message = candidate.collisionQuip;
      }
    }
  }
  if (state.elapsedMs >= RUNNER_ACT_SECONDS * 1_000) {
    state.finished = true;
    state.message = act.closing;
  }
  return state;
}

function pixelRect(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, color: string) {
  context.fillStyle = color;
  context.fillRect(Math.round(x), Math.round(y), Math.round(width), Math.round(height));
}

function drawTarget(context: CanvasRenderingContext2D, candidate: RunnerTarget, screenX: number, transformed: boolean, palette: RunnerPalette) {
  const x = Math.round(screenX);
  const y = candidate.y;
  const ink = transformed ? palette.jade : palette.accent;
  context.save();
  context.translate(x, y);
  context.fillStyle = transformed ? palette.paper3 : palette.paper2;
  context.strokeStyle = ink;
  context.lineWidth = 3;

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
    for (let strip = 0; strip < 4; strip += 1) pixelRect(context, strip * 22, transformed ? strip * 20 : 0, 8, candidate.height - strip * 20, ink);
  } else if (candidate.kind === "produce-basket") {
    pixelRect(context, 0, 18, candidate.width, candidate.height - 18, palette.accentSoft);
    for (let item = 0; item < 4; item += 1) {
      context.fillStyle = transformed ? palette.jade : palette.ruby;
      context.beginPath();
      context.arc(18 + item * 22, transformed ? 22 : 8 + (item % 2) * 10, 10, 0, Math.PI * 2);
      context.fill();
    }
  } else {
    context.fillRect(0, 0, candidate.width, candidate.height);
    context.strokeRect(0, 0, candidate.width, candidate.height);
  }

  if (candidate.kind !== "streamer" && candidate.kind !== "puddle-splash") {
    context.fillStyle = transformed ? palette.ink : palette.inkSoft;
    context.font = "700 13px ui-monospace, monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const label = transformed ? candidate.transformedLabel : candidate.label;
    context.fillText(label, candidate.width / 2, candidate.height / 2, candidate.width - 10);
  }
  context.restore();
}

function drawPerson(context: CanvasRenderingContext2D, state: RunnerState, lead: RunnerLead, palette: RunnerPalette) {
  const x = RUNNER_PLAYER_SCREEN_X;
  const y = state.y;
  const cloth = lead === "mother" ? palette.ruby : lead === "duo" ? palette.jade : palette.sapphire;
  const stride = Math.floor(state.elapsedMs / 130) % 2 === 0 ? 0 : 5;
  pixelRect(context, x + 12, y, 22, 18, palette.inkSoft);
  pixelRect(context, x + 8, y + 18, 30, 25, cloth);
  pixelRect(context, x + 8, y + 43, 9, 15 - stride, palette.accent);
  pixelRect(context, x + 29, y + 43, 9, 10 + stride, palette.accent);
  pixelRect(context, x + 38, y + 23, 11, 7, palette.inkSoft);
  if (lead === "mother") pixelRect(context, x + 4, y + 6, 7, 30, palette.accent);
  if (lead === "duo") {
    pixelRect(context, x - 22, y + 12, 17, 14, palette.inkSoft);
    pixelRect(context, x - 26, y + 26, 25, 28, palette.sapphire);
  }
}

function drawActSetting(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette) {
  const drift = (state.worldX * 0.5) % 240;
  if (state.actIndex === 1) {
    for (let x = -240; x < RUNNER_WIDTH + 240; x += 240) {
      const stallX = x - drift;
      pixelRect(context, stallX, 250, 168, 12, palette.ruby);
      pixelRect(context, stallX + 12, 262, 144, 42, palette.paper2);
      for (let basket = 0; basket < 4; basket += 1) pixelRect(context, stallX + 20 + basket * 32, 282, 22, 16, basket % 2 ? palette.jade : palette.accent);
    }
  } else if (state.actIndex === 2) {
    for (let x = -80; x < RUNNER_WIDTH + 80; x += 110) {
      const ribbonX = x - ((state.worldX * 0.42) % 110);
      context.strokeStyle = x % 220 === 0 ? palette.ruby : palette.accent;
      context.lineWidth = 5;
      context.beginPath();
      context.moveTo(ribbonX, 158);
      context.quadraticCurveTo(ribbonX + 28, 210, ribbonX + 56, 166);
      context.stroke();
    }
  } else if (state.actIndex === 3) {
    context.strokeStyle = palette.sapphire;
    context.lineWidth = 2;
    for (let rain = 0; rain < 38; rain += 1) {
      const rainX = (rain * 43 - (state.worldX * 1.2) % 43 + RUNNER_WIDTH) % RUNNER_WIDTH;
      context.beginPath();
      context.moveTo(rainX, 112 + (rain % 7) * 28);
      context.lineTo(rainX - 14, 138 + (rain % 7) * 28);
      context.stroke();
    }
  } else if (state.actIndex === 4) {
    pixelRect(context, 748, 214, 164, 136, palette.paper3);
    pixelRect(context, 780, 246, 30, 42, palette.accentSoft);
    pixelRect(context, 848, 246, 30, 42, palette.accentSoft);
    pixelRect(context, 816, 300, 34, 50, palette.accent);
    context.strokeStyle = palette.accent;
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(730, 214);
    context.lineTo(830, 154);
    context.lineTo(930, 214);
    context.stroke();
  }
}

function drawFlourish(context: CanvasRenderingContext2D, state: RunnerState, act: RunnerAct, palette: RunnerPalette) {
  if (state.flourishMs <= 0 || !state.lastTransformedTargetId) return;
  const candidate = act.targets.find((target) => target.id === state.lastTransformedTargetId);
  if (!candidate) return;
  const centerX = runnerWorldToScreen(candidate.x, state.worldX) + candidate.width / 2;
  const centerY = candidate.y + candidate.height / 2;
  const reach = 28 + (720 - state.flourishMs) * 0.035;
  context.save();
  context.translate(centerX, centerY);
  context.rotate(Math.PI / 4);
  context.strokeStyle = palette.accent;
  context.lineWidth = 3;
  context.strokeRect(-reach / 2, -reach / 2, reach, reach);
  context.strokeStyle = palette.jade;
  context.strokeRect(-reach / 3, -reach / 3, reach * 0.66, reach * 0.66);
  context.restore();
}

export function drawRunnerFrame(context: CanvasRenderingContext2D, state: RunnerState, palette: RunnerPalette, reducedMotion = false) {
  const act = RUNNER_ACTS[state.actIndex];
  context.save();
  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
  context.fillStyle = palette.paper;
  context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);

  const parallax = state.worldX * 0.16;
  context.fillStyle = palette.sapphire;
  context.beginPath();
  context.moveTo(0, 152);
  for (let x = -120; x <= RUNNER_WIDTH + 120; x += 120) {
    const peak = x - (parallax % 120);
    context.lineTo(peak + 60, 80 + ((x / 120) % 2) * 24);
    context.lineTo(peak + 120, 152);
  }
  context.lineTo(RUNNER_WIDTH, 220);
  context.lineTo(0, 220);
  context.closePath();
  context.fill();

  const buildingOffset = (state.worldX * 0.34) % 190;
  for (let x = -190; x < RUNNER_WIDTH + 190; x += 190) {
    const bx = x - buildingOffset;
    pixelRect(context, bx, 158, 148, 142, palette.paper3);
    for (let windowIndex = 0; windowIndex < 5; windowIndex += 1) {
      pixelRect(context, bx + 18 + windowIndex * 24, 182, 9, 82, windowIndex % 2 === 0 ? palette.rule : palette.paper2);
    }
  }

  pixelRect(context, 0, FLOOR_Y, RUNNER_WIDTH, 82, palette.paper2);
  pixelRect(context, 0, FLOOR_Y, RUNNER_WIDTH, 4, palette.accent);
  for (let road = -80; road < RUNNER_WIDTH + 80; road += 150) {
    pixelRect(context, road - ((state.worldX * 0.9) % 150), FLOOR_Y + 40, 72, 5, palette.rule);
  }

  pixelRect(context, 34, 30, 138, 54, palette.paper2);
  context.strokeStyle = palette.accent;
  context.lineWidth = 2;
  context.strokeRect(34, 30, 138, 54);
  context.fillStyle = palette.ink;
  context.font = "700 14px ui-monospace, monospace";
  context.textAlign = "center";
  context.fillText(act.sign, 103, 63);

  drawActSetting(context, state, palette);

  for (const candidate of act.targets) {
    const screenX = runnerWorldToScreen(candidate.x, state.worldX);
    if (screenX > -candidate.width - 20 && screenX < RUNNER_WIDTH + 20) {
      drawTarget(context, candidate, screenX, state.transformedTargetIds.includes(candidate.id), palette);
    }
  }
  for (const projectile of state.projectiles) {
    const screenX = runnerWorldToScreen(projectile.x, state.worldX);
    pixelRect(context, screenX, projectile.y, 18, 10, palette.accent);
    pixelRect(context, screenX + 4, projectile.y + 3, 10, 4, palette.ink);
  }
  if (!reducedMotion) drawFlourish(context, state, act, palette);
  drawPerson(context, state, act.lead, palette);

  if (state.paused) {
    context.globalAlpha = 0.72;
    context.fillStyle = palette.paper2;
    context.fillRect(0, 0, RUNNER_WIDTH, RUNNER_HEIGHT);
    context.globalAlpha = 1;
  }
  context.restore();
}
