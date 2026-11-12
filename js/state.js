/* Staffsounds – shared helpers, saved progress and session state */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);
/* n answer options: the right answer plus (n-1) random wrong ones, shuffled */
const take = (pool, ans, n) => shuf([ans, ...shuf(pool.filter(x => x !== ans)).slice(0, n - 1)]);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* progress is stored per mode: { xp, right, seen, best }. P.set = settings, P.tut = finished lessons */
let P = {};
try { P = JSON.parse(localStorage.getItem('staffwise') || '{}'); } catch (e) { P = {}; }
const save = () => { try { localStorage.setItem('staffwise', JSON.stringify(P)); } catch (e) {} };
const pm = m => (P[m] = P[m] || { xp: 0, right: 0, seen: 0 });
const levelOf = m => 1 + Math.floor(pm(m).right / 10);
const opt = (k, d) => { const v = (P.set || {})[k]; return v === undefined ? d : v; };
const reduceMotion = () => opt('rm', false) || matchMedia('(prefers-reduced-motion:reduce)').matches;

/* polite screen-reader announcement (clears first so repeats are read) */
function say(msg) { const r = $('#sr'); r.textContent = ''; setTimeout(() => { r.textContent = msg; }, 40); }

let S = null;          // current round / playground session, null on the menu
let TUT_ON = false;    // true while a lesson is on screen (suspends game shortcuts)

/* Put each sentence on its own line so text is easy to follow. Only splits where no tag is open, so bold text and
   key hints stay in one piece. tag 'p' = a block of paragraphs, 'span' = lines inside a heading or small box. */
function lines(h, tag) {
  const parts = String(h == null ? '' : h).split(/(<[^>]+>)/), out = [];
  let cur = '', depth = 0;
  const flush = () => { if (cur.trim()) out.push(cur.trim()); cur = ''; };
  parts.forEach((tk0, idx) => {
    let tk = tk0;
    if (tk[0] === '<') {
      cur += tk;
      const m = tk.match(/^<(\/?)([a-z0-9]+)/i);
      if (m && !/^(br|img|input|hr)$/i.test(m[2]) && !/\/>$/.test(tk)) depth += m[1] ? -1 : 1;
      return;
    }
    if (depth === 0 && /[.!?]["”’)]*(<\/[a-z0-9]+>)*$/.test(cur) && /^\s+[A-Z“"(]/.test(tk)) { flush(); tk = tk.replace(/^\s+/, ''); }   // a bold lead-in ends one line, the next sentence starts another
    const re = /([.!?]["”’)]*)\s+/g; let last = 0, m;
    while ((m = re.exec(tk))) {
      const endAt = m.index + m[1].length, after = m.index + m[0].length, before = tk.slice(0, m.index);
      const nextCh = tk[after], nextTag = after === tk.length && parts[idx + 1] && /^<[a-z]/i.test(parts[idx + 1]);
      const ok = depth === 0 && (nextCh ? /[A-Z“"(]/.test(nextCh) : nextTag) && !(m[1] === '.' && /(^|\s)\d$/.test(before)) && !/(e\.g|i\.e|vs|Dr|St)$/.test(before);
      if (ok) { cur += tk.slice(last, endAt); flush(); last = after; }
    }
    cur += tk.slice(last);
  });
  flush();
  return tag === 'span' ? out.map(x => `<span class="ln">${x}</span>`).join('') : `<div class="pg">${out.map(x => `<p class="ln">${x}</p>`).join('')}</div>`;
}
