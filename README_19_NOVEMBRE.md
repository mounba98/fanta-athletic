# Fanta Athletic - Refactor Multilega 19 Novembre 2025

## 🎯 Obiettivo della Sessione
Refactor completo del sistema multilega per le pagine calcio e allineamento delle regole Firestore per bloccare definitivamente le scritture sulle collezioni root calcistiche.

---

## ✅ Cosa Abbiamo Fatto Oggi

### 1. Refactor Multilega Pagine Calcio
**File modificati:**
- `public/formazioni.html`
- `public/squadre.html` 
- `public/matchday.html`
- `public/lineup-summary.html`
- `public/classifiche.html`

**Cambiamenti principali:**
- **Eliminato** ogni uso di `localStorage.last_league_id` e fallback `DEFAULT_LEAGUE_ID`
- **Integrato** `LeagueHelper` per ottenere `leagueId` solo da:
  - `ensureLeagueReady()`
  - `getLeagueIdOrNotify()`
  - `getCurrentLeagueIdCached()`
- **Refactor** tutte le query Firestore per usare solo path per-lega:
  - `leagues/{leagueId}/teams`
  - `leagues/{leagueId}/players`
  - `leagues/{leagueId}/coaches`
  - `leagues/{leagueId}/results/{giornata}/teams/{teamId}`
  - `leagues/{leagueId}/days/{giornata}`
  - `leagues/{leagueId}/matchday_temp/{giornata}`
  - `leagues/{leagueId}/h2h_schedule/{season}/giornate/{giornata}`
  - `leagues/{leagueId}/h2h_results/{season}/giornate/{giornata}`
- **Aggiunto** event listener `league-changed` per ricaricare le pagine al cambio lega
- **Implementato** error handling con:
  - Console logs taggati `[nomepagina]`
  - Toast user-friendly per lega mancante o errori Firestore

### 2. Refactor Regole Firestore
**File modificato:**
- `firestore.rules`

**Cambiamenti principali:**
- **Bloccate** le scritture su collezioni root calcistiche (LEGACY_READONLY):
  - `/teams/{teamId}` + `/saved/{giornata}`
  - `/players/{playerId}`
  - `/coaches/{coachId}`
  - `/results/{giornata}` + `/teams/{teamId}`
  - `/days/{giornata}`
  - `/matchday_temp/{giornataId}`
  - `/h2h_schedule/{seasonId}` + `/giornate/{giornataId}`
  - `/h2h_results/{seasonId}` + `/giornate/{giornataId}`
- **Mantenute** le letture su legacy per compatibilità
- **Verificato** che tutte le scritture calcistiche passino solo da `leagues/{leagueId}/...`
- **Aggiunti** commenti `LEGACY_READONLY` per chiarezza futura

---

## 🧪 Checklist di Test (da eseguire)

### Firestore Rules
- [ ] Write su `/teams/{id}` → PERMISSION_DENIED
- [ ] Write su `/results/G1/teams/0` → PERMISSION_DENIED  
- [ ] Write su `/h2h_schedule/2024-25` → PERMISSION_DENIED
- [ ] Write su `leagues/{leagueId}/results/G1/teams/0` → ALLOWED (admin lega)
- [ ] Write su `leagues/{leagueId}/h2h_schedule/2024-25` → ALLOWED (admin lega)

### Pagine Calcio
- [ ] `formazioni.html` → Caricamento squadre/giocatori per-lega
- [ ] `squadre.html` → Visualizzazione/modifica squadre per-lega
- [ ] `matchday.html` → Salvataggio risultati per-lega
- [ ] `lineup-summary.html` → Riepilogo formazioni per-lega
- [ ] `classifiche.html` → Classifiche per-lega
- [ ] Cambio lega → Ricaricamento automatico pagine

### Edge Cases
- [ ] Utente non loggato → Solo dati pubblici
- [ ] Utente senza permessi → Lettura ma non scrittura
- [ ] Admin lega → Accesso completo alla sua lega

---

## 🚀 Link per Test Locale
- **Firestore Emulator UI**: http://localhost:4000/firestore
- **Firebase Emulator Suite**: http://localhost:4000

---

## 📋 Cosa Manca da Implementare

### 1. Test e Validazione
- [ ] Eseguire tutti i test della checklist sopra
- [ ] Verificare che non ci siano regressioni nelle funzionalità esistenti
- [ ] Testare con utenti diversi ruoli (admin, member, guest)

### 2. Migrazione Dati Legacy (opzionale)
- [ ] Script per migrare dati da root a per-lega se necessario
- [ ] Verifica integrità dati dopo migrazione

### 3. Monitoraggio e Logging
- [ ] Aggiungere logging più dettagliato per debug delle regole
- [ ] Dashboard per monitorare accessi alle collezioni legacy

### 4. Documentazione Utente
- [ ] Guida per admin sulla gestione leghe
- [ ] Documentazione per sviluppatori sul nuovo modello dati

---

## 🔥 Prossimi Passi Prioritari

1. **Immediato**: Eseguire la checklist di test per validare il refactor
2. **Breve**: Risolvere eventuali problemi emersi dai test
3. **Medio**: Considerare disabilitazione completa letture legacy quando sicuri
4. **Lungo**: Migrazione automatica dati legacy se necessario

---

## 📞 Supporto

Per qualsiasi problema durante i test:
1. Controllare la console browser per errori taggati `[nomepagina]`
2. Verificare i log dell'emulator Firebase
3. Assicurarsi che l'utente abbia i permessi corretti sulla lega

---

**Data**: 19 Novembre 2025  
**Status**: Refactor completato, in attesa di validazione tramite test
