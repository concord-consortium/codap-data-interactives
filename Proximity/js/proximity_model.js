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


function ProximityModel()
{
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
ProximityModel.prototype.initialize = async function()
{
  let interactiveState = codapInterface.getInteractiveState();

  // Create the dataset if it doesn't already exist
  const iResult = await codapInterface.sendRequest({
    action: 'get',
    resource: 'dataContextList'
  });
  if (iResult.success && !iResult.values.some(ds => [ds.name, ds.title].includes("Games/Turns"))) {
    await codapHelper.createDataset({
      name: "Games/Turns",
      collections: [
        {
          name: "Games",
          title: "Games",
          attrs: [
            {"name": "game", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 5, "description": "game number"},
            {"name": "score", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 500, "description": "game score"},
            {"name": "goals", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 6, "description": "how many goals"},
            {"name": "level", "type": "categorical"}
          ],
          labels: {
            singleCase: "game",
            pluralCase: "games",
            singleCaseWithArticle: "a game",
            setOfCases: "match",
            setOfCasesWithArticle: "a match"
          },
          defaults: {
            xAttr: "game",
            yAttr: "score"
          }
        },
        {
          name: "Turns",
          title: "Turns",
          parent: "Games",
          attrs: [
            {"name": "push", "type": "numeric", "precision": 1, defaultMin: 0, defaultMax: 30, "description": "how hard you pushed"},
            {"name": "distance", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 200, "description": "how far it went (net)"},
            {"name": "goalNum", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 6, "description": "which goal"},
            {"name": "points", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 100, "description": "points scored on this goal"},
            {"name": "goalDist", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 200, "description": "original distance to the goal"},
            {"name": "nBounce", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 2, "description": "how many bounces"}
          ],
          labels: {
            singleCase: "turn",
            pluralCase: "turns",
            singleCaseWithArticle: "a turn",
            setOfCases: "game",
            setOfCasesWithArticle: "a game"
          },
          defaults: {
            xAttr: "push",
            yAttr: "distance"
          }
        }
      ],
      type: 'DG.GameContext',
    });
  }

  notificatons.registerForDocumentChanges();
  if (interactiveState) {
    this.restoreGameState(interactiveState);
  }
};

/**
 * If we don't already have an open game case, open one now.
 */
ProximityModel.prototype.openNewGameCase = async function()
{
  if( !this.openGameCase) {
    await codapInterface.sendRequest({
      action: 'create',
      resource: "dataContext[Games/Turns].collection[Games].case",
      values: [
        {
          values: {
            game: this.gameNumber,
            score: 0,
            goals: 0,
            level: this.level.levelName
          }
        }
      ]
    }).then(function(iResult) {
      if(iResult.success) {
        this.openGameCase = iResult.values[0].id;
      } else {
        console.log("Proximity: Error creating new game case");
      }
    }.bind(this));
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
ProximityModel.prototype.addTurnCase = async function()
{
  this.score += this.oneScore;
  this.eventDispatcher.dispatchEvent( new Event( "scoreChange"));

  var values = {
    push: this.push,
    distance: this.distance,
    goalNum: this.goalNum,
    points: this.oneScore,
    goalDist: this.goalDist,
    nBounce: this.nBounce
  };

  if (this.goalNum === 1) {
    // Update the auto-created first turn case
    var iResult = await codapInterface.sendRequest({
      action: 'get',
      resource: 'dataContext[Games/Turns].collection[Games].caseByID[' + this.openGameCase + ']'
    });
    if (iResult.success) {
      var idOfFirstTurnCase = iResult.values.case.children[0];
      await codapInterface.sendRequest({
        action: 'update',
        resource: "dataContext[Games/Turns].collection[Turns].caseByID[" + idOfFirstTurnCase + "]",
        values: {
          values: values
        }
      });
    } else {
      console.log("Proximity: Error finding existing turn case");
    }
  } else {
    // Create a new Turn case
    await codapInterface.sendRequest({
      action: "create",
      resource: "dataContext[Games/Turns].collection[Turns].case",
      values: [
        {
          parent: this.openGameCase,
          values: values
        }
      ]
    });
  }
};

/**
 * Let DG know that the current game is complete.
 * Stash relevant values for the level and check to see if any levels are newly unlocked.
 */
ProximityModel.prototype.addGameCase = async function()
{
  var this_ = this;
  await codapInterface.sendRequest({
    action: 'update',
    resource: 'dataContext[Games/Turns].collection[Games].caseByID[' + this.openGameCase + ']',
    values: {
      values: {
        game: this.gameNumber,
        score: this.score,
        goals: this.goalNum,
        level: this.level.levelName
      }
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
  this.openNewGameCase();  // fire and forget
  this.changeState( "playing");
  this.updateInteractiveState();
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
  this.updateInteractiveState();
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
 * Push the current state to codapInterface for automatic save/restore.
 */
ProximityModel.prototype.updateInteractiveState = function() {
  var currentInteractiveState = {
    gameNumber: this.gameNumber,
    currentLevel: this.level && this.level.levelName,
    levelsMap: this.levelManager.getLevelsLockState()
  };
  codapInterface.updateInteractiveState(currentInteractiveState);
};

/**
  Restores the game state from the specified state object.
  @param    {Object}  iState -- The saved state object
  @returns  {Object}  { success: true }
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
    if (this.gameNumber > 0) {
      this.changeState('playing');
      this.changeState('gameEnded');
    }
  }
  return { success: true };
};
