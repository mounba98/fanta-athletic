# 🏗️ Architettura Sistema Completo - Fanta Athletic

**Data:** Novembre 2024

---

## 🎯 VISIONE FUNZIONALE

### 1. **Utente Nuovo**
- Si iscrive
- **Sceglie:** Creare nuova lega OPPURE entrare in lega esistente
- Se entra in lega → vede solo dati di quella lega

### 2. **Isolamento Lega**
Ogni lega ha i suoi dati:
- ✅ **Squadre** (con roster, formazioni, allenatori)
- ✅ **Classifica** (calcolata dai risultati della lega)
- ✅ **Bacheca** (post solo della lega)
- ✅ **Risultati** (giornate della lega)
- ✅ **Regole lega** (bonus/malus specifici della lega)
- ✅ **Giorni** (giornate della lega)
- ✅ **Deadlines** (scadenze della lega)

### 3. **Store Globale**
- Unica pagina globale (non legata a leghe)
- Accessibile a tutti

### 4. **Admin Lega**
- Vede solo i dati della sua lega
- Non vede tab come "Setup Database", "Firestore Rules"
- Vede solo: gestione giocatori, gestione bonus/malus, calcolo giornate
- In calcolo: vede solo giocatori della sua lega
- Può mettere voti (se abilitato nelle impostazioni lega)

### 5. **Sistema Giocatori Condivisi** ⭐ **NOVITÀ**

**Concetto:** I giocatori sono **globali** ma organizzati per:
- **Squadra Reale** (es. "Athletic 2018", "Pinco Pallino Team", "Sesto Calcio")
- **Campionato** (es. "Serie A", "Serie B", "Prima Categoria")
- **Regione** (es. "Toscana", "Lombardia")

**Flusso:**
1. **Fanta Athletic** aggiunge 31 giocatori → salvati come "Athletic 2018" / "Serie A" / "Toscana"
2. **Sesto Calcio** crea nuova lega → può selezionare "Athletic 2018" e usare i 31 giocatori
3. **Pinco Pallino** crea nuova lega → aggiunge "Pinco Pallino Team" con 23 giocatori → salvati come "Pinco Pallino Team" / "Prima Categoria" / "Lombardia"
4. **Nuova Lega** → può selezionare "Athletic 2018" OPPURE "Pinco Pallino Team" OPPURE entrambi
5. **Sistema collaborativo:** ogni utente può aggiungere nuovi roster, tutti gli altri possono usarli

---

## 📊 STRUTTURA FIRESTORE PROPOSTA

### **Livello 1: Globali (Condivisi)**

```
teams_real/                    ← Squadre reali (Athletic 2018, Pinco Pallino Team, etc.)
  {teamId}/
    - name: "Athletic 2018"
    - championship: "Serie A"
    - region: "Toscana"
    - players: ["P001", "P002", ...]  ← Riferimenti a players_global
    - createdBy: userId
    - createdAt: timestamp

players_global/               ← Giocatori globali (P001, P002, etc.)
  {playerId}/
    - player_id: "P001"
    - nome: "Mario"
    - cognome: "Rossi"
    - ruolo: "Difensore"
    - team_real: "Athletic 2018"  ← Riferimento a teams_real
    - championship: "Serie A"
    - region: "Toscana"
    - createdBy: userId
    - createdAt: timestamp

coaches_global/               ← Allenatori globali
  {coachId}/
    - coach_id: "C001"
    - nome: "Tommy"
    - team_real: "Athletic 2018"
    - createdBy: userId

championships/                ← Campionati disponibili
  {championshipId}/
    - name: "Serie A"
    - region: "Toscana"
    - teams: ["Athletic 2018", ...]  ← Riferimenti a teams_real

store_products/               ← Store globale (già esistente)
  {productId}/
    - ...
```

### **Livello 2: Leghe (Isolati)**

```
leagues/{leagueId}/
  ├── (campi documento)
  │   ├── name: "Fanta Athletic"
  │   ├── settings: {
  │   │     usePlayerRatings: true/false,  ← ⭐ NOVITÀ: abilita voti giocatori
  │   │     ...
  │   │   }
  │   └── ...
  │
  ├── teams/                  ← Squadre della lega (con roster, formazioni)
  │   {teamId}/
  │     - name: "Mocci e Canni"
  │     - ownerId: userId
  │     - roster: ["P001", "P002", ...]  ← Riferimenti a players_global
  │     - lineup: [...]
  │     - coach_ids: ["C001", ...]
  │     - team_real: "Athletic 2018"  ← ⭐ NOVITÀ: quale squadra reale usa
  │
  ├── results/                ← Risultati giornate della lega
  │   {giornata}/
  │     - ...
  │     └── teams/
  │         {teamId}/
  │           - points: 24.5
  │           - ...
  │
  ├── days/                   ← Giornate della lega
  │   {giornata}/
  │     - data: "2025-10-13"
  │     - ...
  │
  ├── posts/                  ← ⭐ NOVITÀ: Bacheca della lega
  │   {postId}/
  │     - author: userId
  │     - content: "..."
  │     - leagueId: leagueId
  │     - createdAt: timestamp
  │
  ├── rules/                  ← Regole lega (bonus/malus specifici)
  │   {ruleId}/
  │     - rule_id: "R001"
  │     - valore: 10
  │     - leagueId: leagueId
  │
  ├── deadlines/               ← Scadenze lega
  │
  └── matchday_temp/          ← Bozze calcolo giornate
```

---

## 🔄 FLUSSO UTENTE

### **Scenario 1: Nuovo Utente Crea Lega**

1. Utente crea lega "Sesto Calcio"
2. **Sceglie squadra reale:**
   - Opzione A: Usa "Athletic 2018" (già esistente)
   - Opzione B: Crea nuova squadra "Sesto Calcio Team"
3. Se Opzione A:
   - Lega usa i 31 giocatori di "Athletic 2018"
   - Non può modificarli (sono globali)
4. Se Opzione B:
   - Utente aggiunge 30 giocatori → salvati in `players_global` con `team_real: "Sesto Calcio Team"`
   - Questi giocatori diventano disponibili per altre leghe

### **Scenario 2: Nuovo Utente Entra in Lega**

1. Utente entra in "Fanta Athletic"
2. Vede solo:
   - Squadre di Fanta Athletic
   - Classifica di Fanta Athletic
   - Bacheca di Fanta Athletic
   - Giocatori di "Athletic 2018" (perché la lega usa quella squadra)

### **Scenario 3: Admin Lega Gestisce Calcolo**

1. Admin "Pinco Pallino" va su `matchday.html`
2. Vede solo:
   - Giocatori della squadra reale usata dalla sua lega
   - Non vede giocatori di altre leghe/squadre
3. Può mettere voti (se `settings.usePlayerRatings: true`)
4. Può mettere bonus/malus specifici della sua lega

---

## 📋 STRUTTURA DATI DETTAGLIATA

### **teams_real (Globali)**

```javascript
{
  id: "athletic-2018",
  name: "Athletic 2018",
  championship: "Serie A",
  region: "Toscana",
  players: ["P001", "P002", ..., "P031"],  // Riferimenti a players_global
  createdBy: "userId",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### **players_global (Globali)**

```javascript
{
  player_id: "P001",
  nome: "Mario",
  cognome: "Rossi",
  ruolo: "Difensore",
  team_real: "athletic-2018",  // Riferimento a teams_real
  championship: "Serie A",
  region: "Toscana",
  photo_url: "...",
  createdBy: "userId",
  createdAt: timestamp
}
```

### **leagues/{leagueId}/teams (Lega-specifico)**

```javascript
{
  name: "Mocci e Canni",
  ownerId: "userId",
  team_real: "athletic-2018",  // ⭐ Quale squadra reale usa
  roster: ["P001", "P002", ...],  // Riferimenti a players_global
  lineup: ["P001", "P002", null, null, null],
  captain: "P001",
  coach_ids: ["C001"],
  leagueId: "4rq1Rr0TquRfuPLmqQTn"
}
```

### **leagues/{leagueId} (Documento Lega)**

```javascript
{
  name: "Fanta Athletic",
  settings: {
    usePlayerRatings: false,  // ⭐ Abilita voti giocatori
    team_real: "athletic-2018",  // ⭐ Quale squadra reale usa la lega
    // ... altri settings
  },
  admins: [...],
  members: [...],
  stats: {...}
}
```

---

## 🔧 MODIFICHE NECESSARIE

### 1. **Migrazione Struttura Attuale**

**Problema:** Attualmente i giocatori sono in `leagues/{leagueId}/players`

**Soluzione:**
1. Spostare tutti i giocatori in `players_global`
2. Creare `teams_real/athletic-2018` con i 31 giocatori
3. Aggiornare `leagues/{leagueId}` per riferirsi a `team_real: "athletic-2018"`
4. Le squadre della lega (`leagues/{leagueId}/teams`) usano `roster` con riferimenti a `players_global`

### 2. **Nuova Funzionalità: Selezione Squadra Reale**

Quando si crea una lega:
- Dropdown: "Seleziona squadra reale"
  - Opzioni: "Athletic 2018", "Pinco Pallino Team", "Sesto Calcio Team", ...
  - Opzione: "Crea nuova squadra"
- Se crea nuova squadra → form per: nome, campionato, regione

### 3. **Bacheca Lega**

**Attualmente:** `posts/` è globale?

**Da fare:**
- Spostare `posts/` in `leagues/{leagueId}/posts/`
- Filtrare per `leagueId` nella query

### 4. **Rules Lega**

**Attualmente:** `rules/` è globale o lega-specifico?

**Da fare:**
- Verificare se già in `leagues/{leagueId}/rules/`
- Se globale → migrare per lega

### 5. **Admin Panel**

**Tab Admin:**
- **SuperAdmin:** Setup Database, Firestore Rules, Store, Tutte le leghe
- **Admin Lega:** Gestione Giocatori, Gestione Bonus/Malus, Calcolo, Risultati
- **Admin Store:** Solo Store

### 6. **Voti Giocatori (Opzionale)**

**Settings lega:**
```javascript
settings: {
  usePlayerRatings: true/false,  // Default: false
  // Se true → admin può mettere voti in calcolo giornate
}
```

**UI Calcolo:**
- Se `usePlayerRatings: true` → mostra campo "Voto" per ogni giocatore
- Se `false` → nasconde campo voto

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### Fase 1: Migrazione Giocatori Globali
- [ ] Creare `players_global/` collection
- [ ] Spostare giocatori da `leagues/{leagueId}/players` a `players_global/`
- [ ] Creare `teams_real/athletic-2018`
- [ ] Aggiornare riferimenti `roster` nelle squadre

### Fase 2: Struttura Leghe
- [ ] Verificare `leagues/{leagueId}/posts/` esiste
- [ ] Verificare `leagues/{leagueId}/rules/` esiste
- [ ] Verificare `leagues/{leagueId}/results/` esiste
- [ ] Verificare `leagues/{leagueId}/days/` esiste

### Fase 3: UI Creazione Lega
- [ ] Dropdown selezione squadra reale
- [ ] Form creazione nuova squadra reale
- [ ] Settings lega: `usePlayerRatings`

### Fase 4: Admin Panel
- [ ] Distinzione SuperAdmin / Admin Lega / Admin Store
- [ ] Nascondere tab non permessi
- [ ] Filtrare dati per lega

### Fase 5: Voti Giocatori
- [ ] Campo `usePlayerRatings` in settings lega
- [ ] UI calcolo: mostra/nascondi campo voto
- [ ] Salvataggio voti in `leagues/{leagueId}/days/{giornata}/players/{playerId}/rating`

---

## 🎯 RISULTATO FINALE

**Sistema completamente multi-tenant:**
- ✅ Ogni lega isolata
- ✅ Giocatori globali condivisi
- ✅ Squadre reali riutilizzabili
- ✅ Collaborazione tra utenti
- ✅ Store globale
- ✅ Admin per ruolo

