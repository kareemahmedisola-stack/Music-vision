/* Staffsounds – the progress bar pinned to the top of every page: day streak, total XP and (during a round) answers in a row.
   It lives outside #app, so it stays put while screens change. A thin bar under it shows today's practice goal.
   For screen-reader and spoken-mode users it is one button: press it (or Tab to it, it is the first stop after "Skip")
   to hear the same numbers. It never announces by itself, so it does not interrupt a question. */

const hudS = { xp: null, ds: null, row: null };
const hudXp = () => Object.values(P).reduce((a, b) => a + (b && b.xp || 0), 0);

function hudText() {
  const xp = hudXp(), ds = dayStreak(), inRound = !!(S && S.log && !S.live), d = dayLog() || { sec: 0 }, g = goalMin();
  return 'Your progress. ' + ds + (ds === 1 ? ' day streak. ' : ' day streak. ') + xp + ' XP in total. ' +
    (inRound ? S.st + (S.st === 1 ? ' answer' : ' answers') + ' in a row this round. ' : '') +
    'Today: ' + minTxt(d.sec) + ' of a ' + g + ' minute goal.' + (d.met ? ' Goal reached.' : '');
}

function hudUpdate() {
  const b = $('#hudb'); if (!b) return;
  const xp = hudXp(), ds = dayStreak(), inRound = !!(S && S.log && !S.live), d = dayLog() || { sec: 0 }, g = goalMin();
  const set = (sel, v, key) => {
    const e = $(sel); if (!e) return;
    const old = hudS[key];
    if (e.textContent !== String(v)) {
      e.textContent = v;
      if (old != null && v > old) {
        const chip = e.closest('.chip');
        chip.classList.remove('pop'); void chip.offsetWidth; chip.classList.add('pop');
        if (key === 'xp') {                                    // a small "+12" floats up from the XP chip
          const plus = document.createElement('em'); plus.className = 'plus'; plus.textContent = '+' + (v - old);
          chip.appendChild(plus); setTimeout(() => plus.remove(), 1200);
        }
      }
    }
    hudS[key] = v;
  };
  set('#hs', ds, 'ds'); set('#hx', xp, 'xp');
  const r = $('#hrow'); r.hidden = !inRound; if (inRound) set('#hr2', S.st, 'row'); else hudS.row = null;
  $('#hg').style.width = Math.min(100, Math.round(d.sec / (g * 60) * 100)) + '%';
  b.setAttribute('aria-label', hudText() + ' Press to hear this again.');
}

$('#hudb').onclick = () => { const t = hudText(); say(t); if (typeof spk === 'function' && spk()) speak(t); };

/* every time a screen is drawn: refresh the bar, and give the menu its wide layout */
new MutationObserver(() => {
  app.classList.toggle('wide', !!app.querySelector(':scope > .hero'));
  hudUpdate();
}).observe(app, { childList: true });
hudUpdate();
