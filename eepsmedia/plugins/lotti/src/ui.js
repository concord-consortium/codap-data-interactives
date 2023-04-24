const ui = {

    theChoices: null,
    leftChoice: null,       //      the canvas for the choice
    rightChoice: null,

    leftResult: null,       //      text svg object for "behind the door" text. Child of leftChoice.
    rightResult: null,

    leftDoorCanvas: null,       //  canvas for the door (that obscures the result)
    rightDoorCanvas: null,
    leftDoor: null,             //  the door itself (colored rect)
    rightDoor: null,
    leftDoorLabel: null,        //  text object attached to the door
    rightDoorLabel: null,

    choiceSize: 128,
    choiceGap: 12,

    initialize: function () {
        let theScenarioMenu = document.getElementById("scenarioMenu");
        theScenarioMenu.innerHTML = this.scenarioMenuGuts(lotti.state.scenarioName);
        this.setOptionCheckboxes();

    },

    setOptionCheckboxes : function() {
        document.getElementById("emittingCheckbox").checked = lotti.state.optEmitToCODAP;
        document.getElementById("showAllScenariosCheckbox").checked = lotti.state.optShowAllScenarios;
        document.getElementById("showResultsCheckbox").checked = lotti.state.optShowResults;
    },

    SetScenarioUIObjects: function () {
        this.theChoices = d3.select('#choices');

        //  the SVGs that hold the doors, results, etc

        this.leftChoice = this.theChoices.append('svg').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .style("cursor", "pointer");
        this.rightChoice = this.theChoices.append('svg').attr('x', this.choiceSize + this.choiceGap).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .style("cursor", "pointer");

        //  immovable backgrounds
        this.leftChoice.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .attr('fill', "white");
        this.rightChoice.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize)
            .attr('fill', "white");

        //  result text objects  (e.g., 7 euros, 20 days of food) "behind the door"
        this.leftResult = this.leftChoice.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true);
        this.rightResult = this.rightChoice.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true);

        //  door frames (canvases)
        this.leftDoorCanvas = this.leftChoice.append('svg').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);
        this.rightDoorCanvas = this.rightChoice.append('svg').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);

        this.leftDoor = this.leftDoorCanvas.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);
        this.rightDoor = this.rightDoorCanvas.append('rect').attr('x', 0).attr('y', 0)
            .attr('height', this.choiceSize).attr('width', this.choiceSize);

        //  labels on the doors. Note: these are localized.
        this.leftDoorLabel = this.leftDoorCanvas.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true)
            .text(lotti.scenarioStrings.leftLabel);
        this.rightDoorLabel = this.rightDoorCanvas.append('text')
            .attr('x', this.choiceSize / 2).attr('y', 80).attr('width', this.choiceSize)
            .attr('text-anchor', "middle")
            .classed('choiceText', true)
            .text(lotti.scenarioStrings.rightLabel);


        this.leftChoice.on("click", () => lotti.doChoice('left'));
        this.rightChoice.on("click", () => lotti.doChoice('right'));

        //  look of the doors
        if (lotti.scenario.leftDoorLook.color) {
            this.leftDoor.attr('fill', lotti.scenario.leftDoorLook.color);
            this.rightDoor.attr('fill', lotti.scenario.rightDoorLook.color);
        }
        if (lotti.scenario.leftDoorLook.image) {     //  attach image to the door canvas, on top of the door.
            this.leftDoorCanvas.append("image").attr("href", lotti.scenario.leftDoorLook.image)
                .attr("width", 48).attr("y", 6).attr("x", 6);
            this.rightDoorCanvas.append("image").attr("href", lotti.scenario.rightDoorLook.image)
                .attr("width", 48).attr("y", 6).attr("x", 6);
        }

        //  the "story"

        const tStory = document.getElementById("story");
        tStory.innerHTML = lotti.scenarioStrings.story;

        this.showResults();

    },

    displayResultBehindTheDoor: function( iTextObject, iNumber, iUnits) {
        iTextObject.text(`${iNumber}${iUnits}`);
        const bbox = iTextObject.node().getBBox();
        if (bbox.width > ui.choiceSize) {
            iTextObject.attr("textLength", ui.choiceSize - 12);
            iTextObject.attr("lengthAdjust", "spacingAndGlyphs");
        }
    },

    /**
     * display the summary of results so far as a text object.
     */
    showResults: function () {
        const theResultsArea = document.getElementById("results");

        if (lotti.state.optShowResults) {

            const Lresults = lotti.results[lotti.scenarioStrings.leftLabel];
            const Rresults = lotti.results[lotti.scenarioStrings.rightLabel];
            const nTurnsLeft = Lresults.turns;
            const nTurnsRight = Rresults.turns;

            const turnTextLeft = Lresults.turns === 1 ?
                `${Lresults.turns}${lotti.scenarioStrings.turnUnitSingular}` :
                `${Lresults.turns}${lotti.scenarioStrings.turnUnitPlural}`;
            const turnTextRight = Rresults.turns === 1 ?
                `${Rresults.turns}${lotti.scenarioStrings.turnUnitSingular}` :
                `${Rresults.turns}${lotti.scenarioStrings.turnUnitPlural}`;

            const resultTextLeft = Lresults.sum === 1 ?
                `${Lresults.sum}${lotti.scenarioStrings.resultUnitSingular}` :
                `${Lresults.sum}${lotti.scenarioStrings.resultUnitPlural}`;
            const resultTextRight = Rresults.sum === 1 ?
                `${Rresults.sum}${lotti.scenarioStrings.resultUnitSingular}` :
                `${Rresults.sum}${lotti.scenarioStrings.resultUnitPlural}`;

            const theText = `${lotti.scenarioStrings.leftLabel}: ${turnTextLeft} : ${resultTextLeft}<br>
            ${lotti.scenarioStrings.rightLabel}: ${turnTextRight} : ${resultTextRight}`;


            document.getElementById('resultsText').innerHTML = theText;
            theResultsArea.style.visibility = "visible";        //  consider
        } else {
            theResultsArea.style.visibility = "hidden";

        }
    },

    /**
     * Here, `this` is the scenario menu, which calls this function `onchange`.
     */
    changeScenario: function () {
        lotti.setScenario(this.value);
        this.showResults();
    },

    openAndCloseDoor: async function (iDoor) {

        iDoor.transition().attr("y", -(this.choiceSize - 12)).duration(lotti.scenario.fadeTime);
        iDoor.transition().attr("y", 0).delay(lotti.scenario.timeTillFade).duration(lotti.scenario.fadeTime);

    },

    toggleOptions: function () {
        const runIcon = "🏃🏽‍♀️‍";
        const gearIcon = "⚙️";
        this.showingOptions = !this.showingOptions;

        if (this.showingOptions) {
            document.getElementById("game").style.display = "none";
            document.getElementById("options").style.display = "block";
            document.getElementById("optionsIcon").innerHTML = runIcon;
        } else {
            document.getElementById("game").style.display = "block";
            document.getElementById("options").style.display = "none";
            document.getElementById("optionsIcon").innerHTML = gearIcon;
        }
    },

    scenarioMenuGuts: function (iSelected) {
        out = ``;

        for (let lKey in lotti.allScenarios) {
            const theseStrings = DG.plugins.lotti.scenarioStrings[lKey]
            const theName = theseStrings.label;
            let selectMe = false;

            if (lKey === iSelected) {
                selectMe = true;
            }

            if (lotti.state.optShowAllScenarios || lotti.allScenarios[lKey].allowance) {
                out += `<option value="${lKey}" ${selectMe ? "selected" : ""}>${theName}</option>\n`;
            }
        }
        return out;
    },
}