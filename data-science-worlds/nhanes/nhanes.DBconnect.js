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


nhanes.DBconnect = {

    sendCommand: async function (iCommands) {
        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", nhanes.whence);

        let theRequest = new Request(
            nhanes.constants.kBasePhpURL[nhanes.whence],
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

    getCasesFromDB : async function(iAtts, iAgeClauses) {
        const tSampleSize = document.getElementById("sampleSizeInput").value;

        let tAttNames = [];
        let tTableIDs = [];
        let tJoinSet = [];


        iAtts.forEach( a => {
            tAttNames.push( a.queryName  );
            const tablePhrase = nhanes.attributeGroups[a.groupNumber - 1].name + " as t" + a.groupNumber;
            if (!tTableIDs.includes(tablePhrase)) {
                tTableIDs.push(tablePhrase);
                if (a.groupNumber !== 1) {
                    tJoinSet.push( "t1.SEQN = t" + a.groupNumber + ".SEQN");
                }
            }
        });   //  iAtts is an array, we need a comma-separated string

        tJoinSet = tJoinSet.concat(iAgeClauses);

        try {
            const theCommands = {
                "c": "getCases",
                "atts": tAttNames.join(','),
                "tables" : tTableIDs.join(","),
                "joins" : tJoinSet.join(" AND "),
                "n" : tSampleSize
            };
            const iData = await nhanes.DBconnect.sendCommand(theCommands);
            return iData;
        }

        catch (msg) {
            console.log('getCasesFromDB() error: ' + msg);
        }

    },

    getDBInfo : async function( iType ) {
        try {
            const theCommands = {"c": iType };
            const iData = await nhanes.DBconnect.sendCommand(theCommands);
            return iData;
        }

        catch (msg) {
            console.log( iType + ' getDBInfo() error: ' + msg);
        }
    }

};