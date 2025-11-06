# 📋 Requisiti Store e Sistema Admin - Fanta Athletic

**Data:** Dicembre 2024

---

## 🛍️ GESTIONE STORE

### Modifiche Richieste

1. **Spostare gestione store in admin panel**
   - Rimuovere `admin-store.html` come pagina separata
   - Integrare in `admin.html` come sezione
   - Visibile SOLO a superadmin

2. **Upload multiplo foto prodotti**
   - Non solo URL immagine singola
   - Galleria foto per ogni prodotto
   - Upload diretto su Firebase Storage
   - Presentazione con più immagini (es. front, back, dettagli)

3. **Struttura prodotto aggiornata**
   ```javascript
   {
     name: string,
     category: string,
     price: number,
     description: string,
     images: string[],  // Array di URL (non più image_url singola)
     tags: string[],
     badge: string,
     checkout_url: string,
     priority: number,
     availability: boolean,
     created_at: timestamp,
     updated_at: timestamp
   }
   ```

---

## 👑 SISTEMA RUOLI ADMIN

### Ruoli Richiesti

#### 1. **SuperAdmin** (Tutti gli admin attuali di Fanta Athletic)
- **Accesso completo:**
  - Gestione store (accesso completo)
  - Gestione leghe (tutte)
  - Gestione regole globali
  - Gestione giocatori globali
  - Tutti i tool admin esistenti
  - Creazione altri superadmin
  - Creazione admin store
  - Creazione admin lega

- **Chi sono:**
  - Tutti gli utenti attualmente in `admins` collection (o equivalente)
  - Admin storici di Fanta Athletic (leghe attuali)

#### 2. **Admin Lega** (Futuri admin delle nuove leghe esterne)
- **Accesso limitato:**
  - Gestione lega specifica (solo la propria)
  - Gestione regole lega (solo la propria)
  - Gestione giocatori lega (solo la propria)
  - Gestione squadre lega (solo la propria)
  - **NON** possono:
    - Gestire store
    - Creare/modificare altre leghe
    - Creare superadmin/admin
    - Accedere a tool globali
    - Accedere a leghe esterne

- **Chi sono:**
  - Admin delle future leghe create da utenti esterni
  - Assegnati dal proprietario della lega

#### 3. **Admin Store** (SuperAdmin + Figure dedicate solo store)
- **Accesso limitato:**
  - Gestione store completa (aggiungere/modificare/eliminare prodotti)
  - Upload foto prodotti
  - Gestione categorie
  - Visualizzazione ordini (se implementato)
  - **NON** possono:
    - Gestire leghe
    - Creare/modificare regole
    - Accedere a tool admin globali
    - Creare superadmin/admin

- **Chi sono:**
  - SuperAdmin (hanno accesso store automaticamente)
  - Figure dedicate create dai SuperAdmin
  - Utili per gestire store senza dare accesso completo

### Struttura Ruoli in Firestore

#### Collezione `admins` (o `users` con campo `role`)
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  role: 'superadmin' | 'admin_league' | 'admin_store' | 'user',
  leagues: string[],  // Array di leagueId per admin di lega
  permissions: {
    store: boolean,  // true per superadmin e admin_store
    leagues: string[],  // Array di leagueId per admin_league
    global: boolean  // true solo per superadmin
  },
  created_at: timestamp,
  created_by: string  // uid di chi ha creato questo admin
}
```

#### Helper Functions
```javascript
function isSuperAdmin(userId) {
  // Verifica se utente è superadmin
}

function isStoreAdmin(userId) {
  // Verifica se utente è superadmin O admin_store
}

function isLeagueAdmin(userId, leagueId) {
  // Verifica se utente è superadmin O admin della specifica lega
}

function canAccessStore(userId) {
  // Superadmin o admin_store
}

function canAccessLeagueAdmin(userId, leagueId) {
  // Superadmin o admin della lega specifica
}

function canCreateAdmins(userId) {
  // Solo superadmin
}
```

---

## 🛠️ TOOL CREAZIONE SUPERADMIN

### Funzionalità Richieste

1. **Pagina/Tool:** `admin-users.html` o sezione in `admin.html`
2. **Solo per SuperAdmin:**
   - Lista tutti gli admin (superadmin, admin_store, admin_league)
   - Form per aggiungere nuovo admin (con selezione ruolo)
   - Rimozione admin (con conferma)

3. **Modalità aggiunta:**
   - Cerca utente per email/username
   - Seleziona ruolo: `superadmin` | `admin_store` | `admin_league`
   - Se `admin_league`: seleziona lega
   - Salva in `admins` collection con ruolo e permessi

4. **UI:**
   - Tab/Tabs per filtrare per ruolo
   - Lista admin con email, nome, ruolo, lega (se applicabile), data creazione
   - Button "Aggiungi Admin"
   - Modal per ricerca, selezione ruolo e assegnazione
   - Conferma rimozione
   - Badge colorati per identificare ruolo (SuperAdmin, Admin Store, Admin Lega)

---

## 🔒 VISIBILITÀ PANNelli ADMIN

### Matrice Accessi

| Pannello | SuperAdmin | Admin Store | Admin Lega | Utente |
|----------|-----------|-------------|------------|--------|
| **Store** | ✅ | ✅ | ❌ | ❌ |
| **Gestione Leghe** | ✅ (tutte) | ❌ | ✅ (solo propria) | ❌ |
| **Regole** | ✅ (globali) | ❌ | ✅ (solo lega) | ❌ |
| **Giocatori** | ✅ (globali) | ❌ | ✅ (solo lega) | ❌ |
| **Squadre** | ✅ (tutte) | ❌ | ✅ (solo lega) | ❌ |
| **Creazione SuperAdmin** | ✅ | ❌ | ❌ | ❌ |
| **Creazione Admin Store** | ✅ | ❌ | ❌ | ❌ |
| **Creazione Admin Lega** | ✅ | ❌ | ✅ (solo propria lega) | ❌ |
| **Tool Migrazione** | ✅ | ❌ | ❌ | ❌ |
| **Force Update** | ✅ | ❌ | ❌ | ❌ |

### Implementazione

1. **Check permessi in ogni pagina admin:**
   ```javascript
   async function checkAdminAccess() {
     const user = firebase.auth().currentUser;
     const isSuperAdmin = await isSuperAdmin(user.uid);
     const isLeagueAdmin = await isLeagueAdmin(user.uid, currentLeagueId);
     
     if (!isSuperAdmin && !isLeagueAdmin) {
       window.location.href = 'index.html';
       return false;
     }
     
     return { isSuperAdmin, isLeagueAdmin };
   }
   ```

2. **Mostra/nascondi elementi in base al ruolo:**
   ```javascript
   function renderAdminPanel() {
     const { isSuperAdmin, isLeagueAdmin } = await checkAdminAccess();
     
     // Store solo per superadmin
     if (isSuperAdmin) {
       document.getElementById('store-section').style.display = 'block';
     } else {
       document.getElementById('store-section').style.display = 'none';
     }
     
     // Altri elementi...
   }
   ```

3. **Filter dati in base al ruolo:**
   ```javascript
   async function loadLeagues() {
     const { isSuperAdmin } = await checkAdminAccess();
     
     if (isSuperAdmin) {
       // Carica tutte le leghe
       return await db.collection('leagues').get();
     } else {
       // Carica solo leghe dove è admin
       return await db.collection('leagues')
         .where('admins', 'array-contains', userId)
         .get();
     }
   }
   ```

---

## 📸 GALLERIA FOTO PRODOTTI

### Funzionalità Richieste

1. **Upload multiplo:**
   - Input file multiplo (`<input type="file" multiple>`)
   - Drag & drop (opzionale)
   - Preview immagini prima di upload
   - Progress bar durante upload

2. **Storage Firebase:**
   - Path: `store_products/{productId}/images/{imageId}.jpg`
   - Naming: `image_1.jpg`, `image_2.jpg`, etc.
   - Ottimizzazione: resize automatico (es. max 1200px width)

3. **UI Galleria:**
   - Grid di immagini in `admin.html` (sezione store)
   - Possibilità di riordinare (drag & drop)
   - Eliminazione singola immagine
   - Immagine principale (prima nella lista)

4. **Display in Store:**
   - Carousel/slider in `store.html`
   - Thumbnail gallery
   - Zoom on click
   - Navigation tra immagini

---

## 🔄 MIGRAZIONE RUOLI ESISTENTI

### Piano Migrazione

1. **Identificare admin attuali:**
   - Controllare collezione `admins` (se esiste)
   - Oppure utenti con permessi speciali
   - Lista email/admin attuali

2. **Creare script migrazione:**
   ```javascript
   async function migrateExistingAdmins() {
     const existingAdmins = [
       'admin1@email.com',
       'admin2@email.com',
       // etc.
     ];
     
     for (const email of existingAdmins) {
       // Cerca utente per email
       const user = await findUserByEmail(email);
       if (user) {
         // Assegna ruolo superadmin
         await db.collection('admins').doc(user.uid).set({
           uid: user.uid,
           email: email,
           role: 'superadmin',
           created_at: firebase.firestore.Timestamp.now()
         });
       }
     }
   }
   ```

3. **Eseguire migrazione:**
   - Tool `migrate-admins.html` o sezione in `admin-setup.html`
   - Una volta sola
   - Verifica risultati

---

## 📝 NOTE IMPLEMENTATIVE

### Backward Compatibility
- Durante transizione, mantenere supporto per vecchi permessi
- Graduale migrazione a nuovo sistema ruoli

### Security Rules
- Aggiornare Firestore security rules per nuovi ruoli
- Verificare permessi in ogni query admin

### UI/UX
- Badge visibile in navbar per ruolo (SuperAdmin / Admin Lega)
- Colori diversi per identificare ruolo
- Messaggi chiari quando accesso negato

---

## ✅ CHECKLIST IMPLEMENTAZIONE

### Store
- [ ] Spostare gestione store in `admin.html`
- [ ] Implementare upload multiplo foto
- [ ] Firebase Storage per immagini
- [ ] Galleria in admin panel
- [ ] Carousel in `store.html`
- [ ] Visibilità solo superadmin

### Ruoli
- [ ] Creare collezione `admins` o campo `role` in `users`
- [ ] Funzioni helper per check ruoli
- [ ] Tool creazione superadmin
- [ ] Migrazione admin esistenti
- [ ] Aggiornare security rules

### Visibilità Pannelli
- [ ] Check permessi in ogni pagina admin
- [ ] Mostra/nascondi elementi in base al ruolo
- [ ] Filter dati in base al ruolo
- [ ] Messaggi accesso negato

### Testing
- [ ] Test permessi superadmin
- [ ] Test permessi admin lega
- [ ] Test accesso negato per utenti normali
- [ ] Test upload multiplo foto
- [ ] Test galleria prodotti

---

**Note:** Questo documento è solo per requisiti, non contiene codice. Il codice sarà implementato in seguito.

