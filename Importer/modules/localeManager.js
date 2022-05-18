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
const DEFAULT_LOCALE = 'en-us';
const varRegExp = /%@/g
let locale;
let translations = {};

function getQueryParam(s) {
  return new URLSearchParams(window.location.search).get(s);
}

async function init() {
  return fetch('./modules/strings.json')
      .then((response) => response.json())
      .then((data) => {
        translations = data;
        locale = getQueryParam('lang').toLowerCase();
        if (!(locale && translations[locale])) {
          locale = DEFAULT_LOCALE;
        }
        // localize existing dom
        localizeDOM(document.body);
      });
}

function localizeDOM(node) {
  // translate title attributes
  // translate free text
  let textNodes = node.querySelectorAll('[data-text]');
  textNodes.forEach((el) => {
    let key = el.dataset['text'];
    el.appendChild(document.createTextNode(loc(key)));
  });
}


function loc(key, vars, lang) {
  // if lang present convert it to lower case, if not set it to the locale.
  lang = (!lang|| !translations[lang])?locale:lang.toLowerCase();
  if (vars && !Array.isArray(vars)) { vars = [vars];}
  let translation = translations[lang][key]
      || translations[DEFAULT_LOCALE][key]
      || key;
  return vars==null?translation:translation.replace(varRegExp, function() {
    return vars.shift();
  })
}

export {init, loc};
