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
              ],
              childAttrName: "Activity"
            },
            {
              name: "Activities",
              attrs: [
                { name: "kind", type:"nominal"},
                { name: "action", type: "nominal"},
                { name: "change_by", type: "nominal"},
                { name: "change_date"},
                { name: "change_kind", type: "nominal"},
                { name: "change_type", type: "nominal"},
                { name: "label_name", type: "nominal"}
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
      });
      //need to reinitialize attributes again so call initImporterAsGame
      PTImporter.initImporterAsGame();
    }
  },

  doImport: function () {

    function executeTrackerApiFetchActivities(storyID) {
      // get parameters
      console.log("in executeTrackerAPiFetchActivities");
      var token = $('#token').val();
      projectId = $('#project_id').val();

      // compose request URL
      var url = 'https://www.pivotaltracker.com/services/v5';
      url += '/projects/' + projectId;
      url += '/stories/' + storyID + '/activity';
      url += '?limit=50';

      // do API request to get activities
      $.ajax({
        url: url,
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-TrackerToken', token);
        }
      }).done(receiveTrackerApiResponsesActivities);
    }

    function executeTrackerApiFetch() {
      // get parameters
      var token = $('#token').val(),
          projectId = $('#project_id').val(),
          createdSinceDate = $('#created_sinceDate').val(),
         includeStoryDone = $("#story_done").val(),
          storyLimit = $("#limit_by").val();

      // compose request URL
      var url = 'https://www.pivotaltracker.com/services/v5';
      url += '/projects/' + projectId;
      url += '/stories?filter=created_since:' + createdSinceDate;
      if (includeStoryDone) {
        url += ' includedone:true';
      }
      url += '&limit='+storyLimit;

      // do API request to get stories
      $.ajax({
        url: url,
        type: "GET",
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-TrackerToken', token);
        },
        error: function (xhr){
          alert(xhr.status);
        }
      }).done(receiveTrackerApiResponse);
    }

    function receiveTrackerApiResponse(stories) {

      stories.forEach(function(story) {
        var storyArray = convertStoryToCODAPJson(story);

        //open story case in CODAP
        console.log('PTImporter: openCase');
        PTImporter.codapPhone.call({
          action: 'openCase',
          args: {
            collection: "Stories",
            values: storyArray
          }
        }, function (result) {
          console.log("openCase callback");
          if (result.success) {
            this.kSampleID = result.caseID;
            console.log(this.kSampleID + " kSampleID in openCase. Story ID is "+storyArray[0]);
            createStoryCases(result);
          }
        });

        function createStoryCases(result) {
          // get parameters for PT request
          console.log("in executeTrackerAPiFetchActivities");
          var token = $('#token').val(),
              projectId = $('#project_id').val();

          // compose request URL for PT activities
          var url = 'https://www.pivotaltracker.com/services/v5';
          url += '/projects/' + projectId;
          url += '/stories/' + story.id + '/activity';
          url += '?limit=50';

          // do API request to get activities
          $.ajax({
            url: url,
            beforeSend: function (xhr) {
              xhr.setRequestHeader('X-TrackerToken', token);
            },
            error: function (xhr) {
              $('error_msg').innerHTML = 'There was an error: ' + xhr.status;
            }
          }).done(receiveTrackerApiResponsesActivities);

          function receiveTrackerApiResponsesActivities(activities) {
            var activityArray = convertActivitiesToCODAPJson(activities);
            createCases("Activities", activityArray, result.caseID);
            closeCase("Stories", storyArray, result.caseID);
          }
        }

        function createCases(iCollectionName, iValuesArrays, iParentID) {
          console.log('PTImporter: createCases');
          PTImporter.codapPhone.call({
            action: 'createCases',
            args: {
              collection: iCollectionName,
              values: iValuesArrays,
              parent: iParentID,
              log: false
            }
          });
        }

        function closeCase(iCollectionName, iValuesArray, iCaseID) {
          console.log('PTImporter: closeCase');
          PTImporter.codapPhone.call({
            action: 'closeCase',
            args: {
              collection: iCollectionName,
              values: iValuesArray,
              caseID: iCaseID
            }
          });
        }
      });
    }

    var convertStoryToCODAPJson = function (story) {
      var tStoryArray = [],
           labelName=[],
           acceptDate;

      //Check for undefined fields and change to blanks
        if (story.estimate === undefined) {
          story.estimate = NaN;
        }
        if (story.owner_ids[0] === undefined) {
          story.owner_ids = NaN;
        }
        if (story.labels.length === 0) {
          labelName = "";
        } else {
          for (var i=0; i< story.labels.length; i++)
            labelName[i] = story.labels[i].name;}

        if (story.updated_at === undefined) {
          story.updated_at = "";
        }
        if (story.current_state === "accepted") {
          acceptDate = (new Date(story.accepted_at)).toLocaleDateString();
          console.log("current state is " + story.current_state +" Date accepted is "+ acceptDate);
        } else {acceptDate='';}

      //Convert Pivotal Tracker JSON to CODAP readable JSON

        tStoryArray = [
          story.id,
          story.story_type,
          story.current_state,
          story.estimate,
          story.owner_ids[0],
          labelName,
          (new Date(story.created_at)).toLocaleDateString(),
          (new Date(story.updated_at)).toLocaleDateString(),
          acceptDate
        ];

      return tStoryArray;
    };

      var convertActivitiesToCODAPJson = function (activities) {
        var tActivityArray = [];
        var labelName = [];

        //Check if changes were for labels and extract info from PT JSON to an array to send to CODAP
        for (var i = 0; i < activities.length; i++) {
          for (var j=0; j< activities[i].changes.length; j++) {
            if (activities[i].changes[j].kind === 'label') {
              labelName[j] = activities[i].changes[j].name;
            } else {
              labelName[j] = '';
            }
            console.log(activities[i].changes[j].kind);
            tActivityArray[i] = [
              activities[i].kind,
              activities[i].highlight,
              activities[i].performed_by.name,
              (new Date(activities[i].occurred_at)).toLocaleDateString(),
              activities[i].changes[j].kind,
              activities[i].changes[j].change_type,
              labelName
            ];
            console.log(tActivityArray);
          }
        //Convert Pivotal Tracker JSON to CODAP readable JSON

        }
        return tActivityArray;
      };
    executeTrackerApiFetch();
  }

};
PTImporter.initImporterAsGame();

