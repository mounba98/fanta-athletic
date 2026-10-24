// Fazione e nome reale dell'utente — D072.
// Fazione: "curva" (Curva Morello) o "piana" (Piana), in users/{uid}.fazione.
// Si sceglie UNA VOLTA PER SQUADRA: se la squadra ha già una fazione
// (leagues/{lega}/teams/{n}.fazione) chi arriva dopo la eredita senza
// scegliere. La scelta non si cambia dalla pagina, solo un admin può.
// Nome reale (o soprannome riconoscibile): users/{uid}.nomeReale, per gli admin.
// Allenatore (D108): leagues/{lega}/teams/{n}.coach_ids = [id]. Se la squadra non
// ce l'ha, il primo membro che entra lo sceglie (i compagni lo ereditano). Resta
// da una stagione all'altra; lo cambiano solo gli admin (su richiesta, all'asta).
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
    // Documento della squadra dell'utente (null se nessuna o non leggibile)
    async readTeam(userData) {
      try {
        const lid = userData.currentLeague, idx = userData.team_index;
        if (!lid || idx === null || idx === undefined) return null;
        const t = await root.db.collection('leagues/' + lid + '/teams').doc(String(idx)).get();
        return t.exists ? t.data() : null;
      } catch (e) { return null; }
    },
    // Allenatori: catalogo generale + quelli della lega (stessa logica di formazioni/squadre)
    async readCoaches(userData) {
      const map = new Map();
      try {
        const r = await fetch('resources/coaches.json');
        const j = await r.json();
        (j.coaches || []).forEach(c => map.set(c.coach_id, c));
      } catch (e) {}
      try {
        const lid = userData.currentLeague;
        if (lid) {
          const snap = await root.db.collection('leagues/' + lid + '/coaches').get();
          snap.docs.forEach(d => map.set(d.id, Object.assign({ coach_id: d.id }, map.get(d.id) || {}, d.data())));
        }
      } catch (e) {}
      return Array.from(map.values()).filter(c => c && c.coach_id && c.active !== false);
    },
    async writeTeamCoach(userData, coachId) {
      const lid = userData.currentLeague, idx = userData.team_index;
      await root.db.collection('leagues/' + lid + '/teams').doc(String(idx)).set({ coach_ids: [coachId] }, { merge: true });
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
          'Resta alla tua squadra anche nelle prossime stagioni: per cambiarla, una volta l\'anno all\'asta, chiedi agli admin.</p>' +
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
          '<p style="margin:0 0 20px;color:#94a3b8;font-size:14px;">Dopo potranno cambiarla solo gli admin.</p>' +
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

  // Foto dell'allenatore (stessa logica di formazioni/squadre)
  function coachPhoto(c) {
    const p = c.photo_url || c.photoUrl || c.photo || c.image_url || c.imageUrl || '';
    if (p) return p;
    const n = String(c.nome || c.name || '').toLowerCase(), id = String(c.coach_id || '').toLowerCase();
    if (n === 'tommy' || id === 'tommy') return 'resources/tommy_guardu.png';
    if (n === 'trendiu' || id === 'trendiu') return 'resources/trendiu_athletic.jpg';
    if (n === 'mario' || id === 'mario') return 'resources/mario_athletic.jpg';
    return '';
  }

  // Passo allenatore (D108): risolve con l'id scelto (null se non salvabile)
  function askCoach(ui, userData, coaches) {
    return new Promise(resolve => {
      const box = ui.box;
      const nameOf = c => c.nome || c.name || c.coach_id;
      function face(c, size) {
        const ph = coachPhoto(c);
        return ph
          ? '<img src="' + esc(ph) + '" alt="" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;flex:none;">'
          : '<span style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:#334155;display:inline-flex;align-items:center;justify-content:center;font-weight:800;font-size:' + Math.round(size / 2.4) + 'px;flex:none;">' + esc(nameOf(c).charAt(0).toUpperCase()) + '</span>';
      }
      function choose() {
        box.innerHTML =
          '<h2 style="margin:0 0 8px;font-size:22px;">Chi è il vostro allenatore?</h2>' +
          '<p style="margin:0 0 20px;color:#94a3b8;font-size:14px;">Scegli l\'allenatore della tua squadra. ' +
          'Resta anche nelle prossime stagioni: per cambiarlo, una volta l\'anno all\'asta, chiedi agli admin.</p>' +
          '<div style="display:grid;gap:10px;">' +
          coaches.map(c =>
            '<button type="button" data-c="' + esc(c.coach_id) + '" style="display:flex;align-items:center;gap:14px;padding:12px 16px;' +
            'border:2px solid #334155;border-radius:14px;background:#0f172a;color:#f1f5f9;font-size:18px;font-weight:700;cursor:pointer;text-align:left;">' +
            face(c, 48) + '<span>' + esc(nameOf(c)) + '</span></button>').join('') + '</div>';
        box.querySelectorAll('button[data-c]').forEach(b => b.addEventListener('click', () => confirm(b.getAttribute('data-c'))));
      }
      function confirm(id) {
        const c = coaches.find(x => x.coach_id === id);
        box.innerHTML =
          '<div style="display:flex;justify-content:center;margin-bottom:12px;">' + face(c, 88) + '</div>' +
          '<h2 style="margin:0 0 8px;font-size:22px;">Confermi ' + esc(nameOf(c)) + '?</h2>' +
          '<p style="margin:0 0 20px;color:#94a3b8;font-size:14px;">Vale per tutta la squadra. Dopo potranno cambiarlo solo gli admin.</p>' +
          '<div id="factionMsg" style="color:#f87171;font-size:13px;min-height:18px;margin-bottom:8px;"></div>' +
          '<div style="display:flex;gap:10px;">' +
          '<button type="button" id="coachBack" style="flex:1;padding:14px;border:none;border-radius:12px;background:#475569;color:#fff;font-weight:600;cursor:pointer;">Indietro</button>' +
          '<button type="button" id="coachOk" style="flex:1;padding:14px;border:none;border-radius:12px;background:#16a34a;color:#fff;font-weight:700;cursor:pointer;">Conferma</button></div>';
        box.querySelector('#coachBack').addEventListener('click', choose);
        box.querySelector('#coachOk').addEventListener('click', async function() {
          this.disabled = true;
          try {
            await api._store.writeTeamCoach(userData, id);
            resolve(id);
          } catch (e) {
            console.error('[faction] allenatore non salvato', e);
            // Non si resta bloccati: si avvisa e si lascia entrare (lo sistemerà un admin)
            box.querySelector('#factionMsg').textContent = 'Non è stato possibile salvare: avvisa un admin. Puoi comunque continuare.';
            this.textContent = 'Continua'; this.disabled = false;
            this.onclick = () => resolve(null);
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

      // Allenatore della squadra (D108): da scegliere solo se la squadra non ce l'ha
      let coaches = [];
      const team = await api._store.readTeam(data);
      const needsCoach = !!team && !(Array.isArray(team.coach_ids) && team.coach_ids.length > 0);
      if (needsCoach) coaches = await api._store.readCoaches(data);
      const askForCoach = needsCoach && coaches.length > 0;

      if (faction && hasName && !askForCoach) return faction;

      const ui = openBox();
      try {
        if (!faction) faction = await askFaction(ui, uid, data);
        if (!hasName) await askName(ui, uid);
        if (askForCoach) await askCoach(ui, data, coaches);
      } finally {
        closeBox(ui.overlay);
      }
      return faction;
    }
  };

  root.FactionSystem = api;
})(typeof window !== 'undefined' ? window : globalThis);
