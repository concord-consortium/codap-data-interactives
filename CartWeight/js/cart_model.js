"use strict";
// ==========================================================================
// Project:   Cart
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global $, cartGame, CartLevels, CartSettings, Event, EventDispatcher, LevelManager */

/**
 * @fileoverview Defines CartModel
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

function CartModel()
{
  this.eventDispatcher = new EventDispatcher();
  this.levelManager = new LevelManager( CartLevels, this, 'cartGame.model.handleLevelButton(event, ##);',
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
}

/**
 * Inform DG about this game
 */
CartModel.prototype.initialize = async function()
{
  console.log("CartWeight initialize: getting interactive state");
  let interactiveState = codapInterface.getInteractiveState();
  console.log("CartWeight initialize: got state:", interactiveState);

  // Create the dataset if it doesn't already exist
  console.log("CartWeight initialize: about to sendRequest for dataContextList");
  const iResult = await codapInterface.sendRequest({
    action: 'get',
    resource: 'dataContextList'
  });
  console.log("CartWeight initialize: got dataContextList:", iResult);
  if (iResult.success && !iResult.values.some(ds => [ds.name, ds.title].includes("Games/Carts"))) {
    console.log("CartWeight initialize: about to createDataset");
    await codapHelper.createDataset({
      name: "Games/Carts",
      collections: [
        {
          name: "Games",
          title: "Games",
          attrs: [
            {"name": "game", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 5, "description": "game number"},
            {"name": "score", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 300, "description": "game score"},
            {"name": "carts", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 5, "description": "how many cart weights were guessed"},
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
          name: "Carts",
          title: "Carts",
          parent: "Games",
          attrs: [
            {"name": "cart", "type": "numeric", "precision": 0, defaultMin: 1, defaultMax: 5, "description": "which cart in a game"},
            {"name": "bricks", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 20, "description": "how many bricks on the cart"},
            {"name": "weight", "type": "numeric", "precision": 1, defaultMin: 0, defaultMax: 30, "description": "actual weight of the cart"},
            {"name": "guess", "type": "numeric", "precision": 1, defaultMin: 0, defaultMax: 30, "description": "your guess for the cart weight"},
            {"name": "points", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 100, "description": "points earned for this cart"},
            {"name": "smBricks", "type": "numeric", "precision": 0, defaultMin: 0, defaultMax: 10, "description": "how many small bricks on the cart"}
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
      ],
      type: 'DG.GameContext',
    });
  }

  $('#guess_input_box' ).bind({
    keypress: function( iEvent) {
      return cartGame.model.handleKeypress(this, iEvent);
    },
    keydown: function( iEvent) {
      return iEvent.keyCode !== 9;
    }
  });

  console.log("CartWeight initialize: about to registerForDocumentChanges");
  notificatons.registerForDocumentChanges();
  console.log("CartWeight initialize: about to restoreState");
  if (interactiveState) {
    this.restoreState(interactiveState);
  }
  console.log("CartWeight initialize: complete");
};

/**
 * If we don't already have an open game case, open one now.
 */
CartModel.prototype.openNewGameCase = async function()
{
  if( !this.openGameCase) {
    await codapInterface.sendRequest({
      action: 'create',
      resource: "dataContext[Games/Carts].collection[Games].case",
      values: [
        {
          values: {
            game: this.gameNumber,
            score: 0,
            carts: 0,
            level: this.level.levelName
          }
        }
      ]
    }).then(function(iResult) {
      if(iResult.success) {
        this.openGameCase = iResult.values[0].id;
        console.log("I have caseID " + iResult.values[0].id);
      } else {
        console.log("Cart Weight: Error creating new game case");
      }
    }.bind(this));
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
CartModel.prototype.addTurnCase = async function()
{
  this.eventDispatcher.dispatchEvent( new Event( "scoreChange"));

  var values = {
    cart: this.cartNum,
    bricks: this.bricks,
    weight: this.weight,
    guess: this.guess,
    points: this.oneScore,
    smBricks: this.smallBricks
  };

  if (this.cartNum === 1) {
    // Update the auto-created first cart case
    var iResult = await codapInterface.sendRequest({
      action: 'get',
      resource: 'dataContext[Games/Carts].collection[Games].caseByID[' + this.openGameCase + ']'
    });
    if (iResult.success) {
      var idOfFirstCartCase = iResult.values.case.children[0];
      await codapInterface.sendRequest({
        action: 'update',
        resource: "dataContext[Games/Carts].collection[Carts].caseByID[" + idOfFirstCartCase + "]",
        values: {
          values: values
        }
      });
    } else {
      console.log("Cart Weight: Error finding existing cart case");
    }
  } else {
    // Create a new Cart case
    await codapInterface.sendRequest({
      action: "create",
      resource: "dataContext[Games/Carts].collection[Carts].case",
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
CartModel.prototype.addGameCase = async function()
{
  var this_ = this;
  var iResult = await codapInterface.sendRequest({
    action: 'update',
    resource: `dataContext[Games/Carts].collection[Games].caseByID[${this.openGameCase}]`,
    values: {
      values: {
        game: this.gameNumber,
        score: this.score,
        carts: this.cartNum,
        level: this.level.levelName
      }
    }
  });
  if(!iResult.success) {
    console.log("Cart Weight: Error updating game case");
  }

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
CartModel.prototype.playGame = async function()
{
  console.log("CartWeight: playGame called");
  try {
  this.gameNumber++;
  this.score = 0;
  this.cartNum = 0;
  this.brickWeight = this.level.brickWeightMin + Math.random() * this.level.brickWeightRange;
  this.smBrickWeight = this.level.smallBrickWeightMin + Math.random() * this.level.smallBrickWeightRange;
  this.tare = this.level.tareMin + Math.random() * this.level.tareRange;
  if( this.level.integerWeights) {
    this.brickWeight = Math.floor( this.brickWeight);
    this.tare = Math.floor( this.tare);
  }
  else
    this.tare = Math.round( 10 * this.tare) / 10;
  this.brickHistory = [];
  this.smallBrickHistory = [];
  this.changeIsBlocked = false;

  this.openNewGameCase();  // fire and forget, matching old callback-based behavior
  this.turnState = 'guessing';
  console.log("CartWeight: about to changeGameState to 'playing'");
  this.changeGameState( 'playing'); // Our view will update
  console.log("CartWeight: changeGameState completed");
  this.updateInteractiveState();
  } catch(e) {
    console.error("CartWeight: error in playGame:", e);
  }
};

/**
 * Choose a number of bricks and an actual weight.
 */
CartModel.prototype.setupCart = function() {

  function chooseNumBricks( iMin, iRange, iAvoidBy, iHistory) {

    var tNumBricks;

    function isInvalid() {
      var tIsInvalid = false;
      iHistory.forEach( function( iNumBricks) {
        if( Math.abs( tNumBricks - iNumBricks) < iAvoidBy)
          tIsInvalid = true;
      });
      return tIsInvalid;
    }

    iMin = iMin || 0;
    iRange = iRange || 0;
    iAvoidBy = iAvoidBy || 0;
    do {
      tNumBricks = iMin + Math.floor(Math.random() * iRange);
    } while((iRange > 0) && isInvalid());
    iHistory.push( tNumBricks);
    return tNumBricks;
  }

  function getBrickWeight( iNumBricks, iBrickWeight, iWeightVar) {
    var tWeight = 0;
    for( var i = 0; i < iNumBricks; i++) {
      tWeight += iBrickWeight + iWeightVar * ( Math.random() - Math.random());
    }
    return Math.round(10 * tWeight) / 10;
  }
  // body of setupCart
  this.bricks = chooseNumBricks( this.level.brickNumberMin, this.level.brickNumberRange,
                                  this.level.avoidBy, this.brickHistory);
  this.smallBricks = chooseNumBricks( this.level.smallBrickNumberMin, this.level.smallBrickNumberRange,
                                    this.level.avoidBy, this.smallBrickHistory);
  this.weight = this.tare + getBrickWeight( this.bricks, this.brickWeight, this.level.brickWeightVariability) +
                      getBrickWeight( this.smallBricks, this.smBrickWeight, this.level.smallBrickWeightVariability);
  this.incrementCart();
};

/**
 * Increment the goal and let dependents know.
 */
CartModel.prototype.incrementCart = function()
{
  var tEvent = new Event('cartChange');
  this.cartNum++;
  tEvent.cartNum = this.cartNum;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
CartModel.prototype.changeGameState = function( iNewState, iIsRestoring)
{
  console.log("CartWeight: changeGameState from '" + this.gameState + "' to '" + iNewState + "'");
  var tEvent = new Event('stateChange');
  console.log("CartWeight: Event created, type:", tEvent.type, "instanceof Event:", tEvent instanceof Event);
  tEvent.priorState = this.gameState;
  tEvent.newState = iNewState;
  tEvent.isRestoring = iIsRestoring;
  this.gameState = iNewState;
  var listeners = this.eventDispatcher.eventListeners['stateChange'];
  console.log("CartWeight: stateChange listeners:", listeners ? listeners.length : 'none');
  this.eventDispatcher.dispatchEvent( tEvent);
  console.log("CartWeight: dispatchEvent completed");
};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
CartModel.prototype.changeTurnState = function( iNewState)
{
  if(this.changeIsBlocked || (this.guess === ''))
    return;

  var tEvent = new Event('turnStateChange');
  tEvent.priorState = this.turnState;
  tEvent.newState = iNewState;
  this.turnState = iNewState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * If the number of carts has reached its limit, end the game.
 */
CartModel.prototype.endTurn = function()
{
  this.addTurnCase();
  if( this.cartNum >= CartSettings.numCarts)
    this.endGame();
};

/**
 * The current game has just ended, possibly by user action
 */
CartModel.prototype.endGame = function()
{
  this.addGameCase();
  this.changeGameState( 'gameEnded');
};

/**
 * The game button can either end the current game or start a new game
 */
CartModel.prototype.handleGameButton = function()
{
  switch( this.gameState) {
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
CartModel.prototype.handleTurnButton = function()
{
  if( this.gameState !== 'playing')
    return; // Especially to prevent <return> from causing action when the game is not on
  switch( this.turnState) {
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
CartModel.prototype.handleKeypress = function( iElement, iEvent)
{
  var kFloat = /[0-9\.]/g,
      tEvent = iEvent || window.event,
      tCode = tEvent.keyCode || tEvent.which,
      tChar = String.fromCharCode( tCode);
  if( tCode === 13) { // return
    this.isHandlingKeypress = true;
    iElement.blur();
    $('#guess_button').click();
  }
  else if( tCode === 27) {  // esc
    iElement.blur();
    return false;
  }
  else if( !tEvent.ctrlKey && !tEvent.metaKey && tCode!==9 && tCode!==8 && tCode!==36 && tCode!==37 && tCode!==38 &&
           (tCode!==39 || (tCode===39 && tChar==="'")) && tCode!==40) {
    if( tChar.match(kFloat))
      return true;
    else
      return false;
  }
};

/**
 * Key was pressed in guess input
 */
CartModel.prototype.handleBodyKeypress = function( iEvent)
{
  if( (iEvent.keyCode === 13) && !this.isHandlingKeypress) {
    this.handleTurnButton();
  }
  this.isHandlingKeypress = false;  // So next time around we'll be able to respond
};

/**
 *
 * @param iGuess{Number}
 */
CartModel.prototype.setGuess = function( iGuess)
{
  this.guess = Number(iGuess);
  if( isNaN( this.guess) || (iGuess === '')) {
    this.guess = '';
    this.eventDispatcher.dispatchEvent( new Event( "invalidGuess"));
  }
};

/**
 * The score for a guess goes from 0 to 100 as the guess goes from within 10% to exactly correct.
 */
CartModel.prototype.updateScore = function()
{
  this.oneScore = Math.round(100 - 1000 * Math.abs( (this.weight - this.guess)/this.weight ));
  if (this.oneScore < 0 ) this.oneScore = 0;

  this.score += this.oneScore;
};

/**
 * We simply change state and let the view do the work
 */
CartModel.prototype.handleLevelsButton = function()
{
  this.changeGameState( "levelsMode");
};

/**
 * Called when the user clicks on a level in the levels dialog
 * @param iEvent - a mouse event
 * @param iLevelIndex {Number} The 0-based index of the chosen level
 */
CartModel.prototype.handleLevelButton = function( iEvent, iLevelIndex)
{
  var tClickedLevel = CartLevels[ iLevelIndex];
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
CartModel.prototype.isLevelEnabled = function( iLevelSpec)
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
CartModel.prototype.updateInteractiveState = function() {
  var currentInteractiveState = {
    gameNumber: this.gameNumber,
    currentLevel: this.level && this.level.levelName,
    levelsMap: this.levelManager.getLevelsLockState()
  };
  codapInterface.updateInteractiveState(currentInteractiveState);
};

/**
  Restores the state of the game from the specified game state.
  @param    {Object}  iState -- The saved state object
  @returns  {Object}  { success: true }
 */
CartModel.prototype.restoreState = function( iState) {
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
