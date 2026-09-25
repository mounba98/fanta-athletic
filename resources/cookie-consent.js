/**
 * Cookie Consent Manager v1.0
 * Gestisce il consenso per localStorage e cookie tecnici
 */

(function() {
  'use strict';

  const CONSENT_KEY = 'fantaAthletic_cookie_consent';
  const CONSENT_VERSION = '1.0';
  const CONSENT_EXPIRY_DAYS = 365;

  // Pagine pubbliche dove non mostrare il banner
  const PUBLIC_PAGES = ['privacy.html', 'terms.html', 'cookie-policy.html', 'auth.html', 'login.html', 'register.html'];
  const currentPage = window.location.pathname.split('/').pop();

  if (PUBLIC_PAGES.includes(currentPage)) {
    return; // Non mostrare banner su pagine legali
  }

  function hasConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (!stored) return false;
      const consent = JSON.parse(stored);
      // Verifica versione e scadenza
      if (consent.version !== CONSENT_VERSION) return false;
      if (consent.expiry && new Date(consent.expiry) < new Date()) return false;
      return consent.accepted === true;
    } catch (e) {
      return false;
    }
  }

  function saveConsent(accepted) {
    try {
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + CONSENT_EXPIRY_DAYS);
      const consent = {
        accepted: accepted,
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
        expiry: expiry.toISOString()
      };
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
      return true;
    } catch (e) {
      console.warn('[cookie-consent] Impossibile salvare consenso:', e);
      return false;
    }
  }

  function createBanner() {
    // Rimuovi banner esistente se presente
    const existing = document.getElementById('cookieConsentBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'cookieConsentBanner';
    banner.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: var(--card, #ffffff);
      border-top: 2px solid var(--primary, #920100);
      padding: 20px;
      box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-width: 100%;
    `;

    const darkMode = document.documentElement.classList.contains('dark');
    if (darkMode) {
      banner.style.background = '#1e293b';
      banner.style.color = '#e2e8f0';
    }

    banner.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px; max-width: 1200px; margin: 0 auto; width: 100%;">
        <div style="display: flex; align-items: flex-start; gap: 16px; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 280px;">
            <h3 style="margin: 0 0 8px 0; color: var(--primary, #920100); font-size: 18px; font-weight: 600;">
              🍪 Utilizziamo cookie e localStorage
            </h3>
            <p style="margin: 0; font-size: 14px; line-height: 1.5; color: var(--text, #1e293b);">
              Utilizziamo cookie tecnici essenziali e localStorage per salvare le tue preferenze (tema, lega selezionata) e mantenere la sessione di login. 
              <a href="cookie-policy.html" style="color: var(--primary, #920100); text-decoration: underline;">Maggiori informazioni</a>
            </p>
          </div>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center;">
            <button id="cookieConsentAccept" style="
              padding: 10px 20px;
              background: var(--primary, #920100);
              color: white;
              border: none;
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
              transition: opacity 0.2s;
            ">Accetta</button>
            <button id="cookieConsentReject" style="
              padding: 10px 20px;
              background: transparent;
              color: var(--text, #1e293b);
              border: 2px solid var(--border, #e2e8f0);
              border-radius: 8px;
              font-weight: 600;
              cursor: pointer;
              font-size: 14px;
              transition: opacity 0.2s;
            ">Rifiuta</button>
            <a href="cookie-policy.html" style="
              padding: 10px 16px;
              color: var(--muted, #64748b);
              text-decoration: none;
              font-size: 14px;
            ">Gestisci</a>
          </div>
        </div>
      </div>
    `;

    // Stili dark mode per i bottoni
    if (darkMode) {
      const rejectBtn = banner.querySelector('#cookieConsentReject');
      if (rejectBtn) {
        rejectBtn.style.color = '#e2e8f0';
        rejectBtn.style.borderColor = '#475569';
      }
      const manageLink = banner.querySelector('a[href="cookie-policy.html"]');
      if (manageLink) {
        manageLink.style.color = '#94a3b8';
      }
    }

    document.body.appendChild(banner);

    // Event listeners
    const acceptBtn = document.getElementById('cookieConsentAccept');
    const rejectBtn = document.getElementById('cookieConsentReject');

    acceptBtn.addEventListener('click', () => {
      if (saveConsent(true)) {
        banner.style.display = 'none';
        // Mostra messaggio di conferma
        showToast('✅ Preferenze salvate');
      } else {
        showToast('⚠️ Errore nel salvataggio delle preferenze');
      }
    });

    rejectBtn.addEventListener('click', () => {
      if (saveConsent(false)) {
        banner.style.display = 'none';
        showToast('⚠️ Alcune funzionalità potrebbero non funzionare correttamente');
        // Opzionale: cancella localStorage (tranne quello essenziale)
        clearNonEssentialStorage();
      }
    });

    // Hover effects
    [acceptBtn, rejectBtn].forEach(btn => {
      btn.addEventListener('mouseenter', () => btn.style.opacity = '0.8');
      btn.addEventListener('mouseleave', () => btn.style.opacity = '1');
    });
  }

  function clearNonEssentialStorage() {
    try {
      const essentialKeys = [
        CONSENT_KEY,
        'fantaAthletic_theme', // Mantieni tema anche se rifiuti
        'last_league_id' // Mantieni lega per UX
      ];
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !essentialKeys.includes(key)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log('[cookie-consent] Rimossi dati non essenziali');
    } catch (e) {
      console.warn('[cookie-consent] Errore nella pulizia:', e);
    }
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: var(--card, #ffffff);
      color: var(--text, #1e293b);
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10001;
      font-size: 14px;
      font-weight: 500;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Inizializza quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    if (!hasConsent()) {
      // Aspetta un po' prima di mostrare il banner (non invasivo)
      setTimeout(() => {
        createBanner();
      }, 1000);
    }
  }

  // Esponi funzione globale per gestire consenso manualmente
  window.manageCookieConsent = function() {
    if (hasConsent()) {
      if (confirm('Vuoi revocare il consenso ai cookie? Alcune funzionalità potrebbero non funzionare.')) {
        saveConsent(false);
        clearNonEssentialStorage();
        showToast('Consenso revocato');
      }
    } else {
      createBanner();
    }
  };

})();







