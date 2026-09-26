export type PatternMark = "diamond" | "sun" | "leaf" | "arch";

export type PatternPuzzle = {
  readonly title: string;
  readonly goal: string;
  readonly rule: string;
  readonly target: readonly PatternMark[];
  readonly fixed: readonly number[];
};

export type PatternSnapshot = {
  readonly board: readonly (PatternMark | null)[];
  readonly tray: readonly PatternMark[];
};

export type PatternState = PatternSnapshot & {
  readonly selected: number | null;
  readonly history: readonly PatternSnapshot[];
};

export const PATTERN_PUZZLES: readonly PatternPuzzle[] = [
  {
    title: "Alternating inlay",
    goal: "Complete three alternating lines.",
    rule: "Every row alternates diamond and sun. The next row begins with the other mark.",
    target: ["diamond", "sun", "diamond", "sun", "diamond", "sun", "diamond", "sun", "diamond"],
    fixed: [0, 3, 4, 8],
  },
  {
    title: "The returning leaf",
    goal: "Set the leaf at the end of every procession.",
    rule: "Each row reads diamond, sun, leaf. Each column repeats one mark.",
    target: ["diamond", "sun", "leaf", "diamond", "sun", "leaf", "diamond", "sun", "leaf"],
    fixed: [0, 2, 4, 6],
  },
  {
    title: "Court turns",
    goal: "Build a panel that turns around its center.",
    rule: "Opposite corners match. The four edge pieces alternate sun and leaf around the central arch.",
    target: ["diamond", "sun", "diamond", "leaf", "arch", "leaf", "diamond", "sun", "diamond"],
    fixed: [0, 4, 7],
  },
  {
    title: "Two crossing paths",
    goal: "Join both diagonals without breaking the outer rhythm.",
    rule: "The arches cross corner to corner. Sun and leaf alternate around the four outer edges.",
    target: ["arch", "sun", "arch", "leaf", "arch", "leaf", "arch", "sun", "arch"],
    fixed: [0, 3, 4, 8],
  },
  {
    title: "The finished courtyard",
    goal: "Complete the full court from all four rules.",
    rule: "Arches anchor the corners. Matching leaves face left and right, and suns face top and bottom around the central diamond.",
    target: ["arch", "sun", "arch", "leaf", "diamond", "leaf", "arch", "sun", "arch"],
    fixed: [0, 2, 4],
  },
] as const;

const marks: readonly PatternMark[] = ["diamond", "sun", "leaf", "arch"];

export function isPatternMark(value: unknown): value is PatternMark {
  return typeof value === "string" && marks.includes(value as PatternMark);
}

export function createPatternState(chapter: number): PatternState {
  const puzzle = PATTERN_PUZZLES[chapter] ?? PATTERN_PUZZLES[0];
  const fixed = new Set(puzzle.fixed);
  const board = puzzle.target.map((mark, index) => fixed.has(index) ? mark : null);
  const tray = puzzle.target.filter((_, index) => !fixed.has(index)).reverse();
  return { board, tray, selected: null, history: [] };
}

export function sanitizePatternState(value: unknown, chapter: number): PatternState {
  const initial = createPatternState(chapter);
  if (!value || typeof value !== "object") return initial;
  const record = value as Partial<PatternState>;
  const puzzle = PATTERN_PUZZLES[chapter] ?? PATTERN_PUZZLES[0];
  const validSnapshot = (snapshot: Partial<PatternSnapshot>): boolean => {
    if (!Array.isArray(snapshot.board) || snapshot.board.length !== 9 || !snapshot.board.every((mark) => mark === null || isPatternMark(mark))) return false;
    if (!Array.isArray(snapshot.tray) || !snapshot.tray.every(isPatternMark)) return false;
    if (!puzzle.fixed.every((index) => snapshot.board![index] === puzzle.target[index])) return false;
    const supplied = [...snapshot.board.filter(isPatternMark), ...snapshot.tray].sort();
    return supplied.join("|") === [...puzzle.target].sort().join("|");
  };
  if (!validSnapshot(record)) return initial;
  const board = record.board as readonly (PatternMark | null)[];
  const tray = record.tray as readonly PatternMark[];
  const history = Array.isArray(record.history)
    ? record.history.slice(-18).filter((entry): entry is PatternSnapshot =>
      Boolean(entry) && typeof entry === "object" && validSnapshot(entry as Partial<PatternSnapshot>),
    ).map((entry) => ({ board: [...entry.board], tray: [...entry.tray] }))
    : [];
  const selected = Number.isInteger(record.selected) && Number(record.selected) >= 0 && Number(record.selected) < tray.length ? Number(record.selected) : null;
  return { board: [...board], tray: [...tray], selected, history };
}

export function selectPatternPiece(state: PatternState, index: number): PatternState {
  if (!Number.isInteger(index) || index < 0 || index >= state.tray.length) return state;
  return { ...state, selected: state.selected === index ? null : index };
}

export function placePatternPiece(state: PatternState, chapter: number, cell: number): PatternState {
  const puzzle = PATTERN_PUZZLES[chapter] ?? PATTERN_PUZZLES[0];
  if (state.selected === null || puzzle.fixed.includes(cell) || cell < 0 || cell >= 9) return state;
  const mark = state.tray[state.selected];
  if (!mark) return state;
  const previous = { board: [...state.board], tray: [...state.tray] };
  const board = [...state.board];
  const tray = [...state.tray];
  const displaced = board[cell];
  board[cell] = mark;
  tray.splice(state.selected, 1);
  if (displaced) tray.push(displaced);
  return { board, tray, selected: null, history: [...state.history, previous].slice(-18) };
}

export function undoPattern(state: PatternState): PatternState {
  const previous = state.history.at(-1);
  if (!previous) return state;
  return { board: [...previous.board], tray: [...previous.tray], selected: null, history: state.history.slice(0, -1) };
}

export function assistPattern(state: PatternState, chapter: number): PatternState {
  const puzzle = PATTERN_PUZZLES[chapter] ?? PATTERN_PUZZLES[0];
  const cell = state.board.findIndex((mark, index) => !puzzle.fixed.includes(index) && mark !== puzzle.target[index]);
  if (cell < 0) return state;
  const wanted = puzzle.target[cell];
  let source = state.tray.findIndex((mark) => mark === wanted);
  let working = state;
  if (source < 0) {
    source = state.board.findIndex((mark, index) => !puzzle.fixed.includes(index) && index !== cell && mark === wanted && mark !== puzzle.target[index]);
    if (source < 0) return state;
    const targetMark = state.board[cell];
    const board = [...state.board];
    board[cell] = wanted;
    board[source] = targetMark;
    return { board, tray: [...state.tray], selected: null, history: [...state.history, { board: [...state.board], tray: [...state.tray] }].slice(-18) };
  }
  working = selectPatternPiece(state, source);
  return placePatternPiece(working, chapter, cell);
}

export function patternConflicts(state: PatternState, chapter: number): number[] {
  const target = (PATTERN_PUZZLES[chapter] ?? PATTERN_PUZZLES[0]).target;
  return state.board.flatMap((mark, index) => mark !== null && mark !== target[index] ? [index] : []);
}

export function patternSolved(state: PatternState, chapter: number): boolean {
  const target = (PATTERN_PUZZLES[chapter] ?? PATTERN_PUZZLES[0]).target;
  return state.tray.length === 0 && state.board.every((mark, index) => mark === target[index]);
}

export function patternMarkLabel(mark: PatternMark): string {
  return ({ diamond: "Diamond", sun: "Sun", leaf: "Leaf", arch: "Arch" } as const)[mark];
}
