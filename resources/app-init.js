/**
 * App Initialization Script
 * Include questo dopo Firebase init per setup completo app
 * v2025101905
 */

// Verifica che Firebase sia inizializzato
if (typeof firebase === 'undefined' || !firebase.apps.length) {
  console.warn('⚠️ Firebase not initialized! Include firebase scripts before app-init.js');
} else {
  console.log('✅ Firebase initialized successfully');
}

function ensureHeaderStructure() {
  if (document.body && document.body.dataset.disableAutoHeader === 'true') {
    return;
  }

  if (document.querySelector('header')) {
    return;
  }

  if (!document.body) {
    return;
  }

  const header = document.createElement('header');
  header.className = 'auto-header';

  const logo = document.createElement('a');
  logo.className = 'logo-home';
  logo.href = 'index.html';
  logo.setAttribute('aria-label', 'Home');
  logo.innerHTML = '<img src="resources/logo.png" alt="Fanta Athletic" />';

  const titleText = document.body.dataset.headerTitle || document.title || 'Fanta Athletic';
  const subtitleText = document.body.dataset.headerSubtitle || '';

  const title = document.createElement('h1');
  title.textContent = titleText;

  header.appendChild(logo);
  header.appendChild(title);

  if (subtitleText) {
    const subtitle = document.createElement('p');
    subtitle.textContent = subtitleText;
    header.appendChild(subtitle);
  }

  document.body.insertBefore(header, document.body.firstChild);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', ensureHeaderStructure);
} else {
  ensureHeaderStructure();
}

// Load auth-guard (login obbligatorio)
const authGuardScript = document.createElement('script');
authGuardScript.src = 'resources/auth-guard.js?v=20260925d';
document.head.appendChild(authGuardScript);

// Load league-selector (dropdown navbar)
const leagueSelectorScript = document.createElement('script');
leagueSelectorScript.src = 'resources/league-selector.js?v=20260925l';
document.head.appendChild(leagueSelectorScript);

// Load mobile-header-fix (forza header identico a home su tutte le pagine mobile)
const mobileHeaderFixScript = document.createElement('script');
mobileHeaderFixScript.src = 'resources/mobile-header-fix.js?v=20260925c';
document.head.appendChild(mobileHeaderFixScript);

// Load cup-service (supporto coppe opzionali)
const cupServiceScript = document.createElement('script');
cupServiceScript.src = 'resources/cup-service.js?v=20260920-final';
document.head.appendChild(cupServiceScript);

console.log('✅ App initialization scripts loaded');
