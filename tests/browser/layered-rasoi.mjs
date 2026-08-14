import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { PNG } from "pngjs";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";

const root = resolve(import.meta.dirname, "../..");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
const harness = await createBrowserEvidenceHarness();

async function open(options = {}) {
  const { profile = "gentle", ...contextOptions } = options;
  const { context, page, errors } = await harness.open({
    contextOptions: { viewport: { width: 375, height: 812 }, ...contextOptions },
    target,
  });
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.check(`input[name="rasoi-profile"][value="${profile}"]`);
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "play");
  return { context, page, errors };
}

async function tapTile(page, tileId) {
  const box = await page.locator(`[data-tile-id="${tileId}"]`).boundingBox();
  assert.ok(box, `${tileId} should have a touchable box`);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

function meanLuminance(buffer) {
  const png = PNG.sync.read(buffer);
  let total = 0;
  for (let index = 0; index < png.data.length; index += 4) {
    total += (0.2126 * png.data[index]) + (0.7152 * png.data[index + 1]) + (0.0722 * png.data[index + 2]);
  }
  return total / (png.width * png.height);
}

async function recordedOpeningChime(reverse) {
  const context = await harness.context({ viewport: { width: 375, height: 812 } }, [() => {
    globalThis.__toneFrequencies = [];
    class FakeParam {
      setValueAtTime() {}
      exponentialRampToValueAtTime() {}
    }
    class FakeAudioContext {
      currentTime = 0;
      resume() { return Promise.resolve(); }
      createGain() { return { gain: new FakeParam(), connect() {} }; }
      createBiquadFilter() { return { type: "lowpass", frequency: new FakeParam(), Q: new FakeParam(), connect() {} }; }
      createOscillator() {
        return {
          type: "sine",
          frequency: { setValueAtTime(value) { globalThis.__toneFrequencies.push(value); } },
          connect() {},
          start() {},
          stop() {},
        };
      }
    }
    Object.defineProperty(globalThis, "AudioContext", { configurable: true, value: FakeAudioContext });
  }]);
  const { page } = await harness.page(context);
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.check('input[name="rasoi-profile"][value="deeper"]');
  await page.click("#muteBtn");
  await page.click("#beginBtn");
  const pair = await page.evaluate(() => window.__ct.legalPairs[0]);
  const order = reverse ? [...pair].reverse() : pair;
  await page.click(`[data-tile-id="${order[0]}"]`);
  await page.click(`[data-tile-id="${order[1]}"]`);
  await page.waitForFunction(() => globalThis.__toneFrequencies.length === 3);
  const frequencies = await page.evaluate(() => globalThis.__toneFrequencies);
  await context.close();
  return frequencies;
}

try {
  assert.deepEqual(await recordedOpeningChime(false), await recordedOpeningChime(true), "pair chime should not depend on selection order");

  const normal = await open({ hasTouch: true });
  assert.deepEqual(await normal.page.evaluate(() => [0, 1, 2].map(
    (layer) => window.__ct.tiles.filter((tile) => tile.layer === layer).length,
  )), [24, 8, 4]);
  assert.match(await normal.page.locator('[data-tile-id="b0-0"]').getAttribute("aria-label") ?? "", /covered by a tile above/);
  assert.match(await normal.page.locator('[data-tile-id="t-1"]').getAttribute("aria-label") ?? "", /blocked on both sides/);

  const overlap = await normal.page.evaluate(() => {
    const lower = document.querySelector('[data-tile-id="b0-0"]').getBoundingClientRect();
    const higher = document.querySelector('[data-tile-id="m0-0"]').getBoundingClientRect();
    const intersects = Math.min(lower.right, higher.right) > Math.max(lower.left, higher.left)
      && Math.min(lower.bottom, higher.bottom) > Math.max(lower.top, higher.top);
    return {
      intersects,
      lowerZ: Number(getComputedStyle(document.querySelector('[data-tile-id="b0-0"]')).zIndex),
      higherZ: Number(getComputedStyle(document.querySelector('[data-tile-id="m0-0"]')).zIndex),
    };
  });
  assert.equal(overlap.intersects, true);
  assert.ok(overlap.higherZ > overlap.lowerZ);

  const firstPair = await normal.page.evaluate(() => window.__ct.legalPairs[0]);
  const warmthBefore = Number(await normal.page.locator("#boardShell").evaluate((shell) => getComputedStyle(shell).getPropertyValue("--warmth")));
  const luminanceBefore = meanLuminance(await normal.page.locator("#boardShell").screenshot({ animations: "disabled" }));
  await tapTile(normal.page, firstPair[0]);
  await tapTile(normal.page, firstPair[1]);
  assert.equal(await normal.page.evaluate(() => window.__ct.removedTileCount), 2);
  assert.equal(await normal.page.locator(".tile.is-pairing").count(), 2);
  assert.equal(await normal.page.locator(".pair-bloom").count(), 1);
  const warmthAfter = Number(await normal.page.locator("#boardShell").evaluate((shell) => getComputedStyle(shell).getPropertyValue("--warmth")));
  assert.ok(warmthAfter < warmthBefore);
  await normal.page.waitForTimeout(50);
  assert.equal(await normal.page.locator(".pair-bloom").evaluate((bloom) => {
    const box = bloom.getBoundingClientRect();
    const style = getComputedStyle(bloom);
    return box.width > 0 && box.height > 0 && Number(style.opacity) > 0 && style.visibility === "visible";
  }), true);
  assert.match(await normal.page.locator(".tile.is-pairing").first().evaluate((tile) => getComputedStyle(tile).animationName), /brass-settle/);
  await normal.page.waitForFunction(() => !document.querySelector(".pair-bloom"));
  const luminanceAfter = meanLuminance(await normal.page.locator("#boardShell").screenshot({ animations: "disabled" }));
  assert.ok(luminanceAfter <= luminanceBefore + 0.5, `settled board should not brighten (${luminanceBefore} -> ${luminanceAfter})`);

  while (await normal.page.evaluate(() => window.__ct.state === "play")) {
    const pair = await normal.page.evaluate(() => window.__ct.legalPairs[0]);
    await tapTile(normal.page, pair[0]);
    await tapTile(normal.page, pair[1]);
  }
  await normal.page.waitForFunction(() => window.__ct.state === "end");
  assert.equal((await normal.page.locator("#endTitle").textContent())?.trim(), "The session is over. That's the point.");
  assert.match(await normal.page.locator("#pathNoteTitle").innerText(), /read the woven layers/i);
  assert.match(await normal.page.locator("#pathNoteText").innerText(), /more than one way in/i);
  const firstMemory = await normal.page.evaluate(() => window.__ct.memory);
  const completedBoard = await normal.page.evaluate(() => window.__ct.board.id);
  assert.equal(await normal.page.evaluate(() => document.activeElement?.id), "dimRestBtn");
  await normal.page.click("#driftBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "drift");
  assert.equal(await normal.page.locator(".drift-object").count(), 3);
  assert.equal(await normal.page.locator('.drift-object[role="listitem"] span').count(), 3);
  assert.match(await normal.page.locator("#drift").innerText(), /remember how it feels in your hands/i);
  await normal.page.click("#skipDriftBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "rest");
  assert.match(await normal.page.locator("#rest").innerText(), /Put the phone down/);
  assert.equal(await normal.page.locator("#rest button").count(), 0);
  await normal.page.close();
  normal.page = (await harness.page(normal.context)).page;
  await normal.page.goto(target);
  await normal.page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "intake");
  await normal.page.click("#beginBtn");
  assert.equal(await normal.page.evaluate(() => window.__ct.state), "play");
  assert.equal(await normal.page.evaluate(() => window.__ct.board.id), completedBoard);
  assert.equal(await normal.page.evaluate(() => window.__ct.removedTileCount), 0);
  while (await normal.page.evaluate(() => window.__ct.state === "play")) {
    const pair = await normal.page.evaluate(() => window.__ct.legalPairs[0]);
    await tapTile(normal.page, pair[0]);
    await tapTile(normal.page, pair[1]);
  }
  await normal.page.waitForFunction(() => window.__ct.state === "end");
  assert.deepEqual(await normal.page.evaluate(() => window.__ct.memory), firstMemory);
  assert.deepEqual(normal.errors, []);
  await normal.context.close();

  const deeper = await open({ profile: "deeper" });
  assert.equal(await deeper.page.evaluate(() => window.__ct.board.profile), "deeper");
  assert.deepEqual(await deeper.page.evaluate(() => [0, 1, 2, 3].map(
    (layer) => window.__ct.tiles.filter((tile) => tile.layer === layer).length,
  )), [20, 10, 4, 2]);
  assert.equal(await deeper.page.evaluate(() => window.__ct.tiles.filter((tile) => tile.availability === "covered").length), 32);
  assert.equal(await deeper.page.evaluate(() => window.__ct.tiles.filter((tile) => tile.availability === "side-blocked").length), 0);
  assert.equal(await deeper.page.evaluate(() => window.__ct.tiles.filter((tile) => tile.availability === "free").length), 4);
  assert.equal(await deeper.page.evaluate(() => window.__ct.legalPairs.length), 1);
  assert.match(await deeper.page.locator("#profileBadge").innerText(), /Deeper stack · triple crown · 4 tight layers/);
  assert.match(await deeper.page.locator("#board").getAttribute("aria-label") ?? "", /four overlapping layers|4 overlapping layers/i);
  assert.match(await deeper.page.locator('[data-layer="3"]').first().getAttribute("aria-label") ?? "", /layer 4/);
  for (const minimumFreeCandidates of [4, 5, 4]) {
    const opening = await deeper.page.evaluate(() => ({
      free: window.__ct.tiles.filter((tile) => tile.availability === "free").length,
      pairs: window.__ct.legalPairs.length,
    }));
    assert.equal(opening.free, minimumFreeCandidates);
    assert.equal(opening.pairs, 1);
    const pair = await deeper.page.evaluate(() => window.__ct.legalPairs[0]);
    await deeper.page.click(`[data-tile-id="${pair[0]}"]`);
    await deeper.page.click(`[data-tile-id="${pair[1]}"]`);
    await deeper.page.waitForFunction(() => !document.querySelector(".pair-bloom"));
  }
  while (await deeper.page.evaluate(() => window.__ct.state === "play")) {
    const pair = await deeper.page.evaluate(() => window.__ct.legalPairs[0]);
    await deeper.page.click(`[data-tile-id="${pair[0]}"]`);
    await deeper.page.click(`[data-tile-id="${pair[1]}"]`);
    await deeper.page.waitForFunction(() => !document.querySelector(".pair-bloom"));
  }
  await deeper.page.waitForFunction(() => window.__ct.state === "end");
  assert.match(await deeper.page.locator("#pathNoteTitle").innerText(), /opened the triple crown/i);
  assert.match(await deeper.page.locator("#pathNoteText").innerText(), /hid among the opening tiles/i);
  assert.deepEqual(deeper.errors, []);
  await deeper.context.close();

  const boundaryNote = await open();
  await boundaryNote.page.evaluate(() => window.__ct.advanceBy(90));
  await boundaryNote.page.waitForFunction(() => window.__ct.state === "end");
  assert.match(await boundaryNote.page.locator("#pathNoteTitle").innerText(), /lid kept the boundary/i);
  assert.match(await boundaryNote.page.locator("#pathNoteText").innerText(), /without a grade or penalty/i);
  assert.deepEqual(boundaryNote.errors, []);
  await boundaryNote.context.close();

  const autoRest = await open();
  await autoRest.page.evaluate(() => window.__ct.finish());
  await autoRest.page.waitForFunction(() => window.__ct.state === "end");
  await autoRest.page.click("#driftBtn");
  await autoRest.page.waitForFunction(() => window.__ct.state === "rest", null, { timeout: 7000 });
  assert.deepEqual(autoRest.errors, []);
  await autoRest.context.close();

  const reduced = await open({ reducedMotion: "reduce" });
  const reducedEvidence = await reduced.page.evaluate(() => {
    for (const tileId of window.__ct.legalPairs[0]) {
      const tile = document.querySelector(`[data-tile-id="${tileId}"]`);
      if (!(tile instanceof HTMLButtonElement)) throw new Error(`Missing reduced-motion tile ${tileId}`);
      tile.click();
    }
    const pairingTile = document.querySelector(".tile.is-pairing");
    const bloom = document.querySelector(".pair-bloom");
    return {
      animationName: pairingTile ? getComputedStyle(pairingTile).animationName : "missing",
      bloomDisplay: bloom ? getComputedStyle(bloom).display : "missing",
    };
  });
  assert.match(reducedEvidence.animationName, /pair-fade/);
  assert.equal(reducedEvidence.bloomDisplay, "none");
  assert.deepEqual(reduced.errors, []);
  await reduced.context.close();

  assert.deepEqual(harness.errors, []);
  console.log("Gentle/Deeper occlusion, brass bloom, optional Image Drift, reduced motion, Rest, and deliberate same-night return passed.");
} finally {
  await harness.close();
}
