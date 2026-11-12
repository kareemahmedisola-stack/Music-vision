/* Staffsounds – recorder: capture your instruments, your voice, or both.
   Instruments are tapped from the master output (see RSEND / RX / RD in audio.js); the microphone joins the same mix only while
   recording. Takes are turned into 16-bit mono WAV files (they play and seek everywhere) and kept in this browser (IndexedDB). */

let TAKES = [], TK_LOADED = false, REC = null, RECBUSY = false;
const rOpt = (k, d) => { const v = (P.set || {})[k]; return v === undefined ? d : v; };
const rSet = (k, v) => { P.set = P.set || {}; P.set[k] = v; save(); };
const mmss = ms => { const s = Math.round(ms / 1000); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

/* ---- storage ---- */
let RDBP = null;
const rdb = () => RDBP || (RDBP = new Promise((ok, no) => {
  try {
    const q = indexedDB.open('staffwise-takes', 1);
    q.onupgradeneeded = () => q.result.createObjectStore('takes', { keyPath: 'id' });
    q.onsuccess = () => ok(q.result); q.onerror = () => no(q.error);
  } catch (e) { no(e); }
}));
const rtx = (mode, fn) => rdb().then(db => new Promise((ok, no) => { const t = db.transaction('takes', mode), r = fn(t.objectStore('takes')); t.oncomplete = () => ok(r && r.result); t.onerror = () => no(t.error); })).catch(() => null);

/* ---- WAV ---- */
function toWav(buf, stereo) {
  const n = buf.length, ch = buf.numberOfChannels, sr = buf.sampleRate;
  if (stereo && ch >= 2) {                                   // keep two channels (the choir maker uses this)
    const o2 = new DataView(new ArrayBuffer(44 + n * 4)), w2 = (o, s) => [...s].forEach((c, i) => o2.setUint8(o + i, c.charCodeAt(0)));
    w2(0, 'RIFF'); o2.setUint32(4, 36 + n * 4, true); w2(8, 'WAVEfmt '); o2.setUint32(16, 16, true); o2.setUint16(20, 1, true); o2.setUint16(22, 2, true);
    o2.setUint32(24, sr, true); o2.setUint32(28, sr * 4, true); o2.setUint16(32, 4, true); o2.setUint16(34, 16, true); w2(36, 'data'); o2.setUint32(40, n * 4, true);
    const a = buf.getChannelData(0), b = buf.getChannelData(1), q = v => { v = Math.max(-1, Math.min(1, v)); return v < 0 ? v * 0x8000 : v * 0x7fff; };
    for (let i = 0; i < n; i++) { o2.setInt16(44 + i * 4, q(a[i]), true); o2.setInt16(46 + i * 4, q(b[i]), true); }
    return new Blob([o2], { type: 'audio/wav' });
  }
  const out = new DataView(new ArrayBuffer(44 + n * 2));
  const w = (o, s) => [...s].forEach((c, i) => out.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); out.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); out.setUint32(16, 16, true); out.setUint16(20, 1, true); out.setUint16(22, 1, true);
  out.setUint32(24, sr, true); out.setUint32(28, sr * 2, true); out.setUint16(32, 2, true); out.setUint16(34, 16, true); w(36, 'data'); out.setUint32(40, n * 2, true);
  const d = [...Array(ch).keys()].map(c => buf.getChannelData(c));
  for (let i = 0; i < n; i++) { let v = 0; for (let c = 0; c < ch; c++) v += d[c][i]; v = Math.max(-1, Math.min(1, v / ch)); out.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true); }
  return new Blob([out], { type: 'audio/wav' });
}

/* ---- the panel ---- */
function recHtml() {
  return '<section class="rec" aria-label="Recorder"><h3>Record</h3>' +
    '<p class="rhint">' + lines('Record the instruments, your voice, or both. Press the backtick key (top left of the keyboard) to start and stop. Use headphones if you record your voice while the instruments play.', 'span') + '</p>' +
    '<div class="set" role="group" aria-label="What to record">' +
    '<label><input type="checkbox" id="ri"' + (rOpt('rI', true) ? ' checked' : '') + '>Instruments</label>' +
    '<label><input type="checkbox" id="rv"' + (rOpt('rV', false) ? ' checked' : '') + '>My voice (microphone)</label>' +
    '<label><input type="checkbox" id="rh"' + (rOpt('rH', false) ? ' checked' : '') + '>Hear my voice (headphones)</label>' +
    '<label><input type="checkbox" id="rp"' + (rOpt('rP', false) ? ' checked' : '') + '>Let the browser clean my voice (echo and noise filters; these can make a voice fade in and out)</label>' +
    '<label><input type="checkbox" id="rc"' + (rOpt('rC', false) ? ' checked' : '') + '>Count-in of 4 clicks</label>' +
    '<label>Play along with a take <select id="rb"><option value="">None (no backing)</option></select></label></div>' +
    '<div class="tools stack"><button type="button" id="rbtn" class="next" aria-pressed="false">● Record</button><button type="button" id="rmt">Test my microphone (5 seconds)</button><button type="button" id="rhc">Headphone check</button><label class="ghost" style="cursor:pointer">Import an audio file as a recording <input type="file" id="rim" accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.webm" style="max-width:190px"></label></div><p id="renv" class="total"></p>' +
    '<div class="meter lvl" aria-hidden="true"><i id="rlv" style="width:0"></i></div><p id="rst" class="total" role="status" aria-live="polite" style="margin:6px 0">Ready to record.</p>' +
    '<ul class="takes" id="tks" aria-label="Your recordings"></ul></section>' + midiHtml();
}
function recList() {
  const ul = $('#tks'); if (!ul) return;
  ul.innerHTML = TAKES.length ? (TAKES.length > 1 ? '<li class="mixbar"><button type="button" id="mixgo">Mix the ticked takes into one new take</button> <span id="mixs" role="status" aria-live="polite"></span></li>' : '') : '<li class="none">No recordings yet.</li>';
  TAKES.forEach(t => {
    if (!t.url) t.url = URL.createObjectURL(t.blob);
    const li = document.createElement('li');
    li.innerHTML = '<b>' + esc(t.name) + '</b> <span class="rmeta">' + mmss(t.ms) + ' · ' + esc(t.src) + '</span><audio controls preload="metadata" src="' + t.url + '" aria-label="Play ' + esc(t.name) + '"></audio>' +
      '<div class="tools"><a class="dl" download="' + esc(t.name.replace(/\s+/g, '-').toLowerCase()) + '.' + (t.mime.includes('wav') ? 'wav' : t.mime.includes('mp4') ? 'm4a' : 'webm') + '" href="' + t.url + '">Download</a>' +
      '<button type="button" data-sh="' + t.id + '">Share</button><button type="button" data-re="' + t.id + '">Edit</button><button type="button" data-rn="' + t.id + '">Rename</button><button type="button" data-rd="' + t.id + '">Delete</button></div>' +
      '<div class="mxr"><label><input type="checkbox" data-mx="' + t.id + '">Include in mix</label><label>Level <input type="range" data-lv="' + t.id + '" min="0" max="150" value="100" style="width:90px" aria-label="Mix level for ' + esc(t.name) + '"></label></div><div class="edit" id="ed' + t.id + '" hidden></div>';
    ul.appendChild(li);
  });
  teWire(ul);
  $$('[data-rd]', ul).forEach(b => b.onclick = () => {
    const t = TAKES.find(x => x.id === +b.dataset.rd); if (!t) return;
    TAKES = TAKES.filter(x => x !== t); URL.revokeObjectURL(t.url); rtx('readwrite', s => s.delete(t.id)); recList(); recBacking(); say('Deleted ' + t.name);
    const f = $('#rbtn'); if (f) f.focus();
  });
  $$('[data-sh]', ul).forEach(b => b.onclick = async () => {
    const t = TAKES.find(x => x.id === +b.dataset.sh); if (!t) return; const ext = t.mime.includes('wav') ? 'wav' : t.mime.includes('mp4') ? 'm4a' : 'webm', f = new File([t.blob], t.name.replace(/\s+/g, '-').toLowerCase() + '.' + ext, { type: t.mime });
    try { if (navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], title: t.name }); say('Shared ' + t.name); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
    const a = b.parentNode.querySelector('a.dl'); if (a) a.click(); say('Sharing is not available in this browser, so ' + t.name + ' was downloaded. Attach it to an email or message.');
  });
  $$('[data-rn]', ul).forEach(b => b.onclick = () => {
    const t = TAKES.find(x => x.id === +b.dataset.rn), n = t && prompt('Name this recording', t.name);
    if (n && n.trim()) { t.name = n.trim().slice(0, 40); recPut(t); recList(); recBacking(); }
  });
}
function recBacking() {
  const sel = $('#rb'); if (!sel) return; const cur = sel.value;
  sel.innerHTML = '<option value="">None (no backing)</option>' + TAKES.map(t => '<option value="' + t.id + '">' + esc(t.name) + '</option>').join('');
  if (TAKES.some(t => String(t.id) === cur)) sel.value = cur;
  if (typeof vsTakes === 'function') vsTakes();
}
function wireRec() {
  if (!$('#rbtn')) return;
  wireMidi();
  [['ri', 'rI'], ['rv', 'rV'], ['rh', 'rH'], ['rc', 'rC'], ['rp', 'rP']].forEach(([id, k]) => { $('#' + id).onchange = e => rSet(k, e.target.checked); });
  $('#rbtn').onclick = recToggle; $('#rmt').onclick = micTest; $('#rhc').onclick = hpCheck; $('#rim').onchange = e => { const f = e.target.files[0]; e.target.value = ''; if (f) recImport(f); }; recEnv();
  const show = () => { recList(); recBacking(); };
  if (TK_LOADED) show();
  else { TK_LOADED = true; rtx('readonly', s => s.getAll()).then(r => { const have = new Set(TAKES.map(t => t.id)); (r || []).forEach(t => { if (!have.has(t.id)) TAKES.push(t); }); TAKES.sort((a, b) => b.id - a.id); show(); }); show(); }
  if (REC) recUi(true);
}
function recUi(on) {
  const b = $('#rbtn'); if (!b) return;
  b.setAttribute('aria-pressed', on); b.textContent = on ? '■ Stop recording' : '● Record';
  b.classList.toggle('rec-on', on);
}

/* ---- recording ---- */
async function recToggle() { if (RECBUSY) return; REC ? recStop() : recStart(); }
async function recStart() {
  const st = m => { const e = $('#rst'); if (e) e.textContent = m; say(m); };
  const wantI = $('#ri').checked, wantV = $('#rv').checked;
  if (!wantI && !wantV) { st('Tick Instruments or My voice first.'); return; }
  if (!window.MediaRecorder) { st('This browser cannot record audio. Try a recent Chrome, Edge, Firefox or Safari.'); return; }
  RECBUSY = true;
  try {
    const a = eng(); let stream = null, voiceOk = false, note = '', ma = null;
    if (wantV) {
      const hint = setTimeout(() => { if (RECBUSY) st('Waiting for the microphone. Look for a permission box near the address bar and choose Allow.'); }, 1500);
      st('Asking the browser for the microphone. If a box appears, choose Allow.');
      let err = null;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) err = { name: 'NoMediaDevices' };
      else {
        try { stream = await navigator.mediaDevices.getUserMedia({ audio: (() => { const f = !!$('#rp').checked; return { echoCancellation: f, noiseSuppression: f, autoGainControl: f }; })() }); }
        catch (e1) {
          err = e1;
          if (e1 && (e1.name === 'OverconstrainedError' || e1.name === 'NotReadableError' || e1.name === 'AbortError' || e1.name === 'TypeError')) { try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); err = null; } catch (e2) { err = e2; } }   // some devices refuse the extra settings
        }
      }
      clearTimeout(hint);
      if (stream) { voiceOk = true; try { await a.resume(); } catch (e) {} }
      else {
        const n = err && err.name, why = n === 'NotAllowedError' || n === 'SecurityError' ? 'The microphone is blocked. Click the lock icon in the address bar, allow the microphone, reload, and try again. If the game is inside a preview, open it in its own tab.' : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'No microphone was found. Plug one in, or choose one in Chrome settings, Privacy and security, Site settings, Microphone.' : n === 'NotReadableError' || n === 'AbortError' ? 'The microphone is busy or switched off in Windows or Mac privacy settings. Close other programs that use it (Zoom, Teams) and check the system microphone privacy setting.' : n === 'NoMediaDevices' ? 'This page cannot use the microphone. Open it from https://, localhost or the saved file, in its own tab.' : 'The browser would not open the microphone (' + (n || 'unknown error') + ').';
        if (!wantI) { st(why); RECBUSY = false; return; }
        note = why + ' Only the instruments are being recorded.'; st(note);
      }
    }
    const nodes = [];
    RSEND.gain.value = wantI ? 1 : 0;
    if (voiceOk) {
      const src = a.createMediaStreamSource(stream), mg = a.createGain();
      src.connect(mg); mg.connect(RX); nodes.push(src, mg);
      ma = a.createAnalyser(); ma.fftSize = 1024; mg.connect(ma); nodes.push(ma);
      if ($('#rh').checked) mg.connect(a.destination);
    }
    let bk = null; const bid = $('#rb') && $('#rb').value, bt = bid && TAKES.find(t => String(t.id) === bid);
    if (bt) {
      try { const buf = await a.decodeAudioData(await bt.blob.arrayBuffer()); bk = a.createBufferSource(); bk.buffer = buf; bk.connect(RX); bk.connect(a.destination); nodes.push(bk); } catch (e) { bk = null; }
    }
    if ($('#rc').checked) {
      FORCE = true; for (let i = 0; i < 4; i++) tone(i ? 84 : 91, i * 0.6667, 0.08, i ? 0.3 : 0.5); FORCE = false;
      st('Count in: one, two, three, four.'); await new Promise(r => setTimeout(r, 4 * 667));
    }
    const mime = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t)) || '';
    const mr = new MediaRecorder(RD.stream, mime ? { mimeType: mime } : undefined), chunks = [];
    mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    REC = { ma, note, vpk: 0, wantV, mr, chunks, stream, nodes, bk, t0: performance.now(), src: [wantI && 'instruments', voiceOk && 'voice', bk && 'backing'].filter(Boolean).join(' + '), mime: mr.mimeType || mime || 'audio/webm' };
    mr.onstop = () => recFinish(REC_DONE.pop());
    mr.start(250); if (bk) bk.start();
    REC.tick = setInterval(() => {
      if (REC.ma) { const m = new Uint8Array(1024); REC.ma.getByteTimeDomainData(m); m.forEach(v => { REC.vpk = Math.max(REC.vpk, Math.abs(v - 128)); }); }
      const e = $('#rst'); if (e && REC) e.textContent = 'Recording ' + mmss(performance.now() - REC.t0) + ' (' + REC.src + ')' + (REC.wantV ? (REC.ma ? (REC.vpk > 3 ? ' · voice heard' : ' · no voice heard yet, speak up or check your microphone') : ' · ' + REC.note) : '');
      const d = new Uint8Array(RA.fftSize); RA.getByteTimeDomainData(d); let pk = 0; d.forEach(v => { pk = Math.max(pk, Math.abs(v - 128)); });
      const l = $('#rlv'); if (l) l.style.width = Math.min(100, pk / 128 * 140) + '%';
    }, 120);
    recUi(true); say('Recording started. Press backtick or the stop button to finish.');
  } catch (e) { const m = $('#rst'); if (m) m.textContent = 'Could not start recording.'; REC = null; }
  RECBUSY = false;
}
const REC_DONE = [];
function recStop() {
  if (!REC) return;
  const r = REC; REC = null; clearInterval(r.tick);
  r.ms = performance.now() - r.t0; REC_DONE.push(r);
  try { r.mr.stop(); } catch (e) { REC_DONE.pop(); }
  try { if (r.bk) r.bk.stop(); } catch (e) {}
  r.nodes.forEach(n => { try { n.disconnect(); } catch (e) {} });
  if (r.stream) r.stream.getTracks().forEach(t => t.stop());
  RSEND.gain.value = 1;
  recUi(false); const l = $('#rlv'); if (l) l.style.width = '0';
  const e = $('#rst'); if (e) e.textContent = 'Saving your recording…';
}
const recPut = t => rtx('readwrite', s => s.put({ id: t.id, name: t.name, blob: t.blob, mime: t.mime, ms: t.ms, src: t.src }));
/* add a finished take to the list and save it */
function recAdd(blob, mime, ms, src, name) {
  let id = Date.now(); while (TAKES.some(x => x.id === id)) id++;
  const t = { id, name: name || 'Take ' + (TAKES.reduce((m, x) => Math.max(m, +(x.name.match(/^Take (\d+)$/) || 0)[1] || 0), 0) + 1), blob, mime, ms, src };
  TAKES.unshift(t); recPut(t); recList(); recBacking();
  return t;
}
async function recFinish(r) {
  if (!r) return;
  let blob = new Blob(r.chunks, { type: r.mime }), mime = r.mime;
  try { const buf = await ctx().decodeAudioData(await blob.arrayBuffer()); blob = toWav(buf); mime = 'audio/wav'; } catch (e) {}   // keep the browser's own format if it cannot be decoded
  const t = recAdd(blob, mime, r.ms, r.src);
  if (r.wantV && (!r.ma || r.vpk <= 3)) { t.src += ' (no voice picked up)'; recPut(t); recList(); }
  const warn = r.wantV ? (!r.ma ? ' ' + r.note : r.vpk <= 3 ? ' Warning: no voice was picked up. Check that the right microphone is selected in your browser and that it is not muted.' : '') : '';
  const e = $('#rst'); if (e) e.textContent = 'Saved ' + t.name + ', ' + mmss(r.ms) + '. Play it below, or download it.' + warn;
  say('Saved ' + t.name + ', ' + mmss(r.ms) + '.' + warn);
}

/* backtick = record / stop, on any playground screen */
document.addEventListener('keydown', e => {
  if (e.key !== '`' || !S || !S.live || TUT_ON || e.ctrlKey || e.metaKey || e.altKey || !$('#rbtn')) return;
  const tg = document.activeElement && document.activeElement.tagName;
  if (tg === 'SELECT' || tg === 'TEXTAREA' || (tg === 'INPUT' && document.activeElement.type !== 'checkbox')) return;
  e.preventDefault(); if (!e.repeat) recToggle();
});

/* ---- setup check and microphone test ---- */
async function recEnv() {
  const e = $('#renv'); if (!e) return; const p = [];
  if (!window.isSecureContext) p.push('This page is not secure, so the browser will block the microphone. Open it from https://, http://localhost or the saved file.');
  if (window.self !== window.top) p.push('The game is running inside another page (a preview frame), which usually blocks the microphone. Open it in its own browser tab.');
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) p.push('This browser has no microphone access.');
  if (!window.MediaRecorder) p.push('This browser cannot record audio.');
  try { if (!window.indexedDB) p.push('Recordings cannot be kept after you close the page here, but they stay while it is open.'); } catch (x) {}
  try { const q = await navigator.permissions.query({ name: 'microphone' }); if (q.state === 'denied') p.push('The microphone is blocked for this page. Click the lock icon in the address bar and allow it.'); } catch (x) {}
  const el = $('#renv'); if (el) el.textContent = p.length ? 'Setup check: ' + p.join(' ') : 'Setup check: recording should work here. Use Test my microphone to be sure.';
}
async function micTest() {
  const e = $('#rst'), out = t => { const el = $('#rst'); if (el) el.textContent = t; say(t); };
  if (REC) { out('Stop recording first.'); return; }
  try {
    const st = await navigator.mediaDevices.getUserMedia({ audio: true }), a = ctx(), src = a.createMediaStreamSource(st), an = a.createAnalyser(); an.fftSize = 1024; src.connect(an);
    const tr = st.getAudioTracks()[0]; let pk = 0; out('Speak now for five seconds. Microphone: ' + (tr.label || 'unnamed') + '.');
    const d = new Uint8Array(1024), t0 = performance.now();
    await new Promise(ok => { const id = setInterval(() => { an.getByteTimeDomainData(d); d.forEach(v => { pk = Math.max(pk, Math.abs(v - 128)); }); const l = $('#rlv'); if (l) l.style.width = Math.min(100, pk / 128 * 140) + '%'; if (performance.now() - t0 > 5000) { clearInterval(id); ok(); } }, 100); });
    src.disconnect(); st.getTracks().forEach(x => x.stop()); const l = $('#rlv'); if (l) l.style.width = '0';
    out(pk > 3 ? 'Your microphone works: it heard you (' + Math.round(pk / 128 * 100) + ' percent). If a recording is still silent, check that you ticked My voice.' : 'The microphone is open but heard nothing. Check it is not muted, that the right one is chosen in the browser, and that it is not blocked by the system privacy settings.');
  } catch (x) { out('The browser would not open the microphone (' + (x && x.name || 'error') + '). Open the game in its own tab from https://, localhost or the saved file, and allow the microphone.'); }
}

/* import an audio file (MP3, WAV, M4A/AAC, OGG, FLAC or WebM: whatever this browser can play) as a recording */
async function recImport(f) {
  const out = t => { const e = $('#rst'); if (e) e.textContent = t; say(t); }, MAXMB = 40, MAXMIN = 15;
  if (f.size > MAXMB * 1048576) { out(f.name + ' is ' + Math.round(f.size / 1048576) + ' megabytes. The limit is ' + MAXMB + '. Trim it or save it as an MP3 first.'); return; }
  out('Opening ' + f.name + '…');
  try {
    const buf = await ctx().decodeAudioData(await f.arrayBuffer());
    if (buf.duration > MAXMIN * 60) { out(f.name + ' is ' + Math.round(buf.duration / 60) + ' minutes long. The limit is ' + MAXMIN + ' minutes.'); return; }
    const t = recAdd(toWav(buf, buf.numberOfChannels > 1), 'audio/wav', buf.duration * 1000, 'imported', f.name.replace(/\.[^.]+$/, '').slice(0, 40));
    out('Imported ' + t.name + ', ' + mmss(t.ms) + '. It is in your recordings list. You can play along with it, edit it, or use it in the Voice studio.');
  } catch (e) { out('This browser could not read ' + f.name + '. Use an MP3, WAV, M4A, OGG or FLAC file.'); }
}
