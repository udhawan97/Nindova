import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const State = await import(resolve(root, "apps/house/dist/house-state.js"));
const Session = await import(resolve(root, "apps/house/dist/house-session-codec.js"));

function memoryStorage(initial = {}, failures = {}) {
  const values = new Map(Object.entries(initial));
  const calls = [];
  return {
    calls,
    values,
    getItem(key) { if (failures.get) throw new Error("get unavailable"); return values.get(key) ?? null; },
    setItem(key, value) { if (failures.set) throw new Error("set unavailable"); calls.push(["set", key]); values.set(key, value); },
    removeItem(key) { if (failures.remove === key || failures.remove === true) throw new Error("remove unavailable"); calls.push(["remove", key]); values.delete(key); },
  };
}

test("Gallery state prefers v2, falls back to valid v1, and rejects mismatched results", () => {
  const legacyResult = { ...State.completeEntertainmentGame(State.emptyHouseState(), "pattern-court", "legacy", "2026-08-04T11:00:00.000Z").result, schemaVersion: 1 };
  const primaryResult = State.completeEntertainmentGame(State.emptyHouseState(), "mirror-forge", "primary", "2026-08-04T12:00:00.000Z").result;
  const records = memoryStorage({
    [State.HOUSE_STORAGE_KEY]: JSON.stringify({ schemaVersion: 2, latestByGame: { "mirror-forge": primaryResult } }),
    [State.HOUSE_LEGACY_STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, latestByGame: { "pattern-court": legacyResult } }),
  });
  assert.equal(State.readHouseState(records).state.latestByGame["mirror-forge"].runId, "primary");

  records.values.set(State.HOUSE_STORAGE_KEY, "{");
  assert.equal(State.readHouseState(records).state.latestByGame["pattern-court"].runId, "legacy");
  records.values.set(State.HOUSE_STORAGE_KEY, JSON.stringify({ schemaVersion: 1, latestByGame: { "mirror-forge": legacyResult } }));
  records.values.delete(State.HOUSE_LEGACY_STORAGE_KEY);
  assert.deepEqual(State.readHouseState(records).state.latestByGame, {});
  assert.equal(State.readHouseState(memoryStorage({}, { get: true })).reason, "unavailable");
});

test("completion is copy-on-write and failed writes do not invent a Gallery reading", () => {
  const gallery = memoryStorage();
  const active = memoryStorage();
  const store = State.createHouseStateStore({ galleryStorage: gallery, activeStorage: active, activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  const completed = store.complete("pattern-court", "run-one", "2026-08-04T10:00:00.000Z");
  assert.equal(completed.persisted, true);
  assert.equal(completed.result.mode, "entertainment");
  assert.equal(completed.result.completionFacts.finalChapter, "Court lattice");

  const replacement = store.complete("pattern-court", "run-two", "2026-08-04T11:00:00.000Z");
  assert.equal(Object.keys(replacement.state.latestByGame).length, 1);
  assert.equal(replacement.state.latestByGame["pattern-court"].runId, "run-two");

  const unavailable = State.createHouseStateStore({ galleryStorage: memoryStorage({}, { set: true }), activeStorage: memoryStorage(), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(unavailable.complete("pattern-court", "lost", "2026-08-04T12:00:00.000Z").persisted, false);
  assert.deepEqual(unavailable.gallery().latestByGame, {});
});

test("Gallery clearing targets both exact keys and retains memory when a removal fails", () => {
  const result = State.completeEntertainmentGame(State.emptyHouseState(), "pattern-court", "kept", "2026-08-04T10:00:00.000Z").result;
  const gallery = memoryStorage({ [State.HOUSE_STORAGE_KEY]: JSON.stringify({ schemaVersion: 2, latestByGame: { "pattern-court": result } }), [State.HOUSE_LEGACY_STORAGE_KEY]: "legacy" });
  const store = State.createHouseStateStore({ galleryStorage: gallery, activeStorage: memoryStorage(), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(store.clearGallery(), true);
  assert.deepEqual(gallery.calls.slice(-2), [["remove", State.HOUSE_STORAGE_KEY], ["remove", State.HOUSE_LEGACY_STORAGE_KEY]]);
  assert.deepEqual(store.gallery().latestByGame, {});

  const partial = memoryStorage({ [State.HOUSE_STORAGE_KEY]: JSON.stringify({ schemaVersion: 2, latestByGame: { "pattern-court": result } }) }, { remove: State.HOUSE_LEGACY_STORAGE_KEY });
  const partialStore = State.createHouseStateStore({ galleryStorage: partial, activeStorage: memoryStorage(), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(partialStore.clearGallery(), false);
  assert.equal(partialStore.gallery().latestByGame["pattern-court"].runId, "kept");
});

test("active sessions are compact, Stack repair is semantic, and runner reload fails closed", () => {
  const activeStorage = memoryStorage();
  const store = State.createHouseStateStore({ galleryStorage: memoryStorage(), activeStorage, activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  const stack = { gameId: "stack-architect", chapter: 1, runId: "stack", memoryCovered: false, pegs: [[3, 1], [1], []], selectedPeg: 2, resolving: true, storyBeat: null, touched: true };
  assert.equal(store.saveActive(stack), true);
  assert.deepEqual(Object.keys(JSON.parse(activeStorage.values.get(State.HOUSE_ACTIVE_STORAGE_KEY))).sort(), ["chapter", "gameId", "memoryCovered", "pegs", "runId", "touched"]);
  assert.deepEqual(store.restoreActive().active.pegs, [[3, 2, 1], [], []]);

  activeStorage.values.set(State.HOUSE_ACTIVE_STORAGE_KEY, JSON.stringify({ gameId: "sector-sprint", chapter: 3, runId: "runner", storyBeat: 2, elapsed: 99, x: 500 }));
  assert.deepEqual(store.restoreActive(), { active: null, discardedRunner: true });
  assert.equal(activeStorage.values.has(State.HOUSE_ACTIVE_STORAGE_KEY), false);

  const runner = { ...stack, gameId: "sector-sprint", chapter: 3, runId: "runner", storyBeat: 2 };
  store.saveActive(runner);
  assert.deepEqual(Object.keys(JSON.parse(activeStorage.values.get(State.HOUSE_ACTIVE_STORAGE_KEY))).sort(), ["chapter", "gameId", "runId", "storyBeat"]);
});

test("active storage failures remain optional", () => {
  const unavailable = State.createHouseStateStore({ galleryStorage: memoryStorage(), activeStorage: memoryStorage({}, { set: true }), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(unavailable.saveActive({ gameId: "pattern-court", chapter: 0, runId: "run", memoryCovered: false, pegs: [[], [], []], selectedPeg: null, resolving: false, storyBeat: null, touched: false }), false);
});

test("adult-audience acknowledgement is owned by the House state store", () => {
  const gallery = memoryStorage();
  const store = State.createHouseStateStore({ galleryStorage: gallery, activeStorage: memoryStorage(), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(store.audienceAcknowledged(), false);
  assert.equal(store.acknowledgeAudience(), true);
  assert.equal(store.audienceAcknowledged(), true);
  assert.deepEqual(gallery.calls.at(-1), ["set", "nindova:house:adult-audience:v1"]);

  const unreadable = State.createHouseStateStore({ galleryStorage: memoryStorage({}, { get: true }), activeStorage: memoryStorage(), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(unreadable.audienceAcknowledged(), false);
  const unwritable = State.createHouseStateStore({ galleryStorage: memoryStorage({}, { set: true }), activeStorage: memoryStorage(), activeCodec: Session.HOUSE_ACTIVE_SESSION_CODEC });
  assert.equal(unwritable.acknowledgeAudience(), false);
});
