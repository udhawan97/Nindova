import { GRAND_SALON, type GameId } from "./salon-catalog.js";

export const HOUSE_STORAGE_KEY = "nindova:house:v2";
export const HOUSE_LEGACY_STORAGE_KEY = "nindova:house:v1";
export const HOUSE_ACTIVE_STORAGE_KEY = "nindova:house:active:v1";
const HOUSE_AUDIENCE_KEY = "nindova:house:adult-audience:v1";
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

export type ActiveGame = {
  gameId: GameId;
  chapter: number;
  runId: string;
  memoryCovered: boolean;
  pegs: number[][];
  selectedPeg: number | null;
  resolving: boolean;
  storyBeat: number | null;
  touched: boolean;
};

type StorageReader = Pick<Storage, "getItem">;
type StorageWriter = Pick<Storage, "setItem">;
type StorageRemover = Pick<Storage, "removeItem">;
type StoragePort = StorageReader & StorageWriter & StorageRemover;

export type ActiveDecodeResult = { readonly active: ActiveGame | null; readonly discardedRunner: boolean };
export type ActiveSessionCodec = {
  readonly decode: (value: unknown) => ActiveDecodeResult;
  readonly encode: (active: ActiveGame) => unknown;
};

export function emptyHouseState(): HouseState {
  return { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame: {} };
}

function isResult(value: unknown): value is EntertainmentResult {
  if (!value || typeof value !== "object") return false;
  const result = value as Partial<EntertainmentResult>;
  return (result.schemaVersion === 1 || result.schemaVersion === HOUSE_SCHEMA_VERSION)
    && result.mode === "entertainment"
    && GRAND_SALON.hasGame(result.gameId)
    && result.gameVersion === "1.0.0"
    && result.rulesetVersion === HOUSE_RULESET_VERSION
    && typeof result.runId === "string"
    && typeof result.completedAt === "string"
    && result.completionFacts?.authoredChapters === 5
    && typeof result.completionFacts.finalChapter === "string";
}

export type HouseReadResult = { state: HouseState; reason: "empty" | "restored" | "invalid" | "unavailable" };

function parseHouseState(value: string): HouseReadResult {
  try {
    const parsed = JSON.parse(value) as { schemaVersion?: unknown; latestByGame?: unknown };
    if ((parsed.schemaVersion !== 1 && parsed.schemaVersion !== HOUSE_SCHEMA_VERSION) || !parsed.latestByGame || typeof parsed.latestByGame !== "object") {
      return { state: emptyHouseState(), reason: "invalid" };
    }
    const latestByGame: Partial<Record<GameId, EntertainmentResult>> = {};
    for (const [gameId, result] of Object.entries(parsed.latestByGame as Record<string, unknown>)) {
      if (GRAND_SALON.hasGame(gameId) && isResult(result) && result.gameId === gameId) latestByGame[gameId] = result;
    }
    return { state: { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame }, reason: "restored" };
  } catch {
    return { state: emptyHouseState(), reason: "unavailable" };
  }
}

export function readHouseState(storage: StorageReader): HouseReadResult {
  let primaryValue: string | null = null;
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
    const legacyValue = storage.getItem(HOUSE_LEGACY_STORAGE_KEY);
    if (legacyValue !== null) {
      const legacy = parseHouseState(legacyValue);
      if (legacy.reason === "restored") return legacy;
      return { state: emptyHouseState(), reason: primaryFailure === "unavailable" || legacy.reason === "unavailable" ? "unavailable" : "invalid" };
    }
  } catch {
    return { state: emptyHouseState(), reason: "unavailable" };
  }
  return { state: emptyHouseState(), reason: primaryFailure ?? "empty" };
}

export function writeHouseState(storage: StorageWriter, state: HouseState): boolean {
  try {
    storage.setItem(HOUSE_STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function completeEntertainmentGame(state: HouseState, gameId: GameId, runId: string, completedAt: string): { state: HouseState; result: EntertainmentResult } {
  const game = GRAND_SALON.game(gameId);
  const result: EntertainmentResult = {
    schemaVersion: HOUSE_SCHEMA_VERSION,
    mode: "entertainment",
    gameId: game.id,
    gameVersion: game.version,
    rulesetVersion: HOUSE_RULESET_VERSION,
    runId,
    completedAt,
    completionFacts: { authoredChapters: 5, finalChapter: GRAND_SALON.finalPart(game.id).title },
  };
  return { result, state: { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame: { ...state.latestByGame, [game.id]: result } } };
}

function cloneHouseState(state: HouseState): HouseState {
  return { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame: Object.fromEntries(Object.entries(state.latestByGame).map(([id, result]) => [id, result ? { ...result, completionFacts: { ...result.completionFacts } } : result])) };
}

export function createHouseStateStore(options: { readonly galleryStorage: StoragePort; readonly activeStorage: StoragePort; readonly activeCodec: ActiveSessionCodec }) {
  let gallery = readHouseState(options.galleryStorage).state;
  return Object.freeze({
    audienceAcknowledged(): boolean {
      try {
        return options.galleryStorage.getItem(HOUSE_AUDIENCE_KEY) === "acknowledged";
      } catch {
        return false;
      }
    },
    acknowledgeAudience(): boolean {
      try {
        options.galleryStorage.setItem(HOUSE_AUDIENCE_KEY, "acknowledged");
        return true;
      } catch {
        return false;
      }
    },
    gallery(): HouseState {
      return cloneHouseState(gallery);
    },
    restoreActive(): ActiveDecodeResult {
      try {
        const raw = options.activeStorage.getItem(HOUSE_ACTIVE_STORAGE_KEY);
        if (raw === null) return { active: null, discardedRunner: false };
        const decoded = options.activeCodec.decode(JSON.parse(raw));
        if (!decoded.active) options.activeStorage.removeItem(HOUSE_ACTIVE_STORAGE_KEY);
        return decoded;
      } catch {
        return { active: null, discardedRunner: false };
      }
    },
    saveActive(active: ActiveGame | null): boolean {
      try {
        if (active) options.activeStorage.setItem(HOUSE_ACTIVE_STORAGE_KEY, JSON.stringify(options.activeCodec.encode(active)));
        else options.activeStorage.removeItem(HOUSE_ACTIVE_STORAGE_KEY);
        return true;
      } catch {
        return false;
      }
    },
    complete(gameId: GameId, runId: string, completedAt: string) {
      const completed = completeEntertainmentGame(gallery, gameId, runId, completedAt);
      const persisted = writeHouseState(options.galleryStorage, completed.state);
      if (persisted) gallery = completed.state;
      return { ...completed, state: cloneHouseState(gallery), persisted };
    },
    clearGallery(): boolean {
      if (!writeHouseState(options.galleryStorage, gallery)) return false;
      try {
        options.galleryStorage.removeItem(HOUSE_LEGACY_STORAGE_KEY);
        options.galleryStorage.removeItem(HOUSE_STORAGE_KEY);
      } catch {
        return false;
      }
      gallery = emptyHouseState();
      return true;
    },
  });
}
