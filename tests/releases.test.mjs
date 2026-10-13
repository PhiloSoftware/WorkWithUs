import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, readdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { releaseVersion, stageRelease } from '../scripts/release.mjs';

async function fixture(t, version = '0.1.0') {
  const prefix = path.join(os.tmpdir(), 'philo-release-');
  const root = await mkdtemp(prefix);
  assert.ok(root.startsWith(prefix));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, 'shared'));
  await writeFile(path.join(root, 'shared/plugin.json'), JSON.stringify({ version }));
  await writeFile(path.join(root, 'package.json'), JSON.stringify({ version }));
  await writeFile(path.join(root, 'package-lock.json'), JSON.stringify({ version, packages: { '': { version } } }));
  for (const provider of ['chatgpt', 'claude']) {
    await mkdir(path.join(root, 'dist/productive', provider), { recursive: true });
    await writeFile(path.join(root, 'dist/productive', provider, 'build-record.json'), JSON.stringify({ provider, profile: 'productive', version }));
    await writeFile(path.join(root, 'dist/productive', `work-with-philo-${provider}-${version}-productive.zip`), Buffer.from(`package ${provider} ${version}`));
  }
  return root;
}

test('release tags and every package version must agree before publication', async t => {
  const root = await fixture(t);
  for (const tag of ['main', 'v0.1.1', 'v0.1.0/other']) await assert.rejects(releaseVersion(root, tag), /Release tag/);
  assert.deepEqual(await releaseVersion(root, 'v0.1.0'), { version: '0.1.0', prerelease: false });
  await writeFile(path.join(root, 'package-lock.json'), JSON.stringify({ version: '0.1.0', packages: { '': { version: '0.1.1' } } }));
  await assert.rejects(releaseVersion(root, 'v0.1.0'), /versions must match/);
});

test('prerelease tags are identified so they cannot replace stable customer downloads', async t => {
  const root = await fixture(t, '0.2.0-alpha.1');
  assert.deepEqual(await releaseVersion(root, 'v0.2.0-alpha.1'), { version: '0.2.0-alpha.1', prerelease: true });
});

test('a stale provider build stops both providers from being staged', async t => {
  const root = await fixture(t);
  await writeFile(path.join(root, 'dist/productive/claude/build-record.json'), JSON.stringify({ provider: 'claude', profile: 'preview', version: '0.1.0' }));
  await assert.rejects(stageRelease(root, 'v0.1.0'), /Rebuild claude/);
  await assert.rejects(readdir(path.join(root, 'dist/release')), { code: 'ENOENT' });
});

test('release aliases preserve both archive bytes and publish their exact checksums', async t => {
  const root = await fixture(t);
  await stageRelease(root, 'v0.1.0');
  const sums = await readFile(path.join(root, 'dist/release/SHA256SUMS.txt'), 'utf8');
  assert.deepEqual((await readdir(path.join(root, 'dist/release'))).sort(), ['SHA256SUMS.txt', 'work-with-philo-chatgpt.zip', 'work-with-philo-claude.zip']);
  for (const provider of ['chatgpt', 'claude']) {
    const original = await readFile(path.join(root, 'dist/productive', `work-with-philo-${provider}-0.1.0-productive.zip`));
    const published = await readFile(path.join(root, 'dist/release', `work-with-philo-${provider}.zip`));
    assert.deepEqual(published, original);
    assert.ok(sums.includes(`${createHash('sha256').update(published).digest('hex')}  work-with-philo-${provider}.zip\n`));
  }
});
