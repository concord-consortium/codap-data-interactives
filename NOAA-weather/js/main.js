// ==========================================================================
//
//  Author:   jsandoe
//
//  Copyright (c) 2020 by The Concord Consortium, Inc. All rights reserved.
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
import {defaultDataTypes, dataTypes, dataTypeStore} from './noaaDataTypes.js';
import * as ui from './noaa.ui.js';
import * as codapConnect from './CODAPconnect.js';
import {noaaNCEIConnect} from './noaa-ncei.js';

// noinspection SpellCheckingInspection
let constants = {
  defaultEnd: '2020-01-31',
  defaultStart: '2020-01-01',
  defaultDateGranularity: 'day',
  defaultStationID: 'USW00014755',
  defaultStation:   {
    "elevation": 1911.7,
    "mindate": "1948-01-01",
    "maxdate": "2020-01-20",
    "latitude": 44.27018,
    "name": "MOUNT WASHINGTON, NH US",
    "datacoverage": 0.9994,
    "id": "USW00014755",
    "elevationUnit": "METERS",
    "longitude": -71.30336
  },
  defaultUnitSystem: 'metric',
  dimensions: {height: 490, width: 380},
  DSName: 'NOAA-Weather',
  DSTitle: 'NOAA Weather',
  StationDSName: 'US-Weather-Stations',
  StationDSTitle: 'US Weather Stations',
  noaaBaseURL: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/',
  noaaToken: 'rOoVmDbneHBSRPVuwNQkoLblqTSkeayC',
  nceiBaseURL: 'https://www.ncei.noaa.gov/access/services/data/v1',
  recordCountLimit: 1000,
  stationDatasetURL: './assets/data/weather-stations.json',
  version: 'v0011',
  reportTypeMap: {
    'daily-summaries': 'daily',
    'global-summary-of-the-month': 'monthly',
    'global-hourly': 'hourly',
    'global-summary-of-the-day': 'daily'
  }
}

let state = {
  database: null,
  dateGranularity: null,
  endDate: null,
  sampleFrequency: null,
  selectedDataTypes: null,
  selectedStation: null,
  startDate: null,
  unitSystem: null
};

function selectHandler() {
  codapConnect.selectSelf();
}

async function initialize() {
  let isConnected = false;
  let documentState = {};
  ui.setTransferStatus('transferring', 'Connecting to CODAP');
  try {
    isConnected = await codapConnect.initialize(constants);
    documentState = await codapConnect.getInteractiveState() || {};
  } catch (ex) {
    console.log('Connection to codap unsuccessful.')
  }

  try {
    const stationDatasetName = constants.StationDSName;
    const stationCollectionName = constants.StationDSTitle;
    initializeState(documentState);

    if (isConnected) {
      let hasStationDataset = await codapConnect.hasDataset(stationDatasetName);
      if (!hasStationDataset) {
        ui.setTransferStatus('retrieving', 'Fetching weather station data');
        let dataset = await fetchStationDataset('./assets/data/weather-stations.json');
        ui.setTransferStatus('transferring', 'Sending weather station data to CODAP')
        await codapConnect.createStationsDataset(stationDatasetName, stationCollectionName, dataset);
      }
      await codapConnect.addNotificationHandler('notify',
          `dataContextChangeNotice[${constants.StationDSName}]`, stationSelectionHandler)

      // Set up notification handler to respond to Weather Station selection
      await codapConnect.addNotificationHandler('notify',
          `dataContextChangeNotice[${constants.DSName}]`, noaaWeatherSelectionHandler );
    }

    ui.setTransferStatus('transferring', 'Initializing User Interface');
    ui.initialize(state, dataTypes, {
      selectHandler: selectHandler,
      dataTypeSelector: dataTypeSelectionHandler,
      frequencyControl: sourceDatasetSelectionHandler,
      getData: noaaNCEIConnect.doGetHandler,
      clearData: clearDataHandler,
      newDataType: newDataTypeHandler,
      dateRangeSubmit: dateRangeSubmitHandler,
      unitSystem: unitSystemHandler
    });

    noaaNCEIConnect.initialize(state, constants, {
      beforeFetchHandler: beforeFetchHandler,
      fetchSuccessHandler: fetchSuccessHandler,
      fetchErrorHandler: fetchErrorHandler});
    ui.setTransferStatus('success', 'Ready');
  } catch (ex) {
    console.warn("NOAA-weather failed init", ex);
  }
}

async function fetchStationDataset(url) {
  try {
    let tResult = await fetch(url);
    if (tResult.ok) {
      return await tResult.json();
    } else {
      let msg = await tResult.text();
      console.warn(`Failure fetching "${url}": ${msg}`);
    }
  } catch (ex) {
    console.warn(`Exception fetching "${url}": ${ex}`);
  }

}

function initializeState(documentState) {
  const today = dayjs();
  const monthAgo = today.subtract(1, 'month').toDate();
  state = documentState;
  state.startDate = state.startDate || monthAgo;
  state.endDate = state.endDate || today.toDate();
  state.database = state.database || 'daily-summaries';
  state.sampleFrequency = state.sampleFrequency
      || constants.reportTypeMap[documentState.database];

  state.selectedStation = state.selectedStation || constants.defaultStation;
  state.selectedDataTypes = state.selectedDataTypes || defaultDataTypes;
  state.unitSystem = state.unitSystem || constants.defaultUnitSystem;
}

function setDataType(type, isSelected) {
  let selectedTypes = state.selectedDataTypes;
  if (isSelected) {
    if(selectedTypes.indexOf(type) < 0) {
      selectedTypes.push(type);
    }
  } else {
    const typeIx = selectedTypes.indexOf(type);
    if (typeIx >= 0) {
      selectedTypes.splice(typeIx, 1);
    }
  }
}

/*
 * CODAP Notification Handlers
 */
async function noaaWeatherSelectionHandler(req) {
  if (req.values.operation === 'selectCases') {
    const myCases = req.values.result && req.values.result.cases;
    const myStations = myCases.filter(function (myCase) {
      return (myCase.collection.name === constants.DSName);
    }).map(function (myCase) {
      return (myCase.values.where);
    });
    await codapConnect.selectStations(myStations);
  }
}

async function stationSelectionHandler(req) {
  if (req.values.operation === 'selectCases') {
    let result = req.values.result;
    let myCase = result && result.cases && result.cases[0];
    state.selectedStation = myCase.values;
    ui.updateView(state);
    ui.setTransferStatus('inactive', 'Selected new weather station');
  }
}

function convertUnits(fromUnitSystem, toUnitSystem, data) {
  data.forEach(function (item) {
    Object.keys(item).forEach(function (prop) {
      let dataType = dataTypeStore.findByName(prop);
      if (dataType && dataType.convertUnits) {
        item[prop] = dataType.convertUnits(dataType.units[fromUnitSystem], dataType.units[toUnitSystem], item[prop]);
      }
    });
  });
}

async function updateUnitsInExistingItems(oldUnitSystem, newUnitSystem) {
  // fetch existing items in existing dataset
  let allItems = await codapConnect.getAllItems(constants.DSName);
  // convert from old units to new units
  convertUnits(oldUnitSystem, newUnitSystem, allItems)
  // clear dataset
  await codapConnect.clearData(constants.DSName);
  // insert items
  await codapConnect.createNOAAItems(constants, allItems, getSelectedDataTypes(), newUnitSystem)
}

function unitSystemHandler(unitSystem) {
  if (unitSystem && (unitSystem != state.unitSystem)) {
    updateUnitsInExistingItems(state.unitSystem, unitSystem);
    state.unitSystem = unitSystem;
  }
  ui.updateView(state);
}

/*
 * DOM Event Handlers
 */
function newDataTypeHandler(ev) {
  // get value
  let value = ev.target.value;
  // verify that datatype exists
  if (value && (dataTypeIDs.indexOf(value) >= 0)) {
    // make new record
    dataTypes[value] = {name: value};
    // make new datatype checkbox
    const newCheckHTML = ui.makeNewCheckbox(value, value, true);
    ui.insertCheckboxAtEnd(newCheckHTML);
    // clear current input
    ev.target.value = '';
    ev.target.focus();
    // add datatype selection to state
    setDataType(value, true);
    // add custom datatype to stat
    if (!state.customDataTypes) {
      state.customDataTypes = [];
    }
    state.customDataTypes.push(value);
  } else if (value) {
    ui.setTransferStatus('failure', '"' + value + '" is not a valid NOAA DataType');
  }
  ev.stopPropagation();
}

async function clearDataHandler() {
  console.log('clear data!')
  ui.setTransferStatus('clearing', 'Clearing data')
  let result = await codapConnect.clearData(constants.DSName);
  let status = result && result.success? 'success': 'failure';
  let message = result && result.success? `Cleared the ${constants.DSName} dataset`: result.message;
  ui.setTransferStatus(status, message);
}

function sourceDatasetSelectionHandler (event) {
  state.database = event.target.value;
  state.sampleFrequency = constants.reportTypeMap[state.database];
  ui.updateView(state);
}

function dataTypeSelectAllHandler(el/*, ev*/) {
  let isChecked = el.checked;
  if (el.type === 'checkbox') {
    Object.keys(dataTypes).forEach(function (key) {
      setDataType(key, isChecked);
    });
    setDataType('all-datatypes', isChecked);
    ui.setTransferStatus('inactive',
        `${isChecked?'': 'un'}selected all attributes`);
  }
}

function dataTypeSelectionHandler(ev) {
  if (this.id === 'all-datatypes') {
    dataTypeSelectAllHandler(this, ev);
  } else if (this.type === 'checkbox') {
    setDataType(this.id, this.checked);
    ui.setTransferStatus('inactive', `${this.checked?'': 'un'}selected ${dataTypes[this.id].name}`);
  }
  ui.updateView(state);
}

/**
 * Values will have a {startDate, endDate} combination. We create
 * state.startDate and state.endDate and update the view.
 * @param values {{startDate,endDate}}
 */
function dateRangeSubmitHandler(values) {
  state.startDate = values.startDate;
  state.endDate = values.endDate || values.startDate;
  ui.updateView(state);
}
function beforeFetchHandler() {
  ui.setWaitCursor(true);
  ui.setTransferStatus('retrieving',
      'Fetching weather records from NOAA');
}

function fetchSuccessHandler(data) {
  let reportType = constants.reportTypeMap[state.database];
  let unitSystem = state.unitSystem;
  let dataRecords = [];
  if (data) {
    data.forEach((r) => {
      const aValue = noaaNCEIConnect.convertNOAARecordToValue(r);
      aValue.latitude = aValue.station.latitude;
      aValue.longitude = aValue.station.longitude;
      aValue.elevation = aValue.station.elevation;
      aValue['report type'] = reportType;
      dataRecords.push(aValue);
    });
    ui.setMessage('Sending weather records to CODAP')
    codapConnect.createNOAAItems(constants, dataRecords,
        getSelectedDataTypes(), unitSystem)
        .then(
            function (result) {
              ui.setTransferStatus('success', `Retrieved ${dataRecords.length} cases`);
              ui.setWaitCursor(false);
              return result;
            },
            function (msg) {
              ui.setTransferStatus('failure', msg);
              ui.setWaitCursor(false);
            }
        );
  } else {
    ui.setTransferStatus('success', 'No data retrieved');
    ui.setWaitCursor(false);
  }
}

function getSelectedDataTypes () {
  return state.selectedDataTypes.filter(function (dt) {
    return !!dataTypes[dt];
  }).map(function (typeName) {
    return dataTypes[typeName];
  });
}

function fetchErrorHandler(statusMessage, resultText) {
  if (resultText && resultText.length && (resultText[0] === '<')) {
    try {
      let xmlDoc = new DOMParser().parseFromString(resultText, 'text/xml');
      statusMessage = xmlDoc.getElementsByTagName('userMessage')[0].innerHTML;
      statusMessage += '(' + xmlDoc.getElementsByTagName(
          'developerMessage')[0].innerHTML + ')';
    } catch (e) {
    }
  }
  console.warn('fetchErrorHandler: ' + resultText);
  console.warn("fetchErrorHandler error: " + statusMessage);
  ui.setTransferStatus("failure", statusMessage);
  ui.setWaitCursor(false);
}

export {constants};

initialize();
