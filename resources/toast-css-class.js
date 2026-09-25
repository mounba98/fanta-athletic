/**
 * toast(msg) — variante basata sulla classe CSS ".toast" (richiede che la
 * pagina definisca ".toast { ... }" nel proprio <style>, con animazione
 * "slideIn"). Diversa dalla variante a stile inline in resources/toast.js:
 * NON caricare entrambi i file nella stessa pagina.
 *
 * Prima era ridefinita (identica) in admin-calendario.html e contest.html.
 * Centralizzata qui il 2026-09-19 senza cambiare il comportamento; il CSS
 * ".toast" resta nella pagina (non è stato toccato).
 */
if (typeof window !== 'undefined' && typeof window.toast !== 'function') {
  window.toast = function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  };
}
