// No dependencies or network requests. The game stays unchanged; metadata is added at build time.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const supplied = process.env.SITE_URL || 'http://127.0.0.1:8769/briarhold/';
const url = new URL(supplied);
if (!['http:', 'https:'].includes(url.protocol) || url.search || url.hash || url.username || url.password) throw Error('Invalid SITE_URL');
const base = url.href.replace(/\/+$/, '') + '/';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const out = path.join(root, 'site');
fs.mkdirSync(out, { recursive: true });
const write = (name, data) => fs.writeFileSync(path.join(out, name), data);
const description = 'Explore a colourful 3D storybook valley, wield your sword, recover three Dawn Sigils and awaken a sleeping castle. Play The Beacon of Briarhold free in your browser.';
const schema = { '@context': 'https://schema.org', '@type': 'VideoGame', name: 'The Beacon of Briarhold', url: base, description, image: base + 'share.png', genre: ['Adventure', 'Action'], playMode: 'SinglePlayer', gamePlatform: 'Web browser', operatingSystem: 'Any desktop OS with a WebGL 2 browser', applicationCategory: 'Game', inLanguage: 'en', isAccessibleForFree: true };
const metadata = `
<meta name="google-site-verification" content="G0c_miltWJTqBtnTOzZiFGXgIOxALAMu8-KrGwl8kk4">
<meta name="description" content="${description}">
<meta name="theme-color" content="#183b40">
<link rel="canonical" href="${escape(base)}">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="sitemap" type="application/xml" href="sitemap.xml">
<meta property="og:type" content="website">
<meta property="og:title" content="The Beacon of Briarhold — A 3D Browser Adventure">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${escape(base)}">
<meta property="og:site_name" content="The Beacon of Briarhold">
<meta property="og:image" content="${escape(base)}share.png">
<meta property="og:image:width" content="1280"><meta property="og:image:height" content="720">
<meta property="og:image:alt" content="The Beacon of Briarhold title screen overlooking its 3D castle and valley">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="The Beacon of Briarhold">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${escape(base)}share.png">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>
`;
let html = read('game/index.html').replace('<title>The Beacon of Briarhold</title>', '<title>The Beacon of Briarhold | Free 3D Browser Adventure</title>');
html = html.replace('</head>', metadata + '</head>');
html = html.replace('An original world. Yours to explore.', 'An original world. Yours to explore. <a href="about.html" style="color:inherit">About &amp; controls</a>');
html = html.replace('<body>', '<body>\n<noscript>This game requires JavaScript and a WebGL 2 browser. <a href="about.html">Read about The Beacon of Briarhold and its controls.</a></noscript>');
write('index.html', html);
for (const file of ['style.css', 'renderer.js']) write(file, read('game/' + file));
const game = read('game/game.js');
const marker = game.indexOf('// A small local test hook');
if (marker < 0) throw Error('Review the game export: development hook marker missing');
write('game.js', game.slice(0, marker) + '})();');
write('about.html', read('web/about.html').replaceAll('{{BASE}}', escape(base)));
write('favicon.svg', read('web/favicon.svg'));
fs.copyFileSync(path.join(root, 'media/share.png'), path.join(out, 'share.png'));
write('.nojekyll', '');
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escape(base)}</loc></url><url><loc>${escape(base)}about.html</loc></url></urlset>\n`);
// On project Pages, /briarhold/robots.txt cannot control the origin's /robots.txt.
// No robots file is needed to allow crawling. Only emit one for an origin-root site.
if (url.pathname === '/') write('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${base}sitemap.xml\n`);
write('release.json', JSON.stringify({ commit: process.env.RELEASE_COMMIT || 'local-preview', url: base, sourceHashes: JSON.parse(read('source-hashes.json')) }, null, 2));
fs.mkdirSync(path.join(root, 'itch-build'), { recursive: true });
// itch.io accepts this original, completely standalone HTML file directly.
fs.copyFileSync(path.join(root, 'game/Play Briarhold.html'), path.join(root, 'itch-build/index.html'));
console.log('Prepared static site for ' + base + ' and standalone itch.io upload. Nothing published.');
