/**
 * The base theory in a few words:
 * - A4 = 440Hz is the reference note;
 * - A semitone equals to the distance between neighbour note frequencies in
 *   the logarithmic scale.
 * - Semitones are 0-based indexed, starting from C0 (i.e. is 0-th semi-tone),
 *   in a sense semitone is a synonim for note.
 * - If F(n) is the frequency of n-th semitone,
 *   F(n+1) = F(n) * (2 ** 1/12)
 * - An octave contains 12 semitones, and octaves are counted from
 *   the 0-th semitone.
 * - A cent equals 0.01 of semitone.
 */

/**
 * Semitone (note) names, starting from C.
 */
export const NOTE_NAMES = [
  'C', 'C#', 'D', 'D#',
  'E', 'F', 'F#', 'G',
  'G#', 'A', 'A#', 'B',
];

/**
 * A4 reference frequency: 440.0 Hz.
 */
export const FREQ_A4 = 440.0;

/**
 * C0 reference frequency: 16.352 Hz.
 */
export const FREQ_C0 = FREQ_A4 * (2 ** -4.75);

/**
 * Calculates the main frequency from the frequency power histogram build
 * by an audio AnalyserNode for an audio signal sampled at the specified rate.
 * @param {number[]} histogram Frequency historgram (from 0 to 1/2 sample rate).
 * @param {number} sampleRate [Hz].
 * @return {number} Main frequency [Hz].
 */
export function calcMainFrequency(historgram, sampleRate) {
  let maxIndex = 0;
  let maxValue = -Infinity;
  // console.log(historgram);
  historgram.forEach((value, index) => {
    if (maxValue < value) {
      maxValue = value;
      maxIndex = index;
    }
  });
  return (0.5 * sampleRate * maxIndex) / (historgram.length - 1);
}

/**
 * Converts frequency to semitone.
 * @param {number} frequency [Hz].
 * @return {number} The real semitone number. Do Math.round(x) of the result
 *  to get the closest integer semitone.
 */
export function frequencyToSemitone(frequency) {
  return 12 * Math.log2(frequency / FREQ_C0);
}

/**
 * Converts semitone to frequency.
 * @param {number} semitone
 * @return {number} [Hz].
 */
export function semitoneToFrequency(semitone) {
  return FREQ_C0 * (2 ** (semitone / 12));
}

/**
 * Returns semitone name.
 * The argument is rounded down if fractional.
 * @param {number} semitone
 * @return {string}
 */
export function semitoneToNoteName(semitone) {
  return `${NOTE_NAMES[semitone % 12]}${Math.floor(semitone / 12)}`;
}

/**
 * Converts note name to semitone.
 * @param {string} noteName
 * @return {number} Semitone.
 */
export function noteNameToSemitone(noteName) {
  const [, name, octave] = noteName.match(/([a-gA-G]#?)(\d)/);
  const index = NOTE_NAMES.indexOf(name.toUpperCase());
  if (index < 0) throw Error('Invalid note name');
  return index + 12 * (octave.charCodeAt(0) - '0'.charCodeAt(0));
}

/**
 * Returns information about the note closest to the specified frequency.
 * @param {number} frequency [Hz].
 * @return {object} Object with the following fields:
 *  - note {string} - The closest note name (e.g. A#4);
 *  - noteFrequency {number} - Note frequency [Hz].
 *  - centDeviation {number} - Deviation between frequency and noteFrequency in
 *    cents (there are 100.0 cents between neighbor notes).
 */
export function frequencyToNote(frequency) {
  const semitone = frequencyToSemitone(frequency);
  const iSemitone = Math.round(semitone);
  return {
    note: semitoneToNoteName(iSemitone),
    noteFrequency: semitoneToFrequency(iSemitone),
    centDeviation: 100 * (semitone - iSemitone),
  };
}
