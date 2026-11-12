/* Staffsounds – Setup check: one page that tests sound, microphone, recording, MIDI, offline mode and storage,
   and says plainly what to fix. Also the weekly backup reminder on the menu. */

function setupCheck() {
  tlPage('Setup check', '<p>This page tests what the game needs from your browser. Items marked <b>Fix</b> say what to do.</p><table class="gtab"><tbody id="scb"></tbody></table>' +
    '<div class="tools stack"><button type="button" id="scs">Play a test sound</button><button type="button" id="scm">Test my microphone (3 seconds)</button><button type="button" id="scd">Check for a MIDI keyboard</button><button type="button" id="scp">Ask the browser to keep my data</button><button type="button" id="scr" class="next">Run all checks again</button></div>' +
    '<div class="meter lvl" aria-hidden="true"><i id="scl" style="width:0"></i></div><p id="scn" class="total" role="status" aria-live="polite"></p>');
  const note = t => { $('#scn').textContent = t; say(t); };
  $('#scs').onclick = () => { FORCE = true; [72, 76, 79].forEach((m, i) => tone(m, i * 0.25, 0.3, 0.4)); FORCE = false; note('You should hear three rising notes. If not, raise the computer volume, check the Sound setting on the menu, and check the right speakers or headphones are selected.'); };
  $('#scm').onclick = async () => {
    try { const st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }), a = ctx(), src = a.createMediaStreamSource(st), an = a.createAnalyser(); an.fftSize = 1024; src.connect(an);
      const d = new Uint8Array(1024), t0 = performance.now(); let pk = 0; note('Speak now for three seconds. Microphone: ' + (st.getAudioTracks()[0].label || 'unnamed') + '.');
      await new Promise(ok => { const id = setInterval(() => { an.getByteTimeDomainData(d); let p = 0; d.forEach(v => { p = Math.max(p, Math.abs(v - 128)); }); pk = Math.max(pk, p); $('#scl').style.width = Math.min(100, p / 128 * 140) + '%'; if (performance.now() - t0 > 3000) { clearInterval(id); ok(); } }, 80); });
      src.disconnect(); st.getTracks().forEach(t => t.stop()); $('#scl').style.width = '0';
      note(pk > 6 ? 'The microphone works: it heard you.' : 'The microphone opened but heard almost nothing. Check it is not muted, speak closer, or choose another microphone in Chrome settings.'); scRun();
    } catch (e) { note('The browser would not open the microphone (' + (e && e.name || 'error') + '). Click the lock icon in the address bar, allow the microphone and reload.'); scRun(); }
  };
  $('#scd').onclick = async () => { if (!navigator.requestMIDIAccess) { note('This browser cannot use MIDI. Chrome and Edge can.'); return; } try { const m = await navigator.requestMIDIAccess(); note(m.inputs.size ? 'Found ' + m.inputs.size + ' MIDI ' + (m.inputs.size === 1 ? 'input' : 'inputs') + ': ' + [...m.inputs.values()].map(i => i.name).join(', ') + '.' : 'MIDI works but no keyboard is plugged in. Plug it in and press this button again.'); } catch (e) { note('MIDI access was refused. Allow it in the address bar.'); } };
  $('#scp').onclick = async () => { try { const ok = navigator.storage && navigator.storage.persist ? await navigator.storage.persist() : false; note(ok ? 'Done. The browser will keep your progress and recordings unless you clear them yourself.' : 'The browser did not agree. It may still keep your data, but back it up regularly (Backup and restore).'); } catch (e) { note('Could not ask the browser.'); } scRun(); };
  $('#scr').onclick = scRun; scRun();
}
async function scRun() {
  const rows = [], add = (name, ok, text, fix) => rows.push('<tr><th scope="row">' + esc(name) + '</th><td>' + (ok === 1 ? '✓ Good' : ok === 0 ? '<b>Fix</b>' : '⚠ Check') + '</td><td>' + esc(text) + (fix ? ' <i>' + esc(fix) + '</i>' : '') + '</td></tr>');
  add('Page', window.isSecureContext ? 1 : 0, window.isSecureContext ? 'Secure page (' + location.protocol + '//' + (location.hostname || 'file') + ').' : 'This page is not secure, so the microphone is blocked.', window.isSecureContext ? '' : 'Open it from https://, localhost or the saved file.');
  add('Own tab', window.top === window ? 1 : 0, window.top === window ? 'The game is in its own tab.' : 'The game is inside another page.', window.top === window ? '' : 'Open it in its own browser tab. Previews block the microphone.');
  let st = 'unknown'; try { const a = ctx(); st = a.state; } catch (e) {}
  add('Sound', st === 'running' ? 1 : 2, 'Audio is ' + st + (opt('snd', true) === false ? ', and the Sound setting is off.' : '.'), st === 'running' && opt('snd', true) !== false ? '' : 'Press a key or click the page once, and turn Sound on in Settings.');
  let perm = 'unknown'; try { perm = (await navigator.permissions.query({ name: 'microphone' })).state; } catch (e) {}
  add('Microphone permission', perm === 'granted' ? 1 : perm === 'denied' ? 0 : 2, perm === 'granted' ? 'Allowed.' : perm === 'denied' ? 'Blocked.' : 'Not asked yet, or unknown.', perm === 'granted' ? '' : perm === 'denied' ? 'Click the lock icon in the address bar, allow Microphone, reload.' : 'Press Test my microphone and choose Allow.');
  let n = -1; try { n = (await navigator.mediaDevices.enumerateDevices()).filter(d => d.kind === 'audioinput').length; } catch (e) {}
  add('Microphones found', n > 0 ? 1 : n === 0 ? 0 : 2, n < 0 ? 'Could not list devices.' : n + (n === 1 ? ' microphone.' : ' microphones.'), n === 0 ? 'Plug one in, or turn it on in Windows or Mac privacy settings.' : '');
  const mr = !!window.MediaRecorder; add('Recording', mr ? 1 : 0, mr ? 'Supported (' + (['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t)) || 'default format') + ').' : 'This browser cannot record.', mr ? '' : 'Use a recent Chrome, Edge, Firefox or Safari.');
  add('MIDI keyboard', navigator.requestMIDIAccess ? 1 : 2, navigator.requestMIDIAccess ? 'Supported. Use the check button to look for a keyboard.' : 'Not supported in this browser.', navigator.requestMIDIAccess ? '' : 'Use Chrome or Edge for MIDI.');
  let sw = 'No', cn = 0; try { if (navigator.serviceWorker && navigator.serviceWorker.controller) { sw = 'Yes'; const k = await caches.keys(); const c = k.length ? await (await caches.open(k[k.length - 1])).keys() : []; cn = c.length; } } catch (e) {}
  add('Works offline', sw === 'Yes' && cn > 20 ? 1 : 2, sw === 'Yes' ? 'Saved ' + cn + ' files for offline use.' : 'Offline copy not active yet.', sw === 'Yes' && cn > 20 ? '' : 'Open the game once online, wait a few seconds, then reload. Opening from a file on disk does not save an offline copy.');
  let us = 'unknown', pers = false; try { const e = await navigator.storage.estimate(); us = Math.round((e.usage || 0) / 1048576) + ' MB used of ' + Math.round((e.quota || 0) / 1048576) + ' MB'; pers = navigator.storage.persisted ? await navigator.storage.persisted() : false; } catch (e) {}
  add('Storage', pers ? 1 : 2, us + (pers ? '. Protected from automatic clean-up.' : '. Not protected from automatic clean-up.'), pers ? '' : 'Press Ask the browser to keep my data, and back up regularly. The last backup: ' + (P.bkAt ? new Date(P.bkAt).toLocaleDateString() : 'never') + '.');
  add('Spoken mode', 'speechSynthesis' in window ? 1 : 2, 'speechSynthesis' in window ? 'The browser can read aloud.' : 'This browser has no speech voice.', '');
  const b = $('#scb'); if (!b) return; b.innerHTML = rows.join(''); const bad = rows.filter(r => r.includes('<b>Fix</b>')).length, chk = rows.filter(r => r.includes('⚠')).length;
  $('#scn') && !$('#scn').textContent && ($('#scn').textContent = bad ? bad + ' ' + (bad === 1 ? 'thing needs' : 'things need') + ' fixing.' : chk ? 'Nothing is broken. ' + chk + ' to look at.' : 'Everything looks good.');
}

/* weekly backup reminder on the menu */
function bkReminderHtml() {
  const tot = Object.values(P).reduce((a, b) => a + (b && b.xp || 0), 0), due = !P.bkAt || Date.now() - P.bkAt > 7 * 864e5;
  if (!(tot > 0 || (typeof TAKES !== 'undefined' && TAKES.length)) || !due || (P.bkSnooze || 0) > Date.now()) return '';
  return '<section class="grp" id="bkrm" aria-label="Backup reminder"><h2>Back up your work</h2><p class="pgs" role="status">' + (P.bkAt ? 'Your last backup was ' + Math.floor((Date.now() - P.bkAt) / 864e5) + ' days ago.' : 'You have not made a backup yet.') + ' Progress and recordings live only in this browser, and clearing site data would erase them.</p><div class="tools stack"><button type="button" id="bkrn" class="next">Back up now</button><button type="button" id="bkrl">Remind me in three days</button></div></section>';
}
function bkReminderWire() { if ($('#bkrn')) { $('#bkrn').onclick = backup; $('#bkrl').onclick = () => { P.bkSnooze = Date.now() + 3 * 864e5; save(); $('#bkrm').remove(); say('I will remind you in three days.'); }; } }
