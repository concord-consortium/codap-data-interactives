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
        var _this = this;
        this.updateView(state);

        function addCustomDatatype (ev) {
            // get value
            var value = ev.target.value;
            if (value && (noaa.dataTypeIDs.indexOf(value) >= 0)) {
                // verify that datatype exists
                // make new datatype checkbox
                var newCheckHTML = _this.makeNewCheckbox(value, value, true);
                // make new record
                dataTypes[value] = {name: value};
                // append to dom
                const insertionPoint = document.body.querySelector('#dataTypeUI div:last-child');
                insertionPoint.insertAdjacentHTML('beforeBegin', newCheckHTML);
                // clear current input
                ev.target.value = '';
                ev.target.focus();
                // add datatype selection to state
                setDataType(state.selectedDataTypes, value, true);
                // add custom datatype to stat
                if (!state.customDataTypes) {
                    state.customDataTypes = [];
                }
                state.customDataTypes.push(value);
            } else if (value) {
                noaa.ui.setMessage('"' + value + '" is not a valid NOAA CDO DataType')
            }
        };
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

        document.getElementById("dataTypeUI").innerHTML = this.makeBoxes(dataTypes, state.selectedDataTypes);

        // activate datatype checkboxes
        const dataTypeInputs = Array.from(document.body.querySelectorAll('#dataTypeUI input'));
        dataTypeInputs.forEach(function (node) {
           node.onclick = function (ev) {
               if (this.type==='checkbox') {
                   setDataType(state.selectedDataTypes, this.id, this.checked);
               }
           }
        });
        const newTypeInput = document.getElementById('newDataType');
        newTypeInput.onblur = addCustomDatatype;
        newTypeInput.onkeydown = function (ev) {
            if (ev.code==='Enter') {
                addCustomDatatype(ev);
            }
            return true;
        }
    },

    updateView: function(state) {
        document.getElementById('startDate').value = state.startDate;
        document.getElementById('endDate').value = state.endDate;
        document.getElementById('stationName').innerHTML = state.selectedStation.name;
    },

    makeNewCheckbox: function  (key, name, isChecked) {
        const isCheckedClause = isChecked ? " checked" : "";
        return '<div><label><input type="checkbox" id="' + key + '" ' +
            isCheckedClause + '/>' + name + '</label></div>';
    },

    makeBoxes : function(iChoices, iSelectionList) {
        let out = "";

        for (const theKey in iChoices) {
            const theName = iChoices[theKey].name;
            out += this.makeNewCheckbox(theKey, theName, (iSelectionList.indexOf(theKey) !== -1))
        }
        out += '<div><input type="text" id="newDataType" title="Enter NOAA CDO Datatype here" placeholder="Custom CDO Datatype"/>'
        return out;
    },

    setEventHandler: function (selector, event, handler) {
        const elements = document.querySelectorAll(selector);
        if (!elements) { return; }
        elements.forEach(function (el) {
            el.addEventListener(event, handler);
        });
    },

    setStationName: function (stationName) {
        document.getElementById('stationName').innerText = stationName;
    },

    setMessage: function (message) {
        document.getElementById("message-area").innerHTML = message;
    },

    setWaitCursor: function(isWait) {
        if (isWait) {
            document.body.classList.add('fetching');
        } else {
            document.body.classList.remove('fetching');
        }
    }
};
