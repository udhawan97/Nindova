export type Vista = "meadow" | "harbor";

export interface NightCapture {
  nightId: string;
  dawnDate: string;
  timeZone: string;
  recipeVersion: number;
  startedAt: string;
}

export interface NightRecipe {
  version: number;
  weather: string;
  moon: string;
  objectKinds: readonly string[];
  meadowSpecies: readonly string[];
  harborBoats: readonly string[];
  meadowAccent: string;
  harborPaint: string;
}

export interface NightCompletion extends Omit<NightCapture, "startedAt"> {
  vista: Vista;
  finalKind: string;
}

export interface NightState {
  version: number;
  lastCompleted: NightCompletion | null;
  meadowEcho: { nightId: string; kind: string } | null;
  harborEchoes: Array<{ nightId: string; kind: string }>;
  tomorrowIntention: { nightId: string } | null;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

  "use strict";

  const SCHEMA_VERSION = 2;
  const RECIPE_VERSION = 1;
  const STORAGE_KEY = "nindova:night-state:v2";
  const LEGACY_STORAGE_KEY = "nindova:night-state:v1";
  const WEATHER = ["soft-monsoon", "still-haze", "distant-rain", "clear-indigo"] as const;
  const MOONS = ["crescent", "half", "veiled"] as const;
  const OBJECTS = ["letter", "key", "mug", "book", "coin", "spool", "watch", "photo", "leaf", "pencil"] as const;
  const MEADOW_SPECIES = ["sheep", "goose", "tortoise", "rabbit"] as const;
  const HARBOR_BOATS = ["skiff", "tug"] as const;
  const MEADOW_ACCENTS = ["marigold", "saffron", "wheat"] as const;
  const HARBOR_PAINTS = ["indigo", "madder", "marigold"] as const;

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
    return {
      date: `${values.year}-${values.month}-${values.day}`,
      hour: Number(values.hour),
    };
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

  function pick<T>(list: readonly T[], random: () => number): T {
    return list[Math.floor(random() * list.length)];
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
    if (typeof nightId !== "string" || !nightId) throw new TypeError("recipeForNight requires a nightId");
    const random = createPrng(`${nightId}|recipe-${RECIPE_VERSION}`);
    return Object.freeze({
      version: RECIPE_VERSION,
      weather: pick(WEATHER, random),
      moon: pick(MOONS, random),
      objectKinds: Object.freeze(shuffled(OBJECTS, random).slice(0, 5)),
      meadowSpecies: Object.freeze(shuffled(MEADOW_SPECIES, random)),
      harborBoats: Object.freeze(shuffled(HARBOR_BOATS, random)),
      meadowAccent: pick(MEADOW_ACCENTS, random),
      harborPaint: pick(HARBOR_PAINTS, random),
    });
  }

  function emptyState(): NightState {
    return {
      version: SCHEMA_VERSION,
      lastCompleted: null,
      meadowEcho: null,
      harborEchoes: [],
      tomorrowIntention: null,
    };
  }

  function isText(value: unknown): value is string {
    return typeof value === "string" && value.length > 0 && value.length < 180;
  }

  function validCompletion(value: any): value is NightCompletion {
    return Boolean(
      value &&
        isText(value.nightId) &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.dawnDate) &&
        isText(value.timeZone) &&
        value.recipeVersion === RECIPE_VERSION &&
        (value.vista === "meadow" || value.vista === "harbor") &&
        (value.vista === "meadow" ? MEADOW_SPECIES : HARBOR_BOATS as readonly string[]).includes(value.finalKind),
    );
  }

  function sanitizeCompletion(value: any): NightCompletion | null {
    if (!validCompletion(value)) return null;
    return {
      nightId: value.nightId,
      dawnDate: value.dawnDate,
      timeZone: value.timeZone,
      recipeVersion: value.recipeVersion,
      vista: value.vista,
      finalKind: value.finalKind,
    };
  }

  function sanitizeEcho(value: any, kindKey: "kind", allowed: readonly string[]): { nightId: string; kind: string } | null {
    if (!value || !isText(value.nightId) || !allowed.includes(value[kindKey])) return null;
    return { nightId: value.nightId, [kindKey]: value[kindKey] };
  }

  function sanitizeState(value: any): NightState | null {
    if (!value || (value.version !== SCHEMA_VERSION && value.version !== 1)) return null;
    const lastCompleted = value.lastCompleted === null ? null : sanitizeCompletion(value.lastCompleted);
    const meadowEcho = sanitizeEcho(value.meadowEcho, "kind", MEADOW_SPECIES);
    const harborEchoes = Array.isArray(value.harborEchoes)
      ? value.harborEchoes.map((echo: any) => sanitizeEcho(echo, "kind", HARBOR_BOATS)).filter((echo: { nightId: string; kind: string } | null): echo is { nightId: string; kind: string } => Boolean(echo)).slice(-5)
      : [];
    const tomorrowIntention = value.version === SCHEMA_VERSION && value.tomorrowIntention
      && isText(value.tomorrowIntention.nightId)
      ? { nightId: value.tomorrowIntention.nightId }
      : null;
    return { version: SCHEMA_VERSION, lastCompleted, meadowEcho, harborEchoes, tomorrowIntention };
  }

  function decodeState(raw: string | null | undefined): { state: NightState; recovered: boolean; reason: string } {
    if (raw === null || raw === undefined || raw === "") return { state: emptyState(), recovered: false, reason: "missing" };
    try {
      const parsed = JSON.parse(raw);
      const state = sanitizeState(parsed);
      if (!state) return { state: emptyState(), recovered: true, reason: "unsupported" };
      return { state, recovered: false, reason: parsed.version === 1 ? "migrated" : "ok" };
    } catch {
      return { state: emptyState(), recovered: true, reason: "corrupt" };
    }
  }

  function completeState(current: unknown, completion: NightCompletion): { state: NightState; changed: boolean } {
    if (!validCompletion(completion)) throw new TypeError("completeState requires a valid completion");
    const state = sanitizeState(current) || emptyState();
    if (state.lastCompleted?.nightId === completion.nightId) return { state, changed: false };

    const next = {
      version: SCHEMA_VERSION,
      lastCompleted: sanitizeCompletion(completion)!,
      meadowEcho: state.meadowEcho,
      harborEchoes: [...state.harborEchoes],
      tomorrowIntention: null,
    };
    if (completion.vista === "meadow") {
      next.meadowEcho = { nightId: completion.nightId, kind: completion.finalKind };
    } else {
      next.harborEchoes = [...next.harborEchoes, { nightId: completion.nightId, kind: completion.finalKind }].slice(-5);
    }
    return { state: next, changed: true };
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
      const legacy = storage?.getItem(LEGACY_STORAGE_KEY) ?? null;
      if (legacy === null) return decodeState(null);
      const migrated = decodeState(legacy);
      if (!migrated.recovered) {
        storage?.setItem(STORAGE_KEY, JSON.stringify(migrated.state));
        storage?.removeItem?.(LEGACY_STORAGE_KEY);
      }
      return migrated;
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
    if (!state.lastCompleted || state.lastCompleted.nightId !== nightId) {
      return { state, changed: false };
    }
    if (state.tomorrowIntention?.nightId === nightId) return { state, changed: false };
    return {
      state: {
        ...state,
        tomorrowIntention: { nightId },
      },
      changed: true,
    };
  }

  export const NindovaNight = Object.freeze({
    SCHEMA_VERSION,
    RECIPE_VERSION,
    STORAGE_KEY,
    LEGACY_STORAGE_KEY,
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
