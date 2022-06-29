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
function initialize(state, dataTypeStore, iEventHandlers) {
  let eventHandlers = iEventHandlers;

  // renderDataTypes(dataTypeStore.findAll(state.database), state.unitSystem);
  // updateView(state, dataTypeStore);

  setEventHandler('html', 'click', iEventHandlers.selectHandler, true);
  // setEventHandler('#fe-get-button', 'click', function (ev) {
  //   closeDateRangeSelector();
  //   if (eventHandlers.getData) {
  //     eventHandlers.getData(ev);
  //   }
  // });
  setEventHandler('#fe-clear-button', 'click', eventHandlers.clearData);
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
  let waiting = false;
  let el = document.querySelector('.fe-summary');
  let statusClass = '';
  if (status === 'busy' ||
      status === 'retrieving' ||
      status === 'transferring' ||
      status === 'clearing' ) {
    getButtonIsActive = false;
    waiting = true;
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

  el.querySelector('#fe-get-button').disabled=!getButtonIsActive;
  setWaitCursor(waiting);
  setMessage(message);
}

function setWaitCursor(isWait) {
  if (isWait) {
    document.body.classList.add('fetching');
  } else {
    document.body.classList.remove('fetching');
  }
}

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

export {
  initialize,
  setMessage,
  setTransferStatus,
  setWaitCursor,
};



