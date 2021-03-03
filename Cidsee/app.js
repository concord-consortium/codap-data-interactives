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

const DATASET_NAME = "CDC COVID State Data";
const ENDPOINT = 'https://data.cdc.gov/resource/9mfq-cb36.json';
const ATTRS = [
  'submission_date',
  'state',
  'tot_cases',
  'conf_cases',
  'prob_cases',
  'new_case',
  'pnew_case',
  'tot_death',
  'conf_death',
  'prob_death',
  'new_death',
  'pnew_death',
  'created_at',
  'consent_cases',
  'consent_deaths'
];

function specifyDataset() {
  return {
    name: DATASET_NAME,
    title: DATASET_NAME,
    collections: [{
      name: 'cases',
      attrs: ATTRS.map(function (attr) {
        return {name: attr};
      })
    }]
  };
}

function guaranteeDataset() {
  return codapInterface.sendRequest({action: 'get', resource: `dataContext[${DATASET_NAME}]`})
      .then(function (result) {
        if (result && result.success) {
          return Promise.resolve(result.values);
        } else {
          return codapInterface.sendRequest({action: 'create', resource: 'dataContext', values: specifyDataset()});
        }
      })
}

function sendItemsToCODAP(response) {
  if (response.ok) {
    response.json().then(function (data) {
      return codapInterface.sendRequest({
        action: 'create',
        resource: `dataContext[${DATASET_NAME}].item`,
        values: data
      })
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
  } else {
    return Promise.reject(response.statusText);
  }
}


function init() {
  codapInterface.init({
    name: 'CDC COVID Data',
    title: 'CDC COVID Data',
    dimensions:{width: 260, height: 240},
    preventDataContextReorg: false
  });
  let button = document.querySelector('button');
  button.addEventListener('click', updateCODAP);
}

function message(msg) {
  let messageEl = document.querySelector('#msg');
  messageEl.innerHTML = msg;
}

function updateCODAP() {
  let stateCode = document.querySelector('input').value;
  if (stateCode && stateCode.length === 2) {
    let url = ENDPOINT + `?state=${stateCode}`
    guaranteeDataset()
        .then(fetch(url).then(sendItemsToCODAP)
        );
  } else {
    message('Please enter two character state code');
  }
}

window.addEventListener('load', init);
