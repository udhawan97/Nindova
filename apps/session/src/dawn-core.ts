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

  const DAWN_PALETTE = Object.freeze({
    paperLight: "#f3ead7",
    paper: "#ead9bf",
    sunrise: "#c98e73",
    lightWash: "rgba(255,244,213,.54)",
    lightClear: "rgba(255,244,213,0)",
    clear: "transparent",
    lattice: "rgba(83,57,70,.11)",
    indigo: "#21192d",
    indigoRaised: "#302239",
    runner: "#53323d",
    runnerPattern: "rgba(222,185,112,.17)",
    brass: "#b77a32",
    brassLight: "#dfc486",
    brassShadow: "#7f542a",
    plate: "#f0e3c7",
    plateWash: "rgba(183,122,50,.12)",
    shadow: "rgba(24,15,27,.28)",
    inkIndigo: "#35243b",
    inkMadder: "#713b45",
    inkPeacock: "#285b5a",
    inkBronze: "#72502f",
  });

  const MOTIF_INKS = Object.freeze([
    DAWN_PALETTE.inkMadder,
    DAWN_PALETTE.inkIndigo,
    DAWN_PALETTE.inkBronze,
    DAWN_PALETTE.inkPeacock,
  ]);

  const RASOI_FRAME_LABEL = "Last night's nine kitchen motifs resting on brass plates at first light.";
  const LEGACY_FRAME_LABEL = "A safely migrated Dawn from an earlier Nindova night.";

  function drawCanvasMotif(
    context: CanvasRenderingContext2D,
    motif: string,
    x: number,
    y: number,
    scale: number,
    progress = 0,
    ink: string = DAWN_PALETTE.inkIndigo,
  ) {
    context.save();
    context.translate(x, y);
    context.scale(scale, scale);
    context.strokeStyle = ink;
    context.fillStyle = DAWN_PALETTE.plateWash;
    context.lineWidth = 4;
    context.lineCap = "round";
    context.lineJoin = "round";
    const circle = (cx: number, cy: number, radius: number) => { context.beginPath(); context.arc(cx, cy, radius, 0, Math.PI * 2); context.stroke(); };
    if (motif === "belan") {
      context.beginPath(); context.moveTo(-38, 0); context.lineTo(38, 0); context.stroke();
      context.strokeRect(-26, -9, 52, 18);
    } else if (motif === "chakla") {
      context.beginPath(); context.ellipse(0, 0, 29, 18, 0, 0, Math.PI * 2); context.fill(); context.stroke();
      context.beginPath(); context.moveTo(-20, 14); context.lineTo(-24, 25); context.moveTo(20, 14); context.lineTo(24, 25); context.stroke();
    } else if (motif === "tawa") {
      circle(-7, 0, 21); context.beginPath(); context.moveTo(14, 0); context.lineTo(41, 0); context.stroke();
    } else if (motif === "chimta") {
      context.beginPath(); context.moveTo(-22, -23); context.quadraticCurveTo(-12, 12, 0, 25); context.moveTo(22, -23); context.quadraticCurveTo(12, 12, 0, 25); context.stroke();
    } else if (motif === "katori") {
      context.beginPath(); context.moveTo(-28, -10); context.quadraticCurveTo(-22, 22, 0, 23); context.quadraticCurveTo(22, 22, 28, -10); context.closePath(); context.fill(); context.stroke();
    } else if (motif === "tiffin") {
      context.strokeRect(-23, -24, 46, 48); context.beginPath(); context.moveTo(-23, -8); context.lineTo(23, -8); context.moveTo(-23, 9); context.lineTo(23, 9); context.moveTo(-13, -24); context.quadraticCurveTo(0, -39, 13, -24); context.stroke();
    } else if (motif === "masala") {
      circle(0, 0, 29); for (const [dx, dy] of [[0,0],[-14,-9],[14,-9],[-14,10],[14,10]]) circle(dx, dy, 5);
    } else if (motif === "chai") {
      context.beginPath(); context.moveTo(-21, -18); context.lineTo(21, -18); context.lineTo(17, 24); context.lineTo(-17, 24); context.closePath(); context.fill(); context.stroke();
      context.beginPath(); context.moveTo(-8, -25 + progress * 4); context.quadraticCurveTo(-15, -34, -7, -40); context.moveTo(7, -26 - progress * 4); context.quadraticCurveTo(15, -36, 7, -42); context.stroke();
    } else {
      context.strokeRect(-28, -15, 50, 35); context.beginPath(); context.moveTo(-23, -15); context.quadraticCurveTo(0, -31, 20, -15); context.moveTo(22, 0); context.lineTo(39, 0); context.stroke(); circle(0, -27, 3);
    }
    context.restore();
  }

  function drawDawnLattice(context: CanvasRenderingContext2D, width: number) {
    context.save();
    context.beginPath();
    context.rect(width * .52, 48, width * .39, 318);
    context.clip();
    context.strokeStyle = DAWN_PALETTE.lattice;
    context.lineWidth = 2;
    for (let offset = -520; offset < width + 520; offset += 112) {
      context.beginPath();
      context.moveTo(offset, 34);
      context.lineTo(offset + 430, 464);
      context.stroke();
      context.beginPath();
      context.moveTo(offset, 382);
      context.lineTo(offset + 430, 34);
      context.stroke();
    }
    context.restore();
  }

  function drawDawnPlate(context: CanvasRenderingContext2D, x: number, y: number, ink: string) {
    context.save();
    context.shadowColor = DAWN_PALETTE.shadow;
    context.shadowBlur = 18;
    context.shadowOffsetY = 12;
    context.fillStyle = DAWN_PALETTE.brassShadow;
    context.beginPath();
    context.ellipse(x, y + 8, 83, 44, 0, 0, Math.PI * 2);
    context.fill();
    context.shadowColor = DAWN_PALETTE.clear;
    context.fillStyle = DAWN_PALETTE.brassLight;
    context.beginPath();
    context.ellipse(x, y, 80, 42, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = DAWN_PALETTE.brass;
    context.lineWidth = 4;
    context.stroke();
    context.fillStyle = DAWN_PALETTE.plate;
    context.beginPath();
    context.ellipse(x, y - 2, 68, 33, 0, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = DAWN_PALETTE.brassShadow;
    context.lineWidth = 2;
    context.stroke();
    context.strokeStyle = ink;
    context.beginPath();
    context.moveTo(x - 23, y + 29);
    context.lineTo(x, y + 34);
    context.lineTo(x + 23, y + 29);
    context.stroke();
    context.restore();
  }

  /** Where each remembered motif rests on the Dawn table. */
  function platePositions(motifOrder: readonly string[]) {
    return motifOrder.map((motif, index) => ({
      motif,
      x: 150 + (index % 5) * 225 + (index >= 5 ? 110 : 0),
      y: index < 5 ? 490 : 632,
      ink: MOTIF_INKS[index % MOTIF_INKS.length],
    }));
  }

  /**
   * Paint one Dawn keepsake frame for a completed Night.
   *
   * `progress` runs 0 to 1 across a silent loop and only stirs the chai steam,
   * so the still saved at 0 is the frame the person keeps.
   */
  function renderFrame(canvas: HTMLCanvasElement, completion: NightCompletion | null, progress = 0) {
    const context = canvas?.getContext?.("2d");
    if (!context || !completion) return false;
    const width = canvas.width;
    const height = canvas.height;
    const sky = context.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, DAWN_PALETTE.paperLight);
    sky.addColorStop(1, DAWN_PALETTE.sunrise);
    context.fillStyle = sky;
    context.fillRect(0, 0, width, height);

    const wall = context.createLinearGradient(108, 48, width - 108, 366);
    wall.addColorStop(0, DAWN_PALETTE.paperLight);
    wall.addColorStop(1, DAWN_PALETTE.paper);
    context.fillStyle = wall;
    context.fillRect(108, 48, width - 216, 318);
    context.strokeStyle = DAWN_PALETTE.brass;
    context.lineWidth = 3;
    context.strokeRect(108, 48, width - 216, 318);
    context.strokeStyle = DAWN_PALETTE.brassLight;
    context.lineWidth = 1;
    context.strokeRect(118, 58, width - 236, 298);
    const firstLight = context.createRadialGradient(width * .84, height * .08, 12, width * .84, height * .08, 430);
    firstLight.addColorStop(0, DAWN_PALETTE.lightWash);
    firstLight.addColorStop(1, DAWN_PALETTE.lightClear);
    context.fillStyle = firstLight;
    context.fillRect(108, 48, width - 216, 318);
    context.fillStyle = DAWN_PALETTE.lightWash;
    context.beginPath();
    context.moveTo(width * .56, 48);
    context.lineTo(width - 108, 48);
    context.lineTo(width * .78, 366);
    context.lineTo(width * .39, 366);
    context.closePath();
    context.fill();
    drawDawnLattice(context, width);

    const table = context.createLinearGradient(0, 390, 0, height);
    table.addColorStop(0, DAWN_PALETTE.indigoRaised);
    table.addColorStop(1, DAWN_PALETTE.indigo);
    context.fillStyle = table;
    context.fillRect(0, 390, width, height - 390);
    context.fillStyle = DAWN_PALETTE.brass;
    context.fillRect(0, 390, width, 7);
    context.fillStyle = DAWN_PALETTE.runner;
    context.fillRect(74, 420, width - 148, 297);
    context.strokeStyle = DAWN_PALETTE.brassShadow;
    context.lineWidth = 2;
    context.strokeRect(74, 420, width - 148, 297);
    context.strokeStyle = DAWN_PALETTE.runnerPattern;
    context.lineWidth = 1;
    context.save();
    context.beginPath();
    context.rect(74, 420, width - 148, 297);
    context.clip();
    for (let x = 74; x <= width - 74; x += 76) {
      context.beginPath();
      context.moveTo(x, 420);
      context.lineTo(x + 118, 717);
      context.stroke();
      context.beginPath();
      context.moveTo(x, 717);
      context.lineTo(x + 118, 420);
      context.stroke();
    }
    context.restore();

    if (completion.kind === "rasoi-pairs") {
      for (const item of platePositions(completion.motifOrder)) {
        drawDawnPlate(context, item.x, item.y, item.ink);
        drawCanvasMotif(context, item.motif, item.x, item.y - 5, .82, progress, item.ink);
      }
      canvas.setAttribute?.("aria-label", RASOI_FRAME_LABEL);
      return true;
    }
    context.fillStyle = DAWN_PALETTE.brassLight;
    context.beginPath(); context.ellipse(width / 2, 584, 270, 92, 0, 0, Math.PI * 2); context.fill();
    context.strokeStyle = DAWN_PALETTE.brassShadow; context.lineWidth = 5; context.stroke();
    context.fillStyle = DAWN_PALETTE.inkIndigo;
    context.font = "44px Iowan Old Style, Palatino, serif";
    context.textAlign = "center";
    context.fillText("An earlier Nindova night, kept safely", width / 2, 592);
    canvas.setAttribute?.("aria-label", LEGACY_FRAME_LABEL);
    return true;
  }

  export const NindovaDawn = Object.freeze({
    DAWN_PALETTE,
    LEGACY_FRAME_LABEL,
    LOOP_DURATION_MS,
    RASOI_FRAME_LABEL,
    chooseLoopType,
    eligibility,
    leaseUrl,
    localParts,
    platePositions,
    recordLoop,
    renderFrame,
    shareBlob,
    stillBlob,
  });

export type NindovaDawnApi = typeof NindovaDawn;

declare global {
  var NindovaDawn: NindovaDawnApi;
}

globalThis.NindovaDawn = NindovaDawn;
