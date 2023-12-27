import * as utils from './utils.js';
import * as localeMgr from './localeManager.js';
import {CodapCom} from './codap-com.js';
import {View} from './view.js';
import * as ui from './ui.js';

/* Global Snap:true */
var s = Snap("#model svg"),

    defaultSettings = {
      repeat: 3,
      draw: 5,
      speed: 1,
      variables: ["a", "b", "a"],
      device: "mixer",
      withReplacement: true,
      deviceName: "output"
    },

    dataSetName,
    device = defaultSettings.device,       // "mixer, "spinner", "collector"
    selectedMeasureName = "",
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
    deviceName = defaultSettings.deviceName,

    userVariables = defaultSettings.variables.slice(0),   // clone
    caseVariables = [],
    variables = userVariables,

    samples = [],

    uniqueVariables = [...new Set(variables)],

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
      deviceName: deviceName,
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
    deviceName = state.deviceName || deviceName;
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

export function updateDeviceName (name) {
  deviceName = name;
  ui.updateUIDeviceName(name);
};

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
    deviceName: deviceName,
    withReplacement: withReplacement,
    variables: variables,
    uniqueVariables: [...new Set(variables)],
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
  if (device === "spinner") {
    const newFraction = 1 / (uniqueVariables.length + 1);
    const pctMap = uniqueVariables.map((v) => {
      const currentPct = (variables.filter((variable) => variable === v).length / variables.length) * 100;
      const amtToSubtract = currentPct * newFraction;
      return {variable: v, pct: Math.round(currentPct - amtToSubtract)};
    });
    pctMap.push({variable: getNextVariable(), pct: Math.round(newFraction * 100)});
    let discrepancy = 100 - pctMap.reduce((sum, v) => sum + v.pct, 0);
    while (discrepancy !== 0) {
      const sign = discrepancy > 0 ? 1 : -1;
      const index = Math.floor(Math.random() * pctMap.length);
      pctMap[index].pct += sign;
      discrepancy -= sign;
    }
    const lcd = utils.findCommonDenominator(pctMap.map((v) => v.pct));
    variables.splice(0, variables.length);
    pctMap.forEach((vPct) => {
      const newNum = utils.findEquivNum(vPct.pct, lcd);
      variables.push(...Array.from({ length: newNum }, () => vPct.variable));
    })
  } else {
    variables.push(getNextVariable());
  }
  uniqueVariables = [...new Set(variables)];
  view.render();
  ui.enable("remove-variable");
  codapCom.logAction("addItem");
}

function removeVariable() {
  this.blur();
  if (running) return;
  if (variables.length === 1) return;
  variables.pop();
  uniqueVariables = [...new Set(variables)];
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
    var sequence = utils.parseSpecifier(sequenceRequest, localeMgr.tr("DG.plugin.Sampler.range-word"));
    if (sequence) {
      // swap contents of sequence into variables without updating variables reference
      variables.length = 0;
      Array.prototype.splice.apply(variables, [0, sequence.length].concat(sequence));
      codapCom.logAction("RequestedItemSequence: %@", sequenceRequest);
    }
    else alert(localeMgr.tr('DG.plugin.Sampler.sample-list.parse-error'));
  }

  view.render();
}

function showSequencePrompt() {
  // eslint-disable-next-line no-alert
  return window.prompt(
      localeMgr.tr('DG.plugin.Sampler.sample-list.prompt',
          [localeMgr.tr('DG.plugin.Sampler.range-word')]),
      localeMgr.tr('DG.plugin.Sampler.sample-list.initial-value',
          [localeMgr.tr('DG.plugin.Sampler.range-word')]));
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
  experimentNumber = 1;
  mostRecentRunNumber = 0;
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
  codapCom.addValuesToCODAP(++mostRecentRunNumber, vars, isCollector, deviceName);
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
        codapCom.addMultipleSamplesToCODAP(samples, isCollector, deviceName);

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
      }
    } else {
      setTimeout(selectNext, timeout);
    }
  }

  function lookupDeviceType(device) {
    var deviceTypeMap = {
      mixer: "DG.plugin.Sampler.device-selection.mixer",
      spinner: "DG.plugin.Sampler.device-selection.spinner",
      collector: "DG.plugin.Sampler.device-selection.collector"
    }
    return localeMgr.tr(deviceTypeMap[device]);
  }

  function lookupItemName(device) {
    var deviceTypeMap = {
      mixer: "DG.plugin.sampler.experiment.description-mixer-item-kind",
      spinner: "DG.plugin.sampler.experiment.description-spinner-item-kind",
      collector: "DG.plugin.sampler.experiment.description-collector-item-kind"
    }
    return localeMgr.tr(deviceTypeMap[device]);
  }

  var runNumber,
      currRunNumber = 0,
      draw = 0,
      tSampleSize = Math.floor(sampleSize),
      tNumRuns = Math.floor(numRuns),
      // sample group size is the number of samples we will send in one message
      sampleGroupSize = Math.ceil(kFastestItemGroupSize/(tSampleSize||1)),
      tItems = lookupItemName(device),//device === "mixer" ? "items" : (device === "spinner" ? "sections" : "cases"),
      tReplacementID = withReplacement ?
          "DG.plugin.Sampler.selection-options.with-replacement" :
          "DG.plugin.Sampler.selection-options.without-replacement",
      tReplacement = localeMgr.tr(tReplacementID),
      tUniqueVariables = new Set(variables),
      tNumItems = device === "spinner" ? tUniqueVariables.size : variables.length,
      tCollectorDataset = isCollector ?
          localeMgr.tr("DG.plugin.sampler.experiment.description-collector-phrase",
              [ui.getCollectorCollectionName()]) :
          " ",
      deviceType = lookupDeviceType(device),
      tDescription, // = hidden ? "hidden!" : device + " containing " + tNumItems + " " + tItems +
          //tCollectorDataset + tReplacement,
      tStringifiedVariables = JSON.stringify(variables);

  if (hidden) {
    tDescription = localeMgr.tr("DG.plugin.sampler.experiment.no-description");
  }
  else {
    tDescription = localeMgr.tr("DG.plugin.sampler.experiment.description", [
      deviceType,
      tNumItems,
      tItems,
      tCollectorDataset,
      tReplacement
    ])
  }

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
  codapCom.findOrCreateDataContext(deviceName).then(function () {
    codapCom.startNewExperimentInCODAP(experimentNumber, tDescription, tSampleSize);
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
  uniqueVariables = [...new Set(variables)];
  for (var i = 0, ii = variables.length; i < ii; i++) {
    var v = variables[i],
        inserted = false,
        j = -1;
    while (!inserted && ++j < sortedVariables.length) {
      if (sortedVariables[j] === v) {
        sortedVariables.splice(j, 0, v);
        inserted = true;
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
  if (this && this.blur) this.blur();
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
      codapCom.getContexts().then(ui.populateContextsList(caseVariables, view, codapCom, localeMgr));
    }
    setup();
    view.render();
  }
}

function refreshCaseList() {
  codapCom.getContexts().then(ui.populateContextsList(caseVariables, view, codapCom, localeMgr));
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

function setDeviceName(name) {
  if (name) {
    codapCom.updateDeviceNameInTable(name);
    codapCom.logAction("setDeviceName: %@", name);
    deviceName = name;
    view.render();
    updateRunButtonMode();
  }
}

function setMeasureName(name) {
  selectedMeasureName = name;
  view.render();
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

export function getOptionsForMeasure (measure) {
  // get list of attributes from CODAP
  codapCom.getAttributesFromTable().then((attrs) => {
    const attrNames = attrs.map((attr) => attr.name);
    codapCom.getAllItems().then((items) => {
      let attrMap = {};
      attrNames.forEach((attrName) => {
        if (attrName === deviceName && !isCollector) {
          attrMap[attrName] = [...new Set(variables)];
        } else if (attrName !== deviceName && isCollector) {
          const variableAttrs = Object.keys(variables[0]);
          variableAttrs.forEach((variableAttr) => {
            attrMap[variableAttr] = [...new Set(variables.map((variable) => variable[variableAttr]))];
          });
        } else {
          attrMap[attrName] = [...new Set(items.map((item) => item.values[attrName]).filter((val) => val.toString().length > 0))];
        }
      });

      function createAttrOptions (selectEl) {
        const attrOptions = Object.keys(attrMap).filter((attrName) => attrMap[attrName].length > 0);
        attrOptions.forEach((option, i) => {
          const outputOption = document.createElement("option");
          outputOption.value = option;
          outputOption.textContent = option;
          if (i === 0) {
            outputOption.selected = true;
          }
          selectEl.appendChild(outputOption);
        });
      };

      function createValueOptions (selectEl, selectedAttribute) {
        const attrValues = attrMap[selectedAttribute];
        if (attrValues.length) {
          const options = attrValues.map((v) => {return {value: v, text: v}});
          options.forEach((option, i) => {
            const valueOption = document.createElement("option");
            valueOption.value = option.value;
            valueOption.textContent = option.text;
            if (i === 0) {
              valueOption.selected = true;
            }
            selectEl.appendChild(valueOption);
          });
          return options;
        }
      };

      function createOperatorOptions (selectEl, values) {
        function isStringNumber(str) {
          return !isNaN(parseFloat(str)) && isFinite(str);
        }
        const anyVariableIsNumber = values.some((v) => isStringNumber(v.value));
        if (anyVariableIsNumber) {
          const options = ["=", "≠", "<", ">", "≤", "≥"]
          options.forEach((option, i) => {
            const operatorOpt = document.createElement("option");
            operatorOpt.value = option;
            operatorOpt.textContent = option;
            if (i === 0) {
              operatorOpt.selected = true;
            }
            selectEl.appendChild(operatorOpt);
          })
        } else {
          const equalsOpt = document.createElement("option");
          equalsOpt.value = "=";
          equalsOpt.textContent = "=";
          selectEl.appendChild(equalsOpt);
          const notEqualsOpt = document.createElement("option");
          notEqualsOpt.value = "≠";
          notEqualsOpt.textContent = "≠";
          selectEl.appendChild(notEqualsOpt);
        }
      };

      const selectAttrElement = document.getElementById(`${measure}-select-attribute`);

      const handleSelectAttrChange = (e, selectValueEl, selectOperatorEl) => {
        while (selectValueEl.firstChild) {
          selectValueEl.removeChild(selectValueEl.lastChild);
        }
        const availableOptions = createValueOptions(selectValueEl, e.target.value);
        while (selectOperatorEl.firstChild) {
          selectOperatorEl.removeChild(selectOperatorEl.lastChild);
        }
        createOperatorOptions(selectOperatorEl, availableOptions);
      }

      const setUpOptions = (selectElement, suffix = "") => {
        createAttrOptions(selectElement);
        const selectValue = document.getElementById(`${measure}-select-value${suffix}`);
        const availableValues = createValueOptions(selectValue, selectElement.value);
        const selectOperator = document.getElementById(`${measure}-select-operator${suffix}`);
        createOperatorOptions(selectOperator, availableValues);
        selectElement.onchange = (e) => handleSelectAttrChange(e, selectValue, selectOperator);
      }

      // if no attributes in attrMap have values, don't show the options
      if (Object.keys(attrMap).every((attrName) => attrMap[attrName].length === 0)) {
        return;
      }

      // sum(output) || mean(output) || median(output)
      if (measure === "sum" || measure === "mean" || measure === "median") {
        createAttrOptions(selectAttrElement);
      // count(output = "value") || 100 * count(output = "value")
      } else if (measure === "count" || measure === "percent") {
        setUpOptions(selectAttrElement);
      // (output="value", output2) || (output2, output = “value”) || (output2, output = “value”)
      } else if (measure === "conditional_sum" || measure === "conditional_mean" || measure === "conditional_median") {
        createAttrOptions(selectAttrElement);
        const selectAttrElement2 = document.getElementById(`${measure}-select-attribute-2`);
        setUpOptions(selectAttrElement2);
      // (output1, output2 = “value1”) – mean(output1, output2 = “value2”) || (output1, output2 = “value1”) – median(output1, output2 = “value2”)
      } else if (measure === "difference_of_means" || measure === "difference_of_medians") {
        const selectAttrElPt1 = document.getElementById(`${measure}-select-attribute-pt-1`);
        createAttrOptions(selectAttrElPt1);
        const selectAttrElPt12 = document.getElementById(`${measure}-select-attribute-pt-1-2`);
        setUpOptions(selectAttrElPt12, "-pt-1");
        const selectAttrElPt2 = document.getElementById(`${measure}-select-attribute-pt-2`);
        createAttrOptions(selectAttrElPt2);
        const selectAttrElPt22 = document.getElementById(`${measure}-select-attribute-pt-2-2`);
        setUpOptions(selectAttrElPt22, "-pt-2");
      }
    });
  });
}

function sendFormulaToCodap (formula, selections) {
  var measureName = selectedMeasureName ? selectedMeasureName : null;
  codapCom.sendFormulaToTable(measureName, formula, selections);
}

function getRunNumber () {
  return experimentNumber;
}

localeMgr.init().then(() => {
  codapCom = new CodapCom(getInteractiveState, loadInteractiveState,
      localeMgr);
  codapCom.init()
      .then(setCodapDataSetName)
      .catch(codapCom.error);

  view = new View(getProps, isRunning, setRunning, isPaused, setup, codapCom,
      localeMgr, sortVariablesForSpinner);

  ui.appendUIHandlers(addVariable, removeVariable, addVariableSeries,
      runButtonPressed, stopButtonPressed, resetButtonPressed, switchState, setSampleSize, setNumRuns, setDeviceName, setSpeed, view,
      view.setVariableName, view.setPercentage, setReplacement, setHidden, setOrCheckPassword,
      reloadDefaultSettings, becomeSelected, sendFormulaToCodap, setMeasureName,
      getRunNumber);

  // initialize and render the model
  setup();
});
