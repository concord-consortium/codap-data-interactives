/**
 * Codap communications module
 *
 * Additional layer of abstraction over the codap interface module to allow us
 * to keep our lengthy communications with codap out of the way.
 */

define([
    './lib/CodapInterface'],
  function (codapInterface, codapPluginConfig) {

    var CodapCom = function(getStateFunc, loadStateFunc) {
      this.codapConnected = false;
      this.itemProto = {};
      this.loadStateFunc = loadStateFunc;

      this.findOrCreateDataContext = this.findOrCreateDataContext.bind(this);
      this.error = this.error.bind(this);
      this.startNewExperimentInCODAP = this.startNewExperimentInCODAP.bind(this);
      this.addValuesToCODAP = this.addValuesToCODAP.bind(this);
      this.addMultipleSamplesToCODAP = this.addMultipleSamplesToCODAP.bind(this);
      this.openTable = this.openTable.bind(this);
      this.setDataSetName = this.setDataSetName.bind(this);
      this.findOrCreateDataContext = this.findOrCreateDataContext.bind(this);
      this.deleteAllAttributes = this.deleteAllAttributes.bind(this);

      this.drawAttributes = null;
      this.collectionAttributes = null;

      // list of attribute names. We will listen for changes on these and update as needed
      this.attrNames = {
        experiment: "experiment",
        experiment_description: "description",
        sample_size: "sample_size",
        sample: "sample",
        value: "value"
      }
      this.attrIds = {};

      codapInterface.on('get', 'interactiveState', getStateFunc);

      const _this = this;
      // listen for changes to attribute names, and update internal names accordingly
      codapInterface.on('notify', 'dataContextChangeNotice[' + targetDataSetName + ']', function(msg) {
        if (msg.values.operation === "updateAttributes") {
          msg.values.result.attrIDs.forEach((id, i) => {
            const attrKey = _this.attrIds[id];
            _this.attrNames[attrKey] = msg.values.result.attrs[i].name;
          });
        }
      });

      // this.init();
    };

    var appName = 'Sampler';
    var targetDataSetName = 'Sampler';
    function getTargetDataSetPhrase() { return  'dataContext[' + targetDataSetName + ']'; }

    CodapCom.prototype = {

      /*
       * Returns a Promise.
       */
      init: function() {
        // initialize the codapInterface
        return codapInterface.init({
          name: appName,
          title: appName,
          version: 'v0.7 (#' + window.codapPluginConfig.buildNumber + ')',
          preventDataContextReorg: false,
          stateHandler: this.loadStateFunc
        }).then( function( iInitialState) {
          if (!iInitialState) { // set default dimensions, if no initial state
            return codapInterface.sendRequest({
              action: 'update',
              resource: 'interactiveFrame',
              values: {
                dimensions: {width: 235, height: 400},
              }
            })
          }
        });
      },

      setDataSetName: function (name) {
        targetDataSetName = name;
      },

      findOrCreateDataContext: function () {
        const _this = this;
        const attrNames = this.attrNames;

        this.codapConnected = true;
        // Determine if CODAP already has the Data Context we need.
        // If not, create it.
        return codapInterface.sendRequest({
              action:'get',
              resource: getTargetDataSetPhrase()
            }).then( function (getDatasetResult) {

            function getAttributeIds() {
              // need to get all the ids of the newly-created attributes, so we can notice if they change.
              // we will set these ids on the attrIds object
              const allAttrs = [["experiments", attrNames.experiment],["description", attrNames.experiment_description],
                                ["experiments", attrNames.sample_size], ["samples", attrNames.sample], ["items", attrNames.value]];
              const reqs = allAttrs.map(collectionAttr => ({
                  "action": "get",
                  "resource": `dataContext[${targetDataSetName}].collection[${collectionAttr[0]}].attribute[${collectionAttr[1]}]`
              }));
              codapInterface.sendRequest(reqs, function(getAttrsResult) {
                getAttrsResult.forEach(res => {
                  if (res.success) {
                    _this.attrIds[res.values.id] = res.values.title;
                  }
                });
              });
            }

            if (getDatasetResult && !getDatasetResult.success) {
              codapInterface.sendRequest({
                action: 'create',
                resource: 'dataContext',
                values: {
                  name: targetDataSetName,
                  collections: [
                    {
                      name: 'experiments',
                      attrs: [
                        {name: attrNames.experiment, type: 'categorical'},
                        {name: attrNames.experiment_description, type: 'categorical', description: 'Feel free to edit!'},
                        {name: attrNames.sample_size, type: 'categorical'}
                      ],
                      childAttrName: "experiment"
                    },
                    {
                      name: 'samples',
                      parent: 'experiments',
                      // The parent collection has just one attribute
                      attrs: [{name: attrNames.sample, type: 'categorical'}],
                      childAttrName: "sample"
                    },
                    {
                      name: 'items',
                      parent: 'samples',
                      labels: {
                        pluralCase: "items",
                        setOfCasesWithArticle: "an item"
                      },
                      // The child collection also has just one attribute
                      attrs: [{name: attrNames.value}]
                    }
                  ]
                }
              }, getAttributeIds).then(
                  _this.openTable,
                  function (e) {
                    console.log('Sampler: findOrCreateDataContext failed: ' + e);
                  });
            } else if (getDatasetResult.success) {
              // DataSet already exists. If we haven't loaded in attribute ids from saved state, that means user
              // created dataset before we were tracking attribute changes. Try to get ids, but if the user has
              // already updated attribute names, this won't work.
              if (Object.keys(_this.attrIds).length === 0) {
                getAttributeIds();
              }
            }
          }
        );
      },

      error: function(msg) {
        console.log(msg || "Failed to connect to CODAP");
        this.codapConnected = false;
      },

      startNewExperimentInCODAP: function(experimentNumber, description, sampleSize) {
        var _this = this;
        if (!_this.codapConnected) {
          console.log('Not in CODAP');
          return;
        }

        this.itemProto = {
          experiment: experimentNumber,
          experiment_description: description,
          sample_size: sampleSize
        };
      },

      openTable: function() {
        if (!this.codapConnected) {
          return;
        }

        return codapInterface.sendRequest({
          action: 'create',
          resource: 'component',
          values: {
            type: 'caseTable',
            dataContext: targetDataSetName,
            isIndexHidden: true
          }
        });
      },

      addMultipleSamplesToCODAP: function (samples, isCollector) {
        var _this = this;
        var items = [];
        samples.forEach(function (sample) {
          var run = sample.run;
          var item;
          sample.values.forEach(function(v) {
            if (!isCollector) {
              item = Object.assign({}, {sample: run, value: v}, _this.itemProto);
            } else {
              item = Object.assign({}, v, {sample: run}, _this.itemProto);
            }
            items.push(item);
          });
        });
        // rename all the attributes to any new names that the user has changed them to.
        // easiest to do this all in one place here.
        items.forEach(function(item) {
          const attrs = Object.keys(item);
          attrs.forEach(function (attr) {
            if (_this.attrNames[attr] && _this.attrNames[attr] !== attr) {
              item[_this.attrNames[attr]] = item[attr];
              delete item[attr];
            }
          });
        });
        codapInterface.sendRequest({
          action: 'create',
          resource: getTargetDataSetPhrase() + '.item',
          values: items
        });
      },
      addValuesToCODAP: function(run, vals, isCollector) {
        this.addMultipleSamplesToCODAP([{run: run, values: vals}], isCollector);
      },

      deleteAll: function() {
        codapInterface.sendRequest({
          action: 'delete',
          resource: getTargetDataSetPhrase() + '.collection[experiments].allCases'
        });
      },

      // not used any more, kept for record-keeping
      deleteAllAttributes: function(device, populateContextsList) {
        var _this = this;
        codapInterface.sendRequest( {
          action: 'get',
          resource: getTargetDataSetPhrase() + '.collection[items].attributeList'
        }).then( function( iResult) {
          var tMsgList = [];
          if( iResult.success) {
            iResult.values.forEach( function( iAttribute) {
              if(iAttribute.name !== "value") {
                tMsgList.push( {
                  action: 'delete',
                  resource: getTargetDataSetPhrase() + '.collection[items].attribute[' + iAttribute.name + ']'
                });
              }
            });
            if( tMsgList.length > 0) {
              codapInterface.sendRequest( tMsgList).then( function( iResult) {
                if( iResult.success || (iResult.every( function(iItem) {
                      return iItem.success;
                    }))) {
                  if (device === "collector") {
                    return _this.getContexts().then(populateContextsList);
                  }
                }
                else {
                  return Promise.reject( "Failure to remove attributes");
                }
              }).then( null, function( iMsg) {
                console.log( iMsg);
              });
            }
          }
        });
      },

      getContexts: function() {
        var _this = this;
        return new Promise(function(resolve, reject) {
          if (!_this.codapConnected) {
            // we log that CODAP is not initiated. If we are in CODAP, it will
            // respond eventually.
            console.log('Not in CODAP');
          }

          codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContextList'
          }, function(result) {
            if (result && result.success) {
              resolve(result.values);
            } else {
              resolve([]);
            }
          });
        });
      },

      setCasesFromContext: function(contextName, caseVariables) {
        var _this = this;
        return new Promise(function(resolve, reject) {

          function setCasesGivenCount (results) {
            if (results.success) {
              caseVariables = [];

              codapInterface.sendRequest({
                action: 'get',
                resource: _this.collectionResourceName + '.allCases'
              }).then(function(results) {
                caseVariables = results.values.cases.map(function(_case) {
                  return _case.case.values;
                });
                resolve(caseVariables);
             });
            }
          }

          function addAttributes() {
            const requests = []
            _this.collectionAttributes.forEach(function (attr) {
              if (_this.drawAttributes.indexOf(attr) < 0) {
                requests.push({
                  action: 'create',
                  resource: getTargetDataSetPhrase() + '.collection[items].attribute',
                  values: [attr]
                });
              }
            });


            codapInterface.sendRequest(requests);
          }

          function setCollection (result) {
            if (result.success) {
              _this.collectionResourceName = "dataContext[" + contextName + "].collection[" +
                  result.values[0].name + "]";
              codapInterface.sendRequest([
                {     // get the existing columns in the draw table
                  action: 'get',
                  resource: getTargetDataSetPhrase() + '.collection[items].attributeList'
                },
                {     // get the columns we'll be needing
                  action: 'get',
                  resource: _this.collectionResourceName
                },
                {     // get the number of cases
                  action: 'get',
                  resource: _this.collectionResourceName + '.caseCount'
                }
              ]).then(function(results) {
                _this.drawAttributes = results[0].values.map(function (res) {
                  return res.name;
                });
                _this.collectionAttributes = results[1].values.attrs.map(function (attr) {
                  // we will use the attribute definitions to create new attributes
                  // so we take the precaution of removing identifiers.
                  delete attr.id; delete attr.guid; return attr;
                });
                addAttributes();    // throw this over the wall
                return results[2];
              }).then(setCasesGivenCount);
            }
          }

          _this.findOrCreateDataContext().then(function () {
            return codapInterface.sendRequest({
              action: 'get',
              resource: 'dataContext[' + contextName + '].collectionList'
            })
          }).then(setCollection);
        });
      },

      logAction: function( iMsg, iReplaceArgs) {
        codapInterface.sendRequest({
          action: 'notify',
          resource: 'logMessage',
          values: {
            formatStr: iMsg,
            replaceArgs: iReplaceArgs
          }
        });
      },

      myCODAPIDd: null,
      selectSelf: function () {
        function selectSelf(id) {
            return codapInterface.sendRequest({
              action: 'notify',
              resource: `component[${id}]`,
              values: {
                request: 'select'
              }
            });
        }
        if (this.myCODAPId == null) {
          codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'}).then(function (resp) {
            if (resp.success) {
              this.myCODAPId = resp.values.id;
              selectSelf(this.myCODAPId);
            }
          }.bind(this));
        } else {
          selectSelf(this.myCODAPId);
        }
      },
      register: function (action, resource, operation, callback) {
        codapInterface.on(action, resource, operation, callback);
      }
    };

    return CodapCom;
});
