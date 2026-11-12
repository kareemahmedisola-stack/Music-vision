/* Staffsounds – SVG drawing: staves, note values, a mini piano for diagrams */

/* Sharps/flats positions for key signatures (diatonic staff index, treble clef) */
const SH = [38, 35, 39, 36, 33, 37, 34], FL = [34, 37, 33, 36, 32, 35, 31];

/* staff({clef:'t'|'b', notes:[n | {s, t, c}], sig, label, caption, x0, dx, w})
   s  = diatonic index (treble bottom line E4 = 30, bass bottom line G2 = 18; +1 per line/space)
   t  = text label under the note, c = colour
   x0 = x of the first note, dx = spacing between notes */
function staff(o) {
  const clef = o.clef || 't', base = clef === 't' ? 30 : 18, bot = 88, w = o.w || 280;
  const y = s => bot - (s - base) * 6;
  const list = (o.notes || []).map(n => (typeof n === 'number' ? { s: n } : n));
  const x0 = o.x0 || 170, dx = o.dx || 0;
  let h = `<svg viewBox="0 0 ${w} 140" class="staff" role="img" aria-label="${esc(o.label || 'Music staff')}">`;
  for (let i = 0; i < 5; i++) h += `<line x1="8" x2="${w - 8}" y1="${bot - i * 12}" y2="${bot - i * 12}"/>`;
  h += `<line x1="8" x2="8" y1="${bot - 48}" y2="${bot}"/><text x="14" y="${bot - 18}" class="cl">${clef === 't' ? 'treble' : 'bass'}</text>`;
  const sg = o.sig || 0;
  for (let i = 0; i < Math.abs(sg); i++)
    h += `<text class="ac" x="${58 + i * 13}" y="${y((sg > 0 ? SH : FL)[i]) + 8}">${sg > 0 ? '♯' : '♭'}</text>`;
  list.forEach((n, k) => {
    const s = n.s, x = x0 + k * dx, cy = y(s), col = n.c || 'currentColor';
    for (let l = base - 2; l >= s; l -= 2) h += `<line x1="${x - 14}" x2="${x + 14}" y1="${y(l)}" y2="${y(l)}"/>`;
    for (let l = base + 10; l <= s; l += 2) h += `<line x1="${x - 14}" x2="${x + 14}" y1="${y(l)}" y2="${y(l)}"/>`;
    const up = s < base + 4;
    h += `<line style="stroke:${col}" x1="${up ? x + 7.5 : x - 7.5}" x2="${up ? x + 7.5 : x - 7.5}" y1="${cy}" y2="${up ? cy - 36 : cy + 36}"/>` +
         `<ellipse cx="${x}" cy="${cy}" rx="8" ry="5.8" transform="rotate(-20 ${x} ${cy})" fill="${col}"/>`;
    if (n.t) h += `<text class="nl" x="${x}" y="124" style="fill:${col}">${n.t}</text>`;
  });
  if (o.caption) h += `<text class="cap" x="${w / 2}" y="137">${o.caption}</text>`;
  return h + '</svg>';
}

/* one note value drawn large: k = 0 whole … 4 sixteenth */
const VALUE_ALT = ['Hollow oval, no stem', 'Hollow oval with a stem', 'Filled oval with a stem', 'Filled oval with a stem and one flag', 'Filled oval with a stem and two flags'];
function value(k, width) {
  let s = `<svg viewBox="0 0 120 130" class="staff" style="max-width:${width || 150}px" role="img" aria-label="${VALUE_ALT[k]}">` +
    `<ellipse cx="48" cy="98" rx="15" ry="10.5" transform="rotate(-20 48 98)" fill="${k < 2 ? 'none' : 'currentColor'}" stroke="currentColor" stroke-width="4"/>`;
  if (k > 0) s += `<path d="M62 95V28"/>`;
  for (let j = 0; j < Math.max(0, k - 2); j++) s += `<path d="M62 ${28 + j * 15}q26 12 14 38"/>`;
  return s + '</svg>';
}

/* A small piano keyboard for lesson diagrams.
   pianoSvg({from:60, n:13, hl:[60,64,67], names:{63:'E♭'}, caption:'text'}) */
const NM1 = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
function pianoSvg(o) {
  const from = o.from || 60, n = o.n || 13, hl = o.hl || [], nm = o.names || {};
  const ww = 28, H = 96, bw = 17, isB = m => [1, 3, 6, 8, 10].includes(m % 12);
  const name = m => nm[m] || NM1[m % 12];
  const whites = [], blacks = [];
  let wi = 0;
  for (let i = 0; i < n; i++) {
    const m = from + i;
    if (isB(m)) blacks.push({ m, x: wi * ww - bw / 2 });
    else { whites.push({ m, x: wi * ww }); wi++; }
  }
  const W = wi * ww;
  let s = `<svg viewBox="0 0 ${W} ${H + 22}" class="pnsvg" role="img" aria-label="${esc(o.label || o.caption || 'Piano keys')}">`;
  whites.forEach(k => {
    const on = hl.includes(k.m);
    s += `<rect x="${k.x + 0.5}" y="1" width="${ww - 1}" height="${H}" rx="3" fill="${on ? '#f0b43c' : '#fff'}" stroke="#0e1726" stroke-width="1.2"/>`;
    if (on) s += `<text class="pk" x="${k.x + ww / 2}" y="${H - 8}">${name(k.m)}</text>`;
  });
  blacks.forEach(k => {
    const on = hl.includes(k.m);
    s += `<rect x="${k.x}" y="1" width="${bw}" height="${H * 0.6}" rx="2" fill="${on ? '#f0b43c' : '#0e1726'}" stroke="#0e1726" stroke-width="1"/>`;
    if (on) s += `<text class="pk" x="${k.x + bw / 2}" y="${H * 0.6 - 7}">${name(k.m)}</text>`;
  });
  if (o.caption) s += `<text class="pc" x="${W / 2}" y="${H + 16}">${o.caption}</text>`;
  return s + '</svg>';
}
