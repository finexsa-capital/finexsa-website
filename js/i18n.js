/* ============================================================
   FINEXSA Capital — i18n / Language Auto-Detection & Switcher
   ------------------------------------------------------------
   Behaviour:
   1) If user has explicitly chosen a language (clicked switcher) →
      that choice is honoured forever (stored in localStorage).
   2) Else, on first visit only: detect country via IP geolocation
      (ipwho.is — free, no API key, unlimited).
      - Arab country  → Arabic version (root /).
      - Anything else → English version (/en/).
   3) On geolocation failure (offline, ad-blocker, timeout) →
      fall back to navigator.language; if still ambiguous → English.
   4) Manual switching via window.switchLang('ar' | 'en').
   ============================================================ */

(function () {
  'use strict';

  var STORAGE_USER_CHOICE = 'finexsa_lang';        // explicit user pick
  var STORAGE_AUTO_DONE   = 'finexsa_lang_auto';   // auto-detect ran flag
  var SESSION_REDIRECTED  = 'finexsa_redirected';  // prevents redirect loops

  var ARAB_COUNTRIES = [
    'SY','SA','AE','EG','IQ','JO','LB','KW','QA','BH','OM','YE',
    'MA','DZ','TN','LY','SD','MR','PS','SO','DJ','KM'
  ];

  // ---------- Utilities ----------------------------------------

  function detectCurrentLang() {
    return /^\/en(\/|$)/.test(window.location.pathname) ? 'en' : 'ar';
  }

  function getEquivalentUrl(targetLang) {
    var path = window.location.pathname;
    var hash = window.location.hash || '';
    var search = window.location.search || '';

    if (targetLang === 'en') {
      // ar -> en : prepend /en
      if (/^\/en(\/|$)/.test(path)) return path + search + hash;
      // strip trailing slash duplication
      var p = path.startsWith('/') ? path : '/' + path;
      return '/en' + (p === '/' ? '/' : p) + search + hash;
    } else {
      // en -> ar : strip /en prefix
      var stripped = path.replace(/^\/en(\/|$)/, '/');
      return stripped + search + hash;
    }
  }

  function fetchWithTimeout(url, ms) {
    return new Promise(function (resolve, reject) {
      var ctrl = ('AbortController' in window) ? new AbortController() : null;
      var timer = setTimeout(function () {
        if (ctrl) ctrl.abort();
        reject(new Error('timeout'));
      }, ms);
      fetch(url, ctrl ? { signal: ctrl.signal } : undefined)
        .then(function (r) { clearTimeout(timer); resolve(r); })
        .catch(function (e) { clearTimeout(timer); reject(e); });
    });
  }

  function browserFallbackLang() {
    var l = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
    return l.indexOf('ar') === 0 ? 'ar' : 'en';
  }

  // ---------- IP Geolocation -----------------------------------

  function detectByIp() {
    return fetchWithTimeout('https://ipwho.is/', 2500)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.success && data.country_code) {
          return ARAB_COUNTRIES.indexOf(data.country_code) !== -1 ? 'ar' : 'en';
        }
        throw new Error('bad-payload');
      });
  }

  // ---------- Manual Switcher (exposed) ------------------------

  window.switchLang = function (lang) {
    if (lang !== 'ar' && lang !== 'en') return;
    try { localStorage.setItem(STORAGE_USER_CHOICE, lang); } catch (e) {}
    var current = detectCurrentLang();
    if (lang === current) return;
    window.location.href = getEquivalentUrl(lang);
  };

  // ---------- Auto-Detection Flow (runs once) ------------------

  function runAutoDetect() {
    var userChoice;
    try { userChoice = localStorage.getItem(STORAGE_USER_CHOICE); } catch (e) {}
    if (userChoice) return; // user has chosen — never override

    var autoDone;
    try { autoDone = localStorage.getItem(STORAGE_AUTO_DONE); } catch (e) {}
    if (autoDone) return; // already auto-detected on a previous visit

    if (sessionStorage.getItem(SESSION_REDIRECTED)) return; // avoid loops

    var current = detectCurrentLang();

    detectByIp()
      .catch(function () { return browserFallbackLang(); })
      .then(function (detected) {
        try { localStorage.setItem(STORAGE_AUTO_DONE, detected); } catch (e) {}
        if (detected !== current) {
          sessionStorage.setItem(SESSION_REDIRECTED, '1');
          window.location.replace(getEquivalentUrl(detected));
        }
      });
  }

  // ---------- Language Switcher UI Wiring ----------------------

  function wireSwitcher() {
    var current = detectCurrentLang();
    var nodes = document.querySelectorAll('[data-lang-switch]');
    nodes.forEach(function (el) {
      var lang = el.getAttribute('data-lang-switch');
      if (lang === current) {
        el.classList.add('is-active');
        el.setAttribute('aria-current', 'true');
      }
      el.addEventListener('click', function (e) {
        e.preventDefault();
        window.switchLang(lang);
      });
    });
  }

  // ---------- Boot ---------------------------------------------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireSwitcher);
  } else {
    wireSwitcher();
  }

  // Run auto-detect after the page paints — non-blocking.
  if (window.requestIdleCallback) {
    requestIdleCallback(runAutoDetect, { timeout: 1500 });
  } else {
    setTimeout(runAutoDetect, 50);
  }
})();
