// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
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
// This is a very simple Data Interactive Plugin to CODAP.
// It is intended to demonstrate the basics of writing a plugin.
// On button press it creates or a set of random numbers and sends it to CODAP.
// It saves an index of the sample set in its state, so that, if the document
// is saved and restored, it will assign a new value, not one that has already
// been used.
//
var kDataSetName = 'Random_Numbers';
var kAppName = "Random Numbers";
// The following is the initial structure of the data set that the plugin will
// refer to. It will look for it at startup and create it if not found.
var kDataSetTemplate = {
    name: "{name}",
    collections: [  // There are two collections: a parent and a child
      {
        name: 'sample_set',
        // The parent collection has just one attribute
        attrs: [ {name: "sample_set_index", type: 'categorical'}],
      },
      {
        name: 'numbers',
        parent: 'sample_set',
        labels: {
          pluralCase: "numbers",
          setOfCasesWithArticle: "a sample"
        },
        // The child collection also has just one attribute
        attrs: [{name: "number", type: 'numeric', precision: 1}]
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

function warnUser(message) {
  var messageArea = document.getElementById('message-area');
  messageArea.innerHTML = '<span style="color:red">' + message + '</span>';
}

function warnNotEmbeddedInCODAP() {
  warnUser( 'This page is meant to run inside of <a href="http://codap.concord.org">CODAP</a>.' +
      ' E.g., like <a target="_blank" href="http://codap.concord.org/releases/latest?di='
      + window.location.href + '">this</a>.');
}

/**
 * Reads the form and returns the number of samples requested for a set.
 * @returns {number} Expects a positive integer.
 */
function getRequestedSampleCount() {
  var tHowMany = document.forms.form1.howMany.value.trim();
  return Number(tHowMany);
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
function generateNumbers () {
  // verify we are in CODAP
  if(codapInterface.getConnectionState() !== 'active') {
    // we assume the connection should have been made by the time a button is
    // pressed.
    warnNotEmbeddedInCODAP();
    return;
  }

  // if a sample number has not yet been initialized, do so now.
  if (myState.sampleNumber === undefined || myState.sampleNumber === null) {
    myState.sampleNumber = 0;
  }

  var samples = [];
  var howMany = getRequestedSampleCount();
  var sampleIndex = ++myState.sampleNumber;
  var ix;

  // if we do not have a valid sample count, complain
  if (isNaN(howMany) || howMany <= 0) {
    warnUser("Please enter a positive integer.");
    return;
  }

  // generate the samples and format as items.
  for (ix = 0; ix < howMany; ix += 1) {
    samples.push({sample_set_index: sampleIndex, number: Math.floor(Math.random() * 100) + 1});
  }

  // send them
  sendItems(kDataSetName, samples);

  // open a case table if one is not already open
  guaranteeCaseTable();
}

//
// Here we set up our relationship with CODAP
//
// Initialize the codapInterface: we tell it our name, dimensions, version...
codapInterface.init({
  name: kDataSetName,
  title: kAppName,
  dimensions: {width: 300, height: 150},
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
