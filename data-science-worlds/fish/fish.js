/*
==========================================================================

 * Created by tim on 4/19/18.
 
 
 ==========================================================================
fish in fish

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
 * Top-level singleton, a global.
 *
 * @type {{whence: string, debugThing: null, state: null, FS: null, freshState: {language: null, gameCode: null, gameState: null, gameTurn: number, gameCodeList: Array, config: null, isChair: boolean, fishRecordsInCODAPAreOutOfDate: boolean, playerName: null, playerState: null, turn: number, balance: number, gameEndMessage: string, turnReport: string, currentTurnResult: null, autoCatch: boolean, autoChair: boolean, OKtoEndTurnObject: {OK: boolean}, timerCount: number}, game: null, initialize: fish.initialize, setLanguage: fish.setLanguage, setLevel: fish.setLevel, endGame: fish.endGame, startWaitingForNewGame: fish.startWaitingForNewGame, doTimer: fish.doTimer, fishUpdate: (function(): boolean), readyToCatch: fish.readyToCatch, setNotice: fish.setNotice, constants: {version: string, kTimerInterval: number, kUsingTimer: boolean, kBaseURL: {local: string, xyz: string, eeps: string}, kFishDataSetName: string, kFishDataSetTitle: string, kFishCollectionName: string, kHistoricalDataSetName: string, kHistoricalDataSetTitle: string, kHistoricalCollectionName: string, kInProgressString: string, kWonString: string, kLostString: string, kWaitingString: string, kSellingString: string, kFishingString: string, kBetweenString: string, foo: number}}}
 */
let fish = {

    whence: "local_concordRepository",        //  e.g., local, xyz, or eeps.
    debugThing: null,      //  UI element

    state: null,            //  object to hold the current state of the game. Very important.

    /**
     * An object about the game itself;
     * this is the game configuration, has stuff like default values.
     * Set in setLevel() below.
     */
    game: null,

    language : null,

    FS : null,          //  fish strings. One of its elements will become fish.strings, depending on language

    /**
     * A copy of fish.state to start with.
     * Some items get set in initialize()
     */
    freshState: {
        gameCode: null,     //  three-word nearly-unique code for each game
        gameState: null,    //  is the game in progress?
        gameTurn: 0,        //  what year is it in, according to the DB

        gameCodeList: [],

        config: null,       //  the NAME of the level. Used to set fish.game, which has the parameters.

        isChair: false,     //  this player is the "chair" of the game, that is, created it.
        fishRecordsInCODAPAreOutOfDate: false,
        playerName: null,       //  player's handle
        playerState: null,     //  fishing, selling, betweenGames
        turn: 0,                //  year we are in locally. Usually the same as state.gameTurn
        balance: 0,

        gameEndMessage: "Game over",
        turnReport: "News of your last fishing efforts!",

        currentTurnResult: null,

        autoCatch: false,       //  automation button checked for catching
        autoChair: false,       //  automation button checked for chairing (fish market)
        OKtoEndTurnObject: {OK : true},
        timerCount: 0,
    },

    /**
     * Set up initial values, initialize other objects with initializers.
     */
    initialize: function () {
        fish.setLanguageFromURL();
        fish.state = fish.freshState;       //  todo: implement saving and restoring

        fish.setLevel(fish.state.config);
        fish.state.gameState = fish.constants.kWaitingString;
        fish.state.playerState = fish.constants.kBetweenString;     //  not in a game until join
        fish.state.turn = fish.game.openingTurn;
        fish.CODAPConnector.initialize(null)
            .then(() => {
                    if (!fish.state.hasOwnProperty('gameCodeList')) {
                        fish.state.gameCodeList = [];
                    }
                }
            );

        this.debugThing = $('#debugSpan');
        fish.ui.initialize();
        fish.ui.update();
    },

    setLanguageFromURL : function() {
        let theLang = fish.constants.kInitialLanguage;

        const params = new URLSearchParams(document.location.search.substring(1));
        const lang = params.get("lang");

        if (lang) {
            theLang = lang;
        }
        fish.setLanguage(theLang);
    },


    /**
     * Set the UI language
     * @param iCode     two-letter language code, e.g., en, de, es.
     */
    setLanguage : function( iCode ) {
        fish.language = iCode;       //  put the thing in here to choose
        fish.strings = FS[iCode];
        FS.setBasicStrings();           //  replace strings in the UI

    },

    /**
     * Set the game's level, a.k.a. scenario.
     * This is stored in fish.state.config.
     *
     * @param iLevelName        the name of the level, e.g., albacore
     */
    setLevel: function (iLevelName) {
        if (iLevelName) {
            fish.state.config = iLevelName;
        } else {
            let theKey = null;
            for (var key in fish.fishLevels) {
                if (fish.fishLevels.hasOwnProperty(key)) {
                    if (fish.fishLevels[key].starter) {
                        theKey = key;
                    }
                }
            }
            fish.state.config = theKey;
        }
        fish.game = fish.fishLevels[fish.state.config];
    },

    /**
     * Called when the game has ended (called from fish.fishUpdate(), below).
     * Makes the historical data appear.
     *
     * @param iTheState     'won' or 'lost'
     * @returns {Promise<void>}
     */
    endGame: async function (iTheState) {

        switch (iTheState) {
            case 'won':
                console.log('you won!');
                break;
            case 'lost':
                console.log('you lost!');
                break;
        }
        await fish.historicalData.getHistoricalData();
        //  fish.ui.update();
    },

    /**
     * Called when a game is over and the dialog is displayed.
     * Sets quantities so that we are not playing a game, no one is chair, etc.
     */
    startWaitingForNewGame: function () {
        document.getElementById("automateCatchCheckbox").checked = false;   //  de-automate "catch"

        fish.state.gameState = fish.constants.kWaitingString;
        fish.state.playerState = fish.constants.kBetweenString;     //  not in a game until join
        fish.state.gameCode = null;
        fish.state.gameTurn = 0;
        fish.state.isChair = false;
        fish.state.turn = 0;
        fish.state.balance = 0;

        $("#gameCode").val("");         //  empty the code!
        fish.ui.update();
    },

    /**
     * Called periodically (fish.constants.kTimerInterval)
     * If a game is in progress, updates model and view.
     * @returns {Promise<void>}
     */
    doTimer: async function () {
        fish.state.timerCount++;
        let done = false;

        try {
            if (fish.state.gameCode && fish.state.playerName) {
                done = await fish.fishUpdate();     //  update the model
                await fish.ui.update();             //  update the view
            } else {
                fish.setNotice(fish.strings.waitingToStartText);
            }
        }
        catch (msg) {
            console.error("doTimer() timer error (fishUpdate())? " + msg);
        }

        if (!done) {
            setTimeout(fish.doTimer, fish.constants.kTimerInterval);
        }
    },

    /**
     * At the top level, update the model
     *
     * @returns {Promise<boolean>}
     */
    fishUpdate: async function () {
        let done = false;
        const p1 = fish.phpConnector.getGameData();
        const tDBgame = await p1;

        const tNewGameTurn = Number(tDBgame['turn']);
        fish.state.gameState = tDBgame['gameState'];

        if (tNewGameTurn > fish.state.turn) {    //  the game just updated; its turn (from the DB) is more advanced.

            //  The DB has updated prices, etc., so we now finish THIS YEAR's case, updating it in CODAP.
            //  Note that we're using fish.state.turn BEFORE it gets updated to the "game's" turn.
            const tMostRecentTurn = await fish.CODAPConnector.updateFishItemInCODAP(fish.state.turn, "update (fresh year)");

            fish.state.gameTurn = Number(tNewGameTurn); //  now update local turn number
            fish.state.turn = fish.state.gameTurn;      //  here we update the turn (the player turn)
            fish.state.balance = tMostRecentTurn.after;  //  we only update balance when the turn updates
            fish.state.playerState = fish.constants.kFishingString; //  now we are fishing again

            fish.state.turnReport = fish.strings.makeRecentTurnReport( tMostRecentTurn );
            fish.setNotice(fish.state.turnReport);
        }

        if (fish.state.playerState === fish.constants.kSellingString) {
            //  this report will be DURING the turn, so we know how many we caught but not the price.
            fish.state.turnReport = fish.strings.makeCurrentTurnReport(fish.state.currentTurnResult);
            fish.setNotice(fish.state.turnReport);
        }

        //  check for end of game. fish.state.gameState set above (read from DB)

        if (fish.state.gameState === fish.constants.kWonString || fish.state.gameState === fish.constants.kLostString) {
            fish.state.gameEndMessage = tDBgame.reason;

            await fish.endGame(fish.state.gameState);
            done = true;
        }

        //  do an autocatch if appropriate
        if (fish.state.autoCatch && fish.state.playerState === fish.constants.kFishingString) {
            await fish.userActions.catchFish();       //      AUTOMATICALLY catch fish, but wait to complete before continuing!
        }

        //  need to know if everyone is done fishing
        fish.state.OKtoEndTurnObject = await fish.phpConnector.checkToSeeIfOKtoEndTurn();

        //  do an auto fish-market if appropriate
        if (fish.state.isChair) {
            if (fish.state.OKtoEndTurnObject.OK) {
                if (fish.state.autoChair) {
                    await fish.userActions.chairEndsTurn();     //  OK to resolve AND autoChair. Do it!
                }
            }
        }

        return done;
    },

    /**
     * Check to see if the player is ready to catch fish (game is in progress, player is tagged as "fishing"
     * instead of "selling"
     *
     * @returns {boolean}
     */
    readyToCatch: function () {
        if (fish.state.playerState === fish.constants.kFishingString) {
            if (fish.state.gameState !== fish.constants.kInProgressString) {
                console.warn("fish.js readyToCatch(), game state is " + fish.state.gameState);
                // alert("(fish.readyToCatch()) Hmmm. Somehow, we're ready to catch but the game is now " + fish.constants.kInProgressString);
            }
            return true;
        } else {
            return false;
        }
        //  return (fish.state.playerState === fish.constants.kFishingString && fish.state.gameState === fish.constants.kInProgressString)
    },

    /**
     * Make the text appear in the UI in the notice section
     * @param iText     the text to appear
     */
    setNotice: function (iText) {
        $("#notice").html(iText);
    },

    constants: {
        version: "001e",

        kTimerInterval: 700,       //      milliseconds, ordinarily 1000
        kUsingTimer: true,
        kInitialLanguage : 'en',    //  can override with URL parameter *lang*, e.g., "...fish.html?lang=es"

        kBaseURL: {
            local_concordRepository: "http://localhost:8888/concord-plugins/data-science-worlds/fish/fish.php",
            local: "http://localhost:8888/plugins/fish/fish.php",
            xyz: "https://codap.xyz/projects/fish/fish.php",
            eeps: "https://www.eeps.com/codap/fish/fish.php"
        },

        kFishDataSetName: "fish",
        kFishDataSetTitle: "fishing records",
        kFishCollectionName: "years",

        kHistoricalDataSetName: "historical fish",
        kHistoricalDataSetTitle: "historical records",
        kHistoricalCollectionName: "years",

        //  game states
        kInProgressString: "in progress",
        kWonString: "won",
        kLostString: "lost",
        kWaitingString: "waiting",      //

        //  player states
        kSellingString: "selling",
        kFishingString: "fishing",
        kBetweenString: "between games",

        foo: 42
    }

};