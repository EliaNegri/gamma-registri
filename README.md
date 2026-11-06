# Γ GAMMA — Registri da cantiere

Web-app per compilare in loco (iPhone / iPad) i registri di verifica e manutenzione dello studio.
Si svilupperà come **repository GitHub separato e pubblico** (GitHub Pages) e verrà poi collegata
all'Officina PrezzarioMega (card Γ nel menu, archivio nella cartella condivisa).

## Stato

| Fase | Contenuto | Stato |
|---|---|---|
| 1 | Modelli dei registri + pagina di anteprima | registri **medico**, **fotovoltaico** e **81-08** fatti (`modelli/`, `anteprima.html`) |
| 2 | Prototipo: strutture, visite, salvataggio sul dispositivo, PDF e Word | **PDF** fatto; **progetti** salvati sul dispositivo con esporta/importa `.gamma`; visite e Word da fare |
| 4 | Integrazione nella suite e archivio condiviso | da fare |
| 5 | Sincronizzazione automatica Microsoft 365 (SharePoint) | da valutare |

## Modelli

Ogni registro è un file `modelli/<id>.js` che descrive intestazione e schede come dati
(formato spiegato in testa a `modelli/medico.js`): l'app non va riscritta per un registro nuovo.
I modelli **non contengono dati di clienti o tecnici**: quelli si inseriscono nella struttura.

Le schede Word di partenza sono nella cartella `Registri` dell'Officina (non pubblicata qui).

## Progetti e salvataggio

- Un **progetto** = un registro di una struttura. Si crea, apre, duplica, rinomina ed elimina da **📁 Progetti**.
- Ogni modifica si salva da sola **sul dispositivo** (IndexedDB del browser, firme comprese): ricaricare la pagina non perde nulla.
- **Esporta** crea un file `.gamma` (JSON con tutto il progetto): è la copia da archiviare nella cartella dello studio
  e il modo per passare un progetto tra iPad e PC (**Importa file…**). I dati del browser restano solo su quel
  dispositivo e si perdono se si cancellano i dati di navigazione: esportare a fine lavoro.
- **👤 Accedi**: il nome di chi compila va da solo in Esecutore / Addetto / Tecnico (solo sul dispositivo, senza password).

## Font, cartiglio e timbri

- Tutto in **Calibri**: nel PDF e sull'iPad si usa **Carlito** (`font-calibri.js`), gemello libero di Calibri
  con le stesse larghezze (SIL OFL, `font/OFL.txt`); Calibri non si può pubblicare. Rigenerare con
  `python strumenti/prepara_font.py Carlito-Regular.ttf Carlito-Bold.ttf`.
- Copertina = cartiglio di KAPPA (`cartiglio-assets.js`, da `strumenti/aggiorna_cartiglio.py`).
- I **timbri non sono nel repository** (è pubblico): si importano su ogni dispositivo da ⚙ Tecnici.

## Provare l'anteprima

- Online (iPad / iPhone / PC): https://elianegri.github.io/gamma-registri/
- In locale: aprire `anteprima.html` nel browser del PC.
