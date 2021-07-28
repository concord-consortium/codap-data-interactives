// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines Tile - Displays the disk that travels down the shuffleboard.
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 * Defines a tile representation of a move.
 * @param iPaper
 * @param iColorMap
 * @constructor
 */
function Tile( iPaper, iColorMap)
{
  this.paper = iPaper;
  this.colorMap = iColorMap;
  this.kFullSize = 51;
  this.kTinySize = 16;
  this.kRounding = 6;
  this.kFontSize = 36;
  this.kTinyFontSize = 11;
  this.kShadowOffset = 5;
  this.kLetterColor = 'white';
  this.shadow = this.paper.rect( -this.kFullSize / 2 + this.kShadowOffset, -this.kFullSize / 2 + this.kShadowOffset,
                                  this.kFullSize, this.kFullSize, this.kRounding)
    .attr({ fill: 'black'});
  this.rect = this.paper.rect( -this.kFullSize / 2, -this.kFullSize / 2,
                                this.kFullSize, this.kFullSize, this.kRounding);
  this.letter = this.paper.text( 0, 0, '')
      .attr({'font-size': this.kFontSize, fill: this.kLetterColor });
  this.set = this.paper.set().push( this.shadow, this.rect, this.letter);
  this.set.attr('transform', 'S0')
}

/**
 *
 * @param iLetter
 */
Tile.prototype.setLetter = function( iLetter)
{
  this.letter.attr({ text: iLetter});
  this.rect.attr({ fill: this.colorMap[ iLetter]});
  return this;
};

/**
 *
 */
Tile.prototype.stop = function()
{
  this.set.stop();
  return this;
};

/**
 *
 * @param {Number} center X
 * @param {Number} center y
 */
Tile.prototype.setXY = function( iX, iY, iTime, iCompletionCallback)
{
//  this.set.animate({ transform: '...T' + iX + ','+ iY }, iTime, iCompletionCallback);
  var tSize = this.rect.attr('width'),
      tOffset = this.shadow.attr('x') - this.rect.attr('x');
  this.changeAttributes( { x: iX -tSize / 2, y: iY - tSize / 2 },
                        { x: iX - tSize / 2 + tOffset, y: iY - tSize / 2 + tOffset},
                        { x: iX, y: iY },
                        iTime, iCompletionCallback);

  return this;
};

/**
 *
 * @param {Number} center X
 * @param {Number} center y
 */
Tile.prototype.moveBy = function( iDX, iDY, iTime)
{
  var tSize = this.rect.attr('width' ),
      tX = this.rect.attr('x' ) + tSize / 2,
      tY = this.rect.attr('y' ) + tSize / 2;
  this.setXY( tX + iDX, tY + iDY, iTime);

  return this;
};

/**
 *
 * @param {Number} center X
 * @param {Number} center y
 */
Tile.prototype.fullScale = function( iTime, iCompletionCallback)
{
  this.set.animate({ transform: 'S1'}, iTime, iCompletionCallback);
  return this;
};

/**
 *
 * @param iTime - If 0, no animation
 * @return {*}
 */
Tile.prototype.makeTiny = function( iTime, iCompletionCallback)
{
  if( this.rect.attr('width') === this.kTinySize)
    return;
  var tX = this.rect.attr('x' ),
      tY = this.rect.attr('y' ),
      tCX = tX + this.kFullSize / 2,
      tCY = tY + this.kFullSize / 2,
      tRectAttrs = { width: this.kTinySize, height: this.kTinySize, r: 2,
                      x: tCX - this.kTinySize / 2, y: tCY - this.kTinySize / 2, 'stroke-width': 1},
      tShadAttrs = { width: this.kTinySize, height: this.kTinySize, r: 2,
                      x: tCX - this.kTinySize / 2 + 1, y: tCY - this.kTinySize / 2 + 1, 'stroke-width': 1},
      tLetterAttrs = { 'font-size': this.kTinyFontSize, 'font-weight': 'bold' };
  this.changeAttributes( tRectAttrs, tShadAttrs, tLetterAttrs, iTime, iCompletionCallback);

  return this;
};

/**
 *
 * @return {*}
 */
Tile.prototype.instantFullScale = function()
{
  this.set.stop();
  this.set.attr({transform: 'S1' });

  return this;
};

/**
 *
 * @return {*}
 */
Tile.prototype.instantTiny = function()
{
  this.set.stop();
  this.set.attr({transform: 'S1' });
  this.makeTiny(0);

  return this;
};

/**
 *
 * @param iTime - If 0, no animation
 * @return {*}
 */
Tile.prototype.changeAttributes = function( iRectAttrs, iShadowAttrs, iLetterAttrs,
                                            iTime, iCompletionCallback)
{
  if( iTime > 0) {
    this.rect.animate(iRectAttrs, iTime, '<>');
    this.shadow.animate(iShadowAttrs, iTime, '<>');
    this.letter.animate(iLetterAttrs, iTime, '<>', iCompletionCallback);
  }
  else {
    this.rect.attr(iRectAttrs);
    this.shadow.attr(iShadowAttrs);
    this.letter.attr(iLetterAttrs);
    if( iCompletionCallback)
      iCompletionCallback.call();
  }

  return this;
};

/**
 *  Animate tile to vanishingly small and then remove from paper
 */
Tile.prototype.fade = function( iOpacity)
{
  this.set.attr({'fill-opacity': iOpacity, 'stroke-opacity': iOpacity });
  return this;
}

/**
 *  Animate tile to vanishingly small and then remove from paper
 */
Tile.prototype.vanish = function( iTime)
{
  var this_ = this;

  function remove() {
    this_.set.remove();
  }

  this.set.animate({ transform: 'S0' }, iTime, '<', remove);
};

/**
 *  Animate tile to vanishingly small and then remove from paper
 */
Tile.prototype.finishVanish = function( iTime)
{
  this.set.stop();
  this.set.remove();
};

/**
 *  Set opacity to 0.3
 */
Tile.prototype.ghostMode = function()
{
  this.set.attr({'fill-opacity': 0.3, 'stroke-opacity': 0.3 });
  this.set.exclude( this.shadow);
  this.shadow.remove();
  return this;
};

/**
 *
 */
Tile.prototype.hide = function()
{
  this.set.hide();
  return this;
};

/**
 *
 */
Tile.prototype.show = function()
{
  this.set.show();
  return this;
};

