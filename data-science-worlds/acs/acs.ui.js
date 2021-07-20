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


acs.ui = {

    updateWholeUI: function () {
        acs.ui.refreshCheckboxes();
        acs.ui.refreshSampleSummary();
        acs.ui.refreshText();
    },

    getArrayOfChosenAttributes: function () {
        out = [];
        for (let attName in acs.allAttributes) {
            if (acs.allAttributes.hasOwnProperty(attName)) {
                const tAtt = acs.allAttributes[attName];    //  the attribute
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
        for (let attName in acs.allAttributes) {
            if (acs.allAttributes.hasOwnProperty(attName)) {
                const tAtt = acs.allAttributes[attName];    //  the attribute
                if (tAtt.hasCheckbox) {
                    document.getElementById(tAtt.checkboxID).checked = tAtt.chosen;
                }
            }
        }
    },

    toggleAttributeGroupOpen : function(iGroupIndex) {
        acs.attributeGroups[iGroupIndex].open = !acs.attributeGroups[iGroupIndex].open;
        acs.ui.updateWholeUI();
    },

    makeBasicCheckboxesHTML: function () {
        let out = "";

        acs.attributeGroups.forEach( (g)=>{
            out += "<details>";
            //if (g.open) {
                //  out += "<div>";

                out += this.makeOneGroupOfCheckboxesHTML(g);
                //  out += "</div>";
            //}
            out += "</details>";
        });

        return out;
    },

    makeOneGroupOfCheckboxesHTML: function (iGroupObject) {
        let out = "";
        out += "<summary>" + iGroupObject.title + "</summary>";

        out += "<div class='attributeCheckboxes'>";
        for (let attName in acs.allAttributes) {

            if (acs.allAttributes.hasOwnProperty(attName)) {
                const tAtt = acs.allAttributes[attName];    //  the attribute
                if (tAtt.groupNumber == iGroupObject.number) {     //  not === because one may be a string
                    if (tAtt.displayMe) {
                        tAtt.hasCheckbox = true;        //  redundant
                        out += "<div class='oneAttCheckboxPlusLabel'>";
                        out += "<input type = 'checkbox' onchange='acs.userActions.changeAttributeCheckbox(\"" +
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


    refreshSampleSummary: function () {
        const tSampleSize = document.getElementById("sampleSizeInput").value;

        let out = "";
        let aList = [];

        for (let attName in acs.allAttributes) {
            if (acs.allAttributes.hasOwnProperty(attName)) {
                const tAtt = acs.allAttributes[attName];    //  the attribute
                if (tAtt.chosen) {
                    aList.push(tAtt.title);
                }
            }
        }

        out = "<p>When you press the button, you will get "
            + (tSampleSize == 1 ? "one random Californian" : "a random sample of " + tSampleSize + " Californians")
            + " from the 2013 "
            + "<a href='https://www.census.gov/programs-surveys/acs' target='_blank'>American Community Survey</a> (ACS).</p> "
            + "<p id='sampleSummary'>The attributes you will get are: "
            + "<b>" + aList.join("</b>, <b>") + "</b>.</p>";

        document.getElementById("sampleSummaryDiv").innerHTML = out;
    }
};