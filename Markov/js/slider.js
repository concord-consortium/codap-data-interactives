// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Slider - Implements a UI element to allow user to change speed.
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 * Defines a tile representation of a move.
 * @param iID Element ID
 * @constructor
 */
function Slider( iID, iModel)
{
  var tSliderArea = document.getElementById( iID ),
      kInset = 10,
      kThickness = 6,
      kRounding = 4,
      kRadius = 8,
      kFontSize = 12;
  this.offsetLeft = tSliderArea.offsetLeft;
  this.kMaxTime = MarkovSettings.kAnimTime;
  this.kMinTime = 25;
  this.model = iModel;
  this.paper = new Raphael(tSliderArea, tSliderArea.clientWidth, tSliderArea.clientHeight);;
  this.rect = this.paper.rect( kInset, kRadius - kThickness / 2,
                                tSliderArea.clientWidth - 2 * kInset, kThickness, kRounding)
    .attr({ fill: 'white', 'stroke': 'darkgray'});
  this.thumb = this.paper.circle( tSliderArea.clientWidth / 2, kRadius, kRadius)
    .attr({ fill: 'r(0.5,0.5)#fff-#444', cursor: 'move', 'stroke-width': 0});
  this.slow = this.paper.text( 0, tSliderArea.clientHeight - kFontSize / 2, 'slow')
    .attr({ 'font-size': kFontSize, 'text-anchor': 'start', fill: 'white'});
  this.fast = this.paper.text( tSliderArea.clientWidth, tSliderArea.clientHeight - kFontSize / 2, 'fast')
    .attr({ 'font-size': kFontSize, 'text-anchor': 'end', fill: 'white'});
  this.kLeft = kInset + kRounding / 2;
  this.kWidth = this.rect.attr('width') - kRounding;
  this.setThumb();
  this.setupDragging();
}

/**
 * Move the thumb into position according to model value
 */
Slider.prototype.setThumb = function()
{
  var tTime = this.model.animTime,
      tCX = this.kLeft + (this.kMaxTime - tTime) / (this.kMaxTime - this.kMinTime) * this.kWidth;
  this.thumb.attr('cx', tCX);
};

/**
 * Set the model value from the given x-coord and then update the thumb
 */
Slider.prototype.setModel = function( iX)
{
  var tProportion = (this.kLeft + this.kWidth - iX) / this.kWidth;
  this.model.animTime = Math.max( this.kMinTime, Math.min( this.kMaxTime,
                        this.kMinTime + tProportion * (this.kMaxTime - this.kMinTime)));
  this.setThumb();
};

/**
 * Set the routines for dragging the thumb.
 */
Slider.prototype.setupDragging = function()
{
  var this_ = this,
      tCX = null;

  function thumbDragStart( iX, iY, iEvent) {
    tCX = this_.thumb.attr('cx')
  }

  function thumbDragMove( iDX, iDY, iX, iY, iEvent) {
    this_.setModel( tCX + iDX);
  }

  function thumbDragStop( iEvent) {
    tCX = null;
    // Log speed as an integer 0 to 10 with 0 being slow and 10 being fast
      var logAction = function(){
          MarkovGame.model.codapPhone.call({
              action:'logAction',
              args: {formatStr: "setSpeed: " +
                  JSON.stringify( { speed: 10 - Math.round(this_.model.animTime / 100)}) }
          });
      }.bind(this);
      logAction();
    /*MarkovGame.model.dgApi.doCommand("logAction",
                           {
                             formatStr: "setSpeed: " +
                                     JSON.stringify( { speed: 10 - Math.round(this_.model.animTime / 100)})
                           });*/
  }

  function clickRect( iEvent, iX, iY) {
    this_.setModel( iX - this_.offsetLeft);
  }

  this.thumb.drag( thumbDragMove, thumbDragStart, thumbDragStop);
  this.rect.click( clickRect);
};

