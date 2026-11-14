// معالجة الصور الخام: ملصقات 2:3 + خلفيات + أيقونات PWA
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ROOT = '/home/z/my-project';
const RAW = path.join(ROOT, 'public/raw');
const POSTERS = path.join(ROOT, 'public/posters');
const BACKDROPS = path.join(ROOT, 'public/backdrops');
const ICONS = path.join(ROOT, 'public/icons');
for (const d of [POSTERS, BACKDROPS, ICONS]) fs.mkdirSync(d, { recursive: true });

const GRADIENTS = [
  ['#0f3d2a', '#00d26a'],
  ['#3d320f', '#e8b923'],
  ['#12333d', '#2dd4bf'],
  ['#3d1f2e', '#ff6b6b'],
];

function fallbackPoster(i, slug) {
  const [c1, c2] = GRADIENTS[i % GRADIENTS.length];
  const svg = `<svg width="768" height="1152" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="768" height="1152" fill="url(#g)"/>
    <circle cx="384" cy="480" r="190" fill="rgba(0,0,0,0.25)"/>
    <path d="M334 380v200c0 14 15.5 22.4 27.4 14.8l152-100c11-7.2 11-22.4 0-29.6l-152-100C349.5 357.6 334 366 334 380Z" fill="rgba(255,255,255,0.85)"/>
    <text x="384" y="800" font-family="sans-serif" font-size="34" font-weight="bold" fill="rgba(255,255,255,0.75)" text-anchor="middle">${slug}</text>
  </svg>`;
  return sharp(Buffer.from(svg)).jpeg({ quality: 82 }).toFile(path.join(POSTERS, `${slug}.jpg`));
}

async function main() {
  // ===== الملصقات =====
  const rawFiles = fs.readdirSync(RAW).filter((f) => f.startsWith('poster-') && f.endsWith('.png'));
  let i = 0;
  for (const f of rawFiles) {
    const slug = f.replace(/^poster-/, '').replace(/\.png$/, '');
    const out = path.join(POSTERS, `${slug}.jpg`);
    if (fs.existsSync(out)) continue;
    try {
      await sharp(path.join(RAW, f))
        .resize(768, 1152, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toFile(out);
      console.log(`poster  ${slug}.jpg`);
    } catch (e) {
      console.log(`poster FAIL ${slug}: ${e.message}`);
      await fallbackPoster(i++, slug);
    }
  }

  // ملصقات ناقصة → بديل متدرج
  const EXPECTED = [
    'big-buck-bunny', 'sintel', 'tears-of-steel', 'elephants-dream', 'bipbop-showcase', 'open-worlds',
    'thil-al-sahra', 'layali-alger', 'qilat-al-riyah', 'al-wisam-al-maksour', 'tareeq-al-hareer',
    'hams-al-janoub', 'saif-al-fajr', 'madinat-al-nujum', 'rihlat-al-akhira', 'the-last-signal',
    'midnight-runners', 'echoes-of-tomorrow',
  ];
  for (const slug of EXPECTED) {
    const out = path.join(POSTERS, `${slug}.jpg`);
    if (!fs.existsSync(out)) {
      await fallbackPoster(i++, slug);
      console.log(`poster  ${slug}.jpg (fallback)`);
    }
  }

  // ===== الخلفيات =====
  const backdrops = fs.readdirSync(RAW).filter((f) => f.startsWith('backdrop-') && f.endsWith('.png'));
  for (const f of backdrops) {
    const slug = f.replace(/^backdrop-/, '').replace(/\.png$/, '');
    const out = path.join(BACKDROPS, `${slug}.jpg`);
    if (fs.existsSync(out)) continue;
    await sharp(path.join(RAW, f)).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    console.log(`backdrop ${slug}.jpg`);
  }

  // ===== الأيقونات =====
  const iconRaw = path.join(RAW, 'icon.png');
  await sharp(iconRaw).resize(512, 512, { fit: 'cover' }).png().toFile(path.join(ICONS, 'icon-512.png'));
  await sharp(iconRaw).resize(192, 192, { fit: 'cover' }).png().toFile(path.join(ICONS, 'icon-192.png'));
  await sharp(iconRaw).resize(180, 180, { fit: 'cover', background: '#070b09' }).flatten({ background: '#070b09' }).png().toFile(path.join(ICONS, 'apple-touch-icon.png'));
  // maskable: تصغير الأيقونة مع خلفية وهوامش (منطقة أمان 80%)
  const iconBuffer = await sharp(iconRaw).resize(400, 400, { fit: 'cover' }).png().toBuffer();
  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 7, g: 11, b: 9, alpha: 1 } },
  })
    .composite([{ input: iconBuffer, gravity: 'center' }])
    .png()
    .toFile(path.join(ICONS, 'maskable-512.png'));
  // favicon
  await sharp(iconRaw).resize(48, 48, { fit: 'cover' }).png().toFile(path.join(ICONS, 'favicon.png'));
  console.log('icons done');

  const posterCount = fs.readdirSync(POSTERS).length;
  const backdropCount = fs.readdirSync(BACKDROPS).length;
  const iconCount = fs.readdirSync(ICONS).length;
  console.log(`=== DONE posters=${posterCount} backdrops=${backdropCount} icons=${iconCount} ===`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
