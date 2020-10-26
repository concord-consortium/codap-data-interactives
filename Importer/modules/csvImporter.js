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
/*global Papa*/
/**
 * Fetches a URL and parses as a CSV String
 * @param url
 * @return {Promise}
 */
function fetchAndParseURL(url) {
  return fetch(url)
      .then(
          function (resp) {
            return new Promise(function (resolve, reject){
              if (resp.ok) {
                resp.text().then(function (data) {
                  let table = parseCSVString(data);
                  // console.log('made table: ' + (tab && tab.length));
                  resolve(table);
                });
              } else {
                reject(resp.statusText);
              }
            });
          },
          function (msg) {
            throw new Error(`Network or server configuration: ${msg}`);
          });
}

/**
 * Fetches the contents of a file and parses as a CSV String
 * @param file
 * @return {Promise}
 */
function readAndParseFile(file) {
  return new Promise(function (resolve, reject) {
    function handleAbnormal() {
      reject("Abort or error on file read.");
    }
    function handleRead() {
      let data = parseCSVString(this.result);
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
  // noinspection SpellCheckingInspection
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
  if (!table) {
    return;
  }
  let tableStats = getTableStats(table);
  let attrs = [];
  if (dataSet.firstRowIsAttrList && tableStats.numberOfRows > 0) {
    attrs = table[0];
    dataSet.dataStartingRow = 1;
  } else {
    dataSet.dataStartingRow = 0;
    for (let i = 0; i < tableStats.maxWidth; i++) {
      attrs[i] = dataSet.defaultAttrName + i;
    }
  }
  dataSet.attributeNames = attrs.map(function (attr) { return attr?attr.trim():'';});
}

/**
 * Retrieve data in whatever form provided and parse as a CSV String
 * @return {Promise}
 */
async function retrieveData(config) {
  let dataSet = {
    firstRowIsAttrList: true,
    defaultAttrName: 'attr'
  };
  let importDate = new Date();
  if (config.text) {
    dataSet.resourceDescription = composeResourceDescription('local file -- ' +
        config.source, importDate);
    dataSet.table = await Promise.resolve(parseCSVString(config.text));
    dataSet.sourceType = 'text';
  } else if (config.url) {
    let name;
    if (config.url && !config.url.startsWith('data:')) {
      name = config.url;
    } else {
      name = config.datasetName;
    }
    dataSet.resourceDescription = composeResourceDescription(name, importDate);
    dataSet.table = await fetchAndParseURL(config.url);
    dataSet.sourceType = 'url';
  } else if (config.file) {
    dataSet.resourceDescription = composeResourceDescription(config.datasetName || config.file.name, importDate);
    dataSet.table = await readAndParseFile(config.file);
    dataSet.sourceType = 'file';
  } else {
    console.log('csvImporter: expected text, url, or file: found none');
  }
  findOrCreateAttributeNames(dataSet);
  return dataSet;
}

/**
 * Parses a CSV dataset in the form of a string.
 * @param data
 * @return {*}
 */
function parseCSVString(data) {
  let parse = Papa.parse(data, {comments: '#', skipEmptyLines: 'greedy'});
  return parse.data;
}

export {
  retrieveData
}
