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

test("the animated lockup follows the supplied paired stitch loop and respects reduced motion", async () => {
  const sources = await Promise.all([
    "nindova-logo-horizontal-animated.svg",
    "nindova-logo-horizontal-animated-light.svg",
  ].map((file) => readFile(resolve(root, "apps/site/public/brand", file), "utf8")));
  const landing = await readFile(resolve(root, "apps/site/src/pages/index.astro"), "utf8");
  const readme = await readFile(resolve(root, "README.md"), "utf8");
  for (const source of sources) {
    assert.equal((source.match(/class="diamond pair-(?:one|two|three|four)"/g) ?? []).length, 8);
    assert.equal((source.match(/class="diamond center"/g) ?? []).length, 1);
    assert.match(source, /animation:\s*stitch 7s steps\(1, end\) infinite/);
    assert.match(source, /\.pair-two \{ animation-delay: \.35s; \}/);
    assert.match(source, /\.pair-three \{ animation-delay: \.7s; \}/);
    assert.match(source, /\.pair-four \{ animation-delay: 1\.05s; \}/);
    assert.match(source, /\.center \{ animation-delay: 1\.6s; \}/);
    assert.match(source, /@media \(prefers-reduced-motion: reduce\)/);
    assert.match(source, /\.diamond \{ animation: none; opacity: 1; \}/);
    assert.doesNotMatch(source, /<script/i);
  }
  assert.equal(sources[0].split("#EFE1C4").length - 1, 3, "dark lockup should keep the cream pair and wordmark");
  assert.equal(sources[1].split("#150D20").length - 1, 2, "light lockup should swap the cream pair to night ink");
  assert.equal(sources[1].split("#211A33").length - 1, 1, "light lockup should use a dark wordmark");
  assert.match(landing, /source media="\(prefers-reduced-motion: reduce\)" srcset=\{href\("\/brand\/nindova-logo-horizontal\.svg"\)\}/);
  assert.match(readme, /nindova-logo-horizontal-animated-light\.svg/);
  assert.match(readme, /nindova-logo-horizontal-animated\.svg/);
});

test("the social card is the publication-sized regenerated artifact", async () => {
  const image = PNG.sync.read(await readFile(resolve(root, "apps/site/public/brand/nindova-og.png")));
  assert.deepEqual([image.width, image.height], [1200, 630]);
  const generator = await readFile(resolve(root, "scripts/capture-brand-social.mjs"), "utf8");
  assert.match(generator, /A house of authored games/);
  assert.match(generator, /Choose a room/);
  assert.doesNotMatch(generator, /bedtime game|one round/i);
});

test("single-file download instructions isolate the matching checksum row", async () => {
  const documents = await Promise.all([
    readFile(resolve(root, "README.md"), "utf8"),
    readFile(resolve(root, "apps/site/src/content/docs/docs/downloads.md"), "utf8"),
  ]);

  for (const document of documents) {
    assert.match(document, /grep ' nindova-v0\.4\.0\.html\$' SHA256SUMS\.txt \| shasum -a 256 -c -/);
    assert.match(document, /grep ' nindova-web-v0\.4\.0\.zip\$' SHA256SUMS\.txt \| shasum -a 256 -c -/);
  }
});
