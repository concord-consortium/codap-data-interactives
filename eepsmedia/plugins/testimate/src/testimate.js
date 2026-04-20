/* global data, Test, ui, localize, connect */


const testimate = {

    state: {},
    restoringFromSave: false,
    dirtyData: true,
    theTest: null,          //  the actual test instance, for example, a OneSampleP.
    compatibleTestIDs : [],
    refreshCount : 0,
    OKtoRespondToCaseChanges : true,
    iteratingRandom : false,      //  has the user pressed the button that rerandomizes the CODAP data and makes a new test?
    warning : "",       //  string exists if there is an active warning about test results.

    initialize: async function () {
        console.log(`initializing...`);

        await connect.initialize( );
        await localize.initialize(localize.figureOutLanguage('en'));
        ui.initialize();

        this.state = {...this.constants.defaultState, ...this.state};   //  have all fields in default!

        if (this.state.dataset) {
            data.dirtyData = true;
            await this.restoreState();
        }

        ui.redraw();
    },

    /**
     * This makes sure data is current
     */
    refreshDataAndTestResults: async function () {
        this.refreshCount++;
        console.log(`refresh data: ${this.refreshCount}`);

        if (this.state.dataset) {
            await data.updateData();
            await data.makeXandYArrays(data.allCODAPitems);
            await data.checkIfSourceDataHasRandomness();
            this.dirtyData = false;     //  set in data when CODAP sends notifications of changes. todo: do we need this any more?

            this.checkTestConfiguration();      //  ensure that this.theTest holds a suitable "Test"

            if (this.theTest && this.theTest.testID) {
                this.warning = "";

                //  remember the test parameters for this type of test
                testimate.state.testParamDictionary[testimate.theTest.testID] = testimate.state.testParams;

                data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc.)
                await this.theTest.updateTestResults();      //  with the right data and the test, we can calculate these results.
            } else {
                console.log(`Unexpected: refreshing data and we don't have a test.`);
            }

        } else {
            console.log(`trying to refresh data but there is no dataset`);
        }

        //  codapInterface.updateInteractiveState(this.state);
        ui.redraw();
    },

    checkTestConfiguration: function () {
        this.compatibleTestIDs = Test.findCompatibleTestConfigurations();

        if (this.theTest) {
            if (!this.compatibleTestIDs.includes(this.state.testID)) {
                //  if the current test is incompatible with the current data,
                //  pick the first compatible one
                this.makeFreshTest(this.compatibleTestIDs[0]);
            }
        } else if (this.compatibleTestIDs.includes(this.state.testID)) {
            //  there is no current theTest (e.g., we're restoring from save),
            //  but there is a suitable testID (from the saved state)
            this.makeFreshTest(this.state.testID);
        } else if (this.compatibleTestIDs.length) {
            //  it should ALWAYS be possible to find a possible test.
            //  set theTest to the first one in the list
            this.makeFreshTest(this.compatibleTestIDs[0]);
        } else {
            alert(`somehow, we see no possible test IDs.`);
        }
    },

    restoreState: async function () {

        await connect.registerForCaseChanges(this.state.dataset.name);
        if (testimate.state.testID) {
            this.restoringFromSave = true;
            await this.refreshDataAndTestResults();
        }
    },

    makeFreshTest: function (iID) {
        testimate.state.testID = iID;
        const theConfigs = Test.configs[iID];
        this.theTest = theConfigs.fresh(iID, data.xAttData, data.yAttData);
        this.restoringFromSave = false;
    },

    //  todo: move to handlers
    copeWithAttributeDrop: async function (iDataset, iAttribute, iWhere) {
        //  const titleElement = document.getElementById(`titleDIV`);
        const initialElement = document.elementFromPoint(iWhere.x, iWhere.y);
        const theElement = initialElement.closest('#xDIV, #yDIV');

        if (!this.state.dataset) {
            await this.setDataset(iDataset);
        } else if (this.state.dataset.name !== iDataset.name) {
            await this.setDataset(iDataset);
        }

        if (theElement === ui.xDIV) {
            await this.setX(iAttribute);
        } else if (theElement === ui.yDIV) {
            await this.setY(iAttribute);
        } else if (theElement && !this.state.x.name) {
            await this.setX(iAttribute);      //  set x anywhere if it doesn't exist
        }

        data.dirtyData = true;

        await testimate.refreshDataAndTestResults();
    },

    setDataset: async function (iDataset) {
        this.state.dataset = iDataset;
        this.state.testID = null;
        this.state.x = null;
        this.state.y = null;    //  change of dataset, remove attributes
        data.xAttData = null;
        data.yAttData = null;
        data.dirtyData = true;

        await connect.registerForCaseChanges(this.state.dataset.name);
        await connect.registerForAttributeEvents(this.state.dataset.name);
        //  await connect.getDatasetInfo(iName);
        console.log(`set dataset to ${iDataset.name}`);
    },

    setX: async function (iAtt) {
        data.dirtyData = true;
        this.state.x = iAtt;        //  the dropped attribute structure, with .id, .name, and .title
        console.log(`set X to ${iAtt.name}`);
    },

    setY: async function (iAtt) {
        data.dirtyData = true;
        if (this.state.x) {
            this.state.y = iAtt;
            console.log(`set Y to ${iAtt.name}`);
        } else {
            this.setX(iAtt);   //  always fill x first.
        }
    },

    /**
     * Determine which operator to use in "sides": "≠", "<", or ">".
     *
     * Depends on what test we're running.
     */

    determineSidesOp() {
        const theParams = testimate.state.testParams;

        if (this.theTest.theConfig.name === "Fisher exact") {
            if (theParams.sides === 2) {
                theParams.theSidesOp = "≠";
            } else {
                theParams.theSidesOp = (this.theTest.results.a > this.theTest.results.aExpected) ? ">" : "<";
                console.log(`op is ${theParams.theSidesOp} because ${this.theTest.results.a } ${theParams.theSidesOp} ${this.theTest.results.aExpected}`);
            }
        } else {
            if (theParams.sides === 2) {
                theParams.theSidesOp = "≠";
            } else  {
                const testStat = testimate.theTest.results[testimate.theTest.theConfig.testing];  //  testing what? mean? xbar? diff? slope?
                theParams.theSidesOp = (testStat > theParams.value ? ">" : "<");
            }
        }
    },

    /**
     * Set the value of the "focusGroup" in the test parameters.
     *
     * A 'group' in this case is an identified value of a categorical attribute.
     * For example, in "gender" you might focus on "Female."
     * That means that you'll look at proportions of "Female" in tests.
     *
     * Also, remember it for later.
     *
     * @param iAttData       the attribute data we're looking at
     * @param iValue         proposed value
     *  @returns {Promise<void>}    the value for the focus group (becomes testimate.state.testParams.focusGroupX or ...Y.)
     */
    setFocusGroup:  function (iAttData, iValue) {
        const theName = iAttData.name;
        const theValues = [...iAttData.valueSet];  //  possible values for groups
        const defaultValue = this.state.focusGroupDictionary[theName] ?
            this.state.focusGroupDictionary[theName] :
            theValues[0];

        const theValue = theValues.includes(iValue) ? iValue : defaultValue;

        this.state.focusGroupDictionary[theName] = theValue;

        return theValue;
    },

    putFocusFirst: function(iValues, iFocus) {
        let out = [iFocus ? iFocus : iValues[0]];
        iValues.forEach(v => {
            if (v !== iFocus) {
                out.push(v);
            }
        });

        return out;
    },

    setLogisticFocusGroup: async function(iAttData, iValue) {

        const theValue = this.setFocusGroup(iAttData, iValue);

        //  if this is logistic regression
        const theConfig = Test.configs[testimate.state.testID];
        const theAxis = theConfig.groupAxis;    //  only exists for logistic regression
        if (theAxis) {
            const f = await connect.updateDatasetForLogisticGroups(theValue, theAxis);
            console.log(`changing logistic grouping: new formula : [${f}]`);
        }
        //  done with special logistic treatment
        return theValue;

    },

    predictorExists: function () {
        return (data.yName());
    },

    constants: {
        pluginName: `testimate`,
        version: `2026e`,
        dimensions: {height: 555, width: 444},

        emittedDatasetName: `tests and estimates`,     //      for receiving emitted test and estimate results
        logisticGroupAttributeName: `_logisticGroup`,  //  to add to the original dataset
        logisticGraphName: "logistic graph",

        defaultState: {
            lang: `en`,
            dataset: null,     //      whole dataset info, includes .name
            dataTypes: {},     //      {'gender' : 'categorical', 'height' : 'numeric', ...}
            x: null,           //      attribute info, complete
            y: null,
            randomEmitNumber: 10,      //  number of times you re-randomize by default
            testID: null,
            testParams: {},
            mostRecentEmittedTest: null,
            focusGroupDictionary : {},
            testParamDictionary : {},
            valueDictionary : {},       //  records the number in the "value" box
        }
    }
};
