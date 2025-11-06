# 🚀 DEPLOY #35 - FIX FOTO + JOIN LEAGUE

**Data**: 21 Ottobre 2025, ore 17:40  
**Status**: ✅ COMPLETATO

---

## 🐛 PROBLEMI RISOLTI

### 1. ❌ Foto Giocatori Non Mostrate in Matchday

**CAUSA**: Campo database mismatch
- Upload salvava: `photoURL`
- Matchday cercava: `photo_url`

**FIX**: ✅
```javascript
// PRIMA (SBAGLIATO)
const photoUrl = p.photo_url || placeholder;

// DOPO (CORRETTO)
const photoUrl = p.photoURL || placeholder;
```

**File Modificati**:
- `matchday.html` (2 occorrenze: lista + dettagli)

---

### 2. ❌ Join League "Codice Non Valido"

**CAUSA**: Query Firestore `.where()` non funzionante
- Possibile mancanza di indice
- Possibili caratteri nascosti/spazi nel codice

**FIX**: ✅ Fallback client-side
```javascript
// PRIMA: Solo query .where()
const snapshot = await db.collection('leagues')
  .where('inviteCode', '==', code)
  .get();

if (snapshot.empty) {
  showError('Codice non valido');
}

// DOPO: Fallback client-side se query fallisce
if (snapshot.empty) {
  // Carica tutte le leghe e filtra manualmente
  const allLeagues = await db.collection('leagues').get();
  allLeagues.docs.forEach(doc => {
    const storedCode = (doc.data().inviteCode || '').trim().toUpperCase();
    if (storedCode === code) {
      foundLeague = doc; // ✅ Trovato!
    }
  });
}
```

**File Modificati**:
- `join-league.html` (aggiunto fallback + debug logs)

---

## 🎯 COSA TESTARE ORA

### Test 1: Foto Giocatori in Matchday

1. **CTRL+F5** su: https://fanta-athletic.web.app/matchday.html
2. Seleziona giornata
3. Tab "Giocatori"
4. **VERIFICA**:
   - ✅ Vedi foto di **Moreno Fantechi** e altri con foto caricate?
   - ✅ Placeholder con iniziali per chi non ha foto?
   - ✅ Clicca giocatore → foto nel pannello dettagli?

### Test 2: Join League con Codice

1. **CTRL+F5** su: https://fanta-athletic.web.app/join-league.html
2. Inserisci codice: `CSJVAV`
3. **VERIFICA**:
   - ✅ Trova la lega "Fanta Athletic"?
   - ✅ Mostra info lega (membri, squadre)?
   - ✅ Mostra squadre disponibili?

**IMPORTANTE**: Apri **Console Browser** (F12) e guarda i log:
- 🔍 Searching for code: CSJVAV
- 📊 Query results: X
- Se 0 → vedrai fallback client-side in azione

---

## 📸 COME FUNZIONA ORA (FOTO)

### Upload Foto
1. Admin va su: https://fanta-athletic.web.app/upload-foto-giocatori.html
2. Seleziona giocatore
3. Carica e ritaglia immagine
4. **Salva** → Firebase Storage: `players/{leagueId}/{playerId}.jpg`
5. **Aggiorna** Firestore: campo `photoURL` con URL completo

### Visualizzazione Foto
1. **Matchday** carica giocatori da Firestore
2. Per ogni giocatore: `p.photoURL`
3. Se esiste → mostra foto
4. Se manca → placeholder con iniziali

**Placeholder**: `https://via.placeholder.com/40/1e3a8a/ffffff?text=MO`
- Background blu scuro (#1e3a8a)
- Testo bianco
- Prime 2 lettere nome maiuscole

---

## 🔍 COME FUNZIONA ORA (JOIN LEAGUE)

### Scenario 1: Query .where() Funziona (IDEALE)
```
User inserisce: CSJVAV
→ Query: .where('inviteCode', '==', 'CSJVAV')
→ Trova lega 4rq1Rr0TquRfuPLmqQTn
→ ✅ Mostra info e squadre
```

### Scenario 2: Query .where() Fallisce (FALLBACK)
```
User inserisce: CSJVAV
→ Query: .where('inviteCode', '==', 'CSJVAV')
→ Risultato: 0 (empty)
→ Fallback: Carica tutte le leghe
→ Filtra client-side: doc.inviteCode.trim().toUpperCase() === 'CSJVAV'
→ ✅ Trova lega e procede
```

**Vantaggi Fallback**:
- ✅ Gestisce spazi nascosti: `" CSJVAV "` → `"CSJVAV"`
- ✅ Gestisce case: `"csjvav"` → `"CSJVAV"`
- ✅ Funziona anche senza indice Firestore
- ✅ Debug dettagliato in console

---

## 🔧 DEBUG TOOLS

### Console Logs (F12 → Console)

**Matchday Foto**:
```
Nessun log specifico (se funziona tutto è silent)
Se errore immagine → onerror placeholder automatico
```

**Join League**:
```
🔍 Searching for code: CSJVAV Length: 6
📊 Query results: 0 o 1
❌ Code not found with .where(), trying client-side filter...
📋 All leagues in DB: 1
  - 4rq1Rr0TquRfuPLmqQTn: inviteCode="CSJVAV" (stored: "CSJVAV", searching: "CSJVAV")
✅ FOUND via client-side filter!
```

### Debug Page
URL: https://fanta-athletic.web.app/debug-join-code.html
- ✅ Mostra tutte le leghe nel DB
- ✅ Confronta hex dei caratteri
- ✅ Test codice manuale

---

## 📊 FILE MODIFICATI IN QUESTO DEPLOY

| File | Modifiche | Linee |
|------|-----------|-------|
| `matchday.html` | `photo_url` → `photoURL` | 2 |
| `join-league.html` | +fallback client-side +debug logs | +30 |

---

## ⏭️ PROSSIMI STEP (DOPO TEST)

### 1. Foto in Altri Componenti
- ⏳ Admin Teams (gestione squadre)
- ⏳ OSM Manager (campo tattico)
- ⏳ Altri giochi che usano DB giocatori

### 2. Ottimizzazioni Join League
Se fallback funziona sempre:
- Creare indice Firestore per `inviteCode`
- O rimuovere `.where()` e usare solo client-side (se poche leghe)

### 3. Batch Upload Foto
- Script per caricare foto multiple
- Import da cartella con naming `{playerId}.jpg`

---

## 🎮 COME CARICARE PIÙ FOTO

### Metodo Manuale (Attuale)
1. Upload una per una su: upload-foto-giocatori.html
2. Pro: Crop e preview immediato
3. Contro: Lento per molti giocatori

### Metodo Batch (TODO)
```javascript
// Script da creare
for (const file of selectedFiles) {
  const playerId = file.name.replace('.jpg', '');
  const storageRef = storage.ref(`players/${leagueId}/${playerId}.jpg`);
  await storageRef.put(file);
  const photoURL = await storageRef.getDownloadURL();
  await db.collection('leagues').doc(leagueId)
    .collection('players').doc(playerId)
    .update({ photoURL });
}
```

---

## 💬 DIMMI QUANDO HAI TESTATO!

Dopo aver testato:

1. **Foto in Matchday**:
   - ✅ Funziona? (sì/no)
   - ✅ Vedi Moreno Fantechi? (sì/no)

2. **Join League**:
   - ✅ Codice CSJVAV accettato? (sì/no)
   - ✅ Vedi console logs? (screenshot)

E ti implemento le foto anche negli altri componenti! 🚀
