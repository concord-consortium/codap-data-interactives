/*
 * Manages a questionnaire dialog. Sends the questionnaire results to CODAP.
 */
/*global Survey, codapInterface, Promise, $*/

/**
 * Helper to connect to CODAP.
 * @type {Object}
 */

var inStartup = true;

var kStartupSurvey = {
  "completedHtml": '<button class="restart-setup">Redo setup</button> ' +
      '<button class="start-up-complete">Begin</button>',
  "pages": [
    {
      "name": "page1",
      "questions": [
        {
          "type": "html",
          "html": "This is a questionnaire plugin to " +
              "<a target=\"_blank\" href=\"http://codap.concord.org\">CODAP</a>. It is built on " +
              "<a target=\"_blank\" href=\"http://surveyjs.org/\">Survey.js</a>. You can design " +
              "surveys using the design tool found " +
              "<a target=\"_blank\" href=\"http://surveyjs.org/builder/\">here</a>. Be sure to " +
              "select the option \"Generate Valid JSON\". When you have designed " +
              "a survey, click on the \"JSON Editor\" tab. Select the JSON " +
              "text, copy it and paste it into a text document.  The " +
              "questionnaire is designed to have a data set with two levels, " +
              "the first level describes the experimental conditions and the " +
              "second level is for recording observations. Each level requires its own survey. There can be many " +
              "observations for each experiment.",
          "name": "question1"
        },
        {
          "type": "dropdown",
          "choices": [
            "one",
            {
              "value": "two",
              "text": "second value"
            },
            {
              "value": "three",
              "text": "third value"
            }
          ],
          "choicesOrder": "asc",
          "hasOther": true,
          "name": "dataSetName",
          "otherErrorText": "Name of new data set",
          "otherText": "New Data Set",
          "title": "Data Set"
        },
        {
          "type": "file",
          "name": "survey1",
          "title": "Survey file (level 1)",
          "storeDataAsText": true
        },
        {
          "type": "file",
          "name": "survey2",
          "title": "Survey file (level 2)",
          "storeDataAsText": true
        }
      ]
    }
  ]
};

var kSurvey1CompletionHTML = '<button class="survey-1-complete">Enter Observations</button>';

var kSurvey2CompletionHTML = '<button class="survey-2-complete">Enter Another Observation</button>' +
    '<button class="survey-2-complete-restart">Start over</button>';

var contextDef;

var survey; // will contain a reference to the currently running survey
// var surveyDocs = {}; // will contain specifications for the two surveys we
                     // will be using.
var myState = null; // current state of the DI form data so far

var itemData = {}; // In progress item data acquired so far.


function inferContextFromSurveys(surveys, contextName) {
  var collections = [];
  var lastCollectionName;
  ['survey1', 'survey2'].forEach(function (surveyName) {
    var survey = surveys[surveyName];
    if (!survey) {
      return;
    }
    var attributes = [];
    var collection = {name: survey.title, attrs: attributes};
    collection.parent = lastCollectionName;
    lastCollectionName = survey.title;
    survey.pages.forEach(function (page) {
      page.questions.forEach(function (question) {
        attributes.push({name: question.name});
      });
    });
    collections.push(collection);
  });
  return {name: contextName, collections: collections};
}

function getSurveyAttributeNames(surveys) {
  var attrs = [];
  surveys.forEach(function (survey) {
    survey && survey.pages && survey.pages.forEach(function (page) {
      page.questions && page.questions.forEach(function (question) {
        attrs.push(question.name);
      });
    });
  });
  return attrs;
}

function getDataContextAttributeNames(dataContext) {
  if (!dataContext) {
    return;
  }
  var names = [];
  dataContext.collections.forEach(function (collection) {
    collection.attrs.forEach(function (attr) {
      names.push(attr.name);
    });
  });
  return names;
}

function findMissingAttributes(surveys, dataContextDef) {
  var surveyAttrNames = getSurveyAttributeNames(surveys).sort();
  var dataContextAttrNames = getDataContextAttributeNames(dataContextDef).sort();
  var onlyInSurvey = [];
  surveyAttrNames && surveyAttrNames.forEach(function (name) {
    if (dataContextAttrNames.indexOf(name) < 0) {
      onlyInSurvey.push(name);
    }
  });
  return onlyInSurvey;
}
/**
 *
 * @returns {*|Promise} Promise of an array of missing attributes, if any.
 */
function prepareDataContext() {
// Request expected data context, if not found, create it
  return codapInterface.sendRequest({action: 'get', resource: 'dataContext[' + myState.dataSetName  + ']'})
      .then(function (reply) {
        if (reply && !reply.success) {
          contextDef = inferContextFromSurveys(myState, myState.dataSetName );
          codapInterface.sendRequest({action:'create', resource: 'dataContext', values: contextDef});
          return Promise.resolve([]);
        } else {
          return Promise.resolve(findMissingAttributes([myState.survey1, myState.survey2], reply.values));
        }
      });
}

function addSurvey(surveyDoc, onCompleteHandler) {
  $('#messages').empty();
  Survey.Survey.cssType = "standard";
  survey = new Survey.Survey(surveyDoc);

  survey.onComplete.add(function (formData) {
    onCompleteHandler(formData);
  });

  survey.completeText = "Next";
  survey.render("surveyAttachPoint");
}

function removeSurvey() {
   $('#surveyAttachPoint>*').remove();
}



function survey1CompletionHandler(formData) {
  itemData = formData.data;
}

function survey2CompletionHandler(formData) {
  itemData = Object.assign(itemData, formData.data);
  codapInterface.sendRequest({action: 'create',
        resource: 'dataContext[' + myState.dataSetName  + '].item', values: itemData})
    .then(function (result) {
      if (result && result.success) {
        if (result.values && result.values.length > 0) {
          return codapInterface.sendRequest({action:'create',
            resource: 'dataContext[' + myState.dataSetName  + '].selectionList',
            values: result.values});
        }
      }
    });
  console.log("The results are:" + JSON.stringify(formData.data));
}

/**
 * Utility to attempt convert DataURI to JSON.
 *
 * If conversion fails, will return null and log to console.
 *
 * @param dataURI
 */
function convertDataURIToJSON(dataURI) {
  var dataUriRE = /^data:[^;]*;base64,/;
  if (!dataURI) {
    return;
  }
  if (dataUriRE.test(dataURI)) {
    var x = atob(dataURI.replace(dataUriRE, ''));
    try {
      return JSON.parse(x);
    } catch (ex) {
      console.warn('Error parsing json file: ' + ex);
    }
  } else {
    console.warn('Attempted to convert file that does not appear to be a json file.');
  }
}

function startupSurveyCompletionHandler(data) {
  if (!data) {
    return;
  }
  if (!myState) {
    myState = codapInterface.getInteractiveState();
  }
  var answers = data.data;
  // var surveyAttributes;

  // Apply name of data set. If new, we have to find it in a different field.
  if (answers.dataSetName === 'other') {
    myState.dataSetName = answers['dataSetName-Comment'];
  } else {
    myState.dataSetName = answers.dataSetName;
  }
  // survey.js doesn't give us direct access to the survey file. Instead it creates
  // a data uri with the file information. Here, we base64 decode the dataURI, then
  // attempt to parse.
  myState.survey1 = convertDataURIToJSON(answers.survey1);
  myState.survey1.completedHtml = kSurvey1CompletionHTML;
  myState.survey2 = convertDataURIToJSON(answers.survey2);
  myState.survey2.completedHtml = kSurvey2CompletionHTML;
  //surveyAttributes = getSurveyAttributes([myState.survey1, myState.survey2]);
  prepareDataContext()
    .then(function (reply) {
      // addSurvey(myState.survey1, survey1CompletionHandler);
      if (reply.length > 0) {
        $("#messages").html('<span class="error">Warning:</span> the following ' +
            'items are defined in the questionnaire, but not known to CODAP, so ' +
            'will not be submitted: ' + reply.join());
      } else {
        $("#messages").text('At any time after this point you can save and/or share ' +
            'this document. When the document is reopened it will show the ' +
            'questionnaire dialog and not the foregoing setup dialog.');
      }

    });
  inStartup = false;
}

// function loadSurvey1() {
//   return loadSurvey('survey1', myState.surveyURL1,
//       '<button class="survey-1-complete">Enter Observations</button>',
//       survey1CompletionHandler);
// }

// function loadSurvey2() {
//   return loadSurvey('survey2', myState.surveyURL2,
//       '<button class="survey-2-complete">Enter Another Observation</button>' +
//       '<button class="survey-2-complete-restart">Start over</button>',
//       survey2CompletionHandler);
// }

// update data set names in survey based on list returned by CODAP
function updateDataSetList(survey) {
  // locate the data set question in the survey
  var dataSetQuestion = survey.pages[0].questions.find(function(question) { return question.name === 'dataSetName';});

  return codapInterface.sendRequest({action: 'get', resource: 'dataContextList'})
    .then(function (data) {
        if (data) {
          var choices = data.values.map(function (dataContext) {return dataContext.name;});
          dataSetQuestion.choices = choices;
        }
      }
    );
}

// Start CODAP connection
codapInterface.init({name: "Questionnaire",
      title: "Questionnaire",
      version: "0.1",
      dimensions: {width:480, height: 640},
      preventBringToFront: false,
    })
  // then, determine whether we are starting fresh or have already loaded
  // data-acquisition surveys. If the later, start the survey, if the former
  // start the startup dialog.
  .then(function (interactiveState) {
    if (interactiveState && interactiveState.survey1) {
      myState = codapInterface.getInteractiveState();
      prepareDataContext().then(function () {
        addSurvey(myState.survey1, survey1CompletionHandler);
      });
    } else {
      updateDataSetList(kStartupSurvey)
        .then(function () {
          addSurvey(kStartupSurvey, startupSurveyCompletionHandler);
        });
    }
  })
  .catch( function (msg) { console.warn(msg);});

codapInterface.on('documentChangeNotice', 'dataContextCountChanged', function () {
  if (inStartup) {
    updateDataSetList(kStartupSurvey).then(function () {
      removeSurvey();
      addSurvey(kStartupSurvey, startupSurveyCompletionHandler);
    });
  }
});


$('body').on('click', '.survey-1-complete', function () {
  removeSurvey();
  addSurvey(myState.survey2, survey2CompletionHandler);
});

$('body').on('click', '.survey-2-complete', function () {
  removeSurvey();
  addSurvey(myState.survey2, survey2CompletionHandler);
});

$('body').on('click', '.survey-2-complete-restart', function () {
  removeSurvey();
  addSurvey(myState.survey1, survey1CompletionHandler);
});

$('body').on('click', '.start-up-complete', function () {
  removeSurvey();
  addSurvey(myState.survey1, survey1CompletionHandler);
});

$('body').on('click', '.restart-setup', function () {
  removeSurvey();
  addSurvey(kStartupSurvey, startupSurveyCompletionHandler);
});
