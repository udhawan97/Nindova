export const ASSESSMENT_PROTOCOL_VERSION = "assessment-readiness-1" as const;

export const ASSESSMENT_AUTHORIZATION = Object.freeze({
  dataCollectionAllowed: false,
  publicAssessmentOutputAllowed: false,
  authorizedBy: "ADR-0014-no-data-collection",
} as const);

export const VALIDATION_GATES = Object.freeze([
  "versioned-construct-definition",
  "adult-task-content-review",
  "preregistered-scoring-plan",
  "representative-adult-norming",
  "reliability",
  "construct-validity",
  "criterion-validity",
  "fairness-and-measurement-invariance",
  "uncertainty-and-interpretation",
  "informed-consent",
  "independent-ethics-review",
  "data-governance-and-retention",
  "locked-versioned-scoring",
] as const);

export type ValidationGate = typeof VALIDATION_GATES[number];
export type EvidenceStatus = "missing" | "planned" | "verified";

export type ValidationEvidence = {
  gate: ValidationGate;
  protocolVersion: typeof ASSESSMENT_PROTOCOL_VERSION;
  status: EvidenceStatus;
  evidenceId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
};

export type ValidationEvidenceSet = Partial<Record<ValidationGate, ValidationEvidence>>;

export type AssessmentReadiness = {
  protocolVersion: typeof ASSESSMENT_PROTOCOL_VERSION;
  status: "blocked" | "evidence-inventory-complete";
  verifiedGates: readonly ValidationGate[];
  unmetGates: readonly ValidationGate[];
  dataCollectionAllowed: false;
  publicAssessmentOutputAllowed: false;
};

function hasText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isReviewedEvidence(gate: ValidationGate, evidence: ValidationEvidence | undefined): boolean {
  if (!evidence || evidence.gate !== gate || evidence.protocolVersion !== ASSESSMENT_PROTOCOL_VERSION) return false;
  if (evidence.status !== "verified" || !hasText(evidence.evidenceId) || !hasText(evidence.reviewedBy)) return false;
  return hasText(evidence.reviewedAt) && Number.isFinite(Date.parse(evidence.reviewedAt));
}

export function evaluateAssessmentReadiness(evidence: ValidationEvidenceSet): AssessmentReadiness {
  const verifiedGates = Object.freeze(VALIDATION_GATES.filter((gate) => isReviewedEvidence(gate, evidence[gate])));
  const unmetGates = Object.freeze(VALIDATION_GATES.filter((gate) => !verifiedGates.includes(gate)));
  return Object.freeze({
    protocolVersion: ASSESSMENT_PROTOCOL_VERSION,
    status: unmetGates.length === 0 ? "evidence-inventory-complete" : "blocked",
    verifiedGates,
    unmetGates,
    dataCollectionAllowed: ASSESSMENT_AUTHORIZATION.dataCollectionAllowed,
    publicAssessmentOutputAllowed: ASSESSMENT_AUTHORIZATION.publicAssessmentOutputAllowed,
  });
}

export type AssessmentInputDecision = {
  allowed: false;
  reason: "entertainment-results-are-not-assessment-input" | "research-data-collection-is-not-authorized";
};

export function assessInputEligibility(candidate: { mode?: unknown }): AssessmentInputDecision {
  if (candidate.mode === "entertainment") {
    return Object.freeze({ allowed: false, reason: "entertainment-results-are-not-assessment-input" });
  }
  return Object.freeze({ allowed: false, reason: "research-data-collection-is-not-authorized" });
}
