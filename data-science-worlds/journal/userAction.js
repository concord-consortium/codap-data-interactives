/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
userAction in journal

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

journal.userAction = {

    newWorld : async function() {
        const tWorldCode = document.getElementById("worldCodeBox").value;
        const tJournalName = document.getElementById("journalNameBox").value;
        const tEpoch = document.getElementById("epochBox").value;
        journal.state.worldCode = tWorldCode;
        const tNewWorldArray =  await journal.DB_Connect.makeNewWorld(journal.myGodID, tWorldCode,tEpoch,tJournalName);
        journal.state.worldID = tNewWorldArray[0].id;

        journal.adminPhase = journal.constants.kAdminPhasePlaying;
        await journal.ui.update();

    },

    newTeam : async function() {
        const tCode = document.getElementById("newTeamCodeBox").value;
        const tName = document.getElementById("newTeamNameBox").value;
        await journal.DB_Connect.addTeam(journal.state.worldID, tCode, tName);
        this.suggestTeam();
        await journal.ui.update();
    },

    suggestTeam : function() {
        const tCodeBox = document.getElementById("newTeamCodeBox");
        const tNameBox = document.getElementById("newTeamNameBox");
        const suggestionType = $('input[name=teamNameType]:checked').val();


        const tList = teamList[suggestionType];
        const tIndex = Math.floor(Math.random() * tList.length);
        const tTeam = tList[tIndex];

        tCodeBox.value = tTeam.code;
        tNameBox.value = tTeam.name;
    },

    /**
     * Try to join the world whose code is in the "worldCodeBox" box.
     * If that world doesn't exist, alertthe user and return null
     * @returns {Promise<void>}
     */
    joinWorld: async function () {
        let tWorldCode = document.getElementById("worldCodeBox").value;

        let tWorldData = await journal.DB_Connect.getWorldData(tWorldCode);

        console.log("About " + tWorldCode + " ... " + (tWorldData ? JSON.stringify(tWorldData) : " it doesn't exist."));

        if (tWorldData) {
            journal.state.worldID = tWorldData.id;
            journal.writerPhase = journal.constants.kWriterPhaseNoTeam;
            journal.editorPhase = journal.constants.kEditorPhasePlaying;
            journal.state.worldCode = tWorldCode;
        } else {
            alert("Sorry, world " + tWorldCode + " doesn't exist (yet).");
        }

        journal.ui.update();
    },

    joinWorldByID: function (iWorldID, iCode) {
        journal.state.worldID = iWorldID;
        journal.state.worldCode = iCode;
        journal.adminPhase = journal.constants.kAdminPhasePlaying;
        journal.ui.update();
    },

    joinTeamByID : function( iTeamID, iTeamName ) {
        journal.state.teamID = iTeamID;
        journal.state.teamName = iTeamName;
        journal.writerPhase = journal.constants.kWriterPhasePlaying;
        journal.ui.update();

    },

    savePaper: async function () {
        const tAuthors = $('#paperAuthorsBox').val();
        const tTitle = $('#paperTitleBox').val();
        const tText = $('#paperTextBox').val();
        const tAComments = $('#paperAuthorCommentsBox').val();

        const tPaperData = await journal.DB_Connect.savePaper(tAuthors, tTitle, tText, tAComments, journal.state.teamID, journal.currentPaperID);
        const theID = tPaperData["id"];
        journal.currentPaperID = theID;

        await journal.ui.update();
        return tPaperData
    },

    submitPaper: async function () {
        const thePaper = journal.thePapers[journal.currentPaperID];
        const tNewStatus = thePaper.status = journal.constants.kPaperStatusRevise ?
            journal.constants.kPaperStatusReSubmitted :
            journal.constants.kPaperStatusSubmitted;
        const tPaperData = await journal.userAction.savePaper();
        await journal.DB_Connect.submitPaper(tPaperData.id, tNewStatus);
        await journal.ui.update();
        journal.ui.erasePaper();
        journal.goToTabNumber(0);   //  return to the list
    },


    judgePaper: async function( iJudgment ) {
        const tEditorComments = document.getElementById("paperEditorCommentsBox").value;
        const tPaperData = await journal.DB_Connect.judgePaper(journal.currentPaperID, iJudgment, tEditorComments);
        await journal.ui.update();
        journal.ui.erasePaper();    //  clean up the boxes
        journal.goToTabNumber(0);   //  return to the list
    },

    godSignIn: async function () {
        const tUsername = $('#godUsernameBox').val();
        const tUserData = await journal.DB_Connect.getGodData(tUsername);
        if (tUserData) {        //  user exists; sign in
            journal.myGodID = tUserData.id;
            console.log(tUsername + ' signed in as #' + journal.myGodID);
        } else {
            const tNewUserData = await journal.DB_Connect.newGod(tUsername);
            journal.myGodID = tNewUserData.id;
            console.log(tUsername + ' newly signed in as #' + journal.myGodID);
        }
        journal.myGodName = tUsername;
        journal.adminPhase = journal.constants.kAdminPhaseNoWorld;
        journal.ui.update();
    }

};