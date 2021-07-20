/*
==========================================================================

 * Created by tim on 5/7/18.
 
 
 ==========================================================================
fishHistoricalData in fish

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


fish.historicalData = {

    getHistoricalData: async function () {

        let turns = [];     //  we will collect all turns....
        let promises = [];

        await fish.CODAPConnector.deleteAllHistoricalRecords();
        fish.state.gameCodeList.forEach(
            (gc) => {
                console.log("getHistoricalData for " + gc);
                promises.push(fish.phpConnector.getTurnsFromGame(gc));  //  make one promise for each game we've been in
            }
        );

        const res = await Promise.all(promises);
        if (res) {
            let tAllGamesTurns = res;
            tAllGamesTurns.forEach(
                (gameR) => {            //  but each game is an array of turns
                    gameR.forEach(
                        (turnR) => {
                            turns.push({
                                year: turnR.onTurn,
                                seen: turnR.visible,
                                want: turnR.sought,
                                caught: turnR.caught,
                                before: turnR.balanceBefore,
                                expenses: turnR.expenses,
                                unitPrice: turnR.unitPrice,
                                income: turnR.income,
                                after: turnR.balanceAfter,
                                player: turnR.playerName,
                                game: turnR.gameCode,
                                result: turnR.gameState,     //  because CODAP's name for the attribute is result
                                level: turnR.config
                            })
                        }
                    )
                }
            );
            //  console.log("Assembled data for all historical turns. First item: " + JSON.stringify(tAllGamesTurns[0]));
        } else {
            console.warn("No turn records to add to historical records!");
            throw("No turn records to add to historical records!");
        }
        await fish.CODAPConnector.createHistoricalFishItems(turns);

        console.log("getHistoricalData() -- Historical fish items created.");
    }
};