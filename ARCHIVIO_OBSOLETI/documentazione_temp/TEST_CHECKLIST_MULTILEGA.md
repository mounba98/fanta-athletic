# Checklist Test Multi-Lega / Multi-Sport

## A. Multi-Lega (2 leghe calcio)
1. **Login utente A**
   - Seleziona Lega 1, verifica dashboard, formazioni, bacheca.
   - Controlla che `leagues/{lega1}/notifications` contenga solo eventi di Lega 1.
2. **Switch Lega 2**
   - Badge notifiche si azzera, dati squadra e classifica cambiano.
   - Salva formazione → write solo in `leagues/{lega2}/teams/*/saved`.
3. **Join flow**
   - Apri `join-league.html?leagueId=<id>&code=<code>` → lista squadre caricata da `leagues/{id}/teams`.
   - Inserisci codice errato → messaggio “Codice non valido”.

## B. Team Invites
1. Admin crea invito → verifica doc in `leagues/{leagueId}/teamInvites/{code}`.
2. Utente B usa link `join-team.html?leagueId=...&code=T-XXXX`.
   - Conferma membership + update `leagues/{leagueId}` / `users/{userId}`.
   - Link funzionante anche se utente incolla solo codice (fallback collectionGroup).

## C. Notifications
1. Genera commento in Lega 1 → compare solo nel dropdown Lega 1.
2. Cambia lega → verifica dropdown vuoto + no errori console.
3. Mark-all → controlla update `read: true` nella collection corretta.

## D. Dashboard Mobile
1. Con utente Lega 1 apri index su smartphone → dati presi da `leagues/{lega1}/...`.
2. Cambia lega → ricarica, verifica log assenza `window.__LEGACY_DB__`.

## E. Rules Loader
1. Crea documento `leagues/{leagueId}/config/rules_cache`.
2. Ricarica pagina classifica → le regole vengono lette dal doc per-lega (log `source: league:<id>`).
3. Elimina doc per-lega → fallback su `config/rules_cache`.

## F. Multi-Sport / Competition
1. Apri `admin-leghe.html` → select sport popolata da `SPORT_CONFIG`.
2. Crea una lega “NBA Test” (sport = basket, competitionId = `nba-2025`).
3. Esegui `node scripts/seed-competition-nba.js --project <id>` → verifica `competitions/nba-2025`.
4. In Firestore controlla che la nuova lega salvi `sportType` e `competitionId`.

## G. Regressioni rapide
- Notifications legacy (`/notifications`) readonly: prova update → `PERMISSION_DENIED`.
- Firestore rules: tentativo di scrittura su `/teams` → `PERMISSION_DENIED`.
- `formazioni.html` e `squadre.html` non scrivono più su legacy (cerca in console).

