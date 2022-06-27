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
import {STATE_POPULATION_DATA, COUNTY_POPULATION_DATA} from './data.js';

const APP_NAME = 'Fatal Encounters Datasets';

const DATASETS = [
  {
    id: 'FatalEncountersByState',
    name: 'Fatal Encounters with the Police, By State',
    documentation: 'https://fatalencounters.org/view/person/',
    // endpoint: '/https://fatalencounters.now.sh/api',
    endpoint: './assets',
    renamedAttributes: [
      {
        old: ' Date of injury resulting in death (month/day/year)',
        new: 'Date'
      },
      {
        old: 'Race with imputations',
        new: 'Inferred race'
      }
    ],
    selectedAttributeNames: [
      'State',
      'population',
      'Unique ID',
      'Name',
      'Date',
      'Year',
      'Age',
      'Gender',
      'Race',
      'Inferred race',
      'Location of injury (address)',
      'Location of death (city)',
      'Location of death (zip code)',
      'Latitude',
      'Longitude',
      'Agency or agencies involved',
      'Highest level of force',
      'Armed/Unarmed',
      'Alleged weapon',
      'Aggressive physical movement',
      'Fleeing/Not fleeing',
      'Brief description',
      'Dispositions/Exclusions INTERNAL USE, NOT FOR ANALYSIS',
      'Intended use of force (Developing)',
      'Supporting document link',
      'Foreknowledge of mental illness? INTERNAL USE, NOT FOR ANALYSIS',
    ],
    // omittedAttributeNames: [
    //   'Imputation probability',
    //   'URL of image (PLS NO HOTLINKS)',
    //   'Full Address',
    //   'UID Temporary',
    //   'Name Temporary',
    //   'Description Temp',
    //   'URL Temp',
    //   '',
    //   'Unique ID formula',
    //   'Unique identifier (redundant)'
    // ],
    overriddenAttributes: [
      {
        name: 'Date of injury resulting in death',
        type: 'date',
        precision: 'day'
      },
      {
        name: 'Age',
        type: 'numeric'
      },
      {
        name: 'Year',
        formula: 'year(Date)',
        type: 'date',
        precision: 'year'
      },
    ],
    additionalAttributes: [
      // {
      //   name: 'Year',
      //   formula: 'year(Date)',
      //   type: 'date'
      // },
    ],
    timeSeriesAttribute: 'Date',
    uiComponents: [
      {
        type: 'select',
        name: 'State',
        label: 'Select State',
        lister: function () { return STATE_POPULATION_DATA.map(function (st) { return st["USPS Code"];})}
      }
    ],
    uiCreate: function (parentEl) {
      parentEl.append(createUIControl(this.uiComponents[0]));
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#FatalEncountersByState [name=State]`).value;
      return `${this.endpoint}/fe-${stateCode}.csv`;
    },
    parentAttributes: ['State', 'population'],
    preprocess: function (data) {
      data = mergePopulation(data, 'State', 'USPS Code');
      data = sortOnDateAttr(data, 'Date');
      return data;
    },
  },
]

const DEFAULT_DISPLAYED_DATASETS = ['FatalEncountersByState'];
const DEFAULT_DATASET = 'FatalEncountersByState';
const DOWNSAMPLE_GOAL_DEFAULT = 500;
const DOWNSAMPLE_GOAL_MAX = 1000;
const CHILD_COLLECTION_NAME = 'cases';
const PARENT_COLLECTION_NAME = 'groups';

let displayedDatasets = DEFAULT_DISPLAYED_DATASETS;
let downsampleGoal = DOWNSAMPLE_GOAL_DEFAULT;
let isInFetch = false;

/**
 * A utility to merge state population stats with a dataset.
 * @param data {[object]} attribute keyed data
 * @param referenceKeyAttr {string} the name of the attribute in the merged into dataset that
 *                         is a foreign key into the population dataset.
 * @param correlatedKey    {string} the corresponding key in the population dataset
 * @return {[object]} the data object modified
 */
function mergePopulation(data, referenceKeyAttr, correlatedKey) {
  let cached = null;
  data.forEach(function(dataItem) {
    let key = dataItem[referenceKeyAttr];
    if (!key) {return;}
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
 * A utility to merge state and county population stats with a dataset.
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
 * A utility to sort a dataset on a date attribute.
 * @param data {[object]}
 * @param attr {string}
 * @return {[object]} 'data' sorted
 */
function sortOnDateAttr(data, attr) {
  return data.sort(function (a, b) {
    return (new Date(a[attr])) - (new Date(b[attr]));
  })
}

function _csc(def, optionList) {
  let l = def.label || '';
  let n = def.name || '';
  let selectEl = createElement('select', null,
      [createAttribute('name',
          n)]);
  optionList.forEach(function (v) {
    selectEl.append(createElement('option', [], [v]));
  })
  return createElement('div', null, [createElement('label', null,
      [
        `${l}: `,
        selectEl,
      ])
  ]);

}

/**
 * A select box ui generator.
 *
 * @param def {{
 *     type: {'select'},
 *     name: {string},
 *     apiName: {string},
 *     label: {string},
 *     lister: {function}
 *   }}
 * @return {Element}
 */
function createSelectControl(def) {
  return _csc(def, def.lister());
}

function createTextControl(def) {
  let w = def.width || 10;
  let l = def.label || '';
  let n = def.name || '';
  return createElement('div', null, [createElement('label', null,
      [`${l}: `, createElement('input', null,
          [createAttribute('type', 'text'), createAttribute('name',
              n), createAttribute('style', `width: ${w}em;`)])])]);
}

function createUIControl(def) {
  let el;
  switch (def.type) {
    case 'text':
      el = createTextControl(def);
      break;
    case 'select':
      el = createSelectControl(def);
      break;
    // case 'conditionalSelect':
    //   el = createConditionalSelectControl(def);
    //   break;
    default:
      console.warn(`createUIControl: unknown type: ${def.type}`);
  }
  return el;
}

/**
 * A UI utility to create a DOM element with classes and content.
 * @param tag {string}
 * @param [classList] {[string]}
 * @param [content] {[Node]}
 * @return {Element}
 */
function createElement(tag, classList, content) {
  let el = document.createElement(tag);
  if (classList) {
    if (typeof classList === 'string') classList = [classList];
    classList.forEach( function (cl) {el.classList.add(cl);});
  }
  if (content) {
    if (!Array.isArray(content)) { content = [content];}
    content.forEach(function(c) {
      if (c instanceof Attr) {
        el.setAttributeNode(c);
      } else {
        el.append(c);
      }
    });
  }
  return el;
}

/**
 * A UI utility to create a DOM attribute node.
 * @param name {string}
 * @param value {*}
 * @return {Attr}
 */
function createAttribute(name, value) {
  let attr = document.createAttribute(name);
  attr.value = value;
  return attr;
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
 * Creates a dataset in CODAP.
 *
 * @param datasetName {string}
 * @param collectionList {[object]}
 * @param url {string}
 * @return {{collections: [{name: string, attrs: *}], name, title}}
 */
function specifyDataset(datasetName, collectionList, url) {
  return {
    name: datasetName,
    title: datasetName,
    collections: collectionList,
    metadata: {
      source: url,
      importDate: new Date().toLocaleString()
    }
  };
}

function guaranteeAttributes(existingDataset, desiredCollectionDefs) {
  let datasetName = existingDataset.name;
  let existingCollections = existingDataset.collections;
  let childMostCollectionName = existingCollections[existingCollections.length-1].name;
  let existingAttributes = [];
  existingCollections.forEach(function (collection) {
      existingAttributes = existingAttributes.concat(collection.attrs);
    });
  let desiredAttributes = [];
    desiredCollectionDefs.forEach(function (collection) {
      desiredAttributes = desiredAttributes.concat( collection.attrs);
    });
  let missingAttributes = desiredAttributes.filter(function (dAttr) {
    return !existingAttributes.find(function (eAttr) {
      return eAttr.name === dAttr.name;
    })
  });
  if (missingAttributes.length) {
    return codapInterface.sendRequest({
      action: 'create',
      resource: `dataContext[${datasetName}].collection[${childMostCollectionName}].attribute`,
      values: missingAttributes
    });
  } else {
    return Promise.resolve({success: true});
  }
}
/**
 * Creates a dataset in CODAP only if it does not exist.
 * @param datasetName {string}
 * @param collectionList {[object]}
 * @param url {string}
 * @return Promise
 */
function guaranteeDataset(datasetName, collectionList, url) {
  return codapInterface.sendRequest({action: 'get', resource: `dataContext[${datasetName}]`})
      .then(function (result) {
        if (result && result.success) {
          return guaranteeAttributes(result.values, collectionList);
        } else {
          return codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: specifyDataset(datasetName, collectionList, url)
          });
        }
      })
}

/**
 * Returns whether there is a graph in CODAP displaying the named dataset.
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
 * Create an autoscaled Case Table Component in CODAP
 * @param datasetName
 * @return {Promise<object>}
 */
function createCaseTable(datasetName, dimensions) {
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
      let componentID = result.values.id;
      // if (componentID) {
      //   return codapInterface.sendRequest({
      //     action: 'notify',
      //     resource: `component[${componentID}]`,
      //     values: {request: 'autoScale'}
      //   })
      // }
    }
  });
}

/**
 * Send an array of data items to CODAP
 * @param datasetName {string}
 * @param data {[object]}
 * @return {Promise}
 */
function sendItemsToCODAP(datasetName, data) {
  return codapInterface.sendRequest({
    action: 'create',
    resource: `dataContext[${datasetName}].item`,
    values: data
  });
}

function selectSource(/*ev*/) {
  // this is the selected event
  document.querySelectorAll('.datasource').forEach((el) => el.classList.remove('selected-source'));
  this.parentElement.parentElement.classList.add('selected-source');
}

/**
 * Sets and removes 'busy' class at the 'body' level.
 * @param isBusy
 */
function setBusy(isBusy) {
  if (isBusy) {
    document.body.classList.add('busy');
  } else {
    document.body.classList.remove('busy');
  }
  isInFetch = isBusy;
}

/**
 * Responds to a 'fetch' button press. Normally, of course, this would initiate
 * a fetch of the selected data from the selected data source and its transfer to
 * CODAP.
 */
function fetchHandler(/*ev*/) {
  if (!isInFetch)
  setBusy(true);
  fetchDataAndProcess().then(
      function (result) {
        if (result && !result.success) {
          message(`Import to CODAP failed. ${result.values.error}`)
        } else if (result && result.success) {
          message('');
        }
        setBusy(false)
      },
      function (err) {
        message(err);
        setBusy(false)
      }
  );
}

/**
 * Creates the plugin UI and associates the correct event handlers.
 */
function createUI () {
  let anchor = document.querySelector('.contents');
  displayedDatasets.forEach(function (dsId) {
    let ix = DATASETS.findIndex(function (d) {return d.id === dsId});
    if (ix>=0) {
      let ds = DATASETS[ix]
      let el = createElement('div', ['datasource'], [
        createAttribute('id', ds.id),
        createElement('h3', null, [
          createElement('input', null, [
            createAttribute('type', 'radio'),
            createAttribute('name', 'source'),
            createAttribute('value', ix)
          ]),
          ds.name
        ]),
        createElement('div', [], [
          createElement('a', [], [
            createAttribute('href', ds.documentation),
            createAttribute('target', '_blank'),
            'dataset documentation'
          ])
        ])
      ]);

      ds.uiCreate(el);
      anchor.append(el);
      if (ds.id === DEFAULT_DATASET) {
        let input = el.querySelector('input');
        input.checked = true;
        el.classList.add('selected-source')
      }
    }
  })
  document.querySelectorAll('input[type=radio][name=source]')
      .forEach((el) => el.addEventListener('click', selectSource))
  document.querySelectorAll('input[type=text]')
      .forEach(function (el) { el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          fetchHandler(ev);
        }
      })})
  let button = document.querySelector('button.fetch-button');
  button.addEventListener('click', fetchHandler);
}

function init() {
  let datasets = (new URL(document.location)).searchParams.get('datasets');
  if (datasets) {
    if (datasets === 'all') {
      datasets = DATASETS.map(function (ds) { return ds.id; });
    } else {
      datasets = datasets.split(',');
    }
    displayedDatasets = datasets;
  }

  codapInterface.init({
    name: APP_NAME,
    title: APP_NAME,
    dimensions:{width: 360, height: 440},
    preventDataContextReorg: false
  }).then(createUI);
}

/**
 *  Displays a message in the message area
 *  @param msg {string}
 **/
function message(msg) {
  let messageEl = document.querySelector('#msg');
  messageEl.innerHTML = msg;
}

function getLastMessage() {
  let messageEl = document.querySelector('#msg');
  return messageEl.innerText;
}

/**
 * Is passed an array of objects. Returns the keys for the first object
 * in the array. Assumes all other objects have identical keys.
 * @param array {object[]}
 * @return {string[]}
 */
function getAttributeNamesFromData(array) {
  if (!Array.isArray(array) || !array[0] || (typeof array[0] !== "object")) {
    return [];
  }
  var attrMap = {};
  array.forEach((item) => {
    Object.keys(item).forEach((key) => {attrMap[key] = true;});
  });
  return Object.keys(attrMap);
}

/**
 * A utility to downsample a dataset by selecting a random subset.
 * @param data
 * @param targetCount
 * @param start
 * @return {*[]}
 */
function downsampleRandom(data, targetCount, start) {
  let dataLength = data.length - start;
  let ct = Math.min(dataLength, Math.max(0, targetCount));
  let randomAreSelected = ct < (dataLength/2);
  let pickArray = new Array(dataLength).fill(!randomAreSelected);
  if (!randomAreSelected) {
    ct = dataLength - ct;
  }

  // construct an array of selection choices
  let i = 0;
  while (i < ct) {
    let value = Math.floor(Math.random()*dataLength);
    if (pickArray[value] !== randomAreSelected) {
      i++;
      pickArray[value] = randomAreSelected;
    }
  }

  let newData = [];
  // copy the non-data rows
  for (let ix = 0; ix < start; ix += 1) {
    newData.push(data[ix]);
  }
  // use pick array to determine if we should add each row of original table to new
  pickArray.forEach(function(shouldPick, ix) {
    if (shouldPick) newData.push(data[ix + start]);
  });

  return newData;
}

/**
 * Makes an array of CODAP Attribute Specs from the dataset definition and the
 * attribute names discovered in the data.
 *
 * @param datasetSpec
 * @param attributeNames
 * @return {[object] | undefined}
 */
function resolveAttributes(datasetSpec, attributeNames) {
  let omittedAttributeNames = datasetSpec.omittedAttributeNames || [];
  let selectedAttributeNames = datasetSpec.selectedAttributeNames;
  attributeNames = selectedAttributeNames || attributeNames.filter(
      function (attrName) {
        return !omittedAttributeNames.includes(attrName);
      });
  if (attributeNames) {
    let attributeList = attributeNames.map(function (attrName) {
      return {name: attrName};
    })
    if (datasetSpec.overriddenAttributes) {
      datasetSpec.overriddenAttributes.forEach(function (overrideAttr) {
        let attr = attributeList.find(function (attr) {
          return attr.name === overrideAttr.name;
        });
        if (attr) {
          Object.assign(attr, overrideAttr);
        }
      })
    }
    if (datasetSpec.additionalAttributes) {
      attributeList = attributeList.concat(datasetSpec.additionalAttributes);
    }
    return attributeList;
  }
}

function resolveCollectionList(datasetSpec, attributeNames) {
  let attributeList = resolveAttributes(datasetSpec, attributeNames);
  let collectionsList = [];
  let childCollection = {
    name: datasetSpec.childCollectionName || CHILD_COLLECTION_NAME,
    attrs: []
  }
  let parentCollection;
  if (datasetSpec.parentAttributes) {
    parentCollection = {
      name: PARENT_COLLECTION_NAME,
      attrs: []
    }
    collectionsList.push(parentCollection);
    childCollection.parent = PARENT_COLLECTION_NAME;
  }
  collectionsList.push(childCollection);

  attributeList.forEach(function (attr) {
    if (datasetSpec.parentAttributes && datasetSpec.parentAttributes.includes(attr.name)) {
      parentCollection.attrs.push(attr);
    } else {
      childCollection.attrs.push(attr);
    }
  });
  return collectionsList;
}

function renameAttributes(data, renames) {
  data.forEach(function (item) {
    renames.forEach(function (rename) {
      item[rename.new] = item[rename.old];
      delete item[rename.old];
    })
  });
  return data;
}

function csvToJSON(data) {
  let headers = data.shift();
  let newData = data.map(d => {
    let out = {}
    d.forEach((v,ix) => {out[headers[ix]] = v; });
    return out;
  });
  return newData;
}

/**
 * Fetches data from the selected dataset and sends it to CODAP.
 * @return {Promise<Response>}
 */
function fetchDataAndProcess() {
  // determine what datasource we are fetching
  let sourceSelect = document.querySelector('input[name=source]:checked');
  if (!sourceSelect) {
    message('Pick a source');
    return Promise.reject('No source selected');
  }
  let sourceIX = Number(sourceSelect.value);
  let datasetSpec = DATASETS[sourceIX];

  // fetch the data
  let url = datasetSpec.makeURL();
  let headers = new Headers();
  if (datasetSpec.apiToken) {
    headers.append('X-App-Token', datasetSpec.apiToken);
  }
  if (!url) { return Promise.reject(getLastMessage()); }
  // console.log(`source: ${sourceIX}:${datasetSpec.name}, url: ${url}`);
  message(`Fetching ${datasetSpec.name}...`)
  return fetch(url, {headers: headers}).then(function (response) {

    if (response.ok) {
      message('Converting...')
      return response.text().then(function (data) {
        let dataSet = Papa.parse(data, {skipEmptyLines: true});
        let nData = csvToJSON(dataSet.data);
        // rename attributes in the data
        if (datasetSpec.renamedAttributes) {
          nData = renameAttributes(nData, datasetSpec.renamedAttributes);
        }
        // preprocess the data: this is guided by the datasetSpec and may include,
        // for example sorting and filtering
        if (datasetSpec.preprocess) {
          nData = datasetSpec.preprocess(nData);
        }
        // downsample the data, if necessary
        if (datasetSpec.downsample && downsampleGoal) {
          nData = downsampleRandom(nData, downsampleGoal, 0);
        }
        // create the specification of the CODAP collections
        let collectionList = resolveCollectionList(datasetSpec, getAttributeNamesFromData(
            nData));
        if (collectionList) {
          // create the dataset, if needed.
          return guaranteeDataset(datasetSpec.name, collectionList, datasetSpec.documentation)
              // send the data
              .then(function () {
                message('Sending data to CODAP')
                return sendItemsToCODAP(datasetSpec.name, nData);
              })
              // create a Case Table Component to show the data
              .then(function () {
                message('creating a case table');
                let dimensions = datasetSpec.caseTableDimensions || undefined;
                return createCaseTable(datasetSpec.name, dimensions);
              })
              .then(function () {
                if (datasetSpec.postprocess) {
                  datasetSpec.postprocess(datasetSpec);
                }
              });
        }
        else {
          return Promise.reject('CDC Server returned no data');
        }
      });
    } else {
      return Promise.reject(response.statusText);
    }
  });
}

window.addEventListener('load', init);
