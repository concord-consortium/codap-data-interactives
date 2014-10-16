// ==========================================================================
// Project:   LunarLanderView
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 *     View of the game as a whole. Controls overall layout. Responds to events
 *     from model.
 *
 * @fileoverview Defines LunarLanderView
 * @author bfinzer@kcptech.com William Finzer
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {LunarLanderModel}
 * @constructor
 */
function LunarLanderView( iModel) {
  this.model = iModel;
  this.model.eventDispatcher.addEventListener('stateChange', this.handleStateChange, this);
  this.priorState = null;

  this.landerViews = [];
  this.gaugeViews = [];
  this.setupViews = [];
  this.controllers = [];
  this.model.landers.forEach( function( iLander) {
    this.landerViews.push( new LanderView( iLander, $( '#' + iLander.side + '_lander' ).first()));
    this.gaugeViews.push( new GaugeView( iLander, $( '#' + iLander.side + '_gauge').first()));
    this.setupViews.push( new SetupView( iLander, $( '#' + iLander.side + '_setup').first()));
    this.controllers.push( new LanderController( iLander));
  }.bind(this))
}

LunarLanderView.prototype.handleStateChange = function( iEvent) {
  var tStartButton = $('#start_descent');
  switch( iEvent.oldState) {
    case 'welcome':
      $('#video_panel' ).toggle(false);
      $('#welcome_panel' ).toggle(false);
      break;
  }
  switch( iEvent.newState) {
    case 'descending':
      tStartButton.html('Abort!');
      break;
    case 'waiting':
      tStartButton.html('Start Descent');
      break;
  }
};

/**
 * We have to remember the prior state to restore when exiting.
 */
LunarLanderView.prototype.toggleSetup = function() {
  var tState = this.model.gameState,
      tNewState;
  if( tState !== 'setup') {
    this.priorState = tState;
    tNewState = 'setup';
    this.model.prepareForSetup();
  }
  else {
    tNewState = this.priorState;
    this.priorState = null;
    this.model.changeState( tNewState);
  }

  this.model.landers.forEach( function( iLander, iIndex) {
    if( iLander.landerState === 'active') {
      if( tNewState === 'setup')
        this.setupViews[ iIndex].setup();
      else
        this.setupViews[ iIndex].exitSetup();
    }
  }.bind( this));
};

/**
 * The 2nd lander has just been made either active or inactive. Make its setupview consistent.
 */
LunarLanderView.prototype.makeSetupConsistent = function() {
  if( this.model.landers[1].landerState === 'active')
    this.setupViews[ 1].setup();
  else
    this.setupViews[ 1].exitSetup();
};