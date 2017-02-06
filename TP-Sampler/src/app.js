var s = Snap("#model svg"),
    width = 200,      // svg units
    height = 100,
    border = 2,
    variables = ["a", "b", "a"],
    balls = [];

function createMixer() {
  s.clear();
  s.path("m1,6 h 79 v -5 h 40 v 5 h 79 v 93 h -198 z").attr({
        fill: "none",
        stroke: "#333",
        strokeWidth: 2
    });

  addMixerVariables();
}

function addMixerVariables() {
  balls = [];

  var minRadius = 15,
      maxRadius = (width - border * 2) / (variables.length * 2),
      radius = Math.min(minRadius, maxRadius);
  // other calcs...
  for (var i = 0, ii=variables.length; i<ii; i++) {
    var x = border + radius + (i * radius * 2),
        y = height - border - radius;
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
  createMixer();
}

function removeVariable() {
  variables.pop();
  createMixer();
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
  var sequence = createRandomSequence(20, 1);

  // selection animation
  function select(i) {
    var ball = balls[i],
        circle = ball.select("circle"),
        trans = getTransformForMovingTo(100, circle.attr("r") * 1, circle);
    ball.animate({transform: trans}, 500, function() {
      ball.animate({transform: "T0,0"}, 500);
    });
  }

  var run = 0,
      draw = 0;

  function selectNext() {
    select(sequence[run][draw]);
    if (draw < sequence[run].length - 1) {
      draw++;
    } else {
      run++;
      draw = 0;
    }
    if (sequence[run]) {
      setTimeout(selectNext, 1000);
    }
  }

  selectNext();

}

document.getElementById("add-variable").onclick = addVariable;
document.getElementById("remove-variable").onclick = removeVariable;
document.getElementById("run").onclick = run;


createMixer();
