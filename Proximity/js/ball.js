// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Ball, the behavior of the game's ball that the user pushes
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iPaper  {Raphael paper}
 * @param iDragMove - function to call during a drag that begins on the ball
 * @param iDragStart - function to call when the user initiates a drag
 * @param iDragEnd - function to call when the user ends a drag
 * @param iDragContext - the 'this' to be used in the above functions
 * @param iRough {Boolean} Is a rough present or not
 * @constructor
 */
function Ball( iPaper, iDragMove, iDragStart, iDragEnd, iDragContext, iRough)
{
	this.paper = iPaper;
  this.rough = iRough;
  this.startX = 0,
  this.startY = 0,
  this.xx = 0;
  this.yy = 0;
  this.vx = 0;
  this.vy = 0;
  this.fontsize = 18;
  this.nBounce = 0;
  this.circle = this.paper.circle( this.xx, this.yy, ProximitySettings.ballRadius)
    .attr({ fill: ProximitySettings.ballColor, "stroke-width": 0.000001 /*Windows Chrome bug*/ })
    .drag( iDragMove, iDragStart, iDragEnd, iDragContext, iDragContext, iDragContext);
  this.scoreLabel = this.paper.text( this.xx, this.yy + this.fontsize, "0")
    .attr({ title: "Score from previous push", "font-size": this.fontsize, fill: "white" })
    .hide();

  this.setCursorVisible( true);
}

/**
 * Show the score value positioned correctly next to the ball
 * @param iScore {Number}
 */
Ball.prototype.setScore = function( iScore) {
  this.scoreLabel.attr( { text: iScore, x: this.xx, y: this.yy + this.fontsize });
}

/**
 * During a drag we hide the cursor
 * @param iVisible {Boolean}
 */
Ball.prototype.setCursorVisible = function( iVisible) {
  this.circle.attr( "cursor", iVisible ? "pointer" : "none");
}

/**
 * Provide control over whether the score corresponding to the ball's position relative to the goal is visible.
 * @param iVisible {Boolean}
 */
Ball.prototype.setScoreVisible = function( iVisible) {
  if( iVisible)
    this.scoreLabel.show();
  else
    this.scoreLabel.hide();
}

/**
 * If the velocity is not zero, the ball is moving
 * @return {Boolean}
 */
Ball.prototype.isMoving = function() {
  return (this.vx !== 0) || (this.vy !== 0);
}

/**
 * Utility used by ProximityView
 * @return {Object}
 */
Ball.prototype.getCoordinates = function() {
  return { x: this.xx, y: this.yy };
}

/**
 * Utility used by ProximityView
 * @return {Object}
 */
Ball.prototype.getStartCoordinates = function() {
  return { x: this.startX, y: this.startY };
}

/**
 * Set things up so that the ball has the correct initial values for an animation
 * @param iDistance
 * @param iAngle
 * @param iRoughActive
 */
Ball.prototype.prepareToMove = function( iDistance, iAngle, iRoughActive) {
  var tAcc = ProximitySettings.defaultAcceleration,
      tAvgSpeed = Math.sqrt( 2 * tAcc * iDistance ),
      tTime = tAvgSpeed / tAcc;

  this.vx = tAvgSpeed * Math.cos( Math.PI * iAngle / 180);
  this.vy = tAvgSpeed * Math.sin( Math.PI * iAngle / 180);
  this.setScore("");
  this.scoreLabel.show();
  this.nBounce = 0;
  this.roughActive = iRoughActive;
}

/**
 * Called by ProximityView once per frame of the ball animation
 * @param iDT {Number} The time in milliseconds since the last call
 */
Ball.prototype.oneFrame = function( iDT) {
  var this_ = this;

  /**
   * Return the current acceleration, taking into account that the ball might be in the rough
   * @return {Number}
   */
  function getAcc() {
    var tResult = ProximitySettings.defaultAcceleration;
    if (this_.roughActive)	{
      if (this_.xx > this_.rough.x && this_.xx < this_.rough.x + this_.rough.width
            && this_.yy > this_.rough.y && this_.yy < this_.rough.y + this_.rough.height)
      {
        tResult *= ProximitySettings.roughFrictionFactor;
      }
    }
    return tResult;
  }

  var tAcc = getAcc(),
      tSpeed = Math.sqrt( this.vx * this.vx + this.vy * this.vy);

  if (tAcc * iDT < tSpeed)	{
    this.updateXandV( iDT, tAcc, tSpeed );
  }
  else {
    iDT = tSpeed / tAcc;		//	 dt remaining until stopping
    this.updateXandV( iDT, tAcc, tSpeed );
    this.vx = 0;
    this.vy = 0;
  }
  this.checkOutOfBounds( );	//	bounce
  this.updateCircle();
}

/**
 * Basic mechanics that moves the ball to the next position
 * @param iDT
 * @param iAcc
 * @param iSpeed
 */
Ball.prototype.updateXandV = function( iDT, iAcc, iSpeed) {
  if( iSpeed === 0)
    return;

  var tAx = -iAcc * this.vx / iSpeed,
      tAy = -iAcc * this.vy / iSpeed;

  this.xx += this.vx * iDT + 0.5 * tAx * iDT * iDT;
  this.yy += this.vy * iDT + 0.5 * tAy * iDT * iDT;
  this.vx += iDT * tAx;
  this.vy += iDT * tAy;
}

/**
 * Position the ball's visible manifestation
 */
Ball.prototype.updateCircle = function() {
  this.circle.attr( { cx: this.xx, cy: this.yy });
}

/**
 * Detect hitting the wall and bounce accordingly
 */
Ball.prototype.checkOutOfBounds = function() {
  var	tBounced = false,
      tRadius = ProximitySettings.ballRadius,
      tWidth = this.paper.width,
      tHeight = this.paper.height;
		
		if( this.xx < tRadius ) {
			tBounced = true;
			this.vx = Math.abs(this.vx);
			this.xx = tRadius;
		}
		else if( this.xx > tWidth - tRadius)	{
			tBounced = true; 	
			this.xx = tWidth - tRadius;
			this.vx = -Math.abs(this.vx);
		}
		if( this.yy < tRadius) 	{
			tBounced = true;	
			this.vy = Math.abs(this.vy);
			this.yy = tRadius;
		}
		else if( this.yy > tHeight - tRadius) {
			tBounced = true;
			this.vy = -Math.abs(this.vy);
			this.yy = tHeight - tRadius;
		}

    // We track the number of bounces to pass to DG
		if (tBounced)
			this.nBounce++;
}

/**
 * Called by ProximityView to animate the ball to the next move's starting position
 * @param iPos
 */
Ball.prototype.moveTo = function( iPos) {
  this.circle.animate( { cx: iPos.x, cy: iPos.y }, 1000, '<>');
  this.scoreLabel.animate( { x: iPos.x, y: iPos.y + this.fontsize }, 1000, '<>')
  this.xx = iPos.x;
  this.yy = iPos.y;
  this.startX = iPos.x;
  this.startY = iPos.y;
}

/**
 * How far is the ball from the given coordinate point
 * @param iX
 * @param iY
 * @return {Number}
 */
Ball.prototype.distance = function( iX, iY) {
  var tDX = iX - this.xx,
      tDY = iY - this.yy;
  return Math.sqrt( tDX * tDX + tDY * tDY);
}

/**
 * Does the ball contain the given point where the ball's radius is scaled by the given amount
 * @param iX
 * @param iY
 * @param iScale
 * @return {Boolean}
 */
Ball.prototype.containsPoint = function( iX, iY, iScale) {
  return this.distance( iX, iY) < ProximitySettings.ballRadius * iScale;
}

