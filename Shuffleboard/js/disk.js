// ==========================================================================
// Project:   Shuffleboard
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Disk - Displays the disk that travels down the shuffleboard.
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iY  {Number} Vertical coordinate
 * @param iRightEdge {Number} The right edge, beyond which the disk shall not travel
 * @constructor
 */
function Disk( iPaper, iY, iLeftEdge, iRightEdge)
{
  this.gamePaper = iPaper;
  // These properties vary during a push
  this.x = 0;
  this.y = iY;
  this.crossRotation = 0;
  this.xVel = 0;

  // These properties set at beginning of push
  this.push = '';  // Displayed in hint
  this.friction = 0;
  this.crossRotation = 0;
  this.pad = null;
  this.scoreRing = null;  // Shows when we're a high-scoring disk on a pad
  this.scoreBand = null;  // Ditto
  this.scoreLabel = null; // Ditto
  this.hint = null;
  this.hintBacking = null;

  // Constants
  this.leftEdge = iLeftEdge;
  this.rightEdge = iRightEdge;
  this.elements = iPaper.set();
  this.ornaments = iPaper.set();
  this.kRadius = 10;  // pixels
}

/**
 * Create my Raphael representation, positioned off the screen
 */
Disk.prototype.initialize = function()
{
  function mouseIn() {
    var kPadding = 3,
        tScore = (this.pad === null) ? 0 : Math.round(this.pad.scoreForDisk( this)),
        tPosition = Math.round( this.x),
        tPush = this.push,
        tX = this.x + this.leftEdge + this.kRadius,
        tY = this.y,
        tBBox;
    this.hintBacking.toFront();
    this.hint.attr({ text: 'score: ' + tScore + '\nposition: ' + tPosition + '\npush: ' + tPush,
                            x: tX, y: tY })
      .toFront()
      .show();
    tBBox = this.hint._getBBox();
    this.hintBacking.attr({ x: tBBox.x - kPadding, y: tBBox.y - kPadding,
                            width: tBBox.width + 2 * kPadding, height: tBBox.height + 2 * kPadding });
    this.hintBacking.show();
  }

  function mouseOut() {
    this.hint.hide();
    this.hintBacking.hide();
  }

  var tX = -2 * this.kRadius,
      tHDiam = 'M' + (tX - this.kRadius) + ' ' + this.y + ' h ' + (2 * this.kRadius),
      tVDiam = 'M' + tX + ' ' + (this.y - this.kRadius) + ' v ' + (2 * this.kRadius);
  this.scoreBand = this.gamePaper.rect( tX, this.y - this.kRadius, 0, 2 * this.kRadius)
                        .attr({ 'fill-opacity': 0.7, fill: 'green', 'stroke-width': 0 })
                        .hover( mouseIn, mouseOut, this, this)
                        .hide();
  this.ornaments.push( this.scoreBand);
  this.elements.push( this.gamePaper.circle( tX, this.y, this.kRadius)
                        .attr({ fill: 'blue'})
                        .hover( mouseIn, mouseOut, this, this));
  this.elements.push( this.gamePaper.path( tHDiam)
                        .attr({ 'stroke-width': 2, stroke: 'white' })
                        .hover( mouseIn, mouseOut, this, this));
  this.elements.push( this.gamePaper.path( tVDiam)
                        .attr({ 'stroke-width': 2, stroke: 'white' })
    .hover( mouseIn, mouseOut, this, this));
  this.scoreRing = this.gamePaper.circle( tX, this.y, this.kRadius)
                        .attr({ stroke: 'yellow', 'stroke-width': 2 })
                        .hover( mouseIn, mouseOut, this, this)
                        .hide();
  this.ornaments.push( this.scoreRing);
  this.scoreLabel = this.gamePaper.text( tX, this.y + this.kRadius + 6, '')
                        .attr({ stroke: 'yellow', 'font-size': 12 })
                        .hide();
  this.ornaments.push( this.scoreLabel);

  this.hintBacking = this.gamePaper.rect( 0, 0, 0, 0, 3)
                       .attr({ fill: 'black', 'fill-opacity': 0.5 })
                       .hide();
  this.hint = this.gamePaper.text( 0, 0, '')
    .attr( { fill: 'white', 'font-size': 12, 'text-anchor': 'start' })
    .hide();
};

Disk.prototype.reset = function() {
  this.elements.attr('transform', '');
  this.ornaments.attr('transform', '');
  this.crossRotation = 0;
  this.ornaments.hide();
  this.pad = null;
  this.push = '';
}

/**
 * Return the string that will correctly transform the disk and its internal cross
 * @param iX{Number} x-coord of disk center
 * @param iRotation{Number} rotation in degrees
 * @return {String}
 */
Disk.prototype.getTransform = function( iX, iRotation) {
  return 'T' + (this.leftEdge + 2 * this.kRadius + iX) + ' 0' + ' R' + iRotation;
};

/**
 * Return the string that will correctly transform the disk ornaments
 * @param iX{Number} x-coord of disk center
 * @return {String}
 */
Disk.prototype.getOrnamentsTransform = function( iX) {
  return 'T' + (this.leftEdge + 2 * this.kRadius + iX) + ' 0';
};

/**
 * Animate the disk to the given position in pixels from leftEdge. Used to enter waiting state. No need
 * to transform the ornaments since they don't show in waiting state.
 * @param iX{Number} Pixels from left edge
 */
Disk.prototype.setInitialX = function( iX) {
  this.x = iX;
  this.elements.animate({ transform: this.getTransform( iX, this.crossRotation)}, 1000, '<>');
  this.ornaments.animate({ transform: this.getOrnamentsTransform( iX)}, 1000, '<>');
};

/**
 * Move the disk and its ornaments to the position given by this.x
 */
Disk.prototype.updatePosition = function() {
  this.elements.attr({ transform: this.getTransform( this.x, this.crossRotation)});
  this.ornaments.attr({ transform: this.getOrnamentsTransform( this.x)});
};

/**
 * Called just prior to beginning an animation.
 * @param iPush {Number} The user input amount of push
 * @param iImpulse {Number} Derived from iPush but includes variability and level's impulseFactor
 */
Disk.prototype.setupForPush = function( iPush, iImpulse, iFriction) {
  this.push = iPush;
  this.xVel = Math.sqrt( iImpulse);
  this.friction = iFriction;
  this.crossRotation = 0;
  this.pad = null;
  this.elements.stop();
  this.ornaments.stop();
};

/**
 *
 * @return {Boolean} true if xVel > 0
 */
Disk.prototype.isMoving = function() {
  return this.xVel > 0;
};

/**
 *
 * Set the velocity to zero and reset its position off screen
 */
Disk.prototype.stop = function() {
  this.xVel = 0;
  this.setPad(null);
  this.reset();
};

/**
 * Transform the position and rotation of the disk so that it is at the correct location during the animation.
 * @param iDT{Number} Time in seconds since the last frame
 */
Disk.prototype.oneFrame = function( iDT) {
  if (this.xVel > 0)
    this.crossRotation += (this.xVel) * iDT;

  if (this.xVel != 0)
    this.x += this.xVel * iDT - (1/2) * this.friction * iDT * iDT;	//	friction is positive

  if( this.leftEdge + this.x + this.kRadius >= this.rightEdge) {
    this.xVel = 0;
    this.x = this.rightEdge - this.leftEdge - this.kRadius;
  }

  if (this.xVel > 0)
    this.xVel -= this.friction * iDT;

  this.updatePosition();
};

/**
 * Move the disk to its 'end-of-push' position
 */
Disk.prototype.fastPush = function() {
  var	totalTime = this.xVel / this.friction;		//	in seconds
  this.x	+=	(this.xVel / 2) * totalTime ;
  this.x = Math.min( this.x, this.rightEdge - this.leftEdge - this.kRadius);
  this.crossRotation += this.xVel * totalTime;
  this.xVel = 0;
  this.updatePosition();
};

/**
 * We set the current pad, removing ourselves from any previous pad and adding ourselves
 * to a new one. Finally, we show the ornamentation related to being on the new pad.
 * @param iPad
 */
Disk.prototype.setPad = function( iPad) {
  var tPrevPad = this.pad;
  if( iPad !== tPrevPad) {
    if( tPrevPad) {
      tPrevPad.removeDisk( this);
      tPrevPad.updateScoreOrnaments();
    }
    this.pad = iPad;
    if( this.pad) {
      this.pad.addDisk( this);
    }
  }
};

/**
 * If we're the high-scoring disk on our pad, we show our scoring ring and our scoring band.
 * If we're moving, we also display the current score. If we're not moving, we dim both our disk
 * image and any ornaments.
 * If we're not on a pad or we're not the high-scoring disk, all ornaments are hidden.
 */
Disk.prototype.updateScoreOrnaments = function( ) {
  var tScore = (this.pad) ? this.pad.scoreForDisk( this) : 0;
  if( tScore > 0) {
    var tBandWidth = this.x - this.pad.x,
        tVisibleScore = (this.xVel > 0) ? tScore: '';
    this.scoreLabel.attr({ text: tVisibleScore, x: -2 * this.kRadius - tBandWidth / 2 });
    this.scoreBand.attr({ x: -2 * this.kRadius - tBandWidth, width: tBandWidth });
    this.ornaments.show();
  }
  else {
    this.ornaments.hide();
  }
};