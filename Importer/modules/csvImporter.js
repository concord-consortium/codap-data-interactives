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
  return new Promise( function (resolve, reject) {
    fetch(url).then(
        function (resp) {
          if (resp.ok) {
            resp.text().then(function (data) {
              resolve(data);
            });
          } else {
            reject(resp.statusText);
          }
        },
        function (msg) {
          reject(`Network error: "${msg}" -- See <a target="_blank" title="I got a networking error trying to load data into CODAP. What do I do?" href="https://codap.concord.org/help/general-questions/i-got-networking-error-trying-to-load-data-codap-what-do-i-do">CODAP help</a>.`);
        }
    );
  });
}

/**
 * Fetches the contents of a file and parses as a CSV String
 * @param file
 * @return {Promise}
 */
function readFile(file) {
  return file.text();
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

/*
 * from: https://stackoverflow.com/questions/1912501/unescape-html-entities-in-javascript
 */
function htmlDecode(str) {
  let doc = new DOMParser().parseFromString(str, "text/html");
  return doc.documentElement.textContent;
}

function extractMetadataFromCommentString(commentStrings) {
  let metadata = {};
  commentStrings.forEach(function (str) {
    let match = /^# (\w*): (.*)$/.exec(str);
    if (match) { metadata[match[1]] = htmlDecode(match[2]); }
  });
  return metadata;
}

function extractAttributeDefsFromCommentStrings(commentStrings) {
  return commentStrings
      .map(function (c) {
        let match = /^# attribute -- (.+)$/.exec(c);
        let props;
        let attrDefs = {};
        if (match) {
          props = match[1].split(',');
          props.forEach(function (prop) {
            let propsMatch = /^\s*(\w+): (.+)\s*$/.exec(prop);
            if (propsMatch) {
              attrDefs[propsMatch[1]] = htmlDecode(propsMatch[2]);
            }
          })
          return attrDefs;
        } else {
          return null;
        }
      })
      .filter(function (a) { return a != null;});
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
    dataSet.rawData = config.text;
    dataSet.sourceType = 'text';
  } else if (config.url) {
    let name;
    if (config.url && !config.url.startsWith('data:')) {
      name = config.url;
    } else {
      name = config.datasetName;
    }
    dataSet.resourceDescription = composeResourceDescription(name, importDate);
    dataSet.rawData = await fetchAndParseURL(config.url);
    dataSet.sourceType = 'url';
  } else if (config.file) {

    dataSet.resourceDescription = composeResourceDescription(config.datasetName
        || config.file.name, importDate);
    if (!config.datasetName) {
      dataSet.datasetName = config.file.name.replace(/\.[^.]*$/, '');
    }
    dataSet.rawData = await readFile(config.file);
    dataSet.sourceType = 'file';
  } else {
    console.log('csvImporter: expected text, url, or file: found none');
  }
  dataSet.table = dataSet.rawData && parseCSVString(dataSet.rawData);
  dataSet.commentLines = dataSet.rawData && dataSet.rawData
      .split(/[\n\r]+/)
      .filter(function (line) {return (line && line[0] === '#');});
  if (dataSet.commentLines && dataSet.commentLines.length > 0) {
    dataSet.metadata = extractMetadataFromCommentString(dataSet.commentLines);
    dataSet.attributeDefs = extractAttributeDefsFromCommentStrings(dataSet.commentLines);
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
