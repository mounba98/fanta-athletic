# 🔧 Fix Curva 52 Punti Fantasma

**Deploy #72** - 22 Ottobre 2025, 10:50 AM

---

## 🐛 Problema

Quando aggiungi il **primo bonus a un giocatore** (es. Parata decisiva +1 a Pinzo), improvvisamente:
- ✅ Bonus giocatore: +1 (corretto)
- ❌ **Totale Curva: 52.00 punti** (SBAGLIATO!)
- ❌ **Totale Giocatori: 52.00 punti** (contiene anche la curva)

**Dove appare**: Screenshot mostra riepilogo sidebar con 52.00 punti curva senza aver aggiunto nulla alla curva.

---

## 🔍 Causa Identificata

**localStorage contiene dati corrotti della curva** da una sessione precedente.

### Cosa Succede:
1. localStorage ha `curva_G1` con valore corrotto (es. 52 punti già dentro)
2. All'avvio, `loadDay()` carica questi dati corrotti in `state.selCurva`
3. Quando aggiungi il primo bonus a un giocatore:
   - `saveDay()` viene chiamato
   - Salva `state.selCurva` che contiene già i 52 punti corrotti
4. Il riepilogo mostra: Curva 52.00 + Giocatori 1.00 = 53.00

---

## ✅ Soluzioni Implementate

### 1. **Validazione Dati al Caricamento** ✅

Ora `loadDay()` valida ogni chiave della curva:

```javascript
// Validazione: rimuovi chiavi non numeriche che potrebbero essere corrotte
state.selCurva = {};
for (const [key, val] of Object.entries(curvaData)) {
  const numVal = Number(val);
  if (!isNaN(numVal) && isFinite(numVal)) {
    state.selCurva[key] = numVal;
  } else {
    console.warn(`⚠️ Curva key '${key}' ha valore invalido '${val}', ignorato`);
  }
}
```

**File**: `matchday.html` (linee 463-475)

---

### 2. **Bottone Reset Curva** ✅

Nuovo bottone rosso **"🔧 Reset Curva"** nella sidebar:

**Cosa fa**:
- Resetta `state.selCurva = {}`
- Salva in localStorage
- Aggiorna UI
- **NON tocca** giocatori e allenatori

**Come usare**:
1. Click su "🔧 Reset Curva"
2. Conferma
3. Controlla riepilogo: "Totale Curva" deve essere 0.00

**File**: `matchday.html` (linee 146, 1129-1139)

---

### 3. **Debug Logging** ✅

Ora ogni volta che salvi, vedi nella console:

```
💾 saveDay() - Curva: X keys, totale: Y.YY pt
```

**Come usare**:
1. Apri console (F12)
2. Aggiungi un bonus a un giocatore
3. Guarda log: se dice "Curva: 0 keys, totale: 0.00" → OK!
4. Se dice "Curva: X keys, totale: 52.00" → problema persiste

**File**: `matchday.html` (linee 492-495)

---

### 4. **Tool HTML di Diagnostica** ✅

Creato `RESET_CURVA_FIX.html` per vedere e pulire localStorage:

**URL**: https://fanta-athletic.web.app/RESET_CURVA_FIX.html

**Funzioni**:
- 🔍 Mostra tutti i dati curva salvati
- 🗑️ Resetta curva per tutte le giornate
- 📋 Visualizza breakdown dati localStorage

**File**: `RESET_CURVA_FIX.html`

---

## 🚀 Come Fixare il Problema ORA

### Opzione 1: Bottone Reset Curva (PIÙ VELOCE)

1. Vai su https://fanta-athletic.web.app/matchday.html
2. Seleziona giornata corrente (es. G1)
3. Click **"🔧 Reset Curva"** (bottone rosso)
4. Conferma
5. Controlla riepilogo: "Totale Curva" = 0.00
6. Aggiungi bonus a Pinzo
7. Controlla: dovrebbe essere 1.00, non 52.00!

---

### Opzione 2: Tool HTML

1. Vai su https://fanta-athletic.web.app/RESET_CURVA_FIX.html
2. Click "🔍 Mostra Dati Attuali"
3. Vedi se ci sono dati corrotti
4. Click "🗑️ RESETTA CURVA (Tutte le Giornate)"
5. Ricarica matchday.html

---

### Opzione 3: Console (Avanzato)

Apri console (F12) e scrivi:

```javascript
// Vedi dati curva attuali
console.log('Curva G1:', localStorage.getItem('curva_G1'));

// Pulisci
localStorage.removeItem('curva_G1');

// Ricarica pagina
location.reload();
```

---

## 🧪 Test Completo

### Step 1: Verifica Reset
1. Apri matchday.html
2. Controlla riepilogo
3. Se "Totale Curva" > 0 senza aver aggiunto nulla → Click "Reset Curva"

### Step 2: Test Bonus Pulito
1. Tab "Giocatori"
2. Cerca "Pinzo"
3. Click su Pinzo
4. Aggiungi "Parata decisiva" x 1
5. Riepilogo deve mostrare:
   - Totale Giocatori: **1.00**
   - Totale Curva: **0.00**
   - Somma: **1.00**

### Step 3: Test Curva Reale
1. Tab "Curva"
2. Aggiungi "Gol segnato" x 1 (es. +2)
3. Riepilogo deve mostrare:
   - Totale Curva: **2.00**
   - Somma: **3.00** (1 Pinzo + 2 curva)

---

## 📊 Files Modificati

| File | Modifiche | Linee |
|------|-----------|-------|
| `matchday.html` | Validazione curva, reset button, debug log | 30 |
| `RESET_CURVA_FIX.html` | Tool diagnostica localStorage | 150 (nuovo) |
| `sw.js` | Cache v2025102205 | 1 |

---

## ⚠️ Note Importanti

### Perché Succede?

Probabilmente durante test precedenti hai salvato dati corrotti (es. stringhe invece di numeri, o array invece di oggetti).

### Prevenzione Futura

Ora la validazione impedisce il salvataggio di dati non numerici nella curva.

### La Curva È Globale

Ricorda: la curva è **uguale per tutte le squadre**. Se aggiungi +50 curva, tutte le 19 squadre hanno +50.

---

## 🆘 Se il Problema Persiste

1. Apri console (F12)
2. Scrivi: `console.log('State curva:', state.selCurva)`
3. Mandami screenshot della console
4. Scrivi anche: `console.log('localStorage curva:', localStorage.getItem('curva_G1'))`

---

**Deploy Status**: 🚀 IN CORSO  
**URL**: https://fanta-athletic.web.app/

**Testa subito dopo il deploy!**
