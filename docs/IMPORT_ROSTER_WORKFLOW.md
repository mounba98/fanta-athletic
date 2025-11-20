# Import Manuale Roster / Competitions (Bozza)

## Obiettivi
- Consentire a chiunque (admin dilettanti, investitori con demo) di caricare rapidamente squadre e giocatori **direttamente dall’app**, senza usare script o CLI.
- Garantire coerenza con il catalogo multi-sport: l’import può creare una competition ad hoc oppure scrivere direttamente in `leagues/{leagueId}`.
- Supportare più formati: CSV/Excel semplici, JSON esportato, collegamento a competition ufficiali già seedate.

## UI proposta (admin-leghe.html)
1. **Nuova sezione “Importa Roster”** sotto ogni card lega:
   - Pulsante “Importa da file…”
   - Pulsante “Duplica da competition” (usa il workflow attuale dietro le quinte).
2. **Modal wizard** con i passaggi:
   1. Scegli origine:
      - CSV/Excel locale (con template scaricabile)
      - JSON compatibile (esporta/ri-importa)
      - Competition catalog (`competitions/*`)
   2. Anteprima + mapping colonne (es. colonna “Ruolo” → `role`, colonna “Squadra” → `teamId`).
   3. Opzioni:
      - Numero slot squadra (default da `SPORT_CONFIG`)
      - Sovrascrivi roster esistenti? (toggle)
      - Abilita bonus/malus classici (checkbox)
   4. Review + conferma.
3. **Progress UI** con stato e log errori (es. riga 12: ruolo mancante).

## Formati supportati
### CSV/Excel (UTF-8)
| team | player | role | roleCode | shirtNumber | marketValue |
|------|--------|------|----------|-------------|-------------|
| Boca Juniors | Santiago Torres | Portiere | P | 1 | 18 |

Regole:
- `team` obbligatorio (crea la squadra se non esiste)
- `role` o `roleCode` obbligatorio
- Campi extra ignorati ma salvati in `meta`.

### JSON
```json
{
  "teams": [
    { "teamId": "demo_fc", "name": "Demo FC", "coach": "Mario Rossi" }
  ],
  "players": [
    { "player_id": "DEM_P01", "teamId": "demo_fc", "roleCode": "P", "nome_completo": "Luca Test" }
  ]
}
```

## Flusso dati
1. Il wizard produce un payload normalizzato (`teams[]`, `players[]`, settings).
2. Un helper JS (riutilizzando la logica di `seed-league-from-competition`) scrive i documenti:
   - `leagues/{leagueId}/teams/<slot>` con `name`, `roster`, `logo`, `colors`.
   - `leagues/{leagueId}/players/{player_id}` con `role`, `teamId`, `meta`.
   - `leagues/{leagueId}` (`sportType`, `competitionId: custom-<timestamp>`, `settings.importSource`).
3. In futuro possiamo spostare la logica in una Cloud Function per file pesanti; per ora basta lato client (limite 10 MB).

## Pulizia / Lifecycle
- **Competition custom** generate da import manuale vengono salvate con `competitionId = custom-{leagueId}-{timestamp}` sotto `competitions/`.
- Scheduler (da aggiungere) invia reminder agli admin dopo 9 mesi di inattività (`lastActivity` su `leagues/{leagueId}`) e cancella dopo 12 mesi.
- Le leghe “pro” (flag `settings.autoReset = true`) vengono azzerate automaticamente a fine stagione: lo script archivia i risultati e ripulisce `teams`/`players` mantenendo solo settaggi.

## Prossimi passi
1. Implementare il modal wizard (HTML + `FileReader` + parser CSV/Excel).
2. Riutilizzare `seed-league-from-competition.js` come modulo JS (`importLeagueFromPayload(payload)`), così la UI e gli script CLI condividono la stessa logica.
3. Aggiungere API per scaricare template CSV (generato dinamicamente in base allo sport).
4. Pianificare Cloud Function “league-cleanup” per auto-delete/archiviazione.

Con questo flusso un admin può caricare la “Fanta Festa” o la “Fanta Serie D” in un solo passaggio direttamente dal browser, senza toccare il DB legacy.

