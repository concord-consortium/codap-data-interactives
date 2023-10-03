/**
 * Codap communications module
 *
 * Additional layer of abstraction over the codap interface module to allow us
 * to keep our lengthy communications with codap out of the way.
 */

import {codapInterface} from './lib/CodapInterface.js';
import {updateDeviceName} from './app.js';
var CodapCom = function(getStateFunc, loadStateFunc, localeMgr) {
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
  this.localeMgr = localeMgr;
  this.deviceName = localeMgr.tr("DG.plugin.Sampler.dataset.attr-output");
  targetDataSetName = localeMgr.tr("DG.plugin.Sampler.dataset.name");

  this.drawAttributes = null;
  this.collectionAttributes = null;

  this.getCollectionNames = function () {
    return {
      experiments: localeMgr.tr("DG.plugin.Sampler.dataset.col-experiments"),
      samples: localeMgr.tr("DG.plugin.Sampler.dataset.col-samples"),
      items: localeMgr.tr("DG.plugin.Sampler.dataset.col-items")
    }
  };

  this.attrMap = {
    experiment: {id: null, name: localeMgr.tr("DG.plugin.Sampler.dataset.attr-experiment")},
    description: {id: null, name: localeMgr.tr("DG.plugin.Sampler.dataset.attr-description")},
    sample_size: {id: null, name: localeMgr.tr("DG.plugin.Sampler.dataset.attr-sample_size")},
    sample: {id: null, name: localeMgr.tr("DG.plugin.Sampler.dataset.attr-sample")},
    output: {id: null, name: localeMgr.tr("DG.plugin.Sampler.dataset.attr-output")},
  };

  this.findKeyById = function (idToFind) {
    for (const key in this.attrMap) {
      if (this.attrMap[key].id === idToFind) {
        return key;
      }
    }
  }

  codapInterface.on('get', 'interactiveState', getStateFunc);

  const _this = this;
  // listen for changes to attribute names, and update internal names accordingly
  codapInterface.on('notify', `dataContextChangeNotice[${targetDataSetName}]`, function(msg) {
    if (msg.values.operation === "updateAttributes") {
      msg.values.result.attrIDs.forEach((id, i) => {
        const attrKey = _this.findKeyById(id);
        if (attrKey === "output" && _this.attrMap["output"].name !== msg.values.result.attrs[i].name) {
          _this.deviceName = msg.values.result.attrs[i].name;
          updateDeviceName(msg.values.result.attrs[i].name);
        }
        _this.attrMap[attrKey].name = msg.values.result.attrs[i].name;
      });
    }
  });

};

var targetDataSetName = 'Sampler';

function getTargetDataSetPhrase() { return  'dataContext[' + targetDataSetName + ']'; }

CodapCom.prototype = {

  /*
   * Returns a Promise.
   */
  init: function() {
    // initialize the codapInterface
    return codapInterface.init({
      name: this.localeMgr.tr('DG.plugin.Sampler.title'),
      title: this.localeMgr.tr('DG.plugin.Sampler.title'),
      version: 'v0.33 (#' + window.codapPluginConfig.buildNumber + ')',
      preventDataContextReorg: false,
      stateHandler: this.loadStateFunc
    }).then( function( iInitialState) {
      if (!iInitialState) { // set default dimensions, if no initial state
        return codapInterface.sendRequest({
          action: 'update',
          resource: 'interactiveFrame',
          values: {
            dimensions: {width: 300, height: 400},
          }
        })
      }
    });
  },

  setDataSetName: function (name) {
    targetDataSetName = name;
  },

  findOrCreateDataContext: function (deviceName) {
    const _this = this;
    const collectionNames = this.getCollectionNames();

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
          const allAttrs = [["experiments", _this.attrMap.experiment.name],["experiments", _this.attrMap.description.name],
                            ["experiments", _this.attrMap.sample_size.name], ["samples", _this.attrMap.sample.name], ["items", _this.attrMap["output"].name]];
          const reqs = allAttrs.map(collectionAttr => ({
              "action": "get",
              "resource": `dataContext[${targetDataSetName}].collection[${collectionAttr[0]}].attribute[${collectionAttr[1]}]`
          }));
          codapInterface.sendRequest(reqs, function(getAttrsResult) {
            getAttrsResult.forEach(res => {
              if (res.success) {
                if (res.values.name === _this.attrMap["output"].name) {
                  _this.attrMap["output"].id = res.values.id;
                } else {
                  _this.attrMap[res.values.name].id = res.values.id;
                }
              }
            });
          });
        }

        if (getDatasetResult && !getDatasetResult.success) {
          if (deviceName && deviceName !== _this.attrMap["output"].name) {
            _this.deviceName = deviceName;
            _this.attrMap["output"].name = deviceName;
          }
          codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: {
              name: targetDataSetName,
              collections: [
                {
                  name: collectionNames.experiments,
                  attrs: [
                    {name: _this.attrMap.experiment.name, type: 'categorical'},
                    {name: _this.attrMap.description.name, type: 'categorical'},
                    {name:  _this.attrMap.sample_size.name, type: 'categorical'}
                  ],
                  // childAttrName: "experiment"
                },
                {
                  name: collectionNames.samples,
                  parent: collectionNames.experiments,
                  // The parent collection has just one attribute
                  attrs: [{name: _this.attrMap.sample.name, type: 'categorical'}],
                  // childAttrName: "sample"
                },
                {
                  name: collectionNames.items,
                  parent: collectionNames.samples,
                  // labels: {
                  //   pluralCase: "items"
                  // },
                  // The child collection also has just one attribute
                  attrs: [{name: _this.attrMap["output"].name}]
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
          const onlyIds = [];
          for (const key in _this.attrMap) {
            onlyIds.push(_this.attrMap[key].id);
          }
          if (onlyIds.indexOf(null) > -1) {
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
      description: description,
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

  addMultipleSamplesToCODAP: function (samples, isCollector, deviceName) {
    var _this = this;
    var oldDeviceName = _this.deviceName;
    var collectionNames = _this.getCollectionNames();
    if (deviceName !== _this.attrMap["output"].name) {
      _this.attrMap["output"].name = deviceName;
    };
    var items = [];
    samples.forEach(function (sample) {
      var run = sample.run;
      var item;
      sample.values.forEach(function(v) {
        if (!isCollector) {
          item = Object.assign({}, {sample: run, output: v}, _this.itemProto);
        } else {
          item = Object.assign({}, v, {sample: run}, _this.itemProto);
        }
        items.push(item);
      });
    });
    // rename all the attributes to any new names that the user has changed them to.
    // easiest to do this all in one place here.
    items.forEach(function (item) {
      const attrKeys = Object.keys(item);
      attrKeys.forEach(function (attrKey) {
        if (Object.keys(_this.attrMap).includes(attrKey)) {
          if (_this.attrMap[attrKey].name !== attrKey) {
            item[_this.attrMap[attrKey].name] = item[attrKey];
            delete item[attrKey];
          }
        }
      })
    });

    if (oldDeviceName !== deviceName) {
      codapInterface.sendRequest({
        action: "update",
        resource: `dataContext[${targetDataSetName}].collection[items].attribute[${oldDeviceName}]`,
        values: {
          "name": deviceName
        }
      }, () => _this.deviceName = deviceName).then(() => {
        codapInterface.sendRequest({
          action: 'create',
          resource: getTargetDataSetPhrase() + '.item',
          values: items
        });
      });
    } else {
    // user might have deleted all attributes in collection
    // if so, create a new collection with attribute, and create items
    // if not, check if attr exists
    // if attr exists, update as normal, else create it first
      codapInterface.sendRequest({
        action: "get",
        resource: `dataContext[${targetDataSetName}].collection[${collectionNames.items}]`,
      }).then((res) => {
        if (!res.success) {
          codapInterface.sendRequest({
            action: "create",
            resource: `dataContext[${targetDataSetName}].collection`,
            values: {
              name: collectionNames.items,
              parent: collectionNames.samples,
              attrs: [{name: deviceName,title: deviceName}]
            }
          }).then((res) => {
            if (res.success) {
              codapInterface.sendRequest({
                action: "create",
                resource: getTargetDataSetPhrase() + "item",
                values: items
              });
            }
          })
        } else {
          codapInterface.sendRequest({
            action: "get",
            resource: `dataContext[${targetDataSetName}].collection[items].attributeList`,
          }).then((res) => {
            const {values} = res;
            if (!values.length || !values.find((attr) => attr.name === deviceName)) {
              codapInterface.sendRequest({
                action: "create",
                resource: `dataContext[${targetDataSetName}].collection[items].attribute`,
                values: [
                  {
                    name: deviceName,
                    title: deviceName
                  }
                ]
              }).then((res) => {
                if (res.success) {
                  codapInterface.sendRequest({
                    action: "create",
                    resource: getTargetDataSetPhrase() + ".item",
                    values: items
                  });
                }
              })
            } else {
              codapInterface.sendRequest({
                action: "create",
                resource: getTargetDataSetPhrase() + ".item",
                values: items
              });
            }
          });
        }
      })
    }
  },

  addValuesToCODAP: function(run, vals, isCollector, deviceName) {
    this.addMultipleSamplesToCODAP([{run: run, values: vals}], isCollector, deviceName);
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
    var collectionNames = this.getCollectionNames();
    codapInterface.sendRequest( {
      action: 'get',
      resource: getTargetDataSetPhrase() + '.collection[' +
          collectionNames.items + '].attributeList'
    }).then( function( iResult) {
      var tMsgList = [];
      if( iResult.success) {
        iResult.values.forEach( function( iAttribute) {
          if(iAttribute.name !== "value") {
            tMsgList.push( {
              action: 'delete',
              resource: getTargetDataSetPhrase() +
                  '.collection[' + collectionNames.items +
                  '].attribute[' + iAttribute.name + ']'
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
              resource: getTargetDataSetPhrase() + '.collection[' +
                  _this.getCollectionNames().items + '].attribute',
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
              resource: getTargetDataSetPhrase() + '.collection[' +
                  _this.getCollectionNames().items + '].attributeList'
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

  myCODAPId: null,
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
  },

  sendFormulaToTable: async function (measureName, measureType, selections) {
    var samplesColl = this.getCollectionNames().samples;

    function getFormula() {
      switch (measureType) {
        case "sum":
          return `sum(${selections.output})`;
        case "conditional_count":
          return `count(\`${selections.output}\`${selections.operator}'${selections.value}')`;
        case "conditional_percentage":
          return `100 * count(\`${selections.output}\`${selections.operator} '${selections.value}')/count()`;
        case "mean":
          return `mean(\`${selections.output}\`)`;
        case "median":
          return `median(\`${selections.output}\`)`;
        case "conditional_sum":
          return `sum(\`${selections.output}\`, ${selections.output2}${selections.operator}'${selections.value}')`;
        case "conditional_mean":
          return `mean(\`${selections.output}\`, ${selections.output2}${selections.operator}'${selections.value}')`;
        case "conditional_median":
          return `median(\`${selections.output}\`, ${selections.output2}${selections.operator}'${selections.value}')`;
        case "difference_of_means":
          return `min(mean(\`${selections.outputPt1}\`, \`${selections.outputPt12}\`${selections.operatorPt1}'${selections.valuePt1}'), mean(\`${selections.outputPt2}\`, \`${selections.outputPt22}\`${selections.operatorPt2}'${selections.valuePt2}'))`;
        case "difference_of_medians":
          return `min(median(\`${selections.outputPt1}\`, \`${selections.outputPt12}\`${selections.operatorPt1}'${selections.valuePt1}'), mean(\`${selections.outputPt2}\`, \`${selections.outputPt22}\`${selections.operatorPt2}'${selections.valuePt2}'))`;
        default:
          return "";
      }
    }

    codapInterface.sendRequest({
      action: "get",
      resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attributeList`
    }).then((res) => {
      const attrs = res.values;
      let newAttributeName = measureName ? measureName : measureType;
      // check if attr name is already used. user could add "conditional count" twice, for example,
      // but have difference formulas (output = a, output = b)
      const attrNameAlreadyUsed = attrs.find((attr) => attr.name === newAttributeName);

        if (!attrNameAlreadyUsed) {
          codapInterface.sendRequest({
            action: 'create',
            resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attribute`,
            values: [{
              "name": newAttributeName,
              "type": "numerical",
              "formula": getFormula()
            }]
          });
        } else if (attrNameAlreadyUsed && !measureName) {
          const attrsWithSameName = attrs.filter((attr) => attr.name.startsWith(newAttributeName));
          const indexes = attrsWithSameName.map((attr) => Number(attr.name.slice(newAttributeName.length)));
          const highestIndex = Math.max(...indexes);
          if (!highestIndex) {
            newAttributeName = newAttributeName + 1;
          } else {
            for (let i = 1; i <= highestIndex; i++) {
              const nameWithIndex = newAttributeName + i;
              const isNameWithIndexUsed = attrsWithSameName.find((attr) => attr.name === nameWithIndex);
              if (!isNameWithIndexUsed) {
                newAttributeName = nameWithIndex;
                break;
              } else if (i === highestIndex) {
                newAttributeName = newAttributeName + (highestIndex + 1);
              }
            }
          }
          codapInterface.sendRequest({
            action: 'create',
            resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attribute`,
            values: [{
              "name": newAttributeName,
              "type": "numerical",
              "formula": getFormula()
            }]
          });
        } else if (attrNameAlreadyUsed && measureName) {
          codapInterface.sendRequest({
            action: 'update',
            resource: `${getTargetDataSetPhrase()}.collection[${samplesColl}].attribute[${measureName}]`,
            values: {
              "formula": getFormula()
            }
          });
        }
      })
  },

  updateDeviceNameInTable: function (name) {
    const _this = this;
    codapInterface.sendRequest({
      action: "get",
      resource: getTargetDataSetPhrase()
    }).then((res) => {
      if (res.success) {
        codapInterface.sendRequest({
          action: "update",
          resource: `dataContext[${targetDataSetName}].collection[items].attribute[${_this.deviceName}]`,
          values: {
            "name": name
          }
        }).then((res) => {
          if (res.success) {
            _this.attrMap["output"].name = name;
            _this.deviceName = name;
          } else {
            console.log(`Error: Could not update the CODAP attribute ${_this.deviceName}`);
          }
        });
      } else {
        console.log("Error: Could not find the CODAP table");
      }
    });
  }
};



export { CodapCom };
