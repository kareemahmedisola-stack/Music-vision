/* Staffsounds – start-up */

/* arrow keys move through a lesson (they are not used elsewhere on a lesson screen) */
document.addEventListener('keydown', e => {
  if (!TUT_ON || e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = document.activeElement && document.activeElement.tagName;
  if (tg === 'INPUT' || tg === 'SELECT') return;
  if (e.key === 'ArrowRight') { e.preventDefault(); tutorial.nav(1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); tutorial.nav(-1); }
  if ((e.key === 'q' || e.key === 'Q') && tutorial.again) tutorial.again();
});

/* shortcuts: D on the menu opens the Keyboard duet; Escape leaves any playground */
document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const tg = document.activeElement && document.activeElement.tagName;
  if (tg === 'SELECT' || tg === 'TEXTAREA' || (tg === 'INPUT' && document.activeElement.type !== 'checkbox')) return;
  if (!S && !TUT_ON && $('.hero') && (e.key === 'd' || e.key === 'D')) { e.preventDefault(); start('duet'); }
  else if (e.key === '?' && !TUT_ON && (!S || S.live) && !$('.guide')) { e.preventDefault(); guide(); }
  else if ((S && S.live || $('.guide')) && !TUT_ON && e.key === 'Escape') { e.preventDefault(); menu(); }
  else if (S && S.live && !TUT_ON && (e.key === 'PageDown' || e.key === 'PageUp')) {      // cycle through the playgrounds
    const ks = GROUPS.find(g => g[0] === 'Play')[1].filter(k => !isLocked(k)), at = ks.indexOf(PGK);
    if (ks.length > 1) { e.preventDefault(); const k = ks[(at + (e.key === 'PageDown' ? 1 : ks.length - 1)) % ks.length]; start(k, 1); say(MODES[k][0]); }
  }
});

let OFFREADY = false;
addEventListener('blur', allOff);   // never leave notes hanging when the window loses focus

applySet();
freezeCheck();
/* a brand-new player lands on the welcome tutorial; everyone else on the menu */
if (!Object.values(P).some(x => x && x.xp) && !Object.keys(P.tut || {}).length) tutorial('start'); else menu();

/* offline support (only on http/https, not file://) */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
  navigator.serviceWorker.ready.then(() => { OFFREADY = true; offlineStatus(); }).catch(() => {});
}
/* tell the player whether the game is saved for offline use, and when the connection drops or returns */
function offlineStatus() {
  const e = $('#offl'); if (!e) return;
  e.textContent = (navigator.onLine ? '' : 'You are offline. ') + (OFFREADY ? 'Saved on this device: the whole game works without a connection, and your progress and recordings stay on this device.' : location.protocol === 'file:' ? 'Opened from a file: everything is already on your computer, so it works offline.' : 'Open this page once while online, and it will then work offline.');
}
addEventListener('online', () => { offlineStatus(); say('Back online'); });
addEventListener('offline', () => { offlineStatus(); say('You are offline. The game still works.'); });
