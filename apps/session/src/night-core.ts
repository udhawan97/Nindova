export type LegacyVista = "meadow" | "harbor";

export interface NightCapture {
  nightId: string;
  dawnDate: string;
  timeZone: string;
  recipeVersion: number;
  startedAt: string;
}

export interface RasoiCompletion extends Omit<NightCapture, "startedAt"> {
  kind: "rasoi-pairs";
  boardId: string;
  motifOrder: readonly string[];
}

export interface LegacyCompletion extends Omit<NightCapture, "startedAt"> {
  kind: "legacy-vista";
  recipeVersion: 1;
  vista: LegacyVista;
  finalKind: string;
}

export type NightCompletion = RasoiCompletion | LegacyCompletion;

export interface NightRecipe {
  version: number;
  boardId: string;
  motifOrder: readonly string[];
  cloth: "indigo" | "madder" | "mustard";
}

export interface NightState {
  version: number;
  lastCompleted: NightCompletion | null;
  legacyMemory: {
    meadowEcho: { nightId: string; kind: string } | null;
    harborEchoes: Array<{ nightId: string; kind: string }>;
  } | null;
  tomorrowIntention: { nightId: string } | null;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

"use strict";

const SCHEMA_VERSION = 3;
const RECIPE_VERSION = 2;
const STORAGE_KEY = "nindova:night-state:v3";
const LEGACY_STORAGE_KEYS = ["nindova:night-state:v2", "nindova:night-state:v1"] as const;
const MOTIFS = ["belan", "chakla", "tawa", "chimta", "katori", "tiffin", "masala", "chai", "cooker"] as const;
const LEGACY_MEADOW = ["sheep", "goose", "tortoise", "rabbit"] as const;
const LEGACY_HARBOR = ["skiff", "tug"] as const;
const CLOTHS = ["indigo", "madder", "mustard"] as const;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function localParts(date: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );
  return { date: `${values.year}-${values.month}-${values.day}`, hour: Number(values.hour) };
}

function addCivilDays(civilDate: string, days: number) {
  const [year, month, day] = civilDate.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
}

function captureNight(now: Date | string | number = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): Readonly<NightCapture> {
  const instant = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(instant.getTime())) throw new TypeError("captureNight requires a valid instant");
  if (!timeZone) throw new TypeError("captureNight requires an IANA time zone");
  const local = localParts(instant, timeZone);
  const dawnDate = local.hour < 12 ? local.date : addCivilDays(local.date, 1);
  return Object.freeze({
    nightId: `${dawnDate}|${timeZone}|r${RECIPE_VERSION}`,
    dawnDate,
    timeZone,
    recipeVersion: RECIPE_VERSION,
    startedAt: instant.toISOString(),
  });
}

function seedFrom(text: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function createPrng(seedText: string) {
  let value = seedFrom(seedText);
  return function next() {
    value = (value + 0x6d2b79f5) >>> 0;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(list: readonly T[], random: () => number): T[] {
  const result = [...list];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function recipeForNight(nightId: string): Readonly<NightRecipe> {
  if (!nightId) throw new TypeError("recipeForNight requires a nightId");
  const random = createPrng(`${nightId}|rasoi-pairs-${RECIPE_VERSION}`);
  const motifOrder = Object.freeze(shuffled(MOTIFS, random));
  return Object.freeze({
    version: RECIPE_VERSION,
    boardId: `rasoi-r${RECIPE_VERSION}-${seedFrom(nightId).toString(36)}`,
    motifOrder,
    cloth: CLOTHS[Math.floor(random() * CLOTHS.length)],
  });
}

function emptyState(): NightState {
  return { version: SCHEMA_VERSION, lastCompleted: null, legacyMemory: null, tomorrowIntention: null };
}

function isText(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length < 180;
}

function validBase(value: any) {
  return Boolean(value && isText(value.nightId) && /^\d{4}-\d{2}-\d{2}$/.test(value.dawnDate) && isText(value.timeZone));
}

function validRasoiCompletion(value: any): value is RasoiCompletion {
  return Boolean(
    validBase(value) && value.kind === "rasoi-pairs" && value.recipeVersion === RECIPE_VERSION && isText(value.boardId)
      && Array.isArray(value.motifOrder) && value.motifOrder.length === MOTIFS.length
      && new Set(value.motifOrder).size === MOTIFS.length && value.motifOrder.every((motif: string) => MOTIFS.includes(motif as any)),
  );
}

function validLegacyCompletion(value: any): value is LegacyCompletion {
  return Boolean(
    validBase(value) && value.kind === "legacy-vista" && value.recipeVersion === 1
      && (value.vista === "meadow" || value.vista === "harbor")
      && (value.vista === "meadow" ? LEGACY_MEADOW : LEGACY_HARBOR as readonly string[]).includes(value.finalKind),
  );
}

function sanitizeCompletion(value: any): NightCompletion | null {
  if (validRasoiCompletion(value)) {
    return {
      kind: "rasoi-pairs",
      nightId: value.nightId,
      dawnDate: value.dawnDate,
      timeZone: value.timeZone,
      recipeVersion: RECIPE_VERSION,
      boardId: value.boardId,
      motifOrder: [...value.motifOrder],
    };
  }
  if (validLegacyCompletion(value)) {
    return {
      kind: "legacy-vista",
      nightId: value.nightId,
      dawnDate: value.dawnDate,
      timeZone: value.timeZone,
      recipeVersion: 1,
      vista: value.vista,
      finalKind: value.finalKind,
    };
  }
  return null;
}

function sanitizeEcho(value: any, allowed: readonly string[]) {
  if (!value || !isText(value.nightId) || !allowed.includes(value.kind)) return null;
  return { nightId: value.nightId, kind: value.kind };
}

function sanitizeLegacyMemory(value: any): NightState["legacyMemory"] {
  if (!value) return null;
  const meadowEcho = sanitizeEcho(value.meadowEcho, LEGACY_MEADOW);
  const harborEchoes = Array.isArray(value.harborEchoes)
    ? value.harborEchoes.map((entry: any) => sanitizeEcho(entry, LEGACY_HARBOR)).filter(Boolean).slice(-5)
    : [];
  return meadowEcho || harborEchoes.length ? { meadowEcho, harborEchoes } : null;
}

function migrateLegacy(value: any): NightState | null {
  if (!value || (value.version !== 1 && value.version !== 2)) return null;
  const oldCompletion = value.lastCompleted;
  const lastCompleted = oldCompletion && validBase(oldCompletion) && oldCompletion.recipeVersion === 1
    && (oldCompletion.vista === "meadow" || oldCompletion.vista === "harbor")
    ? sanitizeCompletion({ ...oldCompletion, kind: "legacy-vista" })
    : null;
  return {
    version: SCHEMA_VERSION,
    lastCompleted,
    legacyMemory: sanitizeLegacyMemory(value),
    tomorrowIntention: value.tomorrowIntention && isText(value.tomorrowIntention.nightId)
      ? { nightId: value.tomorrowIntention.nightId }
      : null,
  };
}

function sanitizeState(value: any): NightState | null {
  if (!value || value.version !== SCHEMA_VERSION) return null;
  return {
    version: SCHEMA_VERSION,
    lastCompleted: value.lastCompleted === null ? null : sanitizeCompletion(value.lastCompleted),
    legacyMemory: sanitizeLegacyMemory(value.legacyMemory),
    tomorrowIntention: value.tomorrowIntention && isText(value.tomorrowIntention.nightId)
      ? { nightId: value.tomorrowIntention.nightId }
      : null,
  };
}

function decodeState(raw: string | null | undefined) {
  if (!raw) return { state: emptyState(), recovered: false, reason: "missing" };
  try {
    const parsed = JSON.parse(raw);
    const state = sanitizeState(parsed);
    if (state) return { state, recovered: false, reason: "ok" };
    const migrated = migrateLegacy(parsed);
    if (migrated) return { state: migrated, recovered: false, reason: "migrated" };
    return { state: emptyState(), recovered: true, reason: "unsupported" };
  } catch {
    return { state: emptyState(), recovered: true, reason: "corrupt" };
  }
}

function completeState(current: unknown, completion: RasoiCompletion) {
  const safeCompletion = sanitizeCompletion(completion);
  if (!safeCompletion || safeCompletion.kind !== "rasoi-pairs") throw new TypeError("completeState requires a valid Rasoi completion");
  const state = sanitizeState(current) || emptyState();
  if (state.lastCompleted?.nightId === completion.nightId) return { state, changed: false };
  return {
    state: { ...state, lastCompleted: safeCompletion, tomorrowIntention: null },
    changed: true,
  };
}

function readStorage(storage: StorageLike | null | undefined) {
  try {
    const current = storage?.getItem(STORAGE_KEY) ?? null;
    if (current !== null) {
      const decoded = decodeState(current);
      if (!decoded.recovered && JSON.stringify(decoded.state) !== current) {
        storage?.setItem(STORAGE_KEY, JSON.stringify(decoded.state));
      }
      return decoded;
    }
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacy = storage?.getItem(key) ?? null;
      if (legacy === null) continue;
      const migrated = decodeState(legacy);
      if (!migrated.recovered) storage?.setItem(STORAGE_KEY, JSON.stringify(migrated.state));
      return migrated;
    }
    return decodeState(null);
  } catch {
    return { state: emptyState(), recovered: true, reason: "unavailable" };
  }
}

function writeStorage(storage: StorageLike | null | undefined, state: unknown) {
  const safe = sanitizeState(state);
  if (!safe) return false;
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(safe));
    return true;
  } catch {
    return false;
  }
}

function setTomorrowIntention(current: unknown, nightId: string) {
  const state = sanitizeState(current) || emptyState();
  if (!state.lastCompleted || state.lastCompleted.nightId !== nightId) return { state, changed: false };
  if (state.tomorrowIntention?.nightId === nightId) return { state, changed: false };
  return { state: { ...state, tomorrowIntention: { nightId } }, changed: true };
}

export const NindovaNight = Object.freeze({
  SCHEMA_VERSION,
  RECIPE_VERSION,
  STORAGE_KEY,
  LEGACY_STORAGE_KEYS,
  addCivilDays,
  captureNight,
  completeState,
  createPrng,
  decodeState,
  emptyState,
  readStorage,
  recipeForNight,
  seedFrom,
  setTomorrowIntention,
  writeStorage,
});

export type NindovaNightApi = typeof NindovaNight;

declare global {
  var NindovaNight: NindovaNightApi;
}

globalThis.NindovaNight = NindovaNight;
