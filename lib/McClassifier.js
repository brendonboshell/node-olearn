var McClassifier,
    Classifier = require("./Classifier"),
    util = require("util");

McClassifier = function () {
  Classifier.apply(this);
  this.labelCounts = [];
};

util.inherits(McClassifier, Classifier);

McClassifier.prototype.update = function (sample) {
  var labelIndex;

  labelIndex = this.getLabelIndex(sample.label);

  if (typeof this.labelCounts[labelIndex] === "undefined") {
    this.labelCounts[labelIndex] = 0;
  }

  this.labelCounts[labelIndex]++;
};

McClassifier.prototype.predict = function (sample) {
  var i,
      prediction = null,
      max = -1;

  for (i = 0; i < this.labelCounts.length; i++) {
    if (this.labelCounts[i] > max) {
      max = this.labelCounts[i];
      prediction = this.getIndexLabel(i);
    }
  }

  return prediction;
}

module.exports = McClassifier;
