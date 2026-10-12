const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('C:/Users/USER/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const art = __dirname;
const workspace = path.resolve(art, '../../../../..');
const original = path.resolve(art, '../../..');
const hosted = path.join(workspace, 'sites/canton-city-lab');
const scenes = ['nyc-city-immersive', 'nyc-waterfront-street', 'nyc-building-lobby', 'nyc-office-arrival'];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
async function run() {
  if (!fs.existsSync(path.join(hosted, '.openai/hosting.json'))) throw new Error('Wrong workspace');
  const manifest = { mode: 'built-in ImageGen edit; Sharp delivery resize and JPEG encoding only', nativeResolution: '1672x941', note: '4K delivery is Lanczos3 resampling, not native 4K generation. No added sharpening or blur.', sources: [], deliveries: [] };
  for (const name of scenes) {
    const source = path.join(art, name + '-source.png');
    const meta = await sharp(source).metadata();
    manifest.sources.push({ name, width: meta.width, height: meta.height, bytes: fs.statSync(source).size, sha256: hash(source) });
    for (const mobile of [false, true]) {
      const filename = name + (mobile ? '-mobile' : '') + '.jpg';
      const out = path.join(original, 'public/game/new-york', filename);
      const backup = path.join(art, 'previous-web-assets', filename);
      fs.mkdirSync(path.dirname(backup), { recursive: true });
      if (!fs.existsSync(backup)) fs.copyFileSync(out, backup);
      await sharp(source).resize(mobile ? 1920 : 3840, mobile ? 1080 : 2160, { fit: 'cover', kernel: 'lanczos3' }).jpeg({ quality: mobile ? 92 : 95, chromaSubsampling: '4:4:4', progressive: true }).toFile(out);
      const destination = path.join(hosted, 'public/game/new-york', filename);
      fs.copyFileSync(out, destination);
      if (hash(out) !== hash(destination)) throw new Error('Copy mismatch ' + filename);
      const delivered = await sharp(out).metadata();
      manifest.deliveries.push({ filename, width: delivered.width, height: delivered.height, quality: mobile ? 92 : 95, chromaSubsampling: '4:4:4', bytes: fs.statSync(out).size, sha256: hash(out), matchingProjects: true });
    }
  }
  const fallback = path.join(original, 'public/game/new-york/nyc-hero.jpg');
  const backup = path.join(art, 'previous-web-assets/nyc-hero.jpg');
  if (!fs.existsSync(backup)) fs.copyFileSync(fallback, backup);
  await sharp(path.join(art, 'nyc-city-immersive-source.png')).resize(1920, 1080, { fit: 'cover', kernel: 'lanczos3' }).jpeg({ quality: 95, chromaSubsampling: '4:4:4', progressive: true }).toFile(fallback);
  const hostedFallback = path.join(hosted, 'public/game/new-york/nyc-hero.jpg');
  fs.copyFileSync(fallback, hostedFallback);
  manifest.deliveries.push({ filename: 'nyc-hero.jpg', width: 1920, height: 1080, quality: 95, chromaSubsampling: '4:4:4', bytes: fs.statSync(fallback).size, sha256: hash(fallback), matchingProjects: hash(fallback) === hash(hostedFallback) });
  fs.writeFileSync(path.join(art, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest, null, 2));
}
run().catch(error => { console.error(error); process.exitCode = 1; });
