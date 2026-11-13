# Staffsounds

A music game for learning to **read notation**, **know your theory** and **train your ear**, built to be playable without sight. Twelve question modes (including music braille), five instruments to play (piano, guitar, trumpet, saxophone, drums), a two-part keyboard duet, a recorder for voice and instruments, a spoken mode, and an illustrated lesson for every mode and instrument.

## Run it

- **Quickest:** double-click `index.html`. Everything works from a file.
- **As an installable, offline app (PWA):** serve the folder over HTTP and open it in a browser, then use "Install" / "Add to Home Screen".
  ```
  python3 -m http.server 8000     # then open http://localhost:8000
  ```
  Any static host works (GitHub Pages, Netlify, Cloudflare Pages). No build step.

## What's in the folder

```
index.html              page shell, loads the files below in order
manifest.webmanifest    install metadata (name, colours, icons)
sw.js                   service worker: offline cache. Bump VERSION when you change files
icons/                  icon.svg + 192/512 px PNGs
css/
  base.css              colour tokens, layout, menu, settings, buttons
  game.css              question screens, answers, piano, results
  lessons.css           lesson pages, tables, beat grid, circle of fifths
  instruments.css       guitar fretboard and instrument screens
  ux.css                progress bar, calmer dialogue boxes, menu cards, phone + desktop sizing
js/   (plain scripts, no modules, loaded in this order)
  state.js              helpers, saved progress (localStorage), settings
  audio.js              Web Audio: tones, demo players, piano voices
  fx.js                 confetti / note bursts
  notation.js           SVG drawing: staff(), value(), pianoSvg()
  questions.js          question generators + the MODES table
  lessons.js            ALL lesson text and diagrams
  piano.js              on-screen + computer-keyboard piano, playground
  tutorial.js           lesson player, "Hear it" demos, Try-it practice
  screens.js            menu, rounds, timer, results and review
  instruments.js        guitar, trumpet, saxophone and drum playgrounds
  livestaff.js          live notation: a grand staff that draws the notes and chords you play
  midi.js               MIDI keyboard support (Web MIDI)
  takeedit.js           trim, fade, volume, normalise and mix recorded takes
  duetplay.js           duet practice: backing beat, chord progressions, melody challenge
  practice.js           practice tracking: minutes, daily goal, day streak
  guide.js              the how-to-get-around guide (press ?)
  fixer.js              pattern fixer: tidy timing, key and chord progression
  recorder.js           record instruments and/or microphone, takes list, WAV download (IndexedDB)
  duet.js               keyboard duet: melody on the top row, chords on the home row
  speech.js             spoken mode (reads screens aloud with the browser's voice)
  hud.js                the streak + XP bar pinned to the top of every page
  main.js               start-up
```

## Editing lessons

Open `js/lessons.js`. Each lesson is a list of steps:

```js
{ h: 'Step title',
  p: ['A paragraph (HTML allowed).', 'Another one.'],
  vis: staff({ notes: [nt(30,'E')] }) + btns(play('data-iv="7"','Hear a 5th')),
  hear: ['data-seq="60,62,64"', 'Hear it'] }      // optional big sound button
```

Builders you can use in `vis`: `staff()`, `pianoSvg()`, `value()`, `tbl()`, `pair()`, `paper()`, `tip()`, `mnem()`, `play()`, `btns()`.
Sound buttons use `data-` attributes handled in `tutorial.js` (`data-iv`, `data-ch`, `data-pg`, `data-seq`, `data-note`, `data-scale`, `data-tempo`, `data-dyn`, `data-art`, `data-dur`, plus `data-scl` for scale steps, `data-met` for meter, `data-iseq` / `data-ichord` for guitar, trumpet and sax notes, `data-drum` and `data-pat` for drums).
A "Try it" practice step and the "How a round works" step are added automatically.

## Adding a new mode

1. Write a generator in `js/questions.js` that returns `{ q, opts, ans, why, vis?, play?, hear?, key? }`.
2. Add it to `MODES` there.
3. Add a lesson under the same key in `js/lessons.js`.
4. Add the key to a group in `GROUPS` at the top of `js/screens.js`.

A playground (like the guitar) is a `MODES` entry whose generator is `null`, a screen function registered in `LIVE` at the bottom of `js/instruments.js`, and a lesson.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| 1 to 9 | choose an answer |
| R | replay the sound (when piano keys are off) |
| Q | hear the question and options again (spoken mode) |
| H | use the hint (when piano keys are off) |
| Enter or N | next question |
| Left / Right | previous / next lesson step; Q repeats the step in spoken mode |
| A S D F G H J K L ; ' | piano white keys, middle C up to F (when piano keys are on) |
| W E T Y U O P | piano black keys (sharps and flats) |
| Arrows, Space (playground) | octave shift, sustain pedal |
| Duet: Q to ] / A to ' | top row melody notes, home row chords (Shift = seventh chord). Up/Down melody octave, Left/Right chord octave |
| Duet: 1 2 3 4 5 6 7 8 9 0 - = | choose the key: C, C♯, D, D♯, E, F, F♯, G, G♯, A, A♯, B |
| Duet: , and . / Z / X | key down / up a half step; major-minor; bass on-off |
| Duet: B / V / C, M | backing beat on-off / next beat / slower, faster |
| Duet: N / Backslash / Space | next chord progression / new melody challenge / hear the melody again |
| Duet: / (slash), Enter | capture your playing for the pattern fixer, then fix it and hear the corrected version |
| D (menu) / Escape (playground) | open the Keyboard duet / back to the menu |
| Page Down / Page Up (any playground) | next / previous playground (piano, duet, guitar, trumpet, sax, drums; locked ones are skipped). Recording stops and is saved when you switch |
| ` (backtick), on any playground | start / stop recording |
| Guitar: 1 to 6, Left/Right, Space | pluck strings, move the fret, strum a chord |
| Trumpet: hold 1 2 3, Space, Up/Down | valves, blow, change partial |
| Drums: Z X C V B N M , . | kick, snare, closed hat, open hat, floor/mid/high tom, crash, ride |
| Drums: A S D F G H | percussion: rim shot, hand clap, cowbell, high conga, low conga, shaker |

## Lessons and the Ready screen

A new player lands on the **welcome tutorial** (it can be replayed from "Start here" at the top of the menu). The first time a mode is opened, its lesson opens by itself. Before every round, a **Ready** screen teaches one step of that mode's lesson (a new step each round, tracked in `p.rounds`, with its "Hear it" buttons and key idea). "Start the questions", "Another mini-lesson", "Previous mini-lesson", "Review the whole lesson" and "Back to the menu" each sit on their own line. The service worker is network-first, so an update is never hidden behind an old cached copy.

## Unlocking modes

Answer 10 questions correctly in a mode to open the next mode and its lesson. Open from the start: Read the note, Music braille, Theory facts, Intervals and the piano. Unlocks: Key signatures after Read the note, Note values after Key signatures, Musical terms after Note values, Chords, Scales, Rhythm and the trumpet after Intervals, Progressions and the sax after Chords, the guitar and Instrument facts after Theory facts, and the drums after Rhythm. Turn on **Unlock all modes and lessons** in Settings to skip the quota (handy for teachers). The quota is `QUOTA` and the map is `UNLOCK` at the top of `js/screens.js`.

## Spoken mode and accessibility

Turn on **Spoken mode** in Settings (on the menu) to have menus, lessons, questions, answers and instrument notes read aloud with the browser's built-in voice. It adds 15 seconds to the question timer so there is time to listen. If you already use a screen reader you can leave it off: everything is also labelled for screen readers, including braille cells (as lists of raised dots), staves and chord diagrams.

## Sources for the theory modes

The theory questions are written in this project's own words, covering topics found in free, open music theory resources such as Open Music Theory and the University of Edinburgh's Fundamentals of Music Theory open textbook, and in the Music Braille Code (see the Library of Congress National Library Service music section). If you copy text from those resources into the game, check their licences first.

Progress and settings are stored in the browser's `localStorage` under the key `staffwise`.

## Keyboard duet and recorder

**Keyboard duet** (Play group): the top row (Q W E R T Y U I O P [ ]) plays a melody and the home row (A S D F G H J K L ; ') plays chords built on each note of the chosen key and scale, so any two keys fit together. One player can use both hands, or two players can share a keyboard. Hold Shift with a chord key for a seventh chord. Each part has its own sound and volume, and the chords can add a bass note.

**Recorder** (under every playground): tick *Instruments*, *My voice*, or both, then press Record or the backtick key. The microphone is opened only while recording. *Play along with* mixes an earlier take into the new one so you can layer parts, and *Count-in* gives four clicks first (clicks are not recorded). Takes are saved as mono WAV files in the browser (IndexedDB), so they are still there after a reload, and can be played, renamed, downloaded or deleted. The microphone needs a secure page: `https://`, `http://localhost`, or a file opened from disk in most browsers. Use headphones when recording your voice over playing instruments.

## Sounds, arpeggios and the drum kit

The piano playground (and the duet) have extra sounds: **Strings**, **Violin**, **Piano and strings** and **Flute**. On the **guitar**, press **A** (or the *Play arpeggio* button) to loop an arpeggio of the chosen chord: Up, Down, Up and down, Fingerpicking or Broken thirds, at a speed you set. Up and Down arrows change the chord. The **drum pads** are laid out like a kit: crash, high tom, mid tom and ride on top; open hat, closed hat and floor tom in the middle; and the snare and kick side by side at the bottom.

## Duet practice

Below the duet keyboard are three practice panels (code in `js/duetplay.js`). **Backing beat**: a metronome (4/4 or 3/4) or a rock, funk, disco or waltz drum loop, scheduled ahead on the audio clock so it stays steady, 60 to 200 bpm. The drums go through the same output as the instruments, so they are included when you record. **Chord practice**: pick a progression (I V vi IV, I IV V I, vi IV I V, I vi IV V, ii V I, Canon, twelve-bar blues) and the next chord glows on the home row. **Melody challenge**: the game plays a random melody in the chosen key and you play it back on the top row. Wrong notes can be retried, every third miss shows a hint, and the score is 1 to 3 stars. Solved melodies add XP and a streak, and the melody length adapts from 3 to 8 notes. Progress is saved under `duet` in the game's saved data.

## Live notation, MIDI and take editing

**Live notation** (`js/livestaff.js`, under the piano playground and the duet): a grand staff drawing the last nine notes or chords you play, with chord names above. Notes pressed together share a column. Spelling follows the duet's key (flats in F, B♭ and so on) or the piano's sharp/flat setting; accidentals are written beside each note rather than in a key signature.

**MIDI keyboard** (`js/midi.js`, panel at the bottom of every playground): press *Connect a MIDI keyboard* and allow access. Notes play the open instrument (piano, guitar, trumpet, sax), or the duet's melody sound, where they also count towards the melody challenge in any octave. Channel 10, or the drums screen, treats notes as General MIDI drum pads. The sustain pedal works in the piano playground. Web MIDI works in Chrome, Edge and Opera, and needs a secure page (`https://` or `localhost`).

**Take editing and mixing** (`js/takeedit.js`, in the recorder's list): *Edit* opens a waveform with start and end sliders, fade in and out, volume and normalise, with *Play the edit*, *Save as a new take* and *Replace this take*. Tick *Include in mix* and set each take's *Level*, then *Mix the ticked takes* to bounce them to a new take, scaled down if the sum would clip.

## Practice tracking, the guide and microphone checks

**Your practice** (menu): minutes played today against a daily goal (5 to 60 minutes), a day streak (consecutive days that reached the goal), this week's total and a seven-day bar chart. Time counts only while a round, lesson or playground is open, the tab is visible, and you pressed something in the last minute. Saved under `log` in the game's saved data.

**Guide** (`?` on the menu or in any playground): every shortcut grouped by screen, a first path for new players, and troubleshooting.

**Recorder checks**: the Record panel shows a *Setup check* (secure page, preview frame, permission state) and a *Test my microphone* button that listens for five seconds. A take that was meant to include your voice but heard none is labelled *(no voice picked up)*.

## More percussion and working offline

**Percussion pads** on the drums screen: rim shot (A), hand clap (S), cowbell (D), high conga (F), low conga (G) and shaker (H), all synthesised, with two new beats, *Conga groove* and *Afrobeat*. On a MIDI controller they answer to General MIDI notes 37 (rim), 39 (clap), 54 and 70 (shaker), 56 (cowbell), 60 to 64 (congas).

**Offline**: serve the folder once over `http://localhost` or `https://` and `sw.js` saves every file on the device; after that the whole game, including recording, notation and MIDI, works with no connection, and progress and takes live in the browser's own storage. Opened straight from a file it needs no connection anyway. The menu footer says whether the game is saved for offline use. Only the web font is optional: offline, the page uses the device's own font. Spoken mode uses the device's voices, so it works offline where the device has an offline voice installed.

## Pattern fixer

In the duet (`js/fixer.js`): press **/** (or *Capture my playing*), play chords and melody notes, and press **/** again. **Enter** (or *Fix it*) then: moves every note onto the chosen beat grid (quarter, eighth or sixteenth notes at the backing-beat tempo) and tidies its length, with a timing score; moves stray notes (from a MIDI keyboard) to the nearest note of the key; and compares your chords with the standard progressions in `PRG` (`js/duetplay.js`), nudging at most half of them to the closest one (rotations allowed, patterns longer than your capture are not considered). It plays the corrected version straight away, *Hear what I played* replays the original, and *Practise* sets the glowing-key chord practice to the suggested progression. Press Enter only when no button has focus; otherwise use the *Fix it* button.

## Voice studio, songs, weak spots, teacher mode and backup
- `js/voice.js` – Voice studio (Play group). Live pitch ribbon and note announcements; analysis of a recording (YIN pitch tracking, range and voice type, Krumhansl-Schmuckler key detection, keys that suit the voice); auto-tune (nearest scale note, strength, retune speed, keep-vibrato) done with PSOLA pitch shifting; a voice enhancer (rumble cut, warmth, presence, air, evenness, room); and a choir maker that plans I, IV or V chords from the melody and sings chosen SATB parts with humanised detune, vibrato, delay and pan, as a stereo recording (optionally each part on its own). Every result is a new take, so the original is never changed. Edit and Mix still make mono takes.
- `js/songs.js` – Songs inside the Keyboard duet. Ten public-domain songs stored as scale degrees so they play in any major key. Wait for me, In time and Hear then play modes with a falling-notes canvas, scores and best results (`P.sg`). MIDI export (song, captured playing, corrected playing) and import (finds the melody track, detects the key, moves stray notes into the key, saves into `P.my`). Start and stop: Shift + backquote.
- `js/review.js` – Weak spots: every answer is counted by its correct answer (`P.wk`); weak items are favoured when questions are generated (`wkBias`), misses are re-asked within the round, and a Weak spots screen starts a round made mostly of them. Chord dictation in the duet (Shift + backslash, Shift + Space) also feeds the weak spots.
- `js/tools.js` – Study tools on the menu: Teacher mode (progress report, assignment file, assignment progress, class table with CSV export; all file based and offline) and Backup and restore (progress only or with recordings, merge or replace).
- Remember: add every new js file to the ASSETS list in `sw.js` and bump `VERSION` (now `staffwise-v17`).

## Round 3 additions (v14)
- `js/voice2.js` – Sing along (scrolling bars, YIN pitch scoring, key chosen for the voice, optional guide melody and spoken flat/sharp coaching, results in `P.sing`), Fix my recording (`vsLevel` leveller then `vsEnhance`), Sing to notation (`vsNotes`, then `spFromMidi`, saved into `P.my`, MIDI download), Headphone check (1 kHz probe tone heard through the mic), and Voice studio keyboard shortcuts (`vsKey`).
- `js/songs.js` – 18 songs; practise a part (`spSecs`, 8-beat sections), speed slider, repeat, automatic speed-up at 90 percent, my own songs rated Easy, Medium or Harder and removable. Key detection for imported melodies now prefers a key whose home note is the last (or first) note.
- `js/plan.js` – Today's plan (`P.plan`), ticked by `planDone()` calls from end(), spFinish, dtPress and sgFinish.
- `js/setup.js` – Setup check page and the weekly backup reminder (`P.bkAt`, `P.bkSnooze`).
- Recorder: Share button on every take (Web Share with a download fallback), Headphone check button, voice recording with browser filters off by default, audio file import. Teacher mode: hand-in files (`kind: handin`) that the teacher plays from the class table.
- `sw.js` is at `staffwise-v20`.

## 3D scene (v15)
- `js/scene3d.js` – the menu hero: a dependency-free perspective renderer on a canvas. Notes flow along a wavy 3D staff, burst into sparks and shock rings on the play line, an equaliser ring pulses, glyphs orbit, captions cycle through what the app is for. Click or tap plays a note. Reduce motion shows one still frame; a Pause button is under it; the loop stops when you leave the menu. `sw.js` is `staffwise-v21`.

## Rebrand (v16)
- The app is now **STAFFSOUNDS, produced by AWESOME KAM of The AWESOMEPLANET** (hero, page title, spoken welcome, visible text). Internal data keys and file tags stay `staffwise` so saved progress and old backups keep working.
- `js/why.js` – the "Why explore everything" panel: five reasons with published statistics and links (Cepeda 2006; Roediger and Karpicke 2006; Coulton 2015; WHO hearing warning 2022 via Devdiscourse; Sala and Gobet 2020). `sw.js` is `staffwise-v22`.
- v17: the scene now spells STAFFSOUNDS in glowing extruded 3D letters that fly in, land with sparks and ride a wave; a Hear the intro button speaks a short welcome (browser speech) while the letters pulse in turn. `sw.js` is `staffwise-v23`.
