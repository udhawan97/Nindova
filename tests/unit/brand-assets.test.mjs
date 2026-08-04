import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { PNG } from "pngjs";

const root = resolve(import.meta.dirname, "../..");
const motifNames = [
  "belan", "chakla", "tawa", "chimta", "katori", "tiffin", "masala-dabba", "chai", "pressure-cooker",
];

for (const name of motifNames) {
  test(`${name} silhouette is a local 48px currentColor asset`, async () => {
    const source = await readFile(resolve(root, "apps/session/assets/motifs", `${name}.svg`), "utf8");
    assert.match(source, /viewBox="0 0 48 48"/);
    assert.match(source, /currentColor/);
    assert.doesNotMatch(source, /<script/i);
    assert.doesNotMatch(source, /(?:href|xlink:href)=["'](?:https?:|data:)/i);
  });
}

test("the primary mark preserves nine paired-lattice diamonds", async () => {
  const source = await readFile(resolve(root, "apps/site/public/brand/nindova-mark.svg"), "utf8");
  assert.equal((source.match(/<path\b/g) ?? []).length, 9);
  for (const color of ["#9A3A42", "#3A4A9E", "#C4638A", "#EFE1C4"]) {
    assert.equal(source.split(color).length - 1, 2, `${color} should appear as one pair`);
  }
  assert.equal(source.split("#E0A64B").length - 1, 1, "Kesari should close the center");
});

test("the social card is the publication-sized regenerated artifact", async () => {
  const image = PNG.sync.read(await readFile(resolve(root, "apps/site/public/brand/nindova-og.png")));
  assert.deepEqual([image.width, image.height], [1200, 630]);
  const generator = await readFile(resolve(root, "scripts/capture-brand-social.mjs"), "utf8");
  assert.match(generator, /one Session, then goodnight/);
  assert.doesNotMatch(generator, /one round/i);
});
