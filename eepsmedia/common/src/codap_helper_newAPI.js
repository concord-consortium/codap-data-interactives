/**
 * Created by bfinzer on 2/7/15.
 * updated for new API by Tim and Jonathan, 2016-05-25
 */

/* global console, iframePhone */

var codapHelper = {
    codapPhone: null,
    restoreStateFunc: null,
    initFrameAccomplished: false,
    initDataSetAccomplished: false,
    alerted : false,

    logMessage : function( iString, iSubs ) {
        var tArg = {
            action : "notify",
            resource : "logMessage",
            values : {
                formatStr : iString,
                replaceArgs : iSubs
            }
        };

        this.codapPhone.call( tArg );
    },


    initDataInteractive: function (iFrameDescription, doCommandFunc, restoreStateFunc) {
        this.codapPhone = new iframePhone.IframePhoneRpcEndpoint(doCommandFunc, "data-interactive", window.parent);

        this.restoreStateFunc = restoreStateFunc;
        this.codapPhone.call(
            {
                action: 'update',
                resource: 'interactiveFrame',
                values: iFrameDescription
            }, function (iResult) {
                if (iResult.success) {
                    this.initFrameAccomplished = true;
                    this.getSaveObject();
                }
            }.bind(this));
    },

    getSaveObject: function() {
        this.codapPhone.call(
            {
                action: 'get',
                resource: 'interactiveFrame'
            }, function (iResult) {
                if (iResult.success) {
                    console.log('get-interactiveFrame success');
                    if( this.restoreStateFunc)
                        this.restoreStateFunc( iResult.values);
                }
            }.bind(this));
    },

    initDataSet : function( iDataSetDescription, iCallback ) {
        // First determine whether there may already be a dataset with the given name
        this.codapPhone.call(
            {
                action: 'get',
                resource: 'dataContext[' + iDataSetDescription.name + ']'
            },
            function( iResult) {
                if( !iResult.success) {
                    console.log('The data set '+ iDataSetDescription.name +" did not exist. Better make it!");
                    // The dataset did not already exist, so go ahead and create it
                    this.codapPhone.call(
                        {
                            action: 'create',
                            resource: 'dataContext',
                            values: iDataSetDescription
                        },
                        function (iResult) {
                            if (iResult.success) {
                                this.initDataSetAccomplished = true;
                                if (iCallback) {
                                    iCallback();
                                }
                            }
                        }.bind(this));
                }
                else {
                    this.initDataSetAccomplished = true;    // Because it was restored and we found it
                    if (iCallback) {
                        iCallback();
                    }
                }
            }.bind( this)
        )

    },

    checkForCODAP: function () {

        if (!this.initDataSetAccomplished) {
            if (!this.alerted) {
                window.alert('Please drag my URL to a CODAP document.');
                this.alerted = true;
            }
            return false;
        } else {
            return true;
        }

    },

    /**
     * Create new data items (broader than cases; see the documentation for the API)
     * Notes: (1) this refers only to the data context, not to any collections. Right? Has to.
     * (2) notice how the values array does not have a "values" key inside it as with createCases.
     *
     * @param iValuesArray  the array (or not) of objects, each of which will be an item. The keys are attribute names.
     * @param iCallback     callback function. iResult should contain {success : true, caseIDs : [5, 6, 7] }
     * @param iDataContextName  the name of the data set (or "data context").
     */
    createItems : function(iValuesArray, iCallback, iDataContextName) {
        if (iValuesArray && !Array.isArray(iValuesArray)) {
            iValuesArray = [iValuesArray];
        }

        var tResourceString = iDataContextName ? "dataContext[" + iDataContextName + "].item" : "item";


        var tCodapPhoneArg = {
            action : 'create',
            resource : tResourceString,
            values : iValuesArray
        };

        this.codapPhone.call(tCodapPhoneArg, iCallback);

    },

    createCase: function (iCollectionName, iValuesArray, iCallback, iDataContextName) {
        this.createCases(iCollectionName, iValuesArray, iCallback, iDataContextName);
    },

    createCases: function (iCollectionName, iValuesArrays, iCallback, iDataContextName) {
        if (this.checkForCODAP()) {
            if (iValuesArrays && !Array.isArray(iValuesArrays)) {
                iValuesArrays = [iValuesArrays];
            }

            var tCodapPhoneArg = {
                action: 'create',
                resource: this.resourceString( iCollectionName, iDataContextName ) + ".case",
                values: iValuesArrays
            };

            this.codapPhone.call(tCodapPhoneArg, iCallback);
        }
    },

    updateCase: function (iValues, iCaseID, iCollectionName, iDataContextName, iCallback) {
        console.log("Update case " + iCaseID + " in " + iCollectionName);

        this.codapPhone.call({
                action: 'update',
                resource: this.resourceString( iCollectionName, iDataContextName ) + ".caseByID[" + iCaseID + "]",
                values: iValues
            },
            iCallback
        );
    },

    selectCasesByIDs: function (IDs, iDataContextName) {

        var tResourceString = "selectionList";

        if (typeof iDataContextName !== 'undefined') {
            tResourceString = 'dataContext\[' + iDataContextName + '].' + tResourceString;
        }

        this.codapPhone.call({
            action: 'create',
            resource: tResourceString,
            values: IDs
        });
    },

    getSelectionList : function( iDataContextName, iCallback ) {
        var tResourceString = "selectionList";

        if (typeof iDataContextName !== 'undefined' && iDataContextName !== null) {
            tResourceString = 'dataContext\[' + iDataContextName + '].' + tResourceString;
        }

        this.codapPhone.call(
            {
                action: 'get',
                resource: tResourceString
            },
            iCallback
        );
    },

    sendSaveObject : function( iSaveObject, iCallback) {
        //this.codapPhone.call( iSaveObject, iCallback );
        iCallback( iSaveObject);
    },

    resourceString : function( iCollectionName, iDataContextName) {
        var oResourceString = 'collection[' + iCollectionName + ']';
        if (typeof iDataContextName !== 'undefined') {
            oResourceString = 'dataContext\[' + iDataContextName + "]." + oResourceString;
        }
        return oResourceString;
    }

};

