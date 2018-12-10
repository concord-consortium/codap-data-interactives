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

    initialize : function() {

    },

    openPaper :  function( iPaperID) {
        journal.currentPaperID = iPaperID;
        const thePaper = journal.thePapers[journal.currentPaperID];

        journal.goToTabNumber(1);   //  the second tab

        document.getElementById('paperStatusBox').innerHTML = "paper " + thePaper.id + " (" + thePaper.status + ")";    //  .innerHTML because it's a <td>
        document.getElementById('paperTitleBox').value = thePaper.title;    //  .value because it's an <input>
        document.getElementById('paperAuthorsBox').value = thePaper.authors;
        document.getElementById('paperTextBox').value = thePaper.text;
        document.getElementById('paperEditorCommentsBox').innerHTML = thePaper.editorComments;  //  because it's a span
        document.getElementById('paperAuthorCommentsBox').value = thePaper.authorComments;
        document.getElementById('paperTeamBox').innerHTML = (thePaper.teamID ? journal.state.teamName : "-");

    },

    erasePaper: function () {
        journal.currentPaperID = null;
        //  $('#paperAuthorsBox').val("");    //  leave the authors in
        $('#paperStatusBox').html("no paper selected");
        $('#paperTitleBox').val("");
        $('#paperTextBox').val("");
        $('#paperTeamBox').html("");
        $('#paperAuthorCommentsBox').val("");
        $('#paperEditorCommentsBox').html("");
    },


    viewPaper : function(iPaperID, iInJournal) {
        if (iInJournal) {

        }
    },


    update : async function() {
        //  all the data we need to await...

        const pMyPapers = journal.DB_Connect.getPapers(journal.state.worldID, journal.state.teamID);
        tPapers = await pMyPapers;

        journal.thePapers = {};

        if (tPapers) {
            tPapers.forEach(p => {
                journal.thePapers[p.id] = p;
            });
        }

        //  status bar

        document.getElementById("writerStatusBarDiv").innerHTML =
            journal.constants.version + " | " +
            journal.constants.whence +
            (journal.state.worldCode ? " | " + journal.state.worldCode  : "") +
            (journal.state.teamID ? " | " + journal.state.teamName : "") + "&nbsp;&nbsp;&nbsp;&nbsp;" +
            "<button onclick='journal.logout()'>log out</button>";


        // main visibility

        const tJoinWorldDiv = document.getElementById("joinWorldDiv");
        const tJoinTeamDiv = document.getElementById("joinTeamDiv");
        const tTabsDiv = document.getElementById("tabs");


        tJoinWorldDiv.style.display = (journal.writerPhase === journal.constants.kWriterPhaseNoWorld ? "block" : "none");
        tJoinTeamDiv.style.display = (journal.writerPhase === journal.constants.kWriterPhaseNoTeam ? "block" : "none");
        tTabsDiv.style.display = (journal.writerPhase === journal.constants.kWriterPhasePlaying ? "block" : "none");

        //  team name in edit paper panel

        document.getElementById("paperTeamBox").innerHTML = journal.state.teamName;

        //  choose team list. ONLY IN THE APPROPRIATE PHASE!

        if (journal.writerPhase === journal.constants.kWriterPhaseNoTeam) {
            //  get the team list only if we're in this phase.
            const tTeams = await journal.DB_Connect.getMyTeams(journal.state.worldID);
            const tChooseTeamDiv = document.getElementById("chooseTeamFromListDiv");

            if (tTeams) {

                let text = "<table><tr><th>id</th><th>code</th><th>name</th></tr>";
                tTeams.forEach(t => {
                    const tParenGuts = '(' + t.id + ',"' + t.name + '")';
                    console.log(t.id + ") Team " + t.name + " is called " + t.code + ".");
                    text += "<tr><td>" + t.id + "</td><td>" + t.code + "</td><td>" + t.name + "</td>"
                        + "<td><button onclick='journal.userAction.joinTeamByID" + tParenGuts + "'>join</button> </td></tr>";
                });
                text += "</table>";
                tChooseTeamDiv.innerHTML = text;
            } else {
                tChooseTeamDiv.innerHTML = "<p>Sorry, no teams to display</p>";
            }
        }

        //  paper task table

        const tPaperDiv = document.getElementById("paperTaskTable");

        let tPaperCount = 0;
        if (Array.isArray(tPapers)) {
            let text = "<table><tr><th>id</th><th>title</th><th>status</th><th>action</th></tr>";
            tPapers.forEach(p => {
                    text += "<tr><td>" + p.id + "</td><td>" + p.title + "</td>";
                    text += "<td>" + p.status + "</td>";
                    switch (p.status) {
                        case journal.constants.kPaperStatusInProgress:
                            text += "<td><button onclick='journal.ui.openPaper(" + p.id + ")'>edit</button></td> ";
                            break;
                        case journal.constants.kPaperStatusRevise:
                            text += "<td><button onclick='journal.ui.openPaper(" + p.id + ")'>edit</button></td> ";
                            break;
                        case journal.constants.kPaperStatusPublished:
                            tPaperCount++;
                            text += "<td><button onclick='journal.ui.viewPaper(" + p.id + ", true)'>view</button></td> ";
                            break;
                        case journal.constants.kPaperStatusRejected:
                            text += "<td>-</td> ";
                            break;
                        case journal.constants.kPaperStatusSubmitted:
                            text += "<td>-</td> ";
                            break;
                        case journal.constants.kPaperStatusReSubmitted:
                            text += "<td>-</td> ";
                            break;
                    }
                    text += "</tr>";
            });
            text += "</table>";
            tPaperDiv.innerHTML = text;
        } else {
            tPaperDiv.innerHTML = "<p>Sorry, no papers to display</p>";
        }

        //  update the full journal

        document.getElementById("journalDiv").innerHTML = await journal.DB_Connect.getPublishedJournal();


    }
};