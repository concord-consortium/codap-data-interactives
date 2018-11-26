/*
==========================================================================

 * Created by tim on 8/24/18.


 ==========================================================================
DBconnect in journal

Author:   Tim Erickson

Copyright (c) 2018 by The Concord Consortium, Inc. All rights reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
==========================================================================

*/

univ.DBconnect = {

    sendCommand: async function (iCommands) {
        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", univ.whence);

        let theRequest = new Request(
            nos2.kBasePhpURL[univ.whence],
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

    saveNewResult : async function(iResult) {
        try {
            const theCommands = {
                "c" : "saveNewResult",
                data : JSON.stringify(iResult.data),
                teamID : iResult.teamID,
                source : iResult.source,
                epoch : iResult.epoch
            };
            const out = await univ.DBconnect.sendCommand(theCommands);   //  "out" should be the last insert ID.
            return (out === 0 ? null : out);
        } catch (m) {
            console.log('saveNewResult() error: ' + m);
        }
    },


    /**
     * Save the current DataPack IN THE MYSQL
     */
    saveCurrentSnapshot : async function() {
        let theResultDBISs = [];
        univ.currentSnapshot.theResults.forEach( r => {
            theResultDBISs.push(r.dbid);
        });
        //  (we do not send the results, just their dbids)

        const theCommands = {
            "c" : "saveSnapshot",
            "v" : JSON.stringify({
                "resultsList": JSON.stringify(theResultDBISs),
                "worldID": univ.state.worldID,
                "teamID": univ.state.teamID,
                "figure": univ.currentSnapshot.theFigure,
                "figureWidth" : univ.currentSnapshot.figureWidth,
                "figureHeight" : univ.currentSnapshot.figureHeight,
                "format": univ.currentSnapshot.theFormat,
                "caption": univ.currentSnapshot.theCaption,
                "notes": univ.currentSnapshot.theNotes,
                "title": univ.currentSnapshot.theTitle,
            })
        };
        const out = await univ.DBconnect.sendCommand(theCommands);
        return (out === 0 ? null : out);
    },

    /**
     * Get information on the world code,
     * If it does not exist, return null
     * @param iWorldCode    the world code to be tested
     * @returns {Promise<void>}
     */
    getWorldData: async function (iWorldCode) {
        try {
            const theCommands = {"c": "getWorldData", "code": iWorldCode};
            const out = await univ.DBconnect.sendCommand(theCommands);
            return out.length === 0 ? null : out[0];
        }

        catch (msg) {
            console.log('getWorldData() error: ' + msg);
        }
    },

    getTeamsInWorld : async function (iWorldID) {
        if (iWorldID) {
            try {
                const theCommands = {"c": "getMyTeams", "w": iWorldID};
                const out = await univ.DBconnect.sendCommand(theCommands);
                return out.length === 0 ? null : out;
            } catch (msg) {
                console.log('getMyTeams() error: ' + msg);
            }
        } else {
            return null;
        }

    },

    getKnownResults : async function() {
        if (univ.state.worldID && univ.state.teamID) {
            let DBout = null;
            let resultsOut = [];
            try {
                DBout = await univ.DBconnect.sendCommand({"c": "getKnownResults", "w": univ.state.worldID, "t": univ.state.teamID});

                //  convert JSON strings in "data" to be part of the object.
                DBout.forEach( result => {
                    const theDataFields = JSON.parse(result.data);
                    const aKnownResult = new Result(theDataFields, {source : result.source, teamID : result.teamID, epoch : result.epoch, dbid : result.dbid});
                    resultsOut.push(aKnownResult);
                });
                return resultsOut.length === 0 ? null : resultsOut;

            } catch (msg) {
                console.log('getResults() error: ' + msg);
            }
        } else {
            return null;
        }

    },

    getPapers: async function (iWorldID, iTeamID) {
        if (iWorldID && iTeamID) {
            let out = null;
            try {
                out = await univ.DBconnect.sendCommand({"c": "getPapers", "w": iWorldID, "t": iTeamID});
                return out.length === 0 ? null : out;

            } catch (msg) {
                console.log('getPapers() error: ' + msg);
            }
        } else {
            return null;
        }

    },

    assertKnowledge : async function( iResultID ) {
        await univ.DBconnect.sendCommand({
            c : "assertKnowledge",
            r : iResultID,
            w : univ.state.worldID,
            t : univ.state.teamID
        })
    }


};