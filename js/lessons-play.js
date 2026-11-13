/* Staffsounds – lessons: PLAY: guitar, trumpet, saxophone, voice, duet, drums.
   Part of the LESSONS table (see lessons.js for the helpers these use). Each file adds its own lessons. */

Object.assign(LESSONS, {
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


});
