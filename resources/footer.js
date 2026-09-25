/**
 * Footer Component v1.0
 * Aggiunge footer con link legali a tutte le pagine
 */

(function() {
  'use strict';

  // Pagine dove non aggiungere il footer (hanno già un footer custom)
  const EXCLUDE_PAGES = ['privacy.html', 'terms.html', 'cookie-policy.html'];

  const currentPage = window.location.pathname.split('/').pop();
  if (EXCLUDE_PAGES.includes(currentPage)) {
    return;
  }

  // Verifica se il footer esiste già
  if (document.querySelector('footer[data-fanta-footer]')) {
    return;
  }

  function createFooter() {
    const footer = document.createElement('footer');
    footer.setAttribute('data-fanta-footer', 'true');
    footer.style.cssText = `
      margin-top: 40px;
      padding: 20px 20px;
      background: var(--card, #ffffff);
      border-top: 1px solid var(--border, #e2e8f0);
      text-align: center;
    `;

    const darkMode = document.documentElement.classList.contains('dark');
    if (darkMode) {
      footer.style.background = '#1e293b';
      footer.style.borderTopColor = '#334155';
    }

    // Il rosso del brand (--primary, #920100) è pensato per sfondi chiari:
    // su sfondo scuro il contrasto è troppo basso per leggerlo, quindi in
    // tema scuro i link usano un rosso più chiaro.
    const linkColor = darkMode ? '#f87171' : 'var(--primary, #920100)';
    const linkStyle = `color: ${linkColor}; text-decoration: none; font-size: 14px; transition: opacity 0.2s;`;

    footer.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; text-align: center;">
        <p style="margin: 0 0 8px 0; color: var(--muted, #64748b); font-size: 14px; text-align: center;">
          © 2025 Fanta Athletic. Tutti i diritti riservati.
        </p>
        <div style="display: flex; justify-content: center; align-items: center; gap: 8px 20px; flex-wrap: wrap; margin-top: 4px; text-align: center;">
          <a href="privacy.html" style="${linkStyle}" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Privacy Policy</a>
          <a href="terms.html" style="${linkStyle}" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Termini e Condizioni</a>
          <a href="cookie-policy.html" style="${linkStyle}" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Cookie Policy</a>
          <a href="javascript:void(0);" onclick="if(typeof window.manageCookieConsent==='function')window.manageCookieConsent();" style="${linkStyle} cursor: pointer;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Gestisci Cookie</a>
        </div>
        <p style="margin: 8px 0 0 0; color: var(--muted, #64748b); font-size: 12px; opacity: 0.7; text-align: center;">
          Created by Nicola Mocci
        </p>
      </div>
    `;

    // Inserisci prima della chiusura del body
    document.body.appendChild(footer);
  }

  // Inizializza quando il DOM è pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFooter);
  } else {
    createFooter();
  }

})();







