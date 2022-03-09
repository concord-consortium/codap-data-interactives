/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 8:32 AM
 *
 * Created by Tim Erickson on 8/21/18 8:32 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */

// import codapInterface from "../common/codapInterface";
import {constants} from "./app.constants.js";

let CODAPconnect = {

  initialize: async function (/*iCallback*/) {
    try {
      await codapInterface.init(this.iFrameDescriptor, null);
    } catch (e) {
      console.log('Error connecting to CODAP: ' + e);
      window.app.state = Object.assign({}, window.app.freshState);
      return;
    }
    //  restore the state if possible

    app.state = await codapInterface.getInteractiveState();

    if (jQuery.isEmptyObject(app.state)) {
      await codapInterface.updateInteractiveState(app.freshState);
      console.log("app: getting a fresh state");
    }
    console.log("app.state is " + JSON.stringify(app.state));   //  .length + " chars");

    //  now update the iframe to be mutable...

    const tMessage = {
      "action": "update",
      "resource": "interactiveFrame",
      "values": {
        "preventBringToFront": false,
        "preventDataContextReorg": false
      }
    };

    return await codapInterface.sendRequest(tMessage);
  },

  logAction: function (iMessage) {
    codapInterface.sendRequest({
      action: 'notify',
      resource: 'logMessage',
      values: {
        formatStr: iMessage
      }
    });
  },

  makeCODAPAttributeDef: function (attr) {
    return {
      name: attr.title,
      title: attr.title,
      description: attr.description,
      type: attr.format,
      formula: attr.formula
    }
  },

  saveCasesToCODAP: async function (iValues) {
    const makeItemsMessage = {
      action : "create",
      resource : "dataContext[" + constants.datasetName + "].item",
      values : iValues
    };

    return await codapInterface.sendRequest(makeItemsMessage);
  },

  deleteAllCases: async function () {
    let theMessage = {
      action: 'delete',
      resource : "dataContext[" + constants.datasetName + "].allCases"
    };
    return await codapInterface.sendRequest(theMessage);
  },

  guaranteeDataset: async function () {
    let datasetResource = 'dataContext[' + constants.datasetName +
        ']';
    let response = await codapInterface.sendRequest({
      action: 'get',
      resource: datasetResource});
    if (!response.success) {
      await this.createNewMicrodataDataset(app.allAttributes);
      response = await codapInterface.sendRequest({
        action: 'get',
        resource: datasetResource});
    }
    return await this.makeNewAttributesIfNecessary();
  },

  makeNewAttributesIfNecessary : async function() {
    async function getCODAPAttrList() {
      let attrListResource = 'dataContext[' + constants.datasetName +
          ']';
      let response =
          await codapInterface.sendRequest({
        action: 'get',
        resource: attrListResource});
      if (response.success) {
        let attrArrays = response.values.collections.map(function (collection) {
          collection.attrs.forEach(function (attr) {
            attr.collectionID = collection.guid;
          });
          return collection.attrs;
        });
        return attrArrays.flat();
      }
    }

    let theAttributes = app.state.selectedAttributes.map(function (attrName) {
      return app.allAttributes[attrName];
    });
    let existingAttributeList = await getCODAPAttrList();
    let existingAttributeNames = existingAttributeList.map(function (attr) {
      return attr.title;
    });
    let codapRequests = [];

    theAttributes.forEach(function (attr) {
      if (!existingAttributeNames.includes(attr.title)) {
        let attrResource = 'dataContext[' + constants.datasetName + '].collection['
            + constants.datasetChildCollectionName + '].attribute';
        let req = {
          action: 'create',
          resource: attrResource,
          values: this.makeCODAPAttributeDef(attr)
        };
        if (attr.hasCategoryMap) {
          req.values._categoryMap = attr.getCategoryMap();
        }
        codapRequests.push(req);
      }
    }.bind(this));
    if (app.state.priorAttributes) {
      app.state.priorAttributes.forEach(function (attrName) {
        if (!app.state.selectedAttributes.includes(attrName)) {
          let codapAttr = existingAttributeList.find(function (cAttr) {return attrName === cAttr.name;});
          if (codapAttr) {
            let attrResource = 'dataContext[' + constants.datasetName +
                '].collection[' + codapAttr.collectionID + '].attribute[' + codapAttr.name + ']';
            let req = {
              action: 'delete', resource: attrResource
            };
            codapRequests.push(req);
          }
        }
      });
    }
    app.state.priorAttributes = app.state.selectedAttributes.slice();
    if (codapRequests.length > 0) {
      return await codapInterface.sendRequest(codapRequests);
    } else {
      return {success: true};
    }
  },

  makeCaseTableAppear : async function() {
    const theMessage = {
      action : "create",
      resource : "component",
      values : {
        type : 'caseTable',
        dataContext : constants.datasetName,
        name : constants.caseTableName,
        cannotClose : true
      }
    };

    const makeCaseTableResult = await codapInterface.sendRequest(theMessage);
    if (makeCaseTableResult.success) {
      console.log("Success creating case table: " + theMessage.title);
    } else {
      console.log("FAILED to create case table: " + theMessage.title);
    }
    return makeCaseTableResult.success && makeCaseTableResult.values.id;
  },

  autoscaleComponent: async function (name) {
    return await codapInterface.sendRequest({
      action: 'notify',
      resource: `component[${name}]`,
      values: {
        request: 'autoScale'
      }
    })
  },

  createNewMicrodataDataset: async function (attributeList) {

    return codapInterface.sendRequest({
        action: 'create',
        resource: 'dataContext',
        values: {
          name: constants.datasetName,
          title: constants.datasetTitle,
          description: constants.datasetDescription,
          collections: [{
            name: constants.datasetParentCollectionName,
            attrs: [this.makeCODAPAttributeDef(
                attributeList['State']), this.makeCODAPAttributeDef(
                attributeList['Boundaries'])]
          }, {
            name: constants.datasetChildCollectionName,
            parent: constants.datasetParentCollectionName,
            labels: {
              singleCase: "person",
              pluralCase: "people",
              setOfCasesWithArticle: "a sample of people"
            },

            attrs: [ // note how this is an array of objects.
              {name: "sample", type: "categorical", description: "sample number"},]
          }]
        }
    });
  },
  myCODAPIDd: null,
  selectSelf: async function () {
    if (this.myCODAPId == null) {
      let r1 = await codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'});
      if (r1.success) {
        this.myCODAPId = r1.values.id;
      }
    }
    if (this.myCODAPId != null) {
      return await codapInterface.sendRequest({
        action: 'notify',
        resource: `component[${this.myCODAPId}]`,
        values: {request: 'select'
        }
      });
    }
  },

  iFrameDescriptor: {
    version: constants.version,
    name: constants.appName,
    title: constants.appTitle,
    dimensions: {
      width: constants.appDefaultWidth,
      height: constants.appDefaultHeight
    },
    preventDataContextReorg: false,
    cannotClose: false
  }
};

export {CODAPconnect};
