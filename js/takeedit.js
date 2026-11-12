/* Staffsounds – take editing and mixing: trim, fade, volume and normalise a recording, and mix several takes into one.
   Everything runs in the browser on the saved WAV takes. */

let TE_SRC = null;
const teMono = b => { const n = b.length, o = new Float32Array(n), c = b.numberOfChannels; for (let k = 0; k < c; k++) { const d = b.getChannelData(k); for (let i = 0; i < n; i++) o[i] += d[i] / c; } return o; };
async function teBuf(t) { if (!t._buf) t._buf = await ctx().decodeAudioData(await t.blob.arrayBuffer()); return t._buf; }
function teWav(data, sr) { const b = ctx().createBuffer(1, data.length, sr); b.copyToChannel(data, 0); return toWav(b); }
const teStop = () => { try { if (TE_SRC) TE_SRC.stop(); } catch (e) {} TE_SRC = null; };

/* apply the edit settings to a decoded take: returns a Float32Array */
function teRender(buf, o) {
  const sr = buf.sampleRate, m = teMono(buf), a = Math.max(0, Math.floor(o.s * sr)), z = Math.min(m.length, Math.floor(o.e * sr));
  const out = m.slice(a, Math.max(a + 1, z)), n = out.length;
  let g = o.vol;
  if (o.norm) { let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(out[i])); if (pk > 0) g *= 0.95 / pk; }
  const fi = Math.min(n, Math.floor(o.fin * sr)), fo = Math.min(n, Math.floor(o.fout * sr));
  for (let i = 0; i < n; i++) {
    let v = out[i] * g;
    if (i < fi) v *= i / fi;
    if (i >= n - fo) v *= (n - 1 - i) / fo;
    out[i] = Math.max(-1, Math.min(1, v));
  }
  return out;
}
function teDraw(cv, buf, s, e) {
  const x = cv.getContext('2d'), w = cv.width, h = cv.height, d = teMono(buf), step = Math.max(1, Math.floor(d.length / w));
  const css = getComputedStyle(document.documentElement);
  x.clearRect(0, 0, w, h);
  for (let i = 0; i < w; i++) {
    let pk = 0; for (let j = i * step; j < (i + 1) * step && j < d.length; j++) pk = Math.max(pk, Math.abs(d[j]));
    const t = i / w * buf.duration, inside = t >= s && t <= e;
    x.fillStyle = inside ? '#f0b43c' : '#8a97ad'; x.globalAlpha = inside ? 1 : .45;
    const hh = Math.max(1, pk * h * .95); x.fillRect(i, (h - hh) / 2, 1, hh);
  }
  x.globalAlpha = 1;
}

async function teOpen(id, li) {
  const t = TAKES.find(x => x.id === id), box = $('#ed' + id); if (!t || !box) return;
  if (!box.hidden) { box.hidden = true; teStop(); return; }
  box.hidden = false; box.textContent = 'Loading…';
  let buf; try { buf = await teBuf(t); } catch (e) { box.textContent = 'This recording could not be opened for editing.'; return; }
  const D = Math.round(buf.duration * 100) / 100;
  const sl = (k, t2, mn, mx, st, v, u) => `<label>${t2} <input type="range" data-e="${k}" min="${mn}" max="${mx}" step="${st}" value="${v}" style="width:130px"> <output data-o="${k}">${v}</output>${u}</label>`;
  box.innerHTML = '<canvas width="300" height="60" aria-hidden="true"></canvas><div class="set" role="group" aria-label="Edit ' + esc(t.name) + '">' +
    sl('s', 'Start', 0, D, 0.01, 0, ' s') + sl('e', 'End', 0, D, 0.01, D, ' s') + sl('fin', 'Fade in', 0, 2, 0.05, 0, ' s') + sl('fout', 'Fade out', 0, 2, 0.05, 0, ' s') + sl('vol', 'Volume', 0, 200, 5, 100, ' %') +
    '<label><input type="checkbox" data-e="norm">Normalise (make it as loud as possible without clipping)</label></div>' +
    '<div class="tools"><button type="button" data-a="play">Play the edit</button><button type="button" data-a="stop">Stop</button><button type="button" data-a="new">Save as a new take</button><button type="button" data-a="rep">Replace this take</button><button type="button" data-a="close">Close</button></div>';
  const cv = $('canvas', box), val = () => {
    const g = k => $('[data-e="' + k + '"]', box);
    return { s: +g('s').value, e: +g('e').value, fin: +g('fin').value, fout: +g('fout').value, vol: +g('vol').value / 100, norm: g('norm').checked };
  };
  const redraw = () => teDraw(cv, buf, val().s, val().e); redraw();
  $$('[data-e]', box).forEach(inp => inp.oninput = () => {
    const o = val(), out = $('[data-o="' + inp.dataset.e + '"]', box);
    if (inp.dataset.e === 's' && o.s > o.e - 0.05) { inp.value = Math.max(0, o.e - 0.05); }
    if (inp.dataset.e === 'e' && o.e < o.s + 0.05) { inp.value = Math.min(D, o.s + 0.05); }
    if (out) out.textContent = inp.value; redraw();
  });
  const make = () => { const o = val(); return teRender(buf, o); };
  box.onclick = e => {
    const a = e.target.dataset && e.target.dataset.a; if (!a) return;
    if (a === 'close') { box.hidden = true; teStop(); }
    else if (a === 'stop') teStop();
    else if (a === 'play') {
      teStop(); const d = make(), ab = ctx().createBuffer(1, d.length, buf.sampleRate), s = ctx().createBufferSource();
      ab.copyToChannel(d, 0); s.buffer = ab; s.connect(ctx().destination); s.start(); TE_SRC = s; s.onended = () => { if (TE_SRC === s) TE_SRC = null; };
    } else if (a === 'new' || a === 'rep') {
      teStop(); const d = make(), wav = teWav(d, buf.sampleRate), ms = d.length / buf.sampleRate * 1000;
      if (a === 'new') { const n = recAdd(wav, 'audio/wav', ms, 'edit of ' + t.name, t.name + ' edited'); say('Saved ' + n.name); }
      else { if (t.url) URL.revokeObjectURL(t.url); t.url = null; t._buf = null; t.blob = wav; t.mime = 'audio/wav'; t.ms = ms; t.src = t.src.replace(/ · edited$/, '') + ' · edited'; recPut(t); recList(); recBacking(); say('Replaced ' + t.name); }
    }
  };
}

/* mix the ticked takes (each at its own level) into one new take */
async function teMix() {
  const out = $('#mixs'), ids = $$('[data-mx]:checked').map(c => +c.dataset.mx);
  if (ids.length < 2) { if (out) out.textContent = 'Tick two or more takes first (Include in mix).'; return; }
  if (out) out.textContent = 'Mixing…';
  try {
    const parts = [];
    for (const id of ids) { const t = TAKES.find(x => x.id === id), lv = +($('[data-lv="' + id + '"]') || { value: 100 }).value / 100; parts.push({ t, lv, b: await teBuf(t) }); }
    const sr = parts[0].b.sampleRate, n = Math.max(...parts.map(p => p.b.length)), mix = new Float32Array(n);
    parts.forEach(p => { const d = teMono(p.b); if (p.b.sampleRate !== sr) return; for (let i = 0; i < d.length; i++) mix[i] += d[i] * p.lv; });
    let pk = 0; for (let i = 0; i < n; i++) pk = Math.max(pk, Math.abs(mix[i]));
    if (pk > 0.98) for (let i = 0; i < n; i++) mix[i] *= 0.98 / pk;          // keep the sum from clipping
    const k = TAKES.filter(x => /^Mix \d+$/.test(x.name)).length + 1, t = recAdd(teWav(mix, sr), 'audio/wav', n / sr * 1000, 'mix of ' + parts.map(p => p.t.name).join(' + '), 'Mix ' + k);
    const o2 = $('#mixs'); if (o2) o2.textContent = 'Made ' + t.name + ' from ' + parts.length + ' takes.'; say('Made ' + t.name);
  } catch (e) { const o2 = $('#mixs'); if (o2) o2.textContent = 'Could not mix these takes.'; }
}
function teWire(ul) {
  $$('[data-re]', ul).forEach(b => { b.onclick = () => teOpen(+b.dataset.re); });
  const m = $('#mixgo', ul); if (m) m.onclick = teMix;
}
