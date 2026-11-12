/* Staffsounds – Pattern fixer (Keyboard duet). Capture what you play, then let the game tidy it:
   1. timing: every note moves onto the beat grid (and gets a tidy length), with a timing score;
   2. key: stray notes (from a MIDI keyboard) move to the nearest note of the key;
   3. progression: your chords are compared with the standard progressions and nudged to the closest one.
   You can hear the original and the corrected version, and then practise the standard pattern with the glowing keys. */

const FX = { on: false, ev: [], open: {}, tm: [], started: false, fixed: null };

/* ---- capture hooks (called from duet.js and midi.js) ---- */
function fxStart(code, info) {
  if (!FX.on) return;
  const e = Object.assign({ t: performance.now(), end: null }, info); FX.ev.push(e); FX.open[code] = e;
  const s = $('#fxs1'); if (s) s.textContent = 'Capturing: ' + FX.ev.length + (FX.ev.length === 1 ? ' note or chord' : ' notes and chords') + '.';
}
function fxEnd(code) { const e = FX.open[code]; if (e) { e.end = performance.now(); delete FX.open[code]; } }

function fxCapture(on) {
  if (on === FX.on) return;
  FX.on = on; const b = $('#fxc');
  if (b) { b.setAttribute('aria-pressed', on); b.textContent = on ? '■ Stop capturing (/)' : '● Capture my playing (/)'; }
  if (on) {
    fxStopPlay(); FX.ev = []; FX.open = {}; FX.fixed = null; const r = $('#fxr'); if (r) r.innerHTML = '';
    FX.started = false; if ($('#fxb') && $('#fxb').checked && !BT) { beatStart(); FX.started = true; }
    prSay('fxs1', 'Capturing. Play some chords and melody notes, then press slash again to stop.');
  } else {
    const now = performance.now(); Object.keys(FX.open).forEach(k => { FX.open[k].end = now; }); FX.open = {};
    if (FX.started) { beatStop(); FX.started = false; }
    prSay('fxs1', FX.ev.length ? 'Captured ' + FX.ev.length + ' notes and chords. Press Enter to fix them, or Hear what I played.' : 'Nothing was captured. Press slash, then play.');
  }
}

/* ---- playback of captured events ---- */
function fxStopPlay() { FX.tm.forEach(clearTimeout); FX.tm = []; (FX.vs || []).forEach(duStop); FX.vs = []; }
function fxPlay(list) {
  fxStopPlay(); FX.vs = [];
  const bus = duBus();
  list.forEach(e => {
    FX.tm.push(setTimeout(() => {
      const v = e.notes.map(m => duVoice(e.kind === 'chord' ? DU.ci : DU.mi, m, e.kind === 'chord' ? bus.c : bus.m)); FX.vs.push(...v);
      FX.tm.push(setTimeout(() => { v.forEach(duStop); FX.vs = FX.vs.filter(x => !v.includes(x)); }, e.dur));
    }, e.at));
  });
}
const fxRaw = () => { const t0 = FX.ev[0].t; return FX.ev.map(e => ({ kind: e.kind, notes: e.notes, at: e.t - t0, dur: Math.max(120, (e.end || e.t + 300) - e.t) })); };

/* ---- the correction ---- */
const fxInKey = m => dScale().includes((((m - DU.key) % 12) + 12) % 12);
const fxSnap = m => { for (const d of [0, -1, 1, -2, 2]) if (fxInKey(m + d)) return m + d; return m; };
function fxProg(degs) {
  const n = degs.length; let best = null;
  PRK.forEach(name => {
    const P = PRG[name]; if (!P || n < P.length) return;
    for (let r = 0; r < P.length; r++) { let diff = 0; for (let k = 0; k < n; k++) if (P[(k + r) % P.length] !== degs[k]) diff++; const sc = diff + r * 0.01 + PRK.indexOf(name) * 0.0001; if (!best || sc < best.sc) best = { name, P, r, diff, sc }; }
  });
  return best && best.diff <= Math.floor(n / 2) ? best : null;
}
const fxNum = d => D_ROM[d % 7] && (dChord(d, 0).rn);

function fxFix() {
  if (!FX.ev.length) { prSay('fxs1', 'Nothing captured yet. Press slash, play, and press slash again.'); return; }
  fxStopPlay();
  const grid = +$('#fxg').value, step = 60000 / DPR.bpm / grid, t0 = FX.ev[0].t, notes = [], out = [];
  const names = { 1: 'quarter-note', 2: 'eighth-note', 4: 'sixteenth-note' };
  let dev = 0, moved = 0, keyMoves = [];
  const fixed = FX.ev.map(e => {
    const ot = e.t - t0, od = Math.max(60, (e.end || e.t + 300) - e.t), qt = Math.round(ot / step) * step, qd = Math.max(step, Math.round(od / step) * step);
    dev += Math.abs(qt - ot); if (Math.abs(qt - ot) > 10) moved++;
    return Object.assign({}, e, { at: qt, dur: qd, notes: e.notes.slice() });
  });
  if ($('#fxk').checked) fixed.forEach(e => { if (e.kind === 'mel') e.notes = e.notes.map(m => { const f = fxSnap(m); if (f !== m) keyMoves.push(dNote(m) + ' to ' + dNote(f)); return f; }); });
  /* progression */
  const chords = fixed.filter(e => e.kind === 'chord'), degs = chords.map(e => e.ci % 7);
  let progMsg = '', best = null;
  if (chords.length >= 3) {
    best = fxProg(degs);
    if (!best) progMsg = 'You played ' + degs.map(d => dChord(d, 0).rn).join(' ') + '. That is not close to a standard progression, so it is left as your own.';
    else if (best.diff === 0) progMsg = 'You played ' + degs.map(d => dChord(d, 0).rn).join(' ') + ', which is the standard ' + best.name + '. Nothing to fix.';
    else {
      const ch = [];
      chords.forEach((e, k) => { const want = best.P[(k + best.r) % best.P.length]; if (want !== degs[k]) { ch.push('chord ' + (k + 1) + ' from ' + dChord(degs[k], 0).rn + ' (' + dChord(degs[k], 0).name + ') to ' + dChord(want, 0).rn + ' (' + dChord(want, 0).name + ')'); if ($('#fxp').checked) { const ci = want + (e.ci >= 7 && want + 7 < 11 ? 7 : 0), c = dChord(ci, e.sev); e.notes = (e.bass ? [c.bass] : []).concat(c.notes); e.ci = ci; } } });
      progMsg = 'You played ' + degs.map(d => dChord(d, 0).rn).join(' ') + '. The closest standard pattern is ' + best.name + ' (' + best.P.map(d => dChord(d, 0).rn).join(' ') + '). ' + ($('#fxp').checked ? 'Changed ' : 'Would change ') + ch.join('; ') + '.';
    }
  } else if (chords.length) progMsg = 'Play at least three chords to compare with the standard progressions.';
  const mean = dev / fixed.length, score = Math.round(Math.max(0, 1 - mean / (step / 2)) * 100);
  FX.fixed = fixed.map(e => ({ kind: e.kind, notes: e.notes, at: e.at, dur: e.dur }));
  const li = [`Timing: ${score}% on the ${names[grid]} grid (on average ${Math.round(mean)} milliseconds from the beat). ${moved} of ${fixed.length} moved onto the beat.`];
  if ($('#fxk').checked) li.push(keyMoves.length ? 'Key: ' + keyMoves.length + ' stray ' + (keyMoves.length === 1 ? 'note' : 'notes') + ' moved into ' + dName(DU.key) + (DU.minor ? ' minor' : ' major') + ': ' + keyMoves.join(', ') + '.' : 'Key: every note was already in the key.');
  if (progMsg) li.push('Progression: ' + progMsg);
  const r = $('#fxr'); if (r) r.innerHTML = '<h4>What changed</h4><ul>' + li.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' + (best ? '<div class="tools stack"><button type="button" id="fxd">Practise ' + esc(best.name) + ' with the glowing keys</button></div>' : '');
  const d = $('#fxd'); if (d) d.onclick = () => { DPR.prog = PRK.indexOf(best.name); DPR.pi = 0; $('#pg').value = DPR.prog; prMark(); prSay('fxs1', 'Chord practice is set to ' + best.name + '. Press the glowing chord keys.'); };
  speak(li.join(' '));
  say('Fixed. ' + li[0]);
  fxPlay(FX.fixed);
}
function fxOrig() { if (!FX.ev.length) { prSay('fxs1', 'Nothing captured yet.'); return; } if (FX.on) fxCapture(false); fxPlay(fxRaw()); }

/* ---- keys and panel ---- */
function fxKey(e) {
  const b = document.activeElement && document.activeElement.tagName === 'BUTTON';
  if (e.code === 'Slash' && !e.shiftKey) { e.preventDefault(); if (!e.repeat) fxCapture(!FX.on); return true; }
  if (e.key === 'Enter' && !b) { e.preventDefault(); if (!e.repeat) { if (FX.on) fxCapture(false); fxFix(); } return true; }
  return false;
}
function fxHtml() {
  return '<section class="prac" aria-label="Pattern fixer"><h3>Pattern fixer</h3>' +
    '<p class="total">Capture some chords and melody notes, then let the game tidy them: notes move onto the beat, stray notes move into the key, and your chord progression is nudged towards the closest standard pattern. You hear the original and the corrected version.</p>' +
    '<div class="set" role="group" aria-label="Fixer settings"><label>Beat grid <select id="fxg"><option value="1">Quarter notes</option><option value="2" selected>Eighth notes</option><option value="4">Sixteenth notes</option></select></label>' +
    '<label><input type="checkbox" id="fxk" checked>Snap stray notes into the key</label><label><input type="checkbox" id="fxp" checked>Correct the chord progression</label><label><input type="checkbox" id="fxb" checked>Start the backing beat while I capture</label></div>' +
    '<div class="tools stack"><button type="button" id="fxc" class="next" aria-pressed="false">● Capture my playing (/)</button><button type="button" id="fxo">Hear what I played</button><button type="button" id="fxf">Fix it and hear the corrected version (Enter)</button><button type="button" id="fxx">Stop playback</button></div>' +
    '<p id="fxs1" class="total" role="status" aria-live="polite">Press slash to start capturing, play, then press slash again.</p><div id="fxr"></div></section>';
}
function fxWire() {
  FX.on = false; FX.ev = []; FX.open = {}; FX.tm = []; FX.vs = []; FX.started = false;
  $('#fxc').onclick = () => fxCapture(!FX.on); $('#fxo').onclick = fxOrig; $('#fxx').onclick = fxStopPlay;
  $('#fxf').onclick = () => { if (FX.on) fxCapture(false); fxFix(); };
  ['fxg'].forEach(id => { $('#' + id).onchange = e => e.target.blur(); });
}
function fxReset() { FX.on = false; fxStopPlay(); FX.started = false; }
