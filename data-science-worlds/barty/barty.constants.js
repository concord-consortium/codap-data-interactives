/*
==========================================================================

 * Created by tim on 9/26/18.
 
 
 ==========================================================================
barty.constants in barty

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

barty.constants = {
    version: "002M",
    whence : "concord",     //  fix this to deploy (concord)

    kRecordsPerRequestLimit : 1700,

    kBARTYDataSetName : "bart",
    kBARTYDataSetTitle : "BART data",
    kBARTYCollectionName : "BART data",

    kBaseDateString: "2018-04-18",     //  default search date
    kMinDateString : "2015-01-01",
    kMaxDateString : "2018-12-31",

    /**
     * This object contains the locations for the php files, keyed by `whence`, above.
     */
    kBasePhpURL: {
        local: "http://localhost:8888/plugins/barty/php/getBARTYdata.php",
        local_concord: "http://localhost:8888/concord-plugins/data-science-worlds/barty/php/getBARTYdata.php",
        xyz: "https://codap.xyz/plugins/barty/php/getBARTYdata.php",
        eeps: "https://www.eeps.com/codap/barty/php/getBARTYdata.php",
        concord : "https://codap.concord.org/data-science-worlds/barty/php/getBARTYdata.php",
    },

    dimensions: {height: 710, width: 366},
    name: "bart",

    daysOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    daysOfWeekLong: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    queryTypes: ["byArrival", "byDeparture", "byRoute", "betweenAny"],
    kBaseH0: 8,        //      default starting hour
    kBaseH1: 14,       //      default ending hour for search
    kBaseStn0 : "ORIN", //  default origin station
    kBaseStn1 : "EMBR", //  default destination station

    kGetData: "data",
    kGetCounts: "counts",
    kRegionColorMap: {
        "Peninsula": "purple",
        "City": "red",
        "Downtown": "orange",
        "Oakland": "green",
        "East Bay": "dodgerblue"
    },
    kWeekdayColorMap: {
        "Sun": "green",
        "Mon": "orange",
        "Tue": "coral",
        "Wed": "gold",
        "Thu": "goldenrod",
        "Fri": "lightsalmon",
        "Sat": "limegreen"
    },

};
