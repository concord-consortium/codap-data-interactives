/**
 * Created by tim on 5/7/16.


 ==========================================================================
 Star.js in data-science-games.

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

/**
 * Model class for stars
 */

/*
 Notes on eta Cas itself:
 Double. We'll talk about the primary:
 V = 3.44
 U-B = 0.02
 B-V = 0.58
 distance = 5.95 (pc)

 Now the companion, Eta Cassiopeiae B
 Period (P)	480 yr
 Semi-major axis (a)	11.9939"
 Eccentricity (e)	0.497
 Inclination (i)	34.76°
 Longitude of the node (Ω)	98.42°
 Periastron epoch (T)	1889.6
 Argument of periastron (ω) 88.59°
 (secondary)
 */

/**
 * Constructor
 * @constructor
 */

/* global Snap, Spectrum, stella, elementalSpectra, TEEUtils */

/**
 * Notes on position
 * {x, y, r}
 * where x and y are IN DEGREES and r is in pc.
 */


/**
 * Construct a model Star. Called from stella.model.makeAllStars()
 * @param iStarData
 * @constructor
 */
var Star = function (iStarData, iSystem) {

    this.logMass = Number(iStarData.logMass);
    this.logAge = Number(iStarData.logAge);
    this.id = iStarData.id;

    this.distance = iSystem.where.z;
    this.radVel = iSystem.pm.r;

    //  what depends on mass and age...

    this.logRadius = iStarData.logRadius;
    this.logLuminosity = iStarData.logLum;
    this.logTemperature = iStarData.logTemp;      //  start on main sequence
    this.logLifetime = iStarData.logLifetime;
    this.myGiantIndex = iStarData.giant;

    this.varPeriod = iStarData.varPeriod;
    this.varAmplitude = iStarData.varAmplitude;
    this.varPhase = iStarData.varPhase;

    this.binPeriod = iStarData.binPeriod;
    this.binAmplitude = iStarData.binAmplitude;    //      km/sec
    this.binPhase = iStarData.binPhase;

    //  this.evolve();     //  old enough to move off the MS?
    //  this.doPhotometry();    //  calculate UBV (etc) magnitudes
};

Star.prototype.reportTrueValue = function (iValueType) {
    var out;
    var outDisplay;
    var outOK;

    outOK = true;   //  is there a good value?

    switch (iValueType) {
        case "temp":
            out = this.logTemperature;
            break;
        case "vel_r":
            out = this.pm.r;
            break;
        case "pm_x":
            out = this.pm.x * 1000000;   //      because it's in microdegrees
            break;
        case "pm_y":
            out = this.pm.y * 1000000;   //      because it's in microdegrees
            break;
        case "pos_x":
            out = this.positionAtTime(stella.state.now).x;
            break;
        case "pos_y":
            out = this.positionAtTime(stella.state.now).y;
            break;
        case "parallax":
            out = this.parallax;
            break;
        default:
            break;
    }

    outDisplay = out;
    if (iValueType === "temp") {
        outDisplay = Math.pow(10, out);
    }
    return {trueValue: out, trueDisplay: outDisplay, OK: outOK};
};

Star.prototype.csvLine = function () {
    return this.id + "," + this.logMass + "," + this.logAge + "," +
        this.where.x + "," + this.where.y + "," + this.where.z + "," +
        this.vx + "," + this.vy + "," + this.vr;
};

Star.prototype.htmlTableRow = function () {
    var o = "<tr>";
    o += "<td>" + this.id + "</td>";
    o += "<td>" + this.logMass.toFixed(2) + "</td>";
    o += "<td>" + Math.pow(10,this.logTemperature).toFixed(0) + "</td>";
    o += "<td>" + this.logAge.toFixed(2) + "</td>";
    o += "<td>" + this.logLuminosity.toFixed(2) + "</td>";
    o += "<td>" + this.bright(null).toFixed(2) + "</td>";
    o += "<td>" + this.myGiantIndex.toFixed(2) + "</td>";
    o += "<td>" + this.distance.toFixed(2) + "</td>";
    o += "<td>" + this.varPeriod.toFixed(2) + "</td>";
    o += "</tr>";

    return o;
};


/**
 * Calculate apparent magnitude from absolute and distance
 * @param iAbsoluteMagnitude
 * @param iDistance
 * @returns {*}
 */
Star.apparentMagnitude = function (iAbsoluteMagnitude, iDistance) {
    return iAbsoluteMagnitude + 5 * (Math.log10(iDistance) - 1);
};

/**
 * Make THIS star's spectrum.
 * Only need it when we have to put it up, so we don't store it.
 * @returns {Spectrum}
 */
Star.prototype.setUpSpectrum = function () {
    var tSpectrum = new Spectrum();
    tSpectrum.setStar(this);
    return tSpectrum;
};


/**
 * UBV photometry using blackbody.
 * Assume Sun = 5800K, and all its absolute magnites are as listed.
 */
Star.prototype.doPhotometry = function () {

    this.mAbs = 4.85 - 2.5 * this.logLuminosity;
    this.mApp = Star.apparentMagnitude(this.mAbs, this.distance);

    var solarU = 5.61;  //  solar mags from http://www.ucolick.org/~cnaw/sun.html
    var solarB = 5.48;
    var solarV = 4.83;
    //  var solarR = 4.42;
    //  var solarI = 4.08;

    var tSolar = 5800;

    var tTemp = Math.pow(10, this.logTemperature);
    var tRadius = Math.pow(10, this.logRadius);

    var L_solarU = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tSolar);
    var L_solarB = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tSolar);
    var L_solarV = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tSolar);
    var L_star_U = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaU, tTemp) * tRadius * tRadius;
    var L_star_B = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaB, tTemp) * tRadius * tRadius;
    var L_star_V = Spectrum.relativeBlackbodyIntensityAt(stella.constants.lambdaV, tTemp) * tRadius * tRadius;

    this.uAbs = solarU - 2.5 * Math.log10(L_star_U / L_solarU);
    this.bAbs = solarB - 2.5 * Math.log10(L_star_B / L_solarB);
    this.vAbs = solarV - 2.5 * Math.log10(L_star_V / L_solarV);

};

Star.prototype.radialVelocity = function() {
    var dRadVel = 0;    //  change in radial velocity due to binary

    if (this.binPeriod > 0) {
        dRadVel = this.binAmplitude * Math.sin(this.binPhase + stella.state.now * Math.PI * 2 / this.binPeriod);
    }
    var tCurrentRadVel = this.radVel + dRadVel;
    return tCurrentRadVel;
};

/**
 * What is the current log of the absolute luminosity? That is, at the source.
 * Uses the inherent constant this.logLuminosity as a base.
 *
 * @param iFilter   filter being used
 * @returns {*}
 */
Star.prototype.logAbsoluteLuminosity = function( iFilter ) {
    if (!iFilter) {
        iFilter = { min : Spectrum.constants.visibleMin, max : Spectrum.constants.visibleMax };
    }

    var lambda0 = iFilter.min;
    var lambda1 = (iFilter.max + iFilter.min) / 2.0;
    var lambda2 = iFilter.max;

    var flux0 = Spectrum.relativeBlackbodyIntensityAt(lambda0, Math.pow(10,this.logTemperature), this.radialVelocity());
    var flux1 = Spectrum.relativeBlackbodyIntensityAt(lambda1, Math.pow(10,this.logTemperature), this.radialVelocity());
    var flux2 = Spectrum.relativeBlackbodyIntensityAt(lambda2, Math.pow(10,this.logTemperature), this.radialVelocity());

    var simpsonIntegral = (1/6.0) * (flux0 + 4 * flux1 + flux2) * (lambda2 - lambda0) * 1.0e-07;  //

    var tempAbsoluteLogLumInThisFilter = Math.log10(simpsonIntegral) + 2 * this.logRadius;

    var dLogLum = 0;   //  change in LOG of amplitude due to variability

    if (this.varPeriod > 0) {
        var tAmplitudeOfFluctuationInTheLog = Math.log10(this.varAmplitude + 1);     //  so it will be 0 if the amplitude is zero, log(1.3) if .3, etc.
        dLogLum = tAmplitudeOfFluctuationInTheLog * Math.sin(this.varPhase + stella.state.now * Math.PI * 2 / this.varPeriod);
    }
    var tCurrentLogAbsLum = tempAbsoluteLogLumInThisFilter + dLogLum;
    return tCurrentLogAbsLum;
};

/**
 * Returns the current apparent LOG brightness. todo : DOES ANYBODY CALL THIS?? (as opposed to system brightness
 * @returns {number}
 */

Star.prototype.bright = function( iFilter ) {
    return this.logAbsoluteLuminosity( iFilter ) - 2 * Math.log10(this.distance) - 4;   //  - 4; //  arbitrary const to get lum down

};

/**
 * String version of me
 * @returns {string}
 */
Star.prototype.toString = function () {
    var out = Math.pow(10, this.logMass).toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logMainSequenceTemperature));
    out += ", " + this.logLuminosity.toFixed(2);
    out += ", " + this.mApp.toFixed(2);
    out += ", " + Math.round(Math.pow(10, this.logLifetime - 6));
    out += ", " + this.where.x.toFixed(2) + ", " + this.where.y.toFixed(2) + ", " + this.where.z.toFixed(2);
    out += ", " + this.myGiantIndex.toFixed(2) + ", " + this.varPeriod.toFixed(2);

    return out;
};

/**
 * Very short ID string useful for the status bar
 * @returns {string}
 */
Star.prototype.infoText = function () {

    return this.id + " m = " + this.mApp.toFixed(2);
};

//------------------------------------------
//      VIEW class

/**
 * Make a new StarView.
 * @param iSys     which Star System
 * @param iPaper    the paper of the SKY, to which we attach this view
 * @constructor
 */
var StarView = function (iSys, iPaper) {
    this.system = iSys;          //  view knows about the model
    this.myCircle = iPaper.circle(2.5, 2.5, 0.01);
    this.setSizeEtc(  );

    //  this.myCircle.dblclick(stella.manager.doubleClickOnAStar);
    this.myCircle.click(this.clickOnASystem.bind(this));
};

StarView.prototype.setSizeEtc = function (  ) {
    var tOpacity = 1.0;
    var tRadius = 1;
    var tDegreesPerPixel = stella.constants.universeWidth / stella.state.magnification / stella.skyView.originalViewWidth;
    var tGray = 17;

    //  The scale and brightness of stars depends on magnification

    var tLumElbow = 3.5 - Math.log10(stella.state.magnification);       //  at what log lum do we get to 1 px?
    var tLumLimit = 2.5 - 1.25 * Math.log10(stella.state.magnification);  //  at what log lum are we invisible?

    var tBright = this.system.bright(null);

    if (tBright > tLumElbow) {
        tRadius *= tBright - tLumElbow + 1;
    } else if (tBright > tLumLimit) {
        tOpacity = (tBright - tLumLimit) / (tLumElbow - tLumLimit);
    } else {
        tOpacity = 0.0;
    }

    var tColor = Snap.rgb(tGray * 15, tGray * 15, tGray * 15);    //  put color in here if we want

    //  convert to current positions!

    var tCurrentWhere = this.system.positionAtTime(stella.state.now);

    //  actually make the circle! Be sure to reverse the y coordinate.

    if (tOpacity <= 0) {
        tRadius = 0;
        tOpacity = 0;
    }

    this.myCircle.animate({
        cx: tCurrentWhere.x,
        cy: stella.constants.universeWidth - tCurrentWhere.y,
        r: tRadius * tDegreesPerPixel,
        fill: tColor,
        fillOpacity: tOpacity
    }, 1000);
};


StarView.prototype.clickOnASystem = function (iEvent ) {
    if (stella.state.magnification === 1.0) {
        stella.manager.pointAtSystem( this.system );
    }
};


