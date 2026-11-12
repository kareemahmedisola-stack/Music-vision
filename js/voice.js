/* Staffsounds – Voice studio.
   • Listens to you sing and shows your pitch live, then suggests your voice type, comfortable range and the keys that suit you.
   • Fixes stray pitches in a recording (auto-tune): each note moves to the nearest note of the key, with strength, speed and vibrato controls.
   • Voice enhancer: clean-up, warmth, presence, air, compression and room.
   • Choir maker: turns one voice into a choir (soprano, alto, tenor, bass, any or all) with chord-based harmony.
   All processing runs in the browser. Pitch tracking is YIN; pitch changes use PSOLA (pitch-synchronous overlap-add). */

const VS_MAJ = [0, 2, 4, 5, 7, 9, 11], VS_MIN = [0, 2, 3, 5, 7, 8, 10];
const VS_KP = { maj: [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88], min: [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17] };
const VS_TYPES = [['Bass', 50, 'E2 to E4'], ['Baritone', 55, 'A2 to A4'], ['Tenor', 60, 'C3 to C5'], ['Alto', 65, 'F3 to F5'], ['Mezzo-soprano', 69, 'A3 to A5'], ['Soprano', 74, 'C4 to C6']];
const VS_PARTS = { S: ['Soprano', 60, 81, 69], A: ['Alto', 53, 74, 62], T: ['Tenor', 47, 67, 55], B: ['Bass', 36, 55, 45] };
const vsNote = m => { const r = Math.round(m); return D_SH[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1); };
const vsFlatNote = m => { const r = Math.round(m); return D_FL[((r % 12) + 12) % 12] + (Math.floor(r / 12) - 1); };
const vsPc = m => ((Math.round(m) % 12) + 12) % 12;
const vsMidi = f => 69 + 12 * Math.log2(f / 440);
const vsYield = () => new Promise(r => setTimeout(r, 20));

/* ---------------------------------------------------------------- pitch tracking (YIN) */
function vsYin(y, pos, W, tauMin, tauMax, fs) {
  const d = new Float32Array(tauMax + 2), dn = new Float32Array(tauMax + 2); let run = 0; dn[0] = 1;
  for (let tau = 1; tau <= tauMax; tau++) {
    let s = 0; for (let j = 0; j < W; j++) { const v = y[pos + j] - y[pos + j + tau]; s += v * v; }
    d[tau] = s; run += s; dn[tau] = run ? s * tau / run : 1;
  }
  let tau = -1;
  for (let t = Math.max(2, tauMin); t < tauMax; t++) if (dn[t] < 0.15) { while (t + 1 < tauMax && dn[t + 1] < dn[t]) t++; tau = t; break; }
  if (tau < 0) { let m = Math.max(2, tauMin); for (let t = m; t < tauMax; t++) if (dn[t] < dn[m]) m = t; if (dn[m] > 0.3) return null; tau = m; }
  const a = dn[tau - 1], b = dn[tau], c = dn[tau + 1], den = a + c - 2 * b, sh = den ? 0.5 * (a - c) / den : 0;
  return { f0: fs / (tau + sh), conf: 1 - dn[tau] };
}
function vsDown(x, sr) {
  const D = Math.max(1, Math.round(sr / 11025)), n = Math.floor(x.length / D), y = new Float32Array(n);
  for (let i = 0; i < n; i++) { let s = 0; for (let j = 0; j < D; j++) s += x[i * D + j]; y[i] = s / D; }
  return { y, D, fs: sr / D };
}
/* a whole recording: one pitch estimate (Hz, 0 = none) every 10 ms */
function vsTrack(x, sr) {
  const { y, D, fs } = vsDown(x, sr), hop = Math.max(1, Math.round(0.01 * fs)), W = Math.round(0.03 * fs), tauMax = Math.floor(fs / 70), tauMin = Math.floor(fs / 900);
  const n = Math.max(0, Math.floor((y.length - W - tauMax - 2) / hop)), f0 = new Float32Array(n), rms = new Float32Array(n);
  for (let k = 0; k < n; k++) {
    const pos = k * hop; let e = 0; for (let j = 0; j < W; j++) e += y[pos + j] * y[pos + j]; e = Math.sqrt(e / W); rms[k] = e;
    if (e < 0.006) continue;
    const r = vsYin(y, pos, W, tauMin, tauMax, fs); if (r && r.conf > 0.7) f0[k] = r.f0;
  }
  /* median filter in MIDI to remove octave jumps and glitches, then drop runs shorter than 3 frames */
  const mid = new Float32Array(n).fill(NaN);
  for (let k = 0; k < n; k++) if (f0[k] > 0) mid[k] = vsMidi(f0[k]);
  const out = new Float32Array(n).fill(NaN);
  for (let k = 0; k < n; k++) { if (isNaN(mid[k])) continue; const w = []; for (let j = -2; j <= 2; j++) if (k + j >= 0 && k + j < n && !isNaN(mid[k + j])) w.push(mid[k + j]); w.sort((a, b) => a - b); out[k] = w[w.length >> 1]; }
  for (let k = 0, s = -1; k <= n; k++) { const v = k < n && !isNaN(out[k]); if (v && s < 0) s = k; if (!v && s >= 0) { if (k - s < 3) for (let j = s; j < k; j++) out[j] = NaN; s = -1; } }
  const f = new Float32Array(n); for (let k = 0; k < n; k++) f[k] = isNaN(out[k]) ? 0 : 440 * Math.pow(2, (out[k] - 69) / 12);
  return { f0: f, midi: out, hopS: hop * D, t0: Math.round(W / 2) * D, n, sr };
}

/* ---------------------------------------------------------------- analysis: range, voice type, key */
function vsKeyOf(vals) {
  const h = new Array(12).fill(0); vals.forEach(m => { h[vsPc(m)]++; });
  const corr = (p, r) => { const a = [], n = 12; for (let i = 0; i < n; i++) a.push(h[(i + r) % 12]); const ma = a.reduce((s, v) => s + v, 0) / n, mp = p.reduce((s, v) => s + v, 0) / n; let nu = 0, da = 0, dp = 0; for (let i = 0; i < n; i++) { nu += (a[i] - ma) * (p[i] - mp); da += (a[i] - ma) ** 2; dp += (p[i] - mp) ** 2; } return da && dp ? nu / Math.sqrt(da * dp) : 0; };
  let best = { tonic: 0, minor: 0, r: -2 };
  for (let t = 0; t < 12; t++) { const a = corr(VS_KP.maj, t), b = corr(VS_KP.min, t); if (a > best.r) best = { tonic: t, minor: 0, r: a }; if (b > best.r) best = { tonic: t, minor: 1, r: b }; }
  return best;
}
function vsAnalyse(vals) {
  if (vals.length < 30) return null;
  const s = [...vals].sort((a, b) => a - b), q = p => s[Math.min(s.length - 1, Math.floor(p * s.length))], med = q(.5), lo = q(.1), hi = q(.9);
  const type = VS_TYPES.reduce((b, t) => Math.abs(t[1] - med) < Math.abs(b[1] - med) ? t : b), key = vsKeyOf(vals);
  const sc = key.minor ? VS_MIN : VS_MAJ, fits = vals.filter(m => sc.includes(((vsPc(m) - key.tonic) + 12) % 12)).length / vals.length;
  const tun = vals.filter(m => Math.abs(m - Math.round(m)) < 0.25).length / vals.length;
  /* the best tonic: a note in the lower part of your comfortable range, so a tune that climbs an octave still fits */
  const target = lo + 0.25 * (hi - lo), cands = [];
  for (let pc = 0; pc < 12; pc++) { let m = pc + 12 * Math.round((target - pc) / 12); cands.push({ pc, m, d: Math.abs(m - target) }); }
  cands.sort((a, b) => a.d - b.d);
  return { p5: q(.05), p95: q(.95), lo, hi, med, type, key, fits, tun, keys: cands.slice(0, 3) };
}
const vsKeyName = (pc, minor) => (PREFFLAT(pc, minor) ? D_FL : D_SH)[pc] + (minor ? ' minor' : ' major');
const PREFFLAT = (pc, minor) => minor ? [0, 2, 5, 7, 10].includes(pc) : [5, 10, 3, 8, 1].includes(pc);
function vsReport(a) {
  if (!a) return '<p>I did not hear enough singing. Sing a few phrases, close to the microphone, and try again.</p>';
  const k = a.keys;
  return '<ul>' +
    `<li><b>Voice type:</b> closest to ${a.type[0]} (typical range ${a.type[2]}). Your singing centres on ${vsNote(a.med)}.</li>` +
    `<li><b>Range you used:</b> ${vsNote(a.p5)} to ${vsNote(a.p95)}. Comfortable zone: ${vsNote(a.lo)} to ${vsNote(a.hi)}.</li>` +
    `<li><b>Key you sang in:</b> ${vsKeyName(a.key.tonic, a.key.minor)} (${Math.round(a.fits * 100)} percent of your notes fit it).</li>` +
    `<li><b>Pitch accuracy:</b> ${Math.round(a.tun * 100)} percent of your sung time was within a quarter of a semitone of a note.</li>` +
    `<li><b>Keys that suit your voice:</b> ${k.map(c => vsKeyName(c.pc, 0)).join(', ')}. Start a tune on ${vsNote(k[0].m)} or nearby and an octave of melody sits inside your comfortable range.</li></ul>` +
    `<div class="tools stack"><button type="button" id="vsuse" data-pc="${k[0].pc}">Use ${vsKeyName(k[0].pc, 0)} in the duet and songs</button>` +
    (a.key.tonic !== k[0].pc || a.key.minor ? `<button type="button" id="vsuse2" data-pc="${a.key.tonic}" data-minor="${a.key.minor}">Use the key I sang in: ${vsKeyName(a.key.tonic, a.key.minor)}</button>` : '') + '</div>';
}

/* ---------------------------------------------------------------- pitch correction */
const vsAllowed = (tonic, scale) => { const A = new Array(12).fill(false); if (scale === 'chrom') return A.fill(true); (scale === 'min' ? VS_MIN : VS_MAJ).forEach(i => { A[(tonic + i) % 12] = true; }); return A; };
function vsNearest(m, A, prev) {
  if (prev != null && A[((prev % 12) + 12) % 12] && Math.abs(m - prev) < 0.7) return prev;       // hysteresis: stay on a note until clearly leaving it
  let best = null; const r = Math.round(m);
  for (let c = r - 3; c <= r + 3; c++) if (A[((c % 12) + 12) % 12] && (best === null || Math.abs(c - m) < Math.abs(best - m))) best = c;
  return best == null ? r : best;
}
/* shift in semitones for every frame so each note lands on the key */
function vsShifts(mid, A, strength, vib, speedMs) {
  const n = mid.length, sh = new Float32Array(n), tgt = new Float32Array(n).fill(NaN), tau = speedMs / 10, al = tau > 0.5 ? 1 - Math.exp(-1 / tau) : 1;
  let prevT = null, prevS = 0, inRun = false;
  for (let k = 0; k < n; k++) {
    if (isNaN(mid[k])) { inRun = false; prevT = null; continue; }
    let s = 0, c = 0; for (let j = -4; j <= 4; j++) if (k + j >= 0 && k + j < n && !isNaN(mid[k + j])) { s += mid[k + j]; c++; }
    const cen = s / c, T = vsNearest(cen, A, prevT); prevT = T; tgt[k] = T;
    const want = (T - cen) * strength + (vib - 1) * (mid[k] - cen);
    prevS = inRun ? prevS + al * (want - prevS) : want; inRun = true; sh[k] = prevS;
  }
  return { sh, tgt };
}

/* ---------------------------------------------------------------- PSOLA pitch shifter */
function vsPsola(x, tr, shiftAt) {
  const sr = tr.sr, len = x.length, un = Math.round(0.008 * sr), marks = [];
  const fAt = t => { const k = Math.round((t - tr.t0) / tr.hopS); return k >= 0 && k < tr.n ? tr.f0[k] : 0; };
  let cur = 0, pv = false;
  while (cur < len) {
    const f = fAt(cur);
    if (f > 0) {
      const T = sr / f; let a = pv ? Math.round(cur - 0.25 * T) : Math.round(cur), b = pv ? Math.round(cur + 0.25 * T) : Math.round(cur + T), p = Math.max(0, a);
      let mx = -Infinity; for (let i = Math.max(0, a); i <= Math.min(len - 1, b); i++) if (x[i] > mx) { mx = x[i]; p = i; }
      marks.push({ p, T, v: 1 }); cur = p + T; pv = true;
    } else { marks.push({ p: Math.round(cur), T: un, v: 0 }); cur += un; pv = false; }
  }
  const out = new Float32Array(len), wa = new Float32Array(len); let t = 0, mi = 0;
  while (t < len && marks.length) {
    while (mi + 1 < marks.length && Math.abs(marks[mi + 1].p - t) <= Math.abs(marks[mi].p - t)) mi++;
    const m = marks[mi], r = m.v ? Math.pow(2, shiftAt(t) / 12) : 1, L = Math.max(4, Math.round(m.T)), tc = Math.round(t);
    for (let j = -L; j <= L; j++) { const oi = tc + j, ii = m.p + j; if (oi < 0 || oi >= len || ii < 0 || ii >= len) continue; const w = 0.5 + 0.5 * Math.cos(Math.PI * j / L); out[oi] += x[ii] * w; wa[oi] += w; }
    t += m.v ? m.T / r : m.T;
  }
  for (let i = 0; i < len; i++) out[i] /= Math.max(wa[i], 0.35);
  return out;
}
const vsShiftFn = (tr, sh) => t => { const f = (t - tr.t0) / tr.hopS, k = Math.floor(f); if (k < 0 || k >= tr.n - 1) return k >= 0 && k < tr.n ? sh[k] : 0; return sh[k] + (sh[k + 1] - sh[k]) * (f - k); };

function vsAutotune(x, tr, o) {
  const A = vsAllowed(o.tonic, o.scale), r = vsShifts(tr.midi, A, o.strength, o.vib, o.speed);
  return { y: vsPsola(x, tr, vsShiftFn(tr, r.sh)), moved: r };
}

/* ---------------------------------------------------------------- the choir */
const vsScaleOf = minor => minor ? VS_MIN : VS_MAJ;
function vsChoirPlan(tr, cMidi, o) {
  const n = tr.n, sc = vsScaleOf(o.minor), chordOf = d => [0, 2, 4].map(i => (o.tonic + sc[(d + i) % 7]) % 12);
  const degOf = pc => { let b = 0, bd = 99; sc.forEach((s, i) => { const d = Math.min(((pc - o.tonic - s) + 12) % 12, ((o.tonic + s - pc) + 12) % 12); if (d < bd) { bd = d; b = i; } }); return b; };
  /* notes: runs of frames on the same rounded pitch (short gaps joined) */
  const segs = []; let cur = null, gap = 0;
  for (let k = 0; k < n; k++) {
    if (isNaN(cMidi[k])) { if (cur && ++gap > 6) { cur = null; } continue; }
    const r = Math.round(cMidi[k]);
    if (cur && cur.note === r) { cur.k1 = k; gap = 0; } else { cur = { k0: k, k1: k, note: r }; segs.push(cur); gap = 0; }
  }
  const good = segs.filter(s => s.k1 - s.k0 >= 4);
  good.forEach((s, i) => { s.deg = degOf(vsPc(s.note)); });
  const D2C = [0, 4, 0, 3, 0, 3, 4];
  good.forEach((s, i) => { let c = D2C[s.deg]; if (s.deg === 4 && good[i + 1] && good[i + 1].deg === 0) c = 4; s.chord = chordOf(c); s.root = (o.tonic + sc[c]) % 12; });
  const slots = ['S', 'A', 'T', 'B'], lead = o.lead, added = slots.filter(p => o.parts.includes(p) && p !== lead), prev = {};
  good.forEach(s => {
    s.t = {}; const taken = [s.note];
    slots.forEach(p => {
      if (!added.includes(p)) return;
      const [, lo, hi, ctr] = VS_PARTS[p]; let c = [];
      for (let m = lo; m <= hi; m++) if (p === 'B' ? ((m % 12) === s.root) : s.chord.includes(m % 12)) c.push(m);
      const above = slots.indexOf(p) < slots.indexOf(lead);
      let f = c.filter(m => above ? m > s.note : m < s.note); if (!f.length) f = c.filter(m => above ? m >= s.note : m <= s.note); if (!f.length) f = c;
      if (!f.length) return;
      const sc2 = m => (prev[p] != null ? Math.abs(m - prev[p]) : 0) + 0.3 * Math.abs(m - ctr) + (taken.includes(m) ? 3 : 0);
      const pick = f.reduce((b, m) => sc2(m) < sc2(b) ? m : b, f[0]); s.t[p] = pick; prev[p] = pick; taken.push(pick);
    });
  });
  return { segs: good, added };
}
function vsReverb(a, sr, secs) {
  const n = Math.floor(sr * secs), b = a.createBuffer(2, n, sr);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); let lp = 0; for (let i = 0; i < n; i++) { const e = Math.pow(1 - i / n, 2.6); lp += 0.5 * ((Math.random() * 2 - 1) - lp); d[i] = lp * e * (i < 400 ? i / 400 : 1); } }
  return b;
}
async function vsMixdown(chans, sr, wet, secs) {
  const n = chans[0].length, tail = wet > 0 ? Math.floor(sr * secs * 0.7) : 0, oc = new OfflineAudioContext(2, n + tail, sr), b = oc.createBuffer(2, n, sr);
  b.copyToChannel(chans[0], 0); b.copyToChannel(chans[1], 1);
  const s = oc.createBufferSource(); s.buffer = b; const dry = oc.createGain(); dry.gain.value = 1 - wet * 0.35; s.connect(dry); dry.connect(oc.destination);
  if (wet > 0) { const cv = oc.createConvolver(); cv.buffer = vsReverb(oc, sr, secs); const g = oc.createGain(); g.gain.value = wet * 0.9; s.connect(cv); cv.connect(g); g.connect(oc.destination); }
  s.start(); return oc.startRendering();
}
function vsNormalise(buf, peak) { let pk = 0; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i])); } if (pk > 0) { const g = peak / pk; for (let c = 0; c < buf.numberOfChannels; c++) { const d = buf.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] *= g; } } return buf; }

async function vsChoir(x, tr, o, status) {
  const A = vsAllowed(o.tonic, o.minor ? 'min' : 'maj'), base = vsShifts(tr.midi, A, 1, 0.8, 30), n = tr.n, c = new Float32Array(n).fill(NaN);
  for (let k = 0; k < n; k++) if (!isNaN(tr.midi[k])) c[k] = tr.midi[k] + base.sh[k];
  const plan = vsChoirPlan(tr, c, o), sr = tr.sr, len = x.length, L = new Float32Array(len), R = new Float32Array(len), rnd = (a, b) => a + Math.random() * (b - a);
  const add = (y, pan, gain, delay) => { const gl = gain * Math.cos((pan + 1) * Math.PI / 4), gr = gain * Math.sin((pan + 1) * Math.PI / 4), d = Math.round(delay * sr); for (let i = 0; i + d < len; i++) { L[i + d] += y[i] * gl; R[i + d] += y[i] * gr; } };
  const pans = { S: -0.45, A: -0.2, T: 0.2, B: 0.45 }, gains = { S: 0.55, A: 0.6, T: 0.6, B: 0.7 }, parts = {};
  if (o.keepLead) { status('Tuning your voice…'); await vsYield(); const y = vsPsola(x, tr, vsShiftFn(tr, base.sh)); add(y, 0, 0.9, 0); parts.lead = y; }
  const segOf = new Int32Array(n).fill(-1); plan.segs.forEach((s, i) => { for (let k = s.k0; k <= s.k1; k++) segOf[k] = i; });
  for (const p of plan.added) {
    for (let v = 0; v < o.voices; v++) {
      status('Singing the ' + VS_PARTS[p][0].toLowerCase() + ' part' + (o.voices > 1 ? ' (voice ' + (v + 1) + ' of ' + o.voices + ')' : '') + '…'); await vsYield();
      const det = rnd(-10, 10) / 100, ph = rnd(0, 6.28), vf = rnd(4.6, 5.8), vd = rnd(0.04, 0.1), sh = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        if (isNaN(tr.midi[k])) continue; const s = plan.segs[segOf[k]]; if (!s || s.t[p] == null) { sh[k] = base.sh[k]; continue; }
        sh[k] = (s.t[p] + (c[k] - s.note) * 0.9) - tr.midi[k] + det + vd * Math.sin(ph + 2 * Math.PI * vf * k * 0.01);
      }
      const y = vsPsola(x, tr, vsShiftFn(tr, sh)); parts[p + v] = y;
      add(y, pans[p] + rnd(-0.1, 0.1), gains[p] / Math.sqrt(o.voices), rnd(0.006, 0.028));
    }
  }
  status('Mixing and adding the room…'); await vsYield();
  const mix = await vsMixdown([L, R], sr, o.room, 1.8); vsNormalise(mix, 0.9);
  return { mix, plan, parts };
}

/* ---------------------------------------------------------------- voice enhancer */
async function vsEnhance(x, sr, o) {
  const n = x.length, y = Float32Array.from(x);
  if (o.clean) {                                    // noise gate: quiet stretches (breath, hiss, room) are turned down
    const w = Math.round(0.02 * sr), env = [], idx = []; for (let i = 0; i + w <= n; i += w) { let e = 0; for (let j = 0; j < w; j++) e += y[i + j] * y[i + j]; env.push(Math.sqrt(e / w)); idx.push(i); }
    const srt = [...env].sort((a, b) => a - b), floor = srt[Math.floor(srt.length * 0.15)] || 0, th = Math.max(0.004, floor * 2.2); let g = 1;
    env.forEach((e, k) => { const tg = e < th ? 0.15 : 1; for (let j = 0; j < w; j++) { g += (tg - g) * 0.002; y[idx[k] + j] *= g; } });
  }
  const tail = o.room > 0 ? Math.floor(sr * 1.2) : 0, oc = new OfflineAudioContext(1, n + tail, sr), b = oc.createBuffer(1, n, sr); b.copyToChannel(y, 0);
  const s = oc.createBufferSource(); s.buffer = b; let node = s;
  const bq = (type, f, g, q) => { const f1 = oc.createBiquadFilter(); f1.type = type; f1.frequency.value = f; if (g != null) f1.gain.value = g; if (q) f1.Q.value = q; node.connect(f1); node = f1; };
  if (o.clean) bq('highpass', 85, null, 0.7);
  bq('lowshelf', 220, o.warm); bq('peaking', 3000, o.presence, 0.9); bq('highshelf', 9500, o.air);
  if (o.comp > 0) { const cp = oc.createDynamicsCompressor(); cp.threshold.value = -12 - 18 * o.comp; cp.knee.value = 10; cp.ratio.value = 2 + 6 * o.comp; cp.attack.value = 0.006; cp.release.value = 0.18; node.connect(cp); node = cp; }
  const dry = oc.createGain(); dry.gain.value = 1 - o.room * 0.3; node.connect(dry); dry.connect(oc.destination);
  if (o.room > 0) { const cv = oc.createConvolver(); cv.buffer = vsReverb(oc, sr, 1.2); const wg = oc.createGain(); wg.gain.value = o.room * 0.8; node.connect(cv); cv.connect(wg); wg.connect(oc.destination); }
  s.start(); const r = await oc.startRendering(); return vsNormalise(r, 0.9);
}

/* ---------------------------------------------------------------- the screen */
let VL = null;                                   // live listening state
function vsTakes() {
  const sel = $('#vst'); if (!sel) return; const cur = sel.value;
  sel.innerHTML = TAKES.length ? TAKES.map(t => '<option value="' + t.id + '">' + esc(t.name) + ' (' + mmss(t.ms) + ')</option>').join('') : '<option value="">No recordings yet: record your voice below</option>';
  if (TAKES.some(t => String(t.id) === cur)) sel.value = cur;
}
const vsStatus = t => { const e = $('#vsst'); if (e) e.textContent = t; say(t); };
async function vsLoad() {
  const t = TAKES.find(x => String(x.id) === ($('#vst') || {}).value);
  if (!t) { vsStatus('Record your voice first (tick My voice in the Record panel at the bottom), then choose the take here.'); return null; }
  vsStatus('Opening ' + t.name + '…'); await vsYield();
  const buf = await teBuf(t), x = teMono(buf); vsStatus('Finding the pitch of every moment…'); await vsYield();
  return { t, x, sr: buf.sampleRate, tr: t._tr && t._trSr === buf.sampleRate ? t._tr : (t._tr = vsTrack(x, buf.sampleRate), t._trSr = buf.sampleRate, t._tr) };
}
const vsVoiced = tr => [...tr.midi].filter(v => !isNaN(v));
const vsAutoKey = tr => vsKeyOf(vsVoiced(tr));
function vsKeyChoice(tr) {
  const v = $('#vsk').value, sc = $('#vss').value;
  if (v === 'auto') { const k = vsAutoKey(tr); return { tonic: k.tonic, minor: sc === 'chrom' ? k.minor : (sc === 'min' ? 1 : sc === 'maj' ? 0 : k.minor), label: vsKeyName(k.tonic, k.minor) + ' (detected)' }; }
  return { tonic: +v, minor: sc === 'min' ? 1 : 0, label: D_SH[+v] };
}
async function vsDo(kind) {
  try {
    const L = await vsLoad(); if (!L) return; const { t, x, sr, tr } = L;
    if (vsVoiced(tr).length < 30) { vsStatus('I could not find a singing or speaking voice in ' + t.name + '. Is the recording quiet, or only instruments?'); return; }
    if (kind === 'analyse') { const a = vsAnalyse(vsVoiced(tr)); $('#vsres').innerHTML = vsReport(a); vsStatus(a ? 'Analysis of ' + t.name + ' is below.' : 'Not enough voice to analyse.'); vsUseWire(); return; }
    const wavOf = (buf, st) => toWav(buf, st);
    if (kind === 'tune') {
      const k = vsKeyChoice(tr), o = { tonic: k.tonic, scale: $('#vss').value === 'chrom' ? 'chrom' : (k.minor ? 'min' : 'maj'), strength: +$('#vsstr').value / 100, speed: +$('#vsspd').value, vib: +$('#vsvib').value / 100 };
      vsStatus('Correcting the pitch…'); await vsYield();
      const r = vsAutotune(x, tr, o), n = r.moved.sh.filter(v => v !== 0).length, big = r.moved.sh.filter(v => Math.abs(v) > 0.25).length;
      const buf = ctx().createBuffer(1, r.y.length, sr); buf.copyToChannel(r.y, 0); vsNormalise(buf, 0.92);
      const nt = recAdd(wavOf(buf), 'audio/wav', buf.duration * 1000, 'pitch corrected in ' + k.label, t.name + ' tuned');
      vsStatus('Saved ' + nt.name + ': ' + Math.round(big / Math.max(1, n) * 100) + ' percent of your singing was moved more than a quarter of a semitone, into ' + k.label + '. Play it in the list below.');
    } else if (kind === 'enhance') {
      const o = { clean: $('#vsc').checked, warm: +$('#vsw').value, presence: +$('#vsp').value, air: +$('#vsair').value, comp: +$('#vscm').value / 100, room: +$('#vsr').value / 100 };
      vsStatus('Enhancing…'); await vsYield();
      const buf = await vsEnhance(x, sr, o), nt = recAdd(wavOf(buf), 'audio/wav', buf.duration * 1000, 'voice enhanced', t.name + ' enhanced');
      vsStatus('Saved ' + nt.name + '. Play it in the list below.');
    } else if (kind === 'fix') {
      vsStatus('Steadying the volume and cleaning up…'); await vsYield();
      const buf = await vsFix(x, sr), nt = recAdd(wavOf(buf), 'audio/wav', buf.duration * 1000, 'voice fixed', t.name + ' fixed');
      vsStatus('Saved ' + nt.name + ': the volume is steadier and the hiss between phrases is turned down. Play it in the list below.');
    } else if (kind === 'notate') { vsNotate(t, tr);
    } else if (kind === 'choir') {
      const k = vsChoirKey(tr), parts = ['S', 'A', 'T', 'B'].filter(p => $('#vcp' + p).checked);
      if (!parts.length) { vsStatus('Tick at least one choir part.'); return; }
      const lead = $('#vcl').value, o = { tonic: k.tonic, minor: k.minor, parts, lead, voices: +$('#vcv').value, room: +$('#vcr').value / 100, keepLead: $('#vck').checked };
      const far = parts.filter(p => p !== lead && Math.abs(VS_PARTS[p][3] - VS_PARTS[lead][3]) > 14);
      const { mix, plan, parts: pr } = await vsChoir(x, tr, o, vsStatus);
      const nt = recAdd(wavOf(mix, true), 'audio/wav', mix.duration * 1000, 'choir in ' + vsKeyName(k.tonic, k.minor) + ': ' + parts.map(p => VS_PARTS[p][0]).join(', '), t.name + ' choir');
      if ($('#vcs').checked) { for (const p of Object.keys(pr)) { const b = ctx().createBuffer(1, pr[p].length, sr); b.copyToChannel(pr[p], 0); vsNormalise(b, 0.9); recAdd(wavOf(b), 'audio/wav', b.duration * 1000, 'choir part', t.name + ' ' + (p === 'lead' ? 'lead' : VS_PARTS[p[0]][0].toLowerCase() + (o.voices > 1 ? ' ' + p[1] : ''))); } }
      vsStatus('Saved ' + nt.name + ' with ' + plan.added.map(p => VS_PARTS[p][0]).join(', ') + (o.keepLead ? ' and your voice' : '') + ', in ' + vsKeyName(k.tonic, k.minor) + '. ' + plan.segs.length + ' notes harmonised.' + (far.length ? ' The ' + far.map(p => VS_PARTS[p][0].toLowerCase()).join(' and ') + ' is far from your voice, so it may sound artificial.' : ''));
    }
  } catch (e) { vsStatus('Something went wrong while processing (' + (e && e.message || e) + '). Try a shorter recording.'); }
}
function vsChoirKey(tr) { const k = vsAutoKey(tr), v = $('#vck2').value; return v === 'auto' ? { tonic: k.tonic, minor: k.minor } : { tonic: +v.split(':')[0], minor: +v.split(':')[1] }; }
function vsUseWire() {
  const set = (pc, minor) => { DU.key = +pc; DU.minor = +minor; vsStatus('The duet and songs are now in ' + vsKeyName(+pc, +minor) + '.'); };
  const a = $('#vsuse'), b = $('#vsuse2'); if (a) a.onclick = () => set(a.dataset.pc, 0); if (b) b.onclick = () => set(b.dataset.pc, b.dataset.minor);
}

/* live listening with a pitch ribbon */
async function vsListen() {
  if (VL) return vsStop();
  const res = $('#vsres'); res.innerHTML = '';
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    const a = ctx(), src = a.createMediaStreamSource(stream), an = a.createAnalyser(); an.fftSize = 2048; src.connect(an);
    VL = { stream, src, an, buf: new Float32Array(2048), vals: [], trail: [], t0: performance.now(), last: 0, say: 0, lastN: null };
    const b = $('#vsl'); b.textContent = '■ Stop listening'; b.setAttribute('aria-pressed', true); vsStatus('Listening. Sing a few phrases, from low to high if you can.');
    const cv = $('#vsv'), x = cv.getContext('2d'), fs = a.sampleRate / Math.max(1, Math.round(a.sampleRate / 11025)), D = Math.max(1, Math.round(a.sampleRate / 11025)), W = 256, tauMax = Math.floor(fs / 70), tauMin = Math.floor(fs / 900), ds = new Float32Array(2048 / D | 0);
    (function loop() {
      if (!VL || VL.an !== an) return;
      an.getFloatTimeDomainData(VL.buf);
      for (let i = 0; i < ds.length; i++) { let s = 0; for (let j = 0; j < D; j++) s += VL.buf[i * D + j]; ds[i] = s / D; }
      let e = 0; for (let i = 0; i < W; i++) e += ds[i] * ds[i]; e = Math.sqrt(e / W);
      const now = performance.now(); let m = NaN;
      if (e > 0.008 && ds.length >= W + tauMax + 2) { const r = vsYin(ds, 0, W, tauMin, tauMax, fs); if (r && r.conf > 0.75) m = vsMidi(r.f0); }
      VL.trail.push([now, m]); while (VL.trail.length && now - VL.trail[0][0] > 6000) VL.trail.shift();
      if (!isNaN(m) && now - VL.last > 25) { VL.vals.push(m); VL.last = now; }
      vsDraw(x, cv, m, now);
      requestAnimationFrame(loop);
    })();
  } catch (e) { vsStatus('The browser would not open the microphone. Open the game in its own tab from https://, localhost or the saved file, and allow the microphone.'); }
}
function vsStop() {
  if (!VL) return; const v = VL; VL = null; v.stream.getTracks().forEach(t => t.stop()); try { v.src.disconnect(); } catch (e) {}
  const b = $('#vsl'); if (b) { b.textContent = '● Start listening to me sing'; b.setAttribute('aria-pressed', false); }
  const r = $('#vsres'); if (r) { const a = vsAnalyse(v.vals); r.innerHTML = vsReport(a); vsStatus(a ? 'Here is what I heard.' : 'I did not hear enough singing.'); vsUseWire(); }
  const nn = $('#vsnow'); if (nn) nn.textContent = '';
}
function vsDraw(x, cv, m, now) {
  const w = cv.width, h = cv.height, mids = VL.trail.map(p => p[1]).filter(v => !isNaN(v)), cen = mids.length ? mids.reduce((s, v) => s + v, 0) / mids.length : (VL.cen || 62);
  VL.cen = VL.cen == null ? cen : VL.cen + (cen - VL.cen) * 0.05; const lo = VL.cen - 8, hi = VL.cen + 8, Y = v => h - (v - lo) / (hi - lo) * h;
  x.clearRect(0, 0, w, h); const A = vsAllowed(DU.key, DU.minor ? 'min' : 'maj'); x.font = '11px sans-serif'; x.textBaseline = 'middle';
  for (let v = Math.ceil(lo); v <= hi; v++) { const on = A[((v % 12) + 12) % 12]; x.strokeStyle = on ? 'rgba(138,151,173,.6)' : 'rgba(138,151,173,.15)'; x.lineWidth = on ? 1.2 : 1; x.beginPath(); x.moveTo(34, Y(v)); x.lineTo(w, Y(v)); x.stroke(); if (on) { x.fillStyle = '#8a97ad'; x.fillText(vsNote(v), 2, Y(v)); } }
  x.strokeStyle = '#f0b43c'; x.lineWidth = 3; x.beginPath(); let pen = false;
  VL.trail.forEach(([t, v]) => { if (isNaN(v)) { pen = false; return; } const px = 34 + (w - 34) * (1 - (now - t) / 6000), py = Y(v); if (!pen) { x.moveTo(px, py); pen = true; } else x.lineTo(px, py); }); x.stroke();
  const nn = $('#vsnow');
  if (!isNaN(m) && nn) {
    const r = Math.round(m), cents = Math.round((m - r) * 100), inKey = A[((r % 12) + 12) % 12], txt = vsNote(m) + ', ' + (Math.abs(cents) < 8 ? 'in tune' : Math.abs(cents) + ' cents ' + (cents > 0 ? 'sharp' : 'flat')) + (inKey ? '' : ', not in the key');
    nn.textContent = txt;
    const stt = Math.abs(cents) < 20 ? 'ok' : cents < 0 ? 'flat' : 'sharp', key = r + ':' + stt; if ($('#vsan') && $('#vsan').checked && now - VL.say > 900 && VL.lastN !== key) { VL.say = now; VL.lastN = key; say(sp(vsNote(m)) + (stt === 'ok' ? ', in tune' : ', a little ' + stt)); }
  }
}

function voice() {
  const o = (list, sel) => list.map(([v, t]) => '<option value="' + v + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + t + '</option>').join('');
  const keys = [['auto', 'Detect from my singing']].concat(D_SH.map((n, i) => [i, n === D_FL[i] ? n : n + ' / ' + D_FL[i]]));
  const ck = [['auto', 'Detect from my singing']].concat(D_SH.flatMap((n, i) => [[i + ':0', (n === D_FL[i] ? n : n + ' / ' + D_FL[i]) + ' major'], [i + ':1', (n === D_FL[i] ? n : n + ' / ' + D_FL[i]) + ' minor']]));
  const sl = (id, t, mn, mx, st, v, u) => `<label>${t} <input type="range" id="${id}" min="${mn}" max="${mx}" step="${st}" value="${v}" style="width:120px"> <output>${v}</output>${u || ''}</label>`;
  shell('voice', 'Voice studio',
    'Find the key you can sing in, fix stray pitches, polish your voice, and turn one voice into a choir. Sing live to see your pitch, or record yourself with the Record panel at the bottom and work on the recording.',
    '<section class="prac" aria-label="Sing and find my key"><h3>1. Sing and find my key</h3>' +
    '<div class="tools stack"><button type="button" id="vsl" class="next" aria-pressed="false">● Start listening to me sing</button></div>' +
    '<label class="chk"><input type="checkbox" id="vsan"> Announce the note I sing (for screen readers)</label>' +
    '<canvas id="vsv" width="420" height="170" aria-hidden="true" style="width:100%;max-width:520px;background:var(--bg);border-radius:10px;margin-top:8px"></canvas>' +
    '<p id="vsnow" class="vsnow" role="status"></p><div id="vsres"></div></section>' +
    '<section class="prac" aria-label="Work on a recording"><h3>2. Work on a recording</h3><div class="set"><label>Recording <select id="vst"></select></label></div>' +
    '<p id="vsst" class="total" role="status" aria-live="polite">Record your voice in the Record panel at the bottom (tick My voice), then choose it here.</p>' +
    '<div class="tools stack"><button type="button" id="vsa">Analyse it: range, voice type and key</button></div>' +
    '<h4>Fix stray pitches (auto-tune)</h4><div class="set"><label>Key <select id="vsk">' + o(keys, 'auto') + '</select></label><label>Scale <select id="vss"><option value="maj">Major</option><option value="min">Minor</option><option value="chrom">Every semitone</option></select></label></div>' +
    '<div class="set">' + sl('vsstr', 'Strength', 0, 100, 5, 85, ' %') + sl('vsspd', 'Retune speed', 0, 200, 10, 60, ' ms') + sl('vsvib', 'Keep my vibrato', 0, 100, 5, 70, ' %') + '</div>' +
    '<div class="tools stack"><button type="button" id="vsd">Correct the pitch into a new recording</button></div>' +
    '<h4>Voice enhancer</h4><div class="set"><label><input type="checkbox" id="vsc" checked>Clean up (cut rumble and background noise)</label></div>' +
    '<div class="set">' + sl('vsw', 'Warmth', -6, 8, 1, 2, ' dB') + sl('vsp', 'Presence', -6, 10, 1, 3, ' dB') + sl('vsair', 'Air', -6, 10, 1, 2, ' dB') + sl('vscm', 'Evenness', 0, 100, 5, 50, ' %') + sl('vsr', 'Room', 0, 60, 5, 12, ' %') + '</div>' +
    '<div class="tools stack"><button type="button" id="vse">Enhance into a new recording</button></div>' +
    '<h4>Choir maker</h4><p class="total">One voice becomes a choir. The game finds your notes, picks a simple chord for each (I, IV and V of the key) and sings the parts you choose.</p>' +
    '<div class="set"><label>My voice is the <select id="vcl"><option value="S">Soprano</option><option value="A">Alto</option><option value="T" selected>Tenor</option><option value="B">Bass</option></select></label><label>Key <select id="vck2">' + o(ck, 'auto') + '</select></label></div>' +
    '<div class="set" role="group" aria-label="Choir parts to add"><label><input type="checkbox" id="vcpS" checked>Soprano</label><label><input type="checkbox" id="vcpA" checked>Alto</label><label><input type="checkbox" id="vcpT" checked>Tenor</label><label><input type="checkbox" id="vcpB" checked>Bass</label><label><input type="checkbox" id="vck" checked>Include my voice (tuned)</label></div>' +
    '<div class="set">' + sl('vcv', 'Voices per part', 1, 3, 1, 2, '') + sl('vcr', 'Church room', 0, 80, 5, 35, ' %') + '<label><input type="checkbox" id="vcs">Also save each part as its own recording</label></div>' +
    '<div class="tools stack"><button type="button" id="vsch" class="next">Make the choir</button></div></section>' + vsExtraHtml(),
    e => vsKey(e), null);
  $$('.prac input[type=range]').forEach(r => { r.oninput = () => { const o2 = r.parentNode.querySelector('output'); if (o2) o2.textContent = r.value; }; });
  $('#vsl').onclick = vsListen; $('#vsa').onclick = () => vsDo('analyse'); $('#vsd').onclick = () => vsDo('tune'); $('#vse').onclick = () => vsDo('enhance'); $('#vsch').onclick = () => vsDo('choir');
  $$('#vsk,#vss,#vst,#vcl,#vck2').forEach(s => { s.onchange = e => e.target.blur(); });
  vsExtraWire(); vsTakes();
}
