/* GAMMA - PDF dei registri, generato nella pagina (nessuna libreria, funziona offline).
   PDF vettoriale A4 in Calibri: font Carlito incorporato (stesse larghezze di Calibri, font-calibri.js;
   senza quel file si ripiega su Helvetica). Firme, logo e cartiglio come immagini.
   Uso: GammaPDF.registro(modello, valori, {schede:'tutte'|'compilate'|[id...]}) -> Promise<Blob>
   valori = {intest:{}, schede:{<id>:{ist:[{id:{}, b:{<indice blocco>: ...}}]}}} (come l'app). */
(function(){
  const MM = 72 / 25.4, PW = 210, PH = 297, ML = 12, MR = 12, MT = 12, MB = 12;
  const BLU = [0.043, 0.38, 0.47], GRIGIO = [0.42, 0.45, 0.5], CHIARO = [0.93, 0.95, 0.97];
  const OK = [0.016, 0.41, 0.29], KO = [0.78, 0.16, 0.16];

  // ---- testo: WinAnsi (cp1252) + sostituzioni per i simboli che i font standard non hanno ----
  const SOST = { 'Ω': 'Ohm', '≤': '<=', '≥': '>=', '→': '->', '✓': 'V', '✗': 'X', 'Γ': 'G', ' ': ' ' };
  const CP = { '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87, 'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a,
    '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91, '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98,
    '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };
  const norm = s => String(s == null ? '' : s).replace(/[ΩΓ≤≥→✓✗ ]/g, c => SOST[c]);
  const codice = ch => { const c = ch.charCodeAt(0); return CP[ch] || (c > 255 ? 63 : c); };
  function pdfStr(s) {
    let o = '';
    for (const ch of norm(s)) {
      const c = codice(ch);
      if (ch === '(' || ch === ')' || ch === '\\') o += '\\' + ch;
      else if (c < 32 || c > 126) o += '\\' + c.toString(8).padStart(3, '0');
      else o += ch;
    }
    return '(' + o + ')';
  }
  // font: Carlito incorporato (stesse larghezze di Calibri, font-calibri.js); senza, Helvetica standard
  const FONT = window.GAMMA_FONT || null;
  // "middle" del canvas di KAPPA: la linea di base sta (ascendente+discendente)/2 sotto il centro
  const MEZZO = FONT ? (FONT.regular.ascent + FONT.regular.descent) / 2000 : 0.35;
  const cv = document.createElement('canvas').getContext('2d');
  function larg(s, size, bold) {                      // larghezza in mm
    if (FONT) {
      const L = (bold ? FONT.bold : FONT.regular).larghezze; let w = 0;
      for (const ch of norm(s)) { const c = codice(ch); w += c >= 32 ? L[c - 32] : 0; }
      return w / 1000 * size / MM;
    }
    cv.font = (bold ? 'bold ' : '') + '100px Helvetica, Arial, sans-serif';
    return cv.measureText(norm(s)).width / 100 * size / MM;
  }
  function aCapo(s, size, bold, w) {
    const out = [];
    for (const par of String(s == null ? '' : s).split('\n')) {
      let riga = '';
      for (const parola of par.split(/\s+/).filter(Boolean)) {
        const prova = riga ? riga + ' ' + parola : parola;
        if (larg(prova, size, bold) <= w || !riga) {
          if (!riga && larg(parola, size, bold) > w) {      // parola piu' lunga della colonna: spezzata
            let pz = '';
            for (const ch of parola) { if (larg(pz + ch, size, bold) > w && pz) { out.push(pz); pz = ''; } pz += ch; }
            riga = pz;
          } else riga = prova;
        } else { out.push(riga); riga = parola; }
      }
      out.push(riga);
    }
    return out.length ? out : [''];
  }
  const f = n => (Math.round(n * 100) / 100).toString();
  // zlib (FlateDecode) con le API del browser: Safari 16.4+, Chrome, Edge
  async function comprimi(u8) {
    const s = new Blob([u8]).stream().pipeThrough(new CompressionStream('deflate'));
    return new Uint8Array(await new Response(s).arrayBuffer());
  }

  // ---- documento ----
  class Doc {
    constructor() { this.pagine = []; this.img = []; }
    nuovaPagina() { this.p = []; this.pagine.push(this.p); }
    testo(x, y, s, o = {}) {
      const size = o.size || 9, col = o.col || [0, 0, 0];
      let xx = x;
      if (o.allinea === 'dx') xx = x - larg(s, size, o.bold);
      if (o.allinea === 'centro') xx = x - larg(s, size, o.bold) / 2;
      this.p.push(`BT /${o.bold ? 'F2' : 'F1'} ${size} Tf ${col.map(f).join(' ')} rg ${f(xx * MM)} ${f((PH - y) * MM)} Td ${pdfStr(s)} Tj ET`);
    }
    linea(x1, y1, x2, y2, w = 0.2, col = [0, 0, 0]) {
      this.p.push(`${col.map(f).join(' ')} RG ${f(w * MM)} w ${f(x1 * MM)} ${f((PH - y1) * MM)} m ${f(x2 * MM)} ${f((PH - y2) * MM)} l S`);
    }
    rett(x, y, w, h, o = {}) {
      const r = `${f(x * MM)} ${f((PH - y - h) * MM)} ${f(w * MM)} ${f(h * MM)} re`;
      if (o.riemp) this.p.push(`${o.riemp.map(f).join(' ')} rg ${r} f`);
      if (o.bordo !== false) this.p.push(`${(o.col || [0, 0, 0]).map(f).join(' ')} RG ${f((o.lw || 0.2) * MM)} w ${r} S`);
    }
    immagine(i, x, y, w, h) { this.p.push(`q ${f(w * MM)} 0 0 ${f(h * MM)} ${f(x * MM)} ${f((PH - y - h) * MM)} cm /Im${i} Do Q`); }
    // immagine -> JPEG su fondo bianco (firme, logo, sfondo del cartiglio); con alfa:true -> RGB + trasparenza
    // compressi (timbro sopra il cartiglio, come in KAPPA). maxPx limita la risoluzione.
    async aggiungiImmagine(dataUrl, o = {}) {
      const im = new Image(); im.src = dataUrl; await im.decode();
      const r = Math.min(1, (o.maxPx || 1e5) / Math.max(im.naturalWidth || 1, im.naturalHeight || 1));
      const c = document.createElement('canvas'); c.width = Math.max(1, Math.round((im.naturalWidth || o.w || 300) * r)); c.height = Math.max(1, Math.round((im.naturalHeight || o.h || 100) * r));
      const x = c.getContext('2d');
      if (o.alfa && typeof CompressionStream !== 'undefined') {
        x.drawImage(im, 0, 0, c.width, c.height);
        const px = x.getImageData(0, 0, c.width, c.height).data, n = c.width * c.height;
        const rgb = new Uint8Array(n * 3), a = new Uint8Array(n);
        for (let k = 0; k < n; k++) { rgb[k * 3] = px[k * 4]; rgb[k * 3 + 1] = px[k * 4 + 1]; rgb[k * 3 + 2] = px[k * 4 + 2]; a[k] = px[k * 4 + 3]; }
        this.img.push({ w: c.width, h: c.height, dati: await comprimi(rgb), filtro: 'FlateDecode', smask: await comprimi(a) });
        return this.img.length - 1;
      }
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
      const b64 = c.toDataURL('image/jpeg', o.qualita || 0.85).split(',')[1], bin = atob(b64), u = new Uint8Array(bin.length);
      for (let k = 0; k < bin.length; k++) u[k] = bin.charCodeAt(k);
      this.img.push({ w: c.width, h: c.height, dati: u, filtro: 'DCTDecode' });
      return this.img.length - 1;
    }
    async blob() {
      const enc = new TextEncoder(), parti = [], off = [];
      let pos = 0; const push = b => { const u = typeof b === 'string' ? enc.encode(b) : b; parti.push(u); pos += u.length; };
      const np = this.pagine.length;
      // 1 catalogo, 2 pagine, 3-4 font (+ descrittore e file se Carlito), poi immagini (+ maschere), poi (pagina, contenuto)
      let next = 5;
      const idFont = FONT ? [FONT.regular, FONT.bold].map(() => ({ desc: next++, file: next++ })) : null;
      const idImg = this.img.map(im => { const id = next++; if (im.smask) im.idMask = next++; return id; });
      const base = next, idPag = i => base + i * 2, idCont = i => base + 1 + i * 2, tot = base - 1 + np * 2;
      const ogg = (n, corpo) => { off[n] = pos; push(n + ' 0 obj\n'); for (const c of [].concat(corpo)) push(c); push('\nendobj\n'); };
      push('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n');
      ogg(1, '<</Type/Catalog/Pages 2 0 R>>');
      ogg(2, `<</Type/Pages/Count ${np}/Kids[${this.pagine.map((_, i) => idPag(i) + ' 0 R').join(' ')}]>>`);
      if (FONT) {
        // TrueType incorporato (ridotto ai caratteri WinAnsi), larghezze dal font stesso
        const pesi = [FONT.regular, FONT.bold];
        for (let k = 0; k < 2; k++) {
          const F = pesi[k], id = idFont[k], nome = 'GAMMAA' + (k ? 'B' : 'R') + '+' + F.nome;
          ogg(3 + k, `<</Type/Font/Subtype/TrueType/BaseFont/${nome}/FirstChar ${F.primo}/LastChar ${F.primo + F.larghezze.length - 1}/Widths[${F.larghezze.join(' ')}]/Encoding/WinAnsiEncoding/FontDescriptor ${id.desc} 0 R>>`);
          ogg(id.desc, `<</Type/FontDescriptor/FontName/${nome}/Flags 32/FontBBox[${F.bbox.join(' ')}]/ItalicAngle 0/Ascent ${F.ascent}/Descent ${F.descent}/CapHeight ${F.capHeight}/StemV ${k ? 120 : 80}/FontFile2 ${id.file} 0 R>>`);
          const bin = atob(F.ttf), raw = new Uint8Array(bin.length);
          for (let q = 0; q < bin.length; q++) raw[q] = bin.charCodeAt(q);
          const zip = typeof CompressionStream !== 'undefined' ? await comprimi(raw) : null;
          ogg(id.file, [`<</Length ${(zip || raw).length}/Length1 ${raw.length}${zip ? '/Filter/FlateDecode' : ''}>>\nstream\n`, zip || raw, '\nendstream']);
        }
      } else {
        ogg(3, '<</Type/Font/Subtype/Type1/BaseFont/Helvetica/Encoding/WinAnsiEncoding>>');
        ogg(4, '<</Type/Font/Subtype/Type1/BaseFont/Helvetica-Bold/Encoding/WinAnsiEncoding>>');
      }
      this.img.forEach((im, i) => {
        ogg(idImg[i], [`<</Type/XObject/Subtype/Image/Width ${im.w}/Height ${im.h}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/${im.filtro}${im.smask ? '/SMask ' + im.idMask + ' 0 R' : ''}/Length ${im.dati.length}>>\nstream\n`, im.dati, '\nendstream']);
        if (im.smask) ogg(im.idMask, [`<</Type/XObject/Subtype/Image/Width ${im.w}/Height ${im.h}/ColorSpace/DeviceGray/BitsPerComponent 8/Filter/FlateDecode/Length ${im.smask.length}>>\nstream\n`, im.smask, '\nendstream']);
      });
      const xo = this.img.length ? `/XObject<<${this.img.map((_, i) => `/Im${i} ${idImg[i]} 0 R`).join('')}>>` : '';
      this.pagine.forEach((ops, i) => {
        const s = enc.encode(ops.join('\n'));
        ogg(idPag(i), `<</Type/Page/Parent 2 0 R/MediaBox[0 0 ${f(PW * MM)} ${f(PH * MM)}]/Resources<</Font<</F1 3 0 R/F2 4 0 R>>${xo}>>/Contents ${idCont(i)} 0 R>>`);
        ogg(idCont(i), [`<</Length ${s.length}>>\nstream\n`, s, '\nendstream']);
      });
      const xref = pos;
      let x = `xref\n0 ${tot + 1}\n0000000000 65535 f \n`;
      for (let n = 1; n <= tot; n++) x += String(off[n]).padStart(10, '0') + ' 00000 n \n';
      push(x + `trailer\n<</Size ${tot + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`);
      return new Blob(parti, { type: 'application/pdf' });
    }
  }

  // ---- valori ----
  const dataIt = s => { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s || ''); return m ? `${m[3]}/${m[2]}/${m[1]}` : (s || ''); };
  const vuoto = v => v == null || v === '' || v === false || (Array.isArray(v) && !v.length);
  function testoValore(c, v) {
    if (vuoto(v)) return '';
    switch (c.tipo) {
      case 'data': return dataIt(v);
      case 'numero': return String(v) + (c.unita ? ' ' + c.unita : '');
      case 'multi': return v.join(', ');
      case 'scelta': return c.opzioni && c.opzioni.some(o => / - /.test(o)) ? String(v).split(' - ')[0] : String(v);   // tipo manutenzione: solo la lettera
      default: return String(v);
    }
  }
  const blocchiDi = I => (I && I.b) || {};
  // la scheda ha dati veri? (non contano i valori messi dall'app: data del giorno, periodicita' predefinita)
  function compilata(sc, S) {
    return (S && S.ist || []).some(I => {
      if (I.id && Object.values(I.id).some(v => !vuoto(v))) return true;
      return sc.blocchi.some((b, bi) => {
        const bv = blocchiDi(I)[bi];
        if (vuoto(bv)) return false;
        if (typeof bv === 'string') return true;
        if (b.tipo === 'firma') return !vuoto(bv.firma) || !vuoto(bv.esecutore);
        if (b.tipo === 'tabella') return (bv.righe || []).some(r => Object.entries(r).some(([k, v]) => !vuoto(v)));
        return Object.entries(bv).some(([k, v]) => !/_per$/.test(k) && !vuoto(v));
      });
    });
  }

  // ---- copertina: il cartiglio dello studio, con la stessa mappa dei campi di KAPPA ----
  // (cartiglio-assets.js = sfondo + posizioni; i timbri arrivano dai tecnici salvati sul dispositivo)
  function campiCopertina(m) {
    const A = window.GAMMA_CARTIGLIO, d = m.documento || {};
    return [
      { id: 'committente', etichetta: 'Committente', tipo: 'testo', da: ['struttura'] },
      { id: 'oggetto', etichetta: 'Oggetto', tipo: 'testo', da: ['oggetto', 'denominazione'] },
      { id: 'provincia', etichetta: 'Provincia', tipo: 'testo', da: ['provincia'], esempio: 'PROVINCIA DI MANTOVA' },
      { id: 'comune', etichetta: 'Comune', tipo: 'testo', da: ['comune', 'localita'], esempio: 'Comune di …' },
      { id: 'disciplina', etichetta: 'Disciplina (titolo grande)', tipo: 'testo', predefinito: 'IMPIANTI ELETTRICI' },
      { id: 'titolo', etichetta: 'Titolo del documento', tipo: 'testo', predefinito: d.titolo || m.titolo.toUpperCase() },
      { id: 'codice', etichetta: 'Codice elaborato', tipo: 'testo', predefinito: d.codice || '' },
      { id: 'commessa', etichetta: 'Commessa', tipo: 'testo', esempio: '25-' },
      { id: 'scala', etichetta: 'Scala', tipo: 'testo', predefinito: '-' },
      { id: 'livelli', etichetta: 'Livello di progettazione', tipo: 'multi', opzioni: A ? Object.keys(A.livelli) : [] },
      { id: 'tecnico', etichetta: 'Tecnico (timbro)', tipo: 'tecnico', da: ['responsabile'] },
    ];
  }
  const CAMPI_REV = [['rev', 'Rev.', '00'], ['descrizione', 'Descrizione', 'EMISSIONE'], ['data', 'Data', ''], ['elaborato', 'Elaborato', ''], ['controllato', 'Controllato', ''], ['approvato', 'Approvato', '']];
  // valori effettivi della copertina: quello scritto, altrimenti i dati della struttura, altrimenti il predefinito
  function valoriCopertina(m, valori) {
    const cop = (valori && valori.cop) || {}, intest = (valori && valori.intest) || {}, rev = cop.rev || {}, out = { rev: {} };
    for (const c of campiCopertina(m)) {
      let v = cop[c.id];
      if (vuoto(v)) v = (c.da || []).map(k => intest[k]).find(x => !vuoto(x)) || c.predefinito || (c.tipo === 'multi' ? [] : '');
      out[c.id] = v;
    }
    for (const [k, , d] of CAMPI_REV) out.rev[k] = vuoto(rev[k]) ? (k === 'data' ? new Date().toLocaleDateString('it-IT') : d) : rev[k];
    return out;
  }
  // testi del cartiglio in mm (posizione, corpo, a capo, riduzione se non stanno): come textRuns() di KAPPA
  function cartiglioRuns(v) {
    const A = window.GAMMA_CARTIGLIO; if (!A) return [];
    const F = A.fields, R = [], pt = s => s * PH * MM;
    const semplice = (fd, testo, minimo = 1.5) => {
      if (!fd || vuoto(testo)) return; const t = String(testo).trim(); let s = fd.size;
      if (fd.boxw) while (larg(t, pt(s)) > fd.boxw * PW && s > minimo / 297) s *= 0.94;
      R.push({ t, x: fd.x * PW, y: fd.y * PH, size: pt(s), align: fd.align || 'center', baseline: fd.baseline || 'alphabetic' });
    };
    const blocco = (fd, testo, maxRighe) => {
      if (!fd || vuoto(testo)) return;
      const maxW = (fd.width || 0.6) * PW, maxH = fd.boxh ? fd.boxh * PH : 1e9;
      let s = fd.size, righe, lh;
      for (let k = 0; k < 14; k++) {
        righe = aCapo(testo, pt(s), false, maxW); lh = s * PH * 1.16;
        if (((!maxRighe || righe.length <= maxRighe) && righe.length * lh <= maxH) || s <= 2.5 / 297) break;
        s *= 0.92;
      }
      const y0 = fd.y * PH - (righe.length - 1) * lh / 2;
      righe.forEach((l, i) => R.push({ t: l, x: fd.x * PW, y: y0 + i * lh, size: pt(s), align: 'center', baseline: 'middle' }));
    };
    semplice(F.provincia, v.provincia); semplice(F.comune, v.comune);
    blocco(F.committente, v.committente); blocco(F.oggetto, v.oggetto);
    semplice(F.disciplina, v.disciplina); semplice(F.commessa, v.commessa); semplice(F.scala, v.scala);
    semplice(F.elaborato, v.codice); blocco(F.tipo_documento, String(v.titolo || '').toUpperCase(), 3);
    Object.entries(F.revisione || {}).forEach(([k, fd]) => semplice(fd, v.rev[k], 1.2));
    return R;
  }
  async function copertina(doc, m, valori, tecnici) {
    const A = window.GAMMA_CARTIGLIO, v = valoriCopertina(m, valori);
    doc.nuovaPagina();
    doc.immagine(await doc.aggiungiImmagine(A.template, { qualita: 0.9 }), 0, 0, PW, PH);
    for (const r of cartiglioRuns(v))
      doc.testo(r.x, r.baseline === 'middle' ? r.y + MEZZO * r.size / MM : r.y, r.t, { size: r.size, allinea: r.align === 'center' ? 'centro' : r.align === 'right' ? 'dx' : null });
    for (const nome of v.livelli || []) {                       // X nelle caselle del livello di progettazione
      const l = A.livelli[nome]; if (!l) continue;
      const cx = l.x * PW, cy = l.y * PH, s = l.s * PH;
      doc.linea(cx - s, cy - s, cx + s, cy + s, 0.35); doc.linea(cx - s, cy + s, cx + s, cy - s, 0.35);
    }
    const t = (tecnici || []).find(x => x.nome === v.tecnico);
    if (t && t.timbro) {                                        // timbro centrato nel riquadro IL TECNICO
      const b = A.tecnicoBox, bx = b.x0 * PW, by = b.y0 * PH, bw = (b.x1 - b.x0) * PW, bh = (b.y1 - b.y0) * PH, pad = bw * 0.06;
      const im = await doc.aggiungiImmagine(t.timbro, { alfa: true, maxPx: 1200 }), ii = doc.img[im];
      const r = Math.min((bw - 2 * pad) / ii.w, (bh - 2 * pad) / ii.h), w = ii.w * r, h = ii.h * r;
      doc.immagine(im, bx + (bw - w) / 2, by + (bh - h) / 2, w, h);
    }
    return v;
  }

  // ---- impaginazione ----
  async function registro(m, valori, opz = {}) {
    valori = valori || {}; const schedeV = valori.schede || {}, intest = valori.intest || {};
    const scelta = opz.schede || 'compilate';
    const schede = m.schede.filter(sc => Array.isArray(scelta) ? scelta.includes(sc.id) : scelta === 'tutte' || compilata(sc, schedeV[sc.id]));
    const doc = new Doc(), W = PW - ML - MR;
    const oggi = new Date().toLocaleDateString('it-IT');
    const titoloStruttura = [intest.struttura, intest.comune || intest.localita].filter(Boolean).join(' - ');
    let y = 0, codice = '';
    // copertina (cartiglio) e logo dello studio, se disponibili
    const cop = window.GAMMA_CARTIGLIO ? await copertina(doc, m, valori, opz.tecnici) : null;
    const logo = window.GAMMA_LOGO ? await doc.aggiungiImmagine(window.GAMMA_LOGO, { maxPx: 900, qualita: 0.92 }) : null;
    const testata = () => {
      doc.rett(ML, MT, W, 13, { col: BLU, lw: 0.4 });
      let xt = ML + 3;
      if (logo != null) { doc.immagine(logo, ML + 2, MT + 1.6, 33, 9.9); doc.linea(ML + 37, MT + 2, ML + 37, MT + 11, 0.2, GRIGIO); xt = ML + 40; }
      doc.testo(xt, MT + 5.5, m.titolo, { size: 10, bold: true, col: BLU });
      doc.testo(xt, MT + 10.3, titoloStruttura || 'Struttura non indicata', { size: 8.5, col: GRIGIO });
      if (codice) doc.testo(PW - MR - 3, MT + 8.5, codice, { size: 14, bold: true, col: BLU, allinea: 'dx' });
      y = MT + 19;
    };
    const pagina = () => { doc.nuovaPagina(); testata(); };
    let riserva = 0;                                  // spazio tenuto libero in fondo per la legenda della scheda
    const fondo = () => PH - MB - 8 - riserva;
    const spazio = h => { if (y + h > fondo()) pagina(); };
    const firme = new Map();
    const firmaImg = async du => { if (!firme.has(du)) firme.set(du, await doc.aggiungiImmagine(du)); return firme.get(du); };

    // riquadro esito: □P □N □NA come sui moduli Word, con la scelta piena
    function esito(x, yb, v, tipo) {
      const voci = tipo === 'esitoPN' ? [['P', 'Positivo'], ['N', 'Negativo']] : [['P', 'P'], ['N', 'N'], ['NA', 'NA']];
      let xx = x;
      for (const [k, l] of voci) {
        const on = v === k, col = k === 'P' ? OK : k === 'N' ? KO : GRIGIO;
        doc.rett(xx, yb - 2.6, 2.8, 2.8, { col: on ? col : GRIGIO, lw: 0.25, riemp: on ? col : null });
        if (on) { doc.linea(xx + 0.5, yb - 1.2, xx + 1.2, yb - 0.4, 0.4, [1, 1, 1]); doc.linea(xx + 1.2, yb - 0.4, xx + 2.4, yb - 2.1, 0.4, [1, 1, 1]); }
        doc.testo(xx + 3.6, yb, l, { size: 7.5, bold: on, col: on ? col : GRIGIO });
        xx += 3.6 + larg(l, 7.5, on) + 2.6;
      }
    }
    const larghezzaEsito = t => t === 'esitoPN' ? 37 : 29;
    function spunta(x, yb, on) {
      doc.rett(x, yb - 2.6, 2.8, 2.8, { col: GRIGIO, lw: 0.25 });
      if (on) { doc.linea(x + 0.5, yb - 1.2, x + 1.2, yb - 0.4, 0.4, BLU); doc.linea(x + 1.2, yb - 0.4, x + 2.4, yb - 2.1, 0.4, BLU); }
    }
    const titoloBlocco = t => { spazio(9); doc.testo(ML, y + 3, t.toUpperCase(), { size: 7.5, bold: true, col: GRIGIO }); y += 5; };

    // tabella generica: colonne [{etichetta, w, tipo, ...}], righe = array di array di "celle"
    async function tabella(colonne, righe, opzT = {}) {
      const intest = () => {
        const h = Math.max(...colonne.map(c => aCapo(c.etichetta, 7, true, c.w - 2).length)) * 3 + 2.4;
        spazio(h + 8);
        let x = ML;
        for (const c of colonne) { doc.rett(x, y, c.w, h, { riemp: CHIARO, col: GRIGIO }); aCapo(c.etichetta, 7, true, c.w - 2).forEach((l, i) => doc.testo(x + 1, y + 3.4 + i * 3, l, { size: 7, bold: true, col: GRIGIO })); x += c.w; }
        y += h;
      };
      intest();
      for (const riga of righe) {
        const linee = colonne.map((c, i) => { const v = riga[i]; return v && v.tipo ? [] : aCapo(v == null ? '' : v, 8, !!c.grassetto, c.w - 2); });
        const hFirma = colonne.some((c, i) => riga[i] && riga[i].tipo === 'firma' && riga[i].v) ? 11 : 0;
        const h = Math.max(opzT.minH || 6, ...linee.map(l => l.length * 3.5 + 2.5), hFirma);
        if (y + h > fondo()) { pagina(); intest(); }
        let x = ML;
        for (let i = 0; i < colonne.length; i++) {
          const c = colonne[i], v = riga[i];
          doc.rett(x, y, c.w, h, { col: GRIGIO });
          if (v && v.tipo === 'esito') esito(x + 1.2, y + 4.2, v.v, v.t);
          else if (v && v.tipo === 'spunta') spunta(x + c.w / 2 - 1.4, y + 4.2, v.v);
          else if (v && v.tipo === 'firma') { if (v.v) { const im = await firmaImg(v.v); const ii = doc.img[im]; const hh = h - 2, ww = Math.min(c.w - 2, hh * ii.w / ii.h); doc.immagine(im, x + 1, y + 1, ww, hh); } }
          else linee[i].forEach((l, k) => doc.testo(x + 1, y + 4 + k * 3.5, l, { size: 8, bold: !!c.grassetto }));
          x += c.w;
        }
        y += h;
      }
      y += 3;
    }
    const distribuisci = (fisse, flessibili) => { const libero = W - fisse.reduce((a, c) => a + c, 0); return flessibili.map(p => libero * p / flessibili.reduce((a, b) => a + b, 0)); };
    const LARG = { auto: 9, esito: 29, esitoPN: 37, numero: 18, data: 20, ora: 14, firma: 28, spunta: 10, fisso: 22 };

    async function blocco(b, bv, I, sc) {
      bv = bv || {};
      if (b.tipo === 'campi') {
        const righe = b.campi.map(c => [c.etichetta, c.tipo === 'multi' ? (c.opzioni || []).map(o => ((bv[c.id] || []).includes(o) ? '[X] ' : '[  ] ') + o).join('    ') : testoValore(c, bv[c.id])]);
        await tabella([{ etichetta: 'Dato', w: 70, grassetto: true }, { etichetta: 'Valore', w: W - 70 }], righe);
      } else if (b.tipo === 'lista') {
        const extra = b.colonne || [];
        const wEx = extra.map(c => c.tipo === 'testo' ? 0 : c.tipo === 'scelta' ? 11 : c.tipo === 'numero' ? 19 : (LARG[c.tipo] || 18));
        const wRisp = b.esito === false ? 0 : Math.max(...b.righe.map(r => r.risposta === false ? 0 : larghezzaEsito((r.risposta || { tipo: 'esito' }).tipo)));
        const testiEx = extra.filter(c => c.tipo === 'testo').length;
        const flex = distribuisci([9, wRisp, ...wEx], [3, ...Array(testiEx).fill(1.2)]);
        let fi = 1;
        const col = [{ etichetta: 'N°', w: 9 }, { etichetta: b.titolo || 'Controlli', w: flex[0] }];
        if (wRisp) col.push({ etichetta: 'Esito', w: wRisp });
        extra.forEach((c, i) => col.push({ etichetta: c.etichetta + (c.unita ? ' (' + c.unita + ')' : ''), w: wEx[i] || flex[fi++] }));
        const righe = b.righe.map((r, ri) => {
          const n = r.n != null ? r.n : ri + 1, v = bv['r' + n], t = (r.risposta || { tipo: 'esito' }).tipo;
          const cel = [String(n), r.testo + (r.nota ? '\n' + r.nota : '')];
          if (wRisp) cel.push(r.risposta === false ? '' : (t === 'esito' || t === 'esitoPN') ? { tipo: 'esito', v, t } : t === 'spunta' ? { tipo: 'spunta', v: !!v } : testoValore(r.risposta, v));
          extra.forEach(c => { const x = bv['r' + n + '_' + c.id]; cel.push(c.tipo === 'firma' ? { tipo: 'firma', v: x } : testoValore(c, x)); });
          return cel;
        });
        await tabella(col, righe);
      } else if (b.tipo === 'tabella') {
        if (b.titolo) titoloBlocco(b.titolo);
        const cols = b.colonne, fisse = cols.map(c => c.tipo === 'testo' || c.tipo === 'scelta' ? 0 : (LARG[c.tipo] || 18));
        const pesi = cols.filter((c, i) => !fisse[i]).map(c => c.largo ? 2.4 : 1);
        const flex = distribuisci(fisse.filter(Boolean), pesi.length ? pesi : [1]);
        let fi = 0;
        const col = cols.map((c, i) => ({ etichetta: c.etichetta + (c.unita ? ' (' + c.unita + ')' : ''), w: fisse[i] || flex[fi++] }));
        let righe = (bv.righe && bv.righe.length) ? bv.righe : (b.righeFisse ? b.righeFisse.map(() => ({})) : Array.from({ length: b.min || 3 }, () => ({})));
        const celle = righe.map((r, ri) => cols.map(c => c.tipo === 'auto' ? String(ri + 1) : c.tipo === 'fisso' ? b.righeFisse[ri]
          : c.tipo === 'esito' ? { tipo: 'esito', v: r[c.id], t: 'esito' } : c.tipo === 'firma' ? { tipo: 'firma', v: r[c.id] } : testoValore(c, r[c.id])));
        await tabella(col, celle, { minH: 7 });
      } else if (b.tipo === 'note') {
        const t = typeof bv === 'string' ? bv : '';
        const linee = aCapo(t, 8.5, false, W - 4), h = Math.max(18, linee.length * 3.8 + 8);
        spazio(Math.min(h, 60));
        doc.rett(ML, y, W, h, { col: GRIGIO });
        doc.testo(ML + 2, y + 4, 'NOTE', { size: 7, bold: true, col: GRIGIO });
        let yy = y + 8.5;
        for (const l of linee) { if (yy > fondo()) { y = yy; pagina(); yy = y + 4; } doc.testo(ML + 2, yy, l, { size: 8.5 }); yy += 3.8; }
        y = Math.max(y + h, yy) + 3;
      } else if (b.tipo === 'firma') {
        spazio(20);
        doc.testo(ML, y + 5, 'DATA:', { size: 8, bold: true, col: GRIGIO }); doc.testo(ML + 11, y + 5, dataIt(bv.data) || '______________', { size: 9 });
        doc.testo(ML + 45, y + 5, 'ESECUTORE:', { size: 8, bold: true, col: GRIGIO }); doc.testo(ML + 64, y + 5, bv.esecutore || '____________________', { size: 9 });
        doc.testo(ML + 118, y + 5, 'FIRMA:', { size: 8, bold: true, col: GRIGIO });
        if (bv.firma) { const im = await firmaImg(bv.firma), ii = doc.img[im]; const hh = 14, ww = Math.min(60, hh * ii.w / ii.h); doc.immagine(im, ML + 130, y - 2, ww, hh); }
        else doc.linea(ML + 130, y + 5.5, PW - MR, y + 5.5, 0.2, GRIGIO);
        y += 17;
      } else if (b.tipo === 'verifiche') {
        const vals = Object.assign({}, ...sc.blocchi.map((bb, i) => bb.tipo === 'campi' ? (blocchiDi(I)[i] || {}) : {}));
        const righe = b.righe.map((r, ri) => { let x = null; try { x = r.calcola(vals); } catch (e) {} return [String(ri + 1), r.testo + (x ? '\n' + x.testo : ''), x ? (x.ok ? 'OK' : 'NO') : '-']; });
        await tabella([{ etichetta: 'N°', w: 9 }, { etichetta: b.titolo || 'Verifiche', w: W - 29 }, { etichetta: 'Esito', w: 20, grassetto: true }], righe);
      }
    }

    // ---- frontespizio ----
    codice = '';
    pagina();
    doc.testo(ML, y + 8, m.titolo, { size: 16, bold: true, col: BLU });
    doc.testo(ML, y + 14, m.norma || '', { size: 9, col: GRIGIO });
    y += 22;
    await tabella([{ etichetta: 'Dati della struttura', w: 70, grassetto: true }, { etichetta: '', w: W - 70 }], m.intestazione.map(c => [c.etichetta, testoValore(c, intest[c.id])]));
    titoloBlocco('Schede contenute');
    await tabella([{ etichetta: 'Codice', w: 18, grassetto: true }, { etichetta: 'Scheda', w: W - 18 - 38 }, { etichetta: 'Periodicità', w: 38 }],
      schede.map(sc => [sc.codice, sc.titolo, sc.periodicita || '']));
    if (!schede.length) doc.testo(ML, y + 4, 'Nessuna scheda compilata.', { size: 9, col: GRIGIO });

    // ---- schede ----
    for (const sc of schede) {
      const S = schedeV[sc.id] || {}, ist = (S.ist && S.ist.length) ? S.ist : [{}];
      // legenda della scheda: il suo spazio in fondo alle pagine resta libero, cosi' sta sempre sull'ultima
      const usaPNNA = sc.blocchi.some(b => (b.tipo === 'tabella' && b.colonne.some(c => c.tipo === 'esito')) || (b.tipo === 'lista' && b.esito !== false && b.righe.some(r => !r.risposta || r.risposta.tipo === 'esito')));
      const usaTipi = sc.blocchi.some(b => (b.colonne || []).some(c => c.id === 'tipo'));
      const leg = [usaPNNA ? '* P = Positivo; N = Negativo; NA = Non applicabile.' : '', usaTipi ? (m.legendaTipi || '') : '', sc.legenda || ''].filter(Boolean);
      const righeLeg = [].concat(...leg.map(l => aCapo(l, 7, false, W)));
      riserva = righeLeg.length ? righeLeg.length * 3.2 + 3 : 0;
      for (let k = 0; k < ist.length; k++) {
        const I = ist[k];
        codice = sc.codice; pagina();
        aCapo(sc.titolo, 12, true, W).forEach((l, i) => doc.testo(ML, y + 5 + i * 5, l, { size: 12, bold: true }));
        y += aCapo(sc.titolo, 12, true, W).length * 5 + 2;
        doc.testo(ML, y + 3, [sc.periodicita ? 'Periodicità: ' + sc.periodicita : '', m.norma].filter(Boolean).join('   ·   '), { size: 8, col: GRIGIO });
        y += 7;
        if (sc.descrizione) { aCapo(sc.descrizione, 8, false, W).forEach(l => { doc.testo(ML, y + 2, l, { size: 8, col: GRIGIO }); y += 3.6; }); y += 2; }
        if (sc.ripeti) await tabella([{ etichetta: sc.ripeti.etichetta, w: 70, grassetto: true }, { etichetta: '', w: W - 70 }], sc.ripeti.campi.map(c => [c.etichetta, testoValore(c, (I.id || {})[c.id])]));
        for (let bi = 0; bi < sc.blocchi.length; bi++) await blocco(sc.blocchi[bi], blocchiDi(I)[bi], I, sc);
        // legenda in fondo all'ultima pagina della scheda, sopra il pie' di pagina (come sui moduli Word)
        const yl = PH - MB - 6.5 - (righeLeg.length - 1) * 3.2;
        righeLeg.forEach((r, i) => doc.testo(ML, yl + i * 3.2, r, { size: 7, col: GRIGIO }));
      }
    }
    riserva = 0;
    // ---- pie' di pagina con numerazione ----
    const n = doc.pagine.length;
    const rif = cop && cop.codice ? cop.codice + ' - Rev. ' + (cop.rev.rev || '00') + ' del ' + cop.rev.data + '   ·   ' : '';
    doc.pagine.forEach((ops, i) => {
      if (cop && i === 0) return;                               // la copertina ha gia' il suo cartiglio
      doc.p = ops;
      doc.linea(ML, PH - MB - 4, PW - MR, PH - MB - 4, 0.2, GRIGIO);
      doc.testo(ML, PH - MB, rif + 'Registro generato con GAMMA il ' + oggi, { size: 7, col: GRIGIO });
      doc.testo(PW - MR, PH - MB, 'Pag. ' + (i + 1) + ' di ' + n, { size: 7, col: GRIGIO, allinea: 'dx' });
    });
    return doc.blob();
  }

  window.GammaPDF = { registro, compilata, campiCopertina, valoriCopertina, cartiglioRuns, CAMPI_REV };
})();
