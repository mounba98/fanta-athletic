/**
 * showToast(msg) — usa window.toast() se disponibile, altrimenti mostra un
 * box blu di fallback (stile leggermente diverso da resources/toast.js:
 * ombra e durata differenti, valori originali mantenuti invariati).
 *
 * Prima erano ridefinite (identiche) in classifiche.html e
 * lineup-summary.html. Centralizzate qui il 2026-09-19 senza cambiare il
 * comportamento.
 */
if (typeof window !== 'undefined') {
  if (typeof window.showFallbackToast !== 'function') {
    window.showFallbackToast = function showFallbackToast(msg) {
      const el = document.createElement('div');
      el.textContent = msg;
      el.style.position = 'fixed';
      el.style.bottom = '16px';
      el.style.right = '16px';
      el.style.background = '#0c0f6d';
      el.style.color = '#fff';
      el.style.padding = '10px 14px';
      el.style.borderRadius = '8px';
      el.style.boxShadow = '0 10px 30px rgba(15,23,42,0.4)';
      el.style.zIndex = '9999';
      document.body.appendChild(el);
      setTimeout(() => { el.remove(); }, 2500);
    };
  }

  if (typeof window.showToast !== 'function') {
    window.showToast = function showToast(msg) {
      if (typeof window.toast === 'function') {
        window.toast(msg);
      } else {
        window.showFallbackToast(msg);
      }
    };
  }
}
