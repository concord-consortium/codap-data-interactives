/**
 * These are helper function called from within the script portions of WolfSheep.html
 */

function codapCallInitGame() {
  window.codapPhone.call({
    action: 'initGame',
    args: {
      name: "Ants",
      dimensions: {width: 560, height: 734},
      collections: [
        {
          name: "Runs",
          attrs: [
            {name: 'run', type: 'numeric', description: "The number of the simulation in the sequence", precision: 0},
            {name: 'total_time', type: 'numeric', description: "Number of ticks the simulation lasted", precision: 0},
            {name: 'population', type: 'numeric', description: "Number of ants in the colony", precision: 0},
            {
              name: 'diffusion_rate',
              type: 'numeric',
              description: "The rate at which the chemical diffuses",
              precision: 0
            },
            {
              name: 'evaporation_rate',
              type: 'numeric',
              description: "The rate at which the chemical evaporates",
              precision: 0
            }
          ],
          childAttrName: "Ticks",
          labels: {
            singleCase: "run",
            pluralCase: "runs",
            singleCaseWithArticle: "a run",
            setOfCases: "simulation",
            setOfCasesWithArticle: "a simulation"
          }
        },
        {
          name: "Ticks",
          attrs: [
            {name: "time", type: "numeric", description: "The number of ticks that have gone by so far", precision: 0},
            {
              name: "food_close",
              type: "numeric",
              description: "The amount of food remaining in the close pile",
              precision: 0
            },
            {
              name: "food_medium",
              type: "numeric",
              description: "The amount of food remaining in the medium-far pile",
              precision: 0
            },
            {
              name: "food_far",
              type: "numeric",
              description: "The amount of food remaining in the far pile",
              precision: 0
            }
          ],
          labels: {
            singleCase: "tick",
            pluralCase: "ticks",
            singleCaseWithArticle: "a tick",
            setOfCases: "simulation",
            setOfCasesWithArticle: "a simulation"
          }
        }
      ]
    }
  });
  world.observer.setGlobal('run-number', 0);

}

function codapDoCommand(iCommandObj, iCallback) {
  var stateVars = ['run-number', 'diffusion-rate', 'evaporation-rate',
    'population'];
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

function codapGo() {

  function codapTransferData() {

    function countFood(iNum) {
      return ListPrims.sum(world.patches().agentFilter(function () {
        return Prims.equality(SelfPrims.getPatchVariable("pcolor"), iNum);
      }).projectionBy(function () {
        return SelfPrims.getPatchVariable("food");
      }));
    }

    var food_close = countFood(85),
        food_medium = countFood(95),
        food_far = countFood(105);
    recordTick([[ticks, food_close, food_medium, food_far]], "Ticks");

    if (Prims.equality(food_close, 0) && Prims.equality(food_medium, 0) && Prims.equality(food_far, 0)) {
      codapOpenTable();
      stopForevers();
      codapCloseCase();
      return;
    }
  }

  if (world.observer.getGlobal('case-id') === -2)
    return; // We've called codapOpenCase but haven't gotten the callback yet

  if (!world.turtles().nonEmpty()) {
    throw new Exception.StopInterrupt;
  }
  var ticks = world.ticker.tickCount();

  if (ticks === 0) {  // On the zeroth tick we open the case that contains parameter info
    codapOpenCase(codapTransferData);
    return;
  }
  else if (world.observer.getGlobal('case-id') >= 0)
    codapTransferData();

}


function logCODAPAction(message, args) {
  window.codapPhone.call({action: "logAction", args: {formatStr: message, replaceArgs: args}});
}

function codapOpenTable() {
  window.codapPhone.call({action: "createComponent", args: {type: "DG.TableView", log: false}});
}

function codapReset() {
  if (world.observer.getGlobal('case-id') >= 0)
    codapCloseCase();
  world.observer.setGlobal('case-id', -1);
}

function codapCloseCase() {
  var runNumber = world.observer.getGlobal('run-number'),
      numTicks = world.ticker.tickCount(),
      population = world.observer.getGlobal('population'),
      diffusion_rate = world.observer.getGlobal('diffusion-rate'),
      evaporation_rate = world.observer.getGlobal('evaporation-rate'),
      caseID = world.observer.getGlobal('case-id');

  world.observer.setGlobal('case-id', -1);

  this.codapPhone.call({
        action: 'closeCase',
        args: {
          collection: "Runs",
          caseID: caseID,
          values: [
            runNumber, numTicks, population, diffusion_rate, evaporation_rate
          ]
        }
      }
  );
}

function codapOpenCase(callbackFunc) {

  function setCaseID(iResult) {
    if (iResult.success) {
      world.observer.setGlobal('case-id', iResult.caseID);
      callbackFunc();
    }
    else {
      window.alert('Error setting data for simulation')
    }
  }

  var runNumber = world.observer.getGlobal('run-number') + 1,
      numSheep = world.observer.getGlobal('initial-number-sheep'),
      numWolves = world.observer.getGlobal('initial-number-wolves'),
      sheepFoodGain = world.observer.getGlobal('sheep-gain-from-food'),
      wolfFoodGain = world.observer.getGlobal('wolf-gain-from-food'),
      sheepProbRepro = world.observer.getGlobal('sheep-reproduce'),
      wolfProbRepro = world.observer.getGlobal('wolf-reproduce'),
      includeGrass = world.observer.getGlobal('grass?'),
      grassRegrowthTime = world.observer.getGlobal('grass-regrowth-time');

  world.observer.setGlobal('run-number', runNumber);

  world.observer.setGlobal('case-id', -2);  // So we know we're waiting for callback to setCaseID
  this.codapPhone.call({
        action: 'openCase',
        args: {
          collection: "Runs",
          values: [
            runNumber, '', numSheep, numWolves, sheepFoodGain, wolfFoodGain, sheepProbRepro, wolfProbRepro,
            includeGrass, grassRegrowthTime
          ]
        }
      },
      setCaseID
  );
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
