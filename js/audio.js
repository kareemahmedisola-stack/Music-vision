/* Staffsounds – Web Audio: one-shot tones, demo helpers and the sustained piano voices */
let ac, MS, AN;                 // AudioContext, master gain, analyser
let RX, RD, RA, RSEND;             // recorder: mix bus, stream destination, level meter, instrument send
let VOL = 1.0, INS = 'piano';   // playground volume and instrument
let PAN = 0;                    // -1 (left) .. 1 (right) for the next tones; 0 = centre
let FORCE = false;              // lessons play sound even if the Sound setting is off

function ctx() {
  ac = ac || new (window.AudioContext || window.webkitAudioContext)();
  if (ac.state === 'suspended') ac.resume();
  return ac;
}
const hz = m => 440 * Math.pow(2, (m - 69) / 12);

/* m = MIDI note, t = start offset (s), d = length (s), v = volume */
function tone(m, t, d, v) {
  if (!FORCE && opt('snd', true) === false) return;
  const a = ctx(), o = a.createOscillator(), g = a.createGain(), s = a.currentTime + t + 0.02;
  o.type = 'triangle'; o.frequency.value = hz(m);
  o.connect(g);
  if (PAN && a.createStereoPanner) { const pn = a.createStereoPanner(); pn.pan.value = Math.max(-1, Math.min(1, PAN)); g.connect(pn); pn.connect(a.destination); } else g.connect(a.destination);
  g.gain.setValueAtTime(0, s);
  g.gain.linearRampToValueAtTime((v || 0.2) * 1.5, s + 0.02);   // lesson and quiz sounds, a little louder
  g.gain.exponentialRampToValueAtTime(0.0001, s + d);
  o.start(s); o.stop(s + d + 0.05);
}

/* ---- music maths used by questions and lessons ---- */
const SC = [0, 2, 4, 5, 7, 9, 11];                       // major scale in half steps
const sn = i => SC[i % 7] + 12 * Math.floor(i / 7);       // scale degree index -> half steps
const DG = { I: 0, ii: 1, iii: 2, IV: 3, V: 4, vi: 5 };   // Roman numeral -> degree index
const dmidi = s => 12 * (Math.floor(s / 7) + 1) + SC[s % 7]; // diatonic staff index -> MIDI note

/* ---- demo helpers ---- */
const playSeq = (notes, gap, dur, v) => notes.forEach((m, i) => tone(m, i * gap, dur, v || 0.2));
const spatial = () => opt('pan', true) !== false;
/* a scale sweeps from the left ear to the right ear as it climbs, so the rise can be heard in space */
const playScale = r => { [0, 2, 4, 5, 7, 9, 11, 12].forEach((x, i) => { PAN = spatial() ? -0.7 + i * 0.2 : 0; tone(r + x, i * 0.3, 0.45); }); PAN = 0; };
const playInterval = (n, r) => { r = r || 60; tone(r, 0, 0.9); tone(r + n, 0.85, 1); };
/* broken (one by one) then together, like the chord questions */
function playChord(iv, r) {
  r = r || 60;
  iv.forEach((n, i) => tone(r + n, i * 0.3, 0.5, 0.15));
  iv.forEach(n => tone(r + n, 1.3, 1.6, 0.13));
}
/* "I IV V I" style string, root = MIDI note two octaves below the chords */
function playProg(str, k) {
  k = k == null ? 48 : k;
  str.split(' ').forEach((d, i) => {
    const g = DG[d];
    [sn(g), sn(g + 2), sn(g + 4)].forEach(n => tone(k + 12 + n, i * 1.05, 1, 0.13));
    tone(k + sn(g), i * 1.05, 1.1, 0.2);
  });
}
function playTempo(bpm) {           // four ticks, first one accented
  const gap = 60 / bpm;
  for (let i = 0; i < 4; i++) tone(i ? 84 : 91, i * gap, 0.08, i ? 0.18 : 0.3);
}
function playDyn(kind) {
  const n = [60, 64, 67, 72, 67, 64];
  if (kind === 'soft') playSeq(n, 0.35, 0.5, 0.04);
  else if (kind === 'loud') playSeq(n, 0.35, 0.5, 0.4);
  else if (kind === 'cresc') n.forEach((m, i) => tone(m, i * 0.4, 0.55, 0.04 + i * 0.07));
  else if (kind === 'dim') n.forEach((m, i) => tone(m, i * 0.4, 0.55, 0.4 - i * 0.07));
}
function playArt(kind) {
  const n = [60, 62, 64, 65, 67, 65];
  n.forEach((m, i) => tone(m, i * 0.45, kind === 'stac' ? 0.1 : 0.6, 0.22));
}
function playDur() {                // whole, half, quarter, eighth, sixteenth on one pitch
  let t = 0;
  [4, 2, 1, 0.5, 0.25].forEach(b => { tone(67, t, b * 0.5, 0.2); t += b * 0.5 + 0.12; });
}

/* ---- sustained voices for the live piano ---- */
const INST = {
  piano: { p: [['triangle', 1, .6], ['sine', 2, .25], ['sine', 3, .12], ['sine', 4, .05]], d: 2.6, a: .008 },
  organ: { p: [['sine', 1, .5], ['sine', 2, .3], ['sine', 4, .18], ['sine', .5, .2]], a: .03 },
  bell:  { p: [['sine', 1, .5], ['sine', 2.76, .25], ['sine', 5.4, .12], ['sine', 8.9, .06]], d: 3.5, a: .004 },
  synth: { p: [['sawtooth', 1, .22], ['square', 1.005, .1]], a: .02, lp: 1800 },
  /* guitar is a plucked string (Karplus-Strong); trumpet and sax add filter swell, vibrato and breath */
  /* orchestral and solo sounds: slow-breathing strings, a bowed violin, a piano-and-strings blend, a flute */
  strings: { p: [['sawtooth', 1, .28], ['sawtooth', 1.007, .24], ['sawtooth', .993, .24], ['sawtooth', .5, .1]], a: .32, r: .7, pk: .5, lp: 2300, q: .6, fe: [900, 2300, .5], vib: [5, 6, .6] },
  violin:  { p: [['sawtooth', 1, .38], ['sawtooth', 1.004, .22], ['square', 2, .05]], a: .09, r: .35, pk: .55, lp: 3400, q: 1.2, fe: [1200, 3400, .15], vib: [5.8, 14, .45] },
  pstr:    { p: [['triangle', 1, .45], ['sine', 2, .18], ['sawtooth', 1.005, .16], ['sawtooth', .995, .16]], a: .06, r: .6, pk: .55, lp: 3000, q: .6, vib: [4.8, 4, .8] },
  flute:   { p: [['sine', 1, .6], ['sine', 2, .1], ['sine', 3, .03]], a: .07, r: .3, pk: .6, lp: 3200, vib: [5.2, 8, .5], nz: .05 },
  guitar:  { ks: 1, pk: .75, a: .002 },
  trumpet: { p: [['sawtooth', 1, .55], ['square', 2, .12], ['sawtooth', 1.003, .25]], a: .035, pk: .62, lp: 3600, q: 1.6, fe: [700, 3600, .09], vib: [5.2, 9, .35] },
  sax:     { p: [['sawtooth', 1, .4], ['square', 1, .22], ['sawtooth', .998, .2], ['sine', .5, .12]], a: .05, pk: .7, lp: 2300, q: 2.2, fe: [900, 2300, .07], vib: [5.5, 12, .4], nz: .07 }
};
function eng() {
  const a = ctx();
  if (!MS) {
    MS = a.createGain();
    const cp = a.createDynamicsCompressor();
    cp.threshold.value = -10; cp.knee.value = 12; cp.ratio.value = 6; cp.attack.value = 0.004; cp.release.value = 0.2;   // loud but never harsh
    AN = a.createAnalyser(); AN.fftSize = 512;
    MS.connect(cp); cp.connect(AN); AN.connect(a.destination);
    /* recorder bus: instruments (through RSEND) and, while recording, the microphone and any backing take all meet in RX */
    RX = a.createGain(); RD = a.createMediaStreamDestination(); RA = a.createAnalyser(); RA.fftSize = 1024; RSEND = a.createGain();
    AN.connect(RSEND); RSEND.connect(RX); const lim = a.createDynamicsCompressor(); lim.threshold.value = -8; lim.knee.value = 4; lim.ratio.value = 20; lim.attack.value = 0.002; lim.release.value = 0.15;   // keeps a loud voice + instruments from clipping
    RX.gain.value = 0.85; RX.connect(lim); lim.connect(RD); RX.connect(RA);
  }
  MS.gain.value = VOL;
  return a;
}
/* a plucked string: noise burst in a delay loop (Karplus-Strong), rendered once per note and cached */
const KSC = {};
function ksBuffer(a, m) {
  if (KSC[m]) return KSC[m];
  const sr = a.sampleRate, f = hz(m), N = Math.max(2, Math.round(sr / f + 0.5)), len = Math.floor(sr * 2.8);
  const buf = a.createBuffer(1, len, sr), x = buf.getChannelData(0), r = new Float32Array(N);
  for (let i = 0; i < N; i++) r[i] = Math.random() * 2 - 1;
  for (let i = 1; i < N; i++) r[i] = r[i] * 0.55 + r[i - 1] * 0.45;          // soften the pluck
  let k = 0;
  for (let i = 0; i < len; i++) { const n = (k + 1) % N; x[i] = r[k]; r[k] = (r[k] + r[n]) * 0.5 * 0.997; k = n; }
  return (KSC[m] = { buf, rate: f / (sr / (N - 0.5)) });                      // rate corrects the tuning
}
let NZB = null;
function startVoice(m, dst) {       // dst = optional bus to play into (the duet uses one bus per part)
  const a = eng(), I = INST[INS], g = a.createGain(), t = a.currentTime, os = [];
  let out = g;
  if (I.lp) {
    const lp = a.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = I.q || 0.7;
    lp.frequency.setValueAtTime(I.fe ? I.fe[0] : I.lp, t);
    if (I.fe) lp.frequency.linearRampToValueAtTime(I.fe[1], t + I.fe[2]);       // brass and reeds open up as the note speaks
    g.connect(lp); out = lp;
  }
  out.connect(dst || MS);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(I.pk || 0.6, t + I.a);
  if (I.d) g.gain.exponentialRampToValueAtTime(0.0001, t + I.d);
  if (I.ks) {
    const k = ksBuffer(a, m), s = a.createBufferSource();
    s.buffer = k.buf; s.playbackRate.value = k.rate; s.connect(g); s.start(t); os.push(s);
    return { g, os };
  }
  let vg = null;
  if (I.vib) {                                                                  // vibrato fades in after the note starts
    const lfo = a.createOscillator(); vg = a.createGain();
    lfo.frequency.value = I.vib[0]; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(I.vib[1], t + I.vib[2] + 0.4);
    lfo.connect(vg); lfo.start(t); os.push(lfo);
  }
  I.p.forEach(([ty, mu, v]) => {
    const o = a.createOscillator(), pg = a.createGain();
    o.type = ty; o.frequency.value = hz(m) * mu; pg.gain.value = v;
    if (vg) vg.connect(o.detune);
    o.connect(pg); pg.connect(g); o.start(t); os.push(o);
  });
  if (I.nz) {                                                                   // a touch of breath noise
    if (!NZB) { NZB = a.createBuffer(1, a.sampleRate, a.sampleRate); const d = NZB.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
    const n = a.createBufferSource(), bp = a.createBiquadFilter(), ng = a.createGain();
    n.buffer = NZB; n.loop = true; bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 0.8; ng.gain.value = I.nz;
    n.connect(bp); bp.connect(ng); ng.connect(g); n.start(t); os.push(n);
  }
  return { g, os };
}
function stopVoice(v) {
  const t = ac.currentTime;
  v.g.gain.cancelScheduledValues(t);
  v.g.gain.setValueAtTime(Math.max(v.g.gain.value, 0.0001), t);
  v.g.gain.exponentialRampToValueAtTime(0.0001, t + (INST[INS].r || (INS === 'piano' || INS === 'bell' ? 0.5 : 0.25)));
  v.os.forEach(o => o.stop(t + (INST[INS].r || 0.25) + 0.4));
}

/* Browsers (iOS especially) only allow sound after a gesture: unlock on the first one. */
const UEV = ['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'];
function unlockAudio() {
  try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
  try {
    const a = eng(), b = a.createBuffer(1, 1, 22050), s = a.createBufferSource();
    s.buffer = b; s.connect(a.destination); s.start(0);
    if (a.state === 'running') UEV.forEach(t => document.removeEventListener(t, unlockAudio, true));
  } catch (e) {}
}
UEV.forEach(t => document.addEventListener(t, unlockAudio, true));

/* ---- more lesson demos ---- */
/* scale from a list of steps in half steps, e.g. [2,2,1,2,2,2,1] */
function playSteps(steps, r) {
  let m = r || 60; const ns = [m];
  steps.forEach(s => { m += s; ns.push(m); });
  playSeq(ns, 0.36, 0.5, 0.2);
}
/* a strong first pulse in every group: n pulses per bar, g = group size */
function playMeter(n, g) {
  for (let i = 0; i < n * Math.ceil(12 / n); i++) tone(i % g ? 72 : 79, i * 0.45, 0.2, i % g ? 0.1 : 0.28);
}
/* play a note on a named instrument for d seconds, starting t seconds from now */
function instNote(ins, m, t, d) {
  setTimeout(() => {
    const keep = INS; INS = ins;
    const v = startVoice(m);
    setTimeout(() => { const k = INS; INS = ins; stopVoice(v); INS = k; }, d * 1000);
    INS = keep;
  }, t * 1000);
}
const instSeq = (ins, ns, gap, dur) => ns.forEach((m, i) => instNote(ins, m, i * gap, dur));
const instStrum = (ins, ns) => ns.forEach((m, i) => instNote(ins, m, i * 0.05, 1.8));

/* ---- drum kit ---- */
function drum(k, w) {
  const a = eng(), n = a.currentTime + (w || 0);
  const o = (f0, f1, d, v, ty) => {
    const s = a.createOscillator(), g = a.createGain();
    s.type = ty || 'sine'; s.frequency.setValueAtTime(f0, n); s.frequency.exponentialRampToValueAtTime(f1, n + d);
    g.gain.setValueAtTime(v, n); g.gain.exponentialRampToValueAtTime(0.001, n + d);
    s.connect(g); g.connect(MS); s.start(n); s.stop(n + d + 0.05);
  };
  const z = (d, v, hp, off) => {                      // a burst of noise through a high-pass filter; off = delay in seconds
    off = off || 0;
    const b = a.createBuffer(1, a.sampleRate * d | 0, a.sampleRate), x = b.getChannelData(0);
    for (let i = 0; i < x.length; i++) x[i] = Math.random() * 2 - 1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = b; f.type = 'highpass'; f.frequency.value = hp;
    g.gain.setValueAtTime(v, n + off); g.gain.exponentialRampToValueAtTime(0.001, n + off + d);
    s.connect(f); f.connect(g); g.connect(MS); s.start(n + off);
  };
  ({
    kick: () => { o(160, 42, .38, 1.6); o(60, 40, .3, .8); }, snare: () => { o(220, 120, .12, .8, 'triangle'); z(.22, .95, 1500); },
    hat: () => z(.05, .6, 7000), ohat: () => z(.35, .5, 6500),
    tom1: () => o(220, 140, .3, 1.3), tom2: () => o(160, 100, .35, 1.3), tom3: () => o(110, 70, .4, 1.5),
    /* percussion: rim shot, hand clap, cowbell, two congas and a shaker */
    rim: () => { o(1750, 1400, .03, .5, 'triangle'); o(420, 300, .06, .7); z(.05, .7, 2500); },
    clap: () => { [0, .012, .026].forEach(t => z(.02, .8, 1100, t)); z(.2, .6, 900, .04); },
    cow: () => { o(815, 815, .4, .22, 'square'); o(545, 545, .4, .22, 'square'); z(.01, .3, 4000); },
    cgh: () => { o(380, 300, .28, 1.1); o(760, 600, .06, .3, 'triangle'); z(.03, .35, 2500); },
    cgl: () => { o(260, 200, .36, 1.2); o(520, 400, .06, .3, 'triangle'); z(.03, .3, 2000); },
    shk: () => { z(.09, .4, 5500); z(.07, .25, 7000, .07); },
    crash: () => z(1.3, .7, 4000), ride: () => { z(.7, .3, 6000); o(900, 880, .5, .14, 'square'); }
  })[k]();
}
const DK = { a: ['rim', 'Rim shot'], s: ['clap', 'Hand clap'], d: ['cow', 'Cowbell'], f: ['cgh', 'High conga'], g: ['cgl', 'Low conga'], h: ['shk', 'Shaker'], z: ['kick', 'Kick drum'], x: ['snare', 'Snare drum'], c: ['hat', 'Closed hi-hat'], v: ['ohat', 'Open hi-hat'], m: ['tom1', 'High tom'], n: ['tom2', 'Mid tom'], b: ['tom3', 'Floor tom'], ',': ['crash', 'Crash cymbal'], '.': ['ride', 'Ride cymbal'] };
/* pattern = [steps in the bar (4 per beat), {drum: [steps]}, description] */
const DP = {
  'Rock 4/4': [16, { kick: [0, 8], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] }, 'Rock beat. Kick on beats 1 and 3, snare on 2 and 4, steady eighth-note hi-hat.'],
  'Funk': [16, { kick: [0, 7, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14] }, 'Funk beat. The kick is syncopated, landing between the beats, with the snare on 2 and 4.'],
  'Disco, four on the floor': [16, { kick: [0, 4, 8, 12], snare: [4, 12], ohat: [2, 6, 10, 14] }, 'Disco beat. Kick on every beat, open hi-hat on the off-beats.'],
  'Metronome 4/4': [16, { ohat: [0], hat: [4, 8, 12] }, 'Metronome in four. A longer click on beat one, then short clicks on two, three and four.'],
  'Metronome 3/4': [12, { ohat: [0], hat: [4, 8] }, 'Metronome in three. A longer click on beat one, then short clicks on two and three.'],
  'Conga groove': [16, { cgl: [0, 3, 8, 11], cgh: [4, 6, 12, 14], cow: [0, 4, 8, 12], shk: [2, 6, 10, 14], kick: [0, 8] }, 'Latin groove. Low and high congas trade patterns over a steady cowbell, with a shaker on the off-beats.'],
  'Afrobeat': [16, { kick: [0, 6, 10], snare: [4, 12], hat: [0, 2, 4, 6, 8, 10, 12, 14], cow: [0, 3, 6, 10, 12], cgh: [2, 7, 14], rim: [9] }, 'Afrobeat. A syncopated kick, snare on 2 and 4, steady hi-hat, with cowbell, a high conga and a rim shot on top.'],
  'Waltz 3/4': [12, { kick: [0], snare: [4, 8], hat: [0, 4, 8] }, 'Waltz. Three beats a bar: low kick on one, snare on two and three.']
};
function playPat(name, bars, bpm) {
  const p = DP[name], st = 60 / (bpm || 100) / 4;
  for (let b = 0; b < bars; b++) for (let s = 0; s < p[0]; s++)
    for (const k in p[1]) if (p[1][k].includes(s)) drum(k, (b * p[0] + s) * st);
}
