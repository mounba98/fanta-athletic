# 🏆 Sistema Competizioni Multi-Sport - Piano Completo

**Obiettivo**: Trasformare Fanta Athletic in piattaforma multi-competizione e multi-sport  
**Versione Target**: v2025102001  
**Sport Supportati**: Calcio, Volley, Basket (espandibile)

---

## 🎯 VISIONE GENERALE

### Scenario Attuale
- ✅ Single lega hardcoded
- ✅ Calcio only
- ✅ Regole fisse
- ❌ No multi-competizione
- ❌ No user-created leagues

### Scenario Target
- ✅ Multiple leghe parallele
- ✅ Multi-sport (Calcio, Volley, Basket)
- ✅ Utenti creano proprie leghe
- ✅ Regole personalizzabili per lega
- ✅ Competizioni attive/archiviate
- ✅ Inviti e gestione membri

---

## 📊 ARCHITETTURA FIRESTORE

### Collection Structure

```
firestore/
├── leagues/{leagueId}
│   ├── name: string
│   ├── sport: "calcio" | "volley" | "basket"
│   ├── status: "active" | "archived" | "draft"
│   ├── createdBy: uid
│   ├── createdAt: timestamp
│   ├── season: string (es. "2024/2025")
│   ├── settings: {
│   │   maxTeams: number
│   │   budgetPerTeam: number
│   │   enableTransfers: boolean
│   │   transferDeadline: timestamp
│   │   scoringSystem: "default" | "custom"
│   │ }
│   ├── admins: [uid]
│   ├── members: [uid]
│   ├── inviteCode: string (unique 6 chars)
│   └── stats: {
│       teamCount: number
│       playerCount: number
│       activeMembers: number
│     }
│
├── leagues/{leagueId}/teams/{teamId}
│   ├── name: string
│   ├── owner: uid
│   ├── budget: number
│   ├── roster: [playerId]
│   ├── formation: string (calcio: "4-3-3", volley: "5-1", basket: "2-3")
│   └── stats: { ... }
│
├── leagues/{leagueId}/players/{playerId}
│   ├── nome_completo: string
│   ├── nickname: string
│   ├── role: string (dipende da sport)
│   ├── team: string (squadra reale es. "Inter")
│   ├── value: number
│   ├── stats: { ... sport-specific }
│   └── status: "active" | "injured" | "suspended"
│
├── leagues/{leagueId}/matchdays/{matchdayId}
│   ├── giornata: number
│   ├── date: timestamp
│   ├── status: "pending" | "in_progress" | "completed"
│   ├── scores: { [teamId]: number }
│   └── playerScores: { [playerId]: { ... } }
│
├── leagues/{leagueId}/rules/{ruleId}
│   ├── rule_id: string (R001, R002...)
│   ├── nome_bonus: string
│   ├── valore: number
│   ├── sport: "calcio" | "volley" | "basket"
│   ├── attivo: boolean
│   └── visible: boolean
│
└── leagues/{leagueId}/classifica/current
    ├── standings: [{ teamId, points, wins, ... }]
    └── updatedAt: timestamp
```

### Sport-Specific Data

#### Calcio
```json
{
  "roles": ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
  "formations": ["4-4-2", "4-3-3", "3-5-2", "4-2-3-1"],
  "stats": ["gol", "assist", "clean_sheet", "rigori_parati", "ammonizioni"]
}
```

#### Volley
```json
{
  "roles": ["Palleggiatore", "Opposto", "Schiacciatore", "Centrale", "Libero"],
  "formations": ["5-1", "6-2", "4-2"],
  "stats": ["punti_totali", "ace", "muri", "attacchi_vincenti", "ricezioni_perfette"]
}
```

#### Basket
```json
{
  "roles": ["Playmaker", "Guardia", "Ala", "Ala Pivot", "Centro"],
  "formations": ["2-3", "1-2-2", "3-2"],
  "stats": ["punti", "rimbalzi", "assist", "recuperi", "stoppate", "triple"]
}
```

---

## 🛠️ IMPLEMENTAZIONE FASI

### FASE 1: Core League System (Priorità ALTA)

**Obiettivo**: Utenti possono creare e gestire leghe

**Tasks**:
1. ✅ `admin-leghe.html` (già fatto - base)
2. ⬜ Aggiungi sport selector (Calcio/Volley/Basket)
3. ⬜ Aggiungi season field
4. ⬜ Genera invite code univoco
5. ⬜ Sistema inviti (join by code)
6. ⬜ Gestione membri lega (kick, promote admin)

**Files da modificare**:
- `admin-leghe.html` (extend existing)
- `resources/league-context.js` (già creato)

**Tempo stimato**: 3-4 ore

---

### FASE 2: League Context Integration (Priorità ALTA)

**Obiettivo**: Tutti i pannelli usano lega attiva

**Tasks**:
1. ⬜ Modificare `matchday.html` per usare `leagues/{id}/matchdays`
2. ⬜ Modificare `squadre.html` per usare `leagues/{id}/teams`
3. ⬜ Modificare `classifiche.html` per filtrare per lega
4. ⬜ Modificare `formazioni.html` per lega specifica
5. ⬜ Aggiungere league badge in header di ogni pagina

**Migration**:
- Script per migrare dati root → `leagues/default/`
- Backward compatibility temporanea

**Files da modificare**:
- `matchday.html`
- `squadre.html`
- `classifiche.html`
- `formazioni.html`
- `admin-rules.html` (già fatto parzialmente)

**Tempo stimato**: 5-6 ore

---

### FASE 3: Multi-Sport Support (Priorità MEDIA)

**Obiettivo**: Supportare Volley e Basket oltre al Calcio

**Tasks**:
1. ⬜ Creare `sport-config.js` con configurazioni per sport
2. ⬜ Dynamic role selector in base a sport lega
3. ⬜ Dynamic formation selector
4. ⬜ Dynamic stats fields in matchday
5. ⬜ Sport-specific rules (es. "Ace" per volley)

**Example `sport-config.js`**:
```javascript
export const SPORTS = {
  calcio: {
    name: "Calcio",
    icon: "⚽",
    roles: ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
    formations: ["4-4-2", "4-3-3", "3-5-2"],
    defaultRules: [
      { code: "R001", desc: "Gol", value: 3 },
      { code: "R002", desc: "Assist", value: 1 }
    ]
  },
  volley: {
    name: "Pallavolo",
    icon: "🏐",
    roles: ["Palleggiatore", "Opposto", "Schiacciatore", "Centrale", "Libero"],
    formations: ["5-1", "6-2"],
    defaultRules: [
      { code: "V001", desc: "Ace", value: 2 },
      { code: "V002", desc: "Muro", value: 1.5 }
    ]
  },
  basket: {
    name: "Basket",
    icon: "🏀",
    roles: ["Playmaker", "Guardia", "Ala", "Ala Pivot", "Centro"],
    formations: ["2-3", "1-2-2"],
    defaultRules: [
      { code: "B001", desc: "Punto segnato", value: 0.5 },
      { code: "B002", desc: "Tripla", value: 1 }
    ]
  }
};
```

**Files nuovi**:
- `resources/sport-config.js`

**Files da modificare**:
- `admin-leghe.html` (sport selector)
- `matchday.html` (dynamic fields)
- `admin-rules.html` (sport-specific rules)

**Tempo stimato**: 4-5 ore

---

### FASE 4: User Experience (Priorità MEDIA)

**Obiettivo**: Migliorare UX per multi-lega

**Tasks**:
1. ⬜ League switcher in navbar (dropdown)
2. ⬜ League badge persistente in tutte le pagine
3. ⬜ Dashboard lega con stats overview
4. ⬜ "Le Mie Leghe" page per utenti
5. ⬜ Notifiche inviti lega
6. ⬜ Search leghe pubbliche (opzionale)

**Mockup League Switcher**:
```
[Navbar]  [⚽ Serie A 2025 ▼]  [Profilo]  [Esci]
          |
          └─ Dropdown:
             • ⚽ Serie A 2025 (attiva)
             • 🏐 Volley Cup
             • 🏀 NBA Fantasy
             • + Crea Nuova Lega
```

**Files nuovi**:
- `mie-leghe.html`
- `dashboard-lega.html`

**Files da modificare**:
- `resources/navbar.js` (league switcher)
- All pages (league badge)

**Tempo stimato**: 3-4 ore

---

### FASE 5: Inviti e Membri (Priorità MEDIA)

**Obiettivo**: Sistema completo gestione membri

**Tasks**:
1. ⬜ Genera invite link univoco
2. ⬜ Join lega via invite code
3. ⬜ Richieste accesso (se lega privata)
4. ⬜ Kick membri
5. ⬜ Promote/Demote admin
6. ⬜ Limite max membri per lega

**Invite Flow**:
```
Admin crea lega → Genera code ABC123
                ↓
Admin condivide link: fanta-athletic.web.app/join?code=ABC123
                ↓
Utente apre link → Conferma join → Aggiunto a lega
```

**Files nuovi**:
- `join.html` (landing page invite)

**Files da modificare**:
- `admin-leghe.html` (invite management)

**Tempo stimato**: 2-3 ore

---

### FASE 6: Advanced Features (Priorità BASSA)

**Obiettivo**: Features avanzate

**Tasks**:
1. ⬜ Archivio leghe passate
2. ⬜ Clona lega per nuova stagione
3. ⬜ Export/Import leghe (JSON)
4. ⬜ Template leghe predefiniti
5. ⬜ Statistiche globali cross-lega
6. ⬜ Achievements per utenti
7. ⬜ Leaderboard globale

**Tempo stimato**: 4-5 ore

---

## 🔧 IMPLEMENTAZIONE DETTAGLIATA

### Step 1: Extend admin-leghe.html

Aggiungo campi mancanti:

```javascript
// In createLeague()
const docRef = await db.collection('leagues').add({
  name: name,
  sport: document.getElementById('sportSelect').value, // NEW
  season: document.getElementById('seasonInput').value, // NEW
  status: 'active',
  createdBy: currentUser.uid,
  createdAt: firebase.firestore.Timestamp.now(),
  admins: [currentUser.uid],
  members: [currentUser.uid],
  inviteCode: generateInviteCode(), // NEW
  settings: {
    maxTeams: parseInt(document.getElementById('maxTeams').value) || 10,
    budgetPerTeam: parseInt(document.getElementById('budget').value) || 500,
    enableTransfers: true,
    scoringSystem: 'default'
  },
  stats: {
    teamCount: 0,
    playerCount: 0,
    activeMembers: 1
  }
});

function generateInviteCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
```

---

### Step 2: League Context in Matchday

```javascript
// In matchday.html
import { LeagueContext } from './resources/league-context.js';

async function loadDay() {
  const leagueId = LeagueContext.getCurrentLeagueId();
  if (!leagueId) {
    LeagueContext.ensureLeagueSelected();
    return;
  }
  
  const path = `leagues/${leagueId}/matchdays`;
  const doc = await db.collection(path).doc(state.giornata).get();
  // ... rest
}
```

---

### Step 3: Sport Config

```javascript
// resources/sport-config.js
export function getSportConfig(sport) {
  const configs = {
    calcio: {
      roles: ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
      formations: ["4-4-2", "4-3-3"],
      statFields: ["gol", "assist", "clean_sheet"]
    },
    volley: {
      roles: ["Palleggiatore", "Opposto", "Schiacciatore"],
      formations: ["5-1", "6-2"],
      statFields: ["punti", "ace", "muri"]
    },
    basket: {
      roles: ["Playmaker", "Guardia", "Ala"],
      formations: ["2-3"],
      statFields: ["punti", "rimbalzi", "assist"]
    }
  };
  return configs[sport] || configs.calcio;
}
```

---

## 📅 TIMELINE COMPLETA

| Fase | Descrizione | Ore | Priorità |
|------|-------------|-----|----------|
| 1 | Core League System | 3-4h | 🔴 ALTA |
| 2 | Context Integration | 5-6h | 🔴 ALTA |
| 3 | Multi-Sport | 4-5h | 🟡 MEDIA |
| 4 | UX Improvements | 3-4h | 🟡 MEDIA |
| 5 | Inviti/Membri | 2-3h | 🟡 MEDIA |
| 6 | Advanced | 4-5h | 🟢 BASSA |
| **TOTALE** | | **22-27h** | |

**Approccio consigliato**: Sprint da 2-3 ore, 1-2 fasi alla volta.

---

## 🧪 TESTING PLAN

### Per ogni fase:

1. **Unit Tests** (manuale):
   - Crea lega → Verifica Firestore
   - Join lega → Verifica membri
   - Switch lega → Verifica context

2. **Integration Tests**:
   - Matchday in lega A ≠ lega B
   - Regole lega calcio ≠ volley
   - Multi-admin permissions

3. **UX Tests**:
   - Mobile responsive
   - Loading states
   - Error handling

---

## 🔒 SECURITY RULES

Firestore Rules da aggiornare:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Leagues readable by members, writable by admins
    match /leagues/{leagueId} {
      allow read: if request.auth != null && 
                     request.auth.uid in resource.data.members;
      allow write: if request.auth != null && 
                      request.auth.uid in resource.data.admins;
      
      // Teams in league
      match /teams/{teamId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && 
                        (request.auth.uid == resource.data.owner ||
                         request.auth.uid in get(/databases/$(database)/documents/leagues/$(leagueId)).data.admins);
      }
      
      // Players in league
      match /players/{playerId} {
        allow read: if request.auth != null;
        allow write: if request.auth.uid in get(/databases/$(database)/documents/leagues/$(leagueId)).data.admins;
      }
    }
  }
}
```

---

## 💾 MIGRATION SCRIPT

Script per migrare dati esistenti:

```javascript
// migrate-to-leagues.js
async function migrateToLeagues() {
  const defaultLeagueId = 'default_league';
  
  // 1. Crea lega default
  await db.collection('leagues').doc(defaultLeagueId).set({
    name: "Lega Principale",
    sport: "calcio",
    season: "2024/2025",
    status: "active",
    createdAt: firebase.firestore.Timestamp.now(),
    // ... rest
  });
  
  // 2. Migra teams
  const teams = await db.collection('teams').get();
  for (const doc of teams.docs) {
    await db.collection(`leagues/${defaultLeagueId}/teams`).doc(doc.id).set(doc.data());
  }
  
  // 3. Migra players
  const players = await db.collection('players').get();
  for (const doc of players.docs) {
    await db.collection(`leagues/${defaultLeagueId}/players`).doc(doc.id).set(doc.data());
  }
  
  // 4. Migra rules
  const rules = await db.collection('rules').get();
  for (const doc of rules.docs) {
    await db.collection(`leagues/${defaultLeagueId}/rules`).doc(doc.id).set(doc.data());
  }
  
  console.log('Migration complete!');
}
```

---

## 📝 CHECKLIST IMPLEMENTAZIONE

### Fase 1 (Core League)
- [ ] Sport selector in admin-leghe.html
- [ ] Season field
- [ ] Invite code generator
- [ ] Invite code uniqueness check
- [ ] Copy invite link button
- [ ] Member list display
- [ ] Kick member function
- [ ] Promote admin function

### Fase 2 (Integration)
- [ ] LeagueContext in matchday.html
- [ ] LeagueContext in squadre.html
- [ ] LeagueContext in classifiche.html
- [ ] Migration script tested
- [ ] Backward compatibility verified
- [ ] League badge in headers

### Fase 3 (Multi-Sport)
- [ ] sport-config.js created
- [ ] Dynamic roles based on sport
- [ ] Dynamic formations
- [ ] Sport-specific stats fields
- [ ] Default rules per sport

---

## 🎯 SUCCESS METRICS

### KPI da monitorare:

1. **Adoption**:
   - Numero leghe create (target: >5 in prima settimana)
   - Utenti per lega (target: avg 6-8)
   - Leghe multi-sport (target: >20% non-calcio)

2. **Engagement**:
   - Active leghe (target: >80%)
   - Matchday updates per lega (target: >1/settimana)
   - Member retention (target: >70% dopo 1 mese)

3. **Technical**:
   - Page load time < 3s
   - Zero breaking changes
   - Firestore read efficiency

---

## 💡 FUTURE ENHANCEMENTS

### Dopo completamento 6 fasi:

1. **Social Features**:
   - Chat privata per lega
   - Bacheca lega (separata da globale)
   - Reactions a matchday updates

2. **Gamification**:
   - Achievements per lega
   - Hall of Fame per stagione
   - Rivalità tra utenti

3. **Advanced Analytics**:
   - Player trends
   - Team performance graphs
   - Predictive scoring (ML)

4. **Mobile App**:
   - PWA con offline support
   - Push notifications
   - Quick matchday entry

---

**Creato da**: Cascade AI  
**Per**: Nicol - Fanta Athletic  
**Versione**: 1.0  
**Data**: 19 Ottobre 2025  
**Status**: 📋 PLAN READY - Pronto per implementazione
