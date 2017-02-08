var s = Snap("#model svg"),

    width = 250,      // svg units
    height = 125,
    containerX = 50,
    containerY = 25,
    containerWidth = 200,
    containerHeight = 100,
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
    sampleSlots = [];

function render() {
  s.clear();
  createSampleSlots();
  createMixer();
}

function createSampleSlots() {
  var y = containerY / 2,
      centerX = containerX + (containerWidth/2),
      stroke = border / 2,
      padding = 2,
      maxWidth = 20,
      minWidth = (containerWidth/sampleSize)
      slotWidth = Math.min(minWidth, maxWidth),
      slotSize = slotWidth - padding - (stroke*2),
      maxSlotHeight = 4,
      minSlotHeight = slotSize/3,
      slotHeight = Math.min(minSlotHeight, maxSlotHeight),
      stroke = (slotWidth < maxWidth) ? stroke / 2 : stroke,
      totalWidth = slotWidth * sampleSize,
      x = centerX - (totalWidth / 2);

  for (var i = 0; i < sampleSize; i++) {
    var mx = x + padding + (slotWidth * i),
        pathStr = "m"+mx+","+y+" v "+slotHeight+" h "+slotSize+" v -"+slotHeight;

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
      my = containerY + capHeight,
      w = containerWidth - border,
      shoulder = (w - capWidth) / 2,
      cap = capHeight - halfb,
      h = containerHeight - capHeight - halfb,
      pathStr = "m"+mx+","+my+" h "+shoulder+" v -"+cap+" h "+capWidth+" v "+cap+" h "+shoulder+" v "+h+" h -"+w+" z";

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
      maxRadius = (containerWidth - border * 2) / (variables.length * 2),
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
          trans = getTransformForMovingTo(containerX + (containerWidth/2), containerY + circle.attr("r") * 1, circle);
      ball.animate({transform: trans}, 500, function() {
        selectionMadeCallback(draw, variables[selection]);
        ball.animate({transform: "T0,0"}, 500);
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

render();

// connect to CODAP

codapInterface.on('get', 'interactiveState', function () {
  return {success: true, values: {}};
});

// initialize the codapInterface
codapInterface.init({
    name: 'Sampler',
    title: 'Sampler',
    dimensions: {width: 350, height: 250},
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
