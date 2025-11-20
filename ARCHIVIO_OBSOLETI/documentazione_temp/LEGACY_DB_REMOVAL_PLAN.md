# Piano di Rimozione `window.__LEGACY_DB__`

## Riferimenti Attuali (grep)
- `public/resources/firebase-config.js`: definisce `window.__LEGACY_DB__ = rawDbInstance;` e lo usa in `migrateLegacyCollection`.
- `public/formazioni.html`: funzione `legacyFirestore()` per letture storiche.
- `public/squadre.html`: `legacyDb` in `fetchSavedSnapshot` e altri fallback lettura/scrittura (write già disabilitati).
- `public/bacheca.html`, `public/index.html`, `public/classifiche.html`, `public/calendario.html`: vari fallback UI (`rawDb = window.__LEGACY_DB__`).
- `public/migrate-existing-data.html`: tool manuale che richiede l’istanza raw per copiare dati.

## Strategia
1. **Fase di monitoraggio**
   - Aggiungere logging (console + Analytics) ogni volta che `window.__LEGACY_DB__` viene usato per capire quali feature dipendono ancora dal legacy.
   - Mappare nel backlog le pagine che continuano a leggerlo (formazioni, squadre, bacheca, index, classifica, calendario, tool migrazione).

2. **Fase di sostituzione**
   - Per ogni pagina, spostare la lettura su `leagues/{leagueId}`:
     - Bacheca / index / classifica / calendario: già esistono helper `LeagueHelper`; basta parametrizzare le query.
     - `fetchSavedSnapshot` (squadre/formazioni) → usare la collection `leagues/{leagueId}/teams/*/saved` e mostrare banner “dati non migrati” se vuota (già fatto per salvataggi).
     - Tool `migrate-existing-data` → usare direttamente Admin SDK (o `firebase-admin` via CLI), non il DB legacy dal browser.

3. **Fase di deprecazione**
   - Introdurre flag `window.__ENABLE_LEGACY_DB__` disabilitato per default (già di fatto).
   - Dopo aver spostato le letture, modificare `firebase-config.js` per non esporre più `window.__LEGACY_DB__`.
   - Rimuovere il codice condizionale e gli helper `legacyFirestore()` dalle pagine.

4. **Cleanup finale**
   - Eliminare le collezioni top-level legacy da Firestore (dopo backup) e rimuovere la documentazione relativa.
   - Aggiornare la checklist QA per verificare che nessuna pagina faccia più riferimento a `window.__LEGACY_DB__`.

> Nota: mantenere il tool `migrate-existing-data.html` solo come riferimento storico. Per eventuali future migrazioni usare script Node con `firebase-admin`.

