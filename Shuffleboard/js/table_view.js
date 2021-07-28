// ==========================================================================
// Project:   Shuffleboard
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines TableView - Handles display of pads and disks
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {ShuffleModel}
 * @param iPaper {Paper}
 * @param iLayout {Object}
 * @constructor
 */
function TableView( iModel, iPaper, iLayout)
{
  this.model = iModel;
  this.gamePaper = iPaper;
  this.layout = iLayout;
  this.pads = [];
  this.disks = [];
}

/**
 * Just create the Raphael elements that display the grid
 */
TableView.prototype.initialize = function()
{
  this.model.eventDispatcher.addEventListener("diskIncrement", this.handleDiskIncrement, this);
  this.model.eventDispatcher.addEventListener("turnStateChange", this.handleTurnStateChange, this);

  // Make the four landing pads
  for( var i = 0; i < ShuffleSettings.numPads; i++) {
    var tPad = new Pad( this.gamePaper, this.layout, this.model.padNumbers[ i]);
    tPad.initialize();
    this.pads.push( tPad);
  }

  // Make the disks, positioned off screen
  var tNumDisks = ShuffleSettings.disksPerGame,
      kTopOffset = 5,
      kBottomOffset = 15,
      tBetween = (this.layout.tileHeight - (kTopOffset + kBottomOffset)) / tNumDisks,
      tRightEdge = this.layout.boardLeft + ShuffleSettings.numTiles * (this.layout.tileWidth + this.layout.tileGap);
  for( i = 0; i < tNumDisks; i++) {
    var tY = this.layout.boardTop + kTopOffset + (i + 0.5) * tBetween,
        tDisk = new Disk( this.gamePaper, tY, this.layout.boardLeft, tRightEdge);
    tDisk.initialize();
    this.disks.push( tDisk);
  }
};

/**
 * The model has decided where the pads belong and how wide they are.
 */
TableView.prototype.prepareForNewGame = function() {
  var this_ = this,
      tWidth = this.model.padWidth;
  this.pads.forEach( function( iPad, iIndex) {
    var tLeft = this_.model.firstPadLeft + iIndex * this_.model.padOffset;
    iPad.setLeftEdgeAndWidth( tLeft, tWidth);
    iPad.reset();
  })

  this.disks.forEach( function( iDisk) {
    iDisk.reset();
  });
};

/**
 * It's time for another disk. It's starting position has been computed, so we can position it.
 */
TableView.prototype.handleDiskIncrement = function() {
  var tDisk = this.disks[ this.model.disk];
  tDisk.setInitialX( this.model.startPos);
};

/**
 * If the new state is 'pushing' then we push the current disk
 */
TableView.prototype.handleTurnStateChange = function( iEvent) {
  if( iEvent.newState === 'pushing') {
    var tDisk = this.disks[ this.model.disk];
    tDisk.setupForPush( this.model.push, this.model.getImpulse(), this.model.friction); //setupForPush is in disk.js
    this.startDiskAnimation( tDisk); //line 96
  }
};

/**
 * The disk will animate from its current position according to the model's push
 */
TableView.prototype.startDiskAnimation = function( iDisk) {
  var this_ = this,
      tTime = Date.now()
      tCurrentPad = null;

  function oneFrame () {
    var tNow = Date.now(),
        tDeltaT = (tNow - tTime) / 1000,
        tPad = this_.getPadAtDistance( iDisk.x);
    if( this_.model.autoplayAbort) {
      iDisk.stop();
      this_.model.score = this_.getTotalScore();
      document.getElementById("score").innerHTML = this_.model.score;
      return;
    }
    if( this_.model.autoplay)
      tDeltaT *= 5;
    iDisk.oneFrame( tDeltaT);
    iDisk.setPad( tPad);
    if( tPad)
        tPad.updateScoreOrnaments();
    this_.model.setOneScore( this_.getScoreForDisk( iDisk));
    this_.model.score = this_.getTotalScore();
    document.getElementById("score").innerHTML = this_.model.score;

    if( iDisk.isMoving()) {
      tTime = tNow;
      setTimeout( oneFrame, ShuffleSettings.tickInterval);
    }
    else {
      this_.handleEndOfPush( iDisk);//line 157
    }
  }

  if( this.model.fastPush) {
    var tFastPad;
    iDisk.fastPush();
    tFastPad = this.getPadAtDistance( iDisk.x);
    iDisk.setPad( tFastPad);
    if( tFastPad)
      tFastPad.updateScoreOrnaments();
    this_.handleEndOfPush( iDisk);//line 157
  }
  else {
    setTimeout( oneFrame, ShuffleSettings.tickInterval);
    KCPCommon.setElementVisibility( "gameCover", true);
  }
};

/**
 * Compute and return the total of the scores for each pad
 * @return {Number}
 */
TableView.prototype.getScoreForDisk = function( iDisk) {
  var tPad = this.getPadAtDistance( iDisk.x);
  return (tPad === null) ? 0 : tPad.scoreForDisk( iDisk);
}

/**
 * The disk has stopped moving. Update the model accordingly.
 */
TableView.prototype.handleEndOfPush = function( iDisk) {
  var tPadIndex = this.getPadIndexAtDistance( iDisk.x ),
      tPad = (tPadIndex >= 0) ? this.pads[ tPadIndex] : null;
  this.model.endPos = iDisk.x;
  this.model.setPad( tPadIndex);
  this.model.setOneScore( (tPad === null) ? 0 : tPad.scoreForDisk( iDisk));
  this.model.score = this.getTotalScore();
  KCPCommon.setElementVisibility( "gameCover", false);
  this.model.endTurn();//
  document.getElementById("score").innerHTML = this.model.score;
};

/**
 *
 * @param iX{Number} in pixels from left edge of board
 * @return {Number} -1 for none, 0 through 4 for one of the pads
 */
TableView.prototype.getPadIndexAtDistance = function( iX) {
  var tResult = -1;
  this.pads.forEach( function( iPad, iIndex) {
    if( iPad.containsX( iX))
      tResult = iIndex;
  });
  return tResult;
};

/**
 *
 * @param iX iX{Number} in pixels from left edge of board
 * @return {*}
 */
TableView.prototype.getPadAtDistance = function( iX) {
  var tPadIndex = this.getPadIndexAtDistance( iX);
  return (tPadIndex >= 0) ? this.pads[ tPadIndex] : null;
};

/**
 * Return the sum of the scores for the pads.
 * @return {Number}
 */
TableView.prototype.getTotalScore = function() {
  var tScore = 0;
  this.pads.forEach( function( iPad) {
    tScore += iPad.getScore();
  });
  return tScore;
}