(function() {
  const REPEATABLE_PLAYER_RULES = new Set([
    'R040','R041','R042','R072','R075','R089','R097','R044','R045',
    'R056','R057','R058','R061','R070','R063','R073','R092',
    // Cartellini aggiuntivi usati in statistiche
    'R076','R077','R078','R079','R080','R081'
  ]);

  const leaderboardState = {
    leagueId: null,
    players: [],
    ruleById: new Map(),
    playerCounts: new Map(),
    appearances: new Map(),
    daySelections: [],
    playerTotals: [],
    loading: false,
    sortKey: 'points',
    sortDir: 'desc',
    selectedRuleId: '',
    rangeFrom: '',
    rangeTo: '',
    rangeMode: 'range'
  };

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function getLeagueIdCachedSafe() {
    const explicit = leaderboardState.leagueId;
    if (explicit) return explicit;
    if (typeof window.getCurrentLeagueIdCached === 'function') {
      try { return window.getCurrentLeagueIdCached() || ''; } catch (_) { return ''; }
    }
    return '';
  }

  function getStoredPlayerPhoto(playerId) {
    const leagueId = getLeagueIdCachedSafe();
    const key = leagueId ? `player_photo_${playerId}_${leagueId}` : `player_photo_${playerId}`;
    try {
      return localStorage.getItem(key) || '';
    } catch (_) {
      return '';
    }
  }

  function storePlayerPhoto(playerId, dataUrl) {
    const leagueId = getLeagueIdCachedSafe();
    const key = leagueId ? `player_photo_${playerId}_${leagueId}` : `player_photo_${playerId}`;
    try {
      localStorage.setItem(key, String(dataUrl || ''));
    } catch (_) {
      // ignore
    }
  }

  function initialsFromName(fullName) {
    return String(fullName || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0])
      .join('') || 'P';
  }

  function resolveAvatarUrl(playerId, fullName, imageUrl) {
    const stored = getStoredPlayerPhoto(playerId);
    const raw = String(imageUrl || '').trim();
    const initials = initialsFromName(fullName);
    const fallback = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(initials)}`;
    return {
      url: stored || raw || fallback,
      fallback
    };
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }

  function setupPhotoUploadTool() {
    if (leaderboardState.__photoToolAttached) return;
    leaderboardState.__photoToolAttached = true;

    const input = document.getElementById('playerPhotoInput');
    if (!input) return;

    let pendingPlayerId = '';

    document.addEventListener('click', async (e) => {
      const el = e.target && e.target.closest ? e.target.closest('.player-avatar[data-player-id]') : null;
      if (!el) return;
      const pid = el.getAttribute('data-player-id') || '';
      if (!pid) return;
      pendingPlayerId = pid;
      try {
        input.value = '';
      } catch (_) {}
      input.click();
    });

    input.addEventListener('change', async () => {
      if (!pendingPlayerId) return;
      const file = input.files && input.files[0];
      if (!file) return;
      try {
        const dataUrl = await fileToDataUrl(file);
        storePlayerPhoto(pendingPlayerId, dataUrl);
        renderPlayerLeaderboardTable();
      } catch (err) {
        console.warn('[classifiche] errore salvataggio foto giocatore:', err);
      } finally {
        pendingPlayerId = '';
      }
    });
  }

  function normalizeRules(rules, soggetto, repeatables) {
    return (rules || [])
      .filter(rule => rule.soggetto === soggetto)
      .map(rule => ({
        ...rule,
        input: repeatables.has(rule.rule_id) ? 'counter' : 'toggle'
      }));
  }

  function ensureAccumulator(map, key) {
    if (!map.has(key)) {
      map.set(key, {});
    }
    return map.get(key);
  }

  function resolveSelectionValue(raw) {
    if (raw === undefined || raw === null) return raw;
    if (typeof raw === 'object') {
      if (raw.value !== undefined) return raw.value;
      if (raw.count !== undefined) return raw.count;
      if (raw.qty !== undefined) return raw.qty;
    }
    return raw;
  }

  function surnameForSort(fullName) {
    const tokens = String(fullName || '').trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return '';

    const particles = new Set([
      'di','de','del','della','dello','dei','degli','delle','da','dal','dai','dalle','dallo',
      'd','d\'','d’','van','von','der','den','la','le','lo'
    ]);

    let start = tokens.length - 1;
    while (start > 0) {
      const prev = String(tokens[start - 1] || '').toLowerCase();
      if (!particles.has(prev)) break;
      start -= 1;
    }
    return tokens.slice(start).join(' ');
  }

  function parseGiornataNumber(id) {
    const m = String(id || '').match(/^G(\d+)$/i);
    return m ? Number(m[1]) : null;
  }

  function normalizeRange(fromId, toId) {
    const fromN = parseGiornataNumber(fromId);
    const toN = parseGiornataNumber(toId);
    if (fromN == null || toN == null) return { fromId, toId };
    if (fromN <= toN) return { fromId, toId };
    return { fromId: toId, toId: fromId };
  }

  function aggregateCountsForRange() {
    const normalized = normalizeRange(leaderboardState.rangeFrom, leaderboardState.rangeTo);
    const fromN = parseGiornataNumber(normalized.fromId);
    const toN = parseGiornataNumber(normalized.toId);

    leaderboardState.playerCounts.clear();
    leaderboardState.appearances.clear();

    leaderboardState.daySelections.forEach(day => {
      const n = parseGiornataNumber(day.id);
      if (n == null) return;
      if (fromN != null && n < fromN) return;
      if (toN != null && n > toN) return;

      const playersSelections = day.players || {};
      Object.entries(playersSelections).forEach(([pid, selections]) => {
        const bucket = ensureAccumulator(leaderboardState.playerCounts, pid);
        const prevAppearances = leaderboardState.appearances.get(pid) || 0;
        leaderboardState.appearances.set(pid, prevAppearances + 1);
        Object.entries(selections || {}).forEach(([rid, raw]) => {
          const rule = leaderboardState.ruleById.get(rid);
          if (!rule) return;
          const resolved = resolveSelectionValue(raw);
          const inc = rule.input === 'counter' ? Number(resolved || 0) : (resolved ? 1 : 0);
          if (!inc) return;
          bucket[rid] = (bucket[rid] || 0) + inc;
        });
      });
    });
  }

  function setupRangeSelectors() {
    const fromSel = document.getElementById('playersRangeFrom');
    const toSel = document.getElementById('playersRangeTo');
    if (!fromSel || !toSel) return;

    const ids = leaderboardState.daySelections
      .map(d => d.id)
      .filter(id => parseGiornataNumber(id) != null)
      .sort((a, b) => parseGiornataNumber(a) - parseGiornataNumber(b));

    if (!ids.length) return;

    const optionsHtml = ids
      .map(id => `<option value="${id}">G${String(parseGiornataNumber(id))}</option>`)
      .join('');

    fromSel.innerHTML = optionsHtml;
    toSel.innerHTML = optionsHtml;

    if (!leaderboardState.rangeFrom) leaderboardState.rangeFrom = ids[0];
    if (!leaderboardState.rangeTo) leaderboardState.rangeTo = ids[ids.length - 1];

    const normalized = normalizeRange(leaderboardState.rangeFrom, leaderboardState.rangeTo);
    leaderboardState.rangeFrom = normalized.fromId;
    leaderboardState.rangeTo = normalized.toId;

    fromSel.value = leaderboardState.rangeFrom;
    toSel.value = leaderboardState.rangeTo;

    const modeWrap = document.getElementById('playersRangeMode');
    const label = document.getElementById('playersRangeLabel');
    const arrow = document.getElementById('playersRangeArrow');

    const applyModeUi = () => {
      const mode = leaderboardState.rangeMode || 'range';
      if (mode === 'single') {
        if (label) label.textContent = 'Giornata:';
        if (fromSel) fromSel.style.display = 'none';
        if (arrow) arrow.style.display = 'none';
        if (toSel) toSel.style.display = '';
      } else if (mode === 'until') {
        if (label) label.textContent = 'Fino a giornata:';
        if (fromSel) fromSel.style.display = 'none';
        if (arrow) arrow.style.display = 'none';
        if (toSel) toSel.style.display = '';
      } else {
        if (label) label.textContent = 'Intervallo giornate:';
        if (fromSel) fromSel.style.display = '';
        if (arrow) arrow.style.display = '';
        if (toSel) toSel.style.display = '';
      }

      if (modeWrap) {
        const btns = modeWrap.querySelectorAll('.seg-btn[data-mode]');
        btns.forEach(b => {
          const m = b.getAttribute('data-mode');
          b.classList.toggle('active', m === mode);
        });
      }
    };

    if (modeWrap && !modeWrap.dataset.listenerAttached) {
      modeWrap.addEventListener('click', (e) => {
        const btn = e.target && e.target.closest ? e.target.closest('.seg-btn[data-mode]') : null;
        if (!btn) return;
        const mode = btn.getAttribute('data-mode') || 'range';
        leaderboardState.rangeMode = mode;

        // mappa modalità su rangeFrom/rangeTo
        if (mode === 'single') {
          leaderboardState.rangeFrom = toSel.value;
          leaderboardState.rangeTo = toSel.value;
        } else if (mode === 'until') {
          leaderboardState.rangeFrom = ids[0];
          leaderboardState.rangeTo = toSel.value;
        } else {
          // range
          // lascia i valori correnti
        }

        const norm = normalizeRange(leaderboardState.rangeFrom, leaderboardState.rangeTo);
        leaderboardState.rangeFrom = norm.fromId;
        leaderboardState.rangeTo = norm.toId;

        if (fromSel) fromSel.value = leaderboardState.rangeFrom;
        if (toSel) toSel.value = leaderboardState.rangeTo;

        applyModeUi();
        aggregateCountsForRange();
        computePlayerTotals();
        renderPlayerLeaderboardTable();
      });
      modeWrap.dataset.listenerAttached = '1';
    }

    applyModeUi();

    if (!fromSel.dataset.listenerAttached) {
      fromSel.addEventListener('change', () => {
        leaderboardState.rangeFrom = fromSel.value;
        const norm = normalizeRange(leaderboardState.rangeFrom, leaderboardState.rangeTo);
        leaderboardState.rangeFrom = norm.fromId;
        leaderboardState.rangeTo = norm.toId;
        fromSel.value = leaderboardState.rangeFrom;
        toSel.value = leaderboardState.rangeTo;
        leaderboardState.rangeMode = 'range';
        applyModeUi();
        aggregateCountsForRange();
        computePlayerTotals();
        renderPlayerLeaderboardTable();
      });
      fromSel.dataset.listenerAttached = '1';
    }
    if (!toSel.dataset.listenerAttached) {
      toSel.addEventListener('change', () => {
        leaderboardState.rangeTo = toSel.value;
        if (leaderboardState.rangeMode === 'single') {
          leaderboardState.rangeFrom = leaderboardState.rangeTo;
        } else if (leaderboardState.rangeMode === 'until') {
          leaderboardState.rangeFrom = ids[0];
        }
        const norm = normalizeRange(leaderboardState.rangeFrom, leaderboardState.rangeTo);
        leaderboardState.rangeFrom = norm.fromId;
        leaderboardState.rangeTo = norm.toId;
        if (fromSel) fromSel.value = leaderboardState.rangeFrom;
        toSel.value = leaderboardState.rangeTo;
        applyModeUi();
        aggregateCountsForRange();
        computePlayerTotals();
        renderPlayerLeaderboardTable();
      });
      toSel.dataset.listenerAttached = '1';
    }
  }

  function shortRole(role) {
    switch (role) {
      case 'Portiere': return 'P';
      case 'Difensore': return 'D';
      case 'Centrocampista': return 'C';
      case 'Attaccante': return 'A';
      default: return role || '';
    }
  }

  function getPlayersRankBody() {
    const table = document.getElementById('playersRank');
    if (!table) return null;
    const tbody = table.querySelector('tbody');
    return tbody || null;
  }

  function setTableMessage(msg) {
    const tbody = getPlayersRankBody();
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:24px;color:var(--muted);">${msg}</td></tr>`;
  }

  function getPlayerRuleCount(playerId, ruleId) {
    if (!ruleId) return 0;
    const selection = leaderboardState.playerCounts.get(playerId);
    if (!selection) return 0;
    const raw = selection[ruleId];
    const num = Number(raw || 0);
    return Number.isFinite(num) ? num : 0;
  }

  function getRuleLabel(rule) {
    if (!rule) return '';
    const base = rule.nome_bonus || rule.nome || rule.label || rule.name || rule.rule_id || '';
    if (rule.tipo === 'Bonus') return `Bonus - ${base}`;
    if (rule.tipo === 'Malus') return `Malus - ${base}`;
    return base;
  }

  function populateRuleSelect(playerRules) {
    const select = document.getElementById('playerRuleSelect');
    if (!select) return;

    const sorted = (playerRules || []).slice().sort((a, b) => {
      return getRuleLabel(a).localeCompare(getRuleLabel(b), 'it');
    });

    const bonusRules = sorted.filter(r => r.tipo === 'Bonus');
    const malusRules = sorted.filter(r => r.tipo === 'Malus');
    const otherRules = sorted.filter(r => r.tipo !== 'Bonus' && r.tipo !== 'Malus');

    const buildOptions = (list) => list.map(rule => {
      const label = getRuleLabel(rule);
      if (!label) return '';
      return `<option value="${rule.rule_id}">${escapeHtml(label)}</option>`;
    }).filter(Boolean).join('');

    const parts = ['<option value="">Tutti i bonus/malus</option>'];

    if (bonusRules.length) {
      parts.push('<optgroup label="Bonus">');
      parts.push(buildOptions(bonusRules));
      parts.push('</optgroup>');
    }

    if (malusRules.length) {
      parts.push('<optgroup label="Malus">');
      parts.push(buildOptions(malusRules));
      parts.push('</optgroup>');
    }

    if (otherRules.length) {
      parts.push('<optgroup label="Altro">');
      parts.push(buildOptions(otherRules));
      parts.push('</optgroup>');
    }

    select.innerHTML = parts.join('');

    if (!select.dataset.listenerAttached) {
      select.addEventListener('change', (e) => {
        leaderboardState.selectedRuleId = e.target.value || '';

        // Non forzare l'ordinamento: evita conflitti percepiti.
        // Se l'utente sta già ordinando per "Bonus sel." allora ricalcola la tabella su quella metrica.
        if (leaderboardState.sortKey === 'selectedRule') {
          leaderboardState.sortDir = 'desc';
        }
        renderPlayerLeaderboardTable();
      });
      select.dataset.listenerAttached = '1';
    }
  }

  function getMetricLabel(sortKey) {
    switch (sortKey) {
      case 'goals': return 'Gol';
      case 'assists': return 'Assist';
      case 'yellows': return 'Gialli';
      case 'reds': return 'Rossi';
      case 'selectedRule': {
        const rule = leaderboardState.ruleById.get(leaderboardState.selectedRuleId);
        return getRuleLabel(rule) || 'Selez.';
      }
      case 'points':
      default:
        return 'Totale';
    }
  }

  function getSelectedRuleInlineLabel() {
    const rid = leaderboardState.selectedRuleId;
    if (!rid) return '';
    const rule = leaderboardState.ruleById.get(rid);
    if (!rule) return 'Selez.';
    const base = rule.nome_bonus || rule.nome || rule.label || rule.name || rid;
    const prefix = rule.tipo === 'Malus' ? 'Malus' : (rule.tipo === 'Bonus' ? 'Bonus' : 'Selez.');
    return `${prefix}: ${base}`;
  }

  function getMetricValue(entry, sortKey) {
    switch (sortKey) {
      case 'goals': return Number(entry.goals || 0);
      case 'assists': return Number(entry.assists || 0);
      case 'yellows': return Number(entry.yellows || 0);
      case 'reds': return Number(entry.reds || 0);
      case 'selectedRule': return Number(entry.selectedCount || 0);
      case 'points':
      default:
        return Number(entry.totalPoints || 0);
    }
  }

  function applySort(rows) {
    const sortKey = (leaderboardState.sortKey === 'name') ? 'points' : (leaderboardState.sortKey || 'points');
    const dir = leaderboardState.sortDir === 'asc' ? 1 : -1;

    const keyMap = {
      points: 'totalPoints',
      goals: 'goals',
      assists: 'assists',
      yellows: 'yellows',
      reds: 'reds',
      selectedRule: 'selectedCount'
    };

    const numericKeys = new Set(['totalPoints', 'goals', 'assists', 'yellows', 'reds', 'selectedCount']);

    return rows.slice().sort((a, b) => {
      if (sortKey === 'name') {
        const an = String(a.player.nome_completo || '').trim();
        const bn = String(b.player.nome_completo || '').trim();
        const cmp = an.localeCompare(bn, 'it');
        if (cmp !== 0) return cmp * dir;
        return surnameForSort(a.player.nome_completo).localeCompare(
          surnameForSort(b.player.nome_completo),
          'it'
        );
      }

      if (sortKey === 'role') {
        const ar = shortRole(a.player.role || '');
        const br = shortRole(b.player.role || '');
        const cmp = ar.localeCompare(br, 'it');
        if (cmp !== 0) return cmp * dir;
        return surnameForSort(a.player.nome_completo).localeCompare(
          surnameForSort(b.player.nome_completo),
          'it'
        );
      }

      const mappedKey = keyMap[sortKey] || 'totalPoints';
      if (numericKeys.has(mappedKey)) {
        const av = Number(a[mappedKey] || 0);
        const bv = Number(b[mappedKey] || 0);
        if (av !== bv) {
          return dir === 1 ? av - bv : bv - av;
        }
      }

      // Fallback: ordina per cognome
      return surnameForSort(a.player.nome_completo).localeCompare(
        surnameForSort(b.player.nome_completo),
        'it'
      );
    });
  }

  function attachSortingHandlers() {
    const table = document.getElementById('playersRank');
    if (!table) return;

    const headers = table.querySelectorAll('thead th[data-sort-key]');
    headers.forEach(th => {
      const key = th.getAttribute('data-sort-key');
      if (!key) return;
      if (key === 'name') return;

      th.style.cursor = 'pointer';

      th.addEventListener('click', () => {
        if (leaderboardState.sortKey === key) {
          leaderboardState.sortDir = leaderboardState.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          leaderboardState.sortKey = key;
          leaderboardState.sortDir = (key === 'name' || key === 'role') ? 'asc' : 'desc';
        }
        renderPlayerLeaderboardTable();
      });
    });
  }

  function computePlayerTotals() {
    const totals = [];
    leaderboardState.playerCounts.forEach((selection, playerId) => {
      let player = leaderboardState.players.find(p => p.player_id === playerId);
      if (!player) {
        // Fallback: giocatore non presente in players.json (es. Mauro):
        // mostra comunque la riga usando l'ID come nome leggibile.
        player = {
          player_id: playerId,
          role: '',
          nome_completo: String(playerId)
        };
      }

      const totalPoints = Object.entries(selection).reduce((sum, [rid, val]) => {
        const rule = leaderboardState.ruleById.get(rid);
        if (!rule) return sum;
        const amount = rule.input === 'counter' ? Number(val || 0) : (val ? 1 : 0);
        return sum + amount * Number(rule.valore || 0);
      }, 0);

      if (!Number.isFinite(totalPoints) || totalPoints === 0) return;

      const goals = (selection['R040'] || 0) + (selection['R041'] || 0);
      const assists = selection['R042'] || 0;
      const yellows = (selection['R075'] || 0) + (selection['R076'] || 0) + (selection['R077'] || 0);
      const reds = (selection['R078'] || 0) + (selection['R079'] || 0) + (selection['R080'] || 0) + (selection['R081'] || 0);
      const appearances = leaderboardState.appearances.get(playerId) || 0;

      totals.push({ player, playerId, totalPoints, goals, assists, yellows, reds, appearances });
    });

    totals.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return surnameForSort(a.player.nome_completo).localeCompare(
        surnameForSort(b.player.nome_completo),
        'it'
      );
    });

    leaderboardState.playerTotals = totals;
  }

  function renderPlayerLeaderboardTable() {
    const tbody = getPlayersRankBody();
    if (!tbody) return;

    const baseRows = (leaderboardState.playerTotals || []).map(entry => {
      const selectedCount = leaderboardState.selectedRuleId
        ? getPlayerRuleCount(entry.playerId, leaderboardState.selectedRuleId)
        : 0;
      return { ...entry, selectedCount };
    });

    if (!baseRows.length) {
      setTableMessage('Nessun dato disponibile per la classifica giocatori.');
      return;
    }

    const maxRows = 100;
    const sorted = applySort(baseRows);
    const slice = sorted.slice(0, maxRows);

    const sortKey = leaderboardState.sortKey || 'points';

    const isMobile = !!(
      document.body.classList.contains('device-smartphone') ||
      document.body.classList.contains('device-tablet') ||
      (window.matchMedia && (
        window.matchMedia('(max-width: 760px)').matches ||
        window.matchMedia('(pointer: coarse)').matches
      ))
    );
    const extendedMobile = !!window.__playersLayoutExtended;

    tbody.innerHTML = slice.map((entry, index) => {
      const fullName = String(entry.player.nome_completo || '').trim();
      const role = shortRole(entry.player.role || '');
      const selectedDisplay = leaderboardState.selectedRuleId ? `x${entry.selectedCount}` : '-';
      const appearances = entry.appearances || 0;
      const imageUrl = String(entry.player.image_url || '').trim();
      const avatar = resolveAvatarUrl(entry.playerId, fullName, imageUrl);

      if (isMobile) {
        const surname = surnameForSort(fullName) || fullName;
        const metricLabel = getMetricLabel(sortKey);
        const metricValue = getMetricValue(entry, sortKey);
        const mainLabel = metricLabel;
        const mainValueLabel = (sortKey === 'selectedRule')
          ? `x${String(metricValue)}`
          : (sortKey === 'points' ? Number(metricValue).toFixed(1) : String(metricValue));
        const selLabel = getSelectedRuleInlineLabel();
        const selMeta = leaderboardState.selectedRuleId ? ` • ${escapeHtml(selLabel)} ${selectedDisplay}` : '';

        if (!extendedMobile) {
          return `
            <tr class="player-row-mobile compact">
              <td colspan="9">
                <div class="player-card">
                  <div class="player-card-header">
                    <div class="rank" data-rank="${index + 1}">${index + 1}</div>
                    <div class="player-avatar" data-player-id="${escapeHtml(entry.playerId)}"><img src="${avatar.url}" alt="${escapeHtml(fullName || surname)}" onerror="this.onerror=null;this.src='${avatar.fallback}'" /></div>
                    <div class="player-card-body">
                      <div class="player-card-name">${escapeHtml(surname)} <span class="player-role-inline">${escapeHtml(role)}</span></div>
                      <div class="player-card-meta">Gol ${entry.goals} • Assist ${entry.assists}${selMeta}</div>
                    </div>
                    <div class="points-box">
                      <div class="points-val">${mainValueLabel}</div>
                      <div class="points-label">${escapeHtml(mainLabel)}</div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          `;
        }

        return `
          <tr class="player-row-mobile extended">
            <td colspan="9">
              <div class="player-card">
                <div class="player-card-header">
                  <div class="rank" data-rank="${index + 1}">${index + 1}</div>
                  <div class="player-avatar" data-player-id="${escapeHtml(entry.playerId)}"><img src="${avatar.url}" alt="${escapeHtml(fullName || surname)}" onerror="this.onerror=null;this.src='${avatar.fallback}'" /></div>
                  <div class="player-card-body">
                    <div class="player-card-name">${escapeHtml(fullName || surname)} <span class="player-role-inline">${escapeHtml(role)}</span></div>
                    <div class="player-card-meta">Pres ${appearances}</div>
                  </div>
                  <div class="points-box">
                    <div class="points-val">${mainValueLabel}</div>
                    <div class="points-label">${escapeHtml(mainLabel)}</div>
                  </div>
                </div>
                <div class="player-card-stats">
                  <span class="player-pill">Gol <strong>${entry.goals}</strong></span>
                  <span class="player-pill">Assist <strong>${entry.assists}</strong></span>
                  <span class="player-pill">Gialli <strong>${entry.yellows}</strong></span>
                  <span class="player-pill">Rossi <strong>${entry.reds}</strong></span>
                  ${leaderboardState.selectedRuleId ? (() => {
                    const rule = leaderboardState.ruleById.get(leaderboardState.selectedRuleId);
                    const label = getRuleLabel(rule) || 'Selez.';
                    return `<span class="player-pill player-pill-sel">${escapeHtml(label)} <strong>${selectedDisplay}</strong></span>`;
                  })() : ''}
                </div>
              </div>
            </td>
          </tr>
        `;
      }

      // Desktop / tablet: tabella classica
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(fullName)}</td>
          <td>${escapeHtml(role)}</td>
          <td>${entry.totalPoints.toFixed(1)}</td>
          <td>${entry.goals}</td>
          <td>${entry.assists}</td>
          <td>${entry.yellows}</td>
          <td>${entry.reds}</td>
          <td>${selectedDisplay}</td>
        </tr>
      `;
    }).join('');
  }

  async function loadPlayerLeaderboard() {
    if (leaderboardState.loading) return;
    const tbody = getPlayersRankBody();
    if (!tbody) return; // tab non presente

    try {
      leaderboardState.loading = true;
      setTableMessage('Caricamento classifica giocatori…');

      const getLeagueIdOrNotifyFn = typeof window.getLeagueIdOrNotify === 'function'
        ? window.getLeagueIdOrNotify
        : null;

      let leagueId = null;
      if (getLeagueIdOrNotifyFn) {
        leagueId = await getLeagueIdOrNotifyFn('caricare la classifica giocatori', { notify: true });
      } else if (typeof window.ensureLeagueReady === 'function') {
        leagueId = await window.ensureLeagueReady(10000);
      } else if (window.currentLeague && window.currentLeague.id) {
        leagueId = window.currentLeague.id;
      }

      if (!leagueId || !window.db) {
        setTableMessage('❌ Seleziona una lega valida per vedere la classifica giocatori.');
        return;
      }

      leaderboardState.leagueId = leagueId;

      const [rulesSource, playersRes] = await Promise.all([
        window.loadRulesJSON
          ? window.loadRulesJSON()
          : fetch('resources/rules.json').then(r => r.json()),
        fetch('resources/players.json')
      ]);

      const rulesArray = Array.isArray(rulesSource.rules) ? rulesSource.rules : [];
      const playersJson = await playersRes.json();
      leaderboardState.players = Array.isArray(playersJson.players) ? playersJson.players : [];

      const playerRules = normalizeRules(rulesArray, 'Giocatore', REPEATABLE_PLAYER_RULES);
      leaderboardState.ruleById = new Map(playerRules.map(rule => [rule.rule_id, rule]));
      populateRuleSelect(playerRules);

      let daysCol = null;
      if (typeof window.getLeagueCollection === 'function') {
        daysCol = window.getLeagueCollection('days', leagueId);
      }
      if (!daysCol && window.db && window.db.collection) {
        daysCol = window.db.collection(`leagues/${leagueId}/days`);
      }
      if (!daysCol) {
        setTableMessage('⚠️ Impossibile leggere le giornate per questa lega.');
        return;
      }

      let daysSnap = await daysCol.get().catch(err => {
        console.warn('[classifiche] Errore caricamento days per classifica giocatori:', err);
        return { empty: true, docs: [] };
      });

      // Fallback: se la collection per lega è vuota, prova la collection legacy globale "days"
      if (!daysSnap || daysSnap.empty) {
        let legacySnap = null;
        if (window.db && window.db.collection) {
          try {
            const legacyCol = window.db.collection('days');
            legacySnap = await legacyCol.get();
          } catch (err) {
            console.warn('[classifiche] Errore caricamento days legacy per classifica giocatori:', err);
          }
        }

        if (!legacySnap || legacySnap.empty) {
          setTableMessage('⚠️ Nessuna giornata trovata per questa lega.');
          return;
        }

        daysSnap = legacySnap;
      }

      leaderboardState.playerCounts.clear();
      leaderboardState.appearances = leaderboardState.appearances || new Map();
      leaderboardState.appearances.clear();

      leaderboardState.daySelections = daysSnap.docs
        .map(doc => ({ id: doc.id, data: doc.data() || {} }))
        .filter(d => parseGiornataNumber(d.id) != null)
        .map(d => ({ id: d.id, players: d.data.players || {} }))
        .sort((a, b) => parseGiornataNumber(a.id) - parseGiornataNumber(b.id));

      if (leaderboardState.daySelections.length) {
        if (!leaderboardState.rangeFrom) leaderboardState.rangeFrom = leaderboardState.daySelections[0].id;
        if (!leaderboardState.rangeTo) leaderboardState.rangeTo = leaderboardState.daySelections[leaderboardState.daySelections.length - 1].id;
      }

      setupRangeSelectors();
      aggregateCountsForRange();

      computePlayerTotals();
      renderPlayerLeaderboardTable();
    } catch (error) {
      console.error('[classifiche] Errore classifica giocatori:', error);
      setTableMessage('⚠️ Errore nel caricamento della classifica giocatori.');
    } finally {
      leaderboardState.loading = false;
    }
  }

  function setupPlayersTabObserver() {
    // Carica una volta quando la lega è pronta / pagina pronta
    const init = () => {
      attachSortingHandlers();
      setupPhotoUploadTool();
      loadPlayerLeaderboard();
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }

    // Ricalcola quando cambia la lega
    window.addEventListener('league-ready', () => {
      leaderboardState.playerCounts.clear();
      leaderboardState.playerTotals = [];
      leaderboardState.selectedRuleId = '';
      leaderboardState.sortKey = 'points';
      leaderboardState.sortDir = 'desc';
      loadPlayerLeaderboard();
    });
  }

  try {
    setupPlayersTabObserver();
  } catch (err) {
    console.error('[classifiche] setupPlayersTabObserver error:', err);
  }

  // Espone un piccolo API globale per forzare il rerender da classifiche.html
  window.PlayersLeaderboard = window.PlayersLeaderboard || {};
  window.PlayersLeaderboard.rerender = renderPlayerLeaderboardTable;
  window.PlayersLeaderboard.setSort = (key, dir) => {
    const requested = String(key || 'points');
    const safeKey = (requested === 'name') ? 'points' : requested;
    const safeDir = (dir === 'asc' || dir === 'desc') ? dir : 'desc';
    leaderboardState.sortKey = safeKey;
    leaderboardState.sortDir = safeDir;
    renderPlayerLeaderboardTable();
  };
})();
