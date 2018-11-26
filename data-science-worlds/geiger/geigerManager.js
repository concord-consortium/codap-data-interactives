/*
 ==========================================================================
 geigerManager.js

 Main controller for the Geiger DSG.

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
 * Created by tim on 2015-10-03.
 */
var svgNS = "http://www.w3.org/2000/svg";

var geigerManager;

/**
 * Overall controller for the game.
 *
 * @type {{initializeComponent: Function, newGame: Function, updateScreen: Function, moveDetectorTo: Function, moveDetectorByTyping: Function, doMeasurement: Function}}
 */
geigerManager = {

    /**
     * Manages calls to CODAP for init and for making new cases
     */
    CODAPConnector: null,

    /**
     * string about whether the game is "playing", "won" (the previous game) or "lost"
     */
    gameState: "idle",   //  affects only what widgets are visible

    /**
     * initial coordinates of the detector
     */
    initialX: 1,
    initialY: 1,

    gameEndBoxX : 40,
    gameEndBoxY : 0,

    gauge: null,

    /**
     * Initializes various items.
     */
    initializeComponent: function() {
        this.gauge = new Gauge();
        this.CODAPConnector = new GeigerCODAPConnector();
        this.gauge.setup('doseGauge','Dose',0,geigerGameModel.maxDose);
        geigerLabView.setup( ); //  todo: fix so model gets it from view
        this.updateScreen();
    },

    /**
     * Resets Geiger for a new game.
     */
    newGame: function() {

        var tStartText = document.getElementById("startText");
        tStartText.style.visibility = "hidden";

        if (this.CODAPConnector.gameCaseID > 0) {
            geigerManager.finishGameCase( "aborted" );
        }

        geigerGameModel.newGame();  //  set up the MODEL for a new game

        //  set the positions of the win and loss boxes based on source position

        if (this.twoDimensional) this.gameEndBoxY = (geigerGameModel.sourceY > geigerGameModel.unitsAcross/2.0) ? "230" : "30";
        this.gameEndBoxX = (geigerGameModel.sourceX > geigerGameModel.unitsAcross/2.0) ? "30" : "230";

        this.CODAPConnector.newGameCase( "games" );

        geigerLabView.setCrosshairs( geigerGameModel.sourceX, geigerGameModel.sourceY);
        geigerLabView.removeOldGhosts();

        this.moveDetectorTo(this.initialX, this.initialY);

        geigerControlPanel.displayInfo("New game. Find the source!");
        this.gameState = "playing";
        geigerOptions.reconcile();

        this.updateScreen();
    },

    /**
     * called when the user exceeds the maximum dose
     */
    doLoss: function() {
        this.gameState = "lost";
        console.log("game lost");
        this.finishGameCase( "lost" );
        this.updateScreen();
    },

    /**
     * Called when the game is over because we've collected the sample.
     */
    doWin: function() {
        this.gameState = "won";
        console.log("game won");
        this.finishGameCase( "won" );
        this.updateScreen();
    },

    /**
     * finishes the current game case
     */
    finishGameCase: function( result ) {
        var tValueList = [
            this.CODAPConnector.gameNumber,
            result,
            geigerGameModel.dose,
            geigerGameModel.sourceX,
        ];

        if (this.twoDimensional) tValueList.push(geigerGameModel.sourceY);

        this.CODAPConnector.finishGameCase(tValueList);
    },

    /**
     * Calls what's necessary to refresh the screen.
     * This includes the Lab, the gauge, and any other stuff such as text.
     * Also: widget visibility.
     */
    updateScreen: function() {
        geigerLabView.update();
        this.gauge.update( geigerGameModel.dose);

        // show and hide images

        var winImage = document.getElementById('winImage');
        var lossImage = document.getElementById('lossImage');
        var playingControls = document.getElementById('playingControls');
        var crosshairElement = document.getElementById('crosshairs');
        var startText = document.getElementById('startText');

        switch (this.gameState) {
            case "won":
                winImage.style.visibility = 'visible';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'hidden';
                crosshairElement.style.visibility = "visible";
                startText.style.visibility = "hidden";
                winImage.setAttribute("y", this.gameEndBoxY);
                winImage.setAttribute("x", this.gameEndBoxX);
                break;
            case "lost":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'visible';
                playingControls.style.visibility = 'hidden';
                crosshairElement.style.visibility = "visible";
                startText.style.visibility = "hidden";
                lossImage.setAttribute("y", this.gameEndBoxY);
                lossImage.setAttribute("x", this.gameEndBoxX);
                break;
            case "playing":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'visible';
                crosshairElement.style.visibility = "hidden";
                startText.style.visibility = "hidden";
                break;
            case "idle":
                winImage.style.visibility = 'hidden';
                lossImage.style.visibility = 'hidden';
                playingControls.style.visibility = 'hidden';
                crosshairElement.style.visibility = "hidden";
                startText.style.visibility = "visible";
                break;
        }
    },

    /**
     * In charge of moving the detector.
     * Responds to clicks OR to edits in the coordinates from text boxes.
     * Coordinates are in "game" space.
     * @param x
     * @param y
     */
    moveDetectorTo: function (x, y) {
        geigerGameModel.detectorX = x;

        // Make sure the coordinate boxes read the right values.
        // Redundant if user has changed position by typing.
        document.getElementById('detectorX').value = x.toString();

        if (this.twoDimensional) {
            geigerGameModel.detectorY = y;
            document.getElementById('detectorY').value = y.toString();
        } else {
            geigerGameModel.detectorY = geigerManager.initialY;
        }


        var tCoordinateString = "("+ x + (this.twoDimensional ? ", " + y : "") + ")";
        geigerControlPanel.displayInfo("Detector moved to " + tCoordinateString );
        this.updateScreen();
    },

    /**
     * Called when a coordinate text box loses focus (onblur).
     * Updates coordinates of the detector.
     */
    moveDetectorByTyping: function() {
        var y;
        var detYbox = document.getElementById("detectorY");
        var detXbox = document.getElementById("detectorX");
        if (this.twoDimensional) {
            y = detYbox.value.trim();
            y = Math.max(0, y);
            y = Math.min(y, geigerLabView.unitsAcross);
        }
        var x = detXbox.value.trim();
        x = Math.max(0, x);
        x = Math.min(x, geigerLabView.unitsAcross);

        this.moveDetectorTo(x, y);
    },

    /**
     * Called from HTML when user clicks in the "Lab"
     * @param e
     */
    clickInLab: function (e) {
        //    Note: this routine gives page coordinates. We want the coordinates in the canvas.
        // 2015-10-15 decided to use e.offsetX, Y (using svg) instead of e.layerX (using canvas)
        if (!e) e = window.event;
        var tX = e.offsetX / geigerLabView.pixelsPerUnit.x;     //  convert to units
        var tY = null;
        if (geigerManager.twoDimensional) {
            tY = (geigerLabView.labHeight - e.offsetY) / geigerLabView.pixelsPerUnit.y;
        }

        if (geigerManager.gameState == "playing") geigerManager.moveDetectorTo(tX, tY);
    },

    /**
     * User has clicked in an options control
     */
    clickOption: function() {
        geigerOptions.reconcile();
        this.updateScreen();
    },

    /**
     * User has called for a measurement.
     * Creates a "measurement" case in CODAP.
     */
    doMeasurement: function() {
        var tWin = geigerGameModel.doMeasurement();

        var tValueList = [ geigerGameModel.detectorX ];
        if (this.twoDimensional) tValueList.push(geigerGameModel.detectorY);
        tValueList.push(geigerGameModel.latestDistance);
        tValueList.push(tWin ? null : geigerGameModel.latestCount);

        this.CODAPConnector.doEventRecord(tValueList);

        if (tWin) {
            geigerManager.doWin();
        } else {
            geigerControlPanel.displayGeigerCount(geigerGameModel.latestCount, geigerGameModel.latestDistance); // note: only on doMeasurement!
            geigerLabView.addGhost(
                {
                    x : geigerGameModel.detectorX,
                    y : geigerGameModel.detectorY,
                    count: geigerGameModel.latestCount
                }
            );
            if (geigerOptions.deathPossible) {
                if (geigerGameModel.dose > geigerGameModel.maxDose) {
                    this.doLoss();
                }
            }
        }

        this.updateScreen();
    },


    /**
     * Manages save and restore
     */

    geigerDoCommand : function( arg, iCallback ) {
        var tCommand = arg.operation;
        switch (tCommand) {
            case "saveState":
                console.log("saving...");
                var tState = {
                    version : geigerManager.version,
                    gameState : geigerManager.gameState,
                    gameEndBoxX : geigerManager.gameEndBoxX,
                    gameEndBoxY : geigerManager.gameEndBoxY,

                    sourceX : geigerGameModel.sourceX,
                    sourceY : geigerGameModel.sourceY,
                    sourceStrength : geigerGameModel.sourceStrength,
                    detectorX : geigerGameModel.detectorX,
                    detectorY : geigerGameModel.detectorY,
                    dose : geigerGameModel.dose,
                    latestCount : geigerGameModel.latestCount,
                    latestDistance : geigerGameModel.latestDistance,
                    baseCollectorRadius : geigerGameModel.baseCollectorRadius,

                    labView : geigerLabView.getSaveObject(),

                    connector : geigerManager.CODAPConnector.getSaveObject(),

                    options : geigerOptions.getSaveObject()

                };
                iCallback( { success : true , state : tState });
                break;

            case "restoreState":
                console.log("eeps restoring...");
                var tOutcomeSuccessful = true;
                var tState = arg.args.state;

                geigerManager.version = tState.version;
                geigerManager.gameState = tState.gameState;
                geigerManager.gameEndBoxX = tState.gameEndBoxX;
                geigerManager.gameEndBoxY = tState.gameEndBoxY;

                geigerGameModel.sourceX = Number(tState.sourceX);
                geigerGameModel.sourceY = Number(tState.sourceY);
                geigerGameModel.sourceStrength = tState.sourceStrength;
                geigerGameModel.detectorX = tState.detectorX;
                geigerGameModel.detectorY = tState.detectorY;
                geigerGameModel.dose = tState.dose;
                geigerGameModel.latestCount = tState.latestCount;
                geigerGameModel.latestDistance = tState.latestDistance;
                geigerGameModel.baseCollectorRadius = tState.baseCollectorRadius;

                geigerLabView.restoreFrom( tState.labView );    //  source must be set before

                geigerManager.CODAPConnector.restoreFrom( tState.connector );

                geigerOptions.restoreFrom( tState.options );

                iCallback( { success : tOutcomeSuccessful });

                geigerManager.updateScreen();

                break;
            default:
                //console.log("A command we don't care about: " + tCommand);
                break;
        };
    }
};

