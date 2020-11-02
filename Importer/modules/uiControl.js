// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2019 by The Concord Consortium, Inc. All rights reserved.
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
let messageArea = document.getElementById('message-area');

/* @property {{keyCode: handler}} */
let keyMap = {};

function displayMessage(message, selector) {
  if (selector == null) {
    // noinspection SpellCheckingInspection
    messageArea.insertAdjacentHTML('beforeend', '<div class="message">' + message + '</div>');
    showSection('message-area', true);
  } else {
    let el = document.querySelector(selector);
    if (el) {
      el.innerHTML = message;
    }
  }
}

function displayError(message) {
  console.log('ImportCVS Plugin: ' + message);
  displayMessage('<span class="error">' + message + '</span>')
}

/**
 * Shows a page section.
 * Assumes sectionName is the id of the DOM node and that visibility is controlled
 * by the 'hidden' property of the node.
 * @param sectionName
 * @param isVisible
 */
function showSection(sectionName, isVisible) {
  if (isVisible == null) isVisible = true;
  let section = document.getElementById(sectionName);
  if (section) {
    section.hidden = !isVisible;
  } else {
    console.warn('Import CSV: showSection on nonexistent section: ' + sectionName);
  }
}

function getHeight() {
  let section = document.getElementById('submit-area');
  return section.offsetTop + section.offsetHeight + 40;
}

function getInputValue(name) {
  return document.forms[0][name].value;
}

function getInputFileList(name) {
  return document.forms[0][name].files;
}

function setInputValue(name, value) {
  document.forms[0][name].value = value;
}

function installButtonHandler(selector, handler) {
  let el = document.querySelector(selector);
  if (el) el.onclick = handler;
}

function installKeystrokeHandler(keyCode, handler) {
  keyMap[keyCode] = handler;
}

function keystrokeHandler (ev) {
  let handler = keyMap[ev.code];
  if (handler) { return handler(ev); }
}

function focus() {
  let el = document.querySelector('#submit');
  if (el) el.focus();
}

function init() {
  document.addEventListener('keydown', keystrokeHandler);
}

init();

export {
  displayError,
  displayMessage,
    focus,
  getHeight,
  getInputFileList,
  getInputValue,
  installButtonHandler,
  installKeystrokeHandler,
  setInputValue,
  showSection
};
