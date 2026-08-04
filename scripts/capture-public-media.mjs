import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { recipeTwoCompletion } from "../tests/fixtures/recipe-two.mjs";

const target = `${pathToFileURL(resolve("apps/session/dist/nindova.html")).href}?review=1`;
const captures = [
  { viewport: { width: 840, height: 476 }, path: "apps/site/public/media/rasoi-board.png" },
  { viewport: { width: 375, height: 812 }, path: "apps/site/public/media/rasoi-pairs-phone.png" },
];
const browser = await chromium.launch({ headless: true });

try {
  for (const capture of captures) {
    const context = await browser.newContext({ viewport: capture.viewport, colorScheme: "dark" });
    const page = await context.newPage();
    await page.goto(target);
    await page.waitForFunction(() => Boolean(window.__ct));
    await page.getByLabel("Deeper stack").check();
    await page.locator("#beginBtn").click();
    await page.waitForFunction(() => window.__ct.state === "play" && window.__ct.board?.profile === "deeper");
    await page.screenshot({ path: resolve(capture.path), animations: "disabled" });
    await context.close();
  }

  const dawnContext = await browser.newContext({ viewport: { width: 1120, height: 760 }, colorScheme: "light" });
  const dawnPage = await dawnContext.newPage();
  await dawnPage.goto(target);
  await dawnPage.waitForFunction(() => Boolean(window.__ct));
  await dawnPage.evaluate((completion) => {
    NindovaNight.writeStorage(localStorage, NindovaNight.completeState(NindovaNight.emptyState(), completion).state);
  }, recipeTwoCompletion);
  await dawnPage.reload();
  await dawnPage.waitForFunction(() => Boolean(window.__ct));
  await dawnPage.evaluate(() => window.__ct.setDawnNow("2026-08-03T14:00:00.000Z"));
  await dawnPage.locator("#dawnBtn").click();
  await dawnPage.locator("#dawn").waitFor({ state: "visible" });
  const dawnDataUrl = await dawnPage.locator("#dawnCanvas").evaluate((canvas) => canvas.toDataURL("image/png"));
  await writeFile(resolve("apps/site/public/media/rasoi-dawn.png"), Buffer.from(dawnDataUrl.split(",")[1], "base64"));
  await dawnContext.close();
} finally {
  await browser.close();
}
