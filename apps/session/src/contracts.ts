import type { RasoiBoard, RasoiMotifId } from "./rasoi-core.js";

export type SessionState = "intake" | "dismissed" | "play" | "settling" | "end" | "drift" | "rest" | "dawn";

export interface RasoiTileSnapshot {
  readonly id: string;
  readonly row: number;
  readonly slot: number;
  readonly depth: number;
  readonly x: number;
  readonly y: number;
  readonly layer: number;
  readonly motif: RasoiMotifId;
  readonly availability: "free" | "covered" | "side-blocked" | "removed" | "missing";
  readonly free: boolean;
  readonly removed: boolean;
  readonly selected: boolean;
}

export interface RasoiDebug {
  readonly version: 1;
  readonly state: SessionState;
  readonly board: RasoiBoard | null;
  readonly tiles: readonly RasoiTileSnapshot[];
  readonly selectedTile: string | null;
  readonly legalPairs: ReadonlyArray<readonly [string, string]>;
  readonly removedTileCount: number;
  readonly reviewerMode: boolean;
  readonly reduceMotion: boolean;
  readonly audioEnabled: boolean;
  readonly sessionElapsed: number;
  readonly hardCapSeconds: number;
  readonly endReason: "completed" | "production-cap";
  readonly night: null | {
    nightId: string;
    dawnDate: string;
    timeZone: string;
    recipeVersion: number;
  };
  readonly memory: Record<string, unknown>;
  readonly localRecovery: { recovered: boolean; reason: string };
  readonly dawnEligibility: { available: boolean; reason: string };
  selectTile(tileId: string): boolean;
  hint(): readonly [string, string] | null;
  finish(): void;
  advanceBy(seconds: number): boolean;
  setDawnNow(instant: string): boolean;
  setLoopUnsupported(value: boolean): boolean;
  openDawn(): Promise<boolean>;
}

declare global {
  interface Window {
    __rasoi: RasoiDebug;
    __ct: RasoiDebug;
  }
}

export {};
