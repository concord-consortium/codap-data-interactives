// ==========================================================================
//
//  Author:   Doug Martin, adapted from DataCard by jsandoe
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
/* jshint strict: false */
/*global console:true,iframePhone:true,React:true, ReactDOM:true, firebase:true */

var STARTING_CONNECTION_STATE = 'initialized',
    TIMEDOUT_CONNECTION_STATE = 'timed-out',
    ACTIVE_CONNECTION_STATE = 'active',
    FIREBASE_ATTRIBUTE_PREFIX = '___collaborationKey',
    FIREBASE_PARENT_COLLABORATION_KEY_VALUE_KEY  = 'collaborationKeyValue',
    FIREBASE_PARENT_COLLECTION_NAME_KEY  = 'collectionName';

var dataManager = Object.create({

  state: null,

  init: function () {
    this.listeners = [];
    this.collaborationContexts = {};
    this.state = {
      title: "Collaboration Service",
      version: "0.1",
      dimensions: {
        width: 300,
        height: 200
      },
      contextList: [],

      wizardStep: 'start',
      subgroups: false,
      username: '',
      groupname: '',
      connectionState: STARTING_CONNECTION_STATE,
      collaborationKey: null,
      users: {},
      collaborativeContextList: [],
      connected: true
    };
    return this;
  },

  getOrGenerateCollaborationKey: function () {
    if (!this.state.collaborationKey) {
      // adapted from http://stackoverflow.com/a/2117523
      this.state.collaborationKey = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8); // jshint ignore:line
        return v.toString(16);
      });
    }
    return this.state.collaborationKey;
  },

  register: function (listener) {
    this.listeners = this.listeners || [];
    this.listeners.push(listener);
    listener.setState(this.state);
  },

  unregister: function (listener) {
    this.listeners = this.listeners || [];
    var ix = this.listeners.indexOf(listener);
    if (ix >= 0) {
      this.listeners.splice(ix, 1);
    }
    dispatcher.destroy();
  },

  notify: function () {
    this.listeners.forEach(function (listener) {
      listener.setState(this.state);
    }.bind(this));
  },

  setInteractiveFrame: function (frameData) {
    if (frameData.dimensions) {
      this.state.dimensions = frameData.dimensions;
    }
    if (frameData.title) {
      this.state.title = frameData.title;
    }
    if (frameData.savedState) {
      Object.assign(this.state, frameData.savedState);
    }
    dispatcher.sendRequest({
      action: 'update',
      resource: 'interactiveFrame',
      values: {
        title: this.state.title,
        version: this.state.version,
        preventBringToFront: false,
        dimensions: this.state.dimensions
      }
    });
  },

  getPersistentState: function () {
    var state = this.state;
    return {
      wizardStep: state.wizardStep,
      subgroups: state.subgroups,
      username: state.username,
      groupname: state.groupname,
      collaborationKey: state.collaborationKey,
      collaborativeContextList: state.collaborativeContextList
    };
  },

  requestDataContextList: function () {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContextList'
    });
  },

  requestDataContext: function (contextName, handler) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + contextName + ']'
    }, {}, handler);
  },

  requestAttributeCreate: function (contextName, collectionName, attrName, attrTitle, handler) {
    dispatcher.sendRequest({
      action: 'create',
      resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].attribute',
      values: [{
        name: attrName,
        title: attrTitle,
        hidden: true
      }]
    }, {}, handler);
  },

  requestCaseCount: function (contextName, collectionName, handler) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].caseCount',
    }, {}, handler);
  },

  requestCaseSearch: function (contextName, collectionName, query, handler) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].caseSearch[' + query + ']'
    }, {}, handler);
  },

  requestDeleteCaseByIndex: function (contextName, collectionName, caseIndex, handler) {
    dispatcher.sendRequest({
      action: 'delete',
      resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].caseByIndex[' + caseIndex + ']',
    }, {}, handler);
  },

  requestCaseById: function (contextName, caseID, handler) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + contextName + '].caseByID[' + caseID + ']',
    }, {}, handler);
  },

  requestDeleteAllCases: function (contextName, handler) {
    dispatcher.sendRequest({
      action: 'delete',
      resource: 'dataContext[' + contextName + '].allCases',
    }, {}, handler);
  },

  setContextList: function (contextList) {
    this.state.contextList = contextList;
    if (this.state.wizardStep === 'showActiveUsers') {
      this.initializeCollaboration();
    }
    this.notify();
  },


  getState: function () {
    return this.state;
  },

  dataContextCountDidChange: function () {
    this.requestDataContextList();
  },

  dataContextDidChange: function (dataContextName, action) {
    var operation = action.operation;
    switch (operation) {
      case 'createCollection':
      case 'deleteCollection':
      case 'moveAttribute':
      case 'createAttributes':
      case 'deleteAttributes':
      case 'updateAttributes':
        this.requestDataContext(dataContextName);
        break;
      case 'createCases':
      case 'createCase':
      case 'updateCases':
      case 'deleteCases':
        if (action.result.caseIDs) {
          this.codapDidChangeCases(dataContextName, operation, action.result.caseIDs);
        }
        break;
    }
    return true;
  },

  codapDidChangeCases: function (dataContextName, operation, caseIDs) {
    var self = this,
        cases,
        processCases;

    processCases = function () {
      var _case = cases.shift(),
          collectionName = _case && _case.collection.name,
          collaborationCollection = _case
              && self.collaborationContexts[dataContextName]
                ? self.collaborationContexts[dataContextName].collections[collectionName]
                : null,
          values = {},
          updates = {},
          processNextCase = true,
          pushRef, firebaseKeyValue, updateRequest;

      if (collaborationCollection) {
        firebaseKeyValue = _case.values[collaborationCollection.firebaseKey];

        switch (operation) {
          case 'createCases':
            if (!firebaseKeyValue) {
              pushRef = collaborationCollection.casesRef.push();
              values[collaborationCollection.firebaseKey] = pushRef.key;
              values['Collaborator_' + collectionName] = self.state.username;
              _case.values['Collaborator_' + collectionName] = self.state.username;

              updateRequest = {
                action: 'update',
                resource: 'dataContext[' + dataContextName + '].collection[' + collectionName + '].caseByID[' + _case.id + ']',
                values: {
                  values: values // thats a lot of values :)
                }
              };

              if (_case.parent) {
                processNextCase = false;
                updateRequest.parent = _case.parent;

                self.requestCaseById(dataContextName, _case.parent, function (request, result) {
                  var parentCollectionName = result.values.case.collection.name,
                      parentCollection = self.collaborationContexts[dataContextName].collections[parentCollectionName],
                      parent = {};

                  parent[FIREBASE_PARENT_COLLECTION_NAME_KEY] = parentCollectionName;
                  parent[FIREBASE_PARENT_COLLABORATION_KEY_VALUE_KEY] = result.values.case.values[parentCollection.firebaseKey];

                  dispatcher.sendRequest(updateRequest, {}, function (request, result) {
                    pushRef.set({
                      parent: parent,
                      values: _case.values
                    });
                    processCases();
                  });
                });
              }
              else {
                dispatcher.sendRequest(updateRequest, {}, function (request, result) {
                  pushRef.set({
                    values: _case.values
                  });
                });
              }
            }
            break;

          case 'updateCases':
            if (firebaseKeyValue) {
              delete _case.values[collaborationCollection.firebaseKey];
              updates[firebaseKeyValue] = {values: _case.values};
              collaborationCollection.casesRef.update(updates);
            }
            break;

          case 'deleteCases':
            if (firebaseKeyValue) {
              updates[firebaseKeyValue] = null;
              collaborationCollection.casesRef.update(updates);
            }
            break;
        }

        if (processNextCase) {
          processCases();
        }
      }
    };
    var caseRequests = caseIDs.map( function( iID) {
      return {
        action: 'get',
        resource: 'dataContext[' + dataContextName + '].caseByID[' + iID + ']',
      }
    });
    dispatcher.sendRequest( caseRequests, null,     function (iRequests, iResults) {
          cases = iResults.map( function( iResult) {
            return iResult.success ? iResult.values.case : null;
          });
          processCases();
        });
  },

  updateStateProperty: function (property, value, skipNotify) {
    this.state[property] = value;
    if (!skipNotify) {
      this.notify();
    }
  },

  setConnectionState: function (connectionState) {
    this.updateStateProperty('connectionState', connectionState);
  },

  setWizardStep: function (wizardStep) {
    if (wizardStep === 'promptForGroupname') {
      this.getOrGenerateCollaborationKey();
    }
    else if ((wizardStep === 'promptForUsername') || (wizardStep === 'showActiveUsers')) {
      if (wizardStep === 'showActiveUsers') {
        this.initializeCollaboration();
      }
      dispatcher.connectToFirebase();
    }
    this.updateStateProperty('wizardStep', wizardStep);
  },

  setSubgroups: function (subgroups) {
    this.updateStateProperty('subgroups', subgroups);
  },

  setGroupname: function (groupname) {
    this.updateStateProperty('groupname', groupname);
  },

  setUsername: function (username) {
    this.updateStateProperty('username', username);
  },

  setUsers: function (users) {
    this.updateStateProperty('users', users);
  },

  setCollaborativeContextList: function (collaborativeContextList) {
    this.updateStateProperty('collaborativeContextList', collaborativeContextList);
  },

  setConnected: function (connected) {
    this.updateStateProperty('connected', connected);
  },

  findCaseByCollaborationKey: function (contextName, collectionName, collaborationKey, collaborationKeyValue, callback) {
    var query = collaborationKey + '==' + collaborationKeyValue;
    this.requestCaseSearch(contextName, collectionName, query, function (request, result) {
      var cases = (result && result.success ? result.values : [] ) || [];
      callback(cases ? cases[0] : null);
    });
  },

  initializeCollaboration: function () {
    var self = this,
        contextQueue, processContextQueue;

    // don't initialize until we have the list of contexts from CODAP and at least one context marked as collaborative
    if ((this.state.contextList.length === 0) || (this.state.collaborativeContextList.length === 0)) {
      return;
    }

    contextQueue = this.state.collaborativeContextList.slice(0);
    processContextQueue = function () {
      var context = contextQueue.shift();
      if (!context) {
        return;
      }

      if (!self.collaborationContexts[context.name]) {
        self.collaborationContexts[context.name] = {
          collections: {}
        };
      }

      self.requestDataContext(context.name, function (request, result) {
        var collectionQueue = (result && result.values ? result.values.collections : null) || [],
            processCollectionQueue;

        processCollectionQueue = function () {
          var collection = collectionQueue.shift(),
              fbAttr, firebaseKey;

          if (!collection) {
            processContextQueue();
            return;
          }

          fbAttr = collection.attrs.find(function (attr) {
            return attr.name.substr(0, FIREBASE_ATTRIBUTE_PREFIX.length) === FIREBASE_ATTRIBUTE_PREFIX;
          });
          firebaseKey = fbAttr ? fbAttr.name : FIREBASE_ATTRIBUTE_PREFIX + "_" + Math.round(9007199254740991 * Math.random()); // 9007199254740991 is the max safe integer in Javascript

          if (!self.collaborationContexts[context.name].collections[collection.name]) {
            self.collaborationContexts[context.name].collections[collection.name] = {
              deletedLocalCases: false,
              firebaseKey: firebaseKey,
              casesRef: dispatcher.createFirebaseRef('contexts/' + context.name + '/collections/' + collection.name + '/cases')
            };
          }

          if (fbAttr) {
            self.deleteLocalCases(context.name, collection.name, processCollectionQueue);
          }
          else {
            self.requestAttributeCreate(context.name, collection.name, 'Collaborator_' + collection.name, 'Collaborator', function (request, result) {
              self.requestAttributeCreate(context.name, collection.name, firebaseKey, 'Firebase Key', function (request, result) {
                self.deleteLocalCases(context.name, collection.name, processCollectionQueue);
              });
            });
          }
        };
        processCollectionQueue();
      });
    };
    processContextQueue();
  },

  deleteLocalCases: function (contextName, collectionName, done) {
    var self = this,
        collaborativeCollection = this.collaborationContexts[contextName].collections[collectionName];

    // only delete local cases once per collection
    if (collaborativeCollection.deletedLocalCases) {
      done();
      return;
    }
    collaborativeCollection.deletedLocalCases = true;

    this.requestDeleteAllCases(contextName, function (request, result) {
      // now that all the saved cases have been deleted start listening to firebase for changes
      self.addFirebaseListeners(contextName, collectionName);
      done();
    });
  },

  addFirebaseListeners: function (contextName, collectionName) {
    var self = this,
        collaborativeCollection = self.collaborationContexts[contextName].collections[collectionName],
        casesRef = collaborativeCollection.casesRef,
        firebaseKey = collaborativeCollection.firebaseKey,
        addFirebaseKeyToValues, sendRequestWithParentIfPresent;

    addFirebaseKeyToValues = function (snapshot) {
      var values = snapshot.val() || {};
      values.values = values.values || {};
      values.values[firebaseKey] = snapshot.key;
      return values;
    };

    sendRequestWithParentIfPresent = function (request, values) {
      var parent = values.parent || {},
          parentCollectionName = parent[FIREBASE_PARENT_COLLECTION_NAME_KEY],
          parentCollaborationKeyName = parentCollectionName ? self.collaborationContexts[contextName].collections[parentCollectionName].firebaseKey : null,
          parentCollaborationKeyValue = parent[FIREBASE_PARENT_COLLABORATION_KEY_VALUE_KEY];

      if (parentCollectionName && parentCollaborationKeyName && parentCollaborationKeyValue) {
        self.findCaseByCollaborationKey(contextName, parentCollectionName, parentCollaborationKeyName, parentCollaborationKeyValue, function (_case) {
          if (_case) {
            request.values.parent = _case.id;
          }
          dispatcher.sendRequest(request);
        });
      }
      else {
        dispatcher.sendRequest(request);
      }
    };

    casesRef.on('child_added', function (snapshot) {
      self.findCaseByCollaborationKey(contextName, collectionName, firebaseKey, snapshot.key, function (_case) {
        if (!_case) {
          var values = addFirebaseKeyToValues(snapshot);
          sendRequestWithParentIfPresent({
            action: 'create',
            resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].case',
            values: {
              values: values.values
            }
          }, values);
        }
      });
    });

    casesRef.on('child_changed', function (snapshot) {
      self.findCaseByCollaborationKey(contextName, collectionName, firebaseKey, snapshot.key, function (_case) {
        if (_case) {
          var values = addFirebaseKeyToValues(snapshot);
          sendRequestWithParentIfPresent({
            action: 'update',
            resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].caseByID[' + _case.id + ']',
            values: {
              values: values.values
            }
          }, values);
        }
      });
    });

    casesRef.on('child_removed', function (snapshot) {
      self.findCaseByCollaborationKey(contextName, collectionName, firebaseKey, snapshot.key, function (_case) {
        if (_case) {
          sendRequestWithParentIfPresent({
            action: 'delete',
            resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].caseByID[' + _case.id + ']'
          }, snapshot.val());
        }
      });
    });
  }

}).init();

var dispatcher = Object.create({ // jshint ignore:line

    init: function () {
      firebase.initializeApp({
        apiKey: "AIzaSyBkHsVd9ZUNL0Uy6SbqbaOn8nwIvmlwW9M",
        authDomain: "codap-collaborations.firebaseapp.com",
        databaseURL: "https://codap-collaborations.firebaseio.com",
        storageBucket: "codap-collaborations.appspot.com",
        messagingSenderId: "1047171460112"
      });
      this.database = firebase.database();
      this.connectedToFirebase = false;
      this.firebaseKey = null;
      this.usersRef = null;
      this.userRef = null;

      this.connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
      this.connectionState = STARTING_CONNECTION_STATE;
      this.sendRequest({
        "action": "get",
        "resource": "interactiveFrame"
      });
      window.onunload = this.destroy.bind(this);

      return this;
    },

    destroy: function () {
      this.connection.disconnect();
    },

    connectToFirebase: function () {
      var self = this,
          state = dataManager.getState(),
          collaborationKey, safeGroupname;

      if (!this.connectedToFirebase) {
        collaborationKey = dataManager.getOrGenerateCollaborationKey();

        this.firebaseKey = collaborationKey;
        if (state.subgroups && (state.groupname.length > 0)) {
          safeGroupname = state.groupname.replace(/[.$#[\]]/g, ''); // remove invalid firebase key characters from groupname
          this.firebaseKey += ':' + safeGroupname;
        }
        this.usersRef = this.createFirebaseRef('users');
        this.usersRef.on('value', function (snapshot) {
          dataManager.setUsers(snapshot.val());
        });
      }
      this.connectedToFirebase = true;

      if (state.username && !this.userRef) {
        this.establishPresence();
      }

      if (!this.connectedRef) {
        this.connectedRef = this.database.ref(".info/connected");
        this.connectedRef.on("value", function(snapshot) {
          var connected = snapshot.val() === true;
          if (connected) {
            self.establishPresence();
          }
          dataManager.setConnected(connected);
        });
      }
    },

    establishPresence: function () {
      var state = dataManager.getState();
      if (!state.username) {
        return;
      }
      if (!this.userRef) {
        this.userRef = this.usersRef.child(state.username);
      }
      this.userRef.set(true);
      if (this.onDisconnectRef) {
        this.onDisconnectRef.cancel();
      }
      this.onDisconnectRef = this.userRef.onDisconnect();
      this.onDisconnectRef.set(null);
    },

    createFirebaseRef: function (subKey) {
      return this.database.ref(this.firebaseKey + '/' + subKey);
    },

    handleCODAPRequest: function (request, callback) {
      function getResourceType(resourceSelector) {
        return resourceSelector && resourceSelector.match(/^[^[]*/)[0];
      }
      function getContext(resourceSelector) {
        var match = resourceSelector.match(/^[^[]*\[([^\]]*)]/);
        if (!match) {
          return '#default';
        } else {
          return match[1];
        }
      }
      var resourceType = getResourceType(request.resource);
      var success = false;
      var values = null;
      switch (resourceType) {
        case 'interactiveState':
          if (request.action === 'get') {
            success = true;
            values = dataManager.getPersistentState();
          }
          break;
        case 'dataContextChangeNotice':
          var contextName = getContext(request.resource);
          success = true;
          request.values.forEach(function(action) {
            dataManager.dataContextDidChange(contextName, action);
          });
          break;
        case 'documentChangeNotice':
          if (request.values.operation === 'dataContextCountChanged') {
            dataManager.dataContextCountDidChange();
            success = true;
          }
          break;
        default:
          console.log('Unsupported request from CODAP to DI: ' +
              JSON.stringify(request));      }
      callback({success: success, values: values});
    },

    sendRequest: function (request, handlingOptions, handler) {
      handler = handler || this.handleResponse.bind(this);
      this.connection.call(request, function (response) {
        handler(request, response, handlingOptions);
      }.bind(this));
    },

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

    handleResponse: function (request, result, handlingOptions) {
      function handleOneResponse(iRequest, iResult, iResourceType) {
        if (!iResult.success) {
          console.log('Request to CODAP Failed: ' + JSON.stringify(request));
        } else if (request.action === 'get') {
          switch (iResourceType) {
            case 'interactiveFrame':
              dataManager.setInteractiveFrame(iResult.values);
              if (iResult.values.savedState && iResult.values.savedState.wizardStep) {
                dataManager.setWizardStep(iResult.values.savedState.wizardStep);
              }
              dataManager.requestDataContextList();
              break;
            case 'dataContextList':
              dataManager.setContextList(iResult.values);
              break;
          }
        } else if (request.action === 'update') {
          switch (iResourceType) {
            case 'interactiveFrame':
              dataManager.requestDataContextList();
              break;
          }
        } else {
        }
      }
      var resourceObj;
      var STARTING_CONNECTION_STATE = this.connectionState;

      if (!result) {
        console.log('Request to CODAP timed out: ' + JSON.stringify(request));
        this.connectionState = TIMEDOUT_CONNECTION_STATE;
      } else if (Array.isArray(result)) {
        this.connectionState = ACTIVE_CONNECTION_STATE;
        request.forEach(function (rq, rqix) {
          resourceObj  = this.parseResourceSelector(rq.resource);
          handleOneResponse(rq, result[rqix], resourceObj.type);
        }.bind(this));
      } else {
        this.connectionState = ACTIVE_CONNECTION_STATE;
        resourceObj  = this.parseResourceSelector(request.resource);
        handleOneResponse(request, result, resourceObj.type)
      }
      if (STARTING_CONNECTION_STATE !== this.connectionState) {
        dataManager.setConnectionState(this.connectionState);
      }
    }
  }).init();

var div = React.DOM.div,
    form = React.DOM.form,
    button = React.DOM.button,
    input = React.DOM.input;

var WizardStepView = React.createFactory(React.createClass({
  render: function () {
    return div({className: 'wizard-step'},
      this.props.children,
      div({className: 'nav-buttons'},
        this.props.back ? button({onClick: this.props.back}, '<< Back') : null,
        this.props.forward ? button({onClick: this.props.forward, className: 'next-button', disabled: !!this.props.disableForward}, 'Next >>') : null,
        this.props.done ? button({onClick: this.props.done, className: 'done-button'}, 'Done') : null
      )
    );
  }
}));

var CollaborationServiceAppView = React.createFactory(React.createClass({
  getInitialState: function () {
    return dataManager.getState();
  },

  componentDidMount: function () {
    dataManager.register(this);
  },

  componentWillUnmount: function () {
    dataManager.unregister(this);
  },

  stepForward: function () {
    this.nextWizardStep("forward");
  },

  stepBack: function () {
    this.nextWizardStep("backward");
  },

  nextWizardStep: function (direction, _currentStep) {
    var wizardSteps = ["start", "promptForDataContexts", "promptForSubgroups", "readyToShare", "promptForGroupname", "promptForUsername", "showActiveUsers"],
        currentStep = _currentStep || this.state.wizardStep,
        currentIndex = wizardSteps.indexOf(currentStep) || 0,
        newIndex = direction === "forward" ? Math.min(wizardSteps.length - 1, currentIndex + 1) : Math.max(0, currentIndex - 1),
        newStep = wizardSteps[newIndex];

    if ((newStep === "promptForGroupname") && !this.state.subgroups) {
      this.nextWizardStep(direction, "promptForGroupname");
    }
    else {
      dataManager.setWizardStep(newStep);
    }
  },

  renderStartStep: function () {
    return div({},
      div({}, "This data interactive helper enables you to add collaboration to any other data interactive."),
      div({}, "Use the buttons below to navigate through the steps to setup the collaboration.")
    );
  },

  changedSubgroup: function (e) {
    dataManager.setSubgroups(e.target.value === "yes");
  },

  renderPromptForSubgroupsStep: function () {
    return div({},
      div({}, "How to you want to setup the collaboration?"),
      div({}, input({type: "radio", name: "subgroups", value: "no", checked: !this.state.subgroups, onChange: this.changedSubgroup}), "Everyone collaborates in a single group"),
      div({}, input({type: "radio", name: "subgroups", value: "yes", checked: this.state.subgroups, onChange: this.changedSubgroup}), "People collaborate in separate groups")
    );
  },

  dataContextListChanged: function () {
    var list = [],
        i, context, item;

    for (i = 0; i < this.state.contextList.length; i++) {
      context = this.state.contextList[i];
      item = this.refs["context" + context.id];
      if (item.checked) {
        list.push(context);
      }
    }
    dataManager.setCollaborativeContextList(list);
  },

  renderPromptForDataContextsStep: function () {
    var list = [],
        selectedIds = [],
        context, i;

    if (this.state.contextList.length === 0) {
      return div({}, "Waiting for a data context to become available in CODAP...");
    }
    else {
      for (i = 0; i < this.state.collaborativeContextList.length; i++) {
        selectedIds.push(this.state.collaborativeContextList[i].id);
      }
      for (i = 0; i < this.state.contextList.length; i++) {
        context = this.state.contextList[i];
        list.push(div({key: "item" + i},
          input({
            type: "checkbox",
            value: context.id,
            ref: 'context' + context.id,
            checked: selectedIds.indexOf(context.id) !== -1,
            onChange: this.dataContextListChanged
          }),
          context.title.length > 0 ? context.title : context.name
        ));
      }
      return div({},
        div({}, "What data contexts do you want to make collaborative?"),
        list
      );
    }
  },

  renderReadyToShareStep: function () {
    return div({},
      div({}, "You collaboration will be ready to share after you press the done button."),
      div({}, "To generate a shared view use the 'Share > Get link to shared view' option in the top left menu.")
    );
  },

  trim: function (s) {
    return s.replace(/^\s+|\s+$/g, "");
  },

  groupnameChanged: function () {
    dataManager.setGroupname(this.refs.groupname.value);
  },

  submitGroupname: function (e) {
    e.preventDefault();
    if (this.trim(this.state.groupname).length > 0) {
      this.nextWizardStep("forward");
    }
  },

  renderPromptForGroupname: function () {
    return div({className: 'wizard-step'},
      form({onSubmit: this.submitGroupname},
        div({}, "Please enter your group's name"),
        div({}, input({type: "text", ref: "groupname", value: this.state.groupname, onChange: this.groupnameChanged})),
        div({}, input({type: "submit", disabled: this.trim(this.state.groupname).length === 0, value: "Submit"}))
      )
    );
  },

  usernameChanged: function () {
    dataManager.setUsername(this.refs.username.value);
  },

  submitUsername: function (e) {
    var username = this.trim(this.state.username);
    e.preventDefault();
    if (username.length > 0) {
      if (this.state.users && this.state.users[username]) {
        alert("Sorry, " + username + " is already being used.  Please pick another name.");
      }
      else {
        this.nextWizardStep("forward");
      }
    }
  },

  renderPromptForUsername: function () {
    if (!this.state.connected) {
      return this.renderDisconnected();
    }
    return div({className: 'wizard-step'},
      this.renderUserList(""),
      form({onSubmit: this.submitUsername},
        div({}, "Please enter your name"),
        div({}, input({type: "text", ref: "username", value: this.state.username, onChange: this.usernameChanged})),
        div({}, input({type: "submit", disabled: this.trim(this.state.username).length === 0, value: "Submit"}))
      )
    );
  },

  renderShowActiveUsers: function () {
    if (!this.state.connected) {
      return this.renderDisconnected();
    }
    return this.renderUserList(this.state.username);
  },

  renderUserList: function (username) {
    var users = Object.keys(this.state.users || {}),
        usernameIndex = users.indexOf(username),
        message = "", usernames;

    if (usernameIndex !== -1) {
      users.splice(usernameIndex, 1);
    }
    usernames = users.join(" and ");

    if (username.length > 0) {
      message = "Hello " + this.state.username + ". " + (users.length === 0 ? "You are not collaborating with anyone right now" : "You are collaborating with " + usernames);
    }
    else {
      message = (users.length === 0 ? "Nobody is collaborating right now" : usernames + " " + (users.length === 1 ? "is" : "are") + " currently collaborating");
    }
    message += this.state.subgroups && this.state.groupname ? " in the '" + this.state.groupname + "' group." : ".";

    return div({className: 'userlist'}, message);
  },

  renderDisconnected: function () {
    return div({className: 'disconnected'}, "Waiting for a connection to the Internet...");
  },

  componentDidUpdate: function () {
    if (this.refs.groupname) {
      this.refs.groupname.focus();
    }
    else if (this.refs.username) {
      this.refs.username.focus();
    }
  },

  render: function () {
    var wizardStep = this.state.wizardStep;
    if (this.state.connectionState === STARTING_CONNECTION_STATE) {
      return div({}, "Waiting to connect with CODAP...");
    }
    else if ((this.state.connectionState === TIMEDOUT_CONNECTION_STATE) && (window.location.search.indexOf('testOutsideOfCODAP') === -1)) {
      return div({}, "Could not connect with CODAP!");
    }
    else if (wizardStep === "promptForDataContexts") {
      return WizardStepView({forward: this.stepForward, back: this.stepBack, disableForward: this.state.collaborativeContextList.length === 0},
        this.renderPromptForDataContextsStep({})
      );
    }
    else if (wizardStep === "promptForSubgroups") {
      return WizardStepView({forward: this.stepForward, back: this.stepBack},
        this.renderPromptForSubgroupsStep({})
      );
    }
    else if (wizardStep === "readyToShare") {
      return WizardStepView({done: this.stepForward, back: this.stepBack},
        this.renderReadyToShareStep({})
      );
    }
    else if (wizardStep === "promptForGroupname") {
      return this.renderPromptForGroupname({});
    }
    else if (wizardStep === "promptForUsername") {
      return this.renderPromptForUsername({});
    }
    else if (wizardStep === "showActiveUsers") {
      return this.renderShowActiveUsers({});
    }
    else /* start step */ {
      return WizardStepView({forward: this.stepForward},
        this.renderStartStep({})
      );
    }
  }
}));

ReactDOM.render(CollaborationServiceAppView({}), document.getElementById('container'));

