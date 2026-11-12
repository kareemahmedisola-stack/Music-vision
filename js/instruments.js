/* Staffsounds – instrument playgrounds: guitar, trumpet, saxophone (a transposed piano pad) and drums.
   Every one is playable from the keyboard, announces what it plays, and works with spoken mode. */

let DR = null, DRHIT = null;                     // drum-pattern loop
const stopDr = () => { clearInterval(DR); DR = null; };
const nmo = m => sp(nmOf(m)) + ' ' + (Math.floor(m / 12) - 1);

/* shared screen: top bar, intro, volume, body, live status line */
function shell(m, ttl, intro, body, kd, ku) {
  clearTimer(); TUT_ON = false; stopDr(); allOff(); recStop();
  S = { m, q: {}, i: 99, done: true, live: 1, kd, ku }; OCT = 0; TR = 0; DRHIT = null;
  scrollTo(0, 0);
  app.innerHTML =
    `<div class="top"><button id="bk">← Menu</button><span>${ttl}</span><span></span></div>` +
    `<div class="stage"><h2 class="q" id="qh" tabindex="-1">${lines(intro, 'span')}</h2><canvas id="wv" width="400" height="60" aria-hidden="true"></canvas></div>` +
    `<div class="set" role="group" aria-label="Volume"><label>Volume <input type="range" id="vl" min="0" max="1.6" step=".05" value="${VOL}" style="width:110px"></label>` +
    `<button type="button" id="hl" class="ghost">How to play (lesson)</button></div>${body}` +
    `<div id="nn" role="status" aria-live="polite">Press a key</div>` + recHtml();
  $('#bk').onclick = menu; $('#qh').focus();
  $('#vl').oninput = e => { VOL = +e.target.value; if (MS) MS.gain.value = VOL; };
  $('#hl').onclick = () => tutorial(m);
  liveLoop(); wireRec();
  speak(intro);
}
/* let a note ring, then release it */
const ring = m => { noteOn(m); HELD.delete(m); const v = VO[m]; setTimeout(() => { if (VO[m] === v) rel(m); }, 2200); };

/* ---------------------------------------------------------------- guitar */
const GS = [40, 45, 50, 55, 59, 64], GN = ['low E', 'A', 'D', 'G', 'B', 'high E'];
const CHD = { 'E major': [40, 47, 52, 56, 59, 64], 'A major': [45, 52, 57, 61, 64], 'D major': [50, 57, 62, 66], 'G major': [43, 47, 50, 55, 59, 67], 'C major': [48, 52, 55, 60, 64], 'E minor': [40, 47, 52, 55, 59, 64], 'A minor': [45, 52, 57, 60, 64] };
let FR = 0;
/* arpeggio patterns: indexes into the chord's notes, low string first */
const ARP = { 'Up': n => n, 'Down': n => [...n].reverse(), 'Up and down': n => n.concat([...n].slice(1, -1).reverse()), 'Fingerpicking': n => [0, 2, 3, 2, 1, 2, 3, 2].map(i => n[Math.min(i, n.length - 1)]), 'Broken thirds': n => n.flatMap((x, i) => i + 1 < n.length ? [x, n[i + 1]] : [x]) };
function guitar() {
  INS = 'guitar'; FR = 0;
  let g = '';
  for (let s = 5; s >= 0; s--) {
    g += `<span>${GN[s]}</span>`;
    for (let f = 0; f <= 12; f++) { const m = GS[s] + f; g += `<button type="button" tabindex="-1" data-s="${s}" data-f="${f}" aria-label="${GN[s]} string, fret ${f}, ${nmo(m)}">${nmOf(m).split('/')[0]}</button>`; }
  }
  const pl = (s, f) => { const m = GS[s] + f; ring(m); $('#nn').textContent = GN[s] + ' string, fret ' + f + ': ' + nmo(m); const b = $(`.gt button[data-s="${s}"][data-f="${f}"]`); if (b) { flash(b); const r = b.getBoundingClientRect(); keyFx(r.left + r.width / 2, r.top); } },
    strum = () => { const c = $('#cs').value; CHD[c].forEach((m, i) => setTimeout(() => ring(m), i * 45)); setTimeout(() => { $('#nn').textContent = 'Strummed ' + c; }, CHD[c].length * 45 + 40); },
    setFr = n => { FR = Math.max(0, Math.min(12, n)); $('#fr').textContent = 'Fret ' + FR + (FR ? '' : ', open strings'); $$('.gt button').forEach(b => b.classList.toggle('on', +b.dataset.f === FR)); };
  shell('guitar', 'Guitar', 'Six strings, tuned low to high: E A D G B E. Keys 1 to 6 pluck the strings from lowest to highest. Left and right arrows move the fret. Space strums the chosen chord. A plays an arpeggio, which picks the chord one string at a time. Up and down arrows change the chord.',
    `<div class="set" role="group" aria-label="Guitar controls"><label>Chord <select id="cs">${Object.keys(CHD).map(c => `<option>${c}</option>`).join('')}</select></label>` +
    `<label>Arpeggio pattern <select id="ap">${Object.keys(ARP).map(c => `<option>${c}</option>`).join('')}</select></label>` +
    `<label>Speed <input type="range" id="as" min="60" max="220" value="120" style="width:110px" aria-label="Arpeggio speed in beats per minute"></label></div>` +
    `<div class="tools stack" style="margin:0 0 8px"><button id="fd">Fret down</button><button id="fu">Fret up</button><button id="sm">Strum chord</button><button id="ar" class="next" aria-pressed="false">Play arpeggio (A)</button></div>` +
    `<p id="fr" class="total" role="status" aria-live="polite" style="margin:4px 0">Fret 0, open strings</p>` +
    `<div class="gt" role="group" aria-label="Fretboard. Each row is a string and each column a fret from 0 to 12.">${g}</div>` +
    `<p class="total">${lines('Fret 12 is an octave above the open string. Each fret is one half step.', 'span')}</p>`,
    e => {
      const k = e.key, b = document.activeElement.tagName === 'BUTTON';
      if (k.length === 1 && k >= '1' && k <= '6') { if (!e.repeat) pl(+k - 1, FR); return true; }
      if (k === 'ArrowRight' || k === 'ArrowLeft') { setFr(FR + (k === 'ArrowRight' ? 1 : -1)); e.preventDefault(); return true; }
      if (k === ' ' && !b) { e.preventDefault(); if (!e.repeat) strum(); return true; }
      if ((k === 'a' || k === 'A') && !b) { if (!e.repeat) DR ? arpStop() : arpPlay(); return true; }
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); const c = $('#cs'); c.selectedIndex = (c.selectedIndex + (k === 'ArrowDown' ? 1 : c.length - 1)) % c.length; $('#nn').textContent = 'Chord: ' + c.value; if (DR) arpPlay(); return true; }
    });
  const arpStop = () => { stopDr(); $('#ar').setAttribute('aria-pressed', false); $('#ar').textContent = 'Play arpeggio (A)'; };
  const arpPlay = () => {
    stopDr();
    const c = $('#cs').value, pt = $('#ap').value, seq = ARP[pt](CHD[c]), bpm = +$('#as').value; let i = 0;
    const step = () => ring(seq[i++ % seq.length]);
    step(); DR = setInterval(step, 30000 / bpm);
    $('#ar').setAttribute('aria-pressed', true); $('#ar').textContent = 'Stop arpeggio (A)'; $('#nn').textContent = 'Arpeggio: ' + c + ', ' + pt.toLowerCase() + ', ' + bpm + ' beats per minute';
  };
  $('#ar').onclick = () => DR ? arpStop() : arpPlay();
  $('#cs').onchange = e => { if (DR) arpPlay(); e.target.blur(); }; $('#ap').onchange = e => { if (DR) arpPlay(); e.target.blur(); }; $('#as').onchange = () => { if (DR) arpPlay(); };
  $('#fd').onclick = () => setFr(FR - 1); $('#fu').onclick = () => setFr(FR + 1); $('#sm').onclick = strum; setFr(0);
  $$('.gt button').forEach(b => { b.onpointerdown = e => { e.preventDefault(); pl(+b.dataset.s, +b.dataset.f); }; b.onclick = e => { if (e.detail === 0) pl(+b.dataset.s, +b.dataset.f); }; });
}

/* ---------------------------------------------------------------- trumpet */
let VLV = [0, 0, 0], PRT = 1, TBL = null;
const TP = [58, 65, 70, 74, 77], TPN = ['second', 'third', 'fourth', 'fifth', 'sixth'], trM = () => TP[PRT] - (VLV[0] * 2 + VLV[1] + VLV[2] * 3);
function trUp() {
  const m = trM(), v = VLV.map((x, i) => x ? i + 1 : 0).filter(Boolean);
  [1, 2, 3].forEach(i => { const b = $('#v' + i); if (b) b.setAttribute('aria-pressed', !!VLV[i - 1]); });
  const bw = $('#bl'); if (bw && bw.classList) bw.classList.toggle('blow', TBL != null);
  const n = $('#nn'); if (n) n.textContent = (TBL != null ? 'Playing ' : 'Ready: ') + nmo(m) + '. Valves ' + (v.length ? v.join(' and ') : 'none') + ', ' + TPN[PRT] + ' partial.';
}
function trSync() { const m = trM(); if (TBL != null && TBL !== m) { noteOff(TBL); TBL = m; noteOn(m); } trUp(); }
function trBlow(on) {
  if (on && TBL == null) { TBL = trM(); noteOn(TBL); }
  else if (!on && TBL != null) { noteOff(TBL); TBL = null; }
  trUp();
}
function trumpet() {
  INS = 'trumpet'; VLV = [0, 0, 0]; PRT = 1; TBL = null;
  shell('trumpet', 'Trumpet', 'A B♭ trumpet makes different notes by changing lip tension, called partials, and by pressing valves that lengthen the tube. Hold Space to blow. Hold keys 1, 2 and 3 for the valves. Up and down arrows change the partial.',
    `<div class="opts" role="group" aria-label="Valves"><button type="button" id="v1" aria-pressed="false"><kbd aria-hidden="true">1</kbd>Valve 1 (lowers a whole step)</button><button type="button" id="v2" aria-pressed="false"><kbd aria-hidden="true">2</kbd>Valve 2 (lowers a half step)</button><button type="button" id="v3" aria-pressed="false"><kbd aria-hidden="true">3</kbd>Valve 3 (lowers a step and a half)</button></div>` +
    `<div class="tools stack"><button id="pd2">Lower partial (Down)</button><button id="pu2">Higher partial (Up)</button><button id="bl" class="next">Hold to blow (Space)</button></div>` +
    `<p class="total">${lines('Sounding pitches are shown. Written C on a B♭ trumpet sounds B♭. Open valves give B♭, F, B♭, D, F going up. The valves lower each by up to six half steps.', 'span')}</p>`,
    e => {
      const k = e.key, b = document.activeElement.tagName === 'BUTTON';
      if (k.length === 1 && '123'.includes(k)) { if (!e.repeat) { VLV[k - 1] = 1; trSync(); } return true; }
      if (k === ' ' && !b) { e.preventDefault(); if (!e.repeat) trBlow(1); return true; }
      if (k === 'ArrowUp' || k === 'ArrowDown') { e.preventDefault(); PRT = Math.max(0, Math.min(4, PRT + (k === 'ArrowUp' ? 1 : -1))); trSync(); return true; }
    },
    e => {
      const k = e.key;
      if (k.length === 1 && '123'.includes(k)) { VLV[k - 1] = 0; trSync(); return true; }
      if (k === ' ' && TBL != null) { trBlow(0); return true; }
    });
  [1, 2, 3].forEach(i => { $('#v' + i).onclick = () => { VLV[i - 1] ^= 1; trSync(); }; });
  $('#pd2').onclick = () => { PRT = Math.max(0, PRT - 1); trSync(); }; $('#pu2').onclick = () => { PRT = Math.min(4, PRT + 1); trSync(); };
  const bl = $('#bl');
  bl.onpointerdown = e => { e.preventDefault(); trBlow(1); };
  ['onpointerup', 'onpointerleave', 'onpointercancel'].forEach(x => { bl[x] = () => trBlow(0); });
  bl.onclick = e => { if (e.detail === 0) { trBlow(1); setTimeout(() => trBlow(0), 700); } };
  trUp();
}

/* ---------------------------------------------------------------- saxophone: the piano pad, transposed */
/* half steps from the written note to the sounding note: alto E♭ = −9 (a major sixth down), tenor B♭ = −14 (a major ninth down),
   soprano B♭ = −2 (a whole step down), baritone E♭ = −21 (an octave and a major sixth down) */
const SX = { 'Alto (E♭)': -9, 'Tenor (B♭)': -14, 'Soprano (B♭)': -2, 'Baritone (E♭)': -21 };
function sax() {
  free('sax', 'Saxophone');
  $('.set').insertAdjacentHTML('afterbegin', '<label>Saxophone <select id="sx">' + Object.keys(SX).map(k => `<option>${k}</option>`).join('') + '</select></label>');
  const intro = 'Saxophone. Press the keys as written notes. The display tells you what really sounds, because saxophones are transposing instruments. Choose alto, tenor, soprano or baritone.';
  $('#qh').innerHTML = lines(intro, 'span');
  $('.set').insertAdjacentHTML('beforeend', '<button type="button" id="hl" class="ghost">How to play (lesson)</button>'); $('#hl').onclick = () => tutorial('sax');
  const st = () => { allOff(); TR = SX[$('#sx').value]; relabel(); $('#nn').textContent = 'Written C4 sounds ' + nmo(60 + TR); };
  $('#sx').onchange = st; st();
}

/* ---------------------------------------------------------------- drums */
/* pad order and width (4 columns): crash, high tom, mid tom, ride / open hat, closed hat, floor tom / snare, kick */
const KIT = [[',', 1], ['m', 1], ['n', 1], ['.', 1], ['v', 1], ['c', 1], ['b', 2], ['x', 2], ['z', 2]];
const PERC = [['a', 1], ['s', 1], ['d', 1], ['f', 1], ['g', 1], ['h', 1]];
function drums() {
  shell('drums', 'Drums', 'A drum kit laid out like the real thing, with the snare and kick side by side at the bottom. Every key is a different drum. Z kick, X snare, C closed hi-hat, V open hi-hat, M high tom, N mid tom, B floor tom, comma crash, full stop ride. The percussion pads are A rim shot, S hand clap, D cowbell, F high conga, G low conga and H shaker.',
    `<div class="opts kit" role="group" aria-label="Drum pads, laid out like a kit seen from the drummer's seat: cymbals and toms on top, hi-hats on the left, and the snare and kick side by side at the bottom">${KIT.map(([k, w]) => { const v = DK[k]; return `<button type="button" class="${v[0]}" data-d="${v[0]}" data-n="${v[1]}" style="grid-column:span ${w}"><kbd aria-hidden="true">${k === '.' ? '.' : k.toUpperCase()}</kbd>${v[1]}</button>`; }).join('')}</div>` +
    `<h3 class="pch">Percussion</h3><div class="opts kit perc" role="group" aria-label="Percussion pads: rim shot, hand clap, cowbell, high and low conga, shaker">${PERC.map(([k]) => { const v = DK[k]; return `<button type="button" class="${v[0]}" data-d="${v[0]}" data-n="${v[1]}"><kbd aria-hidden="true">${k.toUpperCase()}</kbd>${v[1]}</button>`; }).join('')}</div>` +
    `<div class="set" role="group" aria-label="Beat player"><label>Pattern <select id="dp">${Object.keys(DP).map(k => `<option>${k}</option>`).join('')}</select></label>` +
    `<label>Tempo <input type="range" id="bp" min="60" max="180" value="100" style="width:120px" aria-label="Tempo in beats per minute"></label>` +
    `<button type="button" id="pp" class="next" style="margin:0" aria-pressed="false">Play pattern</button></div><p class="total" id="pdesc">${DP['Rock 4/4'][2]}</p>`,
    e => { const d = DK[e.key.toLowerCase()]; if (d && e.key.length === 1) { if (!e.repeat) hit(d[0], d[1]); return true; } });
  const hit = (k, n) => { drum(k); $('#nn').textContent = n; const b = $(`[data-d="${k}"]`); if (b) { flash(b); const r = b.getBoundingClientRect(); ripple(r.left + r.width / 2, r.top + r.height / 2, '#f0b43c', 80); burst(r.left + r.width / 2, r.top, null, 6, { up: 1, fast: 6, g: .15 }); } };
  DRHIT = hit;
  const play = () => {
    stopDr();
    const name = $('#dp').value, p = DP[name], bpm = +$('#bp').value, bar = p[0] * 60 / bpm / 4 * 1000;
    playPat(name, 1, bpm); DR = setInterval(() => playPat(name, 1, bpm), bar);
    $('#pp').setAttribute('aria-pressed', true); $('#pp').textContent = 'Stop pattern'; say(p[2]);
  };
  const stop = () => { stopDr(); $('#pp').setAttribute('aria-pressed', false); $('#pp').textContent = 'Play pattern'; };
  $$('[data-d]').forEach(b => { b.onpointerdown = e => { e.preventDefault(); hit(b.dataset.d, b.dataset.n); }; b.onclick = e => { if (e.detail === 0) hit(b.dataset.d, b.dataset.n); }; });
  $('#pp').onclick = () => DR ? stop() : play();
  $('#dp').onchange = () => { $('#pdesc').textContent = DP[$('#dp').value][2]; if (DR) play(); };
  $('#bp').onchange = () => { if (DR) play(); };
}

/* menu key -> screen */
const LIVE = { free: () => free(), duet: () => duet(), voice: () => voice(), guitar, trumpet, sax, drums };
