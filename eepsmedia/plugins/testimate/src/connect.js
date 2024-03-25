let connect;

/**
 *  Singleton that communicates with CODAP
 */


connect = {

    caseChangeSubscriberIndex: null,
    attributeChangeSubscriberIndex: null,
    attributeDragDropSubscriberIndex: null,
    mostRecentEmittedTest: null,

    initialize: async function () {

        //  note: these subscriptions must happen BEFORE `.init` so that the `.on` there does not
        //  override our handlers.
        codapInterface.on('update', 'interactiveState', "", handlers.restorePluginFromStore);
        codapInterface.on('get', 'interactiveState', "", handlers.getPluginState);

        await codapInterface.init(this.iFrameDescriptor, handlers.restorePluginFromStore);
        await this.registerForDragDropEvents();
        await this.allowReorg();

    },

    /**
     * called from data.retrieveAllItemsFromCODAP
     *
     * @returns {Promise<boolean>}
     */
    getAllItems: async function () {

        let out = null;
        const theMessage = {
            "action": "get",
            "resource": `dataContext[${testimate.state.dataset.name}].itemSearch[*]`
        }

        const result = await codapInterface.sendRequest(theMessage);
        if (result.success) {
            data.dirtyData = false;
            data.secondaryCleanupNeeded = true;
            out = result.values;   //   array of objects, one of whose items is another "values"
        } else {
            alert(`Big trouble getting data!`)
        }
        return out;
    },

    /**
     * Use the API to retrieve the dataset (data context) info for the named dataset
     *  Called by `data.` every time.
     * @param iName
     */
    getSourceDatasetInfo: async function (iName) {
        let out = null;

        const tMessage = {
            action: "get",
            resource: `dataContext[${iName}]`
        }
        let result;

        try {
            result = await codapInterface.sendRequest(tMessage);
            if (result.success) {
                out = result.values; //  includes attributes but no cases
                console.log(`    *   got dataset info`);
            } else {
                console.log(`Failure getting source dataset info`);
            }
        } catch (msg) {
            console.log(`Trouble getting source dataset info: ${msg}`);
        }

        return out;
    },

    /**
     * Constant descriptor for the iFrame.
     * Find and edit the values in `scrambler.constants`
     */
    iFrameDescriptor: {
        name: testimate.constants.pluginName,
        title: testimate.constants.pluginName,
        version: testimate.constants.version,
        dimensions: testimate.constants.dimensions,      //      dimensions,
    },

    registerForAttributeEvents: function (iDatasetName) {
        const sResource = `dataContext[${iDatasetName}].attribute`;

        if (this.attributeChangeSubscriberIndex) {        //  zero is a valid index... :P but it should be the "get"
            codapInterface.off(this.attributeChangeSubscriberIndex);    //  blank that subscription.
        }

        try {
            this.attributeChangeSubscriberIndex = codapInterface.on(
                'notify',
                sResource,
                data.handleAttributeChangeNotice
            );
            console.log(`registered for attribute changes in ${iDatasetName}. Index ${this.attributeChangeSubscriberIndex}`);
        } catch (msg) {
            console.log(`problem registering for attribute changes: ${msg}`);
        }
    },

    /**
     * Register for the dragDrop[attribute] event.
     *
     * Called from connect.initialize();
     */
    registerForDragDropEvents: function () {
        const tResource = `dragDrop[attribute]`;

        this.attributeDragDropSubscriberIndex = codapInterface.on(
            'notify', tResource, testimate.dropManager.handleDragDrop
        )
        console.log(`registered for drags and drops. Index ${this.attributeDragDropSubscriberIndex}`);

    },

    /**
     *  register to receive notifications about changes to the data context (including selection)
     *  called from testimate.setDataset()
     */
    registerForCaseChanges: async function (iName) {
        if (this.caseChangeSubscriberIndex) {        //  zero is a valid index... :P but it should be the "get"
            codapInterface.off(this.caseChangeSubscriberIndex);    //  blank that subscription.
        }

        const sResource = `dataContextChangeNotice[${iName}]`;
        //  const sResource = `dataContext[${iName}].case`;
        try {
            this.caseChangeSubscriberIndex = codapInterface.on(
                'notify',
                sResource,
                data.handleCaseChangeNotice
            );
            console.log(`registered for case changes in ${iName}. Index ${this.caseChangeSubscriberIndex}`);
        } catch (msg) {
            console.log(`problem registering for case changes: ${msg}`);
        }

    },

    rerandomizeSource: async function (iDatasetName) {
        const theMessage = {
            "action": "update",
            "resource": `dataContext[${iDatasetName}]`,
            "values": {
                "rerandomize": true
            }
        }

        try {
            const result = await codapInterface.sendRequest(theMessage);
        } catch (msg) {
            alert(`problem rerandomizing dataset: ${iDatasetName} : ${msg}`);
        }
    },


    showLogisticGraph: async function (iFormula) {
        const graphObject = {
            type: "graph",
            name: testimate.constants.logisticGraphName,
            title: `P(${data.xAttData.name} = ${testimate.state.testParams.focusGroupX})`,
            dataContext: testimate.state.dataset.name,
            xAttributeName: data.yAttData.name,
            yAttributeName: testimate.constants.logisticGroupAttributeName,
        }

        const theMessage = {
            action: "create",
            resource: "component",
            values: graphObject,
        }

        try {
            const result = await codapInterface.sendRequest(theMessage);

        } catch (msg) {
            alert(`trouble showing the logistics graph ${msg}`);
        }
    },

    hideLogisticGraph: function () {
        const theMessage = {
            action: "delete",
            resource: `component[${testimate.constants.logisticGraphName}]`
        }

        const result = codapInterface.sendRequest(theMessage);

    },


    updateDatasetForLogisticGroups: async function (iValue, iAxis) {

        const theVariable = (iAxis === "X") ? data.xAttData.name : data.yAttData.name;
        const theFormula = `if (${theVariable} = "${iValue}", 1, 0)`;

        const newAttributeInfo = {
            name: testimate.constants.logisticGroupAttributeName,
            title: `${data.xAttData.name} = ${testimate.state.testParams.focusGroup}`,
            type: "numeric",
            description: `equal to 1 if ${data.xAttData.name} = ${testimate.state.testParams.focusGroup}, zero otherwise`,
            editable: false,
            formula: theFormula,
            hidden: true
        }
        const getInfoMessage = {
            action: "get",
            resource: `dataContext[${testimate.state.dataset.name}]`
        }

        //  figure out which collection the target attribute is in

        let useThisCollection = null;   //  name of the target collection

        try {
            const theInfo = await codapInterface.sendRequest(getInfoMessage);
            if (theInfo.success) {
                theInfo.values.collections.forEach(coll => {
                    coll.attrs.forEach(attr => {
                        if (attr.name === data.xAttData.name) {
                            useThisCollection = coll.name;
                        }
                    })
                })
            } else {
                alert(`request for dataset info failed in connect.js`);
            }

        } catch (msg) {
            alert(`could not get dataset info for [${testimate.state.dataset.name}] in connect.js...${msg}`)
        }


        const newAttMessage = {
            action: "create",
            resource: `dataContext[${testimate.state.dataset.name}].collection[${useThisCollection}].attribute`,
            values: newAttributeInfo
        }

        try {
            const newAttResult = await codapInterface.sendRequest(newAttMessage);

        } catch (msg) {
            alert(`connect.js updateDatasetForLogisticGroups: could not make new 0/1 attribute`);
        }
        return theFormula;      //      for diagnostics
    },

    /**
     *
     * @param iExtras   Extra attributes to be emitted, with values. These are typically the
     *      high-level attribtes when emitting hierarchically.
     * @returns {Promise<void>}
     */
    emitTestData: async function (iExtras = {}) {

        //  make a new output dataset if necessary
        //  todo: test for dataset existence (user may have deleted it)
        if (testimate.state.testID !== testimate.state.mostRecentEmittedTest) {
            await this.deleteOutputDataset();

            const theMessage = {
                action: "create",
                resource: "dataContext",
                values: this.constructEmitDatasetObject(),
            }
            try {
                const result = await codapInterface.sendRequest(theMessage);
                if (result.success) {
                    console.log(`success creating dataset, id=${result.values.id}`);
                } else {
                    console.log(`problem creating dataset`);
                }
            } catch (msg) {
                alert(`problem creating dataset: ${testimate.constants.emittedDatasetName}`);
            }
        }

        //  add any "extra" attributes

        await this.addExtraAttributesToEmittedDataset(iExtras);

        //  now emit one item...

        let theItemValues = Object.assign({}, iExtras);
        const theTest = testimate.theTest;
        const theConfig = theTest.theConfig;
        const emittedAttributeNames = theConfig.emitted.split(",");

        console.log(`   emitting a case with N = ${theTest.results.N}`);

        //  first list the standard attributes (parameters, mostly)

        let theStandardAttributes = {};
        theStandardAttributes[localize.getString("attributeNames.outcome")] = testimate.state.x.name;
        theStandardAttributes[localize.getString("attributeNames.predictor")] =
            (testimate.predictorExists()) ? testimate.state.y.name : "";
        theStandardAttributes[localize.getString("attributeNames.procedure")] = theConfig.name;

        Object.assign(theItemValues, theStandardAttributes);
/*
        Object.assign(
            theItemValues,
            {
                outcome: testimate.state.x.name,
                predictor: (testimate.predictorExists()) ? testimate.state.y.name : "",
                procedure: theConfig.name,
            }
        );
*/

        //  then add "results" values

        emittedAttributeNames.forEach(att => {
            const translatedAttributeName = localize.getString(`attributeNames.${att}`);

            if (theTest.results.hasOwnProperty(att)) {
                theItemValues[translatedAttributeName] = theTest.results[att]
            } else {    //  not a result? Maybe it's a parameter!!
                switch (att) {
                    case "sign":
                        theItemValues[translatedAttributeName] = testimate.state.testParams.theSidesOp;
                        break;
                    default:
                        theItemValues[translatedAttributeName] = testimate.state.testParams[att]
                        break;
                }

            }
        });


        const itemMessage = {
            action: 'create',
            resource: `dataContext[${testimate.constants.emittedDatasetName}].item`,
            values: theItemValues,       //      sending ONE item
        }
        const result = await codapInterface.sendRequest(itemMessage);
        if (result.success) {
            console.log(`success creating item id=${result.itemIDs[0]}`);
        } else {
            console.log(`problem creating item`);
        }
        this.makeTableAppear();
    },


    constructEmitDatasetObject: function () {
        let out = {};

        if (testimate.state.testID) {
            testimate.state.mostRecentEmittedTest = testimate.state.testID;
            const theConfig = Test.configs[testimate.state.testID];

            //  first construct the "attrs" array
            let theAttrs = [];
            theAttrs.push({
                //  name: "outcome",
                name: localize.getString("attributeNames.outcome"),
                title: localize.getString("attributeNames.outcome"),
                type: "categorical",
                description: localize.getString("attributeDescriptions.outcome")
            });
            if (testimate.predictorExists()) {
                theAttrs.push({
                    //  name: "predictor",
                    name: localize.getString("attributeNames.predictor"),
                    title: localize.getString("attributeNames.predictor"),
                    type: "categorical",
                    description: localize.getString("attributeDescriptions.predictor")
                });
            }
            theAttrs.push({
                //  name: "procedure",
                name: localize.getString("attributeNames.procedure"),
                title: localize.getString("attributeNames.procedure"),
                type: "categorical",
                description: localize.getString("attributeDescriptions.procedure")
            });
/*
            if (testimate.state.testParams.theSidesOp) {
                theAttrs.push({
                    name: "sign",
                    title: localize.getString("attributeNames.sign"),
                    type: "categorical",
                    description: localize.getString("attributeDescriptions.sign")
                });
            }
            theAttrs.push({
                name: "value",
                title: localize.getString("attributeNames.value"),
                type: "numeric",
                precision: 3,
                description: localize.getString("attributeDescriptions.value")
            });
*/

            theConfig.emitted.split(",").forEach(att => {
                //  const theName = att;
                const theName = localize.getString(`attributeNames.${att}`);
                const theTitle = localize.getString(`attributeNames.${att}`);
                const theTip = localize.getString(`attributeDescriptions.${att}`);
                theAttrs.push({
                    name: theName, title: theTitle, type: 'numeric',
                    description: theTip, precision: 4
                });
            });

            //  this will become the "values" item in the call
            out = {
                name: testimate.constants.emittedDatasetName,
                title:  localize.getString("datasetName"),         // testimate.constants.emittedDatasetName,
                collections: [{
                    name: localize.getString("datasetName"),        //  testimate.constants.emittedDatasetName,
                    title: localize.getString("datasetName"),
                    attrs: theAttrs
                }]
            };
        }
        return out;
    },

    addExtraAttributesToEmittedDataset : async function(iExtras) {
        let theAtts = [];
        let attList = [];

        Object.keys(iExtras).forEach( k => {
            const thisAtt = {
                name : k
            }
            theAtts.push(thisAtt);
            attList.push(k);
        })

        const theMessage = {
            action : "create",
            resource : `dataContext[${testimate.constants.emittedDatasetName}].collection[${testimate.constants.emittedDatasetName}].attribute`,
            values : theAtts
        }

        try {
            const result = await codapInterface.sendRequest(theMessage);
            if (result.success) {
                console.log(`added ${attList.join(', ')} to emit dataset`);
            }
        } catch (msg) {
            console.log(`trouble adding extra attributes to emitted dataset: ${msg}`);
        }

    },

    deleteOutputDataset: async function () {
        const theMessage = {
            action: "delete",
            resource: `dataContext[${testimate.constants.emittedDatasetName}]`,
        };

        try {
            const result = await codapInterface.sendRequest(theMessage);
        } catch (msg) {
            alert(`problem deleting dataset: ${testimate.constants.emittedDatasetName} : ${msg}`);
        }
    },

    makeTableAppear: function () {
        const caseTableObject = {
            type: `caseTable`,
            dataContext: testimate.constants.emittedDatasetName,
        };

        const message = {
            action: 'create',
            resource: `component`,
            values: caseTableObject,
        };

        codapInterface.sendRequest(message);
    },

    /**
     * Kludge to ensure that a dataset is reorg-able.
     *
     * @returns {Promise<void>}
     */
    allowReorg: async function () {
        const tMutabilityMessage = {
            "action": "update",
            "resource": "interactiveFrame",
            "values": {
                "preventBringToFront": false,
                "preventDataContextReorg": false
            }
        };

        codapInterface.sendRequest(tMutabilityMessage);
    },

    retrieveTopLevelCases: async function () {
        let out = {};

        const topCollection = data.sourceDatasetInfo.collections[0];

        const getTopCasesMessage = {
            "action": "get",
            resource: `dataContext[${data.sourceDatasetInfo.name}].collection[${topCollection.name}].caseFormulaSearch[true]`
        }
        try {
            const result = await codapInterface.sendRequest(getTopCasesMessage);
            if (result.success) {
                out = result.values;
            } else {
                console.log(`get top collection cases worked, but failed!`);
            }
        } catch (msg) {
            console.log(`trouble getting top collection cases: ${msg}`);
        }

        return out;
    },

    getSourceHierarchyInfo: function () {
        return {
            nCollections: this.sourceDatasetInfo.collections.length,
            topLevelCases: [
                "a", "b",
            ]
        }
    }


}