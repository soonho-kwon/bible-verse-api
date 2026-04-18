const express = require('express');
const { fetchVerseOfTheDay } = require('../services/bibleService');
const { generateVerseImage } = require('../utils/imageGenerator');

const router = express.Router();

// GET /verse?width=390&height=844&key=your-secret
router.get('/', async (req, res) => {
  if (req.query.key !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const width = parseInt(req.query.width, 10);
  const height = parseInt(req.query.height, 10);
  const scale = Math.min(Math.max(parseFloat(req.query.scale) || 3, 1), 4);

  if (!width || !height || width < 1 || height < 1) {
    return res.status(400).json({
      error: 'Query parameters "width" and "height" are required and must be positive integers.',
    });
  }

  if (width * scale > 4096 || height * scale > 4096) {
    return res.status(400).json({ error: 'Scaled dimensions exceed 4096px.' });
  }

  try {
    const verse = await fetchVerseOfTheDay();
    const imageBuffer = await generateVerseImage(verse, Math.round(width * scale), Math.round(height * scale));
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(imageBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
