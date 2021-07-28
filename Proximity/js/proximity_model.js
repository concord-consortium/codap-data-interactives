// ==========================================================================
// Project:   Proximity
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global Event, EventDispatcher, LevelManager, ProximityGame, ProximityLevels */

/**
 * @fileoverview Defines ProximityModel
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */


function ProximityModel(codapPhone, iDoAppCommandFunc)
{
  this.codapPhone = codapPhone;
  //this.doAppCommandFunc = iDoAppCommandFunc;
  
  this.eventDispatcher = new EventDispatcher();
  this.levelManager = new LevelManager( ProximityLevels, this, 'ProximityGame.model.handleLevelButton(event, ##);',
                                        this, this.isLevelEnabled);

  this.currentState = "welcome";  // "welcome" or "playing" or "gameEnded" or "levelsMode"
  
  // DG vars
  this.openGameCase = null;
  
  // game vars
  this.gameNumber = 0;
  this.score = 0;
  this.level = this.levelManager.getStartingLevel();

  // turn vars
  this.push = 0;
  this.distance = 0;
  this.goalNum = 0;   // Also used as goals completed at the game level
  this.oneScore = 0;
  this.goalDist = 0;
  this.nBounce = 0;

  this.distancePerUnitPull = 0; // Number of pixels ball will travel per unit of pull
  this.roughActive = false; // Boolean--whether the 'rough' will show or not
  this.isMoving = false;  // Controlled by view. Needed to abort properly
}

/**
 * Inform DG about this game
 */
/* Called by index.html*/
ProximityModel.prototype.initialize = function()
{
  this.codapPhone.call({
      action:'initGame',
      args:{
          name: "Proximity",
          version: "2.0",
          dimensions: { width: 447, height: 330 },
          collections: [
              {
                  name: "Games",
                  attrs: [
                      {"name": "game" , "type" : "numeric" , "precision" : 0, defaultMin: 1, defaultMax: 5, "description": "game number" } ,
                      {"name": "score" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 500, "description": "game score"   } ,
                      {"name": "goals" , "type" : "numeric" , "precision" : 0, defaultMin: 1, defaultMax: 6, "description": "how many goals"   } ,
                      {"name": "level", "type" : "nominal" }
                  ],
                  childAttrName: "Turn",
                  defaults: {
                      xAttr: "game",
                      yAttr: "score"
                  }
              },
              {
                  name: "Turns",
                  attrs: [
                      { "name" : "push" , "type" : "numeric" , "precision" : 1, defaultMin: 0, defaultMax: 30, "description": "how hard you pushed"   } ,
                      { "name" : "distance" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 200, "description": "how far it went (net)"  } ,
                      { "name" : "goalNum" , "type" : "numeric" , "precision" : 0, defaultMin: 1, defaultMax: 6, "description": "which goal"   } ,
                      { "name" : "points" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 100, "description": "points scored on this goal"   } ,
                      { "name" : "goalDist" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 200, "description": "original distance to the goal"   } ,
                      { "name" : "nBounce" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 2, "description": "how many bounces"   }
                  ],
                  defaults: {
                      xAttr: "push",
                      yAttr: "distance"
                  }
              }
          ]
          //doCommandFunc: this.doAppCommandFunc
      }
  }, function(){console.log("Initializing game")});
};

/**
 * If we don't already have an open game case, open one now.
 */

/*Called by addTurnCase() and playGame() in this model*/
ProximityModel.prototype.openNewGameCase = function()
{
  if( !this.openGameCase) {
    this.codapPhone.call({
        action:'openCase',
        args: {
            collection: "Games",
            values:[this.gameNumber, '', '', this.level.levelName]
        }
    }, function(result){
        if (result.success){
            this.openGameCase = result.caseID;
            this.changeState( "playing"); // Our view will update
            console.log("I have caseID" + result.caseID);
        } else {
            console.log("Cart Weight: Error calling 'openCase'");
        }
    }.bind(this));
    /*var result = this.dgApi.doCommand("openCase",
                    {
                      collection: "Games",
                      values:
                      [
                        this.gameNumber, '', '', this.level.levelName
                      ]
                    });
    // Stash the ID of the opened case so we can close it when done
    if( result.success)
      this.openGameCase = result.caseID;*/
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
/* Called from proximity_view.js handleEndOfShot()*/
ProximityModel.prototype.addTurnCase = function()
{
  this.score += this.oneScore;
  this.eventDispatcher.dispatchEvent( new Event( "scoreChange"));
  this.openNewGameCase(); // Does nothing if already open

  // Create the new Turn case

  var createCase = function(){
      this.codapPhone.call({
          action:'createCase',
          args: {
              collection:"Turns",
              parent: this.openGameCase,
              values:
                  [
                      this.push,
                      this.distance,
                      this.goalNum,
                      this.oneScore,
                      this.goalDist,
                      this.nBounce
                  ]
          }
      });
  }.bind(this);
    createCase();

};

/**
 * Let DG know that the current game is complete.
 * Stash relevant values for the level and check to see if any levels are newly unlocked.
 */
/* Called from addGameCase() in this model*/
ProximityModel.prototype.addGameCase = function()
{
  var this_ = this;
  this.codapPhone.call({
      action:'closeCase',
      args: {
          collection: "Games",
          caseID: this.openGameCase,
          values:
              [
                  this.gameNumber,
                  this.score,
                  this.goalNum,
                  this.level.levelName
              ]
      }
  });

  this.openGameCase = null;

  if( !this.level.scores)
    this.level.scores = [];
  this.level.scores.push( this.score);
  this.level.highScore = !this.level.highScore ? this.score : Math.max( this.level.highScore, this.score);

  // This game may have unlocked a previously locked level
  this.levelManager.levelsArray.forEach( function( iLevel) {
    if( !iLevel.unlocked && this_.isLevelEnabled( iLevel)) {
      iLevel.unlocked = true;
      var tEvent = new Event("levelUnlocked");
      tEvent.levelName = iLevel.levelName;
      this_.eventDispatcher.dispatchEvent( tEvent);
    }
  });
};

/**
 * Prepare for the new game that is beginning.
 */
/* Called from index.html when the user clicks on the start game button */
ProximityModel.prototype.playGame = function()
{
  this.gameNumber++;
  this.goalNum = 0;
  this.score = 0;

  // Compute parameters from level info
  var tNewSlope;  // We want the new slope to 'sufficiently different' from the old slope
  do {
    tNewSlope = this.level.dpupMin + Math.random() * this.level.dpupRange;
  } while( Math.abs( this.distancePerUnitPull - tNewSlope) < this.level.dpupRange / 2.5);
  this.distancePerUnitPull = tNewSlope;
  this.roughActive = this.level.roughActive;
  this.isMoving = false;

  this.setGoal();
  this.openNewGameCase();

};

/**
 * For some levels the result will vary from turn to turn
 * @return {Number}
 */
ProximityModel.prototype.getDistancePerUnitPull = function()
{
  return this.distancePerUnitPull *
              (1 + this.level.dpupVariability / 100 * (Math.random() - Math.random()));
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
ProximityModel.prototype.changeState = function( iNewState)
{
  var tEvent = new Event("stateChange");
  tEvent.priorState = this.currentState;
  tEvent.newState = iNewState;
  this.currentState = iNewState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * The current game has just ended, possibly by user action
 */
ProximityModel.prototype.endGame = function()
{
  this.addGameCase();
  this.changeState( 'gameEnded');
};

/**
 * The user has pressed End Game button but the ball is still moving.
 */
ProximityModel.prototype.abortGame = function()
{
  this.eventDispatcher.dispatchEvent( new Event('abort'));
};

/**
 * The game button can either end the current game or start a new game
 */
ProximityModel.prototype.handleGameButton = function()
{
  switch( this.currentState) {
    case 'playing':
      if( this.isMoving)
        this.abortGame();
      this.goalNum--; // because we didn't actually play it
      this.endGame();
      break;
    case 'gameEnded':
    case 'levelsMode':
      this.playGame();
      break;
    default:
  }
};

/**
 * Let dependents know of the current goal number through a 'goalChange' event
 */
ProximityModel.prototype.setGoal = function()
{
  var tEvent = new Event( "goalChange");
  tEvent.goalNum = this.goalNum;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * Increment the goal and let dependents know.
 */
ProximityModel.prototype.incrementGoal = function()
{
  this.goalNum++;
  this.setGoal();
};

/**
 * We simply change state and let the view do the work
 */
ProximityModel.prototype.handleLevelsButton = function()
{
  this.changeState( "levelsMode");
};

/**
 * Called when the user clicks on a level in the levels dialog
 * @param iEvent - a mouse event
 * @param iLevelIndex {Number} The 0-based index of the chosen level
 */
ProximityModel.prototype.handleLevelButton = function( iEvent, iLevelIndex)
{
  var tClickedLevel = ProximityLevels[ iLevelIndex];
  if( iEvent.shiftKey && iEvent.altKey) {
      tClickedLevel.unlocked = true;
  }
  if( this.isLevelEnabled( tClickedLevel)) {
    this.level = tClickedLevel;
    this.playGame();
  }
};

/**
 * The logic for whether a level is enabled lives here in the model, not in the level manager.
 *
 * @param iLevelSpec
 * @return {Boolean}
 */
ProximityModel.prototype.isLevelEnabled = function( iLevelSpec)
{
  /**
   * Does the array of scores contain enough in a row above the given threshold?
   * @param iRequiredNumInARow {Number}
   * @param iThreshold {Number}
   * @param iScores {Array} of {Number}
   * @return {Boolean}
   */
  function gotEnoughHighScoresInARow( iRequiredNumInARow, iThreshold, iScores) {
    if( !iRequiredNumInARow)
      return true;  // Not required to get any in a row
    if( !iScores || !iScores.length)
      return false; // Didn't exist or wasn't an array with entries
    var tNumInARow = 0;
    iScores.forEach( function( iScore) {
      if( tNumInARow >= iRequiredNumInARow)
        return;
      if( iScore >= iThreshold)
        tNumInARow++;
      else
        tNumInARow = 0;
    });
    return tNumInARow >= iRequiredNumInARow;
  }

  var tEnabled = true,
      tPrereq = iLevelSpec.prerequisite,
      tPrereqLevel;
  if( tPrereq && !iLevelSpec.unlocked) {
    tPrereqLevel = (tPrereq.level) ? this.levelManager.getLevelNamed( tPrereq.level) : null;
    if( tPrereqLevel.highScore && (tPrereqLevel.highScore >= tPrereq.score))
      tEnabled = gotEnoughHighScoresInARow( tPrereq.inARow, tPrereq.score, tPrereqLevel.scores);
    else
      tEnabled = false;
  }

  return tEnabled;
};

/**
  Saves the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @returns  {Object}    { success: {Boolean}, state: {Object} }
 */
ProximityModel.prototype.saveGameState = function() {
  return {
            success: true,
            state: {
              gameNumber: this.gameNumber,
              currentLevel: this.level && this.level.levelName,
              levelsMap: this.levelManager.getLevelsLockState()
            }
          };
};

/**
  Restores the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @param    {Object}    iState -- The state as saved previously by saveGameState().
 */
ProximityModel.prototype.restoreGameState = function( iState) {
  if( iState) {
    if( iState.gameNumber)
      this.gameNumber = iState.gameNumber;
    if( iState.currentLevel) {
      var level = this.levelManager.getLevelNamed( iState.currentLevel);
      if( level) this.level = level;
    }
    if( iState.levelsMap)
      this.levelManager.setLevelsLockState( iState.levelsMap);
    this.playGame();
  }
  return { success: true };
};

