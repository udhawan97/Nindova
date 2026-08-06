import type { ActiveDecodeResult, ActiveGame } from "./house-state.js";

export function decodeSectorSprintActive(value: unknown): ActiveDecodeResult | null {
  if (!value || typeof value !== "object" || (value as { gameId?: unknown }).gameId !== "sector-sprint") return null;
  return { active: null, discardedRunner: true };
}

export function encodeSectorSprintActive(active: ActiveGame): unknown | null {
  if (active.gameId !== "sector-sprint") return null;
  return { gameId: active.gameId, chapter: active.chapter, runId: active.runId, storyBeat: active.storyBeat };
}
