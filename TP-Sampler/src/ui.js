/**
 * UI module
 *
 * Adds listeners to DOM elements, and helpers for updating their state
 */

define(function() {

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

  function disable(className) {
    addClass(document.getElementById(className), "disabled");
  }

  function enable(className) {
    removeClass(document.getElementById(className), "disabled");
  }

  function setRunButton(showRun) {
    if (showRun) {
      document.getElementById("run").innerHTML = "START";
    } else {
      document.getElementById("run").innerHTML = "PAUSE";
    }
  }

  function renderVariableControls(device) {
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

  function populateContextsList(caseVariables, view, codapCom) {
    return function (collections) {
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
        sel.removeAttribute("disabled");
      }

      function setVariablesAndRender(vars) {
        // push into existing array, as `variables` is pointing at this
        caseVariables.push.apply(caseVariables, vars);
        view.render();
      }

      if (sel.childNodes.length === 1) {
        codapCom.setCasesFromContext(sel.childNodes[0].value, caseVariables)
          .then(setVariablesAndRender);
      } else {
        sel.innerHTML = "<option>Select a collection</option>" + sel.innerHTML;
        sel.onchange = function(evt) {
          if(evt.target.value) {
            codapCom.setCasesFromContext(evt.target.value).then(setVariablesAndRender);
          }
        };
      }
    };
  }

  function toggleDevice(oldDevice, newDevice) {
    removeClass(document.getElementById(oldDevice), "active");
    addClass(document.getElementById(newDevice), "active");
  }

  function viewSampler() {
    addClass(document.getElementById("tab-sampler"), "active");
    removeClass(document.getElementById("tab-options"), "active");
    removeClass(document.getElementById("sampler"), "hidden");
    addClass(document.getElementById("options"), "hidden");
  }

  function viewOptions() {
    removeClass(document.getElementById("tab-sampler"), "active");
    addClass(document.getElementById("tab-options"), "active");
    addClass(document.getElementById("sampler"), "hidden");
    removeClass(document.getElementById("options"), "hidden");
  }

  function appendUIHandlers(addVariable, removeVariable, runButtonPressed, stopButtonPressed,
            resetButtonPressed, switchState, refreshCaseList, setSampleSize, setNumRuns, setSpeed,
            speedText, setVariableName, setHidden) {
    document.getElementById("add-variable").onclick = addVariable;
    document.getElementById("remove-variable").onclick = removeVariable;
    document.getElementById("run").onclick = runButtonPressed;
    document.getElementById("stop").onclick = stopButtonPressed;
    document.getElementById("reset").onclick = resetButtonPressed;
    document.getElementById("mixer").onclick = switchState;
    document.getElementById("spinner").onclick = switchState;
    document.getElementById("collector").onclick = switchState;
    document.getElementById("refresh-list").onclick = refreshCaseList;
    document.getElementById("sample_size").addEventListener('input', function (evt) {
      setSampleSize(this.value * 1);
    });
    document.getElementById("repeat").addEventListener('input', function (evt) {
      setNumRuns(this.value * 1);
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

    document.getElementById("hideModel").onclick = function(evt) {
      setHidden(evt.currentTarget.checked);
    };

  }

  return {
    appendUIHandlers: appendUIHandlers,
    enableButtons: enableButtons,
    disableButtons: disableButtons,
    enable: enable,
    disable: disable,
    setRunButton: setRunButton,
    toggleDevice: toggleDevice,
    renderVariableControls: renderVariableControls,
    populateContextsList: populateContextsList
  };
});
