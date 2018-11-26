/**
 * Created by tim on 4/12/17.


 ==========================================================================
 photometryManager.js in gamePrototypes.

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


stella.photometryManager = {

    photometryView: null,

    instrumentNoisePerSecond : 10,
    maxCount : 99999,

    starCount: 0,
    skyCount: 0,

    expose: function (iTime) {

        //  todo: base this on telescope pointing, not on focusSystem. Or use focusSystem, tbd

        var tTargetName = "sky";

        if (stella.manager.focusSystem) {
            this.starCount = this.getTargetCount(stella.manager.focusSystem, iTime);
            tTargetName = stella.manager.focusSystem.sysID;
        } else {
            this.starCount = this.getSkyCount( iTime );
        }
        this.skyCount = this.getSkyCount( iTime );

        tChannels = [];
        tChannels.push(
            {
                target: tTargetName,
                exposure: iTime,
                obs: 'target',
                count: this.starCount
            }
        );
        tChannels.push(
            {
                target: tTargetName,
                exposure: iTime,
                obs: 'sky',
                count: this.skyCount
            }
        );
        this.savePhotometryToCODAP(tChannels);

        var tTimeWord = "second" + (iTime === 1 ? "" : "s");

        $('#photometryResultsText').html(
            "<strong>Most recent results</strong><br><br>" +
                "exposure: " + iTime + " " + tTimeWord + "<br>" +
                tTargetName + ": " + this.starCount + "<br>" +
                "sky : " + this.skyCount
        )

    },

    getSkyCount: function ( iDwell ) {
        var tCount = Math.round(this.instrumentNoisePerSecond * iDwell)
        var out = TEEUtils.randomPoisson(tCount);
        out = out > this.maxCount ? this.maxCount : out;
        return out;
    },

    getTargetCount: function (iObject, iDwell) {
        var tLum = Math.pow(10, iObject.bright( stella.state.currentFilter ));  //  remember star.bright() is log apparent brightness
        var tCount = tLum * iDwell + this.getSkyCount( iDwell )
        var out = TEEUtils.randomPoisson(tCount);
        out = out > this.maxCount ? this.maxCount : out;
        return out;
    },

    savePhotometryToCODAP: function (iChannels) {
        stella.connector.emitPhotometry(iChannels);
        stella.model.stellaElapse(stella.constants.timeRequired.savePhotometry);
        stella.manager.updateStella();
    }
};