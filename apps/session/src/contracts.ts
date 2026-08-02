export type SessionState =
  | "intake"
  | "arrive"
  | "play"
  | "wipe"
  | "approach"
  | "vista"
  | "drift"
  | "return"
  | "sign"
  | "dark"
  | "end";

export interface SessionObjectSnapshot {
  id: number;
  x: number;
  y: number;
  state: string;
  label: string | null;
}

export interface ClosingTimeDebug {
  readonly state: SessionState;
  readonly decay: number;
  readonly objects: SessionObjectSnapshot[];
  readonly slots: ReadonlyArray<{
    x: number;
    y: number;
    drawer: number | null;
    occupied: boolean;
  }>;
  readonly entities: ReadonlyArray<{
    kind: string;
    x: number;
    y: number;
    phase: string;
    final: boolean;
  }>;
  readonly vistaT: number;
  readonly portraitMode: boolean;
  readonly reduceMotion: boolean;
  readonly pointerDown: boolean;
  readonly dragging: boolean;
  toScreen(x: number, y: number): { x: number; y: number };
  lightLamp(): void;
  nameObject(index: number, text: string): void;
  setVista(vista: "meadow" | "harbor"): void;
  storeNext(): boolean;
  setDecay(decay: number): void;
  finishWipe(): void;
  vistaTapNext(): boolean;
  setVistaT(fraction: number): void;
  finishDrift(): void;
  tapSign(): void;
}

declare global {
  interface Window {
    __ct: ClosingTimeDebug;
  }
}

export {};
