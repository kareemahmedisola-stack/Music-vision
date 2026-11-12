/* Staffsounds – Study tools on the menu: Teacher mode and Backup and restore.
   Everything works with files, so it needs no server or accounts and works offline.
   Teacher mode: a student saves a progress report (.json); a teacher makes an assignment file (.json), the student opens it and
   sees it tick off as they practise; the teacher opens many reports to see a class table and download it as a spreadsheet (.csv).
   Backup: progress only, or progress plus every recording, as one file that can be restored or merged on any device. */

const tlDl = (data, name, type) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: type || 'application/json' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); };
const tlRead = f => new Promise((ok, no) => { const r = new FileReader(); r.onload = () => ok(r.result); r.onerror = () => no(r.error); r.readAsText(f); });
const tlStatus = (id, t) => { const e = $('#' + id); if (e) e.textContent = t; say(t); };
const tlSecs = () => Object.values(P.log || {}).reduce((a, l) => a + (l.sec || 0), 0);
const tlModes = () => Object.keys(MODES).filter(k => MODES[k][2]);

function toolsHtml() {
  const r = (id, t, d) => '<div class="row"><button type="button" class="go" id="' + id + '"><b>' + t + '</b><span>' + d + '</span></button></div>';
  return '<section class="grp" aria-label="Study tools"><h2>Study tools</h2>' + r('tlw', 'My weak spots', 'The answers you miss most, and a round made of them') + r('tlt', 'Teacher mode', 'Progress reports, assignments and a class table') +
    r('tlc', 'Setup check', 'Test sound, microphone, MIDI, offline mode and storage') + r('tlb', 'Backup and restore', 'Save or move your progress and recordings') + '</section>';
}
function toolsWire() {
  const h = $('.starthere'); if (!h || $('#tlw')) return; h.insertAdjacentHTML('afterend', bkReminderHtml() + planHtml() + toolsHtml()); planWire(); bkReminderWire(); try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
  $('#tlw').onclick = weakSpots; $('#tlt').onclick = teacher; $('#tlb').onclick = backup; $('#tlc').onclick = setupCheck;
  ['#tlw', '#tlt', '#tlb', '#tlc'].forEach(i => { $(i).onfocus = () => speak($(i).querySelector('b').textContent + '. ' + $(i).querySelector('span').textContent); });
}
function tlPage(title, body) {
  clearTimer(); stopDr(); allOff(); recStop(); S = null; TUT_ON = false; scrollTo(0, 0);
  app.innerHTML = '<article class="guide"><div class="ltop"><button type="button" id="gb">← Back to the menu</button></div><h1 style="font-size:34px">' + title + '</h1>' + body + '</article>';
  $('#gb').onclick = menu; $('#gb').focus();
}

/* ---------------- reports and assignments ---------------- */
function tlReport() {
  const modes = {}; tlModes().forEach(k => { const p = P[k]; if (p && (p.seen || p.xp)) modes[k] = { n: MODES[k][0], xp: p.xp || 0, right: p.right || 0, seen: p.seen || 0, best: p.best || 0, rounds: p.rounds || 0 }; });
  return { app: 'staffwise', kind: 'report', v: 1, name: (P.who || '').trim() || 'Student', when: new Date().toISOString().slice(0, 10), xp: Object.values(P).reduce((a, b) => a + (b && b.xp || 0), 0), minutes: Math.round(tlSecs() / 60), days: Object.keys(P.log || {}).length, streak: Math.max(P.pbest || 0, 0),
    modes, songs: P.sg || {}, weak: wkAll().slice(0, 6).map(x => wkLabel(x.m) + ': ' + x.k + ' (' + x.wrong + '/' + x.seen + ')'), asg: (P.asg || []).map(a => ({ t: a.t, done: tlAsgDone(a) })) };
}
function tlAsgItems(a) { return a.items.map(it => { let have = 0, want = it.n; if (it.k === 'mode') have = Math.max(0, (pm(it.m).rounds || 0) - (it.b || 0)); else if (it.k === 'song') { have = ((P.sg || {})[it.s] || { best: 0 }).best; want = it.n; } else if (it.k === 'min') have = Math.max(0, Math.floor((tlSecs() - (it.b || 0)) / 60)); return Object.assign({ have, ok: have >= want }, it); }); }
const tlAsgDone = a => tlAsgItems(a).every(x => x.ok);
const tlItemText = it => it.k === 'mode' ? 'Play ' + it.n + (it.n === 1 ? ' round' : ' rounds') + ' of ' + (MODES[it.m] ? MODES[it.m][0] : it.m) : it.k === 'song' ? 'Play ' + it.s + ' and reach ' + it.n + ' percent' : 'Practise for ' + it.n + ' minutes';

function teacher() {
  const songs = SONGS.map(s => s.n), CL = P.cls || [], A = P.asg || [];
  tlPage('Teacher mode',
    '<p>' + lines('No accounts or internet are needed. Students and teachers pass small files by email, a shared folder or a memory stick. Anyone can use any part of this page.', 'span') + '</p>' +
    '<h2>1. My progress report (for students)</h2><div class="set"><label>My name <input type="text" id="twho" value="' + esc(P.who || '') + '" maxlength="40" style="font:inherit;padding:6px 8px;border-radius:8px;border:2px solid var(--line);background:var(--panel);color:var(--ink)"></label></div>' +
    '<div class="tools stack"><button type="button" id="trp" class="next">Download my progress report</button></div>' +
    '<h2>2. My assignments</h2><div id="tas">' + tlAsgHtml() + '</div><div class="tools stack"><label class="ghost" style="cursor:pointer">Open an assignment file <input type="file" id="tai" accept=".json,application/json" style="max-width:190px"></label></div>' +
    '<h2>3. Make an assignment (for teachers)</h2><div class="set"><label>Title <input type="text" id="tat" placeholder="Week 3 homework" maxlength="50" style="font:inherit;padding:6px 8px;border-radius:8px;border:2px solid var(--line);background:var(--panel);color:var(--ink)"></label></div>' +
    '<div class="set" role="group" aria-label="Add a task"><label>Task <select id="tak"><option value="mode">Rounds in a mode</option><option value="song">A song score</option><option value="min">Practice minutes</option></select></label>' +
    '<label>Mode <select id="tam">' + tlModes().map(k => '<option value="' + k + '">' + esc(MODES[k][0]) + '</option>').join('') + '</select></label>' +
    '<label>Song <select id="tas2">' + songs.map(s => '<option>' + esc(s) + '</option>').join('') + '</select></label>' +
    '<label>Target <input type="number" id="tan" min="1" max="100" value="3" style="width:70px;font:inherit;padding:6px 8px;border-radius:8px;border:2px solid var(--line);background:var(--panel);color:var(--ink)"></label></div>' +
    '<p class="total">Target means rounds, or percent for a song, or minutes.</p><div class="tools stack"><button type="button" id="taa">Add this task</button></div><ul id="tal" aria-label="Tasks in this assignment"></ul>' +
    '<div class="tools stack"><button type="button" id="tad" class="next">Download the assignment file</button></div>' +
    '<h2>4. Class table (for teachers)</h2><p>Open the progress reports your students sent you. The table keeps the latest report for each name.</p><div class="tools stack"><label class="ghost" style="cursor:pointer">Open student reports <input type="file" id="tci" accept=".json,application/json" multiple style="max-width:190px"></label></div>' +
    '<div id="tcl">' + tlClassHtml() + '</div><p id="tst" class="total" role="status" aria-live="polite"></p>');
  const tasks = []; const showT = () => { $('#tal').innerHTML = tasks.map((t, i) => '<li>' + esc(tlItemText(t)) + ' <button type="button" class="ghost" data-rm="' + i + '">Remove</button></li>').join(''); $$('[data-rm]').forEach(b => { b.onclick = () => { tasks.splice(+b.dataset.rm, 1); showT(); }; }); };
  $('#twho').onchange = e => { P.who = e.target.value.trim(); save(); };
  $('#trp').onclick = () => { P.who = $('#twho').value.trim(); save(); const r = tlReport(); tlDl(JSON.stringify(r, null, 1), 'staffwise-report-' + r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json'); tlStatus('tst', 'Report downloaded for ' + r.name + ': ' + r.xp + ' points, ' + r.minutes + ' minutes of practice.'); };
  $('#taa').onclick = () => {
    const k = $('#tak').value, n = Math.max(1, Math.min(100, +$('#tan').value || 1)), it = k === 'mode' ? { k, m: $('#tam').value, n } : k === 'song' ? { k, s: $('#tas2').value, n: Math.min(100, n) } : { k, n };
    tasks.push(it); showT(); tlStatus('tst', 'Added: ' + tlItemText(it) + '.');
  };
  $('#tad').onclick = () => { if (!tasks.length) { tlStatus('tst', 'Add at least one task first.'); return; } const t = $('#tat').value.trim() || 'Assignment'; tlDl(JSON.stringify({ app: 'staffwise', kind: 'assignment', v: 1, t, id: Date.now().toString(36), items: tasks }, null, 1), 'staffwise-assignment-' + t.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json'); tlStatus('tst', 'Assignment file downloaded. Send it to your students.'); };
  $('#tai').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) tlOpenAsg(await tlRead(f)); };
  $('#tci').onchange = async e => { const fs = [...e.target.files]; e.target.value = ''; let n = 0; for (const f of fs) { try { const tx = await tlRead(f); if (tx.includes('"kind": "handin"') || tx.includes('"kind":"handin"')) { if (tlOpenHand(tx)) n++; } else if (tlOpenRep(tx)) n++; } catch (x) {} } $('#tcl').innerHTML = tlClassHtml(); tlClassWire(); tlStatus('tst', n + (n === 1 ? ' report' : ' reports') + ' added to the class table.'); };
  tlClassWire();
}
function tlAsgHtml() {
  const A = P.asg || []; if (!A.length) return '<p class="total">No assignments yet. Open an assignment file your teacher sent you.</p>';
  return A.map((a, i) => '<section class="prac" aria-label="' + esc(a.t) + '"><h3>' + esc(a.t) + (tlAsgDone(a) ? ' ✓ done' : '') + '</h3><ul>' + tlAsgItems(a).map(x => '<li>' + (x.ok ? '✓ ' : '') + esc(tlItemText(x)) + ': ' + Math.min(x.have, x.n) + ' of ' + x.n + '</li>').join('') + '</ul><button type="button" class="ghost" data-ad="' + i + '">Remove</button></section>').join('') + '<section class="prac" aria-label="Hand in a recording"><h3>Hand in a recording</h3><p class="total">Pick an assignment and one of your recordings. The game makes a file to send to your teacher, who can play it from the class table.</p><div class="set"><label>Assignment <select id="hia">' + A.map((a, i) => '<option value="' + i + '">' + esc(a.t) + '</option>').join('') + '</select></label><label>Recording <select id="hit"><option value="">Loading…</option></select></label></div><div class="tools stack"><button type="button" id="hib">Download the hand-in file</button></div></section>';
}
function tlOpenAsg(txt) {
  try {
    const a = JSON.parse(txt); if (a.app !== 'staffwise' || a.kind !== 'assignment' || !Array.isArray(a.items)) throw 0;
    P.asg = (P.asg || []).filter(x => x.id !== a.id); P.asg.push({ t: String(a.t).slice(0, 50), id: String(a.id), items: a.items.slice(0, 20).map(it => ({ k: it.k, m: it.m, s: it.s, n: +it.n || 1, b: it.k === 'mode' ? (pm(it.m).rounds || 0) : it.k === 'min' ? tlSecs() : 0 })) }); save();
    $('#tas').innerHTML = tlAsgHtml(); tlAsgWire(); tlStatus('tst', 'Assignment added: ' + a.t + '. Progress counts from now.');
  } catch (e) { tlStatus('tst', 'That is not a Staffsounds assignment file.'); }
}
async function tlHandWire() {
  const s = $('#hit'); if (!s) return; const tk = await bkTakes(); s.innerHTML = tk.length ? tk.map(x => '<option value="' + x.id + '">' + esc(x.name) + '</option>').join('') : '<option value="">No recordings yet</option>';
  $('#hib').onclick = async () => {
    const t = tk.find(x => String(x.id) === s.value), a = (P.asg || [])[+$('#hia').value]; if (!t || !a) { tlStatus('tst', 'Choose a recording and an assignment first.'); return; }
    tlDl(JSON.stringify({ app: 'staffwise', kind: 'handin', name: (P.who || 'Student'), asg: a.t, when: new Date().toISOString().slice(0, 10), take: { name: t.name, mime: t.mime, ms: t.ms, data: await tlB64(t.blob) } }), 'staffwise-handin-' + (P.who || 'student').toLowerCase().replace(/[^a-z0-9]+/g, '-') + '.json'); tlStatus('tst', 'Hand-in file downloaded. Send it to your teacher.');
  };
}
function tlAsgWire() { tlHandWire(); $$('[data-ad]').forEach(b => { b.onclick = () => { P.asg.splice(+b.dataset.ad, 1); save(); $('#tas').innerHTML = tlAsgHtml(); tlAsgWire(); }; }); }
function tlOpenRep(txt) {
  const r = JSON.parse(txt); if (r.app !== 'staffwise' || r.kind !== 'report') throw new Error('not a report');
  P.cls = (P.cls || []).filter(x => x.name !== r.name); P.cls.push({ name: String(r.name).slice(0, 40), when: r.when, xp: +r.xp || 0, minutes: +r.minutes || 0, days: +r.days || 0, streak: +r.streak || 0, rounds: Object.values(r.modes || {}).reduce((a, m) => a + (m.rounds || 0), 0), stars: Object.values(r.modes || {}).reduce((a, m) => a + (m.best || 0), 0), weak: (r.weak || []).slice(0, 6).map(String), asg: (r.asg || []).slice(0, 20).map(a => ({ t: String(a.t), done: !!a.done })) }); save(); return true;
}
const TL_HAND = [];
function tlOpenHand(txt) {
  const h = JSON.parse(txt); if (h.app !== 'staffwise' || h.kind !== 'handin' || !h.take || !h.take.data) return false;
  TL_HAND.push({ name: String(h.name).slice(0, 40), asg: String(h.asg).slice(0, 50), when: h.when, take: h.take }); return true;
}
function tlHandHtml() {
  if (!TL_HAND.length) return '';
  return '<h3>Hand-ins</h3><ul>' + TL_HAND.map((h, i) => '<li><b>' + esc(h.name) + '</b> for ' + esc(h.asg) + ' (' + esc(h.when || '') + ') <audio controls src="' + esc(h.take.data) + '" aria-label="Play ' + esc(h.name) + '"></audio> <button type="button" class="ghost" data-hs="' + i + '">Save to my recordings</button></li>').join('') + '</ul>';
}
function tlClassHtml() {
  const C = (P.cls || []).slice().sort((a, b) => a.name.localeCompare(b.name)); if (!C.length) return '<p class="total">No reports opened yet.</p>' + tlHandHtml();
  return '<table class="gtab"><thead><tr><th scope="col">Student</th><th scope="col">Points</th><th scope="col">Minutes</th><th scope="col">Rounds</th><th scope="col">Assignments done</th><th scope="col">Weak spots</th></tr></thead><tbody>' +
    C.map(c => '<tr><th scope="row">' + esc(c.name) + '<br><small>' + esc(c.when || '') + '</small></th><td>' + c.xp + '</td><td>' + c.minutes + '</td><td>' + c.rounds + '</td><td>' + c.asg.filter(a => a.done).length + ' of ' + c.asg.length + '</td><td>' + esc(c.weak.slice(0, 3).join('; ') || 'none') + '</td></tr>').join('') + '</tbody></table>' +
    '<div class="tools stack"><button type="button" id="tcc">Download the class table (.csv)</button><button type="button" id="tcx">Clear the class table</button></div>' + tlHandHtml();
}
function tlClassWire() {
  tlAsgWire(); $$('[data-hs]').forEach(b => { b.onclick = async () => { const h = TL_HAND[+b.dataset.hs]; recAdd(await (await fetch(h.take.data)).blob(), h.take.mime, h.take.ms, 'hand-in', h.name + ' - ' + h.take.name); tlStatus('tst', 'Saved to your recordings.'); }; }); if ($('#tcc')) $('#tcc').onclick = () => {
    const q = v => '"' + String(v).replace(/"/g, '""') + '"', rows = [['Student', 'Last report', 'Points', 'Minutes', 'Practice days', 'Rounds', 'Assignments done', 'Assignments total', 'Weak spots']].concat((P.cls || []).map(c => [c.name, c.when, c.xp, c.minutes, c.days, c.rounds, c.asg.filter(a => a.done).length, c.asg.length, c.weak.join('; ')]));
    tlDl('﻿' + rows.map(r => r.map(q).join(',')).join('\r\n'), 'staffwise-class.csv', 'text/csv'); tlStatus('tst', 'Class table downloaded.');
  };
  if ($('#tcx')) $('#tcx').onclick = () => { P.cls = []; save(); $('#tcl').innerHTML = tlClassHtml(); tlClassWire(); tlStatus('tst', 'Class table cleared.'); };
}

/* ---------------- backup and restore ---------------- */
const tlB64 = blob => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(blob); });
async function bkTakes() { try { return (await rtx('readonly', s => s.getAll())) || []; } catch (e) { return []; } }
function backup() {
  tlPage('Backup and restore',
    '<p>' + lines('Save your progress to a file, then restore it on this device or another one. Nothing is sent anywhere. Keep the file somewhere safe.', 'span') + '</p>' +
    '<div class="tools stack"><button type="button" id="bkp" class="next">Back up my progress (small file)</button><button type="button" id="bka">Back up progress and all recordings (large file)</button></div>' +
    '<h2>Restore</h2><div class="set" role="radiogroup" aria-label="How to restore"><label><input type="radio" name="bkm" value="merge" checked>Merge: keep the best of this device and the file</label><label><input type="radio" name="bkm" value="replace">Replace: use only what is in the file</label></div>' +
    '<div class="tools stack"><label class="ghost" style="cursor:pointer">Choose a backup file <input type="file" id="bki" accept=".json,application/json" style="max-width:190px"></label></div><p id="bks" class="total" role="status" aria-live="polite"></p>');
  const mk = async all => {
    tlStatus('bks', all ? 'Collecting your recordings…' : 'Saving…');
    const out = { app: 'staffwise', kind: 'backup', v: 1, when: new Date().toISOString(), progress: P, takes: [] };
    if (all) for (const t of await bkTakes()) { if (t.blob) out.takes.push({ name: t.name, mime: t.mime, ms: t.ms, src: t.src, data: await tlB64(t.blob) }); }
    P.bkAt = Date.now(); save();
    tlDl(JSON.stringify(out), 'staffwise-backup-' + new Date().toISOString().slice(0, 10) + (all ? '-with-recordings' : '') + '.json');
    tlStatus('bks', 'Backup downloaded' + (all ? ' with ' + out.takes.length + (out.takes.length === 1 ? ' recording.' : ' recordings.') : '.'));
  };
  $('#bkp').onclick = () => mk(false); $('#bka').onclick = () => mk(true);
  $('#bki').onchange = async e => { const f = e.target.files[0]; e.target.value = ''; if (f) bkRestore(await tlRead(f), document.querySelector('input[name=bkm]:checked').value); };
}
function bkMerge(a, b) {          // a = this device, b = the file: keep the larger of every count
  const out = JSON.parse(JSON.stringify(a)), mx = (x, y) => Math.max(x || 0, y || 0);
  Object.keys(b).forEach(k => {
    const v = b[k];
    if (k === 'set') { out.set = Object.assign({}, v, a.set || {}); }
    else if (k === 'tut' || k === 'sg') { out[k] = out[k] || {}; Object.keys(v).forEach(x => { out[k][x] = typeof v[x] === 'object' ? { best: mx(out[k][x] && out[k][x].best, v[x].best), plays: mx(out[k][x] && out[k][x].plays, v[x].plays) } : (out[k][x] || v[x]); }); }
    else if (k === 'log') { out.log = out.log || {}; Object.keys(v).forEach(d => { const o = out.log[d] || { sec: 0 }; out.log[d] = { sec: mx(o.sec, v[d].sec), met: o.met || v[d].met }; }); }
    else if (k === 'wk') { out.wk = out.wk || {}; Object.keys(v).forEach(m => { out.wk[m] = out.wk[m] || {}; Object.keys(v[m]).forEach(i => { const o = out.wk[m][i] || [0, 0]; out.wk[m][i] = [mx(o[0], v[m][i][0]), mx(o[1], v[m][i][1])]; }); }); }
    else if (k === 'my' || k === 'cls' || k === 'asg') { out[k] = out[k] || []; v.forEach(x => { const key = x.n || x.name || x.id; if (!out[k].some(y => (y.n || y.name || y.id) === key)) out[k].push(x); }); }
    else if (k === 'pbest' || k === 'who') out[k] = typeof v === 'number' ? mx(out[k], v) : (out[k] || v);
    else if (v && typeof v === 'object' && !Array.isArray(v)) { const o = out[k] || {}; out[k] = Object.assign({}, v, o); Object.keys(v).forEach(f => { if (typeof v[f] === 'number') out[k][f] = mx(o[f], v[f]); }); }
    else if (out[k] === undefined) out[k] = v;
  });
  return out;
}
async function bkRestore(txt, mode) {
  try {
    const b = JSON.parse(txt); if (b.app !== 'staffwise' || b.kind !== 'backup' || !b.progress) throw 0;
    const keepSet = P.set; P = mode === 'replace' ? Object.assign({}, b.progress, keepSet ? { set: Object.assign({}, b.progress.set || {}, keepSet) } : {}) : bkMerge(P, b.progress); save();
    let n = 0;
    if (Array.isArray(b.takes) && b.takes.length) {
      const have = new Set((await bkTakes()).map(t => t.name + '|' + t.ms));
      for (const t of b.takes) { if (have.has(t.name + '|' + t.ms)) continue; try { const blob = await (await fetch(t.data)).blob(); recAdd(blob, t.mime, t.ms, t.src, t.name); n++; } catch (e) {} }
    }
    tlStatus('bks', 'Restored (' + (mode === 'replace' ? 'replaced' : 'merged') + '). Progress from ' + String(b.when || '').slice(0, 10) + (n ? ' and ' + n + (n === 1 ? ' recording' : ' recordings') : '') + ' brought back.');
  } catch (e) { tlStatus('bks', 'That is not a Staffsounds backup file, so nothing was changed.'); }
}
