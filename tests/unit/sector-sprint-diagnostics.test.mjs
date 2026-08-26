import assert from "node:assert/strict";
import test from "node:test";
import {
  collectBudgetFailures,
  summarizeTimeline,
} from "../helpers/sector-sprint-diagnostics.mjs";

test("Sector Sprint diagnostics report every missed interaction and frame budget", () => {
  assert.deepEqual(collectBudgetFailures({
    actionMaxMs: { laneMove: 180 },
    phoneFrameP95Ms: 66.7,
    phoneQuality: "quiet",
    desktopFrameP95Ms: 33.9,
  }), [
    "laneMove maximum 180.0ms across three observed moves must remain below 150ms under 4x CPU",
    "375x812 4x CPU quiet p95 frame interval 66.7ms must remain <= 50ms",
    "1440x900 p95 frame interval 33.9ms must remain <= 25ms",
  ]);
});

test("Sector Sprint diagnostics summarize named timeline phases and the between-frame gap", () => {
  assert.deepEqual(summarizeTimeline([
    { name: "FireAnimationFrame", ph: "X", ts: 0, dur: 1_000 },
    { name: "FunctionCall", ph: "X", ts: 100, dur: 200 },
    { name: "Paint", ph: "X", ts: 400, dur: 300 },
    { name: "Decode Image", ph: "X", ts: 700, dur: 400 },
    { name: "RasterTask", ph: "X", ts: 1_100, dur: 500 },
    { name: "Layout", ph: "X", ts: 1_600, dur: 600 },
    { name: "UpdateLayoutTree", ph: "X", ts: 2_200, dur: 100 },
    { name: "FireAnimationFrame", ph: "X", ts: 17_000, dur: 2_000 },
  ]), {
    animationFrame: { count: 2, totalMs: 3, maxMs: 2 },
    script: { count: 1, totalMs: 0.2, maxMs: 0.2 },
    layout: { count: 2, totalMs: 0.7, maxMs: 0.6 },
    paint: { count: 1, totalMs: 0.3, maxMs: 0.3 },
    imageDecode: { count: 1, totalMs: 0.4, maxMs: 0.4 },
    raster: { count: 1, totalMs: 0.5, maxMs: 0.5 },
    betweenFrameGapP95Ms: 16,
  });
});
