# TODO - Fix Richiesti

## ✅ COMPLETATI:
1. **Firestore Permissions Bacheca** - Regole aggiunte per posts
2. **Home Card 5+5** - Grid 5 colonne, simmetriche
3. **Pulsante Accedi Trasparente** - Sfondo rgba, non bianco
4. **Redirect se loggato** - auth.html redirect a index se già loggato
5. **Statistiche filtri dark** - Sfondo card invece di bianco
6. **Doppio logo navbar** - Logo sinistro + destro (desktop)

## 🔄 IN CORSO:
1. **Navbar uniforme** - Applicare navbar.js a TUTTE le pagine
2. **Tema scuro persistente** - Matchday, Formazioni, altre pagine
3. **Link "Accedi/Esci"** - Funzionante ovunque

## 📋 DA FARE:

### Formazioni:
- [ ] Navbar colore corretto (gradiente rosso/blu)
- [ ] Pulsante tema scuro visibile
- [ ] Nomi giocatori in bianco (dark mode)
- [ ] Pulsanti più scuri (dark mode)
- [ ] "Incompleta" align-right nella lista squadre
- [ ] Evidenziare pulsanti salvataggio on hover
- [ ] Rimuovere contorno rosso

### Classifica:
- [x] Note spiegate: "calcolata localmente" = dati nel browser
- [ ] Navbar completa con tutte le card

### Giocatori:
- [ ] Rimuovere funzione aggiunta punteggi (solo da matchday)
- [ ] Navbar completa

### Matchday:
- [ ] Mantenere tema scuro
- [ ] Navbar completa

### Profilo:
- [ ] Fix errore caricamento
- [ ] Layout più largo (meno verticale)
- [ ] Conferma eliminazione account con password

### Asta:
- [ ] Spiegare meccanismo
- [ ] Navbar completa

### Allenatori:
- [ ] 3 riquadri grandi con foto + nome
- [ ] Bio al click
- [ ] Tab admin per modificare elementi

### Generale:
- [ ] Tab admin per modificare: Curva, Allenatori, Squadre, Regole
- [ ] Navbar accessibile a tutto il sito
- [ ] Restrizioni per non-admin

## 📝 Note Classifica:
"Questa classifica è calcolata localmente leggendo i salvataggi in questo browser"
= I dati sono salvati nel localStorage del browser, non ancora sincronizzati con Firestore.
L'assegnazione alle squadre verrà aggiunta quando implementeremo il sistema di squadre completo.
