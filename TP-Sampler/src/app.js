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

document.getElementById("add-variable").onclick = addVariable;
document.getElementById("remove-variable").onclick = removeVariable;


createMixer();
