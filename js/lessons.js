/* Staffsounds – lesson content.
   LESSONS[mode] = { title, steps: [ { h, p:[html…], vis, hear:[attrs, label] } ] }
   - vis  : HTML string shown under the text (diagrams are built with staff(), pianoSvg(), value())
   - hear : the big "Hear it" button. attrs is a data- attribute understood by tutorial.js (see demo()).
   A "Try it" practice step and a "How a round works" step are appended automatically. */

/* ---------- small builders ---------- */
const paper = h => `<div class="paper">${h}</div>`;
const pair = (...h) => `<div class="pair">${h.map(paper).join('')}</div>`;
const tip = h => `<div class="tip">${h}</div>`;
const mnem = w => `<p class="mnem" aria-label="${w.join(' ')}">${w.map(x => `<span><b>${x[0]}</b>${x.slice(1)}</span>`).join(' ')}</p>`;
const play = (attr, txt) => `<button type="button" class="mini" ${attr}>▶ ${txt}</button>`;
const btns = (...b) => `<div class="btns">${b.join('')}</div>`;
const tbl = (head, rows) => `<table class="tbl"><thead><tr>${head.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`).join('')}</tr>`).join('')}</tbody></table>`;
const LCOL = '#a86c00', SCOL = '#0b6a8a';    // line notes / space notes colours on the paper panel
const nt = (s, t, c) => ({ s, t, c });
const FLATN = { 63: 'E♭', 66: 'G♭', 68: 'A♭', 70: 'B♭' };
const letters = (arr, ss, col) => arr.map((t, i) => nt(ss[i], t, col));
const cap = t => `<p class="cap">${t}</p>`;

/* circle of fifths diagram */
function circleOfFifths() {
  const keys = [['C', '0'], ['G', '1♯'], ['D', '2♯'], ['A', '3♯'], ['E', '4♯'], ['B', '5♯'], ['F♯', '6♯'], ['D♭', '5♭'], ['A♭', '4♭'], ['E♭', '3♭'], ['B♭', '2♭'], ['F', '1♭']];
  let s = '<svg viewBox="0 0 240 240" class="cof" role="img" aria-label="Circle of fifths. From C at the top, clockwise: G one sharp, D two, A three, E four, B five, F sharp six. Counterclockwise: F one flat, B flat two, E flat three, A flat four, D flat five.">';
  s += '<circle cx="120" cy="120" r="54" fill="none" stroke-dasharray="3 4" opacity=".4"/>';
  keys.forEach((k, i) => {
    const a = (-90 + i * 30) * Math.PI / 180, x = 120 + 88 * Math.cos(a), y = 120 + 88 * Math.sin(a);
    const fill = i === 0 ? '#eaf1fb' : i < 7 ? '#f0b43c' : '#8fc3ff';
    s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="22" fill="${fill}"/><text class="k" x="${x.toFixed(1)}" y="${(y + 1).toFixed(1)}">${k[0]}</text><text class="n" x="${x.toFixed(1)}" y="${(y + 12).toFixed(1)}">${k[1]}</text>`;
  });
  s += '<text class="c" x="120" y="112">clockwise:</text><text class="c" x="120" y="126">+1 sharp</text><text class="c" x="120" y="144">anticlockwise:</text><text class="c" x="120" y="158">+1 flat</text>';
  return s + '</svg>';
}

/* the 16-column beat grid for note values */
function beatGrid() {
  const row = (name, n) => `<div class="brow"><span>${name}</span><div class="bgrid">${('<i style="grid-column:span ' + (16 / n) + '"></i>').repeat(n)}</div></div>`;
  return `<div class="beats" role="img" aria-label="One bar of 4/4. A whole note fills it. Two half notes, four quarter notes, eight eighth notes or sixteen sixteenth notes fill the same space.">` +
    `<div class="brow"><span></span><div class="bgrid head">${[1, 2, 3, 4].map(n => `<i style="grid-column:span 4">beat ${n}</i>`).join('')}</div></div>` +
    row('Whole', 1) + row('Half', 2) + row('Quarter', 4) + row('Eighth', 8) + row('Sixteenth', 16) + '</div>';
}

/* ---- instrument diagrams ---- */
const GNAMES = ['low E', 'A', 'D', 'G', 'B', 'high E'];
function chordBox(name, fr) {
  const desc = fr.map((f, i) => GNAMES[i] + (f < 0 ? ' muted' : f === 0 ? ' open' : ' fret ' + f)).join(', ');
  let s = `<svg viewBox="0 0 120 150" class="staff" style="max-width:130px" role="img" aria-label="${name} chord diagram. ${desc}.">`;
  for (let i = 0; i < 6; i++) s += `<line x1="${20 + i * 16}" x2="${20 + i * 16}" y1="30" y2="130"/>`;
  for (let j = 0; j < 6; j++) s += `<line x1="20" x2="100" y1="${30 + j * 20}" y2="${30 + j * 20}" ${j ? '' : 'style="stroke-width:5"'}/>`;
  fr.forEach((f, i) => {
    const x = 20 + i * 16;
    if (f > 0) s += `<circle cx="${x}" cy="${30 + (f - .5) * 20}" r="6" fill="currentColor"/>`;
    else s += `<text x="${x}" y="22" text-anchor="middle" style="font-size:12px;fill:currentColor">${f < 0 ? '×' : '○'}</text>`;
  });
  return s + `<text x="60" y="146" text-anchor="middle" style="font-size:12px;font-weight:700;fill:currentColor">${name}</text></svg>`;
}
function valveSvg(p, label) {
  const names = ['open', 'valve 1', 'valve 2', 'valve 3'];
  const down = p.map((x, i) => x ? i + 1 : 0).filter(Boolean);
  return `<svg viewBox="0 0 120 100" class="staff" style="max-width:110px;display:inline-block" role="img" aria-label="Trumpet valves, ${down.length ? 'pressed: ' + down.join(' and ') : 'none pressed'}. ${label}">` +
    [0, 1, 2].map(i => `<circle cx="${25 + i * 35}" cy="${p[i] ? 52 : 36}" r="13" fill="${p[i] ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="3"/><text x="${25 + i * 35}" y="${(p[i] ? 52 : 36) + 5}" text-anchor="middle" style="font-size:14px;font-weight:700;fill:${p[i] ? '#eaf1fb' : 'currentColor'}">${i + 1}</text>`).join('') +
    `<text x="60" y="92" text-anchor="middle" style="font-size:13px;fill:currentColor">${label}</text></svg>`;
}
function kitSvg() {
  const P = [['Kick', 150, 150, 30], ['Snare', 95, 122, 20], ['Hi-hat', 38, 100, 18], ['High tom', 122, 70, 17], ['Mid tom', 176, 70, 17], ['Floor tom', 232, 120, 24], ['Crash', 70, 40, 16], ['Ride', 252, 50, 20]];
  return '<svg viewBox="0 0 300 190" class="staff" style="max-width:420px" role="img" aria-label="Top view of a drum kit. Kick drum at the centre front, snare drum on the left, hi-hat far left, two toms at the back, floor tom on the right, crash cymbal back left and ride cymbal back right.">' +
    P.map(p => `<circle cx="${p[1]}" cy="${p[2]}" r="${p[3]}" fill="none" stroke="currentColor" stroke-width="2.5"/><text x="${p[1]}" y="${p[2] + 4}" text-anchor="middle" style="font-size:10px;fill:currentColor">${p[0]}</text>`).join('') + '</svg>';
}

/* the lessons themselves live in lessons-read.js, lessons-ear.js, lessons-theory.js and lessons-play.js */
const LESSONS = {};

/* appended to every lesson */
const ROUND_STEP = {
  h: 'How a round works',
  p: ['Each round has <b>10 questions</b>. Answer them by pressing a button or by pressing the number key shown on it (<span class="kbds"><kbd>1</kbd></span> to <span class="kbds"><kbd>4</kbd></span>).',
      '<b>Points:</b> 10 for a correct answer, plus 2 for every answer in a row (up to +10), plus up to 5 for speed. The <b>Hint</b> button removes two wrong answers but costs 5 points.',
      '<b>Timer:</b> a bar counts down (20 seconds, 30 for listening modes) and a spoken warning comes at 10, 5 and 3 seconds. Turn the timer off or double the time in <b>Settings</b> on the menu.',
      '<b>Levels and stars:</b> every 10 correct answers (across rounds) moves you up a level and unlocks harder questions. In a round, 5, 7 or 9 right earns one, two or three stars.',
      '<span class="kbds"><b>Shortcuts:</b> <kbd>1</kbd>–<kbd>9</kbd> choose · <kbd>R</kbd> replay sound · <kbd>Enter</kbd> next question. You can reopen this lesson any time with “How this works”.</span>']
};

/* the welcome tutorial: opens by itself the first time, and any time from the top of the menu */
LESSONS.start = { title: 'Welcome to Staffsounds', steps: [
  { h: 'Welcome to Staffsounds',
    p: ['Staffsounds teaches you to <b>read music</b>, <b>know your theory</b> and <b>train your ear</b>.',
        'You can also play a piano, guitar, trumpet, saxophone and drums from your keyboard.',
        'It is built to work without sight: music braille, a spoken mode that reads everything aloud, and full keyboard control.'] },
  { h: 'Finding your way around',
    p: ['The menu has four sections. Each mode inside has a <b>Lesson</b> button.',
        'The first time you open a mode, its lesson opens by itself.',
        'After that, a short <b>Ready</b> screen reminds you of the key ideas before each round, with the lesson one button away.'],
    vis: tbl(['Section', 'What is inside'], [['Read the page', '<small>notes, key signatures, note values, terms, music braille</small>'], ['Know your theory', '<small>theory facts, instrument facts</small>'], ['Train your ear', '<small>intervals, chords, progressions, scales, meter</small>'], ['Play', '<small>piano, guitar, trumpet, saxophone, drums</small>']]) },
  { h: 'Unlocking more',
    p: ['Answer <b>10 questions correctly</b> in a mode to unlock the next one and its lesson.',
        'Open from the start: Read the note, Music braille, Theory facts, Intervals and the piano.',
        'A locked mode shows a 🔒 and says what you need. Teachers can switch on <b>Unlock all</b> in Settings.'] },
  ROUND_STEP,
  { h: 'Settings that help',
    p: ['Open <b>Settings</b> at the bottom of the menu.',
        '<b>Spoken mode</b> reads menus, lessons, questions and answers aloud, so you do not need a screen reader.',
        '<b>Larger display</b> and <b>High contrast</b> make the page easier to see. <b>Reduce motion</b> turns the animations off.',
        '<b>Question timer</b> and <b>Double time</b> give you more time, or no timer at all.'] },
  { h: 'Where to begin',
    p: ['If you read print music, start with <b>Read the note</b>.',
        'If you read by touch, start with <b>Music braille</b> and switch on <b>Spoken mode</b>.',
        'If you would rather listen, start with <b>Intervals</b>.',
        'The <b>Piano playground</b> is open now if you just want to play.'] }
] };
