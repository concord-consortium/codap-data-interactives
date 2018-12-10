/**
 * Created by tim on 5/23/16.


 ==========================================================================
 Spectrum.js in data-science-games.

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

/*
 The filters are selected so that the mean wavelengths
 of response functions are 364 nm for U, 442 nm for B, 540 nm for V.
 The zero point of the B−V and U−B color indices were defined such as
 to be about zero for A0 main sequence stars not affected by interstellar reddening.

 https://en.wikipedia.org/wiki/UBV_photometric_system

 We will set type A0 to be 10,000 K, and use that for our zero point for each of the photometric bands.
 For simplicity, we'll compute it using the blackbody ONLY,
 */

/*
channelization creates an array of objects with {min:, max:, intensity}
normalized so that the max intensity is 100.
We might change that normalization (and perhaps topcode it) if we implement dwell times in spectra.
 */
/* global $, console, Line */

/**
 * A Spectrum is basically an array of Lines with additional flags and parameters.
 * @constructor
 */
var Spectrum = function() {
    this.lines = [];
    this.hasEmissionLines = true;
    this.hasAbsorptionLines = false;
    this.hasBlackbody = false;
    this.blackbodyTemperature = 0;
    this.speedAway = 0;      //  cm/sec. c is Spectrum.constants.light.
    this.source = { brightness : 100 };
    this.theStar = null;
};

/**
 * The consequences of this spectrum being of a star.
 * Add lines, BB temp, etc.
 * Refer to the star itself because we'll need the distance and stellar radius for spectral intensity.
 * @param iStar
 */
Spectrum.prototype.setStar = function(iStar) {
    this.theStar = iStar;

    var tTemp = this.theStar.logTemperature;

    this.hasAbsorptionLines = true;
    this.hasEmissionLines = false;
    this.hasBlackbody = true;
    this.blackbodyTemperature = Math.pow(10, tTemp);

    //  NB: no Lithium
    this.addLinesFrom(elementalSpectra.H, 50 * Spectrum.linePresenceCoefficient("H", tTemp));
    this.addLinesFrom(elementalSpectra.HeI, 30 * Spectrum.linePresenceCoefficient("HeI", tTemp));
    this.addLinesFrom(elementalSpectra.NaI, 40 * Spectrum.linePresenceCoefficient("NaI", tTemp));
    this.addLinesFrom(elementalSpectra.CaII, 30 * Spectrum.linePresenceCoefficient("CaII", tTemp));
    this.addLinesFrom(elementalSpectra.FeI, 30 * Spectrum.linePresenceCoefficient("FeI", tTemp));

    this.speedAway = this.theStar.radialVelocity() * 1.0e05;    //      cm/sec, right??
    this.source.id = this.theStar.id;

    //  fix line width for giantism
    if (iStar.myGiantIndex > 0 && iStar.myGiantIndex <= 1.0) {
        var tWidth = elementalSpectra.mainSequenceWidth
            + iStar.myGiantIndex * (elementalSpectra.giantWidth - elementalSpectra.mainSequenceWidth);
        this.lines.forEach( function(l) {
            l.width = tWidth;
        })
    }
};

/**
 * Add a single Line to this Spectrum
 * @param iLine the Line to add
 */
Spectrum.prototype.addLine = function( iLine ) {
    this.lines.push( iLine );
};

/**
 * Add all the lines from a Spectrum to this one
 * @param iSpectrum     source
 * @param iAmp          at what amplitude? These amplitudes are percentages, and multiply the Line's inherent strength.
 */
Spectrum.prototype.addLinesFrom = function( iSpectrum, iAmp ) {
    iSpectrum.lines.forEach( function(iLine) {
        var tLine = new Line(iLine.restLambda, iLine.width, iLine.strength * iAmp / 100, iLine.what);
        this.lines.push( tLine );
    }.bind(this));
};

/**
 * What is the total intensity between these two wavelengths
 * @param iMin
 * @param iMax
 * @returns {number}
 */
Spectrum.prototype.intensityBetween = function( iMin, iMax ) {
    var oIntensity = 0;

    //  add the intensity for all emission lines
    if (this.hasEmissionLines) {
        oIntensity = this.lines.reduce(function (total, iLine) {
            return total + iLine.intensityBetween(iMin, iMax, this.speedAway);
        }.bind(this), 0);
    }

    //  add any blackbody
    if (this.hasBlackbody) {
        //  2017.04.13  changed to relative so we can add absorption spectra from two stars of diff temps.
        //              This means normalization has to happen LATER. NOT in channelize() -- even earlier,
        //              SpectrumView.displaySkySpectrum, and .normalize...

        oIntensity += Spectrum.relativeBlackbodyIntensityAt( (iMin + iMax) / 2.0, this.blackbodyTemperature, this.speedAway );

        //  oIntensity += this.normalizedBlackbodyAtWavelength( (iMin + iMax) / 2.0, this.speedAway );
    }

    //  todo: change this so that stars can have emission and absorption. Later.

    //  reduce using the intensity for all absorption lines
    if (this.hasAbsorptionLines) {
        var tReduction = this.lines.reduce(function (total, iLine) {
            return total + iLine.intensityBetween(iMin, iMax, this.speedAway);
        }.bind(this), 0);
        oIntensity *= (100.0 - tReduction) / 100.0;
        if (oIntensity < 0) { oIntensity = 0; }
    }

    return oIntensity;
};

/**
 * Divide the wavelength interval to be displayed into bins,
 * and make an array that gives the intensity in each bin.
 * @param iMin      min wavelength to be displayed in nm
 * @param iMax      max
 * @param iNBins    how many bins?
 * @returns {Array} Array of channel objects: { intensity, min (wavelength, nm), max }
 */
Spectrum.prototype.channelize = function( iMin, iMax, iNBins )    {
    var oChannels= [];
    var tLambda = iMin;        //  bottom of the interval
    var tResolution = (iMax - iMin) / iNBins;

    var tMaxIntensity = 0;

    for ( var i = 0; i < iNBins; i++ ) {
        tLambda = iMin + i * tResolution;
        var tI = this.intensityBetween( tLambda, tLambda + tResolution);
        if (tI > tMaxIntensity) { tMaxIntensity = tI; }
        oChannels.push(
            {
                intensity : tI,
                min : tLambda,
                max : tLambda + tResolution
            }
        );
    }

    //  if this is a stellar spectrum, adjust for stellar size and distance

    var tIntensityFactor = this.theStar ? Math.pow(10, 2 * this.theStar.logRadius) / Math.pow( this.theStar.distance, 2) : 1;
    oChannels.forEach(function(c) {
        c.intensity *= tIntensityFactor;
    });

    return oChannels;   //  note: NOT normalized to 100!
};

/**
 * Calculate the blackbody intensity at a wavelength,
 * set so that the maximum value in the visible interval is 100.
 * @param iLambda       in nm
 * @param iSpeedAway
 * @returns {number}
 */
Spectrum.prototype.normalizedBlackbodyAtWavelength = function (iLambda, iSpeedAway) {
    var tLambda =  iLambda;      //  convert nm to cm

    //  compute the wavelength where the function is a maximum
    var tMaxLambda = Spectrum.constants.wien / this.blackbodyTemperature;       //   in cm. Wien's displacement law.

    if (tMaxLambda < Spectrum.constants.visibleMin) {
        tMaxLambda = Spectrum.constants.visibleMin;   //  ah, the peak is in UV, so we pick 350 nm.
    }
    if (tMaxLambda > Spectrum.constants.visibleMax) {
        tMaxLambda = Spectrum.constants.visibleMax;   //  peak is in IR, so we use 700 nm.
    }
    var tMaxIntensity = Spectrum.relativeBlackbodyIntensityAt(tMaxLambda, this.blackbodyTemperature, iSpeedAway);  //  this will be our denominator

    var tIntense = Spectrum.relativeBlackbodyIntensityAt(tLambda, this.blackbodyTemperature, iSpeedAway);
    return 100.0 *  tIntense / tMaxIntensity;
};

/**
 * Raw blackbody intensity calculation.
 * NOTE: Class method!
 * @param iLambda       wavelength (nm)
 * @param iTemp         temperature (K)
 * @param iSpeedAway    radial velocity (km/sec)
 * @returns {number}
 */
Spectrum.relativeBlackbodyIntensityAt = function (iLambda, iTemp, iSpeedAway) { //  todo: implement BB doppler
    var cmLambda = iLambda * 1.0e-07;  //  convert to cm for physics calculations

    var kT = Spectrum.constants.boltzmann * iTemp;
    var hNu = Spectrum.constants.planck * Spectrum.constants.light / cmLambda;
    var csq = Spectrum.constants.light * Spectrum.constants.light;

    var tDenom =  (Math.exp( hNu / kT)) - 1.0;

    return (2 * csq * Spectrum.constants.planck / (Math.pow(cmLambda, 5))) * (1.0 / tDenom);
};

/**
 * Miscellaneous spectral constants
 * @type {{planck: number, light: number, boltzmann: number, wien: number, visibleMin: number, visibleMax: number}}
 */
Spectrum.constants = {
    planck      : 6.626e-27,  //  h in cgs
    light       : 2.997e10,   //  c in cgs
    boltzmann   : 1.38e-16,      //  k in cgs
    wien        : 0.2898,        //  b in cgs

    visibleMin : 350,       //  nm
    visibleMax : 700        //  nm

};

/**
 * This routine calculates how much of the spectrum of a given "species" will appear.
 * For example, cool stars show sodium lines easily, but in hot lines, Sodium is ionized.
 *
 * @param iSpecies
 * @param iLogTemp
 * @returns {number}
 */
Spectrum.linePresenceCoefficient = function( iSpecies, iLogTemp ) {

    //      adapted from http://skyserver.sdss.org/dr1/en/proj/advanced/spectraltypes/lines.asp

    if (!stella.options.tempAffectsWhichLinesArePresent) {
        return 1.0;
    }

    var tTemp = Math.pow(10, iLogTemp);     //  actual temperature, not its log
    var oCoeff = 1.0;           //  this will go from 0 to 1

    switch( iSpecies ) {
        case "H":
            /*
            The basic idea is that we make a trapezoid: for Hydrogen, the coefficent is...
            0 under 5000K,
            linearly increasing to 1, from 5000 to 7000
            1 between 7500 and 10000,
            linearly decreasing (to zero) between 10000 and 25000
            0 above 25000
             */
            oCoeff = lineStrengthInterpolator(tTemp, 5000, 7500, 10000, 25000);
            break;

        case "HeI":     //  HeI means "neutal Helium." HeII is singly ionized; it's like H with more nucleus.
            oCoeff = lineStrengthInterpolator(tTemp, 9000, 10000, 28000, 40000);
            break;

        case "CaII":    //  CaII means "singly ionized," that is, it has one electron left in its outer shell.
            oCoeff = lineStrengthInterpolator(tTemp, 4000, 5000, 7500, 10000);
            break;

        case "FeI":
            oCoeff = lineStrengthInterpolator(tTemp, 2500, 3500, 5000, 7500);
            break;

        case "NaI":
            oCoeff = lineStrengthInterpolator(tTemp, 0, 0, 4000, 6000);
            break;
    }

    return oCoeff;

    /**
     * Utility to compute the trapezoidal function described in Spectrum.linePresenceCoefficient().
     * @param iTemp     the temperature
     * @param iMin0     min temp for any response (zero below this value)
     * @param iMinTop   min temp for +1.0 response
     * @param iMaxTop   max temp for +1.0
     * @param iMax0     max temp for any response (zero above this value)
     * @returns {number}
     */
    function lineStrengthInterpolator(iTemp, iMin0, iMinTop, iMaxTop, iMax0) {
        var out = 0;


        if (iTemp > iMax0) {
            out = 0;
        } else if (iTemp > iMaxTop) {
            out = 0.5;
        } else if (iTemp > iMinTop) {
            out = 1.0;
        } else if (iTemp > iMin0) {
            out = 0.5;
        } else {
            out = 0.0;
        }

        return out;
    }
};