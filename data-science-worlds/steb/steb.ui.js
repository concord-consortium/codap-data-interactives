/**
 * Created by tim on 3/23/16.


 ==========================================================================
 steb.ui.js in data-science-games.

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

/* global steb, Snap, TEEUtils, console, $, css */

/**
 * Singleton controller class to manage UI machinery for Stebbers
 *
 * @type {{fixUI: steb.ui.fixUI, clickStebber: steb.ui.clickStebber, clickCrud: steb.ui.clickCrud, clickInWorld: steb.ui.clickInWorld, newGameButtonPressed: steb.ui.newGameButtonPressed, pauseButtonPressed: steb.ui.pauseButtonPressed, makeTimeOutPaper: steb.ui.makeTimeOutPaper, initialize: steb.ui.initialize}}
 */
steb.ui = {

    fixUI : function() {
        const tGameType = steb.options.automatedPredator ? "autoplay" : "game" ;
        let tStatus = steb.manager.playing ? tGameType + " in progress" : "no game";
        tStatus +=  (steb.manager.running) ? "" : ", paused";
        $("#shortStatus").html( tStatus );
        this.startStopButton.style.backgroundImage  = //  machinery for the play/pause button
            (steb.manager.running) ?
                "url('../art/pause.png')" :
                "url('../art/play.png')";

        //  correct title for new/abort game button
        this.newGameButton.html( steb.manager.playing ? "abort game" : "new game");

        //  set visibility for keep playing button
        const keepPlayingVisible = !steb.manager.playing; // && !steb.manager.running;
        if (keepPlayingVisible) {
            $("#keepPlayingButton").show();
        } else {
            $("#keepPlayingButton").hide();
        }

        //  display ongoing score and time
        if (steb.model) {
            this.timeDisplay.text(Math.round(steb.model.elapsed));
            this.mealDisplay.text(Math.round(steb.model.meals));

            var tDebugText = steb.model.stebbers.length + " stebbers, " + //  and debug info
                steb.worldView.stebberViews.length + " views, " +
                steb.worldView.crudViews.length + " crud.";

            tDebugText = steb.color.stebberColorReport();

            $("#debugText").html(tDebugText);
            $("#evolutionPoints").text(steb.score.evolutionPoints);
            $("#predatorPoints").text(steb.score.predatorPoints);
        }

        //  color numbers on the vision page, with the BW sliders

        $("#redCoeffDisplay").text("red = " + steb.color.predatorVisionBWCoefficientVector[0]);
        $("#greenCoeffDisplay").text("green = " + steb.color.predatorVisionBWCoefficientVector[1]);
        $("#blueCoeffDisplay").text("blue = " + steb.color.predatorVisionBWCoefficientVector[2]);

        //  option text
        $("#optionPresetText").text( steb.options.currentPreset > 0 ? "Preset " + steb.options.currentPreset : "No preset");

        //  visibility options

        $("#isPredatorAutomatedControl").css("visibility", steb.options.automatedPredatorChoiceVisible ? "visible" : "hidden");
        $("#isPredatorVisionNormalControl").css("visibility", steb.options.colorVisionChoiceVisible ? "visible" : "hidden");

    },

    /**
     * Cope with a click on a Stebber
     * This click handler is set up in the StebberView constructor
     * @param iStebberView  the view that got clicked
     * @param iEvent    the mouse event
     */
    clickStebber : function( iStebberView, iEvent )    {

        if(!steb.options.automatedPredator) {       //  for now, only works if the predator is not automated
            steb.manager.clickOnStebberView(iStebberView);
            steb.ui.fixUI();
        }
    },

    /**
     * Cope with a click on Crud. Much simpler!
     * We go "on timeout" for a period of time as a punishment
     * Only works (for now) if there is no automated predator
     */
    clickCrud : function() {
        if(!steb.options.automatedPredator && steb.manager.running) {

            steb.manager.onTimeout = true;  //  we go "on timeout"

            steb.score.crud();  //  update the score due to crud click

            steb.worldView.paper.append(this.timeOutPaper); //  make the time out message appear

            window.setTimeout(function () {
                this.timeOutPaper.remove();     //  remove from the DOM when we're done
                steb.manager.onTimeout = false; //  and reset the flag
            }.bind(this),
                steb.constants.timeOutTime);    //  two seconds by default

            steb.CODAPconnect.logMessage('Crud click', null);
        }
    },

    /**
     * User clicked in the world but not on a Stebber or on Crud
     */
    clickInWorld : function() {
        if(!steb.options.automatedPredator) {
            if (steb.manager.running) {
                steb.score.clickInWorld();
            }
        }
    },

    /**
     * User asks for a new game
     */
    newGameButtonPressed : function() {
        if (steb.manager.playing) {
            steb.manager.endGame("abort");
        } else {
            steb.manager.newGame();
        }
        this.fixUI();
    },

    /**
     * User presses "keep playing" when they COULD press new game.
     */
    keepPlayingButtonPressed : function() {
        steb.manager.keepPlaying();
        this.fixUI();
    },

    /**
     * User presses pause
     */
    pauseButtonPressed : function() {
        if (steb.manager.playing && steb.manager.running) { steb.manager.pause();
        } else {steb.manager.restart( );}
        this.fixUI();
    },

    /**
     * Draw the "time out" message.
     */
    makeTimeOutPaper : function() {
        var oPaper = Snap( steb.constants.worldViewBoxSize, steb.constants.worldViewBoxSize);
        oPaper.rect( 0, 0, steb.constants.worldViewBoxSize, steb.constants.worldViewBoxSize).attr({
            fill: "yellow"
        });
        oPaper.text(40,100,"Time out!").attr({
            fontSize : 100
        });
        oPaper.text(40,250,"Crud are toxic!").attr({
            fontSize : 80
        });
        oPaper.text(40,352,"Eat only Stebbers!").attr({
            fontSize : 80
        });
        oPaper.attr({
            visibility : "visible"
        });
        return oPaper;
    },

    /**
     * Initialize the UI.
     */
    initialize : function() {
        //  make members for many of the UI elements
        this.startStopButton = document.getElementById("startStop");
        this.newGameButton = $("#newGameButton");
        this.timeDisplay = $("#timeDisplay");
        this.mealDisplay = $("#mealDisplay");
        this.timeOutPaper = this.makeTimeOutPaper().remove();

        //  set up radio button panels

        $(function() {
            $( "#isPredatorAutomatedControl" ).buttonset();
        });
        $(function() {
            $( "#isPredatorVisionNormalControl" ).buttonset();
        });
        $(function() {
            $( "#simpleColorControl" ).buttonset();
        });

        //  set up the sliders. This seems to be the way you do it in jquery-ui

        $("#redCoefficient").slider({
            range : false,
            min : -10,
            max : 10,
            value : steb.color.predatorVisionBWCoefficientVector[0],
            slide : function(e, ui) {
                steb.color.predatorVisionBWCoefficientVector[0] = Number( ui.values[0] );
                steb.options.predatorVisionChange();
                steb.ui.fixUI();
            },
            step : 1
        });
        $("#greenCoefficient").slider({
            range : false,
            min : -10,
            max : 10,
            value : steb.color.predatorVisionBWCoefficientVector[1],
            slide : function(e, ui) {
                steb.color.predatorVisionBWCoefficientVector[1] = Number( ui.values[0] );
                steb.options.predatorVisionChange();
                steb.ui.fixUI();
            },
            step : 1
        });
        $("#blueCoefficient").slider({
            range : false,
            min : -10,
            max : 10,
            value : steb.color.predatorVisionBWCoefficientVector[2],
            slide : function(e, ui) {
                steb.color.predatorVisionBWCoefficientVector[2] = Number( ui.values[0] );
                steb.options.predatorVisionChange();
                steb.ui.fixUI();
            },
            step : 1
        });

        steb.options.setPredatorVisionParameters();     //  this reads the values on the vision panel

    }
};