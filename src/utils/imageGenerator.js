const axios = require('axios');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = Math.imul((h << 5) + h, 1) ^ str.charCodeAt(i);
  return Math.abs(h);
}

async function generateBackground(verse, width, height) {
  const prompt =
    `Dark illustrated scene inspired by ${verse.reference}. ` +
    `Deep dark background, mostly black. Child's crayon drawing style, rough waxy strokes, ` +
    `thick outlines, simplistic childlike art, hand-drawn feel, dark moody colors. ` +
    `No text, no words, no letters, no writing, no typography, no signs, no labels.`;

  const seed = hashStr(verse.reference);
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}` +
    `?width=${width}&height=${height}&seed=${seed}&model=flux&nologo=true`;

  const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 60000 });
  return Buffer.from(response.data);
}

async function generateVerseImage(verse, width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  const s = Math.min(width, height) / 400;

  const imgBuffer = await generateBackground(verse, width, height);
  const bgImage = await loadImage(imgBuffer);

  const scale = Math.max(width / bgImage.width, height / bgImage.height);
  const drawW = bgImage.width * scale;
  const drawH = bgImage.height * scale;
  ctx.drawImage(bgImage, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);

  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.fillRect(0, 0, width, height);

  const paddingX = Math.round(width * 0.1);
  const maxWidth = width - paddingX * 2;
  const fontSize = Math.round(18 * s);
  const lineHeight = Math.round(28 * s);

  ctx.textAlign = 'center';
  ctx.font = `${fontSize}px Menlo, "Courier New", monospace`;
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = Math.round(16 * s);

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

  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

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
