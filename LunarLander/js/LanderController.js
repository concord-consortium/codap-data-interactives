// ==========================================================================
// Project:   LanderController
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 *     One per LanderModel. Receives thrust events and relays them to landerModel.
 *
 * @fileoverview Defines LanderController
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

function LanderController( iLander) {
  var this_ = this;

  function handleKeydown( iEvent) {
    if( (this_.lander.thrustState !== 'none') || (this_.lander.landerState === 'inactive')
      || (this_.lander.landerState==='pending'))
      return;
    var tChar = String.fromCharCode( iEvent.which ).toLowerCase(),
        tTopChar = this_.lander.keyTop,
        tBotChar = this_.lander.keyBottom;

    if( (this_.lander.landerState === 'active') && !this_.lastKeyWasDown &&
         ((tChar === tTopChar) || (tChar === tBotChar)))
      this_.lander.requestDescent();

    if( this_.lander.landerState === 'descending') {
      switch( tChar) {
        case tTopChar:
          this_.lander.beginThrust('top');
          break;
        case tBotChar:
          this_.lander.beginThrust('bottom');
          break;
      }
    }
    this_.lastKeyWasDown = true;
  }

  function handleKeyup( iEvent) {
    var tChar = String.fromCharCode( iEvent.which).toLowerCase();
    if( this_.lander.landerState === 'descending') {
      switch( tChar) {
        case this_.lander.keyTop:
          this_.lander.endThrust( 'top');
          break;
        case this_.lander.keyBottom:
          this_.lander.endThrust( 'bottom');
          break;
      }
    }
    this_.lastKeyWasDown = false;
  }

  this.lander = iLander;
  this.lastKeyWasDown = false;
  $('body' ).keydown( handleKeydown)
    .keyup( handleKeyup);
}

