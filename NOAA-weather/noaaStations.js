/*
==========================================================================

 * Created by tim on 8/22/19.
 
 
 ==========================================================================
noaaStations in noaa-cdo

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

/*
Find station IDs:
https://www.ncdc.noaa.gov/cdo-web/search
*/

noaa.defaultStations = ["GHCND:USC00040693", "GHCND:USC00049152"];     //  berkeley, ucla

noaa.stations = {
    "GHCND:USW00014755" : {
        name: "Mount Washington, NH",
        group: "New England",
        lat : 44.27018,
        lon : -71.3033,
        elev: 1911.4,
    },

    "GHCND:USW00014739" : {
        name: "Boston Logan",
        group: "New England",
        lat : 42.3606,
        lon : -71.0097,
        elev: 3.7,
    },

    "GHCND:USW00014922" : {
        name: "MSP",
        group: "Minnesota",
        lat : 44.8831,
        lon : -93.2289,
        elev: 265.8,
    },

    "GHCND:USW00014918" : {
        name: "International Falls, MN",
        group: "Minnesota",
        lat : 48.5614,
        lon : -93.3981,
        elev: 360.6,
    },

    "GHCND:USW00023234": {
        name: "SFO",
        group: "Norcal",
    },

    "GHCND:USW00023271": {
        name: "Sacramento",
        group: "Norcal",
    },

    "GHCND:USC00047339": {
        name: "Redwood City",
        group: "Norcal",
    },

    "GHCND:USW00023272": {
        name: "SF downtown",
        group: "Norcal",
    },

    "GHCND:USC00040693": {
        name: "Berkeley",
        group: "Norcal",
        lat : 37.8744,
        lon : -122.2605,
        elev: 94.5,
    },

    "GHCND:USW00023174": {
        name: "LAX",
        group: "Socal",
    },

    "GHCND:USW00093134": {
        name: "LA downtown",
        group: "Socal",
    },

    "GHCND:USW00003122": {
        name: "Torrance",
        group: "Socal",
    },

    "GHCND:USC00047888": {
        name: "Santa Ana",
        group: "Socal",
    },

    "GHCND:USC00049152": {
        name: "UCLA",
        group: "Socal",
        lat : 34.0697,
        lon : -118.4427,
        elev: 131.1,
    },

    "GHCND:USW00026411": {
        name: "Fairbanks AK",
        group: "Exotic",
    },

    "GHCND:GLW00017605": {
        name: "Thule Greenland",
        group: "Exotic",
    },

    "GHCND:ASN00066037": {
        name: "Sydney Australia",
        group: "Exotic",
    },

    "GHCND:USW00092811": {
        name: "Miami Beach FL",
        group: "Exotic",
        lat : 25.8063,
        lon : -80.1334,
        elev: 2.4,
    },

};