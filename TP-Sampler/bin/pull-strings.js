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
//
// A node executable to pull strings from the po editor and format as a
// translation map.
// A translation map is keyed by locale code, then by string id.
// This tool pulls a list of all the translations from the named project, then
// pulls each translation and filters by a prefix. Any locale with no values
// different from the default translation after filtering is omitted.
// The default locale is "en-us". The default project is the CODAP project. This
// tool is intended to provide translations for CODAP plugins, so the default
// prefix is "DG.plugin"
//

/**
 * This program reads all the available translation strings from the Po Editor
 * for a given project in all languages, filters the strings by a String ID prefix
 * and removing strings which have identical values as the default language and
 * writes a single file. The file is a two level hash with language id the top level keys
 * and string IDs the secondary keys.
 */
/*globals process:true */
import fetch from 'node-fetch';
import {readFile, writeFile} from 'fs/promises';

const progname = process.argv[1].replace(/^.*\//, '');
const usage = `usage: node ${progname} {--APIToken=api-token} {--out=outfile} {--prefix=stringIDPrefix}`;

const projectCode = 125447;
const defaultLocale = 'en-us';

const poAPIBase = 'https://api.poeditor.com/v2';
const poAPILanguageListEndpoint = '/languages/list';
const poAPITranslationRequestEndpoint = '/projects/export';
//const targetFilePath = `${process.cwd()}/modules/strings.json`;
let apiToken;
let stringIDPrefix = 'DG.plugin';
let outFile;

function makeAPITokenPhrase(token) { return `api_token=${token}`;}
function makeProjectPhrase(id) { return `id=${id}`;}
function makeLanguagePhrase(lang) {return `language=${lang}`;}
function makeTypePhrase() {return 'type=key_value_json';}

function stderr(msg) {
  process.stderr.write(msg.toString() + '\n');
}
/**
 * Readies the program for execution. Determines the API Token from
 * either the command line or the .porc, if found. Throws and exception
 * if none found.
 */
function configure(args) {
  return readFile(`${process.env.HOME}/.porc`, {encoding:'utf8'}).then((result) => {
      let lines = result.split('\n');
      lines.forEach(line => {
        if (line.startsWith('APIToken=') || line.startsWith('API_TOKEN=')) {
          let [,value] = line.split('=');
          apiToken = value;
        }
      });
      return Promise.resolve();
    },
    (msg) => {
      stderr(msg);
      return Promise.resolve();
    }
  ).then( ()=> {

    args.shift();
    args.shift();

    let arg = args.shift();
    while (arg) {
      if (arg.startsWith('--APIToken=')) {
        let [,value] = arg.split('=');
        apiToken = value;
      } else if (arg === '-a') {
        apiToken = args.shift();
      } else if (arg.startsWith('--prefix=')) {
        let [,value] = arg.split('=');
        stringIDPrefix = value;
      } else if (arg.startsWith('--out=')) {
        let [,value] = arg.split('=');
        outFile = value;
      } else {
        return Promise.reject(usage);
      }
      arg = args.shift();
    }

    if (apiToken == null) {
      return Promise.reject(`${progname}: No API Token. You must define an API token either on the command line or in $HOME/.porc`);
    }
  });

}
/**
 *
 * @param endpoint
 * @param body
 * @return {Promise<Object>} Returns the contents of the reply as a json object
 */
function fetchFromPo(endpoint, body) {
  const headers = {"Content-Type": "application/x-www-form-urlencoded"};
  return fetch(`${poAPIBase}${endpoint}`, {method: 'POST', headers: headers, body: body})
      .then(response => response.json());
}

/**
 * Fetches the list of translations.
 * @return {Promise<Object>}
 */
function fetchTranslationList() {
  const tokenPhrase = makeAPITokenPhrase(apiToken);
  const idPhrase = makeProjectPhrase(projectCode);
  let languageListRequest = `${poAPIBase}${poAPILanguageListEndpoint}`;
  stderr(`Fetching list of translations from ${languageListRequest}`);
  return fetchFromPo(poAPILanguageListEndpoint, [tokenPhrase, idPhrase].join('&'))
      .then((data) => {
        if (data.response.status === 'fail') {
          return Promise.reject(data.response.message);
        } else {
          return Promise.resolve(data.result);
        }
      });
}

/**
 * Requests, then fetches translation strings for a given language.
 *
 * @param languageDef {{ code: {string} }}
 * @return {Promise};
 */
function requestTranslationStrings(languageDef) {
  const body = [
      makeProjectPhrase(projectCode),
      makeAPITokenPhrase(apiToken),
      makeLanguagePhrase(languageDef.code),
      makeTypePhrase()
  ].join('&');
  stderr(`Requesting translation for ${languageDef.code} from ${poAPITranslationRequestEndpoint}`);
  return fetchFromPo(poAPITranslationRequestEndpoint, body)
      .then(reply => fetch(reply.result.url))
      .then(reply => reply.json())
      .then(json => {
        stderr(`Received translation for ${languageDef.code}`);
        return Promise.resolve([languageDef.code, json]);
      });
}

/**
 * Requests and fetches a set of translations, where the translations are
 * specified by a translation list passed in.
 * @param translationList {{
 *                            languages: [{
 *                                code: {string}
*                             }]
*                          }}
 * @return {promise<[{status:{string}, values:{object}}]>}
 */
function requestAllTranslationStrings(translationList) {
  let requests = translationList.languages.map(requestTranslationStrings);
  return Promise.allSettled(requests);
}

/**
 * Filters strings to select only those whose key starts with the specified
 * prefix and whose value does not exactly match the value in the default
 * translation.
 * @param translation
 * @param prefix
 * @param defaultTrans
 * @return {object}
 */
function filterStrings(translation, prefix, defaultTrans) {
  return Object.fromEntries(Object.entries(translation).filter((stringMappingEntry) => {
    const [id, value] = stringMappingEntry;
    return id.startsWith(prefix) && !(defaultTrans && value === defaultTrans[id]);
  }));
}

/**
 * Accepts a hashmap of translations, filters the strings in each, then filters
 * out empty translations and returns the result.
 * @param translations {Object}
 * @param prefix {string}
 * @param defaultLang {string}
 * @return {object}
 */
function filterTranslations(translations, prefix, defaultLang) {
  let defaultTrans = translations[defaultLang];
  stderr(`Filtering translations for prefix "${prefix}"`);
  return Object.fromEntries(Object.entries(translations).map((translationEntry) => {
    const [langID, translation] = translationEntry;
    let filteredTranslation = filterStrings(translation, prefix,
        (langID!==defaultLang)?defaultTrans:null);
    if (Object.keys(filteredTranslation).length > 0) {
      return [langID, filteredTranslation];
    } else {
      return null;
    }
  }).filter((entry) => entry));
}

/**
 * Runs the process.
 * @param args
 */
function main(args) {
  try {
    configure(args)
        .then(fetchTranslationList)
        .then(requestAllTranslationStrings)
        .then(results => Object.fromEntries(
            results.filter(result => result.status === 'fulfilled').map(
                result => result.value)))
        .then((translations) => {
          let filteredTranslations = filterTranslations(translations,
              stringIDPrefix, defaultLocale);
          let output = JSON.stringify(filteredTranslations, null, '  ') + '\n';
          if (outFile) {
            return writeFile(outFile, output);
          } else {
            return process.stdout.write(output);
          }
        })
        .catch(msg => {
          stderr(msg);
        });

  } catch (ex) {
    stderr(`${ex.message}\n` );
  }
}

main(process.argv);
