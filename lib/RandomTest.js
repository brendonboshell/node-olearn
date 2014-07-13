var RandomTest,
    Classifier = require("./Classifier"),
    util = require("util"),
    runif = require("./random").runif;

RandomTest = function (featureWeights, ranges, rangeTypes, featureTypes) {
  var i;

  Classifier.apply(this);

  this.trueCounts = [];
  this.falseCounts = [];

  // Select a random feature
  this.feature = this.getRandomFeature(featureWeights);

  // if rangeTypes not specified, default to interval
  if (typeof rangeTypes === "undefined") {
    var rangeTypes = [];

    for (i = 0; i < ranges.length; i++) {
      rangeTypes[i] = "interval";
    }
  }

  // if featureTypes not specified, default to continuous
  if (typeof featureTypes === "undefined" || featureTypes.length == 0) {
    var featureTypes = [];

    for (i = 0; i < ranges.length; i++) {
      featureTypes[i] = "continuous";
    }
  }

  this.featureType = featureTypes[this.feature];

  // Select a random threshold value
  this.threshold = this.getRandomThreshold(ranges[this.feature], rangeTypes[this.feature]);
};

util.inherits(RandomTest, Classifier);

RandomTest.prototype.getRandomFeature = function (featureWeights) {
  var u,
      i,
      cumSum = 0;

  u = runif();

  for (i = 0; i < featureWeights.length; i++) {
    cumSum += featureWeights[i];

    if (cumSum > u) {
      return i;
    }
  }

  return (featureWeights.length - 1);
};

RandomTest.prototype.getRandomThreshold = function (range, rangeType) {
  var rnd,
      val;

  if (rangeType === "set") {
    return this.getRandomThresholdSet(range);
  }

  rnd = runif();
  val = rnd * (range[1] - range[0]) + range[0];

  return val;
};

RandomTest.prototype.getRandomThresholdSet = function (range) {
  var rnd,
      index;

  rnd = runif();
  index = Math.floor(rnd * range.length);

  return range[index];
};

RandomTest.prototype.evaluate = function (sample) {
  var outcome;

  if (this.featureType == "discrete") {
    outcome = (sample.features[this.feature] == this.threshold);
  } else {
    outcome = (sample.features[this.feature] > this.threshold)
  }
  
  if (outcome) {
    return true;
  } else {
    return false;
  }
};

RandomTest.prototype.update = function (sample) {
  var testOutcome,
      labelIndex;

  testOutcome = this.evaluate(sample);
  labelIndex = this.getLabelIndex(sample.label);

  // add label count, if new label
  if (typeof this.trueCounts[labelIndex] === "undefined") {
    this.trueCounts[labelIndex] = 0;
    this.falseCounts[labelIndex] = 0;
  }

  if (testOutcome === true) {
    this.trueCounts[labelIndex]++;
  } else {
    this.falseCounts[labelIndex]++;
  }
};

module.exports = RandomTest;
