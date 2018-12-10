/*
==========================================================================

 * Created by tim on 6/12/18.
 
 
 ==========================================================================
timerConnect in plugins

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


timer.connect = {

    initialize: async function () {
        try {
            await codapInterface.init(this.iFrameDescriptor, null);
            await pluginHelper.initDataSet(this.timerDataContextSetupObject);

            //  restore the state if possible
            //  timer.state = codapInterface.getInteractiveState();
            //  then possibly get a fresh state here is the object is empty; see fish, e.g., for code

            console.log('CODAP connection init complete');
        }
        catch (msg) {
            console.log('Problem initializing the connection to CODAP: ' + msg);
        }


    },

    emitTimerItems: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        try {
            const res = await pluginHelper.createItems(iValues, timer.constants.kTimerDataSetName);
            console.log("Resolving emitTimerItems with " + JSON.stringify(res));
        }
        catch (msg) {
            console.log("Problem emitting timer items using iValues = " + JSON.stringify(iValues));
            console.log(msg);
        }
    },

    iFrameDescriptor: {
        version: timer.constants.version,
        name: 'timer',
        title: 'Timer',
        dimensions: {width: 200, height: 122},
        preventDataContextReorg: false              //  todo: figure out why this seems not to work!
    },

    timerDataContextSetupObject: {
        name: timer.constants.kTimerDataSetName,
        title: timer.constants.kTimerDataSetTitle,
        description: 'timing data',
        collections: [
            {
                name: timer.constants.kTimerCollectionName,
                labels: {
                    singleCase: "moment",
                    pluralCase: "moments",
                    setOfCasesWithArticle: "a set of moments"
                },

                attrs: [ // note how this is an array of objects.
                    {name: "set", type: 'categorical', description: "group of data"},
                    {name: "seq", type: 'numeric', precision: 0, description: "sequence number"},
                    {name: "time", type: 'numeric', precision: 3, description: "seconds since start"},
                    {name: "dt", type: 'numeric', precision: 3, description: "seconds since last data"},
                    {name: "what", type: 'categorical', description: "what happened"},
                    {name: "when", type: 'date', description: "date/time of event"}
                ]
            }
        ]
    },

};