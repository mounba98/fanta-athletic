# Setup Repository GitHub - Fanta Athletic

## ✅ Repository Git Locale Creato

Il repository Git è stato inizializzato nella cartella `public/` con il primo commit.

## 📋 Passaggi per pubblicare su GitHub

### 1. Crea il repository su GitHub

1. Vai su [GitHub.com](https://github.com) e accedi
2. Clicca su **"New repository"** (o vai a https://github.com/new)
3. Nome repository: `fanta-athletic` (o quello che preferisci)
4. **IMPORTANTE**: Seleziona **"Private"** (consigliato) o **"Public"** se vuoi renderlo pubblico
5. **NON** inizializzare con README, .gitignore o licenza (l'abbiamo già fatto)
6. Clicca **"Create repository"**

### 2. Collega il repository locale a GitHub

Dopo aver creato il repository su GitHub, copia l'URL del repository (es. `https://github.com/TUO-USERNAME/fanta-athletic.git`)

Poi esegui questi comandi nella cartella `public/`:

```bash
# Aggiungi il remote (sostituisci con il tuo URL)
git remote add origin https://github.com/TUO-USERNAME/fanta-athletic.git

# Rinomina il branch principale in 'main' (se necessario)
git branch -M main

# Fai il push del primo commit
git push -u origin main
```

### 3. Verifica

Vai sul repository GitHub e verifica che tutti i file siano presenti.

## 🔄 Comandi Git utili per il futuro

```bash
# Vedere lo stato delle modifiche
git status

# Aggiungere file modificati
git add .

# Fare un commit
git commit -m "Descrizione delle modifiche"

# Fare push su GitHub
git push

# Vedere la cronologia dei commit
git log

# Tornare a un commit precedente (se necessario)
git checkout <commit-hash>
```

## ⚠️ Note importanti

- Il file `.gitignore` è già configurato per escludere file temporanei e sensibili
- `firebase-config.js` è stato incluso perché le chiavi Firebase client-side sono pubbliche per design
- Se hai chiavi/secret veramente sensibili, crea un file `.env` e aggiungilo al `.gitignore`

## 🛡️ Sicurezza

Se il repository sarà pubblico:
- ✅ Le Firebase API keys client-side sono sicure (limitate da dominio)
- ✅ Le Firebase Security Rules proteggono i dati
- ⚠️ Non committare mai:
  - Service account keys JSON
  - Password di database
  - Token di autenticazione server-side
  - Chiavi private SSH

