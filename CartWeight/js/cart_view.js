// ==========================================================================
// Project:   Cart
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global $, Cart, CartSettings, KCPCommon */

/**
 * @fileoverview Defines CartView - the view layer of the game Cart
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {CartModel}
 * @constructor
 */
function CartView( iModel)
{
  this.model = iModel;
}

/**
 * Create our parts and connect them approopriately.
 */
CartView.prototype.initialize = function()
{
  var tCS = CartSettings,
      tState = {},
      tGameArea = document.getElementById("gameArea" );
  // We listen for some of our model's events
  this.model.eventDispatcher.addEventListener("stateChange", this.handleStateChange, this);
  this.model.eventDispatcher.addEventListener("turnStateChange", this.handleTurnStateChange, this);
  this.model.eventDispatcher.addEventListener("scoreChange", this.updateAll, this);
  this.model.eventDispatcher.addEventListener("levelUnlocked", this.handleLevelUnlocked, this);
  this.model.eventDispatcher.addEventListener("invalidGuess", this.handleInvalidGuess, this);

  this.gamePaper = Raphael(tGameArea, tGameArea.clientWidth, tGameArea.clientHeight);
  this.holdingPlatform = this.gamePaper.path("M0 " + tCS.platformTop +
                                             " l" + tCS.platformWidth + " 0")
    .attr({ stroke: tCS.platformColor, 'stroke-width': 4, 'stroke-linecap': 'round' });
  this.scalePlatform = this.gamePaper.path("M" + tCS.scaleLeft + " " + tCS.platformTop +
                                           " l" + tCS.platformWidth + " 0")
    .attr({ stroke: tCS.platformColor, 'stroke-width': 4, 'stroke-linecap': 'round' });
  this.pillar = this.gamePaper.rect( tCS.scaleLeft + tCS.platformWidth/2 - tCS.pillarWidth / 2,
    tCS.platformTop + 2,
    tCS.pillarWidth, tCS.pillarEmptyHeight)
                  .attr({ fill: '0-white-'+tCS.platformColor, 'stroke-width': 0 });

  this.cart = new Cart( this.gamePaper, this.model.eventDispatcher);

  this.gameOver = this.gamePaper.text( tGameArea.clientWidth / 2, tGameArea.clientHeight / 2, "Game Over")
    .attr({ fill: 'yellow', 'font-size': 48, 'font-weight': 'bold' })
    .hide();

  this.updateAll();

  // We fake an event to get the welcome state initiated
  tState.newState = "welcome";
  this.handleStateChange( tState);
};

/**
 * Handles changes in game state; e.g. a change from 'playing' to 'gameEnded'
 *
 * @param iEvent
 */
CartView.prototype.handleStateChange = function( iEvent)
{
  var tCS = CartSettings;
  // A few things to take care of based on our prior state
  switch( iEvent.priorState) {
    case "levelsMode":
      this.model.levelManager.leaveLevelsMode();
      break;
    case "welcome":
      KCPCommon.setElementVisibility( "storybox", false);
      KCPCommon.setElementVisibility( "welcome_panel", false);
      KCPCommon.setElementVisibility( "video_panel", false);
      document.getElementById('welcome_video').pause();
      break;
    default:
  }
  
  this.updateElementVisibility( iEvent.newState);

  // Mostly we get the correct things showing
  switch( iEvent.newState) {
    case "welcome":
      this.model.levelManager.leaveLevelsMode();
      this.cart.updatePosition('offLeft');
      break;
    case "playing":
      document.getElementById("game_button").innerHTML = "End Game";
      document.getElementById('guess_button').innerHTML = tCS.checkWeight;
      document.getElementById("guess_input_box").readOnly = false;
      this.updateAll();

      this.gameOver.hide();
      this.prepareNextCart();
      if( !('ontouchstart' in window))
        $('#guess_input_box').select();
      break;
    case "gameEnded":
      document.getElementById("game_button").innerHTML = "New Game";
      document.getElementById('guess_button').innerHTML = tCS.newCart;
      this.gameOver.toFront().show();
      break;
    case "levelsMode":
      this.model.levelManager.configureLevelsPanel( this.model.level);
      break;
    default:
  }
};

/**
  Update the visibility of the primary HTML elements on the page.
  We centralize these calls in one place to reduce the reliance on state transitions.
  @param    {String}    iState -- The game state we're updating for
 */ 
CartView.prototype.updateElementVisibility = function( iState) {
  KCPCommon.setElementVisibility('gameArea', iState !== 'welcome');
  KCPCommon.setElementVisibility('video_panel', iState === 'welcome');
  KCPCommon.setElementVisibility('welcome_panel', iState === 'welcome');
  KCPCommon.setElementVisibility('game_panel', iState !== 'welcome');
  KCPCommon.setElementVisibility('turn_panel', iState !== 'welcome');
  KCPCommon.setElementVisibility('guess_panel', iState !== 'welcome');
  KCPCommon.setElementVisibility('gameCover', (iState === 'gameEnded') || (iState === 'levelsMode'));
  KCPCommon.setElementVisibility('outercontrols', iState !== 'welcome');
  KCPCommon.setElementVisibility('levels_button', (iState === 'gameEnded') || (iState === 'levelsMode'));
  KCPCommon.setElementVisibility('levels_panel', false);
};

/**
 * Handles changes in turn state; e.g. a change from 'guessing' to 'weighing'
 *
 * @param iEvent
 */
CartView.prototype.handleTurnStateChange = function( iEvent)
{
  var this_ = this;

  function enableNext() {
    this_.model.changeIsBlocked = false;
  }

  function updateTurnPanel() {
    this_.model.updateScore();
    this_.updateAll();
    this_.model.endTurn();
  }

  var tCS = CartSettings,
      tGuessElement = document.getElementById("guess_input_box" ),
      tGuessButton = document.getElementById('guess_button' );

  function weighingCallback() {
    this_.cart.updatePosition('descending', enableNext);
    this_.pillar.animate({ height: tCS.pillarFullHeight,
                            y: tCS.platformTop + 2 + tCS.pillarEmptyHeight - tCS.pillarFullHeight },
                            tCS.animationTime, 'bounce');
    this_.scalePlatform.animate({ transform: 't0 ' + (tCS.pillarEmptyHeight - tCS.pillarFullHeight) },
                                tCS.animationTime, 'bounce',
                                updateTurnPanel);
    tGuessButton.innerHTML = tCS.newCart;
  }

  function guessingCallback() {
    // The cart has gone off to the right. Raise the scale and bring in a new cart
    this_.cart.updatePosition('offLeft');
    this_.raisePillar();
    tGuessButton.innerHTML = tCS.checkWeight;
    this_.prepareNextCart();
    $('#guess_input_box').focus().select();
  }
  // body of handleTurnStateChange
  if( this.model.changeIsBlocked)
    return;
  
  this.model.changeIsBlocked = true;
  switch( iEvent.newState) {
    case 'guessing':
      this.cart.updatePosition('offRight', guessingCallback);
      tGuessElement.readOnly = false;
      break;
    case 'weighing':
      tGuessElement.blur();
      tGuessElement.readOnly = true;
      this.cart.updatePosition('weighing', weighingCallback);
      break;
    default:
  }
};

/**
 * Modify the html based on our current state
 */
CartView.prototype.updateAll = function()
{
  document.getElementById("gameNum").innerHTML = this.model.gameNumber;
  document.getElementById("levelName").innerHTML = this.model.level.levelName;
  document.getElementById("score").innerHTML = this.model.score;
  document.getElementById("actual").innerHTML = Math.round( 10 * this.model.weight) / 10;
  document.getElementById("onescore").innerHTML = this.model.oneScore;
};

/**
 * The name says it all
 */
CartView.prototype.prepareNextCart = function()
{
  var this_ = this;
  
  function enableNext() {
    this_.model.changeIsBlocked = false;
  }

  this.cart.updatePosition('offLeft');
  this.raisePillar();
  this.model.setupCart();
  KCPCommon.setElementVisibility( "gameCover", false);
  this.cart.updateBricks( this.model.bricks, this.model.smallBricks);
  this.cart.updatePosition('guessing', enableNext);
  document.getElementById("actual").innerHTML = '&mdash;';
  document.getElementById("onescore").innerHTML = '&mdash;';
};

/**
 * The name says it all
 */
CartView.prototype.raisePillar = function()
{
  var tCS = CartSettings;
  this.pillar.animate({ height: tCS.pillarEmptyHeight,
                          y: tCS.platformTop + 2 },
                          tCS.animationTime, tCS.easing);
  this.scalePlatform.animate({ transform: '' }, tCS.animationTime, tCS.easing);
};

/**
 * We get here via an 'invalidGuess' event
 */
CartView.prototype.handleInvalidGuess = function()
{
  $('#guess_input_box' ).select();
};

/**
 * Our model has detected that a new level has been unlocked. Notify the user.
 * @param iEvent
 */
CartView.prototype.handleLevelUnlocked = function( iEvent)
{
  var this_ = this;

  function closeAlert() {
    KCPCommon.setElementVisibility("level_alert", false);
    KCPCommon.setElementVisibility("cover", false);
    this_.model.changeIsBlocked = false;
  }

  document.getElementById("unlock").innerHTML = iEvent.levelName;
  KCPCommon.setElementVisibility("level_alert", true);
  KCPCommon.setElementVisibility("cover", true);
  this.model.changeIsBlocked = true;
  document.getElementById("OK_button").onclick = closeAlert;
};

