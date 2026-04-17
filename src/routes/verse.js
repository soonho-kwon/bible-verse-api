const express = require('express');
const { fetchVerseOfTheDay } = require('../services/bibleService');
const { generateVerseImage } = require('../utils/imageGenerator');

const router = express.Router();

// GET /verse?width=390&height=844
router.get('/', async (req, res) => {
  const width = parseInt(req.query.width, 10);
  const height = parseInt(req.query.height, 10);

  if (!width || !height || width < 1 || height < 1) {
    return res.status(400).json({
      error: 'Query parameters "width" and "height" are required and must be positive integers.',
    });
  }

  if (width > 4096 || height > 4096) {
    return res.status(400).json({ error: 'Maximum dimension is 4096px.' });
  }

  const verse = await fetchVerseOfTheDay();
  const imageBuffer = await generateVerseImage(verse, width, height);

  res.set('Content-Type', 'image/png');
  res.set('Cache-Control', 'public, max-age=3600'); // cache for 1 hour
  res.send(imageBuffer);
});

module.exports = router;
