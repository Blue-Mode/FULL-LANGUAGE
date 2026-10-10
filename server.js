'use strict';

const express = require('express');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const PORT = process.env.PORT || 3000;
const VERSION = 'blue-mode-translation-v2';

const LANGUAGES = {
  afrikaans: 'af',
  albanian: 'sq',
  amharic: 'am',
  arabic: 'ar',
  armenian: 'hy',
  assamese: 'as',
  aymara: 'ay',
  azerbaijani: 'az',
  bambara: 'bm',
  bashkir: 'ba',
  basque: 'eu',
  belarusian: 'be',
  bengali: 'bn',
  bhojpuri: 'bho',
  bosnian: 'bs',
  bulgarian: 'bg',
  burmese: 'my',
  catalan: 'ca',
  cebuano: 'ceb',
  chinese: 'zh-CN',
  'chinese simplified': 'zh-CN',
  'simplified chinese': 'zh-CN',
  mandarin: 'zh-CN',
  'chinese traditional': 'zh-TW',
  'traditional chinese': 'zh-TW',
  corsican: 'co',
  croatian: 'hr',
  czech: 'cs',
  danish: 'da',
  dhivehi: 'dv',
  dogri: 'doi',
  dutch: 'nl',
  english: 'en',
  esperanto: 'eo',
  estonian: 'et',
  ewe: 'ee',
  filipino: 'tl',
  tagalog: 'tl',
  finnish: 'fi',
  french: 'fr',
  frisian: 'fy',
  galician: 'gl',
  georgian: 'ka',
  german: 'de',
  greek: 'el',
  guarani: 'gn',
  gujarati: 'gu',
  'haitian creole': 'ht',
  hausa: 'ha',
  hawaiian: 'haw',
  hebrew: 'iw',
  hindi: 'hi',
  hmong: 'hmn',
  hungarian: 'hu',
  icelandic: 'is',
  igbo: 'ig',
  ilocano: 'ilo',
  indonesian: 'id',
  irish: 'ga',
  italian: 'it',
  japanese: 'ja',
  javanese: 'jv',
  kannada: 'kn',
  kazakh: 'kk',
  khmer: 'km',
  kinyarwanda: 'rw',
  konkani: 'gom',
  korean: 'ko',
  krio: 'kri',
  kurdish: 'ku',
  kyrgyz: 'ky',
  lao: 'lo',
  latin: 'la',
  latvian: 'lv',
  lingala: 'ln',
  lithuanian: 'lt',
  luganda: 'lg',
  luxembourgish: 'lb',
  macedonian: 'mk',
  maithili: 'mai',
  malagasy: 'mg',
  malay: 'ms',
  malayalam: 'ml',
  maltese: 'mt',
  maori: 'mi',
  marathi: 'mr',
  meiteilon: 'mni-Mtei',
  mizo: 'lus',
  mongolian: 'mn',
  nepali: 'ne',
  norwegian: 'no',
  odia: 'or',
  oriya: 'or',
  oromo: 'om',
  pashto: 'ps',
  persian: 'fa',
  polish: 'pl',
  portuguese: 'pt',
  punjabi: 'pa',
  quechua: 'qu',
  romanian: 'ro',
  russian: 'ru',
  samoan: 'sm',
  sanskrit: 'sa',
  'scots gaelic': 'gd',
  serbian: 'sr',
  sesotho: 'st',
  shona: 'sn',
  sindhi: 'sd',
  sinhala: 'si',
  slovak: 'sk',
  slovenian: 'sl',
  somali: 'so',
  spanish: 'es',
  sundanese: 'su',
  swahili: 'sw',
  swedish: 'sv',
  tajik: 'tg',
  tamil: 'ta',
  tatar: 'tt',
  telugu: 'te',
  thai: 'th',
  tigrinya: 'ti',
  tsonga: 'ts',
  turkish: 'tr',
  turkmen: 'tk',
  twi: 'ak',
  ukrainian: 'uk',
  urdu: 'ur',
  uyghur: 'ug',
  uzbek: 'uz',
  vietnamese: 'vi',
  welsh: 'cy',
  xhosa: 'xh',
  yiddish: 'yi',
  yoruba: 'yo',
  zulu: 'zu',
  hiligaynon: 'hil',
  ilonggo: 'hil',
  waray: 'war'
};

const LANGUAGE_NAMES = {};

for (const [name, code] of Object.entries(LANGUAGES)) {
  if (!LANGUAGE_NAMES[code.toLowerCase()]) {
    LANGUAGE_NAMES[code.toLowerCase()] = name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

Object.assign(LANGUAGE_NAMES, {
  'zh-cn': 'Chinese (Simplified)',
  'zh-tw': 'Chinese (Traditional)',
  tl: 'Filipino / Tagalog',
  iw: 'Hebrew',
  und: 'Undetermined',
  hil: 'Hiligaynon / Ilonggo',
  war: 'Waray'
});

function normalizeLanguage(value) {
  const requested = String(value || 'English').trim();
  const code = LANGUAGES[requested.toLowerCase()] || requested;

  if (!/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})?$/i.test(code)) {
    return { requested, code: null };
  }

  return { requested, code };
}

// Root health check
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Blue Mode Translation API',
    version: VERSION
  });
});

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({ ok: true, version: VERSION });
});

// Debug endpoint: confirms which version Render is running
app.get('/debug-version', (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    languagesRouteExists: true,
    translateRouteExists: true
  });
});

// Supported languages
app.get('/languages', (_req, res) => {
  const languages = Object.entries(LANGUAGES)
    .map(([name, code]) => ({ name, code }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({
    ok: true,
    count: languages.length,
    languages
  });
});

// Translate text
app.post('/translate', async (req, res) => {
  try {
    const text = req.body?.text;
    const requestedLanguage = String(
      req.body?.targetLanguage || 'English'
    ).trim();

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        ok: false,
        error: 'Please provide a non-empty text string.'
      });
    }

    if (text.length > 4000) {
      return res.status(413).json({
        ok: false,
        error: 'Message is too long. Maximum 4000 characters.'
      });
    }

    const target = normalizeLanguage(requestedLanguage);

    if (!target.code) {
      return res.status(400).json({
        ok: false,
        error: `Unsupported target language: ${requestedLanguage}`,
        supportedLanguages: '/languages'
      });
    }

    const url = new URL(
      'https://translate.googleapis.com/translate_a/single'
    );

    url.searchParams.set('client', 'gtx');
    url.searchParams.set('sl', 'auto');
    url.searchParams.set('tl', target.code);
    url.searchParams.set('dt', 't');
    url.searchParams.set('q', text);

    const upstream = await fetch(url, {
      headers: {
        'User-Agent': 'BlueModeTranslation/2.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });

    if (!upstream.ok) {
      console.error('Translation provider status:', upstream.status);

      return res.status(502).json({
        ok: false,
        error: 'Translation provider returned an error.'
      });
    }

    const data = await upstream.json();

    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      return res.status(502).json({
        ok: false,
        error: 'Unexpected translation provider response.'
      });
    }

    const translatedText = data[0]
      .filter(segment =>
        Array.isArray(segment) &&
        typeof segment[0] === 'string'
      )
      .map(segment => segment[0])
      .join('');

    if (!translatedText) {
      return res.status(502).json({
        ok: false,
        error: 'No translated text was returned.'
      });
    }

    const detectedCode =
      typeof data[2] === 'string' && data[2].trim()
        ? data[2].trim()
        : 'und';

    return res.json({
      ok: true,
      translatedText,
      detectedLanguage: detectedCode,
      detectedLanguageName:
        LANGUAGE_NAMES[detectedCode.toLowerCase()] ||
        (detectedCode === 'und'
          ? 'Undetermined'
          : `Language (${detectedCode})`),
      targetLanguage: target.code,
      targetLanguageName:
        LANGUAGE_NAMES[target.code.toLowerCase()] ||
        target.requested
    });
  } catch (error) {
    console.error('Translation error:', error);

    return res.status(502).json({
      ok: false,
      error: 'Translation provider unavailable.',
      details: String(error?.message || error)
    });
  }
});

// Friendly response for unknown routes
app.use((_req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /debug-version',
      'GET /languages',
      'POST /translate'
    ]
  });
});

app.listen(PORT, () => {
  console.log(
    `Blue Mode Translation API ${VERSION} listening on port ${PORT}`
  );
});
