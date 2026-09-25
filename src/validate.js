const ID = /^[a-z0-9][a-z0-9._-]*$/;
const TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const own = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

export function validateCase(input) {
  const errors = [];
  const issue = (path, message) => errors.push({ path, message });

  function object(value, path, required, optional = []) {
    if (!isObject(value)) {
      issue(path, 'must be an object');
      return false;
    }
    for (const key of required) if (!own(value, key)) issue(`${path}.${key}`, 'is required');
    for (const key of Object.keys(value)) {
      if (![...required, ...optional].includes(key)) issue(`${path}.${key}`, 'is not allowed');
    }
    return true;
  }

  function text(value, path) {
    if (typeof value !== 'string' || value.trim().length === 0) issue(path, 'must be non-empty text');
  }

  function id(value, path) {
    if (typeof value !== 'string' || value.length > 100 || !ID.test(value)) {
      issue(path, 'must be a lowercase ID using letters, digits, ., _ or -');
    }
  }

  function time(value, path) {
    if (typeof value !== 'string' || !TIME.test(value) || !Number.isFinite(Date.parse(value))) {
      issue(path, 'must be an ISO 8601 date-time with timezone');
    }
  }

  function url(value, path) {
    try {
      if (typeof value !== 'string' || new URL(value).protocol !== 'https:') throw new Error();
    } catch {
      issue(path, 'must be an absolute HTTPS URL');
    }
  }

  function choice(value, path, choices) {
    if (!choices.includes(value)) issue(path, `must be one of: ${choices.join(', ')}`);
  }

  function array(value, path, visit) {
    if (!Array.isArray(value) || value.length === 0) {
      issue(path, 'must be a non-empty array');
      return;
    }
    value.forEach((item, index) => visit(item, `${path}[${index}]`));
  }

  function uniqueIds(items, path) {
    if (!Array.isArray(items)) return;
    const seen = new Set();
    items.forEach((item, index) => {
      if (!isObject(item) || typeof item.id !== 'string') return;
      if (seen.has(item.id)) issue(`${path}[${index}].id`, 'must be unique within its collection');
      seen.add(item.id);
    });
  }

  if (!object(input, '$', ['schemaVersion', 'id', 'title', 'caseType', 'status', 'event', 'sources', 'claims', 'challenge', 'exposures', 'assessment', 'provenance'])) {
    return { valid: false, errors };
  }
  if (input.schemaVersion !== '1.0.0') issue('$.schemaVersion', 'must be 1.0.0');
  id(input.id, '$.id');
  text(input.title, '$.title');
  choice(input.caseType, '$.caseType', ['historical_reference', 'vigil_detection']);
  choice(input.status, '$.status', ['open', 'updated', 'closed']);

  if (object(input.event, '$.event', ['kind', 'occurredAt', 'location', 'summary'])) {
    text(input.event.kind, '$.event.kind');
    time(input.event.occurredAt, '$.event.occurredAt');
    text(input.event.location, '$.event.location');
    text(input.event.summary, '$.event.summary');
  }

  array(input.sources, '$.sources', (source, path) => {
    if (!object(source, path, ['id', 'publisher', 'url', 'retrievedAt'], ['publishedAt', 'independenceGroup'])) return;
    id(source.id, `${path}.id`);
    text(source.publisher, `${path}.publisher`);
    url(source.url, `${path}.url`);
    time(source.retrievedAt, `${path}.retrievedAt`);
    if (own(source, 'publishedAt')) time(source.publishedAt, `${path}.publishedAt`);
    if (own(source, 'independenceGroup')) id(source.independenceGroup, `${path}.independenceGroup`);
  });
  uniqueIds(input.sources, '$.sources');
  const sources = new Map(Array.isArray(input.sources) ? input.sources.filter(isObject).map((source) => [source.id, source]) : []);

  array(input.claims, '$.claims', (claim, path) => {
    if (!object(claim, path, ['id', 'text', 'status', 'confidence', 'evidence'])) return;
    id(claim.id, `${path}.id`);
    text(claim.text, `${path}.text`);
    choice(claim.status, `${path}.status`, ['reported', 'corroborated', 'contested']);
    choice(claim.confidence, `${path}.confidence`, ['low', 'medium', 'high']);
    array(claim.evidence, `${path}.evidence`, (ref, refPath) => {
      if (!object(ref, refPath, ['sourceId', 'locator', 'relation'])) return;
      id(ref.sourceId, `${refPath}.sourceId`);
      text(ref.locator, `${refPath}.locator`);
      choice(ref.relation, `${refPath}.relation`, ['supports', 'contradicts']);
      if (!sources.has(ref.sourceId)) issue(`${refPath}.sourceId`, 'must refer to a listed source');
    });
    if (claim.status === 'corroborated' && Array.isArray(claim.evidence)) {
      const groups = new Set(claim.evidence.filter((ref) => isObject(ref) && ref.relation === 'supports' && sources.has(ref.sourceId))
        .map((ref) => sources.get(ref.sourceId).independenceGroup ?? ref.sourceId));
      if (groups.size < 2) issue(`${path}.status`, 'corroborated requires two independent supporting source groups');
    }
  });
  uniqueIds(input.claims, '$.claims');
  const claimIds = new Set(Array.isArray(input.claims) ? input.claims.filter(isObject).map((claim) => claim.id) : []);

  if (object(input.challenge, '$.challenge', ['hypotheses', 'unresolvedQuestions'])) {
    array(input.challenge.hypotheses, '$.challenge.hypotheses', (hypothesis, path) => {
      if (!object(hypothesis, path, ['id', 'statement', 'claimIds', 'falsifiers'], ['alternativeTo'])) return;
      id(hypothesis.id, `${path}.id`);
      text(hypothesis.statement, `${path}.statement`);
      array(hypothesis.claimIds, `${path}.claimIds`, (value, itemPath) => {
        id(value, itemPath);
        if (!claimIds.has(value)) issue(itemPath, 'must refer to a listed claim');
      });
      array(hypothesis.falsifiers, `${path}.falsifiers`, text);
      if (own(hypothesis, 'alternativeTo')) array(hypothesis.alternativeTo, `${path}.alternativeTo`, id);
    });
    uniqueIds(input.challenge.hypotheses, '$.challenge.hypotheses');
    if (Array.isArray(input.challenge.hypotheses)) {
      const hypothesisIds = new Set(input.challenge.hypotheses.filter(isObject).map((item) => item.id));
      input.challenge.hypotheses.forEach((hypothesis, index) => {
        if (!isObject(hypothesis) || !Array.isArray(hypothesis.alternativeTo)) return;
        hypothesis.alternativeTo.forEach((other, otherIndex) => {
          if (!hypothesisIds.has(other) || other === hypothesis.id) {
            issue(`$.challenge.hypotheses[${index}].alternativeTo[${otherIndex}]`, 'must refer to another listed hypothesis');
          }
        });
      });
    }
    array(input.challenge.unresolvedQuestions, '$.challenge.unresolvedQuestions', text);
  }

  array(input.exposures, '$.exposures', (exposure, path) => {
    if (!object(exposure, path, ['id', 'claimId', 'targetType', 'target', 'channel', 'conditionalImpact', 'watchFor'])) return;
    id(exposure.id, `${path}.id`);
    id(exposure.claimId, `${path}.claimId`);
    if (!claimIds.has(exposure.claimId)) issue(`${path}.claimId`, 'must refer to a listed claim');
    choice(exposure.targetType, `${path}.targetType`, ['company', 'commodity', 'route', 'market', 'sector']);
    text(exposure.target, `${path}.target`);
    text(exposure.channel, `${path}.channel`);
    text(exposure.conditionalImpact, `${path}.conditionalImpact`);
    array(exposure.watchFor, `${path}.watchFor`, text);
  });
  uniqueIds(input.exposures, '$.exposures');

  if (object(input.assessment, '$.assessment', ['asOf', 'whatHappened', 'whyItMatters', 'whatToWatch'])) {
    time(input.assessment.asOf, '$.assessment.asOf');
    text(input.assessment.whatHappened, '$.assessment.whatHappened');
    text(input.assessment.whyItMatters, '$.assessment.whyItMatters');
    array(input.assessment.whatToWatch, '$.assessment.whatToWatch', text);
  }

  if (object(input.provenance, '$.provenance', ['maintainer', 'updatedAt'], ['detectionReceipt'])) {
    text(input.provenance.maintainer, '$.provenance.maintainer');
    time(input.provenance.updatedAt, '$.provenance.updatedAt');
    const receipt = input.provenance.detectionReceipt;
    if (input.caseType === 'vigil_detection' && !receipt) issue('$.provenance.detectionReceipt', 'is required for a Vigil detection');
    if (input.caseType === 'historical_reference' && receipt) issue('$.provenance.detectionReceipt', 'is reserved for a Vigil detection');
    if (receipt && object(receipt, '$.provenance.detectionReceipt', ['runId', 'recordedAt', 'url'])) {
      id(receipt.runId, '$.provenance.detectionReceipt.runId');
      time(receipt.recordedAt, '$.provenance.detectionReceipt.recordedAt');
      url(receipt.url, '$.provenance.detectionReceipt.url');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertCase(input) {
  const result = validateCase(input);
  if (!result.valid) {
    throw new Error(result.errors.map(({ path, message }) => `${path}: ${message}`).join('\n'));
  }
  return input;
}
