var EvaluatorNStep,
    Evaluator = require("./Evaluator.js"),
    util = require("util");

EvaluatorNStep = function (n) {
  this.n = n;
  this.window = [];
  this.windowPointer = 0;
};

util.inherits(EvaluatorNStep, Evaluator);

EvaluatorNStep.prototype.evaluate = function (classifier, sample) {
  var errorRate = 0,
      windowSize,
      i,
      prediction;

  // train with first sample in the window (Last Out)
  if (typeof this.window[this.windowPointer] !== "undefined") {
    classifier.update(this.window[this.windowPointer]);
  }

  // append next sample to the window
  this.window[this.windowPointer] = sample;

  // incremenet window pointer
  this.windowPointer = (this.windowPointer + 1) % this.n;

  // use classifier to make prediction
  windowSize = this.window.length;

  for (i = 0; i < windowSize; i++) {
    prediction = classifier.predict(this.window[i]);

    if (prediction !== this.window[i].label) {
      errorRate += 1 / windowSize;
    }
  }

  return errorRate;
};

module.exports = EvaluatorNStep;
