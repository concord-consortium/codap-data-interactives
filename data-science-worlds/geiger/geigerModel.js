
/*
 ==========================================================================
                          geigerModel.js

  Model for the Geiger DSG.

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

/**
 * Model for the game.
 * @type {{sourceX: number, sourceY: number, sourceStrength: number, detectorX: number, detectorY: number, dose: number, latestCount: number, setup: Function, signalStrength: Function, doMeasurement: Function}}
 */

var geigerGameModel;

geigerGameModel = {
    /**
     * (secret) position of the source of radiation
     */
    sourceX: 1,
    sourceY: 1,
    /**
     * Strength of the radiation
     */
    initialSourceStrength: 10000,
    sourceStrength : 10000,
    /**
     * Current position of the detector
     */
    detectorX: 1, // Todo: HTML also sets initial values of the boxes to 10; should only be in one place.
    detectorY: 1,
    /**
     * Total dose so far
     */
    dose: 0,
    /**
     * The radiation count for the last time the detector was used
     */
    latestCount: 0,
    /**
     * The distance reading the last time the detector was used
     */
    latestDistance : 0,
    /**
     * radius of the "collector"
     */
    baseCollectorRadius: 0.5,

    /**
     * Exceed this and you lose!
     */
    maxDose: 20000,

    /**
     * Units across the "lab" in game units (meters)
     */
    unitsAcross: 10.0,

    /**
     * When the detector reports distance, it (secretly) does so in inches. Used in this.doMeasurement().
     */
    distanceFactor : 39.37,

    /**
     * Initialize model properties for a new game
     */
    newGame: function () {
        this.sourceX = (this.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2);
        this.sourceY = (geigerManager.twoDimensional) ?
            (this.unitsAcross * (0.25 + 0.50 * Math.random())).toFixed(2) : // TODO: fix vertical coordinate of source
            1;
        this.sourceStrength = this.initialSourceStrength;
        this.latestCount = 0;
        this.dose = 0;
    },

    /**
     * Compute the strength of the radiation at the detector. Use inverse square.
     * @returns {number}
     */
    signalStrength: function () {
        var tSignalStrength = (this.sourceStrength / this.dSquared());
        tSignalStrength = Math.round(tSignalStrength);
        return tSignalStrength;
    },

    /**
     * Perform a measurement. Updates internal positions. Updates this.latestCount, .latestDistance
     * Resturns a Boolean that tells whether the source is captured
     */
    doMeasurement: function(  ) {
        var dsq = this.dSquared();

        var tSignal = Math.round(this.sourceStrength / dsq );
        this.latestCount = geigerOptions.useRandom ? randomPoisson(tSignal) : tSignal;

        var tWin = this.captured(dsq);        //   figure out if we're close enough to collect it
        if (tWin) this.latestCount = 0;     //  no extra dose when you collect it (also avoids huge values)
        this.dose += this.latestCount;   // TODO: Update game case with current dose.

        this.latestDistance = this.distanceFactor * Math.sqrt( dsq );

        if (!geigerOptions.showDistance) {
            this.latestDistance = "";
        }

        return tWin;
    },

    /**
     * supply the current radius of the collector (depends on game options)
     * @returns {number}
     */
    collectorRadius : function () {
        return geigerOptions.scooperRadius;
    },

    /**
     * test whether the detector is close enough to capture the source
     * @returns {boolean}
     */
    captured: function( dsq ) {
        var tRadius = this.collectorRadius();
        return (dsq < tRadius * tRadius);
    },


    /**
     * Utility: what's the square of the distance from the detector to the source?
     * @returns {number}
     */
    dSquared: function() {
        return (this.detectorX - this.sourceX ) * (this.detectorX - this.sourceX )
            + (this.detectorY - this.sourceY ) * (this.detectorY - this.sourceY );
    }

};
