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

noaa.defaultDataTypes = ["TMAX"];

noaa.dataTypes = {
    "TMAX": {
        "name": "tMax",
        "units" : "°C",
        "description": "Maximum temperature",
        "decode": {
            "GHCND": function (v) {
                return v / 10;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "TMIN": {
        "name": "tMin",
        "units" : "°C",
        "description": "Minimum temperature",
        "decode": {
            "GHCND": function (v) {
                return v / 10;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "TAVG": {
        "name": "tAvg",
        "units" : "°C",
        "description": "Average temperature",
        "decode": {
            "GHCND": function (v) {
                return v / 10;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "PRCP": {
        "name": "precip",
        "units" : "mm",
        "description": "Precipitation",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    "SNOW": {
        "name": "snow",
        "units" : "mm",
        "description": "Snowfall",
        "decode": {
            "GHCND": function (v) {
                return v;
            },
            "GSOM": function (v) {
                return v;
            }
        },
    },

    /**
     * Average (daily|monthly) wind speed in 0.1 m/s
     */
    "AWND": {
        "name": "avgWind",
        "units" : "m/s",
        "description": "Average windspeed",
        "decode": {
            "GHCND": function (v) {
                return v/10;
            },
            "GSOM": function (v) {
                return v/10;
            }
        },
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
        */

};

