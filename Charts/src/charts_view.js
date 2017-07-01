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
//  2. chart type
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
  this.available_charts =  ['bar', 'doughtnut', 'pie', 'radar', 'line'];
  this.default_chart = 'bar';
  this.$chart_types = $('#select-chart');
  this.$chart_container = $("#myChart");

  //the view triggers the following events
  this.selectedAttributeEvent = new Event(this);    //  1. select att
  this.deselectedAttributeEvent = new Event(this);  //  2. deselect att
  this.refreshUserStateEvent = new Event(this);     //  3. refresh
  this.changeChartTypeEvent = new Event(this);      //  4. change chart type

  this.init();
};

ChartView.prototype = {
  init: function(){
    this.createChildren()
    .setupHandlers()
    .enable();
  },
  createChildren: function(){
    this.populateChartOptions(this.available_charts);
    this.initializeChart();
    return this;
  },
  setupHandlers: function(){
    //context events
    /*  1.select   */
    /*  2.deselect */ this.toggleContextHandler = this.toggleContext.bind(this);
    /*  3.create   */ this.addNewContextHandler = this.addNewContext.bind(this);
    /*  4.disabled */

    //attribute events
    /*    1.add */ this.addAttributeHandler = this.addAttribute.bind(this);
    /*   2.move */ this.moveAttributeHandler = this.moveAttribute.bind(this);
    /* 3.delete */ this.deleteAttributeHandler = this.deleteAttribute.bind(this);
    /* 4.select */ this.selectedAttributeHandler = this.selectedAttribute.bind(this);
    /*5.deselect*/ this.deselectAttributeHandler = this.deselectAttribute.bind(this);

    //chart events
    this.changeSelectedChartHandler = this.changeSelectedChart.bind(this);

    return this;
  },
  enable: function(){
    //context events
    /*1*/
    /*2*/ this.model.changedSelectedContextEvent.attach(this.toggleContextHandler);
    /*3*/ this.model.addNewContextEvent.attach(this.addNewContextHandler);
    /*4*/

    //attribute events
    /*1*/ this.model.addAttributeEvent.attach(this.addAttributeHandler);
    /*2*/ this.model.moveAttributeEvent.attach(this.moveAttributeHandler);
    /*3*/ this.model.deleteAttributeEvent.attach(this.deleteAttributeHandler);
    /*4*/ this.model.selectedAttributeEvent.attach(this.selectedAttributeHandler);
    /*5*/ this.model.deselectedAttributeEvent.attach(this.deselectAttributeHandler);

    //chart events
    /*1*/ this.model.changeSelectedChartEvent.attach(this.changeSelectedChartHandler);

    //Own event listeners
    return this;
  },
  populateChartOptions: function(available_charts){
    for(var i = 0; i < available_charts.length; i++){
      var $chart = $("<option>", {'id': available_charts[i]});
      $chart.text(available_charts[i]);
      this.$chart_types.append($chart);
      $chart.change((evt)=>{
      });
    }
  },
  initializeChart: function(){
    this.chart = new Chart(this.$chart_container, {
      type: this.default_chart,
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
  changeSelectedChart: function(sender, args){
    //@TODO get the new chart and notify listener
    this.chart.destroy();
    this.chart = new Chart(this.$chart_container, {
      type: this.default_chart,
      data: {
        labels: args.labels,
        datasets: [{
          data:args.data,
          backgroundColor: args.background_colors,
          borderColor: args.colors,
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  },
   /**
   * attributeMove
   * @param  {sender} sender
   * @param  {string[]} attributes  [name of attribute moved, name of attribute it is after]
   */
   moveAttribute: function(sender, attributes){
     $("#"+attributes[0]).insertAfter('#'+attributes[1]);
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
    $('#'+attribute.name).on('click', (evt) => {
      evt.stopPropagation();
      this.selectedAttributeEvent.notify(attribute);
    });
  },
  /**
   * @function selectedAttribute - stylizes the attribute item after click
   * @param  {Object} sender
   * @param {string} attribute
   */
  selectedAttribute: function(sender, attribute){
    $('#'+attribute).addClass("selected");
  },
  /**
   * @function deselectAttribute
   * @param  {Object} sender
   * @param {string} attribute
   */
  deselectAttribute: function(sender, attribute){
    $('#'+attribute).removeClass("selected");
  },
  /**
   * @function toggleContext - stylize unselected context back to original
   * @param  {Object} sender
   * @param  {Object} args   {selected: context(string),
   *                          deselected: context(string)}
   */
  toggleContext: function(sender, args){
    if(args.selected){
      $('#'+args.selected).children().show();
    }
    if(args.deselected){
      $('#'+args.deselected).find(".selected").removeClass("selected");
    }
  },
  /**
   * @function deleteAttribute
   * @param  {Object} sender [description]
   * @param  {string} attribute - name of attribute
   */
  deleteAttribute: function(sender, attribute){
    $('#'+attribute).slideToggle('normal', function(){
      $(this).remove();
    });
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
  var $unList = $("<ul>", {'id': context, 'class':'view-context-list'});
  $unList.css("background-color", 'lightblue');
  $unList.hover(
    function(){ $(this).css("background-color", "white"); },
    function(){ $(this).css("background-color", "lightblue"); }
  );
  $unList.text(context);
  $unList.click(function(event){
    event.stopPropagation();
    $(this).children().slideToggle('fast');
  })
  $('#contextList').append($unList);
}
/**
 * @function addAttributeToContextDOM - adds a single attribute element to context list
 * @param {string} attribute
 * @param {string} context
 */
function addAttributeToContextDOM(attribute, context){
  var $item = $("<li>", {'id': attribute, 'class':'view-attribute-list'});
  var isVisible = $('#'+context).children().is(':visible');
  if(!isVisible){
    $item.css("display", 'none');
  }
  $item.text(attribute);
  $('#'+context).append($item);
}
