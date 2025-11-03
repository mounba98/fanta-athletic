(function() {
  'use strict';

  const card = document.getElementById('lastMatchCard');
  if (!card || typeof firebase === 'undefined') {
    return;
  }

  const labelEl = document.getElementById('lastMatchLabel');
  const contentEl = document.getElementById('lastMatchContent');
  const actionEl = document.getElementById('lastMatchAction');
  const detailBtn = document.getElementById('lastMatchDetailBtn');
  const recentResultsEl = document.getElementById('recentResults');
  const titleEl = document.querySelector('#lastMatchCard h2');

  let detailHref = null;
  const FALLBACK_GIORNATE = Array.from({ length: 24 }, (_, i) => `G${i + 1}`);
  
  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderPlaceholder({
    totalLabel = 'Totale squadra',
    totalValue = '--',
    metaLabel = 'Stato',
    metaText = 'In attesa dati',
    pillLabel = 'Stato',
    pillValue = metaText
  } = {}) {
    if (!contentEl) return;

    contentEl.innerHTML = `
      <div class="match-summary-total">
        <div>
          <span class="match-summary-total-label">${escapeHtml(totalLabel)}</span>
          <div class="match-summary-total-value">${escapeHtml(totalValue)}</div>
        </div>
        <div class="match-summary-total-meta">
          <span class="meta-label">${escapeHtml(metaLabel)}</span>
          <span class="meta-text">${escapeHtml(metaText)}</span>
        </div>
      </div>
      <div class="match-summary-breakdown">
        <div class="match-pill">
          <span>${escapeHtml(pillLabel)}</span>
          <strong class="match-summary-empty">${escapeHtml(pillValue)}</strong>
        </div>
      </div>
    `;
  }

  function setRecentPlaceholder(message) {
    if (!recentResultsEl) return;
    recentResultsEl.innerHTML = `
      <div class="recent-results-placeholder">${escapeHtml(message || 'Nessun dato disponibile')}</div>
    `;
  }

  function setLoading(message) {
    if (titleEl) titleEl.textContent = 'Ultimo Risultato';
    if (labelEl) {
      labelEl.innerHTML = `<span class="match-summary-team">${escapeHtml(message || 'Caricamento…')}</span>`;
    }
    renderPlaceholder({
      metaLabel: 'Caricamento…',
      metaText: message || 'Recupero dell’ultimo risultato in corso',
      pillValue: message || 'Caricamento…'
    });
    if (actionEl) {
      actionEl.style.display = 'none';
    }
    detailHref = null;
    setRecentPlaceholder(message || 'Caricamento…');
  }

  function setEmpty(message) {
    if (titleEl) titleEl.textContent = 'Ultimo Risultato';
    if (labelEl) {
      labelEl.innerHTML = '<span class="match-summary-team">Nessuna giornata calcolata</span>';
    }
    renderPlaceholder({
      metaLabel: 'Nessun risultato',
      metaText: message || 'Calcola almeno una giornata per vedere il riepilogo.',
      pillValue: message || 'Nessun risultato calcolato'
    });
    if (actionEl) {
      actionEl.style.display = 'none';
    }
    detailHref = null;
    setRecentPlaceholder(message || 'Ancora nessun risultato disponibile.');
  }

  function formatGiornata(id) {
    if (!id) return '';
    const num = Number((id || '').replace(/[^0-9]/g, ''));
    return Number.isFinite(num) ? `Giornata ${num}` : id;
  }

  function formatPoints(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return '0.0';
    return num.toFixed(1);
  }

  function renderResult(giornataId, teamName, resultData, teamId) {
    const breakdown = resultData.breakdown || {};
    const tiles = [
      { label: 'Totale squadra', value: formatPoints(resultData.points) },
      { label: 'Giocatori', value: formatPoints(breakdown.players) },
      { label: 'Capitano', value: formatPoints(breakdown.captain) },
      { label: 'Allenatore', value: formatPoints(breakdown.coach) },
      { label: 'Curva', value: formatPoints(breakdown.curva) }
    ];

    if (breakdown.formation) {
      tiles.splice(1, 0, { label: 'Formazione pubblicata', value: formatPoints(breakdown.formation) });
    }

    if (labelEl) {
      labelEl.innerHTML = `
        <span class="match-summary-team">${escapeHtml(teamName)}</span>
        <span class="match-summary-giornata">${escapeHtml(formatGiornata(giornataId))}</span>
      `;
    }
    if (titleEl) {
      titleEl.textContent = 'Ultimo Risultato';
    }

    const totalTile = tiles.shift();
    if (!totalTile) {
      renderPlaceholder({
        metaLabel: formatGiornata(giornataId),
        metaText: 'Nessun punteggio disponibile per questa giornata.'
      });
      return;
    }

    const metaText = tiles.length
      ? 'Dettagli disponibili nei riquadri sottostanti.'
      : 'Nessun dettaglio registrato per questa giornata.';

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="match-summary-total">
          <div>
            <span class="match-summary-total-label">${escapeHtml(totalTile.label)}</span>
            <div class="match-summary-total-value">${escapeHtml(totalTile.value)}</div>
          </div>
          <div class="match-summary-total-meta">
            <span class="meta-label">${escapeHtml(formatGiornata(giornataId))}</span>
            <span class="meta-text">${escapeHtml(metaText)}</span>
          </div>
        </div>
        <div class="match-summary-breakdown">
          ${tiles.map(tile => `
            <div class="match-pill">
              <span>${escapeHtml(tile.label)}</span>
              <strong>${escapeHtml(tile.value)}</strong>
            </div>
          `).join('')}
        </div>
      `;
    }

    const params = new URLSearchParams({ g: giornataId });
    if (teamId) {
      params.set('team', teamId);
    }
    detailHref = `lineup-summary.html?${params.toString()}`;
    if (actionEl) {
      actionEl.style.display = 'flex';
    }
  }

  function renderRecentResults(entries) {
    if (!recentResultsEl) return;
    if (!Array.isArray(entries) || entries.length === 0) {
      setRecentPlaceholder('Nessun risultato disponibile.');
      return;
    }

    recentResultsEl.innerHTML = entries.map(entry => {
      const breakdownMeta = formatBreakdownMeta(entry.data?.breakdown || {});
      return `
        <div class="recent-result-item">
          <div class="recent-result-round">${escapeHtml(formatGiornata(entry.giornataId))}</div>
          <div class="recent-result-points">${escapeHtml(formatPoints(entry.data?.points))}</div>
          ${breakdownMeta ? `<div class="recent-result-meta">${escapeHtml(breakdownMeta)}</div>` : ''}
        </div>
      `;
    }).join('');
  }

  function formatBreakdownMeta(breakdown) {
    if (!breakdown) return '';
    const parts = [];

    const append = (label, value) => {
      if (value === undefined || value === null) return;
      const num = Number(value);
      if (!Number.isFinite(num) || num === 0) return;
      parts.push(`${label} ${num > 0 ? '+' : ''}${num.toFixed(1)}`);
    };

    append('Giocatori', breakdown.players);
    if (parts.length < 2) append('Curva', breakdown.curva);
    if (parts.length < 2) append('Capitano', breakdown.captain);
    if (parts.length < 2) append('Coach', breakdown.coach);

    return parts.join(' • ');
  }

  async function findLatestGiornate(db) {
    try {
      const daysSnap = await db.collection('days').get();
      const computed = daysSnap.docs
        .filter(doc => (doc.data() || {}).computed)
        .map(doc => ({
          id: doc.id,
          order: Number(doc.id.replace(/[^0-9]/g, '')) || 0,
          updatedAt: doc.data()?.updatedAt?.toMillis?.() || doc.updateTime?.toMillis?.() || 0
        }));

      if (!computed.length) {
        return [];
      }

      computed.sort((a, b) => (b.order - a.order) || (b.updatedAt - a.updatedAt));
      return computed.map(entry => entry.id);
    } catch (error) {
      console.warn('matchday-summary: impossibile leggere days:', error);
      return [];
    }
  }

  async function fetchRecentResults(db, teamId, giornate, limit = 3) {
    const collected = [];
    const checked = new Set();

    const ordered = Array.isArray(giornate) ? giornate.slice() : [];
    for (const gid of ordered) {
      checked.add(gid);
      try {
        const doc = await db.collection('results').doc(gid).collection('teams').doc(teamId).get();
        if (doc.exists) {
          collected.push({ giornataId: gid, data: doc.data() || {} });
          if (collected.length === limit) {
            return collected;
          }
        }
      } catch (error) {
        console.warn('matchday-summary: errore lettura results', gid, error);
      }
    }

    if (collected.length >= limit) {
      return collected;
    }

    const fallbackIds = FALLBACK_GIORNATE.slice().reverse();
    for (const gid of fallbackIds) {
      if (checked.has(gid)) continue;
      try {
        const doc = await db.collection('results').doc(gid).collection('teams').doc(teamId).get();
        if (doc.exists) {
          collected.push({ giornataId: gid, data: doc.data() || {} });
          if (collected.length === limit) {
            break;
          }
        }
      } catch (error) {
        console.warn('matchday-summary: errore lettura results', gid, error);
      }
    }

    return collected;
  }

  async function loadTeamName(db, teamId) {
    try {
      const doc = await db.collection('teams').doc(teamId).get();
      if (!doc.exists) {
        return `Squadra ${Number(teamId) + 1 || ''}`.trim();
      }
      const data = doc.data() || {};
      return data.name || `Squadra ${Number(teamId) + 1 || ''}`.trim();
    } catch (error) {
      console.warn('matchday-summary: errore lettura team', error);
      return `Squadra ${Number(teamId) + 1 || ''}`.trim();
    }
  }

  async function loadLatestResult(user) {
    setLoading('Caricamento…');

    try {
      const db = firebase.firestore();
      const userDoc = await db.collection('users').doc(user.uid).get();
      if (!userDoc.exists) {
        setEmpty('Completa il profilo squadra per iniziare.');
        return;
      }

      const userData = userDoc.data() || {};
      if (userData.team_index === null || userData.team_index === undefined) {
        setEmpty('Non hai ancora una squadra assegnata.');
        return;
      }

      const teamId = String(userData.team_index);
      const giornate = await findLatestGiornate(db);
      const recent = await fetchRecentResults(db, teamId, giornate, 3);

      if (!recent.length) {
        setEmpty('Nessun risultato calcolato finora.');
        return;
      }

      const teamName = await loadTeamName(db, teamId);
      renderResult(recent[0].giornataId, teamName, recent[0].data, teamId);
      renderRecentResults(recent);
    } catch (error) {
      console.error('matchday-summary: errore caricamento riepilogo', error);
      setEmpty('Errore nel caricamento risultati.');
    }
  }

  firebase.auth().onAuthStateChanged((user) => {
    if (!user) {
      setEmpty('Accedi per vedere l’ultimo risultato.');
      return;
    }
    loadLatestResult(user);
  });

  if (detailBtn) {
    detailBtn.addEventListener('click', () => {
      if (!detailHref) return;
      window.location.href = detailHref;
    });
  }
})();

