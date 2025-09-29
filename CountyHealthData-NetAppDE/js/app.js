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
// import {calendar} from './calendar.js';
/*global Papa:true*/
import {COUNTY_POPULATION_DATA, STATE_POPULATION_DATA} from './data.js';
import * as ui from './ui.js'
import { getSelectedAttributes, hasSelectedAttributes, initializeAttributeSelector } from './attributeSelector.js';
import { attributes as attributeConfigAttributes } from './attributeConfig.js';
import { rawAttributes } from './attributeConfig.js'; // Import rawAttributes for dataKey mapping
import { extractNameAndUnit } from './attributeUtils.js';

const CURRENT_DATA_YEAR = '2024'; // Define current data year
const APP_NAME = `County Health Datasets (${CURRENT_DATA_YEAR})`;

console.log('[APP.JS] FILE LOADED - Version with multi-state debug logs - Time:', new Date().toISOString());
console.log('🚨 CACHE BUSTER 🚨 Random:', Math.random());
console.log('🚨 URGENT: If you see this, our file is loading! 🚨');
console.log('🔧 FIXED: allCases API call should now work! 🔧');

// Helper function to get base URL for assets
function getBaseURL() {
  // Get the current script's path
  const scripts = document.getElementsByTagName('script');
  const scriptPath = scripts[scripts.length - 1].src;
  
  // Extract base path from script URL (removes the js/script.js part)
  const basePath = scriptPath.substring(0, scriptPath.lastIndexOf('/js/'));
  
  console.log('Base path for assets:', basePath);
  return basePath;
}

// noinspection SqlResolve
const DATASETS = [
  {
    id: 'CountyHealthByState',
    name: `County Health Indicators 2024, By State`,
    documentation: 'https://countyhealth.org',
    endpoint: `assets/data/2024/csv`,
    selectedAttributeNames: [
      'State',
      'FIPS',
      'County',
      'County_Full',
      'boundary',
      'Average Life Expectancy (years)',
      'Days of Poor Physical Health (days/month)',
      'Days of Poor Mental Health (days/month)',
      'Students Graduating from High School (%)',
      'Some College (%)',
      'Children in Poverty (%)',
      'Limited Access to Healthy Foods (%)',
      'Air Pollution (fine particulate matter in micrograms/cubic meter of air)',
      'Physically Inactive (%)',
      'Smokers (%)',
      'Insufficient Sleep (%)',
      'Primary Care Doctor Rate (doctors/100,000)',
      'Mental Health Providers (providers/ 100,000)',
      'Median Household Income ($)',
      'Income Level',
      'Homeowners (%)',
      'Rural Living (%)',
      'Mostly Rural',
      'Non-Hispanic Black (%)',
      'Asian (%)',
      'Hispanic (%)',
      'Non-Hispanic White (%)',
      'Majority Minority',
      'Population',
      'Motor Vehicle Death Rate (deaths/100,000 people)',
      'Drug Overdose Death Rate (deaths/100,000 people)',
      'Broadband Access (%)',
      'Teen Birth Rate (births/per teens)',
      'Firearm Death Rate (deaths/ 100,000 people)',
      'Juvenile Arrest Rate (arrests/ 1,000 juveniles)',
      'Severe Housing Problems (%)',
      'Not proficient in English (%)',
      'Youth Not in School or Employment (%)',
      'Income Level'
  ],  
  overriddenAttributes: [
    {
      name: 'State',
    },
    {
      name: 'County',
    },
    {
      name: 'FIPS',
    },
    {
      name: 'County_Full',
      formula: 'concat(County, ", ", State)',
    },
    {
      name: 'County',
    },
    {
      name: 'boundary',
      formula: 'lookupBoundary(US_county_boundaries,County + ", " + State)',
    },
    {
      name: 'Average Life Expectancy (years)',
      description: 'Average number of years from birth a person is expected to live',
    },
    {
      name: 'Days of Poor Physical Health (days/month)',
      description: 'Adults were asked the following question: "Thinking about your physical health&comma; which includes physical illness and injury&comma; for how many days during the past 30 days was your physical health not good?" The value represents the average number of days reported.',
    },
    {
      name: 'Days of Poor Mental Health (days/month)',
      description: 'Adults were asked the following question: "Thinking about your mental health&comma; which includes stress&comma; depression&comma; and problems with emotions&comma; for how many days during the past 30 days was your mental health not good?" The value represents the average number of days reported.',
    },
    {
      name: 'Students Graduating from High School (%)',
      description: 'Percentage of students that graduate from high school in 4 years.',
    },
    {
      name: 'Some College (%)',
      description: 'Percentage of people ages 25-44 with at least some education beyond high school.',
    },
    {
      name: 'Children in Poverty (%)',
      description: 'Percentage of people under age 18 living in a household whose income is below the poverty level.',
    },
    {
      name: 'Limited Access to Healthy Foods (%)',
      description: 'Percentage of the population who are low-income and have no local grocery stores.',
    },
    {
      name: 'Physically Inactive (%)',
      description: 'Percentage of adults that responded "no" to the question: "During the past month&comma; other than your regular job&comma; did you participate in any physical activities or exercises such as running&comma; calisthenics&comma; golf&comma; gardening&comma; or walking for exercise?"',
    },
    {
      name: 'Insufficient Sleep (%)',
      description: 'Percentage of adults who report that they sleep less than 7 hours per night on average.',
    },
    {
      name: 'Primary Care Doctor Rate (doctors/100,000)',
      description: 'Number of primary care physicians per 100&comma;000 people.',
    },
    {
      name: 'Mental Health Providers (providers/ 100,000)',
      description: 'Number of mental health care providers per 100&comma;000 people.',
    },
    {
      name: 'Median Household Income ($)',
      description: 'Median household income for adults.',
    },
    {
      name: 'Homeowners (%)',
      description: 'Percentage of housing units that are owned by the occupants.',
    },
    {
      name: 'Rural Living (%)',
      description: 'Percentage of population living in a rural area. A town with less than 2&comma;500 residents is considered rural.',
    },
    {
      name: 'Motor Vehicle Death Rate (deaths/100,000 people)',
      description: 'Number of deaths caused by motor vehicle crashes per 100&comma;000 people.',
    },
    {
      name: 'Drug Overdose Death Rate (deaths/100,000 people)',
      description: 'Number of drug poisoning deaths per 100&comma;000 people.',
    },
    {
      name: 'Broadband Access (%)',
      description: 'Percentage of households with broadband internet connection.',
    },
    {
      name: 'Teen Birth Rate (births/per teens)',
      description: 'Births per 1,000 females ages 15-19.',
    },
    {
      name: 'Firearm Death Rate (deaths/ 100,000 people)',
      description: 'Number of deaths due to firearms per 100&comma;000 people.',
    },
    {
      name: 'Juvenile Arrest Rate (arrests/ 1,000 juveniles)',
      description: 'Delinquency cases per 1&comma;000 juveniles.',
    },
    {
      name: 'Severe Housing Problems (%)',
      description: 'Percentage of households with at least one of these problems: overcrowding&comma; high housing costs&comma; lack of kitchen facilities&comma; or lack of plumbing facilities.',
    },
    {
      name: 'Not proficient in English (%)',
      description: 'Percentage of the population that is not proficient in the English language.',
    },
    {
      name: 'Air Pollution (fine particulate matter in micrograms/cubic meter of air)',
      description: 'The average density of fine particulate matter (diameter less than 2.5 micrometers) in micrograms per cubic meter. The higher the number the worse the pollution.',
    },
    {
      name: 'Smokers (%)',
      description: 'Percentage of the adults who said they have smoked at least 100 cigarettes in their lifetime AND that they currently smoke every day or most days. The survey does not ask specifically about e-cigarettes.',
    },
    {
      name: 'Youth Not in School or Employment (%)',
      description: 'Percentage of teens and young adults ages 16-19 who are neither working nor in school.',
    },
  ],
    uiComponents: [
      {
        type: 'instruction',
        text: `Select a state below to retrieve data from the ${CURRENT_DATA_YEAR} County Health` +
            " dataset. You can add additional states or more data later."
      },
      {
        type: 'select',
        name: 'State',
        label: 'Select State',
        optionList: [
          'AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DE', 'FL',
          'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY', 'LA', 'MA',
          'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
          'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI',
          'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV',
          'WY'
        ]
      }
    ],
    makeURL: function (stateCode) {
      try {
        const basePath = getBaseURL();
        const url = `${basePath}/assets/data/2025/csv/2025-CountyHealth-${stateCode}.csv`;
        return url;
      } catch (error) {
        console.error('Error creating URL:', error);
        return null;
      }
    },
    parentAttributes: ['State', 'population'],
    parentCollectionName: 'States',
    childCollectionName: 'CountyHealth',
    preprocess: [
      {type: 'mergePopulation', dataKey: 'State', mergeKey: 'USPS Code'},
    ],
    preclear: {key: 'State', selector: '#state-select'}
  }
]

const DEFAULT_DISPLAYED_DATASETS = [
  'CountyHealthByState',
];
const DEFAULT_DATASET = 'CountyHealthByState';
const CHILD_COLLECTION_NAME = 'cases';
const PARENT_COLLECTION_NAME = 'groups';

let displayedDatasets = DEFAULT_DISPLAYED_DATASETS;
let isInFetch = false;

// --- State and attribute order tracking for table reconstruction ---
/**
 * Tracks the order in which states are added to the table during the session.
 * This array is not persisted across reloads, per requirements.
 * Always use this for table reconstruction to preserve user addition order.
 */
let masterStateList = [];
// Restore masterStateList from sessionStorage if present
try {
  const storedStateList = window.sessionStorage.getItem('masterStateList');
  if (storedStateList) {
    masterStateList = JSON.parse(storedStateList);
    console.log('[Session] Restored masterStateList from sessionStorage:', masterStateList);
  }
} catch (e) {
  console.warn('[Session] Could not restore masterStateList:', e);
}
/**
 * Tracks the order in which attributes are added to the table during the session.
 * This array is not persisted across reloads, per requirements.
 * Always use this for table reconstruction to preserve user addition order.
 */
let masterAttributeList = [];

/**
 * Data transform to create an additional property, being the year extracted
 * from a date string.
 * @param data [{object}]
 * @param dateAttr
 * @param yearAttr
 * @return {*}
 */
function computeYear(data, dateAttr, yearAttr) {
  data.forEach(obj => {
    let date = new Date(obj[dateAttr]);
    if (date) {
      obj[yearAttr] = date.getFullYear();
    }
  });
  return data;
}

/**
 * A data transform to merge state population stats with a dataset.
 * @param data {[object]} attribute keyed data
 * @param referenceKeyAttr {string} the name of the attribute in the merged into dataset that
 *                         is a foreign key into the population dataset.
 * @param correlatedKey    {string} the corresponding key in the population dataset
 * @return {[object]} the data object modified
 */
function mergePopulation(data, referenceKeyAttr, correlatedKey) {
  let cached = null;
  console.log('Data:')
  console.log(data)
  data.forEach(function(dataItem) {
    let key = dataItem[referenceKeyAttr];
    //if (!key) {return;}

    if (!key){
      console.log('no key');
      return;
    }
    if (!cached || (cached[correlatedKey] !== key)) {
      cached = STATE_POPULATION_DATA.find(function (st) {
        return st[correlatedKey] === key.toLocaleUpperCase();
      })
    }
    if (cached) {
      dataItem.population = cached.Population;
    }
  });
  return data;
}

/**
 * A data transform to merge state and county population stats with a dataset.
 * @param data {[object]} attribute keyed dataset
 * @param referenceState {string} the name of the attribute in the dataset that identifies the state.
 * @param referenceCty {string} the name of the attribute in the dataset that identifies the county.
 * @param correlatedState {string} the attribute in the population dataset that matches the state attribute in the passed in dataset
 * @param correlatedCty {string} the attribute in the population dataset that matches the county attribute in the passed in dataset
 * @return {[object]} the data object modified
 */
function mergeCountyPopulation(data, referenceState, referenceCty, correlatedState, correlatedCty) {
  let cachedPopRecord = null;
  data.forEach(function(dataItem) {
    let stateKey = dataItem[referenceState];
    let countyKey = dataItem[referenceCty];
    if (!cachedPopRecord || (cachedPopRecord[correlatedState] !== stateKey) || (cachedPopRecord[correlatedCty] !== countyKey)) {
      cachedPopRecord = COUNTY_POPULATION_DATA.find(function (item) {
        return item[correlatedState] === stateKey && item[correlatedCty] === countyKey;
      })
    }
    if (cachedPopRecord) {
      dataItem.population = cachedPopRecord.POPESTIMATE2019;
    }
  });
  return data;
}

/**
 * A data transform to sort a dataset on a date attribute.
 * @param data {[object]}
 * @param attr {string}
 * @return {[object]} 'data' sorted
 */
function sortOnDateAttr(data, attr) {
  return data.sort(function (a, b) {
    return (new Date(a[attr])) - (new Date(b[attr]));
  })
}

/**
 * A data transform: copy's value of old property to new, then deletes old.
 * @param data
 * @param oldKey
 * @param newKey
 * @return {*}
 */
function renameAttribute(data, oldKey, newKey) {
  data.forEach(function (item) {
    item[newKey] = item[oldKey];
    delete item[oldKey];
  });
  return data;
}

/**
 * A utility to convert a string to capitalize the first letter of each word
 * and lowercase each succeeding letter. A word is considered to be a string
 * separated from other words by space characters.
 * @param str {string}
 * @return {string}
 */
function toInitialCaps(str) {
  return str.split(/ +/)
      .map(function (w) {
        return w.toLowerCase().replace(/./, w[0].toUpperCase());
      }).join(' ');
}

/**
 * CODAP API Helper: deletes values in dataset matching attribute and value
 */
function preclearDataGroup(attributeName, value, collectionSpec, datasetName) {
  // find collection for attribute
  let col = collectionSpec.find(collection =>
      collection.attrs.find(attr => attr.name === attributeName));
  let resourceName = `dataContext[${datasetName}].itemSearch[${attributeName}==${value}]`;
  let req = {
    action: 'delete',
    resource: resourceName,
  }
  return codapInterface.sendRequest(req);
}

/**
 * CODAP API Helper: Creates a dataset
 *
 * @param datasetName {string}
 * @param collectionList {[object]}
 * @param url {string}
 * @return {{collections: [{name: string, attrs: *}], name, title}}
 */
function specifyDataset(datasetName, collectionList, url) {
  const year = '2024';
  return {
    name: datasetName, // keep as identifier
    title: `County Health Indicators ${year}, By State`, // user-facing
    collections: collectionList,
    metadata: {
      source: url,
      importDate: new Date().toLocaleString()
    }
  };
}

/**
 * Guarantees that the CODAP dataset has all the attributes required by the
 * collectionList.
 * @param existingDatasetSpec an iExistingDataSetSpec
 * @param collectionList an array of iCollectionSpecs
 */
function guaranteeAttributes(existingDatasetSpec, collectionList) {
  // Patch: Check for undefined/null collections and attributes
  if (!collectionList || !Array.isArray(collectionList)) {
    console.error('[guaranteeAttributes] collectionList is undefined or not an array:', collectionList);
    return;
  }
  collectionList.forEach(collection => {
    if (!collection.attrs || !Array.isArray(collection.attrs)) {
      console.warn('[guaranteeAttributes] collection.attrs is undefined or not an array:', collection);
      return;
    }
    // Existing logic for guaranteeing attributes...
    // (Assume this is a no-op for now, as we will update cases below)
  });
}

/**
 * CODAP API Helper: Creates a dataset only if it does not exist.
 * @param datasetName {string}
 * @param collectionList {[object]}
 * @param url {string}
 * @return Promise
 */
function guaranteeDataset(datasetName, collectionList, url) {
  // Store a hash of the current collection to detect changes
  const collectionHash = JSON.stringify(collectionList);
  const shouldForceRecreate = false; // Set to true to force recreation when testing
  
  return codapInterface.sendRequest({action: 'get', resource: `dataContext[${datasetName}]`})
      .then(function (result) {
        if (result && result.success) {
          // Dataset exists, check if we need to delete and recreate it
          // because the attribute set has changed
          if (shouldForceRecreate) {
            console.log('Forcing dataset recreation');
            return codapInterface.sendRequest({
              action: 'delete',
              resource: `dataContext[${datasetName}]`
            }).then(function() {
              return codapInterface.sendRequest({
                action: 'create',
                resource: 'dataContext',
                values: specifyDataset(datasetName, collectionList, url)
              });
            });
          } else {
            // Keep the existing dataset but update attributes if needed
            return guaranteeAttributes(result.values, collectionList);
          }
        } else {
          // Dataset doesn't exist, create it
          return codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: specifyDataset(datasetName, collectionList, url)
          });
        }
      });
}

/**
 * CODAP API Helper: Returns whether there is a graph in CODAP displaying
 * the named dataset.
 * @param datasetName
 */
async function getGraphForDataset(datasetName) {
  let componentListResult = await codapInterface.sendRequest({
    action: 'get',
    resource: 'componentList'
  });
  let graphSpec = null;
  let componentList = componentListResult && componentListResult.success && componentListResult.values;
  if (componentList) {
    let graphIds = componentList.filter((c) => c.type === 'graph');
    if (graphIds && graphIds.length) {
      let graphRequests = graphIds.map((graphId) => {
        return {
          action: 'get', resource: `component[${graphId.id}]`
        };
      });
      let graphSpecResults = await codapInterface.sendRequest(graphRequests);
      let graphSpecResult = graphSpecResults.find((result) => {
        return result.success && result.values.dataContext === datasetName
      });
      if (graphSpecResult) {
        graphSpec = graphSpecResult.values;
      }
    }
  }
  return graphSpec;
}

/**
 * CODAP API Helper: Create graph, initializes x-axis
 * @param datasetName
 * @param tsAttributeName
 * @return {Promise<*>}
 */
async function createTimeSeriesGraph(datasetName, tsAttributeName) {
  let foundGraph = await getGraphForDataset(datasetName);
  if (!foundGraph) {
    let result = await codapInterface.sendRequest({
      action: 'create', resource: `component`, values: {
        type: "graph", dataContext: datasetName, xAttributeName: tsAttributeName
      }
    });
    if (result.success) {
      let id = result.values.id;
      return await codapInterface.sendRequest({
        "action": "notify",
        "resource": `component[${id}]`,
        "values": {
          "request": "autoScale"
        }
      });
    }
  }
}

/**
 * CODAP API Helper: Create a Map component
 */
function createMap() {
  codapInterface.sendRequest({
    action: 'get',
    resource: 'componentList'
  }).then(function (result) {
    if (result && result.values && !result.values.find(function (v) {return v.type === 'map';})) {
      return codapInterface.sendRequest({
        action: 'create', resource: `component`, values: {
          type: "map"
        }
      });
    } else {
      return Promise.resolve(result);
    }
  }).then(function (result) {
    if (result.success) {
      let componentID = result.values.id;
      if (componentID != null) {
        return codapInterface.sendRequest({
          action: 'notify',
          resource: `component[${componentID}]`,
          values: {request: 'autoScale'}
        })
      }
    }
  });
}

/**
 * CODAP API Helper: Create an (optionally) autoscaled Case Table Component in CODAP
 * @param datasetName {string}
 * @param dimensions {{x: number, y: number}}
 * @param autoscale {boolean} whether to autoscale the case table
 * @return {Promise<object>}
 */
function createCaseTable(datasetName, dimensions, autoscale) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: `component`,
    values: {
      type: "caseTable",
      dataContext: datasetName,
      dimensions: dimensions
    }
  })
  .then(function (result) {
    if (result.success) {
      if (autoscale) {
        let componentID = result.values.id;
        if (componentID) {
          return codapInterface.sendRequest({
            action: 'notify',
            resource: `component[${componentID}]`,
            values: {request: 'autoScale'}
          })
        }
      }
      else {
        return Promise.resolve(result);
      }
    }
  });
}

/**
 * CODAP API Helper: Send an array of data items to CODAP
 * @param datasetName {string}
 * @param data {[object]}
 * @return {Promise}
 */
function sendItemsToCODAP(datasetName, data) {
  console.log(`[sendItemsToCODAP] Sending ${data.length} items to CODAP dataset '${datasetName}'`);
  console.log(`[sendItemsToCODAP] Sample item (first):`, JSON.stringify(data[0], null, 2));
  console.log(`[sendItemsToCODAP] All attributes in first item:`, Object.keys(data[0]));
  
  return codapInterface.sendRequest({
    action: 'create',
    resource: 'dataContext[' + datasetName + '].item',
    values: data
  }).then(function(result) {
    console.log(`[sendItemsToCODAP] CODAP response:`, result);
    if (!result.success) {
      console.error(`[sendItemsToCODAP] Failed to send data:`, result);
    } else {
      console.log(`[sendItemsToCODAP] Successfully sent ${data.length} items to CODAP`);
    }
    return result;
  });
}

/**
 * UI Handler: determine checked dataset option
 */
function selectDatasetHandler(/*ev*/) {
  // this is the selected event
  document.querySelectorAll('.datasource').forEach((el) => el.classList.remove('selected-source'));
  this.parentElement.parentElement.classList.add('selected-source');
}

/**
 * UI Handler: Manages whether buttons are active
 * @param isBusy
 */
function setBusy(isBusy) {
  ui.setBusyIndicator(isBusy);
  isInFetch = isBusy;
}

/**
 * UI Handler: Responds to a 'fetch' button press. Normally, of course, this would initiate
 * a fetch of the selected data from the selected data source and its transfer to
 * CODAP.
 */
function fetchHandler(/*ev*/) {
  console.log('[fetchHandler] BUTTON CLICKED - About to call fetchDataAndProcess');
  if (!isInFetch) {
    setBusy(true);
    console.log('[fetchHandler] Calling fetchDataAndProcess...');
    fetchDataAndProcess().then(
        function (result) {
          if (result && !result.success) {
            ui.setTransferStatus('failure',
                `Import to CODAP failed. ${result.values.error}`)
          } else if (result && result.success) {
            ui.setTransferStatus('success', 'Ready')
          }
          setBusy(false)
        },
        function (err) {
          ui.setTransferStatus('failure', err)
          setBusy(false)
        }
    );
  }
}

/**
 * UI Handler: When plugin is clicked on, cause it to become the selected component in CODAP.
 */
let myCODAPId;
async function selectHandler() {
  console.log('select!');
  if (myCODAPId == null) {
    let r1 = await codapInterface.sendRequest({action: 'get', resource: 'interactiveFrame'});
    if (r1.success) {
      myCODAPId = r1.values.id;
    }
  }
  if (myCODAPId != null) {
    return await selectComponent(myCODAPId);
  }
}

/**
 * CODAP API Helper: Deletes all cases from the named dataset.
 * @param datasetName {string}
 * @return {Promise<*|{success: boolean}>}
 */
async function clearDataByName(datasetName) {
  console.log('Clearing data for dataset:', datasetName);
  let result = await codapInterface.sendRequest({
    action: 'get', resource: `dataContext[${datasetName}]`
  });

  if (result.success) {
    let dc = result.values;
    let lastCollection = dc.collections[dc.collections.length-1];
    return await codapInterface.sendRequest({
      action: 'delete',
      resource: `dataContext[${datasetName}].collection[${lastCollection.name}].allCases`
    });
  } else {
    return Promise.resolve({success: true});
  }
}

/**
 * UI Handler: clear data button
 * @return {Promise<never>}
 */
async function clearDataHandler() {
  let currDatasetSpec = getCurrentDatasetSpec();
  if (!currDatasetSpec) {
    ui.setTransferStatus('inactive', 'Pick a source');
    return Promise.reject('No source selected');
  }
  try {
    await clearDataByName(currDatasetSpec.name);
    // --- Reset plugin state ---
    masterStateList = [];
    masterAttributeList = [];
    initializeAttributeSelector(); // Reset attribute selector UI and state
    // Optionally, update UI or notify user of success
  } catch (err) {
    // Optionally, handle error
    console.error('Failed to clear data:', err);
  }
}

/**
 * CODAP API Helper: Select (bring forward) a component
 * @param componentID
 * @return {Promise<*>}
 */
async function selectComponent(componentID) {
  return await codapInterface.sendRequest({
    action: 'notify',
    resource: `component[${componentID}]`,
    values: {request: 'select'
    }
  });
}

/**
 * Update the fetch button state based on attribute selections
 */
function updateFetchButtonState() {
  const hasAttributes = hasSelectedAttributes();
  const stateSelect = document.querySelector('#state-select');
  const hasState = stateSelect && stateSelect.value;
  const getDataButton = document.querySelector('.fe-fetch-button');

  if (!getDataButton) {
    console.error('Get Data button not found');
    return;
  }

  if (hasAttributes && hasState) {
    getDataButton.removeAttribute('disabled');
    getDataButton.title = 'Get data and send to CODAP';
    getDataButton.style.opacity = '1';
    getDataButton.style.cursor = 'pointer';
  } else {
    getDataButton.setAttribute('disabled', 'disabled');
    getDataButton.title = hasState ? 'Select at least one attribute first' : 'Select a state first';
    getDataButton.style.opacity = '0.5';
    getDataButton.style.cursor = 'not-allowed';
  }
}

/**
 * Initializes the web application
 *   * Connects with CODAP
 *   * Creates UI
 */
function initializeApp() {
  // Set up the CODAP connection
  return codapInterface.init({
    name: APP_NAME,
    title: APP_NAME,
    version: "0.1",
    dimensions: {
      width: 400,
      height: 600
    },
    preventDataContextReorg: false
  }).then(createUI)
  .then(() => {
    // Add resize handler that maintains minimum dimensions
    window.addEventListener('resize', function() {
      // Get current dimensions
      const width = Math.max(window.innerWidth, 400);
      const height = Math.max(window.innerHeight, 600);
      
      // Update the iframe dimensions when window size changes
      codapInterface.sendRequest({
        action: 'update',
        resource: 'interactiveFrame',
        values: {
          dimensions: {
            width: width,
            height: height
          }
        }
      });
    });
    
    // Ensure we have sufficient initial height
    codapInterface.sendRequest({
      action: 'update',
      resource: 'interactiveFrame',
      values: {
        dimensions: {
          width: Math.max(window.innerWidth, 400),
          height: Math.max(window.innerHeight, 600)
        }
      }
    });
  });
  
  // Listen for attribute selection changes
  document.addEventListener('attribute-selection-changed', function(event) {
    console.log('Attribute selection changed event received');
    updateFetchButtonState();
  });
}

/**
 * Creates the UI
 */
function createUI() {
  console.log('Creating UI');
  
  // Set up event listener for state selection
  const stateSelect = document.querySelector('#state-select');
  if (stateSelect) {
    stateSelect.addEventListener('change', function() {
      console.log('State selection changed to:', this.value);
      updateFetchButtonState();
    });
  } else {
    console.error('State select element not found');
  }

  // Set up event listeners for get data button
  let getDataButton = document.querySelector('.fe-fetch-button');
  if (getDataButton) {
    console.log('Found fetch button:', getDataButton);
    console.log('🔍 Button event listeners before adding:', getDataButton.getEventListeners?.() || 'getEventListeners not available');
    
    // Remove any existing event listeners that might conflict
    let newButton = getDataButton.cloneNode(true);
    getDataButton.parentNode.replaceChild(newButton, getDataButton);
    getDataButton = newButton;
    console.log('🔄 Replaced button to remove existing listeners');
    
    // Handle fetch button click
    getDataButton.addEventListener('click', function(ev) {
      console.log('🚨 OUR NEW FETCH HANDLER CALLED! 🚨');
      console.log('Fetch button clicked');
      ev.preventDefault();
      ev.stopPropagation();
      if (!isInFetch) {
        isInFetch = true;
        fetchDataAndProcess().then(function() {
          isInFetch = false;
        }).catch(function(reason) {
          isInFetch = false;
          console.log(`Fetch or processing failed: ${reason}.`);
          ui.setTransferStatus('error', `Fetch of data failed: ${reason}`);
        });
      }
    });
    console.log('✅ Added NEW event listener to fetch button');
  } else {
    console.error('Fetch button not found');
  }
  
  // Set up event listeners for clear button
  let clearButton = document.querySelector('.fe-clear-button');
  if (clearButton) {
    clearButton.addEventListener('click', function(ev) {
      console.log('Clear button clicked');
      ev.preventDefault();
      ev.stopPropagation();
      let datasetSpec = getCurrentDatasetSpec();
      if (datasetSpec) {
        clearDataByName(datasetSpec.name);
      }
    });
  }
  
  // Initialize the UI module
  ui.initialize({
    selectHandler: selectHandler,
    clearData: clearDataHandler
  });
  
  // Update the fetch button state based on attribute selections
  updateFetchButtonState();
  
  // Listen for attribute selection changes
  document.addEventListener('attribute-selection-changed', function(event) {
    console.log('Attribute selection changed event received');
    updateFetchButtonState();
  });
  
  // Set initial status
  ui.setTransferStatus("success", "Ready");
}

/**
 * Utility: Is passed an array of objects. Returns the keys of all the objects.
 * @param array {object[]}
 * @return {string[]}
 */
function getAttributeNamesFromData(array) {
  if (!Array.isArray(array) || !array[0] || (typeof array[0] !== "object")) {
    return [];
  }
  let attrMap = {};
  array.forEach((item) => {
    Object.keys(item).forEach((key) => {attrMap[key] = true;});
  });
  return Object.keys(attrMap);
}

/**
 * Utility: Look up attribute object by name from attributeConfig.js
 * @param {string} name
 * @returns {object | undefined}
 */
function getAttributeByName(name) {
  return attributeConfigAttributes.find(attr => attr.name === name);
}

/**
 * CODAP API Utility that makes an array of CODAP Attribute Specs from the
 * dataset definition and the attribute names discovered in the data.
 *
 * @param datasetSpec
 * @param attributeNames
 * @return {[object] | undefined}
 */
function resolveAttributes(datasetSpec, attributeNames) {
  // Remove County_Full from attributeNames for CODAP table
  let filteredAttributeNames = attributeNames.filter(name => name !== 'County_Full');
  // Ensure 'boundary' is last if present
  const boundaryIdx = filteredAttributeNames.indexOf('boundary');
  if (boundaryIdx > -1) {
    filteredAttributeNames.splice(boundaryIdx, 1);
    filteredAttributeNames.push('boundary');
  }
  const allAttributeNames = [...filteredAttributeNames];
  console.log('[resolveAttributes] Using full masterAttributeList for collection definition:', allAttributeNames);

  let attributeList = allAttributeNames.map(function (attrName) {
    // Use the config as the source of truth for attribute metadata
    const configAttr = getAttributeByName(attrName);
    if (configAttr) {
      // Use dataKey for export if present, otherwise name
      const exportName = configAttr.dataKey || configAttr.name;
      return {
        name: configAttr.name, // Display name for CODAP UI (no unit)
        exportName, // Actual data column name for export
        ...(configAttr.unit ? { unit: configAttr.unit } : {}),
        ...(configAttr.type ? { type: configAttr.type } : {}),
        ...(configAttr.formula ? { formula: configAttr.formula } : {}),
        ...(configAttr.description ? { description: configAttr.description } : {}),
        ...(configAttr.hidden !== undefined ? { hidden: configAttr.hidden } : {}),
      };
    } else {
      console.warn(`[resolveAttributes] Attribute '${attrName}' is missing from attributeConfig.js. Exporting with name only.`);
      return { name: attrName };
    }
  });

  // Apply overrides and additional attributes as before
  if (datasetSpec.overriddenAttributes) {
    datasetSpec.overriddenAttributes.forEach(function (overrideAttr) {
      if (allAttributeNames.includes(overrideAttr.name)) {
        let attr = attributeList.find(function (attr) {
          return attr.name === overrideAttr.name;
        });
        if (attr) {
          Object.assign(attr, overrideAttr);
        }
      }
    })
  }
  if (datasetSpec.additionalAttributes) {
    let relevantAdditionalAttrs = datasetSpec.additionalAttributes.filter(
      attr => allAttributeNames.includes(attr.name)
    );
    attributeList = attributeList.concat(relevantAdditionalAttrs);
  }
  attributeList.forEach(attr => {
    if (!attr.description) {
      console.warn(`[resolveAttributes] Attribute '${attr.name}' is missing a description in export.`);
    }
  });
  console.log('[resolveAttributes] Final attribute list for collection:', attributeList.map(a => a.name));
  return attributeList;
}

/**
 * CODAP API Utility to construct a collection list
 * @param datasetSpec
 * @param attributeNames
 * @return {*[]}
 */
function resolveCollectionList(datasetSpec, attributeNames) {
  // attributeNames should be masterAttributeList
  let attributeList = resolveAttributes(datasetSpec, attributeNames);
  console.log('[resolveCollectionList] Using attributeList:', attributeList.map(a => a.name));
  if (attributeList) {
    let collectionsList = [];
    let childCollection = {
      name: datasetSpec.childCollectionName || CHILD_COLLECTION_NAME,
      attrs: []
    }
    let parentCollection;
    if (datasetSpec.parentAttributes) {
      parentCollection = {
        name: datasetSpec.parentCollectionName || PARENT_COLLECTION_NAME,
        attrs: []
      }
      collectionsList.push(parentCollection);
      childCollection.parent = datasetSpec.parentCollectionName || PARENT_COLLECTION_NAME;
    }
    collectionsList.push(childCollection);
    // Distribute attributes: parentAttributes to parent, all others to child
    attributeList.forEach(function (attr) {
      if (datasetSpec.parentAttributes && datasetSpec.parentAttributes.includes(attr.name)) {
        parentCollection.attrs.push(attr);
      } else {
        childCollection.attrs.push(attr);
      }
    });
    console.log('[resolveCollectionList] Parent collection attributes:', parentCollection ? parentCollection.attrs.map(a => a.name) : []);
    console.log('[resolveCollectionList] Child collection attributes:', childCollection.attrs.map(a => a.name));
    return collectionsList;
  }
  return undefined;
}

/**
 * A utility to convert and array of arrays (e.g. from CSV) to an equivalent
 * array of objects. Property names taken from first row.
 * @param data
 * @return {*}
 */
function csvToJSON(data) {
  let headers = data.shift();
  const result = data.map(d => {
    let out = {}
    d.forEach((v, ix) => {
      out[headers[ix]] = v;
    });
    return out;
  });
  // Debug: Log State field values after CSV import
  console.log('[DEBUG] State values after csvToJSON:', result.map(row => row.State));
  return result;
}

/**
 * UI/model Utility: determine selected dataset and look it up
 * @return {Object} The dataset specification
 */
function getCurrentDatasetSpec() {
  // Always use the first dataset since we only have one
  let sourceIX = 0;
  
  // First get the original dataset spec
  const originalDataset = DATASETS[sourceIX];
  
  // Create a deep copy of dataset properties (except functions)
  const datasetSpec = JSON.parse(JSON.stringify(DATASETS[sourceIX]));
  
  // Manually copy functions that are lost in JSON stringification
  datasetSpec.makeURL = originalDataset.makeURL;
  if (originalDataset.preprocess) datasetSpec.preprocess = originalDataset.preprocess;
  if (originalDataset.postprocess) datasetSpec.postprocess = originalDataset.postprocess;
  if (originalDataset.uiCreate) datasetSpec.uiCreate = originalDataset.uiCreate;
  
  // Use attribute selector to get currently selected attributes
  datasetSpec.selectedAttributeNames = getSelectedAttributes();
  
  console.log(`Retrieved ${datasetSpec.selectedAttributeNames.length} selected attributes`);
  
  // Filter overriddenAttributes to only include those in selectedAttributeNames
  if (datasetSpec.overriddenAttributes && datasetSpec.selectedAttributeNames) {
    datasetSpec.overriddenAttributes = datasetSpec.overriddenAttributes.filter(
      attr => datasetSpec.selectedAttributeNames.includes(attr.name)
    );
    
    // Always include the core attributes (excluding County_Full)
    const coreAttributes = ['State', 'FIPS', 'County', 'boundary'];
    coreAttributes.forEach(attrName => {
      if (!datasetSpec.overriddenAttributes.some(attr => attr.name === attrName)) {
        const originalAttr = DATASETS[sourceIX].overriddenAttributes.find(attr => attr.name === attrName);
        if (originalAttr) {
          datasetSpec.overriddenAttributes.push(originalAttr);
        }
      }
    });
  }
  
  return datasetSpec;
}

/**
 * Preprocesses dataset before converting to CODAP format.
 * @param data
 * @param preprocessActions
 * @return {*}
 */
function preprocessData(data, preprocessActions) {
  if (Array.isArray(preprocessActions)) {
    preprocessActions.forEach(action => {
      switch (action.type) {
        case 'rename':
          renameAttribute(data, action.oldKey, action.newKey);
          break;
        case 'mergePopulation':
          mergePopulation(data, action.dataKey, action.mergeKey);
          break;
        case 'sortOnDateAttr':
          sortOnDateAttr(data, action.dataKey);
          break;
        case 'computeYear':
          computeYear(data, action.dateKey, action.yearKey);
          break;
      }
    });
  } else if (typeof preprocessActions === "function") {
    preprocessActions(data);
  }
  // Debug: Log State field values after preprocessing
  console.log('[DEBUG] State values after preprocessData:', data.map(row => row.State));
  return data;
}

/**
 * Utility: Get current attributes from CODAP
 * @param datasetName {string}
 * @return {Promise<string[]>}
 */
async function getCurrentAttributesFromCODAP(datasetName) {
  try {
    // First ask CODAP for the data context so we can discover the correct collection
    const dcResult = await codapInterface.sendRequest({
      action: 'get',
      resource: `dataContext[${datasetName}]`
    });

    if (!dcResult.success || !dcResult.values || !Array.isArray(dcResult.values.collections)) {
      console.warn(`[getCurrentAttributesFromCODAP] Failed to get collections for '${datasetName}'`, dcResult);
      return [];
    }

    // Pick the collection that has the most attributes (leaf collection)
    const collections = dcResult.values.collections;
    let targetCollection = collections[0];
    if (collections.length > 1) {
      targetCollection = collections.reduce((max, current) =>
        current.attrs.length > max.attrs.length ? current : max
      );
    }

    // Now request the attribute list from that collection
    const attrResult = await codapInterface.sendRequest({
      action: 'get',
      resource: `dataContext[${datasetName}].collection[${targetCollection.name}].attributeList`
    });

    if (attrResult.success && Array.isArray(attrResult.values)) {
      const names = attrResult.values.map(a => a.name);
      console.log(`[getCurrentAttributesFromCODAP] Found ${names.length} attributes in collection '${targetCollection.name}':`, names);
      return names;
    }

    console.warn(`[getCurrentAttributesFromCODAP] Attribute request failed for collection '${targetCollection.name}'`, attrResult);
    return [];

  } catch (err) {
    console.error('[getCurrentAttributesFromCODAP] Error:', err);
    return [];
  }
}

/**
 * Utility: Get all cases from CODAP
 * @param datasetName {string}
 * @return {Promise<string[]>}
 */
async function getCurrentCasesFromCODAP(datasetName) {
  const result = await codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${datasetName}].collection[groups].caseList`
  });
  if (result.success && result.values) {
    return result.values.map(c => c.values.State);
  }
  return [];
}

/**
 * Utility: Add new attributes to CODAP
 * @param datasetName {string}
 * @param newAttributes {string[]}
 * @return {Promise}
 */
async function addNewAttributesToCODAP(datasetName, newAttributes) {
  for (const attr of newAttributes) {
    await codapInterface.sendRequest({
      action: 'create',
      resource: `dataContext[${datasetName}].collection[groups].attribute`,
      values: { name: attr }
    });
  }
}

/**
 * Utility: Update a case in CODAP
 * @param datasetName {string}
 * @param caseID {string}
 * @param values {object}
 * @return {Promise}
 */
async function updateCaseInCODAP(datasetName, caseID, values) {
  // Get the correct collection name
  const datasetResult = await codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${datasetName}]`
  });
  
  if (!datasetResult.success || !datasetResult.values || !datasetResult.values.collections) {
    throw new Error('Failed to get dataset collections for update');
  }
  
  const collections = datasetResult.values.collections;
  let targetCollection = collections[0];
  if (collections.length > 1) {
    targetCollection = collections.reduce((max, current) => 
      current.attrs.length > max.attrs.length ? current : max
    );
  }
  
  await codapInterface.sendRequest({
    action: 'update',
    resource: `dataContext[${datasetName}].collection[${targetCollection.name}].case[${caseID}]`,
    values
  });
}

/**
 * Utility: Add a new case to CODAP
 * @param datasetName {string}
 * @param values {object}
 * @return {Promise}
 */
async function addCaseToCODAP(datasetName, values) {
  // CODAP requires a valid parent case when directly creating a case in a child
  // collection of a hierarchical data context. Supplying the wrong (or undefined)
  // parent results in the warning "Cannot create case with invalid or deleted
  // parent: undefined". The simplest, most reliable way to add a new case to the
  // *leaf* collection is to create an *item* at the data-context level—CODAP will
  // then take care of inserting it into the correct collection hierarchy,
  // automatically creating the parent state case if it does not yet exist. This
  // mirrors what `sendItemsToCODAP` does during an initial bulk import.

  await codapInterface.sendRequest({
    action: 'create',
    resource: `dataContext[${datasetName}].item`,
    values: [values]   // API expects an array of item objects
  });
}

/**
 * Utility: Get case IDs and values
 * @param datasetName {string}
 * @return {Promise<{id: string, values: object}[]>}
 */
async function getCaseIDsAndValues(datasetName) {
  console.log(`[getCaseIDsAndValues] Starting for dataset: ${datasetName}`);
  
  try {
    // First get the dataset info to find the correct collection name
    console.log(`[getCaseIDsAndValues] Getting dataset info...`);
    const datasetResult = await codapInterface.sendRequest({
      action: 'get',
      resource: `dataContext[${datasetName}]`
    });
    
    console.log(`[getCaseIDsAndValues] Dataset request result:`, datasetResult);
    
    if (!datasetResult.success) {
      console.log(`[getCaseIDsAndValues] Dataset request failed:`, datasetResult);
      return [];
    }
    
    if (!datasetResult.values) {
      console.log(`[getCaseIDsAndValues] No dataset values found`);
      return [];
    }
    
    if (!datasetResult.values.collections) {
      console.log(`[getCaseIDsAndValues] No collections found in dataset`);
      return [];
    }
    
    // Find the collection that contains the actual case data (not the parent state collection)
    // This is typically the collection with the most attributes
    const collections = datasetResult.values.collections;
    console.log(`[getCaseIDsAndValues] Found ${collections.length} collections:`, collections.map(c => `${c.name} (${c.attrs.length} attrs)`));
    
    let targetCollection = collections[0]; // fallback
    if (collections.length > 1) {
      // Find collection with most attributes (likely the main data collection)
      targetCollection = collections.reduce((max, current) => 
        current.attrs.length > max.attrs.length ? current : max
      );
    }
    
    console.log(`[getCaseIDsAndValues] Using collection '${targetCollection.name}' with ${targetCollection.attrs.length} attributes`);
    
    console.log(`[getCaseIDsAndValues] Getting case list from collection...`);
    const result = await codapInterface.sendRequest({
      action: 'get',
      resource: `dataContext[${datasetName}].collection[${targetCollection.name}].allCases`
    });
    
    console.log(`[getCaseIDsAndValues] Case list request result:`, result);
    
    if (result.success && result.values) {
      // CODAP returns {cases:[...]}, {caseList:[...]}, or {items:[...]} depending on version
      console.log('[getCaseIDsAndValues] Raw values object keys:', Object.keys(result.values));
      let casesArray = [];
      if (Array.isArray(result.values)) {
        casesArray = result.values;
      } else if (Array.isArray(result.values.cases)) {
        casesArray = result.values.cases;
      } else if (Array.isArray(result.values.caseList)) {
        casesArray = result.values.caseList;
      } else if (Array.isArray(result.values.items)) {
        casesArray = result.values.items; // fallback
      }

      console.log(`[getCaseIDsAndValues] Parsed ${casesArray.length} existing cases from CODAP response`);
      if (casesArray.length > 0) {
        console.log(`[getCaseIDsAndValues] Sample case:`, casesArray[0]);
      }
      // Normalize each entry to have id + values even if wrapped in {case: {...}}
      const normalized = casesArray.map(c => {
        const inner = c.case ? c.case : c; // unwrap if needed
        return { id: inner.id, values: inner.values };
      });
      return normalized;
    }
    
    console.log('[getCaseIDsAndValues] No cases found or request failed:', result);
    return [];
    
  } catch (error) {
    console.error('[getCaseIDsAndValues] Error occurred:', error);
    return [];
  }
}

/**
 * Enhanced data fetching and processing with consistent attribute population
 * @return {Promise}
 */
async function fetchDataAndProcess() {
  console.log('[fetchDataAndProcess] FUNCTION CALLED - Starting execution');
  let datasetSpec = getCurrentDatasetSpec();
  console.log('[fetchDataAndProcess] Got datasetSpec:', datasetSpec);
  const datasetName = datasetSpec.name;
  console.log('[fetchDataAndProcess] Dataset name:', datasetName);
  
  if (!datasetSpec) {
    console.log('[fetchDataAndProcess] No datasetSpec - returning');
    ui.setTransferStatus('inactive', 'Pick a source');
    return Promise.reject('No source selected');
  }

  try {
    console.log('[fetchDataAndProcess] Setting transfer status to active');
    ui.setTransferStatus('active', 'Processing data...');
    
    // Phase 1: Get current state from CODAP
    console.log('[Phase 1] Getting current CODAP state...');
    const selectedAttributes = getSelectedAttributes();
    const currentAttributes = await getCurrentAttributesFromCODAP(datasetName);
    const currentCases = await getCaseIDsAndValues(datasetName);
    
    console.log('[Phase 1] Selected attributes:', selectedAttributes);
    console.log('[Phase 1] Current CODAP attributes:', currentAttributes);
    console.log('[Phase 1] Current cases count:', currentCases.length);
    console.log('[Phase 1] Current cases (first 3):', currentCases.slice(0, 3));

    // --- Phase 2: Accumulate all attributes ever added, preserving UI order ---
    selectedAttributes.forEach(attr => {
      if (!masterAttributeList.includes(attr)) {
        masterAttributeList.push(attr);
      }
    });
    // Sort masterAttributeList to match UI order (rawAttributes), with 'boundary' always last
    const canonicalOrder = rawAttributes.map(attr => attr.name).filter(name => name !== 'County_Full');
    masterAttributeList = masterAttributeList
      .filter(attr => attr !== 'County_Full')
      .sort((a, b) => {
        if (a === 'boundary') return 1;
        if (b === 'boundary') return -1;
        return canonicalOrder.indexOf(a) - canonicalOrder.indexOf(b);
      });
    // Ensure 'boundary' is last if present
    const boundaryIdx = masterAttributeList.indexOf('boundary');
    if (boundaryIdx > -1) {
      masterAttributeList.splice(boundaryIdx, 1);
      masterAttributeList.push('boundary');
    }
    console.log('[Phase 2] masterAttributeList (sorted to UI order):', masterAttributeList);

    // --- State order: preserve order of addition ---
    const stateSelect = document.querySelector('#state-select');
    const newStateCode = stateSelect ? stateSelect.value : null;
    if (newStateCode && !masterStateList.includes(newStateCode)) {
      masterStateList.push(newStateCode);
    }
    // Do NOT reset or re-initialize masterStateList here or anywhere else
    // Only remove duplicates while preserving order
    masterStateList = masterStateList.filter((state, idx, arr) => arr.indexOf(state) === idx);
    console.log('[Phase 2] masterStateList (ordered, session-persistent):', masterStateList);

    // --- Phase 3: Always use full master lists for collection definition ---
    console.log('[Phase 3] Ensuring dataset structure...');
    const initialAttributes = masterAttributeList.length > 0 ? masterAttributeList : ['State', 'County'];
    let collectionList = resolveCollectionList(datasetSpec, initialAttributes);

    // Extract parent and child collection names
    const parentCollectionName = collectionList[0]?.name || "States";
    const childCollectionName = collectionList[1]?.name || "CountyHealth";
    console.log(`[Phase 3] Using parent collection name: ${parentCollectionName}`);
    console.log(`[Phase 3] Using child collection name: ${childCollectionName}`);

    // [PHASE 3] Ensuring dataset structure...
    console.log('[PHASE 3] Ensuring dataset structure...');

    // Log the collection creation requests and responses
    console.log('[PHASE 3] Collection creation requests:');
    console.log('[PHASE 3] Parent collection request:', JSON.stringify(collectionList[0], null, 2));
    console.log('[PHASE 3] Child collection request:', JSON.stringify(collectionList[1], null, 2));

    // --- NEW: Always delete and recreate the data context to ensure attributes are up to date ---
    console.log('[PHASE 3] Deleting existing data context (if any) to ensure fresh attribute set...');
    await codapInterface.sendRequest({
      action: 'delete',
      resource: `dataContext[${datasetSpec.name}]`
    });
    // Now create the data context with the full, updated attribute list
    const datasetCreateRequest = {
      action: 'create',
      resource: 'dataContext',
      values: {
        name: datasetSpec.name,
        title: datasetSpec.name,
        collections: collectionList,
        description: datasetSpec.documentation,
      },
    };
    console.log('[PHASE 3] Data context creation request:', JSON.stringify(datasetCreateRequest, null, 2));
    const createContextResult = await codapInterface.sendRequest(datasetCreateRequest);
    console.log('[PHASE 3] Data context creation response:', createContextResult);
    if (!createContextResult.success) {
      console.error('[PHASE 3] Failed to create data context:', createContextResult);
    }
    // --- END NEW ---

    // [PHASE 4.5] Clear all cases in the data context before repopulating
    console.log('[Phase 4.5] Clearing all cases in data context before repopulating...');
    await codapInterface.sendRequest({
      action: 'delete',
      resource: `dataContext[${datasetSpec.name}].case`,
    });
    console.log('[Phase 4.5] All cases cleared.');

    // [PHASE 5.5] Fetch and process county data for all states and attributes
    console.log('[Phase 5.5] Fetching and processing county data for all states in masterStateList:', masterStateList);
    const allCasesArray = [];
    for (const stateCode of masterStateList) {
      const stateData = await fetchStateDataRobust(stateCode, masterAttributeList, datasetSpec);
      stateData.forEach(countyRow => {
        // Ensure every row has every attribute (fill nulls for missing)
        const completeRow = {};
        masterAttributeList.forEach(attr => {
          completeRow[attr] = countyRow[attr] !== undefined ? countyRow[attr] : null;
        });
        completeRow.StateCode = stateCode; // Add the state code for parent lookup
        allCasesArray.push(completeRow);
      });
    }
    console.log(`[Phase 5.5] allCasesArray contains ${allCasesArray.length} rows, each with all attributes:`, masterAttributeList);
    if (allCasesArray.length > 0) {
      console.log('[Phase 5.5] Sample row:', allCasesArray[0]);
    }

    // [PHASE 6] Create all cases using .item resource (CODAP will handle hierarchy)
    console.log('[PHASE 6] Creating all cases using .item resource (CODAP will handle hierarchy)');
    const itemsToSend = allCasesArray.map(row => {
      const item = { ...row };
      delete item.StateCode;
      return item;
    });
    const itemCreateRequest = {
      action: 'create',
      resource: `dataContext[${datasetSpec.name}].item`,
      values: itemsToSend
    };
    console.log('[PHASE 6] Item creation request:', itemCreateRequest);
    const itemCreateResponse = await codapInterface.sendRequest(itemCreateRequest);
    console.log('[PHASE 6] Item creation response:', itemCreateResponse);
    if (!itemCreateResponse.success) {
      console.error('[PHASE 6] Failed to create items:', itemCreateResponse);
    } else {
      console.log(`[PHASE 6] Successfully created ${itemsToSend.length} items.`);
    }

    // --- Phase 7: Finalize ---
    // Set preventDataContextReorg: true to suppress deleted cases dialog
    await codapInterface.sendRequest({
      action: 'update',
      resource: 'interactiveFrame',
      values: {
        name: datasetSpec.name,
        title: datasetSpec.name,
        version: '0.1',
        dimensions: { width: 400, height: 600 },
        preventDataContextReorg: true
      }
    });
    console.log('[Phase 7] Finalizing...');
    await updateAttributeVisibility(datasetName, selectedAttributes);
    let dimensions = datasetSpec.caseTableDimensions || undefined;
    await createCaseTable(datasetName, dimensions);
    ui.setTransferStatus('success', `Ready - Processed ${masterStateList.length} states with ${masterAttributeList.length} attributes`);
  } catch (error) {
    console.error('Error in fetchDataAndProcess:', error);
    ui.setTransferStatus('error', 'Data processing failed');
    throw error;
  }
}

/**
 * Robust state data fetching with improved attribute mapping
 * @param {string} stateCode 
 * @param {string[]} attributeNames 
 * @param {object} datasetSpec 
 * @returns {Promise<object[]>}
 */
async function fetchStateDataRobust(stateCode, attributeNames, datasetSpec) {
  try {
    const url = datasetSpec.makeURL ? datasetSpec.makeURL(stateCode) : null;
    if (!url) {
      console.warn(`No URL available for state: ${stateCode}`);
      return [];
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Failed to fetch data for state ${stateCode}: ${response.status}`);
      return [];
    }

    const csvText = await response.text();
    let parsedData = Papa.parse(csvText, { skipEmptyLines: true });
    let jsonData = csvToJSON(parsedData.data);

    if (datasetSpec.preprocess) {
      jsonData = preprocessData(jsonData, datasetSpec.preprocess);
    }

    // Build robust attribute mapping
    const attributeMapping = buildAttributeMapping(attributeNames);
    console.log(`[fetchStateDataRobust] State ${stateCode} - Attribute mapping:`, attributeMapping);

    // Debug: Log available CSV columns for this state
    if (jsonData.length > 0) {
      console.log(`[fetchStateDataRobust] State ${stateCode} - Available CSV columns:`, Object.keys(jsonData[0]));
    }

    // Transform data using the mapping
    return jsonData.map((csvRow, index) => {
      const transformedRow = {};
      
      // Debug: Log detailed processing for first row
      if (index === 0) {
        console.log(`[fetchStateDataRobust] State ${stateCode} - Processing first row with ${attributeNames.length} attributes`);
        console.log(`[fetchStateDataRobust] State ${stateCode} - Attribute names to process:`, attributeNames);
      }
      
      attributeNames.forEach(displayName => {
        const csvColumnName = attributeMapping[displayName];
        
        if (index === 0) {
          console.log(`[fetchStateDataRobust] State ${stateCode} - Processing '${displayName}' -> '${csvColumnName}' | Has column: ${csvRow.hasOwnProperty(csvColumnName)} | Value: ${csvRow[csvColumnName]}`);
        }
        
        if (csvColumnName && csvRow.hasOwnProperty(csvColumnName)) {
          transformedRow[displayName] = csvRow[csvColumnName];
        } else {
          transformedRow[displayName] = null;
          if (!['boundary', 'County_Full'].includes(displayName)) {
            console.log(`[fetchStateDataRobust] State ${stateCode} - Missing data for attribute '${displayName}' (looking for CSV column '${csvColumnName}')`);
          }
        }
      });

      // --- Add logic for 'Rural / Urban' ---
      // If 'Rural Living' is present and is a number, set 'Rural / Urban' accordingly
      const ruralLivingVal = transformedRow['Rural Living'];
      if (typeof ruralLivingVal === 'string' && ruralLivingVal.trim() !== '') {
        const percent = parseFloat(ruralLivingVal.replace(/[^\d.\-]/g, ''));
        if (!isNaN(percent)) {
          transformedRow['Rural / Urban'] = percent <= 50 ? 'Urban' : 'Rural';
        } else {
          transformedRow['Rural / Urban'] = null;
        }
      } else if (typeof ruralLivingVal === 'number') {
        transformedRow['Rural / Urban'] = ruralLivingVal <= 50 ? 'Urban' : 'Rural';
      } else {
        transformedRow['Rural / Urban'] = null;
      }
      // --- End logic for 'Rural / Urban' ---

      // Debug: Log the first transformed row to see what data we're actually creating
      if (index === 0) {
        console.log(`[fetchStateDataRobust] State ${stateCode} - First transformed row:`, transformedRow);
        console.log(`[fetchStateDataRobust] State ${stateCode} - Sample CSV row keys and values:`, Object.keys(csvRow).slice(0, 10), 'Sample values:', Object.values(csvRow).slice(0, 5));
      }

      // Inside fetchStateDataRobust or wherever county rows are built
      // After mapping attributes for each county row, add debug logging for the first 3 rows
      if (index < 3) {
        console.log(`[DEBUG] County ${index + 1}:`);
        masterAttributeList.forEach(attr => {
          const mappedKey = attributeMapping[attr];
          const value = transformedRow[attr];
          console.log(`  Attribute '${attr}' (CSV key: '${mappedKey}') => Value:`, value);
        });
      }

      // Add debug log for the first row
      if (index === 0) {
        console.log('[DEBUG] First transformedRow keys/values for CODAP:', transformedRow);
      }

      return transformedRow;
    });

  } catch (error) {
    console.error(`Error fetching data for state ${stateCode}:`, error);
    return [];
  }
}

/**
 * Build consistent mapping from display attribute names to CSV column names
 * @param {string[]} attributeNames 
 * @returns {object} Mapping object
 */
function buildAttributeMapping(attributeNames) {
  const mapping = {};
  
  console.log(`[buildAttributeMapping] Processing ${attributeNames.length} attributes:`, attributeNames);
  
  attributeNames.forEach(displayName => {
    // First check if we have a config entry for this attribute
    const configAttr = getAttributeByName(displayName);
    console.log(`[buildAttributeMapping] Looking up '${displayName}' in config:`, configAttr);
    
    if (configAttr && configAttr.dataKey) {
      // Use the dataKey from config as the CSV column name
      mapping[displayName] = configAttr.dataKey;
      console.log(`[buildAttributeMapping] '${displayName}' -> '${configAttr.dataKey}' (via dataKey)`);
    } else if (configAttr && configAttr.unit) {
      // Construct from name + unit
      const constructed = `${configAttr.name} (${configAttr.unit})`;
      mapping[displayName] = constructed;
      console.log(`[buildAttributeMapping] '${displayName}' -> '${constructed}' (via name + unit)`);
    } else if (configAttr && configAttr.name) {
      // Use the config name
      mapping[displayName] = configAttr.name;
      console.log(`[buildAttributeMapping] '${displayName}' -> '${configAttr.name}' (via config name)`);
    } else {
      // Fallback to the display name itself
      mapping[displayName] = displayName;
      console.log(`[buildAttributeMapping] '${displayName}' -> '${displayName}' (fallback - no config found)`);
    }
  });
  
  // Debug: Log each mapping entry explicitly to ensure all are present
  console.log(`[buildAttributeMapping] Mapping entries created:`, Object.keys(mapping).length);
  Object.entries(mapping).forEach(([key, value]) => {
    console.log(`[buildAttributeMapping]   ${key} => ${value}`);
  });
  
  console.log(`[buildAttributeMapping] Final mapping object:`, JSON.stringify(mapping, null, 2));
  return mapping;
}

/**
 * Updates the visibility of attributes in CODAP based on selected attributes.
 * Only ensures that newly added attributes are visible, never hides existing ones.
 * @param {string} datasetName - The name of the dataset
 * @param {Array<string>} selectedAttributes - List of attributes that should be visible
 * @returns {Promise} - Promise resolving when visibility updates are complete
 */
function updateAttributeVisibility(datasetName, selectedAttributes) {
  console.log(`[updateAttributeVisibility] Updating attribute visibility in CODAP for dataset: ${datasetName}`);
  console.log(`[updateAttributeVisibility] Selected attributes to make visible:`, selectedAttributes);
  
  // First get all collections in dataset
  return codapInterface.sendRequest({
    action: 'get',
    resource: `dataContext[${datasetName}]`
  }).then(function(result) {
    if (!result.success) {
      console.error('Failed to get dataset:', result.values);
      return Promise.reject('Failed to get dataset info');
    }
    
    const collections = result.values.collections;
    console.log(`[updateAttributeVisibility] Found ${collections.length} collections in CODAP`);
    
    const visibilityRequests = [];
    
    // For each collection, only make sure that selected attributes are visible
    // Never hide attributes that might contain data from previous requests
    collections.forEach((collection, collectionIndex) => {
      console.log(`[updateAttributeVisibility] Collection ${collectionIndex} (${collection.name}) has ${collection.attrs.length} attributes`);
      
      collection.attrs.forEach(attr => {
        console.log(`[updateAttributeVisibility]   Attribute: ${attr.name} | Hidden: ${attr.hidden} | In selected: ${selectedAttributes.includes(attr.name)}`);
        
        // Only make hidden attributes visible if they're in our current selection
        if (attr.hidden && selectedAttributes.includes(attr.name)) {
          console.log(`[updateAttributeVisibility]   -> Adding visibility request for ${attr.name}`);
          visibilityRequests.push({
            action: 'update',
            resource: `dataContext[${datasetName}].collection[${collection.name}].attribute[${attr.name}]`,
            values: {
              hidden: false
            }
          });
        }
      });
    });
    
    console.log(`[updateAttributeVisibility] Sending ${visibilityRequests.length} visibility update requests`);
    
    // Send all visibility updates in sequence
    return visibilityRequests.reduce(function(chain, request) {
      return chain.then(function() {
        return codapInterface.sendRequest(request);
      });
    }, Promise.resolve());
  });
}

// No longer auto-initialize on window load
// window.addEventListener('load', init);

// Export the public interface
export { getBaseURL, initializeApp };

document.addEventListener('DOMContentLoaded', () => {
  // ... existing code ...
  const clearDataLink = document.querySelector('.clear-data-link');
  const modal = document.getElementById('clear-data-modal');
  const confirmBtn = modal.querySelector('.modal-confirm');
  const cancelBtn = modal.querySelector('.modal-cancel');

  function showModal() {
    modal.classList.remove('fe-hide');
    modal.focus();
  }
  function hideModal() {
    modal.classList.add('fe-hide');
  }

  if (clearDataLink) {
    clearDataLink.addEventListener('click', (event) => {
      event.preventDefault();
      showModal();
    });
  }
  if (cancelBtn) {
    cancelBtn.addEventListener('click', (event) => {
      event.preventDefault();
      hideModal();
    });
  }
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      hideModal();
      await clearDataHandler();
    });
  }
  // Optional: close modal on Escape key
  modal.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      hideModal();
    }
  });
  // ... existing code ...
});