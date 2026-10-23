/* GAMMA - modello del registro "Verifiche periodiche ambienti ad uso medico".
   Ricavato dalle schede Word in Registri/Schede verifiche periodiche ambienti ad uso medico
   (02 Diario, M01..M07 + allegati). Niente dati di clienti o tecnici: quelli si inseriscono
   nella struttura (intestazione) e nelle visite.

   Formato dei modelli (vale per tutti i registri):
   - intestazione: campi della struttura, compilati una volta e ripresi in ogni scheda;
   - schede[]: {id, codice, titolo, periodicita, ripeti?, blocchi[], legenda?}
       ripeti = la scheda si compila piu' volte (una per quadro, locale, trasformatore...):
                {etichetta, campi[]} -> i campi identificano ogni istanza;
   - blocchi[]: {tipo: 'campi'|'lista'|'tabella'|'note'|'firma', ...}
       campi   : campi[] in griglia
       lista   : righe[] fisse {n, testo, risposta} (risposta = tipo di campo, default 'esito')
       tabella : colonne[] + righe libere ("+ riga", min = righe iniziali) o righeFisse[];
                 la larghezza delle colonne segue il tipo (numero, data, esito... strette); le colonne di
                 testo si dividono il resto: "corto: true" per testi brevi (TAG, INV), "largo: true" per
                 testi lunghi, "larghezza: <px>" per forzarla. Mai scorrimento: se non sta, una scheda per riga.
       note    : testo libero, frasi[] = frasi rapide da inserire con un tocco
       firma   : data, esecutore, firma (con dito o Apple Pencil)
   - tipi di campo: testo, numero (unita), data, ora, scelta (opzioni), multi (opzioni, piu' scelte),
     spunta, esito (P/N/NA), firma, auto (numerazione progressiva). */
window.GAMMA_MODELLI = window.GAMMA_MODELLI || {};
window.GAMMA_MODELLI.medico = {
  id: 'medico',
  versione: 1,
  titolo: 'Verifiche periodiche ambienti ad uso medico',
  breve: 'Ambienti medici',
  norma: 'CEI 64-8/7 sez. 710',
  documento: { titolo: 'REGISTRO DELLE VERIFICHE PERIODICHE AMBIENTI AD USO MEDICO', codice: '' },   // copertina (cartiglio)
  intestazione: [
    { id: 'struttura', etichetta: 'Struttura / committente', tipo: 'testo', obbligatorio: true },
    { id: 'oggetto', etichetta: 'Oggetto (impianto)', tipo: 'testo', esempio: 'Impianto FM - LL - varie' },
    { id: 'regione', etichetta: 'Regione', tipo: 'testo' },
    { id: 'provincia', etichetta: 'Provincia', tipo: 'testo' },
    { id: 'comune', etichetta: 'Comune', tipo: 'testo' },
    { id: 'responsabile', etichetta: 'Responsabile tecnico', tipo: 'testo' },
  ],
  esiti: { P: 'Positivo', N: 'Negativo', NA: 'Non applicabile' },
  schede: [
    {
      id: 'diario', codice: '02', titolo: 'Diario delle verifiche / visite', periodicita: 'a ogni visita',
      descrizione: 'Una riga per ogni visita: nell\'app si compila da sola quando si apre una nuova visita.',
      blocchi: [
        { tipo: 'tabella', min: 3, colonne: [
          { id: 'nr', etichetta: 'Nr.', tipo: 'auto' },
          { id: 'tecnico', etichetta: 'Tecnico', tipo: 'testo' },
          { id: 'data', etichetta: 'Data', tipo: 'data' },
          { id: 'tipo', etichetta: 'Tipo verifica', tipo: 'testo', suggerimenti: ['Verifica periodica', 'Visita', 'Verifica straordinaria'] },
        ] },
      ],
    },
    {
      id: 'M01', codice: 'M01', titolo: 'Prova funzionale dei dispositivi di controllo dell\'isolamento dei sistemi IT-M',
      breve: 'Trasformatori di isolamento IT-M', periodicita: 'semestrale',
      ripeti: { etichetta: 'Trasformatore IT-M', campi: [
        { id: 'id', etichetta: 'Trasformatore / quadro IT-M', tipo: 'testo' },
        { id: 'locale', etichetta: 'Locale servito', tipo: 'testo' },
      ] },
      blocchi: [
        { tipo: 'lista', righe: [
          { n: 1, testo: 'Premendo il tasto di prova il sistema di allarme ottico-acustico locale funziona correttamente' },
          { n: 2, testo: 'Premendo il tasto di prova il sistema di allarme ottico-acustico remoto funziona correttamente' },
          { n: 3, testo: 'È stato inserito un reostato tra un polo del secondario del trasformatore di isolamento e terra in maniera corretta' },
          { n: 4, testo: 'Riducendo progressivamente la resistenza del reostato, il dispositivo di allarme interviene quando la resistenza di terra scende al di sotto dei 50 kΩ' },
          { n: 5, testo: 'L\'allarme si disattiva quando la resistenza torna ad assumere un valore verso terra superiore a 50 kΩ' },
          { n: 6, testo: 'La prova ripetuta sull\'altro polo ha avuto esito regolare' },
        ] },
        { tipo: 'firma' },
        { tipo: 'note' },
      ],
    },
    {
      id: 'M02', codice: 'M02', titolo: 'Misura della resistenza del collegamento equipotenziale supplementare',
      breve: 'Collegamenti equipotenziali', periodicita: 'triennale',
      ripeti: { etichetta: 'Locale', campi: [
        { id: 'locale', etichetta: 'Locale', tipo: 'testo' },
        { id: 'id', etichetta: 'Identificativo', tipo: 'testo' },
        { id: 'gruppo', etichetta: 'Gruppo', tipo: 'scelta', opzioni: ['Locale di gruppo 1', 'Locale di gruppo 2'] },
      ] },
      blocchi: [
        { tipo: 'tabella', min: 5, colonne: [
          { id: 'n', etichetta: 'N°', tipo: 'auto' },
          { id: 'collegamento', etichetta: 'Collegamento', tipo: 'testo', largo: true },
          { id: 'r', etichetta: 'R', tipo: 'numero', unita: 'Ω' },
          { id: 'esito', etichetta: 'Esito', tipo: 'esito' },
        ] },
        { tipo: 'firma' },
        { tipo: 'note' },
      ],
      legenda: 'Nei locali di gruppo 1 non è necessario misurare la resistenza del collegamento supplementare: basta verificarne la presenza.',
    },
    {
      id: 'M03', codice: 'M03', titolo: 'Prova di funzionamento degli interruttori differenziali, mediante prova strumentale',
      breve: 'Interruttori differenziali', periodicita: 'annuale',
      ripeti: { etichetta: 'Quadro', campi: [
        { id: 'quadro', etichetta: 'Quadro elettrico', tipo: 'testo' },
      ] },
      blocchi: [
        { tipo: 'tabella', min: 5, colonne: [
          { id: 'tag', etichetta: 'TAG', tipo: 'testo', corto: true },
          { id: 'circuito', etichetta: 'Circuito', tipo: 'testo', largo: true },
          { id: 'classe', etichetta: 'Cl.', tipo: 'scelta', opzioni: ['AC', 'A', 'F', 'B'] },
          { id: 'idn', etichetta: 'Idn', tipo: 'numero', unita: 'A', suggerimenti: ['0,01', '0,03', '0,3', '0,5', '1'] },
          { id: 't', etichetta: 'T', tipo: 'numero', unita: 'ms' },
          { id: 'esito', etichetta: 'Esito', tipo: 'esito' },
        ] },
        { tipo: 'firma' },
        { tipo: 'note', frasi: ['Provati tutti i differenziali con tasto prova'] },
      ],
    },
    {
      id: 'M04', codice: 'M04', titolo: 'Controllo mediante esame a vista delle tarature dei dispositivi di protezione regolabili',
      breve: 'Tarature protezioni regolabili', periodicita: 'annuale',
      blocchi: [
        { tipo: 'tabella', min: 3, colonne: [
          { id: 'quadro', etichetta: 'Quadro', tipo: 'testo', corto: true },
          { id: 'circuito', etichetta: 'Circuito protetto', tipo: 'testo', largo: true },
          { id: 'in', etichetta: 'In', tipo: 'numero', unita: 'A' },
          { id: 'ith', etichetta: 'Ith', tipo: 'numero', unita: 'A' },
          { id: 'im', etichetta: 'Im', tipo: 'numero', unita: 'A' },
          { id: 'id', etichetta: 'Id', tipo: 'numero', unita: 'A' },
        ] },
        { tipo: 'firma' },
        { tipo: 'note', frasi: ['Non sono presenti dispositivi regolabili', 'Nulla è cambiato rispetto alla precedente verifica'] },
      ],
      legenda: 'In = corrente nominale; Ith = soglia d\'intervento termico; Im = soglia d\'intervento magnetico; Id = soglia d\'intervento differenziale.',
    },
    {
      id: 'M05', codice: 'M05', titolo: 'Prova di funzionamento a vuoto delle apparecchiature per l\'alimentazione di sicurezza con motori a combustione interna (gruppo elettrogeno)',
      breve: 'Gruppo elettrogeno a vuoto', periodicita: 'mensile',
      ripeti: { etichetta: 'Gruppo elettrogeno', campi: [
        { id: 'ge', etichetta: 'Gruppo elettrogeno', tipo: 'testo' },
        { id: 'anno', etichetta: 'Anno', tipo: 'numero', decimali: 0 },
      ] },
      blocchi: [
        { tipo: 'tabella', righeFisse: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
          colonne: [
            { id: 'mese', etichetta: 'Mese', tipo: 'fisso' },
            { id: 'giorno', etichetta: 'Giorno', tipo: 'numero', decimali: 0 },
            { id: 'esecutore', etichetta: 'Esecutore', tipo: 'testo' },
            { id: 'firma', etichetta: 'Firma', tipo: 'firma' },
            { id: 'esito', etichetta: 'Esito', tipo: 'esito' },
            { id: 'note', etichetta: 'Note', tipo: 'testo' },
          ] },
      ],
    },
    {
      id: 'M06', codice: 'M06', titolo: 'Prova di funzionamento a carico per almeno 30 minuti delle apparecchiature per l\'alimentazione di sicurezza con motori a combustione interna (gruppo elettrogeno)',
      breve: 'Gruppo elettrogeno a carico', periodicita: 'quadrimestrale',
      ripeti: { etichetta: 'Gruppo elettrogeno', campi: [
        { id: 'ge', etichetta: 'Gruppo elettrogeno', tipo: 'testo' },
      ] },
      blocchi: [
        { tipo: 'tabella', min: 3, colonne: [
          { id: 'data', etichetta: 'Data', tipo: 'data' },
          { id: 'on', etichetta: 'Ora ON', tipo: 'ora' },
          { id: 'off', etichetta: 'Ora OFF', tipo: 'ora' },
          { id: 'esecutore', etichetta: 'Esecutore', tipo: 'testo' },
          { id: 'firma', etichetta: 'Firma', tipo: 'firma' },
          { id: 'esito', etichetta: 'Esito', tipo: 'esito' },
        ] },
        { tipo: 'note' },
      ],
    },
    {
      id: 'M07', codice: 'M07', titolo: 'Illuminazione di sicurezza (verifica di funzionamento) - alimentazioni a batteria',
      breve: 'Illuminazione di sicurezza', periodicita: 'semestrale',
      blocchi: [
        { tipo: 'campi', campi: [
          { id: 'sistema', etichetta: 'Tipo di impianto', tipo: 'multi', opzioni: ['Impianto centralizzato', 'Apparecchi di emergenza autonomi'] },
        ] },
        { tipo: 'lista', righe: [
          { n: 1, testo: 'Il soccorritore e/o gli apparecchi di emergenza autonomi sono in carica (led acceso)' },
          { n: 2, testo: 'I corpi illuminanti di emergenza sono numerati' },
          { n: 3, testo: 'È presente un sistema di supervisione centralizzata dei corpi illuminanti' },
          { n: 4, testo: 'I corpi illuminanti di emergenza autonomi sono dotati di sistema autotest' },
          { n: 5, testo: 'Gli apparecchi di emergenza non sono danneggiati e possono svolgere la loro funzione' },
          { n: 6, testo: 'In mancanza dell\'alimentazione ordinaria tutti gli apparecchi di emergenza sono accesi' },
          { n: 7, testo: 'Il comando di inibizione o di modo di riposo funziona' },
          { n: 8, testo: 'Quantità corpi illuminanti presenti', risposta: { tipo: 'numero', decimali: 0 } },
          { n: 9, testo: 'Quantità corpi illuminanti non funzionanti', risposta: { tipo: 'numero', decimali: 0 } },
          { n: 10, testo: 'Nulla è cambiato rispetto alla precedente verifica', risposta: { tipo: 'spunta' } },
          { n: 11, testo: 'I corpi illuminanti restano accesi nei tempi e nei modi previsti' },
        ] },
        { tipo: 'firma' },
        { tipo: 'note' },
      ],
    },
  ],
};
