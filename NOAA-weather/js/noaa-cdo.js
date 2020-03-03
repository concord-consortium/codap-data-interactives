
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
import * as codapConnect from './CODAPconnect.js';
import * as ui from './noaa.ui.js';
import {dataTypes} from './noaaDataTypes.js';
import {findStation} from './noaaStations.js';

var noaaCDOConnect = {

    state: null,

    constants: null,

    initialize: function (state, constants) {
        this.state = state;
        this.constants = constants;
    },

    doGetHandler: async function (ev) {
        function composeURL () {
            const startDate = noaaCDOConnect.state.startDate;
            const endDate = noaaCDOConnect.state.endDate;
            if (new Date(startDate) <= new Date(endDate)) {
                const typeNames = noaaCDOConnect.getSelectedDataTypes().map(function (dataType) {
                    return dataType.name;
                })
                const tDatasetIDClause = "&datasetid=" + noaaCDOConnect.state.database;
                const tStationIDClause = "&stationid=" + noaaCDOConnect.getSelectedStations().join(
                    "&stationid=");
                const tDataTypeIDClause = "&datatypeid=" + typeNames.join(
                    "&datatypeid=");
                const tDateClause = "&startdate=" + startDate + "&enddate=" + endDate;

                let tURL = noaaCDOConnect.constants.noaaBaseURL + "data?limit="
                    + noaaCDOConnect.constants.recordCountLimit + tDatasetIDClause
                    + tStationIDClause + tDataTypeIDClause + tDateClause;
                return tURL
            }
        }

        async function processResults(results) {
            let dataValues = [];
            results.forEach((r) => {
                nRecords++;
                theText += "<br>" + JSON.stringify(r);
                const aValue = noaaCDOConnect.convertNOAAtoValue(r);
                dataValues.push(aValue);
            });
            let dataRecords = [];
            dataValues.forEach(function (aValue) {
                let dataRecord = dataRecords.find(
                    function (r) {
                        return (aValue.when === r.when && aValue.where === r.where)
                    });
                if (!dataRecord) {

                    dataRecord = {
                        when: aValue.when,
                        where: aValue.where,
                        latitude: aValue.station.latitude,
                        longitude: aValue.station.longitude,
                        elevation: aValue.station.elevation,
                        'report type': reportType
                    }
                    dataRecords.push(dataRecord);
                }
                dataRecord[aValue.what] = aValue.value;
            });
            ui.setMessage('Sending weather records to CODAP')
            await codapConnect.createNOAAItems(noaaCDOConnect.constants,
                dataRecords, noaaCDOConnect.getSelectedDataTypes());
            resultText = "Retrieved " + dataRecords.length + " cases";
            return resultText;
        }

        function convertErrorResult(result, errorMessage) {
            if (result.length && (result[0] === '<')) {
                try {
                    let xmlDoc = new DOMParser().parseFromString(result, 'text/xml');
                    errorMessage = xmlDoc.getElementsByTagName('userMessage')[0].innerHTML;
                    errorMessage += '(' + xmlDoc.getElementsByTagName('developerMessage')[0].innerHTML + ')';
                } catch (e) {}
            }
            console.warn('noaaCDOConnect.doGetHandler(): ' + result);
            console.warn("noaaCDOConnect.doGetHandler() error: " + errorMessage);
            return errorMessage;
        }


        ui.setWaitCursor(true);
        let theText = "Default text";
        let nRecords = 0;

        const reportType = noaaCDOConnect.state.database==='GHCND'?'daily':'monthly';
        let tURL = composeURL();

        let tHeaders = new Headers();
        tHeaders.append("token", noaaCDOConnect.constants.noaaToken);

        const tRequest = new Request(tURL, {headers: tHeaders});

        let resultText = "";
        try {
            if (tURL) {
                ui.setMessage('Fetching weather records from NOAA');
                const tResult = await fetch(tRequest);
                if (tResult.ok) {
                    ui.setMessage('Converting weather records')
                    const theJSON = await tResult.json();
                    if (theJSON.results) {
                        resultText = await processResults(theJSON.results);
                    } else {
                        resultText = 'Retrieved no observations';
                    }
                } else {
                    const result = await tResult.text();
                    var errorMessage = convertErrorResult(result, tResult.statusText);
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
        ui.setMessage(resultText);
        ev.preventDefault();
        this.blur();
        ui.setWaitCursor(false);
        return true;
    },

    convertNOAAtoValue: function (iRecord) {
        let out = {};
        out.station = findStation(iRecord.station);
        out.when = iRecord.date;
        out.where = this.decodeData("where", iRecord.station);
        out.what = this.decodeData("what", iRecord.datatype);
        out.value = this.decodeData(iRecord.datatype, iRecord.value);
        out.units = dataTypes[iRecord.datatype].units;
        return out;
    },

    getSelectedStations : function() {
        return [this.state.selectedStation && this.state.selectedStation.id];
    },

    getSelectedDataTypes : function() {
        return this.state.selectedDataTypes.map(function (typeName) {
            return dataTypes[typeName];
        });
    },

    decodeData: function (iField, iValue) {
        let result = null;
        switch (iField) {
            case "where":
                const station = findStation(iValue);
                result = station?station.name: null;
                break;
            case "AWND":
            case "TMAX":
            case "TMIN":
            case "TAVG":
            case "SNOW":
            case "EVAP":
            case "PRCP":
                const decoder = dataTypes[iField]
                    && dataTypes[iField].decode
                    && dataTypes[iField].decode[this.state.database];
                result = decoder?decoder(iValue):iValue;
                break;
            case "what":
                result = dataTypes[iValue].name;
        }
        return result || iValue;
    }
};

export {noaaCDOConnect}
