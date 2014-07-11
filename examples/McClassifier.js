// Demonstration of a Majority Class classifier
// Not a useful classifier, but gives rough lower bound on training time.

var McClassifier = require("../lib/McClassifier.js"),
    mcClassifier,
    samples,
    i,
    sample,
    startTime,
    getTimestamp,
    n = 1000000;

mcClassifier = new McClassifier();

// Generate some random samples
samples = [];
startTime = new Date().getTime();

for (i = 0; i < n; i++) {
  if (Math.random() < 0.7) {
    // class 0
    sample = {
      features: [0],
      label: 0
    };
  } else {
    // class 1
    sample = {
      features: [1],
      label: 1
    };
  }

  samples.push(sample);
}

console.log("Generation took " + (new Date().getTime() - startTime) / 1000 + "secs")

// Train classifier
startTime = new Date().getTime();

for (i = 0; i < n; i++) {
  mcClassifier.update(samples[i]);
}

console.log("Training took " + (new Date().getTime() - startTime) / 1000 + "secs")
console.log(mcClassifier.labelCounts);
