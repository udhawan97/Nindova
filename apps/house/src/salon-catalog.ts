export type GameId = "pattern-court" | "navakankari" | "mirror-forge" | "aadu-puli-attam" | "stack-architect" | "pallanguzhi" | "lantern-ledger" | "sector-sprint";
export type DoorCategoryId = "pattern-line" | "turn-trap" | "count-carry" | "memory-sequence" | "motion-route";
export type ClassicStudyId = "navakankari" | "aadu-puli-attam" | "pallanguzhi";

export type ChoiceChapter = {
  readonly title: string;
  readonly prompt: string;
  readonly display: string;
  readonly choices: readonly string[];
  readonly answerIndex: number;
};

type GameBase = {
  readonly id: GameId;
  readonly categoryId: DoorCategoryId;
  readonly number: string;
  readonly title: string;
  readonly houseLine: string;
  readonly description: string;
  readonly version: "1.0.0";
};

export type ChoiceGameDefinition = GameBase & {
  readonly kind: "choice";
  readonly format: "house-original";
  readonly chapters: readonly ChoiceChapter[];
};

export type MemoryGameDefinition = GameBase & {
  readonly kind: "memory";
  readonly format: "house-original";
  readonly chapters: readonly ChoiceChapter[];
};

export type ClassicGameDefinition = GameBase & {
  readonly kind: "classic";
  readonly format: "authored-rule-study";
  readonly classicStudyId: ClassicStudyId;
  readonly chapterTitles: readonly string[];
};

export type StackGameDefinition = GameBase & {
  readonly kind: "stack";
  readonly format: "house-original";
  readonly diskCounts: readonly number[];
  readonly chapterTitles: readonly string[];
};

export type RunnerGameDefinition = GameBase & {
  readonly kind: "runner";
  readonly format: "house-original";
  readonly chapterTitles: readonly string[];
};

export type GameDefinition = ChoiceGameDefinition | MemoryGameDefinition | ClassicGameDefinition | StackGameDefinition | RunnerGameDefinition;

export type DoorCategory = {
  readonly id: DoorCategoryId;
  readonly number: string;
  readonly title: string;
  readonly houseLine: string;
  readonly description: string;
  readonly gameIds: readonly GameId[];
};

export type SalonPart = {
  readonly index: number;
  readonly number: number;
  readonly title: string;
  readonly unit: "Chapter" | "Study" | "Act";
  readonly unitPlural: "chapters" | "studies" | "Acts";
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
] as const;

const MIRROR_CHAPTERS: readonly ChoiceChapter[] = [
  { title: "First turn", prompt: "Turn the arrow once clockwise.", display: "↑", choices: ["←", "→", "↓", "↑"], answerIndex: 1 },
  { title: "Half turn", prompt: "Turn the arrow twice clockwise.", display: "↗", choices: ["↙", "↖", "↘", "↗"], answerIndex: 0 },
  { title: "Three turns", prompt: "Turn the arrow three quarter-turns clockwise.", display: "←", choices: ["↓", "↑", "→", "←"], answerIndex: 0 },
  { title: "Paired compass", prompt: "Turn both arrows once clockwise, preserving their order.", display: "↑   ←", choices: ["→   ↑", "←   ↓", "↓   →", "↑   ←"], answerIndex: 0 },
  { title: "Forged sequence", prompt: "Turn the whole sequence twice clockwise.", display: "↑   ↗   →", choices: ["↓   ↙   ←", "←   ↖   ↑", "→   ↘   ↓", "↑   ↗   →"], answerIndex: 0 },
] as const;

const LANTERN_CHAPTERS: readonly ChoiceChapter[] = [
  { title: "Three lights", prompt: "Which sequence was shown?", display: "Pearl · Brass · Jade", choices: ["Pearl · Brass · Jade", "Brass · Pearl · Jade", "Pearl · Jade · Brass", "Jade · Brass · Pearl"], answerIndex: 0 },
  { title: "Return of pearl", prompt: "Which sequence was shown?", display: "Ruby · Pearl · Indigo · Pearl", choices: ["Ruby · Indigo · Pearl · Pearl", "Ruby · Pearl · Indigo · Pearl", "Pearl · Ruby · Indigo · Pearl", "Ruby · Pearl · Pearl · Indigo"], answerIndex: 1 },
  { title: "Five-lantern hall", prompt: "Which sequence was shown?", display: "Jade · Brass · Ruby · Pearl · Indigo", choices: ["Jade · Brass · Ruby · Pearl · Indigo", "Jade · Ruby · Brass · Pearl · Indigo", "Brass · Jade · Ruby · Indigo · Pearl", "Jade · Brass · Pearl · Ruby · Indigo"], answerIndex: 0 },
  { title: "The mirrored pair", prompt: "Which sequence was shown?", display: "Pearl · Jade · Brass · Brass · Jade · Pearl", choices: ["Pearl · Brass · Jade · Jade · Brass · Pearl", "Pearl · Jade · Brass · Brass · Jade · Pearl", "Jade · Pearl · Brass · Brass · Pearl · Jade", "Pearl · Jade · Brass · Jade · Brass · Pearl"], answerIndex: 1 },
  { title: "The long gallery", prompt: "Which sequence was shown?", display: "Ruby · Indigo · Pearl · Brass · Jade · Pearl · Indigo", choices: ["Ruby · Indigo · Pearl · Jade · Brass · Pearl · Indigo", "Indigo · Ruby · Pearl · Brass · Jade · Indigo · Pearl", "Ruby · Indigo · Pearl · Brass · Jade · Pearl · Indigo", "Ruby · Pearl · Indigo · Brass · Jade · Pearl · Indigo"], answerIndex: 2 },
] as const;

export const GAMES: readonly GameDefinition[] = [
  { id: "pattern-court", categoryId: "pattern-line", number: "I.A", title: "Pattern Court", houseLine: "Read the order beneath the ornament.", description: "Five authored visual sequences, from a simple alternation to a full court lattice.", kind: "choice", format: "house-original", version: "1.0.0", chapters: PATTERN_CHAPTERS },
  { id: "navakankari", categoryId: "pattern-line", number: "I.B", title: "Navakankari", houseLine: "Place the third piece and close the line.", description: "Five authored placement studies on the documented 24-point board—not a complete traditional match.", kind: "classic", format: "authored-rule-study", classicStudyId: "navakankari", version: "1.0.0", chapterTitles: ["Outer court", "West passage", "Inner lintel", "Middle gallery", "Lower court"] },
  { id: "mirror-forge", categoryId: "turn-trap", number: "II.A", title: "Mirror Forge", houseLine: "Turn forms without losing their bearing.", description: "Five spatial turns that build from one compass mark to a forged sequence.", kind: "choice", format: "house-original", version: "1.0.0", chapters: MIRROR_CHAPTERS },
  { id: "aadu-puli-attam", categoryId: "turn-trap", number: "II.B", title: "Aadu Puli Aattam", houseLine: "Read one movement or tiger leap along a drawn line.", description: "Five authored goat-and-tiger movement studies—not setup, an opponent, or a complete match.", kind: "classic", format: "authored-rule-study", classicStudyId: "aadu-puli-attam", version: "1.0.0", chapterTitles: ["Apex leap", "Side passage", "Barred crossing", "Outer diagonal", "Inner ray"] },
  { id: "stack-architect", categoryId: "count-carry", number: "III.A", title: "Stack Architect", houseLine: "Move the tower by law, one disc at a time.", description: "Five handcrafted towers. Never place a larger disc on a smaller one.", kind: "stack", format: "house-original", version: "1.0.0", diskCounts: [2, 3, 4, 5, 6], chapterTitles: ["2-disc tower", "3-disc tower", "4-disc tower", "5-disc tower", "6-disc tower"] },
  { id: "pallanguzhi", categoryId: "count-carry", number: "III.B", title: "Pallanguzhi", houseLine: "Lift, sow, relay, and gather through one bounded turn.", description: "Five authored turns on a two-by-seven pit board—not a full multi-round traditional match.", kind: "classic", format: "authored-rule-study", classicStudyId: "pallanguzhi", version: "1.0.0", chapterTitles: ["First carry", "Around the corner", "Relay hand", "Four-seed taking", "Beyond the empty pit"] },
  { id: "lantern-ledger", categoryId: "memory-sequence", number: "IV", title: "Lantern Ledger", houseLine: "Hold an ordered procession of light.", description: "Five visible sequences. Close the screen when ready, then choose the line you held.", kind: "memory", format: "house-original", version: "1.0.0", chapters: LANTERN_CHAPTERS },
  { id: "sector-sprint", categoryId: "motion-route", number: "V", title: "Sector Sprint", houseLine: "Run Chandigarh’s long way home.", description: "Five progressively faster lane routes with expressive riders, textured architecture, one-contact Action pauses, harmless Act tools, and a clean narrated route.", kind: "runner", format: "house-original", version: "1.0.0", chapterTitles: ["Ghar Wapsi", "Sabzi Command", "Baraat Detour", "Monsoon Protocol", "Roti Relay"] },
] as const;

function gameUnit(game: GameDefinition): Pick<SalonPart, "unit" | "unitPlural"> {
  if (game.kind === "runner") return { unit: "Act", unitPlural: "Acts" };
  if (game.kind === "classic") return { unit: "Study", unitPlural: "studies" };
  return { unit: "Chapter", unitPlural: "chapters" };
}

function partTitle(game: GameDefinition, index: number): string {
  if (game.kind === "choice" || game.kind === "memory") return game.chapters[index]?.title ?? "";
  return game.chapterTitles[index] ?? "";
}

function validateCatalog(): void {
  const gameIds = GAMES.map((game) => game.id);
  const doorIds = DOOR_CATEGORIES.map((door) => door.id);
  if (new Set(gameIds).size !== gameIds.length || new Set(doorIds).size !== doorIds.length) throw new Error("Grand Salon IDs must be unique");
  const membership = DOOR_CATEGORIES.flatMap((door) => door.gameIds);
  if (membership.length !== gameIds.length || membership.some((id, index) => id !== gameIds[index])) throw new Error("Each Grand Salon game must belong to one ordered door");
  for (const game of GAMES) {
    if (!doorIds.includes(game.categoryId)) throw new Error(`Unknown door for ${game.id}`);
    const count = game.kind === "choice" || game.kind === "memory" ? game.chapters.length : game.chapterTitles.length;
    if (count !== 5 || (game.kind === "stack" && game.diskCounts.length !== 5)) throw new Error(`${game.id} must contain five authored parts`);
  }
}

validateCatalog();

export const GRAND_SALON = Object.freeze({
  games: GAMES,
  doors: DOOR_CATEGORIES,
  hasGame(value: unknown): value is GameId {
    return GAMES.some((game) => game.id === value);
  },
  hasDoor(value: unknown): value is DoorCategoryId {
    return DOOR_CATEGORIES.some((door) => door.id === value);
  },
  game(gameId: GameId): GameDefinition {
    const game = GAMES.find((entry) => entry.id === gameId);
    if (!game) throw new Error(`Unknown game: ${gameId}`);
    return game;
  },
  door(categoryId: DoorCategoryId): DoorCategory {
    const category = DOOR_CATEGORIES.find((entry) => entry.id === categoryId);
    if (!category) throw new Error(`Unknown category: ${categoryId}`);
    return category;
  },
  part(gameId: GameId, index: number): SalonPart {
    const game = this.game(gameId);
    const title = partTitle(game, index);
    if (!title) throw new Error(`Unknown part ${index + 1} for ${gameId}`);
    return Object.freeze({ index, number: index + 1, title, ...gameUnit(game) });
  },
  finalPart(gameId: GameId): SalonPart {
    return this.part(gameId, 4);
  },
});
