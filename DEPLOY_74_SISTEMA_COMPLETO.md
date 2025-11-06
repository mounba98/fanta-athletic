# Deploy #74 - Sistema Completo Giornate + Fix Matchday ✅

**Data**: 22 Ottobre 2025, 11:10 AM  
**Status**: 🔄 IN PROGRESS

---

## 🎯 Modifiche Implementate

### 1. **Fix Layout Matchday 2 Colonne** ✅

**Problemi risolti**:
- ✅ Colonne scroll fino in fondo (`max-height: calc(100vh - 320px)`)
- ✅ Spazio orizzontale aumentato (lista giocatori 0.8fr, dettaglio 2.2fr)
- ✅ Filtri Bonus/Malus nascosti (già separati in colonne)
- ✅ Padding aggiunto per scroll più comodo

**File**: `matchday.html` (linee 678, 830, 834)

---

### 2. **Fix Score Lista Centrale Non Si Aggiorna** ✅

**Problema**: Quando aggiungi bonus/malus, lo score vicino al nome nella lista centrale non si aggiorna in tempo reale

**Soluzione**: Aggiunto `draw()` dopo ogni modifica per refresh lista

**File**: `matchday.html` (linee 843, 847, 851)

```javascript
// Prima
saveDay(); renderPlayerPanel(p); renderSummary();

// Dopo
saveDay(); renderPlayerPanel(p); renderSummary(); draw(); // ✅ Aggiorna lista centrale
```

---

### 3. **Sistema Auto-Advance Giornate** ✅

**Funzionalità**:
- 📊 Trova ultima giornata con `computed: true` in Firestore
- 🎯 **User normali** vedono automaticamente la giornata **successiva** all'ultima calcolata
- 👑 **Admin** vedono sempre G1 di default (possono cambiare liberamente)
- 🔒 Giornate calcolate sono **read-only** per user normali
- ✅ Admin possono modificare qualsiasi giornata (anche calcolate)

**File**: 
- `squadre.html` (linee 499-547)
- `formazioni.html` (linee 584-623)

---

### 4. **Lock Status Migliorato** ✅

**Nuovi messaggi colorati**:

| Status | Messaggio | Colore |
|--------|-----------|--------|
| Calcolata | 📊 Giornata GX CALCOLATA - Solo lettura | Rosso `#dc143c` |
| Bloccata | 🔒 Formazioni bloccate (deadline: ...) | Arancio `#f59e0b` |
| Aperta | ✅ Formazioni aperte (chiudono tra Xh Xm) | Verde `#10b981` |
| Chiudono presto | ⚠️ Formazioni aperte (chiudono tra Xm) | Arancio `#f59e0b` |

**File**: 
- `squadre.html` (linee 553-572)
- `formazioni.html` (linee 631-665)

---

## 🔍 Come Funziona il Sistema

### Per User Normali

**Scenario 1: Nessuna giornata calcolata**
```
Ultima calcolata: 0
Auto-select: G1
Modificabile: ✅ Sì
```

**Scenario 2: G1 e G2 calcolate**
```
Ultima calcolata: G2
Auto-select: G3
Modificabile G3: ✅ Sì
Modificabile G1/G2: ❌ Read-only
```

**Scenario 3: User seleziona G1 (calcolata)**
```
Lock status: 📊 Giornata G1 CALCOLATA - Solo lettura
Tutti i form: disabled
Drag & drop: disabilitato
Salvataggio: bloccato
```

---

### Per Admin

**Sempre tutto modificabile**:
```
Giornata: Qualsiasi
Auto-select: G1
Lock status: Sempre ✅ o 🔒 (mai 📊)
Modificabile: Sempre ✅ Sì
```

---

## 📝 Funzioni Chiave

### getLastComputedGiornata()

```javascript
// Query Firestore per trovare giornate con computed: true
const snapshot = await db.collection('days')
  .where('computed', '==', true)
  .get();

// Trova il numero massimo
const nums = snapshot.docs.map(doc => parseInt(doc.id.substring(1)));
return Math.max(...nums); // es. 2 se G1 e G2 sono calcolate
```

### getDefaultGiornata()

```javascript
const lastComputed = await getLastComputedGiornata(); // es. 2
const next = lastComputed + 1; // es. 3

if (state.isAdmin) return 'G1'; // Admin sempre G1
return `G${next}`; // User -> G3
```

### renderEditor() - Read-only Check

```javascript
const computedReadOnly = state.daysComputed && !state.isAdmin;
const canWrite = canEdit(idx) && (!locked || state.isAdmin) && !computedReadOnly;

// Tutti i form usano canWrite
<input disabled="${!canWrite}" />
```

---

## 🚀 Testing

### Test 1: User Vede Giornata Successiva

**Pre-requisiti**: Avere G1 e G2 in Firestore con `computed: true`

```
1. Logout se admin
2. Login come user normale
3. Vai su squadre.html o formazioni.html
4. Verifica: dropdown su G3 automaticamente ✅
5. Cambia a G1
6. Verifica: Lock status rosso "CALCOLATA - Solo lettura"
7. Verifica: Tutti i form disabled
8. Cambia a G3
9. Verifica: Form abilitati ✅
```

### Test 2: Admin Vede Sempre G1

```
1. Login come admin
2. Vai su squadre.html
3. Verifica: dropdown su G1 ✅
4. Cambia a G2 (calcolata)
5. Verifica: Lock status VERDE (non rosso)
6. Verifica: Form abilitati ✅
7. Modifica formazione
8. Salva → ✅ Success
```

### Test 3: Scroll Matchday

```
1. Vai su matchday.html
2. Tab "Giocatori"
3. Click su un portiere (ha molti bonus/malus)
4. Verifica: Bonus a sinistra, Malus a destra
5. Scroll colonna Bonus → arriva fino in fondo ✅
6. Scroll colonna Malus → arriva fino in fondo ✅
7. Aggiungi +1 gol segnato
8. Verifica: Score nella lista centrale si aggiorna ✅
```

---

## 📊 Files Modificati

| File | Modifiche | Linee |
|------|-----------|-------|
| `matchday.html` | Layout 2 col + score update | 15 |
| `squadre.html` | Sistema giornate + auto-advance | 90 |
| `formazioni.html` | Sistema giornate + auto-advance | 85 |
| `sw.js` | Cache v2025102207 | 1 |

**Totale**: 4 files, ~191 linee

---

## 🔧 Firestore Schema

### Collection: `days`

```javascript
{
  // Document ID: "G1", "G2", etc.
  "giornata": "G1",
  "label": "Giornata 1",
  "data": "2025-10-20",
  "computed": true, // ✅ Campo chiave per lock
  "players": { /* player_id: { rule_id: value } */ },
  "coaches": { /* coach_id: { rule_id: value } */ },
  "curva": { /* rule_id: value */ }
}
```

### Come Settare computed: true

**In matchday.html quando salvi**:

```javascript
// Opzione 1: Admin setta manualmente nel payload
const data = { 
  ...existingData,
  computed: true // ✅ Setta quando giornata è definitiva
};

// Opzione 2: Aggiungi checkbox in UI
<input type="checkbox" id="markAsComputed" />
<label>Segna come calcolata (lock per users)</label>
```

---

## ⚠️ Note Importanti

### Backward Compatibility

✅ **100% compatible** con giornate esistenti senza `computed` field:
- Default: `computed: false` se field mancante
- Nessun breaking change
- User vedono G1 se nessuna giornata calcolata

### Performance

- Query Firestore: 1 sola volta all'avvio (`getLastComputedGiornata`)
- Cache in `state.daysComputed` per check successivi
- No impatto performance

### Security

- Check solo client-side (per UX)
- **TODO**: Aggiungere Firestore Security Rules server-side

```javascript
// firestore.rules
match /teams/{teamId}/saved/{giornataId} {
  allow write: if request.auth != null && (
    // Admin possono sempre scrivere
    exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
    // User normali solo se giornata NON è computed
    !exists(/databases/$(database)/documents/days/$(giornataId)) ||
    !get(/databases/$(database)/documents/days/$(giornataId)).data.computed
  );
}
```

---

## 🎉 Risultato Finale

### User Experience

**Prima**:
- User vedono sempre G1
- Devono cambiare manualmente
- Possono modificare giornate passate (errore)

**Dopo**:
- ✅ Auto-select giornata corretta
- ✅ Lock su giornate calcolate
- ✅ Feedback visivo chiaro (colori + emoji)
- ✅ Admin possono sempre modificare

### Admin Experience

**Prima**:
- Potevano modificare tutto ma senza distinzione

**Dopo**:
- ✅ Bypassano tutti i lock
- ✅ Vedono sempre G1 di default
- ✅ Possono modificare qualsiasi giornata
- ✅ Field `computed: true` per lock users

---

## 🔄 Workflow Tipico

### Fase 1: Pre-Giornata
```
1. Admin imposta formazioni deadline
2. Users inseriscono formazioni in G(X)
3. Lock automatico a deadline
```

### Fase 2: Durante Partita
```
4. Admin va in matchday.html
5. Inserisce bonus/malus live
6. Usa "📝 Salva Live" ogni 10 min
```

### Fase 3: Post-Giornata
```
7. Admin completa inserimento
8. Click "💾 Salva giornata"
9. (TODO) Checkbox "Segna come calcolata"
10. Salva su Firestore con computed: true
```

### Fase 4: Auto-Advance
```
11. Users tornano su squadre/formazioni
12. Vedono automaticamente G(X+1)
13. G(X) diventa read-only
14. Users preparano G(X+1)
```

---

## 📱 Mobile Responsive

Tutti i fix sono responsive:
- Layout 2 colonne → 1 colonna su mobile
- Scroll ottimizzato per touch
- Lock status leggibile

---

**Deploy Status**: 🚀 IN PROGRESS  
**URL**: https://fanta-athletic.web.app/

**Test tutto dopo il deploy!**
