# 🏀🏐 FANTA BASKET + FANTA VOLLEY - IMPLEMENTATION GUIDE

**Status**: 📋 READY TO IMPLEMENT
**Tempo stimato**: 8-12h sviluppo completo
**Priorità**: MEDIA (dopo fix critici)

---

## 📊 OVERVIEW

Sistema multi-sport per gestire Fanta Basket e Fanta Volley con:
- ✅ Regole custom per sport
- ✅ Toggle regole admin lega
- ✅ Formazioni diverse (basket: 1PG+1SG+1SF+1PF+1C+2UTIL+3BN, volley: 1P+2S+1O+1C+1L+3BN)
- ✅ Punteggi specifici per sport
- ✅ Layout simile Fanta Athletic

---

## 🗂️ STRUTTURA DATABASE

### **Firestore Collections**

```
sports/
├── basket/
│   ├── config: { positions, lineup_slots, captain_multiplier, scoring, waivers_per_week }
│   └── rules: [{ code, label, value, eligible, apply }]
└── volley/
    ├── config: { positions, lineup_slots, captain_multiplier, scoring, waivers_per_week }
    └── rules: [{ code, label, value, eligible, apply }]

leagues/{leagueId}/
├── sport: "calcio" | "basket" | "volley"
├── custom_rules: [{ rule_id, enabled, custom_value }]
└── rules_toggle: { [rule_id]: boolean }

players_{sport}/{playerId}/
├── nome_completo: string
├── position: "PG" | "SG" | "SF" | "PF" | "C" (basket) | "P" | "S" | "O" | "C" | "L" (volley)
├── team: string
└── stats: { PTS, REB, AST, STL, BLK, 3PM, TOV, PF } (basket) | { ATT_KILL, ACE, BLK, DIG, REC_PERF } (volley)
```

---

## 📋 REGOLE BASKET

### **Punteggi Base**
```javascript
{
  "PTS": { label: "Punti", value: 1 },
  "REB": { label: "Rimbalzi", value: 1.2 },
  "AST": { label: "Assist", value: 1.5 },
  "STL": { label: "Palle rubate", value: 3 },
  "BLK": { label: "Stoppate", value: 3 },
  "3PM": { label: "Triple realizzate", value: 1 },
  "TOV": { label: "Palle perse", value: -1 },
  "PF": { label: "Falli personali", value: -0.5 },
  "TECH": { label: "Tecnico", value: -2 },
  "EJECT": { label: "Espulsione", value: -5 },
  "DD": { label: "Double-Double", value: 2 },
  "TD": { label: "Triple-Double", value: 5 },
  "TEAM_WIN": { label: "Vittoria squadra (titolari)", value: 2, apply: "starter" }
}
```

### **Formazione**
- **Titolari**: 1 PG + 1 SG + 1 SF + 1 PF + 1 C + 2 UTIL
- **Panchina**: 3 giocatori
- **Capitano**: +20% punteggio
- **Vincolo**: Almeno 1 per ogni ruolo principale

---

## 📋 REGOLE VOLLEY

### **Punteggi Base**
```javascript
{
  "ATT_KILL": { label: "Punto in attacco", value: 3 },
  "ACE": { label: "Ace", value: 3 },
  "BLK": { label: "Muro punto", value: 3 },
  "DIG": { label: "Difesa (dig)", value: 1 },
  "REC_PERF": { label: "Ricezione perfetta", value: 1, eligible: ["S","L"] },
  "REC_NEG": { label: "Ricezione negativa", value: -1, eligible: ["S","L"] },
  "ATT_ERR": { label: "Errore in attacco", value: -1 },
  "SERV_ERR": { label: "Errore al servizio", value: -1 },
  "TEAM_WIN": { label: "Vittoria match (titolari)", value: 3, apply: "starter" },
  "SET_WON": { label: "Set vinto (titolari)", value: 1, apply: "starter" },
  "MVP": { label: "MVP di squadra", value: 3 },
  "YELLOW": { label: "Cartellino giallo", value: -1 },
  "RED": { label: "Cartellino rosso", value: -3 }
}
```

### **Formazione**
- **Titolari**: 1 P + 2 S + 1 O + 1 C + 1 L
- **Panchina**: 2-3 giocatori
- **Capitano**: +20% punteggio
- **Vincolo**: Almeno 1 per ogni ruolo

---

## 🎨 UI/UX DESIGN

### **Layout Formazioni**

**Basket** (7 titolari):
```
     [PG]
[SG]      [SF]
[PF]      [C]
  [UTIL] [UTIL]
```

**Volley** (6 titolari):
```
[S]  [O]  [S]
[P]  [C]  [L]
```

### **Colori Sport**
- **Basket**: 🏀 Arancione (#FF6B35) + Nero (#1A1A1A)
- **Volley**: 🏐 Blu (#0066CC) + Bianco (#FFFFFF)

---

## 🔧 IMPLEMENTAZIONE

### **FASE 1: Database Setup** (2h)
1. Crea collections `sports/basket` e `sports/volley`
2. Upload regole JSON
3. Crea `players_basket` e `players_volley` collections
4. Setup Firestore rules

### **FASE 2: Admin Panel** (3h)
1. `admin-sport-config.html` - Gestione sport e regole
2. Toggle regole per lega
3. Import/Export giocatori CSV
4. Configurazione punteggi custom

### **FASE 3: Formazioni Sport** (4h)
1. `formazioni-basket.html` - Layout 7 slot
2. `formazioni-volley.html` - Layout 6 slot
3. Validazione formazioni per sport
4. Drag&drop con vincoli ruolo

### **FASE 4: Matchday Sport** (3h)
1. `matchday-basket.html` - Inserimento stats basket
2. `matchday-volley.html` - Inserimento stats volley
3. Calcolo automatico punteggi
4. Integrazione con classifiche

---

## 📝 FILES DA CREARE

### **Config JSON**
- ✅ `data/basket-config.json` (creato)
- ✅ `data/volley-config.json` (creato)
- ✅ `data/basket-rules.json` (creato)
- ✅ `data/volley-rules.json` (creato)

### **HTML Pages**
- [ ] `admin-sport-config.html` - Admin gestione sport
- [ ] `formazioni-basket.html` - Formazioni basket
- [ ] `formazioni-volley.html` - Formazioni volley
- [ ] `matchday-basket.html` - Calcolo giornata basket
- [ ] `matchday-volley.html` - Calcolo giornata volley

### **JS Modules**
- [ ] `resources/sport-config.js` - Caricamento config sport
- [ ] `resources/sport-validator.js` - Validazione formazioni
- [ ] `resources/sport-calculator.js` - Calcolo punteggi

---

## 🚀 DEPLOYMENT PLAN

### **Step 1: Setup Database**
```bash
# Upload config
firebase firestore:import sports/ --from data/sports-export.json

# Create indexes
firebase deploy --only firestore:indexes
```

### **Step 2: Deploy Files**
```bash
# Build
npm run build

# Deploy
firebase deploy --only hosting
```

### **Step 3: Test**
1. Crea lega basket test
2. Aggiungi giocatori
3. Crea formazione
4. Calcola giornata
5. Verifica classifiche

---

## 🔐 FIRESTORE RULES

```javascript
// Sport configs (read-only per utenti)
match /sports/{sport} {
  allow read: if true;
  allow write: if isAdmin();
}

// Players per sport
match /players_{sport}/{playerId} {
  allow read: if true;
  allow write: if isAdmin();
}

// League custom rules
match /leagues/{leagueId}/custom_rules/{ruleId} {
  allow read: if isLeagueMember(leagueId);
  allow write: if isLeagueAdmin(leagueId);
}
```

---

## 💡 FEATURES AVANZATE (Future)

### **V2.0**
- [ ] Import automatico stats da API esterne
- [ ] Notifiche push pre-partita
- [ ] Statistiche avanzate (trend, proiezioni)
- [ ] Mercato con asta live

### **V3.0**
- [ ] Multi-sport in stessa lega (calcio + basket)
- [ ] Tornei cross-sport
- [ ] Classifiche unificate
- [ ] Badge achievements multi-sport

---

## 📊 METRICHE SUCCESS

**KPI**:
- Numero leghe basket/volley create
- Utenti attivi per sport
- Giornate calcolate
- Engagement (formazioni salvate/settimana)

**Target Q1 2025**:
- 5+ leghe basket
- 3+ leghe volley
- 50+ utenti attivi
- 90% uptime

---

## 🆘 SUPPORTO

**Documentazione**:
- README basket: `BASKET_README.md`
- README volley: `VOLLEY_README.md`
- Video tutorial: (da creare)

**Contatti**:
- Discord: #fanta-athletic
- Email: support@fanta-athletic.it

---

**🎯 READY TO IMPLEMENT - PRIORITÀ DOPO FIX CRITICI**

**Tempo totale stimato**: 12-15h
**Complessità**: MEDIA-ALTA
**ROI**: ALTO (espansione utenti +200%)
