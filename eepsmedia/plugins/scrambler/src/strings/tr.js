let strings={
  a:'this',
  b: 'this string has sequential subs: %@, %@',
  c: 'this string has positional subs: %@1, %@2, %@1, %@3'
}

function lookupString(stringID) {
  return strings[stringID] || stringID;
}
/**
 * Translates a string by referencing a hash of translated strings.
 * If the lookup fails, the string ID is used.
 * Arguments after the String ID are substituted for substitution tokens in
 * the looked up string.
 * Substitution tokens can have the form "%@" or "%@" followed by a single digit.
 * Substitution parameters with no digit are substituted sequentially.
 * So, tr('%@, %@, %@', 'one', 'two', 'three') returns 'one, two, three'.
 * Substitution parameters followed by a digit are substituted positionally.
 * So, tr('%@1, %@1, %@2', 'baa', 'black sheep') returns 'baa, baa, black sheep'.
 *
 * @param stringID {{string}} a string id
 * @param args an array of strings or variable sequence of strings
 * @returns {string}
 */
function tr(stringID, args) {
  function replacer(match) {
    if (match.length===2) {
      return (args && args[ix++]) || match;
    } else {
      return (args && args[match[2]-1]) || match;
    }
  }

  if (typeof args === 'string') {
    args = Array.from(arguments).slice(1);
  }

  let s = lookupString(stringID);
  let ix = 0;
  return s.replace(/%@[0-9]?/g, replacer);
}

console.assert(tr('a') === 'this', 'simple trans');
console.assert(tr('b', ['seq1', 'seq2']) === 'this string has sequential subs: seq1, seq2',
    'sequential subs');
console.assert(tr('b', 'seq1', 'seq2') === 'this string has sequential subs: seq1, seq2',
    'sequential subs from varargs');
console.assert(tr('c', ['pos1', 'pos2', 'pos3']) === 'this string has positional subs: pos1, pos2, pos1, pos3',
    'positional subs');
console.assert(tr('c', 'pos1', 'pos2', 'pos3') === 'this string has positional subs: pos1, pos2, pos1, pos3',
    'positional subs from varargs');
// test an unmatched string ID
console.assert(tr('d') === 'd', 'Unfound stringID returns stringID');
console.assert(tr('%@, %@, %@', 'one', 'two', 'three') === 'one, two, three', 'sequential replacement');
console.assert(tr('%@1, %@1, %@2', 'baa', 'black sheep') === 'baa, baa, black sheep', 'Positional replacement');
console.assert(tr('%@1, %@1, %@2') === '%@1, %@1, %@2', 'Missing properties are not replace');
console.assert(tr('%@1, %@1, %@2', 'baa') === 'baa, baa, %@2',
    'Missing properties are not replaced');
console.log('done');

