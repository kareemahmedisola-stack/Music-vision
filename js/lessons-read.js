/* Staffsounds – lessons: READ THE PAGE: notes, key signatures, note values, terms.
   Part of the LESSONS table (see lessons.js for the helpers these use). Each file adds its own lessons. */

Object.assign(LESSONS, {
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
] }
});
