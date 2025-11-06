# 🎴 WIRC BATCH CARD MAKER - GUIDA COMPLETA

## ✅ COSA HO FATTO

### 1️⃣ JSON CARTE AGGIORNATO
**File**: `data/wirc-snap-cards-full.json`

**Modifiche**:
- ✅ **Gabri → Panizzo** (come richiesto)
- ✅ **+9 nuovi personaggi** aggiunti

**Nuovi Personaggi**:
1. **Pippo Colza** (3/5) - Pugile
   - ON REVEAL: Distrugge carta nemica ≤3 forza, se riesce +2 forza permanenti

2. **Gorgonzola Boys** (5/7) - Trio Chep+Trendiu+Santo
   - ON REVEAL: Duplica effetto prossima carta + +1 energia prossimo turno

3. **Shorty** (2/3) - Tipa di Trendiu
   - ONGOING: Se Trendiu in campo, entrambi +2 forza

4. **Tino** (1/2) - Cane di Meme
   - ONGOING: Se Meme in campo +2, se con Nilo +1 a tutte le carte

5. **Nilo** (1/2) - Cane di Flondi (fratello Tino)
   - ONGOING: Se Flondi in campo +2, se con Tino +1 a tutte le carte

6. **Mini Blortz** (4/8) - Quartetto Wuenji+Mini Boro+Beppe+Pato
   - ON REVEAL: Gioca copie 1/1 dei 4 personaggi in campi casuali

7. **Tommy Lachangas** (3/4)
   - ON REVEAL: Scambia forza di due carte alleate

8. **Giuditta** (2/3)
   - ON REVEAL: Rivela 2 carte casuali mano avversaria

9. **Lisa** (3/4)
   - ONGOING: +1 forza a tutte le carte femminili

**Totale Carte**: 67 → **76 personaggi**

---

## 🚀 TOOL BATCH CARD MAKER

**File Creato**: `wirc-batch-card-maker.html`

### Features ⚡
- ✅ **Upload multiplo**: Seleziona tutte le PNG in una volta
- ✅ **Auto-match**: Riconosce automaticamente personaggi dal nome file
- ✅ **Batch processing**: Genera tutte le carte automaticamente
- ✅ **Progress bar**: Vedi avanzamento in tempo reale
- ✅ **Log dettagliato**: Ogni carta processata viene loggata
- ✅ **Preview grid**: Vedi tutte le carte generate
- ✅ **Download ZIP**: Scarica tutte in un archivio
- ✅ **Toggle effetto**: Scegli se mostrare/nascondere effetto
- ✅ **Smart naming**: Riconosce nomi con spazi, underscore, caratteri speciali

---

## 📋 COME USARE IL TOOL

### Step 1: Apri Tool
```
https://fanta-athletic.web.app/wirc-batch-card-maker.html
```

### Step 2: Seleziona Immagini
1. Click su "Seleziona Immagini"
2. Vai a: `C:\Users\nicol\Desktop\wirk royale\png wirc`
3. Seleziona TUTTE le immagini (Ctrl+A)
4. Click "Apri"

**Risultato**: Vedrai log con match automatici:
```
✓ fracks.png → Fracks (4/6)
✓ tommy lachangas.png → Tommy Lachangas (3/4)
✓ gorgonzola boys.png → Gorgonzola Boys (5/7)
✓ panizzo.png → Panizzo (3/4)
...
```

### Step 3: Configura
- ✅ **Mostra effetto**: Lascia spuntato per carte complete
- ❌ **Mostra effetto**: Togli per carte blank (solo nome/badge)

### Step 4: Genera
1. Click "▶️ Processa Tutte le Carte"
2. Aspetta (circa 30-60 secondi per 46 immagini)
3. Vedi progress bar + log real-time

### Step 5: Download
**Opzione A - Singole**:
- Click su preview carta → Download PNG singola

**Opzione B - Tutte insieme**:
- Click "💾 Download Tutte (ZIP)"
- Ricevi archivio `wirc-cards-batch-[timestamp].zip`

---

## 🎯 MATCHING AUTOMATICO

Il tool riconosce automaticamente questi pattern:

### Nomi Esatti
- `fracks.png` → Fracks
- `nico.png` → Nico
- `meme.png` → Meme

### Nomi con Spazi
- `ale lapi.png` → Ale Lapi
- `pippo bongia.png` → Pippo Bongia
- `mini boro.png` → Mini Boro

### Nomi con Underscore
- `tommy_guardu.png` → Tommy Guardu

### Nomi Speciali (Gestiti)
- `angeòonp.png` → Angelino (typo riconosciuto)
- `g-cazzi.png` → G-Cazzi
- `toti .png` → Toti (spazio extra ignorato)

### Nomi Nuovi
- `pippo colza.png` → Pippo Colza ✅
- `gorgonzola boys.png` → Gorgonzola Boys ✅
- `shorty.png` → Shorty ✅
- `tino.png` → Tino ✅
- `mini blortz.png` → Mini Blortz ✅
- `tommy lachangas.png` → Tommy Lachangas ✅
- `giuditta.png` → Giuditta ✅
- `lisa.png` → Lisa ✅

---

## 📊 IMMAGINI DISPONIBILI

**Dalla cartella** `C:\Users\nicol\Desktop\wirk royale\png wirc`:

```
✅ 46 immagini trovate:

G-Cazzi.png
ale lapi.png
angeòonp.png (→ Angelino)
barta.png
beppe.png
bergit.png
boro.png
bos.png
calo.png
canni.png
chep.png
ciorlas.png
civi.png
dux.png
flondi.png
fracks.png
giabba.png
giova.png
giuditta.png ✨ NUOVO
gorgonzola boys.png ✨ NUOVO
iac.png
lisa.png ✨ NUOVO
marchino.png
marta.png
martina.png
meme.png
mini blortz.png ✨ NUOVO
mini boro.png
momo.png
nico.png
panizzo.png ✨ MODIFICATO (era Gabri)
pino.png
pippo bongia.png
pippo colza.png ✨ NUOVO
robe.png
santo.png
serena.png
shorty.png ✨ NUOVO
thanoisi.png
tino.png ✨ NUOVO
titti.png
tommy lachangas.png ✨ NUOVO
tommy_guardu.png
toti .png
wabione.png
wuenji.png
```

**Mancanti** (non hanno immagine):
- Nilo (cane Flondi) - Da creare
- Il Pres
- Bezza
- Nico Cartonato
- Motore Ducati
- Carena Lucida
- Telaio d'Acciaio
- Ruote Fiammeggianti
- Specchietti dell'Ego
- Benzina da Gorgonzola
- Wabione
- Giabba
- Bos
- Canni
- Chep
- Toti
- Titti
- Barta
- Sbragi
- Andreino
- Lil Swaolino
- Giulietto
- Ciorlas
- Marchino
- Bergit
- Robe
- Zio Sam
- Giulione
- First Lady
- Ida
- Sissi
- Giulia
- Wonia
- Matilde
- Altobelli
- Trendiu
- Pato
- Tapi
- Selli
- Lambo
- Michele
- Andrea
- Cicchino
- Gallo
- Angel Investor
- Vecchio Portiere
- Ultras di Curva
- Ragazzo Nuovo

---

## 🎨 OUTPUT CARTE

### Con Effetto ✅
```
┌─────────────────────┐
│ [🟠3]        [🔵5]   │ ← Badge costo/forza
│                     │
│   [IMMAGINE]        │ ← Foto personaggio
│                     │
│   PIPPO COLZA       │ ← Nome overlay
│                     │
│   ON REVEAL         │ ← Tipo effetto
│ Distrugge carta...  │ ← Testo effetto
└─────────────────────┘
```

### Senza Effetto ❌
```
┌─────────────────────┐
│ [🟠3]        [🔵5]   │
│                     │
│   [IMMAGINE]        │
│                     │
│   PIPPO COLZA       │
│                     │ ← Spazio vuoto
│                     │ ← Per post-edit
└─────────────────────┘
```

---

## 💡 TIPS

### Per Processare Velocemente
1. Seleziona tutte le PNG (Ctrl+A)
2. Spunta "Mostra effetto"
3. Click "Processa"
4. Aspetta 1 minuto
5. Download ZIP

### Per Carte Custom
1. Togli spunta "Mostra effetto"
2. Genera carte blank
3. Aggiungi effetti in Photoshop/Canva

### Per Singole Carte
1. Seleziona solo 1 immagine
2. Processa
3. Click preview per download

---

## 🔧 TROUBLESHOOTING

### ❌ "Nessuna corrispondenza trovata"
**Causa**: Nome file non match con JSON

**Fix**:
1. Rinomina file esattamente come nel JSON
2. O aggiungi personaggio al JSON

### ❌ "Errore caricamento database"
**Causa**: JSON non trovato

**Fix**:
1. Verifica `data/wirc-snap-cards-full.json` esiste
2. F5 refresh pagina

### ⚠️ Preview non carica
**Causa**: Immagine troppo grande

**Fix**:
1. Comprimi PNG con TinyPNG.com
2. Riprova upload

---

## 📦 STRUTTURA OUTPUT

### File Singoli
```
wirc-pippo-colza.png
wirc-gorgonzola-boys.png
wirc-shorty.png
wirc-tino.png
wirc-mini-blortz.png
...
```

### ZIP Archive
```
wirc-cards-batch-1729695847123.zip
├── wirc-pippo-colza.png
├── wirc-gorgonzola-boys.png
├── wirc-shorty.png
├── wirc-tino.png
├── wirc-nilo.png
├── wirc-mini-blortz.png
├── wirc-tommy-lachangas.png
├── wirc-giuditta.png
├── wirc-lisa.png
└── ... (tutte le altre)
```

---

## 🎯 PROSSIMI STEP

### 1. Genera Carte Esistenti
```bash
1. Apri: wirc-batch-card-maker.html
2. Seleziona 46 PNG dalla cartella
3. Processa tutte
4. Download ZIP
```

### 2. Crea Immagini Mancanti
**Per Nilo** (cane):
- Usa AI generator (DALL-E, Midjourney)
- Prompt: "cartoon dog character, friendly, athletic style"
- Salva come `nilo.png`

**Per Componenti Moto**:
- Usa icone/sprite
- O crea placeholder

### 3. Re-Process con Nilo
```bash
1. Aggiungi nilo.png alla cartella
2. Ri-apri tool
3. Seleziona tutte (ora 47)
4. Download ZIP aggiornato
```

---

## 🚀 DEPLOY STATUS

**Cache**: v2025102255  
**Files**: 353 (+1 batch tool)  
**JSON**: 76 personaggi (+9)  
**URL Tool**: https://fanta-athletic.web.app/wirc-batch-card-maker.html

---

## 📝 SUMMARY

✅ **JSON aggiornato**: Gabri→Panizzo + 9 nuovi  
✅ **Tool creato**: Batch processor automatico  
✅ **46 immagini**: Pronte per processamento  
✅ **Auto-match**: Riconosce tutti i nomi  
✅ **ZIP download**: Tutte le carte in 1 click  

**Tempo stimato**: 2 minuti per generare tutte le 46 carte! 🎉

---

**🎴 Ora puoi generare tutte le carte WIRC Snap in batch! 🚀**
