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

//the view listens to the followings events:
// a. changes for attributes
//  1. add att
//  2. move att
//  3. delete att
//  4. select att
//  5. unselect att
//
// b. changes in context
//  1. select cxt
//  2. deselect cxt
//  3. create cxt
//  4. disabled cxt
//
// c. changes in chart
//  1. data
//  2. available list
//
//the view triggers the following events
//  1. select att
//  2. deselect att
//  3. refresh
//  4. change chart type

/**
 * @constructor ChartView - focuses on what is displayed in the UI and listens to user actions
 * @param  {Object} model - uses the model to communicate with CODAP
 */
var ChartView = function(model){
  this.model = model;
  this.chart = null;
  this.$chart_types = $('#select-chart');
  this.$chart_container = $("#myChart");
  this.$message_box = $('#user-messages');

  //the view triggers the following events
  this.selectedAttributeEvent = new Event(this);    //  1. select att
  this.deselectedAttributeEvent = new Event(this);  //  2. deselect att
  this.refreshUserStateEvent = new Event(this);     //  3. refresh
  this.changedChartTypeEvent = new Event(this);     //  4. change chart type

  this.init();
};

ChartView.prototype = {
  init: function(){
    this.createChildren()
    .setupHandlers()
    .enable();
  },
  createChildren: function(){
    return this;
  },
  setupHandlers: function(){
    //context events
    /*  1.select   */ this.selectedContextHandler = this.selectedContext.bind(this);
    /*  2.deselect */ this.deselectContextHandler = this.deselectContext.bind(this);
    /*  3.create   */ this.addNewContextHandler = this.addNewContext.bind(this);
    /*  4.disabled */

    //attribute events
    /* 1.add      */ this.addAttributeHandler = this.addAttribute.bind(this);
    /* 2.move     */ this.moveAttributeHandler = this.moveAttribute.bind(this);
    /* 3.delete   */ this.deleteAttributeHandler = this.deleteAttribute.bind(this);
    /* 4.select   */ this.selectedAttributeHandler = this.selectedAttribute.bind(this);
    /* 5.deselect */ this.deselectAttributeHandler = this.deselectAttribute.bind(this);

    //chart events
    /* 1. data  */ this.changedChartDataHandler = this.changedChartData.bind(this);
    /* 2. types */ this.loadedChartsListHandler = this.loadedChartsList.bind(this);
    /* 3. select*/ this.changedChartTypeHandler = this.changedChartType.bind(this);

    return this;
  },
  enable: function(){
    //context events
    /*1*/ this.model.selectedContextEvent.attach(this.selectedContextHandler);
    /*2*/ this.model.deselectedContextEvent.attach(this.deselectContextHandler);
    /*3*/ this.model.addNewContextEvent.attach(this.addNewContextHandler);
    /*4*/

    //attribute events
    /*1*/ this.model.addAttributeEvent.attach(this.addAttributeHandler);
    /*2*/ this.model.moveAttributeEvent.attach(this.moveAttributeHandler);
    /*3*/ this.model.deleteAttributeEvent.attach(this.deleteAttributeHandler);
    /*4*/ this.model.selectedAttributeEvent.attach(this.selectedAttributeHandler);
    /*5*/ this.model.deselectedAttributeEvent.attach(this.deselectAttributeHandler);

    //chart events
    /*1*/ this.model.changedChartDataEvent.attach(this.changedChartDataHandler);
    /*2*/ this.model.loadedChartsListEvent.attach(this.loadedChartsListHandler);
    /*3*/ this.model.changedChartTypeEvent.attach(this.changedChartTypeHandler);

    return this;
  },
  /**
   * @function loadedChartsList
   * @param  {string[]} available_charts
   */
  loadedChartsList: function(sender, available_charts){
    for(var i = 0; i < available_charts.length; i++){
      var $chart = $("<option>", {'id': available_charts[i]});
      $chart.text(available_charts[i]);
      this.$chart_types.append($chart);
    }
    this.$chart_types.on('change', (evt)=>{
      this.changedChartTypeEvent.notify(evt.target.value);
    });
  },
  /**
   * @function initializeChart - initializes the chart to blank values
   * @return {[type]} [description]
   */
  initializeChart: function(){
    this.chart = new Chart(this.$chart_container, {
      type: 'bar',
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
  },
  /**
   * @function changedChartData
   * @param  {Object} sender
   * @param  {Object} data   data parsed to be passed in to chart
   */
  changedChartData: function(sender, data){
    this.chart.destroy();
    this.chart = new Chart(this.$chart_container, data);
  },
   /**
   * attributeMove
   * @param  {sender} sender
   * @param  {Object} attribute
   * @param  {string} attribute.name
   * @param  {string} attribute.after
   */
   moveAttribute: function(sender, attributes){
     $("#"+removeSpace(attributes.name)).insertAfter('#'+removeSpace(attributes.after));
   },
   /**
   * @function addNewContext - adds context to UI
   * @param  {Object} sender
   * @param  {string} context - name
   */
  addNewContext: function(sender, context){
    addContextDOM(context);
  },
  /**
   * @function addAttribute - handles new attribute event
   * @param  {Object} sender
   * @param  {Object} attribute - the new attribute to be added
   * @param  {string} attribute.name  - name of attribute
   * @param  {string} attribute.context - name of context
   */
  addAttribute: function(sender, attribute){
    addAttributeToContextDOM(attribute.name, attribute.context);
    $('#'+removeSpace(attribute.name)).on('click', (evt) => {
      evt.stopPropagation();
      this.selectedAttributeEvent.notify(attribute);
    });
  },
  /**
   * @function selectedAttribute - stylizes the attribute item after click
   * @param  {Object} sender
   * @param {Object} attribute
   * @param {string} attribute.name
   * @param {string} attribute.type
   */
  selectedAttribute: function(sender, attribute){
    $('#'+removeSpace(attribute.name)).addClass(attribute.type);
  },
  /**
   * @function deselectAttribute
   * @param  {Object} sender
   * @param {string} attribute
   */
  deselectAttribute: function(sender, attribute){
    $('#'+removeSpace(attribute)).removeClass('primary');
    $('#'+removeSpace(attribute)).removeClass('secondary');
  },
  /**
   * @function deselectContext - stylize unselected context back to original
   * @param  {Object} sender
   * @param  {string} context
   */
  deselectContext: function(sender, context){
    $('#'+removeSpace(context)).find(".primary").removeClass('primary');
    $('#'+removeSpace(context)).find(".secondary").removeClass('secondary');
  },
  /**
   * @function selectContext - stylize context back to original
   * @param  {Object} sender
   * @param  {string} context
   */
  selectedContext: function(sender, context){
    $('#'+removeSpace(context)).children().show();
  },
  /**
   * @function deleteAttribute
   * @param  {Object} sender [description]
   * @param  {string} attribute - name of attribute
   */
  deleteAttribute: function(sender, attribute){
    $('#'+removeSpace(attribute)).slideToggle('normal', function(){
      $(this).remove();
    });
  },
  /**
   * @function changedChartType - updates the selected chart type
   * @param  {Object} sender
   * @param  {string} type   chart type
   */
  changedChartType: function(sender, type){
    this.$chart_types.val(type);
  },
  displayMessage: function(string){

  }
}

//================================================
//
//  Functions that manipulate the DOM
//
//================================================
/**
 * @function addContextDOM - adds an unordered list with toggle and hover
 * @param {string} context context name
 */
function addContextDOM(context){
  var $unList = $("<ul>", {'id': removeSpace(context), 'class':'view-context-list'});
  $unList.css("background-color", "#7EE6FF");
  $unList.hover(
    function(){ $(this).css("background-color", "white"); },
    function(){ $(this).css("background-color", "#7EE6FF"); }
  );
  $unList.text(context);
  $unList.click(function(event){
    event.stopPropagation();
    $(this).children().slideToggle('fast');
  });
  $('#contextList').append($unList);
}
/**
 * @function addAttributeToContextDOM - adds a single attribute element to context list
 * @param {string} attribute
 * @param {string} context
 */
function addAttributeToContextDOM(attribute, context){
  var $item = $("<li>", {'id': removeSpace(attribute), 'class':'view-attribute-list'});
  var isVisible = $('#'+removeSpace(context)).children().is(':visible');
  if(!isVisible){
    $item.css("display", 'none');
  }
  $item.text(attribute);
  $('#'+removeSpace(context)).append($item);
}
/**
 * @function removeSpace  - removes white spaces from a string`
 * @param  {string} string
 * @return {string}
 */
function removeSpace(str){
  return str.replace(/\s+/g, '');
}
