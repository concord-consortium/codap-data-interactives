// ==========================================================================
// Project:   Sampler
// ==========================================================================

/**
 * @fileoverview Defines Sampler component to be embedded in DG to import tab-delimited text.
 * @author williamfinzer@gmail.com (William Finzer)
 */

var Sampler = {
  kGameName: 'Sampler',
  kChildKey: 'samples',
  kIDKey: 'sample',
  kSampleCollectionName: 'Samples',
  kPopMeanAttrName: 'popMean',
  kPopSDAttrName: 'popSD',
  kSampleID:null,
  kNumChildren:0,
  kTotalChildren:0,
  i:0, x:0,

  //controller: window.parent.DG && window.parent.DG.currGameController,
  codapPhone: null,
  initAccomplished: false,
  kNotOpen:false,
  parentCollectionCreated: false,
  childCollectionCreated: false,
  isGenerating: false,
  randGen: new KCPCommon.randomNormal(),

  numberOfSamples: 0,

  initSamplerAsGame: function () {
    console.log("In initSamplerAsGame");

    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(
      function(iCmd, iCallback) {iCallback();}, "codap-game", window.parent);

    this.codapPhone.call({
      action: 'initGame',
      args: {
        name: this.kGameName,
        dimensions: { width: 400, height: 300 },
        contextType: 'DG.DataContext'
      }
    }, function () {
      console.log("Initializing interactive");
      this.initAccomplished = true;
      this.kNotOpen=true;
    }.bind(this));
  },

  createCollection: function (iName, iAttrsArray, iChildKey, iDefaults) {
    console.log("In createCollection");
    this.codapPhone.call({
      action: 'createCollection',
      args: {
        name: iName,
        attrs: iAttrsArray,
        childAttrName: iChildKey,
        defaults: iDefaults
      }
    }, function () {
      console.log("End createCollection")
    });
  },

  createCases: function (iCollectionName, iValuesArrays, iParentID) {
    console.log("In createCases");
    this.codapPhone.call({
      action: 'createCase',
      args: {
        collection: iCollectionName,
        values: iValuesArrays,
        parent: iParentID,
        log: false
      }
    }, function () {
      console.log("end createCases")
    });
  },

  createChildCases: function(iCase, iChildKey, iCaseID, iParentName, iParentValuesArray, iNumParents, iSampleObject, sampleCounter){
    console.log("In createChildCases");

    var valuesArrays = [],
      kNumChildren= 0;


    iCase[ iChildKey].cases.forEach(function (iChildCase) {
      valuesArrays.push(this.values(iChildCase));
      this.createCases(iCase[iChildKey].collection_name,this.values(iChildCase), iCaseID);
      this.kNumChildren++;
    }.bind(this));

    if (this.kNumChildren>=iCase[iChildKey].cases.length) {
      this.closeCase(iParentName, iParentValuesArray, iCaseID);
      this.kTotalChildren = this.kTotalChildren + this.kNumChildren;
      this.kNumChildren = 0;
    }
    if (sampleCounter<=iNumParents){
      sampleCounter++;
      Sampler.addNewParentCase(iSampleObject, iChildKey,sampleCounter);
    }
  },

  openCase: function (iCollectionName, iValuesArray, iCase, sChildKey, iNumParents, iSampleObject, sampleCounter) {
    console.log("In openCase");
    this.codapPhone.call({ /*was returning everything in this function*/
        action: 'openCase',
        args: {
          collection: iCollectionName,
          values: iValuesArray
        }
      }, function (result) {
        this.kSampleID = result.caseID;
        console.log(this.kSampleID + " kSampleID in openCase.");
        if (this.kSampleID !== null) {
          this.createChildCases(iCase, sChildKey, this.kSampleID, iCollectionName, iValuesArray, iNumParents,iSampleObject, sampleCounter);
        }
      }.bind(this)
    )
  },

  closeCase: function (iCollectionName, iValuesArray, iCaseID) {
    console.log("In closeCase");
    this.codapPhone.call({
      action: 'closeCase',
      args: {
        collection: iCollectionName,
        values: iValuesArray,
        caseID: iCaseID
      }
    }, function () {
      console.log("closeCase")
    });
  },

  addNewParentCase:function(iSampleObject, iChildKey, sampleCounter){

    if (this.kNotOpen) {
      var tValues = [],
        iCase = null,

        iNumParents=iSampleObject.cases.length;

      if (sampleCounter < iNumParents) {
        // Extract the values for the parent case, except for the array of child cases
        iCase = iSampleObject.cases[sampleCounter];
        this.forEachProperty(iCase, function (iKey, iValue) {
          if (iKey !== iChildKey)
            tValues.push(iValue);
        });

        // Open the parent case
        this.openCase(iSampleObject.collection_name, tValues, iCase, iChildKey, iNumParents, iSampleObject, sampleCounter);
      }

      if (sampleCounter > iNumParents) {
        this.kNotOpen = false;
      }
    }
  },

  generateSamples: function () {
    var tPopName = document.forms.form1.popName.value.trim(),
      tAttrName = document.forms.form1.attrName.value.trim(),
      tPopMean = Number(document.forms.form1.popMean.value),
      tPopSD = Number(document.forms.form1.popSD.value),
      tSampleSize = Number(document.forms.form1.sampleSize.value),
      tNumSamples = Number(document.forms.form1.numSamples.value),
      tGen = this.randGen,
      tSampleObject;

    console.log("begin generateSamples");

    function updateReport(iReport) {
      var tDiv = document.getElementById('report');
      console.log("In updateReport: " + iReport);
      while (tDiv.childNodes.length)
        tDiv.removeChild(tDiv.childNodes[ 0]);

      tDiv.appendChild(document.createTextNode(iReport));
    }

    var setupRefresh = function () {
      var tID = setInterval(function () {
          console.log("In setupRefresh");
          if (!this.isGenerating)
            clearInterval(tID);
        }.bind(this),
        100);
    }.bind(this);

    var generateSampleObject = function () {
      var mSampleNum, mSample, mValueNum, mValueObject;
      console.log("In generateSampleObject");
      tSampleObject = {
        collection_name: tPopName,
        cases: []
      };

      //Initialize all parent cases with an mSample object that has collection_name of Samples,
      // empty cases array, and tAttrName for x-axis default
      for (mSampleNum = 0; mSampleNum < tNumSamples /*no. of parent cases*/ ; mSampleNum++) {
        mSample = {
          contents: {
            collection_name: this.kSampleCollectionName,//hardcoded to 'Samples'
            cases: [],
            defaults: {
              xAttr: tAttrName
            }
          }
        };
        //Populate mSample cases=['sample':1,'popMean':tPopMean, 'popSD':tPopSD]
        mSample[ this.kIDKey] = ++this.numberOfSamples; //mSample['sample'] = 1
        mSample[ this.kPopMeanAttrName] = tPopMean; //mSample[popMean]
        mSample[ this.kPopSDAttrName] = tPopSD; //mSample[popSD]


        //Generate child cases into mValueObject
        for (mValueNum = 0; mValueNum < tSampleSize/*no.of child case*/; mValueNum++) {
          mValueObject = {};
          mValueObject[ tAttrName] = tPopMean + tPopSD * tGen.nextGaussian();

          //Puts the numbers generated into mValueObject into the parent mSample as a content in 'cases'
          mSample.contents.cases.push(mValueObject);
        }

        tSampleObject.cases.push(mSample);  //Put the parent case into tSampleObject

        //updateReport((mSampleNum + 1) + ' samples'); //Reports number of parent cases were generated.
      }
    }.bind(this);

    var sendSamplesToCODAP = function () {
      var sParentName = tSampleObject.collection_name,
        sParentAttrsArray = [],
        sChildAttrsArray = [],
        sChildKey = '',
        sChildName = '',
        sDefaults,
        sFirstParentCase = tSampleObject.cases[ 0],
        sNumParents = 0,
        sampleCounter= 0,
        sNumChildren = 0;



      console.log("In sendSamplesToCODAP");
      // Run through the properties of the first parent case gathering attribute names and the key to the child collection
      this.forEachProperty(sFirstParentCase, function (iKey, iValue) {
        if (typeof iValue === 'object') {
          sChildKey = iKey;
          sChildName = iValue.collection_name;
          sDefaults = iValue.defaults;
          // Pull out the names of the child collection's attributes
          for (var iKey in iValue.cases[0]) {
            sChildAttrsArray.push({ name: iKey, type: 'numeric' });
          }
        }
        else
          sParentAttrsArray.push({ name: iKey });
      });

      if (!this.parentCollectionCreated) {
        this.createCollection(sParentName, sParentAttrsArray, sChildKey);
        console.log("Created parentCollection. sChildKey is: " + sChildKey + ' sParentName is: ' + sParentName + ' sParentAttrsArray is: ' + sParentAttrsArray);
        this.parentCollectionCreated = true;
      }

      if (!this.childCollectionCreated) {
        this.createCollection(sChildName, sChildAttrsArray, '', sDefaults);
        console.log("Created childCollection. sChildKey is: " + sChildKey + ' sChildName is: ' + sChildName + ' sChildAttrsArray is: ' + sChildAttrsArray);
        this.childCollectionCreated = true;
      }


      this.addNewParentCase(tSampleObject, sChildKey, sampleCounter);

      //updateReport(sNumParents + ' parent cases and ' + this.kTotalChildren + ' child cases');

    }.bind(this); // sendSamplesToCODAP

    // Begin generateSamples
    this.isGenerating = true;
    //setupRefresh();
    generateSampleObject();
    if (this.codapPhone !== null) {
      sendSamplesToCODAP();
      this.isGenerating = false;
    } else {console.log("no codapPhone");}
  },

  /**
   Applies the specified function to each property of the specified object.
   The order in which the properties are visited is not specified by the standard.

   @param {Object} iObject   The object whose properties should be iterated
   */
  forEachProperty: function (iObject, iFunction) {
    if (!iObject) return;

    for (var tKey in iObject) {
      //console.log("forEachProperty, iObject.tKey is " +tKey);
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

Sampler.initSamplerAsGame();