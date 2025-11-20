# 🎯 Roadmap Priorità v2025101905 - Piano Completo

**Data**: 19 Ottobre 2025, 22:50  
**Feedback da**: Nicol  
**Status**: 📋 PLANNING

---

## 🚀 PRIORITÀ IMMEDIATE (1-2 settimane)

### 1. **🔐 Login Obbligatorio + Auto-Riconoscimento Lega** [4-5h]
**Problema**: Utenti non loggati vedono contenuto  
**Soluzione**:
- Auth guard su tutte le pagine (tranne auth.html)
- Redirect automatico a login se non autenticato
- Al login: carica `localStorage.getItem('last_league_id')`
- Fallback: mostra onboarding "Crea o unisciti a competizione"

**Implementazione**:
```javascript
// resources/auth-guard.js (nuovo file)
firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    location.href = 'auth.html';
    return;
  }
  
  // Load last league
  const lastLeagueId = localStorage.getItem('last_league_id');
  if (lastLeagueId) {
    loadLeague(lastLeagueId);
  } else {
    showOnboarding(); // "Crea o unisciti"
  }
});
```

**Files da modificare**:
- Tutte le pagine HTML → `<script src="resources/auth-guard.js"></script>`
- Nuovo file: `resources/auth-guard.js`

---

### 2. **🔀 Selettore Lega in Navbar (Dropdown)** [3-4h]
**Ispirazione**: App leghe fantacalcio - striscia in alto con dropdown

**Design**:
```
┌─────────────────────────────────────────────────┐
│ [🏆 Serie A 2025 ▾]  Home | Matchday | ...     │
└─────────────────────────────────────────────────┘
         │
         ▼ Click
    ┌───────────────────────┐
    │ Serie A 2025       ✓  │
    │ Champions League      │
    │ Coppa Italia          │
    │────────────────────   │
    │ ➕ Crea Nuova         │
    │ 🔍 Unisciti (codice)  │
    └───────────────────────┘
```

**Posizione**:
- **Desktop**: Sinistra navbar, prima di "Home"
- **Mobile**: Top header, full-width

**Implementazione**:
```html
<!-- In navbar -->
<div class="league-selector">
  <button id="leagueSelectorBtn" class="league-selector-btn">
    <span class="league-icon">🏆</span>
    <span class="league-name">Serie A 2025</span>
    <span class="dropdown-arrow">▾</span>
  </button>
  
  <div id="leagueDropdown" class="league-dropdown hidden">
    <!-- Populated by JS -->
  </div>
</div>
```

**Funzionalità**:
- Mostra nome lega corrente
- Click → dropdown con tutte le leghe utente
- Checkmark su lega attiva
- "Crea Nuova" → redirect admin-leghe.html
- "Unisciti" → modal con input codice
- Switch lega → reload pagina con nuova lega

**Files**:
- `resources/navbar.js` → Aggiungi logica dropdown
- `resources/sheet.css` → Stili dropdown
- `resources/league-selector.js` (nuovo)

---

### 3. **📊 Sistema Voti Opzionale in Creazione Lega** [2-3h]
**Problema**: Non tutte le competizioni usano voti  
**Tua richiesta**: Nella creazione lega, scegli se usare voti o no

**UI in admin-leghe.html**:
```html
<!-- Nuovo toggle -->
<div>
  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; background:#e3f2fd; padding:12px; border-radius:8px;">
    <input type="checkbox" id="usePlayerRatings" checked style="width:18px; height:18px;" />
    <div>
      <strong>📊 Usa Voti Giocatori</strong>
      <div style="font-size:12px; color:var(--muted);">
        Abilita inserimento voti manuale per calcolo punteggi. 
        ⚠️ Richiede qualcuno che si segna i dati in partita.
      </div>
    </div>
  </label>
  
  <div id="ratingsWarning" style="margin-top:8px; padding:8px; background:#fff3cd; border-radius:6px; font-size:12px;">
    💡 <strong>Nota</strong>: Se disabiliti i voti, non potrai usare Modificatore Difesa/Attacco
  </div>
</div>
```

**Impatto**:
- Se `usePlayerRatings = false`:
  - Disabilita modificatore difesa UI
  - Matchday: solo bonus/malus (no voto base)
  - Calcolo: Solo regole (gol, assist, etc.)
  
- Se `usePlayerRatings = true`:
  - Abilita modificatore difesa/attacco
  - Matchday: voto + bonus/malus
  - Calcolo completo

**Firestore**:
```javascript
settings: {
  usePlayerRatings: true, // o false
  defenseModifier: {
    enabled: true,
    requiresRatings: true // auto-disabled se usePlayerRatings=false
  }
}
```

---

### 4. **⭐ Wildcard/Capitano Regola Modificabile** [3-4h]
**Tua richiesta**: Capitano x2, o wildcard personalizzabile

**Configurazione nella creazione lega**:
```html
<div>
  <label style="display:flex; align-items:center; gap:8px; cursor:pointer; background:#fff9e6; padding:12px; border-radius:8px;">
    <input type="checkbox" id="useWildcard" style="width:18px; height:18px;" />
    <div>
      <strong>⭐ Sistema Capitano/Wildcard</strong>
      <div style="font-size:12px; color:var(--muted);">
        Permetti di scegliere un giocatore con moltiplicatore punteggio
      </div>
    </div>
  </label>
  
  <div id="wildcardSettings" style="display:none; margin-top:12px; padding:16px; background:#fff; border:1px solid #ddd; border-radius:8px;">
    <div style="display:grid; gap:12px;">
      <div>
        <label style="font-weight:600; margin-bottom:6px; display:block; font-size:13px;">Moltiplicatore</label>
        <select id="wildcardMultiplier" class="input" style="width:120px;">
          <option value="1.5">1.5x</option>
          <option value="2" selected>2x (Capitano)</option>
          <option value="2.5">2.5x</option>
          <option value="3">3x</option>
        </select>
      </div>
      
      <div>
        <label style="font-weight:600; margin-bottom:6px; display:block; font-size:13px;">Utilizzi per Stagione</label>
        <input type="number" id="wildcardUsesPerSeason" class="input" value="0" min="0" max="38" style="width:100px;" />
        <p style="font-size:11px; color:var(--muted); margin-top:4px;">0 = illimitato (ogni giornata)</p>
      </div>
      
      <div>
        <label style="display:flex; align-items:center; gap:8px;">
          <input type="checkbox" id="wildcardPerMatchday" checked />
          <span style="font-size:13px;">Massimo 1 per giornata</span>
        </label>
      </div>
    </div>
  </div>
</div>
```

**Esempio Configurazioni**:
1. **Capitano Classico**: 2x, 0 utilizzi (illimitato), 1 per giornata
2. **Wildcard Limited**: 3x, 5 utilizzi stagione, 1 per giornata
3. **Superbonus**: 2.5x, 10 utilizzi stagione

**Firestore**:
```javascript
settings: {
  wildcard: {
    enabled: true,
    multiplier: 2.0,
    usesPerSeason: 0, // 0 = unlimited
    maxPerMatchday: 1
  }
}
```

**UI Matchday**:
```html
<!-- In formazione utente -->
<div class="player-card">
  <img src="player.jpg" />
  <div>Haaland (A)</div>
  <button class="set-captain-btn" onclick="setCaptain('player123')">
    ⭐ Capitano (2x)
  </button>
</div>
```

---

### 5. **📂 Import Giocatori Excel/CSV (PRIORITÀ ALTA!)** [6-8h]
**Tua richiesta**: "Più importante di molte cose, rende app appetibile"

**Workflow Utente**:
1. Admin → Leghe → Seleziona lega
2. Tab "Giocatori" → Click "➕ Importa Rosa"
3. Upload file Excel/CSV o drag & drop
4. AI analizza struttura file
5. Preview mapping campi
6. Conferma → Batch insert Firestore

**Struttura File Supportate**:

**Excel/CSV Standard**:
```
Nome       | Cognome  | Squadra        | Ruolo | Valore
Erling     | Haaland  | Manchester City| A     | 80
Gianluigi  | Donnarumma| PSG           | P     | 50
...
```

**CSV Semplice**:
```
Nome Completo, Squadra, Ruolo
Erling Haaland, Manchester City, A
Gianluigi Donnarumma, PSG, P
```

**Implementazione**:

**Frontend** (`admin-import-players.html`):
```html
<section class="card">
  <h2>📂 Importa Giocatori</h2>
  
  <!-- Drag & Drop Area -->
  <div id="dropArea" class="drop-area">
    <div class="drop-icon">📁</div>
    <h3>Trascina file Excel/CSV qui</h3>
    <p>oppure</p>
    <button class="btn" onclick="document.getElementById('fileInput').click()">
      Sfoglia File
    </button>
    <input type="file" id="fileInput" accept=".xlsx,.xls,.csv" hidden />
    <p style="font-size:12px; color:var(--muted); margin-top:12px;">
      Formati supportati: Excel (.xlsx, .xls), CSV (.csv)
    </p>
  </div>
  
  <!-- Preview & Mapping -->
  <div id="previewSection" style="display:none;">
    <h3>Preview Dati</h3>
    <div id="mappingGrid">
      <!-- Auto-detection o mapping manuale -->
    </div>
    <button class="btn" onclick="confirmImport()">✅ Conferma Importa (X giocatori)</button>
  </div>
</section>
```

**Parsing con PapaParse** (libreria JavaScript):
```javascript
// Leggi CSV
Papa.parse(file, {
  header: true,
  complete: async (results) => {
    const players = results.data.map(row => ({
      nome: row['Nome'] || row['nome'] || row['Name'],
      cognome: row['Cognome'] || row['cognome'] || extractLastName(row['Nome Completo']),
      squadra: row['Squadra'] || row['Team'] || row['team'],
      ruolo: normalizeRole(row['Ruolo'] || row['Role'] || row['ruolo']),
      valore: parseInt(row['Valore'] || row['Value'] || 0)
    }));
    
    showPreview(players);
  }
});

function normalizeRole(role) {
  const r = role.toUpperCase().trim();
  if (r === 'P' || r.includes('PORT')) return 'P';
  if (r === 'D' || r.includes('DIF')) return 'D';
  if (r === 'C' || r.includes('CENTRO')) return 'C';
  if (r === 'A' || r.includes('ATT')) return 'A';
  return '?';
}
```

**AI Smart Detection** (opzionale, con OpenAI):
```javascript
// Se colonne non standard
const prompt = `
Analizza questo header CSV e mappalo a: nome, cognome, squadra, ruolo, valore
Header: ${Object.keys(results.data[0]).join(', ')}
Esempio riga: ${JSON.stringify(results.data[0])}
`;

const mapping = await openai.complete(prompt); // ritorna mapping
```

**Batch Insert Firestore**:
```javascript
async function confirmImport(players) {
  const batch = db.batch();
  const leagueId = getCurrentLeagueId();
  
  players.forEach(player => {
    const docRef = db.collection(`leagues/${leagueId}/players`).doc();
    batch.set(docRef, {
      ...player,
      createdAt: firebase.firestore.Timestamp.now(),
      createdBy: currentUser.uid,
      status: 'active'
    });
  });
  
  await batch.commit();
  showToast(`${players.length} giocatori importati!`, 'success');
}
```

**Validazione**:
- ✅ Ruolo valido (P, D, C, A)
- ✅ Nome non vuoto
- ⚠️ Duplicati: mostra warning, permetti merge o skip
- ⚠️ Valore numerico o default 0

**Template Download**:
Bottone "📥 Scarica Template Excel" → download file esempio

---

## 🎨 PRIORITÀ MEDIA (2-4 settimane)

### 6. **📊 Dashboard Statistiche + Carosello** [4-5h]
**Tua richiesta**: Dashboard scorrevole mobile, carosello home PC

**Design**:

**Mobile** (swipe laterale):
```
┌────────────────────────┐
│ ◄  Serie A 2025     ► │
├────────────────────────┤
│ 🏆 Classifica Top 3    │
│ 1. Squadra A   45 pt   │
│ 2. Squadra B   42 pt   │
│ 3. Squadra C   40 pt   │
├────────────────────────┤
│ ⚽ Top Scorer           │
│ Haaland - 15 gol       │
├────────────────────────┤
│ 🛡️ Miglior Difesa      │
│ Squadra A - 6.8 media  │
└────────────────────────┘
  ◉ ○ ○  (pagination)
```

**Desktop** (carosello home):
```
┌────────────────────────────────────────────────┐
│         [←]  🏆 DASHBOARD  [→]                 │
├─────────────┬─────────────┬─────────────┬──────┤
│ Classifica  │ Top Scorer  │ Coppa       │ ...  │
│ Serie A     │ Haaland 15  │ Quarti      │      │
│ Top 5       │ Kane 12     │ Semifinali  │      │
└─────────────┴─────────────┴─────────────┴──────┘
```

**Widget Disponibili**:
1. Classifica Top 5
2. Top Scorer Giornata
3. Top Scorer Stagione
4. Miglior Difesa
5. MVP Giornata
6. Stato Coppa
7. Prossima Giornata
8. Risultati Recenti

**Implementazione**:
- Libreria: Swiper.js (carousel)
- Lazy loading widgets
- Cache dati (refresh ogni 5min)

---

### 7. **🖼️ Foto Calciatori in Schieramento** [3-4h]
**Tua richiesta**: "Sarebbe davvero figo"

**Storage**:
```
leagues/{id}/players/{playerId}:
{
  nome: "Erling Haaland",
  photoURL: "https://storage/.../haaland.jpg",
  squadra: "Manchester City",
  ruolo: "A"
}
```

**Upload Admin**:
```html
<!-- Admin panel giocatori -->
<div class="player-edit">
  <img src="photoURL || placeholder.png" class="player-photo-preview" />
  <input type="file" accept="image/*" onchange="uploadPlayerPhoto()" />
  <button>📸 Upload Foto</button>
</div>
```

**Schieramento Formazione**:
```html
<div class="formation-pitch">
  <div class="player-slot attaccante">
    <img src="haaland.jpg" class="player-photo" />
    <div class="player-name">Haaland</div>
    <div class="player-score">7.5</div>
  </div>
</div>
```

**Placeholder Default**:
- Usa iniziali in cerchio se no foto
- Colore per ruolo (P=giallo, D=blu, C=verde, A=rosso)

---

### 8. **🔄 Sistema Scambi Ruolo per Ruolo** [5-6h]
**Tua richiesta**: Non mercato live, ma scambi

**Rosa Standard**:
- 3 Portieri
- 8 Difensori
- 8 Centrocampisti
- 6 Attaccanti

**Configurabile Admin**:
```html
<!-- In creazione lega -->
<div>
  <h4>Composizione Rosa</h4>
  <div style="display:grid; gap:8px;">
    <label>Portieri: <input type="number" value="3" min="1" max="5" /></label>
    <label>Difensori: <input type="number" value="8" min="3" max="12" /></label>
    <label>Centrocampisti: <input type="number" value="8" min="3" max="12" /></label>
    <label>Attaccanti: <input type="number" value="6" min="3" max="10" /></label>
  </div>
</div>
```

**Workflow Scambio**:
1. Squadra A propone: "Scambio Difensore X con Centrocampista Y"
2. Squadra B riceve notifica
3. Squadra B accetta/rifiuta
4. Se accetta: scambio automatico, notifica admin
5. Admin può annullare entro 24h

**UI**:
```html
<section class="card">
  <h2>🔄 Proponi Scambio</h2>
  <div class="trade-proposal">
    <div class="trade-side">
      <h3>Offri</h3>
      <select id="offerPlayer"><!-- I tuoi giocatori --></select>
    </div>
    <div class="trade-arrow">⇄</div>
    <div class="trade-side">
      <h3>Richiedi</h3>
      <select id="requestTeam"><!-- Squadre --></select>
      <select id="requestPlayer"><!-- Giocatori squadra --></select>
    </div>
    <button class="btn" onclick="proposeTrade()">📤 Proponi Scambio</button>
  </div>
</section>
```

**Validazione**:
- ✅ Stesso ruolo (D ↔ D, C ↔ C, etc.)
- ✅ Entrambe squadre non superano max rosa
- ✅ Entrambi giocatori disponibili

---

## 🔮 PRIORITÀ BASSA (1-2 mesi)

### 9. **🏪 Store Merchandise** [8-10h]
**Tua richiesta**: Upload foto, nome, descrizione, prezzo

**Problema Pagamento/Spedizione**:

**Opzione A - Gestione Manuale** (semplice):
- Admin carica prodotti
- Utente "Contatta per acquistare" → apre WhatsApp/Email
- Gestione offline pagamento/spedizione

**Opzione B - Stripe Integration** (complesso):
- Integrazione Stripe Checkout
- Gestione ordini automatica
- Tracking spedizione con ShipStation

**Opzione C - Link Esterno** (medio):
- Admin inserisce link Shopify/Etsy
- Utente redirect a store esterno

**Consiglio**: Inizia con Opzione A, poi upgrade a B se volume alto

**UI Base**:
```html
<section class="store-grid">
  <div class="product-card">
    <img src="maglietta.jpg" />
    <h3>Maglietta Athletic</h3>
    <p>Descrizione prodotto...</p>
    <div class="price">€29.99</div>
    <button class="btn">💬 Contatta per Acquistare</button>
  </div>
</section>
```

---

### 10. **🏆 Badge Achievements** [4-5h]
Badge automatici per performance:
- 🔥 Hat-trick (3 gol stesso giocatore)
- 🛡️ Muro (clean sheet + media >7)
- 💎 Perfect 10
- 📈 Comeback King (vinto da -20)
- 🎯 Sniper (3 vittorie di fila)

---

### 11. **🔮 Pronostico Pre-Giornata** [3-4h]
**Tua richiesta**: Premium/pubblicità

Sistema predizione top scorer:
- Gratuito: 3 predizioni/mese
- Premium: illimitato
- Con ads: 1 predizione per video guardato

---

### 12. **💬 Chat Lega + Moderazione** [6-8h]
**Tua richiesta**: "Va moderata"

Chat con:
- Moderazione AI (filtra parolacce)
- Admin può eliminare messaggi
- Report abusi
- Rate limit (max 10 msg/min)

---

## 📊 PRIORITÀ IMPLEMENTAZIONE CONSIGLIATA

### Sprint 1 (Questa settimana):
1. ✅ Login obbligatorio
2. ✅ Selettore lega navbar
3. ✅ Sistema voti opzionale
4. ✅ Wildcard/Capitano regola

### Sprint 2 (Prossima settimana):
5. ✅ **Import giocatori Excel (PRIORITÀ!)**
6. ✅ Dashboard carosello
7. ✅ Foto calciatori

### Sprint 3 (Settimana 3):
8. Sistema scambi ruolo per ruolo
9. Gestione coppa (gironi + bracket)
10. Badge achievements

### Sprint 4 (Settimana 4):
11. Store merchandise (base)
12. Pronostico premium
13. Chat moderata

---

## 🎯 RIEPILOGO DECISIONI

### ✅ Implementare Subito
- Login obbligatorio
- Selettore lega navbar
- Voti opzionali
- Wildcard/Capitano
- **Import giocatori (priorità massima)**
- Dashboard
- Foto calciatori

### 🔄 Implementare Presto
- Sistema scambi
- Gestione coppa admin
- Badge achievements

### 🔮 Implementare Dopo
- Store (decidere payment)
- Pronostico premium
- Chat moderata

### ❌ Non Implementare
- Mercato live (sostituito da scambi)

---

**Prossimo Step**: Implemento le feature Sprint 1!

**Vuoi che inizi con**:
1. Login obbligatorio + selettore lega (infrastruttura base)
2. Import giocatori Excel (feature killer)
3. Wildcard/Capitano (quick win)

**Dimmi da dove vuoi che parta!**
