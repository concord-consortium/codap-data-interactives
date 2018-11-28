// ==========================================================================
//  
//  Author:   jsandoe
//
//  Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.
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
/**
 *
 * Configuration properties.
 */
app.config = {
  /*
   * The following declarations are specific to the data set.
   * Should consider moving to separate json.
   */
  attributeGroups : [
    {number : 1, open : false, title : "Basic demographics"},
    {number : 2, open : false, title : "Race, ancestry, origin"},
    {number : 3, open : false, title : "Work and employment"},
    {number : 4, open : false, title : "Income"},
    {number : 5, open : false, title : "Geography"},
    {number : 6, open : false, title : "Technical"}
  ],

  attributeAssignment: [
    {ipumsName: 'AGE', title: 'age', group: 1, defCheck: true},
    {ipumsName: 'SEX', title: 'sex', group: 1, defCheck: true},
    {ipumsName: 'MARST', title: 'marital status', group: 1, defCheck: false},
    {ipumsName: 'NCHILD', title: 'own children', group: 1, defCheck: false},
    {ipumsName: 'FERTYR', title: 'children in past year', group: 1, defCheck: false},
    {ipumsName: 'EDUC', title: 'education', group: 1, defCheck: false},
    {ipumsName: 'RACE', title: 'race', group: 2, defCheck: false},
    {ipumsName: 'RACESING', title: 'singular race', group: 2, defCheck: false},
    {ipumsName: 'HISPAN', title: 'hispanic', group: 2, defCheck: false},
    {ipumsName: 'CITIZEN', title: 'citizenship', group: 2, defCheck: false},
    {ipumsName: 'YRIMMIG', title: 'year of immigration', group: 2, defCheck: false},
    {ipumsName: 'BPL', title: 'birthplace', group: 2, defCheck: false},
    {ipumsName: 'SPEAKENG', title: 'speak English', group: 2, defCheck: false},
    {ipumsName: 'EMPSTAT', title: 'employment', group: 3, defCheck: false},
    {ipumsName: 'LABFORCE', title: 'labor force', group: 3, defCheck: false},
    {ipumsName: 'CLASSWKR', title: 'worker class', group: 3, defCheck: false},
    {ipumsName: 'UHRSWORK', title: 'working hours', group: 3, defCheck: false},
    {ipumsName: 'WKSWORK2', title: 'working weeks', group: 3, defCheck: false},
    {ipumsName: 'WORKEDYR', title: 'worked in year', group: 3, defCheck: false},
    {ipumsName: 'OCC1950', title: 'occupation 1950', group: 3, defCheck: false},
    {ipumsName: 'OCC2000', title: 'occupation 2000', group: 3, defCheck: false},
    {ipumsName: 'IND1950', title: 'industry 1950', group: 3, defCheck: false},
    {ipumsName: 'IND2000', title: 'industry 2000', group: 3, defCheck: false},
    {ipumsName: 'INCTOT', title: 'income', group: 4, defCheck: false},
    {ipumsName: 'INCWAGE', title: 'wage income', group: 4, defCheck: false},
    {ipumsName: 'FTOTINC', title: 'family income', group: 4, defCheck: false},
    {ipumsName: 'INCEARN', title: 'earned income', group: 4, defCheck: false},
    {ipumsName: 'CPI99', title: 'adjusted income', group: 4, defCheck: false},
    {ipumsName: 'INCWELFR', title: 'welfare income', group: 4, defCheck: false},
    {ipumsName: 'POVERTY', title: 'percent of poverty', group: 4, defCheck: false},
    {ipumsName: 'REGION', title: 'region', group: 5, defCheck: false},
    {ipumsName: 'STATEFIP', title: 'state', group: 5, defCheck: true},
    {ipumsName: 'MIGRATE1', title: 'moved', group: 5, defCheck: false},
    {ipumsName: 'PERWT', title: 'person weight', group: 6, defCheck: false},
    {ipumsName: 'SLWT', title: 'sample line weight', group: 6, defCheck: false},
    {ipumsName: 'SELFWTSL', title: 'self weight', group: 6, defCheck: false},
    {ipumsName: 'YEAR', title: 'year', group: 6, format: 'categorical', defCheck: true}
  ]
};