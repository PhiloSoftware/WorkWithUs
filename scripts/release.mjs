import { readFile, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export async function releaseVersion(root, tag) {
  const metadata = JSON.parse(await readFile(path.join(root, 'shared/plugin.json'), 'utf8'));
  const packageMetadata = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
  const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'));
  if (!/^v\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(tag) || tag !== `v${metadata.version}`) {
    throw new Error('Release tag must be v followed by the version in shared/plugin.json.');
  }
  if ([packageMetadata.version, lock.version, lock.packages[''].version].some(version => version !== metadata.version)) {
    throw new Error('Plugin, package, and lockfile versions must match before release.');
  }
  return { version: metadata.version, prerelease: metadata.version.includes('-') };
}

export async function stageRelease(root, tag) {
  const metadata = await releaseVersion(root, tag);
  const archives = [];
  // Validate both builds before staging either provider for publication.
  for (const provider of ['chatgpt', 'claude']) {
    const record = JSON.parse(await readFile(path.join(root, 'dist/productive', provider, 'build-record.json'), 'utf8'));
    if (record.provider !== provider || record.profile !== 'productive' || record.version !== metadata.version) {
      throw new Error(`Rebuild ${provider}: build record does not match the release.`);
    }
    const source = path.join(root, 'dist/productive', `work-with-philo-${provider}-${metadata.version}-productive.zip`);
    const bytes = await readFile(source);
    archives.push({ source, name: `work-with-philo-${provider}.zip`, sha256: createHash('sha256').update(bytes).digest('hex') });
  }
  const destination = path.join(root, 'dist/release');
  await mkdir(destination, { recursive: true });
  for (const archive of archives) await copyFile(archive.source, path.join(destination, archive.name));
  await writeFile(path.join(destination, 'SHA256SUMS.txt'), archives.map(archive => `${archive.sha256}  ${archive.name}\n`).join(''));
  return metadata;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const root = fileURLToPath(new URL('../', import.meta.url));
    const [command, tag] = process.argv.slice(2);
    if (!['check', 'stage'].includes(command)) throw new Error('Usage: node scripts/release.mjs check|stage vVERSION');
    const metadata = await (command === 'check' ? releaseVersion(root, tag) : stageRelease(root, tag));
    if (process.env.GITHUB_OUTPUT) await writeFile(process.env.GITHUB_OUTPUT, `version=${metadata.version}\nprerelease=${metadata.prerelease}\n`, { flag: 'a' });
    console.log(`${tag}: ${command === 'stage' ? 'release assets staged' : 'versions match'}`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
