// ===== QEP ARCADE — pixel art procedural de personajes y objetos =====
'use strict';

const PC = document.createElement('canvas'); PC.width = 64; PC.height = 64;
const pcx = PC.getContext('2d');
const PFX = 32, PFY = 58; // pies del sprite dentro del canvas auxiliar

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  r = clamp(Math.round(r * k), 0, 255); g = clamp(Math.round(g * k), 0, 255); b = clamp(Math.round(b * k), 0, 255);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// línea gruesa de pixeles (para brazos)
function limb(c, x0, y0, x1, y1, col, col2, split = 0.45, t = 3) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    c.fillStyle = k < split ? col : col2;
    c.fillRect(Math.round(x0 + (x1 - x0) * k - t / 2), Math.round(y0 + (y1 - y0) * k - t / 2), t, t);
  }
}

function drawShirt(c, L, x, y, w, h) {
  const base = L.shirtCol || '#ddd';
  rect(c, x, y, w, h, base);
  switch (L.shirt) {
    case 'boca':
      rect(c, x, y, w, h, '#1a3fa8');
      rect(c, x, y + 4, w, 4, '#f5d000');
      rect(c, x + 3, y, w - 6, 1, '#f5d000');
      break;
    case 'river':
      rect(c, x, y, w, h, '#f4f4f4');
      for (let i = 0; i < h; i++) rect(c, x + Math.round((w - 3) * (i / (h - 1))), y + i, 3, 1, '#e0161b');
      rect(c, x + 3, y, w - 6, 1, '#111');
      rect(c, x, y, 2, 1, '#111'); rect(c, x + w - 2, y, 2, 1, '#111');
      break;
    case 'riverAlt':
      rect(c, x, y, w, h, '#6a1a2c');
      rect(c, x, y, 3, 1, '#e8506a'); rect(c, x, y + 2, 3, 1, '#e8506a');
      rect(c, x + w - 3, y, 3, 1, '#e8506a'); rect(c, x + w - 3, y + 2, 3, 1, '#e8506a');
      rect(c, x + w - 4, y + 4, 2, 2, '#f4f4f4');
      break;
    case 'banfield':
      rect(c, x, y, w, h, '#f4f4f4');
      for (let i = 1; i < w; i += 4) rect(c, x + i, y, 2, h, '#1a9a4a');
      rect(c, x + 3, y, w - 6, 1, '#1a9a4a');
      break;
    case 'rojo':
      rect(c, x, y, w, h, '#d3141b');
      rect(c, x + 3, y, w - 6, 1, '#fff');
      rect(c, x + w - 4, y + 3, 2, 2, '#fff');
      rect(c, x + 2, y + 7, w - 4, 1, '#f3d0d0');
      break;
    case 'jacket':
      rect(c, x, y, w, h, base);
      rect(c, x + w - 3, y, 1, h, '#fff');
      rect(c, x + 1, y, 1, h, '#fff');
      rect(c, x + Math.floor(w / 2), y, 1, h, shade(base, 0.6));
      rect(c, x, y + h - 2, w, 2, shade(base, 0.75));
      break;
    case 'suit':
      rect(c, x, y, w, h, base);
      rect(c, x + w - 5, y, 3, 5, '#fff');
      rect(c, x + w - 4, y + 1, 1, 6, L.tie || '#b00');
      break;
    case 'tank':
      rect(c, x, y, w, h, base);
      rect(c, x + 3, y, w - 6, 2, L.skin);
      break;
    case 'hawaii':
      rect(c, x, y, w, h, base);
      for (let i = 0; i < 6; i++) rect(c, x + ((i * 7) % w), y + ((i * 5) % h), 2, 2, L.shirtCol2 || '#ffe14d');
      break;
    case 'sumo':
      rect(c, x, y, w, h, L.skin);
      rect(c, x + w - 4, y + 2, 2, 2, shade(L.skin, 0.85));
      rect(c, x, y + h - 3, w, 3, '#5b2a86');
      break;
    case 'bus':
      rect(c, x, y, w, h, '#8fc3e8');
      rect(c, x + w - 4, y + 2, 2, 2, '#3a6c94');
      rect(c, x + Math.floor(w / 2), y, 1, h, '#5d8fb8');
      break;
    case 'gakuran':
      rect(c, x, y, w, h, '#16161e');
      for (let i = 1; i < h; i += 3) rect(c, x + w - 3, y + i, 1, 1, '#d8b44a');
      break;
    case 'orange':
      rect(c, x, y, w, h, '#ff7a00');
      rect(c, x + 2, y + 3, 3, 3, '#fff');
      break;
    case 'rayasBW':
      rect(c, x, y, w, h, '#f4f4f4');
      for (let i = 0; i < w; i += 4) rect(c, x + i, y, 2, h, '#111');
      rect(c, x + 3, y, w - 6, 1, '#111');
      break;
    case 'sanfrecce':
      rect(c, x, y, w, h, '#5b2a8c'); rect(c, x, y + 5, w, 2, '#fff'); rect(c, x + w - 4, y + 1, 2, 2, '#fff');
      break;
    case 'suitDark':
      rect(c, x, y, w, h, '#1f2a4e'); rect(c, x + w - 5, y, 3, 6, '#fff'); rect(c, x + w - 4, y + 1, 1, 7, '#141a30');
      rect(c, x + w - 6, y, 1, 7, '#2c3a66'); rect(c, x + w - 2, y, 1, 7, '#2c3a66');
      break;
    case 'suitCeleste':
      rect(c, x, y, w, h, '#bcd9f0'); rect(c, x + w - 6, y, 4, 8, '#fff'); rect(c, x + w - 5, y, 2, 2, L.skin);
      rect(c, x + w - 7, y, 1, 8, '#8ab6dc'); rect(c, x + w - 2, y, 1, 8, '#8ab6dc');
      rect(c, x + w - 9, y + 3, 1, 1, '#f5c400'); rect(c, x + w - 9, y + 5, 1, 1, '#75aadb');
      break;
    case 'velez':
      rect(c, x, y, w, h, '#f4f4f4');
      for (let i = 0; i < 5; i++) { rect(c, x + i, y + i, 2, 1, '#1f4fbf'); rect(c, x + w - 2 - i, y + i, 2, 1, '#1f4fbf'); }
      rect(c, x + 3, y, w - 6, 1, '#1f4fbf');
      break;
    case 'happi':
      rect(c, x, y, w, h, '#2245a8');
      rect(c, x + w - 3, y, 2, h, '#fff');
      rect(c, x, y + h - 3, w, 1, '#fff');
      break;
  }
}

function hairCap(c, L) {
  const hc = L.hair || '#2a1a10';
  switch (L.hairStyle) {
    case 'short': rect(c, -4, -32, 8, 3, hc); rect(c, -4, -29, 3, 3, hc); break;
    case 'long': rect(c, -4, -33, 9, 4, hc); rect(c, -5, -30, 4, 9, hc); break;
    case 'curly':
      rect(c, -5, -33, 10, 4, hc); rect(c, -4, -34, 2, 1, hc); rect(c, 0, -34, 3, 1, hc);
      rect(c, -5, -29, 3, 4, hc); break;
    case 'buzz': rect(c, -4, -32, 8, 2, hc); rect(c, -4, -30, 2, 2, hc); break;
    case 'spiky':
      rect(c, -4, -32, 8, 3, hc); rect(c, -3, -34, 1, 2, hc); rect(c, 0, -35, 1, 3, hc); rect(c, 3, -34, 1, 2, hc);
      rect(c, -4, -29, 3, 3, hc); break;
    case 'topknot': rect(c, -4, -32, 8, 2, hc); rect(c, -4, -30, 2, 3, hc); rect(c, -2, -35, 3, 3, hc); break;
    case 'ponytail': rect(c, -4, -32, 8, 3, hc); rect(c, -4, -29, 3, 3, hc); rect(c, -7, -30, 3, 6, hc); break;
    case 'side': rect(c, -4, -32, 9, 2, hc); rect(c, 1, -31, 4, 1, hc); rect(c, -4, -30, 3, 3, hc); break;
    case 'afro':
      rect(c, -6, -36, 12, 6, hc); rect(c, -5, -37, 10, 1, hc); rect(c, -7, -34, 2, 8, hc); rect(c, -5, -31, 3, 7, hc);
      rect(c, 4, -33, 2, 3, hc); rect(c, -4, -37, 1, 1, '#000'); rect(c, 1, -38, 2, 1, hc); break;
    case 'receding': rect(c, -4, -31, 5, 2, hc); rect(c, -4, -29, 3, 3, hc); rect(c, -3, -32, 4, 1, hc); break;
    case 'longStraight':
      rect(c, -5, -33, 10, 3, hc); rect(c, 3, -31, 2, 2, hc); rect(c, -6, -31, 5, 13, hc); rect(c, -6, -18, 4, 2, hc); rect(c, 4, -29, 1, 6, hc);
      rect(c, -3, -33, 4, 1, shade(hc, 1.6)); break;
    case 'mullet':
      rect(c, -4, -33, 9, 3, hc); rect(c, 3, -31, 2, 1, hc);
      rect(c, -5, -31, 3, 5, hc); rect(c, -5, -26, 2, 2, hc); rect(c, -4, -33, 3, 1, shade(hc, 1.25)); break;
    case 'slick':
      rect(c, -5, -33, 10, 3, hc); rect(c, -5, -30, 3, 4, hc); rect(c, -6, -31, 2, 3, hc);
      rect(c, -3, -33, 6, 1, shade(hc, 1.15)); break;
    case 'twotone':
      rect(c, -4, -32, 8, 2, L.hair2 || hc); rect(c, -4, -30, 3, 3, L.hair2 || hc);
      rect(c, -3, -33, 6, 2, hc); rect(c, 1, -34, 3, 1, hc); rect(c, 3, -32, 2, 1, hc); break;
    case 'bald': rect(c, -4, -30, 1, 2, shade(L.skin, 0.8)); break;
  }
}

function hat(c, L) {
  const hc = L.hatCol || '#fff';
  switch (L.hat) {
    case 'visor':
      rect(c, -4, -34, 8, 3, '#f4f4f4'); rect(c, -4, -32, 8, 1, '#d8d8d8');
      rect(c, 3, -32, 6, 1, '#f4f4f4'); rect(c, 4, -31, 5, 1, '#bbb');
      break;
    case 'cap':
      rect(c, -4, -34, 8, 3, hc); rect(c, 3, -32, 6, 1, hc); rect(c, 4, -31, 5, 1, shade(hc, 0.6)); break;
    case 'busCap':
      rect(c, -5, -35, 10, 3, '#24457a'); rect(c, -4, -32, 9, 1, '#111'); rect(c, 4, -32, 4, 1, '#111');
      rect(c, 0, -34, 2, 1, '#f5c400'); break;
    case 'helmet':
      rect(c, -5, -35, 10, 10, hc); rect(c, -4, -36, 8, 1, hc);
      rect(c, 1, -31, 5, 4, '#1a1a22'); rect(c, 2, -31, 2, 1, '#6a7cff'); break;
    case 'bike':
      rect(c, -5, -35, 10, 3, hc); rect(c, -3, -36, 6, 1, hc); rect(c, -2, -35, 1, 2, '#111'); rect(c, 2, -35, 1, 2, '#111'); break;
    case 'capBack':
      rect(c, -4, -34, 8, 3, hc); rect(c, -9, -32, 6, 1, hc); rect(c, -9, -31, 5, 1, shade(hc, 0.6)); rect(c, 0, -33, 3, 1, shade(hc, 1.3)); break;
    case 'piluso':
      rect(c, -5, -35, 10, 4, '#fff'); rect(c, -7, -32, 14, 2, '#fff'); rect(c, -7, -31, 14, 1, '#ccc'); rect(c, -5, -33, 10, 1, '#5b2a8c'); break;
    case 'beanie': rect(c, -5, -35, 10, 5, hc); rect(c, -5, -31, 10, 1, shade(hc, 0.7)); break;
    case 'headband': rect(c, -4, -31, 8, 1, hc); rect(c, -6, -31, 2, 3, hc); break;
  }
}

// pose: idle walk p1 p2 p3 jump kick hurt special wave dance ride throw charge
function paintPerson(c, L, pose, f) {
  const skin = L.skin || '#e8b58c';
  const shirtArm = L.shirt === 'sumo' ? skin : (L.sleeveCol || ({ velez: '#f4f4f4', boca: '#1a3fa8', river: '#f4f4f4', riverAlt: '#6a1a2c', banfield: '#f4f4f4', rojo: '#d3141b', rayasBW: '#f4f4f4', sanfrecce: '#5b2a8c', suitDark: '#1f2a4e', suitCeleste: '#bcd9f0', bus: '#8fc3e8', gakuran: '#16161e', orange: '#ff7a00', happi: '#2245a8' }[L.shirt] || L.shirtCol || '#ddd'));
  const armSkinSplit = L.longSleeve ? 0.85 : 0.45;
  const pants = L.pants || '#2e3f6b', shoes = L.shoes || '#222';
  const bw = L.belly ? 14 : 10, bx = -bw / 2;
  const legW = L.belly ? 4 : 3;

  // ---- piernas ----
  let fl = 0, bl = 0, fLift = 0, bLift = 0;
  if (pose === 'walk') { const ph = [0, 1, 0, -1][f & 3]; fl = ph * 2; bl = -ph * 2; fLift = ph > 0 ? 1 : 0; bLift = ph < 0 ? 1 : 0; }
  if (pose === 'special') { fl = 3; bl = -3; }
  if (pose === 'p2' || pose === 'throw') { fl = 2; bl = -2; }
  const legs = () => {
    if (pose === 'jump') {
      rect(c, -3 + 1, -11, legW, 6, pants); rect(c, 1 + 1, -12, legW, 6, pants);
      rect(c, -3 + 1, -6, legW + 1, 2, shoes); rect(c, 1 + 1, -7, legW + 1, 2, shoes);
      return;
    }
    if (pose === 'kick') {
      rect(c, -4, -11, legW, 7, shade(pants, 0.8)); rect(c, -4, -5, legW + 1, 2, shoes);
      rect(c, 0, -12, 13, 3, pants); rect(c, 12, -13, 3, 4, shoes);
      return;
    }
    if (pose === 'ride') {
      rect(c, -3, -12, 9, 3, pants); rect(c, 4, -12, 3, 8, pants); rect(c, 4, -5, 4, 2, shoes);
      return;
    }
    // pierna de atrás
    const blx = -legW + bl - (L.belly ? 1 : 0);
    rect(c, blx, -12, legW, 10 - bLift, shade(pants, 0.82));
    rect(c, blx, -2 - bLift, legW + 1, 2, shoes);
    // pierna de adelante
    const flx = fl + (L.belly ? 1 : 0);
    rect(c, flx, -12, legW, 10 - fLift, pants);
    if (L.shorts) { rect(c, blx, -7, legW, 5 - bLift, shade(skin, 0.85)); rect(c, flx, -7, legW, 5 - fLift, skin); }
    if (L.socks) { rect(c, blx, -7, legW, 5 - bLift, shade(L.socks, 0.8)); rect(c, flx, -7, legW, 5 - fLift, L.socks); rect(c, flx, -7, legW, 1, '#111'); }
    rect(c, flx, -2 - fLift, legW + 1, 2, shoes);
  };

  // ---- brazos ----
  const sh = { x: 2, y: -21 }; // hombro delantero
  const shB = { x: -2, y: -21 };
  let armF = [sh.x + 1, -13], armB = [shB.x - 1, -13];
  if (pose === 'walk') { const ph = [0, 1, 0, -1][f & 3]; armF = [sh.x - ph * 2, -13]; armB = [shB.x + ph * 2, -13]; }
  if (pose === 'p1') armF = [14, -20];
  if (pose === 'p2') { armB = [14, -19]; armF = [4, -16]; }
  if (pose === 'p3') armF = [10, -31];
  if (pose === 'jump') { armF = [6, -27]; armB = [-6, -26]; }
  if (pose === 'kick') { armF = [-1, -27]; armB = [-8, -19]; }
  if (pose === 'hurt') { armF = [6, -29]; armB = [-8, -28]; }
  if (pose === 'special') { armF = [14, -22]; armB = [-14, -22]; }
  if (pose === 'wave') { armF = [7, -32 + (f & 1) * 2]; armB = [-3, -13]; }
  if (pose === 'dance') { armF = (f & 2) ? [6, -31] : [9, -18]; armB = (f & 2) ? [-9, -18] : [-6, -31]; }
  if (pose === 'ride') { armF = [10, -18]; armB = [8, -17]; }
  if (pose === 'throw') { armF = f ? [14, -24] : [-8, -30]; }
  if (pose === 'charge') { armF = [10, -16]; armB = [8, -15]; }

  const armDark = shade(shirtArm, 0.8), skinDark = shade(skin, 0.85);
  const hurtShift = pose === 'hurt' ? -2 : 0;
  const lean = (pose === 'p2' || pose === 'charge') ? 1 : 0;

  // dibujar
  limb(c, shB.x + hurtShift, shB.y, armB[0], armB[1], armDark, skinDark, armSkinSplit);
  rect(c, armB[0] - 1, armB[1] - 1, 3, 3, skinDark);
  legs();
  // torso
  const ty = -23;
  drawShirt(c, L, bx + hurtShift + lean, ty, bw, 11);
  if (L.belt) rect(c, bx + hurtShift + lean, -13, bw, 1, L.belt);
  // cabeza
  c.save(); c.translate(hurtShift + lean, 0);
  if (L.bigHead) { rect(c, -5, -34, 11, 12, skin); rect(c, -6, -29, 1, 3, shade(skin, 0.85)); rect(c, -2, -34, 4, 1, shade(skin, 1.12)); rect(c, 4, -24, 2, 1, shade(skin, 0.8)); }
  rect(c, -4, -31, 8, 8, skin);
  rect(c, -1, -28, 1, 2, skinDark);
  rect(c, 4, -27, 1, 1, skin);
  if (L.stubble) { rect(c, -1, -26, 6, 3, L.stubble); rect(c, -2, -27, 1, 3, L.stubble); }
  if (L.beard) { rect(c, -1, -26, 6, 3, L.beard); rect(c, 2, -25, 2, 1, skin); }
  if (L.mustache) rect(c, 1, -25, 4, 1, L.mustache);
  hairCap(c, L);
  if (pose === 'hurt') { rect(c, 1, -29, 2, 1, '#111'); rect(c, 2, -28, 1, 1, '#111'); }
  else if (L.specs) { rect(c, 0, -30, 5, 1, 'rgba(30,20,20,0.45)'); rect(c, 0, -29, 1, 1, L.specs); rect(c, 4, -29, 1, 1, L.specs); rect(c, 1, -29, 3, 1, '#e4f2fb'); rect(c, 2, -29, 1, 1, '#141018'); rect(c, -1, -29, 1, 1, L.specs); }
  else if (L.glasses) { rect(c, 0, -29, 5, 2, L.glasses); rect(c, -1, -29, 1, 1, L.glasses); }
  else rect(c, 2, -29, 1, 2, '#141018');
  if (pose === 'p1' || pose === 'p2' || pose === 'p3' || pose === 'special') rect(c, 3, -25, 2, 1, '#6b2020');
  hat(c, L);
  c.restore();
  // brazo delantero
  limb(c, sh.x + hurtShift + lean, sh.y, armF[0], armF[1], shirtArm, skin, armSkinSplit);
  rect(c, armF[0] - 1, armF[1] - 1, 3 + (pose === 'p1' ? 1 : 0), 3, skin);
}

function drawPerson(ctx, L, pose, f, sx, sy, face, scale, opts = {}) {
  pcx.clearRect(0, 0, 64, 64);
  pcx.save(); pcx.translate(PFX, PFY);
  paintPerson(pcx, L, pose === 'down' ? 'hurt' : pose, f);
  pcx.restore();
  if (opts.tint) {
    pcx.globalCompositeOperation = 'source-atop';
    pcx.fillStyle = opts.tint; pcx.fillRect(0, 0, 64, 64);
    pcx.globalCompositeOperation = 'source-over';
  }
  ctx.save();
  ctx.translate(Math.round(sx), Math.round(sy));
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  ctx.scale(face * scale, scale * (L.h || 1));
  if (pose === 'down') { ctx.translate(0, -4); ctx.rotate(-Math.PI / 2); }
  ctx.drawImage(PC, -PFX, -PFY);
  ctx.restore();
}

function shadow(ctx, x, y, w = 12) {
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath(); ctx.ellipse(Math.round(x), Math.round(y), w, 3, 0, 0, Math.PI * 2); ctx.fill();
}

// ---------- comida / items ----------
function drawItem(ctx, type, x, y, t) {
  const b = Math.round(Math.sin(t / 10) * 1.5);
  x = Math.round(x); y = Math.round(y) - 4 + b;
  shadow(ctx, x, y + 4 - b, 6);
  switch (type) {
    case 'chori':
      rect(ctx, x - 7, y - 4, 14, 5, '#e8c27a'); rect(ctx, x - 6, y - 5, 12, 2, '#a3301f'); rect(ctx, x - 5, y - 3, 10, 1, '#2f8a2f'); break;
    case 'milanesa':
      rect(ctx, x - 8, y - 6, 16, 7, '#f0d79a'); rect(ctx, x - 8, y - 4, 16, 2, '#b8742a'); rect(ctx, x - 7, y - 3, 14, 1, '#2f8a2f'); rect(ctx, x - 6, y - 2, 12, 1, '#d42'); break;
    case 'sushi':
      rect(ctx, x - 6, y - 3, 12, 4, '#fafafa'); rect(ctx, x - 7, y - 6, 14, 3, '#ff7b5a'); rect(ctx, x - 1, y - 5, 2, 6, '#1a3a1a'); break;
    case 'ramen':
      rect(ctx, x - 7, y - 4, 14, 6, '#c22'); rect(ctx, x - 6, y - 6, 12, 2, '#f2d27a'); rect(ctx, x + 2, y - 10, 1, 6, '#c8a060'); rect(ctx, x + 4, y - 10, 1, 6, '#c8a060'); break;
    case 'stroop':
      rect(ctx, x - 6, y - 5, 12, 6, '#c98a3a'); for (let i = 0; i < 3; i++) rect(ctx, x - 5 + i * 4, y - 5, 1, 6, '#9a5a1a'); rect(ctx, x - 6, y - 3, 12, 1, '#7a3a0a'); break;
    case 'empanada':
      ctx.fillStyle = '#e0a84a'; ctx.beginPath(); ctx.arc(x, y, 7, Math.PI, 0); ctx.fill();
      for (let i = -5; i <= 5; i += 2) rect(ctx, x + i, y - 1, 1, 1, '#a0601a'); break;
    case 'picada':
      ctx.fillStyle = '#9a6a3a'; ctx.beginPath(); ctx.ellipse(x, y - 2, 11, 5, 0, 0, 7); ctx.fill();
      ctx.fillStyle = '#c8924a'; ctx.beginPath(); ctx.ellipse(x, y - 3, 10, 4, 0, 0, 7); ctx.fill();
      for (let i = 0; i < 4; i++) { rect(ctx, x - 9 + i * 2, y - 4 + (i & 1), 2, 2, '#b8323a'); rect(ctx, x + 3 + i * 2, y - 5 + (i & 1), 2, 2, '#f2d36a'); }
      rect(ctx, x - 2, y - 6, 4, 3, '#e89aa0'); rect(ctx, x - 1, y - 5, 2, 1, '#c86a74');
      rect(ctx, x - 5, y - 2, 1, 1, '#2a3a8a'); rect(ctx, x + 4, y - 1, 1, 1, '#2a3a8a'); rect(ctx, x + 1, y - 2, 2, 1, '#f4f0e0'); break;
    case 'pizza':
      ctx.fillStyle = '#e8b04a'; ctx.beginPath(); ctx.moveTo(x - 7, y - 4); ctx.lineTo(x + 7, y - 4); ctx.lineTo(x, y + 3); ctx.fill();
      rect(ctx, x - 7, y - 6, 14, 2, '#c07a2a'); rect(ctx, x - 3, y - 3, 2, 2, '#c22'); rect(ctx, x + 1, y - 2, 2, 2, '#c22'); rect(ctx, x - 1, y, 2, 1, '#2a8a2a'); break;
    case 'mate':
      rect(ctx, x - 4, y - 7, 8, 8, '#6b3e1f'); rect(ctx, x - 3, y - 8, 6, 2, '#4caf50'); rect(ctx, x + 1, y - 13, 1, 6, '#ccc'); break;
    case 'alfajor':
      rect(ctx, x - 6, y - 5, 12, 6, '#3b2111'); rect(ctx, x - 6, y - 3, 12, 1, '#f2e4c4'); break;
  }
}

// ---------- objetos rompibles ----------
function drawProp(ctx, type, x, y, broken) {
  x = Math.round(x); y = Math.round(y);
  shadow(ctx, x, y, 10);
  if (broken) {
    rect(ctx, x - 9, y - 3, 6, 3, '#555'); rect(ctx, x + 2, y - 2, 7, 2, '#666'); return;
  }
  switch (type) {
    case 'tacho':
      rect(ctx, x - 7, y - 18, 14, 18, '#6f7a80'); for (let i = -6; i < 7; i += 3) rect(ctx, x + i, y - 17, 1, 16, '#59636a');
      rect(ctx, x - 8, y - 20, 16, 3, '#8b969c'); rect(ctx, x - 2, y - 22, 4, 2, '#555'); break;
    case 'barril':
      rect(ctx, x - 7, y - 20, 14, 20, '#9a5b2a'); rect(ctx, x - 7, y - 16, 14, 2, '#444'); rect(ctx, x - 7, y - 6, 14, 2, '#444'); rect(ctx, x - 5, y - 20, 2, 20, '#b06a33'); break;
    case 'caja':
      rect(ctx, x - 9, y - 16, 18, 16, '#c8964a'); rect(ctx, x - 9, y - 16, 18, 2, '#a87a36'); rect(ctx, x - 1, y - 16, 2, 16, '#a87a36'); break;
    case 'maceta':
      rect(ctx, x - 6, y - 9, 12, 9, '#b5562c'); for (let i = -4; i <= 4; i += 4) { rect(ctx, x + i, y - 16, 1, 7, '#2f8a2f'); rect(ctx, x + i - 1, y - 19, 3, 3, ['#e23', '#fc0', '#f6a'][(i + 4) / 4]); } break;
    case 'expendedora':
      rect(ctx, x - 9, y - 26, 18, 26, '#d22'); rect(ctx, x - 7, y - 24, 14, 12, '#cfe8ff');
      for (let i = 0; i < 3; i++) rect(ctx, x - 6 + i * 4, y - 22, 3, 6, ['#38f', '#3c3', '#fa0'][i]); rect(ctx, x - 6, y - 8, 12, 3, '#111'); break;
  }
}

// ---------- proyectiles ----------
function drawProj(ctx, p, camX) {
  const x = Math.round(p.x - camX), y = Math.round(p.y - p.z);
  shadow(ctx, p.x - camX, p.y, 5);
  ctx.save(); ctx.translate(x, y); ctx.rotate(p.t * 0.3 * Math.sign(p.vx || 1));
  switch (p.type) {
    case 'boleto': rect(ctx, -5, -3, 10, 6, '#f4e9a8'); rect(ctx, -4, -1, 8, 1, '#a33'); break;
    case 'moneda': ctx.fillStyle = '#f5c400'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill(); rect(ctx, -1, -2, 2, 4, '#c89200'); break;
    case 'casco': rect(ctx, -6, -5, 12, 9, '#222'); rect(ctx, -1, -2, 6, 3, '#6a7cff'); break;
    case 'sal': for (let i = 0; i < 6; i++) rect(ctx, Math.cos(i) * 5, Math.sin(i * 2) * 4, 2, 2, '#fff'); break;
    case 'botella': rect(ctx, -5, -2, 10, 4, '#2a7a3a'); rect(ctx, 5, -1, 3, 2, '#2a7a3a'); break;
    case 'yerba': rect(ctx, -5, -7, 10, 13, '#e8e0c0'); rect(ctx, -5, -3, 10, 5, '#2e7d32'); rect(ctx, -3, -6, 6, 2, '#c62828'); break;
    case 'fajo': rect(ctx, -7, -3, 14, 6, '#5c9a4a'); rect(ctx, -7, -1, 14, 2, '#c9a227'); rect(ctx, -2, -3, 4, 6, '#3d6e30'); break;
    case 'pelota': ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill(); rect(ctx, -1, -1, 3, 3, '#111'); rect(ctx, -4, -3, 2, 2, '#111'); rect(ctx, 2, 2, 2, 2, '#111'); break;
    case 'bufanda': rect(ctx, -8, -2, 16, 4, '#5b2a8c'); rect(ctx, -4, -2, 2, 4, '#fff'); rect(ctx, 2, -2, 2, 4, '#fff'); break;
    case 'asfalto': rect(ctx, -7, -5, 14, 9, '#3b3b40'); rect(ctx, -7, -5, 14, 2, '#555'); rect(ctx, -2, -1, 6, 1, '#f5c400'); break;
    case 'baldosa': rect(ctx, -7, -6, 13, 12, '#b9b2a3'); for (let i = -5; i < 6; i += 3) for (let j = -4; j < 6; j += 3) rect(ctx, i, j, 1, 1, '#8a8476'); break;
    case 'contenedor': rect(ctx, -11, -9, 22, 16, '#2e7d32'); rect(ctx, -12, -10, 24, 3, '#1b5e20'); rect(ctx, -9, 7, 3, 2, '#111'); rect(ctx, 6, 7, 3, 2, '#111'); rect(ctx, -4, -4, 8, 2, '#fff'); break;
    case 'poste': rect(ctx, -22, -1, 40, 3, '#3a3a3a'); rect(ctx, 16, -4, 7, 7, '#222'); rect(ctx, 17, -3, 5, 5, '#ffe66b'); break;
    case 'copa': rect(ctx, -5, -7, 10, 6, '#f5c400'); rect(ctx, -7, -6, 2, 3, '#f5c400'); rect(ctx, 5, -6, 2, 3, '#f5c400'); rect(ctx, -1, -1, 2, 4, '#d4a000'); rect(ctx, -4, 3, 8, 3, '#7a4a1a'); break;
    case 'medalla': rect(ctx, -3, -8, 2, 5, '#74b9e8'); rect(ctx, 1, -8, 2, 5, '#fff'); ctx.fillStyle = '#f5c400'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill(); rect(ctx, -1, -1, 2, 2, '#c89200'); break;
    case 'trofeo': rect(ctx, -3, -10, 6, 8, '#e8c840'); rect(ctx, -1, -13, 2, 3, '#e8c840'); ctx.fillStyle = '#e8c840'; ctx.beginPath(); ctx.arc(0, -13, 3, 0, 7); ctx.fill(); rect(ctx, -5, -2, 10, 5, '#333'); rect(ctx, -3, 0, 6, 1, '#f5c400'); break;
    case 'globo': ctx.rotate(-p.t * 0.3 * Math.sign(p.vx || 1)); ctx.fillStyle = '#ffd500'; ctx.beginPath(); ctx.ellipse(0, -4 + Math.sin(p.t / 6) * 2, 5, 6, 0, 0, 7); ctx.fill(); rect(ctx, -1, -6, 1, 2, '#fff8b0'); rect(ctx, 0, 2, 1, 6, '#eee'); break;
    case 'factura': rect(ctx, -5, -6, 10, 12, '#fff'); rect(ctx, -4, -4, 8, 1, '#c22'); rect(ctx, -4, -1, 6, 1, '#999'); rect(ctx, -4, 1, 7, 1, '#999'); rect(ctx, -4, 3, 4, 1, '#c22'); break;
    case 'pizza': ctx.fillStyle = '#e8b04a'; ctx.beginPath(); ctx.moveTo(-7, -4); ctx.lineTo(7, -4); ctx.lineTo(0, 7); ctx.fill(); rect(ctx, -7, -5, 14, 2, '#c07a2a'); rect(ctx, -3, -2, 2, 2, '#c22'); rect(ctx, 1, 0, 2, 2, '#c22'); rect(ctx, -1, 2, 2, 1, '#2a8a2a'); break;
    case 'adoquin': rect(ctx, -6, -4, 12, 8, '#6e6862'); rect(ctx, -6, -4, 12, 2, '#8a847c'); rect(ctx, -2, 0, 3, 1, '#4e4a46'); break;
    case 'ola': ctx.rotate(-p.t * 0.3 * Math.sign(p.vx || 1)); rect(ctx, -6, -8, 12, 8, 'rgba(120,200,255,0.8)'); rect(ctx, -4, -10, 8, 2, '#fff'); break;
  }
  ctx.restore();
}

// ---------- puesto CASEUS (quesos & fiambres) con Ana ----------
const ANA_LOOK = { skin: '#c99068', hair: '#141010', hairStyle: 'longStraight', shirt: 'velez', pants: '#f2efe6', shoes: '#222' };
function drawCaseus(ctx, x, y, t, near) {
  x = Math.round(x); y = Math.round(y);
  const L = x - 48, R = x + 48;
  // postes
  rect(ctx, L, y - 76, 3, 76, '#5a3a22'); rect(ctx, R - 3, y - 76, 3, 76, '#5a3a22');
  // fondo del puesto con estantes de quesos
  rect(ctx, L + 3, y - 64, 90, 46, '#6b4a2e');
  for (let k = 0; k < 3; k++) rect(ctx, L + 6, y - 50 + k * 12, 84, 1, '#4e3420');
  for (let k = 0; k < 7; k++) { if (k === 3) continue; const cy = y - 55 + (k % 2) * 12; rect(ctx, L + 8 + k * 12, cy, 8, 5, k % 3 ? '#f2d36a' : '#e8c048'); rect(ctx, L + 10 + k * 12, cy + 1, 1, 1, '#c89a20'); }
  // Ana atrás del mostrador
  drawAnaFront(ctx, x + 2, y - 2, 1.3, near, t);
  // toldo a rayas
  for (let k = 0; k < 9; k++) {
    rect(ctx, L - 2 + k * 11, y - 78, 11, 8, k & 1 ? '#1c1c1c' : '#f3e6b0');
    ctx.fillStyle = k & 1 ? '#1c1c1c' : '#f3e6b0'; ctx.beginPath(); ctx.arc(L + 3.5 + k * 11, y - 70, 5.5, 0, Math.PI); ctx.fill();
  }
  // salames colgando a los costados
  for (const k of [0, 1, 4, 5]) {
    const sx = L + 6 + k * 16, sw = Math.round(Math.sin(t / 25 + k) * 1);
    rect(ctx, sx + sw, y - 70, 1, 4, '#ddd'); rect(ctx, sx - 1 + sw, y - 66, 4, 10, '#8a2a2a'); rect(ctx, sx + sw, y - 65, 1, 6, '#c86060'); rect(ctx, sx + sw, y - 56, 2, 1, '#5a1a1a');
  }
  // cartel con logo
  const sy = y - 102;
  rect(ctx, x - 40, sy, 80, 24, '#1c1c1c'); rect(ctx, x - 39, sy + 1, 78, 22, '#f3e6b0');
  txt(ctx, 'QUESOS & FIAMBRES', x, sy + 3, '#1c1c1c', 3, 'center', null);
  txt(ctx, 'CASEUS', x, sy + 8, '#1c1c1c', 8, 'center', null);
  rect(ctx, x - 30, sy + 17, 60, 1, '#1c1c1c');
  txt(ctx, 'DESDE 2021', x, sy + 19, '#5a4a2a', 2, 'center', null);
  for (const [cx, cy] of [[x - 35, sy + 5], [x + 34, sy + 5], [x - 35, sy + 17], [x + 34, sy + 17]]) { rect(ctx, cx, cy - 1, 1, 3, '#1c1c1c'); rect(ctx, cx - 1, cy, 3, 1, '#1c1c1c'); }
  rect(ctx, x - 30, sy + 24, 2, 2, '#5a3a22'); rect(ctx, x + 28, sy + 24, 2, 2, '#5a3a22');
  // mostrador
  rect(ctx, L - 2, y - 20, 100, 4, '#e2c68e'); rect(ctx, L, y - 16, 96, 16, '#8a5a34');
  for (let k = 0; k < 6; k++) rect(ctx, L + 2 + k * 16, y - 14, 1, 12, '#6e4426');
  rect(ctx, x - 26, y - 12, 52, 8, '#f3e6b0'); txt(ctx, 'PICADAS', x, y - 10, '#8a2a2a', 4, 'center', null);
  // productos sobre el mostrador
  ctx.fillStyle = '#f2d36a'; ctx.beginPath(); ctx.moveTo(L + 4, y - 20); ctx.lineTo(L + 18, y - 20); ctx.lineTo(L + 18, y - 28); ctx.fill();
  rect(ctx, L + 12, y - 23, 2, 2, '#c89a20');
  ctx.fillStyle = '#e8c048'; ctx.beginPath(); ctx.ellipse(R - 14, y - 23, 8, 3, 0, 0, 7); ctx.fill(); rect(ctx, R - 22, y - 23, 16, 3, '#d8b038');
  drawItem(ctx, 'picada', x - 24, y - 16, 0);
}

// Ana de frente (vista frontal, camiseta de Vélez con la V azul)
function drawAnaFront(ctx, sx, sy, scale, wave, t) {
  const c = pcx; c.clearRect(0, 0, 64, 64); c.save(); c.translate(PFX, PFY);
  const skin = '#c99068', hair = '#141010', V = '#1f4fbf';
  const up = wave && ((t >> 3) & 1);
  // pelo largo detrás
  rect(c, -6, -33, 12, 18, hair);
  // piernas (pantalón blanco)
  rect(c, -4, -12, 3, 10, '#ece8dc'); rect(c, 1, -12, 3, 10, '#f2efe6'); rect(c, -4, -2, 3, 2, '#222'); rect(c, 1, -2, 3, 2, '#222');
  // torso camiseta blanca con V azul
  rect(c, -5, -23, 10, 11, '#f4f4f4');
  for (let i = 0; i < 5; i++) { rect(c, -5 + i, -23 + i, 2, 1, V); rect(c, 3 - i, -23 + i, 2, 1, V); }
  rect(c, -2, -23, 4, 1, skin);
  rect(c, -5, -13, 10, 1, '#dcdcdc');
  // brazos
  rect(c, -8, -22, 3, 4, '#f4f4f4'); rect(c, -8, -18, 3, 6, skin);
  if (up) { rect(c, 5, -26, 3, 4, '#f4f4f4'); rect(c, 6, -33, 3, 7, skin); rect(c, 6, -35, 3, 2, skin); }
  else { rect(c, 5, -22, 3, 4, '#f4f4f4'); rect(c, 5, -18, 3, 6, skin); }
  // cabeza de frente
  rect(c, -4, -31, 8, 8, skin); rect(c, -1, -23, 2, 1, skin);
  rect(c, -4, -32, 8, 2, hair); rect(c, -5, -31, 2, 8, hair); rect(c, 3, -31, 2, 8, hair); rect(c, -1, -31, 3, 1, hair);
  rect(c, -2, -28, 1, 2, '#141018'); rect(c, 1, -28, 1, 2, '#141018');
  rect(c, -2, -25, 4, 1, '#8a3a3a'); rect(c, -1, -24, 2, 1, '#f4e8e0');
  rect(c, -3, -26, 1, 1, '#d88a7a'); rect(c, 2, -26, 1, 1, '#d88a7a');
  rect(c, -1, -22, 2, 1, '#d4af37');
  c.restore();
  ctx.save(); ctx.translate(Math.round(sx), Math.round(sy)); ctx.scale(scale, scale); ctx.drawImage(PC, -PFX, -PFY); ctx.restore();
}
