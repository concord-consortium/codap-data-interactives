var codapConnector = Object.create({
  init: function (dataStore) {
    this.connection = null;
    this.dataManager = dataStore;
    this.dataContextName = "Json source";
    this.dataContextIdentifier = 'dataContext['+ this.dataContextName + ']';
    this.collectionName = "Json Rows";
    this.collectionIdentifier = this.dataContextIdentifier + '.collection[' + this.collectionName + ']';
    this.initConnection();
  },

  initConnection: function() {
    this.connection = new iframePhone.IframePhoneRpcEndpoint(this.handleCODAPRequest, "data-interactive", window.parent);
    this.initIframe();
    // this.getDataContext() ;
  },

  handleError: function(data) {
    console.error("Error:");
    console.error(data);
  },

  setConnected: function() {
    this.dataManager.updateStateProperty('connected', true);
    this.dataManager.register(this);
  },

  getConnected: function() {
    return this.dataManager.state.connected
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
    var action = request && request.action;
    var resource = request && request.resource;
    this.connection.call(request, function(response) {
      if(response && response.success) {
        handler(response);
      }
      else if (response) {
        errorHandler(response);
      }
      else {  // timeout
        console.log("Time out in " + action + " " + resource);
      }
    }.bind(this));
  },

  getAttributes: function() {
    var columns=dataManager.state.columnNames;
    var attributes = []
    for(var i = 0; i < columns.length; i++) {
      attributes.push({name: columns[i], type: 'nominal'});
    }
    return attributes;
  },

  getDataContext: function() {
    var message = {
      action: 'get',
      resource: this.dataContextIdentifier
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
            name: this.collectionName,
            title: this.collectionName,
            labels: {
              singleCase: 'rows',
              pluralCase: 'row'
            }
            // attrs: this.getAttributes()
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
    if(response && response.values && response.values.savedState) {
      this.dataManager.setPersistentState(response.values.savedState);
    }
    this.getDataContext();
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
    this.getIframe();
  },

  requestDeleteAllCases: function(_callback) {
    var callBack = _callback || this.didDeleteAllCases;
    this.sendRequest({
      action: 'delete',
      resource: this.dataContextIdentifier +'.allCases'
    }, callBack.bind(this));
  },

  didDeleteAllCases: function(response) {
    // not used at the moment
  },

  addCases: function() {
    var data = []
    var rows  = this.dataManager.state.rows;
    var columns  = this.dataManager.state.columnNames;
    for(var i=0; i < rows.length; i++) {
      var cells = rows[i];
      var value = {
        id: i,
        values: {}
      };
      for(var j = 0; j < cells.length; j++) {
        value.values[columns[j]] = cells[j];
      }
      data.push(value);
    };
    var message = {
      action: 'create',
      resource: this.collectionIdentifier + '.case',
      values: data
    }
    this.sendRequest(message,this.didAddCases.bind(this));
    console.log("addCases");
  },
  didAddCases: function(result){
    console.log('didCreateCase');
  },

  createAttributes: function() {
    var attr = this.getAttributes();
    if (attr.length > 0) {
      var message = {
        action: 'create',
        resource: this.collectionIdentifier + '.attribute',
        values: attr
      }
      this.sendRequest(message, this.didCreateAttributes.bind(this));
      console.log("createAttributes");
    }
  },
  didCreateAttributes: function() {
    console.log("didCreateAttributes");
    this.addCases();
  },

  // 1. Remove All Cases
  // 5. Add  New Cases
  replaceCases: function() {
    if(this.dataManager.state.connected == true) {
      this.requestDeleteAllCases(this.createAttributes.bind(this));
      console.log("replaceCases");
    }
  },

  setState: function(state) {
    this.replaceCases();
  }

});