const { createCanvas } = require('@napi-rs/canvas');

// Seeded PRNG (mulberry32) for deterministic noise
function makePrng(seed) {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function dailySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function drawBackground(ctx, width, height, seed) {
  // Base dark grey fill
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, width, height);

  // Subtle noise overlay — low opacity, varied grey specks
  const rand = makePrng(seed);
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = Math.round((rand() - 0.5) * 28); // ±14 brightness variation
    data[i]     = Math.max(0, Math.min(255, data[i]     + v));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + v));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + v));
  }
  ctx.putImageData(imageData, 0, 0);
}

async function generateVerseImage(verse, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const s = Math.min(width, height) / 400;

  drawBackground(ctx, width, height, dailySeed());

  const paddingX = Math.round(width * 0.1);
  const maxWidth = width - paddingX * 2;
  const fontSize = Math.round(18 * s);
  const lineHeight = Math.round(28 * s);

  ctx.textAlign = 'center';
  ctx.font = `${fontSize}px Menlo, "Courier New", monospace`;
  ctx.fillStyle = '#ffffff';
  const lines = wrapText(ctx, verse.text, maxWidth);
  const blockH = lines.length * lineHeight + Math.round(32 * s);
  let y = (height - blockH) / 2;
  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  ctx.fillStyle = 'rgba(255,215,130,0.85)';
  ctx.font = `${Math.round(13 * s)}px Menlo, "Courier New", monospace`;
  ctx.fillText(verse.reference, width / 2, y + Math.round(20 * s));

  return canvas.toBuffer('image/png');
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

module.exports = { generateVerseImage };
