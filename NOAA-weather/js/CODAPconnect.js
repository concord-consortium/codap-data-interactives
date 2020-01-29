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
/*global noaa:true */
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
        this.createStationsDataset();
    },

    getInteractiveState: async function() {
        return await codapInterface.getInteractiveState();
    },

    /**
     * Creates an attribute
     * @param name
     * @return Promise of result
     */
    createAttribute: function (datasetName, collectionName, typeName) {
        return codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext[' + datasetName + '].collection[' + collectionName + '].attribute',
            values: {
                name: noaa.dataTypes[typeName].name,
                unit: noaa.dataTypes[typeName].units,
                description: noaa.dataTypes[typeName].description
            }
        })
    },

    /**
     * Creates new attributes for any that do not already exist.
     * @param attrNames
     * @return a Promise fulfilled when all attributes are created.
     */
    updateDataset: async function (typeNames) {
        const result = await codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + noaa.constants.DSName + ']'
        });
        if (!result || !result.success) {
            return;
        }
        const dataSetDef = result.values;
        const attrDefs = [];
        dataSetDef.collections.forEach(function (collection) {
            collection.attrs.forEach(function (attr) {
                attrDefs.push(attr);
            })
        });
        const lastCollection = dataSetDef.collections[dataSetDef.collections.length - 1];
        const promises = typeNames.map(function (typeName) {
            const attrName = noaa.dataTypes[typeName].name;
            const attrDef = attrDefs.find(function (ad) {
                return ad.name === attrName;
            });
            if (!attrDef) {
                return this.createAttribute(noaa.constants.DSName, lastCollection.name, typeName);
            } else {
                return Promise.resolve('Unknown attribute.')
            }
        }.bind(this));
        return Promise.all(promises);
    },

    createStationsDataset: async function () {
        const stations = noaa.stations;
        let result = await codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[US-Weather-Stations]'
        });
        const componentsResult = await codapInterface.sendRequest({
            action: 'get',
            resource: 'componentList'
        });
        const hasMap = componentsResult
            && componentsResult.success
            && componentsResult.values.find(function (component) {
            return component.type==="map";
        });

        if (!result || !result.success) {
            result = await codapInterface.sendRequest({
                action: 'create',
                resource: 'dataContext',
                values: {
                    name: 'US-Weather-Stations',
                    label: "US Weather Stations",
                    collections: [{
                        name: "US Weather Stations",
                        attrs: [
                            { name: 'name' },
                            { name: 'datacoverage' },
                            { name: 'elevation'},
                            { name: 'elevationUnit' },
                            { name: 'id' },
                            { name: 'maxdate' },
                            { name: 'mindate' },
                            { name: 'latitude' },
                            { name: 'longitude' },
                        ]
                    }]
                }
            });
            result = await codapInterface.sendRequest({
                action: 'create',
                resource: 'dataContext[US-Weather-Stations].item',
                values: stations
            });
            if (!hasMap) {
                result = await codapInterface.sendRequest({
                    action: 'create',
                    resource: 'component',
                    values: {
                        type: 'map',
                        name: 'Weather Stations',
                        dimensions: {
                            height: 240,
                            width: 320
                        }
                    }
                })
            }
        }
        codapInterface.on('notify', 'dataContextChangeNotice[US-Weather-Stations]', function (req, obj){
            if (req.values.operation === 'selectCases') {
                const result = req.values.result;
                const myCase = result && result.cases[0];
                if (myCase) {
                    noaa.state.selectedStation = noaa.stations.find(function (sta) {
                        return myCase.values.id === sta.id;
                    });
                } else {
                    noaa.state.selectedStation = null;
                }
                noaa.ui.setStationName(noaa.state.selectedStation?noaa.state.selectedStation.name:'');
            }
        });
    },

    /**
     * Tell CODAP to make items.
     * @param iValues   An array of objects containing the keys and values
     * corresponding to attributes and values of the new cases.
     */
    createNOAAItems: async function (iValues, attrNames) {
        await this.updateDataset(attrNames);

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
                    singleCase: "station",
                    pluralCase: "stations",
                },
                attrs: [
                    {name: "where", type: 'categorical', description: "weather station"},
                    {name: "latitude", type: 'numeric', description: "Latitude of weather station"},
                    {name: "longitude", type: 'numeric', description: "Longitude of weather station"},
                    {name: "elevation", type: 'numeric', description: "Elevation of weather station", unit: "meters"},
                ]
            },
            {
                name: "Observations",
                parent: noaa.constants.DSName,
                labels: {
                    singleCase: "observation",
                    pluralCase: "observations",
                    setOfCasesWithArticle: "a group of records"
                },
                attrs: [
                    {name: "when", type: 'date', description : "what day"}
                ]
            }
        ]

    }
};
