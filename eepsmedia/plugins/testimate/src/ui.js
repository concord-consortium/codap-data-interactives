let ui;

ui = {

    xDIV: null,
    xNameDIV: null,
    yDIV: null,
    yNameDIV: null,
    xType: null,
    yType: null,

    datasetDIV: null,
    datasetSPAN: null,
    testHeaderDIV: null,
    resultsDIV: null,      //  results DIV
    configDIV: null,
    emitControls: null,

    emitMode: "single",

    initialize: function () {
        this.xDIV = document.getElementById(`xDIV`);
        this.yDIV = document.getElementById(`yDIV`);
        this.xType = document.getElementById(`xCNbutton`);
        this.yType = document.getElementById(`yCNbutton`);

        this.xNameDIV = document.getElementById(`xAttributeName`);
        this.yNameDIV = document.getElementById(`yAttributeName`);

        this.datasetDIV = document.getElementById(`datasetDIV`);
        this.datasetSPAN = document.getElementById(`datasetSPAN`);
        this.testHeaderDIV = document.getElementById(`testHeaderDIV`);
        this.resultsDIV = document.getElementById(`resultsDIV`);
        this.configDIV = document.getElementById(`configureDIV`);

        this.emitControls = document.getElementById(`emitControls`);
        this.emitMode = "single";
    },

    /**
     * Main UI function. Redraws the screen.
     *
     * @returns {Promise<void>}
     */
    redraw: async function () {

        if (testimate.state.dataset) {

            if (testimate.theTest && testimate.theTest.testID) {

                //      create the text and other display information for the results
                this.datasetSPAN.innerHTML = await this.makeDatasetGuts();
                this.testHeaderDIV.innerHTML = this.makeTestHeaderGuts();   //  includes making the choice menu
                this.resultsDIV.innerHTML = testimate.theTest.makeResultsString();
                this.configDIV.innerHTML = testimate.theTest.makeConfigureGuts();
                document.getElementById("randomEmitNumberBox").value = testimate.state.randomEmitNumber;
                this.adjustEmitGuts();
            }
        }

        this.updateAttributeBlocks();
        this.setVisibility();
    },

    setVisibility: function () {

        //  many things are invisible if there is no x-variable, therefore no test

        document.getElementById('Ybackdrop').style.display = (testimate.state.x) ? 'inline' : 'none';
        // document.getElementById('xCNbutton').style.display = (testimate.state.x) ? 'inline' : 'none';
        document.getElementById('testHeaderDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('emitDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('resultsDIV').style.display = (testimate.state.x) ? 'block' : 'none';
        document.getElementById('configureDIV').style.display = (testimate.state.x) ? 'block' : 'none';

        document.getElementById('emitSingleGroup').style.display = "block";     //  always show single
        document.getElementById('emitRandomGroup').style.display = (data.hasRandom) ? "block" : "none";
        document.getElementById('emitHierarchicalGroup').style.display = (data.isGrouped) ? "block" : "none";

        //  emit mode visibility

        switch (this.emitMode) {
            case "single":
                document.getElementById('emitSingleButton').style.display = 'inline';
                document.getElementById('chooseEmitSingle').checked = true;
                document.getElementById('emitRandomButton').style.display = 'none';
                //  document.getElementById('chooseEmitRandomLabel').style.display = 'inline';
                document.getElementById('randomEmitNumberBox').style.display = 'none';
                document.getElementById('randomEmitNumberBoxLabel').style.display = 'none';
                document.getElementById('emitHierarchyButton').style.display = 'none';
                break;
            case "random":
                document.getElementById('chooseEmitRandom').checked = true;
                document.getElementById('emitSingleButton').style.display = 'none';
                document.getElementById('emitRandomButton').style.display = 'inline';
                document.getElementById('chooseEmitRandomLabel').style.display = 'inline';
                document.getElementById('randomEmitNumberBox').style.display = 'inline';
                document.getElementById('randomEmitNumberBoxLabel').style.display = 'inline';
                document.getElementById('emitHierarchyButton').style.display = 'none';
                break;
            case "hierarchy":
                document.getElementById('chooseEmitHierarchy').checked = true;
                document.getElementById('emitSingleButton').style.display = 'none';
                document.getElementById('emitRandomButton').style.display = 'none';
                //  document.getElementById('chooseEmitRandomLabel').style.display = 'inline';
                document.getElementById('randomEmitNumberBox').style.display = 'none';
                document.getElementById('randomEmitNumberBoxLabel').style.display = 'none';
                document.getElementById('emitHierarchyButton').style.display = 'inline';
                break;
            default:
                alert(`unexpected emit mode: [${this.emitMode}]`);
                break;
        }


    },

    updateAttributeBlocks: function () {
        const xType = document.getElementById(`xCNbutton`);
        const yType = document.getElementById(`yCNbutton`);
        const xTrash = document.getElementById(`xTrashAttButton`);
        const yTrash = document.getElementById(`yTrashAttButton`);

        if (testimate.state.x && testimate.state.x.name) {
            this.xNameDIV.textContent = testimate.state.x.name;
            xType.value = testimate.state.dataTypes[testimate.state.x.name] === 'numeric' ? '123' : 'abc';
            xTrash.style.display = "inline";
            xType.style.display = "inline";
            this.xDIV.className = "drag-none";
        } else { // x attribute waiting for drop!
            this.xNameDIV.textContent = localize.getString("dropAttributeHere");
            xTrash.style.display = "none";
            xType.style.display = "none";
            this.xDIV.className = "drag-empty";
        }
        if (testimate.state.y && testimate.state.y.name) {
            this.yNameDIV.textContent = testimate.state.y.name;
            yType.value = testimate.state.dataTypes[testimate.state.y.name] === 'numeric' ? '123' : 'abc';
            yTrash.style.display = "inline";
            yType.style.display = "inline";
            this.yDIV.className = "drag-none";
        } else {
            this.yNameDIV.textContent = localize.getString("dropAttributeHere");
            yTrash.style.display = "none";
            yType.style.display = "none";
            this.yDIV.className = "drag-empty";
        }

    },

    numberToString: function (iValue, iFigs = 4) {
        let out = "";
        let multiplier = 1;
        let suffix = "";
        let exponential = false;

        if (iValue === "" || iValue === null || typeof iValue === "undefined") {
            out = "";
        } else if (iValue === 0) {
            out = "0";
        } else {
            if (Math.abs(iValue) > 1.0e15) {
                exponential = true;
            } else if (Math.abs(iValue) < 1.0e-4) {
                exponential = true;
            } else if (Math.abs(iValue) > 1.0e10) {
                multiplier = 1.0e9;
                iValue /= multiplier;
                suffix = " B";
            } else if (Math.abs(iValue) > 1.0e7) {
                multiplier = 1.0e6;
                iValue /= multiplier;
                suffix = " M";
            }
            out = new Intl.NumberFormat(
                testimate.constants.lang,
                {maximumSignificantDigits: iFigs, useGrouping: false}
            ).format(iValue);

            if (exponential) {
                out = Number.parseFloat(iValue).toExponential(iFigs);
            }
        }
        return `${out}${suffix}`;       //  empty if null or empty
    },

    /**
     * returns the "sides" button HTML, which controls whether this is a 1- or 2-sided test.
     * The button therefore changes from "≠" to either ">" or "<", and back again.
     * This is in the form of a clickable button so you can change it.
     *
     * @param iSides
     * @returns string containing the html for that button
     */
    sidesBoxHTML: function (iSides) {
        const theParams = testimate.state.testParams;
        theParams.theSidesOp = "≠";
        if (iSides === 1) {
            const testStat = testimate.theTest.results[testimate.theTest.theConfig.testing];  //  testing what? mean? xbar? diff? slope?
            theParams.theSidesOp = (testStat > theParams.value ? ">" : "<");
        }

        return `<input id="sidesButton" type="button" class="chiclet" onclick="handlers.changeTestSides()" 
                value="${theParams.theSidesOp}">`
    },

    /**
     * Button that changes which group is compared to everybody else
     * (we will call this group the "focusGroup"
     * (when a categorical app needs to be made binary)
     * @param iGroup
     * @returns {`<input id="focusGroupButton" type="button" onclick="handlers.changeFocusGroup()"
     value="${string}">`}
     */
    focusGroupButtonXHTML: function (iGroup) {
        return `<input id="focusGroupButtonX" class="chiclet" type="button" onclick="handlers.changeFocusGroupX()" 
                value="${iGroup}">`
    },

    focusGroupButtonYHTML: function (iGroup) {
        return `<input id="focusGroupButtonY" class="chiclet" type="button" onclick="handlers.changeFocusGroupY()" 
                value="${iGroup}">`
    },

    chicletButtonHTML : function(iGuts) {
        return `<input id="chicletButton" class="chiclet" type="button" onclick="handlers.reverseTestSubtraction()" 
                value="${iGuts}">`
    },

    sides12ButtonHTML : function(iSides) {
        const buttonTitle = localize.getString("Nsided", iSides);
        return `<input id="sides12Button" class="chiclet" type="button" onclick="handlers.changeSides12()" 
                value="${buttonTitle}">`
    },

    getFocusGroupName: function () {
        if (!testimate.state.testParams.focusGroup) {
            testimate.setFocusGroup(data.xAttData, null);
        }
        return testimate.state.focusGroupDictionary[data.xAttData.name];
    },

    makeLogisticGraphButtonHTML: function (iGroup) {
        const theLabel = localize.getString("showGraph");
        return `<input id="logisticGraphButton" type="button" 
                onclick="handlers.showLogisticGraph()" 
                value="${theLabel}">`
    },

    /**
     * Construct a number <input> to receive a value such as
     * the value to be compared to
     *
     * @param iVal
     * @param iMax
     * @param iStep
     * @returns {`<input id="valueBox" class="short_number_field" onchange="handlers.changeValue()"
     ${string|string} ${string|string} type="number" value="${string}">`}
     */
    valueBoxHTML: function (iVal, iMin, iMax, iStep) {
        const minPhrase = iMin ? `min="${iMin}"` : "";
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="valueBox" class="short_number_field" onchange="handlers.changeValue()"
               ${minPhrase} ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    iterBoxHTML: function (iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="iterBox" class="short_number_field" onchange="handlers.changeIterations()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    rateBoxHTML: function (iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="rateBox" class="short_number_field" onchange="handlers.changeRate()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    logisticRegressionProbeBoxHTML: function (iVal, iMax, iStep) {
        const maxPhrase = iMax ? `max="${iMax}"` : "";
        const stepPhrase = iStep ? `step="${iStep}"` : "";
        return `<input id="logisticRegressionProbeBox" class="short_number_field" onchange="handlers.changeLogisticRegressionProbe()"
               ${maxPhrase} ${stepPhrase} type="number" value="${iVal}">`;
    },

    /**
     * Construct a number <input> to receive a
     * a confidence level. Also includes a <label>
     *
     * @param iConf
     * @returns {`<label for="confBox" id="conf_label">conf&nbsp;=&nbsp;</label>
     <input id="confBox" class="short_number_field" onchange="handlers.changeConf()"
     type="number" value="${string}" step="1" min="0" max="100">%`}
     */
    confBoxHTML: function (iConf) {
        return `<label for="confBox" id="conf_label">conf&nbsp;=&nbsp;</label>
        <input id="confBox" class="short_number_field" onchange="handlers.changeConf()"
               type="number" value="${iConf}" step="1" min="0" max="100">%`;
    },

    alphaBoxHTML: function (iConf) {
        return `<label for="alphaBox" id="alpha_label">&alpha;&nbsp;=&nbsp;</label>
        <input id="alphaBox" class="short_number_field" onchange="handlers.changeAlpha()"
               type="number" value="${iConf}" step=".005" min="0" max="1">`;
    },

    /*
        updateConfig: function () {
            const theConfig = Test.configs[testimate.theTest.testID];
            const theParams = testimate.state.testParams;

            document.getElementById(`configStart`).textContent = `${testimate.theTest.makeTestDescription(this.theTestID, false)} `;
            document.getElementById(`valueBox`).value = theParams.value;
            document.getElementById(`sidesButton`).value = theParams.theSidesOp;
        },
    */

    makeTestHeaderGuts: function () {
        let out = `<div class = "hBox">`;

        if (testimate.theTest) {
            const theTestConfig = Test.configs[testimate.theTest.testID];
            let thePhrase = theTestConfig.makeMenuString();

            if (testimate.compatibleTestIDs.length === 1) {
                out += thePhrase;
            } else if (testimate.compatibleTestIDs.length > 1) {
                let theMenu = `<select id='testMenu' onchange='handlers.changeTest()'>`;
                testimate.compatibleTestIDs.forEach(theID => {
                    let chosen = testimate.theTest.testID === theID ? "selected" : "";
                    const menuString = Test.configs[theID].makeMenuString();
                    theMenu += `<option value='${theID}' ${chosen}> ${menuString} </option>`;
                })
                theMenu += `</select>`;
                out += theMenu;
            }

        } else {
            out = "no tests available with these settings!";
        }

        out += `</div>`;    //  close the hBox DIV
        return out;
    },

    /**
     * Make the contents of the top DIV, which lists the dataset name plus some other stuff.
     * @returns {Promise<string>}
     */
    makeDatasetGuts: async function () {
        const randomPhrase = ui.hasRandom ? localize.getString('hasRandom') : localize.getString('noRandom');

        return localize.getString("datasetDIV", testimate.state.dataset.title, data.allCODAPitems.length, randomPhrase);
    },

    adjustEmitGuts: function () {
        const summaryClause = `<summary>${localize.getString("tests.emitSummary")}</summary>`
        const singleEmitButtonTitle = localize.getString("emit");
        const randomEmitButtonTitle = localize.getString("emitRR", testimate.state.randomEmitNumber);
        const hierarchyEmitButtonTitle = localize.getString("emitHierarchy", data.topCases.length);

        document.getElementById("emitSingleButton").value = singleEmitButtonTitle;
        document.getElementById("emitRandomButton").value = randomEmitButtonTitle;
        document.getElementById("emitHierarchyButton").value = hierarchyEmitButtonTitle;

        /*        const emitClause = `<input type="button" id="emitButton"
                    value="${emitButtonTitle}"
                    onclick="handlers.emit()"></input>
        `;
                const emitRRButton = `<input type="button"  id="rrEmitButton"
                    value="${emitRRButtonTitle}"
                    onclick="handlers.rrEmit(${testimate.state.rrEmitNumber})"></input>`;
                const emitRRBox =  `<input type="number" id="rrEmitBox" value="${testimate.state.rrEmitNumber}"
                       onclick="handlers.changeRREmit()" min="0" max = "100" step="1"
                       class="short_number_field">
                       <label for="rrEmitBox">times</label>
                    `;

                let randomClause = "";
                if (ui.hasRandom) {
                    randomClause = `${emitRRButton} &emsp; ${emitRRBox}`;
                }

                let hierarchicalClause = "";
                if (this.hierarchyInfo && this.hierarchyInfo.nCollections > 1) {
                    const emitHierarchyButtonTitle = localize.getString("emitHierarchy", this.hierarchyInfo.topLevelCases.length);
                    const emitHierarchyButton =
                        `<input type="button"  id="hierarchyEmitButton"
                            value="${emitHierarchyButtonTitle}"
                            onclick="handlers.hierarchyEmit()">
                        </input>`;
                    hierarchicalClause = emitHierarchyButton;
                }*/
    },


}
