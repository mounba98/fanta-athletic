# ⚽ ONLINE ATHLETIC MANAGER - Documentazione Completa

## 🎯 OVERVIEW
Gestionale sportivo web-based ispirato a OSM e Football Manager, basato su **Athletic Brescia**.

### Features Implementate ✅
1. **Dashboard** - Overview squadra, fondi, morale, prossime partite
2. **Sistema XP/Overall** - Giocatori migliorano con allenamenti e partite
3. **Allenamenti** - 4 tipi: Attacco, Difesa, Tecnica, Forma Fisica
4. **Formazione** - 5 titolari (1P-2D-2C-1A) + 3 panchina
5. **Mercato** - Compravendita giocatori tra squadre (TODO UI)
6. **Stadio** - 4 strutture upgradabili (Tribune, Campo, Spogliatoi, Luci)
7. **Sponsor** - Contratti settimanali per introiti extra
8. **Ritiro** - Bonus +10% XP e +10 morale per 24h
9. **Simulazione Partite** - Engine automatico con formula ponderata
10. **Leghe** - Creazione automatica campionati con AI teams

---

## 🏗️ ARCHITETTURA

### Files
- `athletic-manager.html` - UI principale con tutti i tab
- `athletic-manager-engine.js` - Game engine completo
- Firebase Firestore - Database real-time

### Collections Firestore
```
manager_teams/
├── {teamId}/
│   ├── name, owner, funds, morale
│   ├── stadium: {tribune, campo, spogliatoi, luci}
│   ├── sponsor: {name, weeklyIncome, expiresAt}
│   ├── retreat: {active, endsAt}
│   ├── formation: {starters[], bench[]}
│   └── players/
│       └── {playerId}/
│           ├── nome, cognome, ruolo
│           ├── overall, xp, age
│           └── value, morale, injured

manager_leagues/
├── {leagueId}/
│   ├── name, createdBy, teams[]
│   ├── matchday, totalMatchdays
│   └── createdAt

manager_calendar/
├── {matchId}/
│   ├── leagueId, matchday
│   ├── homeTeamId, awayTeamId
│   ├── played, result
│   └── homeGoals, awayGoals

manager_matches/
├── {matchId}/
│   ├── homeTeamId, awayTeamId
│   ├── homeGoals, awayGoals
│   ├── result (H/A/D)
│   ├── homeStrength, awayStrength
│   └── timestamp
```

---

## ⚙️ SISTEMA XP / OVERALL

### Meccanica
- Ogni giocatore inizia con **overall 68-75** e **XP 0-50**
- **Allenamento**: +5-10 XP per sessione
- **Partita giocata**: +2 XP ai titolari
- **Level up**: Ogni 100 XP → **Overall +1**, XP reset a 0

### Formula
```javascript
while (xp >= 100) {
  xp -= 100;
  overall += 1;
}
```

### Bonus Ritiro
- Se ritiro attivo: **XP × 1.10**

---

## 🏋️ ALLENAMENTI

### 4 Tipi
1. **Attacco** ⚔️ - +XP solo Attaccanti
2. **Difesa** 🛡️ - +XP Portieri + Difensori
3. **Tecnica** ⚙️ - +XP Centrocampisti
4. **Forma Fisica** 💪 - +XP TUTTI i giocatori

### Limitazioni
- **1 sessione per tipo al giorno**
- XP Range: **5-10** (casuale)
- Tracciamento: `manager_teams/{id}/training/{YYYY-MM-DD}`

---

## ⚽ FORMAZIONE

### Regole
- **Titolari**: 5 giocatori esatti
  - 1 Portiere (P)
  - 2 Difensori (D)
  - 2 Centrocampisti (C)
  - 1 Attaccante (A)
- **Panchina**: 3 riserve (qualsiasi ruolo)

### Validazione
```javascript
roleCount.P === 1 && 
roleCount.D === 2 && 
roleCount.C === 2 && 
roleCount.A === 1
```

---

## 🏟️ STADIO

### 4 Strutture Upgradabili

| Struttura | Livello Max | Costi | Effetto |
|-----------|-------------|-------|---------|
| **Tribune** 🏟️ | 4 | 500→800→1200→2000 | +10% introiti partita per livello |
| **Campo** 🌱 | 4 | 400→700→1000→1500 | +5 morale per livello |
| **Spogliatoi** 🚿 | 4 | 300→600→900→1300 | +5% XP allenamenti per livello |
| **Luci** 💡 | 4 | 250→500→800→1200 | +3 morale per livello |

### Benefici
- Tribune: Aumentano **introiti post-partita**
- Campo/Luci: Migliorano **morale squadra**
- Spogliatoi: Aumentano **efficienza allenamenti**

---

## 💰 ECONOMIA

### Fondi Iniziali
- **1200 crediti** per squadra

### Entrate
- **Sponsor**: +300 crediti/settimana (default Nike)
- **Partite**: 100 crediti base × (1 + Tribune level × 0.1)
- **Vendita giocatori**: Prezzo = Overall × Coefficiente

### Uscite
- **Upgrade stadio**: 250-2000 crediti
- **Ritiro**: 500 crediti (24h)
- **Acquisto giocatori**: Variabile

---

## ⛰️ RITIRO SQUADRA

### Costo
- **500 crediti**

### Durata
- **24 ore** real-time

### Effetti
- ✅ **+10% XP** a tutti gli allenamenti
- ✅ **+10 morale** squadra (immediatamente)

### Limitazioni
- Non puoi avviare un altro ritiro finché il precedente è attivo

---

## 🎮 SIMULAZIONE PARTITE

### Formula Forza Squadra
```javascript
forzaTotale = 
  mediaOverall(titolari) +
  (morale / 20) +              // Max +5 a morale 100
  stadiumBonus +               // +0.5 per livello struttura
  random(-2, 2)                // Casualità
```

### Calcolo Goal
```javascript
diff = forzaAttacco - forzaDifesa
baseGoals = max(0, floor((diff + 20) / 15))
randomGoals = random() < 0.3 ? 1 : 0
totalGoals = min(5, baseGoals + randomGoals)
```

### Effetti Post-Partita

| Risultato | Morale | Punti | Fondi |
|-----------|--------|-------|-------|
| **Vittoria** ✅ | +5 | 3 | +100 × tribuneBonus |
| **Pareggio** 🟰 | +1 | 1 | +100 × tribuneBonus |
| **Sconfitta** ❌ | -3 | 0 | +100 × tribuneBonus |

### XP Post-Partita
- **Titolari**: +2 XP ciascuno
- **Panchina**: 0 XP

---

## 🏆 LEGA & CAMPIONATO

### Creazione Lega
1. User clicca "Crea Lega"
2. Inserisce nome (es. "Campionato Athletic 2025")
3. Sceglie numero squadre (default: 8)
4. Sistema genera:
   - 7 squadre AI automatiche
   - Calendario completo (andata + ritorno)
   - Database strutturato

### Algoritmo Calendario
- **Round-robin** doppio (home & away)
- Totale giornate: `(N - 1) × 2` (es. 8 squadre = 14 giornate)
- Ogni squadra gioca contro tutte le altre 2 volte

### Classifica
Ordinamento:
1. **Punti** (V=3, N=1, P=0)
2. **Differenza reti** (GF - GS)
3. **Goal fatti**

---

## 🤖 SQUADRE AI

### Generazione Automatica
- **Nome**: Athletic 2011, 2012, 2013...
- **Fondi**: 1000-1500 (random)
- **Morale**: 70-90 (random)
- **Giocatori**: 8 giocatori generati (same as user)
- **Overall**: 68-75 (random)

### Comportamento AI (TODO)
- Attualmente: squadre statiche
- Future: AI autonoma per mercato, allenamenti, formazione

---

## 📊 PROGRESSIONE GIORNALIERA

### Reset Giornaliero
- ✅ Allenamenti (4 slot reset)
- ✅ Partite simulate automaticamente

### Timers Real-Time
- ⏰ Ritiro: 24h countdown
- ⏰ Sponsor: settimanale
- ⏰ Partite: 1 al giorno (21:00)

---

## 🚀 DEPLOYMENT

### Step
1. Deploy files su Firebase Hosting
2. Configura Firestore Collections
3. Setup Firestore Rules (vedi sotto)
4. Test con utente reale

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Manager Teams - Owner full access
    match /manager_teams/{teamId} {
      allow read: if true; // Tutti possono vedere
      allow write: if request.auth != null && 
                     resource.data.owner == request.auth.uid;
      
      match /players/{playerId} {
        allow read: if true;
        allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/manager_teams/$(teamId)).data.owner == request.auth.uid;
      }
      
      match /training/{date} {
        allow read, write: if request.auth != null && 
                              get(/databases/$(database)/documents/manager_teams/$(teamId)).data.owner == request.auth.uid;
      }
    }
    
    // Leagues - Public read, owner write
    match /manager_leagues/{leagueId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                              resource.data.createdBy == request.auth.uid;
    }
    
    // Matches - Public read, system write
    match /manager_matches/{matchId} {
      allow read: if true;
      allow write: if request.auth != null; // TODO: Cloud Function only
    }
    
    // Calendar - Public read
    match /manager_calendar/{matchId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## 💡 ROADMAP FUTURE

### Fase 1 ✅ (Completato)
- [x] Setup base + UI
- [x] Sistema XP/Overall
- [x] Allenamenti 4 tipi
- [x] Formazione validata
- [x] Stadio 4 strutture
- [x] Simulazione partite
- [x] Lega autogenerata
- [x] Classifica real-time

### Fase 2 (Prossimi Step)
- [ ] UI Mercato completa (offerte/accettazioni)
- [ ] Notifiche push (scadenza ritiro, prossima partita)
- [ ] Statistiche dettagliate giocatore
- [ ] Achievements e badge
- [ ] Mobile app (PWA)

### Fase 3 (Advanced)
- [ ] AI autonoma per squadre
- [ ] Multiplayer 1v1 real-time
- [ ] Mini-game allenamenti interattivi
- [ ] Tattiche personalizzabili (moduli 3-4-3, 4-3-3, ecc)
- [ ] Sistema infortuni/squalifiche
- [ ] Coppa ed eventi speciali
- [ ] Social: chat lega, trash talk

---

## 🐛 DEBUG & TESTING

### Console Logs
```javascript
console.log('✅ Athletic Manager loaded for user:', user.uid);
console.log('⚠️ User has no team, creating default...');
console.log('🏋️ Training result:', result);
```

### Test Checklist
- [ ] Crea squadra default
- [ ] Allenamento → vedi XP increase
- [ ] Level up → overall +1
- [ ] Salva formazione valida
- [ ] Upgrade stadio → fondi decrease
- [ ] Ritiro → morale +10
- [ ] Simula partita → vedi risultato
- [ ] Crea lega → 8 squadre generate
- [ ] Classifica → ordine corretto

---

## 🎮 GUIDE UTENTE

### Come Iniziare
1. **Login** con Firebase Auth
2. **Auto-generazione squadra** (8 giocatori random)
3. **Dashboard** → vedi overview
4. **Allenamento** → fai 1 sessione per aumentare XP
5. **Formazione** → imposta titolari (1P-2D-2C-1A)
6. **Lega** → crea campionato (genera 7 AI teams)
7. **Partite** → simula match automatici

### Tips & Tricks
- 💡 **Allena regolarmente** per far crescere i giocatori
- 💡 **Upgrade Tribune PRIMA** per aumentare introiti
- 💡 **Usa ritiro prima di partite importanti** (+10% XP, +10 morale)
- 💡 **Morale alto = +performance** in partita
- 💡 **Risparmia fondi** per upgrades costosi (livello 3-4)

---

## 📞 SUPPORT

Per bug o feature request:
- GitHub Issues
- Email: support@athletic-manager.app (TODO)
- Discord: Athletic Manager Community (TODO)

---

**🎉 Buon Gioco! Porta l'Athletic alla vittoria! ⚽🏆**
