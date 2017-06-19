var chart = {
  initialize : function(){
    var model = new ChartModel(),
        view = new ChartView(model),
        controller = new ChartController(model, view)
  },
  addContextsListen: function(){

    //add context change listener
  }
  // ,
  // draw : function(){
  //   drawChart()
  // }
}
// var ctx = document.getElementById("myChart");
// var myChart;
// function initChart(){
//   myChart = new Chart(ctx, {
//     type: selected.graph,
//     data: {
//       labels: selected.attributeList,
//       datasets: [{
//         data: selected.data,
//       }],
//       options: {
//         responsive: true,
//         maintainAspectRatio: false
//       }
//     }
//   });
// }
// function drawChart(){
//   if(!(myChart === undefined)){
//     myChart.destroy();
//   }
//   myChart = new Chart(ctx, {
//     type: selected.graph,
//     data: {
//         labels: selected.attributeList,
//         datasets: [{
//             label: 'Count',
//             data: selected.data,
//             backgroundColor: selected.colors,
//             borderColor: selected.backgroundColor,
//             borderWidth: 1
//         }]
//     },
//     options: {
//       responsive: true,
//       maintainAspectRatio: false,
//       title:{
//         display: true,
//         text: selected.attribute.att
//       }
//       // this should only be added if it is a bar graph or similar
//       // because it creates a line grid in the background that doesn't
//       // go well with the pie charts
//       // scales: {
//       //   yAxes: [{
//       //     scaleLabel: {
//       //       display: true,
//       //       labelString: 'Count'
//       //     }
//       //   }]
//       // }
//     }
//   });
// }
//
// document.getElementById("select-chart").onchange = function(evt) {
//   if(evt.target.value) {
//   selected.graph = evt.target.value;
//   }
//   chart.draw();
// }
