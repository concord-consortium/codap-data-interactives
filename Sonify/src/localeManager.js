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

import * as strings from "./strings.json";
var DEFAULT_LOCALE = "en-us";

var locale;
var translations = {};

function getQueryParam(s) {
  return new URLSearchParams(window.location.search).get(s);
}

async function init() {
  //  let response = await fetch(stringFileURL);
  let data = strings; //await response.json();
  translations = data;
  locale = (getQueryParam("lang") || "en").toLowerCase();
  if (!(locale && translations[locale])) {
    locale = DEFAULT_LOCALE;
  }
  // localize existing dom
  localizeDOM(document.body);
}

function localizeDOM(node) {
  function convertToText(elCollection) {
    let out = [];
    let i, el;
    for (i = 0; i < elCollection.length; i += 1) {
      out.push(elCollection[i].outerHTML);
    }
    return out;
  }
  // translate title attributes
  // translate free text
  var textNodes = node.querySelectorAll("[data-text]");
  var altNodes = node.querySelectorAll("[data-alt]");
  var titleNodes = node.querySelectorAll("[data-title]");
  textNodes.forEach(function (el) {
    var key = el.dataset.text;
    el.innerHTML = tr(key);
  });
  altNodes.forEach(function (el) {
    var key = el.dataset.alt;
    el.alt = tr(key);
  });
  titleNodes.forEach(function (el) {
    var key = el.dataset.title;
    el.title = tr(key);
  });
}

function resolve(stringID) {
  return translations[locale][stringID]
    ? translations[locale][stringID]
    : translations[DEFAULT_LOCALE][stringID]
      ? translations[DEFAULT_LOCALE][stringID]
      : stringID;
}
/**
 * Translates a string by referencing a hash of translated strings.
 * If the lookup fails, the string ID is used.
 * Arguments after the String ID are substituted for substitution tokens in
 * the looked up string.
 * Substitution tokens can have the form "%@" or "%@" followed by a single digit.
 * Substitution parameters with no digit are substituted sequentially.
 * So, tr('%@, %@, %@', 'one', 'two', 'three') returns 'one, two, three'.
 * Substitution parameters followed by a digit are substituted positionally.
 * So, tr('%@1, %@1, %@2', 'baa', 'black sheep') returns 'baa, baa, black sheep'.
 * If there are not substitution parameters, or not one for the expected position,
 * then the string is not modified.
 *
 * @param sID {{string}} a string id
 * @param args an array of strings or variable sequence of strings
 * @returns {string}
 */
function tr(sID, args) {
  function replacer(match) {
    if (match.length === 2) {
      return args && args[ix] != null ? args[ix++] : match;
    } else {
      return args && args[Number(match[2]) - 1] != null
        ? args[Number(match[2]) - 1]
        : match;
    }
  }

  if (typeof args === "string") {
    args = [args];
  }

  let s = resolve(sID);
  let ix = 0;
  return s.replace(/%@[0-9]?/g, replacer);
}

export { init, tr };
