/* Staffsounds – menu, question rounds, timer and results */

const GROUPS = [
  ['Read the page', ['notes', 'keys', 'values', 'terms', 'braille']],
  ['Know your theory', ['theory', 'insts']],
  ['Train your ear', ['ints', 'chords', 'prog', 'scales', 'meter']],
  ['Play', ['free', 'duet', 'voice', 'guitar', 'trumpet', 'sax', 'drums']]
];
const GCLS = { 'Read the page': 'g-read', 'Know your theory': 'g-theory', 'Train your ear': 'g-ear', 'Play': 'g-play' };
const SETTINGS = [['snd', 'Sound', true], ['lg', 'Larger display', false], ['hc', 'High contrast', false], ['rm', 'Reduce motion', false], ['tm', 'Question timer', true], ['ex', 'Double time', false], ['sp', 'Spoken mode: reads everything aloud, no screen reader needed', false], ['wy', 'Explain answers even when I am right', false], ['kn', 'Show note names on piano keys', true], ['cue', 'Progress chimes (XP, streak, badges)', true], ['hap', 'Vibrate on answers and rewards (phones)', true], ['pan', 'Spatial sound: low notes left, high notes right', true], ['ua', 'Unlock all modes and lessons (skip the quota)', false]];

function applySet() {
  const c = document.documentElement.classList;
  c.toggle('lg', !!opt('lg', false)); c.toggle('hc', !!opt('hc', false)); c.toggle('rm', !!opt('rm', false));
}

/* ---------------------------------------------------------------- unlock quota
   Answer QUOTA questions correctly in a mode to open the next mode (and its lesson). Piano playground, Music braille,
   Theory facts, Read the note and Intervals are open from the start, so blind and sighted learners both have a way in. */
let PGK = null;                 // which playground is open (the piano and saxophone share one screen)
const QUOTA = 10;
const UNLOCK = { keys: 'notes', values: 'keys', terms: 'values', chords: 'ints', prog: 'chords', scales: 'ints', meter: 'ints', insts: 'theory', guitar: 'theory', trumpet: 'ints', sax: 'chords', drums: 'meter' };
const isLocked = k => !opt('ua', false) && !!UNLOCK[k] && pm(UNLOCK[k]).right < QUOTA;
const lockMsg = k => `Locked. Answer ${QUOTA} questions correctly in ${MODES[UNLOCK[k]][0]} to unlock ${MODES[k][0]} and its lesson. You have ${Math.min(QUOTA, pm(UNLOCK[k]).right)} of ${QUOTA}.`;

/* ---------------------------------------------------------------- menu */
function modeRow(k) {
  const m = MODES[k], p = pm(k);
  if (isLocked(k)) {
    const n = Math.min(QUOTA, pm(UNLOCK[k]).right);
    return `<div class="row locked"><button type="button" class="go" data-go="${k}" aria-disabled="true"><b>🔒 ${m[0]}</b><span>${m[1]}</span>` +
      `<span class="meta">Locked. Answer ${QUOTA} questions correctly in ${MODES[UNLOCK[k]][0]} to open it (${n} of ${QUOTA}).</span>` +
      `<span class="meter" role="img" aria-label="${n} of ${QUOTA} correct answers needed in ${MODES[UNLOCK[k]][0]}"><i style="width:${n * 100 / QUOTA}%"></i></span></button><div class="side"><div class="lv" aria-hidden="true">🔒</div></div></div>`;
  }
  if (!m[2]) {                       // a playground (piano, guitar, trumpet, sax, drums), no levels
    const done = (P.tut || {})[k];
    return `<div class="row"><button class="go" data-go="${k}"><b>${m[0]}</b><span>${m[1]}</span></button><div class="side"><div class="lv" aria-hidden="true">♪</div>` +
      (LESSONS[k] ? `<button type="button" class="ls${done ? ' done' : ''}" data-lesson="${k}" aria-label="${done ? 'Replay' : 'Start'} lesson: ${m[0]}">${done ? 'Lesson ✓' : 'Lesson'}</button>` : '') + '</div></div>';
  }
  const lv = levelOf(k), into = p.right % 10, best = p.best || 0;
  const acc = p.seen ? Math.round(100 * p.right / p.seen) + '% correct' : 'not played yet';
  const stars = p.seen ? ` · <span class="stars-s" role="img" aria-label="Best round: ${best} of 3 stars">${'★'.repeat(best)}${'☆'.repeat(3 - best)}</span>` : '';
  const done = (P.tut || {})[k];
  return `<div class="row"><button class="go" data-go="${k}"><b>${m[0]}</b><span>${m[1]}</span><span class="meta">${acc}${stars}</span>` +
    `<span class="meter" role="img" aria-label="${into} of 10 correct answers towards level ${lv + 1}"><i style="width:${into * 10}%"></i></span></button>` +
    `<div class="side"><div class="lv">${lv}<small>level</small></div><button type="button" class="ls${done ? ' done' : ''}" data-lesson="${k}" aria-label="${done ? 'Replay' : 'Start'} lesson: ${m[0]}">${done ? 'Lesson ✓' : 'Lesson'}</button></div></div>`;
}

function menu() {
  if (typeof h3Stop === 'function') h3Stop(); clearTimer(); stopDr(); allOff(); recStop(); OCT = 0; TR = 0; S = null; TUT_ON = false; scrollTo(0, 0);
  const tot = Object.values(P).reduce((a, b) => a + (b && b.xp || 0), 0);
  const fresh = !tot && !Object.keys(P.tut || {}).length;
  app.innerHTML =
    `<div class="hero"><svg viewBox="0 0 300 56" aria-hidden="true">${[0, 1, 2, 3, 4].map(i => `<line x1="0" x2="300" y1="${8 + i * 10}" y2="${8 + i * 10}"/>`).join('')}` +
    `<ellipse cx="60" cy="38" rx="7" ry="5" transform="rotate(-20 60 38)"/><ellipse cx="120" cy="28" rx="7" ry="5" transform="rotate(-20 120 28)"/><ellipse cx="180" cy="18" rx="7" ry="5" transform="rotate(-20 180 18)"/><ellipse cx="240" cy="28" rx="7" ry="5" transform="rotate(-20 240 28)"/></svg>` +
    `<h1 class="brand">STAFFSOUNDS</h1><p class="byline">Produced by <b>AWESOME KAM</b> of <b>The AWESOMEPLANET</b></p><p class="sub"><span class="ln">Ten questions a round. Ten right answers unlock the next mode.</span></p></div>` +
    `<section class="starthere" aria-label="Start here"><h2>${fresh ? 'Start here' : 'Keep going'}</h2><div class="tools stack">` +
    (fresh || !P.last || !MODES[P.last] || isLocked(P.last) ? `<button type="button" class="next" data-lesson="start">${(P.tut || {}).start ? '▶ Replay the welcome tutorial' : '▶ Start the welcome tutorial'}</button>${fresh ? '<button type="button" data-lesson="notes">Then: your first lesson, reading notes</button>' : ''}`
      : `<button type="button" class="next cta" data-go="${P.last}">▶ Continue: ${MODES[P.last][0]}</button><button type="button" data-lesson="start">${(P.tut || {}).start ? 'Replay the welcome tutorial' : 'Welcome tutorial'}</button>`) +
    `${typeof engageHtml === 'function' ? engageHtml(fresh) : ''}</div></section>` + practiceHtml() + (typeof badgesHtml === 'function' ? badgesHtml() : '') +
    GROUPS.map(([t, ks]) => `<section class="grp modes ${GCLS[t]}" aria-label="${t}"><h2>${t}</h2>${ks.map(modeRow).join('')}</section>`).join('') +
    `<div id="toolsslot"></div>` +
    `<p class="total" id="offl"></p>` +
    `<details class="tips more"><summary>Keyboard tips</summary><p class="total"><span class="ln">Press D here to open the Keyboard duet.</span><span class="ln">In any playground, Page Down and Page Up switch to the next and previous one, and Escape returns here.</span><span class="ln">Every mode has a <b>Lesson</b> button if you want a refresher.</span></p></details>` +
    `<details class="settings"><summary>Settings</summary><div class="set" role="group" aria-label="Accessibility and sound settings">${SETTINGS.map(([k, t, d]) => `<label><input type="checkbox" name="${k}" ${opt(k, d) ? 'checked' : ''} ${k === 'sp' && !('speechSynthesis' in window) ? 'disabled' : ''}>${t}</label>`).join('')}<label>Speech speed <input type="range" name="rate" min=".7" max="1.6" step=".1" value="${opt('rate', 1)}" style="width:110px"></label><label>Question speed <input type="range" name="rateq" min=".7" max="1.8" step=".1" value="${opt('rateq', opt('rate', 1))}" style="width:110px"></label><label>Lesson speed <input type="range" name="ratel" min=".7" max="1.6" step=".1" value="${opt('ratel', opt('rate', 1))}" style="width:110px"></label><label>Voice <select name="voice" id="vsel"><option value="">Device default</option></select></label><button type="button" id="vtest" class="ghost">Test the voice</button></div>` +
    `<div class="tools"><button type="button" id="rs">Reset all progress</button></div></details>` +
    (typeof whyHtml === 'function' ? whyHtml() : '');
  $$('.row .go').forEach(b => { b.onclick = () => start(b.dataset.go); });
  $$('.cta[data-go]').forEach(b => { b.onclick = () => start(b.dataset.go); });
  $('#gd').onclick = () => guide(); practiceWire(); if (typeof engageWire === 'function') engageWire(); toolsWire(); offlineStatus(); if (typeof heroStart === 'function') heroStart();
  $$('[data-lesson]').forEach(b => { b.onclick = () => tutorial(b.dataset.lesson); });
  if (typeof voiceWire === 'function') voiceWire();
  $$('.set input').forEach(i => {
    i.onchange = () => {
      P.set = P.set || {}; P.set[i.name] = i.type === 'range' ? +i.value : i.checked; save(); applySet();
      if (i.name === 'sp') { if (i.checked) speak('Spoken mode on. Menus, questions, lessons, answers and instrument notes will be read aloud.'); else speakStop(); }
      if (i.name === 'rate' || i.name === 'rateq' || i.name === 'ratel') { P.set.rate = P.set.rate || 1; speakRate(i.name); }
      if (i.name === 'cue' && i.checked) cue('xp'); if (i.name === 'hap' && i.checked) haptic('ok');
    };
  });
  $$('.row .go').forEach(b => { b.onfocus = () => speak(b.querySelector('b').textContent.replace('🔒', 'Locked.') + '. ' + b.querySelector('span').textContent + (b.dataset.go && isLocked(b.dataset.go) ? '. ' + lockMsg(b.dataset.go) : '')); });
  if (spk()) speak('Staffsounds, produced by Awesome Kam of The Awesomeplanet. Main menu. Press Tab to hear each mode and Enter to open one.');
  const rs = $('#rs'); let armed = 0;
  rs.onclick = () => {
    if (!armed) { armed = 1; rs.textContent = 'Press again to erase everything'; setTimeout(() => { armed = 0; if ($('#rs')) $('#rs').textContent = 'Reset all progress'; }, 4000); return; }
    const keep = P.set; P = keep ? { set: keep } : {}; save(); menu(); say('Progress reset');
  };
}

/* ---------------------------------------------------------------- a round */
let QN = 0;                       // set to 5 by the Quick round button for the next round only
function start(m, skipLesson) {
  if (isLocked(m)) { say(lockMsg(m)); speak(lockMsg(m)); const b = $(`[data-go="${m}"]`); if (b && b.classList) { b.classList.remove('nope'); void b.offsetWidth; b.classList.add('nope'); } return; }
  if (!skipLesson && !(P.tut || {})[m] && LESSONS[m]) return tutorial(m);          // first visit: the lesson opens by itself
  if (!skipLesson && MODES[m][2] && LESSONS[m]) return ready(m);                   // every later visit: a Ready screen first
  if (LIVE[m]) { PGK = m; return LIVE[m](); }
  S = { m, wk: WKNEXT, n: QN || 10, i: 0, sc: 0, ok: 0, st: 0, done: false, log: [], lv0: levelOf(m), lk0: Object.keys(UNLOCK).filter(isLocked) };
  WKNEXT = false; QN = 0; P.last = m; save();
  ask();
}

/* the screen before every round: a short lesson for this round (one step of the mode's lesson, a new one each round),
   then start the questions. "Another mini-lesson" and "Previous" step through the rest. */
function ready(m, kk) {
  clearTimer(); TUT_ON = false; S = null; scrollTo(0, 0);
  const p = pm(m), L = LESSONS[m], n = L.steps.length, k = ((kk == null ? (p.rounds || 0) : kk) % n + n) % n, st = L.steps[k];
  const lv = levelOf(m), ki = (LESSON_AIDS[m] || {}).keys || [], nm = j => esc(L.steps[(k + j + n) % n].h);
  app.innerHTML = `<article class="lesson ready"><div class="ltop"><button type="button" id="rb">← Menu</button><span aria-hidden="true">Round ${(p.rounds || 0) + 1} · Level ${lv}</span></div>` +
    `<p class="kicker">${esc(MODES[m][0])} · Lesson for this round ${k + 1} of ${n}</p><h2 id="qh" tabindex="-1">${st.h}</h2>` +
    `<div id="rsum">${st.p.map(x => lines(x)).join('')}${typeof st.vis === 'string' ? st.vis : ''}` +
    (ki[k] ? `<div class="keyidea"><b>Key idea</b>${lines(ki[k], 'span')}</div>` : '') + '</div>' +
    `<div class="tools stack">${st.hear ? `<button type="button" class="mini" id="rh" ${st.hear[0]}>🔊 ${st.hear[1]}</button>` : ''}` +
    `<button type="button" id="rg" class="next">Start the questions</button></div>` +
    `<details class="more"><summary>More lessons</summary><div class="tools stack">` +
    (n > 1 ? `<button type="button" id="rn">Another mini-lesson: ${nm(1)} →</button><button type="button" id="rp">← Previous mini-lesson: ${nm(-1)}</button>` : '') +
    `<button type="button" id="rl">Review the whole lesson</button></div></details></article>`;
  wireDemos();
  $('#rb').onclick = menu; $('#rl').onclick = () => tutorial(m); $('#rg').onclick = () => start(m, 1);
  if ($('#rn')) { $('#rn').onclick = () => ready(m, k + 1); $('#rp').onclick = () => ready(m, k - 1); }
  $('#rg').focus();
  speak('Round ' + ((p.rounds || 0) + 1) + '. ' + st.h + '. ' + st.p.map(plain).join(' ') + ' ' + plain(typeof st.vis === 'string' ? st.vis : '') + ' ' + (ki[k] ? 'Key idea. ' + ki[k] + ' ' : '') + 'Press Enter to start the questions.');
}

function ask() {
  TUT_ON = false;
  if (S.i >= (S.n || 10)) return end();
  S.lvl = S.daily && S.dlv ? S.dlv : levelOf(S.m);
  S.q = S.daily ? withSeed(S.dseed + S.i * 977, () => MODES[S.m][2](S.lvl - 1)) : wkBias(S.m, MODES[S.m][2](S.lvl - 1), S.lvl - 1);
  S.done = false; S.hint = 0; S.ls = 0;
  draw(); startTimer(); scrollTo(0, 0);
  if (S.st > 2) $('.stage').classList.add('hot');
  const q0 = S.q;
  if (spk()) speakRound();                      // spoken mode reads the question, then plays the sound
  else if (q0.play) setTimeout(() => { if (S && S.q === q0 && !S.done && !TUT_ON) q0.play(); }, 300);
}

const updTop = () => { const e = $('#sc'); if (e) e.textContent = `Level ${S.lvl}`; if (typeof hudUpdate === 'function') hudUpdate(); };

function draw() {
  const q = S.q;
  app.innerHTML =
    `<div class="top"><button id="bk" type="button" aria-label="Menu. This leaves the round.">← Menu</button><span>${S.daily ? '🏆 Daily · ' : S.n === 5 ? '⚡ Quick · ' : ''}Question ${S.i + 1} of ${S.n || 10} · ${q.rev ? '<span class="revtag">🔁 Review</span> · ' : ''}<b id="tt" aria-hidden="true"></b></span><span id="sc"></span></div>` +
    `<div class="bar" aria-hidden="true"><i style="width:${S.i * 100 / (S.n || 10)}%"></i></div><div class="tm" role="timer" aria-label="Time left"><i></i></div>` +
    `<div class="stage"><h2 class="q" id="qh" tabindex="-1"><span class="sr">Question ${S.i + 1} of ${S.n || 10}. ${q.rev ? 'Review of an answer you missed before. ' : ''}</span>${lines(q.q, 'span')}</h2>${q.vis || ''}` +
    `${q.play ? '<button class="play" id="pl">▶ Play again</button>' : ''}${q.key ? `<div class="key">${q.key}</div>` : ''}</div>` +
    `<div class="opts">${q.opts.map((o, i) => `<button data-o="${esc(o)}" data-i="${i}"><kbd aria-hidden="true">${i + 1}</kbd>${o}</button>`).join('')}</div>` +
    `${q.hear ? '<div class="tools stack"><button id="hr">🔊 Hear this note</button></div>' : ''}` +
    `<details class="help"><summary>Need help? Hint and lesson</summary><div class="tools stack"><button id="hn">Hint: remove 2 wrong answers (−5 XP)</button><button id="hw">Review the lesson</button></div></details>` +
    `<div id="fb" role="status" aria-live="polite"></div>${['notes', 'ints', 'chords', 'prog'].includes(S.m) ? pkHtml() + piano() : ''}`;
  updTop();
  $('#bk').onclick = menu;
  if ($('#pl')) $('#pl').onclick = q.play;
  if ($('#hr')) $('#hr').onclick = q.hear;
  $('#hw').onclick = () => tutorial(S.m, 1);
  $('#qh').focus();
  $('#hn').onclick = () => {
    if (S.done || S.hint) return;
    S.hint = 1; S.sc = Math.max(0, S.sc - 5); pm(S.m).xp = Math.max(0, pm(S.m).xp - 5); save();
    const w = $$('.opts button').filter(b => b.dataset.o !== q.ans);
    shuf(w).slice(0, Math.min(2, w.length - 1)).forEach(b => { b.disabled = true; b.classList.add('gone'); });
    say('Two wrong answers removed.'); updTop();
  };
  wirePiano(); wirePk();
  $$('.opts button').forEach(b => { b.onclick = () => answer(b.dataset.o); });
}

function answer(o, timedOut) {
  if (S.done) return;
  S.done = true; clearTimer();
  const fast = Math.round(Math.max(0, TL / TT) * 5), q = S.q, good = o === q.ans, p = pm(S.m);
  p.seen++; wkRec(S.m, q.ans, good); let gain = 0;
  tone(good ? 72 : 50, 0, 0.25, 0.1);
  haptic(good ? 'ok' : 'bad');
  if (good) {
    tone(79 + Math.min(S.st, 5) * 2, 0.12, 0.3, 0.1);      // the second note climbs with each answer in a row
    S.ok++; S.st++; p.right++;
    Object.keys(UNLOCK).filter(k => UNLOCK[k] === S.m && p.right === QUOTA).forEach(k => { setTimeout(() => toast('🔓 Unlocked: ' + MODES[k][0]), 900); say('Unlocked: ' + MODES[k][0]); });
    const pts = 10 + Math.min(S.st - 1, 5) * 2 + (opt('tm', true) === false ? 0 : fast);
    S.sc += pts; p.xp += pts; gain = pts;
  } else {
    S.st = 0; S.re = (S.re || []).concat(wkKey(q.ans));
    S.log.push({ q: q.q, vis: q.vis || '', ans: q.ans, pick: o, why: q.why, timedOut: !!timedOut });
  }
  save();
  $$('.opts button').forEach(b => { b.disabled = true; if (b.dataset.o === q.ans) b.classList.add('ok'); else if (b.dataset.o === o) b.classList.add('bad'); });
  fxAns(good, $('.opts button.ok'), S.st);
  const why = good && !opt('wy', false) ? `<details class="why-d"><summary>Why is that right?</summary>${lines(q.why, 'span')}</details>` : lines(q.why, 'span');
  $('#fb').innerHTML = `<div class="fb ${good ? '' : 'bad'}" tabindex="-1"><b>${good ? '✓ Correct' + (gain ? ` <span class="gain">+${gain} XP</span>` : '') : (timedOut ? '⏱ Time’s up. ' : '✗ Not quite. ') + 'The answer was ' + q.ans}</b>${why}</div><button class="next" id="nx">${S.i >= (S.n || 10) - 1 ? 'See results' : 'Next question'}</button>`;
  $('.fb').focus();
  if (spk()) speak((good ? 'Correct. ' : (timedOut ? 'Time is up. ' : 'Not quite. ') + 'The answer was ' + plain(String(q.ans)) + '. ') + plain(q.why) + ' Press Enter for the next question.');
  $('#nx').onclick = () => { S.i++; ask(); };
  updTop();
}

function end() {
  clearTimer();
  const N = S.n || 10, a = S.ok, r = a / N, st = r >= 0.9 ? 3 : r >= 0.7 ? 2 : r >= 0.5 ? 1 : 0, p = pm(S.m), lv = levelOf(S.m), up = lv > S.lv0;
  p.best = Math.max(p.best || 0, st); if (!S.daily && N === 10) p.rounds = (p.rounds || 0) + 1; else if (N !== 10 && !S.daily) p.qrounds = (p.qrounds || 0) + 1; save(); const bonus = S.daily && typeof dailyDone === 'function' ? dailyDone(a, N) : 0; if (typeof planDone === 'function') planDone('round');
  const nu = (S.lk0 || []).filter(k => !isLocked(k));
  const review = S.log.length
    ? `<section class="review" aria-label="Questions to review"><h2>Review ${S.log.length === 1 ? 'the one you missed' : 'the ' + S.log.length + ' you missed'}</h2><ul>${S.log.map(l =>
        `<li>${l.vis ? `<div class="mv">${l.vis}</div>` : ''}<b>${l.q}</b><br>${l.timedOut ? '<small>Time ran out. </small>' : `<small>You chose ${esc(l.pick)}. </small>`}Answer: <b>${l.ans}</b><br><small>${lines(l.why, 'span')}</small></li>`).join('')}</ul></section>`
    : '<p>A perfect round. Nothing to review.</p>';
  app.innerHTML =
    `<div class="end"><div class="stars" role="img" aria-label="${st} of 3 stars">${[0, 1, 2].map(i => `<span class="${i < st ? 'on' : ''}" style="animation-delay:${0.2 + i * 0.35}s">${i < st ? '★' : '☆'}</span>`).join('')}</div><div class="big" id="bg">0/${N}</div>` +
    `<p class="lines"><span class="ln">${S.sc + bonus} XP earned${bonus ? ` (including ${bonus} bonus for the daily challenge)` : ''}.</span><span class="ln">You are on level ${lv} in ${MODES[S.m][0].toLowerCase()}.</span></p>${up ? `<div class="lvup">Level up! Harder questions unlocked</div>` : ''}` +
    (nu.length ? `<div class="unlock" role="status"><span class="ln">🔓 You unlocked:</span>${nu.map(k => `<span class="ln"><b>${MODES[k][0]}</b></span>`).join('')}</div>` : '') +
    `<div class="btnrow">${nu.map(k => `<button type="button" class="primary" data-open="${k}">Open ${MODES[k][0]}</button>`).join('')}<button id="ag" class="${nu.length ? '' : 'primary'}">Play again</button><button id="mn">All modes</button></div></div>${review}`;
  $('#ag').onclick = () => { if (S.daily) return menu(); const k = S.m; if (N === 5) QN = 5; start(k, 1); }; $('#mn').onclick = menu; $$('[data-open]').forEach(b => { b.onclick = () => start(b.dataset.open); });
  ($$('[data-open]')[0] || $('#ag')).focus();
  countUp($('#bg'), a, '/' + N);
  if (typeof badgeCheck === 'function') setTimeout(badgeCheck, 1400);
  say(`Round complete. ${a} out of ${N} correct, ${st} stars.${nu.length ? ' Unlocked: ' + nu.map(k => MODES[k][0]).join(', ') + '.' : ''}`);
  if (spk()) speak(`Round complete. ${a} out of ${N} correct, ${st} stars.${up ? ' Level up.' : ''}${nu.length ? ' You unlocked ' + nu.map(k => MODES[k][0]).join(' and ') + '.' : ''} ${S.log.length ? 'Review the ' + S.log.length + ' you missed below.' : 'A perfect round.'}`);
  fxEnd(a, st, up || nu.length > 0);
}

/* ---------------------------------------------------------------- shortcuts in a round */
document.addEventListener('keydown', e => {
  if (!S || TUT_ON || e.ctrlKey || e.metaKey || e.altKey) return;
  const f = document.activeElement;
  /* Enter (or N) moves on from anywhere on the screen unless a different control has focus */
  if (S.done && S.q && S.q.opts && $('#nx') && (e.key === 'Enter' || ((e.key === 'n' || e.key === 'N') && !pkOn())) && (!f || f.id === 'nx' || !/^(BUTTON|A|SELECT|INPUT|SUMMARY)$/.test(f.tagName))) { e.preventDefault(); $('#nx').click(); return; }
  if (e.key === 'r' && S.q && S.q.play && !S.done && !pkOn()) S.q.play();
  if ((e.key === 'q' || e.key === 'Q') && S.q && S.q.opts && !S.done && !pkOn()) speakRound(1);
  if ((e.key === 'h' || e.key === 'H') && !S.done && S.q && S.q.opts && !pkOn()) $('#hn').click();
  const n = parseInt(e.key);
  if (!S.done && n >= 1 && n <= 9) { const b = $$('.opts button')[n - 1]; if (b) b.click(); }
});

/* ---------------------------------------------------------------- timer */
let TMR, TL = 0, TT = 20;
const clearTimer = () => clearInterval(TMR);
function startTimer() {
  clearTimer();
  if (opt('tm', true) === false) { $('.tm').style.display = 'none'; return; }
  TT = (['ints', 'chords', 'prog', 'scales', 'meter'].includes(S.m) ? 30 : 20) * (opt('ex', false) ? 2 : 1) + (spk() ? 15 : 0); TL = TT;
  const t0 = Date.now();
  TMR = setInterval(() => {
    const f = $('.tm i');
    if (!f) return clearTimer();
    TL = Math.max(0, TT - (Date.now() - t0) / 1000);
    const r = TL / TT, s = Math.ceil(TL);
    f.style.width = r * 100 + '%';
    $('.tm').className = 'tm' + (r < 0.25 ? ' low' : r < 0.5 ? ' mid' : '');
    $('#tt').textContent = s + 's';
    if (s !== S.ls) { S.ls = s; if (s === 10 || s === 5 || s === 3) say(s + ' seconds left'); }
    if (TL <= 0) { clearTimer(); answer(null, 1); }
  }, 100);
}
