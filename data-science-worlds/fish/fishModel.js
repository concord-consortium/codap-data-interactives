/*
==========================================================================

 * Created by tim on 4/30/18.
 
 
 ==========================================================================
fishModel in fish

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


fish.model = {

    catchFish: async function (iSought) {

        const tGame = await fish.phpConnector.getGameData();

        try {

            let tMaxPossibleCatch = iSought;

            //  limit the max catch to what we can see

            let tVisible = 0;
            let tPop = Number(tGame['population']);

            if (fish.game.binomialProbabilityModel) {
                for (let i = 0; i < tPop; i++) {
                    if (Math.random() < fish.game.visibleProbability) {
                        tVisible++;
                    }
                }
            } else {
                tVisible = Math.round(fish.game.visibleProbability * tPop);
            }

            if (tMaxPossibleCatch > tVisible) {
                tMaxPossibleCatch = tVisible;
            }

            //  now calculate how many we caught

            let tCaught = 0;

            if (fish.game.binomialProbabilityModel) {
                for (let i = 0; i < tVisible; i++) {
                    if (Math.random() < fish.game.catchProbability) {
                        tCaught++;
                    }
                }
            } else {
                tCaught = Math.round(fish.game.catchProbability * tVisible);
            }

            //  just in case...
            if (tCaught > tMaxPossibleCatch) { tCaught = tMaxPossibleCatch; }

            let tExpenses = fish.game.overhead;

            return {
                sought: iSought,
                visible: tVisible,
                caught: tCaught,
                expenses: tExpenses
            };

        } catch (msg) {
            console.log('model catch fish error: ', msg);
        }
    },

    births: function (iPop) {
        let tAdjustedProbability = fish.game.birthProbability * (1 - (iPop / fish.game.carryingCapacity));
        let tOut = tAdjustedProbability * iPop;

        if (fish.game.binomialProbabilityModel) {
            tOut = 0;
            for (let i = 0; i < iPop; i++) {
                if (Math.random() < tAdjustedProbability) {
                    tOut++;
                }
            }
        }
        return tOut;
    },


    /**
     *
     * @param iGame
     * @param iPlayers
     * @param iTurns        the turns for this game turn (onTurn) from all players in this game
     * @returns {{newPop: number, gameState: string, turns: *}}
     */
    updateTotalPopulation: function (iGame, iPlayers, iTurns) {
        const tN0 = Number(iGame['population']);
        const thisYear = iGame['turn'];
        const nPlayers = iTurns.length;

        let tTotalCaughtFish = iTurns.reduce(function (a, v) {
            return {caught: a.caught + Number(v.caught)}
        }, {caught: 0});     //  count up how many fish got caught...

        const tBirths = this.births(tN0);
        const tNewPop = tN0 + tBirths - (tTotalCaughtFish.caught / nPlayers);

        const tUnitPrice = fish.game.calculatePrice(tTotalCaughtFish.caught / nPlayers);

        //  update all of the turns from all of the players to show ending balance

        iTurns.forEach(
            (t) => {
                t.unitPrice = tUnitPrice;
                t.income = tUnitPrice * Number(t.caught);
                t.balanceAfter = Number(t.balanceBefore) + t.income - Number(t.expenses);
            }
        );

        let tReasonText = fish.model.checkForEndGame(thisYear, iTurns, tNewPop);

        return {
            newPop: tNewPop,
            gameState: fish.state.gameState,
            turns: iTurns,
            reason : tReasonText
        };
    },

    checkForEndGame: function (iYear, iTurns, iPop) {

        tReasonText = "";

        let tEnd = "";      //  "" | "won" | "lost"
        let tReasonObject = {
            end : false,
            broke : [],
            time : false,   //  set true if time is up
            pop : ""        //  high | low
        };

        if (iYear >= fish.game.endingTurn) {
            tReasonObject.end = true;
            tReasonObject.time = true;
            if (iPop > fish.game.winningPopulation) {
                tReasonObject.pop = "high";
                tEnd = fish.constants.kWonString;
            } else {
                tReasonObject.pop = "low";
                tEnd = fish.constants.kLostString;
            }
        }

/*
        if (iPop > fish.game.winningPopulation) {
            tReasonObject.end = true;
            tReasonObject.pop = "high";
            tEnd = fish.constants.kWonString;
        }
*/

        iTurns.forEach( (t) => {
            if (t.balanceAfter < 0) {
                tReasonObject.end = true;
                tReasonObject.broke.push( t.playerName );
                tEnd = fish.constants.kLostString;
            }
        });

        if (iPop < fish.game.losingPopulation) {
            tReasonObject.end = true;
            tReasonObject.pop = "low";
            tEnd = fish.constants.kLostString;
        }

        //  set game state appropriately to win and loss

        if (tReasonObject.end) {
            fish.state.gameState = tEnd;
            tReasonText = fish.strings.constructGameEndMessageFrom(tReasonObject);
        } else {
            tReasonText = "End of year " + iYear;
        }

        return  tReasonText;
    }

};

