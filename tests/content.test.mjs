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
  assert.match(config, /name: "cardName"/);
  assert.match(config, /name: "cardRoles"/);
  assert.doesNotMatch(config, /rich_text/);
  assert.doesNotMatch(config, /widget: "image"/);
});

test('the owner profile contains all public identity fields', async () => {
  const profile = await readFile(new URL('../src/content/profile.md', import.meta.url), 'utf8');
  for (const field of ['name', 'initials', 'cardName', 'cardRoles', 'role', 'tagline', 'shortBio', 'location', 'coordinates', 'status', 'current', 'topics', 'since', 'email', 'profileNumber', 'updatedAt']) {
    assert.match(profile, new RegExp(`^${field}:`, 'm'), `profile.md is missing ${field}`);
  }
  assert.match(profile, /^cardName:\s*["']?[^\r\n"']+["']?$/m);
  assert.match(profile, /^cardRoles:\r?\n(?:\s+-\s+.+\r?\n){4}/m);
  assert.doesNotMatch(profile, /!\[[^\]]*\]\([^)]*\)/);
  assert.doesNotMatch(profile, /<img\b/i);
});

test('the homepage orbit card is compact, animated, and driven by the owner profile', async () => {
  const [page, styles, script, tiltedCard, tiltedStyles, astroConfig, packageJson] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/home-orbits.css', import.meta.url), 'utf8'),
    readFile(new URL('../script.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/TiltedCard.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/TiltedCard.css', import.meta.url), 'utf8'),
    readFile(new URL('../astro.config.mjs', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);
  assert.match(page, /data-orbit-profile/);
  assert.match(page, /hero--orbit-only/);
  assert.match(page, /orbit-card-panel/);
  assert.doesNotMatch(page, /class="hero-copy"/);
  assert.match(page, /profile\.data\.name/);
  assert.match(page, /profile\.data\.topics/);
  assert.match(page, /My name is:/);
  assert.match(page, /I'm a:/);
  assert.match(page, /profile\.data\.cardName/);
  assert.match(page, /profile\.data\.cardRoles\.map/);
  assert.doesNotMatch(page, /orbit-card-panel__meta/);
  assert.match(page, /<TiltedCard[\s\S]*client:load/);
  assert.match(page, /rotateAmplitude=\{16\}/);
  assert.match(page, /scaleOnHover=\{1\.045\}/);
  assert.match(page, /containerWidth="310px"/);
  assert.match(page, /containerHeight="390px"/);
  assert.match(tiltedCard, /from 'motion\/react'/);
  assert.match(tiltedCard, /useSpring/);
  assert.match(tiltedCard, /onMouseMove=\{handleMouse\}/);
  assert.match(tiltedCard, /useReducedMotion/);
  assert.match(tiltedStyles, /perspective:\s*800px/);
  assert.match(tiltedStyles, /transform-style:\s*preserve-3d/);
  assert.match(astroConfig, /integrations:\s*\[react\(\)\]/);
  assert.match(packageJson, /"motion"/);
  assert.match(styles, /@keyframes profile-orbit-spin/);
  assert.match(styles, /@keyframes profile-orbit-counter/);
  assert.match(styles, /\.orbit-card-panel__prompt\s*\{[^}]*font:\s*700 20px\/1\.2 var\(--serif\)/);
  assert.match(styles, /\.orbit-card-panel__prompt--roles\s*\{[^}]*font-size:\s*25px/);
  assert.match(styles, /\.orbit-card-panel>strong\s*\{[^}]*font:\s*700 40px\/1 var\(--sans\)/);
  assert.match(styles, /\.orbit-card-panel li\s*\{[^}]*font:\s*500 15px\/1\.7 "Microsoft YaHei", "微软雅黑", sans-serif/);
  assert.match(styles, /scale\(1\.15\)/, 'desktop orbit composition should use the enlarged scale');
  for (const ring of ['outer', 'middle', 'inner']) {
    assert.match(styles, new RegExp(`body\\.light \\.orbit-circle--${ring}`), `light mode is missing the ${ring} orbit contrast rule`);
  }
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(script, /orbitalArt\.addEventListener\('pointermove'/);
});

test('the homepage opens with an accessible interactive curved text loop', async () => {
  const [page, component, styles] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/CurvedLoop.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/CurvedLoop.css', import.meta.url), 'utf8'),
  ]);

  assert.match(page, /<CurvedLoop[\s\S]*client:load/);
  assert.match(page, /marqueeText="Think ✦ Act ✦ Observe ✦"/);
  assert.match(page, /curveAmount=\{90\}/);
  assert.ok(page.indexOf('<CurvedLoop') < page.indexOf('class="hero hero--orbit-only"'));
  assert.match(component, /requestAnimationFrame/);
  assert.match(component, /document\.fonts\?\.ready\.then\(measure\)/);
  assert.match(component, /setPointerCapture/);
  assert.match(component, /prefers-reduced-motion: reduce/);
  assert.match(component, /role="img"/);
  assert.match(component, /aria-label=\{`\$\{marqueeText\}/);
  assert.doesNotMatch(component, /<img\b/i);
  assert.match(styles, /height:\s*clamp\(120px, 10vw, 150px\)/);
  assert.match(styles, /font-size:\s*clamp\(30px, 3vw, 42px\)/);
  assert.match(styles, /\.curved-loop-jacket\s*\{[\s\S]*?background:[\s\S]*?var\(--bg\)/);
  assert.match(styles, /border-bottom:\s*0/);
  assert.doesNotMatch(styles, /CURVED SIGNAL|DRAG TO SHIFT DIRECTION/);
  assert.match(styles, /body\.light \.curved-loop-jacket/);
  assert.doesNotMatch(styles, /radial-gradient\(circle at 50% 100%/);
  assert.match(styles, /fill:\s*#c8e671/);
  assert.match(styles, /@media \(max-width:\s*650px\)/);
});

test('the homepage presents published posts in the interactive recommended reading carousel', async () => {
  const [page, recommendedReading, carousel, carouselStyles, packageJson] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/RecommendedReading.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/FlexCarousel.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/RecommendedReading.css', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);

  assert.match(page, /class="recommendations-section"/);
  assert.match(page, /SELECTED NOTES/);
  assert.match(page, /推荐阅读/);
  assert.match(page, /<RecommendedReading client:load items=\{recommendedItems\}/);
  assert.match(page, /generated-field-note-/);
  assert.match(page, /coverMeta: `\$\{post\.data\.readingMinutes\} MIN READ/);
  assert.match(carousel, /createGeneratedCover/);
  assert.match(carousel, /background\.addColorStop\(0, '#e8f1cf'\)/);
  assert.match(carousel, /background\.addColorStop\(1, '#a9c47a'\)/);
  assert.match(carousel, /ctx\.fillStyle = '#1d2d19'/);
  assert.doesNotMatch(carousel, /ctx\.rotate\([^)]*Math\.PI/);
  assert.match(carousel, /ctx\.fillText\(title, 0, -28\)/);
  assert.match(carousel, /item\.coverMeta \|\| item\.subtitle/);
  assert.match(page, /href: `\/posts\/\$\{post\.id\}\//);
  assert.doesNotMatch(page, /class="featured-card"/);
  assert.doesNotMatch(page, /class="post-list"/);
  assert.match(recommendedReading, /preset="liquid"/);
  assert.match(recommendedReading, /intro="rise"/);
  assert.match(recommendedReading, /window\.location\.assign\(item\.href\)/);
  assert.match(carousel, /from 'ogl'/);
  assert.match(carousel, /aria-label=\{ariaLabel\}/);
  assert.match(carouselStyles, /\.recommended-reading\s*\{/);
  assert.match(carouselStyles, /backdrop-filter:\s*blur\(24px\) saturate\(125%\)/);
  assert.match(carouselStyles, /linear-gradient\(145deg, rgba\(255, 255, 255, \.34\), rgba\(223, 235, 205, \.16\) 72%\)/);
  assert.doesNotMatch(carouselStyles, /linear-gradient\(145deg, #151a16, #0d100e 72%\)/);
  assert.match(packageJson, /"ogl"/);
});

test('light mode gives the brand mark a high-contrast color', async () => {
  const styles = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(styles, /body\.light \.brand-mark\{[^}]*border-color:#5d7334;[^}]*color:#5d7334/);
  assert.match(styles, /body\.light \.brand-mark span\{[^}]*color:#5d7334/);
});

test('the homepage showcases open source projects with green MagicBento interactions', async () => {
  const [page, component, magicBento, magicStyles, styles, data, packageJson] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/OpenSourceProjects.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/MagicBento.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/MagicBento.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/open-source-projects.css', import.meta.url), 'utf8'),
    import(new URL('../src/data/open-source-projects.mjs', import.meta.url).href),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);

  assert.match(page, /<OpenSourceProjects \/>/);
  assert.match(component, /id="projects"/);
  assert.match(component, /aria-labelledby="projects-title"/);
  assert.match(component, /<MagicBento[\s\S]*client:load/);
  assert.match(component, /glowColor="183, 210, 103"/);
  assert.match(component, /enableStars=\{true\}/);
  assert.match(component, /enableSpotlight=\{true\}/);
  assert.match(component, /enableBorderGlow=\{true\}/);
  assert.match(component, /enableTilt=\{true\}/);
  assert.match(component, /enableMagnetism=\{true\}/);
  assert.doesNotMatch(component, /<img\b/i);
  assert.match(magicBento, /import gsap from 'gsap'/);
  assert.match(magicBento, /projects\.map/);
  assert.match(magicBento, /createParticleElement/);
  assert.match(magicBento, /GlobalSpotlight/);
  assert.match(magicBento, /prefers-reduced-motion: reduce/);
  assert.match(magicStyles, /rgba\(var\(--glow-color\), calc\(var\(--glow-intensity\) \* \.92\)\)/);
  assert.match(magicStyles, /\.magic-bento-spotlight/);
  assert.match(packageJson, /"gsap"/);
  assert.equal(data.openSourceProjects.length, 3);
  data.openSourceProjects.forEach((project) => {
    assert.ok(project.title);
    assert.ok(project.description);
    assert.ok(project.href);
    assert.ok(project.tags.length >= 3);
  });
  assert.match(styles, /grid-template-columns:\s*1\.35fr \.82fr \.82fr/);
  assert.match(styles, /\.project-card:hover article/);
  assert.match(styles, /body\.light \.open-source\s*\{/);
  assert.match(styles, /body\.light \.project-card:not\(\.project-card--featured\) article\s*\{/);
  assert.match(styles, /linear-gradient\(145deg, rgba\(255, 255, 255, \.68\), rgba\(211, 221, 195, \.48\)\)/);
  assert.match(magicStyles, /body\.light \.magic-bento-spotlight\s*\{[^}]*mix-blend-mode:\s*multiply/);
  assert.match(styles, /@media \(max-width:\s*650px\)/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test('the shared layout includes an accessible non-blocking BlobCursor trail', async () => {
  const [layout, component, styles, packageJson] = await Promise.all([
    readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/BlobCursor.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/BlobCursor.css', import.meta.url), 'utf8'),
    readFile(new URL('../package.json', import.meta.url), 'utf8'),
  ]);
  assert.match(layout, /<BlobCursor[\s\S]*client:load/);
  assert.match(layout, /fillColor="#b6d957"/);
  assert.match(layout, /trailCount=\{3\}/);
  assert.match(component, /import gsap from 'gsap'/);
  assert.match(component, /window\.addEventListener\('pointermove', handleMove/);
  assert.match(component, /aria-hidden="true"/);
  assert.match(styles, /\.blob-cursor-layer\s*\{[^}]*position:\s*fixed;[^}]*pointer-events:\s*none/);
  assert.match(styles, /body\.light \.blob-cursor-layer/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /pointer:\s*coarse/);
  assert.match(packageJson, /"gsap"/);
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
  assert.match(component, /viewBox="0 0 1200 420"/);
  assert.match(component, /class="time-stream__axis-label">AGE<\/p>/);
  assert.equal((component.match(/data-stream-target=/g) ?? []).length, 5);
  assert.equal((component.match(/aria-controls="stream-/g) ?? []).length, 5);
  assert.doesNotMatch(component, /class=\{`stream-layer[^>]*tabindex=/);
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
  assert.match(styles, /\[data-active-stream\][^{]*\.stream-layer\.is-active\s*\{[^}]*brightness\(1\.09\)[^}]*saturate\(1\.08\)/);
  assert.match(styles, /--stream-family:\s*#a8c75f/);
  assert.match(styles, /--stream-work:\s*#5d887f/);
  assert.match(styles, /body\.light \.time-stream\s*\{[^}]*--stream-work:\s*#70998d/);
  assert.match(styles, /\.stream-layer--family\.is-active\s*\{[^}]*brightness\(1\.02\)[^}]*saturate\(1\.02\)/);
  assert.doesNotMatch(styles, /\.stream-layer\.is-active\s*\{[^}]*translateY/);
  assert.doesNotMatch(styles, /\.stream-layer\.is-active\s*\{[^}]*drop-shadow/);
  assert.match(styles, /\.time-stream__legend button:hover/);
  assert.match(styles, /\.time-stream__legend button\s*\{[^}]*min-height:\s*44px;[^}]*padding:\s*11px 18px;[^}]*font:\s*11px var\(--mono\)/);
  assert.match(styles, /\.time-stream__legend i\s*\{[^}]*width:\s*10px;[^}]*height:\s*10px/);
  assert.match(styles, /\.time-stream__header\s*\{[^}]*max-width:\s*1240px/);
  assert.match(styles, /\.time-stream__chart\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*none/);
  assert.match(styles, /\.time-stream__axis-label\s*\{[^}]*text-align:\s*center;[^}]*letter-spacing:\s*\.32em/);
  assert.doesNotMatch(styles, /#263020/);
  assert.match(styles, /body\.light \.time-stream/);
  assert.match(styles, /prefers-reduced-motion/);
  assert.match(script, /\.time-stream__chart/);
  assert.match(script, /control\.addEventListener\('pointerenter',activateStream\)/);
  assert.match(script, /control\.addEventListener\('pointerleave',resetStream\)/);
  assert.doesNotMatch(script, /control\.addEventListener\('(?:focus|blur)'/);
  assert.doesNotMatch(styles, /\.stream-layer:focus/);
  assert.match(script, /document\.getElementById\(targetId\)/);
  assert.doesNotMatch(script, /activeLayer\.parentElement\?\.append/);
});

test('published Markdown posts do not contain image syntax', async () => {
  const files = (await readdir(postsDirectory)).filter((file) => file.endsWith('.md'));
  for (const file of files) {
    const content = await readFile(new URL(file, postsDirectory), 'utf8');
    assert.doesNotMatch(content, /!\[[^\]]*\]\([^)]*\)/, `${file} contains a Markdown image`);
    assert.doesNotMatch(content, /<img\b/i, `${file} contains an HTML image`);
  }
});
