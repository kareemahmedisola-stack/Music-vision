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

const LESSONS = {

/* ======================================================= READ THE NOTE */
notes: { title: 'Reading notes', steps: [
  { h: 'The staff: five lines, four spaces',
    p: ['Written music lives on the <b>staff</b>: five horizontal lines with four gaps between them, called <b>spaces</b>. A note sits either <b>on a line</b> or <b>in a space</b>.',
        'Always count <b>from the bottom up</b>. The lowest line is line 1 and the highest is line 5. The lowest space is space 1 and the highest is space 4.'],
    vis: pair(
      staff({ notes: [nt(30, 'line 1', LCOL), nt(32, 'line 2', LCOL), nt(34, 'line 3', LCOL), nt(36, 'line 4', LCOL), nt(38, 'line 5', LCOL)], x0: 70, dx: 40, label: 'Treble staff with a note on each of the five lines, numbered 1 to 5 from the bottom.' }),
      staff({ notes: [nt(31, 'space 1', SCOL), nt(33, 'space 2', SCOL), nt(35, 'space 3', SCOL), nt(37, 'space 4', SCOL)], x0: 78, dx: 50, label: 'Treble staff with a note in each of the four spaces, numbered 1 to 4 from the bottom.' })) +
      tip('<b>Why this matters:</b> every question in the game describes a note by its position in words, such as “on line 2 from the bottom”, so you can use these counts even if you cannot see the screen.') },

  { h: 'Higher on the page means higher in pitch',
    p: ['Moving a note <b>up the staff</b> makes the sound <b>higher</b>. Moving down makes it lower. Each step from a line to the next space (or a space to the next line) moves to the <b>next letter name</b>.',
        'Press the button and listen: nine notes climb one step at a time, starting on the bottom line and finishing above the top line.'],
    vis: paper(staff({ notes: [30, 31, 32, 33, 34, 35, 36, 37, 38], x0: 44, dx: 27, label: 'Nine notes climbing one step at a time from the bottom line to the top line of the treble staff.' }) + cap('Line, space, line, space… every step is the next letter.')),
    hear: ['data-seq="64,65,67,69,71,72,74,76,77"', 'Hear the climb'] },

  { h: 'The seven letters',
    p: ['Music uses only seven letter names: <b>A B C D E F G</b>. After G the pattern starts again at A, higher up. That is why the same letter appears many times on the staff.',
        'A <b>clef</b> at the left end of the staff tells you which letter belongs to which line. The two clefs you need are treble and bass.'],
    vis: paper(`<p style="font-size:30px;font-weight:800;letter-spacing:.2em;margin:4px 0">C D E F G A B C</p>` + cap('Eight white keys from C to the next C: an octave.')),
    hear: ['data-seq="60,62,64,65,67,69,71,72"', 'Hear C up to C'] },

  { h: 'Treble clef: the higher notes',
    p: ['The <b>treble clef</b> (also called the G clef) is used for higher sounds: the right hand on piano, the voice, violin, flute and trumpet.',
        'The five lines, bottom to top, are <b>E G B D F</b>. The four spaces, bottom to top, spell <b>F A C E</b>, which is easy because it spells the word FACE.'],
    vis: pair(
      staff({ notes: letters(['E', 'G', 'B', 'D', 'F'], [30, 32, 34, 36, 38], LCOL), x0: 70, dx: 40, label: 'Treble clef lines, bottom to top: E, G, B, D, F.' }),
      staff({ notes: letters(['F', 'A', 'C', 'E'], [31, 33, 35, 37], SCOL), x0: 78, dx: 50, label: 'Treble clef spaces, bottom to top: F, A, C, E.' })) +
      mnem(['Every', 'Good', 'Boy', 'Does', 'Fine']) + cap('Lines: Every Good Boy Does Fine. Spaces: FACE.'),
    hear: ['data-seq="64,67,71,74,77"', 'Hear the five lines'] },

  { h: 'Bass clef: the lower notes',
    p: ['The <b>bass clef</b> (the F clef) is for low sounds: the left hand on piano, cello, bass guitar, trombone and tuba.',
        'The lines are <b>G B D F A</b> and the spaces are <b>A C E G</b>. The pattern is the same shape as treble clef, but every note sits one step lower in the alphabet.'],
    vis: pair(
      staff({ clef: 'b', notes: letters(['G', 'B', 'D', 'F', 'A'], [18, 20, 22, 24, 26], LCOL), x0: 70, dx: 40, label: 'Bass clef lines, bottom to top: G, B, D, F, A.' }),
      staff({ clef: 'b', notes: letters(['A', 'C', 'E', 'G'], [19, 21, 23, 25], SCOL), x0: 78, dx: 50, label: 'Bass clef spaces, bottom to top: A, C, E, G.' })) +
      mnem(['Good', 'Boys', 'Do', 'Fine', 'Always']) + mnem(['All', 'Cows', 'Eat', 'Grass']),
    hear: ['data-seq="43,47,50,53,57"', 'Hear the five lines'] },

  { h: 'Ledger lines and middle C',
    p: ['When a note is too high or low for the staff, we add short extra lines called <b>ledger lines</b> and carry on counting in the same pattern.',
        '<b>Middle C</b> is the best-known example. It sits on one ledger line <b>below</b> the treble staff and <b>above</b> the bass staff. It is the very same key on the piano, which is why the two staves join up like one giant staff.'],
    vis: pair(
      staff({ notes: [nt(28, 'C', LCOL)], label: 'Treble staff. Middle C sits on a ledger line below the bottom line.', caption: 'Treble clef: below the staff' }),
      staff({ clef: 'b', notes: [nt(28, 'C', LCOL)], label: 'Bass staff. Middle C sits on a ledger line above the top line.', caption: 'Bass clef: above the staff' })),
    hear: ['data-note="60"', 'Hear middle C'] },

  { h: 'A reading routine that works',
    p: ['When a note appears, use the same three steps every time:',
        '<b>1. Check the clef.</b> Treble or bass? <b>2. Find the position.</b> Is it on a line or in a space, and which number from the bottom? <b>3. Say the letter.</b> Use the sayings, or count from a landmark you know well.',
        'Landmarks are a big speed boost. The treble clef curls around the <b>G on line 2</b>. The two dots of the bass clef sit either side of the <b>F on line 4</b>. Middle C is always the neighbour between them.'],
    vis: pair(
      staff({ notes: [nt(32, 'G', LCOL)], label: 'Treble landmark: G on line 2.', caption: 'Treble landmark: G on line 2' }),
      staff({ clef: 'b', notes: [nt(24, 'F', LCOL)], label: 'Bass landmark: F on line 4.', caption: 'Bass landmark: F on line 4' })) +
      tip('<b>In the game:</b> the “Hear this note” button plays the note, so you can check your answer with your ears as well as your eyes. Notes outside the treble staff and the bass clef unlock as you level up.') }
] },

/* ======================================================= KEY SIGNATURES */
keys: { title: 'Key signatures', steps: [
  { h: 'What a key signature is',
    p: ['Each major key uses its own set of sharps (♯) or flats (♭). A song in G major, for example, uses F♯ instead of F every single time.',
        'Writing a sharp beside every F would be messy, so the composer puts the sharps <b>once</b>, right after the clef. That group is the <b>key signature</b>. It applies to that letter in <b>every octave</b>, for the whole piece.',
        'Your job in the game: read the signature and name the major key.'],
    vis: paper(staff({ sig: 1, label: 'Treble staff with one sharp, on the top line: the key of G major.', caption: 'One sharp (F♯) = G major' })) +
      tip('<b>No sharps or flats at all?</b> That is C major, which uses only the white keys.'),
    hear: ['data-scale="67"', 'Hear G major (it has an F♯)'] },

  { h: 'The order of the sharps',
    p: ['Sharps always appear in the <b>same order</b>: <b>F C G D A E B</b>. The first sharp is F♯, the second adds C♯, and so on. So a key with three sharps has F♯, C♯ and G♯, never another combination.',
        'Because the order is fixed, you only need to know <b>how many</b> there are and which one came <b>last</b>.'],
    vis: paper(staff({ sig: 7, label: 'Treble staff showing all seven sharps in order: F, C, G, D, A, E, B.', caption: 'All seven sharps: F C G D A E B' })) +
      mnem(['Father', 'Charles', 'Goes', 'Down', 'And', 'Ends', 'Battle']) },

  { h: 'Finding a sharp key',
    p: ['The rule: <b>take the last sharp and go up one half step</b> (the next letter up). That note names the key.',
        'Example: three sharps are F♯, C♯, G♯. The last one is G♯, and one step above is A. So the key is <b>A major</b>.'],
    vis: tbl(['Sharps', 'Last sharp', 'Key'], [['1 ♯', 'F♯', 'G major'], ['2 ♯', 'C♯', 'D major'], ['3 ♯', 'G♯', 'A major'], ['4 ♯', 'D♯', 'E major'], ['5 ♯', 'A♯', 'B major'], ['6 ♯', 'E♯', 'F♯ major']]) +
      btns(play('data-scale="60"', 'C major (no sharps)'), play('data-scale="67"', 'G major (1 sharp)'), play('data-scale="62"', 'D major (2 sharps)')) },

  { h: 'Finding a flat key',
    p: ['Flats appear in the reverse order: <b>B E A D G C F</b>. The rule is different: the key is the <b>second-to-last flat</b>.',
        'Example: three flats are B♭, E♭, A♭. The second-to-last is E♭, so the key is <b>E♭ major</b>.',
        'One flat is the only exception, because there is no second-to-last. One flat always means <b>F major</b>.'],
    vis: paper(staff({ sig: -7, label: 'Treble staff showing all seven flats in order: B, E, A, D, G, C, F.', caption: 'All seven flats: B E A D G C F' })) +
      tbl(['Flats', 'Second-to-last', 'Key'], [['1 ♭', '(exception)', 'F major'], ['2 ♭', 'B♭', 'B♭ major'], ['3 ♭', 'E♭', 'E♭ major'], ['4 ♭', 'A♭', 'A♭ major'], ['5 ♭', 'D♭', 'D♭ major'], ['6 ♭', 'G♭', 'G♭ major']]) +
      btns(play('data-scale="65"', 'F major (1 flat)'), play('data-scale="70"', 'B♭ major (2 flats)')) },

  { h: 'The circle of fifths',
    p: ['All of this fits in one picture. Start at C at the top. Going <b>clockwise</b>, every key adds <b>one sharp</b>: G, D, A, E, B. Going <b>anticlockwise</b>, every key adds <b>one flat</b>: F, B♭, E♭, A♭, D♭.',
        'At the bottom the two sides meet. F♯ (six sharps) and G♭ (six flats) are the same keys on a piano, written two ways.',
        'The game starts with the keys near the top of the circle and adds more distant keys as you level up.'],
    vis: paper(circleOfFifths()) }
] },

/* ======================================================= NOTE VALUES */
values: { title: 'Note values', steps: [
  { h: 'How a note’s shape tells its length',
    p: ['Pitch tells you <b>how high</b> a note is. Its shape tells you <b>how long</b> it lasts. Reading the shape comes down to three clues: is the oval hollow or filled, does it have a stem, and how many flags?'],
    vis: paper(`<div class="vals">${['Whole|4 beats', 'Half|2 beats', 'Quarter|1 beat', 'Eighth|½ beat', 'Sixteenth|¼ beat'].map((t, i) => `<figure>${value(i, 80)}<figcaption>${t.split('|')[0]}<br>${t.split('|')[1]}</figcaption></figure>`).join('')}</div>`) +
      tip('<b>Quick key:</b> hollow + no stem = whole. Hollow + stem = half. Filled + stem = quarter. Each flag after that cuts the length in half.'),
    hear: ['data-dur="1"', 'Hear them in order'] },

  { h: 'Counting beats in 4/4',
    p: ['Most songs you know are in <b>4/4 time</b>: four beats in every bar, like “1 2 3 4, 1 2 3 4”. A <b>quarter note</b> gets one beat, so everything else is measured against it.',
        'Here is one bar. See how a whole note fills it alone, two half notes fill it, and so on. Every row adds up to the same four beats.'],
    vis: beatGrid() + btns(play('data-tempo="80"', 'Count four beats')) },

  { h: 'Going further: dots, ties and rests',
    p: ['These are not asked in the game yet, but you will meet them straight away in real music.',
        '<b>Dots:</b> a dot after a note adds half its value. A dotted half note lasts 2 + 1 = 3 beats.',
        '<b>Ties:</b> a curved line between two notes of the same pitch joins them into one longer note.',
        '<b>Rests:</b> every note value has a matching symbol for silence. A whole rest hangs from a line, a half rest sits on top of one.',
        '<b>Beams:</b> eighth and sixteenth notes are often joined by a thick bar instead of separate flags, which makes the beats easier to see.'] }
] },

/* ======================================================= TERMS AND SIGNS */
terms: { title: 'Terms and signs', steps: [
  { h: 'Dynamics: how loud',
    p: ['Composers add Italian words, mostly shortened to one or two letters, to tell you how <b>loud or soft</b> to play. These marks are called <b>dynamics</b>.',
        'The scale runs from <b>pp</b> (very soft) to <b>ff</b> (very loud). Two more signs describe change over time: a <b>crescendo</b> gets gradually louder and a <b>diminuendo</b> gets gradually softer.'],
    vis: `<div class="scale" role="img" aria-label="Dynamics from softest to loudest: pp, p, mp, mf, f, ff"><span>pp<small>very soft</small></span><span>p<small>soft</small></span><span>mp<small>medium soft</small></span><span>mf<small>medium loud</small></span><span>f<small>loud</small></span><span>ff<small>very loud</small></span></div>` +
      tbl(['Word', 'Means'], [['piano (p)', 'soft'], ['forte (f)', 'loud'], ['crescendo ( &lt; )', 'gradually louder'], ['diminuendo ( &gt; )', 'gradually softer']]) +
      btns(play('data-dyn="soft"', 'Soft'), play('data-dyn="loud"', 'Loud'), play('data-dyn="cresc"', 'Crescendo'), play('data-dyn="dim"', 'Diminuendo')),
    hear: ['data-dyn="cresc"', 'Hear a crescendo'] },

  { h: 'Tempo: how fast',
    p: ['<b>Tempo</b> is the speed of the beat, measured in beats per minute (BPM). Instead of a number, many pieces give an Italian word at the top.',
        'The words sit on a scale from very slow to very fast. Listen to the ticks at three different speeds to feel the difference.'],
    vis: tbl(['Word', 'Feel', 'Roughly'], [['largo', 'very slow', '40–60 BPM'], ['adagio', 'slow and calm', '66–76 BPM'], ['andante', 'walking pace', '76–108 BPM'], ['moderato', 'moderate', '108–120 BPM'], ['allegro', 'fast and lively', '120–156 BPM'], ['presto', 'very fast', '168–200 BPM']]) +
      btns(play('data-tempo="60"', 'Slow (60)'), play('data-tempo="100"', 'Walking (100)'), play('data-tempo="150"', 'Fast (150)')) +
      tip('<b>Changing speed:</b> <i>ritardando</i> (rit.) means gradually slower. <i>Accelerando</i> means gradually faster.') },

  { h: 'Articulation and road-map signs',
    p: ['<b>Articulation</b> describes how each note is attached to the next.',
        '<b>Staccato</b> (a dot above or below the note): play it short and detached. <b>Legato</b> (a curved line over several notes): play smoothly, connected. <b>Fermata</b> (a dot under an arc): hold the note longer than written.',
        '<b>Da capo</b> (D.C.) is a road-map sign: go back to the very beginning. You will often see “D.C. al Fine”, which means go back to the start and play until the word Fine.'],
    vis: btns(play('data-art="stac"', 'Staccato'), play('data-art="leg"', 'Legato')) +
      tip('<b>Memory trick:</b> “stac-cato” sounds like a short, sharp tap. “Le-ga-to” sounds like it flows, like the word “glue”.'),
    hear: ['data-art="stac"', 'Hear staccato'] }
] },

/* ======================================================= INTERVALS */
ints: { title: 'Intervals by ear', steps: [
  { h: 'Half steps and whole steps',
    p: ['An <b>interval</b> is the distance between two notes. The smallest distance on a piano is a <b>half step</b>: from one key to the very next key, black or white.',
        'Two half steps make a <b>whole step</b>. Notice that C to D skips the black key in between, so it is two half steps.'],
    vis: pair(pianoSvg({ hl: [60, 61], caption: 'C to C♯ = 1 half step' }), pianoSvg({ hl: [60, 62], caption: 'C to D = 2 half steps (a whole step)' })) +
      btns(play('data-iv="1"', 'Hear 1 half step'), play('data-iv="2"', 'Hear 2 half steps')) },

  { h: 'Counting an interval',
    p: ['To name an interval, <b>count the half steps</b> from the lower note up to the higher note. Count the key you land on, but not the one you start on, and include the black keys.',
        'Example: C up to G is 7 half steps. That distance is called a <b>perfect 5th</b>.'],
    vis: paper(pianoSvg({ hl: [60, 67], caption: 'C up to G: 7 half steps = perfect 5th' })) +
      btns(play('data-iv="7"', 'Hear a perfect 5th')),
    hear: ['data-iv="7"', 'Hear a perfect 5th'] },

  { h: 'The interval cheat-sheet',
    p: ['Each interval has a distinctive sound. The best trick is to tie each one to a <b>song you already know</b>: the first two notes of the tune give you that interval going up.',
        'Press play on any row to hear it. The game uses exactly these names and these memory hooks.'],
    vis: tbl(['Interval', 'Half steps', 'Song hook', ''], IV.slice().sort((a, b) => a[1] - b[1]).map(x => [x[0], x[1], x[2] ? '<small>' + x[2] + '</small>' : '<small>—</small>', play(`data-iv="${x[1]}"`, 'Hear')])) },

  { h: 'Listening tips',
    p: ['<b>Start with the big contrasts.</b> A perfect 5th or an octave sounds open and stable. A minor 2nd or a tritone sounds tense and clashing.',
        '<b>Sing it back.</b> If you can hum the second note, your ear is already measuring the gap.',
        '<b>Use the Play again button</b> (or press <kbd>R</kbd>) as many times as you like. Only the timer is limited.',
        'The game starts with four intervals at level 1 and adds two more at each new level, saving the hardest ones until last.'] }
] },

/* ======================================================= CHORDS */
chords: { title: 'Chord quality', steps: [
  { h: 'A chord is notes stacked in thirds',
    p: ['A <b>chord</b> is three or more notes sounding together. The simplest kind is a <b>triad</b>: a root note, the note a third above it, and the note a fifth above the root.',
        'On a piano you get a triad by playing every other key. For C: C, E and G.'],
    vis: paper(pianoSvg({ hl: [60, 64, 67], caption: 'C major triad: C, E, G (0, 4 and 7 half steps)' })),
    hear: ['data-ch="0,4,7"', 'Hear C major'] },

  { h: 'Major and minor: one half step apart',
    p: ['The two most common triads differ by a single note. In a <b>major</b> chord the middle note is 4 half steps above the root. In a <b>minor</b> chord it is only 3, so the middle note slides down one half step.',
        'That one small move changes the whole mood: major sounds bright and settled, minor sounds darker and more serious.'],
    vis: pair(pianoSvg({ hl: [60, 64, 67], caption: 'Major: 0 – 4 – 7' }), pianoSvg({ hl: [60, 63, 67], names: FLATN, caption: 'Minor: 0 – 3 – 7' })) +
      btns(play('data-ch="0,4,7"', 'Major'), play('data-ch="0,3,7"', 'Minor')) },

  { h: 'Diminished and augmented',
    p: ['Stack two <b>minor</b> thirds (3 + 3 half steps) and you get a <b>diminished</b> chord: tense and unstable.',
        'Stack two <b>major</b> thirds (4 + 4) and you get an <b>augmented</b> chord: dreamy and unresolved, like it is floating.'],
    vis: pair(pianoSvg({ hl: [60, 63, 66], names: FLATN, caption: 'Diminished: 0 – 3 – 6' }), pianoSvg({ hl: [60, 64, 68], names: FLATN, caption: 'Augmented: 0 – 4 – 8' })) +
      btns(play('data-ch="0,3,6"', 'Diminished'), play('data-ch="0,4,8"', 'Augmented')) },

  { h: 'Seventh chords',
    p: ['Add one more third on top of a triad and you get a <b>seventh chord</b>, with four notes. Three of them appear in the game:',
        '<b>Dominant 7th</b> (0, 4, 7, 10): bluesy, and it wants to resolve. <b>Major 7th</b> (0, 4, 7, 11): smooth and jazzy. <b>Minor 7th</b> (0, 3, 7, 10): mellow and soulful.'],
    vis: pair(pianoSvg({ hl: [60, 64, 67, 70], names: FLATN, caption: 'Dominant 7th: 0 – 4 – 7 – 10' }), pianoSvg({ hl: [60, 64, 67, 71], caption: 'Major 7th: 0 – 4 – 7 – 11' })) +
      btns(play('data-ch="0,4,7,10"', 'Dominant 7th'), play('data-ch="0,4,7,11"', 'Major 7th'), play('data-ch="0,3,7,10"', 'Minor 7th')) },

  { h: 'How to listen',
    p: ['In the game each chord is played <b>twice</b>: first one note at a time (so you can pick out the stack), then all together.',
        'Ask yourself: <b>Bright or dark?</b> Narrows it to major or minor. <b>Stable or tense?</b> Tense means diminished or dominant 7th. <b>Dreamy and floating?</b> Augmented. <b>Smooth and jazzy?</b> Major 7th.',
        'Level 1 only asks major versus minor. Each new level adds one more chord type.'] }
] },

/* ======================================================= PROGRESSIONS */
prog: { title: 'Progressions', steps: [
  { h: 'Numbering the chords in a key',
    p: ['Every note of a major scale can be the root of its own chord. We number them with <b>Roman numerals</b>, so the same pattern works in any key.',
        '<b>Capital letters mean major, lowercase mean minor.</b> In C major that gives I (C), ii (D minor), iii (E minor), IV (F), V (G) and vi (A minor). Press any chord to hear it.'],
    vis: tbl(['Numeral', 'In C major', 'Type', ''], [['I', 'C', 'major', play('data-pg="I"', 'Hear')], ['ii', 'D minor', 'minor', play('data-pg="ii"', 'Hear')], ['iii', 'E minor', 'minor', play('data-pg="iii"', 'Hear')], ['IV', 'F', 'major', play('data-pg="IV"', 'Hear')], ['V', 'G', 'major', play('data-pg="V"', 'Hear')], ['vi', 'A minor', 'minor', play('data-pg="vi"', 'Hear')]]) },

  { h: 'Home, tension and release',
    p: ['Chords have jobs. <b>I is home</b>: the place where everything feels settled. <b>V is tension</b>: it pulls strongly back to I. <b>IV is a step away</b>, a gentle lift. <b>vi is the sad cousin</b> of I, and <b>ii</b> likes to lead into V.',
        'Compare these two. The first leaves home and comes straight back. The second takes a longer trip first.'],
    vis: btns(play('data-pg="I V I I"', 'I – V – I – I'), play('data-pg="I IV V I"', 'I – IV – V – I')) +
      tip('<b>Test yourself:</b> play I – V and stop. It feels unfinished, as if waiting for the next chord. That itch is what makes progressions work.'),
    hear: ['data-pg="I IV V I"', 'Hear I – IV – V – I'] },

  { h: 'Famous patterns',
    p: ['A few progressions turn up in thousands of songs across pop, rock, folk, gospel and jazz. Recognise the pattern and you recognise a whole genre of tunes.'],
    vis: tbl(['Pattern', 'Where you hear it', ''], [['I – V – vi – IV', '<small>Modern pop and rock</small>', play('data-pg="I V vi IV"', 'Hear')], ['I – IV – V – I', '<small>Folk, blues, early rock and roll</small>', play('data-pg="I IV V I"', 'Hear')], ['vi – IV – I – V', '<small>Pop ballads and anthems</small>', play('data-pg="vi IV I V"', 'Hear')], ['ii – V – I', '<small>The backbone of jazz</small>', play('data-pg="ii V I I"', 'Hear')]]) },

  { h: 'How to listen',
    p: ['The game tells you the key above each question, and the four chords are always from that major key.',
        '<b>1. Listen to the bass.</b> The lowest note of each chord is its root, so you are really hearing a four-note melody. <b>2. Check the ending.</b> Does the last chord feel like home (I) or does it hang? <b>3. Replay and compare.</b> Press <kbd>R</kbd> or the Play again button. <b>4. Eliminate.</b> Rule out options that start or end in the wrong place.',
        'Level 1 has four progressions. Each new level adds two more, with trickier chords like iii and ii.'] }
] },

/* ======================================================= SCALES AND MODES */
scales: { title: 'Scales and modes', steps: [
  { h: 'A scale is a ladder of notes',
    p: ['A <b>scale</b> is a set of notes arranged from low to high. The first note is the <b>tonic</b>, the home note, and the scale ends when you reach it again an octave higher.',
        'What makes a scale sound happy, sad or mysterious is the pattern of <b>whole steps and half steps</b> between its notes. A half step is the next key on the piano. A whole step is two.'],
    vis: paper(pianoSvg({ hl: [60, 62, 64, 65, 67, 69, 71, 72], caption: 'C major: the white keys from C to C' })) + btns(play('data-scale="60"', 'Hear C major')),
    hear: ['data-scale="60"', 'Hear C major'] },

  { h: 'Recipes: major and minor',
    p: ['Write the steps as <b>W</b> (whole) and <b>H</b> (half). The <b>major</b> scale is W W H W W W H. The <b>natural minor</b> scale is W H W W H W W. Same seven letters, a different recipe, a very different mood.',
        'Listen to both, starting on C. Major sounds bright and settled. Minor sounds darker.'],
    vis: tbl(['Scale', 'Recipe', ''], [['Major', 'W W H W W W H', play('data-scl="2,2,1,2,2,2,1"', 'Hear')], ['Natural minor', 'W H W W H W W', play('data-scl="2,1,2,2,1,2,2"', 'Hear')]]) },

  { h: 'Modes: the same notes, a new home',
    p: ['A <b>mode</b> is a scale you get by starting a major scale on a different note. Each has its own colour. Two are very common: <b>Dorian</b> (a minor sound with a brighter 6th, loved in jazz) and <b>Mixolydian</b> (a major sound with a lowered 7th, loved in blues and rock).'],
    vis: tbl(['Mode', 'Recipe in steps', 'Colour', ''], [
      ['Mixolydian', 'W W H W W H W', '<small>relaxed, bluesy major</small>', play('data-scl="2,2,1,2,2,1,2"', 'Hear')],
      ['Dorian', 'W H W W W H W', '<small>cool, jazzy minor</small>', play('data-scl="2,1,2,2,2,1,2"', 'Hear')],
      ['Lydian', 'W W W H W W H', '<small>dreamy, floating</small>', play('data-scl="2,2,2,1,2,2,1"', 'Hear')],
      ['Phrygian', 'H W W W H W W', '<small>dark, Spanish flavour</small>', play('data-scl="1,2,2,2,1,2,2"', 'Hear')]]) },

  { h: 'Pentatonic, blues and the odd ones',
    p: ['A <b>pentatonic</b> scale has only five notes, so it is hard to play a clash. It is the sound of folk tunes worldwide. The <b>blues</b> scale adds one “blue” note to minor pentatonic.',
        'The <b>whole tone</b> scale (all whole steps) floats with no home note, and the <b>chromatic</b> scale climbs by half steps only.'],
    vis: tbl(['Scale', 'Steps in half steps', ''], [['Major pentatonic', '2 2 3 2 3', play('data-scl="2,2,3,2,3"', 'Hear')], ['Blues', '3 2 1 1 3 2', play('data-scl="3,2,1,1,3,2"', 'Hear')], ['Whole tone', '2 2 2 2 2 2', play('data-scl="2,2,2,2,2,2"', 'Hear')], ['Chromatic', '1 × 12', play('data-scl="1,1,1,1,1,1,1,1,1,1,1,1"', 'Hear')]]) },

  { h: 'Listening tips',
    p: ['<b>1. Count the notes.</b> Five notes is pentatonic or blues. Twelve is chromatic. <b>2. Listen to the third.</b> Bright means major, dark means minor. <b>3. Then the odd note.</b> A lowered 7th suggests Mixolydian, a raised 6th in a minor sound suggests Dorian. <b>4. Replay.</b> Press <kbd>R</kbd> as often as you like.',
        'Level 1 begins with major, natural minor and major pentatonic. Each new level adds two more.'] }
] },

/* ======================================================= RHYTHM AND METER */
meter: { title: 'Rhythm and meter', steps: [
  { h: 'Beats and bars',
    p: ['Music is divided into repeating groups of beats called <b>bars</b> (or measures). The <b>first beat</b> of each bar is the strongest, so your ear learns where each group begins.',
        'Count 1-2 for a march, 1-2-3 for a waltz and 1-2-3-4 for most pop and rock. Listen: the high, louder pulse marks beat one.'],
    vis: tbl(['Feel', 'Count', ''], [['March', '<b>1</b> 2', play('data-met="2,2"', 'Hear')], ['Waltz', '<b>1</b> 2 3', play('data-met="3,3"', 'Hear')], ['Four-beat pop', '<b>1</b> 2 3 4', play('data-met="4,4"', 'Hear')]]) },

  { h: 'Time signatures: top and bottom',
    p: ['A <b>time signature</b> is two numbers at the start of a piece. The <b>top number</b> says how many beats are in each bar. The <b>bottom number</b> says which note value gets one beat: 4 means a quarter note, 8 means an eighth note.',
        '4/4 is so common it is called <b>common time</b>.'],
    vis: tbl(['Signature', 'Meaning', 'Example feel'], [['2/4', '2 quarter-note beats', '<small>march, polka</small>'], ['3/4', '3 quarter-note beats', '<small>waltz</small>'], ['4/4', '4 quarter-note beats', '<small>pop, rock, hymns</small>'], ['6/8', '6 eighth-note pulses in 2 groups of 3', '<small>jig, lullaby, ballad</small>']]) },

  { h: 'Simple and compound',
    p: ['In <b>simple</b> time (2/4, 3/4, 4/4) every beat splits into two. In <b>compound</b> time (6/8, 9/8, 12/8) every beat splits into three, so you feel big beats made of triplets.',
        '6/8 has six pulses but you feel <b>two</b> beats: <b>1</b> 2 3 <b>4</b> 5 6. Hear how the strong pulse falls on 1 and 4.'],
    vis: btns(play('data-met="6,3"', 'Hear 6/8'), play('data-met="4,4"', 'Compare with 4/4')),
    hear: ['data-met="6,3"', 'Hear 6/8'] },

  { h: 'Words you will meet',
    p: ['<b>Syncopation:</b> stressing weak beats or the gaps between beats, as in funk and jazz.',
        '<b>Triplet:</b> three even notes squeezed into the time of two.',
        '<b>Anacrusis (pick-up):</b> notes before the first full bar that lead into beat one.'] },

  { h: 'Listening tips',
    p: ['Tap or count along. Find the strong pulse first, then count how many pulses pass before it comes back. If there are six pulses with two strong ones, it is two groups of three.',
        'Level 1 has march, waltz and four-beat feels. Higher levels add 6/8.'] }
] },

/* ======================================================= THEORY FACTS */
theory: { title: 'Theory facts', steps: [
  { h: 'The staff, clefs and ledger lines',
    p: ['Notes sit on a five-line <b>staff</b>. A <b>clef</b> at the start says which pitches the lines mean. The <b>treble clef</b> (G clef) is used for higher notes, the <b>bass clef</b> (F clef) for lower ones. Notes above or below the staff use short <b>ledger lines</b>.'],
    vis: pair(staff({ clef: 't', notes: [nt(30, 'E4', LCOL), nt(35, 'C5')], x0: 90, dx: 60, label: 'Treble staff, a note on the bottom line and one on the third space.' }), staff({ clef: 'b', notes: [nt(18, 'G2', LCOL), nt(23, 'D3')], x0: 90, dx: 60, label: 'Bass staff, a note on the bottom line and one in the third space.' })) },

  { h: 'Sharps, flats and naturals',
    p: ['A <b>sharp</b> (♯) raises a note by a half step. A <b>flat</b> (♭) lowers it by a half step. A <b>natural</b> (♮) cancels a sharp or flat.',
        'Each black key has two names: C♯ and D♭ are <b>enharmonic</b>, the same key with different names.'],
    vis: paper(pianoSvg({ hl: [61], from: 60, n: 13, caption: 'One black key, two names: C♯ or D♭' })) + btns(play('data-note="61"', 'Hear C♯ / D♭')) },

  { h: 'Keys, relative minors and the circle of fifths',
    p: ['Every major key shares its notes with a <b>relative minor</b>, which starts on the 6th note. C major and A minor both use only white keys. Moving clockwise round the <b>circle of fifths</b> adds one sharp each step.'],
    vis: paper(circleOfFifths()) + tbl(['Major', 'Relative minor'], [['C', 'A minor'], ['G', 'E minor'], ['D', 'B minor'], ['F', 'D minor']]) },

  { h: 'Chords and cadences',
    p: ['A <b>triad</b> stacks two thirds on a root. A <b>major</b> triad is a major third plus a minor third (C E G). A <b>cadence</b> is a chord pair that ends a phrase.',
        'The strongest ending is the <b>authentic</b> cadence, V to I. The “Amen” ending IV to I is a <b>plagal</b> cadence.'],
    vis: tbl(['Cadence', 'Chords', ''], [['Authentic', 'V – I', play('data-pg="V I I I"', 'Hear')], ['Plagal', 'IV – I', play('data-pg="IV I I I"', 'Hear')]]) },

  { h: 'How the questions work',
    p: ['These questions come from free, open music-theory textbooks: the staff and clefs, accidentals, scales and keys, chords and cadences, and rhythm words. Every answer comes with a short reason.',
        'Early levels use the basics. Later levels add modes, cadences and rhythm vocabulary.'] }
] },

/* ======================================================= MUSIC BRAILLE */
braille: { title: 'Music braille', steps: [
  { h: 'Louis Braille’s music code',
    p: ['Louis Braille, who invented the six-dot braille cell, also designed a way to write music with the same cell. It is used by blind and low-vision musicians worldwide, and one cell can show <b>both a note’s pitch and its length</b>.',
        'A cell has two columns. Dots 1, 2, 3 run down the left and dots 4, 5, 6 down the right.'],
    vis: paper(cell(0x3f, 70) + cap('Dots 1 2 3 on the left, 4 5 6 on the right'))},

  { h: 'Pitch: seven cell shapes',
    p: ['The shapes of the letters <b>D E F G H I J</b> stand for the notes <b>C D E F G A B</b>. With only these dots, the note is an <b>eighth note</b>.'],
    vis: tbl(['Note', 'Cell', 'Raised dots', ''], BP.map((x, i) => [x[1], cell(x[0], 46), dots(x[0]), play('data-note="' + [60, 62, 64, 65, 67, 69, 71][i] + '"', 'Hear')])),
    hear: ['data-seq="60,62,64,65,67,69,71,72"', 'Hear the scale'] },

  { h: 'Length: dots 3 and 6',
    p: ['Add extra dots to the pitch shape to change its length. <b>Dot 6</b> makes it a quarter note. <b>Dot 3</b> makes it a half note. <b>Dots 3 and 6</b> make it a whole note.',
        'Here is C at each length.'],
    vis: tbl(['Length', 'Cell', 'Raised dots'], BD.map(d => [d[0], cell(25 + d[1], 46), dots(25 + d[1])])) + btns(play('data-dur="1"', 'Hear lengths')) },

  { h: 'Octaves and what comes next',
    p: ['A separate <b>octave sign</b> before a note says which octave it is in. The game does not test octave signs yet. Rests, sharps, flats, chords and dynamics each have their own signs.',
        'The Library of Congress National Library Service for the Blind and Print Disabled keeps free music braille learning material if you want to go further.'] },

  { h: 'How the questions work',
    p: ['Each question shows the cell as a picture and also lists the raised dots in text, so a screen reader reads it to you.',
        'Level 1 asks only for the pitch of an eighth note. Higher levels mix in the other lengths and ask for the length too. Remember to ignore dots 3 and 6 when you are naming the pitch.'] }
] },

/* ======================================================= INSTRUMENT FACTS */
insts: { title: 'Instrument facts', steps: [
  { h: 'The four instruments',
    p: ['This mode asks questions about the four instruments you can play in the playground: guitar, trumpet, saxophone and drums.'],
    vis: tbl(['Instrument', 'Family', 'How it makes sound'], [['Guitar', 'Strings', '<small>plucked strings, pitch set by frets</small>'], ['Trumpet', 'Brass', '<small>buzzing lips, pitch set by lips and valves</small>'], ['Saxophone', 'Woodwind', '<small>a single vibrating reed</small>'], ['Drums', 'Percussion', '<small>striking drums and cymbals</small>']]) },

  { h: 'Transposing instruments',
    p: ['Some instruments sound different from the note the player reads. A <b>B♭ trumpet</b> sounds a whole step lower than written. An <b>alto sax</b> sounds a major sixth lower. Written music is <b>transposed</b> to match.',
        '<b>Concert pitch</b> is the actual sounding pitch.'],
    vis: tbl(['Instrument', 'Written C sounds as', ''], [['B♭ trumpet', 'B♭ (a whole step lower)', play('data-iseq="trumpet:70"', 'Hear')], ['Alto sax (E♭)', 'E♭ (a major sixth lower)', play('data-iseq="sax:63"', 'Hear')], ['Tenor sax (B♭)', 'B♭ (a major ninth lower)', play('data-iseq="sax:58"', 'Hear')]]) },

  { h: 'Where to play them',
    p: ['Open Guitar, Trumpet, Saxophone or Drums from the menu to try each one from your keyboard. Each has its own short lesson.'] }
] },

/* ======================================================= GUITAR */
guitar: { title: 'Guitar', steps: [
  { h: 'Six strings, tuned in fourths',
    p: ['A standard guitar has <b>six strings</b>. From the lowest sound to the highest they are tuned <b>E A D G B E</b>. A memory trick: Eddie Ate Dynamite, Good Bye Eddie.',
        'In this game, keys <b>1 to 6</b> pluck the strings from low to high.'],
    vis: tbl(['Key', 'String', 'Open note'], [['1', 'low E (6th string)', 'E2'], ['2', 'A', 'A2'], ['3', 'D', 'D3'], ['4', 'G', 'G3'], ['5', 'B', 'B3'], ['6', 'high E (1st string)', 'E4']]) + btns(play('data-iseq="guitar:40,45,50,55,59,64"', 'Hear the open strings')),
    hear: ['data-iseq="guitar:40,45,50,55,59,64"', 'Hear the open strings'] },

  { h: 'Frets are half steps',
    p: ['Pressing a string against a <b>fret</b> shortens it and raises the pitch by one <b>half step</b> for each fret. Fret 12 is exactly one octave above the open string.',
        'Try the low E string climbing fret by fret: E, F, F♯, G, G♯, A.'],
    vis: tbl(['Fret', 'Note on low E string'], [['0 (open)', 'E'], ['1', 'F'], ['3', 'G'], ['5', 'A'], ['7', 'B'], ['12', 'E, one octave higher']]) + btns(play('data-iseq="guitar:40,41,42,43,44,45"', 'Hear frets 0 to 5'))},

  { h: 'Chord boxes',
    p: ['A <b>chord diagram</b> shows the strings as vertical lines and frets as horizontal lines. A dot is a finger, an open circle is an open string and an X is a string you do not play.',
        'Press Space in the playground to strum the chord you pick.'],
    vis: pair(chordBox('E major', [0, 2, 2, 1, 0, 0]), chordBox('A minor', [-1, 0, 2, 2, 1, 0]), chordBox('G major', [3, 2, 0, 0, 0, 3])) + btns(play('data-ichord="guitar:40,47,52,56,59,64"', 'Strum E major'), play('data-ichord="guitar:45,52,57,60,64"', 'Strum A minor'), play('data-ichord="guitar:43,47,50,55,59,67"', 'Strum G major')) },

  { h: 'Playing it here',
    p: ['<b>1 to 6</b> pluck the strings. <b>Left and right arrows</b> move the fret from 0 to 12. <b>Space</b> strums the chosen chord. You can also tap the fretboard on a touch screen.']}
] },

/* ======================================================= TRUMPET */
trumpet: { title: 'Trumpet', steps: [
  { h: 'Lips and tube',
    p: ['A trumpet is a <b>brass</b> instrument. Sound starts as a buzz of the lips. Tightening the lips makes the buzz jump to higher notes of a fixed series called the <b>partials</b>, even with no valves pressed.',
        'On a B♭ trumpet the open-valve partials sound B♭, F, B♭, D, F as you go up.'],
    vis: tbl(['Partial', 'Written', 'Sounds'], [['2nd', 'C', 'B♭3'], ['3rd', 'G', 'F4'], ['4th', 'C', 'B♭4'], ['5th', 'E', 'D5'], ['6th', 'G', 'F5']]) + btns(play('data-iseq="trumpet:58,65,70,74,77"', 'Hear the open partials')),
    hear: ['data-iseq="trumpet:58,65,70,74,77"', 'Hear the open partials'] },

  { h: 'Three valves',
    p: ['Each valve opens extra tubing, lengthening the horn and <b>lowering</b> the pitch. <b>Valve 2</b> lowers a half step, <b>valve 1</b> a whole step, <b>valve 3</b> a step and a half. Together they add up.'],
    vis: paper(valveSvg([0, 0, 0], 'Open') + valveSvg([0, 1, 0], '2: −1') + valveSvg([1, 0, 0], '1: −2') + valveSvg([1, 1, 0], '1+2: −3') + valveSvg([1, 1, 1], '1+2+3: −6')) },

  { h: 'Valve combinations',
    p: ['Lowering amounts are in half steps and always add: valves 1 and 2 together lower 3, valves 2 and 3 lower 4, valves 1 and 3 lower 5, and all three lower 6.'],
    vis: tbl(['Valves', 'Lowers by'], [['none', '0'], ['2', '1 half step'], ['1', '2 half steps'], ['1 + 2 or 3', '3'], ['2 + 3', '4'], ['1 + 3', '5'], ['1 + 2 + 3', '6']]) + btns(play('data-iseq="trumpet:70,69,68,67,66,65"', 'Hear six notes going down')) },

  { h: 'Playing it here',
    p: ['Hold <b>Space</b> to blow. Hold <b>1, 2, 3</b> for the valves. <b>Up and down arrows</b> change the partial. The screen reads out the sounding note and the valves.'] }
] },

/* ======================================================= SAXOPHONE */
sax: { title: 'Saxophone', steps: [
  { h: 'A brass body, a wooden-family voice',
    p: ['The saxophone is a <b>woodwind</b>. Sound comes from a single <b>reed</b> that vibrates against the mouthpiece, even though the body is brass. The family from high to low is soprano, alto, tenor and baritone.'],
    vis: tbl(['Saxophone', 'Key', 'Written C sounds as'], [['Soprano', 'B♭', 'B♭ (a whole step lower)'], ['Alto', 'E♭', 'E♭ (a major sixth lower)'], ['Tenor', 'B♭', 'B♭ (a major ninth lower)'], ['Baritone', 'E♭', 'E♭ (an octave and a sixth lower)']]) },

  { h: 'Transposing',
    p: ['Players read the same fingerings on every saxophone, so a written C is fingered the same way on each size. What <b>sounds</b> depends on the instrument. This is called <b>transposition</b>.',
        'Hear written C5, the C above middle C, on each: alto and tenor.'],
    vis: btns(play('data-iseq="sax:63"', 'Alto: sounds E♭'), play('data-iseq="sax:58"', 'Tenor: sounds B♭')) },

  { h: 'Playing it here',
    p: ['The piano keys on screen are <b>written notes</b>. Use <b>A S D F G H J K L</b> and the black-key row, choose alto, tenor, soprano or baritone, and the display tells you what really sounds. Written C4 on an alto sounds E♭3, and the real range of each saxophone is kept.'] }
] },

/* ======================================================= VOICE STUDIO */
voice: { title: 'Voice studio', steps: [
  { h: 'Find the key you can sing in',
    p: ['Your voice has a <b>range</b>: the lowest and highest notes you can sing comfortably. Press <b>Start listening</b> and sing a low note, then a high one. The game shows the notes you sing.',
        'A key that fits your range sits your tune in the middle of it. Press <b>Analyse</b> on a recording to hear which keys suit you.'],
    vis: tbl(['Voice', 'Usual range'], [['Soprano', 'C4 to A5'], ['Alto', 'G3 to E5'], ['Tenor', 'C3 to A4'], ['Bass', 'E2 to E4']]) },
  { h: 'Fix stray pitches and polish',
    p: ['<b>Auto-tune</b> moves each sung note to the nearest note of the key. Strength says how firmly, and retune speed says how quickly. Keep my vibrato leaves natural wobble alone.',
        'The <b>enhancer</b> cuts rumble, adds warmth and presence, evens out loud and soft parts, and adds a little room.'] },
  { h: 'One voice becomes a choir',
    p: ['The <b>choir maker</b> finds your notes, picks a simple chord for each (I, IV or V of the key) and sings the parts you choose: soprano, alto, tenor and bass.',
        'Tell it which part you sing. Untick the parts you do not want. Wear headphones for the best stereo spread.'] }
] },

/* ======================================================= KEYBOARD DUET */
duet: { title: 'Keyboard duet', steps: [
  { h: 'Two parts on one keyboard',
    p: ['A duet is two parts played together. Here the <b>top row</b> (Q W E R T Y U I O P [ ]) plays a <b>melody</b>, one note at a time, and the <b>home row</b> (A S D F G H J K L ; \') plays <b>chords</b>.',
        'Both rows use the same key, so whatever you press fits together. One person can use both hands, or two people can share the keyboard, one on each row.'],
    vis: tbl(['Row', 'Plays', 'Keys'], [['Top', 'melody notes', 'Q to ]'], ['Home', 'chords', 'A to \'']]),
    hear: ['data-pg="I V vi IV"', 'Hear a chord pattern'] },

  { h: 'Chords from a scale',
    p: ['Build a <b>triad</b> on each note of a scale by stacking every other note. In C major that gives seven chords. Capital Roman numerals are major chords, small ones are minor, and the little circle marks a diminished chord.',
        'On the keyboard they run from left to right: A is chord I, S is ii, D is iii, F is IV, G is V, H is vi and J is vii°. K, L and ; repeat the first chords an octave higher.'],
    vis: tbl(['Key', 'Chord', 'Numeral', ''], [['A', 'C', 'I', play('data-ichord="piano:48,52,55"', 'Hear')], ['S', 'Dm', 'ii', play('data-ichord="piano:50,53,57"', 'Hear')], ['D', 'Em', 'iii', play('data-ichord="piano:52,55,59"', 'Hear')], ['F', 'F', 'IV', play('data-ichord="piano:53,57,60"', 'Hear')], ['G', 'G', 'V', play('data-ichord="piano:55,59,62"', 'Hear')], ['H', 'Am', 'vi', play('data-ichord="piano:57,60,64"', 'Hear')], ['J', 'B°', 'vii°', play('data-ichord="piano:59,62,65"', 'Hear')]]) },

  { h: 'A progression to try',
    p: ['Many songs loop four chords. The most common is <b>I, V, vi, IV</b>. In C major, press <b>A, G, H, F</b> one after another, and keep going round.',
        'Now play the melody on top. Q is the key note, and the notes climb up the scale along the row. Every note is in the key, so try anything.'],
    vis: btns(play('data-pg="I V vi IV"', 'Hear I V vi IV'), play('data-pg="I IV V I"', 'Hear I IV V I')),
    hear: ['data-pg="I V vi IV"', 'Hear I V vi IV'] },

  { h: 'Keys, minor and sevenths',
    p: ['Use <b>Key</b> to move everything up or down, and <b>Scale</b> to switch between major, which sounds bright, and minor, which sounds darker.',
        'Hold <b>Shift</b> with a chord key to add a fourth note and make a <b>seventh chord</b>, which sounds richer and more jazzy. The arrow keys shift the melody and chord octaves.'],
    vis: btns(play('data-ichord="piano:55,59,62"', 'Hear G'), play('data-ichord="piano:55,59,62,65"', 'Hear G7')) },

  { h: 'A backing beat',
    p: ['Press <b>B</b> to start a drum loop under your playing, or a plain metronome if you only want a steady click. Press <b>V</b> to change the beat and <b>C</b> and <b>M</b> to slow it down or speed it up.',
        'Playing in time is the biggest step from pressing keys to making music. The beat is recorded with your instruments when you record.'],
    vis: btns(play('data-pat="Rock 4/4"', 'Hear rock'), play('data-pat="Disco, four on the floor"', 'Hear disco'), play('data-pat="Waltz 3/4"', 'Hear waltz')) },

  { h: 'Follow a chord progression',
    p: ['Choose a <b>Progression</b>, or press <b>N</b> to step through them. The chord you should play next glows on the home row. Press it and the glow moves on. When you finish the loop, a new round starts.',
        'Start with I V vi IV. Switch on the backing beat and try to change chord on beat one of each bar.'],
    vis: btns(play('data-pg="I V vi IV"', 'Hear I V vi IV'), play('data-pg="ii V I I"', 'Hear ii V I'), play('data-pg="vi IV I V"', 'Hear vi IV I V')) },

  { h: 'Melody challenge',
    p: ['Press <b>Backslash</b> to hear a short melody in your chosen key, then play it back on the top row. A wrong note does not end the round: try again, or press <b>Space</b> to hear it once more.',
        'Finish with no mistakes for three stars. The melody gets longer as you succeed, up to eight notes, and shorter if you struggle. Set <b>Hints</b> to None to train your ear properly.'],
    vis: btns(play('data-seq="60,62,64,62,67"', 'Hear an example')),
    hear: ['data-seq="60,62,64,62,67"', 'Hear an example melody'] },

  { h: 'The pattern fixer',
    p: ['Press <b>slash</b>, play a few chords and notes, and press slash again. Then press <b>Enter</b>. The game moves each note onto the beat, brings any stray note into the key, and compares your chords with the standard progressions such as I V vi IV.',
        'It plays the corrected version straight away so you can hear the difference, and gives a timing score. It only suggests a change when your chords are close to a standard pattern, so your own ideas are left alone.'] },

  { h: 'Notation and MIDI',
    p: ['Under the keyboard, <b>Live notation</b> draws what you play on a grand staff: chords on the left with their names above, melody notes beside them. It is a quick way to learn where each note sits on the page.',
        'Have a real keyboard? Plug it in and press <b>Connect a MIDI keyboard</b>. It plays the instrument on screen, joins the melody challenge, and a drum pad controller on channel 10 plays the drum kit.'] },

  { h: 'Recording yourself',
    p: ['Under every playground is a <b>Record</b> panel. Tick <b>Instruments</b>, <b>My voice</b>, or both, then press the Record button or the <b>backtick</b> key (top left of the keyboard) to start and stop.',
        'Pick an earlier take under <b>Play along with</b> to layer a new part over it. Use headphones when you record your voice, so the microphone does not pick up the speakers. Each take can be played back, renamed and downloaded as a WAV file.',
        'Press <b>Edit</b> on a take to trim the start and end, add fades, change the volume or normalise it, then save the result as a new take or replace the original. Tick <b>Include in mix</b> on two or more takes, set each level, and press <b>Mix</b> to bounce them into one.'] }
] },

/* ======================================================= DRUMS */
drums: { title: 'Drums', steps: [
  { h: 'The kit',
    p: ['A drum kit combines <b>drums</b> (kick, snare and toms) and <b>cymbals</b> (hi-hat, crash and ride). Drums do not play a melody, so drum notation shows <b>which drum to hit</b>, not a pitch.'],
    vis: paper(kitSvg()) + tbl(['Key', 'Piece', ''], [['Z', 'Kick drum', play('data-drum="kick"', 'Hear')], ['X', 'Snare drum', play('data-drum="snare"', 'Hear')], ['C', 'Closed hi-hat', play('data-drum="hat"', 'Hear')], ['V', 'Open hi-hat', play('data-drum="ohat"', 'Hear')], ['M N B', 'High, mid, floor tom', play('data-drum="tom2"', 'Hear')], ['comma', 'Crash cymbal', play('data-drum="crash"', 'Hear')], ['full stop', 'Ride cymbal', play('data-drum="ride"', 'Hear')]]) },

  { h: 'The backbeat',
    p: ['In a basic rock beat the <b>kick</b> falls on beats <b>1 and 3</b>, the <b>snare</b> on <b>2 and 4</b> (the <b>backbeat</b>), and the <b>hi-hat</b> keeps steady eighth notes between.',
        'Count it: <b>1</b> and 2 and <b>3</b> and 4 and.'],
    vis: btns(play('data-pat="Rock 4/4"', 'Hear rock')),
    hear: ['data-pat="Rock 4/4"', 'Hear a rock beat'] },

  { h: 'Four beats to try',
    p: ['Each style has its own habit. Funk moves the kick between the beats. Disco puts the kick on every beat. A waltz has three beats to a bar.'],
    vis: tbl(['Style', 'Idea', ''], [['Rock', '<small>kick 1 and 3, snare 2 and 4</small>', play('data-pat="Rock 4/4"', 'Hear')], ['Funk', '<small>syncopated kick</small>', play('data-pat="Funk"', 'Hear')], ['Disco', '<small>four on the floor</small>', play('data-pat="Disco, four on the floor"', 'Hear')], ['Waltz', '<small>kick on 1, snare 2 and 3</small>', play('data-pat="Waltz 3/4"', 'Hear')]]) },

  { h: 'Percussion: rim shot, clap, cowbell, congas, shaker',
    p: ['Beyond the kit, the bottom pads add hand percussion. A <b>rim shot</b> is a sharp crack made by hitting the rim and head together. <b>Congas</b> are tall hand drums from Cuba, a higher and a lower one. A <b>cowbell</b> keeps a bright steady pulse, and a <b>shaker</b> fills the gaps between beats.',
        'Together they make Latin and Afrobeat grooves. Try the <b>Conga groove</b> and <b>Afrobeat</b> patterns, then play over them.'],
    vis: tbl(['Key', 'Sound', ''], [['A', 'Rim shot', play('data-drum="rim"', 'Hear')], ['S', 'Hand clap', play('data-drum="clap"', 'Hear')], ['D', 'Cowbell', play('data-drum="cow"', 'Hear')], ['F', 'High conga', play('data-drum="cgh"', 'Hear')], ['G', 'Low conga', play('data-drum="cgl"', 'Hear')], ['H', 'Shaker', play('data-drum="shk"', 'Hear')]]) + btns(play('data-pat="Conga groove"', 'Hear conga groove'), play('data-pat="Afrobeat"', 'Hear Afrobeat')) },

  { h: 'Playing it here',
    p: ['Every key is a different drum, as listed in the table. Pick a pattern and press <b>Play pattern</b> to hear it looped, then play along on top.'] }
] }

};

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
