// const notes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const A4 = 440;
const C0 = Math.round(A4 * (2 ** -4.75)); // 16

// Code by fritzvd (signaltohertz) - https://github.com/fritzvd/signaltohertz
// Changes: function name
const calculateFrequency = (frequencies, options) => {
  let rate = 22050 / 1024; // defaults in audioContext.

  if (options) {
    if (options.rate) {
      rate = options.rate;
    }
  }

  let maxI;
  let max = frequencies[0];

  for (let i = 0; frequencies.length > i; i += 1) {
    const oldmax = parseFloat(max);
    const newmax = Math.max(max, frequencies[i]);

    /* TODO: != is what the original code uses here, and I am not sure, whether
     * it is safe to just replace it with !==. Should do it later, with a
     * careful testing. */
    /* eslint-disable eqeqeq */
    if (oldmax != newmax) {
    /* eslint-enable eqeqeq */
      max = newmax;
      maxI = i;
    }
  }
  return maxI * rate;
};

// Calculate amount of steps away from C0
const calculateSemiTone = (frequency) => {
  const semiTonesAway = 12 * Math.log2(frequency / C0);
  return semiTonesAway;
};

// Uses C0 as base
const calculateOctave = (semiTonesAway) => {
  const octave = Math.floor(semiTonesAway / 12);
  return octave;
};

const calculateCents = (currentFrequency, lastFrequency) => {
  const cents = 1200 * Math.log2(lastFrequency / currentFrequency);
  return cents;
};

const calculateNote = (frequency) => {
  const semiTone = calculateSemiTone(frequency);
  const octave = calculateOctave(semiTone);
  const notePosition = Math.floor(semiTone % 12);
  const note = notes[notePosition] + String(octave);
  return note;
};

const toDecimals = (number, decimals) => {
  if (typeof decimals !== 'number') return number;
  const fixedNumber = number.toFixed(decimals);
  return fixedNumber;
};

// Handle error
const throwError = (err) => {
  throw new Error(`Something went wrong: ${err}`);
};

const logError = (err) => {
  console.error(err);
};

module.exports = {
  calculateFrequency,
  calculateSemiTone,
  calculateCents,
  calculateNote,
  toDecimals,
  throwError,
  logError,
};
