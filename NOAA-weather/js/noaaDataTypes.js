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
let defaultDataTypes = ["TMAX", "TMIN"];

let dataTypes = {
    "TMAX": {
        "name": "tMax",
        "units" : {
            metric: "°C",
            standard: "°F"
        },
        "description": "Maximum temperature",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
        convertUnits: convertTemp
    },

    "TMIN": {
        "name": "tMin",
        "units" : {
            metric: "°C",
            standard: "°F"
        },
        "description": "Minimum temperature",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
        convertUnits: convertTemp
    },

    "TAVG": {
        "name": "tAvg",
        "units" : {
            metric: "°C",
            standard: "°F"
        },
        "description": "Average temperature",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
        convertUnits: convertTemp
    },

    "PRCP": {
        "name": "precip",
        "units" : {
            metric: "mm",
            standard: "in"
        },
        "description": "Precipitation",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
        convertUnits: convertPrecip
    },

    "SNOW": {
        "name": "snow",
        "units" : {
            metric: "mm",
            standard: "in"
        },
        "description": "Snowfall",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
        convertUnits: convertPrecip
    },

    /**
     * Average (daily|monthly) wind speed in 0.1 m/s
     */
    "AWND": {
        "name": "avgWind",
        "units" : {
            metric: "m/s",
            standard: "mph"
        },
        "description": "Average windspeed",
        "decode": {
            "GHCND": function (v) {
                return v/10;
            },
            "GSOM": function (v) {
                return v/10;
            }
        },
        convertUnits: convertWindspeed
    },

    /*
            "EVAP": {
                "name": "evap",
                "units" : "mm",
                "description": "Evaporation of water from the evaporation pan",
                "decode": {
                    "GHCND": function (v) {
                        return v;
                    },
                    "GSOM": function (v) {
                        return v;
                    }
                },
            },
            8?
/* Datatypes for global-summary-of-the-day dataset
    "DEWP": {
        "id": "DEWP",
        "name": "dewPoint",
        "description": "Average Dew Point",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "fahrenheit"
    },
    "FRSHTT": {
        "id": "FRSHTT",
        "name": "indc",
        "description": "Indicators",
        "searchWeight": 1
    },
    "GUST": {
        "id": "GUST",
        "name": "gust",
        "description": "Maximum Wind Gust",
        "metricOutputPrecision": 1,
        "metricOutputUnits": "meters per second",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 1,
        "standardOutputUnits": "knots",
        "units": "knots"
    },
    "MXSPD": {
        "id": "MXSPD",
        "name": "mxWind",
        "description": "Maximum Sustained Wind Speed",
        "metricOutputPrecision": 1,
        "metricOutputUnits": "meters per second",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 1,
        "standardOutputUnits": "knots",
        "units": "knots"
    },
    "SLP": {
        "id": "SLP",
        "name": "pSeaLvl",
        "description": "Average Sea Level Pressure",
        "metricOutputPrecision": 2,
        "metricOutputUnits": "hectopascals",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 2,
        "standardOutputUnits": "inches mercury",
        "units": "hectopascals"
    },
    "SNDP": {
        "id": "SNDP",
        "name": "snow",
        "description": "Snow Depth",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "inches"
    },
    "STP": {
        "id": "STP",
        "name": "pStn",
        "description": "Average Station Pressure",
        "metricOutputPrecision": 2,
        "metricOutputUnits": "hectopascals",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 2,
        "standardOutputUnits": "inches mercury",
        "units": "hectopascals"
    },

    "VISIB": {
        "id": "VISIB",
        "name": "vis",
        "description": "Average Visibility",
        "scaleFactor": 1,
        "searchWeight": 1,
        "units": "miles"
    },
    "WDSP": {
        "id": "WDSP",
        "name": "aveWind",
        "description": "Average Wind Speed",
        "metricOutputPrecision": 1,
        "metricOutputUnits": "meters per second",
        "scaleFactor": 1,
        "searchWeight": 1,
        "standardOutputPrecision": 1,
        "standardOutputUnits": "knots",
        "units": "knots"
    }
*/
};
function convertable(value) {
    return !(isNaN(value) || (typeof value === 'string' && value.trim() === ''))
}

function convertPrecip(fromUnit, toUnit, value) {
    let k = 25.4;
    if (!convertable(value)) {
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
    if (!convertable(value)) {
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
    if (!convertable(value)) {
        return value;
    } else if (fromUnit === 'm/s' && toUnit === "mph") {
        return value / k;
    } else if (fromUnit === 'mph' && toUnit === 'm/s') {
        return value * k;
    } else {
        return value;
    }
}

function findAllBySourceName(targetName) {
    return dataTypes[targetName];
}

function findByName(targetName) {
    return Object.values(dataTypes).find(function (dataType) {
        return targetName === dataType.name;
    });
}

let dataTypeStore = {
    findAllBySourceName: findAllBySourceName,
    findByName: findByName
}

export {defaultDataTypes, dataTypes, dataTypeStore};
