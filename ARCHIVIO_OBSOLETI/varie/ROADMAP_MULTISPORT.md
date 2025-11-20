# Roadmap Multi-Sport / Multi-Format

## Fanta F1
- **competition doc** `competitions/f1-2026`
  - `sportType: "f1"`
  - `season`, `calendar` (lista GP con data/punteggi)
  - subcollection `participants/` con `driverId`, `team`, `constructorId`
- **league data**
  - `settings.lineupSlots = { drivers: 2, constructors: 1 }`
  - risultati per GP salvati in `leagues/{leagueId}/results/{gpId}` con breakdown: posizioni, fast lap, DNF
  - punteggi: tabella 25-18-15... + bonus giro veloce (configurata in `SPORT_CONFIG`)
- **workflow**
  - UI lineup mostra slot per 2 piloti e 1 costruttore
  - scoreboard aggrega punti per GP + totale mondiale

## Fanta Sanremo
- **competition doc** `competitions/sanremo-2026`
  - `sportType: "sanremo"`
  - `metadata`: serate, giurie, generi
  - `participants/` elenco cantanti con `song`, `duet`, `label`
- **league data**
  - lineup: 5 artisti (nessuna panchina)
  - risultati per serata: punteggi giuria + televoto memorizzati in `results/{dayId}`
  - bonus configurabili (trend Spotify, outfit, menzioni speciali)
- **workflow**
  - UI mostra card artista con foto + snippet
  - scoreboard mostra posizione ogni serata + totale festival

## Fanta Reality / Grande Fratello
- **competition doc** `competitions/gf-2026`
  - `sportType: "reality_tv"`
  - `participants/` con info nomination, stato (in gioco/eliminato)
  - eventi speciali in subcollezione `events/`
- **league data**
  - lineup: 4 concorrenti
  - results per puntata: record con campi `nomination`, `immuni`, `punti social`
  - bonus: nomination azzeccate, televoto salvato, ship confermata, drama moment
- **workflow**
  - scoreboard mostra punteggio live puntata + badge evento
  - notifiche automatiche quando concorrente scelto viene eliminato/entra

## Passi Successivi
1. Definire tabelle punteggio per ogni sport in `config/scoring_profiles/{sportType}`.
2. Implementare UI componenti riutilizzabili (`ParticipantList`, `LineupBuilder`) che leggono `SPORT_CONFIG`.
3. Creare job di import (come `scripts/seed-competition-nba.js`) per F1/Sanremo/GF.
4. Aggiornare regole Firestore per `competitions/*` e `participants/*` (lettura pubblica, scrittura admin).
5. Pianificare split futuro in app verticali riutilizzando le stesse collection `leagues` e `competitions`.

