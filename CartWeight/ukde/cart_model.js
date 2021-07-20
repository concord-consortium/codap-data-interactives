// ==========================================================================
// Project:   Cart
// Copyright: ©2016 Concord Consortium
// ==========================================================================
/*global $, cartGame, CartLevels, CartSettings, Event, EventDispatcher, LevelManager */


/**
 * @fileoverview Defines CartModel
 * @author wfinzer@concord.org (William Finzer)
 * @preserve (c) 2016 Concord Consortium
 */

function CartModel(codapPhone) {
  this.codapPhone = codapPhone;

  this.eventDispatcher = new EventDispatcher();
  this.levelManager = new LevelManager(CartLevels, this, 'cartGame.model.handleLevelButton(event, ##);',
      this, this.isLevelEnabled);

  this.gameState = "welcome";  // "welcome" or "playing" or "gameEnded" or "levelsMode"
  this.turnState = "";         // "", "guessing", or "weighing"

  // DG vars
  this.openGameCase = null;

  // game vars
  this.gameNumber = 0;
  this.score = 0;
  this.level = this.levelManager.getStartingLevel();

  // turn vars
  this.cartNum = 0;
  this.bricks = 0;
  this.weight = '';
  this.guess = 0;
  this.oneScore = '';
  this.smallBricks = 0;

  // other
  this.brickWeight = 0;   // Determined at start of each game
  this.smBrickWeight = 0;   // Determined at start of each game
  this.tare = 0;          // Determined at start of each game
  this.brickHistory = [];
  this.smallBrickHistory = [];
  this.changeIsBlocked = false;

  //ukde
  this.turnButtonHasBeenPressed = false;

  // ukde version A
  this.ukdeA_numGamesPlayedInLevelWithoutWinning = 0;  // In UKDE_A
  this.ukdeA_hasNextLevelBeenUnlocked = false;

  // ukde version B
  this.ukdeB_Score = 0;
  this.ukdeB_Scores = [];
}

/**
 * Inform DG about this game
 */
CartModel.prototype.initialize = function () {
  this.codapPhone.call({
    action: 'initGame',
    args: {
      name: "Cart Weight",
      version: "2.1A",
      dimensions: {width: 290, height: 350},
      collections: [
        {
          name: "Games",
          attrs: [
            {
              "name": "game",
              "type": "numeric",
              "precision": 0,
              defaultMin: 1,
              defaultMax: 5,
              "description": "game number"
            },
            {
              "name": "score",
              "type": "numeric",
              "precision": 0,
              defaultMin: 0,
              defaultMax: 300,
              "description": "game score"
            },
            {
              "name": "carts",
              "type": "numeric",
              "precision": 0,
              defaultMin: 0,
              defaultMax: 5,
              "description": "how many cart weights were guessed"
            },
            {"name": "level", "type": "nominal"}
          ],
          childAttrName: "Turn",
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
          name: "Carts",
          attrs: [
            {
              "name": "cart",
              "type": "numeric",
              "precision": 0,
              defaultMin: 1,
              defaultMax: 5,
              "description": "which cart in a game"
            },
            {
              "name": "bricks",
              "type": "numeric",
              "precision": 0,
              defaultMin: 0,
              defaultMax: 20,
              "description": "how many bricks on the cart"
            },
            {
              "name": "weight",
              "type": "numeric",
              "precision": 1,
              defaultMin: 0,
              defaultMax: 30,
              "description": "actual weight of the cart"
            },
            {
              "name": "guess",
              "type": "numeric",
              "precision": 1,
              defaultMin: 0,
              defaultMax: 30,
              "description": "your guess for the cart weight"
            },
            {
              "name": "points",
              "type": "numeric",
              "precision": 0,
              defaultMin: 0,
              defaultMax: 100,
              "description": "points earned for this cart"
            },
            {
              "name": "smBricks",
              "type": "numeric",
              "precision": 0,
              defaultMin: 0,
              defaultMax: 10,
              "description": "how many small bricks on the cart"
            }
          ],
          labels: {
            singleCase: "cart",
            pluralCase: "carts",
            singleCaseWithArticle: "a cart",
            setOfCases: "game",
            setOfCasesWithArticle: "a game"
          },
          defaults: {
            xAttr: "bricks",
            yAttr: "weight"
          }
        }
      ]
    }
  }, function () {
    console.log("Initializing game")
  });

  $('#guess_input_box').bind({
    keypress: function (iEvent) {
      return cartGame.model.handleKeypress(this, iEvent);
    },
    keydown: function (iEvent) {
      return iEvent.keyCode !== 9;
    }
  });

  this.beginLevel();
};

/**
 * In UKDE Version A, player automatically moves on to next level after 'winning' a number of games.
 */
CartModel.prototype.beginLevel = function () {
  // Only needed for ukdeA
  if( CartSettings.ukdeMode === 'A') {
    this.ukdeA_numGamesPlayedInLevelWithoutWinning = 0;
    this.ukdeA_hasNextLevelBeenUnlocked = false;
  }
};

/**
 * If we don't already have an open game case, open one now.
 */
CartModel.prototype.openNewGameCase = function () {

  if (!this.openGameCase) {
    this.codapPhone.call({
      action: 'openCase',
      args: {
        collection: "Games",
        values: [this.gameNumber, '', '', this.level.levelName]
      }
    }, function (result) {
      if (result.success) {
        this.openGameCase = result.caseID;
        console.log("I have caseID" + result.caseID);
      } else {
        console.log("Cart Weight: Error calling 'openCase'");
      }
    }.bind(this));
    this.codapPhone.call({
      action: 'logAction',
      args: {
        formatStr: "opencase: gameNumber = %@, level = %@",
        replaceArgs: [this.gameNumber, this.level.levelName]
      }
    });
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
CartModel.prototype.addTurnCase = function () {
  this.eventDispatcher.dispatchEvent(new Event(CartEvents.scoreChange));
  this.openNewGameCase(); // Does nothing if already open

  // Create the new Turn case
  var createCase = function () {
    this.codapPhone.call({
      action: "createCase",
      args: {
        collection: "Carts",
        parent: this.openGameCase,
        values: [this.cartNum, this.bricks, this.weight, this.guess, this.oneScore, this.smallBricks],
        log: true
      }
    });

  }.bind(this);
  createCase();
};

/**
 * Let DG know that the current game is complete.
 * Stash relevant values for the level and check to see if any levels are newly unlocked.
 */
CartModel.prototype.addGameCase = function () {
  var this_ = this;
  this.codapPhone.call({
    action: "closeCase",
    args: {
      collection: "Games",
      caseID: this.openGameCase,
      values: [this.gameNumber, this.score, this.cartNum, this.level.levelName],
      log: true
    }
  });

  this.openGameCase = null;

  if (!this.level.scores)
    this.level.scores = [];
  this.level.scores.push(this.score);
  this.level.highScore = !this.level.highScore ? this.score : Math.max(this.level.highScore, this.score);

  // This game may have unlocked a previously locked level
  this.levelManager.levelsArray.forEach(function (iLevel) {
    if (!iLevel.unlocked && this_.isLevelEnabled(iLevel)) {
      iLevel.unlocked = true;
      this_.ukdeA_hasNextLevelBeenUnlocked = true;
      var tEvent = new Event(CartEvents.levelUnlocked);
      tEvent.levelName = iLevel.levelName;
      this_.eventDispatcher.dispatchEvent(tEvent);
    }
  });

  if( CartSettings.ukdeMode === 'A') {
    if (!this.ukdeA_hasNextLevelBeenUnlocked)
      this.ukdeA_numGamesPlayedInLevelWithoutWinning++;
    if (this.ukdeA_numGamesPlayedInLevelWithoutWinning >= CartSettings.ukdeA_numGamesThreshold) {
      this.eventDispatcher.dispatchEvent(new Event(CartEvents.ukdeA_failedGamesThresholdPassed));
    }
  }
};

/**
 * Prepare for the new game that is beginning.
 */
CartModel.prototype.playGame = function () {
  this.gameNumber++;
  this.score = 0;
  this.cartNum = 0;
  this.brickWeight = this.level.brickWeightMin + Math.random() * this.level.brickWeightRange;
  this.smBrickWeight = this.level.smallBrickWeightMin + Math.random() * this.level.smallBrickWeightRange;
  this.tare = this.level.tareMin + Math.random() * this.level.tareRange;
  if (this.level.integerWeights) {
    this.brickWeight = Math.floor(this.brickWeight);
    this.tare = Math.floor(this.tare);
  }
  else
    this.tare = Math.round(10 * this.tare) / 10;
  this.brickHistory = [];
  this.smallBrickHistory = [];
  this.changeIsBlocked = false;

  this.openNewGameCase();
  this.turnState = 'guessing';
  this.changeGameState('playing'); // Our view will update

  if (CartSettings.ukdeMode === 'B') {
    this.ukdeB_Scores = [];
  }
};

/**
 * Choose a number of bricks and an actual weight.
 */
CartModel.prototype.setupCart = function () {

  function chooseNumBricks(iMin, iRange, iAvoidBy, iHistory) {

    var tNumBricks;

    function isInvalid() {
      var tIsInvalid = false;
      iHistory.forEach(function (iNumBricks) {
        if (Math.abs(tNumBricks - iNumBricks) < iAvoidBy)
          tIsInvalid = true;
      });
      return tIsInvalid;
    }

    iMin = iMin || 0;
    iRange = iRange || 0;
    iAvoidBy = iAvoidBy || 0;
    do {
      tNumBricks = iMin + Math.floor(Math.random() * iRange);
    } while ((iRange > 0) && isInvalid());
    iHistory.push(tNumBricks);
    return tNumBricks;
  }

  function getBrickWeight(iNumBricks, iBrickWeight, iWeightVar) {
    var tWeight = 0;
    for (var i = 0; i < iNumBricks; i++) {
      tWeight += iBrickWeight + iWeightVar * ( Math.random() - Math.random());
    }
    return Math.round(10 * tWeight) / 10;
  }

  // body of setupCart
  this.bricks = chooseNumBricks(this.level.brickNumberMin, this.level.brickNumberRange,
      this.level.avoidBy, this.brickHistory);
  this.smallBricks = chooseNumBricks(this.level.smallBrickNumberMin, this.level.smallBrickNumberRange,
      this.level.avoidBy, this.smallBrickHistory);
  this.weight = this.tare + getBrickWeight(this.bricks, this.brickWeight, this.level.brickWeightVariability) +
      getBrickWeight(this.smallBricks, this.smBrickWeight, this.level.smallBrickWeightVariability);
  this.incrementCart();

  if( CartSettings.ukdeMode === 'B' && this.brickHistory.length > CartSettings.numCarts) {
    this.brickHistory.splice( 0, this.brickHistory.length - CartSettings.numCarts);
    this.smallBrickHistory.splice( 0, this.smallBrickHistory.length - CartSettings.numCarts);
  }
};

/**
 * Increment the goal and let dependents know.
 */
CartModel.prototype.incrementCart = function () {
  var tEvent = new Event(CartEvents.cartChange);
  if( CartSettings.ukdeMode === 'B')
      tEvent.ofText = '';
  this.cartNum++;
  tEvent.cartNum = this.cartNum;
  this.eventDispatcher.dispatchEvent(tEvent);
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
CartModel.prototype.changeGameState = function (iNewState, iIsRestoring) {
  var tEvent = new Event(CartEvents.stateChange);
  tEvent.priorState = this.gameState;
  tEvent.newState = iNewState;
  tEvent.isRestoring = iIsRestoring;
  this.gameState = iNewState;
  this.eventDispatcher.dispatchEvent(tEvent);
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
CartModel.prototype.changeTurnState = function (iNewState) {
  if (this.changeIsBlocked || (this.guess === ''))
    return;

  var tEvent = new Event(CartEvents.turnStateChange);
  tEvent.priorState = this.turnState;
  tEvent.newState = iNewState;
  this.turnState = iNewState;
  this.eventDispatcher.dispatchEvent(tEvent);
};

/**
 * If the number of carts has reached its limit, end the game.
 */
CartModel.prototype.endTurn = function () {
  this.addTurnCase();
  if( CartSettings.ukdeMode === 'B' && this.ukdeB_Scores.length >= CartSettings.numCarts) {
    var tCurrScore = this.getCurrentTotalScore(),
        tNextLevel = this.levelManager.getNextLevel( this.level)
        tThresholdScore = (!tNextLevel || !tNextLevel.prerequisite) ? this.level.ukdeBNeededScore :
                            tNextLevel.prerequisite.score;
    if( tCurrScore >= tThresholdScore) {
      this.endGame();
    }
  }
  else {
    if (this.cartNum >= CartSettings.numCarts)
      this.endGame();
  }
};

/**
 * The current game has just ended, possibly by user action
 */
CartModel.prototype.endGame = function () {
  this.addGameCase();
  this.changeGameState('gameEnded');
};

/**
 * The game button can either end the current game or start a new game
 */
CartModel.prototype.handleGameButton = function () {
  switch (this.gameState) {
    case 'playing':
      this.endGame();
      break;
    case 'gameEnded':
    case 'levelsMode':  // because we've just come from levels dialog
      this.playGame();
      break;
    default:
  }
};

/**
 * The turn button either causes the actual weight of the cart to be measured or to bring in a new cart.
 */
CartModel.prototype.handleTurnButton = function () {
  if (this.gameState !== 'playing')
    return; // Especially to prevent <return> from causing action when the game is not on
  /*if( !CartSettings.ukdeModeHasBeenLogged) {*/
    this.codapPhone.call({
      action: 'logAction',
      args: {
        formatStr: "UKDE Cartweight Mode %@",
        replaceArgs: [CartSettings.ukdeMode]
      }
    });
   /* CartSettings.ukdeModeHasBeenLogged = true;
  }*/

  this.turnButtonHasBeenPressed = true; // So we can tell whether user has yet done anything
  switch (this.turnState) {
    case 'guessing':
      this.changeTurnState('weighing');
      break;
    case 'weighing':
      this.changeTurnState('guessing');
      break;
    default:
  }
};

/**
 * Key was pressed in guess input. Restrict to floating point number. Handle <return> by simulating Check Weight.
 */
CartModel.prototype.handleKeypress = function (iElement, iEvent) {
  var kFloat = /[0-9\.]/g,
      tEvent = iEvent || window.event,
      tCode = tEvent.keyCode || tEvent.which,
      tChar = String.fromCharCode(tCode);
  if (tCode === 13) { // return
    this.isHandlingKeypress = true;
    iElement.blur();
    $('#guess_button').click();
    //this.handleTurnButton();
  }
  else if (tCode === 27) {  // esc
    iElement.blur();
    return false;
  }
  else if (!tEvent.ctrlKey && !tEvent.metaKey && tCode !== 9 && tCode !== 8 && tCode !== 36 && tCode !== 37 && tCode !== 38 &&
      (tCode !== 39 || (tCode === 39 && tChar === "'")) && tCode !== 40) {
    if (tChar.match(kFloat))
      return true;
    else
      return false;
  }
};

/**
 * Key was pressed in guess input
 */
CartModel.prototype.handleBodyKeypress = function (iEvent) {
  if ((iEvent.keyCode === 13) && !this.isHandlingKeypress) {
    this.handleTurnButton();
  }
  this.isHandlingKeypress = false;  // So next time around we'll be able to respond
};

/**
 *
 * @param iGuess{Number}
 */
CartModel.prototype.setGuess = function (iGuess) {
  this.guess = Number(iGuess);
  if (isNaN(this.guess) || (iGuess === '')) {
    this.guess = '';
    this.eventDispatcher.dispatchEvent(new Event(CartEvents.invalidGuess));
  }
};

/**
 * The score for a guess goes from 0 to 100 as the guess goes from within 10% to exactly correct.
 */
CartModel.prototype.updateScore = function () {
  this.oneScore = Math.round(100 - 1000 * Math.abs((this.weight - this.guess) / this.weight));
  if (this.oneScore < 0) this.oneScore = 0;

  this.score += this.oneScore;
  if( CartSettings.ukdeMode === 'B') {
    this.ukdeB_Scores.push( this.oneScore);
    if( this.ukdeB_Scores.length > 5) {
      this.ukdeB_Scores.splice( 0, this.ukdeB_Scores.length - 5);
    }
  }
};

/**
 * What is computed depends on the mode we're in
 */
CartModel.prototype.getRequiredScoreToWin = function () {
  var tNextLevel = this.levelManager.getNextLevel( this.level);
  return tNextLevel.prerequisite ? tNextLevel.prerequisite.score : '';
};

/**
 * What is computed depends on the mode we're in
 */
CartModel.prototype.getCurrentTotalScore = function () {
  var tScore = this.score;
  if( CartSettings.ukdeMode === 'B' && this.ukdeB_Scores.length > 0) {
    tScore = this.ukdeB_Scores.reduce( function( iPrev, iCurr) {
      return iPrev + iCurr;
    });
  }
  return tScore;
};

/**
 * We simply change state and let the view do the work
 */
CartModel.prototype.handleLevelsButton = function () {
  this.changeGameState("levelsMode");
};

/**
 * Called when the user clicks on a level in the levels dialog
 * @param iEvent - a mouse event
 * @param iLevelIndex {Number} The 0-based index of the chosen level
 */
CartModel.prototype.handleLevelButton = function (iEvent, iLevelIndex) {
  var tClickedLevel = CartLevels[iLevelIndex];
  if (iEvent.shiftKey && iEvent.altKey) {
    tClickedLevel.unlocked = true;
  }
  if (this.isLevelEnabled(tClickedLevel)) {
    this.level = tClickedLevel;
    this.beginLevel();
    this.playGame();
  }
};

/**
 * The logic for whether a level is enabled lives here in the model, not in the level manager.
 *
 * @param iLevelSpec
 * @return {Boolean}
 */
CartModel.prototype.isLevelEnabled = function (iLevelSpec) {
  /**
   * Does the array of scores contain enough in a row above the given threshold?
   * @param iRequiredNumInARow {Number}
   * @param iThreshold {Number}
   * @param iScores {Array} of {Number}
   * @return {Boolean}
   */
  function gotEnoughHighScoresInARow(iRequiredNumInARow, iThreshold, iScores) {
    if (!iRequiredNumInARow)
      return true;  // Not required to get any in a row
    if (!iScores || !iScores.length)
      return false; // Didn't exist or wasn't an array with entries
    var tNumInARow = 0;
    iScores.forEach(function (iScore) {
      if (tNumInARow >= iRequiredNumInARow)
        return;
      if (iScore >= iThreshold)
        tNumInARow++;
      else
        tNumInARow = 0;
    });
    return tNumInARow >= iRequiredNumInARow;
  }

  var tEnabled = true,
      tPrereq = iLevelSpec.prerequisite,
      tPrereqLevel;
  if (tPrereq && !iLevelSpec.unlocked) {
    tPrereqLevel = (tPrereq.level) ? this.levelManager.getLevelNamed(tPrereq.level) : null;
    if (tPrereqLevel.highScore && (tPrereqLevel.highScore >= tPrereq.score))
      tEnabled = gotEnoughHighScoresInARow(tPrereq.inARow, tPrereq.score, tPrereqLevel.scores);
    else
      tEnabled = false;
  }

  return tEnabled;
};

/**
 * Called when we want game to move to next level regardless
 *
 */
CartModel.prototype.moveToNextLevel = function () {
  var tNextLevel = this.levelManager.getNextLevel( this.level);
  if( tNextLevel) {
    tNextLevel.unlocked = true;
    this.level = tNextLevel;
    this.beginLevel();
    this.playGame();
  }
};

/**
 Saves the state of the game into a stoage object, which is returned from this method.
 This storage object is then used to restore the state of the game when it is passed
 back to the restoreState method.
 @returns  {Object}    The object in which the state of the game is stored
 { success: {Boolean}, state: {Object} }
 */
CartModel.prototype.saveState = function () {
  return {
    success: true,
    state: {
      gameNumber: this.gameNumber,
      currentLevel: this.level && this.level.levelName,
      levelsMap: this.levelManager.getLevelsLockState(),
      ukdeMode: CartSettings.ukdeMode,
      turnButtonHasBeenPressed: this.turnButtonHasBeenPressed
    }
  };

  /*  This earlier attempt saved all game state, not just levels.
   Left here commented out in case we ever want to return to it.

   // If we're guessing, then we've generated the next cart already,
   // but that cart was never weighed (and never will be).
   var completedCarts = this.turnState === 'guessing'
   ? Math.max( 0, this.cartNum - 1)
   : this.cartNum,
   state = {
   gameState: this.gameState,
   turnState: this.turnState === 'weighing' ? 'guessing' : this.turnState,
   gameNumber: this.gameNumber,
   level: this.level && this.level.levelName,
   score: this.score,
   cartNum: completedCarts,
   tare: this.tare,
   brickWeight: this.brickWeight,
   smBrickWeight: this.smBrickWeight,
   // Only include completed entries in the saved history
   brickHistory: this.brickHistory.slice( 0, completedCarts),  // copy the array
   smallBrickHistory: this.smallBrickHistory.slice( 0, completedCarts) // copy the array
   };
   if( this.openGameCase)
   state._links_ = { openGameCase: this.openGameCase };

   return { success: true, state: state };
   */
};

/**
 Restores the state of the game from the specified game state, which should have
 been created by the CartModel.prototype.saveState() method.
 @param    {Object}  iState -- The saved state object
 @returns  {Object}  { success: true }
 */
CartModel.prototype.restoreState = function (iState) {
  if (iState) {
    if( iState.turnButtonHasBeenPressed) {
      // Restore the ukdeMode that was saved rather replacing the randomly chosen one
      CartSettings.ukdeMode = iState.ukdeMode;
      this.turnButtonHasBeenPressed = true;
    }
    if (iState.gameNumber)
      this.gameNumber = iState.gameNumber;
    if (iState.currentLevel) {
      var level = this.levelManager.getLevelNamed(iState.currentLevel);
      if (level) this.level = level;
    }
    if (iState.levelsMap)
      this.levelManager.setLevelsLockState(iState.levelsMap);
    this.playGame();
  }
  return {success: true};

  /*  This earlier attempt saved all game state, not just levels.
   Left here commented out in case we ever want to return to it.

   this.turnState = iState.turnState;
   if( iState._links_ && iState._links_.openGameCase)
   this.openGameCase = iState._links_.openGameCase;
   this.gameNumber = iState.gameNumber;
   this.level = this.levelManager.getLevelNamed( iState.level);
   this.score = iState.score;
   this.cartNum = iState.cartNum;
   this.tare = iState.tare;
   this.brickWeight = iState.brickWeight;
   this.smBrickWeight = iState.smBrickWeight;
   if( iState.brickHistory)
   this.brickHistory = iState.brickHistory.slice(0); // copy the array
   if( iState.smallBrickHistory)
   this.smallBrickHistory = iState.smallBrickHistory.slice(0); // copy the array
   this.changeGameState( iState.gameState, true);
   return { success: true };
   */
};


