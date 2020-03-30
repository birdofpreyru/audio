// TODO: Make this code properly isomorphic?

/* global window, navigator */

const detectAudioContext = () => {
  // Safari still needs a prefix for this feature
  window.AudioContext = window.AudioContext || window.webkitAudioContext;

  if (window.AudioContext) return new window.AudioContext();

  return false;
};

const mediaPromise = (constraints) => new Promise((resolve, reject) => {
  navigator.getUserMedia(constraints, resolve, reject);
});

const detectGetUserMedia = () => {
  navigator.getUserMedia = navigator.getUserMedia
    || navigator.webkitGetUserMedia
    || navigator.mozGetUserMedia;

  if ((navigator.mediaDevices && navigator.mediaDevices.getUserMedia) || navigator.getUserMedia) {
    return navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
      : mediaPromise;
  }

  return false;
};

module.exports = {
  detectAudioContext,
  detectGetUserMedia,
};
