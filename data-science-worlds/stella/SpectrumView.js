/**
 * Created by tim on 5/23/16.



 ==========================================================================
 SpectrumView.js in data-science-games.

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
/* global Spectrum, Snap, alert, stella, console */

/**
 * Displays a Spectrum
 *
 * Basic idea: there are two spectra in this view: one showing the entire visible spectrum,
 * and another zoomed in. We keep track of what part is zoomed in, in wavelength and in pixels.
 *
 * A gray shape visually shows the relationship between the two spectra.
 *
 * todo: the scaling ought to be done using viewBox, but it didn't work when I tried it, and I ran out of time!
 *
 * @param iSVGName  name of the SVG element to house this
 * @constructor
 */
var SpectrumView = function (iSVGName, iManager) {
    this.paper = new Snap(document.getElementById(iSVGName));        //      snap.svg paper
    this.manager = iManager;

    //  this.initialize( this.paper.node.clientWidth, this.paper.node.clientHeight);
    this.initialize(300, 60);     //      todo: fix this kludge! Why can't we get the dimensions from the width and height in html? It works for stella.skyview!
};

/**
 * Initialize many SpectrumView quantities
 * @param iWidth
 * @param iHeight
 */
SpectrumView.prototype.initialize = function (iWidth, iHeight) {
    this.totalSpectrumViewHeight = iHeight;
    this.spectrumViewWidth = iWidth;

    //  parameters for drawing the two spectra
    this.interspectrumGap = this.totalSpectrumViewHeight * 0.4;
    this.mainSpectrumHeight = this.totalSpectrumViewHeight * 0.2;
    this.zoomSpectrumHeight = this.totalSpectrumViewHeight - this.interspectrumGap - this.mainSpectrumHeight;

    this.lambdaMinPossible = Spectrum.constants.visibleMin;
    this.lambdaMaxPossible = Spectrum.constants.visibleMax;
    this.lambdaMin = Spectrum.constants.visibleMin;     //  minimum in the zoomed part of the view.
    this.lambdaMax = Spectrum.constants.visibleMax;     //  max in the zoomed view.
    this.pixelMin = 0;
    this.pixelMax = this.spectrumViewWidth;
    this.nBins = 100;
    this.gain = 1.0;
    this.showNoData();

    this.paper.click(this.manager.clickInSpectrum);     //  register the click handler

    console.log("Initialize a spectrum view");
};

/**
 * Set the internal values for min and max wavelength.
 * Also compute what pixel values those correspond to.
 * @param iMin
 * @param iMax
 */
SpectrumView.prototype.adjustLimits = function (iMin, iMax) {
    this.lambdaMin = iMin;
    this.lambdaMax = iMax;

    var tWidth = this.spectrumViewWidth;

    this.pixelMin = this.spectrumViewWidth * (this.lambdaMin - this.lambdaMinPossible) / (this.lambdaMaxPossible - this.lambdaMinPossible);
    this.pixelMax = this.spectrumViewWidth * (this.lambdaMax - this.lambdaMinPossible) / (this.lambdaMaxPossible - this.lambdaMinPossible);
};

/**
 * A string describing the Spectrum
 * @returns {string}
 */
SpectrumView.prototype.toString = function () {
    var out = "Spectrogram of " + this.spectrum.source.id + " " + this.lambdaMin + "-" + this.lambdaMax + " nm";

    return out;
};

/**
 * Call to actually display a spectrum. Installs the given Spectrum in this SpectrumView.
 * @param iSpectrum     Spectrum to display
 */
SpectrumView.prototype.displayLabSpectrum = function (iSpectrum) {
    this.spectrum = iSpectrum;

    //  make two channel arrays, one full-range, one zoomed.
    if (iSpectrum) {
        this.channels = this.spectrum.channelize(this.lambdaMinPossible, this.lambdaMaxPossible, this.nBins);   //  array of objects { intensity, min, max}
        this.zoomChannels = this.spectrum.channelize(this.lambdaMin, this.lambdaMax, this.nBins);   //  array of objects { intensity, min, max}
    }

    this.channels = SpectrumView.normalizeChannelArrayTo( this.channels, 100.0);
    this.zoomChannels = SpectrumView.normalizeChannelArrayTo( this.zoomChannels, 100.0);
    this.paintChannels();       //  actually draw
};

/**
 * Construct the channels from the spectra of the given objects
 * Then display them.
 * @param iObjects  the star or stars whose spectra are superimposed
 */
SpectrumView.prototype.displaySkySpectrum = function (iSystem) {

    this.channels = [];

    if (iSystem) {
        var channelSets = [];
        var zoomChannelSets = [];

        iSystem.stars.forEach(
            function (iStar) {
                var tOneStarSpectrum = iStar.setUpSpectrum();
                channelSets.push(tOneStarSpectrum.channelize(this.lambdaMinPossible, this.lambdaMaxPossible, this.nBins));   //  array of objects { intensity, min, max}
                zoomChannelSets.push(tOneStarSpectrum.channelize(this.lambdaMin, this.lambdaMax, this.nBins));
            }.bind(this)
        );

        this.channels = channelSets[0];         //  start with the first one
        this.zoomChannels = zoomChannelSets[0];

        if (iSystem.stars.length > 1) {         //  if there is another, add it.
            var tCh = channelSets[1];
            var tZCh = zoomChannelSets[1];
            for (var i = 0; i < this.channels.length; i++) {
                this.channels[i].intensity += tCh[i].intensity;
                this.zoomChannels[i].intensity += tZCh[i].intensity;
            }
        }
    }

    this.channels = SpectrumView.normalizeChannelArrayTo( this.channels, 100.0);
    this.zoomChannels = SpectrumView.normalizeChannelArrayTo( this.zoomChannels, 100.0);
    this.paintChannels();
};

/**
 * NOTE: Class method
 *
 * @param iChannels
 * @param iIntensityLimit
 * @returns {*}
 */
SpectrumView.normalizeChannelArrayTo = function( iChannels, iIntensityLimit ) {
    var tMaxIntensity = 0;

    iChannels.forEach( function(c) {
        if (c.intensity > tMaxIntensity) {
            tMaxIntensity = c.intensity;
        }
    });

    iChannels.forEach( function(c) {
        c.intensity *= iIntensityLimit / tMaxIntensity;
    });

    return iChannels;
};

/**
 * Actually draw the spectrum channels.
 */
SpectrumView.prototype.paintChannels = function () {

    var tNChannels = this.channels.length;
    if (tNChannels > 0) {
        this.paper.clear();

        //  this is the gray thing that shows you what part of the spectrum is zoomed.
        this.paper.polygon(
            this.pixelMin, this.mainSpectrumHeight,
            this.pixelMax, this.mainSpectrumHeight,
            this.pixelMax, this.mainSpectrumHeight + this.interspectrumGap / 3,
            this.spectrumViewWidth, this.mainSpectrumHeight + this.interspectrumGap,
            0, this.mainSpectrumHeight + this.interspectrumGap,
            this.pixelMin, this.mainSpectrumHeight + this.interspectrumGap / 3
        ).attr({
            fill: "lightgray",
            stroke: "black"
        });
        var tChannelWidthOnDisplay = this.spectrumViewWidth / (tNChannels);
        var tLeft;

        switch (this.displayType) {

            case "photo":

                //      "main" (whole) spectrum

                tLeft = 0;
                this.channels.forEach(function (ch) {
                    var tBaseIntensity = this.gain * ch.intensity / 100;     //  now in [0, 1]
                    if (tBaseIntensity > 1.0) {
                        tBaseIntensity = 1.0;
                    }

                    var tColor = SpectrumView.intensityAndWavelengthToRGB(tBaseIntensity, ch.min);
                    this.paper.rect(tLeft, 0, tChannelWidthOnDisplay, this.mainSpectrumHeight).attr({
                        fill: tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));

                //  "zoom" spectrum

                tLeft = 0;  //  reset to left edge
                this.zoomChannels.forEach(function (ch) {
                    var tBaseIntensity = this.gain * ch.intensity / 100;     //  now in [0, 1]
                    if (tBaseIntensity > 1.0) {
                        tBaseIntensity = 1.0;
                    }

                    var tColor = SpectrumView.intensityAndWavelengthToRGB(tBaseIntensity, ch.min);
                    this.paper.rect(
                        tLeft,
                        this.mainSpectrumHeight + this.interspectrumGap,
                        tChannelWidthOnDisplay,
                        this.zoomSpectrumHeight).attr({
                        fill: tColor
                    });
                    tLeft += tChannelWidthOnDisplay;
                }.bind(this));
                break;


            default:
                break;
        }
    } else {
        this.showNoData();      //  this.initialize();
    }
};

/**
 * If there is no data, display something to that effect
 */
SpectrumView.prototype.showNoData = function () {
    this.spectrum = null;
    this.channels = [];
    this.zoomChannels = [];
    this.displayType = "photo";
    this.background = this.paper.rect(0, 0, this.paper.node.clientWidth, this.paper.node.clientHeight).attr({
        fill: "yellow"
    });
    this.paper.text(30, 20, "no data");

};


/**
 * Get a suitable (hex, string) color to use at a particular wavelength
 * todo: improve the colors, especially at the violet end
 * @param iSignal
 * @param iLambdaNM
 */
SpectrumView.intensityAndWavelengthToRGB = function (iSignal, iLambdaNM) {

    var Red, Green, Blue;

    if ((iLambdaNM >= 350) && (iLambdaNM < 440)) {
        Red = -(iLambdaNM - 440) / (440 - 350);
        Green = 0.0;
        Blue = 1.0;
    } else if ((iLambdaNM >= 440) && (iLambdaNM < 490)) {
        Red = 0.0;
        Green = (iLambdaNM - 440) / (490 - 440);
        Blue = 1.0;
    } else if ((iLambdaNM >= 490) && (iLambdaNM < 510)) {
        Red = 0.0;
        Green = 1.0;
        Blue = -(iLambdaNM - 510) / (510 - 490);
    } else if ((iLambdaNM >= 510) && (iLambdaNM < 580)) {
        Red = (iLambdaNM - 510) / (580 - 510);
        Green = 1.0;
        Blue = 0.0;
    } else if ((iLambdaNM >= 580) && (iLambdaNM < 645)) {
        Red = 1.0;
        Green = -(iLambdaNM - 645) / (645 - 580);
        Blue = 0.0;
    } else if ((iLambdaNM >= 645) && (iLambdaNM < 781)) {
        Red = 1.0;
        Green = 0.0;
        Blue = 0.0;
    } else {
        Red = 0.0;
        Green = 0.0;
        Blue = 0.0;
    }

    Red *= iSignal;
    Green *= iSignal;
    Blue *= iSignal;

    return Snap.rgb(255 * Red, 255 * Green, 255 * Blue);    //  convert to hex
};