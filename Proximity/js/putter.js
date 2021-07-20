// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Putter, the behavior of the tool with which the user pushes the ball
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iPaper
 * @param iBall {Ball}
 * @param iGoal {Goal}
 * @constructor - class Putter
 */
function Putter( iPaper, iBall, iGoal ) {
  this.fontSize = 18;
  this.labelColor = "white";
  this.autoPointingTolerance = 20;  // degrees

  this.paper = iPaper;
  this.ball = iBall;
  this.goal = iGoal;
  this.dx = 0;
  this.dy = 0;
  this.shotAngle = 0;
  this.angleToGoal = 0;
  this.pullAngle = 0;
  this.pullBack = Math.sqrt( this.dx * this.dx + this.dy * this.dy);

  var tHalfWidth = ProximitySettings.ballRadius,
      tWidth = 2 * tHalfWidth,
      tPutterPath = "m0,0, 0,-" + tHalfWidth + ", " + this.pullBack + ",0, 0," +
                      tWidth + " -" + this.pullBack + ",0z",
      tArrowPath = "M0,0 m-" + tWidth + ",0, 0,-" + tHalfWidth +
                      ", -" + tHalfWidth + "," + tHalfWidth + " ," + tHalfWidth + "," + tHalfWidth + "z";
  this.backSwing = this.paper.path( "")
    .attr({ "stroke-width": 0.000001 /*Windows Chrome bug*/,
              fill: "0-" + ProximitySettings.putterColor + "-#000", cursor: "none"})
    .toBack();
  this.arrowHead = this.paper.path( "")
    .attr({ "stroke-width": 0.000001, fill: ProximitySettings.putterColor })
    .toBack();
  this.pullLabel = this.paper.text( 0, 0, "")
    .attr( { "font-size": this.fontSize, fill: this.labelColor, cursor: "none" } );
  this.graphicSet = this.paper.set()
    .push( this.backSwing, this.arrowHead, this.pullLabel)
    .hide();
}

/**
 * Compute latest values based on current displacement and pullback
 * Note that we snap the angle to point at the goal if user is close enough to that angle
 * @param iDX
 * @param iDY
 * @param iPullBack
 */
Putter.prototype.update = function( iDX, iDY, iPullBack) {
  var tLowerTol = this.angleToGoal - this.autoPointingTolerance,
      tUpperTol = this.angleToGoal + this.autoPointingTolerance,
      tNormalizedPullAngle;
  this.dx = iDX;
  this.dy = iDY;
  this.pullBack = iPullBack;
  this.pullAngle = Math.atan2( -this.dy, -this.dx ) * 180 / Math.PI;
  // The following is a 'finicky' computation
  tNormalizedPullAngle = ((this.pullAngle * this.angleToGoal < 0) &&
                          (Math.abs( this.pullAngle) > 180 - this.autoPointingTolerance)) ?
                            this.pullAngle - 360: this.pullAngle;
  this.shotAngle = (( tNormalizedPullAngle < tUpperTol) && ( tNormalizedPullAngle > tLowerTol)) ?
                        this.angleToGoal : this.pullAngle;
  if( iPullBack === 0)
    this.graphicSet.hide();
  else
    this.draw();
}

/**
 * Update appearance based on current values.
 */
Putter.prototype.draw = function() {
  var tHalfWidth = ProximitySettings.ballRadius,
      tWidth = 2 * tHalfWidth,
      tPutterPath = "m0,0, 0,-" + tHalfWidth + ", " + this.pullBack + ",0, 0," +
                      tWidth + " -" + this.pullBack + ",0z",
      tArrowPath = "M0,0 m-" + tWidth + ",0, 0,-" + tHalfWidth +
                      ", -" + tHalfWidth + "," + tHalfWidth + " ," + tHalfWidth + "," + tHalfWidth + "z",
      tBackSwingTransform = "T" + this.ball.xx + "," + this.ball.yy + " r" + (this.pullAngle + 180) + ",0,0",
      tArrowTransform = "T" + this.ball.xx + "," + this.ball.yy + " r" + (this.shotAngle + 180) + ",0,0",
      tLocX = this.ball.xx + this.dx / 4,
      tLocY = this.ball.yy + this.dy / 4,
      tTheta = Math.atan2( this.dy, this.dx ),
      tTextX = tLocX + 20 * Math.sin( tTheta),
      tTextY = tLocY - 20 * Math.cos( tTheta);
  this.backSwing.attr({ path: tPutterPath, transform: tBackSwingTransform });
  this.arrowHead.attr({ path: tArrowPath, transform: tArrowTransform } ).toFront();
  this.pullLabel.attr(  { x: tTextX, y: tTextY, text: this.getPush() } );
  this.graphicSet.show();
}

/**
 * Compute the push corresponding to the current pullBack. Note that the relationship between pullBack and push
 * starts out quadratic and then becomes linear.
 * @return {Number}
 */
Putter.prototype.getPush = function() {
  var kThresh = 40, // below this quadratic, above it linear
      kValueAtThresh = 10,
      tPull = this.pullBack - ProximitySettings.ballRadius,
      tResult = 0;

  if( tPull > 0) {
    if( tPull < kThresh)
      tResult = kValueAtThresh * tPull * tPull / (kThresh * kThresh);
    else
      tResult = tPull - (kThresh - kValueAtThresh);
  }
  return Math.round( 10 * tResult) / 10;
}

/**
 * Utility function that returns the angle from the ball to the goal.
 */
Putter.prototype.computeAngleToGoal = function() {
  var tGoalCoords = { x: this.goal.x, y: this.goal.y },
      tBallCoords = this.ball.getCoordinates();
  this.angleToGoal = Math.atan2( tGoalCoords.y - tBallCoords.y, tGoalCoords.x - tBallCoords.x) * 180 / Math.PI;
}