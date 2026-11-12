/* Staffsounds – live notation: a grand staff that draws the notes and chords you play, as you play them.
   Shown under the piano playground and the duet. Accidentals are written beside every note (no key signature). */

const LS = { ev: [] };
const LSL = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const LS_SH = [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1], [6, 0]];   // pitch class -> [letter, accidental] with sharps
const LS_FL = [[0, 0], [1, -1], [1, 0], [2, -1], [2, 0], [3, 0], [4, -1], [4, 0], [5, -1], [5, 0], [6, -1], [6, 0]]; // ... with flats
const lsAcc = a => a > 0 ? '♯' : a < 0 ? '♭' : '';

function lsSpell(m, flat) {
  const t = (flat ? LS_FL : LS_SH)[((m % 12) + 12) % 12], oct = Math.floor((m - t[1]) / 12) - 1;
  return { m, l: t[0], acc: t[1], oct, dp: oct * 7 + t[0] };           // dp: diatonic position, C4 = 28
}
const lsName = n => LSL[n.l] + lsAcc(n.acc) + n.oct;

function lsAdd(notes, label, flat) {
  if (!$('#lsv')) return;
  const f = flat == null ? PREF === 'flat' : flat, now = performance.now(), last = LS.ev[LS.ev.length - 1], sp = notes.map(m => lsSpell(m, f));
  if (last && !label && !last.label && now - last.t < 90) { last.n = last.n.concat(sp); last.t = now; }   // keys pressed together share a column
  else LS.ev.push({ t: now, n: sp, label });
  if (LS.ev.length > 9) LS.ev.shift();
  lsDraw();
}

function lsDraw() {
  const v = $('#lsv'); if (!v) return;
  let g = '';
  [30, 40, 50, 60, 70, 90, 100, 110, 120, 130].forEach(y => { g += `<line x1="14" x2="350" y1="${y}" y2="${y}"/>`; });
  g += '<line x1="14" x2="14" y1="30" y2="130"/><text class="lt" x="18" y="25">treble</text><text class="lt" x="18" y="86">bass</text>';
  LS.ev.forEach((e, i) => {
    const x = 56 + i * 33, ns = [...e.n].sort((a, b) => a.dp - b.dp);
    if (e.label) g += `<text class="lb" x="${x}" y="14" text-anchor="middle">${esc(e.label)}</text>`;
    let prev = null, shifted = false, ai = 0;
    const ys = ns.map(n => 80 - (n.dp - 28) * 5);
    ns.forEach((n, k) => {
      const y = ys[k]; shifted = prev !== null && n.dp - prev === 1 && !shifted; prev = n.dp;
      const cx = x + (shifted ? 11 : 0);
      if (y < 30) for (let ly = 20; ly >= y - 1; ly -= 10) g += `<line class="ld" x1="${cx - 11}" x2="${cx + 11}" y1="${ly}" y2="${ly}"/>`;
      else if (y > 130) for (let ly = 140; ly <= y + 1; ly += 10) g += `<line class="ld" x1="${cx - 11}" x2="${cx + 11}" y1="${ly}" y2="${ly}"/>`;
      else if (y === 80) g += `<line class="ld" x1="${cx - 11}" x2="${cx + 11}" y1="80" y2="80"/>`;
      g += `<ellipse cx="${cx}" cy="${y}" rx="6.6" ry="4.7" transform="rotate(-18 ${cx} ${y})"/>`;
      if (n.acc) g += `<text class="ac" x="${cx - 15 - (ai++ % 2) * 9}" y="${y + 4}" text-anchor="middle">${lsAcc(n.acc)}</text>`;
    });
  });
  v.innerHTML = g;
  const last = LS.ev[LS.ev.length - 1];
  v.setAttribute('aria-label', last ? 'Staff. Latest: ' + (last.label ? last.label + ', ' : '') + last.n.map(n => sp(lsName(n))).join(', ') : 'Staff. Play notes and they appear here.');
}

function lsHtml() {
  return '<section class="lsec" aria-label="Live notation"><h3>Live notation</h3><svg id="lsv" class="lsv" viewBox="0 0 360 160" role="img" aria-label="Staff. Play notes and they appear here."></svg>' +
    '<div class="tools"><button type="button" id="lsc">Clear the staff</button></div>' +
    '<p class="total">The last nine notes or chords you play appear on a grand staff: treble above, bass below, middle C on the line between. Every accidental is written beside its note.</p></section>';
}
function lsWire() { LS.ev = []; const b = $('#lsc'); if (b) b.onclick = () => { LS.ev = []; lsDraw(); say('Staff cleared'); }; lsDraw(); }
