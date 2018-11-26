/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.manager.js in data-science-games.

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

/* global steb, Snap, console, TEEUtils, codapHelper, Stebber, Crud */

/**
 * This is the main manager (singleton) controller for Stebbins
 *
 * @type {{
 * running: boolean, playing: boolean,
 * previous: null, onTimeout: boolean,
 * makeStebberView: steb.manager.makeStebberView, animate: steb.manager.animate,
 * update: steb.manager.update, pause: steb.manager.pause, restart: steb.manager.restart,
 * newGame: steb.manager.newGame, endGame: steb.manager.endGame,
 * emitPopulationData: steb.manager.emitPopulationData, stebDoCommand: steb.manager.stebDoCommand
 * }}
 */
steb.manager = {
    //  various flags
    running: false,    //  as opposed to paused
    playing: false,    //  as opposed to bewteen games
    changingColors: false, //  background or crud
    previous: null,    //  the "previous" time for computing dt for animation
    onTimeout: false,  //  are we "on timeout" for clicking Crud?
    gameNumber: 0,     //  the game number
    stebElapsed: 0.0,      //  elapsed time
    checkForWin: true,     //  do we check for winning?

    shownBoxURI: null,     //  uri for the win/lose/abort box
    shownBoxImage: null,   //  the Snap.svg "Image" being shown

    livingStebberTableShowing: false,
    eatenStebberTableShowing: false,


    /**
     * The animation loop. Calls .update()
     * @param timestamp
     */
    animate: function (timestamp) {
        if (!steb.manager.previous) {
            steb.manager.previous = timestamp;
        }
        var tDt = (timestamp - steb.manager.previous) / 1000.0;
        steb.manager.previous = timestamp;
        steb.manager.update(tDt);
        if (steb.manager.running) {
            window.setTimeout(function () {
                window.requestAnimationFrame(steb.manager.animate);
            }, 50);     // 50 ms. 20 frames per second should be enough
        }
    },

    /**
     * Update everything; called in the animation loop.
     * @param idt
     */
    update: function (idt) {
        this.stebElapsed += idt;
        steb.model.update(idt);
        steb.worldView.update();
        if (steb.options.automatedPredator) {
            steb.predator.update(idt);
        }
        steb.ui.fixUI();
    },

    /**
     * Use has pressed the pause button.
     */
    pause: function () {
        this.running = false;
    },

    /**
     * User has pressed the 'play' button
     */
    restart: function () {
        this.running = true;
        this.previous = null;       //  so we don't make a "dt" that goes all the way back
        window.requestAnimationFrame(this.animate); //  START UP TIME
    },

    processSelectionFromCODAP: function () {
        steb.CODAPconnect.getSelectedStebberIDs(gotSelectionResult);

        function gotSelectionResult(iResult) {

            if (iResult.success) {
                var tValues = iResult.values;
                var IDs = [];
                tValues.forEach(function (tV) {
                    IDs.push(tV.caseID);
                });

                steb.worldView.stebberViews.forEach(function (sv) {
                    var s = sv.stebber;
                    s.selected = TEEUtils.anyInAny(s.caseIDs, IDs); //  are ANY of the caseIDs in the list of IDs??
                    sv.update();
                });

            } else {
                console.log('StebConnect: could not get the selection list');
            }
        }

    },


    /**
     * User has requested a new game.
     */
    newGame: function () {
        steb.options.setStebOptionsToMatchUI();        //  make sure they align with the checkboxes
        this.stebElapsed = 0;
        this.gameNumber += 1;

        steb.model.newGame();
        steb.worldView.newGame();
        steb.predator.newGame();
        steb.colorBoxView.newGame();

        this.playing = true;
        this.checkForWin = true;

        //      Make the game case. We pass in an object with name-value pairs...

        this.emitPopulationData();

        //  and start time!

        this.restart();
        if (steb.options.beginGamePaused) {
            this.pause();
        }
    },

    /**
     * Called at end of restore process
     */
    reinstateGame: function () {
        steb.options.setUIToMatchStebOptions();

        if (this.playing) {
            steb.worldView.newGame();
            steb.colorBoxView.newGame();
            this.restart();
        }
    },

    keepPlaying: function () {
        this.playing = true;
        this.checkForWin = false;
        this.shownBoxImage.remove();
        this.shownBoxImage = null;
        this.restart();     //  start time!
    },


    /**
     * For some reason, the game has ended
     * @param iReason       the reason (e.g., "won," "aborted")
     */
    endGame: function (iReason) {

        switch (iReason) {
            case "abort" :
                this.shownBoxURI = "art/StebAbort.png";
                //  this.playing = false;
                break;

            case "win" :
                this.shownBoxURI = "art/StebWin.png";
                break;

            case "loss":
                this.shownBoxURI = "art/StebLoss.png";
                break;

            default:

        }
        if (this.shownBoxURI) {
            this.shownBoxImage = steb.worldView.paper.image(this.shownBoxURI, 200, 200, 600, 600);
        }

        this.playing = false;
        this.running = false;
        this.emitPopulationData();      //  send data on the remaining Stebbers to CODAP
    },

    selectStebberByID: function (id) {
        steb.model.stebbers.forEach(function (s) {
            s.selected = (s.id === id);
        });
    },

    /**
     * User has clicked on a Stebber View, and it's OK to eat it.
     * @param iStebberView
     */
    clickOnStebberView: function (iStebberView, iEvent) {
        steb.model.selectStebber(iStebberView.stebber, true);
        //  iStebberView.update();
        steb.worldView.update();        //  todo: a perfect place to use notifications. If model.selectStebber sets all the selecteds to false, they should each notify the view to refresh.


        var tEat = steb.manager.running && !steb.options.automatedPredator;
        if (tEat) {
            this.eatStebber(iStebberView);
            steb.CODAPconnect.logMessage('Stebber eaten (manual)', null);
        } else {
            steb.CODAPconnect.selectStebberInCODAP(iStebberView.stebber);
        }
    },

    autoPredatorCatchesStebberView: function (iStebberView) {
        this.eatStebber(iStebberView);
        steb.CODAPconnect.logMessage('Stebber eaten (auto)', null);
    },

    /**
     * This stebber view will be eaten.
     * Then reproduce, account for the score, emit data, and scare things away from the site
     * @param iStebberView
     */
    eatStebber: function (iStebberView) {
        steb.score.meal();      //  update score before emitting data
        steb.manager.emitMealData(iStebberView.stebber);

        steb.model.removeStebber(iStebberView.stebber);     //  remove the model Stebber
        steb.worldView.removeStebberView(iStebberView);     //  remove its view
        var tBabies = steb.model.reproduce();     //      reproduce (from the remaining stebbers)
        tBabies.forEach(function (b) {
            steb.manager.emitBirthData(b);
        });

        //   the living stebber data includes the new one.

        if (steb.model.meals % 10 === 0 || steb.manager.changingColors) {
            steb.manager.changingColors = false;
            steb.manager.emitPopulationData();
        }  //  every 10 meals.
        steb.model.frightenStebbersFrom(iStebberView.stebber.where);

    },

    /**
     * Construct total data on each of the Stebbers, then send off to CODAP
     * We do this by default every 10 "meals."
     */
    emitPopulationData: function () {

        var tHigh = this.highLevelDataValues();
        steb.model.stebbers.forEach(function (iSteb) {
            var tValues = $.extend({}, tHigh, iSteb.stebberDataValues());
            steb.CODAPconnect.emitStebberRecord(tValues, stebberRecordCreated, steb.constants.dataSetName_Living);

            function stebberRecordCreated(jResult) {
                if (jResult.success) {
                    //  iSteb.caseIDs.push(jResult.values[0]);
                    const tCaseIDs = (jResult.values && jResult.values.caseIDs) || jResult.caseIDs;
                    const tItemIDs = (jResult.values && jResult.values.itemIDs) || jResult.itemIDs;

                    iSteb.caseIDs = iSteb.caseIDs.concat(tCaseIDs);
                    iSteb.itemIDs = iSteb.itemIDs.concat(tItemIDs);
                    //  console.log('Stebber ' + iSteb.id + ' has case IDs ' + iSteb.caseIDs.toString());
                } else {
                    console.log("Failed to create stebber case.");
                }
            }
        }.bind(this));
    },

    highLevelDataValues: function () {
        var tbgHSVArray = steb.makeHSBArray(steb.getSnapColor(steb.model.trueBackgroundColor));
        var tCrudHSVArray = steb.makeHSBArray(steb.getSnapColor(steb.model.meanCrudColor));

        return {
            gameNo: this.gameNumber,
            bgRGB: (steb.model.trueBackgroundColor).join(),
            crudRGB: (steb.model.meanCrudColor).join(),
            bgHSB: tbgHSVArray.join(),
            crudHSB: tCrudHSVArray.join(),
            result: null,
            meals: steb.model.meals,
            score: steb.score.predatorPoints    //  do we need the other kind?
        };
    },


    emitMealData: function (iStebber) {
        var tValues = $.extend({}, this.highLevelDataValues(), iStebber.stebberDataValues());
        steb.CODAPconnect.emitStebberRecord(tValues, null, steb.constants.dataSetName_Eaten);

        // steb.CODAPconnect.doMealRecord( tValues );
    },

    emitBirthData: function (iStebber) {
        var tValues = $.extend({}, this.highLevelDataValues(), iStebber.stebberDataValues());
        steb.CODAPconnect.emitStebberRecord(tValues, null, steb.constants.dataSetName_Born);
    },

    /**
     * Called by model.reproduce(). Given the model, make the appropriate view.
     * @param iChildStebber     the model Stebber
     */
    addViewForChildStebber: function (iChildStebber) {
        steb.worldView.installStebberViewFor(iChildStebber);
    },

    /**
     * Find a Stebber View whose model will act as a parent
     * @returns {*}
     */
    findRandomStebberView: function () {
        return TEEUtils.pickRandomItemFrom(steb.worldView.stebberViews);
    },

    /**
     * Make or remove the "target reticule" visible on a stebber view,
     * indicating that it is targeted by the automated predator
     * @param iStebberView  the view to be targeted
     * @param iSet  true if we want it to be visible; false to hide it
     */
    activateTargetReticuleOn: function (iStebberView, iSet) {
        iStebberView.targetReticule.attr({
            stroke: iSet ? "red" : "transparent"
        });
    },

    /**
     * For saving. TBD.
     */
    stebDoCommand: function (iCommand, iCallback) {
        console.log("stebDoCommand: " + iCommand.action);

        switch (iCommand.action) {
            case "notify":
                var tValues = iCommand.values;
                if (!Array.isArray(tValues)) {
                    tValues = [tValues];
                }
                var tFirstValue = tValues[0];

                if (tFirstValue.operation) {
                    switch (tFirstValue.operation) {

                        case "selectCases":
                            console.log("Selection change in CODAP");
                            console.log(iCommand);
                            steb.manager.processSelectionFromCODAP();
                            break;

                        default:
                            break;
                    }
                }
                break;

            case "get":
                console.log("stebDoCommand: action : get.");
                switch (iCommand.resource) {
                    case "interactiveState":
                        console.log("stebDoCommand save document ");
                        var tSaveObject = {
                            success: true,
                            values: {
                                manager: {
                                    playing: steb.manager.playing,
                                    gameNumber: steb.manager.gameNumber
                                },
                                model: {
                                    stebbers: steb.model.stebbers.map(function (iStebber) {
                                        return {
                                            id: iStebber.id,
                                            where: iStebber.where,
                                            trueColor: iStebber.trueColor,
                                            parentID: iStebber.parentID,
                                            caseIDs: iStebber.caseIDs
                                        };
                                    }),
                                    crud: steb.model.crud.map(function (iCrud) {
                                        return {
                                            where: iCrud.where,
                                            speed: iCrud.speed,
                                            trueColor: iCrud.trueColor
                                        };
                                    }),
                                    elapsed: steb.model.elapsed,
                                    meals: steb.model.meals,
                                    meanCrudColor: steb.model.meanCrudColor,
                                    trueBackgroundColor: steb.model.trueBackgroundColor
                                },
                                options: {
                                    backgroundCrud: steb.options.backgroundCrud,
                                    delayReproduction: steb.options.delayReproduction,
                                    reducedMutation: steb.options.reducedMutation,
                                    flee: steb.options.flee,
                                    crudFlee: steb.options.crudFlee,
                                    crudScurry: steb.options.crudScurry,
                                    eldest: steb.options.eldest,
                                    automatedPredator: steb.options.automatedPredator,
                                    fixedInitialStebbers: steb.options.fixedInitialStebbers,
                                    fixedInitialBG: steb.options.fixedInitialBG,

                                    useVisionParameters: steb.options.useVisionParameters,
                                    predatorVisionMethod: steb.options.predatorVisionMethod,

                                    automatedPredatorChoiceVisible: steb.options.automatedPredatorChoiceVisible,
                                    colorVisionChoiceVisible: steb.options.colorVisionChoiceVisible,

                                    currentPreset: steb.options.currentPreset,

                                    noMutation: steb.options.noMutation,
                                    constantCrud: steb.options.constantCrud

                                },
                                predator: {
                                    where: steb.predator.where,
                                    state: steb.predator.state,
                                    memory: steb.predator.memory
                                },
                                score: {
                                    predatorPoints: steb.score.predatorPoints
                                },
                                connect: {
                                    gameCaseIDInLiving: steb.CODAPconnect.gameCaseIDInLiving,
                                    gameCaseIDInEaten: steb.CODAPconnect.gameCaseIDInEaten,
                                    bucketCaseID: steb.CODAPconnect.bucketCaseID,
                                    bucketNumber: steb.CODAPconnect.bucketNumber
                                }
                            }
                        };
                        codapHelper.sendSaveObject(
                            tSaveObject,
                            iCallback
                        );
                        break;
                    default:
                        console.log("stebDoCommand unknown get command resource: " + iCommand.resource);
                        break;
                }
                break;

            default:
                console.log("stebDoCommand: no action.");
        }
    },

    /**
     * This function is passed to
     * @param iValues
     */
    stebRestoreState: function (iValues) {
        if (iValues.savedState) {
            var tManager = iValues.savedState.manager,
                tModel = iValues.savedState.model,
                tOptions = iValues.savedState.options,
                tPredator = iValues.savedState.predator,
                tScore = iValues.savedState.score,
                tConnect = iValues.savedState.connect;
            steb.manager.playing = tManager.playing;
            steb.manager.gameNumber = tManager.gameNumber;

            steb.model.elapsed = tModel.elapsed;
            steb.model.meals = tModel.meals;
            steb.model.meanCrudColor = tModel.meanCrudColor;
            steb.model.trueBackgroundColor = tModel.trueBackgroundColor;

            steb.model.stebbers = tModel.stebbers.map(function (iStebState) {
                var tStebber = new Stebber(
                    iStebState.trueColor,
                    iStebState.where,
                    iStebState.id,
                    iStebState.parentID
                );
                tStebber.caseIDs = iStebState.caseIDs;
                return tStebber;
            });
            steb.model.crud = tModel.crud.map(function (iCrudState) {
                var tCrud = new Crud();
                tCrud.where = iCrudState.where;
                tCrud.speed = iCrudState.speed;
                tCrud.trueColor = iCrudState.trueColor;
                return tCrud;
            });

            steb.options.backgroundCrud = tOptions.backgroundCrud;
            steb.options.delayReproduction = tOptions.delayReproduction;
            steb.options.reducedMutation = tOptions.reducedMutation;
            steb.options.flee = tOptions.flee;
            steb.options.crudFlee = tOptions.crudFlee;
            steb.options.crudScurry = tOptions.crudScurry;
            steb.options.eldest = tOptions.eldest;
            steb.options.automatedPredator = tOptions.automatedPredator;
            steb.options.fixedInitialStebbers = tOptions.fixedInitialStebbers;
            steb.options.fixedInitialBG = tOptions.fixedInitialBG;
            steb.options.useVisionParameters = tOptions.useVisionParameters;
            steb.options.predatorVisionMethod = tOptions.predatorVisionMethod;
            steb.options.automatedPredatorChoiceVisible = tOptions.automatedPredatorChoiceVisible;
            steb.options.colorVisionChoiceVisible = tOptions.colorVisionChoiceVisible;
            steb.options.currentPreset = tOptions.currentPreset;
            steb.options.noMutation = tOptions.noMutation;
            steb.options.constantCrud = tOptions.constantCrud;

            steb.predator.where = tPredator.where;
            steb.predator.state = tPredator.state;
            steb.predator.memory = tPredator.memory;

            steb.score.predatorPoints = tScore.predatorPoints;

            steb.CODAPconnect.gameCaseIDInLiving = tConnect.gameCaseIDInLiving;
            steb.CODAPconnect.gameCaseIDInEaten = tConnect.gameCaseIDInEaten;
            steb.CODAPconnect.bucketCaseID = tConnect.bucketCaseID;
            steb.CODAPconnect.bucketNumber = tConnect.bucketNumber;

            // Get things started where they left off
            steb.manager.reinstateGame();
        }

        codapHelper.initDataSet(steb.CODAPconnect.getInitLivingStebberDataSetObject());
        codapHelper.initDataSet(steb.CODAPconnect.getInitStebberMealsDataSetObject());
        codapHelper.initDataSet(steb.CODAPconnect.getBornStebberDataSetObject());
    }

};
