
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

const noaaNCEIConnect = {

    state: null,

    constants: null,

    initialize: function (state, constants) {
        this.state = state;
        this.constants = constants;
    },

    doGetHandler: async function (ev) {
        function composeURL() {
            const format = 'YYYY-MM-DD';
            // noinspection JSPotentiallyInvalidConstructorUsage
            const startDate = new dayjs(noaaNCEIConnect.state.startDate).format(
                format);
            // noinspection JSPotentiallyInvalidConstructorUsage
            const endDate = new dayjs(noaaNCEIConnect.state.endDate).format(
                format);
            if (new Date(startDate) <= new Date(endDate)) {
                // const typeNames = noaaNCEIConnect.getSelectedDataTypes().map(function (dataType) {
                //     return dataType.name;
                // })
                const tDatasetIDClause = "dataset=" + noaaNCEIConnect.state.database;
                const tStationIDClause = "stations=" + noaaNCEIConnect.getSelectedStations().join();
                const dataTypes = noaaNCEIConnect.state.selectedDataTypes.filter(
                    function (dt) {
                        return dt !== 'all-datatypes';
                    });
                const tDataTypeIDClause = `dataTypes=${dataTypes.join()}`;
                const tstartDateClause = `startDate=${startDate}`;
                const tEndDateClause = `endDate=${endDate}`;
                const tUnitClause = `units=${noaaNCEIConnect.state.unitSystem}`;
                const tFormatClause = 'format=json';

                let tURL = [noaaNCEIConnect.constants.nceiBaseURL, [tDatasetIDClause, tStationIDClause, tstartDateClause, tEndDateClause, tFormatClause, tDataTypeIDClause, tUnitClause].join(
                    '&')].join('?');
                console.log(`Fetching: ${tURL}`);
                return tURL
            }
        }

        async function processResults(results, reportType, unitSystem) {
            let dataRecords = [];
            results.forEach((r) => {
                nRecords++;
                theText += "<br>" + JSON.stringify(r);
                const aValue = noaaNCEIConnect.convertNOAARecordToValue(r);
                aValue.latitude = aValue.station.latitude;
                aValue.longitude = aValue.station.longitude;
                aValue.elevation = aValue.station.elevation;
                aValue['report type'] = reportType;
                dataRecords.push(aValue);
            });
            ui.setMessage('Sending weather records to CODAP')
            await codapConnect.createNOAAItems(noaaNCEIConnect.constants,
                dataRecords, noaaNCEIConnect.getSelectedDataTypes(), unitSystem);
            resultText = "Retrieved " + dataRecords.length + " cases";
            return resultText;
        }

        function convertErrorResult(result, errorMessage) {
            if (result.length && (result[0] === '<')) {
                try {
                    let xmlDoc = new DOMParser().parseFromString(result,
                        'text/xml');
                    errorMessage = xmlDoc.getElementsByTagName(
                        'userMessage')[0].innerHTML;
                    errorMessage += '(' + xmlDoc.getElementsByTagName(
                        'developerMessage')[0].innerHTML + ')';
                } catch (e) {
                }
            }
            console.warn('noaaNCEIConnect.doGetHandler(): ' + result);
            console.warn(
                "noaaNCEIConnect.doGetHandler() error: " + errorMessage);
            return errorMessage;
        }


        ui.setWaitCursor(true);
        ui.setTransferStatus('retrieving',
            'Fetching weather records from NOAA');
        let theText = "Default text";
        let nRecords = 0;

        const reportType = noaaNCEIConnect.constants.reportTypeMap[noaaNCEIConnect.state.database];
        let tURL = composeURL();

        // let tHeaders = new Headers();
        // tHeaders.append("token", noaaNCEIConnect.constants.noaaToken);
        //
        const tRequest = new Request(tURL/*, {headers: tHeaders}*/);

        let resultText = "";
        let resultStatus = 'failure';
        try {
            if (tURL) {
                const tResult = await fetch(tRequest);
                if (tResult.ok) {
                    ui.setTransferStatus('retrieving',
                        'Converting weather records')
                    const theJSON = await tResult.json();
                    if (theJSON) {
                        resultText = await processResults(theJSON, reportType, noaaNCEIConnect.state.unitSystem);
                        resultStatus = 'success';
                    } else {
                        resultText = 'Retrieved no observations';
                    }
                } else {
                    let result = await tResult.text();
                    let errorMessage = convertErrorResult(result,
                        tResult.statusText);
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
        ui.setTransferStatus(resultStatus, resultText);
        ev.preventDefault();
        ev.target && ev.target.blur();
        ui.setWaitCursor(false);
        return true;
    },

    convertNOAARecordToValue: function (iRecord) {
        let out = {};
        Object.keys(iRecord).forEach(function (key) {
            let value = iRecord[key];
            let dataTypeName;
            switch (key) {
                case 'DATE':
                    dataTypeName = 'when';
                    break;
                case 'STATION':
                    dataTypeName = 'where';
                    value = this.state.selectedStation.name;
                    out.station = this.state.selectedStation;
                    break;
                default:
                    dataTypeName = dataTypes[key] && dataTypes[key].name;
            }
            if (dataTypeName) {
                out[dataTypeName] = noaaNCEIConnect.decodeData(key, value);
            }
        }.bind(this));
        return out;
    },

    getSelectedStations: function () {
        return [this.state.selectedStation && this.state.selectedStation.id];
    },

    getSelectedDataTypes: function () {
        return this.state.selectedDataTypes.filter(function (dt) {
            return !!dataTypes[dt];
        }).map(function (typeName) {
            return dataTypes[typeName];
        });

    },

    decodeData: function (iField, iValue) {
        let result = null;
        switch (iField) {
            case "STATION":
            // const station = findStation(iValue);
            // result = station?station.name: null;
            // break;
            case "AWND":
            case "TMAX":
            case "TMIN":
            case "TAVG":
            case "SNOW":
            case "EVAP":
            case "PRCP":
                const decoder = dataTypes[iField] && dataTypes[iField].decode && dataTypes[iField].decode[this.state.database];
                result = decoder ? decoder(iValue) : iValue;
                break;
        }
        return result || iValue;
    }
};

export {noaaNCEIConnect}
