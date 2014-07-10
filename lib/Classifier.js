var Classifier;

Classifier = function () {
  this.labelIndices = {};
  this.indexLabels = [];
};

Classifier.prototype.getLabelIndex = function (label) {
  var labelIndex;

  if (typeof this.labelIndices[label] === "undefined") {
    labelIndex = this.indexLabels.length;
    this.labelIndices[label] = labelIndex;
    this.indexLabels[labelIndex] = label;
  } else {
    labelIndex = this.labelIndices[label];
  }

  return labelIndex;
};

Classifier.prototype.getIndexLabel = function (index) {
  var indexLabel;

  if (typeof this.indexLabels[index] !== "undefined") {
    return this.indexLabels[index];
  }

  return null;
};

Classifier.prototype.update = function () {

};

Classifier.prototype.predict = function () {

};

Classifier.prototype.reset = function () {

};

module.exports = Classifier;
