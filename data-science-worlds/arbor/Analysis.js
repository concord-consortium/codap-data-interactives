/**
 * Created by tim on 8/19/16.


 ==========================================================================
 analysis.js in data-science-games.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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

/* global $, codapHelper, console, iframePhone, alert, TEEUtils, codapInterface, sendRequest */

/**
 * An "Analysis" is in charge of connecting an abstract analysis (a chart, a visualization)
 * to data contexts, collections, etc. in CODAP.
 *
 * @param iHost
 * @constructor
 */
const Analysis = function (iHost) {

    this.host = iHost;            //  the object that has invoked this analysis
    this.initialize();
};

Analysis.prototype.initialize = function () {
    this.dataContexts = [];
    this.currentDataContextName = "";

    this.collections = [];  // array of objects with { name : 'people', etc }
    this.topCollectionName = "";
    this.bottomCollectionName = "";

    this.attributes = [];   //  array of objects like : {name : 'height', title : 'height'...}
    this.currentAttributeName = "";

    this.cases = [];

    this.excludedAttributeNames = ["diagnosis", "analysis", "source"];  //  for xeno.
};

Analysis.prototype.refreshDataOnly = function () {
    this.cases = [];
    this.getStructureAndData();

};


Analysis.prototype.getStructureAndData = async function () {
    //  this.initialize();

    //  function to get the list of data contexts

    const getListOfDataContexts = async function () {
        const tArg = {action: "get", resource: "dataContextList"};
        return codapInterface.sendRequest(tArg);
    };

    //  function to deal with the data contexts

    const processDataContextList = async function (iResult) {
        this.dataContexts = iResult.values;
        const tDataContextNames = TEEUtils.getListOfOneFieldInArrayOfObjects(this.dataContexts, "name");
        if (tDataContextNames.indexOf(this.currentDataContextName) < 0) {
            console.log("Data Context [" + this.currentDataContextName + "] not found in list of DCs");
            this.specifyCurrentDataContext(this.dataContexts[0].name);
        }
        this.host.gotDataContextList(this.dataContexts);
        //  const tArg = {action: "get", resource: "dataContext[" + this.currentDataContextName + "].collectionList"};
        const tArg = {action: "get", resource: "dataContext[" + this.currentDataContextName + "]"};
        return codapInterface.sendRequest(tArg);
    };

    /**
     * Process the CODAP get Data Context result to get all the attributes and the collections
     * @param iResult
     * @returns {Promise<void>}
     */
    const processDataContext = async function(iResult) {
        this.host.resetAttributeList();   //  set attsInBaum to []
        this.collections = iResult.values.collections;
        this.topCollectionName = this.collections[0].name;
        this.bottomCollectionName = this.collections[this.collections.length - 1].name;

        for (c of this.collections) {
            for (a of c.attrs) {
                if (this.excludedAttributeNames.indexOf(a.name) < 0) {     //  todo: cope with this kludge that special-cases "diagnosis" and "analysis"
                    this.host.gotOneAttribute(a);
                }
            }
        }
    };

    //  function to process the list of collections and set the name of the top and bottom collections

    //  todo: see if we need this any more...
    const processCollectionList = async function (iResult) {
        this.collections = iResult.values;
        this.topCollectionName = this.collections[0].name;
        this.bottomCollectionName = this.collections[this.collections.length - 1].name;

        let theTotalAttributeList = [];
        this.host.resetAttributeList();   //  set attsInBaum to []

        //  read sequentially though all collections so that the attribute names stay in order

        for (const c of this.collections) {
            const tResource = "dataContext[" + this.currentDataContextName + "].collection[" + c.name + "].attributeList";
            const tArg = {action: "get", resource: tResource};
            console.log("Looking for attributes in collection " + c.name);
            const result = await codapInterface.sendRequest(tArg);
            const theAtts = result.values;
            theTotalAttributeList = theTotalAttributeList.concat(theAtts);

            //  construct a compound request to get info on all attributes in this collection

            let tCompoundRequest = [];
            for (const a of theAtts) {
                const tResource = "dataContext[" + this.currentDataContextName + "].attribute[" + a.name + "]";
                const tOneRequest = {"action": "get", "resource": tResource};
                tCompoundRequest.push(tOneRequest);
            }

            //  process results of this compound request (array of attribute responses)

            if (tCompoundRequest.length > 0) {
                console.log("Sending a compound request to retrieve " + tCompoundRequest.length + " attributes");
                const attsResults = await codapInterface.sendRequest(tCompoundRequest);
                for (const ar of attsResults) {
                    if (ar.success) {
                        var tName = ar.values.name;
                        if (this.excludedAttributeNames.indexOf(tName) < 0) {     //  todo: cope with this kludge that special-cases "diagnosis" and "analysis"
                            this.host.gotOneAttribute(ar.values);
                        }
                    }
                }
            } else {
                console.log("Not sending any requests to retrieve attributes.");
            }
        }   //  end of loop over collections
        return theTotalAttributeList;
    };

    var processIndividualAttributes = function(iResult) {

        iResult.forEach( function(res) {
            if (res.success) {
                var tName = res.values.name;
                if (tName !== 'diagnosis' && tName !== 'analysis' && tName !== 'source') {     //  todo: cope with this kludge that special-cases "diagnosis" and "analysis"
                    this.host.gotOneAttribute(res.values);
                }
            }
        }.bind(this));

        //  now ask for the ITEMS (formerly, cases)

        var tResource = "dataContext[" + this.currentDataContextName + "].itemSearch[*]";
        var tArg = {action: "get", resource: tResource};
        return codapInterface.sendRequest(tArg);
    };

    //  function to process THE CASES!

/*
    var processCases = function (iResult) {
        return new Promise(function (resolve, reject) {
            if (iResult.success) {
                var tCases = [];

                iResult.values.forEach( (rawCase) => {
                    tCases.push(rawCase);  //  note not rawCase.case.values as before. So we will need to get values. This is to preserve the id.
                });

                this.cases = tCases;
                console.log("Success reading in " + this.cases.length + " cases.");
                resolve(this.cases);      //  so processCases returns an array of cases. Sweet.
            } else {
                reject("Failed to get cases in Analysis.js");
            }
        }.bind(this));

    };

*/
    //  THIS is what we actually do!

    await getListOfDataContexts()
        .then(processDataContextList.bind(this))    //  includes asking for list of collections
        .then(processDataContext.bind(this));     //  includes getting list of attributes
        //  .then(processCollectionList.bind(this));     //  includes asking for list of attributes
    this.cases = await this.getCasesRecursivelyFromCollection(this.topCollectionName);
    console.log("Success reading in " + this.cases.length + " cases.");

    /*
            .then(processAttributeList.bind(this))      //  includes asking for individual attributes
            .then(processIndividualAttributes.bind(this))   //      includes asking for the cases themselves
            .then(processCases.bind(this))      //  finishes getting all the cases
    */
};

Analysis.prototype.getCasesRecursivelyFromCollection = async function(iCollectionName) {
    let out = [];   //  this will hold the eventual cases
    //  get all case IDs for this collection

    const rGetCaseIDs = "dataContext[" + this.currentDataContextName + "].collection[" +
        iCollectionName + "].caseSearch[*]";
    const oCases = await codapInterface.sendRequest({action:"get", resource: rGetCaseIDs});

    for (const c of oCases.values) {
        out = out.concat(await this.getCasesWithChildrenRecursivelyByID(c.id));
    }
    return out;
};

/**
 *
 * @param iParentID     the CASE ID of the topmost case; calls itself to get children recursively
 * @returns {Promise<Array>} a flattened  array of case objects {id : 42, values : {height:6, weight:12...}}
 */
Analysis.prototype.getCasesWithChildrenRecursivelyByID = async function(iParentID) {
    let out = [];

    //  find all my children's IDs
    const rGetCaseByID = "dataContext[" + this.currentDataContextName + "].caseByID[" + iParentID + "]";
    const oParentCase = await codapInterface.sendRequest({action:"get", resource: rGetCaseByID});
    const parentValues = oParentCase.values.case.values;
    const kidIDArray = oParentCase.values.case.children;

    if (kidIDArray.length > 0) {

        //  loop over all children by ID
        for (const kID of kidIDArray) {
            const theChildren = await this.getCasesWithChildrenRecursivelyByID(kID);   //  array of all cases below
            for (const c of theChildren) {
                const tCaseValues = Object.assign({}, parentValues, c.values);
                out.push({id: kID, values: tCaseValues});
            }
        }
    } else {
        out = [{id : iParentID, values : parentValues}];
    }

    return out;
};



/**
 * Given that the structure exists, find the data in it.
 */
Analysis.prototype.getData = function () {

};

//  older from here out

/**
 * Given a data context name (possibly new), set up the tree to read that data.
 * Importantly, includes registering our interest in changes (new cases) in that dataset.
 * @param iDCName
 */
Analysis.prototype.specifyCurrentDataContext = function (iDCName) {

    if (iDCName === this.currentDataContextName) {  //  not a new specification!
        console.log("Analysis.specifyCurrentDataContext: no change from " + this.currentDataContextName);

    } else {
        console.log("Analysis.specifyCurrentDataContext: " + iDCName + " instead of " + this.currentDataContextName);
        this.currentDataContextName = iDCName;

        codapInterface.on(
            'notify',
            'dataContextChangeNotice[' + this.currentDataContextName + ']',
            'createCases',
            arbor.newCases.newCasesInData
        );
    }

};


/*
    Making <options> lists for menus
 */

Analysis.prototype.makeOptionsList = function (iList) {
    let optionsClauses = "";
    iList.forEach(
        function (thing) {
            optionsClauses += "<option value='" + thing.name + "'>" +
                thing.title + "</option>";
        }
    );
    return optionsClauses;
};


