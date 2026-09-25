import { assertCase } from './validate.js';

const escape = (value) => String(value).replace(/[\\[\]*_`|]/g, '\\$&').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', ' ');
const href = (value) => new URL(value).href.replaceAll('(', '%28').replaceAll(')', '%29');

export function renderCase(input) {
  const item = assertCase(input);
  const sources = new Map(item.sources.map((source) => [source.id, source]));
  const lines = [
    `# ${escape(item.title)}`,
    '',
    `**Case:** ${escape(item.id)} · **Type:** ${item.caseType === 'vigil_detection' ? 'Vigil detection' : 'Historical reference study'} · **Status:** ${escape(item.status)}`,
    '',
    `**Event:** ${escape(item.event.summary)} (${escape(item.event.location)}, ${escape(item.event.occurredAt)})`,
    '',
    '## What happened', '', escape(item.assessment.whatHappened), '',
    '## Evidence and claims', ''
  ];
  for (const claim of item.claims) {
    lines.push(`### ${escape(claim.id)} — ${escape(claim.text)}`, '', `Status: ${escape(claim.status)} · Confidence: ${escape(claim.confidence)}`, '');
    for (const ref of claim.evidence) {
      const source = sources.get(ref.sourceId);
      lines.push(`- ${escape(ref.relation)} [${escape(source.id)}]: [${escape(source.publisher)}](${href(source.url)}) — ${escape(ref.locator)} (retrieved ${escape(source.retrievedAt)})`);
    }
    lines.push('');
  }
  lines.push('## Challenge', '');
  for (const hypothesis of item.challenge.hypotheses) {
    lines.push(`- **${escape(hypothesis.statement)}** (claims: ${hypothesis.claimIds.map(escape).join(', ')})`);
    if (hypothesis.alternativeTo) lines.push(`  - Alternative to: ${hypothesis.alternativeTo.map(escape).join(', ')}`);
    for (const falsifier of hypothesis.falsifiers) lines.push(`  - Would weaken it: ${escape(falsifier)}`);
  }
  lines.push('', 'Unresolved:');
  for (const question of item.challenge.unresolvedQuestions) lines.push(`- ${escape(question)}`);
  lines.push('', '## Why it matters', '', escape(item.assessment.whyItMatters), '');
  for (const exposure of item.exposures) {
    lines.push(`- **${escape(exposure.target)}** (${escape(exposure.targetType)}; claim ${escape(exposure.claimId)}): ${escape(exposure.channel)}. ${escape(exposure.conditionalImpact)}`);
    for (const watch of exposure.watchFor) lines.push(`  - Watch: ${escape(watch)}`);
  }
  lines.push('', '## What to watch', '');
  for (const watch of item.assessment.whatToWatch) lines.push(`- ${escape(watch)}`);
  lines.push('', `Assessment as of ${escape(item.assessment.asOf)}. Maintained by ${escape(item.provenance.maintainer)}.`);
  if (item.provenance.detectionReceipt) lines.push(`Detection receipt: [${escape(item.provenance.detectionReceipt.runId)}](${href(item.provenance.detectionReceipt.url)}).`);
  return `${lines.join('\n')}\n`;
}
