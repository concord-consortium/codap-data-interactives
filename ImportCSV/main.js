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
  attributeNames: null,
  chunkSize: 200,
  collectionName: constants.defaultCollectionName,
  data: null,
  dataStartingRow: null,
  datasetID: null,
  datasetName: constants.defaultDataSetName,
  downsampling: 'none', // none || random || everyNth || last || first
  downsamplingTargetCount: null, // count we aim to achieve by downsampling
  firstRowIsAttrList: true,
  importDate: null,
  matchingDataset: null,
  openCaseTable: true,
  operation: 'auto', // auto || new || append || replace
  pluginState: null,
  resourceDescription: 'unknown',
  source: null,
}

// *** BEGIN get the data ***
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

function composeResourceDescription(src, time) {
  return `source: ${src}\nimported: ${time.toLocaleString()}`
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
    return Promise.resolve(parseCSVString(pluginState.text));
  }
}
// *** END get the data ***

// *** BEGIN parse the data
/**
 * Parses a CSV dataset in the form of a string.
 * @param data
 * @return {*}
 */
function parseCSVString(data) {
  let parse = Papa.parse(data, {comments: '#', skipEmptyLines: true});
  return parse.data;
}
// *** END parse the data

// *** BEGIN Analyze the data
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

  return found;
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

async function determineIfAutoImportApplies() {
  findOrCreateAttributeNames(config.data, config);
  let dataSetList = await codapHelper.retrieveDatasetList();
  let matchingDataset = findMatchingSource(dataSetList);
  if (matchingDataset) {
    console.log('findMatchingSource: found match for "' + config.source + '"');
    config.operation = 'new';
    config.matchingDataset = matchingDataset;
    uiControl.displayMessage('There already exists a dataset from the same ' +
        'source. It was uploaded on ' + matchingDataset.metadata.importDate.toLocaleString() +
        '. What would you like to do?');
    uiControl.showSection('target-options', true);
    codapHelper.setVisibility(true);
    adjustPluginHeight();
  }
  return !matchingDataset;
}
// *** END Analyze the data


// *** BEGIN send the data to codap
function getTableStats(data) {
  return data.reduce(function (stats, row) {
        stats.maxWidth = Math.max(stats.maxWidth, row.length);
        stats.minWidth = Math.min(stats.minWidth, row.length);
        return stats;
      },
      {maxWidth: 0, minWidth: Number.MAX_SAFE_INTEGER, numberOfRows: data.length}
  );
}

function findOrCreateAttributeNames(data, config) {
  let tableStats = getTableStats(data);
  let attrs = [];
  if (config.firstRowIsAttrList && tableStats.numberOfRows > 0) {
    attrs = data[0];
    config.dataStartingRow = 1;
  } else {
    config.dataStartingRow = 0;
    for (let i = 0; i < tableStats.maxWidth; i++) {
      attrs[i] = config.attrName + i;
    }
  }
  config.attributeNames = attrs;
}

async function createDataSetInCODAP(data, config) {
  let tableConfig = {
    datasetName: config.datasetName,
    collectionName: config.collectionName,
    attributeNames: config.attributeNames,
    dataStartingRow: config.dataStartingRow,
    source: config.source,
    importDate: config.importDate,
  }
  return await codapHelper.defineDataSet(tableConfig);
}

/**
 * Orchestrates sending data to codap according to user selections.
 *
 */
function handleSubmit() {
  // downsample = all | random | every-nth | first-n | last-n
  config.downsampling = uiControl.getValueOfRadioGroup('downsample');
  // operation = new | replace | append
  config.operation = uiControl.getValueOfRadioGroup('target-operation');

  importData();
}

function clearDatasetInCODAP(id) {
  return codapHelper.clearDataset(id);
}

async function importData() {
  let data = config.data;
  let result = null;
  if (config.operation === 'auto' || config.operation === 'new') {

    result = await createDataSetInCODAP(data, config);
    if (result && result.success) {
      config.datasetID = result.values.id;
    }
    codapHelper.openCaseTableForDataSet(config.datasetID);
    codapHelper.openTextBox(config.datasetName, config.resourceDescription);
  }

  if (config.operation === 'append' || config.operation === 'replace') {
    config.datasetID = config.matchingDataset.id;
  }

  if (config.operation === 'replace') {
    result = await clearDatasetInCODAP(config.datasetID);
  }

  result = await codapHelper.sendRowsToCODAP(config.datasetID,
      config.attributeNames, data, config.chunkSize, config.dataStartingRow);
  if (!result || !result.success) {
    uiControl.displayError((result && result.error) || "Error sending data to CODAP");
  }

  result = await codapHelper.closeSelf();

  return result;
    // return populateFromDataThenExit(data, config);
}
// *** END send the data to codap

async function main() {
  // create handlers
  uiControl.installButtonHandler('#cancel', function(ev) {
    ev.preventDefault();
    codapHelper.closeSelf();
    return false;
  });
  uiControl.installButtonHandler('#submit', function (ev) {
    ev.preventDefault();
    handleSubmit();
    return false;
  });

  // initialize CODAP
  let pluginState = await codapHelper.init(codapConfig)

  // console.log('pluginState: ' + pluginState && JSON.stringify(pluginState));
  config.pluginState = pluginState;

  codapHelper.setVisibility(false);

  // then, if there is data or a url, get it and create the data set
  // otherwise display a dialog
  if (pluginState) {
    // copy to config
    Object.keys(config).forEach(function (key) {
      if (pluginState[key] != null) config[key] = pluginState[key];
    });

    config.importDate = new Date();
    config.source = pluginState.url || pluginState.filename || pluginState.name;

    config.data = await retrieveData(pluginState);

    let autoImport = await determineIfAutoImportApplies();
    if (autoImport) {
      importData();
    }
  } else {
    uiControl.showSection('source-input', true);
    codapHelper.setVisibility(true);
  }
}

main();
