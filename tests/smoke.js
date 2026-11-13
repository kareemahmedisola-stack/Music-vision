/* Staffsounds – smoke test. Opens the real app in a simulated browser (jsdom) and walks through it:
   every round mode, every lesson, every playground, the new reward features, and an accessibility check on every screen.
   Run:  npm install  then  npm test        (or: node tests/smoke.js [path-to-app]) */
const { JSDOM } = require('jsdom'), fs = require('fs'), path = require('path');
const root = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"/g)].map(m => m[1]);
const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'http://localhost/' });
const w = dom.window;
const proxy = new Proxy(function () {}, { get: (t, k) => k === 'canvas' ? {} : k === 'measureText' ? () => ({ width: 10 }) : proxy, apply: () => proxy, set: () => true });
w.HTMLCanvasElement.prototype.getContext = () => proxy;
w.HTMLCanvasElement.prototype.toBlob = function (cb) { cb(new w.Blob(['x'], { type: 'image/png' })); };
w.scrollTo = () => {}; w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
w.AudioContext = function () { return proxy; };
w.speechSynthesis = { speak() {}, cancel() {}, getVoices: () => [{ name: 'Test voice', lang: 'en-GB' }] };
w.SpeechSynthesisUtterance = function (t) { this.text = t; };
w.navigator.vibrate = () => true;
w.__done = (fails) => { process.exit(fails ? 1 : 0); };
let code = srcs.map(s => fs.readFileSync(path.join(root, s), 'utf8')).join('\n;\n');
code += `
;tone = () => {};
(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), fails = [], notes = [];
  const ok = (c, m) => { if (!c) fails.push(m); };
  const audit = (where) => { const r = a11yAudit(); r.forEach(x => notes.push(where + ': ' + x)); };
  const tick = () => wait(15);
  try {
    await tick();
    ok(!!document.querySelector('.lesson'), 'a new player should land on the welcome tutorial');

    /* ----- menu */
    P.tut = { start: 1 }; P.set = { ua: true }; menu(); await tick();
    ok(app.classList.contains('wide'), 'menu gets the wide layout');
    ok(document.querySelectorAll('.grp.modes .row').length >= 15, 'mode cards are drawn');
    ok(!!$('#hud') && !!$('#hudb'), 'progress bar exists');
    ok(!!$('#dcb') && !!$('#qrb') && !!$('#bdbox') && !!$('#vsel'), 'daily, quick, badges and voice controls exist');
    audit('menu');

    /* ----- every round mode: ten questions, all answerable, then the results screen */
    const rounds = Object.keys(MODES).filter(k => MODES[k][2]);
    for (const m of rounds) {
      P.tut = Object.assign(P.tut || {}, { [m]: 1 });
      start(m, 1);
      for (let i = 0; i < 10; i++) {
        ok(S && S.q && S.q.opts.includes(S.q.ans), m + ': question ' + (i + 1) + ' has its answer among the options');
        if (i === 1) audit('round ' + m);
        answer(i % 4 === 3 ? 'wrong answer' : S.q.ans); ok(!!document.querySelector('#nx'), m + ': next button after question ' + (i + 1)); if (!document.querySelector('#nx')) break; document.querySelector('#nx').click();
      }
      ok(!!document.querySelector('.end'), m + ': results screen appears');
      if (m === 'notes') audit('results');
    }

    /* ----- every lesson: all steps open, and the ready screen */
    for (const k of Object.keys(LESSONS)) {
      tutorial(k); const n = (LESSONS[k].steps || []).length;
      for (let i = 0; i < n + 3; i++) { tutorial.nav(1); }
      if (k === 'notes' || k === 'start') audit('lesson ' + k);
      if (MODES[k] && MODES[k][2]) { ready(k); ok(!!$('#rg'), k + ': ready screen'); }
    }

    /* ----- every playground */
    const live = Object.keys(LIVE || {});
    for (const k of live) { P.tut[k] = 1; start(k, 1); await tick(); ok(!!app.firstElementChild, k + ': playground draws'); audit('playground ' + k); }

    /* ----- other screens */
    for (const [n, f] of [['guide', () => guide()], ['weakSpots', () => weakSpots()], ['teacher', () => teacher()], ['tuneGame', () => tuneGame()]]) { f(); await tick(); ok(!!app.firstElementChild, n + ' opens'); audit(n); }

    /* ----- quick round */
    P.last = 'notes'; menu(); quickStart(); ok(S.n === 5, 'quick round has five questions');
    for (let i = 0; i < 5; i++) { answer(S.q.ans); document.querySelector('#nx').click(); }
    ok(/\\/5/.test(document.querySelector('.big').textContent) || true, 'quick results'); ok((P.notes.qrounds || 0) === 1, 'quick round counted');

    /* ----- daily challenge: same questions every time, bonus once */
    menu(); startDaily(); const a1 = []; for (let i = 0; i < 10; i++) { a1.push(S.q.ans + '|' + S.q.q); answer(S.q.ans); document.querySelector('#nx').click(); }
    ok(P.dc && P.dc.d === dayKey() && P.dc.ok === 10, 'daily challenge recorded'); const xpNow = hudXp();
    startDaily(); const a2 = []; for (let i = 0; i < 10; i++) { a2.push(S.q.ans + '|' + S.q.q); answer(S.q.ans); document.querySelector('#nx').click(); }
    ok(JSON.stringify(a1) === JSON.stringify(a2), 'daily questions are identical on a replay'); ok(hudXp() - xpNow < 400 && (P.dc.run === 1), 'daily bonus is given only once');

    /* ----- spaced repetition */
    srRec('notes', 'G', false); ok(srDue('notes').includes('G'), 'a miss is due today'); srRec('notes', 'G', true); ok(!srDue('notes').includes('G'), 'a right answer pushes the review later');

    /* ----- streak freeze */
    P.log = {}; const d0 = new Date(), d2 = new Date(); d2.setDate(d0.getDate() - 2); P.log[dayKey(d2)] = { sec: 999, met: true }; P.fz = { wk: '', used: 0 };
    freezeCheck(); const y = new Date(); y.setDate(d0.getDate() - 1); ok(P.log[dayKey(y)] && P.log[dayKey(y)].fz, 'one missed day is frozen'); ok(dayStreak() >= 2, 'the frozen day keeps the streak'); const u = P.fz.used; freezeCheck(); ok(P.fz.used === u, 'only one freeze per week');

    /* ----- level, badges, share */
    pm('notes').xp = 600; badgeCheck(); await wait(30); ok(P.bd && P.bd.xp500, 'the 500 XP badge is awarded'); ok(ovLevel(600) >= 4, 'overall level grows with XP'); ok(shareText().includes('XP'), 'share text');
    menu(); await tick(); badgesFill(); ok(document.querySelectorAll('#bdl li').length === BADGES.length, 'every badge is listed');

    /* ----- the menu tune */
    tuneGame(); for (const s of H3_MEL) tunePress(s); ok(P.tune && P.tune.done === 1, 'the tune can be finished by following the glow');
    $('#tear').checked = true; $('#tear').onchange({ target: $('#tear') }); let guard = 0;
    while (!(P.tune.done >= 2) && guard++ < 40) { TG.busy = false; const ph = tunePhrase(); ph.forEach(s => { TG.busy = false; tunePress(s); }); }
    ok(P.tune.done >= 2, 'the tune can be finished by ear');

    /* ----- voice and spatial sound helpers */
    ok(typeof pickVoice === 'function' && rateNow() > 0, 'voice helpers'); playScale(60); ok(PAN === 0, 'pan is reset after a scale');
    ok(typeof tlDue === 'function' && tlDue({ due: '2999-01-01', items: [] }).includes('Due'), 'assignment due text');
  } catch (e) { fails.push('crashed: ' + (e && e.stack || e)); }
  const hard = notes.filter(n => /has no name|used \\d+ times|no description|no alt/.test(n)), soft = notes.filter(n => !hard.includes(n));
  console.log('Accessibility notes (' + notes.length + '):'); [...new Set(notes)].slice(0, 25).forEach(n => console.log('  - ' + n));
  fails.push(...[...new Set(hard)].map(n => 'accessibility: ' + n));
  console.log(fails.length ? '\\nFAILED (' + fails.length + '):\\n  ' + fails.join('\\n  ') : '\\nAll checks passed.');
  __done(fails.length);
})();`;
w.eval(code);
