// ==========================================================================
// Project:   CODAP
// Copyright: ©2015, Concord Consortium, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Pivotal Tracker component to be embedded in DG to import Pivotal Tracker generated JSON.
 * @author eireland@concord.org (Evangeline Ireland)
 * @preserve (c) 2015, Concord Consortium, Inc.
 */

var PTImporter = {
  firstTime: true,
  kSampleID: null,
  kNumChildren: 0,
  kTotalNumChildren: 0,
  kNotOpen:true,

  codapPhone: null,

  initImporterAsGame: function () {
    if (this.firstTime) {
      console.log('Importer: initGame: first time with codapPhone');

      this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(function (cmd, callback) {
        callback();
      }, "codap-game", window.parent);

      this.codapPhone.call({
        action: 'initGame',
        args: {
          name: "PTImporter",
          dimensions: { width: 400, height: 250 },
          collections:[
            {
              name: "Stories",
              attrs: [
                { name: "ID"},
                { name: "story_type", type: "nominal"},
                { name: "state", type: "nominal"},
                { name: "estimate", type: "numerical"},
                { name: "owner_id"},
                { name: "label", type: "nominal"},
                { name: "created_at"},
                { name: "update_at"},
                { name: "accepted_at"}
              ]
            }
          ]
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

  createChildCases: function (iCase, iChildKey, iCaseID, iParentName,
                              iParentValuesArray, tIsArrayFormat, iNumParents,
                              iSampleObject, sampleCounter) {
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
      this.kTotalNumChildren = this.kTotalNumChildren + this.kNumChildren;
      this.kNumChildren = 0;
    }

    if (sampleCounter<=iNumParents){
      sampleCounter++;
      if (iSampleObject!=null)
        Importer.addNewParentCase(iSampleObject, iChildKey, sampleCounter,
          tIsArrayFormat);
    }
    this.updateReport( iNumParents + ' parent cases and ' + this.kTotalNumChildren + ' child cases');

  },

  openJSONCase: function (iCollectionName, iValuesArray, iCase, iChildKey,
                          iNumParents, iSampleObject, sampleCounter, tIsArrayFormat) {
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
        this.createChildCases(iCase, iChildKey, this.kSampleID, iCollectionName,
          iValuesArray, tIsArrayFormat, iNumParents, iSampleObject, sampleCounter);
      }
    }.bind(this));
  },

  openPTJSONCase: function (iCollectionName, iValuesArray) {
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
        this.closeCase(iCollectionName,iValuesArray, result.caseID);
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
        this.updateReport( iParentValuesArray.length + ' parent cases and ' + iChildValuesArray.length + ' child cases');
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

        this.openJSONCase(iSampleObject.collection_name, tValues, iCase,
          iChildKey, iNumParents, iSampleObject, sampleCounter, tIsArrayFormat)
      }

      if (sampleCounter>iNumParents) {
        this.kNotOpen=false;
      } else {
        sampleCounter++;
        this.addNewParentCase(iSampleObject,sampleCounter, iChildKey, tIsArrayFormat);}
    }
  },

  updateReport:function(iReport){
    var tDiv = document.getElementById('report');
    while (tDiv.childNodes.length)
      tDiv.removeChild(tDiv.childNodes[ 0]);

    tDiv.appendChild(document.createTextNode(iReport));
  },

  doImport: function () {
    //var tText = document.getElementById("textToImport").value.trim();

    function executeTrackerApiFetch() {
      // get parameters
      var token = $('#token').val();
      projectId = $('#project_id').val();
      storyLabel = $('#story_label').val();
      createdSinceDate = $('#created_sinceDate').val();
      includeStoryDone = $("#story_done").val();


      // compose request URL
      var url = 'https://www.pivotaltracker.com/services/v5';
      url += '/projects/' + projectId;
      url += '/stories?filter=created_since:' + createdSinceDate;
      if (includeStoryDone) {
        url += ' includedone:true';
      }
      url += '&limit=250'


      console.log(url);

      // do API request to get stories
      $.ajax({
        url: url,
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-TrackerToken', token)
        }
      }).done(displayTrackerApiResponse);
    }


    function displayTrackerApiResponse(stories) {
      storyArray = convertToCODAPJson(stories)
      for (var i=0; i< storyArray.length; i++)
      {   PTImporter.openPTJSONCase("Stories", storyArray[i])  }
    }

    var convertToCODAPJson = function (stories) {
      var tStoryArray = [];
      labelName = [];

      //Check for undefined fields and change to blanks
      for (var i = 0; i < stories.length; i++) {
        if (stories[i].estimate == 'undefined') {
          stories[i].estimate = "";
        }
        if (stories[i].owner_ids[0] == 'undefined') {
          stories[i].owner_ids = "";
        }
        if (stories[i].labels.length == 0) {
          labelName[i] = "";
        } else { labelName[i] = stories[i].labels[0].name;}

        if (stories[i].updated_at == 'undefined') {
          stories[i].updated_at = "";
        }
        if (stories[i].current_state !== 'accepted') {
          stories[i].accepted_at = "";
        }
      }
      //Convert Pivotal Tracker JSON to CODAP readable JSON
      for (var i = 0; i < stories.length; i++) {
        tStoryArray[i] = [
          stories[i].id,
          stories[i].story_type,
          stories[i].current_state,
          stories[i].estimate,
          stories[i].owner_ids[0],
          labelName[i],
          stories[i].created_at,
          stories[i].updated_at,
          stories[i].accepted_at
        ]

      }
      return tStoryArray;
    }

    executeTrackerApiFetch();
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

PTImporter.initImporterAsGame();/**
 * Created by evangelineireland on 8/26/15.
 */
