// ==========================================================================
// Project:   Shuffleboard
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines SliderView - handles manipulation of slider thumb
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
function SliderView( iModel)
{
  this.model = iModel;
  this.kLeftOffset = 13;  // pixels
  this.kRightOffset = 23; // pixels

  this.model.eventDispatcher.addEventListener("pushChange", this.updateThumb, this);
}

/**
 * Just create the Raphael elements that display the grid
 */
SliderView.prototype.initialize = function()
{
  var this_ = this,
      tSliderArea = document.getElementById("sliderArea" ),
      tModel = this.model,
      tStart;

  function thumbStart( iX, iY) {
    tStart = this_.pushToPixel( tModel.push);
  }

  function thumbMove( iDX, iDY, iX, iY) {
    tModel.setPush( this_.pixelToPush( tStart + iDX));
  }

  function thumbEnd() {

  }

  function sliderClick( iEvent) {
    tModel.setPush( this_.pixelToPush( iEvent.clientX))
  }

  this.layout = { sliderLeft: 10, sliderTop: -5, sliderWidth: 364, sliderHeight: 38,
                    thumbWidth: 15, thumbHeight: 16, thumbTop: 24};
  // Put up the slider
  this.sliderPaper = new Raphael(tSliderArea, tSliderArea.clientWidth, tSliderArea.clientHeight);
  this.sliderPaper.image('img/slider.png', this.layout.sliderLeft, this.layout.sliderTop,
                                      this.layout.sliderWidth - 1, this.layout.sliderHeight )
    .mousedown( sliderClick)
    .drag( thumbMove, thumbStart, thumbEnd);
  // Make the slider thumb
  this.thumb = this.sliderPaper.image('img/thumb.png', 0, this.layout.thumbTop,
                                      this.layout.thumbWidth, this.layout.thumbHeight)
    .drag( thumbMove, thumbStart, thumbEnd)
    .attr({ cursor: 'pointer'});
};

SliderView.prototype.updateThumb = function()
{
  var tX = this.pushToPixel( this.model.push) - this.layout.thumbWidth / 2;
  this.thumb.attr('x', tX);
}

SliderView.prototype.pushToPixel = function( iPush) {
  var tMin = this.layout.sliderLeft + this.kLeftOffset,
      tMax = this.layout.sliderLeft + this.layout.sliderWidth - this.kRightOffset,
      tWidth = tMax - tMin;
  return tMin + ( iPush / this.model.maxPush) * tWidth;
}

SliderView.prototype.pixelToPush = function( iX) {
  var tMin = this.layout.sliderLeft + this.kLeftOffset,
      tMax = this.layout.sliderLeft + this.layout.sliderWidth - this.kRightOffset,
      tWidth = tMax - tMin;
  return Math.min( this.model.maxPush, Math.max( 0, Math.round((iX - tMin) / tWidth * this.model.maxPush)));
}