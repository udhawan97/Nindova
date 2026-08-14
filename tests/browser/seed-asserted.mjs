import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";

const root = resolve(import.meta.dirname, "../..");
const output = resolve(root, "artifacts/rasoi-arc");
const target = `${pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href}?review=1`;
await mkdir(output, { recursive: true });

const harness = await createBrowserEvidenceHarness();
const { page, errors } = await harness.open({ contextOptions: { viewport: { width: 1280, height: 800 } } });
const states = ["intake"];

try {
  await page.goto(target);
  await page.waitForFunction(() => Boolean(window.__ct));
  assert.equal(await page.evaluate(() => window.__ct === window.__rasoi), true);
  assert.equal((await page.locator(".trust-line").textContent())?.trim(), "Nothing to win. Nothing tracked. Nothing you can do wrong.");
  await page.screenshot({ path: resolve(output, "01-intake.png") });

  await page.click("#beginBtn");
  await page.waitForFunction(() => window.__ct.state === "play");
  states.push("play");
  assert.equal(await page.evaluate(() => window.__ct.board.tiles.length), 36);
  assert.equal(await page.evaluate(() => window.__ct.legalPairs.length), 3);
  await page.screenshot({ path: resolve(output, "02-board.png") });

  let stateAfterSelection = "play";
  while (stateAfterSelection === "play") {
    stateAfterSelection = await page.evaluate(() => {
      const pair = window.__ct.legalPairs[0];
      window.__ct.selectTile(pair[0]);
      window.__ct.selectTile(pair[1]);
      return window.__ct.state;
    });
  }
  assert.equal(stateAfterSelection, "settling");
  states.push("settling");
  await page.waitForFunction(() => window.__ct.state === "end");
  states.push("end");
  await page.screenshot({ path: resolve(output, "03-end.png") });

  assert.equal(await page.evaluate(() => window.__ct.removedTileCount), 36);
  assert.equal(await page.evaluate(() => window.__ct.endReason), "completed");
  assert.equal((await page.locator("#endTitle").textContent())?.trim(), "The session is over. That's the point.");
  assert.deepEqual(errors, []);
  await writeFile(resolve(output, "result.json"), `${JSON.stringify({ target, states, errors }, null, 2)}\n`, "utf8");
  console.log(`Rasoi Pairs arc passed: ${states.join(" → ")}`);
} finally {
  await harness.close();
}
