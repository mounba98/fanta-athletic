# 🚀 Piano di Refactoring Fanta Athletic

## Obiettivo
Trasformare Fanta Athletic in una piattaforma multi-lega e multi-sport, completamente responsive e pronta per monetizzazione.

---

## 📋 ANALISI ARCHITETTURA ATTUALE

### Struttura File
- **Frontend**: HTML statico + Vanilla JS
- **Backend**: Firebase (Firestore + Storage + Auth + Hosting)
- **Styling**: CSS custom (resources/sheet.css) con variabili CSS per dark mode
- **Stato**: Nessun framework React - **CORREZIONE: implementare con Vanilla JS**

### Pagine Principali
- `index.html` - Dashboard homepage con grid responsive
- `matchday.html` - Inserimento punteggi (layout 2 colonne)
- `bacheca.html` - Social feed
- `squadre.html` - Vista squadre
- `formazioni.html` - Gestione formazioni
- `classifiche.html` - Classifiche
- Admin pages: `admin-*.html`

### Componenti Esistenti
- Navbar statica in header
- Mobile menu (hamburger)
- Bottom navigation (mobile)
- Theme switcher (light/dark)
- Auth system con Firebase

### Problemi Attuali Identificati
1. **Navbar**: icone scompaiono su mobile, nessuna tab Admin visibile
2. **Matchday**: layout laterale non ottimale per mobile/tablet
3. **Bacheca**: manca upload immagini, refresh manuale
4. **Architettura**: monolitica, non scalabile per multi-lega
5. **Responsive**: overflow orizzontale su alcune pagine

---

## 🎯 ROADMAP IMPLEMENTAZIONE

### FASE 1: NAVBAR REFACTORING ✅
**Priorità: ALTA**

#### Obiettivi
- [x] Fix icone mobile che scompaiono
- [ ] Aggiungere tab "Admin" per utenti con ruolo admin
- [ ] Risolvere problemi su desktop con monitor piccoli
- [ ] Navbar completamente responsive (hamburger su mobile)
- [ ] Evidenziare voce attiva correttamente
- [ ] Migliorare accessibilità touch

#### File da Modificare
- `resources/navbar.js` - Logica navbar dinamica
- `resources/mobile-menu.js` - Menu hamburger
- `resources/sheet.css` - Stili navbar responsive
- Tutti gli HTML - Aggiornare struttura header

#### Implementazione Tecnica
```javascript
// Pseudo-codice
1. Creare sistema di rilevamento ruolo admin da Firestore
2. Aggiungere condizionale rendering per tab Admin
3. Implementare media query per breakpoints:
   - Mobile (<768px): hamburger menu + bottom nav
   - Tablet (768-1024px): navbar compatta
   - Desktop (>1024px): navbar completa
4. Fix z-index e overflow per evitare sovrapposizioni
```

---

### FASE 2: MATCHDAY REFACTORING 🎮
**Priorità: ALTA**

#### Obiettivi
- [ ] Sostituire sidebar laterale con accordion verticale per ruoli
- [ ] Implementare modal centrata per dettagli giocatore
- [ ] Layout tablet landscape: griglia 2 colonne
- [ ] Fix bug punteggi residui (reset giornata)
- [ ] Ottimizzare scroll verticale e touch

#### File da Modificare
- `matchday.html` - Ristrutturare layout
- `matchday_live.html` - Applicare stesse modifiche
- Nuovo file: `resources/matchday-modal.js` - Gestione modal
- `resources/sheet.css` - Stili accordion e modal

#### Struttura Layout Proposta
```
Mobile/Tablet Portrait:
┌─────────────────────────┐
│  Header + Filtri        │
├─────────────────────────┤
│  ▼ Portieri (3)         │
│  ▼ Difensori (8)        │
│  ▼ Centrocampisti (10)  │
│  ▼ Attaccanti (7)       │
└─────────────────────────┘

Tablet Landscape:
┌──────────┬──────────────┐
│ Ruoli    │  Dettagli    │
│ (scroll) │  Giocatore   │
│          │  + Bonus     │
└──────────┴──────────────┘

Desktop:
┌──────────┬──────────────┬────────────┐
│ Sidebar  │  Accordion   │  Classifica│
│ Controlli│  Giocatori   │  Live      │
└──────────┴──────────────┴────────────┘
```

#### Modal Giocatore
```html
<div class="modal-overlay">
  <div class="modal-content">
    <div class="modal-header">
      <img src="foto-giocatore.jpg" alt="Nome">
      <h3>Nome Giocatore</h3>
      <span class="role-badge">Ruolo</span>
    </div>
    <div class="modal-body">
      <!-- Accordion Bonus -->
      <!-- Accordion Malus -->
      <!-- Punteggio Totale -->
    </div>
    <div class="modal-footer">
      <button class="btn-save">Salva</button>
      <button class="btn-close">Chiudi</button>
    </div>
  </div>
</div>
```

---

### FASE 3: SOCIAL/BACHECA REFACTORING 💬
**Priorità: MEDIA**

#### Obiettivi
- [ ] Upload immagini profilo (Firebase Storage)
- [ ] Upload immagini nei post (con limit size)
- [ ] Refresh automatico post senza reload
- [ ] Responsive layout mobile/tablet
- [ ] Compressione automatica immagini

#### File da Modificare
- `bacheca.html` - UI upload immagini
- `profile.html` - Upload avatar
- Nuovo file: `resources/image-upload.js`
- `storage.rules` - Configurare permessi

#### Implementazione Storage
```javascript
// Struttura Firebase Storage
/users/{userId}/
  - avatar.jpg
  - posts/
    - {postId}.jpg

// Firestore
/posts/{postId}
  - userId
  - text
  - imageUrl (opzionale)
  - timestamp
  - likes: []
  - comments: []
```

#### Features
- Preview immagine prima upload
- Validazione dimensioni (max 5MB)
- Compressione client-side
- Lazy loading immagini feed
- Real-time listener Firestore per nuovi post

---

### FASE 4: MULTI-LEGA ARCHITECTURE 🏆
**Priorità: ALTA**

#### Struttura Firebase Proposta
```
/competitions/{competitionId}/
  - name: "Serie A 2024-25"
  - sport: "football" | "basketball" | "volleyball"
  - createdAt: timestamp
  - ownerId: userId
  - admins: [userId1, userId2]
  - tier: "free" | "premium"
  - settings: {
      maxTeams: 10
      playersPerTeam: 25
      customColors: {...}
      logo: "url"
    }
  
  /teams/{teamId}
    - name
    - ownerId
    - players: []
    - points: 0
  
  /players/{playerId}
    - name
    - role
    - team
    - stats: {}
  
  /matchdays/{matchdayId}
    - date
    - number
    - completed: boolean
    - scores: {...}
  
  /users/{userId}
    - teamId
    - role: "admin" | "user"
  
  /posts/{postId}
    - userId
    - content
    - timestamp
```

#### File da Creare
- `competition-select.html` - Selezione/creazione lega
- `competition-settings.html` - Impostazioni lega
- `resources/competition-manager.js` - Logica gestione leghe
- `resources/invite-system.js` - Sistema inviti
- Aggiornare `firestore.rules` per permessi multi-lega

#### Features Implementazione
1. **Onboarding Utente**
   - Crea nuova lega → Genera ID univoco
   - Unisciti a lega esistente → Codice invito / Link

2. **Context Switching**
   - Salvare `currentCompetitionId` in localStorage
   - Tutti i dati filtrati per competitionId corrente
   - Dropdown switcher competizioni nell'header

3. **Permessi Admin**
   - Solo admins possono modificare regole/giocatori
   - Users possono solo gestire la propria squadra
   - Owner può aggiungere/rimuovere admins

---

### FASE 5: MULTI-SPORT MODULARITY ⚽🏀🏐
**Priorità: MEDIA**

#### Obiettivi
- [ ] Struttura modulare per sport
- [ ] Configurazioni sport-specifiche
- [ ] UI adattiva per ogni sport

#### Moduli Sport
```javascript
// sports-config.js
const SPORTS = {
  football: {
    name: "Calcio",
    icon: "⚽",
    roles: ["Portiere", "Difensore", "Centrocampista", "Attaccante"],
    formation: {
      total: 11,
      bench: 7
    },
    scoring: {
      bonus: [...],
      malus: [...]
    }
  },
  basketball: {
    name: "Basket",
    icon: "🏀",
    roles: ["Playmaker", "Guardia", "Ala", "Ala grande", "Centro"],
    formation: {
      total: 5,
      bench: 7
    },
    scoring: {
      points: 1,
      rebounds: 1.2,
      assists: 1.5,
      steals: 2,
      blocks: 2
    }
  },
  volleyball: {
    name: "Pallavolo",
    icon: "🏐",
    roles: ["Palleggiatore", "Schiacciatore", "Opposto", "Centrale", "Libero"],
    formation: {
      total: 6,
      bench: 6
    },
    scoring: {
      points: 1,
      aces: 3,
      blocks: 2,
      digs: 1
    }
  }
};
```

#### File da Creare
- `resources/sports-config.js` - Configurazioni sport
- `resources/sport-renderer.js` - UI dinamica per sport
- Template HTML generici per ogni sport

---

### FASE 6: RESPONSIVE OPTIMIZATION 📱
**Priorità: ALTA**

#### Breakpoints Standard
```css
/* Mobile First */
/* Small phones: 320px - 480px */
/* Phones: 481px - 768px */
/* Tablets: 769px - 1024px */
/* Tablets Landscape: 1025px - 1366px */
/* Laptops: 1367px - 1920px */
/* Desktop: 1920px+ */
```

#### Checklist Responsive
- [ ] Nessun overflow orizzontale su tutti i dispositivi
- [ ] Font scalabili (rem/em invece di px)
- [ ] Touch target minimo 44x44px
- [ ] Immagini responsive con srcset
- [ ] Skeleton loaders durante caricamento
- [ ] Lazy loading per liste lunghe
- [ ] Scroll verticale fluido senza bounce

#### Test Devices
- iPhone SE (375x667)
- iPhone 13 (390x844)
- iPad (768x1024)
- iPad Pro (1024x1366)
- Desktop 1366x768
- Desktop 1920x1080

---

### FASE 7: FREEMIUM/PREMIUM (FUTURO) 💰
**Status: In pianificazione - Non implementare ora**

#### Tier Free
- 1 lega
- 10 utenti max
- Funzioni base (formazioni, punteggi, classifica)

#### Tier Premium
- Leghe illimitate
- Utenti illimitati
- Statistiche avanzate
- Personalizzazione logo/colori
- Export dati CSV/PDF
- Supporto prioritario

---

## 🛠️ TECNOLOGIE E TOOLS

### Stack Corrente
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Firebase (Firestore, Storage, Auth, Hosting)
- **No Build Tools**: Deploy diretto
- **PWA**: Service Worker per installazione app

### Tools Raccomandati
- **Testing Responsive**: Chrome DevTools, BrowserStack
- **Immagini**: ImageKit / Cloudinary per CDN
- **Monitoring**: Firebase Analytics + Performance
- **Versioning**: Git con branching strategy

---

## 📊 METRICHE DI SUCCESSO

### Performance
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Lighthouse Score > 90

### UX
- [ ] Zero overflow orizzontale su tutti i device
- [ ] Touch target conformi alle linee guida (min 44px)
- [ ] Skeleton loaders su tutte le chiamate async

### Business
- [ ] Struttura multi-lega funzionante
- [ ] Sistema inviti implementato
- [ ] Base per tier free/premium

---

## 🚦 PRIORITÀ SVILUPPO

### Sprint 1 (SETTIMANA 1)
1. Navbar Refactoring ⭐⭐⭐
2. Responsive Base Optimization ⭐⭐⭐

### Sprint 2 (SETTIMANA 2)
3. Matchday Refactoring ⭐⭐⭐
4. Multi-Lega Architecture ⭐⭐

### Sprint 3 (SETTIMANA 3)
5. Social/Bacheca Improvements ⭐⭐
6. Multi-Sport Foundation ⭐

### Sprint 4 (SETTIMANA 4)
7. Testing & Bug Fixing ⭐⭐⭐
8. Documentation & Deploy ⭐⭐

---

## 📝 NOTE IMPLEMENTAZIONE

### Best Practices
- Mobile-first approach
- Progressive enhancement
- Accessibilità (WCAG 2.1 AA)
- SEO-friendly (meta tags, semantic HTML)
- Sicurezza Firebase (rules rigide)

### Git Strategy
```
main (production)
  ├── develop
      ├── feature/navbar-refactor
      ├── feature/matchday-modal
      ├── feature/multi-league
      └── feature/multi-sport
```

### Testing Strategy
1. Unit test logica business (players, scoring)
2. Integration test Firebase operations
3. E2E test user flows critici
4. Manual testing responsive su device fisici

---

## 🎯 PROSSIMI PASSI

1. ✅ **Review e approvazione piano**
2. 🔄 **Setup branch develop**
3. 🔄 **Iniziare con Navbar Refactoring**
4. 🔄 **Creare componenti riusabili**
5. 🔄 **Implementare multi-lega base**

---

**Ultimo aggiornamento**: 19 Ottobre 2025
**Versione documento**: 1.0
**Autore**: Cascade AI + Nicol
