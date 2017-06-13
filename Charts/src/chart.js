var chart = {
  hasDrawn : false,
  initialize : function(){
    getInitialData(),
    listenToChanges(),
    info.getGraphsList()
  },
  draw : function(){
    drawChart()
  }
}
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
  type: info.selected.graph,
  data: {
      labels: info.attributeList,
      datasets: [{
        data: info.data,
      }],
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
});
function drawChart(){
  myChart.destroy();
  myChart = new Chart(ctx, {
    type: info.selected.graph,
    data: {
        labels: info.attributeList,
        datasets: [{
            data: info.data,
            backgroundColor: info.colors,
            borderColor: info.backgroundColor,
            borderWidth: 1
        }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

document.getElementById("select-chart").onchange = function(evt) {
  if(evt.target.value) {
    info.selected.graph = evt.target.value;
  }
  chart.draw();
}
