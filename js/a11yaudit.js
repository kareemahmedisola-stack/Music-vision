/* Staffsounds – a small built-in accessibility check. It looks at the screen that is showing and lists what a screen reader
   or keyboard user would trip over: controls with no name, images with no text, repeated ids, skipped heading levels. */
function a11yAudit(root) {
  if (typeof btnEnhance === 'function') btnEnhance();
  root = root || document; const out = [];
  const label = e => (e.getAttribute('aria-label') || '').trim() || (e.getAttribute('aria-labelledby') && [...e.getAttribute('aria-labelledby').split(' ')].map(i => (document.getElementById(i) || {}).textContent || '').join('').trim()) ||
    (e.labels && e.labels.length && [...e.labels].map(l => l.textContent).join('').trim()) || (e.closest && e.closest('label') && e.closest('label').textContent.trim()) || (e.title || '').trim() || (e.tagName === 'INPUT' && /button|submit/.test(e.type) ? e.value : '') || (e.textContent || '').trim();
  root.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button],summary').forEach(e => { if (!label(e)) out.push('a ' + e.tagName.toLowerCase() + (e.id ? ' #' + e.id : '') + ' has no name'); });
  root.querySelectorAll('img').forEach(e => { if (!e.hasAttribute('alt')) out.push('an image has no alt text'); });
  root.querySelectorAll('svg[role=img],[role=img]').forEach(e => { if (!(e.getAttribute('aria-label') || '').trim() && !e.getAttribute('aria-labelledby')) out.push('a picture (role img) has no description'); });
  root.querySelectorAll('canvas:not([aria-hidden=true])').forEach(e => { if (!e.getAttribute('aria-label') && !e.getAttribute('role')) out.push('a canvas is not hidden or described'); });
  const nm = {}; root.querySelectorAll('button,[role=button],summary').forEach(e => { if (e.closest('#hud,.pn,.opts,.tk,.gt,.dr')) return; const n = label(e).replace(/[^A-Za-z0-9 ]/g, '').trim().toLowerCase(); if (n) (nm[n] = nm[n] || []).push(e); });
  Object.keys(nm).forEach(k => { if (nm[k].length > 1) out.push('the button "' + k + '" appears ' + nm[k].length + ' times with the same name'); });
  root.querySelectorAll('button,[role=button],summary').forEach(e => { const n = label(e).replace(/[^A-Za-z0-9 ]/g, '').trim(); if (!e.closest('#hud') && /^(hear|play|next|back|open|remove|lesson|start|more)$/i.test(n)) out.push('the button "' + n + '" is too vague on its own'); });
  const ids = {}; root.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id] || 0) + 1; }); Object.keys(ids).filter(k => ids[k] > 1).forEach(k => out.push('the id "' + k + '" is used ' + ids[k] + ' times'));
  let last = 0; root.querySelectorAll('h1,h2,h3,h4').forEach(h => { const n = +h.tagName[1]; if (!h.textContent.trim()) out.push('an empty ' + h.tagName.toLowerCase() + ' heading'); if (last && n > last + 1) out.push('heading level jumps from h' + last + ' to h' + n + ' ("' + h.textContent.trim().slice(0, 30) + '")'); last = n; });
  root.querySelectorAll('[tabindex]').forEach(e => { if (+e.getAttribute('tabindex') > 0) out.push('a positive tabindex on ' + e.tagName.toLowerCase()); });
  if (!document.documentElement.lang) out.push('the page has no language');
  return out;
}
