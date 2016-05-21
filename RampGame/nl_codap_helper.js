/**
 * This file is meant to be adapted to particular NetLogo Web standalone models that will be modified
 * to work with CODAP. The functions that require changes are first in the file.
 */

/**
 * This function communicates to CODAP the structure of the data and a few other things CODAP would
 * like to know.
 *
 * You should replace things bracketed by double-dashes with what applies to your simulation.
 */
function codapCallInitGame() {
  if( !window.codapPhone) {
    console.log( 'Initializing codapPhone ...');
    window.codapPhone = new iframePhone.IframePhoneRpcEndpoint(codapDoCommand, "codap-game", window.parent);
    window.setTimeout( codapCallInitGame, 1000);
    return;
  }
  if( !window.codapPhone.isConnected()) {
    window.setTimeout( codapCallInitGame, 1000);
    console.log('Waiting for codapPhone connection ...');
    return;
  }
  window.codapPhone.call({
    action: 'initGame',
    args: {
      name: "Ramp Game", // This will appear in the titlebar of the model's iFrame
      dimensions: {width: 700, height: 630},  // Modify these to fit the size of the simulation
      version: 'v6.0',
      collections: [
      /**
       * There is one collection. It contains the result of each move.
       */
        {
          name: "Moves", // Must match 'childAttrName:' field above. Often 'Ticks'
          attrs: [
          /**
           * The attributes here correspond to the values collected for each move
           */
            {
              name: "Challenge",
              type: "numeric",
              description: "The level reached so far",
              precision: 0
            },
            {
              name: 'Step',
              type: 'numeric',
              description: "Each challenge has a number of steps",
              precision: 0
            },
            {
              name: 'Start_Height',
              type: 'numeric',
              unit: 'meters',
              description: "The vertical distance above the floor the car starts at",
              precision: 2
            },
            {
              name: 'Friction',
              type: 'numeric',
              description: "A measure of how quickly the car slows down on the level",
              precision: 2
            },
            {
              name: 'Mass',
              type: 'numeric',
              unit: 'grams',
              description: "The mass of the car",
              precision: 2
            },
            {
              name: 'End_Distance',
              type: 'numeric',
              unit: 'meters',
              description: "How far the car traveled along the floor before stopping",
              precision: 2
            }
          ],
          labels: {
            singleCase: "move",
            pluralCase: "moves",
            singleCaseWithArticle: "a move",
            setOfCases: "game",
            setOfCasesWithArticle: "a game"
          }
        }
      ]
    }
  });
}

/**
 * CODAP issues two commands, one to saveState and one to restoreState. The only thing you have to
 * change here is the list of names of global state variables.
 * @param iCommandObj
 * @param iCallback
 */
function codapDoCommand(iCommandObj, iCallback) {

  var stateVars = [
    'level', // The first state variable, run-number, is the one we defined above
    'step',  // How many of these there are and what there names are comes from the model
    'total-score',
    'score-last-run',
    'game-play'];

  function saveState() {
    var tResult = {
      success: true,
      state: {}
    };
    stateVars.forEach(function (iVar) {
      tResult.state[iVar] = world.observer.getGlobal(iVar);
    });

    iCallback(tResult);
  }

  function restoreState(iState) {
    var tResult = {success: true},
        kGamePlayName = 'game-play',
        tInitialGamePlay = world.observer.getGlobal(kGamePlayName);
    stateVars.forEach(function (iVar) {
      world.observer.setGlobal(iVar, iState[iVar]);
    });
    // An state in which the game has not yet been played indicates that we should accept the
    // newly randomized value rather than the saved value of game-play
    if( iState.level === 1 && iState.step === 0)
      world.observer.setGlobal(kGamePlayName, tInitialGamePlay);
    iCallback(tResult);
  }

  switch (iCommandObj.operation) {
    case 'saveState':
      saveState();
      break;
    case 'restoreState':
      restoreState(iCommandObj.args.state);
      break;
    default:
      iCallback({success: false});
  }
}

/**
 * This function is called when a run of the model begins.
 * You need to specify the run-level values and pass them to CODAP in the same order you
 * declared them in codapInitGame
 * @param callbackFunc
 */
/*
 function codapStartRun(callbackFunc) {

 function setCaseID(iResult) {
 if (iResult.success) {
 world.observer.setGlobal('case-id', iResult.caseID);
 callbackFunc();
 }
 else {
 window.alert('Error setting data for simulation')
 }
 }

 // Here is where you gather the values you are going record at the run level
 var runNumber = world.observer.getGlobal('run-number') + 1, // We're going on to the next run
 // To Do: EDITING REQUIRED
 // how many more of these there are and what there names are depends on the model
 state_var_1 = world.observer.getGlobal('state-var-1'),
 state_var_2 = world.observer.getGlobal('state-var-2'),
 state_var_3 = world.observer.getGlobal('state-var-3');

 // Update the global run-number
 world.observer.setGlobal('run-number', runNumber);

 world.observer.setGlobal('case-id', -2);  // So we know we're waiting for callback to setCaseID
 this.codapPhone.call({
 action: 'openCase',
 args: {
 collection: "Runs", // The same name you used in codapInitGame
 values: [
 // To Do: EDITING REQUIRED
 // These must be arranged in the same order you declared them in codapInitGame
 runNumber,
 state_var_1,
 state_var_2,
 state_var_3
 ]
 }
 },
 setCaseID
 );
 }
 */

function codapGo() {
  var level = world.observer.getGlobal('level'),
      step = world.observer.getGlobal('step'),
      start_height = world.observer.getGlobal('start-height'),
      friction = world.observer.getGlobal('friction'),
      mass = world.observer.getGlobal('car-mass'),
      end_distance = world.observer.getGlobal('car-x');

  this.codapPhone.call({
        action: 'createCase',
        args: {
          collection: "Moves",
          values: [
            level,
            step,
            start_height,
            friction,
            mass,
            end_distance
          ]
        }
      }
  );
}

/*
 function codapGo() {

 function codapTransferData() {

 // To Do: EDITING REQUIRED
 // The vars listed here should correspond to the NetLogo variables you want to record for each tick.
 // How many there are and how you access them depends on the model.
 var tick_var_1 = compute_tick_var_1(),
 tick_var_2 = compute_tick_var_2(),
 tick_var_3 = compute_tick_var_3();

 recordTick([[
 // To Do: EDITING REQUIRED
 // These must be arranged in the same order you declared them in codapInitGame
 ticks,
 tick_var_1,
 tick_var_2,
 tick_var_3
 ]], "Moves");

 }

 if (world.observer.getGlobal('case-id') === -2)
 return; // We've called codapStartRun but haven't gotten the callback yet

 var ticks = world.ticker.tickCount();

 if (ticks === 0) {  // On the zeroth tick we open the case that contains parameter info
 codapStartRun(codapTransferData);
 return;
 }
 else if (world.observer.getGlobal('case-id') >= 0)
 codapTransferData();
 }
 */

/**
 * **************************************
 * Nothing below here need be modified.
 * **************************************
 */

function logCODAPAction(message, args) {
  window.codapPhone.call({action: "logAction", args: {formatStr: message, replaceArgs: args}});
}

function codapOpenTable() {
  window.codapPhone.call({action: "createComponent", args: {type: "DG.TableView", log: false}});
}

function codapReset() {
  if (world.observer.getGlobal('case-id') >= 0)
    codapStopRun();
  world.observer.setGlobal('case-id', -1);
}

function recordTick(series, collectionName) {
  window.codapPhone.call({
    action: 'createCases',
    args: {
      collection: collectionName,
      //parent: world.observer.getGlobal('case-id'),
      values: series
    }
  });
}

// Toggles all NetLogo "forever" buttons (solid black buttons) in the interface
function stopForevers() {
  var foreverButtons = session.widgetController.widgets.filter(function (w) {
    return w['type'] === 'button' && w.forever;
  });
  foreverButtons.forEach(function (w) {
    w.running = false;
  });
}

