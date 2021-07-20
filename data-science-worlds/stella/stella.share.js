/**
 * Created by tim on 8/18/16.


 ==========================================================================
 stella.share.js in data-science-games.

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

/* global stella, console, dsgSQL */

stella.share = {

    /**
     * Called from stella.initialize()
     *
     * @param iBaseURL
     */
    initialize: function (iBaseURL) {

        dsgSQL.setCredentials(
            {
                baseURL: iBaseURL
            }
        );
    },

    /**
     * called from stella.initialize()
     */
    retrieveStars: function () {

        dsgSQL.doPost("c=getStars", gotStars);

        function gotStars(iData) {
            var oStars = [];
            var theData = JSON.parse(iData);

            theData.forEach(function (s) {
                stella.model.stars.push(new Star(s));
            });
            console.log("All " + theData.length + " = " + stella.model.stars.length + " stars read in, in stella.share.retrieveStars (gotStars)");

            var dText = "<table><tr><th>id</th><th>logMass</th><th>age</th><th>m</th><th>GI</th><th>dist</th></tr>";
            stella.model.stars.forEach(
                function( s ) {
                    dText += s.htmlTableRow();
                }
            );
            dText += "</table>";

            $("#debugText").html(dText);

            stella.manager.whenWeHaveAllTheStars();
        }
    }
};
