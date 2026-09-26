# 📊 Struttura Firestore Post-Migrazione - Verifica Corretta

**Data:** Novembre 2024  
**Lega ID:** `4rq1Rr0TquRfuPLmqQTn` (Fanta Athletic)

---

## ✅ STRUTTURA CORRETTA DOPO MIGRAZIONE

### 1. **Collezioni Top-Level (Legacy - Dovrebbero Esserci Ancora)**

Dopo la migrazione, le collezioni legacy **rimangono** (non vengono eliminate automaticamente):

```
teams/          ← Legacy (dati originali)
players/        ← Legacy (dati originali)
coaches/        ← Legacy (dati originali)
days/           ← Legacy (dati originali)
results/        ← Legacy (dati originali)
deadlines/      ← Legacy (dati originali)
rules/          ← Legacy (dati originali)
matchday_temp/  ← Legacy (dati originali)
```

**Questo è normale!** Sono i dati originali che servono come backup.

---

### 2. **Struttura Multilega (Nuova - Dati Migrati)**

I dati migrati dovrebbero essere sotto la collezione `leagues`:

```
leagues/
  └── 4rq1Rr0TquRfuPLmqQTn/          ← Documento lega "Fanta Athletic"
      ├── (campi documento)
      │   ├── name: "Fanta Athletic"
      │   ├── admins: [...]
      │   ├── members: [...]
      │   ├── settings: {...}
      │   └── stats: {...}
      │
      ├── teams/                      ← ✅ Subcollezione (18 squadre)
      │   ├── 0
      │   ├── 1
      │   ├── ...
      │   └── 17
      │
      ├── players/                    ← ✅ Subcollezione (31 giocatori)
      │   ├── P001
      │   ├── P002
      │   ├── ...
      │   └── P030
      │
      ├── coaches/                   ← ✅ Subcollezione (se presenti)
      │
      ├── days/                       ← ✅ Subcollezione (G1, G2, G3, etc.)
      │   ├── G1
      │   ├── G2
      │   └── G3
      │
      ├── results/                   ← ✅ Subcollezione (giornate)
      │   ├── G1
      │   │   └── teams/              ← Subcollezione risultati squadre
      │   │       ├── 0
      │   │       ├── 1
      │   │       └── ...
      │   ├── G2
      │   └── G3
      │
      ├── deadlines/                 ← ✅ Subcollezione
      │
      ├── rules/                     ← ✅ Subcollezione (se presenti)
      │
      └── matchday_temp/            ← ✅ Subcollezione (se presenti)
```

### 3. **Estensione Multi-Sport (Nuova)**

Per supportare campionati diversi (calcio, volley, basket, F1, Sanremo, reality, …) ogni documento lega deve includere:

- `sportType`: stringa (`football`, `volleyball`, `basketball`, `f1`, `sanremo`, `reality_tv`, ...).
- `competitionId`: riferimento logico alla competition/catalog (es. `serie-a-2025`, `nba-2025`, `f1-2026`).
- `settings.scoringProfileId`: eventuale override del profilo punteggi rispetto allo sport di default.

Schema proposto per le competition condivise:

```
competitions/
  └── serie-a-2025
      ├── sportType: "football"
      ├── season: "2024/2025"
      ├── metadata: {...}
      └── participants/ (giocatori/concorrenti reali)

  └── nba-2025
      ├── sportType: "basketball"
      └── participants/...
```

Ogni lega punta a una competition (anche condivisa) e salva localmente solo i dati fantasy (teams, risultati, notifiche, ecc.). I ruoli/formazioni/punteggi base sono guidati da `SPORT_CONFIG` (`public/resources/sport-config.js`).

---

## 🔍 COME VERIFICARE IN FIRESTORE CONSOLE

### Passo 1: Verifica Documento Lega

1. Vai su: `https://console.firebase.google.com/project/fanta-athletic/firestore`
2. Clicca su `leagues` (collezione top-level)
3. Clicca su `4rq1Rr0TquRfuPLmqQTn`
4. **Verifica campi:**
   - ✅ `name`: "Fanta Athletic"
   - ✅ `admins`: array con 3 admin IDs
   - ✅ `members`: array con user IDs
   - ✅ `settings`: oggetto con configurazioni
   - ✅ `stats`: oggetto con statistiche
   - ❌ **NON** dovresti vedere `days`, `results` come campi (sono subcollezioni!)

### Passo 2: Verifica Subcollezioni

Nel documento lega `4rq1Rr0TquRfuPLmqQTn`, vedi:

**Sezione "Raccolte" (collezione simbolo):**
- ✅ `deadlines`
- ✅ `players`
- ✅ `teams`
- ✅ `days` (se migrati)
- ✅ `results` (se migrati)
- ✅ `coaches` (se migrati)
- ✅ `rules` (se migrati)
- ✅ `matchday_temp` (se migrati)

**Se NON vedi `days` o `results`:**
- Potrebbero non essere stati migrati (se erano vuoti o non esistevano)
- Oppure la migrazione non li ha copiati (controlla log migrazione)

---

## ⚠️ PROBLEMA IDENTIFICATO: Roster con Codici Lunghi

### Problema

Nel campo `roster` di una squadra, vedi:
```json
"roster": [
  "P002",
  "P005",
  "c4fyWntWj1mTj4fekijo",  ← ❌ ERRORE: dovrebbe essere "P0XX"
  "P017"
]
```

### Causa

Il campo `roster` dovrebbe contenere **`player_id`** (es. "P001", "P002"), non document IDs lunghi.

### Verifica

1. Apri `leagues/4rq1Rr0TquRfuPLmqQTn/teams/{teamId}`
2. Controlla il campo `roster`
3. Se contiene codici lunghi → **bug da fixare**

### Fix Necessario

Lo script di migrazione ha copiato i dati così come erano. Se nei dati legacy c'erano già document IDs invece di player_id, ora sono in multilega.

**Soluzione:** Script di correzione che:
1. Legge tutti i `roster` delle squadre
2. Per ogni codice lungo, trova il giocatore corrispondente
3. Sostituisce con il `player_id` corretto (P001, P002, etc.)

---

## ✅ CHECKLIST VERIFICA STRUTTURA

### Collezioni Top-Level (Legacy)
- [ ] `teams/` esiste (legacy, ok)
- [ ] `players/` esiste (legacy, ok)
- [ ] `days/` esiste (legacy, ok)
- [ ] `results/` esiste (legacy, ok)

### Documento Lega
- [ ] `leagues/4rq1Rr0TquRfuPLmqQTn` esiste
- [ ] Campi: `name`, `admins`, `members`, `settings`, `stats` ✅
- [ ] **NON** ha `days` o `results` come campi ✅

### Subcollezioni Lega
- [ ] `leagues/4rq1Rr0TquRfuPLmqQTn/teams` → 18 documenti
- [ ] `leagues/4rq1Rr0TquRfuPLmqQTn/players` → 31 documenti (P001-P030)
- [ ] `leagues/4rq1Rr0TquRfuPLmqQTn/days` → documenti (G1, G2, G3, etc.)
- [ ] `leagues/4rq1Rr0TquRfuPLmqQTn/results` → documenti (G1, G2, etc.)
- [ ] `leagues/4rq1Rr0TquRfuPLmqQTn/deadlines` → documenti

### Verifica Dati
- [ ] Ogni documento migrato ha campo `leagueId: "4rq1Rr0TquRfuPLmqQTn"`
- [ ] Ogni documento migrato ha campo `migratedAt: timestamp`
- [ ] Campo `roster` contiene `player_id` (P0XX), non document IDs ✅ (da verificare!)

---

## 🎯 COSA DEVI VEDERE IN FIRESTORE CONSOLE

### Vista Corretta del Documento Lega:

```
leagues > 4rq1Rr0TquRfuPLmqQTn
├── Campi:
│   ├── name: "Fanta Athletic"
│   ├── admins: [...]
│   ├── members: [...]
│   ├── settings: {...}
│   └── stats: {...}
│
└── Raccolte (collezione simbolo):
    ├── deadlines
    ├── players
    ├── teams
    ├── days          ← Se migrati
    ├── results       ← Se migrati
    ├── coaches       ← Se migrati
    └── rules         ← Se migrati
```

---

## 🚨 COSA È SBAGLIATO

### ❌ Se vedi:
- `days` come campo (non come raccolta)
- `results` come campo (non come raccolta)
- Nessuna subcollezione `days` o `results`
- Roster con codici lunghi invece di P0XX

### ✅ Se vedi:
- `days` e `results` come **raccolte** (non campi) ✅
- Subcollezioni sotto `leagues/{leagueId}/` ✅
- Dati legacy ancora presenti (backup) ✅
- Roster con P001, P002, etc. ✅

---

## 📝 PROSSIMI PASSI

1. ✅ **Verifica struttura** (questo documento)
2. ⏳ **Fix problema roster** (se necessario)
3. ⏳ **Test multilega** (creare nuova lega e verificare isolamento)
4. ⏳ **Verifica funzionalità** (tutto funziona come prima?)

---

## ❓ DOMANDE FREQUENTI

**Q: Perché vedo ancora `days` e `results` come collezioni top-level?**  
A: Perché sono i dati legacy (backup). Dopo la migrazione, esistono ENTRAMBI: legacy top-level e multilega sotto `leagues/{leagueId}/`.

**Q: Quando elimino i dati legacy?**  
A: Solo dopo aver verificato che tutto funziona correttamente con la struttura multilega. Mantienili come backup per ora.

**Q: Il proxy multilega usa i dati legacy o quelli migrati?**  
A: Usa quelli migrati (`leagues/{leagueId}/...`). I dati legacy restano solo come backup.

**Q: Se non vedo `days` o `results` come subcollezioni, significa che la migrazione è fallita?**  
A: Non necessariamente. Potrebbero non essere stati migrati se erano vuoti o non esistevano nei dati legacy. Controlla i log della migrazione.

