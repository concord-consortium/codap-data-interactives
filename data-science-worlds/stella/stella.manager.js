/**
 * Created by tim on 5/7/16.


 ==========================================================================
 etaCas.manager.js in data-science-games.

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

/* global $, stella, Math, Planet, Star, SpectrumView, Snap, console, alert, elementalSpectra  */

/**
 * Main controller for Stella
 *
 * @type {{playing: boolean, focusSystem: null, starResultType: null, starResultValue: null, stellaScore: number, labSpectrumView: null, skySpectrumView: null, newGame: stella.manager.newGame, updateStella: stella.manager.updateStella, pointAtStar: stella.manager.pointAtStar, changeMagnificationTo: stella.manager.changeMagnificationTo, runTests: stella.manager.runTests, emitInitialStarsData: stella.manager.emitInitialStarsData, extractFromWithinBrackets: stella.manager.extractFromWithinBrackets, processSelectionFromCODAP: stella.manager.processSelectionFromCODAP, spectrumParametersChanged: stella.manager.spectrumParametersChanged, displayAllSpectra: stella.manager.displayAllSpectra, saveSpectrumToCODAP: stella.manager.saveSpectrumToCODAP, updateLabSpectrum: stella.manager.updateLabSpectrum, setSpectrogramWavelengthsToTypedValues: stella.manager.setSpectrogramWavelengthsToTypedValues, clickInSpectrum: stella.manager.clickInSpectrum, starResultTypeChanged: stella.manager.starResultTypeChanged, starResultValueChanged: stella.manager.starResultValueChanged, saveStarResult: stella.manager.saveMyOwnStarResult, stellaDoCommand: stella.manager.stellaDoCommand}}
 */
stella.manager = {

    playing: false,
    focusSystem: null,       //  what star are we pointing at?

    starResultIsAuto: false,   //  did we get this latest result via the Auto button?

    /**
     * Called on new game, in this case, on startup
     */
    newGame: function () {
        console.log("In stella.manager.newGame()");

        //  stella.model.newGame();     //  make all the stars etc.
        this.playing = true;

        stella.spectrumManager.spectrumParametersChanged();     //  reads the UI and sets various variables.
    },


    /**
     * Housekeeping. Synchronize things.
     * Often called when the user has changed something.
     */
    updateStella: function () {
        stella.spectrumManager.displayAllSpectra();
        stella.ui.fixStellaUITextAndControls();      //  fix the text
    },

    filterChanged : function() {
        var tFilterChoice = $("#filterMenu").val();
        stella.state.currentFilter = stella.constants.filters[ tFilterChoice ];
    },

    /**
     * Called to make the given star the one we're working on.
     * We get here by pointing, called from `pointAtStar( iStar )`.
     * We get here by selection,
     * We can also focus by panning. See up().
     * @param iStar
     */
    focusOnSystem: function (iSys) {
        this.focusSystem = iSys;
        stella.state.focusStarNumber = iSys.sysID;
        stella.connector.selectStarInCODAP(iSys);
        this.updateStella();
    },

    /**
     * Point at the given star.
     * @param iStar     The star. Pass `null` to be not pointing at anything.
     */
    pointAtSystem: function (iSys) {
        if (iSys) {
            stella.skyView.pointAtSystem(iSys);     //      added in...
            this.focusOnSystem(iSys);
            console.log("Point at " + this.focusSystem.sysID +
                " at " + this.focusSystem.where.x.toFixed(3) + ", " +
                this.focusSystem.where.y.toFixed(3));
        } else {
            this.focusSystem = null;
            this.updateStella();
        }
    },

    /**
     * Change the magnification on the telescope
     * @param iNewMag
     */
    changeMagnificationTo: function (iNewMag) {

        stella.skyView.magnify(iNewMag);    //  currently makes a whole new sky

        //   if (this.focusSystem) {
        //       this.pointAtStar( this.focusSystem );
        //   } else {
        stella.skyView.pointAtLocation(stella.skyView.telescopeWhere, true);
        //    }
        this.updateStella();

    },


    /**
     * Send out the catalog at the beginning of the game.
     */
    emitInitialStarsData: function () {

        console.log("starting  ... manager.emitInitialStarsData()");

        var tValueArray = [];

        stella.model.systems.forEach(function (iSys) {
            var tValues = iSys.dataValues();
            tValues.date = stella.state.epoch;  //  add the epoch to the record
            tValues.x = Number(tValues.x).toFixed(4);      //  lower-precision in catalog
            tValues.y = Number(tValues.y).toFixed(4);      //  lower-precision in catalog
            tValueArray.push(tValues);
        });

        stella.connector.emitStarCatalogRecord(tValueArray);    //, starRecordCreated);   //  emit the catalog case

        console.log("done with ... manager.emitInitialStarsData()");
    },

    /**
     * Get the contents of the brackets in a string.
     * New API may make this unnecessary.
     * @param iString
     * @returns {*}
     */
    extractFromWithinBrackets: function (iString) {
        if (iString) {
            return iString.substring(iString.lastIndexOf("[") + 1, iString.lastIndexOf("]"));
        } else {
            return null;
        }
    },

    /**
     * When CODAP tells us there's one selection in the Catalog, point the telescope there.
     * @param iCasesFromCODAP   An array. Each one's .id is the case ID.
     */
    //  todo: make this a lookup rather than caseID
    processSelectionFromCODAP: function (iCasesFromCODAP) {
        if (iCasesFromCODAP.length > 0) {
            if (iCasesFromCODAP.length === 1) {
                var tSysID = iCasesFromCODAP[0].values.id;
                var tStar = stella.model.systemFromTextID(tSysID);
                stella.manager.pointAtSystem(tStar);
                stella.manager.updateStella();
            }
        } else {
            console.log('Failed to retrieve selected system IDs.');
        }
    },


    /*      "STAR RESULT" SECTION     */

    /**
     * User has chosen a different kind of measurement in the menu there
     */
    starResultTypeChanged: function () {
        stella.manager.updateStella();
        stella.model.stellaElapse(stella.constants.timeRequired.changeResultType);
        $("#starResultValue").val("");      //  blank the value in the box on type change
        this.starResultValueChanged(true);  //  blank the internal value
    },

    /**
     * User has entered a value
     * @param   iAuto   was this value entered using the "Automatic" button?
     */
    starResultValueChanged: function (iAuto) {
        stella.manager.starResultIsAuto = iAuto;
        stella.ui.starResultValue = Number($("#starResultValue").val());
        stella.manager.updateStella();
    },

    /**
     * User has clicked Save for a result.
     * This is the button handler.
     * The html calls this without a parameter, which invokes the call to new StarResult()
     * @param iStarResult   the values for the result, being passed in
     */
    saveMyOwnStarResult: function (iStarResult) {
        if (stella.manager.focusSystem) {
            var tStarResult = iStarResult;

            if (!iStarResult) {
                tStarResult = new StarResult(true, stella.manager.starResultIsAuto);     //      here we create the StarResult and try to save it
            }
        } else {
            alert(stella.strings.notPointingAtStarForResults);
        }

        stella.model.stellaElapse(stella.constants.timeRequired.saveResult);
        stella.manager.updateStella();
    },

    /*
     More control actions
     */

    /*
     doubleClickOnAStar: function () {
     if (stella.skyView.magnification < 100) {
     return;
     }
     console.log("double click on a star!");
     var tStar = stella.manager.focusSystem;
     var tNow = stella.state.now;
     var tPos = tStar.positionAtTime(tNow);

     var txValues = {
     id: tStar.id,
     type: "pos_x",
     value: tPos.x,
     date: tNow,
     units: stella.starResults.pos_x.units
     };
     var tyValues = {
     id: tStar.id,
     type: "pos_y",
     value: tPos.y,
     date: tNow,
     units: stella.starResults.pos_y.units
     };
     stella.connector.emitStarResult(txValues, null);
     stella.connector.emitStarResult(tyValues, null);

     var tScore = stella.model.evaluateResult(tyValues);  //  we don't necessarily save all results!

     stella.model.stellaElapse(stella.constants.timeRequired.savePositionFromDoubleclick);
     stella.manager.updateStella();
     },
     */

    /**
     * user is entitled to an automatic result because of badges, and has requested one.
     * This puts a propsed value in the text box.
     * User still has to press save.
     * (Which is normal, BUT the "auto" flag has been set)
     */
    getStarDataUsingBadge: function () {
        var tValue = null, tForRecord = null;

        if (stella.manager.focusSystem) {
            var tResultType = stella.ui.starResultType;

            switch (tResultType) {
                case 'pos_x':
                    tForRecord = stella.skyView.telescopeWhere.x.toFixed(6);
                    break;
                case 'pos_y':
                    tForRecord = stella.skyView.telescopeWhere.y.toFixed(6);
                    break;
                default:
                    var truth = stella.manager.focusSystem.reportTrueValue(tResultType);
                    tValue = Number(truth.trueDisplay);
                    var tBadgeLevel = stella.badges.badgeLevelForResult(tResultType);
                    var tProportionalErrors = [0.18, 0.06, 0.02];               //  todo: change this to absolute and use the L1 value
                    var tError = tProportionalErrors[tBadgeLevel] * tValue;

                    tValue += ((Math.random() - Math.random()) * tError);
                    tForRecord = tValue.toFixed(1);
                    break;
            }
            //  todo: fix this so that we don't get points, and so that the number isn't in the box afterwards.
            $("#starResultValue").val(tForRecord);          //  put the value in the box
            stella.manager.starResultValueChanged(true);    //  do what we do when someone puts a number in the box
        }
    },

    /**
     * responds to CODAP notifications.
     */
    stellaDoCommand: function (iCommand, iCallback) {

        //console.log("stellaDoCommand: ");
        //console.log(iCommand);

        switch (iCommand.action) {
            case "notify":
                var tValues = iCommand.values;
                if (!Array.isArray(tValues)) {
                    tValues = [tValues];
                }
                var tOperation = tValues[0].operation;
                switch (tOperation) {

                    /**
                     * CODAP is telling us that user has selected cases. We have CODAP
                     * send the selection list to our function, stella.manager.processSelectionFromCODAP
                     */
                    case "selectCases":
                        // todo: Note that this is set up to work only with the star catalog data set. Expand!
                        stella.manager.processSelectionFromCODAP(tValues[0].result.cases);   //  array of cases, case.id is the caseID.
                        break;

                    default:
                        break;
                }
                break;

            default:
                console.log("stellaDoCommand: no action.");
        }

    }
};