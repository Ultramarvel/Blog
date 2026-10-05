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
  for (const field of ['name', 'cardName', 'cardRoles', 'role', 'tagline', 'shortBio', 'location', 'coordinates', 'status', 'current', 'topics', 'since', 'email', 'profileNumber', 'updatedAt']) {
    assert.match(profile, new RegExp(`^${field}:`, 'm'), `profile.md is missing ${field}`);
  }
  assert.match(profile, /^cardName:\s*["']?[^\r\n"']+["']?$/m);
  assert.match(profile, /^cardRoles:\r?\n(?:\s+-\s+.+\r?\n){4}/m);
  assert.doesNotMatch(profile, /!\[[^\]]*\]\([^)]*\)/);
  assert.doesNotMatch(profile, /<img\b/i);
});

test('profile planets do not render text in their center', async () => {
  const [home, about, styles] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/about/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/profile.css', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(home, /profile\.data\.initials/);
  assert.doesNotMatch(about, /profile\.data\.initials/);
  assert.doesNotMatch(styles, /\.profile-sigil(?:--large)? strong/);
});

test('light mode uses a readable mid-tone green for profile labels', async () => {
  const styles = await readFile(new URL('../src/styles/profile.css', import.meta.url), 'utf8');
  assert.match(styles, /body\.light \.profile-preview__topline span:first-child[^\n]*body\.light \.profile-kicker[^\n]*\{color:#58702f!important\}/);
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
  assert.doesNotMatch(page, /OBSERVATION No\. 026|label-top/);
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
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*?\.orbit-card-tilt\s*\{\s*--orbit-card-scale: 1\.15/, 'mobile profile card should be enlarged independently of the orbit artwork');
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*?\.orbit-card-panel li\s*\{\s*font-size: 18px;\s*line-height: 1\.55;/, 'mobile profile roles should use a larger readable type size');
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*?\.hero--orbit-only\s*\{\s*min-height: 460px;\s*padding-bottom: 10px;\s*overflow: hidden;[\s\S]*?\.hero--orbit-only \.label-bottom\s*\{\s*display: none;[\s\S]*?\.hero--orbit-only \.hero-index\s*\{\s*bottom: 12px;/, 'mobile orbit should stay inside its section while the article section begins below it');
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*?\.hero--orbit-only \.label-bottom\s*\{\s*display: none;/, 'mobile should hide the orbit coordinate label so it no longer overlaps the profile card');
  assert.match(page, /class="art-label label-bottom"/, 'the orbit coordinate label should still render on larger viewports');
  assert.match(styles, /@media \(max-width: 600px\)[\s\S]*?\.hero--orbit-only \.hero-art--circles\s*\{\s*height: 305px;/, 'mobile orbit art height should override the desktop two-class selector');
  assert.match(styles, /@media \(min-width: 851px\)[\s\S]*?\.hero--orbit-only\s*\{\s*min-height: 716px;\s*padding-bottom: 8px;[\s\S]*?\.hero--orbit-only \.label-bottom\s*\{\s*bottom: 91px;/, 'desktop orbit metadata and the following divider should move upward together');
  assert.match(styles, /--outer-orbit-size: min\(620px, calc\(\(100vw - 8px\) \* 1\.4706\)\)/, 'mobile outer orbit should grow responsively without exceeding the viewport');
  assert.match(styles, /\.orbit-circle--outer,\s*\.orbit-carrier--idea\s*\{[^}]*width: var\(--outer-orbit-size\);[^}]*height: var\(--outer-orbit-size\)/s, 'outer orbit ring and its badge carrier should stay aligned');
  assert.match(styles, /\.orbit-carrier\s*\{[^}]*z-index:\s*2;/, 'orbiting badges must stay behind the profile card');
  assert.match(styles, /\.orbit-carrier\s*\{[^}]*pointer-events:\s*none;/, 'the wide orbit rings must not swallow pointer events aimed at the profile card');
  assert.match(styles, /\.orbit-card-tilt\s*\{[^}]*z-index:\s*5;/, 'the profile card must stay above the orbiting badges');
  assert.doesNotMatch(styles, /\.orbit-carrier--(?:field|signal)\s*\{[^}]*display:\s*none/, 'all three orbiting badges must keep rendering');
  assert.match(styles, /\.orbit-card-panel__prompt\s*\{[^}]*font:\s*700 20px\/1\.2 var\(--serif\)/);
  assert.match(styles, /\.orbit-card-panel__prompt--roles\s*\{[^}]*font-size:\s*25px/);
  assert.match(styles, /\.orbit-card-panel>strong\s*\{[^}]*font:\s*700 40px\/1 var\(--sans\)/);
  assert.match(styles, /\.orbit-card-panel li\s*\{[^}]*font:\s*500 15px\/1\.7 "Microsoft YaHei", "微软雅黑", sans-serif/);
  assert.match(styles, /scale\(1\.15\)/, 'desktop orbit composition should use the enlarged scale');
  assert.ok(styles.includes('transform: scale(.88) translate3d(calc(var(--detail-x) - 125px), calc(var(--detail-y) - 200px), 0);'), 'narrow tablet orbit should remain centered and move upward in the viewport');
  assert.ok(styles.includes('transform: scale(.68) translate3d(calc(var(--detail-x) - 175px), calc(var(--detail-y) - 185px), 0);'), 'mobile orbit and card should remain centered and sit fully inside the first section');
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
  const [page, recommendedReading, carousel, flexCarouselStyles, carouselStyles, packageJson] = await Promise.all([
    readFile(new URL('../src/pages/index.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/RecommendedReading.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/FlexCarousel.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/FlexCarousel.css', import.meta.url), 'utf8'),
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
  assert.match(flexCarouselStyles, /touch-action:\s*pan-y pinch-zoom/);
  assert.match(flexCarouselStyles, /overscroll-behavior-x:\s*contain/);
  assert.match(flexCarouselStyles, /overscroll-behavior-y:\s*auto/);
  assert.doesNotMatch(flexCarouselStyles, /overscroll-behavior:\s*contain/);
  assert.match(carousel, /Math\.abs\(dy\) > slop && Math\.abs\(dy\) > Math\.abs\(dx\)/);
  assert.match(carouselStyles, /\.recommended-reading\s*\{/);
  assert.match(carouselStyles, /backdrop-filter:\s*blur\(24px\) saturate\(125%\)/);
  assert.match(carouselStyles, /linear-gradient\(145deg, rgba\(255, 255, 255, \.34\), rgba\(223, 235, 205, \.16\) 72%\)/);
  assert.match(carouselStyles, /body:not\(\.light\) \.recommendations-section\s*\{/);
  assert.match(carouselStyles, /body:not\(\.light\) \.recommended-reading\s*\{[^}]*linear-gradient\(145deg, rgba\(39, 48, 39, \.88\), rgba\(20, 26, 22, \.94\) 72%\)/);
  assert.match(carouselStyles, /body:not\(\.light\) \.recommended-reading canvas\s*\{\s*filter:\s*brightness\(\.68\) saturate\(\.84\)/);
  assert.match(carouselStyles, /body:not\(\.light\) \.recommended-reading__carousel \.flex-carousel__caption\s*\{\s*color:\s*#f0f1e9/);
  assert.match(carouselStyles, /@media \(max-width: 700px\)[\s\S]*?\.recommendations-section\s*\{\s*padding: 28px 5% 78px;/, 'mobile recommendations should begin close to the preceding orbit section');
  assert.match(packageJson, /"ogl"/);
});

test('light mode gives the brand mark a high-contrast color', async () => {
  const styles = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
  assert.match(styles, /body\.light \.brand-mark\{[^}]*border-color:#5d7334;[^}]*color:#5d7334/);
  assert.match(styles, /body\.light \.brand-mark span\{[^}]*color:#5d7334/);
});

test('light mode keeps article summary and list markers clearly visible', async () => {
  const styles = await readFile(new URL('../article.css', import.meta.url), 'utf8');
  assert.match(styles, /\.article-page\.light\s*\{[\s\S]*?--article-muted: #5c625c;[\s\S]*?--article-green-deep: #5b7a5a;/);
  assert.match(styles, /\.article-deck\s*\{[\s\S]*?background: var\(--article-soft\);[\s\S]*?color: var\(--article-green-deep\);/);
  assert.match(styles, /\.prose li::marker\s*\{[\s\S]*?color: var\(--article-green-deep\);[\s\S]*?font-size: \.9em;/);
});

test('article section headings do not receive automatic number labels', async () => {
  const styles = await readFile(new URL('../article.css', import.meta.url), 'utf8');
  assert.doesNotMatch(styles, /counter-reset:article-section/);
  assert.doesNotMatch(styles, /counter-increment:article-section/);
  assert.doesNotMatch(styles, /counter\(article-section/);
});

test('article typography uses Microsoft YaHei with cross-platform fallbacks', async () => {
  const styles = await readFile(new URL('../article.css', import.meta.url), 'utf8');
  assert.match(styles, /--serif: 'Microsoft YaHei', '微软雅黑', 'PingFang SC', 'Noto Sans SC', sans-serif;/);
});

test('article pages do not render a generated cover illustration', async () => {
  const [layout, styles] = await Promise.all([
    readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../article.css', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(layout, /article-cover|GENERATED COVER/);
  assert.doesNotMatch(styles, /article-cover|cover-grid|cover-disc|cover-ring/);
});

test('article pages do not render the author profile card', async () => {
  const [layout, styles] = await Promise.all([
    readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../article.css', import.meta.url), 'utf8'),
  ]);
  assert.doesNotMatch(layout, /author-card|author-avatar|更多关于/);
  assert.doesNotMatch(styles, /author-card|author-avatar/);
});

test('the next article card uses a balanced horizontal layout', async () => {
  const [layout, styles] = await Promise.all([
    readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../article.css', import.meta.url), 'utf8'),
  ]);
  assert.match(layout, /CONTINUE READING \/ 下一篇/);
  assert.match(layout, /class="next-article__arrow" aria-hidden="true">↗<\/span>/);
  assert.match(styles, /\.next-article\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\) 46px;/);
  assert.match(styles, /\.next-article__copy strong\s*\{[^}]*clamp\(17px, 2vw, 21px\)/);
  assert.match(styles, /\.next-article__arrow\s*\{[^}]*border-radius: 50%/);
});

test('article pages use a reading column with a card-style table of contents', async () => {
  const [layout, page, styles, script] = await Promise.all([
    readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/pages/posts/[...slug].astro', import.meta.url), 'utf8'),
    readFile(new URL('../article.css', import.meta.url), 'utf8'),
    readFile(new URL('../article.js', import.meta.url), 'utf8'),
  ]);
  assert.match(layout, /class="article-main"/);
  assert.match(layout, /class="article-header-tags"/);
  assert.match(layout, /class="article-header-rule"/);
  assert.match(layout, /class="toc-list"/);
  assert.match(layout, /toc-link--h\$\{heading\.depth\}/);
  assert.match(page, /heading\.depth === 2 \|\| heading\.depth === 3/);
  assert.match(styles, /grid-template-columns: minmax\(0, var\(--reading-width\)\) 240px;/);
  assert.match(styles, /\.toc\s*\{[\s\S]*?position: sticky;[\s\S]*?border-radius: 16px;[\s\S]*?background: var\(--article-card\);/);
  assert.match(script, /const updateTableOfContents = \(\) =>/);
  assert.match(script, /document\.getElementById\(decodeURIComponent\(link\.hash\.slice\(1\)\)\)/);
  assert.doesNotMatch(script, /document\.querySelector\(link\.getAttribute\('href'\)\)/);
  assert.match(script, /getBoundingClientRect\(\)\.top <= activationLine/);
  assert.match(script, /item\.link\.addEventListener\('click'/);
  assert.match(script, /setActiveTocItem\(item\)/);
  assert.match(script, /link\.classList\.toggle\('current', isActive\)/);
  assert.match(script, /link\.setAttribute\('aria-current', 'location'\)/);
  assert.match(script, /addEventListener\('scroll', requestPageUpdate, \{ passive: true \}\)/);
  assert.doesNotMatch(script, /IntersectionObserver/);
});

test('article title metadata only shows the date, reading time, and live view count', async () => {
  const [layout, baseLayout] = await Promise.all([
    readFile(new URL('../src/layouts/ArticleLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8'),
  ]);
  const meta = layout.match(/<div class="article-meta">([\s\S]*?)<\/div>/)?.[1] ?? '';

  assert.match(meta, /<time datetime=\{dateISO\}>\{dateChinese\}<\/time>/);
  assert.match(meta, /\{data\.readingMinutes\} 分钟/);
  assert.doesNotMatch(meta, /分钟阅读/);
  assert.match(meta, /id="busuanzi_page_pv">--<\/span> 阅读/);
  assert.doesNotMatch(meta, /data\.author|data\.location/);
  assert.match(baseLayout, /https:\/\/cdn\.busuanzi\.cc\/busuanzi\/3\.6\.9\/busuanzi\.min\.js/);
});

test('the site footer exposes live total visits and unique visitors', async () => {
  const [layout, styles] = await Promise.all([
    readFile(new URL('../src/layouts/BaseLayout.astro', import.meta.url), 'utf8'),
    readFile(new URL('../styles.css', import.meta.url), 'utf8'),
  ]);

  assert.match(layout, /id="busuanzi_site_pv">--<\/span>/);
  assert.match(layout, /id="busuanzi_site_uv">--<\/span>/);
  assert.match(layout, /class="footer-stats" aria-label="网站访问统计"/);
  assert.match(styles, /\.footer-stats\{color:var\(--muted\)\}/);
  assert.doesNotMatch(layout, /写给仍然好奇的人|footer-star/);
  assert.match(styles, /@media\(max-width:600px\)\{\s*\.footer>\.footer-meta\{display:flex;/);
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
  assert.match(styles, /\.project-card li\s*\{[^}]*font: 11px var\(--mono\)/);
  assert.match(styles, /\.project-card__copy>p:last-child\s*\{[^}]*font: 14px\/1\.85 var\(--serif\)/);
  assert.match(styles, /\.project-card ul\s*\{[^}]*gap: 8px/);
  assert.match(styles, /\.project-card ul\s*\{[^}]*padding: 30px 118px 0 0/);
  assert.match(styles, /\.project-card__action\s*\{[^}]*font: 11px var\(--mono\)/);
  assert.match(styles, /\.project-card:hover article/);
  assert.match(styles, /body\.light \.open-source\s*\{/);
  assert.match(styles, /body\.light \.project-card:not\(\.project-card--featured\) article\s*\{/);
  assert.match(styles, /linear-gradient\(145deg, rgba\(255, 255, 255, \.68\), rgba\(211, 221, 195, \.48\)\)/);
  assert.match(magicStyles, /body\.light \.magic-bento-spotlight\s*\{[^}]*mix-blend-mode:\s*multiply/);
  assert.match(styles, /@media \(max-width:\s*650px\)/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
});

test('the open source showcase presents the EduFlow and FlyCode repositories', async () => {
  const [data, magicBento, readme] = await Promise.all([
    import(new URL('../src/data/open-source-projects.mjs', import.meta.url).href),
    readFile(new URL('../src/components/MagicBento.jsx', import.meta.url), 'utf8'),
    readFile(new URL('../README.md', import.meta.url), 'utf8'),
  ]);

  const byTitle = new Map(data.openSourceProjects.map((project) => [project.title, project]));
  const expected = {
    EduFlow: 'https://github.com/Ultramarvel/EduFlow',
    FlyCode: 'https://github.com/Ultramarvel/FlyCode',
  };

  for (const [title, href] of Object.entries(expected)) {
    const project = byTitle.get(title);
    assert.ok(project, `the showcase should include the ${title} project`);
    assert.equal(project.href, href, `${title} should link to its GitHub repository`);
    assert.equal(project.action, '查看仓库', `${title} should offer a repository action`);
    assert.equal(project.featured, false, `${title} should not take the featured slot`);
    assert.ok(project.englishTitle, `${title} needs an English kicker`);
    assert.ok(project.description.length >= 20, `${title} needs a descriptive summary`);
  }

  assert.ok(byTitle.get('EduFlow').tags.includes('Python'));
  assert.equal(
    byTitle.get('EduFlow').description,
    '面向在线教育场景的智能客服系统，提供课程咨询、技术故障解决、课程售后等功能。',
    'EduFlow should describe its online education support capabilities',
  );
  assert.ok(byTitle.get('FlyCode').tags.includes('Java'));

  assert.deepEqual(
    data.openSourceProjects.map((project) => project.title),
    ['林间信号', 'EduFlow', 'FlyCode'],
    'the showcase should keep the blog plus the two repositories',
  );

  const readmeIntro = readme
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('一个全栈个人博客系统'));
  assert.ok(readmeIntro, 'README should keep the site summary sentence');
  assert.equal(
    byTitle.get('林间信号').description,
    readmeIntro,
    'the blog card description should match the README summary verbatim',
  );

  assert.match(magicBento, /const externalLink = \/\^https\?:\\\/\\\/\//);
  assert.match(magicBento, /target: '_blank', rel: 'noreferrer noopener'/);
  assert.match(magicBento, /\{\.\.\.externalLink\}/);
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
  assert.ok(
    page.indexOf('<OpenSourceProjects />') < page.indexOf('<TimeStream />'),
    'the time stream should appear after the open source projects on every viewport',
  );
  assert.match(component, /时间流向哪里？/);
  assert.match(component, /streamBands\.map/);
  assert.match(component, /viewBox="0 0 1200 420"/);
  assert.match(component, /preserveAspectRatio="none"/);
  assert.match(component, /class="time-stream__mobile-labels" aria-hidden="true"/);
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
  const mobileLabels = new Map(geometry.streamBands.map((layer) => [layer.key, layer]));
  assert.equal(mobileLabels.get('movement').label, '音乐 / 运动');
  assert.equal(mobileLabels.get('work').label, '编程 / 工作');
  assert.ok(mobileLabels.get('movement').mobileX < mobileLabels.get('movement').x, 'the mobile movement label should shift left');
  assert.ok(mobileLabels.get('work').mobileX < mobileLabels.get('work').x, 'the mobile work label should shift left');
  assert.ok(mobileLabels.get('game').mobileX > mobileLabels.get('game').x, 'the mobile game label should shift right');
  ['movement', 'game', 'work'].forEach((key) => {
    const layerIndex = geometry.streamBands.findIndex((layer) => layer.key === key);
    const layer = geometry.streamBands[layerIndex];
    const upperY = geometry.sampleBoundaryY(geometry.streamBoundaries[layerIndex], layer.mobileX);
    const lowerY = geometry.sampleBoundaryY(geometry.streamBoundaries[layerIndex + 1], layer.mobileX);
    const centerY = (upperY + lowerY) / 2;
    assert.ok(Math.abs(layer.mobileY - centerY) < 2, `${key} mobile label should sit at the center of its stream`);
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
  assert.match(styles, /\.time-stream__axis-label\s*\{[^}]*width:\s*max-content;[^}]*margin:\s*11px auto -4px;[^}]*transform:\s*translateX\(22px\);[^}]*font:\s*600 13px var\(--mono\);[^}]*letter-spacing:\s*\.32em/);
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.time-stream\s*\{\s*margin-top:\s*0;/, 'the mobile time stream should remain below the open source cards');
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.time-stream__axis-label\s*\{[^}]*transform:\s*translateX\(0\);/, 'the mobile AGE label should be visually centered');
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.time-stream__svg\s*\{[^}]*min-width:\s*0;[^}]*height:\s*min\(88vw, 420px\);/, 'the complete stream chart should fit in the mobile card without horizontal scrolling');
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.time-stream__canvas\s*\{[^}]*overflow:\s*hidden;/, 'the mobile stream chart should not scroll horizontally');
  assert.match(styles, /@media \(max-width: 700px\)[\s\S]*?\.time-stream__legend\s*\{[^}]*justify-content:\s*center;/, 'the mobile legend should wrap around the visual center');
  assert.match(styles, /\.time-stream__mobile-labels span\s*\{[^}]*transform:\s*translate\(-50%, -50%\);/, 'mobile labels should be centered on their data coordinates');
  assert.doesNotMatch(styles, /\.time-stream\s*\{[^}]*margin-top:\s*-[\d.]+px;/, 'the time stream must not overlap the preceding section');
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
