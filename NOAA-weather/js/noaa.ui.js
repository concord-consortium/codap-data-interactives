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

import {NoaaType} from "./noaaDataTypes.js";
import {Calendar} from "./calendar.js";
import {GeonameSearch} from "./geonameSearch.js";

let eventHandlers = null
let calendars = {};
let lastState = null; // save state to be able to refresh view upon cancel

/**
 *
 * @param state {Object}
 * @param dataTypeStore {object}
 * @param iEventHandlers: expect an object with handlers for
 *      dataTypeSelector/click,
 *      frequencyControl/click,
 *      getData/click,
 *      dataSet/click
 *      stationLocation/enter,blur
 *
 *      In all cases, handlers should expect 'this' to be the DOM element and
 *      one argument, the event.
 */
function initialize(state, dataTypeStore, iEventHandlers) {
    eventHandlers = iEventHandlers;

    renderDataTypes(dataTypeStore.findAll(state.database), state.unitSystem);
    renderCalendars(state.startDate, state.endDate);
    updateView(state, dataTypeStore);

    setEventHandler('html', 'click', iEventHandlers.selectHandler, true);
    setEventHandler('#wx-data-type-table input', 'click', eventHandlers.dataTypeSelector)
    setEventHandler('#wx-get-button', 'click', function (ev) {
        closeDateRangeSelector();
        if (eventHandlers.getData) {
            eventHandlers.getData(ev);
        }
    });
    setEventHandler('#wx-clear-button', 'click', eventHandlers.clearData);
    setEventHandler('input[name=frequencyControl]', 'click', eventHandlers.frequencyControl);
    setEventHandler('.wx-dropdown-header', 'click', function (/*ev*/) {
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

    setEventHandler('.wx-pop-up-anchor,#wx-info-close-button', 'click', function (/*ev*/) {
        let parentEl = findAncestorElementWithClass(this, 'wx-pop-up');
        togglePopUp(parentEl);
        if (eventHandlers.unitSystem) {
            let unitSystemEl = document.querySelector('input[name=wx-option-units]:checked');
            let unitSystem = unitSystemEl? unitSystemEl.value : null;
            if (unitSystem) {
                eventHandlers.unitSystem(unitSystem)
            }
        }
    });

    setEventHandler('#wx-drs-duration,#wx-drs-end-date', 'change', updateDateRange);

    setEventHandler('.wx-pop-over-anchor', 'click', function (/*ev*/) {
        let parentEl = findAncestorElementWithClass(this, 'wx-pop-over');
        togglePopOver(parentEl);
    });

    setEventHandler('#wx-date-range-close', 'click', function (/*ev*/) {
        let el = findAncestorElementWithClass(this, 'wx-pop-over');
        togglePopOver(el);
        updateView(lastState, dataTypeStore);
    });

    if (eventHandlers.stationLocation) {
        let el = document.getElementById('geonameContainer');
        new GeonameSearch(el, 'codap', eventHandlers.stationLocation);
    }
}

function closeDateRangeSelector() {
    let dateRangeSelectorEl = document.querySelector('#wx-date-range-selection-dialog');
    if (dateRangeSelectorEl.classList.contains('wx-open')) {
        togglePopOver(dateRangeSelectorEl);
    }
}

function updateDateRange(/*ev*/) {
    // let el = findAncestorElementWithClass(calendars.from.calendarEl, 'wx-pop-over');
    let values = {};
    values.startDate = calendars.from.selectedDate;
    values.endDate = calendars.to.selectedDate;
    if (values.startDate > values.endDate) {
        let t = values.startDate;
        values.startDate = values.endDate;
        values.endDate = t;
    }
    if (eventHandlers.dateRangeSubmit) {
        eventHandlers.dateRangeSubmit(values);
    }
}

function findAncestorElementWithClass(el, myClass) {
    while (el !== null && el.parentElement !== el) {
        if (el.classList.contains(myClass)) {
            return el;
        }
        el = el.parentElement;
    }
}

function handleDateSelection(calendar/*, newDate*/) {
    let fromDate = calendars.from.selectedDate;
    let toDate = calendars.to.selectedDate;
    if (calendar === calendars.from && fromDate > toDate) {
        toDate = fromDate;
        calendars.to.selectedDate = fromDate;
    }
    if (calendar === calendars.to && fromDate > toDate) {
        fromDate = toDate;
        calendars.from.selectedDate = toDate;
    }
    let range = {
        fromDate: fromDate,
        toDate: toDate
    }
    calendars.from.shadedDateRange = range;
    calendars.to.shadedDateRange = range;
    updateDateRange();
}


function renderCalendars(fromDate, toDate) {
    fromDate = fromDate || new Date();
    toDate = toDate || new Date();
    let lc = document.getElementById('wx-calendar-from');
    let rc = document.getElementById('wx-calendar-to')
    calendars.from = new Calendar(lc, fromDate, 'From Date', handleDateSelection);
    calendars.to = new Calendar(rc, toDate, 'To Date', handleDateSelection);
    handleDateSelection();
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

/**
 *
 * @param state {Object}
 * @param dataTypeStore {Object}
 */
function updateView(state, dataTypeStore) {
    lastState = state;
    document.getElementById('wx-stationName').innerHTML
        = state.selectedStation ? state.selectedStation.name : '';

    let startDate = new Date(state.startDate);
    let endDate = new Date(state.endDate);
    updateFrequencyControl(state.database);
    updateStationView(state.selectedStation);
    updateDateRangeSummary(startDate, endDate, state.sampleFrequency);
    updateDateRangeSelectionPopup(startDate, endDate, state.sampleFrequency);
    updateDataTypeSummary(dataTypeStore, state.selectedDataTypes, state.database);
    updateDataTypes(dataTypeStore, state.selectedDataTypes, state.unitSystem, state.database);
    updateInfoPopup(state.unitSystem);
}

function updateFrequencyControl(databaseName) {
    const reportTypeMap = {
        'daily-summaries': 'wx-daily',
        'global-summary-of-the-month': 'wx-gsom',
        'global-hourly': 'wx-hourly',
        'global-summary-of-the-day': 'wx-daily'
    }
    let el = document.getElementById(reportTypeMap[databaseName])
    el.checked = true;
}
function updateStationView(selectedStation) {
    document.getElementById('wx-stationName').innerHTML =
        selectedStation
            ? `${selectedStation.name} (${selectedStation.mindate} - ${selectedStation.maxdate})`
            : '';
}


function updateInfoPopup(unitSystem) {
    let el = document.querySelector('input[name=wx-option-units][value='+unitSystem+']');
    el.checked=true;
}

/**
 *
 * @param startDate {Date}
 * @param endDate {Date}
 * @param sampleFrequency {'daily'|'monthly'}
 */
function updateDateRangeSummary(startDate, endDate, sampleFrequency) {
    let formatStr = (sampleFrequency === 'monthly')?'MMM YYYY':'MM/DD/YYYY';
    // let formatStr = 'MMM YYYY';
    let startStr = dayjs(startDate).format(formatStr);
    let endStr = dayjs(endDate).format(formatStr);
    let el = document.querySelector('#wx-date-range');
    if (el)  {
        el.innerText = `${startStr} to ${endStr}`;
    }
}

function updateDateRangeSelectionPopup(startDate, endDate/*, sampleFrequency*/) {
    let dateRange = {
        fromDate: startDate,
        toDate: endDate
    };
    calendars.from.shadedDateRange = dateRange;
    calendars.to.shadedDateRange = dateRange;
    calendars.from.selectedDate = startDate;
    calendars.to.selectedDate = endDate;
    calendars.from.updateCalendar(startDate.getMonth(), startDate.getFullYear());
    calendars.to.updateCalendar(endDate.getMonth(), endDate.getFullYear());
}

function createElementWithProperties(tag, properties) {
    let el = document.createElement(tag);
    for (let key in properties) {
        if (properties.hasOwnProperty(key)) {
            el[key] = properties[key];
        }
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
    row.classList.add('wx-data-type');
    row.appendChild(cell);
    row.appendChild(createElementWithProperties('td', {textContent: description}));
    row.appendChild(createElementWithProperties('td', {textContent: name}));
    let unitEl = createElementWithProperties('td', {textContent: units});
    unitEl.classList.add('wx-units');
    row.appendChild(unitEl);
    return row;
}

/**
 *
 * @param dataTypeArray {[NoaaType]} dataType object describe NOAA NCEI DataTypes, including
 * name, description, units.
 * @param unitSystem {'metric'||'standard'}
 */
function renderDataTypes(dataTypeArray, unitSystem) {
    let insertionPoint = document.querySelector('#wx-data-type-table tbody');

    dataTypeArray.forEach(function (dataType) {
        let unit = dataType.units[unitSystem]
        insertionPoint.appendChild(
            makeDataTypeRow(dataType.name, dataType.name, dataType.description,
                unit));
    });
}

function setEventHandler (selector, event, handler, capture) {
    const elements = document.querySelectorAll(selector);
    if (!elements) { return; }
    elements.forEach(function (el) {
        el.addEventListener(event, handler, {capture: capture});
    });
}

function setMessage(message) {
    document.querySelector(".wx-message-area").innerHTML = message;
}

/**
 * Sets the "transfer status" icon and message.
 * @param status {'disabled', 'inactive', 'retrieving', 'transferring', 'clearing', 'success', 'failure'}
 * @param message
 */
function setTransferStatus(status, message) {
    let getButtonIsActive = true;
    let el = document.querySelector('.wx-summary');
    let statusClass = '';
    if (status === 'retrieving' || status === 'transferring' || status === 'clearing' ) {
        getButtonIsActive = false;
        statusClass = 'wx-transfer-in-progress';
    } else if (status === 'success') {
        statusClass = 'wx-transfer-success';
    } else if (status === 'failure') {
        statusClass = 'wx-transfer-failure';
    } else if (status === 'disabled') {
        statusClass = 'wx-transfer-failure';
        getButtonIsActive = false;
    }
    el.classList.remove('wx-transfer-in-progress', 'wx-transfer-success', 'wx-transfer-failure');
    if (statusClass) { el.classList.add(statusClass); }

    el.querySelector('#wx-get-button').disabled=!getButtonIsActive;
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

function updateDataTypeSummary(dataTypeStore, selectedTypes, dataSet) {
    selectedTypes = selectedTypes || [];
    let countDisplay = document.querySelector('.wx-selection-count');
    let summaryListDisplay = document.querySelector('.wx-data-type-selection');
    let summaryList = selectedTypes.filter(function (dt) {
        let noaaType = dataTypeStore.findByName(dt);
        return (noaaType && noaaType.isInDataSet(dataSet));
    }).map(function (key) {
            let type = dataTypeStore.findByName(key);
            return type.name;
        });
    summaryListDisplay.innerText = summaryList.join(', ');
    countDisplay.innerText = String(summaryList.length);
}

function updateDataTypes(dataTypeStore, selectedTypes, unitSystem, database) {
    selectedTypes = selectedTypes || [];
    let checkBoxes = document.querySelectorAll('.wx-data-type-checkbox');
    let checkBoxHash = {};
    checkBoxes && checkBoxes.forEach(function (el) {
        el.checked = false;
        checkBoxHash[el.id] = el;
        let rowEl = findAncestorElementWithClass(el,'wx-data-type');
        if (rowEl) {
            let unitEl = rowEl.querySelector('.wx-units');
            let noahType = dataTypeStore.findByName(el.id);
            unitEl.innerHTML = noahType.units[unitSystem];
            if (noahType.isInDataSet(database)) {
                rowEl.classList.add('wx-visible');
            } else {
                rowEl.classList.remove('wx-visible');
            }
        }
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
