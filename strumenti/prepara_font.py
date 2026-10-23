# -*- coding: utf-8 -*-
"""
Prepara font-calibri.js: il font Carlito (gemello libero di Calibri, stesse larghezze
lettera per lettera, licenza SIL OFL) ridotto ai caratteri WinAnsi (cp1252) usati nel PDF.

    python strumenti/prepara_font.py <Carlito-Regular.ttf> <Carlito-Bold.ttf>

Il file prodotto contiene per ciascun peso: il TTF ridotto (base64) e le metriche per il PDF
(larghezze dei codici 32-255 in millesimi di em, ascendente, discendente, altezza maiuscole,
bounding box). L'app lo usa sia per scrivere il PDF sia per l'anteprima a schermo.
Calibri vero non si puo' pubblicare (font Microsoft): Carlito ne e' il sostituto metrico.
"""
import sys, io, json, base64
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools import subset

if len(sys.argv) < 3:
    sys.exit(__doc__)

CODICI = list(range(32, 256))
def car(c):
    try: return bytes([c]).decode('cp1252')
    except UnicodeDecodeError: return None

def prepara(percorso, nome):
    testo = ''.join(ch for ch in map(car, CODICI) if ch)
    opz = subset.Options(); opz.notdef_outline = True; opz.name_IDs = ['*']; opz.layout_features = []
    font = TTFont(percorso)
    s = subset.Subsetter(opz); s.populate(text=testo); s.subset(font)
    buf = io.BytesIO(); font.save(buf); dati = buf.getvalue()
    upm = font['head'].unitsPerEm
    cmap = font.getBestCmap(); hmtx = font['hmtx']
    k = 1000 / upm
    vuoto = round(hmtx['.notdef'][0] * k)
    larghezze = [round(hmtx[cmap[ord(ch)]][0] * k) if ch and ord(ch) in cmap else vuoto for ch in map(car, CODICI)]
    h = font['head']; os2 = font['OS/2']
    return {
        'nome': nome, 'ttf': base64.b64encode(dati).decode(), 'primo': 32, 'larghezze': larghezze,
        'ascent': round(font['hhea'].ascent * k), 'descent': round(font['hhea'].descent * k),
        'capHeight': round(getattr(os2, 'sCapHeight', 0) * k) or 644,
        'bbox': [round(h.xMin * k), round(h.yMin * k), round(h.xMax * k), round(h.yMax * k)],
    }

out = {'regular': prepara(sys.argv[1], 'Carlito'), 'bold': prepara(sys.argv[2], 'Carlito-Bold')}
dest = Path(__file__).resolve().parent.parent / 'font-calibri.js'
dest.write_text('/* Font Carlito (sostituto metrico di Calibri, SIL Open Font License: vedi font/OFL.txt).\n'
                '   Generato da strumenti/prepara_font.py. */\n'
                'window.GAMMA_FONT = ' + json.dumps(out, separators=(',', ':')) + ';\n', encoding='utf-8')
print('scritto', dest, round(dest.stat().st_size / 1024), 'KB',
      '| TTF ridotti:', {k: round(len(base64.b64decode(v['ttf'])) / 1024) for k, v in out.items()}, 'KB')
