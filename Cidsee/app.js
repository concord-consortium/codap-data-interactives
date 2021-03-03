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

const APP_NAME = 'CIDSEE Plugin';
const DATASETS = [
  {
    name: 'CDC COVID State Data',
    endpoint: 'https://data.cdc.gov/resource/9mfq-cb36.json',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', ['datasource'], [
        createElement('h3', null, [this.name]),
        createElement('p', null, [
          createElement('label', null, [
              'Enter Two Char State Code: ',
              createElement('input', null, [
                  createAttribute('type', 'text'),
                  createAttribute('style', 'width: 2em;')
              ])
          ])
        ])
      ]));
    }
  }
]

const DATASET_NAME = "CDC COVID State Data";
const ENDPOINT = 'https://data.cdc.gov/resource/9mfq-cb36.json';

/**
 * A utility to create a DOM element with classes and content.
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
 * A utility to create a DOM attribute node.
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
 *
 * @param datasetName {string}
 * @param attributeNames {[string]}
 * @return {{collections: [{name: string, attrs: *}], name, title}}
 */
function specifyDataset(datasetName, attributeNames) {
  return {
    name: datasetName,
    title: datasetName,
    collections: [{
      name: 'cases',
      attrs: attributeNames.map(function (attr) {
        return {name: attr};
      })
    }]
  };
}

/**
 *
 * @param datasetName {string}
 * @param attributeNames {[string]}
 * @return Promise
 */
function guaranteeDataset(datasetName, attributeNames) {
  return codapInterface.sendRequest({action: 'get', resource: `dataContext[${datasetName}]`})
      .then(function (result) {
        if (result && result.success) {
          return Promise.resolve(result.values);
        } else {
          return codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: specifyDataset(datasetName, attributeNames)
          });
        }
      })
}

function sendItemsToCODAP(data) {
      return codapInterface.sendRequest({
        action: 'create',
        resource: `dataContext[${DATASET_NAME}].item`,
        values: data
      })
        .then(function () {
          return codapInterface.sendRequest({
            action: 'create',
            resource: `component`,
            values: {
              type: "caseTable",
              dataContext: DATASET_NAME
            }
          })
        });
}


function init() {
  codapInterface.init({
    name: 'CDC COVID Data',
    title: 'CDC COVID Data',
    dimensions:{width: 260, height: 240},
    preventDataContextReorg: false
  });
  DATASETS.forEach(function (ds) {
    ds.uiCreate(document.querySelector('.contents'));
  })
  let button = document.querySelector('button');
  button.addEventListener('click', updateCODAP);
}

function message(msg) {
  let messageEl = document.querySelector('#msg');
  messageEl.innerHTML = msg;
}

function getAttrs(array) {
  if (!Array.isArray(array) || !array[0] || (typeof array[0] !== "object")) {
    return;
  }
  return Object.keys(array[0]);
}

function updateCODAP() {
  let stateCode = document.querySelector('input').value;
  if (stateCode && stateCode.length === 2) {
    let url = ENDPOINT + `?state=${stateCode}`;
    return fetch(url).then(function (response) {
      if (response.ok) {
        return response.json().then(function (data) {
          let attrs = getAttrs(data)
          return guaranteeDataset(DATASET_NAME, attrs)
              .then(function () {
                return sendItemsToCODAP(data);
              });
        });
      } else {
        return Promise.reject(response.statusText);
      }
    });
  } else {
    message('Please enter two character state code');
  }
}

window.addEventListener('load', init);
