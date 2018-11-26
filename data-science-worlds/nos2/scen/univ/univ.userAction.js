/*
==========================================================================

 * Created by tim on 9/24/18.
 
 
 ==========================================================================
univ.userAction in nos2

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

univ.userAction = {

    /**
     * Try to join the world whose code is in the "worldCodeBox" box.
     * If that world doesn't exist, alertthe user and return null
     * @returns {Promise<void>}
     */
    joinWorld: async function () {
        let tWorldCode = document.getElementById("worldCodeBox").value;

        if (tWorldCode) {
            univ.playPhase = univ.constants.kPhaseNoTeam;
            await univ.setWorld( tWorldCode );
        } else {
            alert("You need to enter a code into the box!");
        }

        univ.ui.update();
    },

    joinTeamByID : async function( iTeamID, iTeamName ) {
        univ.state.teamID = iTeamID;
        univ.state.teamName = iTeamName;
        univ.playPhase = univ.constants.kPhasePlaying;

        const theDBResults = await univ.DBconnect.getKnownResults();

        //  this need not be awaited.
        univ.CODAPconnect.saveResultsToCODAP( theDBResults );     //  add our known-from-before results to CODAP

        univ.ui.update();
    },

    observe : async function() {
        if (univ.telescopeView.selectedPoint) {
            await univ.doObservation(univ.telescopeView.selectedPoint);
            univ.ui.update();
        }
    },

    snap : async function() {
        await univ.makeSnapshot();
    },

    saveSnapshot : async function() {
        univ.DBconnect.saveCurrentSnapshot();
    }
};