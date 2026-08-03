import assert from "node:assert/strict";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const source = pathToFileURL(resolve(root, "apps/session/index.html")).href;
const browser = await chromium.launch();

async function openSession(review = true) {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(`${source}${review ? "?review=1" : ""}`);
  await page.waitForFunction(() => Boolean(window.__ct));
  await page.waitForFunction(() => window.__ct.spriteReady);
  return { context, page, errors };
}

async function enterPlay(page) {
  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "arrive");
  await page.evaluate(() => window.__ct.lightLamp());
  await page.waitForFunction(() => window.__ct.state === "play");
}

async function assertCloses(page, errors) {
  await page.evaluate(() => window.__ct.advanceBy(window.__ct.hardCapSeconds));
  const result = await page.evaluate(() => ({
    state: window.__ct.state,
    elapsed: window.__ct.sessionElapsed,
    cap: window.__ct.hardCapSeconds,
    pointerDown: window.__ct.pointerDown,
    dragging: window.__ct.dragging,
  }));
  assert.equal(result.state, "end");
  assert.ok(result.elapsed <= result.cap + 0.051, `${result.elapsed}s exceeded ${result.cap}s cap`);
  assert.equal(result.pointerDown, false);
  assert.equal(result.dragging, false);
  assert.deepEqual(errors, []);
}

async function objectPoint(page) {
  return page.evaluate(() => {
    const object = window.__ct.objects.find((candidate) => candidate.state === "desk");
    return object ? window.__ct.toScreen(object.x, object.y) : null;
  });
}

try {
  const production = await openSession(false);
  assert.deepEqual(
    await production.page.evaluate(() => ({
      reviewerMode: window.__ct.reviewerMode,
      paceKey: window.__ct.paceKey,
      cap: window.__ct.hardCapSeconds,
      paceHidden: document.querySelector("#paceBtn").hidden,
      evidenceHidden: document.querySelector("#reviewEvidence").hidden,
      actionsHidden: document.querySelector("#reviewActions").hidden,
    })),
    { reviewerMode: false, paceKey: "real", cap: 900, paceHidden: true, evidenceHidden: true, actionsHidden: true },
  );
  assert.deepEqual(production.errors, []);
  await production.context.close();

  const envelope = await openSession();
  const samples = await envelope.page.evaluate(() => [0, 0.25, 0.5, 0.75, 1].map((value) => ({
    assistance: window.__ct.sampleAssistance(value),
    light: window.__ct.sampleLightBudget(value),
  })));
  for (let index = 1; index < samples.length; index += 1) {
    assert.ok(samples[index].assistance.snapRadius >= samples[index - 1].assistance.snapRadius);
    assert.ok(samples[index].assistance.magnetism >= samples[index - 1].assistance.magnetism);
    assert.ok(samples[index].assistance.requiredGestureDistance <= samples[index - 1].assistance.requiredGestureDistance);
    assert.ok(samples[index].assistance.autonomousWait <= samples[index - 1].assistance.autonomousWait);
    assert.ok(samples[index].light.meanBudget <= samples[index - 1].light.meanBudget);
    assert.ok(samples[index].light.peakBudget <= samples[index - 1].light.peakBudget);
  }
  assert.deepEqual(
    await envelope.page.evaluate(() => window.__ct.authoredAccents),
    ["lamp", "shelf", "drawer", "crossing", "mooring", "handoff", "sign"],
  );
  await envelope.context.close();

  const noInput = await openSession();
  await noInput.page.click("#beginBtn");
  await assertCloses(noInput.page, noInput.errors);
  await noInput.context.close();

  const partial = await openSession();
  await enterPlay(partial.page);
  assert.equal(await partial.page.evaluate(() => window.__ct.storeNext()), true);
  await assertCloses(partial.page, partial.errors);
  await partial.context.close();

  const naming = await openSession();
  await enterPlay(naming.page);
  await naming.page.click("#nameNextBtn");
  await naming.page.fill("#semanticNameInput", "tomorrow's note");
  await naming.page.evaluate(() => window.__ct.advanceBy(6));
  assert.equal(await naming.page.locator("#semanticNameForm").isHidden(), true);
  await assertCloses(naming.page, naming.errors);
  await naming.context.close();

  const held = await openSession();
  await enterPlay(held.page);
  const heldPoint = await objectPoint(held.page);
  assert.ok(heldPoint);
  await held.page.dispatchEvent("#stage", "pointerdown", {
    pointerId: 41,
    pointerType: "touch",
    isPrimary: true,
    clientX: heldPoint.x,
    clientY: heldPoint.y,
    bubbles: true,
  });
  await held.page.evaluate(() => window.__ct.advanceBy(4));
  assert.deepEqual(await held.page.evaluate(() => [window.__ct.pointerDown, window.__ct.dragging]), [false, false]);
  await assertCloses(held.page, held.errors);
  await held.context.close();

  const unfocused = await openSession();
  await enterPlay(unfocused.page);
  const unfocusedPoint = await objectPoint(unfocused.page);
  assert.ok(unfocusedPoint);
  await unfocused.page.dispatchEvent("#stage", "pointerdown", {
    pointerId: 42,
    pointerType: "touch",
    isPrimary: true,
    clientX: unfocusedPoint.x,
    clientY: unfocusedPoint.y,
    bubbles: true,
  });
  await unfocused.page.evaluate(() => dispatchEvent(new Event("blur")));
  assert.deepEqual(await unfocused.page.evaluate(() => [window.__ct.pointerDown, window.__ct.dragging]), [false, false]);
  await assertCloses(unfocused.page, unfocused.errors);
  await unfocused.context.close();

  const cancelled = await openSession();
  await enterPlay(cancelled.page);
  const cancelledPoint = await objectPoint(cancelled.page);
  assert.ok(cancelledPoint);
  await cancelled.page.dispatchEvent("#stage", "pointerdown", {
    pointerId: 43,
    pointerType: "touch",
    isPrimary: true,
    clientX: cancelledPoint.x,
    clientY: cancelledPoint.y,
    bubbles: true,
  });
  await cancelled.page.dispatchEvent("#stage", "pointercancel", {
    pointerId: 43,
    pointerType: "touch",
    bubbles: true,
  });
  await assertCloses(cancelled.page, cancelled.errors);
  await cancelled.context.close();

  console.log("Self-closing, assistance, light-budget, sprite, and reviewer-boundary checks passed.");
} finally {
  await browser.close();
}
