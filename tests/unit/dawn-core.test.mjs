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
