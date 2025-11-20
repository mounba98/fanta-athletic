# 🔧 FIX SYNC REGOLE - Guida Completa

## 📋 STATO ATTUALE

### ✅ Regole Corrette in `rules.json`

**R026 - Tamburo Trasferta**: ✅ **Già -0.5**
```json
{
  "rule_id": "R026",
  "nome_bonus": "Assenza tamburo trasferta",
  "valore": -0.5  // ✅ CORRETTO
}
```

**Squalificato in Curva**: ✅ **Già esistono**
```json
{
  "rule_id": "R011",
  "nome_bonus": "Giocatore squalificato presente in curva",
  "tipo": "Bonus",
  "soggetto": "Giocatore",
  "valore": 1
}
{
  "rule_id": "R011C",
  "nome_bonus": "Giocatore squalificato presente in curva",
  "tipo": "Bonus",
  "soggetto": "Curva",
  "valore": 1
}
{
  "rule_id": "R012",
  "nome_bonus": "Giocatore squalificato canta",
  "tipo": "Bonus",
  "soggetto": "Giocatore",
  "valore": 5
}
```

---

## ❌ PROBLEMA: Firestore Non Sincronizzato!

**Matchday** carica le regole da **Firestore**, NON da `rules.json`!

```javascript
// matchday.html linea 1488
const rulesSnap = await window.db.collection('rules').where('attivo', '==', true).get();
state.rules = rulesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

Quindi anche se `rules.json` è corretto, **Firestore potrebbe avere valori vecchi**!

---

## ✅ SOLUZIONE: Tool Upload Regole

Ho creato **`upload-rules-to-firestore.html`** che sincronizza tutto automaticamente.

---

## 🚀 COME USARE IL TOOL

### 1. Apri il Tool
```
https://fanta-athletic.web.app/upload-rules-to-firestore.html
```

### 2. Verifica Stato Attuale
1. **Click** su **"✅ Verifica Regole"**
2. Vedi nel log:
   ```
   JSON: 100 regole
   Firestore: XX regole
   
   📋 R026 (Tamburo Trasferta):
     JSON: -0.5
     Firestore: -2  ❌ MISMATCH!
   ```

### 3. Upload Tutte le Regole
1. **Click** su **"📤 Upload Regole"**
2. Aspetta il completamento (30-60 secondi)
3. Vedi nel log:
   ```
   ✓ R001: Formazione pubblicata (0)
   ✓ R002: Fuochi d'artificio (3)
   ...
   ✓ R026: Assenza tamburo trasferta (-0.5)  ✅
   ...
   ✓ R011: Giocatore squalificato presente in curva (1)
   ✓ R011C: Giocatore squalificato presente in curva (1)
   ...
   
   🎉 COMPLETATO! Uploaded: 100, Errors: 0
   ```

### 4. Verifica di Nuovo
1. **Click** su **"✅ Verifica Regole"**
2. Ora vedi:
   ```
   📋 R026 (Tamburo Trasferta):
     JSON: -0.5
     Firestore: -0.5  ✅ SINCRONIZZATA!
   ```

---

## 🎮 REGOLE SQUALIFICATO IN CURVA

### Esistenti in rules.json:

**R011** - Giocatore Squalificato Presente
- **Soggetto**: Giocatore
- **Valore**: +1
- **Descrizione**: Giocatore squalificato o infortunato presente in curva
- **Uso**: Bonus al giocatore specifico

**R011C** - Curva Bonus Squalificato
- **Soggetto**: Curva
- **Valore**: +1
- **Descrizione**: Giocatore squalificato o infortunato presente in curva
- **Uso**: Bonus alla curva quando c'è un squalificato

**R012** - Squalificato Canta
- **Soggetto**: Giocatore
- **Valore**: +5
- **Descrizione**: Giocatore squalificato/infortunato canta in curva
- **Uso**: Bonus maggiore se canta

### Come Applicarle in Matchday:

1. **Vai su Matchday** → Giornata X
2. **Tab "Bonus/Malus"**
3. **Seleziona giocatore squalificato**
4. **Cerca "R011"** nel dropdown
5. **Applica** → +1 punto

Se il squalificato canta:
- **Cerca "R012"** → +5 punti

---

## 🔄 QUANDO RI-SINCRONIZZARE?

### Ogni volta che modifichi `rules.json`:
1. Modifica `resources/rules.json`
2. Apri `upload-rules-to-firestore.html`
3. Click "📤 Upload Regole"
4. Fatto! Matchday vede le modifiche

### Backup Firestore (opzionale):
Prima di upload massiccio:
```
Click "✅ Verifica Regole" → salva screenshot
```

---

## 🗑️ RESET COMPLETO (solo se necessario)

Se qualcosa va storto:
1. Click **"🗑️ Elimina Tutte Regole"**
2. Conferma (⚠️ ATTENZIONE!)
3. Click **"📤 Upload Regole"**
4. Tutte le regole caricate da zero

---

## 📝 STRUCTURE REGOLA FIRESTORE

Ogni regola in Firestore ha:
```javascript
{
  rule_id: "R026",
  nome_bonus: "Assenza tamburo trasferta",
  descrizione: "Mancanza del tamburo in trasferta",
  tipo: "Malus",
  soggetto: "Curva",
  valore: -0.5,
  player_ids: [],
  coach_ids: [],
  note: "",
  attivo: true,      // ← Aggiunto da tool
  visible: true,     // ← Aggiunto da tool
  updated_at: "2025-10-22T18:50:00.000Z"  // ← Timestamp
}
```

Campo `attivo: true` necessario per query matchday!

---

## ✅ CHECKLIST COMPLETA

- [x] ✅ R026 valore corretto in rules.json (-0.5)
- [x] ✅ R011/R011C esistono in rules.json
- [x] ✅ Tool upload creato
- [ ] **TODO**: Upload regole su Firestore (usa tool!)
- [ ] **TODO**: Verifica in matchday che R026 = -0.5
- [ ] **TODO**: Test applica R011 su giocatore squalificato

---

## 🐛 TROUBLESHOOTING

### Tool non carica?
- Controlla console F12
- Verifica Firebase inizializzato
- Refresh pagina

### Upload fallisce?
- Controlla permessi Firestore (devi essere admin)
- Verifica connessione internet
- Guarda log errori nel tool

### Matchday non vede regole nuove?
- Ricarica matchday (F5)
- Verifica console "Regole caricate da Firestore: XX"
- Se carica da JSON invece che Firestore → problema Firebase

---

## 📚 FILE COINVOLTI

- `resources/rules.json` - Source of truth (100 regole)
- `upload-rules-to-firestore.html` - Tool sync ✨ NEW
- `matchday.html` - Consuma regole da Firestore
- Firestore collection `rules` - Database produzione

---

**🎯 PROSSIMO PASSO: Apri il tool e fai upload!**

https://fanta-athletic.web.app/upload-rules-to-firestore.html
