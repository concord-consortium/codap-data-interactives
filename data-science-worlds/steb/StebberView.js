/**
 * Created by tim on 3/23/16.


 ==========================================================================
 StebberView.js in data-science-games.

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

/* global steb, Snap */

/**
 * Class for Stebber Views
 * @param iStebber      its model object
 * @constructor
 */

var StebberView = function( iStebber ) {
    this.stebber = iStebber;    //  its model

    //  the SVG object on which we'll draw
    this.paper = new Snap( steb.constants.stebberViewSize * 1.1, steb.constants.stebberViewSize * 1.1);
    var tRadius = steb.constants.stebberViewSize / 2;   //  circle
    var tVBText  = " -55 -55 110 110";
    //  var tVBText = -tRadius + " " + (-tRadius) + " " + 2 * tRadius + " " + 2 * tRadius;

    this.paper.attr({
        viewBox : tVBText,
        class : "StebberView"
    });

    //  set up the target reticule. This is on the bottom

    this.targetReticule = this.paper.rect( -55, -55, 110, 110).attr({   //   -tRadius, -tRadius, 2 * tRadius, 2 * tRadius).attr({
        fill : "transparent",
        strokeWidth : 10,
        stroke : "transparent"
    });

    //  create the pattern, if necessary

    this.pattern = this.makePatternFromModel(  );        //  its pattern

    //  draw the stebber on top.

    this.selectionCircle = this.paper.circle(0, 0, 50).attr({
        //  this.selectionCircle = this.paper.circle(0, 0, tRadius).attr({
        strokeWidth : 10,
        stroke : "transparent"
    });

    //  the fill color depends on how the predator sees. Set in this method:
    steb.worldView.applyPredatorVisionToObject( this.selectionCircle, this.stebber.trueColor, 0);   //  NB extra arg, it's the timing

    //  set up the click handler

    this.selectionCircle.click(function( iEvent ) {
        steb.manager.clickOnStebberView( this, iEvent );
    }.bind(this) );         //  bind so we get the StebberView and not the Snap.svg element

};

StebberView.prototype.makePatternFromModel = function( ) {
    var tStripCenter = this.stebber.trueDarkStripWidth / 2;
    var tPathString = "M " + tStripCenter + " 0, " + tStripCenter + " 1";
    tPathString = "M 2 0 2 1";
    var p = this.paper.path(tPathString).attr({
        fill: "none",
        stroke: "yellow",
        strokeWidth: 4  //  this.stebber.trueDarkStripWidth
    });
    //  var tPat = p.pattern(0, 0, this.stebber.trueDarkStripWith + this.stebber.trueLightStripWidth, 1);
    var tPat = p.pattern(0, 0, 10, 1);

    return tPat;
},



/**
 *  Set the apparent color of this thing.
 *  This is different from in the constructor because we don't pass the time argument
 */
StebberView.prototype.setMyColor = function() {
    steb.worldView.applyPredatorVisionToObject( this.selectionCircle, this.stebber.trueColor);
};

/**
 * This moves the view to the correct location (as set in the Stebber's update() method)
 * and then sets the stroke to show selection.
 */
StebberView.prototype.update = function() {
    this.moveTo( this.stebber.where );

    //  set the circle's stroke according to the selected property
    //  except that if the game is running and on manual, you won't see it.

    var tShowSelection = (steb.manager.running && !steb.options.automatedPredator) ?
        false : this.stebber.selected;

    var tStroke = tShowSelection ? steb.worldView.selectedStrokeColor : "transparent";
    this.selectionCircle.attr({
       stroke : tStroke
    });
};

/**
 * Actually move this view.
 * @param iWhere    To what point?
 */
StebberView.prototype.moveTo = function( iWhere ) {
    this.paper.attr({
        x : iWhere.x - steb.constants.stebberViewSize/2,
        y : iWhere.y - steb.constants.stebberViewSize/2
    });
};
