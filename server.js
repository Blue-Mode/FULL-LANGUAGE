'use strict';

const express = require('express');

const app = express();

app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const PORT = process.env.PORT || 3000;
const VERSION = 'blue-mode-translation-v2';

const TRANSLATE_API_URL =
  process.env.TRANSLATE_API_URL ||
  'https://libretranslate.com/translate';

const TRANSLATE_API_KEY =
  process.env.TRANSLATE_API_KEY || '';

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

// Additional world-language catalogue.
// These entries expand the list shown by GET /languages.
// Listing a language does not guarantee provider support.
const WORLD_LANGUAGES = {
  'Afar': 'aa',
  'Akan': 'ak',
  'Akkadian': 'akk',
  'Aleut': 'ale',
  'American Sign Language': 'ase',
  'Aragonese': 'an',
  'Aromanian': 'rup',
  'Asturian': 'ast',
  'Balinese': 'ban',
  'Baluchi': 'bal',
  'Banyumasan': 'map-bms',
  'Bikol': 'bik',
  'Bislama': 'bi',
  'Breton': 'br',
  'Buginese': 'bug',
  'Cantonese': 'yue',
  'Chamorro': 'ch',
  'Chechen': 'ce',
  'Cherokee': 'chr',
  'Chichewa': 'ny',
  'Chuvash': 'cv',
  'Cornish': 'kw',
  'Crimean Tatar': 'crh',
  'Dari': 'prs',
  'Dinka': 'din',
  'Dzongkha': 'dz',
  'Efik': 'efi',
  'Erzya': 'myv',
  'Faroese': 'fo',
  'Fijian': 'fj',
  'Fula': 'ff',
  'Friulian': 'fur',
  'Gagauz': 'gag',
  'Gilbertese': 'gil',
  'Gothic': 'got',
  'Greenlandic': 'kl',
  'Hakka Chinese': 'hak',
  'Hiri Motu': 'ho',
  'Inari Sami': 'smn',
  'Ingush': 'inh',
  'Interlingua': 'ia',
  'Interlingue': 'ie',
  'Inuktitut': 'iu',
  'Inupiaq': 'ik',
  'Judeo-Arabic': 'jrb',
  'Kabardian': 'kbd',
  'Kabyle': 'kab',
  'Kachin': 'kac',
  'Kamba': 'kam',
  'Kanuri': 'kr',
  'Karakalpak': 'kaa',
  'Karachay-Balkar': 'krc',
  'Kashubian': 'csb',
  'Kashmiri': 'ks',
  'Kikuyu': 'ki',
  'Komi': 'kv',
  'Kongo': 'kg',
  'Koryak': 'kpy',
  'Kpelle': 'kpe',
  'Ladino': 'lad',
  'Laz': 'lzz',
  'Lezghian': 'lez',
  'Limburgish': 'li',
  'Livonian': 'liv',
  'Lojban': 'jbo',
  'Luba-Katanga': 'lu',
  'Luba-Lulua': 'lua',
  'Lule Sami': 'smj',
  'Luo': 'luo',
  'Madurese': 'mad',
  'Makasar': 'mak',
  'Manx': 'gv',
  'Marshallese': 'mh',
  'Minangkabau': 'min',
  'Mirandese': 'mwl',
  'Mohawk': 'moh',
  'Nahuatl': 'nah',
  'Nauruan': 'na',
  'Navajo': 'nv',
  'Ndebele': 'nd',
  'Neapolitan': 'nap',
  'Newari': 'new',
  'NKo': 'nqo',
  'Northern Sami': 'se',
  'Novial': 'nov',
  'Occitan': 'oc',
  'Ossetian': 'os',
  'Papiamento': 'pap',
  'Pangasinan': 'pag',
  'Romansh': 'rm',
  'Romani': 'rom',
  'Sardinian': 'sc',
  'Saterland Frisian': 'stq',
  'Sicilian': 'scn',
  'Silesian': 'szl',
  'Tahitian': 'ty',
  'Tamasheq': 'tmh',
  'Tongan': 'to',
  'Tumbuka': 'tum',
  'Tuvinian': 'tyv',
  'Udmurt': 'udm',
  'Upper Sorbian': 'hsb',
  'Venetian': 'vec',
  'Veps': 'vep',
  'Walloon': 'wa',
  'Wolof': 'wo',
  'Yakut': 'sah',
  'Yao': 'yao',
  'Zaza': 'zza',
  'Zhuang': 'za'
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

// Add the expanded catalogue to language normalization.
for (const [name, code] of Object.entries(WORLD_LANGUAGES)) {
  if (!LANGUAGES[name.toLowerCase()]) {
    LANGUAGES[name.toLowerCase()] = code;
  }
}

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
  res.json({
    ok: true,
    version: VERSION
  });
});

// Debug endpoint
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
    note: 'Listed languages are not necessarily supported by the translation provider.',
    languages
  });
});

// Translate text using LibreTranslate
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

    const providerPayload = {
      q: text,
      source: 'auto',
      target: target.code,
      format: 'text'
    };

    if (TRANSLATE_API_KEY) {
      providerPayload.api_key = TRANSLATE_API_KEY;
    }

    const upstream = await fetch(TRANSLATE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(providerPayload),
      signal: AbortSignal.timeout(20000)
    });

    const providerBody = await upstream.text();

    let data;

    try {
      data = JSON.parse(providerBody);
    } catch (_parseError) {
      console.error(
        'Translation provider returned non-JSON:',
        upstream.status
      );

      return res.status(502).json({
        ok: false,
        error: 'Translation provider returned an invalid response.',
        providerStatus: upstream.status
      });
    }

    if (!upstream.ok) {
      console.error(
        'Translation provider status:',
        upstream.status,
        data
      );

      return res.status(502).json({
        ok: false,
        error: 'Translation provider returned an error.',
        providerStatus: upstream.status,
        providerMessage: String(
          data.error ||
          data.message ||
          'No provider details supplied'
        ).slice(0, 300)
      });
    }

    const translatedText = data.translatedText;

    if (
      typeof translatedText !== 'string' ||
      !translatedText.trim()
    ) {
      return res.status(502).json({
        ok: false,
        error: 'No translated text was returned by the provider.'
      });
    }

    const detectedCode =
      typeof data.detectedLanguage?.language === 'string' &&
      data.detectedLanguage.language.trim()
        ? data.detectedLanguage.language.trim()
        : 'und';

    return res.json({
      ok: true,
      translatedText,
      detectedLanguage: detectedCode,
      detectedLanguageName:
        LANGUAGE_NAMES[detectedCode.toLowerCase()] ||
        (
          detectedCode === 'und'
            ? 'Undetermined'
            : `Language (${detectedCode})`
        ),
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
