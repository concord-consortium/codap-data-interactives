//=================================================================
//
//   Author: Miguel Gutierrez
//   Date: June 2017
//
//  Copyright (c) 2016 by The Concord Consortium, Inc. All rights reserved.
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.
//=================================================================
//

var my_chart;

// initialize the codapInterface
codapInterface.init({
  name: 'Graphs',
  dimensions: {width: 700, height: 500},
  title: 'Graphs',
  version: '0.1',
}).then(function(iResult){
  console.log('loading codap int');

  my_chart = codapInterface.getInteractiveState();

  console.log(my_chart);

  if(!my_chart.controller){
      my_chart.model = new ChartModel();
      my_chart.view = new ChartView(my_chart.model);
      my_chart.controller = new ChartController(my_chart.model, my_chart.view);
  }
});

function getData(context, collection, attribute){
  var src = "";
  switch (arguments.length){
    case 1:
      src = 'dataContext[' + context +'].collectionList';
      break;
    case 2:
      src = 'dataContext[' + context +'].collection[' + collection + '].attributeList';
      break;
    case 3:
      src = 'dataContext[' + context +'].collection['+ collection + '].caseSearch['
                                                              + attribute +' != \'\']';
      break;
    default:
      src = 'dataContextList';
  }  return new Promise(function(resolve, reject){
      codapInterface.sendRequest({
        action: 'get',
        resource: src,
      }, function(result) {
        if (result && result.success) {
          resolve(result.values);
        } else {
          resolve([]);
        }
      });
    });
}
function getNewColors(amount){
  var colors = [];
  var backgroundColor = [];
  for (var i = 0; i < amount; i++) {
    var r = Math.floor( 200 * Math.random()) + 55;
    var g = Math.floor( 200 * Math.random()) + 55;
    var b = Math.floor( 200 * Math.random()) + 55;
    colors.push('rgba('+r+','+g+ ',' +b+ ',1)');
    backgroundColor.push('rgba('+(r-40)+ ','+(g-40)+ ',' +(b-40)+ ',.8)')
  }
  return {colors: colors, bg_colors: backgroundColor};
}
