import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { createPackage, providers } from './lib/packages.mjs';
import { loadContracts } from './lib/contracts.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const contracts = await loadContracts(root);
  console.log(`Philo authoring format ${contracts.formatVersion}: assignment and report schemas compiled`);
  for (const name of ['information-request', 'software-review']) {
    const template = JSON.parse(await readFile(new URL(`../templates/productive/${name}.json`, import.meta.url), 'utf8'));
    if (!contracts.validateAssignment(template)) throw new Error(`Invalid ${name} template: ${JSON.stringify(contracts.validateAssignment.errors)}`);
    if (template.issueState !== 'draft') throw new Error(`Example ${name} must remain a draft.`);
  }
  console.log('Both Productive task templates validated as unissued drafts');
  for (const provider of await providers(root)) {
    for (const profile of ['productive', 'preview']) {
      const result = await createPackage(root, provider, { profile });
      console.log(`${provider}/${profile}: ${result.files.size} files; skill metadata, routing, and package links valid`);
    }
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
