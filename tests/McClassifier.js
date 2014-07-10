var McClassifier = require("../lib/McClassifier.js"),
    samples;

samples = [
  { features: [1, 2], label: 1 },
  { features: [1, 2], label: 2 },
  { features: [1, 2], label: 2 },
  { features: [1, 2], label: "UP" },
  { features: [1, 2], label: "UP" },
  { features: [1, 2], label: "UP" }
];

exports.testUntrainedPred = function (test) {
  var mcClassifier = new McClassifier();

  test.strictEqual(mcClassifier.predict(samples[0]), null,
    "prediction for untrained classifier should be null");
  test.done();
};

exports.testUpdate = function (test) {
  var mcClassifier = new McClassifier();

  mcClassifier.update(samples[0]);
  test.deepEqual(mcClassifier.labelCounts, [1]);
  mcClassifier.update(samples[1]);
  test.deepEqual(mcClassifier.labelCounts, [1, 1]);
  mcClassifier.update(samples[2]);
  test.deepEqual(mcClassifier.labelCounts, [1, 2]);
  mcClassifier.update(samples[3]);
  test.deepEqual(mcClassifier.labelCounts, [1, 2, 1]);
  mcClassifier.update(samples[3]);
  test.deepEqual(mcClassifier.labelCounts, [1, 2, 2]);
  mcClassifier.update(samples[3]);
  test.deepEqual(mcClassifier.labelCounts, [1, 2, 3]);
  test.done();
};

exports.testPreds = function (test) {
  var mcClassifier = new McClassifier();

  mcClassifier.update(samples[0]);
  test.strictEqual(mcClassifier.predict(samples[0]), 1);
  mcClassifier.update(samples[1]);
  test.strictEqual(mcClassifier.predict(samples[0]), 1);
  mcClassifier.update(samples[2]);
  test.strictEqual(mcClassifier.predict(samples[0]), 2);
  mcClassifier.update(samples[3]);
  test.strictEqual(mcClassifier.predict(samples[0]), 2);
  mcClassifier.update(samples[4]);
  test.strictEqual(mcClassifier.predict(samples[0]), 2);
  mcClassifier.update(samples[5]);
  test.strictEqual(mcClassifier.predict(samples[0]), "UP");
  test.done();
};
