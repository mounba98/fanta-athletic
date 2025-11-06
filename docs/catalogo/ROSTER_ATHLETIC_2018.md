# 📝 Roster Catalogo – Athletic 2018

**Club:** Athletic 2018  
**Campionato:** Amatori AICS Firenze – Girone B1 (`AICS_FI_B1`)  
**Regione:** Toscana (`TOSCANA`)  
**Stagione di riferimento:** 2024/2025 (`2024_2025`)

---

## 📦 Stato iniziale

- Il roster esiste già in Firestore all’interno della lega legacy `4rq1Rr0TquRfuPLmqQTn`.
- Contiene 31 giocatori (ID `P001`…`P031`) con ruoli assegnati.
- Alcuni roster delle squadre della lega fanno riferimento a questi player ID.

## 🎯 Obiettivo migrazione

- Estrarre i dati dal path legacy `leagues/4rq1Rr0TquRfuPLmqQTn/players`.
- Normalizzare in `players_global/` con chiavi canoniche (nome, cognome, ruolo, optional birthdate).
- Creare `clubs/athletic-2018` con metadati campionato/regione.
- Creare `rosters/athletic-2018-2024-25-v1` con subcollection `roster_members/`.
- Impostare `visibility: public` (riutilizzabile da leghe future) e `version: 1.0.0`.
- Collegare `roster_members[].playerRef` ai documenti `players_global` creati.

## 🧭 Piano migrazione tecnica

1. **Export dati legacy** (script `node` o `firebase-admin`):
   - Leggere tutti i doc `players` legacy.
   - Costruire canonical key per dedup (nome+cognome+ruolo).

2. **Populate `players_global`:**
   - Nuovo doc per ogni player legacy.
   - Campi minimi: `playerId`, `firstName`, `lastName`, `role`, `defaultClubRef`, `canonicalKeys[]`, `createdBy`.

3. **Create `clubs/athletic-2018`:**
   - `name`, `championshipRef: AICS_FI_B1`, `regionRef: TOSCANA`, `seasonDefault: 2024_2025`, `createdBy` (superadmin).

4. **Create `rosters/athletic-2018-2024-25-v1`:**
   - `clubRef`, `seasonRef`, `version: 1.0.0`, `status: published`, `visibility: public`, `maintainers: [superadminUid...]`.

5. **Push `roster_members`:**
   - Doc per ogni player: `playerRef`, `role`, `shirtNumber` se disponibile, `addedBy`, `addedAt`.

6. **Verifiche post-migrazione:**
   - Query `players_global` → 31 risultati attesi.
   - Query `roster_members` → 31 risultati collegati correttamente.
   - `player_pool` legacy ancora funzionante (fino a completamento V2).

### Script di supporto

Esecuzione consigliata:

```bash
npm install firebase-admin
export GOOGLE_APPLICATION_CREDENTIALS="/path/serviceAccount.json"
node scripts/catalog-migration/migrate-athletic-roster.js \
  --project fanta-athletic \
  --legacyLeague 4rq1Rr0TquRfuPLmqQTn \
  --superadminUid fTaDr6Odn0fBpWS6e7QWOujmLlj1
```

Opzioni utili:
- `--dryRun` per vedere i payload senza scrivere
- `--playersJson` per usare un dataset locale differente

## ✅ Output atteso

- Catalogo globale popolato con Athletic 2018 (v1.0.0).
- Pronto per essere selezionato dal wizard lega V2.
- Base per test dedup/merge quando aggiungeremo altri roster (es. Sesto Calcio).


