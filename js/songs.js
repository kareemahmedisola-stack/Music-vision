/* Staffsounds – Songs library (in the Keyboard duet), falling notes, and MIDI import and export.
   Songs are stored as scale degrees (1 = the key's first note), so they play in whatever key you pick. The melody keys
   (Q W E R T Y U I O P [ ]) are degrees 1 to 12. Three ways to play: Wait for me (the song waits for each note),
   In time (notes fall to the beat) and Hear then play (the game says each next note aloud). Hooks: spHtml(), spWire(),
   spPress(mi), spMidi(m), spStop(). */

const SONGS = [
  { n: 'Twinkle, Twinkle, Little Star', bpm: 100, lv: 1, s: '1 1 5 5 6 6 5:2 4 4 3 3 2 2 1:2 5 5 4 4 3 3 2:2 5 5 4 4 3 3 2:2 1 1 5 5 6 6 5:2 4 4 3 3 2 2 1:2' },
  { n: 'Mary Had a Little Lamb', bpm: 110, lv: 1, s: '3 2 1 2 3 3 3:2 2 2 2:2 3 5 5:2 3 2 1 2 3 3 3 3 2 2 3 2 1:4' },
  { n: 'Ode to Joy', bpm: 108, lv: 1, s: '3 3 4 5 5 4 3 2 1 1 2 3 3:1.5 2:.5 2:2 3 3 4 5 5 4 3 2 1 1 2 3 2:1.5 1:.5 1:2' },
  { n: 'Lightly Row', bpm: 108, lv: 1, s: '5 3 3 4 2 2 1 2 3 4 5 5 5:2 5 3 3 4 2 2 1 3 5 5 3:2 2 2 2 2 2 3 4:2 3 3 3 3 3 4 5:2 5 3 3 4 2 2 1 3 5 5 1:2' },
  { n: 'Frère Jacques', bpm: 108, lv: 2, s: '1 2 3 1 1 2 3 1 3 4 5:2 3 4 5:2 5:.5 6:.5 5:.5 4:.5 3 1 5:.5 6:.5 5:.5 4:.5 3 1 1 5 1:2 1 5 1:2' },
  { n: 'Jingle Bells (chorus)', bpm: 120, lv: 2, s: '3 3 3:2 3 3 3:2 3 5 1:1.5 2:.5 3:4 4 4 4:1.5 4:.5 4 3 3 3:.5 3:.5 3 2 2 3 2:2 5:2 3 3 3:2 3 3 3:2 3 5 1:1.5 2:.5 3:4 4 4 4 4 4 3 3 3:.5 3:.5 5 5 4 2 1:4' },
  { n: 'When the Saints Go Marching In', bpm: 112, lv: 2, s: '1 3 4 5:4 1 3 4 5:4 1 3 4 5:2 3 1 3 2:4 3 3 2 1 1 3 5 5 4:4 3 4 5 3 1 2 1:4' },
  { n: 'Row, Row, Row Your Boat', bpm: 100, lv: 2, s: '1:1 1:1 1:.75 2:.25 3:1.5 3:.75 2:.25 3:.75 4:.25 5:3 8:.33 8:.33 8:.34 5:.33 5:.33 5:.34 3:.33 3:.33 3:.34 1:.33 1:.33 1:.34 5:.75 4:.25 3:.75 2:.25 1:3' },
  { n: 'Happy Birthday', bpm: 100, lv: 3, s: '5:.75 5:.25 6 5 8 7:2 5:.75 5:.25 6 5 9 8:2 5:.75 5:.25 12 10 8 7 6:2 11:.75 11:.25 10 8 9 8:3' },
  { n: 'Hot Cross Buns', bpm: 110, lv: 1, s: '3 2 1:2 3 2 1:2 1:.5 1:.5 1:.5 1:.5 2:.5 2:.5 2:.5 2:.5 3 2 1:2' },
  { n: 'London Bridge', bpm: 110, lv: 1, s: '5:1.5 6:.5 5 4 3 4 5:2 2 3 4:2 3 4 5:2 5:1.5 6:.5 5 4 3 4 5 2 5 3 1:2' },
  { n: 'Au Clair de la Lune', bpm: 96, lv: 1, s: '1 1 1 2 3:2 2:2 1 3 2 2 1:4' },
  { n: 'Old MacDonald (first line)', bpm: 110, lv: 1, s: '1 1 1 5 6 6 5:2 3 3 2 2 1:2' },
  { n: 'Oh! Susanna', bpm: 120, lv: 2, s: '1:.5 2:.5 3 5 5:1.5 6:.5 5 3 1:1.5 2:.5 3 3 2 1 2:2 1:.5 2:.5 3 5 5:1.5 6:.5 5 3 1:1.5 2:.5 3 3 2 2 1:2' },
  { n: 'Joy to the World (first lines)', bpm: 100, lv: 2, s: '8 7:.75 6:.25 5:1.5 4:.5 3 2 1:2 5 6:1.5 6:.5 7:1.5 7:.5 8:3' },
  { n: 'We Wish You a Merry Christmas', bpm: 112, lv: 3, s: '5 8 8:.5 9:.5 8:.5 7:.5 6 6 6 9 9:.5 10:.5 9:.5 8:.5 7 5 5 10 10:.5 11:.5 10:.5 9:.5 8 6 5:.5 5:.5 6 9 7 8:2' },
  { n: 'Silent Night', bpm: 80, lv: 3, s: '5:1.5 6:.5 5:1 3:3 5:1.5 6:.5 5:1 3:3 9:2 9:1 7:3 8:2 8:1 5:3 6:2 6:1 8:1.5 7:.5 6:1 5:1.5 6:.5 5:1 3:3 6:2 6:1 8:1.5 7:.5 6:1 5:1.5 6:.5 5:1 3:3 9:2 9:1 11:1.5 9:.5 7:1 8:3 10:3 8:1 5:1 3:1 5:1.5 4:.5 2:1 1:3' },
  { n: 'Amazing Grace (first lines)', bpm: 84, lv: 3, s: '5 8:2 10:.5 8:.5 10:2 9 8:2 6 5:3 5 8:2 10:.5 8:.5 10:2 12 12:3' }
];
const spParse = s => s.trim().split(/\s+/).map(t => { const [d, b] = t.split(':'); return { d: d === 'r' ? null : +d - 1, b: b ? +b : 1 }; });
const spLv = n => { const k = n.filter(x => x[0] >= 0).length; return k <= 40 ? 1 : k <= 100 ? 2 : 3; };
const spSecs = n => { const r = []; let a = 0, b = 0; n.forEach((x, i) => { b += x.b; if (b - 0 >= 8 && i + 1 < n.length) { r.push([a, i]); a = i + 1; b = 0; } }); r.push([a, n.length - 1]); return r; };
const spList = () => SONGS.map(x => ({ n: x.n, bpm: x.bpm, lv: x.lv, notes: spParse(x.s) }))
  .concat((P.my || []).map(x => ({ n: x.n, bpm: x.bpm, lv: 4, lvn: spLv(x.notes), my: 1, key: x.key, notes: x.notes.map(([d, b]) => ({ d: d < 0 ? null : d, b })) })));
const SP = { run: false, song: null, mode: 'wait', idx: 0, vis: 0, t0: 0, hits: null, miss: 0, timers: [], vs: [], raf: 0, fin: false, lastSay: 0, lanes: [], starts: [] };
const spBeatMs = () => 60000 / (SP.song ? SP.song.bpm : DPR.bpm);
const spNoteName = d => d == null ? 'rest' : sp(dNote(dMel(d)));
const spSay = t => { const e = $('#spst'); if (e) e.textContent = t; say(t); };

function spStop(msg) {
  SP.timers.forEach(clearTimeout); SP.timers = []; SP.vs.forEach(duStop); SP.vs = [];
  cancelAnimationFrame(SP.raf); SP.raf = 0; if (SP.run && SP.mode === 'time' && typeof beatStop === 'function') beatStop();
  SP.run = false; if ($('#spg')) { $('#spg').textContent = 'Start playing'; $('#spg').setAttribute('aria-pressed', 'false'); }
  if (msg) spSay(msg); spDraw();
}
function spPlayNote(d, ms) { if (d == null) return; const v = duVoice(DU.mi, dMel(d), duBus().m); SP.vs.push(v); SP.timers.push(setTimeout(() => { duStop(v); SP.vs = SP.vs.filter(x => x !== v); }, Math.max(120, ms))); }
function spPick() {
  const L = spList(), base = L[+$('#spn').value] || L[0], sec = $('#spsec') ? $('#spsec').value : 'all', tf = Math.max(0.5, Math.min(1.2, (+($('#spt') || { value: 100 }).value || 100) / 100));
  let notes = base.notes, n = base.n; if (sec !== 'all') { const r = spSecs(base.notes)[+sec]; if (r) { notes = base.notes.slice(r[0], r[1] + 1); n = base.n + ' (part ' + (+sec + 1) + ')'; } }
  return Object.assign({}, base, { n, notes, base, bpm: Math.max(40, Math.round(base.bpm * tf)) });
}
function spSecFill() { const e = $('#spsec'); if (!e) return; const L = spList(), b = L[+$('#spn').value] || L[0], k = spSecs(b.notes).length; e.innerHTML = '<option value="all">Whole song</option>' + (k > 1 ? Array.from({ length: k }, (_, i) => '<option value="' + i + '">Part ' + (i + 1) + ' of ' + k + '</option>').join('') : ''); }
function spSetup() {
  const s = spPick(); SP.song = s; SP.mode = $('#spm').value;
  let b = 0; SP.starts = s.notes.map(n => { const st = b; b += n.b; return st; }); SP.total = b;
  SP.lanes = [...new Set(s.notes.filter(n => n.d != null).map(n => n.d))].sort((a, c) => a - c);
  if (s.key != null && DU.key !== s.key) { DU.key = s.key; if ($('#dk')) $('#dk').value = s.key; }
  if (DU.minor) { DU.minor = 0; if ($('#dsc')) $('#dsc').value = 0; }
  duOffAll(); duLabel(); DPR.bpm = Math.max(40, Math.min(200, s.bpm)); const r = $('#bpm'); if (r) r.value = DPR.bpm; const o = $('#bpmv'); if (o) o.textContent = DPR.bpm;
}
function spListen() {
  spStop(); spSetup(); SP.run = true; SP.mode = 'listen'; const bm = spBeatMs(); let t = 150;
  SP.song.notes.forEach((n, i) => { SP.timers.push(setTimeout(() => { SP.idx = i; spPlayNote(n.d, n.b * bm * 0.9); }, t)); t += n.b * bm; });
  SP.timers.push(setTimeout(() => { SP.idx = 0; spStop('Finished playing ' + SP.song.n + '.'); }, t + 100));
  spSay('Playing ' + SP.song.n + ' in ' + dName(DU.key) + ' major. Listen, then press Start playing.'); spLoop();
}
function spStart() {
  if (SP.run && SP.mode !== 'listen') { spStop('Stopped.'); return; }
  spStop(); spSetup(); const s = SP.song; SP.idx = 0; SP.vis = 0; SP.miss = 0; SP.fin = false; SP.hits = s.notes.map(() => 0); SP.run = true;
  while (s.notes[SP.idx] && s.notes[SP.idx].d == null) SP.idx++;
  $('#spg').textContent = 'Stop'; $('#spg').setAttribute('aria-pressed', 'true');
  if (SP.mode === 'time') {
    setBpm(s.bpm); if (typeof beatStart === 'function') beatStart(); SP.t0 = performance.now() + 100;
    spSay('Count in: four beats, then play the notes as they reach the line. ' + s.n + ' in ' + dName(DU.key) + ' major.');
    SP.timers.push(setTimeout(() => spFinish(), (SP.total + 5) * spBeatMs() + 400));
  } else spSay((SP.mode === 'hear' ? 'Hear then play. ' : 'Wait for me. ') + 'Play the notes of ' + s.n + ' one after another. ' + spNext());
  if (SP.mode === 'hear') spCue();
  spLoop();
}
function spNext() { const n = SP.song.notes[SP.idx]; if (!n) return ''; return 'Next: ' + spNoteName(n.d) + ', key ' + (DML[n.d] === '[' ? 'left bracket' : DML[n.d] === ']' ? 'right bracket' : DML[n.d]) + '.'; }
function spCue() { const n = SP.song.notes[SP.idx]; if (n) spPlayNote(n.d, 700); }
function spAnnounce() { if ($('#spsay') && $('#spsay').checked) say(spNext()); if (($('#spcue') && $('#spcue').checked) || SP.mode === 'hear') spCue(); }
function spPress(i) {
  if (!SP.run || SP.mode === 'listen' || SP.fin || i < 0) return;
  const s = SP.song, now = performance.now();
  if (SP.mode === 'time') {
    const bm = spBeatMs(), pos = (now - SP.t0) / bm - 4;
    let best = -1, bd = 1e9;
    s.notes.forEach((n, k) => { if (n.d === i && !SP.hits[k]) { const e = Math.abs(SP.starts[k] - pos) * bm; if (e < bd) { bd = e; best = k; } } });
    if (best >= 0 && bd <= 320) { SP.hits[best] = bd <= 130 ? 2 : 1; SP.fx = { d: i, t: now, ok: 1 }; }
    else { SP.miss++; SP.fx = { d: i, t: now, ok: 0 }; }
    return;
  }
  const n = s.notes[SP.idx];
  if (n && n.d === i) {
    SP.hits[SP.idx] = 2; SP.idx++; SP.fx = { d: i, t: now, ok: 1 };
    while (s.notes[SP.idx] && s.notes[SP.idx].d == null) SP.idx++;
    if (SP.idx >= s.notes.length) { spFinish(); return; }
    spAnnounce();
    if (SP.idx % 8 === 0) { const t = $('#spst'); if (t) t.textContent = 'Note ' + SP.idx + ' of ' + s.notes.length + '.'; }
  } else {
    SP.miss++; SP.fx = { d: i, t: now, ok: 0 };
    if (now - SP.lastSay > 700) { SP.lastSay = now; say('Not that one.' + (SP.miss % 3 === 0 ? ' ' + spNext() : '')); }
    if (SP.miss % 3 === 0) spCue();
  }
}
function spMidi(m) {
  if (!SP.run) return false;
  let i = -1; for (let k = 0; k < 12; k++) if (dMel(k) === m) { i = k; break; }
  if (i < 0) for (let k = 0; k < 12; k++) if (((dMel(k) - m) % 12 + 12) % 12 === 0) { i = k; break; }
  if (i >= 0) spPress(i); return true;
}
function spFinish() {
  if (SP.fin) return; SP.fin = true; const s = SP.song, real = s.notes.filter(n => n.d != null).length;
  const hit = s.notes.reduce((a, n, k) => a + (n.d != null && SP.hits[k] ? 1 : 0), 0), acc = Math.round(100 * hit / Math.max(1, real));
  const mode = SP.mode; spStop();
  const stars = acc >= 95 && SP.miss <= 2 ? 3 : acc >= 80 ? 2 : 1;
  P.sg = P.sg || {}; const r = P.sg[s.n] = P.sg[s.n] || { best: 0, plays: 0 }; const was = r.best; r.plays++; r.best = Math.max(r.best, acc);
  pm('duet').xp += stars * 5; save(); if (typeof planDone === 'function') planDone('song');
  spSay('Song finished. You hit ' + hit + ' of ' + real + ' notes, ' + acc + ' percent, with ' + SP.miss + ' wrong ' + (SP.miss === 1 ? 'key' : 'keys') + '. ' + stars + (stars === 1 ? ' star.' : ' stars.') + (acc > was ? ' New best.' : ' Your best is ' + r.best + ' percent.') + (mode === 'time' && acc < 80 ? ' Try Wait for me mode to learn it, then come back.' : ''));
  spStats();
  if ($('#splp') && $('#splp').checked) {
    let up = '';
    if ($('#spup').checked && acc >= 90 && +$('#spt').value < 100) { $('#spt').value = Math.min(100, +$('#spt').value + 5); $('#sptv').textContent = $('#spt').value; up = ' Speeding up to ' + $('#spt').value + ' percent.'; }
    spSay($('#spst').textContent + up + ' Starting again.'); SP.timers.push(setTimeout(() => { if (!SP.run) spStart(); }, 2500));
  }
}
function spStats() {
  const e = $('#spbest'), L = spList(), s = L[+($('#spn') || {}).value]; if (!e || !s) return; const r = (P.sg || {})[s.n];
  e.textContent = r ? 'Your best on this song: ' + r.best + ' percent, played ' + r.plays + (r.plays === 1 ? ' time.' : ' times.') : 'Not played yet.';
}

/* ---- falling notes ---- */
function spLoop() { cancelAnimationFrame(SP.raf); const f = () => { spDraw(); if (SP.run) SP.raf = requestAnimationFrame(f); }; SP.raf = requestAnimationFrame(f); }
function spDraw() {
  const cv = $('#spc'); if (!cv) return; const g = cv.getContext('2d'), W = cv.width, H = cv.height, s = SP.song;
  const css = getComputedStyle(document.body), col = n => css.getPropertyValue(n).trim() || '#888';
  g.clearRect(0, 0, W, H); g.fillStyle = col('--bg'); g.fillRect(0, 0, W, H);
  if (!s || !SP.lanes.length) { g.fillStyle = col('--mute'); g.font = '14px sans-serif'; g.fillText('Choose a song and press Start playing', 16, H / 2); return; }
  const L = SP.lanes, lw = W / L.length, hitY = H - 34, ppb = 56, now = performance.now(), bm = spBeatMs();
  let pos;
  if (SP.mode === 'time' && SP.run) pos = (now - SP.t0) / bm - 4;
  else { const tgt = SP.starts[Math.min(SP.idx, SP.starts.length - 1)] || 0; SP.vis += (tgt - SP.vis) * 0.25; pos = SP.vis; }
  L.forEach((d, i) => { g.fillStyle = i % 2 ? col('--panel') : col('--bg'); g.fillRect(i * lw, 0, lw, H - 28); });
  g.strokeStyle = col('--brass'); g.lineWidth = 2; g.beginPath(); g.moveTo(0, hitY); g.lineTo(W, hitY); g.stroke();
  s.notes.forEach((n, k) => {
    if (n.d == null) return; const li = L.indexOf(n.d), y = hitY - (SP.starts[k] - pos) * ppb, h = Math.max(12, n.b * ppb - 4);
    if (y - h > H || y < -4) return; const cur = SP.run && SP.mode !== 'time' && k === SP.idx, hit = SP.hits && SP.hits[k];
    g.globalAlpha = hit ? 0.35 : 1; g.fillStyle = hit ? col('--ok') : cur ? col('--brass') : col('--blue');
    g.beginPath(); g.roundRect ? g.roundRect(li * lw + 5, y - h, lw - 10, h, 6) : g.rect(li * lw + 5, y - h, lw - 10, h); g.fill(); g.globalAlpha = 1;
  });
  if (SP.fx && now - SP.fx.t < 220) { const li = L.indexOf(SP.fx.d); if (li >= 0) { g.globalAlpha = 1 - (now - SP.fx.t) / 220; g.fillStyle = SP.fx.ok ? col('--ok') : col('--bad'); g.fillRect(li * lw, hitY - 6, lw, 12); g.globalAlpha = 1; } }
  g.fillStyle = col('--ink'); g.font = 'bold 14px sans-serif'; g.textAlign = 'center';
  L.forEach((d, i) => { g.fillText((DML[d] || '?') + '  ' + dNote(dMel(d)).replace(/ \d+$/, ''), i * lw + lw / 2, H - 10); }); g.textAlign = 'left';
  if (SP.mode === 'time' && SP.run && pos < 0) { g.fillStyle = col('--brass'); g.font = 'bold 28px sans-serif'; g.fillText(String(Math.ceil(-pos)), 12, 34); }
}

/* ---- MIDI files ---- */
const mdVlq = n => { const b = [n & 127]; while ((n >>= 7)) b.unshift((n & 127) | 128); return b; };
function mdWrite(evs, bpm, title) {          // evs: { ch, m, t (ms), d (ms), v?, prog? }
  const tk = ms => Math.round(ms * bpm * 480 / 60000), L = [];
  const ch = {}; evs.forEach(e => { ch[e.ch] = e.prog || 0; });
  evs.forEach(e => { const a = tk(e.t), b = Math.max(a + 30, tk(e.t + e.d)), m = Math.max(0, Math.min(127, Math.round(e.m))); L.push([a, 1, 0x90 | e.ch, m, e.v || 90]); L.push([b, 0, 0x80 | e.ch, m, 0]); });
  L.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
  const out = [0, 0xFF, 0x51, 3]; const tp = Math.round(60000000 / bpm); out.push((tp >> 16) & 255, (tp >> 8) & 255, tp & 255);
  const nm = [...(title || 'Staffsounds')].map(c => c.charCodeAt(0) & 127); out.push(0, 0xFF, 0x03, nm.length, ...nm);
  Object.keys(ch).forEach(c => out.push(0, 0xC0 | +c, ch[c]));
  let last = 0; L.forEach(e => { out.push(...mdVlq(e[0] - last), e[2], e[3], e[4]); last = e[0]; });
  out.push(0, 0xFF, 0x2F, 0);
  const n = out.length, h = [0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 1, 0xE0, 0x4d, 0x54, 0x72, 0x6b, (n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  return new Uint8Array(h.concat(out));
}
function mdRead(u) {
  let p = 0; const r8 = () => u[p++], r16 = () => (u[p++] << 8) | u[p++], r32 = () => ((u[p++] << 24) | (u[p++] << 16) | (u[p++] << 8) | u[p++]) >>> 0;
  const tag = () => String.fromCharCode(u[p++], u[p++], u[p++], u[p++]);
  if (tag() !== 'MThd') throw new Error('That is not a MIDI file.'); const hl = r32(); r16(); const nt = r16(), div = r16(); p = 8 + hl;
  if (div & 0x8000) throw new Error('This MIDI file uses timecode timing, which is not supported.');
  const notes = []; let bpm = 0;
  for (let t = 0; t < nt && p < u.length; t++) {
    if (tag() !== 'MTrk') break; const len = r32(), end = p + len; let tick = 0, st = 0; const open = {};
    const vlq = () => { let v = 0, b; do { b = r8(); v = (v << 7) | (b & 127); } while (b & 128 && p < end); return v; };
    while (p < end) {
      tick += vlq(); let b = u[p];
      if (b === 0xFF) { p++; const ty = r8(), l = vlq(); if (ty === 0x51 && !bpm && l === 3) bpm = Math.round(60000000 / ((u[p] << 16) | (u[p + 1] << 8) | u[p + 2])); p += l; if (ty === 0x2F) break; continue; }
      if (b === 0xF0 || b === 0xF7) { p++; p += vlq(); continue; }
      if (b & 128) { st = b; p++; }
      const cmd = st & 0xf0, c = st & 15, a = r8(), v = (cmd === 0xC0 || cmd === 0xD0) ? 0 : r8();
      if (cmd === 0x90 && v > 0) open[c * 128 + a] = tick;
      else if (cmd === 0x80 || (cmd === 0x90 && v === 0)) { const k = c * 128 + a; if (open[k] != null) { notes.push({ m: a, ch: c, tr: t, t: open[k] / div, d: (tick - open[k]) / div }); delete open[k]; } }
    }
    p = end;
  }
  return { bpm: bpm || 120, notes };
}
function spFromMidi(M, name) {
  let N = M.notes.filter(n => n.ch !== 9); if (!N.length) throw new Error('No notes found. Drum-only files cannot become a melody.');
  const G = {}; N.forEach(n => { (G[n.tr + ':' + n.ch] = G[n.tr + ':' + n.ch] || []).push(n); });
  const gs = Object.values(G).map(a => ({ a, avg: a.reduce((s, n) => s + n.m, 0) / a.length })).sort((x, y) => y.a.length - x.a.length);
  const mel = (gs.find(g => g.a.length >= 8 && g.avg >= 55) || gs[0]).a.slice().sort((x, y) => x.t - y.t || y.m - x.m);
  const mono = []; mel.forEach(n => { const l = mono[mono.length - 1]; if (l && n.t - l.t < 0.06) return; mono.push(n); });
  const use = mono.slice(0, 220), MJ = [0, 2, 4, 5, 7, 9, 11], pcs = use.map(n => n.m % 12), key = vsKeyOf(use.map(n => n.m));
  /* a tune ends on its home note: of the major keys that hold the most notes, prefer one whose home note (or relative minor home) is the last note, then the first */
  const fit = t => pcs.filter(p => MJ.includes(((p - t) % 12 + 12) % 12)).length, mx = Math.max(...Array.from({ length: 12 }, (_, t) => fit(t))), cand = [...Array(12).keys()].filter(t => fit(t) === mx);
  const lastP = pcs[pcs.length - 1], firstP = pcs[0], cnt = p => pcs.filter(x => x === p).length;
  const score = t => (lastP === t ? 3 : 0) + (firstP === t ? 2 : 0) + (lastP === (t + 9) % 12 ? 1.5 : 0) + (firstP === (t + 9) % 12 ? 1 : 0) + (cnt(t) + cnt((t + 7) % 12)) / pcs.length;
  let r = cand.slice().sort((a, b) => score(b) - score(a))[0];
  const minorHome = (r + 9) % 12 === lastP && r !== lastP; key.tonic = minorHome ? lastP : r; key.minor = minorHome ? 1 : 0;
  let moved = 0;
  const degs = use.map(n => { const rel = n.m - r, oct = Math.floor(rel / 12), pc = ((rel % 12) + 12) % 12; let bi = 0, bd = 99; MJ.forEach((x, i) => { const d = Math.abs(x - pc); if (d < bd) { bd = d; bi = i; } }); if (bd) moved++; return oct * 7 + bi; });
  const sorted = degs.slice().sort((a, b) => a - b), med = sorted[Math.floor(sorted.length / 2)]; let sh = 0; while (med - sh > 8) sh += 7; while (med - sh < 2) sh -= 7;
  const D = degs.map(d => { d -= sh; while (d > 11) d -= 7; while (d < 0) d += 7; return d; });
  const q = x => Math.max(0.25, Math.round(x * 4) / 4), notes = [];
  use.forEach((n, i) => { const nx = use[i + 1], gap = nx ? nx.t - n.t : n.d, dur = Math.min(q(n.d), q(gap)); notes.push([D[i], Math.min(4, dur)]); const rest = gap - dur; if (nx && rest >= 0.5) notes.push([-1, Math.min(4, q(rest))]); });
  const bpm = Math.max(60, Math.min(200, M.bpm));
  return { n: name, bpm, key: r, notes, moved, total: use.length, keyName: dName(r) + ' major' + (key.minor ? ' (relative to ' + D_SH[key.tonic] + ' minor)' : '') };
}
function spDownload(bytes, name, type) {
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([bytes], { type: type || 'audio/midi' })); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
function spExportSong() {
  const L = spList(), s = L[+$('#spn').value]; if (!s) return; const bm = 60000 / s.bpm, key = s.key != null ? s.key : DU.key, MJ = D_MAJ, evs = []; let t = 0;
  s.notes.forEach(n => { if (n.d != null) evs.push({ ch: 0, m: 60 + key + MJ[((n.d % 7) + 7) % 7] + 12 * Math.floor(n.d / 7), t: t * bm, d: n.b * bm * 0.92 }); t += n.b; });
  spDownload(mdWrite(evs, s.bpm, s.n), s.n.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.mid'); spSay('Downloaded ' + s.n + ' as a MIDI file in ' + dName(key) + ' major.');
}
function spExportPlay(fixed) {
  const src = fixed ? FX.fixed : (FX.ev.length ? fxRaw() : null);
  if (!src || !src.length) { spSay(fixed ? 'Nothing fixed yet. Capture your playing and press Enter in the Pattern fixer first.' : 'Nothing captured yet. Use the Pattern fixer: press slash, play, press slash.'); return; }
  const evs = []; src.forEach(e => e.notes.forEach(m => evs.push({ ch: e.kind === 'mel' ? 0 : 1, prog: e.kind === 'mel' ? 0 : 19, m, t: e.at, d: e.dur * 0.95, v: e.kind === 'mel' ? 95 : 70 })));
  spDownload(mdWrite(evs, DPR.bpm, fixed ? 'Staffsounds corrected' : 'Staffsounds as played'), fixed ? 'my-playing-corrected.mid' : 'my-playing.mid'); spSay('Downloaded your playing' + (fixed ? ' after correction' : ' as you played it') + ' as a MIDI file. Open it in any music program.');
}
async function spImport(file) {
  try {
    const M = mdRead(new Uint8Array(await file.arrayBuffer())), name = file.name.replace(/\.[^.]+$/, '').slice(0, 40), s = spFromMidi(M, name);
    P.my = (P.my || []).filter(x => x.n !== s.n); P.my.push({ n: s.n, bpm: s.bpm, key: s.key, notes: s.notes }); save(); spFill(s.n);
    spSay('Imported ' + name + ': ' + s.total + ' melody notes in ' + s.keyName + (s.moved ? '; ' + s.moved + ' notes outside the key were moved into it' : '') + '. It is at the bottom of the song list.');
  } catch (e) { spSay('I could not read that file. ' + (e && e.message ? e.message : '')); }
}
function spFill(sel) {
  const s = $('#spn'); if (!s) return; const L = spList(), lv = ['Imported', 'Easy', 'Medium', 'Harder'];
  s.innerHTML = L.map((x, i) => '<option value="' + i + '">' + esc(x.n) + ' (' + (x.lv === 4 ? 'mine, ' + lv[x.lvn].toLowerCase() : lv[x.lv]) + ')</option>').join('');
  if (sel) { const i = L.findIndex(x => x.n === sel); if (i >= 0) s.value = i; } spSecFill(); spStats();
}

function spHtml() {
  return '<section class="prac" aria-label="Songs"><h3>Songs: play along with falling notes</h3>' +
    '<p class="total">Pick a song and play it on the melody keys (top row, Q to right bracket) or on a MIDI keyboard. Songs play in the key chosen above, as a major scale. Hold Shift and press the backquote key (to the left of 1) to start or stop.</p>' +
    '<div class="set"><label>Song <select id="spn"></select></label><label>Mode <select id="spm"><option value="wait">Wait for me</option><option value="time">In time with the beat</option><option value="hear">Hear then play</option></select></label>' +
    '<label><input type="checkbox" id="spsay">Say the next note</label><label><input type="checkbox" id="spcue">Play the next note as a cue</label></div>' +
    '<div class="set"><label>Practise <select id="spsec"></select></label><label>Speed <input type="range" id="spt" min="50" max="100" step="5" value="100" style="width:110px"> <output id="sptv">100</output> %</label><label><input type="checkbox" id="splp">Repeat it</label><label><input type="checkbox" id="spup">Speed up when I score 90 or more</label></div>' +
    '<div class="tools stack"><button type="button" id="spl">Hear the song</button><button type="button" id="spg" class="next" aria-pressed="false">Start playing</button></div>' +
    '<canvas id="spc" width="420" height="230" aria-hidden="true" style="width:100%;max-width:520px;border-radius:10px;margin-top:8px"></canvas>' +
    '<p id="spst" class="total" role="status" aria-live="polite">Choose a song, then press Start playing.</p><p id="spbest" class="total"></p>' +
    '<h4>MIDI files</h4><div class="tools stack"><button type="button" id="spdel">Remove this song (only my own)</button><button type="button" id="spx">Download this song (.mid)</button><button type="button" id="spxo">Download my captured playing (.mid)</button><button type="button" id="spxf">Download the corrected version (.mid)</button>' +
    '<label class="ghost" style="cursor:pointer">Import a MIDI file as a song <input type="file" id="spi" accept=".mid,.midi,audio/midi" style="max-width:190px"></label></div></section>';
}
function spWire() {
  SP.run = false; SP.song = null; SP.hits = null; SP.fx = null; SP.timers = []; SP.vs = []; spFill();
  $('#spn').onchange = e => { spStop(); spSecFill(); spSetupQuiet(); spStats(); e.target.blur(); }; $('#spsec').onchange = e => { spStop(); spSetupQuiet(); e.target.blur(); }; $('#spt').oninput = e => { $('#sptv').textContent = e.target.value; if (!SP.run) spSetupQuiet(); }; $('#spm').onchange = e => { spStop(); e.target.blur(); };
  $('#spdel').onclick = () => { const s = spList()[+$('#spn').value]; if (!s || !s.my) { spSay('Only songs you imported or sang can be removed.'); return; } P.my = P.my.filter(x => x.n !== s.n); save(); spFill(); spSetupQuiet(); spSay('Removed ' + s.n + '.'); }; $('#spl').onclick = spListen; $('#spg').onclick = spStart; $('#spx').onclick = spExportSong; $('#spxo').onclick = () => spExportPlay(false); $('#spxf').onclick = () => spExportPlay(true);
  $('#spi').onchange = e => { const f = e.target.files[0]; if (f) spImport(f); e.target.value = ''; };
  spSetupQuiet(); spDraw();
}
function spSetupQuiet() { const s = spPick(); SP.song = s; let b = 0; SP.starts = s.notes.map(n => { const t = b; b += n.b; return t; }); SP.total = b; SP.lanes = [...new Set(s.notes.filter(n => n.d != null).map(n => n.d))].sort((a, c) => a - c); SP.idx = 0; SP.vis = 0; SP.hits = null; spDraw(); }
