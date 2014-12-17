// ==========================================================================
// Project:   LanderView
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 *     View of the moving lander. Receives events from model that update position of lander.
 *
 * @fileoverview Defines LanderView
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {LanderModel}
 * @constructor
 */
function LanderView( iModel, iElement) {
  var this_ = this,
      tWidth = iElement.width(),
      tHeight = iElement.height(),
      tGrad = '90-#888-#fff',
      tReverseGrad = '270-#888-#fff',
      tCharCenter, tButtonX, tURL;

  function doMouseDown() {
    if( this_.model.landerState !== 'descending')
      this_.model.requestDescent();
    if( (this === this_.topButton) || (this === this_.topButtonFlame)) {
      this_.model.beginThrust('top');
      this_.topButton.attr({ fill: tReverseGrad});
    }
    else{
      this_.model.beginThrust('bottom');
      this_.bottomButton.attr({ fill: tReverseGrad});
    }
  }

  function doMouseUp() {
    if( (this === this_.topButton) || (this === this_.topButtonFlame)) {
      this_.model.endThrust('top');
      this_.topButton.attr({ fill: tGrad});
    }
    else {
      this_.model.endThrust('bottom');
      this_.bottomButton.attr({ fill: tGrad});
    }
  }

  this.model = iModel;
  this.element = iElement;
  this.model.eventDispatcher.addEventListener('stateChange', this.handleStateChange, this);
  this.model.eventDispatcher.addEventListener('update', this.update, this);
  this.model.eventDispatcher.addEventListener('flightEnded', this.endFlight, this);
  this.model.eventDispatcher.addEventListener('setupChange', this.handleSetupChange, this);

  this.paper = new Raphael(iElement[0], tWidth, tHeight);
  this.paper.setStart();
    this.landerX = tWidth / 2 - this.kLanderWidth / 2;
    tURL = 'img/top_' + this.model.topColor + '.png';
    this.landerTop = this.paper.image( tURL, this.landerX, this.kTop, this.kLanderWidth, this.kLanderHalfHeight);
    tURL = 'img/bottom_' + this.model.bottomColor + '.png';
    this.landerBottom = this.paper.image( tURL, this.landerX, this.kTop + this.kLanderHalfHeight,
                                        this.kLanderWidth, this.kLanderHalfHeight);
    this.altitude = this.paper.text( this.landerX + this.kLanderWidth, this.kTop + this.kLanderHeight / 2, '')
                   .attr({fill: 'white', 'font-size': 12, 'text-anchor': 'start'});
    this.topFlame = this.paper.image('img/flame_up.png', this.landerX + this.kLanderWidth / 2 - this.kFlameWidth / 2,
                                    0, this.kFlameWidth, this.kFlameHeight)
      .hide();
    this.leftFlame = this.paper.image('img/flame_down.png', this.landerX + 3 - this.kFlameWidth / 2,
                                    this.kTop + this.kLanderHeight - 1, this.kFlameWidth, this.kFlameHeight)
      .hide();
    this.rightFlame = this.paper.image('img/flame_down.png', this.landerX + this.kLanderWidth - 3 - this.kFlameWidth / 2,
                                    this.kTop + this.kLanderHeight - 1, this.kFlameWidth, this.kFlameHeight)
      .hide();
  this.rocket = this.paper.setFinish();

  if( this.model.side === 'left') {
    tCharCenter = 10;
    tButtonX = 24;
  }
  else {
    tCharCenter = tWidth - 10;
    tButtonX = tWidth - 24 - this.kButtonSide;
  }

  this.topKey = this.paper.text( tCharCenter, this.kButtonTop + this.kButtonSide / 2, this.model.keyTop.toUpperCase())
    .attr({ fill: 'white', 'font-size': this.kFontSize });
  this.topButton = this.paper.rect( tButtonX, this.kButtonTop, this.kButtonSide, this.kButtonSide, 5)
    .attr({ fill: tGrad, cursor: 'pointer'})
    .mousedown( doMouseDown)
    .mouseup( doMouseUp);
  this.topButtonFlame = this.paper.image('img/large_flame_up.png', tButtonX + 7, this.kButtonTop + 2, 10, 22)
    .attr({ cursor: 'pointer'})
    .mousedown( doMouseDown)
    .mouseup( doMouseUp );

  this.bottomKey = this.paper.text( tCharCenter, this.kButtonTop + 3 * this.kButtonSide / 2 + this.kButtonGap,
                                    this.model.keyBottom.toUpperCase())
    .attr({ fill: 'white', 'font-size': this.kFontSize });
  this.bottomButton = this.paper.rect( tButtonX, this.kButtonTop + this.kButtonSide + this.kButtonGap,
                                    this.kButtonSide, this.kButtonSide, 5)
    .attr({ fill: tGrad, cursor: 'pointer'})
    .mousedown( doMouseDown)
    .mouseup( doMouseUp);
  this.bottomButtonFlame = this.paper.image('img/large_flame_down.png', tButtonX + 7,
                              this.kButtonTop + this.kButtonSide + this.kButtonGap + 2, 10, 22)
    .attr({ cursor: 'pointer'})
    .mousedown( doMouseDown)
    .mouseup( doMouseUp);

  this.reset();
  this.handleStateChange( { newState: 'inactive'});
}

LanderView.prototype.kTop = 13;
LanderView.prototype.kBottom = 299;
LanderView.prototype.kLanderWidth = 20;
LanderView.prototype.kLanderHalfHeight = 13;
LanderView.prototype.kLanderHeight = 26;
LanderView.prototype.kFlameWidth = 6;
LanderView.prototype.kFlameHeight = 13;
LanderView.prototype.kFontSize = 20;
LanderView.prototype.kButtonTop = 26;
LanderView.prototype.kButtonSide = 26;
LanderView.prototype.kButtonGap = 10;

LanderView.prototype.handleStateChange = function( iEvent) {
  switch( iEvent.newState) {
    case 'active':
      this.element.toggle( true);
      break;
    case 'inactive':
      this.element.toggle( false);
      break;
  }
};

LanderView.prototype.update = function( iEvent) {
  var tAlt = (this.model.landerState === 'descending') ? Math.round(this.model.altitude) : '';
  this.positionLander( this.model.altitude);
  this.altitude.attr('text', tAlt);
  this.topFlame.hide();
  this.leftFlame.hide();
  this.rightFlame.hide();
  if( tAlt > 0) {
    if(this.model._thrust > 0) {
      this.topFlame.show();
    }
    else if( this.model._thrust < 0) {
      this.leftFlame.show();
      this.rightFlame.show();
    }
  }
};

LanderView.prototype.positionLander = function( iWorldY) {
  var tY = (this.model.kWorldTop - iWorldY) / this.model.kWorldTop * (this.kBottom - this.kTop);
  this.rocket.attr('transform', 'T0 ' + tY);
};

LanderView.prototype.reset = function() {
  this.rocket.transform('');
};

LanderView.prototype.endFlight = function() {
var this_ = this,
    tHeight = this.model.velocity / 5,
    tTime = 30 * tHeight;

  function down() {
    this_.rocket.animate({transform: '...t0 ' + tHeight}, tTime, '<');
  }
  this.rocket.animate({transform: '...t0 -' + tHeight}, tTime, '>', down);
};

/**
 * Synch with model parameters
 */
LanderView.prototype.handleSetupChange = function() {
  var tCurrSrc = this.landerTop.attr('src' ),
      tSrcInModel = 'img/top_' + this.model.topColor + '.png';
  if( tCurrSrc !== tSrcInModel)
    this.landerTop.attr('src', tSrcInModel);
  tCurrSrc = this.landerBottom.attr('src' ),
  tSrcInModel = 'img/bottom_' + this.model.bottomColor + '.png';
  if( tCurrSrc !== tSrcInModel)
    this.landerBottom.attr('src', tSrcInModel);

  this.topKey.attr('text', this.model.keyTop.toUpperCase());
  this.bottomKey.attr('text', this.model.keyBottom.toUpperCase());
}