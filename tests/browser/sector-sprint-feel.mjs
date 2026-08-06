import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "@playwright/test";

const root = resolve(import.meta.dirname, "../..");
const port = 4207;
const previewRoot = await mkdtemp(join(tmpdir(), "nindova-sector-feel-"));
await cp(resolve(root, "dist"), previewRoot, { recursive: true });

const server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs"), previewRoot], {
  cwd: root,
  env: { ...process.env, NINDOVA_PREVIEW_PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

await new Promise((resolveReady, reject) => {
  const timer = setTimeout(() => reject(new Error("Sector Sprint preview did not start")), 5_000);
  server.once("error", reject);
  server.stdout.on("data", (chunk) => {
    if (chunk.toString().includes("Nindova preview")) {
      clearTimeout(timer);
      resolveReady();
    }
  });
});

const percentile = (values, amount) => {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * amount) - 1)];
};

const browser = await chromium.launch({ headless: true });
const errors = [];

async function openRunner(viewport, cpuRate = 1) {
  const context = await browser.newContext({ viewport });
  await context.addInitScript(() => localStorage.setItem("nindova:house:adult-audience:v1", "acknowledged"));
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  if (cpuRate > 1) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
  }
  await page.goto(`http://127.0.0.1:${port}/house/`, { waitUntil: "networkidle" });
  await page.evaluate(() => window.__house.start("sector-sprint"));
  await page.click('[data-runner-route="action"]');
  await page.waitForSelector("#runnerCanvas");
  await startAutopilot(page);
  await page.waitForFunction(() => Number(document.querySelector("#runnerCanvas")?.dataset.renderSequence ?? 0) > 1);
  return { context, page };
}

async function measureAction(page, selector, allowedActions) {
  return page.evaluate(({ selector: actionSelector, allowed }) => new Promise((resolveMeasure, rejectMeasure) => {
    const button = document.querySelector(actionSelector);
    const canvas = document.querySelector("#runnerCanvas");
    if (!(button instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) {
      rejectMeasure(new Error(`Missing action surface: ${actionSelector}`));
      return;
    }
    const beforeSequence = Number(canvas.dataset.renderSequence ?? 0);
    let inputAt = 0;
    const timeout = setTimeout(() => {
      observer.disconnect();
      rejectMeasure(new Error(`No visibly changed action frame for ${actionSelector}`));
    }, 1_000);
    const observer = new MutationObserver(() => {
      const sequence = Number(canvas.dataset.renderSequence ?? 0);
      if (inputAt > 0 && sequence > beforeSequence && allowed.includes(canvas.dataset.lastAction ?? "")) {
        clearTimeout(timeout);
        observer.disconnect();
        resolveMeasure(performance.now() - inputAt);
      }
    });
    observer.observe(canvas, { attributes: true, attributeFilter: ["data-render-sequence", "data-last-action"] });
    button.addEventListener("pointerdown", () => { inputAt = performance.now(); }, { once: true });
    button.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, pointerId: 41, pointerType: "touch", isPrimary: true }));
    setTimeout(() => button.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, pointerId: 41, pointerType: "touch", isPrimary: true })), 34);
  }), { selector, allowed: allowedActions });
}

async function startAutopilot(page) {
  await page.evaluate(() => {
    let inputAt = 0;
    let beforeSequence = 0;
    globalThis.__runnerAutopilotLatencies = [];
    const canvas = document.querySelector("#runnerCanvas");
    const observer = new MutationObserver(() => {
      const sequence = Number(canvas?.dataset.renderSequence ?? 0);
      if (inputAt > 0 && sequence > beforeSequence) {
        globalThis.__runnerAutopilotLatencies.push(performance.now() - inputAt);
        inputAt = 0;
      }
    });
    if (canvas) observer.observe(canvas, { attributes: true, attributeFilter: ["data-render-sequence"] });
    globalThis.__stopRunnerAutopilot = () => {
      cancelAnimationFrame(globalThis.__runnerAutopilotTimer);
      observer.disconnect();
    };
    const control = () => {
      const state = window.__house.runner;
      const canvas = document.querySelector("#runnerCanvas");
      if (!state || state.failed || !(canvas instanceof HTMLCanvasElement)) {
        return;
      }
      if (!state.finished && !window.__house.active?.resolving) {
        const safeLane = Number(canvas.dataset.nextSafeLane ?? state.targetLane);
        if (safeLane !== state.targetLane) {
          const key = safeLane < state.targetLane ? "ArrowUp" : "ArrowDown";
          if (inputAt === 0) {
            beforeSequence = Number(canvas.dataset.renderSequence ?? 0);
            inputAt = performance.now();
          }
          document.body.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, repeat: false }));
          document.body.dispatchEvent(new KeyboardEvent("keyup", { key, bubbles: true }));
        }
      }
      globalThis.__runnerAutopilotTimer = requestAnimationFrame(control);
    };
    globalThis.__runnerAutopilotTimer = requestAnimationFrame(control);
  });
}

async function sampleFrames(page, count) {
  return page.evaluate((sampleCount) => new Promise((resolveFrames) => {
    const intervals = [];
    let previous = 0;
    let warmup = 20;
    const frame = (timestamp) => {
      if (previous && warmup <= 0) intervals.push(timestamp - previous);
      else if (warmup > 0) warmup -= 1;
      previous = timestamp;
      if (intervals.length >= sampleCount) resolveFrames(intervals);
      else requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }), count);
}

try {
  const throttled = await openRunner({ width: 375, height: 812 }, 4);
  await throttled.page.waitForFunction(() => (
    (globalThis.__runnerAutopilotLatencies?.length ?? 0) >= 3
    && window.__house.runner?.failed === false
  ));
  const actionSamples = { laneMove: await throttled.page.evaluate(() => globalThis.__runnerAutopilotLatencies.slice(0, 3)) };
  const throttledFrames = await sampleFrames(throttled.page, 120);
  const throttledQuality = await throttled.page.locator("#runnerCanvas").getAttribute("data-quality");
  const actionMax = Object.fromEntries(Object.entries(actionSamples).map(([name, values]) => [name, Math.max(...values)]));
  for (const [name, value] of Object.entries(actionMax)) assert.ok(value < 150, `${name} maximum ${value.toFixed(1)}ms across three observed moves must remain below 150ms under 4x CPU`);
  assert.ok(percentile(throttledFrames, 0.95) <= 50, `375x812 4x CPU ${throttledQuality} p95 frame interval ${percentile(throttledFrames, 0.95).toFixed(1)}ms must remain <= 50ms`);
  await throttled.context.close();

  const desktop = await openRunner({ width: 1440, height: 900 });
  await desktop.page.waitForFunction(() => (window.__house.runner?.worldX ?? 0) > 700 && window.__house.runner?.failed === false);
  const desktopFrames = await sampleFrames(desktop.page, 120);
  assert.ok(percentile(desktopFrames, 0.95) <= 25, `1440x900 p95 frame interval ${percentile(desktopFrames, 0.95).toFixed(1)}ms must remain <= 25ms`);
  await desktop.context.close();

  assert.deepEqual(errors, []);
  console.log(JSON.stringify({
    profile: "Chromium · progressively faster lane route · 375x812 at 4x CPU · 3 lane-move samples · 120 frame samples",
    actionMaxMs: Object.fromEntries(Object.entries(actionMax).map(([name, value]) => [name, Number(value.toFixed(2))])),
    throttledFrameP95Ms: Number(percentile(throttledFrames, 0.95).toFixed(2)),
    desktopFrameP95Ms: Number(percentile(desktopFrames, 0.95).toFixed(2)),
  }));
} finally {
  await browser.close();
  server.kill("SIGTERM");
  await rm(previewRoot, { recursive: true, force: true });
}
