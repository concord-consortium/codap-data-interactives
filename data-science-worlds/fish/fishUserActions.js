/*
==========================================================================

 * Created by tim on 4/20/18.
 
 
 ==========================================================================
fishUserActions in fish

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

/**
 * Methods that respond directly to user actions.
 *
 * @type {{pressNameButton: fish.userActions.pressNameButton, clickJoinButton: fish.userActions.clickJoinButton, startNewGame: (function(): Promise<any>), joinGame: fish.userActions.joinGame, catchFish: fish.userActions.catchFish, chairEndsTurn: fish.userActions.chairEndsTurn, foo: fish.userActions.foo}}
 */
fish.userActions = {

    /**
     * User pressed the button to submit their name.
     *
     * @param iSituation
     */
    pressNameButton: function (iSituation) {
        //  could check for duplicates?
        let tPlayerNameBox = document.getElementById("playerName");

        switch (iSituation) {

            case 'have':    //  used to be used for logout.
                fish.state.playerName = null;
                tPlayerNameBox.innerHTML = "";
                break;

            case 'need':
                let tName = tPlayerNameBox.value;     //  from the UI
                if (tName && tName.length > 0) {
                    fish.state.playerName = tName;
                } else {
                    alert('You need a player name');
                }
                $("#weHaveName").html("Player: <b>" + fish.state.playerName + "</b>");
                break;
        }

        fish.ui.update();
    },

    /**
     * User clicked to button to join a game.
     *
     * @param iJoinOrNew
     * @returns {Promise<void>}
     */
    clickJoinButton: async function (iJoinOrNew) {
        //  set the level of any new game
        let tLevel = $('#gameLevelMenu').find('option:selected').text();
        fish.setLevel(tLevel);

        try {
            if (iJoinOrNew === 'join') {
                const theText = $("#gameCodeTextField").val();
                console.log('new game name text = ' + theText);
                await fish.userActions.joinGame(theText);
            } else {
                //  we are making a new game and then joining it.
                const iGameCode = await fish.userActions.startNewGame();    //  make new game, get its code.
                fish.setNotice("The new game is named <b>" + iGameCode + "</b>");
                await fish.userActions.joinGame(fish.state.gameCode);       //  join it!
            }
        }
        catch (msg) {
            console.log('clickJoinButton() error: ' + msg);
        }
    },

    /**
     * User has decided to start a brand new game, clicked new game button
     *
     * @returns {Promise<any>}
     */
    startNewGame: async function () {

        try {
            const tGameData = {
                "onTurn": fish.game.openingTurn,
                "population": fish.game.openingPopulation,
                "gameState": fish.constants.kInProgressString,
                "config": fish.state.config
            };
            const tNewGame = await fish.phpConnector.startNewGame(tGameData);

            if (tNewGame.gameCode) {
                fish.state.gameCode = tNewGame.gameCode;    //  not joined, but the game exists.
                $('#gameCodeTextField').val(fish.state.gameCode);      //  put the code into the box as a default
                console.log("The new game is named " + fish.state.gameCode);
                //  we are still waiting (because we have not joined), but we know the date:
                fish.state.turn = Number(tNewGame.turn);
                fish.state.gameTurn = Number(tNewGame.turn);
                return (fish.state.gameCode);
            } else {
                console.log('NO GAME CODE!');
                return null;
            }
        } catch (msg) {
            console.log('user action startNewGame() error: ' + msg);
        }
    },

    /**
     * User is joining a new game, either because of clicking Join or New.
     *
     * @param iGameCode
     * @returns {Promise<void>}
     */
    joinGame: async function (iGameCode) {
        try {
            const iGame = await fish.phpConnector.validateGameCode(iGameCode);
            if (iGame) {
                if (iGame.gameState !== fish.constants.kInProgressString) {
                    alert('You cannot join ' + iGameCode);
                    throw('You cannot join ' + iGameCode);
                }
            } else {
                fish.state.gameCode = null;
                $('#gameCode').val("");      //  put blank into the box
                alert('You need a valid game code');
                throw('You need a valid game code');
            }

            const iJoinResult = await fish.phpConnector.joinGame(iGame);
            await fish.CODAPConnector.deleteAllTurnRecords();       //  clean for the new game.

            console.log("In joinGame(), connector.joinGame resolved with " + JSON.stringify(iJoinResult));

            fish.setLevel(iJoinResult.config);
            fish.state.gameCode = iJoinResult.gameCode;
            fish.state.gameState = iJoinResult.gameState;
            fish.state.gameTurn = iJoinResult.turn;
            fish.state.turn = fish.state.gameTurn;
            fish.state.playerState = fish.constants.kFishingString;
            fish.state.balance = fish.game.openingBalance;

            fish.state.gameCodeList.push(fish.state.gameCode);

            if (iJoinResult.newPlayer) {
                fish.setNotice(fish.strings.successfullyJoinedText + "<b>" + fish.state.gameCode
                    + "</b>!<br>" + fish.strings.enterAndPressCatchText);
            } else {
                fish.setNotice("Rejoined <b>" + fish.state.gameCode
                    + "</b>!<br>" + fish.strings.enterAndPressCatchText);
            }

            //  start polling when you join!
            if (fish.constants.kUsingTimer) {
                setTimeout(fish.doTimer, fish.constants.kTimerInterval);
            }

            fish.fishUpdate();
            $('#gameCodeTextField').val("");      //  empty the box for the game code.

            return (iJoinResult);       //  return the valid game (with a newPlayer field)
        }

        catch (msg) {
            console.log('joinGame() error: ' + msg);
        }
    },

    catchFish: async function () {

        let tSought = Number($("#howManyFish").val());

        if (tSought > fish.game.boatCapacity) {
            alert("Your boat will only carry " + fish.game.boatCapacity + ". ");
            $("#howManyFish").val(fish.game.boatCapacity);
            return;
        }

        if (tSought < 0) {
            alert("You can't catch negative fish! ");
            $("#howManyFish").val(0);
            return;
        }

        $("#catchButton").hide();       //  hide immediately after pressing the button

        if (fish.state.turn < fish.state.gameTurn) {         //  odd occurrence
            fish.state.turn = fish.state.gameTurn;
            alert("Your turn number was somehow too low. Let Tim know. We'll catch you up for now.");
        }

        if (fish.readyToCatch()) {
            fish.state.playerState = fish.constants.kSellingString;     //  set the player state to selling

            const tCatchModelResult = await fish.model.catchFish(tSought);

            await fish.phpConnector.newCatchRecord(tCatchModelResult);  //  record in the MySQL database, resolves to the number caught (which we don't need)
            await fish.CODAPConnector.addSingleFishItemInCODAP(tCatchModelResult);  //  record in the CODAP table, partial record :)

            fish.state.currentTurnResult = tCatchModelResult;
            //  await fish.CODAPConnector.updateFishItemInCODAP("from catch");    //  record in the CODAP table

        } else {
            fish.debugThing.html('Gotta wait for everybody else!');
        }
    },

    chairEndsTurn: async function () {
        console.log("---- chairEndsTurn ---------");
        let tGame, tTurns, tPlayers;

        let gamePromise = fish.phpConnector.getGameData();
        let turnsPromise = fish.phpConnector.getTurnsData();        //  just for this turn
        let playersPromise = fish.phpConnector.getPlayersData();

        $("#chairEndsTurnButton").hide();

        [tGame, tTurns, tPlayers] = await Promise.all([gamePromise, turnsPromise, playersPromise]);

        if (fish.state.OKtoEndTurnObject.OK) {           //  everybody OK to move on?
            const tUpdateResult = fish.model.updateTotalPopulation(tGame, tPlayers, tTurns);  //   update the model. fast. synchronous.

            //  send the resulting game info to be updated in the DB
            const iData = await fish.phpConnector.endTurnForAll(tUpdateResult);
            fish.setNotice(iData);
        } else {
            alert('Not ready to move on. Year: ' + tGame.turn + ' Missing: ' + fish.state.OKtoEndTurnObject.missing.join(','));
            fish.setNotice('Did not advance! Maybe we are still waiting for a player.');
        }
    },

    foo: function () {

    }

};