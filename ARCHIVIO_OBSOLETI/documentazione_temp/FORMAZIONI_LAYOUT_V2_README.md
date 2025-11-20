# 🎨 FORMAZIONI LAYOUT V2 - Design Migliorato

## 🎯 Obiettivi

1. **Layout più carino** campo + panchina
2. **Foto giocatori** + nome/cognome
3. **Panchina divisa per ruoli** (Portieri, Difensori, Centrocampisti, Attaccanti)
4. **Coach fisso in angolo** come presenza in campo
5. **Drag & Drop** naturale con foto

---

## 🎨 Nuovo Design

### Campo da Calcio
```
┌────────────────────────────────────────┐
│  ⚽ CAMPO SPORTIVO        🧑‍💼 COACH    │
│                                        │
│          [FOTO]                        │
│         Attaccante                     │
│                                        │
│   [FOTO]         [FOTO]               │
│  Centrocampista Centrocampista         │
│                                        │
│      [FOTO]                            │
│     Difensore                          │
│                                        │
│         [FOTO]                         │
│        Portiere                        │
└────────────────────────────────────────┘
```

### Panchina Divisa per Ruoli
```
┌─── PORTIERI ──────┐
│ [FOTO] [FOTO]     │
│  Nome   Nome      │
└───────────────────┘

┌─── DIFENSORI ─────┐
│ [FOTO] [FOTO] ... │
│  Nome   Nome      │
└───────────────────┘

┌─── CENTROCAMPISTI ┐
│ [FOTO] [FOTO] ... │
│  Nome   Nome      │
└───────────────────┘

┌─── ATTACCANTI ────┐
│ [FOTO] [FOTO] ... │
│  Nome   Nome      │
└───────────────────┘
```

---

## 📝 Implementazione

### Step 1: Foto Giocatori
- Usa Storage Firebase per foto
- Fallback su placeholder colorato
- Formato: 100x100px circular

### Step 2: Campo Visuale
- Background verde erba texture
- Linee campo disegnate con CSS
- Slot posizioni con griglia CSS

### Step 3: Panchina Divisa
- 4 sezioni per ruolo
- Scroll orizzontale per ogni ruolo
- Badge ruolo colorato

### Step 4: Coach Badge
- Fixed position top-right del campo
- Foto circular con nome
- Sempre visibile

---

## 🚀 TODO

- [ ] Migrare foto da Firestore a Storage
- [ ] Implementare nuovo layout campo
- [ ] Dividere panchina per ruoli
- [ ] Aggiungere coach badge fisso
- [ ] Test drag & drop con foto
- [ ] Mobile responsive

---

Modifiche saranno applicate in formazioni-v2.html (test) prima di sostituire formazioni.html
