// ==========================================================================
// Project:   Shuffleboard
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines ShuffleView - the view layer of the game Cart
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {ShuffleModel}
 * @constructor
 */
function ShuffleView( iModel)
{
	this.model = iModel;
}

/**
 * Create our parts and connect them appropriately.
 */
ShuffleView.prototype.initialize = function()
{
  var tSS = ShuffleSettings,
      tState = {},
      tGameArea = document.getElementById("gameArea" );
  // We listen for some of our model's events
  this.model.eventDispatcher.addEventListener("stateChange", this.handleStateChange, this);
  this.model.eventDispatcher.addEventListener("pushChange", this.updatePushButton, this);
  this.model.eventDispatcher.addEventListener("levelUnlocked", this.handleLevelUnlocked, this);
  this.model.eventDispatcher.addEventListener("firstTimeLevelChanged", this.handleLevelChanged, this);
  this.model.eventDispatcher.addEventListener("strategyError", this.handleStrategyError, this);

  this.layout = { boardLeft: 10, boardTop: 0, tileWidth: 48, tileHeight: 167, tileGap: 2, padInset: 5 };

  this.gamePaper = new Raphael(tGameArea, tGameArea.clientWidth, tGameArea.clientHeight);
  this.gameOver = this.gamePaper.text( tGameArea.clientWidth / 2, tGameArea.clientHeight / 2, "Game Over")
    .attr({ fill: 'yellow', 'font-size': 48, 'font-weight': 'bold' })
    .hide();

  this.grid = new GridView( this.gamePaper, this.layout);
  this.grid.initialize();

  this.table = new TableView( this.model, this.gamePaper, this.layout);
  this.table.initialize();

  this.slider = new SliderView( this.model);
  this.slider.initialize();

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
ShuffleView.prototype.handleStateChange = function( iEvent)
{
  var tSS = ShuffleSettings;
  // A few things to take care of based on our prior state
  switch( iEvent.priorState) {
    case "levelsMode":
      this.model.levelManager.leaveLevelsMode();
      break;
    case "welcome":
      KCPCommon.setElementVisibility( "storybox", false);
      KCPCommon.setElementVisibility( "welcome_panel", false);
      KCPCommon.setElementVisibility( "video_panel", false);
      //document.getElementById('welcome_video').pause();
      break;
    default:
  }

  // Mostly we get the correct things showing
  switch( iEvent.newState) {
    case "welcome":
      KCPCommon.setElementVisibility( "welcome_panel", true);
      KCPCommon.setElementVisibility( "levels_panel", false);
      KCPCommon.setElementVisibility( "level_alert", false);
      KCPCommon.setElementVisibility( "gameArea", false);
      KCPCommon.setElementVisibility( "sliderArea", false);
      KCPCommon.setElementVisibility( "turn_panel", false);
      KCPCommon.setElementVisibility( "guess_panel", false);
      KCPCommon.setElementVisibility( "game_panel", false);
      this.model.levelManager.leaveLevelsMode();
      break;
    case "playing":
      this.enableButtons( true);
      KCPCommon.setElementVisibility( "outercontrols", true);
      KCPCommon.setElementVisibility( "turn_panel", true);
      KCPCommon.setElementVisibility( "guess_panel", true);
      KCPCommon.setElementVisibility( "levels_button", false);
      KCPCommon.setElementVisibility( "gameArea", true);
      KCPCommon.setElementVisibility( "sliderArea", true);
      KCPCommon.setElementVisibility( "game_panel", true);
      KCPCommon.setElementVisibility( "levels_panel", false);
      KCPCommon.setElementVisibility( "level_alert", false);
      document.getElementById("game_button").innerHTML = "End Game";
      this.updateAll();

      this.gameOver.hide();
      this.prepareTable();
      break;
    case "gameEnded":
      KCPCommon.setElementVisibility( "levels_button", true);
      document.getElementById("game_button").innerHTML = "New Game";
      this.gameOver.toFront().show();
      this.enableButtons( false);
      break;
    case "levelsMode":
      KCPCommon.setElementVisibility( "level_alert", false);
      this.model.levelManager.configureLevelsPanel( this.model.level);
    default:
  }
}

/**
 * There are two buttons, push and autoplay that need to be disabled or enabled together
 */
ShuffleView.prototype.enableButtons = function( iEnable)
{
  if( iEnable) {
    $('#auto_button' ).removeAttr('disabled');
    $('#push_button' ).removeAttr('disabled');
  }
  else {
    $('#auto_button' ).attr('disabled', 'disabled');
    $('#push_button' ).attr('disabled', 'disabled');
  }
}

/**
 * Modify the html based on our current state
 */
ShuffleView.prototype.updateAll = function()
{
  document.getElementById("gameNum").innerHTML = this.model.gameNumber;
  document.getElementById("levelName").innerHTML = this.model.level.levelName;
  document.getElementById("score").innerHTML = this.model.score;
}

/**
 * Modify the html based on our current state
 */
ShuffleView.prototype.updatePushButton = function( iEvent)
{
  document.getElementById("push_button").innerHTML = "Push by " + this.model.push;
}

/**
 * The name says it all
 */
ShuffleView.prototype.prepareTable = function()
{
  this.table.prepareForNewGame();
};

ShuffleView.prototype.handleStrategyError = function( iEvent) {
  this.alert('Formula Error', iEvent.error);
};

/**
 * Our model has detected that a new level has been unlocked. Notify the user.
 * @param iEvent
 */
ShuffleView.prototype.handleLevelUnlocked = function( iEvent)
{
  this.alert('Level Alert', 'Congratulations! You have unlocked level ' +
                                                      iEvent.levelName + '.');
}

/**
 * Our model has detected that a new level has been unlocked. Notify the user.
 * @param iEvent
 */
ShuffleView.prototype.handleLevelChanged = function()
{
  this.alert('You\'re changing levels', 'You may want to press the \'Clear Data\' button.');
}

/**
 * The name says it all
 */
ShuffleView.prototype.alert = function( iTitle, iText)
{
  var this_ = this;

  function closeAlert() {
    KCPCommon.setElementVisibility("level_alert", false);
    KCPCommon.setElementVisibility("cover", false);
  }

  document.getElementById("alert_title").innerHTML = iTitle;
  document.getElementById("alert_text").innerHTML = iText;
  KCPCommon.setElementVisibility("level_alert", true);
  KCPCommon.setElementVisibility("cover", true);
  document.getElementById("OK_button").onclick = closeAlert;
}

