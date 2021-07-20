// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Goal, the behavior of the game's goal, especially during a ball's push animation
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 * Mostly this puts together the visible manifestation as a set of Raphael elements
 * @param iPaper
 * @param iDispatcher {EventDispatcher}
 * @constructor
 */
function Goal( iPaper, iDispatcher ) {
  var tGradString = "r#ffffff-#448800-#1E592D"; // White to yellowish to background
  this.paper = iPaper;
  this.x = null;
  this.y = null;
  this.goalLabel = this.paper.text( this.x, this.y, "" )
    .attr( { title:"Goal number", "font-size":ProximitySettings.goalFontSize,
              fill: ProximitySettings.goalLabelColor } );
  // The goal when the ball is not inside its radius
  this.circle = this.paper.circle( this.x, this.y, ProximitySettings.goalRadius )
    .attr( { fill: tGradString, "stroke-width": 0 /*Windows Chrome bug*/ });
  // This circle keeps a constant radius but varies in opacity as the ball gets closer to center
  this.outerScoreCircle = this.paper.circle( this.x, this.y, ProximitySettings.goalRadius )
    .attr( { "stroke-width": 0, fill: '#FFCC00' });
  // This circle's radius and opacity are determined by the ball's position
  this.innerScoreCircle = this.paper.circle( this.x, this.y, 0 )
    .attr( { "stroke-width": 0 });
  this.graphicSet = this.paper.set()
    .push( this.goalLabel, this.innerScoreCircle, this.outerScoreCircle, this.circle);
  this.toBack();
  this.updateAppearance( 0);  // The initial score is zero
  iDispatcher.addEventListener("goalChange", this.handleGoalChange, this);
}

/**
 * Set the number that is displayed in the center of the goal
 * @param iGoal {Number}
 */
Goal.prototype.setGoal = function( iGoal) {
  var tLabel = (iGoal === 0) ? "" : iGoal;
  this.goalLabel.attr( "text", tLabel);
}

/**
 * Utility to get elements into the background in the right order
 */
Goal.prototype.toBack = function() {
  this.graphicSet.toBack();
}

/**
 * Return the score corresponding to the given coordinates.
 * @param iCoords
 * @return {Number}
 */
Goal.prototype.getScore = function( iCoords) {
  var tDX = iCoords.x - this.x,
      tDY = iCoords.y - this.y,
      tDistance = Math.sqrt( tDX * tDX + tDY * tDY ),
      tScore = Math.round( 100 - 100 * tDistance / ProximitySettings.goalRadius);
  return Math.max( 0, tScore);
}

/**
 * Called once per frame of a ball animation to allow the goal to respond
 * @param iScore
 */
Goal.prototype.updateAppearance = function( iScore) {
  var tFill;
  if (iScore <= 0) {
    this.outerScoreCircle.hide();
    this.innerScoreCircle.hide();
  }
  else {
    tFill = "rgba(0%,100%,0%,"+ iScore / 2 + "%)";
    this.outerScoreCircle.attr( {"fill-opacity": iScore / 200 });
    this.innerScoreCircle.attr( {"fill": tFill,
        r: ( 100 - iScore) / 100 * ProximitySettings.goalRadius });
    this.outerScoreCircle.show();
    this.innerScoreCircle.show();
  }
}

/**
 * Called to give user time to digest the result of a push before moving on.
 * @param iCallback
 */
Goal.prototype.glow = function( iCallback) {
  var this_ = this
      tCounter = 6; // divide by 2 gives the number of perceived pulses

  function oneGlow() {
    var tNext = (tCounter === 1) ? iCallback : oneGlow,
        tScale = (tCounter % 2 === 0) ? 1.25 : 1;
    tCounter--;
    this_.graphicSet.animate({ transform: 'S' + tScale}, 150, '<>', tNext);
  }

  oneGlow();
}

/**
 * Called to prepare for the next move
 * @param iPos
 */
Goal.prototype.moveTo = function( iPos) {
  this.circle.animate( { cx: iPos.x, cy: iPos.y }, 1000, '<>');
  this.outerScoreCircle.animate( { cx: iPos.x, cy: iPos.y }, 1000, '<>');
  this.innerScoreCircle.animate( { cx: iPos.x, cy: iPos.y }, 1000, '<>');
  this.goalLabel.animate( { x: iPos.x, y: iPos.y }, 1000, '<>');
  this.x = iPos.x;
  this.y = iPos.y;
}

/**
 * Received when the model updates the goal number
 * @param iEvent
 */
Goal.prototype.handleGoalChange = function( iEvent) {
  this.setGoal( iEvent.goalNum);
}

