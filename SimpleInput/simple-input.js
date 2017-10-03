// ==========================================================================
//  
//  Author:   wfinzer
//
//  Copyright (c) 2017 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================

//
// This is a trivial plugin to CODAP.
// It does nothing more than provide an input for the user to type in an integer
// from 0 to 8. After the user submits a valid integer, the form will not accept more input.
//
var kDataSetName = 'Trials',
    kAppName = "Simple Input";
// The following is the initial structure of the data set that the plugin will
// refer to. It will look for it at startup and create it if not found.
var kDataSetTemplate = {
    name: "{name}",
    collections: [  // There is just one collection
      {
        name: 'Trials',
        attrs: [ {name: "Number of Successes"}],
      }
    ]
  };

/**
 * myState is a local copy of interactive state.
 *
 *  It is sent to CODAP on demand and restored from CODAP at initialization time.
 *
 *  @type {Object}
 */
var myState;

function tellUser(message, color) {
  color = color || 'red';
  var messageArea = document.getElementById('message-area');
  messageArea.innerHTML = '<span style="color:' + color + '">' + message + '</span>';
}

function warnNotEmbeddedInCODAP() {
  tellUser( 'This page is meant to run inside of <a href="http://codap.concord.org">CODAP</a>.' +
      ' E.g., like <a target="_blank" href="http://codap.concord.org/releases/latest?di='
      + window.location.href + '">this</a>.');
}

/**
 * Reads the form and returns the number input value.
 * @returns {number} Expects an integer.
 */
function getInput() {
  var tInput = document.getElementById('integerInput').value.trim();
  if(tInput !== '')
    tInput = Number(tInput);
  return tInput;
}

/**
 * Sends a request to CODAP for a named data context (data set)
 * @param name {string}
 * @return {Promise} of a DataContext definition.
 */
function requestDataContext(name) {
  return codapInterface.sendRequest({
    action:'get',
    resource: 'dataContext[' + name + ']'
  });
}

/**
 * Sends a request to CODAP to create a Data set.
 * @param name {String}
 * @param template {Object}
 * @return {Promise} Result indicating success or failure.
 */
function requestCreateDataSet(name, template){
  var dataSetDef = Object.assign({}, template);
  dataSetDef.name = name;
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'dataContext',
    values: dataSetDef
  })
}

/**
 * Make a case table if there is not one already. We assume there is only one
 * case table in the CODAP document.
 *
 * @return {Promise}
 */
function guaranteeCaseTable() {
  return new Promise(function (resolve, reject) {
    codapInterface.sendRequest({
      action: 'get',
      resource: 'componentList'
    })
    .then (function (iResult) {
      if (iResult.success) {
        // look for a case table in the list of components.
        if (iResult.values && iResult.values.some(function (component) {
              return component.type === 'caseTable'
            })) {
          resolve(iResult);
        } else {
          codapInterface.sendRequest({action: 'create', resource: 'component', values: {
            type: 'caseTable',
            dataContext: kDataSetName
          }}).then(function (result) {
            resolve(result);
          });
        }
      } else {
        reject('api error');
      }
    })
  });
}

/**
 * Sends an array of 'items' to CODAP.
 * @param dataSetName
 * @param items
 * @return {Promise} of status of request.
 */
function sendItems(dataSetName, items) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'dataContext[' + dataSetName + '].item',
    values: items
  });
}

/**
 * Generate a set of random numbers and send them to CODAP.
 * This is the function invoked from a button press.
 *
 */
function processInput () {
  // verify we are in CODAP
  if(codapInterface.getConnectionState() !== 'active') {
    // we assume the connection should have been made by the time a button is
    // pressed.
    warnNotEmbeddedInCODAP();
    return;
  }

  // if a sample number has not yet been initialized, do so now.
  if (myState.didProperlyInput === undefined || myState.didProperlyInput === null) {
    myState.didProperlyInput = false;
  }

  var input = getInput();

  // if we do not have an input, complain
  if (input === '') {
    tellUser("Please enter an integer between 0 and 8.");
    return;
  }
  else if (input < 0 || input > 8) {
    tellUser("Must be at least zero and no greater than 8.");
    return;
  }
  else if (input !== Math.round(input)) {
    tellUser("Integers only please.");
    return;
  }

  myState.didProperlyInput = true;

  var item = { "Number of Successes": input };

  // send it
  sendItems(kDataSetName, [item]);

  tellUser("Thanks, that's all folks!", 'green');

  disableInput();
}

function disableInput() {
  document.getElementById('integerInput').disabled = true;
  document.getElementById('submitButton').disabled = true;
}

//
// Here we set up our relationship with CODAP
//
// Initialize the codapInterface: we tell it our name, dimensions, version...
codapInterface.init({
  name: kDataSetName,
  title: kAppName,
  dimensions: {width: 250, height: 120},
  version: '0.1'
}).then(function (iResult) {
  // get interactive state so we can save the sample set index.
  myState = codapInterface.getInteractiveState();
  // Determine if CODAP already has the Data Context we need.
  return requestDataContext(kDataSetName);
}).then(function (iResult) {
  // if we did not find a data set, make one
  if (iResult && !iResult.success) {
    // If not not found, create it.
    return requestCreateDataSet(kDataSetName, kDataSetTemplate);
  } else {
    // else we are fine as we are, so return a resolved promise.
    return Promise.resolve(iResult);
  }
}).catch(function (msg) {
  // handle errors
  console.log(msg);
});

document.getElementById('integerInput').onkeypress = function( event) {
  if(event.code === 'Enter')
    processInput();
  else
    tellUser("");
};