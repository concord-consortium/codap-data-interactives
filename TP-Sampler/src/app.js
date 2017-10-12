require(['lib/snap-plugins', './codap-com', './view', './ui'], function(Snap, CodapCom, View, ui) {

  var s = Snap("#model svg"),

      device = "mixer",       // ..."spinner", "collector"
      isCollector = false,

      running = false,
      paused = false,
      speed = 1,  //  0.5, 1, 2, 3=inf
      hidden = false,

      experimentNumber = 0,
      sentRun = 0,
      sequence = [],

      numRuns = 3,
      sampleSize = 5,

      userVariables = ["a", "b", "a"],
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
        device: device
      }
    };
  }

  function loadInteractiveState(state) {
    if (state) {
      experimentNumber = state.experimentNumber || experimentNumber;
      variables = state.variables || variables;
      sampleSize = state.draw || sampleSize;
      numRuns = state.repeat || numRuns;
      speed = state.speed || speed;
      if (state.device) {
        switchState(null, state.device);
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

  view = new View(getProps, isRunning, setRunning, isPaused, setup);

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
    if (variables.length > 119) {
      ui.disable("add-variable");
    }
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
      var run = [],
          _draw = draw;
      while (_draw--) {
        run.push( Math.floor(Math.random()*len) );
      }
      seq.push(run);
    }
    return seq;
  }

  function runButtonPressed() {
    this.blur();
    if (!running) {
      running = true;
      ui.disableButtons();
      run();
    } else {
      paused = !paused;
      view.pause(paused);
      ui.setRunButton(paused);
    }
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
  }

  function resetButtonPressed() {
    this.blur();
    experimentNumber = 0;
    codapCom.deleteAll(device, ui.populateContextsList(caseVariables, view, codapCom));
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
    experimentNumber += 1;
    codapCom.startNewExperimentInCODAP(experimentNumber, sampleSize).then(function() {
      sequence = createRandomSequence(sampleSize, numRuns);
      if (speed === 3) {
        // send sequence directly to codap
        for (var i = 0, ii = sequence.length; i < ii; i++) {
          var values = sequence[i].map(function(v) {
            return variables[v];
          });
          codapCom.addValuesToCODAP(i+1, values, isCollector);
        }
        setup();
        return;
      }

      var run = 0,
          draw = 0;
      sentRun = 0;

      function selectNext() {
        if (!paused) {
          view.animateSelectNextVariable(sequence[run][draw], draw, addNextSequenceRunToCODAP);

          if (draw < sequence[run].length - 1) {
            draw++;
          } else {
            run++;
            draw = 0;
          }
        }
        if (running) {
          if (sequence[run]) {
            setTimeout(selectNext, 1000/speed);
          } else {
            setTimeout(view.endAnimation, 1000/speed);
          }
        }
      }

      if (!hidden && (device === "mixer" || device === "collector")) {
        view.animateMixer();
      }

      selectNext();
    });
  }

  function fastforwardToEnd() {
    view.endAnimation();
    while (sequence[sentRun]) {
      addNextSequenceRunToCODAP();
    }
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
  }

  function setSampleSize(n) {
    sampleSize = n;
    view.render();
  }

  function setNumRuns(n) {
    numRuns = n;
    view.render();
  }

  function setSpeed(n) {
    speed = n;
    if (running && !paused && speed === 3) {
      fastforwardToEnd();
    }
  }

  function setHidden(b) {
    hidden = b;
  }

  // Set the model up to the initial conditions, reset all buttons and the view
  function setup() {
    view.reset();
    ui.enableButtons();
    samples = [];
    running = false;
    paused = false;
    view.render();
  }

  ui.appendUIHandlers(addVariable, removeVariable, runButtonPressed, stopButtonPressed,
    resetButtonPressed, switchState, refreshCaseList, setSampleSize, setNumRuns, setSpeed,
    view.speedText, view.setVariableName, setHidden);

  // initialize and render the model
  setup();
});
