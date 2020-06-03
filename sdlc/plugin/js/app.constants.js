/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:18 AM
 *
 * Created by Tim Erickson on 8/21/18 9:18 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */
let constants = {
  version: "v0005",

  metadataURL: './assets/data/metadata.json',

  kACSDataSetName: "US Microdata",
  kACSDataSetTitle: "US Microdata",
  kTopCollectionName: "places",
  kACSCollectionName: "people",
  kACSCaseTableName: "People",

  // kBasePhpURL: {
  //   local: "http://localhost/~jsandoe/codap-data-interactives/sdlc/service/acs.php",
  //   concord: "https://codap.concord.org/sdlc/service/acs.php"
  // },
  //
  kMinCases: 0,
  kMaxCases: 1000,
  kDefaultSampleSize: 100
};

export {constants};
