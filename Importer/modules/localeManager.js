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
import defaultStrings from './strings/strings-en.js';
const DEFAULT_LOCALE = 'en';
const varRegExp = /%@/g
let locale = DEFAULT_LOCALE;
let translations = {};

function getQueryParam(s) {
  return new URLSearchParams(window.location.search).get(s);
}

function importLocale (locale) {
  translations[locale] = null;
  return import(`./strings/strings-${locale}.js`).then(
      (s) => {
        translations[locale] = s.default;
      },
      (msg) => {
        console.log(`Importing "${locale}": ${msg}`);
      }
  )
}

async function init() {
  translations[DEFAULT_LOCALE] = defaultStrings;
  locale = getQueryParam('lang').toLowerCase() || DEFAULT_LOCALE;
  if (locale && locale !== DEFAULT_LOCALE) {
    await importLocale(locale)
    if (!translations[locale]) {
      locale = DEFAULT_LOCALE;
    }
  }
  localizeDOM(document.body);
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
  lang = (lang == null)?locale:lang.toLowerCase();
  if (vars && !Array.isArray(vars)) { vars = [vars];}
  let translation = translations[lang] != null ? translations[lang][key] : undefined
  if ((translation == null)) { translation = key }
  return vars==null?translation:translation.replace(varRegExp, function() {
    return vars.shift();
  })
}

export {init, loc};
