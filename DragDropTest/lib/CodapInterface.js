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
 *
 * Usage Notes:
 *
 *  * With plain ol' script tags:
 *
 *    * In HTML
 *
 *      <script src=".../iframe-phone.js"></script>
 *      <script src=".../CodapInterface.js"></script>
 *      ...
 *
 *    * In Javascript
 *
 *      codapInterface.init({...});
 *      ...
 *
 *  * In a module packager (e.g. webpack):
 *
 *    * Installation
 *
 *      % npm install --save iframe-phone
 *
 *    * In calling module (e.g. my-module.js)
 *
 *      var codapInterface = require('.../CodapInterface');
 *      ...
 *      codapInterface.init({...});
 *
 *    * Packaging
 *
 *      % webpack my-module.js app.js
 *
 */

/*global require, iframePhone, Promise, module */

(function (global) {

  var iframePh = (typeof module !== 'undefined')? require('iframe-phone') : iframePhone;

  var config = null;

  /**
   * The CODAP Connection
   * @param {iframePhone.IframePhoneRpcEndpoint}
   */
  var connection = null;

  var connectionState = 'preinit';

  var stats = {
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
  };

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
  var interactiveState = {};

  /**
   * A list of subscribers to messages from CODAP
   * @param {[{actionSpec: {RegExp}, resourceSpec: {RegExp}, handler: {function}}]}
   */
  var notificationSubscribers = [];

  function matchResource(resourceName, resourceSpec) {
    return resourceSpec === '*' || resourceName === resourceSpec;
  }

  function notificationHandler (request, callback) {
    var action = request.action;
    var resource = request.resource;
    var requestValues = request.values;
    var returnMessage = {success: true};

    connectionState = 'active';
    stats.countCodapReq += 1;
    stats.timeCodapLastReq = new Date();
    if (!stats.timeCodapFirstReq) {
      stats.timeCodapFirstReq = stats.timeCodapLastReq;
    }

    if (action === 'notify' && !Array.isArray(requestValues)) {
      requestValues = [requestValues];
    }

    var handled = false;
    var success = true;

    if ((action === 'get') || (action === 'update')) {
      // get assumes only one subscriber because it expects only one response.
      notificationSubscribers.some(function (subscription) {
        var result = false;
        try {
          if ((subscription.actionSpec === action) &&
              matchResource(resource, subscription.resourceSpec)) {
            var rtn = subscription.handler(request);
            if (rtn && rtn.success) { stats.countCodapRplSuccess++; } else{ stats.countCodapRplFail++; }
            returnMessage = rtn;
            result = true;
          }
        } catch (ex) {
          console.log('DI Plugin notification handler exception: ' + ex);
          result = true;
        }
        return result;
      });
      if (!handled) {
        stats.countCodapUnhandledReq++;
      }
    } else if (action === 'notify') {
      requestValues.forEach(function (value) {
        notificationSubscribers.forEach(function (subscription) {
          // pass this notification to matching subscriptions
          handled = false;
          if ((subscription.actionSpec === action) && matchResource(resource,
                  subscription.resourceSpec) && (!subscription.operation ||
              (subscription.operation === value.operation) && subscription.handler)) {
            var rtn = subscription.handler(
                {action: action, resource: resource, values: value});
            if (rtn && rtn.success) { stats.countCodapRplSuccess++; } else{ stats.countCodapRplFail++; }
            success = (success && (rtn ? rtn.success : false));
            handled = true;
          }
        });
        if (!handled) {
          stats.countCodapUnhandledReq++;
        }
      });
    } else {
      console.log("DI Plugin received unknown message: " + JSON.stringify(request));
    }
    return callback(returnMessage);
  }

  var codapInterface = {
    /**
     * Connection statistics
     */
    stats: stats,

    /**
     * Initialize connection.
     *
     * Start connection. Request interactiveFrame to get prior state, if any.
     * Update interactive frame to set name and dimensions and other configuration
     * information.
     *
     * @param iConfig {object} Configuration. Optional properties: title {string},
     *                        version {string}, dimensions {object}
     *
     * @param iCallback {function(interactiveState)}
     * @return {Promise} Promise of interactiveState;
     */
    init: function (iConfig, iCallback) {
      return new Promise(function (resolve, reject) {
        function getFrameRespHandler(resp) {
          var success = resp && resp[1] && resp[1].success;
          var receivedFrame = success && resp[1].values;
          var savedState = receivedFrame && receivedFrame.savedState;
          this_.updateInteractiveState(savedState);
          if (success) {
            // deprecated way of conveying state
            if (iConfig.stateHandler) {
              iConfig.stateHandler(savedState);
            }
            resolve(savedState);
          } else {
            if (!resp) {
              reject('Connection request to CODAP timed out.');
            } else {
              reject(
                  (resp[1] && resp[1].values && resp[1].values.error) ||
                  'unknown failure');
            }
          }
          if (iCallback) {
            iCallback(savedState);
          }
        }

        var getFrameReq = {action: 'get', resource: 'interactiveFrame'};
        var newFrame = {
          name: iConfig.name,
          title: iConfig.title,
          version: iConfig.version,
          dimensions: iConfig.dimensions,
          preventBringToFront: iConfig.preventBringToFront,
          preventDataContextReorg: iConfig.preventDataContextReorg
        };
        var updateFrameReq = {
          action: 'update',
          resource: 'interactiveFrame',
          values: newFrame
        };
        var this_ = this;

        config = iConfig;

        // initialize connection
        connection = new iframePh.IframePhoneRpcEndpoint(
            notificationHandler, "data-interactive", window.parent);

        if (!config.customInteractiveStateHandler) {
          this.on('get', 'interactiveState', function () {
            return ({success: true, values: this.getInteractiveState()});
          }.bind(this));
        }

        console.log('sending interactiveState: ' + JSON.stringify(this.getInteractiveState));
        // update, then get the interactiveFrame.
        return this.sendRequest([updateFrameReq, getFrameReq])
          .then(getFrameRespHandler, reject);
      }.bind(this));
    },

    /**
     * Current known state of the connection
     * @param {'preinit' || 'init' || 'active' || 'inactive' || 'closed'}
     */
    getConnectionState: function () {return connectionState;},

    getStats: function () {
      return stats;
    },

    getConfig: function () {
      return config;
    },

    /**
     * Returns the interactive state.
     *
     * @returns {object}
     */
    getInteractiveState: function () {
      return interactiveState;
    },

    /**
     * Updates the interactive state.
     * @param iInteractiveState {Object}
     */
    updateInteractiveState: function (iInteractiveState) {
      if (!iInteractiveState) {
        return;
      }
      interactiveState = Object.assign(interactiveState, iInteractiveState);
    },

    destroy: function () {
      // todo : more to do?
      connection = null;
    },

    /**
     * Sends a request to CODAP. The format of the message is as defined in
     * {@link https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API}.
     *
     * @param message {String}
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
            stats.countDiRplTimeout++;
          } else {
            connectionState = 'active';
            if (response.success) { stats.countDiRplSuccess++; } else { stats.countDiRplFail++; }
            resolve(response);
          }
          if (callback) {
            callback(response, request);
          }
        }
        switch (connectionState) {
          case 'closed': // log the message and ignore
            console.warn('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
            reject('sendRequest on closed CODAP connection: ' + JSON.stringify(message));
            break;
          case 'preinit': // warn, but issue request.
            console.log('sendRequest on not yet initialized CODAP connection: ' +
                JSON.stringify(message));
            /* falls through */
          default:
            if (connection) {
              stats.countDiReq++;
              stats.timeDiLastReq = new Date();
              if (!stats.timeDiFirstReq) {
                stats.timeCodapFirstReq = stats.timeDiLastReq;
              }

              connection.call(message, function (response) {
                handleResponse(message, response, callback);
              });
            } else {
              console.error('sendRequest on non-existent CODAP connection');
            }
        }
      });
    },

    /**
     * Registers a handler to respond to CODAP-initiated requests and
     * notifications. See {@link https://github.com/concord-consortium/codap/wiki/CODAP-Data-Interactive-API#codap-initiated-actions}
     *
     * @param actionSpec {'get' || 'notify'} (optional) Action to handle. Defaults to 'notify'.
     * @param resourceSpec {String} A resource string.
     * @param operation {String} (optional) name of operation, e.g. 'create', 'delete',
     *   'move', 'resize', .... If not specified, all operations will be reported.
     * @param handler {Function} A handler to receive the notifications.
     */
    on: function (actionSpec, resourceSpec, operation, handler) { // eslint-disable-line no-unused-vars
      var as = 'notify',
          rs,
          os,
          hn;
      var args = Array.prototype.slice.call(arguments);
      if (['get', 'update', 'notify'].indexOf(args[0]) >= 0) {
        as = args.shift();
      }
      rs = args.shift();
      if (typeof args[0] !== 'function') {
        os = args.shift();
      }
      hn = args.shift();

      notificationSubscribers.push({
        actionSpec: as,
        resourceSpec: rs,
        operation: os,
        handler: hn
      });
    },

    /**
     * Parses a resource selector returning a hash of named resource names to
     * resource values. The last clause is identified as the resource type.
     * E.g. converts 'dataContext[abc].collection[def].case'
     * to {dataContext: 'abc', collection: 'def', type: 'case'}
     *
     * @param {String} iResource
     * @return {Object}
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
    }
  };

  if (typeof module !== 'undefined') {
    module.exports = codapInterface;
  } else {
    global.codapInterface = codapInterface;
  }
}(this));
