/**
 * Created by tim on 3/14/17.


 ==========================================================================
 barty.js in gamePrototypes.

 Author:   Tim Erickson

 Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.

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

/*
    "hub" file for bartY, now called barty.

    DEPLOYMENT NOTE: fix URL in barty.constants.js about line 40.
    Also fix the value of "whence" earlier in that file.


    About making "games" work
        bartyManager, 56. Cope with endGame. (closing the game was disabled so we could create flat files easily.)
 */


var barty = {

    state: {},
    routeStrings: {},

    /**
     * Construct a new "state"
     */
    freshState: {
        score: 42,
        statusSelector: null,
        gameNumber: 0,
        requestNumber: 0,
        day: 2,
        hour: 14,
        where: 'Orinda',
        number: 160
    },

    /**
     * set up barty game/sim
     */
    initialize: async function () {

        await barty.connector.initialize();     //  initialize the iFrame, data sets.

        barty.state = codapInterface.getInteractiveState();
        if (jQuery.isEmptyObject(barty.state)) {
            codapInterface.updateInteractiveState(barty.freshState);
        }

        meeting.restoreMeetingParameters({
            day: barty.state.day,
            hour: barty.state.hour,
            where: barty.state.where,
            number: barty.state.number
        });

        this.statusSelector = $("#status");

        barty.ui.initialize();
        barty.manager.newGame();
    }
};
