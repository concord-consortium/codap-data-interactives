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
      if (iSampleObject!=null)
        Importer.addNewParentCase(iSampleObject, iChildKey, sampleCounter, tIsArrayFormat);
    }
  },

  openJSONCase: function (iCollectionName, iValuesArray, iCase, iChildKey, iNumParents, iSampleObject, sampleCounter, tIsArrayFormat) {
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

  openCSVCase: function(iCollectionName, iParentValuesArray, iChildCollectionName, iChildValuesArray) {
    console.log('Importer: openCase');
    this.codapPhone.call({
      action: 'openCase',
      args: {
        collection: iCollectionName,
        values: iParentValuesArray
      }
    }, function (result) {
      if (result && result.success) {
        this.kSampleID = result.caseID;
        console.log(this.kSampleID + " kSampleID in openCase");
        this.createCases(iChildCollectionName, iChildValuesArray, this.kSampleID);
        this.closeCase(iCollectionName, iParentValuesArray, this.kSampleID);
      } else {
        console.log('Error in Importer.openCSVCase');
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

  addNewParentCase:function(iSampleObject, sampleCounter, iChildKey, tIsArrayFormat){
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

        this.openJSONCase(iSampleObject.collection_name, tValues, iCase,iChildKey, iNumParents, iSampleObject, sampleCounter, tIsArrayFormat)
      }

     if (sampleCounter>iNumParents) {
       this.kNotOpen=false;
     } else {
       sampleCounter++;
       this.addNewParentCase(iSampleObject,sampleCounter, iChildKey, tIsArrayFormat);}
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
        tParentCaseName = iObject.case_name,
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
          tChildCaseName = iValue.case_name;

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

      this.addNewParentCase(iObject, sampleCounter, tChildKey, tIsArrayFormat);


    }.bind(this);// importAsJSON

    // importAsSimpleText imports CSV files
    var importAsSimpleText = function (iText) {
      var tValuesArrays,
        tCollectionRow,
        tChildName = 'Collection',// Child Collection Name: should be first line of CSV
        tAttrNamesRow,// Column Header Names: should be second row
        tAttrsArray, // Column Headers reformatted for the AddCollection API
        tNumCases = 0,
        tParentName= 'Import',
        tChildKey='import',
        tParentAttrsArray = [{name:'cases'}];

      CSV.RELAXED=true;
      tValuesArrays = CSV.parse(iText);
      if (tValuesArrays && tValuesArrays.length >= 2) {
        tCollectionRow = tValuesArrays.shift();
        tAttrNamesRow = tValuesArrays[0];

        if (Array.isArray(tCollectionRow)) {
          // check if it looks like name row is missing
          if ((tAttrNamesRow.length === tCollectionRow.length) && (tAttrNamesRow.length > 1)) {
            tAttrNamesRow = tCollectionRow;
          } else {
            tChildName = tCollectionRow[0];
            tValuesArrays.shift();
          }
        } else {
          tChildName = tCollectionRow;
          tValuesArrays.shift();
        }

        // format Attribute Names for create collection api
        tAttrsArray = tAttrNamesRow.map(function (iName) {
          var tAttrObject = {};
          tAttrObject.name = iName.toString();
          return tAttrObject;
        });


        this.createCollection(tParentName, 'parent', tParentAttrsArray, tChildKey);

        this.createCollection(tChildName, 'child', tAttrsArray);

        this.openCSVCase(tParentName, ['pseudocase'], tChildName, tValuesArrays);
        tNumCases = tValuesArrays.length;
        updateReport(tNumCases + ' cases');
      }
    }.bind(this);   // importAsSimpleText

    // Begin doImport
    var tJSONObject = null;
    try {
      tJSONObject = JSON.parse(tText);
    }
    catch (e) {
      tJSONObject = null;
    }

    if (tJSONObject && typeof tJSONObject === 'object')
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
  }

};

Importer.initImporterAsGame();