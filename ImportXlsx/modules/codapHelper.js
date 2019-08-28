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


/**
 * Initializes the codap interface.
 * @param codapConfig
 * @return {Promise}
 */
function init (codapConfig) {
  return codapInterface.init(codapConfig)
      .then(_getIDOfSelf);
}


function _getIDOfSelf(pluginStatus) {
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

/**
 * Resets the height of the plugin.
 * @param height
 * @return {Promise<never>|*|void}
 */
function adjustHeightOfSelf(height) {
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
 * Makes the component visible or not, depending on the
 * @param isVisible
 * @return {*|void}
 */
function setVisibilityOfSelf(isVisible) {
  if (isVisible == null) {
    isVisible = true;
  }
  if (pluginID == null) {
    return Promise.reject('Communication not established');
  }
  let request = {
    action: 'update',
    resource: `component[${pluginID}]`,
    values: {
      isVisible: isVisible
    }
  }
  if (isVisible) {
    request = [request];
    request.push({
      action: 'notify',
      resource: `component[${pluginID}]`,
      values: {
        request: 'select'
      }
    })
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
function defineDataSet(config) {
  let request = {
    action: 'create',
    resource: 'dataContext',
    values: {
      name: config.datasetName,
      title: config.datasetName,
      metadata: {
        source: config.source,
        importDate: config.importDate
      },
      collections: [
        {
          name: config.collectionName,
          attrs: config.attributeNames.map(function (attr) {return {name: attr}; })
        }
      ]
    }
  }
  return codapInterface.sendRequest(request);
}

function clearDataset(id) {
  let request = {
    action: 'delete',
    resource: `dataContext[${id}].allCases`
  };
  return codapInterface.sendRequest(request);
}

function sendRowsToCODAP(datasetID, attrArray, rows, chunkSize, dataStartingRow) {

  function sendOneChunk(){
    if (chunkIx > numRows) {
      return Promise.resolve();
    }
    let chunk = rows.slice(chunkIx, chunkIx + chunkSize);
    chunkIx = chunkIx + chunkSize;
    let request = {
      action: 'create',
      resource: `dataContext[${datasetID}].item`
    }
    let items = chunk.map(function (row) {
          let item = {values:{}};
          attrArray.forEach(function (attr, attrIx) {
            item.values[attr] = row[attrIx];
          })
          return item;
        });
    request.values = items;
    return codapInterface.sendRequest(request).then(sendOneChunk);
  }

  let numRows = rows.length;
  let chunkIx = dataStartingRow || 0;
  return sendOneChunk();

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

function openMap(name) {
  name = name || 'My Map';
  let request = {
    action: 'create',
    resource: 'component',
    values: {
      type: 'map',
      dataContext: name,
    }
  };
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

function sendToCODAP(action, resource, values) {
  return codapInterface.sendRequest({action: action, resource: resource, values: values});
}


export {
  init,
  adjustHeightOfSelf,
  clearDataset,
  closeSelf,
  setVisibilityOfSelf,
  defineDataSet,
  openCaseTableForDataSet,
  openMap,
  openTextBox,
  retrieveDatasetList,
  sendRowsToCODAP,
  sendToCODAP,
}
