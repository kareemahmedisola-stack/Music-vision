/* Staffsounds – Play the menu tune yourself. Seven big keys, one for each height on the 3D staff.
   Follow the glow (and the spoken or written name of the next note), or switch the glow off and play each four-note phrase by ear.
   Keys: A S D F G H J (or 1 to 7). Space hears the next note or phrase. Escape returns to the menu. */

const TUNE_NAMES = ['C', 'D', 'E', 'G', 'A', 'high C', 'high D'], TUNE_KEYS = ['a', 's', 'd', 'f', 'g', 'h', 'j'];
let TG = null;

function tuneGame() {
  clearTimer(); stopDr(); allOff(); recStop(); TUT_ON = false; scrollTo(0, 0);
  S = { tune: true }; TG = { i: 0, miss: 0, ear: false, busy: false, tm: [], pi: 0 };
  app.innerHTML =
    '<div class="top"><button id="bk" type="button">← Menu</button><span>🎶 Play the menu tune</span><span id="tpr" aria-hidden="true"></span></div>' +
    '<div class="stage"><h2 class="q" id="qh" tabindex="-1">Play the tune from the menu. Seven keys, from low to high.</h2><div class="key" id="tnext" role="status" aria-live="polite"></div></div>' +
    '<div class="tunepad" role="group" aria-label="Tune keys, low to high">' + TUNE_NAMES.map((n, s) => `<button type="button" class="tk" data-s="${s}" style="--h:${h3Hue(s)}"><b>${n}</b><kbd aria-hidden="true">${TUNE_KEYS[s].toUpperCase()}</kbd><span class="sr"> key ${s + 1} of 7</span></button>`).join('') + '</div>' +
    '<div class="set" role="group" aria-label="Tune options"><label><input type="checkbox" id="tear"> Play by ear: no glow, four notes at a time</label>' +
    '<button type="button" id="thear" class="ghost">🔊 Hear the next note (Space)</button><button type="button" id="trst" class="ghost">Start again</button></div>' +
    '<p class="total" id="tsum"></p>';
  $('#bk').onclick = menu; $('#qh').focus();
  $$('.tk').forEach(b => { b.onclick = () => tunePress(+b.dataset.s); });
  $('#tear').onchange = e => { TG.ear = e.target.checked; tuneReset(); };
  $('#thear').onclick = tuneHear; $('#trst').onclick = tuneReset;
  tuneReset(true);
}
function tuneTone(s) { PAN = spatial() ? (s - 3) * 0.25 : 0; FORCE = true; try { tone(H3_PITCH[s], 0, 0.6, 0.2); } finally { FORCE = false; PAN = 0; } }
function tunePhrase() { return H3_MEL.slice(TG.pi * 4, TG.pi * 4 + 4); }
function tuneShow(msg) {
  const L = H3_MEL.length, n = $('#tnext'); if (!n) return;
  $$('.tk').forEach(b => b.classList.remove('next'));
  let t;
  if (TG.ear) t = msg || ('Phrase ' + (TG.pi + 1) + ' of ' + Math.ceil(L / 4) + '. Listen, then play the four notes.');
  else { const s = H3_MEL[TG.i]; t = msg || ('Next: ' + TUNE_NAMES[s] + ' (key ' + (s + 1) + ' of 7, ' + TUNE_KEYS[s].toUpperCase() + ')'); const b = $(`.tk[data-s="${s}"]`); if (b) b.classList.add('next'); }
  n.textContent = t; $('#tpr').textContent = TG.ear ? (TG.pi + 1) + '/' + Math.ceil(L / 4) : (TG.i + 1) + '/' + L; say(t);
}
function tuneReset(first) {
  TG.tm.forEach(clearTimeout); TG.tm = []; TG.i = 0; TG.pi = 0; TG.pj = 0; TG.miss = 0; TG.busy = false; $('#tsum').textContent = '';
  $('#thear').textContent = TG.ear ? '🔊 Hear the phrase again (Space)' : '🔊 Hear the next note (Space)';
  if (TG.ear) { tuneShow(); tuneHearPhrase(); } else tuneShow();
}
function tuneHearPhrase() {
  TG.tm.forEach(clearTimeout); TG.tm = []; TG.busy = true; TG.pj = 0;
  tunePhrase().forEach((s, k) => TG.tm.push(setTimeout(() => { tuneTone(s); if (k === 3) TG.tm.push(setTimeout(() => { TG.busy = false; }, 500)); }, 350 + k * 520)));
}
function tuneHear() { if (!TG) return; if (TG.ear) tuneHearPhrase(); else tuneTone(H3_MEL[TG.i]); }
function tunePress(s) {
  if (!TG || TG.busy) return; tuneTone(s);
  const b = $(`.tk[data-s="${s}"]`); if (b) { b.classList.add('hit'); setTimeout(() => b.classList.remove('hit'), 180); }
  if (TG.ear) {
    const want = tunePhrase()[TG.pj];
    if (s !== want) { TG.miss++; haptic('bad'); TG.pj = 0; tuneShow('Not quite. Listen again.'); setTimeout(tuneHearPhrase, 700); return; }
    haptic('ok'); TG.pj++; TG.i++;
    if (TG.pj >= tunePhrase().length) { TG.pi++; TG.pj = 0; if (TG.i >= H3_MEL.length) return tuneDone(); tuneShow('Good! Phrase ' + (TG.pi + 1) + ' of ' + Math.ceil(H3_MEL.length / 4) + '. Listen.'); setTimeout(tuneHearPhrase, 900); }
    else $('#tpr').textContent = (TG.pi + 1) + '/' + Math.ceil(H3_MEL.length / 4);
    return;
  }
  if (s !== H3_MEL[TG.i]) { TG.miss++; haptic('bad'); tuneShow('Not that one. ' + 'Next: ' + TUNE_NAMES[H3_MEL[TG.i]] + ' (key ' + (H3_MEL[TG.i] + 1) + ')'); return; }
  haptic('tick'); TG.i++; if (TG.i >= H3_MEL.length) return tuneDone(); tuneShow();
}
function tuneDone() {
  const p = pm('tune'), k = TG.ear ? 'ed' : 'gd', first = p[k] !== dayKey(), xp = first ? (TG.ear ? 30 : 15) : 0;
  p.done = (p.done || 0) + 1; p[k] = dayKey(); p.xp += xp; save();
  const t = '🎉 You played the whole tune' + (TG.ear ? ' by ear' : '') + (TG.miss ? ' with ' + TG.miss + (TG.miss === 1 ? ' slip' : ' slips') : ' without a slip') + '.' + (xp ? ' +' + xp + ' XP.' : ' Come back tomorrow for more XP, or try the other mode.');
  $$('.tk').forEach(b => b.classList.remove('next')); $('#tnext').textContent = t; $('#tsum').textContent = t; say(t);
  cue('daily'); haptic('rew'); if (typeof keyFx === 'function') try { keyFx(innerWidth / 2, innerHeight / 3); } catch (e) {}
  setTimeout(badgeCheck, 1200); if (typeof hudUpdate === 'function') hudUpdate();
}
document.addEventListener('keydown', e => {
  if (!S || !S.tune || e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = document.activeElement && document.activeElement.tagName; if (tg === 'SELECT' || (tg === 'INPUT' && document.activeElement.type !== 'checkbox')) return;
  const k = e.key.toLowerCase(), i = TUNE_KEYS.indexOf(k) >= 0 ? TUNE_KEYS.indexOf(k) : (/^[1-7]$/.test(k) ? +k - 1 : -1);
  if (i >= 0) { e.preventDefault(); e.stopImmediatePropagation(); if (!e.repeat) tunePress(i); }
  else if (k === ' ' && tg !== 'BUTTON') { e.preventDefault(); e.stopImmediatePropagation(); tuneHear(); }
  else if (k === 'escape') { e.preventDefault(); e.stopImmediatePropagation(); menu(); }
}, true);
