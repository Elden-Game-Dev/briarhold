const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const page = read('site/index.html');
for (const match of page.matchAll(/(?:src|href)="([^"#]+)"/g)) {
  if (!/^https?:/.test(match[1])) assert(fs.existsSync(path.join(root, 'site', match[1])), 'Missing relative asset: ' + match[1]);
}
for (const name of ['game.js', 'renderer.js']) new vm.Script(read('site/' + name));
assert(!read('site/game.js').includes('window.Briarhold='), 'Development hook leaked');
assert.equal(read('site/renderer.js'), read('game/renderer.js'), 'Renderer changed');
assert.equal(read('site/style.css'), read('game/style.css'), 'Style changed');
assert.equal(read('site/game.js'), read('game/game.js').split('// A small local test hook')[0] + '})();', 'Gameplay changed');
assert(page.includes('rel="canonical"') && page.includes('og:image') && page.includes('name="description"'));
JSON.parse(page.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
const workflow = read('.github/workflows/publish.yml');
assert(workflow.includes('workflow_dispatch:') && !/^\s+(push|pull_request|schedule):/m.test(workflow), 'Deployment must be manual');
const standalone = read('itch-build/index.html');
assert.equal(standalone, read('game/Play Briarhold.html'));
assert(!/<script[^>]+src=/.test(standalone));
console.log('PASS relative assets, JavaScript, metadata, unchanged gameplay/art, standalone itch upload and manual-only deployment.');
