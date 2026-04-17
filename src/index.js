require('dotenv').config();
const express = require('express');
const verseRouter = require('./routes/verse');

const app = express();
const PORT = process.env.PORT || 3000;

app.use('/verse', verseRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Bible Verse API running on http://localhost:${PORT}`);
});
