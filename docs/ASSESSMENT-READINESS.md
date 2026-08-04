# Assessment readiness

**Current status: fail-closed infrastructure, not a validated assessment.**

Nindova House has an assessment-readiness contract so a future research effort cannot quietly turn entertainment play into a population claim. The current production games remain authored entertainment for adults 18 and over. There is no assessment UI, IQ score, percentile, diagnosis, inferred cognitive trait, research collection, or telemetry.

## What is implemented

- One versioned, source-only readiness protocol.
- An explicit list of scientific, ethical, fairness, consent, and governance gates.
- Strict evidence metadata checks; a planned or unsupported assertion does not satisfy a gate.
- A permanent rejection of `mode: "entertainment"` results as assessment observations.
- Hard-disabled research collection and public assessment output.
- Unit tests proving each fail-closed boundary.

The module is not imported by the House runtime. It creates no route, control, storage key, service-worker behavior, request, or user-facing result.

## Required evidence gates

| Gate | What must exist before it can be verified |
|---|---|
| Versioned construct definition | A precise statement of what is and is not being measured. |
| Adult task-content review | Expert review that tasks fit the intended adult population and construct. |
| Preregistered scoring plan | Locked hypotheses, exclusions, transformations, and analyses before validation. |
| Representative adult norming | An adequately powered sample representing the intended 18+ population and relevant subgroups. |
| Reliability | Appropriate internal, test-retest, and/or alternate-form evidence with uncertainty. |
| Construct validity | Convergent, discriminant, and structural evidence for the named construct. |
| Criterion validity | Evidence against relevant external criteria without circular task reuse. |
| Fairness and measurement invariance | Subgroup error, accessibility, language/culture, device, and invariance analyses. |
| Uncertainty and interpretation | Confidence or credible intervals, limits, misuse warnings, and individual-level interpretation rules. |
| Informed consent | Understandable, voluntary consent specific to research data and intended use. |
| Independent ethics review | Approval from an appropriate independent research-ethics body. |
| Data governance and retention | Collection authority, minimization, access control, deletion, retention, incident, and withdrawal rules. |
| Locked versioned scoring | A reviewed implementation tied to the validated tasks, population, and evidence package. |

## Sequencing

1. Keep entertainment and research modes separate in routes, provenance, storage, copy, and releases.
2. Obtain explicit governance and ethics authorization before collecting any research observation.
3. Run a preregistered adult calibration study outside the production entertainment ledger.
4. Publish reliability, validity, fairness, and uncertainty evidence with limitations.
5. Lock the task and scoring versions, then conduct an independent release review.
6. Only a later ADR may decide whether any public assessment output is justified.

Completing code or checking every field in a test fixture is not scientific validation. The evidence has to exist in the real world and survive independent review.
