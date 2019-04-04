/*
==========================================================================

 * Created by tim on 5/1/18.
 
 
 ==========================================================================
fishCODAPConnector in fish

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


fish.CODAPConnector = {

    /**
     * Set up the connection to CODAP
     *
     * @param iCallback
     * @returns {Promise<T | never>}
     */
    initialize: function (iCallback) {
        return codapInterface.init(this.iFrameDescriptor, null)
            .then(
                function () {
                    pluginHelper.initDataSet(fish.localize.getHistoricalDataContextSetupObject());
                    pluginHelper.initDataSet(fish.localize.getFishDataContextSetupObject());

                    //  restore the state if possible

                    fish.state = codapInterface.getInteractiveState();

                    if (jQuery.isEmptyObject(fish.state)) {
                        codapInterface.updateInteractiveState(fish.freshState);
                        console.log("fish: getting a fresh state");
                    }
                    console.log("fish.state is " + JSON.stringify(fish.state));   //  .length + " chars");

                }.bind(this)
            );
    },

    /**
     * Add one case to the fishing data set
     * Note that this does NOT include attributes that get determined later:
     * unitPrice, income, after.
     *
     * @param iModelResult
     * @returns {Promise<{year: number, seen: *, want: *, caught: (*|number), before: (number|*), expenses: number, player: (null|*), game: (*|null)}>}
     */
    addSingleFishItemInCODAP: async function (iModelResult) {
        let aTurn = {
            year: Number(fish.state.turn),
            seen: iModelResult.visible,
            want: iModelResult.sought,
            caught: iModelResult.caught,
            before: fish.state.balance,
            expenses: iModelResult.expenses,
            player: fish.state.playerName,
            game: fish.state.gameCode
        };

        //  const localizedTurn = fish.localize.localizeValuesObject(aTurn);

        await pluginHelper.createItems(aTurn, fish.constants.kFishDataSetName);
        return aTurn;   //  localizedTurn
    },

    /**
     * Called from fish.fishUpdate() when we have a new turn
     *
     * The database has recorded the price for fish (etc) based on everyone's catch.
     * So here, we can fill in what we did not know at the time of fishing: unitPrice, income, and our "after" balance.
     *
     * @param iYear     the year to be updated
     * @param iWhy
     * @returns {Promise<void>}
     */
    updateFishItemInCODAP: async function (iYear, iWhy) {
        try {
            const tTurnArray = await fish.phpConnector.getOneTurn(iYear);
            const tTurn = tTurnArray[0];

            const tValues = {
                'unitPrice' : tTurn.unitPrice,
                'income' : tTurn.income,
                'after' : tTurn.balanceAfter    //  note different name
            };
            console.log("Fish ... updateFishItemInCODAP() for " + iYear + " because: " + iWhy);

            let theWholeTurn = null;

            //  get the item id of the relevant case:

            let tFilterString = 'year==' + iYear;
            let tResource = "dataContext[" + fish.constants.kFishDataSetName + "].itemSearch[" + tFilterString + "]";
            let tMessage = {action: "get", resource: tResource};
            const tItemSearchResult = await codapInterface.sendRequest(tMessage);

            let theItemID = 0;

            if (tItemSearchResult.success && tItemSearchResult.values[0]) {
                const theResult = tItemSearchResult.values[tItemSearchResult.values.length - 1];
                theItemID = theResult.id;
                theWholeTurn = theResult.values;
                Object.assign(theWholeTurn, tValues);       //  merge the new values into the "turn" data (for return)
            } else {
                throw("unsuccessful item search, year " + iYear);
            }

            //      now do the update

            tResource = "dataContext[" + fish.constants.kFishDataSetName + "].itemByID[" + theItemID + "]";
            tMessage = {action: "update", resource: tResource, values: tValues};    //  fish.localize.localizeValuesObject(tValues)};
            const tUpdateResult = await codapInterface.sendRequest(tMessage);

            if (!tUpdateResult.success) {
                throw("unsuccessful case update, year " + iYear + " message: " + JSON.stringify(tMessage));
            }

            return theWholeTurn;       //      resolve to the most recent turn.
        } catch (msg) {
            console.log("updateFishItemInCODAP(): " + msg);
        }
    },

    createFishItems: async function (iValues) {

        iValues = pluginHelper.arrayify(iValues);
        console.log("Fish ... createFishItems with " + iValues.length + " case(s)");

        try {
            res = await pluginHelper.createItems(iValues, fish.constants.kFishDataSetName);
            console.log("Resolving createFishItems() with " + JSON.stringify(res));
            return res;
        } catch {
            console.log("Problem creating items using iValues = " + JSON.stringify(iValues));
        }
    },

    createHistoricalFishItems: function (iValues) {
        iValues = pluginHelper.arrayify(iValues);

        console.log("Fish ... createHistoricalFishItems with " + iValues.length + " case(s)");
        pluginHelper.createItems(iValues, fish.constants.kHistoricalDataSetName)
            .catch(() => console.log("Problem creating items using iValues = " + JSON.stringify(iValues)));
    },

    deleteAllHistoricalRecords: function () {
        return new Promise((resolve, reject) => {
            let tCallback = null;
            let tResource = "dataContext[" + fish.constants.kHistoricalDataSetName + "].allCases";
            let tMessage = {"action": "delete", "resource": tResource};
            codapInterface.sendRequest(tMessage, tCallback)
                .then((res) => resolve(res))
                .catch((msg) => {
                    console.warn("Problem deleting historical records: " + msg);
                    reject("Problem deleting historical records: " + msg);
                })
        })
    },

    deleteAllTurnRecords: async function () {
        const tResource = "dataContext[" + fish.constants.kFishDataSetName + "].allCases";

        try {
            let res = await codapInterface.sendRequest({action: "delete", resource: tResource}, null);
            return res;
        } catch (msg) {
            console.warn("Problem deleting turn records: " + msg);
        }
    },

    iFrameDescriptor: {
        version: fish.constants.version,
        name: 'fish',
        title: 'Fishing!',
        dimensions: {width: 360, height: 344},
        preventDataContextReorg: false              //  todo: figure out why this seems not to work!
    },

    historicalDataContextSetupStrings: {},
    fishDataContextSetupStrings: {}
};

