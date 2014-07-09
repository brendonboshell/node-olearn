var Classifier = require("../lib/Classifier.js"),
    util = require("util"),
    EvaluatorNStep = require("../lib/EvaluatorNStep.js"),
    buildMcClassifier,
    samples;

// build basic majority class classifier so we can check Evaluator
// works as expected
buildMcClassifier = function () {
  var McClassifier;

  McClassifier = function () {
    this.classCounts = [];
    this.classIndices = {};
    this.indexClasses = [];
  };

  util.inherits(McClassifier, Classifier);

  McClassifier.prototype.update = function (sample) {
    var classIndex;

    if (typeof this.classIndices[sample.label] == "undefined") {
      this.classIndices[sample.label] = this.classCounts.length;
      this.indexClasses[this.classCounts.length] = sample.label;
      this.classCounts[this.classCounts.length] = 0;
    }

    classIndex = this.classIndices[sample.label];
    this.classCounts[classIndex]++;
  };

  McClassifier.prototype.predict = function (sample) {
    var i,
        prediction,
        max = -1;

    if (!this.classCounts) {
      return null;
    };

    for (i = 0; i < this.classCounts.length; i++) {
      if (this.classCounts[i] > max) {
        max = this.classCounts[i];
        prediction = this.indexClasses[i];
      }
    }

    return prediction;
  };

  return (new McClassifier());
};

samples = [
  {
    features: [3, 2, 1],
    label: 1
  },
  {
    features: [6, 5, 4],
    label: 1
  },
  {
    features: [9, 8, 7],
    label: 2
  },
  {
    features: [12, 11, 10],
    label: 2
  },
  {
    features: [15, 11, 10],
    label: 2
  },
  {
    features: [15, 11, 10],
    label: 2
  },
  {
    features: [18, 17, 16],
    label: 1
  }
];

// Ensure error rates for 1 step ahread are correct.
exports.testError1Step = function(test) {
  var mcClassifier,
      evaluatorNStep;

  mcClassifier = buildMcClassifier();
  evaluatorNStep = new EvaluatorNStep(1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[0]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[1]), 0);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[2]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[3]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[4]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[5]), 0);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[6]), 1);
  test.done();
};

// Ensure error rates for 2 step ahread are correct.
exports.testError2Step = function(test) {
  var mcClassifier,
      evaluatorNStep;

  mcClassifier = buildMcClassifier();
  evaluatorNStep = new EvaluatorNStep(2);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[0]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[1]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[2]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[3]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[4]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[5]), 1);
  test.strictEqual(evaluatorNStep.evaluate(mcClassifier, samples[6]), 0.5);
  test.done();
};
