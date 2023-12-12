import * as utils from './utils.js';

/* globals mina */

/**
 * Sampler View module
 *
 * Draws the SVG state of the mixer and spinner plugins
 */

var width = 205,            // svg units
    containerX = 10,
    containerY = 0,
    containerWidth = 130,
    containerHeight = 220,
    capHeight = 6,
    capWidth = 40,
    border = 2,
    spinnerRadius = Math.min(containerWidth, containerHeight)/2,
    spinnerX = containerX + (containerWidth/2), //x center of spinner
    spinnerY = containerY + (containerHeight/2),//y center of spinner
    darkTeal = "#008cba",
    lightBlue = "#dbf6ff",
    viewportHeight = 375,

    variableNameInput = document.getElementById("variable-name-change"),
    variablePercentageInput = document.getElementById("variable-percentage-change"),
    deviceNameInput = document.getElementById("edit-device_name"),

    s,
    speed,
    sampleSize,
    deviceName,
    numRuns,
    device,
    withReplacement,
    variables,
    uniqueVariables,
    samples,

    animationSpeed = 1,
    animationRequest = null,

    balls = [],
    sampleSlotTargets = [],
    sampleSlots = [],
    ballRadius,

    needle,
    needleTurns = 0,
    wedgeLabels = [],
    wedges = [],

    editingVariable = false,    // then the id of the var

    scrambledInitialSetup = false,       // whether all balls have been mixed in mixer
    stepOffset = 0,

    getTextShift = function(text, maxLetters) {
      var lettersOver = Math.max(0, text.length - maxLetters);
      return (0.2 * lettersOver) + "em";
    },

    getTransformForMovingTo = function(x, y, circ) {
      var t = {
        dx: x - (circ.attr("cx") * 1),
        dy: y - (circ.attr("cy") * 1)
      };
      return "T"+t.dx+","+t.dy;
    },

    getLabelForVariable = function(v) {
      if (typeof v === "object"){
        var firstKey = Object.keys(v)[0];
        return v[firstKey];
      } else {
        return v;
      }
    },

    getCoordinatesForPercent = function(radius, percent) {
      var perc = percent + 0.75,    // rotate 3/4 to start at top
          x = spinnerX + (Math.cos(2 * Math.PI * perc) * radius),
          y = spinnerY + (Math.sin(2 * Math.PI * perc) * radius);

      return [x, y];
    },

    getCoordinatesForVariableLabel = function(radius, percent) {
      var perc = percent + 0.75,    // rotate 3/4 to start at top
          x = spinnerX + (Math.cos(2 * Math.PI * perc) * radius * (1 + (Math.min(.70, uniqueVariables.length * 0.1)))),
          y = spinnerY + (Math.sin(2 * Math.PI * perc) * radius * (1 + (Math.min(.70, uniqueVariables.length * 0.1))));

      return [x, y];
    },

    getEllipseCoords = function(majorRadius, minorRadius, percent) {
      var perc = percent + 0.75,    // rotate 3/4 to start at top
        angleRadians = 2 * Math.PI * perc,
        x = spinnerX + (Math.cos(angleRadians) * majorRadius),
        y = spinnerY + (Math.sin(angleRadians) * minorRadius);

      return [x, y];
    },

    getSpinnerSliceCoords = function (i, slicePercent, radius, mergeCount) {
      var startIndex = i - mergeCount,
          perc1 = startIndex * slicePercent,
          perc2 = (i + 1) * slicePercent,
          p1 = getCoordinatesForPercent(radius, perc1),
          p2 = getCoordinatesForPercent(radius, perc2),
          varLabelPosition = getCoordinatesForVariableLabel(radius, (perc1+perc2)/2),
          largeArc = perc2 - perc1 > 0.5 ? 1 : 0,
          labelPerc2 = perc1 + ((perc2 - perc1) / 2),
          labelLineP1 = getCoordinatesForPercent(radius, labelPerc2),
          labelLineP2 = getCoordinatesForPercent(radius * 1.2, labelPerc2),
          pctLabelLoc = getEllipseCoords((radius * 1.35), (radius * 1.3), labelPerc2),
          deleteBtnLocY;

      // check in which direction label line is pointing and position delete button accordingly
      if (pctLabelLoc[1] >= labelLineP2[1]) {
        deleteBtnLocY = pctLabelLoc[1] + 17;
      } else {
        deleteBtnLocY = pctLabelLoc[1] - 17;
      }

      return {
        path: `M ${p1.join(" ")} A ${radius} ${radius} 0 ${largeArc} 1 ${p2.join(" ")} L ${spinnerX} ${spinnerY} L ${p1.join(" ")}`,
        center: {
          x: (spinnerX + varLabelPosition[0]) / 2,
          y: (spinnerY + varLabelPosition[1]) / 2
        },
        edge1: `M ${spinnerX} ${spinnerY} L ${p1.join(" ")}`,
        edge2: `M ${spinnerX} ${spinnerY} L ${p2.join(" ")}`,
        p1: {x: p1[0], y: p1[1]},
        p2: {x: p2[0], y: p2[1]},
        labelLine: `M ${labelLineP1.join(" ")} L ${labelLineP2.join(" ")}`,
        pctLabelLoc: {x: pctLabelLoc[0], y: pctLabelLoc[1]},
        deleteBtnLoc:  {x: pctLabelLoc[0], y: deleteBtnLocY},
      };
    },

    getVariableColor = function(i, slices, lighten) {
      var baseColorHue = 173,
          hueDiff = Math.min(15, 60/slices),
          hue = (baseColorHue + (hueDiff * i)) % 360,
          huePerc = (hue / 360) * 100,
          lightPerc = 66 + (lighten ? 15 : 0);
      return "hsl("+huePerc+"%, 71%, "+lightPerc+"%)";
    };

var View = function(getProps, isRunning, setRunning, isPaused, modelReset, codapCom, localeMgr, sortVariablesForSpinner) {
  this.getProps = getProps;
  this.isRunning = isRunning;
  this.setRunning = setRunning;
  this.isPaused = isPaused;
  this.modelReset = modelReset;
  this.codapCom = codapCom;
  this.localeMgr = localeMgr;
  this.isDragging = false;
  this.sortVariables = sortVariablesForSpinner;

  this.getSpeedText = function(index) {
    var speedIds = [
      "DG.plugin.sampler.speed.slow",
      "DG.plugin.sampler.speed.medium",
      "DG.plugin.sampler.speed.fast",
      "DG.plugin.sampler.speed.Fastest"];
    return this.localeMgr.tr(speedIds[index]);
  };


  this.animateMixer = this.animateMixer.bind(this);
  this.moveLetterToSlot = this.moveLetterToSlot.bind(this);
  this.endAnimation = this.endAnimation.bind(this);
  this.setVariableName = this.setVariableName.bind(this);
  this.setPercentage = this.setPercentage.bind(this);
  this.pushAllLettersOut = this.pushAllLettersOut.bind(this);
};

View.prototype = {
  render: function() {
    var props = this.getProps();

    s = props.s;
    speed = props.speed;
    sampleSize = props.sampleSize;
    numRuns = props.numRuns;
    device = props.device;
    deviceName = props.deviceName;
    withReplacement = props.withReplacement;
    variables = props.variables;
    uniqueVariables = props.uniqueVariables;
    samples = props.samples;
    wedges = [];
    wedgeLabels = [];

    s.unclick(this.handleSpinnerClick);
    s.clear();
    document.getElementById("sample_size").value = sampleSize;
    document.getElementById("device_name").value = deviceName;
    document.getElementById("repeat").value = numRuns;
    var sliderSpeed = speed > 0.5 ? speed : 0;
    document.getElementById("speed").value = sliderSpeed;
    document.getElementById("speed-text").innerHTML = this.getSpeedText(sliderSpeed);

    this.createSampleSlots();
    if (device === "mixer" || device === "collector") {
      this.createMixer();
    } else {
      this.createSpinner();
    }
  },

  createSampleSlots: function() {
    var sSampleSize = sampleSize >=1? Math.floor(sampleSize): 0,
        x = containerWidth + ((width - containerWidth)),
        centerY = containerY + (containerHeight/2),
        stroke = border / 2,
        padding = 2,
        maxHeight = 20,
        minHeight = Math.max(10, (containerHeight/sSampleSize)),
        slotHeight = Math.min(minHeight, maxHeight),
        slotSize = slotHeight - padding - (stroke*2),
        maxSlotDepth = 4,
        minSlotDepth = slotSize/3,
        slotDepth = Math.min(minSlotDepth, maxSlotDepth),
        totalHeight = slotHeight * sSampleSize,
        mx = x + (maxSlotDepth - slotDepth),
        y = Math.max(containerY, centerY - (totalHeight / 2));

    stroke = (slotHeight < maxHeight) ? stroke / 2 : stroke;

    sampleSlotTargets = [];
    sampleSlots = [];

    // position the device name input just above the first slot
    const yVh = ((y + padding) / viewportHeight) * 100;
    const offSet = 15;
    deviceNameInput.style.top = `${offSet + yVh}vh`;

    for (var i = 0; i < sSampleSize; i++) {
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
  },

  createMixer: function() {
    var halfb = (border/2),
        mx = containerX + halfb,
        my = containerY + halfb,
        h = containerHeight - border,
        shoulder = (h - capWidth) / 2,
        cap = capHeight - halfb,
        w = containerWidth - capHeight - halfb,
        // pathStr = "m"+mx+","+my+" h "+shoulder+" v -"+cap+" h "+capWidth+" v "+cap+" h "+shoulder+" v "+h+" h -"+w+" z";
        pathStr = "m"+mx+","+my+" h "+w+" v "+shoulder+" h "+cap+" v "+capWidth+" h -"+cap+" v "+shoulder+" h -"+w+" z",
        clipping = "none";

    if (!withReplacement) {
      var clipWidth = containerWidth + (border/2) + capHeight;
      clipping = s.rect({x: 0, y: 0, width: clipWidth, height: containerHeight});
    }

    s.path(pathStr).attr({
      fill: "none",
      stroke: "#333",
      strokeWidth: border,
      clipPath: clipping
    });

    this.addMixerVariables();
  },

  getLabelForIndex: function(i) {
    return getLabelForVariable(variables[i]);
  },

  addMixerVariables: function() {
    var _this = this;

    balls = [];

    var num = variables.length;
    ballRadius = num < 15 ? 14 : Math.max(14 - (10 * (num-15)/200), 4);

    var w = containerWidth - capHeight - (border * 2),
        maxInRow = Math.floor(w / (ballRadius*2)),
        rows = Math.ceil(num/maxInRow),
        maxHeight = containerHeight * 0.75,
        rowHeight = Math.min(ballRadius * 2, maxHeight/rows),
        maxVariableLength = variables.reduce(function(max, v) {
          var length = getLabelForVariable(v).length;
          return Math.max(max, length);
        }, 0),
        fontScaling = 1 - Math.min(Math.max((maxVariableLength - 5) * 0.1, 0), 0.4),
        fontSize,
        i, ii;

    fontSize = ballRadius * fontScaling;

    for (i = 0, ii=num; i<ii; i++) {
      var rowNumber = Math.floor(i/maxInRow),
          rowIndex = i % maxInRow,
          x = (rowNumber % 2 === 0) ? containerX + border + ballRadius + (rowIndex * ballRadius * 2) : containerX + containerWidth - border - capHeight - ballRadius - (rowIndex * ballRadius * 2),
          y = containerY + containerHeight - border - ballRadius - (rowHeight * rowNumber);

      var labelClipping = s.circle(x, y, ballRadius);
      // render ball to the screen
      var text = this.getLabelForIndex(i),
          circle = s.circle(x, y, ballRadius).attr({
            fill: getVariableColor(0, 0, true),
            stroke: "#000",
            strokeWidth: 1
          }),
          label = s.text(x, y, text).attr({
            fontSize: fontSize,
            textAnchor: "middle",
            dy: ".25em",
            dx: getTextShift(text, (3.8*(ballRadius/fontSize))),
            clipPath: labelClipping
          }),
          ball = s.group(
            circle,
            label
          );
      balls.push(ball);
      ball.click(this.showVariableNameInput(i));
      ball.hover((function(circ, lab, size) {
        return function() {
          if (_this.isRunning() || device === "collector") return;
          circ.attr({ fill: getVariableColor(0, 0) });
          lab.attr({ fontSize: size + 2, dy: ".26em", });
        };
      })(circle, label, fontSize), (function(circ, lab, size) {
        return function() {
          circ.attr({ fill: getVariableColor(0, 0, true) });
          lab.attr({ fontSize: size, dy: ".25em", });
        };
      })(circle, label, fontSize));
      ball.orig = {x: x, y: y};
    }

    // setup animation
    for (i = 0, ii = balls.length; i < ii; i++) {
      var speed = 5 + (Math.random() * 7),
          direction = Math.PI + (Math.random() * Math.PI);
      balls[i].vx = Math.cos(direction) * speed;
      balls[i].vy = Math.sin(direction) * speed;
    }
  },

  animateSelectNextVariable: function (selection, draw, selectionMadeCallback, allSelectionsMadeCallback) {
    if (!this.isRunning()) return;

    if (device === "mixer" || device === "collector") {
      this.animateMixerSelection(selection, draw, selectionMadeCallback, allSelectionsMadeCallback);
    } else {
      this.animateSpinnerSelection(selection, draw, selectionMadeCallback, allSelectionsMadeCallback);
    }
  },

  moveLetterToSlot: function (slot, sourceLetter, insertBeforeElement, initialTrans, selectionMadeCallback, allSelectionsMadeCallback) {
    var _this = this;
    if (!this.isRunning()) return;
    // move variable to slot
    var letter = sourceLetter.clone();
    letter.attr({
      textAnchor: "start",
      clipPath: "none",
      dx: 0
    });
    window.samples = samples;
    samples.push(letter);
    insertBeforeElement.before(letter);

    if (initialTrans) {
      letter.attr({transform: initialTrans});
    }

    var origin = letter.getBBox();
    var target = sampleSlotTargets[slot].getBBox();
    var matrix = letter.transform().localMatrix;
    matrix.translate((target.x-origin.x), (target.cy-origin.cy));

    var size = sampleSlotTargets[slot].attr("r")*2;

    var speed = this.getProps().speed;

    letter.animate({transform: matrix, fontSize: size, dy: size/4}, 200/speed, function() {
      if (slot === Math.floor(sampleSize)-1) {
        _this.pushAllLettersOut(selectionMadeCallback, allSelectionsMadeCallback);
      } else {
        selectionMadeCallback();
      }
    });
  },

  pushAllLettersOut: function(selectionMadeCallback, allSelectionsMadeCallback) {
    var _this = this;
    setTimeout(pushLettersOut, 300/speed);
    setTimeout(returnSlots, 600/speed);
    setTimeout(selectionMade, 600/speed);
    function selectionMade() {
      if (_this.isPaused()) {
        setTimeout(selectionMade, 200);
      } else {
        selectionMadeCallback();
        allSelectionsMadeCallback();
      }
    }

    function pushLettersOut() {
      if (!_this.isRunning()) return;
      if (_this.isPaused()) {
        setTimeout(pushLettersOut, 200);
        return;
      }
      var speed = _this.getProps().speed;
      for (var i = 0, ii = sampleSlots.length; i < ii; i++) {
        var sampleSlot = sampleSlots[i],
            letter = samples[i],
            sampleMatrix = sampleSlot.transform().localMatrix,
            letterMatrix = letter ? letter.transform().localMatrix : null;
        sampleMatrix.translate(20, 0);
        sampleSlot.animate({transform: sampleMatrix}, 200/speed);
        if (letter) {
          letterMatrix.translate(40, 0);
          letter.animate({transform: letterMatrix}, 200/speed, (function(lett) {
            return function() {
              lett.remove();
            };
          })(letter));
        }
      }
    }
    function returnSlots() {
      if (_this.isPaused()) {
        setTimeout(returnSlots, 200);
        return;
      }
      samples.forEach(letter => letter.remove());
      samples = [];
      var speed = _this.getProps().speed,
          i, ii;
      for (i = 0, ii = sampleSlots.length; i < ii; i++) {
        var sampleSlot = sampleSlots[i];
        sampleSlot.animate({transform: "T0,0"}, 200/speed);
      }
      if (!withReplacement) {
        for (i = 0, ii = balls.length; i < ii; i++) {
          balls[i].attr({ visibility: "visible"});
        }
      }
    }
  },

  animateMixerSelection: function (selection, draw, selectionMadeCallback, allSelectionsMadeCallback) {
    if (isNaN(selection)) {   // EMPTY selection
      this.pushAllLettersOut(selectionMadeCallback, allSelectionsMadeCallback);
      return;
    }
    var _this = this,
        props = this.getProps(),
        speed = props.speed,
        hidden = props.hidden,
        ball = balls[selection],
        circle = ball.select("circle"),
        variable = ball.select("text"),
        trans = getTransformForMovingTo(containerX + containerWidth - circle.attr("r") * 1, containerY + (containerHeight/2), circle);

    if (balls.length < 200) {
      ball.beingSelected = true;
      if (ball.getBBox().y > containerY + (containerHeight/2)) {
        ball.vy = -Math.abs(ball.vy);
      } else {
        ball.vy = Math.abs(ball.vy);
      }

      ball.animate({transform: trans}, 300/speed, function() {
        if (!withReplacement) {
          ball.attr({ visibility: "hidden"});
        }
        _this.moveLetterToSlot(draw, variable, ball, trans, selectionMadeCallback, allSelectionsMadeCallback);
        ball.beingSelected = false;
        if (hidden) {
          setTimeout(function() {
            trans = getTransformForMovingTo(containerX + containerWidth - circle.attr("r") * 3, containerY + (containerHeight/2), circle);
            ball.animate({transform: trans}, 100/speed);
          }, 100/speed);
        }
      });
    } else {
      if (!withReplacement) {
        ball.attr({ visibility: "hidden"});
      }
      _this.moveLetterToSlot(draw, variable, ball, trans, selectionMadeCallback, allSelectionsMadeCallback);
    }

  },

  animateMixer: function () {
    var _this = this;
    var degradeAnimation = variables.length > 300;
    if (this.isRunning()) {
      stepOffset += 1;
      var timeout = Math.min(Math.max(30, variables.length * 1.5), 200);
      animationSpeed = timeout / 30;
      setTimeout(function() {
        animationRequest = requestAnimationFrame(_this.animateMixer);
      }, timeout);
      if (variables.length < 100) {
        this.mixerAnimationStep();
      } else if (variables.length < 400) {
        this.positionBallsRandomly();
      } else {
        if (!scrambledInitialSetup) {
          this.positionBallsRandomly();
        } else {
          this.fakeMixerAnimationStep();
        }
      }
    }
  },

  mixerAnimationStep: function () {
    var speed = this.getProps().speed;
    var animationSpeedBoost = Math.min(speed * animationSpeed, 4);
    var numBalls = balls.length;
    // start skipping animation of balls when there are lots of balls in mixer.
    // At 50 balls, we start to skip one ball per cycle. Linearly increase until we
    // are skipping every other ball when we are 200+ balls.
    var skipEveryNthBall = Math.max(75 - Math.floor(numBalls / 2), 2);
    // offset which ball(s) we skip each time
    var skipOffset = stepOffset % numBalls;

    if (!this.isPaused()) {
      for (var i = 0, ii = balls.length; i < ii; i++) {
        if (scrambledInitialSetup && (i + skipOffset + 1) % skipEveryNthBall === 0) continue;  // don't animate skips
        if (!balls[i].beingSelected) {
          var ball = balls[i],
              matrix = ball.transform().localMatrix,
              dx = ball.vx*animationSpeedBoost,
              dy = ball.vy*animationSpeedBoost,
              bbox = ball.getBBox();


          if ((bbox.x + dx) < (containerX + border)) {
            ball.vx = Math.abs(ball.vx);
            dx = ball.vx*animationSpeedBoost;
          } else if ((bbox.x + bbox.w + dx) > containerX + (containerWidth - capHeight - (border * 2))) {
            ball.vx = -Math.abs(ball.vx);
            dx = ball.vx*animationSpeedBoost;
          }
          if (bbox.y + dy < (containerY + (border * 2)) || (bbox.y + bbox.h + dy) > containerY + containerHeight - border) {
            ball.vy *= -1;
            dy = ball.vy*animationSpeedBoost;
          }

          matrix.translate(dx, dy);
          ball.attr({transform: matrix});
        }
      }
      scrambledInitialSetup = true;
    }
  },

  positionBallsRandomly: function () {
    if (!this.isPaused()) {
      var minX = containerX + border + ballRadius,
          maxY = containerY + containerHeight - border - ballRadius,
          width = containerWidth - border - capHeight - (ballRadius * 2),
          height = containerHeight - border - (ballRadius * 2);
      for (var i = 0, ii = balls.length; i < ii; i++) {
        var ball = balls[i],
            x = minX + Math.random() * width,
            y = maxY - Math.random() * height,
            dx = x - ball.orig.x,
            dy = y - ball.orig.y;
          ball.attr({transform: 't'+dx+','+dy});
      }
      scrambledInitialSetup = true;
    }
  },

  fakeMixerAnimationStep: function () {
    var speed = this.getProps().speed;
    var animationSpeedBoost = Math.min(speed * animationSpeed, 5);
    var numBalls = balls.length;
    // start skipping animation of balls when there are lots of balls in mixer.
    // At 50 balls, we start to skip one ball per cycle. Linearly increase until we
    // are skipping every other ball when we are 200+ balls.
    var skipEveryNthBall = Math.max(75 - Math.floor(numBalls / 2), 2);
    // offset which ball(s) we skip each time
    var skipOffset = stepOffset % numBalls;

    if (!this.isPaused()) {
      for (var i = 0, ii = balls.length; i < ii; i++) {
        var ball = balls[i];
        if (ball.beingSelected || (i + stepOffset + 1) % skipEveryNthBall === 0) {
          ball.attr({ visibility: "visible"});
        } else {
          ball.attr({ visibility: "hidden"});
        }
      }
    }
  },

  endAnimation: function () {
    var _this = this,
        i, ii;
    if (this.isPaused()) {
      setTimeout(_this.endAnimation, 200);
      return;
    }
    var speed = this.getProps().speed;
    this.setRunning(false);
    var numBalls = balls.length;
    // if we have fewer balls, we can afford fancier ending transitions
    if (numBalls < 101) {
      for (i = 0, ii = balls.length; i < ii; i++) {
        balls[i].animate({transform: "T0,0"}, (800 + (Math.random() * 300))/speed, mina.bounce);
      }
      setTimeout(_this.modelReset, 800/speed);
    } else if (numBalls < 500) {
      for (i = 0, ii = balls.length; i < ii; i++) {
        balls[i].animate({transform: "T0,0"}, 400/speed);
      }
      setTimeout(_this.modelReset, 400/speed);
    } else {
      setTimeout(_this.modelReset, 200/speed);
    }

  },

  pause: function (doPause) {
    var func = doPause ? "pause" : "resume";
    var animatedObjects = balls.concat(sampleSlotTargets).concat(sampleSlots).concat(samples);
    if (needle) {
      animatedObjects.push(needle);
    }
    for (var i = 0, ii = animatedObjects.length; i < ii; i++) {
      animatedObjects[i][func]();
    }
  },

  createSpinner: function () {
    var variableLabel, percentageLabel;
    wedgeLabels = [];
    var _this = this;
    if (uniqueVariables.length === 1) {
      s.circle(spinnerX, spinnerY, spinnerRadius).attr({fill: getVariableColor(0, 0)});
      var labelClipping = s.circle(spinnerX, spinnerY, spinnerRadius);
      variableLabel = this.createSpinnerLabel(0, spinnerX, spinnerY, (spinnerRadius/2), labelClipping, 9);;
      wedgeLabels.push(variableLabel);
    } else {
      var slicePercent = 1 / variables.length,
          lastVariable = "",
          mergeCount = 0,
          offsetDueToMerge = 0,
          edge1Point,
          edge2Point;

      // Click handler for detected if user has selected a wedge. Only add it once.
      if (!s.events) {
        s.click(this.handleSpinnerClick());
      }

      for (var i = 0, ii = variables.length; i < ii; i++) {
        var merge = variables[i] === lastVariable;
        mergeCount = merge ? mergeCount + 1 : 0;
        var slice = getSpinnerSliceCoords(i, slicePercent, spinnerRadius, mergeCount);
        var varTextSize = uniqueVariables.length >= 20 ? "6px"
                                                       : uniqueVariables.length >= 10 ? "10px"
                                                                                      : "16px";
        var pctTextSize = "12px";

        lastVariable = variables[i];
        if (merge) offsetDueToMerge++;

        let lastUniqueVariable = null;
        var currentVarIdx = uniqueVariables.indexOf(variables[i]);
        var lastVarIdx = currentVarIdx - 1;
        if (lastVarIdx > -1) {
          var firstIdxOfLastVar = variables.indexOf(uniqueVariables[lastVarIdx]);
          if (firstIdxOfLastVar > -1 && firstIdxOfLastVar < i) {
            lastUniqueVariable = variables[firstIdxOfLastVar];
          }
        }

        var isDraggingVar = this.isDragging === variables[i] || this.isDragging === lastUniqueVariable;
        var wedgeColor = getVariableColor((i - offsetDueToMerge), uniqueVariables.length);

        // wedge color
        var wedge = s.path(slice.path).attr({
          fill:  wedgeColor,
          stroke: "none",
          class: `wedge ${variables[i]}`,
          cursor: this.isDragging ? "grabbing" : "pointer"
        });

        var percentString = (100*(mergeCount+1)*slicePercent).toPrecision(2);
        var hint = Snap.parse('<title>'+ percentString + '%</title>');
        wedge.append(hint);

        var wedgeObj = {variable: variables[i]};

        // variable name label
        var variableLabelClipping = s.path(slice.path);
        variableLabel = this.createSpinnerLabel(i, slice.center.x, slice.center.y, varTextSize,
                                                  variableLabelClipping, Math.max(10, 10 - variables.length));
        variableLabel.attr({
          fontWeight: "normal",
          fill: "black"
        })
        var variableHint = Snap.parse('<title>'+ percentString + '%</title>');
        variableLabel.append(variableHint);
        wedgeLabels.push(variableLabel);
        wedgeObj.svgObj = {wedge, wedgeColor, variableLabel};
        var group = s.group(wedge, variableLabel);
        console.log("variableLabel", variableLabel);
        group.click(this.showVariableNameInput(i, isDraggingVar));

        var isFirstInstanceOfVar = (variables.filter(v => v === variables[i]).length === 1) || (!merge && variables[i + 1] === variables[i]);
        if (isFirstInstanceOfVar) {
          edge1Point = slice.p1;
        }

        var isLastInstanceofVar = (variables.filter(v => v === variables[i]).length === 1) || (merge && (variables[i + 1] !== variables[i]));
        if (isLastInstanceofVar) {
          // draw percent label, delete button
          var line = s.path(slice.labelLine);
          line.attr({stroke: isDraggingVar ? wedgeColor : "none", strokeWidth: 2, class: `line ${variables[i]}`});
          percentageLabel = this.createPctLabel(i, slice.pctLabelLoc.x, slice.pctLabelLoc.y, pctTextSize, percentString);
          percentageLabel.attr({visibility: isDraggingVar ? "visible" : "hidden"});

          var deleteButton = this.createDeleteButton(i, slice.deleteBtnLoc).attr({visibility: "hidden"});
          var edge2Point = slice.p2;
          wedgeObj.svgObj = {...wedgeObj.svgObj, line, percentageLabel, deleteButton, edge1Point, edge2Point};

          // don't let the last edge (i.e. 0 degrees line) be draggable
          if (variables.length - 1 !== i) {
            var edge = this.createEdge(wedgeObj, slice.path, variables[i + 1]);
            wedgeObj.svgObj = {...wedgeObj.svgObj, edge};
          }

          // white stroke separating wedges
          s.path(slice.edge2).attr({
            fill: "none",
            stroke: "#fff",
            strokeWidth: i === ii - 1 ? 0.5 : 1,
          }).attr({cursor: isDraggingVar ? "grabbing" : "pointer"});

          // push wedge obj to wedges array only if we are in the last instance of the variable - otherwise we'll have repeats
          wedges.push(wedgeObj);
        }
      }
    }
  },


  createSpinnerLabel: function (index, x, y, fontSize, clipping, maxLength) {
    var text = `${variables[index]}`,
      label = s.text(x, y, text).attr({
        fontSize: fontSize,
        textAnchor: "middle",
        dy: ".25em",
        dx: getTextShift(text, maxLength),
        clipPath: clipping,
        class: `label ${variables[index]}`,
      });
    return label;
  },

  createPctLabel: function (index, x, y, fontSize, percentString) {
    var _this = this;
    var text = `${percentString}%`;
    var label = s.text(x, y+5, text).attr({
      fontSize: fontSize,
      textAnchor: "middle",
      class: `percent ${variables[index]}`,
    });
    var roundX = Math.round(x);
    var roundY = Math.round(y);
      if (roundX > spinnerX && roundY < spinnerY) {
        label.attr({dx: ".3em"})
        label.attr({dy: "-.25em"})
      } else if (roundX > spinnerX && roundY >= spinnerY) {
        label.attr({dx: ".3em"})
      } else if (roundX < spinnerX && roundY === spinnerY) {
        label.attr({dx: "-.25em"})
      } else if (roundX < spinnerX && roundY < spinnerY) {
        label.attr({dx: "-.3em"})
        label.attr({dy: "-.25em"})
      } else if (roundX < spinnerX) {
        label.attr({dx: "-.3em"});
      }
      label.click(_this.showPercentInput(index, percentString));
    return label;
  },

  createDeleteButton: function (index, loc) {
    var _this = this;
    var {x, y} = loc;
    var btnSize = 15;
    var offset = 3;
    var border = s.rect(x - (btnSize/2), y - (btnSize/2), btnSize, btnSize, 3, 3).attr({stroke: darkTeal, strokeWidth: "1px", fill: lightBlue});
    var innerShape = s.path(`M ${x - offset} ${y - offset} L ${x + offset} ${y + offset} M ${x + offset} ${y - offset} L ${x - offset} ${y + offset}`).attr({stroke: "black", strokeWidth: "1px"});
    var button = s.group(border, innerShape).attr({cursor: "pointer"});

    var hint = Snap.parse(`<title>Delete ${variables[index]}</title>`);
    button.append(hint);

    button.hover(function (){
      if (_this.isRunning()) return;
      border.attr({fill: darkTeal});
      innerShape.attr({stroke: "white"});
    }, function () {
      border.attr({fill: lightBlue});
      innerShape.attr({stroke: "black"});
    });

    button.click(_this.deleteVariable(index));
    return button;
  },

  createEdge: function (wedgeObj, clippingPath, nextVariable) {
    var _this = this;

    const {variable} = wedgeObj;
    const {wedgeColor, edge1Point, edge2Point} = wedgeObj.svgObj;
    var clipping = s.path(clippingPath);

    // draggable edge
    var edge = s.path(`M ${spinnerX} ${spinnerY} L ${edge2Point.x} ${edge2Point.y}`).attr({
      stroke: wedgeColor,
      class: `edge ${variable}`,
      strokeWidth: "10px",
      clipPath: clipping,
    })

    wedgeObj.svgObj = {...wedgeObj.svgObj, edge};

    var edgeHint = Snap.parse(`<title>Click and drag to change the percentages for ${variable} and ${nextVariable}</title>`);
    edge.append(edgeHint);
    edge.node.style.cursor = this.isDragging ? "grabbing" : "grab";

    edge.drag((dx, dy, x, y, e) => _this.handleDrag(dx, dy, x, y, e, edge1Point, variable, nextVariable, wedgeObj), () => _this.startDrag(wedgeObj), () => _this.endDrag());

    return edge;
  },

  handleSpinnerClick: function () {
    var _this = this;

    return function (e) {
      console.log("I am handle spinner click", e);
      if (_this.isRunning() || _this.isDragging) return;

      const wedgeEls = document.getElementsByClassName("wedge");
      const nameLabels = document.getElementsByClassName("label");
      const pctLabels = document.getElementsByClassName("percent");

      const clickedWedge = e.target.classList?.contains("wedge");
      const clickedLabel = e.target.classList?.contains("label");
      const clickedPct = e.target.classList?.contains("percent");
      const elsToCheck = clickedWedge ? wedgeEls : clickedLabel ? nameLabels : clickedPct ? pctLabels : null;

      for (let i = 0; i < wedgeEls.length; i ++) {
        const wedgeObj = wedges.find(w => w.variable === wedgeEls[i].classList[1]);
        const {wedge, wedgeColor, variableLabel, percentageLabel, deleteButton, line, edge} = wedgeObj.svgObj;
        let isSelectedWedge =  elsToCheck ? elsToCheck[i].classList.value === e.target.classList.value : false;
        let isEditingWedge = clickedPct;
        if (isSelectedWedge || isEditingWedge) {
          wedge.attr({fill: darkTeal});
          variableLabel.attr({fill: "white", fontWeight: "bold"});
          line.attr({stroke: darkTeal});
          percentageLabel.attr({visibility: "visible"});
          deleteButton.attr({visibility: "visible"});
          if (edge) {
            edge.attr({stroke: darkTeal});
          }
        } else {
          wedge.attr({fill: wedgeColor});
          variableLabel.attr({fill: "black", fontWeight: "normal"});
          line.attr({stroke: "none"});
          percentageLabel.attr({visibility: "hidden"});
          deleteButton.attr({visibility: "hidden"});
          if (edge) {
            edge.attr({stroke: wedgeColor});
          }
        }
      }
    }
  },

  startDrag: function ( wedgeObj) {
    this.isDragging = wedgeObj.variable;
  },

  convertDomCoordsToSvg: function (x, y) {
    var svgEl = s.node;
    var svgMatrix = svgEl.getScreenCTM();
    var svgPt = svgEl.createSVGPoint();
    svgPt.x = x;
    svgPt.y = y;
    var svgCoords = svgPt.matrixTransform(svgMatrix.inverse());
    var svgX = svgCoords.x;
    var svgY = svgCoords.y;
    return {svgX, svgY};
  },

  handleDrag: function (dx, dy, x, y, e, otherPoint, variable, nextVariable) {
    var {svgX, svgY} = this.convertDomCoordsToSvg(x, y)
    var newPct = utils.calculateWedgePercentage(spinnerX, spinnerY, otherPoint.x, otherPoint.y, svgX, svgY);
    var newNicePct = Math.round(newPct);
    var isWithinBounds = e.target.classList[1] === variable || e.target.classList[1] === nextVariable;

    if (isWithinBounds && (newNicePct > 1 && newNicePct < 100)) {
      this.setPercentage(newNicePct, variable, "next");
    } else {
      return;
    }
  },

  endDrag: function () {
    this.isDragging = false;
    this.render();
  },

  showVariableNameInput: function (i, isDraggingVar) {
    var _this = this;

    // don't display input if user is dragging the wedge
    if (isDraggingVar) {
      variableNameInput.style.display = "none";
    };

    return function(e) {
      if (_this.isRunning() || device === "collector") return;
      const loc = this.node.childNodes[1].getBoundingClientRect();
      const text = variables[i];
      const width = Math.min(30, Math.max(10, text.length * 3)) + "vh";
      const xIsWithinBounds = e.x <= loc.x + loc.width && e.x >= loc.x;
      const yIsWithinBounds = e.y <= loc.y + loc.height && e.y >= loc.y;
      // only display the input if the user actually clicks on the label
      if (xIsWithinBounds && yIsWithinBounds) {
        variableNameInput.style.display = "block";
        variableNameInput.style.top = (loc.y + loc.height/2) + "px";
        variableNameInput.style.left = (loc.x) + "px";
        variableNameInput.style.width = width;
        variableNameInput.value = text;
        variableNameInput.className = variables[i],
        variableNameInput.focus();

        editingVariable = i;
        if (device == "mixer" || device == "collector") {
          variables[editingVariable] = "";
        } else {
          var v = variables[editingVariable];
          editingVariable = [];
          for (var j = 0, jj = variables.length; j < jj; j++) {
            if (variables[j] === v) {
              editingVariable.push(j);
            }
          }
        }
        _this.render();
      } else {
        return;
      }
    };
  },

  showVariableNameInputForUI: function (variableName) {
    if (this.isRunning() || device === "collector") return;

    var nameLabels = document.getElementsByClassName(`label ${variableName}`);
    var nameLabel = nameLabels[nameLabels.length - 1];

    const wedgeObj = wedges.find(w => w.variable === variableName);
    const {wedge, variableLabel, percentageLabel, deleteButton, line, edge} = wedgeObj.svgObj;
    wedge.attr({fill: darkTeal});
    variableLabel.attr({fill: "white", fontWeight: "bold"});
    line.attr({stroke: darkTeal});
    percentageLabel.attr({visibility: "visible"});
    deleteButton.attr({visibility: "visible"});
    if (edge) {
      edge.attr({stroke: darkTeal});
    }

    var loc = nameLabel.getBoundingClientRect(),
        text = variableName,
        width = Math.min(30, Math.max(10, text.length * 3)) + "vh";
    variableNameInput.style.display = "block";
    variableNameInput.style.top = (loc.y + loc.height/2) + "px";
    variableNameInput.style.left = (loc.x) + "px";
    variableNameInput.style.width = width;
    variableNameInput.value = text;
    variableNameInput.className = variableName,
    variableNameInput.focus();

    editingVariable = variables.indexOf(variableName);
    if (device == "mixer" || device == "collector") {
      variables[editingVariable] = "";
    } else {
      var v = variables[editingVariable];
      editingVariable = [];
      for (var j = 0, jj = variables.length; j < jj; j++) {
        if (variables[j] === v) {
          editingVariable.push(j);
        }
      }
    }
  },

  showPercentInputForUI: function (variableName) {
    if (this.isRunning() || device === "collector") return;

    var percentLabel = document.getElementsByClassName(`percent ${variableName}`)[0];

    const wedgeObj = wedges.find(w => w.variable === variableName);
    const {wedge, variableLabel, percentageLabel, deleteButton, line, edge} = wedgeObj.svgObj;
    wedge.attr({fill: darkTeal});
    variableLabel.attr({fill: "white", fontWeight: "bold"});
    line.attr({stroke: darkTeal});
    percentageLabel.attr({visibility: "visible"});
    deleteButton.attr({visibility: "visible"});
    if (edge) {
      edge.attr({stroke: darkTeal});
    }

    var percentString = this.getPercentOfVar(variableName);
    var loc = percentLabel.getBoundingClientRect(),
        text = percentString,
        width = Math.min(30, Math.max(10, text.length * 3)) + "vh";
    variablePercentageInput.style.display = "block";
    variablePercentageInput.style.top = (loc.y + loc.height/2) + "px";
    variablePercentageInput.style.left = (loc.x) + "px";
    variablePercentageInput.style.width = width;
    variablePercentageInput.value = text;
    variablePercentageInput.className = variableName;
    variablePercentageInput.focus();

    editingVariable = variables.indexOf(variableName);
    if (device == "mixer" || device == "collector") {
      variables[editingVariable] = "";
    } else {
      var v = variables[editingVariable];
      editingVariable = [];
      for (var j = 0, jj = variables.length; j < jj; j++) {
        if (variables[j] === v) {
          editingVariable.push(j);
        }
      }
    }
  },

  showPercentInput: function (i, percentString) {
    var _this = this;
    return function() {
      if (_this.isRunning() || device === "collector") return;

      var loc = this.node.getBoundingClientRect(),
          text = percentString,
          width = Math.min(30, Math.max(10, text.length * 3)) + "vh";
      variablePercentageInput.style.display = "block";
      variablePercentageInput.style.top = (loc.y + loc.height/2) + "px";
      variablePercentageInput.style.left = (loc.x) + "px";
      variablePercentageInput.style.width = width;
      variablePercentageInput.value = text;
      variablePercentageInput.className = variables[i];
      variablePercentageInput.focus();

      editingVariable = i;
      if (device == "mixer" || device == "collector") {
        variables[editingVariable] = "";
      } else {
        var v = variables[editingVariable];
        editingVariable = [];
        for (var j = 0, jj = variables.length; j < jj; j++) {
          if (variables[j] === v) {
            editingVariable.push(j);
          }
        }
      }
      _this.render();
    };
  },

  setVariableName: function () {
    if (editingVariable !== false) {
      var newName = variableNameInput.value.trim();
      if (!newName) newName = "_";
      if (Array.isArray(editingVariable)) {
        for (var i = 0, ii = editingVariable.length; i < ii; i++) {
          variables[editingVariable[i]] = newName;
        }
      } else {
        variables[editingVariable] = newName;
      }
      uniqueVariables = [...new Set(variables)];
      variableNameInput.style.display = "none";
      if (device === "spinner") {
        this.sortVariables();
      }
      // this.render();
      editingVariable = false;
      this.codapCom.logAction("changeItemName: %@", newName);
    }
  },

  getVariableCount: function (variable) {
    return variables.filter(v => v === variable).length;
  },

  getPercentOfVar: function (variable) {
    return utils.calcPct(this.getVariableCount(variable), variables.length);
  },

  getFirstAndLastIndexOfVar: function (variable) {
    var firstIndexOfVar = variables.indexOf(variable);
    var lastIndexOfVar = (variables.filter(v => v == variable).length - 1) + firstIndexOfVar;
    return {firstIndexOfVar, lastIndexOfVar}
  },

  getNewPcts: function (newPct, oldPct, selectedVar, lastOrNext) {
    var { fewestNumbersToSum } = utils;
    var diffOfPcts = newPct - oldPct;
    var unselectedVars = variables.filter(v => v !== selectedVar);
    var newPctsMap = {};
    var newPcts = [];

    if (lastOrNext) {
    // only update adjacent variable (if user is dragging a wedge boundary)
      var { firstIndexOfVar, lastIndexOfVar } = this.getFirstAndLastIndexOfVar(selectedVar);
      var adjacentVar = lastOrNext === "last" ? variables.find((v, i) => i === firstIndexOfVar - 1): variables.find((v, i) => i === lastIndexOfVar + 1);

      // update new percents
      var newPcts = unselectedVars.map((v, i) => {
        let pctOfVar = this.getPercentOfVar(unselectedVars[i]);
        if (v === adjacentVar && pctOfVar - diffOfPcts > 0) {
          pctOfVar = pctOfVar - diffOfPcts;
        }
        newPctsMap[unselectedVars[i]] = pctOfVar;
        return pctOfVar;
      });
    } else {
    // update all variables by distributing difference
      var unselectedVars = uniqueVariables.filter((v) => v !== selectedVar);
      var numUnselected = unselectedVars.length;
      var fewestNumbers = fewestNumbersToSum(diffOfPcts, numUnselected);

      // update new percents
      fewestNumbers.forEach((n, i) => {
        var pctOfVar = this.getPercentOfVar(unselectedVars[i]);
        newPcts.push(pctOfVar - n);
        newPctsMap[unselectedVars[i]] = pctOfVar - n;
      });
    }
    return {newPcts, newPctsMap};
  },

  setPercentage: function (newPercentage, selectedVariable, lastOrNext) {
    const {findCommonDenominator, findEquivNum} = utils;

    // get selected variable
    var selectedVar = selectedVariable ? selectedVariable : Array.isArray(editingVariable) ? variables[editingVariable[0]] : variables[editingVariable];

    // get new percentage and old percentage of selected variable
    var newPct = newPercentage ? newPercentage : Math.round(variablePercentageInput.value.trim());
    var oldPct = this.getPercentOfVar(selectedVar);

    var {newPcts, newPctsMap} = this.getNewPcts(newPct, oldPct, selectedVar, lastOrNext);

    // create new array
    let newVariables = [];
    // special case for dealing with 2 variables and reducing thirds
    if (uniqueVariables.length === 2 && (newPct === 33 || newPcts.includes(33))) {
      const otherVar = uniqueVariables.find(v => v !== selectedVar);
      const varWith33 = newPct === 33 ? selectedVar : otherVar;
      const varWith67 = newPct === 33 ? otherVar : selectedVar;
      newVariables.push(...Array.from({ length: 1 }, () => varWith33));
      newVariables.push(...Array.from({ length: 2 }, () => varWith67));
    } else {
      // find new common denominator to distribute whole number of mixer balls to each variable
      var commonDenom = findCommonDenominator([newPct, ...newPcts]);
      // add new amounts of variables to new array following order of variables in original array
      uniqueVariables.forEach(varName => {
        if (varName === selectedVar) {
          var newNum = findEquivNum(newPct, commonDenom);
          newVariables.push(...Array.from({ length: newNum }, () => selectedVar));
        } else {
          var newNum = findEquivNum(newPctsMap[varName], commonDenom);
          newVariables.push(...Array.from({ length: newNum }, () => varName));
        }
      });
    }

    // clear original array and add new one
    variables.splice(0, variables.length);
    variables.push(...newVariables);

    variablePercentageInput.style.display = "none";
    // this.render();
    editingVariable = false;
  },

  deleteVariable: function (index) {
    var _this = this;
    return function () {
      const selectedVariable = variables[index];
      const selectedElements = document.getElementsByClassName(selectedVariable);

      for (let i = 0; i < selectedElements.length; i++) {
        selectedElements[i].remove();
      }

      // update variables and unique variables
      const newArray = variables.filter(v => v !== selectedVariable);
      variables.splice(0, variables.length);
      variables.push(...newArray);
      uniqueVariables.splice(0, variables.length);
      uniqueVariables = [...new Set(variables)];

      editingVariable = false;
      _this.render();
    }
  },

  animateSpinnerSelection: function (selection, draw, selectionMadeCallback, allSelectionsMadeCallback) {
    var _this = this;
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
        targetAngle = (needleTurns * 360) + (360 * targetPerc),
        speed = this.getProps().speed;

    needle.animate({transform: "R"+targetAngle+","+spinnerX+","+spinnerY}, 600/speed, mina.easeinout, function() {
      var letter = wedgeLabels[selection] || wedgeLabels[0];
      _this.moveLetterToSlot(draw, letter, letter, null, selectionMadeCallback, allSelectionsMadeCallback);
    });
  },

  reset: function () {
    if (animationRequest) cancelAnimationFrame(animationRequest);
    balls = [];
    needle = null;
    needleTurns = 0;
    wedgeLabels = [];
    wedges = [];
    sampleSlotTargets = [];
    sampleSlots = [];
    scrambledInitialSetup = false;
  }
};

export {View};

