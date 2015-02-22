/**
 * Adapts a data interactive written with the previous synchronous API to the
 * asynchronous postMessage-based API of IFramePhone.
 *
 * The legacy interactive is expected to be instantiated in an IFrame within the
 * adapter's IFrame, which is in turn instantiated as a Data Interactive
 * Component in CODAP.
 *
 * This middle layer creates an IFramePhone connection to CODAP and a local
 * programmatic connection to the contained interactive. Since the IFramePhone
 * connection is asynchronous and the legacy data interactive interface is
 * synchronous, we have work to bind them. Mainly, this means dealing with
 * identifiers that the interactive needs and that CODAP creates. We fabricate
 * identifiers that the interactive needs immediately and remap them after the
 * 'real' identifiers are reported by CODAP.
 */
function Adapter() {
  function origin() {
    return document.location.href.match(/(.*?\/\/.*?)\//)[1];
  }
  this.idPrefix = 'proxyID-';

  this.upRequests = 0;
  this.upReplies = 0;
  this.upError = 0;
  this.downRequests = 0;
  this.downReplies = 0;
  this.downErrors = 0;
  this.proxyIdMap = {};
  this.realIdMap = {};
  this.connector = null;

  this.idSeq = 0;
  if (window !== window.parent) {
    this.connector = new iframePhone.IframePhoneRpcEndpoint( function (iMsg, iCallback) {
      this.downRequests++;
    }.bind(this), 'codap-game', window.parent, origin());
  }

  this.actionMap = {
    closeCase: this.handleGenericAction,
    createCase: this.handleCreateCase,
    createCases: this.handleCreateCases,
    createCollection: this.handleCreateCollection,
    createComponent: this.handleGenericAction,
    initGame: this.handleGenericAction,
    logAction: this.handleGenericAction,
    openCase: this.handleOpenCase,
    requestAttributeValues: this.handleGenericAction,
    requestFormulaObject: this.handleGenericAction,
    requestFormulaValue: this.handleGenericAction,
    reset: this.handleGenericAction
  };

}
Adapter.prototype.makeNewProxyID = function () {
  this.idSeq++;
  return this.idPrefix + this.idSeq;
};

Adapter.prototype.mapProxyID = function (proxyId, realId) {
  this.proxyIdMap[proxyId] = realId;
  this.realIdMap[realId] = proxyId;
};

/**
 * Iterates over obj's items, if an array, properties if an object, and
 * calls fn on each. If obj is neither array nor properties, calls fn on
 * obj.
 */
Adapter.prototype.iterate = function (obj, fn) {
  var key;
  if (Array.isArray(obj)) {
    obj.forEach(fn);
  } else if (typeof obj === 'object') {
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        fn(obj[key], key);
      }
    }
  } else {
    fn(obj);
  }
};

/**
 * Visits each of the properties of an object to a defined depth. Calls
 * the named function for each simple property.
 */
Adapter.prototype.visitProperties = function (obj, fn, depth) {
  if (depth === undefined || depth === null) {
    depth = 1;
  }
  if (depth === 0) {
    return;
  }
  this.iterate(obj, function (val, key) {
    //console.log(key + ', ' + val);
    if (typeof val === 'object') {
      this.visitProperties(val, fn, depth - 1);
    }
    else {
      fn(val);
    }
  }.bind(this));
};

Adapter.prototype.handleGenericAction = function (cmd) {
  return {success: true};
};

Adapter.prototype.handleCreateCase = function (cmd) {
  return {success: true, caseID: this.makeNewProxyID() };
};

Adapter.prototype.handleCreateCases = function (cmd) {
  var values = cmd.values,
    caseIDs = [];
  if (Array.isArray(values)) {
    values.forEach(function () {
      caseIDs.push(this.makeNewProxyID());
    }).bind(this);
  }
  return { success: true, caseID: caseIDs[0], caseIDs: caseIDs }
};

Adapter.prototype.handleCreateCollection = function (cmd) {
  return { success: true, collectionID: this.makeNewProxyID() }
};
Adapter.prototype.handleOpenCase = function (cmd) {
  return {success: true, caseID: this.makeNewProxyID() };
};

Adapter.prototype.handleError = function (cmd) {
  console.log('Unhandled action: ' + JSON.stringify(cmd));
  return {success: false};
};



/**
 * Handles a call from the hosted Data Interactive to CODAP.
 *
 * If the command type returns an ID we construct a Promise to manage
 * later arriving requests that may depend on the generated CODAP ID.
 * We return to the caller a proxy ID, then issue the command to CODAP.
 * When CODAP replies, we capture the CODAP ID.
 *
 * If the command type passes a proxied ID, we add the command as a 'then'
 * of the command who's ID we proxied and return success to the caller.
 * When the 'then' is evaluated it remaps the proxied ID to the CODAP
 * ID and issues the command.
 *
 * If the command does not involve a proxied ID, we just issue the COMMAND
 * to CODAP and return success.
 */
Adapter.prototype.call = function (iCmd) {
  var action = iCmd.action,
    callHandler, rslt;
  if (action) {
    callHandler = this.actionMap[action];
  }
  if (!callHandler) {
    callHandler = this.handleError;
  }

  this.upRequests ++;

  rslt = callHandler.call(this, iCmd);
  console.log('DI Msg: ' + JSON.stringify(iCmd));
  console.log('DI Reply: ' + JSON.stringify(rslt));

  return rslt;
};

var DG = {}, adapter = new Adapter();

DG.doCommand = function (iCmd) {
  return adapter.call(iCmd)
};
