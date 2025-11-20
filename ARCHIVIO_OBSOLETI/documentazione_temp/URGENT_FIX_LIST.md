# 🚨 URGENT FIX LIST - 24 OTTOBRE PM

## ❌ PROBLEMI CRITICI DA SCREENSHOT

### 1. Dashboard PC - RIMUOVERE ❌
- **Problema**: Dati duplicati (Classifica G1 x2, Top Giocatori x2)
- **Soluzione**: RIMUOVERE dashboard-widgets.js, lasciare SOLO classifiche
- **Screenshot**: Immagine 2

### 2. Classifiche Non Caricano
- **Problema**: "Caricamento..." infinito, poi 5 team dopo 5 minuti
- **Causa**: Query lente o cache vecchia
- **Fix**: Ottimizzare query, cache aggressiva

### 3. Matchday Mobile - Spazio Orizzontale ❌
- **Problema**: Non usa tutto lo spazio, bottoni Salva/Reset invisibili
- **Soluzione**: Full-width, bottoni admin visibili
- **Screenshot**: Immagine 3

### 4. Matchday Auto-Select Giornata ❌
- **Problema**: Mostra G1 (calcolata), dovrebbe mostrare G2
- **Soluzione**: Auto-select prima giornata NON calcolata

### 5. Formazioni Mobile Layout Rotto ❌
- **Problema**: Foto e nome sovrapposti
- **Soluzione**: Foto SOPRA nome, rimovere contorno grigio
- **Screenshot**: Immagine 4

### 6. Admin Panel Mobile - Navbar Scompare ❌
- **Problema**: No navbar, no hamburger menu
- **Soluzione**: Mantenere navbar uniforme mobile/desktop

### 7. Selettore Lega Non Funziona ❌
- **Problema**: Dropdown non si apre né da mobile né da PC
- **Soluzione**: Fix event listeners

### 8. "La Mia Squadra" → Nome Reale ❌
- **Problema**: Dice "La mia squadra" invece del nome
- **Soluzione**: Caricare nome team da Firestore

### 9. Bottone "Invita Amici" Non Funziona ❌
- **Problema**: Click non fa nulla
- **Soluzione**: Implementare modal invito

### 10. Cache Lenta ❌
- **Problema**: Deploy non aggiorna velocemente
- **Soluzione**: Cache più aggressiva, service worker

## ⚡ PIANO D'AZIONE

### FASE 1: SEMPLIFICAZIONE (30 min)
1. ❌ Rimuovere dashboard-widgets.js completamente
2. ✅ Lasciare SOLO classifiche-preview.js
3. ✅ Index.html: layout semplice 1 colonna centrale

### FASE 2: MATCHDAY MOBILE (30 min)
1. ✅ Full-width dettaglio giocatore
2. ✅ Bottoni Salva/Reset giornata visibili per admin
3. ✅ Auto-select giornata NON calcolata

### FASE 3: FORMAZIONI MOBILE (20 min)
1. ✅ Foto SOPRA nome (layout verticale)
2. ✅ Rimuovere contorno grigio slots
3. ✅ Aumentare dimensioni slot se necessario

### FASE 4: ADMIN PANEL MOBILE (15 min)
1. ✅ Fix navbar sempre visibile
2. ✅ Hamburger menu funzionante

### FASE 5: FIXES VARI (30 min)
1. ✅ Selettore lega event listeners
2. ✅ Nome squadra reale
3. ✅ Cache aggressiva sw.js

### FASE 6: DEPLOY E TEST (15 min)
1. ✅ Deploy hosting
2. ✅ Test mobile/desktop
3. ✅ Verifiche finali

**Tempo totale**: ~2h 30min
**Priorità**: ALTA
**Breaking**: ACCETTABILE (semplificazione)
