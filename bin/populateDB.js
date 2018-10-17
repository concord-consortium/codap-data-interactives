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
 * Node program to populate the SDLC database with data
 */
var fs = require('fs');
var console = require('console');
var f = fs.readFileSync('data/usa_00001.dat', {encoding: 'utf8'});
var f1 = f && f.split(/\n\r?/);
var insertPrefix = "insert into peeps (year, state_code, weight, sample_data) values ";
var out = [];
var isFirst = true;
//console.log('Read ' + (f?f.length:0) + ' characters');
//console.log('Read ' + (f1?f1.length:0) + ' lines');
f1.forEach(function (line) {
  if (line.length > 0) {
    var sep = isFirst? '': ',\n';
    isFirst = false;
    var year = Number(line.slice(0,4));
    var state = Number(line.slice(31,33));
    var weight = Number(line.slice(40, 50))/100;
    out.push(insertPrefix + '(' + [year, state, weight, "'" + line + "'"].join() + ');\n');
  }
});
//out.push(';');
out = out.join('');
fs.writeFileSync('out.sql', out);