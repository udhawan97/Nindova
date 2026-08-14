import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { readFile, readdir } from "node:fs/promises";
import { PassThrough } from "node:stream";
import { resolve } from "node:path";
import test from "node:test";
import { createBrowserEvidenceHarness } from "../browser/evidence-harness.mjs";

const root = resolve(import.meta.dirname, "../..");
const browserDirectory = resolve(root, "tests/browser");

function previewProcess(events) {
  const process = new EventEmitter();
  process.exitCode = null;
  process.stdout = new PassThrough();
  process.stderr = new PassThrough();
  process.kill = (signal) => {
    events.push(`preview:${signal}`);
    process.exitCode = 0;
    queueMicrotask(() => process.emit("exit", 0));
    return true;
  };
  return process;
}

test("browser journeys delegate preview, Chromium, failure capture, and teardown to one harness", async () => {
  const harness = await readFile(resolve(browserDirectory, "evidence-harness.mjs"), "utf8");
  const journeys = (await readdir(browserDirectory))
    .filter((file) => file.endsWith(".mjs") && file !== "evidence-harness.mjs");
  const sources = await Promise.all(journeys.map(async (file) => [file, await readFile(resolve(browserDirectory, file), "utf8")]));

  assert.match(harness, /async function startPreview/);
  assert.match(harness, /chromium\.launch/);
  assert.match(harness, /async function context/);
  assert.match(harness, /function watchPage/);
  assert.match(harness, /function close/);
  for (const [file, source] of sources) {
    assert.match(source, /createBrowserEvidenceHarness/, `${file} uses the evidence harness`);
    assert.doesNotMatch(source, /chromium\.launch|spawn\(process\.execPath|browser\.newContext|browser\.close\(|server\.kill\(/, `${file} does not own infrastructure`);
    assert.doesNotMatch(source, /\.on\("(?:console|pageerror)"/, `${file} does not duplicate failure capture`);
  }
});

test("the PWA journey preserves independent same-origin and standalone checks", async () => {
  const journey = await readFile(resolve(browserDirectory, "pwa-offline.mjs"), "utf8");
  assert.match(journey, /nindova\.html\?review=1/);
  assert.match(journey, /navigator\.serviceWorker\.controller/);
  assert.match(journey, /requests\.every\(\(url\) => new URL\(url\)\.origin === new URL\(base\)\.origin\)/);
  assert.doesNotMatch(journey, /route\.fulfill|page\.route/);
});

test("failed preview readiness stops the child and runs every cleanup action", async () => {
  const events = [];
  await assert.rejects(
    createBrowserEvidenceHarness({
      root,
      previewRoot: "dist",
      port: 41_001,
      cleanup: [
        async () => { events.push("cleanup:first"); },
        async () => { events.push("cleanup:last"); },
      ],
    }, {
      spawnProcess: () => previewProcess(events),
      awaitPreviewReady: async () => { throw new Error("readiness failed"); },
      launchBrowser: async () => { events.push("browser:unexpected"); },
    }),
    /readiness failed/,
  );
  assert.deepEqual(events, ["preview:SIGTERM", "cleanup:last", "cleanup:first"]);
});

test("failed browser launch rolls back the ready preview and every cleanup action", async () => {
  const events = [];
  await assert.rejects(
    createBrowserEvidenceHarness({
      root,
      previewRoot: "dist",
      port: 41_002,
      cleanup: [
        async () => { events.push("cleanup:first"); },
        async () => { events.push("cleanup:last"); },
      ],
    }, {
      spawnProcess: () => previewProcess(events),
      awaitPreviewReady: async () => { events.push("preview:ready"); },
      launchBrowser: async () => { throw new Error("launch failed"); },
    }),
    /launch failed/,
  );
  assert.deepEqual(events, ["preview:ready", "preview:SIGTERM", "cleanup:last", "cleanup:first"]);
});

test("failed browser-context acquisition closes the harness before caller cleanup exists", async () => {
  const events = [];
  const harness = await createBrowserEvidenceHarness({
    root,
    previewRoot: "dist",
    port: 41_004,
    cleanup: [async () => { events.push("cleanup"); }],
  }, {
    spawnProcess: () => previewProcess(events),
    awaitPreviewReady: async () => { events.push("preview:ready"); },
    launchBrowser: async () => ({
      async newContext() { throw new Error("new context failed"); },
      async close() { events.push("browser:close"); },
    }),
  });

  await assert.rejects(harness.context(), /new context failed/);
  await harness.close();
  assert.deepEqual(events, ["preview:ready", "browser:close", "preview:SIGTERM", "cleanup"]);
});

test("failed init adapter closes its context and every remaining harness resource", async () => {
  const events = [];
  const harness = await createBrowserEvidenceHarness({
    root,
    previewRoot: "dist",
    port: 41_005,
    cleanup: [async () => { events.push("cleanup"); }],
  }, {
    spawnProcess: () => previewProcess(events),
    awaitPreviewReady: async () => { events.push("preview:ready"); },
    launchBrowser: async () => ({
      async newContext() {
        return {
          on() {},
          async addInitScript() { throw new Error("adapter failed"); },
          async close() { events.push("context:close"); },
        };
      },
      async close() { events.push("browser:close"); },
    }),
  });

  await assert.rejects(harness.context({}, [() => {}]), /adapter failed/);
  assert.deepEqual(events, [
    "preview:ready",
    "context:close",
    "browser:close",
    "preview:SIGTERM",
    "cleanup",
  ]);
});

test("failed page and navigation acquisition each close their complete harness", async () => {
  for (const stage of ["page", "navigation"]) {
    const events = [];
    const harness = await createBrowserEvidenceHarness({
      root,
      previewRoot: "dist",
      port: stage === "page" ? 41_006 : 41_007,
      cleanup: [async () => { events.push("cleanup"); }],
    }, {
      spawnProcess: () => previewProcess(events),
      awaitPreviewReady: async () => { events.push("preview:ready"); },
      launchBrowser: async () => ({
        async newContext() {
          return {
            on() {},
            async newPage() {
              if (stage === "page") throw new Error("new page failed");
              return {
                on() {},
                async goto() { throw new Error("navigation failed"); },
              };
            },
            async close() { events.push("context:close"); },
          };
        },
        async close() { events.push("browser:close"); },
      }),
    });

    await assert.rejects(
      harness.open({ target: "http://127.0.0.1/" }),
      stage === "page" ? /new page failed/ : /navigation failed/,
    );
    assert.deepEqual(events, [
      "preview:ready",
      "context:close",
      "browser:close",
      "preview:SIGTERM",
      "cleanup",
    ]);
  }
});

test("teardown attempts every resource when context, browser, and cleanup fail", async () => {
  const events = [];
  let contextNumber = 0;
  const harness = await createBrowserEvidenceHarness({
    root,
    previewRoot: "dist",
    port: 41_003,
    cleanup: [
      async () => { events.push("cleanup:first"); },
      async () => { events.push("cleanup:throws"); throw new Error("cleanup failed"); },
      async () => { events.push("cleanup:last"); },
    ],
  }, {
    spawnProcess: () => previewProcess(events),
    awaitPreviewReady: async () => { events.push("preview:ready"); },
    launchBrowser: async () => ({
      async newContext() {
        const number = ++contextNumber;
        return {
          on() {},
          async close() {
            events.push(`context:${number}`);
            if (number === 1) throw new Error("context close failed");
          },
        };
      },
      async close() { events.push("browser:close"); throw new Error("browser close failed"); },
    }),
  });

  await harness.context();
  await harness.context();
  const closing = harness.close();
  assert.equal(harness.close(), closing, "repeated close reuses the same teardown result");
  await assert.rejects(
    closing,
    (error) => error instanceof AggregateError
      && error.errors.some((failure) => failure.message === "context close failed")
      && error.errors.some((failure) => failure.message === "browser close failed")
      && error.errors.some((failure) => failure.message === "cleanup failed"),
  );
  assert.deepEqual(events, [
    "preview:ready",
    "context:1",
    "context:2",
    "browser:close",
    "preview:SIGTERM",
    "cleanup:last",
    "cleanup:throws",
    "cleanup:first",
  ]);
});
