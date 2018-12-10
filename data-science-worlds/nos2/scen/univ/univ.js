/*
==========================================================================

 * Created by tim on 9/22/18.
 
 
 ==========================================================================
4color in 4color

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

/*
# Notes on design

## Where is the data?
There are really two copies of the experimental results: one in CODAP and one in the DB. This is unfortunate but inevitable.
We decide this:

When we display data in the plugin, we rely on CODAP's copy.

To make this work, we do several things:
* Whenever we take new data, we save it to the DB and to CODAP.
* Whenever we join a game -- enter a fresh CODAP doc -- we retrieve all KNOWN data from the database
  and add it to CODAP.

So see that in `univ.ui.update`, when we update `dataView`, we go out to CODAP every time and get
the data.

 */

let univ = {

    whence : "local",
    playPhase : null,
    state : {},
    currentSnapshot : null,


    freshState : {
        size : 12,
        when : 1954,
        worldID : null,
        worldCode : null,
        teamID : null,
        teamName : null
    },

    constants : {
        version : "000a",

        kPhaseNoWorld : 20,
        kPhaseNoTeam : 30,
        kPhasePlaying : 40,

        kUnivDataSetName : "univ",
        kUnivDataSetTitle : "four-color universe",
        kUnivCollectionName : "univ",
        kLocalSourceString : "local",
    },

    initialize : function() {
        univ.CODAPconnect.initialize(null);

        univ.playPhase = univ.constants.kPhaseNoWorld;
        univ.state.size = 12;

        //  univ.model.initialize();
        univ.universeView.initialize( document.getElementById("universe") );
        univ.telescopeView.initialize( document.getElementById("telescope") );
        univ.dataView.initialize( document.getElementById("dataView") );

        //  register to receive notifications about selection

        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + univ.constants.kUnivDataSetName + ']',
            'selectCases',
            univ.selectionManager.codapSelectsCases
        );

        univ.ui.update();
    },

    logout : function() {
        this.state = univ.freshState;
        univ.playPhase = univ.constants.kPhaseNoWorld;
        univ.ui.update();
    },

    /**
     * Typically called from userAction, when we join a world.
     * Note: the worldID is the unique integer in the db;
     * worldCode is the memorable text ID for that world in the DB
     * @param iWorldCode
     */
    setWorld : async function( iWorldCode ) {
        const tWorldData = await univ.DBconnect.getWorldData(iWorldCode);

        if (tWorldData) {
            univ.state.worldID = tWorldData.id;
            univ.state.worldCode = tWorldData.code;
            univ.state.epoch = tWorldData.epoch;
            const tState = JSON.parse( tWorldData.state);

            this.state.truth = tState.truth;

        } else {
            console.log("About " + iWorldCode + " ...  it doesn't exist.");
        }
    },

    /**
     * Called from userActions
     *
     * @param iPoint
     * @returns {Promise<void>}
     */
    doObservation : async function(iPoint) {
        const [ULCc, ULCr] = iPoint;

        //  the specific data appropriate to this scenario.
        //  epoch, team, and source are added when we make a Result object.
        let data = {
            O : 0, R : 0, G : 0, B : 0,
            col : ULCc, row : ULCr,
            dim : univ.telescopeView.experimentSize
        };
        for ( let c = 0; c < univ.telescopeView.experimentSize; c++ ) {
            for (let r = 0; r < univ.telescopeView.experimentSize; r++) {
                let letter = univ.state.truth[ULCc + c][ULCr + r];
                data[letter]++;
            }
        }

        const tNewResult = new Result(data);      //  encapsulate all this information
        univ.telescopeView.latestResult = tNewResult;       //  make sure the telescope knows for its display
        const theNewID = await univ.DBconnect.saveNewResult(tNewResult);     //  save to DB, get the db ID
        tNewResult.dbid = theNewID;      //  make sure that's in the values

        console.log("New result " + tNewResult.toString() + " added and got dbid = " + theNewID);

        univ.DBconnect.assertKnowledge(theNewID);

        univ.CODAPconnect.saveResultsToCODAP(tNewResult);  //  store it in CODAP. This has the dbid field.
    },

    /**
     * Called from userActions
     */
    makeSnapshot : function() {
        this.currentSnapshot = new DataPack();
        this.currentSnapshot.theFigure = univ.dataView.thePaper.innerSVG();
        this.currentSnapshot.figureWidth = univ.dataView.thePaper.attr("width");
        this.currentSnapshot.figureHeight = univ.dataView.thePaper.attr("height");

        this.currentSnapshot.theResults = univ.dataView.results;
        document.getElementById("snapshotCaption").value = this.currentSnapshot.theCaption;
        document.getElementById("snapshotTitle").value = this.currentSnapshot.theTitle;
        document.getElementById("snapshotNotes").value = this.currentSnapshot.theNotes;

        //  change to the thumbnail tab

        this.goToTabNumber(2);

        //  The thumbnail is for DISPLAY.

        const theThumbnail = document.getElementById("thumbnail");
        theThumbnail.innerHTML = this.currentSnapshot.theFigure;
        const theViewBoxString = "0 0 " + this.currentSnapshot.figureWidth + " " + this.currentSnapshot.figureHeight;
        theThumbnail.setAttribute("viewBox", theViewBoxString);

    },

    convertCODAPValuesToResults : function( iValues, iSelected) {
        let out = [];

        iValues.forEach( v => out.push(Result.resultFromCODAPValues(v)) );

        return out;
    },

    /**
     *
     * @param iValues   an OBJECT one of whose fields is an array called values
     * @returns {Array}
     */
    convertAllCasesToResults : function( iValues ) {
        let out = [];
        iValues.values.forEach( v => {
            let r = Result.resultFromCODAPValues(v.values);
            out.push(r);
        });
        return out;
    },

    /**
     *
     * @param iValues   an ARRAY of objects with {success , values}
     * @returns {Array}
     */
    convertSelectedCasesToResults : function( iValues ) {
        if (iValues.length === 0) {
            return [];
        }

        let out = [];
        iValues.forEach( iV => {
            let r = Result.resultFromCODAPValues(iV.values.case.values);
            out.push(r);
        });
        return out;
    },

    goToTabNumber : function(iTab) {
        $( "#tabs" ).tabs(  "option", "active", iTab );
    },

    colors: {
        "R": "tomato",
        "B": "dodgerblue",
        "O": "orange",
        "G": "green",
        "K": "black",
        "Y": "yellow",
        "selected" : "#72bfca",     //  "#89F",
        "unselected" : "gold",

    },


};