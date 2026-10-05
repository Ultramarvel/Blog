import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const root = new URL('../', import.meta.url);
const readme = await readFile(new URL('README.md', root), 'utf8');
const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));

test('the README documents the title and scripts that actually exist', () => {
  assert.match(readme, /^# 林间信号 · Field Notes$/m);

  const documentedCommands = [...readme.matchAll(/npm (?:run )?([a-z][a-z:]*)/g)].map((match) => match[1]);
  assert.ok(documentedCommands.length > 0, 'README should document npm scripts');
  assert.ok(documentedCommands.includes('install'), 'README should document the install step');

  for (const command of documentedCommands) {
    if (command === 'install' || command === 'ci') continue;
    assert.ok(packageJson.scripts[command], `README documents "npm ${command}" but package.json has no such script`);
  }

  for (const script of ['dev', 'dev:cms', 'build', 'check', 'test', 'verify']) {
    assert.ok(
      documentedCommands.includes(script),
      `README should document the "${script}" script`,
    );
  }
});

test('every repository path mentioned in the README exists', () => {
  const repositoryPrefixes = ['src/', 'public/', 'tests/', '.github/'];
  const repositoryExtensions = ['.astro', '.css', '.js', '.mjs', '.ts', '.yml', '.json'];
  const intentionallyAbsent = ['public/.cms-media-disabled'];
  const seen = new Set();

  for (const match of readme.matchAll(/`([^`\n]+)`/g)) {
    const candidate = match[1].trim().replace(/\\/g, '/').replace(/\/+$/, '');
    if (!/^[\w./[\]-]+$/.test(candidate)) continue;
    if (intentionallyAbsent.includes(candidate)) continue;

    const isRepositoryPath = repositoryPrefixes.some((prefix) => candidate.startsWith(prefix))
      || repositoryExtensions.some((extension) => candidate.endsWith(extension));
    if (!isRepositoryPath) continue;

    seen.add(candidate);
  }

  assert.ok(seen.size > 5, 'README should reference several repository paths');

  for (const candidate of seen) {
    const base = candidate.replace(/[*?].*$/, '').replace(/\/+$/, '');
    assert.ok(
      existsSync(new URL(base, root)) || existsSync(new URL(`${base}.json`, root)),
      `README references "${candidate}" but no such path exists`,
    );
  }
});

test('the README deploy notes match the workflow and CMS configuration', async () => {
  const [workflow, cmsConfig] = await Promise.all([
    readFile(new URL('.github/workflows/deploy.yml', root), 'utf8'),
    readFile(new URL('public/admin/config.yml', root), 'utf8'),
  ]);

  assert.match(workflow, /node-version: 22/);
  assert.match(readme, /Node\.js 22\+/);

  for (const secret of ['SERVER_HOST', 'SERVER_USER', 'SERVER_PORT', 'SERVER_SSH_KEY']) {
    assert.ok(workflow.includes(secret), `workflow should use ${secret}`);
    assert.match(readme, new RegExp(secret), `README should document the ${secret} secret`);
  }

  assert.match(workflow, /npm run verify/);
  assert.match(readme, /`npm run verify`/);

  const siteUrl = cmsConfig.match(/^site_url:\s*(\S+)/m)?.[1];
  assert.ok(siteUrl, 'CMS config should define site_url');
  assert.ok(readme.includes(siteUrl), `README should mention the live site ${siteUrl}`);

  assert.match(cmsConfig, /publish_mode: editorial_workflow/);
  assert.match(readme, /editorial_workflow/);
});
