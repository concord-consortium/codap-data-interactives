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
define(function() {
  var DEFAULT_LOCALE = 'en-us';
  var varRegExp = /%@/g;
  var stringFileURL = './src/strings.json';

  var locale;
  var translations = {};

  function getQueryParam(s) {
    return new URLSearchParams(window.location.search).get(s);
  }


  async function init() {
    return fetch(stringFileURL)
        .then(function (response) { return response.json();})
        .then(function (data) {
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
    var textNodes = node.querySelectorAll('[data-text]');
    var altNodes = node.querySelectorAll('[data-alt]');
    var titleNodes = node.querySelectorAll('[data-title]');
    textNodes.forEach(function (el) {
      var key = el.dataset.text;
      el.innerHTML = tr(key);
    });
    altNodes.forEach(function (el) {
      var key = el.dataset.alt;
      el.alt =tr(key);
    });
    titleNodes.forEach(function (el) {
      var key = el.dataset.title;
      el.title=tr(key);
    });
  }


  function tr(key, vars, lang) {
    // if lang present convert it to lower case, if not set it to the locale.
    lang = (!lang || !translations[lang]) ? locale : lang.toLowerCase();
    if (vars && !Array.isArray(vars)) {
      vars = [vars];
    }
    var translation = translations[lang][key] || translations[DEFAULT_LOCALE][key] || key;
    return vars == null ? translation : translation.replace(varRegExp,
        function () {
          return vars.shift();
        });
  }
  return {
    init: init,
    tr: tr
  };
});
