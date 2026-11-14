/* Staffwise service worker: makes the game work with no connection.
   - On install every file is saved on the device (one by one, so a single missing file cannot stop the rest).
   - Network-first: when you are online you always get the newest files, and each one is re-saved (the Google font too, when it loads).
   - Offline: the saved copy is used, so the whole game, your progress and your recordings still work.
   Bump VERSION whenever you change any file. */
const VERSION = 'staffwise-v26';
const ASSETS = [
  './', 'index.html', 'manifest.webmanifest',
  'css/base.css', 'css/game.css', 'css/lessons.css', 'css/instruments.css', 'css/ux.css',
  'js/state.js', 'js/audio.js', 'js/fx.js', 'js/notation.js', 'js/questions.js',
  'js/lessons.js', 'js/lessons-read.js', 'js/lessons-theory.js', 'js/lessons-ear.js', 'js/lessons-play.js', 'js/lessonaids.js', 'js/piano.js', 'js/tutorial.js', 'js/screens.js', 'js/instruments.js',
  'js/livestaff.js', 'js/midi.js', 'js/takeedit.js', 'js/recorder.js', 'js/duet.js', 'js/duetplay.js', 'js/fixer.js', 'js/voice.js', 'js/songs.js', 'js/voice2.js', 'js/review.js', 'js/plan.js', 'js/tools.js', 'js/setup.js', 'js/scene3d.js', 'js/why.js', 'js/practice.js', 'js/guide.js', 'js/hud.js', 'js/buttons.js', 'js/engage.js', 'js/tunegame.js', 'js/a11yaudit.js',
  'js/speech.js', 'js/main.js',
  'icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(ASSETS.map(a => c.add(new Request(a, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || !/^https?:/.test(r.url)) return;
  e.respondWith(
    fetch(r, { cache: 'no-cache' }).then(res => {
      const u = new URL(r.url);
      if (res && ((res.ok && u.origin === location.origin) || (/(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname) && (res.ok || res.type === 'opaque')))) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(r, copy)).catch(() => {}); }
      return res;
    }).catch(() =>
      caches.match(r, { ignoreSearch: true }).then(hit => hit || (r.mode === 'navigate' ? caches.match('index.html') : new Response('', { status: 503, statusText: 'Offline' })))
    )
  );
});
