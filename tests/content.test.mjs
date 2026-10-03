import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { test } from 'node:test';

const postsDirectory = new URL('../src/content/posts/', import.meta.url);

test('every Markdown post contains the required frontmatter fields', async () => {
  const files = (await readdir(postsDirectory)).filter((file) => file.endsWith('.md'));
  assert.ok(files.length > 0, 'at least one Markdown post should exist');

  for (const file of files) {
    const content = await readFile(new URL(file, postsDirectory), 'utf8');
    for (const field of ['title', 'summary', 'category', 'publishedAt', 'readingMinutes', 'featured', 'draft']) {
      assert.match(content, new RegExp(`^${field}:`, 'm'), `${file} is missing ${field}`);
    }
  }
});

test('the CMS exposes Markdown text controls without image fields', async () => {
  const config = await readFile(new URL('../public/admin/config.yml', import.meta.url), 'utf8');
  assert.match(config, /name: "body"[\s\S]*widget: "markdown"/);
  assert.match(config, /editor_components: \["code-block"\]/);
  assert.doesNotMatch(config, /widget: "image"/);
});

test('published Markdown posts do not contain image syntax', async () => {
  const files = (await readdir(postsDirectory)).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const content = await readFile(new URL(file, postsDirectory), 'utf8');
    assert.doesNotMatch(content, /!\[[^\]]*\]\([^)]*\)/, `${file} contains a Markdown image`);
    assert.doesNotMatch(content, /<img\b/i, `${file} contains an HTML image`);
  }
});
