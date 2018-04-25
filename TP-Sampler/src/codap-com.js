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

      this.drawAttributes = null;
      this.collectionAttributes = null;

      codapInterface.on('get', 'interactiveState', getStateFunc);

      this.init();
    };

    CodapCom.prototype = {

      init: function() {
        // initialize the codapInterface
        codapInterface.init({
          name: 'Sampler',
          title: 'Sampler',
          dimensions: {width: 235, height: 400},
          version: 'v0.3 (#' + window.codapPluginConfig.buildNumber + ')',
          stateHandler: this.loadStateFunc
        }).then(this.findOrCreateDataContext, this.error);
      },

      findOrCreateDataContext: function () {
        this.codapConnected = true;
        // Determine if CODAP already has the Data Context we need.
        // If not, create it.
        return codapInterface.sendRequest({
            action:'get',
            resource: 'dataContext[Sampler]'
          }, function (result) {
            if (result && !result.success) {
              codapInterface.sendRequest({
                action: 'create',
                resource: 'dataContext',
                values: {
                  name: "Sampler",
                  collections: [
                    {
                      name: 'experiments',
                      attrs: [
                        {name: "experiment", type: 'categorical'},
                        {name: "sample_size", type: 'categorical'}
                      ],
                      childAttrName: "experiment"
                    },
                    {
                      name: 'samples',
                      parent: 'experiments',
                      // The parent collection has just one attribute
                      attrs: [{name: "sample", type: 'categorical'}],
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
                      attrs: [{name: "value"}]
                    }
                  ]
                }
              }, function(result) { console.log(result); });
            }
          }
        );
      },

      error: function() {
        console.log("Failed to connect to CODAP");
        this.codapConnected = false;
      },

      startNewExperimentInCODAP: function(experimentNumber, sampleSize) {
        var _this = this;
        if (!_this.codapConnected) {
          console.log('Not in CODAP');
          return;
        }
        _this.openTable();

        this.itemProto = {
          experiment: experimentNumber,
          sample_size: sampleSize
        };
      },

      openTable: function() {
        if (!this.codapConnected) {
          return;
        }

        codapInterface.sendRequest({
          action: 'create',
          resource: 'component',
          values: {
            type: 'caseTable'
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
        codapInterface.sendRequest({
          action: 'create',
          resource: 'item',
          values: items
        });
      },
      addValuesToCODAP: function(run, vals, isCollector) {
        this.addMultipleSamplesToCODAP([{run: run, values: vals}], isCollector);
      },

      deleteAll: function(device, populateContextsList) {
        var _this = this;
        codapInterface.sendRequest({
          action: 'delete',
          resource: 'dataContext[Sampler].collection[experiments].allCases'
        });
        var structure = { items: ['value']};
        Object.keys( structure).forEach( function( key) {
          var tValidAttrs = structure[ key];
          codapInterface.sendRequest( {
            action: 'get',
            resource: 'dataContext[Sampler].collection[' + key + '].attributeList'
          }).then( function( iResult) {
            var tMsgList = [];
            if( iResult.success) {
              iResult.values.forEach( function( iAttribute) {
                if( tValidAttrs.indexOf( iAttribute.name) < 0) {
                  tMsgList.push( {
                    action: 'delete',
                    resource: 'dataContext[Sampler].collection[' + key + '].attribute[' + iAttribute.name + ']'
                  });
                }
              });
              if( tMsgList.length > 0)
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
          });
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

              var count = results.values,
                  reqs = [];
              for (var i = 0; i < count; i++) {
                reqs.push({
                  action: 'get',
                  resource: _this.collectionResourceName + '.caseByIndex['+i+']'
                });
              }
              codapInterface.sendRequest(reqs).then(function(results) {
                results.forEach(function(res) {
                  caseVariables.push(res.values['case'].values);
                });
                resolve(caseVariables);
             });
            }
          }

          function addAttributes() {
            _this.collectionAttributes.forEach(function (attr) {
              if (_this.drawAttributes.indexOf(attr) < 0) {
                codapInterface.sendRequest({
                  action: 'create',
                  resource: 'collection[items].attribute',
                  values: [
                    {
                      name: attr
                    }
                  ]
                });
              }
            });
          }

          function setCollection (result) {
            if (result.success) {
              _this.collectionResourceName = "dataContext[" + contextName + "].collection[" +
                  result.values[0].name + "]";
              codapInterface.sendRequest([
                {     // get the existing columns in the draw table
                  action: 'get',
                  resource: 'collection[items].attributeList'
                },
                {     // get the columns we'll be needing
                  action: 'get',
                  resource: _this.collectionResourceName + '.attributeList'
                },
                {     // get the number of cases
                  action: 'get',
                  resource: _this.collectionResourceName + '.caseCount'
                }
              ]).then(function(results) {
                _this.drawAttributes = results[0].values.map(function (res) {
                  return res.name;
                });
                _this.collectionAttributes = results[1].values.map(function (res) {
                  return res.name;
                });
                addAttributes();    // throw this over the wall
                return results[2];
              }).then(setCasesGivenCount);
            }
          }

          codapInterface.sendRequest({
            action: 'get',
            resource: 'dataContext[' + contextName + '].collectionList'
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
      }
    };

    return CodapCom;
});
