// ==========================================================================
//  
//  Author:   jsandoe
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
      if (values && values.savedState && stateHandler ) {
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

  destroy: function () {},

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
      response.success? this.stats.countDiRplSuccess++: this.stats.countDiRplFail++;
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
  name: 'RandomNumbers',
  title: 'Random Numbers',
  dimensions: {width: 300, height: 150},
  version: '0.1',
  stateHandler: function (state) {
    console.log('stateHandler: ' + (state && JSON.stringify(state)));
    if (state && state.sampleNumber) {
      RandomNumbers.sampleNumber = state.sampleNumber;
    }
  }
})

codapInterface.on('get', 'interactiveState', function () {
  return {success: true, values: {sampleNumber: RandomNumbers.sampleNumber}};
})

// Determine if CODAP already has the Data Context we need.
// If not, create it.
codapInterface.sendRequest({
  action:'get',
  resource: 'dataContext[Random_Numbers]'
}, function (iRequest, iResult) {
  if (iResult && !iResult.success) {
    codapInterface.sendRequest({
      action: 'create',
      resource: 'dataContext',
      values: {
        name: "Random_Numbers",
        collections: [  // There are two collections: a parent and a child
          {
            name: 'samples',
            // The parent collection has just one attribute
            attrs: [ {name: "sample", type: 'categorical'}],
            childAttrName: "sample"
          },
          {
            name: 'numbers',
            parent: 'samples',
            labels: {
              pluralCase: "numbers",
              setOfCasesWithArticle: "a sample"
            },
            // The child collection also has just one attribute
            attrs: [{name: "number", type: 'numeric', precision: 1}]
          }
        ]
    }});
  }
});

// This object handles the semantics of the page. It generates random numbers.
var RandomNumbers = {
  sampleNumber: 0,

  // Here is the function that is triggered when the user presses the button
  generateNumbers: function () {
    // If we're not embedded in CODAP, we bring up an alert and don't draw the sample
    if( !codapInterface.connection)
      return;

    // This function is called once the parent case is opened
    var doSample = function( iRequest, iResult) {
      var tID = iResult.values[0].id,
          tHowMany = document.forms.form1.howMany.value.trim(),

          addOneNumber = function() {
            if( tHowMany > 0) {
              var tRandom = Math.random() * 100 + 1; // Choose a random number between 1 and 100
              // Tell CODAP to create a case in the child collection
              codapInterface.sendRequest({
                action: 'create',
                resource: 'collection[numbers].case',
                values: {
                  parent: tID,
                  values: {number: tRandom}
                }
              }, addOneNumber);
              tHowMany--;
            }
          };

      addOneNumber(); // This starts an asynchronous recursion
    };

    // generateNumbers starts here
    this.sampleNumber++;
    // Tell CODAP to open a parent case and call doSample when done
    codapInterface.sendRequest( {
      action: 'create',
      resource: 'collection[samples].case',
      values: {values: {sample: this.sampleNumber}}
    }, doSample);
  }
};
