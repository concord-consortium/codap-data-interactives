// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2019 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
/**
 * Fetches a URL and extracts the first HTML table it finds into a javascript array of arrays.
 * @param url
 * @return {Promise}
 */
function fetchAndParseURL(url) {
  return fetch(url)
      .then(function (resp) {
        return new Promise(function (resolve, reject){
          if (resp.ok) {
            resp.text().then(function (data) {
              let table = extractHTMLTable(data);
              // console.log('made table: ' + (tab && tab.length));
              resolve(table);
            });
          }
          else {
            reject(resp.statusText);
          }
        });
      });
}

/**
 * Reads an HTML file and extracts the first table it finds into a javascript table
 * @param file
 * @return {Promise}
 */
function readAndParseFile(file) {
  return new Promise(function (resolve, reject) {
    function handleAbnormal() {
      reject("Abort or error on file read.");
    }
    function handleRead() {
      let data = extractHTMLTable(this.result);
      resolve(data)
    }
    let reader = new FileReader ();
    reader.onabort = handleAbnormal;
    reader.onerror = handleAbnormal;
    reader.onload = handleRead;
    return reader.readAsText(file);
  });
}

/**
 * Compose a resource description to display in a text box.
 * @param src
 * @param time
 * @return {string}
 */
function composeResourceDescription(src, time) {
  return `source: ${src}\nimported: ${time.toLocaleString()}`
}

function getTableStats(data) {
  return data && data.reduce(function (stats, row) {
        stats.maxWidth = Math.max(stats.maxWidth, row.length);
        stats.minWidth = Math.min(stats.minWidth, row.length);
        return stats;
      },
      {maxWidth: 0, minWidth: Number.MAX_SAFE_INTEGER, numberOfRows: data.length}
  );
}

function findOrCreateAttributeNames(dataSet) {
  let table = dataSet.table;
  let tableStats = getTableStats(table);
  let attrs = [];
  if (tableStats) {
    if (dataSet.firstRowIsAttrList && tableStats.numberOfRows > 0) {
      attrs = table[0];
      dataSet.dataStartingRow = 1;
    } else {
      dataSet.dataStartingRow = 0;
      for (let i = 0; i < tableStats.maxWidth; i++) {
        attrs[i] = dataSet.defaultAttrName + i;
      }
    }
  }
  dataSet.attributeNames = attrs;
}

function extractHTMLTable(htmlText) {
  let el = document.createElement('div');
  el.innerHTML = htmlText;
  let tableEl = el.querySelector('table');
  if (tableEl) {
    let table = [];
    let tableRowEls = tableEl.rows;
    for (let ix = tableRowEls.length - 1; ix >= 0 ; ix -= 1) {
      let rowEl = tableRowEls[ix];
      let cells = rowEl.cells;
      let row = [];
      table[ix] = row;
      for (let jx = cells.length - 1; jx >= 0; jx -= 1) {
        let cellEl = cells[jx];
        let colSpan = Number(cellEl.colSpan);
        let rowSpan = Number(cellEl.rowSpan);
        let cellText = cellEl.innerText.trim();
        if (colSpan>1 || rowSpan>1) {
          for (let rowX = 0; rowX < Math.min(rowSpan, tableRowEls.length-ix); rowX += 1) {
            for (let colX = 0; colX < colSpan; colX++) {
              if (rowX || colX) {
                table[ix+rowX].splice(jx, 0, cellText);
              } else {
                row[jx] = cellText;
              }
            }
          }
        }
        else {
          row[jx] = cellText;
        }
      }
    }
    return table;
  }
}

/**
 * Retrieve data in whatever form provided and convert to a javascript table
 * @return {Promise}
 */
async function retrieveData(config) {
  let dataSet = {
    firstRowIsAttrList: true,
    defaultAttrName: 'attr'
  };
  let importDate = new Date();
  if (config.url) {
    dataSet.resourceDescription = composeResourceDescription(config.url, importDate);
    dataSet.table = await fetchAndParseURL(config.url);
    dataSet.sourceType = 'url';
  } else if (config.file) {
    dataSet.resourceDescription = composeResourceDescription(config.file, importDate);
    dataSet.table = await readAndParseFile(config.file);
    dataSet.sourceType = 'file';
  } else if (config.text) {
    dataSet.resourceDescription = composeResourceDescription('clipboard html',
        importDate);
    dataSet.table = await Promise.resolve(extractHTMLTable(config.text));
    dataSet.sourceType = 'text';
  }
  findOrCreateAttributeNames(dataSet);
  return dataSet;
}

export {
  retrieveData
}