![Master Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/audio/master.svg?label=master)
![Dev Build Status](https://img.shields.io/circleci/project/github/birdofpreyru/audio/develop.svg?label=develop)
![Latest NPM Release](https://img.shields.io/npm/v/@dr.pogodin/audio.svg)
![NPM Downloads](https://img.shields.io/npm/dm/@dr.pogodin/audio.svg)

# Audio

Collection of audio utilities. At the moment, its primary component is
`PitchAnalyser`, which analyses audio stream from the user's media device,
determines the main frequency of the input, and coverts that to the closest
music note, with misc supporting information. The library also exports some
constants and functions for coversions between note frequencies, semitones,
and octaves.

### Content
- [Installation](#installation)
- [Pitch Analysis](#pitch-analysis)
- [Reference](#reference)
  - [`NOTE_NAMES: string[]`](#note-names)
  - [`FREQ_A4=440.0`](#freq-a4)
  - [`FREQ_C0=16.352`](#freq-c0)
  - [`calcMainFrequency(histogram: number[], sampleRate: number): number`](#calcMainFrequency)
  - [`frequencyToNote(frequency: number): object`](#frequencyToNote)
  - [`frequencyToSemitone(frequency: number): number`](#frequencyToSemitone)
  - [`noteNameToSemitone(noteName: string): number`](#noteNameToSemitone)
  - [`PitchAnalyser: class`](#PitchAnalyser)
    - [`.constructor()`](#PitchAnalyser-constructor)
    - [`.getFrequency(): number`](#PitchAnalyser-getFrequency)
    - [`.getNote(): object`](#PitchAnalyser-getNote)
    - [`.probeNote(from: number, to: number, options?: object): Promise<object>`](#PitchAnalyser-probeNote)
    - [`.start(): Promise`](#PitchAnalyser-start)
    - [`.stop(): Promise`](#PitchAnalyser-stop)
  - [`semitoneToFrequency(semitone: number): number`](#semitoneToFrequency)
  - [`semitoneToNoteName(semitone: number): string`](#semitoneToNoteName)

### Installation

```
$ npm install --save @dr.pogodin/audio
```

### Pitch Analysis

Here is a brief example:
```js
import { PitchAnalyser } from '@dr.pogodin/audio';

const analyser = new PitchAnalyser();

/* Beware: you only should call start() and subsequent methods in browser
 * environment, as they assume AudioContext, and navigator globals exist.
 * It is safe to use PitchAnalyser constructor at the server-side. */
analyser.start();

console.log(analyser.getNote());

/*
 * Prints something similar to:
 *  {
 *    "frequency": 441.3,
 *    "note": "A4",
 *    "noteFrequency": 440.0,
 *    "centDeviation": 5.107
 *  }
 */
```

[`.getNote()`](#PitchAnalyser-getNote) method tests the note being played at
the moment of call, if you want to check a note was played during an interval of
time use [`.probeNote()`](#PitchAnalyser-probeNote) method instead.

### Reference

A very brief summary of underlying music theory and terms:
- `A4 = 440.0 Hz` is the reference note frequency.
- A _semitone_ is the difference between neighbour note frequencies at
  the logarithmic scale. The semitone values are also 0-based indices of all
  valid music notes, starting from `C0` up. In a sense, semitone is a synonim
  for a note.
- If `F(n)` is the frequency of _n_-th semitone (note), then
  `F(n+1) = F(n) * (2 ** 1/12)`.
- An _octave_ contains 12 semitones, and are counted from 0 to 8-th.
- A _cent_ equals 0.01 semitone.

Thus, conversions between cents, octaves, semitones are simple arithmetic
operations, like division / multiplication by 100 or 12, rounding, _etc._
and do not require dedicated functions. The only tricky conversion is between
frequencies and semitones, which includes exponent/logarithm, and thus
dedicated functions below are useful to not remember the formula
(although it is still pretty simple).

Top-level list points below correspond to named exports from the library.
The references follow quasy-TypeScript format to declare arguments, fields,
and function return value types.

- <a name="note-names"></a>
  `NOTE_NAMES=['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']`
  &ndash; Valid note names, starting from `C`, which corresponds to the semitone
  0, and each next note corresponds to the semitone increment by 1.

- <a name="freq-a4"></a>
  `FREQ_A4=440.0` &ndash; A4 note reference frequency [Hz].

- <a name="freq-c0"></a>
  `FREQ_CO=16.352...` &ndash; C0 note reference frequency [Hz], calculated based
  on `FREQ_A4`.

- <a name="calcMainFrequency"></a>
  `calcMainFrequency(histogram: number[], sampleRate: number): number` &ndash;
  Given a frequency power `histogram`, build by an audio `AnalyserNode` for an
  audio signal sampled at the specified `sampleRate` [Hz], determines and
  returns the signal main frequency [Hz].

- <a name="frequencyToNote"></a>
  `frequencyToNote(frequency: number): object` &ndash; Converts `frequency` [Hz]
  to an object with information about the closest music note.

  **Result Fields**
  - `note: string` &ndash; Note name, including the octave number.
  - `noteFrequency: number` &ndash; Note frequency [Hz].
  - `centDeviation: number` &ndash; The difference [cents] between `frequency`
    and the determined `noteFrequency`.

- <a name="frequencyToSemitone"></a>
  `frequencyToSemitone(frequency: number): number` &ndash; Converts `frequency`
  [Hz] into real semitone value. Should you need the closest integer semitone
  index, you may take `Math.round(semitone)` of the result.

- <a name="noteNameToSemitone"></a>
  `noteNameToSemitone(noteName: string): number` &ndash; Returns semitone
  corresponding to a note name, which should include the octave, e.g. `A#4`,
  or `B4`.

- <a name="PitchAnalyser"></a>
  `PitchAnalyser: class` &ndash; The class defines objects able to analyse
  input audio stream from the user's media device, to determine the current
  main frequency of the signal, the musical note closest to it, and the input
  deviation from that note.

  **Beware:** You can create analyser instances server-side, but it is not safe
  to call any instance methods outside of a browser environment, as the analyser
  functionality relies on `AudioContext` and `navigator` globals being present
  in the environment.

  **Constructor**
  - <a name="PitchAnalyser-constructor"></a>
    `.constructor()` &ndash; Creates a new pitch analyser. As of now it take no
    arguments, and does not do much. The actual intitializations and connection
    to a media stream should be done by an explicit call to `.start()` method of
    the created instance.
  
  **Instance Members**

  - <a name="PitchAnalyser-getFrequency"></a>
    `.getFrequency(): number` &ndash; Measures the current main
    frequency [Hz] of audio input.

  - <a name="PitchAnalyser-getNote"></a>
    `.getNote(): object` &ndash; Measures the current main frequency
    of audio input, and returns infromation about the corresponding musical
    note and frequency deviation from it.
    
    **Result Fields**
    - `.frequency: number` &ndash; The measured main frequency [Hz] of input.
    - `.note: string` &ndash; The closest note name (e.g. `A#4`).
    - `.noteFrequency: number` &ndash; The correct note frequency.
    - `.centDeviation: number` &ndash; The difference between measured
      frequency and note frequency, in cents.

  - <a name="PitchAnalyser-probeNote"></a>
    `.probeNote(from: number, to: number, options?: object): Promise<object>`
    &ndash; Takes a series of
    frequency measurements within the specified [`from`; `to`] time interval,
    and returns the average main frequency, and the corresponding note info.
    
    **Arguments:**
    - `from: number` &ndash; UNIX timestamp [ms] of probe start interval.
    - `to: number` &ndash; UNIX timestamp [ms] of probe end interval.
    - `options?: object` &ndash; Optional. Additional options:
    - `options.numSamples=5` &ndash; Optional. The target number of individual
      frequency measurements done within the probe interval. The probe will do
      less measurements, if the number turns out to be too high. Default 5.
    - `options.subInterval=0.9` &ndash; Optional. The first and last frequency
      measurements are offset by `0.5 * (to - from) * (1.0 - subInterval)`
      inside the interval, i.e. the actually probed interval is
      [`from + offset`; `to - offset`]. Defaults `0.9` (i.e. offset equals 5%
      of the originally specified [`from`; `to`] range).

    **Resolved Result Fields**
    - `.frequency: number` &ndash; The measured average main frequency [Hz] of
      input within the probed interval.
    - `.centFluctuation: number` &ndash; Standard deviation [cents] of
      the measured frequency from average
    - `.note: string` &ndash; The closest note name (e.g. `A#4`).
    - `.noteFrequency: number` &ndash; The correct note frequency.
    - `.centDeviation: number` &ndash; The difference [cents] between measured
      frequency and note frequency.

  - <a name="PitchAnalyser-start"></a>
    `.start(): Promise` &ndash; Initiates the analyser. It acquires
    the audio stream from user's media device, and allocate resources necessary
    for analysis. The result promise resolves once the analyser is ready,
    you should not call any other methods before that.
  - <a name="PitchAnalyser-stop"></a>
    `.stop(): Promise` &ndash; Stops the analyser and releases resources.
    The result promise resolves once the operation completes.

- <a name="semitoneToFrequency"></a>
  `semitoneToFrequency(semitone: number): number` &ndash; Converts a real
  semitone number into frequency [Hz].
- <a name="semitoneToNoteName"></a>
  `semitoneToNoteName(semitone: number): string` &ndash; Converts a semitone
  number into the note name, including the octave number, e.g. `A#4`.
  If `semitone` is a real number, it is round down.

