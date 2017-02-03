var codapConnector = Object.create({
  init: function (dataStore) {
    this.connection = null;
    this.dataManager = dataStore;
    this.dataContextName = "Google Sheets";
    this.initConnection();
  },

  initConnection: function() {
    this.connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
    this.initIframe();
    this.getDataContext() ;
  },

  handleError: function(data) {
    console.error("Error:");
    console.error(data);
  },

  setConnected: function() {
    this.dataManager.updateStateProperty('connected', true);
  },

  getConnected: function() {
    return this.dataManager.connected
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
          values = dataManager.getPersistentState();
        }
        break;
      default:
        console.log('Unsupported request from CODAP to DI: ' +
          JSON.stringify(request));      }
    callback({success: success, values: values});
  },

  sendRequest: function (request, handler, _errorHandler) {
    var errorHandler = _errorHandler || this.handleError;
    this.connection.call(request, function(response) {
      if(response.success) {

        handler(response);
      }
      else {
        errorHandler(response);
      }
    }.bind(this));
  },

  getAttributes: function() {
    return [
      { name: 'a', type: 'numeric' },
      { name: 'b', type: 'numeric' }
    ]
  },

  getDataContext: function() {
    var message = {
      action: 'get',
      resource: 'dataContext[' + this.dataContextName + ']'
    };
    this.sendRequest(
      message,
      this.didGetDataContext.bind(this),
      // create a new DataContext if we can't find ours.
      this.createDataContext.bind(this)
    );
  },

  didGetDataContext: function(response) {
    console.log('didGetDataContext');
    this.setConnected();
  },

  createDataContext: function()  {
    var message = {
      action: 'create',
      resource: 'dataContext',
      values: {
        name: this.dataContextName,
        title: this.dataContextName,
        collections: [
          {
            name: 'Google Sheets',
            title: 'Google Sheets',
            labels: {
              singleCase: 'rows',
              pluralCase: 'row'
            },
            attrs: this.getAttributes()
          }
        ]
      }
    };
    this.sendRequest(message, this.didCreateDataContext.bind(this));
  },

  didCreateDataContext: function(response) {
    console.log('didCreateDataContext');
    this.setConnected();
  },

  // We call this in order to load our serialized data.
  // There should be another way to do this.
  getIframe: function() {
    message = {
      action: 'get',
      resource: 'interactiveFrame'
    }
    this.sendRequest(message,this.didGetIframe.bind(this))
  },

  didGetIframe: function(response) {
    dataManager.setPersistentState(response.values.savedState);
    dataManager.register(this);
  },

  initIframe: function() {
    message = {
      action: 'update',
      resource: 'interactiveFrame',
      values: {
        title: this.dataManager.state.title,
        version: this.dataManager.state.version,
        preventBringToFront: false,
        dimensions: this.dataManager.state.dimensions
      }
    };
    this.sendRequest(message, this.didInitIframe.bind(this));
  },

  didInitIframe: function(response) {
    console.log("didInitIframe");
    this.setConnected();
    this.getIframe();
  },

  requestDeleteAllCases: function(_callback) {
    var callBack = _callback || this.didDeleteAllCases();
    this.sendRequest({
      action: 'delete',
      resource: 'dataContext[' + this.dataContextName + '].allCases'
    }, this.didDeleteAllCases);
  },

  didDeleteAllCases: function(response) {
  },

  addCases: function(rows) {
    debugger;
  },

  replaceCases: function(rows) {
    this.requestDeleteAllCases(this.addCases.bind(this));
  },

  setState: function(state) {
    // this.replaceCases(state.rows);
  }


});