// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2022 by The Concord Consortium, Inc. All rights reserved.
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
function initialize(iEventHandlers) {
  let eventHandlers = iEventHandlers;

  setEventHandler('html', 'click', iEventHandlers.selectHandler, true);
  setEventHandler('.fe-clear-button', 'click', eventHandlers.clearData);
  setEventHandler('.fe-pop-up-anchor,#fe-info-close-button', 'click',
      function (/*ev*/) {
        let parentEl = findAncestorElementWithClass(this, 'fe-pop-up');
        togglePopUp(parentEl);
      });

}

function setEventHandler (selector, event, handler, capture) {
  const elements = document.querySelectorAll(selector);
  if (!elements) { return; }
  elements.forEach(function (el) {
    el.addEventListener(event, handler, {capture: capture});
  });
}


function setMessage(message) {
  document.querySelector(".fe-message-area").innerHTML = message;
}

/**
 * Sets the "transfer status" icon and message.
 * @param status {'disabled', 'inactive', 'busy', 'retrieving', 'transferring', 'clearing', 'success', 'failure'}
 * @param message
 */
function setTransferStatus(status, message) {
  let getButtonIsActive = true;
  // let waiting = false;
  let el = document.querySelector('.fe-summary');
  let statusClass = '';
  if (status === 'busy' ||
      status === 'retrieving' ||
      status === 'transferring' ||
      status === 'clearing' ) {
    getButtonIsActive = false;
    // waiting = true;
    statusClass = 'fe-transfer-in-progress';
  } else if (status === 'success') {
    statusClass = 'fe-transfer-success';
  } else if (status === 'failure') {
    statusClass = 'fe-transfer-failure';
  } else if (status === 'disabled' || status === 'inactive') {
    statusClass = 'fe-transfer-failure';
    getButtonIsActive = false;
  }
  el.classList.remove('fe-transfer-in-progress', 'fe-transfer-success', 'fe-transfer-failure');
  if (statusClass) { el.classList.add(statusClass); }

  el.querySelector('.fe-fetch-button').disabled=!getButtonIsActive;
  // setWaitCursor(waiting);
  setMessage(message);
}

function setBusyIndicator(isBusy) {
  if (isBusy) {
    document.body.classList.add('busy');
  } else {
    document.body.classList.remove('busy');
  }
}

// function setWaitCursor(isWait) {
//   if (isWait) {
//     document.body.classList.add('fetching');
//   } else {
//     document.body.classList.remove('fetching');
//   }
// }

function findAncestorElementWithClass(el, myClass) {
  while (el !== null && el.parentElement !== el) {
    if (el.classList.contains(myClass)) {
      return el;
    }
    el = el.parentElement;
  }
}

function togglePopUp(el) {
  let isOpen = el.classList.contains('fe-open');
  if (isOpen) {
    el.classList.remove('fe-open');
  } else {
    el.classList.add('fe-open');
  }
}

function _csc(name, label, optionList) {
  let selectEl = createElement('select', null, [createAttribute('name', name || '')]);
  optionList.forEach(function (v) {
    selectEl.append(createElement('option', [], [v]));
  })
  return createElement('div', null,
      [createElement('label', null, [`${(label || '')}: `, selectEl,])]);
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
  if (def.lister) {
    def.optionList = def.lister();
  }
  return _csc(def.name, def.label, def.optionList);
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
    classList.forEach(function (cl) {
      el.classList.add(cl);
    });
  }
  if (content) {
    if (!Array.isArray(content)) {
      content = [content];
    }
    content.forEach(function (c) {
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

function createInstruction(text) {
  return createElement('p', [], text);
}

/**
 * UI generator
 */
function createUIControl(def) {
  let el;
  switch (def.type) {
    case 'instruction':
      el = createInstruction(def.text);
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
 * UI generation: from declarative specs.
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

function createDatasetSelector(datasetId, datasetName, ix) {
  return createElement('div', ['datasource'],
      [createAttribute('id', datasetId), createElement('h3', null,
          [createElement('input', null,
              [createAttribute('type', 'radio'), createAttribute('name',
                  'source'), createAttribute('value', ix)]), datasetName]),]);
}

export {
  createAttribute,
  createDatasetUI,
  createDatasetSelector,
  createElement,
  createInstruction,
  createSelectControl,
  createTextControl,
  initialize,
  setBusyIndicator,
  setMessage,
  setTransferStatus,
  // setWaitCursor,
};
