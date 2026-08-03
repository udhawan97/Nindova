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
  kind: string;
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
  readonly reviewerMode: boolean;
  readonly paceKey: "compressed" | "real";
  readonly sessionElapsed: number;
  readonly hardCapSeconds: number;
  readonly capClosing: boolean;
  readonly endReason: "completed" | "production-cap";
  readonly spriteReady: boolean;
  readonly authoredAccents: readonly string[];
  readonly assistance: {
    snapRadius: number;
    magnetism: number;
    requiredGestureDistance: number;
    autonomousWait: number;
  };
  readonly light: {
    progress: number;
    meanBudget: number;
    peakBudget: number;
    focus: number;
    veil: number;
  };
  readonly night: null | {
    nightId: string;
    dawnDate: string;
    timeZone: string;
    recipeVersion: number;
    startedAt: string;
  };
  readonly recipe: {
    version: number;
    weather: string;
    moon: string;
    objectKinds: readonly string[];
    meadowSpecies: readonly string[];
    harborBoats: readonly string[];
    meadowAccent: string;
    harborPaint: string;
  };
  readonly memory: {
    version: number;
    lastCompleted: Record<string, unknown> | null;
    meadowEcho: Record<string, unknown> | null;
    harborEchoes: ReadonlyArray<Record<string, unknown>>;
  };
  readonly localRecovery: { recovered: boolean; reason: string };
  readonly dawnEligibility: { available: boolean; reason: string };
  readonly dawnLoopType: string | null;
  readonly dawnLoop: null | { type: string; extension: string; durationMs: number; size: number };
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
  sampleAssistance(decay: number): ClosingTimeDebug["assistance"];
  sampleLightBudget(progress: number): Pick<ClosingTimeDebug["light"], "progress" | "meanBudget" | "peakBudget">;
  recipeForNight(nightId: string): ClosingTimeDebug["recipe"];
  setDawnNow(instant: string): boolean;
  setLoopUnsupported(value: boolean): boolean;
  openDawn(): Promise<boolean>;
  advanceBy(seconds: number): boolean;
}

declare global {
  interface Window {
    __ct: ClosingTimeDebug;
  }
}

export {};
