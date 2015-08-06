// ==========================================================================
// Project:   TPI
// Copyright: ©2014, Concord Consortium, Inc.
// ==========================================================================

/**
 * @fileoverview Defines TPI component to be embedded in DG to import tab-delimited text.
 * @author bfinzer@concord.org (William Finzer)
 * @preserve (c) 2014, Concord Consortium, Inc.
 */

$(document).ready(function () {

  /* When csv file is chosen... */
  $('#csvFile').on('change', function () {
    TPI.readFile('#csvFile', 'csvText', TPI.processCSV);
  });

  /* When cbk file is chosen... */
  $('#cbkFile').on('change', function () {
    TPI.readFile('#cbkFile', 'cbkText', TPI.processCBK);
  });

  TPI.init();

  TPI.setImportState();
});

var TPI = {

  codapPhone: null,

  csvText: null,
  csvLineSep: null,
  csvIndices: null,
  csvAttrs: null,

  cbkText: null,
  cbkParentAttrDescriptions: null,
  cbkChildAttrDescriptions: null,
  cbkCodes: null,

  running: false,

  init: function() {
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function() {}, "codap-game", window.parent);
    this.initTPIAsGame(); // No callback needed because when we're done we just wait for user
  },

  setImportState: function() {
    if(this.csvText && this.cbkText) {
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
      // Normalize the line endings to \r
      this_[iProp] = this.result.replace(/(\r\n|\n|\r)/gm,"\r");
      iDisplayFunc.apply( this_);
      TPI.setImportState();
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

  getCSVLineAsArray: function( iIndex) {
    var tLine = this.csvText.substring( this.csvIndices[iIndex] + 1, this.csvIndices[iIndex + 1]);
    return tLine.trim().split(',');
  },

  determineLineSep: function( iText) {
    var tSep;
    if(iText.indexOf("\n\r") >= 0)
      tSep = "\n\r";
    else if(iText.indexOf("\n") >= 0)
      tSep = "\n";
    else
      tSep = "\r";
    return tSep;
  },

  processCSV: function() {
    var tPos,
        tLine;
    this.csvLineSep = this.determineLineSep(this.csvText);
    this.csvIndices = [0];
    for (tPos = this.csvText.indexOf(this.csvLineSep); tPos != -1; tPos = this.csvText.indexOf(this.csvLineSep, tPos + 1)) {
      this.csvIndices.push(tPos);
    }
    tLine = this.csvText.substring(this.csvIndices[0], this.csvIndices[1]);
    this.csvAttrs = tLine.trim().split(',');
    $('#csvDisplay').text( this.csvAttrs);
    $('#numPersons').text(this.csvIndices.length - 2);  // 2 because there is (always?) an empty line after attributes
  },

  processCBK: function() {

    function emptyLine( iIndex) {
      return tCbk[ iIndex].trim() === '';
    }

    var constructColorMaps = function() {
      // Go through each of the attribute descriptions, making a color map for those that appear in cbkCodes.

      var constructMap = function( iDesc) {
        var tCodes = this.cbkCodes[ iDesc.name];
        if( !tCodes)
          return;

        iDesc.colormap = {};
        iDesc.blockDisplayOfEmptyCategories = true;
        this.forEachProperty( tCodes, function( iKey, iValue) {
          if( iValue !== '')
            iDesc.colormap[iValue] = randomColor();
        });
      }.bind( this);

      this.cbkParentAttrDescriptions.forEach( function( iDesc) {
        constructMap( iDesc);
      });
      this.cbkChildAttrDescriptions.forEach( function( iDesc) {
        constructMap( iDesc);
      });
    }.bind( this);

    var tSep = this.determineLineSep( this.cbkText),
        tCbk = this.cbkText.split(tSep),
        tVarsIndex = null;

    // It may be that the line sep character occupies position 0 of all or some lines
/*
    tCbk.forEach( function( iLine, iIndex) {
      tCbk[iIndex] = iLine.trim();
    });
*/

    // Determine where the description of variables begins
    tCbk.some(function( iLine, iIndex) {
      if( iLine.indexOf('Microdata Variables') === 0) {
        tVarsIndex = iIndex;
        return true;
      }
      else
        return false;
    });

    if( tVarsIndex === null) {
      alert('MicrodataVariables not found in codebook');
      return;
    }

    // Process the variable descriptions and stash them in the right array
    this.cbkParentAttrDescriptions = [];
    this.cbkChildAttrDescriptions = [];
    var tVarAttrsIndex = ++tVarsIndex,
        tVarIndex = tVarsIndex + 1,
        tVarAttrs = tCbk[tVarAttrsIndex].trim().split('\t');
    while( !emptyLine( tVarIndex)) {
      var tDescLine = tCbk[tVarIndex].trim().split('\t'),
          tRawDesc = {},
          tAttrDesc;
      tDescLine.forEach( function( iValue, iIndex) {
        tRawDesc[tVarAttrs[iIndex]] = iValue;
      });
      tAttrDesc = { name: tRawDesc.Mnemonic, description: tRawDesc.Label, decimals: tRawDesc['Implied Decimals']};
      var tArray = (tRawDesc['Record Type'] === 'H') ? this.cbkParentAttrDescriptions : this.cbkChildAttrDescriptions;
      tArray.push(tAttrDesc);
      tVarIndex++;
    }

    // Make a separate hash for the codes. (We don't use the descriptions because that would prevent their
    // use in defining the collections
    this.cbkCodes = {};
    var kStartSectionKey = 'codes and categories:',
        kVarsToIgnore = ['SAMPLE', 'YEAR'],
        kConvertToEmptyString = ['Not reported/missing', 'Unknown', 'NIU (not in universe)', 'Unknown/missing', 'UNKNOWN'],
        kAge = 'AGE',
        tLineIndex = tVarIndex + 1;
    while( tLineIndex < tCbk.length) {
      if( tCbk[tLineIndex].indexOf(kStartSectionKey) >= 0) {
        var tIdent = tCbk[tLineIndex].match(/([\w]+)/)[0];
        if( kVarsToIgnore.indexOf(tIdent) < 0) {
          var tIsAge = (tIdent === kAge);
          this.cbkCodes[tIdent] = {};
          tLineIndex++
          while( (tCbk[tLineIndex] && tCbk[tLineIndex].indexOf( kStartSectionKey) < 0) && (tLineIndex < tCbk.length)) {
            var tKeyValue = tCbk[ tLineIndex].split('\t');
            if( (tKeyValue.length >= 2) && tKeyValue[1] !== '') {
              if( kConvertToEmptyString.indexOf( tKeyValue[1]) >= 0)
                tKeyValue[1] = '';
              if( !tIsAge || (tKeyValue[1] === ''))
                this.cbkCodes[ tIdent][tKeyValue[0]] = tKeyValue[1];
            }
            tLineIndex++;
          }
        }
        else {
          tLineIndex++;
        }
      }
      else {
        tLineIndex++;
      }
    }

    constructColorMaps();

    // Give feedback about attributes
    $('#cbkHouseholdDisplay').text( this.cbkParentAttrDescriptions.length + ' parent attributes');
    $('#cbkPersonDisplay').text( this.cbkChildAttrDescriptions.length + ' child attributes');

  },

  /**
   * 1. Go through the csv text to determine the indices of the beginnings of households. This will be true
   *    whenever the PERNUM value is 1.
   * 2. Create the parent and child collections
   * 3. Choose households at random, and, for each household, extract all the persons in each one.
   */
  doImport: function() {

    /**
     *  We're sampling without replacement, so we keep track of the chosen households in a hash.
     */
    var chooseHousehold = function() {
      var tResult;
      do {
        tResult = Math.floor(Math.random() * (tHouseholdIndices.length));
      } while ( tChosenHouseholds[tResult]);
      tChosenHouseholds[tResult] = true;
      return tResult;
    };

    var indexForAttribute = function( iMnemonic) {
      var tIndex;
      this.csvAttrs.some( function( iAttrName, iIndex) {
        if( iAttrName == iMnemonic) {
          tIndex = iIndex;
          return true;
        }
        else
          return false;
      });
      return tIndex;
    }.bind(this);

    var getValue = function( iIndex, iDescriptions) {
      var tValues = [],
          tCSVValues = this.getCSVLineAsArray( iIndex);
      iDescriptions.forEach( function(iDesc) {
        var tValueIndex = indexForAttribute( iDesc.name),
            tValue = tCSVValues[tValueIndex],
            tConversion = this.cbkCodes[iDesc.name],
            tConverted = (tConversion && (tConversion[ tValue] !== undefined)) ? tConversion[ tValue] : tValue;
        tValues.push( tConverted);
      }.bind(this));
      return tValues;
    }.bind(this);

    var getHouseholdValues = function (iIndex) {
      return getValue( tHouseholdIndices[ iIndex], this.cbkParentAttrDescriptions);
    }.bind( this);

    var getPersonValues = function (iIndex) {
      return getValue( iIndex, this.cbkChildAttrDescriptions);
    }.bind( this);

    var createParentCollection = function() {
      this.createCollection( tParentName, tParentCaseName, this.cbkParentAttrDescriptions, 'contents',
                            createChildCollection);
    }.bind( this);

    var createChildCollection = function() {
      this.createCollection( tChildName, tChildCaseName, this.cbkChildAttrDescriptions, '', setupHousehold);
    }.bind( this);

    var setupHousehold = function() {
      this.createCollection( tChildName, tChildCaseName, this.cbkChildAttrDescriptions, '', generateHouseholds);
    }.bind( this);

    var generateHouseholds = function() {

      var openHousehold = function() {
        tChosenHouseholdIndex = chooseHousehold();
        tStartingPersonIndex = tHouseholdIndices[tChosenHouseholdIndex];
        tPersonIndex = tStartingPersonIndex;
        tValuesArrays = [];
        this.openCase( tParentName, getHouseholdValues( tChosenHouseholdIndex), fillHousehold);
      }.bind( this);

      var fillHousehold = function( iResult) {
        if( !iResult.success) {
          alert('Failure in openCase.');
          return;
        }
        tParentID = iResult;
        do {
          var tValues = getPersonValues( tPersonIndex),
              tFinished = (tPersonIndex > tStartingPersonIndex) &&
                  (tValues[tPerNumIndex] == 1);
          if( !tFinished) {
            tValuesArrays.push( tValues);
            tPersonIndex++;
            tNumPeople++;
          }
        } while(!tFinished && tPersonIndex < this.csvIndices.length);
        this.createCases( tChildName, tValuesArrays, tParentID.caseID, closeHousehold);
      }.bind( this);

      var closeHousehold = function() {
        this.closeCase(tParentName, [], tParentID.caseID, goOnToNextHousehold);
      }.bind( this);

      var goOnToNextHousehold = function() {
        tNumHouseholds++;
        tNumHouseholdsToChoose--;
        if( (tNumHouseholdsToChoose > 0) && this.running) {
          openHousehold();  // Begin the loop again
          if( tNumHouseholds % 10 === 0)
            report();
        }
        else {
          endImport();
        }
      }.bind( this);

      function report() {
        $('#results').text('Imported ' + tNumHouseholds + ' households and ' + tNumPeople + ' people')
      }

      var endImport = function() {
        this.running = false;
        report();
        $('#btnText').text('Import');
      }.bind( this);

      // Beginning of generateHouseholds
      var tChosenHouseholdIndex,
          tStartingPersonIndex,
          tPersonIndex,
          tValuesArrays,
          tParentID;
      openHousehold();
    }.bind(this);

    // Start of doImport
    $('#btnText').text('Cancel');
    if( this.running) { // the user pressed cancel
      this.running = false;
      return;
    }
    this.running = true;

    var tNumHouseholdsToChoose = $('#numHouseholds').val(),
        tParentName = $('#parentName').val(),
        tParentCaseName = $('#parentCaseName').val(),
        tChildName = $('#childName').val(),
        tChildCaseName = $('#childCaseName').val(),
        tHouseholdIndices = [],
        tRawPerNumIndex = this.csvAttrs.indexOf('PERNUM'),
        tPerNumIndex, i,
        tNumHouseholds = 0,
        tNumPeople = 0,
        tChosenHouseholds = {};

    // Run through the csv looking for the lines that begin households
    this.cbkChildAttrDescriptions.some( function(iDesc, iIndex) {
      if( iDesc.name == 'PERNUM') {
        tPerNumIndex = iIndex;
        return true;
      }
      else
        return false;
    });
    for( i = 2; i < this.csvIndices.length; i++) {
      var tValues = this.getCSVLineAsArray( i);
      if( tValues[tRawPerNumIndex] == 1)
        tHouseholdIndices.push( i);
    }

    tNumHouseholdsToChoose = Math.min( tNumHouseholdsToChoose, tHouseholdIndices.length);
    createParentCollection();
  },

  initTPIAsGame: function( iCallback) {
    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: "TerraPop Microdata Interactive",
        dimensions: { width: 750, height: 450 },
        contextType: 'DG.DataContext',
        version: "1.3"
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
