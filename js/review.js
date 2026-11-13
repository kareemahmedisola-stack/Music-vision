/* Staffsounds – Weak spots and chord dictation.
   1. Every answer in a round is remembered by what the right answer was (for example "G major" or "Major 3rd").
      Items you miss more often than you get right come back more often, and a miss is asked again later in the same round.
   2. The weak-spots screen lists them and starts a round made mostly of them.
   3. Chord dictation (Keyboard duet): hear a short progression, then play the chords back on the home row. */

let WKNEXT = false;
const WKLABEL = { dict: 'Chord dictation' };
const wkLabel = m => WKLABEL[m] || (MODES[m] ? MODES[m][0] : m);
const wkKey = a => String(a).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
function wkRec(m, ans, good) {
  P.wk = P.wk || {}; const w = P.wk[m] = P.wk[m] || {}, k = wkKey(ans); if (!k) return;
  const r = w[k] = w[k] || [0, 0]; r[0]++; if (!good) r[1]++;
  srRec(m, k, good);
  const ks = Object.keys(w); if (ks.length > 160) { ks.sort((a, b) => w[a][0] - w[b][0]).slice(0, ks.length - 160).forEach(x => delete w[x]); }
}
/* spaced repetition: a miss is due again today; each later right answer pushes the next review further away (1, 3, 7, 14, 30 days) */
const SR_STEPS = [1, 3, 7, 14, 30], srToday = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
function srRec(m, k, good) {
  P.sr = P.sr || {}; const s = P.sr[m] = P.sr[m] || {}, e = s[k];
  if (!good) { s[k] = { b: 0, due: srToday() }; return; }
  if (!e) return;
  e.b++; if (e.b >= SR_STEPS.length) delete s[k]; else e.due = srToday() + SR_STEPS[e.b];
}
const srDue = m => { const s = (P.sr || {})[m] || {}, t = srToday(); return Object.keys(s).filter(k => s[k].due <= t); };
const wkScore = r => (r[1] + 1) / (r[0] + 2);
const wkIsWeak = r => r[1] >= 1 && wkScore(r) >= 0.4;
const wkWeak = m => { const w = (P.wk || {})[m] || {}; return Object.keys(w).filter(k => wkIsWeak(w[k])); };
function wkBias(m, q, lv) {
  const due = new Set(srDue(m)), pool = new Set(wkWeak(m).concat(S.re || [], [...due])); if (!pool.size || Math.random() > (due.size ? 0.6 : S.wk ? 0.85 : 0.35)) return q;
  for (let i = 0; i < 40; i++) { const q2 = MODES[m][2](lv), k = wkKey(q2.ans); if (pool.has(k)) { if (due.has(k)) q2.rev = true; return q2; } }
  return q;
}
function wkAll() {
  const out = []; Object.keys(P.wk || {}).forEach(m => { const w = P.wk[m]; Object.keys(w).forEach(k => { if (wkIsWeak(w[k])) out.push({ m, k, seen: w[k][0], wrong: w[k][1], sc: wkScore(w[k]) }); }); });
  return out.sort((a, b) => b.sc - a.sc || b.wrong - a.wrong);
}
function weakSpots() {
  clearTimer(); stopDr(); allOff(); recStop(); S = null; TUT_ON = false; scrollTo(0, 0);
  const L = wkAll(), modes = [...new Set(L.map(x => x.m))].filter(m => MODES[m] && MODES[m][2]);
  app.innerHTML = '<article class="guide"><div class="ltop"><button type="button" id="gb">← Back to the menu</button></div><h1 style="font-size:34px">My weak spots</h1>' +
    (L.length ? '<p>These are the answers you miss more often than you get right. In a round they come back more often, and anything you miss is asked again later in the same round. Get them right a few times and they leave this list.</p>' +
      '<table class="gtab"><thead><tr><th scope="col">Where</th><th scope="col">Answer</th><th scope="col">Missed</th></tr></thead><tbody>' + L.slice(0, 40).map(x => '<tr><th scope="row">' + esc(wkLabel(x.m)) + '</th><td>' + esc(x.k) + '</td><td>' + x.wrong + ' of ' + x.seen + '</td></tr>').join('') + '</tbody></table>' +
      '<div class="tools stack">' + modes.map(m => '<button type="button" class="next" data-wk="' + m + '">Practise weak spots: ' + esc(wkLabel(m)) + ' (' + L.filter(x => x.m === m).length + ')</button>').join('') + (L.some(x => x.m === 'dict') ? '<button type="button" id="wkd">Practise chord dictation (Keyboard duet)</button>' : '') + '</div>'
      : '<p>Nothing here yet. Play a few rounds. The game remembers which answers you miss and builds this list for you.</p>') +
    '</article>';
  $('#gb').onclick = menu; $$('[data-wk]').forEach(b => { b.onclick = () => { WKNEXT = true; start(b.dataset.wk, 1); }; }); if ($('#wkd')) $('#wkd').onclick = () => start('duet', 1);
  say(L.length ? 'My weak spots. ' + L.length + ' items. ' + L.slice(0, 3).map(x => wkLabel(x.m) + ', ' + x.k).join('; ') + '.' : 'No weak spots yet.');
  $('#gb').focus();
}

/* ---- chord dictation ---- */
const DT = { n: 3, seq: [], pos: 0, miss: 0, st: 'idle', timers: [], vs: [], streak: 0 };
const dtPool = () => DT.n < 4 ? [0, 3, 4] : DT.n < 5 ? [0, 3, 4, 5] : DT.n < 6 ? [0, 1, 3, 4, 5] : [0, 1, 2, 3, 4, 5];
function dtBuild() { const P2 = dtPool(), s = [0]; while (s.length < DT.n) { const c = P2[Math.floor(Math.random() * P2.length)]; if (c !== s[s.length - 1]) s.push(c); } return s; }
function dtCancel(msg) { DT.timers.forEach(clearTimeout); DT.timers = []; DT.vs.forEach(duStop); DT.vs = []; if (DT.st !== 'idle' && DT.st !== 'done') DT.streak = 0; DT.st = 'idle'; if (msg) prSay('dts', msg); }
function dtPlay() {
  DT.timers.forEach(clearTimeout); DT.timers = []; DT.vs.forEach(duStop); DT.vs = [];
  const beat = 60 / DPR.bpm * 2, bus = duBus().c; DT.st = 'listen'; DT.pos = 0; prSay('dts', 'Listen: ' + DT.n + ' chords. The first is chord I.');
  DT.seq.forEach((ci, i) => {
    DT.timers.push(setTimeout(() => {
      const c = dChord(ci, 0), ns = [c.bass].concat(c.notes), vs = ns.map(m => duVoice(DU.ci, m, bus)); DT.vs.push(...vs);
      DT.timers.push(setTimeout(() => { vs.forEach(duStop); DT.vs = DT.vs.filter(x => !vs.includes(x)); }, beat * 900));
    }, 300 + i * beat * 1000));
  });
  DT.timers.push(setTimeout(() => { DT.st = 'answer'; prSay('dts', 'Your turn. Play the ' + DT.n + ' chords on the home row. Hold Shift and press Space to hear them again.'); }, 300 + DT.n * beat * 1000));
}
function dtNew() { if (DT.st === 'listen' || DT.st === 'answer') DT.streak = 0; dtCancel(); DT.seq = dtBuild(); DT.miss = 0; dtStats(); dtPlay(); }
function dtReplay() { if (!DT.seq.length || DT.st === 'listen') return; if (DT.st === 'done') DT.miss = 0; dtPlay(); }
function dtStats() { const e = $('#dtst'), p = pm('duet'); if (e) e.textContent = 'Progression length ' + DT.n + ' chords. Streak ' + DT.streak + '. Dictations solved ' + (p.dict || 0) + '.'; }
function dtPress(ci) {
  if (DT.st !== 'answer') return; const exp = DT.seq[DT.pos], ok = ci % 7 === exp % 7;
  wkRec('dict', dChord(exp, 0).rn, ok); save();
  if (ok) {
    DT.pos++; if (DT.pos < DT.n) { prSay('dts', 'Correct. ' + DT.pos + ' of ' + DT.n + '.'); return; }
    const stars = DT.miss === 0 ? 3 : DT.miss <= 2 ? 2 : 1, p = pm('duet'); p.dict = (p.dict || 0) + 1; p.xp += 10 * stars; DT.streak++; save();
    if (stars > 1 && DT.n < 6) DT.n++; else if (stars === 1 && DT.n > 3) DT.n--;
    DT.st = 'done'; dtStats(); if (typeof planDone === 'function') planDone('dict');
    prSay('dts', 'Solved, ' + stars + (stars === 1 ? ' star' : ' stars') + '. It was ' + DT.seq.map(c => dChord(c, 0).rn + ' (' + dChord(c, 0).name + ')').join(', ') + '. Hold Shift and press backslash for the next one.');
  } else {
    DT.miss++; prSay('dts', 'Not that chord. ' + (DT.miss % 3 === 0 ? 'Here is a hint.' : 'Try again, or hold Shift and press Space to hear it again.'));
    if (DT.miss % 3 === 0) { const b = $('.duet [data-c="' + DC[exp] + '"]'); if (b) { b.classList.add('hint'); DT.timers.push(setTimeout(() => b.classList.remove('hint'), 1400)); } }
  }
}
function dtHtml() {
  return '<section class="prac" aria-label="Chord dictation"><h3>Chord dictation</h3><p class="total">Hear a short chord progression, then play it back on the home row. It always starts on chord I. It grows from 3 to 6 chords as you succeed, and the chords you miss are added to My weak spots.</p>' +
    '<div class="tools stack"><button type="button" id="dtn" class="next">New dictation (Shift + backslash)</button><button type="button" id="dtr">Hear it again (Shift + Space)</button></div>' +
    '<p id="dts" class="total" role="status" aria-live="polite">Press the button to hear a progression.</p><p id="dtst" class="total"></p></section>';
}
function dtWire() { DT.st = 'idle'; DT.seq = []; DT.timers = []; DT.vs = []; $('#dtn').onclick = dtNew; $('#dtr').onclick = dtReplay; dtStats(); }
function dtKey(e) {
  if (e.shiftKey && e.code === 'Backslash') { e.preventDefault(); if (!e.repeat) dtNew(); return true; }
  if (e.shiftKey && e.code === 'Space') { e.preventDefault(); if (!e.repeat) dtReplay(); return true; }
}
