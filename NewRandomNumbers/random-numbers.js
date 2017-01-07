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

// initialize the codapInterface
codapInterface.init({
    name: 'RandomNumbers',
    title: 'Random Numbers',
    dimensions: {width: 300, height: 150},
    version: '0.1'
  }).then(function () {
    // Determine if CODAP already has the Data Context we need.
    // If not, create it.
    return codapInterface.sendRequest({
        action:'get',
        resource: 'dataContext[Random_Numbers]'
      }, function (iResult, iRequest) {
        if (iResult && !iResult.success) {
          codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: {
              name: "Random_Numbers",
              collections: [  // There are two collections: a parent and a child
                {
                  name: 'samples',
                  // The parent collection has just one attribute
                  attrs: [ {name: "sample", type: 'categorical'}],
                  childAttrName: "sample"
                },
                {
                  name: 'numbers',
                  parent: 'samples',
                  labels: {
                    pluralCase: "numbers",
                    setOfCasesWithArticle: "a sample"
                  },
                  // The child collection also has just one attribute
                  attrs: [{name: "number", type: 'numeric', precision: 1}]
                }
              ]
            }});
        }
      }
    );
  });

// This object handles the semantics of the page. It generates random numbers.
var RandomNumbers = {
  state: codapInterface.getInteractiveState(),

  // Here is the function that is triggered when the user presses the button
  generateNumbers: function () {
    var messageArea = document.getElementById('message-area');

    // we assume the connection should have been made by the time a button is
    // pressed.
    if(codapInterface.connectionState !== 'active') {
      messageArea.innerHTML = '<span style="color:red">This page is meant to ' +
          'run inside of <a href="http://codap.concord.org">CODAP</a>.' +
          ' E.g., like <a href="http://codap.concord.org/releases/latest?di='
          + window.location.href + '">this</a>.</span>';
      return;
    }

    // This function is called once the parent case is opened
    var doSample = function( iResult ) {
      var tID = iResult.values[0].id,
          tHowMany = document.forms.form1.howMany.value.trim(),

          addOneNumber = function() {
            if( tHowMany > 0) {
              var tRandom = Math.random() * 100 + 1; // Choose a random number between 1 and 100
              // Tell CODAP to create a case in the child collection
              codapInterface.sendRequest({
                action: 'create',
                resource: 'collection[numbers].case',
                values: {
                  parent: tID,
                  values: {number: tRandom}
                }
              }, addOneNumber);
              tHowMany--;
            }
          };

      addOneNumber(); // This starts an asynchronous recursion
    };

    // --- generateNumbers starts here ---

    // We keep track of the sampleNumber in interactiveState. If it doesn't exist
    // yet, create it.
    if (this.state.sampleNumber === undefined || this.state.sampleNumber === null) {
      this.state.sampleNumber = 0;
    }

    // increment sample number.
    this.state.sampleNumber++;

    // Tell CODAP to open a parent case and call doSample when done
    codapInterface.sendRequest( {
      action: 'create',
      resource: 'collection[samples].case',
      values: {values: {sample: this.state.sampleNumber}}
    }).then(doSample);
  }
};
