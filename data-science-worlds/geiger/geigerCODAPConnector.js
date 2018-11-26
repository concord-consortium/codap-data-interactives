/**
 * Created by tim on 12/10/15.
 */
/*
 ==========================================================================
 geigerCODAPConnector.js

 Critter view class for the med DSG.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
 * Created by tim on 10/28/15.
 */

/**
 * A  manager class responsible for connecting to the CODAP environment
 * @constructor
 */
var GeigerCODAPConnector = function(  ) {
    this.gameCaseID = 0;
    this.gameNumber = 0;
    this.gameCollectionName = null;
};

/**
 * Open a new "parent" case (the "game" level in the hierarchy)
 *
 * @param gameCollectionName
 */
GeigerCODAPConnector.prototype.newGameCase = function(gameCollectionName ) {

    this.gameCollectionName = gameCollectionName;
    this.gameNumber += 1;

    codapHelper.openCase(
        this.gameCollectionName,
        [this.gameNumber, null, 0, null, null],
        function( iResult ) {
            this.gameCaseID = iResult.caseID;
        }.bind(this)
    );

};

/**
 * finishes the current game case
 */
GeigerCODAPConnector.prototype.finishGameCase = function(resultArray ) {
    codapHelper.closeCase(
        this.gameCollectionName,
        resultArray,
        this.gameCaseID
    );
    this.gameCaseID = 0;     //  so we know there is no open case
};

/**
 * Emit an "event" case, low level in the hierarchy.
 * @param values
 */
GeigerCODAPConnector.prototype.doEventRecord = function(values ) {
    codapHelper.createCase(
        'measurements',
        values,
        this.gameCaseID
    ); // no callback.

};
//      end of GeigerCODAPConnector class

GeigerCODAPConnector.prototype.getSaveObject = function() {
    var tOut = {};
    tOut.gameCaseID = this.gameCaseID;
    tOut.gameNumber = this.gameNumber;
    tOut.gameCollectionName = this.gameCollectionName;

    return tOut;
};

GeigerCODAPConnector.prototype.restoreFrom = function( iObject ) {
    this.gameCaseID = iObject.gameCaseID;
    this.gameNumber = iObject.gameNumber;
    this.gameCollectionName = iObject.gameCollectionName;
};

/**
 * Required call to initialize the sim, connect it to CODAP.
 */

if (geigerManager.twoDimensional) {
    codapHelper.initSim(
        {
            name: 'Geiger',
            version: geigerManager.version,
            dimensions: {width: 404, height: 700},
            collections: [  // There are two collections: a parent and a child
                {
                    name: 'games',
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a tournament"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNumber", type: 'categorical'},
                        {name: "result", type: 'categorical'},
                        {name: "dose", type: 'numeric', precision: 0, description : "total exposure to radiation"},
                        {name: "sourceX", type: 'numeric', unit: 'meters', precision: 2, description : "x-coordinate of the source"},
                        {name: "sourceY", type: 'numeric', unit: 'meters', precision: 2, description : "y-coordinate of the source"}
                    ],
                    childAttrName: "measurement"
                },
                {
                    name: 'measurements',
                    labels: {
                        singleCase: "measurement",
                        pluralCase: "measurements",
                        setOfCasesWithArticle: "a game"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "x", type: 'numeric', unit: 'meters', precision: 2, description : "x-coordinate of the detector"},
                        {name: "y", type: 'numeric', unit: 'meters', precision: 2, description : "y-coordinate of the detector"},
                        {name: "distance", type: 'numeric', unit: 'units', precision: 2, description : "distance from the source"},
                        {name: "count", type: 'numeric', precision: 0, description : "radiation counts during the measurement"}
                    ]
                }
            ]
        },
        geigerManager.geigerDoCommand
    );
} else {
    /**
     * Required call to initialize the sim, connect it to CODAP.
     */
    codapHelper.initSim(
        {
            name: 'Geiger 1D',
            version: geigerManager.version,
            dimensions: {width: 404, height: 400},
            collections: [  // There are two collections: a parent and a child
                {
                    name: 'games',
                    labels: {
                        singleCase: "game",
                        pluralCase: "games",
                        setOfCasesWithArticle: "a tournament"
                    },
                    // The parent collection spec:
                    attrs: [
                        {name: "gameNumber", type: 'categorical'},
                        {name: "result", type: 'categorical'},
                        {name: "dose", type: 'numeric', precision: 0, description : "total exposure to radiation"},
                        {name: "sourceX", type: 'numeric', unit: 'meters', precision: 2, description : "x-coordinate of the source"}
                    ],
                    childAttrName: "measurement"
                },
                {
                    name: 'measurements',
                    labels: {
                        singleCase: "measurement",
                        pluralCase: "measurements",
                        setOfCasesWithArticle: "a game"
                    },
                    // The child collection specification:
                    attrs: [
                        {name: "x", type: 'numeric', unit: 'meters', precision: 2, description : "x-coordinate of the detector"},
                        {name: "distance", type: 'numeric', unit: 'units', precision: 2, description : "distance from the source"},
                        {name: "count", type: 'numeric', precision: 0, description : "radiation counts during the measurement"}
                    ]
                }
            ]
        },
        geigerManager.geigerDoCommand
    );


};


