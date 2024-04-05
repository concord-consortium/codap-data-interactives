const data = {

    dirtyData: true,
    secondaryCleanupNeeded: false,

    allCODAPitems: [],        //  array retrieved from CODAP
    topCases: [],
    xAttData: null,
    yAttData: null,

    hasRandom: false,
    isGrouped: false,
    sourceDatasetInfo: {},



    /**
     * called from testimate.refreshDataAndTestResults().
     *
     * Before we write anything on the screen, we ensure that the data we have is current.
     *
     * @returns {Promise<void>}
     */
    updateData: async function () {
        if (testimate.state.dataset) {

            if (this.dirtyData) {
                this.sourceDatasetInfo = await connect.getSourceDatasetInfo(testimate.state.dataset.name);
                this.hasRandom = this.sourceDSHasRandomness();
                this.isGrouped = this.sourceDSisHierarchical();

                this.topCases = (this.isGrouped) ? await connect.retrieveTopLevelCases() : [];

                await this.retrieveAllItemsFromCODAP();
            }
        }
    },

    /*      Coping with getting data from CODAP and responding to changes       */

    /**
     * called from this.updateData()
     *
     * We KNOW the dataset exists and the data are dirty,
     *
     * @returns {Promise<void>}
     */
    retrieveAllItemsFromCODAP: async function () {
        if (testimate.state.x) {
            this.allCODAPitems = await connect.getAllItems();      //  this.dataset is now set as array of objects (result.values)
            if (this.allCODAPitems) {
            }
        } else {
            console.log(`no x variable`);
        }
    },

    /**
     * Construct xAttData and yAttData, the INTERNAL Arrays of the data in each attribute.
     *
     * Those constructors evaluate the values to tell whether the attributes are numeric or categorical.
     * We need this in order to figure out which tests are appropriate,
     * and (importantly) to set a test if it has not yet been set.
     *
     * @param xName
     * @param yName
     * @param data
     * @returns {Promise<void>}
     */
    makeXandYArrays : async function(data) {
        if (testimate.state.x) {
            this.xAttData = new AttData(testimate.state.x.name, data);
            if (!testimate.state.focusGroupDictionary[this.xAttData.name]) {
                testimate.state.testParams.focusGroupX = testimate.setFocusGroup(this.xAttData, null);
            }
        }
        if (testimate.state.y) {
            this.yAttData = new AttData(testimate.state.y.name, data);
            testimate.state.testParams.focusGroupY = testimate.setFocusGroup(this.yAttData, null);
        }
        if (this.xAttData)  console.log(`    made xAttData (${this.xAttData.theRawArray.length})`);
    },

    removeInappropriateCases: async function () {

        if (!testimate.theTest) return;

        let newXArray = []
        let newYArray = []

        const paired = Test.configs[testimate.theTest.testID].paired;


        //  make intermediate arrays that have only the right type of values (e.g., numeric)
        //  same length as original!

        let xIntermediate = [];
        if (testimate.state.x) {
            const xMustBeNumeric = (testimate.state.dataTypes[testimate.state.x.name] === 'numeric');
            this.xAttData.theRawArray.forEach(xx => {
                if (xMustBeNumeric) {
                    xIntermediate.push(typeof xx === 'number' ? xx : null);
                } else {
                    xIntermediate.push(xx);     //  strings and nulls
                }
            })
        }

        let yIntermediate = [];
        if (testimate.state.y) {
            const yMustBeNumeric = (testimate.state.dataTypes[testimate.state.y.name] === 'numeric');
            this.yAttData.theRawArray.forEach(xx => {
                if (yMustBeNumeric) {
                    yIntermediate.push(typeof xx === 'number' ? xx : null);
                } else {
                    yIntermediate.push(xx);     //  strings and nulls
                }
            })
        }

        //  now go through the intermediate arrays prudently eliminating null values

        const xLim = xIntermediate.length;
        const yLim = yIntermediate.length;
        let i = 0;

        while (i < xLim || i < yLim) {
            const X = i < xLim ? xIntermediate[i] : null;
            const Y = i < yLim ? yIntermediate[i] : null;

            if (paired) {
                if (X !== null && Y !== null) {
                    newXArray.push(X);
                    newYArray.push(Y);
                }
            } else {
                if (X !== null) newXArray.push(X);
                if (Y !== null) newYArray.push(Y);
            }

            i++;
        }

        this.xAttData.theArray = newXArray;
        if (testimate.state.y) this.yAttData.theArray = newYArray;

        console.log(`    cleaned xAttData (${this.xAttData.theArray.length})`);

        if (this.xAttData.theArray.length < 20)
            console.log(`cleaned x = ${JSON.stringify(this.xAttData.theArray)} \ncleaned y = ${JSON.stringify(this.yAttData.theArray)}`)
    },

    /**
     * CODAP has told us that a case has changed.
     * We set the dirty data flag and ask to be redrawn.
     * This will cause a re-get of all data and a re-analysis.
     *
     * @param iMessage
     * @returns {Promise<void>}
     */
    handleCaseChangeNotice: async function (iMessage) {
        const theOp = iMessage.values.operation
        let tMess = theOp;
        //  console.log(`start ${tMess}`);
        switch (theOp) {
            case 'createCases':
            case 'updateCases':
            case 'deleteCases':
            case `dependentCases`:      //  fires on rerandomize

                tMess += " *";
                data.dirtyData = true;      //  "this" is the notification, not "data"
                if (testimate.OKtoRespondToCaseChanges) await testimate.refreshDataAndTestResults();
                break;

            case `updateAttributes`:
                //      includes attribute name change!
                const theUpdatedAtts = iMessage.values.result.attrs;    //  array of objects, form {name : newName...}
                theUpdatedAtts.forEach(att => {
                    if (testimate.state.x && att.id === testimate.state.x.id) {    //  saved id of x-attribute
                        const oldName = testimate.state.x.name;
                        console.log(`att X changing from ${oldName} to ${att.title}`);
                        testimate.state.x.title = att.title;       //  new name
                        testimate.state.x.name = att.name;       //  new name
                        testimate.state.dataTypes[att.name] = testimate.state.dataTypes[oldName];
                    }
                    if (testimate.state.y && att.id === testimate.state.y.id) {    //  save id of y-attribute
                        const oldName = testimate.state.y.name;
                        console.log(`att Y changing from ${oldName} to ${att.title}`);
                        testimate.state.y.title = att.title;       //  new name
                        testimate.state.y.name = att.name;       //  new name
                        testimate.state.dataTypes[att.name] = testimate.state.dataTypes[oldName];
                    }
                })
                data.dirtyData = true;
                if (testimate.OKtoRespondToCaseChanges) await testimate.refreshDataAndTestResults();
                break;

            case `deleteAttributes`:
            case `createAttributes`:
                data.dirtyData = true;
                if (testimate.OKtoRespondToCaseChanges) await testimate.refreshDataAndTestResults();
                break;

            default:
                break;
        }
        //  console.log(`end ${tMess}`);

    },

    handleAttributeChangeNotice: async function (iMessage) {
        console.log(`attribute change!`);
    },

    sourceDSHasRandomness: function () {
        let out = false;

        if (this.sourceDatasetInfo) {
            this.sourceDatasetInfo.collections.forEach(c => {
                c.attrs.forEach(a => {
                    const f = a.formula;
                    if (f && f.indexOf("random") > -1) {
                        out = true;
                    }
                })
            })
        }

        return out;
    },

    sourceDSisHierarchical: function () {
        if (this.sourceDatasetInfo) {
            return (this.sourceDatasetInfo.collections.length > 1);
        }
        return null;
    },

    filterGroupCases: function(theWholeDataset, theFilterValues) {
        out = [];
        theWholeDataset.forEach( d => {
            const theItem = d.values;
            let matches = true;
            Object.keys(theFilterValues).forEach(k=>{
                if (theItem[k] !== theFilterValues[k]) {
                    matches = false;
                }
            })
            if (matches) {
                out.push({values: theItem});
            }
        })

        return out;
    },

    /**
     * from https://stackoverflow.com/questions/175739/how-can-i-check-if-a-string-is-a-valid-number
     * @param str
     * @returns {boolean}
     */
    isNumericString: function (str) {
        if (typeof str != "string") return false;       // we only process strings!
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    },

}

class AttData {
    constructor(iAttName, iData) {
        this.name = iAttName ? iAttName : null;
        this.theRawArray = [];
        this.theArray = [];     //  stays empty in constructor
        this.valueSet = new Set();
        this.missingCount = 0;
        this.numericCount = 0;
        this.nonNumericCount = 0;
        this.defaultType = "";

        iData.forEach(aCase => {        //  begin with raw CODAP data, look at each case

            const rawDatum = aCase.values[this.name];
            if (rawDatum === null || rawDatum === '' || rawDatum === undefined) {
                this.theRawArray.push(null);             //      substitute null for any missing data
                this.missingCount++;
            } else if (typeof rawDatum === "number") {      //  numbers stay type number
                this.theRawArray.push(rawDatum);
                this.numericCount++;
                this.valueSet.add(rawDatum);
            } else if (data.isNumericString(rawDatum)) {        //  strings that can be numbers get stored as numbers
                const cooked = parseFloat(rawDatum);
                this.theRawArray.push(cooked);
                this.numericCount++;
                this.valueSet.add(cooked);
            } else {        //  non-numeric         //  non-numeric strings are strings
                this.theRawArray.push(rawDatum);
                this.nonNumericCount++;
                this.valueSet.add(rawDatum);
            }
        });

        //  set the type of this attribute (numeric or categorical)

        let defType = null;
        if (this.numericCount > this.nonNumericCount) defType = 'numeric';
        else if (this.valueSet.size > 0) defType = 'categorical';

        this.defaultType = defType;
        if (!testimate.state.dataTypes[this.name]) testimate.state.dataTypes[this.name] = this.defaultType;
    }


    isNumeric() {
        return testimate.state.dataTypes[this.name] === 'numeric';
    }

    isCategorical() {
        return testimate.state.dataTypes[this.name] === 'categorical';
    }

    isBinary() {
        return (this.valueSet.size === 2 ||  this.valueSet.size === 1);
    }


}

