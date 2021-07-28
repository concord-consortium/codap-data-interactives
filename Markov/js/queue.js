// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Queue - Shows Markov's previous moves, most recent on the right
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * Defines a queue representation of a move.
 * @param iPaper
 * @constructor
 */
function Queue( iPaper, iModel)
{
  this.paper = iPaper;
  this.model = iModel;
  this.tiles = [];  // Most recent tiles have lowest indices
  this.kMax = 15;   // Only this many tiles get kept
  this.layout = { queueX: 276, queueY: 230 }
  this.label = this.paper.text( this.layout.queueX + 8, this.layout.queueY - 18, 'Markov\'s previous moves')
    .attr({ 'text-anchor': 'end', 'font-size': 12 })
    .hide();
}

/**
 * Given tile gets moved to queue and pushed on list. Extra tile removed if necessary
 * @param iTile
 */
Queue.prototype.pushTile = function( iTile, iCompletionCallback) {
  var this_ = this,
      tTime = this.model.autoplay ? this.model.animTime : MarkovSettings.kAnimTime;

  function pushTiles() {
    var tNumTiles = this_.tiles.length;
    if( tNumTiles >= this_.kMax) {
      var tLast = this_.tiles.shift();
      tLast.vanish( tTime);
      tNumTiles--;
    }
    this_.tiles.forEach( function( iTile, iIndex) {
      var tPosition = this_.kMax - tNumTiles + iIndex;
      iTile.moveBy( -iTile.kTinySize - 3, 0, tTime);
      iTile.fade( tPosition / this_.kMax);
    });
  }

  if( iTile) {
    iTile.setXY( this.layout.queueX, this.layout.queueY, tTime, iCompletionCallback);
    pushTiles();
    this.tiles.push( iTile);
    this.label.show();  // only has effect the first time
  }
};

/**
 * Called when we're midstream in a push. Stop the animations and put tiles in
 * correct places with correct fading.
 */
Queue.prototype.abortPush = function() {
  var tNumTiles = this.tiles.length,
      tPosX = this.layout.queueX,
      tPosY = this.layout.queueY;
  this.tiles[ tNumTiles - 1].stop();
  for( var i = tNumTiles - 1; i >= 0; i--) {
    var tTile = this.tiles[ i];
    tTile.setXY( tPosX, tPosY, 0);
    tTile.fade( (this.kMax - tNumTiles + i) / this.kMax);
    tPosX -= tTile.kTinySize + 3;
  }
};

/**
 * Called when we're midstream in a push. Stop the animations and put tiles in
 * correct places with correct fading.
 */
Queue.prototype.instantAddTile = function( iTile) {
  this.tiles.push( iTile);
  this.abortPush();
};

/**
 * Empty the array of tiles, removing them all from the paper
 */
Queue.prototype.reset = function() {
  this.tiles.forEach( function( iTile) {
    iTile.vanish( 100);
  });
  this.tiles = [];
  this.label.hide();
};

