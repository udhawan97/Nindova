import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/portrait-accessibility");
const target = `${pathToFileURL(resolve(root, "apps/session/index.html")).href}?review=1`;
await mkdir(output, { recursive: true });

const browser = await chromium.launch();

async function openSession(viewport, options = {}) {
  const context = await browser.newContext({ viewport, ...options });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  return { context, page, errors };
}

async function waitForState(page, state, timeout = 15_000) {
  await page.waitForFunction((wanted) => window.__ct.state === wanted, state, { timeout });
}

try {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 375, height: 812 },
    { width: 375, height: 667 },
    { width: 1280, height: 800 },
  ]) {
    const { context, page, errors } = await openSession(viewport);
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute("content");
    assert.doesNotMatch(viewportMeta ?? "", /maximum-scale|user-scalable/);
    assert.equal(await page.evaluate(() => window.__ct.portraitMode), viewport.height > viewport.width * 1.12);
    assert.deepEqual(
      await page.evaluate(() => {
        const canvas = document.querySelector("#stage").getBoundingClientRect();
        return { width: canvas.width, height: canvas.height, innerWidth, innerHeight };
      }),
      { width: viewport.width, height: viewport.height, innerWidth: viewport.width, innerHeight: viewport.height },
    );

    await page.click("#beginBtn");
    await waitForState(page, "arrive");
    await page.locator("#semanticPrimary").waitFor({ state: "visible" });
    const primaryBox = await page.locator("#semanticPrimary").boundingBox();
    assert.ok(primaryBox && primaryBox.height >= 44 && primaryBox.width >= 44);
    const dockBox = await page.locator("#actionDock").boundingBox();
    assert.ok(dockBox && dockBox.y >= 0 && dockBox.y + dockBox.height <= viewport.height + 1);
    assert.deepEqual(errors, []);
    await context.close();
  }

  const reduced = await openSession({ width: 375, height: 812 }, { reducedMotion: "reduce" });
  assert.equal(await reduced.page.evaluate(() => window.__ct.reduceMotion), true);
  await reduced.context.close();

  const { context, page, errors } = await openSession({ width: 375, height: 812 });
  await page.screenshot({ path: resolve(output, "01-intake-375x812.png") });
  await page.click("#beginBtn");
  await waitForState(page, "arrive");

  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });
  assert.equal(await page.evaluate(() => visualViewport?.scale), 2);
  await page.locator("#semanticPrimary").focus();
  await page.keyboard.press("Enter");
  await waitForState(page, "play");
  await cdp.send("Emulation.setPageScaleFactor", { pageScaleFactor: 1 });

  await page.click("#nameNextBtn");
  await page.locator("#semanticNameInput").fill("call the bank");
  await page.setViewportSize({ width: 375, height: 520 });
  const keyboardDock = await page.locator("#actionDock").boundingBox();
  assert.ok(keyboardDock && keyboardDock.y + keyboardDock.height <= 521);
  await page.keyboard.press("Enter");
  assert.equal(await page.evaluate(() => window.__ct.objects.some((object) => object.label === "call the bank")), true);
  await page.setViewportSize({ width: 812, height: 375 });
  await page.waitForFunction(() => window.__ct.portraitMode === false);
  assert.equal(await page.evaluate(() => window.__ct.state), "play");
  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForFunction(() => window.__ct.portraitMode === true);

  const beforeVista = await page.locator("#changeVistaBtn").textContent();
  await page.click("#changeVistaBtn");
  const afterVista = await page.locator("#changeVistaBtn").textContent();
  assert.notEqual(afterVista, beforeVista);

  const objectPoint = await page.evaluate(() => {
    const object = window.__ct.objects.find((candidate) => candidate.state === "desk");
    return object ? window.__ct.toScreen(object.x, object.y) : null;
  });
  assert.ok(objectPoint);
  await page.dispatchEvent("#stage", "pointerdown", {
    pointerId: 7,
    pointerType: "touch",
    isPrimary: true,
    clientX: objectPoint.x,
    clientY: objectPoint.y,
    bubbles: true,
  });
  await page.waitForTimeout(600);
  assert.deepEqual(await page.evaluate(() => [window.__ct.pointerDown, window.__ct.dragging]), [true, true]);
  await page.dispatchEvent("#stage", "pointercancel", { pointerId: 7, pointerType: "touch", bubbles: true });
  await page.waitForTimeout(600);
  assert.deepEqual(await page.evaluate(() => [window.__ct.pointerDown, window.__ct.dragging]), [false, false]);

  while (await page.evaluate(() => window.__ct.state === "play" && window.__ct.objects.some((object) => object.state === "desk"))) {
    await page.click("#semanticPrimary");
    await page.waitForTimeout(180);
  }
  await waitForState(page, "wipe");
  await page.click("#semanticPrimary");
  await waitForState(page, "approach");
  await waitForState(page, "vista");
  await page.waitForTimeout(1_600);
  await page.screenshot({ path: resolve(output, "02-vista-375x812.png") });

  await page.click("#semanticPrimary");
  await page.evaluate(() => window.__ct.setVistaT(0.88));
  await waitForState(page, "drift", 50_000);
  await page.click("#semanticPrimary");
  await waitForState(page, "return");
  await waitForState(page, "sign");
  await page.click("#semanticPrimary");
  await waitForState(page, "dark");
  await waitForState(page, "end", 12_000);
  await page.waitForTimeout(1_400);
  await page.screenshot({ path: resolve(output, "03-end-375x812.png") });

  assert.equal(await page.locator("#endCard").getAttribute("aria-hidden"), "false");
  assert.equal(await page.locator("#intake").getAttribute("aria-hidden"), "true");
  assert.equal(await page.locator("#actionDock").isHidden(), true);
  const endTitleBox = await page.locator("#endCard .end-title").boundingBox();
  assert.ok(endTitleBox && endTitleBox.y >= 0 && endTitleBox.y < 160);
  assert.deepEqual(errors, []);
  await context.close();

  console.log("Portrait and semantic Session checks passed at 320, 375, and desktop widths.");
} finally {
  await browser.close();
}
