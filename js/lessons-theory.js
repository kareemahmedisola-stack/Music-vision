/* Staffsounds – lessons: KNOW YOUR THEORY: theory facts, music braille, instruments.
   Part of the LESSONS table (see lessons.js for the helpers these use). Each file adds its own lessons. */

Object.assign(LESSONS, {
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
] }
});
