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
 * This class is intended to provide an abstraction layer for managing
 * a CODAP Data Interactive's connection with CODAP. It is not required. It is
 * certainly possible for a data interactive, for example, to use only the
 * iFramePhone library, which manages the connection at a lower level.
 *
 * This object provides the following services:
 *   1. Initiates the iFramePhone interaction with CODAP.
 *   2. Provides information on the status of the connection.
 *   3. Provides a sendRequest method. It accepts a callback or returns a Promise
 *      for handling the results from CODAP.
 *   4. Provides a subscriber interface to receive selected notifications from
 *      CODAP.
 *   5. Provides automatic handling of Data Interactive State. Prior to saving
 *      a document CODAP requests state from the Data Interactive, where state
 *      is an arbitrary serializable object containing whatever the data
 *      interactive needs to retain. It returns this state when the document
 *      is reopened.
 *   6. Provides a utility to parse a resource selector into its component parts.
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
   * A serializable object shared with CODAP. This is saved as a part of the
   * CODAP document. It is intended for the data interactive's use to store
   * any information it may need to reestablish itself when a CODAP document
   * is saved and restored.
   *
   * This object will be initially empty. It will be updated during the process
   * initiated by the init method if CODAP was started from a previously saved
   * document.
   */
  interactiveState: {},

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
   * Update interactive frame to set name and dimensions and other configuration
   * information.
   *
   * @param config {object} Configuration. Optional properties: title {string},
   *                        version {string}, dimensions {object}
   *
   * @param callback {function(interactiveState)}
   * @return {Promise} Promise of interactiveState;
   */
  init: function (config, callback) {
    return new Promise(function (resolve, reject) {
      function getFrameRespHandler(resp) {
          var success = resp && resp[1] && resp[1].success;
          var receivedFrame = success && resp[1].values;
          var savedState = receivedFrame && receivedFrame.savedState;
          this_.updateInteractiveState(savedState);
        if (success) {
          if (callback) {
            callback(savedState);
          }
          // deprecated way of conveying state
          if (config.stateHandler) {
            config.stateHandler(savedState);
          }
          resolve(savedState);
        } else {
          if (!resp) {
            reject('Connection request to CODAP timed out.');
          } else {
            reject(
                (resp[1] && resp[1].values && resp[1].values.error)
                || 'unknown failure');
          }
        }
      }

      var getFrameReq = {action: 'get', resource: 'interactiveFrame'};
      var newFrame = {
        name: config.name,
        title: config.title,
        version: config.version,
        dimensions: config.dimensions,
        preventBringToFront: config.preventBringToFront
      };
      var updateFrameReq = {
        action: 'update',
        resource: 'interactiveFrame',
        values: newFrame
      };
      var this_ = this;

      this.config = config;

      // initialize connection
      this.connection = new iframePhone.IframePhoneRpcEndpoint(
          this._notificationHandler.bind(this), "data-interactive", window.parent);

      this.on('get', 'interactiveState', function () {
        console.log('sending interactiveState: ' + JSON.stringify(this.interactiveState));
        return ({success: true, values: this.getInteractiveState()});
      }.bind(this));

      // update, then get the interactiveFrame.
      this.sendRequest([updateFrameReq, getFrameReq])
          .then(getFrameRespHandler);
    }.bind(this));
  },

  getStats: function () {
    return this.stats;
  },

  /**
   * Returns the interactive state.
   *
   * @returns {object}
   */
  getInteractiveState: function () {
    return this.interactiveState;
  },

  /**
   * Updates the interactive state.
   * @param interactiveState
   */
  updateInteractiveState: function (interactiveState) {
    if (!interactiveState) {
      return;
    }
    this.interactiveState = Object.assign(this.interactiveState, interactiveState);

  },

  destroy: function () {},

  /**
   * Sends a request to CODAP. The format of the message is as defined in
   * https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API.
   *
   * @param message
   * @param callback {function(response, request)} Optional callback to handle
   *    the CODAP response. Note both the response and the initial request will
   *    sent.
   *
   * @return {Promise} The promise of the response from CODAP.
   */
  sendRequest: function (message, callback) {
    return new Promise(function (resolve, reject){
      function handleResponse (request, response, callback) {
        if (response === undefined) {
          console.warn('handleResponse: CODAP request timed out');
          reject('handleResponse: CODAP request timed out: ' + JSON.stringify(request));
          this_.stats.countDiRplTimeout++;
        } else {
          this_.connectionState = 'active';
          response.success? this_.stats.countDiRplSuccess++: this_.stats.countDiRplFail++;
          resolve(response);
        }
        if (callback) {
          callback(response, request);
        }
      }
      var this_ = this;
      switch (this.connectionState) {
        case 'closed': // log the message and ignore
          console.warn('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
          reject('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
          break;
        case 'preinit': // warn, but issue request.
          console.warn('sendRequest on not yet initialized CODAP connection: '
              + JSON.stringify(message));
          // fallthrough intentional
        default:
          if (this.connection) {
            this.stats.countDiReq++;
            this.stats.timeDiLastReq = new Date();
            if (!this.stats.timeDiFirstReq) {
              this.stats.timeCodapFirstReq = this.stats.timeDiLastReq;
            }

            this.connection.call(message, function (response) {
              handleResponse(message, response, callback)
            });
          } else {
            console.error('sendRequest on non-existent CODAP connection');
          }
      }
    }.bind(this));
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
    if (!handled) {
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
   * @param handler
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
