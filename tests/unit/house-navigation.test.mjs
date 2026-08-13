import assert from "node:assert/strict";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");

test("navigation keeps a cancelled destination and commits one complete exit transaction", async (context) => {
  const previous = Object.fromEntries([
    "location",
    "history",
    "window",
    "document",
    "requestAnimationFrame",
    "addEventListener",
  ].map((key) => [key, globalThis[key]]));
  context.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete globalThis[key];
      else globalThis[key] = value;
    }
  });

  const location = { hash: "#game/sector-sprint", pathname: "/house/", search: "", href: "/house/#game/sector-sprint" };
  const applyUrl = (url) => {
    location.href = url;
    location.hash = url.includes("#") ? url.slice(url.indexOf("#")) : "";
  };
  const history = {
    state: { nindovaHouse: true, nindovaHouseDepth: 1, nindovaHouseView: "game", nindovaHouseParentView: "category" },
    scrollRestoration: "auto",
    replaceState(state, _unused, url) { this.state = state; applyUrl(url); },
    pushState(state, _unused, url) { this.state = state; applyUrl(url); },
    back() { throw new Error("history.back was not expected"); },
  };
  const scrolls = [];
  globalThis.location = location;
  globalThis.history = history;
  globalThis.window = { scrollY: 44, scrollTo: ({ top }) => scrolls.push(top) };
  globalThis.document = { querySelector: () => null, body: {}, documentElement: {} };
  globalThis.requestAnimationFrame = (callback) => { callback(); return 1; };
  globalThis.addEventListener = () => {};

  const { createHouseNavigation } = await import(pathToFileURL(resolve(root, "apps/house/dist/house-navigation.js")));
  const category = { view: "category", categoryId: "decision" };
  let current;
  let suspended = 0;
  let resumed = 0;
  let left = 0;
  let cleared = 0;
  const dialog = {
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; },
  };
  const navigation = createHouseNavigation({
    initial: { view: "game", gameId: "sector-sprint", categoryId: "movement" },
    discardedRunner: false,
    main: { focus() {} },
    leaveDialog: dialog,
    hasActiveTable: () => true,
    restoreDecisionPending: () => false,
    hasMeaningfulProgress: () => true,
    leaveGame: () => { left += 1; },
    clearTable: () => { cleared += 1; },
    suspendForExit: () => { suspended += 1; },
    resumeFromExit: () => { resumed += 1; },
    resetViewState() {},
    render() {},
    openGame() {},
    changed(next) { current = next; },
  });

  navigation.request(category, null, { scrollY: 140 });
  assert.equal(dialog.open, true);
  assert.equal(current.exitConfirmationPending, true);
  assert.equal(suspended, 1);
  navigation.cancelExit(false);
  assert.equal(current.view, "game");
  assert.equal(current.exitConfirmationPending, false);
  assert.equal(resumed, 1);

  navigation.request(category);
  navigation.confirmExit();
  assert.equal(current.view, "category");
  assert.equal(dialog.open, false);
  assert.equal(left, 1);
  assert.equal(cleared, 1);
  assert.equal(location.hash, "#door/decision");
  assert.deepEqual(scrolls.slice(-2), [140, 140]);
});
