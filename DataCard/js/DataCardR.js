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
/**
 * dataManager responsible for managing the CaseTableApp's state
 */
var dataManager = Object.create({

  init: function () {
    this.listeners = [];
    this.data = {
      contexts: [],
      currentContext: null,
      collections: [],
      proto: null
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
      listeners.splice(ix, 1);
    }
  },

  notify: function () {
    this.listeners.forEach(function (listener) {
      listener.setState(this.data);
    }.bind(this));
  },

  setContextList: function (contextList) {
    function fetchContext(contextName) {
      dispatcher.sendRequest({ action: 'get', resource: 'doc.dataContext[' + contextName + ']' });
    }
    this.data.contexts = contextList;
    if (contextList.length > 0) {
      fetchContext(contextList[0].name);
    }
    this.notify();
  },

  setDataCards: function (context) {
    function fetchFirstCase(contextName, collectionName) {
      dispatcher.sendRequest({ action: 'get', resource: 'doc.dataContext[' + contextName + '].collection[' + collectionName + '].caseByIndex[0]' });
    }
    this.data.currentContext = context.name;
    this.data.collections = context.collections;
    this.data.collections.forEach(function (collection) {
      collection.currentCaseIndex = 0;
      var contextName = this.data.currentContext;
      fetchFirstCase(contextName, collection.name);
    }.bind(this));
    this.data.hasSelectedContext = true;
    this.notify();
  },

  setCase: function (iCollectionName, values) {
    function guaranteeLeftCollectionIsParent(parentCollection, parentID, context) {
      var parentCase = parentCollection.currentCase;
      var resource;
      if (parentCase && parentCase.guid !== parentID) {
        resource = 'doc.dataContext[' + context + '].collection[' + parentCollection.name + '].caseByID[' + parentID + ']';
        dispatcher.sendRequest({ action: 'get', resource: resource });
      }
    }

    function guaranteeRightCollectionIsChild(childCollection, myCase, context) {
      var childCase = childCollection.currentCase;
      var resource;
      if (childCase && childCase.parent !== myCase.guid) {
        if (myCase.children) {
          resource = 'doc.dataContext[' + context + '].collection[' + childCollection.name + '].caseByID[' + myCase.children[0] + ']';
          dispatcher.sendRequest({ action: 'get', resource: resource });
        }
      }
    }

    var myCase = values.case;
    var caseIndex = values.caseIndex;
    var collections = this.data.collections;
    var collectionIndex = collections.findIndex(function (coll) {
      return coll.name === iCollectionName;
    });
    if (collectionIndex >= 0) {
      var collection = collections[collectionIndex];
      collection.currentCaseIndex = Number(caseIndex);
      collection.currentCase = myCase;
      if (collectionIndex > 0) {
        guaranteeLeftCollectionIsParent(collections[collectionIndex - 1], myCase.parent, this.data.currentContext);
      }
      if (collectionIndex < collections.length - 1) {
        guaranteeRightCollectionIsChild(collections[collectionIndex + 1], myCase, this.data.currentContext);
      }
      this.notify();
    }
  },

  moveCard: function (collectionName, direction) {
    function adjustParentCard(collectionIx, myCase) {
      if (collectionIx <= 0) {
        return;
      }
      var parentId = myCase.parent;
      var parentCollection = collections[collectionIx - 1];
      if (parentCollection.cases[parentCollection.currentCaseIndex].guid === parentId) {
        return;
      }
      var parentCaseIndex = parentCollection.cases.findIndex(function (iCase) {
        return iCase.guid === parentId;
      });
      console.log('adjustParentCard. ' + JSON.stringify({
        parentId: parentId,
        parentCollectionCaseIds: parentCollection.cases.map(function (iCase) {
          return iCase.guid;
        }),
        collectionIx: collectionIx,
        parentCaseIndex: parentCollection.currentCaseIndex
      }));
      if (parentCaseIndex >= 0) {
        parentCollection.currentCaseIndex = parentCaseIndex;
      }
      adjustParentCard(collectionIx - 1, parentCollection.cases[parentCollection.currentCaseIndex]);
    }
    function adjustChildCard(collectionIx, myCase) {
      if (collectionIx + 1 >= collections.length) {
        return;
      }
      var parentId = myCase.guid;
      var childCollection = collections[collectionIx + 1];
      var childCase = childCollection.cases[childCollection.currentCaseIndex];
      var childCaseIx;
      if (childCase.parent !== parentId) {
        childCaseIx = childCollection.cases.findIndex(function (iCase) {
          return iCase.parent === parentId;
        });
        console.log('adjustChildCard. ' + JSON.stringify({
          parentId: parentId,
          childCollectionCaseIds: childCollection.cases.map(function (iCase) {
            return iCase.guid;
          }),
          collectionIx: collectionIx,
          childCaseIndex: childCaseIx
        }));
        if (childCaseIx >= 0) {
          childCollection.currentCaseIndex = childCaseIx;
        }
        adjustChildCard(collectionIx + 1, childCollection.cases[childCollection.currentCaseIndex]);
      }
    }
    var newCaseIx = null;
    var collections = this.data.collections;
    var collectionIx = collections.findIndex(function (collection) {
      return collection.name === collectionName;
    });
    var collection = collectionIx >= 0 && this.data.collections[collectionIx];

    console.log('moveCard. ' + JSON.stringify({
      collection: collectionName,
      direction: direction,
      collectionIx: collectionIx,
      length: collection.cases.length,
      currentCaseIndex: collection.currentCaseIndex
    }));
    if (collection) {
      if (direction === 'left' && collection.currentCaseIndex > 0) {
        newCaseIx = collection.currentCaseIndex = collection.currentCaseIndex - 1;
      } else if (direction === 'right' && collection.currentCaseIndex + 1 < collection.cases.length) {
        newCaseIx = collection.currentCaseIndex = collection.currentCaseIndex + 1;
      } else {
        return;
      }
      adjustParentCard(collectionIx, collection.cases[newCaseIx]);
      adjustChildCard(collectionIx, collection.cases[newCaseIx]);
      this.notify();
    }
  },

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
      action: 'update', resource: 'doc.interactiveFrame', values: {
        "title": "Data Card",
        "version": "0.1",
        "dimensions": { "width": 500, "height": 600 }
      }
    });
    this.sendRequest({
      "action": "get",
      "resource": "doc.dataContextList"
    });
    return this;
  },

  sendRequest: function (request) {
    this.connection.call(request, function (response) {
      this.handleResponse(request, response);
    }.bind(this));
  },

  parseResourceSelector: function (iResource) {
    var selectorRE = /([A-Za-z0-9_]+)\[([A-Za-z0-9_]+)\]/;
    var result = {};
    var selectors = iResource.split('.');
    var baseSelector = selectors.shift();
    result.type = baseSelector;
    if (baseSelector === 'doc') {
      selectors.forEach(function (selector) {
        var rtype, rname;
        var match = selectorRE.exec(selector);
        if (selectorRE.test(selector)) {
          rtype = match[1];
          rname = match[2];
          result[rtype] = rname;
          result.type = rtype;
        } else {
          result.type = selector;
        }
      });
    }

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
          dataManager.setCase(resourceObj.collection, result.values);
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
 * ContextMenu provides list of DataContexts present in CODAP and an interface for
 * selecting one.
 * @type {ClassicComponentClass<P>}
 */
var ContextMenu = React.createClass({
  displayName: 'ContextMenu',

  render: function () {
    function fetchContext(contextName) {
      dispatcher.sendRequest({ action: 'get', resource: 'doc.dataContext[' + contextName + ']' });
    }
    function handleSelect(ev) {
      fetchContext(ev.target.value);
    }
    var options = this.props.contexts.map(function (context) {
      var title = context.title || context.name;
      return React.createElement(
        'option',
        { key: context.name, id: context.name },
        title
      );
    });
    return React.createElement(
      'section',
      { id: 'context-selector' },
      React.createElement(
        'label',
        null,
        'Context: ',
        React.createElement(
          'select',
          { id: 'context-selector', onChange: handleSelect },
          options
        )
      )
    );
  }
});

/**
 * AttrList presents a list of attributes for a data card.
 * @type {ClassicComponentClass<P>}
 */
var AttrList = React.createClass({
  displayName: 'AttrList',

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

  render: function () {
    var myCase = this.props.myCase;
    var values = this.props.attrs.map(function (attr) {
      var value = myCase ? myCase.values[attr.name] : '';
      return React.createElement(
        'div',
        { className: 'attr-value', key: attr.name },
        value
      );
    });
    return React.createElement(
      'div',
      { className: 'case' },
      values
    );
  }
});

var CaseList = React.createClass({
  displayName: 'CaseList',

  render: function () {
    var caseIndex = this.props.collection.currentCaseIndex || 0;
    var myCase = this.props.collection.currentCase;
    var id = myCase ? myCase.guid : 'new';
    var caseView = React.createElement(CaseDisplay, { key: id, attrs: this.props.collection.attrs, myCase: myCase });
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

  symbol: {
    left: '<',
    right: '>'
  },
  handleClick(ev) {
    this.props.onNavigation && this.props.onNavigation(this.props.action);
  },
  render: function () {
    return React.createElement(
      'div',
      { className: 'control', onClick: this.handleClick },
      this.symbol[this.props.action]
    );
  }
});

var DataCard = React.createClass({
  displayName: 'DataCard',

  moveCard: function (direction) {
    console.log('moveCard: direction: ' + direction);
    var increment = { left: -1, right: 1 }[direction];
    var contextName = this.props.context;
    var collectionName = this.props.collection.name;
    if (increment) {
      var requestedIndex = this.props.collection.currentCaseIndex + increment;
      var resource = 'doc.dataContext[' + contextName + '].collection[' + collectionName + '].caseByIndex[' + requestedIndex + ']';
      dispatcher.sendRequest({ action: 'get', resource: resource });
    }
  },
  render: function () {
    var collection = this.props.collection;
    var title = collection.title || collection.name;
    return React.createElement(
      'section',
      { className: 'card-section' },
      React.createElement(
        'div',
        { className: 'collection-name' },
        title
      ),
      React.createElement(
        'div',
        { className: 'card-deck' },
        React.createElement(
          'div',
          { className: 'left-ctls' },
          React.createElement(CaseNavControl, { action: 'left', onNavigation: this.moveCard })
        ),
        React.createElement(
          'div',
          { className: 'attr-container' },
          React.createElement(AttrList, { attrs: collection.attrs })
        ),
        React.createElement(
          'div',
          { className: 'case-frame' },
          React.createElement(CaseList, { collection: collection })
        ),
        React.createElement(
          'div',
          { className: 'right-ctls' },
          React.createElement(CaseNavControl, { action: 'right', onNavigation: this.moveCard }),
          React.createElement(
            'div',
            { className: 'control ctl-add-case' },
            '+'
          ),
          React.createElement(
            'div',
            { className: 'control ctl-add-case' },
            React.createElement(
              'span',
              null,
              '×'
            )
          )
        )
      )
    );
  }
});

var DataCardApp = React.createClass({
  displayName: 'DataCardApp',

  navigate: function (collectionName, direction) {
    dataManager.moveCard(collectionName, direction);
    this.didChange();
  },
  didChange: function (state) {
    this.setState(dataManager.getState());
  },

  getInitialState() {
    return {
      contexts: [],
      currentContext: null,
      collections: []
    };
  },

  componentDidMount() {
    dataManager.register(this);
  },

  componentWillUnmount() {
    dataManager.unregister(this);
  },
  render: function () {
    var ix = 0;
    var cards = this.state.collections.map(function (collection) {
      return React.createElement(DataCard, { key: 'collection' + ix++,
        context: this.state.currentContext,
        collection: collection,
        onNavigation: this.navigate });
    }.bind(this));
    return React.createElement(
      'div',
      null,
      React.createElement(ContextMenu, { contexts: this.state.contexts }),
      cards
    );
  }
});

ReactDOM.render(React.createElement(DataCardApp, { data: dataManager }), document.getElementById('container'));

},{}]},{},[1]);
