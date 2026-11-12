/* Staffsounds – Today's plan: a five-minute routine on the menu. It ticks itself off as you finish each part.
   Saved in P.plan = { d: day, done: { round, song, dict, sing } }. Called from end() (rounds), spFinish (songs),
   dtPress (dictation) and sgFinish (sing along). */

const PLAN_STEPS = [
  ['round', 'One round of questions', 'Your weak spots first, if you have any'],
  ['song', 'Play one song or part of a song', 'In the Keyboard duet, Songs panel'],
  ['dict', 'Solve one chord dictation', 'In the Keyboard duet'],
  ['sing', 'Sing along with one song (optional)', 'In the Voice studio']
];
const planState = () => { if (!P.plan || P.plan.d !== dayKey()) P.plan = { d: dayKey(), done: {} }; return P.plan; };
function planDone(k) {
  const p = planState(); if (p.done[k]) return; p.done[k] = 1; save();
  if (['round', 'song', 'dict'].every(x => p.done[x])) { if (typeof toast === 'function') toast('✅ Today\'s plan is done'); say('Today\'s plan is complete. Well done.'); }
  else say('Plan step done: ' + PLAN_STEPS.find(s => s[0] === k)[1] + '.');
  const e = $('#plsec'); if (e) { e.outerHTML = planHtml(); planWire(); }
}
function planHtml() {
  const p = planState(), n = ['round', 'song', 'dict'].filter(k => p.done[k]).length;
  return '<section class="grp" id="plsec" aria-label="Today\'s plan"><h2>Today\'s plan</h2><p class="pgs" role="status">' + (n === 3 ? 'All done for today. ' : n + ' of 3 steps done. ') + 'About five minutes.</p><ol class="plan">' +
    PLAN_STEPS.map(([k, t, d]) => '<li><div class="row"><button type="button" class="go" data-pl="' + k + '"><b>' + (p.done[k] ? '✓ ' : '') + t + '</b><span>' + d + '</span></button></div></li>').join('') + '</ol></section>';
}
function planWire() {
  $$('[data-pl]').forEach(b => { b.onclick = () => {
    const k = b.dataset.pl;
    if (k === 'round') { const w = wkAll().find(x => MODES[x.m] && MODES[x.m][2] && !isLocked(x.m)); if (w) WKNEXT = true; start(w ? w.m : 'notes', 1); }
    else if (k === 'sing') start('voice', 1);
    else { start('duet', 1); setTimeout(() => { const t = $(k === 'song' ? '#spn' : '#dtn'); if (t) { t.scrollIntoView({ block: 'center' }); t.focus(); } }, 150); }
  }; });
}
