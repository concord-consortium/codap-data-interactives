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
import {userActions} from "./app.userActions.js";

/*global Papa:true */
let DBconnect = {

  /**
   * Retrieves sample data from the server.
   *
   * Will retrieve a subsample for each state/year combination.
   * Each retrieval will return 1000 records. The actual number needed will be
   * randomly selected (without replacement) from this set.
   *
   * @param iAtts Selected attributes. Unused in current implementation.
   * @param iStateCodes
   * @param iYears
   * @param iAllAttributes {{}} All possible attributes indexed by attribute name.
   * @return {Promise<*[]|[]>}
   */
  getCasesFromDB: async function (iAtts, iStateCodes, iYears, iAllAttributes) {
    function computeSubsample(data, size) {
      if (data.length <= size) {
        return data;
      }
      let randomizedData = data.map(function (item) { return {r: Math.random(), d: item};});
      randomizedData.sort(function(a, b) { return a.r - b.r; });
      let filteredData = randomizedData.filter(function (item, ix) {return (ix < size);})
      return filteredData.map(function (item) { return item.d;});
    }

    function fetchSubsampleChunk(stateName, year, chunkSize) {
      return new Promise(function (resolve, reject) {
        try {
          let dataset = _this.metadata.datasets.find(function (ds) {return ds.name === String(year);})
          let presetCount = dataset && dataset.presetCount;
          let presetIndex = Math.floor(Math.random() * presetCount);
          let filePrefix = _this.metadata.filenamePrefix || 'preset-';
          let fileSuffix = _this.metadata.filenameSuffix || '.csv';
          let presetName = filePrefix + presetIndex + fileSuffix;
          let dataExistsForYearAndState = _this.yearHasState(year, stateName);
          if (dataExistsForYearAndState) {
            let presetURL = `${_this.metadata.baseURL}/${year}/${stateName}/${presetName}`;

            // fetch chunks then randomly pick selection set.
            app.addLog('Send request: ' + presetURL);
            Papa.parse(presetURL, {
              header: true, /* converts CSV rows to objects as defined by the header line */
              download: true, /* indicates this is a url to fetch */
              complete: function (response) {
                if (response.errors.length === 0) {
                  app.addLog('Good response: ' + (response.data?response.data.length: ''));
                  resolve(computeSubsample(response.data, chunkSize));
                } else {
                  let msg = `Errors fetching ${presetURL}: ${response.errors.join(
                      ', ')}`;
                  app.addLog(msg);
                  reject(msg);
                }
              }, error: function (error/*, file*/) {
                app.addLog(error);
                reject(error);
              }
            })
          } else {
            resolve([]);
          }
        } catch(ex) {
          reject(ex);
        }
      });
    }


    let _this = this;
    const tSampleSize = userActions.getSelectedSampleSize();

    iStateCodes = iStateCodes || [];
    let stateAttribute = iAllAttributes.State;
    let stateMap = stateAttribute.categories;
    let stateNames = iStateCodes.length?
        iStateCodes.map(function (sc) { return stateMap[sc]; }):
        ['all'];

    iYears = iYears || [];

    let chunks = stateNames.length * iYears.length;
    if (!chunks) {
      return Promise.resolve([]);
    }
    let chunkSize = tSampleSize/chunks;
    let fetchPromises = [];
    stateNames.forEach(function (stateName) {
      iYears.forEach(function (year) {
        // if chunk size is large get double, so we can get a unique subsample
        if (chunkSize > 900) {
          fetchPromises.push(fetchSubsampleChunk(stateName, year, chunkSize/2));
          fetchPromises.push(fetchSubsampleChunk(stateName, year, chunkSize/2));
        } else {
          fetchPromises.push(fetchSubsampleChunk(stateName, year, chunkSize));
        }
      });
    });
    return Promise.all(fetchPromises);
  },

  getDatasetNames: function () {
    if (this.metadata.datasets) {
      let names = this.metadata.datasets.map(function (ds) { return ds.name;});
      return names;
    } else {
      return [];
    }
  },
  getStateNames: function () {
    let stateSet = {};
    if (this.metadata.datasets) {
      this.metadata.datasets.forEach(function (ds) {
        ds.presetCollections.forEach(function (name) {
          stateSet[name] = name;
        });
      });
      return Object.keys(stateSet);
    } else {
      return [];
    }
  },

  yearHasState: function (year, stateName) {
    year = String(year);
    if (this.metadata.datasets) {
      let yearDataset = this.metadata.datasets.find(function (ds) { return ds.name === year});
      return (yearDataset && (yearDataset.presetCollections.indexOf(stateName) >= 0));
    }
  },

  getDBInfo: async function (iType, metadataURL) {
    if (!this.metadata) {
      let response = await fetch(metadataURL);
      if (response.ok) {
        this.metadata = await response.json();
      } else {
        this.metadata = {};
        console.warn(`Metadata Fetch error: ${response.statusText}`);
      }
    }
    if (iType === 'getYears') {
      return this.getDatasetNames();
    }
    else if (iType === 'getStates') {
      return this.getStateNames();
    }
  }
};

export {DBconnect};
