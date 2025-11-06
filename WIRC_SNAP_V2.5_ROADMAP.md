# 🎮 WIRC SNAP V2.5 - ROADMAP COMPLETA

**Status**: 🔄 IN SVILUPPO  
**Versione attuale live**: v2 (con fix login)  
**Target**: v2.5 completa domani mattina

---

## ✅ DEPLOY #63 - FIX LOGIN (FATTO ORA)

### Problema Risolto
- Firebase config errata (API keys fake)
- Login non funzionava

### Fix Applicato
```javascript
// Config corretta da firebase-config.js
apiKey: "AIzaSyDnQMuPvx_Gr8VjBJf_Hrx39O8w2dm67co"
projectId: "fanta-athletic"
storageBucket: "fanta-athletic.firebasestorage.app"
messagingSenderId: "845950461193"
appId: "1:845950461193:web:04475bb0eaa2dc459a9fd8"
```

### Ora Funziona
- ✅ Login/Logout
- ✅ Profilo Firebase sync
- ✅ Firestore collection `wirc_snap_users`

---

## 🎯 V2.5 - OBIETTIVI COMPLETI

### 1. Layout Orizzontale ⏳
**Prima (v2)**: 3 location verticali
**Target (v2.5)**: 3 campi orizzontali affiancati

```css
.battlefield {
  display: flex; /* ←  NO GRID! */
  gap: 8px;
  overflow-x: auto;
}
.location {
  min-width: 220px;
  flex: 1;
}
```

### 2. Sistema Categorie ⏳
**Categorie principali**:
1. **Blortz** - Uomini del Circolo (+1 Forza reciproco)
2. **Bratz** - Donne del Circolo (+2 Forza se 2+)
3. **Relaxati** - Chill (+1 Forza/turno)
4. **Atleti** - Sportivi (+2 in Palestra)
5. **Creativi** - Artisti (Raddoppiano effetti)
6. **Politici** - Disattivano effetti nemici
7. **Festaioli** - Bevitori (+1/turno nel Bar)
8. **Tecnologici** - Smanettoni (+2 dopo Tech)

### 3. Carte con Categorie ⏳
```javascript
{
  nome: "Fracks",
  costo: 4,
  forza: 6,
  emoji: "👔",
  categorie: ["Blortz", "Politico"], // ← MULTIPLO!
  effetto: {
    tipo: "Continuo",
    desc: "+1 Forza per ogni altro Blortz in campo"
  }
}
```

### 4. Campi con Bonus Categorie ⏳
```javascript
{
  nome: "Bar",
  effetto: "Festaioli +1 ogni turno",
  bonusCategorie: ["Festaiolo"],
  bonusValore: 1
}
```

### 5. Effetti per Categoria ⏳
```javascript
function applyCardEffect(card, campo) {
  // Continuo: Blortz +1 per ogni altro Blortz
  if (card.categorie.includes("Blortz")) {
    const altriBlort

z = contaCategoria("Blortz", campo) - 1;
    card.forzaAttuale += altriB lortz;
  }
  
  // Campo: Festaioli in Bar
  if (card.categorie.includes("Festaiolo") && campo.nome === "Bar") {
    card.forzaAttuale += 1;
  }
}
```

### 6. Modal Carta Dettagliata ✅ (già fatto)
- Right-click carta → zoom grande
- Mostra: emoji, nome, costo, forza, **categorie**, effetto
- Leggibile (80px emoji, 28px nome)

### 7. Carte Leggibili ✅ (già fatto +25%)
- Min 120x160px
- Emoji 40px → 48px
- Nome 11px → 13px
- Categorie visibili sotto nome

### 8. Collezione Completa ⏳
- Grid tutte 42 carte
- Filtri per categoria
- Click = aggiungi a deck

### 9. Negozio Funzionante ⏳
- 6 carte casuali in vendita
- Prezzo in 🪙 Oro (50-200)
- Click = acquista se hai oro
- Refresh ogni giorno

### 10. Deck Builder ⏳
- Selezione 12 carte
- Drag & drop (opzionale)
- Click add/remove
- Salva su Firestore
- Validazione: no duplicati, max 12

### 11. Sistema Valute ✅ (base fatto)
- 💎 Crediti (upgrade estetici)
- 🪙 Oro (acquisto carte)
- XP e Livelli

### 12. IA Migliorata ⏳
**Prima**: Gioca carta random campo random
**Target**: 
- Valuta forza totale per campo
- Gioca dove è più debole
- Usa carte costo-efficaci
- Rispetta sinergie categorie

---

## 📋 STRUTTURA FIRESTORE

### Collection: `wirc_snap_users`
```javascript
{
  uid: {
    oro: 200,
    crediti: 500,
    xp: 0,
    level: 1,
    cartePossedute: ["Fracks", "Tommy", ...],
    mazzoAttivo: ["Fracks", ...], // 12 carte
    statistiche: {
      partiteGiocate: 0,
      vittorie: 0,
      sconfitte: 0
    },
    createdAt: timestamp,
    lastSeen: timestamp
  }
}
```

### Security Rules (da aggiungere)
```javascript
match /wirc_snap_users/{uid} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == uid;
}
```

---

## 🎨 UI/UX IMPROVEMENTS V2.5

### Layout Desktop (>768px)
```css
@media (min-width: 768px) {
  .battlefield {
    max-width: 900px;
    margin: 0 auto;
  }
  .location {
    min-width: 280px;
  }
  .card {
    min-height: 140px;
  }
}
```

### Animazioni Effetti
- Glow quando attiva sinnergia
- Shake quando subisce danno
- Bounce quando pesca carta
- Pulse quando giocabile

### Log Battaglia
```html
<div class="battle-log">
  <div class="log-entry">🎴 Giocata Fracks in Sala Grande</div>
  <div class="log-entry">✨ Blortz +1 Forza (Sinergia!)</div>
</div>
```

---

## 🧪 TESTING CHECKLIST

### Gameplay
- [ ] 3 campi orizzontali responsive
- [ ] Categorie applicate correttamente
- [ ] Effetti Continuo funzionanti
- [ ] Effetti Scoperta funzionanti
- [ ] Effetti Campo attivi
- [ ] IA gioca intelligente
- [ ] Score calculation accurato
- [ ] Win/lose corretto

### Collezione
- [ ] Tutte 42 carte visibili
- [ ] Filtri categorie
- [ ] Modal dettaglio
- [ ] Owned/Not owned distinction

### Negozio
- [ ] 6 carte random
- [ ] Prezzi variabili
- [ ] Acquisto funziona
- [ ] Oro aggiornato
- [ ] Non può comprare duplicati

### Deck Builder
- [ ] Max 12 carte
- [ ] Add/remove funziona
- [ ] Save su Firestore
- [ ] Load al login
- [ ] Validation corretta

### Firebase
- [ ] Login funziona
- [ ] Profilo carica
- [ ] Save automatico
- [ ] Logout pulisce stato

---

## 📊 CARTA DATABASE COMPLETO (42 carte)

### Blortz (10 carte)
1. Fracks - 4 cost, 6 forza, +1 per Blortz
2. Dux - 2 cost, 3 forza, +2 se dopo Blortz
3. Paolino - 1 cost, 1 forza, Pesca carta
4. Momo - 3 cost, 5 forza, +1 se Bratz presenti
5. Pato - 4 cost, 4 forza, Copia effetto Blortz random
6. Gian - 2 cost, 2 forza, +1 per turno
7. Salvo - 3 cost, 4 forza, Disattiva location nemica
8. Marco - 1 cost, 2 forza, Ruba 1 forza
9. Roby - 5 cost, 7 forza, +2 se altri Blortz
10. Ale - 2 cost, 3 forza, +1 Continuo

### Bratz (8 carte)
11. Sissi - 4 cost, 5 forza, +2 se 2+ Bratz
12. Eli - 3 cost, 4 forza, +1 per Bratz
13. Sara - 2 cost, 3 forza, Pesca se Bratz
14. Marta - 1 cost, 1 forza, +1/turno
15. Chiara - 3 cost, 3 forza, +2 Scoperta
16. Giuli - 4 cost, 6 forza, Doppio con Blortz
17. Vale - 2 cost, 2 forza, Disattiva effetto
18. Fede - 5 cost, 8 forza, -1 costo con Bratz

### Relaxati (6 carte)
19. Bosi - 2 cost, 3 forza, +1/turno
20. Toti - 3 cost, 4 forza, +1 Continuo
21. Gigio - 1 cost, 2 forza, +1 se Chiringuito
22. Cicci - 4 cost, 5 forza, +2 fine turno
23. Vitto - 2 cost, 3 forza, Rigenera 1 energia
24. Bibe - 3 cost, 4 forza, +1/turno Relaxati

### Atleti (6 carte)
25. Tommy - 5 cost, 8 forza, +2 con Atleti
26. Filo - 4 cost, 6 forza, +2 in Palestra
27. Mich - 3 cost, 5 forza, +1 per Atleta
28. Pippo - 2 cost, 3 forza, +1 se giochi dopo
29. Luca - 3 cost, 4 forza, Doppio in Doccia
30. Samu - 1 cost, 2 forza, +1 Continuo

### Creativi (4 carte)
31. Fede - 4 cost, 5 forza, Raddoppia Scoperta
32. Nico - 3 cost, 3 forza, +2 in Veranda
33. Mauri - 2 cost, 2 forza, Copia effetto
34. Dani - 1 cost, 1 forza, Pesca carta

### Politici (4 carte)
35. Chep - 3 cost, 2 forza, Disattiva effetto
36. Giova - 4 cost, 4 forza, +2 in Sala Carte
37. Dome - 2 cost, 3 forza, -1 Forza nemica
38. Fabri - 3 cost, 5 forza, Rimuovi effetto

### Festaioli (3 carte)
39. Pippo - 2 cost, 3 forza, +1 nel Bar
40. Ste - 3 cost, 4 forza, +1/turno Festaioli
41. Filo - 1 cost, 2 forza, +2 dopo Festaiolo

### Hybrid (1 carta speciale)
42. WIRC - 6 cost, 10 forza, Tutte categorie, Tutti effetti attivi

---

## 🏟️ CAMPI DATABASE (12 locations)

1. **Bar** - Festaioli +1/turno
2. **Sala Grande** - Forza 6+ ottiene +3
3. **Palestra** - Atleti +2 Forza
4. **Veranda** - Creativi raddoppiano effetti
5. **Chiringuito** - Relaxati +1 fine turno
6. **Sala Carte** - Politici +2 Forza
7. **Doccia** - Atleti +1 Forza
8. **Cucina** - Prima carta costa -1
9. **Camera** - Ultima carta costa 0
10. **Giardino** - Blortz e Bratz +1
11. **Bagno** - Scarta 1 per +3 Forza
12. **Tetto** - Chi ha più carte vince +5

---

## ⏱️ TIMELINE SVILUPPO

### Stanotte (Deploy #63) ✅
- Fix login Firebase
- Config corretta
- Profilo sync funzionante

### Domani Mattina (9am-12pm) - v2.5 ALPHA
- [ ] Layout orizzontale
- [ ] Database 42 carte con categorie
- [ ] 12 campi con bonus
- [ ] Sistema effetti base
- [ ] IA migliorata

### Domani Pomeriggio (2pm-4pm) - v2.5 BETA
- [ ] Negozio funzionante
- [ ] Deck builder completo
- [ ] Collezione con filtri
- [ ] Save/Load Firestore

### Domani Sera (8pm-10pm) - v2.5 RELEASE
- [ ] Animazioni effetti
- [ ] Log battaglia
- [ ] Tutorial popup
- [ ] Testing completo
- [ ] Deploy finale

---

## 🚀 DEPLOY FINALE v2.5

### Features Complete
- ✅ 3 campi orizzontali
- ✅ 42 carte con categorie
- ✅ 12 locations
- ✅ Effetti sinergie
- ✅ IA intelligente
- ✅ Negozio
- ✅ Deck builder
- ✅ Collezione
- ✅ Firebase integration
- ✅ Responsive mobile-first
- ✅ Animazioni
- ✅ Modal dettagli
- ✅ Log battaglia

### URL
```
https://fanta-athletic.web.app/wirc-snap-v2.5.html
```

---

## 💤 STOP STANOTTE

**Deploy #63**: ✅ Login fixato  
**V2 funzionante**: ✅ Live  
**V2.5 prep**: ✅ File creato, roadmap completa

**Domani mattina**: Implemento tutto v2.5! 🚀

---

**SERATA TOTALE: 16 DEPLOY!** (#48-63) 🏆  
**Tempo: 2h 30min** ⏱️
