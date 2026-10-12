import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createPackage, validateLinks, writePackage } from '../scripts/lib/packages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const jsonFile = (result, name) => JSON.parse(result.files.get(name));

test('both providers carry the exact shared workflows with resolvable references', async () => {
  const chatgpt = await createPackage(root, 'chatgpt');
  const claude = await createPackage(root, 'claude');
  const catalog = JSON.parse(await readFile(path.join(root, 'shared/plugin.json'), 'utf8'));
  for (const skill of catalog.skills) {
    const name = `skills/${skill}/SKILL.md`;
    const source = (await readFile(path.join(root, 'shared', name), 'utf8')).replace(/\r\n/g, '\n');
    assert.equal(chatgpt.files.get(name), source);
    assert.equal(claude.files.get(name), source);
    assert.equal(chatgpt.files.get(`skills/${skill}/references/working-agreement.md`), claude.files.get(`skills/${skill}/references/working-agreement.md`));
  }
  assert.ok(chatgpt.files.has('plugin.json'));
  assert.ok(claude.files.has('.claude-plugin/plugin.json'));
  assert.equal(jsonFile(chatgpt, 'plugin.json').extensions['com.openai'].onboardingSkill, './skills/setup/SKILL.md');
});

test('preview builds cannot accidentally include a configured service', async () => {
  for (const provider of ['chatgpt', 'claude']) {
    const result = await createPackage(root, provider, { profile: 'preview' });
    assert.ok(!result.files.has('mcp.json'));
    assert.ok(!result.files.has('.mcp.json'));
    assert.ok(![...result.files.values()].some(content => content.includes('philo-mcp.test')));
  }
});

test('ChatGPT reuses its native app and Claude bundles only Productive', async () => {
  const chatgpt = await createPackage(root, 'chatgpt');
  const claude = await createPackage(root, 'claude');
  assert.ok(!chatgpt.files.has('mcp.json'));
  assert.ok(!chatgpt.files.has('.app.json'));
  assert.deepEqual(jsonFile(claude, '.mcp.json'), {
    mcpServers: { productive: { type: 'http', url: 'https://mcp.productive.io/mcp' } },
  });
  assert.equal(chatgpt.profile, 'productive');
  assert.equal(claude.profile, 'productive');
});

test('legacy custom-service profile is rejected', async () => {
  await assert.rejects(createPackage(root, 'chatgpt', { profile: 'connected' }), /Unknown build profile/);
});

test('unknown providers and profiles cannot silently select another adapter', async () => {
  await assert.rejects(createPackage(root, '../chatgpt'), /Unknown provider/);
  await assert.rejects(createPackage(root, 'gemini'), /Unknown provider/);
  await assert.rejects(createPackage(root, 'chatgpt', { profile: 'production' }), /Unknown build profile/);
});

test('package selection ignores unrelated files, even inside a skill directory', async () => {
  const isolated = await mkdtemp(path.join(os.tmpdir(), 'philo-package-source-'));
  await cp(path.join(root, 'shared'), path.join(isolated, 'shared'), { recursive: true });
  await cp(path.join(root, 'providers'), path.join(isolated, 'providers'), { recursive: true });
  await writeFile(path.join(isolated, 'shared/skills/setup/.env'), 'INTERNAL_TEST_SENTINEL');
  await writeFile(path.join(isolated, 'shared/skills/setup/customer-notes.md'), 'PRIVATE_TEST_SENTINEL');
  const result = await createPackage(isolated, 'claude');
  assert.ok(![...result.files.values()].some(content => /INTERNAL_TEST_SENTINEL|PRIVATE_TEST_SENTINEL/.test(content)));
  assert.ok([...result.files.keys()].every(name => name === '.claude-plugin/plugin.json' || name === '.mcp.json' || name === 'README.md' || name.startsWith('skills/')));
});

test('unknown workflow references fail the build before distribution', async () => {
  const isolated = await mkdtemp(path.join(os.tmpdir(), 'philo-package-routing-'));
  await cp(path.join(root, 'shared'), path.join(isolated, 'shared'), { recursive: true });
  await cp(path.join(root, 'providers'), path.join(isolated, 'providers'), { recursive: true });
  await writeFile(path.join(isolated, 'shared/task-types.json'), JSON.stringify({ formatVersion: 1, types: { decision_request: { skill: 'missing-workflow' } } }));
  await assert.rejects(createPackage(isolated, 'chatgpt'), /missing skill/);
});

test('reference validation detects missing files and escapes from the package', () => {
  assert.throws(() => validateLinks(new Map([['skills/setup/SKILL.md', '[missing](references/missing.md)']])), /Broken package link/);
  assert.throws(() => validateLinks(new Map([['README.md', '[outside](../spec.md)']])), /Broken package link/);
});

test('rebuilds are deterministic and refuse stale or unexpected output files', async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), 'philo-package-output-'));
  const result = await createPackage(root, 'chatgpt');
  const destination = await writePackage(output, result);
  const recordPath = path.join(output, 'productive/chatgpt/build-record.json');
  const firstRecord = await readFile(recordPath, 'utf8');
  await writePackage(output, await createPackage(root, 'chatgpt'));
  assert.equal(await readFile(recordPath, 'utf8'), firstRecord);
  await mkdir(path.join(destination, 'internal'));
  await writeFile(path.join(destination, 'internal/customer.json'), '{}');
  await assert.rejects(writePackage(output, result), /Unexpected output file/);
  assert.equal(await readFile(path.join(destination, 'internal/customer.json'), 'utf8'), '{}');
});

