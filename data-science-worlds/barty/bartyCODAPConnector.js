/**
 * Created by tim on 2/24/16.


 ==========================================================================
 bartCODAPConnector.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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


barty.connector = {

    caseTableEverMade : false,

    initialize : async function () {
        this.caseTableEverMade = false;
        await codapInterface.init(this.iFrameDescriptor, null);
        await pluginHelper.initDataSet(this.bartyDataContextSetupObject);

        //  now update the iframe to be mutable...

        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        const updateResult = await codapInterface.sendRequest(tMessage);

    },

    makeTableAppear : function() {
        if (!this.caseTableEverMade) {
            codapInterface.sendRequest({
                "action": "create",
                "resource": "component",
                "values": {
                    "type": "caseTable",
                    "name": barty.constants.kBARTYDataSetName
                }
            })
            this.caseTableEverMade = true;
        }
    },

    outputDataItems : function( iValArray ) {
        pluginHelper.createItems(iValArray, barty.constants.kBARTYDataSetName);
    },

    bartyDataContextSetupObject : {
        name : barty.constants.kBARTYDataSetName,
        title : barty.constants.kBARTYDataSetTitle,
        description : "BART hourly data",
        collections : [
            {
                name: barty.constants.kBARTYCollectionName,
                labels: {
                    singleCase: "record",
                    pluralCase: "records",
                    setOfCasesWithArticle: "a group of records"
                },
                attrs: [
                    //{name: "gameNumber", type: 'categorical'},
                    {name: "request", type: 'categorical'},
                    {name: "when", type: 'date', description : "what time and day"},
                    {name: "day",
                        type : 'categorical',
                        colormap : barty.constants.kWeekdayColorMap,
                        description : "day of the week"
                    },
                    {name: "hour", type: 'numeric', precision : 0, description : "hour (24-hour clock)"},
                    {name: "date", type: 'categorical', description : "the date"},
                    {name: "riders", type: 'numeric', precision : 0,
                        description : "number of riders leaving the system that hour"},
                    {name: "startAt", type: 'categorical',
                        description : "station where these passengers entered BART"},
                    {name: "endAt", type: 'categorical',
                        description : "station where these passengers exited BART"},
                    {name: "startReg",
                        type: 'categorical',
                        colormap : barty.constants.kRegionColorMap,
                        description : "region where these passengers entered BART" },
                    {name: "endReg",
                        type: 'categorical',
                        colormap : barty.constants.kRegionColorMap,
                        description : "region where these passengers exited BART" }
                ]
            }
        ]

    },

    iFrameDescriptor : {
        name: barty.constants.name,
        title: barty.constants.name,
        version: barty.constants.version,
        dimensions: barty.constants.dimensions,

        preventDataContextReorg: false

    }
};



