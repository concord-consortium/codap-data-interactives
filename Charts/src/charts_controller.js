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
/**
 * @constructor ChartController - this object communicates with the model object
 *              and the view object in order to update the data, the UI, and the chart
 * @param  {Object} model - tracks the data in CODAP
 * @param  {Object} view - tracks the data the user sees
 */
var ChartController = function(model, view, user_state){
  this.user_state = user_state;
  this.model = model;
  this.view = view;
  this.user_messages = null;

  this.init();
};

ChartController.prototype = {
  /**
   * @function initializes the object
   */
  init: function(){
    this.createChildren()
    .setupHandlers()
    .enable()
    .initializeModelView()
    .codapListeners();
  },
  /**
   * creates the objects the class needs. In this case it doesn't need any
   * @return {Object} this for chainning
   */
  createChildren: function(){
    return this;
  },
  /**
   * @function binds the handlers with the functions
   * @return {Object} this
   */
  setupHandlers: function(){
    this.contextHandler = this.contextCountChanged.bind(this);
    this.selectedAttributeHandler = this.selectedAttribute.bind(this);
    this.changedChartTypeHandler = this.changedChartType.bind(this);

    return this;
  },
  /**
   * @function adds handler functions to the event listeners that are triggered by the user
   * @return {Object} this
   */
  enable: function(){
    this.view.selectedAttributeEvent.attach(this.selectedAttributeHandler);
    this.view.changedChartTypeEvent.attach(this.changedChartTypeHandler);

    return this;
  },
  /**
   * @function initializes model and view to get intial data from CODAP
   * @return {Object} this
   */
  initializeModelView: function(){

    this.model.updateDataContextList().then((val)=>{
      this.model.loadUserState(this.user_state);
      if(this.model.selectedAttributeCount() == 0){
        $('#user-messages').show();
      }
    });
    this.model.loadAvailableCharts();
    this.view.initializeChart();

    return this;
  },
  /**
   * These are the CODAP listeners that are not specific to any data context
   */
  codapListeners: function(){
    codapInterface.on('documentChangeNotice', 'dataContextCountChanged', this.contextHandler);
  },
  /**
   * These are the handler functions
   */
  contextCountChanged: function(){
    this.model.updateDataContextList().then((val)=>{
      console.log("chart event: context added ");
    });
  },
  /**
   * @function selectedAttribute
   * @param  {Object} sender
   * @param  {Object} attribute
   * @param  {string} attribute.name
   * @param  {string} attribute.context
   * @param  {string} attribute.data_type
   */
  selectedAttribute: function(sender, attribute){
    this.model.selectedAttribute(attribute);
  },
  /**
   * @function changedChartType
   * @param  {Object} sender
   * @param  {string} chart
   */
  changedChartType: function(sender, chart){
    this.model.updateChartType(chart);
  }
};
