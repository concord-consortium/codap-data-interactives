/**
 * Created by tim on 7/31/16.


 ==========================================================================
 color.js in data-science-games.

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

/* global steb, TEEUtils */

steb.color = {
//      Predator Vision Section

    /**
     * Initial values for the predator vision parameters.
     */
    predatorVisionDotProductColorVector: [1, 0, 0],          //  for the "dot product" scheme. [r, g, b] This is all red.
    predatorVisionBWCoefficientVector: [1, 1, 1],  //  for the "coefficient" scheme. [r, g, b]. This is straight gray from all three color channels.
    predatorVisionDenominator: 1,                  //  this gets calculated when needed, but 1 is a good default placeholder.

    /**
     * Find the color of an object as seen by the predator.
     * Determines which scheme we're using and applies it.
     *
     * @param iColor    actual color of the object
     * @returns {*}     apparent color of the object
     */
    getPredatorVisionColor: function (iColor) {

        var tResult = iColor;

        if (steb.options.useVisionParameters) {
            if (steb.options.predatorVisionMethod === "dotProduct") {
                var tDotProduct = this.predatorVisionDotProductColorVector;
                tResult = [
                    (iColor[0]) * tDotProduct[0],
                    (iColor[1]) * tDotProduct[1],
                    (iColor[2]) * tDotProduct[2]
                ];
                this.predatorVisionDenominator = tDotProduct[0] + tDotProduct[1] + tDotProduct[2];

            } else  {       //  we're using B/W, i.e., "formula"

                tResult = steb.color.convertToGrayUsingRGBFormula(iColor);
            }
        }

        //  pin the results into [0, 15]

        tResult.forEach(function (c, i) {
            tResult[i] = steb.rangePin(c, 0, 15);
        });

        return tResult;
    },

    /**
     * Apply the coefficients to the input color to get the (grayscale) color that the predator sees
     * Called by this.getPredatorVisionColor
     *
     * The algorithm: Add up the absolute values of the coeffs to get a denominator. (tDenom)
     * At the same time, multiply the coefficient by either...
     * ...the color value, if the coefficent is positive, or
     * ...(the color value - 15) if it's negative. This will give a positive number in (coeff is < 0)
     * Add those up, and divide the total by tDenom, resulting in a number between 0 and 15.
     *
     * @param iColor        input color
     * @returns {Array}     the seen color
     */
    convertToGrayUsingRGBFormula: function (iColor) {

        var tGrayscaleNumber = 0;
        var tDenom = 0;

        this.predatorVisionBWCoefficientVector.forEach(function (c, i) {
            tDenom += Math.abs(c);
            tGrayscaleNumber += (c > 0) ? c * iColor[i] : (iColor[i] - 15) * c;
        });
        tGrayscaleNumber = (tDenom === 0) ? 0 : tGrayscaleNumber / tDenom;
        this.predatorVisionDenominator = tDenom;

        //  The result is gray. Not necessary to do it this particular way.
        //  Do anything plausible with the tGrayscaleNumber result.

        var tResult = [
            tGrayscaleNumber,
            tGrayscaleNumber,
            tGrayscaleNumber
        ];

        return tResult;
    },

    /**
     * the color distance. For now, it's just Euclidean in straight RGB color space.
     * No luminance adjustments or anything like that.
     * @param iColor1
     * @param iColor2
     * @returns {number}
     */
    colorDistance: function (iColor1, iColor2) {
        var tD;

        if (steb.options.predatorVisionMethod === "formula") {
            tD = Math.abs(iColor1[0] - iColor2[0]);
        } else {
            tD = (iColor1[0] - iColor2[0]) * (iColor1[0] - iColor2[0]) +
                (iColor1[1] - iColor2[1]) * (iColor1[1] - iColor2[1]) +
                (iColor1[2] - iColor2[2]) * (iColor1[2] - iColor2[2]);
            tD = Math.sqrt(tD);
        }
        return tD;
    },

    //          COLOR utilities

    /**
     * Choose a random color from the list, for each of the three colors in the array
     * @param iColors
     * @returns {Array}
     */
    randomColor : function( iColors ) {
        var oArray = [];

        for (var i = 0; i < 3; i++) {
            var tRan = TEEUtils.pickRandomItemFrom( iColors );
            oArray.push( tRan );
        }
        return oArray;
    },

    /**
     * Mutate the given color a bit, depending on the values in the given array
     * @param iColor    input color
     * @param iMutes    array of possible mutations
     * @returns {Array} output color, after mutation
     */
    mutateColor : function( iColor, iMutes )    {
        var oColor = [];

        iColor.forEach( function(c) {
            c += TEEUtils.pickRandomItemFrom( iMutes );
            c = steb.rangePin(c, 0, 15);
            oColor.push( c );
        });

        return oColor;
    },

    /**
     * Text debugging information about all the Stebbers.
     * @returns {string}
     */
    stebberColorReport: function () {
        var tout = "bg: " + JSON.stringify(steb.model.trueBackgroundColor) +
            " crud: " + JSON.stringify(steb.model.meanCrudColor) +
            " denom: " + this.predatorVisionDenominator.toFixed(2) + "<br>";

        tout += "<table><tr><th>id</th><th>color</th><th>visColor</th><th>dBG</th><th>dCrud</th><th>p</th></tr>"
        steb.model.stebbers.forEach(function (s) {
                var tDBG = s.colorDistanceToBackground;
                var tDCrud = s.colorDistanceToCrud;
                var tVisibleColor = steb.color.getPredatorVisionColor(s.trueColor);

                tout += "<tr><td>" + s.id + "</td><td>" + JSON.stringify(s.trueColor) +
                    "</td><td>" + JSON.stringify(tVisibleColor) + "</td><td>" + tDBG.toFixed(2);

                if (typeof tDCrud === 'number') {
                    tout += "</td><td>" + tDCrud.toFixed(2);
                } else {
                    tout += "</td><td>missing";
                }
                tout += "</td><td>" + steb.predator.targetProbability(s).toFixed(3) + "</td></tr>";
            }
        );
        tout += "</table>";
        return tout;
    }

};