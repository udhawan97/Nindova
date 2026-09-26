import characterFrames from "./assets/gurpreet-frames.json";
import {
  PLACES,
  POWERUPS,
  COURSE_MARKS,
  PLAY_OBSTACLES,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  type JourneyState,
  type Point,
  canMeet,
} from "./sector-sprint.js";
export type Camera = { x: number; y: number; width: number; height: number };
export function cameraFor(
  state: Point,
  width: number,
  height: number,
  previous?: Camera,
  reduced = false,
): Camera {
  const ratio = width / height;
  const h = Math.min(ratio < 1 ? 570 : 580, WORLD_WIDTH / ratio);
  const w = h * ratio;
  const x = Math.max(0, Math.min(WORLD_WIDTH - w, state.x - w / 2));
  const y = Math.max(0, Math.min(WORLD_HEIGHT - h, state.y - h * 0.58));
  return {
    x: previous && !reduced ? previous.x + (x - previous.x) * 0.12 : x,
    y: previous && !reduced ? previous.y + (y - previous.y) * 0.12 : y,
    width: w,
    height: h,
  };
}
function ellipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
/** Small articulated figures: each foot is grounded, with limb cycles only while walking. */
function person(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  stride: number,
  facing: Point,
  walking = false,
  lead = false,
  mother = false,
) {
  const swing = walking ? Math.sin(stride) * 4 : 0;
  const bob = walking ? Math.abs(Math.sin(stride)) * 0.7 : 0;
  c.save();
  c.translate(x, y);
  ellipse(c, 4, 1, lead ? 13 : 10, 4, "#28362d55");
  c.lineCap = "round";
  c.lineWidth = 4.6;
  c.strokeStyle = mother ? "#6e3040" : "#e3cfa3";
  for (const sign of [-1, 1]) {
    c.beginPath();
    c.moveTo(sign * 3, -11);
    c.lineTo(sign * 4, sign * swing - 3);
    c.stroke();
    ellipse(c, sign * 4 + facing.x, sign * swing - 2, 3.5, 1.8, "#31382f");
  }
  c.translate(0, -bob);
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(-7, -27, 14, mother ? 22 : 19, [5, 5, 2, 2]);
  c.fill();
  c.fillStyle = "#ffffff24";
  c.fillRect(-5, -25, 3, 14);
  c.lineWidth = 3.3;
  for (const sign of [-1, 1]) {
    c.strokeStyle = color;
    c.beginPath();
    c.moveTo(sign * 7, -23);
    c.lineTo(sign * 9, -13 - sign * swing);
    c.stroke();
    ellipse(c, sign * 9, -12 - sign * swing, 2, 2.4, "#ca986e");
  }
  ellipse(c, 0, -31, 6, 7, "#c89a74");
  ellipse(c, -1, -35, 6, 3.5, mother ? "#9c9c8b" : "#302b23");
  if (facing.y < -0.3) {
    ellipse(c, 0, -32, 5.7, 5, mother ? "#9c9c8b" : "#302b23");
  } else {
    ellipse(c, 2.4 + facing.x, -31, 1, 1, "#262920");
    c.strokeStyle = "#523729";
    c.lineWidth = 1;
    c.beginPath();
    c.moveTo(0, -27);
    c.lineTo(3, -27);
    c.stroke();
  }
  if (mother) {
    c.strokeStyle = "#dca16b";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-5, -25);
    c.lineTo(5, -9);
    c.stroke();
  }
  if (lead) {
    c.strokeStyle = "#c49e65";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(-5, -24);
    c.lineTo(7, -11);
    c.stroke();
    c.fillStyle = "#af8452";
    c.fillRect(5, -13, 6, 8);
  }
  c.restore();
}
function label(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  active = false,
) {
  c.font = "600 10px system-ui";
  const w = c.measureText(text).width + 20;
  c.fillStyle = active ? "#f8edcd" : "#172d29e8";
  c.beginPath();
  c.roundRect(x - w / 2, y - 13, w, 23, 7);
  c.fill();
  c.fillStyle = active ? "#213a30" : "#f9eed4";
  c.textAlign = "center";
  c.fillText(text, x, y + 2);
}
export function drawWorld(
  c: CanvasRenderingContext2D,
  state: JourneyState,
  camera: Camera,
  art: HTMLImageElement | null,
  seconds: number,
  reduced: boolean,
  low = false,
  characters: HTMLImageElement | null = null,
) {
  const canvas = c.canvas;
  const sx = canvas.width / camera.width,
    sy = canvas.height / camera.height;
  c.setTransform(sx, 0, 0, sy, -camera.x * sx, -camera.y * sy);
  c.fillStyle = "#667b4e";
  c.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  if (art?.complete && art.naturalWidth)
    c.drawImage(art, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  else {
    c.fillStyle = "#d3bf94";
    c.fillRect(470, 0, 110, 1024);
    c.fillRect(0, 659, 1536, 45);
    c.fillRect(610, 450, 510, 205);
    c.fillRect(180, 932, 800, 42);
    c.fillStyle = "#31777d";
    c.fillRect(1210, 0, 326, 310);
    label(c, 760, 410, "Preparing the city…");
  }
  // Light surface ripples and fountain arcs, bounded and clipped to authored water.
  if (!reduced && !low) {
    c.save();
    c.beginPath();
    c.rect(1380, 20, 156, 260);
    c.clip();
    for (let i = 0; i < 19; i++) {
      const x = 1392 + ((i * 53) % 150),
        y = 35 + ((i * 37) % 250);
      const phase = seconds * 0.9 + i;
      c.strokeStyle = `rgba(225,244,220,${0.1 + (Math.sin(phase) + 1) * 0.08})`;
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(
        x + Math.sin(phase) * 3,
        y,
        6 + (i % 5),
        1.6,
        0,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
    c.restore();
    c.strokeStyle = "#e4f7e587";
    c.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      c.beginPath();
      c.ellipse(
        833,
        524,
        13 + ((seconds * 8 + i * 7) % 27),
        4 + ((seconds * 3 + i * 2) % 8),
        0,
        0,
        Math.PI * 2,
      );
      c.stroke();
    }
  }
  if (state.route.length) {
    const end = state.route.at(-1)!;
    c.strokeStyle = "#fff0be";
    c.lineWidth = 1.6;
    c.setLineDash([3, 4]);
    c.beginPath();
    c.ellipse(end.x, end.y, 10, 5, 0, 0, Math.PI * 2);
    c.stroke();
    c.setLineDash([]);
  }
  // Readable toy courses sit on paths, with airborne ribbons and physical spring pads.
  for (const obstacle of PLAY_OBSTACLES) {
    const y =
      obstacle.y +
      (obstacle.kind === "roller" && !reduced
        ? Math.sin(state.playTime * 2 + obstacle.x) * 11
        : 0);
    ellipse(c, obstacle.x + 3, y + 2, 14, 5, "#25382655");
    if (obstacle.kind === "spring") {
      c.strokeStyle = "#766947";
      c.lineWidth = 2;
      c.beginPath();
      for (let j = 0; j < 5; j++) {
        c.lineTo(obstacle.x + (j % 2 ? 8 : -8), y - j * 2);
      }
      c.stroke();
      ellipse(c, obstacle.x, y - 10, 13, 5, "#ead18a");
      ellipse(c, obstacle.x, y - 12, 8, 3, "#c88843");
    } else if (obstacle.kind === "crate") {
      c.fillStyle = "#7a5735";
      c.fillRect(obstacle.x - 11, y - 23, 22, 23);
      c.fillStyle = "#bc8e4f";
      c.fillRect(obstacle.x - 11, y - 23, 20, 18);
      c.strokeStyle = "#e0b771";
      c.lineWidth = 2;
      c.strokeRect(obstacle.x - 10, y - 22, 18, 16);
      c.beginPath();
      c.moveTo(obstacle.x - 9, y - 22);
      c.lineTo(obstacle.x + 7, y - 6);
      c.stroke();
    } else {
      ellipse(c, obstacle.x, y - 7, 12, 12, "#457e83");
      ellipse(c, obstacle.x - 2, y - 10, 8, 8, "#79c4ca");
      c.strokeStyle = "#f6d493";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(obstacle.x - 8, y - 15);
      c.lineTo(obstacle.x + 5, y - 3);
      c.stroke();
    }
  }
  for (const mark of COURSE_MARKS) {
    if (state.marks.includes(mark.id)) continue;
    const bob = reduced ? 0 : Math.sin(seconds * 3 + mark.point.x) * 2;
    ellipse(c, mark.point.x, mark.point.y + 2, 7, 2, "#37453055");
    const y = mark.point.y - mark.z + bob;
    c.strokeStyle = mark.owner === "roses" ? "#fff0d8" : "#fff2aa";
    c.lineWidth = 2;
    c.fillStyle =
      mark.owner === "roses"
        ? "#ec97b2"
        : mark.owner === "craft"
          ? "#67ccd4"
          : "#f1bf60";
    c.beginPath();
    c.moveTo(mark.point.x, y - 9);
    c.quadraticCurveTo(mark.point.x + 12, y, mark.point.x, y + 9);
    c.quadraticCurveTo(mark.point.x - 12, y, mark.point.x, y - 9);
    c.fill();
    c.stroke();
  }
  for (const pickup of POWERUPS) {
    if (state.power === pickup.id) continue;
    const p = pickup.point;
    const bob = reduced ? 0 : Math.sin(seconds * 2) * 2;
    ellipse(c, p.x, p.y + 1, 13, 5, "#24442e77");
    ellipse(c, p.x, p.y - 15 + bob, 15, 15, pickup.color);
    c.save();
    c.translate(p.x, p.y - 15 + bob);
    c.fillStyle = "#fff4cd";
    c.strokeStyle = "#385b50";
    c.lineWidth = 1.2;
    if (pickup.id === "spring") {
      for (const x of [-7, 2]) {
        c.beginPath();
        c.moveTo(x, -7);
        c.lineTo(x + 4, -7);
        c.lineTo(x + 4, 1);
        c.quadraticCurveTo(x + 10, 2, x + 7, 5);
        c.lineTo(x, 5);
        c.closePath();
        c.fill();
        c.stroke();
      }
    } else if (pickup.id === "dash") {
      c.beginPath();
      c.moveTo(-10, -5);
      c.quadraticCurveTo(-1, -10, 3, -3);
      c.lineTo(10, -6);
      c.lineTo(6, 1);
      c.lineTo(0, 1);
      c.lineTo(-4, 9);
      c.lineTo(-8, 4);
      c.lineTo(-4, -2);
      c.closePath();
      c.fill();
      c.stroke();
    } else {
      c.beginPath();
      c.moveTo(-11, -4);
      c.lineTo(11, -8);
      c.lineTo(3, 10);
      c.lineTo(-1, 1);
      c.closePath();
      c.fill();
      c.stroke();
      c.beginPath();
      c.moveTo(-1, 1);
      c.lineTo(11, -8);
      c.stroke();
    }
    c.restore();
    label(c, p.x, p.y - 42, pickup.label);
  }
  const craftMarksReady = COURSE_MARKS.filter((mark) => mark.owner === "craft").every(
    (mark) => state.marks.includes(mark.id),
  );
  if (craftMarksReady && !state.visited.includes("craft")) {
    const toy = PLACES.find((entry) => entry.id === "craft")!.point;
    const signaling = state.toySignalMs <= 0;
    ellipse(c, toy.x, toy.y + 3, 27, 8, "#25382666");
    c.fillStyle = "#9b7040";
    c.fillRect(toy.x - 16, toy.y - 31, 32, 31);
    c.fillStyle = signaling ? "#ffe186" : "#d3a85c";
    c.fillRect(toy.x - 12, toy.y - 27, 24, 18);
    c.strokeStyle = signaling ? "#fff1b8" : "#5d4a35";
    c.lineWidth = signaling ? 5 : 3;
    c.beginPath();
    c.moveTo(toy.x + 12, toy.y - 22);
    c.lineTo(toy.x + (signaling ? 33 : 23), toy.y - (signaling ? 43 : 28));
    c.stroke();
    ellipse(c, toy.x + 29, toy.y - 4, 7, 7, "#efe2bd");
    label(
      c,
      toy.x,
      toy.y - 57,
      signaling ? "DEFLECT NOW" : `COURTYARD TOY · ${state.toyPhase}/3`,
      signaling,
    );
  }
  const actors: { y: number; draw: () => void }[] = [];
  for (const p of PLACES) {
    if (
      p.id === "plaza" ||
      p.id === "home" ||
      (p.id === "lake" && state.companion)
    )
      continue;
    actors.push({
      y: p.point.y,
      draw: () => {
        person(
          c,
          p.point.x,
          p.point.y,
          p.color,
          0,
          { x: 0, y: 1 },
          false,
          false,
          p.id === "lake",
        );
        if (!state.visited.includes(p.id)) {
          ellipse(
            c,
            p.point.x,
            p.point.y - 48,
            6,
            6,
            canMeet(state, p.id) ? "#f4d280" : "#e7dfc5",
          );
          c.fillStyle = "#3c483b";
          c.font = "bold 10px system-ui";
          c.textAlign = "center";
          c.fillText(
            canMeet(state, p.id) ? "!" : "·",
            p.point.x,
            p.point.y - 45,
          );
        }
        if (p.id === "market" && !state.visited.includes("market")) {
          ellipse(c, p.point.x + 18, p.point.y - 2, 7, 5, "#bc8e5f");
          ellipse(c, p.point.x + 17, p.point.y - 7, 4, 3, "#a74935");
          ellipse(c, p.point.x + 21, p.point.y - 8, 4, 4, "#74823c");
        }
      },
    });
  }
  // A few neighbors follow fixed short paths. Their motion never drives the player.
  if (!low) {
    for (let i = 0; i < 5; i++) {
      const t = reduced ? i : seconds * (0.12 + i * 0.015) + i;
      const x = i < 3 ? 700 + i * 70 + Math.sin(t) * 26 : 480;
      const y = i < 3 ? 630 : 390 + (i - 3) * 390 + Math.sin(t) * 22;
      actors.push({
        y,
        draw: () =>
          person(
            c,
            x,
            y,
            ["#947764", "#637c70", "#c29457", "#705f83", "#485c6e"][i],
            t * 7,
            { x: Math.cos(t), y: 1 },
            !reduced,
          ),
      });
    }
  }
  if (state.companion) {
    actors.push({
      y: state.y - 8,
      draw: () =>
        person(
          c,
          state.x - 22,
          state.y - 8,
          "#a34c55",
          state.stride + 0.7,
          state.facing,
          state.walking,
          false,
          true,
        ),
    });
  }
  actors.push({
    y: state.y,
    draw: () => {
      ellipse(c, state.x, state.y + 1, 14 + state.z * 0.025, 6, "#253a2866");
      if (state.dashMs > 0 && !reduced) {
        for (let i = 1; i <= 3; i++) {
          c.globalAlpha = 0.2 / i;
          person(
            c,
            state.x - state.facing.x * i * 8,
            state.y - state.z - state.facing.y * i * 8,
            "#6bced4",
            state.stride,
            state.facing,
            false,
            true,
          );
        }
        c.globalAlpha = 1;
      }
      if (characters?.complete && characters.naturalWidth) {
        const row =
          Math.abs(state.facing.x) > Math.abs(state.facing.y)
            ? state.facing.x > 0
              ? 1
              : 2
            : state.facing.y < 0
              ? 3
              : 0;
        const col =
          state.z > 2
            ? 3
            : state.walking
              ? (Math.floor(state.stride / 2) % 2) + 1
              : 0;
        const [sx, sy, sw, sh] = characterFrames[row * 4 + col];
        const scale = 0.145;
        c.drawImage(
          characters,
          sx,
          sy,
          sw,
          sh,
          state.x - (sw * scale) / 2,
          state.y - state.z - sh * scale,
          sw * scale,
          sh * scale,
        );
      } else {
        person(
          c,
          state.x,
          state.y - state.z,
          state.power === "dash" ? "#367c85" : "#245b76",
          state.stride,
          state.facing,
          state.walking,
          true,
        );
      }
      if (state.power === "glide" && state.z > 5) {
        c.fillStyle = "#f1c6cf";
        c.beginPath();
        c.moveTo(state.x - 23, state.y - state.z - 30);
        c.lineTo(state.x, state.y - state.z - 48);
        c.lineTo(state.x + 23, state.y - state.z - 30);
        c.lineTo(state.x, state.y - state.z - 34);
        c.fill();
      }
      if (state.power === "spring") {
        ellipse(c, state.x - 4, state.y - state.z - 2, 4, 2, "#f8d769");
        ellipse(c, state.x + 4, state.y - state.z - 2, 4, 2, "#f8d769");
      }
    },
  });
  actors.sort((a, b) => a.y - b.y).forEach((a) => a.draw());
  for (const p of PLACES) {
    if (
      p.point.x < camera.x - 100 ||
      p.point.x > camera.x + camera.width + 100 ||
      p.point.y < camera.y ||
      p.point.y > camera.y + camera.height + 60
    )
      continue;
    const near = Math.hypot(state.x - p.point.x, state.y - p.point.y) < 70;
    if (p.id !== "plaza" && (near || !state.visited.includes(p.id)))
      label(
        c,
        p.point.x,
        p.point.y + 23,
        p.id === "home" ? "Sector 17 plaza" : p.district.split(" · ")[0],
        near,
      );
  }
  if (!reduced && !low) {
    for (let i = 0; i < 10; i++) {
      const x = (i * 149 + seconds * 7) % WORLD_WIDTH,
        y = (i * 103 + Math.sin(seconds * 0.4 + i) * 13) % WORLD_HEIGHT;
      c.save();
      c.translate(x, y);
      c.rotate(seconds * 0.3 + i);
      ellipse(c, 0, 0, 2.7, 1, "#f4cf6c9c");
      c.restore();
    }
  }
  c.setTransform(1, 0, 0, 1, 0, 0);
}
