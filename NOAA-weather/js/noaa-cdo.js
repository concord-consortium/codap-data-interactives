
/*
==========================================================================

 * Created by tim on 8/22/19.


 ==========================================================================
noaa-cdo in noaa-cdo

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
var noaa = {

    initialize: async function () {
        const today = dayjs();
        const monthAgo = today.subtract(1, 'month');

        await noaa.connect.initialize();
        var state = await noaa.connect.getInteractiveState() || {};
        state.startDate = state.startDate || monthAgo.format('YYYY-MM-DD');
        state.endDate = state.endDate || today.format('YYYY-MM-DD');
        state.selectedStation = state.selectedStation || noaa.stations.find(function (sta) {
            return sta.id === noaa.constants.defaultStationID;
        })
        state.selectedDataTypes = state.selectedDataTypes || noaa.defaultDataTypes;
        state.customDataTypes && state.customDataTypes.forEach(function (name) {
            noaa.dataTypes[name] = {name:name};
        });
        noaa.state = state;

        noaa.ui.initialize(state, noaa.dataTypes);

        noaa.ui.setEventHandler('#startDate,#endDate', 'change', noaa.dateChange);
        noaa.ui.setEventHandler('#get-button', 'click', noaa.doGet);
    },

    dataValues: [], dataRecords: [],

    state: {
        startDate: null, endDate: null, database: null,
    },

    stationIDs: ['GHCND:USW00014755'],

    doGet: async function (ev) {
        noaa.ui.setWaitCursor(true);
        let theText = "Default text";
        let nRecords = 0;
        noaa.state.database = document.querySelector(
            "input[name='frequencyControl']:checked").value;

        const startDate = noaa.state.startDate;
        const endDate = noaa.state.endDate;
        const tDatasetIDClause = "&datasetid=" + noaa.state.database;
        const tStationIDClause = "&stationid=" + noaa.getCheckedStations().join(
            "&stationid=");
        const tDataTypeIDClause = "&datatypeid=" + noaa.getCheckedDataTypes().join(
            "&datatypeid=");
        const tDateClause = "&startdate=" + startDate + "&enddate=" + endDate;

        let tURL = noaa.constants.noaaBaseURL + "data?limit=" + noaa.constants.recordCountLimit + tDatasetIDClause + tStationIDClause + tDataTypeIDClause + tDateClause;

        let tHeaders = new Headers();
        tHeaders.append("token", noaa.constants.noaaToken);
        const tRequest = new Request(tURL, {headers: tHeaders});
        let resultText = "";
        noaa.dataValues = [];
        try {
            if (new Date(startDate) <= new Date(endDate)) {
                noaa.ui.setMessage('Fetching weather records from NOAA');
                const tResult = await fetch(tRequest);
                if (tResult.ok) {
                    noaa.ui.setMessage('Converting weather records')
                    const theJSON = await tResult.json();
                    if (theJSON.results) {
                        noaa.dataValues = [];
                        theJSON.results.forEach((r) => {
                            nRecords++;
                            theText += "<br>" + JSON.stringify(r);
                            const aValue = noaa.convertNOAAtoValue(r);
                            noaa.dataValues.push(aValue);
                        });
                        noaa.dataRecords = [];
                        noaa.dataValues.forEach(function (aValue) {
                            let dataRecord = noaa.dataRecords.find(
                                function (r) {
                                    return (aValue.when === r.when && aValue.where === r.where)
                                });
                            if (!dataRecord) {

                                dataRecord = {
                                    when: aValue.when,
                                    where: aValue.where,
                                    latitude: aValue.station.latitude,
                                    longitude: aValue.station.longitude,
                                    elevation: aValue.station.elevation
                                }
                                noaa.dataRecords.push(dataRecord);
                            }
                            dataRecord[aValue.what] = aValue.value;
                        });
                        noaa.ui.setMessage('Sending weather records to CODAP')
                        await noaa.connect.createNOAAItems(noaa.dataRecords,
                            noaa.getCheckedDataTypes());
                        resultText = "Retrieved " + noaa.dataRecords.length + " cases";
                    } else {
                        resultText = 'Retrieved no observations';
                    }
                } else {
                    const result = await tResult.text();
                    var errorMessage = tResult.statusText;
                    if (result.length && (result[0] === '<')) {
                        try {
                            let xmlDoc = new DOMParser().parseFromString(result, 'text/xml');
                            errorMessage = xmlDoc.getElementsByTagName('userMessage')[0].innerHTML;
                            errorMessage += '(' + xmlDoc.getElementsByTagName('developerMessage')[0].innerHTML + ')';
                        } catch (e) {}
                    }
                    console.warn('noaa.doGet(): ' + result);
                    console.warn("noaa.doGet() error: " + errorMessage);
                    resultText = "Error: " + errorMessage;
                }
            } else {
                resultText = 'End date must be on or after start date';
            }
        } catch (msg) {
            console.log('fetch error: ' + msg);
            resultText = 'fetch error: ' + msg;
            theText = msg;
        }
        noaa.ui.setMessage(resultText);
        ev.preventDefault();
        this.blur();
        noaa.ui.setWaitCursor(false);
        return true;
    },

    convertNOAAtoValue: function (iRecord) {
        let out = {};
        out.station = this.findStation(iRecord.station);
        out.when = iRecord.date;
        out.where = noaa.decodeData("where", iRecord.station);
        out.what = noaa.decodeData("what", iRecord.datatype);
        out.value = noaa.decodeData(iRecord.datatype, iRecord.value);
        out.units = noaa.dataTypes[iRecord.datatype].units;
        return out;
    },

    dateChange: function () {
        noaa.state.startDate = document.getElementById("startDate").value;
        noaa.state.endDate = document.getElementById("endDate").value;
    },

    findStation: function (id) {
        return noaa.stations.find(function (sta) {return id === sta.id; });
    },

    getCheckedStations : function() {
        return [noaa.state.selectedStation && noaa.state.selectedStation.id];
    },

    getCheckedDataTypes : function() {
        return noaa.state.selectedDataTypes;
    },

    decodeData: function (iField, iValue) {
        let result = null;
        switch (iField) {
            case "where":
                const station = this.findStation(iValue);
                result = station?station.name: null;
                break;
            case "AWND":
            case "TMAX":
            case "TMIN":
            case "TAVG":
            case "SNOW":
            case "EVAP":
            case "PRCP":
                const decoder = noaa.dataTypes[iField].decode[noaa.state.database];
                result = decoder(iValue);
                break;
            case "what":
                result = noaa.dataTypes[iValue].name;
        }
        return result || iValue;

    },

    constants: {
        version: "0002",

        noaaToken: "rOoVmDbneHBSRPVuwNQkoLblqTSkeayC",
        noaaBaseURL: "https://www.ncdc.noaa.gov/cdo-web/api/v2/",
        defaultStart: "2020-01-01",
        defaultEnd: "2020-01-31",
        defaultStationID: 'GHCND:USW00014755',
        recordCountLimit: 1000,

        DSName: "NOAA-Weather",
        DSTitle: "NOAA Weather",
        dimensions: {height: 120, width: 333},
        tallDimensions: {height: 444, width: 333},
    },

};

window.addEventListener('load', noaa.initialize);
