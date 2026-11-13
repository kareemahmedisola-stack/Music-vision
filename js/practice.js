/* Staffsounds – practice tracking: minutes played, a daily goal and a day streak.
   Time counts only while a round, lesson or playground is open, the tab is visible, and you did something in the last minute.
   Saved in P.log (one entry per day) and P.set.goal (minutes). */

const pad2 = n => String(n).padStart(2, '0');
const dayKey = d => { d = d || new Date(); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); };
const goalMin = () => opt('goal', 5);
const dayLog = k => (P.log || {})[k || dayKey()];
const dayEnsure = () => { P.log = P.log || {}; const k = dayKey(); return (P.log[k] = P.log[k] || { sec: 0 }); };
let LASTACT = 0;
const actNow = () => { LASTACT = Date.now(); };
['keydown', 'pointerdown', 'touchstart'].forEach(t => document.addEventListener(t, actNow, true));

/* consecutive days that reached the goal, ending today (or yesterday, if today is still in progress) */
function dayStreak() {
  const d = new Date(), met = x => { const l = dayLog(dayKey(x)); return l && (l.met || l.fz); };
  if (!met(d)) d.setDate(d.getDate() - 1);
  let n = 0; while (met(d)) { n++; d.setDate(d.getDate() - 1); }
  if (n > (P.pbest || 0)) { P.pbest = n; }
  return n;
}
/* practice days this week (Monday to Sunday) against the weekly goal */
const weekStart = d => { const x = new Date(d || Date.now()); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
const wgoal = () => opt('wgoal', 5);
function weekDaysMet() { const d = weekStart(); let n = 0; for (let i = 0; i < 7; i++) { const l = dayLog(dayKey(d)); if (l && l.met) n++; d.setDate(d.getDate() + 1); } return n; }
const minTxt = s => s < 60 ? (s ? 'under a minute' : '0 minutes') : Math.floor(s / 60) + (Math.floor(s / 60) === 1 ? ' minute' : ' minutes');

function practiceHtml() {
  const t = dayLog() || { sec: 0 }, g = goalMin(), pct = Math.min(100, Math.round(t.sec / (g * 60) * 100)), st = dayStreak(), days = [];
  let week = 0, total = 0;
  Object.values(P.log || {}).forEach(l => { total += l.sec || 0; });
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const l = dayLog(dayKey(d)) || { sec: 0 }; week += l.sec; days.push([d.toLocaleDateString(undefined, { weekday: 'short' }), d.toLocaleDateString(undefined, { weekday: 'long' }), l]); }
  return `<section class="grp practice" id="prsec" aria-label="Your practice"><h2>Today</h2>` +
    `<p class="pgs" id="pgoal" role="status">Today: ${minTxt(t.sec)} of ${g} ${g === 1 ? 'minute' : 'minutes'}${t.met ? '. Goal reached!' : ''}</p>` +
    `<span class="meter" role="img" aria-label="${pct} percent of today's goal"><i style="width:${pct}%"></i></span>` +
    `<p class="pgs" id="pwk">This week: ${weekDaysMet()} of ${wgoal()} practice days.${weekDaysMet() >= wgoal() ? ' Weekly goal reached! 🎉' : ''}</p>` +
    `<span class="meter" role="img" aria-label="${weekDaysMet()} of ${wgoal()} days this week"><i style="width:${Math.min(100, Math.round(weekDaysMet() / wgoal() * 100))}%"></i></span>` +
    `<p class="pgs">${st ? '🔥 ' : ''}Day streak: ${st} ${st === 1 ? 'day' : 'days'}. Best: ${Math.max(P.pbest || 0, st)}.</p>` +
    `<details class="more"><summary>Weekly chart, totals and daily goal</summary><p class="pgs">This week: ${minTxt(week)}. All time: ${minTxt(total)}.</p>` +
    `<ul class="week" aria-label="Last seven days">${days.map(([s, long, l]) => `<li aria-label="${long}: ${minTxt(l.sec)}${l.met ? ', goal reached' : ''}"><i class="${l.met ? 'met' : ''}" style="height:${Math.max(3, Math.min(100, Math.round(l.sec / (g * 60) * 100)))}%"></i><span aria-hidden="true">${s}</span></li>`).join('')}</ul>` +
    `<p class="pgs">🧊 Streak freeze: ${(P.fz || {}).used ? 'used this week' : '1 ready this week'}. If you miss one day, a freeze protects your streak automatically.</p><div class="set"><label>Weekly goal <select id="wgsel">${[1, 2, 3, 4, 5, 6, 7].map(n => `<option value="${n}"${n === wgoal() ? ' selected' : ''}>${n} ${n === 1 ? 'day' : 'days'}</option>`).join('')}</select></label><label>Daily goal <select id="pgsel">${[5, 10, 15, 20, 30, 45, 60].map(m => `<option value="${m}"${m === g ? ' selected' : ''}>${m} minutes</option>`).join('')}</select></label></div></details></section>`;
}
function practiceWire() {
  const s = $('#pgsel'); if (!s) return;
  const w = $('#wgsel'); if (w) w.onchange = () => { P.set = P.set || {}; P.set.wgoal = +w.value; save(); practiceRefresh(true); const n = $('#wgsel'); if (n) n.focus(); say('Weekly goal ' + w.value + (w.value === '1' ? ' day.' : ' days.')); };
  s.onchange = () => { P.set = P.set || {}; P.set.goal = +s.value; const d = dayLog(); if (d) d.met = d.sec >= P.set.goal * 60 ? true : d.met; save(); practiceRefresh(true); const n = $('#pgsel'); if (n) n.focus(); say('Daily goal ' + s.value + ' minutes'); };
}
function practiceRefresh(force) {
  const sec = $('#prsec'); if (!sec) return;
  if (!force && sec.contains(document.activeElement)) return;          // never rebuild a box the player is using
  const d = $('details', sec), open = d && d.open;
  sec.outerHTML = practiceHtml(); practiceWire();
  const n = $('#prsec details'); if (n && open) n.open = true;
}

/* one tick of practice time (the timer below calls this every 5 seconds) */
function practiceTick(sec) {
  if (!(S || TUT_ON)) return;
  const d = dayEnsure(); d.sec += sec;
  if (!d.met && d.sec >= goalMin() * 60) {
    d.met = true; const n = dayStreak(); save();
    const m = 'Daily goal reached: ' + goalMin() + ' minutes. ' + (n > 1 ? n + ' days in a row.' : 'Your streak has started.');
    say(m); speak(m); try { keyFx(innerWidth / 2, innerHeight / 3); } catch (e) {}
    const wk = weekDaysMet() === wgoal() ? ' Weekly goal reached: ' + wgoal() + ' practice days this week!' : '';
    if (wk) { toast('🎉 Weekly goal reached!'); say(m + wk); speak(wk, 0, 1); }
    cue('streak'); haptic('rew');
    if (typeof hudUpdate === 'function') hudUpdate();
    if (typeof badgeCheck === 'function') setTimeout(badgeCheck, 1500);
  }
}
setInterval(() => {
  if (document.visibilityState !== 'visible' || Date.now() - LASTACT > 60000) return;
  practiceTick(5);
  const d = dayLog(); if (d && d.sec % 30 === 0) save();
  if ($('#pgoal')) practiceRefresh();
  if (typeof hudUpdate === 'function') hudUpdate();
}, 5000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
addEventListener('pagehide', save);
