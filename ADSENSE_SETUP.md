# Setup Google AdSense per Fanta Athletic

## ✅ Soluzioni implementate

### 1. Whitelist Bot Google
- `auth-guard.js` ora rileva automaticamente i bot Google e li lascia passare
- Rileva: Googlebot, AdsBot, Mediapartners-Google
- Rileva anche query params `?adsense` o `?googlebot`

### 2. Pagine Pubbliche
Le seguenti pagine sono ora accessibili senza login:
- `index.html` - Home page
- `store.html` - Store ufficiale
- `adsense-verification.html` - Pagina dedicata per verifica AdSense
- `auth.html`, `privacy.html`, `terms.html` - Già pubbliche

### 3. Pagina Verifica Dedicata
Creata `adsense-verification.html` con:
- Contenuto descrittivo del sito
- Placeholder per banner pubblicitari
- Accessibile pubblicamente

## 📋 Procedura per AdSense

### Step 1: Registrazione
1. Vai su [Google AdSense](https://www.google.com/adsense/)
2. Clicca "Inizia" e inserisci il tuo sito: `fanta-athletic.web.app`
3. Scegli la tua nazione (Italia)

### Step 2: Verifica Sito
Quando AdSense chiede di verificare il sito, puoi:

**Opzione A - Usa la pagina dedicata:**
- Inserisci: `https://fanta-athletic.web.app/adsense-verification.html`
- Questa pagina è completamente pubblica e accessibile

**Opzione B - Usa la home:**
- Inserisci: `https://fanta-athletic.web.app/index.html`
- Ora è pubblica e accessibile

**Opzione C - Test manuale:**
- Apri il sito in modalità incognito
- Dovresti vedere la home senza login
- Se vedi `auth.html`, i bot Google verranno comunque lasciati passare automaticamente

### Step 3: Inserisci Codice Verifica
AdSense ti darà un codice da inserire. Aggiungilo in:
- `index.html` (nel `<head>`) 
- `adsense-verification.html` (nel `<head>`)

### Step 4: Aggiungi Codice AdSense
Una volta approvato, aggiungi il codice AdSense negli slot:

**Banner Desktop (160×600):**
```html
<!-- In index.html, sostituisci .ad-slot con: -->
<div class="ad-slot">
  <ins class="adsbygoogle"
       style="display:inline-block;width:160px;height:600px"
       data-ad-client="ca-pub-XXXXXXXXXX"
       data-ad-slot="XXXXXXXXXX"></ins>
  <script>
     (adsbygoogle = window.adsbygoogle || []).push({});
  </script>
</div>
```

**Banner Header (728×90):**
```html
<!-- Aggiungi in header o dopo navbar -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## 🔧 Test

### Test Bot Google
Apri la console e naviga con:
```
?adsense=1
?googlebot=1
```
Dovresti vedere il log: `🤖 Google bot detected, allowing access`

### Test Accesso Pubblico
1. Apri in modalità incognito
2. Vai su `fanta-athletic.web.app/index.html`
3. Dovresti vedere la home senza login

### Test Pagina Verifica
1. Apri `fanta-athletic.web.app/adsense-verification.html`
2. Dovrebbe essere completamente pubblica

## 📝 Note Importanti

- **Le pagine protette rimangono protette**: Solo index.html, store.html e adsense-verification.html sono pubbliche
- **I bot Google passano automaticamente**: Anche se una pagina è protetta, i bot Google possono accedere
- **Privacy**: Assicurati di avere privacy policy e terms of service (consigliato per AdSense)

## 🚀 Next Steps

1. Registrati su AdSense
2. Usa `adsense-verification.html` per la verifica
3. Inserisci il codice di verifica
4. Aspetta approvazione (1-3 giorni)
5. Aggiungi i codici AdSense negli slot pubblicitari

## ⚠️ Policy AdSense

Assicurati che il sito rispetti:
- ✅ Contenuto originale e di qualità
- ✅ Privacy Policy accessibile
- ✅ Terms of Service
- ✅ Non click fraud
- ✅ Contenuto appropriato

