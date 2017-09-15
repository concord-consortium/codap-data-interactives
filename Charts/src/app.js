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

var user_state = null;
var my_chart = {};

// initialize the codapInterface
codapInterface.init({

  name: 'Charts',
  dimensions: {width: 700, height: 500},
  title: 'Charts',
  version: '1.0',
}).then(function(iResult){
  user_state = codapInterface.getInteractiveState();

  if(!user_state.selected){
    user_state.selected = null;
  }
  var my_chart = {};
  my_chart.model = new ChartModel();
  my_chart.view = new ChartView(my_chart.model);
  my_chart.controller = new ChartController(my_chart.model, my_chart.view, user_state);
});

function openAuthorInfo(){
  $('#authorinfo').show();
  $('#close-author').on('click', function(evt){
    $('#authorinfo').hide();
  });
}
function openHelpInfo(){
  $('#helpinfo').show();
  $('#close-help').on('click', function(evt){
    $('#helpinfo').hide();
  });
}
function refreshPlugin(){
  $('#contextList').empty();
  $('#myChart').remove();
  $('#select-chart').empty();
  $('#chart-container').append('<canvas id="myChart"><canvas>');

  user_state = {};
  user_state.selected = null;
  my_chart = {};

  my_chart.model = new ChartModel();
  my_chart.view = new ChartView(my_chart.model);
  my_chart.controller = new ChartController(my_chart.model, my_chart.view, user_state);
};
