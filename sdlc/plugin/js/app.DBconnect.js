/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 8:32 AM
 *
 * Created by Tim Erickson on 8/21/18 8:32 AM
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


app.DBconnect = {

  sendCommand: async function (iCommands) {
    let theBody = new FormData();
    for (let key in iCommands) {
      if (iCommands.hasOwnProperty(key)) {
        theBody.append(key, iCommands[key])
      }
    }
    theBody.append("whence", app.whence);

    app.addLog('Send request: ' + JSON.stringify(iCommands));
    let theRequest = new Request(app.constants.kBasePhpURL[app.whence],
        {method: 'POST', body: theBody, headers: new Headers()});

    try {
      const theResult = await fetch(theRequest);
      if (theResult && theResult.ok) {
        let result = await theResult.json();
        app.addLog('Good response: ' + (Array.isArray(result)?('rows='+result.length):''));
        return result;
      } else {
        console.error("sendCommand bad result error: " + theResult.statusText);
        app.addLog('Error response: /status,text/ [' +
            [theResult.status, theResult.statusText].join + ']');
      }
    } catch (msg) {
      console.log('fetch error in DBconnect.sendCommand(): ' + msg);
      app.addLog('Error response: ' + msg);
    }
  },

  getCasesFromDB: async function (iAtts, iStateCodes, iYears) {
    const tSampleSize = app.userActions.getSelectedSampleSize();

    iStateCodes = iStateCodes || [];
    iYears = iYears || [];
    let tAttNames = [];
    iAtts.forEach(a => tAttNames.push("`" + a.name + "`"));   //  iAtts is an array, we need a comma-separated string

    try {
      const theCommands = {
        c: "getCases",
        atts: 'sample_data',
        state_codes: iStateCodes.join(),
        years: iYears.join(),
        n: tSampleSize
      };
      return await app.DBconnect.sendCommand(theCommands);
    }

    catch (msg) {
      console.warn('getCasesFromDB() error: ' + msg);
    }

  },

  getDBInfo: async function (iType) {
    try {
      const theCommands = {"c": iType};
      return await app.DBconnect.sendCommand(theCommands);
    }

    catch (msg) {
      console.log(iType + ' getDBInfo() error: ' + msg);
    }
  }

};