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

/* global $, codapHelper, console, iframePhone, alert */

/**
 * An "Analysis" is in charge of connecting an abstract analysis (a chart, a visualization)
 * to data contexts, collections, etc. in CODAP.
 *
 * @param iHost
 * @constructor
 */
var Analysis = function (iHost) {

    this.host = iHost;            //  the object that has invoked this analysis
    this.initialize();
};

Analysis.prototype.initialize = function () {
    this.dataContexts = [];
    this.currentDataContextName = "";

    this.collections = [];
    this.currentCollectionName = "";

    this.attributes = [];
    this.currentAttributeName = "";

    this.cases = [];
};

Analysis.prototype.refreshDataOnly = function () {
    this.cases = [];
    this.getStructureAndData();

};


Analysis.prototype.getStructureAndData = function () {
    //  this.initialize();

    //  function to get the list of data contexts

    var getListOfDataContexts = function () {
        var tArg = {action: "get", resource: "dataContextList"};
        return codapInterface.sendRequest(tArg);
    };

    //  function to deal with the data contexts

    var processDataContextList = function (iResult) {
        this.dataContexts = iResult.values;
        var tDataContextNames = TEEUtils.getListOfOneFieldInArrayOfObjects(this.dataContexts, "name");
        if (tDataContextNames.indexOf(this.currentDataContextName) < 0) {
            console.log("Data Context [" + this.currentDataContextName + "] not found in list of DCs");
            this.specifyCurrentDataContext(this.dataContexts[0].name);
        }
        this.host.gotDataContextList(this.dataContexts);
        var tArg = {action: "get", resource: "dataContext[" + this.currentDataContextName + "].collectionList"};
        return codapInterface.sendRequest(tArg);
    };

    //  function to process the list of collections

    var processCollectionList = function (iResult) {
        this.collections = iResult.values;
        var tCollectionNames = TEEUtils.getListOfOneFieldInArrayOfObjects(this.collections, "name");
        if (tCollectionNames.indexOf(this.currentCollectionName) < 0) {
            this.specifyCurrentCollection(this.collections[0].name);
        }
        this.host.gotCollectionList(this.collections);

        //  now get attribute list

        var tResource = "dataContext[" +
            this.currentDataContextName + "].collection[" +
            this.currentCollectionName + "].attributeList";
        var tArg = {action: "get", resource: tResource};
        console.log("Looking for attributes with " + tResource);

        return codapInterface.sendRequest(tArg);

    };

    //  function to process the list of attribute names and request the cases

    var processAttributeList = function (iResult) {
        this.attributes = iResult.values;       //  iResult.values;               //  this is an array of objects where name is the attribute name, title the title, etc.

        this.host.gotAttributeList(this.attributes);    //  also assigns a default dependent if necessary

        var tCompoundRequest = [];

        this.attributes.forEach(function (a) {
            var tResource = "dataContext[" + this.currentDataContextName + "].collection["
                + this.currentCollectionName + "].attribute[" + a.name + "]";
            var tOneRequest = {
                "action": "get",
                "resource": tResource
            }
            tCompoundRequest.push(tOneRequest);
        }.bind(this));

        if (tCompoundRequest.length > 0) {
            console.log("Sending a compound request to retrieve " + tCompoundRequest.length + " attributes");
            return codapInterface.sendRequest(tCompoundRequest);
        } else {
            console.log("Not sending any requests to retrieve attributes.");
        }

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

        //  now ask for the cases

        var tResource = "dataContext[" + this.currentDataContextName + "].collection[" + this.currentCollectionName + "].allCases";
        var tArg = {action: "get", resource: tResource};
        return codapInterface.sendRequest(tArg);
    };

    //  function to process THE CASES!

    var processCases = function (iResult) {
        return new Promise(function (resolve, reject) {
            if (iResult.success) {
                var tCases = [];

                iResult.values.cases.forEach(function (rawCase) {
                    tCases.push(rawCase.case);  //  note not rawCase.case.values as before. So we will need to get values. This is to preserve the id.
                });

                this.cases = tCases;
                console.log("Success reading in " + this.cases.length + " cases.");
                resolve(this.cases);      //  so processCases returns an array of cases. Sweet.
            } else {
                reject("Failed to get cases in Analysis.js");
            }
        }.bind(this));

    };


    //  THIS is what we actually do!

    return getListOfDataContexts()
        .then(processDataContextList.bind(this))    //  includes asking for list of collections
        .then(processCollectionList.bind(this))     //  includes asking for list of attributes
        .then(processAttributeList.bind(this))      //  includes asking for individual attributes
        .then(processIndividualAttributes.bind(this))   //      includes asking for the cases themselves
        .then(processCases.bind(this))      //  finishes getting all the cases
        ;
};

/**
 * Given that the structure exists, find the data in it.
 */
Analysis.prototype.getData = function () {

};

//  older from here out

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

Analysis.prototype.specifyCurrentCollection = function (iCollName) {
    this.currentCollectionName = iCollName;
    console.log("Analysis.specifyCurrentCollection: " + this.currentCollectionName);
};


/*
    Making <options> lists for menus
 */

Analysis.prototype.makeOptionsList = function (iList) {
    var optionsClauses = "";
    iList.forEach(
        function (thing) {
            optionsClauses += "<option value='" + thing.name + "'>" +
                thing.title + "</option>";
        }
    );
    return optionsClauses;
};


