var Classifier = require("../lib/Classifier.js");

exports.testIndexNewLabel = function (test) {
  var classifier = new Classifier();

  test.strictEqual(classifier.getLabelIndex("UP"), 0,
    "first label should be index 0")
  test.done();
};

exports.testIndexRepeatLabel = function (test) {
  var classifier = new Classifier();

  classifier.getLabelIndex("UP");
  classifier.getLabelIndex("DOWN");
  test.strictEqual(classifier.getLabelIndex("DOWN"), 1,
    "repeat label should be index 1")
  test.done();
};

exports.testLabelValidIndex = function (test) {
  var classifier = new Classifier();

  classifier.getLabelIndex("UP"); // 0
  classifier.getLabelIndex("DOWN"); // 1
  test.strictEqual(classifier.getIndexLabel(1), "DOWN", "1 should be DOWN")
  test.done();
};

exports.testLabelInvalidIndex = function (test) {
  var classifier = new Classifier();

  classifier.getLabelIndex("UP"); // 0
  classifier.getLabelIndex("DOWN"); // 1
  test.strictEqual(classifier.getIndexLabel(2), null, "2 should be null")
  test.done();
};
