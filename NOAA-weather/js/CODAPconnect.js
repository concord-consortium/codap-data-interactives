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

    pluginProperties: null,

    initialize : async function (pluginProperties) {
        this.pluginProperties = pluginProperties;
        await codapInterface.init(this.getPluginDescriptor(pluginProperties), null);
        await pluginHelper.initDataSet(this.getNoaaDataContextSetupObject(pluginProperties));

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

    getInteractiveState: async function() {
        return await codapInterface.getInteractiveState();
    },

    /**
     * Creates an attribute
     * @param name
     * @return Promise of result
     */
    createAttribute: function (datasetName, collectionName, dataType) {
        return codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext[' + datasetName + '].collection[' + collectionName + '].attribute',
            values: {
                name: dataType.name,
                unit: dataType.units,
                description: dataType.description
            }
        })
    },

    /**
     * Creates new attributes for any that do not already exist.
     * @param attrNames
     * @return a Promise fulfilled when all attributes are created.
     */
    updateDataset: async function (dataTypes) {
        const result = await codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.pluginProperties.DSName + ']'
        });
        if (!result || !result.success) {
            return;
        }
        const dataSetDef = result.values;
        const attrDefs = [];
        const dsName = this.pluginProperties.DSName;
        dataSetDef.collections.forEach(function (collection) {
            collection.attrs.forEach(function (attr) {
                attrDefs.push(attr);
            })
        });
        const lastCollection = dataSetDef.collections[dataSetDef.collections.length - 1];
        const promises = dataTypes.map(function (dataType) {
            const attrName = dataType.name;
            const attrDef = attrDefs.find(function (ad) {
                return ad.name === attrName;
            });
            if (!attrDef) {
                return this.createAttribute(dsName, lastCollection.name, dataType);
            } else {
                return Promise.resolve('Unknown attribute.')
            }
        }.bind(this));
        return Promise.all(promises);
    },

    /**
     * Creates the weather station dataset in CODAP.
     * @param stations a list of station descriptor objects
     * @param selectionHandler called when a station is selected in the created
     * dataset. The station id is passed or null.
     * @return {Promise<void>}
     */
    createStationsDataset: async function (stations, selectionHandler) {
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
                            height: 350,
                            width: 500
                        }
                    }
                })
            }
        }
        codapInterface.on('notify',
                'dataContextChangeNotice[US-Weather-Stations]',
                function (req, obj){
            if (req.values.operation === 'selectCases') {
                const result = req.values.result;
                const myCase = result && result.cases[0];
                selectionHandler(myCase?myCase.values.id:null);
            }
        });
    },

    addNotificationHandler: function (action, resource, handler) {
        codapInterface.on(action, resource, handler);
    },
    /**
     * Tell CODAP to make items.
     * @param pluginProperties object: must name DSName, name of weather dataset.
     * @param iValues   An array of objects containing the keys and values
     * corresponding to attributes and values of the new cases.
     * @param dataTypes An array of datatypes to be reference for creating attributes
     */
    createNOAAItems: async function (props, iValues, dataTypes) {
        await this.updateDataset(dataTypes);

        iValues = pluginHelper.arrayify(iValues);
        console.log("noaa-cdo ... createNOAAItems with " + iValues.length + " case(s)");
        await pluginHelper.createItems(iValues, props.DSName); // no callback.

        //  also make the case table show up
        codapInterface.sendRequest({
            "action": "create",
            "resource": "component",
            "values": {
                "type": "caseTable",
                "dataContext": props.DSName
            }
        });
    },

    selectStations: async function (stationNames) {
        const dsName = 'US-Weather-Stations';
        const collectionName = 'US Weather Stations';
        const req = stationNames.map(function (stationName) {
           return {
               action: 'get',
               resource: `dataContext[${dsName}].collection[${collectionName}].caseSearch[name==${stationName}]`
           }
        });
        const reply = await codapInterface.sendRequest(req);
        const selectionList = reply.filter(function (r) {
                return r && r.success;
            }).map(function (r) {
                return r.values[0].id;
            });
        await codapInterface.sendRequest({
            action: 'create',
            resource: `dataContext[${dsName}].selectionList`,
            values: selectionList
        });
    },

    /**
     * Returns a plugin descriptor object for creating connection to CODAP/
     * @param props: must have DSName, name of Weather dataset; DSTitle, title of
     * dataset; version, version string; and dimensions.
     * @return {{}}}
     */
    getPluginDescriptor : function (props) {
        return {
            name: props.DSName,
            title: props.DSTitle,
            version: props.version,
            dimensions: props.tallDimensions,      //      dimensions,
        }
    },

    /**
     * Returns a data context initialization object for NOAA weather information.
     * This is a two level hierarchy. Top level has data about the station.
     * Bottom level has weather data for a discrete time interval.
     * @param props: pluginConfiguration object. Must have DSName, name of dataset.
     * @return {{}}
     */
    getNoaaDataContextSetupObject : function (props) {
        return {
            name: props.DSName,
            title: props.DSName,
            description: "Data from NOAA",
            collections: [{
                name: props.DSName,
                labels: {
                    singleCase: "station", pluralCase: "stations",
                },
                attrs: [
                    {name: "where", type: 'categorical', description: "weather station"},
                    {name: "latitude", type: 'numeric', description: "Latitude of weather station"},
                    {name: "longitude", type: 'numeric', description: "Longitude of weather station"},
                    {name: "elevation", type: 'numeric', description: "Elevation of weather station", unit: "meters"},
                    {name: "report type", type: 'categorical', description: 'Daily summary or monthly summary'}
                ]
            },
            {
                name: "Observations",
                parent: props.DSName,
                labels: {
                    singleCase: "observation",
                    pluralCase: "observations",
                    setOfCasesWithArticle: "a group of records"
                },
                attrs: [{name: "when", type: 'date', description: "what day"}]
            }]

        };
    }
};
