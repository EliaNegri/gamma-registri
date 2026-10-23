/* GAMMA - modello del registro "Piano di manutenzione impianto fotovoltaico".
   Ricavato dal manuale PM01 (Registri/Fotovoltaico): scheda di manutenzione del campo FV,
   misure di stringa (tensioni e isolamento), verifica quadri, calcolo dei rendimenti e
   controllo del monitoraggio. Formato dei modelli: vedi modelli/medico.js.
   In piu' qui:
   - lista.colonne: campi extra per ogni attivita' (periodicita' in mesi, tipo, nota);
     "predefinito" = chiave della riga da cui prendere il valore iniziale (es. per: 6);
   - blocco 'verifiche': controlli calcolati dai campi della scheda (funzione calcola). */
(function(){
  const TIPI_MANUTENZIONE = ['A - ordinaria', 'B - straordinaria', 'C - preventiva', 'D - preventiva programmata',
    'E - preventiva non programmata', 'F - preventiva predittiva', 'G - secondo condizione', 'H - controllata',
    'I - correttiva', 'L - migliorativa'];
  const COLONNE_ATTIVITA = [
    { id: 'per', etichetta: 'Periodicità', tipo: 'numero', unita: 'mesi', decimali: 0, predefinito: 'per' },
    { id: 'tipo', etichetta: 'Tipo', tipo: 'scelta', opzioni: TIPI_MANUTENZIONE },
    { id: 'nota', etichetta: 'Nota', tipo: 'testo' },
  ];
  const att = (per, testo, nota) => ({ testo, per, nota, risposta: { tipo: 'esitoPN' } });
  const num = v => { const x = parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(',', '.')); return isFinite(x) ? x : null; };
  const f2 = x => x.toLocaleString('it-IT', { maximumFractionDigits: 2 });

  window.GAMMA_MODELLI = window.GAMMA_MODELLI || {};
  window.GAMMA_MODELLI.fotovoltaico = {
    id: 'fotovoltaico',
    versione: 1,
    titolo: 'Piano di manutenzione impianto fotovoltaico',
    breve: 'Fotovoltaico',
    norma: 'Manuale di gestione e manutenzione FV',
    intestazione: [
      { id: 'struttura', etichetta: 'Committente', tipo: 'testo', obbligatorio: true },
      { id: 'denominazione', etichetta: 'Denominazione impianto / opera', tipo: 'testo' },
      { id: 'localita', etichetta: 'Località', tipo: 'testo' },
      { id: 'censimp', etichetta: 'Identificativo impianto FV (CENSIMP)', tipo: 'testo' },
      { id: 'piano', etichetta: 'Piano di manutenzione n°', tipo: 'testo' },
      { id: 'potenza', etichetta: 'Potenza nominale', tipo: 'numero', unita: 'kWp' },
      { id: 'installazione', etichetta: 'Modalità d\'installazione', tipo: 'testo', esempio: 'zavorre, pensiline, falde…' },
      { id: 'luogo', etichetta: 'Luogo d\'installazione', tipo: 'testo', esempio: 'su falda, a terra, reparto…' },
      { id: 'sollecitazioni', etichetta: 'Altre sollecitazioni esterne', tipo: 'testo', esempio: 'vibrazioni, sostanze corrosive…' },
      { id: 'varie', etichetta: 'Varie', tipo: 'testo', esempio: 'segnalazioni generiche' },
      { id: 'responsabile', etichetta: 'Responsabile tecnico', tipo: 'testo' },
    ],
    esiti: { P: 'Positivo', N: 'Negativo', NA: 'Non applicabile' },
    legendaTipi: 'Tipo di manutenzione: ' + TIPI_MANUTENZIONE.join('; ') + '.',
    schede: [
      {
        id: 'diario', codice: 'D', titolo: 'Diario degli interventi', periodicita: 'a ogni intervento',
        descrizione: 'Una riga per ogni intervento di manutenzione: nell\'app si compila da sola aprendo una nuova visita.',
        blocchi: [
          { tipo: 'tabella', min: 3, colonne: [
            { id: 'nr', etichetta: 'Scheda n°', tipo: 'auto' },
            { id: 'tecnico', etichetta: 'Operatore', tipo: 'testo' },
            { id: 'data', etichetta: 'Data', tipo: 'data' },
            { id: 'tipo', etichetta: 'Intervento', tipo: 'testo', suggerimenti: ['Manutenzione ordinaria', 'Manutenzione straordinaria', 'Verifica'] },
          ] },
        ],
      },
      {
        id: 'FV1', codice: 'FV1', titolo: 'Scheda di manutenzione - campo fotovoltaico e inverter',
        breve: 'Campo FV e inverter', periodicita: 'semestrale (alcune voci annuali e biennali)',
        descrizione: 'Report di manutenzione ordinaria: spunta l\'esito di ogni attività. La periodicità è già compilata dal manuale e si può cambiare.',
        blocchi: [
          { tipo: 'lista', titolo: 'Moduli fotovoltaici', colonne: COLONNE_ATTIVITA, righe: [
            att(6, 'Presenza di microfratture'),
            att(6, 'Presenza di danni evidenti'),
            att(6, 'Presenza di dilatazioni anomale per errato sistema di supporto'),
            att(6, 'Presenza di flessione del pannello per errato sistema di supporto'),
            att(6, 'Presenza di condensa all\'interno dei moduli'),
            att(6, 'Presenza di ombreggiamenti'),
            att(6, 'Opere di revamping'),
            att(12, 'Opere di pulizia', 'Indicare nella nota modalità di pulizia, detergenti e liquido di risciacquo (la frequenza può aumentare in base alle condizioni ambientali).'),
          ] },
          { tipo: 'lista', titolo: 'Cassette di terminazione (a campione)', colonne: COLONNE_ATTIVITA, righe: [
            att(24, 'Eventuali deformazioni delle cassette'),
            att(24, 'Formazione di umidità all\'interno'),
            att(24, 'Stato dei contatti elettrici delle polarità positiva e negativa'),
            att(24, 'Stato dei diodi di by-pass'),
            att(24, 'Corretto serraggio dei morsetti'),
            att(24, 'Integrità della siliconatura dei passacavi'),
          ] },
          { tipo: 'lista', titolo: 'Strutture', colonne: COLONNE_ATTIVITA, righe: [
            att(6, 'Presenza di corrosione e ossidazione'),
            att(6, 'Difformità della geometria'),
            att(6, 'Allentamenti delle connessioni meccaniche'),
          ] },
          { tipo: 'lista', titolo: 'Linee elettriche e messa a terra', colonne: COLONNE_ATTIVITA, righe: [
            att(12, 'Linee elettriche DC: danneggiamenti, bruciature, abrasioni, deterioramento isolante, fissaggi'),
            att(12, 'Linee elettriche AC: danneggiamenti, bruciature, abrasioni, deterioramento isolante, fissaggi'),
            att(24, 'Messa a terra dell\'impianto FV: continuità e connessioni del cablaggio'),
          ] },
          { tipo: 'lista', titolo: 'Inverter e dispositivi di misura', colonne: COLONNE_ATTIVITA, righe: [
            att(6, 'Inverter: danneggiamenti dell\'armadio e dei componenti (infiltrazioni, condensa, riscaldamenti localizzati, roditori…)'),
            att(6, 'Inverter: pulizia interna ed esterna (aperture di ventilazione, ventole e filtri)'),
            att(12, 'Inverter: settaggi e corretta indicazione dei dispositivi di misura e controllo'),
            att(6, 'Dispositivi di misura: correttezza delle letture rispetto a strumento esterno o letture inverter'),
          ] },
          { tipo: 'lista', titolo: 'Pulsanti di sgancio e UPS', colonne: COLONNE_ATTIVITA, righe: [
            att(6, 'Pulsanti di sgancio previsti nel progetto e/o nella documentazione "as-built" presenti ed efficienti'),
            att(6, 'Pulsanti di sgancio non coperti da ostacoli (installazione consona al servizio)'),
            att(6, 'Spie di integrità del circuito di sgancio funzionanti'),
            att(6, 'Pulsanti di sgancio numerati'),
            att(6, 'Prova di funzionamento dei pulsanti di sgancio con esito positivo'),
            att(6, 'Funzionamento degli apparecchi di sgancio sia in c.c. che in c.a.'),
            att(6, 'UPS: sganci previsti nel progetto e/o "as-built" presenti ed efficienti'),
            att(6, 'UPS: spie di integrità del circuito di sgancio funzionanti'),
          ] },
          { tipo: 'firma' },
          { tipo: 'note' },
        ],
      },
      {
        id: 'FV2', codice: 'FV2', titolo: 'Misure di stringa - tensioni a vuoto e correnti di funzionamento',
        breve: 'Misure di stringa (V)', periodicita: 'semestrale',
        descrizione: 'Con l\'ausilio di opportuno strumento verificare l\'uniformità delle tensioni a vuoto e delle correnti di funzionamento di ogni stringa, confrontandole a parità di esposizione e temperatura.',
        ripeti: { etichetta: 'Quadro di campo', campi: [
          { id: 'quadro', etichetta: 'Quadro di campo / inverter', tipo: 'testo' },
          { id: 'irraggiamento', etichetta: 'Irraggiamento', tipo: 'numero', unita: 'W/m²' },
          { id: 'temperatura', etichetta: 'Temperatura moduli', tipo: 'numero', unita: '°C' },
        ] },
        blocchi: [
          { tipo: 'tabella', min: 6, colonne: [
            { id: 'inv', etichetta: 'INV', tipo: 'testo' },
            { id: 'stringa', etichetta: 'Stringa', tipo: 'testo' },
            { id: 'v', etichetta: 'Valore', tipo: 'numero', unita: 'V' },
            { id: 'i', etichetta: 'Corrente', tipo: 'numero', unita: 'A' },
            { id: 'esito', etichetta: 'Esito', tipo: 'esito' },
          ] },
          { tipo: 'firma' },
          { tipo: 'note' },
        ],
      },
      {
        id: 'FV3', codice: 'FV3', titolo: 'Misure di stringa - resistenza di isolamento dei poli verso terra',
        breve: 'Isolamento stringhe', periodicita: 'semestrale',
        descrizione: 'Prove sia con tutte le stringhe in parallelo per ogni singolo quadro, sia singolarmente su un campione di stringhe.',
        ripeti: { etichetta: 'Quadro di campo', campi: [
          { id: 'quadro', etichetta: 'Quadro di campo / inverter', tipo: 'testo' },
          { id: 'tensione', etichetta: 'Tensione di prova', tipo: 'numero', unita: 'V' },
        ] },
        blocchi: [
          { tipo: 'tabella', min: 6, colonne: [
            { id: 'inv', etichetta: 'INV', tipo: 'testo' },
            { id: 'stringa', etichetta: 'Stringa', tipo: 'testo', suggerimenti: ['Tutte in parallelo'] },
            { id: 'r', etichetta: 'Valore', tipo: 'numero', unita: 'MΩ' },
            { id: 'esito', etichetta: 'Esito', tipo: 'esito' },
          ] },
          { tipo: 'firma' },
          { tipo: 'note' },
        ],
      },
      {
        id: 'FV4', codice: 'FV4', titolo: 'Scheda di manutenzione - quadri elettrici',
        breve: 'Quadri elettrici', periodicita: 'semestrale',
        ripeti: { etichetta: 'Quadro', campi: [
          { id: 'quadro', etichetta: 'Identificativo quadro elettrico', tipo: 'testo' },
          { id: 'installazione', etichetta: 'Modalità d\'installazione', tipo: 'testo' },
          { id: 'ambiente', etichetta: 'Ambiente d\'installazione', tipo: 'testo' },
          { id: 'sollecitazioni', etichetta: 'Altre sollecitazioni esterne', tipo: 'testo' },
          { id: 'varie', etichetta: 'Varie', tipo: 'testo' },
        ] },
        blocchi: [
          { tipo: 'lista', titolo: 'Attività di manutenzione', colonne: COLONNE_ATTIVITA, righe: [
            att(6, 'Pulizia di carattere generale compresi interruttori e relative connessioni'),
            att(6, 'Esistenza della targa del quadro'),
            att(6, 'Esistenza e leggibilità della targa su ogni interruttore'),
            att(6, 'Corrispondenza tra targa indicatrice del circuito ed effettivo circuito alimentato'),
            att(6, 'Buono stato di conservazione degli involucri e della carpenteria'),
            att(6, 'Serraggio delle connessioni ai morsetti di alimentazione'),
            att(6, 'Presenza di tracce di scariche elettriche superficiali'),
            att(6, 'Regolazione delle protezioni contro sovraccarichi e cortocircuiti'),
            att(6, 'Valutazione ed eventuale misura della temperatura in condizioni normali di esercizio'),
            att(6, 'Serraggio di tutte le connessioni di potenza e dei circuiti ausiliari'),
            att(6, 'Continuità del collegamento all\'impianto di terra dei conduttori di protezione'),
            att(6, 'Ossidazione o segni di surriscaldamento dei morsetti degli interruttori'),
            att(6, 'Pulizia generale delle apparecchiature non soggette a manutenzione ma solo a verifica di funzionamento'),
            att(6, 'Funzionamento mediante manovre d\'apertura dell\'interruttore a vuoto in esercizio'),
            att(6, 'Serraggio delle viti della morsettiera di arrivo e partenza condutture'),
            att(6, 'Tracce di surriscaldamento dei componenti interni'),
            att(6, 'Funzionamento di relè, contattori, orologi programmatori (se presenti)'),
            att(6, 'Prova di funzionamento degli eventuali circuiti elettrici ausiliari'),
          ] },
          { tipo: 'firma' },
          { tipo: 'note' },
        ],
      },
      {
        id: 'FV5', codice: 'FV5', titolo: 'Calcolo dei rendimenti e controllo del sistema di monitoraggio',
        breve: 'Rendimenti e monitoraggio', periodicita: 'annuale',
        descrizione: 'Inserisci le misure: i controlli del manuale si calcolano da soli (Istc = 1000 W/m²).',
        blocchi: [
          { tipo: 'campi', campi: [
            { id: 'pnom', etichetta: 'Pnom - potenza nominale del generatore', tipo: 'numero', unita: 'kW' },
            { id: 'irr', etichetta: 'I - irraggiamento sul piano dei moduli', tipo: 'numero', unita: 'W/m²' },
            { id: 'pcc', etichetta: 'Pcc - potenza DC all\'uscita del generatore', tipo: 'numero', unita: 'kW' },
            { id: 'pca', etichetta: 'Pca - potenza AC all\'uscita del gruppo di conversione', tipo: 'numero', unita: 'kW' },
          ] },
          { tipo: 'verifiche', titolo: 'Controlli del manuale', righe: [
            { testo: 'Pcc > 0,85 × Pnom × I / Istc', calcola: v => {
                const pnom = num(v.pnom), irr = num(v.irr), pcc = num(v.pcc);
                if (pnom == null || irr == null || pcc == null) return null;
                const lim = 0.85 * pnom * irr / 1000;
                return { ok: pcc > lim, testo: 'Pcc ' + f2(pcc) + ' kW ' + (pcc > lim ? '>' : '≤') + ' ' + f2(lim) + ' kW' };
              } },
            { testo: 'Pca > 0,9 × Pcc', calcola: v => {
                const pcc = num(v.pcc), pca = num(v.pca);
                if (pcc == null || pca == null) return null;
                const lim = 0.9 * pcc;
                return { ok: pca > lim, testo: 'Pca ' + f2(pca) + ' kW ' + (pca > lim ? '>' : '≤') + ' ' + f2(lim) + ' kW (rendimento ' + f2(pca / pcc * 100) + ' %)' };
              } },
          ] },
          { tipo: 'lista', titolo: 'Sistema di monitoraggio', righe: [
            { n: 1, testo: 'Le misure rese disponibili da remoto corrispondono a quelle rilevate in loco', risposta: { tipo: 'esitoPN' } },
            { n: 2, testo: 'Il servizio di monitoraggio da remoto è attivo e consultabile', risposta: { tipo: 'esitoPN' } },
          ] },
          { tipo: 'firma' },
          { tipo: 'note' },
        ],
      },
    ],
  };
})();
