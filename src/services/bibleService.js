const axios = require('axios');

// Cache the verse in memory for the current calendar day to avoid redundant API calls.
let cache = { date: null, verse: null };

async function fetchVerseOfTheDay() {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  if (cache.date === today) return cache.verse;

  const verse = process.env.ESV_API_KEY
    ? await fetchFromESV()
    : await fetchFromBibleOrg();

  cache = { date: today, verse };
  return verse;
}

async function fetchFromBibleOrg() {
  const { data } = await axios.get('https://labs.bible.org/api/', {
    params: { passage: 'votd', type: 'json' },
    timeout: 8000,
  });

  const entry = data[0];
  return {
    text: entry.text.trim(),
    reference: `${entry.bookname} ${entry.chapter}:${entry.verse}`,
  };
}

async function fetchFromESV() {
  // Derives today's verse by cycling through a hardcoded canonical passage list.
  // Replace with a real ESV "verse of the day" endpoint if you have access.
  const passages = [
    'John 3:16', 'Psalm 23:1', 'Romans 8:28', 'Philippians 4:13',
    'Jeremiah 29:11', 'Proverbs 3:5', 'Isaiah 40:31', 'Matthew 6:33',
  ];
  const day = Math.floor(Date.now() / 86400000);
  const passage = passages[day % passages.length];

  const { data } = await axios.get('https://api.esv.org/v3/passage/text/', {
    params: { q: passage, 'include-headings': false, 'include-footnotes': false },
    headers: { Authorization: `Token ${process.env.ESV_API_KEY}` },
    timeout: 8000,
  });

  const text = data.passages[0]
    .replace(/\[.*?\]/g, '')  // strip verse numbers in brackets
    .replace(/\s+/g, ' ')
    .trim();

  return { text, reference: passage };
}

module.exports = { fetchVerseOfTheDay };
