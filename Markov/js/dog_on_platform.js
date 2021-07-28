// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines DogOnPlatform - Shows Madeline the dog on elevated platform
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iPaper
 * @constructor
 */
function DogOnPlatform( iModel)
{
  this.model = iModel;
  var tPoleArea = document.getElementById("poleArea" );
  this.paper = new Raphael(tPoleArea, tPoleArea.clientWidth, tPoleArea.clientHeight);
  this.layout = { poleCenter: 41, poleBaseWidth: 32, poleBaseHeight: 7, poleBaseY: 270,
                  poleY: 164, poleNormalHeight: 115, poleWidth: 10,
                  platformWidth: 74, platformHeight: 15,
                  normalDogWidth:42, normalDogHeight: 72, normalDogVOffset: 10,
                  poleTopAtExit: 84, poleMaxHeight: 193,
                  startPosition: 6,
                  numPositions: 23 };
  var tLay = this.layout;

  this.srcs = graphicSources.dogSources;
  this.dog_state = 'normal';
  this.boundaries = { normal_sad: 2, happy_normal: 15 };

  this.poleBase = this.paper.image(graphicSources.otherPngs.base, tLay.poleCenter - tLay.poleBaseWidth / 2, tLay.poleBaseY,
                                        tLay.poleBaseWidth, tLay.poleBaseHeight );
  this.pole = this.paper.image(graphicSources.otherPngs.pole, tLay.poleCenter - tLay.poleWidth / 2, tLay.poleTopAtExit,
                                        tLay.poleWidth, tLay.poleMaxHeight );
  this.platform = this.paper.image(graphicSources.otherPngs.platform, tLay.poleCenter - tLay.platformWidth / 2,
                                        tLay.poleTopAtExit - tLay.platformHeight,
                                        tLay.platformWidth, tLay.platformHeight );
  this.dog = this.paper.image(this.srcs[this.dog_state].src, tLay.poleCenter - tLay.normalDogWidth / 2,
                                        tLay.poleTopAtExit - tLay.platformHeight + tLay.normalDogVOffset - tLay.normalDogHeight,
                                        tLay.normalDogWidth, tLay.normalDogHeight );
  this.set = this.paper.set()
               .push( this.pole, this.platform, this.dog);
  this.position = tLay.startPosition;
  this.downSnd = document.getElementById('down');
  this.upSnd = document.getElementById('up');
  this.topSnd = document.getElementById('happy');
  this.bottomSnd = document.getElementById('sad');

  this.reset();
}

/**
 * Put Madeline back at the starting position
 */
DogOnPlatform.prototype.reset = function() {
  this.position = this.layout.startPosition;
  this.dog.stop();
  this.dog.attr( this.srcs.normal );
  this.dog.attr({'transform': '' });
  this.incrementPosition( 0, 500);
}

/**
 * Put Madeline back at the starting position
 */
DogOnPlatform.prototype.setDogState = function( iState) {
  if( this.dog_state !== iState) {
    KCPCommon.switchSrc( this.dog, this.srcs[ iState]);
    this.dog_state = iState;
  }
}

/**
 * Animate Madeline, the platform, and the pole by the given number of steps.
 */
DogOnPlatform.prototype.incrementPosition = function( iSteps, iTime, iCompletionCallback) {
  var tLay = this.layout,
      tAnim = '<>',
      tFraction, tPoleTop, tHeight;
  this.position += iSteps;
  this.position = Math.max( 0, Math.min( this.layout.numPositions, this.position));  // Limit to top and bottom
  tFraction = this.position / tLay.numPositions,
  tPoleTop = tLay.poleTopAtExit +
             (1 - tFraction) * ( tLay.poleBaseY - tLay.poleTopAtExit),
  tHeight = tLay.poleBaseY - tPoleTop + tLay.poleBaseHeight / 2;
  this.pole.animate({ y: tPoleTop, height: tHeight }, iTime, tAnim);
  this.platform.animate({ y: tPoleTop - tLay.platformHeight + tLay.poleBaseHeight }, iTime, tAnim);
  this.dog.animate({ y: tPoleTop + tLay.poleBaseHeight - tLay.platformHeight + tLay.normalDogVOffset - tLay.normalDogHeight },
                  iTime, tAnim, iCompletionCallback);

  // Set dog image
  if( this.position <= this.boundaries.normal_sad)
    this.setDogState( 'sad');
  else if( this.position <= this.boundaries.happy_normal)
    this.setDogState( 'normal');
  else
    this.setDogState( 'happy');

  // Play sounds
  if( this.position <= 0) {
    this.bottomAnimation();
    if( this.model.sound === 'on')
      this.bottomSnd.play();
  }
  else if (this.position >= this.layout.numPositions) {
    this.topAnimation();
    if( this.model.sound === 'on')
      this.topSnd.play();
  }
  if(iSteps < 0 && this.model.sound === 'on')
    this.downSnd.play();
  else if( iSteps > 0 && this.model.sound === 'on')
    this.upSnd.play();
}

/**
 * Instantly finish the animation
 */
DogOnPlatform.prototype.abortIncrementPosition = function() {
  this.set.stop();
  this.dog.attr('opacity', 1);
  this.incrementPosition( 0, 0);
}

/**
 *
 * @return {String}
 */
DogOnPlatform.prototype.getState = function() {
  var tResult = 'middle';
  if( this.position <= 0)
    tResult = 'bottom';
  else if( this.position >= this.layout.numPositions)
    tResult = 'top';

  return tResult;
}

/**
 * Madeline slinks away to the right.
 */
DogOnPlatform.prototype.bottomAnimation = function() {
  var this_ = this,
      tNumSteps = 0;

  function step1() {
    this_.dog.attr( this_.srcs.step1);
    this_.dog.animate({ transform: '...t5,0'}, 200, '', step2);
  }

  function step2() {
    if( tNumSteps < 8) {
      this_.dog.attr( this_.srcs.step2);
      this_.dog.animate({ transform: '...t5,0'}, 200, '', step1);
      tNumSteps++;
    }
  }

  step1();
}

/**
 * Madeline turns around and moves away, getting smaller
 */
DogOnPlatform.prototype.topAnimation = function() {
  var this_ = this,
      tNumSteps = 0;

  function step() {
    if( tNumSteps < 8) {
      this_.dog.animate({ transform: '...t1,3s0.7'}, 200, '', step);
      tNumSteps++;
    }
    else
      this_.dog.attr('transform', 'S0');
  }

  KCPCommon.switchSrc( this.dog, this.srcs.exiting, step);
}