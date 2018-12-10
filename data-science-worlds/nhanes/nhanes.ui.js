/*
 * ==========================================================================
 * Copyright (c) 2018 by eeps media.
 * Last modified 8/21/18 9:10 AM
 *
 * Created by Tim Erickson on 8/21/18 9:10 AM
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 *
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
 * ==========================================================================
 *
 */


nhanes.ui = {

    updateWholeUI: function () {
        nhanes.ui.refreshCheckboxes();
        nhanes.ui.refreshSampleSummary();
        nhanes.ui.refreshText();
    },

    getArrayOfChosenAttributes: function () {
        out = [];
        for (let attName in nhanes.allAttributes) {
            if (nhanes.allAttributes.hasOwnProperty(attName)) {
                const tAtt = nhanes.allAttributes[attName];    //  the attribute
                if (tAtt.chosen) {
                    out.push(tAtt);
                }
            }
        }
        return out;
    },

    refreshText: function () {
        const tSampleSize = document.getElementById("sampleSizeInput").value;
        let theGetCasesButtonText = "get " + tSampleSize + ((tSampleSize == 1) ? " person" : " people")
        $("#getCasesButton").text(theGetCasesButtonText);
    },

    refreshCheckboxes: function () {
        for (let attName in nhanes.allAttributes) {
            if (nhanes.allAttributes.hasOwnProperty(attName)) {
                const tAtt = nhanes.allAttributes[attName];    //  the attribute
                if (tAtt.hasCheckbox) {
                    document.getElementById(tAtt.checkboxID).checked = tAtt.chosen;
                }
            }
        }
    },

    toggleAttributeGroupOpen : function(iGroupIndex) {
        nhanes.attributeGroups[iGroupIndex].open = !nhanes.attributeGroups[iGroupIndex].open;
        nhanes.ui.updateWholeUI();
    },

    makeBasicCheckboxesHTML: function () {
        let out = "";

        nhanes.attributeGroups.forEach( (g)=>{
            out += "<details>";
                out += this.makeOneGroupOfCheckboxesHTML(g);
            out += "</details>";
        });

        return out;
    },

    makeOneGroupOfCheckboxesHTML: function (iGroupObject) {
        let out = "";
        out += "<summary>" + iGroupObject.title + "</summary>";

        out += "<div class='attributeCheckboxes'>";
        for (let attName in nhanes.allAttributes) {

            if (nhanes.allAttributes.hasOwnProperty(attName)) {
                const tAtt = nhanes.allAttributes[attName];    //  the attribute
                if (tAtt.groupNumber == iGroupObject.number) {     //  not === because one may be a string
                    if (tAtt.displayMe) {
                        tAtt.hasCheckbox = true;        //  redundant
                        out += "<div class='oneAttCheckboxPlusLabel'>";
                        out += "<input type = 'checkbox' onchange='nhanes.userActions.changeAttributeCheckbox(\"" +
                            attName + "\")' id = '" + tAtt.checkboxID + "' >\n"
                        out += "<label for='" + tAtt.checkboxID + "'><span class='attNameBold'>"
                            + tAtt.title + "</span> (" + tAtt.description + ")</label>";
                        out += "</div>\n";
                    }
                }
            }
        }
        out += "</div>";
        return out;
    },

    getCaseFilterInformation : function() {
        const tMinAge = document.getElementById("minAgeBox").value;
        const tMaxAge = document.getElementById("maxAgeBox").value;

        let agePhrase = "";
        let whereClauseArray = [];

        if (tMinAge) {
            if (tMaxAge) {
                agePhrase = "with ages between " + tMinAge + " and " + tMaxAge;
                whereClauseArray.push("RIDAGEYR >= " + tMinAge);
                    whereClauseArray.push( "RIDAGEYR <= " + tMaxAge);
            } else {
                agePhrase = "age " + tMinAge + " and older";
                whereClauseArray.push("RIDAGEYR >= " + tMinAge);

            }

        } else {
            if (tMaxAge) {
                agePhrase = "up to age " + tMaxAge;
                whereClauseArray.push("RIDAGEYR <= " + tMaxAge);

            } else {
                agePhrase = "of all ages";
            }
        }

        return { agePhrase : agePhrase, whereClauseArray : whereClauseArray };
    },

    refreshSampleSummary: function () {
        const tSampleSize = document.getElementById("sampleSizeInput").value;

        let tAgeFilter = this.getCaseFilterInformation();

        let out = "";
        let aList = [];

        for (let attName in nhanes.allAttributes) {
            if (nhanes.allAttributes.hasOwnProperty(attName)) {
                const tAtt = nhanes.allAttributes[attName];    //  the attribute
                if (tAtt.chosen) {
                    aList.push(tAtt.title);
                }
            }
        }

        out = "<p>When you press the button, you will get "
            + (tSampleSize == 1 ? "one random American" : "a random sample of " + tSampleSize + " Americans")
            + " " + tAgeFilter.agePhrase
            + " from the 2003 "
            + "<a href='https://www.cdc.gov/nchs/nhanes/index.htm' target='_blank'>NHANES</a>.</p> "
            + "<p>The variables you will get are: "
            + "<b>" + aList.join("</b>, <b>") + "</b>.</p>";

        document.getElementById("sampleSummaryDiv").innerHTML = out;
    }
};