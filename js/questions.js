/* Staffsounds – question generators. Each gX(t) gets a difficulty t (0,1,2…) and returns:
   { vis?, play?, hear?, key?, q, opts[], ans, why }
   To add a mode: write a generator, add it to MODES, add a lesson in lessons.js. */

/* ---- Read the note ---- */
const NOTE_TIPS = {
  t: 'Treble lines: Every Good Boy Does Fine. Spaces spell FACE.',
  b: 'Bass lines: Good Boys Do Fine Always. Spaces: All Cows Eat Grass.'
};
function gNotes(t) {
  const c = t >= 2 && Math.random() < 0.5 ? 'b' : 't';
  let lo, hi;
  if (c === 't') [lo, hi] = [[30, 38], [27, 41], [26, 42], [24, 44]][Math.min(t, 3)];
  else [lo, hi] = [[18, 26], [18, 26], [15, 29], [12, 32]][Math.min(t, 3)];
  const s = lo + Math.floor(Math.random() * (hi - lo + 1)), a = LETTERS[s % 7];
  const off = s - (c === 't' ? 30 : 18);
  const pos = off < 0 ? (-off) + ' step' + (off < -1 ? 's' : '') + ' below the bottom line'
    : off > 8 ? (off - 8) + ' step' + (off > 9 ? 's' : '') + ' above the top line'
    : off % 2 ? 'in space ' + ((off + 1) / 2) + ' from the bottom'
    : 'on line ' + (off / 2 + 1) + ' from the bottom';
  const midi = dmidi(s);
  return {
    vis: staff({ clef: c, notes: [s], label: (c === 't' ? 'Treble' : 'Bass') + ' clef staff. The note sits ' + pos + '.' }),
    hear: () => tone(midi, 0, 1.1),
    q: 'Which note is this?', opts: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], ans: a,
    why: `That is ${a}. ${NOTE_TIPS[c]}`
  };
}

/* ---- Intervals ---- */
const IV = [
  ['Perfect 5th', 7, 'Twinkle, Twinkle starts with it'], ['Major 3rd', 4, 'The start of When the Saints Go Marching In'],
  ['Octave', 12, 'Somewhere Over the Rainbow'], ['Minor 3rd', 3, 'Greensleeves'],
  ['Perfect 4th', 5, 'Here Comes the Bride'], ['Major 2nd', 2, 'Happy Birthday'],
  ['Major 6th', 9, 'My Bonnie Lies Over the Ocean'], ['Minor 7th', 10, 'Somewhere, from West Side Story'],
  ['Minor 2nd', 1, 'The Jaws theme'], ['Tritone', 6, 'The Simpsons theme'],
  ['Major 7th', 11, ''], ['Minor 6th', 8, '']
];
function gInt(t) {
  const pool = IV.slice(0, Math.min(IV.length, 4 + t * 2)), a = pick(pool), r = 52 + Math.floor(Math.random() * 14);
  return {
    play: () => playInterval(a[1], r),
    q: 'Listen to the two notes. What is the interval?',
    opts: take(pool.map(x => x[0]), a[0], Math.min(4, pool.length)), ans: a[0],
    why: `${a[0]} is ${a[1]} half steps up.${a[2] ? ' Memory hook: ' + a[2] + '.' : ''}`
  };
}

/* ---- Chord quality ---- */
const CH = [
  ['Major', [0, 4, 7], 'bright and settled'], ['Minor', [0, 3, 7], 'darker and sadder'],
  ['Diminished', [0, 3, 6], 'tense and unstable'], ['Augmented', [0, 4, 8], 'dreamy and unresolved'],
  ['Dominant 7th', [0, 4, 7, 10], 'bluesy; it wants to resolve'], ['Major 7th', [0, 4, 7, 11], 'smooth and jazzy'],
  ['Minor 7th', [0, 3, 7, 10], 'mellow and soulful']
];
function gCh(t) {
  const pool = CH.slice(0, Math.min(7, 2 + t)), a = pick(pool), r = 48 + Math.floor(Math.random() * 12);
  return {
    play: () => playChord(a[1], r),
    q: 'Listen to the chord (broken, then together). What quality is it?',
    opts: pool.map(x => x[0]), ans: a[0],
    why: `${a[0]} chords sound ${a[2]}. Stacked from the root: ${a[1].join(', ')} half steps.`
  };
}

/* ---- Progressions ---- */
const PR = ['I IV V I', 'I V vi IV', 'I vi IV V', 'ii V I I', 'vi IV I V', 'I IV vi V', 'I iii IV V', 'I V IV I', 'I vi ii V', 'vi ii V I', 'IV V iii vi', 'I ii iii IV'];
const NM = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
function gProg(t) {
  const pool = PR.slice(0, Math.min(PR.length, 4 + t * 2)), a = pick(pool), k = 48 + Math.floor(Math.random() * 12);
  const f = x => x.replace(/ /g, ' – ');
  return {
    play: () => playProg(a, k),
    key: 'Key of ' + NM[k % 12] + ' major',
    q: 'Listen to the four chords. Which progression is it?',
    opts: take(pool.map(f), f(a), 4), ans: f(a),
    why: `Roman numerals show each chord’s place in the key: capitals are major, lowercase are minor. This one is ${f(a)}.`
  };
}

/* ---- Key signatures ---- */
const KS = [['C', 0], ['G', 1], ['F', -1], ['D', 2], ['B♭', -2], ['A', 3], ['E♭', -3], ['E', 4], ['A♭', -4], ['B', 5], ['D♭', -5], ['F♯', 6]];
function gKey(t) {
  const pool = KS.slice(0, Math.min(12, 4 + t * 2)), a = pick(pool), n = Math.abs(a[1]);
  return {
    vis: staff({ sig: a[1], label: 'Treble staff with ' + (n ? n + (a[1] > 0 ? ' sharp' : ' flat') + (n > 1 ? 's' : '') : 'no sharps or flats') }),
    q: 'Which major key has this key signature?',
    opts: take(pool.map(x => x[0]), a[0], 4), ans: a[0],
    why: a[1] === 0 ? 'No sharps or flats means C major.'
      : a[1] > 0 ? `${n} sharp${n > 1 ? 's' : ''}: go a half step above the last sharp to find the key.`
      : `${n} flat${n > 1 ? 's' : ''}: the second-to-last flat names the key${n === 1 ? ' (one flat is always F major)' : ''}.`
  };
}

/* ---- Note values ---- */
const VA = [['Whole note', '4 beats'], ['Half note', '2 beats'], ['Quarter note', '1 beat'], ['Eighth note', '½ beat'], ['Sixteenth note', '¼ beat']];
function gVal(t) {
  const pool = VA.slice(0, Math.min(5, 3 + t)), a = pick(pool);
  return {
    vis: value(VA.indexOf(a)), q: 'Name this note value.',
    opts: pool.map(x => x[0]), ans: a[0],
    why: `${a[0]}: worth ${a[1]} in 4/4 time.`
  };
}

/* ---- Terms and signs ---- */
const TM = [
  ['forte (f)', 'Loud'], ['piano (p)', 'Soft'], ['crescendo', 'Gradually louder'], ['diminuendo', 'Gradually softer'],
  ['allegro', 'Fast and lively'], ['adagio', 'Slow and calm'], ['staccato', 'Short and detached'], ['legato', 'Smooth and connected'],
  ['ritardando', 'Gradually slower'], ['fermata', 'Hold the note longer'], ['da capo', 'Go back to the start'], ['andante', 'Walking pace']
];
function gTerm(t) {
  const pool = TM.slice(0, Math.min(12, 5 + t * 2)), a = pick(pool);
  return {
    vis: `<div class="term">${a[0]}</div>`, q: 'What does this marking tell the player?',
    opts: take(pool.map(x => x[1]), a[1], 4), ans: a[1],
    why: `${a[0]} means “${a[1].toLowerCase()}”.`
  };
}


/* =====================================================================================
   More question modes. Topics follow free, open music theory textbooks (Open Music Theory,
   the University of Edinburgh "Fundamentals of Music Theory") and the Music Braille Code.
   Facts are written in the game's own words. */
/* ===== theory databases (topics drawn from Open Music Theory, the Edinburgh Fundamentals of Music Theory open textbook, and the Music Braille Code) ===== */
const qa=(Pl,t)=>{const a=pick(Pl.slice(0,Math.min(Pl.length,8+t*6)));return{q:a[0],opts:shuf([a[1],...a[2]]),ans:a[1],why:a[3]}};
const THY=[
['How many lines does a staff have?','5',['4','6','7'],'A staff has five lines and four spaces between them.'],
['Which clef is normally used for higher notes, such as the right hand of a piano?','Treble clef',['Bass clef','Alto clef','Tenor clef'],'The treble clef, also called the G clef, curls around the G above middle C.'],
['What does a sharp sign do to a note?','Raises it by a half step',['Lowers it by a half step','Raises it by a whole step','Cancels a flat'],'A sharp raises a note by one half step, the very next key on the piano.'],
['What does a flat sign do to a note?','Lowers it by a half step',['Raises it by a half step','Lowers it by a whole step','Doubles its length'],'A flat lowers a note by one half step.'],
['What does a natural sign do?','Cancels an earlier sharp or flat',['Raises a note a half step','Makes a note louder','Repeats the bar'],'A natural returns the note to its plain letter name.'],
['How many half steps make one whole step?','2',['1','3','4'],'A whole step is two half steps, for example C to D.'],
['What is the distance between two notes with the same letter name, such as C up to the next C?','Octave',['Fifth','Unison','Third'],'An octave spans 12 half steps and the higher note vibrates twice as fast.'],
['A dot after a note makes it...','Half as long again',['Twice as long','Half as long','Silent'],'A dotted half note lasts 3 beats: 2 plus half of 2.'],
['A tie joins two notes of the same pitch so they sound as...','One longer note',['Two short notes','A chord','A slide'],'Add the lengths of the tied notes together and play once.'],
['In 3/4 time, what does the top number tell you?','3 beats in each bar',['3 bars in each line','3 quarter rests','3 sharps'],'The top number counts beats per bar.'],
['In 4/4 time, what does the bottom number tell you?','A quarter note gets one beat',['A whole note gets one beat','There are 4 bars','Play four times'],'The bottom number names the note value that gets one beat. 4 means quarter note.'],
['Which time signature is also called common time?','4/4',['3/4','6/8','2/2'],'Common time is 4/4, often written as a letter C.'],
['Whole and half steps in a major scale, in order:','W W H W W W H',['W H W W H W W','W W W H W W H','H W W H W W W'],'The major scale pattern is whole, whole, half, whole, whole, whole, half.'],
['Whole and half steps in a natural minor scale, in order:','W H W W H W W',['W W H W W W H','W H W W W H W','H W W W H W W'],'The natural minor pattern is whole, half, whole, whole, half, whole, whole.'],
['What is the relative minor of C major?','A minor',['E minor','D minor','C minor'],'The relative minor starts on the 6th note of the major scale. They share the same key signature.'],
['What is the relative minor of G major?','E minor',['A minor','B minor','D minor'],'E is the 6th note of the G major scale.'],
['Which scale degree is the tonic?','First',['Third','Fourth','Fifth'],'The tonic is note 1, the home note of the key.'],
['Which scale degree is the dominant?','Fifth',['Fourth','Second','Seventh'],'The dominant is note 5. It pulls strongly back toward the tonic.'],
['Which scale degree is the subdominant?','Fourth',['Fifth','Sixth','Second'],'The subdominant is note 4, a fifth below the tonic.'],
['Which note is enharmonic with C sharp?','D flat',['D sharp','B sharp','C flat'],'Enharmonic notes sound the same but have different names. C♯ and D♭ are the same piano key.'],
['How many different notes are in a pentatonic scale?','5',['4','6','7'],'Penta means five. A major pentatonic is 1, 2, 3, 5, 6.'],
['Which triad has a root, a major third and a perfect fifth?','Major triad',['Minor triad','Diminished triad','Augmented triad'],'A major triad stacks 4 then 3 half steps: for example C, E, G.'],
['A chord built on the fifth scale degree is called the...','Dominant chord',['Tonic chord','Subdominant chord','Mediant chord'],'V is the dominant chord, which wants to resolve to I.'],
['A V to I cadence is called...','Perfect or authentic cadence',['Plagal cadence','Deceptive cadence','Half cadence'],'V to I gives the strongest sense of ending.'],
['A IV to I cadence is called...','Plagal cadence',['Authentic cadence','Half cadence','Deceptive cadence'],'The plagal cadence is the "Amen" ending.'],
['6/8 time is usually felt as...','Two beats, each split in three',['Six equal beats','Three beats split in two','Eight beats'],'6/8 is compound time: two big beats, each dotted-quarter long.'],
['Dorian mode is like natural minor but with a raised...','Sixth degree',['Second degree','Fourth degree','Seventh degree'],'Dorian has a minor sound with a brighter 6th, as in many jazz tunes.'],
['Mixolydian mode is like a major scale but with a lowered...','Seventh degree',['Third degree','Fourth degree','Second degree'],'Mixolydian has a bluesy, relaxed major sound.'],
['On the circle of fifths, moving one step clockwise adds...','One sharp, or removes one flat',['One flat','Two sharps','A minor third'],'C has none, then G one sharp, D two sharps, and so on.'],
['A triplet fits three notes into the time of...','Two of the same note',['Four','Three','Five'],'Three even notes squeeze into the space of two.'],
['Syncopation means...','Stressing weak beats or off-beats',['Playing louder','Slowing down','Repeating a bar'],'Syncopation moves the accent away from the expected strong beat, as in funk and jazz.'],
['An anacrusis, or pick-up, is...','Notes before the first full bar',['A final chord','A repeated section','A very loud note'],'The first bar is incomplete; the notes lead into the downbeat.']];
function gTheory(t){return qa(THY,t)}
const INSQ=[
['How many strings does a standard guitar have?','6',['4','5','7'],'Standard guitars have six strings.'],
['Standard guitar tuning, lowest to highest:','E A D G B E',['E A D G B D','A D G C E A','E B G D A E'],'Low E, A, D, G, B, high E. A phrase to remember: Eddie Ate Dynamite, Good Bye Eddie.'],
['Each fret on a guitar raises the pitch by...','One half step',['One whole step','A third','An octave'],'Moving up one fret moves to the neighbouring piano key.'],
['Pressing the 12th fret gives a note...','One octave above the open string',['A fifth above','A half step above','The same note'],'The 12th fret is exactly halfway along the string, so the pitch doubles.'],
['How many valves does a trumpet have?','Three',['Two','Four','Five'],'Three piston valves lengthen the tube to lower the pitch.'],
['Pressing the second valve alone lowers a trumpet note by...','One half step',['One whole step','A minor third','An octave'],'Valve 2 lowers one half step, valve 1 a whole step, valve 3 a step and a half.'],
['Pressing the first valve alone lowers a trumpet note by...','One whole step',['One half step','A minor third','A fifth'],'Valve 1 adds tube for a whole step.'],
['Which trumpet valves together lower the pitch the most?','1, 2 and 3',['1 and 2','2 and 3','Only 3'],'All three lower the note by six half steps, a tritone.'],
['On a B♭ trumpet, written C sounds as...','B♭',['C','D','A'],'A B♭ instrument sounds a whole step lower than written.'],
['A saxophone is a...','Single-reed woodwind',['Brass instrument','Double-reed woodwind','Percussion instrument'],'Though made of brass, a sax is a woodwind because sound comes from a vibrating reed.'],
['Which saxophone is the smallest and highest?','Soprano',['Alto','Tenor','Baritone'],'From high to low: soprano, alto, tenor, baritone.'],
['Written C on an alto saxophone sounds as...','E♭, a sixth lower',['C','B♭, a ninth lower','D'],'Alto sax is an E♭ instrument. Written C sounds E♭ below it.'],
['Written C on a tenor saxophone sounds as...','B♭, a ninth lower',['E♭, a sixth lower','C','A'],'Tenor sax is a B♭ instrument, pitched an octave and a whole step below written.'],
['What is transposition?','Shifting music up or down by a fixed interval',['Playing faster','Changing the volume','Adding a melody'],'Transposing instruments are written in one key and sound in another.'],
['Which drum is played with a foot pedal?','Bass drum, or kick',['Snare drum','Floor tom','Ride cymbal'],'The kick drum is struck by a beater on a foot pedal.'],
['Which drum has wires stretched under its bottom head?','Snare drum',['Floor tom','Kick drum','Bongo'],'The snare wires give the crisp rattle.'],
['In a basic rock beat the snare falls on...','Beats 2 and 4',['Beats 1 and 3','Every beat','Only beat 1'],'Kick on 1 and 3, snare on 2 and 4, steady hi-hat in between.'],
['What does drum notation show?','Which drum or cymbal to hit',['The exact pitch','Only the volume','Only the tempo'],'Each line or space on a percussion staff stands for a drum, not a pitch.'],
['Concert pitch means...','The actual sounding pitch',['The written pitch','A very high pitch','Pitch played in a hall'],'Concert pitch is what you hear, whatever the player reads.']];
function gInst(t){return qa(INSQ,t)}
/* ----- music braille ----- */
const BP=[[25,'C'],[17,'D'],[11,'E'],[27,'F'],[19,'G'],[10,'A'],[26,'B']],BD=[['Eighth note',0],['Quarter note',32],['Half note',4],['Whole note',36]];
const dots=b=>[1,2,3,4,5,6].filter(i=>b&(1<<(i-1))).join(', ');
const cell=(b,w)=>'<svg viewBox="0 0 60 90" class="staff" style="max-width:'+(w||100)+'px" role="img" aria-label="Braille cell. Raised dots: '+dots(b)+'">'+[0,1,2,3,4,5].map(i=>{const on=b&(1<<i);return`<circle cx="${i<3?18:42}" cy="${15+(i%3)*30}" r="9" fill="${on?'currentColor':'none'}" stroke="currentColor" stroke-width="1.5" opacity="${on?1:.3}"/>`}).join('')+'</svg>';
function gBraille(t){const n=pick(BP),len=t>0&&Math.random()<.5,d=len?pick(BD.slice(0,Math.min(4,2+t))):(t>0?pick(BD):BD[0]),b=n[0]+d[1];
 const base={vis:cell(b),key:'Raised dots: '+dots(b)};
 return len?{...base,q:'The pitch dots show '+n[1]+'. Which note length is this?',opts:BD.map(x=>x[0]),ans:d[0],why:`Dots ${dots(n[0])} spell ${n[1]}. ${d[1]?'The extra dot'+(d[1]===36?'s 3 and 6':d[1]===32?' 6':' 3')+' make it a '+d[0].toLowerCase()+'.':'No extra dots means an eighth note.'}`}
 :{...base,q:t>0?'Which pitch is this? Dots 3 and 6 only show length, so ignore them.':'This music braille cell is an eighth note. Which pitch is it?',opts:BP.map(x=>x[1]),ans:n[1],why:`Dots ${dots(n[0])} spell ${n[1]}. Shapes of letters D E F G H I J stand for C D E F G A B.`}}
/* ----- scales and meter ----- */
const SCL=[['Major',[2,2,1,2,2,2,1],'bright, the do-re-mi scale'],['Natural minor',[2,1,2,2,1,2,2],'darker and sadder'],['Major pentatonic',[2,2,3,2,3],'five notes, open and folk-like'],['Mixolydian',[2,2,1,2,2,1,2],'major with a lowered 7th, bluesy and relaxed'],['Dorian',[2,1,2,2,2,1,2],'minor with a raised 6th, cool and jazzy'],['Blues',[3,2,1,1,3,2],'minor pentatonic plus a blue note'],['Lydian',[2,2,2,1,2,2,1],'major with a raised 4th, dreamy'],['Phrygian',[1,2,2,2,1,2,2],'minor with a lowered 2nd, Spanish flavour'],['Whole tone',[2,2,2,2,2,2],'all whole steps, floating, with no home note'],['Chromatic',[1,1,1,1,1,1,1,1,1,1,1,1],'every half step']];
function gScale(t){const pool=SCL.slice(0,Math.min(SCL.length,3+t*2)),a=pick(pool),ns=[55+Math.floor(Math.random()*8)];a[1].forEach(s=>ns.push(ns[ns.length-1]+s));
 return{play:()=>ns.forEach((m,i)=>tone(m,i*.38,.5,.18)),q:'Listen to the scale going up. Which scale is it?',opts:take(pool.map(x=>x[0]),a[0],Math.min(5,pool.length)),ans:a[0],why:`${a[0]} sounds ${a[2]}. Its steps in half steps: ${a[1].join(', ')}.`}}
const MT=[['2 beats, like a march',2,2],['3 beats, like a waltz',3,3],['4 beats, like most pop',4,4],['6 pulses in two groups of three',6,3]];
const mt=(n,g)=>{for(let i=0;i<n*Math.ceil(12/n);i++)tone(i%g?72:79,i*.45,.2,i%g?.1:.28)};
function gMeter(t){const pool=MT.slice(0,Math.min(4,2+t)),a=pick(pool);return{play:()=>mt(a[1],a[2]),q:'Listen for the strong pulse that starts each bar. How is the bar grouped?',opts:pool.map(x=>x[0]),ans:a[0],why:`The high strong pulse starts each bar. Count ${a[1]===6?'1 2 3 4 5 6 with stress on 1 and 4':[...Array(a[1]).keys()].map(x=>x+1).join(' ')}.`}}

/* key -> [title, description, generator]. Order here is the order of the generators in the menu GROUPS. */
const MODES = {
  notes: ['Read the note', 'Name notes on the treble and bass staff', gNotes],
  keys: ['Key signatures', 'Count sharps and flats to find the key', gKey],
  values: ['Note values', 'Whole, half, quarter, eighth and sixteenth', gVal],
  terms: ['Terms and signs', 'Dynamics, tempo and articulation marks', gTerm],
  ints: ['Intervals by ear', 'Hear two notes, name the distance', gInt],
  chords: ['Chord quality', 'Major, minor, diminished, augmented and sevenths', gCh],
  prog: ['Progressions', 'Hear four chords, name the Roman numerals', gProg],
  start: ['Welcome to Staffsounds', 'How the game works', null],
  braille: ['Music braille', 'Read pitch and length from braille music cells', gBraille],
  theory: ['Theory facts', 'Clefs, accidentals, keys, chords, cadences and rhythm', gTheory],
  insts: ['Instrument facts', 'Guitar, trumpet, sax and drums: tuning, valves, transposition', gInst],
  scales: ['Scales and modes', 'Hear a scale, name it: major, minor, modes, pentatonic, blues', gScale],
  meter: ['Rhythm and meter', 'Hear the pulse, find the beats in each bar', gMeter],
  free: ['Piano playground', 'Play every note with your keyboard, sharps and flats included', null],
  duet: ['Keyboard duet', 'Melody on the top row, chords on the home row. Two players or one, with recording', null],
  voice: ['Voice studio', 'Find your key, fix stray pitches, polish your voice and make a choir from one voice', null],
  guitar: ['Guitar', 'Six strings, frets and chords, played from the keyboard', null],
  trumpet: ['Trumpet', 'Hold valve keys and blow: partials and valves', null],
  sax: ['Saxophone', 'Alto, tenor, soprano and baritone, with transposition shown', null],
  drums: ['Drums', 'A full kit on your keys, plus rock, funk, disco and waltz beats', null]
};
