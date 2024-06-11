const testimate = {

    state: {},
    restoringFromSave: false,
    dirtyData: true,
    theTest: null,          //  the actual test instance, for example, a OneSampleP.
    compatibleTestIDs : [],
    refreshCount : 0,
    OKtoRespondToCaseChanges : true,

    initialize: async function () {
        console.log(`initializing...`);

        await connect.initialize( );
        await localize.initialize(localize.figureOutLanguage('en'));
        ui.initialize();

        // this.state = codapInterface.getInteractiveState();    //  get stored state if any
        this.state = {...this.constants.defaultState, ...this.state};   //  have all fields in default!
        //  codapInterface.updateInteractiveState(this.state);    //


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
            this.dirtyData = false;     //  todo: do we need this any more?

            this.checkTestConfiguration();      //  ensure that this.theTest holds a suitable "Test"

            if (this.theTest && this.theTest.testID) {
                //  remember the test parameters for this type of test
                testimate.state.testParamDictionary[testimate.theTest.testID] = testimate.state.testParams;
                this.adjustTestSides();     //  todo: figure out if this is correct; shouldn't we compute the value before we do this?

                data.removeInappropriateCases();    //  depends on the test's parameters being known (paired, numeric, etc)
                await this.theTest.updateTestResults();      //  with the right data and the test, we can calculate these results.
            } else {
                console.log(`Unexpected: refreshing data and we don't have a test.`)
            }

        } else {
            console.log(`trying to refresh data but there is no dataset`)
        }

        //  codapInterface.updateInteractiveState(this.state);
        ui.redraw();
    },

    /**
     * Something wrong here; check ui.sidesBoxHTML to see where this is apparently computed??   //      todo: attend to sides, >, <, etc!
     */
    adjustTestSides : function() {
        this.state.testParams.theSidesOp = "≠";
        if (this.state.testParams.sides === 1) {
            this.state.testParams.theSidesOp = (this.theTest.results[this.theTest.theConfig.testing] > testimate.state.testParams.value ? ">" : "<");
        }
    },

    checkTestConfiguration: function () {
        this.compatibleTestIDs = Test.findCompatibleTestConfigurations();

        if (this.theTest) {
            if (!this.compatibleTestIDs.includes(this.state.testID)) {
                //  if the current test is incompatible with the current data,
                //  pick the first compatible one
                this.makeFreshTest(this.compatibleTestIDs[0])
            }
        } else if (this.compatibleTestIDs.includes(this.state.testID)) {
            //  there is no current theTest (e.g., we're restoring from save)
            //  but there is a suitable testID (from the saved state)
            this.makeFreshTest(this.state.testID);
        } else if (this.compatibleTestIDs.length) {
            //  it should ALWAYS be possible to find a possible test.
            //  set theTest to the first one in the list
            this.makeFreshTest(this.compatibleTestIDs[0])
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
            this.setX(this.emptyAttribute);
            this.setY(this.emptyAttribute);    //  change of dataset, remove attributes
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
        this.setX(this.emptyAttribute);
        this.setY(this.emptyAttribute);    //  change of dataset, remove attributes

        await connect.registerForCaseChanges(this.state.dataset.name);
        await connect.registerForAttributeEvents(this.state.dataset.name);
        //  await connect.getDatasetInfo(iName);
        console.log(`set dataset to ${iDataset.name}`);
    },

    setX: async function (iAtt) {
        data.dirtyData = true;
        this.state.x = iAtt;        //  the whole attribute structure, with .name and .title
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
     * Set the value of the "focusGroup" in the test parameters.
     * Also, remember it for later.
     *
     * @param iAttData       the attribute data we're looking at
     * @param iValue         proposed value
     *  @returns {Promise<void>}
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
        return (testimate.state.y && testimate.state.y.name);
    },

    emptyAttribute: {
        name: "",
        title: "",
        id: -1,
    },

    constants: {
        pluginName: `testimate`,
        version: `2024i`,
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
}
