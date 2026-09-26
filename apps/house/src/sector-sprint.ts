/** Original Chandigarh homecoming. Pure movement, navigation and authored encounters. */
export const WORLD_WIDTH = 1536;
export const WORLD_HEIGHT = 1024;
export const JOURNEY_BOUNDARY_MS = 600_000;
export const WALK_SPEED = 112;
export const GRID = 12;
export const CITY_FACTS = Object.freeze([
  "Sector 17 is Chandigarh's city-centre district and includes a large pedestrian plaza.",
  "The numbered-sector plan uses broad roads, neighborhood markets and green space to make each sector a self-contained unit.",
  "This playable route compresses distance and adds fictional people and a courtyard toy; it is not a navigation map.",
]);
export type Point = { x: number; y: number };
export type PlaceId = "plaza" | "market" | "roses" | "craft" | "lake" | "home";
export type Keepsake = "paper" | "route" | "spring" | "wayfinder";
export type Encounter = {
  id: PlaceId;
  title: string;
  district: string;
  person: string;
  point: Point;
  color: string;
  item?: Keepsake;
  itemLabel?: string;
  introduction: string;
  choices: readonly [string, string];
  replies: readonly [string, string];
};
export const PLACES: readonly Encounter[] = [
  {
    id: "plaza",
    title: "A paper city needs carrying",
    district: "Sector 22 · home verandah",
    person: "Gurpreet",
    point: { x: 310, y: 946 },
    color: "#285e77",
    introduction:
      "Gurpreet's folded paper display has come loose before it reaches the Sector 17 plaza. The brass tabs need finding along the route from Sector 22.",
    choices: ["Carry the paper city", "Show me the route first"],
    replies: [
      "The paper city rests under your arm. Start at the market verandah, then choose the shaded street or the raised sign route.",
      "Open City map for the five encounter route. Tap a stop to walk, or use the arrow keys. Nothing moves you without your say.",
    ],
  },
  {
    id: "market",
    title: "Leave the verandah",
    district: "Sector 22 · market verandahs",
    person: "Simran · sign painter",
    point: { x: 1237, y: 666 },
    color: "#bb7047",
    item: "paper",
    itemLabel: "Repaired paper display",
    introduction:
      "Simran presses the first brass tab into Gurpreet's folded display. “The verandahs keep this shopping street shaded. Try the jump marks before you leave.”",
    choices: ["Cross the verandah course", "Ask Simran to set the tab"],
    replies: [
      "You cross the market awnings and set the tab yourself. The paper city holds its shape.",
      "Simran sets the same brass tab and traces the next street on the paper. You leave with the same repaired display.",
    ],
  },
  {
    id: "roses",
    title: "Choose a way through",
    district: "Sector 22 · neighborhood crossing",
    person: "Meher · cycle mechanic",
    point: { x: 253, y: 183 },
    color: "#b5526a",
    item: "route",
    itemLabel: "Chosen route",
    introduction:
      "The route splits beside Meher's cycle stand. The shaded street is level; the raised sign route asks for spring jumps. Both lead to the same courtyard.",
    choices: ["Take the raised sign route", "Take the shaded street"],
    replies: [
      "You read the sector markers above the street and land beside the courtyard gate.",
      "You follow the shade beneath the trees and arrive at the same courtyard gate.",
    ],
  },
  {
    id: "craft",
    title: "The wind-up courtyard toy",
    district: "Between sectors · fictional courtyard",
    person: "Iqbal · repairer",
    point: { x: 755, y: 267 },
    color: "#7774a6",
    item: "spring",
    itemLabel: "Courtyard spring",
    introduction:
      "A fictional brass toy blocks the gate. Its paper arm flashes before it rolls a harmless cork ball. Three well-timed scarf deflections will unwind it.",
    choices: ["Read and deflect its three signals", "Let Iqbal hold the toy still"],
    replies: [
      "The final cork ball returns to the toy. Its spring relaxes and the courtyard gate opens.",
      "Iqbal holds the toy while you release the same spring. The gate opens without timing or precision.",
    ],
  },
  {
    id: "lake",
    title: "Find Sector 17",
    district: "City wayfinder · Sector 17 approach",
    person: "Harjit · map reader",
    point: { x: 567, y: 480 },
    color: "#a34c55",
    item: "wayfinder",
    itemLabel: "Aligned wayfinder",
    introduction:
      "Harjit points to the city wayfinder. “Sector 17 is Chandigarh's city centre. Turn the paper grid until its heart faces the plaza.”",
    choices: ["Align Sector 17 at the city heart", "Align it together"],
    replies: [
      "The sector grid clicks into place. The plaza fountain appears at the end of the concourse.",
      "Harjit turns one edge while you turn the other. The same plaza route appears.",
    ],
  },
  {
    id: "home",
    title: "Paper in the plaza",
    district: "Sector 17 · city-centre plaza",
    person: "Harjit · Ma",
    point: { x: 730, y: 594 },
    color: "#d9a951",
    introduction:
      "The wide pedestrian plaza opens around the fountain. Gurpreet's repaired paper city stands upright beside the real city centre.",
    choices: [
      "Set the paper city by the fountain",
      "Tell the route before setting it down",
    ],
    replies: [
      "The last brass tab settles. Sector 22, the crossing, the courtyard and Chandigarh's city-centre heart hold together.",
      "You tell the route once, then set the display down. The paper city and the plaza finally face one another.",
    ],
  },
];
export type Power = "spring" | "dash" | "glide";
export const POWERUPS: readonly {
  id: Power;
  label: string;
  point: Point;
  color: string;
  description: string;
}[] = [
  {
    id: "spring",
    label: "Spring juttis",
    point: { x: 745, y: 620 },
    color: "#f0c963",
    description: "A much higher jump. Reach the floating ribbons.",
  },
  {
    id: "dash",
    label: "Monsoon scarf",
    point: { x: 624, y: 270 },
    color: "#62c4d1",
    description: "A longer dash. Slip through the moving chimes.",
  },
  {
    id: "glide",
    label: "Paper-wing pin",
    point: { x: 351, y: 183 },
    color: "#e7a4b7",
    description: "Float longer after a jump. Drift through the garden petals.",
  },
];
export const COURSE_MARKS: readonly {
  id: string;
  owner: PlaceId;
  point: Point;
  z: number;
}[] = [
  { id: "market-a", owner: "market", point: { x: 1158, y: 682 }, z: 18 },
  { id: "market-b", owner: "market", point: { x: 1224, y: 682 }, z: 34 },
  { id: "market-c", owner: "market", point: { x: 1315, y: 682 }, z: 20 },
  { id: "roses-a", owner: "roses", point: { x: 414, y: 185 }, z: 20 },
  { id: "roses-b", owner: "roses", point: { x: 337, y: 185 }, z: 35 },
  { id: "roses-c", owner: "roses", point: { x: 257, y: 185 }, z: 22 },
  { id: "craft-a", owner: "craft", point: { x: 685, y: 270 }, z: 18 },
  { id: "craft-b", owner: "craft", point: { x: 772, y: 270 }, z: 36 },
  { id: "craft-c", owner: "craft", point: { x: 867, y: 270 }, z: 22 },
];
export const PLAY_OBSTACLES: readonly {
  x: number;
  y: number;
  kind: "crate" | "spring" | "roller";
}[] = [
  { x: 1190, y: 682, kind: "crate" },
  { x: 1271, y: 682, kind: "crate" },
  { x: 745, y: 583, kind: "spring" },
  { x: 300, y: 183, kind: "spring" },
  { x: 730, y: 270, kind: "roller" },
  { x: 825, y: 270, kind: "roller" },
];
export type JourneyState = {
  x: number;
  y: number;
  facing: Point;
  walking: boolean;
  stride: number;
  route: Point[];
  visited: PlaceId[];
  bag: Keepsake[];
  choices: Partial<Record<PlaceId, number>>;
  companion: boolean;
  finished: boolean;
  z: number;
  vz: number;
  power: Power | null;
  dashMs: number;
  dashCooldown: number;
  marks: string[];
  playTime: number;
  bumpMs: number;
  toyPhase: 0 | 1 | 2 | 3;
  toySignalMs: number;
  message: string;
};
export function createJourney(): JourneyState {
  return {
    x: 310,
    y: 946,
    facing: { x: 1, y: 0 },
    walking: false,
    stride: 0,
    route: [],
    visited: [],
    bag: [],
    choices: {},
    companion: false,
    finished: false,
    z: 0,
    vz: 0,
    power: null,
    dashMs: 0,
    dashCooldown: 0,
    marks: [],
    playTime: 0,
    bumpMs: 0,
    toyPhase: 0,
    toySignalMs: 950,
    message:
      "Carry the paper city to Sector 17. Start with Simran beneath the Sector 22 market verandah.",
  };
}
export function place(id: PlaceId): Encounter {
  return PLACES.find((p) => p.id === id)!;
}
// Authored walk mesh follows the original environment image. Water, buildings and beds are solid.
const corridors: readonly (readonly [
  number,
  number,
  number,
  number,
  number,
])[] = [
  [483, 40, 483, 955, 21],
  [567, 35, 567, 969, 21],
  [30, 683, 1510, 683, 24],
  [190, 954, 965, 954, 25],
  [310, 920, 310, 957, 18],
  [90, 341, 483, 341, 19],
  [101, 88, 101, 332, 17],
  [252, 88, 252, 300, 17],
  [416, 88, 416, 334, 16],
  [97, 88, 417, 88, 17],
  [98, 183, 420, 183, 28],
  [100, 294, 420, 294, 16],
  [418, 340, 483, 340, 20],
  [565, 272, 1010, 272, 39],
  [1005, 271, 1084, 304, 20],
  [1084, 304, 1148, 436, 19],
  [1130, 50, 1130, 161, 23],
  [1130, 161, 1190, 258, 22],
  [1190, 258, 1325, 348, 24],
  [1325, 348, 1507, 392, 26],
  [1148, 436, 1190, 360, 25],
  [1190, 360, 1230, 303, 24],
  [1148, 436, 1135, 683, 24],
  [567, 480, 650, 480, 26],
  [567, 609, 671, 609, 28],
  [932, 681, 932, 955, 22],
];
function segmentDistance(x: number, y: number, s: readonly number[]): number {
  const [ax, ay, bx, by] = s;
  const dx = bx - ax,
    dy = by - ay;
  const t = Math.max(
    0,
    Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)),
  );
  return Math.hypot(x - ax - t * dx, y - ay - t * dy);
}
export function walkable(x: number, y: number): boolean {
  if (x < 15 || y < 15 || x > WORLD_WIDTH - 15 || y > WORLD_HEIGHT - 15)
    return false;
  if (x > 768 && x < 900 && y > 490 && y < 564) return false; // fountain basin
  if (x > 975 && x < 1028 && y > 460 && y < 610) return false; // planted plaza island
  if (x > 636 && x < 687 && y > 489 && y < 582) return false;
  if (x >= 608 && x <= 1118 && y >= 457 && y <= 650) return true;
  return corridors.some((s) => segmentDistance(x, y, s) <= s[4]);
}
const COLS = Math.ceil(WORLD_WIDTH / GRID),
  ROWS = Math.ceil(WORLD_HEIGHT / GRID);
const mesh = Uint8Array.from({ length: COLS * ROWS }, (_, i) =>
  Number(
    walkable(
      (i % COLS) * GRID + GRID / 2,
      Math.floor(i / COLS) * GRID + GRID / 2,
    ) &&
      PLAY_OBSTACLES.every(
        (o) =>
          Math.hypot(
            (i % COLS) * GRID + GRID / 2 - o.x,
            Math.floor(i / COLS) * GRID + GRID / 2 - o.y,
          ) > (o.kind === "roller" ? 28 : 17),
      ),
  ),
);
function cellPoint(i: number): Point {
  return {
    x: (i % COLS) * GRID + GRID / 2,
    y: Math.floor(i / COLS) * GRID + GRID / 2,
  };
}
function nearest(p: Point): number {
  let best = -1,
    distance = Infinity;
  for (let i = 0; i < mesh.length; i++) {
    if (!mesh[i]) continue;
    const q = cellPoint(i);
    const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2;
    if (d < distance) {
      best = i;
      distance = d;
    }
  }
  return best;
}
/** Bounded breadth-first route over a small immutable navigation grid, only on destination input. */
export function routeTo(from: Point, to: Point): Point[] {
  const start = nearest(from),
    end = nearest(to);
  if (start < 0 || end < 0) return [];
  const parents = new Int32Array(mesh.length).fill(-1);
  const queue = new Int32Array(mesh.length);
  let head = 0,
    tail = 1;
  queue[0] = start;
  parents[start] = start;
  while (head < tail && parents[end] < 0) {
    const i = queue[head++];
    for (const n of [i - 1, i + 1, i - COLS, i + COLS]) {
      if (n < 0 || n >= mesh.length || !mesh[n] || parents[n] >= 0) continue;
      if (
        Math.abs(n - i) === 1 &&
        Math.floor(n / COLS) !== Math.floor(i / COLS)
      )
        continue;
      parents[n] = i;
      queue[tail++] = n;
    }
  }
  if (parents[end] < 0) return [];
  const route: Point[] = [];
  for (let i = end; i !== start; i = parents[i]) route.push(cellPoint(i));
  route.push(cellPoint(start));
  return route.reverse();
}
export function stepJourney(
  state: JourneyState,
  direction: Point & { jump?: boolean; dash?: boolean },
  deltaMs: number,
): JourneyState {
  if (state.finished) return state;
  const dt = Math.min(50, Math.max(0, deltaMs)) / 1000;
  let { x, y, z, vz, power } = state,
    route = state.route;
  let dashMs = Math.max(0, state.dashMs - dt * 1000),
    dashCooldown = Math.max(0, state.dashCooldown - dt * 1000),
    bumpMs = Math.max(0, state.bumpMs - dt * 1000),
    toySignalMs = state.toySignalMs,
    toyPhase = state.toyPhase,
    message = state.message;
  if (direction.jump && z === 0) {
    vz = power === "spring" ? 340 : power === "glide" ? 210 : 245;
    route = [];
  }
  const craftReady = COURSE_MARKS.filter((mark) => mark.owner === "craft").every(
    (mark) => state.marks.includes(mark.id),
  );
  const nearToy =
    craftReady &&
    !state.visited.includes("craft") &&
    Math.hypot(state.x - place("craft").point.x, state.y - place("craft").point.y) < 82;
  if (nearToy) {
    toySignalMs -= Math.min(50, Math.max(0, deltaMs));
    if (toySignalMs < -360) {
      toySignalMs = 900;
      message = "The cork ball rolls back. Watch for the paper arm to flash, then use Scarf deflect.";
    }
  }
  const toyDeflect = direction.dash && nearToy;
  if (toyDeflect) {
    route = [];
    if (toySignalMs <= 0 && toySignalMs >= -360) {
      toyPhase = Math.min(3, toyPhase + 1) as 0 | 1 | 2 | 3;
      toySignalMs = 760 - toyPhase * 70;
      message =
        toyPhase === 3
          ? "Three scarf deflections! The toy unwinds and the courtyard gate opens."
          : `Scarf deflection ${toyPhase} of 3. Read the next flash.`;
    } else {
      message = "A little early. Wait for the paper arm to flash, then deflect.";
    }
  } else if (direction.dash && dashCooldown === 0) {
    dashMs = power === "dash" ? 310 : 160;
    dashCooldown = 650;
    route = [];
  }
  const gravity = power === "glide" ? 300 : 720;
  if (vz !== 0 || z > 0) {
    z = Math.max(0, z + vz * dt - (gravity * dt * dt) / 2);
    vz = z === 0 ? 0 : vz - gravity * dt;
  }
  let dx = direction.x,
    dy = direction.y;
  const manual = dx !== 0 || dy !== 0;
  if (manual) route = [];
  if (dashMs > 0 && !manual) {
    dx = state.facing.x;
    dy = state.facing.y;
  }
  let remaining = WALK_SPEED * (dashMs > 0 ? 3.2 : 1) * dt,
    facing = state.facing,
    distance = 0;
  if (manual || dashMs > 0) {
    const length = Math.hypot(dx, dy);
    dx /= length;
    dy /= length;
    const nx = x + dx * remaining,
      ny = y + dy * remaining;
    if (walkable(nx, y)) x = nx;
    if (walkable(x, ny)) y = ny;
    distance = Math.hypot(x - state.x, y - state.y);
    if (distance > 0.01) facing = { x: dx, y: dy };
  } else {
    while (route.length && remaining > 0) {
      const target = route[0];
      dx = target.x - x;
      dy = target.y - y;
      const length = Math.hypot(dx, dy);
      if (length < 0.01) {
        route = route.slice(1);
        continue;
      }
      const amount = Math.min(length, remaining);
      facing = { x: dx / length, y: dy / length };
      x += facing.x * amount;
      y += facing.y * amount;
      distance += amount;
      remaining -= amount;
      if (amount >= length - 0.01) route = route.slice(1);
    }
  }
  const playTime = state.playTime + dt;
  for (const obstacle of PLAY_OBSTACLES) {
    const oy =
      obstacle.y +
      (obstacle.kind === "roller"
        ? Math.sin(playTime * 2 + obstacle.x) * 11
        : 0);
    if (Math.hypot(x - obstacle.x, y - oy) > 14) continue;
    if (obstacle.kind === "spring" && z < 2 && vz === 0) {
      vz = 390;
      z = 2;
      route = [];
      message =
        "Boing! Steer in the air. Your shadow shows where you will land.";
    } else if (obstacle.kind !== "spring" && z < 19 && bumpMs === 0) {
      x = state.x - facing.x * 5;
      y = state.y - facing.y * 5;
      if (!walkable(x, y)) {
        x = state.x;
        y = state.y;
      }
      route = [];
      dashMs = 0;
      bumpMs = 280;
      message = "Hop over the obstacle — Space or J. No lost progress.";
    }
  }
  for (const pickup of POWERUPS) {
    if (
      Math.hypot(x - pickup.point.x, y - pickup.point.y) < 24 &&
      power !== pickup.id
    ) {
      power = pickup.id;
      message = pickup.label + "! " + pickup.description;
    }
  }
  let next: JourneyState = {
    ...state,
    x,
    y,
    z,
    vz,
    power,
    route,
    facing,
    walking: distance > 0.01 && z === 0,
    stride: distance > 0.01 ? state.stride + distance / 8 : 0,
    dashMs,
    dashCooldown,
    playTime,
    bumpMs,
    toyPhase,
    toySignalMs,
    message,
  };
  if (toyPhase === 3 && !next.visited.includes("craft"))
    next = acceptEncounter(next, "craft", 0);
  for (const mark of COURSE_MARKS) {
    if (
      next.marks.includes(mark.id) ||
      Math.hypot(x - mark.point.x, y - mark.point.y) > 22 ||
      Math.abs(z - mark.z) > 12
    )
      continue;
    next = {
      ...next,
      marks: [...next.marks, mark.id],
      message: "Ribbon caught! Keep exploring this little course.",
    };
    if (
      COURSE_MARKS.filter((m) => m.owner === mark.owner).every((m) =>
        next.marks.includes(m.id),
      )
    ) {
      if (mark.owner === "craft") {
        next = {
          ...next,
          toySignalMs: 800,
          message:
            "The courtyard toy winds awake. Stand near it, wait for the paper arm to flash, then use Scarf deflect three times.",
        };
      } else {
        next = acceptEncounter(next, mark.owner, 0);
        next = {
          ...next,
          message:
            place(mark.owner).itemLabel +
            " is in your bag. The next Chandigarh stop is open.",
        };
      }
    }
  }
  return next;
}
export function nearby(state: Point): Encounter | undefined {
  return PLACES.find(
    (p) => Math.hypot(p.point.x - state.x, p.point.y - state.y) < 48,
  );
}
export function canMeet(state: JourneyState, id: PlaceId): boolean {
  const prerequisite: Partial<Record<PlaceId, PlaceId>> = {
    roses: "market",
    craft: "roses",
    lake: "craft",
    home: "lake",
  };
  const required = prerequisite[id];
  return !required || state.visited.includes(required);
}
export function acceptEncounter(
  state: JourneyState,
  id: PlaceId,
  choice: number,
): JourneyState {
  if (state.finished || state.visited.includes(id) || !canMeet(state, id))
    return state;
  const p = place(id);
  return {
    ...state,
    route: [],
    walking: false,
    stride: 0,
    visited: [...state.visited, id],
    bag: p.item ? [...state.bag, p.item] : state.bag,
    choices: { ...state.choices, [id]: choice === 1 ? 1 : 0 },
    companion: state.companion || id === "lake",
    finished: id === "home",
    toyPhase: id === "craft" ? 3 : state.toyPhase,
  };
}
export function completedJourney(state: JourneyState): boolean {
  return ["market", "roses", "craft", "lake", "home"].every((id) =>
    state.visited.includes(id as PlaceId),
  );
}
export function objective(state: JourneyState): string {
  if (!state.visited.includes("market"))
    return "Reach Simran under the Sector 22 market verandah and repair the paper display.";
  if (!state.visited.includes("roses"))
    return "Meet Meher at the crossing and choose the raised signs or shaded street.";
  if (!state.visited.includes("craft")) {
    const craftMarks = COURSE_MARKS.filter((mark) => mark.owner === "craft");
    if (!craftMarks.every((mark) => state.marks.includes(mark.id)))
      return "Follow the courtyard signals. Catch the three blue paper marks.";
    return `Courtyard toy: ${state.toyPhase} of 3 scarf deflections. Wait for its paper arm to flash.`;
  }
  if (!state.visited.includes("lake"))
    return "Ask Harjit at the wayfinder to align Sector 17 at the city-centre heart.";
  if (!state.finished)
    return "Enter the Sector 17 pedestrian plaza and set the paper city beside the fountain.";
  return "The paper city has reached Sector 17.";
}
