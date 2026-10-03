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
  assert.match(config, /modes: \["raw"\]/);
  assert.doesNotMatch(config, /rich_text/);
  assert.doesNotMatch(config, /widget: "image"/);
});

test('the owner profile contains all public identity fields', async () => {
  const profile = await readFile(new URL('../src/content/profile.md', import.meta.url), 'utf8');
  for (const field of ['name', 'initials', 'role', 'tagline', 'shortBio', 'location', 'coordinates', 'status', 'current', 'topics', 'since', 'email', 'profileNumber', 'updatedAt']) {
    assert.match(profile, new RegExp(`^${field}:`, 'm'), `profile.md is missing ${field}`);
  }
  assert.doesNotMatch(profile, /!\[[^\]]*\]\([^)]*\)/);
  assert.doesNotMatch(profile, /<img\b/i);
});

test('the homepage orbit card is compact, animated, and driven by the owner profile', async () => {
  const [page, styles, script] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/home-orbits.css', import.meta.url), 'utf8'),
    readFile(new URL('../script.js', import.meta.url), 'utf8'),
  ]);
  assert.match(page, /data-orbit-profile/);
  assert.match(page, /hero--orbit-only/);
  assert.match(page, /orbit-card-panel/);
  assert.doesNotMatch(page, /class="hero-copy"/);
  assert.match(page, /profile\.data\.name/);
  assert.match(page, /profile\.data\.topics/);
  assert.match(styles, /@keyframes profile-orbit-spin/);
  assert.match(styles, /@keyframes profile-orbit-counter/);
  assert.match(styles, /scale\(1\.15\)/, 'desktop orbit composition should use the enlarged scale');
  for (const ring of ['outer', 'middle', 'inner']) {
    assert.match(styles, new RegExp(`body\\.light \\.orbit-circle--${ring}`), `light mode is missing the ${ring} orbit contrast rule`);
  }
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(script, /orbitalArt\.addEventListener\('pointermove'/);
});

test('light mode gives the brand mark a high-contrast color', async () => {
  const styles = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(styles, /body\.light \.brand-mark\{[^}]*border-color:#5d7334;[^}]*color:#5d7334/);
  assert.match(styles, /body\.light \.brand-mark span\{[^}]*color:#5d7334/);
});

test('the homepage includes an accessible animated time stream with ordered bands', async () => {
  const [page, component, styles, script, geometry] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/TimeStream.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/time-stream.css', import.meta.url), 'utf8'),
    readFile(new URL('../script.js', import.meta.url), 'utf8'),
    import(new URL('../src/data/time-stream.mjs', import.meta.url).href),
  ]);
  assert.match(page, /<TimeStream \/>/);
  assert.match(component, /时间流向哪里？/);
  assert.match(component, /streamBands\.map/);
  assert.equal(geometry.streamBands.length, 5);
  const leftEdgeThicknesses = geometry.streamBands.map((_, layerIndex) => (
    geometry.streamBoundaries[layerIndex + 1][0][1]
      - geometry.streamBoundaries[layerIndex][0][1]
  ));
  assert.deepEqual(
    leftEdgeThicknesses,
    [0, 0, 0, 0, 420],
    'only the family stream should occupy the left edge',
  );
  assert.ok(
    geometry.sampleBoundaryY(geometry.streamBoundaries[1], 180) > 0,
    'the study stream should gradually enter after the left edge',
  );
  const earlyFamilyTop = geometry.sampleBoundaryY(geometry.streamBoundaries[4], 240);
  assert.ok(
    420 - earlyFamilyTop > 420 * 0.65,
    'the family stream should dominate the left side of the chart',
  );
  const pointCount = geometry.streamBoundaries[0].length;
  for (let pointIndex = 0; pointIndex < pointCount; pointIndex += 1) {
    for (let boundaryIndex = 1; boundaryIndex < geometry.streamBoundaries.length; boundaryIndex += 1) {
      const previous = geometry.streamBoundaries[boundaryIndex - 1][pointIndex];
      const current = geometry.streamBoundaries[boundaryIndex][pointIndex];
      assert.equal(current[0], previous[0], `boundary ${boundaryIndex} must share x coordinates`);
      assert.ok(current[1] >= previous[1], `boundary ${boundaryIndex} crosses the layer above at point ${pointIndex}`);
    }
  }
  geometry.streamBands.forEach((layer, layerIndex) => {
    const sampleXs = [layer.x, layer.x + layer.labelWidth / 2, layer.x + layer.labelWidth];
    sampleXs.forEach((sampleX) => {
      const upperY = geometry.sampleBoundaryY(geometry.streamBoundaries[layerIndex], sampleX);
      const lowerY = geometry.sampleBoundaryY(geometry.streamBoundaries[layerIndex + 1], sampleX);
      assert.ok(layer.y - 22 > upperY, `${layer.key} label top leaves its stream at x=${sampleX}`);
      assert.ok(layer.y < lowerY, `${layer.key} label baseline leaves its stream at x=${sampleX}`);
    });
  });
  assert.doesNotMatch(component, /<img\b/i);
  assert.match(styles, /\.stream-layer text\s*\{[^}]*fill:\s*#f0f1e9;/);
  assert.doesNotMatch(styles, /#263020/);
  assert.match(styles, /body\.light \.time-stream/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(script, /\.time-stream__chart/);
});

test('published Markdown posts do not contain image syntax', async () => {
  const files = (await readdir(postsDirectory)).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const content = await readFile(new URL(file, postsDirectory), 'utf8');
    assert.doesNotMatch(content, /!\[[^\]]*\]\([^)]*\)/, `${file} contains a Markdown image`);
    assert.doesNotMatch(content, /<img\b/i, `${file} contains an HTML image`);
  }
});
