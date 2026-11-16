// ===== QEP ARCADE — personajes, mapas y jefes =====
'use strict';

// ---------- LOOKS ----------
const HEROES = {
  juani: { name: 'JUANI', look: { skin: '#f0c2a6', hair: '#7a4a28', hairStyle: 'mullet', specs: '#3a3030', mustache: '#5a3418', stubble: '#c99a84', shirt: 'boca', pants: '#1a1a1a', shorts: true, shoes: '#f0f0f0' } },
  nico: { name: 'NICO', look: { skin: '#e8b898', hair: '#1a1410', hairStyle: 'short', stubble: '#8a6a58', hat: 'cap', hatCol: '#2b2e2e', shirt: 'riverAlt', pants: '#1f1f24', shoes: '#f0f0f0' } },
  santi: { name: 'SANTI', look: { skin: '#e8b898', hair: '#1a1410', hairStyle: 'buzz', beard: '#3a2a20', mustache: '#2a1a12', hat: 'capBack', hatCol: '#5a3e2a', shirt: 'river', pants: '#2a2a30', shorts: true, socks: '#f4f4f4', shoes: '#222' } },
  fran: { name: 'FRAN', look: { skin: '#f2c8a8', hair: '#2a1d16', hairStyle: 'receding', mustache: '#2a1d16', stubble: '#c99e86', shirt: 'banfield', pants: '#2a2f3a', shoes: '#fff' } },
  martin: { name: 'MARTIN', look: { skin: '#e2ae88', hair: '#5a3a22', hair2: '#5a3a22', hairStyle: 'twotone', mustache: '#2a1d16', stubble: '#b88a6c', shirt: 'rojo', pants: '#222', shoes: '#f0f0f0', h: 1.15, beer: true } },
};

const pal = (arr, i) => arr[Math.abs(i) % arr.length];

// ---------- helpers de fondo ----------
function layer(camX, k, spacing, fn) {
  const off = camX * k;
  const i0 = Math.floor(off / spacing) - 1, n = Math.ceil(W / spacing) + 3;
  for (let i = i0; i < i0 + n; i++) fn(i, Math.round(i * spacing - off));
}
function skyGrad(ctx, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, FLOOR_TOP);
  stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR_TOP + 4);
}
function clouds(ctx, camX, t, col = 'rgba(255,255,255,0.9)') {
  layer(camX + t * 0.1, 0.05, 150, (i, x) => {
    const y = 14 + rnd(i) * 34, w = 30 + rnd(i + 3) * 30;
    ctx.fillStyle = col;
    ctx.fillRect(x, y, w, 6); ctx.fillRect(x + 6, y - 4, w - 14, 5); ctx.fillRect(x + 12, y - 7, w - 26, 4);
  });
}
function lamppost(ctx, x, y, style) {
  if (style === 'banfield') {
    rect(ctx, x - 1, y - 54, 3, 54, '#1c1c1c'); rect(ctx, x - 3, y - 4, 7, 4, '#1c1c1c');
    rect(ctx, x - 4, y - 64, 9, 2, '#1c1c1c'); rect(ctx, x - 3, y - 62, 7, 8, '#fff3b0'); rect(ctx, x - 3, y - 62, 1, 8, '#1c1c1c'); rect(ctx, x + 3, y - 62, 1, 8, '#1c1c1c');
    rect(ctx, x - 2, y - 66, 5, 2, '#1c1c1c'); rect(ctx, x, y - 68, 1, 2, '#1c1c1c');
  } else {
    rect(ctx, x - 1, y - 50, 2, 50, '#2b2b2b'); rect(ctx, x - 1, y - 50, 10, 2, '#2b2b2b'); rect(ctx, x + 6, y - 48, 5, 3, '#ffe9a0');
  }
}
function crowdPerson(i, palette) {
  return {
    skin: pal(palette.skins, (rnd(i + 1) * 97) | 0), hair: pal(palette.hairs, (rnd(i + 2) * 97) | 0), hairStyle: pal(palette.hairStyles, (rnd(i + 3) * 97) | 0),
    shirt: pal(palette.shirts, (rnd(i + 4) * 97) | 0), shirtCol: pal(palette.cols, (rnd(i + 5) * 97) | 0), shirtCol2: '#ffe14d',
    pants: pal(palette.pants, (rnd(i + 6) * 97) | 0), shoes: '#222', glasses: rnd(i * 9) < 0.15 ? '#111' : null,
    hat: rnd(i * 17) < (palette.hatChance || 0) ? pal(palette.hats, (rnd(i + 7) * 97) | 0) : null, hatCol: pal(palette.cols, (rnd(i + 8) * 97) | 0),
  };
}
function floorStripe(ctx, y0, col, joints, camX, sp = 24) {
  rect(ctx, 0, y0, W, 8, col);
  ctx.fillStyle = joints;
  layer(camX, 1, sp, (i, x) => ctx.fillRect(x, y0, 1, 8));
}

// =====================================================================
// LA BOCA (Juani)
// =====================================================================
function bgBoca(ctx, camX, t, g) {
  skyGrad(ctx, ['#69b8ef', '#a6dcff', '#e4f6ff']);
  clouds(ctx, camX, t);
  // edificios lejanos
  layer(camX, 0.1, 46, (i, x) => { const h = 30 + rnd(i) * 40; rect(ctx, x, 120 - h, 42, h + 20, '#9db5c9'); });
  // LA BOMBONERA
  const bx = Math.round(110 - camX * 0.06);
  rect(ctx, bx, 26, 250, 120, '#173a8f');
  rect(ctx, bx - 4, 22, 258, 5, '#f5c400');
  for (let r = 0; r < 2; r++) for (let k = 0; k < 30; k++) rect(ctx, bx + 6 + k * 8, 30 + r * 6, 5, 4, '#0e2660');
  rect(ctx, bx, 44, 250, 13, '#f5c400');
  txt(ctx, 'LA BOMBONERA', bx + 125, 47, '#173a8f', 8, 'center', null);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 30; k++) rect(ctx, bx + 6 + k * 8, 61 + r * 6, 5, 4, '#0e2660');
  rect(ctx, bx, 80, 250, 3, '#f5c400');
  for (let k = 0; k < 12; k++) { rect(ctx, bx + 8 + k * 20, 88, 12, 18, '#0e2660'); rect(ctx, bx + 8 + k * 20, 86, 12, 2, '#f5c400'); }
  [bx + 4, bx + 242].forEach(lx => { rect(ctx, lx, 14, 3, 10, '#555'); rect(ctx, lx - 6, 10, 15, 6, '#ddd'); for (let a = 0; a < 3; a++) rect(ctx, lx - 5 + a * 5, 11, 3, 3, '#fffbe0'); });
  // casas de chapa de Caminito
  const cols = ['#e63946', '#f4a300', '#1d70b8', '#2a9d58', '#f2d22e', '#e76fae', '#46b3c9', '#8e44ad'];
  layer(camX, 0.45, 64, (i, x) => {
    const h = 46 + Math.floor(rnd(i) * 22), top = 146 - h;
    const c1 = pal(cols, i * 3), c2 = pal(cols, i * 5 + 2), mid = top + Math.floor(h / 2);
    rect(ctx, x, top, 60, mid - top, c2); rect(ctx, x, mid, 60, 146 - mid, c1);
    ctx.fillStyle = 'rgba(0,0,0,0.13)'; for (let k = 0; k < 60; k += 3) ctx.fillRect(x + k, top, 1, h);
    rect(ctx, x - 2, top - 3, 64, 3, '#7b8a8f'); // techo de chapa
    // planta alta: ventanas + balcón
    rect(ctx, x + 8, top + 6, 12, 14, '#2d4a3a'); rect(ctx, x + 38, top + 6, 12, 14, '#2d4a3a');
    rect(ctx, x + 9, top + 7, 4, 12, pal(cols, i + 1)); rect(ctx, x + 45, top + 7, 4, 12, pal(cols, i + 1));
    rect(ctx, x + 4, mid - 4, 52, 2, '#222'); for (let k = 0; k < 52; k += 4) rect(ctx, x + 4 + k, mid - 10, 1, 6, '#222');
    // planta baja
    rect(ctx, x + 6, mid + 6, 14, 146 - mid - 6, '#3a2a20'); rect(ctx, x + 28, mid + 8, 22, 14, '#2d4a3a'); rect(ctx, x + 29, mid + 9, 9, 12, '#a7d3e8');
    // escalera de hierro
    if (rnd(i * 7) < 0.3) for (let k = 0; k < 6; k++) rect(ctx, x + 52 - k * 2, mid - 4 + k * 5, 6, 1, '#333');
    // ropa colgada
    ctx.fillStyle = '#333'; ctx.fillRect(x + 60, top + 24, 4, 1);
    for (let k = 0; k < 2; k++) rect(ctx, x + 60 + k * 2, top + 25, 2, 4, pal(cols, i + k * 3 + 4));
    // tangueros
    if (i % 6 === 2) {
      const f = ((t / 12) | 0) & 3;
      drawPerson(ctx, { skin: '#e8b58c', hair: '#111', hairStyle: 'short', shirt: 'suit', shirtCol: '#151515', pants: '#151515', shoes: '#111' }, f & 1 ? 'dance' : 'idle', f, x + 24, 146, 1, 0.8);
      drawPerson(ctx, { skin: '#f0c4a0', hair: '#111', hairStyle: 'ponytail', shirt: 'plain', shirtCol: '#c0142a', pants: '#c0142a', shoes: '#111' }, f & 1 ? 'idle' : 'dance', f + 1, x + 34, 146, -1, 0.8);
    }
    if (i % 5 === 0) {
      rect(ctx, x + 2, 104, 2, 42, '#333'); rect(ctx, x - 14, 98, 36, 8, '#1d4f91'); txt(ctx, 'CAMINITO', x + 4, 99, '#fff', 5, 'center', null);
    }
  });
  // vereda
  rect(ctx, 0, 144, W, 10, '#a59c8f');
  ctx.fillStyle = '#8b8277'; layer(camX, 1, 20, (i, x) => ctx.fillRect(x, 144, 1, 8));
  rect(ctx, 0, 152, W, 2, '#6d655b');
  // empedrado
  rect(ctx, 0, 154, W, H - 154, '#6b6259');
  for (let r = 0; r < 11; r++) {
    const y = 154 + r * 6, off = (r & 1) * 5;
    layer(camX, 1, 10, (i, x) => { rect(ctx, x + off, y, 9, 5, rnd(i * 31 + r) < 0.5 ? '#7a7066' : '#71675e'); });
  }
  // farolas
  layer(camX, 1, 260, (i, x) => lamppost(ctx, x + 40, 147));
  // EL GENOVÉS
  const gx = Math.round(g.lv.genoves - camX);
  if (gx > -200 && gx < W + 20) {
    rect(ctx, gx, 52, 180, 96, '#e8dcc0');
    rect(ctx, gx - 4, 48, 188, 6, '#c9b893'); rect(ctx, gx, 92, 180, 3, '#c9b893');
    for (let k = 0; k < 4; k++) rect(ctx, gx + 14 + k * 44, 58, 20, 26, '#40624d');
    rect(ctx, gx + 20, 96, 140, 16, '#183d2b'); rect(ctx, gx + 21, 97, 138, 14, '#1f5038');
    txt(ctx, 'ALMACEN', gx + 90, 96, '#e9d28a', 5, 'center', null);
    txt(ctx, 'EL GENOVES', gx + 90, 103, '#f5d77a', 8, 'center', '#0d2418');
    for (let k = 0; k < 9; k++) rect(ctx, gx + 10 + k * 18, 114, 18, 6, k & 1 ? '#fff' : '#c62828');
    rect(ctx, gx + 12, 120, 50, 28, '#2d2016'); rect(ctx, gx + 14, 122, 46, 24, '#9fc6d4');
    for (let k = 0; k < 4; k++) { rect(ctx, gx + 16, 126 + k * 5, 42, 1, '#5a3a20'); for (let j = 0; j < 7; j++) rect(ctx, gx + 17 + j * 6, 123 + k * 5, 3, 3, pal(['#2e7d32', '#c62828', '#f5c400', '#6d4c41', '#1565c0'], j + k)); }
    rect(ctx, gx + 76, 118, 28, 30, '#3e2a1c'); rect(ctx, gx + 89, 118, 1, 30, '#2a1a10');
    rect(ctx, gx + 118, 120, 50, 28, '#2d2016'); rect(ctx, gx + 120, 122, 46, 24, '#9fc6d4');
    for (let j = 0; j < 4; j++) { rect(ctx, gx + 124 + j * 11, 132, 7, 12, '#7a1f1f'); rect(ctx, gx + 125 + j * 11, 128, 4, 4, '#c8a060'); }
    rect(ctx, gx + 168, 126, 14, 20, '#222'); txt(ctx, 'VERMU', gx + 175, 129, '#fff', 4, 'center', null); txt(ctx, 'SALAME', gx + 175, 136, '#fff', 3, 'center', null);
    [gx + 20, gx + 136].forEach(cx => { rect(ctx, cx, 140, 18, 8, '#a0703a'); for (let k = 0; k < 5; k++) rect(ctx, cx + 1 + k * 3, 137, 3, 3, pal(['#ff7043', '#ffca28', '#66bb6a'], k)); });
  }
}

// =====================================================================
// TOKIO (Nico + Santi P2) -> Estadio de Hiroshima
// =====================================================================
const KANJI = ['ラーメン', 'カラオケ', '居酒屋', '寿司', '東京', '渋谷', '新宿', 'ゲーム', '焼肉', '酒', '薬', 'ホテル'];
const NEON = ['#ff2e88', '#22e6ff', '#ffe600', '#7dff5a', '#ff8a00', '#b35cff'];
const JP_CROWD = { skins: ['#f0cfae', '#e8c39e', '#f5d6b8'], hairs: ['#111', '#1d1a18', '#3a2a20', '#111'], hairStyles: ['short', 'side', 'buzz', 'ponytail', 'long'],
  shirts: ['suit', 'suit', 'plain', 'gakuran', 'jacket'], cols: ['#2b2f3a', '#3b3f4a', '#ececec', '#7a8aa0', '#d9c7a8', '#1f2a44'], pants: ['#222', '#2b2f3a', '#444', '#1f2a44'], hatChance: 0.1, hats: ['cap'] };

function bgTokyo(ctx, camX, t, g) {
  if (g.section === 1) return bgHiroshima(ctx, camX, t, g);
  skyGrad(ctx, ['#05031a', '#1d0b3d', '#4a1660']);
  for (let i = 0; i < 40; i++) rect(ctx, (rnd(i) * W) | 0, (rnd(i + 50) * 70) | 0, 1, 1, (t + i * 7) % 90 < 80 ? '#fff' : '#557');
  // rascacielos de Shinjuku
  layer(camX, 0.15, 44, (i, x) => {
    const h = 50 + rnd(i) * 70, top = 146 - h;
    rect(ctx, x, top, 38, h, '#141432');
    for (let yy = top + 4; yy < 140; yy += 5) for (let xx = 3; xx < 36; xx += 5) if (rnd(i * 99 + yy * 3 + xx) < 0.4) rect(ctx, x + xx, yy, 2, 2, rnd(xx + yy) < 0.5 ? '#ffd86b' : '#7fe8ff');
  });
  // Skytree
  const sx = Math.round(300 - camX * 0.04);
  for (let y = 4; y < 146; y++) {
    const w = Math.round(3 + Math.pow((y - 4) / 142, 1.6) * 30);
    rect(ctx, sx - w / 2, y, w, 1, (y % 5 < 1) ? '#bcd8ff' : '#3c4c7c');
    if (y % 10 === 0) { rect(ctx, sx - w / 2, y, 1, 10, '#9fc7ff'); rect(ctx, sx + w / 2 - 1, y, 1, 10, '#9fc7ff'); }
  }
  rect(ctx, sx - 14, 56, 28, 9, '#e6f0ff'); rect(ctx, sx - 13, 59, 26, 3, '#4f7cff');
  rect(ctx, sx - 9, 34, 18, 5, '#e6f0ff'); rect(ctx, sx - 8, 36, 16, 1, '#b35cff');
  rect(ctx, sx - 1, 0, 2, 6, '#ccd'); if ((t >> 5) & 1) rect(ctx, sx - 2, 0, 4, 2, '#f33');
  // edificios con neones
  layer(camX, 0.5, 72, (i, x) => {
    const h = 66 + rnd(i) * 30, top = 146 - h;
    rect(ctx, x, top, 66, h, pal(['#231f3a', '#1b2236', '#2a1a30'], i));
    for (let yy = top + 6; yy < 136; yy += 9) for (let xx = 4; xx < 62; xx += 9) rect(ctx, x + xx, yy, 5, 5, rnd(i + yy + xx) < 0.5 ? '#3d3560' : '#e8d28a');
    const nc = pal(NEON, i), word = pal(KANJI, i * 3);
    const on = ((t + i * 13) % 140) > 8;
    // cartel vertical
    const vx = x + (i & 1 ? 50 : 2);
    rect(ctx, vx - 1, top + 9, 14, word.length * 11 + 5, on ? nc : '#333'); rect(ctx, vx, top + 10, 12, word.length * 11 + 3, '#120a1c');
    for (let k = 0; k < word.length; k++) jtxt(ctx, word[k], vx + 6, top + 12 + k * 11, on ? nc : '#555', 10);
    // cartel horizontal
    if (i % 3 === 0) {
      const w2 = pal(KANJI, i * 5 + 1); const c2 = pal(NEON, i + 2);
      rect(ctx, x + 14, top + 30, 36, 14, c2); rect(ctx, x + 15, top + 31, 34, 12, '#0d0716'); jtxt(ctx, w2, x + 32, top + 32, c2, 9);
    }
    if (i % 4 === 1) { // pantalla gigante
      const hue = (t * 2 + i * 40) % 360;
      rect(ctx, x + 16, top + 50, 34, 20, '#000'); ctx.fillStyle = `hsl(${hue},80%,55%)`; ctx.fillRect(x + 17, top + 51, 32, 18);
      jtxt(ctx, (t >> 6) & 1 ? '渋谷' : 'TOKYO', x + 33, top + 55, '#fff', 9);
    }
    if (i % 7 === 3) { rect(ctx, x + 4, 120, 58, 10, '#ff2e88'); txt(ctx, 'SHIBUYA', x + 33, 121, '#fff', 7, 'center', '#600'); }
    if (i % 7 === 6) { rect(ctx, x + 4, 120, 58, 10, '#22e6ff'); txt(ctx, 'SHINJUKU', x + 33, 121, '#023', 6, 'center', null); }
  });
  // multitud japonesa caminando
  layer(camX, 0.9, 22, (i, x) => {
    const dir = rnd(i * 5) < 0.5 ? 1 : -1, sp = 0.2 + rnd(i) * 0.25;
    const xx = ((x + dir * t * sp) % (W + 60) + W + 60) % (W + 60) - 30;
    const L = crowdPerson(i, JP_CROWD);
    drawPerson(ctx, L, 'walk', ((t / 8) + i) & 3, xx, 146 + (i & 1), dir, 0.72, { tint: 'rgba(20,10,40,0.25)' });
  });
  // vereda + calle
  rect(ctx, 0, 144, W, 10, '#4a4656'); ctx.fillStyle = '#3a3646'; layer(camX, 1, 16, (i, x) => ctx.fillRect(x, 144, 1, 8)); rect(ctx, 0, 152, W, 2, '#2a2836');
  rect(ctx, 0, 154, W, H - 154, '#24232c');
  // cruce de Shibuya
  layer(camX, 1, 520, (i, x) => { for (let k = 0; k < 14; k++) rect(ctx, x + k * 16, 158, 9, 52, '#d8d8e0'); });
  // reflejos neón
  layer(camX, 0.5, 72, (i, x) => { ctx.fillStyle = pal(NEON, i); ctx.globalAlpha = 0.12; ctx.fillRect(x + 4, 160, 12, 50); ctx.globalAlpha = 1; });
  // estación (warp)
  const wx = Math.round(g.lv.warp.x - camX);
  if (wx > -120 && wx < W + 120) {
    rect(ctx, wx - 50, 70, 100, 76, '#e8e8ef'); rect(ctx, wx - 54, 66, 108, 6, '#2a5bd7');
    jtxt(ctx, '新幹線 → 広島', wx, 76, '#2a5bd7', 10); txt(ctx, 'SHINKANSEN', wx, 90, '#333', 6, 'center', null);
    rect(ctx, wx - 22, 104, 44, 42, '#20202a'); const pulse = 0.5 + Math.sin(t / 8) * 0.3;
    ctx.fillStyle = `rgba(120,200,255,${pulse})`; ctx.fillRect(wx - 20, 106, 40, 40);
  }
}

function bgHiroshima(ctx, camX, t, g) {
  skyGrad(ctx, ['#0a0620', '#1c0d38', '#2c1450']);
  // reflectores
  [40, 344].forEach((lx, k) => { rect(ctx, lx - 3, 0, 6, 30, '#333'); rect(ctx, lx - 12, 4, 24, 12, '#eef'); ctx.fillStyle = 'rgba(255,255,230,0.08)'; ctx.beginPath(); ctx.moveTo(lx - 12, 16); ctx.lineTo(lx + (k ? -160 : 160), 150); ctx.lineTo(lx + (k ? -60 : 60), 150); ctx.fill(); });
  // tribunas con hinchada
  for (let r = 0; r < 12; r++) {
    const y = 34 + r * 9;
    rect(ctx, 0, y, W, 9, r & 1 ? '#3f1d66' : '#4b2478');
    layer(camX, 0.3 + r * 0.02, 6, (i, x) => {
      const jump = ((t >> 3) + i + r) & 1 ? 1 : 0;
      rect(ctx, x, y + 2 - jump, 3, 3, pal(['#f0cfae', '#e8c39e', '#d9b08c'], i + r));
      rect(ctx, x, y + 5 - jump, 4, 4, rnd(i * 3 + r) < 0.7 ? '#6a2ca8' : '#fff');
    });
  }
  // banderas y trapos
  layer(camX, 0.35, 120, (i, x) => {
    rect(ctx, x - 10, 40 + (i % 3) * 30, 90, 12, '#fff'); jtxt(ctx, i & 1 ? 'サンフレッチェ広島' : 'SANFRECCE', x + 35, 41 + (i % 3) * 30, '#5b2a8c', 8);
    const wave = Math.round(Math.sin(t / 6 + i) * 2);
    rect(ctx, x + 90, 30 + wave, 2, 26, '#ddd'); rect(ctx, x + 92, 30 + wave, 16, 10, i & 1 ? '#5b2a8c' : '#fff');
  });
  rect(ctx, 0, 136, W, 10, '#1a1a1a'); txt(ctx, 'ESTADIO SANFRECCE HIROSHIMA', W / 2, 137, '#c9a7ff', 6, 'center', null);
  // cancha
  for (let k = 0; k < 8; k++) rect(ctx, 0, 146 + k * 9, W, 9, k & 1 ? '#2f8a3a' : '#38994a');
  rect(ctx, 0, 150, W, 1, '#fff');
  layer(camX, 1, 400, (i, x) => rect(ctx, x, 150, 1, 66, 'rgba(255,255,255,0.8)'));
}

// =====================================================================
// AMSTERDAM (Santi) -> portal -> OBELISCO
// =====================================================================
const AMS_CROWD = { skins: ['#f2d0b5', '#e8b58c', '#c68a5e', '#8d5a3b', '#f5d6c0'], hairs: ['#d9b44a', '#7a4a20', '#222', '#c0602a', '#eee'], hairStyles: ['long', 'curly', 'short', 'ponytail', 'spiky', 'bald'],
  shirts: ['hawaii', 'plain', 'orange', 'tank', 'jacket'], cols: ['#ff7a00', '#e84a8a', '#38b6ff', '#ffd23f', '#7dd36b', '#b35cff', '#ff5050'], pants: ['#3b4f7a', '#222', '#c8a060', '#5a3a6a'], hatChance: 0.25, hats: ['beanie', 'cap', 'headband'] };
const SHOUTS = ['HALLO!', 'PROOST!', 'GEZELLIG!', 'HOLA CHE!', 'LEKKER!', 'JA JA JA!'];

function bgAmsterdam(ctx, camX, t, g) {
  if (g.section === 1) return bgObelisco(ctx, camX, t, g);
  skyGrad(ctx, ['#4a2266', '#c2506a', '#ff9455', '#ffd08a']);
  ctx.fillStyle = '#ffe3a0'; ctx.beginPath(); ctx.arc(250 - camX * 0.02, 96, 22, 0, 7); ctx.fill();
  // molino + torre de iglesia
  const mx = Math.round(80 - camX * 0.07);
  rect(ctx, mx - 6, 70, 12, 50, '#3a1f3f'); rect(ctx, mx - 8, 66, 16, 6, '#3a1f3f');
  ctx.save(); ctx.translate(mx, 70); ctx.rotate(t / 80);
  for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = '#3a1f3f'; ctx.fillRect(-1, 0, 3, 32); ctx.fillRect(1, 8, 6, 22); }
  ctx.restore();
  const cx = Math.round(330 - camX * 0.07);
  rect(ctx, cx - 8, 50, 16, 70, '#3a1f3f'); rect(ctx, cx - 5, 34, 10, 16, '#3a1f3f'); rect(ctx, cx - 2, 18, 4, 16, '#3a1f3f'); rect(ctx, cx - 1, 10, 2, 8, '#3a1f3f');
  // casas del canal
  const warm = ['#7a2e22', '#a0522d', '#5a2e22', '#c27c3a', '#3d2b24', '#8b4a2b', '#6e3b5e', '#b5652e'];
  layer(camX, 0.4, 34, (i, x) => {
    const h = 64 + Math.floor(rnd(i) * 30), top = 118 - h, c = pal(warm, i * 3 + 1);
    rect(ctx, x, top, 32, h, c);
    const type = Math.floor(rnd(i * 5) * 4);
    if (type === 0) { for (let k = 0; k < 4; k++) rect(ctx, x + k * 4, top - 4 - k * 4, 32 - k * 8, 4, c); }
    else if (type === 1) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 16, top, 12, Math.PI, 0); ctx.fill(); rect(ctx, x + 12, top - 16, 8, 6, c); }
    else if (type === 2) { rect(ctx, x + 8, top - 14, 16, 14, c); rect(ctx, x + 6, top - 16, 20, 3, '#f0e6d2'); }
    else { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x + 16, top - 16); ctx.lineTo(x + 32, top); ctx.fill(); }
    rect(ctx, x + 15, top - 8, 2, 4, '#222');
    for (let yy = top + 6; yy < 104; yy += 13) for (let xx = 4; xx < 30; xx += 10) {
      rect(ctx, x + xx, yy, 7, 9, '#f0e6d2'); rect(ctx, x + xx + 1, yy + 1, 5, 7, rnd(i + yy + xx) < 0.45 ? '#ffd27a' : '#2b2440'); rect(ctx, x + xx + 1, yy + 4, 5, 1, '#f0e6d2');
    }
    rect(ctx, x + 12, 106, 8, 12, '#2b1a14');
    if (i % 5 === 2) { rect(ctx, x + 1, 100, 30, 6, '#2d7a3a'); txt(ctx, 'COFFEESHOP', x + 16, 101, '#ffe680', 3, 'center', null); }
    if (i % 5 === 4) { rect(ctx, x + 1, 100, 30, 6, '#8a1f1f'); txt(ctx, 'CAFE', x + 16, 101, '#fff', 4, 'center', null); }
  });
  // canal
  rect(ctx, 0, 118, W, 24, '#2c4f63');
  for (let k = 0; k < 6; k++) { const y = 120 + k * 4; layer(camX + Math.sin(t / 20 + k) * 6, 0.5, 26, (i, x) => rect(ctx, x + (k * 7) % 26, y, 10 + (i % 3) * 3, 1, k < 3 ? 'rgba(255,170,100,0.5)' : 'rgba(255,220,160,0.35)')); }
  // barcos
  layer(camX - t * 0.3, 0.6, 340, (i, x) => {
    rect(ctx, x, 128, 70, 7, pal(['#1f3a5a', '#5a1f1f', '#2d5a2d'], i)); rect(ctx, x + 10, 122, 46, 6, '#e8e0d0'); rect(ctx, x + 4, 135, 62, 2, '#111');
    for (let k = 0; k < 5; k++) rect(ctx, x + 14 + k * 8, 118, 4, 4, pal(AMS_CROWD.cols, i + k));
  });
  // puentes
  layer(camX, 0.4, 680, (i, x) => {
    rect(ctx, x, 110, 90, 8, '#6a3a2a'); ctx.fillStyle = '#2c4f63'; ctx.beginPath(); ctx.ellipse(x + 45, 128, 26, 14, 0, Math.PI, 0); ctx.fill();
    rect(ctx, x, 104, 90, 1, '#222'); for (let k = 0; k < 90; k += 6) rect(ctx, x + k, 104, 1, 6, '#222');
  });
  // muelle
  rect(ctx, 0, 140, W, 6, '#6e6258'); rect(ctx, 0, 140, W, 1, '#8a7e72');
  // bicis
  layer(camX, 1, 70, (i, x) => { if (rnd(i) < 0.6) {
    ctx.strokeStyle = pal(['#222', '#b33', '#36c', '#eee'], i); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(x, 144, 5, 0, 7); ctx.arc(x + 15, 144, 5, 0, 7); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, 144); ctx.lineTo(x + 6, 136); ctx.lineTo(x + 13, 136); ctx.lineTo(x + 15, 144); ctx.moveTo(x + 6, 136); ctx.lineTo(x + 8, 144); ctx.stroke();
  } });
  // gente extrovertida
  layer(camX, 0.95, 46, (i, x) => {
    const L = crowdPerson(i + 200, AMS_CROWD), f = ((t / 10) | 0) + i;
    const pose = i % 3 === 0 ? 'dance' : i % 3 === 1 ? 'wave' : 'idle';
    drawPerson(ctx, L, pose, f & 3, x + 20, 146, i & 1 ? 1 : -1, 0.75);
    if (((t + i * 50) % 300) < 90) {
      const s = pal(SHOUTS, i + ((t / 300) | 0));
      rect(ctx, x + 6, 104, s.length * 4 + 4, 9, '#fff'); rect(ctx, x + 14, 113, 2, 2, '#fff'); txt(ctx, s, x + 8, 106, '#a02', 4, 'left', null);
    }
    if (i % 3 === 2) smokePuff(ctx, x + 26, 118, t + i * 40, 0.5);
  });
  // adoquines del muelle
  rect(ctx, 0, 146, W, H - 146, '#7a4a3a');
  for (let r = 0; r < 12; r++) { const y = 146 + r * 6, off = (r & 1) * 6; layer(camX, 1, 12, (i, x) => rect(ctx, x + off, y, 11, 5, rnd(i * 13 + r) < 0.5 ? '#8a5644' : '#82503f')); }
  // portal
  const px = Math.round(g.lv.warp.x - camX);
  if (px > -80 && px < W + 80 && g.waveIdx >= g.lv.warp.afterWave) {
    for (let k = 0; k < 8; k++) {
      ctx.strokeStyle = `hsla(${(t * 4 + k * 40) % 360},90%,${60 + k * 4}%,${0.9 - k * 0.08})`; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(px, 160, 22 - k * 2 + Math.sin(t / 6 + k) * 2, 40 - k * 4, Math.sin(t / 30) * 0.2, 0, 7); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(117,170,219,0.6)'; ctx.beginPath(); ctx.ellipse(px, 160, 8, 18, 0, 0, 7); ctx.fill();
    txt(ctx, 'PORTAL', px, 108, '#fff', 6, 'center');
  }
}
function smokePuff(ctx, x, y, t, a = 0.4) {
  for (let k = 0; k < 4; k++) {
    const p = ((t / 2 + k * 25) % 100) / 100;
    ctx.fillStyle = `rgba(220,210,235,${a * (1 - p)})`;
    ctx.beginPath(); ctx.arc(x + Math.sin(p * 6 + k) * 5, y - p * 50, 3 + p * 8, 0, 7); ctx.fill();
  }
}
function fgAmsterdam(ctx, camX, t, g) {
  if (g.section === 1) return;
  for (let i = 0; i < 7; i++) {
    const x = ((rnd(i) * 900 - camX * 1.2 + t * 0.3) % 600 + 600) % 600 - 100, y = 150 + rnd(i + 9) * 60 - ((t * 0.2 + i * 40) % 80);
    ctx.fillStyle = 'rgba(230,215,240,0.10)'; ctx.beginPath(); ctx.ellipse(x, y, 40, 12, 0, 0, 7); ctx.fill();
  }
  ctx.fillStyle = 'rgba(255,140,60,0.06)'; ctx.fillRect(0, 0, W, H);
}

function bgObelisco(ctx, camX, t, g) {
  const cx2 = camX - g.lv.warp.toX;
  skyGrad(ctx, ['#5aa8e8', '#9ad2f7', '#e2f4ff']);
  clouds(ctx, camX, t);
  // Obelisco
  const ox = Math.round(220 - cx2 * 0.05);
  ctx.fillStyle = '#f2efe6'; ctx.beginPath(); ctx.moveTo(ox - 10, 146); ctx.lineTo(ox - 6, 22); ctx.lineTo(ox, 8); ctx.lineTo(ox + 6, 22); ctx.lineTo(ox + 10, 146); ctx.fill();
  ctx.fillStyle = '#d8d3c4'; ctx.beginPath(); ctx.moveTo(ox + 1, 146); ctx.lineTo(ox + 1, 10); ctx.lineTo(ox + 6, 22); ctx.lineTo(ox + 10, 146); ctx.fill();
  rect(ctx, ox - 1, 26, 2, 3, '#555');
  // edificios estilo París de la 9 de Julio
  layer(cx2, 0.3, 58, (i, x) => {
    if (Math.abs(x + 27 - ox) < 40) return;
    const h = 50 + rnd(i) * 40, top = 140 - h, c = pal(['#d9cdb4', '#c9c1b0', '#e3d8c0', '#b8b0a2'], i);
    rect(ctx, x, top, 54, h, c); rect(ctx, x - 2, top - 6, 58, 6, '#5a6a7a'); rect(ctx, x + 20, top - 12, 14, 6, '#5a6a7a');
    for (let yy = top + 6; yy < 132; yy += 10) for (let xx = 5; xx < 50; xx += 10) rect(ctx, x + xx, yy, 5, 7, '#4a5868');
    if (i % 4 === 0) { rect(ctx, x + 4, top + 6, 46, 18, '#222'); rect(ctx, x + 5, top + 7, 44, 16, pal(['#ff4d4d', '#2a9df4', '#ffd23f'], i / 4)); txt(ctx, pal(['MATE', 'ALFAJOR', 'BONDI', 'CHORI'], i / 4), x + 27, top + 12, '#fff', 5, 'center', '#000'); }
  });
  // jacarandás
  layer(cx2, 0.6, 90, (i, x) => { rect(ctx, x + 10, 118, 3, 24, '#4a3a2a'); ctx.fillStyle = '#9b6bd6'; ctx.beginPath(); ctx.arc(x + 11, 112, 14, 0, 7); ctx.arc(x + 2, 118, 9, 0, 7); ctx.arc(x + 21, 118, 9, 0, 7); ctx.fill(); });
  // banderas
  layer(cx2, 0.8, 160, (i, x) => { rect(ctx, x, 96, 1, 50, '#ccc'); const w = Math.round(Math.sin(t / 7 + i) * 1); rect(ctx, x + 1, 96 + w, 18, 4, '#75aadb'); rect(ctx, x + 1, 100 + w, 18, 4, '#fff'); rect(ctx, x + 1, 104 + w, 18, 4, '#75aadb'); rect(ctx, x + 9, 101 + w, 2, 2, '#f5c400'); });
  rect(ctx, 0, 140, W, 12, '#bdb6a8'); ctx.fillStyle = '#a49d90'; layer(cx2, 1, 20, (i, x) => ctx.fillRect(x, 140, 1, 12));
  rect(ctx, 0, 152, W, 2, '#8a8478');
  rect(ctx, 0, 154, W, H - 154, '#4a4a50');
  layer(cx2, 1, 40, (i, x) => { rect(ctx, x, 172, 20, 2, '#eee'); rect(ctx, x + 10, 194, 20, 2, '#eee'); });
  rect(ctx, 0, 183, W, 1, '#f5c400');
  txt(ctx, 'AV. 9 DE JULIO', W - 4, 4, '#fff', 6, 'right');
}

// =====================================================================
// BANFIELD (Fran + Martín P2)
// =====================================================================
function bgBanfield(ctx, camX, t, g) {
  skyGrad(ctx, ['#4fa6f5', '#90cbff', '#d8efff']);
  clouds(ctx, camX, t);
  // Estadio Florencio Sola
  const sx = Math.round(110 - camX * 0.06);
  rect(ctx, sx, 34, 250, 100, '#eaeaea');
  for (let k = 0; k < 250; k += 10) rect(ctx, sx + k, 58, 5, 70, '#0d7a3a');
  rect(ctx, sx - 4, 30, 258, 6, '#0b5e2d'); rect(ctx, sx, 38, 250, 14, '#fff'); rect(ctx, sx, 52, 250, 2, '#0b5e2d');
  txt(ctx, 'BANFIELD', sx + 125, 41, '#0d7a3a', 8, 'center', null);
  txt(ctx, 'ESTADIO FLORENCIO SOLA', sx + 125, 62, '#0b5e2d', 5, 'center', '#fff');
  [sx + 6, sx + 82, sx + 166, sx + 242].forEach(lx => { rect(ctx, lx, 8, 3, 24, '#666'); rect(ctx, lx - 7, 2, 17, 9, '#444'); for (let a = 0; a < 4; a++) rect(ctx, lx - 6 + a * 4, 3, 3, 3, '#fffbe0'); for (let a = 0; a < 4; a++) rect(ctx, lx - 6 + a * 4, 7, 3, 3, '#fffbe0'); });
  // árboles del fondo
  layer(camX, 0.2, 30, (i, x) => { ctx.fillStyle = pal(['#2f6e2f', '#3a7d35', '#276127'], i); ctx.beginPath(); ctx.arc(x, 128 - rnd(i) * 8, 12 + rnd(i + 1) * 6, 0, 7); ctx.fill(); });
  // casas estilo inglés
  layer(camX, 0.55, 124, (i, x) => {
    const wall = pal(['#efe6d2', '#f4efe4', '#e6dcc4'], i), roof = pal(['#9c3b2a', '#7a2e22', '#55606e', '#8a4a2a'], i * 3), timber = '#4a2e1c';
    const top = 92 + Math.floor(rnd(i) * 6);
    rect(ctx, x, top, 96, 136 - top, wall);
    // techo empinado a dos aguas
    ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(x - 6, top + 1); ctx.lineTo(x + 30, top - 34); ctx.lineTo(x + 66, top + 1); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x + 50, top + 1); ctx.lineTo(x + 76, top - 22); ctx.lineTo(x + 102, top + 1); ctx.fill();
    for (let k = 0; k < 5; k++) { ctx.fillStyle = shade(roof, 0.85); ctx.fillRect(x + 8 + k * 9, top - 20 + k * 3, 6, 1); }
    // tudor: maderas a la vista en el frontón
    ctx.strokeStyle = timber; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x + 2, top); ctx.lineTo(x + 30, top - 28); ctx.lineTo(x + 58, top); ctx.stroke();
    for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + 12 + k * 9, top + (k === 2 ? -18 : -6)); ctx.lineTo(x + 12 + k * 9, top + 24); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(x + 2, top + 24); ctx.lineTo(x + 58, top + 24); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x + 12, top + 24); ctx.lineTo(x + 21, top + 6); ctx.moveTo(x + 48, top + 24); ctx.lineTo(x + 39, top + 6); ctx.stroke();
    // chimenea
    rect(ctx, x + 74, top - 30, 8, 18, '#8b3a2a'); rect(ctx, x + 73, top - 32, 10, 3, '#6e2a1e');
    // ventanas blancas con repartidores
    const win = (wx, wy, ww, wh) => { rect(ctx, wx - 1, wy - 1, ww + 2, wh + 2, '#fff'); rect(ctx, wx, wy, ww, wh, '#7fb2d6'); rect(ctx, wx + ww / 2, wy, 1, wh, '#fff'); rect(ctx, wx, wy + wh / 2, ww, 1, '#fff'); };
    win(x + 22, top + 8, 16, 12); win(x + 8, top + 30, 18, 16); win(x + 64, top + 8, 14, 12); win(x + 64, top + 30, 18, 16);
    rect(ctx, x + 38, top + 28, 14, 136 - top - 28, '#2e4f2e'); rect(ctx, x + 49, top + 44, 2, 2, '#d4af37');
    // pasto, cerco y ligustrina
    rect(ctx, x - 14, 134, 124, 10, '#58b44a'); for (let k = 0; k < 124; k += 3) rect(ctx, x - 14 + k, 133 + (k % 2), 1, 2, '#6cc95a');
    rect(ctx, x - 14, 128, 20, 8, '#2f7a2f'); rect(ctx, x + 90, 128, 20, 8, '#2f7a2f');
    for (let k = 0; k < 124; k += 5) rect(ctx, x - 14 + k, 138, 2, 7, '#fff'); rect(ctx, x - 14, 140, 124, 1, '#fff');
    // árbol grande
    if (i & 1) { rect(ctx, x + 108, 100, 5, 44, '#5a3a22'); ctx.fillStyle = '#2f7a2f'; ctx.beginPath(); ctx.arc(x + 110, 92, 18, 0, 7); ctx.arc(x + 98, 100, 11, 0, 7); ctx.arc(x + 122, 100, 11, 0, 7); ctx.fill(); }
  });
  // vereda de baldosas
  rect(ctx, 0, 144, W, 12, '#c6c2b8');
  ctx.fillStyle = '#aaa59a'; layer(camX, 1, 12, (i, x) => ctx.fillRect(x, 144, 1, 10)); rect(ctx, 0, 149, W, 1, '#aaa59a');
  rect(ctx, 0, 154, W, 2, '#8d8a82');
  layer(camX, 1, 230, (i, x) => lamppost(ctx, x + 60, 146, 'banfield'));
  // calle de adoquines
  rect(ctx, 0, 156, W, H - 156, '#4e4a46');
  for (let r = 0; r < 10; r++) {
    const y = 156 + r * 6, off = (r & 1) * 6;
    layer(camX, 1, 12, (i, x) => rect(ctx, x + off, y, 11, 5, pal(['#6e6862', '#67615b', '#736c64', '#605a55'], (rnd(i * 17 + r) * 97) | 0)));
  }
  layer(camX, 1, 12, (i, x) => rect(ctx, x, 156, 11, 1, 'rgba(255,255,255,0.08)'));
}

// =====================================================================
// LA BOCA NIVEL 2 (de noche: Riachuelo, Puente Transbordador, Bombonera)
// =====================================================================
function bgBoca2(ctx, camX, t, g) {
  skyGrad(ctx, ['#070b24', '#14204a', '#2a3a6e']);
  for (let i = 0; i < 45; i++) rect(ctx, (rnd(i + 3) * W) | 0, (rnd(i + 70) * 80) | 0, 1, 1, (t + i * 11) % 120 < 105 ? '#fff' : '#557');
  ctx.fillStyle = '#f4f0d8'; ctx.beginPath(); ctx.arc(330 - camX * 0.01, 28, 10, 0, 7); ctx.fill();
  ctx.fillStyle = '#14204a'; ctx.beginPath(); ctx.arc(326 - camX * 0.01, 25, 9, 0, 7); ctx.fill();
  // Puente Transbordador
  const px = Math.round(40 - camX * 0.12);
  const tower = (tx) => { for (let y = 20; y < 122; y += 6) { rect(ctx, tx, y, 2, 6, '#3a3a48'); rect(ctx, tx + 12, y, 2, 6, '#3a3a48'); ctx.strokeStyle = '#3a3a48'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(tx + 1, y); ctx.lineTo(tx + 13, y + 6); ctx.moveTo(tx + 13, y); ctx.lineTo(tx + 1, y + 6); ctx.stroke(); } };
  for (let rep = 0; rep < 2; rep++) {
    const ox = px + rep * 520;
    if (ox > W + 10 || ox < -180) continue;
    tower(ox); tower(ox + 140);
    rect(ctx, ox, 18, 154, 3, '#3a3a48'); rect(ctx, ox, 28, 154, 2, '#3a3a48');
    for (let k = 0; k < 154; k += 8) { ctx.strokeStyle = '#3a3a48'; ctx.beginPath(); ctx.moveTo(ox + k, 20); ctx.lineTo(ox + k + 8, 29); ctx.stroke(); }
    const gx = ox + 20 + ((Math.sin(t / 200) + 1) / 2) * 100;
    rect(ctx, gx + 6, 30, 1, 80, '#2a2a34'); rect(ctx, gx, 108, 16, 8, '#c0392b'); rect(ctx, gx + 2, 110, 3, 3, '#ffe9a0');
  }
  // Bombonera iluminada
  const bx = Math.round(200 - camX * 0.05);
  rect(ctx, bx, 40, 200, 80, '#14306e'); rect(ctx, bx - 3, 36, 206, 5, '#f5c400');
  rect(ctx, bx, 56, 200, 10, '#f5c400'); txt(ctx, 'LA BOMBONERA', bx + 100, 58, '#14306e', 7, 'center', null);
  for (let r = 0; r < 4; r++) for (let k = 0; k < 24; k++) rect(ctx, bx + 6 + k * 8, 70 + r * 7, 5, 4, rnd(k * 7 + r) < 0.6 ? '#ffe9a0' : '#0b1d48');
  [bx + 4, bx + 192].forEach(lx => { rect(ctx, lx, 26, 3, 12, '#444'); rect(ctx, lx - 6, 22, 15, 6, '#fffbe0');
    ctx.fillStyle = 'rgba(255,250,210,0.07)'; ctx.beginPath(); ctx.moveTo(lx - 6, 28); ctx.lineTo(lx + 60, 120); ctx.lineTo(lx - 60, 120); ctx.fill(); });
  // casas de chapa de noche
  const cols = ['#a8323d', '#b27a10', '#16508a', '#1f7442', '#b09a20', '#a85080', '#2f7f90'];
  layer(camX, 0.4, 58, (i, x) => {
    const h = 30 + Math.floor(rnd(i + 40) * 20), top = 118 - h;
    rect(ctx, x, top, 54, h, pal(cols, (rnd(i + 9) * 97) | 0)); rect(ctx, x - 2, top - 3, 58, 3, '#4a5560');
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let k = 0; k < 54; k += 3) ctx.fillRect(x + k, top, 1, h);
    rect(ctx, x + 8, top + 6, 10, 10, rnd(i) < 0.6 ? '#ffd27a' : '#1a2238'); rect(ctx, x + 34, top + 6, 10, 10, rnd(i + 1) < 0.6 ? '#ffd27a' : '#1a2238');
  });
  // Riachuelo
  rect(ctx, 0, 118, W, 22, '#0f1e30');
  for (let k = 0; k < 5; k++) layer(camX + Math.sin(t / 25 + k) * 5, 0.5, 30, (i, x) => rect(ctx, x + (k * 9) % 30, 121 + k * 4, 8 + (i % 3) * 3, 1, k & 1 ? 'rgba(255,210,120,0.35)' : 'rgba(120,160,255,0.25)'));
  layer(camX, 0.6, 420, (i, x) => { rect(ctx, x, 124, 80, 10, '#3a2a2a'); rect(ctx, x + 6, 116, 30, 8, '#5a4a40'); rect(ctx, x + 50, 112, 4, 12, '#2a2a2a'); rect(ctx, x + 10, 118, 3, 3, '#ffe9a0'); });
  // costanera
  rect(ctx, 0, 140, W, 4, '#555a62'); for (let k = 0; k < 4; k++) rect(ctx, 0, 136 + k, W, 0, '#000');
  layer(camX, 1, 16, (i, x) => rect(ctx, x, 134, 1, 8, '#2a2a30')); rect(ctx, 0, 134, W, 1, '#2a2a30');
  rect(ctx, 0, 144, W, 10, '#5a5650'); rect(ctx, 0, 152, W, 2, '#3e3a36');
  rect(ctx, 0, 154, W, H - 154, '#3a3632');
  for (let r = 0; r < 11; r++) { const y = 154 + r * 6, off = (r & 1) * 5; layer(camX, 1, 10, (i, x) => rect(ctx, x + off, y, 9, 5, rnd(i * 31 + r) < 0.5 ? '#4a4540' : '#44403a')); }
  layer(camX, 1, 240, (i, x) => { lamppost(ctx, x + 40, 147); ctx.fillStyle = 'rgba(255,220,140,0.12)'; ctx.beginPath(); ctx.moveTo(x + 46, 101); ctx.lineTo(x + 70, 200); ctx.lineTo(x + 22, 200); ctx.fill(); });
}

// =====================================================================
// LANUS (Fran nivel 2, de noche)
// =====================================================================
const LANUS_CROWD = { skins: ['#e8b58c', '#d9a27a', '#c68a5e', '#f0c4a0'], hairs: ['#111', '#2a1d16', '#3a2a20'], hairStyles: ['short', 'buzz', 'curly', 'spiky', 'side'],
  shirts: ['plain', 'plain', 'jacket', 'tank'], cols: ['#7a1f2b', '#7a1f2b', '#8a2433', '#6a1a24', '#f2f2f2'], pants: ['#222', '#2a2a30', '#3b4f7a'], hatChance: 0.3, hats: ['visor', 'cap'] };
function bgLanus(ctx, camX, t, g) {
  skyGrad(ctx, ['#05060f', '#111528', '#241a2e']);
  for (let i = 0; i < 30; i++) rect(ctx, (rnd(i + 21) * W) | 0, (rnd(i + 90) * 60) | 0, 1, 1, '#aab');
  // estadio de Lanús (La Fortaleza)
  const sx = Math.round(760 - camX * 0.25);
  if (sx > -300 && sx < W + 20) {
    rect(ctx, sx, 40, 270, 100, '#5a1520');
    for (let r = 0; r < 6; r++) for (let k = 0; k < 33; k++) rect(ctx, sx + 4 + k * 8, 62 + r * 9, 6, 6, (rnd(k * 5 + r) < 0.5) ? '#8a2433' : '#f2f2f2');
    rect(ctx, sx - 4, 36, 278, 5, '#3a0e16'); rect(ctx, sx, 44, 270, 14, '#7a1f2b');
    txt(ctx, 'LANUS', sx + 135, 46, '#fff', 8, 'center', null);
    txt(ctx, 'LA FORTALEZA', sx + 135, 120, '#f2d0d0', 5, 'center', '#3a0e16');
    [sx + 6, sx + 260].forEach(lx => { rect(ctx, lx, 8, 3, 30, '#444'); rect(ctx, lx - 7, 4, 17, 8, '#fffbe0');
      ctx.fillStyle = 'rgba(255,250,220,0.08)'; ctx.beginPath(); ctx.moveTo(lx - 7, 12); ctx.lineTo(lx + 70, 140); ctx.lineTo(lx - 70, 140); ctx.fill(); });
  }
  // casas del conurbano de noche
  layer(camX, 0.5, 70, (i, x) => {
    const h = 34 + Math.floor(rnd(i + 5) * 26), top = 140 - h, c = pal(['#6e6258', '#8a7a68', '#5a5048', '#7a6a5e', '#9a8a78'], (rnd(i) * 97) | 0);
    rect(ctx, x, top, 66, h, c); rect(ctx, x - 1, top - 2, 68, 2, shade(c, 0.7));
    rect(ctx, x + 6, top + 8, 14, 12, rnd(i + 1) < 0.5 ? '#ffd27a' : '#1a1a24'); for (let k = 0; k < 4; k++) rect(ctx, x + 6, top + 8 + k * 3, 14, 1, '#2a2a2a');
    rect(ctx, x + 40, top + 8, 18, h - 8, '#2a1e18'); for (let k = 0; k < 6; k++) rect(ctx, x + 41 + k * 3, top + 8, 1, h - 8, '#555');
    if (i % 3 === 0) { txt(ctx, 'LANUS', x + 26, top + h - 12, '#c84858', 5, 'center', null); }
    if (i % 4 === 1) { const w = Math.round(Math.sin(t / 8 + i) * 1); rect(ctx, x + 22, top - 14, 1, 14, '#ccc'); rect(ctx, x + 23, top - 14 + w, 12, 4, '#7a1f2b'); rect(ctx, x + 23, top - 10 + w, 12, 2, '#fff'); }
  });
  // hinchas de Lanús en la vereda
  layer(camX, 0.95, 30, (i, x) => {
    if (rnd(i * 3) < 0.35) return;
    const L = crowdPerson(i + 500, LANUS_CROWD), f = ((t / 10) | 0) + i;
    drawPerson(ctx, L, i % 3 ? 'dance' : 'wave', f & 3, x + 12, 146, i & 1 ? 1 : -1, 0.75, { tint: 'rgba(10,10,40,0.25)' });
    if (i % 5 === 0) { rect(ctx, x + 6, 112, 1, 18, '#ccc'); rect(ctx, x + 7, 112 + ((t >> 3) & 1), 14, 5, '#7a1f2b'); }
  });
  // vereda
  rect(ctx, 0, 144, W, 10, '#5a5650'); ctx.fillStyle = '#48443e'; layer(camX, 1, 14, (i, x) => ctx.fillRect(x, 144, 1, 8)); rect(ctx, 0, 152, W, 2, '#35322e');
  // calle rota
  rect(ctx, 0, 154, W, H - 154, '#2e2e33');
  layer(camX, 1, 46, (i, x) => {
    const wx = i * 46, broken = wx > 2400 ? 0.85 : 0.45;
    if (rnd(i) < broken) { const y = 160 + rnd(i + 1) * 44, w = 12 + rnd(i + 2) * 20;
      ctx.fillStyle = '#1c1c20'; ctx.beginPath(); ctx.ellipse(x + 20, y, w / 2, 4, 0, 0, 7); ctx.fill();
      ctx.fillStyle = 'rgba(120,140,200,0.25)'; ctx.beginPath(); ctx.ellipse(x + 20, y + 1, w / 2 - 2, 2, 0, 0, 7); ctx.fill(); }
    if (rnd(i + 7) < broken) { ctx.strokeStyle = '#1a1a1e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, 158 + rnd(i + 3) * 40); ctx.lineTo(x + 12, 166 + rnd(i + 4) * 40); ctx.lineTo(x + 22, 160 + rnd(i + 5) * 44); ctx.stroke(); }
    if (wx > 2400 && rnd(i + 11) < 0.5) { rect(ctx, x + 30, 170 + rnd(i + 6) * 30, 6, 4, '#4a4a4e'); rect(ctx, x + 34, 172 + rnd(i + 6) * 30, 4, 3, '#55555a'); }
  });
  layer(camX, 1, 260, (i, x) => { lamppost(ctx, x + 40, 147); ctx.fillStyle = 'rgba(255,200,120,0.10)'; ctx.beginPath(); ctx.moveTo(x + 46, 101); ctx.lineTo(x + 72, 200); ctx.lineTo(x + 20, 200); ctx.fill(); });
  // Estación Lanús + tren (inicio)
  const st = Math.round(0 - camX);
  if (st > -520) {
    rect(ctx, st - 10, 40, 470, 6, '#3a3a40'); for (let k = 0; k < 6; k++) rect(ctx, st + k * 80, 46, 4, 100, '#4a4a52');
    const go = Math.max(0, g.t - 260), tx = st - 20 + go * go * 0.02;
    rect(ctx, tx, 76, 420, 66, '#e8eef4'); rect(ctx, tx, 108, 420, 6, '#1f5aa8'); rect(ctx, tx, 116, 420, 3, '#74b9e8');
    for (let k = 0; k < 12; k++) rect(ctx, tx + 10 + k * 34, 84, 22, 16, '#2a3448');
    for (let k = 0; k < 4; k++) { rect(ctx, tx + 40 + k * 100, 92, 18, 48, go ? '#c8ccd2' : '#1a1e28'); }
    rect(ctx, tx + 404, 80, 14, 30, '#2a3448'); txt(ctx, 'ROCA', tx + 210, 120, '#1f5aa8', 6, 'center', null);
    rect(ctx, st - 10, 140, 470, 6, '#8a8a90'); rect(ctx, st - 10, 144, 470, 2, '#f5c400');
    rect(ctx, st + 150, 50, 90, 16, '#1f3a6e'); rect(ctx, st + 152, 52, 86, 12, '#fff'); txt(ctx, 'LANUS', st + 195, 54, '#1f3a6e', 8, 'center', null);
    for (let k = 0; k < 6; k++) rect(ctx, st + 20 + k * 80, 48, 6, 4, '#ffe9a0');
  }
  // Pizzería Las Palmas
  const px = Math.round(1150 - camX);
  if (px > -200 && px < W + 20) {
    rect(ctx, px, 70, 170, 78, '#d8c8a8'); rect(ctx, px - 4, 66, 178, 5, '#8a6a4a');
    rect(ctx, px + 10, 76, 150, 22, '#14301e'); const on = ((t >> 4) % 9) !== 0;
    txt(ctx, 'PIZZERIA', px + 85, 78, on ? '#ff6a5a' : '#552', 6, 'center', null);
    txt(ctx, 'LAS PALMAS', px + 85, 87, on ? '#7dff9a' : '#253', 8, 'center', null);
    for (const pxx of [px + 18, px + 150]) { rect(ctx, pxx, 82, 2, 12, '#8a5a2a'); rect(ctx, pxx - 5, 80, 12, 2, on ? '#7dff9a' : '#253'); rect(ctx, pxx - 4, 82, 3, 1, on ? '#7dff9a' : '#253'); rect(ctx, pxx + 3, 82, 3, 1, on ? '#7dff9a' : '#253'); }
    rect(ctx, px + 10, 104, 60, 36, '#2a1a10'); rect(ctx, px + 12, 106, 56, 32, '#ffcf7a');
    rect(ctx, px + 100, 104, 60, 36, '#2a1a10'); rect(ctx, px + 102, 106, 56, 32, '#ffcf7a');
    for (let k = 0; k < 3; k++) { rect(ctx, px + 16 + k * 18, 126, 12, 2, '#7a3a1a'); rect(ctx, px + 106 + k * 18, 126, 12, 2, '#7a3a1a'); }
    rect(ctx, px + 76, 104, 18, 44, '#3a2416'); txt(ctx, 'MUZZA - FAINA', px + 85, 141, '#fff', 3, 'center', null);
  }
}

// =====================================================================
// BARRIO RIVER (Nico nivel 2): Aeroparque -> Belgrano -> Monumental
// =====================================================================
function riverFlag(ctx, x, y, w = 14, h = 10) {
  rect(ctx, x, y, w, h, '#f4f4f4');
  for (let i = 0; i < h; i++) rect(ctx, x + Math.round((w - 3) * (i / (h - 1))), y + i, 3, 1, '#e0161b');
}
function poster(ctx, x, y, a, b) {
  rect(ctx, x, y, 34, 22, '#f4f4f4'); rect(ctx, x, y, 34, 2, '#e0161b'); rect(ctx, x, y + 20, 34, 2, '#e0161b');
  txt(ctx, a, x + 17, y + 5, '#c0101a', 5, 'center', null); txt(ctx, b, x + 17, y + 12, '#111', 5, 'center', null);
}
function bgRiver2(ctx, camX, t, g) {
  skyGrad(ctx, ['#5aa8e8', '#9ad2f7', '#e8f6ff']);
  clouds(ctx, camX, t);
  // avión aterrizando al principio
  const ax = Math.round(260 - camX * 0.3 - t * 0.4), ay = Math.round(20 + Math.min(40, t * 0.08));
  if (ax > -90 && ax < W) { rect(ctx, ax, ay, 70, 9, '#f4f4f8'); rect(ctx, ax + 62, ay + 2, 10, 5, '#d8d8e0'); rect(ctx, ax + 4, ay - 8, 8, 9, '#75aadb'); rect(ctx, ax + 26, ay + 6, 22, 4, '#c8ccd4'); for (let k = 0; k < 8; k++) rect(ctx, ax + 18 + k * 5, ay + 3, 2, 2, '#4a5868'); }
  // El Monumental
  const mx = Math.round(1030 - camX * 0.25);
  if (mx > -320 && mx < W + 20) {
    rect(ctx, mx, 34, 300, 106, '#e9e9ec');
    for (let r = 0; r < 7; r++) for (let k = 0; k < 37; k++) rect(ctx, mx + 4 + k * 8, 58 + r * 10, 6, 7, rnd(k + r * 40) < 0.3 ? '#e0161b' : rnd(k * 3 + r) < 0.5 ? '#f4f4f4' : '#d0d0d6');
    rect(ctx, mx - 4, 30, 308, 5, '#c0101a'); rect(ctx, mx, 40, 300, 14, '#e0161b');
    txt(ctx, 'EL MONUMENTAL', mx + 150, 43, '#fff', 8, 'center', null);
    for (let i = 0; i < 26; i++) rect(ctx, mx + Math.round(i * 11.5), 128 + Math.round(Math.sin(i) * 0), 9, 2, '#e0161b');
    [mx + 6, mx + 290].forEach(lx => { rect(ctx, lx, 8, 3, 24, '#555'); rect(ctx, lx - 7, 4, 17, 8, '#fffbe0'); });
  }
  // edificios de Belgrano
  layer(camX, 0.5, 64, (i, x) => {
    const tall = rnd(i + 2) < 0.45, h = tall ? 80 + rnd(i) * 30 : 44 + rnd(i) * 20, top = 140 - h;
    const c = pal(['#e2d6c2', '#cfc4b4', '#d8cfc0', '#bdb2a4', '#e8e0d2'], (rnd(i + 4) * 97) | 0);
    rect(ctx, x, top, 60, h, c);
    for (let yy = top + 6; yy < 132; yy += 12) { rect(ctx, x + 4, yy, 52, 1, shade(c, 0.8)); for (let xx = 6; xx < 56; xx += 12) rect(ctx, x + xx, yy + 2, 8, 7, '#5a6878'); rect(ctx, x + 4, yy + 8, 52, 1, '#444'); }
    if (i % 2 === 0) riverFlag(ctx, x + 22, top + 14 + ((i >> 1) % 3) * 12, 16, 10);
    if (i % 3 === 1) poster(ctx, x + 12, 108, 'KIPER', 'PDTE');
    if (i % 3 === 2) poster(ctx, x + 12, 108, 'VAMOS', 'TRILLO');
  });
  // jacarandás y pasacalles
  layer(camX, 0.7, 110, (i, x) => { rect(ctx, x + 10, 116, 3, 28, '#4a3a2a'); ctx.fillStyle = '#9b6bd6'; ctx.beginPath(); ctx.arc(x + 11, 108, 15, 0, 7); ctx.arc(x + 1, 115, 9, 0, 7); ctx.arc(x + 21, 115, 9, 0, 7); ctx.fill(); });
  layer(camX, 0.8, 360, (i, x) => {
    ctx.strokeStyle = '#444'; ctx.beginPath(); ctx.moveTo(x, 70); ctx.lineTo(x + 140, 70); ctx.stroke();
    rect(ctx, x + 20, 70, 100, 13, '#f4f4f4'); rect(ctx, x + 20, 70, 100, 2, '#e0161b'); rect(ctx, x + 20, 81, 100, 2, '#e0161b');
    txt(ctx, i & 1 ? 'VAMOS TRILLO' : 'KIPER PRESIDENTE', x + 70, 73, '#c0101a', 5, 'center', null);
  });
  // vereda + calle
  rect(ctx, 0, 144, W, 10, '#c6c0b4'); ctx.fillStyle = '#aaa498'; layer(camX, 1, 18, (i, x) => ctx.fillRect(x, 144, 1, 8)); rect(ctx, 0, 152, W, 2, '#8a8478');
  rect(ctx, 0, 154, W, H - 154, '#56565c');
  layer(camX, 1, 50, (i, x) => rect(ctx, x, 183, 26, 2, '#eee'));
  // Aeroparque al inicio
  const st = Math.round(0 - camX);
  if (st > -460) {
    rect(ctx, st - 10, 60, 450, 84, '#dfe6ec'); rect(ctx, st - 10, 56, 450, 6, '#75aadb');
    for (let k = 0; k < 14; k++) rect(ctx, st + 4 + k * 32, 70, 26, 40, '#8ab4d4');
    rect(ctx, st + 130, 116, 60, 28, '#6a8aa8');
    rect(ctx, st + 90, 38, 150, 18, '#1f3a6e'); txt(ctx, 'AEROPARQUE', st + 165, 43, '#fff', 8, 'center', null);
    txt(ctx, 'BIENVENIDOS A BUENOS AIRES', st + 165, 62, '#1f3a6e', 5, 'center', null);
  }
}

// =====================================================================
// CENTRO PORTEÑO (Santi nivel 2): San Telmo, Monserrat -> Casa Rosada
// =====================================================================
function bgCentro(ctx, camX, t, g) {
  skyGrad(ctx, ['#f0a868', '#f8d0a0', '#fdeccc']);
  clouds(ctx, camX, t, 'rgba(255,240,225,0.85)');
  layer(camX, 0.15, 52, (i, x) => { const h = 40 + rnd(i + 8) * 50; rect(ctx, x, 140 - h, 48, h, '#c8a890'); if (i % 6 === 0) { rect(ctx, x + 18, 140 - h - 12, 12, 12, '#a88a76'); rect(ctx, x + 23, 140 - h - 20, 2, 8, '#a88a76'); } });
  // fachadas coloniales / art nouveau
  layer(camX, 0.5, 60, (i, x) => {
    const h = 56 + rnd(i + 3) * 30, top = 140 - h, c = pal(['#e8c8a8', '#d8b890', '#f0dcc0', '#c8a080', '#e0b8a0', '#b8c8c0'], (rnd(i + 1) * 97) | 0);
    rect(ctx, x, top, 56, h, c); rect(ctx, x - 2, top - 4, 60, 4, shade(c, 0.75)); rect(ctx, x + 2, top - 7, 52, 3, shade(c, 0.85));
    for (let yy = top + 8; yy < 126; yy += 16) for (const xx of [6, 22, 38]) { rect(ctx, x + xx, yy, 11, 12, '#4a3a30'); rect(ctx, x + xx - 1, yy + 12, 13, 1, '#222'); for (let k = 0; k < 13; k += 2) rect(ctx, x + xx - 1 + k, yy + 9, 1, 3, '#222'); }
    rect(ctx, x + 22, 122, 12, 18, '#3a2416');
  });
  // piso: adoquines en San Telmo, asfalto en Av. de Mayo
  rect(ctx, 0, 144, W, 10, '#b8b0a2'); ctx.fillStyle = '#9a9284'; layer(camX, 1, 16, (i, x) => ctx.fillRect(x, 144, 1, 8)); rect(ctx, 0, 152, W, 2, '#7a7468');
  rect(ctx, 0, 154, W, H - 154, '#5a5450');
  for (let r = 0; r < 10; r++) { const y = 154 + r * 6, off = (r & 1) * 5; layer(camX, 1, 10, (i, x) => { if (i * 10 < 2000) rect(ctx, x + off, y, 9, 5, rnd(i * 13 + r) < 0.5 ? '#6e6660' : '#665e58'); else if (r === 5) rect(ctx, x, 184, 6, 2, '#ddd'); }); }
  layer(camX, 1, 250, (i, x) => lamppost(ctx, x + 50, 147));
  const at = (wx) => Math.round(wx - camX);
  // Café London City
  let x = at(650);
  if (x > -170 && x < W + 10) {
    rect(ctx, x, 62, 160, 86, '#ece0c8'); rect(ctx, x, 96, 160, 52, '#1f3a2a');
    rect(ctx, x + 10, 100, 140, 14, '#14261c'); txt(ctx, 'LONDON CITY', x + 80, 103, '#e8c860', 8, 'center', null);
    for (let k = 0; k < 3; k++) { rect(ctx, x + 8 + k * 52, 118, 40, 28, '#2a1a10'); rect(ctx, x + 10 + k * 52, 120, 36, 24, '#ffd890'); }
    ctx.fillStyle = '#14261c'; ctx.beginPath(); ctx.arc(x + 150, 84, 8, 0, 7); ctx.fill(); txt(ctx, 'CAFE', x + 150, 82, '#e8c860', 3, 'center', null);
    for (const tx of [x + 30, x + 110]) { rect(ctx, tx, 140, 12, 2, '#ddd'); rect(ctx, tx + 5, 142, 2, 6, '#888'); }
    for (let k = 0; k < 6; k++) rect(ctx, x + 8 + k * 26, 70, 14, 20, '#5a6878');
  }
  // Cine Gaumont
  x = at(1450);
  if (x > -170 && x < W + 10) {
    rect(ctx, x, 44, 150, 104, '#d8d0c4'); rect(ctx, x + 66, 30, 18, 70, '#8a1f2b');
    'GAUMONT'.split('').forEach((ch, k) => txt(ctx, ch, x + 75, 33 + k * 9, ((t >> 3) + k) % 7 ? '#ffe680' : '#fff', 7, 'center', null));
    rect(ctx, x + 10, 100, 130, 14, '#1a1a1a'); for (let k = 0; k < 26; k++) rect(ctx, x + 12 + k * 5, 101, 2, 2, ((t >> 2) + k) & 1 ? '#ffe680' : '#664');
    txt(ctx, 'CINE ARGENTINO', x + 75, 105, '#fff', 5, 'center', null);
    for (let k = 0; k < 3; k++) { rect(ctx, x + 14 + k * 44, 118, 34, 30, '#2a1a14'); rect(ctx, x + 18 + k * 44, 122, 26, 20, '#c8a060'); }
  }
  // El Imparcial
  x = at(2250);
  if (x > -170 && x < W + 10) {
    rect(ctx, x, 60, 150, 88, '#e8d8b8'); rect(ctx, x + 10, 64, 130, 18, '#7a1414');
    txt(ctx, 'EL IMPARCIAL', x + 75, 67, '#f5c400', 8, 'center', null); txt(ctx, 'RESTAURANT', x + 75, 76, '#fff', 3, 'center', null);
    rect(ctx, x + 10, 88, 130, 3, '#c0141c'); rect(ctx, x + 10, 91, 130, 3, '#f5c400'); rect(ctx, x + 10, 94, 130, 3, '#c0141c');
    for (let k = 0; k < 4; k++) { rect(ctx, x + 12 + k * 34, 102, 26, 40, '#3a2416'); rect(ctx, x + 15 + k * 34, 105, 20, 30, '#ffd890'); }
  }
  // Casa Rosada
  x = at(g.lv.len - 330);
  if (x > -330 && x < W + 10) {
    rect(ctx, x, 46, 320, 102, '#e8a8a0'); rect(ctx, x - 4, 42, 328, 5, '#c88078');
    for (let k = 0; k < 12; k++) { rect(ctx, x + 8 + k * 26, 56, 14, 24, '#8a5a58'); rect(ctx, x + 8 + k * 26, 90, 14, 24, '#8a5a58'); ctx.fillStyle = '#8a5a58'; ctx.beginPath(); ctx.arc(x + 15 + k * 26, 90, 7, Math.PI, 0); ctx.fill(); }
    rect(ctx, x + 130, 100, 60, 48, '#d89890'); ctx.fillStyle = '#5a3a38'; ctx.beginPath(); ctx.arc(x + 160, 120, 18, Math.PI, 0); ctx.fill(); rect(ctx, x + 142, 120, 36, 28, '#5a3a38');
    rect(ctx, x + 120, 30, 80, 14, '#e8a8a0'); rect(ctx, x + 158, 6, 2, 26, '#ccc');
    const w = Math.round(Math.sin(t / 7) * 1); rect(ctx, x + 160, 6 + w, 22, 4, '#75aadb'); rect(ctx, x + 160, 10 + w, 22, 4, '#fff'); rect(ctx, x + 160, 14 + w, 22, 4, '#75aadb'); rect(ctx, x + 169, 11 + w, 3, 2, '#f5c400');
    txt(ctx, 'CASA ROSADA', x + 160, 32, '#8a3a38', 6, 'center', null);
    for (let k = 0; k < 40; k++) rect(ctx, x - 20 + k * 9, 132, 1, 14, '#222'); rect(ctx, x - 20, 132, 360, 1, '#222');
  }
}

// =====================================================================
// CONFIGURACIÓN DE NIVELES
// =====================================================================
const ENEMY_STATS = {
  thug: { hp: 34, speed: 0.6, dmg: 7, scale: 1.25, score: 100 },
  fast: { hp: 22, speed: 1.05, dmg: 5, scale: 1.2, score: 150 },
  big: { hp: 70, speed: 0.45, dmg: 12, scale: 1.5, score: 300 },
};

function W8(x, ...list) { // helper para oleadas: tipos con delays escalonados
  return { x, list: list.map((t, i) => ({ t, d: i * 40, side: i % 3 === 2 ? -1 : 1 })) };
}

const LEVELS = [
  {
    id: 'boca', hero: 'juani', title: 'LA BOCA', sub: 'CAMINITO - LA BOMBONERA', len: 3500, bg: bgBoca,
    item: 'chori', genoves: 2700, caseus: 1700, next: 'boca2',
    enemyLooks: {
      thug: { skin: '#d9a27a', hair: '#222', hairStyle: 'buzz', shirt: 'tank', shirtCol: '#e8e8e8', pants: '#33415e', shoes: '#333' },
      fast: { skin: '#e8b58c', hair: '#3a2a20', hairStyle: 'short', shirt: 'jacket', shirtCol: '#30303a', pants: '#30303a', shoes: '#eee', hat: 'cap', hatCol: '#c62828' },
      big: { skin: '#c68a5e', hair: '#222', hairStyle: 'bald', mustache: '#222', shirt: 'plain', shirtCol: '#7a6a5a', pants: '#2a2a2a', shoes: '#222', belly: true },
    },
    names: { thug: ['EL TURCO', 'CHUECO', 'EL PELADO', 'TANO'], fast: ['MONITO', 'EL FLACO', 'RATON'], big: ['EL GORDO', 'TORO'] },
    props: [[520, 'barril'], [980, 'tacho'], [1500, 'caja'], [2050, 'barril'], [2550, 'caja']],
    waves: [W8(300, 'thug', 'thug'), W8(800, 'thug', 'fast', 'thug'), W8(1350, 'fast', 'fast', 'thug', 'big'), W8(1950, 'thug', 'big', 'fast', 'thug'), W8(2400, 'fast', 'thug', 'fast', 'thug', 'big')],
    npc: { x: 2790, who: 'fran', look: () => HEROES.fran.look, gift: 'milanesa',
      lines: [['FRAN', 'JUANI! QUE HACES POR LA BOCA, LOCO?'], ['JUANI', 'ACA ANDO, LIMPIANDO EL BARRIO. Y VOS CON LA DEL TALADRO?'], ['FRAN', 'BANFIELD ES UN SENTIMIENTO. TOMA, UN SANGUCHE DE MILANESA DE EL GENOVES.'], ['FRAN', 'COMELO QUE EL QUE VIENE ES PESADO... SUPER IACOBELLIS.']] },
    boss: { name: 'SUPER IACOBELLIS', hp: 320, scale: 1.75, speed: 0.75, dmg: 12, attacks: ['throw', 'throw', 'charge', 'combo'], projs: ['yerba', 'fajo', 'pelota'], extra: 'mate',
      look: { skin: '#c9906a', hair: '#1a1410', hairStyle: 'short', stubble: '#9a6a4c', shirt: 'rayasBW', pants: '#111', shorts: true, socks: '#111', shoes: '#111' },
      intro: [['SUPER IACOBELLIS', 'BUENAS... TOMATE UN MATECITO QUE ESTO VA PARA LARGO.']] },
    intro: [['JUANI', 'LA BOCA, MI BARRIO. HOY NADIE ME ARRUINA LA TARDE.']],
    song: { bpm: 112, bassWave: 'triangle', bass: [0, null, null, 0, null, null, 7, null, 5, null, null, 5, null, null, 3, null], lead: [12, null, 15, 12, 19, null, 17, 15, 12, null, 10, null, 12, null, null, null, 12, null, 15, 17, 19, null, 22, 20, 19, null, 17, null, 15, null, null, null], drums: 'k..k..s.k.k.s..h' },
  },
  {
    id: 'boca2', hero: 'juani', stage2: true, label: 'LA BOCA - NIVEL 2', title: 'LA BOCA II', sub: 'RIACHUELO DE NOCHE - BOMBONERA', len: 3600, bg: bgBoca2,
    item: 'chori', item2: 'empanada', caseus: 1500,
    enemyLooks: {
      thug: { skin: '#e8b58c', hair: '#222', hairStyle: 'short', shirt: 'suit', shirtCol: '#16161c', pants: '#16161c', shoes: '#111', glasses: '#000', tie: '#222', longSleeve: true },
      fast: { skin: '#d9a27a', hair: '#3a2a20', hairStyle: 'side', shirt: 'jacket', shirtCol: '#f5d000', pants: '#222', shoes: '#fff', hat: 'cap', hatCol: '#f5d000' },
      big: { skin: '#c68a5e', hair: '#222', hairStyle: 'bald', shirt: 'suit', shirtCol: '#16161c', pants: '#16161c', shoes: '#111', glasses: '#000', belly: true, longSleeve: true },
    },
    names: { thug: ['CUSTODIO', 'EL ROPERO', 'AGENTE K'], fast: ['MILITANTE', 'GLOBERO', 'TIMBREADOR'], big: ['GUARDAESPALDAS', 'EL MOAI'] },
    props: [[520, 'barril'], [1000, 'caja'], [1950, 'barril'], [2500, 'tacho']],
    waves: [W8(300, 'thug', 'fast', 'thug'), W8(800, 'fast', 'fast', 'thug', 'thug'), W8(1250, 'big', 'thug', 'fast'), W8(1900, 'fast', 'thug', 'big', 'fast', 'thug'), W8(2550, 'thug', 'big', 'fast', 'fast', 'thug', 'big')],
    boss: { name: 'MACRI', hp: 360, scale: 1.75, speed: 0.75, dmg: 12, attacks: ['throw', 'dance', 'charge', 'throw', 'combo'], projs: ['globo', 'globo', 'factura'],
      look: { skin: '#eab896', hair: '#8c8c8c', hairStyle: 'side', shirt: 'suit', shirtCol: '#1b2238', tie: '#6e2a52', pants: '#1b2238', shoes: '#111', longSleeve: true, sleeveCol: '#1b2238' },
      intro: [['MACRI', 'JUANI! QUE BUENO VERTE POR LA BOMBONERA... SI SE PUEDE!'], ['JUANI', 'NO ME VENGAS CON GLOBOS AMARILLOS, EH.'], ['MACRI', 'TRANQUILO... PRIMERO BAILAMOS UN POQUITO.']] },
    intro: [['JUANI', 'SE HIZO DE NOCHE EN LA BOCA. EL RIACHUELO BRILLA... Y HAY CUSTODIOS POR TODOS LADOS.']],
    song: { bpm: 124, bassWave: 'triangle', bass: [0, null, null, 0, null, null, 7, null, 3, null, null, 3, null, null, 5, null], lead: [15, null, 12, 15, 19, null, 17, 15, 12, null, 10, null, 7, null, null, null, 15, null, 17, 19, 22, null, 24, 22, 19, null, 17, null, 15, null, null, null], drums: 'k.hk.hs.k.k.s.hh' },
  },
  {
    id: 'tokyo', hero: 'nico', p2: 'santi', title: 'TOKIO', sub: 'SHIBUYA - SHINJUKU - SKYTREE', len: 4100, bg: bgTokyo,
    item: 'sushi', item2: 'ramen', caseus: 1250, p2Join: 'caseus', next: 'river2',
    warp: { x: 2450, afterWave: 4, toX: 3000, text: 'SHINKANSEN A HIROSHIMA...' },
    enemyLooks: {
      thug: { skin: '#f0cfae', hair: '#111', hairStyle: 'side', shirt: 'suit', shirtCol: '#1b1b22', pants: '#1b1b22', shoes: '#111', glasses: '#000', tie: '#222', longSleeve: true },
      fast: { skin: '#f5d6b8', hair: '#111', hairStyle: 'spiky', shirt: 'gakuran', pants: '#16161e', shoes: '#333', longSleeve: true },
      big: { skin: '#e8c39e', hair: '#111', hairStyle: 'buzz', shirt: 'happi', pants: '#222', shoes: '#111', headband: true, hat: 'headband', hatCol: '#fff', belly: true },
    },
    lateLooks: {
      thug: { skin: '#f0cfae', hair: '#111', hairStyle: 'short', shirt: 'sanfrecce', pants: '#fff', shoes: '#5b2a8c' },
      fast: { skin: '#e8c39e', hair: '#111', hairStyle: 'spiky', shirt: 'sanfrecce', pants: '#5b2a8c', shoes: '#fff', hat: 'headband', hatCol: '#5b2a8c' },
      big: { skin: '#f0cfae', hair: '#111', hairStyle: 'buzz', shirt: 'sanfrecce', pants: '#222', shoes: '#fff', belly: true },
    },
    names: { thug: ['KENJI', 'HIRO', 'TAKESHI', 'RYO'], fast: ['SHOTA', 'YUTO', 'KAITO'], big: ['GORO', 'TETSUO'] },
    props: [[600, 'expendedora'], [1150, 'tacho'], [1700, 'expendedora'], [2150, 'caja'], [3300, 'caja']],
    waves: [W8(300, 'thug', 'fast'), W8(850, 'thug', 'thug', 'fast'), W8(1400, 'fast', 'fast', 'big', 'thug'), W8(1950, 'thug', 'big', 'fast', 'thug', 'fast'), W8(3150, 'thug', 'fast', 'thug', 'big')],
    boss: { name: 'SANFRECHE-SAN', hp: 340, scale: 1.7, speed: 0.85, dmg: 11, attacks: ['summon', 'charge', 'throw', 'combo'], projs: ['bufanda'], summonLooks: 'lateLooks',
      look: { skin: '#f0cfae', hair: '#111', hairStyle: 'short', shirt: 'sanfrecce', pants: '#fff', shoes: '#5b2a8c', hat: 'piluso', glasses: '#000' },
      intro: [['SANFRECHE-SAN', 'BIENVENIDO A HIROSHIMA, RIVER-SAN. MI HINCHADA NO PERDONA.']] },
    intro: [['NICO', 'KONNICHIWA TOKIO! VINE CON LA DE RIVER Y TODOS ME MIRAN...'], ['NICO', 'DICEN QUE SANTI ANDA POR ACA... CAPAZ LO CRUZO EN ALGUN LADO.']],
    p2JoinLines: [['SANTI', 'NICO!! QUE HACES ACA? YO VINE POR LA PICADA DE ANA.'], ['NICO', 'SANTI! JUSTO A TIEMPO. VAMOS JUNTOS A HIROSHIMA?'], ['SANTI', 'VAMOS! DE RIVER A JAPON. (P2: APRETA F PARA MANEJAR A SANTI)']],
    warpLines: [['NICO', 'AL SHINKANSEN! DICEN QUE EL JEFE ESTA EN HIROSHIMA.']],
    song: { bpm: 132, bassWave: 'sawtooth', bass: [0, null, 0, 12, null, 0, 10, null, 7, null, 7, 19, null, 7, 5, null], lead: [12, 15, 17, 19, 22, 19, 17, 15, 24, null, 22, null, 19, null, 17, null], drums: 'k.h.s.h.k.k.s.hh', leadLen: 0.8 },
  },
  {
    id: 'ams', hero: 'santi', title: 'AMSTERDAM', sub: 'LOS CANALES', len: 4200, bg: bgAmsterdam, fg: fgAmsterdam,
    item: 'stroop', item2: 'empanada', caseus: 1250, caseus2: 3420, next: 'centro',
    warp: { x: 2500, afterWave: 4, toX: 3000, text: 'EL PORTAL TE LLEVA AL OBELISCO!' },
    enemyLooks: {
      thug: { skin: '#f2d0b5', hair: '#d9b44a', hairStyle: 'long', shirt: 'hawaii', shirtCol: '#38b6ff', pants: '#c8a060', shoes: '#222', glasses: '#222' },
      fast: { skin: '#f5d6c0', hair: '#7a4a20', hairStyle: 'short', shirt: 'jacket', shirtCol: '#ffd23f', pants: '#222', shoes: '#ff7a00', hat: 'bike', hatCol: '#ff7a00' },
      big: { skin: '#f2d0b5', hair: '#c0602a', hairStyle: 'buzz', beard: '#c0602a', shirt: 'orange', pants: '#1f3a6a', shoes: '#ff7a00', belly: true },
    },
    lateLooks: {
      thug: { skin: '#c68a5e', hair: '#222', hairStyle: 'short', shirt: 'suit', shirtCol: '#2a2a35', pants: '#2a2a35', shoes: '#111', glasses: '#000', longSleeve: true },
      fast: { skin: '#e8b58c', hair: '#222', hairStyle: 'buzz', shirt: 'jacket', shirtCol: '#ff7a00', pants: '#333', shoes: '#111', hat: 'cap', hatCol: '#ff7a00' },
      big: { skin: '#8d5a3b', hair: '#111', hairStyle: 'bald', shirt: 'suit', shirtCol: '#1d1f2b', pants: '#1d1f2b', shoes: '#111', belly: true, glasses: '#000', longSleeve: true },
    },
    names: { thug: ['JOOST', 'DAAN', 'PIETER', 'BRAM'], fast: ['SANDER', 'LARS', 'TIM'], big: ['HOOLIGAN NARANJA', 'KEES'] },
    props: [[560, 'maceta'], [1100, 'caja'], [1650, 'maceta'], [2200, 'tacho'], [3300, 'tacho']],
    waves: [W8(300, 'thug', 'thug'), W8(850, 'fast', 'thug', 'fast'), W8(1400, 'big', 'thug', 'fast'), W8(1950, 'thug', 'fast', 'big', 'fast', 'thug'), W8(3150, 'thug', 'fast', 'big', 'thug')],
    boss: { name: 'BLACKRI', hp: 340, scale: 1.75, speed: 0.7, dmg: 13, attacks: ['throw', 'throw', 'throw', 'charge'], projs: ['asfalto', 'baldosa', 'contenedor', 'poste'],
      look: { skin: '#b07850', hair: '#6e6e6e', hairStyle: 'short', shirt: 'suitDark', pants: '#1f2a4e', shoes: '#111', longSleeve: true, sleeveCol: '#1f2a4e' },
      intro: [['BLACKRI', 'ESTA CIUDAD ES MIA. CADA BALDOSA, CADA POSTE... TODO ES MI ARMA.']] },
    intro: [['SANTI', 'AMSTERDAM... QUE OLOR A... TULIPANES. SI, TULIPANES.']],
    warpLines: [['SANTI', 'UN PORTAL?! ESO ES... EL OBELISCO! VOLVI A BUENOS AIRES!']],
    song: { bpm: 92, bassWave: 'triangle', bass: [0, null, null, null, 0, null, 3, null, 5, null, null, null, 5, null, 3, null], lead: [null, null, 12, null, null, null, 15, null, null, null, 17, null, null, null, 15, null], drums: 'k...s...k.k.s...', leadLen: 2 },
  },
  {
    id: 'banfield', hero: 'fran', p2: 'martin', title: 'BANFIELD', sub: 'CONURBANO - FLORENCIO SOLA', len: 3600, bg: bgBanfield,
    item: 'empanada', item2: 'mate', caseus: 1750, next: 'lanus',
    enemyLooks: {
      thug: { skin: '#d9a27a', hair: '#222', hairStyle: 'buzz', shirt: 'jacket', shirtCol: '#1f2a5a', pants: '#1f2a5a', shoes: '#fff', hat: 'visor', longSleeve: true },
      fast: { skin: '#c68a5e', hair: '#222', hairStyle: 'short', shirt: 'jacket', shirtCol: '#222', pants: '#222', shoes: '#fff', hat: 'visor', longSleeve: true },
      big: { skin: '#e0a882', hair: '#222', hairStyle: 'buzz', shirt: 'jacket', shirtCol: '#7a1f2b', pants: '#5a1520', shoes: '#fff', hat: 'visor', belly: true, longSleeve: true },
    },
    names: { thug: ['EL TOTO', 'BRIAN', 'MAXI', 'TOBI'], fast: ['EL LAUCHA', 'DYLAN', 'KEVIN'], big: ['EL CHUECO', 'EL GORDO VALOR'] },
    props: [[540, 'tacho'], [1050, 'caja'], [1600, 'tacho'], [2150, 'caja'], [2700, 'tacho']],
    waves: [W8(300, 'thug', 'fast', 'thug'), W8(850, 'fast', 'fast', 'thug'), W8(1400, 'thug', 'big', 'fast', 'thug'), W8(1950, 'fast', 'thug', 'fast', 'big', 'thug'), W8(2550, 'big', 'thug', 'fast', 'fast', 'thug', 'big')],
    boss: { name: 'CHIQUI TAP', hp: 380, scale: 1.85, speed: 0.6, dmg: 14, attacks: ['throw', 'throw', 'charge', 'slam'], projs: ['copa', 'medalla', 'trofeo'],
      look: { skin: '#a8714c', hair: '#b8b8b8', hairStyle: 'slick', glasses: '#111', shirt: 'suitCeleste', pants: '#bcd9f0', shoes: '#fff', belly: true, longSleeve: true, sleeveCol: '#bcd9f0' },
      intro: [['CHIQUI TAP', 'ACA MANDA LA AFA, PIBE. TENGO COPAS, MEDALLAS Y TROFEOS PARA TIRAR.']] },
    intro: [['FRAN', 'MI BARRIO. CASITAS INGLESAS, PASTO CORTADO... Y LOS DE GORRITA.']],
    p2Auto: [['MARTIN', 'FRAN!! CON ESTE GRANDOTE NO PODES SOLO. EL ROJO TE DA UNA MANO!'], ['FRAN', 'MARTIN! JUSTO A TIEMPO. VAMOS!'], ['MARTIN', '(P2: APRETA F PARA MANEJAR A MARTIN)']],
    song: { bpm: 100, bassWave: 'square', bass: [0, null, 7, null, 0, null, 7, null, 5, null, 12, null, 5, null, 12, null], lead: [19, null, 19, 17, 15, null, 17, null, 19, null, 22, null, 19, 17, 15, null], drums: 'k.hsk.hsk.hsk.hs', leadLen: 1 },
  },
  {
    id: 'lanus', hero: 'fran', p2: 'martin', stage2: true, label: 'BANFIELD - NIVEL 2', title: 'LANUS', sub: 'DE NOCHE - DEL TREN A LA FORTALEZA', len: 4000, bg: bgLanus,
    item: 'empanada', item2: 'pizza', caseus: 1700,
    enemyLooks: {
      thug: { skin: '#d9a27a', hair: '#222', hairStyle: 'buzz', shirt: 'plain', shirtCol: '#7a1f2b', pants: '#222', shoes: '#fff', hat: 'visor', longSleeve: false },
      fast: { skin: '#c68a5e', hair: '#222', hairStyle: 'short', shirt: 'jacket', shirtCol: '#7a1f2b', pants: '#5a1520', shoes: '#fff', hat: 'visor', longSleeve: true },
      big: { skin: '#e0a882', hair: '#222', hairStyle: 'bald', shirt: 'plain', shirtCol: '#7a1f2b', pants: '#2a2a2e', shoes: '#fff', belly: true },
    },
    names: { thug: ['GRANATE', 'EL TANO', 'PICHI', 'EL RULO'], fast: ['EL GRILLO', 'NACHO', 'RAMITA'], big: ['EL BOMBO', 'GORDO LANUS'] },
    props: [[620, 'tacho'], [1450, 'caja'], [2100, 'tacho'], [2700, 'barril'], [3300, 'tacho']],
    waves: [W8(450, 'thug', 'fast', 'thug'), W8(950, 'fast', 'thug', 'big'), W8(1500, 'thug', 'fast', 'fast', 'thug'), W8(2150, 'big', 'thug', 'fast', 'thug', 'fast'), W8(2800, 'fast', 'big', 'thug', 'fast', 'big', 'thug')],
    boss: { name: 'PADRINO NICOLA', hp: 400, scale: 1.8, speed: 0.6, dmg: 14, attacks: ['throw', 'summon', 'charge', 'throw', 'slam'], projs: ['pizza', 'adoquin', 'adoquin'], summonLooks: 'enemyLooks', summonText: 'VAMOS GRANATE!', summonProj: 'adoquin',
      look: { skin: '#e2a684', hair: '#7a5a48', hairStyle: 'bald', bigHead: true, belly: true, shirt: 'plain', shirtCol: '#8a1e2a', longSleeve: true, sleeveCol: '#8a1e2a', pants: '#2a2a30', shoes: '#3a2a1a' },
      intro: [['PADRINO NICOLA', 'BIENVENIDO A LANUS, PIBE. ACA EL QUE MANDA ES EL PADRINO.'], ['FRAN', 'VENGO DE BANFIELD, NICOLA. NO ME ASUSTAS.'], ['PADRINO NICOLA', 'JE... VAMOS A VER CUANTO AGUANTAS EN LA FORTALEZA.']] },
    intro: [['FRAN', 'ME BAJO DEL TREN EN LANUS... DE NOCHE Y TODO GRANATE.'], ['FRAN', 'LAS CALLES ESTAN ROTAS Y LA HINCHADA EN LA VEREDA. A NO DISTRAERSE.']],
    p2Auto: [['MARTIN', 'FRAN! EL PADRINO ES DURO, PERO EL ROJO NO TE DEJA SOLO!'], ['MARTIN', '(P2: APRETA F PARA MANEJAR A MARTIN)']],
    song: { bpm: 108, bassWave: 'square', bass: [0, null, 3, null, 7, null, 3, null, 5, null, 8, null, 7, null, 3, null], lead: [15, null, 15, 14, 12, null, 10, null, 12, null, 15, null, 19, 17, 15, null], drums: 'k.hsk.hsk.hsk.hs', leadLen: 1 },
  },
  {
    id: 'river2', hero: 'nico', p2: 'santi', p2Start: true, stage2: true, label: 'TOKIO - NIVEL 2', title: 'BARRIO RIVER', sub: 'AEROPARQUE - BELGRANO - MONUMENTAL', len: 4000, bg: bgRiver2,
    item: 'empanada', item2: 'chori', caseus: 1700,
    enemyLooks: {
      thug: { skin: '#e2a77f', hair: '#222', hairStyle: 'buzz', shirt: 'boca', pants: '#1a1a1a', shoes: '#fff' },
      fast: { skin: '#d9a27a', hair: '#3a2a20', hairStyle: 'short', shirt: 'jacket', shirtCol: '#1a3fa8', pants: '#1a1a2e', shoes: '#f5d000', hat: 'cap', hatCol: '#f5d000', longSleeve: true },
      big: { skin: '#c68a5e', hair: '#222', hairStyle: 'bald', shirt: 'boca', pants: '#1a1a1a', shoes: '#111', belly: true },
    },
    names: { thug: ['BOSTERO', 'EL XENEIZE', 'JUANCHO'], fast: ['EL INFILTRADO', 'GALLINERO NO'], big: ['EL BOMBO BOSTERO', 'TANQUE'] },
    props: [[600, 'tacho'], [1250, 'caja'], [2050, 'tacho'], [2700, 'caja'], [3300, 'tacho']],
    waves: [W8(450, 'thug', 'fast', 'thug'), W8(1000, 'fast', 'thug', 'big'), W8(1550, 'thug', 'fast', 'fast', 'thug'), W8(2200, 'big', 'thug', 'fast', 'thug', 'fast'), W8(2850, 'fast', 'big', 'thug', 'fast', 'big', 'thug')],
    boss: { name: 'YAYO COZZA DI CARLO', hp: 380, scale: 1.75, speed: 0.8, dmg: 12, attacks: ['throw', 'throw', 'charge', 'combo', 'throw'], projs: ['mamadera', 'mamadera', 'fajo', 'butaca'],
      look: { skin: '#eab896', hair: '#2a1d16', hairStyle: 'short', shirt: 'suit', shirtCol: '#1d1f2b', tie: '#c0141c', pants: '#1d1f2b', shoes: '#111', longSleeve: true, sleeveCol: '#1d1f2b' },
      intro: [['YAYO COZZA DI CARLO', 'BIENVENIDOS AL MONUMENTAL, MUCHACHOS. TRAJE LA MAMADERA...'], ['NICO', 'VOLVIMOS DE JAPON SOLO PARA ESTO, YAYO.'], ['YAYO COZZA DI CARLO', 'ENTONCES QUE VUELEN LAS BUTACAS!']] },
    intro: [['NICO', 'ATERRIZAMOS EN AEROPARQUE! DE TOKIO DERECHO A BELGRANO.'], ['SANTI', 'VAMOS CAMINANDO AL MONUMENTAL. ESTA TODO LLENO DE BANDERAS.']],
    song: { bpm: 128, bassWave: 'square', bass: [0, null, 12, null, 7, null, 12, null, 5, null, 17, null, 7, null, 19, null], lead: [12, 14, 16, 19, 16, 14, 12, null, 14, 16, 19, 21, 19, 16, 14, null], drums: 'k.h.s.h.k.hks.h.', leadLen: 0.8 },
  },
  {
    id: 'centro', hero: 'santi', stage2: true, label: 'AMSTERDAM - NIVEL 2', title: 'CENTRO PORTENO', sub: 'SAN TELMO - MONSERRAT - CASA ROSADA', len: 4000, bg: bgCentro,
    item: 'empanada', item2: 'alfajor', caseus: 1900,
    enemyLooks: {
      thug: { skin: '#e8b58c', hair: '#222', hairStyle: 'side', shirt: 'suit', shirtCol: '#2a2a35', pants: '#2a2a35', shoes: '#111', glasses: '#000', longSleeve: true },
      fast: { skin: '#d9a27a', hair: '#3a2a20', hairStyle: 'spiky', shirt: 'cuero3', pants: '#222', shoes: '#111', longSleeve: true },
      big: { skin: '#c68a5e', hair: '#111', hairStyle: 'bald', shirt: 'suit', shirtCol: '#16161c', pants: '#16161c', shoes: '#111', glasses: '#000', belly: true, longSleeve: true },
    },
    names: { thug: ['ASESOR', 'EL TUITERO', 'EL ECONOMISTA'], fast: ['MOTOQUERO', 'EL CUERITO'], big: ['GUARDAESPALDAS', 'EL ROPERO'] },
    props: [[560, 'barril'], [1250, 'tacho'], [1750, 'caja'], [2550, 'tacho'], [3200, 'caja']],
    waves: [W8(450, 'thug', 'fast', 'thug'), W8(1050, 'fast', 'thug', 'big'), W8(1650, 'thug', 'fast', 'fast', 'thug'), W8(2400, 'big', 'thug', 'fast', 'thug', 'fast'), W8(3000, 'fast', 'big', 'thug', 'fast', 'big', 'thug')],
    boss: { name: 'EL PELUCA', hp: 400, scale: 1.75, speed: 0.85, dmg: 13, attacks: ['throw', 'charge', 'throw', 'combo', 'throw'], projs: ['perro', 'perro', 'motosierra', 'campera'],
      look: { skin: '#eab896', hair: '#3a2a20', hairStyle: 'peluca', shirt: 'cuero3', pants: '#1a1414', shoes: '#111', belly: true, longSleeve: true, sleeveCol: '#1a1414' },
      intro: [['EL PELUCA', 'VIVA LA LIBERTAD, CARAJO!! BIENVENIDO A LA CASA ROSADA.'], ['SANTI', 'TENES TRES CAMPERAS DE CUERO PUESTAS? HACE CALOR, PELUCA.'], ['EL PELUCA', 'AFUERA! SUELTEN A LOS PERROS!']] },
    intro: [['SANTI', 'DEL OBELISCO AL CENTRO: SAN TELMO, MONSERRAT... Y AL FINAL LA CASA ROSADA.']],
    song: { bpm: 116, bassWave: 'triangle', bass: [0, null, null, 0, null, null, 5, null, 3, null, null, 3, null, null, 7, null], lead: [12, null, 15, 17, 19, null, 17, 15, 14, null, 12, null, 10, null, null, null], drums: 'k..hs.h.k.kh.s.h' },
  },
];

const SONG_TITLE = { bpm: 120, bassWave: 'triangle', bass: [0, null, 12, null, 7, null, 12, null, 5, null, 17, null, 7, null, 19, null], lead: [12, 15, 19, 24, 19, 15, 12, null, 10, 14, 17, 22, 17, 14, 10, null], drums: 'k.h.s.h.k.hks.h.', leadLen: 0.8 };
const SONG_BOSS = { bpm: 150, bassWave: 'sawtooth', bass: [0, 0, 12, 0, 1, 1, 13, 1, 0, 0, 12, 0, 3, 3, 15, 3], lead: [12, null, 13, null, 12, null, 10, null, 12, null, 15, null, 13, 12, 10, null], drums: 'k.s.kks.k.s.kkss', leadLen: 0.7 };
const MAIN_LEVELS = LEVELS.filter(l => !l.stage2);
