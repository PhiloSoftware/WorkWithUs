import { lstat, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const json = value => `${JSON.stringify(value, null, 2)}\n`;
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const profiles = new Set(['preview', 'productive']);

function safeRelative(relative) {
  if (!relative || relative.includes('\\') || path.posix.isAbsolute(relative) ||
      relative.split('/').some(part => !part || part === '.' || part === '..' || part.includes(':'))) {
    throw new Error(`Invalid package path: ${relative}`);
  }
  return relative;
}

async function checkPath(root, relative, { allowMissing = false } = {}) {
  safeRelative(relative);
  let current = path.resolve(root);
  // Check every ancestor too, so a linked dist directory cannot redirect writes.
  const ancestors = [];
  for (let item = current; ; item = path.dirname(item)) {
    ancestors.unshift(item);
    if (path.dirname(item) === item) break;
  }
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    ancestors.push(current);
  }
  for (const item of ancestors) {
    try {
      if ((await lstat(item)).isSymbolicLink()) throw new Error(`Linked paths are not packaged: ${item}`);
    } catch (error) {
      if (allowMissing && error.code === 'ENOENT') continue;
      throw error;
    }
  }
  return current;
}

async function read(root, relative) {
  const filename = await checkPath(root, relative);
  if (!(await lstat(filename)).isFile()) throw new Error(`Expected a file: ${relative}`);
  return (await readFile(filename, 'utf8')).replace(/\r\n/g, '\n');
}

export async function providers(root) {
  await checkPath(root, 'providers');
  return (await readdir(path.join(root, 'providers'), { withFileTypes: true }))
    .filter(entry => entry.isDirectory() && slug.test(entry.name))
    .map(entry => entry.name).sort();
}

export async function createPackage(root, provider, { profile = 'productive' } = {}) {
  if (!slug.test(provider) || !(await providers(root)).includes(provider)) throw new Error(`Unknown provider: ${provider}`);
  if (!profiles.has(profile)) throw new Error(`Unknown build profile: ${profile}`);
  const connection = JSON.parse(await read(root, 'shared/productive.json'));
  if (connection.connection !== 'customer-owned' || connection.mcpUrl !== 'https://mcp.productive.io/mcp') throw new Error('Invalid Productive connection configuration.');
  const metadata = JSON.parse(await read(root, 'shared/plugin.json'));
  const adapter = JSON.parse(await read(root, `providers/${provider}/adapter.json`));
  const registry = JSON.parse(await read(root, 'shared/task-types.json'));
  if (registry.formatVersion !== 1) throw new Error('Unsupported Philo assignment format.');
  if (!slug.test(metadata.name) || !/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/.test(metadata.version)) throw new Error('Invalid plugin identity/version.');
  if (adapter.id !== provider) throw new Error('Provider identity does not match directory.');
  if (!Array.isArray(metadata.skills) || !metadata.skills.length || new Set(metadata.skills).size !== metadata.skills.length ||
      metadata.skills.some(name => !slug.test(name))) throw new Error('Invalid skill allowlist.');
  for (const workflow of Object.values(registry.types)) {
    if (!metadata.skills.includes(workflow.skill)) throw new Error(`Task type references missing skill: ${workflow.skill}`);
  }

  const files = new Map();
  const add = (name, content) => {
    safeRelative(name);
    if (files.has(name)) throw new Error(`Duplicate package file: ${name}`);
    files.set(name, content);
  };
  const manifest = {
    name: metadata.name, version: metadata.version,
    description: metadata.description, author: metadata.author,
  };
  if (adapter.format === 'agent-plugins') {
    if (adapter.manifestPath !== 'plugin.json' || adapter.connection !== 'existing-app') throw new Error('Invalid Agent Plugins adapter.');
    manifest.$schema = 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json';
    manifest.extensions = { 'com.openai': { onboardingSkill: adapter.onboardingSkill } };
  } else if (adapter.format === 'claude-plugin') {
    if (adapter.manifestPath !== '.claude-plugin/plugin.json' || adapter.mcpPath !== '.mcp.json' || adapter.transport !== 'http' || adapter.connection !== 'bundled-mcp') throw new Error('Invalid Claude adapter.');
    manifest.displayName = metadata.displayName;
  } else {
    throw new Error(`Unsupported package format: ${adapter.format}`);
  }
  add(adapter.manifestPath, json(manifest));

  if (profile === 'productive' && adapter.connection === 'bundled-mcp') {
    add(adapter.mcpPath, json({ mcpServers: { productive: { type: adapter.transport, url: connection.mcpUrl } } }));
  }

  const buildNotice = profile === 'preview'
    ? 'This is a disconnected rehearsal build. Do not use live Productive tools in this profile. Work only from an explicitly supplied sample brief and label all output unsaved rehearsal work. Install the Productive build to work with live assignments.'
    : 'Use the customer-owned Productive connection described below. No separate Philo service or login is required. Verify connection and identity before reading tasks; installing this package does not grant Productive access. Customer-account installation and permissions still require pilot verification.';
  const providerInstructions = `# Build availability\n\n${buildNotice}\n\n${await read(root, `providers/${provider}/${adapter.instructions}`)}`;
  const references = ['working-agreement.md', 'tools.md', 'assignment-format.md'];
  for (const skill of metadata.skills) {
    const body = await read(root, `shared/skills/${skill}/SKILL.md`);
    const frontmatter = body.match(/^---\nname: ([a-z0-9-]+)\ndescription: ([^\n]+)\n---\n/);
    if (!frontmatter || frontmatter[1] !== skill || frontmatter[2].length > 1024) throw new Error(`Invalid skill metadata: ${skill}`);
    add(`skills/${skill}/SKILL.md`, body);
    for (const reference of references) add(`skills/${skill}/references/${reference}`, await read(root, `shared/references/${reference}`));
    add(`skills/${skill}/references/provider.md`, providerInstructions);
    add(`skills/${skill}/references/task-types.json`, json(registry));
  }
  if (adapter.onboardingSkill && !files.has(adapter.onboardingSkill.replace(/^\.\//, ''))) throw new Error('Onboarding skill is not packaged.');
  add('README.md', `# ${metadata.displayName}\n\nVersion ${metadata.version}; ${provider}; ${profile} build.\n\n${buildNotice}\n\nStart with: "Use Work with Philo to get me connected and show what needs my attention."\n\nThe guided workflows cover information requests and software reviews. New ideas stay separate from the issued assignment. Customers review reports before submission, and Philo decides acceptance. Automatic reminders are not enabled. This is a private development preview, not a public release.\n`);
  validateLinks(files);
  return { files, provider, profile, version: metadata.version, name: metadata.name, formatVersion: registry.formatVersion };
}

export function validateLinks(files) {
  for (const [name, content] of files) {
    if (!name.endsWith('.md')) continue;
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const link = match[1];
      if (/^(https?:|#)/.test(link)) continue;
      const target = path.posix.normalize(path.posix.join(path.posix.dirname(name), link.split('#')[0]));
      if (!files.has(target)) throw new Error(`Broken package link in ${name}: ${link}`);
    }
  }
}

export async function writePackage(outputRoot, result) {
  const prefix = `${result.profile}/${result.provider}/${result.name}`;
  const packageRoot = await checkPath(outputRoot, prefix, { allowMissing: true });
  // Never delete a directory to rebuild. Refuse unexpected files rather than silently shipping stale data.
  async function inspect(relative = '') {
    let entries;
    try { entries = await readdir(path.join(packageRoot, relative), { withFileTypes: true }); }
    catch (error) { if (error.code === 'ENOENT') return; throw error; }
    for (const entry of entries) {
      const item = relative ? `${relative}/${entry.name}` : entry.name;
      if (entry.isSymbolicLink()) throw new Error(`Linked output path: ${item}`);
      if (entry.isDirectory()) await inspect(item);
      else if (!result.files.has(item)) throw new Error(`Unexpected output file; inspect before removing: ${path.join(packageRoot, item)}`);
    }
  }
  await inspect();
  for (const [relative, content] of result.files) {
    const target = await checkPath(outputRoot, `${prefix}/${relative}`, { allowMissing: true });
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, content, 'utf8');
  }
  const inventory = [...result.files].sort(([a], [b]) => a.localeCompare(b)).map(([name, content]) => ({
    path: name, sha256: createHash('sha256').update(content).digest('hex'),
  }));
  const recordPath = await checkPath(outputRoot, `${result.profile}/${result.provider}/build-record.json`, { allowMissing: true });
  await writeFile(recordPath, json({ provider: result.provider, profile: result.profile, version: result.version, formatVersion: result.formatVersion, files: inventory }));
  return packageRoot;
}

