# 🔓 SBLOCCO FORMAZIONI - ISTRUZIONI

**Data**: 21 Ottobre 2025, ore 20:05  
**Obiettivo**: Permettere a tutti gli utenti di inserire formazioni fino alle 21:15

---

## ⚡ METODO VELOCE (CONSIGLIATO)

### 1. Vai alla pagina di sblocco temporaneo
```
https://fanta-athletic.web.app/sblocca-formazioni-temp.html
```

### 2. Login come Admin

### 3. Seleziona Giornata
- Scegli la giornata da sbloccare (es. Giornata 1)

### 4. Click "🔓 Sblocca fino alle 21:15"

### 5. Conferma
✅ La deadline è ora impostata alle **21:15 di OGGI**

---

## 📊 COSA SUCCEDE

**Prima dello sblocco**:
```
Deadline: [data precedente]
Stato: Scaduta/Bloccata
Utenti: Non possono modificare formazioni
```

**Dopo lo sblocco**:
```
Deadline: OGGI alle 21:15
Stato: Aperta
Utenti: Possono inserire/modificare formazioni
```

**Alle 21:15**:
```
Deadline: Scaduta automaticamente
Stato: Bloccata
Utenti: Non possono più modificare
```

---

## 👥 CHI PUÒ INSERIRE FORMAZIONI

Dopo lo sblocco, possono inserire formazioni:

✅ **Utenti assegnati a una squadra**
- Tutti i membri di: Rossi, Blu, Verdi, Gialli, etc.

✅ **Admin**
- Sempre abilitati

❌ **Utenti NON in squadra**
- Devono prima essere assegnati (admin.html → Squadre)

---

## 🔧 METODO ALTERNATIVO (Manuale)

Se preferisci usare la pagina admin standard:

### 1. Vai su Admin Deadline
```
https://fanta-athletic.web.app/admin-deadline.html
```

### 2. Seleziona Giornata
- Dropdown: scegli giornata

### 3. Imposta Data e Ora
- **Data**: Oggi (21/10/2025)
- **Ora**: 21:15

### 4. Salva Deadline
- Click "💾 Salva Deadline"

---

## ⏰ PRESET RAPIDI

Sulla pagina admin-deadline.html trovi preset:

- **🌅 Domani 15:00** → Domenica classica
- **🌆 Stasera 21:00** → Aperitivo
- **🌙 Domani 00:00** → Mezzanotte
- **⏰ +2 ore** → Estensione rapida
- **⏰ +24 ore** → Giorno in più

---

## 📱 NOTIFICA UTENTI

Dopo lo sblocco, invia messaggio al gruppo:

```
🔓 *FORMAZIONI SBLOCCATE*

⏰ Potete inserire/modificare le formazioni fino alle *21:15 di STASERA*

🏃‍♂️ Affrettatevi!

🔗 https://fanta-athletic.web.app/matchday.html
```

---

## 🔍 VERIFICA SBLOCCO

Per verificare che lo sblocco sia andato a buon fine:

### 1. Apri Console Browser (F12)
```
https://fanta-athletic.web.app/matchday.html
```

### 2. Controlla Console
Dovresti vedere:
```
✅ Deadline: 21/10/2025 21:15
✅ Formazioni: APERTE
```

### 3. Test con User Normale
- Apri finestra incognito
- Login come user normale (non admin)
- Vai su matchday.html
- Verifica che può selezionare giocatori

---

## 🚨 TROUBLESHOOTING

### "Non vedo la pagina sblocca-formazioni-temp"
**Soluzione**: Deploy in corso, aspetta 2 minuti e ricarica.

### "Dice che non sono admin"
**Soluzione**: 
1. Verifica di essere loggato
2. Controlla di essere in Firestore: `admins/{uid}` exists
3. Se no, aggiungi manualmente in Firestore Console

### "User dice che non può modificare formazione"
**Causa 1**: User non è in una squadra
- **Fix**: admin.html → Squadre → Assegna user

**Causa 2**: Cache browser vecchia
- **Fix**: Clear cache, ricarica pagina

**Causa 3**: Deadline non aggiornata
- **Fix**: Verifica in admin-deadline.html che deadline sia corretta

### "Formazioni bloccate prima delle 21:15"
**Causa**: Orario server diverso da orario locale

**Fix**: Controlla orario esatto in admin-deadline.html
- Deve mostrare: "21:15" non "19:15" o altro

---

## 📊 SCHEMA FIRESTORE

La deadline viene salvata in:

```
/leagues/{leagueId}/deadlines/giornata_1
{
  giornata: 1,
  deadline: Timestamp(2025-10-21T21:15:00),
  createdBy: "admin_uid",
  createdAt: Timestamp,
  note: "Sbloccato temporaneamente fino alle 21:15"
}
```

---

## 🔄 DOPO LE 21:15

### Opzione 1: Lascia Scadere
- Alle 21:15 formazioni si bloccano automaticamente
- Nessuna azione richiesta

### Opzione 2: Estendi Ancora
- Se serve più tempo, vai su sblocca-formazioni-temp.html
- Imposta nuova deadline (es. 22:00)

### Opzione 3: Blocca Subito
- admin-deadline.html
- Imposta deadline nel passato
- Oppure: Click "🗑️ Rimuovi Deadline"

---

## 💡 TIPS

### Per Emergenze Deadline
Crea shortcut desktop/mobile per:
```
https://fanta-athletic.web.app/sblocca-formazioni-temp.html
```

### Deadline Standard
Per le prossime giornate, usa preset:
- Domenica 15:00 (kickoff)
- Sabato 20:45 (anticipo)
- Lunedì 20:45 (posticipo)

### Notifiche Automatiche
Futura feature: notifica automatica a -1h dalla deadline

---

## 📞 DOMANDE FREQUENTI

**Q: Posso sbloccare più giornate insieme?**  
A: Sì, ripeti il processo per ogni giornata.

**Q: Cosa succede se sblocco giornata già giocata?**  
A: Gli utenti possono modificare, ma non cambia i risultati già calcolati.

**Q: Deadline vale per tutti o solo alcuni?**  
A: Vale per tutti (utenti in squadra + admin).

**Q: Posso impostare deadline diverse per squadre diverse?**  
A: No, deadline è unica per tutta la lega.

**Q: Cosa succede se utente modifica dopo deadline?**  
A: Non può, il sistema blocca automaticamente.

---

## ✅ CHECKLIST RAPIDA

Prima di comunicare agli utenti:

- [ ] Deadline impostata correttamente (21:15 oggi)
- [ ] Verificato su admin-deadline.html
- [ ] Testato con user test (finestra incognito)
- [ ] Tutti gli utenti assegnati a squadre
- [ ] Messaggio WhatsApp pronto
- [ ] Monitoraggio fino alle 21:15

---

## 🎯 RIASSUNTO VELOCE

```
1. VAI: https://fanta-athletic.web.app/sblocca-formazioni-temp.html
2. Login Admin
3. Seleziona Giornata
4. Click "Sblocca fino alle 21:15"
5. Invia messaggio WhatsApp agli utenti
6. Monitora fino alle 21:15
7. Fine! ✅
```

**Tempo totale**: 2 minuti ⏱️
