// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================

/**
 * @fileoverview Defines ProximityView - the view layer of the game Proximity
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/**
 *
 * @param iModel {ProximityModel}
 * @constructor
 */
function ProximityView( iModel)
{
	this.model = iModel;
}

/**
 * Create our parts and connect them approopriately.
 */
ProximityView.prototype.initialize = function()
{
  var tState = {},
      tGameArea = document.getElementById("gameArea" ),
      tRoughRect = ProximitySettings.roughRect;
  // We listen for some of our model's events
  this.model.eventDispatcher.addEventListener("stateChange", this.handleStateChange, this);
  this.model.eventDispatcher.addEventListener("goalChange", this.updateAll, this);
  this.model.eventDispatcher.addEventListener("scoreChange", this.updateAll, this);
  this.model.eventDispatcher.addEventListener("levelUnlocked", this.handleLevelUnlocked, this);
  this.model.eventDispatcher.addEventListener("abort", this.handleAbort, this);

  this.gamePaper = new Raphael(tGameArea, tGameArea.clientWidth, tGameArea.clientHeight);
  this.rough = this.gamePaper.image('img/rough.jpg', tRoughRect.x, tRoughRect.y, tRoughRect.width, tRoughRect.height )
    .attr({ "opacity": 0.7, 'stroke_width': '0px' });
  this.roughBack = this.gamePaper.rect(tRoughRect.x, tRoughRect.y, tRoughRect.width, tRoughRect.height )
    .attr({ "fill": 'yellow', 'stroke_width': '0px'});
  this.ball = new Ball( this.gamePaper, this.dragBallMove, this.dragBallStart, this.dragBallEnd, this, tRoughRect);
  this.goal = new Goal( this.gamePaper, this.model.eventDispatcher);
  this.putter = new Putter( this.gamePaper, this.ball, this.goal);
  this.goal.toBack(); // Creating the putter put it in back of goal
  this.measurer = new Measurer( this.gamePaper, this.ball, this.goal);
  this.roughBack.toBack().hide();
  this.timeout = null;  // non-null during animation

  this.gameOver = this.gamePaper.text( tGameArea.clientWidth / 2, tGameArea.clientHeight / 2, "Game Over")
    .attr({ fill: 'yellow', 'font-size': 64, 'font-weight': 'bold' })
    .hide();

  this.updateAll();

  // We fake an event to get the welcome state initiated
  tState.newState = "welcome";
  this.handleStateChange( tState);
}

ProximityView.prototype.handleStateChange = function( iEvent)
{
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

  // Mostly we get the correct things showing
  switch( iEvent.newState) {
    case "welcome":
      KCPCommon.setElementVisibility( "storybox", true);
      KCPCommon.setElementVisibility( "welcome_panel", true);
      KCPCommon.setElementVisibility( "levels_panel", false);
      KCPCommon.setElementVisibility( "level_alert", false);
      this.model.levelManager.leaveLevelsMode();
      break;
    case "playing":
      KCPCommon.setElementVisibility( "gameCover", false);
      KCPCommon.setElementVisibility( "outercontrols", true);
      KCPCommon.setElementVisibility( "levels_button", false);
      KCPCommon.setElementVisibility( "gameArea", true);
      KCPCommon.setElementVisibility( "levels_panel", false);
      KCPCommon.setElementVisibility( "level_alert", false);
      this.ball.setScoreVisible( false);
      document.getElementById("game_button").innerHTML = "End Game";
      this.goal.updateAppearance( 0);

      if( this.model.roughActive) {
        this.rough.show();
        this.roughBack.show();
      }
      else {
        this.rough.hide();
        this.roughBack.hide();
      }

      this.gameOver.hide();
      this.measurer.startHintTimeout();
      this.prepareNextShot();
      break;
    case "gameEnded":
      KCPCommon.setElementVisibility( "levels_button", true);
      document.getElementById("game_button").innerHTML = "New Game";
      this.gameOver.show();
      KCPCommon.setElementVisibility( "gameCover", true);
      this.measurer.clearHintTimeout(); // So the hint doesn't show again until a game starts
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
ProximityView.prototype.updateAll = function()
{
  document.getElementById("goalNum").innerHTML = this.model.goalNum + " of " + ProximitySettings.numGoals;
  document.getElementById("scoreValue").innerHTML = this.model.score;
  document.getElementById("levelNum").innerHTML = this.model.level.levelNum;
  document.getElementById("levelName").innerHTML = this.model.level.levelName;
  document.getElementById("gameNum").innerHTML = this.model.gameNumber;
}

/**
 * Called as the putter is being dragged
 * @param iDX The x-distance from the initial drag point
 * @param iDY The y-distance from the initial drag point
 * @param iX  Current mouse coord
 * @param iY
 * @param iEvent The mouse move event
 */
ProximityView.prototype.dragBallMove = function( iDX, iDY, iX, iY, iEvent)
{
  var tDX = iX - this.ball.xx,
      tDY = iY - this.ball.yy,
      tDist = this.ball.distance( iX, iY);
  // The putter only shows if
  if( tDist > ProximitySettings.ballRadius)
    this.putter.update( tDX, tDY, tDist);
  else
    this.putter.update( 0, 0, 0);
}

/**
 * Called on initiation of a mouse drag beginning in the ball. The putter will show if the drag goes outside the ball.
 * @param iX
 * @param iY
 * @param iEvent
 */
ProximityView.prototype.dragBallStart = function( iX, iY, iEvent)
{
  this.ball.setCursorVisible( false);
  this.ball.setScoreVisible( false);
  this.putter.computeAngleToGoal();
}

/**
 * Called when a drag that began in the ball ends.
 * @param iEvent
 */
ProximityView.prototype.dragBallEnd = function( iEvent)
{
  this.ball.setCursorVisible( true);
  if( this.putter.getPush() > 0) {
    this.ball.setScoreVisible( true);
    this.startBallAnimation();
  }
  this.putter.update( 0, 0, 0);
}

/**
 * The putter has been released, and was drawn sufficiently far back.
 */
ProximityView.prototype.startBallAnimation = function()
{
  var this_ = this,
      tTime = Date.now();

  /**
   * Called once every frame
   */
  function oneFrame() {
    var tNow = Date.now(),
        tScore;
    this_.ball.oneFrame( (tNow - tTime) / 1000);

    tScore = this_.goal.getScore( this_.ball.getCoordinates());
    this_.ball.setScore( tScore);
    this_.goal.updateAppearance( tScore);

    if( this_.ball.isMoving()) {
      tTime = tNow;
      this_.timeout = setTimeout( oneFrame, ProximitySettings.tickInterval);
    }
    else {
      this_.model.isMoving = false;
      this_.handleEndOfShot( tScore);
    }
  }

  var tPush = this.putter.getPush(),
      tDistance = tPush * this.model.getDistancePerUnitPull();
  this.model.push = tPush;
  this.ball.prepareToMove( tDistance, this.putter.shotAngle, this.model.roughActive );
  this.timeout = setTimeout( oneFrame, ProximitySettings.tickInterval);
  KCPCommon.setElementVisibility( "gameCover", true);
  this.model.isMoving = true;
};

/**
 * We've received notification from model that user has ended the game in the middle of a shot.
 */
ProximityView.prototype.handleAbort = function() {
  if( this.timeout !== null) {
    clearTimeout( this.timeout);
    this.timeout = null;
    this.model.isMoving = false;
  }
}

/**
 * Called at the end of the ball movement animation
 * @param iTurnScore {Number} The score for this turn
 */
ProximityView.prototype.handleEndOfShot = function( iTurnScore)
{
  var this_ = this;

  /**
   * Called when the goal has finished 'glowing'
   * Decide whether the game is over or not.
   */
  function afterGlow() {
    var tCallback, tContext;
    if( this_.model.goalNum === ProximitySettings.numGoals) {
      tCallback = this_.model.endGame;
      tContext = this_.model;
    }
    else {
      tCallback =  this_.prepareNextShot;
      tContext = this_;
    }
    tCallback.call( tContext);
  }
  var tStartCoords = this.ball.getStartCoordinates();
  this.timeout = null;
  // Update the model so the right values will be passed to DG
  this.model.distance = Math.round( this.ball.distance( tStartCoords.x, tStartCoords.y));
  this.model.oneScore = iTurnScore;
  this.model.nBounce = this.ball.nBounce;
  this.model.addTurnCase();

  // Animation before going on to next turn or ending the game
  this.goal.glow( afterGlow);
}

/**
 * The name says it all
 */
ProximityView.prototype.prepareNextShot = function()
{
  // Move the ball and goal to a new, reasonable spot
  var tBallX = ProximitySettings.ballPositionBorder +
                    Math.random() * ( this.gamePaper.width - 2 * ProximitySettings.ballPositionBorder),
      tBallY = ProximitySettings.ballPositionBorder +
                        Math.random() * ( this.gamePaper.height - 2 * ProximitySettings.ballPositionBorder),
      tDist = 0,
      tGoalX, tGoalY;

  while( tDist < ProximitySettings.minimumGoalDistance) {
    tGoalX = ProximitySettings.goalPositionBorder
                +  Math.random() * (this.gamePaper.width - 2 * ProximitySettings.goalPositionBorder);
    tGoalY = ProximitySettings.goalPositionBorder
                +  Math.random() * (this.gamePaper.height - 2 * ProximitySettings.goalPositionBorder);
    tDist = Math.sqrt( (tBallX - tGoalX) * (tBallX - tGoalX) + (tBallY - tGoalY) * (tBallY - tGoalY));
  }

  this.model.goalDist = tDist;

  this.ball.moveTo( { x: tBallX, y: tBallY });
  this.goal.moveTo( { x: tGoalX, y: tGoalY });

  this.model.incrementGoal();
  KCPCommon.setElementVisibility( "gameCover", false);
}

/**
 * Our model has detected that a new level has been unlocked. Notify the user.
 * @param iEvent
 */
ProximityView.prototype.handleLevelUnlocked = function( iEvent)
{

  function closeAlert() {
    KCPCommon.setElementVisibility("level_alert", false);
  }

  document.getElementById("unlock").innerHTML = iEvent.levelName;
  KCPCommon.setElementVisibility("level_alert", true);
  document.getElementById("OK_button").onclick = closeAlert;
}

