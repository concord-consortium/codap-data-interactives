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
   * @property data {{
   *   contextList: {[string]},
   *   currentContext: {string},
   *   collectionInfoList: {[Object]},
   *   hasSelectedContext: {boolean}
   *   mode: {'browse'|'design'}
   * }}
   */
  state: null,

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
        dimensions: this.state.dimensions
      }
    });
  },

  getPersistentState: function () {
    var state = this.state;
    return {
      currentContext: state.currentContext
    }
  },

  updateDataContextList: function () {
    dispatcher.sendRequest({
      action: 'get',
      resource: 'dataContextList'
    });
  },

  changeContext: function (contextName) {
    dispatcher.sendRequest({action: 'get', resource: 'dataContext[' + contextName + ']'});
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
    if (!currentContextName) {
      currentContextName = this.state.currentContext = contextNameList[0].name;
    }
    if (contextNameList.length > 0) {
      this.changeContext(currentContextName);
    }
    this.notify();
  },

  setDataCards: function (context) {
    function fetchFirstCase(contextName, collectionName) {
      dispatcher.sendRequest({action: 'get', resource: 'dataContext[' +
        contextName + '].collection[' + collectionName + '].caseByIndex[0]'});
    }
    this.state.currentContext = context.name;
    this.state.collectionInfoList = context.collections.map(function (collection) {
      return {
        collection: collection,
        currentCase: null,
        currentCaseIndex: 0,
        isDirty: false,
        caseCount: null,
        navEnabled: {}
      }
    });
    this.state.collectionInfoList.forEach(function(collectionInfo) {
      var collection = collectionInfo.collection;
      var contextName = this.state.currentContext;
      fetchFirstCase(contextName, collection.name);
    }.bind(this));
    this.state.hasSelectedContext = true;
    this.notify();
  },

  setCase: function (iCollectionName, values, resourceName, handlingOptions) {
    function guaranteeLeftCollectionIsParent(parentCollectionInfo, parentID, context) {
      var parentCollection = parentCollectionInfo.collection;
      var parentCase = parentCollectionInfo.currentCase;
      var resource;
      if (parentCase && parentCase.guid !== parentID) {
        resource = 'dataContext[' + context + '].collection[' +
            parentCollection.name + '].caseByID[' + parentID + ']';
        dispatcher.sendRequest({action: 'get', resource: resource}, {omitSelection: true});
      }
    }

    function guaranteeRightCollectionIsChild(childCollectionInfo, myCase, context) {
      var childCollection = childCollectionInfo.collection;
      var childCase = childCollectionInfo.currentCase;
      var resource;
      if (childCase && childCase.parent !== myCase.guid) {
        if (myCase.children) {
          resource = 'dataContext[' + context + '].collection[' +
              childCollection.name + '].caseByID[' + myCase.children[0] + ']';
          dispatcher.sendRequest({action: 'get', resource: resource}, {omitSelection: true});
        }
      }
    }

    var myCase = values.case;
    var caseIndex = values.caseIndex;
    var collectionInfoList = this.state.collectionInfoList;
    var collectionIndex = collectionInfoList.findIndex(function (collectionInfo) {
      return collectionInfo.collection.name === iCollectionName;
    });
    console.log('addCase - caseID/caseIndex: ' + [myCase.guid, caseIndex].join('/'));
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
          + this.state.currentContext + '].selectionList', values: [myCase.guid]});
      }
      this.setDirty(collectionInfo, false);
      this.notify();
    }
  },

  setMode: function (modeName) {
    this.state.mode = modeName;
    this.notify();
  },

  computeNavEnabled: function () {
    this.state.collectionInfoList.forEach(function (collectionInfo) {
      var navEnabledFlags = collectionInfo.navEnabled || {};
      var caseIndex = collectionInfo.currentCaseIndex;
      //var caseCount = collectionInfo.caseCount;
      var dirty = this.state.isDirty || false;
      navEnabledFlags.prev = !dirty && (caseIndex !== null) && (caseIndex !== undefined) && caseIndex > 0;
      navEnabledFlags.next = !dirty /*&& (caseCount !== null) && (caseIndex !== undefined) && caseIndex < caseCount - 1;*/
      navEnabledFlags.newInstance = !dirty;
      navEnabledFlags.removeInstance = true;
      collectionInfo.navEnabled = navEnabledFlags;
    }.bind(this));
  },

  findCollectionInfoForAttribute: function (iAttributeName) {
    return this.state.collectionInfoList.find(function (collectionInfo) {
      var collection = collectionInfo.collection;
      var attr = collection.attrs.find(function (attr) { return attr.name === iAttributeName; });
      return attr != undefined;
    });
  },

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
      collectionInfo.currentCase.parent = this.state.collectionInfoList[collectionIndex - 1].currentCase.guid;
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
      collectionInfo.currentCase.guid = iReply.values[0].id;
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
        this.updateCase(collectionInfo)
      }.bind(this) );
    } else if (collectionInfo.isDirty) {
      var resource = collectionInfo.currentCaseResourceName;
      var isNew = collectionInfo.currentCaseIsNew;
      var action = isNew? 'create': 'update';
      dispatcher.sendRequest({
        action: action,
        resource: resource,
        values: collectionInfo.currentCase
      })
    }
  },
  didUpdateCase: function(iCollectionName, iReply) {
    var collectionInfo = this.findCollectionInfoForName(iCollectionName);
    if (collectionInfo) {
      if (collectionInfo.currentCaseIsNew) {
        console.log('DidUpdateCase: reply=' + iReply.values && iReply.values[0] && iReply.values[0].id);
        dispatcher.sendRequest({
          action: 'get',
          resource: 'dataContext[' + this.state.currentContext + '].collection[' +
            collectionInfo.collection.name + '].caseByID[' +
            iReply.values[0].id + ']'
        })
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

  selectCase: function (iCollectionName, action) {
    function requestCase(contextName, collectionName, index) {
      var resource = 'dataContext[' + contextName + '].collection['
          + collectionName + '].caseByIndex[' + index + ']';
      dispatcher.sendRequest({action: 'get', resource: resource});
    }

    var collection = this.state.collectionInfoList.find(function (collectionInfo) {
      return collectionInfo.collection.name === iCollectionName;
    });
    var contextName = this.state.currentContext;
    var currentCaseIndex = collection.currentCaseIndex;
    console.log('selectCase: action: ' + action);
    switch (action) {
      case 'prev':
        requestCase(contextName, iCollectionName, currentCaseIndex - 1);
        break;
      case 'next':
        requestCase(contextName, iCollectionName, currentCaseIndex + 1);
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
        parent: parentCase.id || parentCase.guid,
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
          dispatcher.sendRequest({
            action: 'get',
            resource: 'dataContext[' + this.state.currentContext +
            '].collection[' + collectionInfo.collection.name + '].caseByIndex['
            + collectionInfo.currentCaseIndex + ']'
          })
          this.setDirty(collectionInfo, false)
        } else {
          dispatcher.sendRequest({
            action: 'get',
            resource: collectionInfo.currentCaseResourceName
          });
        }
        collectionInfo.isNew = false;
      }
    }.bind(this));
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
      return this;
    },

    handleCODAPRequest: function (request, callback) {
      switch (request.resource) {
        case 'interactiveState':
          if (request.action === 'get') {
            callback({
              success: true,
              values: dataManager.getPersistentState()
            })
          } else {
            console.log('Unsupported interactiveState action, CODAP to DI: ' + JSON.stringify(request));
          }
          break;
        case 'undoChangeNotice':
        case 'appChangeNotice':
        case 'dataContextChangeNotice':
        default:
          console.log('Unsupported request from CODAP to DI: ' + JSON.stringify(request));
          callback({success: false});
      }
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
              // nothing to do
            break;
          default:
            console.log('No handler for get response: ' + request.resource);
        }
      } else if (request.action === 'update') {
        this.connectionState = 'active';
        switch (resourceObj.type) {
          case 'interactiveFrame':
            dataManager.updateDataContextList();
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
    return <label class="context-selector">Data Set:&nbsp;
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
    var id = myCase? myCase.guid: 'new';
    var caseView = <CaseDisplay key={id} attrs={this.props.collection.attrs} myCase={myCase} onChange={this.props.onChange}/>;
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
      return <button className="control" disabled="true" onClick={this.handleClick}>{this.symbol[this.props.action]}</button>
    } else
      return <button className="control" onClick={this.handleClick}>{this.symbol[this.props.action]}</button>
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
          <input type="button" className="update-case" onClick={this.updateCaseHandler} value="Update" />
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
                <CaseNavControl action="prev" navEnabled={navEnabled.prev} onNavigation={this.navigationHandler} />
              </div>
              {this.props.children}
              <div className="right-ctls">
                <CaseNavControl action="next" navEnabled={navEnabled.next}  onNavigation={this.navigationHandler}/>
                <CaseNavControl action="new"  navEnabled={navEnabled.newInstance} onNavigation={this.navigationHandler}/>
                <CaseNavControl action="remove" navEnabled={navEnabled.removeInstance} onNavigation={this.navigationHandler}/>
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
  getInitialState: function () {
    return dataManager.getState();
  },

  componentDidMount: function () {
    dataManager.register(this);
  },

  componentWillUnmount: function () {
    dataManager.unregister(this);
  },

  modeHandler: function (modeName) {
    dataManager.setMode(modeName);
  },

  render: function () {
    function createOrUpdateCase(ev) {
      if (ev.target.value === 'Create') {
        dataManager.createCase();
      } else {
        dataManager.updateCase();
      }
    }
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
                      onNavigation={function (collectionName, direction) {
                        dataManager.selectCase(collectionName, direction);
                      }}>
                    <DataCardView
                        collection={collection}
                        context={this.state.currentContext}
                        currentCase={collectionInfo.currentCase}
                        isDirty={collectionInfo.isDirty}
                        isNew={collectionInfo.currentCaseIsNew}
                        onCaseValueChange={function (name, value) {
                          dataManager.updateCurrentCaseValue(name, value);
                        }}/>
                  </SlideShowView>
                 </section>
      } else {
        return <DataCardAuthor key={'collection' + ix++} collection={collection}
            context={this.state.currentContext} onNewAttribute={this.newAttribute}
            onUpdateAttribute={this.updateAttribute}
            onRemoveAttribute={this.removeAttribute} onUpdateCollection={this.updateCollection} />

      }
    }.bind(this));
    var contextNameList = this.state.contextNameList;
    var contextSelector = null;
    if (contextNameList.length > 0) {
      contextSelector = <ContextSelector
          contextNameList={contextNameList}
          currentContextName={this.state.currentContext}
          onSelect={function (contextName) { dataManager.changeContext( contextName ); }} />
    }
    if (cards.length > 0) {
      cards.push(<section key="#control">
        <input
            type="button"
            className="update-case"
            disabled={!this.state.isDirty}
            onClick={createOrUpdateCase}
            value={hasNew? 'Create': 'Update'} />
        <input
            type="button"
            className="update-case"
            disabled={!this.state.isDirty}
            onClick={function () {dataManager.cancelCreateOrUpdateCase()}}
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

ReactDOM.render(<DataCardAppView data={dataManager} />,
    document.getElementById('container'));

