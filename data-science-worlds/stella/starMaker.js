/**
 * Created by tim on 10/10/16.


 ==========================================================================
 starMaker.js in gamePrototypes.

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

var stella = {};

starMaker = {

    stars: [],
    universeWidth: 5,              //  degrees, about 0.1 radians
    universeDistance: 100,          //  parsecs
    maxStarLogMass: 1.5,           //  30 solar masses
    minStarLogMass: -1.0,          //  0.1 solar masses
    secPerYear: 86400 * 365.24,    //  seconds
    astronomicalUnit: 1.5e13,  //  centimeters
    debugText : "",

    pMiddleClusterSizePC : 2,
    pMiddleClusterDistancePC : 47,
    pFarClusterSizePC : 1,
    pFarClusterDistancePC : 120,
    pMiddleClusterLogAge : 8.3,
    pFarClusterLogAge : 6.9,

    update : function() {

        $("#starList").html( this.debugText );
    },

    newStarsButtonPressed: function () {
        this.stars = [];
        this.parsec = 206265 * this.astronomicalUnit; //  must be computed

        this.debugText = (this.makeAllStars());
        this.update();
    },

    makeAllStars : function() {

        var tBackgroundStars = 80;
        var tFarClusterStars = 80;
        var tNearStars = 20;
        var tMidClusterStars = 50;
        var newStars = [];

        var i, tFrustum, tMotion, tS, tClusterCenter, tClusterSizeSD;

        //  first, miscellaneous background stars of middling age

        tFrustum = {
            xMin : 0,
            yMin : 0,
            width : this.universeWidth,
            L1 : 0,
            L2 : this.universeDistance
        };

        //  motion parameter for pm and V_rad. Means and SDs.
        tMotion = {
            x : 0,  sx : 25,
            y : 0,  sy : 25,
            r : 5,  sr : 25
        };

        for (i = 0; i < tBackgroundStars; i++) {
            var tWhere =  randomLocationInFrustum( tFrustum );
            tS = new Star( tWhere, tMotion, 8.8 + 0.5 * Math.random() );
            newStars.push( tS );
            //  console.log( tS.toString() );
        }

        //  close stars. OUR cluster.

        tFrustum = {
            xMin : 0,
            yMin : 0,
            width : this.universeWidth,
            L1 : 0,
            L2 : this.universeDistance / 12
        };

        //  motion parameter for pm and V_rad. Means and SDs.
        tMotion = {
            x : 0,  sx : 5,
            y : 0,  sy : 5,
            r : 0,  sr : 5
        };

        for (i = 0; i < tNearStars; i++) {
            var tWhere =  randomLocationInFrustum( tFrustum );
            tS = new Star( tWhere, tMotion, 9.2 + 0.1 * Math.random() );
            newStars.push( tS );
        }

        //  then, stars in the middle cluster

        tMotion = {             //  motion of the cluster
            x : -20,  sx : 4,
            y : -2,  sy : 4,
            r : -5,  sr : 2
        };

        tClusterCenter = {
            x : (0.4 + 0.2 * Math.random()) * starMaker.universeWidth/2,
            y : (0.4 + 0.2 * Math.random()) * starMaker.universeWidth/2,
            z : starMaker.pMiddleClusterDistancePC
        };

        tClusterSizeSD = 3;


        for ( i = 0; i < tMidClusterStars; i++) {
            tWhere = randomLocationInCluster( tClusterCenter, starMaker.pFarClusterSizePC );
            tS = new Star( tWhere, tMotion, starMaker.pMiddleClusterLogAge + 0.1 * Math.random() );
            newStars.push( tS );
        }

        //  then, stars in the far cluster


        tMotion = {             //  motion of the cluster
            x : 20,  sx : 7,
            y : 40,  sy : 7,
            r : 25,  sr : 7
        };

        tClusterCenter = {
            x : (0.1 + 0.8 * Math.random()) * starMaker.universeWidth,
            y : (0.1 + 0.8 * Math.random()) * starMaker.universeWidth,
            z : starMaker.pFarClusterDistancePC + Math.random() * 10
        };

        for ( i = 0; i < tFarClusterStars; i++) {
            tWhere = randomLocationInCluster( tClusterCenter, starMaker.pFarClusterSizePC );
            tS = new Star( tWhere, tMotion, starMaker.pFarClusterLogAge + 0.1 * Math.random() );
            newStars.push( tS );
        }

        console.log( "Made " + newStars.length + " stars before filtering" );

        //  filter stars for position

        newStars.forEach(function (s) {
            if (s.where.x > 0 && s.where.x < starMaker.universeWidth &&
                s.where.y > 0 && s.where.y < starMaker.universeWidth) {
                this.stars.push(s);
            }
        }.bind(this));

        //  Sort the stars by brightness

        this.stars.sort( function(a,b) {
            return b.logLuminosity - a.logLuminosity;
        });

        //  Now give them ids (text, NOT caseIDs) for the catalog.

        for (var s = 0; s < this.stars.length; s++) {
            var tNumber = 1000 + s;
            this.stars[s].id = "S" + tNumber;
            //  this.stars[s].spectrum.source.id = this.stars[s].id;
        }

        var jsonArray = [];

        this.stars.forEach(
            function( s ) {
                jsonArray.push(s.jsonRepresentation());
            }
        );

        console.log( "Wound up with " + this.stars.length + " stars" );
        return jsonArray.join(",");
    }


};

/**
 * Compute proper motion
 * @param iSpeed        in km/sec
 * @param iDistance     in pc
 * @returns {number}    in degrees per year
 */
stella.pmFromSpeedAndDistance = function (iSpeed, iDistance) {
    var oPM = 0;

    var tRadialDistanceInCM = iDistance * starMaker.parsec;
    var tTransverseSpeedInCMperSEC = iSpeed * 1.0e05;
    var tTransverseDistancePerYear = tTransverseSpeedInCMperSEC * starMaker.secPerYear;  //  in CM

    oPM = (180 / Math.PI) * (tTransverseDistancePerYear / tRadialDistanceInCM );

    return oPM;
};

var Star = function( iWhere, iMotion, iLogAge ) {
    this.caseID = -1;

    var t1 = Math.random();
    var t2 = (1 - t1) * (1 - t1);
    this.logMass = (starMaker.maxStarLogMass - starMaker.minStarLogMass) * t2 - 1;
    this.logMainSequenceRadius = (2/3) * this.logMass;
    this.logRadius = this.logMainSequenceRadius;
    this.logLuminosity = 3.5 * this.logMass;
    this.logMainSequenceTemperature = 3.76 + 13/24 * this.logMass;  //  3.76 = log10(5800), the nominal solar temperature
    this.logTemperature = this.logMainSequenceTemperature;      //  start on main sequence
    this.logLifetime = 10 + this.logMass - this.logLuminosity;
    this.logAge = null;
    this.myGiantIndex = 0;

    this.vx = TEEUtils.randomNormal( iMotion.x, iMotion.sx);
    this.vy = TEEUtils.randomNormal( iMotion.y, iMotion.sy);
    this.vr = TEEUtils.randomNormal( iMotion.r, iMotion.sr);

    this.where = iWhere;

    this.pm = {
        x : stella.pmFromSpeedAndDistance( this.vx, this.where.z),
        y : stella.pmFromSpeedAndDistance( this.vy, this.where.z),
        r : this.vr
    };

    this.id = 42;       //  placeholder. Gets set elsewhere.
    this.logAge = iLogAge;

    //  this.evolve( );     //  old enough to move off the MS?
    //  this.spectrum = this.setUpSpectrum();
    //  this.doPhotometry();    //  calculate UBV (etc) magnitudes
};

function    randomLocationInCluster( iCenter, iSize ) {
    //  remember that x and y are in degrees and that z is in parsecs.

    var xPC = -1, yPC = -1, zPC = -1;   //      coordinates in parsecs
    var xDegrees = -1, yDegrees = -1;  //  their counterparts

    xPC = iCenter.x * iCenter.z * Math.PI / 180.0;        //   CENTER of cluster   5° is about 0.1 radians.
    xPC += TEEUtils.randomNormal(0, iSize);
    yPC = iCenter.y * iCenter.z * Math.PI / 180.0;        //   CENTER of cluster   5° is about 0.1 radians.
    yPC += TEEUtils.randomNormal(0, iSize);
    zPC = iCenter.z + TEEUtils.randomNormal(0, iSize);

    var distance = Math.sqrt(xPC * xPC + yPC * yPC + zPC * zPC);

    xDegrees = (xPC / distance) * 180.0 / Math.PI;
    yDegrees = (yPC / distance) * 180.0 / Math.PI;

    return {
        x: xDegrees,
        y: yDegrees,
        z: zPC
    }
}

function randomLocationInFrustum(iFrustum)  {
    var tDistanceCubed = Math.pow(iFrustum.L1,3) +  Math.random() * (Math.pow(iFrustum.L2,3) - Math.pow(iFrustum.L1,3));

    var twhere = {
        x : iFrustum.xMin + Math.random() * iFrustum.width,
        y : iFrustum.yMin + Math.random() * iFrustum.width,
        z : Math.pow(tDistanceCubed, 0.333)
    };

    return twhere;
}

Star.prototype.jsonRepresentation = function( ) {
    var j = {};
    j.id = this.id;
    j.logMass = this.logMass;
    j.logAge = this.logAge;
    j.x = this.where.x;
    j.y = this.where.y;
    j.z = this.where.z;
    j.vx = this.vx;
    j.vy = this.vy;
    j.vz = this.vr;

    return JSON.stringify(j);
};

//{
//    "idSEQ": "341",
//    "id": "S1040",
//    "logMass": "0.287062",
//    "logAge": "9.49248",
//    "x": "2.95153",
//    "y": "3.57755",
//    "z": "71.1582",
//    "vx": "-3.58849",
//    "vy": "7.70158",
//    "vz": "-16.9178"
//}


Star.prototype.csvLine = function( ) {
    var o = "";
    o = this.id + "," + this.logMass + "," + this.logAge + "," +
        this.where.x + "," + this.where.y + "," + this.where.z + "," +
        this.vx + "," + this.vy + "," + this.vr;

    return o;
};
