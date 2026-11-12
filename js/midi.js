/* Staffsounds – MIDI keyboard support (Web MIDI). Notes play whichever playground is open: the piano, guitar, trumpet and
   sax sounds directly, the duet's melody sound (and the melody challenge), and channel 10 or the drums screen as a drum pad
   using General MIDI drum numbers. The sustain pedal (controller 64) works in the piano playground. */

let MIDI = null;
const GMD = { 35: 'kick', 36: 'kick', 37: 'rim', 38: 'snare', 40: 'snare', 41: 'tom3', 43: 'tom3', 45: 'tom2', 47: 'tom2', 48: 'tom1', 50: 'tom1', 42: 'hat', 44: 'hat', 46: 'ohat', 49: 'crash', 57: 'crash', 51: 'ride', 53: 'ride', 59: 'ride', 39: 'clap', 54: 'shk', 70: 'shk', 56: 'cow', 62: 'cgh', 63: 'cgh', 64: 'cgl', 60: 'cgh', 61: 'cgl' };

function duMidi(m, on) {
  const k = 'm' + m;
  if (!on) { duOff(k); return; }
  if (DV[k]) return;
  DV[k] = [duVoice(DU.mi, m, duBus().m)];
  fxStart(k, { kind: 'mel', idx: -1, notes: [m] });
  duShow('MIDI ' + dNote(m), 'MIDI ' + sp(dNote(m)));
  lsAdd([m], null, dFlat());
  const i = [0, 1, 2, 3, 4, 5, 6].find(i => dMel(i) % 12 === m % 12);
  spMidi(m);
  chNote(i == null ? -1 : i);                    // a MIDI key counts for the melody challenge in whatever octave you play it
}
function midiNote(m, on, ch) {
  if (!S || !S.live) return;
  if (ch === 9 || S.m === 'drums') {
    const k = GMD[m], d = Object.values(DK).find(v => v[0] === k);
    if (on && d && typeof DRHIT === 'function') DRHIT(d[0], d[1]);
    return;
  }
  if (PGK === 'duet') return duMidi(m, on);
  if (on) { if (!VO[m]) noteOn(m); } else noteOff(m);
}
function midiMsg(e) {
  actNow();
  const [st, a, b] = e.data, cmd = st & 0xf0, ch = st & 0x0f;
  if (cmd === 0x90 && b > 0) midiNote(a, true, ch);
  else if (cmd === 0x80 || (cmd === 0x90 && b === 0)) midiNote(a, false, ch);
  else if (cmd === 0xb0 && a === 64 && S && S.live && PGK !== 'duet') pedal(b >= 64);
  else if (cmd === 0xb0 && (a === 123 || a === 120)) allOff();
}
function midiStatus() {
  const e = $('#mds'); if (!e) return;
  if (!MIDI) { e.textContent = 'Not connected. Plug in a MIDI keyboard, then press Connect. Works in Chrome, Edge and Opera.'; return; }
  const n = [...MIDI.inputs.values()].map(i => i.name);
  e.textContent = n.length ? 'Connected: ' + n.join(', ') + '. Play your keyboard.' : 'MIDI is on, but no keyboard was found. Plug it in and turn it on.';
}
async function midiConnect(quiet) {
  const e = $('#mds');
  if (!navigator.requestMIDIAccess) { if (e && !quiet) e.textContent = 'This browser has no MIDI support. Try Chrome, Edge or Opera.'; return; }
  try {
    MIDI = MIDI || await navigator.requestMIDIAccess();
    const hook = () => { MIDI.inputs.forEach(i => { i.onmidimessage = midiMsg; }); midiStatus(); say($('#mds') ? $('#mds').textContent : ''); };
    MIDI.onstatechange = hook; hook(); rSet('midi', true);
  } catch (err) { MIDI = null; if (e) e.textContent = 'MIDI access was refused. Allow it in the browser address bar and try again.'; }
}
function midiHtml() {
  return '<section class="rec midi" aria-label="MIDI keyboard"><h3>MIDI keyboard</h3><div class="tools"><button type="button" id="mdb">Connect a MIDI keyboard</button></div><p id="mds" class="total" role="status" aria-live="polite"></p></section>';
}
function wireMidi() {
  const b = $('#mdb'); if (!b) return;
  b.onclick = () => midiConnect(false); midiStatus();
  if (MIDI) { MIDI.inputs.forEach(i => { i.onmidimessage = midiMsg; }); midiStatus(); }
  else if ((P.set || {}).midi) midiConnect(true);
}
