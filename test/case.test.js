import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validateCase, renderCase, compareCases } from '../src/index.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const example = async (name) => JSON.parse(await readFile(new URL(`../examples/${name}.json`, import.meta.url), 'utf8'));
const copy = (value) => structuredClone(value);

test('both historical studies pass the public case contract', async () => {
  for (const name of ['baltimore-bridge-2024', 'fomc-march-2024']) {
    assert.deepEqual(validateCase(await example(name)), { valid: true, errors: [] });
  }
});

test('evidence must bind a claim to an existing source', async () => {
  const item = await example('baltimore-bridge-2024');
  item.claims[0].evidence[0].sourceId = 'missing';
  assert.equal(validateCase(item).valid, false);
  assert.match(validateCase(item).errors.map((error) => error.message).join(' '), /listed source/);
});

test('corroboration cannot count one publisher twice', async () => {
  const item = await example('baltimore-bridge-2024');
  item.sources.push({ ...copy(item.sources[0]), id: 'mirror' });
  item.claims[0].evidence.push({ sourceId: 'mirror', locator: 'Copy of NTSB page', relation: 'supports' });
  item.claims[0].status = 'corroborated';
  assert.match(validateCase(item).errors.map((error) => error.message).join(' '), /two independent/);
  item.sources[1].independenceGroup = 'independent-report';
  assert.equal(validateCase(item).valid, true);
});

test('historical study cannot masquerade as a Vigil detection', async () => {
  const item = await example('fomc-march-2024');
  item.caseType = 'vigil_detection';
  assert.match(validateCase(item).errors.map((error) => error.message).join(' '), /receipt/);
  item.provenance.detectionReceipt = { runId: 'test-run', recordedAt: item.assessment.asOf, url: 'https://example.org/receipt' };
  assert.equal(validateCase(item).valid, true);
  item.caseType = 'historical_reference';
  assert.match(validateCase(item).errors.map((error) => error.message).join(' '), /reserved/);
});

test('render binds visible source, claim and conditional exposure', async () => {
  const output = renderCase(await example('baltimore-bridge-2024'));
  assert.match(output, /Historical reference study/);
  assert.match(output, /ntsb.gov\/investigations/);
  assert.match(output, /If bridge debris blocked/);
  assert.doesNotMatch(output, /Detection receipt:/);
});

test('compare identifies changed claims and new evidence without confusing case identity', async () => {
  const before = await example('fomc-march-2024');
  const after = copy(before);
  after.provenance.updatedAt = '2026-09-26T00:00:00Z';
  after.claims[0].text += ' The range was unchanged.';
  after.sources.push({ id: 'other-source', publisher: 'Example', url: 'https://example.org/source', retrievedAt: '2026-09-26T00:00:00Z' });
  const result = compareCases(before, after);
  assert.deepEqual(result.claims.changed, ['target-range-held']);
  assert.deepEqual(result.sources.added, ['other-source']);
  after.id = 'another-case';
  assert.throws(() => compareCases(before, after), /different case IDs/);
});

test('CLI returns nonzero for invalid input and renders a valid case', async () => {
  const file = new URL('../examples/fomc-march-2024.json', import.meta.url);
  const good = spawnSync(process.execPath, ['src/cli.js', 'validate', fileURLToPath(file)], { cwd: root, encoding: 'utf8' });
  assert.equal(good.status, 0);
  assert.match(good.stdout, /OK /);
  const rendered = spawnSync(process.execPath, ['src/cli.js', 'render', fileURLToPath(file)], { cwd: root, encoding: 'utf8' });
  assert.equal(rendered.status, 0);
  assert.match(rendered.stdout, /March 2024 FOMC/);
  const bad = spawnSync(process.execPath, ['src/cli.js', 'validate', 'missing.json'], { cwd: root, encoding: 'utf8' });
  assert.equal(bad.status, 1);
});
