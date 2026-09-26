# 🏗️ Architettura Sistema V2 - Catalogo Globale + Snapshot Lega

**Data:** Novembre 2024  
**Fonte:** Specifica ChatGPT + Requisiti Utente

---

## 🎯 CONCETTI CHIAVE

### 1. **Catalogo Globale (Read-Only)**
- Contiene anagrafiche riutilizzabili: club, roster, giocatori, allenatori
- Con **versioning** e **visibilità** (public/private/unlisted)
- Read-only per gli altri, solo admin di lega può creare/aggiornare

### 2. **Snapshot di Lega (Materializzato)**
- Quando una lega sceglie uno o più roster globali
- Crea un `player_pool` della lega (copie "freezate")
- Se il catalogo cambia dopo, la lega non si rompe
- Immutabile dopo l'avvio dell'asta

---

## 📊 STRUTTURA FIRESTORE V2

### **Livello 1: Catalogo Globale (Riutilizzabile)**

```
clubs/                          ← Club reali (ex teams_real)
  {clubId}/
    - clubId: "athletic-2018"
    - name: "Athletic 2018"
    - championship: "Serie A"
    - region: "Toscana"
    - season: "2024/2025"
    - createdBy: userId
    - status: "draft" | "published" | "archived"
    - createdAt: timestamp
    - updatedAt: timestamp

rosters/                        ← Roster (insieme giocatori di un club per stagione)
  {rosterId}/
    - rosterId: "athletic-2018-2024-25-v1"
    - clubRef: "athletic-2018"
    - season: "2024/2025"
    - version: "1.0.0"
    - visibility: "public" | "private" | "unlisted"
    - maintainers: [userId, ...]  ← Chi può aggiornare
    - status: "draft" | "published" | "archived"
    - createdBy: userId
    - createdAt: timestamp
    - updatedAt: timestamp
    └── roster_members/         ← ⭐ Subcollection (non array!)
        {memberId}/
          - playerRef: "P001"  ← Riferimento a players_global
          - shirtNumber: 10
          - role: "Difensore"
          - notes: "..."
          - addedBy: userId
          - addedAt: timestamp

players_global/                 ← Anagrafiche uniche cross-roster
  {playerId}/
    - playerId: "P001"
    - firstName: "Mario"
    - lastName: "Rossi"
    - birthDate: "1990-01-15" (opzionale)
    - role: "Difensore"
    - defaultClubRef: "athletic-2018"
    - photoUrl: "..."
    - canonicalKeys: ["mario-rossi-1990", ...]  ← ⭐ Per dedup
    - createdBy: userId
    - createdAt: timestamp

coaches_global/                 ← Allenatori globali
  {coachId}/
    - coachId: "C001"
    - firstName: "Tommy"
    - lastName: "..."
    - clubRef: "athletic-2018"
    - photoUrl: "..."
    - createdBy: userId

taxonomies/                     ← Lookup puliti (no typo)
  championships/
    {id}/
      - name: "Serie A"
      - code: "SERIE_A"
  regions/
    {id}/
      - name: "Toscana"
      - code: "TOSCANA"
  seasons/
    {id}/
      - name: "2024/2025"
      - startYear: 2024
      - endYear: 2025
```

### **Livello 2: Leghe (Isolati)**

```
leagues/{leagueId}/
  ├── (campi documento)
  │   ├── name: "Fanta Athletic"
  │   ├── settings: {
  │   │     selectedRosters: [  ← ⭐ Quali roster usa la lega
  │   │       {
  │   │         rosterRef: "athletic-2018-2024-25-v1",
  │   │         version: "1.0.0",
  │   │         mode: "merge" | "single"  ← Seleziona più roster
  │   │       },
  │   │       {
  │   │         rosterRef: "sesto-calcio-2024-25-v1",
  │   │         version: "1.0.0",
  │   │         mode: "merge"
  │   │       }
  │   │     ],
  │   │     usePlayerRatings: true/false,
  │   │     auctionMode: true/false,
  │   │     scoringPreset: "...",
  │   │     playerPoolLocked: true/false  ← ⭐ Blocca dopo asta
  │   │   },
  │   ├── admins: [...],
  │   ├── members: [...],
  │   └── stats: {...}
  │
  ├── player_pool/              ← ⭐ Snapshot materializzato (freezato)
  │   {playerId}/
  │     - catalogPlayerRef: "P001"  ← Riferimento a players_global
  │     - catalogRosterRef: "athletic-2018-2024-25-v1"  ← Fonte
  │     - role: "Difensore"
  │     - displayName: "Mario Rossi"
  │     - clubName: "Athletic 2018"
  │     - season: "2024/2025"
  │     - tags: ["difensore", ...]
  │     - teamAssigned: false  ← Durante asta
  │     - source: ["athletic-2018-2024-25-v1", "sesto-calcio-2024-25-v1"]  ← Se merge
  │     - snapshotVersion: "1.0.0"  ← Versione al momento del freeze
  │     - lockedAt: timestamp  ← Quando è stato bloccato
  │
  ├── teams/                    ← Squadre della lega
  │   {teamId}/
  │     - name: "Mocci e Canni"
  │     - ownerId: userId
  │     - roster: ["P001", "P002", ...]  ← ⭐ Riferimenti a player_pool, non globali!
  │     - lineup: [...]
  │     - captain: "P001"
  │     - coach_ids: ["C001"]
  │
  ├── results/                  ← Risultati giornate
  │   {giornata}/
  │     └── teams/
  │         {teamId}/
  │           - points: 24.5
  │           - ...
  │
  ├── days/                     ← Giornate
  │   {giornata}/
  │     - data: "2025-10-13"
  │     - ...
  │
  ├── posts/                    ← Bacheca lega
  │   {postId}/
  │     - author: userId
  │     - content: "..."
  │     - leagueId: leagueId
  │
  ├── rules/                    ← Regole lega (bonus/malus)
  │   {ruleId}/
  │     - rule_id: "R001"
  │     - valore: 10
  │     - leagueId: leagueId
  │
  ├── deadlines/                 ← Scadenze
  │
  └── matchday_temp/            ← Bozze calcolo
```

---

## 🔁 FLUSSI FUNZIONALI

### **A) Crea Lega**

1. **Seleziona Rose Esistenti:**
   - Filtra per: regione, campionato, stagione, visibilità
   - Multi-selezione: "Athletic 2018" + "Sesto Calcio"

2. **(Opzionale) Aggiungi Altre Rose:**
   - Crea nuova roster privata di estensione
   - Oppure usa roster pubblica esistente

3. **Crea player_pool:**
   - Materializza i giocatori scelti nella lega
   - **Merge + dedup** (se due roster portano stesso giocatore, un solo doc)
   - Preserva `source: [rosterA, rosterB]` per tracciabilità

4. **Lock:**
   - Dopo start asta, blocca aggiornamenti del pool
   - Solo fix manuali da admin lega

### **B) Crea Nuova Rosa (Riutilizzabile)**

1. **Utente sceglie "Crea nuova rosa"**
2. **Compila:**
   - Club (o crea nuovo)
   - Campionato, regione, stagione
3. **Aggiunge giocatori:**
   - Manuale OPPURE import Excel
4. **Pubblica:**
   - `status: "published"`
   - `visibility: "public"` → visibile ad altre leghe
   - `visibility: "private"` → solo owner/maintainers
   - `visibility: "unlisted"` → accessibile con link/ID

5. **Versioning:**
   - Correzioni future generano nuova versione (1.0.1)
   - Leghe già avviate restano sulla loro snapshot (1.0.0)

### **C) Usa Esistente + Aggiungi I Tuoi**

1. Seleziona roster "Athletic 2018" (v1.0.0)
2. "Aggiungi giocatori locali" → crea roster di estensione
3. Estensione può essere privata o pubblica
4. Al build del player_pool, la lega include roster base + estensione

---

## 🧩 REGOLE DEDUP & VERSIONING

### **Chiave Univoca Giocatore**

```javascript
// Esempio chiave canonica
canonicalKey = hash(
  normalize(lastName) + 
  normalize(firstName) + 
  birthDate + 
  season + 
  clubId
)
```

### **Dedup al Merge**

Se due roster portano lo stesso giocatore:
- Un solo doc nel `player_pool`
- Preserva `source: [rosterA, rosterB]`
- Usa dati più completi (merge intelligente)

### **Immutabilità in Gara**

- Il `player_pool` è fotografia al momento del freeze
- Se qualcuno aggiorna il catalogo globale, la lega non cambia
- Solo admin lega può fare fix manuali (se `playerPoolLocked: false`)

### **Versioning**

- Ogni roster ha `version: "1.0.0"`
- In lega salvi la `version` usata
- Se esce v1.0.1, la lega può opt-in per "refresh controllato" (fuori stagione)

---

## 🛡️ GOVERNANCE & VISIBILITÀ

### **Visibility**

- **public:** riutilizzabile da chiunque
- **unlisted:** accessibile con link/ID
- **private:** solo owner e leghe autorizzate

### **Status**

- **draft:** in lavorazione
- **published:** pubblicato e utilizzabile
- **archived:** archiviato (non più utilizzabile)

### **Maintainers**

- Chi può pubblicare/aggiornare roster pubblici
- Solo admin di lega può essere maintainer

### **Moderation**

- Segnalazioni
- Lock anti-spam
- Rate limit sulla creazione

### **Ownership**

- Chi crea una rosa non diventa "proprietario" delle leghe che la usano
- Concede solo l'uso della versione pubblicata

### **Ruoli e Permessi**

| Ruolo          | Scope                           | Permessi principali |
|----------------|---------------------------------|---------------------|
| `superadmin`   | Globale                         | Gestione completa di catalogo, leghe, ruoli, store. Può aggiungere/rimuovere altri superadmin. |
| `league_admin` | Lega specifica + catalogo globale| Gestione completa della/e lega/e assegnate. Può creare/aggiornare roster nel catalogo (visibilità: di default privata/unlisted, pubblicazione soggetta a revisione superadmin). |
| `store_admin`  | Store globale                   | Gestione catalogo prodotti store. Nessun permesso su leghe o roster. |

> 📌 Gli admin globali attuali (superadmin) sono: Baba Ali + gli altri due admin Firestore storici.

### **Creazione roster da parte degli admin lega**

- Accesso ad un form dedicato per inserire una nuova squadra reale (club) con metadati canonici (campionato, regione, stagione).
- Possibilità di pubblicare roster per uso proprio o, previa approvazione/personalizzazione, renderli pubblici.
- I roster creati da admin lega ereditano lo stato `draft` fino a pubblicazione (manuale o automatica secondo policy).

---

## 📥 IMPORT EXCEL

### **Template CSV/XLSX**

```csv
firstName, lastName, role, clubName, championship, region, season, shirtNumber
Mario, Rossi, Difensore, Athletic 2018, Serie A, Toscana, 2024/2025, 10
```

### **Validazioni**

- `role` in lista valida
- `season` valida
- `club` matchabile o crea club nuovo

### **Report Import**

- Riepilogo
- Duplicati trovati
- Errori da correggere

### **Idempotenza**

- Stesso file non crea duplicati se la chiave canonica coincide

---

## 🔐 SICUREZZA

### **Global**

- Chiunque può leggere roster `published/public`
- Scrive solo owner/maintainers

### **Per Lega**

- Scrivono gli admin della lega nei path `leagues/{leagueId}/...`

### **No Cross-Lega**

- Tutte le write di gara restano in `leagues/{leagueId}`

### **Audit**

- Ogni doc "critico" ha `createdBy`, `updatedBy`, `updatedAt`

---

## ⚙️ INDICI & QUERY

### **rosters**

- Per `championship + region + season + visibility + status`

### **roster_members**

- Per `rosterId` e (opzionale) `role`

### **players_global**

- Per `canonicalKeys[]` (dedup)

### **player_pool (lega)**

- Per `role`
- Per `teamAssigned: false` (durante asta)
- Per `searchName`

---

## 🎨 Tema & Branding Lega

- Le pagine globali (landing, catalogo pubblico, store) mantengono variante **rossoblù** default.
- Ogni lega può definire in `leagues/{leagueId}/settings.theme`:
  - `primaryColor`, `secondaryColor`, `accentColor`
  - `logoUrl` (per navbar e favicon contestuale)
  - `backgroundVariant` (light/dark/custom)
- Il wizard di creazione lega includerà uno step opzionale "Branding" con preset (es. rossoblù, biancoverde) e campi custom.
- I temi vengono applicati lato client via CSS variables; fallback automatico se non definito.
- Monetizzazione futura: pacchetti premium con personalizzazioni avanzate (font, layout dashboard, domini custom).

---

## 🚦 MVP vs PRO

### **MVP (2 settimane)**

- ✅ Pubblica 1–2 roster (Athletic 2018, Sesto Calcio)
- ✅ Wizard creazione lega: Seleziona rose → Crea player_pool → Asta
- ✅ Excel import base
- ✅ Nessun "refresh" versioni (solo snapshot)

### **PRO (iterazione successiva)**

- ⏳ Versioning avanzato (opt-in refresh)
- ⏳ Estensioni/fork delle rose
- ⏳ Moderazione + segnalazioni
- ⏳ Catalogo pubblico con ricerca e filtri

---

## 🧪 CRITERI DI ACCETTAZIONE

- ✅ **Isolamento:** cambio lega → cambia l'intero dataset senza leak
- ✅ **Riutilizzo:** creo "Sesto Calcio" come roster public → nuova lega può usarlo
- ✅ **Asta:** player_pool contiene il merge deduplicato delle rose selezionate
- ✅ **Immutabilità:** dopo l'avvio dell'asta, aggiornare il roster globale non altera il pool della lega
- ✅ **Import:** stesso file Excel non duplica giocatori già importati (idempotente)
- ✅ **Permessi:** utente esterno non può modificare roster pubblicati altrui; può forkare o creare estensioni

---

## 🧭 ROADMAP PRATICA

### **Fase 1: Definizione Tassonomie**
- [ ] Elenco ufficiale di championships
- [ ] Elenco ufficiale di regions
- [ ] Elenco ufficiale di seasons

### **Fase 2: Modellazione Catalogo**
- [ ] `clubs/` collection
- [ ] `rosters/` collection con `roster_members/` subcollection
- [ ] `players_global/` con `canonicalKeys[]`
- [ ] `coaches_global/` collection

### **Fase 3: Pubblicazione Roster**
- [ ] Pubblica "Athletic 2018" (v1.0.0, public)
- [ ] Crea "Sesto Calcio" via import Excel → pubblica (v1.0.0)

### **Fase 4: Wizard Lega**
- [ ] Seleziona 1 o più roster
- [ ] Build player_pool (merge + dedup)
- [ ] Lock player_pool dopo asta

### **Fase 5: Test**
- [ ] Asta demo con 2 leghe diverse che usano mix diversi
- [ ] Test dedup & lock: aggiorna roster globale → verifica che leghe non cambiano

### **Fase 6: Documentazione**
- [ ] Regole di visibilità
- [ ] Versioning
- [ ] Moderazione

---

## 📋 DIFFERENZE CON V1

### **V1 (Precedente)**
- Giocatori direttamente in `leagues/{leagueId}/players/`
- Roster come array in `teams_real`
- Nessun versioning
- Nessun snapshot materializzato

### **V2 (Nuova)**
- ✅ Giocatori globali con chiavi canoniche
- ✅ Roster come subcollection `roster_members/`
- ✅ Versioning completo
- ✅ Snapshot materializzato `player_pool` per lega
- ✅ Immutabilità dopo asta
- ✅ Dedup automatico al merge

---

## 🎯 PROSSIMI PASSI IMMEDIATI

1. **Migrare dati esistenti** in struttura V2
2. **Implementare wizard creazione lega** con selezione roster
3. **Creare import Excel** per roster
4. **Implementare player_pool** con merge + dedup
5. **Test isolamento** tra leghe

