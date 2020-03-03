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

/*global flatpickr */
import {dataTypes} from "./noaaDataTypes";
// import * as flatpickr from "./flatpickr.js";

let eventHandlers = null
let flatpickrInstance = null;

/**
 *
 * @param state
 * @param dataTypes
 * @param iEventHandlers: expect an object with handlers for
 *      dataTypeSelector/click,
 *      frequencyControl/click,
 *      getData/click,
 *      dataSet/click
 *
 *      In all cases, handlers should expect 'this' to be the DOM element and
 *      one argument, the event.
 */
function initialize(state, dataTypes, iEventHandlers) {
    eventHandlers = iEventHandlers;

    renderDataTypes(dataTypes);
    updateView(state);

    // const newTypeInput = document.getElementById('newDataType');

    setEventHandler('#wx-data-type-table input', 'click', eventHandlers.dataTypeSelector)
    setEventHandler('#wx-get-button', 'click', eventHandlers.getData);
    setEventHandler('input[name=frequencyControl]', 'click', eventHandlers.frequencyControl);
    setEventHandler('.wx-dropdown-indicator', 'click', function (ev) {
        let sectionEl = findAncestorElementWithClass(this, 'wx-dropdown');
        let isClosed = sectionEl.classList.contains('wx-up');
        if (isClosed) {
            sectionEl.classList.remove('wx-up');
            sectionEl.classList.add('wx-down');
        } else {
            sectionEl.classList.remove('wx-down');
            sectionEl.classList.add('wx-up');
        }
    });

    setEventHandler('.wx-pop-up-anchor,#wx-info-close-button', 'click', function (ev) {
        let parentEl = findAncestorElementWithClass(this, 'wx-pop-up');
        togglePopUp(parentEl);
    });

    setEventHandler('.wx-pop-over-anchor', 'click', function (ev) {
        let parentEl = findAncestorElementWithClass(this, 'wx-pop-over');
        togglePopOver(parentEl);
    });

    setEventHandler('#wx-cancel-date-range', 'click', function (ev) {
        let el = findAncestorElementWithClass(this, 'wx-pop-over');
        togglePopOver(el);
    });

    setEventHandler('#wx-set-date-range', 'click', function (ev) {
        let el = findAncestorElementWithClass(this, 'wx-pop-over');
        let values = {
            drsEndDate: el.querySelector('#wx-drs-end-date').value,
            drsDuration: el.querySelector('#wx-drs-duration').value
        };
        if (eventHandlers.dateRangeSubmit) {
            eventHandlers.dateRangeSubmit(values);
        }
        togglePopOver(el);
    })
    function logit(e, o1) {
        console.log(e, o1);
    }
    flatpickrInstance = flatpickr('.wx-day-selector', {
        maxDate: "today",
        mode: "range",
        wrap: true,
        onChange: function (dates) {
            let values = {
                drsStartDate: dates[0],
                drsEndDate: dates[1],
            };
            if (eventHandlers.dateRangeSubmit) {
                eventHandlers.dateRangeSubmit(values);
            }
        },
        onClose: function (o) { logit('onClose', o);},
        onOpen: function (o) { logit('onOpen', o);},
        onReady: function (o) { logit('onReady', o); },
        onValueUpdate: function (o) { logit('onValueUpdate', o); },
        onDayCreate: function (o) { logit('onDayCreate', o); },
        onKeyDown: function (o) { logit('onKeyDown', o); },
        onDestroy: function (o) { logit('onDestroy', o); },
        onMonthChange: function (o) { logit('onMonthChange', o); },
        onPreCalendarPosition: function (o) { logit('onPreCalendarPosition', o); }
    });

}

function findAncestorElementWithClass(el, myClass) {
    while (el !== null && el.parentElement !== el) {
        if (el.classList.contains(myClass)) {
            return el;
        }
        el = el.parentElement;
    }
}

function togglePopOver(el) {
    let isOpen = el.classList.contains('wx-open');
    if (isOpen) {
        el.classList.remove('wx-open');
    } else {
        el.classList.add('wx-open');
    }
}

function togglePopUp(el) {
    let isOpen = el.classList.contains('wx-open');
    if (isOpen) {
        el.classList.remove('wx-open');
    } else {
        el.classList.add('wx-open');
    }
}
function updateView(state) {
    document.getElementById('wx-stationName').innerHTML = state.selectedStation.name;

    let startDate = new Date(state.startDate);
    let endDate = new Date(state.endDate);
    updateDateSelectorView(state.sampleFrequency);
    updateDateRangeSummary(startDate, endDate, state.sampleFrequency);
    updateDateRangeSelectionPopup(startDate, endDate, state.sampleFrequency);
    updateDataTypeSummary(dataTypes, state.selectedDataTypes);
    updateDataTypes(dataTypes, state.selectedDataTypes);
}

/**
 *
 * @param startDate {Date}
 * @param endDate {Date}
 * @param sampleFrequency {'daily'|'monthly'}
 */
function updateDateRangeSummary(startDate, endDate, sampleFrequency) {
    // let formatStr = (sampleFrequency === 'monthly')?'MMM YYYY':'MM/DD/YYYY';
    let formatStr = 'MMM YYYY';
    let startStr = dayjs(startDate).format(formatStr);
    let endStr = dayjs(endDate).format(formatStr);
    let el = document.querySelector('#wx-date-range');
    if (el)  {
        el.innerText = `${startStr} to ${endStr}`;
    }
    formatStr = 'YYYY-MM-DD';
    startStr = dayjs(startDate).format(formatStr);
    endStr = dayjs(endDate).format(formatStr);
    el = document.querySelector('.wx-day-selector input');
    if (el)  {
        el.value = `${startStr} to ${endStr}`;
    }
}

function updateDateRangeSelectionPopup(startDate, endDate, sampleFrequency) {
    let duration = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    if (sampleFrequency === 'monthly') duration = Math.round(duration / 30);
    let durationUnit = (sampleFrequency === 'monthly')? 'months' : 'days';
    if (duration === 1) {
        durationUnit = (sampleFrequency === 'monthly')? 'month' : 'day';
    }
    let durationTimeUnitEl = document.querySelector('#wx-time-unit');
    let endDateEl = document.querySelector('#wx-drs-end-date');
    let durationEl = document.querySelector('#wx-drs-duration');
    durationTimeUnitEl.innerHTML = durationUnit;
    endDateEl.valueAsDate = endDate/*.toLocaleDateString()*/;
    durationEl.value = duration;
}

function updateDateSelectorView(sampleFrequency) {
    let dayRangeSelector = document.querySelector('.wx-day-selector');
    let monthRangeSelector = document.querySelector('#wx-date-range-selection-dialog');
    if (sampleFrequency === 'monthly') {
        monthRangeSelector.classList.remove('wx-hide');
        dayRangeSelector.classList.add('wx-hide');
    } else {
        dayRangeSelector.classList.remove('wx-hide');
        monthRangeSelector.classList.add('wx-hide');
    }
}
function createElementWithProperties(tag, properties) {
    let el = document.createElement(tag);
    for (let key in properties) {
        el[key] = properties[key];
    }
    return el;
}

function makeDataTypeRow (key, name, description, units) {
    let checkbox = createElementWithProperties('input', {
            id: key,
            type: 'checkbox'
        });
    checkbox.classList.add('wx-data-type-checkbox');
    let cell = document.createElement('td');
    cell.appendChild(checkbox);

    let row = document.createElement('tr');
    row.appendChild(cell);
    row.appendChild(createElementWithProperties('td', {textContent: description}));
    row.appendChild(createElementWithProperties('td', {textContent: name}));
    row.appendChild(createElementWithProperties('td', {textContent: units}));
    return row;
}

function renderDataTypes(dataTypes, iSelectionList) {
    let insertionPoint = document.querySelector('#wx-data-type-table tbody');

    for (const theKey in dataTypes) {
        const dataType = dataTypes[theKey];
        insertionPoint.appendChild(makeDataTypeRow(theKey, dataType.name, dataType.description,
            dataType.units));
    }
}

function setEventHandler (selector, event, handler) {
    const elements = document.querySelectorAll(selector);
    if (!elements) { return; }
    elements.forEach(function (el) {
        el.addEventListener(event, handler);
    });
}

function setStationName(stationName) {
    document.getElementById('stationName').innerText = stationName;
}

function setMessage(message) {
    document.querySelector(".wx-message-area").innerHTML = message;
}

/**
 *
 * @param status {'inactive', 'retrieving', 'transferring', 'success', 'failure'}
 * @param message
 */
function setTransferStatus(status, message) {
    let getButtonIsActive = true;
    let el = document.querySelector('.wx-summary');
    let statusClass = '';
    if (status === 'retrieving' || status === 'transferring') {
        getButtonIsActive = false;
        statusClass = 'wx-transfer-in-progress';
    } else if (status === 'success') {
        statusClass = 'wx-transfer-success';
    } else if (status === 'failure') {
        statusClass = 'wx-transfer-failure';
    }
    el.classList.remove('wx-transfer-in-progress', 'wx-transfer-success', 'wx-transfer-failure');
    if (statusClass) { el.classList.add(statusClass); }

    el.querySelector('button').disabled=!getButtonIsActive;
    setWaitCursor(!getButtonIsActive);
    setMessage(message);
}

function setWaitCursor(isWait) {
    if (isWait) {
        document.body.classList.add('fetching');
    } else {
        document.body.classList.remove('fetching');
    }
}

function updateDataTypeSummary(dataTypes, selectedTypes) {
    let countDisplay = document.querySelector('.wx-selection-count');
    let summaryListDisplay = document.querySelector('.wx-data-type-selection');
    let summaryList = selectedTypes.filter(function (dt) {
        return dataTypes[dt];
    }).map(function (key) {
            let type = dataTypes[key];
            return type.name;
        });
    summaryListDisplay.innerText = summaryList.join(', ');
    countDisplay.innerText = String(summaryList.length);
}

function updateDataTypes(dataTypes, selectedTypes) {
    let checkBoxes = document.querySelectorAll('.wx-data-type-checkbox');
    let checkBoxHash = {};
    checkBoxes && checkBoxes.forEach(function (el) {
        el.checked = false;
        checkBoxHash[el.id] = el;
    });
    selectedTypes.forEach(function (id) {
        if (checkBoxHash[id]) {
            checkBoxHash[id].checked = true;
        }
    });
}

export {
    initialize,
    setMessage,
    setTransferStatus,
    setWaitCursor,
    updateDataTypeSummary,
    updateView
};
