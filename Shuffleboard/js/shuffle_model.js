// ==========================================================================
// Project:   Shuffle
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global Event, EventDispatcher, LevelManager, ShuffleGame, ShuffleLevels, ShuffleSettings */

/**
 * @fileoverview Defines ShuffleModel
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

function ShuffleModel()
{
  this.eventDispatcher = new EventDispatcher();
  this.levelManager = new LevelManager( ShuffleLevels, this, 'ShuffleGame.model.handleLevelButton(event, ##);',
                                        this, this.isLevelEnabled);

  this.gameState = "welcome";  // "welcome" or "playing" or "gameEnded" or "levelsMode"
  this.turnState = 'none';         // "none", "pushing", or "waiting"

  // DG vars
  this.openGameCase = null;

  // game vars
  this.gameNumber = 0;
  this.score = 0;
  this.formula = '';
  this.level = this.levelManager.getStartingLevel();

  // turn vars
  this.disk = -1;
  this.push = null;
  this.startPos = 0;
  this.endPos = 0;
  this.pad = '';
  this.oneScore = 0;

  // These properties get set at the beginning of each game
  this.firstPadLeft = 0;
  this.padWidth = 0;
  this.padOffset = 0;
  this.friction = 0;
  this.impulseVariability = 0;
  this.initialXMin = 0;
  this.initialXMax = 0;

  // Properties exclusively for strategy formula and autoplay
  this.disk1start = null;
  this.disk1end = null;
  this.disk1push = null;
  this.currAutoPlayPad = null;
  this.autoplay = false;
  this.autoplayAbort = false;

  // other
  this.fastPush = false;
  this.maxPush = 100;
  this.padNumbers = ['one', 'two', 'three', 'four'];
  this.hasChangedLevels = false;
}

/**
 * Inform DG about this game
 */
ShuffleModel.prototype.initialize = async function()
{
  let interactiveState = codapInterface.getInteractiveState();

  // Create the dataset if it doesn't already exist
  const iResult = await codapInterface.sendRequest({
    action: 'get',
    resource: 'dataContextList'
  });
  if (iResult.success && !iResult.values.some(ds => [ds.name, ds.title].includes("Games/Disks"))) {
    await codapHelper.createDataset({
      name: "Games/Disks",
      collections: [
        {
          name: "Games",
          attrs: [
            {"name": "game", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 5, "description": "game number"},
            {"name": "score", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 300, "description": "game score"},
            {"name": "disks", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 6, "description": "how many disks were pushed"},
            {"name": "formula", "type": "categorical", "description": "what formula was used for autoplay"},
            {"name": "level", "type": "categorical", "description": "what level of the game was played"}
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
          name: "Disks",
          parent: "Games",
          attrs: [
            {"name": "disk", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 6, "description": "which disk in a game"},
            {"name": "push", "type": "numeric", "precision": 1, defaultMin: 0, defaultMax: 100, "description": "the amount of push given to the disk"},
            {"name": "startPos", "type": "numeric", "precision": 1, defaultMin: 0, defaultMax: 50, "description": "the starting position of the disk"},
            {"name": "endPos", "type": "numeric", "precision": 1, defaultMin: 0, defaultMax: 500, "description": "the disk position at end of turn"},
            {"name": "pad", "type": "categorical", "description": "the pad the disk landed on"},
            {"name": "points", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 100, "description": "points for this disk at time of push"}
          ],
          defaults: {
            xAttr: "push",
            yAttr: "endPos"
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

  this.setPush( 50);
};

/**
 * If we don't already have an open game case, open one now.
 */
ShuffleModel.prototype.openNewGameCase = async function()
{
  if( !this.openGameCase) {
    var iResult = await codapInterface.sendRequest({
      action: 'create',
      resource: "dataContext[Games/Disks].collection[Games].case",
      values: [
        {
          values: {
            game: this.gameNumber,
            score: '',
            disks: '',
            formula: '',
            level: this.level.levelName
          }
        }
      ]
    });
    if (iResult.success) {
      this.openGameCase = iResult.values[0].id;
      this.isFirstDisk = true;
    } else {
      console.log("Shuffleboard: Error creating new game case");
    }
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
ShuffleModel.prototype.addTurnCase = async function()
{
  var values = {
    disk: this.disk + 1,
    push: this.push,
    startPos: this.startPos,
    endPos: this.endPos,
    pad: this.pad,
    points: this.oneScore
  };

  if (this.isFirstDisk) {
    // First disk: update the auto-created child case
    var iResult = await codapInterface.sendRequest({
      action: 'get',
      resource: 'dataContext[Games/Disks].collection[Games].caseByID[' + this.openGameCase + ']'
    });
    if (iResult.success) {
      var idOfFirstChild = iResult.values.case.children[0];
      await codapInterface.sendRequest({
        action: 'update',
        resource: "dataContext[Games/Disks].collection[Disks].caseByID[" + idOfFirstChild + "]",
        values: {
          values: values
        }
      });
    } else {
      console.log("Shuffleboard: Error finding existing disk case");
    }
    this.isFirstDisk = false;
  } else {
    // Subsequent disks: create new child case
    await codapInterface.sendRequest({
      action: "create",
      resource: "dataContext[Games/Disks].collection[Disks].case",
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
ShuffleModel.prototype.addGameCase = async function()
{
  var this_ = this;
  await codapInterface.sendRequest({
    action: 'update',
    resource: 'dataContext[Games/Disks].collection[Games].caseByID[' + this.openGameCase + ']',
    values: {
      values: {
        game: this.gameNumber,
        score: this.score,
        disks: this.disk + 1,
        formula: this.formula,
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
ShuffleModel.prototype.playGame = function()
{
  var tLevel = this.level;

  this.gameNumber++;
  this.score = 0;
  this.disk = -1;
  this.autoplay = false;
  this.autoplayAbort = false;
  this.formula = '';

  this.firstPadLeft = Math.round( tLevel.firstPlateMin + Math.random() * (tLevel.firstPlateMax - tLevel.firstPlateMin));
  this.padWidth = Math.round( tLevel.plateWidthMin + Math.random() * (tLevel.plateWidthMax - tLevel.plateWidthMin));
  this.padOffset = tLevel.plateOffset;
  this.friction = tLevel.friction;
  this.impulseFactor = tLevel.impulseFactorMin + Math.random() * (tLevel.impulseFactorMax - tLevel.impulseFactorMin);
  this.impulseVariability = tLevel.impulseVariability;
  this.initialXMin = tLevel.initialXMin;
  this.initialXMax = tLevel.initialXMax;

  this.openNewGameCase();  // fire and forget
  this.changeGameState( 'playing');

  this.setupDisk();
  this.changeTurnState('waiting');
  this.updateInteractiveState();
};

/**
 * Choose a starting position and the friction of the board.
 */
ShuffleModel.prototype.setupDisk = function() {

  // body of setupDisk
  this.startPos = this.level.initialXMin + Math.random() * (this.level.initialXMax - this.level.initialXMin);
  this.incrementDisk();
};

/**
 * Increment the goal and let dependents know.
 */
ShuffleModel.prototype.incrementDisk = function()
{
  var tEvent = new Event( 'diskIncrement');
  this.disk++;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * Increment the goal and let dependents know.
 */
ShuffleModel.prototype.setPush = function( iPush)
{
  var tEvent = new Event( 'pushChange');
  this.push = iPush;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * Translate the integer pad to string and set the property that will be written out to DG
 * @param iPad {Number} -1, 0, 1, 2, or 3
 */
ShuffleModel.prototype.setPad = function( iPad)
{
  this.pad = (iPad >= 0) ? this.padNumbers[ iPad] : '';
};

/**
 * Called during animation
 * @param iScore
 */
ShuffleModel.prototype.setOneScore= function( iScore)
{
  this.oneScore = iScore;
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
ShuffleModel.prototype.changeGameState = function( iNewState)
{
  var tEvent = new Event('stateChange');
  tEvent.priorState = this.gameState;
  tEvent.newState = iNewState;
  this.gameState = iNewState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
ShuffleModel.prototype.changeTurnState = function( iNewState)
{
  var tEvent = new Event('turnStateChange');
  tEvent.newState = iNewState;
  this.turnState = iNewState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * The disk has stopped. Change turnState to waiting, but
 * If the number of disks has reached its limit, end the game.
 */
ShuffleModel.prototype.endTurn = function()
{
  if( this.disk === 0) {
    // Record first disk for possible use in autoplay
    this.disk1start = this.startPos;
    this.disk1end = this.endPos;
    this.disk1push = this.push;
  }
  this.addTurnCase();
  this.oneScore = 0;
  if( this.disk + 1 >= ShuffleSettings.disksPerGame)
    this.endGame();
  else {
    this.setupDisk();
    this.changeTurnState('waiting');
    if( this.autoplay)
      this.autoplay = this.doAutoDisk();
  }
};

/**
 * The current game has just ended, possibly by user action
 */
ShuffleModel.prototype.endGame = function()
{
  var this_ = this;

  function endIt() {
    this_.addGameCase();
    this_.changeGameState( 'gameEnded');
  }

  if( this.autoplay) {
    this.autoplay = false;  // So any autoplay in progress will stop
    this.autoplayAbort = true;
    setTimeout( endIt, 100); // Come back after abort has happened
  }
  else
    endIt();
};

/**
 * The game button can either end the current game or start a new game
 */
ShuffleModel.prototype.handleGameButton = function()
{
  switch( this.gameState) {
    case 'playing':
      this.disk--; // because we're aborting
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
 * The user has input a push. But some levels allow for variability and the level's impulseFactor.
 * @return {Number} The amount of push to be used by the disk at start
 */
ShuffleModel.prototype.getImpulse = function() {
  var tResult = this.push,
      tVariability = this.level.impulseVariability;
  if(tResult > 0)
    tResult += 2 * tVariability * (Math.random() - 0.5);
  tResult = Math.max( 0, tResult);

  return tResult * this.impulseFactor;
};

/**
 * The user has pushed the Push button. Start the current disk moving
 */
ShuffleModel.prototype.handlePushButton = function()
{
  this.fastPush = window.event && window.event.altKey;
  this.changeTurnState('pushing');
  this.fastPush = false;
};

/**
 * Key was pressed in guess input
 */
ShuffleModel.prototype.handleBodyKeydown = function( iEvent)
{
  var kRight = 39,
      kLeft = 37;
  if( iEvent.keyCode === kRight) {
    this.setPush( Math.min( 100, this.push + 1));
  }
  else if( iEvent.keyCode === kLeft) {
    this.setPush( Math.max( 0, this.push - 1));
  }
};

/**
 * Return the object that is passed to DG for a formula object
 */
ShuffleModel.prototype.getFormulaObjectDescription = function()
{
  return {
      title: "Autoplay Strategy: A Formula for Push",
      description: this.level.formula_intro,
      output: 'push',
      inputs: this.level.formula_inputs,
      descriptions: this.level.formula_input_descriptions,
      allow_user_variables: this.level.allow_user_variables
    };
};

/**
 * Request that a formula object show with which the user can input a strategy.
 * NOTE: Formula object support is not yet available in CODAP V3.
 */
ShuffleModel.prototype.handleStrategyButton = function()
{
  console.log("Shuffleboard: Formula object (Set Strategy) is not yet supported in CODAP V3");
};

/**
 * If the formula object is visible, it will get new contents based on the current level.
 * NOTE: Formula object support is not yet available in CODAP V3.
 */
ShuffleModel.prototype.updateStrategyEditor = function()
{
  console.log("Shuffleboard: Formula object (Update Strategy) is not yet supported in CODAP V3");
};

/**
 * User has pressed Autoplay button. If there's a strategy, we push the disks automatically
 */
ShuffleModel.prototype.handleAutoButton = function() {

  // Formula object support is not yet available in CODAP V3
  var tEvent = new Event('strategyError');
  tEvent.error = "Autoplay requires formula support, which is not yet available in CODAP V3.";
  this.eventDispatcher.dispatchEvent(tEvent);
};


/**
 * Send out the current disk using the user's strategy. Return true if it's appropriate for another disk after
 * this one.
 * @return {Boolean}
 */
ShuffleModel.prototype.doAutoDisk = function()
{
  var tResult = true;
  if( this.disk === 0) {
    // First disk
    this.handlePushButton();
    this.currAutoPlayPad = 0; // for use in next push
  }
  else if( this.disk < ShuffleSettings.disksPerGame) {

    var handlePush =function(tPush) {
      if (tPush === false)
        return false; // There was an error
      this.setPush(tPush);
      this.handlePushButton();
      this.currAutoPlayPad++;
    }.bind(this);
    this.getPushFromDG(handlePush);
  }
  else
    tResult = false;
  return tResult;
};

/**
 * Determine whether there is an evaluable formula.
 * NOTE: Formula object support is not yet available in CODAP V3.
 * @return {Object}
 */
ShuffleModel.prototype.strategyExists = function(callback)
{
  callback({ exists: false, error: "Formula support is not yet available in CODAP V3." });
};

/**
 * Previously the user has set the strategy with a formula. We now pass values that can be used to
 * evaluate the formula and return the result.
 * NOTE: Formula object support is not yet available in CODAP V3.
 * @return {Number}
 */
ShuffleModel.prototype.getPushFromDG = function(callback)
{
  callback(false);
};

/**
 * We simply change state and let the view do the work
 */
ShuffleModel.prototype.handleLevelsButton = function()
{
  this.changeGameState( "levelsMode");
};

/**
 * Called when the user clicks on a level in the levels dialog
 * @param iEvent - a mouse event
 * @param iLevelIndex {Number} The 0-based index of the chosen level
 */
ShuffleModel.prototype.handleLevelButton = function( iEvent, iLevelIndex)
{
  var tClickedLevel = ShuffleLevels[ iLevelIndex],
      tLevelIsChanging = tClickedLevel !== this.level;
  if( iEvent.shiftKey && iEvent.altKey) {
      tClickedLevel.unlocked = true;
  }
  if( this.isLevelEnabled( tClickedLevel)) {
    this.level = tClickedLevel;
    this.playGame();
    this.updateStrategyEditor();
    if( tLevelIsChanging && !this.hasChangedLevels) {
      this.hasChangedLevels = true;
      this.eventDispatcher.dispatchEvent( new Event( "firstTimeLevelChanged"));
    }
  }
  this.updateInteractiveState();
};

/**
 * The logic for whether a level is enabled lives here in the model, not in the level manager.
 *
 * @param iLevelSpec
 * @return {Boolean}
 */
ShuffleModel.prototype.isLevelEnabled = function( iLevelSpec)
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
ShuffleModel.prototype.updateInteractiveState = function() {
  var currentInteractiveState = {
    gameNumber: this.gameNumber,
    currentLevel: this.level && this.level.levelName,
    levelsMap: this.levelManager.getLevelsLockState()
  };
  codapInterface.updateInteractiveState(currentInteractiveState);
};

/**
  Restores the game state for the game.
  @param    {Object}    iState -- The state as saved previously.
 */
ShuffleModel.prototype.restoreGameState = function( iState) {
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
      this.changeGameState('playing');
      this.changeGameState('gameEnded');
    }
  }
  return { success: true };
};
