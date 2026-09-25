(function() {
  if (window.__loadFirebaseFallback) {
    return;
  }

  window.__loadFirebaseFallback = function(scriptEl) {
    if (!scriptEl) return;
    const fallbackSrc = scriptEl.dataset && scriptEl.dataset.fallback;
    if (!fallbackSrc) return;

    const original = scriptEl.dataset.original || fallbackSrc;

    console.warn('[firebase] CDN non raggiungibile per', original, '- utilizzo fallback locale:', fallbackSrc);

    if (window.errorLogger && typeof window.errorLogger.log === 'function') {
      try {
        window.errorLogger.log('firebase_cdn_fallback', { script: original, fallback: fallbackSrc });
      } catch (e) {
        console.warn('Errore logging fallback firebase:', e);
      }
    }

    scriptEl.onerror = null;
    scriptEl.src = fallbackSrc;
  };
})();


