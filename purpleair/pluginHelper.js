/**
 * Created by tim on 1/19/17.


 ==========================================================================
 pluginHelper.js in gamePrototypes.

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

var pluginHelper = {
    initDataSet: function (iDataSetDescription) {
        var tDataContextResourceString = 'dataContext[' + iDataSetDescription.name + ']';
        var tMessage = { action: 'get', resource: tDataContextResourceString };
        var tAlreadyExistsPromise = codapInterface.sendRequest( tMessage );
        var tDataContextExistsPromise = null;

        tAlreadyExistsPromise.then(
            function( iValue ) {
                if (iValue.success) {
                    console.log("Data context already exists");
                    tDataContextExistsPromise = Promise.resolve( iValue );
                } else {
                    console.log("Must create new data context");
                    tMessage = {
                        action: 'create',
                        resource: 'dataContext',
                        values: iDataSetDescription
                    };
                    tDataContextExistsPromise = codapInterface.sendRequest( tMessage );
                }
            }
        ).catch (function (msg) {
            console.log('warning in pluginHelper.initDataSet: ' + msg);
            tDataContextExistsPromise = Promise.reject( msg );
        });

        return tDataContextExistsPromise;
    },

    /**
     * Create new data items (broader than cases; see the documentation for the API)
     * Notes: (1) this refers only to the data context, not to any collections. Right? Has to.
     * (2) notice how the values array does not have a "values" key inside it as with createCases.
     *
     * @param iValuesArray  the array (or not) of objects, each of which will be an item. The keys are attribute names.
     * @param iDataContextName  the name of the data set (or "data context").
     */
    createItems : function(iValuesArray, iDataContextName) {
        if (iValuesArray && !Array.isArray(iValuesArray)) {
            iValuesArray = [iValuesArray];
        }

        //  now iValuesArray is an array, for sure

        var tResourceString = iDataContextName ? "dataContext[" + iDataContextName + "].item" : "item";

        var tMessage = {
            action : 'create',
            resource : tResourceString,
            values : iValuesArray
        };

        var tCreateItemsPromise = codapInterface.sendRequest( tMessage );
        return tCreateItemsPromise;
    },


}