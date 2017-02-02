var codapConnector = Object.create({
  init: function (dataStore) {
    this.connection = null;
    this.dataManager = dataStore;
    this.dataContextName = "Google Sheets";
    this.initConnection();
  },

  initConnection: function() {
    this.connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
    this.getIframe();
    this.createDataContext();
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
    this.sendRequest(message, this.didSaveIframe.bind(this));
  },
  initIframe: function(response) {
    console.log("didInitIframe");
    this.setConnected();
    this.getIframe();
  },

  requestDeleteAllCases: function() {
    dispatcher.sendRequest({
      action: 'delete',
      resource: 'dataContext[' + contextName + '].allCases'
    }, this.didDeleteAllCases);
  },

  didDeleteAllCases: function(response) {

  }



});