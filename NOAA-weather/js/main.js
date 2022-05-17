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
/*global dayjs:true */
import {dataTypeStore} from './noaaDataTypes.js';
import * as ui from './noaa.ui.js';
import * as codapConnect from './CODAPconnect.js';
import {noaaNCEIConnect} from './noaa-ncei.js';

// get the date part of the current date/time
let today = dayjs(dayjs().format('MM/DD/YYYY'));

// noinspection SpellCheckingInspection
let constants = {
  defaultNoaaDataset: 'global-hourly',
  defaultStation:   {
    "country":"US",
    "state":"NH",
    "latitude":44.27,
    "longitude":-71.303,
    "name":"MT. WASHINGTON OBSERVATORY",
    "elevation":6272,
    "ICAO":"KMWN",
    "mindate":"1973-01-01",
    "maxdate":"present",
    "isdID":"72613014755,72613099999",
    "ghcndID": 'USW00014755'
  },
  defaultStationTimezoneOffset: -5,
  defaultStationTimezoneName: 'EST',
  defaultDates: {
    'hourly': {
      start: today.subtract(4, 'week').toDate(),
      end: today.subtract(1, 'day').toDate()
    },
    'daily': {
      start: today.subtract(4, 'month').toDate(),
      end: today.subtract(1, 'day').toDate()
    },
    'monthly': {
      start: today.subtract(10, 'year').toDate(),
      end: today.toDate()
    }
  },
  defaultCoords: {
    latitude: 44.27,
    longitude: -71.303
  },
  defaultUnitSystem: 'standard',
  dimensions: {height: 490, width: 380},
  DSName: 'NOAA-Weather',
  DSTitle: 'NOAA Weather',
  geonamesUser: 'codap',
  noaaBaseURL: 'https://www.ncdc.noaa.gov/cdo-web/api/v2/', // may be obsolescent
  noaaToken: 'rOoVmDbneHBSRPVuwNQkoLblqTSkeayC', // may be obsolescent
  nceiBaseURL: 'https://www.ncei.noaa.gov/access/services/data/v1',
  recordCountLimit: 1000, // may be obsolescent
  reportTypeMap: {
    'daily-summaries': 'daily',
    'global-summary-of-the-month': 'monthly',
    'global-hourly': 'hourly',
    'global-summary-of-the-day': 'daily'
  },
  stationDatasetURL: './assets/data/weather-stations.json',
  StationDSName: 'US-Weather-Stations',
  StationDSTitle: 'US Weather Stations',
  timezoneServiceURL: 'https://secure.geonames.org/timezoneJSON',
  version: 'v0013',
}

let state = {
  database: constants.defaultNoaaDataset,
  dateGranularity: null,
  sampleFrequency: null,
  selectedDataTypes: null,
  selectedStation: constants.defaultStation,
  stationTimezoneOffset: constants.defaultStationTimezoneOffset,
  stationTimezoneName: constants.defaultStationTimezoneName,
  userSelectedDate: null,
  startDate: null,
  endDate: null,
  unitSystem: constants.defaultUnitSystem,
  isFetchable: true,
};

/**
 * When plugin is clicked on, cause it to become the selected component in CODAP.
 */
function selectHandler() {
  codapConnect.selectSelf();
}

/**
 * We assume that the station dataset was prepared in the past but
 * stations that were active at the time of preparation are still active.
 * If they reported within a week of the dataset's max date, we mark the
 * max date as "present".
 * @param dataset
 */
function adjustStationDataset(dataset) {
  let maxDate = dataset.reduce(function (max, station) {
    let date = dayjs(station.maxdate);
    if (max == null || max.isBefore(date)) {
      max = date;
    }
    return max;
  }, null);
  if (maxDate) {
    let refDate = maxDate.subtract(1, 'week');
    dataset.forEach(function (station) {
      let d = dayjs(station.maxdate);
      if (d && d.isAfter(refDate)) {
        station.maxdate = 'present';
      }
    })
  }
}

/**
 *
 * @return {Promise<{latitude,longitude}>}
 */
async function getGeolocation () {
  return new Promise(function (resolve, reject) {
    if (navigator.geolocation && navigator.geolocation.getCurrentPosition) {
      navigator.geolocation.getCurrentPosition(function (pos) {
        resolve(pos.coords);
      }, function (err) {
        console.warn(
            `Weather Plugin.getGeolocation failed: ${err.code}, ${err.message}`);
        reject(err.message);
      });
    } else {
      reject('The GeoLocation API is not supported on this browser')
    }
  });
}

async function initialize() {
  let isConnected = false;
  let documentState = {};
  let needMap = false;

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
      await codapConnect.updateWeatherDataset([], documentState.unitSystem);
      let hasStationDataset = await codapConnect.hasDataset(stationDatasetName);
      if (!hasStationDataset) {
        ui.setTransferStatus('retrieving', 'Fetching weather station data');
        let dataset = await fetchStationDataset(constants.stationDatasetURL);
        adjustStationDataset(dataset);
        ui.setTransferStatus('transferring', 'Sending weather station data to CODAP')
        await codapConnect.createStationsDataset(stationDatasetName, stationCollectionName, dataset);
        if (! await codapConnect.hasMap()) {
          needMap = true;
        }
      }
      await codapConnect.addNotificationHandler('notify',
          `dataContextChangeNotice[${constants.StationDSName}]`, stationSelectionHandler)

      // Set up notification handler to respond to Weather Station selection
      await codapConnect.addNotificationHandler('notify',
          `dataContextChangeNotice[${constants.DSName}]`, noaaWeatherSelectionHandler );
    }

    ui.setTransferStatus('transferring', 'Initializing User Interface');
    ui.initialize(state, dataTypeStore, {
      selectHandler: selectHandler,
      dataTypeSelector: dataTypeSelectionHandler,
      frequencyControl: sourceDatasetSelectionHandler,
      getData: noaaNCEIConnect.doGetHandler,
      clearData: clearDataHandler,
      dateRangeSubmit: dateRangeSubmitHandler,
      unitSystem: unitSystemHandler,
      stationLocation: stationLocationHandler,
      mapOpen: mapOpenHandler,
      nearMe: nearMeHandler
    });

    noaaNCEIConnect.initialize(state, constants, {
      beforeFetchHandler: beforeFetchHandler,
      fetchSuccessHandler: fetchSuccessHandler,
      fetchErrorHandler: fetchErrorHandler});
    if (state.isFetchable) {
      ui.setTransferStatus('success', 'Ready');
    } else {
      ui.setTransferStatus('disabled', 'Weather station inactive in date range');
    }
  } catch (ex) {
    console.warn("NOAA-weather failed init", ex);
  }
}

function mapOpenHandler() {
  let station = state.selectedStation;
  let latLong = station && [station.latitude, station.longitude];
  codapConnect.createMap('Map', {height: 350, width: 500}, latLong, 7);
  codapConnect.selectStations([station.name]);
}

function nearMeHandler() {
  ui.setTransferStatus('busy', 'Finding current location');
  getGeolocation().then(
      function (coords) {
        ui.setTransferStatus('busy', 'Looking up nearest weather station');
        setNearestActiveStation(coords, state.startDate, state.endDate)
            .then( () => {
              ui.setTransferStatus('success', 'Found nearest active weather station');
            });
      },
      function (err) {
        console.warn(`Error getting geolocation: ${err}`);
        ui.setTransferStatus('failure', err);
      }
  );
}
/**
 *
 * @param url {string}
 * @return {Promise<any>}
 */
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

/**
 * Initializes state of plugin from that persisted in CODAP document.
 * We make our local `state` reference that state, so that CODAP will save
 * its values with the document.
 * @param documentState {object}
 */
function initializeState(documentState) {
  // sync documentState properties to state, for properties that are unassigned
  Object.keys(state).forEach(function (key) {
    if (documentState[key] == null) {
      documentState[key] = state[key];
    }
  });
  state = documentState;
  configureDates(state)
  state.sampleFrequency = state.sampleFrequency
      || constants.reportTypeMap[documentState.database];

  state.selectedDataTypes = state.selectedDataTypes || dataTypeStore.getDefaultDatatypes();
}

function areDatesInRangeForStation() {
  let inRange;
  // be optimistic in the face of ambiguity
  if (!state.startDate || !state.endDate || !state.selectedStation) {
    inRange = true;
  } else {
    let stationStart = dayjs(state.selectedStation.mindate);
    let stationEnd = dayjs(state.selectedStation.maxdate==='present'
        ? undefined
        : state.selectedStation.maxdate);
    inRange = !(stationStart.isAfter(dayjs(state.endDate)) ||
        stationEnd.isBefore(dayjs(state.startDate)));
  }
  return inRange;
}

function configureDates(state) {
  if (!state.userSelectedDate) {
    let frequency = constants.reportTypeMap[state.database];
    if (!frequency) {
      console.log(`Unable to map noaa dataset to frequency: ${state.database}`);
    } else {
      state.startDate = constants.defaultDates[frequency].start;
      state.endDate = constants.defaultDates[frequency].end;
    }
  }
}

function selectDataType(typeName, isSelected) {
  let selectedTypes = state.selectedDataTypes;
  if (isSelected) {
    if(selectedTypes.indexOf(typeName) < 0) {
      selectedTypes.push(typeName)
    }
  } else {
    const typeIx = selectedTypes.indexOf(typeName);
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
    const myStations = myCases && myCases.filter(function (myCase) {
      return (myCase.collection.name === constants.DSName);
    }).map(function (myCase) {
      return (myCase.values.where);
    });
    await codapConnect.selectStations(myStations);
  }
}

function updateTimezone(station) {
  const offsetMap = {
    "-4": 'AST',
    "-5": 'EST',
    "-6": 'CST',
    "-7": 'MST',
    "-8": 'PST',
    "-9": 'AKST',
    "-10": 'HST'
  }
  fetchTimezone(station.latitude, station.longitude).then(
      function (data) {
        state.stationTimezoneOffset = data.gmtOffset;
        state.stationTimezoneName = offsetMap[data.gmtOffset];
        console.log(`Timezone data for station ${station.name}: ${JSON.stringify(data)}`);
      },
      function (msg) {
        console.log(`Failure fetching timezone: ${msg}`);
      }
  )
}

async function stationSelectionHandler(req) {
  if (req.values.operation === 'selectCases') {
    let result = req.values.result;
    let myCase = result && result.cases && result.cases[0];
    if (myCase) {
      let station = myCase.values;
      state.selectedStation = myCase.values;
      ui.setTransferStatus('inactive', 'Selected new weather station');
      updateView();
      updateTimezone(station);
    }
  }
}

/**
 * Converts the data values according to unit system
 * @param fromUnitSystem {'metric'|'standard'}
 * @param toUnitSystem {'metric'|'standard'}
 * @param data {[object]}
 */
function convertUnits(fromUnitSystem, toUnitSystem, data) {
  if (fromUnitSystem === toUnitSystem) {
    return;
  }
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
  if (unitSystem && (unitSystem !== state.unitSystem)) {
    updateUnitsInExistingItems(state.unitSystem, unitSystem);
    state.unitSystem = unitSystem;
  }
  updateView();
}

/*
 * DOM Event Handlers
 */
async function clearDataHandler() {
  console.log('clear data!')
  ui.setTransferStatus('clearing', 'Clearing data')
  let result = await codapConnect.clearData(constants.DSName);
  if (result.success) {
    result = await codapConnect.deleteAttributes(constants.DSName, constants.DSTitle, state.selectedDataTypes);
  }
  let status = result && result.success? 'success': 'failure';
  let message = result && result.success? `Cleared the ${constants.DSName} dataset`: result.message;
  ui.setTransferStatus(status, message);
}

function sourceDatasetSelectionHandler (event) {
  state.database = event.target.value;
  state.sampleFrequency = constants.reportTypeMap[state.database];
  configureDates(state);
  updateView();
}

function dataTypeSelectAllHandler(el/*, ev*/) {
  let isChecked = el.checked;
  if (el.type === 'checkbox') {
    dataTypeStore.findAllByNoaaDataset(state.database).forEach(function (noaaType) {
      selectDataType(noaaType.name, isChecked);
    });
    selectDataType('all-datatypes', isChecked);
    ui.setTransferStatus('inactive',
        `${isChecked?'': 'un'}selected all attributes`);
  }
}

function dataTypeSelectionHandler(ev) {
  if (this.id === 'all-datatypes') {
    dataTypeSelectAllHandler(this, ev);
  } else if (this.type === 'checkbox') {
    selectDataType(this.id, this.checked);
    ui.setTransferStatus('inactive', `${this.checked?'': 'un'}selected ${dataTypeStore.findByName(this.id).name}`);
  }
  updateView();
}

function updateView() {
  let isFetchable = areDatesInRangeForStation();
  if (isFetchable && !state.isFetchable) {
    ui.setTransferStatus("inactive", "");
  }
  state.isFetchable = isFetchable;
  ui.updateView(state, dataTypeStore);
}

async function findNearestStation(lat, long) {
  let result = await codapConnect.queryCases(constants.StationDSName,
      constants.StationDSTitle,
      `greatCircleDistance(latitude, longitude, ${lat}, ${long})=min(greatCircleDistance(latitude, longitude, ${lat}, ${long}))`);
  if (result.success) {
    if (Array.isArray(result.values)) {
      // noinspection JSPotentiallyInvalidTargetOfIndexedPropertyAccess
      return result.values[0];
    } else {
      return result.values;
    }
  }
}
async function findNearestActiveStation(lat, long, fromDate, toDate) {
  if (typeof fromDate === 'string') {
    fromDate = new Date(fromDate);
  }
  if (typeof toDate === 'string') {
    toDate = new Date(toDate);
  }
  let fromSecs = fromDate/1000;
  let toSecs = toDate/1000;
  let result = await codapConnect.queryCases(constants.StationDSName,
      constants.StationDSTitle,
      `greatCircleDistance(latitude, longitude, ${lat}, ${long})=
      min(greatCircleDistance(latitude, longitude, ${lat}, ${long}), 
      ((${fromSecs}<maxdate or maxdate='present') and (${toSecs}>mindate)))`);
  if (result.success) {
    if (Array.isArray(result.values)) {
      // noinspection JSPotentiallyInvalidTargetOfIndexedPropertyAccess
      return result.values[0];
    } else {
      return result.values;
    }
  }
}

async function setNearestStation (location) {
  if (!location) {
    return;
  }
  console.log(`Location: ${JSON.stringify(location)}`);
  let nearestStation = await findNearestStation(location.latitude,
      location.longitude);
  if (nearestStation) {
    let station = nearestStation.values;
    state.selectedStation = station;
    await codapConnect.selectStations([state.selectedStation.name]);
    await codapConnect.centerAndZoomMap('Map',
        [location.latitude, location.longitude], 9);
    updateView();
    updateTimezone(station);
  }
}
async function setNearestActiveStation (location, startDate, endDate) {
  if (!location || !startDate || !endDate) {
    return;
  }
  console.log(`Location: ${JSON.stringify(location)} start: ${startDate}, end: ${endDate}`);
  let nearestStation = await findNearestActiveStation(location.latitude,
      location.longitude, startDate, endDate);
  if (nearestStation) {
    let station = nearestStation.values;
    state.selectedStation = station;
    await codapConnect.selectStations([state.selectedStation.name]);
    await codapConnect.centerAndZoomMap('Map',
        [location.latitude, location.longitude], 9);
    updateView();
    updateTimezone(station);
  }
}

async function stationLocationHandler (location) {
    await setNearestActiveStation(location, state.startDate, state.endDate);
}

/**
 * Retrieves timezone information from the geonames service.
 * The response object looks like this:
 *    {
 *      "sunrise": "2021-10-20 07:16",
 *      "lng": -121,
 *      "countryCode": "US",
 *      "gmtOffset": -8,
 *      "rawOffset": -8,
 *      "sunset": "2021-10-20 18:20",
 *      "timezoneId": "America/Los_Angeles",
 *      "dstOffset": -7,
 *      "countryName": "United States",
 *      "time": "2021-10-19 15:40",
 *      "lat": 37
 *    }
 * @param lat {number}
 * @param long {number}
 * @return {Promise<Object>}
 */
function fetchTimezone (lat, long) {
  return new Promise(function (resolve, reject) {
    let basicUrl = constants.timezoneServiceURL;
    let user = constants.geonamesUser;
    let url = `${basicUrl}?lat=${lat}&lng=${long}&username=${user}`;
    fetch(url).then(
      function (result) {
        if (result.ok) {
          resolve(result.json());
        } else {
          reject(result.statusText);
        }
      },
      function (msg) {
        reject(msg);
      }
    );
  });
}

/**
 * Values will have a {startDate, endDate} combination. We create
 * state.startDate and state.endDate and update the view.
 * @param values {{startDate,endDate}}
 */
function dateRangeSubmitHandler(values) {
  if (values.startDate !== state.startDate ||
      values.endDate !== state.endDate) {
    state.userSelectedDate = true;
  }
  state.startDate = values.startDate;
  state.endDate = values.endDate || values.startDate;
  updateView();
}

function getSelectedDataTypes () {
  return state.selectedDataTypes.filter(function (dt) {
    let noaaType = dataTypeStore.findByName(dt);
    return noaaType && noaaType.isInDataSet(state.database);
  }).map(function (typeName) {
    return dataTypeStore.findByName(typeName);
  });
}

/**
 * Called before weather data is fetched.
 */
function beforeFetchHandler() {
  ui.setWaitCursor(true);
  ui.setTransferStatus('retrieving',
      'Fetching weather records from NOAA');
}

/**
 * Called with results from successful fetch of weather data.
 * @param data {{}}
 */
function fetchSuccessHandler(data) {
  let reportType = constants.reportTypeMap[state.database];
  let unitSystem = state.unitSystem;
  let utcOffset = state.stationTimezoneOffset;
  let timezoneName = state.stationTimezoneName;
  let dataRecords = [];
  if (data) {
    data.forEach((r) => {
      const aValue = noaaNCEIConnect.convertNOAARecordToValue(r);
      aValue.latitude = aValue.station.latitude;
      aValue.longitude = aValue.station.longitude;
      aValue['UTC offset'] = utcOffset;
      aValue['timezone'] = timezoneName;
      aValue.elevation = aValue.station.elevation;
      aValue['report type'] = reportType;
      dataRecords.push(aValue);
    });
    convertUnits('metric', unitSystem, dataRecords);
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

/**
 * Called in the event of an error fetching weather data
 * @param statusMessage {string} End user description of failure
 * @param resultText {string} Full text of error reply, often XML.
 */
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
