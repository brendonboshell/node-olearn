var rpois,
    runif,
    Random = require("random-js"),
    random = new Random(Random.engines.mt19937().autoSeed());

var value = random.integer(1, 100);

rpois = function (lambda) {
  var cumSum = 0,
      n = -1;

  while (cumSum < 1) {
    cumSum += - (1 / lambda) * Math.log(runif());
    n++;
  }

  return n;
};

runif = function () {
  return random.real(0, 1, false);
};

module.exports.rpois = rpois;
module.exports.runif = runif;
