/* Staffsounds – Keyboard duet. The top row plays a melody, the home row plays chords, both in the key you choose, so any two
   keys sound good together. One person can play both hands; two people can share a keyboard, one on each row.
   Keys are read by position (event.code), so it works on any keyboard layout. */

const DM = ['KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight'], DML = 'QWERTYUIOP[]'.split('');
const DC = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', 'Quote'], DCL = 'ASDFGHJKL;\''.split('');
const D_MAJ = [0, 2, 4, 5, 7, 9, 11], D_MIN = [0, 2, 3, 5, 7, 8, 10];
const D_SH = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'], D_FL = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
const D_ROM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
const D_NUM = ['Digit1','Digit2','Digit3','Digit4','Digit5','Digit6','Digit7','Digit8','Digit9','Digit0','Minus','Equal'];
const DU = { key: 0, minor: 0, mo: 0, co: 0, mi: 'piano', ci: 'organ', mv: 1, cv: 0.55, bass: 1 };
let DV = {}, DBUS = null, DSEV = 0;

const dScale = () => DU.minor ? D_MIN : D_MAJ;
const dDeg = i => dScale()[((i % 7) + 7) % 7] + 12 * Math.floor(i / 7);
const dTon = base => base + (DU.key > 6 ? DU.key - 12 : DU.key);                  // tonic as a MIDI note near the base
const dFlat = () => DU.minor ? [0, 2, 5, 7, 10].includes(DU.key) : [5, 10, 3, 8, 1].includes(DU.key);
const dName = pc => (dFlat() ? D_FL : D_SH)[((pc % 12) + 12) % 12];
const dNote = m => dName(m) + ' ' + (Math.floor(m / 12) - 1);
const dMel = i => dTon(60) + 12 * DU.mo + dDeg(i);

/* a chord on home-row key i: triad (or seventh chord) built on scale degree i, with its name and Roman numeral */
function dChord(i, sev) {
  const base = dTon(48) + 12 * DU.co, d = [dDeg(i), dDeg(i + 2), dDeg(i + 4)].concat(sev ? [dDeg(i + 6)] : []);
  const th = d[1] - d[0], fi = d[2] - d[0], se = sev ? d[3] - d[0] : 0, root = base + d[0];
  const q = th === 4 ? (fi === 8 ? 'aug' : 'maj') : (fi === 6 ? 'dim' : 'min');
  let suf = q === 'maj' ? '' : q === 'min' ? 'm' : q === 'dim' ? '°' : '+', long = q === 'maj' ? 'major' : q === 'min' ? 'minor' : q === 'dim' ? 'diminished' : 'augmented';
  if (sev) {
    if (q === 'maj') { suf = se === 11 ? 'maj7' : '7'; long = se === 11 ? 'major seventh' : 'dominant seventh'; }
    else if (q === 'min') { suf = se === 11 ? 'm(maj7)' : 'm7'; long = 'minor seventh'; }
    else if (q === 'dim') { suf = se === 9 ? '°7' : 'ø7'; long = se === 9 ? 'diminished seventh' : 'half-diminished seventh'; }
  }
  const r = D_ROM[i % 7], rn = (q === 'maj' || q === 'aug') ? r : r.toLowerCase();
  return { notes: d.map(x => base + x), root, bass: root - 12, name: dName(root) + suf, words: dName(root) + ' ' + long, rn: rn + (q === 'dim' ? '°' : q === 'aug' ? '+' : '') + (sev ? '7' : '') };
}

function duBus() {
  if (!DBUS) { const a = eng(); DBUS = { m: a.createGain(), c: a.createGain() }; DBUS.m.connect(MS); DBUS.c.connect(MS); }
  DBUS.m.gain.value = DU.mv; DBUS.c.gain.value = DU.cv;
  return DBUS;
}
function duVoice(ins, m, bus) { const k = INS; INS = ins; try { return { v: startVoice(m, bus), ins }; } finally { INS = k; } }
function duStop(x) { const k = INS; INS = x.ins; try { stopVoice(x.v); } finally { INS = k; } }

function duCap(code, on) {
  const b = $('.duet [data-c="' + code + '"]'); if (!b) return;
  b.classList.toggle('on', !!on);
  if (on) { const r = b.getBoundingClientRect(); keyFx(r.left + r.width / 2, r.top); }
}
function duShow(txt, spoken) { const e = $('#nn'); if (e) e.innerHTML = '<span aria-hidden="true">' + txt + '</span><span class="sr">' + (spoken || txt) + '</span>'; }

function duOn(code, sev) {
  if (DV[code]) return;
  const mi = DM.indexOf(code), ci = DC.indexOf(code); if (mi < 0 && ci < 0) return;
  const bus = duBus();
  if (mi >= 0) {
    const m = dMel(mi); DV[code] = [duVoice(DU.mi, m, bus.m)];
    duShow('Melody ' + dNote(m), 'Melody ' + sp(dNote(m))); lsAdd([m], null, dFlat());
  } else {
    const c = dChord(ci, sev); let ns = c.notes.slice();
    if (DU.bass) ns.unshift(c.bass);
    DV[code] = ns.map(m => duVoice(DU.ci, m, bus.c));
    duShow('Chord ' + c.name + ' (' + c.rn + ')', 'Chord ' + c.words + ', ' + c.rn); lsAdd(ns, c.name, dFlat());
  }
  duCap(code, 1);
  if (mi >= 0) fxStart(code, { kind: 'mel', idx: mi, notes: [dMel(mi)] });
  else { const c = dChord(ci, sev); fxStart(code, { kind: 'chord', ci, sev: !!sev, bass: !!DU.bass, notes: (DU.bass ? [c.bass] : []).concat(c.notes) }); }
  prPress(mi, ci);
}
function duOff(code) {
  const v = DV[code]; if (!v) return;
  fxEnd(code); delete DV[code]; v.forEach(duStop); duCap(code, 0);
}
function duOffAll() { Object.keys(DV).forEach(duOff); }

/* label every keycap with what it plays right now */
function duLabel() {
  DML.forEach((l, i) => { const b = $('.duet [data-c="' + DM[i] + '"]'); if (b) { const n = dMel(i); b.querySelector('b').textContent = dNote(n).replace(' ', ''); b.setAttribute('aria-label', l + ' key, melody note ' + sp(dNote(n))); } });
  DCL.forEach((l, i) => {
    const b = $('.duet [data-c="' + DC[i] + '"]'); if (!b) return;
    const c = dChord(i, 0); b.querySelector('b').textContent = c.name; b.querySelector('i').textContent = c.rn;
    b.setAttribute('aria-label', l + ' key, chord ' + c.words + ', ' + c.rn);
  });
  if (typeof prRefresh === 'function' && $('#prs')) prRefresh();
  const t = $('#dkey'); if (t) t.textContent = 'Key of ' + dName(DU.key) + ' ' + (DU.minor ? 'minor' : 'major') + '. Melody octave ' + (Math.floor(dMel(0) / 12) - 1) + ', chord octave ' + (Math.floor((dTon(48) + 12 * DU.co) / 12) - 1) + '.';
}

function duet() {
  const opt = (v, t, s) => '<option value="' + v + '"' + (String(s) === String(v) ? ' selected' : '') + '>' + t + '</option>';
  const ins = (s) => [['piano', 'Piano'], ['organ', 'Organ'], ['bell', 'Bell'], ['synth', 'Synth'], ['guitar', 'Guitar'], ['strings', 'Strings'], ['violin', 'Violin'], ['pstr', 'Piano and strings'], ['flute', 'Flute'], ['trumpet', 'Trumpet'], ['sax', 'Saxophone']].map(x => opt(x[0], x[1], s)).join('');
  const row = (codes, labels, cls, kind) => '<div class="dr ' + cls + '" role="group" aria-label="' + kind + '">' + codes.map((c, i) => '<button type="button" data-c="' + c + '" tabindex="-1"><kbd aria-hidden="true">' + labels[i] + '</kbd><b></b><i aria-hidden="true"></i></button>').join('') + '</div>';
  shell('duet', 'Keyboard duet',
    'Two parts at once. The top row, Q to right bracket, plays the melody. The home row, A to apostrophe, plays chords. Everything is in the key you choose, so any keys you press sound good together. Two people can play, one on each row. Hold Shift with a chord key for a seventh chord. Number keys 1 to equals pick the key from C up to B. Z switches major and minor.',
    '<div class="set" role="group" aria-label="Duet settings">' +
    '<label>Key <select id="dk">' + D_SH.map((n, i) => opt(i, n === D_FL[i] ? n : n + ' / ' + D_FL[i], DU.key)).join('') + '</select></label>' +
    '<label>Scale <select id="dsc">' + opt(0, 'Major', DU.minor) + opt(1, 'Minor', DU.minor) + '</select></label>' +
    '<label>Melody sound <select id="dmi">' + ins(DU.mi) + '</select></label>' +
    '<label>Chord sound <select id="dci">' + ins(DU.ci) + '</select></label>' +
    '<label>Melody volume <input type="range" id="dmv" min="0" max="1.5" step=".05" value="' + DU.mv + '" style="width:100px"></label>' +
    '<label>Chord volume <input type="range" id="dcv" min="0" max="1.5" step=".05" value="' + DU.cv + '" style="width:100px"></label>' +
    '<label><input type="checkbox" id="dbs"' + (DU.bass ? ' checked' : '') + '>Bass note under chords</label></div>' +
    '<div class="tools" style="margin:0 0 8px"><button id="dmoDn" type="button">Melody octave down</button><button id="dmoUp" type="button">Melody octave up</button><button id="dcoDn" type="button">Chord octave down</button><button id="dcoUp" type="button">Chord octave up</button></div>' +
    '<p id="dkey" class="total" role="status" aria-live="polite" style="margin:4px 0"></p>' +
    '<div class="duet" role="group" aria-label="Duet keyboard. The top row is the melody, the home row is the chords. Hold Shift with a chord key for a seventh chord.">' +
    '<p class="dl1">Melody (top row)</p>' + row(DM, DML, 'mel', 'Melody keys') + '<p class="dl1">Chords (home row)</p>' + row(DC, DCL, 'chd', 'Chord keys') + '</div>' + lsHtml() + prHtml() + fxHtml() + spHtml() + dtHtml() +
    '<p class="total">' + lines('Press and hold keys together. Hold Shift with a chord key to make it a seventh chord. Arrow up and down shift the melody octave, and arrow left and right shift the chord octave. Number keys 1 to 0, minus and equals pick the key: 1 is C, 2 is C sharp, 3 is D, and so on up to equals for B. Comma and full stop move the key down or up a half step. Z switches major and minor, and X turns the bass note on or off. B starts the backing beat, V changes it, C and M change the tempo. N chooses a chord progression to follow. Backslash starts a melody challenge, and Space plays it again. Slash captures your playing for the pattern fixer, and Enter fixes it. Escape returns to the menu. Press the backtick key to record.', 'span') + '</p>',
    e => {
      const c = e.code, mi = DM.includes(c), ci = DC.includes(c);
      if (mi || ci) { e.preventDefault(); if (!e.repeat) duOn(c, e.shiftKey); return true; }
      if (prKey(e) || fxKey(e)) return true;
      const ki = D_NUM.indexOf(c);
      if (ki >= 0) { e.preventDefault(); if (!e.repeat) setKey(ki); return true; }
      if (c === 'Comma' || c === 'Period') { e.preventDefault(); if (!e.repeat) setKey((DU.key + (c === 'Period' ? 1 : 11)) % 12); return true; }
      if (c === 'KeyZ') { e.preventDefault(); if (!e.repeat) setScale(DU.minor ? 0 : 1); return true; }
      if (c === 'KeyX') { e.preventDefault(); if (!e.repeat) { DU.bass = DU.bass ? 0 : 1; $('#dbs').checked = !!DU.bass; say('Bass note ' + (DU.bass ? 'on' : 'off')); } return true; }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); shiftOct('mo', e.key === 'ArrowUp' ? 1 : -1); return true; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); shiftOct('co', e.key === 'ArrowRight' ? 1 : -1); return true; }
    },
    e => { if (DM.includes(e.code) || DC.includes(e.code)) { duOff(e.code); return true; } });
  const shiftOct = (k, d) => { const n = Math.max(-2, Math.min(2, DU[k] + d)); if (n === DU[k]) return; duOffAll(); DU[k] = n; duLabel(); say($('#dkey').textContent); };
  const setKey = k => { DU.key = k; $('#dk').value = k; duOffAll(); duLabel(); say($('#dkey').textContent); };
  const setScale = v => { DU.minor = v; $('#dsc').value = v; duOffAll(); duLabel(); say($('#dkey').textContent); };
  const changed = e => { duOffAll(); duLabel(); say($('#dkey').textContent); if (e && e.target.tagName === 'SELECT') e.target.blur(); };
  $('#dk').onchange = e => { DU.key = +e.target.value; changed(e); };
  $('#dsc').onchange = e => { DU.minor = +e.target.value; changed(e); };
  $('#dmi').onchange = e => { DU.mi = e.target.value; duOffAll(); e.target.blur(); };
  $('#dci').onchange = e => { DU.ci = e.target.value; duOffAll(); e.target.blur(); };
  $('#dmv').oninput = e => { DU.mv = +e.target.value; if (DBUS) DBUS.m.gain.value = DU.mv; };
  $('#dcv').oninput = e => { DU.cv = +e.target.value; if (DBUS) DBUS.c.gain.value = DU.cv; };
  $('#dbs').onchange = e => { DU.bass = e.target.checked ? 1 : 0; };
  $('#dmoDn').onclick = () => shiftOct('mo', -1); $('#dmoUp').onclick = () => shiftOct('mo', 1);
  $('#dcoDn').onclick = () => shiftOct('co', -1); $('#dcoUp').onclick = () => shiftOct('co', 1);
  $$('.duet button').forEach(b => {
    const c = b.dataset.c;
    b.onpointerdown = e => { e.preventDefault(); duOn(c, e.shiftKey); };
    b.onpointerup = b.onpointerleave = b.onpointercancel = () => duOff(c);
    b.onpointerenter = e => { if (e.buttons === 1 && e.pointerType === 'mouse') duOn(c, e.shiftKey); };
    b.oncontextmenu = e => e.preventDefault();
  });
  lsWire(); prWire(); fxWire(); spWire(); dtWire(); duLabel(); $('#nn').textContent = 'Press a key on the top row for melody, or the home row for chords';
}
