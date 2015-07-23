// ==========================================================================
// Project:   Movement
// ==========================================================================

/**
 * @fileoverview Defines Movement component to be embedded in DG to import tab-delimited text.
 * @author williamfinzer@gmail.com (William Finzer)
 */

var Movement = {
  kGameName: 'Movement',
  kChildKey: 'steps',
  kIDKey: 'ID',
  kDistanceKey: 'distance',
  kTrackCollectionName: 'Steps',
  kTrackID:null,
  kNumChildren:0,
  kTotalChildren:0,
  kLatitudeName: 'latitude',
  kLongitudeName: 'longitude',
  kStartLatitude: 37,
  kStartLongitude: -122,
  kMeanLatDrift: 0,
  kSDLatDrift: 0.5,
  kMeanLongDrift: -0.4,
  kSDLongDrift: 0.2,

  //controller: window.parent.DG && window.parent.DG.currGameController,
  codapPhone: null,
  initAccomplished: false,
  kNotOpen:false,
  parentCollectionCreated: false,
  childCollectionCreated: false,
  isGenerating: false,
  randGen: new KCPCommon.randomNormal(),

  numberOfTracks: 0,

  initMovementAsGame: function () {
    console.log("In initMovementAsGame");

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
      Movement.addNewParentCase(iSampleObject, iChildKey,sampleCounter);
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
        this.kTrackID = result.caseID;
        console.log(this.kTrackID + " kTrackID in openCase.");
        if (this.kTrackID !== null) {
          this.createChildCases(iCase, sChildKey, this.kTrackID, iCollectionName, iValuesArray, iNumParents,iSampleObject, sampleCounter);
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

  generateTracks: function () {
    var tTracksName = document.forms.form1.tracksName.value.trim(),
      tTrackLength = Number(document.forms.form1.trackLength.value),
      tNumTracks = Number(document.forms.form1.numTracks.value),
      tGen = this.randGen,
      tTrackObject;

    console.log("begin generateTracks");
    
    function distance( iLat1, iLong1, iLat2, iLong2) {
    	var deltaLat = iLat2 - iLat1,
    		deltaLong = iLong2 - iLong1,
    		a = Math.pow(Math.sin((Math.PI / 180) * deltaLat/2), 2) + 
    			Math.cos(iLat1 * Math.PI / 180) * Math.cos (iLat2 * Math.PI / 180) * 
    				Math.pow(Math.sin((Math.PI / 180) * deltaLong/2), 2);
    	return 6371*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
    }

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

    var generateTrackObject = function () {
      var mTrackNum, mTrack, mStepNum, mStepObject,
          tCurrLong,
          tCurrLat;
      console.log("In generateTrackObject");
      tTrackObject = {
        collection_name: tTracksName,
        cases: []
      };

      //Initialize all parent cases with an mTrack object that has collection_name of Tracks,
      // empty cases array
      for (mTrackNum = 0; mTrackNum < tNumTracks /*no. of parent cases*/ ; mTrackNum++) {
        tCurrLong = this.kStartLongitude;
        tCurrLat = this.kStartLatitude;
        mTrack = {
          contents: {
            collection_name: this.kTrackCollectionName,//hardcoded to 'Tracks'
            cases: []
          }
        };
        //Populate mTrack cases=['sample':1,'popMean':tPopMean, 'popSD':tPopSD]
        mTrack[ this.kIDKey] = ++this.numberOfTracks; //mTrack['sample'] = 1

        //Generate child cases into mStepObject
        for (mStepNum = 0; mStepNum < tTrackLength/*no.of child case*/; mStepNum++) {
          mStepObject = {};
          mStepObject[ this.kLongitudeName] = tCurrLong;
          mStepObject[ this.kLatitudeName] = tCurrLat;
          tCurrLong += this.kMeanLongDrift + this.kSDLongDrift * tGen.nextGaussian();
          tCurrLat += this.kMeanLatDrift + this.kSDLatDrift * tGen.nextGaussian();

          //Puts the numbers generated into mStepObject into the parent mTrack as a content in 'cases'
          mTrack.contents.cases.push(mStepObject);
        }
		mTrack[this.kDistanceKey] = distance(this.kStartLatitude, this.kStartLongitude,
											mStepObject.latitude, mStepObject.longitude);
        tTrackObject.cases.push(mTrack);  //Put the parent case into tTrackObject

        //updateReport((mTrackNum + 1) + ' samples'); //Reports number of parent cases were generated.
      }
    }.bind(this);

    var sendTracksToCODAP = function () {
      var sParentName = tTrackObject.collection_name,
        sParentAttrsArray = [],
        sChildAttrsArray = [],
        sChildKey = '',
        sChildName = '',
        sDefaults,
        sFirstParentCase = tTrackObject.cases[ 0],
        sNumParents = 0,
        sampleCounter= 0,
        sNumChildren = 0;



      console.log("In sendTracksToCODAP");
      // Run through the properties of the first parent case gathering attribute names and the key to the child collection
      this.forEachProperty(sFirstParentCase, function (iKey, iValue) {
        if (typeof iValue === 'object') {
          sChildKey = iKey;
          sChildName = iValue.collection_name;
          sDefaults = iValue.defaults;
          // Pull out the names of the child collection's attributes
          for (var iKey in iValue.cases[0]) {
            sChildAttrsArray.push({ name: iKey });
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


      this.addNewParentCase(tTrackObject, sChildKey, sampleCounter);

      //updateReport(sNumParents + ' parent cases and ' + this.kTotalChildren + ' child cases');

    }.bind(this); // sendTracksToCODAP

    // Begin generateTracks
    this.isGenerating = true;
    //setupRefresh();
    generateTrackObject();
    if (this.codapPhone !== null) {
      sendTracksToCODAP();
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

Movement.initMovementAsGame();