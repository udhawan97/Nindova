import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import ts from "typescript";

const root = resolve(import.meta.dirname, "../..");
const assessmentSource = await readFile(resolve(root, "apps/house/src/assessment-readiness.ts"), "utf8");
const emitted = ts.transpileModule(assessmentSource, {
  fileName: "assessment-readiness.ts",
  reportDiagnostics: true,
  compilerOptions: { target: ts.ScriptTarget.ES2024, module: ts.ModuleKind.ES2022 },
});
assert.deepEqual(emitted.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) ?? [], []);
const Assessment = await import(`data:text/javascript;base64,${Buffer.from(emitted.outputText).toString("base64")}`);

function verifiedEvidence(gate) {
  return {
    gate,
    protocolVersion: Assessment.ASSESSMENT_PROTOCOL_VERSION,
    status: "verified",
    evidenceId: `evidence:${gate}`,
    reviewedBy: "independent-review-record",
    reviewedAt: "2026-08-04T12:00:00.000Z",
  };
}

test("assessment readiness fails closed with every scientific gate visible", () => {
  const result = Assessment.evaluateAssessmentReadiness({});
  assert.equal(Object.isFrozen(Assessment.VALIDATION_GATES), true);
  assert.equal(Object.isFrozen(result.unmetGates), true);
  assert.equal(result.status, "blocked");
  assert.deepEqual(result.unmetGates, Assessment.VALIDATION_GATES);
  assert.equal(result.dataCollectionAllowed, false);
  assert.equal(result.publicAssessmentOutputAllowed, false);
  for (const gate of [
    "representative-adult-norming",
    "reliability",
    "construct-validity",
    "criterion-validity",
    "fairness-and-measurement-invariance",
    "uncertainty-and-interpretation",
    "informed-consent",
    "independent-ethics-review",
    "data-governance-and-retention",
  ]) assert.ok(result.unmetGates.includes(gate));
});

test("planned or unreviewed claims do not satisfy a gate", () => {
  const gate = "versioned-construct-definition";
  const planned = Assessment.evaluateAssessmentReadiness({
    [gate]: { gate, protocolVersion: Assessment.ASSESSMENT_PROTOCOL_VERSION, status: "planned" },
  });
  assert.ok(planned.unmetGates.includes(gate));

  const assertedWithoutEvidence = Assessment.evaluateAssessmentReadiness({
    [gate]: { gate, protocolVersion: Assessment.ASSESSMENT_PROTOCOL_VERSION, status: "verified" },
  });
  assert.ok(assertedWithoutEvidence.unmetGates.includes(gate));
});

test("a complete evidence inventory still cannot authorize collection or public output", () => {
  const evidence = Object.fromEntries(Assessment.VALIDATION_GATES.map((gate) => [gate, verifiedEvidence(gate)]));
  const result = Assessment.evaluateAssessmentReadiness(evidence);
  assert.equal(result.status, "evidence-inventory-complete");
  assert.deepEqual(result.unmetGates, []);
  assert.deepEqual(result.verifiedGates, Assessment.VALIDATION_GATES);
  assert.equal(result.dataCollectionAllowed, false);
  assert.equal(result.publicAssessmentOutputAllowed, false);
});

test("entertainment results are never accepted as assessment observations", () => {
  assert.deepEqual(Assessment.assessInputEligibility({ mode: "entertainment" }), {
    allowed: false,
    reason: "entertainment-results-are-not-assessment-input",
  });
  assert.deepEqual(Assessment.assessInputEligibility({ mode: "research" }), {
    allowed: false,
    reason: "research-data-collection-is-not-authorized",
  });
});
