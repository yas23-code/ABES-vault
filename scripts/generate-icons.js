const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function hexToRgb(hex) {
  const h = hex.replace('#','');
  const bigint = parseInt(h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function createIcon(size, outPath, bgHex) {
  const [r,g,b] = hexToRgb(bgHex);
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = r;
      png.data[idx+1] = g;
      png.data[idx+2] = b;
      png.data[idx+3] = 255;
    }
  }

  // write file
  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stream = fs.createWriteStream(outPath);
  png.pack().pipe(stream);
  stream.on('finish', () => console.log('Wrote', outPath));
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
createIcon(192, path.join(outDir, 'icon-192.png'), '#06b6d4');
createIcon(512, path.join(outDir, 'icon-512.png'), '#06b6d4');
