// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2021 by The Concord Consortium, Inc. All rights reserved.
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
/* global gapi */

import {extractFirstTable} from './simpleTableModel.js';

async function loadGApiClient() {
  return new Promise((resolve, reject) => {
    function initClient() {
      const kAPIKeyURL = 'https://codap.concord.org/releases/.gapikey';
      //const kAPIKeyURL = 'http://localhost/~jsandoe/.gapikey';

      // const kClientID = '';  // TODO: Update placeholder with desired client ID.
      // const kScope = 'https://www.googleapis.com/auth/drive.readonly';
      const kDiscoveryDocs = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];

      fetch(kAPIKeyURL).then(
        function (result) {
          if (!result.ok) {
            reject(result.statusText);
          } else {
            result.text()
                .then(function(apiKey) {
                  gapi.client.init({
                    apiKey: apiKey.trim(),
                    //        clientId: kClientID,
                    //        scope: kScope,
                    discoveryDocs: kDiscoveryDocs,
                  })
                  .then(
                    resolve,
                    function (resp) {
                      console.log(`Network error: ${resp.errorText}`)
                      reject(resp.errorText);
                    });
                });
          }
        },
        reject
      );
    }

    gapi.load("client", {
      callback: function (msg) {
        // console.log(`resolve gapi load: ${msg}`);
        initClient();
      },
      onerror: function (msg) {
        console.log(`reject gapi load: ${JSON.stringify(msg)}`);
        reject(msg?msg.errorText:'network error');
      },
      timeout: 5000,
      ontimeout: function (msg) {
        // console.log(`timeout gapi load: ${msg}`);
        reject('Timeout')
      }
    });
  });
}

/**
 *
 * @return {Promise}
 */

async function fetchSpreadsheet(id) {
  let params = {
    spreadsheetId: id,
    includeGridData: false,  // TODO: Update placeholder value.
  };
  try {
    let response = await gapi.client.sheets.spreadsheets.get(params);
    if (response && response.status === 200) {
      return response.result;
    } else {
      console.warn(`GAPI spreadsheets.get(${id}) failed: ${response? response.status: null}`)
    }
  } catch (resp) {
    // catch resp seems to be the full failed HTTP response
    console.warn(`GAPI spreadsheets.get(${id}) failed: ${resp&&JSON.stringify(resp)}`)
    if (resp.result && resp.result.error) {
      throw new Error(resp.result.error.message);
    }
  }
}

async function fetchSheetData(spreadsheetId, sheetName) {
  let valuesResponse = await gapi.client.sheets.spreadsheets.values.get({
    "spreadsheetId": spreadsheetId,
    "range": sheetName
  });
  if (valuesResponse.result) {
    let values = valuesResponse.result.values;
    if (values && values.length) {
      // console.log(`  rows: ${values.length}`);
      // values.forEach( function (v,ix) { console.log(`${ix}: ${v.length}`)});
      return values;
    } else {
      console.warn(`Google sheets: ${spreadsheetId}: No values`);
    }
  }
  else {
    console.error('Error');
  }
}

function getTableStats(data) {
  return data && data.reduce(function (stats, row) {
        stats.maxWidth = Math.max(stats.maxWidth, row.length);
        stats.minWidth = Math.min(stats.minWidth, row.length);
        return stats;
      },
      {maxWidth: 0, minWidth: Number.MAX_SAFE_INTEGER, numberOfRows: data.length}
  );
}


function findOrCreateAttributeNames(dataSet) {
  let data = dataSet.table;
  if (!data) {
    return;
  }
  let table = data;
  let tableStats = getTableStats(table);
  let attrs = [];
  if (dataSet.firstRowIsAttrList && tableStats.numberOfRows > 0) {
    attrs = table[0];
    dataSet.dataStartingRow = 1;
  } else {
    dataSet.dataStartingRow = 0;
    for (let i = 0; i < tableStats.maxWidth; i++) {
      attrs[i] = dataSet.defaultAttrName + i;
    }
  }
  dataSet.attributeNames = attrs.map(function (attr) { return attr?attr.trim():'';});
}

async function retrieveData(config) {
  // extract id
  let dataSet = {
    firstRowIsAttrList: true,
    defaultAttrName: 'attr',
    sourceType: 'url',
    metadata: {
      description: 'Data extracted from the first sheet of a Google Sheets document.'
    },
    resourceDescription: 'description: data extracted from first sheet of Google spreadsheet.'
  };
  const kSheetsRE = /docs.google.com\/spreadsheets\/d\/([^\/]+)\//;
  let url = config.url
  let match = url && kSheetsRE.exec(url);
  let docId = match && match[1];
  // initialize google api client
  await loadGApiClient();
  // fetch sheets document
  let spreadsheet = await fetchSpreadsheet(docId);
  // fetch data from first sheet
  if (spreadsheet) {
    let sheets = spreadsheet.sheets;
    let firstSheet = sheets && sheets.length && sheets[0].properties.title;
    dataSet.datasetName = spreadsheet.properties.title;
    dataSet.table = await fetchSheetData(spreadsheet.spreadsheetId, firstSheet);
    dataSet.table = extractFirstTable(dataSet.table);
    findOrCreateAttributeNames(dataSet);
    return dataSet;
  }
}

export {
  retrieveData
}
