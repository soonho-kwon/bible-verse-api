const { createCanvas } = require('@napi-rs/canvas');

const BACKGROUND = '#1a1a2e';
const ACCENT     = '#e8c87d';
const TEXT_COLOR = '#f0ece2';

async function generateVerseImage(verse, width, height) {
  const canvas = createCanvas(width, height);
  const ctx    = canvas.getContext('2d');
  const scale  = Math.min(width, height) / 400; // responsive font scaling

  // Background
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, width, height);

  // Decorative top bar
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, 0, width, Math.max(4, Math.round(4 * scale)));

  const paddingX  = Math.round(width * 0.1);
  const paddingY  = Math.round(height * 0.15);
  const maxWidth  = width - paddingX * 2;
  const lineHeight = Math.round(28 * scale);

  // Verse text
  ctx.fillStyle  = TEXT_COLOR;
  ctx.font       = `${Math.round(18 * scale)}px serif`;
  ctx.textAlign  = 'center';

  const lines = wrapText(ctx, verse.text, maxWidth);
  const blockHeight = lines.length * lineHeight;
  let y = (height - blockHeight) / 2;

  for (const line of lines) {
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  // Reference (e.g. "John 3:16")
  ctx.fillStyle = ACCENT;
  ctx.font      = `italic ${Math.round(15 * scale)}px serif`;
  ctx.fillText(`— ${verse.reference}`, width / 2, y + Math.round(20 * scale));

  // Decorative bottom bar
  ctx.fillStyle = ACCENT;
  ctx.fillRect(0, height - Math.max(4, Math.round(4 * scale)), width, Math.max(4, Math.round(4 * scale)));

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
