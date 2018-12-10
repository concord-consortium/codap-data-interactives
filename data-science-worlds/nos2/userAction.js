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

    newWorld: async function () {
        const tWorldCode = document.getElementById("worldCodeBox").value;
        const tJournalName = document.getElementById("journalNameBox").value;
        const tEpoch = document.getElementById("epochBox").value;
        const tScenario = document.getElementById("worldScenarioMenu").value;

        const tTheTruthOfThisScenario = univ.model.getNewStateTemp();
        const tGameState = {truth: tTheTruthOfThisScenario};    //  temp!

        journal.state.worldCode = tWorldCode;
        const tArrayOfNewWorlds = await nos2.DBconnect.makeNewWorld(journal.myGodID, tWorldCode, tEpoch, tJournalName, tScenario, tGameState);

        journal.state.worldID = tArrayOfNewWorlds[0].id;

        journal.adminPhase = journal.constants.kAdminPhasePlaying;
        await journal.ui.update();

    },

    newTeam: async function () {
        const tCode = document.getElementById("newTeamCodeBox").value;
        const tName = document.getElementById("newTeamNameBox").value;
        await nos2.DBconnect.addTeam(journal.state.worldID, tCode, tName);
        this.suggestTeam();
        await journal.ui.update();
    },

    suggestTeam: function () {
        const tCodeBox = document.getElementById("newTeamCodeBox");
        const tNameBox = document.getElementById("newTeamNameBox");
        const suggestionType = $('input[name=teamNameType]:checked').val();


        const tList = teamNameSuggestionList[suggestionType];
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

        let tWorldData = await nos2.DBconnect.getWorldData(tWorldCode);

        console.log("About " + tWorldCode + " ... " + (tWorldData ? " year " + tWorldData.epoch : " it doesn't exist."));

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

    joinTeamByID: function (iTeamID, iTeamName) {
        journal.state.teamID = iTeamID;
        journal.state.teamName = iTeamName;
        journal.writerPhase = journal.constants.kWriterPhasePlaying;
        journal.currentPaper = new Paper();     //  because we have to have a teamID before we make a paper

        journal.ui.update();

    },

    /**
     * User has chosen a data pack from a menu while editing a paper.
     * In this version, the user can have only one.
     *
     * The idea is, they have to assemble the data pack they want in their scenario (in CODAP)
     * before heading here to write the paper.
     */
    chooseOneDataPack: function (theMenu) {
        const thePackNumber = Number(theMenu.value);
        journal.currentPack = journal.currentPackByDBID(thePackNumber);   //  currentPack is the actual entire pack

        if (journal.currentPaper) {
            if (journal.currentPaper.isEditable()) {
                journal.currentPaper.setThisPack(thePackNumber);   //  the value in the Paper is just the number
            }
        }

        journal.ui.update();
    },

    assignDataPack: function () {
        journal.currentPaper.addPack(journal.currentPack);
    },

    sendMessageFrom: async function (iSender) {
        const theNewMessage = document.getElementById("messageTextBox").value;
        let out = (iSender === "author") ? "<tr><td>author</td>" : "<tr><td>editor</td>";
        out += "<td>" + theNewMessage + "</td></tr>";

        nos2.DBconnect.appendMessageToConvo( out, journal.currentPaper.dbid );
    },

    makePaperPreview: async function () {
        const tPaperID = journal.currentPaper.dbid;

        let thePreviewHTML = "";
        if (journal.currentPaper) {
            thePreviewHTML = await nos2.DBconnect.getPaperPreview(tPaperID);
        } else {
            thePreviewHTML = "No paper specified."
        }

        document.getElementById("paperPreview").innerHTML = thePreviewHTML;

        $("#paperPreview").dialog("open");
    },

    erasePaper: async function () {
        journal.currentPaper = new Paper();
        await journal.ui.update();
    },

    savePaper: async function () {

        journal.currentPaper.authors = $('#paperAuthorsBox').val();
        journal.currentPaper.title = $('#paperTitleBox').val();
        journal.currentPaper.text = $('#paperTextBox').val();
        journal.currentPaper.authorComments = $('#paperAuthorCommentsBox').val();
        //  thePaper.packs = [];
        //  thePaper.references = [];

        const tPaperData = await nos2.DBconnect.savePaper(journal.currentPaper);    //  send the Paper
        journal.currentPaper.dbid = Number(tPaperData["id"]);

        await journal.ui.update();
        return tPaperData
    },

    submitPaper: async function () {
        const thePaper = journal.thePapers[journal.currentPaperID];
        const tNewStatus = journal.currentPaper.status =
            journal.constants.kPaperStatusRevise ?
                journal.constants.kPaperStatusReSubmitted :
                journal.constants.kPaperStatusSubmitted;
        const tPaperData = await journal.userAction.savePaper();
        await nos2.DBconnect.submitPaper(journal.currentPaper.dbid, tNewStatus);
        journal.ui.erasePaper();
        journal.goToTabNumber(0);   //  return to the list
        await journal.ui.update();
    },


    judgePaper: async function (iJudgment) {
        const tEditorComments = document.getElementById("paperEditorCommentsBox").value;
        const tPaperData = await nos2.DBconnect.judgePaper(journal.currentPaperID, iJudgment, tEditorComments);
        await journal.ui.update();
        journal.ui.erasePaper();    //  clean up the boxes
        journal.goToTabNumber(0);   //  return to the list
    },

    godSignIn: async function () {
        const tUsername = $('#godUsernameBox').val();
        const tUserData = await nos2.DBconnect.getGodData(tUsername);
        if (tUserData) {        //  user exists; sign in
            journal.myGodID = tUserData.id;
            console.log(tUsername + ' signed in as #' + journal.myGodID);
        } else {
            const tNewUserData = await nos2.DBconnect.newGod(tUsername);
            journal.myGodID = tNewUserData.id;
            console.log(tUsername + ' newly signed in as #' + journal.myGodID);
        }
        journal.myGodName = tUsername;
        journal.adminPhase = journal.constants.kAdminPhaseNoWorld;
        journal.ui.update();
    }

};