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
var myChart;
function initChart(){
  myChart = new Chart(ctx, {
    type: selected.graph,
    data: {
      labels: selected.attributeList,
      datasets: [{
        data: selected.data,
      }],
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    }
  });
}
function drawChart(){
  if(!(myChart === undefined)){
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    type: selected.graph,
    data: {
        labels: selected.attributeList,
        datasets: [{
            label: 'Count',
            data: selected.data,
            backgroundColor: selected.colors,
            borderColor: selected.backgroundColor,
            borderWidth: 1
        }]
    },
    options: {
      title:{
        display: true,
        text: selected.attribute.att
      },
      scales: {
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'Count'
          }
        }]
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

document.getElementById("select-chart").onchange = function(evt) {
  if(evt.target.value) {
  selected.graph = evt.target.value;
  }
  chart.draw();
}
