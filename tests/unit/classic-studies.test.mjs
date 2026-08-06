import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const Studies = await import(resolve(root, "apps/house/dist/classic-studies.js"));

test("classic studies expose five immutable semantic chapters with one accepted choice", () => {
  assert.deepEqual(Studies.CLASSIC_STUDY_IDS, ["navakankari", "aadu-puli-attam", "pallanguzhi"]);
  for (const studyId of Studies.CLASSIC_STUDY_IDS) {
    const study = Studies.getClassicStudy(studyId);
    assert.equal(study.chapters.length, 5);
    assert.equal(Object.isFrozen(study), true);
    assert.equal(Object.isFrozen(study.chapters), true);
    for (const [chapterIndex, chapter] of study.chapters.entries()) {
      assert.equal(Object.isFrozen(chapter), true);
      assert.equal(Object.isFrozen(chapter.board), true);
      assert.equal(Object.isFrozen(chapter.options), true);
      assert.equal(chapter.options.filter((option) => Studies.evaluateClassicChoice(studyId, chapterIndex, option.index)).length, 1, chapter.title);
      assert.ok(chapter.description.length > 80, `${chapter.title} has a complete nonvisual description`);
      assert.ok(chapter.options.every((option) => option.description.startsWith(`Choice ${option.label}`)));
    }
    const acceptedPositions = study.chapters.map((chapter, chapterIndex) => chapter.options.findIndex((option) => Studies.evaluateClassicChoice(studyId, chapterIndex, option.index)));
    assert.ok(new Set(acceptedPositions).size >= 2, `${study.id} varies its answer position`);
  }
});

test("render-ready board models preserve the documented 24-point, 23-point, and 14-pit geometry", () => {
  const navakankari = Studies.getClassicStudy("navakankari").chapters[0];
  assert.equal(navakankari.board.kind, "navakankari");
  assert.equal(navakankari.board.points.length, 24);
  assert.equal(navakankari.board.lines.length, 16);
  assert.match(navakankari.description, /Your brass pieces are at point 1, point 2/);
  assert.match(navakankari.options[0].description, /Choice A, point 3.*containing 2 of your existing pieces/);

  const aadu = Studies.getClassicStudy("aadu-puli-attam").chapters[0];
  assert.equal(aadu.board.kind, "aadu-puli-attam");
  assert.equal(aadu.board.points.length, 23);
  assert.equal(aadu.board.lines.length, 10);
  assert.match(aadu.description, /selected tiger is at point 1.*Goats occupy point 4, point 2, point 7/);
  assert.match(aadu.options[0].description, /Choice A, point 10.*a goat at point 4 between/);

  const pallanguzhi = Studies.getClassicStudy("pallanguzhi").chapters;
  assert.equal(pallanguzhi[0].board.kind, "pallanguzhi");
  assert.equal(pallanguzhi[0].board.pits.length, 14);
  assert.deepEqual(pallanguzhi[0].board.traversal, [0, 1, 2, 3, 4, 5, 6, 13, 12, 11, 10, 9, 8, 7]);
  assert.match(pallanguzhi[0].description, /Lower row left to right: pit 1: 2.*Top row left to right: pit 14: 0.*Choice A.*Choice B/);
  assert.match(pallanguzhi[0].options[0].description, /2 deposits.*ends its final deposit at pit 3/);
  assert.match(pallanguzhi[2].options.find((option) => Studies.evaluateClassicChoice("pallanguzhi", 2, option.index)).description, /[1-9]\d* relays/);
  assert.match(pallanguzhi[3].options.find((option) => Studies.evaluateClassicChoice("pallanguzhi", 3, option.index)).description, /captures 4 seeds/);
  assert.match(pallanguzhi[4].options.find((option) => Studies.evaluateClassicChoice("pallanguzhi", 4, option.index)).description, /1 post-capture continuations.*captures 5 seeds/);
});

test("classic evaluation rejects missing chapters and choices without exposing answer data", () => {
  assert.equal(Studies.evaluateClassicChoice("navakankari", 99, 0), false);
  assert.equal(Studies.evaluateClassicChoice("navakankari", 0, -1), false);
  assert.equal(Studies.evaluateClassicChoice("navakankari", 0, 99), false);
  assert.equal("answerIndex" in Studies.getClassicStudy("navakankari").chapters[0], false);
});
