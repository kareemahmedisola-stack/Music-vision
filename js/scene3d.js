/* Staffsounds – the menu's 3D scene. No libraries: a small perspective renderer on a 2D canvas, with additive "glow" blending.
   Notes (spheres with trails) flow along a wavy 3D staff, burst into sparks and shock rings as they cross the play line, an
   equaliser ring pulses with every hit, glyphs orbit, dust twinkles, and captions say what Staffsounds is for.
   Click or tap the scene to play a note. It honours Reduce motion (one still frame) and has a Pause button. */

const H3 = { raf: 0, run: false, pause: false, t: 0, yaw: 0, pit: 0, ty: 0, tp: 0, parts: [], rings: [], eq: new Float32Array(40), dust: [], glyphs: [], hits: 0 };
const H3_MEL = [2, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 2, 1, 1, 2, 4, 5, 6, 5, 4, 3, 2, 3, 4, 2, 1, 0];
const H3_CAP = [['Read music', 'notes, keys and note values'], ['Train your ears', 'intervals, chords and progressions'], ['Play', 'piano, guitar, drums and a keyboard duet'], ['Sing', 'find your key, fix pitch, make a choir'], ['Learn your way', 'songs, weak spots, a daily plan, offline']];
const H3_WORD = 'STAFFSOUNDS';
const h3Hue = s => (210 + s * 28) % 360;

function h3Proj(x, y, z, W, Hh) {
  const cy = Math.cos(H3.yaw), sy = Math.sin(H3.yaw), cp = Math.cos(H3.pit), sp2 = Math.sin(H3.pit);
  let X = x * cy - z * sy, Z = x * sy + z * cy, Y = y * cp - Z * sp2; Z = y * sp2 + Z * cp;
  const f = 7.5 / (7.5 + Z + 6), s = Math.min(W, Hh * 1.9) / 15;
  return { x: W / 2 + X * s * f * 1.6, y: Hh * 0.52 - Y * s * f * 1.6, f, z: Z };
}
function h3Init(W, Hh) {
  H3.dust = Array.from({ length: 90 }, () => ({ x: (Math.random() - .5) * 22, y: (Math.random() - .5) * 9, z: Math.random() * 10 - 3, h: Math.random() * 360, p: Math.random() * 6.28, s: 0.1 + Math.random() * 0.3 }));
  H3.glyphs = Array.from({ length: 9 }, (_, i) => ({ g: ['♪', '♫', '♩', '♬', '♯', '♭'][i % 6], a: i / 9 * 6.283, r: 6 + (i % 3) * 0.8, y: -1.5 + (i % 4) * 1.1, h: i * 40, sz: 22 + (i % 3) * 8 }));
  H3.parts = []; H3.rings = []; H3.hits = 0; H3.lastIdx = -1; H3.fired = []; H3.t0 = H3.t; H3.wave = -99;
  H3.let = [...H3_WORD].map((c, i) => ({ c, sx: (Math.random() - .5) * 24, sy: (Math.random() - .3) * 12, sz: Math.random() * 14 - 4, landed: 0 }));
}
function h3Burst(x, y, z, hue, n) { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, b = Math.random() * 3.14 - 1.57, v = 1.2 + Math.random() * 3; H3.parts.push({ x, y, z, vx: Math.cos(a) * Math.cos(b) * v, vy: Math.sin(b) * v + 0.8, vz: Math.sin(a) * Math.cos(b) * v, life: 1, h: hue + Math.random() * 40 - 20 }); } H3.rings.push({ x, y, z, r: 0.2, a: 1, h: hue }); }
function h3Glow(g, p, r, hue, a) { const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, r); gr.addColorStop(0, 'hsla(' + hue + ',100%,80%,' + a + ')'); gr.addColorStop(0.35, 'hsla(' + hue + ',100%,60%,' + a * 0.5 + ')'); gr.addColorStop(1, 'hsla(' + hue + ',100%,50%,0)'); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, r, 0, 6.283); g.fill(); }

function h3Frame(cv, dt) {
  const g = cv.getContext('2d'), dpr = cv.width / cv.clientWidth, W = cv.clientWidth, Hh = cv.clientHeight; g.setTransform(dpr, 0, 0, dpr, 0, 0);
  const t = H3.t; H3.yaw += (H3.ty + 0.3 * Math.sin(t * 0.25) - H3.yaw) * 0.04; H3.pit += (H3.tp + 0.12 + 0.05 * Math.sin(t * 0.31) - H3.pit) * 0.04;
  const bg = g.createRadialGradient(W / 2, Hh * 0.55, 10, W / 2, Hh * 0.55, Math.max(W, Hh) * 0.75); bg.addColorStop(0, '#1b2a55'); bg.addColorStop(0.6, '#0e1730'); bg.addColorStop(1, '#070b18'); g.fillStyle = bg; g.fillRect(0, 0, W, Hh);
  g.globalCompositeOperation = 'lighter';
  const items = [];
  /* dust */
  H3.dust.forEach(d => { d.y += d.s * dt * 0.3; if (d.y > 5) d.y = -5; const p = h3Proj(d.x, d.y, d.z, W, Hh), tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.5 + d.p)); items.push([p.z + 3, () => { g.fillStyle = 'hsla(' + d.h + ',90%,75%,' + (0.5 * tw * p.f) + ')'; g.beginPath(); g.arc(p.x, p.y, 1.2 * p.f * 1.6, 0, 6.283); g.fill(); }]); });
  /* the staff: five wavy ribbons whose colour runs along their length */
  for (let l = 0; l < 5; l++) {
    const y = (l - 2) * 0.8; let prev = null;
    for (let i = 0; i <= 40; i++) { const x = -9 + i * 0.45, z = 0.35 * Math.sin(x * 0.7 + t * 1.2 + l * 0.5), p = h3Proj(x, y, z, W, Hh); if (prev) { const a = prev, b = p, hue = h3Hue(i / 3 + t * 5); items.push([(a.z + b.z) / 2 + 0.2, () => { g.strokeStyle = 'hsla(' + hue + ',100%,68%,0.75)'; g.lineWidth = 2.2 * b.f * 1.5; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }]); } prev = p; }
  }
  /* play line beam */
  const b1 = h3Proj(0, -2.3, 0, W, Hh), b2 = h3Proj(0, 2.3, 0, W, Hh); items.push([0, () => { const gr = g.createLinearGradient(b1.x, b1.y, b2.x, b2.y); gr.addColorStop(0, 'hsla(48,100%,60%,0)'); gr.addColorStop(0.5, 'hsla(48,100%,70%,0.55)'); gr.addColorStop(1, 'hsla(48,100%,60%,0)'); g.strokeStyle = gr; g.lineWidth = 3 + 1.5 * Math.sin(t * 8); g.beginPath(); g.moveTo(b1.x, b1.y); g.lineTo(b2.x, b2.y); g.stroke(); }]);
  /* notes */
  const sp = 1.6, L = H3_MEL.length * 1.15; H3.fired = H3.fired || [];
  H3_MEL.forEach((s, i) => {
    const x = ((((i * 1.15 - t * sp) % L) + L) % L) - 12;
    if (x > 8.8 || x < -9) return; const y = (s - 2) * 0.4, z = 0.35 * Math.sin(x * 0.7 + t * 1.2) + 0.5 * Math.sin(t * 2 + i), hue = h3Hue(s), p = h3Proj(x, y + 0.12 * Math.sin(t * 3 + i), z, W, Hh);
    if (x <= 0 && x > -0.8 && !(t - (H3.fired[i] || -9) < 3)) { H3.fired[i] = t; h3Burst(x, y, z, hue, 16); H3.eq.forEach((v, k) => { H3.eq[k] = Math.min(1, v + Math.max(0, 0.7 - Math.abs(k - (s * 5 + 4)) * 0.06)); }); H3.hits++; }
    const near = Math.max(0, 1 - Math.abs(x) / 2.2);
    for (let k = 1; k <= 5; k++) { const pt = h3Proj(x + k * 0.22, y, z, W, Hh); items.push([pt.z + 0.1, () => { h3Glow(g, pt, 10 * pt.f * 1.6 * (1 - k / 6), hue, 0.35 * (1 - k / 6)); }]); }
    items.push([p.z, () => { h3Glow(g, p, (22 + 22 * near) * p.f * 1.6, hue, 0.8); g.fillStyle = 'hsl(' + hue + ',100%,88%)'; g.beginPath(); g.arc(p.x, p.y, (6 + 3 * near) * p.f * 1.6, 0, 6.283); g.fill(); g.strokeStyle = 'hsla(' + hue + ',100%,80%,0.9)'; g.lineWidth = 2 * p.f * 1.6; const st = h3Proj(x + 0.22, y + 1.1, z, W, Hh); g.beginPath(); g.moveTo(p.x + 5 * p.f * 1.6, p.y); g.lineTo(st.x, st.y); g.stroke(); }]);
  });
  /* the name, in glowing extruded letters that fly in and then ride a wave */
  H3.let.forEach((l, i) => {
    const u = Math.max(0, Math.min(1, (t - H3.t0 - 0.2 - i * 0.14) / 1.5)), e = 1 - Math.pow(1 - u, 3), tx = (i - 5) * 1.12, bob = u >= 1 ? 0.18 * Math.sin(t * 2.2 + i * 0.7) : 0;
    const pulse = Math.exp(-Math.pow(t - H3.wave - i * 0.28, 2) / 0.1), boost = pulse + Math.max(0, H3.eq[Math.min(39, i * 3)]) * 0.6;
    const x = l.sx + (tx - l.sx) * e, y = l.sy + (3.05 - l.sy) * e + bob + boost * 0.25, z = l.sz * (1 - e) + (u >= 1 ? 0.5 * Math.sin(t + i) : 0), hue = (i * 33 + t * 40) % 360;
    if (u >= 1 && !l.landed) { l.landed = 1; h3Burst(tx, 3.05, 0, hue, 12); }
    const p = h3Proj(x, y, z, W, Hh); if (u <= 0) return; const sz = Math.round((34 + 16 * boost) * p.f * 1.7);
    items.push([p.z - 0.5, () => {
      g.save(); g.globalCompositeOperation = 'source-over'; g.font = '900 ' + sz + 'px system-ui,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let d = 6; d >= 1; d--) { const q = h3Proj(x, y, z + d * 0.07, W, Hh); g.fillStyle = 'hsl(' + hue + ',70%,' + (22 + (6 - d) * 2) + '%)'; g.fillText(l.c, q.x, q.y); }
      g.shadowColor = 'hsl(' + hue + ',100%,60%)'; g.shadowBlur = 16 + 18 * boost; g.fillStyle = 'hsl(' + hue + ',100%,' + (74 + 14 * boost) + '%)'; g.fillText(l.c, p.x, p.y); g.restore();
    }]);
  });
  /* equaliser ring */
  for (let k = 0; k < 40; k++) {
    const a = k / 40 * 6.283 + t * 0.3, rx = 6.2 * Math.cos(a), rz = 3.2 + 6.2 * Math.sin(a), v = H3.eq[k] * 2.4 + 0.15 + 0.12 * Math.sin(t * 3 + k), hue = (k * 9 + t * 40) % 360, a1 = h3Proj(rx, -2.6, rz - 3, W, Hh), a2 = h3Proj(rx, -2.6 + v, rz - 3, W, Hh);
    items.push([a1.z, () => { g.strokeStyle = 'hsla(' + hue + ',100%,62%,' + (0.35 + 0.5 * a1.f) + ')'; g.lineWidth = 3.2 * a1.f * 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(a1.x, a1.y); g.lineTo(a2.x, a2.y); g.stroke(); }]);
  }
  H3.eq.forEach((v, k) => { H3.eq[k] = v * Math.pow(0.15, dt); });
  /* orbiting glyphs */
  H3.glyphs.forEach(o => { const a = o.a + t * 0.35, p = h3Proj(Math.cos(a) * o.r, o.y + 0.4 * Math.sin(t + o.a * 3), Math.sin(a) * o.r - 2, W, Hh); items.push([p.z, () => { g.font = Math.round(o.sz * p.f * 1.7) + 'px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'hsl(' + o.h + ',100%,60%)'; g.shadowBlur = 14; g.fillStyle = 'hsla(' + ((o.h + t * 30) % 360) + ',100%,78%,' + (0.35 + 0.5 * p.f) + ')'; g.fillText(o.g, p.x, p.y); g.shadowBlur = 0; }]); });
  /* sparks and rings */
  H3.parts.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.z += q.vz * dt; q.vy -= 3.2 * dt; q.life -= dt * 0.9; const p = h3Proj(q.x, q.y, q.z, W, Hh); if (q.life > 0) items.push([p.z, () => { h3Glow(g, p, 9 * p.f * 1.6 * q.life + 2, q.h, q.life); }]); });
  H3.parts = H3.parts.filter(q => q.life > 0).slice(-260);
  H3.rings.forEach(r => { r.r += dt * 4; r.a -= dt * 1.1; if (r.a <= 0) return; let prev = null; for (let i = 0; i <= 28; i++) { const a = i / 28 * 6.283, p = h3Proj(r.x + Math.cos(a) * r.r * 0.55, r.y + Math.sin(a) * r.r, r.z, W, Hh); if (prev) { const A = prev, B = p; items.push([B.z - 0.3, () => { g.strokeStyle = 'hsla(' + r.h + ',100%,70%,' + (r.a * 0.8) + ')'; g.lineWidth = 2.2 * B.f * 1.6; g.beginPath(); g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.stroke(); }]); } prev = p; } });
  H3.rings = H3.rings.filter(r => r.a > 0);
  items.sort((a, b) => b[0] - a[0]).forEach(i => i[1]());
  /* caption */
  g.globalCompositeOperation = 'source-over';
  const ci = Math.floor(t / 3.4) % H3_CAP.length, ph = (t % 3.4) / 3.4, al = Math.min(1, ph * 6, (1 - ph) * 6);
  g.textAlign = 'center'; g.textBaseline = 'alphabetic'; g.globalAlpha = Math.max(0, al); g.shadowColor = 'hsl(' + h3Hue(ci * 3) + ',100%,60%)'; g.shadowBlur = 18;
  g.fillStyle = '#fff'; g.font = '800 ' + Math.round(Math.min(34, W / 11)) + 'px system-ui,sans-serif'; g.fillText(H3_CAP[ci][0], W / 2, Hh - 38);
  g.shadowBlur = 0; g.fillStyle = '#cfe0ff'; g.font = Math.round(Math.min(15, W / 26)) + 'px system-ui,sans-serif'; g.fillText(H3_CAP[ci][1], W / 2, Hh - 16); g.globalAlpha = 1;
}
function h3Size(cv) { const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight; if (cv.width !== Math.round(w * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); } }
function h3Stop() { H3.run = false; cancelAnimationFrame(H3.raf); }
function heroStart() {
  h3Stop(); const hero = $('.hero'); if (!hero || $('#h3d')) return; const sv = $('.hero svg'); if (sv) sv.style.display = 'none';
  hero.insertAdjacentHTML('afterbegin', '<canvas id="h3d" class="h3d" role="img" aria-label="Animated colourful musical notes flowing along a three dimensional staff, bursting into sparks. Staffsounds helps you read music, train your ears, play, and sing."></canvas>' +
    '<button type="button" id="h3p" class="ghost h3p" aria-pressed="false">Pause animation</button> <button type="button" id="h3i" class="ghost h3p">Hear the intro</button>');
  const cv = $('#h3d'); h3Size(cv); h3Init(); H3.t = Math.random() * 3; H3.pause = false; H3.run = true;
  const still = reduceMotion(); let last = performance.now(), mx = 0;
  const frame = now => {
    if (!H3.run || !document.body.contains(cv)) return h3Stop();
    const dt = Math.min(0.05, (now - last) / 1000); last = now; h3Size(cv); if (!H3.pause && !document.hidden) { H3.t += dt; h3Frame(cv, dt); }
    H3.raf = requestAnimationFrame(frame);
  };
  h3Frame(cv, 0.016);
  if (!still) H3.raf = requestAnimationFrame(frame); else { H3.pause = true; $('#h3p').textContent = 'Play animation'; $('#h3p').setAttribute('aria-pressed', 'true'); }
  cv.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); H3.ty = ((e.clientX - r.left) / r.width - 0.5) * 0.9; H3.tp = ((e.clientY - r.top) / r.height - 0.5) * 0.4; });
  cv.addEventListener('pointerleave', () => { H3.ty = 0; H3.tp = 0; });
  cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(), fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height, sc = [60, 62, 64, 67, 69, 72, 74, 76], m = sc[Math.min(7, Math.floor(fx * 8))]; tone(m, 0, 0.5, 0.3); h3Burst((fx - 0.5) * 12, (0.5 - fy) * 5, 0, h3Hue((m - 60) / 2), 22); H3.eq.forEach((v, k) => { H3.eq[k] = Math.min(1, v + Math.max(0, 0.8 - Math.abs(k - fx * 40) * 0.08)); }); if (H3.pause) h3Frame(cv, 0.016); });
  $('#h3i').onclick = () => {
    const txt = 'Welcome to Staffsounds, produced by Awesome Kam of The Awesomeplanet. Read music. Train your ears. Play. And sing.';
    H3.wave = H3.t; H3.t0 = H3.t - 5; if (H3.pause) h3Frame(cv, 0.016);
    if (!('speechSynthesis' in window)) { say(txt); return; }
    try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.rate = opt('rate', 1); u.onstart = () => { H3.wave = H3.t; }; speechSynthesis.speak(u); } catch (e) { say(txt); }
  };
  $('#h3p').onclick = () => { H3.pause = !H3.pause; $('#h3p').textContent = H3.pause ? 'Play animation' : 'Pause animation'; $('#h3p').setAttribute('aria-pressed', H3.pause); say(H3.pause ? 'Animation paused' : 'Animation playing'); };
}
