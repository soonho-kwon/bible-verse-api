const { createCanvas } = require('@napi-rs/canvas');

async function generateVerseImage(verse, width, height) {
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');
  const scale  = Math.min(width, height) / 400;

  // Background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const paddingX   = Math.round(width * 0.1);
  const maxWidth   = width - paddingX * 2;
  const fontSize   = Math.round(18 * scale);
  const lineHeight = Math.round(28 * scale);

  ctx.textAlign = 'center';
  ctx.font      = `${fontSize}px Menlo, "Courier New", monospace`;

  // Verse text — white
  ctx.fillStyle = '#ffffff';
  const lines = wrapText(ctx, verse.text, maxWidth);
  const blockHeight = lines.length * lineHeight + Math.round(32 * scale);
  let y = (height - blockHeight) / 2;

  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  // Reference — white at 50% opacity
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font      = `${Math.round(13 * scale)}px Menlo, "Courier New", monospace`;
  ctx.fillText(verse.reference, width / 2, y + Math.round(20 * scale));

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
