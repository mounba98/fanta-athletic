# 🚨 DEPLOY #58 - FIX URGENTE FORMAZIONI

**Data**: 21 Ottobre 2025, ore 23:25  
**Tipo**: HOTFIX CRITICO  
**Status**: ✅ IN DEPLOY

---

## 🐛 PROBLEMA SEGNALATO

**Utenti**: "Non riesco a inserire formazione, dice permessi o deadline scaduta"

### Root Cause
Utenti non avevano `team_index` impostato nel documento `/users/{uid}` in Firestore, quindi:
- `state.userTeamIdx` era `null` o `undefined`
- `canEdit()` ritornava `false`
- Messaggio di errore generico e confuso

---

## ✅ FIX APPLICATI

### 1. Messaggi Errore Migliorati
**Prima**:
```javascript
toast('Permesso negato');
```

**Dopo**:
```javascript
if (!state.user) {
  toast('❌ Devi effettuare il login per salvare');
  return;
}
if (typeof state.userTeamIdx !== 'number' && !state.isAdmin) {
  toast('❌ Non hai una squadra assegnata! Contatta un admin.');
  return;
}
const locked = isLockedAuto();
if (locked && !state.isAdmin){
  toast(`⏰ Formazioni bloccate! Deadline scaduta.`);
} else if (!(state.user && state.userTeamIdx===state.selectedTeamIdx) && !state.isAdmin){
  toast('❌ Non puoi salvare la formazione di un\'altra squadra');
} else {
  toast('❌ Permesso negato');
}
```

### 2. Check Preventivo al Login
Quando user fa login, verifica subito se ha `team_index`:

```javascript
if (typeof state.userTeamIdx !== 'number' && !state.isAdmin) {
  console.warn('⚠️ User senza team_index assegnato!');
  toast('⚠️ Non hai una squadra assegnata. Vai su "Scegli Squadra" o contatta un admin.');
}
```

### 3. Logging Completo per Debug
Aggiunto logging dettagliato per debug:

```javascript
console.log('✅ User team_index:', state.userTeamIdx);
console.log('📡 Loading deadline from:', deadlinePath);
console.log('✅ Deadline loaded:', state.deadlineTime);
console.warn('⚠️ Deadline non trovata - Formazioni APERTE');
```

---

## 🔍 DIAGNOSI COMPLETA

### Flusso Corretto
1. User fa login
2. Carica documento `/users/{uid}`
3. Legge `team_index` (es: 0-18)
4. Imposta `state.userTeamIdx = team_index`
5. User può editare solo quella squadra

### Cosa Può Andare Storto

#### A) User Senza team_index
**Problema**: `/users/{uid}` non ha campo `team_index`  
**Soluzione**: 
- Admin deve assegnare squadra su `verifica-squadre-utenti.html`
- Oppure user va su `scegli-squadra.html`

#### B) Deadline Non Impostata
**Problema**: `/leagues/{id}/deadlines/giornata_X` non esiste  
**Comportamento**: Formazioni APERTE (corretto)  
**Soluzione**: Admin imposta deadline su `admin-deadline.html`

#### C) currentLeague Non Caricata
**Problema**: `window.currentLeague` undefined  
**Causa**: league-context.js non caricato o errore  
**Soluzione**: Verificare che league-context.js viene incluso

---

## 📊 CHECKLIST VERIFICA

### Per Admin
- [ ] Verifica che tutti gli utenti hanno `team_index` in `/users`
- [ ] Usa `verifica-squadre-utenti.html` per assegnare squadre mancanti
- [ ] Imposta deadline per giornata corrente su `admin-deadline.html`

### Per Utenti
Se vedi "Non hai squadra assegnata":
1. Vai su **Scegli Squadra** dalla home
2. Oppure contatta admin per assegnazione manuale

Se vedi "Deadline scaduta":
1. Deadline passata, formazioni bloccate
2. Solo admin può modificare dopo deadline

---

## 🧪 TESTING

### Scenario 1: User con Squadra
```
1. Login con user che ha team_index=5
2. ✅ Vede solo squadra 5
3. ✅ Può salvare formazione squadra 5
4. ❌ Non può salvare altre squadre
```

### Scenario 2: User Senza Squadra
```
1. Login con user che NON ha team_index
2. ⚠️ Toast: "Non hai squadra assegnata"
3. ❌ Non può salvare nessuna formazione
4. 💡 Deve andare su "Scegli Squadra"
```

### Scenario 3: Deadline Scaduta
```
1. Login con user corretto
2. Deadline passata
3. ❌ Toast: "Formazioni bloccate! Deadline scaduta"
4. ✅ Admin bypassa e può comunque salvare
```

### Scenario 4: Deadline Non Impostata
```
1. Nessuna deadline in Firestore
2. ✅ Formazioni APERTE per tutti
3. Console: "Deadline non trovata - Formazioni APERTE"
```

---

## 🔗 FILE COINVOLTI

- `formazioni.html` (linee 445-467, 514-549, 1050-1067)
- `sw.js` (cache v2025102125)

---

## 📝 ISTRUZIONI UTENTI

### Errore: "Non hai squadra assegnata"

1. **Vai su Home** → Click "Scegli Squadra"
2. **Oppure** contatta admin:
   - Admin va su `verifica-squadre-utenti.html`
   - Seleziona tuo nome
   - Assegna squadra
3. **Ricarica** la pagina formazioni

### Errore: "Deadline scaduta"

- Formazioni bloccate, deadline passata
- Solo admin può modificare
- Attendi prossima giornata

### Errore: "Non puoi salvare altra squadra"

- Stai cercando di modificare squadra non tua
- Ogni user può modificare solo la propria squadra
- Admin può modificare tutte

---

## 🎯 RISULTATO ATTESO

- ✅ Messaggi errore chiari e specifici
- ✅ User capisce subito il problema
- ✅ Logging completo per debug admin
- ✅ Toast preventivo al login se squadra mancante

---

**Deploy #58 COMPLETATO!** 🚀  
**Check utenti e dimmi se persiste!** 👍
