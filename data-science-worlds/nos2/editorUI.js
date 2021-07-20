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
        journal.ui.update();
    },

    openPaper :  function( iPaperID) {
        const thePaper = journal.currentPaper = journal.thePapers[iPaperID];    //  thePapers is a keyed object, not an array

        journal.goToTabNumber(1);   //  the second tab

        document.getElementById('paperStatusBox').innerHTML = "paper " + thePaper.dbid + " (" + thePaper.status + ")";    //  .innerHTML because it's a <td>
        document.getElementById('paperTitleBox').innerHTML = thePaper.title;    //  .value because it's an <input>
        document.getElementById('paperAuthorsBox').innerHTML = thePaper.authors;
        document.getElementById('paperTextBox').innerHTML = thePaper.text;
        document.getElementById('paperEditorCommentsBox').value = thePaper.editorComments;  //  because it's a span
        document.getElementById('paperAuthorCommentsBox').innerHTML = thePaper.authorComments;
        document.getElementById('paperTeamBox').innerHTML = (thePaper.teamID ? journal.state.teamName : "-");

        this.currentPack = journal.getCurrentPack();   //  depends on currentPaper. Null if nonexistent
    },

    erasePaper: function () {
        $('#paperStatusBox').html("no paper selected");
        $('#paperAuthorsBox').html("");    //  leave the authors in
        $('#paperTitleBox').html("");
        $('#paperTextBox').html("");
        $('#paperTeamBox').html("");
        $('#paperAuthorCommentsBox').html("");
        $('#paperEditorCommentsBox').val("");
    },

    viewPaper : function(iPaperID, iInJournal) {
        if (iInJournal) {

        }
    },

    update: async function () {
        //  all the data we need to await...

        const pAllPapers = nos2.DBconnect.getPapers(journal.state.worldID, null);
        const pAllTeams = nos2.DBconnect.getMyTeams(journal.state.worldID);

        const [theTeams, thePapers] = await Promise.all([pAllTeams, pAllPapers]);

        //  status bar

        document.getElementById("editorStatusBarDiv").innerHTML =
            "editor | " + journal.constants.version + " | " +
            journal.constants.whence +
            (journal.state.worldCode ? " | " + journal.state.worldCode : " | no world yet") +
            "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<button onclick='journal.logout()'>log out</button>";


        // main visibility

        const tJoinWorldDiv = document.getElementById("editorJoinWorldDiv");
        const tTabsDiv = document.getElementById("tabs");


        tJoinWorldDiv.style.display = (journal.editorPhase === journal.constants.kEditorPhaseNoWorld ? "block" : "none");
        tTabsDiv.style.display = (journal.editorPhase === journal.constants.kEditorPhasePlaying ? "block" : "none");

        //  fix the list of teams

        journal.theTeams = {};
        if (theTeams) {
            theTeams.forEach(t => {
                journal.theTeams[t.id] = t;
            });
        }

        //  paper task table

        journal.thePapers = {};

        if (thePapers) {
            thePapers.forEach(p => {
                journal.thePapers[p.dbid] = p;
            });
        }


        const tPapersDiv = document.getElementById("paperTaskTable");

        let tPaperCount = 0;
        let text = "<table><tr><th>id</th><th>title</th><th>status</th><th>team</th></tr>";

        if (Array.isArray(thePapers)) {
            thePapers.forEach(p => {
                if (p.status === journal.constants.kPaperStatusSubmitted || p.status === journal.constants.kPaperStatusReSubmitted) {
                    tPaperCount++;
                    text += "<tr><td>" + p.dbid + "</td>"
                    text += "<td><button onclick='journal.ui.openPaper(" + p.dbid + ")'>read</button>&nbsp;" + p.title + "</td>";
                    text += "<td>" + p.status + "</td>";
                    text += "<td>" + (p.teamID ? journal.theTeams[p.teamID].code : "-") + "</td>";
                    text += "</tr>";
                }
            });
        }
        text += "</table>";

        if (tPaperCount > 0) {
            tPapersDiv.innerHTML = "<p>"
                + tPaperCount + (tPaperCount === 1 ? " paper " : " papers ")
                + "to deal with</p>" + text;
        } else {
            tPapersDiv.innerHTML = "<p>Hooray! All caught up!</p>";
        }



        //  update the full journal

        document.getElementById("journalDiv").innerHTML = await nos2.DBconnect.getPublishedJournal(journal.state.worldID);

    }
};