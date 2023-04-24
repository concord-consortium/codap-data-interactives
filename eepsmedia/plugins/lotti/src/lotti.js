

const lotti = {

    scenario : null,
    showingOptions : false,
    theGame : null,
    scenarioStrings : null,

    results : {},

    initialize : async function() {
        this.theGame = d3.select("#game");
        lotti.strings.initialize(); //  strings first!
        await lotti.connect.initialize();   //  connect to CODAP, define dataset
        this.setUpState();      //      remembers scenario name, and options, if available.
        ui.initialize();        //      defines scenario menu, so has to precede setScenario()
        this.setScenario();      //      choose the default scenario or the saved one
    },

    doChoice :  async function(iWhichSide) {
        const theScenarioStrings = DG.plugins.lotti.scenarioStrings[lotti.scenario.name];

        const tPlainResult = this.scenario.result(iWhichSide, this.scenario.left, this.scenario.right);
        const tUnitString = tPlainResult === 1 ? theScenarioStrings.resultUnitSingular : theScenarioStrings.resultUnitPlural;
        const tChoiceText = (iWhichSide === 'left') ? lotti.scenarioStrings.leftLabel : lotti.scenarioStrings.rightLabel;
        const theDoor =  (iWhichSide === 'left') ? ui.leftDoorCanvas : ui.rightDoorCanvas;
        const theResult =  (iWhichSide === 'left') ? ui.leftResult : ui.rightResult;

        lotti.results[tChoiceText].sum += tPlainResult;
        lotti.results[tChoiceText].turns += 1;

/*
        console.log(`${tChoiceText} now has ${lotti.results[tChoiceText].turns} turns,
                total ${lotti.results[tChoiceText].sum}`);
*/

        //      set the text "behind the door"
        ui.displayResultBehindTheDoor(theResult, tPlainResult, tUnitString);
        //  theResult.text(tResultWithUnits);     //  set the text within the "result" element
        //  console.log(`result is ${tResultWithUnits}`);

        const theEnglishValues = {
            scenario : lotti.scenarioStrings.label,
            choice : tChoiceText,
            result : tPlainResult,
            units : theScenarioStrings.resultUnitPlural,
        }
        const theValues = lotti.strings.translateTurnToLocalLanguage(theEnglishValues);

        lotti.connect.codap_emit(theValues);
        ui.showResults();
        ui.openAndCloseDoor(theDoor);
    },

    setScenario : async function(iScenarioName) {

        if (!iScenarioName) {
            iScenarioName = document.getElementById("scenarioMenu").value;
        }
        this.state.scenarioName = iScenarioName;

        lotti.scenario = lotti.allScenarios[this.state.scenarioName];
        this.scenarioStrings = DG.plugins.lotti.scenarioStrings[this.state.scenarioName];    //  the strings from  strings.en(or ).js
        await lotti.connect.setNewDataset();
        this.resetResults();        //      zero this.results for the new scenario
        ui.SetScenarioUIObjects();
    },

    /**
     * resets the property `lotti.results`
     */
    resetResults : function() {
        lotti.results[lotti.scenarioStrings.leftLabel] = {turns : 0, sum : 0};
        lotti.results[lotti.scenarioStrings.rightLabel] = {turns : 0, sum : 0};
        ui.showResults();
    },

    rememberShowAllScenariosOption : function() {
        lotti.state.optShowAllScenarios = document.getElementById("showAllScenariosCheckbox").checked;
        ui.initialize();        //  redraws the menu
    },

    rememberEmitCODAPOption : function() {
        lotti.state.optEmitToCODAP = document.getElementById("emittingCheckbox").checked;
        lotti.resetResults();
    },

    rememberShowResultsOption : function() {
        lotti.state.optShowResults = document.getElementById("showResultsCheckbox").checked
    },

    setUpState : function() {
        lotti.state = codapInterface.getInteractiveState();
        if (Object.keys(lotti.state).length === 0) {
            lotti.state = lotti.constants.freshState;
            codapInterface.updateInteractiveState(lotti.state);
        } 
    },

    constants : {
        version : "2023d",
        dsName : "lottiDataset",
        collName : "records",

        freshState : {
            optEmitToCODAP : false,
            optShowResults : false,
            optShowAllScenarios : false,
            scenarioName : null,
        },
    }

}
