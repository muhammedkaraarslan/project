# Case format

`schema/case.v1.schema.json` is the machine-readable structural contract. `src/validate.js` adds cross-reference and provenance checks that JSON Schema alone cannot express conveniently. Both are versioned with the repo.

## Evidence chain

1. `event` names the development, place and time. It is not a claim of market impact.
2. `sources[]` records publisher, absolute HTTPS URL, retrieval timestamp and an optional `independenceGroup`. Two mirrors of one publisher should share the same group.
3. `claims[]` states a specific assertion. Each evidence reference names a listed `sourceId`, a human-locatable passage or section, and whether it supports or contradicts the claim. `corroborated` requires supporting references from at least two distinct source groups; it is not a synonym for confidence.
4. `challenge.hypotheses[]` gives testable explanations. `claimIds` bind each hypothesis to underlying claims. `alternativeTo` can link competing hypotheses. Every hypothesis has at least one observable falsifier, while `unresolvedQuestions` keeps known gaps visible.
5. `exposures[]` connects one claim to a named route, company, commodity, market or sector. `channel` explains the transmission mechanism; `conditionalImpact` describes what follows *if* the condition holds. `watchFor` lists observations that could confirm or weaken the link.
6. `assessment` is a dated synthesis. It should distinguish what happened from why it could matter and what to check next.

IDs are lowercase, stable within their collection and suitable for revision comparison. Source, claim, hypothesis and exposure IDs must be unique in their respective arrays. A changed interpretation should update the existing case revision when it is still the same event, preserving stable IDs for unchanged elements.

## Provenance classes

`historical_reference` is for retrospective examples or studies. It cannot carry a `detectionReceipt`. `vigil_detection` is reserved for an actual Vigil run and requires a receipt with a `runId`, `recordedAt` and a public HTTPS `url`. A receipt field is not a substitute for source-bound claims; both are required. Do not construct a detection case from a later news article alone.

## Versioning

`schemaVersion: "1.0.0"` is fixed for this release. Additive optional fields can be introduced with a minor schema version. Removing fields, changing their meaning, or changing existing enum values requires a major version and a migration note. Package releases may advance independently of the case schema.

The CLI validates schema shape and referential integrity. It does **not** decide whether a cited passage is accurate, a publisher is truly independent, a hypothesis is plausible, or an exposure is material. Those are editorial and research judgments.
