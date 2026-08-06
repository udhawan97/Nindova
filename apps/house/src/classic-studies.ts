export type ClassicStudyId = "navakankari" | "aadu-puli-attam" | "pallanguzhi";

export type BoardPoint = { readonly id: number; readonly x: number; readonly y: number };

export type NavakankariChapter = {
  readonly title: string;
  readonly prompt: string;
  readonly own: readonly number[];
  readonly occupied: readonly number[];
  readonly options: readonly number[];
  readonly answerIndex: number;
};

export type AaduChapter = {
  readonly title: string;
  readonly prompt: string;
  readonly role: "tiger" | "goat";
  readonly tigers: readonly number[];
  readonly goats: readonly number[];
  readonly source: number;
  readonly options: readonly number[];
  readonly answerIndex: number;
};

export type PallanguzhiChapter = {
  readonly title: string;
  readonly prompt: string;
  readonly board: readonly number[];
  readonly options: readonly number[];
  readonly answerIndex: number;
};

export type ClassicStudy = {
  readonly id: ClassicStudyId;
  readonly documentedScope: string;
  readonly sourceLabel: string;
  readonly sourceUrl: string;
  readonly included: string;
  readonly omitted: string;
  readonly chapters: readonly (NavakankariChapter | AaduChapter | PallanguzhiChapter)[];
};

export const NAVAKANKARI_POINTS: readonly BoardPoint[] = [
  { id: 0, x: 0, y: 0 }, { id: 1, x: 50, y: 0 }, { id: 2, x: 100, y: 0 },
  { id: 3, x: 16.7, y: 16.7 }, { id: 4, x: 50, y: 16.7 }, { id: 5, x: 83.3, y: 16.7 },
  { id: 6, x: 33.3, y: 33.3 }, { id: 7, x: 50, y: 33.3 }, { id: 8, x: 66.7, y: 33.3 },
  { id: 9, x: 0, y: 50 }, { id: 10, x: 16.7, y: 50 }, { id: 11, x: 33.3, y: 50 },
  { id: 12, x: 66.7, y: 50 }, { id: 13, x: 83.3, y: 50 }, { id: 14, x: 100, y: 50 },
  { id: 15, x: 33.3, y: 66.7 }, { id: 16, x: 50, y: 66.7 }, { id: 17, x: 66.7, y: 66.7 },
  { id: 18, x: 16.7, y: 83.3 }, { id: 19, x: 50, y: 83.3 }, { id: 20, x: 83.3, y: 83.3 },
  { id: 21, x: 0, y: 100 }, { id: 22, x: 50, y: 100 }, { id: 23, x: 100, y: 100 },
] as const;

export const NAVAKANKARI_MILLS: readonly (readonly [number, number, number])[] = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11], [12, 13, 14], [15, 16, 17], [18, 19, 20], [21, 22, 23],
  [0, 9, 21], [3, 10, 18], [6, 11, 15], [1, 4, 7], [16, 19, 22], [8, 12, 17], [5, 13, 20], [2, 14, 23],
] as const;

export const AADU_POINTS: readonly BoardPoint[] = [
  { id: 0, x: 50, y: 4 },
  { id: 1, x: 4, y: 34 }, { id: 2, x: 34, y: 34 }, { id: 3, x: 44, y: 34 }, { id: 4, x: 56, y: 34 }, { id: 5, x: 66, y: 34 }, { id: 6, x: 96, y: 34 },
  { id: 7, x: 4, y: 51 }, { id: 8, x: 28, y: 51 }, { id: 9, x: 41, y: 51 }, { id: 10, x: 59, y: 51 }, { id: 11, x: 72, y: 51 }, { id: 12, x: 96, y: 51 },
  { id: 13, x: 4, y: 68 }, { id: 14, x: 20, y: 68 }, { id: 15, x: 40, y: 68 }, { id: 16, x: 60, y: 68 }, { id: 17, x: 80, y: 68 }, { id: 18, x: 96, y: 68 },
  { id: 19, x: 8, y: 94 }, { id: 20, x: 36, y: 94 }, { id: 21, x: 64, y: 94 }, { id: 22, x: 92, y: 94 },
] as const;

export const AADU_LINES: readonly (readonly number[])[] = [
  [1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22],
  [1, 7, 13], [6, 12, 18], [0, 2, 8, 14, 19], [0, 5, 11, 17, 22], [0, 3, 9, 15, 20], [0, 4, 10, 16, 21],
] as const;

export const PALLANGUZHI_TRAVERSAL = [0, 1, 2, 3, 4, 5, 6, 13, 12, 11, 10, 9, 8, 7] as const;

const NAVAKANKARI_CHAPTERS: readonly NavakankariChapter[] = [
  { title: "Outer court", prompt: "Place the brass piece to close a three-point line.", own: [0, 1], occupied: [4, 10], options: [2, 7, 9], answerIndex: 0 },
  { title: "West passage", prompt: "Complete the vertical mill at the outer edge.", own: [0, 9], occupied: [3, 13], options: [10, 21, 18], answerIndex: 1 },
  { title: "Inner lintel", prompt: "Close the shortest line across the inner square.", own: [6, 8], occupied: [3, 16], options: [11, 15, 7], answerIndex: 2 },
  { title: "Middle gallery", prompt: "Set the third piece in the open horizontal line.", own: [9, 10], occupied: [4, 13], options: [11, 18, 21], answerIndex: 0 },
  { title: "Lower court", prompt: "Complete the long line along the base.", own: [21, 23], occupied: [1, 19], options: [20, 22, 14], answerIndex: 1 },
] as const;

const AADU_CHAPTERS: readonly AaduChapter[] = [
  { title: "Apex leap", prompt: "Move the selected tiger over one goat along a drawn line.", role: "tiger", tigers: [0, 4, 5], goats: [3, 1, 6], source: 0, options: [9, 12, 18], answerIndex: 0 },
  { title: "Side passage", prompt: "Move the selected goat one step along a drawn line.", role: "goat", tigers: [0, 3, 4], goats: [13, 8, 9, 10, 11], source: 13, options: [6, 7, 22], answerIndex: 1 },
  { title: "Barred crossing", prompt: "Find the tiger's single-goat leap across the upper bar.", role: "tiger", tigers: [1, 4, 5], goats: [2, 8, 10], source: 1, options: [12, 18, 3], answerIndex: 2 },
  { title: "Outer diagonal", prompt: "Move the selected goat toward the open diagonal point.", role: "goat", tigers: [0, 5, 10], goats: [14, 9, 13, 16], source: 14, options: [8, 6, 22], answerIndex: 0 },
  { title: "Inner ray", prompt: "Move the selected tiger over one goat toward the apex.", role: "tiger", tigers: [20, 4, 5], goats: [15, 10, 14], source: 20, options: [12, 9, 18], answerIndex: 1 },
] as const;

const PALLANGUZHI_CHAPTERS: readonly PallanguzhiChapter[] = [
  { title: "First carry", prompt: "Choose the lower pit that carries two seeds into open pits.", board: [2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], options: [0, 1], answerIndex: 0 },
  { title: "Around the corner", prompt: "Choose the pit whose sowing crosses the turn of the board.", board: [0, 0, 0, 0, 1, 3, 0, 0, 0, 0, 0, 0, 0, 0], options: [4, 5], answerIndex: 1 },
  { title: "Relay hand", prompt: "Choose the pit that empties and immediately lifts the next occupied pit.", board: [1, 1, 2, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0], options: [2, 6, 0], answerIndex: 2 },
  { title: "Four-seed taking", prompt: "Choose the pit whose last seed makes exactly four in the next pit.", board: [1, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], options: [0, 1], answerIndex: 0 },
  { title: "Beyond the empty pit", prompt: "Choose the pit that reaches an empty pit, gathers from the following occupied pit, then continues from the next occupied pit.", board: [1, 0, 0, 5, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0], options: [3, 0, 6], answerIndex: 1 },
] as const;

export const CLASSIC_STUDIES: readonly ClassicStudy[] = [
  {
    id: "navakankari", documentedScope: "Navakankari board documented at Vadnagar, Gujarat",
    sourceLabel: "Gotad et al., Gamesmen and Board Game-Designs from Vadnagar, Heritage 12 (2024), pp. 989–990",
    sourceUrl: "https://www.heritageuniversityofkerala.com/JournalPDF/Volume12/31.pdf",
    included: "The 24 intersections, nine-piece placement idea, and the formation of three-piece mills.",
    omitted: "Movement, removal, flying, repetition, and full-match victory rules. This is a five-position authored study, not a complete traditional match.",
    chapters: NAVAKANKARI_CHAPTERS,
  },
  {
    id: "aadu-puli-attam", documentedScope: "Aadu Puli Aattam rules and board documented by the Indian Heritage Centre",
    sourceLabel: "Indian Heritage Centre, Aadu Puli Aatam printable rules",
    sourceUrl: "https://www.indianheritage.gov.sg/en/-/media/ihc2023/education/downloadable-resources/pdf/aadu-puli-aatam---printable.pdf",
    included: "The 23-point board, adjacent line movement, and a tiger's collinear leap over one goat.",
    omitted: "Placement order, repetition restrictions, five-capture victory, immobilisation victory, and a full opponent. This is a five-position authored study.",
    chapters: AADU_CHAPTERS,
  },
  {
    id: "pallanguzhi", documentedScope: "Pallankuzi rules documented by IIT Bombay D’Source; the source identifies the name as Tamil",
    sourceLabel: "IIT Bombay D’Source, Pallankuzi",
    sourceUrl: "https://dsource.in/resource/indian-games/board-games/pallankuzi",
    included: "Two rows of seven pits, anti-clockwise sowing, relay sowing, exact-four taking, and the empty-pit capture rule within authored mid-game turns.",
    omitted: "Multi-round refilling, rubbish pits, and winner totals. Each chapter is one authored turn, not a complete traditional match.",
    chapters: PALLANGUZHI_CHAPTERS,
  },
] as const;

export function getClassicStudy(id: ClassicStudyId): ClassicStudy {
  const study = CLASSIC_STUDIES.find((candidate) => candidate.id === id);
  if (!study) throw new Error(`Unknown classic study: ${id}`);
  return study;
}

export function formsNavakankariMill(ownPoints: readonly number[], target: number): boolean {
  const occupied = new Set([...ownPoints, target]);
  return NAVAKANKARI_MILLS.some((mill) => mill.every((point) => occupied.has(point)));
}

function numberedPoint(point: number): string {
  return `point ${point + 1}`;
}

function numberedPoints(points: readonly number[]): string {
  return points.map(numberedPoint).join(", ");
}

export function describeNavakankariOption(chapter: NavakankariChapter, optionIndex: number): string {
  const target = chapter.options[optionIndex];
  const choice = String.fromCharCode(65 + optionIndex);
  const strongestLine = NAVAKANKARI_MILLS
    .filter((mill) => mill.includes(target))
    .map((mill) => ({ mill, ownCount: mill.filter((point) => chapter.own.includes(point)).length }))
    .sort((a, b) => b.ownCount - a.ownCount)[0];
  const relation = strongestLine
    ? `Its strongest drawn line is ${numberedPoints(strongestLine.mill)}, containing ${strongestLine.ownCount} of your existing pieces.`
    : "It is not part of a documented mill line.";
  return `Choice ${choice}, ${numberedPoint(target)}. ${relation}`;
}

export function describeNavakankariChapter(chapter: NavakankariChapter): string {
  return `Your brass pieces are at ${numberedPoints(chapter.own)}. Dark occupied points are ${numberedPoints(chapter.occupied)}. ${chapter.options.map((_, index) => describeNavakankariOption(chapter, index)).join(" ")}`;
}

type AaduPosition = { readonly tigers: readonly number[]; readonly goats: readonly number[] };

function aaduStep(source: number, destination: number): { distance: 1 | 2; jumped?: number } | null {
  for (const line of AADU_LINES) {
    const from = line.indexOf(source);
    const to = line.indexOf(destination);
    const distance = Math.abs(to - from);
    if (from >= 0 && to >= 0 && distance === 1) return { distance: 1 };
    if (from >= 0 && to >= 0 && distance === 2) return { distance: 2, jumped: line[(from + to) / 2] };
  }
  return null;
}

export function describeAaduOption(chapter: AaduChapter, optionIndex: number): string {
  const destination = chapter.options[optionIndex];
  const choice = String.fromCharCode(65 + optionIndex);
  const step = aaduStep(chapter.source, destination);
  if (!step) return `Choice ${choice}, ${numberedPoint(destination)}. No drawn line directly connects it to the selected piece.`;
  if (step.distance === 1) return `Choice ${choice}, ${numberedPoint(destination)}. It is adjacent to the selected piece along a drawn line.`;
  const occupant = chapter.goats.includes(step.jumped!) ? "a goat" : chapter.tigers.includes(step.jumped!) ? "a tiger" : "an empty point";
  return `Choice ${choice}, ${numberedPoint(destination)}. It lies two steps away on one drawn line, with ${occupant} at ${numberedPoint(step.jumped!)} between.`;
}

export function describeAaduChapter(chapter: AaduChapter): string {
  return `The selected ${chapter.role} is at ${numberedPoint(chapter.source)}. Tigers occupy ${numberedPoints(chapter.tigers)}. Goats occupy ${numberedPoints(chapter.goats)}. ${chapter.options.map((_, index) => describeAaduOption(chapter, index)).join(" ")}`;
}

export function isLegalAaduMove(position: AaduPosition, role: "tiger" | "goat", source: number, destination: number): boolean {
  const own = role === "tiger" ? position.tigers : position.goats;
  const occupied = new Set([...position.tigers, ...position.goats]);
  if (!own.includes(source) || occupied.has(destination)) return false;
  const step = aaduStep(source, destination);
  if (!step) return false;
  if (step.distance === 1) return true;
  return role === "tiger" && step.jumped !== undefined && position.goats.includes(step.jumped);
}

export type PallanguzhiTurn = {
  readonly board: readonly number[];
  readonly captured: number;
  readonly deposits: number;
  readonly relays: number;
  readonly continuations: number;
  readonly finalPit: number;
};

export function playPallanguzhiStudyTurn(initialBoard: readonly number[], startPit: number): PallanguzhiTurn {
  if (initialBoard.length !== 14 || !initialBoard.every((seeds) => Number.isInteger(seeds) && seeds >= 0)) throw new Error("Pallanguzhi requires fourteen non-negative pit counts");
  if (startPit < 0 || startPit > 6 || initialBoard[startPit] === 0) throw new Error("Choose a non-empty lower-row pit");
  const board = [...initialBoard];
  let hand = board[startPit];
  board[startPit] = 0;
  let cursor = PALLANGUZHI_TRAVERSAL.indexOf(startPit as (typeof PALLANGUZHI_TRAVERSAL)[number]);
  let captured = 0;
  let deposits = 0;
  let relays = 0;
  let continuations = 0;
  let finalPit = startPit;
  let safety = 0;
  while (safety++ < 500) {
    while (hand > 0) {
      cursor = (cursor + 1) % PALLANGUZHI_TRAVERSAL.length;
      finalPit = PALLANGUZHI_TRAVERSAL[cursor];
      board[finalPit] += 1;
      hand -= 1;
      deposits += 1;
      if (board[finalPit] === 4) {
        captured += 4;
        board[finalPit] = 0;
      }
    }
    const nextCursor = (cursor + 1) % PALLANGUZHI_TRAVERSAL.length;
    const nextPit = PALLANGUZHI_TRAVERSAL[nextCursor];
    if (board[nextPit] > 0) {
      cursor = nextCursor;
      hand = board[nextPit];
      board[nextPit] = 0;
      relays += 1;
      continue;
    }
    const followingPit = PALLANGUZHI_TRAVERSAL[(nextCursor + 1) % PALLANGUZHI_TRAVERSAL.length];
    if (board[followingPit] > 0) {
      captured += board[followingPit];
      board[followingPit] = 0;
      cursor = (nextCursor + 1) % PALLANGUZHI_TRAVERSAL.length;
      let continuationFound = false;
      for (let offset = 1; offset <= PALLANGUZHI_TRAVERSAL.length; offset += 1) {
        const continuationCursor = (cursor + offset) % PALLANGUZHI_TRAVERSAL.length;
        const continuationPit = PALLANGUZHI_TRAVERSAL[continuationCursor];
        if (board[continuationPit] === 0) continue;
        cursor = continuationCursor;
        hand = board[continuationPit];
        board[continuationPit] = 0;
        continuations += 1;
        continuationFound = true;
        break;
      }
      if (continuationFound) continue;
    }
    return { board, captured, deposits, relays, continuations, finalPit };
  }
  throw new Error("Pallanguzhi study exceeded its finite turn boundary");
}

export function describePallanguzhiOption(chapter: PallanguzhiChapter, optionIndex: number): string {
  const pit = chapter.options[optionIndex];
  const outcome = playPallanguzhiStudyTurn(chapter.board, pit);
  const choice = String.fromCharCode(65 + optionIndex);
  return `Choice ${choice}, lower pit ${pit + 1} with ${chapter.board[pit]} seeds. The turn makes ${outcome.deposits} deposits, ${outcome.relays} relays, and ${outcome.continuations} post-capture continuations; it captures ${outcome.captured} seeds and ends its final deposit at pit ${outcome.finalPit + 1}.`;
}

export function describePallanguzhiChapter(chapter: PallanguzhiChapter): string {
  const lower = chapter.board.slice(0, 7).map((seeds, pit) => `pit ${pit + 1}: ${seeds}`).join(", ");
  const upper = [...PALLANGUZHI_TRAVERSAL].slice(7).map((pit) => `pit ${pit + 1}: ${chapter.board[pit]}`).join(", ");
  return `Lower row left to right: ${lower}. Top row left to right: ${upper}. Anti-clockwise order runs through lower pits 1 to 7, then top pits 14 to 8. ${chapter.options.map((_, index) => describePallanguzhiOption(chapter, index)).join(" ")}`;
}
