const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

function hexToRgb(hex) {
  const h = hex.replace('#','');
  const bigint = parseInt(h, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function createMaskable(size, outPath, bgHex) {
  const [r,g,b] = hexToRgb(bgHex);
  const png = new PNG({ width: size, height: size });
  // fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = r;
      png.data[idx+1] = g;
      png.data[idx+2] = b;
      png.data[idx+3] = 255;
    }
  }

  // draw centered white circle (simple logo)
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.28; // leave margin for mask
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist <= radius) {
        const idx = (size * y + x) << 2;
        png.data[idx] = 255;
        png.data[idx+1] = 255;
        png.data[idx+2] = 255;
        png.data[idx+3] = 255;
      }
    }
  }

  const dir = path.dirname(outPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const stream = fs.createWriteStream(outPath);
  png.pack().pipe(stream);
  stream.on('finish', () => console.log('Wrote', outPath));
}

const outPath = path.join(__dirname, '..', 'public', 'icons', 'icon-512-maskable.png');
createMaskable(512, outPath, '#06b6d4');
