import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

// Authoring/test helpers only. These are not installed in the customer plugin.
export async function loadContracts(root) {
  const directory = path.join(root, 'contracts/v0.1.0');
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const read = async name => JSON.parse(await readFile(path.join(directory, name), 'utf8'));
  return {
    validateAssignment: ajv.compile(await read('assignment.schema.json')),
    validateReport: ajv.compile(await read('report.schema.json')),
    formatVersion: 1,
  };
}

// Structural/semantic authoring checks are distinct from identity and permissions,
// which are enforced by Productive and cannot be established from report text.
export function checkReportAgainstAssignment(assignment, report) {
  const errors = [];
  if (assignment.issueState !== 'issued') errors.push('Brief is not issued.');
  if (report.briefVersion !== assignment.briefVersion) errors.push('Brief version changed.');
  if (report.taskType !== assignment.taskType) errors.push('Task type differs.');
  const ids = new Set(assignment.items.map(item => item.id));
  if (ids.size !== assignment.items.length) errors.push('Duplicate issued item ID.');
  const answered = new Set();
  for (const response of report.responses) {
    if (!ids.has(response.itemId)) errors.push('Response refers to an unknown item.');
    if (answered.has(response.itemId)) errors.push('Duplicate response item ID.');
    answered.add(response.itemId);
    if (response.provenance === 'ai_deduction' && !response.customerConfirmed &&
        ['answered', 'passed', 'failed'].includes(response.outcome)) errors.push('Material AI deduction is unconfirmed.');
  }
  if (report.outstandingItemIds.some(id => !ids.has(id))) errors.push('Unknown outstanding item.');
  if (report.completeness === 'complete') {
    if (report.outstandingItemIds.length || report.blockers.length) errors.push('Complete report has outstanding work.');
    for (const item of assignment.items.filter(item => item.required)) {
      const response = report.responses.find(value => value.itemId === item.id);
      if (!response || ['unknown', 'unavailable', 'needs_clarification', 'blocked', 'not_tested'].includes(response.outcome)) {
        errors.push('Required item remains incomplete.');
      }
    }
  }
  return errors;
}
