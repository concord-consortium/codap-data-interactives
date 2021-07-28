// ==========================================================================
// Project:   Shuffleboard
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Pad - Displays the disk that travels down the shuffleboard.
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iY  {Number} Vertical coordinate
 * @param iRightEdge {Number} The right edge, beyond which the disk shall not travel
 * @constructor
 */
function Pad( iPaper, iLayout, iLabelText)
{
  this.gamePaper = iPaper;
  this.layout = iLayout;
  this.normalColor = '#005172';
  this.diskPresentColor = '#9ACD32';
  this.x = 0;
  this.width = 0;
  this.rect = null;
  this.labelText = iLabelText;
  this.label = null;
  this.hint = null;
  this.hintBacking = null;
  // Reset for each game
  this.disks = [];
}

/**
 * Create my Raphael representation, positioned off the screen
 */
Pad.prototype.initialize = function()
{

  function mouseIn() {
    var kPadding = 3,
        tLeft = Math.round( this.rect.attr('x')) - this.layout.boardLeft,
        tRight = tLeft + Math.round( this.rect.attr( 'width')),
        tX = this.rect.attr('x') + this.rect.attr( 'width'),
        tY = this.rect.attr('y') + this.rect.attr( 'height') / 2,
        tBBox;
    this.hintBacking.toFront();
    this.hint.attr({ text: 'left edge: ' + tLeft + '\nright edge: ' + tRight, x: tX, y: tY })
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

  var tLeft = this.layout.boardLeft + this.x,
      tTop = this.layout.boardTop + this.layout.padInset,
      tWidth = this.width,
      tHeight = this.layout.tileHeight - 2 * this.layout.padInset;
  this.rect = this.gamePaper.rect( tLeft, tTop, tWidth, tHeight)
    .attr({ fill: this.normalColor, 'fill-opacity': 0.4, stroke: 'white' })
    .hover( mouseIn, mouseOut, this, this);
  this.label = this.gamePaper.text( tLeft + 3, tTop + tHeight - 6, this.labelText)
    .attr({'text-anchor': 'start', fill: 'white', 'font-size': 12});
  this.hintBacking = this.gamePaper.rect( 0, 0, 0, 0, 3)
                       .attr({ fill: 'black', 'fill-opacity': 0.7 })
                       .hide();
  this.hint = this.gamePaper.text( 0, 0, '')
    .attr( { fill: 'white', 'font-size': 12, 'text-anchor': 'start' })
    .hide();
};

/**
 * Empty my array of disks and anything else I need to do to prepare for a new game
 */
Pad.prototype.reset = function()
{
  this.disks = [];
  this.rect.attr({ fill: this.normalColor });
};

/**
 * Animate the pad to the given position with the given width
 * @param iX
 * @param iWidth
 */
Pad.prototype.setLeftEdgeAndWidth = function( iX, iWidth) {
  this.x = iX;
  this.width = iWidth;
  this.rect.animate( { x: this.layout.boardLeft + iX, width: iWidth }, 1000, '<>');
  this.label.animate( {x: this.layout.boardLeft + iX + 3 }, 1000, '<>');
};

/**
 * Is the given coordinate within this pad
 * @param iX
 * @return {Boolean}
 */
Pad.prototype.containsX = function( iX) {
  return (this.x <= iX) && (iX <= this.x + this.width);
};

/**
 * The return score is 0 for the left edge, 100 for the right edge, and linearly proportional between
 * @param iX
 * @return {Number}
 */
Pad.prototype.getScoreForX = function( iX) {
  var tScore = 0;
  if( this.containsX( iX)) {
    tScore = Math.round( 100 * (iX - this.x) / this.width);
  }
  return tScore;
};

/**
 * Add the given disk to the array of disks provided it is not null and not already present
 * @param iDisk
 */
Pad.prototype.addDisk = function( iDisk) {
  if( iDisk && this.disks.indexOf( iDisk) === -1)
    this.disks.push( iDisk);
};

/**
 * If then given disk is present in the array of disks, remove it
 * @param iDisk
 */
Pad.prototype.removeDisk = function( iDisk) {
  if( iDisk && this.disks.indexOf( iDisk) !== -1)
    this.disks = this.disks.filter( function( iElement) {
      return (iElement !== null) && (iElement !== iDisk);
    });
};

/**
 * The given disk is assumed to be on the pad. The returned score will be > 0 if there is no other or
 * earlier disk as far along.
 * @param iDisk
 * @return{Number}
 */
Pad.prototype.scoreForDisk = function( iDisk) {
  var tDiskX = iDisk.x,
      tScore = this.getScoreForX( tDiskX ),
      tIndexForDisk = -1;
  for( var i = 0; i < this.disks.length; i++) {
    var tThisDisk = this.disks[ i];
    if( tThisDisk === iDisk)
      tIndexForDisk = i;
    else if( (tIndexForDisk < 0) && (tThisDisk.x >= tDiskX))
      tScore = 0;
    else if( tThisDisk.x > tDiskX)
      tScore = 0;
  };
  return tScore;
};

/**
 * Tell each disk to update
 */
Pad.prototype.updateScoreOrnaments = function() {
  var tColor = (this.disks.length > 0) ? this.diskPresentColor : this.normalColor;
  this.rect.attr('fill', tColor);
  this.disks.forEach( function( iDisk) {
    iDisk.updateScoreOrnaments();
  });
};

/**
 * One disk can score; i.e. the one closest to right edge
 * @return {Number}
 */
Pad.prototype.getScore = function() {
  var tMaxX = 0;
  this.disks.forEach( function( iDisk) {
    tMaxX = Math.max( tMaxX, iDisk.x);
  });
  return this.getScoreForX( tMaxX);
}