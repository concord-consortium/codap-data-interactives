/*
==========================================================================

 * Created by tim on 9/29/20.
 
 
 ==========================================================================
choosy in choosy

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


/* global codapInterface        */

const choosy = {
    dsID: null,             //  stores the dataset ID. To be saved.
    datasetList: null,     //  list of all datasets
    datasetInfo: {},       //  from the API, has name, collections, attribute names. Do not save!
    notificationsAreSetUp: null,    //  the name of the ds that we used to set up notifications
    theData: {},           //  case-ID-keyed object containing objects with non-formula values for all cases
    selectedCaseIDs: [],   //  the case IDs of the selected cases

    tagsAttributeName: "Tag",
    attributeGroupingMode : null,

    initialize: async function () {
        this.attributeGroupingMode = this.constants.kGroupAttributeByBatchMode;
        await connect.initialize();
        await this.setUpDatasets();

        //choosy.state = await codapInterface.getInteractiveState();

        /*
                if (Object.keys(choosy.state).length === 0 && choosy.state.constructor === Object) {
                    await codapInterface.updateInteractiveState(choosy.freshState);
                    console.log("choosy: getting a fresh state");
                }
        */

        document.getElementById("tag-attribute-name-text").value = choosy.tagsAttributeName;
        choosy_ui.update();
    },

    /**
     * Provides a fresh, empty version of `choosy.state`.
     * @returns {{dsID: null, datasetName: string}}
     */
    freshState: function () {
        console.log(`called choosy.freshState()`);
        return {
            dsID: null,
        };
    },

    setUpDatasets: async function () {
        try {
            console.log(`ds  choosy --- setUpDatasets --- try`);

            this.datasetList = await connect.getListOfDatasets();
            console.log(`ds      found ${this.datasetList.length} dataset(s)`);

            const tdsID = await choosy_ui.datasetMenu.install();
            await this.setTargetDatasetByID(tdsID);
        } catch (msg) {
            console.log(`ds  choosy --- setUpDatasets --- catch [${msg}]`);
        }
    },

    getNameOfCurrentDataset: function () {

        for (let i = 0; i < choosy.datasetList.length; i++) {
            const theSet = choosy.datasetList[i];
            if (Number(theSet.id) === Number(choosy.dsID)) {
                return theSet.name;
            }
        }
        return null;
    },

    setTargetDatasetByID: async function (iDsID) {

        if (iDsID) {
            if (iDsID !== choosy.dsID) {   //      there has been a change in dataset ID; either it's new or an actual change
                console.log(`ds      now looking at dataset ${iDsID} (choosy.setTargetDatasetByID())`);
                choosy.dsID = iDsID;
                await notify.setUpNotifications();
            } else {
                console.log(`ds      still looking at dataset ${iDsID} (choosy.setTargetDatasetByID())`);
            }
        } else {
            console.log(`?   called setTargetDatasetByID without a dataset ID`);
        }
    },

    loadCurrentData: async function () {
        const theCases = await connect.getAllCasesFrom(this.getNameOfCurrentDataset());
        this.theData = theCases;       //  fresh!
    },

    getLastCollectionName: function () {
        //  get the name of the last collection...
        const colls = this.datasetInfo.collections;
        const nCollections = colls.length;
        const lastCollName = colls[nCollections - 1].name;
        return lastCollName;
    },

    getChoosyAttributeAndCollectionByAttributeName: function (iName) {
        for (let i = 0; i < choosy.datasetInfo.collections.length; i++) {       //  loop over collections
            const coll = choosy.datasetInfo.collections[i];
            for (let j = 0; j < coll.attrs.length; j++) {       //  loop over attributes within collection
                const att = coll.attrs[j];
                if (att.name === iName) {
                    return {
                        att: att,
                        coll: coll
                    }
                }
            }
        }
        return null;
    },

    addAttributeToBatch: async function (iAttName, iBatchName) {
        await connect.setAttributeBatch(choosy.datasetInfo.name, iAttName, iBatchName);
        await choosy_ui.update();
    },

    /**
     * return the id for an attribute stripe, e.g., "att-Age"
     * @param iName
     * @returns {string}
     */
    attributeStripeID(iName) {
        return `att-${iName}`;
    },


    /**
     * Parse the attribute "batchs" indicated by bracketed batch names in the attribute descriptions.
     *
     * For example, `{work}Percent of people working in agriculture`
     * puts the attribute in a batch called "work" and then strips that tag from the description.
     *
     * Does this by adding a `batch` key to the attribute data --- which does not exist in CODAP.
     *
     * @param theInfo   the information on all collections and attributes
     */
    processDatasetInfoForAttributeBatchs: function (theInfo) {

        const whichWayToBatch = choosy_ui.getBatchingStrategy();

        for (let batch in choosy_ui.batchRecord) {
            let theRecord = choosy_ui.batchRecord[batch];
            theRecord["attrs"] = [];
        }

        theInfo.collections.forEach(coll => {
            coll.attrs.forEach(att => {
                let theDescription = att.description;
                let theBatch = choosy.constants.noBatchString;
                const leftB = theDescription.indexOf("{");
                const rightB = theDescription.indexOf("}");
                if (rightB > leftB) {
                    theBatch = theDescription.substring(leftB + 1, rightB);
                    att["description"] = theDescription.substring(rightB + 1);  //  strip the bracketed batch name from the description
                }

                //  if we're batching "byLevel", use the collection name as the batch name
                const theGroupName = (whichWayToBatch === "byLevel") ? coll.name : theBatch;   //  todo: really should be title

                //  change the `att` field to include fields for `batch` and `collection`
                att["batch"] = theGroupName
                att["collection"] = coll.name;  //  need this as part of the resource so we can change hidden

                //  this is where choosy_ui.batchRecord gets set!
                //  add an element to the object for this batch if it's not there already

                if (!choosy_ui.batchRecord[theGroupName]) {
                    choosy_ui.batchRecord[theGroupName] = {open: true, attrs: [], mode: ""};
                }
                choosy_ui.batchRecord[theGroupName].attrs.push(att.name);
                choosy_ui.batchRecord[theGroupName].mode = whichWayToBatch;
            })
        })
    },

    getTagAttributeName : function() {
        let tagAttributeName = document.getElementById("tag-attribute-name-text").value;

        if (!tagAttributeName) {
            tagAttributeName = choosy.constants.defaultTagName;
            document.getElementById("tag-attribute-name-text").value = tagAttributeName;
        }

        return tagAttributeName;
    },

    handlers: {

        changeSearchText: async function () {

        },

        changeTagMode: function () {
            choosy_ui.update();
        },

        applyTagToSelection: async function (iMode) {
            await connect.tagging.doSimpleTag(iMode);
        },

        applyBinaryTags: async function () {
            await connect.tagging.doBinaryTag();
        },

        applyRandomTags: async function () {
            await connect.tagging.doRandomTag();
        },

        clearAllTags: async function () {
            const theTagName = choosy.getTagAttributeName();
            await connect.tagging.clearAllTagsFrom(theTagName);
        },

        /**
         * Handles user press of a visibility button for a single attribute (not a batch)
         *
         * @param iAttName
         * @param iHidden       are we hiding this?
         * @returns {Promise<void>}
         */
        oneAttributeVisibilityButton: async function (iAttName, iHidden) {
            await connect.showHideAttribute(choosy.datasetInfo.name, iAttName, !iHidden);
            //  choosy_ui.update();   //  not needed here; called from the notification handler

        },

        batchVisibilityButton: async function (event) {

            event.stopPropagation();
            event.preventDefault();

            const theID = event.target.id;
            const theType = theID.substring(0, 4);
            const theBatchName = theID.substring(5);
            const toHide = theType === "hide";

            console.log(`${toHide ? "Hiding" : "Showing"} all attributes in [${theBatchName}]`);

            let theAttNames = [];

            choosy.datasetInfo.collections.forEach(coll => {
                coll.attrs.forEach(att => {
                    if (att.batch === theBatchName) {
                        theAttNames.push(att.name);    //  collect all these names
                    }
                })
            })
            const goodAttributes = await connect.showHideAttributeList(choosy.datasetInfo.name, theAttNames, toHide);
            //  choosy.updateAttributes(goodAttributes);
            //          choosy_ui.update    //  not needed here; called from the notification handler
        },

        toggleAttributeGroupingMode: function() {
            const newMode = (choosy.attributeGroupingMode === choosy.constants.kGroupAttributeByBatchMode) ?
                choosy.constants.kGroupAttributeByLevelMode : choosy.constants.kGroupAttributeByBatchMode;

            choosy.attributeGroupingMode = newMode;
            choosy_ui.update();
        },

        toggleDetail: function (event) {
            const theBatchName = event.target.id.substring(8);
            choosy_ui.recordCurrentOpenDetailStates();
            console.log(`batch toggle! ${theBatchName}`);
        },

        //  todo: decide if we really need this
        handleSelectionChangeFromCODAP: async function () {
            choosy.selectedCaseIDs = await connect.tagging.getCODAPSelectedCaseIDs();
            console.log(`    ${choosy.selectedCaseIDs.length} selected case(s)`);
            choosy_ui.update();
        },

    },

    utilities: {
        stringFractionDecimalOrPercentToNumber: function (iString) {
            let out = {theNumber: 0, theString: '0'};
            let theNumber = 0;
            let theString = "";

            const wherePercent = iString.indexOf("%");
            const whereSlash = iString.indexOf("/");
            if (wherePercent !== -1) {
                const thePercentage = parseFloat(iString.substring(0, wherePercent));
                theString = `${thePercentage}%`;
                theNumber = thePercentage / 100.0;
            } else if (whereSlash !== -1) {
                const beforeSlash = iString.substring(0, whereSlash);
                const afterSlash = iString.substring(whereSlash + 1);
                const theNumerator = parseFloat(beforeSlash);
                const theDenominator = parseFloat(afterSlash);
                theNumber = theNumerator / theDenominator;
                theString = `${theNumerator}/${theDenominator}`;
            } else {
                theNumber = parseFloat(iString);
                theString = `${theNumber}`;
            }

            if (!isNaN(theNumber)) {
                return {theNumber: theNumber, theString: theString};
            } else {
                return {theNumber: 0, theString: ""};
            }
        },
    },

    constants: {
        version: '2021k',
        datasetSummaryEL: 'summaryInfo',
        selectionStatusElementID: 'selection-status',
        tagValueElementID: "tag-value-input",
        tagValueSelectedElementID: "tag-value-selected",
        tagValueNotSelectedElementID: "tag-value-not-selected",
        tagValueGroupAElementID: "tag-value-group-A",
        tagValueGroupBElementID: "tag-value-group-B",
        tagPercentageElementID: "tag-percentage",
        noBatchString: "--",
        kGroupAttributeByBatchMode : "byBatch",
        kGroupAttributeByLevelMode : "byLevel",
        defaultTagName : "Tag",
    }
}