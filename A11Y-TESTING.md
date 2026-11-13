# Accessibility testing checklist

Staffsounds is built to work without sight. Automatic checks catch missing names and broken structure, but only people using real assistive technology can tell whether it *feels* right. Use this list before each release.

## Automatic (run every time)
- `npm install` then `npm test` opens every mode, lesson and playground in a simulated browser and runs the built-in accessibility check on each screen (controls without names, pictures without descriptions, repeated ids, skipped heading levels). The same check is in the app: **Menu → More to try → Run an accessibility check**.

## By hand: screen readers
| Setup | What to check |
|---|---|
| **NVDA + Firefox or Chrome** (Windows, free) | Tab from the top: Skip link, then the progress button ("Your progress. 3 day streak. 120 XP…"). Open a round: the question is read when it appears, answers are numbered, the feedback box is read after you answer, and the "Why is that right?" button opens and closes. |
| **VoiceOver + Safari** (Mac, iPhone, iPad) | Swipe through the menu: cards read as "Level 3. Intervals. Lesson…". Rotor → Headings: order should be sensible. On iPhone, double-tap the progress button and listen to the summary. |
| **TalkBack + Chrome** (Android) | Explore by touch on the question screen. The answer buttons should be large and read in order. Confirm the vibration cues are on (Settings → Vibrate on answers). |
| **JAWS** (if available) | Forms mode inside Settings: every switch and slider has a name and its value is read. |

Check each of these with the screen reader's own voice **and** with Staffsounds' *Spoken mode* turned off, so the two do not talk over each other. Turn Spoken mode on only when no screen reader is running.

## By hand: braille
- Connect a refreshable braille display (USB or Bluetooth) to a screen reader.
- Read the Music braille lesson and the Music braille mode. Confirm the dot patterns appear as text (not as images) and each question is a single line on the display.
- Confirm that **Tab** moves across answer buttons in order and the label shows the number key (1 to 4).

## By hand: keyboard only
- Put the mouse away. Every mode must be playable: number keys answer, **Enter** moves on, **R** replays a sound, **H** gives the hint, **Escape** leaves a playground.
- Focus must always be visible (a thick outline) and never lost after a screen change.
- Menu tune: **A S D F G H J** play the seven keys; **Space** hears the next note.

## By hand: low vision and colour
- Turn on **Larger display** and **High contrast** in Settings. Nothing should overlap or be cut off at 200 percent browser zoom.
- Colour is never the only signal: the next tune key says "NEXT", feedback says "Correct" or "Not quite", overdue assignments say "Overdue by N days".
- With **Reduce motion** on, nothing flashes or moves except the progress bar width.

## By hand: phones
- Portrait and landscape; the top bar must stay readable and clear of the notch.
- Tap targets are at least 44 pixels. The Next button after an answer is full width.

Record who tested, with which device and software, and anything that surprised them. Small surprises are the useful ones.
