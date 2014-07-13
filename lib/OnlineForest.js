var OnlineForest,
    Classifier = require("./Classifier"),
    util = require("util"),
    OnlineNode = require("./OnlineNode"),
    random = require("./random"),
    rpois = random.rpois,
    runif = random.runif;

OnlineForest = function (options) {
  var i;

  Classifier.apply(this);
  this.numTrees = options.numTrees || 100;
  this.trees = [];

  for (i = 0; i < this.numTrees; i++) {
    this.trees.push(new OnlineNode(options));
  }
};

util.inherits(OnlineForest, Classifier);

OnlineForest.prototype.update = function (sample) {
  var i,
      j,
      poisObs;
      
  this.getLabelIndex(sample.label);

  // Update each tree in the ensemble Poisson(1) times
  for (i = 0; i < this.numTrees; i++) {
    poisObs = rpois(1);

    for (j = 0; j < poisObs; j++) {
      this.trees[i].update(sample);
    }
  }
};

OnlineForest.prototype.predict = function (sample) {
  var i,
      j,
      confidence = {},
      treeConfidence,
      indexLabel,
      max = -1,
      maxLabel;

  for (j = 0; j < this.indexLabels.length; j++) {
    confidence[this.indexLabels[j]] = 0;
  }

  // Get confidence estimates from each tree in the ensemble
  for (i = 0; i < this.numTrees; i++) {
    treeConfidence = this.trees[i].predict(sample).confidence;

    for (j = 0; j < this.indexLabels.length; j++) {
      indexLabel = this.indexLabels[j];
      confidence[indexLabel] += treeConfidence[indexLabel] / this.numTrees;
    }
  }

  // select label with max confidence
  for (j = 0; j < this.indexLabels.length; j++) {
    indexLabel = this.indexLabels[j];
    if (confidence[indexLabel] > max) {
      max = confidence[indexLabel];
      maxLabel = indexLabel;
    }
  }

  return {
    confidence: confidence,
    label: maxLabel
  };
};

module.exports = OnlineForest;
