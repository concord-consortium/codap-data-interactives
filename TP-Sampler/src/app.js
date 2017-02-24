Snap.plugin(function (Snap, Element) {

  Element.prototype.pause = function () {
    var anims = this.inAnim();
    for (var i = 0; i < anims.length; i ++) {
      anims[i].mina.pause();
    }
  };

  Element.prototype.resume = function () {
    var anims = this.inAnim();
    for (var i = 0; i < anims.length; i ++) {
      this.animate({ dummy: 0 } ,1);
      anims[i].mina.resume();
    }
  };

});

var s = Snap("#model svg"),

    device = "mixer",       // ..."spinner"

    width = 205,            // svg units
    height = 220,
    containerX = 10,
    containerY = 0,
    containerWidth = 130,
    containerHeight = 220,
    capHeight = 6,
    capWidth = 40,
    border = 2,

    spinnerRadius = Math.min(containerWidth, containerHeight)/2,
    spinnerX = containerX + (containerWidth/2),
    spinnerY = containerY + (containerHeight/2),

    codapConnected = true,

    running = false,
    paused = false,
    animationRequest = null,
    speed = 1,  //  0.5, 1, 2, 3=inf
    speedText = ["Slow", "Medium", "Fast", "Fastest"],

    experimentNumber = 0,
    runNumber = 0,
    sentRun = 0,
    sequence = [],

    numRuns = 5,
    sampleSize = 2,

    experimentCaseID,
    runCaseID,

    variables = ["a", "b", "a"],
    balls = [],
    sampleSlotTargets = [],
    sampleSlots = [],
    samples = [],

    needle,
    needleTurns = 0,
    wedges = [],
    uniqueVariables,

    editingVariable = false,    // then the id of the var
    variableNameInput = document.getElementById("variable-name-change");

function render() {
  s.clear();
  document.getElementById("draws").value = sampleSize;
  document.getElementById("repeat").value = numRuns;
  var sliderSpeed = speed > 0.5 ? speed : 0;
  document.getElementById("speed").value = sliderSpeed;
  document.getElementById("speed-text").innerHTML = speedText[sliderSpeed];

  createSampleSlots();
  if (device == "mixer") {
    createMixer();
  } else {
    createSpinner();
  }
}

function createSampleSlots() {
  var x = containerWidth + ((width - containerWidth)  / 3),
      centerY = containerY + (containerHeight/2),
      stroke = border / 2,
      padding = 2,
      maxHeight = 20,
      minHeight = Math.max(10, (containerHeight/sampleSize)),
      slotHeight = Math.min(minHeight, maxHeight),
      slotSize = slotHeight - padding - (stroke*2),
      maxSlotDepth = 4,
      minSlotDepth = slotSize/3,
      slotDepth = Math.min(minSlotDepth, maxSlotDepth),
      stroke = (slotHeight < maxHeight) ? stroke / 2 : stroke,
      totalHeight = slotHeight * sampleSize,
      mx = x + (maxSlotDepth - slotDepth),
      y = Math.max(containerY, centerY - (totalHeight / 2));

  sampleSlotTargets = [];
  sampleSlots = [];

  for (var i = 0; i < sampleSize; i++) {
    var my = y + padding + (slotHeight * i),
        pathStr = "m"+mx+","+my+" h -"+slotDepth+" v "+slotSize+" h "+slotDepth,
        r = slotSize/2,
        letterCenterX = mx + r,
        letterCenterY = my + (slotSize / 2);

    // first we make circles to mark the spot for letter movement
    sampleSlotTargets.push(s.circle(letterCenterX, letterCenterY, r).attr({
      fill: "#fff",
      stroke: "#fff",
      strokeWidth: 0
    }));

    // then the slots
    sampleSlots.push(s.path(pathStr).attr({
      fill: "none",
      stroke: "#333",
      strokeWidth: stroke
    }));
  }
}

function createMixer() {
  var halfb = (border/2),
      mx = containerX + halfb,
      my = containerY + halfb,
      h = containerHeight - border,
      shoulder = (h - capWidth) / 2,
      cap = capHeight - halfb,
      w = containerWidth - capHeight - halfb,
      // pathStr = "m"+mx+","+my+" h "+shoulder+" v -"+cap+" h "+capWidth+" v "+cap+" h "+shoulder+" v "+h+" h -"+w+" z";
      pathStr = "m"+mx+","+my+" h "+w+" v "+shoulder+" h "+cap+" v "+capWidth+" h -"+cap+" v "+shoulder+" h -"+w+" z";

  s.path(pathStr).attr({
        fill: "none",
        stroke: "#333",
        strokeWidth: border
    });

  addMixerVariables();
}

function addMixerVariables() {
  balls = [];

  var w = containerWidth - capHeight - (border * 2),
      radius = 14,
      maxInRow = Math.floor(w / (radius*2)),
      rows = Math.floor(variables.length/maxInRow),
      radius = rows > 6 ? 9 : 14,      // repeat these to recalculate once
      maxInRow = Math.floor(w / (radius*2));
  // other calcs...
  for (var i = 0, ii=variables.length; i<ii; i++) {
    var rowNumber = Math.floor(i/maxInRow),
        rowIndex = i % maxInRow,
        rowHeight = rows < 3 ? (radius * 2) : rows < 5 ? (radius * 1.5) : radius,
        x = (rowNumber % 2 == 0) ? containerX + border + radius + (rowIndex * radius * 2) : containerX + containerWidth - border - capHeight - radius - (rowIndex * radius * 2),
        y = containerY + containerHeight - border - radius - (rowHeight * rowNumber);

    var labelClipping = s.circle(x, y, radius);
    // render ball to the screen
    var circle = s.circle(x, y, radius).attr({
          fill: getVariableColor(i, ii, true),
          stroke: "#000",
          strokeWidth: 1
        }),
        label = s.text(x, y, variables[i]).attr({
          fontSize: radius,
          textAnchor: "middle",
          dy: ".25em",
          dx: getTextShift(variables[i], 4),
          clipPath: labelClipping
        })
        ball = s.group(
          circle,
          label
        );
    balls.push(ball);
    ball.click(showVariableNameInput(i));
    ball.hover((function(circ, lab, _i) {
      return function() {
        if (running) return;
        circ.attr({ fill: getVariableColor(_i, ii) });
        lab.attr({ fontSize: radius + 2, dy: ".26em", });
      }
    })(circle, label, i), (function(circ, lab, _i) {
      return function() {
        circ.attr({ fill: getVariableColor(_i, ii, true) });
        lab.attr({ fontSize: radius, dy: ".25em", });
      }
    })(circle, label, i));
  }

  // setup animation
  for (var i = 0, ii = balls.length; i < ii; i++) {
    var speed = 5 + (Math.random() * 7),
        direction = Math.PI + (Math.random() * Math.PI);
    balls[i].vx = Math.cos(direction) * speed;
    balls[i].vy = Math.sin(direction) * speed;
  }
}

function getNextVariable() {
  // brain-dead version for now
  return "" + (variables.length + 1);
}

function addVariable() {
  this.blur();
  if (running) return;
  variables.push(getNextVariable());
  render();
  removeClass(document.getElementById("remove-variable"), "disabled");
}

function removeVariable() {
  this.blur();
  if (running) return;
  if (variables.length === 1) return;
  variables.pop();
  render();

  if (variables.length < 2) {
    addClass(document.getElementById("remove-variable"), "disabled");
  }
}

function showVariableNameInput(i) {
  return function() {
    if (running) return;

    var loc = this.node.getClientRects()[0],
        text = variables[i],
        width = Math.min(30, Math.max(10, text.length * 3)) + "vh";
    variableNameInput.style.display = "block";
    variableNameInput.style.top = (loc.top + loc.height/2) + "px";
    variableNameInput.style.left = (loc.left) + "px";
    variableNameInput.style.width = width;
    variableNameInput.value = text;
    variableNameInput.focus();
    editingVariable = i;

    if (device == "mixer") {
      variables[editingVariable] = "";
    } else {
      var v = variables[editingVariable];
      editingVariable = [];
      for (var j = 0, jj = variables.length; j < jj; j++) {
        if (variables[j] == v) {
          variables[j] = "";
          editingVariable.push(j);
        }
      }
    }
    render();
  }
}

function setVariableName() {
  if (editingVariable !== false) {
    var newName = variableNameInput.value;
    if (!newName) newName = "_";
    if (Array.isArray(editingVariable)) {
      for (var i = 0, ii = editingVariable.length; i < ii; i++) {
        variables[editingVariable[i]] = newName;
      }
    } else {
      variables[editingVariable] = newName;
    }
    variableNameInput.style.display = "none";
    render();
    editingVariable = false;
  }
}

/**
 * Creates a set of random sequence, each containing the index
 * of the ball to be selected.
 *
 * @param {int} draw - The number of variables drawn per run
 * @param {int} repeat - The number of runs
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

function getTransformForMovingTo(x, y, circ) {
  var t = {
    dx: x - (circ.attr("cx") * 1),
    dy: y - (circ.attr("cy") * 1)
  };
  return "T"+t.dx+","+t.dy;
}

function runButtonPressed() {
  this.blur();
  if (!running) {
    running = true;
    disableButtons();
    run();
  } else {
    paused = !paused;
    pauseSnapAnimations(paused);
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
  endAnimation();
}

function addNextSequenceRunToCODAP() {
  if (!sequence[sentRun]) return;

  var vars = sequence[sentRun].map(function(i) {
    return variables[i];
  });
  addValuesToCODAP(sentRun+1, vars);
  sentRun++;
}

function run() {
  startNewExperimentInCODAP().then(function() {
    sequence = createRandomSequence(sampleSize, numRuns);
    if (speed === 3) {
      sendSequenceDirectlyToCODAP(sequence);
      reset();
      return;
    }

    var run = 0,
        draw = 0;
    sentRun = 0;

    function selectNext() {
      if (!paused) {
        animateSelectNextVariable(sequence[run][draw], draw, addNextSequenceRunToCODAP);

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
          setTimeout(endAnimation, 1000/speed);
        }
      }
    }

    if (device == "mixer") {
      animateMixer();
    }

    selectNext();
  });
}

function animateSelectNextVariable(selection, draw, selectionMadeCallback) {
  if (!running) return;

  if (device == "mixer") {
    animateMixerSelection(selection, draw, selectionMadeCallback);
  } else {
    animateSpinnerSelection(selection, draw, selectionMadeCallback)
  }
}

function moveLetterToSlot(slot, sourceLetter, insertBeforeElement, initialTrans, selectionMadeCallback) {
  if (!running) return;
  // move variable to slot
  var letter = sourceLetter.clone();
  letter.attr({
    textAnchor: "start",
    clipPath: "none"
  });
  samples.push(letter);
  insertBeforeElement.before(letter);

  if (initialTrans) {
    letter.attr({transform: initialTrans});
  }

  var origin = letter.getBBox();
  var target = sampleSlotTargets[slot].getBBox();
  matrix = letter.transform().localMatrix;
  matrix.translate((target.x-origin.x), (target.cy-origin.cy));

  var size = sampleSlotTargets[slot].attr("r")*2;

  letter.animate({transform: matrix, fontSize: size, dy: size/4}, 200/speed);

  if (slot == sampleSize-1) {
    setTimeout(pushLettersOut, 300/speed);
    setTimeout(returnSlots, 600/speed);
    setTimeout(selectionMade, 600/speed);
    function selectionMade() {
      if (paused) {
        setTimeout(selectionMade, 200);
      } else {
        selectionMadeCallback();
      }
    }

    function pushLettersOut() {
      if (!running) return;
      if (paused) {
        setTimeout(pushLettersOut, 200);
        return;
      }
      for (var i = 0, ii = sampleSlots.length; i < ii; i++) {
        var sampleSlot = sampleSlots[i],
            letter = samples[i],
            sampleMatrix = sampleSlot.transform().localMatrix,
            letterMatrix = letter.transform().localMatrix;
        sampleMatrix.translate(20, 0);
        letterMatrix.translate(40, 0);
        sampleSlot.animate({transform: sampleMatrix}, 200/speed);
        letter.animate({transform: letterMatrix}, 200/speed, (function(lett) {
          return function() {
            lett.remove();
            samples = [];
          }
        })(letter));
      }
    }
    function returnSlots() {
      if (paused) {
        setTimeout(returnSlots, 200);
        return;
      }
      for (var i = 0, ii = sampleSlots.length; i < ii; i++) {
        var sampleSlot = sampleSlots[i];
        sampleSlot.animate({transform: "T0,0"}, 200/speed);
      }
    }
  }
}

function animateMixerSelection(selection, draw, selectionMadeCallback) {
  var ball = balls[selection],
      circle = ball.select("circle"),
      variable = ball.select("text"),
      trans = getTransformForMovingTo(containerX + containerWidth - circle.attr("r") * 1, containerY + (containerHeight/2), circle);

  ball.beingSelected = true;
  if (ball.getBBox().y > containerY + (containerHeight/2)) {
    ball.vy = -Math.abs(ball.vy);
  } else {
    ball.vy = Math.abs(ball.vy);
  }

  ball.animate({transform: trans}, 300/speed, function() {
    moveLetterToSlot(draw, variable, ball, trans, selectionMadeCallback);
    ball.beingSelected = false;
  });
}

function animateMixer() {
  if (running) {
    setTimeout(function() {
      animationRequest = requestAnimationFrame(animateMixer);
    }, 30);
  }
  mixerAnimationStep();
}

function mixerAnimationStep() {
  if (!paused) {
    for (var i = 0, ii = balls.length; i < ii; i++) {
      if (!balls[i].beingSelected) {
        var ball = balls[i],
            matrix = ball.transform().localMatrix;
        matrix.translate(ball.vx*speed, ball.vy*speed);
        ball.attr({transform: matrix});

        var bbox = ball.getBBox();
        if (bbox.x < (containerX + border)) {
          ball.vx = Math.abs(ball.vx);
          matrix.translate(ball.vx * 2, ball.vy);
          ball.attr({transform: matrix});
        } else if ((bbox.x + bbox.w) > containerX + (containerWidth - capHeight - border)) {
          ball.vx = -Math.abs(ball.vx);
          matrix.translate(ball.vx * 2, ball.vy);
          ball.attr({transform: matrix});
        }
        if (bbox.y < (containerY + border) || (bbox.y + bbox.h) > containerY + containerHeight - border) {
          ball.vy *= -1;
          matrix.translate(ball.vx, ball.vy * 2);
          ball.attr({transform: matrix});
        }
      }
    }
  }
}

function fastforwardToEnd() {
  endAnimation();
  while (sequence[sentRun]) {
    addNextSequenceRunToCODAP();
  }
}

function endAnimation() {
  if (paused) {
    setTimeout(endAnimation, 200);
    return;
  }
  running = false;
  for (var i = 0, ii = balls.length; i < ii; i++) {
    balls[i].animate({transform: "T0,0"}, (800 + (Math.random() * 300))/speed, mina.bounce);
  }
  setTimeout(reset, 800/speed);
}

function pauseSnapAnimations(doPause) {
  func = doPause ? "pause" : "resume";
  var animatedObjects = balls.concat(sampleSlotTargets).concat(sampleSlots).concat(samples);
  if (needle) {
    animatedObjects.push(needle);
  }
  for (var i = 0, ii = animatedObjects.length; i < ii; i++) {
    animatedObjects[i][func]();
  }
}

function reset() {
  if (animationRequest) cancelAnimationFrame(animationRequest);
  enableButtons();
  balls = [];
  needle = null;
  needleTurns = 0;
  wedges = [];
  sampleSlotTargets = [];
  sampleSlots = [];
  samples = [];
  running = false;
  paused = false;
  render();
}

function getTextShift(text, maxLetters) {
  var lettersOver = Math.max(0, text.length - maxLetters);
  return (0.2 * lettersOver) + "em";
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
  variables = sortedVariables;
}

function createSpinner() {
  wedges = [];
  sortVariablesForSpinner();
  if (uniqueVariables === 1) {
    var circle = s.circle(spinnerX, spinnerY, spinnerRadius).attr({
          fill: getVariableColor(0, 0)
        }),
        labelClipping = s.circle(spinnerX, spinnerY, spinnerRadius),
        label = createSpinnerLabel(0, 0, spinnerX, spinnerY,
                  spinnerRadius/2, labelClipping, 9, circle);
    wedges.push(label);
  } else {
    var slicePercent = 1 / variables.length,
        lastVariable = "",
        mergeCount = 0,
        offsetDueToMerge = 0;

    for (var i = 0, ii = variables.length; i < ii; i++) {
      var merge = variables[i] == lastVariable,
          mergeCount = merge ? mergeCount + 1 : 0,
          slice = getSpinnerSliceCoords(i, slicePercent, spinnerRadius, mergeCount),
          textSize = spinnerRadius / (3 + (ii * 0.1));

      lastVariable = variables[i];
      if (merge) offsetDueToMerge++;


      // wedge color
      var wedge = s.path(slice.path).attr({
        fill: getVariableColor((i - offsetDueToMerge), uniqueVariables),
        stroke: "none"
      });

      // label
      var labelClipping = s.path(slice.path),
          label = createSpinnerLabel(i, i - offsetDueToMerge, slice.center.x, slice.center.y, textSize,
                    labelClipping, Math.max(1, 10 - variables.length), wedge);
      wedges.push(label);

      // white stroke on top of label
      s.path(slice.path).attr({
        fill: "none",
        stroke: "#fff",
        strokeWidth: i == ii - 1 ? 0.5 : 1
      });
    }
  }
}

function createSpinnerLabel(variable, uniqueVariable, x, y, fontSize, clipping, maxLength, parent) {
  var text = variables[variable],
      label = s.text(x, y, text).attr({
        fontSize: fontSize,
        textAnchor: "middle",
        dy: ".25em",
        dx: getTextShift(text, maxLength),
        clipPath: clipping
      });

  label.click(showVariableNameInput(variable));
  label.hover(function() {
    this.attr({ fontSize: fontSize + 2, dy: ".26em", });
    parent.attr({ fill: getVariableColor(uniqueVariable, uniqueVariables, true) });
  }, function() {
    this.attr({ fontSize: fontSize, dy: ".25em", });
    parent.attr({ fill: getVariableColor(uniqueVariable, uniqueVariables) });
  });
  return label;
}

function getSpinnerSliceCoords(i, slicePercent, radius, mergeCount) {
  var startIndex = i - mergeCount,
      perc1 = startIndex * slicePercent,
      perc2 = (i + 1) * slicePercent,
      p1 = getCoordinatesForPercent(radius, perc1),
      p2 = getCoordinatesForPercent(radius, perc2),
      centerP = getCoordinatesForPercent(radius, (perc1+perc2)/2),
      largeArc = perc2 - perc1 > 0.5 ? 1 : 0;

  return {
    path: "M "+p1.join(" ")+" A "+radius+" "+radius+" 0 "+largeArc+" 1 "+p2.join(" ")+" L "+spinnerX+" "+spinnerY,
    center: {
      x: (spinnerX + centerP[0]) / 2,
      y: (spinnerY + centerP[1]) / 2
    }
  };
}

function getCoordinatesForPercent(radius, percent) {
  var perc = percent + 0.75,    // rotate 3/4 to start at top
      x = spinnerX + (Math.cos(2 * Math.PI * perc) * radius),
      y = spinnerY + (Math.sin(2 * Math.PI * perc) * radius);

  return [x, y];
}

function getVariableColor(i, slices, lighten) {
  var baseColorHue = 173,
      hueDiff = Math.min(15, 60/slices),
      hue = (baseColorHue + (hueDiff * i)) % 360,
      huePerc = (hue / 360) * 100,
      lightPerc = 61 + (lighten ? 20 : 0);
  return "hsl("+huePerc+"%, 71%, "+lightPerc+"%)"
}

function animateSpinnerSelection(selection, draw, selectionMadeCallback) {
  if (!needle) {
    // draw initial needle
    var needleNorthLength = spinnerRadius * 2/3,
        needleSouthLength = spinnerRadius / 5,
        needleWidth = spinnerRadius / 15,
        n = getCoordinatesForPercent(needleNorthLength, 0),
        e = getCoordinatesForPercent(needleWidth, 0.25),
        so = getCoordinatesForPercent(needleSouthLength, 0.5),
        w = getCoordinatesForPercent(needleWidth, 0.75),
        path = "M "+n.join(" ")+" L "+e.join(" ")+" L "+so.join(" ")+" L "+w.join(" ")+" Z";

    needle = s.group(
      s.path(path).attr({
        fill: "#000"
      }),
      s.circle(spinnerX, spinnerY, needleWidth/2).attr({
        fill: "#fff"
      })
    );
  }

  needleTurns += 2;

  var wedgePerc = 0.1 + Math.random() * 0.8,
      targetPerc = (selection + wedgePerc) / variables.length,
      targetAngle = (needleTurns * 360) + (360 * targetPerc);

  needle.animate({transform: "R"+targetAngle+","+spinnerX+","+spinnerY}, 600/speed, mina.easeinout, function() {
    var letter = wedges[selection] || wedges[0];
    moveLetterToSlot(draw, letter, letter, null, selectionMadeCallback);
  });
}

function switchState(evt, state) {
  if (this.blur) this.blur();
  var selectedDevice = state || this.id;
  if (selectedDevice !== device) {
    reset();
    removeClass(document.getElementById(device), "active");
    addClass(document.getElementById(selectedDevice), "active");
    device = selectedDevice;
    render();
  }
}

document.getElementById("add-variable").onclick = addVariable;
document.getElementById("remove-variable").onclick = removeVariable;
document.getElementById("run").onclick = runButtonPressed;
document.getElementById("stop").onclick = stopButtonPressed;
document.getElementById("mixer").onclick = switchState;
document.getElementById("spinner").onclick = switchState;
document.getElementById("draws").addEventListener('input', function (evt) {
    sampleSize = this.value * 1;
    render();
});
document.getElementById("repeat").addEventListener('input', function (evt) {
    numRuns = this.value * 1;
    render();
});
document.getElementById("speed").addEventListener('input', function (evt) {
    speed = (this.value * 1) || 0.5;
    document.getElementById("speed-text").innerHTML = speedText[this.value * 1];
    if (running && !paused && speed == 3) {
      fastforwardToEnd();
    }
});
variableNameInput.onblur = setVariableName;
variableNameInput.onkeypress = function(e) {
  if (e.keyCode == 13) {
    setVariableName();
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
  removeClass(document.getElementById("stop"), "disabled");
}
function enableButtons() {
  setRunButton(true);
  removeClass(document.getElementById("add-variable"), "disabled");
  removeClass(document.getElementById("remove-variable"), "disabled");
  addClass(document.getElementById("stop"), "disabled");
}
function setRunButton(showRun) {
  if (showRun) {
    document.getElementById("run").innerHTML = "START";
  } else {
    document.getElementById("run").innerHTML = "PAUSE";
  }
}


reset();
render();

// connect to CODAP

codapInterface.on('get', 'interactiveState', function () {
  return {success: true, values: {
    experimentNumber: experimentNumber,
    variables: variables,
    draw: sampleSize,
    repeat: numRuns,
    speed: speed,
    device: device
  }};
});

// initialize the codapInterface
codapInterface.init({
    name: 'Sampler',
    title: 'Sampler',
    dimensions: {width: 233, height: 400},
    version: '0.1',
    stateHandler: function (state) {
      if (state) {
        experimentNumber = state.experimentNumber || experimentNumber;
        variables = state.variables || variables;
        sampleSize = state.draw || sampleSize;
        numRuns = state.repeat || numRuns;
        speed = state.speed || speed;
        if (state.device) {
          switchState(null, state.device)
        }

        render();
      }
    }
  }).then(function () {
    // Determine if CODAP already has the Data Context we need.
    // If not, create it.
    return codapInterface.sendRequest({
        action:'get',
        resource: 'dataContext[Sampler]'
      }, function (result) {
        if (result && !result.success) {
          codapInterface.sendRequest({
            action: 'create',
            resource: 'dataContext',
            values: {
              name: "Sampler",
              collections: [
                {
                  name: 'experiments',
                  attrs: [
                    {name: "experiment", type: 'categorical'},
                    {name: "draws", type: 'categorical'}
                  ],
                  childAttrName: "experiment"
                },
                {
                  name: 'runs',
                  parent: 'experiments',
                  // The parent collection has just one attribute
                  attrs: [{name: "run", type: 'categorical'}],
                  childAttrName: "run"
                },
                {
                  name: 'draws',
                  parent: 'runs',
                  labels: {
                    pluralCase: "draws",
                    setOfCasesWithArticle: "a draw"
                  },
                  // The child collection also has just one attribute
                  attrs: [{name: "value"}]
                }
              ]
            }
          }, function(result) { console.log(result)});;
        }
      }
    );
  },
  function (err) {
    codapConnected = false;
  }
);

function startNewExperimentInCODAP() {
  openTable();
  return new Promise(function(resolve, reject) {
    if (!codapConnected) {
      console.log('Not in CODAP')
      resolve();
      return;
    }

    experimentNumber++;
    runNumber = 0; // Each experiment starts the runNumber afresh
    codapInterface.sendRequest({
      action: 'create',
      resource: 'collection[experiments].case',
      values: [{
        values: {
          experiment: experimentNumber,
          draws: sampleSize
        }
      }]
    }, function (result) {
      if (result && result.success) {
        experimentCaseID = result.values[0].id;
        resolve();
      } else {
        window.alert('Unable to begin experiment');
        reject();
      }
    });
  });
}

function addValuesToCODAP(run, vals) {
  if (!codapConnected) {
    return;
  }

  codapInterface.sendRequest({
    action: 'create',
    resource: 'collection[runs].case',
    values: [
     {
      parent: experimentCaseID,
      values: { run: run }
     }
    ]
  }, function (result) {
      if (result.success) {
        var runCaseID = result.values[0].id,
            valuesArray = vals.map(function(v) {
              return  {
                parent: runCaseID,
                values: { value: v }
               }
            });
        codapInterface.sendRequest({
          action: 'create',
          resource: 'collection[draws].case',
          values: valuesArray
        });
      }
  });
}

function sendSequenceDirectlyToCODAP(sequence) {
  for (var i = 0, ii = sequence.length; i < ii; i++) {
    var values = sequence[i].map(function(v) {
      return variables[v];
    })
    addValuesToCODAP(i+1, values)
  }
}

function openTable() {
  if (!codapConnected) {
    return;
  }

  codapInterface.sendRequest({
    action: 'create',
    resource: 'component',
    values: {
      type: 'caseTable'
    }
  });
}
