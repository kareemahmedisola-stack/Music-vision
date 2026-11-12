/* Staffsounds – visual effects on a full-screen canvas: confetti, rings, rising notes, fireworks.
   Everything is skipped when reduced motion is on (system setting or the in-game switch). */
const cv = document.createElement('canvas');
cv.id = 'fx'; cv.setAttribute('aria-hidden', 'true');
document.body.appendChild(cv);
const cx = cv.getContext('2d');
let PT = [], RG = [], run = 0;
const COLS = ['#f0b43c', '#4fd1a5', '#7aa7ff', '#ff8fb1', '#c9a3ff', '#ffd76a'];
const rnd = (a, b) => a + Math.random() * (b - a);

function size() { if (cv.width !== innerWidth || cv.height !== innerHeight) { cv.width = innerWidth; cv.height = innerHeight; } }
function go() { if (!run) { run = 1; requestAnimationFrame(frame); } }

/* kinds: dot, conf (spinning ribbon), note (♪ ♫), star (sparkle) */
function burst(x, y, c, n, o) {
  if (reduceMotion()) return;
  size(); o = o || {};
  for (let i = 0; i < n; i++) {
    const a = o.up ? -Math.PI / 2 + rnd(-.9, .9) : Math.random() * 6.28, v = rnd(2, o.fast || 8), k = Math.random();
    PT.push({
      x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (o.up ? 2 : 3), g: o.g == null ? .25 : o.g, l: 1, d: rnd(.012, .022),
      c: c || COLS[i % COLS.length], r: rnd(2, 6), rot: rnd(0, 6.28), vr: rnd(-.3, .3),
      k: k < .35 ? 'conf' : k < .55 ? 'note' : k < .7 ? 'star' : 'dot', t: Math.random() < .5 ? '♪' : '♫'
    });
  }
  go();
}
function ripple(x, y, c, r1) {
  if (reduceMotion()) return;
  size(); RG.push({ x, y, r: 6, m: r1 || 90, a: 1, c: c || '#f0b43c' }); go();
}
/* a note glyph that floats upward from a key or pad */
function rise(x, y, t, c) {
  if (reduceMotion()) return;
  size(); PT.push({ x, y, vx: rnd(-.5, .5), vy: -rnd(1.4, 2.2), g: -.01, l: 1, d: .016, c: c || '#f0b43c', r: 7, k: 'text', t }); go();
}
function keyFx(x, y) { ripple(x, y, null, 40); rise(x, y, Math.random() < .5 ? '♪' : '♫'); burst(x, y, null, 5, { up: 1, fast: 5, g: .12 }); }

function frame() {
  cx.clearRect(0, 0, cv.width, cv.height);
  RG = RG.filter(r => r.a > 0.02);
  RG.forEach(r => {
    r.r += (r.m - r.r) * 0.12 + 1; r.a -= 0.035;
    cx.globalAlpha = Math.max(0, r.a); cx.strokeStyle = r.c; cx.lineWidth = 3;
    cx.beginPath(); cx.arc(r.x, r.y, r.r, 0, 6.28); cx.stroke();
  });
  PT = PT.filter(p => p.l > 0);
  PT.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += p.g; p.vx *= .99; p.l -= p.d; p.rot += p.vr || 0;
    cx.globalAlpha = Math.max(0, Math.min(1, p.l * 1.4)); cx.fillStyle = cx.strokeStyle = p.c;
    if (p.k === 'note' || p.k === 'text') { cx.font = (p.r * 4) + 'px sans-serif'; cx.fillText(p.t, p.x, p.y); }
    else if (p.k === 'conf') { cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.fillRect(-p.r, -p.r / 3, p.r * 2, p.r * .66); cx.restore(); }
    else if (p.k === 'star') {
      cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.beginPath();
      for (let i = 0; i < 4; i++) { cx.moveTo(0, 0); cx.lineTo(Math.cos(i * 1.57) * p.r * 1.8, Math.sin(i * 1.57) * p.r * 1.8); }
      cx.lineWidth = 2; cx.stroke(); cx.restore();
    } else { cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, 6.28); cx.fill(); }
  });
  if (PT.length || RG.length) requestAnimationFrame(frame);
  else { run = 0; cx.clearRect(0, 0, cv.width, cv.height); }
}

/* briefly add a CSS class: pads, strings, keys */
function flash(el, cls) {
  if (!el || !el.classList) return;
  el.classList.remove(cls || 'hit'); void el.offsetWidth; el.classList.add(cls || 'hit');
  setTimeout(() => el.classList.remove(cls || 'hit'), 420);
}
/* a short message that slides in, then out */
function toast(msg) {
  if (!msg) return;
  const d = document.createElement('div');
  d.className = 'toast'; d.textContent = msg; d.setAttribute('aria-hidden', 'true');
  document.body.appendChild(d);
  setTimeout(() => d.classList.add('out'), 2200); setTimeout(() => d.remove(), 2700);
}
/* the answer burst, from the button that was right */
function fxAns(good, btn, streak) {
  const s = $('.stage'); if (!s) return;
  if (!reduceMotion()) { s.classList.remove('flash-ok', 'flash-bad'); void s.offsetWidth; s.classList.add(good ? 'flash-ok' : 'flash-bad'); }
  const r = (btn || s).getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
  if (good) {
    burst(x, y, null, 38 + Math.min(streak || 0, 8) * 6); ripple(x, y, '#4fd1a5', 120); ripple(x, y, '#f0b43c', 70);
    if (streak === 3 || streak === 5 || streak === 8 || streak === 10) { toast('🔥 ' + streak + ' in a row'); setTimeout(fireworks, 200); }
  } else if (!reduceMotion()) {
    const o = $('.opts button.bad'); if (o) flash(o, 'shake'); ripple(x, y, '#ff6b6b', 60);
  }
}
function fireworks(n) {
  if (reduceMotion()) return;
  for (let i = 0; i < (n || 3); i++) setTimeout(() => {
    const x = rnd(innerWidth * .2, innerWidth * .8), y = rnd(innerHeight * .15, innerHeight * .45), c = COLS[i % COLS.length];
    ripple(x, y, c, 110); burst(x, y, c, 34, { fast: 9, g: .12 });
  }, i * 260);
}
/* end of a round */
function fxEnd(a, stars, big) {
  if (a < 5) return;
  setTimeout(() => burst(innerWidth / 2, innerHeight / 3, null, stars * 28 + 24, { fast: 10 }), 250);
  if (stars >= 2 || big) setTimeout(() => fireworks(big ? 5 : 3), 600);
}
/* count a number up so the score feels earned */
function countUp(el, n, suffix) {
  if (!el) return;
  if (reduceMotion() || !n) { el.textContent = n + suffix; return; }
  let i = 0; const t = setInterval(() => { i++; el.textContent = i + suffix; if (i >= n) clearInterval(t); }, 70);
}
