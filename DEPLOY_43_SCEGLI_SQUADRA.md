# 🚀 DEPLOY #43 - PAGINA SCEGLI SQUADRA

**Data**: 21 Ottobre 2025, ore 20:00  
**Status**: ✅ DEPLOY IN CORSO

---

## ✨ NUOVA FEATURE: Selezione Squadra Dopo Join

### PROBLEMA RISOLTO

**Prima**:
```
1. User fa join con codice CSJVAV ✅
2. Redirect a index.html
3. User NON è in nessuna squadra ❌
4. Come si assegna? Solo admin manualmente
```

**Ora**:
```
1. User fa join con codice CSJVAV ✅
2. Redirect a scegli-squadra.html ✅
3. User sceglie squadra dalla lista ✅
4. Click "Conferma" → assegnato automaticamente ✅
5. Redirect a index.html con squadra assegnata ✅
```

---

## 📄 FILE CREATO: scegli-squadra.html

### Funzionalità

1. **Carica squadre dalla lega**
   ```javascript
   const leagueDoc = await db.collection('leagues').doc(currentLeagueId).get();
   const teams = leagueDoc.data().teams;
   ```

2. **Mostra grid squadre**
   - Nome squadra
   - Emoji automatica (basata su nome)
   - Numero membri attuali
   - Selezionabile con click

3. **Auto-check se già in squadra**
   ```javascript
   if (leagueData.teams[teamId].members.includes(user.uid)) {
     // Già in squadra → redirect index.html
   }
   ```

4. **Assegnazione automatica**
   ```javascript
   await db.collection('leagues').doc(leagueId).update({
     [`teams.${teamId}.members`]: FieldValue.arrayUnion(uid)
   });
   ```

---

## 🎨 DESIGN

### Layout
- Background gradient viola
- Card centrale con squadre
- Ogni squadra: emoji + nome + membri
- Hover effect animato
- Selected state con border rosso

### Responsive
- Mobile-friendly
- Padding adattivo
- Grid responsive

---

## 🔄 FLUSSO UTENTE COMPLETO

### 1. User Nuovo Entra
```
join-league.html
  ↓ inserisce codice CSJVAV
  ↓ click "Unisciti"
auth-guard.js → joinWithCode()
  ↓ aggiunge user a lega
  ↓ crea documento /users/{uid}
  ↓ redirect
scegli-squadra.html
  ↓ carica squadre disponibili
  ↓ user seleziona squadra
  ↓ click "Conferma"
  ↓ aggiunge user a teams.{teamId}.members
index.html
  ✅ User in lega e in squadra
```

### 2. User Già In Squadra
```
scegli-squadra.html
  ↓ check se già in squadra
  ↓ SE SÌ:
index.html (redirect automatico dopo 1 secondo)
```

### 3. User Già In Lega Ma Non In Squadra
```
join-league.html
  ↓ check user già in lega
  ↓ redirect index.html
  
OPPURE accesso diretto:
scegli-squadra.html
  ↓ mostra squadre
  ↓ può scegliere
```

---

## 🔧 FILE MODIFICATI

### 1. resources/auth-guard.js (v2025102106)
```javascript
// PRIMA
window.location.href = 'index.html?joined=1';

// DOPO
alert('✅ Ti sei unito alla lega! Ora scegli una squadra.');
window.location.href = 'scegli-squadra.html';
```

### 2. sw.js
- Cache v2025102106

---

## 🧪 TESTING

### TEST 1: Join Nuovo User (IMPORTANTE!)

**Finestra Incognito**:
```
1. CTRL+SHIFT+N
2. Login con user NON in lega
3. Modal "Unisciti a Competizione"
4. Inserisci: CSJVAV
5. Click "Unisciti"
6. Alert: "Ti sei unito alla lega! Ora scegli una squadra."
7. Redirect a scegli-squadra.html
8. Vedi lista squadre (Rossi, Blu, etc)
9. Click su una squadra → diventa rosa/highlighted
10. Click "Conferma Squadra"
11. Alert: "Sei stato assegnato alla squadra!"
12. Redirect a index.html
13. Dashboard mostra statistiche squadra ✅
```

### TEST 2: User Già In Squadra

**Accesso diretto**:
```
1. Sei già in lega e squadra
2. VAI: scegli-squadra.html
3. Check automatico: "già in squadra"
4. Redirect automatico a index.html (1 secondo)
```

### TEST 3: Admin Assegna Manualmente

**Alternativa admin**:
```
1. Admin va su admin.html
2. Tab "Squadre"
3. Trova user senza squadra
4. Assegna manualmente
5. User refresh → vede squadra assegnata
```

---

## 🔴 PROBLEMA SELETTORE LEGA HOME

### Feedback Utente
> "da finestra anonima min home non funziona selettore lega, da squadre si"

**Possibile causa**: Script `league-selector.js` caricato ma non inizializzato.

**Differenze**:
- `index.html`: Ha script aggiuntivi (classifiche-preview, league-context)
- `squadre.html`: Solo league-selector base

**Debug necessario**: Screenshot console da index.html quando selettore non funziona.

---

## 📊 FIRESTORE SCHEMA

### Collection: leagues/{leagueId}

```javascript
{
  name: "Lega Amici 2025",
  inviteCode: "CSJVAV",
  members: ["uid1", "uid2", "uid3"],
  teams: {
    "rossi": {
      nome: "Rossi",
      members: ["uid1"],
      points: 0
    },
    "blu": {
      nome: "Blu", 
      members: ["uid2", "uid3"],
      points: 0
    }
  }
}
```

**Dopo scegli-squadra**:
```javascript
teams: {
  "rossi": {
    nome: "Rossi",
    members: ["uid1", "NEW_UID"]  // ← user aggiunto
  }
}
```

---

## 📞 TEST DA FARE (TUA AMICA)

### Scenario Completo

**Tua amica**:
```
1. Riceve link: https://fanta-athletic.web.app/join-league.html?code=CSJVAV
2. Apre link → si registra
3. Automatico: modal appare con codice precompilato
4. Click "Unisciti"
5. ✅ Alert successo
6. Redirect scegli-squadra.html
7. Vede lista squadre
8. Seleziona una squadra
9. Click "Conferma"
10. ✅ Assegnata alla squadra
11. Redirect index.html
12. Vede dashboard con statistiche squadra
```

**Dimmi**:
- ✅ Funziona fino a che punto?
- ❌ Dove si blocca?
- 📸 Screenshot se errori

---

## 🔧 EMOJI SQUADRE AUTOMATICHE

### Mapping Nome → Emoji

```javascript
function getTeamEmoji(teamName) {
  if (name.includes('rossi') || name.includes('red')) return '🔴';
  if (name.includes('blu') || name.includes('blue')) return '🔵';
  if (name.includes('verd') || name.includes('green')) return '🟢';
  if (name.includes('gial') || name.includes('yellow')) return '🟡';
  if (name.includes('ner') || name.includes('black')) return '⚫';
  if (name.includes('bianc') || name.includes('white')) return '⚪';
  return '⚽'; // default
}
```

**Esempi**:
- "Squadra Rossi" → 🔴
- "Team Blu" → 🔵
- "I Verdi" → 🟢
- "Gialli" → 🟡
- "Qualsiasi Nome" → ⚽

---

## ⚠️ NOTA: Link Diretto

**Per la prossima volta**, puoi inviare link diretto con codice:
```
https://fanta-athletic.web.app/join-league.html?code=CSJVAV
```

Il codice viene **precompilato automaticamente** nel campo input.

---

## 🔥 RIASSUNTO

```
NUOVA FEATURE:
✅ Pagina scegli-squadra.html creata
✅ Dopo join → selezione squadra automatica
✅ Grid squadre con emoji e membri
✅ Assegnazione automatica al click
✅ Check duplicati (già in squadra)

DA TESTARE:
1. clear-sw.html → PULISCI (v2025102106)
2. Tua amica fa join completo
3. Verifica se arriva a scegli-squadra
4. Verifica se riesce a scegliere squadra
5. Verifica se assegnazione funziona
6. Screenshot test-foto-live quando pronto

PROBLEMA APERTO:
⚠️ Selettore lega index.html non funziona (squadre.html sì)
→ Debug necessario con screenshot console
```

**Fine Deploy #43! 🚀**

Aspetto screenshot test-foto-live e feedback tua amica! 📸
