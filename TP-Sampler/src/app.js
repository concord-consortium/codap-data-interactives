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

    experimentNumber = 0,
    runNumber = 0,

    numRuns = 5,
    sampleSize = 2,

    experimentCaseID,
    runCaseID,

    variables = ["a", "b", "a"],
    balls = [],
    sampleSlots = [],
    samples = [];

function render() {
  s.clear();
  createSampleSlots();
  createMixer();
}

function createSampleSlots() {
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

  sampleSlots = [];

  for (var i = 0; i < sampleSize; i++) {
    var my = y + padding + (slotHeight * i),
        pathStr = "m"+mx+","+my+" h -"+slotDepth+" v "+slotSize+" h "+slotDepth,
        r = slotSize/2,
        letterCenterX = x + r,
        letterCenterY = my + (slotSize / 2);

    // first we make circles to mark the spot for letter movement
    sampleSlots.push(s.circle(letterCenterX, letterCenterY, r).attr({
      fill: "#fff",
      stroke: "#fff",
      strokeWidth: 0
    }));

    // then the slots
    s.path(pathStr).attr({
        fill: "none",
        stroke: "#333",
        strokeWidth: stroke
    });
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

  var minRadius = 15,
      maxRadius = (containerWidth - capHeight - (border * 2)) / (variables.length * 2),
      radius = Math.min(minRadius, maxRadius);
  // other calcs...
  for (var i = 0, ii=variables.length; i<ii; i++) {
    var x = containerX + border + radius + (i * radius * 2),
        y = containerY + containerHeight - border - radius;
    // render ball to the screen
    balls.push(s.group(
      s.circle(x, y, radius).attr({
          fill: "#ddd",
          stroke: "#000",
          strokeWidth: 1
      }),
      s.text(x, y, variables[i]).attr({
        fontSize: radius,
        textAnchor: "middle",
        dy: ".25em"
      })
    ));
  }
}

function getNextVariable() {
  // brain-dead version for now
  return "" + (variables.length + 1);
}

function addVariable() {
  variables.push(getNextVariable());
  render();
}

function removeVariable() {
  variables.pop();
  render();
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

function run() {
  startNewExperimentInCODAP().then(function() {
    var sequence = createRandomSequence(sampleSize, numRuns);

    // selection animation
    function select(run, draw, selectionMadeCallback) {
      var selection = sequence[run][draw],
          ball = balls[selection],
          circle = ball.select("circle"),
          variable = ball.select("text"),
          trans = getTransformForMovingTo(containerX + containerWidth - circle.attr("r") * 1, containerY + (containerHeight/2), circle);
      ball.animate({transform: trans}, 500, function() {
        // move variable to slot
        var letter = variable.clone();
        samples.push(letter);
        ball.before(letter);
        letter.attr({transform: trans});
        // trans = "t"+0+",-"+5
        var origin = letter.getBBox();
        var target = sampleSlots[draw].getBBox();
        matrix = letter.transform().localMatrix;
        letterTrans = "t"+(target.cx)+","+(target.cy);
        matrix.translate((target.cx-origin.cx), (target.cy-origin.cy));
        // matrix.scale(2);
        letter.animate({transform: matrix, fontSize: sampleSlots[draw].attr("r")*2}, 200);

        selectionMadeCallback(draw, variables[selection]);
        ball.animate({transform: "T0,0"}, 500);

        if (draw == sampleSize-1) {
          // move this!
          setTimeout(function() {
            for (var i = 0, ii = samples.length; i < ii; i++) {
              samples[i].remove();
            }
          }, 700);
        }
      });
    }

    function scheduleNextSelection() {
      // for now just assume every 1000ms
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
      if (sequence[run]) {
        scheduleNextSelection();
      }
    }

    selectNext();
  });
}

document.getElementById("add-variable").onclick = addVariable;
document.getElementById("remove-variable").onclick = removeVariable;
document.getElementById("run").onclick = run;
document.getElementById("draws").addEventListener('input', function (evt) {
    sampleSize = this.value;
    render();
});
document.getElementById("repeat").addEventListener('input', function (evt) {
    numRuns = this.value;
    render();
});

render();

// connect to CODAP

codapInterface.on('get', 'interactiveState', function () {
  return {success: true, values: {}};
});

// initialize the codapInterface
codapInterface.init({
    name: 'Sampler',
    title: 'Sampler',
    dimensions: {width: 250, height: 420},
    version: '0.1',
    stateHandler: function (state) {
      console.log('stateHandler: ' + (state && JSON.stringify(state)));
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
  });

function startNewExperimentInCODAP() {
  return new Promise(function(resolve, reject) {
    if (!codapInterface.connection.isConnected()) {
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
      if (result.success) {
        experimentCaseID = result.values[0].id;
        resolve();
      }
      else {
        window.alert('Unable to begin experiment');
        reject();
      }
    });
  });
}

function startNewRunInCODAP() {
  if (!codapInterface.connection.isConnected()) {
    resolve();
    return;
  }

  runNumber++;
  return new Promise(function(resolve) {
    codapInterface.sendRequest({
      action: 'create',
      resource: 'collection[runs].case',
      values: {
        parent: experimentCaseID,
        values: {run: runNumber}
      }
    }, function(result) {
      runCaseID = result.values[0].id;
      resolve()
    });
  });
}

function addValueToCODAP(draw, val) {
  if (!codapInterface.connection.isConnected()) {
    return;
  }


  function _addValue() {
    codapInterface.sendRequest({
      action: 'create',
      resource: 'collection[draws].case',
      values: {
        parent: runCaseID,
        values: {value: val}
      }
    });
  }
  if (draw === 0) {
    startNewRunInCODAP().then(_addValue);
  } else {
    _addValue();
  }
}
