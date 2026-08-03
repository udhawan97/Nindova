(function installNindovaNight(global) {
  "use strict";

  const SCHEMA_VERSION = 1;
  const RECIPE_VERSION = 1;
  const STORAGE_KEY = "nindova:night-state:v1";
  const WEATHER = ["soft-monsoon", "still-haze", "distant-rain", "clear-indigo"];
  const MOONS = ["crescent", "half", "veiled"];
  const OBJECTS = ["letter", "key", "mug", "book", "coin", "spool", "watch", "photo", "leaf", "pencil"];
  const MEADOW_SPECIES = ["sheep", "goose", "tortoise", "rabbit"];
  const HARBOR_BOATS = ["skiff", "tug"];
  const MEADOW_ACCENTS = ["marigold", "saffron", "wheat"];
  const HARBOR_PAINTS = ["indigo", "madder", "marigold"];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function localParts(date, timeZone) {
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

  function addCivilDays(civilDate, days) {
    const [year, month, day] = civilDate.split("-").map(Number);
    const next = new Date(Date.UTC(year, month - 1, day + days));
    return `${next.getUTCFullYear()}-${pad(next.getUTCMonth() + 1)}-${pad(next.getUTCDate())}`;
  }

  function captureNight(now = new Date(), timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone) {
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

  function seedFrom(text) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
  }

  function createPrng(seedText) {
    let value = seedFrom(seedText);
    return function next() {
      value = (value + 0x6d2b79f5) >>> 0;
      let mixed = value;
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  function pick(list, random) {
    return list[Math.floor(random() * list.length)];
  }

  function shuffled(list, random) {
    const result = [...list];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }

  function recipeForNight(nightId) {
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

  function emptyState() {
    return {
      version: SCHEMA_VERSION,
      lastCompleted: null,
      meadowEcho: null,
      harborEchoes: [],
    };
  }

  function isText(value) {
    return typeof value === "string" && value.length > 0 && value.length < 180;
  }

  function validCompletion(value) {
    return Boolean(
      value &&
        isText(value.nightId) &&
        /^\d{4}-\d{2}-\d{2}$/.test(value.dawnDate) &&
        isText(value.timeZone) &&
        value.recipeVersion === RECIPE_VERSION &&
        (value.vista === "meadow" || value.vista === "harbor") &&
        (value.vista === "meadow" ? MEADOW_SPECIES : HARBOR_BOATS).includes(value.finalKind) &&
        isText(value.completedAt),
    );
  }

  function sanitizeEcho(value, kindKey, allowed) {
    if (!value || !isText(value.nightId) || !allowed.includes(value[kindKey])) return null;
    return { nightId: value.nightId, [kindKey]: value[kindKey] };
  }

  function sanitizeState(value) {
    if (!value || value.version !== SCHEMA_VERSION) return null;
    const lastCompleted = value.lastCompleted === null ? null : validCompletion(value.lastCompleted) ? { ...value.lastCompleted } : null;
    const meadowEcho = sanitizeEcho(value.meadowEcho, "kind", MEADOW_SPECIES);
    const harborEchoes = Array.isArray(value.harborEchoes)
      ? value.harborEchoes.map((echo) => sanitizeEcho(echo, "kind", HARBOR_BOATS)).filter(Boolean).slice(-5)
      : [];
    return { version: SCHEMA_VERSION, lastCompleted, meadowEcho, harborEchoes };
  }

  function decodeState(raw) {
    if (raw === null || raw === undefined || raw === "") return { state: emptyState(), recovered: false, reason: "missing" };
    try {
      const parsed = JSON.parse(raw);
      const state = sanitizeState(parsed);
      if (!state) return { state: emptyState(), recovered: true, reason: "unsupported" };
      return { state, recovered: false, reason: "ok" };
    } catch {
      return { state: emptyState(), recovered: true, reason: "corrupt" };
    }
  }

  function completeState(current, completion) {
    if (!validCompletion(completion)) throw new TypeError("completeState requires a valid completion");
    const state = sanitizeState(current) || emptyState();
    if (state.lastCompleted?.nightId === completion.nightId) return { state, changed: false };

    const next = {
      version: SCHEMA_VERSION,
      lastCompleted: { ...completion },
      meadowEcho: state.meadowEcho,
      harborEchoes: [...state.harborEchoes],
    };
    if (completion.vista === "meadow") {
      next.meadowEcho = { nightId: completion.nightId, kind: completion.finalKind };
    } else {
      next.harborEchoes = [...next.harborEchoes, { nightId: completion.nightId, kind: completion.finalKind }].slice(-5);
    }
    return { state: next, changed: true };
  }

  function readStorage(storage) {
    try {
      return decodeState(storage?.getItem(STORAGE_KEY) ?? null);
    } catch {
      return { state: emptyState(), recovered: true, reason: "unavailable" };
    }
  }

  function writeStorage(storage, state) {
    const safe = sanitizeState(state);
    if (!safe) return false;
    try {
      storage?.setItem(STORAGE_KEY, JSON.stringify(safe));
      return true;
    } catch {
      return false;
    }
  }

  global.NindovaNight = Object.freeze({
    SCHEMA_VERSION,
    RECIPE_VERSION,
    STORAGE_KEY,
    addCivilDays,
    captureNight,
    completeState,
    createPrng,
    decodeState,
    emptyState,
    readStorage,
    recipeForNight,
    seedFrom,
    writeStorage,
  });
})(globalThis);
