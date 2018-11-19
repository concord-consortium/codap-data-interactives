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


  /**
   * Create a new data set (data context) using the input object
   * @param iDataSetDescription  the object that describes the data set. See the API documentation.
   * @returns {Promise}   which, when resolved, means that the data set exists
   */
  initDataSet: function (iDataSetDescription) {
    return new Promise( function( resolve, reject ) {
      var tDataContextResourceString = 'dataContext[' + iDataSetDescription.name + ']';
      var tMessage = { action: 'get', resource: tDataContextResourceString };

      //  if the data set already exists, we will not ask CODAP to create one. So we check...
      var tAlreadyExistsPromise = codapInterface.sendRequest(tMessage);

      tAlreadyExistsPromise.then(
        //  iValue is the result of the resolved "get dataContext" call
        function( iValue ) {
          if (iValue.success) {
            console.log("dataContext[" + iDataSetDescription.name + "] already exists");
            resolve( iValue );
          } else {
            //  the data set did not exist. (Since get dataContext returned success = false)
            console.log("Creating dataContext[" + iDataSetDescription.name + "]" );
            tMessage = {
              action: 'create',
              resource: 'dataContext',
              values: iDataSetDescription
            };
            codapInterface.sendRequest(tMessage).then(
              //  iValue is the result of the resolved "create dataContext" call.
              function( iValue ) {
                resolve( iValue );
              }
            );
          }
        }
      ).catch (function (msg) {
        console.log('warning in pluginHelper.initDataSet: ' + msg);
        reject( msg );
      });
    });
  },

  /**
   * Create new data items (broader than cases; see the documentation for the API)
   * Notes: (1) this refers only to the data context, not to any collections. Right? Has to.
   * (2) notice how the values array does not have a "values" key inside it as with createCases.
   *
   * @param iValuesArray  the array (or not) of objects, each of which will be an item. The keys are attribute names.
   * @param iDataContextName  the name of the data set (or "data context").
   */
  createItems : function(iValuesArray, iDataContextName, iCallback) {
      return new Promise( function(resolve, reject) {
          iValuesArray = pluginHelper.arrayify( iValuesArray );

          var tResourceString = iDataContextName ? "dataContext[" + iDataContextName + "].item" : "item";

          var tMessage = {
              action : 'create',
              resource : tResourceString,
              values : iValuesArray
          };

          var tCreateItemsPromise = codapInterface.sendRequest(tMessage);
          resolve( tCreateItemsPromise );
      })
  },

  createCases : function(iValues, iCollection, iDataContext, iCallback) {
      iValues = pluginHelper.arrayify( iValues );
      console.log("DO NOT CALL pluginHelper.createCases YET!!");
  },

  /**
   *
   * @param IDs   array of case IDs to be selected
   * @param iDataContextName  name of the data context in which these things live. OK if absent.
   * @returns {Promise}
   */
  selectCasesByIDs: function (IDs, iDataContextName) {
    return new Promise( function( resolve, reject ) {
      IDs = pluginHelper.arrayify( IDs );

      var tResourceString = "selectionList";

      if (typeof iDataContextName !== 'undefined') {
        tResourceString = 'dataContext[' + iDataContextName + '].' + tResourceString;
      }

      var tMessage = {
        action: 'create',
        resource: tResourceString,
        values: IDs
      };

      var tSelectCasesPromise = codapInterface.sendRequest(tMessage);
      resolve( tSelectCasesPromise );
    })
  },

  getCaseValuesByCaseID: function (iCaseID, iDataContext) {
    return new Promise(function (resolve, reject) {
      var tMessage = {
        action: 'get',
        resource: "dataContext["
        + iDataContext + "].caseByID["
        + iCaseID + "]"
      };

      codapInterface.sendRequest(tMessage).then(
        function (iResult) {
          if (iResult.success) {
            var tCaseValues = iResult.values.case.values;
            resolve(tCaseValues);
          }
        }
      )
    })
  },

  /**
   * Change the input to an array if it is not one!
   * @param iValuesArray  the thing which might be an array
   * @returns {*} if it was not an array, a single-item array with the thing. Otherwise, the array.
   */
  arrayify : function( iValuesArray ) {
    if (iValuesArray && !Array.isArray(iValuesArray)) {
      iValuesArray = [iValuesArray];
    }
    return iValuesArray;
  }

}