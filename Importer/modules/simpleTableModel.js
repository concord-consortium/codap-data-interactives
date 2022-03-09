/**
 * Apply a simple table model to locate and return the upper leftmost table in
 * the array.
 *
 * The simple table model:
 *   Entirely blank rows or Entirely blank columns are not a part of any table
 *   and separate tables.
 *
 *   A simple tables either a single column of data or has multiple columns.
 *   If the former,
 *     * the header row is assumed to be the first non-blank row, and
 *     * the subsequent rows until the first blank row or the end of the table are data rows.
 *   If the latter:
 *   * It may have one or more title rows, each of which has exactly on non-empty cell.
 *   * It may have exactly one header row following the title rows. The header
 *     is expected to correspond in width with the maximum row width.
 *   * All the rows after the header row are data rows.
 *
 * @param dataArray {[[string|number|Date]]}
 * @return {[[string|number|Date]]} An array consisting of the upper leftmost
 * table in the dataArray ignoring title lines
 */
function extractFirstTable(dataArray) {
  let dataArrayWidth = _findArrayWidth(dataArray);
  let leftIx = _findFirstNonEmptyColumn(dataArray, dataArrayWidth);
  // rightIx is the index of the first blank column _after_ the data
  let rightIx = _findTableRight(dataArray, leftIx, dataArrayWidth);
  let topIx, bottomIx;
  if (rightIx <=leftIx) {
    return [];
  }
  if (rightIx - leftIx === 1) {
    // handle single column special case
    topIx = dataArray.findIndex(row => !_isBlank(row[leftIx]));
  }
  else {
    topIx = _findFirstNonTitleRow(dataArray, leftIx, rightIx);
  }
  bottomIx = _findTableEnd(dataArray, leftIx, rightIx, topIx);
  return _extractTable(dataArray, leftIx, rightIx, topIx, bottomIx);
}

function _isBlank(v) {
  return v == null || v === '';
}
function _isEmptyColumn(dataArray, colIx) {
  return !dataArray.find(row => (!_isBlank(row[colIx])));
}

function _isEmptyRow(row, leftIx, rightIx) {
  let ix = leftIx;
  let rIx = Math.min(rightIx, row.length);
  while (ix < rIx) {
    if (!_isBlank(row[ix])) {return true;}
  }
  return false;
}

function _cellCount(row, leftIx, rightIx) {
  let count = 0;
  let ix = leftIx;
  let rIx = Math.min(rightIx, row.length);
  while (ix < rIx) {
    if (!_isBlank(row[ix])) { count += 1; }
    ix += 1;
  }
  return count;
}

function _findFirstNonEmptyColumn(dataArray, tableWidth) {
  let ix = 0;
  while (ix < tableWidth && (_isEmptyColumn(dataArray, ix))) {
    ix += 1;
  }
  return ix;
}

function _findArrayWidth(d) {
  return d.reduce(function(max, row) {return Math.max(max, row.length)}, 0);
}

function _findTableRight(dataArray, leftIx, width) {
  let ix = leftIx;
  while (ix < width && (!_isEmptyColumn(dataArray, ix))) {
    ix += 1;
  }
  return ix;
}

function _findFirstNonTitleRow(dataArray, leftIx, rightIx) {
  return dataArray.findIndex(row => _cellCount(row, leftIx, rightIx) > 1)
}

function _findTableEnd(dataArray, leftIx, rightIx, topIx) {
  let end = dataArray.findIndex((row, rowIndex) => (rowIndex>topIx && !_cellCount(row, leftIx, rightIx)));
  if (end < 0) {
    end = dataArray.length;
  }
  return end;
}

function _extractTable(dataArray, leftIx, rightIx, topIx, bottomIx) {
  let newArray = [];
  if (leftIx < rightIx && topIx < bottomIx) {

    for (let ix = topIx; ix < bottomIx; ix += 1) {
      let newRow = [];
      for (let jx = leftIx; jx < rightIx; jx += 1) {
        newRow.push(dataArray[ix][jx]);
      }
      newArray.push(newRow);
    }
  }
  return newArray;
}

export {extractFirstTable};
