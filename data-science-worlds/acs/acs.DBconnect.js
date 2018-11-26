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


acs.DBconnect = {

    sendCommand: async function (iCommands) {
        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", acs.whence);

        let theRequest = new Request(
            acs.constants.kBasePhpURL[acs.whence],
            {method: 'POST', body: theBody, headers: new Headers()}
        );

        try {
            const theResult = await fetch(theRequest);
            if (theResult.ok) {

                const theJSON = theResult.json();
                return theJSON;
            } else {
                console.error("sendCommand bad result error: " + theResult.statusText);
            }
        }
        catch (msg) {
            console.log('fetch error in DBconnect.sendCommand(): ' + msg);
        }
    },

    getCasesFromDB : async function(iAtts) {
        const tSampleSize = document.getElementById("sampleSizeInput").value;

        let tAttNames = [];
        iAtts.forEach( a => tAttNames.push("`" + a.name + "`" ));   //  iAtts is an array, we need a comma-separated string

        try {
            const theCommands = {"c": "getCases", "atts": "," + tAttNames.join(','), "n" : tSampleSize};
            const iData = await acs.DBconnect.sendCommand(theCommands);
            return iData;
        }

        catch (msg) {
            console.log('getCasesFromDB() error: ' + msg);
        }

    },

    getDBInfo : async function( iType ) {
        try {
            const theCommands = {"c": iType };
            const iData = await acs.DBconnect.sendCommand(theCommands);
            return iData;
        }

        catch (msg) {
            console.log( iType + ' getDBInfo() error: ' + msg);
        }
    }

};