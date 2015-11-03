// ==========================================================================
//                          GeoJSONImporter
//
//  A button view that allows user to close a component view.
//
//  Author:   William Finzer
//
//  Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.
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

$(document).ready(function () {

  /* When geoJSON file is chosen... */
  $('#geoJSONFile').on('change', function () {
    GeoJSONImporter.readFile('#geoJSONFile', 'geoJSONText', GeoJSONImporter.processGeoJSON);
  });

  GeoJSONImporter.init();

  GeoJSONImporter.setImportState();
});

var GeoJSONImporter = {

  codapPhone: null,

  collectionID: null,

  geoJSONText: null,
  geoJSONObject: null,
  attributes: null,

  kParentCollectionName: 'Boundaries',
  kParentCaseName: 'Area',

  running: false,

  init: function() {
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function() {}, "codap-game", window.parent);
    this.initGeoJSONImporterAsGame(); // No callback needed because when we're done we just wait for user

    this.attributes = [];
  },

  setImportState: function() {
    if(this.geoJSONObject) {
      $('#import').removeAttr('disabled');
    }
    else {
      $('#import').attr('disabled', 'disabled');
    }
  },

  readFile: function( iFileElementID, iProp, iDisplayFunc) {
    var this_ = this;

    var handleError = function() {
      console.error("File read failed:" + tFile.name);
    };

    var handleSuccess = function() {
      console.log('Read success: ' + tFile.name);
      this_[iProp] = this.result;
      iDisplayFunc.apply( this_);
      GeoJSONImporter.setImportState();
    };

    var tReader,
        tFile = $(iFileElementID)[0].files[0];
    if (tFile) {
      tReader = new FileReader();
      tReader.onabort = handleError;
      tReader.onerror = handleError;
      tReader.onload = handleSuccess;
      tReader.readAsText( tFile);
    }
  },

  processGeoJSON: function() {
    try {
      this.geoJSONObject = JSON.parse(this.geoJSONText);
    }
    catch(iError) {
      window.alert( iError);
    }
    this.geoJSONText = '';  // Free up memory
    this.attributes.push( {
      name: 'id', description: 'Country abbreviation'
    });
    this.forEachProperty( this.geoJSONObject.features[0].properties, function( iProp) {
      this.attributes.push( { name: iProp });
    }.bind( this));
    this.attributes.push( {
      name: 'Boundary', description: 'Country boundary'
    });
    $('#geoJSONDisplay').text( this.geoJSONObject.features.length + ' boundaries');
  },

  doImport: function() {

    var createParentCollection = function() {
      this.createCollection( this.kParentCollectionName, this.kParentCaseName, this.attributes, 'contents', addCases);
    }.bind( this);

    var addCases = function( iResult) {
      if( !iResult.success) {
        alert('Unable to create parent collection');
        return;
      }
      this.collectionID = iResult.collectionID;
      var tCasesArray = [];
      this.geoJSONObject.features.forEach( function( iFeature) {
        var tValues = [];
        this.forEachProperty( iFeature.properties, function( iProp, iValue) {
          tValues.push( iValue);
        }.bind( this));
        tValues.push( iFeature.id);
        tValues.push( JSON.stringify( iFeature.geometry));
        tCasesArray.push(tValues);
      }.bind( this));
      this.createCases( this.kParentCollectionName, tCasesArray, null /* no parent */, endImport);
    }.bind( this);

    function report() {
      $('#results').text('Import finished');
    }

    var endImport = function() {
      this.running = false;
      report();
      $('#btnText').text('Import');
    }.bind( this);

    // Start of doImport
    $('#btnText').text('Cancel');
    if( this.running) { // the user pressed cancel
      this.running = false;
      return;
    }
    this.running = true;

    createParentCollection();
  },

  initGeoJSONImporterAsGame: function( iCallback) {
    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: "GeoJSON Importer",
        dimensions: { width: 450, height: 200 },
        contextType: 'DG.DataContext',
        version: "1.0"
      }
    }, iCallback);
  },

  createCollection: function( iName, iCaseName, iAttrsArray, iChildKey, iCallback) {
    this.codapPhone.call({
      action: 'createCollection',
      args: {
        name: iName,
        caseName: iCaseName,
        attrs: iAttrsArray,
        childAttrName: iChildKey,
        collapseChildren: true
      }
    }, iCallback);
  },

  openCase: function( iCollectionName, iValuesArray, iCallback) {
    this.codapPhone.call({
      action: 'openCase',
      args: {
              collection: iCollectionName,
              values: iValuesArray
            }
    }, iCallback);
  },

  createCases: function( iCollectionName, iValuesArrays, iParentID, iCallback) {
    this.codapPhone.call({
      action: 'createCases',
      args: {
        collection: iCollectionName,
        values: iValuesArrays,
        parent: iParentID,
        log: false
      }
    }, iCallback);
  },

  closeCase: function( iCollectionName, iValuesArray, iCaseID, iCallback) {
    this.codapPhone.call({
      action: 'closeCase',
      args: {
              collection: iCollectionName,
              values: iValuesArray,
              caseID: iCaseID
            }
    }, iCallback);
  },

  /**
   Applies the specified function to each property of the specified object.
   The order in which the properties are visited is not specified by the standard.

   @param {Object} iObject   The object whose properties should be iterated
   */
  forEachProperty: function (iObject, iFunction) {
    if (!iObject) return;
    for (var tKey in iObject) {
      if (iObject.hasOwnProperty(tKey))
        iFunction(tKey, iObject[ tKey]);
    }
  }

};
