import { restoreStackPegs, initialPegs } from "./stack-architect.js";
import { GRAND_SALON, type GameId } from "./salon-catalog.js";
import type { ActiveGame, ActiveSessionCodec } from "./house-state.js";

function validBase(value: unknown): { record: Partial<ActiveGame>; gameId: GameId; chapter: number } | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Partial<ActiveGame>;
  if (!GRAND_SALON.hasGame(record.gameId)) return null;
  const chapter = Number(record.chapter);
  if (!Number.isInteger(chapter) || chapter < 0 || chapter > 4 || typeof record.runId !== "string") return null;
  return { record, gameId: record.gameId, chapter };
}

export const HOUSE_ACTIVE_SESSION_CODEC: ActiveSessionCodec = Object.freeze({
  decode(value) {
    const base = validBase(value);
    if (!base) return { active: null, discardedRunner: false };
    const game = GRAND_SALON.game(base.gameId);
    if (game.kind === "runner") return { active: null, discardedRunner: true };
    const diskCount = game.kind === "stack" ? game.diskCounts[base.chapter] ?? 0 : 0;
    const pegs = game.kind === "stack" ? restoreStackPegs(base.record.pegs, diskCount) : initialPegs(0);
    const stackChanged = game.kind === "stack" && JSON.stringify(pegs) !== JSON.stringify(initialPegs(diskCount));
    return {
      discardedRunner: false,
      active: {
        gameId: game.id,
        chapter: base.chapter,
        runId: base.record.runId!,
        memoryCovered: Boolean(base.record.memoryCovered),
        pegs,
        selectedPeg: null,
        resolving: false,
        storyBeat: null,
        touched: Boolean(base.record.touched) || base.chapter > 0 || Boolean(base.record.memoryCovered) || stackChanged,
      },
    };
  },
  encode(active) {
    const game = GRAND_SALON.game(active.gameId);
    if (game.kind === "runner") return { gameId: active.gameId, chapter: active.chapter, runId: active.runId, storyBeat: active.storyBeat };
    return {
      gameId: active.gameId,
      chapter: active.chapter,
      runId: active.runId,
      memoryCovered: active.memoryCovered,
      pegs: active.pegs.map((peg) => [...peg]),
      touched: active.touched,
    };
  },
});
