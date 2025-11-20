# 🧪 LISTA CAMBIAMENTI DA TESTARE

**Ultimi Deploy**: 19-20 Ottobre 2025, v2025101906

---

## ✅ FEATURE PRINCIPALI DA TESTARE

### 1. 🔐 Login Obbligatorio
**Cosa fa**: Tutte le pagine ora richiedono login
- **Test**: Logout → Prova ad accedere a index.html → Deve redirect a auth.html
- **Test**: Login → Verifica che carichi ultima lega usata

---

### 2. 🔀 Selettore Lega Navbar
**Cosa fa**: Dropdown in alto a sinistra per switchare tra leghe
- **Test**: Click sul bottone con nome lega in navbar
- **Test**: Verifica che mostri tutte le tue leghe
- **Test**: Click su una lega diversa → Deve ricaricare pagina con quella lega
- **Test**: Click "➕ Crea Nuova" → Vai ad admin-leghe.html
- **Test**: Click "🔍 Unisciti" → Modal per inserire codice

**Dove**: Tutte le pagine (navbar in alto)

---

### 3. 📂 Import Giocatori Excel/CSV 🔥 KILLER FEATURE
**Cosa fa**: Importa intera rosa da file Excel o CSV

**Come Testare**:
1. Vai su **Admin → Import Giocatori**
2. Click "📥 Scarica Template" → Download CSV esempio
3. Apri in Excel e aggiungi i tuoi giocatori
4. Salva come CSV o Excel
5. Drag & drop file nella zona upload
6. Verifica preview con:
   - Tabella giocatori
   - Statistiche (Portieri, Difensori, etc.)
   - Errori evidenziati in rosso
7. Click "✅ Conferma Importa"
8. Aspetta completion
9. Vai in Admin → Gestione Giocatori
10. Verifica che i giocatori siano stati importati

**Colonne Riconosciute** (auto-detection):
- Nome, Cognome, Nome Completo
- Squadra, Team, Club
- Ruolo, Role, Position (P/D/C/A)
- Valore, Value, Prezzo

**Supporta**: Excel (.xlsx, .xls), CSV (.csv)

---

### 4. 📊 Sistema Voti Opzionale
**Cosa fa**: Scegli se usare voti giocatori o solo bonus/malus

**Come Testare**:
1. Vai su **Admin → Leghe**
2. Click "➕ Crea Competizione"
3. Trova checkbox "📊 Usa Voti Giocatori"
4. **Test A**: Lascia attivato → Puoi usare modificatore difesa
5. **Test B**: Disattiva → Appare warning che modificatore sarà disabilitato
6. Crea lega e verifica settings salvati

**Impatto**:
- **Voti ON**: Calcolo = voto base + bonus/malus
- **Voti OFF**: Calcolo = solo bonus/malus (gol, assist, etc.)

---

### 5. ⭐ Wildcard/Capitano Configurabile
**Cosa fa**: Sistema capitano con moltiplicatore personalizzabile

**Come Testare**:
1. Admin → Leghe → Crea Competizione
2. Trova "⭐ Sistema Capitano/Wildcard"
3. Attiva checkbox
4. Configura:
   - **Moltiplicatore**: 1.5x, 2x, 2.5x, 3x
   - **Utilizzi Stagione**: 0 = illimitato, 1-38 = limitato
   - **Max per Giornata**: 1 giocatore (default)
5. Crea lega
6. Verifica settings salvati in Firestore

**Esempi Preconfigurati**:
- Capitano Classico: 2x, 0 utilizzi, 1/giornata
- Wildcard Limited: 3x, 5 utilizzi, 1/giornata
- Superbonus: 2.5x, 10 utilizzi

---

### 6. 📊 Dashboard Carousel
**Cosa fa**: Widgets scorrevoli in home page

**Come Testare**:
1. Vai su **index.html** (home)
2. Verifica presenza sezione "📊 Dashboard"
3. Vedi uno di questi widget:
   - 🏆 Classifica Top 5
   - ⚽ Top Scorer Stagione
   - 📅 Prossima Giornata
   - 📊 Statistiche Lega
4. Aspetta 5 secondi → Deve cambiare automaticamente
5. Click frecce ← → per navigare manualmente
6. Verifica su mobile → Swipe laterale

**Nota**: Serve avere dati (teams, players, matchdays) per vedere widgets

---

### 7. 📸 Sistema Foto Giocatori
**Cosa fa**: Upload foto giocatori, placeholder con iniziali se mancanti

**Come Testare**:
1. Vai su **Admin → Gestione Giocatori**
2. Edit un giocatore
3. Cerca sezione foto (se implementata in UI)
4. Upload immagine
5. Verifica salvato in Firebase Storage
6. Se NO foto → Vedi cerchio con iniziali (es. "EH" per Erling Haaland)
7. Colore basato su ruolo:
   - **P** = Oro
   - **D** = Blu
   - **C** = Verde
   - **A** = Rosso

**Nota**: Placeholder funziona automaticamente ovunque

---

## 🔄 SISTEMI JAVASCRIPT PRONTI (Senza UI Completa)

Questi sono pronti come codice ma potrebbero non avere UI completa:

### 8. 🔄 Sistema Scambi Ruolo per Ruolo
**File**: `resources/trades-system.js`

**Cosa fa**:
- Scambi P↔P, D↔D, C↔C, A↔A
- Validazione automatica
- Admin può annullare entro 24h
- Trade history

**API Disponibile**:
```javascript
TradesSystem.validateTrade(leagueId, fromTeam, toTeam, player1, player2)
TradesSystem.executeTrade(leagueId, tradeId)
TradesSystem.cancelTradeAdmin(leagueId, tradeId, userId)
```

**Test**: Serve UI completa (da finire)

---

### 9. 🛡️ Modificatore Difesa Automatico
**File**: `resources/defense-modifier-calculator.js`

**Cosa fa**:
- Prende Portiere + top 3 difensori
- Calcola media voto (senza bonus)
- Applica bonus/malus in base a soglie
- Solo con moduli 4+ difensori

**API Disponibile**:
```javascript
DefenseModifier.calculate(players, settings)
DefenseModifier.applyToMatchday(leagueId, matchdayId, teamId)
DefenseModifier.renderInfo(result)
```

**Test**: Chiamare da matchday quando calcoli punteggi

---

### 10. 🏆 Sistema Achievements (14 Badge)
**File**: `resources/achievements-system.js`

**Badge Disponibili**:
- 🔥 Hat-trick (3 gol)
- ⚡ Poker (4+ gol)
- 🛡️ Il Muro (clean sheet + media 7)
- 🏰 Fortezza (3 clean sheet consecutivi)
- 💎 Perfect 10 (voto 10)
- ⭐ Dream Team (media ≥7)
- 📈 Comeback King (recupero da -20)
- 👑 Dominio (+30 punti)
- 🎯 On Fire (3 vittorie)
- 🚀 Unstoppable (5 vittorie)
- ⭐ Captain Fantastic (capitano 20pt)
- 🍀 Lucky 7 (7 giocatori ≥7)
- 💪 Iron Man (nessuno <6)

**API Disponibile**:
```javascript
AchievementsSystem.checkAchievements(leagueId, matchdayId, teamId)
AchievementsSystem.getTeamAchievements(leagueId, teamId)
AchievementsSystem.renderGrid(achievements)
```

**Test**: Chiamare dopo salvare matchday

---

## 🔧 MODIFICHE STRUTTURA DATI

### Firestore Changes

**leagues/{id}**:
```javascript
{
  settings: {
    usePlayerRatings: true/false,  // NUOVO
    wildcard: {                    // NUOVO
      enabled: true,
      multiplier: 2.0,
      usesPerSeason: 0,
      maxPerMatchday: 1
    },
    defenseModifier: {             // GIÀ ESISTENTE
      enabled: false,
      thresholds: [...]
    },
    cupSystem: {                   // GIÀ ESISTENTE
      enabled: false
    }
  }
}
```

**leagues/{id}/players/{id}**:
```javascript
{
  nome_completo: "...",      // Auto-generato da import
  photoURL: "...",           // NUOVO
  photoUpdatedAt: Timestamp, // NUOVO
  migratedAt: Timestamp      // Se migrato da vecchia struttura
}
```

---

## 📱 TESTING PRIORITÀ

### 🔴 CRITICAL (Test Subito)
- [ ] Login redirect
- [ ] Selettore lega dropdown
- [ ] Crea competizione (utente normale)
- [ ] Import CSV
- [ ] Import Excel

### 🟡 HIGH
- [ ] Dashboard widgets
- [ ] Auto-rotate dashboard
- [ ] Sistema voti toggle
- [ ] Wildcard config
- [ ] Download template

### 🟢 MEDIUM
- [ ] Dark mode
- [ ] Mobile responsive
- [ ] Placeholder foto
- [ ] Batch 100+ giocatori

---

## 🐛 BUG NOTI

1. ~~Utente normale non può creare leghe~~ → **FIXATO**
2. ~~Super admin vede onboarding~~ → **FIXATO**
3. ~~Dati vecchi non visibili~~ → **FIXATO con migrazione**

---

## 💡 PROSSIMI STEP (Non Implementati)

- [ ] UI completa per scambi
- [ ] Dashboard achievements
- [ ] Notifiche header
- [ ] Coppa brackets completi
- [ ] Store merchandise
- [ ] Chat lega
- [ ] Pronostico giornata

---

## 📞 COME SEGNALARE BUG

Se trovi problemi:
1. **Screenshot** dell'errore
2. **Console** (F12) → Tab Console → Copia errori rossi
3. **Passi** per riprodurre
4. **Browser** e versione

---

**Ultimo Deploy**: 23:25, 19 Ottobre 2025
**Status**: ✅ LIVE
**URL**: https://fanta-athletic.web.app/
