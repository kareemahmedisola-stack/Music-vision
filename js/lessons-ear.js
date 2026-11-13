/* Staffsounds – lessons: TRAIN YOUR EAR: intervals, chords, progressions, scales, meter.
   Part of the LESSONS table (see lessons.js for the helpers these use). Each file adds its own lessons. */

Object.assign(LESSONS, {
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
] }
});
