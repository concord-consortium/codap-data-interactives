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
  // this.view = view;

  // this.available_charts =  ['bar', 'doughtnut', 'pie', 'radar', 'line'];
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
    this.changeSelectedAttributeHandler = this.changeSelectedAttribute.bind(this);
    return this;
  },
  /**
   * @function adds handler functions to the event listeners that are triggered by the user
   * @return {Object} this
   */
  enable: function(){
    // this.view.changeSelectedAttributeEvent.attach(this.changeSelectedAttributeHandler);
    return this;
  },
  /**
   * @function initializes model and view to get intial data from CODAP
   * @return {Object} this
   */
  initializeModelView: function(){
    this.model.updateDataContextList().then((val)=>{
      console.log("finished loading state: "+JSON.stringify(val));
      // console.log(this.user_state.selected);
    });

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
   * @function changeelectedAttribute
   * @param  {Object} sender
   * @param  {Object} args   object string of names {name, collection, context{
   */
  changeSelectedAttribute: function(sender, args){
    this.user_state.selected = args;
    this.model.changeSelectedAttribute(args);
  }
};
//****************************
//
//    Global CODAP functions
//
//****************************

function getData(context, collection, attribute){
  var src = "";
  switch (arguments.length){
    case 1:
      src = 'dataContext[' + context +']';
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
