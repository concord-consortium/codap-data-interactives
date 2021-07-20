/*
 ==========================================================================
 TEEUtils.js

 Collection of utility functions before they get merged into common.

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
 * Created by tim on 10/20/15.
 */


var TEEUtils = {

    getListOfOneFieldInArrayOfObjects: function (iList, what) {
        var out = [];
        iList.forEach(function (o) {
            out.push(o[what]);
        });
        return out;
    },

    /**
     * Are any of the elements of a1 in a2?
     *
     * @param a1    one array
     * @param a2    the other array
     * @returns {boolean}   true or false
     */
    anyInAny: function (a1, a2) {
        var out = false;
        a1.forEach(function (e) {
            if (a2.indexOf(e) >= 0) {
                out = true;
            }
        });
        return out;
    },


    padIntegerToTwo: function (i) {
        if (i == 0) return "00";
        if (i >= 10) return "" + i;
        else return "0" + i;
    },

    twoPlaces: function (x) {
        return (Math.round(x * 100) / 100.0);
    },

    /**
     * A funky random Poisson function.
     * Use Knuth algorithm up to n = 100; normal approximation beyond that.
     * @param mean
     * @returns {number}
     */
    randomPoisson: function (mean) {

        if (mean > 100) {
            var sd = Math.sqrt(mean);
            return Math.round(TEEUtils.randomNormal(mean, sd));   //  todo: use randomNormal from common
        }
        var L = Math.exp(-mean);
        var p = 1.0;
        var k = 0;
        do {
            k++;
            p *= Math.random();
        } while (p > L);
        return (k - 1);
    },

    /**
     * returns a value for the Normal distribution at a particular point
     * @param x         the x-value
     * @param mean      mean of the N
     * @param sd        standard deviation parameter
     */
    normal: function (x, mean, sd) {
        var tDenom = Math.sqrt(2 * sd * sd * Math.PI);
        var tExponent = -(x - mean) * (x - mean) / 2 / sd / sd;

        return Math.exp(tExponent) / tDenom;
    },

    /**
     * Random normal, Box-Muller transform. Use only one value.
     * @param mean
     * @param sd
     * @returns {*}
     */
    randomNormal: function (mean, sd) {
        var t1 = Math.random();
        var t2 = Math.random();

        var tZ = Math.sqrt(-2 * Math.log(t1)) * Math.cos(2 * Math.PI * t2);

        return mean + sd * tZ;
    },

    /**
     * Returns a random item from a list
     * @param a         the list
     * @returns {*}
     */
    pickRandomItemFrom: function (a) {
        var tL = a.length;
        var tR = Math.floor(Math.random() * tL);
        return a[tR];
    },

    dateStringToDOY: function (iString) {
        var dateArray = iString.split("-");
        var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        var mn = Number(dateArray[1]);
        var dn = Number(dateArray[2]);
        var yn = Number(dateArray[0]);
        var leapThing = yn % 4 == 0 ? 1 : 0;

        var dayOfYear = dayCount[mn - 1] + dn;
        if (mn > 1) dayOfYear += leapThing;
        return dayOfYear;
    },

    dateStringToDayOfWeek: function (iString, iTimeZoneString) {
        var tTempDate = new Date(iString + " " + iTimeZoneString);
        var tDay = tTempDate.getDay();      //  day of week, Sunday = 0, etc.
        return tDay;
    },

    dateNumberToDayOfWeek : function(iMilliseconds) {
        var tTempDate = new Date(iMilliseconds);
        var tDay = tTempDate.getDay();      //  day of week, Sunday = 0, etc.
        return tDay;
    },

    newtonsMethod: function (iExpression, iStartValue, iTolerance) {
        var maxIterations = 50;
        var nIterations = 0;
        var xCurrentValue = iStartValue;
        var delta = iTolerance;   //  using iTolerance for delta x. Good idea??

        var x = xCurrentValue;
        var yCurrentValue = eval(iExpression);

        console.log("    ....newton find root of f(x) = " + iExpression);
        console.log("    ....newton start at x = " + iStartValue + " f(x) = " + yCurrentValue);
        while (Math.abs(yCurrentValue) > iTolerance && nIterations < maxIterations) {
            nIterations += 1;
            x = xCurrentValue + delta;
            var yAtXPlusDelta = eval(iExpression);
            var fPrime = (yAtXPlusDelta - yCurrentValue) / delta;

            if (fPrime !== 0) {
                var d = -yCurrentValue / fPrime;
                xCurrentValue += d;
            } else {
                xCurrentValue -= delta;     //  kludge in case we're at a peak :)
            }
            x = xCurrentValue;
            yCurrentValue = eval(iExpression);
            console.log("    ....newton " + nIterations + " f(" + x + ") = " + yCurrentValue);
        }
        console.log("    ....newton solution x = " + x);

        return {success: (nIterations < maxIterations), x: xCurrentValue, y: yCurrentValue, iterations: nIterations};
    },

    /**
     * Assumes a flat earth, where difference in longitude is scaled to the cosine of the latitude.
     * That is, we do NOT go to the trouble of a great-circle calculation.
     *
     * @param lat1
     * @param long1
     * @param lat2
     * @param long2
     * @returns {number}    distance in km
     */
    earthDistanceNoGreatCircle: function (lat1, long1, lat2, long2) {
        R = 40000.00 / 2.0 / Math.PI;       //  radius in km

        var dLat = R * (lat2 - lat1) * Math.PI / 180.0;
        var cosLat = Math.cos((lat2 + lat1) * Path.PI / 180.0 / 2.0);  //  cosine of average latitude
        var dLong = R * cosLat * (long2 - long1) * Math.PI / 180.0;

        return Math.sqrt(dLat * dLat + dLong * dLong);  //  distance in kilometers
    },

    zeroPad: function (num, numZeros) {
        var n = Math.abs(num);
        var zeros = Math.max(0, numZeros - Math.floor(n).toString().length);
        var zeroString = Math.pow(10, zeros).toString().substr(1);
        if (num < 0) {
            zeroString = '-' + zeroString;
        }

        return zeroString + n;
    }


};

Number.prototype.newFixed = function (nPlaces) {

    var posSuffix = {
        0: "", 1: "", 2: "", 3: "", 4: "k", 5: "k", 6: "M",
        7: "M", 8: "M", 9: "B", 10: "B", 11: "B", 12: "T"
    };
    var negSuffix = {
        1: "", 2: "", 3: "/k", 4: "/M", 5: "/M", 6: "/M",
        7: "/M", 8: "/M", 9: "/B", 10: "/B", 11: "/B", 12: "/T"
    };
    var factors = {
        "/T": 1.0e12, "/B": 1.0e9, "/M": 1.0e6, "/k": 1.0e3, "": 1.0,
        "k": 1.0e-3, "M": 1.0e-6, "B": 1.0e-9, "T": 1.0e-12
    };

    var theLog = Math.floor(Math.log10(Math.abs(this)));

    if (theLog < -14) {     //  is the number really close to zero? Then use zero.
        return this.toFixed(nPlaces);
    }

    var isNegative = (this < 0);
    var negativeLog = (theLog < 0);
    theLog = Math.abs(theLog);
    if (theLog > 12) {
        theLog = 12;
    }
    var theSign = isNegative ? "-" : "";
    var theSuffix = negativeLog ? negSuffix[theLog] : posSuffix[theLog];
    var theFactor = factors[theSuffix];
    var out = (Math.abs(this) * theFactor);
    //  console.log('-----------in newFixed with ' + this + " theLog = " + theLog);

    var theNumberString = out.toFixed(nPlaces);
    var theIntegerString = out.toFixed(0);
    var newPlaces = nPlaces - theIntegerString.length;
    if (newPlaces < 0) newPlaces = 0;

    theNumberString = out.toFixed(newPlaces);

    return (theSign + theNumberString + theSuffix);
};

//  Thanks, stackOverflow!


Date.prototype.CODAPDateTimeString = function () {
    const yyyy = TEEUtils.padIntegerToTwo(this.getFullYear().toString());
    const mm = TEEUtils.zeroPad(this.getMonth() + 1, 2);    // getMonth() is zero-based
    const dd = TEEUtils.zeroPad(this.getDate(), 2);

    const hh = TEEUtils.zeroPad(this.getHours(), 2);
    const min = TEEUtils.zeroPad(this.getMinutes(), 2);
    const sec = TEEUtils.zeroPad(this.getSeconds(), 2);
    const ddd = TEEUtils.zeroPad(this.getMilliseconds(), 3);

    return mm + "/" + dd + "/" + yyyy + " " + hh + ":" + min + ":" + sec + "." + ddd;
};

Date.prototype.ISO_8601_string = function () {
    var yyyy = this.getFullYear().toString();
    var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
    var dd = this.getDate().toString();
    return yyyy + "-" + (mm[1] ? mm : "0" + mm[0]) + "-" + (dd[1] ? dd : "0" + dd[0]); // padding
};

Date.prototype.BART_string = function () {
    var hh = this.getHours().toString();
    var ii = this.getMinutes().toString();

    return this.ISO_8601_string() + " " + (hh[1] ? hh : "0" + hh[0]) + ":" + (ii[1] ? ii : "0" + ii[0]);
};

Date.prototype.isLeapYear = function () {
    var year = this.getFullYear();
    if ((year & 3) != 0) return false;
    return ((year % 100) != 0 || (year % 400) == 0);
};
