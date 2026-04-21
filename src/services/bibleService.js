const axios = require('axios');

let cache = { date: null, verse: null };

async function fetchVerseOfTheDay() {
  const today = new Date().toISOString().slice(0, 10);

  if (cache.date === today) return cache.verse;

  const reference = await fetchVOTDReference();
  const verse = await fetchESVText(reference);

  cache = { date: today, verse };
  return verse;
}

// Step 1: get today's verse reference from labs.bible.org
async function fetchVOTDReference() {
  const { data } = await axios.get('https://labs.bible.org/api/', {
    params: { passage: 'votd', type: 'json' },
    timeout: 8000,
  });

  const { bookname, chapter, verse } = data[0];
  return `${bookname} ${chapter}:${verse}`;
}

// Step 2: fetch that reference's text from the ESV API
async function fetchESVText(reference) {
  const { data } = await axios.get('https://api.esv.org/v3/passage/text/', {
    params: {
      q: reference,
      'include-headings': false,
      'include-footnotes': false,
      'include-verse-numbers': false,
      'include-short-copyright': false,
      'include-passage-references': false,
    },
    headers: { Authorization: `Token ${process.env.ESV_API_KEY}` },
    timeout: 8000,
  });

  const text = data.passages[0].trim().replace(/\s+/g, ' ');
  return { text, reference };
}

module.exports = { fetchVerseOfTheDay };
