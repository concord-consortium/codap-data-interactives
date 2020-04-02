/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
newCases in pluginsLocal

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

arbor.newCases = {

    checkForNewValuesInAttributes : function(c) {
        for (attName in c) {
            var tValue = c[attName];
            var tAttInBaum = arbor.attsInBaum[attName];

            //  have arbor look over ALL splits appropriate to this attribute,
            //  add the new value to any sets of categories (on the RHS??)
            //  OR should we redo the lists of categories on every refresh of the tree?
        }
    },

    /**
     * Event handler set in Analysis.specifyCurrentDataContext()
     * The data context we're looking at has a "create cases" event.
     *
     * @param iCommand
     * @param iCallback
     * @returns {PromiseLike<T>}
     */
    newCasesInData: function (iCommand, iCallback) {
        console.log('Arbor detected new data! ' + iCommand.resource);
        let newCases = [];

        if (iCommand.values.operation === "createCases") {
            var theIDs = iCommand.values.result.caseIDs;
            console.log("   ... and it's a createCases, " + theIDs.length + " case(s): " + theIDs.toString());

            const assembleAndIssueCompoundRequestForChangedItems = function () {
                let tCompoundRequest = [];

                //  loop over all IDs, constructing the compound request
                //  todo: if possible, get items rather than cases, by caseID

                theIDs.forEach(function (id) {
                    var tOneRequest = {
                        "action": "get",
                        "resource": "dataContext[" + arbor.analysis.currentDataContextName + "].caseByID[" + id + "]"
                    };
                    tCompoundRequest.push(tOneRequest);
                });

                console.log('Issuing compound request to get ' + tCompoundRequest.length + ' cases by case ID');
                return codapInterface.sendRequest(tCompoundRequest);
            };

            const processAndChangeItemsWithDiagnosesAndPrepareUpdateRequest = function (iResult) {

                /*
                At the moment, this is quite Arbor-sepcific.
                Specific named attributes: health, diagnosis, score, analysis
                 */
                let tCompoundRequest = [];
                let tString = "";

                console.log('Received cases from CODAP, ' + iResult.length + ' items');
                iResult.forEach(function (r) {
                    if (r.success) {
                        const id = r.values.case.id;
                        const c = r.values.case.values;

                        //  arbor.newCases.checkForNewValuesInAttributes(c);

                        //  Check to make sure that the case has a "source" === "auto" and that "diagnosis" does not exist.
                        //  THIS IS FRAGILE! :)

                        if (c.diagnosis) {
                            console.log('case ' + id + ' already diagnosed');
                        } else if (c.source !== 'auto') {

                        } else {
                            newCases.push(c);

                            //  get the tree's result for this case

                            const theTrace = arbor.state.tree.traceCaseInTree(c);
                            let theScore = 0;
                            let theAnalysis = "";
                            let theTerminalValue = "";

                            tString += id + theTrace.terminalNodeSign + " ";


                            if (theTrace.terminalNodeSign === arbor.constants.diagnosisNone) {
                                theTerminalValue = arbor.constants.diagnosisNone;    // "?"
                                theAnalysis = arbor.constants.diagnosisNone;
                            } else {
                                theTerminalValue = (theTrace.terminalNodeSign === arbor.constants.diagnosisPlus) ?
                                    arbor.state.dependentVariableSplit.leftLabel :
                                    arbor.state.dependentVariableSplit.rightLabel;

                                theAnalysis = (theTerminalValue === c.health ? "T" : "F");
                                theAnalysis += theTrace.terminalNodeSign === "+" ? "P" : "N";
                            }

                            //  The update request!
                            //  todo: fix so this doesn't depend on the collection name! (only the dataContext)

                            let tNewValues = {};
                            tNewValues[arbor.constants.diagnosisAttributeName] = theTerminalValue;
                            tNewValues[arbor.constants.analysisAttributeName] = theAnalysis;

                            const tOneRequest = {
                                "action" : "update",
                                "resource": "dataContext[" + arbor.analysis.currentDataContextName
                                + "].collection[" + arbor.analysis.bottomCollectionName
                                + "].caseByID[" + id + "]",
                                "values": {"values": tNewValues }
                            };
                            tCompoundRequest.push(tOneRequest);
                        }
                    } else {
                        console.log('One of the case-by-ID results from CODAP failed.')
                    }
                }.bind(this));

                console.log("Results of the request for cases: " + tString);

                if (tCompoundRequest.length > 0) {
                    console.log("Sending a compound request to update " + tCompoundRequest.length + " cases");
                    return codapInterface.sendRequest(tCompoundRequest); // todo: await??
                } else {
                    console.log("Not sending any requests to update these cases.");
                }

            };

            const processResultOfUpdateRequests = function (iResult) {
                if (iResult !== undefined) {
                    return new Promise(function (resolve, reject) {
                        iResult = pluginHelper.arrayify(iResult);
                        let allSucceeded = true;
                        iResult.forEach(function (r) {
                            if (!r.success) {
                                allSucceeded = false;
                            }
                        });

                        if (allSucceeded) {
                            console.log("Finished processing " + iResult.length + ' cases in arbor');
                            resolve(newCases);
                        } else {
                            reject('Problem updating cases with diagnoses');
                        }
                    })
                }
            };

            //  what we actually do...

            return assembleAndIssueCompoundRequestForChangedItems()
                .then(processAndChangeItemsWithDiagnosesAndPrepareUpdateRequest.bind(this))
                .then(processResultOfUpdateRequests.bind(this))
                .then( function() {
                    console.log("\n***** refreshing data after successful update in Arbor *****")
                    arbor.refreshBaum("data");
                });
        }
    }
};