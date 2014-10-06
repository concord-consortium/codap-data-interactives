// ==========================================================================
// Project:   Importer
// Copyright: ©2011 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Importer component to be embedded in DG to import tab-delimited text.
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2011 KCP Technologies, Inc.
 */

var Importer = {
  firstTime: true,
  kSampleID: null,
  kNumChildren: 0,
  kNotOpen:true,

  //return {
  //controller: window.parent.DG.currGameController,
  codapPhone: null,

  initImporterAsGame: function () {
    if (this.firstTime) {
      console.log('Importer: initGame: first time with codapPhone');

      this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function () {
      }, "codap-game", window.parent);

      this.codapPhone.call({
        action: 'initGame',
        args: {
          name: "Importer",
          dimensions: { width: 750, height: 450 },
          contextType: 'DG.DataContext',
          version: '2.0'
        }
      }, function(){
        console.log("Initializing");
        this.kNotOpen=true;
      });
      this.firstTime = false;
    } else {
      console.log('Importer: reset');
      this.codapPhone.call({
        action: 'reset'
      })
    }
  },

  createCollection: function (iName, iCaseName, iAttrsArray, iChildKey) {
    console.log('Importer: createCollection');
    this.codapPhone.call({
      action: 'createCollection',
      args: {
        name: iName,
        caseName: iCaseName,
        attrs: iAttrsArray,
        childAttrName: iChildKey
      }
    });
  },

  createChildCases: function (iCase, iChildKey, iCaseID, iParentName, iParentValuesArray, tIsArrayFormat, iNumParents, iSampleObject, sampleCounter) {
    console.log("In createChildCases");

    var valuesArrays = [];

    iCase[iChildKey].cases.forEach(function (iChildCase) {
      valuesArrays.push(tIsArrayFormat ? iChildCase
        : this.values(iChildCase));
      this.kNumChildren++;
    }.bind(this));

    this.createCases(iCase[iChildKey].collection_name, valuesArrays, iCaseID);//swapped out this.values(iChildCase) for valuesArrays

    // Close the parent case
    if (this.kNumChildren >= iCase[iChildKey].cases.length) {
      this.closeCase(iParentName, iParentValuesArray, iCaseID);
      this.kNumChildren = 0;
    }

    if (sampleCounter<=iNumParents){
      sampleCounter++;
      Importer.addNewParentCase(iSampleObject, iChildKey, sampleCounter, tIsArrayFormat);
    }
  },

  openCase: function (iCollectionName, iValuesArray, iCase, iChildKey, iNumParents, iSampleObject, sampleCounter, tIsArrayFormat) {
    console.log('Importer: openCase');
    this.codapPhone.call({
      action: 'openCase',
      args: {
        collection: iCollectionName,
        values: iValuesArray
      }
    }, function (result) {
      if (result.success) {
        this.kSampleID = result.caseID;
        console.log(this.kSampleID + " kSampleID in openCase");
        this.createChildCases(iCase, iChildKey, this.kSampleID, iCollectionName, iValuesArray, tIsArrayFormat, iNumParents, iSampleObject, sampleCounter);
      }
    }.bind(this));
  },

  createCases: function (iCollectionName, iValuesArrays, iParentID) {
    console.log('Importer: createCases');
    this.codapPhone.call({
      action: 'createCases',
      args: {
        collection: iCollectionName,
        values: iValuesArrays,
        parent: iParentID,
        log: false
      }
    });
  },

  closeCase: function (iCollectionName, iValuesArray, iCaseID) {
    console.log('Importer: closeCase');
    this.codapPhone.call({
      action: 'closeCase',
      args: {
        collection: iCollectionName,
        values: iValuesArray,
        caseID: iCaseID
      }
    });
  },

  addNewParentCase:function(iSampleObject, iChildKey, sampleCounter, tIsArrayFormat){
    if (this.kNotOpen) {
      var tValues = [],
          iCase=null,
          iNumParents=iSampleObject.cases.length;

      if (sampleCounter<iNumParents) {
        // Extract the values for the parent case, except for the array of child cases
        iCase = iSampleObject.cases[sampleCounter];
        Importer.forEachProperty(iCase, function (iKey, iValue) {
          if (iKey !== iChildKey) {
            if (typeof iValue === 'object') {
              iValue = JSON.stringify(iValue);
            }
            else {
              tValues.push(iValue);
            }
          }
        });

        this.openCase(iSampleObject.collection_name, tValues, iCase,iChildKey, iNumParents, iSampleObject, sampleCounter, tIsArrayFormat)
      }

     if (sampleCounter>iNumParents) {
       this.kNotOpen=false;
     }
    }
  },

  doImport: function () {
    var tText = document.getElementById("textToImport").value.trim();

    function updateReport(iReport) {
      var tDiv = document.getElementById('report');
      while (tDiv.childNodes.length)
        tDiv.removeChild(tDiv.childNodes[ 0]);

      tDiv.appendChild(document.createTextNode(iReport));
    }

    var importAsJSON = function (iObject) {
      var tParentName = iObject.collection_name,
        tParentCaseName = iObject.cases,
        tDescriptions = iObject.descriptions,
        tParentAttrsArray = [],
        tChildAttrsArray = [],
        tChildKey = '',
        tChildName = '',
        tChildCaseName = '',
        tFirstParentCase = iObject.cases ? iObject.cases[ 0] : [],
        tNumParents = 0,
        tNumChildren = 0,
        sampleCounter= 0,
        tIsArrayFormat = false;

      // Run through the properties of the first case gathering attribute names and the key to the child collection
      this.forEachProperty(tFirstParentCase, function (iKey, iValue) {
        var description;
        if ((typeof iValue === 'object') && iValue.collection_name) {
          tChildKey = iKey;
          tChildName = iValue.collection_name;
          tChildCaseName = iValue.cases;

          if (iValue.attributes) {
            tChildAttrsArray = iValue.attributes;
            tIsArrayFormat = true;
          }
          else {
            // Pull out the names of the child collection's attributes
            for (var tKey in iValue.cases[0]) {
              description = tDescriptions ? tDescriptions[ tKey] : "";

              tChildAttrsArray.push({ name: tKey,
                description: description});
            }
          }
        }
        else {
          description = tDescriptions ? tDescriptions[ iKey] : "";
          tParentAttrsArray.push({ name: iKey, description: description });
        }
      });

      this.createCollection(tParentName, tParentCaseName, tParentAttrsArray, tChildKey,tIsArrayFormat);

      this.createCollection(tChildName, tChildCaseName, tChildAttrsArray,tIsArrayFormat);

     // iObject.cases.forEach(function (iCase) {

        // Open the parent case

      this.addNewParentCase(iObject, sampleCounter, tChildKey, tIsArrayFormat);
       // Importer.openCase(tParentName, tValues, iCase, tChildKey);

        // Create each of the child cases
//        var valuesArrays = [];
//        iCase[ tChildKey].cases.forEach( function( iChildCase) {
//          valuesArrays.push( tIsArrayFormat ? iChildCase
//                                            : this_.values( iChildCase));
//          tNumChildren++;
//        });
//        this_.createCases( tChildName, valuesArrays, tOpenCaseResult.caseID);
//        // Close the parent case
//        this_.closeCase( tParentName, tValues, tOpenCaseResult.caseID);
//        tNumParents++;
//      });

        //updateReport( tNumParents + ' parent cases and ' + tNumChildren + ' child cases');

    }.bind(this);// importAsJSON

    var importAsSimpleText = function (iText) {
      var tRows = iText.split("\n"),
        tCollectionName = tRows.shift(),// Table Title
        tAttrNamesRow = tRows.shift(),// column headers
        tSep = (tAttrNamesRow.indexOf(",") === -1) ? "\t" : ",",
        tAttributeNames,
        tAttrsArray,
        tNumCases = 0,
        tParentName='Import,'
        sampleCounter= 0,
        iJSONObject;



      tAttributeNames = tAttrNamesRow.split(tSep);
      tAttrsArray = tAttributeNames.map(function (iName) {
        var tAttrObject = {};
        tAttrObject.name = iName;
        return tAttrObject;
      });

      //parent collection kludge
      this.createCollection('Import', 'parent', [
        { name: 'cases' }
      ], 'import');

      this.createCollection(tCollectionName, 'child', tAttrsArray);


      var valuesArrays = [];
      tRows.forEach( function( iRow) {
        if( iRow !== "") {
          valuesArrays.push( iRow.split(tSep));
          tNumCases++;
        }
      });

      iJSONObject = this.convertToJSON(tParentName, tCollectionName, tAttrNamesRow,valuesArrays, tAttrsArray, tAttributeNames);

      importAsJSON(iJSONObject);

      updateReport(tNumCases + ' cases');
    }.bind(this);   // importAsSimpleText

    // Begin doImport
    //this.initImporterAsGame();

    var tJSONObject = null;
    try {
      tJSONObject = JSON.parse(tText);
    }
    catch (e) {
      tJSONObject = null;
    }

    if (tJSONObject)
      importAsJSON(tJSONObject);
    else
      importAsSimpleText(tText);

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
  },

  /**
   Returns an array of values representing the property values of the object.
   The order of the returned elements is not specified by the standard.
   Returns an empty array for undefined or null objects.

   @param {Object} iObject   The object whose properties names should be returned
   @returns {Array of values}  Array of property values
   */
  values: function (iObject) {
    var tValues = [];
    this.forEachProperty(iObject, function (iKey, iValue) {
      tValues.push(iValue);
    });
    return tValues;
  },

  convertToJSON: function (iParentName, iCollectionName, iAttrNamesRow, iRows, headers, l1Attrs) {
    var ix,
        row,
        item,
        casesIndex = {},
        obj = {},
        cases=[],
        l1KeyIndex = l1Attrs.indexOf(l1Attrs[0]);

    obj.collection_name = iParentName;
    for (ix = 1; ix < iRows.length; ix += 1) {
      row = iRows[ix];
      item = casesIndex[row[l1KeyIndex]];
      if (item) {
        this.updateObj(item, iAttrNamesRow, row, l1KeyIndex)
      } else {
        item = this.makeObj(iAttrNamesRow, row, l1KeyIndex, iParentName);
        cases.push(item);
        casesIndex[row[l1KeyIndex]] = item;
      }
    }
    obj.cases = cases;
    return JSON.stringify(obj, null, '  ');
  },

  updateObj: function (item, fields, arr, primaryFields) {
    var ix;
    var primary = item;
    var secondary = {};
    for (ix = 0; ix < Math.min(fields.length, arr.length); ix += 1) {
      if (!(primaryFields.indexOf(fields[ix]) >= 0)) {
        secondary[fields[ix]] = arr[ix];
      }
    }
    primary.contents.cases.push(secondary);
    return primary;
  },

  makeObj: function (fields, iRow, primaryFields, iParentName) {
    var ix;
    var primary = {};
    var secondary = {};
    for (ix = 0; ix < Math.min(fields.length, iRow.length); ix += 1) {
      if (primaryFields.indexOf(fields[ix]) >= 0) {
        primary[fields[ix]] = iRow[ix];
      } else {
        secondary[fields[ix]] = iRow[ix];
      }
    }
    primary.contents = {collection_name: iParentName, cases: [secondary] };
    return primary;
  }

  //};
}

Importer.initImporterAsGame();