import type { NightCompletion } from "./night-core.js";

export interface DawnLocalParts {
  date: string;
  hour: number;
  minute: number;
}

export interface DawnEligibility {
  available: boolean;
  reason: string;
  local?: DawnLocalParts;
}

interface RecorderConstructor {
  new(stream: MediaStream, options?: MediaRecorderOptions): MediaRecorder;
  isTypeSupported?(type: string): boolean;
}

interface RecordLoopOptions {
  MediaRecorderCtor?: RecorderConstructor | null;
  durationMs?: number;
  fps?: number;
}

  "use strict";

  const LOOP_DURATION_MS = 3000;
  const LOOP_TYPES = ["video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];

  function localParts(date: Date, timeZone: string): DawnLocalParts {
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

  function eligibility(completion: Pick<NightCompletion, "dawnDate" | "timeZone"> | null, now: Date | string | number = new Date()): DawnEligibility {
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

  function chooseLoopType(MediaRecorderCtor: RecorderConstructor | null | undefined = globalThis.MediaRecorder): string | null {
    if (!MediaRecorderCtor) return null;
    return LOOP_TYPES.find((type) => MediaRecorderCtor.isTypeSupported?.(type)) ?? null;
  }

  function stillBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
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

  function extensionFor(type: string) {
    return type.startsWith("video/mp4") ? "mp4" : "webm";
  }

  async function recordLoop(canvas: HTMLCanvasElement, renderFrame: (progress: number) => void, options: RecordLoopOptions = {}) {
    const MediaRecorderCtor = options.MediaRecorderCtor === undefined ? globalThis.MediaRecorder : options.MediaRecorderCtor;
    const durationMs = options.durationMs ?? LOOP_DURATION_MS;
    const fps = options.fps ?? 15;
    const type = chooseLoopType(MediaRecorderCtor);
    if (!canvas?.captureStream || !MediaRecorderCtor || !type) throw new Error("loop-export-unsupported");

    const stream = canvas.captureStream(fps);
    const recorder = new MediaRecorderCtor(stream, { mimeType: type, videoBitsPerSecond: 1_200_000 });
    const chunks: Blob[] = [];
    const complete = new Promise<Blob>((resolve, reject) => {
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
      await new Promise<void>((resolve) => {
        function frame(now: number) {
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

  function leaseUrl(blob: Blob, urlApi: Pick<typeof URL, "createObjectURL" | "revokeObjectURL"> = globalThis.URL) {
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

  async function shareBlob(blob: Blob, filename: string, title: string, navigatorObject: Navigator = globalThis.navigator) {
    if (!navigatorObject?.share || typeof globalThis.File !== "function") return "unsupported";
    const file = new File([blob], filename, { type: blob.type, lastModified: 0 });
    if (navigatorObject.canShare && !navigatorObject.canShare({ files: [file] })) return "unsupported";
    try {
      await navigatorObject.share({ files: [file], title });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
      throw error;
    }
  }

  export const NindovaDawn = Object.freeze({
    LOOP_DURATION_MS,
    chooseLoopType,
    eligibility,
    leaseUrl,
    localParts,
    recordLoop,
    shareBlob,
    stillBlob,
  });

export type NindovaDawnApi = typeof NindovaDawn;

declare global {
  var NindovaDawn: NindovaDawnApi;
}

globalThis.NindovaDawn = NindovaDawn;
