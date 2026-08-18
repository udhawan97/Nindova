import assert from "node:assert/strict";
import test from "node:test";

await import("../../apps/session/dist/dawn-core.js");
const Dawn = globalThis.NindovaDawn;

const chicagoCompletion = {
  dawnDate: "2026-08-03",
  timeZone: "America/Chicago",
};

test("Dawn opens from 06:00 through 11:59 in the captured zone", () => {
  assert.equal(Dawn.eligibility(chicagoCompletion, new Date("2026-08-03T10:59:00Z")).reason, "before-window");
  assert.equal(Dawn.eligibility(chicagoCompletion, new Date("2026-08-03T11:00:00Z")).available, true);
  assert.equal(Dawn.eligibility(chicagoCompletion, new Date("2026-08-03T16:59:00Z")).available, true);
  assert.equal(Dawn.eligibility(chicagoCompletion, new Date("2026-08-03T17:00:00Z")).reason, "expired");
});

test("Dawn rejects skipped dates and missing completion", () => {
  assert.equal(Dawn.eligibility(null, new Date("2026-08-03T14:00:00Z")).reason, "no-completion");
  assert.equal(Dawn.eligibility(chicagoCompletion, new Date("2026-08-04T14:00:00Z")).reason, "wrong-date");
  assert.equal(Dawn.eligibility({ dawnDate: "2026-08-03", timeZone: "Not/AZone" }).reason, "invalid-zone");
});

test("captured IANA zone controls eligibility after travel", () => {
  const instant = new Date("2026-08-03T11:30:00Z");
  assert.deepEqual(Dawn.eligibility(chicagoCompletion, instant).local, {
    date: "2026-08-03",
    hour: 6,
    minute: 30,
  });
  assert.equal(
    Dawn.eligibility({ dawnDate: "2026-08-03", timeZone: "Asia/Kolkata" }, new Date("2026-08-03T00:30:00Z")).available,
    true,
  );
});

test("loop type selection prefers a supported capability", () => {
  const FakeRecorder = {
    isTypeSupported(type) {
      return type === "video/webm;codecs=vp8";
    },
  };
  assert.equal(Dawn.chooseLoopType(FakeRecorder), "video/webm;codecs=vp8");
  assert.equal(Dawn.chooseLoopType(null), null);
});

test("temporary object URLs revoke exactly once", () => {
  const calls = [];
  const lease = Dawn.leaseUrl(new Blob(["dawn"]), {
    createObjectURL() {
      return "blob:dawn";
    },
    revokeObjectURL(url) {
      calls.push(url);
    },
  });
  assert.equal(lease.url, "blob:dawn");
  lease.revoke();
  lease.revoke();
  assert.deepEqual(calls, ["blob:dawn"]);
});

test("still export requests PNG without metadata inputs", async () => {
  const blob = await Dawn.stillBlob({
    toBlob(callback, type) {
      callback(new Blob(["png"], { type }));
    },
  });
  assert.equal(blob.type, "image/png");
  assert.equal(await blob.text(), "png");
});

const MOTIF_ORDER = ["belan", "chakla", "tawa", "chimta", "katori", "tiffin", "masala", "chai", "cooker"];

function recordingCanvas(width = 1200, height = 750) {
  const calls = [];
  const attributes = {};
  const gradient = { addColorStop: () => {} };
  const context = new Proxy({}, {
    get(_target, property) {
      if (property === "createLinearGradient" || property === "createRadialGradient") return () => gradient;
      return (...args) => { calls.push({ op: property, args }); };
    },
    set(_target, property, value) {
      calls.push({ op: `set:${String(property)}`, args: [value] });
      return true;
    },
  });
  return {
    width,
    height,
    getContext: (kind) => (kind === "2d" ? context : null),
    setAttribute: (name, value) => { attributes[name] = value; },
    calls,
    attributes,
  };
}

const rasoiCompletion = { kind: "rasoi-pairs", motifOrder: MOTIF_ORDER };
const legacyCompletion = { kind: "legacy-vista", vista: "meadow", finalKind: "rabbit" };

test("a Dawn frame needs both a drawing surface and a remembered Night", () => {
  assert.equal(Dawn.renderFrame(recordingCanvas(), null), false);
  assert.equal(Dawn.renderFrame({ getContext: () => null, width: 10, height: 10 }, rasoiCompletion), false);
  assert.equal(Dawn.renderFrame(recordingCanvas(), rasoiCompletion), true);
});

test("a remembered Rasoi Night paints one plate per kitchen motif", () => {
  const canvas = recordingCanvas();
  Dawn.renderFrame(canvas, rasoiCompletion);
  // Nine plates, each an ellipse trio, plus the motif drawn on top of it.
  const positions = Dawn.platePositions(MOTIF_ORDER);
  assert.equal(positions.length, 9);
  assert.equal(new Set(positions.map((item) => `${item.x}x${item.y}`)).size, 9);
  assert.equal(positions.filter((item) => item.y === 490).length, 5);
  assert.equal(positions.filter((item) => item.y === 632).length, 4);
  assert.equal(canvas.attributes["aria-label"], Dawn.RASOI_FRAME_LABEL);
  assert.equal(canvas.calls.some((call) => call.op === "fillText"), false);
});

test("a migrated legacy Night is named rather than painted with plates", () => {
  const canvas = recordingCanvas();
  Dawn.renderFrame(canvas, legacyCompletion);
  assert.equal(canvas.attributes["aria-label"], Dawn.LEGACY_FRAME_LABEL);
  const text = canvas.calls.find((call) => call.op === "fillText");
  assert.ok(text, "the legacy frame must name the night it kept");
  assert.equal(text.args[0], "An earlier Nindova night, kept safely");
});

test("loop progress stirs the chai steam and nothing structural", () => {
  const shape = (progress) => {
    const canvas = recordingCanvas();
    Dawn.renderFrame(canvas, rasoiCompletion, progress);
    return canvas.calls.map((call) => call.op).join("|");
  };
  assert.equal(shape(0), shape(1), "a loop frame must not add or drop drawing operations");
  // The steam rises by moving where each wisp starts, not by redrawing its curve.
  const steamAt = (progress) => {
    const canvas = recordingCanvas();
    Dawn.renderFrame(canvas, { kind: "rasoi-pairs", motifOrder: ["chai"] }, progress);
    return JSON.stringify(canvas.calls.filter((call) => call.op === "moveTo").map((call) => call.args));
  };
  assert.notEqual(steamAt(0), steamAt(1), "the chai steam must move across a loop");
  assert.equal(steamAt(0), steamAt(0), "one progress value must paint one deterministic frame");
});

test("every kitchen motif has its own keepsake drawing", () => {
  const strokeShape = (motif) => {
    const canvas = recordingCanvas();
    Dawn.renderFrame(canvas, { kind: "rasoi-pairs", motifOrder: [motif] });
    return JSON.stringify(canvas.calls.map((call) => [call.op, call.args]));
  };
  const shapes = new Map(MOTIF_ORDER.map((motif) => [motif, strokeShape(motif)]));
  assert.equal(new Set(shapes.values()).size, MOTIF_ORDER.length, "no two motifs may share one drawing");
});
