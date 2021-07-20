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
  window.codapPhone.call({
    action: 'initGame',
    args: {
      // To Do: EDITING REQUIRED
      name: "Virus", // This will appear in the titlebar of the model's iFrame
      // To Do: EDITING REQUIRED
      dimensions: {width: 780, height: 620},  // Modify these to fit the size of the simulation
      collections: [
      /**
       * There are two collections:
       *    - one for the runs, which contains the values of parameters and anything computed for a run
       *    - one for the values or measurements collected for each tick
       */
      /**
       * Here begins the specification of the 'Runs' collection
       */
        {
          name: "Runs", // The name of the "parent" collection. Usually "Runs" is good for this
          attrs: [
          /**
           * A collection has attributes, each of which has some properties to specify. All properties
           * are optional except 'name'.
           */
            {
              // This first attribute can be left as is
              name: 'run',
              type: 'numeric',
              description: "The number of the run in the sequence",
              precision: 0
            },
            {
              // To Do: EDITING REQUIRED
              // An attribute's name appears in the header of its column
              name: 'people',
              type: 'numeric',
              description: "How many people are in the trial",
              precision: 0  // Only applies to numeric attributes. Essentially the number of decimal places
            },
            {
              // To Do: EDITING REQUIRED
              // An attribute's name appears in the header of its column
              name: 'infectiousness',
              type: 'numeric',
              description: "How infectious the virus is",
              precision: 0  // Only applies to numeric attributes. Essentially the number of decimal places
            },
            {
              // To Do: EDITING REQUIRED
              // An attribute's name appears in the header of its column
              name: 'chance-recover',
              type: 'numeric',
              description: "The chance that victims have of recovering",
              precision: 0  // Only applies to numeric attributes. Essentially the number of decimal places

            },
            {
              // To Do: EDITING REQUIRED
              // An attribute's name appears in the header of its column
              name: 'duration',
              type: 'numeric',
              description: "Doetermines the percent of the average life-span (which is 1500 weeks, or approximately 27 years, in this model) that an infected person goes through before the infection ends in either death or recovery.",
              precision: 0  // Only applies to numeric attributes. Essentially the number of decimal places
            }
          ],
          childAttrName: "Ticks", // Must match 'name:' field below
          labels: {
            // These aren't critical, but they help CODAP make things read clearly
            singleCase: "run",
            pluralCase: "runs",
            singleCaseWithArticle: "a run",
            setOfCases: "experiment",
            setOfCasesWithArticle: "an experiment"
          }
        },
      /**
       * Here begins the specification of the 'Ticks' collection
       */
        {
          // To Do: EDITING REQUIRED
          name: "Ticks", // Must match 'childAttrName:' field above. Often 'Ticks'
          attrs: [
          /**
           * The attributes here correspond to the values collected at each tick of the run
           */
            {
              // This first attribute can usually be left as is
              name: "time",
              type: "numeric",
              description: "The number of ticks that have gone by so far",
              precision: 0
            },
            {
              // To Do: EDITING REQUIRED
              // An attribute's name appears in the header of its column
              name: 'p_infected',
              type: 'numeric',
              description: "What percent of the people are infected",
              precision: 0  // Only applies to numeric attributes. Essentially the number of decimal places
            },
            {
              // To Do: EDITING REQUIRED
              // An attribute's name appears in the header of its column
              name: 'p_immune',
              type: 'numeric',
              description: "What percent of the people are immune",
              precision: 0  // Only applies to numeric attributes. Essentially the number of decimal places
            }
          ],
          labels: {
            // The values for these labels are filled out under the assumption that the name of
            // the parent collection is "Runs" and that of the child collection is "Ticks"
            singleCase: "tick",
            pluralCase: "ticks",
            singleCaseWithArticle: "a tick",
            setOfCases: "run",
            setOfCasesWithArticle: "a run"
          }
        }
      ]
    }
  });
  // We create a global variable for the run number and initialize it to zero
  world.observer.setGlobal('run-number', 0);
}

/**
 * CODAP issues two commands, one to saveState and one to restoreState. The only thing you have to
 * change here is the list of names of global state variables.
 * @param iCommandObj
 * @param iCallback
 */
function codapDoCommand(iCommandObj, iCallback) {

  var stateVars = [
    // To Do: EDITING REQUIRED
    'run-number', // The first state variable, run-number, is the one we defined above
    'people',  // How many of these there are and what there names are comes from the model
    'infectiousness',
    'chance-recover',
    'duration',
    'speed'];

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
    var tResult = {success: true};
    stateVars.forEach(function (iVar) {
      world.observer.setGlobal(iVar, iState[iVar]);
    });
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
      state_var_1 = world.observer.getGlobal('people'),
      state_var_2 = world.observer.getGlobal('infectiousness'),
      state_var_3 = world.observer.getGlobal('chance-recover'),
      state_var_4 = world.observer.getGlobal('duration'),
      state_var_5 = world.observer.getGlobal('speed');

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
            state_var_3,
            state_var_4,
            state_var_5
          ]
        }
      },
      setCaseID
  );
}

function codapStopRun() {
  var runNumber = world.observer.getGlobal('run-number'),
  // To Do: EDITING REQUIRED
  // how many more of these there are and what there names are depends on the model
      state_var_1 = world.observer.getGlobal('people'),
      state_var_2 = world.observer.getGlobal('infectiousness'),
      state_var_3 = world.observer.getGlobal('chance-recover'),
      state_var_4 = world.observer.getGlobal('duration'),
      state_var_5 = world.observer.getGlobal('speed'),

      // Leave this one as is
      caseID = world.observer.getGlobal('case-id');

  world.observer.setGlobal('case-id', -1);

  this.codapPhone.call({
        action: 'closeCase',
        args: {
          collection: "Runs", // The same name you used in codapInitGame
          caseID: caseID,
          values: [
            // To Do: EDITING REQUIRED
            // These must be arranged in the same order you declared them in codapInitGame
            runNumber,
            state_var_1,
            state_var_2,
            state_var_3,
            state_var_4,
            state_var_5
          ]
        }
      }
  );
}

function codapGo() {

  function codapTransferData() {

    // To Do: EDITING REQUIRED
    // The vars listed here should correspond to the NetLogo variables you want to record for each tick.
    // How many there are and how you access them depends on the model.
    var tick_var_1 = world.observer.getGlobal('%infected'),
        tick_var_2 = world.observer.getGlobal('%immune'),
        tick_var_3 = world.observer.getGlobal('years');

    recordTick([[
      // To Do: EDITING REQUIRED
      // These must be arranged in the same order you declared them in codapInitGame
      ticks,
      tick_var_1,
      tick_var_2,
      tick_var_3
    ]], "Ticks");

    // To Do: EDITING REQUIRED
    // You can, if you want, have some condition under which the model should stop; e.g.
    // when all the agents have died, for which you could use "!world.turtles().nonEmpty()".
    if (!world.turtles().nonEmpty()) {
      codapOpenTable();
      stopForevers();
      codapStopRun();
      return;
    }
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
      parent: world.observer.getGlobal('case-id'),
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

window.codapPhone = new iframePhone.IframePhoneRpcEndpoint(codapDoCommand, "codap-game", window.parent);
