import type { SessionState } from "./contracts.js";

"use strict";

/**
 * What the Session surface must do at one instant.
 *
 * `continue` leaves the Session exactly as it is, `settle` closes the board
 * under its lid, and `rest` ends the arc at the quiet Rest view.
 */
export type BoundaryOutcome = "continue" | "settle" | "rest";

export interface BoundaryThresholds {
  /** Instant an open board must begin settling. */
  readonly windDownAtMs: number;
  /** Absolute instant the Session must be over, honouring the product cap. */
  readonly deadlineAtMs: number;
}

/**
 * Decide what a Session owes the person at `currentMs`.
 *
 * Every phase is answered here so no phase can quietly outlive the cap. A
 * non-finite instant or threshold compares false and therefore yields
 * `continue`, so corrupt clock data can never close a Session by accident.
 */
function boundaryOutcome(phase: SessionState, currentMs: number, thresholds: BoundaryThresholds): BoundaryOutcome {
  const { windDownAtMs, deadlineAtMs } = thresholds;
  if (phase === "play") {
    // Retained as a disjunction rather than the earlier of the two bounds: the
    // wind-down instant precedes the deadline for every Session this product
    // starts, but a reordered or partially corrupt pair must still close play.
    return currentMs >= deadlineAtMs || currentMs >= windDownAtMs ? "settle" : "continue";
  }
  // `settling` is included deliberately. A board that began settling but never
  // reached its end card would otherwise hold the Session open past the cap.
  if (phase === "settling" || phase === "end" || phase === "drift") {
    return currentMs >= deadlineAtMs ? "rest" : "continue";
  }
  return "continue";
}

export const NindovaBoundary = Object.freeze({
  boundaryOutcome,
});

export type NindovaBoundaryApi = typeof NindovaBoundary;

declare global {
  var NindovaBoundary: NindovaBoundaryApi;
}

globalThis.NindovaBoundary = NindovaBoundary;
