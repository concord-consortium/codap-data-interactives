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

let pluginID = null;

function _getPluginID(pluginStatus) {
  return codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'})
      .then(function (result) {
        return new Promise(function(resolve, reject) {
          if (result.success) {
            pluginID = result.values.id;
            resolve(pluginStatus);
          } else {
            reject('Could not get my id.');
          }
        });
      });
}

// function handleFailedMessage(response, request) {
//   if (!response || !response.success) {
//     console.log("CODAP Request failed: " + JSON.stringify(request));
//   }
// }

function _getTableStats(data) {
  // var stats = {
  //   numberOfRows: data.length,
  //   maxWidth: 0,
  //   minWidth: Math.MAX_INT
  // };
  //
  //
  // stats.maxWidth = data.reduce(function (maxWidth, row) {return Math.max(maxWidth, row.length);}, 0);
  // stats.minWidth = data.reduce(function (minWidth, row) {return Math.min(minWidth, row.length);}, Math.MAX_INT);
  // return stats;
  return data.reduce(function (stats, row) {
      stats.maxWidth = Math.max(stats.maxWidth, row.length);
      stats.minWidth = Math.min(stats.minWidth, row.length);
      return stats;
    },
    {maxWidth: 0, minWidth: Number.MAX_SAFE_INTEGER, numberOfRows: data.length}
  );
}


function sendRowsToCODAP(dataSetID, config, attrArray, rows) {

  function sendOneChunk(){
    if (chunkIx > numRows) {
      return Promise.resolve();
    }
    let chunk = rows.slice(chunkIx, chunkIx + chunkSize);
    chunkIx = chunkIx + chunkSize;
    let request = {
      action: 'create',
      resource: 'dataContext[' + dataSetID +
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
    return codapInterface.sendRequest(request).then(sendOneChunk);
  }

  let chunkSize = config.chunkSize;
  let numRows = rows.length;
  let chunkIx = 0;
  return sendOneChunk();
}

/**
 * Resets the height of the plugin.
 * @param height
 * @return {Promise<never>|*|void}
 */
function adjustHeight(height) {
  if (pluginID == null) {
    return Promise.reject('Communication not established');
  }

  let request = {
    action: 'update',
    resource: 'component[' + pluginID + "]",
    values: {
      dimensions: {height: height}
    }
  }
  return codapInterface.sendRequest(request);
}

/**
 * Closes this plugin.
 * @return {Promise}
 */
function closeSelf() {
  console.log('CSV Importer Plugin: closing self');
  let request = {
    action: 'delete',
    resource: 'component[' + pluginID + ']'
  };
  return codapInterface.sendRequest(request);
}

/**
 * Defines a dataset.
 * @param datasetName
 * @param collectionName
 * @param attrs
 * @param source
 * @param importDate
 * @return {Promise}
 */
function defineDataSet(datasetName, collectionName, attrs, source, importDate) {
  let request = {
    action: 'create',
    resource: 'dataContext',
    values: {
      name: datasetName,
      title: datasetName,
      metadata: {
        source: source,
        importDate: importDate
      },
      collections: [
        {
          name: collectionName,
          attrs: attrs.map(function (attr) {return {name: attr}; })
        }
      ]
    }
  }
  return codapInterface.sendRequest(request);
}

/**
 * Initializes the codap interface.
 * @param codapConfig
 * @return {Promise}
 */
function init (codapConfig) {
  return codapInterface.init(codapConfig)
      .then(_getPluginID);
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
  return codapInterface.sendRequest(request);
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
  return codapInterface.sendRequest(request);
}

/**
 * Fetches a list of dataset definitions from CODAP.
 * @return {Promise}
 */
function retrieveDatasetList () {
  return codapInterface.sendRequest({action:'get', resource:'dataContextList'})
      .then(function (reply) {
        if (!reply.success) {
          return Promise.reject('Error fetching data context list');
        }
        let list = reply.values;
        let requestDetails = list.map(function (datasetIDs) {
          return {action: 'get', resource: 'dataContext[' + datasetIDs.id + ']'};
        });
        return codapInterface.sendRequest(requestDetails);
      })
      .then(function (reply) {
        if (reply.some(function(resp) {return !(resp.success);})) {
          return Promise.reject('Error fetching data context details');
        }
        return Promise.resolve(reply.map(function (resp) { return resp.values;}));
      })
}

/**
 *
 * @param data: an array of arrays
 * @param config
 * @return {Promise}
 */
function sendDataSetToCODAP(data, config) {
  let attrs = null;
  if (config.firstRowIsAttrList) {
    attrs = data.shift();
  }
  let tableStats = _getTableStats(data);
  let datasetID = null;
  if (!attrs) {
    for (let i = 0; i < tableStats.maxWidth; i++) {
      attrs[i] = config.attrName + i;
    }
  }
  return defineDataSet(config.datasetName, config.collectionName, attrs, config.source, config.importDate)
      .then(function (result) {
        if (result.success) {
          datasetID = result.values.id;
          if (config.openCaseTable) {
            return openCaseTableForDataSet(config.datasetName);
          } else {
            return Promise.resolve(result);
          }
        } else {
          return Promise.reject('Failed to create dataset.')
        }
      })
      .then(function () {
        return sendRowsToCODAP(datasetID, config, attrs, data);
      });
}

/**
 * Makes the component visible or not, depending on the
 * @param isVisible
 * @return {*|void}
 */
function setVisibility(isVisible) {
  if (isVisible == null) {
    isVisible = true;
  }
  if (pluginID == null) {
    return Promise.reject('Communication not established');
  }
  let request = {
    action: 'update',
    resource: 'component[' + pluginID + ']',
    values: {
      dimensions: {
        isVisible: isVisible
      }
    }
  }
  return codapInterface.sendRequest(request);
}

let codapHelper = {
  adjustHeight: adjustHeight,
  closeSelf: closeSelf,
  defineDataSet: defineDataSet,
  init: init,
  openCaseTableForDataSet: openCaseTableForDataSet,
  openTextBox: openTextBox,
  retrieveDatasetList: retrieveDatasetList,
  sendDataSetToCODAP: sendDataSetToCODAP,
  setVisibility: setVisibility
}

export {codapHelper};