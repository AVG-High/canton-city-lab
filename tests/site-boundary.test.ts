import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

function files(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(item => {
    const file = path.join(directory, item.name);
    return item.isDirectory() ? files(file) : [file.replaceAll('\\', '/')];
  });
}
test('online release contains only the website, approved NYC assets and licensed soundtrack', () => {
  const output = files('dist');
  const artwork = ['city-entry-preview.jpg', 'city-flight-office-preview.jpg', 'city-interior-preview.jpg', 'nyc-city-immersive-mobile.jpg', 'nyc-city-immersive.jpg', 'nyc-hero.jpg', 'nyc-waterfront-street.jpg', 'nyc-waterfront-street-mobile.jpg', 'nyc-building-lobby.jpg', 'nyc-building-lobby-mobile.jpg', 'nyc-office-arrival.jpg', 'nyc-office-arrival-mobile.jpg'];
  assert.deepEqual(output.filter(file => !file.startsWith('dist/assets/')).sort(), ['dist/favicon.svg', 'dist/index.html', 'dist/game/audio/new-york-skyline-203813.mp3', ...artwork.map(name => 'dist/game/new-york/' + name)].sort());
  assert.ok(output.filter(file => file.endsWith('.js')).length > 0);
  for (const file of output.filter(file => file.endsWith('.js'))) {
    const bundle = readFileSync(file, 'utf8');
    for (const privatePath of ['/api/', 'lab-entry.json', 'runtime-private.json', '127.0.0.1', 'localhost', 'GanacheProvider']) assert.equal(bundle.includes(privatePath), false, `${file} contains ${privatePath}`);
    assert.ok(bundle.includes('실제 원장 서버 미연결'));
    assert.ok(bundle.includes('REFERENCE_ONLY'));
  }
});
