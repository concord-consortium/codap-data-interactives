/*
==========================================================================

 * Created by tim on 8/28/19.
 
 
 ==========================================================================
noaaDataTypes in noaa-cdo

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/
const kUnitTypeAngle = 'angle';
const kUnitTypeDistance = 'distance';
const kUnitTypePrecip = 'precipitation';
const kUnitTypePressure = 'pressure';
const kUnitTypeSpeed = 'speed';
const kUnitTypeTemp = 'temperature';

const defaultDataTypes = [
    "tMax",
    "tMin",
    "tAvg",
    "precip",
    "snow",
    "avgWind",
    "Dew",
    "Vis",
    "Temp",
    "Pressure",
    "WSpeed",
    "WDir",
    "Precip"
];

const unitMap = {
    angle: {metric: 'º', standard: 'º'},
    distance: {metric: 'm', standard: 'yd'},
    precipitation: {metric: "mm", standard: "in"},
    pressure: {metric: 'hPa'},
    speed: {metric: "m/s", standard: "mph"},
    temperature: {metric: "°C", standard: "°F"},
}

const converterMap = {
    angle: null,
    distance: null,
    temperature: convertTemp,
    precipitation: convertPrecip,
    speed: convertWindspeed,
    pressure: null
}

function convertPrecip(fromUnit, toUnit, value) {
    let k = 25.4;
    if (!convertible(value)) {
        return value;
    } else if (fromUnit === 'mm' && toUnit === "in") {
        return value / k;
    } else if (fromUnit === 'in' && toUnit === 'mm') {
        return value * k;
    } else {
        return value;
    }
}

function convertTemp(fromUnit, toUnit, value) {
    if (!convertible(value)) {
        return value;
    } else if (fromUnit === '°C' && toUnit === "°F") {
        return 1.8*value + 32;
    } else if (fromUnit === '°F' && toUnit === '°C') {
        return (value - 32) / 1.8;
    } else {
        return value;
    }
}

function convertWindspeed(fromUnit, toUnit, value) {
    let k=0.44704;
    if (!convertible(value)) {
        return value;
    } else if (fromUnit === 'm/s' && toUnit === "mph") {
        return value / k;
    } else if (fromUnit === 'mph' && toUnit === 'm/s') {
        return value * k;
    } else {
        return value;
    }
}

function formatNthCurry(n, separator, multiplier) {
    return function (v) {
        if (!v) {
            return;
        }
        let value = v.split(separator)[n];
        // if all nines, interpret as empty
        if (/^\+?9*$/.test(value)) {
            return;
        }
        if (isNaN(value)) {
            return;
        }
        if (!isNaN(value)) {
            return Number(value) * multiplier;
        }
    }
}

const extractHourlyTemp = formatNthCurry(0, ',', .1);
const extractHourlyVisibility = formatNthCurry(0, ',', 1);
const extractHourlyPressure = formatNthCurry(0, ',', .1);
const extractHourlyWindDirection = formatNthCurry(0, ',', 1);
const extractHourlyWindspeed = formatNthCurry(3, ',', .1);
function extractHourlyPrecipitation(value) {
    let parts = value.split(',')
    let period = parts[0];
    let depth = parts[1];
    if (Number(period) !== 1) {
        return;
    }
    return depth * .1;
}


function NoaaType(sourceName, name, unitType, description, datasetList, decoderMap) {
    this.sourceName = sourceName;
    this.name = name;
    this.units = unitMap[unitType];
    this.description = description;
    this.datasetList = datasetList;
    this.decode = decoderMap;
    this.convertUnits = converterMap[unitType];
}

NoaaType.prototype.isInDataSet = function (dataSet) {
    return (this.datasetList.indexOf(dataSet) >= 0)
}

let dataTypes = [
    new NoaaType('TMAX', 'tMax', kUnitTypeTemp, 'Maximum temperature',
        ['daily-summaries', 'global-summary-of-the-month']),
    new NoaaType('TMIN', 'tMin', kUnitTypeTemp, 'Minimum temperature',
        ['daily-summaries', 'global-summary-of-the-month']),
    new NoaaType('TAVG', 'tAvg', kUnitTypeTemp, 'Average temperature',
        ['daily-summaries', 'global-summary-of-the-month']),
    new NoaaType('PRCP', 'precip', kUnitTypePrecip, 'Precipitation',
        ['daily-summaries', 'global-summary-of-the-month']),
    new NoaaType('SNOW', 'snow', kUnitTypePrecip, 'Snowfall',
        ['daily-summaries', 'global-summary-of-the-month']),
    /**
     * Average (daily|monthly) wind speed in 0.1 m/s
     */
    new NoaaType('AWND', 'avgWind', kUnitTypeSpeed, 'Average windspeed',
        ['daily-summaries', 'global-summary-of-the-month'], {
        "GHCND": function (v) {return v/10;}, "GSOM": function (v) {return v/10;}
    }),

    new NoaaType('DEW', 'Dew', kUnitTypeTemp, 'Dew Point',
        ['global-hourly'], {'global-hourly': extractHourlyTemp}),
    new NoaaType('SLP', 'Pressure', kUnitTypePressure,
        'Barometric Pressure at sea level', ['global-hourly'],
        {'global-hourly': extractHourlyPressure}),
    new NoaaType('TMP', 'Temp', kUnitTypeTemp, 'Air Temperature',
        ['global-hourly'], {'global-hourly': extractHourlyTemp}),
    new NoaaType('VIS', 'Vis', kUnitTypeDistance, 'Visibility',
        ['global-hourly'], {'global-hourly': extractHourlyVisibility}),
    new NoaaType('WND', 'WDir', kUnitTypeAngle, 'Wind Direction',
        ['global-hourly'], {'global-hourly': extractHourlyWindDirection}),
    new NoaaType('WND', 'WSpeed', kUnitTypeSpeed, 'Wind Speed',
        ['global-hourly'], {'global-hourly': extractHourlyWindspeed}),
    new NoaaType('AA1', 'Precip', kUnitTypePrecip, 'Precipitation in last hour',
        ['global-hourly'], {'global-hourly': extractHourlyPrecipitation}),
];

function convertible(value) {
    return !(isNaN(value) || (typeof value === 'string' && value.trim() === ''))
}

/**
 * Returns an array of types bound to the name in the source dataset.
 * A given source field may embed multiple values.
 * @param targetName
 * @return {NoaaType[]}
 */
function findAllBySourceName(targetName) {
    return dataTypes.filter(function (dataType) {
        return targetName === dataType.sourceName;
    });
}

/**
 * Returns a type of a given name.
 * @param targetName
 * @return {NoaaType}
 */
function findByName(targetName) {
    return dataTypes.find(function (dataType) {
        return targetName === dataType.name;
    });
}

/**
 * Returns the dataTypes selected by default.
 * @return {[string, string]}
 */
function getDefaultDatatypes() {
    return defaultDataTypes;
}

/**
 * Returns an array of types that are populated in a given dataset.
 * @param noaaDatasetName
 * @return {NoaaType[]}
 */
function findAllByNoaaDataset(noaaDatasetName) {
    return dataTypes.filter(function (noaaType) {
       return noaaType.isInDataSet(noaaDatasetName);
    });
}

/**
 * Returns all types.
 * @return {NoaaType[]}
 */
function findAll() {
    return dataTypes;
}

let dataTypeStore = {
    findAllBySourceName: findAllBySourceName,
    findByName: findByName,
    getDefaultDatatypes: getDefaultDatatypes,
    findAllByNoaaDataset: findAllByNoaaDataset,
    findAll: findAll,
}

export {NoaaType, dataTypeStore};
