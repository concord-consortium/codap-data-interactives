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


let ui = {

    initialize : function(state, dataTypes, eventHandlers) {
        var _this = this;
        this.updateView(state);

        document.getElementById("dataTypeUI").innerHTML = this.makeBoxes(dataTypes, state.selectedDataTypes);

        const newTypeInput = document.getElementById('newDataType');

        this.setEventHandler('#dataTypeUI input', 'click', eventHandlers.dataTypeSelector)
        this.setEventHandler('#startDate,#endDate', 'change', eventHandlers.dateChange);
        this.setEventHandler('#get-button', 'click', eventHandlers.getData);
        this.setEventHandler('#newDataType', 'blur', eventHandlers.newDataType);
        this.setEventHandler('#newDataType', 'keydown', function (ev) {
            if (ev.code==='Enter' || ev.code === 'Tab') {
                eventHandlers.newDataType(ev);
            }
            return true;
        });
        this.setEventHandler('input[name=frequencyControl]', 'click', eventHandlers.frequencyControl);

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

    insertCheckboxAtEnd: function (checkboxHTML) {
        // append to dom
        const insertionPoint = document.body.querySelector('#dataTypeUI div:last-child');
        insertionPoint.insertAdjacentHTML('beforeBegin', checkboxHTML);
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

export {ui};
