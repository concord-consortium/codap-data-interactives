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
import * as htmlImporter from './modules/htmlImporter';
// import * as DataSet from './modules/DataSet';

let constants = {
  chunkSize: 200, // number of items to transmit at a time
  defaultAttrName: 'attr', // default attribute name prefix
  defaultCollectionName: 'cases', // default collection name
  defaultDataSetName: 'dataset', // default dataset name
  defaultTargetOperation: 'replace',
  defaultDownsample: 'random',
  name: 'Import HTML',  // plugin name
  thresholdColCount: 40,
  thresholdRowCount: 5000, // beyond this size datasets are considered large
}

let codapConfig = {
  name: constants.name,
  title: constants.name,
  version: 0.1
}

let config = {
  // attributeNames: null,
  collectionName: constants.defaultCollectionName,
  data: null,
  dataStartingRow: null,
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
  source: null,
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
      return name && (existingDatasetAttributeNames.indexOf(name) < 0);
    });
    return (unmatchedAttributeName == null);
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

let relativeTimeFormat = Intl.RelativeTimeFormat && new Intl.RelativeTimeFormat();

function relTime(time) {
  if (!(time instanceof Date)) {
    time = new Date(time);
  }
  let delta = (time - new Date())/1000;
  // Safari, as of 9/2019 does not implement RelativeTimeFormat, so we fake it
  if (!relativeTimeFormat) {
    return `${-Math.round(delta)} seconds ago`;
  }
  else if (Math.abs(delta) < 60) {
    return (relativeTimeFormat.format(Math.round(delta), 'second'));
  }
  else {
    (delta /= 60 )
  }
  if (Math.abs(delta) < 60) {
    return (relativeTimeFormat.format(Math.round(delta), 'minute'));
  }
  else {
    (delta /= 60 )
  }
  if (Math.abs(delta) < 24) {
    return (relativeTimeFormat.format(Math.round(delta), 'hour'));
  }
  else {
    delta /= 24;
    return (relativeTimeFormat.format(Math.round(delta), 'day'));
  }
}
/**
 * Autoimport applies if the dataset is short and could not already be present.
 *
 * @return {Promise<boolean>}
 */
async function determineIfAutoImportApplies() {
  let dataSetList = await codapHelper.retrieveDatasetList();
  let numRows = config.dataSet.table.length;
  let numberFormat = Intl.NumberFormat? new Intl.NumberFormat(): {format: function (n) {return n.toString();}};

  let matchingDataset = findDatasetMatchingAttributes(dataSetList, config.dataSet.attributeNames);
  if (matchingDataset) {
    config.matchingDataset = matchingDataset;
    uiControl.displayMessage('There already exists a dataset like this one,' +
        `"${matchingDataset.title}". It was uploaded ${relTime(matchingDataset.metadata.importDate)}.`,
        '#target-message');
    uiControl.setInputValue('target-operation', constants.defaultTargetOperation);
    uiControl.showSection('target-options', true);
    codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
  }

  let sizeAboveThreshold = (numRows > constants.thresholdRowCount);
  if (sizeAboveThreshold) {
    uiControl.displayMessage(`The HTML file, "${config.source}" has ${numberFormat.format(numRows)} rows.` +
      ` With more than ${numberFormat.format(constants.thresholdRowCount)} rows CODAP performance may be sluggish.` +
        ' You can work with a sample of the data at least at first, replacing it with the full dataset later.',
        '#downsample-message'
    );
    uiControl.showSection('downsample-options', true);
    uiControl.setInputValue('pick-interval', Math.round((numRows-1)/constants.thresholdRowCount) + 1);
    uiControl.setInputValue('random-sample-size', Math.min(numRows, constants.thresholdRowCount));
    uiControl.setInputValue('downsample', constants.defaultDownsample);
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
    attributeNames: config.dataSet.attributeNames,
    dataStartingRow: config.dataStartingRow,
    source: config.source,
    importDate: config.importDate,
  }
  return await codapHelper.defineDataSet(tableConfig);
}

async function handleFileInputs() {
  let url = uiControl.getInputValue('source-input-url');
  let file = uiControl.getInputValue('source-input-file');
  config.dataSet = await htmlImporter.retrieveData({url: url, file: file});
  if (config.dataSet) {
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
      config.dataSet.table = downsampleRandom(config.dataSet.table,
          Number(config.downsamplingTargetCount), config.dataStartingRow);
    } else if (config.downsampling === 'every-nth') {
      config.dataSet.table = downsampleEveryNth(config.dataSet.table,
          Number(config.downsamplingEveryNthInterval), config.dataStartingRow);
    }

    codapHelper.setVisibilityOfSelf(false);
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
  let data = config.dataSet.table;
  let result = null;
  if (config.operation === 'auto' || config.operation === 'new') {

    result = await createDataSetInCODAP(data, config);
    if (result && result.success) {
      config.datasetID = result.values.id;
    }
    codapHelper.openCaseTableForDataSet(config.datasetName);
    codapHelper.openTextBox(config.datasetName, config.dataSet.resourceDescription);
  }

  if (config.operation === 'append' || config.operation === 'replace') {
    config.datasetID = config.matchingDataset.id;
  }

  if (config.operation === 'replace') {
    result = await clearDatasetInCODAP(config.datasetID);
  }

  result = await codapHelper.sendRowsToCODAP(config.datasetID,
      config.dataSet.attributeNames, data, constants.chunkSize, config.dataStartingRow);
  if (result && result.success) {
    result = await codapHelper.closeSelf();
  }
  else {
    uiControl.displayError(
        (result && result.error) || "Error sending data to CODAP");
    codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
  }

  return result;
    // return populateFromDataThenExit(data, config);
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

  // initialize CODAP connection
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

    try {
      codapHelper.indicateBusy(true);
      config.dataSet = await htmlImporter.retrieveData(pluginState);
    } catch (ex) {
      uiControl.displayError(`There was an error loading this resource: "${config.source}" reason: "${ex}"`);
      codapHelper.setVisibilityOfSelf(true);
    } finally {
      codapHelper.indicateBusy(false);
    }

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
