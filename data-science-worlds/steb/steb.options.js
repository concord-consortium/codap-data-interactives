/**
 * Created by tim on 3/27/16.


 ==========================================================================
 steb.options.js in data-science-games.

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

/* global steb, $, console */

steb.options = {
    useStripes : false,
    backgroundCrud : true,
    delayReproduction : false,
    reducedMutation : false,
    flee : true,
    crudFlee : false,
    crudScurry : true,
    crudSameShapeAsStebbers : false,
    eldest : false,
    automatedPredator : false,
    fixedInitialStebbers : true,
    fixedInitialBG : false,
    extremeBGColor : false,
    beginGamePaused : true,

    useVisionParameters : false,    //  are we using any strange predator vision?
    predatorVisionMethod : null,      //  "dotProduct" or "formula"

    automatedPredatorChoiceVisible : false,
    colorVisionChoiceVisible : false,

    noMutation : false,
    constantCrud : false,

    currentPreset : 0,

    /**
     * User changed the vision params on the panel.
     * Therefore find out what those changes were,
     * and make the world reflect them!
     */
    predatorVisionChange : function() {
        const tPredVisionVal = $('input[name=isPredatorVisionNormalControl]:checked').val();
        this.useVisionParameters = (tPredVisionVal === "mono");

        this.setPredatorVisionParameters();
        steb.worldView.updateDisplayWithCurrentVisionParameters( );
        steb.CODAPconnect.logMessage("Predator vision changed", null);
    },

    predatorAutomationChange : function() {
        const tAutoPredVal = $('input[name=isPredatorAutomatedControl]:checked').val();
        this.automatedPredator = (tAutoPredVal === "auto");
    },

    /**
     * Set the underlying predator vision params based on the settings in the vision panel.
     */
    setPredatorVisionParameters : function() {
        if (!this.useVisionParameters ) { steb.color.predatorVisionDenominator = 1; }    //  avoids nasty zero divide :)

        this.predatorVisionMethod = $('input[name=predatorVisionMethodControl]:checked').val();

        const tRed = Number($("#visionRed").val());
        const tGreen = Number($("#visionGreen").val());
        const tBlue = Number($("#visionBlue").val());

        steb.color.predatorVisionDotProductColorVector = [ tRed, tGreen, tBlue ];
        //  steb.model.predatorVisionBWCoefficientVector is set directly by sliders. See steb.ui.js.initialize().

        console.log(
            "Options. Vision vector = " + JSON.stringify( steb.color.predatorVisionDotProductColorVector ) +
            " BW vector = " + JSON.stringify(steb.color.predatorVisionBWCoefficientVector)
        );

        steb.model.stebbers.forEach(function(s) { s.updateColorDistances(); });     //  update all stebbers to reflect new vision

    },

    setVisionVectorUIToMatchModelValues : function() {
        $("#visionRed").val(steb.color.predatorVisionDotProductColorVector[0]);
        $("#visionGreen").val(steb.color.predatorVisionDotProductColorVector[1]);
        $("#visionBlue").val(steb.color.predatorVisionDotProductColorVector[2]);

        //  now for the sliders, definded in steb.ui...


        $("#redCoefficient").slider({'values' : [ steb.color.predatorVisionBWCoefficientVector[0] ]});
        $("#greenCoefficient").slider({'values' : [ steb.color.predatorVisionBWCoefficientVector[1] ]});
        $("#blueCoefficient").slider({'values' : [ steb.color.predatorVisionBWCoefficientVector[2] ]});



    },

    setSimpleColor : function( iColor ) {

        [0, 1, 2].forEach(
            function( item ) {
                steb.color.predatorVisionBWCoefficientVector[ item ] = (item === iColor ? 1 : 0);
                steb.color.predatorVisionDotProductColorVector[ item ] = (item === iColor ? 1 : 0);
            }
        );
        this.setUIToMatchStebOptions();
        this.predatorVisionChange();
    },

    doPreset : function( iPreset ) {

        this.currentPreset = iPreset;

        switch( iPreset ) {
            case 1:
                /*
                 Level 1.
                 - no auto-predator
                 - crud is present!
                 - generate only the Stebbers table
                 - we say when to stop, or institute a time limit on the game
                 - fixed colors for stebbers, crud, bkg
                 */
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.extremeBGColor = false;
                this.beginGamePaused = false;
                this.crudSameShapeAsStebbers = true;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;
                this.automatedPredator = false;

                this.useVisionParameters = false;
                this.predatorVisionMethod = 'formula';  //  unnecessary since use params = false

                this.colorVisionChoiceVisible = false;
                this.automatedPredatorChoiceVisible = false;

                this.noMutation = false;
                this.constantCrud = false;

                break;

            case 2:
                /*
                 - set color to 0,1,0
                 - vision control switch is present
                 - "mono" selected by default
                 *** - can only play when "mono" is selected    todo: implement
                 *** - "normal" is unavailable while playing; becomes available when game is paused todo: implement
                 *** - play button is unavailable while 'normal' is selected.   todo: implement
                 - manual predator only
                 */
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.extremeBGColor = false;
                this.beginGamePaused = false;
                this.crudSameShapeAsStebbers = true;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;
                this.automatedPredator = false;

                this.useVisionParameters = true;
                this.predatorVisionMethod = 'dotProduct';

                this.colorVisionChoiceVisible = true;
                this.automatedPredatorChoiceVisible = false;

                steb.color.predatorVisionDotProductColorVector = [0, 1, 0];

                this.noMutation = false;
                this.constantCrud = false;

                break;

            case 3:
            case 4:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.extremeBGColor = false;
                this.beginGamePaused = false;
                this.crudSameShapeAsStebbers = true;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;
                this.automatedPredator = false;

                this.useVisionParameters = true;
                this.predatorVisionMethod = 'formula';      //  grayscale

                this.colorVisionChoiceVisible = true;
                this.automatedPredatorChoiceVisible = false;

                steb.color.predatorVisionBWCoefficientVector = [0, 1, 0];

                this.noMutation = false;
                this.constantCrud = false;

                break;

            case 5:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = false;
                this.extremeBGColor = true;
                this.beginGamePaused = true;
                this.crudSameShapeAsStebbers = true;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;
                this.automatedPredator = true;

                this.useVisionParameters = true;
                this.predatorVisionMethod = 'formula';      //  grayscale

                this.colorVisionChoiceVisible = true;
                this.automatedPredatorChoiceVisible = false; //  the change

                steb.color.predatorVisionBWCoefficientVector = [0, 0, 1];    //  NB: blue

                this.noMutation = false;
                this.constantCrud = false;

                break;

            case 42:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = false;
                this.fixedInitialBG = false;
                this.extremeBGColor = true;
                this.beginGamePaused = true;
                this.crudSameShapeAsStebbers = true;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;
                this.automatedPredator = true;

                steb.manager.running = false;

                this.useVisionParameters = true;
                this.predatorVisionMethod = 'formula';      //  grayscale

                this.colorVisionChoiceVisible = true;
                this.automatedPredatorChoiceVisible = true; //  the change

                steb.color.predatorVisionBWCoefficientVector = [1, 0, 0];    //  NB: red

                this.noMutation = false;
                this.constantCrud = false;

                break;

            case 37:
                this.backgroundCrud = true;
                this.fixedInitialStebbers = true;
                this.fixedInitialBG = true;
                this.extremeBGColor = false;
                this.beginGamePaused = false;
                this.crudSameShapeAsStebbers = true;

                this.delayReproduction = false;
                this.reducedMutation = false;
                this.flee = true;
                this.crudFlee = false;
                this.crudScurry = true;
                this.eldest = false;
                this.automatedPredator = false;

                this.useVisionParameters = false;
                this.predatorVisionMethod = 'formula';  //  unnecessary since use params = false

                this.colorVisionChoiceVisible = false;
                this.automatedPredatorChoiceVisible = false;

                this.noMutation = true;
                this.constantCrud = true;

                break;

            default:
                break;
        }

        this.setUIToMatchStebOptions();
        this.predatorVisionChange();    //  must come after UI is set
        steb.ui.fixUI();
    },

    /**
     *  Called whenever user clicks on an option. Sets the internal flags to match the UI.
     */
    optionChange : function() {
        this.currentPreset = 0;
        this.setStebOptionsToMatchUI();
    },

    setStebOptionsToMatchUI : function() {

        // this.useStripes = document.getElementById("useStripes").checked;
        this.backgroundCrud = document.getElementById("backgroundCrud").checked;
        this.fixedInitialStebbers = document.getElementById("fixedInitialStebbers").checked;
        this.fixedInitialBG = document.getElementById("fixedInitialBG").checked;
        this.beginGamePaused = document.getElementById("beginGamePaused").checked;
        this.extremeBGColor = document.getElementById("extremeBGColor").checked;
        this.crudSameShapeAsStebbers = document.getElementById("crudSameShapeAsStebbers").checked;

        this.delayReproduction = document.getElementById("delayReproduction").checked;
        this.reducedMutation = document.getElementById("reducedMutation").checked;
        this.flee = document.getElementById("flee").checked;
        this.crudFlee = document.getElementById("crudFlee").checked;
        this.crudScurry = document.getElementById("crudScurry").checked;
        this.eldest = document.getElementById("eldest").checked;

        this.useVisionParameters = $('input[name=isPredatorVisionNormalControl]:checked').val() === 'mono';
        this.predatorVisionMethod = $('input[name=predatorVisionMethodControl]:checked').val();

        this.colorVisionChoiceVisible = document.getElementById("colorVisionChoiceVisible").checked;
        this.automatedPredatorChoiceVisible = document.getElementById("automatedPredatorChoiceVisible").checked;

        this.constantCrud = document.getElementById("constantCrud").checked;
        this.noMutation = document.getElementById("noMutation").checked;
        steb.ui.fixUI();
    },

    setUIToMatchStebOptions : function() {
        // document.getElementById("useStripes").checked = this.useStripes;
        document.getElementById("backgroundCrud").checked = this.backgroundCrud;
        document.getElementById("fixedInitialStebbers").checked = this.fixedInitialStebbers;
        document.getElementById("fixedInitialBG").checked = this.fixedInitialBG;
        document.getElementById("beginGamePaused").checked = this.beginGamePaused;
        document.getElementById("extremeBGColor").checked = this.extremeBGColor;
        document.getElementById("crudSameShapeAsStebbers").checked = this.crudSameShapeAsStebbers;

        document.getElementById("delayReproduction").checked = this.delayReproduction;
        document.getElementById("reducedMutation").checked = this.reducedMutation;
        document.getElementById("flee").checked =     this.flee;
        document.getElementById("crudFlee").checked = this.crudFlee;
        document.getElementById("crudScurry").checked = this.crudScurry;
        document.getElementById("eldest").checked = this.eldest;

        let tVisionType = this.useVisionParameters ? "mono" : "normal";
        $('input[name="isPredatorVisionNormalControl"][value="' + tVisionType + '"]').prop('checked', true);
        $('input[name="predatorVisionMethodControl"][value="' + this.predatorVisionMethod + '"]').prop('checked', true);

        this.setVisionVectorUIToMatchModelValues();

        document.getElementById("colorVisionChoiceVisible").checked = this.colorVisionChoiceVisible;
        document.getElementById("automatedPredatorChoiceVisible").checked = this.automatedPredatorChoiceVisible;

        document.getElementById("noMutation").checked = this.noMutation;
        document.getElementById("constantCrud").checked = this.constantCrud;

        steb.ui.fixUI();
    },

    /**
     * Set the color text on the options tab to match the internal variable values
     */
    setColorChoiceText : function() {
        console.log("scct");

        //  set color text to match the internal variables

        const tBGColorText = steb.model.trueBackgroundColor.join(", ");
        $("#bgColorText").val(tBGColorText);
        const tCrudColorText = steb.model.meanCrudColor.join(", ");
        $("#meanCrudColorText").val(tCrudColorText);
    },

};