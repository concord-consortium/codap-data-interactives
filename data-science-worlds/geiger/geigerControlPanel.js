/*
 ==========================================================================
 geigerControlPanel.js

 View for the part of the game that's below the gauge.

 Author:   Tim Erickson

 Copyright (c) 2015 by The Concord Consortium, Inc. All rights reserved.

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
/**
 * Created by tim on 10/19/15.
 */


var geigerControlPanel;

geigerControlPanel = {
    /**
     * Display function: basic info about the sim.
     * @param message {string} The string message.
     */
    displayInfo: function( message ) {
        var geigerInfoText = document.getElementById('geigerInfo');
        geigerInfoText.innerHTML = message;
    },

    /**
     * Display function: the latest count from the geiger counter
     * @param count The number to display
     */
    displayGeigerCount: function(count, distance) { //  todo: use spans in HTML

        var geigerCountText = document.getElementById('geigerCount');
        var tAssembledText = "";
        var tDisplayDistance = Math.round(100 * distance)/100;

        if (geigerOptions.showDistance) {
            tAssembledText += "dist: " + (tDisplayDistance);
        }

        var tDisplayCoordinates = "(" + geigerGameModel.detectorX;
        if (geigerManager.twoDimensional) tDisplayCoordinates += ", " + geigerGameModel.detectorY;
        tDisplayCoordinates += ")";

        geigerCountText.innerHTML =
            tAssembledText + " count : " + (count) + " at " + tDisplayCoordinates +
            "<br>Dose: " + geigerGameModel.dose + ".";

    }

}