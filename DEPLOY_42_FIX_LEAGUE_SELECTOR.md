# 🚀 DEPLOY #42 - FIX LEAGUE SELECTOR + JOIN LOOP

**Data**: 21 Ottobre 2025, ore 19:50  
**Status**: ✅ DEPLOY IN CORSO

---

## 🔴 BUG RISOLTI

### BUG #1: User In Lega Ma "Loaded 0 leagues"

**Problema**: Utente entra in lega con successo, ma:
```
Loaded 0 leagues for user
⚠️ Timeout: currentLeague non caricata
```

**Screenshot**: Mostra statistiche lega MA selettore dice 0 leghe.

**Causa**: Query Firestore con `.orderBy('createdAt', 'desc')` richiede **composite index** che non esiste.

**Fix**:
1. ✅ Rimosso `.orderBy()` dalla query
2. ✅ Sort client-side dopo fetch
3. ✅ Aggiunti log dettagliati `[LEAGUE-SELECTOR]`

**PRIMA**:
```javascript
const snapshot = await db.collection('leagues')
  .where('members', 'array-contains', user.uid)
  .orderBy('createdAt', 'desc')  // ❌ Richiede index Firestore!
  .get();
```

**DOPO**:
```javascript
const snapshot = await db.collection('leagues')
  .where('members', 'array-contains', user.uid)
  .get();

// Sort client-side
userLeagues.sort((a, b) => {
  const aTime = a.createdAt?.toMillis?.() || 0;
  const bTime = b.createdAt?.toMillis?.() || 0;
  return bTime - aTime;
});
```

---

### BUG #2: Selettore Lega Non Si Apre

**Problema**: Click su selettore lega non apre dropdown.

**Causa**: `userLeagues` array vuoto → nessuna lega da mostrare → dropdown disabilitato.

**Fix**: Risolto automaticamente con fix BUG #1 (ora carica leghe correttamente).

---

### BUG #3: join-league.html Redirect Loop

**Problema**: 
1. User fa join → redirect a `index.html?joined=1`
2. User va su `join-league.html` → redirect immediato a index
3. Console dice "lega trovata" senza che user abbia inserito codice

**Causa**: Check automatico troppo aggressivo.

**Fix**: Aggiunto parametro `?joined=1` per evitare loop.

**PRIMA**:
```javascript
if (!codeParam) {
  // Check se già in lega → redirect sempre
  const userLeagues = await db.collection('leagues')...
  if (!userLeagues.empty) {
    window.location.href = 'index.html';
  }
}
```

**DOPO**:
```javascript
if (!codeParam && !joinedParam) {
  // Check solo se NON ha appena fatto join
  console.log('🔍 Checking if user already in league...');
  const userLeagues = await db.collection('leagues')...
  console.log('📊 User leagues found:', userLeagues.size);
  if (!userLeagues.empty) {
    window.location.href = 'index.html';
  } else {
    console.log('✅ User not in any league, show join form');
  }
}
```

---

### BUG #4: test-foto-live.html "Nome sconosciuto"

**Problema**: Tutti i giocatori mostrano "Nome sconosciuto".

**Causa**: Collection `/players` ha solo `photoURL` (aggiunto da noi con merge), ma NON ha `nome_completo`.

**Fix Temporaneo**: Aggiunti log per debug:
```javascript
console.log('📊 Players loaded:', players.length);
console.log('📋 First player sample:', players[0]);
```

**Fix Definitivo** (da implementare): Quando si carica foto, salvare ANCHE nome giocatore in `/players`:

```javascript
await db.collection('players')
  .doc(selectedPlayerId)
  .set({ 
    photoURL,
    nome_completo: playerName,  // ← DA AGGIUNGERE
    ruolo: playerRole            // ← DA AGGIUNGERE
  }, { merge: true });
```

---

## 📊 FILES MODIFICATI

### 1. resources/league-selector.js (v2025102105)
- ✅ Rimosso `.orderBy('createdAt', 'desc')`
- ✅ Sort client-side
- ✅ Log `[LEAGUE-SELECTOR]` dettagliati

### 2. resources/auth-guard.js (v2025102105)
- ✅ Redirect con `?joined=1` dopo join
- ✅ Chiude modal prima del redirect

### 3. join-league.html (v2025102105)
- ✅ Check parametro `?joined=1` per evitare loop
- ✅ Log dettagliati query leghe

### 4. test-foto-live.html (v2025102105)
- ✅ Log sample primo giocatore per debug

### 5. sw.js
- ✅ Cache v2025102105

---

## 🧪 TESTING

### TEST 1: Join League (Incognito)
```
1. CTRL+SHIFT+N
2. Login user NON in lega
3. Modal "Unisciti a Competizione"
4. Inserisci CSJVAV
5. Console:
   ✅ [MODAL] League found
   ✅ [MODAL] User document updated/created
6. Redirect a index.html?joined=1
7. Console:
   🔍 [LEAGUE-SELECTOR] Querying leagues
   📊 [LEAGUE-SELECTOR] Query returned: 1 leagues
   ✅ [LEAGUE-SELECTOR] Loaded 1 leagues for user
8. Selettore lega funziona ✅
9. Dashboard mostra statistiche ✅
```

### TEST 2: join-league.html Dopo Join
```
1. Hai già lega
2. VAI: join-league.html
3. Console:
   🔍 Checking if user already in league...
   📊 User leagues found: 1
   ✅ Utente già in lega, redirect...
4. Redirect a index.html ✅
```

### TEST 3: test-foto-live.html
```
1. VAI: test-foto-live.html
2. Console F12:
   📊 Players loaded: 30
   📋 First player sample: {id: "xxx", photoURL: "...", ...}
3. Se photoURL presente → mostra foto
4. Se nome_completo presente → mostra nome
5. Se nome_completo assente → "Nome sconosciuto"
```

---

## ⚠️ PROBLEMA ANCORA APERTO: test-foto-live

**Situazione Attuale**:
```
Collection /players/{playerId}:
  - photoURL: "https://..." ✅ (se caricata)
  - nome_completo: undefined ❌
  - ruolo: undefined ❌
```

**Causa**: `upload-foto-giocatori.html` salva solo `photoURL` in `/players`, non altri campi.

**Soluzione** (da implementare dopo test):

```javascript
// In upload-foto-giocatori.html, quando salvi foto:

// 1. Recupera dati giocatore da /leagues/{id}/players/{id}
const playerDoc = await db.collection('leagues')
  .doc(currentLeagueId)
  .collection('players')
  .doc(selectedPlayerId)
  .get();

const playerData = playerDoc.data();

// 2. Salva in /players con TUTTI i campi base
await db.collection('players')
  .doc(selectedPlayerId)
  .set({ 
    photoURL,
    nome_completo: playerData.cognome || playerData.nome_completo || 'Sconosciuto',
    ruolo: playerData.ruolo || 'N/A',
    active: playerData.active ?? true
  }, { merge: true });
```

---

## 🔧 PROSSIMI FIX NECESSARI

### 1. upload-foto-giocatori.html
Quando salvi foto in `/players/{id}`, includi anche:
- `nome_completo` o `cognome`
- `ruolo`
- `active`

### 2. Firestore Composite Index
Se vuoi usare `.orderBy('createdAt')` con `.where('members', 'array-contains')`:
1. Firebase Console → Firestore → Indexes
2. Crea composite index:
   - Collection: `leagues`
   - Fields: `members` (array-contains) + `createdAt` (desc)

Ma per ora sort client-side funziona bene ✅

---

## 📞 QUANDO TORNI DIMMI:

1. **clear-sw.html** → Pulito? Cache v2025102105 attiva?
2. **Join incognito** → Funziona? Console mostra `[LEAGUE-SELECTOR] Loaded 1 leagues`?
3. **Selettore lega** → Si apre? Mostra la tua lega?
4. **Dashboard** → Mostra statistiche e classifiche?
5. **join-league.html** → Se sei in lega, ti redirecta subito?
6. **test-foto-live** → Console mostra sample primo giocatore? Ha nome_completo?

Screenshot console! 📸

---

## 🎮 DOPO IL TEST: GIOCHI

Quando confermi che tutto funziona:
1. Fix definitivo nome giocatori in test-foto-live
2. Completo OSM Athletic Manager
3. Completo Wirc Snap
4. Deploy #43 finale

---

## 🔥 RIASSUNTO ULTRA-VELOCE

```
FIX IMPLEMENTATI:
✅ League selector: rimosso orderBy → sort client-side
✅ Join loop: parametro ?joined=1 evita redirect immediato
✅ Log dettagliati [LEAGUE-SELECTOR] per debug
✅ test-foto-live: log sample per vedere campi disponibili

DA TESTARE:
1. clear-sw.html → PULISCI
2. Join incognito → Selettore funziona?
3. test-foto-live → Console sample giocatore

PROBLEMA APERTO:
⚠️ test-foto-live "Nome sconosciuto"
→ Collection /players non ha nome_completo
→ FIX da implementare in upload-foto-giocatori.html
```

**Fine Deploy #42! 🚀**
