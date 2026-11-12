/* Staffsounds – teaching aids for every lesson: a goal, and one "key idea" per step (same order as the steps in lessons.js).
   The player shows the goal and step list on step 1, the key idea under each step, and a recap before practice. */
const LESSON_AIDS = {
  start: { goal: 'find your way around Staffsounds and start learning', keys: [
    'Staffsounds teaches reading, theory and listening, and it works without sight.',
    'Every mode has a lesson, and a short Ready screen before each round.',
    'Ten correct answers in a mode unlock the next one.',
    'A round is ten questions, and hints and timers are yours to use.',
    'Settings give you spoken mode, larger text, high contrast and more time.',
    'Pick the start that suits you: print music, braille, or listening.'] },
  notes: { goal: 'read any single note on the treble or bass staff', keys: [
    'The staff has five lines and four spaces. You count them from the bottom up.',
    'Higher on the staff means higher in pitch, so pitch becomes height on the page.',
    'Only seven letters, A to G, are used. After G the pattern starts again at A.',
    'The treble clef marks the G line. Its lines read E G B D F from the bottom.',
    'The bass clef marks the F line. Its lines read G B D F A from the bottom.',
    'Ledger lines extend the staff. Middle C sits on one just below the treble staff.',
    'Read in three moves: find the clef, find the line or space, then say the letter.'] },
  keys: { goal: 'name a major key from its key signature', keys: [
    'A key signature lists the sharps or flats used all the way through a piece.',
    'Sharps always arrive in the same order: F C G D A E B.',
    'In a sharp key, go up one half step from the last sharp to find the key.',
    'In a flat key, the second-to-last flat names the key. One flat means F major.',
    'The circle of fifths shows every key. Each step clockwise adds one sharp.'] },
  values: { goal: 'count the beats in a bar', keys: [
    'A note’s shape tells its length: whole 4 beats, half 2, quarter 1, eighth half a beat.',
    'In 4/4 every bar holds four quarter-note beats, so the lengths in a bar add up to four.',
    'A dot adds half again, a tie joins two lengths, and a rest is silence of the same length.'] },
  terms: { goal: 'understand the Italian words printed on a page of music', keys: [
    'Dynamics run from pp, very soft, up to ff, very loud.',
    'Tempo words run from largo, very slow, to presto, very fast.',
    'Articulation says how to attack each note. Road-map signs say where to jump.'] },
  ints: { goal: 'name the distance between two notes', keys: [
    'A half step is the next key. A whole step is two half steps.',
    'Count the half steps between the notes, then match the number to the interval name.',
    'Learn each interval by a tune you know, so you can hear it again.',
    'Start with the big contrasts first, close notes against wide ones.'] },
  chords: { goal: 'hear and name a chord quality', keys: [
    'A chord stacks notes a third apart.',
    'Major has the larger third at the bottom and minor the smaller. One half step makes the difference.',
    'Diminished is tense and squeezed. Augmented is stretched and unsettled.',
    'Seventh chords add one more third on top for a richer sound.',
    'Listen to the mood first: bright, sad, tense or stretched.'] },
  prog: { goal: 'follow a chord progression by ear', keys: [
    'Roman numerals number the chords of a key. I is home.',
    'I is home, V pulls back to I, and IV leads away from home.',
    'Many songs reuse a few patterns, such as I V vi IV.',
    'Listen for where the music wants to rest, and for the bass moving underneath.'] },
  scales: { goal: 'recognise major, minor, modes and other scales by ear', keys: [
    'A scale is a ladder of notes. Its pattern of steps gives it a mood.',
    'Major is W W H W W W H. Natural minor is W H W W H W W.',
    'A mode starts a scale on a different note and changes its colour.',
    'Pentatonic has five notes, blues adds a blue note, and whole tone floats.',
    'Count the notes first, then listen to the third, then listen for the odd note.'] },
  meter: { goal: 'hear how many beats are in each bar', keys: [
    'Bars group beats together, and the first beat of a bar is the strongest.',
    'The top number counts beats. The bottom number says which note gets one beat.',
    'Simple time splits each beat in two. Compound time splits it in three.',
    'Syncopation, triplets and pick-ups are three rhythm words to know.',
    'Find the strong pulse, then count how many pulses pass before it returns.'] },
  theory: { goal: 'answer fact questions about notation, keys and chords', keys: [
    'The staff, clef and ledger lines tell you which pitch each note means.',
    'Sharps raise, flats lower, naturals cancel, and every black key has two names.',
    'Each major key has a relative minor that starts on its 6th note.',
    'A triad stacks thirds, and V to I is the strongest ending.',
    'The questions come from open textbooks, and every answer comes with a reason.'] },
  braille: { goal: 'read pitch and length from a music braille cell', keys: [
    'One braille cell shows both the pitch and the length of a note.',
    'The shapes of the letters D E F G H I J stand for the notes C D E F G A B.',
    'Add dot 6 for a quarter note, dot 3 for a half note, and dots 3 and 6 for a whole note.',
    'An octave sign before a note says which octave it is in.',
    'Read the pitch dots first. Ignore dots 3 and 6 when you are naming the pitch.'] },
  insts: { goal: 'say how each instrument makes sound and which ones transpose', keys: [
    'A guitar is plucked, a trumpet is buzzed, a sax uses a reed, and drums are struck.',
    'Transposing instruments sound different from what they read. Concert pitch is what you hear.',
    'Open the playgrounds from the menu to hear each one.'] },
  guitar: { goal: 'pluck the strings, find notes on the frets and strum a chord', keys: [
    'Six strings are tuned E A D G B E, from low to high.',
    'Each fret is one half step, and fret 12 is an octave above the open string.',
    'A chord box shows which frets to press on which strings.',
    'Keys 1 to 6 pluck, the arrows move the fret, and Space strums.'] },
  trumpet: { goal: 'find notes using partials and valve combinations', keys: [
    'Lip tension picks the partial, and the valves lengthen the tube.',
    'Valve 2 lowers one half step, valve 1 lowers two, and valve 3 lowers three.',
    'The lowering amounts add up, so all three valves together lower the note by six.',
    'Hold Space to blow, hold 1 2 3 for valves, and use the arrows to change partial.'] },
  sax: { goal: 'play written notes and hear how each saxophone transposes', keys: [
    'A saxophone is a woodwind that uses a single reed.',
    'Written notes sound lower: alto by a major sixth and tenor by a major ninth.',
    'The on-screen keys are written notes, and the display tells you what sounds.'] },
  voice: { goal: 'find your key, fix stray pitches, and build a choir from one voice', keys: [
    'Start listening, then sing. The game names each note you sing.',
    'Analyse a recording to find your range, voice type and the best keys.',
    'Auto-tune moves notes to the key. Lower the strength to keep it natural.',
    'The choir maker adds soprano, alto, tenor and bass around your tune.'] },
  duet: { goal: 'play a melody and chords together, and record the result', keys: [
    'The top row plays a melody and the home row plays chords, both in the same key.',
    'Chords are triads built on each scale note, written I ii iii IV V vi vii°.',
    'I, V, vi, IV is a four-chord loop you will hear in many songs.',
    'Key and scale change the mood. Shift makes a seventh chord.',
    'B starts a drum loop or metronome, so you play in time.',
    'The glowing chord shows what to play next in a progression.',
    'Hear a melody, play it back, and earn up to three stars.',
    'Capture your playing and the game tidies its timing, key and chord pattern.',
    'Live notation shows what you play, and a MIDI keyboard can play it for you.',
    'Record instruments, voice or both, layer takes, then trim, fade and mix them.'] },
  drums: { goal: 'play the kit and recognise four basic beats', keys: [
    'Drums are written by which drum to hit, not by pitch.',
    'In a rock beat the kick falls on 1 and 3, and the snare on 2 and 4.',
    'Funk, disco and waltz change where the kick and snare fall.',
    'Rim shot, clap, cowbell, congas and shaker add hand percussion for Latin and Afrobeat grooves.',
    'Each key is a different drum, and a pattern can loop underneath you.'] }
};
