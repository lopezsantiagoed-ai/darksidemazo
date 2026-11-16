#!/usr/bin/env python3
"""Genera QEP-Arcade.html: el juego entero en un solo archivo (sin carpeta js/)."""
import pathlib, re

root = pathlib.Path(__file__).parent
html = (root / 'index.html').read_text(encoding='utf-8')

def inline(m):
    src = m.group(1)
    code = (root / src).read_text(encoding='utf-8').replace('</script', '<\\/script')
    return '<script>\n/* ' + src + ' */\n' + code + '\n</script>'

out = re.sub(r'<script src="([^"]+)"></script>', inline, html)
(root / 'QEP-Arcade.html').write_text(out, encoding='utf-8')
print('QEP-Arcade.html generado:', len(out) // 1024, 'KB')
