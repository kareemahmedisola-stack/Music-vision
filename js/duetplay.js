/* Staffsounds – duet practice: a backing beat, chord progressions to follow, and a play-the-melody challenge.
   Hooks used by duet.js: prHtml(), prWire(), prPress(), prKey(), prRefresh(), prStop(). */

const PRG = { 'Free play (no pattern)': null, 'I V vi IV (pop)': [0, 4, 5, 3], 'I IV V I (classic cadence)': [0, 3, 4, 0], 'vi IV I V': [5, 3, 0, 4], 'I vi IV V (50s)': [0, 5, 3, 4], 'ii V I (jazz)': [1, 4, 0], 'Canon (Pachelbel)': [0, 4, 5, 2, 3, 0, 3, 4], 'Twelve-bar blues': [0, 0, 0, 0, 3, 3, 0, 0, 4, 3, 0, 4] };
const PRK = Object.keys(PRG), BEATS = ['Metronome 4/4', 'Metronome 3/4', 'Rock 4/4', 'Funk', 'Disco, four on the floor', 'Waltz 3/4'];
const DPR = { bpm: 100, bi: 0, prog: 0, pi: 0, loops: 0, miss: 0 };
const CHAL = { n: 3, streak: 0, st: 'idle', seq: [], pos: 0, miss: 0, timers: [], vs: [], hint: 1 };
let BT = null;

const prSay = (id, t) => { const e = $('#' + id); if (e) e.textContent = t; if (id !== 'prs' || t) speak(t); };

/* ---------------------------------------------------------------- backing beat */
function beatDot(n) { $$('#bd i').forEach((d, i) => d.classList.toggle('on', i === n - 1)); }
function beatStop() {
  stopDr(); BT = null; beatDot(0);
  const b = $('#bgo'); if (b) { b.setAttribute('aria-pressed', false); b.textContent = 'Start backing beat (B)'; }
}
function beatStart() {
  beatStop();
  const a = eng(); BT = { next: a.currentTime + 0.08, s: 0 };
  const tick = () => {
    const p = DP[BEATS[DPR.bi]], step = 60 / DPR.bpm / 4;
    while (BT && BT.next < a.currentTime + 0.25) {
      const s = BT.s % p[0], w = Math.max(0, BT.next - a.currentTime);
      for (const k in p[1]) if (p[1][k].includes(s)) drum(k, w);
      if (s % 4 === 0) { const n = (s / 4) + 1; setTimeout(() => beatDot(n), w * 1000); }
      BT.next += step; BT.s++;
    }
  };
  tick(); DR = setInterval(tick, 40);
  const b = $('#bgo'); if (b) { b.setAttribute('aria-pressed', true); b.textContent = 'Stop backing beat (B)'; }
  say(BEATS[DPR.bi] + ' at ' + DPR.bpm + ' beats per minute');
}
const beatToggle = () => BT ? beatStop() : beatStart();
function setBpm(v) { DPR.bpm = Math.max(60, Math.min(200, v)); const r = $('#bpm'); if (r) r.value = DPR.bpm; const o = $('#bpmv'); if (o) o.textContent = DPR.bpm; }

/* ---------------------------------------------------------------- chord progressions */
const prSeq = () => PRG[PRK[DPR.prog]];
function prRefresh() {
  if (CHAL.st === 'listen' || CHAL.st === 'answer') chCancel('Melody challenge stopped because the key or octave changed. Press backslash for a new melody.');
  DPR.pi = 0; prMark();
}
function prMark() {
  const d = prSeq();
  $$('.duet .chd button').forEach((b, i) => b.classList.toggle('next', !!d && i % 7 === d[DPR.pi] && i < 11));
  if (!$('#prs')) return;
  if (!d) { $('#prs').textContent = 'Free play. Choose a progression to be guided chord by chord.'; return; }
  $('#prs').textContent = 'Progression in ' + dName(DU.key) + (DU.minor ? ' minor' : ' major') + ': ' + d.map(x => dChord(x, 0).name).join(', ') + '. Next chord: ' + dChord(d[DPR.pi], 0).name + ' (key ' + DCL[d[DPR.pi]] + ').';
}
function prChord(ci) {
  const d = prSeq(); if (!d) return;
  const want = dChord(d[DPR.pi], 0), key = DCL[d[DPR.pi]];
  if (ci % 7 === d[DPR.pi]) {
    DPR.pi++;
    if (DPR.pi >= d.length) { DPR.pi = 0; DPR.loops++; prMark(); const t = 'Round ' + DPR.loops + ' complete' + (DPR.miss ? ' with ' + DPR.miss + ' wrong. ' : ', no mistakes. ') + 'Next chord: ' + dChord(d[0], 0).name + ' (key ' + DCL[d[0]] + ').'; $('#prs').textContent = t; speak(t); DPR.miss = 0; }
    else { prMark(); speak('Good. Next ' + dChord(d[DPR.pi], 0).words); }
  } else { DPR.miss++; const t = 'Not that one. Press ' + want.name + ' (key ' + key + ').'; $('#prs').textContent = t; speak(t); }
}

/* ---------------------------------------------------------------- melody challenge */
function chStats() { const p = pm('duet'), e = $('#chst'); if (e) e.textContent = 'Melody length ' + CHAL.n + ' notes. Streak ' + CHAL.streak + '. Best streak ' + (p.best || 0) + '. Melodies solved ' + (p.right || 0) + '.'; }
function chCancel(msg) {
  CHAL.timers.forEach(clearTimeout); CHAL.timers = [];
  CHAL.vs.forEach(duStop); CHAL.vs = [];
  $$('.duet .mel button.hint').forEach(b => b.classList.remove('hint'));
  if (CHAL.st !== 'idle' && CHAL.st !== 'done') CHAL.streak = 0;
  CHAL.st = 'idle'; if (msg) prSay('chs', msg);
}
function chBuild() {
  const top = CHAL.n < 6 ? 7 : 9, seq = [pick([0, 2, 4])];
  while (seq.length < CHAL.n) {
    let n = seq[seq.length - 1] + pick([-2, -1, -1, 1, 1, 2, Math.random() < .2 ? 3 : 1, Math.random() < .2 ? -3 : -1]);
    n = Math.max(0, Math.min(top, n)); if (n === seq[seq.length - 1]) n = Math.min(top, n + 1) === n ? n - 1 : n + 1;
    seq.push(n);
  }
  return seq;
}
const chHint = (idx, ms) => { const b = $('.duet [data-c="' + DM[idx] + '"]'); if (b) { b.classList.add('hint'); CHAL.timers.push(setTimeout(() => b.classList.remove('hint'), ms)); } };
function chPlay() {
  CHAL.timers.forEach(clearTimeout); CHAL.timers = []; CHAL.vs.forEach(duStop); CHAL.vs = [];
  const dur = 60 / DPR.bpm, bus = duBus().m; CHAL.st = 'listen'; CHAL.pos = 0;
  prSay('chs', 'Listen: ' + CHAL.n + ' notes.');
  CHAL.seq.forEach((idx, i) => {
    CHAL.timers.push(setTimeout(() => {
      const v = duVoice(DU.mi, dMel(idx), bus); CHAL.vs.push(v);
      CHAL.timers.push(setTimeout(() => { duStop(v); CHAL.vs = CHAL.vs.filter(x => x !== v); }, dur * 850));
      if (CHAL.hint === 2 || (CHAL.hint === 1 && i === 0)) chHint(idx, dur * 900);
    }, 300 + i * dur * 1000));
  });
  CHAL.timers.push(setTimeout(() => { CHAL.st = 'answer'; prSay('chs', 'Your turn. Play the ' + CHAL.n + ' notes on the top row. ' + (CHAL.hint ? '' : 'No hints. ') + 'Space plays it again.'); }, 300 + CHAL.n * dur * 1000));
}
function chNew() {
  if (CHAL.st === 'listen' || CHAL.st === 'answer') CHAL.streak = 0;
  chCancel(); CHAL.seq = chBuild(); CHAL.miss = 0; chStats(); chPlay();
}
function chReplay() { if (!CHAL.seq.length || CHAL.st === 'listen') return; if (CHAL.st === 'done') CHAL.miss = 0; chPlay(); }
function chNote(mi) {
  if (CHAL.st !== 'answer') return;
  const exp = CHAL.seq[CHAL.pos];
  if (mi % 7 === exp % 7) {
    CHAL.pos++;
    if (CHAL.pos < CHAL.n) { prSay('chs', 'Correct. ' + CHAL.pos + ' of ' + CHAL.n + '.'); return; }
    const stars = CHAL.miss === 0 ? 3 : CHAL.miss <= 2 ? 2 : 1, p = pm('duet');
    p.seen = (p.seen || 0) + 1; p.right = (p.right || 0) + 1; p.xp += 10 * stars; CHAL.streak++; p.best = Math.max(p.best || 0, CHAL.streak); save();
    if (stars > 1 && CHAL.n < 8) CHAL.n++; else if (stars === 1 && CHAL.n > 3) CHAL.n--;
    CHAL.st = 'done'; chStats();
    prSay('chs', 'Melody solved, ' + stars + (stars === 1 ? ' star' : ' stars') + '. It was ' + CHAL.seq.map(i => sp(dNote(dMel(i)))).join(', ') + '. Press backslash for the next melody.');
  } else {
    CHAL.miss++;
    prSay('chs', 'Not that note. ' + (CHAL.miss % 3 === 0 ? 'Here is a hint.' : 'Try again, or press Space to hear it again.'));
    if (CHAL.miss % 3 === 0) chHint(exp, 1400);
  }
}
function prStop() { if (typeof vsStop === 'function') vsStop(); if (typeof spStop === 'function') spStop(); if (typeof dtCancel === 'function') dtCancel(); chCancel(); BT = null; if (typeof fxReset === 'function') fxReset(); }

/* ---------------------------------------------------------------- hooks */
function prPress(mi, ci) { if (mi >= 0) { chNote(mi); spPress(mi); } if (ci >= 0) { prChord(ci); dtPress(ci); } }
function prKey(e) {
  const c = e.code, b = document.activeElement && document.activeElement.tagName === 'BUTTON';
  if (dtKey(e)) return true;
  if (e.repeat) return ['KeyB', 'KeyV', 'KeyN', 'KeyC', 'KeyM', 'Backslash', 'Space'].includes(c);
  if (c === 'Backquote' && e.shiftKey) { e.preventDefault(); spStart(); return true; }
  if (c === 'KeyB') { e.preventDefault(); beatToggle(); return true; }
  if (c === 'KeyV') { e.preventDefault(); DPR.bi = (DPR.bi + 1) % BEATS.length; $('#bt').value = DPR.bi; if (BT) beatStart(); else say(BEATS[DPR.bi]); return true; }
  if (c === 'KeyC' || c === 'KeyM') { e.preventDefault(); setBpm(DPR.bpm + (c === 'KeyM' ? 5 : -5)); say(DPR.bpm + ' beats per minute'); return true; }
  if (c === 'KeyN') { e.preventDefault(); DPR.prog = (DPR.prog + 1) % PRK.length; DPR.pi = 0; $('#pg').value = DPR.prog; prMark(); say($('#prs').textContent); return true; }
  if (c === 'Backslash') { e.preventDefault(); chNew(); return true; }
  if (c === 'Space' && !b && CHAL.seq.length) { e.preventDefault(); chReplay(); return true; }
  return false;
}
function prHtml() {
  const o = (list, sel) => list.map((t, i) => '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + t + '</option>').join('');
  return '<section class="prac" aria-label="Backing beat"><h3>Backing beat</h3><div class="set"><label>Beat <select id="bt">' + o(BEATS, DPR.bi) + '</select></label>' +
    '<label>Tempo <input type="range" id="bpm" min="60" max="200" value="' + DPR.bpm + '" style="width:120px" aria-label="Tempo in beats per minute"> <output id="bpmv">' + DPR.bpm + '</output> bpm</label></div>' +
    '<div class="tools stack"><button type="button" id="bgo" class="next" aria-pressed="false">Start backing beat (B)</button></div><div class="bdots" id="bd" aria-hidden="true"><i></i><i></i><i></i><i></i></div>' +
    '<p class="total">V changes the beat, C and M slow down and speed up. The beat is recorded when you record the instruments.</p></section>' +
    '<section class="prac" aria-label="Chord practice"><h3>Chord practice</h3><div class="set"><label>Progression <select id="pg">' + o(PRK, DPR.prog) + '</select></label></div>' +
    '<p id="prs" class="total" role="status" aria-live="polite"></p><p class="total">The chord to press glows on the home row. N picks the next progression.</p></section>' +
    '<section class="prac" aria-label="Melody challenge"><h3>Melody challenge</h3><div class="set"><label>Hints <select id="chh"><option value="0">None, ear only</option><option value="1" selected>Show the first note</option><option value="2">Show every note</option></select></label></div>' +
    '<div class="tools stack"><button type="button" id="chn" class="next">New melody (backslash)</button><button type="button" id="chr">Hear it again (Space)</button></div>' +
    '<p id="chs" class="total" role="status" aria-live="polite">Press New melody. You hear a short tune, then play it back on the top row.</p><p id="chst" class="total"></p></section>';
}
function prWire() {
  CHAL.st = 'idle'; CHAL.seq = []; CHAL.timers = []; CHAL.vs = []; DPR.pi = 0; DPR.loops = 0; DPR.miss = 0; BT = null;
  const sel = (id, fn) => { $(id).onchange = e => { fn(+e.target.value); e.target.blur(); }; };
  sel('#bt', v => { DPR.bi = v; if (BT) beatStart(); });
  sel('#pg', v => { DPR.prog = v; DPR.pi = 0; prMark(); });
  sel('#chh', v => { CHAL.hint = v; });
  $('#bpm').oninput = e => setBpm(+e.target.value);
  $('#bgo').onclick = beatToggle; $('#chn').onclick = chNew; $('#chr').onclick = chReplay;
  prMark(); chStats();
}
