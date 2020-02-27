
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
import {ui} from './noaa.ui';
import {dataTypes} from './noaaDataTypes';
import {findStation, stations} from './noaaStations';

var noaaNCEIConnect = {

    state: null,

    constants: null,

    initialize: function (state, constants) {
        this.state = state;
        this.constants = constants;
    },

    doGetHandler: async function (ev) {
        function composeURL () {
            const startDate = noaaNCEIConnect.state.startDate;
            const endDate = noaaNCEIConnect.state.endDate;
            if (new Date(startDate) <= new Date(endDate)) {
                // const typeNames = noaaNCEIConnect.getSelectedDataTypes().map(function (dataType) {
                //     return dataType.name;
                // })
                const tDatasetIDClause = "dataset=" + 'daily-summaries';
                const tStationIDClause = "stations=" + noaaNCEIConnect.getSelectedStations().join();
                const tDataTypeIDClause = "dataTypes=" + noaaNCEIConnect.state.selectedDataTypes.join();
                const tstartDateClause = "startDate=" + startDate;
                const tEndDateClause = "endDate=" + endDate;
                const tUnitClause = 'units=metric';
                const tFormatClause = 'format=json';

                let tURL = [
                    noaaNCEIConnect.constants.nceiBaseURL,
                    [
                        tDatasetIDClause,
                        tStationIDClause,
                        tstartDateClause,
                        tEndDateClause,
                        tFormatClause,
                        tDataTypeIDClause,
                        tUnitClause
                    ].join('&')
                ].join('?');
                console.log("Fetching: " + tURL);
                return tURL
            }
        }

        async function processResults(results) {
            let dataRecords = [];
            results.forEach((r) => {
                nRecords++;
                theText += "<br>" + JSON.stringify(r);
                const aValue = noaaNCEIConnect.convertNOAARecordToValue(r);
                aValue.latitude = aValue.station.latitude,
                aValue.longitude = aValue.station.longitude,
                aValue.elevation = aValue.station.elevation,
                aValue['report type'] = reportType
                dataRecords.push(aValue);
            });
            ui.setMessage('Sending weather records to CODAP')
            await codapConnect.createNOAAItems(noaaNCEIConnect.constants,
                dataRecords, noaaNCEIConnect.getSelectedDataTypes());
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
            console.warn('noaaNCEIConnect.doGetHandler(): ' + result);
            console.warn("noaaNCEIConnect.doGetHandler() error: " + errorMessage);
            return errorMessage;
        }


        ui.setWaitCursor(true);
        let theText = "Default text";
        let nRecords = 0;

        const reportType = noaaNCEIConnect.state.database==='GHCND'?'daily':'monthly';
        let tURL = composeURL();

        // let tHeaders = new Headers();
        // tHeaders.append("token", noaaNCEIConnect.constants.noaaToken);
        //
        const tRequest = new Request(tURL/*, {headers: tHeaders}*/);

        let resultText = "";
        try {
            if (tURL) {
                ui.setMessage('Fetching weather records from NOAA');
                const tResult = await fetch(tRequest);
                if (tResult.ok) {
                    ui.setMessage('Converting weather records')
                    const theJSON = await tResult.json();
                    if (theJSON) {
                        resultText = await processResults(theJSON);
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
                  out.station = findStation(iRecord.STATION);
                  break;
              default:
                  dataTypeName = dataTypes[key] && dataTypes[key].name;
          }
          if (dataTypeName) {
              out[dataTypeName] = noaaNCEIConnect.decodeData(key, value);
          }
        });
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
            case "STATION":
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
        }
        return result || iValue;
    }
};

export {noaaNCEIConnect}
