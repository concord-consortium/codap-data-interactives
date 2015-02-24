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
$(function () {
    function Adapter() {
      function origin() {
        return document.location.href.match(/(.*?\/\/.*?)\//)[1];
      }

      this.idPrefix = 'proxyID-';

      this.upRequests = 0; // requests received from DI
      this.upForwords = 0; // requests forwarded from DI
      this.upReplies = 0;  // replies received from CODAP
      this.upError = 0;    // error events in upward channel
      this.downRequests = 0;
      this.downReplies = 0;
      this.downErrors = 0;
      this.proxyIDMap = {};
      this.realIDMap = {};
      this.connector = null;
      this.actionMap = {
        closeCase: this.handleGenericReply,
        createCase: this.handleCreateCaseReply,
        createCases: this.handleCreateCasesReply,
        createCollection: this.handleCreateCollectionReply,
        createComponent: this.handleGenericReply,
        initGame: this.handleInitGame,
        logAction: this.handleGenericReply,
        openCase: this.handleOpenCaseReply,
        requestAttributeValues: this.handleGenericReply,
        requestFormulaObject: this.handleGenericReply,
        requestFormulaValue: this.handleGenericReply,
        reset: this.handleGenericReply
      };
      this.pending = [];

      this.idSeq = 0;
      if (window !== window.parent) {
        this.connector = new iframePhone.IframePhoneRpcEndpoint(function (iMsg, iCallback) {
          var reply;
          console.log('CODAP msg: ' + JSON.stringify(iMsg));
          this.downRequests++;
          if (this.doCommandFunc) {
            reply = this.doCommandFunc(iMsg);
          } else if (this.gameElement && this.gameElement.doCommandFunc) {
            // for flash games we must find the embedded swf object, then call its 'doCommandFunc'
            reply = this.gameElement.doCommandFunc(SC.json.encode(tRestoreCommand));
          } else {
            console.log('No synchronous connection point. Ignoring call.')
          }
          console.log('CODAP reply: ' + JSON.stringify(reply));
          iCallback(reply);
        }.bind(this), 'codap-game', window.parent, origin());
      }

      // attach doCommand to component element for flash games.
      this.setUpFrame();
    }

    /**
     * Sets up the frame content window to support Flash.
     * Adapted from CODAP game_view.js
     */
    Adapter.prototype.setUpFrame = function () {
      var iframe = $('iframe')[0];
      if (iframe && iframe.contentWindow) {
        var contentWindow = iframe.contentWindow, target = DG;

        // Allow the iframe to take over the entire screen (requested by InquirySpace)
        $(iframe).attr('allowfullscreen', true).attr('webkitallowfullscreen', true).attr('mozallowfullscreen', true);


        // TODO: Eliminate all callbacks but DoCommand() once clients no longer call them.

        //// NewCollectionWithAttributes
        //contentWindow.NewCollectionWithAttributes = function (iCollectionName, iAttributeNames) {
        //  target.newCollectionWithAttributes(iCollectionName, iAttributeNames);
        //};
        //
        //// AddCaseToCollectionWithValues
        //contentWindow.AddCaseToCollectionWithValues = function (iCollectionName, iValues) {
        //  target.addCaseToCollectionWithValues(iCollectionName, iValues);
        //};
        ////
        //// LogUserAction
        //contentWindow.LogUserAction = function (iActionString, iValues) {
        //  target.logUserAction(iActionString, iValues);
        //};

        // DoCommand
        contentWindow.DoCommand = function (iCmd) {
          var result;
          result = target.doCommand(iCmd);
          return SC.json.encode(result);
        };
      } else {
        DG.logWarn("DG.GameView:iframeDidLoad no contentWindow\n");
      }

    }
    Adapter.prototype.makeNewProxyID = function () {
      this.idSeq++;
      return this.idPrefix + this.idSeq;
    };

    Adapter.prototype.mapProxyID = function (proxyID, realID) {
      this.proxyIDMap[proxyID] = realID;
      this.realIDMap[realID] = proxyID;
    };

    Adapter.prototype.isProxyID = function (name) {
      return new RegExp('^' + this.idPrefix + '.*').test(name);
    }
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
     *
     * @param obj
     * @param fn callback with two arguments: value and key. Returns new value or undefined.
     * @param depth
     */
    Adapter.prototype.visitProperties = function (obj, fn, depth) {
      if (depth === undefined || depth === null) {
        depth = 1;
      }
      if (depth === 0) {
        return;
      }
      this.iterate(obj, function (val, key) {
        var result;
        //console.log(key + ', ' + val);
        if (typeof val === 'object') {
          this.visitProperties(val, fn, depth - 1);
        } else {
          result = fn(val);
          if (result) {
            obj[key] = result;
          }
        }
      }.bind(this));
    };

    /*
     * ******* Handlers *********
     * Generate needed proxy replies. R eplies are generated irrespective of
     * what actual reply CODAP may have, and may include proxy IDs.
     */
    /**
     * Handles most normal action types from a DI to CODAP.
     * @param iCmd
     * @returns {{proxyReply: {success: boolean}}}
     */
    Adapter.prototype.handleGenericReply = function (iCmd) {
      return {proxyReply: {success: true}};
    };

    /**
     * Handles init game.
     *
     * This involves extracting information we may need to talk to the DI.
     *
     * @param iCmd
     * @returns {{proxyReply: {success: boolean}}}
     */
    Adapter.prototype.handleInitGame = function (iCmd) {
      // doCommandFunc or gameEmbedID are passed to CODAP from synchronous API DIs
      // for CODAP to DI communications
      this.doCommandFunc = iCmd.args.doCommandFunc;
      this.gameEmbedID = iCmd.args.gameEmbedID;
      if (this.gameEmbedID) {
        this.gameElement = this.findCurrentGameElement(this.gameEmbedID);
      }

      return {proxyReply: {success: true}};
    };

    /**
     * Handles createCase action.
     *
     * @param iCmd
     * @returns {{proxyReply: {success: boolean, caseID: *}, proxyIDs: *[]}}
     */
    Adapter.prototype.handleCreateCaseReply = function (iCmd) {
      var caseID = this.makeNewProxyID();
      return {
        proxyReply: {success: true, caseID: caseID}, proxyIDs: [caseID]
      };
    };

    /**
     * Handles createCases action
     *
     * @param iCmd
     * @returns {{proxyReply: {success: boolean, caseID: *, caseIDs: Array}, proxyIDs: Array}}
     */
    Adapter.prototype.handleCreateCasesReply = function (iCmd) {
      var values = iCmd.values, caseIDs = [];
      if (Array.isArray(values)) {
        values.forEach(function () {
          caseIDs.push(this.makeNewProxyID());
        }).bind(this);
      }
      return {
        proxyReply: {success: true, caseID: caseIDs[0], caseIDs: caseIDs},
        proxyIDs: caseIDs
      };
    };

    /**
     * Handles createCollection action.
     *
     * @param iCmd
     * @returns {{proxyReply: {success: boolean, collectionID: *}, proxyIDs: *[]}}
     */
    Adapter.prototype.handleCreateCollectionReply = function (iCmd) {
      var collectionID = this.makeNewProxyID();
      return {
        proxyReply: {success: true, collectionID: collectionID},
        proxyIDs: [collectionID]
      };
    };

    /**
     * Handle openCase action.
     *
     * @param iCmd
     * @returns {{proxyReply: {success: boolean, caseID: *}, proxyIDs: *[]}}
     */
    Adapter.prototype.handleOpenCaseReply = function (iCmd) {
      var caseID = this.makeNewProxyID();
      return {
        proxyReply: {success: true, caseID: caseID}, proxyIDs: [caseID]
      };
    };

    /**
     * Handles unknown actions.
     *
     * @param iCmd
     * @returns {{proxyReply: {success: boolean}}}
     */
    Adapter.prototype.handleErrorReply = function (iCmd) {
      console.log('Unhandled action: ' + JSON.stringify(iCmd));
      return {
        proxyReply: {success: false}
      };
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
      var action = iCmd.action, replyHandler, rslt;

      this.upRequests++;
      console.log('DI Msg: ' + JSON.stringify(iCmd));

      if (action) {
        replyHandler = this.actionMap[action];
      }
      if (!replyHandler) {
        replyHandler = this.handleErrorReply;
      }

      rslt = replyHandler.call(this, iCmd);

      if (this.connector) {
        this.forwardDIRequest(iCmd, rslt.proxyIDs);
      }

      console.log('DI Reply: ' + JSON.stringify(rslt));

      return rslt.proxyReply;
    };

    /**
     * Forwards a request from a Data Interactive to CODAP.
     *
     * We must resolve any proxy IDs in the upbound message and, when
     * we receive a response, match the real IDs received to the proxy IDs
     * we generated in our (already sent) proxy replies to the DI.
     * Generally there is at most one proxy id in the upbound messages, but we
     * allow for multiple.
     */
    Adapter.prototype.forwardDIRequest = function (iCmd, iProxyIDs) {
      if (this.resolveIDs(iCmd)) {
        this.sendForward(iCmd, iProxyIDs);
      } else {
        this.enqueuePending(iCmd, iProxyIDs);
      }
    };

    /**
     * Looks for proxy IDs and tries to resolve them.
     *
     * @param iCmd
     * @returns {boolean}
     */
    Adapter.prototype.resolveIDs = function (iCmd) {
      var resolved = true;
      this.visitProperties(iCmd, function (value, key) {
        var id;
        if (this.isProxyID(value)) {
          id = this.proxyIDMap[value];
          if (!id) {
            resolved = false;
          }
          return id;
        }
      }.bind(this), 2);
      return resolved;
    };

    Adapter.prototype.sendForward = function (iCmd, iProxyIDs) {
      this.upForwords++;
      console.log('Forward: ' + JSON.stringify(iCmd));
      this.connector.call(iCmd, function (iReply) {
        if (iReply && iReply.success) {
          if (iCmd.action === 'openCase' || iCmd.action === 'createCase') {
            this.mapProxyID(iProxyIDs[0], iReply.caseID);
          } else if (iCmd.action === 'createCases') {
            iProxyIDs.forEach(function (value, ix) {
              this.mapProxyID(value, iReply.caseIDs[ix]);
            }.bind(this));
          }
        }
        console.log('Reply to Fwd: ' + JSON.stringify(iReply));
        this.upReplies++;
        this.retryPending();
      }.bind(this));
    };

    /**
     * Retries all pending requests and forwards them, if possible.
     */
    Adapter.prototype.retryPending = function () {
      var requests;
      if (this.pending.length > 0) {
        requests = this.pending;
        this.pending = [];
        requests.forEach(function (value) {
          this.forwardDIRequest(value.cmd, value.ids);
        }.bind(this));
      }
    };

    /**
     * Enqueues a DI to CODAP request that cannot be handled at this moment
     * @param iCmd
     * @param iProxyIDs
     */
    Adapter.prototype.enqueuePending = function (iCmd, iProxyIDs) {
      this.pending.push({cmd: iCmd, ids: iProxyIDs});
    };

    /**
     * Find the current game element in DG, by searching the DOM
     *    Useful for callbacks to embedded flash .swf objects,
     *    which have functions made available by AS3's ExternalInterface.addCallback()
     * @param embeddedGameID the ID parameter of the game, e.g. set by ChainSaw.html for ChainSaw.swf
     * @return {} null or an element of an iFrame that has the given html ID.
     */
    Adapter.prototype.findCurrentGameElement = function (embeddedGameID) {
      // games are dynamically embedded objects in iFrames
      var iFrames = document.getElementsByTagName("iframe"), gameElement = null;
      if (embeddedGameID) {
        var i, j; // find first iFrame with embedded element ID==embeddedGameID (expect 0 or 1 match)
        for (i = 0, j = iFrames.length; i < j && !gameElement; ++i) {
          gameElement = iFrames[i].contentWindow.document.getElementById(embeddedGameID);
        }
      }
      return gameElement;
    };

    var DG = {
      doCommand: function (iCmd) {
        var cmdObj;
        if (typeof iCmd === 'string') {
          try {
            cmdObj = JSON.parse(iCmd);
          } catch (ex) {
            console.log('JSON parse error on DI to CODAP message: ' + iCmd);
          }
        } else {
          cmdObj = iCmd;
        }
        return adapter.call(cmdObj);
      }, currGameController: {
        doCommand: null
      }
    }, adapter = new Adapter();
    DG.currGameController.doCommand = DG.doCommand;
  });