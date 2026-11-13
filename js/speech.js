/* Staffsounds – spoken mode: reads menus, questions, answers, lessons and instrument notes aloud.
   Uses the browser's built-in speech (Web Speech API): nothing to download, works offline on most devices. */

let SID = 0;                       // newest utterance; older callbacks are ignored
const spk = () => opt('sp', false) === true && 'speechSynthesis' in window;

/* the chosen voice, and a speed for each kind of screen: questions (rounds), lessons, and everything else */
const VOICES = () => { try { return speechSynthesis.getVoices() || []; } catch (e) { return []; } };
function pickVoice() { const n = opt('voice', ''); return n ? VOICES().find(v => v.name === n) || null : null; }
function rateNow() {
  const base = opt('rate', 1);
  if (S && S.q && !S.live) return opt('rateq', base);        // in a round
  if (typeof TUT_ON !== 'undefined' && TUT_ON) return opt('ratel', base);       // in a lesson
  return base;
}
function speak(t, cb, queue) {
  if (!spk() || !t) return;
  try {
    if (!queue) speechSynthesis.cancel();
    const id = ++SID, u = new SpeechSynthesisUtterance(String(t).replace(/♯/g, ' sharp').replace(/♭/g, ' flat').replace(/♮/g, ' natural').replace(/\s+/g, ' '));
    u.rate = rateNow(); const vo = pickVoice(); if (vo) u.voice = vo;
    if (cb) u.onend = () => { if (id === SID) cb(); };
    speechSynthesis.speak(u);
  } catch (e) {}
}
const speakStop = () => { try { speechSynthesis.cancel(); } catch (e) {} SID++; };

/* turn a piece of lesson HTML into something that reads well aloud */
function plain(h) {
  const d = document.createElement('div');
  d.innerHTML = h || '';
  d.querySelectorAll('button,.btns').forEach(b => b.remove());
  d.querySelectorAll('[role=img][aria-label]').forEach(e => e.replaceWith(document.createTextNode('. ' + e.getAttribute('aria-label') + '. ')));
  d.querySelectorAll('tr').forEach(r => r.appendChild(document.createTextNode('. ')));
  d.querySelectorAll('td,th').forEach(c => c.appendChild(document.createTextNode(', ')));
  return d.textContent.replace(/\s+/g, ' ').trim();
}

/* read a question: stem, then (for ear questions) the sound, then the options */
function speakQ(q, head, again) {
  if (!spk() || !q || !q.opts) return;
  const vt = plain(q.vis || ''), stem = head + ' ' + q.q + ' ' + (vt ? vt + '. ' : '') + (q.key ? q.key + '. ' : '');
  const ops = 'Options. ' + q.opts.map((o, i) => (i + 1) + ', ' + plain(String(o))).join('. ') + '. Press a number to answer. Q repeats the question' + (q.play ? '. R replays the sound' : '') + '.';
  if (q.play && !again) speak(stem + 'Listen.', () => { q.play(); setTimeout(() => speak(ops), 4500); });
  else speak(stem + (q.hear && !again ? '' : '') + ops);
}
const speakRound = again => speakQ(S && S.q, 'Question ' + (S ? S.i + 1 : 1) + ' of ' + (S && S.n || 10) + '.' + (S && S.q && S.q.rev ? ' A review of something you missed before.' : ''), again);

function speakStep(t, title, n, total, pre, post) {
  const body = t.practice ? 'Here is a practice question. Nothing is scored.' : (t.p || []).map(plain).join(' ') + ' ' + plain(typeof t.vis === 'string' ? t.vis : '');
  speak('Step ' + n + ' of ' + total + '. ' + title + '. ' + (pre || '') + body + ' ' + (post || '') + ' Press the right arrow for the next step, the left arrow to go back, or Q to hear this again.');
}

/* say what the instruments report in the #nn status line */
new MutationObserver(ms => {
  if (!spk()) return;
  for (const m of ms) {
    const n = m.target.nodeType === 3 ? m.target.parentNode : m.target, e = n && n.closest && n.closest('#nn');
    if (e) { const s = e.querySelector('.sr'), t = (s ? s.textContent : e.textContent).trim(); if (t && t !== 'Press a key') speak(t); return; }
  }
}).observe(app, { childList: true, characterData: true, subtree: true });
/* screen-reader announcements (timer warnings, hints, round results) are spoken after the current sentence */
new MutationObserver(() => {
  const t = $('#sr').textContent;
  if (t && !/^(Step \d|Question \d)/.test(t)) speak(t, 0, 1);
}).observe($('#sr'), { childList: true, characterData: true, subtree: true });
