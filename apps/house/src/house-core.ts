import { getClassicStudy, type ClassicStudyId } from "./classic-studies.js";

export const HOUSE_STORAGE_KEY = "nindova:house:v2";
export const HOUSE_LEGACY_STORAGE_KEY = "nindova:house:v1";
export const HOUSE_AUDIENCE_KEY = "nindova:house:adult-audience:v1";
export const HOUSE_SCHEMA_VERSION = 2 as const;
export const HOUSE_RULESET_VERSION = "entertainment-1" as const;

export type GameId = "pattern-court" | "navakankari" | "mirror-forge" | "aadu-puli-attam" | "stack-architect" | "pallanguzhi" | "lantern-ledger" | "sector-sprint";
export type DoorCategoryId = "pattern-line" | "turn-trap" | "count-carry" | "memory-sequence" | "motion-route";

export type ChoiceChapter = {
  title: string;
  prompt: string;
  display: string;
  choices: readonly string[];
  answerIndex: number;
};

export type GameDefinition = {
  id: GameId;
  categoryId: DoorCategoryId;
  number: string;
  title: string;
  houseLine: string;
  description: string;
  kind: "choice" | "memory" | "stack" | "runner" | "classic";
  format: "house-original" | "authored-rule-study";
  classicStudyId?: ClassicStudyId;
  version: "1.0.0";
  chapters: readonly ChoiceChapter[];
  diskCounts?: readonly number[];
  chapterTitles?: readonly string[];
};

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

export type DoorCategory = {
  readonly id: DoorCategoryId;
  readonly number: string;
  readonly title: string;
  readonly houseLine: string;
  readonly description: string;
  readonly gameIds: readonly GameId[];
};

export const DOOR_CATEGORIES: readonly DoorCategory[] = [
  { id: "pattern-line", number: "I", title: "Pattern & Line", houseLine: "Read order, alignment, and the line that closes.", description: "Pattern Court and a placement-only Navakankari rule study.", gameIds: ["pattern-court", "navakankari"] },
  { id: "turn-trap", number: "II", title: "Turn & Trap", houseLine: "Change a bearing, then read a board's safe passage.", description: "Mirror Forge and an Aadu Puli Aattam movement study.", gameIds: ["mirror-forge", "aadu-puli-attam"] },
  { id: "count-carry", number: "III", title: "Count & Carry", houseLine: "Move by a fixed law and leave every piece accountable.", description: "Stack Architect and a one-turn Pallanguzhi sowing study.", gameIds: ["stack-architect", "pallanguzhi"] },
  { id: "memory-sequence", number: "IV", title: "Memory & Sequence", houseLine: "Hold a procession without haste or judgment.", description: "Lantern Ledger's five visible, replayable sequences.", gameIds: ["lantern-ledger"] },
  { id: "motion-route", number: "V", title: "Motion & Route", houseLine: "Follow a route through Chandigarh's changing street theatre.", description: "Sector Sprint in Action or narrated form.", gameIds: ["sector-sprint"] },
] as const;

const PATTERN_CHAPTERS: readonly ChoiceChapter[] = [
  { title: "Alternating inlay", prompt: "Which mark completes the line?", display: "◇  ◆  ◇  ◆  ?", choices: ["◇", "◆", "○", "✦"], answerIndex: 0 },
  { title: "Third bell", prompt: "Which mark comes next?", display: "●  ●  ▲  ●  ●  ▲  ?", choices: ["▲", "●", "◆", "○"], answerIndex: 1 },
  { title: "Ascending register", prompt: "Complete the repeating register.", display: "I  II  III  I  II  ?", choices: ["I", "II", "III", "IV"], answerIndex: 2 },
  { title: "The double interval", prompt: "Which mark restores the spacing?", display: "⬟  ◇  ◇  ⬟  ◇  ◇  ?", choices: ["◇", "⬟", "✦", "○"], answerIndex: 1 },
  { title: "Court lattice", prompt: "Complete the lower-right corner.", display: "✦  ○  ✦\n○  ✦  ○\n✦  ○  ?", choices: ["○", "◇", "✦", "◆"], answerIndex: 2 },
];

const MIRROR_CHAPTERS: readonly ChoiceChapter[] = [
  { title: "First turn", prompt: "Turn the arrow once clockwise.", display: "↑", choices: ["←", "→", "↓", "↑"], answerIndex: 1 },
  { title: "Half turn", prompt: "Turn the arrow twice clockwise.", display: "↗", choices: ["↙", "↖", "↘", "↗"], answerIndex: 0 },
  { title: "Three turns", prompt: "Turn the arrow three quarter-turns clockwise.", display: "←", choices: ["↓", "↑", "→", "←"], answerIndex: 0 },
  { title: "Paired compass", prompt: "Turn both arrows once clockwise, preserving their order.", display: "↑   ←", choices: ["→   ↑", "←   ↓", "↓   →", "↑   ←"], answerIndex: 0 },
  { title: "Forged sequence", prompt: "Turn the whole sequence twice clockwise.", display: "↑   ↗   →", choices: ["↓   ↙   ←", "←   ↖   ↑", "→   ↘   ↓", "↑   ↗   →"], answerIndex: 0 },
];

const LANTERN_CHAPTERS: readonly ChoiceChapter[] = [
  { title: "Three lights", prompt: "Which sequence was shown?", display: "Pearl · Brass · Jade", choices: ["Pearl · Brass · Jade", "Brass · Pearl · Jade", "Pearl · Jade · Brass", "Jade · Brass · Pearl"], answerIndex: 0 },
  { title: "Return of pearl", prompt: "Which sequence was shown?", display: "Ruby · Pearl · Indigo · Pearl", choices: ["Ruby · Indigo · Pearl · Pearl", "Ruby · Pearl · Indigo · Pearl", "Pearl · Ruby · Indigo · Pearl", "Ruby · Pearl · Pearl · Indigo"], answerIndex: 1 },
  { title: "Five-lantern hall", prompt: "Which sequence was shown?", display: "Jade · Brass · Ruby · Pearl · Indigo", choices: ["Jade · Brass · Ruby · Pearl · Indigo", "Jade · Ruby · Brass · Pearl · Indigo", "Brass · Jade · Ruby · Indigo · Pearl", "Jade · Brass · Pearl · Ruby · Indigo"], answerIndex: 0 },
  { title: "The mirrored pair", prompt: "Which sequence was shown?", display: "Pearl · Jade · Brass · Brass · Jade · Pearl", choices: ["Pearl · Brass · Jade · Jade · Brass · Pearl", "Pearl · Jade · Brass · Brass · Jade · Pearl", "Jade · Pearl · Brass · Brass · Pearl · Jade", "Pearl · Jade · Brass · Jade · Brass · Pearl"], answerIndex: 1 },
  { title: "The long gallery", prompt: "Which sequence was shown?", display: "Ruby · Indigo · Pearl · Brass · Jade · Pearl · Indigo", choices: ["Ruby · Indigo · Pearl · Jade · Brass · Pearl · Indigo", "Indigo · Ruby · Pearl · Brass · Jade · Indigo · Pearl", "Ruby · Indigo · Pearl · Brass · Jade · Pearl · Indigo", "Ruby · Pearl · Indigo · Brass · Jade · Pearl · Indigo"], answerIndex: 2 },
];

export const GAMES: readonly GameDefinition[] = [
  {
    id: "pattern-court", categoryId: "pattern-line", number: "I.A", title: "Pattern Court", houseLine: "Read the order beneath the ornament.",
    description: "Five authored visual sequences, from a simple alternation to a full court lattice.",
    kind: "choice", format: "house-original", version: "1.0.0", chapters: PATTERN_CHAPTERS,
  },
  {
    id: "navakankari", categoryId: "pattern-line", number: "I.B", title: "Navakankari", houseLine: "Place the third piece and close the line.",
    description: "Five authored placement studies on the documented 24-point board—not a complete traditional match.",
    kind: "classic", format: "authored-rule-study", classicStudyId: "navakankari", version: "1.0.0", chapters: [],
  },
  {
    id: "mirror-forge", categoryId: "turn-trap", number: "II.A", title: "Mirror Forge", houseLine: "Turn forms without losing their bearing.",
    description: "Five spatial turns that build from one compass mark to a forged sequence.",
    kind: "choice", format: "house-original", version: "1.0.0", chapters: MIRROR_CHAPTERS,
  },
  {
    id: "aadu-puli-attam", categoryId: "turn-trap", number: "II.B", title: "Aadu Puli Aattam", houseLine: "Read one movement or tiger leap along a drawn line.",
    description: "Five authored goat-and-tiger movement studies—not setup, an opponent, or a complete match.",
    kind: "classic", format: "authored-rule-study", classicStudyId: "aadu-puli-attam", version: "1.0.0", chapters: [],
  },
  {
    id: "stack-architect", categoryId: "count-carry", number: "III.A", title: "Stack Architect", houseLine: "Move the tower by law, one disc at a time.",
    description: "Five handcrafted towers. Never place a larger disc on a smaller one.",
    kind: "stack", format: "house-original", version: "1.0.0", chapters: [], diskCounts: [2, 3, 4, 5, 6],
  },
  {
    id: "pallanguzhi", categoryId: "count-carry", number: "III.B", title: "Pallanguzhi", houseLine: "Lift, sow, relay, and gather through one bounded turn.",
    description: "Five authored turns on a two-by-seven pit board—not a full multi-round traditional match.",
    kind: "classic", format: "authored-rule-study", classicStudyId: "pallanguzhi", version: "1.0.0", chapters: [],
  },
  {
    id: "lantern-ledger", categoryId: "memory-sequence", number: "IV", title: "Lantern Ledger", houseLine: "Hold an ordered procession of light.",
    description: "Five visible sequences. Close the screen when ready, then choose the line you held.",
    kind: "memory", format: "house-original", version: "1.0.0", chapters: LANTERN_CHAPTERS,
  },
  {
    id: "sector-sprint", categoryId: "motion-route", number: "V", title: "Sector Sprint", houseLine: "Run Chandigarh’s long way home.",
    description: "Five progressively faster lane routes with expressive riders, textured architecture, one-contact Action pauses, harmless Act tools, and a clean narrated route.",
    kind: "runner", format: "house-original", version: "1.0.0", chapters: [],
    chapterTitles: ["Ghar Wapsi", "Sabzi Command", "Baraat Detour", "Monsoon Protocol", "Roti Relay"],
  },
] as const;

export function emptyHouseState(): HouseState {
  return { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame: {} };
}

function isGameId(value: unknown): value is GameId {
  return GAMES.some((game) => game.id === value);
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
      finalChapter: game.kind === "classic"
        ? getClassicStudy(game.classicStudyId!).chapters[4]?.title ?? "Fifth study"
        : game.kind === "stack"
        ? "Six-disc tower"
        : game.kind === "runner"
          ? (game.chapterTitles?.[4] ?? "Fifth chapter")
          : (game.chapters[4]?.title ?? "Fifth chapter"),
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
  const game = GAMES.find((entry) => entry.id === gameId);
  if (!game) throw new Error(`Unknown game: ${gameId}`);
  return game;
}

export function getDoorCategory(categoryId: DoorCategoryId): DoorCategory {
  const category = DOOR_CATEGORIES.find((entry) => entry.id === categoryId);
  if (!category) throw new Error(`Unknown category: ${categoryId}`);
  return category;
}

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
