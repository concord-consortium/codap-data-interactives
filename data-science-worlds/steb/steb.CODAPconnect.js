/**
 * Created by tim on 3/23/16.


 ==========================================================================
 CODAPconnect.js in data-science-games.

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
 * NEW API
 *
 * Three-layer hierarchy
 * GAME
 * BUCKET (for a set of Stebbers, has current score, etc). Every 10 "meals"
 * STEBBERS one case per Stebber, subordinate to the bucket
 *
 * @type {{gameCaseID: number, bucketCaseID: number, gameNumber: number, bucketNumber: number, gameCollectionName: string, bucketCollectionName: string, stebberCollectionName: string, newGameCase: steb.CODAPconnect.newGameCase, finishGameCase: steb.CODAPconnect.finishGameCase, newBucketCase: steb.CODAPconnect.newBucketCase, doStebberRecord: steb.CODAPconnect.doStebberRecord, getInitSimObject: steb.CODAPconnect.getInitSimObject}}
 */

/* global steb, codapHelper, alert, console */

steb.CODAPconnect = {
    gameCaseIDInLiving: 0,
    gameCaseIDInEaten: 0,
    bucketCaseID: 0,
    bucketNumber: 0,
    gameCollectionName: "games",
    bucketCollectionName: "snapshots",
    stebberCollectionName: "survivors",
    eatenCollectionName: "eatenStebbers",
    bornCollectionName: "bornStebbers",
    environmentCollectionName: "environs",

    logMessage : function(iString, iSubs) {
        codapHelper.logMessage( iString, iSubs );
    },


    selectStebberInCODAP : function( iStebber ) {
        codapHelper.selectCasesByIDs( iStebber.caseIDs, steb.constants.dataSetName_Living );
    },

    getSelectedStebberIDs : function( iCallback ) {
        codapHelper.getSelectionList(
            steb.constants.dataSetName_Living,
            iCallback
        );
    },

    emitStebberRecord : function( iValues, iCallback, iDataSet ) {
        codapHelper.createItems( iValues, iCallback, iDataSet);
    },

    createLivingStebberTable : function() {
        var tArg = {
            action: 'create',
            resource: 'component',
            values: {
                type: 'caseTable',
                name: steb.constants.strings.livingStebberTableName,
                dimensions: {
                    width: 600,
                    height: 240
                },
                position: 'top',
                dataContext : steb.constants.dataSetName_Living
            }
        };

        codapHelper.codapPhone.call(
            tArg,
            function (iResult) {
                if (iResult.success) {
                    console.log("Table made");
                } else {
                    console.log("Table construction failed.");
                }
            }.bind(this));

    },

    /**
     * Initialize the frame structure
     * @returns {{name: string, title: string, version: string, dimensions: {width: number, height: number}}}
     */
    getInitFrameObject: function () {

        return {
            version: steb.constants.version,
            name: 'Stebbins',
            title: 'Stebbins',
            dimensions: {width: 400, height: 520},
            preventDataContextReorg : false         //  let the user reorganize

            /*, Temporarily, at least, we let CODAP set the default dimensions
            dimensions: {width: 380, height: 500}*/
        };
    },

    /**
     * Initialize the "Living Stebbers" data set
     * @returns {{name: string, title: string, description: string, collections: *[]}}
     */
    getInitLivingStebberDataSetObject: function (  ) {
        return {
            name: steb.constants.dataSetName_Living,
            title: steb.constants.dataSetName_Living,
            description: 'Surviving Stebbers',
            collections: [  // There are three collections: game, bucket, stebber
                {
                    name: this.gameCollectionName,
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a set of games"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNo", type: 'categorical'},
                        {name: "result", type: 'categorical'}
                    ],
                    childAttrName: "snapshot"
                },
                {
                    name: this.bucketCollectionName,
                    parent: this.gameCollectionName,
                    labels: {
                        singleCase: "snapshot",
                        pluralCase: "snapshots",
                        setOfCasesWithArticle: "snapshots of survivors"
                    },
                    // The bucket collection spec:
                    attrs: [
                        {name: "meals", type: 'categorical', description: 'how many stebbers you have eaten'},
                        {name: "score", type: 'numeric', precision: 1, description: 'score at this time'},
                        {name: "bgRGB", type: 'categorical', description: "[red, green, blue] of the background"},
                        {name: "crudRGB", type: 'categorical', description: "[red, green, blue] of the average Crud"},
                        {name: "bgHSB", type: 'categorical', description: "[hue, sat, bright] of the background"},
                        {name: "crudHSB", type: 'categorical', description: "[hue, sat, bright] of the average Crud"}
                    ],
                    childAttrName: "survivor"
                },
                {
                    name: this.stebberCollectionName,
                    parent: this.bucketCollectionName,
                    labels: {
                        singleCase: "survivor",
                        pluralCase: "survivors",
                        setOfCasesWithArticle: "a group of survivors"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "red", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#ff0000'    //
                            },
                            description: "how much red (0 to 15)"},
                        {name: "green", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#00ff00'    //
                            },
                            description: "how much green (0 to 15)"},
                        {name: "blue", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#6688ff'    //
                            },
                            description: "how much blue (0 to 15)"},
                        {name: "hue", type: 'numeric', precision: 3, description: "hue (0 to 1)"},
                        {name: "sat", type: 'numeric', precision: 3},
                        {name: "bright", type: 'numeric', precision: 3},
                        {name: "id", type: 'numeric', precision: 0, description: "id of this stebber"},
                        {name: "mom", type: 'numeric', precision: 0, description: "id of the parent"},
                        {name: "myColor", description: "use as a legend to color points in graph",
                            formula: '"rgb("+red*17+","+green*17+","+blue*17+")"'}
                    ]
                }
            ]
        };
    },


    getInitStebberMealsDataSetObject: function (  ) {
        return {
            name: steb.constants.dataSetName_Eaten,
            title: steb.constants.dataSetName_Eaten,
            description: 'The Stebbers we ate',
            collections: [  // There are three collections: game, environ, stebber
                {
                    name: this.gameCollectionName,
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a set of games"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNo", type: 'categorical'}
                    ],
                    childAttrName: "environs"
                },
                {
                    name: this.environmentCollectionName,
                    parent :    this.gameCollectionName,
                    labels: {
                        singleCase: "environ",
                        pluralCase: "environs",
                        setOfCasesWithArticle: "a set of environs"
                    },
                    // The environment collection spec. Records the colors:
                    attrs: [
                        {name: "bgRGB", type: 'categorical', description: "[red, green, blue] of the background"},
                        {name: "crudRGB", type: 'categorical', description: "[red, green, blue] of the average Crud"},
                        {name: "bgHSB", type: 'categorical', description: "[hue, sat, bright] of the background"},
                        {name: "crudHSB", type: 'categorical', description: "[hue, sat, bright] of the average Crud"}
                    ],
                    childAttrName: "meals"
                },
                {
                    name: this.eatenCollectionName,
                    parent: this.environmentCollectionName,
                    labels: {
                        singleCase: "meal",
                        pluralCase: "meals",
                        setOfCasesWithArticle: "a set of meals"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "meals", type: 'numeric', precision: 0, description: "which meal was this?"},
                        {name: "score", type: 'numeric', precision: 0, description: "score"},
                        {name: "red", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#ff0000'    //
                            },
                            description: "how much red (0 to 15)"},
                        {name: "green", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#00ff00'    //
                            },
                            description: "how much green (0 to 15)"},
                        {name: "blue", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#6688ff'    //
                            },
                            description: "how much blue (0 to 15)"},
                        {name: "hue", type: 'numeric', precision: 3, description: "hue (0 to 1)"},
                        {name: "sat", type: 'numeric', precision: 3},
                        {name: "bright", type: 'numeric', precision: 3},
                        {name: "id", type: 'numeric', precision: 0, description: "id of this stebber"},
                        {name: "mom", type: 'numeric', precision: 0, description: "id of the parent"},
                        {name: "myColor", description: "use as a legend to color points in graph",
                                formula: '"rgb("+red*17+","+green*17+","+blue*17+")"'}
                    ]
                }
            ]
        };
    },

    getBornStebberDataSetObject: function (  ) {
        return {
            name: steb.constants.dataSetName_Born,
            title: steb.constants.dataSetName_Born,
            description: 'The Stebbers that were born',
            collections: [  // There are three collections: game, environ, stebber
                {
                    name: this.gameCollectionName,
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a set of games"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNo", type: 'categorical'}
                    ],
                    childAttrName: "environs"
                },
                {
                    name: this.environmentCollectionName,
                    parent :    this.gameCollectionName,
                    labels: {
                        singleCase: "environ",
                        pluralCase: "environs",
                        setOfCasesWithArticle: "a set of environs"
                    },
                    // The environment collection spec. Records the colors:
                    attrs: [
                        {name: "bgRGB", type: 'categorical', description: "[red, green, blue] of the background"},
                        {name: "crudRGB", type: 'categorical', description: "[red, green, blue] of the average Crud"},
                        {name: "bgHSB", type: 'categorical', description: "[hue, sat, bright] of the background"},
                        {name: "crudHSB", type: 'categorical', description: "[hue, sat, bright] of the average Crud"}
                    ],
                    childAttrName: "meals"
                },
                {
                    name: this.bornCollectionName,
                    parent: this.environmentCollectionName,
                    labels: {
                        singleCase: "births",
                        pluralCase: "births",
                        setOfCasesWithArticle: "a set of births"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "meals", type: 'numeric', precision: 0, description: "at which meal was this?"},
                        {name: "score", type: 'numeric', precision: 0, description: "score"},
                        {name: "red", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#ff0000'    //
                            },
                            description: "how much red (0 to 15)"},
                        {name: "green", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#00ff00'    //
                            },
                            description: "how much green (0 to 15)"},
                        {name: "blue", type: 'numeric', precision: 1,
                            colormap: {
                                'attribute-color': '#6688ff'    //
                            },
                            description: "how much blue (0 to 15)"},
                        {name: "hue", type: 'numeric', precision: 3, description: "hue (0 to 1)"},
                        {name: "sat", type: 'numeric', precision: 3},
                        {name: "bright", type: 'numeric', precision: 3},
                        {name: "id", type: 'numeric', precision: 0, description: "id of this stebber"},
                        {name: "mom", type: 'numeric', precision: 0, description: "id of the parent"},
                        {name: "myColor", description: "use as a legend to color points in graph",
                            formula: '"rgb("+red*17+","+green*17+","+blue*17+")"'
                        }
                    ]
                }
            ]
        };
    }


};

/**
 * We call this to initialize the data interactive.
 * Three parameters: an object containing the organization of the data,
 * and a callback function when a doCommand is issued.
 * (We'll use it for save and restore)
 */
codapHelper.initDataInteractive(
    steb.CODAPconnect.getInitFrameObject(),
    steb.manager.stebDoCommand,         //  the callback needed for saving state
    steb.manager.stebRestoreState       // the callback for restoring state
);

