import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

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
} finally {
  await browser.close();
}
