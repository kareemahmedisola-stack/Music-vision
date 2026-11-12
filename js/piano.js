/* Staffsounds – on-screen piano, computer-keyboard piano and the Piano playground */

/* computer key -> MIDI note, laid out like a piano: home row = white keys, row above = black keys.
   A S D F G H J K L ; ' = C4 up to F5. W E T Y U O P = the sharps and flats between them. */
const KM = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75, ';': 76, "'": 77 };
const KH = {};
Object.keys(KM).forEach(k => { KH[KM[k]] = (KH[KM[k]] ? KH[KM[k]] + '/' : '') + k.toUpperCase(); });

let VO = {}, HELD = new Set(), OCT = 0, PED = false, PREF = 'both';
let TR = 0;              // transposition in half steps (saxophone: written note -> sounding note)

/* in a quiz, piano keys are opt-in; in the playground they are on by default */
const pkOn = () => (S && S.live ? opt('pk', true) !== false : opt('pk', false) === true);

function pkInner() {
  const on = pkOn(), ask = (P.set || {}).pk === undefined && !(S && S.live);
  return ask
    ? '<p>' + lines('<b>Play notes with your computer keyboard?</b> Keys A W S E D F T G Y H U J K O L P ; and apostrophe will play from middle C up to the F above the next C, sharps and flats included. The number keys still choose answers.', 'span') + '</p><div class="tools stack" style="margin:0"><button type="button" id="pky">Turn on piano keys</button><button type="button" id="pkn">Not now</button></div>'
    : '<div class="tools" style="margin:0"><button type="button" id="pkt" aria-pressed="' + on + '">Computer keyboard as piano: ' + (on ? 'ON' : 'OFF') + '</button></div>';
}
const pkHtml = () => '<div class="kp" id="kp">' + pkInner() + '</div>';
function wirePk() {
  const set = v => {
    P.set = P.set || {}; P.set.pk = v; save();
    $('#kp').innerHTML = pkInner(); wirePk();
    const t = $('#pkt'); if (t) t.focus();
    say('Computer keyboard piano ' + (v ? 'on' : 'off'));
  };
  const y = $('#pky'), n = $('#pkn'), t = $('#pkt');
  if (y) y.onclick = () => set(true);
  if (n) n.onclick = () => set(false);
  if (t) t.onclick = () => set(!pkOn());
}

const NM2 = ['C', 'C♯/D♭', 'D', 'D♯/E♭', 'E', 'F', 'F♯/G♭', 'G', 'G♯/A♭', 'A', 'A♯/B♭', 'B'];
const sp = n => n.replace(/♯/g, ' sharp').replace(/♭/g, ' flat').replace('/', ' or ');
function nmOf(m) {
  const i = m % 12, s = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][i], f = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'][i];
  return PREF === 'sharp' ? s : PREF === 'flat' ? f : (s === f ? s : s + '/' + f);
}

function piano(n, base) {
  n = n || 18; base = base || 60;
  return '<div class="pn' + (n > 20 ? ' w' : '') + '" role="group" aria-label="Piano. On your computer keyboard, A S D F G H J K L semicolon and apostrophe are the white keys from middle C, and W E T Y U O P are the sharps and flats between them. Hold a key to sustain.">' +
    [...Array(n).keys()].map(i => {
      const m = base + i, bk = [1, 3, 6, 8, 10].includes(i % 12);
      return `<button type="button" data-h="${KH[m] || ''}" data-k="${m}" class="${bk ? 'b' : ''}" aria-label="${sp(NM2[m % 12])}">${bk ? '' : NM2[m % 12]}</button>`;
    }).join('') + '</div>';
}

function wirePiano() {
  $$('.pn button').forEach(b => {
    const dn = () => { b._m = +b.dataset.k + (S && S.live ? OCT * 12 + TR : 0); noteOn(b._m); };
    const up = () => { if (b._m != null) { noteOff(b._m); b._m = null; } };
    b.onpointerdown = e => { e.preventDefault(); dn(); };
    b.onpointerup = up; b.onpointerleave = up; b.onpointercancel = up;
    b.onpointerenter = e => { if (e.buttons === 1 && e.pointerType === 'mouse') dn(); };   // glissando with the mouse
    b.oncontextmenu = e => e.preventDefault();
    b.onclick = e => { if (e.detail === 0) { dn(); setTimeout(up, 450); } };                 // keyboard activation
  });
}

/* ---- note on / off with visual feedback ---- */
function vis(k, on) {
  const b = $('.pn [data-k="' + k + '"]');
  if (!b) return;
  b.classList.toggle('on', !!on);
  if (on) { const r = b.getBoundingClientRect(); keyFx(r.left + r.width / 2, r.top); }
}
function noteOn(m) {
  if (VO[m]) { if (HELD.has(m)) return; rel(m); }
  const v = startVoice(m);
  VO[m] = { g: v.g, os: v.os, k: m - OCT * 12 - TR };
  HELD.add(m); vis(m - OCT * 12 - TR, 1); lsAdd([m]);
  const e = $('#nn');
  if (e) { const n = (TR ? 'Written ' + nmOf(m - TR) + ', sounds ' : '') + nmOf(m) + ' · octave ' + (Math.floor(m / 12) - 1); e.innerHTML = '<span aria-hidden="true">' + n + '</span><span class="sr">' + sp(n) + '</span>'; }
}
function rel(m) {
  const v = VO[m];
  if (!v) return;
  delete VO[m]; stopVoice(v); vis(v.k, 0);
}
function noteOff(m) { HELD.delete(m); if (!PED) rel(m); }
function pedal(on) {
  PED = on;
  const b = $('#pd'); if (b) b.setAttribute('aria-pressed', on);
  if (!on) Object.keys(VO).forEach(k => { if (!HELD.has(+k)) rel(+k); });
}
function allOff() {
  if (typeof duOffAll === 'function') duOffAll();
  if (typeof prStop === 'function') prStop();
  if (!ac) return;
  Object.keys(VO).forEach(k => rel(+k));
  HELD.clear(); PED = false;
}
function relabel() {
  $$('.pn.w button').forEach(b => {
    const m = +b.dataset.k + OCT * 12, n = nmOf(m);
    b.setAttribute('aria-label', TR ? 'Written ' + sp(n) + ' octave ' + (Math.floor(m / 12) - 1) + ', sounds ' + sp(nmOf(m + TR)) + ' octave ' + (Math.floor((m + TR) / 12) - 1) : sp(n) + ' octave ' + (Math.floor(m / 12) - 1));
    if (!b.classList.contains('b')) b.textContent = n;
  });
}
function setOct(d) {
  const n = Math.max(-2, Math.min(2, OCT + d));
  if (n === OCT) return;
  allOff(); OCT = n; relabel();
  $('#ol').textContent = 'Octave ' + (4 + OCT) + (OCT ? '' : ' (middle C is C4)');
  say('Octave ' + (4 + OCT));
}

/* oscilloscope strip in the playground */
let LV = 0;
function liveLoop() {
  if (reduceMotion()) return;
  const c = $('#wv'); if (!c) return;
  const x = c.getContext('2d'), d = new Uint8Array(512), id = ++LV;
  (function f() {
    if (id !== LV || !$('#wv') || !S || !S.live) return;
    x.clearRect(0, 0, 400, 60); x.strokeStyle = '#0e1726'; x.lineWidth = 2.5; x.shadowColor = '#f0b43c'; x.shadowBlur = 8; x.beginPath();
    if (AN) { AN.getByteTimeDomainData(d); for (let i = 0; i < 256; i++) { const px = i * 400 / 255, py = d[i] / 255 * 60; i ? x.lineTo(px, py) : x.moveTo(px, py); } }
    else { x.moveTo(0, 30); x.lineTo(400, 30); }
    x.stroke(); requestAnimationFrame(f);
  })();
}

/* ---- the Piano playground screen ---- */
function free(ins, ttl) {
  clearTimer(); TUT_ON = false; stopDr(); allOff(); recStop();
  S = { m: 'free', q: {}, i: 99, done: true, live: 1 }; OCT = 0; TR = 0; INS = ins || 'piano';
  scrollTo(0, 0);
  app.innerHTML =
    '<div class="top"><button id="bk">← Menu</button><span>' + (ttl || 'Piano playground') + '</span><span></span></div>' +
    '<div class="stage"><h2 class="q" id="qh" tabindex="-1">' + lines('Live piano. Hold a key to keep a note sounding. Black keys are sharps and flats, each with two names.', 'span') + '</h2><canvas id="wv" width="400" height="60" aria-hidden="true" style="width:100%;max-width:420px;height:60px"></canvas></div>' +
    '<div class="set" role="group" aria-label="Piano controls"><label>Sound <select id="in"><option value="piano">Piano</option><option value="organ">Organ</option><option value="bell">Bell</option><option value="synth">Synth</option><option value="guitar">Guitar</option><option value="trumpet">Trumpet</option><option value="strings">Strings</option><option value="violin">Violin</option><option value="pstr">Piano and strings</option><option value="flute">Flute</option><option value="sax">Saxophone</option></select></label><label>Volume <input type="range" id="vl" min="0" max="1.6" step=".05" value="' + VOL + '" style="width:110px"></label><label>Black keys <select id="pf"><option value="both">Sharp and flat</option><option value="sharp">Sharps</option><option value="flat">Flats</option></select></label><label><input type="checkbox" id="an" checked>Announce notes</label></div>' +
    '<div class="tools" style="margin:0 0 8px"><button id="octd">Octave down</button><button id="octu">Octave up</button><button id="pd" aria-pressed="false">Sustain pedal (Space)</button></div><p id="ol" class="total" style="margin:4px 0">Octave 4 (middle C is C4)</p>' + pkHtml() +
    '<div class="pn w" role="group" aria-label="Piano keys, two octaves from C to C">' +
    [...Array(25).keys()].map(i => '<button type="button" data-h="' + (KH[60 + i] || '') + '" data-k="' + (60 + i) + '" tabindex="' + (i ? -1 : 0) + '" class="' + ([1, 3, 6, 8, 10].includes(i % 12) ? 'b' : '') + '"></button>').join('') +
    '</div><div id="nn" role="status" aria-live="polite">Press a key</div>' +
    '<p class="total">Computer keys follow a piano: A S D F G H J K L semicolon and apostrophe are the white keys from middle C up to the F above the next C, and W E T Y U O P are the black keys, the sharps and flats between them. The left and right arrows shift the octave down and up. Hold Shift with the arrows to move between the on-screen keys, and press Enter or Space to play the focused key.</p>' + lsHtml() + recHtml();
  $('#bk').onclick = menu; $('#qh').focus(); relabel();
  $('#in').value = INS; $('#in').onchange = e => { INS = e.target.value; };
  $('#vl').oninput = e => { VOL = +e.target.value; if (MS) MS.gain.value = VOL; };
  $('#pf').onchange = e => { PREF = e.target.value; relabel(); };
  $('#an').onchange = e => $('#nn').setAttribute('aria-live', e.target.checked ? 'polite' : 'off');
  $('#octd').onclick = () => setOct(-1); $('#octu').onclick = () => setOct(1); $('#pd').onclick = () => pedal(!PED);
  wirePiano(); wirePk(); liveLoop(); wireRec(); lsWire();
}

/* ---- keyboard handling for the piano ---- */
document.addEventListener('keydown', e => {
  if (!S || TUT_ON || e.ctrlKey || e.metaKey || e.altKey) return;
  const f = document.activeElement, tg = f && f.tagName, onK = f && tg === 'BUTTON' && f.closest('.pn');
  if (tg === 'SELECT' || (tg === 'INPUT' && f.type !== 'checkbox')) return;
  if (S.kd && S.kd(e)) return;                       // instrument screens (guitar, trumpet, drums) handle their own keys
  const kk = e.key.length === 1 ? e.key.toLowerCase() : e.key, mn = KM[kk];
  if (mn != null && $('.pn') && pkOn()) { e.preventDefault(); if (!e.repeat) noteOn(mn + (S.live ? OCT * 12 + TR : 0)); return; }
  if (!S.live) return;
  if (e.key === ' ' && tg !== 'BUTTON') { e.preventDefault(); if (!e.repeat) pedal(true); return; }
  if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !(e.shiftKey && onK)) { e.preventDefault(); setOct(e.key === 'ArrowRight' ? 1 : -1); return; }
  if (onK) {
    const bs = $$('.pn button'), i = bs.indexOf(f);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const n = bs[i + (e.key === 'ArrowRight' ? 1 : -1)];
      if (n) { f.tabIndex = -1; n.tabIndex = 0; n.focus(); }
    } else if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      e.preventDefault(); f._m = +f.dataset.k + OCT * 12 + TR; noteOn(f._m);
    }
  }
});
document.addEventListener('keyup', e => {
  if (!S) return;
  if (S.ku && S.ku(e)) return;
  const f = document.activeElement;
  if (S.live) {
    if ((e.key === 'Enter' || e.key === ' ') && f && f._m != null) { noteOff(f._m); f._m = null; return; }
    if (e.key === ' ' && !(f && f.tagName === 'BUTTON')) { pedal(false); return; }
  }
  const kk = e.key.length === 1 ? e.key.toLowerCase() : e.key, mn = KM[kk];
  if (mn != null) noteOff(mn + (S.live ? OCT * 12 + TR : 0));
});
