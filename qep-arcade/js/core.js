// ===== QEP ARCADE — núcleo: utilidades, input y audio =====
'use strict';

const W = 384, H = 216;
const FLOOR_TOP = 150, FLOOR_BOT = 208;
const FONT = "'Press Start 2P', monospace";

const rnd = (i) => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const pick = (arr) => arr[(Math.random() * arr.length) | 0];

function rect(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(x, y, w, h); }

function txt(c, s, x, y, col = '#fff', size = 8, align = 'left', shadow = '#000') {
  c.font = size + 'px ' + FONT;
  c.textAlign = align;
  c.textBaseline = 'top';
  x = Math.round(x); y = Math.round(y);
  if (shadow) {
    c.fillStyle = shadow;
    c.fillText(s, x + 1, y + 1);
    c.fillText(s, x - 1, y + 1);
    c.fillText(s, x + 1, y - 1);
    c.fillText(s, x - 1, y - 1);
    c.fillText(s, x, y + 2);
  }
  c.fillStyle = col;
  c.fillText(s, x, y);
}

// Texto con fuente del sistema (para kanji / katakana)
function jtxt(c, s, x, y, col, size = 10, align = 'center') {
  c.font = 'bold ' + size + 'px "Noto Sans JP","Hiragino Sans","Yu Gothic","MS Gothic",sans-serif';
  c.textAlign = align;
  c.textBaseline = 'top';
  c.fillStyle = col;
  c.fillText(s, Math.round(x), Math.round(y));
}

// ---------- INPUT ----------
const KEYMAP = {
  0: { left: ['ArrowLeft'], right: ['ArrowRight'], up: ['ArrowUp'], down: ['ArrowDown'],
       a: ['KeyZ', 'KeyJ'], b: ['KeyX', 'KeyK', 'Space'], c: ['KeyC', 'KeyL'], start: ['Enter'] },
  1: { left: ['KeyA'], right: ['KeyD'], up: ['KeyW'], down: ['KeyS'],
       a: ['KeyF'], b: ['KeyG'], c: ['KeyH'], start: ['KeyR'] },
};
const keyDown = {};
const keyLatch = {};   // teclas apretadas desde el último poll (para no perder toques rápidos)
const touchLatch = {};
const touchState = { left: 0, right: 0, up: 0, down: 0, a: 0, b: 0, c: 0, start: 0, p2: 0 };
const BTNS = ['left', 'right', 'up', 'down', 'a', 'b', 'c', 'start'];

class Pad {
  constructor(i) { this.i = i; this.cur = {}; this.prev = {}; this.cpu = null; }
  poll() {
    this.prev = this.cur;
    const cur = {};
    for (const b of BTNS) {
      let v = KEYMAP[this.i][b].some(k => keyDown[k] || keyLatch[k]);
      if (this.i === 0 && (touchState[b] || touchLatch[b])) v = true;
      cur[b] = v;
    }
    for (const b of BTNS) for (const k of KEYMAP[this.i][b]) keyLatch[k] = false;
    if (this.i === 0) for (const b of BTNS) touchLatch[b] = false;
    if (this.cpu) Object.assign(cur, this.cpu);
    this.cur = cur;
  }
  held(b) { return !!this.cur[b]; }
  hit(b) { return !!this.cur[b] && !this.prev[b]; }
}
const pads = [new Pad(0), new Pad(1)];
let anyKeyHit = false;
let lastKeyCode = '';

window.addEventListener('keydown', e => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'Tab'].includes(e.code)) e.preventDefault();
  if (!keyDown[e.code]) { anyKeyHit = true; lastKeyCode = e.code; keyLatch[e.code] = true; }
  keyDown[e.code] = true;
  Sound.unlock();
});
window.addEventListener('keyup', e => { keyDown[e.code] = false; });
window.addEventListener('blur', () => { for (const k in keyDown) keyDown[k] = false; });

// ---------- AUDIO ----------
const Sound = {
  ctx: null, master: null, musicGain: null, muted: false, seqTimer: null, song: null, step: 0, nextT: 0,
  unlock() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain(); this.master.gain.value = 0.5; this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain(); this.musicGain.gain.value = 0.32; this.musicGain.connect(this.master);
    this.noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.5, this.ctx.sampleRate);
    const d = this.noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (this.pendingSong) this.play(this.pendingSong);
  },
  toggleMute() { this.muted = !this.muted; if (this.master) this.master.gain.value = this.muted ? 0 : 0.5; },
  tone(f, dur, type = 'square', vol = 0.2, slide = 0, when = 0, dest) {
    if (!this.ctx) return;
    const t = (when || this.ctx.currentTime);
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(dest || this.master); o.start(t); o.stop(t + dur + 0.02);
  },
  noise(dur, vol = 0.3, freq = 1200, when = 0, dest) {
    if (!this.ctx) return;
    const t = (when || this.ctx.currentTime);
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = 0.8;
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(dest || this.master); s.start(t); s.stop(t + dur);
  },
  sfx(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'whoosh': this.noise(0.08, 0.12, 2500); break;
      case 'hit': this.noise(0.12, 0.45, 700); this.tone(140, 0.1, 'square', 0.15, 0.5); break;
      case 'bighit': this.noise(0.25, 0.6, 400); this.tone(90, 0.25, 'sawtooth', 0.25, 0.4); break;
      case 'jump': this.tone(300, 0.15, 'square', 0.1, 2); break;
      case 'land': this.noise(0.06, 0.15, 300); break;
      case 'pickup': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.1, 'square', 0.12, 0, this.ctx.currentTime + i * 0.06)); break;
      case 'select': this.tone(880, 0.08, 'square', 0.12); this.tone(1320, 0.1, 'square', 0.1, 0, this.ctx.currentTime + 0.06); break;
      case 'move': this.tone(440, 0.05, 'square', 0.08); break;
      case 'special': this.tone(200, 0.4, 'sawtooth', 0.2, 4); this.noise(0.3, 0.3, 1500); break;
      case 'ko': this.tone(400, 0.5, 'square', 0.2, 0.2); break;
      case 'break': this.noise(0.2, 0.4, 2000); this.tone(600, 0.1, 'triangle', 0.15, 0.5); break;
      case 'portal': for (let i = 0; i < 12; i++) this.tone(200 + i * 80, 0.2, 'triangle', 0.1, 1.5, this.ctx.currentTime + i * 0.05); break;
      case 'boss': [110, 104, 98, 92].forEach((f, i) => this.tone(f, 0.35, 'sawtooth', 0.25, 0, this.ctx.currentTime + i * 0.3)); break;
      case 'win': [523, 659, 784, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.18, 'square', 0.14, 0, this.ctx.currentTime + i * 0.13)); break;
      case 'talk': this.tone(600 + Math.random() * 200, 0.03, 'square', 0.05); break;
      case 'throw': this.tone(500, 0.15, 'triangle', 0.12, 0.5); break;
      case 'engine': this.tone(70, 0.5, 'sawtooth', 0.15, 1.8); break;
    }
  },
  // Secuenciador simple: song = {bpm, bass:[...], lead:[...], drums:'x.o.'} (notas en semitonos desde A2, null = silencio)
  play(song) {
    this.pendingSong = song;
    if (!this.ctx) return;
    this.stop();
    this.song = song; this.step = 0; this.nextT = this.ctx.currentTime + 0.05;
    this.seqTimer = setInterval(() => this.tick(), 25);
  },
  stop() { if (this.seqTimer) clearInterval(this.seqTimer); this.seqTimer = null; this.song = null; },
  tick() {
    const s = this.song; if (!s || !this.ctx) return;
    const stepDur = 60 / s.bpm / 4;
    while (this.nextT < this.ctx.currentTime + 0.12) {
      const i = this.step;
      const n2f = n => 110 * Math.pow(2, n / 12);
      const b = s.bass[i % s.bass.length];
      if (b !== null && b !== undefined) this.tone(n2f(b), stepDur * 1.6, s.bassWave || 'triangle', 0.35, 0, this.nextT, this.musicGain);
      const l = s.lead[i % s.lead.length];
      if (l !== null && l !== undefined) this.tone(n2f(l + 24), stepDur * (s.leadLen || 1.2), s.leadWave || 'square', 0.07, 0, this.nextT, this.musicGain);
      const d = s.drums[i % s.drums.length];
      if (d === 'k') this.tone(120, 0.12, 'sine', 0.5, 0.3, this.nextT, this.musicGain);
      if (d === 's') this.noise(0.1, 0.25, 1800, this.nextT, this.musicGain);
      if (d === 'h') this.noise(0.03, 0.12, 6000, this.nextT, this.musicGain);
      this.nextT += stepDur; this.step++;
    }
  },
};
