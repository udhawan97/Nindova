export const RASOI_RECIPE_VERSION = 2;

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

export interface RasoiTile {
  readonly id: string;
  readonly row: number;
  readonly slot: number;
  readonly depth: number;
  readonly motif: RasoiMotifId;
}

export interface RasoiBoard {
  readonly id: string;
  readonly recipeVersion: number;
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

function createBoard(nightId: string): RasoiBoard {
  const motifOrder = motifOrderForNight(nightId);
  const tiles: RasoiTile[] = [];
  for (let row = 0; row < ROWS; row += 1) {
    for (let slot = 0; slot < SLOTS_PER_ROW; slot += 1) {
      const depth = Math.min(slot, SLOTS_PER_ROW - 1 - slot);
      const motifIndex = row * 3 + Math.floor(depth / 2);
      tiles.push(Object.freeze({
        id: `r${row}-s${slot}`,
        row,
        slot,
        depth,
        motif: motifOrder[motifIndex],
      }));
    }
  }
  return Object.freeze({
    id: `rasoi-r${RASOI_RECIPE_VERSION}-${seedFrom(nightId).toString(36)}`,
    recipeVersion: RASOI_RECIPE_VERSION,
    motifOrder,
    tiles: Object.freeze(tiles),
  });
}

function activeTiles(board: RasoiBoard, removed: ReadonlySet<string>) {
  return board.tiles.filter((tile) => !removed.has(tile.id));
}

function freeTiles(board: RasoiBoard, removed: ReadonlySet<string>) {
  const active = activeTiles(board, removed);
  const rowEdges = Array.from({ length: ROWS }, () => ({ min: Infinity, max: -Infinity }));
  for (const tile of active) {
    rowEdges[tile.row].min = Math.min(rowEdges[tile.row].min, tile.slot);
    rowEdges[tile.row].max = Math.max(rowEdges[tile.row].max, tile.slot);
  }
  return active.filter((tile) => (
    tile.slot === rowEdges[tile.row].min || tile.slot === rowEdges[tile.row].max
  ));
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
  if (board.tiles.length !== ROWS * SLOTS_PER_ROW) {
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
  ROWS,
  SLOTS_PER_ROW,
  createBoard,
  freeTiles,
  hintPair,
  isComplete,
  isFree,
  isReachableState,
  legalPairs,
  motifOrderForNight,
  removePair,
  seedFrom,
  verifyBoard,
});

export type NindovaRasoiApi = typeof NindovaRasoi;

declare global {
  var NindovaRasoi: NindovaRasoiApi;
}

globalThis.NindovaRasoi = NindovaRasoi;
