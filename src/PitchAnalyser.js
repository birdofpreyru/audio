/* global AudioContext, navigator */

import { time } from '@dr.pogodin/react-utils';

import {
  calcMainFrequency,
  frequencyToNote,
  frequencyToSemitone,
} from './utils';

export default class PitchAnalyser {
  /**
   * Creates a new PitchAnalyser instance.
   *
   * It is safe to create a PitchAnalyser server-side, or before any user
   * interaction happens, as no client-side logic related to AudioContext
   * is executed within the construction. Such logic is triggered only by
   * an explicit call to the start() method.
   */
  constructor() {
    this.private = {};
  }

  /**
   * Starts the analyser.
   * @return {Promise} Resolves once the analyser is ready.
   */
  async start() {
    const p = this.private;
    if (!p.audioContext) {
      p.audioContext = new AudioContext();
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      p.analyser = p.audioContext.createAnalyser();
      p.buffer = new Float32Array(p.analyser.frequencyBinCount);
      const audioSource = p.audioContext.createMediaStreamSource(mediaStream);
      audioSource.connect(p.analyser);
    }
  }

  /**
   * Measures the current main frequency.
   * @return {number} [Hz].
   */
  getFrequency() {
    const p = this.private;
    if (!p.analyser) throw Error('PitchAnalyser has not started yet');
    p.analyser.getFloatFrequencyData(p.buffer);
    return calcMainFrequency(p.buffer, p.audioContext.sampleRate);
  }

  /**
   * Measures the current main frequency, and returns corresponding note info.
   * @return {object} Result object with the following fields:
   *  - frequency {number} - The main signal frequency [Hz].
   *  - note {string} - The name of closest note (e.g. A#4).
   *  - noteFrequency {number} - The `note` frequency [Hz].
   *  - centDeviation {number} - Difference between `frequency` and
   *    `noteFrequency` in cents (there are 100.0 cents between any
   *    neighboring notes).
   */
  getNote() {
    const frequency = this.getFrequency();
    const res = frequencyToNote(frequency);
    res.frequency = frequency;
    return res;
  }

  /**
   * Takes a series of pitch measurements inside the specified time interval,
   * and returns average values.
   * @param {number} from Probe start timestamp [ms].
   * @param {number} to Probe end timestamp [ms].
   * @param {object} [options] Optional. Additional options.
   * @param {number} [options.numSamples=5] Optional. Target number of sample
   *  measurements. The measurements will be spread uniformly within the probe
   *  interval, and if the number is too high, the probe will do as much
   *  measurements as possible (i.e. less than requested). Defaults 5.
   * @param {number} [options.subInterval=0.9] Optional. The first and last
   *  measurements will be offset inside [from; to] interval by the offset
   *  0.5 * (to - from) * (1 - subInterval), i.e. the actual sampling will be
   *  done within [from + offset, to - offset] interval. Defaults 0.9.
   * @return {Promise<object>}
   */
  async probeNote(from, to, options = {}) {
    const numSamples = options.numSamples || 5;
    const subInterval = options.subInterval || 0.9;
    const offset = 0.5 * (1.0 - subInterval) * (to - from);
    const timeStep = (to - from) / (numSamples - 1);
    const freqs = [];
    const delay = from + offset - time.now();
    if (delay > 0.0) await time.timer(delay);

    for (let i = 0; i < numSamples; i += 1) {
      freqs.push(this.getFrequency());
      if (time.now() > to) break;
      await time.timer(timeStep); // eslint-disable-line no-await-in-loop
    }

    let sumFreq = 0.0;
    let sumFreq2 = 0.0;
    for (let i = 0; i < freqs.length; i += 1) {
      const f = freqs[i];
      sumFreq2 += f * f;
      sumFreq += f;
    }
    const frequency = sumFreq / freqs.length;
    const res = frequencyToNote(frequency);
    res.frequency = frequency;

    const stdDev = Math.sqrt(sumFreq2 / freqs.length - frequency * frequency);
    const s1 = frequencyToSemitone(frequency);
    const s2 = frequencyToSemitone(frequency + stdDev);
    res.centFluctuation = 100 * (s2 - s1);
    return res;
  }

  /**
   * Stops the analyser and releases resources.
   * @return {Promise} Resolves once completed.
   */
  async stop() {
    const p = this.private;
    if (p.audioContext) {
      await p.audioContext.close();
      delete p.audioContext;
      delete p.analyser;
      delete p.buffer;
    }
  }
}
