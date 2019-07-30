/* eslint-disable no-unused-vars */
// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2019 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
// ==========================================================================
 /*global Papa */
import {uiControl} from './modules/uiControl';
import {codapHelper} from './modules/codapHelper';

let constants = {
  name: 'Import CSV',
  thresholdRowCount: 3000,
  thresholdColCount: 40,
  defaultDataSetName: 'dataset',
  defaultCollectionName: 'cases',
  defaultAttrName: 'attr'
}

let codapConfig = {
  name: constants.name,
  title: constants.name,
  version: 0.1,
  dimensions: {width: 400, height: 100}
}

let config = {
  firstRowIsAttrList: true,
  chunkSize: 200,
  dataSetName: constants.defaultDataSetName,
  collectionName: constants.defaultCollectionName,
  attrName: constants.defaultAttrName,

}


function fetchAndParseURL(url) {
  return fetch(url)
      .then(function (resp) {
        return new Promise(function (resolve, reject){
          if (resp.ok)
            resp.text().then(function (data) {
              let parse = Papa.parse(data)
              let tab = parse.data;
              console.log('made table: ' + (tab && tab.length));
              resolve(tab);
            });
        })
      });

}


function main() {
  codapHelper.init(codapConfig).then(function (pluginState) {
    console.log('pluginState: ' + pluginState && JSON.stringify(pluginState));

    // for now
    if (!pluginState || !pluginState.url) pluginState = {url : 'http://localhost/~jsandoe/Automobiles.csv'};

    if (pluginState && pluginState.url) {
      fetchAndParseURL(pluginState.url)
          .then(function (data) { codapHelper.sendDataSetToCODAP(data, config); })
          .then(function () { codapHelper.openTextBoxInCODAP(constants.name, pluginState.url); })
          .then(codapHelper.closeSelf)
          .catch(function (ex) {
            uiControl.displayError(ex);
          });
    }
  })
  .catch(function (msg) {
    uiControl.displayError(msg);
  });
}

main();
