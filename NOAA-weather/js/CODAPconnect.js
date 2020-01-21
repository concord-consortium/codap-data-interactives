/*
==========================================================================

 * Created by tim on 8/22/19.
 
 
 ==========================================================================
CODAPconnect in noaa-cdo

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

noaa.connect = {

    initialize : async function () {
        await codapInterface.init(this.iFrameDescriptor, null);
        await pluginHelper.initDataSet(this.noaaDataContextSetupObject);

        //  and now mutable
        const tMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false,
            }
        };
        await codapInterface.sendRequest(tMessage);
    },

    createSpreader: function () {
        const theSpreaderRequest = {
            "action": "create",
            "resource": "component",
            "values": {
                "type": "game",
                "name": "name-webview",
                "title": "data spreader",
                "URL": noaa.constants.spreader.URL,
                "dimensions": noaa.constants.spreader.dimensions,
            }
        };

        codapInterface.sendRequest(theSpreaderRequest);
    },

    /**
     * Tell CODAP to make items.
     * @param iValues   An array of objects containing the keys and values
     * corresponding to attributes and values of the new cases.
     */
    createNOAAItems: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        console.log("noaa-cdo ... createNOAAItems with " + iValues.length + " case(s)");
        await pluginHelper.createItems(
            iValues,
            noaa.constants.DSName
        ); // no callback.

        //  also make the case table show up
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": noaa.constants.DSName
            }
        });
    },

    iFrameDescriptor : {
        name: noaa.constants.DSName,
        title: noaa.constants.DSTitle,
        version: noaa.constants.version,
        dimensions: noaa.constants.tallDimensions,      //      dimensions,
    },

    noaaDataContextSetupObject : {
        name : noaa.constants.DSName,
        title : noaa.constants.DSName,
        description : "Data from NOAA",
        collections : [
            {
                name: noaa.constants.DSName,
                labels: {
                    singleCase: "observation",
                    pluralCase: "observations",
                    setOfCasesWithArticle: "a group of records"
                },
                attrs: [
                    {name: "where", type: 'categorical', description: "weather station"},
                    {name: "when", type: 'date', description : "what day"},
                    {name: "what", type : 'categorical', description : "the type of observation"},
                    {name: "value", type: 'numeric', precision : 2, description : "the value for the observation"},
                    {name: "units", type: 'categorical', description : "the units for the observation"},
                ]
            }
        ]

    }
};