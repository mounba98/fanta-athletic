/**
 * SPORT_CONFIG – definisce i metadati minimi per ogni sport/format supportato.
 * Ogni voce descrive ruoli fantasy, formati di lineup e profilo punteggio.
 * Esteso con hook multisport per configurazioni dinamiche per lega.
 */
(function initSportConfig() {
  const SPORT_CONFIG = {
    football: {
      label: 'Calcio',
      participantType: 'player',
      roles: ['P', 'D', 'C', 'A'],
      defaultFormation: [1, 4, 3, 3],
      squadSize: 25,
      scoringProfileId: 'football_default',
      supportsBench: true,
      supportsCaptain: true,
      defaultCompetitionId: 'serie-a-2025'
    },
    volleyball: {
      label: 'Volley',
      participantType: 'player',
      roles: ['S', 'C', 'P', 'L'], // schiacciatore, centrale, palleggiatore, libero
      defaultFormation: [2, 2, 1, 1],
      squadSize: 12,
      scoringProfileId: 'volleyball_default',
      supportsBench: true,
      supportsCaptain: false,
      defaultCompetitionId: 'superlega-2025'
    },
    basketball: {
      label: 'Basket',
      participantType: 'player',
      roles: ['PG', 'SG', 'SF', 'PF', 'C'],
      defaultFormation: [1, 1, 1, 1, 1],
      squadSize: 12,
      scoringProfileId: 'basketball_default',
      supportsBench: true,
      supportsCaptain: false,
      defaultCompetitionId: 'nba-2025'
    },
    f1: {
      label: 'Formula 1',
      participantType: 'driver',
      roles: ['DRIVER', 'CONSTRUCTOR'],
      lineupSlots: { drivers: 2, constructors: 1 },
      scoringProfileId: 'f1_default',
      supportsBench: false,
      supportsCaptain: false,
      defaultCompetitionId: 'f1-2026'
    },
    sanremo: {
      label: 'Sanremo',
      participantType: 'artist',
      roles: ['ARTIST'],
      lineupSlots: { artists: 5 },
      scoringProfileId: 'sanremo_default',
      supportsBench: false,
      supportsCaptain: false,
      defaultCompetitionId: 'sanremo-2026'
    },
    reality_tv: {
      label: 'Reality Show',
      participantType: 'contestant',
      roles: ['CONTESTANT'],
      lineupSlots: { contestants: 4 },
      scoringProfileId: 'reality_default',
      supportsBench: false,
      supportsCaptain: false,
      defaultCompetitionId: 'gf-2026',
      ui: {
        dayLabelSingular: 'Puntata',
        dayLabelPlural: 'Puntate',
        teamLabelSingular: 'Team',
        teamLabelPlural: 'Team',
        participantSingular: 'concorrente',
        participantPlural: 'concorrenti'
      }
    }
  };

  const DEFAULT_UI_LABELS = {
    dayLabelSingular: 'Giornata',
    dayLabelPlural: 'Giornate',
    teamLabelSingular: 'Squadra',
    teamLabelPlural: 'Squadre',
    participantSingular: 'giocatore',
    participantPlural: 'giocatori'
  };

  function baseComputeLeagueTypeFromSportType(sportType) {
    switch (sportType) {
      case 'football':
      case 'basketball':
      case 'volleyball':
        return 'sport_league';
      case 'f1':
      case 'sanremo':
        return 'sport_series';
      case 'reality_tv':
        return 'reality_show';
      default:
        return 'sport_league';
    }
  }

  // Espone mapping condiviso sportType -> leagueType
  if (typeof window.computeLeagueTypeFromSportType !== 'function') {
    window.computeLeagueTypeFromSportType = baseComputeLeagueTypeFromSportType;
  }

  // Restituisce leagueType per una lega, con fallback derivato da sportType
  window.getLeagueType = function getLeagueType(league) {
    if (!league) return 'sport_league';
    if (league.leagueType) return league.leagueType;
    const sportType = league.sportType || 'football';
    return (typeof window.computeLeagueTypeFromSportType === 'function')
      ? window.computeLeagueTypeFromSportType(sportType)
      : baseComputeLeagueTypeFromSportType(sportType);
  };

  window.isRealityLeague = function isRealityLeague(league) {
    const lt = window.getLeagueType(league);
    return lt === 'reality_show';
  };

  // UI helper: etichette adattive per Giornata/Puntata, Giocatore/Concorrente, Squadra/Team
  window.getLeagueUiStrings = function getLeagueUiStrings(league) {
    if (!league) return { ...DEFAULT_UI_LABELS };
    const sportType = league.sportType || 'football';
    const cfg = (typeof window.getSportConfig === 'function')
      ? window.getSportConfig(sportType)
      : (window.SPORT_CONFIG && window.SPORT_CONFIG[sportType]) || null;
    const ui = (cfg && cfg.ui) || {};
    return {
      dayLabelSingular: ui.dayLabelSingular || DEFAULT_UI_LABELS.dayLabelSingular,
      dayLabelPlural: ui.dayLabelPlural || DEFAULT_UI_LABELS.dayLabelPlural,
      teamLabelSingular: ui.teamLabelSingular || DEFAULT_UI_LABELS.teamLabelSingular,
      teamLabelPlural: ui.teamLabelPlural || DEFAULT_UI_LABELS.teamLabelPlural,
      participantSingular: ui.participantSingular || DEFAULT_UI_LABELS.participantSingular,
      participantPlural: ui.participantPlural || DEFAULT_UI_LABELS.participantPlural
    };
  };

  // ✅ HOOK MULTISPORT MINIMO: cache configurazioni per lega
  const leagueSportConfigs = new Map();
  
  // ✅ HOOK: ottieni configurazione sport per lega (con fallback a default)
  window.getSportConfigForLeague = function getSportConfigForLeague(leagueId, sportType) {
    if (!leagueId) return window.getSportConfig(sportType);
    
    const cacheKey = `${leagueId}_${sportType || 'football'}`;
    if (leagueSportConfigs.has(cacheKey)) {
      return leagueSportConfigs.get(cacheKey);
    }
    
    // Per ora restituisce configurazione default (futuro: legge da leagues/{leagueId}/config)
    const defaultConfig = window.getSportConfig(sportType);
    leagueSportConfigs.set(cacheKey, defaultConfig);
    return defaultConfig;
  };
  
  // ✅ HOOK: aggiorna configurazione sport per lega (per admin/futuro)
  window.updateSportConfigForLeague = function updateSportConfigForLeague(leagueId, sportConfig) {
    if (!leagueId || !sportConfig) return false;
    
    const cacheKey = `${leagueId}_${sportConfig.sportType || 'football'}`;
    leagueSportConfigs.set(cacheKey, sportConfig);
    console.log('[sport-config] Configurazione aggiornata per lega:', leagueId, sportConfig.sportType);
    
    // Dispatch evento per aggiornare UI se necessario
    window.dispatchEvent(new CustomEvent('sport-config-updated', { 
      detail: { leagueId, sportConfig } 
    }));
    
    return true;
  };
  
  // ✅ HOOK: pulisci cache configurazioni per lega (usato al cambio lega)
  window.clearSportConfigCache = function clearSportConfigCache(leagueId = null) {
    if (leagueId) {
      // Rimuovi solo configurazioni per lega specifica
      const keysToDelete = [];
      for (const key of leagueSportConfigs.keys()) {
        if (key.startsWith(leagueId + '_')) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => leagueSportConfigs.delete(key));
      console.log('[sport-config] Cache pulita per lega:', leagueId, '(' + keysToDelete.length + ' chiavi)');
    } else {
      // Rimuovi tutte le configurazioni
      const count = leagueSportConfigs.size;
      leagueSportConfigs.clear();
      console.log('[sport-config] Cache completamente pulita (' + count + ' chiavi)');
    }
  };

  window.SPORT_CONFIG = SPORT_CONFIG;
  window.getSportConfig = function getSportConfig(sportType) {
    if (!sportType) return SPORT_CONFIG.football;
    return SPORT_CONFIG[sportType] || SPORT_CONFIG.football;
  };
  
  // ✅ INTEGRAZIONE: ascolta cambio lega per pulire cache
  window.addEventListener('league-changed', function(e) {
    const { leagueId } = e.detail;
    if (leagueId) {
      // Pulisci cache vecchie leghe (mantieni solo quella corrente)
      window.clearSportConfigCache();
      console.log('[sport-config] Cache resettata per cambio lega a:', leagueId);
    }
  });
})();


