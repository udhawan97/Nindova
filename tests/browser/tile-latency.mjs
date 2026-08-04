import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "../..");
const cpuThrottle = Number(process.env.NINDOVA_CPU_THROTTLE ?? 1);
const explicitTarget = process.env.NINDOVA_LATENCY_URL;
const targets = explicitTarget
  ? [["served route", explicitTarget]]
  : [["standalone", pathToFileURL(resolve(root, "apps/session/dist/nindova.html")).href]];
let server = null;
let browser = null;

async function availablePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      assert.ok(address && typeof address !== "string");
      probe.close(() => resolvePort(address.port));
    });
  });
}

async function tapTile(page, tileId) {
  const tile = page.locator(`[data-tile-id="${tileId}"]`);
  const box = await tile.boundingBox();
  assert.ok(box, `${tileId} should have a touchable box`);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
}

async function elapsedUntil(predicate) {
  const startedAt = performance.now();
  await predicate();
  return performance.now() - startedAt;
}

async function measureTarget(label, href) {
  assert.ok(browser, "browser should be available before measuring latency");
  const targetUrl = new URL(href);
  targetUrl.searchParams.set("review", "1");
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  if (cpuThrottle > 1) {
    const devtools = await context.newCDPSession(page);
    await devtools.send("Emulation.setCPUThrottlingRate", { rate: cpuThrottle });
  }

  try {
    await page.goto(targetUrl.href);
    await page.waitForFunction(() => Boolean(window.__ct));
    await page.check('input[name="rasoi-profile"][value="deeper"]');
    await page.click("#beginBtn");
    await page.waitForFunction(() => window.__ct.state === "play");

    const touchContract = await page.locator(".tile").first().evaluate((tile) => {
      const style = getComputedStyle(tile);
      const properties = style.transitionProperty.split(", ");
      const durations = style.transitionDuration.split(", ");
      const transformIndex = properties.indexOf("transform");
      const transformDuration = durations[transformIndex] ?? durations[0];
      return {
        touchAction: style.touchAction,
        transformDurationMs: transformDuration.endsWith("ms")
          ? Number.parseFloat(transformDuration)
          : Number.parseFloat(transformDuration) * 1000,
      };
    });

    const firstPair = await page.evaluate(() => window.__ct.legalPairs[0]);
    const firstSelectionMs = await elapsedUntil(async () => {
      await tapTile(page, firstPair[0]);
      await page.waitForFunction((tileId) => document.querySelector(`[data-tile-id="${tileId}"]`)?.classList.contains("is-selected"), firstPair[0]);
    });

    const matchStateMs = await elapsedUntil(async () => {
      await tapTile(page, firstPair[1]);
      await page.waitForFunction(() => window.__ct.removedTileCount === 2);
    });

    const nextPair = await page.evaluate(() => window.__ct.legalPairs[0]);
    const nextSelectionMs = await elapsedUntil(async () => {
      let attempts = 0;
      while (await page.evaluate((tileId) => !document.querySelector(`[data-tile-id="${tileId}"]`)?.classList.contains("is-selected"), nextPair[0])) {
        assert.ok(attempts < 20, "the next free tile should not remain touch-blocked after a match");
        attempts += 1;
        await tapTile(page, nextPair[0]);
        await page.waitForTimeout(16);
      }
    });

    assert.equal(touchContract.touchAction, "manipulation", "tiles should opt into immediate tap handling");
    assert.ok(touchContract.transformDurationMs <= 100, `tile lift should settle within 100ms, got ${touchContract.transformDurationMs}ms`);
    assert.ok(firstSelectionMs < 150, `first touch should select within 150ms, got ${firstSelectionMs.toFixed(1)}ms`);
    assert.ok(matchStateMs < 150, `matching touch should settle engine state within 150ms, got ${matchStateMs.toFixed(1)}ms`);
    assert.ok(nextSelectionMs < 150, `next free tile should accept touch within 150ms, got ${nextSelectionMs.toFixed(1)}ms`);

    console.log(`${label} tile latency${cpuThrottle > 1 ? ` (${cpuThrottle}× CPU throttle)` : ""}: first ${firstSelectionMs.toFixed(1)}ms · match ${matchStateMs.toFixed(1)}ms · next ${nextSelectionMs.toFixed(1)}ms`);
  } finally {
    await context.close();
  }
}

try {
  if (!explicitTarget) {
    const port = await availablePort();
    server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs"), resolve(root, "dist")], {
      cwd: root,
      env: { ...process.env, NINDOVA_PREVIEW_PORT: String(port) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((resolveReady, reject) => {
      let stderr = "";
      const timer = setTimeout(() => reject(new Error("latency preview server did not start")), 5_000);
      server.once("error", reject);
      server.once("exit", (code) => {
        clearTimeout(timer);
        reject(new Error(`latency preview server exited with ${code}: ${stderr.trim()}`));
      });
      server.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
      server.stdout.on("data", (chunk) => {
        if (chunk.toString().includes("Nindova preview")) {
          clearTimeout(timer);
          resolveReady();
        }
      });
    });
    targets.push(["PWA", `http://127.0.0.1:${port}/play/`]);
  }
  browser = await chromium.launch();
  for (const [label, target] of targets) await measureTarget(label, target);
} finally {
  await browser?.close();
  if (server && server.exitCode === null) {
    server.kill("SIGTERM");
    await new Promise((resolveExit) => server.once("exit", resolveExit));
  }
}
