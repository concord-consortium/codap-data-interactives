define(function() {

  function parseSequence(seq) {
    // strip all spaces
    seq = seq.replace(/ /g, "");
    var m = /^(-?[\d\.]+|\w)(-|to)(-?[\d\.]+|\w)$/g.exec(seq);
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
    console.assert(equals(parseSequence("ab to bc"), null));
    console.assert(equals(parseSequence("-a to b"), null));
    console.assert(equals(parseSequence("a to -b"), null));
    console.assert(equals(parseSequence("1- to 2"), null));
    console.assert(equals(parseSequence("1 to 2-"), null));
    console.assert(equals(parseSequence("1 to a"), null));
    console.assert(equals(parseSequence("A to 2"), null));
    console.assert(equals(parseSequence("a to A"), null));

    // numbers
    console.assert(equals(parseSequence("0 to 2"), ["0", "1", "2"]));
    console.assert(equals(parseSequence("0 - 2"),  ["0", "1", "2"]));
    console.assert(equals(parseSequence("0.0 to 0.3"), ["0.0", "0.1", "0.2", "0.3"]));
    console.assert(equals(parseSequence("0 to 0.02"), ["0.00", "0.01", "0.02"]));
    console.assert(equals(parseSequence("-1 - 1"), ["-1", "0", "1"]));
    console.assert(equals(parseSequence("0 - -2"), ["0", "-1", "-2"]));

    // strings
    console.assert(equals(parseSequence("a to c"), ["a", "b", "c"]));
    console.assert(equals(parseSequence("a-c"),    ["a", "b", "c"]));
    console.assert(equals(parseSequence("A to C"), ["A", "B", "C"]));
    console.assert(equals(parseSequence("D to B"), ["D", "C", "B"]));
  }

  // run assertion test on module load
  testParsing();

  return {
    parseSequence: parseSequence
  };
});
