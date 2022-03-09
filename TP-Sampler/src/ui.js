/**
 * UI module
 *
 * Adds listeners to DOM elements, and helpers for updating their state
 */

define(function() {

  var collectorCollectionName = '';

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

  function hasClass(el, className) {
    if (el.classList)
      return el.classList.contains(className);
    else
      return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
  }

  function disableButtons() {
    setRunButton(false);
    disable("add-variable");
    disable("remove-variable");
    disable("add-variable-series");
    disable("sample_size");
    disable("repeat");
    disable("reset");
    enable("stop");
  }

  function enableButtons() {
    setRunButton(true);
    enable("add-variable");
    enable("remove-variable");
    enable("add-variable-series");
    enable("sample_size");
    enable("repeat");
    enable("reset");
    disable("stop");
  }

  function disable(classNameOrEl) {
    if (typeof classNameOrEl === "string")
      classNameOrEl = document.getElementById(classNameOrEl);
    addClass(classNameOrEl, "disabled");
    if (classNameOrEl.tagName === "INPUT" || classNameOrEl.tagName === "BUTTON") {
      classNameOrEl.setAttribute("disabled", "disabled");
    }
  }

  function enable(classNameOrEl) {
    if (typeof classNameOrEl === "string")
      classNameOrEl = document.getElementById(classNameOrEl);
    removeClass(classNameOrEl, "disabled");
    if (classNameOrEl.tagName === "INPUT" || classNameOrEl.tagName === "BUTTON") {
      classNameOrEl.removeAttribute("disabled");
    }
  }

  function setRunButton(showRun) {
    if (showRun) {
      document.getElementById("run").innerHTML = "START";
    } else {
      document.getElementById("run").innerHTML = "PAUSE";
    }
  }

  function setRunButtonMode(enabled) {
    if (enabled) {
      enable("run");
    } else {
      disable("run");
    }
  }

  // Shows the element if no boolean is passed as the second argument.
  // If a bool is passed, this will either show or hide.
  function show(el, show) {
    if (show === undefined) {
      show = true;
    }
    if (show) {
      removeClass(el, "hidden");
    } else {
      addClass(el, "hidden");
    }
  }

  function hide(el) {
    addClass(el, "hidden");
  }

  function renderVariableControls(device) {
    if (device !== "collector") {
      show(document.getElementById("add-variable"));
      show(document.getElementById("remove-variable"));
      show(document.getElementById("add-variable-series"));
      hide(document.getElementById("select-collection"));
    } else {
      hide(document.getElementById("add-variable"));
      hide(document.getElementById("remove-variable"));
      hide(document.getElementById("add-variable-series"));
      show(document.getElementById("select-collection"));
    }
  }

  function getCollectionName() {
    var sel = document.getElementById("select-collection");
  }

  function populateContextsList(caseVariables, view, codapCom) {
    return function (collections) {
      var sel = document.getElementById("select-collection");
      sel.innerHTML = "";
      collections.forEach(function (col) {
        if (col.name !== 'Sampler')
          sel.innerHTML += '<option value="' + col.name + '">' + col.title + "</option>";
      });

      if (!sel.innerHTML) {
        sel.innerHTML += "<option>No data sets</option>";
        sel.setAttribute("disabled", "disabled");
        return;
      } else {
        sel.removeAttribute("disabled");
      }

      function setVariablesAndRender(vars) {
        // Never append. Always start from scratch
        caseVariables.length = 0;
        caseVariables.push.apply(caseVariables, vars);
        view.render();
      }

      if (sel.childNodes.length === 1) {
        collectorCollectionName = sel.childNodes[0].value;
        codapCom.setCasesFromContext(collectorCollectionName, caseVariables)
          .then(setVariablesAndRender);
        codapCom.logAction('chooseCollection: %@ (auto)', sel.childNodes[0].value);
      } else {
        sel.innerHTML = "<option>Select a data set</option>" + sel.innerHTML;
        setVariablesAndRender([]);  // empty out mixer
        sel.onchange = function(evt) {
          if(evt.target.value) {
            collectorCollectionName = evt.target.value;
            codapCom.setCasesFromContext(collectorCollectionName).then(setVariablesAndRender);
            codapCom.logAction('chooseCollection: %@', evt.target.value);
          }
        };
      }
    };
  }

  function getCollectorCollectionName() {
    return collectorCollectionName;
  }

  function toggleDevice(oldDevice, newDevice) {
    removeClass(document.getElementById(oldDevice), "active");
    addClass(document.getElementById(newDevice), "active");
  }

  function viewSampler() {
    addClass(document.getElementById("tab-sampler"), "active");
    removeClass(document.getElementById("tab-options"), "active");
    removeClass(document.getElementById("tab-about"), "active");
    show(document.getElementById("sampler"));
    hide(document.getElementById("options"));
    hide(document.getElementById("about-panel"));
  }

  function viewOptions() {
    removeClass(document.getElementById("tab-sampler"), "active");
    addClass(document.getElementById("tab-options"), "active");
    removeClass(document.getElementById("tab-about"), "active");
    hide(document.getElementById("sampler"));
    show(document.getElementById("options"));
    hide(document.getElementById("password-failed"));
    hide(document.getElementById("about-panel"));
  }

  function viewAbout() {
    removeClass(document.getElementById("tab-sampler"), "active");
    removeClass(document.getElementById("tab-options"), "active");
    addClass(document.getElementById("tab-about"), "active");
    hide(document.getElementById("sampler"));
    hide(document.getElementById("options"));
    hide(document.getElementById("password-failed"));
    show(document.getElementById("about-panel"));
  }

  function hideModel(hidden) {
    document.getElementById("hideModel").checked = hidden;

    var mixerCover = document.getElementById("model-cover");
    var spinnerCover = document.getElementById("spinner-cover");
    var mixerButton = document.getElementById("mixer");
    var spinnerButton = document.getElementById("spinner");
    var collectorButton = document.getElementById("collector");
    var withReplacement = document.getElementById("with-replacement").checked;
    var device = hasClass(mixerButton, "active") ? "mixer" :
        (hasClass(spinnerButton, "active") ? "spinner" : "collector");
    if (hidden) {
      if(device === "mixer") {
        show(mixerCover);
        hide(spinnerCover);
      }
      else {
        show(spinnerCover);
        hide(mixerCover);
      }
      if (!hasClass(mixerButton, "active"))
        disable(mixerButton);
      if (!hasClass(spinnerButton, "active"))
        disable(spinnerButton);
      if (!hasClass(collectorButton, "active"))
        disable(collectorButton);
      show(document.getElementById("password-area"));
    } else {
      hide(mixerCover);
      hide(spinnerCover);
      enable(mixerButton);
      enable(spinnerButton);
      enable(collectorButton);
      hide(document.getElementById("password-area"));
    }
    setReplacement( withReplacement, device, hidden);
  }

  function lockOptions(lock) {
    var passwordField = document.getElementById("password");
    if (lock) {
      passwordField.value = "";
      passwordField.type = "password";
      disable("hide-options");
      disable("hideModel");
      disable("reload-settings");
      document.getElementById("pass-lock").innerHTML = "Unlock";
      document.getElementById("pass-text").innerHTML = "Unlock settings with password:";
    } else {
      passwordField.value = "";
      passwordField.type = "text";
      enable("hide-options");
      enable("hideModel");
      enable("reload-settings");
      document.getElementById("pass-lock").innerHTML = "Lock";
      document.getElementById("pass-text").innerHTML = "Lock settings with password:";
    }
  }

  function setReplacement(withReplacement, device, hidden) {

    function setReplacementUI( enabled) {
      if( enabled) {
        enable("selection-options");
        enable("with-replacement");
        enable("without-replacement");
      }
      else {
        disable("selection-options");
        disable("with-replacement");
        disable("without-replacement");
      }
    }

    if (device !== "spinner") {
      setReplacementUI( !hidden);
      if (withReplacement) {
        document.getElementById("with-replacement").checked = true;
      } else {
        document.getElementById("without-replacement").checked = true;
      }
    } else {
      document.getElementById("with-replacement").checked = true;
      setReplacementUI( false);
    }
  }

  function appendUIHandlers(addVariable, removeVariable, addVariableSeries, runButtonPressed,
            stopButtonPressed, resetButtonPressed, switchState, refreshCaseList, setSampleSize,
            setNumRuns, setSpeed, speedText, setVariableName, setReplacement, setHidden,
            setOrCheckPassword, reloadDefaultSettings, becomeSelected) {
    document.getElementById("add-variable").onclick = addVariable;
    document.getElementById("remove-variable").onclick = removeVariable;
    document.getElementById("add-variable-series").onclick = addVariableSeries;
    document.getElementById("run").onclick = runButtonPressed;
    document.getElementById("stop").onclick = stopButtonPressed;
    document.getElementById("reset").onclick = resetButtonPressed;
    document.getElementById("mixer").onclick = switchState;
    document.getElementById("spinner").onclick = switchState;
    document.getElementById("collector").onclick = switchState;
    document.getElementById("sample_size").addEventListener('input', function (evt) {
      setSampleSize(this.value);
    });
    document.getElementById("repeat").addEventListener('input', function (evt) {
      setNumRuns(this.value);
    });
    document.getElementById("speed").addEventListener('input', function (evt) {
      var val = (this.value * 1),
          speed = val || 0.5;
      document.getElementById("speed-text").innerHTML = speedText[val];
      setSpeed(speed);
    });
    document.getElementById("variable-name-change").onblur = setVariableName;
    document.getElementById("variable-name-change").onkeypress = function(e) {
      if (e.keyCode === 13) {
        setVariableName();
        return false;
      }
    };
    document.getElementById("tab-sampler").onclick = viewSampler;
    document.getElementById("tab-options").onclick = viewOptions;
    document.getElementById("tab-about").onclick = viewAbout;

    document.getElementById("with-replacement").onclick = function(evt) {
      setReplacement(evt.currentTarget.checked);
    };
    document.getElementById("without-replacement").onclick = function(evt) {
      setReplacement(!evt.currentTarget.checked);
    };

    document.getElementById("hideModel").onclick = function(evt) {
      var hidden = evt.currentTarget.checked;
      setHidden(hidden);
      hideModel(hidden);
    };

    var passwordField = document.getElementById("password");
    passwordField.onclick = function(evt) {
      passwordField.value = "";
      passwordField.type = "text";
    };
    document.getElementById("pass-lock").onclick = function() {
      var password = document.getElementById("password").value;
      if (password.length > 0) {
        setOrCheckPassword(password);
      }
    };
    document.getElementById("reload-settings").onclick = function() {
      reloadDefaultSettings();
      viewSampler();
    };
    document.querySelector('body').addEventListener('click',
        becomeSelected, {capture:true});
  }

  // Sets up the UI elements based on the loaded state of the model
  function render(hidden, password, passwordFailed, withReplacement, device) {
    hideModel(hidden);
    var isLocked = !!password;
    lockOptions(isLocked);
    show(document.getElementById("password-failed"), passwordFailed);
    setReplacement(withReplacement, device, hidden);
  }

  return {
    getCollectorCollectionName: getCollectorCollectionName,
    appendUIHandlers: appendUIHandlers,
    enableButtons: enableButtons,
    disableButtons: disableButtons,
    enable: enable,
    disable: disable,
    setRunButton: setRunButton,
    toggleDevice: toggleDevice,
    renderVariableControls: renderVariableControls,
    populateContextsList: populateContextsList,
    getCollectionName: getCollectionName,
    setRunButtonMode: setRunButtonMode,
    render: render
  };
});
