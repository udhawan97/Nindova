import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const css = await readFile(resolve(root, "tokens.css"), "utf8");
const session = await readFile(resolve(root, "apps/session/index.html"), "utf8");

function token(name) {
  const match = css.match(new RegExp(`--${name}:\\s*oklch\\(([^)]+)\\)`));
  assert.ok(match, `Missing OKLCH token --${name}`);
  const parts = match[1].trim().split(/\s+/);
  return {
    lightness: Number(parts[0].replace("%", "")) / 100,
    chroma: Number(parts[1]),
    hue: (Number(parts[2]) * Math.PI) / 180,
  };
}

function luminance({ lightness, chroma, hue }) {
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const lRoot = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mRoot = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sRoot = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lRoot ** 3;
  const m = mRoot ** 3;
  const s = sRoot ** 3;
  const red = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const green = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const blue = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return (
    0.2126 * Math.min(1, Math.max(0, red)) +
    0.7152 * Math.min(1, Math.max(0, green)) +
    0.0722 * Math.min(1, Math.max(0, blue))
  );
}

function ratio(foreground, background) {
  const lighter = Math.max(luminance(token(foreground)), luminance(token(background)));
  const darker = Math.min(luminance(token(foreground)), luminance(token(background)));
  return (lighter + 0.05) / (darker + 0.05);
}

const bodyPairs = [
  ["color-ink", "color-paper"],
  ["color-ink", "color-paper-2"],
  ["color-ink", "color-paper-3"],
  ["color-ink-soft", "color-paper"],
  ["color-ink-soft", "color-paper-2"],
  ["color-ink-soft", "color-paper-3"],
  ["color-muted", "color-paper"],
  ["color-muted", "color-paper-2"],
  ["color-muted", "color-paper-3"],
  ["color-neutral", "color-paper"],
  ["color-accent", "color-paper"],
  ["color-accent-ink", "color-accent"],
  ["color-paper", "color-ink"],
  ["color-paper-3", "color-ink"],
];

for (const [foreground, background] of bodyPairs) {
  test(`${foreground} clears 4.5:1 on ${background}`, () => {
    assert.ok(
      ratio(foreground, background) >= 4.5,
      `${foreground} on ${background} is ${ratio(foreground, background).toFixed(2)}:1`,
    );
  });
}

test("the focus token clears 3:1 on the page", () => {
  assert.ok(ratio("color-focus", "color-paper") >= 3);
});

function rgb(hex) {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16));
}

function relativeLuminance(channels) {
  const linear = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= .04045 ? normalized / 12.92 : ((normalized + .055) / 1.055) ** 2.4;
  });
  return .2126 * linear[0] + .7152 * linear[1] + .0722 * linear[2];
}

function rgbRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + .05) / (dark + .05);
}

const motifRules = [...session.matchAll(/\.tile\[data-motif="([^"]+)"\]\s*\{([^}]+)\}/g)];
assert.equal(motifRules.length, 9, "all nine motif palettes should be present");
for (const [, motif, declarations] of motifRules) {
  assert.match(declarations, /--motif:\s*var\(--color-[a-z-]+\)/, `${motif} should define a tokenized motif ink`);
}

function sessionToken(name) {
  const match = session.match(new RegExp(`--${name}:\\s*oklch\\(([^)]+)\\)`));
  assert.ok(match, `Missing Session OKLCH token --${name}`);
  const parts = match[1].trim().split(/\s+/);
  return {
    lightness: Number(parts[0].replace("%", "")) / 100,
    chroma: Number(parts[1]),
    hue: (Number(parts[2]) * Math.PI) / 180,
  };
}

function sessionRatio(foreground, background) {
  const light = Math.max(luminance(sessionToken(foreground)), luminance(sessionToken(background)));
  const dark = Math.min(luminance(sessionToken(foreground)), luminance(sessionToken(background)));
  return (light + .05) / (dark + .05);
}

test("the neutral ivory tile label clears 4.5:1", () => {
  const label = luminance(sessionToken("color-ink"));
  const face = luminance(sessionToken("color-tile"));
  const contrast = (Math.max(label, face) + .05) / (Math.min(label, face) + .05);
  assert.ok(contrast >= 4.5, `tile label contrast is ${contrast.toFixed(2)}:1`);
});

test("the Dawn light theme keeps text and focus contrast", () => {
  for (const [foreground, background] of [
    ["color-dawn-ink", "color-dawn-paper-soft"],
    ["color-dawn-ink-soft", "color-dawn-paper-soft"],
    ["color-dawn-brass", "color-dawn-paper-soft"],
  ]) {
    const contrast = sessionRatio(foreground, background);
    assert.ok(contrast >= 4.5, `${foreground} on ${background} is ${contrast.toFixed(2)}:1`);
  }
  assert.ok(sessionRatio("color-dawn-ink", "color-dawn-paper") >= 3);
});

test("the royal-night feedback copy clears 4.5:1", () => {
  const background = rgb("#150d20");
  const cream = rgb("#efe1c4");
  const alpha = .76;
  const composited = cream.map((channel, index) => channel * alpha + background[index] * (1 - alpha));
  assert.ok(rgbRatio(composited, background) >= 4.5);
});
