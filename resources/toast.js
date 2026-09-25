/**
 * toast(msg) — messaggio di conferma temporaneo in basso a destra.
 *
 * Prima era ridefinita (identica) in formazioni.html, matchday.html,
 * squadre.html e auth.html. Centralizzata qui il 2026-09-19 senza cambiare
 * l'aspetto né il comportamento: stesso box blu, stessa durata (2 secondi).
 *
 * Non tocca le pagine che usano una versione diversa di toast() basata su
 * una classe CSS (.toast) invece che su stile inline, es. admin-calendario.html
 * e contest.html — quelle restano come sono, sono un'altra implementazione.
 */
if (typeof window !== 'undefined' && typeof window.toast !== 'function') {
  window.toast = function toast(msg) {
    const el = document.createElement('div');
    el.textContent = msg;
    el.style.position = 'fixed';
    el.style.bottom = '16px';
    el.style.right = '16px';
    el.style.background = '#0c0f6d';
    el.style.color = '#fff';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '8px';
    el.style.boxShadow = 'var(--shadow)';
    el.style.zIndex = '9999';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  };
}
