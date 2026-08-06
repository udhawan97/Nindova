import assert from "node:assert/strict";
import { resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "../..");
const Studies = await import(resolve(root, "apps/house/dist/classic-studies.js"));

test("Navakankari studies use the 24-point board and one unique mill-closing option", () => {
  assert.equal(Studies.NAVAKANKARI_POINTS.length, 24);
  assert.equal(Studies.NAVAKANKARI_MILLS.length, 16);
  for (const chapter of Studies.getClassicStudy("navakankari").chapters) {
    const outcomes = chapter.options.map((point) => Studies.formsNavakankariMill(chapter.own, point));
    assert.equal(outcomes.filter(Boolean).length, 1, chapter.title);
    assert.equal(outcomes[chapter.answerIndex], true, chapter.title);
  }
});

test("Aadu Puli Aattam studies use the exact 23-point graph and one legal destination", () => {
  assert.equal(Studies.AADU_POINTS.length, 23);
  assert.equal(Studies.AADU_LINES.length, 10);
  for (const chapter of Studies.getClassicStudy("aadu-puli-attam").chapters) {
    const outcomes = chapter.options.map((point) => Studies.isLegalAaduMove(chapter, chapter.role, chapter.source, point));
    assert.equal(outcomes.filter(Boolean).length, 1, chapter.title);
    assert.equal(outcomes[chapter.answerIndex], true, chapter.title);
  }
});

test("Pallanguzhi follows fixed anti-clockwise relay, capture, continuation, and two-empty termination", () => {
  assert.deepEqual(Studies.PALLANGUZHI_TRAVERSAL, [0, 1, 2, 3, 4, 5, 6, 13, 12, 11, 10, 9, 8, 7]);
  const chapters = Studies.getClassicStudy("pallanguzhi").chapters;
  assert.equal(chapters.length, 5);
  const authoredPredicates = [
    (turn) => turn.deposits === 2,
    (turn) => Studies.PALLANGUZHI_TRAVERSAL.indexOf(turn.finalPit) >= 7,
    (turn) => turn.relays > 0,
    (turn) => turn.captured === 4,
    (turn) => turn.continuations > 0,
  ];
  chapters.forEach((chapter, chapterIndex) => {
    const outcomes = chapter.options.map((pit) => Studies.playPallanguzhiStudyTurn(chapter.board, pit)).map(authoredPredicates[chapterIndex]);
    assert.equal(outcomes.filter(Boolean).length, 1, chapter.title);
    assert.equal(outcomes[chapter.answerIndex], true, chapter.title);
  });
  const relay = Studies.playPallanguzhiStudyTurn(chapters[2].board, chapters[2].options[chapters[2].answerIndex]);
  assert.ok(relay.relays >= 1);
  const exactFour = Studies.playPallanguzhiStudyTurn(chapters[3].board, chapters[3].options[chapters[3].answerIndex]);
  assert.equal(exactFour.captured, 4);
  const beyondEmpty = Studies.playPallanguzhiStudyTurn(chapters[4].board, chapters[4].options[chapters[4].answerIndex]);
  assert.equal(beyondEmpty.captured, 5);
  assert.equal(beyondEmpty.continuations, 1, "play continues from the next occupied pit after capture");
  const twoEmptyStop = Studies.playPallanguzhiStudyTurn([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], 0);
  assert.equal(twoEmptyStop.continuations, 0);
  assert.equal(twoEmptyStop.deposits, 1, "two empty pits after the final deposit end the turn");
  assert.throws(() => Studies.playPallanguzhiStudyTurn(Array(14).fill(0), 0), /non-empty lower-row pit/);
});

test("every classic position has a complete nonvisual state and option description", () => {
  const navakankari = Studies.getClassicStudy("navakankari").chapters[0];
  assert.match(Studies.describeNavakankariChapter(navakankari), /Your brass pieces are at point 1, point 2/);
  assert.match(Studies.describeNavakankariOption(navakankari, 0), /Choice A, point 3.*containing 2 of your existing pieces/);

  const aadu = Studies.getClassicStudy("aadu-puli-attam").chapters[0];
  assert.match(Studies.describeAaduChapter(aadu), /selected tiger is at point 1.*Goats occupy point 4, point 2, point 7/);
  assert.match(Studies.describeAaduOption(aadu, 0), /Choice A, point 10.*a goat at point 4 between/);

  const pallanguzhi = Studies.getClassicStudy("pallanguzhi").chapters[0];
  assert.match(Studies.describePallanguzhiChapter(pallanguzhi), /Lower row left to right: pit 1: 2.*Top row left to right: pit 14: 0.*Choice A.*Choice B/);
  assert.match(Studies.describePallanguzhiOption(pallanguzhi, 0), /2 deposits.*ends its final deposit at pit 3/);
});

test("classic studies vary the authored answer position instead of teaching one repeated button", () => {
  for (const study of Studies.CLASSIC_STUDIES) {
    assert.ok(new Set(study.chapters.map((chapter) => chapter.answerIndex)).size >= 2, `${study.id} varies its answer position`);
  }
});
