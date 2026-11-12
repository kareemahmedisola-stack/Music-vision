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
  const d = new Date(), met = x => { const l = dayLog(dayKey(x)); return l && l.met; };
  if (!met(d)) d.setDate(d.getDate() - 1);
  let n = 0; while (met(d)) { n++; d.setDate(d.getDate() - 1); }
  if (n > (P.pbest || 0)) { P.pbest = n; }
  return n;
}
const minTxt = s => s < 60 ? (s ? 'under a minute' : '0 minutes') : Math.floor(s / 60) + (Math.floor(s / 60) === 1 ? ' minute' : ' minutes');

function practiceHtml() {
  const t = dayLog() || { sec: 0 }, g = goalMin(), pct = Math.min(100, Math.round(t.sec / (g * 60) * 100)), st = dayStreak(), days = [];
  let week = 0, total = 0;
  Object.values(P.log || {}).forEach(l => { total += l.sec || 0; });
  for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const l = dayLog(dayKey(d)) || { sec: 0 }; week += l.sec; days.push([d.toLocaleDateString(undefined, { weekday: 'short' }), d.toLocaleDateString(undefined, { weekday: 'long' }), l]); }
  return `<section class="grp practice" id="prsec" aria-label="Your practice"><h2>Your practice</h2>` +
    `<p class="pgs" id="pgoal" role="status">Today: ${minTxt(t.sec)} of ${g} ${g === 1 ? 'minute' : 'minutes'}${t.met ? '. Goal reached!' : ''}</p>` +
    `<span class="meter" role="img" aria-label="${pct} percent of today's goal"><i style="width:${pct}%"></i></span>` +
    `<p class="pgs">${st ? '🔥 ' : ''}Day streak: ${st} ${st === 1 ? 'day' : 'days'}. Best: ${Math.max(P.pbest || 0, st)}.<br>This week: ${minTxt(week)}. All time: ${minTxt(total)}.</p>` +
    `<ul class="week" aria-label="Last seven days">${days.map(([s, long, l]) => `<li aria-label="${long}: ${minTxt(l.sec)}${l.met ? ', goal reached' : ''}"><i class="${l.met ? 'met' : ''}" style="height:${Math.max(3, Math.min(100, Math.round(l.sec / (g * 60) * 100)))}%"></i><span aria-hidden="true">${s}</span></li>`).join('')}</ul>` +
    `<div class="set"><label>Daily goal <select id="pgsel">${[5, 10, 15, 20, 30, 45, 60].map(m => `<option value="${m}"${m === g ? ' selected' : ''}>${m} minutes</option>`).join('')}</select></label></div></section>`;
}
function practiceWire() {
  const s = $('#pgsel'); if (!s) return;
  s.onchange = () => { P.set = P.set || {}; P.set.goal = +s.value; const d = dayLog(); if (d) d.met = d.sec >= P.set.goal * 60 ? true : d.met; save(); practiceRefresh(); const n = $('#pgsel'); if (n) n.focus(); say('Daily goal ' + s.value + ' minutes'); };
}
function practiceRefresh() {
  const sec = $('#prsec'); if (!sec) return;
  sec.outerHTML = practiceHtml(); practiceWire();
}

/* one tick of practice time (the timer below calls this every 5 seconds) */
function practiceTick(sec) {
  if (!(S || TUT_ON)) return;
  const d = dayEnsure(); d.sec += sec;
  if (!d.met && d.sec >= goalMin() * 60) {
    d.met = true; const n = dayStreak(); save();
    const m = 'Daily goal reached: ' + goalMin() + ' minutes. ' + (n > 1 ? n + ' days in a row.' : 'Your streak has started.');
    say(m); speak(m); try { keyFx(innerWidth / 2, innerHeight / 3); } catch (e) {}
  }
}
setInterval(() => {
  if (document.visibilityState !== 'visible' || Date.now() - LASTACT > 60000) return;
  practiceTick(5);
  const d = dayLog(); if (d && d.sec % 30 === 0) save();
  if ($('#pgoal')) practiceRefresh();
}, 5000);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') save(); });
addEventListener('pagehide', save);
