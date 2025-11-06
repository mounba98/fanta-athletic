# 🔧 ADMIN UTILITY & TOOLS - GUIDA COMPLETA

**Ultimo aggiornamento**: 21 Ottobre 2025  
**Accesso**: https://fanta-athletic.web.app/admin.html

---

## 📍 DOVE TROVARLE

Tutte le utility sono ora organizzate nel **Pannello Admin** sotto la sezione:

**🔧 Utility & Tools**

Vai su: https://fanta-athletic.web.app/admin.html e scorri fino in fondo.

---

## 🛠️ ELENCO COMPLETO UTILITY

### 1. 📸 Upload Foto Giocatori
**Link**: `upload-foto-giocatori.html`

**Cosa fa**:
- Carica foto profilo per i giocatori del roster
- Supporta drag & drop delle immagini
- Crop automatico per foto circolari
- Upload su Firebase Storage
- Aggiorna Firestore con URL foto

**Quando usarlo**:
- All'inizio stagione per caricare tutte le foto
- Quando aggiungi nuovi giocatori
- Per aggiornare foto obsolete

**Come usarlo**:
1. Clicca "Carica Foto"
2. Seleziona la lega
3. Cerca giocatore per nome
4. Carica immagine (drag & drop o click)
5. Ritaglia se necessario
6. Conferma upload

---

### 2. 🔑 Genera Codici Invito Leghe
**Link**: `add-invite-code-to-leagues.html`

**Cosa fa**:
- Aggiunge campo `inviteCode` (6 caratteri) a tutte le leghe
- Verifica quali leghe hanno già il codice
- Genera codici univoci solo per leghe senza

**Quando usarlo**:
- **UNA VOLTA SOLA** dopo aver creato le leghe
- Se hai leghe create prima di implementare la funzionalità join
- Quando "Codice non valido" appare in join-league.html

**Come usarlo**:
1. Clicca "Genera Codici"
2. Clicca "Verifica Leghe" → Vedi riepilogo
3. Clicca "Genera Codici Invito" → Conferma
4. Vai su league-invite.html per vedere i codici

**⚠️ ATTENZIONE**: Eseguire UNA VOLTA SOLA! I codici esistenti non vengono sovrascritti.

---

### 3. 🔗 Fix Associazione Utenti-Leghe
**Link**: `fix-users-leagues.html`

**Cosa fa**:
- Associa utenti esistenti alla lega "Fanta Athletic"
- Aggiunge utenti all'array `members` della lega
- Aggiorna profilo utente con `leagues` e `currentLeague`

**Quando usarlo**:
- Se utenti esistono ma non sono in nessuna lega
- Dopo migrazione da sistema single-league a multi-league
- Se utente non vede la dashboard (no lega associata)

**Come usarlo**:
1. Clicca "Fix Associazioni"
2. Clicca "Info Lega" → Vedi dettagli lega
3. Clicca "Fix Utenti" → Associa automaticamente tutti

**⚠️ ATTENZIONE**: Tutti gli utenti verranno associati alla lega hardcoded.

---

### 4. 📦 Migrazione Dati Legacy
**Link**: `migrate-existing-data.html`

**Cosa fa**:
- Migra squadre da `/teams/{id}` a `/leagues/{leagueId}/teams/{id}`
- Migra giocatori da `/players/{id}` a `/leagues/{leagueId}/players/{id}`
- Crea lega "Fanta Athletic 2024-25" se non esiste
- Mantiene dati originali (non cancella)

**Quando usarlo**:
- **SOLO UNA VOLTA** quando passi da single-league a multi-league
- Se hai dati in collection top-level `/teams` e `/players`

**Come usarlo**:
1. Clicca "Migra Dati"
2. Leggi attentamente gli step
3. Clicca "Check Database" → Verifica dati esistenti
4. Clicca "Migra Dati" → Conferma (IRREVERSIBILE!)

**⚠️ ATTENZIONE**: Operazione IRREVERSIBILE! Fai backup prima!

---

### 5. 🌱 Popola Database Test
**Link**: `populate-data.html`

**Cosa fa**:
- Popola database con dati di esempio/test
- Crea giocatori fittizi
- Utile per development/staging

**Quando usarlo**:
- **SOLO su ambiente di TEST/DEV**
- Per testare funzionalità senza dati reali
- MAI in produzione!

**Come usarlo**:
1. Verifica di essere su ambiente test
2. Clicca "Popola DB"
3. Segui le istruzioni

**⚠️ ATTENZIONE**: NON usare in produzione!

---

### 6. 🧪 Test Sistema Penalità
**Link**: `test-penalties.html`

**Cosa fa**:
- Verifica formazioni mancanti per giornata
- Applica penalità automatiche (0-3)
- Controlla risultati H2H
- Reset dati di test

**Quando usarlo**:
- Prima di calcolare giornata ufficiale
- Per verificare penalità corrette
- Debug risultati H2H strani

**Come usarlo**:
1. Seleziona giornata
2. Clicca "Verifica Formazioni" → Vedi chi manca
3. Clicca "Applica Penalità" → Aggiorna risultati
4. Clicca "Controlla H2H" → Verifica risultati finali

---

## 📊 TABELLA RIEPILOGO

| # | Tool | Frequenza | Rischio | Descrizione Breve |
|---|------|-----------|---------|-------------------|
| 1 | 📸 Upload Foto | **Frequente** | 🟢 Basso | Carica foto giocatori |
| 2 | 🔑 Codici Invito | **Una volta** | 🟢 Basso | Genera codici join lega |
| 3 | 🔗 Fix Utenti-Leghe | **Raro** | 🟡 Medio | Associa utenti a lega |
| 4 | 📦 Migrazione Legacy | **Una volta** | 🔴 Alto | Migra a multi-league |
| 5 | 🌱 Popola DB Test | **Dev only** | 🟡 Medio | Dati test |
| 6 | 🧪 Test Penalità | **Settimanale** | 🟢 Basso | Verifica penalità |

---

## 🎯 WORKFLOW CONSIGLIATO

### Setup Iniziale Stagione
1. ✅ **Migrazione Dati** (se vieni da versione precedente)
2. ✅ **Genera Codici Invito** (per join league)
3. ✅ **Upload Foto Giocatori** (tutte le foto del roster)
4. ✅ **Fix Utenti-Leghe** (se necessario)

### Operazioni Settimanali
1. 🔄 **Test Penalità** (ogni giornata prima del calcolo)
2. 📸 **Upload Foto** (solo se nuovi giocatori)

### Manutenzione Straordinaria
1. 🔧 **Fix Utenti-Leghe** (se utente non vede dashboard)
2. 🔑 **Codici Invito** (se "codice non valido")

---

## 🚨 ERRORI COMUNI & SOLUZIONI

### ❌ "Codice non valido" in join-league
**Causa**: Lega senza campo `inviteCode`  
**Soluzione**: Esegui "Genera Codici Invito"

### ❌ Utente non vede dashboard
**Causa**: Utente non associato a nessuna lega  
**Soluzione**: Esegui "Fix Utenti-Leghe"

### ❌ Foto giocatore non appare
**Causa**: URL non salvato in Firestore  
**Soluzione**: Ri-carica foto tramite "Upload Foto Giocatori"

### ❌ Penalità non applicate
**Causa**: Risultati H2H non aggiornati  
**Soluzione**: Esegui "Test Penalità" → "Applica Penalità"

---

## 📍 LINK DIRETTI

### Utility & Tools
- 📸 Upload Foto: https://fanta-athletic.web.app/upload-foto-giocatori.html
- 🔑 Codici Invito: https://fanta-athletic.web.app/add-invite-code-to-leagues.html
- 🔗 Fix Utenti: https://fanta-athletic.web.app/fix-users-leagues.html
- 📦 Migrazione: https://fanta-athletic.web.app/migrate-existing-data.html
- 🌱 Popola DB: https://fanta-athletic.web.app/populate-data.html
- 🧪 Test Penalità: https://fanta-athletic.web.app/test-penalties.html

### Pannelli Admin
- 🛠️ Admin Home: https://fanta-athletic.web.app/admin.html
- 👑 Gestione Admin: https://fanta-athletic.web.app/admin-admins.html
- 👥 Gestione Giocatori: https://fanta-athletic.web.app/admin-roster.html
- ⚽ Gestione Squadre: https://fanta-athletic.web.app/admin-teams.html

---

## 📝 NOTE FINALI

1. **Backup prima di operazioni critiche** (migrazione, fix utenti)
2. **Test su ambiente dev** prima di eseguire in produzione
3. **Verifica risultati** dopo ogni operazione
4. **Consulta console browser** per errori (F12)
5. **Non eseguire utility multiple contemporaneamente**

---

**Tutte le utility sono accessibili da**: https://fanta-athletic.web.app/admin.html 🚀
