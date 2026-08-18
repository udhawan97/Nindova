import { NindovaNight, type NightCapture } from "./night-core.js";
import { NindovaRasoi, type RasoiBoard, type RasoiProfileId } from "./rasoi-core.js";

"use strict";

const ACTIVE_SESSION_VERSION = 4;
/** A device clock may sit slightly ahead of the instant a Session was written. */
const FUTURE_TOLERANCE_MS = 5000;

export type ActiveSessionPhase = "play" | "settling";
export type ActiveSessionEnding = "completed" | "production-cap";

export type ActiveSessionRejection =
  | "unreadable"
  | "schema"
  | "board-identity"
  | "settled-tiles"
  | "unreachable"
  | "settlement"
  | "clock";

export interface ActiveSessionRecord {
  readonly night: Readonly<NightCapture>;
  readonly board: RasoiBoard;
  readonly removed: ReadonlySet<string>;
  readonly phase: ActiveSessionPhase;
  readonly endReason: ActiveSessionEnding;
  readonly startedAtMs: number;
  readonly deadlineAtMs: number;
  readonly windDownAtMs: number;
  /** True when every pair had already left the Masala Mound. */
  readonly complete: boolean;
}

export interface ActiveSessionLimits {
  readonly hardCapSeconds: number;
  readonly windDownSeconds: number;
  /** The instant this device resumed, used to refuse Sessions from the future. */
  readonly restoredAtMs: number;
}

export type ActiveSessionDecoded =
  | { readonly status: "empty" }
  | { readonly status: "rejected"; readonly reason: ActiveSessionRejection }
  | { readonly status: "accepted"; readonly record: ActiveSessionRecord };

function rejected(reason: ActiveSessionRejection): ActiveSessionDecoded {
  return { status: "rejected", reason };
}

function isProfile(value: unknown): value is RasoiProfileId {
  return value === "gentle" || value === "deeper";
}

/**
 * Decide whether a stored same-tab Session may resume, without touching the DOM.
 *
 * Every rule about what a resumable Session *is* lives here, so the Session
 * surface only has to apply an accepted record or open a fresh intake. This
 * reads untrusted persisted state and therefore never throws: any unexpected
 * failure is a refusal, because a Night Room that cannot open is worse than a
 * Night Room that starts fresh.
 */
function decodeActiveSession(raw: string | null | undefined, limits: ActiveSessionLimits): ActiveSessionDecoded {
  if (!raw) return { status: "empty" };
  try {
    return decodeStoredSession(raw, limits);
  } catch {
    return rejected("unreadable");
  }
}

function decodeStoredSession(raw: string, limits: ActiveSessionLimits): ActiveSessionDecoded {
  const candidate: any = JSON.parse(raw);

  const night = NindovaNight.sanitizeCapture(candidate?.night);
  if (candidate?.version !== ACTIVE_SESSION_VERSION || !night || !Array.isArray(candidate.removed)
    || !isProfile(candidate.profile)
    || (candidate.phase !== "play" && candidate.phase !== "settling")
    || (candidate.endReason !== "completed" && candidate.endReason !== "production-cap")) {
    return rejected("schema");
  }
  const phase: ActiveSessionPhase = candidate.phase;
  const endReason: ActiveSessionEnding = candidate.endReason;

  const board = NindovaRasoi.createBoard(night.nightId, candidate.profile);
  if (board.id !== candidate.boardId) return rejected("board-identity");

  const known = new Set(board.tiles.map((tile) => tile.id));
  if (candidate.removed.some((tileId: unknown) => typeof tileId !== "string" || !known.has(tileId))
    || new Set(candidate.removed).size !== candidate.removed.length) {
    return rejected("settled-tiles");
  }
  const removed = new Set<string>(candidate.removed);
  if (!NindovaRasoi.isReachableState(board, removed)) return rejected("unreachable");

  const complete = NindovaRasoi.isComplete(board, removed);
  if ((phase === "play" && endReason !== "completed")
    || (phase === "settling" && endReason === "completed" && !complete)) {
    return rejected("settlement");
  }

  const startedAtMs = Number(candidate.startedAtMs);
  const deadlineAtMs = Number(candidate.deadlineAtMs);
  const windDownAtMs = Number(candidate.windDownAtMs);
  if (![startedAtMs, deadlineAtMs, windDownAtMs].every(Number.isFinite)
    || startedAtMs !== Date.parse(night.startedAt)
    || startedAtMs > limits.restoredAtMs + FUTURE_TOLERANCE_MS
    || deadlineAtMs - startedAtMs !== limits.hardCapSeconds * 1000
    || windDownAtMs - startedAtMs !== limits.windDownSeconds * 1000) {
    return rejected("clock");
  }

  return {
    status: "accepted",
    record: { night, board, removed, phase, endReason, startedAtMs, deadlineAtMs, windDownAtMs, complete },
  };
}

export const NindovaActiveSession = Object.freeze({
  ACTIVE_SESSION_VERSION,
  decodeActiveSession,
});

export type NindovaActiveSessionApi = typeof NindovaActiveSession;

declare global {
  var NindovaActiveSession: NindovaActiveSessionApi;
}

globalThis.NindovaActiveSession = NindovaActiveSession;
