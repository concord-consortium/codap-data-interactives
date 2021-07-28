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

function ShuffleModel(codapPhone, iDoAppCommandFunc)
{
  this.codapPhone = codapPhone;
  //this.doAppCommandFunc = iDoAppCommandFunc;

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
ShuffleModel.prototype.initialize = function()
{
    this.codapPhone.call({
        action:'initGame',
        args: {
            name: "Shuffleboard",
            version: "2.0",
            dimensions: { width: 504, height: 338 },
            collections: [
                {
                    name: "Games",
                    attrs: [
                        {"name": "game" , "type" : "numeric" , "precision" : 0, defaultMin: 1, defaultMax: 5, "description": "game number" } ,
                        {"name": "score" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 300, "description": "game score"   } ,
                        {"name": "disks" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 6, "description": "how many disks were pushed"   } ,
                        {"name": "formula" , "type" : "nominal", "description": "what formula was used for autoplay"   } ,
                        {"name": "level", "type" : "nominal", 'description': 'what level of the game was played' }
                    ],
                    childAttrName: "Turn",
                    defaults: {
                        xAttr: "game",
                        yAttr: "score"
                    }
                },
                {
                    name: "Disks",
                    attrs: [
                        { "name" : "disk" , "type" : "numeric" , "precision" : 0, defaultMin: 1, defaultMax: 6, "description": "which disk in a game"   } ,
                        { "name" : "push" , "type" : "numeric" , "precision" : 1, defaultMin: 0, defaultMax: 100, "description": "the amount of push given to the disk"  } ,
                        { "name" : "startPos" , "type" : "numeric" , "precision" : 1, defaultMin: 0, defaultMax: 50, "description": "the starting position of the disk"  } ,
                        { "name" : "endPos" , "type" : "numeric" , "precision" : 1, defaultMin: 0, defaultMax: 500, "description": "the disk position at end of turn"   } ,
                        { "name" : "pad" , "type" : "nominal" , "description": "the pad the disk landed on"   } ,
                        { "name" : "points" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 100, "description": "points for this disk at time of push"   }
                    ],
                    defaults: {
                        xAttr: "push",
                        yAttr: "endPos"
                    }
                }
            ]
        }
    }, function(){console.log("Initialize game")});

  this.setPush( 50);
};

/**
 * If we don't already have an open game case, open one now.
 */
ShuffleModel.prototype.openNewGameCase = function()
{
  if( !this.openGameCase) {
    this.codapPhone.call({
        action:'openCase',
        args:{
            collection: "Games",
            values:[this.gameNumber, '', '', '', this.level.levelName]
        }
    }, function(result){
        if(result.success){
            this.openGameCase = result.caseID;
            console.log("I have caseID" + result.caseID);
        } else {
            console.log("Shuffleboard: Error calling 'openCase'");
        }
    }.bind(this));
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
ShuffleModel.prototype.addTurnCase = function() //called from endTurn line 316
{
  this.openNewGameCase(); // Does nothing if already open

  // Create the new Turn case
    var createCase = function(){
        this.codapPhone.call({
            action:'createCase',
            args: {
                collection:"Disks",
                parent: this.openGameCase,
                values:
                    [
                        this.disk + 1,
                        this.push,
                        this.startPos,
                        this.endPos,
                        this.pad,
                        this.oneScore
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
ShuffleModel.prototype.addGameCase = function() //line 344
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
                      this.disk + 1,
                  this.formula,
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
ShuffleModel.prototype.playGame = function() //called from index.html
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

  this.openNewGameCase(); //line 118
  this.changeGameState( 'playing'); // Our view will update line 291

  this.setupDisk(); //line 242
  this.changeTurnState('waiting');//line 304
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
ShuffleModel.prototype.endTurn = function()//called from table_view.js line 165
{
  if( this.disk === 0) {
    // Record first disk for possible use in autoplay
    this.disk1start = this.startPos;
    this.disk1end = this.endPos;
    this.disk1push = this.push;
  }
  this.addTurnCase(); //line 141
  this.oneScore = 0;
  if( this.disk + 1 >= ShuffleSettings.disksPerGame)
    this.endGame(); //line 339
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
    this_.addGameCase(); //line 172
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
ShuffleModel.prototype.handlePushButton = function()//called from index.html
{
  this.fastPush = window.event && window.event.altKey;
  this.changeTurnState('pushing');//calls changeTurnState in table_view.js with 'pushing' state
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
 * Request that a formula object show with which the user can input a strategy
 */
ShuffleModel.prototype.handleStrategyButton = function() //called from index.html to handle Strategy button push
{
    this.codapPhone.call({
        action:'requestFormulaObject',
        args:this.getFormulaObjectDescription()
    });
  //this.dgApi.doCommand( "requestFormulaObject", this.getFormulaObjectDescription());
};

/**
 * If the formula object is visible, it will get new contents based on the current level
 */
ShuffleModel.prototype.updateStrategyEditor = function()
{
    this.codapPhone.call({
        action:'updateFormulaObject',
        args:  this.getFormulaObjectDescription()
    });
    };

/**
 * User has pressed Autoplay button. If there's a strategy, we push the disks automatically
 */
ShuffleModel.prototype.handleAutoButton = function() {


  var startAutoPlay = function (tTest) {
    if (tTest.exists) {
      this.autoplay = true; // So animation speeds up
      this.disk1push = this.push;
      this.disk1start = this.startPos;
      this.currAutoPlayPad = 0;
      this.autoplay = this.doAutoDisk();
    }
    else {
      var tEvent = new Event('strategyError');
      tEvent.error = ((tTest.error === '') || (tTest.error === undefined)) ?
        "There must be a valid formula for push." :
        tTest.error;
      this.eventDispatcher.dispatchEvent(tEvent);
    }
  }.bind(this);

  this.strategyExists(startAutoPlay);
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
    this.getPushFromDG(handlePush); //line 545
  }
  else
    tResult = false;
  return tResult;
};

/**
 * Determine whether there is an evaluable formula.
 * @return {Object}
 */
ShuffleModel.prototype.strategyExists = function(callback)
{
  var requestFormulaValue = function(){
      this.codapPhone.call({
          action:'requestFormulaValue',
          args:{
              output: 'push',
              curStart: 10,
              start1: 10,
              end1: 100,
              push1: 50,
              padLeft: 100,
              padRight: 150

          }
      }, function(tResult){
        var tExists,
          tTest;
        tExists = (tResult.formula !== '') && (typeof( tResult.push) === 'number') && isFinite( tResult.push);
        tTest= { exists: tExists, error: tResult.error };
        callback(tTest);
      });

  }.bind(this);

  requestFormulaValue();
};

/**
 * Previously the user has set the strategy with a formula. We now pass values that can be used to
 * evaluate the formula and return the result.
 * @return {Number}
 */
ShuffleModel.prototype.getPushFromDG = function(callback)
{
  var tPadLeft = this.firstPadLeft + this.currAutoPlayPad * this.padOffset,
      tPadRight = tPadLeft + this.padWidth,
      tResult;

  var requestFormulaValue = function(){
      this.codapPhone.call({
          action:'requestFormulaValue',
          args:{
              output: 'push',
              curStart: this.startPos,
              start1: this.disk1start,
              end1: this.disk1end,
              push1: this.disk1push,
              padLeft: tPadLeft,
              padRight: tPadRight
          }
      }, function(tResult) {
        var tPush;
        if( (typeof(tResult.push) !== 'number') || !isFinite( tResult.push) || (tResult.formula === '') || (tResult.error !== '')) {
          var tEvent = new Event( 'strategyError');
          if( (typeof(tResult.push) === 'number') && !isFinite( tResult.push))
            tEvent.error = "Push must be a finite number, not " + tResult.push;
          else
            tEvent.error = tResult.error;
          this.eventDispatcher.dispatchEvent( tEvent);
          this.formula = '';
          tPush= false;
        }
        this.formula = tResult.formula; // Side effect. We remember the most recently used formula
        tPush= Math.floor( tResult.push);
        callback(tPush);
      }.bind(this));
  }.bind(this);
  requestFormulaValue();

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
  Saves the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @returns  {Object}    { success: {Boolean}, state: {Object} }
 */
ShuffleModel.prototype.saveGameState = function() {
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
    this.playGame();
  }
  return { success: true };
};
