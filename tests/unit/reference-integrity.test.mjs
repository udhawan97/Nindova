import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const expected = new Map([
  ["codex-kickoff.md", "9c3ddbd9b5e6d788a44c731443436d9260d8c32a908d41d5c013870e546ce758"],
  ["nindova-master-brief.md", "ff24d91a8f1948c0554e6f091ea8559e1b2296fcb26c593fe62ca5255e077b6c"],
  ["nindova-demo.html", "140c0e128be8e89dcd203c503ddc619c77cc0f732954631836b09f573f7791bf"],
  ["test-demo.mjs", "336938b426b4dc3ddb1f270213753b94353baa61bc024c9dccfe61a910e60ed1"],
]);

for (const [name, digest] of expected) {
  test(`reference/${name} matches the supplied artifact`, async () => {
    const bytes = await readFile(resolve(root, "reference", name));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), digest);
  });
}

test("the redesigned Session preserves seed provenance through its superseding ADR", async () => {
  const [seed, session, runtime, decision] = await Promise.all([
    readFile(resolve(root, "reference/nindova-demo.html")),
    readFile(resolve(root, "apps/session/index.html")),
    readFile(resolve(root, "apps/session/src/session.ts"), "utf8"),
    readFile(resolve(root, "docs/adr/0010-replace-the-vista-arc-with-rasoi-pairs.md"), "utf8"),
  ]);
  assert.notDeepEqual(session, seed);
  assert.match(decision, /supersedes the experience-specific parts/);
  assert.match(session.toString("utf8"), /<script type="module" src="\.\/src\/session\.ts"><\/script>/);
  assert.match(runtime, /window\.__ct\s*=\s*window\.__rasoi/);
});
