/* Staffsounds – the lesson player: illustrated steps, "Hear it" demos and an ungraded Try-it step */

/* Run any audio function even if the Sound setting is off (a lesson button is an explicit request for sound). */
const forced = fn => (...a) => { FORCE = true; try { return fn(...a); } finally { FORCE = false; } };

/* One handler for every data-* demo button used in lessons.js */
const DEMO_SEL = '[data-iv],[data-ch],[data-pg],[data-seq],[data-note],[data-scale],[data-tempo],[data-dyn],[data-art],[data-dur],[data-scl],[data-met],[data-iseq],[data-ichord],[data-drum],[data-pat]';
const wireDemos = () => $$(DEMO_SEL).forEach(b => { b.onclick = () => demo(b); });
const demo = forced(el => {
  const d = el.dataset;
  if (d.iv) playInterval(+d.iv);
  else if (d.ch) playChord(d.ch.split(',').map(Number));
  else if (d.pg) playProg(d.pg);
  else if (d.seq) playSeq(d.seq.split(',').map(Number), 0.38, 0.5);
  else if (d.note) tone(+d.note, 0, 1.2, 0.25);
  else if (d.scale) playScale(+d.scale);
  else if (d.tempo) playTempo(+d.tempo);
  else if (d.dyn) playDyn(d.dyn);
  else if (d.art) playArt(d.art);
  else if (d.dur) playDur();
  else if (d.scl) playSteps(d.scl.split(',').map(Number), 60);
  else if (d.met) { const [n, g] = d.met.split(',').map(Number); playMeter(n, g); }
  else if (d.iseq) { const [i, l] = d.iseq.split(':'); instSeq(i, l.split(',').map(Number), 0.5, 1.4); }
  else if (d.ichord) { const [i, l] = d.ichord.split(':'); instStrum(i, l.split(',').map(Number)); }
  else if (d.drum) drum(d.drum);
  else if (d.pat) playPat(d.pat, 2, 100);
});

/* Leave a lesson that was opened from inside a round and carry on with the round */
function resumeRound() {
  TUT_ON = false;
  if (S && S.q) { if (S.done) S.i++; ask(); } else menu();
}

function tutorial(m, again) {
  clearTimer(); TUT_ON = true;
  const L = LESSONS[m], gen = MODES[m][2];
  const AID = LESSON_AIDS[m] || {}, ki = AID.keys || [];
  const recap = ki.length ? [{ h: 'Recap: what to remember', recap: true, p: L.steps.map((s, k) => ki[k] ? `<b>${s.h}.</b> ${ki[k]}` : '').filter(Boolean) }] : [];
  const steps = L.steps.concat(recap, gen ? [{ practice: true }, ROUND_STEP] : []);   // playgrounds have no round
  const nameOf = k => steps[k].practice ? 'Try it yourself' : steps[k].h;
  let i = 0;

  const finish = () => { P.tut = P.tut || {}; P.tut[m] = 1; save(); if (again) resumeRound(); else { TUT_ON = false; if (m === 'start') menu(); else start(m, 1); } };
  const leave = () => { if (again) resumeRound(); else { TUT_ON = false; menu(); } };

  function show() {
    const t = steps[i], last = i === steps.length - 1;
    const title = t.practice ? 'Try it yourself' : t.h;
    const body = t.practice
      ? `<div class="lead">${lines('Here is a practice question. Nothing is scored and there is no timer. Take your time and listen or look closely.')}</div><div id="try"></div>`
      : t.p.map(x => lines(x)).join('') + (typeof t.vis === 'string' ? t.vis : '');
    const goal = i === 0 && AID.goal ? `<div class="goal"><b>By the end of this lesson you can ${AID.goal}.</b><details><summary>See the steps</summary><ol>${L.steps.map(s => `<li>${s.h}</li>`).join('')}</ol></details></div>` : '';
    const idea = !t.practice && !t.recap && ki[i] ? `<div class="keyidea"><b>Key idea</b>${lines(ki[i], 'span')}</div>` : '';
    app.innerHTML =
      `<article class="lesson" aria-labelledby="qh">` +
      `<div class="ltop"><button type="button" id="lx">← ${again ? 'Back to the game' : 'Menu'}</button><span aria-hidden="true">Step ${i + 1} of ${steps.length}</span></div>` +
      `<div class="dots" role="progressbar" aria-label="Lesson progress" aria-valuemin="1" aria-valuemax="${steps.length}" aria-valuenow="${i + 1}">${steps.map((_, k) => `<i class="${k < i ? 'on' : k === i ? 'now' : ''}"></i>`).join('')}</div>` +
      `<p class="kicker">${esc(L.title)}</p><h2 id="qh" tabindex="-1">${title}</h2>${goal}${body}${idea}` +
      `<div class="tools stack">${t.hear ? `<button type="button" class="mini" id="td" ${t.hear[0]}>🔊 ${t.hear[1]}</button>` : ''}` +
      `<button type="button" id="tn" class="next">${last ? (again ? 'Back to the game' : m === 'start' ? 'Go to the menu' : gen ? 'Start the questions' : 'Open the ' + L.title.toLowerCase()) : 'Next: ' + esc(nameOf(i + 1)) + ' →'}</button>` +
      `<div class="navrow"><button type="button" id="tb">${i ? '← Previous: ' + esc(nameOf(i - 1)) : again ? '← Back to the game' : '← Back to the menu'}</button>` +
      `${last ? '' : '<button type="button" id="ts">Skip lesson</button>'}</div></div></article>`;
    $('#qh').focus(); scrollTo(0, 0);
    wireDemos();
    $('#lx').onclick = leave;
    $('#tb').onclick = i ? () => { i--; show(); } : leave;
    $('#tn').onclick = () => { if (last) finish(); else { i++; show(); } };
    if (!last) $('#ts').onclick = finish;
    if (t.practice) renderTry(m);
    const pre = goal ? 'By the end of this lesson you can ' + AID.goal + '. ' : '', post = idea ? 'Key idea. ' + ki[i] : '';
    if (spk()) speakStep(t, title, i + 1, steps.length, pre, post); else say(`Step ${i + 1} of ${steps.length}. ${title}`);
    tutorial.again = () => speakStep(t, title, i + 1, steps.length, pre, post);
  }
  show();
  tutorial.nav = d => {                                   // arrow-key navigation, wired in main.js
    const n = i + d;
    if (n < 0 || n >= steps.length) return;
    i = n; show();
  };
}

/* The ungraded practice question at the end of each lesson */
function renderTry(m) {
  const box = $('#try'), q = MODES[m][2](0);
  let answered = false;
  box.innerHTML =
    `<div class="stage compact"><p class="q">${lines(q.q, 'span')}</p>${q.vis || ''}` +
    `${q.play ? '<button type="button" class="play" id="tp">▶ Play</button>' : ''}${q.hear ? '<button type="button" class="play" id="th">🔊 Hear this note</button>' : ''}` +
    `${q.key ? `<div class="key">${q.key}</div>` : ''}</div>` +
    `<div class="opts">${q.opts.map(o => `<button type="button" data-o="${esc(o)}">${o}</button>`).join('')}</div>` +
    `<div id="tfb" role="status" aria-live="polite"></div><div class="tools stack"><button type="button" id="again">Try another</button></div>`;
  if (q.play) { $('#tp').onclick = forced(q.play); if (!spk()) setTimeout(forced(q.play), 300); }
  if (q.hear) $('#th').onclick = forced(q.hear);
  $('#again').onclick = () => renderTry(m);
  if (spk()) speakQ(q.play ? Object.assign({}, q, { play: forced(q.play) }) : q, 'Practice question.');
  $$('.opts button', box).forEach(b => {
    b.onclick = () => {
      if (answered) return;
      answered = true;
      const good = b.dataset.o === q.ans;
      $$('.opts button', box).forEach(x => { x.disabled = true; if (x.dataset.o === q.ans) x.classList.add('ok'); else if (x === b) x.classList.add('bad'); });
      $('#tfb').innerHTML = `<div class="fb ${good ? '' : 'bad'}"><b>${good ? '✓ Correct' : '✗ Not quite. The answer was ' + q.ans}</b>${lines(q.why, 'span')}</div>`;
      if (good) { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, null, 24); ripple(r.left + r.width / 2, r.top + r.height / 2, '#4fd1a5', 90); }
    };
  });
}
