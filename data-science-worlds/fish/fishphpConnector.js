/*
==========================================================================

 * Created by tim on 4/19/18.
 
 
 ==========================================================================
fishPHP in fish

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

/*  testing stuff

var FD = new FormData();
FD.append('c', 'foo');
var REQ = new Request("http://localhost:8888/fish/fish.php", {method: 'POST', body: FD });
var RES = fetch(REQ);


var FD = new FormData();
FD.append('results', '10');
let REQ = new Request('https://randomuser.me/api/', {method : 'POST', body : FD})
let RES = fetch(REQ);


var res = fetch('http://localhost:8888/fish/fish.php?c=foo')

 */

/**
 * This singleton is responsible for all communications between the plugin and php
 * (which in turn communicates with MySQL)
 *
 * @type {{sendCommand: fish.phpConnector.sendCommand, getGameData: fish.phpConnector.getGameData, getPlayersData: (function(): Promise<any>), getMyTurns: fish.phpConnector.getMyTurns, getOneTurn: fish.phpConnector.getOneTurn, getMyData: (function(): Promise<any>), getTurnsData: fish.phpConnector.getTurnsData, getTurnsFromGame: fish.phpConnector.getTurnsFromGame, startNewGame: (function(*): Promise<any>), joinGame: fish.phpConnector.joinGame, validateGameCode: fish.phpConnector.validateGameCode, checkToSeeIfOKtoEndTurn: (function(): *), endTurnForAll: fish.phpConnector.endTurnForAll, newCatchRecord: fish.phpConnector.newCatchRecord}}
 */
fish.phpConnector = {

    /**
     * This function is the only place in this file that actually communicates with php, via the fetch command.
     *
     * @param iCommands     The commands to send. This is an object whose keys (string) are the commands in php, and the values are the values.
     * @returns {Promise<any>}
     */
    sendCommand: async function (iCommands) {
        const theCommand = iCommands.c;

        let theBody = new FormData();
        for (let key in iCommands) {
            if (iCommands.hasOwnProperty(key)) {
                theBody.append(key, iCommands[key])
            }
        }
        theBody.append("whence", fish.whence);      //  here is where the JS tells the PHP which server we're on.

        const theURL = fish.constants.kBaseURL[fish.whence];

        //  console.log("sendCommand url:" + theURL);       //  debug
        let theRequest = new Request(
            theURL,
            {method: 'POST', body: theBody, headers: new Headers()}
            //{method: 'POST', body: theBody, headers: {"Content-Type": "application/json; charset=utf-8"}}
        );

        try {
            //console.log("    working on " + theCommand);
            const theResult = await fetch(theRequest);
            if (theResult.ok) {
                const theJSON = await theResult.json();
                //console.log("    " + theCommand + " returns " + JSON.stringify(theJSON));
                return theJSON;
            } else {
                console.error("sendCommand error: " + theResult.statusText);
            }
        }
        catch (msg) {
            console.log('fetch sequence error: ' + msg);
        }
    },

    getGameData: async function () {
        try {
            const theCommands = {"c": "gameData", "gameCode": fish.state.gameCode};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;
        }

        catch (msg) {
            console.log('get game data error: ' + msg);
        }
    },

    /**
     * Get the mySQL data for ALL of the players in this game
     *
     * @returns {Promise<any>}
     */
    getPlayersData: async function () {

        try {
            const theCommands = {"c": "playersData", "gameCode": fish.state.gameCode};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;
        }
        catch (msg) {
            console.log('get players data error: ' + msg);
        }
    },

    getMyTurns: async function () {
        try {
            const theCommands = {"c": "myTurns", "gameCode": fish.state.gameCode, "playerName": fish.state.playerName};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;

        } catch (msg) {
            console.log('get my turns error: ' + msg);
        }

    },

    getOneTurn: async function (iYear) {
        try {
            console.log('   gonna getOneTurn() from DB for ' + iYear);
            const theCommands = {
                "c": "oneTurn",
                "year": iYear,
                "gameCode": fish.state.gameCode,
                "playerName": fish.state.playerName
            };
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;
        }
        catch (msg) {
            console.log('get my turns error: ' + msg);
        }

    },

    getMyData: async function () {
        try {
            const theCommands = {"c": "myData", "gameCode": fish.state.gameCode, "playerName": fish.state.playerName};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData[0];
        }
        catch (msg) {
            console.log('get my data error: ' + msg);
        }
    },

    getTurnsData: async function () {

        try {
            const theCommands = {"c": "turnsData", "gameCode": fish.state.gameCode, "onTurn": fish.state.gameTurn};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;
        }
        catch (msg) {
            console.log('get turns error: ' + msg);
        }
    },

    getTurnsFromGame: async function (iGameCode) {

        console.log("in getTurnsFromGame(" + iGameCode + ")");
        try {
            const theCommands = {"c": "historicalTurnsData", "gameCode": iGameCode};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;
        }
        catch (msg) {
            console.log('getTurnsFromGame  error: ' + msg);
        }
    },

    startNewGame: async function (iGameData) {

        try {
            const theCommands = iGameData;
            theCommands.chair = fish.state.playerName;
            theCommands.c = "newGame";
            const iData = await
                fish.phpConnector.sendCommand(theCommands);
            fish.state.isChair = true;        //  YOU are the isChair of this game
            console.log("New game code: " + iData.gameCode);
            return iData;
        }
        catch (msg) {
            console.log('startNewGame error: ' + msg);
        }
    },

    /**
     * The game is valid, so all we have to do is add the player record.
     * @param iValidGame
     * @returns {Promise}
     */
    joinGame: async function (iValidGame) {
        try {
            const theCommands = {
                "c": "joinGame",
                "gameCode": iValidGame.gameCode,
                "onTurn": iValidGame.turn,
                "playerName": fish.state.playerName,
                "balance": fish.game.openingBalance
            };

            const iData = await fish.phpConnector.sendCommand(theCommands);
            iValidGame['newPlayer'] = iData.newPlayer;
            return (iValidGame);
        }

        catch (msg) {
            console.log('connector.joinGame error: ' + msg);
        }
    },

    validateGameCode: async function (iCode) {
        try {
            const theCommands = {"c": "gameData", "gameCode": iCode};
            const iData = await fish.phpConnector.sendCommand(theCommands);
            return iData;
        }
        catch (msg) {
            console.log('validate Game Code error: ' + msg);
        }
    },


    checkToSeeIfOKtoEndTurn: async function () {

        let theCommands = {"c": "endTurnCheck", "gameCode": fish.state.gameCode};
        let tResult = null;

        try {
            tResult = await fish.phpConnector.sendCommand(theCommands);
        }
        catch (msg) {
            console.log('checkToSeeIfOKtoEndTurn error: ' + msg);
        }

        return tResult;
    },

    endTurnForAll: async function (iUpdateResult) {

        try {
            const gameRecordCommands = {
                "c": "newTurn",
                "gameCode": fish.state.gameCode,
                "gameState": iUpdateResult.gameState,
                "newPopulation": iUpdateResult.newPop,
                "oldYear": fish.state.gameTurn,
                "reason": iUpdateResult.reason
            };

            await fish.phpConnector.sendCommand(gameRecordCommands);

            console.log("Updating from year " + fish.state.gameTurn + " because " + iUpdateResult.reason);

            //  next, set up the promises to update the turns with price, balances, etc
            //  side effect: the php will also update the players' balances

            //  note, we are looking only at the current turn...

            let endTurnPromises = [];

            iUpdateResult.turns.forEach(t => {
                let oneTurnCommand = {
                    "c": 'updateOneTurnRecord',
                    "gameCode": t.gameCode,
                    "playerName": t.playerName,
                    "unitPrice": t.unitPrice,
                    "income": t.income,
                    "balanceAfter": t.balanceAfter,
                    "onTurn": fish.state.turn
                };
                endTurnPromises.push(fish.phpConnector.sendCommand(oneTurnCommand));
            });

            await Promise.all(endTurnPromises);     //  no relevant results get returned

            return (fish.strings.completedAllUpdates + fish.state.turn);
        }
        catch (msg) {
            console.log('fishphpConnector.endTurnForAll() error: ' + msg);
        }
    },

    newCatchRecord: async function (iModelResult) {

        try {
            const theCommands = {
                gameCode: fish.state.gameCode,
                playerName: fish.state.playerName,
                onTurn: fish.state.turn,
                visible: iModelResult.visible,
                sought: iModelResult.sought,
                caught: iModelResult.caught,
                balanceBefore: fish.state.balance,
                expenses: iModelResult.expenses,
                //  income: iModelResult.income,
                //  balanceAfter: iModelResult.after
            };

            theCommands.c = "newCatchRecord";

            const iData = await fish.phpConnector.sendCommand(theCommands);      //  returns {caught : 17}
            return iData;
        }
        catch (msg) {
            console.log('catch fish error: ' + msg);
        }

    },

};