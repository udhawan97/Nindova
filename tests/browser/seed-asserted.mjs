import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/seed-asserted");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
await mkdir(output, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
const page = await context.newPage();
const errors = [];
const states = [];

page.on("console", (message) => {
  if (message.type() === "error") errors.push(`console: ${message.text()}`);
});
page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));

async function expectState(state, timeout = 15_000) {
  await page.waitForFunction((wanted) => window.__ct?.state === wanted, state, { timeout });
  states.push(await page.evaluate(() => window.__ct.state));
}

try {
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(
    await page.locator("#intake .footnote").textContent(),
    "Nothing to win. Nothing tracked. Nothing you can do wrong.",
  );

  await expectState("intake");
  await page.screenshot({ path: resolve(output, "01-intake.png") });

  await page.click("#beginBtn");
  await expectState("arrive");
  await page.evaluate(() => window.__ct.lightLamp());
  await expectState("play");
  await page.screenshot({ path: resolve(output, "02-play.png") });

  await page.evaluate(() => {
    window.__ct.nameObject(0, "call the bank");
    while (window.__ct.storeNext()) {
      // The seed marks slots occupied synchronously; settling completes in the frame loop.
    }
  });
  await expectState("wipe");
  await page.evaluate(() => window.__ct.finishWipe());
  await expectState("approach");
  await expectState("vista");
  await page.screenshot({ path: resolve(output, "03-vista.png") });

  await page.evaluate(() => window.__ct.setVistaT(0.88));
  await expectState("drift", 50_000);
  await page.screenshot({ path: resolve(output, "04-drift.png") });

  await page.evaluate(() => window.__ct.finishDrift());
  await expectState("return");
  await expectState("sign");
  await page.evaluate(() => window.__ct.tapSign());
  await expectState("dark");
  await expectState("end", 12_000);
  await page.screenshot({ path: resolve(output, "05-end.png") });

  const endTitle = (await page.locator("#endCard .end-title").textContent())?.trim();
  assert.equal(endTitle, "The session is over. That's the point.");
  assert.equal(await page.locator("#endCard").getAttribute("class"), "overlay");
  assert.deepEqual(states, [
    "intake",
    "arrive",
    "play",
    "wipe",
    "approach",
    "vista",
    "drift",
    "return",
    "sign",
    "dark",
    "end",
  ]);
  assert.deepEqual(errors, []);

  await writeFile(
    resolve(output, "result.json"),
    `${JSON.stringify({ target, states, endTitle, errors }, null, 2)}\n`,
    "utf8",
  );
  console.log(`Asserted seed arc passed: ${states.join(" → ")}`);
} finally {
  await browser.close();
}
