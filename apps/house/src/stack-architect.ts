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

export function restoreStackPegs(pegs: unknown, diskCount: number): number[][] {
  return isValidStackState(pegs, diskCount) ? pegs.map((peg) => [...peg]) : initialPegs(diskCount);
}

export function stackSolved(pegs: readonly (readonly number[])[], diskCount: number): boolean {
  return pegs[2]?.length === diskCount;
}
