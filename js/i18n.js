(function () {
  'use strict';

  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'sanjeevani_lang';
  const LOCALE_DIR = (typeof window !== 'undefined' && window.__i18nConfig && window.__i18nConfig.localeDir) || 'locales/';
  const AVAILABLE_LANGS = ['en', 'ne'];

  const DEFAULT_STRINGS = {
    "title": "The Legend of Sanjeevani — An Interactive Comic Book",
    "issue": "THE LEGEND OF SANJEEVANI",
    "heading": "The Legend of Sanjeevani",
    "subtitle": "A Community Health Comic",
    "description": "A three-act interactive comic about overcoming TB through community health, ancient wisdom, and modern medicine.",
    "descriptionParagraph": "A three-chapter starter showing the full layered comic architecture. Use arrow keys, swipe, or tap Next to navigate. Drag inside the panel to look around each scene.",
    "startButton": "START STORY",
    "chapterSelectLabel": "Jump to chapter",
    "progressLabel": "Progress",
    "choicesLabel": "Choices",
    "navHintNavigate": "◀ Arrow keys or swipe to navigate ▶",
    "navHintDrag": "· Drag inside the panel to look around the scene ·",
    "navHintNextChapter": "· ↓ Arrow Down to next chapter ·",
    "compassHaste": "HASTE",
    "compassWisdom": "WISDOM",
    "audioToggleOff": "Turn audio off",
    "audioToggleOn": "Turn audio on",
    "nextChapter": "Next Chapter ↴",
    "readAgain": "Read Again ↺",
    "nextLine": "Next →",
    "createAssets": "Create assets",
    "characterGenerator": "Character Generator",
    "textureForge": "Texture Forge",
    "infoTitle": "Information and credits",
    "behindThePanels": "BEHIND THE PANELS",
    "credits": "Credits",
    "storyCredit": "Story",
    "musicCredit": "Music and sound",
    "builtWith": "Built with",
    "storyCreditText": "Adapted for an interactive comic experience.",
    "about": "About",
    "aboutText": "Explore more creative, interactive work at www.pixelagent.co.uk.",
    "aboutSmall": "This project is an independent creative adaptation. Library names and trademarks belong to their respective owners.",
    "closeInfo": "Close information",
    "loadingIssue": "LOADING ISSUE",
    "loadingStatus": "Preparing the panels…",
    "loadingSkip": "Open while downloading",
    "loadingOpen": "Opening comic…",
    "loadingDownload": "Downloading panels, music and effects…",
    "loadingReady": "Issue downloaded — ready!",
    "loadingMissing": "Comic ready · missing items will retry when needed",
    "loadingOpenAnyway": "Open comic anyway",
    "loadingFileMode": "Open from the app to download this issue.",
    "createStoryAssets": "Create story assets",
    "chapter_morning": "Ch.1 · Morning",
    "chapter_healthpost": "Ch.2 · At the Health Post",
    "chapter_treatment": "Ch.3 · Treatment & Family",
    "chapter_recovery": "Ch.4 · Recovery & Community",
    "chapter_end": "Ch.5 · Call to Action",
    "language": "Language",
    "english": "English",
    "nepali": "नेपाली"
  };

  const LANGUAGES = {
    en: 'English',
    ne: 'नेपाली'
  };

  let currentLang = DEFAULT_LANG;
  let translations = { ...DEFAULT_STRINGS };

  function getStoredLang() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && AVAILABLE_LANGS.includes(stored)) return stored;
    } catch (e) {}
    const header = (navigator.language || '').toLowerCase();
    if (header.startsWith('ne')) return 'ne';
    return DEFAULT_LANG;
  }

  async function loadLocale(lang) {
    try {
      const res = await fetch(`${LOCALE_DIR}${lang}.json`, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`Locale ${lang} not found`);
      const data = await res.json();
      translations = { ...DEFAULT_STRINGS, ...data };
      return true;
    } catch (err) {
      console.warn(`Failed to load ${lang} locale, falling back to defaults:`, err);
      translations = { ...DEFAULT_STRINGS };
      return false;
    }
  }

  function t(key, fallback) {
    if (translations[key] !== undefined) return translations[key];
    return fallback !== undefined ? fallback : key;
  }

  function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n], [data-i18n-aria-label], [data-i18n-title]');
    elements.forEach(el => {
      if (el.hasAttribute('data-i18n')) {
        const key = el.getAttribute('data-i18n');
        const translation = t(key);
        if (translation) {
          if (el.tagName === 'INPUT' && (el.type === 'color' || el.type === 'range')) return;
          if (el.tagName === 'META' && el.getAttribute('name') === 'description') {
            el.setAttribute('content', translation);
            return;
          }
          el.textContent = translation;
        }
      }
      if (el.hasAttribute('data-i18n-aria-label')) {
        const key = el.getAttribute('data-i18n-aria-label');
        const val = t(key);
        if (val) el.setAttribute('aria-label', val);
      }
      if (el.hasAttribute('data-i18n-title')) {
        const key = el.getAttribute('data-i18n-title');
        const val = t(key);
        if (val) el.setAttribute('title', val);
      }
    });
  }

  function setLanguage(lang) {
    if (!AVAILABLE_LANGS.includes(lang)) return;
    const prev = currentLang;
    currentLang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); }
    catch (e) {}
    document.documentElement.lang = lang === 'ne' ? 'ne' : 'en';

    let done = Promise.resolve();
    if (lang !== prev) {
      done = _updateLocale(lang);
    }
    done.then(() => {
      applyTranslations();
      _updateToggle();
      window.dispatchEvent(new CustomEvent('i18n:languagechange', { detail: { lang } }));
    });
  }

  async function _updateLocale(lang) {
    await loadLocale(lang);
  }

  function _updateToggle() {
    const toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.setAttribute('title', t('language'));
      toggle.setAttribute('aria-label', t('language'));
      const flag = toggle.querySelector('.lang-flag');
      if (flag) flag.textContent = LANGUAGES[currentLang] || currentLang;
    }
  }

  function createLangToggle() {
    let toggle = document.getElementById('langToggle');
    if (toggle) {
      if (!toggle.dataset.langWired) {
        toggle.title = t('language');
        toggle.setAttribute('aria-label', t('language'));
        toggle.addEventListener('click', () => {
          const next = currentLang === 'en' ? 'ne' : 'en';
          setLanguage(next);
        });
        toggle.dataset.langWired = 'true';
      }
      return toggle;
    }

    function insertAfter(target) {
      if (!target) return null;
      const existing = document.getElementById('langToggle');
      if (existing) return existing;

      toggle = document.createElement('button');
      toggle.id = 'langToggle';
      toggle.type = 'button';
      toggle.className = 'lang-toggle';
      toggle.title = t('language');
      toggle.setAttribute('aria-label', t('language'));
      toggle.innerHTML = `<span class="lang-flag" aria-hidden="true">${LANGUAGES[currentLang] || currentLang}</span><svg class="lang-icon" viewBox="0 0 64 64" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 9h49v6H10z"/><path d="M10 15H59V55H10z"/><path d="M12 8a1 1 0 0 0-1 1v40a1 1 0 0 0 1 1h45c.553 0 1-.447 1-1V9a1 1 0 0 0-1-1H12z"/><path d="M55 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/><path d="M51 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/><path d="M47 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/><path d="M23 31a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h2v4l3.44-4h4a1 1 0 0 0 1-1V32a1 1 0 0 0-1-1h-9z"/><path d="M23 30a1 1 0 0 0-1 1v6a1 1 0 1 0 2 0v-6h7a1 1 0 1 0 0-2h-8z"/><path d="M34 21a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V22a1 1 0 0 1 1-1h1zm-1 0a1 1 0 0 1 1 1v12a1 1 0 0 1-2 0V22a1 1 0 0 1 1-1z"/><path d="M41 33a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm0-12a1 1 0 0 0-1 1v12a1 1 0 0 0 2 0V22a1 1 0 0 0-1-1z"/></svg>`;
      target.insertAdjacentElement('afterend', toggle);

      toggle.addEventListener('click', () => {
        const next = currentLang === 'en' ? 'ne' : 'en';
        setLanguage(next);
      });
      return toggle;
    }

    const infoToggle = document.getElementById('infoToggle');
    if (infoToggle) return insertAfter(infoToggle);

    const observer = new MutationObserver((_mutations, obs) => {
      const found = document.getElementById('infoToggle');
      if (found) {
        obs.disconnect();
        insertAfter(found);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      const found = document.getElementById('infoToggle');
      if (found) insertAfter(found);
      else {
        const fallback = document.getElementById('audioToggle');
        if (fallback) insertAfter(fallback);
      }
    }, 2000);

    return null;
  }

  async function init() {
    currentLang = getStoredLang();
    document.documentElement.lang = currentLang === 'ne' ? 'ne' : 'en';
    await _updateLocale(currentLang);
    applyTranslations();
    createLangToggle();
    window.dispatchEvent(new CustomEvent('i18n:ready', { detail: { lang: currentLang } }));
  }

  window.I18n = {
    t,
    setLanguage,
    getLanguage: () => currentLang,
    getLanguages: () => ({ ...LANGUAGES }),
    isReady: () => Object.keys(translations).length > 0,
    onReady: (callback) => {
      if (translations && Object.keys(translations).length > 0) {
        callback();
      } else {
        window.addEventListener('i18n:ready', () => callback(), { once: true });
      }
    }
  };

  window.addEventListener('DOMContentLoaded', init);
})();
