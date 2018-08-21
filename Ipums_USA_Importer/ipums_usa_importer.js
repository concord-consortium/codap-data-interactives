// ==========================================================================
//  
//  Author:   wfinzer
//
//  Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.
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
// This Data Interactive Plugin to CODAP provides a simple interface for
// importing IPUMS USA extracts in the form of an xml codebook and a fixed column dat file to CODAP.
//
var kDataSetName = 'Imported Peeps';
var kAppName = "IPUMS USA Extract Importer";
var kCollectionName = 'People';
var kSpecialNumeric = ['FAMSIZE', 'AGE']
// The following is the initial structure of the data set that the plugin will
// refer to. It will look for it at startup and create it if not found.

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
  warnUser('This page is meant to run inside of <a href="http://codap.concord.org">CODAP</a>.' +
      ' E.g., like <a target="_blank" href="http://codap.concord.org/releases/latest?di='
      + window.location.href + '">this</a>.');
}

$(document).ready(function () {

  /* When DAT file is chosen... */
  $('#datFile').on('change', function () {
    Ipums_Importer.readFile('#datFile', 'datText', Ipums_Importer.processDAT);
  });

  /* When cbk file is chosen... */
  $('#cbkFile').on('change', function () {
    Ipums_Importer.readFile('#cbkFile', 'cbkXML', Ipums_Importer.processCBK);
  });

  Ipums_Importer.init();

  Ipums_Importer.setImportState();
});

var Ipums_Importer = {

  codapPhone: null,

  datText: null,
  datLineLength: 0,
  datNumRecords: 0,

  cbkXML: null,
  cbkDescriptions: null,

  running: false,

  init: function () {
    codapInterface.init({
      title: kAppName,
      dimensions: {width: 450, height: 380},
      version: '0.1'
    }).then(function (iResult) {
      // get interactive state so we can save the sample set index.
      myState = codapInterface.getInteractiveState();
    }).catch(function (msg) {
      // handle errors
      console.log(msg);
    });

  },

  setImportState: function () {
    if (this.datText && this.cbkXML) {
      $('#import').removeAttr('disabled');
    }
    else {
      $('#import').attr('disabled', 'disabled');
    }
  },

  readFile: function (iFileElementID, iProp, iDisplayFunc) {
    var this_ = this;

    var handleError = function () {
      console.error("File read failed:" + tFile.name);
    };

    var handleSuccess = function () {
      console.log('Read success: ' + tFile.name);
      // Normalize the line endings to \r
      this_[iProp] = this.result.replace(/(\r\n|\n|\r)/gm, "\r");
      iDisplayFunc.apply(this_);
      Ipums_Importer.setImportState();
    };

    var tReader,
        tFile = $(iFileElementID)[0].files[0];
    if (tFile) {
      tReader = new FileReader();
      tReader.onabort = handleError;
      tReader.onerror = handleError;
      tReader.onload = handleSuccess;
      tReader.readAsText(tFile);
    }
  },

  processDAT: function () {
    var tDat = this.datText,
        tFirst4 = tDat.slice(0, 4),
        tLineLengthEst = tDat.indexOf(tFirst4, 4),
        tNumCases = Math.floor(tDat.length / tLineLengthEst);
    $('#numPersons').text(tNumCases + ' persons');
    this.datLineLength = tLineLengthEst;
    this.datNumRecords = tNumCases;
  },

  processCBK: function () {

    var tCbkObject = xml2js(this.cbkXML, {}),
        tDescriptions = tCbkObject.elements[1].elements[3],
        tAttrs = tDescriptions.elements.map(function (iDesc) {
          var tCats = {};
          iDesc.elements.forEach(function (iElement) {
            if (iElement.name === 'catgry') {
              tCats[iElement.elements[0].elements[0].text] = iElement.elements[1].elements[0].text;
            }
          });
          return {
            name: iDesc.attributes.name,
            startPos: iDesc.elements[0].attributes.StartPos,
            width: Number(iDesc.elements[0].attributes.width),
            labl: iDesc.elements[1].elements[0].text,
            description: iDesc.elements[2].elements[0].cdata,
            format: (Object.keys(tCats).length === 0 || kSpecialNumeric.indexOf(iDesc.attributes.name) >= 0) ?
                'numeric' : 'categorical',
            categories: tCats
          }
        });

    // Give feedback about attributes
    $('#cbkDisplay').text(tAttrs.length + ' attributes');
    this.cbkDescriptions = tAttrs;
  },

  /**
   * 1. Go through the csv text to determine the indices of the beginnings of households. This will be true
   *    whenever the PERNUM value is 1.
   * 2. Create the parent and child collections
   * 3. Choose households at random, and, for each household, extract all the persons in each one.
   */
  doImport: function () {

    // Start of doImport
    $('#btnText').text('Cancel');
    if (this.running) { // the user pressed cancel
      this.running = false;
      return;
    }
    this.running = true;

    var createDataSet = function (iName, iAttrs) {
          return codapInterface.sendRequest({
            "action": "create",
            "resource": "dataContext",
            "values": {
              "name": iName,
              "collections": [{
                "name": "People",
                "labels": {
                  "singleCase": "person",
                  "pluralCase": "people"
                },
                "attrs": iAttrs
              }]
            }
          })
        }.bind(this),

        createCases = function () {
          var tNumPeople = $('#numToChoose').val(),
              tValues = [],
              tPerNum = 0,
              tDataOffset = 0,
              tDataLength = this.datText.length,
              tRandChoice;
          while( tPerNum < tNumPeople) {
            var tCase = {}, tValue;
            tRandChoice = Math.floor( Math.random() * this.datNumRecords);
            tDataOffset = tRandChoice * this.datLineLength;
            this.cbkDescriptions.forEach( function( iDesc) {
              tValue = this.datText.slice( tDataOffset, tDataOffset + iDesc.width);
              if( iDesc.format === 'categorical') {
                tValue = iDesc.categories[tValue];
              }
              else if( Number(tValue) === 9999999)
                tValue = '';
              tCase[iDesc.name] = tValue;
              tDataOffset += iDesc.width;
            }.bind( this));
            tValues.push( { values: tCase });
            tPerNum++;
          }

          return codapInterface.sendRequest({
            "action": "create",
            "resource": "collection[" + kCollectionName + "].case",
            "values": tValues
          })
        }.bind(this);

    var tDataSetName = $('#datasetName').val(),
        tAttrs = this.cbkDescriptions.map(function (iDesc) {
          return {
            name: iDesc.name,
            description: iDesc.description,
            type: iDesc.format
          };
        });

    createDataSet(tDataSetName, tAttrs).then(function (iResult) {
      if (iResult.success) {
        createCases().then(function (iResult) {
          $('#btnText').text('Create Dataset');
          this.cbkXML = null;
          this.datText = null;
          this.setImportState();
        }.bind( this));
      }
    }.bind( this));
  }

};
