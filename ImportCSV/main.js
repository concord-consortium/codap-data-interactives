/* eslint-disable no-unused-vars */
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
 import {uiControl} from './modules/uiControl.js';
/*global Papa, codapInterface */

let constants = {
  name: 'Import CSV',
  thresholdRowCount: 3000,
  thresholdColCount: 40,
  defaultDataSetName: 'dataset',
  defaultCollectionName: 'cases',
  defaultAttrName: 'attr'
}

let codapConfig = {
  name: constants.name,
  title: constants.name,
  version: 0.1,
  dimensions: {width: 400, height: 300}
}

let config = {
  firstRowIsAttr: true,
  dataSetName: constants.defaultDataSetName,
  collectionName: constants.defaultCollectionName,
  attrName: constants.defaultAttrName,

}


function fetchAndParseURL(url) {
  return fetch(url)
      .then(function (resp) {
        return new Promise(function (resolve, reject){
          if (resp.ok)
            resp.text().then(function (data) {
              let parse = Papa.parse(data)
              let tab = parse.data;
              console.log('made table: ' + (tab && tab.length));
              resolve(tab);
            });
        })
      });

}

function findMatchingDataSetInCODAP(name, attrs) {

}

function defineDataSetInCODAP(name, attrs) {
  let request = {
    action: 'create',
    resource: 'dataContext',
    values: {
      name: name,
      title: name,
      collections: [
        {
          name: config.collectionName,
          attrs: attrs.map(function (attr) {return {name: attr}; })
        }
      ]
    }
  }
  codapInterface.sendRequest(request, handleFailedMessage);
}

function openCaseTableForDataSetInCODAP(name) {

}

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
  codapInterface.sendRequest(request, handleFailedMessage);
}

function handleFailedMessage(response, request) {
  if (!response || !response.success) {
    console.log("CODAP Request failed: " + JSON.stringify(request));
  }
}

function sendRowsToCODAP(attrArray, rows) {
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
  codapInterface.sendRequest(request, handleFailedMessage);
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

function sendDataSetToCODAP(data, config) {
  let attrs = null;
  if (config.firstRowIsAttr) {
    attrs = data.shift();
  }
  let tableStats = getTableStats(data);
  if (!attrs) {
    for (let i = 0; i < tableStats.maxWidth; i++) {
      attrs[i] = config.attrName + i;
    }
  }
  defineDataSetInCODAP(config.dataSetName, attrs);
  sendRowsToCODAP(attrs, data);
}

function closeSelf() {
  // TBD
}

function main() {
  codapInterface.init(codapConfig).then(function (pluginState) {
    console.log('pluginState: ' + pluginState && JSON.stringify(pluginState));

    // for now
    if (!pluginState || !pluginState.url) pluginState = {url : 'http://localhost/~jsandoe/Automobiles.csv'};

    if (pluginState && pluginState.url) {
      fetchAndParseURL(pluginState.url)
          .then(function (data) { sendDataSetToCODAP(data, config); })
          .then(function () { openTextBoxInCODAP(constants.name, pluginState.url); })
          .then(closeSelf)
          .catch(function (ex) {
            uiControl.displayError(ex);
          });
    }
  })
  .catch(function (msg) {
    uiControl.displayError(msg);
  });
}

main();
