# 🏟️ How To Add a New Competition / Sport

Questa guida riassume il workflow introdotto con la competition “Argentina – Primera División 2025” e vale come checklist per future espansioni multi-sport.

---

## 1. Nuova competition per uno sport già supportato

Esempio: nuovo campionato di calcio, volley, basket…

1. **Crea il file dati** in `public/data/competitions/<competitionId>.json`  
   Struttura base:
   ```json
   {
     "competitionId": "argentina-primera-2025",
     "sportType": "football",
     "season": "2025",
     "label": "Argentina Primera División 2025",
     "teams": [...],
     "players": [...]
   }
   ```
   - `teams[]`: `{ teamId, name, shortName, city, primaryColor, secondaryColor }`
   - `players[]`: `{ player_id, role, roleCode, nome_completo, teamId, shirtNumber, marketValue }`

2. **Aggiorna l’indice** `public/data/competitions/index.json` aggiungendo `{ competitionId, sportType, label }` per mostrarla nel form admin.

3. **Seed della competition** (una tantum per popolare `/competitions/...`):
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=path/creds.json \
   node scripts/seed-competition-argentina.js --project fanta-athletic \
     --file public/data/competitions/argentina-primera-2025.json
   ```
   (per altre competition crea uno script gemello o usa questo come template).

4. **Crea una lega dal pannello admin**:
   - SportType = `football`
   - Competition ID = `argentina-primera-2025` (ora compare nel datalist)

5. **Popola la lega con team e giocatori** partendo dalla competition:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=path/creds.json \
   node scripts/seed-league-from-competition.js \
     --project fanta-athletic \
     --leagueId <LEAGUE_ID> \
     --competitionId argentina-primera-2025
   ```
   - Usa `--dry-run` per vedere cosa verrebbe scritto
   - `--teamSlots <n>` per modificare il numero di slot (default 19, compatibile con la UI legacy calcio)

6. **Test rapido**:
   - Apri la lega dal selector → verifica che `formazioni`, `squadre`, `classifiche` leggano i dati appena importati
   - Controlla Firestore: `leagues/<leagueId>/players` e `teams` devono contenere i player_id e team importati

---

## 2. Nuovo sport / format

Quando serve un format mai visto (F1, Sanremo, Reality, ecc.):

1. **Estendi `SPORT_CONFIG`** (`public/resources/sport-config.js`)
   - `sportType` univoco
   - `label`, ruoli (`roles` o `lineupSlots`), `defaultFormation`/`lineupSlots`, `scoringProfileId`, `defaultCompetitionId`

2. **Definisci la competition di default** (vedi sezione precedente)
   - File in `public/data/competitions/<id>.json`
   - Script di seed dedicato (può essere una variante del file Argentina/NBA)

3. **Aggiorna l’indice** `public/data/competitions/index.json` per esporre la competition nel pannello admin.

4. **UI Admin (`admin-leghe.html`)**
   - Assicurati che `sportTypeSelect` includa il nuovo sport (succede automaticamente dopo aver aggiornato `SPORT_CONFIG`)
   - Prepara il `competitionId` placeholder e, se serve, opzioni aggiuntive (lineup, ruoli speciali, ecc.)

5. **Pipeline di import**
   - Se il gioco richiede strutture custom (es. driver+constructor per F1) duplica/estendi `scripts/seed-league-from-competition.js` per trasformare i partecipanti nel formato atteso dalla lega
   - Documenta eventuali campi custom nel JSON (es. `constructorId`, `duetPartner`, `realityWeek`)

6. **Aggiorna la documentazione**
   - Annota in questo file o in `ROADMAP_MULTISPORT.md` eventuali passi particolari (es. ruoli custom, punteggi specifici)

---

## 3. Comandi rapidi

```bash
# Seeda una competition
node scripts/seed-competition-<nome>.js --project fanta-athletic --file public/data/competitions/<id>.json

# Copia competition -> lega
node scripts/seed-league-from-competition.js \
  --project fanta-athletic \
  --leagueId <LEAGUE_ID> \
  --competitionId <COMP_ID> \
  [--teamSlots 16] [--dry-run]
```

> Ricorda: tutti gli script Node usano le credenziali Firebase Admin. Imposta `GOOGLE_APPLICATION_CREDENTIALS` oppure usa `gcloud auth application-default login`.

---

Con questo workflow puoi creare demo “vendibili” (come la lega argentina) o preparare rapidamente campionati dedicati per investitori e nuovi format multi-sport. Buon lavoro! 💪


