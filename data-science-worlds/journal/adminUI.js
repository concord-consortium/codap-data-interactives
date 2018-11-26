/*
==========================================================================

 * Created by tim on 8/24/18.
 
 
 ==========================================================================
ui in journal

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

journal.ui = {

    initialize: function () {
        const tJournalNameDiv = document.getElementById("journalNameBox");
        tJournalNameDiv.defaultValue = journal.strings.sDefaultJournalName;
    },

    update: async function () {
        //  all the data we need to await...


        const pMyPapers = journal.DB_Connect.getPapers(journal.state.worldID, journal.state.teamID);
        const pMyWorlds = journal.DB_Connect.getMyWorlds(journal.myGodID);
        const pMyTeams = journal.DB_Connect.getMyTeams(journal.state.worldID);

        const [tPapers, tWorlds, tTeams] = await Promise.all([pMyPapers, pMyWorlds, pMyTeams]);

        //  status bar

        document.getElementById("adminStatusBarDiv").innerHTML =
            "admin | " +
            journal.constants.version + " | " +
            journal.constants.whence +
            (journal.myGodName ? " | " + journal.myGodName + " (" + journal.myGodID + ")" : "") +
            (journal.state.worldCode ? " | " + journal.state.worldCode : "")
            + "&nbsp;&nbsp;&nbsp;&nbsp; <button onclick='journal.logout()'>log out</button>";


        // main visibility

        const tGodLoginDiv = document.getElementById("godLoginDiv");
        const tGodChooseWorldDiv = document.getElementById("godChooseWorldDiv");
        const tTabsDiv = document.getElementById("tabs");

        tGodLoginDiv.style.display = (journal.adminPhase === journal.constants.kAdminPhaseNoGod ? "block" : "none");
        tGodChooseWorldDiv.style.display = (journal.adminPhase === journal.constants.kAdminPhaseNoWorld ? "block" : "none");
        tTabsDiv.style.display = (journal.adminPhase === journal.constants.kAdminPhasePlaying ? "block" : "none");


        //  editor panel visibility

        /*
                const tEditorTabDiv = document.getElementById("editor");
                tEditorTabDiv.style.display = (journal.state.editor ? "block" : "none");
        */

        //  join page text etc

        const tJoinType = $('input[name=joinType]:checked').val();
        const tJoinButton = document.getElementById('joinButton');
        const tJoinHelpSpan = document.getElementById("joinHelpSpan");
        const tJournalNameDiv = document.getElementById("journalNameDiv");

        switch (tJoinType) {
            case 'join':
                tJoinButton.value = journal.strings.sJoinWorldButtonLabel;
                tJoinHelpSpan.textContent = journal.strings.sJoinJoinTypeHelpString;
                tJournalNameDiv.style.display = "none";
                break;
            case 'new':
                tJoinButton.value = journal.strings.sNewWorldButtonLabel;
                tJoinHelpSpan.textContent = journal.strings.sNewJoinTypeHelpString;
                tJournalNameDiv.style.display = "block";
                break;
        }

        //  paper task table
        const tPaperDiv = document.getElementById("papersListDiv");

        if (Array.isArray(tPapers)) {
            let text = "<table><tr><th>id</th><th>title</th></tr>";
            tPapers.forEach(p => {
                console.log(p.id + ": " + p.title);
                text += "<tr><td>" + p.id + "</td><td>" + p.title + "</td></tr>";
            });
            text += "</table>";
            tPaperDiv.innerHTML = text;
        } else {
            tPaperDiv.innerHTML = "<p>Sorry, no papers to display</p>";
        }

        //  world list table

        const tWorldDiv = document.getElementById("godChooseWorldTable");

        if (tWorlds) {
            let text = "<table><tr><th>id</th><th>code</th></tr>";
            tWorlds.forEach(w => {
                console.log("World " + w.id + " is called " + w.code + ".");
                text += "<tr><td>" + w.id + "</td><td>" + w.code + "</td>"
                    + "<td><button onclick='journal.userAction.joinWorldByID(" + w.id + ", \"" + w.code + "\")'>join</button> </td></tr>";
            });
            text += "</table>";
            tWorldDiv.innerHTML = text;
        } else {
            tWorldDiv.innerHTML = "<p>Sorry, no worlds to display</p>";
        }

        //  teams list table

        const tTeamsListDiv = document.getElementById("teamsListDiv");

        if (tTeams) {
            let text = "<table><tr><th>id</th><th>code</th><th>name</th></tr>";
            tTeams.forEach(t => {
                console.log(t.id + ") Team " + t.name + " is called " + t.code + ".");
                text += "<tr><td>" + t.id + "</td><td>" + t.code + "</td><td>" + t.name + "</td>"
                    + "</tr>";
                   // + "<td><button onclick='journal.userAction.joinWorldByID(" + w.id + ", \"" + w.code + "\")'>join</button> </td></tr>";
            });
            text += "</table>";
            tTeamsListDiv.innerHTML = text;
        } else {
            tTeamsListDiv.innerHTML = "<p>Sorry, no teams to display</p>";
        }

    }
};