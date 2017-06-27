var available_charts = ['bar', 'doughtnut', 'pie', 'radar', 'line'];
var chart_type = 'bar'
var ctx = document.getElementById("myChart");
var view_chart = new Chart(ctx, {
  type: chart_type,
  data: {
    labels: [],
    datasets: [{
      data: [],
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false
  }
});

populateChartOptions(available_charts);

var ChartInterface = function(){
    // this.model = new ChartModel();
    // this.view = new ChartView(this.model);
    // this.controller = new ChartController(this.model, this.view);

    this.initialize();
};
ChartInterface.prototype = {
  initialize : function(){
    console.log('here');
  },
  addContextsListen: function(){
  }
}

function populateChartOptions(available_charts){
  for(var i = 0; i < available_charts.length; i++){
    var $chart = $("<option>", {'id': available_charts[i]});
    $chart.text(available_charts[i]);
    $('#select-chart').append($chart);
  }
}
document.getElementById("select-chart").onchange = function(evt) {
  if(evt.target.value) {
    view_chart.type = evt.target.value;
    chart_type = evt.target.value;
  }
  view_chart.u();
  console.log('here');
}
