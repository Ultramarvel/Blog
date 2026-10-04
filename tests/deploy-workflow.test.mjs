import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

const workflowUrl = new URL('../.github/workflows/deploy.yml', import.meta.url);

test('the deployment workflow verifies and publishes the static build', async () => {
  const workflow = await readFile(workflowUrl, 'utf8');

  assert.match(workflow, /push:\s*\r?\n\s+branches: \[master\]/);
  assert.match(workflow, /node-version: 22/);
  assert.match(workflow, /run: npm run verify/);
  assert.match(workflow, /SERVER_SSH_KEY: \$\{\{ secrets\.SERVER_SSH_KEY \}\}/);
  assert.match(workflow, /rsync -az --delete/);
  assert.match(workflow, /dist\/ "\$SERVER_USER@\$SERVER_HOST:\/var\/www\/field-notes\/dist\/"/);
});
