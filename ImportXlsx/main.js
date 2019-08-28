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

import * as uiControl from './modules/uiControl';
import * as codapHelper from './modules/codapHelper';
import * as xlsHelper from './modules/xlsHelper';

let constants = {
  chunkSize: 200, // number of items to transmit at a time
  defaultAttrName: 'attr', // default attribute name prefix
  defaultCollectionName: 'cases', // default collection name
  defaultDataSetName: 'dataset', // default dataset name
  name: 'Import XLSX',  // plugin name
  thresholdColCount: 40,
  thresholdRowCount: 5000, // beyond this size datasets are considered large
}

let codapConfig = {
  name: constants.name,
  title: constants.name,
  version: 0.1
}

let config = {
  attributeNames: null,
  collectionName: constants.defaultCollectionName,
  data: null,
  datasetID: null,
  datasetName: constants.defaultDataSetName,
  downsampling: 'none', // none || random || everyNth || last || first
  downsamplingTargetCount: null, // count we aim to achieve by downsampling
  downsamplingEveryNthInterval: null,// n, if everyNth is selected
  firstRowIsAttrList: true,
  importDate: null,
  matchingDataset: null,
  openCaseTable: true,
  operation: 'auto', // auto || new || append || replace
  pluginState: null,
  resourceDescription: 'unknown',
  source: null,
  workbook: null,
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
            resp.arrayBuffer().then(function (data) {
              let table = xlsHelper.parseArrayBuffer(data);
              resolve(table);
            });
          }
        });
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
      let workbook = xlsHelper.parseArrayBuffer(this.result);
      resolve(workbook);
    }
    let reader = new FileReader ();
    reader.onabort = handleAbnormal;
    reader.onerror = handleAbnormal;
    reader.onload = handleRead;
    return reader.readAsArrayBuffer(file);
  });
}

/**
 * Compose a resource description to display in a text box.
 * @param src
 * @param time
 * @return {string}
 */
function composeResourceDescription(src, time) {
  return `source: ${src}\nimported: ${time.toLocaleString()}`
}

/**
 * Retrieve data in whatever form provided and parse as a CSV String
 * @return {Promise}
 */
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
    return Promise.resolve((typeof pluginState.text === 'string')? JSON.parse(pluginState.text):pluginState.text);
  } else if (pluginState.arrayBuffer) {
    config.resourceDescription = composeResourceDescription('local file -- ' + config.source, config.importDate);
    return Promise.resolve( xlsHelper.parseArrayBuffer(pluginState.arrayBuffer));
  }
}

/**
 * Attempts to identify whether there is a matching dataset to the one currently
 * under consideration. Does this by comparing metadata.
 * @param datasetList
 * @param {string} resourceName
 */
function findMatchingSource(datasetList, resourceName) {
  // console.log('findMatchingSource: list size: ' + (datasetList?datasetList.length:0));
  let foundDataset = datasetList && datasetList.find(function (dataset) {
    return dataset.metadata && dataset.metadata.source === resourceName;
  });

  return foundDataset;
}

function findDatasetMatchingAttributes(datasetList, attributeNames) {
  let foundDataset = datasetList && datasetList.find(function (dataset) {
    var existingDatasetAttributeNames = [];
    dataset.collections && dataset.collections.forEach(function (collection) {
      collection.attrs && collection.attrs.forEach(function (attr) {
        existingDatasetAttributeNames.push(attr.name || attr.title);
      });
    });
    let unmatchedAttributeName = attributeNames.find(function (name) {
      return (existingDatasetAttributeNames.indexOf(name) < 0);
    });
    return !unmatchedAttributeName;
  });
  return foundDataset;
}


/**
 * Makes sure plugin can be displayed.
 */
function adjustPluginHeight() {
  let pageHeight = uiControl.getHeight();
  let pluginHeight = config.pluginState && config.pluginState.dimensions && config.pluginState.dimensions.height;
  if (!pluginHeight || pageHeight>pluginHeight) {
    codapHelper.adjustHeightOfSelf(pageHeight);
  }
}

function getTableStats(data) {
  if (!data) {
    return;
  }
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
      attrs[i] = constants.defaultAttrName + i;
    }
  }
  config.attributeNames = attrs;
}

/**
 * Autoimport applies if the CSV is short and could not already be present.
 *
 * @return {Promise<boolean>}
 */
async function determineIfAutoImportApplies() {
  findOrCreateAttributeNames(config.data, config);
  let dataSetList = await codapHelper.retrieveDatasetList();
  let matchingDataset = findMatchingSource(dataSetList, config.source);
  let numRows = config.data.length;

  if (matchingDataset) {
    config.matchingDataset = matchingDataset;
    uiControl.displayMessage('There already exists a dataset from the same ' +
        `source. It was uploaded on ${matchingDataset.metadata.importDate.toLocaleString()}` +
        '. What would you like to do?');
    uiControl.showSection('target-options', true);
    codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
  } else {
    matchingDataset = findDatasetMatchingAttributes(dataSetList, config.attributeNames);
    if (matchingDataset) {
      config.matchingDataset = matchingDataset;
      uiControl.displayMessage(`The existing dataset, "${matchingDataset.name}",' +
          ' has the same attributes as this new CSV file. ` +
          'Would you like to append the new data or replace the existing set?');
      uiControl.showSection('target-options', true);
      codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
    }
  }
  let sizeAboveThreshold = (numRows > constants.thresholdRowCount);
  if (sizeAboveThreshold) {
    uiControl.displayMessage(`The CSV file, "${config.source}" has ${numRows} rows.` +
      `More than ${constants.thresholdRowCount} rows could lead to sluggish performance for some activities in the current version of CODAP.` +
        'You may wish to work with a subsample of the data at first. ' +
        'You can always replace it with the full data set later.'
    );
    uiControl.showSection('downsample-options', true);
    uiControl.setInputValue('pick-interval', Math.round((numRows-1)/constants.thresholdRowCount) + 1);
    uiControl.setInputValue('random-sample-size', Math.min(numRows, constants.thresholdRowCount));
    codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
  }
  return !(matchingDataset || sizeAboveThreshold);
}


/**
 * Downsamples a dataset by random selection without replacement.
 * @param data {Array[{Array}]}
 * @param targetCount {Positive Integer}
 * @param start {Positive Integer} Index of first row with data.
 * @return {Array[{Array}]}
 */
function downsampleRandom(data, targetCount, start) {
  let dataLength = data.length - start;
  let ct = Math.min(dataLength, Math.max(0, targetCount));
  let randomAreSelected = ct < (dataLength/2);
  let pickArray = new Array(dataLength).fill(!randomAreSelected);
  if (!randomAreSelected) {
    ct = dataLength - ct;
  }

  // construct an array of selection choices
  let i = 0;
  while (i < ct) {
    let value = Math.floor(Math.random()*dataLength);
    if (pickArray[value] !== randomAreSelected) {
      i++;
      pickArray[value] = randomAreSelected;
    }
  }

  let newData = [];
  // copy the non-data rows
  for (let ix = 0; ix < start; ix += 1) {
    newData.push(data[ix]);
  }
  // use pick array to determine if we should add each row of original table to new
  pickArray.forEach(function(shouldPick, ix) {
    if (shouldPick) newData.push(data[ix + start]);
  });

  return newData;
}

/**
 * Downsamples a data set by picking every nth row.
 * @param data {Array[{Array}]}
 * @param interval {Positive Integer}
 * @param start {Positive Integer} Index of the first row that has data
 * @return {Array[{Array}]}
 */
function downsampleEveryNth(data, interval, start) {
  let newArray = [];

  for (let ix = 0; ix < start; ix += 1) {
    newArray.push(data[ix]);
  }

  for (let ix = start; ix < data.length; ix += interval) {
    newArray.push(data[ix]);
  }
  return newArray;
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

async function handleFileInputs() {
  let url = uiControl.getInputValue('source-input-url');
  let file = uiControl.getInputValue('source-input-file');
  if (url) {
    // uiControl.displayMessage('got url: ' + url);
    config.source = url;
    config.importDate = new Date();
    config.resourceDescription = composeResourceDescription(config.source, config.importDate);
    config.data = await fetchAndParseURL(url);
  } else if (file) {
    // uiControl.displayMessage('got file: ' + file);
    let fileList = uiControl.getInputFileList('source-input-file');
    if (fileList) {
      config.source = fileList[0].name;
      config.importDate = new Date();
      config.resourceDescription = composeResourceDescription(config.source, config.importDate);
      config.data = await readAndParseFile(fileList[0]);
    }
  }
  if (config.data) {
    let isAuto = await determineIfAutoImportApplies();
    if (isAuto) {
      importData();
    }
  }
}

/**
 * Orchestrates sending data to codap according to user selections.
 *
 */
function handleSubmit() {
  if (config.source) {
    // downsample = all | random | every-nth | first-n | last-n
    config.downsampling = uiControl.getInputValue('downsample');
    // operation = new | replace | append
    config.operation = uiControl.getInputValue('target-operation');
    config.downsamplingTargetCount = uiControl.getInputValue(
        'random-sample-size');
    config.downsamplingEveryNthInterval = uiControl.getInputValue(
        'pick-interval');

    if (config.downsampling === 'random') {
      config.data = downsampleRandom(config.data,
          Number(config.downsamplingTargetCount), config.dataStartingRow);
    } else if (config.downsampling === 'every-nth') {
      config.data = downsampleEveryNth(config.data,
          Number(config.downsamplingEveryNthInterval), config.dataStartingRow);
    }

    importData();
  } else {
    handleFileInputs();
  }
}

/**
 * Orchestrates clearing of a dataset in CODAP
 */
function clearDatasetInCODAP(id) {
  return codapHelper.clearDataset(id);
}

/**
 * Orchestrate the various import operations.
 *
 * 1. if needed, create dataset in CODAP.
 * 2. if inserting in existing dataset, set up the proper ID.
 * 3. If replacing existing dataset, clear it.
 * 4. Send rows as items.
 *
 * Uses various values in config that it assumes have already been initialized:
 *   * data: the data as an array of arrays
 *   * operation: ['auto'|'new'|'append'|'replace']
 *   * datasetID: CODAP id for dataset.
 *   * datasetName: CODAP name for dataset.
 *   * resourceDescription:
 *   * matchingDataset: the one to append to or replace
 *   * attributeNames: array of attribute names
 *   * dataStartingRow: first row containing data
 * @return {Promise<*>}
 */
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
      config.attributeNames, data, constants.chunkSize, config.dataStartingRow);
  if (!result || !result.success) {
    uiControl.displayError((result && result.error) || "Error sending data to CODAP");
    codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
  }

  result = await codapHelper.closeSelf();

  return result;
}


/**
 * Start here.
 *
 * 0. set up handlers
 * 1. connect to CODAP
 * 2. if there is data, read and parse it
 * 3. see if data can be autoimported
 * 4. if so autoimport and quit
 *
 * @return {Promise<void>}
 */
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

  codapHelper.setVisibilityOfSelf(false);

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
    codapHelper.setVisibilityOfSelf(true);
  }
}

main();
