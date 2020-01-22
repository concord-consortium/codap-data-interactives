
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
let noaa = {

    initialize: function () {
        noaa.state.startDate = noaa.constants.defaultStart;
        noaa.state.endDate = noaa.constants.defaultEnd;

        noaa.connect.initialize();
        noaa.ui.initialize();
    },

    dataValues: [], dataRecords: [],

    state: {
        startDate: null, endDate: null, database: null,
    },

    stationIDs: ["GHCND:USW00023234",        //  KSFO
        "GHCND:USW00023174",      //  KLAX
    ],

    doGet: async function () {
        let theText = "Default text";
        let nRecords = 0;
        noaa.state.database = document.querySelector(
            "input[name='frequencyControl']:checked").value;

        const startDate = noaa.state.startDate;
        const endDate = noaa.state.endDate;
        const tDatasetIDClause = "&datasetid=" + noaa.state.database;
        const tStationIDClause = "&stationid=" + noaa.ui.getCheckedStations().join(
            "&stationid=");
        const tDataTypeIDClause = "&datatypeid=" + noaa.ui.getCheckedDataTypes().join(
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
                const tResult = await fetch(tRequest);
                if (tResult.ok) {
                    const theJSON = await tResult.json();
                    if (theJSON.results) {
                        theJSON.results.forEach((r) => {
                            nRecords++;
                            theText += "<br>" + JSON.stringify(r);
                            const aValue = noaa.convertNOAAtoValue(r);
                            noaa.dataValues.push(aValue);
                        });
                        noaa.dataValues.forEach(function (aValue) {
                            let dataRecord = noaa.dataRecords.find(
                                function (r) {
                                    return (aValue.when === r.when && aValue.where === r.where)
                                });
                            if (!dataRecord) {
                                dataRecord = {
                                    when: aValue.when, where: aValue.where
                                }
                                noaa.dataRecords.push(dataRecord);
                            }
                            dataRecord[aValue.what] = aValue.value;
                        });
                        noaa.connect.createNOAAItems(noaa.dataRecords,
                            noaa.ui.getCheckedDataTypes());
                        resultText = "Retrieved " + noaa.dataRecords.length + " cases";
                    } else {
                        resultText = 'Retrieved no observations';
                    }
                } else {
                    console.error("noaa.doGet() error: " + tResult.statusText);
                    resultText = "Error. No observations retrieved.";
                }
            } else {
                resultText = 'End date must be on or after start date';
            }
        } catch (msg) {
            console.log('fetch error: ' + msg);
            resultText = 'fetch error: ' + msg;
            theText = msg;
        }
        this.setResultMessage(resultText);
    },

    setResultMessage: function (resultText) {
        document.getElementById("results").innerHTML = resultText;

    },

    convertNOAAtoValue: function (iRecord) {
        let out = {};
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

    decodeData: function (iField, iValue) {
        switch (iField) {
            case "where":
                return noaa.stations[iValue].name;
            case "AWND":
            case "TMAX":
            case "TMIN":
            case "TAVG":
            case "SNOW":
            case "EVAP":
            case "PRCP":
                const decoder = noaa.dataTypes[iField].decode[noaa.state.database];
                return decoder(iValue);
                break;
            case "what":
                return noaa.dataTypes[iValue].name;
        }
        return iValue;

    },

    constants: {
        version: "0001",

        noaaToken: "rOoVmDbneHBSRPVuwNQkoLblqTSkeayC",
        noaaBaseURL: "https://www.ncdc.noaa.gov/cdo-web/api/v2/",
        defaultStart: "2018-01-01",
        defaultEnd: "2018-01-31",
        recordCountLimit: 1000,

        DSName: "NOAA-Weather",
        DSTitle: "NOAA Weather",
        dimensions: {height: 120, width: 333},
        tallDimensions: {height: 444, width: 333},

        spreader: {
            "URL": "https://codap.xyz/plugins/spreader/",      //  "http://localhost:8888/plugins/spreader/",
            "dimensions": {height: 210, width: 380},
        }
    },

};
