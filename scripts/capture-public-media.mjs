import { spawn } from "node:child_process";
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
async function startHouseServer() {
  const server = spawn(process.execPath, [resolve("scripts/serve.mjs"), resolve("apps/house/dist")], {
    env: { ...process.env, NINDOVA_PREVIEW_PORT: "0" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    const port = await new Promise((resolveReady, reject) => {
      const timer = setTimeout(() => reject(new Error("House capture server did not start")), 5_000);
      server.once("error", reject);
      server.stdout.on("data", (chunk) => {
        const match = chunk.toString().match(/Nindova preview: http:\/\/127\.0\.0\.1:(\d+)/);
        if (match) {
          clearTimeout(timer);
          resolveReady(Number(match[1]));
        }
      });
    });
    return { server, port };
  } catch (error) {
    server.kill("SIGTERM");
    throw error;
  }
}

async function stopServer(server) {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((resolveExit) => server.once("exit", resolveExit));
  server.kill("SIGTERM");
  await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 1_000))]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

let houseServer;
let housePort;
let browser;

try {
  ({ server: houseServer, port: housePort } = await startHouseServer());
  browser = await chromium.launch({ headless: true });

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

  const houseContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: "dark",
    reducedMotion: "no-preference",
  });
  await houseContext.addInitScript(() => {
    if (location.protocol === "http:" || location.protocol === "https:") {
      localStorage.setItem("nindova:house:adult-audience:v1", "acknowledged");
    }
  });
  const housePage = await houseContext.newPage();
  await housePage.goto(`http://127.0.0.1:${housePort}/`);
  await housePage.waitForFunction(() => Boolean(window.__house));
  await housePage.locator(".floor-plan").screenshot({
    path: resolve("apps/site/public/media/nindova-house.png"),
    animations: "disabled",
  });
  await housePage.evaluate(() => window.__house.start("sector-sprint"));
  await housePage.locator('[data-runner-route="action"]').click();
  await housePage.locator("#runnerCanvas").waitFor({ state: "visible" });
  await housePage.waitForFunction(() => {
    const canvas = document.querySelector("#runnerCanvas");
    return Number(canvas?.dataset.renderSequence ?? 0) > 8 && canvas?.dataset.nextMaterial === "sandstone";
  });
  await housePage.locator(".runner-stage-frame").screenshot({
    path: resolve("apps/site/public/media/sector-sprint.png"),
    animations: "disabled",
  });
  await houseContext.close();
} finally {
  await browser?.close();
  await stopServer(houseServer);
}
