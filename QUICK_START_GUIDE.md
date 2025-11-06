# 🚀 QUICK START GUIDE - FANTA ATHLETIC

## ✅ TUTTO PRONTO - COSA FARE ORA

### **1. TEST NOTIFICHE** (5 min)
1. Apri https://fanta-athletic.web.app/bacheca.html
2. Pubblica un post
3. Da altro account: metti reazione 🔥
4. Controlla campanella 🔔 in alto a destra
5. Verifica notifica "X ha reagito al tuo post"

### **2. TEST INVITI** (5 min)
1. Click dropdown lega in alto
2. Click "📤 Invita Amici"
3. Copia codice o link
4. Condividi su WhatsApp
5. Altro utente: usa codice per unirsi

### **3. TEST RECAP GIORNATA** (2 min)
1. Vai su `/recap-giornata.html?g=G1`
2. Vedi classifica giornata con podio
3. Verifica breakdown punti

### **4. TEST MULTI-SPORT** (2 min)
1. Apri `/formazioni-basket.html`
2. Vedi layout 7 slot basket
3. Apri `/formazioni-volley.html`
4. Vedi layout 6 slot volley

---

## 🔧 SETUP NOTIFICHE GIORNATA

Quando calcoli una giornata:
1. Vai su `matchday.html`
2. Inserisci punteggi
3. Click "💾 Salva giornata"
4. **AUTOMATICAMENTE**: tutti membri ricevono notifica
5. Notifica include link a recap

---

## 📱 MOBILE CHECKLIST

- [x] Campanella notifiche visibile
- [x] Popup chiudibile
- [x] Inviti WhatsApp funzionanti
- [x] Landscape tablet OK
- [x] Formazioni responsive

---

## 🏀🏐 MULTI-SPORT NEXT STEPS

### **Per Implementare Backend** (12-15h)
1. Leggi `MULTI_SPORT_IMPLEMENTATION.md`
2. Crea collections `players_basket`, `players_volley`
3. Upload config JSON a Firestore
4. Implementa logica formazioni
5. Implementa calcolo punteggi

### **Per Ora**
- UI già pronta e funzionante
- Regole documentate
- Layout responsive

---

## 🎯 FEATURES ATTIVE

✅ Notifiche social complete
✅ Sistema inviti WhatsApp
✅ Recap giornata con podio
✅ Edit giornata admin
✅ Campanella mobile
✅ Multi-sport UI ready
✅ Landscape tablet
✅ Popup chiudibile

---

## 🆘 TROUBLESHOOTING

**Campanella non visibile mobile?**
- F5 refresh
- Svuota cache
- Verifica login

**Notifiche non arrivano?**
- Check Firestore rules
- Verifica collection `notifications`
- Console log per debug

**Inviti non funzionano?**
- Verifica `inviteCode` in lega
- Check script `league-invite-modal.js` caricato
- F12 console per errori

---

## 📊 ANALYTICS

Monitor queste metriche:
- Notifiche inviate/giorno
- Inviti generati/settimana
- Recap visualizzazioni
- Engagement social

---

**🎉 TUTTO PRONTO! BUON LAVORO!**
