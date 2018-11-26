/**
 * Created by tim on 10/10/16.


 ==========================================================================
 stella.spectrumManager.js in gamePrototypes.

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

stella.spectrumManager = {

    labSpectrumView: null, //  SpectrumView object
    skySpectrumView: null,


    newGame : function() {
        this.skySpectrumView = new SpectrumView("skySpectrumDisplay", stella.spectrumManager);  //  ids of the two SVGs
        this.labSpectrumView = new SpectrumView("labSpectrumDisplay", stella.spectrumManager);
    },

    /**
     * Use has changed something in the spectrum tab.
     * Make appropriate changes.
     */
    spectrumParametersChanged: function () {
        this.setSpectrogramWavelengthsToTypedValues();       //  read min and max from boxes in the UI
        this.updateLabSpectrum();
        stella.manager.updateStella();  //  todo: event!
    },

    /**
     * Actually display both spectra
     */
    displayAllSpectra: function () {
        this.skySpectrumView.displaySkySpectrum(stella.manager.focusSystem);
        this.labSpectrumView.displayLabSpectrum(stella.model.labSpectrum);
    },

    /**
     * Emit one spectrum's worth of data to CODAP
     * @param iWhich    "sky" or "lab"
     */
    saveSpectrumToCODAP: function (iWhich) {

        var tSpectrum, tTitle, tSpectrumView, tChannels;

        switch (iWhich) {
            case "sky":
                tSpectrum = stella.model.skySpectrum;
                tSpectrumView = this.skySpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.manager.focusSystem.sysID;
                break;

            case "lab":
                tSpectrum = stella.model.labSpectrum;
                tSpectrumView = this.labSpectrumView;
                tChannels = tSpectrumView.zoomChannels;
                tTitle = stella.model.labSpectrum.source.shortid;
                break;

            default:
        }

        if (tSpectrumView.channels.length > 0) {
            stella.connector.emitSpectrum(tChannels, tTitle);
            stella.model.stellaElapse(stella.constants.timeRequired.saveSpectrum);
        }

        stella.manager.updateStella();
    },

    /**
     * Decide what kind of lab spectrum we're making, then have it made
     */
    updateLabSpectrum: function () {
        //  first, figure out the Lab spectrum
        var tSpectrumType = $('input[name=sourceType]:checked').val();
        stella.model.dischargeTube = $("#dischargeTubeMenu").val();

        if (tSpectrumType === "discharge") {
            stella.model.installDischargeTube();
        } else {
            stella.model.installBlackbody();
        }
    },

    /**
     * Take the numbers in the boxes and use them to set the limits of the spectra
     */
    setSpectrogramWavelengthsToTypedValues: function () {
        var tLMin = Number($("#lambdaMin").val());
        var tLMax = Number($("#lambdaMax").val());

        this.labSpectrumView.adjustLimits(tLMin, tLMax);
        this.skySpectrumView.adjustLimits(tLMin, tLMax);
    },

    /**
     * Handle a click in the SpectrumView
     * Change the limits appropriately.
     * @param e
     */
    clickInSpectrum: function (e) {
        var tSpecView = stella.spectrumManager.labSpectrumView; //  todo: maybe make this work on the target, in case the skySpectrumView is of a different dimension

        //  todo: consider whether this can all be avoided with viewBox and making TWO spectrumViews.
        var uupos = tSpecView.paper.node.createSVGPoint();
        uupos.x = e.clientX;
        uupos.y = e.clientY;

        var ctm = e.target.getScreenCTM().inverse();

        if (ctm) {
            uupos = uupos.matrixTransform(ctm);
        }

        //  now calculate the wavelength that got clicked.

        var tLambda = 0;
        var tRange = tSpecView.lambdaMax - tSpecView.lambdaMin; //  range in the zoomed spectrum

        var tFrac = uupos.x / tSpecView.spectrumViewWidth;
        var tZoomFactor = 0.7;

        if (uupos.y <= tSpecView.mainSpectrumHeight) {
            var tTotalRange = tSpecView.lambdaMaxPossible - tSpecView.lambdaMinPossible;
            tLambda = tSpecView.lambdaMinPossible + tFrac * tTotalRange;
        } else if (uupos.y >= tSpecView.mainSpectrumHeight + tSpecView.interspectrumGap) {
            tLambda = tSpecView.lambdaMin + tFrac * tRange;
            if (tLambda < tSpecView.lambdaMin || tLambda > tSpecView.lambdaMax) {
                tZoomFactor = 1.0;      //      just translate if outside the zoom area
            }
        } else {
            tZoomFactor = 2.0;    //      zoom back out
            tLambda = (tSpecView.lambdaMax + tSpecView.lambdaMin) / 2;
        }

        tRange *= tZoomFactor;
        var tMin = tLambda - tRange / 2;
        var tMax = tLambda + tRange / 2;
        tMin = tMin < tSpecView.lambdaMinPossible ? tSpecView.lambdaMinPossible : tMin;
        tMax = tMax > tSpecView.lambdaMaxPossible ? tSpecView.lambdaMaxPossible : tMax;

        tMin = Math.round(tMin * 10) / 10.0;
        tMax = Math.round(tMax * 10) / 10.0;
        if (tMax - tMin < 1.0) {
            var tMid = (tMax + tMin) / 2;
            tMax = tMid + 0.5;
            tMin = tMid - 0.5;
        }

        stella.spectrumManager.labSpectrumView.adjustLimits(tMin, tMax);  //  sets lambdaMin, lambdaMax
        stella.spectrumManager.skySpectrumView.adjustLimits(tMin, tMax);

        stella.manager.updateStella();  //  calls displayAllSpectra
    }
};