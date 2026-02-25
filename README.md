# guitar-grid

An interactive guitar fretboard visualiser built with vanilla HTML, CSS and JavaScript. Displays all notes across 6 strings and 12 frets, with scale highlighting, interval colouring, and playable notes via the Web Audio API.

## Features

- **Scale highlighting** — select a root note and scale type, and all matching notes light up across the full neck
- **Interval colouring** — each degree of the scale gets its own colour (root in red, fifth in blue, third in yellow etc) so you can see the shape of the scale at a glance. Toggle off for a single colour mode where all scale notes show in red
- **Four scale types** — Major, Minor, Major Pentatonic, Minor Pentatonic
- **Any root note** — all 12 chromatic roots supported including sharps
- **Playable notes** — click any box to hear the correct pitch, with a guitar-like envelope using two slightly detuned oscillators for warmth
- **432hz mode** — toggle between standard 440hz and 432hz tuning
- **Open strings row** — visually faded to distinguish from the fretted notes

## How the scales work

All four scales are derived from a single major scale interval pattern using a `rotateScale` function. The idea is that relative scales share the same notes — they just start from a different degree:

- **Major** — the base pattern: `[0, 2, 4, 5, 7, 9, 11]`
- **Minor** — the major scale rotated from the 6th degree (the relative minor)
- **Major Pentatonic** — the major scale with the 4th and 7th removed: degrees R 2 3 5 6
- **Minor Pentatonic** — the major pentatonic rotated from its 5th note

This means the whole scale system grows from one array and one function, rather than hardcoding each scale separately.

## How the audio works

Uses the Web Audio API — no libraries required. Each note's frequency is calculated from:

```
frequency = A4 * 2^(semitones / 12)
```

Where A4 is either 440hz or 432hz depending on the tuning toggle. Each open string has a known semitone offset from A4, and each fret adds one semitone on top of that.

Two triangle wave oscillators run slightly detuned against each other to give the sound some warmth and body. The envelope has a fast attack and a slow exponential decay over ~2.5 seconds to feel vaguely guitar-like.

## CSS Grid

The fretboard layout uses CSS Grid:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  grid-template-rows: repeat(13, 52px);
}
```

`1fr` divides the available space into equal fractions — smarter than percentages because it accounts for gaps automatically. 6 columns for the strings, 13 rows for the open strings plus 12 frets.

## Class naming conventions

Note classes avoid characters that are invalid in CSS — sharps use `s` suffix rather than `#`:

- `fs` = F#
- `gs` = G#
- `cs` = C#
- `as` = A#
- `ds` = D#

String classes use `string-1` through `string-6` rather than numeric classes, since CSS classes cannot begin with a number.

## Files

```
guitar-grid.html   — everything in one file (HTML, CSS, JS)
README.md          — this file
```

## Possible next steps

- Add more scale types (Dorian, Mixolydian etc — just more `rotateScale` calls)
- Highlight a specific position/box shape on the neck
- Add fret number labels down the side
- Chord shapes
- Mobile layout improvements
