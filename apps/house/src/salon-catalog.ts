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
  readonly version: "1.0.0" | "2.0.0" | "3.0.0";
  readonly goal: string;
  readonly howToPlay: readonly string[];
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
  { id: "motion-route", number: "V", title: "Motion & Route", houseLine: "Take the long way home through Chandigarh.", description: "Explore the city or follow an equivalent narrated homecoming.", gameIds: ["sector-sprint"] },
] as const;

const PATTERN_CHAPTERS: readonly ChoiceChapter[] = [
  { title: "Alternating inlay", prompt: "Which mark completes the line?", display: "◇  ◆  ◇  ◆  ?", choices: ["◇", "◆", "○", "✦"], answerIndex: 0 },
  { title: "The returning leaf", prompt: "Complete the repeating rows.", display: "◇  ◆  ❧", choices: ["◇", "◆", "❧", "⌒"], answerIndex: 2 },
  { title: "Court turns", prompt: "Complete the turning court.", display: "◇  ◆  ◇\n❧  ⌒  ❧", choices: ["◇", "◆", "❧", "⌒"], answerIndex: 0 },
  { title: "Two crossing paths", prompt: "Complete both diagonals.", display: "⌒  ◆  ⌒\n❧  ⌒  ❧", choices: ["◇", "◆", "❧", "⌒"], answerIndex: 3 },
  { title: "The finished courtyard", prompt: "Complete the full court.", display: "⌒  ◆  ⌒\n❧  ◇  ❧", choices: ["◇", "◆", "❧", "⌒"], answerIndex: 3 },
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
  { id: "pattern-court", categoryId: "pattern-line", number: "I.A", title: "Pattern Court", houseLine: "Set every piece until the whole court agrees.", description: "Five construction puzzles. Place, swap and undo hand-set inlay pieces as each court adds a new constraint.", goal: "Complete the inlay so every row, edge and crossing follows the shown rule.", howToPlay: ["Choose a loose piece from the tray.", "Place it in an open or changeable cell; an existing piece returns to the tray.", "Use Undo, Reset, or Place one for me whenever you want."], kind: "choice", format: "house-original", version: "2.0.0", chapters: PATTERN_CHAPTERS },
  { id: "navakankari", categoryId: "pattern-line", number: "I.B", title: "Navakankari", houseLine: "Place the third piece and close the line.", description: "Five authored placement studies on the documented 24-point board—not a complete traditional match.", goal: "Place one brass piece to close the described line of three.", howToPlay: ["Read the position and the marked legal destinations.", "Choose the point that completes the requested line.", "If a point is wrong, trace only the board's drawn connections and try again."], kind: "classic", format: "authored-rule-study", classicStudyId: "navakankari", version: "1.0.0", chapterTitles: ["Outer court", "West passage", "Inner lintel", "Middle gallery", "Lower court"] },
  { id: "mirror-forge", categoryId: "turn-trap", number: "II.A", title: "Mirror Forge", houseLine: "Turn forms without losing their bearing.", description: "Five spatial turns that build from one compass mark to a forged sequence.", goal: "Choose the form produced by the requested clockwise turn.", howToPlay: ["Keep the displayed form's order fixed.", "Imagine the whole form turning together.", "Choose the resulting bearing; a wrong choice leaves the chapter open."], kind: "choice", format: "house-original", version: "1.0.0", chapters: MIRROR_CHAPTERS },
  { id: "aadu-puli-attam", categoryId: "turn-trap", number: "II.B", title: "Aadu Puli Aattam", houseLine: "Read one movement or tiger leap along a drawn line.", description: "Five authored goat-and-tiger movement studies—not setup, an opponent, or a complete match.", goal: "Choose the one legal destination described by this authored position.", howToPlay: ["Follow only lines drawn on the board.", "A goat moves one adjacent step; a tiger study may ask for a collinear leap over one goat.", "This table studies one move at a time and does not simulate a full match."], kind: "classic", format: "authored-rule-study", classicStudyId: "aadu-puli-attam", version: "1.0.0", chapterTitles: ["Apex leap", "Side passage", "Barred crossing", "Outer diagonal", "Inner ray"] },
  { id: "stack-architect", categoryId: "count-carry", number: "III.A", title: "Stack Architect", houseLine: "Move the tower by law, one disc at a time.", description: "Five handcrafted towers. Never place a larger disc on a smaller one.", goal: "Move the complete tower from the first plinth to the third.", howToPlay: ["Choose a plinth to lift its top disc.", "Choose another plinth to place it.", "A larger disc may never rest on a smaller disc; Reset restores this tower."], kind: "stack", format: "house-original", version: "1.0.0", diskCounts: [2, 3, 4, 5, 6], chapterTitles: ["2-disc tower", "3-disc tower", "4-disc tower", "5-disc tower", "6-disc tower"] },
  { id: "pallanguzhi", categoryId: "count-carry", number: "III.B", title: "Pallanguzhi", houseLine: "Lift, sow, relay, and gather through one bounded turn.", description: "Five authored turns on a two-by-seven pit board—not a full multi-round traditional match.", goal: "Choose the starting pit that produces the described sowing result.", howToPlay: ["Read each pit's visible seed count.", "Imagine lifting that pit and sowing one seed at a time along the shown direction.", "Choose the start that satisfies this one authored turn; the table is not a full match."], kind: "classic", format: "authored-rule-study", classicStudyId: "pallanguzhi", version: "1.0.0", chapterTitles: ["First carry", "Around the corner", "Relay hand", "Four-seed taking", "Beyond the empty pit"] },
  { id: "lantern-ledger", categoryId: "memory-sequence", number: "IV", title: "Lantern Ledger", houseLine: "Hold an ordered procession of light.", description: "Five visible sequences. Close the screen when ready, then choose the line you held.", goal: "Remember the procession's exact order and choose the matching line.", howToPlay: ["Study the visible lantern order for as long as you want.", "Cover the procession when ready, then choose the matching line.", "Reveal and study it again whenever you want; there is no penalty."], kind: "memory", format: "house-original", version: "1.0.0", chapters: LANTERN_CHAPTERS },
  { id: "sector-sprint", categoryId: "motion-route", number: "V", title: "Chandigarh: The Long Way Home", houseLine: "Cross from Sector 22 to the heart of Sector 17.", description: "A five-encounter Chandigarh outing with branching traversal, a scarf-deflection courtyard toy, a city wayfinder, and an equivalent text-led route.", goal: "Repair Gurpreet's paper display, carry it from Sector 22 to Sector 17, and bring the story home.", howToPlay: ["Move with arrows/WASD or the walk pad; Space/J jumps.", "Use Shift/K for the scarf action: dash on paths and deflect when the courtyard toy signals.", "City map explains the route; Read the route completes the same outing without motion or precision."], kind: "runner", format: "house-original", version: "3.0.0", chapterTitles: ["Leave the verandah", "Choose a way through", "The courtyard toy", "Find Sector 17", "Paper in the plaza"] },
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
