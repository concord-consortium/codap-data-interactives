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
 /*global Papa */
import {uiControl} from './modules/uiControl';
import {codapHelper} from './modules/codapHelper';

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
  version: 0.1
}

let config = {
  attrName: constants.defaultAttrName,
  chunkSize: 200,
  collectionName: constants.defaultCollectionName,
  data: null,
  datasetName: constants.defaultDataSetName,
  downsampling: 'none', // none || random || everyNth || last || first
  downsamplingTargetCount: null, // count we aim to achieve by downsampling
  firstRowIsAttrList: true,
  matchingDataset: null,
  openCaseTable: true,
  operation: 'auto', // auto || new || append || replace
  pluginState: null,
  resourceDescription: 'unknown',
}

/**
 * Parses a CSV dataset in the form of a string.
 * @param data
 * @return {*}
 */
function parseCSVString(data) {
  let parse = Papa.parse(data, {comments: '#', skipEmptyLines: true});
  return parse.data;
}

/**
 * Fetches a URL and parses as a CSV String
 * @param url
 * @return {Promise}
 */
function fetchAndParseURL(url) {
  return fetch(url)
      .then(function (resp) {
        return new Promise(function (resolve, reject){
          if (resp.ok) {
            resp.text().then(function (data) {
              let tab = parseCSVString(data);
              console.log('made table: ' + (tab && tab.length));
              resolve(tab);
            });
          }
        });
      });
}

// function populateFromTextThenExit(text, config) {
//   let data = parseCSVString(text);
//   return codapHelper.sendDataSetToCODAP(data, config)
//       .then(function () { return codapHelper.openTextBox(config.datasetName, config.resourceDescription); })// need file path
//       .then(codapHelper.closeSelf)
//       .catch(function (ex) {
//         uiControl.displayError(ex);
//         codapHelper.setVisibility(true);
//       });
// }

// function populateFromFileThenExit(file, config) {
//   function handleAbnormal() {
//     console.log("Abort or error on file read.");
//   }
//   function handleRead() {
//     let data = parseCSVString(this.result);
//     return codapHelper.sendDataSetToCODAP(data, config)
//         .then(function () { return codapHelper.openTextBox(config.datasetName, config.resourceDescription); })// need file path
//         .then(codapHelper.closeSelf)
//         .catch(function (ex) {
//           uiControl.displayError(ex);
//           codapHelper.setVisibility(true);
//         });
//   }
//   let reader = new FileReader ();
//   reader.onabort = handleAbnormal;
//   reader.onerror = handleAbnormal;
//   reader.onload = handleRead;
//   return reader.readAsText(file);
// }

function populateFromDataThenExit(data, config) {
  return codapHelper.sendDataSetToCODAP(data, config)
      .then(function () { return codapHelper.openTextBox(config.datasetName, config.resourceDescription); })// need file path
      .then(codapHelper.closeSelf)
      .catch(function (ex) {
        uiControl.displayError(ex);
        codapHelper.setVisibility(true);
      });
}

function readAndParseFile(file, config) {
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

// function populateFromURLThenExit(url, config) {
//   return fetchAndParseURL(url)
//       .then(function (data) { return codapHelper.sendDataSetToCODAP(data, config); })
//       .then(function () { return codapHelper.openTextBox(config.datasetName, config.resourceDescription); })
//       .then(codapHelper.closeSelf)
//       .catch(function (ex) {
//         uiControl.displayError(ex);
//         codapHelper.setVisibility(true);
//       });
// }

function composeResourceDescription(src, time) {
  return `source: ${src}\nimported: ${time}`
}

/**
 * Attempts to identify whether there is a matching dataset to the one currently
 * under consideration. Does this by comparing metadata.
 * @param datasetList
 */
function findMatchingSource(datasetList) {
  console.log('findMatchingSource: list size: ' + (datasetList?datasetList.length:0));
  let found = datasetList && datasetList.find(function (dataset) {
    return dataset.metadata && dataset.metadata.source === config.source;
  });

  if (found) {
    console.log('findMatchingSource: found match for "' + config.source + '"');
    config.operation = 'new';
    config.matchingDataset = found;
    uiControl.displayMessage('There already exists a dataset from the same ' +
        'source. It was uploaded on ' + found.metadata.importDate +
        '. What would you like to do?');
    uiControl.showSection('target-options', true);
    codapHelper.setVisibility(true);
    adjustPluginHeight();
  }
}

function autoImportData() {
  if (config.operation === 'auto') {
    let data = config.data;
    return populateFromDataThenExit(data, config);
  } else {
    return Promise.resolve();
  }
}

function retrieveData() {
  let pluginState = config.pluginState;
  if (pluginState.url) {
    config.resourceDescription = composeResourceDescription(config.source, config.importDate);
    return fetchAndParseURL(pluginState.url, config);
  } else if (pluginState.file) {
    config.resourceDescription = composeResourceDescription(config.source, config.importDate);
    return readAndParseFile(pluginState.file, config)
  } else if (pluginState.text) {
    config.resourceDescription = composeResourceDescription('local file -- ' + config.source, config.importDate);
    return Promise.resolve(pluginState.text);
  }
}

/**
 * Makes sure plugin can be displayed.
 */
function adjustPluginHeight() {
  let pageHeight = uiControl.getHeight();
  let pluginHeight = config.pluginState && config.pluginState.dimensions && config.pluginState.dimensions.height;
  if (!pluginHeight || pageHeight>pluginHeight) {
    codapHelper.adjustHeight(pageHeight);
  }
}

/**
 * Orchestrates sending data to codap according to user selections.
 *
 */
function sendDataToCODAP() {
  // subsample = all | random | every-nth | first-n | last-n
  let subsampling = uiControl.getValueOfRadioGroup('subsample');
  // operation = new | replace | append
  let operation = uiControl.getValueOfRadioGroup('target-operation');


}
function main() {
  uiControl.installButtonHandler('#cancel', function(ev) {
    ev.preventDefault();
    codapHelper.closeSelf();
    return false;
  });
  uiControl.installButtonHandler('#submit', function (ev) {
    ev.preventDefault();
    sendDataToCODAP();
    return false;
  });
  codapHelper.init(codapConfig)
      .then(function (pluginState) {
        console.log('pluginState: ' + pluginState && JSON.stringify(pluginState));
        config.pluginState = pluginState;
        return codapHelper.setVisibility(false);
      })
      .then(function () {
        let pluginState = config.pluginState;

        if (pluginState) {
          config.pluginState = pluginState;
          Object.keys(config).forEach(function (key) {
            if (pluginState[key] != null) config[key] = pluginState[key];
          });

          config.importDate = new Date();
          config.source = pluginState.url || pluginState.file.name ||pluginState.filename || pluginState.name;

          return retrieveData(pluginState)
              .then(function (data) {
                new Promise(function (resolve, reject){
                  config.data = data;
                  resolve();
                })
              })
              .then(codapHelper.retrieveDatasetList)
              .then(findMatchingSource)
              .then(autoImportData);
        } else {
          uiControl.showSection('source-input', true);
          codapHelper.setVisibility(true);
        }
      })
      .catch(function (msg) {
        if (msg && msg.toString().startsWith('handleResponse: CODAP request timed out')) {
          msg = 'There is a problem connecting with CODAP';
        }
        uiControl.displayError(msg);
        // TODO Here we should put up a file entry dialog and capability to open
        //  CODAP in an IFrame
      });
}

main();
