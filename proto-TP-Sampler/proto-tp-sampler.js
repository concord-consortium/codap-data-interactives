// ==========================================================================
//  
//  Authors:   jsandoe, bfinzer
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
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

/**
 * Provides access to CODAP.
 *
 * Manages the underlying PostMessage service.
 * Provides an event-like means to subscribe to CODAP notifications.
 * Users of this object should call its 'init' method at page ready.
 *
 * @type {Object}
 */
var codapInterface = Object.create({
  /**
   * The CODAP Connection
   * @param {iframePhone.IframePhoneRpcEndpoint}
   */
  connection: null,

  /**
   * Current known state of the connection
   * @param {'preinit' || 'init' || 'active' || 'inactive' || 'closed'}
   */
  connectionState: 'preinit',

  /**
   * Connection statistics
   */
  stats: {
    countDiReq: 0,
    countDiRplSuccess: 0,
    countDiRplFail: 0,
    countDiRplTimeout: 0,
    countCodapReq: 0,
    countCodapUnhandledReq: 0,
    countCodapRplSuccess: 0,
    countCodapRplFail: 0,
    timeDiFirstReq: null,
    timeDiLastReq: null,
    timeCodapFirstReq: null,
    timeCodapLastReq: null
  },

  /**
   * A list of subscribers to messages from CODAP
   * @param {[{actionSpec: {RegExp}, resourceSpec: {RegExp}, handler: {function}}]}
   */
  notificationSubscribers: [],

  config: null,

  /**
   * Initialize connection.
   *
   * Start connection. Request interactiveFrame to get prior state, if any.
   * Update interactive frame to set name and dimensions.
   *
   * @param config {object} Configuration. Optional properties: title {string},
   *                        version {string}, dimensions {object},
   *                        stateHandler {function}
   *
   *                        The stateHandler function takes a single argument, 'state',
   *                        which will contain the state saved with the document
   *                        from the last time the document was opened.
   */
  init: function (config) {
    function getFrameRespHandler(req, resp) {
      var values = resp && resp.values;
      var stateHandler = _this.config && _this.config.stateHandler;
      var newFrame = {
        name: config.name,
        title: config.title,
        version: config.version,
        dimensions: config.dimensions,
        preventBringToFront: config.preventBringToFront
      };
      //Object.assign(newFrame, values);
      updateFrameReq.values = newFrame;
      _this.sendRequest(updateFrameReq);

      console.log('init result: ' + (values && JSON.stringify(values) + ' calling: ' + (!!stateHandler)));
      if (values && values.savedState && stateHandler) {
        stateHandler(values.savedState);
      }
    }

    var getFrameReq = {action: 'get', resource: 'interactiveFrame'};
    var updateFrameReq = {action: 'update', resource: 'interactiveFrame'};
    var _this = this;

    this.config = config;
    this.connection = new iframePhone.IframePhoneRpcEndpoint(
        this._notificationHandler.bind(this), "data-interactive", window.parent);
    this.sendRequest(getFrameReq, getFrameRespHandler);
  },

  getStats: function () {
    return this.stats;
  },

  destroy: function () {
  },

  /**
   * Sends a request to CODAP.
   *
   * The message is an object as described in the CODAP Data Interactive
   * API document.
   * @param message {object}
   * @param callback {function(iRequest {object}, iResponse {object})} A callback
   *                 to handle the asynchronous response to this request.
   */
  sendRequest: function (message, callback) {
    switch (this.connectionState) {
      case 'closed': // log the message and ignore
        console.warn('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
        break;
      case 'preinit': // warn, but issue request.
        console.warn('sendRequest on not yet initialized CODAP connection: ' + JSON.stringify(message));
      default:
        if (this.connection) {
          this.stats.countDiReq++;
          this.stats.timeDiLastReq = new Date();
          if (!this.stats.timeDiFirstReq) {
            this.stats.timeCodapFirstReq = this.stats.timeDiLastReq;
          }

          this.connection.call(message, function (response) {
            this._handleResponse(message, response, callback)
          }.bind(this));
        } else {
          console.error('sendRequest on non-existent CODAP connection');
        }
    }
  },

  _handleResponse: function (request, response, callback) {
    if (response === undefined) {
      console.warn('_handleResponse: CODAP request timed out');
      this.stats.countDiRplTimeout++;
    } else {
      this.connectionState = 'active';
      response.success ? this.stats.countDiRplSuccess++ : this.stats.countDiRplFail++;
    }
    if (callback) {
      callback(request, response);
    }
  },

  _notificationHandler: function (request, callback) {
    var action = request.action;
    var resource = request.resource;
    var stats = this.stats;

    this.connectionState = 'active';
    stats.countCodapReq++;
    stats.timeCodapLastReq = new Date();
    if (!stats.timeCodapFirstReq) {
      stats.timeCodapFirstReq = stats.timeCodapLastReq;
    }

    var handled = this.notificationSubscribers.some(function (subscription) {
      if (subscription.actionSpec.test(action)
          && subscription.resourceSpec.test(resource)) {
        var rtn = subscription.handler(request);
        if (rtn && rtn.success) {
          stats.countCodapRplSuccess++;
        } else {
          stats.countCodapRplFail++;
        }
        callback(rtn);
        return true;
      }
      return false;
    });
    if (handled) {
      stats.countCodapUnhandledReq++;
      callback({success: true});
    }
  },

  /**
   * Registers a handler to respond to CODAP-initiated requests and
   * notifications.
   *
   * @param actionSpec {regex} A regular expression to qualify actions.
   * @param resourceSpec {regex} A regular expression to qualify resources.
   * @param handler {function(iRequest {object})}
   */
  on: function (actionSpec, resourceSpec, handler) {
    this.notificationSubscribers.push({
      actionSpec: RegExp(actionSpec),
      resourceSpec: RegExp(resourceSpec),
      handler: handler
    });
  },

  /**
   * Parses a resource selector returning a hash of named resource names to
   * resource values. The last clause is identified as the resource type.
   * E.g. converts 'dataContext[abc].collection[def].case'
   * to {dataContext: 'abc', collection: 'def', type: 'case'}
   * @param iResource
   * @returns {{}}
   */
  parseResourceSelector: function (iResource) {
    var selectorRE = /([A-Za-z0-9_-]+)\[([^\]]+)]/;
    var result = {};
    var selectors = iResource.split('.');
    selectors.forEach(function (selector) {
      var resourceType, resourceName;
      var match = selectorRE.exec(selector);
      if (selectorRE.test(selector)) {
        resourceType = match[1];
        resourceName = match[2];
        result[resourceType] = resourceName;
        result.type = resourceType;
      } else {
        result.type = selector;
      }
    });

    return result;
  },

});

// initialize the codapInterface
codapInterface.init({
  name: 'ProtoTPSampler',
  title: 'Proto TP Sampler',
  dimensions: {width: 450, height: 225},
  version: '0.1',
  stateHandler: function (state) {
    console.log('stateHandler: ' + (state && JSON.stringify(state)));
    if (state && state.sampleNumber) {
      ProtoTPSampler.sampleNumber = state.sampleNumber;
    }
  }
});

codapInterface.on('get', 'interactiveState', function () {
  return {success: true, values: {sampleNumber: ProtoTPSampler.sampleNumber}};
});

// Determine if CODAP already has the Data Context we need.
// If not, create it.
codapInterface.sendRequest({
  action: 'get',
  resource: 'dataContext[Sampler_Results]'
}, function (iRequest, iResult) {
  if (iResult && !iResult.success) {
    codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContext',
      values: {
        name: "Sampler_Results",
        collections: [  // There are two collections: a parent and a child
          {
            name: 'experiments',
            attrs: [
              {name: "experiment", type: 'categorical'},
              {name: "draws", type: 'categorical'}
            ],
            childAttrName: "experiment"
          },
          {
            name: 'runs',
            parent: 'experiments',
            // The parent collection has just one attribute
            attrs: [{name: "run", type: 'categorical'}],
            childAttrName: "run"
          },
          {
            name: 'draws',
            parent: 'runs',
            labels: {
              pluralCase: "draws",
              setOfCasesWithArticle: "a draw"
            },
            // The child collection also has just one attribute
            attrs: [{name: "value"}]
          }
        ]
      }
    });
  }
});

// This object handles the semantics of the page. It generates random numbers.
var ProtoTPSampler = {
  experimentNumber: 0,
  runNumber: 0,
  drawFromChoice: 'drawElements',
  collectionInfo: null,

  init: function () {
    this.collectionInfo = {
      contextName: null,
      collectionName: null,
      caseCount: null
    };
    this.updateChoiceElement();
  },

  handleDrawFromChange: function () {
    var tDrawFrom = document.getElementById('drawFromChoice');
    this.drawFromChoice = tDrawFrom.value;
    this.updateChoiceElement();
  },

  updateChoiceElement: function () {
    var tChoiceHTML, tPopulateFunc;
    switch (this.drawFromChoice) {
      case 'drawElements':
        tChoiceHTML = '<label>Elements (comma-separated) to draw from: <input type="text" name="elements" value="H,T"></label><br>';
        break;
      case 'sampleCollection':
        tChoiceHTML = 'Choose Collection: <select id="collectionChoice" ></select>';
        tPopulateFunc = this.populateCollectionChoices;
        break;
    }
    document.getElementById('drawFrom').innerHTML = tChoiceHTML;
    if (tPopulateFunc)
      tPopulateFunc();
  },

  populateCollectionChoices: function () {

    var handleList = function (iRequest, iResult) {
      if (iResult.success) {
        iResult.values.forEach(function (iContext) {
          if (iContext.name !== 'Sampler_Results')
            tPopup.innerHTML += '<option value="' + iContext.name + '">' + iContext.name + "</option>";
        });
      }
    }.bind(this);

    var tPopup = document.getElementById('collectionChoice');
    tPopup.innerHTML = '';
    codapInterface.sendRequest({
      action: 'get',
      resource: 'dataContextList'
    }, handleList);
  },

  // Here is the function that is triggered when the user presses the button
  conductExperiment: function () {
    // If we're not embedded in CODAP, we bring up an alert and don't draw the sample
    if (!codapInterface.connection.isConnected()) {
      window.alert('Please embed this in CODAP')
      return;
    }

    var doRun = function () {
          var tNumDraws = 0;

          // This function is called once the parent case is opened
          var doSample = function (iRequest, iResult) {
            var tID = iResult.values[0].id;
            tNumDraws = tSampleSize;

            var formulateCase = function (iRequest, iResult) {
                  if (iResult.success) {
                    addOneCase(iResult.values.case.values);
                  }
                }.bind(this),

                chooseFromCollection = function () {
                  var tCaseIndex = Math.floor(Math.random() * this.collectionInfo.caseCount),
                      tResource = 'dataContext[' + this.collectionInfo.contextName + '].collection[' +
                          this.collectionInfo.collectionName + '].caseByIndex[' + tCaseIndex + ']';
                  codapInterface.sendRequest({
                    action: 'get',
                    resource: tResource
                  }, formulateCase);
                }.bind(this),

                makeChoice = function () {
                  switch (this.drawFromChoice) {
                    case 'drawElements':
                      addOneCase({value: tElements[Math.floor(Math.random() * tElements.length)]});
                      break;
                    case 'sampleCollection':
                      chooseFromCollection();
                  }
                }.bind(this),

                addOneCase = function (iChoice) {
                  tNumDraws--;
                  // Tell CODAP to create a case in the child collection
                  codapInterface.sendRequest({
                    action: 'create',
                    resource: 'collection[draws].case',
                    values: {
                      parent: tID,
                      values: iChoice
                    }
                  }, (tNumDraws > 0) ? makeChoice : doRun);
                }.bind(this);

            makeChoice(); // This starts an asynchronous recursion
          }.bind(this);

          // doRun starts here
          if (tNumRuns > 0) {
            this.runNumber++;
            document.getElementById('message').innerHTML = this.runNumber;

            // Tell CODAP to open a parent case and call doSample when done
            codapInterface.sendRequest({
              action: 'create',
              resource: 'collection[runs].case',
              values: {
                parent: tExperimentCaseID,
                values: {run: this.runNumber}
              }
            }, doSample);
            tNumRuns--;
          }
          else {
            document.getElementById('message').innerHTML = 'Ready';
          }

        }.bind(this), // end doRun

        prepareToSampleFromCollection = function () {
          this.collectionInfo.contextName = document.getElementById('collectionChoice').value;

          var
              deleteValueAttribute = function() {
                // We don't need to monitor the result
                codapInterface.sendRequest({
                  action: 'delete',
                  resource: 'collection[draws].attribute[value]'
                },
                function( iRequest, iResult) {
                  console.log('deleteValueAttribute: ' + iResult.success);
                });
              }.bind( this),

              setCountAndAttributes = function (iRequest, iResults) {
                var tCountResult = iResults[0],
                    tAttributeListResult = iResults[1];
                if (tCountResult.success) {
                  this.collectionInfo.caseCount = tCountResult.values;
                }
                if (tAttributeListResult.success) {
                  this.addSampleAttributes(tAttributeListResult.values);
                }
                doRun();
              }.bind(this),

              setCollection = function (iRequest, iResult) {
                if (iResult.success) {
                  this.collectionInfo.collectionName = iResult.values[0].name;
                  var tCollectionResource = 'dataContext[' + this.collectionInfo.contextName + '].collection[' +
                      this.collectionInfo.collectionName + ']';
                  codapInterface.sendRequest([
                    {
                      action: 'get',
                      resource: tCollectionResource + '.caseCount'
                    },
                    {
                      action: 'get',
                      resource: tCollectionResource + '.attributeList'
                    }
                  ], setCountAndAttributes);
                }
              }.bind(this);

          deleteValueAttribute(); // May be left over from drawing elements

          codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.collectionInfo.contextName + '].collectionList'
          }, setCollection);
          return false;
        }.bind(this),

        doRuns = function () {
          var
              tReadyToRun = false;
          switch (this.drawFromChoice) {
            case 'drawElements':
              tElements = document.forms.form1.elements.value.trim().split(/\s*,\s*/);
              tReadyToRun = true;
              break;
            case 'sampleCollection':
              tReadyToRun = prepareToSampleFromCollection();
          }
          if (tReadyToRun)
            doRun();
        }.bind(this);

    // conductExperiment starts here
    this.experimentNumber++;
    this.runNumber = 0; // Each experiment starts the runNumber afresh
    var
        tNumRuns = document.forms.form1.runs.value.trim(),
        tSampleSize = document.forms.form1.draws.value.trim(),
        tExperimentCaseID,
        tElements;
    codapInterface.sendRequest({
      action: 'create',
      resource: 'collection[experiments].case',
      values: [{
        values: {
          experiment: this.experimentNumber,
          draws: tSampleSize
        }
      }]
    }, function (iRequest, iResult) {
      if (iResult.success) {
        tExperimentCaseID = iResult.values[0].id;
        doRuns();
      }
      else {
        window.alert('Unable to begin experiment');
      }
    });
  },

  addSampleAttributes: function (iAttributeList) {
    iAttributeList.forEach(function (iAttributeSpec) {
      codapInterface.sendRequest({
            action: 'get',
            resource: 'collection[draws].attribute[' +
            iAttributeSpec.name + ']'
          },
          function (iRequest, iResult) {
            if (!iResult.success) {
              codapInterface.sendRequest({
                    action: 'create',
                    resource: 'collection[draws].attribute',
                    values: [
                      {
                        name: iAttributeSpec.name
                      }
                    ]
                  },
                  function (iRequest, iResult) {
                    if (!iResult.success)
                      console.log(iResult.values);
                  })
            }
          })
    });
  }
};

ProtoTPSampler.init();