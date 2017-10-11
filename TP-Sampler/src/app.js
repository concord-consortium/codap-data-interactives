require(['lib/snap-plugins', './codap-com', './view'], function(Snap, CodapCom, View) {

  var s = Snap("#model svg"),

      device = "mixer",       // ..."spinner"
      isCollector = false,

      running = false,
      paused = false,
      speed = 1,  //  0.5, 1, 2, 3=inf

      experimentNumber = 0,
      runNumber = 0,
      sentRun = 0,
      sequence = [],

      numRuns = 3,
      sampleSize = 5,

      experimentCaseID,
      runCaseID,

      userVariables = ["a", "b", "a"],
      caseVariables = [],
      variables = userVariables,

      collectionAttributes,
      drawAttributes,


      samples = [],


      uniqueVariables,

      variableNameInput = document.getElementById("variable-name-change"),

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
        switchState(null, state.device)
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
      samples: samples
    }
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

  view = new View(getProps, isRunning, setRunning, isPaused, reset);

  function getNextVariable() {
    // brain-dead version for now
    return "" + (variables.length + 1);
  }

  function addVariable() {
    this.blur();
    if (running) return;
    variables.push(getNextVariable());
    view.render();

    removeClass(document.getElementById("remove-variable"), "disabled");
    if (variables.length > 119) {
      addClass(document.getElementById("add-variable"), "disabled");
    }
  }

  function removeVariable() {
    this.blur();
    if (running) return;
    if (variables.length === 1) return;
    variables.pop();
    view.render();

    removeClass(document.getElementById("add-variable"), "disabled");
    if (variables.length < 2) {
      addClass(document.getElementById("remove-variable"), "disabled");
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
      disableButtons();
      run();
    } else {
      paused = !paused;
      view.pause(paused);
      setRunButton(paused);
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
    codapCom.deleteAll();
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
    runNumber = 0;
    codapCom.startNewExperimentInCODAP(experimentNumber, sampleSize).then(function() {
      sequence = createRandomSequence(sampleSize, numRuns);
      if (speed === 3) {
        // send sequence directly to codap
        for (var i = 0, ii = sequence.length; i < ii; i++) {
          var values = sequence[i].map(function(v) {
            return variables[v];
          })
          codapCom.addValuesToCODAP(i+1, values, isCollector);
        }
        reset();
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

      if (device == "mixer" || device == "collector") {
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

  function reset() {
    view.reset();
    enableButtons();
    samples = [];
    running = false;
    paused = false;
    view.render();
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
        if (sortedVariables[j] == v) {
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
      console.log("variables", variables)
      console.log("userVariables", userVariables)
      removeClass(document.getElementById(device), "active");
      addClass(document.getElementById(selectedDevice), "active");
      device = selectedDevice;
      isCollector = device === "collector";
      variables = isCollector ? caseVariables : userVariables;
      if (device === "spinner") {
        sortVariablesForSpinner();
      }
      renderVariableControls();
      if (isCollector) {
        codapCom.getContexts().then(populateContextsList);
      }
      reset();
    }
  }

  reset();

  /** ******** HTML handlers and class modification ******** **/

  document.getElementById("add-variable").onclick = addVariable;
  document.getElementById("remove-variable").onclick = removeVariable;
  document.getElementById("run").onclick = runButtonPressed;
  document.getElementById("stop").onclick = stopButtonPressed;
  document.getElementById("reset").onclick = resetButtonPressed;
  document.getElementById("mixer").onclick = switchState;
  document.getElementById("spinner").onclick = switchState;
  document.getElementById("collector").onclick = switchState;
  document.getElementById("refresh-list").onclick = function() {
    codapCom.getContexts().then(populateContextsList)
  };
  document.getElementById("sample_size").addEventListener('input', function (evt) {
      sampleSize = this.value * 1;
      view.render();
  });
  document.getElementById("repeat").addEventListener('input', function (evt) {
      numRuns = this.value * 1;
      view.render();
  });
  document.getElementById("speed").addEventListener('input', function (evt) {
      speed = (this.value * 1) || 0.5;
      document.getElementById("speed-text").innerHTML = view.speedText[this.value * 1];
      if (running && !paused && speed == 3) {
        fastforwardToEnd();
      }
  });
  variableNameInput.onblur = view.setVariableName;
  variableNameInput.onkeypress = function(e) {
    if (e.keyCode == 13) {
      view.setVariableName();
      return false;
    }
  }
  function addClass(el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  }
  function removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }
  function disableButtons() {
    setRunButton(false);
    addClass(document.getElementById("add-variable"), "disabled");
    addClass(document.getElementById("remove-variable"), "disabled");
    document.getElementById("sample_size").setAttribute("disabled", "disabled");
    document.getElementById("repeat").setAttribute("disabled", "disabled");
    removeClass(document.getElementById("stop"), "disabled");
  }
  function enableButtons() {
    setRunButton(true);
    removeClass(document.getElementById("add-variable"), "disabled");
    removeClass(document.getElementById("remove-variable"), "disabled");
    document.getElementById("sample_size").removeAttribute("disabled");
    document.getElementById("repeat").removeAttribute("disabled");
    addClass(document.getElementById("stop"), "disabled");
  }
  function setRunButton(showRun) {
    if (showRun) {
      document.getElementById("run").innerHTML = "START";
    } else {
      document.getElementById("run").innerHTML = "PAUSE";
    }
  }
  function renderVariableControls() {
    if (device !== "collector") {
      removeClass(document.getElementById("add-variable"), "hidden");
      removeClass(document.getElementById("remove-variable"), "hidden");
      addClass(document.getElementById("select-collection"), "hidden");
      addClass(document.getElementById("refresh-list"), "hidden");
    } else {
      addClass(document.getElementById("add-variable"), "hidden");
      addClass(document.getElementById("remove-variable"), "hidden");
      removeClass(document.getElementById("select-collection"), "hidden");
      removeClass(document.getElementById("refresh-list"), "hidden");
    }
  }
  function populateContextsList(collections) {
    var sel = document.getElementById("select-collection");
    sel.innerHTML = "";
    collections.forEach(function (col) {
      if (col.name !== 'Sampler')
        sel.innerHTML += '<option value="' + col.name + '">' + col.name + "</option>";
    });

    if (!sel.innerHTML) {
      sel.innerHTML += "<option>No collections</option>";
      sel.setAttribute("disabled", "disabled");
      return;
    } else {
      sel.removeAttribute("disabled")
    }

    function setVariablesAndRender(vars) {
      // push into existing array, as `variables` is pointing at this
      caseVariables.push.apply(caseVariables, vars);
      view.render();
    }

    if (sel.childNodes.length == 1) {
      codapCom.setCasesFromContext(sel.childNodes[0].value).then(setVariablesAndRender);
    } else {
      sel.innerHTML = "<option>Select a collection</option>" + sel.innerHTML;
      sel.onchange = function(evt) {
        if(evt.target.value) {
          codapCom.setCasesFromContext(evt.target.value).then(setVariablesAndRender);
        }
      }
    }
  }

});
