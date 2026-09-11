/** Original Chandigarh homecoming. Pure movement, navigation and authored encounters. */
export const WORLD_WIDTH = 1536;
export const WORLD_HEIGHT = 1024;
export const JOURNEY_BOUNDARY_MS = 600_000;
export const WALK_SPEED = 112;
export const GRID = 12;
export type Point = { x: number; y: number };
export type PlaceId = "plaza" | "market" | "roses" | "craft" | "lake" | "home";
export type Keepsake = "sabzi" | "sketch" | "mosaic" | "book";
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
    title: "An afternoon to bring home",
    district: "Sector 17 · the plaza",
    person: "Gurpreet",
    point: { x: 730, y: 594 },
    color: "#285e77",
    introduction:
      "Ma is waiting by Sukhna. The market has our vegetables ready. There is time to take the garden paths, say hello, and bring a little of the city home.",
    choices: ["Take the long way", "Show me around"],
    replies: [
      "The fountain catches the afternoon light. Your feet, your route.",
      "Open City map to choose a place. Tap a path to walk, or use the arrow keys. Nothing moves you without your say.",
    ],
  },
  {
    id: "market",
    title: "The bag with the good handle",
    district: "Sector 22 · market verandahs",
    person: "Simran · the neighbor",
    point: { x: 1237, y: 666 },
    color: "#bb7047",
    item: "sabzi",
    itemLabel: "Market bag",
    introduction:
      "“Harjit said you would come by. Tomatoes on top, please. I have finally tied that handle properly.” A cloth bag waits beside the baskets.",
    choices: ["Pack the tomatoes carefully", "Ask about the cloth handle"],
    replies: [
      "“Exactly. No tomato chutney before we reach the kitchen.” You tuck the vegetables into the repaired bag.",
      "“An old dupatta. Still useful.” Simran shows you the knot, then hands over the vegetables.",
    ],
  },
  {
    id: "roses",
    title: "A rose that stays in the garden",
    district: "Sector 16 · Rose Garden",
    person: "Meher · the gardener",
    point: { x: 253, y: 183 },
    color: "#b5526a",
    item: "sketch",
    itemLabel: "Rose sketch",
    introduction:
      "Meher has found your mother’s little sketchbook on the bench. “One more drawing before you take it back? The flowers can stay where they are.”",
    choices: ["Sketch the pink roses", "Sketch the golden roses"],
    replies: [
      "You draw a loose pink spiral and a pair of leaves. The real roses stay in their bed.",
      "You shade a golden bloom. “She will know exactly which corner you stopped at,” Meher says.",
    ],
  },
  {
    id: "craft",
    title: "Something useful again",
    district: "Rock Garden · a fictional craft table",
    person: "Iqbal · the artisan",
    point: { x: 755, y: 267 },
    color: "#7774a6",
    item: "mosaic",
    itemLabel: "Mosaic coaster",
    introduction:
      "At a small craft table, Iqbal sets out three spare tiles. “For a cup at home, not a museum.” None of these pieces comes from the garden’s artworks.",
    choices: ["Arrange a river-blue pattern", "Arrange with Iqbal"],
    replies: [
      "Blue pieces make a little river around the center tile. Iqbal wraps your finished coaster in paper.",
      "Together you turn the pieces into a simple river pattern. Iqbal wraps the same little coaster for the journey.",
    ],
  },
  {
    id: "lake",
    title: "Meet me by the water",
    district: "Sukhna Lake · the promenade",
    person: "Harjit · Ma",
    point: { x: 1230, y: 304 },
    color: "#a34c55",
    item: "book",
    itemLabel: "Ma’s borrowed book",
    introduction:
      "Harjit watches the boats rock against their ropes. “You took the long way. Good.” She holds out the book she borrowed. “Shall we take this home together?”",
    choices: ["Tell her about the afternoon", "Sit together for a moment"],
    replies: [
      "You trade the small stories of the afternoon. Harjit puts the book in your bag and joins you for the walk home.",
      "For a moment there is only the water. Then Harjit smiles, hands you the book, and walks beside you.",
    ],
  },
  {
    id: "home",
    title: "Ghar wapsi",
    district: "Sector 22 · home",
    person: "Harjit · Ma",
    point: { x: 310, y: 946 },
    color: "#d9a951",
    introduction:
      "The front light is on. Through the open door: a kettle, two cups, and somewhere to put down the bag. Chandigarh can keep the rest of the afternoon.",
    choices: [
      "Put the bag down. We’re home.",
      "Tell one last story at the door",
    ],
    replies: [
      "The things you brought find their places. The kettle is already on. You are home.",
      "You linger over one last little story, then step inside. The kettle is already on. You are home.",
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
  message: string;
};
export function createJourney(): JourneyState {
  return {
    x: 720,
    y: 600,
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
    message:
      "Jump with Space or J. Dash with Shift or K. Try the golden spring juttis beside you.",
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
    message = state.message;
  if (direction.jump && z === 0) {
    vz = power === "spring" ? 340 : power === "glide" ? 210 : 245;
    route = [];
  }
  if (direction.dash && dashCooldown === 0) {
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
    message,
  };
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
      next = acceptEncounter(next, mark.owner, 0);
      next = {
        ...next,
        message:
          place(mark.owner).itemLabel +
          " is in your bag. A little of the city to take home.",
      };
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
  return (
    id !== "lake" ||
    ["market", "roses", "craft"].every((p) =>
      state.visited.includes(p as PlaceId),
    )
  );
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
  };
}
export function completedJourney(state: JourneyState): boolean {
  return ["market", "roses", "craft", "lake", "home"].every((id) =>
    state.visited.includes(id as PlaceId),
  );
}
export function objective(state: JourneyState): string {
  if (
    !["market", "roses", "craft"].every((id) =>
      state.visited.includes(id as PlaceId),
    )
  )
    return "Jump for the market ribbons, garden petals and courtyard chimes. Find power-ups along the way.";
  if (!state.companion) return "Meet Ma on the Sukhna promenade.";
  return "Walk home together. Sector 22 is waiting.";
}
