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

      dataSetName,
      device = defaultSettings.device,       // "mixer, "spinner", "collector"
      isCollector = device === "collector",
      withReplacement = true,
      previousExperimentDescription = '', // Used to tell when user has changed something
      previousSampleSize = null,  // Also used to help know whether to increment experiment number

      running = false,
      paused = false,
      speed = defaultSettings.speed,  //  0.5, 1, 2, 3=inf
      kFastestSpeed = 3,
      kFastestItemGroupSize = 50, // number of items to send at a time at fastest speed

      password = null,      // if we have a password, options are locked
      hidden = false,

      experimentNumber = 0,
      mostRecentRunNumber = 0,  // Gets reset between experiments, but if the parameters haven't changed we keep incrementing
      runNumberSentInCurrentSequence = 0, // This gets reset when user presses start regardless of whether params have changed
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
        mostRecentRunNumber: mostRecentRunNumber,
        variables: variables,
        draw: sampleSize,
        repeat: numRuns,
        speed: speed,
        device: device,
        withReplacement: withReplacement,
        hidden: hidden,
        password: password,
        dataSetName: dataSetName,
        previousExperimentDescription: previousExperimentDescription,
        previousSampleSize: previousSampleSize,
        attrNames: codapCom.attrNames,
        attrIds: codapCom.attrIds
      }
    };
  }

  function loadInteractiveState(state) {
    if (state) {
      dataSetName = state.dataSetName;
      previousExperimentDescription = state.previousExperimentDescription;
      previousSampleSize = state.previousSampleSize;
      experimentNumber = state.experimentNumber || experimentNumber;
      mostRecentRunNumber = state.mostRecentRunNumber || mostRecentRunNumber;
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
      if (state.attrNames) {
        codapCom.attrNames = state.attrNames;
        codapCom.attrIds = state.attrIds;
      }
    }
    view.render();
  }

  codapCom = new CodapCom(getInteractiveState, loadInteractiveState);
  codapCom.init()
      .then(setCodapDataSetName)
      .catch(codapCom.error);

  function setCodapDataSetName() {
    return new Promise(function (resolve, reject) {
      if (dataSetName) {
        codapCom.setDataSetName(dataSetName);
        resolve(dataSetName);
      } else {
        codapCom.getContexts().then(function (contexts) {
          var names = contexts.map(function (context) {return context.name; });
          var baseName = 'Sampler';
          var ix = 0;
          var name = baseName;
          while (names.indexOf(name) >= 0) {
            ix++;
            name = baseName + (ix);
          }
          dataSetName = name;
          codapCom.setDataSetName(name);
          resolve(name);
        });
      }
    });
  }
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
    var tResult = 'a',
        tMax,
        tIsNumeric = variables.every(function (iValue) {
          return !isNaN(Number(iValue));
        });
    if (tIsNumeric) {
      tMax = variables.reduce(function (iCurrMax, iValue) {
        return (iCurrMax === '' || Number(iCurrMax) < Number(iValue)) ? iValue : iCurrMax;
      }, '');
      tResult = String(Number(tMax) + 1);
    }
    else {
      tMax = variables.reduce(function (iCurrMax, iValue) {
        if( iValue >= 'a' && iValue < String.fromCharCode('z'.codePointAt(0) + 1)) {
          return (iCurrMax < iValue && String(iValue) < 'z') ? iValue : iCurrMax;
        } else if (iValue >= 'A' && iValue < String.fromCharCode('Z'.codePointAt(0) + 1)) {
          return (iCurrMax < iValue && String(iValue) < 'Z') ? iValue : iCurrMax;
        } else return iCurrMax;
      }, '0');
      tResult = String.fromCharCode(tMax.codePointAt(0) + 1);
    }
    return tResult;
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
      var sequence = utils.parseSpecifier(sequenceRequest);
      if (sequence) {
        // swap contents of sequence into variables without updating variables reference
        variables.length = 0;
        Array.prototype.splice.apply(variables, [0, sequence.length].concat(sequence));
        codapCom.logAction("RequestedItemSequence: %@", sequenceRequest);
      }
      else alert('Sorry. Unable to parse that. Here are some valid list and range expressions: "a,b,b,b", "cat,cat,dog", "1-50", "-5 to 5", "1.0 to 5.0", or "A-Z"');
    }

    view.render();
  }

  function showSequencePrompt() {
    // eslint-disable-next-line no-alert
    return window.prompt('Enter a list (e.g. "cat, cat, dog") or a range (e.g. "1-50", "-5 to 5", "1.0 to 5.0", "A-Z")', "a to c");
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
    codapCom.deleteAll();
    // we used to delete all attributes, and recreate them if we were a collector.
    // we don't do that any more because it seems to take a very long time, and the request
    // can sometimes timeout.
    // codapCom.deleteAllAttributes(device, ui.populateContextsList(caseVariables, view, codapCom));
    codapCom.logAction("clearData:");
  }

  function addNextSequenceRunToCODAP() {
    if (!sequence[runNumberSentInCurrentSequence]) return;

    var vars = sequence[runNumberSentInCurrentSequence].map(function(i) {
      return variables[i];
    });
    codapCom.addValuesToCODAP(++mostRecentRunNumber, vars, isCollector);
    runNumberSentInCurrentSequence++;
  }

  function run() {

    function addValuesToCODAPNoDelay() {
      var ix = 0;
      var samples = [];
      if (!paused) {
        if (speed === kFastestSpeed) {
          while (ix < sampleGroupSize && currRunNumber < sequence.length) {
            var values = sequence[currRunNumber].map(
              function (v) {
                return variables[v];
              });
            var run = mostRecentRunNumber++;
            currRunNumber++;
            samples.push({
              run: run+1,
              values: values
            });
            ix ++;
          }
          codapCom.addMultipleSamplesToCODAP(samples, isCollector);

          if (currRunNumber >= sequence.length) {
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
      var timeout = device === "spinner" ? 1 :
          (speed === kFastestSpeed) ? 0 :
          // Give "Fast" a little extra
          (speed === kFastestSpeed - 1 ? 600 / kFastestSpeed :
              600 / speed);
      if (!paused) {
        if (speed !== kFastestSpeed) {
          if (sequence[currRunNumber][draw] === "EMPTY") {
            // jump to the end. Slots will push out automatically.
            draw = sequence[currRunNumber].length - 1;
          }
          function selectionMade() {
            if (running) {
              if (sequence[currRunNumber]) {
                setTimeout(selectNext, timeout);
              } else {
                setTimeout(view.endAnimation, timeout);
              }
            }
          }
          view.animateSelectNextVariable(sequence[currRunNumber][draw], draw, selectionMade, addNextSequenceRunToCODAP);

          if (draw < sequence[currRunNumber].length - 1) {
            draw++;
          } else {
            currRunNumber++;
            draw = 0;
          }
        } else {
          addValuesToCODAPNoDelay();
          return;
        }
      }

      // console.log('speed: ' + speed + ', timeout: ' + timeout + ', draw: ' + draw + ', runNumber: ' + runNumber);
    }


    var runNumber,
        currRunNumber = 0,
        draw = 0,
        tSampleSize = Math.floor(sampleSize),
        tNumRuns = Math.floor(numRuns),
        // sample group size is the number of samples we will send in one message
        sampleGroupSize = Math.ceil(kFastestItemGroupSize/(tSampleSize||1)),
        tItems = device === "mixer" ? "items" : (device === "spinner" ? "sections" : "cases"),
        tReplacement = withReplacement ? " (with replacement)" : " (without replacement)",
        tUniqueVariables = new Set(variables),
        tNumItems = device === "spinner" ? tUniqueVariables.size : variables.length,
        tCollectorDataset = isCollector ? " from " + ui.getCollectorCollectionName() : "",
        tDescription = hidden ? "hidden!" : device + " containing " + tNumItems + " " + tItems +
            tCollectorDataset + tReplacement,
        tStringifiedVariables = JSON.stringify(variables);

    if( tDescription + tStringifiedVariables !== previousExperimentDescription ||
        (previousSampleSize !== null && previousSampleSize !== tSampleSize)) {
      experimentNumber++;
      previousExperimentDescription = tDescription + tStringifiedVariables;
      previousSampleSize = tSampleSize;
      mostRecentRunNumber = 0;
    }
    runNumberSentInCurrentSequence = 0;
    runNumber = mostRecentRunNumber;
    // this doesn't get written out in array, or change the length
    variables.EMPTY = "";
    codapCom.findOrCreateDataContext().then(function () {
      codapCom.startNewExperimentInCODAP(experimentNumber, tDescription, tSampleSize);

      console.log('sample group size: ' + sampleGroupSize);

      sequence = createRandomSequence(tSampleSize, tNumRuns);

      if (!hidden && (device === "mixer" || device === "collector")) {
        view.animateMixer();
      }

      if (speed === kFastestSpeed) {
        // send sequence directly to codap
        addValuesToCODAPNoDelay();
        return;
      }


      selectNext();
    });
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
      view.render();
    }
  }

  function refreshCaseList() {
    codapCom.getContexts().then(ui.populateContextsList(caseVariables, view, codapCom));
    codapCom.logAction('refreshList');
  }

  function setSampleSize(n) {
    sampleSize = n;
    view.render();
    updateRunButtonMode();
    codapCom.logAction("setNumItems: %@", n);
  }

  function setNumRuns(n) {
    numRuns = n;
    view.render();
    updateRunButtonMode();
    codapCom.logAction("setNumSamples: %@", n);
  }

  function updateRunButtonMode() {
    ui.setRunButtonMode((Math.floor(sampleSize) > 0) && (Math.floor(numRuns) > 0));
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

  function registerForCODAPNotices() {
    codapCom.register('notify', '*', 'titleChange', refreshCaseList);
    codapCom.register('notify', '*', 'dataContextCountChanged', refreshCaseList);
  }

  function getStarted() {
    view.reset();
    ui.enableButtons();
    ui.render(hidden, password, false, withReplacement, device);
    registerForCODAPNotices();
    samples = [];
    running = false;
    paused = false;
  }

  function becomeSelected() {
    codapCom.selectSelf();
  }

  // Set the model up to the initial conditions, reset all buttons and the view
  function setup() {
    getStarted();
    view.render();
  }

  ui.appendUIHandlers(addVariable, removeVariable, addVariableSeries, runButtonPressed,
    stopButtonPressed, resetButtonPressed, switchState, refreshCaseList, setSampleSize,
    setNumRuns, setSpeed, view.speedText, view.setVariableName, setReplacement, setHidden,
    setOrCheckPassword, reloadDefaultSettings, becomeSelected);

  // initialize and render the model
  getStarted();
});
