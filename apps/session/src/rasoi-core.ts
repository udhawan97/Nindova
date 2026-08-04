export const RASOI_RECIPE_VERSION = 5;

export const RASOI_MOTIFS = Object.freeze([
  Object.freeze({ id: "belan", label: "belan rolling pin" }),
  Object.freeze({ id: "chakla", label: "chakla rolling board" }),
  Object.freeze({ id: "tawa", label: "tawa griddle" }),
  Object.freeze({ id: "chimta", label: "chimta tongs" }),
  Object.freeze({ id: "katori", label: "steel katori bowl" }),
  Object.freeze({ id: "tiffin", label: "steel tiffin" }),
  Object.freeze({ id: "masala", label: "masala dabba" }),
  Object.freeze({ id: "chai", label: "chai glass" }),
  Object.freeze({ id: "cooker", label: "pressure cooker" }),
] as const);

export type RasoiMotifId = (typeof RASOI_MOTIFS)[number]["id"];
export type RasoiProfileId = "gentle" | "deeper";

export const RASOI_PROFILES = Object.freeze([
  Object.freeze({
    id: "gentle" as const,
    label: "Gentle stack",
    description: "Broader openings across three woven layers.",
    layers: 3,
  }),
  Object.freeze({
    id: "deeper" as const,
    label: "Deeper stack",
    description: "A triple-crown mound with four tight layers and fewer openings.",
    layers: 4,
  }),
] as const);

export interface RasoiTile {
  readonly id: string;
  /** Legacy debug aliases retained for the version 1 window.__ct contract. */
  readonly row: number;
  readonly slot: number;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
  readonly layer: number;
  readonly motif: RasoiMotifId;
}

export interface RasoiBoard {
  readonly id: string;
  readonly recipeVersion: number;
  readonly profile: RasoiProfileId;
  readonly motifOrder: readonly RasoiMotifId[];
  readonly tiles: readonly RasoiTile[];
}

export interface BoardVerification {
  readonly valid: boolean;
  readonly reachableStates: number;
  readonly terminalStates: number;
  readonly deadStates: number;
  readonly reason: string;
}

const ROWS = 3;
const SLOTS_PER_ROW = 12;

export type TileAvailability = "free" | "covered" | "side-blocked" | "removed" | "missing";

interface LayoutTile {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly layer: number;
  readonly motifIndex: number;
}

const GENTLE_LAYOUT: readonly LayoutTile[] = Object.freeze([
  { id: "b0-0", x: 0, y: 0, layer: 0, motifIndex: 3 },
  { id: "b0-1", x: 2, y: 0, layer: 0, motifIndex: 6 },
  { id: "b0-2", x: 4, y: 0, layer: 0, motifIndex: 6 },
  { id: "b0-3", x: 6, y: 0, layer: 0, motifIndex: 7 },
  { id: "b0-4", x: 8, y: 0, layer: 0, motifIndex: 2 },
  { id: "b0-5", x: 10, y: 0, layer: 0, motifIndex: 0 },
  { id: "b1-0", x: 0, y: 2, layer: 0, motifIndex: 7 },
  { id: "b1-1", x: 2, y: 2, layer: 0, motifIndex: 5 },
  { id: "b1-2", x: 4, y: 2, layer: 0, motifIndex: 5 },
  { id: "b1-3", x: 6, y: 2, layer: 0, motifIndex: 8 },
  { id: "b1-4", x: 8, y: 2, layer: 0, motifIndex: 2 },
  { id: "b1-5", x: 10, y: 2, layer: 0, motifIndex: 1 },
  { id: "b2-0", x: 0, y: 4, layer: 0, motifIndex: 1 },
  { id: "b2-1", x: 2, y: 4, layer: 0, motifIndex: 6 },
  { id: "b2-2", x: 4, y: 4, layer: 0, motifIndex: 8 },
  { id: "b2-3", x: 6, y: 4, layer: 0, motifIndex: 0 },
  { id: "b2-4", x: 8, y: 4, layer: 0, motifIndex: 8 },
  { id: "b2-5", x: 10, y: 4, layer: 0, motifIndex: 3 },
  { id: "b3-0", x: 0, y: 6, layer: 0, motifIndex: 4 },
  { id: "b3-1", x: 2, y: 6, layer: 0, motifIndex: 3 },
  { id: "b3-2", x: 4, y: 6, layer: 0, motifIndex: 8 },
  { id: "b3-3", x: 6, y: 6, layer: 0, motifIndex: 4 },
  { id: "b3-4", x: 8, y: 6, layer: 0, motifIndex: 0 },
  { id: "b3-5", x: 10, y: 6, layer: 0, motifIndex: 2 },
  { id: "m0-0", x: 1, y: 1, layer: 1, motifIndex: 6 },
  { id: "m0-1", x: 3, y: 1, layer: 1, motifIndex: 4 },
  { id: "m0-2", x: 5, y: 1, layer: 1, motifIndex: 5 },
  { id: "m0-3", x: 7, y: 1, layer: 1, motifIndex: 3 },
  { id: "m1-0", x: 3, y: 5, layer: 1, motifIndex: 2 },
  { id: "m1-1", x: 5, y: 5, layer: 1, motifIndex: 5 },
  { id: "m1-2", x: 7, y: 5, layer: 1, motifIndex: 1 },
  { id: "m1-3", x: 9, y: 5, layer: 1, motifIndex: 7 },
  { id: "t-0", x: 2, y: 3, layer: 2, motifIndex: 0 },
  { id: "t-1", x: 4, y: 3, layer: 2, motifIndex: 1 },
  { id: "t-2", x: 6, y: 3, layer: 2, motifIndex: 7 },
  { id: "t-3", x: 8, y: 3, layer: 2, motifIndex: 4 },
].map((tile) => Object.freeze(tile)));

const DEEPER_LAYOUT: readonly LayoutTile[] = Object.freeze([
  { id: "b0-0", x: 0, y: 0, layer: 0, motifIndex: 6 },
  { id: "b0-1", x: 2, y: 0, layer: 0, motifIndex: 0 },
  { id: "b0-2", x: 4, y: 0, layer: 0, motifIndex: 5 },
  { id: "b0-3", x: 6, y: 0, layer: 0, motifIndex: 0 },
  { id: "b0-4", x: 8, y: 0, layer: 0, motifIndex: 6 },
  { id: "b1-0", x: 0, y: 2, layer: 0, motifIndex: 7 },
  { id: "b1-1", x: 2, y: 2, layer: 0, motifIndex: 6 },
  { id: "b1-2", x: 4, y: 2, layer: 0, motifIndex: 5 },
  { id: "b1-3", x: 6, y: 2, layer: 0, motifIndex: 6 },
  { id: "b1-4", x: 8, y: 2, layer: 0, motifIndex: 7 },
  { id: "b2-0", x: 0, y: 4, layer: 0, motifIndex: 2 },
  { id: "b2-1", x: 2, y: 4, layer: 0, motifIndex: 1 },
  { id: "b2-2", x: 4, y: 4, layer: 0, motifIndex: 3 },
  { id: "b2-3", x: 6, y: 4, layer: 0, motifIndex: 1 },
  { id: "b2-4", x: 8, y: 4, layer: 0, motifIndex: 2 },
  { id: "b3-0", x: 0, y: 6, layer: 0, motifIndex: 4 },
  { id: "b3-1", x: 2, y: 6, layer: 0, motifIndex: 7 },
  { id: "b3-2", x: 4, y: 6, layer: 0, motifIndex: 3 },
  { id: "b3-3", x: 6, y: 6, layer: 0, motifIndex: 7 },
  { id: "b3-4", x: 8, y: 6, layer: 0, motifIndex: 4 },
  { id: "m0-0", x: 1, y: 1, layer: 1, motifIndex: 8 },
  { id: "m0-1", x: 3, y: 1, layer: 1, motifIndex: 5 },
  { id: "m0-2", x: 5, y: 1, layer: 1, motifIndex: 4 },
  { id: "m0-3", x: 7, y: 1, layer: 1, motifIndex: 5 },
  { id: "m0-4", x: 9, y: 1, layer: 1, motifIndex: 8 },
  { id: "m1-0", x: 1, y: 5, layer: 1, motifIndex: 2 },
  { id: "m1-1", x: 3, y: 5, layer: 1, motifIndex: 8 },
  { id: "m1-2", x: 5, y: 5, layer: 1, motifIndex: 4 },
  { id: "m1-3", x: 7, y: 5, layer: 1, motifIndex: 8 },
  { id: "m1-4", x: 9, y: 5, layer: 1, motifIndex: 2 },
  { id: "u-0", x: 2, y: 3, layer: 2, motifIndex: 3 },
  { id: "u-1", x: 4, y: 3, layer: 2, motifIndex: 1 },
  { id: "u-2", x: 6, y: 3, layer: 2, motifIndex: 0 },
  { id: "u-3", x: 8, y: 3, layer: 2, motifIndex: 0 },
  { id: "c-0", x: 4, y: 3, layer: 3, motifIndex: 3 },
  { id: "c-1", x: 6, y: 3, layer: 3, motifIndex: 1 },
].map((tile) => Object.freeze(tile)));

const LAYOUTS: Readonly<Record<RasoiProfileId, readonly LayoutTile[]>> = Object.freeze({
  gentle: GENTLE_LAYOUT,
  deeper: DEEPER_LAYOUT,
});

function profileDefinition(profile: RasoiProfileId) {
  return RASOI_PROFILES.find((candidate) => candidate.id === profile)!;
}

function seedFrom(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createPrng(seedText: string) {
  let value = seedFrom(seedText);
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(values: readonly T[], random: () => number) {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function motifOrderForNight(nightId: string): readonly RasoiMotifId[] {
  if (!nightId) throw new TypeError("motifOrderForNight requires a nightId");
  return Object.freeze(shuffle(
    RASOI_MOTIFS.map((motif) => motif.id),
    createPrng(`${nightId}|rasoi-pairs-${RASOI_RECIPE_VERSION}`),
  ));
}

function createBoard(nightId: string, profile: RasoiProfileId = "gentle"): RasoiBoard {
  if (!(profile in LAYOUTS)) throw new TypeError(`Unknown Rasoi profile: ${profile}`);
  const motifOrder = motifOrderForNight(nightId);
  const layerSlots = new Map<number, number>();
  const tiles = LAYOUTS[profile].map((layout) => {
    const slot = layerSlots.get(layout.layer) ?? 0;
    layerSlots.set(layout.layer, slot + 1);
    return Object.freeze({
      id: layout.id,
      row: layout.layer,
      slot,
      depth: layout.layer,
      x: layout.x,
      y: layout.y,
      layer: layout.layer,
      motif: motifOrder[layout.motifIndex],
    });
  });
  return Object.freeze({
    id: `rasoi-r${RASOI_RECIPE_VERSION}-${profile}-${seedFrom(nightId).toString(36)}`,
    recipeVersion: RASOI_RECIPE_VERSION,
    profile,
    motifOrder,
    tiles: Object.freeze(tiles),
  });
}

function activeTiles(board: RasoiBoard, removed: ReadonlySet<string>) {
  return board.tiles.filter((tile) => !removed.has(tile.id));
}

function overlaps(lower: RasoiTile, higher: RasoiTile) {
  return higher.layer > lower.layer
    && Math.abs(higher.x - lower.x) < 2
    && Math.abs(higher.y - lower.y) <= 2;
}

function availabilityReason(
  board: RasoiBoard,
  removed: ReadonlySet<string>,
  tileId: string,
): TileAvailability {
  const tile = board.tiles.find((candidate) => candidate.id === tileId);
  if (!tile) return "missing";
  if (removed.has(tileId)) return "removed";
  const active = activeTiles(board, removed);
  if (active.some((candidate) => overlaps(tile, candidate))) return "covered";
  const leftBlocked = active.some((candidate) => (
    candidate.layer === tile.layer && candidate.y === tile.y && candidate.x === tile.x - 2
  ));
  const rightBlocked = active.some((candidate) => (
    candidate.layer === tile.layer && candidate.y === tile.y && candidate.x === tile.x + 2
  ));
  return leftBlocked && rightBlocked ? "side-blocked" : "free";
}

function freeTiles(board: RasoiBoard, removed: ReadonlySet<string>) {
  return activeTiles(board, removed).filter((tile) => availabilityReason(board, removed, tile.id) === "free");
}

function isFree(board: RasoiBoard, removed: ReadonlySet<string>, tileId: string) {
  return freeTiles(board, removed).some((tile) => tile.id === tileId);
}

function legalPairs(board: RasoiBoard, removed: ReadonlySet<string>) {
  const free = freeTiles(board, removed);
  const pairs: Array<readonly [string, string]> = [];
  for (let left = 0; left < free.length; left += 1) {
    for (let right = left + 1; right < free.length; right += 1) {
      if (free[left].motif === free[right].motif) {
        pairs.push(Object.freeze([free[left].id, free[right].id]));
      }
    }
  }
  return Object.freeze(pairs);
}

function removePair(board: RasoiBoard, removed: ReadonlySet<string>, firstId: string, secondId: string) {
  const isLegal = legalPairs(board, removed).some((pair) => (
    (pair[0] === firstId && pair[1] === secondId) || (pair[0] === secondId && pair[1] === firstId)
  ));
  if (!isLegal) return Object.freeze({ removed, changed: false });
  return Object.freeze({ removed: new Set([...removed, firstId, secondId]), changed: true });
}

function hintPair(board: RasoiBoard, removed: ReadonlySet<string>) {
  return legalPairs(board, removed)[0] ?? null;
}

function isComplete(board: RasoiBoard, removed: ReadonlySet<string>) {
  return removed.size === board.tiles.length;
}

function stateKey(removed: ReadonlySet<string>) {
  return [...removed].sort().join(",");
}

function isReachableState(board: RasoiBoard, removed: ReadonlySet<string>) {
  const knownIds = new Set(board.tiles.map((tile) => tile.id));
  if (removed.size > board.tiles.length || [...removed].some((tileId) => !knownIds.has(tileId))) return false;
  const target = stateKey(removed);
  const queue: Array<ReadonlySet<string>> = [new Set()];
  const seen = new Set<string>();
  while (queue.length) {
    const current = queue.shift()!;
    const key = stateKey(current);
    if (key === target) return true;
    if (seen.has(key) || current.size >= removed.size) continue;
    seen.add(key);
    for (const pair of legalPairs(board, current)) {
      const next = removePair(board, current, pair[0], pair[1]).removed;
      if ([...next].every((tileId) => removed.has(tileId))) queue.push(next);
    }
  }
  return false;
}

function verifyBoard(board: RasoiBoard): BoardVerification {
  if (!(board.profile in LAYOUTS) || board.tiles.length !== LAYOUTS[board.profile].length) {
    return Object.freeze({ valid: false, reachableStates: 0, terminalStates: 0, deadStates: 0, reason: "tile-count" });
  }
  const counts = new Map<string, number>();
  for (const tile of board.tiles) counts.set(tile.motif, (counts.get(tile.motif) ?? 0) + 1);
  if (RASOI_MOTIFS.some((motif) => counts.get(motif.id) !== 4)) {
    return Object.freeze({ valid: false, reachableStates: 0, terminalStates: 0, deadStates: 0, reason: "motif-count" });
  }

  const queue: Array<ReadonlySet<string>> = [new Set()];
  const seen = new Set<string>();
  let terminalStates = 0;
  let deadStates = 0;
  while (queue.length) {
    const removed = queue.shift()!;
    const key = stateKey(removed);
    if (seen.has(key)) continue;
    seen.add(key);
    if (isComplete(board, removed)) {
      terminalStates += 1;
      continue;
    }
    const pairs = legalPairs(board, removed);
    if (!pairs.length) {
      deadStates += 1;
      continue;
    }
    for (const pair of pairs) {
      queue.push(removePair(board, removed, pair[0], pair[1]).removed);
    }
  }
  return Object.freeze({
    valid: deadStates === 0 && terminalStates > 0,
    reachableStates: seen.size,
    terminalStates,
    deadStates,
    reason: deadStates === 0 && terminalStates > 0 ? "verified" : "dead-state",
  });
}

export const NindovaRasoi = Object.freeze({
  RASOI_RECIPE_VERSION,
  RASOI_MOTIFS,
  RASOI_PROFILES,
  ROWS,
  SLOTS_PER_ROW,
  availabilityReason,
  createBoard,
  freeTiles,
  hintPair,
  isComplete,
  isFree,
  isReachableState,
  legalPairs,
  motifOrderForNight,
  profileDefinition,
  removePair,
  seedFrom,
  verifyBoard,
});

export type NindovaRasoiApi = typeof NindovaRasoi;

declare global {
  var NindovaRasoi: NindovaRasoiApi;
}

globalThis.NindovaRasoi = NindovaRasoi;
