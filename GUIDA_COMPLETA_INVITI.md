# 🎯 GUIDA COMPLETA SISTEMA INVITI

## 📋 COME FUNZIONA

### 1️⃣ Admin Lega → Invito Lega
**Chi**: Admin/Creatore lega  
**Cosa**: Manda link invito alla lega

**Step**:
1. Admin crea lega
2. Ottiene **CODICE LEGA** (es: `AB12CD`)
3. Condivide link: `https://fanta-athletic.web.app/?join=AB12CD`

**Risultato**: Utente entra nella lega come **MEMBRO**

---

### 2️⃣ Primo Allenatore → Assegnazione Squadra
**Chi**: Admin lega  
**Cosa**: Assegna squadra a un membro

**Step**:
1. Admin → Gestione Squadre
2. Click su squadra
3. Assegna "Allenatore Principale" a un utente
4. Utente diventa **HEAD COACH** della squadra

---

### 3️⃣ Head Coach → Invito Vice-Allenatori
**Chi**: Allenatore Principale  
**Cosa**: Invita vice-allenatori alla sua squadra

**Step**:
1. Head coach va sulla sua squadra
2. Sezione "👥 Invita Vice"
3. Click "Genera Codice Invito"
4. Ottiene **CODICE SQUADRA** (es: `T-XY12AB`)
5. Condivide link: `https://fanta-athletic.web.app/join-team.html?code=T-XY12AB`

**Risultato**: Utente entra nella squadra come **ASSISTANT COACH**

---

## 🔑 DIFFERENZE CODICI

### Codice Lega (6 caratteri)
- **Formato**: `AB12CD`
- **Uso**: Unirsi alla lega come membro
- **Crea Admin**: No, solo membro
- **Link**: `/?join=AB12CD`

### Codice Squadra (8 caratteri)
- **Formato**: `T-XY12AB`
- **Uso**: Unirsi a una squadra specifica
- **Ruolo**: Assistant Coach
- **Link**: `/join-team.html?code=T-XY12AB`
- **Scadenza**: 7 giorni

---

## 👥 RUOLI SISTEMA

### Super Admin (Globale)
- Vede tutte le leghe
- Gestisce tutto
- Hardcoded in Firestore rules

### League Admin
- Gestisce una lega specifica
- Assegna squadre
- Configura regole lega

### Head Coach (Allenatore Principale)
- Gestisce 1 squadra
- Può invitare vice-allenatori
- Imposta formazione
- Gestisce rosa

### Assistant Coach (Vice-Allenatore)
- Aiuta a gestire squadra
- Può modificare formazione
- NO inviti (solo head coach)

### Member (Membro Lega)
- Fa parte della lega
- Non ha squadra assegnata
- Può solo visualizzare

---

## 🚀 FLUSSO COMPLETO

```
1. ADMIN CREA LEGA
   ↓
2. Genera CODICE LEGA (AB12CD)
   ↓
3. Condivide link agli utenti
   ↓
4. UTENTI SI REGISTRANO
   - Click link → Auto-join lega
   - Diventano MEMBRI
   ↓
5. ADMIN ASSEGNA SQUADRE
   - User A → Squadra 1 (Head Coach)
   - User B → Squadra 2 (Head Coach)
   ↓
6. HEAD COACH INVITA VICE
   - Genera T-XY12AB
   - Condivide a User C
   ↓
7. USER C DIVENTA ASSISTANT
   - Click link → Join squadra
   - Può modificare formazione
```

---

## 📄 FILE IMPLEMENTATI

### 1. `resources/team-invite-system.js`
**Funzioni**:
- `createTeamInvite()` - Crea invito squadra
- `useTeamInvite()` - Usa codice invito
- `renderInviteUI()` - UI per inviti

### 2. `join-team.html`
**Cosa fa**:
- Pagina di landing per inviti squadra
- Auto-fill codice da URL
- Verifica e join automatico

### 3. Firestore Collection `teamInvites`
```javascript
{
  code: "T-XY12AB",
  leagueId: "...",
  teamId: "...",
  role: "assistant",
  createdBy: "uid...",
  status: "active", // active|used|expired
  expiresAt: Timestamp,
  usedBy: null
}
```

---

## 🔧 INTEGRAZIONE

### In squadre.html
Aggiungi sezione inviti per head coach:

```html
<div id="inviteSection"></div>

<script>
// Se utente è head coach
if (isHeadCoach) {
  TeamInviteSystem.renderInviteUI(
    document.getElementById('inviteSection'),
    leagueId,
    teamId,
    teamName
  );
}
</script>
```

---

## ⚠️ NOTE IMPORTANTI

1. **Un utente = Un ruolo per squadra**
   - Non puoi essere head coach di 2 squadre nella stessa lega
   - Puoi essere assistant in più squadre

2. **Inviti scadono dopo 7 giorni**
   - Status diventa "expired"
   - Codice non riutilizzabile

3. **Solo head coach può invitare**
   - Assistant non possono creare inviti
   - Solo per la propria squadra

4. **Auto-join lega**
   - Usando codice squadra, entri automaticamente nella lega
   - Non serve prima unirsi alla lega

---

## 📊 TESTING

### Test 1: Invito Squadra
1. Login come head coach
2. Vai su squadre.html
3. Genera codice
4. Apri link in incognito
5. Verifica join funziona

### Test 2: Scadenza
1. Crea invito
2. Modifica `expiresAt` in Firestore (passato)
3. Prova a usare → Errore "Scaduto"

### Test 3: Codice Usato
1. Usa codice una volta
2. Status → "used"
3. Riprova stesso codice → Errore

---

## 💡 IDEE FUTURE

- [ ] **Email automatiche** via SendGrid
- [ ] **Notifiche push** quando invited
- [ ] **Dashboard inviti** per vedere chi ha accettato
- [ ] **Revoca inviti** prima dell'uso
- [ ] **Ruoli personalizzati** (oltre head/assistant)

---

**Sistema pronto! Testa e fammi sapere! 🚀**
