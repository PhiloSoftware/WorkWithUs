import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { createPackage, providers, writePackage } from './lib/packages.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
try {
  const { values } = parseArgs({ options: { provider: { type: 'string' }, profile: { type: 'string', default: 'productive' } } });
  const targets = values.provider ? [values.provider] : await providers(root);
  for (const provider of targets) {
    const result = await createPackage(root, provider, { profile: values.profile });
    console.log(await writePackage(path.join(root, 'dist'), result));
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
