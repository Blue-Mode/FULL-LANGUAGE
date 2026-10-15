'use strict';

const express = require('express');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const PORT = process.env.PORT || 3000;
const VERSION = 'blue-mode-translation-v3';

const TRANSLATE_API_URL =
  process.env.TRANSLATE_API_URL ||
  'https://libretranslate.com/translate';

const TRANSLATE_API_KEY =
  process.env.TRANSLATE_API_KEY || '';

const REQUEST_TIMEOUT_MS = 20000;
const MAX_TEXT_LENGTH = 4000;

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

const WORLD_LANGUAGES = {
  Afar: 'aa',
  Akan: 'ak',
  Akkadian: 'akk',
  Aleut: 'ale',
  'American Sign Language': 'ase',
  Aragonese: 'an',
  Aromanian: 'rup',
  Asturian: 'ast',
  Balinese: 'ban',
  Baluchi: 'bal',
  Banyumasan: 'map-bms',
  Bikol: 'bik',
  Bislama: 'bi',
  Breton: 'br',
  Buginese: 'bug',
  Cantonese: 'yue',
  Chamorro: 'ch',
  Chechen: 'ce',
  Cherokee: 'chr',
  Chichewa: 'ny',
  Chuvash: 'cv',
  Cornish: 'kw',
  'Crimean Tatar': 'crh',
  Dari: 'prs',
  Dinka: 'din',
  Dzongkha: 'dz',
  Efik: 'efi',
  Erzya: 'myv',
  Faroese: 'fo',
  Fijian: 'fj',
  Fula: 'ff',
  Friulian: 'fur',
  Gagauz: 'gag',
  Gilbertese: 'gil',
  Gothic: 'got',
  Greenlandic: 'kl',
  'Hakka Chinese': 'hak',
  'Hiri Motu': 'ho',
  'Inari Sami': 'smn',
  Ingush: 'inh',
  Interlingua: 'ia',
  Interlingue: 'ie',
  Inuktitut: 'iu',
  Inupiaq: 'ik',
  'Judeo-Arabic': 'jrb',
  Kabardian: 'kbd',
  Kabyle: 'kab',
  Kachin: 'kac',
  Kamba: 'kam',
  Kanuri: 'kr',
  Karakalpak: 'kaa',
  'Karachay-Balkar': 'krc',
  Kashubian: 'csb',
  Kashmiri: 'ks',
  Kikuyu: 'ki',
  Komi: 'kv',
  Kongo: 'kg',
  Koryak: 'kpy',
  Kpelle: 'kpe',
  Ladino: 'lad',
  Laz: 'lzz',
  Lezghian: 'lez',
  Limburgish: 'li',
  Livonian: 'liv',
  Lojban: 'jbo',
  'Luba-Katanga': 'lu',
  'Luba-Lulua': 'lua',
  'Lule Sami': 'smj',
  Luo: 'luo',
  Madurese: 'mad',
  Makasar: 'mak',
  Manx: 'gv',
  Marshallese: 'mh',
  Minangkabau: 'min',
  Mirandese: 'mwl',
  Mohawk: 'moh',
  Nahuatl: 'nah',
  Nauruan: 'na',
  Navajo: 'nv',
  Ndebele: 'nd',
  Neapolitan: 'nap',
  Newari: 'new',
  NKo: 'nqo',
  'Northern Sami': 'se',
  Novial: 'nov',
  Occitan: 'oc',
  Ossetian: 'os',
  Papiamento: 'pap',
  Pangasinan: 'pag',
  Romansh: 'rm',
  Romani: 'rom',
  Sardinian: 'sc',
  'Saterland Frisian': 'stq',
  Sicilian: 'scn',
  Silesian: 'szl',
  Tahitian: 'ty',
  Tamasheq: 'tmh',
  Tongan: 'to',
  Tumbuka: 'tum',
  Tuvinian: 'tyv',
  Udmurt: 'udm',
  'Upper Sorbian': 'hsb',
  Venetian: 'vec',
  Veps: 'vep',
  Walloon: 'wa',
  Wolof: 'wo',
  Yakut: 'sah',
  Yao: 'yao',
  Zaza: 'zza',
  Zhuang: 'za'
};

// Add all language names before constructing the reverse catalogue.
for (const [name, code] of Object.entries(WORLD_LANGUAGES)) {
  const key = name.toLowerCase();

  if (!LANGUAGES[key]) {
    LANGUAGES[key] = code;
  }
}

const LANGUAGE_NAMES = {};

for (const [name, code] of Object.entries(LANGUAGES)) {
  const key = code.toLowerCase();

  if (!LANGUAGE_NAMES[key]) {
    LANGUAGE_NAMES[key] = name
      .split(' ')
      .map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
      )
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

function languageName(code, fallback) {
  if (!code) return fallback || 'Undetermined';

  return LANGUAGE_NAMES[String(code).toLowerCase()] ||
    fallback ||
    `Language (${code})`;
}

function sendError(res, status, error, extra = {}) {
  return res.status(status).json({
    ok: false,
    error,
    ...extra
  });
}

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Blue Mode Translation API',
    version: VERSION,
    routes: {
      health: 'GET /health',
      debugVersion: 'GET /debug-version',
      languages: 'GET /languages',
      translate: 'POST /translate'
    }
  });
});

// Health endpoint
app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Blue Mode Translation API',
    version: VERSION
  });
});

// Debug endpoint
app.get('/debug-version', (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    translateRouteExists: true,
    languagesRouteExists: true,
    providerConfigured: Boolean(TRANSLATE_API_URL),
    providerApiKeyConfigured: Boolean(TRANSLATE_API_KEY),
    translateMethod: 'POST',
    expectedBody: {
      text: 'string',
      targetLanguage: 'string'
    }
  });
});

// Supported languages
app.get('/languages', (_req, res) => {
  const combined = new Map();

  for (const [name, code] of Object.entries(LANGUAGES)) {
    const key = name.toLowerCase();

    if (!combined.has(key)) {
      combined.set(key, {
        name,
        code,
        status: 'unverified'
      });
    }
  }

  for (const [name, code] of Object.entries(WORLD_LANGUAGES)) {
    const key = name.toLowerCase();

    if (!combined.has(key)) {
      combined.set(key, {
        name,
        code,
        status: 'unverified'
      });
    }
  }

  const languages = [...combined.values()].sort(
    (a, b) => a.name.localeCompare(b.name)
  );

  res.json({
    ok: true,
    count: languages.length,
    note:
      'Languages are listed for selection. Actual support depends on the translation provider.',
    languages
  });
});

// Translation endpoint
app.post('/translate', async (req, res) => {
  try {
    const body = req.body || {};

    // Accept common input field names.
    const rawText =
      body.text ??
      body.message ??
      body.q ??
      body.input;

    const rawTarget =
      body.targetLanguage ??
      body.target_language ??
      body.target ??
      body.to ??
      'English';

    if (typeof rawText !== 'string' || !rawText.trim()) {
      return sendError(
        res,
        400,
        'Please provide non-empty text.',
        {
          expectedBody: {
            text: 'Hello',
            targetLanguage: 'Filipino'
          }
        }
      );
    }

    const text = rawText.trim();

    if (text.length > MAX_TEXT_LENGTH) {
      return sendError(
        res,
        413,
        `Text exceeds the ${MAX_TEXT_LENGTH}-character limit.`
      );
    }

    if (
      typeof rawTarget !== 'string' &&
      typeof rawTarget !== 'number'
    ) {
      return sendError(
        res,
        400,
        'Target language must be a string.'
      );
    }

    const target = normalizeLanguage(rawTarget);

    if (!target.code) {
      return sendError(
        res,
        400,
        `Unsupported target language: ${target.requested}`,
        {
          supportedLanguages: '/languages'
        }
      );
    }

    const providerPayload = {
      q: text,
      source: 'auto',
      target: target.code,
      format: 'text'
    };

    if (TRANSLATE_API_KEY) {
      providerPayload.api_key = TRANSLATE_API_KEY;
    }

    const controller = new AbortController();

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    let upstream;
    let providerBody;

    try {
      upstream = await fetch(TRANSLATE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify(providerPayload),
        signal: controller.signal
      });

      providerBody = await upstream.text();
    } finally {
      clearTimeout(timeout);
    }

    let data;

    try {
      data = JSON.parse(providerBody);
    } catch (_error) {
      console.error(
        'Translation provider returned invalid JSON. Status:',
        upstream.status
      );

      return sendError(
        res,
        502,
        'Translation provider returned an invalid response.',
        {
          providerStatus: upstream.status
        }
      );
    }

    if (!upstream.ok) {
      const providerMessage = String(
        data.error ||
        data.message ||
        `HTTP ${upstream.status}`
      ).slice(0, 300);

      console.error(
        'Translation provider error:',
        upstream.status,
        providerMessage
      );

      return sendError(
        res,
        502,
        'Translation provider returned an error.',
        {
          providerStatus: upstream.status,
          providerMessage
        }
      );
    }

    const translatedText =
      typeof data.translatedText === 'string'
        ? data.translatedText
        : typeof data.translation === 'string'
          ? data.translation
          : typeof data.translated_text === 'string'
            ? data.translated_text
            : '';

    if (!translatedText.trim()) {
      return sendError(
        res,
        502,
        'The translation provider did not return translated text.'
      );
    }

    const detectedCode =
      typeof data.detectedLanguage?.language === 'string'
        ? data.detectedLanguage.language.trim()
        : typeof data.detectedLanguage === 'string'
          ? data.detectedLanguage.trim()
          : 'und';

    const detectedName = languageName(detectedCode);

    const targetName = languageName(
      target.code,
      target.requested
    );

    return res.json({
      ok: true,
      translatedText,
      translation: translatedText,
      detectedLanguage: detectedCode || 'und',
      detectedLanguageName: detectedName,
      targetLanguage: target.code,
      targetLanguageName: targetName
    });
  } catch (error) {
    const timedOut = error?.name === 'AbortError';

    console.error(
      'Translation request failed:',
      error?.message || error
    );

    return sendError(
      res,
      502,
      timedOut
        ? 'Translation provider timed out.'
        : 'Translation provider unavailable.',
      {
        details: String(error?.message || error).slice(0, 300)
      }
    );
  }
});

// Handle malformed JSON bodies.
app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return sendError(res, 400, 'Invalid JSON request body.');
  }

  if (error?.type === 'entity.too.large') {
    return sendError(res, 413, 'Request body is too large.');
  }

  return next(error);
});

// Unknown routes
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    requestedMethod: req.method,
    requestedPath: req.path,
    availableRoutes: [
      'GET /',
      'GET /health',
      'GET /debug-version',
      'GET /languages',
      'POST /translate'
    ],
    hint:
      req.path === '/translate' && req.method === 'GET'
        ? 'Use POST /translate with a JSON request body.'
        : 'Check the URL path and HTTP method.'
  });
});

// Final error handler
app.use((error, _req, res, _next) => {
  console.error('Unhandled server error:', error);

  if (res.headersSent) return;

  return sendError(
    res,
    500,
    'Internal server error.'
  );
});

app.listen(PORT, () => {
  console.log(
    `Blue Mode Translation API ${VERSION} listening on port ${PORT}`
  );

  console.log(
    `Translation provider: ${TRANSLATE_API_URL}`
  );
});
