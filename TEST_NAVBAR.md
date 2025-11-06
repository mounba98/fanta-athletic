# 🧪 Test Navbar Refactoring - Guida Rapida

## Come Testare la Nuova Navbar

### 1. Avvia Server Locale
```bash
# Se hai un server locale
firebase serve

# Oppure usa un semplice server HTTP
python -m http.server 8000
# Poi apri: http://localhost:8000
```

---

## 2. Test Desktop

### ✅ Checklist Desktop
- [ ] Apri la webapp su browser desktop (1920x1080)
- [ ] Verifica che tutte le voci navbar siano visibili
- [ ] **Se sei ADMIN**: Dovresti vedere voce "Admin" evidenziata in ORO
- [ ] **Se NON sei admin**: Voce "Admin" NON deve essere visibile
- [ ] Riduci finestra a 1366px di larghezza
- [ ] Verifica che navbar NON abbia overflow orizzontale
- [ ] Le voci devono scalare o ridurre font-size
- [ ] Riduci a 1024px
- [ ] Le voci desktop devono mostrare solo icone (no label)

### Come Diventare Admin (Test)
1. Apri Firebase Console
2. Vai su Firestore Database
3. Crea collezione `admins`
4. Crea documento con ID = tuo User UID
5. Ricarica pagina → dovresti vedere "Admin" nella navbar

---

## 3. Test Tablet

### ✅ Checklist Tablet (768-1024px)
- [ ] Apri DevTools (F12)
- [ ] Attiva responsive mode
- [ ] Seleziona "iPad" (1024x768 landscape)
- [ ] Verifica navbar responsive
- [ ] Link desktop devono mostrare solo icone
- [ ] Link mobile devono mostrare icona + label
- [ ] Ruota in portrait (768x1024)
- [ ] Navbar deve adattarsi senza scroll orizzontale

---

## 4. Test Mobile

### ✅ Checklist Mobile (< 768px)
- [ ] DevTools responsive mode
- [ ] Seleziona "iPhone 13" (390x844)
- [ ] **Link desktop devono essere NASCOSTI**
- [ ] Devono essere visibili SOLO: Formazioni, Classifiche, Bacheca, Profilo
- [ ] Scroll giù nella pagina
- [ ] Navbar deve diventare COMPATTA (solo icone, no label)
- [ ] Logo deve rimpicciolirsi
- [ ] Titolo (h1) deve sparire
- [ ] Icone devono rimanere SEMPRE visibili (NON sparire)

### Test Hamburger Menu (Mobile)
- [ ] Dovresti vedere hamburger button (☰) in alto a sinistra
- [ ] Clicca hamburger → si apre menu laterale
- [ ] Verifica tutte le voci siano visibili
- [ ] **Se sei ADMIN**: Dovresti vedere separatore "AMMINISTRAZIONE" e voce "Admin Panel" evidenziata
- [ ] Chiudi menu (X o tap fuori)
- [ ] Menu deve chiudersi con animazione

---

## 5. Test Funzionalità

### ✅ Test Navigazione
- [ ] Clicca su ogni voce navbar
- [ ] Verifica che carichi pagina corretta
- [ ] Pagina corrente deve essere evidenziata (background bianco semitrasparente)
- [ ] Vai su pagina Admin (se sei admin)
- [ ] Voce Admin deve essere evidenziata in ORO

### ✅ Test Theme Toggle
- [ ] Clicca bottone tema (🌙 o ☀️) in alto a destra
- [ ] Colori devono cambiare (light <-> dark)
- [ ] Navbar deve adattare i colori
- [ ] Icone devono rimanere visibili in entrambi i temi

### ✅ Test Touch (Su Device Reale)
- [ ] Ogni link deve essere facilmente cliccabile (min 44x44px)
- [ ] Nessun link troppo piccolo o difficile da toccare
- [ ] Hamburger menu fluido al tocco
- [ ] Scroll navbar compatta funziona bene

---

## 6. Test Browser Compatibility

### ✅ Browser da Testare
- [ ] **Chrome** (desktop + mobile)
- [ ] **Firefox** (desktop + mobile)
- [ ] **Safari** (desktop + iOS)
- [ ] **Edge** (desktop)

### Problemi Comuni da Verificare
- [ ] Emoji rendering (icone potrebbero apparire diverse)
- [ ] Font-size su Safari iOS (potrebbe auto-scalare)
- [ ] Touch target su iOS (min 44px)
- [ ] Flex gap support (IE11 non supportato, OK)

---

## 7. Test Performance

### ✅ Chrome DevTools Lighthouse
```
1. Apri DevTools (F12)
2. Tab "Lighthouse"
3. Seleziona "Mobile" + "Performance"
4. Run audit
5. Verifica:
   - First Contentful Paint < 1.5s
   - Cumulative Layout Shift (CLS) < 0.1
   - Largest Contentful Paint < 2.5s
```

### ✅ Network
- [ ] Apri tab Network
- [ ] Ricarica pagina
- [ ] Verifica nessuna chiamata Firebase eccessiva per admin check
- [ ] Caching localStorage funziona (seconda visita più veloce)

---

## 8. Test Accessibilità

### ✅ Tastiera
- [ ] Premi Tab ripetutamente
- [ ] Ogni link navbar deve essere raggiungibile
- [ ] Focus visibile (outline o ring)
- [ ] Enter su link funziona
- [ ] Esc chiude mobile menu (da implementare se non funziona)

### ✅ Screen Reader (Opzionale)
- [ ] Attiva screen reader (NVDA/JAWS su Windows, VoiceOver su Mac)
- [ ] Naviga navbar con frecce
- [ ] Deve leggere label di ogni link
- [ ] Voce attiva deve essere annunciata

---

## 9. Risoluzione Problemi

### ❌ Icone non visibili su mobile
**Causa**: CSS non caricato o cache browser
**Fix**: 
- Ctrl+Shift+R (hard reload)
- Svuota cache browser
- Verifica che sheet.css sia caricato (Network tab)

### ❌ Voce Admin non appare
**Causa 1**: Non sei admin su Firebase
**Fix**: Aggiungi il tuo UID alla collezione `admins` su Firestore

**Causa 2**: Firebase non inizializzato
**Fix**: Controlla console errori, verifica firebase-config.js

### ❌ Navbar va in overflow orizzontale
**Causa**: Troppe voci per larghezza disponibile
**Fix**: 
- Verifica media query applicate
- Controlla che `max-height: none` sia presente
- Verifica `flex-wrap: wrap`

### ❌ Link troppo piccoli su mobile
**Causa**: CSS personalizzati che sovrascrivono
**Fix**:
- Verifica che `min-height: 36px` sia applicato
- Controlla `padding: 6px 10px` su mobile
- Ispeziona con DevTools

---

## 10. Segnalazione Bug

### 📝 Template Segnalazione
Quando trovi un bug, annota:

```
**Device**: [es. iPhone 13, Desktop Chrome]
**Risoluzione**: [es. 390x844]
**Browser**: [es. Safari 17]
**Pagina**: [es. index.html]
**Admin**: [Sì/No]

**Problema**: 
[Descrizione del problema]

**Screenshot**: 
[Se possibile]

**Comportamento atteso**:
[Come dovrebbe funzionare]

**Comportamento attuale**:
[Come funziona ora]

**Console errors**:
[Copia errori da console]
```

---

## ✅ Test Completati - Checklist Finale

Una volta completati tutti i test, verifica:

- [ ] ✅ Navbar visibile e funzionale su Desktop
- [ ] ✅ Navbar visibile e funzionale su Tablet (portrait + landscape)
- [ ] ✅ Navbar visibile e funzionale su Mobile
- [ ] ✅ Icone SEMPRE visibili (mai scomparse)
- [ ] ✅ Voce Admin visibile SOLO per admin
- [ ] ✅ Nessun overflow orizzontale su nessun device
- [ ] ✅ Layout responsive fluido su tutti i breakpoints
- [ ] ✅ Theme toggle funzionante
- [ ] ✅ Hamburger menu (mobile) funzionante
- [ ] ✅ Performance accettabile (Lighthouse > 80)
- [ ] ✅ Accessibilità navigazione tastiera

---

## 🎉 Se Tutti i Test Passano

**Congratulazioni!** La navbar è pronta per il deploy in produzione.

### Prossimi Step:
1. ✅ Merge branch su `main`
2. ✅ Deploy su Firebase Hosting
3. ✅ Test su produzione
4. ✅ Iniziare Fase 2: Matchday Refactoring

---

**Documento creato**: 19 Ottobre 2025  
**Autore**: Cascade AI  
**Versione Navbar**: 2025101901
