var ctx = document.getElementById("myChart");
var view_chart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: [],
    datasets: [{
      data: [],
    }],
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  }
});

var ChartInterface = function(){
    this.model = new ChartModel();
    this.view = new ChartView(this.model);
    this.controller = new ChartController(this.model, this.view);

    this.initialize();
};
ChartInterface.prototype = {
  initialize : function(){
  },
  addContextsListen: function(){
  }
}
