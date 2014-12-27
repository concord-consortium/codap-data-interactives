/**
 * These are helper function called from within the script portions of WolfSheep.html
 */

function codapCallInitGame() {
  window.codapPhone.call({
    action: 'initGame',
    args: {
      name: "Wolf-Sheep Predation",
      dimensions: {width: 680, height: 603},
      collections: [
        {
          name: "Simulations",
          attrs: [
            {name: 'run', type: 'numeric', description: "The number of the simulation in the sequence", precision: 0},
            {name: 'total_time', type: 'numeric', description: "Number of days the simulation lasted", precision: 0},
            {name: 'initial_sheep', type: 'numeric', description: "Number of sheep to start with", precision: 0},
            {name: 'initial_wolves', type: 'numeric', description: "Number of wolves to start with", precision: 0},
            {
              name: 'sheep_food_gain',
              type: 'numeric',
              description: "The amount of energy sheep get for every grass patch eaten",
              precision: 0
            },
            {
              name: 'wolf_food_gain',
              type: 'numeric',
              description: "The amount of energy wolves get for every sheep eaten",
              precision: 0
            },
            {
              name: 'sheep_prob_reproduce',
              type: 'numeric',
              description: "The probability (as percent) of a sheep reproducing at each time step",
              precision: 0
            },
            {
              name: 'wolf_prob_reproduce',
              type: 'numeric',
              description: "The probability (as percent) of a wolve reproducing at each time step",
              precision: 0
            },
            {name: 'include_grass', type: 'boolean', description: "Whether or not to include grass in the model"},
            {
              name: 'grass_regrowth_time',
              type: 'numeric',
              description: "How long it takes for grass to regrow once it is eaten"
            }
          ],
          childAttrName: "Days",
          labels: {
            singleCase: "simulation",
            pluralCase: "simulations",
            singleCaseWithArticle: "a simulation",
            setOfCases: "experiment",
            setOfCasesWithArticle: "an experiment"
          }
        },
        {
          name: "Days",
          attrs: [
            {name: "day", type: "numeric", description: "The day number of the simulation", precision: 0},
            {name: "grass", type: "numeric", description: "Number of grassy patches", precision: 0},
            {name: "sheep", type: "numeric", description: "Number of sheep alive", precision: 0},
            {name: "wolves", type: "numeric", description: "Number of wolves alive", precision: 0}
          ],
          labels: {
            singleCase: "day",
            pluralCase: "days",
            singleCaseWithArticle: "a day",
            setOfCases: "simulation",
            setOfCasesWithArticle: "a simulation"
          }
        }
      ]
    }
  });
  world.observer.setGlobal('run-number', 0);

}

function codapDoCommand( iCommandObj, iCallback) {

  function saveState() {
    var tResult = { success: true,
                    state: {}},
        stateVars = ['run-number', 'initial-number-sheep', 'initial-number-wolves',
                    'sheep-gain-from-food', 'wolf-gain-from-food', 'sheep-reproduce',
                    'wolf-reproduce', 'grass?', 'grass-regrowth-time' ];
    stateVars.forEach( function( iVar) {
      tResult.state[ iVar] = world.observer.getGlobal( iVar);
    });

    iCallback( tResult);
  }

  function restoreState( iState) {
    var tResult = { success: true },
        stateVars = ['run-number', 'initial-number-sheep', 'initial-number-wolves',
          'sheep-gain-from-food', 'wolf-gain-from-food', 'sheep-reproduce',
          'wolf-reproduce', 'grass?', 'grass-regrowth-time' ];
    stateVars.forEach( function( iVar) {
      world.observer.setGlobal( iVar, iState[iVar]);
    });
    iCallback( tResult);
  }

  switch( iCommandObj.operation) {
    case 'saveState':
      saveState();
    break;
    case 'restoreState':
      restoreState( iCommandObj.args.state);
    break;
    default:
      iCallback( { success: false });
  }
}

function codapGo() {

  function continueDay() {
    var sheepCount = world.turtleManager.turtlesOfBreed("SHEEP").size();
    var wolfCount = world.turtleManager.turtlesOfBreed("WOLVES").size();
    var grassCount = world.patches().agentFilter(function() {
      return Prims.equality(SelfPrims.getPatchVariable('pcolor'), 55);
    }).size();
    recordDay([[ticks, grassCount, sheepCount, wolfCount]], "Days");
    
    if (Prims.equality(sheepCount, 0) || Prims.equality(wolfCount, 0)) {
      codapOpenTable();
      stopForevers();
      codapCloseCase();
      return;
    }
    world.turtleManager.turtlesOfBreed("SHEEP").ask(function() {
      Call(move);
      if (world.observer.getGlobal('grass?')) {
        SelfPrims.setVariable('energy', (SelfPrims.getVariable('energy') - 1));
        Call(eatGrass);
      }
      Call(death);
      Call(reproduceSheep);
    }, true);
    world.turtleManager.turtlesOfBreed("WOLVES").ask(function() {
      Call(move);
      SelfPrims.setVariable('energy', (SelfPrims.getVariable('energy') - 1));
      Call(catchSheep);
      Call(death);
      Call(reproduceWolves);
    }, true);
    if (world.observer.getGlobal('grass?')) {
      world.patches().ask(function() {
        Call(growGrass);
      }, true);
    }
    world.observer.setGlobal('grass', world.patches().agentFilter(function() {
      return Prims.equality(SelfPrims.getPatchVariable('pcolor'), 55);
    }).size());
    world.ticker.tick();
    Call(displayLabels);
  }

  if(world.observer.getGlobal('case-id') === -2)
    return; // We've called codapOpenCase but haven't gotten the callback yet

  if (!world.turtles().nonEmpty()) {
    throw new Exception.StopInterrupt;
  }
  var ticks = world.ticker.tickCount();

  if( ticks === 0) {  // On the zeroth tick we open the case that contains parameter info
    codapOpenCase( continueDay);
    return;
  }
  else if( world.observer.getGlobal('case-id') >= 0)
    continueDay();

}


function logCODAPAction(message, args) {
  window.codapPhone.call({ action: "logAction", args: { formatStr: message, replaceArgs: args }});
}

function codapOpenTable() {
  window.codapPhone.call({ action: "createComponent", args: { type: "DG.TableView", log: false }});
}

function codapReset() {
  if(world.observer.getGlobal('case-id') >= 0)
    codapCloseCase();
  world.observer.setGlobal('case-id', -1);
}

function codapCloseCase() {
  var runNumber = world.observer.getGlobal('run-number'),
      numDays = world.ticker.tickCount(),
      numSheep = world.observer.getGlobal('initial-number-sheep'),
      numWolves = world.observer.getGlobal('initial-number-wolves'),
      sheepFoodGain = world.observer.getGlobal('sheep-gain-from-food'),
      wolfFoodGain = world.observer.getGlobal('wolf-gain-from-food'),
      sheepProbRepro = world.observer.getGlobal('sheep-reproduce'),
      wolfProbRepro = world.observer.getGlobal('wolf-reproduce'),
      includeGrass = world.observer.getGlobal('grass?'),
      grassRegrowthTime = world.observer.getGlobal('grass-regrowth-time'),
      caseID = world.observer.getGlobal('case-id');

  world.observer.setGlobal('case-id', -1);

  this.codapPhone.call({
        action: 'closeCase',
        args: {
          collection: "Simulations",
          caseID: caseID,
          values: [
            runNumber, numDays, numSheep, numWolves, sheepFoodGain, wolfFoodGain, sheepProbRepro, wolfProbRepro,
            includeGrass, grassRegrowthTime
          ]
        }
      }
  );
}

function codapOpenCase( callbackFunc) {

  function setCaseID( iResult) {
    if( iResult.success) {
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
          collection: "Simulations",
          values: [
            runNumber, '', numSheep, numWolves, sheepFoodGain, wolfFoodGain, sheepProbRepro, wolfProbRepro,
              includeGrass, grassRegrowthTime
          ]
        }
      },
      setCaseID
  );
}

function recordDay(series, collectionName) {
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
  var foreverButtons = session.widgetController.widgets.filter(function(w) { return w['type'] === 'button' && w.forever; });
  foreverButtons.forEach(function(w) { w.running = false; });
}

window.codapPhone = new iframePhone.IframePhoneRpcEndpoint(codapDoCommand, "codap-game", window.parent);
