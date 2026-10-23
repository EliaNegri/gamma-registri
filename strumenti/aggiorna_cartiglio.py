# -*- coding: utf-8 -*-
"""
Prepara cartiglio-assets.js per GAMMA partendo dagli asset del cartiglio di KAPPA (Officina).

    python strumenti/aggiorna_cartiglio.py <percorso di Cartigli/cartigli_assets.js>

Copia SOLO lo sfondo del cartiglio (PNG), la mappa dei campi, le caselle del livello
di progettazione e il riquadro "Il tecnico". I TIMBRI NON vengono copiati: questo
repository e' pubblico; i timbri si importano su ogni dispositivo dall'app (⚙ Tecnici).
Da rilanciare quando cambia il disegno del cartiglio in KAPPA.
"""
import sys, re, json
from pathlib import Path

if len(sys.argv) < 2:
    sys.exit(__doc__)
src = Path(sys.argv[1])
d = json.loads(re.search(r'=\s*(\{.*\})\s*;?\s*$', src.read_text(encoding='utf-8'), re.S).group(1))
out = {k: d[k] for k in ('template', 'templateW', 'templateH', 'fields', 'livelli', 'tecnicoBox')}
dest = Path(__file__).resolve().parent.parent / 'cartiglio-assets.js'
dest.write_text('/* Cartiglio dello studio (da KAPPA, senza timbri): generato da strumenti/aggiorna_cartiglio.py */\n'
                'window.GAMMA_CARTIGLIO = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')
print('scritto', dest, round(dest.stat().st_size / 1024), 'KB')
