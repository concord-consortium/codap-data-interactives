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

    initialize : function(state, dataTypes) {
        function setDataType(selectedTypes, type, isSelected) {
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
        document.getElementById('startDate').value = state.startDate;
        document.getElementById('endDate').value = state.endDate;
        document.getElementById("dataTypeUI").innerHTML = this.makeBoxes(dataTypes, state.selectedDataTypes);
        document.getElementById('stationName').innerHTML = state.selectedStation.name;

        // activate datatype checkboxes
        const dataTypeInputs = Array.from(document.body.querySelectorAll('#dataTypeUI input'));
        dataTypeInputs.forEach(function (node) {
           node.onclick = function (ev) {
               if (this.type==='checkbox') {
                   setDataType(state.selectedDataTypes, this.id, this.checked);
               }
           }
        });
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
