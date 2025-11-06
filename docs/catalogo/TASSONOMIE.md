# 📚 Tassonomie Globali

**Data:** 4 novembre 2025  
**Contesto:** Architettura Sistema V2 — Catalogo Globale + Snapshot Lega

---

## 🎯 Obiettivo

Stabilire un set di tassonomie coerenti e normalizzate da utilizzare nel Catalogo Globale:

- Campionati (championships)
- Regioni (regions)
- Stagioni (seasons)
- Cluster geografici opzionali (province / macro-aree)

Le tassonomie servono a:

- Offrire filtri affidabili durante la creazione di una nuova lega
- Evitare typo e duplicati (es. "Serie A" vs "serie a")
- Stabilire codici stabili per gli import/export
- Individuare rapidamente roster pubblici rilevanti (es. per area geografica)

---

## 🏆 Championships

| Codice               | Nome completo                              | Organizzatore        | Livello              | Macro-area   | Note |
|----------------------|---------------------------------------------|----------------------|----------------------|--------------|------|
| `AICS_FI_AMAT`       | Amatori AICS Firenze                        | AICS Firenze         | Amatori              | Firenze      | Macro girone generico (sottogironi B1, B2, ... gestiti come sub-label) |
| `UISP_FI_AMAT`       | Amatori UISP Firenze                        | UISP Firenze         | Amatori              | Firenze      | Per squadre amatoriali UISP |
| `UISP_PR_AMAT`       | Amatori UISP Prato                          | UISP Prato           | Amatori              | Prato        | |
| `UISP_PO_AMAT`       | Amatori UISP Pistoia                        | UISP Pistoia         | Amatori              | Pistoia      | |
| `UISP_SI_AMAT`       | Amatori UISP Siena                          | UISP Siena           | Amatori              | Siena        | |
| `FIGC_FI_TERZA`      | FIGC Dilettanti – Terza Categoria Firenze   | FIGC CR Toscana      | Dilettanti           | Firenze      | Es. Atletica Castello |
| `FIGC_FI_SECONDA`    | FIGC Dilettanti – Seconda Categoria Firenze | FIGC CR Toscana      | Dilettanti           | Firenze      | |
| `FIGC_FI_PRIMA`      | FIGC Dilettanti – Prima Categoria Firenze   | FIGC CR Toscana      | Dilettanti           | Firenze      | |
| `FIGC_TOS_PROMO`     | FIGC Dilettanti – Promozione Toscana        | FIGC CR Toscana      | Dilettanti élite     | Regionale    | |
| `FIGC_TOS_ECC`       | FIGC Dilettanti – Eccellenza Toscana        | FIGC CR Toscana      | Dilettanti élite     | Regionale    | |
| `FIGC_IT_SERIED`     | FIGC Serie D                                | FIGC                 | Semi-professionisti  | Nazionale    | Inserita per completare scala |
| `SETTOREPROV_FI_JUN` | Settore Giovanile – Juniores Provinciali FI | FIGC Settore Giovanile | Giovanili         | Firenze      | |
| `SETTOREPROV_FI_ALL` | Settore Giovanile – Allievi Provinciali FI  | FIGC Settore Giovanile | Giovanili         | Firenze      | |
| `SETTOREGIO_JUN`     | Settore Giovanile – Juniores Regionale      | FIGC Settore Giovanile | Giovanili         | Regionale    | |
| `SETTOREGIO_ALL`     | Settore Giovanile – Allievi Regionale       | FIGC Settore Giovanile | Giovanili         | Regionale    | |

> 📌 I codici championship seguono il pattern `ORGANIZZATORE_AREA_LIVELLO` per facilitare filtri e ricerche.

### Roadmap Championships
- [ ] Aggiungere versioni provinciali per Juniores/Allievi (es. `SETTOREPROV_FI_JUN`)
- [ ] Estendere elenco ad altre province toscane (Prato, Pisa, Lucca, Arezzo, Siena)
- [ ] Inserire campionati misti femminili/misti se emergono nuove richieste

---

## 📍 Regions

| Codice      | Nome               | Macro-area | Province incluse            | Note |
|-------------|--------------------|------------|-----------------------------|------|
| `TOSCANA`     | Toscana            | Centro     | FI, PO, PT, AR, SI, LI, LU, GR, MS, PI | Base per roster Athletic 2018 |
| `TOSCANA_FI`  | Firenze e Provincia| Centro     | FI                          | Utile per campionati provinciali |
| `TOSCANA_PR`  | Prato e Provincia  | Centro     | PO                          | |
| `TOSCANA_PT`  | Pistoia e Provincia| Centro     | PT                          | |
| `TOSCANA_SI`  | Siena e Provincia  | Centro     | SI                          | |

### Roadmap Regions
- [ ] Estendere elenco regioni italiane complete
- [ ] Popolare codici provinciali per tutte le province toscane (`TOSCANA_PO`, `TOSCANA_SI`, ...)

---

## 📅 Seasons

| Codice      | Label        | Start | End   | Note |
|-------------|--------------|-------|-------|------|
| `2024_2025` | Stagione 24/25| 2024  | 2025  | Stagione corrente Athletic |
| `2023_2024` | Stagione 23/24| 2023  | 2024  | Per storicizzare dati recenti |

### Regole stagione
- Codice numerico `YYYY_YYYY`
- Label libero da visualizzare
- Utilizzare per versioning roster

---

## 🔄 Gestione versioni

Ogni roster pubblicato dovrà indicare:

- `championshipRef`: riferimento al codice championship
- `regionRef`: riferimento al codice regione
- `seasonRef`: riferimento al codice season

Questi campi permettono filtraggio coerente e import idempotente.

---

## ✅ Prossimi passi

1. Validare tassonomie con i tre superadmin
2. Integrare i codici in `ARCHITETTURA_SISTEMA_V2.md`
3. Aggiornare script di import/export per usare i codici tassonomici
4. Pianificare ampliamento catalogo (campionati UISP, FIGC, altre regioni)


