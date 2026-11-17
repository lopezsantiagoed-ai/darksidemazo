// ===== QEP ARCADE — motor del juego =====
'use strict';

const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

const POWS = ['PUM!', 'PAF!', 'ZAS!', 'POW!', 'TOMA!', 'CRACK!'];
const GRAV = 0.28;

let cleared = {};
try { cleared = JSON.parse(localStorage.getItem('qep_cleared') || '{}') || {}; } catch (e) { cleared = {}; }
function saveCleared() { try { localStorage.setItem('qep_cleared', JSON.stringify(cleared)); } catch (e) { } }

// ---------- DIFICULTAD ----------
const DIFFS = [
  { name: 'FACIL', col: '#7dff5a', ehp: 0.8, edmg: 0.7, agg: 0.75, espd: 0.9, engage: 2, extra: 0, bhp: 0.8, proj: 0.9, lives: 5, heal: 1.25, rage: 0.4, score: 0.8 },
  { name: 'NORMAL', col: '#ffe14d', ehp: 1, edmg: 1, agg: 1, espd: 1, engage: 2, extra: 0, bhp: 1, proj: 1, lives: 3, heal: 1, rage: 0.5, score: 1 },
  { name: 'DIFICIL', col: '#ff8a3a', ehp: 1.35, edmg: 1.4, agg: 1.45, espd: 1.15, engage: 3, extra: 1, bhp: 1.4, proj: 1.15, lives: 3, heal: 0.7, rage: 0.6, score: 1.5 },
  { name: 'PESADILLA QEP', col: '#ff3a3a', ehp: 1.7, edmg: 1.8, agg: 1.9, espd: 1.3, engage: 4, extra: 2, bhp: 1.8, proj: 1.3, lives: 2, heal: 0.5, rage: 0.75, score: 2 },
];
let diffIdx = 1;
try { const v = parseInt(localStorage.getItem('qep_diff'), 10); if (v >= 0 && v < DIFFS.length) diffIdx = v; } catch (e) { }
const D = () => DIFFS[diffIdx];
function setDiff(i) { diffIdx = (i + DIFFS.length) % DIFFS.length; try { localStorage.setItem('qep_diff', diffIdx); } catch (e) { } }

const App = { mode: 'title', t: 0, sel: 0, g: null, paused: false, fade: 0, endT: 0 };

// =====================================================================
// ENTIDADES
// =====================================================================
function makeFighter(o) {
  return Object.assign({
    x: 0, y: 180, z: 0, vx: 0, vy: 0, vz: 0, face: 1, hp: 100, maxhp: 100, state: 'idle', st: 0, anim: 0,
    scale: 1, invul: 0, flash: 0, combo: 0, comboT: 0, buf: false, hitList: [], speed: 1.25, team: 0, dead: false,
  }, o);
}

function spawnPlayer(g, idx, heroKey, cpu = false) {
  const H_ = HEROES[heroKey];
  const p = makeFighter({ kind: 'player', idx, heroKey, name: H_.name, look: H_.look, x: g.camX + 40 + idx * 20, y: 170 + idx * 16, z: 90, state: 'jump', vz: 0,
    lives: D().lives, score: 0, invul: 90, speed: 1.4, scale: 1.25 });
  pads[idx].cpu = cpu ? {} : null;
  p.cpu = cpu;
  g.players[idx] = p; g.ents.push(p);
  return p;
}

function enemyLookFor(g, type) {
  const lv = g.lv;
  const set = (g.section === 1 && lv.lateLooks) ? lv.lateLooks : lv.enemyLooks;
  return set[type];
}

function spawnEnemy(g, type, side, lookSet) {
  const s = ENEMY_STATS[type];
  const look = lookSet ? g.lv[lookSet][type] : enemyLookFor(g, type);
  const e = makeFighter({ kind: 'enemy', team: 1, etype: type, look, hp: Math.round(s.hp * D().ehp), maxhp: Math.round(s.hp * D().ehp), speed: s.speed * D().espd * (0.9 + Math.random() * 0.2), dmg: s.dmg, scale: s.scale, score: s.score,
    name: pick(g.lv.names[type]), x: side > 0 ? g.camX + W + 24 : g.camX - 24, y: FLOOR_TOP + 6 + Math.random() * (FLOOR_BOT - FLOOR_TOP - 10), face: -side,
    ai: { cool: 40 + Math.random() * 60, jitter: Math.random() * 30 - 15 } });
  g.ents.push(e);
  return e;
}

function spawnBoss(g) {
  const B = g.lv.boss;
  const b = makeFighter({ kind: 'boss', team: 1, look: B.look, hp: Math.round(B.hp * D().bhp), maxhp: Math.round(B.hp * D().bhp), speed: B.speed * (0.9 + D().espd * 0.1), dmg: B.dmg, scale: B.scale, name: B.name, cfg: B,
    x: g.camX + W + 30, y: 180, face: -1, score: 5000, poise: 3, ai: { cool: 90, entering: true, n: 0 } });
  g.ents.push(b); g.boss = b;
  return b;
}

function addPart(g, x, y, col, n = 6, spd = 2) {
  for (let i = 0; i < n; i++) g.parts.push({ x, y, vx: (Math.random() - 0.5) * spd * 2, vy: -Math.random() * spd * 1.5, life: 18 + Math.random() * 10, col, s: 2 });
}
function addText(g, x, y, text, col = '#ffe14d', size = 8) { g.parts.push({ x, y, vx: 0, vy: -0.5, life: 40, text, col, size }); }

// =====================================================================
// NIVEL
// =====================================================================
function startLevel(i) {
  const lv = LEVELS[i];
  const g = App.g = { lvIdx: i, lv, camX: 0, section: 0, ents: [], players: [], parts: [], waveIdx: 0, waveActive: false, spawnQ: [], t: 0,
    state: 'card', timer: 150, shake: 0, hitstop: 0, dialog: null, boss: null, bossPhase: 0, go: 0, warped: false, npcDone: false, slowmo: 0, lastHit: null, continueT: 0 };
  const carry = App.carry; App.carry = null;
  const p1 = spawnPlayer(g, 0, lv.hero);
  if (carry) { p1.score = carry.score; p1.lives = carry.lives; }
  if (lv.p2Start || (carry && carry.p2 && lv.p2 && !lv.p2Join)) {
    const human = carry && carry.p2 && !carry.p2.cpu;
    const p2 = spawnPlayer(g, 1, lv.p2, !human); p2.x += 10;
    if (carry && carry.p2) { p2.score = carry.p2.score; p2.lives = carry.p2.lives; }
  }
  for (const [x, type] of lv.props) g.ents.push({ kind: 'prop', type, x, y: FLOOR_TOP + 6 + rnd(x) * 30, hp: 1, broken: false });
  if (lv.npc) g.ents.push({ kind: 'npc', x: lv.npc.x, y: FLOOR_TOP + 4, look: lv.npc.look(), face: -1 });
  for (const cx of [lv.caseus, lv.caseus2]) if (cx) g.ents.push({ kind: 'caseus', x: cx, y: FLOOR_TOP + 1, used: false });
  Sound.play(lv.song);
  App.mode = 'game';
}

function sayLines(g, lines, then) {
  g.dialog = { lines, i: 0, ch: 0, then };
}

function camLimit(g) {
  const lv = g.lv, wv = lv.waves[g.waveIdx];
  if (lv.warp && !g.warped && g.waveIdx >= lv.warp.afterWave) return lv.warp.x - W / 2;
  if (wv) return wv.x;
  return lv.len - W;
}

function updateLevel(g) {
  const lv = g.lv;
  // P2
  const p2Open = lv.p2 && (!lv.p2Join || g.p2Ready);
  if (p2Open && !g.players[1]) {
    if (pads[1].hit('a') || pads[1].hit('start') || touchState.p2 === 1) { spawnPlayer(g, 1, lv.p2, false); Sound.sfx('select'); touchState.p2 = 2; }
    else if (keyDown['Digit2'] || touchState.p2 === 3) { spawnPlayer(g, 1, lv.p2, true); Sound.sfx('select'); touchState.p2 = 2; }
  }
  // cámara
  const alive = g.players.filter(p => p && !p.out);
  if (!g.waveActive && !g.bossPhase && alive.length) {
    const ax = alive.reduce((s, p) => s + p.x, 0) / alive.length;
    const target = Math.min(ax - W * 0.42, camLimit(g));
    if (target > g.camX) g.camX += Math.min(2.2, target - g.camX);
  }
  // disparo de oleadas
  const wv = lv.waves[g.waveIdx];
  const portalBlock = lv.warp && !g.warped && g.waveIdx >= lv.warp.afterWave;
  if (!g.waveActive && wv && !portalBlock && g.camX >= wv.x - 0.5) {
    g.waveActive = true;
    g.spawnQ = wv.list.map(s => Object.assign({}, s, { d: s.d + 10 }));
    for (let k = 0; k < D().extra; k++) g.spawnQ.push({ t: pick(['thug', 'fast', 'thug', 'big']), d: 60 + wv.list.length * 40 + k * 50, side: k & 1 ? -1 : 1 });
  }
  if (g.waveActive) {
    for (const s of g.spawnQ) s.d--;
    const ready = g.spawnQ.filter(s => s.d <= 0);
    g.spawnQ = g.spawnQ.filter(s => s.d > 0);
    for (const s of ready) spawnEnemy(g, s.t, s.side);
    const enemies = g.ents.filter(e => e.kind === 'enemy');
    if (!g.spawnQ.length && !enemies.length) {
      g.waveActive = false; g.waveIdx++; g.go = 150;
    }
  }
  // portal / warp
  if (portalBlock && alive.some(p => Math.abs(p.x - lv.warp.x) < 16 && Math.abs(p.y - 160) < 40)) {
    g.state = 'warp'; g.timer = 70; Sound.sfx('portal');
  }
  // NPC
  if (lv.npc && !g.npcDone && alive.some(p => p.x > lv.npc.x - 80)) {
    g.npcDone = true;
    sayLines(g, lv.npc.lines, () => {
      g.ents.push({ kind: 'item', type: lv.npc.gift, x: lv.npc.x - 26, y: FLOOR_TOP + 16, heal: 100, t: 0 });
      Sound.sfx('pickup');
    });
  }
  // puestos CASEUS: Ana regala una picada
  for (const c of g.ents) {
    if (c.kind !== 'caseus' || c.used || g.dialog) continue;
    if (alive.some(p => Math.abs(p.x - c.x) < 36)) {
      c.used = true;
      const hero = HEROES[lv.hero].name;
      const joins = lv.p2Join === 'caseus' && !g.players[1];
      const lines = [['ANA', hero + '! BIENVENIDO A CASEUS: SALAME, QUESOS ARTESANALES Y LAS MEJORES PICADAS.'], ['ANA', 'TOMA, LLEVATE UNA PICADA PARA RECUPERAR FUERZAS!'], [hero, 'GRACIAS ANA! AGUANTE CASEUS!']];
      if (joins) {
        g.ents.push({ kind: 'npc', x: c.x + 60, y: FLOOR_TOP + 6, look: HEROES[lv.p2].look, face: -1, temp: true });
        lines.push(...lv.p2JoinLines);
      }
      sayLines(g, lines, () => {
        g.ents.push({ kind: 'item', type: 'picada', x: c.x - 10, y: FLOOR_TOP + 14, heal: 100, t: 0 });
        Sound.sfx('pickup');
        if (joins) {
          g.ents = g.ents.filter(e => !(e.kind === 'npc' && e.temp));
          g.p2Ready = true;
          const p2 = spawnPlayer(g, 1, lv.p2, true);
          p2.x = c.x + 60; p2.y = FLOOR_TOP + 14; p2.z = 0; p2.state = 'idle'; p2.invul = 60;
          Sound.sfx('select');
        }
      });
    }
  }
  // jefe
  if (!g.bossPhase && !lv.waves[g.waveIdx] && (!lv.warp || g.warped) && g.camX >= lv.len - W - 1) {
    g.bossPhase = 1;
    spawnBoss(g);
    if (lv.p2Auto && !g.players[1]) {
      const p2 = spawnPlayer(g, 1, lv.p2, true);
      p2.x = g.camX + 30; p2.y = FLOOR_TOP + 30; p2.z = 90; p2.state = 'jump'; p2.invul = 120;
      g.pendingP2Lines = lv.p2Auto;
      g.p2Ready = true;
    }
    Sound.play(SONG_BOSS); Sound.sfx('boss');
    g.bossCard = 140;
  }
  if (g.go > 0) g.go--;
  // carteles de zona (recorrido)
  if (lv.zones) {
    g.zoneIdx = g.zoneIdx || 0;
    while (lv.zones[g.zoneIdx] && g.camX + W * 0.5 >= lv.zones[g.zoneIdx][0]) { g.zoneBanner = { text: lv.zones[g.zoneIdx][1], t: 0 }; g.zoneIdx++; }
  }
  if (g.zoneBanner && ++g.zoneBanner.t > 170) g.zoneBanner = null;
  if (g.state === 'play') g.playT = (g.playT || 0) + 1;
}

// =====================================================================
// COMBATE
// =====================================================================
function canBeHit(t) {
  if (t.invul > 0 || t.dead) return false;
  return !['fall', 'down', 'getup', 'dead'].includes(t.state);
}

function damage(g, t, dmg, a, knock) {
  if (!canBeHit(t)) return false;
  if (t.kind === 'boss') {
    if (knock) { t.poise--; if (t.poise > 0) knock = false; else t.poise = 3; }
  }
  if (t.kind === 'player') dmg = Math.max(1, Math.round(dmg * D().edmg));
  t.hp -= dmg; t.flash = 6;
  const hx = t.x, hy = t.y - t.z - 22 * t.scale;
  addPart(g, hx, hy, '#fff', 5, 2); addPart(g, hx, hy, '#ffd23f', 4, 2.5);
  if (Math.random() < 0.35 || knock) addText(g, hx + (Math.random() * 16 - 8), hy - 10, pick(POWS), pick(['#ffe14d', '#ff5a5a', '#5af', '#fff']));
  g.hitstop = knock ? 6 : 3;
  g.shake = Math.max(g.shake, knock ? 4 : 2);
  Sound.sfx(knock ? 'bighit' : 'hit');
  if (a && a.kind === 'player') {
    a.score += 10 + dmg * 5; if (t.kind !== 'prop') g.lastHit = { e: t, time: 160 };
    a.hitCombo = (a.hitComboT > 0 ? a.hitCombo : 0) + 1; a.hitComboT = 75; a.comboPop = 8;
    if (a.hitCombo > (g.maxCombo || 0)) g.maxCombo = a.hitCombo;
    if (a.hitCombo >= 5) a.score += a.hitCombo * 10;
  }
  g.parts.push({ x: hx, y: hy, vx: 0, vy: 0, life: 7, star: knock ? 9 : 6 });
  const dir = a ? Math.sign(t.x - a.x) || a.face : 1;
  if (t.hp <= 0) { t.hp = 0; knock = true; }
  if (knock) {
    t.state = 'fall'; t.vz = 3.2; t.vx = dir * 2.3; t.z = Math.max(t.z, 1); t.vy = 0;
    if (t.kind === 'boss') t.vx = dir * 1.5;
  } else {
    const heavyBusy = t.kind === 'boss' && !['idle', 'walk'].includes(t.state);
    if (!heavyBusy) { t.state = 'hurt'; t.st = t.kind === 'boss' ? 8 : 16; }
    t.x += dir * 2;
  }
  t.face = -dir;
  return true;
}

function hitBox(g, a, reach, dmg, knock, opts = {}) {
  let hit = false;
  const targets = g.ents.filter(e => (e.kind === 'enemy' || e.kind === 'boss' || e.kind === 'player' || e.kind === 'prop') && e !== a);
  for (const t of targets) {
    if (t.kind === 'prop') { if (a.team !== 0 || t.broken) continue; }
    else if (t.team === a.team) continue;
    if (a.hitList.includes(t)) continue;
    const dx = (t.x - a.x) * (opts.around ? Math.sign(t.x - a.x) || 1 : a.face);
    const depth = (t.kind === 'boss' ? 12 : 9) + (a.kind === 'boss' ? 4 : 0);
    if (dx < -6 || dx > reach + (t.kind === 'boss' ? 6 : 0)) continue;
    if (Math.abs(t.y - a.y) > depth) continue;
    if (t.kind !== 'prop' && Math.abs((t.z || 0) - a.z) > 26) continue;
    a.hitList.push(t);
    if (t.kind === 'prop') {
      t.broken = true; Sound.sfx('break'); addPart(g, t.x, t.y - 10, '#a87a36', 10, 2.5);
      const it = Math.random() < 0.7 ? (Math.random() < 0.5 ? g.lv.item : (g.lv.item2 || g.lv.item)) : null;
      if (it) g.ents.push({ kind: 'item', type: it, x: t.x, y: t.y + 2, heal: 35, t: 0 });
      else { g.ents.push({ kind: 'item', type: 'alfajor', x: t.x, y: t.y + 2, heal: 15, t: 0 }); }
      hit = true; continue;
    }
    if (damage(g, t, dmg, a, knock)) hit = true;
  }
  return hit;
}

// =====================================================================
// FÍSICA COMÚN
// =====================================================================
function physics(g, e) {
  if (e.z > 0 || e.vz !== 0) {
    e.vz -= GRAV; e.z += e.vz;
    if (e.z <= 0) {
      e.z = 0; e.vz = 0;
      if (e.state === 'fall') {
        Sound.sfx('land'); g.shake = Math.max(g.shake, 2); addPart(g, e.x, e.y, '#bbb', 5, 1.2);
        if (e.hp <= 0) { e.state = 'dead'; e.st = 70; e.vx = 0; }
        else { e.state = 'down'; e.st = e.kind === 'boss' ? 30 : 40; e.vx = 0; }
      } else if (e.state === 'jump' || e.state === 'jkick') { e.state = 'idle'; e.vx = 0; Sound.sfx('land'); addPart(g, e.x, e.y, 'rgba(200,190,170,0.8)', 3, 0.8); }
      else if (e.state === 'b_slam') { e.landed = true; }
    }
  }
  e.x += e.vx; e.y += e.vy;
  e.y = clamp(e.y, FLOOR_TOP + 2, FLOOR_BOT);
  if (e.kind === 'player') e.x = clamp(e.x, g.camX + 8, g.camX + W - 8);
  else if (e.kind === 'enemy' && e.state !== 'dead') e.x = clamp(e.x, g.camX - 40, g.camX + W + 40);
  else if (e.kind === 'boss' && !e.ai.entering) e.x = clamp(e.x, g.camX + 14, g.camX + W - 14);
}

function commonStates(g, e) {
  switch (e.state) {
    case 'hurt': e.vx *= 0.8; if (--e.st <= 0) e.state = 'idle'; return true;
    case 'fall': return true;
    case 'down': if (--e.st <= 0) { e.state = 'getup'; e.st = 14; } return true;
    case 'getup': if (--e.st <= 0) { e.state = 'idle'; e.invul = e.kind === 'player' ? 50 : 20; } return true;
    case 'dead': e.st--; return true;
  }
  return false;
}

// =====================================================================
// JUGADORES
// =====================================================================
function cpuThink(g, p, padIdx = 1) {
  const c = {};
  const foes = g.ents.filter(e => (e.kind === 'enemy' || e.kind === 'boss') && !e.dead && e.state !== 'dead');
  let tx, ty;
  if (foes.length) {
    foes.sort((a, b) => Math.abs(a.x - p.x) + Math.abs(a.y - p.y) - Math.abs(b.x - p.x) - Math.abs(b.y - p.y));
    const f = foes[0], side = p.x < f.x ? -1 : 1;
    tx = f.x + side * (20 * f.scale); ty = f.y;
    const aligned = Math.abs(p.x - tx) < 6 && Math.abs(p.y - ty) < 4;
    if (aligned) { if (p.x < f.x) c.right = p.face < 0; else c.left = p.face > 0; if ((g.t % 12) < 3) c.a = true; if (p.hp > 30 && foes.filter(e => Math.abs(e.x - p.x) < 30).length >= 3 && g.t % 60 === 0) c.c = true; }
  } else if (padIdx === 1) { const p1 = g.players[0]; tx = p1 ? p1.x - 36 : p.x; ty = p1 ? p1.y + 10 : p.y; }
  else { tx = p.x + 60; ty = 178; }
  if (!c.a) {
    if (tx > p.x + 3) c.right = true; else if (tx < p.x - 3) c.left = true;
    if (ty > p.y + 2) c.down = true; else if (ty < p.y - 2) c.up = true;
  }
  pads[padIdx].cpu = c;
}

function updatePlayer(g, p) {
  const pad = pads[p.idx];
  if (p.invul > 0) p.invul--;
  if (p.flash > 0) p.flash--;
  if (p.comboT > 0) p.comboT--;
  if (p.hitComboT > 0) p.hitComboT--;
  if (p.comboPop > 0) p.comboPop--;
  p.anim++;
  if (p.out) return;
  if (p.state === 'dead') {
    if (--p.st <= 0) {
      if (p.lives > 0) { p.lives--; p.hp = p.maxhp; p.state = 'jump'; p.z = 90; p.vz = 0; p.x = g.camX + 50 + p.idx * 20; p.invul = 150; p.dead = false; }
      else { p.out = true; p.dead = true; }
    }
    return;
  }
  if (commonStates(g, p)) { physics(g, p); return; }

  const mx = (pad.held('right') ? 1 : 0) - (pad.held('left') ? 1 : 0);
  const my = (pad.held('down') ? 1 : 0) - (pad.held('up') ? 1 : 0);

  switch (p.state) {
    case 'idle': case 'walk':
      p.vx = mx * p.speed; p.vy = my * p.speed * 0.7;
      if (mx) p.face = mx;
      p.state = (mx || my) ? 'walk' : 'idle';
      if (pad.hit('a')) {
        p.combo = p.comboT > 0 ? (p.combo + 1) % 3 : 0;
        p.state = 'attack'; p.st = 0; p.atk = ['p1', 'p2', 'p3'][p.combo]; p.hitList = []; p.vx = 0; p.vy = 0; Sound.sfx('whoosh');
      } else if (pad.hit('b')) {
        p.state = 'jump'; p.vz = 4.6; p.z = 0.1; p.vx = mx * 1.6; p.vy = my * 0.6; Sound.sfx('jump');
      } else if (pad.hit('c')) {
        p.state = 'special'; p.st = 0; p.hitList = []; p.vx = 0; p.vy = 0; p.hp = Math.max(1, p.hp - 6); p.invul = Math.max(p.invul, 26); Sound.sfx('special');
      }
      break;
    case 'attack': {
      p.st++;
      const dur = p.atk === 'p3' ? 20 : 13;
      if (p.st === 4) hitBox(g, p, 32, p.atk === 'p3' ? 11 : p.atk === 'p2' ? 7 : 6, p.atk === 'p3');
      if (pad.hit('a') && p.st > 5) p.buf = true;
      if (p.st >= dur) {
        p.comboT = 22;
        if (p.buf) { p.buf = false; p.combo = (p.combo + 1) % 3; p.st = 0; p.atk = ['p1', 'p2', 'p3'][p.combo]; p.hitList = []; Sound.sfx('whoosh'); }
        else p.state = 'idle';
      }
      break;
    }
    case 'jump': case 'jkick':
      if (p.state === 'jump' && pad.hit('a') && p.z > 2) { p.state = 'jkick'; p.hitList = []; Sound.sfx('whoosh'); }
      if (p.state === 'jkick') hitBox(g, p, 30, 12, true);
      break;
    case 'special':
      p.st++;
      if (p.st % 4 === 0) p.face = -p.face;
      if (p.st > 5 && p.st < 18) hitBox(g, p, 40, 14, true, { around: true });
      if (p.st >= 26) { p.state = 'idle'; }
      break;
  }
  physics(g, p);
}

// =====================================================================
// ENEMIGOS
// =====================================================================
function nearestPlayer(g, e) {
  let best = null, bd = 1e9;
  for (const p of g.players) { if (!p || p.out || p.state === 'dead') continue; const d = Math.abs(p.x - e.x) + Math.abs(p.y - e.y) * 2; if (d < bd) { bd = d; best = p; } }
  return best;
}

function updateEnemy(g, e, engaged) {
  if (e.flash > 0) e.flash--;
  if (e.invul > 0) e.invul--;
  e.anim++;
  if (e.state === 'dead') { if (--e.st <= 0) e.remove = true; return; }
  if (commonStates(g, e)) { physics(g, e); return; }
  const tgt = nearestPlayer(g, e);
  const ai = e.ai;
  if (ai.cool > 0) ai.cool -= D().agg;
  if (!tgt) { e.state = 'idle'; e.vx = e.vy = 0; physics(g, e); return; }
  switch (e.state) {
    case 'idle': case 'walk': {
      const side = e.x < tgt.x ? -1 : 1;
      const gx = clamp(engaged ? tgt.x + side * 22 * e.scale : tgt.x + side * (70 + ai.jitter), g.camX + 16, g.camX + W - 16);
      const gy = engaged ? tgt.y : clamp(tgt.y + ai.jitter, FLOOR_TOP + 4, FLOOR_BOT - 2);
      const dx = gx - e.x, dy = gy - e.y;
      e.vx = Math.abs(dx) > 3 ? Math.sign(dx) * e.speed : 0;
      e.vy = Math.abs(dy) > 2 ? Math.sign(dy) * e.speed * 0.7 : 0;
      e.face = e.x < tgt.x ? 1 : -1;
      e.state = (e.vx || e.vy) ? 'walk' : 'idle';
      const dist = Math.abs(tgt.x - e.x);
      if (engaged && ai.cool <= 0 && Math.abs(dx) < 5 && Math.abs(tgt.y - e.y) < 6) {
        e.state = 'eattack'; e.st = 0; e.hitList = []; e.vx = e.vy = 0;
      } else if (e.etype === 'fast' && ai.cool <= 0 && dist > 40 && dist < 80 && Math.abs(tgt.y - e.y) < 6 && Math.random() < 0.02) {
        e.state = 'jkick'; e.vz = 3.8; e.z = 0.1; e.vx = e.face * 2.2; e.vy = 0; e.hitList = []; ai.cool = 90;
      } else if (e.etype === 'big' && ai.cool <= 0 && dist > 50 && dist < 140 && Math.abs(tgt.y - e.y) < 6 && Math.random() < 0.015) {
        e.state = 'echarge'; e.st = 0; e.vx = e.vy = 0; e.hitList = [];
      }
      break;
    }
    case 'eattack':
      e.st++;
      if (e.st === 18) { hitBox(g, e, 28 * e.scale, e.dmg, e.etype === 'big'); Sound.sfx('whoosh'); }
      if (e.st >= 30) { e.state = 'idle'; ai.cool = 50 + Math.random() * 60; }
      break;
    case 'jkick':
      hitBox(g, e, 26, e.dmg + 2, true);
      break;
    case 'echarge':
      e.st++;
      if (e.st === 30) { e.vx = e.face * 3; Sound.sfx('whoosh'); }
      if (e.st > 30) hitBox(g, e, 18, e.dmg, true);
      if (e.st > 75 || (e.st > 30 && (e.x < g.camX + 10 || e.x > g.camX + W - 10))) { e.state = 'idle'; e.vx = 0; ai.cool = 80; }
      break;
  }
  physics(g, e);
}

// =====================================================================
// JEFE
// =====================================================================
function bossThrow(g, b, tgt) {
  const B = b.cfg, type = pick(B.projs);
  const spec = { poste: { spd: 3, dmg: 16, w: 22, knock: true }, contenedor: { spd: 2.2, dmg: 18, w: 14, knock: true }, pelota: { spd: 4.6, dmg: 9, w: 7 },
    trofeo: { spd: 3, dmg: 14, w: 8, knock: true }, copa: { spd: 3.4, dmg: 11, w: 8 }, medalla: { spd: 4, dmg: 8, w: 6 }, yerba: { spd: 3.2, dmg: 11, w: 8 },
    fajo: { spd: 3.8, dmg: 9, w: 8 }, globo: { spd: 2.1, dmg: 8, w: 8 }, mamadera: { spd: 3.6, dmg: 9, w: 7 }, butaca: { spd: 2.8, dmg: 15, w: 11, knock: true }, perro: { spd: 3.4, dmg: 11, w: 10, knock: true }, motosierra: { spd: 3.2, dmg: 14, w: 12, knock: true }, campera: { spd: 3, dmg: 9, w: 10 }, factura: { spd: 3.6, dmg: 10, w: 7 }, asfalto: { spd: 3.3, dmg: 13, w: 9, knock: true }, baldosa: { spd: 3.8, dmg: 10, w: 8 }, bufanda: { spd: 3.4, dmg: 8, w: 9 } }[type] || { spd: 3, dmg: 10, w: 8 };
  g.ents.push({ kind: 'proj', type, x: b.x + b.face * 16, y: b.y, z: type === 'perro' ? 6 : 22 * b.scale * 0.8, vx: b.face * spec.spd * D().proj * (b.hp < b.maxhp * D().rage ? 1.15 : 1), vz: type === 'contenedor' ? 0 : 0, dmg: Math.round(spec.dmg * 0.85), w: spec.w, knock: !!spec.knock, team: 1, t: 0 });
  Sound.sfx('throw');
}

function updateBoss(g, b) {
  if (b.flash > 0) b.flash--;
  if (b.invul > 0) b.invul--;
  b.anim++;
  const ai = b.ai, B = b.cfg, rage = b.hp < b.maxhp * D().rage;
  if (b.state === 'dead') { b.st--; if (b.st <= 0) b.remove = true; return; }
  if (commonStates(g, b)) { physics(g, b); return; }
  const tgt = nearestPlayer(g, b);
  if (ai.entering) {
    b.vx = -1; b.state = 'walk'; b.face = -1;
    if (b.x < g.camX + W - 70) { ai.entering = false; b.vx = 0; b.state = 'idle'; sayLines(g, B.intro.concat(g.pendingP2Lines || [])); g.pendingP2Lines = null; }
    physics(g, b); return;
  }
  if (!tgt) { b.state = 'idle'; b.vx = b.vy = 0; physics(g, b); return; }
  if (ai.cool > 0) ai.cool -= D().agg;
  const spd = b.speed * (rage ? 1.3 : 1);
  switch (b.state) {
    case 'idle': case 'walk': {
      b.face = b.x < tgt.x ? 1 : -1;
      // deambula manteniendo distancia
      const side = b.x < tgt.x ? -1 : 1;
      const gx = tgt.x + side * 64, gy = tgt.y;
      const dx = gx - b.x, dy = gy - b.y;
      b.vx = Math.abs(dx) > 6 ? Math.sign(dx) * spd * 0.7 : 0;
      b.vy = Math.abs(dy) > 3 ? Math.sign(dy) * spd * 0.5 : 0;
      b.state = (b.vx || b.vy) ? 'walk' : 'idle';
      if (ai.cool <= 0) {
        const atk = B.attacks[ai.n++ % B.attacks.length];
        b.atk = atk; b.st = 0; b.hitList = []; b.vx = b.vy = 0;
        b.state = 'b_' + atk;
        b.reps = atk === 'throw' ? (rage ? 2 : 1) : 1;
      }
      break;
    }
    case 'b_combo': { // se acerca y pega
      b.st++;
      const side = b.x < tgt.x ? -1 : 1;
      const gx = tgt.x + side * 20 * b.scale, dx = gx - b.x, dy = tgt.y - b.y;
      if (!b.swing) {
        b.face = b.x < tgt.x ? 1 : -1;
        b.vx = Math.abs(dx) > 4 ? Math.sign(dx) * spd * 1.4 : 0; b.vy = Math.abs(dy) > 2 ? Math.sign(dy) * spd : 0;
        if ((Math.abs(dx) < 6 && Math.abs(dy) < 5) || b.st > 150) { b.swing = 1; b.st2 = 0; b.vx = b.vy = 0; b.hitList = []; }
      } else {
        b.st2++;
        if (b.st2 === 14 || b.st2 === 34) { b.hitList = []; hitBox(g, b, 22 * b.scale, B.dmg, b.st2 === 34); Sound.sfx('whoosh'); }
        if (b.st2 > 50) { b.swing = 0; b.state = 'idle'; ai.cool = rage ? 30 : 60; }
      }
      break;
    }
    case 'b_throw': {
      b.st++;
      b.face = b.x < tgt.x ? 1 : -1;
      if (b.st < 30) { const dy = tgt.y - b.y; b.vy = Math.abs(dy) > 2 ? Math.sign(dy) * spd : 0; }
      else b.vy = 0;
      if (b.st === 42) bossThrow(g, b, tgt);
      if (b.st > 56) { if (--b.reps > 0) b.st = 18; else { b.state = 'idle'; ai.cool = rage ? 35 : 70; } }
      break;
    }
    case 'b_charge': {
      b.st++;
      if (b.st < 36) { b.face = b.x < tgt.x ? 1 : -1; const dy = tgt.y - b.y; b.vy = Math.abs(dy) > 2 ? Math.sign(dy) * spd : 0; }
      if (b.st === 36) { b.vx = b.face * (rage ? 4.6 : 3.8); b.vy = 0; Sound.sfx('whoosh'); }
      if (b.st > 36) {
        hitBox(g, b, 20 * b.scale, B.dmg + 2, true);
        if (b.st % 6 === 0) addPart(g, b.x - b.face * 10, b.y, '#ccc', 2, 1);
        if (b.x <= g.camX + 16 || b.x >= g.camX + W - 16 || b.st > 140) { b.vx = 0; b.state = 'idle'; ai.cool = rage ? 30 : 60; g.shake = 3; }
      }
      break;
    }
    case 'b_slam': {
      b.st++;
      if (b.st === 20) { b.vz = 6; b.z = 0.1; b.vx = (tgt.x - b.x) / 42; b.vy = (tgt.y - b.y) / 42; b.landed = false; Sound.sfx('jump'); }
      if (b.st > 20 && b.landed) {
        b.landed = false; b.vx = b.vy = 0; g.shake = 7; Sound.sfx('bighit');
        addPart(g, b.x, b.y, '#d8d0b0', 16, 3);
        b.hitList = []; hitBox(g, b, 56, B.dmg, true, { around: true });
        b.st = 1000;
      }
      if (b.st > 1030) { b.state = 'idle'; ai.cool = rage ? 30 : 60; }
      break;
    }
    case 'b_dance': { // baile en el balcón: gira y pega alrededor
      b.st++;
      if (b.st === 1) addText(g, b.x, b.y - 75, 'SI SE PUEDE!', '#ffd500');
      const dx = tgt.x - b.x, dy = tgt.y - b.y;
      b.vx = Math.abs(dx) > 8 ? Math.sign(dx) * spd * 0.9 : 0; b.vy = Math.abs(dy) > 3 ? Math.sign(dy) * spd * 0.6 : 0;
      if (b.st % 8 === 0) b.face = -b.face;
      if (b.st % 6 === 0) addPart(g, b.x + (Math.random() - 0.5) * 40, b.y - 60, pick(['#ffd500', '#fff', '#75aadb']), 2, 1.5);
      if (b.st % 14 === 0) { b.hitList = []; hitBox(g, b, 34, 7, b.st % 42 === 0, { around: true }); }
      if (b.st > 120) { b.state = 'idle'; b.vx = b.vy = 0; ai.cool = rage ? 30 : 60; }
      break;
    }
    case 'b_summon': {
      b.st++;
      if (b.st === 20) {
        addText(g, b.x, b.y - 70, B.summonText || 'VAMOS HINCHADA!', '#c9a7ff');
        spawnEnemy(g, 'thug', 1, B.summonLooks); spawnEnemy(g, 'fast', -1, B.summonLooks);
        for (let k = 0; k < (rage ? 4 : 2); k++) g.ents.push({ kind: 'proj', type: B.summonProj || 'bufanda', x: k & 1 ? g.camX - 10 : g.camX + W + 10, y: FLOOR_TOP + 8 + Math.random() * 50, z: 18, vx: (k & 1 ? 1 : -1) * 2.6, dmg: 7, w: 9, team: 1, t: -k * 30 });
      }
      if (b.st > 50) { b.state = 'idle'; ai.cool = 110; }
      break;
    }
  }
  physics(g, b);
}

// =====================================================================
// UPDATE PRINCIPAL
// =====================================================================
function updateGame() {
  const g = App.g;
  g.t++;
  if (g.players[1] && g.players[1].cpu) cpuThink(g, g.players[1]);
  if (App.autopilot && g.players[0]) { cpuThink(g, g.players[0], 0); if (g.dialog || g.state !== 'play') pads[0].cpu.a = (g.t % 6) < 3; }
  for (const p of pads) p.poll();
  if (g.players[1] && g.players[1].cpu && KEYMAP[1].a.concat(KEYMAP[1].start).some(k => keyDown[k]) && !App.p2KeyWas) {
    g.players[1].cpu = false; pads[1].cpu = null; pads[1].poll(); pads[1].prev = pads[1].cur; Sound.sfx('select'); addText(g, g.players[1].x, g.players[1].y - 60, 'P2!', '#ff8080');
  }
  App.p2KeyWas = KEYMAP[1].a.concat(KEYMAP[1].start).some(k => keyDown[k]);

  if (!App.paused && (pads[0].hit('start') || App.autoPause) && g.state === 'play' && !g.dialog) { App.paused = true; App.pauseSel = 0; Sound.sfx('select'); }
  App.autoPause = false;
  if (App.paused) {
    if (pads[0].hit('up') || pads[0].hit('down')) { App.pauseSel ^= 1; Sound.sfx('move'); }
    const ok = pads[0].hit('a') || pads[0].hit('start');
    if ((ok && App.pauseSel === 1) || keyDown['Escape']) { App.paused = false; Sound.play(SONG_TITLE); App.mode = 'select'; }
    else if (ok) { App.paused = false; Sound.sfx('select'); }
    return;
  }

  if (g.state === 'card') { if (--g.timer <= 0 || (pads[0].hit('a') && g.timer < 130)) { g.state = 'play'; g.fadeIn = 30; sayLines(g, g.lv.intro, () => { g.goBanner = 90; Sound.sfx('select'); }); } return; }
  if (g.state === 'warp') {
    g.timer--;
    if (g.timer === 35) {
      g.section = 1; g.warped = true; g.camX = g.lv.warp.toX;
      g.players.forEach((p, i) => { if (p) { p.x = g.camX + 60 + i * 24; p.y = 172 + i * 14; p.z = 40; p.state = 'jump'; p.vz = 0; } });
      g.ents = g.ents.filter(e => e.kind === 'player' || e.kind === 'prop' || e.kind === 'npc' || e.kind === 'caseus');
    }
    if (g.timer <= 0) { g.state = 'play'; if (g.lv.warpLines) sayLines(g, g.lv.warpLines); }
    return;
  }
  if (g.state === 'win') { g.timer--; if (g.timer < 0 && (pads[0].hit('a') || pads[0].hit('start'))) finishLevel(); return; }
  if (g.state === 'over') {
    g.timer--;
    if (pads[0].hit('start') || pads[0].hit('a')) {
      g.players.forEach(p => { if (p && (p.out || !p.cpu)) { p.out = false; p.dead = false; p.lives = 2; p.hp = p.maxhp; p.state = 'jump'; p.z = 90; p.vz = 0; p.invul = 150; p.x = g.camX + 60 + p.idx * 24; p.score = Math.floor(p.score / 2); } });
      g.continues = (g.continues || 0) + 1;
      g.state = 'play';
    } else if (g.timer <= 0) { App.mode = 'select'; Sound.play(SONG_TITLE); }
    return;
  }

  if (g.fadeIn > 0) g.fadeIn--;
  if (g.goBanner > 0) g.goBanner--;
  // diálogo
  if (g.dialog) {
    const d = g.dialog, line = d.lines[d.i];
    if (d.ch < line[1].length) { d.ch += 1; if (d.ch % 3 === 0) Sound.sfx('talk'); }
    if (pads[0].hit('a') || pads[0].hit('start') || pads[0].hit('b')) {
      if (d.ch < line[1].length) d.ch = line[1].length;
      else if (++d.i >= d.lines.length) { const th = d.then; g.dialog = null; if (th) th(); }
      else d.ch = 0;
    }
    return;
  }

  if (g.hitstop > 0) { g.hitstop--; return; }
  if (g.slowmo > 0) { g.slowmo--; if (g.slowmo % 3) return; }

  updateLevel(g);

  // asignar enemigos "comprometidos" (máx 2 por jugador vivo)
  const enemies = g.ents.filter(e => e.kind === 'enemy' && e.state !== 'dead');
  const nAlive = g.players.filter(p => p && !p.out).length || 1;
  enemies.sort((a, b) => { const ta = nearestPlayer(g, a), tb = nearestPlayer(g, b); return (ta ? Math.abs(ta.x - a.x) : 999) - (tb ? Math.abs(tb.x - b.x) : 999); });
  const engagedSet = new Set(enemies.slice(0, D().engage * nAlive));

  for (const e of g.ents) {
    if (e.kind === 'player') updatePlayer(g, e);
    else if (e.kind === 'enemy') updateEnemy(g, e, engagedSet.has(e));
    else if (e.kind === 'boss') updateBoss(g, e);
    else if (e.kind === 'proj') {
      e.t++; if (e.t < 0) continue;
      e.x += e.vx;
      for (const p of g.players) {
        if (!p || p.out || !canBeHit(p)) continue;
        if (Math.abs(p.x - e.x) < e.w && Math.abs(p.y - e.y) < 9 && p.z < 30) { damage(g, p, e.dmg, { x: e.x - Math.sign(e.vx) * 10, face: Math.sign(e.vx), kind: 'proj' }, e.knock || p.hp - e.dmg <= 0); e.remove = true; break; }
      }
      if (e.x < g.camX - 60 || e.x > g.camX + W + 60) e.remove = true;
    } else if (e.kind === 'item') {
      e.t++;
      for (const p of g.players) {
        if (!p || p.out || p.state === 'dead' || p.z > 4) continue;
        if (Math.abs(p.x - e.x) < 12 && Math.abs(p.y - e.y) < 8) {
          p.hp = Math.min(p.maxhp, p.hp + Math.round(e.heal * D().heal)); p.score += 200; e.remove = true; Sound.sfx('pickup');
          addText(g, e.x, e.y - 30, '+' + Math.round(e.heal * D().heal), '#7dff5a'); break;
        }
      }
    }
  }
  // enemigos muertos -> puntaje
  for (const e of g.ents) if ((e.kind === 'enemy' || e.kind === 'boss') && e.state === 'dead' && !e.scored) {
    e.scored = true; e.dead = true;
    const killer = g.players.filter(p => p).sort((a, b) => Math.abs(a.x - e.x) - Math.abs(b.x - e.x))[0];
    if (killer) killer.score += e.score;
    if (e.kind === 'enemy') g.kos = (g.kos || 0) + 1;
    if (e.kind === 'boss') { g.slowmo = 120; Sound.sfx('ko'); Sound.stop(); addText(g, e.x, e.y - 80, 'K.O.!', '#ff5a5a', 16); g.ents.filter(x => x.kind === 'enemy').forEach(x => { x.hp = 0; x.state = 'fall'; x.vz = 3; x.z = 1; }); }
  }
  // jugadores muertos
  for (const p of g.players) if (p && p.state === 'dead' && !p.dead) { p.dead = true; Sound.sfx('ko'); }
  g.ents = g.ents.filter(e => !e.remove);
  // partículas
  for (const pt of g.parts) { pt.x += pt.vx; pt.y += pt.vy; if (!pt.text) pt.vy += 0.15; pt.life--; }
  g.parts = g.parts.filter(p => p.life > 0);
  if (g.shake > 0) g.shake *= 0.85; if (g.shake < 0.3) g.shake = 0;
  if (g.lastHit && --g.lastHit.time <= 0) g.lastHit = null;
  if (g.bossCard > 0) g.bossCard--;

  // fin del nivel
  if (g.boss && g.boss.remove && g.state === 'play') {
    g.state = 'win'; g.timer = 120; Sound.sfx('win');
    const secs = Math.round((g.playT || 0) / 60), kos = g.kos || 0;
    const bonus = Math.round((Math.max(0, 6000 - secs * 12) + kos * 100 + (g.maxCombo || 0) * 50) * D().score);
    g.tally = { secs, kos, combo: g.maxCombo || 0, bonus };
    const p1 = g.players[0]; if (p1) p1.score += bonus;
    cleared[g.lv.id] = true; saveCleared();
  }
  const humans = g.players.filter(p => p && !p.cpu);
  if (g.state === 'play' && humans.length && humans.every(p => p.out)) { g.state = 'over'; g.timer = 600; }
}

function heroCleared(lv) { return LEVELS.filter(l => l.hero === lv.hero).every(l => cleared[l.id]); }

function finishLevel() {
  const g = App.g;
  if (g && g.lv.next) {
    const ni = LEVELS.findIndex(l => l.id === g.lv.next);
    if (ni >= 0) {
      const p1 = g.players[0], p2 = g.players[1];
      App.carry = { score: p1 ? p1.score : 0, lives: p1 ? Math.max(p1.lives, 2) : 3, p2: p2 && p2.heroKey === LEVELS[ni].p2 ? { cpu: p2.cpu, score: p2.score, lives: Math.max(p2.lives, 2) } : null };
      startLevel(ni); return;
    }
  }
  const all = LEVELS.every(l => cleared[l.id]);
  if (all && !App.endingShown) { App.mode = 'ending'; App.endT = 0; App.endingShown = true; Sound.play(SONG_TITLE); return; }
  App.mode = 'select'; Sound.play(SONG_TITLE);
  const next = MAIN_LEVELS.findIndex(l => !heroCleared(l));
  if (next >= 0) App.sel = next;
}

// =====================================================================
// RENDER
// =====================================================================
function poseOf(e) {
  const f = ((e.anim / 8) | 0) & 3;
  switch (e.state) {
    case 'idle': return ['idle', 0];
    case 'walk': return ['walk', f];
    case 'attack': return [e.st < 3 ? 'idle' : e.atk, 0];
    case 'jump': return ['jump', 0];
    case 'jkick': return ['kick', 0];
    case 'hurt': return ['hurt', 0];
    case 'fall': case 'down': case 'dead': return ['down', 0];
    case 'getup': return ['jump', 0];
    case 'special': return ['special', 0];
    case 'eattack': return [e.st < 16 ? 'throw' : 'p1', 0];
    case 'echarge': return ['charge', 0];
    case 'b_combo': return e.swing ? [(e.st2 > 10 && e.st2 < 22) ? 'p1' : (e.st2 > 30 && e.st2 < 44) ? 'p3' : 'idle', 0] : ['walk', f];
    case 'b_throw': return e.atk === 'throw' && e.cfg.projs.includes('pelota') && e.st > 38 && e.st < 50 ? ['kick', 0] : ['throw', e.st > 40 ? 1 : 0];
    case 'b_charge': return [e.st < 36 ? 'idle' : 'charge', 0];
    case 'b_slam': return [e.z > 0 ? 'jump' : 'idle', 0];
    case 'b_summon': return ['wave', f];
    case 'b_dance': return ['dance', f];
  }
  return ['idle', 0];
}

function drawFighter(g, e) {
  const sx = e.x - g.camX, sy = e.y - e.z;
  shadow(ctx, sx, e.y, 10 * e.scale);
  if ((e.invul > 0 && e.kind === 'player' && (e.invul >> 2) % 2 === 0) && e.state !== 'special') return;
  if (e.state === 'dead' && (e.st >> 2) % 2 === 0) return;
  const [pose, f] = poseOf(e);
  let tint = null;
  if (e.flash > 0) tint = 'rgba(255,255,255,0.75)';
  else if ((e.state === 'b_charge' && e.st < 36) || (e.state === 'echarge' && e.st < 30)) tint = (e.st >> 2) & 1 ? 'rgba(255,40,40,0.5)' : null;
  else if (e.state === 'special') tint = `hsla(${(g.t * 20) % 360},100%,60%,0.35)`;
  drawPerson(ctx, e.look, pose, f, sx, sy, e.face, e.scale, { tint });
  if (e.kind === 'boss' && e.cfg.extra === 'mate' && pose !== 'down') {
    // termo en la espalda y mate en la mano
    const s = e.scale;
    rect(ctx, Math.round(sx - e.face * 7 * s - 2), Math.round(sy - 22 * s), 4, 10, '#c8c8d0');
    rect(ctx, Math.round(sx - e.face * 7 * s - 2), Math.round(sy - 23 * s), 4, 2, '#222');
    if (pose === 'idle' || pose === 'walk') {
      const hx = Math.round(sx + e.face * 5 * s), hy = Math.round(sy - 16 * s);
      rect(ctx, hx - 3, hy - 5, 6, 6, '#6b3e1f'); rect(ctx, hx - 2, hy - 6, 4, 1, '#4caf50'); rect(ctx, hx + e.face, hy - 10, 1, 5, '#ddd');
    }
  }
  if (e.look.beer && (pose === 'idle' || pose === 'walk')) {
    // chopp de birra en la mano
    const s = e.scale * (e.look.h || 1), hx = Math.round(sx + e.face * 4 * e.scale), hy = Math.round(sy - 15 * s);
    rect(ctx, hx - 3, hy - 7, 7, 9, 'rgba(230,240,255,0.7)'); rect(ctx, hx - 2, hy - 5, 5, 6, '#e8a020'); rect(ctx, hx - 3, hy - 8, 7, 3, '#fffbe8');
    rect(ctx, hx + e.face * 4, hy - 5, 1, 5, 'rgba(230,240,255,0.9)');
  }
  // aviso de ataque del jefe
  if (e.kind === 'boss' && ((e.state === 'b_throw' && e.st > 22 && e.st < 42) || (e.state === 'b_charge' && e.st < 36) || (e.state === 'b_slam' && e.st < 20))) {
    const yy = Math.round(sy - 40 * e.scale - ((g.t >> 2) & 1)); rect(ctx, sx - 3, yy - 1, 7, 12, '#000'); rect(ctx, sx - 2, yy, 5, 7, '#ff3030'); rect(ctx, sx - 2, yy + 8, 5, 2, '#ff3030');
  }
  if (e.cpu) txt(ctx, 'CPU', sx, sy - 44 * e.scale, '#9ff', 5, 'center');
  else if (e.kind === 'player' && g.players[1]) txt(ctx, 'P' + (e.idx + 1), sx, sy - 44 * e.scale * (e.look.h || 1), e.idx ? '#ff7070' : '#7dff5a', 5, 'center');
}

function drawWorld(g) {
  const lv = g.lv;
  ctx.save();
  if (g.shake) ctx.translate(Math.round((Math.random() - 0.5) * g.shake * 2), Math.round((Math.random() - 0.5) * g.shake * 2));
  lv.bg(ctx, g.camX, g.t, g);
  const sorted = g.ents.slice().sort((a, b) => a.y - b.y);
  for (const e of sorted) {
    if (e.kind === 'prop') drawProp(ctx, e.type, e.x - g.camX, e.y, e.broken);
    else if (e.kind === 'item') drawItem(ctx, e.type, e.x - g.camX, e.y, e.t);
    else if (e.kind === 'caseus') drawCaseus(ctx, e.x - g.camX, e.y, g.t, g.players.some(p => p && Math.abs(p.x - e.x) < 90));
    else if (e.kind === 'npc') {
      const near = g.players.some(p => p && Math.abs(p.x - e.x) < 120);
      drawPerson(ctx, e.look, near ? 'wave' : 'idle', (g.t >> 3) & 3, e.x - g.camX, e.y, e.face, 1);
      shadow(ctx, e.x - g.camX, e.y, 10);
    }
    else if (e.kind === 'proj') { if (e.t >= 0) drawProj(ctx, e, g.camX); }
    else drawFighter(g, e);
  }
  drawWeather(g);
  for (const pt of g.parts) {
    if (pt.star) {
      const k = pt.life / 7, r = Math.round(pt.star * (1.4 - k * 0.6)), x = Math.round(pt.x - g.camX), y = Math.round(pt.y);
      ctx.fillStyle = `rgba(255,255,255,${k})`; ctx.fillRect(x - r, y - 1, r * 2, 2); ctx.fillRect(x - 1, y - r, 2, r * 2);
      ctx.fillStyle = `rgba(255,230,120,${k * 0.8})`; ctx.fillRect(x - r / 2, y - r / 2, r, r);
      continue;
    }
    if (pt.text) txt(ctx, pt.text, pt.x - g.camX, pt.y, pt.col, pt.size, 'center');
    else rect(ctx, Math.round(pt.x - g.camX), Math.round(pt.y), pt.s, pt.s, pt.col);
  }
  if (lv.fg) lv.fg(ctx, g.camX, g.t, g);
  ctx.restore();
  // iluminación / viñeta
  const night = lv.night;
  const grd = ctx.createRadialGradient(W / 2, H * 0.55, H * 0.3, W / 2, H * 0.55, H * 0.95);
  grd.addColorStop(0, 'rgba(0,0,0,0)'); grd.addColorStop(1, night ? 'rgba(0,0,12,0.5)' : 'rgba(50,25,0,0.2)');
  ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  if (lv.id === 'lanus') { ctx.fillStyle = 'rgba(255,140,40,0.05)'; ctx.fillRect(0, 0, W, H); }
}

// ---------- clima y partículas de ambiente ----------
function drawWeather(g) {
  const lv = g.lv, t = g.t, cx = g.camX;
  let w = lv.weather;
  if (lv.id === 'tokyo' && g.section === 1) w = 'violetas';
  const wrap = (v, m) => ((v % m) + m) % m;
  switch (w) {
    case 'rain': {
      ctx.fillStyle = 'rgba(170,200,255,0.4)';
      for (let i = 0; i < 80; i++) {
        const x = wrap(rnd(i) * 500 - t * 1.6 - cx * 0.4, 440) - 30, y = wrap(rnd(i + 99) * 260 + t * (5 + rnd(i) * 2), 250) - 20;
        ctx.fillRect(Math.round(x), Math.round(y), 1, 6);
      }
      for (let i = 0; i < 10; i++) { const k = (t + i * 17) % 30; if (k < 6) { const x = wrap(rnd(i * 7 + ((t / 30) | 0)) * W, W), y = 158 + rnd(i * 3 + ((t / 30) | 0)) * 50; ctx.fillStyle = 'rgba(190,215,255,0.5)'; ctx.fillRect(x - k, y, k * 2, 1); } }
      break;
    }
    case 'papelitos': case 'papelitosRiver': case 'violetas': {
      const cols = { papelitos: ['#f5c400', '#1a3fa8', '#fff'], papelitosRiver: ['#e0161b', '#fff', '#fff'], violetas: ['#7a3ab8', '#fff', '#c9a7ff'] }[w];
      const n = w === 'violetas' ? 50 : 26;
      for (let i = 0; i < n; i++) {
        const x = wrap(rnd(i) * 600 + Math.sin(t / 30 + i) * 12 - cx * 0.6, 420) - 20, y = wrap(rnd(i + 5) * 300 + t * (0.35 + rnd(i) * 0.4), 240) - 20;
        ctx.fillStyle = cols[i % 3]; ctx.fillRect(Math.round(x), Math.round(y), 2, ((t >> 3) + i) & 1 ? 2 : 1);
      }
      break;
    }
    case 'fog':
      for (let i = 0; i < 7; i++) {
        const x = wrap(rnd(i) * 700 + t * 0.15 - cx * 0.8, 560) - 90, y = 126 + rnd(i + 3) * 80;
        ctx.fillStyle = 'rgba(190,200,230,0.07)'; ctx.beginPath(); ctx.ellipse(x, y, 70, 12, 0, 0, 7); ctx.fill();
      }
      break;
    case 'leaves':
      for (let i = 0; i < 14; i++) {
        const x = wrap(rnd(i) * 600 + t * 0.5 + Math.sin(t / 25 + i * 2) * 14 - cx, 420) - 20, y = wrap(rnd(i + 7) * 300 + t * (0.5 + rnd(i) * 0.3), 240) - 20;
        ctx.fillStyle = ['#7aa83a', '#c88a2a', '#5a8a2a'][i % 3]; ctx.fillRect(Math.round(x), Math.round(y), ((t >> 4) + i) & 1 ? 3 : 2, 2);
      }
      break;
    case 'birds':
      ctx.fillStyle = 'rgba(40,30,40,0.7)';
      for (let i = 0; i < 6; i++) {
        const x = wrap(rnd(i) * 900 + t * (0.5 + rnd(i) * 0.3) - cx * 0.1, 520) - 60, y = 18 + rnd(i + 4) * 50 + Math.sin(t / 20 + i) * 3, up = ((t >> 3) + i) & 1;
        ctx.fillRect(Math.round(x) - 3, Math.round(y) - (up ? 1 : 0), 3, 1); ctx.fillRect(Math.round(x) + 1, Math.round(y) - (up ? 1 : 0), 3, 1); ctx.fillRect(Math.round(x), Math.round(y), 1, 1);
      }
      break;
  }
}

function bar(x, y, w, h, v, max, col) {
  rect(ctx, x - 1, y - 1, w + 2, h + 2, '#000');
  rect(ctx, x, y, w, h, '#3a1010');
  const k = clamp(v / max, 0, 1);
  rect(ctx, x, y, Math.round(w * k), h, k > 0.5 ? col : k > 0.25 ? '#ffb020' : '#ff3030');
  rect(ctx, x, y, Math.round(w * k), 1, 'rgba(255,255,255,0.4)');
}

function portrait(look, x, y, sz = 20, face = 1, bg = '#1a1430') {
  rect(ctx, x - 1, y - 1, sz + 2, sz + 2, '#000'); rect(ctx, x, y, sz, sz, bg);
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, sz, sz); ctx.clip();
  const s = sz / 15;
  drawPerson(ctx, look, 'idle', 0, x + sz / 2 - face * 1, y + 2 + 34 * s * (look.h || 1), face, s);
  ctx.restore();
  rect(ctx, x, y, sz, 1, 'rgba(255,255,255,0.25)');
}

function heart(x, y, col) { rect(ctx, x, y + 1, 5, 2, col); rect(ctx, x + 1, y, 1, 1, col); rect(ctx, x + 3, y, 1, 1, col); rect(ctx, x + 1, y + 3, 3, 1, col); rect(ctx, x + 2, y + 4, 1, 1, col); }

function drawHUD(g) {
  const lv = g.lv;
  const top = ctx.createLinearGradient(0, 0, 0, 36); top.addColorStop(0, 'rgba(5,3,15,0.7)'); top.addColorStop(1, 'rgba(5,3,15,0)');
  ctx.fillStyle = top; ctx.fillRect(0, 0, W, 36);
  g.players.forEach((p, i) => {
    if (!p) return;
    const right = i === 1, px = right ? W - 26 : 4, col = right ? '#ff8a8a' : '#7dff5a';
    portrait(p.look, px, 4, 20, right ? -1 : 1, right ? '#3a1420' : '#142a1a');
    const bx = right ? W - 112 : 30;
    txt(ctx, p.name, right ? W - 30 : 30, 4, col, 7, right ? 'right' : 'left');
    if (p.cpu) txt(ctx, 'CPU', W - 30 - p.name.length * 7 - 4, 6, '#9ff', 4, 'right');
    for (let k = 0; k < Math.min(p.lives, 5); k++) heart(right ? W - 76 - k * 7 : 72 + k * 7, 22, '#ff4a5a');
    bar(bx, 14, 82, 5, p.out ? 0 : p.hp, p.maxhp, '#3ee06a');
    txt(ctx, String(p.score).padStart(7, '0'), right ? W - 30 : 30, 22, '#ffe14d', 5, right ? 'right' : 'left');
    if (p.hitCombo >= 2 && p.hitComboT > 0) {
      const sz = p.comboPop > 4 ? 9 : 7;
      txt(ctx, p.hitCombo + ' HITS!', right ? W - 6 : 6, 31, p.hitCombo >= 8 ? '#ff5a5a' : '#ffe14d', sz, right ? 'right' : 'left');
    }
  });
  if (g.players[1] && g.players[1].cpu && lv.p2) txt(ctx, 'F = MANEJAR P2', W - 30, 29, '#9ff', 4, 'right');
  if (lv.p2 && !g.players[1] && (!lv.p2Join || g.p2Ready)) {
    if ((g.t >> 5) & 1) txt(ctx, 'P2: ' + HEROES[lv.p2].name, W - 6, 5, '#ff8080', 6, 'right');
    txt(ctx, 'F = UNIRSE', W - 6, 14, '#fff', 5, 'right');
    txt(ctx, '2 = CPU', W - 6, 22, '#9ff', 5, 'right');
  }
  // último enemigo golpeado
  if (g.lastHit && g.lastHit.e.kind === 'enemy' && !(g.players[0] && g.players[0].hitCombo >= 2 && g.players[0].hitComboT > 0)) {
    const e = g.lastHit.e;
    txt(ctx, e.name, 30, 31, '#fff', 4); bar(30, 37, 50, 2, e.hp, e.maxhp, '#ff9030');
  }
  // jefe
  if (g.boss && !g.boss.remove && !g.boss.ai.entering) {
    const b = g.boss, bx = W / 2 - 90;
    const bot = ctx.createLinearGradient(0, H - 30, 0, H); bot.addColorStop(0, 'rgba(20,0,0,0)'); bot.addColorStop(1, 'rgba(20,0,0,0.7)');
    ctx.fillStyle = bot; ctx.fillRect(0, H - 30, W, 30);
    portrait(b.look, bx - 26, H - 26, 22, 1, '#3a0a10');
    txt(ctx, b.name, bx, H - 24, '#ff5a5a', 6, 'left');
    bar(bx, H - 13, 200, 6, b.hp, b.maxhp, '#ff3030');
    for (let k = 1; k < 10; k++) rect(ctx, bx + k * 20, H - 13, 1, 6, 'rgba(0,0,0,0.35)');
    if (b.hp < b.maxhp / 2 && (g.t >> 4) & 1) txt(ctx, 'FURIA!', bx + 200, H - 24, '#ffb020', 5, 'right');
  }
  if (g.go > 0 && !g.waveActive && (g.go >> 3) & 1) {
    txt(ctx, 'SIGA! >>', W - 10, 70, '#ffe14d', 12, 'right');
  }
  // cartel de zona
  if (g.zoneBanner) {
    const zt = g.zoneBanner.t, tx = g.zoneBanner.text;
    const w = tx.length * 6 + 26, off = zt < 14 ? -(14 - zt) * 14 : zt > 150 ? -(zt - 150) * 14 : 0;
    const x = 8 + off, y = 44;
    rect(ctx, x, y, w, 15, 'rgba(8,6,20,0.82)'); rect(ctx, x, y, 4, 15, lv.colors[0]); rect(ctx, x + 4, y, 2, 15, lv.colors[1]);
    rect(ctx, x, y + 15, w, 1, lv.colors[0]);
    txt(ctx, tx, x + 14, y + 4, '#fff', 6, 'left', null);
  }
  if (g.bossCard > 0) {
    const k = Math.min(1, (140 - g.bossCard) / 20);
    rect(ctx, 0, 0, W, 16 * k, '#000'); rect(ctx, 0, H - 16 * k, W, 16 * k, '#000');
    rect(ctx, 0, 84, W, 34 * k, 'rgba(120,0,0,0.75)');
    rect(ctx, 0, 84, W, 1, '#ff5a5a'); rect(ctx, 0, 84 + 34 * k, W, 1, '#ff5a5a');
    if (k >= 1) { txt(ctx, 'CUIDADO!', W / 2, 88, '#ffe14d', 8, 'center'); txt(ctx, g.lv.boss.name, W / 2, 101, '#fff', 12, 'center'); }
  }
  if (g.goBanner > 0) {
    const k = g.goBanner, sl = k > 75 ? (k - 75) * 30 : 0;
    rect(ctx, 0, 92, W, 30, 'rgba(0,0,0,0.55)'); rect(ctx, 0, 92, W, 2, lv.colors[0]); rect(ctx, 0, 120, W, 2, lv.colors[1]);
    txt(ctx, 'A PELEAR!', W / 2 + sl, 98, '#ffe14d', 16, 'center');
  }
  if (g.fadeIn > 0) { ctx.fillStyle = `rgba(0,0,0,${g.fadeIn / 30})`; ctx.fillRect(0, 0, W, H); }
}

function wrapText(s, max) {
  const words = s.split(' '), lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > max) { lines.push(cur.trim()); cur = w; } else cur += ' ' + w; }
  if (cur.trim()) lines.push(cur.trim());
  return lines;
}

function drawDialog(g) {
  const d = g.dialog; if (!d) return;
  const [who, line] = d.lines[d.i];
  const y = H - 58;
  rect(ctx, 8, y, W - 16, 50, 'rgba(10,10,30,0.92)'); rect(ctx, 8, y, W - 16, 1, '#ffe14d'); rect(ctx, 8, y + 49, W - 16, 1, '#ffe14d');
  // retrato
  const hk = Object.keys(HEROES).find(k => HEROES[k].name === who);
  let look = hk ? HEROES[hk].look : null;
  if (!look && g.lv.boss && g.lv.boss.name === who) look = g.lv.boss.look;
  if (who === 'ANA') look = ANA_LOOK;
  if (look) { rect(ctx, 14, y + 6, 38, 38, '#223'); ctx.save(); ctx.beginPath(); ctx.rect(14, y + 6, 38, 38); ctx.clip(); drawPerson(ctx, look, 'idle', 0, 33, y + 104, 1, 2.6); ctx.restore(); }
  txt(ctx, who, 60, y + 6, '#ffe14d', 7);
  const lines = wrapText(line.slice(0, d.ch), 38);
  lines.forEach((l, i) => txt(ctx, l, 60, y + 18 + i * 9, '#fff', 6));
  if (d.ch >= line.length && (g.t >> 4) & 1) txt(ctx, '>', W - 20, y + 40, '#ffe14d', 6);
}

function drawGame() {
  const g = App.g;
  drawWorld(g);
  if (g.state === 'card') {
    const lv = g.lv, el = 150 - g.timer, c0 = lv.colors[0], c1 = lv.colors[1];
    rect(ctx, 0, 0, W, H, c0);
    ctx.fillStyle = c1; ctx.globalAlpha = 0.18;
    for (let i = -4; i < 20; i++) { const x = i * 32 + (el * 0.8) % 32; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + 14, 0); ctx.lineTo(x + 14 - 120, H); ctx.lineTo(x - 120, H); ctx.fill(); }
    ctx.globalAlpha = 1;
    rect(ctx, 0, 40, W, 112, 'rgba(0,0,0,0.6)'); rect(ctx, 0, 40, W, 2, c1); rect(ctx, 0, 150, W, 2, c1);
    const sl = Math.max(0, 20 - el) * 18;
    txt(ctx, lv.label || ('NIVEL 1 - ' + lv.title), W / 2 + sl, 48, '#ffe14d', 7, 'center');
    txt(ctx, lv.title, W / 2 - sl, 62, '#fff', lv.title.length > 11 ? 18 : 24, 'center');
    txt(ctx, lv.sub, W / 2 + sl, 94, '#9ff', 6, 'center');
    const co = lv.p2 ? ' + ' + HEROES[lv.p2].name + (lv.p2Join ? ' (MAS ADELANTE)' : ' (P2)') : '';
    txt(ctx, 'CON ' + HEROES[lv.hero].name + co, W / 2, 110, '#ff8', 6, 'center');
    txt(ctx, 'JEFE FINAL: ' + lv.boss.name, W / 2, 124, '#ff6a6a', 7, 'center');
    txt(ctx, 'DIFICULTAD: ' + D().name, W / 2, 138, D().col, 5, 'center');
    const hx = Math.min(70, -40 + el * 6);
    drawPerson(ctx, HEROES[lv.hero].look, el < 18 ? 'walk' : 'idle', (el >> 3) & 3, hx, 206, 1, 2.2);
    drawPerson(ctx, lv.boss.look, 'idle', 0, Math.max(W - 70, W + 60 - el * 6), 206, -1, 2.6, { tint: 'rgba(0,0,0,0.55)' });
    if (el > 40 && (el >> 4) & 1) txt(ctx, 'GOLPE PARA EMPEZAR', W / 2, 160, '#fff', 5, 'center');
    return;
  }
  drawHUD(g);
  drawDialog(g);
  if (g.state === 'warp') {
    const k = g.timer > 35 ? (70 - g.timer) / 35 : g.timer / 35;
    rect(ctx, 0, 0, W, H, `rgba(255,255,255,${clamp(k, 0, 1)})`);
    if (k > 0.6) txt(ctx, g.lv.warp.text, W / 2, H / 2 - 4, '#3060c0', 8, 'center', '#fff');
  }
  if (App.paused) {
    rect(ctx, 0, 0, W, H, 'rgba(0,0,0,0.65)');
    txt(ctx, 'PAUSA', W / 2, 52, '#fff', 16, 'center');
    ['SEGUIR JUGANDO', 'VOLVER AL MENU'].forEach((o, i) => { const on = App.pauseSel === i; if (on) rect(ctx, W / 2 - 80, 84 + i * 18, 160, 14, 'rgba(255,225,77,0.2)'); txt(ctx, (on ? '> ' : '  ') + o, W / 2, 87 + i * 18, on ? '#ffe14d' : '#aaa', 7, 'center'); });
    txt(ctx, 'P1: FLECHAS  Z GOLPE  X SALTO  C ESPECIAL', W / 2, 140, '#9ff', 5, 'center');
    txt(ctx, 'P2: WASD  F GOLPE  G SALTO  H ESPECIAL', W / 2, 150, '#ff9a9a', 5, 'center');
    txt(ctx, 'COMBO: GOLPE x3   SALTO + GOLPE: PATADA VOLADORA', W / 2, 164, '#ccc', 4, 'center');
    txt(ctx, 'ESPECIAL: GIRO QUE BARRE A TODOS (GASTA UN POCO DE VIDA)', W / 2, 172, '#ccc', 4, 'center');
  }
  if (g.state === 'win' && g.tally) {
    const T = g.tally, el = 120 - g.timer, lv = g.lv;
    rect(ctx, 30, 34, W - 60, 148, 'rgba(6,4,18,0.88)'); rect(ctx, 30, 34, W - 60, 3, lv.colors[0]); rect(ctx, 30, 179, W - 60, 3, lv.colors[1]);
    txt(ctx, 'NIVEL SUPERADO!', W / 2, 44, '#ffe14d', 14, 'center');
    txt(ctx, lv.title + ' LIBERADO', W / 2, 66, '#fff', 7, 'center');
    const rows = [['DIFICULTAD', D().name], ['ENEMIGOS K.O.', T.kos], ['TIEMPO', Math.floor(T.secs / 60) + ':' + String(T.secs % 60).padStart(2, '0')], ['COMBO MAXIMO', T.combo + ' HITS'], ['BONUS', '+' + Math.round(T.bonus * clamp((el - 50) / 40, 0, 1))]];
    rows.forEach((r, i) => { if (el > 12 + i * 10) { txt(ctx, r[0], 60, 80 + i * 12, '#9ff', 6, 'left'); txt(ctx, String(r[1]), W - 60, 80 + i * 12, i === 0 ? D().col : '#fff', 6, 'right'); } });
    const tot = g.players.reduce((s, p) => s + (p ? p.score : 0), 0);
    if (el > 92) txt(ctx, 'TOTAL ' + tot, W / 2, 146, '#ffe14d', 9, 'center');
    if (g.timer < 0 && (g.t >> 4) & 1) txt(ctx, g.lv.next ? 'GOLPE: SIGUE EL NIVEL 2 >>' : 'GOLPE PARA CONTINUAR', W / 2, 164, '#fff', 6, 'center');
  }
  if (g.state === 'over') {
    rect(ctx, 0, 0, W, H, 'rgba(0,0,0,0.7)');
    txt(ctx, 'GAME OVER', W / 2, 70, '#ff5050', 20, 'center');
    txt(ctx, 'CONTINUAR? ' + Math.ceil(g.timer / 60), W / 2, 104, '#fff', 10, 'center');
    txt(ctx, 'APRETA GOLPE / ENTER', W / 2, 124, '#ccc', 6, 'center');
  }
}

// ---------- TÍTULO ----------
function fakeG(lv, t) { return { lv: Object.assign({ genoves: -9999, warp: { x: -9999, toX: 0, afterWave: 99 } }, lv), section: 0, waveIdx: 0, t: t + 400 }; }
function drawTitle() {
  const t = App.t;
  const lv = LEVELS[((t / 360) | 0) % LEVELS.length];
  lv.bg(ctx, 300 + (t * 0.8) % 2200, t, fakeG(lv, t));
  rect(ctx, 0, 0, W, H, 'rgba(8,4,24,0.6)');
  const bob = Math.round(Math.sin(t / 20) * 3);
  // logo con capas de colores de los 4 clubes
  ['#0d7a3a', '#e0161b', '#123c8c', '#f5c400'].forEach((c, i) => txt(ctx, 'QEP', W / 2 + 6 - i * 1.5, 22 + bob + 6 - i * 1.5, c, 40, 'center', null));
  txt(ctx, 'QEP', W / 2, 20 + bob, '#fff', 40, 'center', '#000');
  const sh = (t * 3) % 300 - 60; ctx.save(); ctx.beginPath(); ctx.rect(W / 2 - 70, 20 + bob, 140, 40); ctx.clip(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.moveTo(W / 2 - 70 + sh, 20 + bob); ctx.lineTo(W / 2 - 58 + sh, 20 + bob); ctx.lineTo(W / 2 - 78 + sh, 60 + bob); ctx.lineTo(W / 2 - 90 + sh, 60 + bob); ctx.fill(); ctx.restore();
  rect(ctx, W / 2 - 74, 66, 148, 16, '#e0161b'); rect(ctx, W / 2 - 74, 66, 148, 2, '#ffe14d'); rect(ctx, W / 2 - 74, 80, 148, 2, '#ffe14d');
  txt(ctx, 'A R C A D E', W / 2, 70, '#fff', 9, 'center', '#600');
  txt(ctx, '4 PIBES - 8 NIVELES - 8 JEFES', W / 2, 90, '#9ff', 6, 'center');
  const keys = ['juani', 'nico', 'santi', 'fran'];
  keys.forEach((k, i) => drawPerson(ctx, HEROES[k].look, 'walk', ((t / 8) + i) & 3, 66 + i * 84, 166 + (((t >> 3) + i) & 1), 1, 1.6));
  if ((t >> 5) & 1) txt(ctx, 'APRETA ENTER O TOCA PARA JUGAR', W / 2, 176, '#fff', 7, 'center');
  txt(ctx, 'P1: FLECHAS + Z/X/C   P2: WASD + F/G/H   M: SONIDO', W / 2, 192, '#bbb', 4, 'center');
  // sponsor
  rect(ctx, W - 82, H - 16, 78, 13, '#1c1c1c'); rect(ctx, W - 81, H - 15, 76, 11, '#f3e6b0');
  txt(ctx, 'SPONSOR: CASEUS', W - 43, H - 12, '#1c1c1c', 4, 'center', null);
}

// ---------- SELECCIÓN ----------
function drawSelect() {
  const t = App.t;
  rect(ctx, 0, 0, W, H, '#120a26');
  for (let i = 0; i < 30; i++) rect(ctx, (rnd(i) * W + t * (0.2 + rnd(i + 4))) % W, rnd(i + 9) * H, 2, 2, '#2a1f50');
  txt(ctx, 'ELEGI TU PIBE', W / 2, 8, '#ffe14d', 12, 'center');
  MAIN_LEVELS.forEach((lv, i) => {
    const x = 10 + i * 93, y = 30, sel = App.sel === i;
    rect(ctx, x - 2, y - 2, 89, 150, sel ? ((t >> 3) & 1 ? '#ffe14d' : '#ff8a00') : '#2a2050');
    rect(ctx, x, y, 85, 146, '#1b1438');
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, 85, 90); ctx.clip();
    ctx.translate(x - 150, y - 60); ctx.scale(1, 1);
    lv.bg(ctx, 400 + i * 300, t, fakeG(lv, t));
    ctx.restore();
    rect(ctx, x, y + 90, 85, 1, '#000');
    const h = HEROES[lv.hero];
    drawPerson(ctx, h.look, sel ? 'walk' : 'idle', (t >> 3) & 3, x + 42, y + 86, 1, 2);
    txt(ctx, h.name, x + 42, y + 96, sel ? '#ffe14d' : '#fff', 8, 'center');
    txt(ctx, lv.title, x + 42, y + 110, '#9ff', 6, 'center');
    const lv2 = LEVELS.find(l => l.id === lv.next);
    txt(ctx, 'JEFES', x + 42, y + 120, '#888', 4, 'center');
    [lv, lv2].forEach((L, k) => { if (!L) return; const done = cleared[L.id]; txt(ctx, (done ? '* ' : '') + L.boss.name, x + 42, y + 127 + k * 8, done ? '#ffe14d' : '#ff7070', 4, 'center'); });
    if (lv.p2) { rect(ctx, x + 66, y + 3, 16, 9, '#000'); txt(ctx, '2P', x + 74, y + 5, '#7dff5a', 5, 'center', null); }
    if (heroCleared(lv)) { rect(ctx, x + 3, y + 3, 30, 9, '#000'); txt(ctx, 'HECHO', x + 18, y + 5, '#ffe14d', 4, 'center', null); }
  });
  const lv = MAIN_LEVELS[App.sel];
  txt(ctx, lv.p2 ? (lv.p2Join ? 'MAPA CO-OP: ' + (lv.p2JoinText || HEROES[lv.p2].name + ' APARECE MAS ADELANTE') : 'MAPA CO-OP: ' + HEROES[lv.p2].name + ' PUEDE SUMARSE COMO P2') : 'MAPA PARA 1 JUGADOR', W / 2, 182, '#9ff', 5, 'center');
  // selector de dificultad
  const dd = D();
  rect(ctx, W / 2 - 96, 192, 192, 13, 'rgba(0,0,0,0.6)'); rect(ctx, W / 2 - 96, 192, 192, 1, dd.col); rect(ctx, W / 2 - 96, 204, 192, 1, dd.col);
  txt(ctx, 'DIFICULTAD:', W / 2 - 90, 195, '#aaa', 5, 'left', null);
  txt(ctx, '< ' + dd.name + ' >', W / 2 + 40, 195, dd.col, 6, 'center', null);
  for (let k = 0; k < DIFFS.length; k++) rect(ctx, W / 2 - 90 + k * 8, 201, 6, 2, k <= diffIdx ? DIFFS[k].col : '#333');
  if ((t >> 5) & 1) txt(ctx, '<> ELEGIR PIBE   ^v DIFICULTAD   GOLPE: JUGAR', W / 2, 208, '#fff', 4, 'center');
}

// ---------- FINAL ----------
function drawEnding() {
  const t = App.endT;
  rect(ctx, 0, 0, W, H, '#0a1a3a');
  for (let i = 0; i < 60; i++) { const x = (rnd(i) * W), y = (rnd(i + 3) * H + t * (1 + rnd(i))) % H; rect(ctx, x, y, 3, 3, pick(['#e0161b', '#123c8c', '#f5c400', '#0d7a3a', '#fff', '#75aadb'])); }
  txt(ctx, 'QEP CAMPEONES', W / 2, 30, '#ffe14d', 18, 'center');
  txt(ctx, 'LA BOCA, TOKIO, BARRIO RIVER, AMSTERDAM,', W / 2, 56, '#fff', 6, 'center');
  txt(ctx, 'EL CENTRO, BANFIELD Y LANUS QUEDARON A SALVO.', W / 2, 66, '#fff', 6, 'center');
  txt(ctx, 'LA PICADA LA INVITA CASEUS. GRACIAS POR JUGAR!', W / 2, 80, '#ffe14d', 5, 'center');
  ['juani', 'nico', 'santi', 'fran', 'martin'].forEach((k, i) => drawPerson(ctx, HEROES[k].look, 'dance', ((t >> 3) + i) & 3, 40 + i * 62, 176, 1, 2));
  drawAnaFront(ctx, W - 36, 176, 2, true, t);
  if (t > 120 && (t >> 5) & 1) txt(ctx, 'APRETA ENTER', W / 2, 196, '#9ff', 6, 'center');
}

// =====================================================================
// BUCLE
// =====================================================================
function updateMenus() {
  for (const p of pads) p.poll();
  if (keyDown['KeyM'] && !App.mDown) { Sound.toggleMute(); }
  App.mDown = keyDown['KeyM'];
  if (App.mode === 'title') {
    if (pads[0].hit('start') || pads[0].hit('a') || App.tap) { App.mode = 'select'; Sound.unlock(); Sound.play(SONG_TITLE); Sound.sfx('select'); }
  } else if (App.mode === 'select') {
    if (pads[0].hit('left')) { App.sel = (App.sel + 3) % 4; Sound.sfx('move'); }
    if (pads[0].hit('right')) { App.sel = (App.sel + 1) % 4; Sound.sfx('move'); }
    if (pads[0].hit('up')) { setDiff(diffIdx + 1); Sound.sfx('select'); }
    if (pads[0].hit('down')) { setDiff(diffIdx - 1); Sound.sfx('select'); }
    if (App.tapDiff) { setDiff(diffIdx + 1); Sound.sfx('select'); App.tapDiff = false; }
    if (App.tapSel !== undefined) { if (App.tapSel === App.sel) { Sound.sfx('select'); startLevel(LEVELS.indexOf(MAIN_LEVELS[App.sel])); } else { App.sel = App.tapSel; Sound.sfx('move'); } App.tapSel = undefined; }
    else if (pads[0].hit('start') || pads[0].hit('a')) { Sound.sfx('select'); startLevel(LEVELS.indexOf(MAIN_LEVELS[App.sel])); }
  } else if (App.mode === 'ending') {
    App.endT++;
    if (App.endT > 120 && (pads[0].hit('start') || pads[0].hit('a'))) { App.mode = 'select'; }
  }
  App.tap = false;
}

let acc = 0, last = performance.now();
function frame(now) {
  acc += Math.min(100, now - last); last = now;
  while (acc >= 1000 / 60) {
    acc -= 1000 / 60;
    App.t++;
    if (App.mode === 'game') {
      if (keyDown['KeyM'] && !App.mDown) Sound.toggleMute();
      App.mDown = keyDown['KeyM'];
      updateGame();
    } else updateMenus();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (App.mode === 'title') drawTitle();
  else if (App.mode === 'select') drawSelect();
  else if (App.mode === 'ending') drawEnding();
  else drawGame();
  requestAnimationFrame(frame);
}

// toques en el canvas (menús)
cv.addEventListener('pointerdown', ev => {
  Sound.unlock();
  const r = cv.getBoundingClientRect();
  const x = (ev.clientX - r.left) / r.width * W, y = (ev.clientY - r.top) / r.height * H;
  if (App.mode === 'title') App.tap = true;
  else if (App.mode === 'select') { const i = Math.floor((x - 8) / 93); if (y >= 188 && y <= 210) App.tapDiff = true; else if (i >= 0 && i < 4 && y > 25 && y < 180) App.tapSel = i; }
  else if (App.mode === 'ending' && App.endT > 120) App.mode = 'select';
  else if (App.mode === 'game' && App.g) {
    const g = App.g;
    if (g.dialog || g.state === 'card' || g.state === 'win' || g.state === 'over') { touchState.a = 1; setTimeout(() => touchState.a = 0, 80); }
  }
});

document.addEventListener('visibilitychange', () => { if (document.hidden && App.mode === 'game') App.autoPause = true; });
window.addEventListener('blur', () => { if (App.mode === 'game') App.autoPause = true; });

window.QEP = { App, LEVELS, startLevel, setDiff,
  // herramientas de testeo: simulación rápida sin dibujar
  step(n) { for (let i = 0; i < n; i++) { App.t++; if (App.mode === 'game') updateGame(); else updateMenus(); } },
};
const startLoop = () => requestAnimationFrame(t => { last = t; frame(t); });
if (document.fonts && document.fonts.load) {
  Promise.race([document.fonts.load('8px "Press Start 2P"'), new Promise(r => setTimeout(r, 2500))]).then(startLoop, startLoop);
} else startLoop();
