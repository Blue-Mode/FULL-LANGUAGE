'use strict';

const express = require('express');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '32kb' }));

const PORT = process.env.PORT || 3000;
const VERSION = 'blue-mode-translation-v5';

const REQUEST_TIMEOUT_MS = 15000;
const MAX_TEXT_LENGTH = 4000;

const TRANSLATION_API =
  'https://api.mymemory.translated.net/get';

const LANGUAGES = {
  afrikaans: 'af',
  albanian: 'sq',
  amharic: 'am',
  arabic: 'ar',
  armenian: 'hy',
  azerbaijani: 'az',
  basque: 'eu',
  bengali: 'bn',
  bosnian: 'bs',
  bulgarian: 'bg',
  catalan: 'ca',
  chinese: 'zh-CN',
  'chinese simplified': 'zh-CN',
  'simplified chinese': 'zh-CN',
  'chinese traditional': 'zh-TW',
  'traditional chinese': 'zh-TW',
  croatian: 'hr',
  czech: 'cs',
  danish: 'da',
  dutch: 'nl',
  english: 'en',
  estonian: 'et',
  filipino: 'tl',
  tagalog: 'tl',
  finnish: 'fi',
  french: 'fr',
  galician: 'gl',
  georgian: 'ka',
  german: 'de',
  greek: 'el',
  gujarati: 'gu',
  haitian: 'ht',
  hebrew: 'he',
  hindi: 'hi',
  hungarian: 'hu',
  icelandic: 'is',
  indonesian: 'id',
  irish: 'ga',
  italian: 'it',
  japanese: 'ja',
  javanese: 'jw',
  kannada: 'kn',
  kazakh: 'kk',
  khmer: 'km',
  korean: 'ko',
  lao: 'lo',
  latvian: 'lv',
  lithuanian: 'lt',
  malay: 'ms',
  malayalam: 'ml',
  maltese: 'mt',
  marathi: 'mr',
  mongolian: 'mn',
  nepali: 'ne',
  norwegian: 'no',
  persian: 'fa',
  polish: 'pl',
  portuguese: 'pt',
  punjabi: 'pa',
  romanian: 'ro',
  russian: 'ru',
  serbian: 'sr',
  slovak: 'sk',
  slovenian: 'sl',
  spanish: 'es',
  swahili: 'sw',
  swedish: 'sv',
  tamil: 'ta',
  telugu: 'te',
  thai: 'th',
  turkish: 'tr',
  ukrainian: 'uk',
  urdu: 'ur',
  uzbek: 'uz',
  vietnamese: 'vi',
  welsh: 'cy',
  yoruba: 'yo',
  zulu: 'zu'
};

const LANGUAGE_NAMES = {};

for (const [name, code] of Object.entries(LANGUAGES)) {
  if (!LANGUAGE_NAMES[code]) {
    LANGUAGE_NAMES[code] =
      name.charAt(0).toUpperCase() + name.slice(1);
  }
}

Object.assign(LANGUAGE_NAMES, {
  en: 'English',
  tl: 'Filipino / Tagalog',
  'zh-CN': 'Chinese (Simplified)',
  'zh-TW': 'Chinese (Traditional)',
  he: 'Hebrew'
});

function normalizeLanguage(value) {
  const requested = String(value || 'English').trim();
  const code = LANGUAGES[requested.toLowerCase()] || requested;

  if (!/^[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})?$/i.test(code)) {
    return null;
  }

  return code;
}

function sendError(res, status, error, extra = {}) {
  return res.status(status).json({
    ok: false,
    error,
    ...extra
  });
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timer = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timer);
  }
}

app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Blue Mode Translation API',
    version: VERSION,
    translationProvider: 'MyMemory',
    apiKeyRequired: false,
    routes: [
      'GET /',
      'GET /health',
      'GET /debug-version',
      'GET /languages',
      'GET /translate',
      'POST /translate'
    ]
  });
});

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'Blue Mode Translation API',
    version: VERSION
  });
});

app.get('/debug-version', (_req, res) => {
  res.json({
    ok: true,
    version: VERSION,
    provider: 'MyMemory',
    apiKeyRequired: false,
    translateMethod: 'POST'
  });
});

app.get('/languages', (_req, res) => {
  const languages = Object.entries(LANGUAGES)
    .map(([name, code]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      code
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  res.json({
    ok: true,
    count: languages.length,
    languages
  });
});

app.get('/translate', (_req, res) => {
  res.json({
    ok: true,
    endpoint: '/translate',
    method: 'POST',
    provider: 'MyMemory',
    apiKeyRequired: false,
    expectedBody: {
      text: 'Hello',
      targetLanguage: 'Filipino'
    }
  });
});

app.post('/translate', async (req, res) => {
  const body = req.body || {};

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
    return sendError(res, 400, 'Please provide non-empty text.', {
      expectedBody: {
        text: 'Hello',
        targetLanguage: 'Filipino'
      }
    });
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
    return sendError(res, 400, 'Invalid target language.');
  }

  const target = normalizeLanguage(rawTarget);

  if (!target) {
    return sendError(
      res,
      400,
      `Unsupported target language: ${rawTarget}`,
      { languagesEndpoint: '/languages' }
    );
  }

  const source =
    normalizeLanguage(body.sourceLanguage || body.source) || 'en';

  const params = new URLSearchParams({
    q: text,
    langpair: `${source}|${target}`
  });

  try {
    const response = await fetchWithTimeout(
      `${TRANSLATION_API}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json'
        }
      }
    );

    const raw = await response.text();

    let data;

    try {
      data = JSON.parse(raw);
    } catch {
      return sendError(
        res,
        502,
        'Translation provider returned invalid JSON.'
      );
    }

    if (!response.ok) {
      return sendError(
        res,
        502,
        'Translation provider request failed.',
        {
          providerStatus: response.status
        }
      );
    }

    if (Number(data.responseStatus) !== 200) {
      return sendError(
        res,
        502,
        data.responseDetails || 'Translation was unsuccessful.',
        {
          providerStatus: data.responseStatus
        }
      );
    }

    const translatedText =
      data.responseData?.translatedText;

    if (
      typeof translatedText !== 'string' ||
      !translatedText.trim()
    ) {
      return sendError(
        res,
        502,
        'Translation provider returned no translated text.'
      );
    }

    const detectedLanguage =
      data.responseData?.detectedLanguage ||
      source;

    return res.json({
      ok: true,
      translatedText,
      translation: translatedText,
      detectedLanguage,
      detectedLanguageName:
        LANGUAGE_NAMES[detectedLanguage] || detectedLanguage,
      targetLanguage: target,
      targetLanguageName:
        LANGUAGE_NAMES[target] || String(rawTarget)
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
        details: String(
          error?.message || error
        ).slice(0, 200)
      }
    );
  }
});

app.use((error, _req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return sendError(res, 400, 'Invalid JSON request body.');
  }

  if (error?.type === 'entity.too.large') {
    return sendError(res, 413, 'Request body is too large.');
  }

  return next(error);
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    error: 'Route not found',
    requestedMethod: req.method,
    requestedPath: req.path
  });
});

app.use((error, _req, res, _next) => {
  console.error('Unhandled server error:', error);

  if (res.headersSent) {
    return;
  }

  return sendError(res, 500, 'Internal server error.');
});

app.listen(PORT, () => {
  console.log(
    `Blue Mode Translation API ${VERSION} listening on port ${PORT}`
  );
  console.log('Translation provider: MyMemory (no API key required)');
});
