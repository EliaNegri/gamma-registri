# Γ GAMMA — Registri da cantiere

Web-app per compilare in loco (iPhone / iPad) i registri di verifica e manutenzione dello studio.
Si svilupperà come **repository GitHub separato e pubblico** (GitHub Pages) e verrà poi collegata
all'Officina PrezzarioMega (card Γ nel menu, archivio nella cartella condivisa).

## Stato

| Fase | Contenuto | Stato |
|---|---|---|
| 1 | Modelli dei registri + pagina di anteprima | registri **medico** e **fotovoltaico** fatti (`modelli/`, `anteprima.html`) |
| 2 | Prototipo: strutture, visite, salvataggio sul dispositivo, PDF e Word | da fare |
| 3 | Modelli 81-08 (RT01, VP01–VP04, SMNT01–08) | da fare |
| 4 | Integrazione nella suite e archivio condiviso | da fare |
| 5 | Sincronizzazione automatica Microsoft 365 (SharePoint) | da valutare |

## Modelli

Ogni registro è un file `modelli/<id>.js` che descrive intestazione e schede come dati
(formato spiegato in testa a `modelli/medico.js`): l'app non va riscritta per un registro nuovo.
I modelli **non contengono dati di clienti o tecnici**: quelli si inseriscono nella struttura.

Le schede Word di partenza sono nella cartella `Registri` dell'Officina (non pubblicata qui).

## Provare l'anteprima

- Online (iPad / iPhone / PC): https://elianegri.github.io/gamma-registri/
- In locale: aprire `anteprima.html` nel browser del PC.
