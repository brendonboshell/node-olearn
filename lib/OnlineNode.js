var OnlineNode,
    Classifier = require("./Classifier"),
    util = require("util"),
    RandomTest = require("./RandomTest");

OnlineNode = function (options, indexLabels, parentStats) {
  var i,
      j,
      index;

  Classifier.apply(this);
  this.isLeaf = true;
  this.test = null;
  this.trueBranch = null;
  this.falseBranch = null;
  this.numSeen = 0;
  this.tests = [];
  this.numTests = options.numTests || 20;
  this.featureWeights = options.featureWeights || [];
  this.ranges = options.ranges || [];
  this.rangeTypes = options.rangeTypes || [];
  this.indexCounts = [];
  this.depth = options.depth || 0;
  this.maxDepth = options.maxDepth || 20;
  this.featureTypes = options.featureTypes || [];

  if (typeof options["splitThreshold"] !== "undefined") {
    this.splitThreshold = options.splitThreshold;
  } else {
    this.splitThreshold = 0.05;
  }

  if (typeof options["minSeen"] !== "undefined") {
    this.minSeen = options.minSeen;
  } else {
    this.minSeen = 100;
  }

  if (typeof options["rangeTrialNum"] !== "undefined") {
    // run a trial to get estimate of feature values from incoming data.
    this.rangeTrialNum = options.rangeTrialNum;
  } else {
    if (this.ranges.length) {
      // feature ranges provided => no need to get them from incoming data.
      this.rangeTrialNum = 0;
    } else {
      // we know nothing about the data => get ranges from incoming data.
      this.rangeTrialNum = 100;
    }
  }

  // prepopulate label counts using counts from the parent node
  if (typeof parentStats !== "undefined") {
    for (i = 0; i < parentStats.length; i++) {
      index = this.getLabelIndex(indexLabels[i]);
      this.indexCounts[index] = parentStats[i];
    }
  }

  // minSeen is in additional to the range trial num seen.
  this.minSeen = this.minSeen + this.rangeTrialNum;

  // options that are passed down to branched-off nodes
  // TODO featureWeights, ranges, rangeTypes
  this.childOptions = {
    numTests: this.numTests,
    depth: (this.depth + 1),
    maxDepth: this.maxDepth,
    splitThreshold: this.splitThreshold,
    minSeen: this.minSeen,
    rangeTrialNum: this.rangeTrialNum,
    ranges: [],
    rangeTypes: [],
    featureTypes: []
  };

  for (i = 0; i < this.ranges.length; i++) {
    this.childOptions.ranges[i] = [];
    this.childOptions.rangeTypes[i] = this.rangeTypes[i];

    for (j = 0; j < this.ranges[i].length; j++) {
      this.childOptions.ranges[i][j] = this.ranges[i][j];
    }
  }

  for (i = 0; i < this.featureTypes.length; i++) {
    this.childOptions.featureTypes[i] = this.featureTypes[i];
  }

  if (this.rangeTrialNum == 0) {
    this.generateTests();
  }
};

util.inherits(OnlineNode, Classifier);

OnlineNode.prototype.generateTests = function () {
  var i,
      weight;

  if (!this.featureWeights.length) {
    // assume uniform weighting
    weight = 1 / this.ranges.length;

    for (i = 0; i < this.ranges.length; i++) {
      this.featureWeights[i] = weight;
    }
  }

  this.tests = [];

  for (i = 0; i < this.numTests; i++) {
    this.tests.push(new RandomTest(
      this.featureWeights,
      this.ranges,
      this.rangeTypes,
      this.featureTypes
    ));
  }

  // we no longer need range data => this could be quite a lot
  // of data being stored, so encourage garbage collection!
  delete this.ranges;
  delete this.featureTypes;
};

OnlineNode.prototype.updateRange = function (sample) {
  var i;

  for (i = 0; i < sample.features.length; i++) {
    if (typeof this.ranges[i] === "undefined") {
      this.ranges[i] = [];
    }

    this.ranges[i].push(sample.features[i]);
    this.rangeTypes[i] = "set";
  }
};

OnlineNode.prototype.update = function (sample) {
  var index,
      bestTest;

  if (this.numSeen < this.rangeTrialNum) {
    this.updateRange(sample);

    if (this.numSeen === this.rangeTrialNum - 1) {
      // last sample in range window seen => create the random tests
      this.generateTests();
    }
  }

  if (!this.isLeaf) {
    // node splits, update true or false branch.
    if (this.test.evaluate(sample)) {
      return this.trueBranch.update(sample);
    } else {
      return this.falseBranch.update(sample);
    }
  }

  // update label statistics
  index = this.getLabelIndex(sample.label);
  this.updateIndexCounts(index);

  // update tests
  this.updateTests(sample);
  this.numSeen++;

  // split criterion
  if (this.depth < this.maxDepth && this.numSeen >= this.minSeen) {
    bestTest = this.getBestTest();
    //console.log(bestTest);

    if (bestTest.score > this.splitThreshold) {
      this.split(bestTest.test);
    }
  }
};

OnlineNode.prototype.updateIndexCounts = function (index) {
  var i;

  if (typeof this.indexCounts[index] === "undefined") {
    this.indexCounts[index] = 0;
  }

  this.indexCounts[index]++;
};

OnlineNode.prototype.updateTests = function (sample) {
  for (i = 0; i < this.tests.length; i++) {
    this.tests[i].update(sample);
  }
};

OnlineNode.prototype.getBestTest = function () {
  var maxScore = -1,
      testScore,
      bestTest,
      i;

  for (i = 0; i < this.tests.length; i++) {
    testScore = this.scoreTest(this.tests[i]);

    if (testScore > maxScore) {
      maxScore = testScore;
      bestTest = this.tests[i];
    }
  }

  return {
    score: maxScore,
    test: bestTest
  };
};

// TODO: this function needs review/unit testing!
// TODO I don't think this works properly -- just replace with IG?
OnlineNode.prototype.scoreTest = function (test) {
  var trueTotal = 0,
      falseTotal = 0,
      entropyBefore = 0,
      entropyTrue = 0,
      entropyFalse = 0,
      i,
      p;

  for (i = 0; i < test.trueCounts.length; i++) {
    trueTotal += test.trueCounts[i];
    falseTotal += test.falseCounts[i];
  }

  for (i = 0; i < test.trueCounts.length; i++) {
    p = (test.trueCounts[i] + test.falseCounts[i]) / (trueTotal + falseTotal);
    entropyBefore -= p * Math.log(p);

    if (trueTotal > 0) {
      p = test.trueCounts[i] / trueTotal;

      if (p > 0) {
        entropyTrue -= p * Math.log(p);
      }
    }

    if (falseTotal > 0) {
      p = test.falseCounts[i] / falseTotal;

      if (p > 0) {
        entropyFalse -= p * Math.log(p);
      }
    }
  }

  return (entropyBefore - (trueTotal * entropyTrue + falseTotal * entropyFalse) / (trueTotal + falseTotal));

  /*
  for (i = 0; i < test.trueCounts.length; i++) {
    p = (test.trueCounts[i] + test.falseCounts[i]) / (trueTotal + falseTotal);
    giniNull += p * (1 - p);

    if (trueTotal > 0) {
      p = test.trueCounts[i] / trueTotal;
      giniTrue += p * (1 - p);
    }

    if (falseTotal > 0) {
      p = test.falseCounts[i] / falseTotal;
      giniFalse += p * (1 - p);
    }
  }

  return giniNull - (trueTotal * giniTrue + falseTotal * giniFalse) / (trueTotal + falseTotal);*/
};

OnlineNode.prototype.split = function (test) {
  this.isLeaf = false;
  this.test = test;
  this.trueBranch = new OnlineNode(this.childOptions, this.indexLabels, test.trueCounts);
  this.falseBranch = new OnlineNode(this.childOptions, this.indexLabels, test.falseCounts);
  //console.log("Split at depth " + this.depth);
  //console.log(test);
  //console.log(this.scoreTest(test));

  // Once we split, forget data about all other candidate tests
  delete this.tests;
};

OnlineNode.prototype.predict = function (sample) {
  var confidence = {},
      max = -1,
      maxLabel,
      label,
      total = 0;

  if (!this.isLeaf) {
    // node splits, update true or false branch.
    if (this.test.evaluate(sample)) {
      return this.trueBranch.predict(sample);
    } else {
      return this.falseBranch.predict(sample);
    }
  }

  for (i = 0; i < this.indexCounts.length; i++) {
    total += this.indexCounts[i];
  }

  // select greatest index
  for (i = 0; i < this.indexCounts.length; i++) {
    label = this.getIndexLabel(i);
    confidence[label] = this.indexCounts[i] / total;

    if (this.indexCounts[i] > max) {
      max = this.indexCounts[i];
      maxLabel = label;
    }
  }

  return {
    confidence: confidence,
    label: maxLabel
  }
};

module.exports = OnlineNode;
