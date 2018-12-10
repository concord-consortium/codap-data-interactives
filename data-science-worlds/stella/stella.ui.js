/**
 * Created by tim on 6/24/16.


 ==========================================================================
 stella.ui.js in data-science-games.

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

/* global $, stella, SpectrumView, Snap, console  */

/**
 * Global object to handle UI, especially text.
 * this includes the text of buttons and other controls.
 *
 * @type {{fixStellaUITextAndControls: stella.ui.fixStellaUITextAndControls, keypressInStarPointingBox: stella.ui.keypressInStarPointingBox, assembleStarResultMenu: stella.ui.assembleStarResultMenu, initializeUINames: stella.ui.initializeUINames}}
 */
stella.ui = {

    starResultType : null,      //  the type of result chosen in the dropdown on the result tab
    starResultValue: null,  //  the result text box.

    /**
     * Called after any user action has changed anything that should be reflected in the text or controls.
     */
    fixStellaUITextAndControls : function() {


        //  below the sky pane
        this.shortStatusField.html(stella.manager.playing ? "game in progress" : "no game");

        //  correct title for new/abort game button
        this.newGameButton.html( stella.manager.playing ? "abort game" : "new game");

        //  make focusSystem label and make sure it's got the right spectrum
        var focusStarText = stella.strings.notPointingText;
        if (stella.manager.focusSystem) {
            focusStarText = "Pointing at " + stella.manager.focusSystem.sysID +
                    " • " + stella.state.magnification + "X";
            this.pointAtStarInputField.val( stella.manager.focusSystem.sysID );

            // stella.model.skySpectrum = stella.manager.focusSystem.setUpSpectrum();
        }

        //  Blue bar at the top of the screen

        //  last part of the blue bar at the top of the screen
        var tTimeAndScoreText = "Date " + stella.state.now.toFixed(3) + " • score = " + stella.player.stellaScore;
        //  assemble the whole blue bar at the top
        this.starInfoTextField.text( focusStarText + " • " + tTimeAndScoreText );

        //  Spectra tab: spectra labels

        if (stella.spectrumManager.skySpectrumView.spectrum) {
            this.skySpectrumLabel.text(stella.spectrumManager.skySpectrumView.toString());
        } else {
            this.skySpectrumLabel.text(stella.strings.noSkySpectrum);
        }
        if (stella.spectrumManager.labSpectrumView.spectrum) {
            this.labSpectrumLabel.text(stella.spectrumManager.labSpectrumView.toString());
        } else {
            this.labSpectrumLabel.text(stella.strings.noLabSpectrum);
        }

        //  spectra min and max text

        $("#lambdaMin").val( stella.spectrumManager.skySpectrumView.lambdaMin.toFixed(1));
        $("#lambdaMax").val( stella.spectrumManager.skySpectrumView.lambdaMax.toFixed(1));

        //  starResult tab

        stella.ui.starResultType = $("#starResultTypeMenu").val();

        var tStarResultHeadText = " ";      //  the results "headline"
        var tStarResultUnitsText = " ";
        var tBadgePrivilegeText = "";

        var tResultType = stella.ui.starResultType;    //  e.g.,, "pos_x", "temp"
        var tResultName = stella.starResultTypes[ tResultType].name;

        if (stella.manager.focusSystem === null) {
            tStarResultHeadText = "Point at a star to record results";
        } else {
            tStarResultUnitsText = stella.starResultTypes[ tResultType ].units;

            tStarResultHeadText = stella.manager.focusSystem.id + ": ";
            tStarResultHeadText += tResultName + " = ";
            tStarResultHeadText += stella.ui.starResultValue !== null ? stella.ui.starResultValue : "(enter a value)";
            tStarResultHeadText += " (" + tStarResultUnitsText + ")";
        }
        this.starResultHeadline.text( tStarResultHeadText );
        this.starResultUnits.text( tStarResultUnitsText );

        var tRelValText = "";   //  for constructing "relevant values" to help the user know what to type
        switch( tResultType) {
            case "pos_x":       //  for position, report the telescope pointing
            case "pos_y":
                tRelValText += "telescope pointing x: " + stella.skyView.telescopeWhere.x.toFixed(6) +
                "° y: " + stella.skyView.telescopeWhere.y.toFixed(6) + "°";
                break;

            default:
                tRelValText += "Possibly relevant values go here.";
        }

        this.relevantValuesText.html( tRelValText );

        //  results, continued: Construct the text about badges and their privileges.

        var tLevel = stella.badges.badgeLevelForResult( tResultType );
        var tBadgeName = stella.badges.badgeStatus[ stella.badges.badgeIDbyResultType[tResultType]].name;

        if (tLevel > 0)    {   //      we have a badge!
            tBadgePrivilegeText = "You're level " + tLevel +
                " for " + tBadgeName + ", so you can get an automatic value!";
            this.findAutoResultButton.show();
        } else {    //  hide the button
            tBadgePrivilegeText = "You do not have the " + tBadgeName + " badge, so you cannot get an automatic value.";
            this.findAutoResultButton.hide();
        }

        //  install this badges stuff

        this.badgePrivilegeText.html( tBadgePrivilegeText );    //  on the results tab
        this.badgesreport.html( stella.badges.toHTML());        //  on the badges tab
    },


    /**
     * This handler triggers telescope pointing by typing text into the box on the Sky tab
     * @param e     the keyboard event
     */
    keypressInStarPointingBox : function(e) {
        if (e.type === "blur" || e.keyCode === 13) {    //  tab (e.type === "blur") or enter, respectively
            var tText = this.pointAtStarInputField.val();
            var tSys = stella.model.systemFromTextID( tText );
            stella.manager.pointAtSystem( tSys );
        }
    },

    /**
     * Called at the beginning: make the menu that includes all possible star results
     * stella.starResultTypes lives in StarResult.js.
     * @returns {string}
     */
    assembleStarResultMenu: function () {
        var oMenu = '<select  id="starResultTypeMenu" onchange="stella.manager.starResultTypeChanged()">\n';

        for (var m in stella.starResultTypes) {
            if (stella.starResultTypes.hasOwnProperty(m)) {
                oMenu += '<option value="' + stella.starResultTypes[m].id + '">' + stella.starResultTypes[m].name + '</option>\n';
            }
        }

        oMenu += "</select>";
        return oMenu;
    },

    /**
     * Define members corresponding to many id = "whatever" attributes in the html.
     */
    initializeUINames : function() {

        this.newGameButton = $("#newGameButton");
        this.starInfoTextField = $("#starInfo");        //  the big blue bar text
        this.shortStatusField = $("#shortStatus");
        this.pointAtStarInputField = $("#pointAtStar");
        this.telescopeStatusText = $("#telescopeStatusText");


        //  results tab items

        $("#starResultMenu").html( this.assembleStarResultMenu() );
        this.relevantValuesText = $("#relevantValuesText");
        this.badgePrivilegeText = $("#badgePrivilegeText");
        this.findAutoResultButton = $("#findAutoResult");
        this.starResultHeadline = $("#starResultHeadline");
        this.starResultUnits = $("#starResultUnits");

        //  badges tab

        this.badgesreport = $("#badgesHTML");

        //  spectra tab

        this.labSpectrumLabel = $("#labSpectrumLabel");
        this.skySpectrumLabel = $("#skySpectrumLabel");
        this.gainSlider = $('#labSpectrographGainSlider');
        this.labTempSlider = $('#labTempSlider');

        this.gainSlider.slider( {
                min : 1,
                max : 10,
                values : 1,
                step : 1,
                slide : function(e, ui) {
                    stella.spectrumManager.labSpectrumView.gain = Number( ui.value );
                    $('#gainDisplay').text(stella.spectrumManager.labSpectrumView.gain);
                    stella.spectrumManager.spectrumParametersChanged();
                }
            }
        );

        this.labTempSlider.slider( {
                min : 1000,
                max : 30000,
                values : [ stella.constants.solarTemperature ],
                step : 100,
                slide : function(e, ui) {
                    stella.model.labBlackbodyTemperature = Number( ui.value );
                    $('#labTempDisplay').text(stella.model.labBlackbodyTemperature);
                    stella.spectrumManager.spectrumParametersChanged();
                }
            }
        );

    }
};

