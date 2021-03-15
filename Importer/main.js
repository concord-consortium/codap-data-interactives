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
/* global Intl */
import * as uiControl from './modules/uiControl.js';
import * as codapHelper from './modules/codapHelper.js';
import * as csvImporter from './modules/csvImporter.js';
import * as htmlImporter from './modules/htmlImporter.js';
import * as geoJSONImporter from './modules/geoJSONImporter.js';

let constants = {
  chunkSize: 200, // number of items to transmit at a time
  defaultAttrName: 'attr', // default attribute name prefix
  defaultCollectionName: 'cases', // default collection name
  defaultImportsCollectionName: 'imports',
  defaultDataSetName: 'dataset', // default dataset name
  defaultContentType: 'text/csv',
  defaultTargetOperation: 'replace',
  defaultDownsample: 'random',
  name: 'Importer',  // plugin name
  ordinal_attribute_name: '_import_index_',
  ordinal_attribute_type: 'categorical',
  thresholdColCount: 40,
  thresholdRowCount: 5000, // beyond this size datasets are considered large
}
constants.reserved_attribute_names = [constants.ordinal_attribute_name];

let codapConfig = {
  name: constants.name,
  title: constants.name,
  dimensions: {width: 300, height: 200},
  version: "v1.0"
}

let config = {
  // attributeNames: null,
  collectionName: constants.defaultCollectionName,
  contentType: constants.defaultContentType,
  childCollectionName: constants.defaultCollectionName,
  createKeySubcollection: false, // key subcollection supports the lookupBoundary()
                                // codap function and is not generally necessary
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
  targetDatasetName: null, // will be set in pluginState to indicate an explicit
                           // assignment of this import to this dataset
}

/**
 * Attempts to identify whether there is a matching dataset to the one currently
 * under consideration. Does this by comparing metadata.
 * @param {[{}]}   datasetList
 * @param {string} resourceName
 */
function findMatchingSource(datasetList, resourceName) {
  // console.log('findMatchingSource: list size: ' + (datasetList?datasetList.length:0));
  return datasetList && datasetList.find(function (dataset) {
    return dataset.metadata && dataset.metadata.source === resourceName;
  });
}

/**
 *
 * @param datasetList {[{}]}
 * @param attributeNames [string]
 * @return {*|number}
 */
function findDatasetMatchingAttributes(datasetList, attributeNames) {
  function canonicalize(s) {
    // convert whitespace and underscores
    return s.replace(/\s/g, '_');
  }
  let canonicalAttributeNames = attributeNames.map(function (name) {
    let parts = codapHelper.analyzeRawName(name, true);
    return canonicalize(parts.baseName);
  });
  return datasetList && datasetList.find(function (dataset) {
    let existingDatasetAttributeNames = [];
    dataset.collections && dataset.collections.forEach(function (collection) {
      collection.attrs && collection.attrs.forEach(function (attr) {
        let parts = codapHelper.analyzeRawName(attr.name || attr.title, true);
        if (!constants.reserved_attribute_names.includes(parts.baseName)) {
          existingDatasetAttributeNames.push(canonicalize(parts.baseName));
        }
      });
    });
    let unmatchedAttributeName = canonicalAttributeNames.find(function (name) {
      return name && (existingDatasetAttributeNames.indexOf(name) < 0);
    });
    return (unmatchedAttributeName == null);
  });
}


/**
 * Makes sure plugin can be displayed.
 */
function adjustPluginHeight() {
  let pageHeight = uiControl.getHeight();
  let pluginHeight = config.pluginState && config.pluginState.dimensions && config.pluginState.dimensions.height;
  if (!pluginHeight || pageHeight>pluginHeight) {
    // noinspection JSIgnoredPromiseFromCall
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

function prepareKnownTargetDatasetDialog() {
  const kAttrListLimit = 10;
  uiControl.setInputValue('target-operation', constants.defaultTargetOperation);

  let dsName = config.targetDatasetName;
  let sourceDataset = config.sourceDataset;
  let rows = (sourceDataset
      && sourceDataset.table
      && (sourceDataset.table.length)) || 0;
  if (sourceDataset.firstRowIsAttrList)
    rows = rows - 1;
  let attrCount = (sourceDataset && sourceDataset.attributeNames
      && sourceDataset.attributeNames.length) || 0;
  let attrList = (sourceDataset && sourceDataset.attributeNames &&
      sourceDataset.attributeNames.slice(0, kAttrListLimit).reduce(function (a, attrName, ix) {
        let joiner = (ix === 0)? ''
            : (ix < sourceDataset.attributeNames.length - 1)? ', '
                : ', and ';
        return a + joiner + attrName;
      }, '')
  ) || '';
  let attrListEnd = (sourceDataset
      && sourceDataset.attributeNames
      && sourceDataset.attributeNames.length > kAttrListLimit) ? '...': '.';

  uiControl.displayMessage(`Preparing to import into <em>${dsName}</em>, 
        ${rows} rows from a table with ${attrCount} attributes: ${attrList}${attrListEnd}`
      , '#target-message');
  uiControl.showSection('target-options', true);
  // do not show the new dataset option
  uiControl.showSection('new-dataset-option', false);
  codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);

}

function prepareFoundTargetDatasetDialog(matchingDataset) {
  let matchingMetadata = matchingDataset.metadata || {};
  let uploadTimeSentence = matchingMetadata.importDate
      ? `It was uploaded ${relTime(matchingMetadata.importDate)}.`
      : '';

  uiControl.displayMessage('There already exists a dataset like this one,' +
      ` named "${matchingDataset.title}". ${uploadTimeSentence}`,
      '#target-message');
  uiControl.setInputValue('target-operation', constants.defaultTargetOperation);
  uiControl.showSection('target-options', true);
  codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
}

function prepareSizeAboveThresholdDialog(numRows) {
  let numberFormat = Intl.NumberFormat? new Intl.NumberFormat(): {format: function (n) {return n.toString();}};
  uiControl.displayMessage(`The imported file, "${config.source}" has ${numberFormat.format(numRows)} rows.` +
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

/**
 * Autoimport applies if the dataset is short, could not already be present, and
 * there is no targetDataset already designated.
 *
 * @param dataSetList {[{}]} Array of definitions of existing CODAP datasets. Structure of
 *   dataset definitions aligns with structure in a saved CODAP document.
 * @return {Promise<boolean>}
 */
async function determineIfAutoImportApplies(dataSetList) {
  // if we have been given the name of the target dataset...
  if (config.targetDatasetName) {
    config.matchingDataset = dataSetList.find(function (dataSet) {
      return dataSet.name === config.targetDatasetName;
    });
    prepareKnownTargetDatasetDialog();
 }
  // or else, if we have found a likely matching dataset by query
  else {
    let matchingDataset = findDatasetMatchingAttributes(dataSetList, config.sourceDataset.attributeNames);
    if (matchingDataset) {
      config.matchingDataset = matchingDataset;
      prepareFoundTargetDatasetDialog(matchingDataset);
    }
  }

  let numRows = config.sourceDataset.table.length;
  let sizeAboveThreshold = (numRows > constants.thresholdRowCount);
  if (sizeAboveThreshold) {
    prepareSizeAboveThresholdDialog(numRows)
  }
  return !(config.matchingDataset || sizeAboveThreshold);
}


/**
 * Downsamples a dataset by random selection without replacement.
 * @param data {[[]]}
 * @param targetCount {Number} Positive integer
 * @param start {Number} Index of first row with data.
 * @return {[[]]}
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
 * @param data {[[]]}
 * @param interval {number}
 * @param start {number} Index of the first row that has data
 * @return {[[]]}
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
    datasetName: config.sourceDataset.datasetName,
    collectionName: config.collectionName,
    attributeNames: config.sourceDataset.attributeNames,
    dataStartingRow: config.dataStartingRow,
    source: config.source,
    importDate: config.importDate,
  }
  return await codapHelper.defineDataSet(tableConfig);
}

async function updateDataSetInCODAP(config, isReplace) {
  let tableConfig = {
    datasetName: config.datasetName,
    attributeNames: config.sourceDataset.attributeNames,
    importDate: config.importDate,
    collectionName: config.collectionName,
    source: config.source,
    isReplace: isReplace
  }
  return await codapHelper.defineDataSet(tableConfig);
}

function inferContentType(file, url) {
//TBD
}

/**
 * Makes unique names from existing array of names by adding an ordinal.
 * @param  nameArray [string] Array of names
 * @return [string]
 */
function makeUniqueNames(nameArray) {
  if (!nameArray) {
    return [];
  }
  let newNames = [];
  nameArray.forEach(function (name) {
    let ix = 0;
    let uname = name;
    while(newNames.includes(uname)) {
      uname = name + (++ix);
    }
    newNames.push(uname);
  });
  return newNames;
}

/**
 * Retrieve and process data
 * @param {{contentType, file, url, source, text, datasetName}} retrievalProperties
 * @return {Promise<{object}>}
 */
async function retrieveData(retrievalProperties) {
  let contentType = retrievalProperties.contentType;
  let dataset = null;
  if (!contentType) {
    contentType = inferContentType(retrievalProperties.file, retrievalProperties.url);
  }
  if (contentType === 'text/csv' || contentType === 'text/plain') {
    dataset = await csvImporter.retrieveData(retrievalProperties);
  }
  else if (contentType === 'text/html') {
    dataset = htmlImporter.retrieveData(retrievalProperties);
  }
  else if (contentType === 'application/geo+json') {
    dataset = geoJSONImporter.retrieveData(retrievalProperties);
  }
  if (dataset) {
    dataset.rawAttributeNames = dataset.attributeNames;
    dataset.attributeNames = makeUniqueNames(dataset.rawAttributeNames);
  }
  return dataset;
}

async function handleFileInputs() {
  let url = uiControl.getInputValue('source-input-url');
  let file = uiControl.getInputValue('source-input-file');
  config.sourceDataset = await retrieveData({url: url, file: file});
  let exitingDatasets = await codapHelper.retrieveDatasetList();
  if (config.sourceDataset) {
    let isAuto = await determineIfAutoImportApplies(exitingDatasets);
    if (isAuto) {
      await importDataIntoCODAP();
    }
  } else {
    await codapHelper.closeSelf();
  }
}

/**
 * Orchestrates sending data to codap according to user selections.
 *
 */
function handleSubmit() {
  if (config.sourceDataset && config.sourceDataset.table) {
    // downsample = all | random | every-nth | first-n | last-n
    config.downsampling = uiControl.getInputValue('downsample');
    // operation = new | replace | append
    config.operation = uiControl.getInputValue('target-operation');
    config.downsamplingTargetCount = uiControl.getInputValue(
        'random-sample-size');
    config.downsamplingEveryNthInterval = uiControl.getInputValue(
        'pick-interval');

    if (config.downsampling === 'random') {
      config.sourceDataset.table = downsampleRandom(config.sourceDataset.table,
          Number(config.downsamplingTargetCount), config.sourceDataset.dataStartingRow);
    } else if (config.downsampling === 'every-nth') {
      config.sourceDataset.table = downsampleEveryNth(config.sourceDataset.table,
          Number(config.downsamplingEveryNthInterval), config.sourceDataset.dataStartingRow);
    }

    codapHelper.setVisibilityOfSelf(false);
    importDataIntoCODAP();
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
 * Compute new import ordinal value. This is one greater than the greatest
 * existing ordinal.
 * @param datasetID {string|number}
 * @param collectionID {string|number}
 * @param ordinalAttributeName {string}
 * @return {Promise<number>}
 */
async function computeImportOrdinal(datasetID, collectionID, ordinalAttributeName) {
  let result = await codapHelper.sendToCODAP('get',
      `dataContext[${datasetID}].collection[${collectionID}].caseFormulaSearch[max(${ordinalAttributeName})=${ordinalAttributeName}]`);
  if (result.success) {
    let myCase = (Array.isArray(
        result.values)) ? result.values[0] : result.values;
    return myCase ? Number(
        myCase.values[constants.ordinal_attribute_name]) + 1 : 2;
  }
}

/**
 * Configures the ordinal attribute. An ordinal attribute is configured to
 * attach an index to each append import.
 * The attribute is appended to the source attribute list.
 * If it already exists we determine its highest existing value and add one to
 * set config.importOrdinal, the value to assign to the new import.
 * @return {Promise<void>}
 */
async function configureOrdinalAttribute() {
  let ordinalAttr = null;
  let ordinalCol = config.matchingDataset.collections.find(
      function (collection) {
        return collection.attrs.find(function (attr) {
          if (attr.name === constants.ordinal_attribute_name) {
            ordinalAttr = attr;
            return true;
          } else {
            return false;
          }
        })
      })

  if (ordinalAttr) {
    // we are appending and there is an ordinal attribute, so we need to find
    // the max ordinal value and set one higher
    config.importOrdinal = await computeImportOrdinal(config.matchingDataset.id,
        ordinalCol.id, constants.ordinal_attribute_name);
  } else {
    // we are appending and there is no ordinal attribute, so we need to
    // modify the dataset to add a root collection with the ordinal attribute
    // as its single attribute and set the ordinal value to two
    config.importOrdinal = 2;
    await codapHelper.createParentCollection(config.datasetID, constants.defaultImportsCollectionName, [
        {
          name: constants.ordinal_attribute_name,
          type: constants.ordinal_attribute_type
        }
      ]);
    let myCase = await codapHelper.getCaseByIndex(config.datasetID, constants.defaultImportsCollectionName, 0);
    if (myCase) {
      myCase.values[constants.ordinal_attribute_name] = 1;
      await codapHelper.updateCase(config.datasetID, constants.defaultImportsCollectionName, myCase)
    }
  }
  config.sourceDataset.attributeNames.push(constants.ordinal_attribute_name);
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
async function importDataIntoCODAP() {
  try {
    let data = config.sourceDataset.table;
    let result = null;
    let caseTableID = null;
    if (config.operation === 'auto' || config.operation === 'new') {

      result = await createDataSetInCODAP(data, config);
      if (result && result.success) {
        config.datasetID = result.values.id;
      }
      result = await codapHelper.openCaseTableForDataSet(config.sourceDataset.datasetName);
      if (result && result.success) {
        caseTableID = result.values.id;
      }
      // codapHelper.openTextBox(config.sourceDataset.datasetName, config.sourceDataset.resourceDescription);
      if (config.contentType === 'application/geo+json') {
        await codapHelper.openMap();
      }
    }

    if (config.operation === 'append' || config.operation === 'replace') {
      config.datasetID = config.matchingDataset.id;
      config.datasetName = config.matchingDataset.name;
      if (config.operation === 'replace') {
        // we are replacing, so we need to remove the existing data and
        // the ordinal attribute and collection
        result = await clearDatasetInCODAP(config.datasetID);
      } else {
        await configureOrdinalAttribute();

        // modify the dataset to add the ordinal
        let ordinalAttrIx = config.sourceDataset.attributeNames.findIndex(function (name) {
          return name === constants.ordinal_attribute_name;
        });
        data.forEach(function (row, ix) {
          if (ix >= config.sourceDataset.dataStartingRow) {
            row[ordinalAttrIx] = config.importOrdinal;
          }
        })
      }
      await updateDataSetInCODAP(config, config.operation === 'replace');
    }

    result = await codapHelper.sendRowsToCODAP(config.datasetID,
        config.sourceDataset.attributeNames, data, constants.chunkSize,
        config.sourceDataset.dataStartingRow);
    if (result.success && caseTableID && config.sourceDataset.attributeNames.length <= 4) {
      result = await codapHelper.autoscaleComponent(caseTableID);
    }

    if (result && result.success) {
      if (caseTableID !== null) {
        setTimeout(async function () {
          await codapHelper.selectComponent(caseTableID);
          result = await codapHelper.closeSelf();
        }, 500);
      } else {
        result = await codapHelper.closeSelf();
      }
    }
    else {
      uiControl.displayError(
          (result && result.error) || "Error sending data to CODAP");
      codapHelper.setVisibilityOfSelf(true).then(adjustPluginHeight);
    }

    return result;
    // return populateFromDataThenExit(data, config);
  }
  catch (ex){
    uiControl.displayError('Could not import this file -- ' + ex);
  }
}

function ensureUniqueDatasetName(proposedName, existingDatasetDefs) {
  let newName = proposedName
  let existingNames = existingDatasetDefs? existingDatasetDefs.map(function (dsd) {
    return dsd.name || dsd.title;
  }): [];
  while (existingNames.includes(newName)) {
    let match = /^(.*)_([0-9]+)$/.exec(newName);
    if (match) {
      newName = `${match[1]}_${Number(match[2])+1}`;
    } else {
      newName = `${newName}_1`;
    }
  }
  return newName;
}

function handleCancelEvent(ev) {
  ev.preventDefault();
  codapHelper.closeSelf();
  return false;
}

function handleSubmitEvent(ev) {
  ev.preventDefault();
  handleSubmit();
  return false;
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
  uiControl.installButtonHandler('#cancel', handleCancelEvent);
  uiControl.installKeystrokeHandler('Escape', handleCancelEvent)
  uiControl.installButtonHandler('#submit', handleSubmitEvent);
  uiControl.installKeystrokeHandler('Enter', handleSubmitEvent);

  // initialize CODAP connection
  let pluginState = await codapHelper.init(codapConfig)

  // console.log('pluginState: ' + pluginState && JSON.stringify(pluginState));
  config.pluginState = pluginState;

  await codapHelper.setVisibilityOfSelf(false);

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
      await codapHelper.indicateBusy(true);
      config.sourceDataset = await retrieveData(pluginState);
    } catch (ex) {
      uiControl.displayError(`There was an error loading this resource: "${config.source}" reason: "${ex}"`);
      // uiControl.showSection('source-input');
      await codapHelper.setVisibilityOfSelf(true);
      return;
    } finally {
      await codapHelper.indicateBusy(false);
    }
    if (!config.sourceDataset || !config.sourceDataset.table) {
      uiControl.displayMessage("Could not find tabular data in a format that can be imported into CODAP");
      // uiControl.showSection('source-input');
      await codapHelper.setVisibilityOfSelf(true);
    }
    else {
      let exitingDatasets = await codapHelper.retrieveDatasetList();
      config.sourceDataset.datasetName = ensureUniqueDatasetName(config.datasetName, exitingDatasets);
      let autoImport = await determineIfAutoImportApplies(exitingDatasets);
      if (autoImport) {
        await importDataIntoCODAP();
      }
    }
  } else {
    uiControl.showSection('source-input', true);
    await codapHelper.setVisibilityOfSelf(true);
  }
}

main();
