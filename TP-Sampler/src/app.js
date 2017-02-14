var s = Snap("#model svg"),

    width = 190,      // svg units
    height = 250,
    containerX = 10,
    containerY = 0,
    containerWidth = 130,
    containerHeight = 250,
    capHeight = 6,
    capWidth = 40,
    border = 2,

    codapConnected = true,

    running = false,
    animationRequest = null,

    experimentNumber = 0,
    runNumber = 0,

    numRuns = 5,
    sampleSize = 2,

    experimentCaseID,
    runCaseID,

    variables = ["a", "b", "a"],
    balls = [],
    sampleSlotTargets = [],
    sampleSlots = [],
    samples = [],

    editingVariable,
    variableNameInput = document.getElementById("variable-name-change");

function render() {
  s.clear();
  createsampleSlots();
  createMixer();
  document.getElementById("draws").value = sampleSize;
  document.getElementById("repeat").value = numRuns;
}

function createsampleSlots() {
  var x = containerWidth + ((width - containerWidth)  / 3),
      centerY = containerY + (containerHeight/2),
      stroke = border / 2,
      padding = 2,
      maxHeight = 20,
      minHeight = (containerHeight/sampleSize)
      slotHeight = Math.min(minHeight, maxHeight),
      slotSize = slotHeight - padding - (stroke*2),
      maxSlotDepth = 4,
      minSlotDepth = slotSize/3,
      slotDepth = Math.min(minSlotDepth, maxSlotDepth),
      stroke = (slotHeight < maxHeight) ? stroke / 2 : stroke,
      totalHeight = slotHeight * sampleSize,
      mx = x + (maxSlotDepth - slotDepth),
      y = centerY - (totalHeight / 2);

  sampleSlotTargets = [];
  sampleSlots = [];

  for (var i = 0; i < sampleSize; i++) {
    var my = y + padding + (slotHeight * i),
        pathStr = "m"+mx+","+my+" h -"+slotDepth+" v "+slotSize+" h "+slotDepth,
        r = slotSize/2,
        letterCenterX = x + r,
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

    // render ball to the screen
    var ball = s.group(
      s.circle(x, y, radius).attr({
          fill: "#ddd",
          stroke: "#000",
          strokeWidth: 1
      }),
      s.text(x, y, getShortVariableName(i)).attr({
        fontSize: radius,
        textAnchor: "middle",
        dy: ".25em"
      })
    );
    balls.push(ball);
    ball.click(showVariableNameInput(i));
  }

  // setup animation
  for (var i = 0, ii = balls.length; i < ii; i++) {
    let speed = 5 + (Math.random() * 7),
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
  if (running) return;
  variables.push(getNextVariable());
  render();
}

function removeVariable() {
  if (running) return;
  variables.pop();
  render();
}

function showVariableNameInput(i) {
  return function() {
    var loc = this.node.getClientRects()[0];
    variableNameInput.style.display = "block";
    variableNameInput.style.top = (loc.top + loc.height/2) + "px";
    variableNameInput.style.left = (loc.left + loc.width/2) + "px";
    variableNameInput.value = variables[i];
    variableNameInput.focus();
    editingVariable = i;
  }
}

function setVariableName() {
  variables[editingVariable] = variableNameInput.value;
  variableNameInput.style.display = "none";
  render();
}

function getShortVariableName(i) {
  var name = variables[i];
  if (name.length < 4) {
    return name;
  } else {
    return name.substr(0,2) + "…";
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

function runOrStop() {
  if (!running) {
    running = true;
    disableAddButtons();
    document.getElementById("run").innerHTML = "STOP";
    run();
  } else {
    running = false;
    for (let i = 0, ii = samples.length; i < ii; i++) {
      if (samples[i].remove) {
        samples[i].remove();
      }
    }
    samples = [];
    endAnimation();
  }
}

function run() {
  startNewExperimentInCODAP().then(function() {
    var sequence = createRandomSequence(sampleSize, numRuns);

    // selection animation
    function select(run, draw, selectionMadeCallback) {
      if (!running) return;

      var selection = sequence[run][draw],
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

      ball.animate({transform: trans}, 500, function() {
        if (!running) return;
        // move variable to slot
        var letter = variable.clone();
        samples.push(letter);
        ball.before(letter);
        letter.attr({transform: trans});
        // trans = "t"+0+",-"+5
        var origin = letter.getBBox();
        var target = sampleSlotTargets[draw].getBBox();
        matrix = letter.transform().localMatrix;
        matrix.translate((target.cx-origin.cx), (target.cy-origin.cy));
        // matrix.scale(2);
        letter.animate({transform: matrix, fontSize: sampleSlotTargets[draw].attr("r")*2}, 200);

        ball.beingSelected = false;

        if (draw == sampleSize-1) {
          // move this!
          setTimeout(function() {
            if (!running) return;
            for (let i = 0, ii = sampleSlots.length; i < ii; i++) {
              let sampleSlot = sampleSlots[i],
                  letter = samples[i],
                  sampleMatrix = sampleSlot.transform().localMatrix,
                  letterMatrix = letter.transform().localMatrix;
              sampleMatrix.translate(20, 0);
              letterMatrix.translate(40, 0);
              sampleSlot.animate({transform: sampleMatrix}, 200);
              letter.animate({transform: letterMatrix}, 200, function() {
                letter.remove();
                samples = [];
              });
            }
          }, 300);
          setTimeout(function() {
            for (let i = 0, ii = sampleSlots.length; i < ii; i++) {
              let sampleSlot = sampleSlots[i];
              sampleSlot.animate({transform: "T0,0"}, 200);
            }
          }, 600);
        }
      });
      if (draw == sampleSize-1) {
        setTimeout(function() {
          let vars = sequence[run].map(function(i) {
            return variables[i];
          });
          selectionMadeCallback(run+1, vars);
        }, 800);
      }
    }

    function scheduleNextSelection() {
      setTimeout(selectNext, 1000);
    }

    var run = 0,
        draw = 0;

    function selectNext() {
      select(run, draw, addValueToCODAP);

      if (draw < sequence[run].length - 1) {
        draw++;
      } else {
        run++;
        draw = 0;
      }
      if (running) {
        if (sequence[run]) {
          scheduleNextSelection();
        } else {
          setTimeout(endAnimation, 1000);
        }
      }
    }

    function animationStep() {
      for (var i = 0, ii = balls.length; i < ii; i++) {
        if (!balls[i].beingSelected) {
          let ball = balls[i],
              matrix = ball.transform().localMatrix;
          matrix.translate(ball.vx, ball.vy);
          ball.attr({transform: matrix});

          let bbox = ball.getBBox();
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

    function animate() {
      if (running) {
        setTimeout(function() {
          animationRequest = requestAnimationFrame(animate);
        }, 30);
      }
      animationStep();
    }
    animate();

    selectNext();
  });
}

function endAnimation() {
  running = false;
  document.getElementById("run").innerHTML = "RUN";
  if (animationRequest) cancelAnimationFrame(animationRequest);
  enableAddButtons();
  for (var i = 0, ii = balls.length; i < ii; i++) {
    balls[i].animate({transform: "T0,0"}, 300 + (Math.random() * 300), mina.bounce);
  }
  setTimeout(reset, 350);
}

function reset() {
  balls = [];
  sampleSlotTargets = [];
  sampleSlots = [];
  samples = [];
  render();
}

document.getElementById("add-variable").onclick = addVariable;
document.getElementById("remove-variable").onclick = removeVariable;
document.getElementById("run").onclick = runOrStop;
document.getElementById("draws").addEventListener('input', function (evt) {
    sampleSize = this.value;
    render();
});
document.getElementById("repeat").addEventListener('input', function (evt) {
    numRuns = this.value;
    render();
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
function disableAddButtons() {
  addClass(document.getElementById("add-variable"), "disabled");
  addClass(document.getElementById("remove-variable"), "disabled");
}
function enableAddButtons() {
  removeClass(document.getElementById("add-variable"), "disabled");
  removeClass(document.getElementById("remove-variable"), "disabled");
}

render();

// connect to CODAP

codapInterface.on('get', 'interactiveState', function () {
  return {success: true, values: {
    experimentNumber: experimentNumber,
    variables: variables,
    draw: sampleSize,
    repeat: numRuns
  }};
});

// initialize the codapInterface
codapInterface.init({
    name: 'Sampler',
    title: 'Sampler',
    dimensions: {width: 250, height: 420},
    version: '0.1',
    stateHandler: function (state) {
      if (state && state.experimentNumber) {
        experimentNumber = state.experimentNumber;
        variables = state.variables;
        sampleSize = state.draw;
        numRuns = state.repeat;
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

function addValueToCODAP(run, vals) {
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
