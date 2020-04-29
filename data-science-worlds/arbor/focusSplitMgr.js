/*
==========================================================================

 * Created by tim on 12/21/17.
 
 
 ==========================================================================
focusSplitMgr in reTree

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

var focusSplitMgr = {

    theSplit: null,
    leftCategoryZoneSelector: "#leftCategoryButtons",
    rightCategoryZoneSelector: "#rightCategoryButtons",

    /**
     * Set which "split" we are focusing on.
     * This gets displayed in the Attribute Configuration" section of the page.
     *
     * @param iSplit
     */
    setFocusSplit: function (iSplit) {
        this.theSplit = iSplit;

        //  set name of button
        /*
                var tButton = document.getElementById("configureButton");
                tButton.textContent = "Configure " + iSplit.attName;
        */

        //  set visibility of relevant DOM elements in the configuration section

        var el_cont = document.getElementById("continuousAttributeConfiguration");
        var el_cate = document.getElementById("categoricalAttributeConfiguration");
        el_cont.style.display = (this.theSplit.isCategorical) ? "none" : "table-row";
        el_cate.style.display = (this.theSplit.isCategorical) ? "table-row" : "none";

        console.log("Focusing on split:  {" + this.theSplit + "}");

    },


    /**
     * Called when user action has altered the attribute configuration
     * (as opposed to focusing on a new one, in which case setFocusSplit() is called)
     *
     * Causes a repopulation and redraw, but could also change
     * the saved split for the relevant attInBaum
     */

    changeFocusSplitValues: function () {
        var tName = this.theSplit.attName;

        //  tell the attribute to remember this particular split as its default.

        var tAtt = arbor.getAttributeByName(tName);
        tAtt.saveSplit(this.theSplit);

        //  force a redraw

        var tEvent = new Event("changeTree");
        tEvent.why = "change of a split value";
        arbor.dispatchTreeEvent(tEvent);   //  results in a redraw of the tree VIEW.
    },

    changeCurrentSplitTypeUsingMenu: function () {
        var tName = this.theSplit.attName;
        var tSplitType = $("#currentSplitTypeMenu").find('option:selected').val();
        this.theSplit.isCategorical = (tSplitType === "categorical");
        var tEvent = new Event("changeTree");
        arbor.dispatchTreeEvent(tEvent);   //  results in a redraw of the tree VIEW.
    },

    /**
     * User has made a change in the attribute configuration section
     * Possibly a change in label or cut point or category assignment.
     * We read it all and see.
     *
     * Note that the existence and location of "category buttons" are controlled elsewhere,
     * e.g., focusAttInBaum.constructCategoryButtons("L")
     */
    changeAttributeConfiguration: function () {

        this.theSplit.leftLabel = $("#leftLabelText").val();
        this.theSplit.rightLabel = $("#rightLabelText").val();

        if (!this.theSplit.isCategorical) {
            var tCut = Number($("#cutpointText").val());
            this.theSplit.oneBoolean = this.theSplit.setCutPoint(tCut, $("#operatorMenu").find('option:selected').val());
        }

        this.changeFocusSplitValues();
    },

    /**
     * Fix the text and sets of buttons, etc. to reflect the current attribute configuration.
     */
    displayAttributeConfiguration: function () {

        if (this.theSplit) {

            $("#currentSplitTypeMenu").val(this.theSplit.isCategorical ? "categorical" : "continuous");
            $("#splitVariableName").text(this.theSplit.attName);
            // $("#attributeConfigurationHeadline").text(this.theSplit.toString());
            $("#attributeSummary").html(this.theSplit.toString());
            $("#continuousAttributeName").text(this.theSplit.attName);
            $("#continuousAttributeReverseExpression").text(this.theSplit.reverseContinuousExpression(false));
            $("#cutpointText").val(this.theSplit.cutpoint);
            $("#operatorMenu").val(this.theSplit.operator);

            this.theSplit.constructCategoryButtons(this.leftCategoryZoneSelector, "L");
            this.theSplit.constructCategoryButtons(this.rightCategoryZoneSelector, "R");

            $("#leftLabelText").val(this.theSplit.leftLabel);
            $("#rightLabelText").val(this.theSplit.rightLabel);

            if (this.theSplit.attName === arbor.state.dependentVariableSplit.attName) {  //      aha! we're looking at the dependent!
                $("#leftHeaderText").text('meaning of "positive"');
                $("#rightHeaderText").text('meaning of "negative"');
            } else {
                $("#leftHeaderText").text('left branch');
                $("#rightHeaderText").text('right branch');
            }
        }
    },

    /**
     * Fix the text and sets of buttons, etc. to reflect the current attribute configuration.
     */
    displayAttributeConfiguration: function () {

        if (this.theSplit) {

            $("#currentSplitTypeMenu").val(this.theSplit.isCategorical ? "categorical" : "continuous");
            $("#splitVariableName").text(this.theSplit.attName);
            // $("#attributeConfigurationHeadline").text(this.theSplit.toString());
            $("#attributeSummary").html(this.theSplit.toString());
            $("#continuousAttributeName").text(this.theSplit.attName);
            $("#continuousAttributeReverseExpression").text(this.theSplit.reverseContinuousExpression(false));
            $("#cutpointText").val(this.theSplit.cutpoint);
            $("#operatorMenu").val(this.theSplit.operator);

            this.constructCategoryButtons("#leftCategoryButtons", "L");
            this.constructCategoryButtons("#rightCategoryButtons", "R");

            $("#leftLabelText").val(this.theSplit.leftLabel);
            $("#rightLabelText").val(this.theSplit.rightLabel);

            if (this.theSplit.attName === arbor.state.dependentVariableSplit.attName) {  //      aha! we're looking at the dependent!
                $("#leftHeaderText").text('meaning of "positive"');
                $("#rightHeaderText").text('meaning of "negative"');
            } else {
                $("#leftHeaderText").text('left branch');
                $("#rightHeaderText").text('right branch');
            }
        }
    },

    /**
     * Actually make the buttons with the category values on them
     *
     * @param iSelector DOM selector for the div containing the set of buttons
     * @param iLorR     left or right side? ("L" or "R")
     * @returns {string}    a set of <button> tags we will put into the DOM
     */
    constructCategoryButtons: function (iSelector, iLorR) {
        $(iSelector).empty();

        var tArray = this.theSplit.getListOfCategories(iLorR);
        tArray.forEach(function (c) {
            $(iSelector)
                .append($('<button>')
                    .prop({value: c})
                    .on('click', function () {
                        focusSplitMgr.theSplit.switchCategory(c);
                    })
                    .text(c));
        }.bind(this));
    },

    /**
     * Change the left-right sense of the definition and the labels.
     */
    swapFocusSplit: function () {
        this.theSplit.swapLandR();
        this.changeFocusSplitValues();
    },


    showHideAttributeConfigurationSection:

        function (iForce) {
            el = document.getElementById("attributeConfigurationSection");

            switch (iForce) {
                case "show":
                    el.style.visibility = "visible";
                    break;

                case "hide":
                    el.style.visibility = "hidden";
                    break;

                default:
                    el.style.visibility = (el.style.visibility === "visible") ? "hidden" : "visible";
                    break;
            }
        }

};





