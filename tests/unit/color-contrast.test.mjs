import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const css = await readFile(resolve(root, "tokens.css"), "utf8");

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
