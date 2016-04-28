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
    this.data.contexts = contextList;
    this.notify();
  },

  setDataCards: function (context) {
    this.data.collections = context.collections;
    this.data.collections.forEach(function(collection) {
      collection.currentCaseIndex = 0;
    });
    this.notify();
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
      var parentCaseIndex = parentCollection.cases.findIndex(function(iCase) {
        return iCase.guid === parentId;
      });
      console.log('adjustParentCard. ' + JSON.stringify({
            parentId: parentId,
            parentCollectionCaseIds: parentCollection.cases.map(function (iCase) {return iCase.guid;}),
            collectionIx: collectionIx,
            parentCaseIndex: parentCollection.currentCaseIndex
          }));
      if (parentCaseIndex >= 0) {
        parentCollection.currentCaseIndex = parentCaseIndex;
      }
      adjustParentCard(collectionIx - 1, parentCollection.cases[parentCollection.currentCaseIndex]);
    }
    function adjustChildCard(collectionIx, myCase){
      if (collectionIx + 1 >= collections.length) {
        return;
      }
      var parentId = myCase.guid;
      var childCollection = collections[collectionIx + 1];
      var childCase  = childCollection.cases[childCollection.currentCaseIndex];
      var childCaseIx;
      if (childCase.parent !== parentId) {
        childCaseIx = childCollection.cases.findIndex(function (iCase) { return iCase.parent === parentId; });
        console.log('adjustChildCard. ' + JSON.stringify({
              parentId: parentId,
              childCollectionCaseIds: childCollection.cases.map(function (iCase) {return iCase.guid;}),
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
    var collection = (collectionIx >= 0) && this.data.collections[collectionIx];

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
      } else if (direction === 'right' && (collection.currentCaseIndex + 1) < collection.cases.length) {
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

var dispatcher = Object.create({
  //connection: null,
  //connectionState: 'uninitialized',
  //connectionSendCount: 0,
    init: function () {
      this.connection = new iframePhone.IframePhoneRpcEndpoint(function () {
      }, "data-interactive", window.parent);
      this.connectionState = 'initialized';
      this.sendRequest({
        action: 'update', resource: 'doc.interactiveFrame', values: {
          "title": "Data Card",
          "version": "0.1",
          "dimensions": { "width": 500, "height": 600}
        }
      });
      this.sendRequest({
        "action": "get",
        "resource": "doc.dataContext"
      });
    },

    sendRequest: function (request) {
      this.connection.call(request, function (response) {
        this.handleResponse(request, response);
      }.bind(this));
    },

    handleResponse: function (request, result) {
      if (!result) {
        console.log('Request to CODAP timed out: ' + JSON.stringify(request));
        this.connectionState = 'timed-out';
      } else if (!result.success) {
        console.log('Request to CODAP Failed: ' + JSON.stringify(request));
        this.connectionState = 'active';
      } else if (request.action === 'get') {
        this.connectionState = 'active';
        if (request.resource === 'doc.dataContext') {
          this.doAction({action: 'updateContextList', data: result.values});
        } else if (/doc.dataContext\[.*]/.test(request.resource)){
          this.doAction({action: 'setDataCards', data: result.values});
        }
      } else {
        this.connectionState = 'active';
      }
    },

    doAction: function (operation) {
      switch (operation.action) {
        case 'updateContextList' :
          dataManager.setContextList(operation.data);
          break;
        case 'setDataCards' :
          dataManager.setDataCards(operation.data);
          break;
        default:
          console.log('unhandled action: ' + operation.action);
      }
    }

  });

var ContextMenu = React.createClass({
  getInitialState: function () {
    return {hasSelectedFirstOption: false};
  },
  render: function () {
    function fetchContext(contextName) {
      dispatcher.sendRequest({action: 'get', resource: 'doc.dataContext[' + contextName + ']'});
    }
    function handleSelect(ev) {
      fetchContext(ev.target.value);
    }
    if ((this.props.contexts.length > 0) && !this.state.hasSelectedFirstOption) {
      this.setState({hasSelectedFirstOption: true});
      fetchContext(this.props.contexts[0].name);
    }
    var options = this.props.contexts.map(function (context) {
      var title = context.title || context.name;
      return (
          <option key={context.name} id={context.name}>{title}</option>
      );
    });
    return <section id="context-selector" >
      <label>Context:&nbsp;
        <select id="context-selector" onChange={handleSelect} >{options}</select>
      </label >
    </section>
  }
});

var AttrList = React.createClass({
  render: function () {
    var items = this.props.attrs.map(function (item) {
      var title = item.title || item.name;
      return <div key={item.name} className="attr">{title}</div>
    });
    return <div className="attr-list">{items}</div>
  }
});

var CaseDisplay = React.createClass ({
  render: function () {
    var myCase = this.props.myCase;
    var values = this.props.attrs.map(function (attr) {
      return <div className="attr-value" key={attr.name}>{myCase.values[attr.name]}</div>;
    });
    return <div className="case">{values}</div>;
  }
});

var CaseList = React.createClass({
  render: function () {
    var caseIndex = this.props.collection.currentCaseIndex || 0;
    var myCase = this.props.collection.cases[caseIndex];
    var caseView = <CaseDisplay key={myCase.guid} attrs={this.props.collection.attrs} myCase={myCase}/>;
    return <div className="case-container"> {caseView} </div>;
  }
});

var CaseNavControl = React.createClass({
  symbol: {
    left: '<',
    right: '>'
  },
  handleClick(ev) {
    this.props.onNavigation && this.props.onNavigation(this.props.action);
  },
  render: function () {
    return <div className="control" onClick={this.handleClick}>{this.symbol[this.props.action]}</div>
  }
});

var DataCard = React.createClass({
  moveCard: function (direction) {
    console.log('moveCard: direction: ' + direction);
    this.props.onNavigation && this.props.onNavigation(this.props.collection.name, direction);
  },
  render: function () {
    var collection = this.props.collection;
    var title = collection.title || collection.name;
    return <section className="card-section">
      <div className="collection-name">{title}</div>
      <div className="card-deck">
        <div className="left-ctls">
          <CaseNavControl action="left" onNavigation={this.moveCard} />
        </div>
        <div className="attr-container">
          <AttrList attrs={collection.attrs} />
        </div>
        <div className="case-frame">
          <CaseList collection={collection} />
        </div>
        <div className="right-ctls">
          <CaseNavControl action="right"  onNavigation={this.moveCard}/>
          <div className="control ctl-add-case">+</div>
          <div className="control ctl-add-case"><span>&times;</span></div>
        </div>
      </div>
    </section>
  }
});

var DataCardApp = React.createClass({
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
    var cards = this.state.collections.map(function (collection){
      return <DataCard key={'collection' + ix++} collection={collection}
                       onNavigation={this.navigate} />
    }.bind(this));
    return <div>
      <ContextMenu contexts={this.state.contexts} />
      {cards}
    </div>
  }
});

ReactDOM.render(<DataCardApp data={dataManager} />,
    document.getElementById('container'));
dispatcher.init();

