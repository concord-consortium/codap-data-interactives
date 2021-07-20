/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
DB_Connect in journal

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

journal.DB_Connect = {

    sendCommand: async function (iCommands) {
        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", journal.constants.whence);

        let theRequest = new Request(
            journal.constants.kBasePhpURL[journal.constants.whence],
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
            console.log('fetch error in DB_Connect.sendCommand(): ' + msg);
        }
    },

    makeNewWorld: async function (iGodID, iWorldCode, iEpoch, iJournalName) {

        const tEpoch = (iEpoch ? Number(iEpoch) : 0 );

        try {
            const theCommands = {
                "c": "newWorld",
                "g": iGodID,
                "code": iWorldCode,
                "epoch": tEpoch,
                'jName': iJournalName
            };
            const iData = await journal.DB_Connect.sendCommand(theCommands);
            return iData;
        }

        catch (msg) {
            console.log('makeNewWorld() error: ' + msg);
        }

    },

    addTeam: async function (iWorld, iCode, iName) {
        try {
            const theCommands = {"c" : "addTeam", "w": iWorld, "code": iCode, "name": iName};
            const iData = await journal.DB_Connect.sendCommand(theCommands);
        }

        catch (msg) {
            console.log('addTeam() error: ' + msg);
        }
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
            const out = await journal.DB_Connect.sendCommand(theCommands);
            return out.length == 0 ? null : out[0];
        }

        catch (msg) {
            console.log('getWorldData() error: ' + msg);
        }
    },

    getMyWorlds: async function (iGod) {
        try {
            const theCommands = {"c": "getMyWorlds", "g": iGod};
            const out = await journal.DB_Connect.sendCommand(theCommands);
            return out.length == 0 ? null : out;
        } catch (msg) {
            console.log('getMyWorlds() error: ' + msg);
        }
    },

    getMyTeams: async function (iWorldID) {
        try {
            const theCommands = {"c": "getMyTeams", "w": iWorldID};
            const out = await journal.DB_Connect.sendCommand(theCommands);
            return out.length == 0 ? null : out;
        } catch (msg) {
            console.log('getMyTeams() error: ' + msg);
        }
    },

    getPapers: async function (iWorldID, iTeamID) {
        let out = null;
        try {
            out = await journal.DB_Connect.sendCommand({"c": "getPapers", "w": iWorldID, "t": iTeamID});
            return out.length == 0 ? null : out;

        } catch (msg) {
            console.log('getPapers() error: ' + msg);
        }

    },

    savePaper: async function (iAuthors, iTitle, iText, iAComments, iTeam, iPaperID) {
        let theCommands = {};
        try {
            if (iPaperID) {
                theCommands = {
                    "c": "updatePaper", "authors": iAuthors,
                    "title": iTitle, "text": iText, "team": iTeam, "ac": iAComments,
                    "id": iPaperID
                };
            } else {
                theCommands = {
                    "c": "newPaper",
                    "authors": iAuthors,
                    "title": iTitle,
                    "text": iText,
                    "team": iTeam,
                    "ac": iAComments,
                    "worldID": journal.state.worldID
                };
            }
            const out = await journal.DB_Connect.sendCommand(theCommands);

            return out;
        }

        catch (msg) {
            console.log('savePaper() error: ' + msg);
        }
    },

    submitPaper: async function (iPaperID, iNewStatus) {
        try {
            if (iPaperID) {
                theCommands = {"c": "submitPaper", "id": iPaperID, "s": iNewStatus};
                const iData = await journal.DB_Connect.sendCommand(theCommands);
                return iData;
            } else {
                alert("There is no 'current' paper to submit.");
            }
        }

        catch (msg) {
            console.log('submitPaper() error: ' + msg);
        }
    },

    judgePaper: async function (iPaperID, iJudgment, iEdComments) {
        try {
            let tStatus;
            switch (iJudgment) {
                case 'accept':
                    tStatus = journal.constants.kPaperStatusPublished;
                    break;
                case 'reject':
                    tStatus = journal.constants.kPaperStatusRejected;
                    break;
                case 'revise':
                    tStatus = journal.constants.kPaperStatusRevise;
                    break;
                default:
                    alert("Don't know how to handle a judgment of " + iJudgment);
                    break;
            }
            tSubmitted = 0;
            tPublished = (iJudgment == 'accept' ? 1 : 0);

            if (iPaperID) {
                theCommands = {"c": "judgePaper", "p": iPaperID, "s": tStatus, 'ec': iEdComments};
                const iData = await journal.DB_Connect.sendCommand(theCommands);
                return iData;
            } else {
                alert("There is no paper to submit.");
            }
        }

        catch (msg) {
            console.log('submitPaper() error: ' + msg);
        }

    },

    getGodData: async function (iUsername) {
        try {
            const out = await journal.DB_Connect.sendCommand({"c": "getGodData", "u": iUsername});
            if (out.length == 0) {
                return null;
            } else if (out.length == 1) {
                return out[0];
            } else {
                throw ("Too many people with the same username!");
            }
        } catch (e) {
            console.log('getGodData() error: ' + e);
        }
    },

    newGod: async function (iUsername) {
        try {
            const out = await journal.DB_Connect.sendCommand({"c": "newGod", "u": iUsername});
            return out;
        } catch (e) {
            console.log('newGod() error: ' + e);
        }
    },

    getPublishedJournal: async function () {
        try {
            const out = await journal.DB_Connect.sendCommand({"c": "getJournal", "w": journal.state.worldID});
            return out;
        } catch (e) {
            console.log('getPublishedJournal() error: ' + e);
        }

    }
};