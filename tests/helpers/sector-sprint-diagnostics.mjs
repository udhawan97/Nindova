const phaseEvents = {
  animationFrame: new Set(["FireAnimationFrame"]),
  script: new Set(["FunctionCall"]),
  layout: new Set(["Layout", "UpdateLayoutTree"]),
  paint: new Set(["Paint"]),
  imageDecode: new Set(["Decode Image", "Decode LazyPixelRef", "ImageDecodeTask"]),
  raster: new Set(["RasterTask"]),
};

const roundMs = (microseconds) => Number((microseconds / 1_000).toFixed(2));

function percentile(values, amount) {
  if (values.length === 0) return 0;
  const ordered = [...values].sort((left, right) => left - right);
  return ordered[Math.max(0, Math.ceil(ordered.length * amount) - 1)];
}

export function collectBudgetFailures({ actionMaxMs, phoneFrameP95Ms, phoneQuality, desktopFrameP95Ms }) {
  const failures = [];
  for (const [name, value] of Object.entries(actionMaxMs)) {
    if (value >= 150) failures.push(`${name} maximum ${value.toFixed(1)}ms across three observed moves must remain below 150ms under 4x CPU`);
  }
  if (phoneFrameP95Ms > 50) failures.push(`375x812 4x CPU ${phoneQuality} p95 frame interval ${phoneFrameP95Ms.toFixed(1)}ms must remain <= 50ms`);
  if (desktopFrameP95Ms > 25) failures.push(`1440x900 p95 frame interval ${desktopFrameP95Ms.toFixed(1)}ms must remain <= 25ms`);
  return failures;
}

export function summarizeTimeline(traceEvents) {
  const completeEvents = traceEvents.filter((event) => event.ph === "X" && Number.isFinite(event.dur) && event.dur >= 0);
  const summary = {};
  for (const [phase, names] of Object.entries(phaseEvents)) {
    const events = completeEvents.filter((event) => names.has(event.name));
    const durations = events.map((event) => event.dur);
    summary[phase] = {
      count: events.length,
      totalMs: roundMs(durations.reduce((total, duration) => total + duration, 0)),
      maxMs: roundMs(Math.max(0, ...durations)),
    };
  }
  const frames = completeEvents
    .filter((event) => phaseEvents.animationFrame.has(event.name) && Number.isFinite(event.ts))
    .sort((left, right) => left.ts - right.ts);
  const gaps = frames.slice(0, -1).map((frame, index) => Math.max(0, frames[index + 1].ts - (frame.ts + frame.dur)));
  return { ...summary, betweenFrameGapP95Ms: roundMs(percentile(gaps, 0.95)) };
}
