/*
==========================================================================

 * Created by tim on 11/21/17.
 
 
 ==========================================================================
xenoConnect in xeno

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


var xenoConnect = {

    casesToProcess: 0,
    casesProcessed: [],

    /**
     * Set up connections with CODAP including subscribing to updateCases notifications
     *
     * @param iCallback
     */
    initialize: function (iCallback) {
        codapInterface.init(this.iFrameDescriptor, null).then(
            function () {
                pluginHelper.initDataSet(this.xenoDataContextSetupObject);

                //  restore the state if possible

                xeno.state = codapInterface.getInteractiveState();

                if (jQuery.isEmptyObject(xeno.state)) {
                    codapInterface.updateInteractiveState(xeno.freshState);
                    console.log("xeno: getting a fresh state");
                }
                console.log("xeno.state is " + JSON.stringify(xeno.state));   //  .length + " chars");

                //  receive notifications about updateCases (done by the tree!)

                codapInterface.on(
                    'notify',
                    'dataContextChangeNotice[' + xeno.constants.xenoDataSetName + ']',
                    'updateCases',
                    xenoConnect.processUpdateCaseNotification.bind(this)
                );
                iCallback();
            }.bind(this)
        );
    },

    /**
     * When the tree updates cases by setting the value for diagnosis,
     * we take those, evaluate the diagnoses, and set the value for analysis accordingly.
     *
     * @param iCommand
     * @param iCallback
     */
    processUpdateCaseNotification: function (iCommand, iCallback) {
        var tAutoResultDisplay = document.getElementById("autoResultDisplay");

        var theOperation = iCommand.values.operation;
        var theResult = iCommand.values.result;
        if (theResult.success) {
            console.log("xenoConnect <" + theOperation + "> case IDs: [" + (theResult.caseIDs?theResult.caseIDs.join():'') + "]");
            var theCases = theResult.cases;
            theCases && theCases.forEach(function (bigCase) {
                var c = bigCase.values;

                xeno.scoreFromPerformance(c.analysis);
                xenoConnect.casesToProcess -= 1;
                xenoConnect.casesProcessed.push(c);

            })
        } else {
            console.log(" *** xenoConnect fail on notification read ***");
        }

        //  the tree has diagnosed all of our new cases...

        if (xenoConnect.casesToProcess === 0) {
            var nCases = xenoConnect.casesProcessed.length;
            var tDisplay = nCases + ((nCases === 1) ? " case processed. " : " cases processed. ");
            var tNumberCorrect = 0;
            var tNumberUndiagnosed = 0;

            this.casesProcessed.forEach(function (c) {
                tNumberCorrect += (c.analysis[0] === "T") ? 1 : 0;
                tNumberUndiagnosed += (c.analysis[0] === "?") ? 1 : 0;
            });

            tDisplay += tNumberCorrect + " correct. ";

            if (tNumberCorrect === xenoConnect.casesProcessed.length) {
                tDisplay += "Great job! ";
            }

            if (tNumberUndiagnosed > 0) {
                tDisplay += "<br>Your tree left " + tNumberUndiagnosed
                    + ((tNumberUndiagnosed === 1) ? " case undiagnosed." : " cases undiagnosed.");

            }

            tAutoResultDisplay.innerHTML = tDisplay;
        }
    },


    /**
     * Tell CODAP to make items.
     * @param iValues   An array of objects containing the keys and values
     * corresponding to attributes and values of the new cases.
     */
    createXenoItems: function (iValues) {

        this.casesToProcess = iValues.length;
        this.casesProcessed = [];

        iValues = pluginHelper.arrayify(iValues);
        console.log("Xeno ... createXenoItems with " + iValues.length + " case(s)");
        pluginHelper.createItems(
            iValues,
            xeno.constants.xenoDataSetName
        ); // no callback.
    },

    iFrameDescriptor: {
        version: xeno.constants.version,
        name: 'xeno',
        title: 'Arbor Xenobiological Services',
        dimensions: {width: 512, height: 180},
        preventDataContextReorg: false
    },

    xenoDataContextSetupObject : {},

};
