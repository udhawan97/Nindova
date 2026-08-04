export const HOUSE_STORAGE_KEY = "nindova:house:v1";
export const HOUSE_AUDIENCE_KEY = "nindova:house:adult-audience:v1";
export const HOUSE_SCHEMA_VERSION = 1 as const;
export const HOUSE_RULESET_VERSION = "entertainment-1" as const;

export type GameId = "pattern-court" | "mirror-forge" | "stack-architect" | "lantern-ledger";

export type ChoiceChapter = {
  title: string;
  prompt: string;
  display: string;
  choices: readonly string[];
  answerIndex: number;
};

export type GameDefinition = {
  id: GameId;
  number: string;
  title: string;
  houseLine: string;
  description: string;
  kind: "choice" | "memory" | "stack";
  version: "1.0.0";
  chapters: readonly ChoiceChapter[];
  diskCounts?: readonly number[];
};

export type EntertainmentResult = {
  schemaVersion: typeof HOUSE_SCHEMA_VERSION;
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
    id: "pattern-court", number: "I", title: "Pattern Court", houseLine: "Read the order beneath the ornament.",
    description: "Five authored visual sequences, from a simple alternation to a full court lattice.",
    kind: "choice", version: "1.0.0", chapters: PATTERN_CHAPTERS,
  },
  {
    id: "mirror-forge", number: "II", title: "Mirror Forge", houseLine: "Turn forms without losing their bearing.",
    description: "Five spatial turns that build from one compass mark to a forged sequence.",
    kind: "choice", version: "1.0.0", chapters: MIRROR_CHAPTERS,
  },
  {
    id: "stack-architect", number: "III", title: "Stack Architect", houseLine: "Move the tower by law, one disc at a time.",
    description: "Five handcrafted towers. Never place a larger disc on a smaller one.",
    kind: "stack", version: "1.0.0", chapters: [], diskCounts: [2, 3, 4, 5, 6],
  },
  {
    id: "lantern-ledger", number: "IV", title: "Lantern Ledger", houseLine: "Hold an ordered procession of light.",
    description: "Five visible sequences. Close the screen when ready, then choose the line you held.",
    kind: "memory", version: "1.0.0", chapters: LANTERN_CHAPTERS,
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
  return result.schemaVersion === HOUSE_SCHEMA_VERSION
    && result.mode === "entertainment"
    && isGameId(result.gameId)
    && result.gameVersion === "1.0.0"
    && result.rulesetVersion === HOUSE_RULESET_VERSION
    && typeof result.runId === "string"
    && typeof result.completedAt === "string"
    && result.completionFacts?.authoredChapters === 5
    && typeof result.completionFacts.finalChapter === "string";
}

export function readHouseState(storage: Pick<Storage, "getItem">): { state: HouseState; reason: "empty" | "restored" | "invalid" | "unavailable" } {
  try {
    const value = storage.getItem(HOUSE_STORAGE_KEY);
    if (!value) return { state: emptyHouseState(), reason: "empty" };
    const parsed = JSON.parse(value) as Partial<HouseState>;
    if (parsed.schemaVersion !== HOUSE_SCHEMA_VERSION || !parsed.latestByGame || typeof parsed.latestByGame !== "object") {
      return { state: emptyHouseState(), reason: "invalid" };
    }
    const latestByGame: Partial<Record<GameId, EntertainmentResult>> = {};
    for (const [gameId, result] of Object.entries(parsed.latestByGame)) {
      if (isGameId(gameId) && isResult(result) && result.gameId === gameId) latestByGame[gameId] = result;
    }
    return { state: { schemaVersion: HOUSE_SCHEMA_VERSION, latestByGame }, reason: "restored" };
  } catch {
    return { state: emptyHouseState(), reason: "unavailable" };
  }
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
      finalChapter: game.kind === "stack" ? "Six-disc tower" : (game.chapters[4]?.title ?? "Fifth chapter"),
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
