/**
 * Created by bfinzer on 2/7/15.
 */

var codapHelper = {
  codapPhone: null,
  initAccomplished: false,

  initSim: function( simDescription, doCommandFunc) {
    this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(doCommandFunc, "codap-game", window.parent);

    this.codapPhone.call({
      action: 'initGame',
      args: simDescription
    }, function ( iResult) {
      if( iResult)
        this.initAccomplished = true;
    }.bind(this));
  },

  checkForCODAP: function() {

    if (!this.initAccomplished) {
      window.alert('Please drag my URL to a CODAP document.');
      return false;
    }
    else
      return true;
  },

  createCase: function(iCollectionName, iValuesArray, iParentID, iCallback) {
    this.createCases(iCollectionName, iValuesArray, iParentID, iCallback);
  },

  createCases: function (iCollectionName, iValuesArrays, iParentID, iCallback) {
    //  console.log("In createCases");
    if( iValuesArrays && !Array.isArray( iValuesArrays))
      iValuesArrays = [iValuesArrays];
    this.codapPhone.call({
      action: 'createCase',
      args: {
        collection: iCollectionName,
        values: iValuesArrays,
        parent: iParentID,
        log: false
      }
    },
        iCallback
    );
  },

  openCase: function (iCollectionName, iValues, iCallback) {
    console.log("Open a new case in " + iCollectionName);
    if( iValues && !Array.isArray( iValues))
      iValues = [iValues];
    this.codapPhone.call({
          action: 'openCase',
          args: {
            collection: iCollectionName,
            values: iValues
          }
        },
        iCallback
    )
  },

    openParentCase: function (iCollectionName, iValues, iParentID, iCallback) {
        console.log("Opening a case in parent collection " + iCollectionName + ", case " + iParentID);
        if( iValues && !Array.isArray( iValues))
            iValues = [iValues];
        this.codapPhone.call({
                action: 'openCase',
                args: {
                    collection: iCollectionName,
                    values: iValues
                }
            },
            iCallback
        )
    },

    closeCase: function (iCollectionName, iValues, iCaseID) {
    console.log("Close case " + iCaseID + " in " + iCollectionName);
    if( iValues && !Array.isArray( iValues))
      iValues = [iValues];
    this.codapPhone.call(
        {
          action: 'closeCase',
          args: {
            collection: iCollectionName,
            values: iValues,
            caseID: iCaseID
          }
        },
        function () {
          console.log("closeCase")
        }
    );
  }

};

