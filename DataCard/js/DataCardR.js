(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
   *   mode: {'view'|'author'}
   * }}
   */
  data: null,

  init: function () {
    this.listeners = [];
    this.data = {
      collectionInfoList: [],
      contextNameList: [],
      currentContext: null,
      mode: 'view'
    };
    return this;
  },

  register: function (listener) {
    this.listeners = this.listeners || [];
    this.listeners.push(listener);
    listener.setState(this.data);
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
      listener.setState(this.data);
    }.bind(this));
  },

  changeContext: function (contextName) {
    dispatcher.sendRequest({ action: 'get', resource: 'dataContext[' + contextName + ']' });
  },

  setContextList: function (contextNameList) {
    function fetchContext(contextName) {
      dispatcher.sendRequest({ action: 'get', resource: 'dataContext[' + contextName + ']' });
    }
    this.data.contextNameList = contextNameList;
    if (contextNameList.length > 0) {
      fetchContext(contextNameList[0].name);
    }
    this.notify();
  },

  setDataCards: function (context) {
    function fetchFirstCase(contextName, collectionName) {
      dispatcher.sendRequest({ action: 'get', resource: 'dataContext[' + contextName + '].collection[' + collectionName + '].caseByIndex[0]' });
    }
    this.data.currentContext = context.name;
    this.data.collectionInfoList = context.collections.map(function (collection) {
      return {
        collection: collection,
        currentCase: null,
        currentCaseIndex: 0,
        currentCaseIsDirty: false,
        caseCount: null,
        navEnabled: {}
      };
    });
    this.data.collectionInfoList.forEach(function (collectionInfo) {
      var collection = collectionInfo.collection;
      var contextName = this.data.currentContext;
      fetchFirstCase(contextName, collection.name);
    }.bind(this));
    this.data.hasSelectedContext = true;
    this.notify();
  },

  setCase: function (iCollectionName, values, resourceName) {
    function guaranteeLeftCollectionIsParent(parentCollectionInfo, parentID, context) {
      var parentCollection = parentCollectionInfo.collection;
      var parentCase = parentCollectionInfo.currentCase;
      var resource;
      if (parentCase && parentCase.guid !== parentID) {
        resource = 'dataContext[' + context + '].collection[' + parentCollection.name + '].caseByID[' + parentID + ']';
        dispatcher.sendRequest({ action: 'get', resource: resource });
      }
    }

    function guaranteeRightCollectionIsChild(childCollectionInfo, myCase, context) {
      var childCollection = childCollectionInfo.collection;
      var childCase = childCollectionInfo.currentCase;
      var resource;
      if (childCase && childCase.parent !== myCase.guid) {
        if (myCase.children) {
          resource = 'dataContext[' + context + '].collection[' + childCollection.name + '].caseByID[' + myCase.children[0] + ']';
          dispatcher.sendRequest({ action: 'get', resource: resource });
        }
      }
    }

    var myCase = values.case;
    var caseIndex = values.caseIndex;
    var collectionInfoList = this.data.collectionInfoList;
    var collectionIndex = collectionInfoList.findIndex(function (collectionInfo) {
      return collectionInfo.collection.name === iCollectionName;
    });
    dispatcher.sendRequest({ action: 'create', resource: 'dataContext[' + this.data.currentContext + '].selectionList', values: [myCase.guid] });
    if (collectionIndex >= 0) {
      var collectionInfo = collectionInfoList[collectionIndex];
      collectionInfo.currentCaseIndex = Number(caseIndex);
      collectionInfo.currentCase = myCase;
      collectionInfo.currentCaseResourceName = resourceName;
      if (collectionIndex > 0) {
        guaranteeLeftCollectionIsParent(collectionInfoList[collectionIndex - 1], myCase.parent, this.data.currentContext);
      }
      if (collectionIndex < collectionInfoList.length - 1) {
        guaranteeRightCollectionIsChild(collectionInfoList[collectionIndex + 1], myCase, this.data.currentContext);
      }
      this.computeNavEnabled(collectionInfo);
      this.notify();
    }
  },

  setMode: function (modeName) {
    this.data.mode = modeName;
    this.notify();
  },

  computeNavEnabled: function (collectionInfo) {
    var navEnabledFlags = collectionInfo.navEnabled || {};
    var caseIndex = collectionInfo.currentCaseIndex;
    var caseCount = collectionInfo.caseCount;
    var dirty = collectionInfo.currentCaseIsDirty || false;
    navEnabledFlags.prev = !dirty && caseIndex !== null && caseIndex !== undefined && caseIndex > 0;
    navEnabledFlags.next = !dirty; /*&& (caseCount !== null) && (caseIndex !== undefined) && caseIndex < caseCount - 1;*/
    navEnabledFlags.newInstance = !dirty;
    navEnabledFlags.removeInstance = true;
    collectionInfo.navEnabled = navEnabledFlags;
  },

  findCollectionInfoForAttribute: function (iAttributeName) {
    return this.data.collectionInfoList.find(function (collectionInfo) {
      var collection = collectionInfo.collection;
      var attr = collection.attrs.find(function (attr) {
        return attr.name === iAttributeName;
      });
      return attr != undefined;
    });
  },

  findCollectionInfoForName: function (iCollectionName) {
    return this.data.collectionInfoList.find(function (collectionInfo) {
      var collection = collectionInfo.collection;
      return collection.name === iCollectionName;
    });
  },

  setDirty: function (collectionInfo, isDirty) {
    collectionInfo.currentCaseIsDirty = isDirty;
    this.computeNavEnabled(collectionInfo);
  },

  updateCase: function (collectionInfo) {
    var resource = collectionInfo.currentCaseResourceName;
    dispatcher.sendRequest({
      action: 'update',
      resource: resource,
      values: collectionInfo.currentCase
    });
  },
  didUpdateCase: function (iCollectionName) {
    console.log('DidUpdateCase');
    var collectionInfo = this.findCollectionInfoForName(iCollectionName);
    if (collectionInfo) {
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
    return this.data.currentContext;
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
      var resource = 'dataContext[' + contextName + '].collection[' + collectionName + '].caseByIndex[' + index + ']';
      dispatcher.sendRequest({ action: 'get', resource: resource });
    }

    var collection = this.data.collectionInfoList.find(function (collectionInfo) {
      return collectionInfo.collection.name === iCollectionName;
    });
    var contextName = this.data.currentContext;
    var currentCaseIndex = collection.currentCaseIndex;
    console.log('moveCard: action: ' + action);
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
  startNewCase: function () {},

  getState: function () {
    return this.data;
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
    this.connection = new iframePhone.IframePhoneRpcEndpoint(function () {}, "data-interactive", window.parent);
    this.connectionState = 'initialized';
    this.sendRequest({
      action: 'update', resource: 'interactiveFrame', values: {
        "title": "Data Card",
        "version": "0.1",
        "dimensions": { "width": 500, "height": 600 }
      }
    });
    this.sendRequest({
      "action": "get",
      "resource": "dataContextList"
    });
    return this;
  },

  sendRequest: function (request) {
    this.connection.call(request, function (response) {
      this.handleResponse(request, response);
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

  handleResponse: function (request, result) {
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
        case 'dataContextList':
          dataManager.setContextList(result.values);
          break;
        case 'dataContext':
          dataManager.setDataCards(result.values);
          break;
        case 'caseByIndex':
        case 'caseByID':
          dataManager.setCase(resourceObj.collection, result.values, request.resource);
          break;
        default:
          console.log('No handler for get response: ' + request.resource);
      }
    } else if (request.action === 'update') {
      this.connectionState = 'active';
      switch (resourceObj.type) {
        case 'caseByIndex':
        case 'caseByID':
          dataManager.didUpdateCase(resourceObj.collection);
          break;
        default:
          console.log('No handler for get response: ' + request.resource);
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
  displayName: 'ContextSelector',

  propTypes: {
    contextNameList: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func.isRequired
  },

  render: function () {
    var onSelect = this.props.onSelect;
    var options = this.props.contextNameList.map(function (context) {
      var title = context.title || context.name;
      return React.createElement(
        'option',
        { key: context.name, id: context.name },
        title
      );
    });
    return React.createElement(
      'label',
      null,
      'Data Set: ',
      React.createElement(
        'select',
        {
          id: 'context-selector',
          onChange: function (ev) {
            onSelect(ev.target.value);
          } },
        options
      )
    );
  }
});

var ModeSelector = React.createClass({
  displayName: 'ModeSelector',

  propTypes: {
    mode: React.PropTypes.string.isRequired,
    modes: React.PropTypes.array.isRequired,
    onSelect: React.PropTypes.func.isRequired
  },
  render: function () {
    var onSelect = this.props.onSelect;
    function selectHandler(ev) {
      onSelect(ev.target.value);
    }
    var modesView = this.props.modes.map(function (modeName) {
      var isSelected = modeName === this.props.mode;
      return React.createElement(
        'label',
        { key: modeName },
        React.createElement('input', { type: 'radio', name: 'mode', checked: isSelected, value: modeName, onChange: selectHandler }),
        ' ',
        modeName
      );
    }.bind(this));
    return React.createElement(
      'div',
      { className: 'mode-selector' },
      modesView
    );
  }
});

/**
 * AttrList presents a list of attributes for a data card.
 * @type {ClassicComponentClass<P>}
 */
var AttrList = React.createClass({
  displayName: 'AttrList',

  propTypes: {
    attrs: React.PropTypes.array.isRequired
  },
  render: function () {
    var items = this.props.attrs.map(function (item) {
      var title = item.title || item.name;
      return React.createElement(
        'div',
        { key: item.name, className: 'attr' },
        title
      );
    });
    return React.createElement(
      'div',
      { className: 'attr-list' },
      items
    );
  }
});

var CaseDisplay = React.createClass({
  displayName: 'CaseDisplay',

  propTypes: {
    attrs: React.PropTypes.array.isRequired,
    myCase: React.PropTypes.object,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    var myCase = this.props.myCase;
    var values = this.props.attrs.map(function (attr) {
      var name = attr.name;
      var value = myCase ? myCase.values[name] : '';
      var onChange = this.props.onChange;
      return React.createElement('input', {
        type: 'text',
        className: 'attr-value',
        key: name,
        name: name,
        value: value,
        onChange: function (ev) {
          onChange(name, ev.target.value);
        } });
    }.bind(this));
    return React.createElement(
      'div',
      { className: 'case' },
      values
    );
  }
});

var CaseList = React.createClass({
  displayName: 'CaseList',

  propTypes: {
    collection: React.PropTypes.object.isRequired,
    currentCase: React.PropTypes.object.isRequired,
    onChange: React.PropTypes.func.isRequired
  },
  render: function () {
    //var caseIndex = this.props.collection.currentCaseIndex || 0;
    var myCase = this.props.currentCase;
    var id = myCase ? myCase.guid : 'new';
    var caseView = React.createElement(CaseDisplay, { key: id, attrs: this.props.collection.attrs, myCase: myCase, onChange: this.props.onChange });
    return React.createElement(
      'div',
      { className: 'case-container' },
      ' ',
      caseView,
      ' '
    );
  }
});

var CaseNavControl = React.createClass({
  displayName: 'CaseNavControl',

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
  handleClick: function () /*ev*/{
    if (this.props.onNavigation) {
      this.props.onNavigation(this.props.action);
    }
  },
  render: function () {
    var disable = !this.props.navEnabled;
    if (disable) {
      return React.createElement(
        'button',
        { className: 'control', disabled: true, onClick: this.handleClick },
        this.symbol[this.props.action]
      );
    } else return React.createElement(
      'button',
      { className: 'control', onClick: this.handleClick },
      this.symbol[this.props.action]
    );
  }
});

var DataCardAuthor = React.createClass({
  displayName: 'DataCardAuthor',

  propTypes: {
    collection: React.PropTypes.object.isRequired,
    context: React.PropTypes.string.isRequired
  },

  render: function () {
    function makeAttrView(attr) {
      var name = attr && attr.name || '#new';
      var title = attr && (attr.title || attr.name);
      attr = attr || { name: '', title: '', description: '', type: 'numeric', precision: 2 };
      return React.createElement(
        'div',
        { key: name, className: 'attr-author' },
        React.createElement('input', { type: 'text', name: 'title', value: title }),
        React.createElement('input', { type: 'text', name: 'type', value: attr.type }),
        React.createElement('input', { type: 'text', name: 'description', value: attr.description }),
        React.createElement('input', { type: 'text', name: 'precision', value: attr.precision })
      );
    }
    var collection = this.props.collection;
    var title = collection.title || collection.name;
    var attrsList = collection.attrs.map(function (attr) {
      return makeAttrView(attr);
    });

    attrsList.push(makeAttrView());

    return React.createElement(
      'section',
      { className: 'card-section' },
      React.createElement(
        'label',
        null,
        'Collection Name ',
        React.createElement('input', { name: 'collection-name', value: title })
      ),
      React.createElement(
        'div',
        { className: 'card-content' },
        React.createElement(
          'div',
          null,
          attrsList
        ),
        React.createElement('input', { type: 'button', className: 'update-case', onClick: this.updateCaseHandler, value: 'Update' })
      )
    );
  }

});

var SlideShowView = React.createClass({
  displayName: 'SlideShowView',

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
    return React.createElement(
      'div',
      { className: 'card-deck' },
      React.createElement(
        'div',
        { className: 'left-ctls' },
        React.createElement(CaseNavControl, { action: 'prev', navEnabled: navEnabled.prev, onNavigation: this.navigationHandler })
      ),
      this.props.children,
      React.createElement(
        'div',
        { className: 'right-ctls' },
        React.createElement(CaseNavControl, { action: 'next', navEnabled: navEnabled.next, onNavigation: this.navigationHandler }),
        React.createElement(CaseNavControl, { action: 'new', navEnabled: navEnabled.newInstance, onNavigation: this.navigationHandler }),
        React.createElement(CaseNavControl, { action: 'remove', navEnabled: navEnabled.removeInstance, onNavigation: this.navigationHandler })
      )
    );
  }
});

var DataCardView = React.createClass({
  displayName: 'DataCardView',

  propTypes: {
    currentCase: React.PropTypes.object.isRequired,
    collection: React.PropTypes.object.isRequired,
    context: React.PropTypes.string.isRequired,
    isDirty: React.PropTypes.bool.isRequired,
    onCaseValueChange: React.PropTypes.func.isRequired,
    onContentUpdate: React.PropTypes.func.isRequired
  },
  render: function () {
    var collection = this.props.collection;
    var isDirty = this.props.isDirty;
    return React.createElement(
      'div',
      { className: 'card-content' },
      React.createElement(
        'div',
        { className: 'case-display' },
        React.createElement(
          'div',
          { className: 'attr-container' },
          React.createElement(AttrList, { attrs: collection.attrs })
        ),
        React.createElement(
          'div',
          { className: 'case-frame' },
          React.createElement(CaseList, {
            collection: collection,
            currentCase: this.props.currentCase,
            onChange: this.props.onCaseValueChange })
        )
      ),
      React.createElement('input', {
        type: 'button',
        className: 'update-case',
        disabled: !isDirty,
        onClick: this.props.onContentUpdate,
        value: 'Update' })
    );
  }
});

var DataCardAppView = React.createClass({
  displayName: 'DataCardAppView',

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
    var ix = 0;
    var mode = this.state.mode;
    var cards = this.state.collectionInfoList.map(function (collectionInfo) {
      var collection = collectionInfo.collection;
      var title = collection.title || collection.name;
      var navEnabled = collectionInfo.navEnabled;
      if (!collectionInfo.currentCase) {
        return;
      }
      if (mode === 'view') {
        return React.createElement(
          'section',
          { className: 'card-section', key: collection.name },
          React.createElement(
            'div',
            { className: 'collection-name' },
            title
          ),
          React.createElement(
            SlideShowView,
            {
              collection: collection,
              navEnabled: navEnabled,
              onNavigation: function (collectionName, direction) {
                dataManager.selectCase(collectionName, direction);
              } },
            React.createElement(DataCardView, {
              collection: collection,
              context: this.state.currentContext,
              currentCase: collectionInfo.currentCase,
              isDirty: collectionInfo.currentCaseIsDirty,
              onContentUpdate: function () {
                dataManager.updateCase(collectionInfo);
              },
              onCaseValueChange: function (name, value) {
                dataManager.updateCurrentCaseValue(name, value);
              } })
          )
        );
      } else {
        return React.createElement(DataCardAuthor, { key: 'collection' + ix++, collection: collection,
          context: this.state.currentContext, onNewAttribute: this.newAttribute,
          onUpdateAttribute: this.updateAttribute,
          onRemoveAttribute: this.removeAttribute, onUpdateCollection: this.updateCollection });
      }
    }.bind(this));
    return React.createElement(
      'div',
      { className: 'data-card-app-view' },
      React.createElement(
        'section',
        { id: 'context-selector', className: 'data-card-app-view-header' },
        React.createElement(ContextSelector, {
          contextNameList: this.state.contextNameList,
          onSelect: function (contextName) {
            dataManager.changeContext(contextName);
          } })
      ),
      cards
    );
  }
});

ReactDOM.render(React.createElement(DataCardAppView, { data: dataManager }), document.getElementById('container'));

},{}]},{},[1]);
