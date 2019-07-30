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

function findMatchingDataSetInCODAP(name, attrs) {

}

function defineDataSetInCODAP(datasetName, collectionName, attrs) {
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

function openCaseTableForDataSetInCODAP(name) {
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
function openTextBoxInCODAP(title, message) {
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
  let request = {
    action: 'create',
    resource: 'dataContext[' + config.dataSetName +
        '].collection[' + config.collectionName + '].case',
    values: []
  }

  let cases = rows.map(function (row) {
    let myCase = {values:{}};
    attrArray.forEach(function (attr, ix) {
      myCase.values[attr] = row[ix];
    })
    return myCase;
  });
  request.values = cases;
  return codapInterface.sendRequest(request, handleFailedMessage);
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
  return defineDataSetInCODAP(config.dataSetName, config.collectionName, attrs)
      .then(function () { return openCaseTableForDataSetInCODAP(config.dataSetName)})
      .then(function () { return sendRowsToCODAP(config, attrs, data)});
}

function closeSelf() {
  // TBD
}

let codapHelper = {
  init: init,
  findMatchingDataSetInCODAP: findMatchingDataSetInCODAP,
  openCaseTableForDataSetInCODAP: openCaseTableForDataSetInCODAP,
  openTextBoxInCODAP: openTextBoxInCODAP,
  sendDataSetToCODAP: sendDataSetToCODAP,
  closeSelf: closeSelf,
}

export {codapHelper};