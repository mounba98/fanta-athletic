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
      margin-top: 60px;
      padding: 30px 20px;
      background: var(--card, #ffffff);
      border-top: 1px solid var(--border, #e2e8f0);
      text-align: center;
    `;

    const darkMode = document.documentElement.classList.contains('dark');
    if (darkMode) {
      footer.style.background = '#1e293b';
      footer.style.borderTopColor = '#334155';
    }

    footer.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto;">
        <p style="margin: 0 0 12px 0; color: var(--muted, #64748b); font-size: 14px;">
          © 2025 Fanta Athletic. Tutti i diritti riservati.
        </p>
        <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap; margin-top: 12px;">
          <a href="privacy.html" style="color: var(--primary, #dc143c); text-decoration: none; font-size: 14px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Privacy Policy</a>
          <a href="terms.html" style="color: var(--primary, #dc143c); text-decoration: none; font-size: 14px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Termini e Condizioni</a>
          <a href="cookie-policy.html" style="color: var(--primary, #dc143c); text-decoration: none; font-size: 14px; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Cookie Policy</a>
          <a href="javascript:void(0);" onclick="if(typeof window.manageCookieConsent==='function')window.manageCookieConsent();" style="color: var(--primary, #dc143c); text-decoration: none; font-size: 14px; cursor: pointer; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='1'">Gestisci Cookie</a>
        </div>
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







