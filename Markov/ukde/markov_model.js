// ==========================================================================
// Project:   Markov
// Copyright: ©2012 KCP Technologies, Inc.
// ==========================================================================
/*global Event, EventDispatcher, KCPCommon, LevelManager, MarkovLevels, MarkovSettings, StrategyEditor */
/**
 * @fileoverview Defines MarkovModel
 * @author bfinzer@kcptech.com (William Finzer)
 * @preserve (c) 2012 KCP Technologies, Inc.
 */

/* codapPhone is initialized in index.html when game is initialized*/

function MarkovModel(codapPhone, iDoAppCommandFunc)
{
  this.codapPhone = codapPhone;
  //this.doAppCommandFunc = iDoAppCommandFunc;
  
  this.eventDispatcher = new EventDispatcher();
  this.levelManager = new LevelManager( MarkovLevels, this, 'MarkovGame.model.handleLevelButton(event, ##);',
                                        this, this.isLevelEnabled);
  this.levelManager.unlockAll();

  this.gameState = "welcome";  // "welcome" or "playing" or "gameEnded" or "levelsMode"
  this.turnState = 'waiting'; // 'waiting' or 'moving' or 'abort'

  // DG vars
  this.openGameCase = null;
  
  // game vars
  this.gameNumber = 0;
  this.level = this.levelManager.getStartingLevel();
  this.winner = '';

  // turn vars
  this.turn = 0;
  this.marMove = 'P'; // Necessary seed for strategy to be able to work on first turn
  this.yourMove = '';
  this.result = '';
  this.up_down = 0;
  this.mar_prev_2 = 'PP'; // A seed so a strategy can begin working right away

  this.autoplay = false;
  this.animTime = MarkovSettings.kAnimTime; // milliseconds for each phase

  // UKDE

  // other
  this.hasChangedLevels = false;
  this.results = ['lose', 'win'];
  this.up_downs = [ -1, 1]; // In autoplay gets multiplied by weight
  this.outcomes = { // Your move followed by Markov's move
    RR: 0, RP: 0, RS: 1,
    PP: 0, PR: 1, PS: 0,
    SS: 0, SR: 0, SP: 1
  };

  this.strategy = {};
  var this_ = this;
  KCPCommon.keys( this.outcomes ).forEach( function( iKey) {
    this_.strategy[iKey] = { move: '', weight: 2 };
  });

}

/**
 * Inform DG about this game
 */
/* Called from index.html*/
MarkovModel.prototype.initialize = function()
{
    this.codapPhone.call({
        action:'initGame',
        args: {
            name: "Markov",
            version: "2.1",
            dimensions: { width: 550, height: 315 },
            collections: [
                {
                    name: "Games",
                    attrs: [
                        {"name": "game" , "type" : "numeric" , "precision" : 0, defaultMin: 1, defaultMax: 5, "description": "game number" } ,
                        {"name": "turns" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 10, "description": "number of turns in the game"   } ,
                        {"name": "winner", "type" : "nominal", 'description': 'who won? You or Markov?' },
                        {"name": "level", "type" : "nominal", 'description': 'what level of the game was played' }
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
                        { "name" : "turn" , "type" : "numeric" , "precision" : 0, defaultMin: 0, defaultMax: 10, "description": "the turn number in the game"   } ,
                        { "name" : "markovs_move" , "type" : "nominal" , "description": "the move markov made this turn",
                            colormap: { "R":'red', "P":'blue', "S":'green' }},
                        { "name" : "your_move" , "type" : "nominal" , "description": "the move you made this turn",
                            colormap: { "R":'red', "P":'blue', "S":'green' }},
                        { "name" : "result" , "type" : "nominal" , "description": "did you win or lose this turn?"   } ,
                        { "name" : "up_down" , "type" : "numeric" , "precision" : 0, defaultMin: -1, defaultMax: 1, "description": "the number of steps up or down Madeline moved"   } ,
                        { "name" : "previous_2_markov_moves" , "type" : "nominal" , "description": "the two moves Markov made prior to this one"   }
                    ],
                    defaults: {
                        xAttr: "previous_2_markov_moves",
                        yAttr: "markovs_move"
                    }
                }
            ]
        }
    }, function(){console.log("Initializing game")});
  this.adjustLevelStateForUKDE();
};

/**
 * For UKDE there are three levels. In ukdeMode === 'B', we lock the 2nd and 3rd levels, requiring the player to
 * complete a level in fewer than ukdeBTooManyMoves to go on.
 */
MarkovModel.prototype.adjustLevelStateForUKDE = function()
{
  if( MarkovSettings.ukdeMode === 'B') {
    this.levelManager.setLevelsLockState({
      'Deimos': false,
      'Phobos': false
    });
  }
};

/**
 * If we don't already have an open game case, open one now.
 */
/* Called by playGame(), and addTurnCase() in this model*/
MarkovModel.prototype.openNewGameCase = function()
{
  if( !this.openGameCase) {
    this.codapPhone.call({
        action:'openCase',
        args:{
            collection: "Games",
            values:[this.gameNumber, '', '', this.level.levelName],
            log: true
        }
    }, function(result){
        if(result && result.success){
            this.openGameCase = result.caseID;
            this.changeGameState( 'playing'); // Our view will update
            this.changeTurnState('waiting');

            console.log("I have caseID" + result.caseID);
        } else {
            console.log("Markov: Error calling 'openCase': " + JSON.stringify(result));
        }
    }.bind(this));
  }
};

/**
 * Pass DG the values for the turn that just got completed
 */
/* Called by endTurn() in this model */
MarkovModel.prototype.addTurnCase = function()
{
  //this.eventDispatcher.dispatchEvent( new Event( "scoreChange"));
  this.openNewGameCase(); // Does nothing if already open

  // Create the new Turn case
    var createCase = function(){
        this.codapPhone.call({
            action: "createCase",
            args: {
                collection:"Turns",
                parent: this.openGameCase,
                values:
                    [
                        this.turn,
                        this.marMove,
                        this.yourMove,
                        this.result,
                        this.up_down,
                        (this.turn > 2) ? this.mar_prev_2 : ''
                    ],
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
/* Called by endGame() in this model*/
MarkovModel.prototype.addGameCase = function()
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
                  this.turn,
                  this.winner,
                  this.level.levelName
              ],
          log: true
      }
  });

  this.openGameCase = null;

  if( MarkovSettings.ukdeMode === 'B') {
    var tEvent;
    if( this.winner === 'you' && this.turn <= MarkovSettings.ukdeBTooManyMoves) {
      // If there is another level to go to, do so
      var tNextLevel = this.levelManager.getNextLevel( this.level);
      if( tNextLevel) {
        tNextLevel.unlocked = true;
        tEvent = new Event("levelUnlocked");
        tEvent.levelName = tNextLevel.levelName;
        this.eventDispatcher.dispatchEvent( tEvent);
        this.level = tNextLevel;
      }
    }
    else {
      // We may be able to give a hint here
      tEvent = new Event("timeForAHint");
      this.eventDispatcher.dispatchEvent( tEvent);
    }
  }
    /*
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
    */
};

/**
 * Prepare for the new game that is beginning.
 */
/*playGame is called from index.html as an onclick event on the Play game button*/
MarkovModel.prototype.playGame = function()
{
  this.gameNumber++;
  this.turn = 0;
  this.autoplay = false;
  // this.mar_prev_2 = '';  We don't re-initialize so last two moves of previous game apply to new game
  this.winner = '';

  this.openNewGameCase(); //codapPhone event

};

/**
 * Dispatch an event with change of state information
 * @param iNewState {String}
 */
/* Called by playGame() in this model*/
MarkovModel.prototype.changeGameState = function( iNewState)
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
/* Called by playGame(), endTurn(), endGame() in this model */
MarkovModel.prototype.changeTurnState = function( iNewState)
{
  var tEvent = new Event('turnStateChange');
  tEvent.newTurnState = iNewState;
  this.turnState = iNewState;
  this.eventDispatcher.dispatchEvent( tEvent);
};

/**
 * The view has told us the turn is over.
 * @param iDogState{String} - one of 'top', 'middle', 'bottom'
 */
MarkovModel.prototype.endTurn = function( iDogState)
{
  if( this.turnState !== 'waiting') {
    this.addTurnCase();
    this.changeTurnState('waiting');
    switch( iDogState) {
      case 'middle':
        // Nothing to do here
        break;
      case 'top':
        this.winner = 'you';
        this.endGame();
        break;
      case 'bottom':
        this.winner = 'Markov';
        this.endGame();
        break;
    }
    this.changeTurnState('waiting');
    if(!this.abortingFromMove && this.autoplay)
      this.autoplay = this.autoTurn();

    if( !this.autoplay) {
      var tEvent = new Event('autoplayChange');
      tEvent.state = 'off';
      this.eventDispatcher.dispatchEvent( tEvent);
    }
  }
};

/**
 * The current game has just ended, possibly by user action
 */
MarkovModel.prototype.endGame = function()
{
  if( this.turnState === 'moving') {  // user End Game before move is finished
    this.changeTurnState('abort');
  }
  this.addGameCase();
  this.changeGameState( 'gameEnded');
};

/**
 * The game button can either end the current game or start a new game
 */
MarkovModel.prototype.handleGameButton = function()
{
  switch( this.gameState) {
    case 'playing':
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
 *
 * @param iMove - One of 'R', 'P', 'S'. Result of user button press.
 */
MarkovModel.prototype.move = function( iMove)
{
  var this_ = this;

  function chooseMarMove() {
    var tPrev = this_.mar_prev_2,
        tLength = tPrev.length,
        tChoiceString = (tLength === 2) ? this_.level[ tPrev] : 'RPS',
        tChoiceLength = tChoiceString.length,
        tChoice = tChoiceString.charAt( Math.floor( tChoiceLength * Math.random()));
    return tChoice;
  }

  if( this.turnState === 'moving') { // user can make next move before previous one is complete
    this.abortingFromMove = true;
    this.changeTurnState('abort');
    this.abortingFromMove = false;
  }

  if( this.gameState !== 'playing')
    return;

  this.turn++;
  this.yourMove = iMove;
  if( this.mar_prev_2.length > 1)
    this.mar_prev_2 = this.mar_prev_2.charAt( 1);
  this.mar_prev_2 += this.marMove;
  this.marMove = chooseMarMove();
  var tOutcome = this.outcomes[ this.yourMove + this.marMove];
  this.result = this.results[ tOutcome];
  this.up_down = this.up_downs[ tOutcome];
  if( this.autoplay)
    this.up_down *= this.strategy[ this.mar_prev_2].weight;
  this.changeTurnState( 'moving');
  this.codapPhone.call({
    action: 'logAction',
    args: {
      formatStr: "UKDE Markov Mode %@",
      replaceArgs: [MarkovSettings.ukdeMode]
    }
  });
};

/**
 * Key was pressed in guess input
 */
MarkovModel.prototype.handleBodyKeypress = function( iEvent)
{
  var tCharCode = iEvent.charCode;
  switch( tCharCode) {
    case 'p'.charCodeAt(0):
    case 'r'.charCodeAt(0):
    case 's'.charCodeAt(0):
      this.move( String.fromCharCode( tCharCode - 32));
      return true;
  }
  return true;
};

/**
 * Bring up the dialog with which the user can devise their strategy.
 */
MarkovModel.prototype.handleStrategyButton = function()
{
  var this_ = this,
      tSavedState = this.gameState;

  function finishedEditing() {
    this_.gameState = tSavedState;
    this_.eventDispatcher.dispatchEvent( new Event('finishedEditingStrategy'));
  }

  this.gameState = 'editingStrategy';
  this.autoplay = false;
  var tEvent = new Event('autoplayChange');
  tEvent.state = 'off';
  this.eventDispatcher.dispatchEvent( tEvent);
  var strategyEditor = new StrategyEditor( this.strategy, finishedEditing );
  var logAction = function(){
        MarkovGame.model.codapPhone.call({
            action:'logAction',
            args:{formatStr: "setStrategy:"}
        });
    }.bind(this);
    logAction();

};

/**
 * User has pressed Autoplay button. If there's a strategy, we push the disks automatically
 */
MarkovModel.prototype.handleAutoButton = function()
{
  var tEvent = new Event('autoplayChange');
  this.autoplay = !this.autoplay;
  tEvent.state = this.autoplay ? 'on' : 'off';
  this.eventDispatcher.dispatchEvent( tEvent);
  if( this.autoplay)
    this.autoplay = this.autoTurn();
  var logAction = function(){
      MarkovGame.model.codapPhone.call({
          action:'logAction',
          args:{formatStr: "autoPlay: " + JSON.stringify( { state: tEvent.state})}
      });
  }.bind(this);
    logAction();
};

/**
 * Send out the current disk using the user's strategy. Return true if it's appropriate for another disk after
 * this one.
 * @return {Boolean}
 */
MarkovModel.prototype.autoTurn = function()
{
  var tResult = false,
      tMove = this.getAutoMove();
  if( tMove !== '') {
    this.move(tMove);
    tResult = true;
  }

  return tResult;
};

/**
 * If Markov has two previous moves, and our strategy has an entry for that, return it.
 * @return {Boolean}
 */
MarkovModel.prototype.getAutoMove = function()
{
  var tNumPrevious = this.mar_prev_2.length,
      tFormerPrev2 = this.mar_prev_2,
      tCurrPrev2,
      tStratMove,
      tResult = '';
  if( tNumPrevious >= 1) {
    tCurrPrev2 = tFormerPrev2[ tNumPrevious - 1] + this.marMove;
    tStratMove = this.strategy[ tCurrPrev2];
    tResult = tStratMove ? tStratMove.move : '';
  }

  return tResult;
};

/**
 * We simply change state and let the view do the work
 */
MarkovModel.prototype.handleLevelsButton = function()
{
  this.changeGameState( "levelsMode");
};

/**
 * Called when the user clicks on a level in the levels dialog
 * @param iEvent - a mouse event
 * @param iLevelIndex {Number} The 0-based index of the chosen level
 */
MarkovModel.prototype.handleLevelButton = function( iEvent, iLevelIndex)
{
  var tClickedLevel = MarkovLevels[ iLevelIndex],
      tLevelIsChanging = tClickedLevel !== this.level;
  if( iEvent.shiftKey && iEvent.altKey) {
      tClickedLevel.unlocked = true;
  }
  if( this.isLevelEnabled( tClickedLevel)) {
    this.level = tClickedLevel;
    this.playGame();
    if( tLevelIsChanging && !this.hasChangedLevels) {
      this.hasChangedLevels = true;
      this.eventDispatcher.dispatchEvent( new Event( "firstTimeLevelChanged"));
    }
  }
};

/**
 * For Markov, it's just a matter of whether the level is unlocked
 *
 * @param iLevelSpec
 * @return {Boolean}
 */
MarkovModel.prototype.isLevelEnabled = function( iLevelSpec)
{
   return iLevelSpec.unlocked;
};

/**
  Saves the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @returns  {Object}    { success: {Boolean}, state: {Object} }
 */
MarkovModel.prototype.saveGameState = function() {
  return {
            success: true,
            state: {
              gameNumber: this.gameNumber,
              currentLevel: this.level && this.level.levelName,
              levelsMap: this.levelManager.getLevelsLockState(),
              strategy: this.strategy,
              ukdeMode: MarkovSettings.ukdeMode
            }
          };
};

/**
  Restores the game state for the game. Currently, only level information
  is saved so that the user need not unlock levels again, for instance.
  @param    {Object}    iState -- The state as saved previously by saveGameState().
 */
MarkovModel.prototype.restoreGameState = function( iState) {
  if( iState) {
    if( iState.gameNumber) {
      // Restore the ukdeMode that was saved rather replacing the randomly chosen one
      MarkovSettings.ukdeMode = iState.ukdeMode;
      this.gameNumber = iState.gameNumber;
      if( iState.currentLevel) {
        var level = this.levelManager.getLevelNamed( iState.currentLevel);
        if( level) this.level = level;
      }
      if( iState.levelsMap)
        this.levelManager.setLevelsLockState( iState.levelsMap);
      if( iState.strategy)
        this.strategy = iState.strategy;
      if( this.gameNumber) {
        this.playGame();
      }
    }
    else
        this.adjustLevelStateForUKDE();

  }
  return { success: true };
};

