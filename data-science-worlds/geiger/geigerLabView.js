/*
 ==========================================================================
 geigerLabView.js

 View for the Geiger DSG. Governs the SVG that represents the lab; the field of play.

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
 * Singleton view of the "Lab" -- the region in which the speck might hide
 *
 * @type {{canvas: null, ctx: null, pixelsPerUnit: null, unitsAcross: number, setup: Function, update: Function, drawDetector: Function}}
 */

var geigerLabView;

geigerLabView = {
    /**
     * The SVG associated with the lab itself
     *     @property
     */
    mainSVG: null,
    /**
     * The scale of the coordinate system in the view; determined in this.setup()
     */
    pixelsPerUnit: null,
    /**
     * How many units across is this canvas?
     */
    unitsAcross: 5.0,
    /**
     * The svg thingy associated with the detector
     */
    detector: null,
    /**
     * height of the "lab" in pixels
     */
    labHeight: 0,
    /**
     * array of objects containing coordinates and results of past measurements
     */
    ghosts: [],
    /**
     * Element that shows the position of the source (made visible at end of game)
     */
    crosshairElement: null,

    /**
     * Sets up the properties
     * Also adds event listeners
     */
    setup: function( ) {
        this.mainSVG = document.getElementById("lab");
        this.unitsAcross = geigerGameModel.unitsAcross;     //  units in game space
        this.crosshairElement = document.getElementById("crosshairs");

        var tWidth = Number(this.mainSVG.getAttribute("width"));
        var tHeight = Number(this.mainSVG.getAttribute("height"));
        this.labHeight = tHeight;

        this.pixelsPerUnit = {
            x: tWidth / this.unitsAcross,
            y: tHeight / this.unitsAcross
        };

        if (!this.detector) {
            this.detector = this.makeDetectorShape();
            this.detector.setAttribute("stroke", "yellow");
            this.detector.setAttribute("stroke-width", "2");
        }
    },

    /**
     * Make and append a shape for display
     */
    makeDetectorShape: function() {

        var tShape =  document.createElementNS(svgNS, "path");
        var tShapeCommands = (geigerManager.twoDimensional) ?
            "M 6 0 L 0 6 L -6 0 L 0 -6 L 6 0" :
            "M 6 0 L -6 0 L 0 24 L 6 0";
        tShape.setAttribute("d", tShapeCommands);
        this.mainSVG.appendChild(tShape);         //  here we put the new object into the DOM.

        return tShape;
    },

    /**
     * add data for a new "ghost"
     * AND draw the image. Data is {x, y, count}
     * @param data
     */
    addGhost : function( data ) {
        this.ghosts.push( data );

        var tPower = (Math.log10(data.count));
        var tRed = Math.round(255.0 * (tPower/4.0) * (tPower/4.0)); if (tRed > 255) tRed = 255;
        var tGreen = Math.round(255.0 * (1 - tPower/5.0) * (1 - tPower/5.0)); if (tPower > 5) tGreen = 0;
        var tBlue = Math.round(155.0 - 155.0 * (tPower/4.0)); if (tBlue < 0) tBlue = 0;

        var tRGBString = "rgb("+tRed+","+tGreen+","+tBlue+")";
        var tNewGhostShape = this.makeDetectorShape();
        tNewGhostShape.setAttribute("fill", tRGBString);
        tNewGhostShape.setAttribute("stroke", "#ddeeff");
        tNewGhostShape.setAttribute("class", "ghost");
        this.moveShapeTo( tNewGhostShape, data.x, data.y );
    },

    /**
     * Remove both the ghost elements in the DOM, and empty the ghosts array
     */
    removeOldGhosts : function() {
        //  remove old ghosts
        var tGhostList = document.getElementsByClassName('ghost');

        while(tGhostList[0]) {
            tGhostList[0].parentNode.removeChild(tGhostList[0]);
        }

        this.ghosts = [];
    },

    /**
     * Move the crosshairs (which indicate the position of the source) to game coordinates
     * @param x
     * @param y
     */
    setCrosshairs: function(x, y) {
        var tXpixels = x * this.pixelsPerUnit.x;
        var tYpixels = geigerManager.twoDimensional ? this.labHeight - y * this.pixelsPerUnit.y : this.labHeight;

        var tHHair;
        if (geigerManager.twoDimensional) tHHair = document.getElementById("hLine");
        var tVHair = document.getElementById("vLine");

        if (geigerManager.twoDimensional) {
            tHHair.setAttribute("x1", "0");
            tHHair.setAttribute("y1", tYpixels.toString());
            tHHair.setAttribute("x2", (this.unitsAcross * this.pixelsPerUnit.x).toString());
            tHHair.setAttribute("y2", tYpixels.toString());
        }

        tVHair.setAttribute("x1",tXpixels.toString());
        tVHair.setAttribute("y1","0");
        tVHair.setAttribute("x2",tXpixels.toString());
        tVHair.setAttribute("y2",(this.unitsAcross * this.pixelsPerUnit.y).toString());

    },

    /**
     * Alter attributes of the range circle (showing how big the collector is)
     * Called from geigerManager.moveDetectorTo()
     * @param x
     * @param y
     * @param r
     */
    setRangeCircle: function(x, y, r) {
        var tXpixels = x * this.pixelsPerUnit.x;
        var tYpixels = this.labHeight - y * this.pixelsPerUnit.y;
        var tRpixels = r * this.pixelsPerUnit.x;   //  todo: make into an ellipse?

        var tCircle = document.getElementById("rangeCircle");

        tCircle.setAttribute("cx", tXpixels.toString());
        tCircle.setAttribute("cy", tYpixels.toString());
        tCircle.setAttribute("r", tRpixels.toString());
        tCircle.setAttribute("fill", "rgba(255, 255, 255, 0.2)");
    },

    /**
     * Update this view.
     */
    update: function() {
        var tRadius = geigerGameModel.collectorRadius();
        this.setRangeCircle(
            geigerGameModel.detectorX,
            geigerGameModel.detectorY,  //  call with Y even in the 1D case. The 1D labView ignores it.
            tRadius
        );
        this.moveShapeTo( this.detector, geigerGameModel.detectorX, geigerGameModel.detectorY);
    },

    /**
     * Draws a shape (an svg sub-thing) at the specified location. Called by this.update() and by the ghost stuff
     */
    moveShapeTo: function( shape, x, y ) {
        var tXpixels = x * this.pixelsPerUnit.x;
        var tYpixels = (geigerManager.twoDimensional) ? this.labHeight - y * this.pixelsPerUnit.y : this.labHeight / 2;

        var tTransform = "translate(" + tXpixels + "," + tYpixels + ")";
        shape.setAttribute("transform", tTransform);
    },

    getSaveObject: function() {
        var tSaveObject = { ghosts : this.ghosts };
        return tSaveObject;
    },

    restoreFrom: function( iObject ) {
        this.setup( );

        iObject.ghosts.forEach(
            function( iGhost ) {
                this.addGhost( iGhost )
            }.bind(this)
        )

        this.setCrosshairs( geigerGameModel.sourceX, geigerGameModel.sourceY);
    }

};
