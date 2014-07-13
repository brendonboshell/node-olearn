# Olearn

Olearn is a Node.js module implementing the online random forests algorithm,
as specified by [Saffari et al \(2009\)](http://www.ymer.org/papers/files/2009-OnlineRandomForests.pdf),
with some minor adaptations.

At some point, I hope to add more algorithms to this library.

Please note that the current version may be very buggy, so only use for experimentation.

## Example usage

### Initialise a forest
```javascript
var OnlineForest = require("olearn").OnlineForest,
    of;

of = new OnlineForest({
  numTrees: 10,  // number of trees in the forest
  numTests: 20,  // number of random tests to create at each node
  maxDepth: 6,  // maximum depth of any node
  splitThreshold: 0.01,  // information gain threshold to split a node
  minSeen: 1000,  // min samples before splitting a node
  rangeTrialNum: 1000,  // number of samples to observe to determine feature range.,
  featureTypes: ["continuous", "continuous", "discrete"]  // either continous (numeric) or discrete
});
```

If the feature range is known in advance, set `rangeTrialNum: 0` and specify `ranges` and `rangeTypes`:

```javascript
ranges: [[-10, 10], [-10, 10], ["london", "glasgow", ...]],
rangeTypes: ["interval", "interval", "set"]
```

### Update (train) the forest
```javascript
of.update({
    features: [5, 2, "london"],
    label: "hot"
});
of.update({
    features: [-1, -5, "glasgow"],
    label: "cold"
});
```

(You'll need many more samples than this!)

### Make a prediction

```javascript
of.predict({
    features: [3, 5, "manchester"]
})
```

Example output:

```javascript
{
    confidence: {"hot": 0.4, "cold": 0.6},
    label: "cold"
}
```
