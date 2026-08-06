import { GRAND_SALON, type GameDefinition, type GameId } from "./salon-catalog.js";

export {
  DOOR_CATEGORIES,
  GAMES,
  GRAND_SALON,
  type ChoiceChapter,
  type DoorCategory,
  type DoorCategoryId,
  type GameDefinition,
  type GameId,
} from "./salon-catalog.js";

export const HOUSE_STORAGE_KEY = "nindova:house:v2";
export const HOUSE_LEGACY_STORAGE_KEY = "nindova:house:v1";
export const HOUSE_AUDIENCE_KEY = "nindova:house:adult-audience:v1";
export const HOUSE_SCHEMA_VERSION = 2 as const;
export const HOUSE_RULESET_VERSION = "entertainment-1" as const;

export type EntertainmentResult = {
  schemaVersion: 1 | typeof HOUSE_SCHEMA_VERSION;
  mode: "entertainment";
  gameId: GameId;
  gameVersion: "1.0.0";
  rulesetVersion: typeof HOUSE_RULESET_VERSION;
  runId: string;
  completedAt: string;
  completionFacts: {
    authoredChapters: 5;
    finalChapter: string;
  };
};

export type HouseState = {
  schemaVersion: typeof HOUSE_SCHEMA_VERSION;
  latestByGame: Partial<Record<GameId, EntertainmentResult>>;
};

export function emptyHouseState(): HouseState {
  return { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame: {} };
}

function isGameId(value: unknown): value is GameId {
  return GRAND_SALON.hasGame(value);
}

function isResult(value: unknown): value is EntertainmentResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<EntertainmentResult>;
  return (result.schemaVersion === 1 || result.schemaVersion === HOUSE_SCHEMA_VERSION)
    && result.mode === "entertainment"
    && isGameId(result.gameId)
    && result.gameVersion === "1.0.0"
    && result.rulesetVersion === HOUSE_RULESET_VERSION
    && typeof result.runId === "string"
    && typeof result.completedAt === "string"
    && result.completionFacts?.authoredChapters === 5
    && typeof result.completionFacts.finalChapter === "string";
}

type HouseReadResult = { state: HouseState; reason: "empty" | "restored" | "invalid" | "unavailable" };

function parseHouseState(value: string): HouseReadResult {
  try {
    const parsed = JSON.parse(value) as { schemaVersion?: unknown; latestByGame?: unknown };
    if ((parsed.schemaVersion !== 1 && parsed.schemaVersion !== HOUSE_SCHEMA_VERSION) || !parsed.latestByGame || typeof parsed.latestByGame !== "object") {
      return { state: emptyHouseState(), reason: "invalid" };
    }
    const latestByGame: Partial<Record<GameId, EntertainmentResult>> = {};
    for (const [gameId, result] of Object.entries(parsed.latestByGame as Record<string, unknown>)) {
      if (isGameId(gameId) && isResult(result) && result.gameId === gameId) latestByGame[gameId] = result;
    }
    return { state: { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame }, reason: "restored" };
  } catch {
    return { state: emptyHouseState(), reason: "unavailable" };
  }
}

export function readHouseState(storage: Pick<Storage, "getItem">): HouseReadResult {
  let primaryValue: string | null = null;
  let legacyValue: string | null = null;
  let primaryFailure: HouseReadResult["reason"] | null = null;

  try {
    primaryValue = storage.getItem(HOUSE_STORAGE_KEY);
  } catch {
    primaryFailure = "unavailable";
  }
  if (primaryValue !== null) {
    const primary = parseHouseState(primaryValue);
    if (primary.reason === "restored") return primary;
    primaryFailure = primary.reason;
  }

  try {
    legacyValue = storage.getItem(HOUSE_LEGACY_STORAGE_KEY);
  } catch {
    return { state: emptyHouseState(), reason: "unavailable" };
  }
  if (legacyValue !== null) {
    const legacy = parseHouseState(legacyValue);
    if (legacy.reason === "restored") return legacy;
    return { state: emptyHouseState(), reason: primaryFailure === "unavailable" || legacy.reason === "unavailable" ? "unavailable" : "invalid" };
  }

  return { state: emptyHouseState(), reason: primaryFailure ?? "empty" };
}

export function writeHouseState(storage: Pick<Storage, "setItem">, state: HouseState): boolean {
  try {
    storage.setItem(HOUSE_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function completeEntertainmentGame(state: HouseState, game: GameDefinition, runId: string, completedAt: string): { state: HouseState; result: EntertainmentResult } {
  const result: EntertainmentResult = {
    schemaVersion: HOUSE_SCHEMA_VERSION,
    mode: "entertainment",
    gameId: game.id,
    gameVersion: game.version,
    rulesetVersion: HOUSE_RULESET_VERSION,
    runId,
    completedAt,
    completionFacts: {
      authoredChapters: 5,
      finalChapter: GRAND_SALON.finalPart(game.id).title,
    },
  };
  return {
    result,
    state: {
      schemaVersion: HOUSE_SCHEMA_VERSION,
      latestByGame: { ...state.latestByGame, [game.id]: result },
    },
  };
}

export function getGame(gameId: GameId): GameDefinition {
  return GRAND_SALON.game(gameId);
}

export const getDoorCategory = GRAND_SALON.door.bind(GRAND_SALON);

export function isLegalStackMove(pegs: readonly (readonly number[])[], from: number, to: number): boolean {
  if (from === to || from < 0 || to < 0 || from > 2 || to > 2) return false;
  const moving = pegs[from]?.at(-1);
  const target = pegs[to]?.at(-1);
  return moving !== undefined && (target === undefined || moving < target);
}

export function moveStackDisc(pegs: readonly (readonly number[])[], from: number, to: number): number[][] {
  if (!isLegalStackMove(pegs, from, to)) return pegs.map((peg) => [...peg]);
  const next = pegs.map((peg) => [...peg]);
  const moving = next[from].pop();
  if (moving !== undefined) next[to].push(moving);
  return next;
}

export function initialPegs(diskCount: number): number[][] {
  return [Array.from({ length: diskCount }, (_, index) => diskCount - index), [], []];
}

export function isValidStackState(pegs: unknown, diskCount: number): pegs is number[][] {
  if (!Array.isArray(pegs) || pegs.length !== 3) return false;
  const normalized = pegs.map((peg) => Array.isArray(peg) ? peg : []);
  if (normalized.some((peg) => peg.some((disk, index) => (
    !Number.isInteger(disk) || disk < 1 || disk > diskCount || (index > 0 && peg[index - 1] <= disk)
  )))) return false;
  const allDiscs = normalized.flat().slice().sort((a, b) => a - b);
  return allDiscs.length === diskCount && allDiscs.every((disk, index) => disk === index + 1);
}

export function stackSolved(pegs: readonly (readonly number[])[], diskCount: number): boolean {
  return pegs[2]?.length === diskCount;
}
