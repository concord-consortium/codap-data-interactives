/* globals mina */

/**
 * Sampler View module
 *
 * Draws the SVG state of the mixer and spinner plugins
 */

define(function() {

  var width = 205,            // svg units
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

      speedText = ["Slow", "Medium", "Fast", "Fastest"],

      variableNameInput = document.getElementById("variable-name-change"),

      s,
      speed,
      sampleSize,
      numRuns,
      device,
      variables,
      uniqueVariables,
      samples,

      animationSpeed = 1,
      animationRequest = null,

      balls = [],
      sampleSlotTargets = [],
      sampleSlots = [],

      needle,
      needleTurns = 0,
      wedges = [],

      editingVariable = false,    // then the id of the var

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

      getSpinnerSliceCoords = function (i, slicePercent, radius, mergeCount) {
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
      },

      getVariableColor = function(i, slices, lighten) {
        var baseColorHue = 173,
            hueDiff = Math.min(15, 60/slices),
            hue = (baseColorHue + (hueDiff * i)) % 360,
            huePerc = (hue / 360) * 100,
            lightPerc = 66 + (lighten ? 15 : 0);
        return "hsl("+huePerc+"%, 71%, "+lightPerc+"%)";
      };



  var View = function(getProps, isRunning, setRunning, isPaused, modelReset) {
    this.getProps = getProps;
    this.isRunning = isRunning;
    this.setRunning = setRunning;
    this.isPaused = isPaused;
    this.modelReset = modelReset;

    this.speedText = speedText;

    this.animateMixer = this.animateMixer.bind(this);
    this.moveLetterToSlot = this.moveLetterToSlot.bind(this);
    this.endAnimation = this.endAnimation.bind(this);
    this.setVariableName = this.setVariableName.bind(this);
  };

  View.prototype = {
    render: function() {
      var props = this.getProps();

      s = props.s;
      speed = props.speed;
      sampleSize = props.sampleSize;
      numRuns = props.numRuns;
      device = props.device;
      variables = props.variables;
      uniqueVariables = props.uniqueVariables;
      samples = props.samples;

      s.clear();
      document.getElementById("sample_size").value = sampleSize;
      document.getElementById("repeat").value = numRuns;
      var sliderSpeed = speed > 0.5 ? speed : 0;
      document.getElementById("speed").value = sliderSpeed;
      document.getElementById("speed-text").innerHTML = speedText[sliderSpeed];

      this.createSampleSlots();
      if (device === "mixer" || device === "collector") {
        this.createMixer();
      } else {
        this.createSpinner();
      }
    },

    createSampleSlots: function() {
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
          totalHeight = slotHeight * sampleSize,
          mx = x + (maxSlotDepth - slotDepth),
          y = Math.max(containerY, centerY - (totalHeight / 2));

      stroke = (slotHeight < maxHeight) ? stroke / 2 : stroke;

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
          pathStr = "m"+mx+","+my+" h "+w+" v "+shoulder+" h "+cap+" v "+capWidth+" h -"+cap+" v "+shoulder+" h -"+w+" z";

      s.path(pathStr).attr({
            fill: "none",
            stroke: "#333",
            strokeWidth: border
        });

      this.addMixerVariables();
    },

    getLabelForIndex: function(i) {
      return getLabelForVariable(variables[i]);
    },

    addMixerVariables: function() {
      var _this = this;

      balls = [];

      var num = variables.length,
          w = containerWidth - capHeight - (border * 2),
          radius = num < 15 ? 14 : Math.max(14 - (10 * (num-15)/200), 4),
          maxInRow = Math.floor(w / (radius*2)),
          rows = Math.ceil(num/maxInRow),
          maxHeight = containerHeight * 0.75,
          rowHeight = Math.min(radius * 2, maxHeight/rows),
          maxVariableLength = variables.reduce(function(max, v) {
            var length = getLabelForVariable(v).length;
            return Math.max(max, length);
          }, 0),
          fontScaling = 1 - Math.min(Math.max((maxVariableLength - 5) * 0.1, 0), 0.4),
          fontSize,
          i, ii;

      fontSize = radius * fontScaling;

      for (i = 0, ii=num; i<ii; i++) {
        var rowNumber = Math.floor(i/maxInRow),
            rowIndex = i % maxInRow,
            x = (rowNumber % 2 === 0) ? containerX + border + radius + (rowIndex * radius * 2) : containerX + containerWidth - border - capHeight - radius - (rowIndex * radius * 2),
            y = containerY + containerHeight - border - radius - (rowHeight * rowNumber);

        var labelClipping = s.circle(x, y, radius);
        // render ball to the screen
        var text = this.getLabelForIndex(i),
            circle = s.circle(x, y, radius).attr({
              fill: getVariableColor(0, 0, true),
              stroke: "#000",
              strokeWidth: 1
            }),
            label = s.text(x, y, text).attr({
              fontSize: fontSize,
              textAnchor: "middle",
              dy: ".25em",
              dx: getTextShift(text, (3.8*(radius/fontSize))),
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
      }

      // setup animation
      for (i = 0, ii = balls.length; i < ii; i++) {
        var speed = 5 + (Math.random() * 7),
            direction = Math.PI + (Math.random() * Math.PI);
        balls[i].vx = Math.cos(direction) * speed;
        balls[i].vy = Math.sin(direction) * speed;
      }
    },

    animateSelectNextVariable: function (selection, draw, selectionMadeCallback) {
      if (!this.isRunning()) return;

      if (device === "mixer" || device === "collector") {
        this.animateMixerSelection(selection, draw, selectionMadeCallback);
      } else {
        this.animateSpinnerSelection(selection, draw, selectionMadeCallback);
      }
    },

    moveLetterToSlot: function (slot, sourceLetter, insertBeforeElement, initialTrans, selectionMadeCallback) {
      var _this = this;
      if (!this.isRunning()) return;
      // move variable to slot
      var letter = sourceLetter.clone();
      letter.attr({
        textAnchor: "start",
        clipPath: "none",
        dx: 0
      });
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

      letter.animate({transform: matrix, fontSize: size, dy: size/4}, 200/speed);

      if (slot === sampleSize-1) {
        setTimeout(pushLettersOut, 300/speed);
        setTimeout(returnSlots, 600/speed);
        setTimeout(selectionMade, 600/speed);
        function selectionMade() {
          if (_this.isPaused()) {
            setTimeout(selectionMade, 200);
          } else {
            selectionMadeCallback();
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
                letterMatrix = letter.transform().localMatrix;
            sampleMatrix.translate(20, 0);
            letterMatrix.translate(40, 0);
            sampleSlot.animate({transform: sampleMatrix}, 200/speed);
            letter.animate({transform: letterMatrix}, 200/speed, (function(lett) {
              return function() {
                lett.remove();
                samples = [];
              };
            })(letter));
          }
        }
        function returnSlots() {
          if (_this.isPaused()) {
            setTimeout(returnSlots, 200);
            return;
          }
          var speed = _this.getProps().speed;
          for (var i = 0, ii = sampleSlots.length; i < ii; i++) {
            var sampleSlot = sampleSlots[i];
            sampleSlot.animate({transform: "T0,0"}, 200/speed);
          }
        }
      }
    },

    animateMixerSelection: function (selection, draw, selectionMadeCallback) {
      var _this = this,
          props = this.getProps(),
          speed = props.speed,
          hidden = props.hidden,
          ball = balls[selection],
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
        _this.moveLetterToSlot(draw, variable, ball, trans, selectionMadeCallback);
        ball.beingSelected = false;
        if (hidden) {
          setTimeout(function() {
            trans = getTransformForMovingTo(containerX + containerWidth - circle.attr("r") * 3, containerY + (containerHeight/2), circle);
            ball.animate({transform: trans}, 100/speed);
          }, 100/speed);
        }
      });
    },

    animateMixer: function () {
      var _this = this;
      if (this.isRunning()) {
        var timeout = Math.max(30, variables.length * 1.5);
        animationSpeed = timeout / 30;
        setTimeout(function() {
          animationRequest = requestAnimationFrame(_this.animateMixer);
        }, timeout);
        this.mixerAnimationStep();
      }
    },

    mixerAnimationStep: function () {
      if (!this.isPaused()) {
        var speed = this.getProps().speed;
        for (var i = 0, ii = balls.length; i < ii; i++) {
          if (!balls[i].beingSelected) {
            var ball = balls[i],
                matrix = ball.transform().localMatrix,
                dx = ball.vx*speed*animationSpeed,
                dy = ball.vy*speed*animationSpeed,
                bbox = ball.getBBox();


            if ((bbox.x + dx) < (containerX + border)) {
              ball.vx = Math.abs(ball.vx);
              dx = ball.vx*speed*animationSpeed;
            } else if ((bbox.x + bbox.w + dx) > containerX + (containerWidth - capHeight - border)) {
              ball.vx = -Math.abs(ball.vx);
              dx = ball.vx*speed*animationSpeed;
            }
            if (bbox.y + dy < (containerY + border) || (bbox.y + bbox.h + dy) > containerY + containerHeight - border) {
              ball.vy *= -1;
              dy = ball.vy*speed*animationSpeed;
            }

            matrix.translate(dx, dy);
            ball.attr({transform: matrix});
          }
        }
      }
    },

    endAnimation: function () {
      var _this = this;
      if (this.isPaused()) {
        setTimeout(_this.endAnimation, 200);
        return;
      }
      var speed = this.getProps().speed;
      this.setRunning(false);
      for (var i = 0, ii = balls.length; i < ii; i++) {
        balls[i].animate({transform: "T0,0"}, (800 + (Math.random() * 300))/speed, mina.bounce);
      }
      setTimeout(_this.modelReset, 800/speed);
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
      var labelClipping,
          label;

      wedges = [];
      if (uniqueVariables === 1) {
        var circle = s.circle(spinnerX, spinnerY, spinnerRadius).attr({
              fill: getVariableColor(0, 0)
            });
        labelClipping = s.circle(spinnerX, spinnerY, spinnerRadius);
        label = this.createSpinnerLabel(0, 0, spinnerX, spinnerY,
                      spinnerRadius/2, labelClipping, 9, circle);
        wedges.push(label);
      } else {
        var slicePercent = 1 / variables.length,
            lastVariable = "",
            mergeCount = 0,
            offsetDueToMerge = 0;

        for (var i = 0, ii = variables.length; i < ii; i++) {
          var merge = variables[i] === lastVariable;
          mergeCount = merge ? mergeCount + 1 : 0;
          var slice = getSpinnerSliceCoords(i, slicePercent, spinnerRadius, mergeCount),
              textSize = spinnerRadius / (3 + (ii * 0.1));

          lastVariable = variables[i];
          if (merge) offsetDueToMerge++;


          // wedge color
          var wedge = s.path(slice.path).attr({
            fill: getVariableColor((i - offsetDueToMerge), uniqueVariables),
            stroke: "none"
          });

          // label
          labelClipping = s.path(slice.path);
          label = this.createSpinnerLabel(i, i - offsetDueToMerge, slice.center.x, slice.center.y, textSize,
                        labelClipping, Math.max(1, 10 - variables.length), wedge);
          wedges.push(label);

          // white stroke on top of label
          s.path(slice.path).attr({
            fill: "none",
            stroke: "#fff",
            strokeWidth: i === ii - 1 ? 0.5 : 1
          });
        }
      }
    },

    createSpinnerLabel: function (variable, uniqueVariable, x, y, fontSize, clipping, maxLength, parent) {
      var _this = this,
          text = variables[variable],
          label = s.text(x, y, text).attr({
            fontSize: fontSize,
            textAnchor: "middle",
            dy: ".25em",
            dx: getTextShift(text, maxLength),
            clipPath: clipping
          });

      label.click(this.showVariableNameInput(variable));
      label.hover(function() {
        if (_this.isRunning()) return;
        this.attr({ fontSize: fontSize + 2, dy: ".26em", });
        parent.attr({ fill: getVariableColor(uniqueVariable, uniqueVariables, true) });
      }, function() {
        this.attr({ fontSize: fontSize, dy: ".25em", });
        parent.attr({ fill: getVariableColor(uniqueVariable, uniqueVariables) });
      });
      return label;
    },

    animateSpinnerSelection: function (selection, draw, selectionMadeCallback) {
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
        var letter = wedges[selection] || wedges[0];
        _this.moveLetterToSlot(draw, letter, letter, null, selectionMadeCallback);
      });
    },

    showVariableNameInput: function (i) {
      var _this = this;
      return function() {
        if (_this.isRunning() || device === "collector") return;

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

        if (device == "mixer" || device == "collector") {
          variables[editingVariable] = "";
        } else {
          var v = variables[editingVariable];
          editingVariable = [];
          for (var j = 0, jj = variables.length; j < jj; j++) {
            if (variables[j] === v) {
              variables[j] = " ";
              editingVariable.push(j);
            }
          }
        }
        _this.render();
      };
    },

    setVariableName: function () {
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
        this.render();
        editingVariable = false;
      }
    },

    reset: function () {
      if (animationRequest) cancelAnimationFrame(animationRequest);
      balls = [];
      needle = null;
      needleTurns = 0;
      wedges = [];
      sampleSlotTargets = [];
      sampleSlots = [];
    }
  };

  return View;
});

