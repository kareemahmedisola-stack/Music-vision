/* Staffsounds – Voice studio, part 2: sing along with a song (pitch scoring), fix my recording (gate and leveller),
   headphone check, sing-to-notation, and keyboard shortcuts. Uses the pitch tracker in voice.js and the songs in songs.js. */

/* ---- fix my recording: steady the volume, then clean up ---- */
function vsLevel(x, sr) {
  const n = x.length, w = Math.round(0.03 * sr), y = new Float32Array(n), env = []; let all = [];
  for (let i = 0; i < n; i += w) { let e = 0, c = Math.min(w, n - i); for (let j = 0; j < c; j++) e += x[i + j] * x[i + j]; e = Math.sqrt(e / c); env.push(e); all.push(e); }
  all.sort((a, b) => a - b); const floor = Math.max(0.006, all[Math.floor(all.length * 0.2)] * 2), target = Math.max(0.05, all[Math.floor(all.length * 0.85)] * 0.8);
  let g = 1; const gt = env.map(e => e < floor ? 1 : Math.max(0.5, Math.min(4, target / e)));
  for (let k = 0; k < env.length; k++) { const up = gt[k] > g, rate = up ? 1 - Math.exp(-1 / (0.35 * sr)) : 1 - Math.exp(-1 / (0.08 * sr)); for (let j = 0; j < w && k * w + j < n; j++) { g += (gt[k] - g) * rate; y[k * w + j] = x[k * w + j] * g; } }
  return y;
}
async function vsFix(x, sr) { return vsEnhance(vsLevel(x, sr), sr, { clean: true, warm: 1, presence: 2, air: 1, comp: 0.5, room: 0 }); }

/* ---- sing to notation ---- */
function vsNotes(tr, bpm) {
  const notes = [], fr = tr.hopS, beat = 60 / bpm; let cur = null, off = 0;
  const close = () => { if (cur && cur.n >= 4) { const ms = cur.v.slice().sort((a, b) => a - b), m = Math.round(ms[Math.floor(ms.length / 2)]); notes.push({ m, ch: 0, tr: 0, t: cur.t0 / beat, d: Math.max(0.25, cur.n * fr / beat) }); } cur = null; };
  for (let k = 0; k < tr.n; k++) {
    const m = tr.midi[k], t = tr.t0 + k * fr;
    if (isNaN(m)) { if (cur && ++off > 5) close(); continue; } off = 0;
    if (!cur) { cur = { t0: t, v: [m], n: 1, bad: 0 }; continue; }
    const med = cur.v.slice().sort((a, b) => a - b)[Math.floor(cur.v.length / 2)];
    if (Math.abs(m - med) > 0.8) { if (++cur.bad >= 3) { close(); cur = { t0: t, v: [m], n: 1, bad: 0 }; } } else { cur.bad = 0; cur.v.push(m); cur.n++; }
  }
  close(); return { bpm, notes };
}
function vsNotate(t, tr) {
  const bpm = Math.max(60, Math.min(200, +($('#vnb') || {}).value || DPR.bpm)), M = vsNotes(tr, bpm);
  if (M.notes.length < 3) { vsStatus('I found fewer than three clear notes. Sing slowly, one note at a time, with a short gap between notes.'); return; }
  const s = spFromMidi(M, t.name.slice(0, 36) + ' (sung)');
  P.my = (P.my || []).filter(x => x.n !== s.n); P.my.push({ n: s.n, bpm: s.bpm, key: s.key, notes: s.notes }); save(); if (typeof spFill === 'function') spFill();
  const names = M.notes.slice(0, 24).map(n => vsNote(n.m)).join(', ');
  $('#vnr').innerHTML = '<p>I wrote down ' + M.notes.length + ' notes in ' + esc(s.keyName) + ' at ' + bpm + ' beats a minute.' + (s.moved ? ' ' + s.moved + ' stray notes were moved into the key.' : '') + '</p><p>First notes: ' + esc(names) + (M.notes.length > 24 ? ', and more' : '') + '.</p><div class="tools stack"><button type="button" id="vnx">Download as a MIDI file</button></div>';
  $('#vnx').onclick = () => { const bm = 60000 / bpm; spDownload(mdWrite(M.notes.map(n => ({ ch: 0, m: n.m, t: n.t * bm, d: n.d * bm * 0.92 })), bpm, s.n), 'my-singing.mid'); };
  vsStatus('Turned ' + t.name + ' into a song with ' + M.notes.length + ' notes. It is now in the Songs list in the Keyboard duet, and you can download it as MIDI.');
}

/* ---- headphone check ---- */
async function hpCheck() {
  const out = t => { const e = $('#rst'); if (e) e.textContent = t; say(t); };
  if (REC) { out('Stop recording first.'); return; }
  let st;
  try { st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch (e) { out('The browser would not open the microphone (' + (e && e.name || 'error') + '). Allow it, then try again.'); return; }
  const a = ctx(); try { await a.resume(); } catch (e) {}
  const src = a.createMediaStreamSource(st), an = a.createAnalyser(); an.fftSize = 8192; src.connect(an);
  const bin = Math.round(1000 / (a.sampleRate / an.fftSize)), fd = new Float32Array(an.frequencyBinCount), read = () => { an.getFloatFrequencyData(fd); let nb = 0; for (let i = bin - 40; i < bin - 10; i++) nb += fd[i]; nb /= 30; let pk = -200; for (let i = bin - 2; i <= bin + 2; i++) pk = Math.max(pk, fd[i]); return pk - nb; };
  out('Checking for sound leaking from your speakers into the microphone. Stay quiet for two seconds.');
  await new Promise(r => setTimeout(r, 700)); const base = read();
  const o = a.createOscillator(), g = a.createGain(); o.frequency.value = 1000; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0, a.currentTime); g.gain.linearRampToValueAtTime(0.2 * Math.max(0.3, VOL), a.currentTime + 0.05); o.start();
  await new Promise(r => setTimeout(r, 900)); let best = -99; for (let i = 0; i < 6; i++) { best = Math.max(best, read()); await new Promise(r => setTimeout(r, 100)); }
  g.gain.linearRampToValueAtTime(0, a.currentTime + 0.05); setTimeout(() => { try { o.stop(); } catch (e) {} }, 150); src.disconnect(); st.getTracks().forEach(t => t.stop());
  const lift = best - base;
  out(lift > 18 ? 'I can hear your speakers through the microphone (' + Math.round(lift) + ' decibels). Put on headphones, or turn the volume down, before recording your voice with instruments or a backing take. Otherwise the voice will sound thin and pumping.' : 'Good: the microphone did not pick up the speakers (' + Math.round(Math.max(0, lift)) + ' decibels). You can record your voice with a backing take.');
}

/* ---- sing along ---- */
const SG = { run: false };
function sgTonic(song, center) {
  let best = null;
  for (let t = 0; t < 12; t++) for (const base of [36, 48, 60]) { const ms = song.notes.filter(n => n.d != null).map(n => base + t + D_MAJ[((n.d % 7) + 7) % 7] + 12 * Math.floor(n.d / 7)).sort((a, b) => a - b), med = ms[Math.floor(ms.length / 2)], lo = ms[0], hi = ms[ms.length - 1], sc = Math.abs(med - center) + Math.max(0, center - 9 - lo) + Math.max(0, hi - center - 9); if (!best || sc < best.sc) best = { sc, tonic: base + t }; }
  return best.tonic;
}
function sgStop(msg) {
  const r = SG.run && SG; SG.run = false; cancelAnimationFrame(SG.raf);
  if (r) { try { SG.stream.getTracks().forEach(t => t.stop()); SG.src.disconnect(); } catch (e) {} (SG.timers || []).forEach(clearTimeout); (SG.vs || []).forEach(duStop); }
  const b = $('#sgg'); if (b) { b.textContent = '● Start singing along'; b.setAttribute('aria-pressed', 'false'); }
  if (msg) vsStatus(msg);
}
async function sgStart() {
  if (SG.run) return sgStop('Stopped.');
  if (VL) vsStop();
  const L = spList(), song = L[+$('#sgn').value] || L[0], center = +$('#sgv').value, tonic = $('#sgk').value === 'auto' ? sgTonic(song, center) : (() => { const t = +$('#sgk').value; let m = 48 + t; while (m + 5 < center - 4) m += 12; while (m > center) m -= 12; return m; })();
  const tf = +$('#sgt').value / 100, bpm = song.bpm * tf, beat = 60 / bpm;
  let stream; try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }); } catch (e) { vsStatus('The browser would not open the microphone (' + (e && e.name || 'error') + '). Allow it and try again.'); return; }
  const a = ctx(); try { await a.resume(); } catch (e) {}
  const src = a.createMediaStreamSource(stream), an = a.createAnalyser(); an.fftSize = 2048; src.connect(an);
  let b = 0; const ev = []; song.notes.forEach(n => { if (n.d != null) ev.push({ s: b, e: b + n.b, m: tonic + D_MAJ[((n.d % 7) + 7) % 7] + 12 * Math.floor(n.d / 7), f: 0, ok: 0 }); b += n.b; });
  const total = b, lo = Math.min(...ev.map(e => e.m)) - 3, hi = Math.max(...ev.map(e => e.m)) + 3;
  Object.assign(SG, { run: true, stream, src, an, ev, t0: performance.now() + 100, beat, total, timers: [], vs: [], buf: new Float32Array(2048), act: 0, ok: 0, errSum: 0, errN: 0, trail: [], lastCoach: 0, off: 0 });
  const D = Math.max(1, Math.round(a.sampleRate / 11025)), fs = a.sampleRate / D, ds = new Float32Array(Math.floor(2048 / D)), W = 256, tauMax = Math.floor(fs / 70), tauMin = Math.floor(fs / 900);
  $('#sgg').textContent = '■ Stop'; $('#sgg').setAttribute('aria-pressed', 'true');
  vsStatus('Get ready. Four clicks, then sing ' + song.n + '. The first note is ' + sp(vsNote(ev[0].m)) + '.');
  FORCE = true; for (let i = 0; i < 4; i++) tone(i ? 84 : 91, 0.1 + i * beat, 0.08, 0.3); FORCE = false;
  if ($('#sgref').checked) ev.forEach(e => { SG.timers.push(setTimeout(() => { const v = duVoice(DU.mi, e.m, duBus().m); SG.vs.push(v); SG.timers.push(setTimeout(() => duStop(v), (e.e - e.s) * beat * 850)); }, 100 + (4 + e.s) * beat * 1000)); });
  else SG.timers.push(setTimeout(() => { const v = duVoice(DU.mi, ev[0].m, duBus().m); SG.vs.push(v); SG.timers.push(setTimeout(() => duStop(v), 700)); }, 100 + 3.2 * beat * 1000));
  const cv = $('#sgc'), x = cv.getContext('2d'), W2 = cv.width, H2 = cv.height, px = 90, ppb = 70, Y = v => H2 - 8 - (v - lo) / (hi - lo) * (H2 - 16), col = n => getComputedStyle(document.body).getPropertyValue(n).trim() || '#888';
  (function loop() {
    if (!SG.run) return; const now = performance.now(), pos = (now - SG.t0) / 1000 / beat - 4;
    an.getFloatTimeDomainData(SG.buf); for (let i = 0; i < ds.length; i++) { let s = 0; for (let j = 0; j < D; j++) s += SG.buf[i * D + j]; ds[i] = s / D; }
    let e0 = 0; for (let i = 0; i < W; i++) e0 += ds[i] * ds[i]; e0 = Math.sqrt(e0 / W); let m = NaN;
    if (e0 > 0.008) { const r = vsYield && vsYin(ds, 0, W, tauMin, tauMax, fs); if (r && r.conf > 0.75) m = vsMidi(r.f0); }
    SG.trail.push([pos, m]); while (SG.trail.length > 400) SG.trail.shift();
    const cur = ev.find(q => pos >= q.s && pos < q.e);
    if (cur) { cur.f++; SG.act++; if (!isNaN(m)) { let d = ((m - cur.m + 6) % 12 + 12) % 12 - 6; SG.errSum += d; SG.errN++; if (Math.abs(d) <= 0.5) { cur.ok++; SG.ok++; }
      if ($('#sgco').checked && Math.abs(d) > 0.35 && now - SG.lastCoach > 2800) { SG.lastCoach = now; say('A little ' + (d < 0 ? 'flat' : 'sharp') + ' on ' + sp(vsNote(cur.m))); } } }
    x.fillStyle = col('--bg'); x.fillRect(0, 0, W2, H2);
    const A = vsAllowed(tonic % 12, 'maj'); for (let v = Math.ceil(lo); v <= hi; v++) { x.strokeStyle = A[((v % 12) + 12) % 12] ? 'rgba(138,151,173,.35)' : 'rgba(138,151,173,.1)'; x.beginPath(); x.moveTo(0, Y(v)); x.lineTo(W2, Y(v)); x.stroke(); }
    ev.forEach(q => { const x1 = px + (q.s - pos) * ppb, x2 = px + (q.e - pos) * ppb; if (x2 < 0 || x1 > W2) return; x.fillStyle = q === cur ? col('--brass') : col('--blue'); x.globalAlpha = q.e < pos ? 0.35 : 1; x.fillRect(x1, Y(q.m) - 7, Math.max(4, x2 - x1 - 2), 14); x.globalAlpha = 1; });
    x.strokeStyle = col('--ink'); x.beginPath(); x.moveTo(px, 0); x.lineTo(px, H2); x.stroke();
    x.fillStyle = col('--ok'); SG.trail.forEach(([p, v]) => { if (isNaN(v)) return; const xx = px + (p - pos) * ppb; if (xx < 0) return; x.fillRect(xx, Y(Math.max(lo, Math.min(hi, v))) - 2, 3, 4); });
    if (pos < 0) { x.fillStyle = col('--brass'); x.font = 'bold 28px sans-serif'; x.fillText(String(Math.ceil(-pos)), 12, 34); }
    const nn = $('#vsnow'); if (nn && cur && !isNaN(m)) nn.textContent = 'Aim for ' + vsNote(cur.m) + '. You: ' + vsNote(m);
    if (pos > total + 1) { sgFinish(song); return; }
    SG.raf = requestAnimationFrame(loop);
  })();
}
function sgFinish(song) {
  const ev = SG.ev, act = SG.act, ok = SG.ok, pct = Math.round(100 * ok / Math.max(1, act)), sung = ev.filter(q => q.f && q.ok / q.f >= 0.5).length, avg = SG.errN ? SG.errSum / SG.errN : 0, tend = Math.abs(avg) < 0.12 ? 'You were centred on the pitch.' : 'On average you were a little ' + (avg < 0 ? 'flat' : 'sharp') + ' (' + Math.round(Math.abs(avg) * 100) + ' cents).';
  const stars = pct >= 85 ? 3 : pct >= 65 ? 2 : 1; P.sing = P.sing || {}; const r = P.sing[song.n] = P.sing[song.n] || { best: 0, plays: 0 }, was = r.best; r.plays++; r.best = Math.max(r.best, pct); pm('duet').xp += stars * 5; save();
  if (typeof planDone === 'function') planDone('sing');
  sgStop('Finished ' + song.n + '. You were in tune for ' + pct + ' percent of the time, and ' + sung + ' of ' + ev.length + ' notes were sung in tune. ' + tend + ' ' + stars + (stars === 1 ? ' star.' : ' stars.') + (pct > was ? ' New best.' : ' Your best is ' + r.best + ' percent.'));
}

/* ---- screen parts and keys ---- */
function vsExtraHtml() {
  const L = spList(), o = (v, t, s) => '<option value="' + v + '"' + (s ? ' selected' : '') + '>' + t + '</option>';
  return '<section class="prac" aria-label="Fix my recording"><h3>3. Fix my recording, or write it down</h3><p class="total">One button that steadies the volume, cuts the hiss between phrases and gives a gentle polish.</p>' +
    '<div class="tools stack"><button type="button" id="vfx" class="next">Fix my recording into a new recording</button></div>' +
    '<h4>Sing to notation</h4><p class="total">Sing one note at a time. The game writes down your tune, turns it into a song you can play, and gives you a MIDI file.</p><div class="set"><label>Tempo <input type="number" id="vnb" min="60" max="200" value="' + DPR.bpm + '" style="width:70px;font:inherit;padding:6px 8px;border-radius:8px;border:2px solid var(--line);background:var(--panel);color:var(--ink)"> beats a minute</label></div>' +
    '<div class="tools stack"><button type="button" id="vnt">Turn my recording into notes and a song</button></div><div id="vnr"></div></section>' +
    '<section class="prac" aria-label="Sing along"><h3>4. Sing along with a song</h3><p class="total">Pick a song and sing it. Bars scroll towards the line, and your pitch is scored. The game chooses the key that sits in your voice. Wear headphones if you turn on the guide melody.</p>' +
    '<div class="set"><label>Song <select id="sgn">' + L.map((s, i) => o(i, esc(s.n), 0)).join('') + '</select></label><label>My voice <select id="sgv">' + o(69, 'Soprano', 0) + o(62, 'Alto', 0) + o(57, 'Tenor', 1) + o(48, 'Bass', 0) + '</select></label>' +
    '<label>Key <select id="sgk">' + o('auto', 'Best for my voice', 1) + D_SH.map((n, i) => o(i, n, 0)).join('') + '</select></label><label>Speed <input type="range" id="sgt" min="50" max="100" step="5" value="80" style="width:110px"> <output>80</output> %</label>' +
    '<label><input type="checkbox" id="sgref">Play the melody as a guide</label><label><input type="checkbox" id="sgco">Say when I am flat or sharp</label></div>' +
    '<canvas id="sgc" width="420" height="190" aria-hidden="true" style="width:100%;max-width:520px;border-radius:10px"></canvas>' +
    '<div class="tools stack"><button type="button" id="sgg" class="next" aria-pressed="false">● Start singing along</button></div></section>' +
    '<p class="total">Keys on this screen: L listen, A analyse, T tune, E enhance, C choir, F fix, N notes, S sing along, left and right bracket to pick the previous or next recording.</p>';
}
function vsExtraWire() {
  $('#vfx').onclick = () => vsDo('fix'); $('#vnt').onclick = () => vsDo('notate'); $('#sgg').onclick = sgStart;
  $('#sgt').oninput = e => { e.target.parentNode.querySelector('output').textContent = e.target.value; };
  ['sgn', 'sgv', 'sgk'].forEach(i => { $('#' + i).onchange = e => e.target.blur(); });
  const lastS = (P.sing || {}); void lastS;
}
function vsKey(e) {
  const c = e.code, f = document.activeElement, tg = f && f.tagName; if (e.repeat || e.shiftKey) return false;
  if (tg === 'INPUT' && f.type !== 'checkbox') return false;
  const go = fn => { e.preventDefault(); fn(); return true; };
  if (c === 'KeyL') return go(vsListen); if (c === 'KeyA') return go(() => vsDo('analyse')); if (c === 'KeyT') return go(() => vsDo('tune')); if (c === 'KeyE') return go(() => vsDo('enhance'));
  if (c === 'KeyC') return go(() => vsDo('choir')); if (c === 'KeyF') return go(() => vsDo('fix')); if (c === 'KeyN') return go(() => vsDo('notate')); if (c === 'KeyS') return go(sgStart);
  if (c === 'BracketLeft' || c === 'BracketRight') return go(() => { const s = $('#vst'); if (!s || !s.options.length) return; s.selectedIndex = (s.selectedIndex + (c === 'BracketRight' ? 1 : s.options.length - 1)) % s.options.length; vsStatus('Recording: ' + s.options[s.selectedIndex].textContent); });
  return false;
}
