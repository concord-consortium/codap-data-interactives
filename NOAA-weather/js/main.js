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
import * as stationDB from './noaaStations';
import {dataTypes, defaultDataTypes, dataTypeIDs} from './noaaDataTypes';
import {ui} from './noaa.ui';
import * as codapConnect from './CODAPconnect.js';
// import {noaaCDOConnect} from './noaa-cdo';
import {noaaNCEIConnect} from './noaa-ncei';

let constants = {
  defaultEnd: '2020-01-31',
  defaultStart: '2020-01-01',
  defaultStationID: 'USW00014755',
  dimensions: {height: 120, width: 333},
  DSName: 'NOAA-Weather',
  DSTitle: 'NOAA Weather',
  noaaBaseURL: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/',
  noaaToken: 'rOoVmDbneHBSRPVuwNQkoLblqTSkeayC',
  nceiBaseURL: 'https://www.ncei.noaa.gov/access/services/data/v1',
  recordCountLimit: 1000,
  tallDimensions: {height: 444, width: 333},
  version: 'v0005',
}

let state = {
  customDataTypes: null,
  database: null,
  endDate: null,
  selectedDataTypes: null,
  selectedStation: null,
  startDate: null,
};

async function initialize() {

  await codapConnect.initialize(constants);
  state = await codapConnect.getInteractiveState() || {};

  initializeState(state);

  codapConnect.createStationsDataset(stationDB.stations, stationSelectionHandler);
  codapConnect.addNotificationHandler('notify',
      `dataContextChangeNotice[${constants.DSName}]`, noaaWeatherSelectionHandler );

  ui.initialize(state, dataTypes, {
    dataTypeSelector: dataTypeSelectionHandler,
    dateChange: dateChangeHandler,
    frequencyControl: frequencyControlHandler,
    getData: noaaNCEIConnect.doGetHandler,
    newDataType: newDataTypeHandler,
  });

  noaaNCEIConnect.initialize(state, constants);
}

function initializeState(state) {
  const today = dayjs();
  const monthAgo = today.subtract(1, 'month');
  state.startDate = state.startDate || monthAgo.format('YYYY-MM-DD');
  state.endDate = state.endDate || today.format('YYYY-MM-DD');
  state.database = state.database || 'GHCND';

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
  ui.setStationName(state.selectedStation?state.selectedStation.name:'');
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
    ui.setMessage('"' + value + '" is not a valid NOAA CDO DataType');
  }
  ev.stopPropagation();
}

function frequencyControlHandler (event) {
  state.database = event.target.value;
}

function dateChangeHandler() {
  state.startDate = document.getElementById('startDate').value;
  state.endDate = document.getElementById('endDate').value;
}

function dataTypeSelectionHandler(ev) {
  if (this.type === 'checkbox') {
    setDataType(this.id, this.checked);
  }
}

initialize();
