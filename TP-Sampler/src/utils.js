// fills an array from 0 to n
function fill(n) {
  var arr = Array.apply(null, {length: n}).map(Function.call, Number);
  return arr;
}

// shuffles an array in place
function shuffle(arr) {
  var j, x, i;
  for (i = arr.length - 1; i > 0; i--) {
    j = Math.floor(Math.random() * (i + 1));
    x = arr[i];
    arr[i] = arr[j];
    arr[j] = x;
  }
}

function parseSequence(seq, rangeWord) {
  // strip all spaces
  seq = seq.replace(/ /g, "");
  var m = new RegExp(`^(-?[\\d.]+|\\w)(-|${rangeWord})(-?[\\d.]+|\\w)$`,'g').exec(seq);
  if (!m || m.length < 4) {
    return null;
  }
  var v1 = m[1];
  var v2 = m[3];
  var f1 = parseFloat(v1);
  var f2 = parseFloat(v2);
  var arr;
  if (!isNaN(f1) && !isNaN(f2) && f1 !== f2) {
    var dec1 = getDecimalPlaces(v1);
    var dec2 = getDecimalPlaces(v2);
    var dec = Math.max(dec1, dec2);
    var multiplier = Math.pow(10, dec);
    var F1 = f1 * multiplier;
    var F2 = f2 * multiplier;
    arr = Array.apply(null, {length: Math.abs(F2-F1)+1}).map(function(value, index){
      var multipliedVal = f1 < f2 ? (F1 + index) : (F1 - index);
      return (multipliedVal/multiplier).toFixed(dec);
    });
  } else if (bothStringsWithSameCaps(v1, v2) && v1 !== v2) {
    var c1 = v1.charCodeAt(0);
    var c2 = v2.charCodeAt(0);
    var increasing = c2 > c1;
    arr = Array.apply(null, {length: Math.abs(c1-c2)+1}).map(function(value, index){
      var nextChar = increasing ? (c1 + index) : (c1 - index);
      return String.fromCharCode(nextChar);
    });
  }
  return arr;
}

function getDecimalPlaces(str) {
  var i = str.indexOf(".");
  if (i < 0) {
    return 0;
  }
  return str.length - i - 1;
}

function bothStringsWithSameCaps(s1, s2) {
  if (typeof s1 !== "string" || typeof s2 !== "string") return false;
  var isCaps1 = s1 === s1.toUpperCase();
  var isCaps2 = s2 === s2.toUpperCase();
  return isCaps1 === isCaps2;
}

function parseSpecifier(spec, rangeWord) {
  rangeWord = rangeWord || 'to';
  var list = spec.split(',');
  var arr = [];
  var seq;
  list.forEach(function (item) {
    if (new RegExp(`^.+(-| ${rangeWord} ).+`).test(item)) {
      seq = parseSequence(item, rangeWord);
      if (seq) {
        arr = arr.concat(seq);
      }
    } else {
      arr.push(item);
    }
  });
  return arr.length?arr:null;
}

function testParsing() {
  var equals = function(arr1, arr2) {
    if (arr1 === null || arr2 === null) return true;
    if (arr1.length !== arr2.length) return false;
    for (var i = 0, ii = arr1.length; i < ii; i++) {
      if (arr1[i] !== arr2[i]) return false;
    }
    return true;
  };
  // invalid sequences
  console.assert(equals(parseSpecifier("ab to bc"), null));
  console.assert(equals(parseSpecifier("-a to b"), null));
  console.assert(equals(parseSpecifier("a to -b"), null));
  console.assert(equals(parseSpecifier("1- to 2"), null));
  console.assert(equals(parseSpecifier("1 to 2-"), null));
  console.assert(equals(parseSpecifier("1 to a"), null));
  console.assert(equals(parseSpecifier("A to 2"), null));
  console.assert(equals(parseSpecifier("a to A"), null));

  // numbers
  console.assert(equals(parseSpecifier("0 to 2"), ["0", "1", "2"]));
  console.assert(equals(parseSpecifier("0 - 2"),  ["0", "1", "2"]));
  console.assert(equals(parseSpecifier("0.0 to 0.3"), ["0.0", "0.1", "0.2", "0.3"]));
  console.assert(equals(parseSpecifier("0 to 0.02"), ["0.00", "0.01", "0.02"]));
  console.assert(equals(parseSpecifier("-1 - 1"), ["-1", "0", "1"]));
  console.assert(equals(parseSpecifier("0 - -2"), ["0", "-1", "-2"]));

  // strings
  console.assert(equals(parseSpecifier("a to c"), ["a", "b", "c"]));
  console.assert(equals(parseSpecifier("a-c"),    ["a", "b", "c"]));
  console.assert(equals(parseSpecifier("A to C"), ["A", "B", "C"]));
  console.assert(equals(parseSpecifier("D to B"), ["D", "C", "B"]));

  // lists
  console.assert(equals(parseSpecifier('a,a,a,b'), ['a','a','a','b']));

  // combos
  console.assert(equals(parseSpecifier('cat,dog,X-Z,fish'), ['cat','dog','X','Y','Z','fish']));
}

// run assertion test on module load
//testParsing();

function calcPct(a, b) {
  return Math.round(100 * (a / b));
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a, b) {
    return (a * b) / gcd(a, b);
}

function percentageToFraction(percentage) {
  const numerator = percentage;
  const denominator = 100;
  const commonFactor = gcd(numerator, denominator);
  return [numerator / commonFactor, denominator / commonFactor];
}

function findCommonDenominator(percentages) {
  const fractions = percentages.map((p) => percentageToFraction(p));
  const denominators = fractions.map((f) => { return f[1]});
  const lcdDenominator = denominators.reduce((accumulator, currentDenominator) => lcm(accumulator, currentDenominator));
  return lcdDenominator;
}

function findEquivNum(n, lcd) {
  return (n * (lcd / 100));
}

function fewestNumbersToSum (target, count) {
  const result = [];

  // distribute the target equally among the count of integers
  const initialDistribution = Math.floor(target / count);

  // adjust the initial distribution to ensure the sum matches the target
  let sum = initialDistribution * count;
  for (let i = 0; i < count; i++) {
    result.push(initialDistribution);
  }

  // distribute the remaining difference to the numbers
  let remainder = target - sum;
  let i = 0;
  while (remainder > 0) {
    result[i % count]++;
    remainder--;
    i++;
  }

  return result;
}

function calculateWedgePercentage(cx, cy, x1, y1, x2, y2) {
  // calculate angles in radians
  var angle1 = Math.atan2(y1 - cy, x1 - cx);
  var angle2 = Math.atan2(y2 - cy, x2 - cx);

  // calculate the angle between the two points
  var angle = angle2 - angle1;

  // handle cases where the angle crosses the boundary between -π and π
  if (angle < 0) {
      angle += 2 * Math.PI;
  }

  // calculate the percentage of the circle's circumference
  var percentage = (angle / (2 * Math.PI)) * 100;

  return percentage;
}


export {
  fill,
  shuffle,
  parseSequence,
  parseSpecifier,
  calcPct,
  findCommonDenominator,
  findEquivNum,
  fewestNumbersToSum,
  calculateWedgePercentage
};
