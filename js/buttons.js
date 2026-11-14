/* Staffsounds – clear, helpful buttons everywhere.
   Runs after every screen is drawn (and whenever a control is added) and makes sure that
   - every button has a name that says what it does, in context: a lone "▶ Hear" becomes "Hear: Major and minor chords (2 of 3)";
   - icon-only buttons get a name, and every short or symbol button gets a tooltip for people using a mouse or a long press;
   - piano keys show their note names (switch off in Settings), including the black keys;
   - in Spoken mode, tabbing onto any button reads its name;
   - phones give a light tick when a button is pressed. */

const BTN_SEL = 'button,[role=button],summary';
const BTN_DICT = { bk: 'Menu', tb: 'Previous', ts: 'Skip lesson', gb: 'Back', gb2: 'Back to where I was', nx: 'Next question', pl: 'Play again', hr: 'Hear this note', hn: 'Hint', hw: 'Review the lesson' };
const BTN_GENERIC = /^(hear|play|listen|lesson|next|back|start|open|remove|delete|save|stop|clear|reset|download|record|more|use|add|edit|undo|redo|play again|hear this|try)$/i;
const btnStrip = t => (t || '').replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF▶■●▲▼◀←→↑↓✓✗★☆⏱]/gu, '').replace(/\s+/g, ' ').trim();
function btnVisible(e) { const c = e.cloneNode(true); c.querySelectorAll('[aria-hidden=true],.sr,kbd').forEach(x => x.remove()); return (c.textContent || '').replace(/\s+/g, ' ').trim(); }

/* what is this button about? the mode on a menu card, the box it sits in, or the heading of the screen */
function btnContext(e) {
  const row = e.closest('.row'); if (row) { const b = row.querySelector('.go b'); if (b) return btnStrip(b.textContent); }
  let c = e.closest('li,section,article,details,figure,.prac,.mv');
  for (let k = 0; k < 3 && c; k++) {
    const h = c.querySelector(':scope > h2,:scope > h3,:scope > summary,:scope > b'), t = btnStrip(c.getAttribute('aria-label') || (h && h.textContent) || '');
    if (t && t.length <= 70) return t.slice(0, 60);
    c = c.parentElement && c.parentElement.closest('li,section,article,details');
  }
  const q = document.getElementById('qh'); if (q) { const t = btnStrip(q.textContent); if (t) return t.slice(0, 60); }
  return '';
}

/* piano keys: a visible note name, also on black keys, and a tooltip */
function btnPiano(e) {
  const a = e.getAttribute('aria-label') || '', m = a.match(/^(?:Written )?([A-G])( sharp)?/);
  if (m && !e.hasAttribute('data-n') || (m && e.getAttribute('data-n') !== m[1] + (m[2] ? '♯' : ''))) e.setAttribute('data-n', m[1] + (m[2] ? '♯' : ''));
  if (a && e.title !== a) e.title = a;
}

function btnEnhance(root) {
  root = root || document.getElementById('app'); if (!root) return;
  document.documentElement.classList.toggle('nokn', opt('kn', true) === false);
  const list = []; if (root.matches && root.matches(BTN_SEL)) list.push(root); if (root.querySelectorAll) list.push(...root.querySelectorAll(BTN_SEL));
  const groups = {};
  list.forEach(e => {
    if (e.closest('#hud')) return;
    if (e.tagName === 'BUTTON' && !e.getAttribute('type')) e.setAttribute('type', 'button');
    if (e.matches('.pn button')) { btnPiano(e); return; }
    const aria = (e.getAttribute('aria-label') || '').trim(), vis = btnVisible(e), sym = btnStrip(vis);
    if (!aria && !sym) { const n = BTN_DICT[e.id] || btnContext(e); if (n) e.setAttribute('aria-label', n); }            // icon only
    else if (!aria && BTN_GENERIC.test(sym)) (groups[sym.toLowerCase()] = groups[sym.toLowerCase()] || []).push([e, sym]);   // too vague on its own
    const name = (e.getAttribute('aria-label') || '').trim() || sym;
    if (!e.title && name && (name !== sym || sym.length <= 4 || e.matches('.tk,.gt button,.dr button,.mini'))) e.title = name;
  });
  /* a vague name is made specific: "Hear" becomes "Hear: <what this part of the page is about>", numbered if it repeats */
  Object.values(groups).forEach(g => g.forEach(([e, sym], i) => {
    const ctx = btnContext(e), n = (g.length > 1 ? ' (' + (i + 1) + ' of ' + g.length + ')' : '');
    if (ctx || n) { const l = sym + (ctx ? ': ' + ctx : '') + n; e.setAttribute('aria-label', l); e.title = l; }
  }));
}

/* run after every change to the page */
let BTN_Q = 0;
new MutationObserver(ms => {
  if (!ms.some(m => [...m.addedNodes].some(n => n.nodeType === 1)) && !ms.some(m => m.type === 'attributes')) return;
  cancelAnimationFrame(BTN_Q); BTN_Q = requestAnimationFrame(() => btnEnhance());
}).observe(document.getElementById('app'), { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-label'] });

/* Spoken mode: tabbing onto a button reads its name (not on piano keys, drum pads or menu cards, which announce themselves) */
let BTN_KB = 0;
addEventListener('keydown', e => { if (e.key === 'Tab' || e.key.indexOf('Arrow') === 0) BTN_KB = Date.now(); }, true);
document.addEventListener('focusin', e => {
  const t = e.target; if (!t.matches || !spk() || Date.now() - BTN_KB > 600) return;
  if (!t.matches('button,summary,[role=button]') || t.matches('.pn button,.tk,.gt button,.dr button,.row .go,#hudb')) return;
  const n = (t.getAttribute('aria-label') || btnVisible(t)).trim(); if (n) speak(n);
});
/* phones: a light tick when a button is pressed */
document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch' && e.target.closest && e.target.closest('button,summary') && !e.target.closest('.pn,.tk,.gt,.dr')) haptic('tick'); }, true);
