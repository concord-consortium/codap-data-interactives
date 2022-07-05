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
import * as UIControl from './ui.js'

const APP_NAME = 'Fatal Encounters Datasets';

// noinspection SqlResolve
const DATASETS = [
  {
    id: 'FatalEncountersByState',
    name: 'Fatal Encounters with the Police, By State',
    documentation: 'https://fatalencounters.org/view/person/',
    // endpoint: '/https://fatalencounters.now.sh/api',
    endpoint: './assets/data',
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
    overriddenAttributes: [
      {
        name: 'State',
      },
      {
        name: 'population',
      },
      {
        name: 'Unique ID',
        description: 'assigned when data was input to Fatal Encounters',
      },
      {
        name: 'Name',
        description: 'name of person who died as a result of the encounter with law enforcement',
      },
      {
        name: 'Date',
        type: 'date',
        precision: 'day',
        description: 'the full date when the encounter occurred, Month/Day/Year',
      },
      {
        name: 'Year',
        type: 'date',
        precision: 'year',
        description: 'the year when the encounter occurred',
      },
      {
        name: 'Age',
        type: 'numeric',
        description: 'age at death of person',
      },
      {
        name: 'Gender',
        description: 'gender as specified in the supporting media source',
      },
      {
        name: 'Race',
        description: 'race as specified in the supporting media source',
      },
      {
        name: 'Inferred race',
        description: 'race inferred, not based on what is written in media source. The Race attribute includes many people marked as “uncertain” since the race was not explicitly written. This attribute includes inferred race by the data inputter based on pictures or other evidence.',
      },
      {
        name: 'Location of injury (address)',
        description: 'location where the injury occurred that caused the fatality of the person',
      },
      {
        name: 'Location of death (city)',
        description: 'location where the person passed away',
      },
      {
        name: 'Location of death (zip code)',
        description: 'location where the person passed away',
      },
      {
        name: 'Latitude',
        description: 'Latitude of incident',
      },
      {
        name: 'Longitude',
        description: 'Longitude of incident',
      },
      {
        name: 'Agency or agencies involved',
        description: 'The agenc(ies) the law enforcement officer(s) represent',
      },
      {
        name: 'Highest level of force',
        description: '',
      },
      {
        name: 'Armed/Unarmed',
        description: '',
      },
      {
        name: 'Alleged weapon',
        description: '',
      },
      {
        name: 'Aggressive physical movement',
        description: '',
      },
      {
        name: 'Fleeing/Not fleeing',
        description: 'whether the person of interest was fleeing or not fleeing from law enforcement',
      },
      {
        name: 'Brief description',
        description: 'a short description of what happened during the incident',
      },
      {
        name: 'Dispositions/Exclusions INTERNAL USE, NOT FOR ANALYSIS',
        description: 'contains information about whether the fatality was considered justified or not, criminal, an accident, suicide, or pending investigation',
      },
      {
        name: 'Intended use of force (Developing)',
        description: 'a description of the the type of force that was used to cause the fatality',
      },
      {
        name: 'Supporting document link',
        description: 'a URL to the media source where the data for the person was identified',
      },
      {
        name: 'Foreknowledge of mental illness? INTERNAL USE, NOT FOR ANALYSIS',
        description: 'Yes, No, or Unknown to whether there was a known mental illness at the time of the encounter',
      }
    ],
    timeSeriesAttribute: 'Date',
    uiComponents: [
      {
        type: 'instruction',
        text: "Select a state below to retrieve data from the Fatal Encounters" +
            " dataset. You may choose more than one state."
      },
      {
        type: 'select',
        name: 'State',
        label: 'Select State',
        lister: function () { return STATE_POPULATION_DATA.map(function (st) { return st["USPS Code"];})}
      }
    ],
    makeURL: function () {
      let stateCode = document.querySelector(`#FatalEncountersByState [name=State]`).value;
      return `${this.endpoint}/fe-${stateCode}.csv`;
    },
    parentAttributes: ['State', 'population'],
    preprocess: [
      {type: 'rename', oldKey: ' Date of injury resulting in death (month/day/year)', newKey: 'Date'},
      {type: 'rename', oldKey: 'Race with imputations', newKey: 'Inferred race'},
      {type: 'mergePopulation', dataKey: 'State', mergeKey: 'USPS Code'},
      {type: 'sortOnDateAttr', dataKey: 'Date'},
      {type: 'computeYear', dateKey: 'Date', yearKey: 'Year'}
    ]
  },
  {
    id: 'FatalEncountersByYear',
    name: 'Fatal Encounters with the Police, By Year',
    documentation: 'https://fatalencounters.org/view/person/',
    // endpoint: '/https://fatalencounters.now.sh/api',
    endpoint: './assets/data',
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
    overriddenAttributes: [
      {
        name: 'State',
      },
      {
        name: 'population',
      },
      {
        name: 'Unique ID',
        description: 'assigned when data was input to Fatal Encounters',
      },
      {
        name: 'Name',
        description: 'name of person who died as a result of the encounter with law enforcement',
      },
      {
        name: 'Date',
        type: 'date',
        precision: 'day',
        description: 'the full date when the encounter occurred, Month/Day/Year',
      },
      {
        name: 'Year',
        type: 'date',
        precision: 'year',
        description: 'the year when the encounter occurred',
      },
      {
        name: 'Age',
        type: 'numeric',
        description: 'age at death of person',
      },
      {
        name: 'Gender',
        description: 'gender as specified in the supporting media source',
      },
      {
        name: 'Race',
        description: 'race as specified in the supporting media source',
      },
      {
        name: 'Inferred race',
        description: 'race inferred, not based on what is written in media source. The Race attribute includes many people marked as “uncertain” since the race was not explicitly written. This attribute includes inferred race by the data inputter based on pictures or other evidence.',
      },
      {
        name: 'Location of injury (address)',
        description: 'location where the injury occurred that caused the fatality of the person',
      },
      {
        name: 'Location of death (city)',
        description: 'location where the person passed away',
      },
      {
        name: 'Location of death (zip code)',
        description: 'location where the person passed away',
      },
      {
        name: 'Latitude',
        description: 'Latitude of incident',
      },
      {
        name: 'Longitude',
        description: 'Longitude of incident',
      },
      {
        name: 'Agency or agencies involved',
        description: 'The agenc(ies) the law enforcement officer(s) represent',
      },
      {
        name: 'Highest level of force',
        description: '',
      },
      {
        name: 'Armed/Unarmed',
        description: '',
      },
      {
        name: 'Alleged weapon',
        description: '',
      },
      {
        name: 'Aggressive physical movement',
        description: '',
      },
      {
        name: 'Fleeing/Not fleeing',
        description: 'whether the person of interest was fleeing or not fleeing from law enforcement',
      },
      {
        name: 'Brief description',
        description: 'a short description of what happened during the incident',
      },
      {
        name: 'Dispositions/Exclusions INTERNAL USE, NOT FOR ANALYSIS',
        description: 'contains information about whether the fatality was considered justified or not, criminal, an accident, suicide, or pending investigation',
      },
      {
        name: 'Intended use of force (Developing)',
        description: 'a description of the the type of force that was used to cause the fatality',
      },
      {
        name: 'Supporting document link',
        description: 'a URL to the media source where the data for the person was identified',
      },
      {
        name: 'Foreknowledge of mental illness? INTERNAL USE, NOT FOR ANALYSIS',
        description: 'Yes, No, or Unknown to whether there was a known mental illness at the time of the encounter',
      }
    ],
    timeSeriesAttribute: 'Date',
    uiComponents: [
      {
        type: 'instruction',
        text: "Select a year below to retrieve data from the Fatal Encounters" +
            " dataset. You may choose more than one year."
      },
      {
        type: 'select',
        name: 'Year',
        label: 'Select Year',
        lister: function () {
          let a = [];
          for (let i = 2000; i < 2022; i++) {a.push(i);}
          return a;
        }
      }
    ],
    makeURL: function () {
      let year = document.querySelector(`#FatalEncountersByYear [name=Year]`).value;
      return `${this.endpoint}/fe-${year}.csv`;
    },
    parentAttributes: ['Year'],
    preprocess: [
      {type: 'rename', oldKey: ' Date of injury resulting in death (month/day/year)', newKey: 'Date'},
      {type: 'rename', oldKey: 'Race with imputations', newKey: 'Inferred race'},
      {type: 'mergePopulation', dataKey: 'State', mergeKey: 'USPS Code'},
      {type: 'sortOnDateAttr', dataKey: 'Date'},
      {type: 'computeYear', dateKey: 'Date', yearKey: 'Year'}
    ]
  },
]

const DEFAULT_DISPLAYED_DATASETS = [
  'FatalEncountersByState',
  'FatalEncountersByYear'
];
const DEFAULT_DATASET = 'FatalEncountersByState';
const DOWNSAMPLE_GOAL_DEFAULT = 500;
const DOWNSAMPLE_GOAL_MAX = 1000;
const CHILD_COLLECTION_NAME = 'cases';
const PARENT_COLLECTION_NAME = 'groups';

let displayedDatasets = DEFAULT_DISPLAYED_DATASETS;
let downsampleGoal = DOWNSAMPLE_GOAL_DEFAULT;
let isInFetch = false;

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
 * UI generator: select box
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

/**
 * UI generator: Text input control
  * @param def
 * @return {Element}
 */
function createTextControl(def) {
  let w = def.width || 10;
  let l = def.label || '';
  let n = def.name || '';
  return createElement('div', null, [createElement('label', null,
      [`${l}: `, createElement('input', null,
          [createAttribute('type', 'text'), createAttribute('name',
              n), createAttribute('style', `width: ${w}em;`)])])]);
}

/**
 * UI generator
 */
function createUIControl(def) {
  let el;
  switch (def.type) {
    case 'instruction':
      el = createElement('p', [], def.text);
      break;
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
 * UI generation: figures out whether to invoke a function for the dataset or
 * generate from declarative specs.
 *
 * @param parentEl
 * @param datasetDef
 */
function createDatasetUI(parentEl, datasetDef) {
  let el = createElement('div');
  datasetDef.uiComponents.forEach(uic => {
    el.append(createUIControl(uic));
  });
  parentEl.append(el);
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
 * CODAP API Helper: Creates a dataset
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

/**
 * CODAP API Helper: Creates or updates dataset attributes
 * @param existingDataset
 * @param desiredCollectionDefs
 * @return {Promise|Promise<{success: boolean}>}
 */
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
 * CODAP API Helper: Creates a dataset only if it does not exist.
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
 * @param datasetName
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
  return codapInterface.sendRequest({
    action: 'create',
    resource: `dataContext[${datasetName}].item`,
    values: data
  });
}

/**
 * UI Utility: determine checked dataset option
 */
function selectDatasetHandler(/*ev*/) {
  // this is the selected event
  document.querySelectorAll('.datasource').forEach((el) => el.classList.remove('selected-source'));
  this.parentElement.parentElement.classList.add('selected-source');
}

/**
 * UI Utility: Sets and removes 'busy' class at the 'body' level.
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
 * UI Handler: Responds to a 'fetch' button press. Normally, of course, this would initiate
 * a fetch of the selected data from the selected data source and its transfer to
 * CODAP.
 */
function fetchHandler(/*ev*/) {
  if (!isInFetch)
  setBusy(true);
  fetchDataAndProcess().then(
      function (result) {
        if (result && !result.success) {
          setTransferStatus('failure', `Import to CODAP failed. ${result.values.error}`)
        } else if (result && result.success) {
          setTransferStatus('success', 'Ready');
        }
        setBusy(false)
      },
      function (err) {
        setTransferStatus('failure', err);
        setBusy(false)
      }
  );
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
 * CODAP Helper: Deletes all cases from the named dataset.
 * @param datasetName {string}
 * @return {Promise<*|{success: boolean}>}
 */
async function clearData (datasetName) {
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
    setTransferStatus('inactive', 'Pick a source');
    return Promise.reject('No source selected');
  }
  clearData(currDatasetSpec.name);
}

/**
 * CODAP Helper: Select (bring forward) a component
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
      ]);

      if (ds.uiCreate) {
        ds.uiCreate(el);
      } else {
        createDatasetUI(el, ds);
      }
      anchor.append(el);
      if (ds.id === DEFAULT_DATASET) {
        let input = el.querySelector('input');
        input.checked = true;
        el.classList.add('selected-source')
      }
    }
  })
  document.querySelectorAll('input[type=radio][name=source]')
      .forEach((el) => el.addEventListener('click', selectDatasetHandler))
  document.querySelectorAll('input[type=text]')
      .forEach(function (el) { el.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter') {
          fetchHandler(ev);
        }
      })})
  let button = document.querySelector('button.fe-fetch-button');
  button.addEventListener('click', fetchHandler);
  UIControl.initialize({
    selectHandler: selectHandler,
    clearData: clearDataHandler
  });
  setTransferStatus("success", "Ready")
}

/**
 * Initializes the web application
 *   * Connects with CODAP
 *   * Creates UI
 */
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
 * UI Helper: sets the status display icon and message
 * @param status {'disabled', 'inactive', 'busy', 'retrieving', 'transferring', 'clearing', 'success', 'failure'}
 * @param msg
*/
function setTransferStatus(status, msg) {
  UIControl.setTransferStatus(status, msg)
}

/**
 * Utility: Is passed an array of objects. Returns the keys for the first object
 * in the array. Assumes all other objects have identical keys.
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
 * A utility to downsample a dataset by selecting a random subset without
 * replacement.
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

/**
 * CODAP API Utility to construct a collection list
 * @param datasetSpec
 * @param attributeNames
 * @return {*[]}
 */
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

/**
 * A utility to convert and array of arrays (e.g. from CSV) to an equivalent
 * array of objects. Property names taken from first row.
 * @param data
 * @return {*}
 */
function csvToJSON(data) {
  let headers = data.shift();
  return data.map(d => {
    let out = {}
    d.forEach((v, ix) => {
      out[headers[ix]] = v;
    });
    return out;
  });
}

/**
 * UI/model Utility: determine selected dataset and look it up
 * @return {{selectedAttributeNames: string[], makeURL: (function(): string), endpoint: string, preprocess: [{oldKey: string, newKey: string, type: string}, {oldKey: string, newKey: string, type: string}, {dataKey: string, type: string, mergeKey: string}, {dataKey: string, type: string}, {yearKey: string, dateKey: string, type: string}], documentation: string, name: string, id: string, overriddenAttributes: [{name: string}, {name: string}, {name: string, description: string}, {name: string, description: string}, {precision: string, name: string, description: string, type: string}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], timeSeriesAttribute: string, uiComponents: [{text: string, type: string}, {lister: (function(): (string)[]), name: string, label: string, type: string}], parentAttributes: string[]}|{selectedAttributeNames: string[], makeURL: (function(): string), endpoint: string, preprocess: [{oldKey: string, newKey: string, type: string}, {oldKey: string, newKey: string, type: string}, {dataKey: string, type: string, mergeKey: string}, {dataKey: string, type: string}, {yearKey: string, dateKey: string, type: string}], documentation: string, name: string, id: string, overriddenAttributes: [{name: string}, {name: string}, {name: string, description: string}, {name: string, description: string}, {precision: string, name: string, description: string, type: string}, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null], timeSeriesAttribute: string, uiComponents: [{text: string, type: string}, {lister: (function(): *[]), name: string, label: string, type: string}], parentAttributes: string[]}}
 */
function getCurrentDatasetSpec() {
  let sourceSelect = document.querySelector('input[name=source]:checked');
  if (!sourceSelect) {
    return;
  }
  let sourceIX = Number(sourceSelect.value);
  return DATASETS[sourceIX];
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
  return data;
}

/**
 * Fetches data from the selected dataset and sends it to CODAP.
 * @return {Promise<Response>}
 */
function fetchDataAndProcess() {
  let datasetSpec = getCurrentDatasetSpec();
  if (!datasetSpec) {
    setTransferStatus('inactive', 'Pick a source');
    return Promise.reject('No source selected');
  }

  // fetch the data
  let url = datasetSpec.makeURL();
  let headers = new Headers();
  if (datasetSpec.apiToken) {
    headers.append('X-App-Token', datasetSpec.apiToken);
  }
  if (!url) { return Promise.reject("fetch failed"); }
  // console.log(`source: ${sourceIX}:${datasetSpec.name}, url: ${url}`);
  setTransferStatus('busy', `Fetching data...`)
  return fetch(url, {headers: headers}).then(function (response) {

    if (response.ok) {
      setTransferStatus('busy', 'Converting...')
      return response.text().then(function (data) {
        let dataSet = Papa.parse(data, {skipEmptyLines: true});
        let nData = csvToJSON(dataSet.data);
        // preprocess the data: this is guided by the datasetSpec and may include,
        // for example sorting and filtering
        if (datasetSpec.preprocess) {
          nData = preprocessData(nData, datasetSpec.preprocess);
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
                setTransferStatus('busy', 'Sending data to CODAP')
                return sendItemsToCODAP(datasetSpec.name, nData);
              })
              // create a Case Table Component to show the data
              .then(function () {
                setTransferStatus('busy', 'creating a case table');
                let dimensions = datasetSpec.caseTableDimensions || undefined;
                return createCaseTable(datasetSpec.name, dimensions);
              })
              .then(function () {
                setTransferStatus('success', 'Ready');
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

// And off we go...
window.addEventListener('load', init);
