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

const APP_NAME = 'CDC COVID Data';
const DATASETS = [
  {
    id: 'StateData',
    name: 'CDC COVID State Data',
    endpoint: 'https://data.cdc.gov/resource/9mfq-cb36.json',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
          createElement('label', null, [
              'Enter Two Char State Abbr: ',
              createElement('input', null, [
                  createAttribute('type', 'text'),
                  createAttribute('style', 'width: 2em;')
              ])
          ])
        ]));
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#StateData input[type=text]`).value;
      if (stateCode && stateCode.length === 2) {
        return this.endpoint + `?state=${stateCode.toUpperCase()}`;
      } else {
        message('Please enter two character state code');
      }
    }
  },
  {
    id: 'DeathByCounty',
    name: 'CDC COVID Death Counts by County',
    endpoint: 'https://data.cdc.gov/resource/kn79-hsxy.json',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Enter Two Char State Abbr: ',
          createElement('input', null, [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 2em;')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#${this.id} input[type=text]`).value;
      if (stateCode) {
        return this.endpoint + `?State=${stateCode.toUpperCase()}`;
      } else {
        message('Please enter two character state code');
      }
    }
  },
  {
    id: 'DeathConds',
    name: 'CDC COVID Contributing Conditions',
    endpoint: 'https://data.cdc.gov/resource/hk9y-quqm.json',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Enter full state name: ',
          createElement('input', null, [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 12em;')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let stateName = document.querySelector(`#${this.id} input[type=text]`).value;
      if (stateName) {
        return this.endpoint + `?state=${toInitialCaps(stateName)}`;
      } else {
        message('Please enter full state name(initial caps)');
      }
    }
  },
  {
    id: 'ExcessDeaths',
    name: 'CDC COVID Excess Deaths',
    endpoint: 'https://data.cdc.gov/resource/xkkf-xrst.json',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Enter full state name: ',
          createElement('input', null, [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 12em;')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let stateCode = document.querySelector(`#${this.id} input[type=text]`).value;
      if (stateCode) {
        return this.endpoint + `?state=${toInitialCaps(stateCode)}`;
      } else {
        message('Please enter full state name');
      }
    }
  },
  {
    id: 'Microdata',
    name: 'CDC Case Surveillance Public Use',
    endpoint: 'https://data.cdc.gov/resource/vbim-akqf.json',
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Number of cases(max 5000): ',
          createElement('input', null, [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 4em;')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let value = document.querySelector(`#${this.id} input[type=text]`).value;
      value = (value && isNaN(value))?5000:Math.min(value, 5000);
      return this.endpoint + `?$limit=${value}`;
    }
  },
  {
    id: 'Microdata2',
    name: 'CDC COVID-19 Case Surveillance Public Use Data with Geography',
    endpoint: 'https://data.cdc.gov/resource/n8mc-b4w4.json',
    default: true,
    uiCreate: function (parentEl) {
      parentEl.append(createElement('div', null, [
        createElement('label', null, [
          'Enter Two Char State Abbr: ',
          createElement('input', 'in-state-digraph', [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 2em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'Enter county name: ',
          createElement('input', 'in-county', [
            createAttribute('type', 'text'),
            createAttribute('style', 'width: 12em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'Number of cases(max 5000): ',
          createElement('input', 'in-limit', [
            createAttribute('type', 'number'),
            createAttribute('style', 'width: 4em;')
          ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
            'Start date: ',
            createElement('input', ['in-start-date'], [
                createAttribute('type', 'date')
            ])
        ]),
        createElement('br', null, null),
        createElement('label', null, [
          'End date: ',
          createElement('input', ['in-end-date'], [
            createAttribute('type', 'date')
          ])
        ])
      ]));
    },
    makeURL: function () {
      let limit = document.querySelector(`#${this.id} .in-limit`).value;
      limit = (isNaN(limit) || limit <= 0)?5000:Math.min(limit, 5000);
      let limitPhrase = `$limit=${limit}`
      let stateCode = document.querySelector(`#${this.id} .in-state-digraph`).value.toUpperCase();
      let stateCodePhrase = stateCode? `res_state=${stateCode}&`: '';
      let county = document.querySelector(`#${this.id} .in-county`).value.toUpperCase();
      let countyPhrase = county?`res_county=${county}&`: '';
      let startDate = document.querySelector(`#${this.id} .in-start-date`).value;
      let endDate = document.querySelector(`#${this.id} .in-end-date`).value;
      let datePhrase = (startDate && endDate)? `$where=case_month>='${startDate}' AND case_month<='${endDate}'&`: '';
      return this.endpoint + `?${stateCodePhrase}${countyPhrase}${datePhrase}${limitPhrase}`;
    }
  }
]

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

function toInitialCaps(str) {
  return str.split(/ +/)
      .map(function (w) {
        return w.toLowerCase().replace(/./, w[0].toUpperCase());
      }).join(' ');
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

function sendItemsToCODAP(datasetName, data) {
      return codapInterface.sendRequest({
        action: 'create',
        resource: `dataContext[${datasetName}].item`,
        values: data
      })
        .then(function () {
          return codapInterface.sendRequest({
            action: 'create',
            resource: `component`,
            values: {
              type: "caseTable",
              dataContext: datasetName
            }
          })
        });
}

function selectSource(/*ev*/) {
  // this is the selected event
  document.querySelectorAll('.datasource').forEach((el) => el.classList.remove('selected-source'));
  this.parentElement.parentElement.classList.add('selected-source');
}

function init() {
  codapInterface.init({
    name: APP_NAME,
    title: APP_NAME,
    dimensions:{width: 360, height: 440},
    preventDataContextReorg: false
  });
  let anchor = document.querySelector('.contents');
  DATASETS.forEach(function (ds, ix) {
    let el = createElement('div', ['datasource'], [
      createAttribute('id', ds.id),
      createElement('h3', null, [
        createElement('input', null, [
          createAttribute('type', 'radio'),
          createAttribute('name', 'source'),
          createAttribute('value', ix)
        ]),
        ds.name
      ])
    ]);
    ds.uiCreate(el);
    anchor.append(el);
    if (ds.default) {
      let input = el.querySelector('input');
      input.checked = true;
      el.classList.add('selected-source')
    }
  })
  document.querySelectorAll('input[type=radio][name=source]').forEach((el) => el.addEventListener('click', selectSource))
  let button = document.querySelector('button.fetch-button');
  button.addEventListener('click', function () {
    updateCODAP().then(
        function (result) {
          if (!result.success) {
            message(`Import to CODAP failed. ${result.values.error}`)
          }
        },
        function (err) {
          message(err);
        }
    );
  });
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
  let sourceSelect = document.querySelector('input[name=source]:checked');
  if (!sourceSelect) {
    message('Pick a source');
    return;
  }
  let sourceIX = Number(sourceSelect.value);
  let url = DATASETS[sourceIX].makeURL();
  if (!url) { return; }
  console.log(`source: ${sourceIX}:${DATASETS[sourceIX].name}, url: ${url}`);
  return fetch(url).then(function (response) {
    if (response.ok) {
      return response.json().then(function (data) {
        let attrs = getAttrs(data);
        if (attrs) {
          return guaranteeDataset(DATASETS[sourceIX].name, attrs)
              .then(function () {
                return sendItemsToCODAP(DATASETS[sourceIX].name, data);
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
