import { assertCase } from './validate.js';

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function changes(before, after) {
  const left = new Map(before.map((item) => [item.id, item]));
  const right = new Map(after.map((item) => [item.id, item]));
  return {
    added: [...right.keys()].filter((id) => !left.has(id)).sort(),
    removed: [...left.keys()].filter((id) => !right.has(id)).sort(),
    changed: [...right.keys()].filter((id) => left.has(id) && canonical(left.get(id)) !== canonical(right.get(id))).sort()
  };
}

export function compareCases(before, after) {
  const left = assertCase(before);
  const right = assertCase(after);
  if (left.id !== right.id) throw new Error('Cannot compare different case IDs');
  if (left.schemaVersion !== right.schemaVersion) throw new Error('Cannot compare different schema versions');
  return {
    caseId: left.id,
    from: left.provenance.updatedAt,
    to: right.provenance.updatedAt,
    sources: changes(left.sources, right.sources),
    claims: changes(left.claims, right.claims),
    hypotheses: changes(left.challenge.hypotheses, right.challenge.hypotheses),
    exposures: changes(left.exposures, right.exposures),
    eventChanged: canonical(left.event) !== canonical(right.event),
    challengeQuestionsChanged: canonical(left.challenge.unresolvedQuestions) !== canonical(right.challenge.unresolvedQuestions),
    assessmentChanged: canonical(left.assessment) !== canonical(right.assessment),
    detectionReceiptChanged: canonical(left.provenance.detectionReceipt) !== canonical(right.provenance.detectionReceipt),
    statusChanged: left.status !== right.status
  };
}
