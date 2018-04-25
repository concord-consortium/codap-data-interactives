require(
['lib/snap-plugins', './codap-com', './view', './ui', './utils'],
function(Snap, CodapCom, View, ui, utils) {

  var s = Snap("#model svg"),

      defaultSettings = {
        repeat: 3,
        draw: 5,
        speed: 1,
        variables: ["a", "b", "a"],
        device: "mixer",
        withReplacement: true
      },

      device = defaultSettings.device,       // "mixer, "spinner", "collector"
      isCollector = device === "collector",
      withReplacement = true,

      running = false,
      paused = false,
      speed = defaultSettings.speed,  //  0.5, 1, 2, 3=inf
      kFastestSpeed = 3,
      kFastestItemGroupSize = 50, // number of items to send at a time at fastest speed

      password = null,      // if we have a password, options are locked
      hidden = false,

      experimentNumber = 0,
      sentRun = 0,
      sequence = [],

      numRuns = defaultSettings.repeat,
      sampleSize = defaultSettings.draw,

      userVariables = defaultSettings.variables.slice(0),   // clone
      caseVariables = [],
      variables = userVariables,

      samples = [],

      uniqueVariables,

      codapCom,
      view;

  function getInteractiveState() {
    return {
      success: true,
      values: {
        experimentNumber: experimentNumber,
        variables: variables,
        draw: sampleSize,
        repeat: numRuns,
        speed: speed,
        device: device,
        withReplacement: withReplacement,
        hidden: hidden,
        password: password
      }
    };
  }

  function loadInteractiveState(state) {
    if (state) {
      experimentNumber = state.experimentNumber || experimentNumber;
      if (state.variables) {
        // swap contents of sequence into variables without updating variables reference
        variables.length = 0;
        Array.prototype.splice.apply(variables, [0, state.variables].concat(state.variables));
      }
      sampleSize = state.draw || sampleSize;
      numRuns = state.repeat || numRuns;
      speed = state.speed || speed;
      if (state.device) {
        switchState(null, state.device);
      }
      withReplacement = (state.withReplacement !== undefined) ? state.withReplacement : true;
      hidden = state.hidden || false;
      password = state.password || null;
      ui.render(hidden, password, false, withReplacement, device);
      if (isCollector) {
        refreshCaseList();
      }
      view.render();
    }
  }

  codapCom = new CodapCom(getInteractiveState, loadInteractiveState);

  function getProps() {
    return {
      s: s,
      speed: speed,
      sampleSize: sampleSize,
      numRuns: numRuns,
      device: device,
      withReplacement: withReplacement,
      variables: variables,
      uniqueVariables: uniqueVariables,
      samples: samples,
      hidden: hidden
    };
  }

  function isRunning() {
    return running;
  }

  function setRunning(_running) {
    running = _running;
  }

  function isPaused() {
    return paused;
  }

  view = new View(getProps, isRunning, setRunning, isPaused, setup, codapCom);

  function getNextVariable() {
    // brain-dead version for now
    return "" + (variables.length + 1);
  }

  function addVariable() {
    this.blur();
    if (running) return;
    variables.push(getNextVariable());
    view.render();

    ui.enable("remove-variable");
    codapCom.logAction("addItem");
  }

  function removeVariable() {
    this.blur();
    if (running) return;
    if (variables.length === 1) return;
    variables.pop();
    view.render();

    ui.enable("add-variable");
    if (variables.length < 2) {
      ui.disable("remove-variable");
    }
    codapCom.logAction("removeItem");
  }

  function addVariableSeries() {
    this.blur();
    if (running) return;

    var sequenceRequest = showSequencePrompt();
    if (sequenceRequest) {
      var sequence = utils.parseSequence(sequenceRequest);
      if (sequence) {
        // swap contents of sequence into variables without updating variables reference
        variables.length = 0;
        Array.prototype.splice.apply(variables, [0, sequence.length].concat(sequence));
        codapCom.logAction("RequestedItemSequence: %@", sequenceRequest);
      }
    }

    view.render();
  }

  function showSequencePrompt() {
    // eslint-disable-next-line no-alert
    return window.prompt("Enter a range (e.g. 1-50, -5 to 5, 1.0 to 5.0, A-Z)", "a to c");
  }

  /**
   * Creates a set of random sequence, each containing the index
   * of the ball to be selected.
   *
   * @param {int} draw - The number of variables drawn per run
   * @param {int} repeat - The number of samples
   */
  function createRandomSequence(draw, repeat) {
    var seq = [],
        len = variables.length;
    while (repeat--) {
      if (withReplacement || device === "spinner") {
        // fill run array of length `draw` with random numbers [0-len]
        var run = [],
            _draw = draw;
        while (_draw--) {
          run.push( Math.floor(Math.random()*len) );
        }
        seq.push(run);
      } else {
        // shuffle an array of all possible values, select `draw` of them
        var allCases = utils.fill(len);
        utils.shuffle(allCases);
        // set length. This lopps of end if longer, and padds empty values otherwise
        allCases.length = draw;
        if (draw > len) {
          // instead of a number, pad with "EMPTY", which we will use in array lookups
          allCases.fill("EMPTY", len, draw);
        }
        seq.push(allCases);
      }
    }
    return seq;
  }

  function runButtonPressed() {
    this.blur();
    if (!running) {
      running = true;
      ui.disableButtons();
      run();
      codapCom.logAction('start: %@ samples with %@ items', [numRuns, sampleSize]);
    } else {
      paused = !paused;
      view.pause(paused);
      ui.setRunButton(paused);
    }
  }
  function clearSamples() {
    for (var i = 0, ii = samples.length; i < ii; i++) {
      if (samples[i].remove) {
        samples[i].remove();
      }
    }
    samples = [];
  }
  function stopButtonPressed() {
    this.blur();
    running = false;
    paused = false;
    for (var i = 0, ii = samples.length; i < ii; i++) {
      if (samples[i].remove) {
        samples[i].remove();
      }
    }
    samples = [];
    view.endAnimation();
    codapCom.logAction("stop:");
  }

  function resetButtonPressed() {
    this.blur();
    experimentNumber = 0;
    codapCom.deleteAll(device, ui.populateContextsList(caseVariables, view, codapCom));
    codapCom.logAction("clearData:");
  }

  function addNextSequenceRunToCODAP() {
    if (!sequence[sentRun]) return;

    var vars = sequence[sentRun].map(function(i) {
      return variables[i];
    });
    codapCom.addValuesToCODAP(sentRun+1, vars, isCollector);
    sentRun++;
  }

  function run() {
    // this doesn't get written out in array, or change the length
    variables.EMPTY = "";

    experimentNumber += 1;
    codapCom.startNewExperimentInCODAP(experimentNumber, sampleSize);

    function addValuesToCODAPNoDelay() {
      var ix = 0;
      var samples = [];
      if (!paused) {
        if (speed === kFastestSpeed) {
          while (ix < sampleGroupSize && runNumber < sequence.length) {
            var values = sequence[runNumber].map(
              function (v) {
                return variables[v];
              });
            var run = runNumber ++;
            sentRun++;
            samples.push({
              run: run+1,
              values: values
            });
            ix ++;
          }
          codapCom.addMultipleSamplesToCODAP(samples, isCollector);

          if (runNumber >= sequence.length) {
            setup();
            return;
          }
          if (running) setTimeout(addValuesToCODAPNoDelay, 0);
        } else {
          selectNext();
        }
      } else {
        if (running) setTimeout(addValuesToCODAPNoDelay, 500);
      }

    }

    function selectNext() {
      var timeout = (speed !== kFastestSpeed)? 1000/speed: 0;
      if (!paused) {
        if (speed !== kFastestSpeed) {
          if (sequence[runNumber][draw] === "EMPTY") {
            // jump to the end. Slots will push out automatically.
            draw = sequence[runNumber].length - 1;
          }
          view.animateSelectNextVariable(sequence[runNumber][draw], draw,
              addNextSequenceRunToCODAP);

          if (draw < sequence[runNumber].length - 1) {
            draw++;
          } else {
            runNumber++;
            draw = 0;
          }
        } else {
          addValuesToCODAPNoDelay();
          return;
        }
      }
      if (running) {
        if (sequence[runNumber]) {
          setTimeout(selectNext, timeout);
        } else {
          setTimeout(view.endAnimation, timeout);
        }
      }
    }

    var runNumber = 0,
        draw = 0,
        // sample group size is the number of samples we will send in one message
        sampleGroupSize = Math.ceil(kFastestItemGroupSize/(sampleSize||1));

    console.log('sample group size: ' + sampleGroupSize);
    sentRun = 0;

    sequence = createRandomSequence(sampleSize, numRuns);

    if (!hidden && (device === "mixer" || device === "collector")) {
      view.animateMixer();
    }

    if (speed === kFastestSpeed) {
      // send sequence directly to codap
      addValuesToCODAPNoDelay();
      return;
    }


    selectNext();
  }

  // permanently sorts variables so identical ones are next to each other
  function sortVariablesForSpinner() {
    var sortedVariables = [];
    uniqueVariables = variables.length;
    for (var i = 0, ii = variables.length; i < ii; i++) {
      var v = variables[i],
          inserted = false,
          j = -1;
      while (!inserted && ++j < sortedVariables.length) {
        if (sortedVariables[j] === v) {
          sortedVariables.splice(j, 0, v);
          inserted = true;
          uniqueVariables--;
        }
      }
      if (!inserted) {
        sortedVariables.push(v);
      }
    }
    userVariables.length = 0;
    userVariables.push.apply(userVariables, sortedVariables);
  }

  function switchState(evt, state) {
    if (this.blur) this.blur();
    var selectedDevice = state || this.id;
    if (selectedDevice !== device) {
      if( device)
        codapCom.logAction("switchDevice: %@", selectedDevice);
      ui.toggleDevice(device, selectedDevice);
      device = selectedDevice;
      isCollector = device === "collector";
      variables = isCollector ? caseVariables : userVariables;
      if (device === "spinner") {
        sortVariablesForSpinner();
      }
      ui.renderVariableControls(device);
      if (isCollector) {
        codapCom.getContexts().then(ui.populateContextsList(caseVariables, view, codapCom));
      }
      setup();
    }
  }

  function refreshCaseList() {
    codapCom.getContexts().then(ui.populateContextsList(caseVariables, view, codapCom));
    codapCom.logAction('refreshList');
  }

  function setSampleSize(n) {
    sampleSize = n;
    view.render();
    codapCom.logAction("setNumItems: %@", n);
  }

  function setNumRuns(n) {
    numRuns = n;
    view.render();
    codapCom.logAction("setNumSamples: %@", n);
  }

  function setSpeed(n) {
    speed = n;
    if (running && !paused && speed === kFastestSpeed) {
      clearSamples();
    }
    codapCom.logAction("setSpeed: %@", n);
  }

  function setReplacement(b) {
    withReplacement = b;
    view.render();
    codapCom.logAction("setWithReplacement: %@", b);
  }

  function setHidden(b) {
    hidden = b;
    codapCom.logAction("%@", b ? 'hideModel' : 'showModel');
  }

  function setOrCheckPassword(pass) {
    var passwordFailed = false;
    if (!password) {
      password = pass;      // lock model
      codapCom.logAction("lockModel");
    } else {
      if (pass === password) {
        password = null;      // clear existing password
        hidden = false;       // unhide model automatically
        codapCom.logAction("unLockModel");
      } else {
        passwordFailed = true;
      }
    }
    ui.render(hidden, password, passwordFailed, withReplacement, device);
  }

  function reloadDefaultSettings() {
    loadInteractiveState(defaultSettings);
    codapCom.logAction("reloadDefaultSettings");
  }

  // Set the model up to the initial conditions, reset all buttons and the view
  function setup() {
    view.reset();
    ui.enableButtons();
    ui.render(hidden, password, false, withReplacement, device);
    samples = [];
    running = false;
    paused = false;
    view.render();
  }

  ui.appendUIHandlers(addVariable, removeVariable, addVariableSeries, runButtonPressed,
    stopButtonPressed, resetButtonPressed, switchState, refreshCaseList, setSampleSize,
    setNumRuns, setSpeed, view.speedText, view.setVariableName, setReplacement, setHidden,
    setOrCheckPassword, reloadDefaultSettings);

  // initialize and render the model
  setup();
});
