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
/* global noaa */
import * as stationDB from './noaaStations.js';
import {dataTypes, defaultDataTypes, dataTypeIDs} from './noaaDataTypes.js';
import * as ui from './noaa.ui.js';
import * as codapConnect from './CODAPconnect.js';
// import {noaaCDOConnect} from './noaa-cdo';
import {noaaNCEIConnect} from './noaa-ncei.js';

let constants = {
  defaultEnd: '2020-01-31',
  defaultStart: '2020-01-01',
  defaultDateGranularity: 'day',
  defaultStationID: 'USW00014755',
  dimensions: {height: 490, width: 380},
  DSName: 'NOAA-Weather',
  DSTitle: 'NOAA Weather',
  noaaBaseURL: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/',
  noaaToken: 'rOoVmDbneHBSRPVuwNQkoLblqTSkeayC',
  nceiBaseURL: 'https://www.ncei.noaa.gov/access/services/data/v1',
  recordCountLimit: 1000,
  version: 'v0007',
  reportTypeMap: {
    'daily-summaries': 'daily',
    'global-summary-of-the-month': 'monthly',
    'global-hourly': 'hourly',
    'global-summary-of-the-day': 'daily'
  }
}

let state = {
  customDataTypes: null,
  database: null,
  dateGranularity: null,
  endDate: null,
  sampleFrequency: null,
  selectedDataTypes: null,
  selectedStation: null,
  startDate: null,
};

async function initialize() {

  try {
    await codapConnect.initialize(constants);
    state = await codapConnect.getInteractiveState() || {};
  } catch (ex) {
    console.log('Connection to codap unsuccessful.')
  }

  try {

    initializeState(state);

    codapConnect.createStationsDataset(stationDB.stations, stationSelectionHandler);

    // Set up notification handler to respond to Weather Station selection
    codapConnect.addNotificationHandler('notify',
        `dataContextChangeNotice[${constants.DSName}]`, noaaWeatherSelectionHandler );

    ui.initialize(state, dataTypes, {
      dataTypeSelector: dataTypeSelectionHandler,
      frequencyControl: sourceDatasetSelectionHandler,
      getData: noaaNCEIConnect.doGetHandler,
      newDataType: newDataTypeHandler,
      dateRangeSubmit: dateRangeSubmitHandler
    });

    noaaNCEIConnect.initialize(state, constants);
  } catch (ex) {
    console.warn("NOAA-weather failed init", ex);
  }
}


function initializeState(state) {
  const today = dayjs();
  const monthAgo = today.subtract(1, 'month').toDate();
  state.startDate = state.startDate || monthAgo;
  state.endDate = state.endDate || today.toDate();
  state.database = state.database || 'daily-summaries';
  state.sampleFrequency = constants.reportTypeMap[state.database];

  state.selectedStation = state.selectedStation || stationDB.findStation(constants.defaultStationID);
  state.selectedDataTypes = state.selectedDataTypes || defaultDataTypes;
  state.customDataTypes && state.customDataTypes.forEach(function (name) {
    dataTypes[name] = {name:name};
  });
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

function stationSelectionHandler(stationID) {
  state.selectedStation = stationID? stationDB.findStation(stationID) : null;
  ui.updateView(state);
  ui.setTransferStatus('inactive', 'Selected new weather station');
}

/*
 * DOM Event Handlers
 */
function newDataTypeHandler(ev) {
  // get value
  var value = ev.target.value;
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

function sourceDatasetSelectionHandler (event) {
  state.database = event.target.value;
  state.sampleFrequency = constants.reportTypeMap[state.database];
  ui.updateView(state);
}

function dataTypeSelectAllHandler(el, ev) {
  let isChecked = el.checked;
  if (el.type === 'checkbox') {
    Object.keys(dataTypes).forEach(function (key) {
      setDataType(key, isChecked);
    });
    setDataType('all-datatypes', isChecked);
    ui.setTransferStatus('inactive', 'selected all attributes');
  }
}

function dataTypeSelectionHandler(ev) {
  if (this.id === 'all-datatypes') {
    dataTypeSelectAllHandler(this, ev);
  } else if (this.type === 'checkbox') {
    setDataType(this.id, this.checked);
    ui.setTransferStatus('inactive', 'selected an attribute');
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

export {constants};

initialize();
