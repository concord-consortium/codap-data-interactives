/**
 * Created by tim on 5/7/16.


 ==========================================================================
 Planet.js in data-science-games.

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
 * Model class for planets.
 * NOTE distances are in AU here (parsecs for Stars)
 * @param iSemimajorAxis    sma of this planet's orbit
 * @param   iStar           what this planet orbits around ( useful for moons :)
 * @constructor
 */


var Planet = function( iSemimajorAxis, iStar ) {

    //  orbital elements. Default: circular and flat

    this.a = iSemimajorAxis;    //  semi-major axis (in AU)
    this.e = 0.0;               //  eccentricity
    this.i = 0.0;               //  inclination, degrees
    this.bigOmega = 0.0;        //  longitude of the ascending node
    this.w = 0.0;               //  longitude of periastron
    this.T = 2100.0;            //  epoch (years) of periastron

    this.star = iStar;          //  what we're orbiting around

    var tDistance = this.a * stella.constants.astronomicalUnit;     //  a in centimeters!

    this.period = 2 * Math.PI * Math.pow(tDistance, 1.5) / Math.sqrt(stella.constants.bigG * this.star.mass );
        //  NB: Period is in seconds (because it's cgs)
};

Planet.prototype.toString = function() {
    var text = "Planet data\na = " + this.a + " e = " + this.e +
            "\nPeriod (d) = " + this.period / 86400;

    return text;
}