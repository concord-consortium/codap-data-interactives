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

async function selectComponent(id) {
  return codapInterface.sendRequest(
      {
        action: 'notify',
        resource: `component[${id}]`,
        values: {
          request: 'select'
        }
      }
  );
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
 * Defines a dataset. If the dataset does not exist in CODAP it will create it
 * with a single collection and the appropriate attributes. If it _does_ exist
 * it will modify it by aligning the attributes. Any attributes in the existing
 * dataset not present in the new attribute list will be removed and any attributes
 * in the new attribute list that are not found among the existing attributes will
 * be added to the child-most collection.
 *
 * @param datasetName
 * @param collectionName
 * @param attrs
 * @param source
 * @param importDate
 * @return {Promise}
 */
async function defineDataSet(config) {

  // make an array of attributes from the names list
  let attrList = config.attributeNames.map(function (attr) {
    let nameParts = analyzeRawName(attr);
    return {name: nameParts.baseName, unit: nameParts.unit, type: (attr.toLowerCase()==='boundary')? 'boundary': null};
  });

  // attempt to get the dataset
  return codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${config.datasetName}]`
  }).then(
      function (response) {

        // if we found a dataset, then update its attribute list,
        // otherwise create a new one
        if (response.success) {
          let dataset = response.values;
          let lastCollectionName = dataset.collections[dataset.collections.length - 1].name;

          // make a list of existing attribute names to simplify comparison
          let existingAttrNames = [];
          dataset.collections.forEach(function (collection) {
            collection.attrs.forEach(function (attr) {
              existingAttrNames.push(attr.name);
            });
          });

          // if we are replacing existing dataset calculate attribute deletions
          let requests = [];
          if (config.isReplace) {
            let toDelete = existingAttrNames.filter(function (attrName) {
              return (config.attributeNames.indexOf(attrName) < 0);
            });
            requests = toDelete.map(function (attrName) {
              let collection = dataset.collections.find(function (col) {
                return col.attrs.find(function (attr) {
                  return attrName === attr.name;
                });
              })
              return {
                action: 'delete',
                resource: `dataContext[${dataset.name}].collection[${collection.name}].attribute[${attrName}]`
              }
            });
          }

          // extract new attributes from attribute list
          let newAttributes = attrList.filter(function (attr) {
            return (existingAttrNames.indexOf(attr.name) < 0);
          });
          if (newAttributes.length) {
            requests.push({
              action: 'create',
              resource: `dataContext[${config.datasetName}].collection[${lastCollectionName}].attribute`,
              values: newAttributes
            });
          }

          if (requests.length) {
            return codapInterface.sendRequest(requests);
          } else {
            return Promise.resolve(response);
          }
        } else {
          return codapInterface.sendRequest({
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
                  attrs: attrList
                }
              ]
            }
          })
        }
      },
      function (error) {
        console.log("Error getting data set configuration: " + error);
      }
  )
}

async function clearDataset(id) {
  let request = {
    action: 'delete',
    resource: `dataContext[${id}].allCases`
  };
  return codapInterface.sendRequest(request);
}

async function sendRowsToCODAP(datasetID, attrArray, rows, chunkSize, dataStartingRow) {

  function sendOneChunk(){
    if (chunkIx > numRows) {
      return Promise.resolve({success: true});
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

async function openCaseTableForDataSet(dataContext) {
  let request = {
    action: 'create',
    resource: 'component',
    values: {
      type: 'caseTable',
      dataContext: dataContext,
    }
  }
  return codapInterface.sendRequest(request);
}

async function openMap(name) {
  name = name || 'My Map';
  let componentListRequest = {
    action: 'get',
    resource: 'componentList'
  };
  let openMapRequest = {
    action: 'create',
    resource: 'component',
    values: {
      type: 'map',
      dataContext: name,
    }
  };
  let result = await codapInterface.sendRequest(componentListRequest);
  let found = null;
  if (result && result.success) {
    found = result.values.find(function (componentInfo) {
      return componentInfo.type === 'map';
    })
  }
  if (!found) {
    return codapInterface.sendRequest(openMapRequest);
  } else {
    return Promise.resolve({success: true});
  }
}
/**
 *
 * @param title
 * @param message
 * @return {Promise}
 */
async function openTextBox(title, message) {
  // at this moment (6/2020) creating a text component with text is broken
  // so we do it in two steps
  let request = [
    {
      action: 'create',
      resource: 'component',
      values: {
        type: 'text',
        title: title,
        name: title
      }
    },
    {
      action: 'update',
      resource: `component[${title}]`,
      values: {
        text: message
      }
    }
  ];
  return codapInterface.sendRequest(request);
}

function indicateBusy(isBusy) {
  let request = {
    action: 'notify',
    resource: 'interactiveFrame',
    values: {
      request: isBusy? 'indicateBusy': 'indicateIdle'
    }
  }
  return codapInterface.sendRequest(request)
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

/**
 * Names ending with terminal parenthetical expressions have the parenthetical
 * expression trimmed in CODAP. The usage is to interpret the expression as
 * a unit. This utility analyzes a string and returns an object that separates
 * its baseName and unit.
 * @param iName
 * @param iReplaceNonWordCharacters
 * @return {{name: string}}
 */
function analyzeRawName(iName, iReplaceNonWordCharacters) {
  let tName = iName.trim();
  let tReg = /\(([^)]*)\)$/;  // Identifies parenthesized substring at end
  let tUnitMatch = tReg.exec(tName);
  let tUnit = (tUnitMatch && tUnitMatch.length)? tUnitMatch[1]: null;

  let tNewName = tName.replace(tReg, '').trim();  // Get rid of parenthesized units

  if (iReplaceNonWordCharacters)
    tNewName = tNewName.replace(/\W /g, '_');  // Replace non-word characters with underscore
  // if after all this we have an empty string replace with a default name.
  if (tNewName.length === 0) {
    tNewName = 'attr';
  }
  return {baseName: tNewName, unit: tUnit};
};

export {
  init,
  adjustHeightOfSelf,
  analyzeRawName,
  clearDataset,
  closeSelf,
  indicateBusy,
  setVisibilityOfSelf,
  defineDataSet,
  openCaseTableForDataSet,
  openMap,
  openTextBox,
  retrieveDatasetList,
  selectComponent,
  sendRowsToCODAP,
  sendToCODAP,
}
