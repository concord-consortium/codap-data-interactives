// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines MarkovView - the view layer of the game Cart
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {MarkovModel}
 * @constructor
 */
function MarkovView( iModel)
{
	this.model = iModel;
  this.colorMap = MarkovSettings.kColorMap;
}

/**
 * Create our parts and connect them appropriately.
 */
MarkovView.prototype.initialize = function()
{
  var tMS = MarkovSettings,
      tState = {},
      tGameArea = document.getElementById("gameArea" ),
      kFontSize = 12,
      this_ = this;

  function toggleSound() {
    var tSpeaker = $('#speaker' );
    if( this_.model.sound === 'on') {
      this_.model.sound = 'off';
      tSpeaker.removeClass('speaker_on');
      tSpeaker.addClass('speaker_off');
      tSpeaker.attr('title', 'Sound is off. Click to turn on.')
    }
    else {
      this_.model.sound = 'on';
      tSpeaker.removeClass('speaker_off');
      tSpeaker.addClass('speaker_on');
      tSpeaker.attr('title', 'Sound is on. Click to turn off.')
    }
  }

  // We listen for some of our model's events
  this.model.eventDispatcher.addEventListener("stateChange", this.handleStateChange, this);
  this.model.eventDispatcher.addEventListener("turnStateChange", this.handleTurnStateChange, this);
  this.model.eventDispatcher.addEventListener("scoreChange", this.updateAll, this);
  this.model.eventDispatcher.addEventListener("levelUnlocked", this.handleLevelUnlocked, this);
  this.model.eventDispatcher.addEventListener("timeForAHint", this.handleTimeForAHint, this);
  this.model.eventDispatcher.addEventListener("firstTimeLevelChanged", this.handleLevelChanged, this);
  this.model.eventDispatcher.addEventListener("autoplayChange", this.handleAutoplayChange, this);
  this.model.eventDispatcher.addEventListener("finishedEditingStrategy", this.handlefinishedEditing, this);

  $('#speaker' ).click( toggleSound);
  this.model.sound = 'off';
  toggleSound();  // To initialize to on and set tooltip

  this.layout = { playLeft: 35, playTop: 68, playWidth: 200, playHeight: 130, throwWidth: 51,
                  marHandX: 268, marHandY: 102, yourStartX: 5, R: 45, P: 111, S: 177,
                  queueX: 268, queueY: 230 };

  this.gamePaper = new Raphael(tGameArea, tGameArea.clientWidth, tGameArea.clientHeight);
  this.gameOver = this.gamePaper.text( tGameArea.clientWidth / 2, tGameArea.clientHeight / 2, "Game Over")
    .attr({ fill: 'yellow', 'font-size': 48, 'font-weight': 'bold' })
    .hide();

  this.marSrcs = graphicSources.markovSources;
  this.markov = this.gamePaper.image( this.marSrcs.normal.src, this.layout.marHandX, 0, 92, 247);

  this.dog = new DogOnPlatform( this.model);
  this.queue = new Queue( this.gamePaper, this.model);
  this.slider = new Slider( 'slider', this.model);
  this.arrow = this.gamePaper.image(graphicSources.otherPngs.arrow, -10, 0, 54, 41 ).hide();

  this.youGhostTile = null;
  this.marGhostTile = null;

  this.message = this.gamePaper.text( this.layout.playLeft + this.layout.playWidth / 2,
                                      this.layout.playTop + this.layout.playHeight - kFontSize,
                                      MarkovSettings.kInitialMessage)
    .attr({'font-size': kFontSize });
  this.messageTimeout = null;

  this.outcomeStrings = [ 'Markov wins.', 'You win.', 'Markov wins ties.'];
  this.outcomes = { // Your move followed by Markov's move
    RR: 2, RP: 0, RS: 1,
    PR: 1, PP: 2, PS: 0,
    SR: 0, SP: 1, SS: 2
  };
  this.beatStrings = ['', 'R beats S.', 'S beats P.', 'P beats R.'];
  this.beats = { // Your move followed by Markov's move
      RR: 0, RP: 3, RS: 1,
      PR: 3, PP: 0, PS: 2,
      SR: 1, SP: 2, SS: 0
    };

  this.moveState = 'finished';  // Needed to know what to abort

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
MarkovView.prototype.handleStateChange = function( iEvent)
{
  var tSS = MarkovSettings;
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
      KCPCommon.setElementVisibility( "poleArea", false);
      KCPCommon.setElementVisibility( "turn_panel", false);
      KCPCommon.setElementVisibility( "game_panel", false);
      KCPCommon.setElementVisibility( "moveButtonArea", false);
      KCPCommon.setElementVisibility( "exit", false);
      this.model.levelManager.leaveLevelsMode();
      break;
    case "playing":
      KCPCommon.setElementVisibility( "gameCover", false);
      KCPCommon.setElementVisibility( "outercontrols", true);
      KCPCommon.setElementVisibility( "turn_panel", true);
      KCPCommon.setElementVisibility( "levels_button", false);
      KCPCommon.setElementVisibility( "gameArea", true);
      KCPCommon.setElementVisibility( "throw_area", true);
      KCPCommon.setElementVisibility( "poleArea", true);
      KCPCommon.setElementVisibility( "game_panel", true);
      KCPCommon.setElementVisibility( "moveButtonArea", true);
      KCPCommon.setElementVisibility( "exit", true);
      KCPCommon.setElementVisibility( "levels_panel", false);
      KCPCommon.setElementVisibility( "level_alert", false);
      KCPCommon.setElementVisibility( 'button_cover', false);
      if( this.marGhostTile)
        this.marGhostTile.hide();
      if( this.youGhostTile)
        this.youGhostTile.hide();
      document.getElementById("game_button").innerHTML = "End Game";
      document.getElementById("auto_button").innerHTML = "Autoplay";
      this.markov.attr('src', this.marSrcs.normal.src);
      this.updateAll();

      this.gameOver.hide();
      this.queue.reset();
      this.dog.reset();
      this.message.attr('text', MarkovSettings.kInitialMessage);
      this.prepareForNextMove();
      break;
    case "gameEnded":
      KCPCommon.setElementVisibility( "levels_button", true);
      document.getElementById("game_button").innerHTML = "New Game";
      this.gameOver.toFront().show();
      KCPCommon.setElementVisibility( "gameCover", true);
      this.setAutoplayVisibility( false);
      this.arrow.hide();
      break;
    case "levelsMode":
      KCPCommon.setElementVisibility( "level_alert", false);
      this.model.levelManager.configureLevelsPanel( this.model.level);
    default:
  }
}

/**
 * Modify the html based on our current state
 */
MarkovView.prototype.handleTurnStateChange = function( iEvent)
{
  switch( iEvent.newTurnState) {
    case 'moving':
      this.makeMove( this.model.yourMove, this.model.marMove);
      break;
    case 'abort':
      this.abortMove();
      break;
    case 'waiting':
      if(this.model.gameState ==='playing')
        this.prepareForNextMove();
      break;
    default:
  }
}

/**
 * Modify the html based on our current state
 */
MarkovView.prototype.handleAutoplayChange = function( iEvent)
{
  var tLabel = iEvent.state === 'on' ? 'Stop!' : 'Autoplay';
  document.getElementById('auto_button' ).innerHTML = tLabel;
  KCPCommon.setElementVisibility( 'button_cover', iEvent.state === 'on');
}

/**
 * Controls visibility of button and slider
 */
MarkovView.prototype.setAutoplayVisibility = function( iShow)
{
  KCPCommon.setElementVisibility('auto_button', iShow);
  KCPCommon.setElementVisibility('slider', iShow);
  if( !iShow)
    KCPCommon.setElementVisibility('button_cover', false);
}

/**
 * Modify the html based on our current state
 */
MarkovView.prototype.updateAll = function()
{
  document.getElementById("gameNum").innerHTML = this.model.gameNumber;
  document.getElementById("levelName").innerHTML = this.model.level.levelName;
}

/**
 * Determine whether autoplay should show and ...
 */
MarkovView.prototype.prepareForNextMove = function()
{
  var tAutoMove = this.model.getAutoMove(),
      tHasMove = tAutoMove !== '',
      tPlacement = { R: 23, P: 90, S: 153};
  this.setAutoplayVisibility( tHasMove);
  if( tHasMove)
    this.arrow.attr('y', tPlacement[tAutoMove] ).show();
  else
    this.arrow.hide();
}

/**
 * If we're playing, we may need to show/hide autoplay
 */
MarkovView.prototype.handlefinishedEditing = function()
{
  if( this.model.gameState === 'playing')
    this.prepareForNextMove();
}

/**
 * Moves are 'R', 'P', or 'S'
 * @param iYourMove
 * @param iMarMove
 */
MarkovView.prototype.makeMove = function( iYourMove, iMarMove)
{
  function moveToPlayArea() {
    if( !(this_.marTile && this_.youTile))
      return;
    tMarCenterX = tLay.playLeft + tLay.playWidth - tLay.throwWidth / 2 - 30;
    tCenterY = tLay.playTop + 50 + tLay.throwWidth / 2;
    tYourCenterX = tLay.playLeft + 30 + tLay.throwWidth / 2;
    this_.marTile.setXY( tMarCenterX, tCenterY, tAnimationTime / 4);
    this_.youTile.setXY( tYourCenterX, tCenterY, tAnimationTime / 4, showMessage);
    this_.moveState = 'toPlayArea';
  }

  function showMessage() {
    var tCombo = iYourMove + iMarMove,
        tOutcome = this_.beats[ tCombo],
        tMessage = (iYourMove == iMarMove) ? '' : this_.beatStrings[ tOutcome] + ' ';
        tMessage += this_.outcomeStrings[ this_.outcomes[ tCombo]];
    this_.message.attr('text', tMessage);
    this_.dog.incrementPosition( this_.model.up_down, tAnimationTime);
    this_.messageTimeout = setTimeout( finishUp, tAnimationTime);
    this_.moveState = 'showMessage';
    KCPCommon.switchSrc( this_.markov, tStateMap[ this_.dog.getState()]);
  }

  function finishUp() {
    if( !(this_.marTile && this_.youTile))
      return;
    this_.marGhostTile.setLetter( iMarMove)
      .show();
    this_.youGhostTile.setLetter( iYourMove)
      .show();
    this_.youTile.vanish(tAnimationTime);
    this_.marTile.makeTiny( tAnimationTime, moveToQueue);
    this_.moveState = 'finishUp';
  }

  function moveToQueue() {
    if( !(this_.marTile && this_.youTile))
      return;
      this_.queue.pushTile( this_.marTile, tellModelEndTurn);
    this_.marTile = null;
    this_.moveState = 'toQueue';
  }

  function tellModelEndTurn() {
    this_.moveState = 'ended';
    this_.model.endTurn( this_.dog.getState());
  }

  // start of makeMove
  var this_ = this,
      tAnimationTime = this.model.autoplay ? this.model.animTime : MarkovSettings.kAnimTime,
      tLay = this.layout,
      tMarCenterX = tLay.playLeft + tLay.playWidth - tLay.throwWidth / 2 - 30,
      tCenterY = tLay.playTop + 50 + tLay.throwWidth / 2,
      tYourCenterX = tLay.playLeft + 30 + tLay.throwWidth / 2,
      tYourCenterY,
      tStateMap = { middle: this.marSrcs.normal, top: this.marSrcs.mad, bottom: this.marSrcs.happy };
  this.message.attr('text', '');
  if( !this.marGhostTile) {
    this.marGhostTile = new Tile( this.gamePaper, this.colorMap)
      .setXY( tMarCenterX, tCenterY, 0)
      .fullScale( 0)
      .ghostMode();
  }
  if( !this.youGhostTile) {
    this.youGhostTile = new Tile( this.gamePaper, this.colorMap)
      .setXY( tYourCenterX, tCenterY, 0)
      .fullScale( 0)
      .ghostMode();
  }
  this.youGhostTile.hide();
  this.marGhostTile.hide();

  tMarCenterX = tLay.marHandX;
  tCenterY = tLay.marHandY;
  tYourCenterX = tLay.yourStartX;
  tYourCenterY = tLay[ iYourMove];
  this.marTile = new Tile( this.gamePaper, this.colorMap)
    .setLetter(iMarMove)
    .setXY( tMarCenterX, tCenterY, 0)
    .fullScale( tAnimationTime / 8);
  this.youTile = new Tile( this.gamePaper, this.colorMap)
    .setLetter( iYourMove)
    .setXY( tYourCenterX, tYourCenterY, 0)
    .fullScale( tAnimationTime / 8, moveToPlayArea);
  this.moveState = 'starting';
}

/**
 *  User has made a next move before animation of previous move is complete.
 *  Stop the animation and get things in the right state.
 */
MarkovView.prototype.abortMove = function() {
  var tStateMap = { middle: this.marSrcs.normal, top: this.marSrcs.mad, bottom: this.marSrcs.happy };
  switch( this.moveState) {
    case 'starting':
      //this.marTile.instantFullScale();
      // deliberate fallthrough
    case 'toPlayArea':
      this.dog.incrementPosition( this.model.up_down, 0);
      // deliberate fallthrough
    case 'showMessage':
      window.clearTimeout( this.messageTimeout);
      this.dog.abortIncrementPosition();
      // deliberate fallthrough
    case 'finishUp':
      this.youTile.finishVanish();
      this.marTile.instantTiny();
      this.queue.instantAddTile( this.marTile);
      this.marTile = null;
      break;
    case 'toQueue':
      this.queue.abortPush();
      break;
    case 'ended':
      // Shouldn't get here. Nothing to do.
      break;
    default:
  }
  this.moveState = 'ended';
  KCPCommon.switchSrc( this.markov, tStateMap[ this.dog.getState()]);
  this.model.endTurn( this.dog.getState());
}

/**
 * Our model has detected that a new level has been unlocked. Notify the user.
 * @param iEvent
 */
MarkovView.prototype.handleLevelUnlocked = function( iEvent)
{
  this.alert('Level Alert', 'Congratulations! You have unlocked level ' +
                                                      iEvent.levelName + '.');
}

/**
 * Our model has let us know that it's time to show the next hint, if any
 * @param iEvent
 */
MarkovView.prototype.handleTimeForAHint = function( iEvent)
{
  var tLevel = this.model.level,
      tLevelName = tLevel.levelName,
      tHintNum = tLevel.hintNum,
      tHintArray = ukdeHints[tLevelName];
  if( tHintArray && tHintNum < tHintArray.length) {
    this.alert('This may help ...', tHintArray[ tHintNum]);
  }
}

/**
 * Our model has detected that a new level has been unlocked. Notify the user.
 * @param iEvent
 */
MarkovView.prototype.handleLevelChanged = function()
{
  this.alert('You\'re changing levels', 'You may want to press the \'Clear Data\' button.');
}

/**
 * Show an alert dialog with the given title and text.
 */
MarkovView.prototype.alert = function( iTitle, iText)
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

