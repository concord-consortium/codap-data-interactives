/**
 * Created by npaessel on 1/31/17.
 */

if(!window.gapi) {
  var retVal = {};
  var callBack = {};

  function init(args) {
    return {
      then: function(callB) { callB(); }
    }
  };

  function load(authMethod, callback) {
    setTimeout(callback(retVal),200);
  };

  window.gapi = {
    load: load,
    client: {
      init: init
    },
    auth2: {
      getAuthInstance: function () {
        return {
          signIn: function() {
            callBack(true);
          },
          isSignedIn: {
            listen: function (_callback) {
              callBack = _callback;
            },
            get: function(){ return false; }
          }
        }
      }
    }
  };
}