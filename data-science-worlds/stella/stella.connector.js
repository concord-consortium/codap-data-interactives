/**
 * Created by tim on 3/23/16.


 ==========================================================================
 connector.js in data-science-games.

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

/**
 * Connector singleton, to isolate connections with CODAP
 *
 * Two  -layer hierarchy
 * GAME
 * STARS one case per Star, //  subordinate to the bucket
 *
 * @type {{gameCaseID: number, bucketCaseID: number, gameNumber: number, bucketNumber: number, gameCollectionName: string, bucketCollectionName: string, stebberCollectionName: string, newGameCase: steb.connector.newGameCase, finishGameCase: steb.connector.finishGameCase, newBucketCase: steb.connector.newBucketCase, doStebberRecord: steb.connector.doStebberRecord, getInitSimObject: steb.connector.getInitSimObject}}
 */

/* global stella, alert, pluginHelper, console */

stella.connector = {
    starCaseID: 0,
    spectrumCaseID: 0,

    starResultsCollectionName: "results",
    starResultsDataSetName: "results",
    starResultsDataSetTitle: "Your Results",

    catalogCollectionName: "starCatalog",
    catalogDataSetName: "starCatalog",
    catalogDataSetTitle: "Star Catalog",

    spectraDataSetName: "spectra",
    spectraDataSetTitle: "Stellar Spectra",
    spectraCollectionName: "spectra",
    spectrumChannelCollectionName: "channels",

    photometryDataSetName: "photometry",
    photometryDataSetTitle: "Photometry",
    photometryTargetCollectionName: "runs",
    photometryChannelCollectionName: "channels",


    /**
     * Emit a "star" case, into the star catalog.
     * One case per System.
     * @param iCaseValues   the values to be passed
     * @param iCallback
     */
    emitStarCatalogRecord: function (iCaseValues) { //  , iCallback) {
        pluginHelper.createItems(
            iCaseValues,
            this.catalogDataSetName //  ,iCallback   //  callback is in .manager. To record the case ID (for selection work)
        );
    },

    /**
     * Emit a "result" record of the user's work
     * @param iStarResult   the result to be emitted
     * @param iCallback
     */
    emitStarResult: function (iStarResult, iCallback) {
        pluginHelper.createItems(        //      createCase(
            //          this.starResultsCollectionName,
            {
                date: iStarResult.date,
                id: iStarResult.id,
                type: iStarResult.type,
                value: iStarResult.enteredValue,
                units: iStarResult.units,
                points: iStarResult.points,
                source: iStarResult.source
            },
            this.starResultsDataSetName,
            iCallback           //  callback
        );
    },

    /**
     * Emit a whole spectrum
     * @param iChannels the array of channels (each is an object)
     * @param iName     the name of the spectrum (star or lab designation)
     */
    emitSpectrum: function (iChannels, iName) {
        stella.state.spectrumNumber += 1;       //      serial

        var tChannelValues = [];    //  we will collect all the channels to emit at once

        iChannels.forEach(function (ch) {
            var tOneChannel = {
                specNum: stella.state.spectrumNumber,
                name: iName,
                date: stella.state.now,
                wavelength: ch.min.toFixed(5),
                intensity: ch.intensity.toFixed(2)
            };
            tChannelValues.push(tOneChannel);
        }.bind(this));

        pluginHelper.createItems(
            tChannelValues,
            this.spectraDataSetName,
            null       //  no callback
        );

    },

    emitPhotometry: function (iChannels) {
        stella.state.photometryNumber += 1;       //      serial
        var tChannelValues = [];
        iChannels.forEach(function (ch) {
            var tOneChannel = {
                runNo: stella.state.photometryNumber,
                filter: stella.state.currentFilter ? stella.state.currentFilter.name : "none",
                nm: stella.state.currentFilter ? stella.state.currentFilter.nm : 525,
                date: stella.state.now,
                target: ch.target,
                expose: ch.exposure,
                obs: ch.obs,
                count: ch.count
            }
            tChannelValues.push(tOneChannel);
        }.bind(this));

        pluginHelper.createItems(
            tChannelValues,
            this.photometryDataSetName,
            null        //  no callback
        )
    },

    /**
     * We have case IDs for the stars! Tell CODAP to select this star.
     * @param iSys  the relevant star system
     */
    selectStarInCODAP: function (iSys) {
        var theSysName = iSys.sysID;     //  we know to make it an array before we ever start

        var tSelectionExpression = "[id==" + theSysName + "]";
        var tMessage = {
            action: "get",
            resource: "dataContext[" + this.catalogDataSetName + "].collection[" +
            this.catalogCollectionName + "].caseSearch" + tSelectionExpression
        };

        var tSearchPromise = codapInterface.sendRequest(tMessage).then(
            function (iResult) {
                if (iResult.success) {
                    var tCaseID = iResult.values[0].id;
                    pluginHelper.selectCasesByIDs(tCaseID, this.catalogDataSetName);
                }
            }
        );

    },

    getSelectionListFromCODAP : async function(iDataSetName) {
        const tMessage = {
            action : "get",
            resource : `dataContext[${iDataSetName}].selectionList`,
        };

        const selectionResult = await codapInterface.sendRequest(tMessage);
        if (selectionResult.success) {
            return selectionResult.values;
        } else {
            return null;
        }
    },

    /**
     * constant to initialize the frame structure
     */
    kPluginConfiguration: {
        name: 'Stella',
        title: 'Stella',
        version: stella.constants.version,
        dimensions: {width: 444, height: 555}
    },

    /**
     * Initialize the Results data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getStarResultsDataSetObject: function () {
        return {
            name: this.starResultsDataSetName,
            title: this.starResultsDataSetTitle,
            description: 'the Stella results data set',
            collections: [

                {
                    name: this.starResultsCollectionName,
                    parent: null,       //  this.gameCollectionName,    //  this.bucketCollectionName,
                    labels: {
                        singleCase: "result",
                        pluralCase: "results",
                        setOfCasesWithArticle: "the results data set"
                    },

                    attrs: [
                        {name: "date", type: 'numeric', precision: 4, unit: 'yr', description: "date of result"},
                        {name: "id", type: 'categorical', description: "stellar ID string"},
                        {name: "type", type: 'categorical', description: "result type"},
                        {name: "value", type: 'numeric', precision: 8, description: "result value"},
                        {name: "units", type: 'categorical', description: "units of the result"},
                        {name: "points", type: 'numeric', description: "points awarded"},
                        {name: "source", type: 'categorical', description: "how you got this result"}
                    ]
                }
            ]
        };
    },

    getPhotometryDataSetObject: function () {
        return {
            name: this.photometryDataSetName,
            title: this.photometryDataSetTitle,
            description: 'photometry measurements',

            collections: [ //  two collections, runs (targets) and channels
                {
                    name: this.photometryTargetCollectionName,
                    labels: {
                        singleCase: "run",
                        pluralCase: "runs",
                        setOfCasesWithArticle: "a bunch of runs"
                    },

                    attrs: [
                        {name: "runNo", type: 'categorical'},
                        {
                            name: "date",
                            type: 'numeric',
                            precision: 4,
                            unit: 'yr',
                            description: "date of observation (yr)"
                        },
                        {name: "target", type: 'categorical', description: "the name of the target"},
                        {name: "expose", type: 'numeric', precision: 0, unit: 'sec', description: "exposure time"},
                        {
                            name: "filter", type: 'categorical', description: "the name of the filter",
                            colormap: {
                                "violet": "#990099",
                                "green": "#009900",
                                "red": "red",
                                "none": "brown"
                            }
                        },
                        {name: "nm", type: 'numeric', unit: "nm", precision: 0, description: "midpoint of the filter"}
                    ],
                    childAttrName: 'channel'
                },
                {
                    name: this.photometryChannelCollectionName,
                    parent: this.photometryTargetCollectionName,
                    labels: {
                        singleCase: "channel",
                        pluralCase: "channels",
                        setOfCasesWithArticle: "a spectrum"
                    },
                    attrs: [
                        {name: "obs", type: 'categorical', description: 'target or sky'},
                        {name: "count", type: 'numeric', precision: 0, description: 'counts in this channel'}
                    ]
                }
            ]
        }
    },

    /**
     * Initialize the Spectrum
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitSpectraDataSetObject: function () {
        return {
            name: this.spectraDataSetName,
            title: this.spectraDataSetTitle,
            description: 'stellar spectra',

            collections: [  // There are two collections: spectra, channels
                {
                    name: this.spectraCollectionName,
                    labels: {
                        singleCase: "spectrum",
                        pluralCase: "spectra",
                        setOfCasesWithArticle: "a bunch of spectra"
                    },

                    attrs: [
                        {name: "specNum", type: 'categorical'},
                        {name: "date", type: 'numeric', precision: 4, unit: "yr", description: "date of observation"},
                        {name: "name", type: 'categorical', description: "the name of the spectrum"}
                    ],
                    childAttrName: "channel"
                },
                {
                    name: this.spectrumChannelCollectionName,
                    parent: this.spectraCollectionName,
                    labels: {
                        singleCase: "channel",
                        pluralCase: "channels",
                        setOfCasesWithArticle: "a spectrum"
                    },

                    attrs: [
                        {name: "wavelength", type: 'numeric', unit: 'nm', precision: 5, description: "wavelength"},
                        {name: "intensity", type: 'numeric', precision: 1, description: "intensity (out of 100)"}
                    ]
                }
            ]
        };
    },

    /**
     * Initialize the Catalog data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitStarCatalogDataSetObject: function () {
        return {
            name: this.catalogDataSetName,
            title: this.catalogDataSetTitle,
            description: 'stella star catalog',
            collections: [

                {
                    name: this.catalogCollectionName,
                    parent: null,       //  this.gameCollectionName,    //  this.bucketCollectionName,
                    labels: {
                        singleCase: "star",
                        pluralCase: "stars",
                        setOfCasesWithArticle: "star catalog"
                    },

                    attrs: [
                        {name: "date", type: 'numeric', precision: 4, unit: 'yr', description: "date of observation"},
                        {name: "id", type: 'categorical', description: "Stellar ID string"},
                        {name: "x", type: 'numeric', precision: 6, unit: 'deg', description: "angle in x"},
                        {name: "y", type: 'numeric', precision: 6, unit: 'deg', description: "angle in y"},
                        {name: "bright", type: 'numeric', precision: 2, description: "log of apparent brightness"},
                        // {name: "m", type: 'numeric', precision: 2, description: "apparent magnitude"},
                        {name: "F400", type: 'numeric', precision: 2, description: "log brightness using 400nm filter"},
                        {name: "F500", type: 'numeric', precision: 2, description: "log brightness using 500nm filter"},
                        {name: "F600", type: 'numeric', precision: 2, description: "log brightness using 600nm filter"},
                        {name: "name", type: 'categorical'}
                    ]
                }
            ]
        };
    }
};


/**
 * We call this to initialize the data interactive.
 * Two parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */

function startCodapConnection() {
    console.log("In stella.connector, startCodapConnection()");

    codapInterface.init(stella.connector.kPluginConfiguration, null).then(
        function () {

            //  array of promises to make data sets
            var tInitDatasetPromises = [
                pluginHelper.initDataSet(stella.connector.getStarResultsDataSetObject()),
                pluginHelper.initDataSet(stella.connector.getPhotometryDataSetObject()),
                pluginHelper.initDataSet(stella.connector.getInitSpectraDataSetObject()),
                pluginHelper.initDataSet(stella.connector.getInitStarCatalogDataSetObject())
            ];

            Promise.all(tInitDatasetPromises).then(
                function () {
                    console.log("Promise.all complete: all data sets initialized!");

                    //  initialize all the stella variables
                    stella.initialize();

                    //  register to receive notifications about changes in the star catalog (esp selection)
                    var tResource = 'dataContextChangeNotice[' + stella.connector.catalogDataSetName + ']'; // todo: dataContextChangeNotice??
                    codapInterface.on(
                        'notify',
                        tResource,
                        stella.manager.stellaDoCommand
                    );
                }
            ).catch(function () {
                alert("Problem creating data sets. Are you connected to CODAP?");
            });
        }
    );
    //  stella.manager.stellaDoCommand         //  the callback needed
}

