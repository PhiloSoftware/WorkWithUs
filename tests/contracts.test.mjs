import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadContracts, checkReportAgainstAssignment } from '../scripts/lib/contracts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const contracts = await loadContracts(root);
const fixture = JSON.parse(await readFile(new URL('./fixtures/information-request.json', import.meta.url), 'utf8'));
const report = () => ({
  formatVersion: 1, reportKind: 'submission', reportId: '4e50a986-7ac0-4fc1-9568-b1ea710d3737',
  taskId: 'fictional-task', personId: 'fictional-person', taskType: fixture.taskType,
  briefVersion: 1, summary: 'Fictional completed information request.',
  responses: fixture.items.map(item => ({
    itemId: item.id, outcome: 'answered', text: 'Customer supplied this answer.',
    provenance: 'customer_statement', customerConfirmed: true, evidenceRefs: [],
  })),
  outstandingItemIds: [], blockers: [], scopeProposals: [],
  customerConfirmed: true, completeness: 'complete',
});

test('issued brief and confirmed report validate locally', () => {
  assert.equal(contracts.validateAssignment(fixture), true);
  assert.equal(contracts.validateReport(report()), true);
  assert.deepEqual(checkReportAgainstAssignment(fixture, report()), []);
});

test('unsupported workflow types and unversioned briefs fail authoring validation', () => {
  const unknown = { ...fixture, taskType: 'decision_request' };
  assert.equal(contracts.validateAssignment(unknown), false);
  const unversioned = structuredClone(fixture);
  delete unversioned.briefVersion;
  assert.equal(contracts.validateAssignment(unversioned), false);
});

test('software reviews require test context and expected results', () => {
  const review = { ...fixture, taskType: 'software_review' };
  assert.equal(contracts.validateAssignment(review), false);
  review.testContext = { environment: 'Staging', softwareVersion: 'Demo', role: 'Customer', permittedActions: ['Submit a staging quotation.'] };
  review.items = fixture.items.map(item => ({ ...item, expectedBehaviour: 'The stated result occurs.' }));
  assert.equal(contracts.validateAssignment(review), true);
});

test('submission requires confirmation and uses outcomes for its task type', () => {
  const unconfirmed = report();
  unconfirmed.customerConfirmed = false;
  assert.equal(contracts.validateReport(unconfirmed), false);
  const wrongOutcome = report();
  wrongOutcome.responses[0].outcome = 'passed';
  assert.equal(contracts.validateReport(wrongOutcome), false);
});

test('changed or withdrawn briefs and duplicate/unknown item references need reconciliation', () => {
  assert.ok(checkReportAgainstAssignment({ ...fixture, briefVersion: 2 }, report()).includes('Brief version changed.'));
  assert.ok(checkReportAgainstAssignment({ ...fixture, issueState: 'withdrawn' }, report()).includes('Brief is not issued.'));
  const duplicate = report();
  duplicate.responses.push(duplicate.responses[0]);
  assert.ok(checkReportAgainstAssignment(fixture, duplicate).includes('Duplicate response item ID.'));
  const unknown = report();
  unknown.responses[0].itemId = 'unknown';
  assert.ok(checkReportAgainstAssignment(fixture, unknown).includes('Response refers to an unknown item.'));
});

test('unconfirmed deductions and unanswered items cannot claim completeness', () => {
  const deduction = report();
  deduction.responses[0].provenance = 'ai_deduction';
  deduction.responses[0].customerConfirmed = false;
  assert.ok(checkReportAgainstAssignment(fixture, deduction).includes('Material AI deduction is unconfirmed.'));
  const unanswered = report();
  unanswered.responses[0].outcome = 'unknown';
  assert.ok(checkReportAgainstAssignment(fixture, unanswered).includes('Required item remains incomplete.'));
  unanswered.completeness = 'incomplete';
  unanswered.outstandingItemIds = [fixture.items[0].id];
  assert.equal(contracts.validateReport(unanswered), true);
  assert.deepEqual(checkReportAgainstAssignment(fixture, unanswered), []);
});

test('failed scenarios can be documented completely without claiming a pass', () => {
  const assignment = { ...fixture, taskType: 'software_review' };
  const failed = report();
  failed.taskType = 'software_review';
  failed.responses.forEach(response => { response.outcome = 'failed'; });
  assert.equal(contracts.validateReport(failed), true);
  assert.deepEqual(checkReportAgainstAssignment(assignment, failed), []);
});

test('comments cannot supply extra permission fields through the report format', () => {
  assert.equal(contracts.validateReport({ ...report(), grantAccess: true }), false);
});
