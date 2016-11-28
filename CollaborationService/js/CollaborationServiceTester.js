/* jshint strict: false */
/*global iframePhone:true,React:true, ReactDOM:true */

var div = React.DOM.div,
    span = React.DOM.span,
    button = React.DOM.button,
    input = React.DOM.input,
    select = React.DOM.select,
    option = React.DOM.option,
    connection;

var TestView = React.createFactory(React.createClass({

  getInitialState: function () {
    return {
      contextName: 'TestContext1',
      collectionName: 'TestCollection1',
      createdContexts: false
    };
  },

  componentDidMount: function () {
    var self = this,
        contextQueue = [],
        processContextQueue, i;

    for (i = 0; i < this.props.numContexts; i++) {
      contextQueue.push({
        name: 'TestContext' + (i + 1),
        title: 'Test Context #' + (i + 1)
      });
    }

    processContextQueue = function () {
      var context = contextQueue.shift(),
          collections = [],
          j;

      if (!context) {
        self.setState({createdContexts: true});
        return;
      }

      for (j = 0; j < self.props.numCollections; j++) {
        collections.push({
          name: 'TestCollection' + (j + 1),
          title: context.title + ' / Collection #' + (j + 1),
          attrs: [
            { name: 'Key' },
            { name: 'Value' }
          ]
        });
      }

      connection.call({
        action: 'create',
        resource: 'dataContext',
        values: {
          name: context.name,
          title: context.title,
          collections: collections
        }
      }, function (result) {
        processContextQueue();
      });
    };
    processContextQueue();
  },

  createCase: function (key, value) {
    connection.call({
      action: 'create',
      resource: 'dataContext[' + this.state.contextName + '].collection[' + this.state.collectionName + '].case',
      values:[{
        values: {
          Key: key,
          Value: value
        }
      }]
    });
  },

  add: function () {
    this.createCase(this.refs.key.value, this.refs.value.value);
  },

  generate: function () {
    var randomText = function () {
      var length = 3 + (Math.random() * 10),
          letters = [],
          i;
      for (i = 0; i < length; i++) {
        letters.push(String.fromCharCode(97 + (Math.random() * 26)));
      }
      return letters.join('');
    };
    this.createCase(randomText(), randomText());
  },

  contextChange: function () {
    this.setState({contextName: this.refs.context.value});
  },

  collectionChange: function () {
    this.setState({collectionName: this.refs.collection.value});
  },

  render: function () {
    var contexts = [],
        collections = [],
        i, value;

    if (!this.state.createdContexts) {
      return div({}, 'Creating contexts and collections...');
    }
    else {
      for (i = 0; i < this.props.numContexts; i++) {
        value = 'TestContext' + (i + 1);
        contexts.push(option({value: value, key: value}, 'Test Context #' + (i + 1)));
      }
      for (i = 0; i < this.props.numCollections; i++) {
        value = 'TestCollection' + (i + 1);
        collections.push(option({value: value, key: value}, 'Test Collection #' + (i + 1)));
      }
      return div({},
        div({},
          select({ref: 'context', value: this.state.contextName, onChange: this.contextChange}, contexts)
        ),
        div({},
          select({ref: 'collection', value: this.state.collectionName, onChange: this.collectionChange}, collections)
        ),
        div({className: 'input-form'},
          div({}, span({className: 'input-label'}, 'Key:'), input({ref: 'key', type: 'text'})),
          div({}, span({className: 'input-label'}, 'Value:'), input({ref: 'value', type: 'text'})),
          div({}, button({onClick: this.add}, 'Add'), button({onClick: this.generate}, 'Generate'))
        )
      );
    }
  }
}));

var CollaborationServiceTesterAppView = React.createFactory(React.createClass({

  getInitialState: function () {
    return {
      numContexts: 0,
      numCollections: 0,
      selectedOptions: false,
      connectionState: 'initializing'
    };
  },

  componentDidMount: function () {
    var self = this;
    connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
    connection.call({
      action: "get",
      resource: "interactiveFrame"
    }, function (response) {
      var values, savedState;

      if (!response) {
        self.setState({connectionState: 'timed-out'});
      }
      else {
        self.setState({connectionState: 'active'});
        values = response.values || {};
        savedState = values.savedState || {};
        if (savedState.testType) {
          self.setState({testType: savedState.testType});
        }
        connection.call({
          action: "update",
          resource: "interactiveFrame",
          values: {
            title: values.title || "Collaboration Service Tester",
            version: values.version || "0.1",
            preventBringToFront: false,
            dimensions: values.dimensions || {width: 400, height: 300}
          }
        });
      }
    });
  },

  componentWillUnmount: function () {
    connection.disconnect();
  },

  handleCODAPRequest: function (request, callback) {
    function getResourceType(resourceSelector) {
      return resourceSelector && resourceSelector.match(/^[^[]*/)[0];
    }
    var resourceType = getResourceType(request.resource);
    var success = false;
    var values = null;
    switch (resourceType) {
      case 'interactiveState':
        if (request.action === 'get') {
          success = true;
          values = {
            numContexts: this.state.numContexts,
            numCollections: this.state.numCollections
          };
        }
        break;
    }
    callback({success: success, values: values});
  },

  selectTest: function () {
    this.setState({selectedOptions: (this.state.numContexts > 0) && (this.state.numCollections > 0)});
  },

  changedContext: function () {
    this.setState({numContexts: this.refs.contextSelector.value});
  },

  changedCollection: function () {
    this.setState({numCollections: this.refs.collectionSelector.value});
  },

  render: function () {
    var contexts = [],
        collections = [],
        i;

    if (this.state.connectionState === 'initializing') {
      return div({}, 'Waiting to connect with CODAP...');
    }
    else if ((this.state.connectionState === 'timed-out') && (window.location.search.indexOf('testOutsideOfCODAP') === -1)) {
      return div({}, 'Could not connect with CODAP!');
    }
    else if (!this.state.selectedOptions) {
      for (i = 0; i < 10; i++) {
        contexts.push(option({value: i, key: 'context' + i}, i));
        collections.push(option({value: i, key: 'collection' + i}, i));
      }
      return div({},
        div({}, 'How many data contexts would you like to use?'),
        select({ref: 'contextSelector', onChange: this.changedContext, value: this.state.numContexts}, contexts),
        div({}, 'How many data collections would you like to use inside those contexts?'),
        select({ref: 'collectionSelector', onChange: this.changedCollection, value: this.state.numCollections}, collections),
        div({},
          button({onClick: this.selectTest, disabled: ((this.state.numContexts === 0) || (this.state.numCollections === 0))}, 'Create contexts and collections')
        )
      );
    }
    else {
      return TestView({numContexts: this.state.numContexts, numCollections: this.state.numCollections});
    }
  }
}));

ReactDOM.render(CollaborationServiceTesterAppView({}), document.getElementById('container'));

