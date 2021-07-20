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
/* jshint strict: false */
/*global console:true,iframePhone:true,React:true, ReactDOM:true */
/**
 * dataManager responsible for managing the CaseTableApp's state:
 *
 */
var dataManager = Object.create({

  /**
   * @property state {{
   *   collectionInfoList: {[Object]},
   *   contextNameList: {[string]},
   *   currentContext: {string},
   *   dimensions: {{width: {number}, height: {number}}},
   *   hasSelectedContext: {boolean},
   *   mode: {'browse'|'design'},
   *   title: {string},
   *   version: {string}
   * }}
   */
  state: null,

  /**
   * Creates initial state.
   * @returns {dataManager}
   */
  init: function () {
    this.listeners = [];
    this.state = {
      title: "Data Card",
      version: "0.1",
      dimensions: {
        width: 500,
        height: 600
      },
      collectionInfoList: [],
      contextNameList: [],
      currentContext: null,
      mode: 'browse'
    };
    return this;
  },

  /**
   * Registers a listener to changes in state.
   * @param {object} listener
   */
  register: function (listener) {
    this.listeners = this.listeners || [];
    this.listeners.push(listener);
    listener.setState(this.state);
  },

  /**
   * Removes a listener
   * @param {object} listener
   */
  unregister: function (listener) {
    this.listeners = this.listeners || [];
    var ix = this.listeners.indexOf(listener);
    if (ix >= 0) {
      this.listeners.splice(ix, 1);
    }
    dispatcher.destroy();
  },

  /**
   * Notifies registered listeners about changes of state by calling setState.
   */
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

  /**
   * Return the portion of the DI state regarded as persistent across restart.
   * @returns {{currentContext: (null|*)}}
   */
  getPersistentState: function () {
    var state = this.state;
    return {
      currentContext: state.currentContext
    };
  },

  /**
   * Request update of data context list from CODAP.
   */
  requestDataContextList: function () {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContextList'
    });
  },

  /**
   * Request dataContext information for a context.
   * @param contextName
   */
  requestDataContext: function (contextName) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + contextName + ']'
    });
  },

  requestSelectionList: function (dataContext) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + dataContext + '].selectionList'
    });
  },

  requestCaseByIndex: function (contextName, collectionName, collectionIndex) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + contextName + '].collection[' +
      collectionName + '].caseByIndex[' + collectionIndex + ']'
    });
  },

  requestCaseByID: function (dataContext, collectionName, caseID, select) {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContext[' + dataContext + '].collection[' +
      collectionName + '].caseByID[' + caseID + ']'
    }, {omitSelection: !select});
  },

  setContextList: function (contextNameList) {
    var currentContextName = this.state.currentContext;
    this.state.contextNameList = contextNameList;
    if (currentContextName) {
      if (!contextNameList.find(function (contextInfo) {
            return contextInfo.name === currentContextName;
          })) {
        console.log('Initial currentContext missing:' + this.state.currentContext);
        this.state.currentContext = null;
      }
    }
    if (!currentContextName && contextNameList[0]) {
      currentContextName = this.state.currentContext = contextNameList[0].name;
    }
    this.requestDataContext(currentContextName);
    this.notify();
  },

  setDataCards: function (context) {
    function updateState(context, state) {
      var collectionInfoList = state.collectionInfoList;
      var newCollectionInfoList = [];
      context.collections.forEach(function (collection){
        var name = collection.name;
        var collectionInfo = collectionInfoList.find(function (collectionInfo) {
          return collectionInfo.collection.name === name;
        });
        if (collectionInfo) {
          collectionInfo.collection = collection;
          collectionInfo.isDirty = false;
        } else {
          collectionInfo = {
            collection: collection,
            currentCase: null,
            currentCaseIndex: 0,
            isDirty: false,
            caseCount: null,
            navEnabled: {}
          };
        }
        newCollectionInfoList.push(collectionInfo);
      });
      state.collectionInfoList = newCollectionInfoList;
    }

    var contextName = context.name;
    if (contextName !== this.state.currentContext) {
      this.state.currentContext = contextName;
      this.state.collectionInfoList = [];
    }

    updateState(context, this.state);
    this.state.collectionInfoList.forEach(function(collectionInfo) {
      var collection = collectionInfo.collection;
      var contextName = this.state.currentContext;
      this.requestCaseByIndex(contextName, collection.name, collectionInfo.currentCaseIndex);
    }.bind(this));
    this.state.hasSelectedContext = true;
    this.notify();
  },

  setCase: function (iCollectionName, values, resourceName, handlingOptions) {
    var guaranteeLeftCollectionIsParent = function (parentCollectionInfo, parentID, context) {
      var parentCollection = parentCollectionInfo.collection;
      var parentCase = parentCollectionInfo.currentCase;
      //var resource;
      if (parentCase && parentCase.id !== parentID) {
        this.requestCaseByID(context, parentCollection.name, parentID, false);
      }
    }.bind(this);

    var guaranteeRightCollectionIsChild = function (childCollectionInfo, myCase, context) {
      var childCollection = childCollectionInfo.collection;
      var childCase = childCollectionInfo.currentCase;
      //var resource;
      if (childCase && childCase.parent !== myCase.id) {
        if (myCase.children) {
          this.requestCaseByID(context, childCollection.name, myCase.children[0], false);
        }
      }
    }.bind(this);

    var myCase = values.case;
    var caseIndex = values.caseIndex;
    var collectionInfoList = this.state.collectionInfoList;
    var collectionIndex = collectionInfoList.findIndex(function (collectionInfo) {
      return collectionInfo.collection.name === iCollectionName;
    });
    console.log('addCase - caseID/caseIndex: ' + [myCase.id, caseIndex].join('/'));
    if (collectionIndex >= 0) {
      var collectionInfo = collectionInfoList[collectionIndex];
      collectionInfo.currentCaseIndex = Number(caseIndex);
      collectionInfo.currentCase = myCase;
      collectionInfo.currentCaseResourceName = resourceName;
      collectionInfo.currentCaseIsNew = false;
      if (collectionIndex > 0) {
        guaranteeLeftCollectionIsParent(collectionInfoList[collectionIndex - 1],
            myCase.parent, this.state.currentContext);
      }
      if (collectionIndex < collectionInfoList.length - 1) {
        guaranteeRightCollectionIsChild(collectionInfoList[collectionIndex + 1],
            myCase, this.state.currentContext);
      }
      if (!handlingOptions || !handlingOptions.omitSelection) {
        dispatcher.sendRequest({action: 'create', resource: 'dataContext['
          + this.state.currentContext + '].selectionList', values: [myCase.id]});
      }
      this.setDirty(collectionInfo, false);
      this.notify();
    }
  },

  setMode: function (modeName) {
    this.state.mode = modeName;
    this.notify();
  },

  /**
   * Compute which types of navigation should be enabled for each collection
   * based on dirty flags.
   *
   */
  computeNavEnabled: function () {
    this.state.collectionInfoList.forEach(function (collectionInfo) {
      var navEnabledFlags = collectionInfo.navEnabled || {};
      var caseIndex = collectionInfo.currentCaseIndex;
      //var caseCount = collectionInfo.caseCount;
      var dirty = this.state.isDirty || false;
      navEnabledFlags.prev = !dirty && (caseIndex !== null) &&
          (caseIndex !== undefined) && caseIndex > 0;
      navEnabledFlags.next = !dirty; /*&& (caseCount !== null) &&
          (caseIndex !== undefined) && caseIndex < caseCount - 1;*/
      navEnabledFlags.newInstance = !dirty;
      navEnabledFlags.removeInstance = true;
      collectionInfo.navEnabled = navEnabledFlags;
    }.bind(this));
  },

  /**
   * Given an attribute name, returns the CollectionInfo object for the collection
   * that contains the attribute.
   * @param iAttributeName
   * @returns {object||null}
   */
  findCollectionInfoForAttribute: function (iAttributeName) {
    return this.state.collectionInfoList.find(function (collectionInfo) {
      var collection = collectionInfo.collection;
      var attr = collection.attrs.find(function (attr) { return attr.name === iAttributeName; });
      return attr !== undefined;
    });
  },

  /**
   * Given a collection name, returns the CollectionInfo object for the collection.
   * @param iCollectionName
   * @returns {object||null}
   */
  findCollectionInfoForName: function (iCollectionName) {
    return this.state.collectionInfoList.find(function (collectionInfo) {
      var collection = collectionInfo.collection;
      return (collection.name === iCollectionName);
    });
  },

  findCollectionIndexForName: function (iCollectionName) {
    return this.state.collectionInfoList.findIndex(function (collectionInfo) {
      var collection = collectionInfo.collection;
      return (collection.name === iCollectionName);
    });
  },

  setDirty: function (collectionInfo, isDirty) {
    collectionInfo.isDirty = isDirty;
    this.state.isDirty
        = this.state.collectionInfoList.reduce(function (sum, collectionInfo) {
      return sum || collectionInfo.isDirty;
    },  false );
    this.computeNavEnabled(collectionInfo);
  },

  createCase: function () {
    // find first dirty case
    var collectionIndex = this.state.collectionInfoList.findIndex(function (collectionInfo) {
      return collectionInfo.isDirty;
    });
    if (collectionIndex < 0) {
      this.notify();
      return;
    }
    var collectionInfo = this.state.collectionInfoList[collectionIndex];
    if (collectionIndex > 0) {
      collectionInfo.currentCase.parent
          = this.state.collectionInfoList[collectionIndex - 1].currentCase.id;
    }
    dispatcher.sendRequest({
      action: 'create',
      resource: collectionInfo.currentCaseResourceName,
      values: collectionInfo.currentCase
    });
  },
  didCreateCase: function (iCollectionName, iReply) {
    var collectionInfo = this.findCollectionInfoForName(iCollectionName);
    if (collectionInfo) {
      collectionInfo.currentCase.id = iReply.values[0].id;
      this.setDirty(collectionInfo, false);
      this.createCase();
      dispatcher.sendRequest({
        action: 'create',
        resource: 'dataContext[' + this.state.currentContext + '].selectionList',
        values: [iReply.values[0].id]
      });
    }
  },
  updateCase: function (collectionInfo) {
    if (collectionInfo === undefined) {
      this.state.collectionInfoList.forEach(function (collectionInfo) {
        this.updateCase(collectionInfo);
      }.bind(this) );
    } else if (collectionInfo.isDirty) {
      var resource = collectionInfo.currentCaseResourceName;
      var isNew = collectionInfo.currentCaseIsNew;
      var action = isNew? 'create': 'update';
      dispatcher.sendRequest({
        action: action,
        resource: resource,
        values: collectionInfo.currentCase
      });
    }
  },
  didUpdateCase: function(iCollectionName, iReply) {
    var collectionInfo = this.findCollectionInfoForName(iCollectionName);
    if (collectionInfo) {
      if (collectionInfo.currentCaseIsNew) {
        console.log('DidUpdateCase: reply=' + iReply.values &&
            iReply.values[0] && iReply.values[0].id);
        this.requestCaseByID(this.state.currentContext,
            collectionInfo.collection.name, iReply.values[0].id, true);
      }
      collectionInfo.currentCaseIsNew = false;
      this.setDirty(collectionInfo, false);
      this.notify();
    }
  },
  updateCurrentCaseValue: function (iAttributeName, iValue) {
    var collectionInfo = this.findCollectionInfoForAttribute(iAttributeName);
    var currentCase = collectionInfo && collectionInfo.currentCase;
    var values = currentCase && currentCase.values;
    if (values) {
      values[iAttributeName] = iValue;
      this.setDirty(collectionInfo, true);
      this.notify();
    }
  },

  getContextName: function () {
    return this.state.currentContext;
  },

  getCurrentCase: function (iCollectionName) {
    var collectionInfo = this.findCollectionInfoForName(iCollectionName);
    if (collectionInfo) {
      return collectionInfo.currentCase;
    }
  },
  getCurrentCaseIndex: function (iCollectionName) {
    var collectionInfo = this.findCollectionInfoForName(iCollectionName);
    if (collectionInfo) {
      return collectionInfo.currentCaseIndex;
    }
  },

  moveToSelectedCase: function (iCollectionName, action) {
    var collection = this.state.collectionInfoList.find(function (collectionInfo) {
      return collectionInfo.collection.name === iCollectionName;
    });
    var contextName = this.state.currentContext;
    var currentCaseIndex = collection.currentCaseIndex;
    console.log('selectCase: action: ' + action);
    switch (action) {
      case 'prev':
        this.requestCaseByIndex(contextName, iCollectionName, currentCaseIndex - 1);
        break;
      case 'next':
        this.requestCaseByIndex(contextName, iCollectionName, currentCaseIndex + 1);
        break;
      case 'new':
        this.startNewCase(iCollectionName, currentCaseIndex);
        break;
      case 'remove':
        console.log('Remove not implemented.');
        break;
      default:
    }
    this.notify();
  },
  startNewCase: function (iCollectionName) {

    function makeNewCase(collectionInfo, parentCollectionInfo, contextName) {
      var parentCase = parentCollectionInfo && parentCollectionInfo.currentCase;
      var caseValues = {};
      collectionInfo.collection.attrs.forEach(function (attr) {
        caseValues[attr.name] = '';
      });
      collectionInfo.currentCase = {
        parent: parentCase.id || parentCase.id,
        values: caseValues
      };
      collectionInfo.currentCaseIsNew = true;
      collectionInfo.currentCaseResourceName = 'dataContext[' + contextName +
          '].collection[' + collectionInfo.collection.name + '].case';
      // todo: how to find currentCaseIndex?
    }
    var contextName = this.getContextName();
    var collectionIndex = this.findCollectionIndexForName(iCollectionName);
    var ix;
    var collectionInfo;
    var parentCollectionInfo;
    for (ix = collectionIndex; ix < this.state.collectionInfoList.length; ix += 1) {
      collectionInfo = this.state.collectionInfoList[ix];
      parentCollectionInfo = (ix > 0) && this.state.collectionInfoList[ix - 1];
      makeNewCase(collectionInfo, parentCollectionInfo, contextName);
      this.setDirty(collectionInfo, true);
    }
    this.notify();
  },

  getState: function () {
    return this.state;
  },

  cancelCreateOrUpdateCase: function () {
    this.state.collectionInfoList.forEach(function(collectionInfo){
      if (collectionInfo.isDirty) {
        if (collectionInfo.currentCaseIsNew) {
          this.requestCaseByIndex(this.state.currentContext,
              collectionInfo.collection.name, collectionInfo.currentCaseIndex);
          this.setDirty(collectionInfo, false);
        } else {
          dispatcher.sendRequest({
            action: 'get',
            resource: collectionInfo.currentCaseResourceName
          });
        }
        collectionInfo.isNew = false;
      }
    }.bind(this));
  },

  dataContextCountDidChange: function () {
    this.requestDataContextList();
  },

  dataContextDidChange: function (dataContextName, action) {
    var operation = action.operation;
    if (dataContextName === this.state.currentContext) {
      switch (operation) {
        case 'selectCases':
          this.requestSelectionList(this.state.currentContext);
          break;
        case 'createCollection':
        case 'deleteCollection':
        case 'moveAttribute':
        case 'createAttributes':
        case 'deleteAttributes':
        case 'updateAttributes':
          this.requestDataContext(this.state.currentContext);
          break;
        case 'updateCases':
          this.codapDidUpdateCases(action.result.caseIDs);
          break;
        case 'deleteCases':
          break;
        default:
      }
    }
    return true;
  },

  codapDidUpdateCases: function (iCaseIDs) {
    if (!iCaseIDs) {
      return;
    }
    this.state.collectionInfoList.forEach(function (collectionInfo) {
      if (iCaseIDs.indexOf(collectionInfo.currentCase.id) >=0 ) {
        this.fetchSelectedCase({
          collectionName: collectionInfo.collection.name,
          caseID: collectionInfo.currentCase.id
        });
      }
    }.bind(this));
  },

  fetchSelectedCase: function (selection) {
    if (!selection) {
      return;
    }
    var collectionName = selection.collectionName;
    var caseID = selection.caseID;
    var collectionInfo = collectionName && this.findCollectionInfoForName(collectionName);
    if (collectionInfo) {
      this.requestCaseByID(this.state.currentContext, collectionInfo.collection.name, caseID, false);
    }
  }

}).init();

/**
 * dispatcher is responsible for routing actions
 *
 * @type {Object}
 */
var dispatcher = Object.create({
/*
    connection: null,
    connectionState: 'uninitialized',
    connectionSendCount: 0,
*/
    init: function () {
      this.connection = new iframePhone.IframePhoneRpcEndpoint(
          this.handleCODAPRequest, "data-interactive", window.parent);
      this.connectionState = 'initialized';
      this.sendRequest({
        "action": "get",
        "resource": "interactiveFrame"
      });
      window.onunload = this.destroy.bind(this);
      return this;
    },

    destroy: function () {
      console.log('Disconnecting from iFramePhone');
      this.connection.disconnect();
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
          } else {
            console.log('Unsupported interactiveState action, CODAP to DI: ' +
                JSON.stringify(request));
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
        // case 'undoChangeNotice':
        default:
          console.log('Unsupported request from CODAP to DI: ' +
              JSON.stringify(request));
      }
      callback({success: success, values: values});
    },

    sendRequest: function (request, handlingOptions) {
      this.connection.call(request, function (response) {
        this.handleResponse(request, response, handlingOptions);
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
      var resourceObj = this.parseResourceSelector(request.resource);
      if (!result) {
        console.log('Request to CODAP timed out: ' + JSON.stringify(request));
        this.connectionState = 'timed-out';
      } else if (!result.success) {
        console.log('Request to CODAP Failed: ' + JSON.stringify(request));
        this.connectionState = 'active';
      } else if (request.action === 'get') {
        this.connectionState = 'active';
        switch (resourceObj.type) {
          case 'interactiveFrame':
            dataManager.setInteractiveFrame(result.values);
            break;
          case 'dataContextList':
            dataManager.setContextList(result.values);
            break;
          case 'dataContext':
            dataManager.setDataCards(result.values);
            break;
          case 'caseByIndex':
          case 'caseByID':
            dataManager.setCase(resourceObj.collection, result.values,
                request.resource, handlingOptions);
            break;
          case 'selectionList':
            dataManager.fetchSelectedCase(result.values[0]);
            break;
          default:
            console.log('No handler for get response: ' + request.resource);
        }
      } else if (request.action === 'update') {
        this.connectionState = 'active';
        switch (resourceObj.type) {
          case 'interactiveFrame':
            dataManager.requestDataContextList();
            break;
          case 'caseByIndex':
          case 'caseByID':
            dataManager.didUpdateCase(resourceObj.collection, result);
            break;
          case 'selectionList':
            // nothing to do
            break;
          default:
            console.log('No handler for update response: ' + request.resource);
        }
      } else if (request.action === 'create') {
        this.connectionState = 'active';
        switch (resourceObj.type) {
          case 'case':
            dataManager.didCreateCase(resourceObj.collection, result);
            break;
          case 'selectionList':
            // nothing to do
            break;
          default:
            console.log('No handler for create response: ' + request.resource);
        }
      } else {
        this.connectionState = 'active';
      }
    }
  }).init();

/**
 * ContextSelector provides list of DataContexts present in CODAP and an interface for
 * selecting one.
 * @type {ClassicComponentClass<P>}
 */
var ContextSelector = React.createClass({
  propTypes: {
    contextNameList: React.PropTypes.array.isRequired,
    currentContextName: React.PropTypes.string.isRequired,
    onSelect: React.PropTypes.func.isRequired
  },

  render: function () {
    var onSelect = this.props.onSelect;
    var options = this.props.contextNameList.map(function (context) {
      var title = context.title || context.name;
      return (
          <option key={context.name} id={context.name}>{title}</option>
      );
    });
    return <label className="context-selector">Data Set:&nbsp;
        <select value={this.props.currentContextName}
            onChange={function (ev) {onSelect(ev.target.value)}} >{options}</select>
      </label >
  }
});

//var ModeSelector = React.createClass({
//  propTypes: {
//    mode: React.PropTypes.string.isRequired,
//    modes: React.PropTypes.array.isRequired,
//    onSelect: React.PropTypes.func.isRequired
//  },
//  render: function () {
//    var onSelect = this.props.onSelect;
//    function selectHandler(ev) {
//      onSelect(ev.target.value);
//    }
//    var modesView = this.props.modes.map(function (modeName) {
//      var isSelected = (modeName === this.props.mode);
//      return <label key={modeName}>
//        <input type="radio" name="mode" checked={isSelected} value={modeName}
//               onChange={selectHandler} /> {modeName}
//      </label>
//    }.bind(this));
//    return <div className="mode-selector">{modesView}</div>;
//  }
//});

/**
 * AttrList presents a list of attributes for a data card.
 * @type {ClassicComponentClass<P>}
 */
var AttrList = React.createClass({
  propTypes: {
    attrs: React.PropTypes.array.isRequired
  },
  render: function () {
    var items = this.props.attrs.map(function (item) {
      var title = item.title || item.name;
      return <div key={item.name} className="attr">{title}</div>
    });
    return <div className="attr-list">{items}</div>
  }
});

var CaseDisplay = React.createClass ({
  propTypes: {
    attrs: React.PropTypes.array.isRequired,
    myCase: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    var myCase = this.props.myCase;
    var values = this.props.attrs.map(function (attr) {
      var name = attr.name;
      var value = myCase? myCase.values[name]: '';
      var onChange = this.props.onChange;
      return <input
          type="text"
          className="attr-value"
          key={name}
          disabled={attr.formula && attr.formula.length>0}
          name={name}
          value={value}
          onChange={
            function (ev) { onChange(name, ev.target.value)}
            }/>;
    }.bind(this));
    return <div className="case">{values}</div>;
  }
});

var CaseList = React.createClass({
  propTypes: {
    collection: React.PropTypes.object.isRequired,
    currentCase: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    //var caseIndex = this.props.collection.currentCaseIndex || 0;
    var myCase = this.props.currentCase;
    var id = myCase? myCase.id: 'new';
    var caseView = <CaseDisplay key={id} attrs={this.props.collection.attrs}
                                myCase={myCase} onChange={this.props.onChange}/>;
    return <div className="case-container"> {caseView} </div>;
  }
});

var CaseNavControl = React.createClass({
  propTypes: {
    onNavigation: React.PropTypes.func.isRequired,
    navEnabled: React.PropTypes.bool.isRequired,
    action: React.PropTypes.string.isRequired
  },
  symbol: {
    prev: '<',
    next: '>',
    new: '+',
    remove: 'x'
  },
  handleClick: function (/*ev*/) {
    if (this.props.onNavigation) {
      this.props.onNavigation(this.props.action);
    }
  },
  render: function () {
    var disable = !this.props.navEnabled;
    if (disable) {
      return <button className="control" disabled="true"
                     onClick={this.handleClick}>{this.symbol[this.props.action]}</button>
    } else
      return <button className="control"
                     onClick={this.handleClick}>{this.symbol[this.props.action]}</button>
    }
  });

var DataCardAuthor = React.createClass({
  propTypes: {
    collection: React.PropTypes.object.isRequired,
    context: React.PropTypes.string.isRequired
  },

  render: function () {
    function makeAttrView (attr) {
      var name=  (attr && attr.name) || '#new';
      var title = attr && (attr.title || attr.name);
      attr = attr || {name: '', title: '', description: '', type: 'numeric', precision: 2};
      return <div key={name} className="attr-author">
        <input type="text" name="title" value={title}/>
        <input type="text" name="type" value={attr.type}/>
        <input type="text" name="description" value={attr.description}/>
        <input type="text" name="precision" value={attr.precision}/>


      </div>
    }
    var collection = this.props.collection;
    var title = collection.title || collection.name;
    var attrsList = collection.attrs.map(function (attr) {
      return makeAttrView (attr);
    });

    attrsList.push(makeAttrView());

    return <section className="card-section">
      <label>Collection Name <input name="collection-name" value={title} /></label>
        <div className="card-content">
          <div>
            {attrsList}
          </div>
          <input type="button" className="update-case"
                 onClick={this.updateCaseHandler} value="Update" />
        </div>
    </section>
  }

});

var SlideShowView = React.createClass({
  propTypes: {
    collection: React.PropTypes.object.isRequired,
    navEnabled: React.PropTypes.object.isRequired,
    onNavigation: React.PropTypes.func.isRequired,
    children: React.PropTypes.any
  },
  navigationHandler: function (action) {
    this.props.onNavigation(this.props.collection.name, action);
  },
  render: function () {
    var navEnabled = this.props.navEnabled;
    return  <div className="card-deck">
              <div className="left-ctls">
                <CaseNavControl action="prev" navEnabled={navEnabled.prev}
                                onNavigation={this.navigationHandler} />
              </div>
              {this.props.children}
              <div className="right-ctls">
                <CaseNavControl action="next" navEnabled={navEnabled.next}
                                onNavigation={this.navigationHandler}/>
                <CaseNavControl action="new"  navEnabled={navEnabled.newInstance}
                                onNavigation={this.navigationHandler}/>
                <CaseNavControl action="remove" navEnabled={navEnabled.removeInstance}
                                onNavigation={this.navigationHandler}/>
              </div>
            </div>
  }
});

var DataCardView = React.createClass({
  propTypes: {
    currentCase: React.PropTypes.object.isRequired,
    collection: React.PropTypes.object.isRequired,
    context: React.PropTypes.string.isRequired,
    isDirty: React.PropTypes.bool.isRequired,
    isNew: React.PropTypes.bool.isRequired,
    onCaseValueChange: React.PropTypes.func.isRequired
  },
  render: function () {
    var collection = this.props.collection;
    return  <div className="card-content">
              <div className="case-display">
                <div className="attr-container">
                  <AttrList attrs={collection.attrs} />
                </div>
                <div className="case-frame">
                  <CaseList
                      collection={collection}
                      currentCase={this.props.currentCase}
                      onChange={this.props.onCaseValueChange}/>
                </div>
              </div>
            </div>

  }
});

var DataCardAppView = React.createClass({
  propTypes: {
    dataManager: React.PropTypes.object.isRequired
  },

  getInitialState: function () {
    return this.props.dataManager.getState();
  },

  componentDidMount: function () {
    this.props.dataManager.register(this);
  },

  componentWillUnmount: function () {
    this.props.dataManager.unregister(this);
  },

  modeHandler: function (modeName) {
    this.props.dataManager.setMode(modeName);
  },

  moveToSelectedCase: function (collectionName, direction) {
    this.props.dataManager.moveToSelectedCase(collectionName, direction);
  },

  onCaseValueChange: function (name, value) {
    this.props.dataManager.updateCurrentCaseValue(name, value);
  },
  requestDataContext: function (contextName) {
    this.props.dataManager.requestDataContext( contextName );
  },
  cancelCreateOrUpdateCase: function () {
    this.props.dataManager.cancelCreateOrUpdateCase();
  },
  createOrUpdateCase: function (ev) {
    if (ev.target.value === 'Create') {
      this.props.dataManager.createCase();
    } else {
      this.props.dataManager.updateCase();
    }
  },
  render: function () {

    var ix = 0;
    var mode = this.state.mode;
    var hasNew = false;
    var cards = this.state.collectionInfoList.map(function (collectionInfo){
      var collection = collectionInfo.collection;
      var title = collection.title || collection.name;
      var navEnabled = collectionInfo.navEnabled;
      hasNew = hasNew || collectionInfo.currentCaseIsNew;
      if (!collectionInfo.currentCase) {
        return;
      }
      if (mode === 'browse') {
        return  <section className="card-section" key={collection.name}>
                  <div className="collection-name">{title}</div>
                  <SlideShowView
                      collection={collection}
                      navEnabled={navEnabled}
                      onNavigation={this.moveToSelectedCase}>
                    <DataCardView
                        collection={collection}
                        context={this.state.currentContext}
                        currentCase={collectionInfo.currentCase}
                        isDirty={collectionInfo.isDirty}
                        isNew={collectionInfo.currentCaseIsNew}
                        onCaseValueChange={this.onCaseValueChange}/>
                  </SlideShowView>
                 </section>
      } else {
        return <DataCardAuthor key={'collection' + ix++} collection={collection}
            context={this.state.currentContext}
            onNewAttribute={this.newAttribute}
            onUpdateAttribute={this.updateAttribute}
            onRemoveAttribute={this.removeAttribute}
            onUpdateCollection={this.updateCollection} />

      }
    }.bind(this));
    var contextNameList = this.state.contextNameList;
    var contextSelector = null;
    if (contextNameList.length > 0) {
      contextSelector = <ContextSelector
          contextNameList={contextNameList}
          currentContextName={this.state.currentContext}
          onSelect={this.requestDataContext} />
    }
    if (cards.length > 0) {
      cards.push(<section key="#control">
        <input
            type="button"
            className="update-case"
            disabled={!this.state.isDirty}
            onClick={this.createOrUpdateCase}
            value={hasNew? 'Create': 'Update'} />
        <input
            type="button"
            className="update-case"
            disabled={!this.state.isDirty}
            onClick={this.cancelCreateOrUpdateCase}
            value="Cancel" />
      </section>)
    }
    return <div className="data-card-app-view">
      <section className="context-section data-card-app-view-header">
        {contextSelector}
      </section>
      {cards}

    </div>
  }
});

ReactDOM.render(<DataCardAppView dataManager={dataManager} />,
    document.getElementById('container'));

