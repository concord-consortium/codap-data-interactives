// ==========================================================================
// Project:   Cart
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global CartSettings */

/**
 * @fileoverview Defines Cart, the behavior of the game's cart whose weight the user guesses
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iPaper  {Paper}
 * @constructor
 */
function Cart( iPaper, iDispatcher)
{
  var tCS = CartSettings;
  iDispatcher.addEventListener("cartChange", this.updateCartNum, this);
  this.paper = iPaper;
  this.fontsize = 18;

  this.home = { x: -tCS.cartWidth, y: tCS.platformTop - tCS.cartHeight - tCS.wheelRadius - 2 };
  this.body = this.paper.rect( this.home.x, this.home.y,
                              tCS.cartWidth, tCS.cartHeight)
    .attr({ fill: tCS.cartColor, 'stroke-width': 0 });
  this.of5 = this.paper.text( this.home.x + 10 + tCS.cartWidth / 3, this.home.y + tCS.cartHeight / 2,
                              'of ' + tCS.numCarts)
    .attr({ 'font-size': 16, 'text-anchor': 'start', fill: tCS.cartTextColor });
  this.cartNum = this.of5.clone()
                   .attr({ x: this.home.x + 25, fill: 'white', text: '', 'font-weight': 'bold' });

  var tWheelPos = { x: this.home.x + tCS.cartWidth / 6, y: this.home.y + 2 * tCS.wheelRadius },
      tInnerWheelR = tCS.wheelRadius / 2,
      tInnerPos = { x: tWheelPos.x, y: tWheelPos.y + 3 / 2 * tCS.wheelRadius };

  function constructWheelPath() {
    return 'M' + tWheelPos.x + ' ' + tWheelPos.y + 'A' +
                                    tCS.wheelRadius + ',' + tCS.wheelRadius + ' 0 1, 0 ' +
                                    (tWheelPos.x + 1) + ',' +
                                    tWheelPos.y + 'z' +
            'M' + tInnerPos.x + ' ' + tInnerPos.y + 'A' +
                                   tInnerWheelR + ',' + tInnerWheelR + ' 0 1, 1 ' +
                                   (tInnerPos.x + 1) + ',' + tInnerPos.y + 'z';
  }

  this.back = this.paper.path( constructWheelPath()).attr({ fill: 'black' });
  tWheelPos.x += tCS.cartWidth * 2 / 3;
  tInnerPos.x += tCS.cartWidth * 2 / 3;
  this.front = this.back.clone().attr({ path: constructWheelPath() });
  this.cart = this.paper.set()
    .push( this.body, this.of5, this.cartNum, this.back, this.front );
  this.bricks = this.paper.set();
}

/**
 * Transform the elements that make up the cart to the appropriate position.
 * @param iPosition{String} offLeft, guessing, weighing, offRight
 */
Cart.prototype.updatePosition = function( iPosition, iCallback) {
  var tCS = CartSettings,
      tTransform = '',
      tTime = tCS.animationTime,
      tEasing = tCS.easing;
  this.position = iPosition;
  switch( this.position) {
    case 'offLeft':
      this.cart.attr({ transform: ''});
      this.bricks.attr({ transform: ''});
      return;
    case 'guessing':
      tTransform = 'T' + (tCS.cartGap - this.home.x) + ' 0';
      break;
    case 'weighing':
      tTransform = 'T' + (tCS.scaleLeft - this.home.x + tCS.cartGap) + ' 0';
      break;
    case 'descending':
      tTransform = 'T' + (tCS.scaleLeft - this.home.x + tCS.cartGap) + ' ' +
                   (tCS.pillarEmptyHeight - tCS.pillarFullHeight);
      tEasing = 'bounce';
      break;
    case 'offRight':
      tTransform = 'T' + (this.paper.width - this.home.x) + ' ' +
                         (tCS.pillarEmptyHeight - tCS.pillarFullHeight);
      break;
  }
  this.cart.animate({ transform: tTransform }, tTime, tEasing );
  this.bricks.animate({ transform: tTransform }, tTime, tEasing, iCallback );
};

/**
 *
 * @param iNumBricks{Number} of large bricks
 * @param iNumSmBricks{Number} of small bricks
 */
Cart.prototype.updateBricks = function( iNumBricks, iNumSmBricks) {
  var this_ = this;

  var tCS = CartSettings,
      tSmBrickWidth = (tCS.brickWidth - tCS.smallBrickGap) / 2,
      tNumRows = Math.ceil( (iNumBricks + iNumSmBricks / 2) / tCS.bricksPerLayer ),
      tBrick1 = this.paper.image( 'img/brick1.png', 0, 0, tCS.brickWidth, tCS.brickHeight),
      tBrick2 = this.paper.image( 'img/brick2.png', 0, 0, tCS.brickWidth, tCS.brickHeight),
      tSmBrick1 = this.paper.image( 'img/sm_brick1.png', 0, 0, tSmBrickWidth, tCS.brickHeight),
      tSmBrick2 = this.paper.image( 'img/sm_brick2.png', 0, 0, tSmBrickWidth, tCS.brickHeight ),
      tBricksString = iNumBricks;
  if( iNumSmBricks > 0)
    tBricksString += ' + ' + iNumSmBricks;
  tBricksString += ' bricks';
  this.bricks.remove();
  this.bricks.clear();

  function computeY( iRowNum) {
    return this_.home.y - (iRowNum + 1) * (tCS.brickHeight + tCS.brickVGap);
  }

  this.bricks.push( this.paper.text( this.home.x, computeY( tNumRows) + 2, tBricksString)
    .attr({ 'text-anchor': 'start', 'font-size': 16 }));

  for( var tRow = 0; tRow < tNumRows; tRow++) {
    for( var tCol = 0; tCol < tCS.bricksPerLayer; tCol++) {
      var tX = this.home.x + tCol * (tCS.brickWidth + tCS.brickHGap),
          tY = computeY( tRow ),
          tBrick = (Math.random() < 0.5) ? tBrick1 : tBrick2;
      if( iNumBricks > 0) {
        iNumBricks--;
        this.bricks.push( tBrick.clone().attr({ x: tX, y: tY }));
      }
      else {
        for( var iPos = 0; iPos < 2; iPos++) {
          if( iNumSmBricks > 0) {
            iNumSmBricks--;
            this.bricks.push( ((Math.random() < 0.5) ? tSmBrick1 : tSmBrick2).clone()
                                .attr({ x: tX + iPos * (tSmBrickWidth + tCS.smallBrickGap), y: tY }));
          }
        }
      }
    }
  }
  tBrick1.remove();
  tBrick2.remove();
  tSmBrick1.remove();
  tSmBrick2.remove();
};

/**
 *
 * @param iEvent{Event}
 */
Cart.prototype.updateCartNum = function( iEvent) {
  this.cartNum.attr( 'text', iEvent.cartNum);
  if( iEvent.ofText === '')
      this.of5.attr( 'text', '');
};
