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
     * set up barty game/sim
     */
    initialize: async function () {

        await barty.connector.initialize();     //  initialize the iFrame, data sets.

        barty.state = codapInterface.getInteractiveState();
        if (jQuery.isEmptyObject(barty.state)) {
            codapInterface.updateInteractiveState(barty.getFreshState());
        }

        barty.ui.initialize();

        barty.meeting.restoreMeetingParameters( this.state.meetingParameters );

        this.statusSelector = $("#status");

        barty.manager.newGame();
    },

    getFreshState : function() {
        return {
            score: 42,
            statusSelector: null,
            gameNumber: 0,
            requestNumber: 0,

            queryData : {
                c : "byRoute",
                stn0 : barty.constants.kBaseStn0,
                stn1 : barty.constants.kBaseStn1,
                h0 : barty.constants.kBaseH0,
                h1 : barty.constants.kBaseH1,
                d0 : barty.constants.kBaseDateString,
                d1 : barty.constants.kBaseDateString,   //  same day
                nd : 1,
                weekday : 0,            //  will ultimately be computed
                useWeekday : false,
                useHour : false
            },

            meetingParameters : {
                day: 2,
                hour: 14,
                where: 'Haywrd',
                number: 160
            }
        }
    }
};
