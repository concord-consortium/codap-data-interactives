/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
xeno in xeno

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

var xeno = {
    initialize: function () {

        xeno.setLanguageFromURL(  );

        //  called after connect, so xeno.state is set

        var finishInit = function () {
            //  set UI values based on restored xeno.state


            document.getElementById("howManyCases").setAttribute("value", xeno.state.howManyCases.toString());
            document.getElementById("howManyAutoCases").setAttribute("value", xeno.state.howManyAutoCases.toString());

            console.log("Initialize into mode: " + xeno.state.mode);

            this.setControlsForScenarioStart();
            this.controlChange();       //  read control values, set UI
            $("#maladyMenu").empty().append(this.model.makeMaladyMenuGuts()).val(this.state.malady);

        }.bind(this);

        xenoConnect.initialize(finishInit); //  also sets xeno.state
        /*
                xeno.state.score = xeno.constants.initialScore;
                xeno.state.mode = "training";
        */


    },

    /**
     * Parse the URL to get the two-character language code from the plugin's URL.
     */
    setLanguageFromURL : function() {
        let theLang = xeno.constants.kInitialLanguage;

        const params = new URLSearchParams(document.location.search.substring(1));
        const lang = params.get("lang");

        if (lang) {
            theLang = lang;
        }
        xeno.setLanguage(theLang);
    },

    /**
     * Set the UI language
     * @param iCode     two-letter language code, e.g., en, de, es.
     */
    setLanguage : function( iCode ) {
        xeno.language = iCode;       //  put the thing in here to choose
        xeno.strings = XS[iCode];       //  XS = "xeno strings"
        XS.setBasicStrings();           //  replace strings in the UI

        xenoConnect.xenoDataContextSetupObject = xeno.strings.dataContextSetupObject;
    },


    setControlsForScenarioStart: function () {
        document.getElementById(xeno.state.mode + "RadioButton").checked = true;
        document.getElementById("xenoScore").innerHTML = xeno.state.score;

        var tAutoResultDisplay = document.getElementById("autoResultDisplay");
        tAutoResultDisplay.innerHTML = xeno.constants.autoResultInitialText;
    },

    /**
     * User changes which malady we're using
     * Deletes all the data in the table (so they won't be mixed up!)
     */
    maladyChange: function () {
        this.state.malady = $("#maladyMenu").val();

        xeno.state.score = xeno.constants.initialScore;
        xeno.state.mode = "training";

        //  delete all data

        var tResource = "dataContext[creatures].collection[creatures].allCases";
        var tArg = {action: "delete", resource: tResource};
        codapInterface.sendRequest(tArg);

        this.setControlsForScenarioStart();
        xeno.controlChange();
    },

    /**
     * User has changed some control or other, for example, the radio buttons for mode.
     * Change values, text, etc. to correspond.
     * Also changes the visibility of the corresponding divs.
     */
    controlChange: function () {
        var tAutoDiagnoseCaseNumberBox = document.getElementById("howManyAutoCases");
        var tTrainingCaseNumberBox = document.getElementById("howManyCases");
        xeno.state.mode = $('input[name=xenoMode]:checked').val();  //  "training" or "one by one" or "auto"
        xeno.state.howManyCases = tTrainingCaseNumberBox.value;
        xeno.state.howManyAutoCases = tAutoDiagnoseCaseNumberBox.value;
        xeno.updateScore(0);

        if (xeno.state.howManyAutoCases > 20) {
            xeno.state.howManyAutoCases = 20;
            tAutoDiagnoseCaseNumberBox.value = xeno.state.howManyAutoCases;
            alert("Sorry -- for now you're limited to 20 at a time. So you don't have to wait so long.");
        }

        if (xeno.state.howManyCases > 100) {
            xeno.state.howManyCases = 100;
            tTrainingCaseNumberBox.value = xeno.state.howManyCases;
            alert("Sorry -- for now you're limited to 100 'training cases' at a time.");
        }

        switch (xeno.state.mode) {
            case 'training':
                document.getElementById("trainingControlPanel").style.display = "block";
                document.getElementById("oneByOneControlPanel").style.display = "none";
                document.getElementById("autoControlPanel").style.display = "none";
                xeno.state.currentCase = null;
                break;

            case 'one-by-one':
                if (!xeno.state.currentCase) {
                    xeno.state.currentCase = xeno.model.generateCase(xeno.state.malady);
                    xeno.displayCurrentCase("<b>Your first case:</b> ")
                }
                document.getElementById("trainingControlPanel").style.display = "none";
                document.getElementById("oneByOneControlPanel").style.display = "block";
                document.getElementById("autoControlPanel").style.display = "none";
                break;

            case 'auto':
                document.getElementById("trainingControlPanel").style.display = "none";
                document.getElementById("oneByOneControlPanel").style.display = "none";
                document.getElementById("autoControlPanel").style.display = "block";
                break;

            default:
                break;
        }
        console.log(
            'mode: ' + xeno.state.mode + ", cases: ("
            + xeno.state.howManyCases + ", 1, " + xeno.state.howManyAutoCases + ")"
        );

    },

    updateScore: function (iDeltaScore) {
        xeno.state.score += iDeltaScore;
        document.getElementById("xenoScore").innerHTML = xeno.state.score;
    },

    /**
     * Make n new cases. Called by makeNewCases().
     *
     * @param n     how many cases
     * @param iSource what mode are we in?
     * @returns {Array} an array of objects suitable for export into CODAP
     */
    getAnArrayOfCaseValues: function (n, iSource) {
        var theCaseValues = [];

        for (var i = 0; i < n; i++) {
            var tCase = xeno.model.generateCase(xeno.state.malady);
            tCase.source = iSource;
            tCase.diagnosis = "";
            theCaseValues.push(tCase);
        }

        return theCaseValues;
    },

    /**
     * User has asked for new cases while in training.
     */
    makeNewCases: function () {
        var n = xeno.state.howManyCases;
        console.log('making ' + n + ' new cases');

        var theCaseValues = this.getAnArrayOfCaseValues(n, "training");
        xeno.updateScore(-n);
        xenoConnect.createXenoItems(theCaseValues);
    },

    /**
     *  Called when the user presses a [single] diagnosis button
     * @param iDiag  "sick" or "well" in the current language
     */
    manualDiagnose: function (iDiag) {
        xeno.state.currentCase.source = "clinic";
        xeno.state.currentCase.diagnosis = iDiag;

        const tTrueOrFalse = (iDiag === xeno.state.currentCase.health) ? xeno.strings.true : xeno.strings.false;
        var tPositiveOrNegative = (xeno.state.currentCase.health) === xeno.strings.sick ? xeno.strings.positive : xeno.strings.negative;

        this.state.previousSingleDiagnosisReport = xeno.strings.getSingleDiagnosisReport(iDiag, tTrueOrFalse, tPositiveOrNegative);

        xeno.state.currentCase.analysis = tTrueOrFalse + tPositiveOrNegative;

        xeno.scoreFromPerformance(xeno.state.currentCase.analysis);

        xenoConnect.createXenoItems(xeno.state.currentCase);   //  send CODAP the clinic data

        //  next case

        xeno.state.currentCase = xeno.model.generateCase(xeno.state.malady);
        xeno.displayCurrentCase(this.state.previousSingleDiagnosisReport);
    },

    /**
     * User pressed the auto-diagnose button
     */
    autoDiagnose: function () {
        var tAutoResultDisplay = document.getElementById("autoResultDisplay");
        var tAutoResultText = "Waiting for analysis from the tree.";

        tAutoResultDisplay.innerHTML = tAutoResultText;

        var theCaseValues = this.getAnArrayOfCaseValues(xeno.state.howManyAutoCases, "auto");

        console.log("AUTODIAGNOSE: We have " + theCaseValues.length + " objects that need diagnosis!");
        xenoConnect.createXenoItems(theCaseValues);
    },

    displayCurrentCase: function (iPrefix) {
        var tCaseDescription = xeno.model.creatureString(xeno.state.currentCase);
        document.getElementById("caseDisplay").innerHTML = iPrefix + tCaseDescription;

    },

    scoreFromPerformance: function (iPerf) {
        var tScore = 0;

        switch (iPerf) {
            case "TP":
                this.updateScore(xeno.constants.scores.TP);
                break;

            case "TN":
                this.updateScore(xeno.constants.scores.TN);
                break;

            case "FP":
                this.updateScore(xeno.constants.scores.FP);
                break;

            case "FN":
                this.updateScore(xeno.constants.scores.FN);
                break;

            case "?":
                this.updateScore(xeno.constants.scores["?"]);
                break;

            default:
                break;
        }
    },

    language : 'en',        //  by default

    freshState: {
        previousSingleDiagnosisReport: "",
        howManyCases: 10,
        howManyAutoCases: 10,
        mode: 'training',
        malady: 'ague',
        currentCase: null,
        score: 200
    },

    constants: {
        version: '001e',
        kInitialLanguage : 'en',
        wellColor: '#752',
        sickColor: '#484',
        xenoDataSetName: "creatures",
        xenoDataSetTitle: "creatures",
        xenoCollectionName: "creatures",
        autoResultInitialText: "Auto-diagnosis results display",
        initialScore: 200,

        scores: {
            TP: 5,
            FP: -10,
            TN: 5,
            FN: -20,
            "?": -10
        }
    }
};
