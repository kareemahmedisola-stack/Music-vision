/* Staffsounds – engagement and reward features, built for ears and eyes alike.
   Sound cues, haptics and spoken announcements are given for everything that is shown on screen.
   1 chimes + haptics   2 overall level and badges   3 daily challenge   4 quick round   5 streak freeze   6 share card
   7 voice choice       (spaced repetition is in review.js, the weekly goal in practice.js, the menu tune in tunegame.js) */

/* ---------------------------------------------------------------- 1. chimes and haptics */
const HAP = { ok: [25], bad: [60, 40, 60], rew: [30, 60, 30, 60, 90], tick: [10] };
function haptic(k) { if (opt('hap', true) === false) return; try { if (navigator.vibrate) navigator.vibrate(HAP[k] || 20); } catch (e) {} }
const CUES = {
  xp: [[88, 0, .12, .07], [93, .08, .2, .06]],
  streak: [[72, 0, .14], [76, .11, .14], [79, .22, .14], [84, .33, .45]],
  badge: [[76, 0, .15], [80, .12, .15], [83, .24, .15], [88, .36, .6]],
  level: [[67, 0, .15], [72, .12, .15], [76, .24, .15], [79, .36, .15], [84, .5, .7]],
  daily: [[79, 0, .12], [83, .1, .12], [86, .2, .5]]
};
function cue(k) {
  if (opt('cue', true) === false || opt('snd', true) === false) return;
  PAN = 0; (CUES[k] || []).forEach(([m, t, d, v]) => tone(m, t, d, v || .1));
}

/* ---------------------------------------------------------------- 2. overall level and badges */
const lvAt = L => 40 * (L - 1) * (L - 1);                       // XP needed to reach level L
const ovLevel = xp => 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 40));
const ovPct = xp => { const L = ovLevel(xp); return Math.round((xp - lvAt(L)) / (lvAt(L + 1) - lvAt(L)) * 100); };

function bstats() {
  let rounds = 0, perfect = false;
  Object.keys(P).forEach(k => { const v = P[k]; if (v && typeof v === 'object' && v.xp !== undefined) { rounds += v.rounds || 0; if (v.best === 3) perfect = true; } });
  return { xp: hudXp(), rounds, perfect, streak: Math.max(P.pbest || 0, dayStreak()), run: (P.dc || {}).run || 0,
    q: Object.keys(P).reduce((a, k) => a + ((P[k] && P[k].qrounds) || 0), 0), open: Object.keys(UNLOCK).every(k => !isLocked(k)), tune: !!(P.tune && P.tune.done) };
}
const BADGES = [
  ['round1', '🎵', 'First round', 'Finish one round', z => z.rounds >= 1],
  ['xp100', '⭐', '100 XP', 'Earn 100 XP', z => z.xp >= 100],
  ['xp500', '🌟', '500 XP', 'Earn 500 XP', z => z.xp >= 500],
  ['xp1000', '💫', '1,000 XP', 'Earn 1,000 XP', z => z.xp >= 1000],
  ['xp2500', '🏅', '2,500 XP', 'Earn 2,500 XP', z => z.xp >= 2500],
  ['xp5000', '🏆', 'Maestro', 'Earn 5,000 XP', z => z.xp >= 5000],
  ['st3', '🔥', '3-day streak', 'Practise 3 days in a row', z => z.streak >= 3],
  ['st7', '🚀', 'Week streak', 'Practise 7 days in a row', z => z.streak >= 7],
  ['st14', '🌋', 'Fortnight streak', 'Practise 14 days in a row', z => z.streak >= 14],
  ['st30', '👑', 'Month streak', 'Practise 30 days in a row', z => z.streak >= 30],
  ['perfect', '✨', 'Perfect round', 'Get every answer right in a round', z => z.perfect],
  ['open', '🔓', 'Every door open', 'Unlock every mode', z => z.open],
  ['dc3', '📅', 'Daily habit', 'Finish the daily challenge 3 days in a row', z => z.run >= 3],
  ['dc7', '🗓️', 'Daily devotion', 'Finish the daily challenge 7 days in a row', z => z.run >= 7],
  ['quick5', '⚡', 'Quick learner', 'Finish 5 quick rounds', z => z.q >= 5],
  ['tune', '🎶', 'First song', 'Play the whole menu tune', z => z.tune]
];
function badgeCheck() {
  P.bd = P.bd || {}; const z = bstats(), fresh = [];
  BADGES.forEach(b => { if (!P.bd[b[0]] && b[4](z)) { P.bd[b[0]] = dayKey(); fresh.push(b); } });
  const L = ovLevel(z.xp), first = P.lvl === undefined;                     // existing players get no level-up fanfare the first time
  const up = !first && L > P.lvl; P.lvl = L;
  if (fresh.length || up || first) save();
  if (up) { toast('🎓 Level ' + L + '!'); say('You reached level ' + L + '.'); speak('You reached level ' + L + '.', 0, 1); cue('level'); haptic('rew'); }
  fresh.forEach((b, i) => setTimeout(() => {
    toast(b[1] + ' Badge: ' + b[2]); say('New badge: ' + b[2] + '. ' + b[3] + '.'); speak('New badge: ' + b[2] + '.', 0, 1); cue('badge'); haptic('rew');
    const e = $('#bdl'); if (e) badgesFill();
  }, (up ? 1800 : 0) + i * 2200));
  if (typeof hudUpdate === 'function') hudUpdate();
}
function badgesFill() {
  const e = $('#bdl'); if (!e) return; const n = BADGES.filter(b => (P.bd || {})[b[0]]).length;
  $('#bdn').textContent = 'Badges: ' + n + ' of ' + BADGES.length;
  e.innerHTML = BADGES.map(b => { const got = (P.bd || {})[b[0]]; return `<li class="${got ? 'earned' : 'lock'}"><i aria-hidden="true">${got ? b[1] : '🔒'}</i><b>${b[2]}</b><small>${got ? 'Earned ' + got : b[3]}</small><span class="sr">${got ? 'earned' : 'not yet earned'}</span></li>`; }).join('');
}
function badgesHtml() {
  const z = hudXp(), L = ovLevel(z), n = BADGES.filter(b => (P.bd || {})[b[0]]).length;
  return `<details class="more badges" id="bdbox"><summary><span id="bdn">Badges: ${n} of ${BADGES.length}</span> · Level ${L}</summary>` +
    `<p class="pgs">Level ${L}: ${z - lvAt(L)} of ${lvAt(L + 1) - lvAt(L)} XP towards level ${L + 1}.</p><span class="meter" role="img" aria-label="${ovPct(z)} percent of the way to level ${L + 1}"><i style="width:${ovPct(z)}%"></i></span>` +
    `<ul class="bdg" id="bdl" aria-label="Badges"></ul><div class="tools stack"><button type="button" id="shr">📤 Share my progress</button></div><p class="total" id="shs" role="status" aria-live="polite"></p></details>`;
}

/* ---------------------------------------------------------------- 3. daily challenge (same ten questions all day, in a mode picked by the date) */
const dayNum = () => Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
function withSeed(seed, fn) {
  const r = Math.random; let a = seed >>> 0;
  Math.random = () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  try { return fn(); } finally { Math.random = r; }
}
/* the day's mode is chosen once and kept, even if more modes unlock during the day, so the ten questions never change */
function dailyMode() {
  if (P.dm && P.dm.d === dayKey() && MODES[P.dm.m] && MODES[P.dm.m][2]) return P.dm.m;
  const ks = Object.keys(MODES).filter(k => MODES[k][2] && !isLocked(k)).sort(); if (!ks.length) return null;
  P.dm = { d: dayKey(), m: ks[dayNum() % ks.length] }; save(); return P.dm.m;
}
const dailyIsDone = () => (P.dc || {}).d === dayKey();
function startDaily() {
  const m = dailyMode(); if (!m) return;
  if (!P.dm.lv) { P.dm.lv = levelOf(m); save(); }
  S = { m, daily: true, dlv: P.dm.lv, dseed: dayNum() * 7919 + m.length * 31, n: 10, i: 0, sc: 0, ok: 0, st: 0, done: false, log: [], lv0: levelOf(m), lk0: Object.keys(UNLOCK).filter(isLocked) };
  ask();
}
function dailyDone(a, N) {
  if (dailyIsDone()) return 0;
  const y = new Date(); y.setDate(y.getDate() - 1);
  const run = (P.dc || {}).d === dayKey(y) ? ((P.dc || {}).run || 0) + 1 : 1, bonus = 20 + (a === N ? 10 : 0);
  P.dc = { d: dayKey(), ok: a, run }; pm(S.m).xp += bonus; save();
  setTimeout(() => { toast('🏆 Daily challenge done! +' + bonus + ' XP'); say('Daily challenge complete. ' + bonus + ' bonus XP. ' + run + (run === 1 ? ' day' : ' days') + ' in a row.'); cue('daily'); haptic('rew'); }, 900);
  return bonus;
}

/* ---------------------------------------------------------------- 4. quick round (5 questions, about two minutes) */
function quickStart() {
  const m = P.last && MODES[P.last] && MODES[P.last][2] && !isLocked(P.last) ? P.last : 'notes';
  QN = 5; start(m, 1);
}

/* ---------------------------------------------------------------- 5. streak freeze: one missed day per week is forgiven automatically */
function freezeCheck() {
  const wk = dayKey(weekStart()); P.fz = P.fz || { wk: '', used: 0 };
  if (P.fz.wk !== wk) { P.fz.wk = wk; P.fz.used = 0; }
  const y = new Date(), z = new Date(); y.setDate(y.getDate() - 1); z.setDate(z.getDate() - 2);
  const ok = d => { const l = (P.log || {})[dayKey(d)]; return l && (l.met || l.fz); };
  if (!ok(y) && ok(z) && P.fz.used < 1) {
    P.log = P.log || {}; P.log[dayKey(y)] = Object.assign(P.log[dayKey(y)] || { sec: 0 }, { fz: true }); P.fz.used++; save();
    const n = dayStreak(), m = '🧊 Streak freeze used for yesterday. Your ' + n + '-day streak is safe. Practise today to keep it going.';
    setTimeout(() => { toast(m); say(m); }, 900);
  } else save();
}

/* ---------------------------------------------------------------- 6. share my progress: a picture card and a text, by the phone's share sheet, or a download */
function shareText() {
  const z = bstats(), n = BADGES.filter(b => (P.bd || {})[b[0]]).length;
  return 'I am on a ' + z.streak + '-day practice streak in Staffsounds: ' + z.xp + ' XP, level ' + ovLevel(z.xp) + ', ' + n + ' of ' + BADGES.length + ' badges. 🎵';
}
function shareCanvas() {
  const c = document.createElement('canvas'); c.width = 1200; c.height = 630; const g = c.getContext('2d'), z = bstats();
  const bg = g.createLinearGradient(0, 0, 1200, 630); bg.addColorStop(0, '#0e1726'); bg.addColorStop(1, '#1d3557'); g.fillStyle = bg; g.fillRect(0, 0, 1200, 630);
  g.fillStyle = '#ffc857'; g.font = 'bold 54px system-ui,sans-serif'; g.fillText('STAFFSOUNDS', 60, 100);
  g.fillStyle = '#c9d6ee'; g.font = '30px system-ui,sans-serif'; g.fillText((P.who ? P.who + ' · ' : '') + 'my music-reading progress', 60, 150);
  [['🔥', z.streak, 'day streak'], ['⭐', z.xp, 'XP'], ['🎓', ovLevel(z.xp), 'level']].forEach((t, i) => {
    const x = 60 + i * 370; g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x, 220, 340, 230);
    g.font = '64px system-ui,sans-serif'; g.fillStyle = '#fff'; g.fillText(t[0], x + 24, 300);
    g.font = 'bold 96px system-ui,sans-serif'; g.fillStyle = '#ffc857'; g.fillText(String(t[1]), x + 24, 395);
    g.font = '30px system-ui,sans-serif'; g.fillStyle = '#c9d6ee'; g.fillText(t[2], x + 24, 436);
  });
  g.font = '34px system-ui,sans-serif'; g.fillStyle = '#fff';
  g.fillText(BADGES.filter(b => (P.bd || {})[b[0]]).map(b => b[1]).join(' ') || 'Badges are on their way.', 60, 540);
  return c;
}
async function shareProgress() {
  const t = shareText(), out = $('#shs'), note = m => { if (out) out.textContent = m; say(m); };
  try {
    const c = shareCanvas(), blob = await new Promise(r => c.toBlob(r, 'image/png')), f = blob && new File([blob], 'staffsounds-progress.png', { type: 'image/png' });
    if (f && navigator.canShare && navigator.canShare({ files: [f] })) { await navigator.share({ files: [f], text: t }); note('Shared. The card says: ' + t); return; }
    if (navigator.share) { await navigator.share({ text: t }); note('Shared: ' + t); return; }
    if (f) { const a = document.createElement('a'); a.href = URL.createObjectURL(f); a.download = 'staffsounds-progress.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
    try { await navigator.clipboard.writeText(t); note('Picture saved and text copied: ' + t); } catch (e) { note('Picture saved. Text: ' + t); }
  } catch (e) { if (e && e.name === 'AbortError') return; try { await navigator.clipboard.writeText(t); note('Text copied: ' + t); } catch (x) { note(t); } }
}

/* ---------------------------------------------------------------- 7. voice choice and speed test */
function voiceWire() {
  const sel = $('#vsel'); if (!sel) return;
  const fill = () => { const vs = VOICES(); sel.innerHTML = '<option value="">Device default</option>' + vs.map(v => `<option value="${esc(v.name)}"${v.name === opt('voice', '') ? ' selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join(''); };
  fill(); try { speechSynthesis.onvoiceschanged = fill; } catch (e) {}
  sel.onchange = () => { P.set = P.set || {}; P.set.voice = sel.value; save(); speakTest('This is the chosen voice.', opt('rate', 1)); };
  const t = $('#vtest'); if (t) t.onclick = () => speakTest('This is the voice at the speed for menus. Questions and lessons can have their own speed.', opt('rate', 1));
}
function speakTest(txt, rate) {
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.rate = rate; const v = pickVoice(); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { say(txt); }
}
const speakRate = n => { if (spk()) speakTest('This is the speech speed.', opt(n, 1)); };

/* ---------------------------------------------------------------- menu pieces */
function engageHtml(fresh) {
  const done = dailyIsDone(), dm = dailyMode(), run = (P.dc || {}).run || 0;
  return (fresh ? '' : `<div class="duo"><button type="button" id="dcb" class="big-b${done ? ' done' : ''}"><span aria-hidden="true">🏆</span><b>Daily challenge</b><small>${done ? 'Done today: ' + P.dc.ok + ' of 10' + (run > 1 ? ' · ' + run + ' days in a row' : '') + '. Play again for practice' : MODES[dm][0] + ' · +20 XP, +10 for perfect'}</small></button>` +
    `<button type="button" id="qrb" class="big-b"><span aria-hidden="true">⚡</span><b>Quick round</b><small>5 questions, about 2 minutes</small></button></div>`) +
    `<details class="more"><summary>More to try</summary><div class="tools stack"><button type="button" id="tgb">🎶 Play the menu tune yourself</button><button type="button" id="gd">How to get around (press ?)</button><button type="button" id="a11yb">✅ Run an accessibility check</button></div><p class="total" id="a11yo" role="status" aria-live="polite"></p></details>`;
}
function engageWire() {
  if ($('#dcb')) $('#dcb').onclick = startDaily;
  if ($('#qrb')) $('#qrb').onclick = quickStart;
  if ($('#tgb')) $('#tgb').onclick = () => tuneGame();
  if ($('#shr')) $('#shr').onclick = shareProgress;
  if ($('#a11yb')) $('#a11yb').onclick = () => { const r = a11yAudit(); const t = r.length ? r.length + ' possible problems on this screen: ' + r.slice(0, 6).join('; ') + '.' : 'No problems found on this screen: every control has a name, headings are in order and ids are unique.'; $('#a11yo').textContent = t; say(t); };
  badgesFill();
  if ($('.hero')) badgeCheck();
}
