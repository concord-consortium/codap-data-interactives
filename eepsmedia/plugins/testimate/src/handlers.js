const handlers = {

    getPluginState : function() {
        return {
            success: true,
            values: {
                store: testimate.state,
            }
        };
    },

    restorePluginFromStore: function(iStorage) {
        if (iStorage) {
            testimate.state = iStorage.store;
        }
    },

    /**
     * User has clicked a button that changes whether a test is one- or two-sided
     * todo: remove this in favor of changeSides12?
     */
    changeTestSides: function () {
        const iSign = document.getElementById(`sidesButton`).value;    // 1 or 2
        testimate.state.testParams.sides = (iSign === `≠`) ? 1 : 2;
        testimate.refreshDataAndTestResults();
    },

    changeSides12 : function() {
        const newSides = testimate.state.testParams.sides === 1 ? 2 : 1;
        testimate.state.testParams.sides = newSides;
        testimate.refreshDataAndTestResults();
    },

    changeConf: function () {
        const a = document.getElementById(`confBox`);
        testimate.state.testParams.conf = a.value;
        testimate.state.testParams.alpha = 1 - testimate.state.testParams.conf / 100;
        testimate.refreshDataAndTestResults();
    },

    changeAlpha: function () {
        const a = document.getElementById(`alphaBox`);
        testimate.state.testParams.alpha = a.value;
        testimate.state.testParams.conf = 100 * (1 - testimate.state.testParams.alpha);
        testimate.refreshDataAndTestResults();
    },

    changeValue: function () {
        const v = document.getElementById(`valueBox`);
        testimate.state.testParams.value = v.value;
        testimate.refreshDataAndTestResults();
    },

    changeIterations: function () {
        const v = document.getElementById(`iterBox`);
        testimate.state.testParams.iter = v.value;
        testimate.refreshDataAndTestResults();
    },

    changeRate: function () {
        const v = document.getElementById(`rateBox`);
        testimate.state.testParams.rate = v.value;
        testimate.refreshDataAndTestResults();
    },

    changeEmitMode: function() {
        ui.emitMode = document.querySelector("input[name='emitMode']:checked").value;

        //  set emitMode to single if you're trying something impossible
        if (this.emitMode === 'random' && !data.hasRandom) {
            this.emitMode = 'single';
            alert("Can't emit using rerandomizing if there are no random attributes");  //  todo: localize
        }
        if (this.emitMode === 'hierarchical' && !data.isGrouped) {
            this.emitMode = 'single';
            alert("Can't emit for each subgroups if there are no subgroups");  //  todo: localize
        }

        testimate.refreshDataAndTestResults();
    },

    changeRandomEmitNumber: function () {
        const v = document.getElementById(`randomEmitNumberBox`);
        testimate.state.randomEmitNumber = v.value;
        testimate.refreshDataAndTestResults();
    },

    changeLogisticRegressionProbe: function () {
        const LRP = document.getElementById(`logisticRegressionProbeBox`);
        testimate.state.testParams.probe = LRP.value; //  need for state and restore
        testimate.refreshDataAndTestResults();
    },

    changeTest: function () {
        const T = document.getElementById(`testMenu`);
        testimate.makeFreshTest(T.value); //  the testID, need for state and restore
        testimate.refreshDataAndTestResults();
    },

    changeFocusGroupX: function () {
        const initialGroup = testimate.state.testParams.focusGroupX;
        const valueSet = [...data.xAttData.valueSet];
        const nextValue = this.nextValueInList(valueSet, initialGroup);
        testimate.state.testParams.focusGroupX = testimate.setFocusGroup(data.xAttData, nextValue);
        testimate.refreshDataAndTestResults();
    },

    changeFocusGroupY: function () {
        const initialGroup = testimate.state.testParams.focusGroupY;
        const valueSet = [...data.yAttData.valueSet];
        const nextValue = this.nextValueInList(valueSet, initialGroup);
        testimate.state.testParams.focusGroupY = testimate.setFocusGroup(data.yAttData, nextValue);
        testimate.refreshDataAndTestResults();
    },

    reverseTestSubtraction : function() {
        testimate.state.testParams.reversed = !testimate.state.testParams.reversed;
        testimate.refreshDataAndTestResults();
    },

    /**
     * Change the TYPE (categorical or numeric = CN) of the attribute
     * @param iXY
     */
    changeCN: function (iXY) {
        const aName = (iXY === 'x') ? testimate.state.x.name : testimate.state.y.name;
        const newType = (testimate.state.dataTypes[aName] === 'numeric' ? 'categorical' : 'numeric');
        testimate.state.dataTypes[aName] = newType;
        testimate.refreshDataAndTestResults();
    },


    changeGoodnessProp: function(iLast) {
        console.log(`changing goodness prop for ${iLast}`);
        const theTest = testimate.theTest;

        let propSum = 0;
        const lastGroup = theTest.results.groupNames[theTest.results.groupNames.length - 1];

        theTest.results.groupNames.forEach(g => {
            let theBoxValue = 0;
            if (g !== lastGroup) {
                theBoxValue = Number(document.getElementById(`GProp_${g}`).value);
                const oldPropSum = propSum
                propSum += theBoxValue;
                if (propSum > 1) {
                    theBoxValue = 1 - oldPropSum;
                    propSum = 1;
                }
            } else {    //  the last one!
                theBoxValue = 1 - propSum;
                const theLastBox = document.getElementById("lastProp");
                theLastBox.innerHTML = ui.numberToString(theBoxValue);
            }
            testimate.state.testParams.groupProportions[g] = (theBoxValue);
        })
        testimate.refreshDataAndTestResults();
    },

    /**
     * for logistic regression
     * @param iHowMany  how many more iterations
     */
    doMoreIterations : function(iHowMany) {
        testimate.theTest.moreIterations = iHowMany;
        testimate.theTest.newRegression = false;        //      we will add on
        testimate.refreshDataAndTestResults();
    },

    showLogisticGraph: function() {
        const formulas = testimate.theTest.makeFormulaString();
        connect.showLogisticGraph(formulas.longFormula);
    },


    getNextGroupValue: function(initialValue) {
        const valueSet = [...data.xAttData.valueSet];

        if (initialValue) {
            const nextValue = this.nextValueInList(valueSet, initialValue);
            return nextValue ? nextValue : null;
        } else {
            return valueSet[0];
        }
    },

    nextValueInList: function (iList, iValue) {
        const iOrig = iList.indexOf(iValue);
        const iNext = (iOrig + 1 >= iList.length) ? 0 : iOrig + 1;
        return iList[iNext];
    },


    /**
     * remove the attribute indicated
     * @param iXY
     */
    trashAttribute: function (iXY) {
        console.log(`removing attribute [${iXY}]`);
        testimate.state[iXY] = null;
        testimate.theTest = null;
        data.xAttData = null;
        data.yAttData = null;
        data.dirtyData = true;
        testimate.refreshDataAndTestResults();
    },

    /**
     * emit test results to CODAP
     */
    emitSingle: async function () {

        const theTest = testimate.theTest;
        console.log(`N = ${theTest.results.N}, P = ${theTest.results.P}`);
        await connect.emitTestData({});
    },

    /**
     * re-randomize and then emit results to CODAP.
     */
    emitRandom: async function() {

        for (let i = 0; i < testimate.state.randomEmitNumber; i++) {
            await connect.rerandomizeSource(testimate.state.dataset.name);
            await this.emitSingle();
        }

        testimate.refreshDataAndTestResults();
    },

    emitHierarchy: async function() {

        for (let i = 0; i < data.topCases.length; i++ ) {
            const tc = data.topCases[i];

            const theTopValues = tc.values;    //  must match all of these
            console.log(`top case ${i}: match values using ${JSON.stringify(theTopValues)}`);

            const oneGroupDataset = data.filterGroupCases(data.allCODAPitems, theTopValues);
            if (oneGroupDataset) {
                //  console.log(`Filtered: ${JSON.stringify(oneGroupDataset)}`)
                await data.makeXandYArrays(oneGroupDataset);

                await data.removeInappropriateCases();
                await testimate.theTest.updateTestResults();  //  now we've done the test on this subset
                await connect.emitTestData(theTopValues);
                console.log(`top case ${i}: done emitting ${JSON.stringify(theTopValues)}`);
            }
        }

        await testimate.refreshDataAndTestResults();
    },

}