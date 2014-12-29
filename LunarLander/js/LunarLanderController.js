// ==========================================================================
// Project:   LunarLanderController
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 *     Handles button presses: startDescent, abort, twoLanders, oneLander, setup
 *
 * @fileoverview Defines LunarLanderController
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

function LunarLanderController( iModel, iView) {
  var this_ = this;

  function clickStartDescent() {
    switch( this_.model.gameState) {
      case 'setup':
        clickSetup();
        // deliberate fallthrough
      case 'waiting':
        this_.handleRequestDescent( null, true);
        break;
      case 'descending': //Start Descent button becomes Abort when gameState is descending
        this_.model.abort();
        flightEnded();
    }
  }

  function clickSetup() {
    var tButton = $('#setup' );
    this_.view.toggleSetup();
    if( this_.model.gameState === 'setup')
      tButton.html( 'Exit Setup');
    else
      tButton.html( 'Setup');
  }

  function clickTwoLanders() {
    if( (this_.model.gameState === 'waiting') || (this_.model.gameState === 'setup')) {
      this_.model.toggleLanders();
      if( this_.model.gameState === 'setup')
        this_.view.makeSetupConsistent();
    }
  }

  function flightEnded() {
    var tBothEnded = true;
    this_.model.landers.forEach( function(iLander) {
      if (( iLander.landerState === 'descending') || (iLander.landerState === 'pending'))
        tBothEnded = false;
    });

    if( tBothEnded) {
      $('#setup' ).toggle( true);
      $('#two_landers' ).toggle( true);
      this_.lastTimeFlightEnded = new Date().getTime();
    }
  }

  /**
   * Handle <esc> key by aborting any descent in progress.
   * @param iEvent
   */
  function handleKeydown( iEvent) {
    var escKey=27;
    if( (iEvent.which === escKey) && (this_.model.gameState === 'descending')) {
      this_.model.abort();
      flightEnded();
    }
  }

  // Start of LunarLanderController
  this.model = iModel;
  this.view = iView;
  this.lastTimeFlightEnded = null;  // Used to prevent accidental restart of descent
  this.model.landers.forEach( function( iLander) {
    iLander.eventDispatcher.addEventListener('flightEnded', flightEnded)
  })

  this.model.landers[1].eventDispatcher.addEventListener('stateChange', this.handleStateChange);
  this.model.landers.forEach( function( iLander) {
    iLander.eventDispatcher.addEventListener('requestDescent', this.handleRequestDescent, this);
  }.bind( this));

  $('#start_descent' ).click( clickStartDescent);
  $('#setup' ).click( clickSetup);
  $('#two_landers' ).click( clickTwoLanders);
  $('body' ).keydown( handleKeydown);
}

/**
 * We get this notification only from the second lander. Take the opportunity to set the button label correctly.
 * @param iEvent
 */
LunarLanderController.prototype.handleStateChange = function( iEvent) {
  var t2Landers = $('#two_landers');
  if( iEvent.newState === 'active')
    t2Landers.html('One Lander');
  else
    t2Landers.html('Two Landers');
};

/**
 * We get this notification when the user attempts to fire a rocket, but we're waiting rather than descending.
 * We oblige by starting the descent.
 * We are also called directly when the user clicks the start descent button.
 */
LunarLanderController.prototype.handleRequestDescent = function( iEvent, iImmediate) {
  var tNow = new Date().getTime();
  if( iImmediate ||
      ((this.model.gameState === 'waiting') &&
        ((this.lastTimeFlightEnded === null) || (tNow - this.lastTimeFlightEnded > 2000)))) {
    this.model.startDescent();
    $('#setup' ).toggle( false);
    $('#two_landers' ).toggle( false);}

};