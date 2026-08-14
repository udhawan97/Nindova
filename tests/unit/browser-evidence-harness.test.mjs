import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const browserDirectory = resolve(root, "tests/browser");

test("browser journeys delegate preview, Chromium, failure capture, and teardown to one harness", async () => {
  const harness = await readFile(resolve(browserDirectory, "evidence-harness.mjs"), "utf8");
  const journeys = (await readdir(browserDirectory))
    .filter((file) => file.endsWith(".mjs") && file !== "evidence-harness.mjs");
  const sources = await Promise.all(journeys.map(async (file) => [file, await readFile(resolve(browserDirectory, file), "utf8")]));

  assert.match(harness, /async function startPreview/);
  assert.match(harness, /chromium\.launch/);
  assert.match(harness, /async function context/);
  assert.match(harness, /function watchPage/);
  assert.match(harness, /async function close/);
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
