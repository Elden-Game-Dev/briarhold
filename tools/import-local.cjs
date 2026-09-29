// Copy only the known game files. This prepares a release; it NEVER publishes.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const source = path.resolve(process.argv[2] || path.join(root, '../briarhold'));
const names = ['index.html', 'style.css', 'renderer.js', 'game.js', 'Play Briarhold.html', 'READ ME.txt'];
// Read all files before changing anything, so a missing input cannot give a partial import.
const files = names.map(name => [name, fs.readFileSync(path.join(source, name))]);
fs.mkdirSync(path.join(root, 'game'), { recursive: true });
const hashes = {};
for (const [name, data] of files) {
  fs.writeFileSync(path.join(root, 'game', name), data);
  hashes[name] = crypto.createHash('sha256').update(data).digest('hex');
}
fs.writeFileSync(path.join(root, 'source-hashes.json'), JSON.stringify(hashes, null, 2) + '\n');
console.log('Imported current local game. Nothing was pushed or published.');
