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
/*global codapInterface */

/**
 *
 * @param codapConfig
 * @return {Promise}
 */
function init (codapConfig) {
  return codapInterface.init(codapConfig);
}

function findMatchingDataSet(name, attrs) {

}

function defineDataSet(datasetName, collectionName, attrs) {
  let request = {
    action: 'create',
    resource: 'dataContext',
    values: {
      name: datasetName,
      title: datasetName,
      collections: [
        {
          name: collectionName,
          attrs: attrs.map(function (attr) {return {name: attr}; })
        }
      ]
    }
  }
  return codapInterface.sendRequest(request, handleFailedMessage);
}

function openCaseTableForDataSet(name) {
  let request = {
    action: 'create',
    resource: 'component',
    values: {
      type: 'caseTable',
      dataContext: name,
    }
  }
  return codapInterface.sendRequest(request, handleFailedMessage);
}

/**
 *
 * @param title
 * @param message
 * @return {Promise}
 */
function openTextBox(title, message) {
  let request = {
    action: 'create',
    resource: 'component',
    values: {
      type: 'text',
      text: message,
      title: title
    }
  }
  return codapInterface.sendRequest(request, handleFailedMessage);
}

function handleFailedMessage(response, request) {
  if (!response || !response.success) {
    console.log("CODAP Request failed: " + JSON.stringify(request));
  }
}

function getTableStats(data) {
  var stats = {
    numberOfRows: data.length,
    maxWidth: 0,
    minWidth: Math.MAX_INT
  };

  stats.maxWidth = data.reduce(function (maxWidth, row) {return Math.max(maxWidth, row.length);}, 0);
  stats.minWidth = data.reduce(function (minWidth, row) {return Math.min(minWidth, row.length);}, Math.MAX_INT);
  return stats;
}

function sendRowsToCODAP(config, attrArray, rows) {

  function sendOneChunk(){
    if (chunkIx > numRows) {
      return Promise.resolve();
    }
    let chunk = rows.slice(chunkIx, chunkIx + chunkSize);
    chunkIx = chunkIx + chunkSize;
    let request = {
      action: 'create',
      resource: 'dataContext[' + config.datasetName +
          '].collection[' + config.collectionName + '].case'
    }
    let cases = chunk.map(function (row) {
          let myCase = {values:{}};
          attrArray.forEach(function (attr, attrIx) {
            myCase.values[attr] = row[attrIx];
          })
          return myCase;
        });
    request.values = cases;
    return codapInterface.sendRequest(request, handleFailedMessage).then(sendOneChunk);
  }

  let chunkSize = config.chunkSize;
  let numRows = rows.length;
  let chunkIx = 0;
  return sendOneChunk();
}

/**
 *
 * @param data
 * @param config
 * @return {Promise}
 */
function sendDataSetToCODAP(data, config) {
  let attrs = null;
  if (config.firstRowIsAttrList) {
    attrs = data.shift();
  }
  let tableStats = getTableStats(data);
  if (!attrs) {
    for (let i = 0; i < tableStats.maxWidth; i++) {
      attrs[i] = config.attrName + i;
    }
  }
  return defineDataSet(config.datasetName, config.collectionName, attrs)
      .then(function () {
        if (config.openCaseTable) {
          return openCaseTableForDataSet(config.datasetName)
        } else {
          return Promise.resolve();
        }
      })
      .then(function () { return sendRowsToCODAP(config, attrs, data)});
}

function closeSelf() {
  let request = {
    action: 'delete',
    resource: 'interactiveFrame'
  };
  return codapInterface.sendRequest(request, handleFailedMessage);
}

let codapHelper = {
  init: init,
  findMatchingDataSet: findMatchingDataSet,
  openCaseTableForDataSet: openCaseTableForDataSet,
  openTextBox: openTextBox,
  sendDataSetToCODAP: sendDataSetToCODAP,
  closeSelf: closeSelf,
}

export {codapHelper};