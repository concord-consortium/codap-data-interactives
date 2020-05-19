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

  metadata: {
    "datasetURL": "datasets",
    years: [1940, 1960, 1970, 1980, 2000, 2010, 2017],
    states: [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware",
      "District of Columbia",
      "Florida",
      "Georgia",
      "Hawaii",
      "Idaho",
      "Illinois",
      "Indiana",
      "Iowa",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maine",
      "Maryland",
      "Massachusetts",
      "Michigan",
      "Minnesota",
      "Mississippi",
      "Missouri",
      "Montana",
      "Nebraska",
      "Nevada",
      "New Hampshire",
      "New Jersey",
      "New Mexico",
      "New York",
      "North Carolina",
      "North Dakota",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "South Dakota",
      "Tennessee",
      "Texas",
      "Utah",
      "Vermont",
      "Virginia",
      "Washington",
      "West Virginia",
      "Wisconsin",
      "Wyoming",
      "all"
    ]
  },

  /**
   * Retrieves sample data from the server.
   *
   * Will retrieve a subsample for each state/year combination.
   * Each retrieval will return 1000 records. The actual number needed will be
   * randomly selected (without replacement) from this set.
   *
   * @param iAtts Unused in current implementation.
   * @param iStateCodes
   * @param iYears
   * @return {Promise<*[]|[]>}
   */
  getCasesFromDB: async function (iAtts, iStateCodes, iYears) {
    function computeSubsample(data, size) {
      if (data.length <= size) {
        return data;
      }
      let randomizedData = data.map(function (item) { return {r: Math.random(), d: item};});
      randomizedData.sort(function(a, b) { return a.r - b.r; });
      let filteredData = randomizedData.filter(function (item, ix) {return (ix < size);})
      return filteredData.map(function (item) { return item.d;});
    }

    async function fetchSubsampleChunk(stateName, year, chunkSize) {
      return new Promise(function (resolve, reject) {
        try {
          let presetIndex = Math.floor(Math.random() * 100);
          let presetName = 'preset-' + presetIndex;
          let presetURL = `../datasets/${year}/${stateName}/${presetName}.csv`;

          // fetch chunks then randomly pick selection set.
          Papa.parse(presetURL, {
            header: true, /* converts CSV rows to objects as defined by the header line */
            download: true, /* indicates this is a url to fetch */
            complete: function (response) {
              if (response.errors.length === 0) {
                resolve(computeSubsample(response.data, chunkSize));
              } else {
                reject(`Errors fetching ${presetURL}: ${response.errors.join(', ')}`);
              }
            },
            error: function (error/*, file*/) {
              reject(error);
            }
          })
        } catch(ex) {
          reject(ex);
        }
      });
    }


    const tSampleSize = userActions.getSelectedSampleSize();

    iStateCodes = iStateCodes || [];
    let stateAttribute = app.allAttributes.State;
    let stateMap = stateAttribute.categories;
    let stateNames = iStateCodes.length?
        iStateCodes.map(function (sc) { return stateMap[sc]; }):
        ['all'];

    // TBD convert state codes to state names
    iYears = iYears || [];

    let chunks = app.getPartitionCount();
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

  getDBInfo: async function (iType) {
    if (iType === 'getYears') {
      return this.metadata.years;
    }
    else if (iType === 'getStates') {
      return this.metadata.states;
    }
  }
};

export {DBconnect};
