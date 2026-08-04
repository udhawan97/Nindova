# Add a fail-closed assessment-readiness contract

The adult Nindova House now includes a source-only assessment-readiness contract. It does not add an assessment route, score, result, data collector, or runtime dependency. The production House continues to store only narrow `mode: "entertainment"` completion provenance.

`apps/house/src/assessment-readiness.ts` inventories the evidence required before a future measurement claim could be considered: a versioned construct, adult task-content review, preregistered scoring, representative adult norming, reliability, construct and criterion validity, fairness and measurement invariance, uncertainty and interpretation guidance, informed consent, independent ethics review, data governance and retention, and a locked versioned scoring implementation.

The contract fails closed in three ways:

1. A gate counts only when it has current-protocol evidence, a stable evidence identifier, a reviewer record, and a parseable review time.
2. Entertainment results are always rejected as assessment inputs.
3. Even a mechanically complete evidence inventory cannot authorize research collection or public assessment output. Those require a future explicit product decision after the real evidence exists.

No raw answer, error, move, timing, or demographic schema is introduced. No data collection is authorized. No IQ estimate, intelligence result, percentile, diagnosis, or cognitive-trait inference is implemented. This decision extends [ADR 0013](./0013-add-the-adult-nindova-house.md); it does not weaken the House/Night boundary or the Night Two-Loop Law.
