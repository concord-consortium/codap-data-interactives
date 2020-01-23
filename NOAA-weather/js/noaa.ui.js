/*
==========================================================================

 * Created by tim on 8/23/19.
 
 
 ==========================================================================
noaa.ui in noaa-cdo

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


noaa.ui = {

    initialize : function() {
        document.getElementById('startDate').value = noaa.state.startDate;
        document.getElementById('endDate').value = noaa.state.endDate;
        document.getElementById("dataTypeUI").innerHTML = this.makeBoxes(noaa.dataTypes, noaa.defaultDataTypes);
        document.getElementById('stationName').innerHTML = noaa.selectedStation.name;
    },

    getCheckedStations : function() {
        return [noaa.selectedStation && noaa.selectedStation.id];
    },

    getCheckedDataTypes : function() {
        let out = [];
        for (const theKey in noaa.dataTypes) {
            if (document.getElementById(theKey).checked) {
                out.push(theKey);
            }
        }
        return out;
    },

    makeBoxes : function(iChoices, iDefaults) {
        let out = "";

        for (const theKey in iChoices) {
            const theName = iChoices[theKey].name;
            const isCheckedClause = (iDefaults.indexOf(theKey) === -1) ? "" : " checked";
            out += "<input type='checkbox' id='" + theKey + "'" +  isCheckedClause + ">" +
                "<label for='" + theKey + "'>" + theName + "</label><br>";
        }
        return out;
    },
    setStationName: function (stationName) {
        document.getElementById('stationName').innerText = stationName;
    }
};
