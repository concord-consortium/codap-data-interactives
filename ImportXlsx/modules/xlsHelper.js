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
/*global XLSX */


function parseArrayBuffer(ab) {
  var data = new Uint8Array(ab);
  var workbook = XLSX.read(data, {type: "array"});
  if (workbook) {
    var firstSheetName = workbook.SheetNames[0];
    var firstSheet = firstSheetName && workbook.Sheets[firstSheetName];
    if (firstSheet) {
      var table = XLSX.utils.sheet_to_json(firstSheet, {header: 1})
      return table;
    }
  }
}

export {
  parseArrayBuffer
}