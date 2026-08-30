import assert from "node:assert/strict";
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { createBrowserEvidenceHarness } from "./evidence-harness.mjs";
import { collectBudgetFailures, summarizeTimeline } from "../helpers/sector-sprint-diagnostics.mjs";

const root = resolve(import.meta.dirname, "../..");
const port = 4207;
const previewRoot = await mkdtemp(join(tmpdir(), "nindova-sector-feel-"));
await cp(resolve(root, "dist"), previewRoot, { recursive: true });

const harness = await createBrowserEvidenceHarness({
  root,
  previewRoot,
  port,
  launchOptions: { headless: true },
  cleanup: [() => rm(previewRoot, { recursive: true, force: true })],
});

const percentile = (values, amount) => {
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * amount) - 1)];
};

const { errors } = harness;

async function startTimeline(cdp) {
  const completed = new Promise((resolveComplete) => cdp.once("Tracing.tracingComplete", resolveComplete));
  await cdp.send("Tracing.start", {
    categories: [
      "blink.resource",
      "devtools.timeline",
      "disabled-by-default-blink.image_decoding",
      "disabled-by-default-devtools.timeline",
      "disabled-by-default-devtools.timeline.frame",
    ].join(","),
    transferMode: "ReturnAsStream",
  });
  return async () => {
    await cdp.send("Tracing.end");
    const { stream } = await completed;
    let trace = "";
    for (;;) {
      const chunk = await cdp.send("IO.read", { handle: stream, size: 1_000_000 });
      trace += chunk.data;
      if (chunk.eof) break;
    }
    await cdp.send("IO.close", { handle: stream });
    return summarizeTimeline(JSON.parse(trace).traceEvents);
  };
}

async function openRunner(viewport, cpuRate = 1, { timeline = false } = {}) {
  const context = await harness.context({ viewport }, [() => localStorage.setItem("nindova:house:adult-audience:v1", "acknowledged")]);
  const { page } = await harness.page(context, { errorPrefix: "Sector Sprint: " });
  const cdp = await context.newCDPSession(page);
  if (cpuRate > 1) {
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpuRate });
  }
  await page.goto(`http://127.0.0.1:${port}/house/`, { waitUntil: "networkidle" });
  const stopTimeline = timeline ? await startTimeline(cdp) : null;
  await page.evaluate(() => window.__house.start("sector-sprint"));
  await page.click('[data-runner-route="action"]');
  await page.waitForSelector("#runnerCanvas");
  await startAutopilot(page);
  await page.waitForFunction(() => Number(document.querySelector("#runnerCanvas")?.dataset.renderSequence ?? 0) > 1);
  return { context, page, stopTimeline };
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

async function traceRunner(viewport, cpuRate = 1) {
  const runner = await openRunner(viewport, cpuRate, { timeline: true });
  try {
    await runner.page.waitForFunction(() => (
      (globalThis.__runnerAutopilotLatencies?.length ?? 0) >= 3
      && window.__house.runner?.failed === false
    ));
    await sampleFrames(runner.page, 60);
    return await runner.stopTimeline();
  } finally {
    await runner.context.close();
  }
}

try {
  const throttled = await openRunner({ width: 375, height: 812 }, 4);
  let actionSamples;
  let throttledFrames;
  let throttledQuality;
  let throttledRuntime;
  try {
    await throttled.page.waitForFunction(() => (
      (globalThis.__runnerAutopilotLatencies?.length ?? 0) >= 3
      && window.__house.runner?.failed === false
    ));
    actionSamples = { laneMove: await throttled.page.evaluate(() => globalThis.__runnerAutopilotLatencies.slice(0, 3)) };
    throttledFrames = await sampleFrames(throttled.page, 120);
    throttledQuality = await throttled.page.locator("#runnerCanvas").getAttribute("data-quality");
    throttledRuntime = await throttled.page.evaluate(() => ({
      userAgent: navigator.userAgent,
      platform: navigator.userAgentData?.platform ?? navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemoryGiB: navigator.deviceMemory ?? null,
    }));
  } finally {
    await throttled.context.close();
  }
  const actionMax = Object.fromEntries(Object.entries(actionSamples).map(([name, values]) => [name, Math.max(...values)]));

  const desktop = await openRunner({ width: 1440, height: 900 });
  let desktopFrames;
  let desktopSurface;
  let desktopRuntime;
  try {
    await desktop.page.waitForFunction(() => (window.__house.runner?.worldX ?? 0) > 700 && window.__house.runner?.failed === false);
    desktopFrames = await sampleFrames(desktop.page, 120);
    desktopSurface = await desktop.page.locator("#runnerCanvas").evaluate((canvas) => {
      const bounds = canvas.getBoundingClientRect();
      return {
        quality: canvas.dataset.quality,
        cssWidth: Math.round(bounds.width),
        cssHeight: Math.round(bounds.height),
        pixelWidth: canvas.width,
        pixelHeight: canvas.height,
      };
    });
    desktopRuntime = await desktop.page.evaluate(() => ({
      userAgent: navigator.userAgent,
      platform: navigator.userAgentData?.platform ?? navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemoryGiB: navigator.deviceMemory ?? null,
    }));
  } finally {
    await desktop.context.close();
  }

  const phoneFrameP95Ms = percentile(throttledFrames, 0.95);
  const desktopFrameP95Ms = percentile(desktopFrames, 0.95);
  const throttledTimeline = await traceRunner({ width: 375, height: 812 }, 4);
  const desktopTimeline = await traceRunner({ width: 1440, height: 900 });
  const diagnostics = {
    profiles: {
      phone: { engine: "Chromium", viewport: "375x812", cpuThrottleRate: 4, laneMoveSamples: 3, frameSamples: 120 },
      desktop: { engine: "Chromium", viewport: "1440x900", cpuThrottleRate: 1, frameSamples: 120 },
    },
    node: process.version,
    actionMaxMs: Object.fromEntries(Object.entries(actionMax).map(([name, value]) => [name, Number(value.toFixed(2))])),
    throttledFrameP95Ms: Number(phoneFrameP95Ms.toFixed(2)),
    desktopFrameP95Ms: Number(desktopFrameP95Ms.toFixed(2)),
    desktopSurface,
    runtime: { phone: throttledRuntime, desktop: desktopRuntime },
    timeline: { phone: throttledTimeline, desktop: desktopTimeline },
  };
  const budgetFailures = collectBudgetFailures({ actionMaxMs: actionMax, phoneFrameP95Ms, phoneQuality: throttledQuality, desktopFrameP95Ms });
  console.log(JSON.stringify({ ...diagnostics, budgetFailures }));
  assert.deepEqual(errors, []);
  assert.deepEqual(budgetFailures, [], budgetFailures.join("\n"));
} finally {
  await harness.close();
}
