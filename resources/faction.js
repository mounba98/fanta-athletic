// Fazione e nome reale dell'utente — D072.
// Fazione: "curva" (Curva Morello) o "piana" (Piana), in users/{uid}.fazione.
// Si sceglie UNA VOLTA PER SQUADRA: se la squadra ha già una fazione
// (leagues/{lega}/teams/{n}.fazione) chi arriva dopo la eredita senza
// scegliere. La scelta non si cambia dalla pagina, solo un admin può.
// Nome reale (o soprannome riconoscibile): users/{uid}.nomeReale, per gli admin.
// ensure(user) mostra finestre NON chiudibili finché manca qualcosa.
(function(root) {
  'use strict';

  const FACTIONS = { curva: 'Curva Morello', piana: 'Piana' };

  const store = {
    async readUser(uid) {
      const d = await root.db.collection('users').doc(uid).get();
      return d.exists ? d.data() : {};
    },
    // Fazione già scelta dalla squadra dell'utente (null se nessuna o non leggibile)
    async readTeamFaction(userData) {
      try {
        const lid = userData.currentLeague;
        const idx = userData.team_index;
        if (!lid || idx === null || idx === undefined) return null;
        const t = await root.db.collection('leagues/' + lid + '/teams').doc(String(idx)).get();
        const f = t.exists ? t.data().fazione : null;
        return FACTIONS[f] ? f : null;
      } catch (e) { return null; }
    },
    async writeUser(uid, fields) {
      await root.db.collection('users').doc(uid).set(fields, { merge: true });
    },
    // Best effort: se le regole non lo permettono resta solo sull'utente
    async writeTeamFaction(userData, faction) {
      try {
        const lid = userData.currentLeague, idx = userData.team_index;
        if (!lid || idx === null || idx === undefined) return;
        await root.db.collection('leagues/' + lid + '/teams').doc(String(idx)).set({ fazione: faction }, { merge: true });
      } catch (e) { console.warn('[faction] fazione non salvata sulla squadra', e && (e.code || e.message)); }
    }
  };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function openBox() {
    const overlay = document.createElement('div');
    overlay.id = 'factionOverlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:100000;background:rgba(2,6,23,.92);' +
      'display:flex;align-items:center;justify-content:center;padding:20px;';
    const box = document.createElement('div');
    box.style.cssText = 'background:#1e293b;color:#f1f5f9;border-radius:16px;padding:28px;' +
      'max-width:420px;width:100%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);' +
      'font-family:var(--font-sans, Inter, sans-serif);';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    return { overlay, box };
  }

  function closeBox(overlay) {
    overlay.remove();
    document.body.style.overflow = '';
  }

  // Passo fazione: risolve con 'curva' | 'piana' (già salvata)
  function askFaction(ui, uid, userData) {
    return new Promise(resolve => {
      const box = ui.box;
      function choose() {
        box.innerHTML =
          '<h2 style="margin:0 0 8px;font-size:22px;">Da che parte stai?</h2>' +
          '<p style="margin:0 0 20px;color:#94a3b8;font-size:14px;">Scegli la fazione della tua squadra. ' +
          'Vale per tutta la stagione e non si potrà cambiare.</p>' +
          '<div style="display:grid;gap:12px;">' +
          Object.keys(FACTIONS).map(id =>
            '<button type="button" data-f="' + id + '" style="padding:16px;border:none;border-radius:12px;' +
            'font-size:18px;font-weight:700;cursor:pointer;color:#fff;background:' +
            (id === 'curva' ? '#920100' : '#0c0f6d') + ';">' + esc(FACTIONS[id]) + '</button>').join('') + '</div>';
        box.querySelectorAll('button[data-f]').forEach(b => b.addEventListener('click', () => confirm(b.getAttribute('data-f'))));
      }
      function confirm(id) {
        box.innerHTML =
          '<h2 style="margin:0 0 8px;font-size:22px;">Confermi ' + esc(FACTIONS[id]) + '?</h2>' +
          '<p style="margin:0 0 20px;color:#94a3b8;font-size:14px;">La scelta è definitiva.</p>' +
          '<div id="factionMsg" style="color:#f87171;font-size:13px;min-height:18px;margin-bottom:8px;"></div>' +
          '<div style="display:flex;gap:10px;">' +
          '<button type="button" id="factionBack" style="flex:1;padding:14px;border:none;border-radius:12px;background:#475569;color:#fff;font-weight:600;cursor:pointer;">Indietro</button>' +
          '<button type="button" id="factionOk" style="flex:1;padding:14px;border:none;border-radius:12px;background:#16a34a;color:#fff;font-weight:700;cursor:pointer;">Conferma</button></div>';
        box.querySelector('#factionBack').addEventListener('click', choose);
        box.querySelector('#factionOk').addEventListener('click', async function() {
          this.disabled = true;
          try {
            await api._store.writeUser(uid, { fazione: id, fazioneAt: new Date().toISOString() });
            await api._store.writeTeamFaction(userData, id);
            resolve(id);
          } catch (e) {
            console.error('[faction] salvataggio fallito', e);
            box.querySelector('#factionMsg').textContent = 'Errore nel salvataggio, riprova.';
            this.disabled = false;
          }
        });
      }
      choose();
    });
  }

  // Passo nome reale: risolve col nome salvato
  function askName(ui, uid) {
    return new Promise(resolve => {
      const box = ui.box;
      box.innerHTML =
        '<h2 style="margin:0 0 8px;font-size:22px;">Come ti chiami?</h2>' +
        '<p style="margin:0 0 16px;color:#94a3b8;font-size:14px;">Nome e cognome (o un soprannome con cui ti riconoscono tutti). ' +
        'Serve agli admin per capire chi sei; non compare nelle classifiche.</p>' +
        '<input id="factionName" type="text" maxlength="60" autocomplete="name" placeholder="es. Mario Rossi" ' +
        'style="width:100%;box-sizing:border-box;padding:14px;border-radius:12px;border:2px solid #334155;background:#0f172a;color:#f1f5f9;font-size:16px;margin-bottom:8px;">' +
        '<div id="factionMsg" style="color:#f87171;font-size:13px;min-height:18px;margin-bottom:8px;"></div>' +
        '<button type="button" id="factionNameOk" style="width:100%;padding:14px;border:none;border-radius:12px;background:#16a34a;color:#fff;font-weight:700;font-size:16px;cursor:pointer;">Salva</button>';
      const input = box.querySelector('#factionName');
      box.querySelector('#factionNameOk').addEventListener('click', async function() {
        const v = input.value.trim().replace(/\s+/g, ' ');
        if (v.length < 2) { box.querySelector('#factionMsg').textContent = 'Scrivi almeno 2 caratteri.'; return; }
        this.disabled = true;
        try {
          await api._store.writeUser(uid, { nomeReale: v });
          resolve(v);
        } catch (e) {
          console.error('[faction] nome non salvato', e);
          box.querySelector('#factionMsg').textContent = 'Errore nel salvataggio, riprova.';
          this.disabled = false;
        }
      });
    });
  }

  const api = {
    FACTIONS,
    _store: store,
    async get(uid) {
      const u = await api._store.readUser(uid);
      return FACTIONS[u.fazione] ? u.fazione : null;
    },
    // Risolve con la fazione. Blocca la pagina finché mancano fazione e nome reale.
    async ensure(user) {
      const uid = user.uid;
      const data = await api._store.readUser(uid);
      let faction = FACTIONS[data.fazione] ? data.fazione : null;
      const hasName = typeof data.nomeReale === 'string' && data.nomeReale.trim().length >= 2;

      // Squadra con fazione già scelta da un compagno: si eredita senza chiedere
      if (!faction) {
        const inherited = await api._store.readTeamFaction(data);
        if (inherited) {
          await api._store.writeUser(uid, { fazione: inherited, fazioneAt: new Date().toISOString(), fazioneDa: 'squadra' });
          faction = inherited;
        }
      }

      if (faction && hasName) return faction;

      const ui = openBox();
      try {
        if (!faction) faction = await askFaction(ui, uid, data);
        if (!hasName) await askName(ui, uid);
      } finally {
        closeBox(ui.overlay);
      }
      return faction;
    }
  };

  root.FactionSystem = api;
})(typeof window !== 'undefined' ? window : globalThis);
