(function installNindovaDawn(global) {
  "use strict";

  const LOOP_DURATION_MS = 3000;
  const LOOP_TYPES = ["video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

  function localParts(date, timeZone) {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const values = Object.fromEntries(
      formatter.formatToParts(date).filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
    );
    return {
      date: `${values.year}-${values.month}-${values.day}`,
      hour: Number(values.hour),
      minute: Number(values.minute),
    };
  }

  function eligibility(completion, now = new Date()) {
    if (!completion) return { available: false, reason: "no-completion" };
    if (typeof completion.dawnDate !== "string" || typeof completion.timeZone !== "string") {
      return { available: false, reason: "invalid-completion" };
    }
    const instant = now instanceof Date ? now : new Date(now);
    if (Number.isNaN(instant.getTime())) return { available: false, reason: "invalid-now" };
    let local;
    try {
      local = localParts(instant, completion.timeZone);
    } catch {
      return { available: false, reason: "invalid-zone" };
    }
    if (local.date !== completion.dawnDate) return { available: false, reason: "wrong-date", local };
    if (local.hour < 6) return { available: false, reason: "before-window", local };
    if (local.hour >= 12) return { available: false, reason: "expired", local };
    return { available: true, reason: "available", local };
  }

  function chooseLoopType(MediaRecorderCtor = global.MediaRecorder) {
    if (!MediaRecorderCtor) return null;
    return LOOP_TYPES.find((type) => MediaRecorderCtor.isTypeSupported?.(type)) ?? null;
  }

  function stillBlob(canvas) {
    return new Promise((resolve, reject) => {
      if (!canvas?.toBlob) {
        reject(new Error("still-export-unsupported"));
        return;
      }
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("still-export-failed"));
      }, "image/png");
    });
  }

  function extensionFor(type) {
    return type.startsWith("video/mp4") ? "mp4" : "webm";
  }

  async function recordLoop(canvas, renderFrame, options = {}) {
    const MediaRecorderCtor = options.MediaRecorderCtor ?? global.MediaRecorder;
    const durationMs = options.durationMs ?? LOOP_DURATION_MS;
    const fps = options.fps ?? 15;
    const type = chooseLoopType(MediaRecorderCtor);
    if (!canvas?.captureStream || !MediaRecorderCtor || !type) throw new Error("loop-export-unsupported");

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorderCtor(stream, { mimeType: type, videoBitsPerSecond: 1_200_000 });
    const chunks = [];
    const complete = new Promise((resolve, reject) => {
      recorder.addEventListener("dataavailable", (event) => {
        if (event.data?.size) chunks.push(event.data);
      });
      recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type })));
      recorder.addEventListener("error", () => reject(new Error("loop-export-failed")));
    });

    const stopTracks = () => stream.getTracks().forEach((track) => track.stop());
    try {
      recorder.start();
      const started = performance.now();
      await new Promise((resolve) => {
        function frame(now) {
          const progress = Math.min(1, (now - started) / durationMs);
          renderFrame(progress);
          if (progress < 1) requestAnimationFrame(frame);
          else resolve();
        }
        renderFrame(0);
        requestAnimationFrame(frame);
      });
      recorder.stop();
      const blob = await complete;
      return { blob, type, extension: extensionFor(type), durationMs };
    } finally {
      stopTracks();
    }
  }

  function leaseUrl(blob, urlApi = global.URL) {
    const url = urlApi.createObjectURL(blob);
    let active = true;
    return Object.freeze({
      url,
      revoke() {
        if (!active) return;
        active = false;
        urlApi.revokeObjectURL(url);
      },
    });
  }

  async function shareBlob(blob, filename, title, navigatorObject = global.navigator) {
    if (!navigatorObject?.share || typeof global.File !== "function") return "unsupported";
    const file = new File([blob], filename, { type: blob.type, lastModified: 0 });
    if (navigatorObject.canShare && !navigatorObject.canShare({ files: [file] })) return "unsupported";
    try {
      await navigatorObject.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
      throw error;
    }
  }

  global.NindovaDawn = Object.freeze({
    LOOP_DURATION_MS,
    chooseLoopType,
    eligibility,
    leaseUrl,
    localParts,
    recordLoop,
    shareBlob,
    stillBlob,
  });
})(globalThis);
