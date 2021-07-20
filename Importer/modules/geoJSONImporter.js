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
import * as geojsonHelper from "./geojsonHelper.js";

/**
 * Fetches a URL and parses as a CSV String
 * @param url
 * @return {Promise}
 */
function fetchAndParseURL(url) {
  return fetch(url)
      .then(function (resp) {
        return new Promise(function (resolve, reject){
          if (resp.ok) {
            resp.text().then(function (data) {
              let tab = JSON.parse(data);
              resolve(tab);
            });
          }
          else {
            reject(resp.statusText);
          }
        });
      });
}

/**
 * Fetches the contents of a file and parses as a CSV String
 * @param file
 * @return {Promise}
 */
function readAndParseFile(file) {
  return new Promise(function (resolve, reject) {
    function handleAbnormal() {
      reject("Abort or error on file read.");
    }
    function handleRead() {
      let data = JSON.parse(this.result);
      resolve(data)
    }
    let reader = new FileReader ();
    reader.onabort = handleAbnormal;
    reader.onerror = handleAbnormal;
    reader.onload = handleRead;
    return reader.readAsText(file);
  });
}

/**
 * Compose a resource description to display in a text box.
 * @param src
 * @param time
 * @return {string}
 */
function composeResourceDescription(src, time) {
  return `source: ${src}\nimported: ${time.toLocaleString()}`
}

/**
 * Retrieve data in whatever form provided and parse as a CSV String
 * @return {Promise}
 */
async function retrieveData(config) {
  let sourceDataset = {
    firstRowIsAttrList: true,
    defaultAttrName: 'attr',
    dataStartingRow: 0
  };
  let importDate = new Date();
  let featureSet = null;
  if (config.url) {
    sourceDataset.resourceDescription = composeResourceDescription(config.url, importDate);
    featureSet = await fetchAndParseURL(config.url);
    sourceDataset.sourceType = 'url';
  } else if (config.file) {
    sourceDataset.resourceDescription = composeResourceDescription(config.source, importDate);
    featureSet = await readAndParseFile(config.file);
    sourceDataset.sourceType = 'file';
  } else if (config.text) {
    sourceDataset.resourceDescription = composeResourceDescription('local file -- ' + (config.name || config.filename), importDate);
    featureSet = await Promise.resolve((typeof config.text === 'string')? JSON.parse(config.text):config.text);
    sourceDataset.sourceType = 'text';
  }
  featureSet = geojsonHelper.prepareGeoJSONObject(featureSet, config.source);
  sourceDataset.attributeNames = geojsonHelper.determineAttributeSet(featureSet);
  sourceDataset.table = [];
  if (featureSet && featureSet.features && sourceDataset.attributeNames) {
    featureSet.features.forEach(function (feature) {
      let itemList = geojsonHelper.createItemList(feature);
      itemList.forEach(function (item) {
        let row = sourceDataset.attributeNames.map(function (name) {
          return item[name];
        });
        sourceDataset.table.push(row);
      });
    })
  }
  return sourceDataset;
}

export {
  retrieveData
}
