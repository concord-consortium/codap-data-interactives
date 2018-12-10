/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
journal in journal

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

let journal = {

    state : {},
    epoch : 2022,        //  the time.
    currentPaper : null,
    currentPack : null, //  the actual DataPack currently being displayed/edited: journal.currentPack

    myGodID : null,
    myGodName : null,
    adminPhase : null,
    writerPhase : null,
    editorPhase : null,
    theTeams : {},      //  keys will be team IDs.
    thePapers : {},     //  keys will be paper IDs

    constants : {
        version : "000a",
        whence : "local",

        kAdminPhaseNoGod : 1,
        kAdminPhaseNoWorld : 2,
        kAdminPhasePlaying : 49,

        kWriterPhaseNoWorld : 51,
        kWriterPhaseNoTeam : 52,
        kWriterPhasePlaying : 89,

        kPaperStatusInProgress : 'in progress',
        kPaperStatusSubmitted : 'submitted',
        kPaperStatusRejected : 'rejected',
        kPaperStatusRevise : 'revise',
        kPaperStatusReSubmitted : 'resubmitted',
        kPaperStatusPublished : 'published',

        kEditorPhaseNoWorld :   101,
        kEditorPhasePlaying :   199,

        freshState : {
            editor : false,
            worldID : null,  //  the "world" we are in, the ID in the DB.
            worldCode : null,
            teamID : null,      //  the "team" we are in (the ID)
            teamName : null,    //  full name of the team
        },

    },

    logout : function() {
        this.myGodID = null;
        this.myGodName = null;
        journal.adminPhase = journal.constants.kAdminPhaseNoGod;
        journal.writerPhase = journal.constants.kWriterPhaseNoWorld;
        journal.editorPhase = journal.constants.kEditorPhaseNoWorld;
        journal.state.worldID = null;
        journal.state.worldCode = null;
        journal.state.teamID = null;
        journal.state.teamName = null;

        journal.ui.update();
    },

    goToTabNumber : function(iTab) {
        $( "#tabs" ).tabs(  "option", "active", iTab );
    },

    /**
     *  returns a DataPack assuming that journal.currentPaper is set.
     * Will be null if it is not.
     */

    getCurrentPack : function() {
        out = null;
        if (journal.currentPaper) {
            if (journal.currentPaper.packs.length > 0) {
                out = this.currentPackByDBID( journal.currentPaper.packs[0] );
            }
        }
        return out;
    },

    /**
     * Returns the DataPack corresponding the the DBID
     * @param iDBID     the DBID
     */
    currentPackByDBID : function( iDBID ) {
        let out = null;

        journal.ui.packs.forEach( pk => {
            if (pk.dbid === iDBID) {
                out =  pk;
            }
        });
        return out;
    },

    initialize : function() {
        this.logout();
        journal.state = journal.constants.freshState;       //      todo: fix when we add CODAP

        journal.ui.initialize();    //  whichever UI it is!
        journal.ui.update();

    },



};