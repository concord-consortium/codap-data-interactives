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

function displayMessage(message) {
  messageArea.insertAdjacentHTML('beforeend', '<div class="message">' + message + '</div>');
  showSection('message-area', true);
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
  let height = section.offsetTop + section.offsetHeight + 40;
  return height;
}

function getInputValue(name) {
  return document.forms[0][name].value;
}

function setInputValue(name, value) {
  document.forms[0][name].value = value;
}

function getInputFileList(name) {
  return document.forms[0][name].files;
}

function installButtonHandler(selector, handler) {
  let el = document.querySelector(selector);
  if (el) el.onclick = handler;
}

export {
  displayError,
  displayMessage,
  getHeight,
  getInputFileList,
  getInputValue,
  installButtonHandler,
  setInputValue,
  showSection
};
