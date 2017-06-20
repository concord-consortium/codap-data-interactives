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
 * @constructor ChartView - focuses on what is displayed in the UI and listens to user actions
 * @param  {Object} model - uses the model to communicate with CODAP
 */
var ChartView = function(model){
  this.model = model;

  //user events
  this.addSelectedAttributeEvent = new Event(this);

  //chart events
  this.changeChartDataEvent = new Event(this);

  this.init();
};

ChartView.prototype = {
  init: function(){
    this.createChildren()
    .setupHandlers()
    .enable();
  },
  createChildren: function(){

    this.$attrElement = $('#contextList');
    return this;
  },
  setupHandlers: function(){
    this.changeContextCountHandler = this.changeContextCount.bind(this);
    this.addAttributeHandler = this.addAttribute.bind(this);
    this.addSelectedAttributeHandler = this.addSelectedAttribute.bind(this);
    return this;
  },
  enable: function(){
    this.model.changeContextCountEvent.attach(this.changeContextCountHandler);
    this.model.addAttributeEvent.attach(this.addAttributeHandler);

    //Own event listeners
    this.addSelectedAttributeEvent.attach(this.addSelectedAttributeHandler);

    return this;
  },
  changeContextCount: function(sender, args){
    addContextDOM(args.name);
  },
  /**
   * @function addAttribute - handles new attribute event
   * @param  {Object} sender
   * @param  {Object[]} args   information about the new attribute
   *                         (attribute name, collection name, and context name)
   */
  addAttribute: function(sender, args){
    addAttributeToContextDOM(args.name, args.collection, args.context);
    $('#'+args.name).on('click', (evt) => {
      evt.stopPropagation();
      this.addSelectedAttributeEvent.notify(args);
    });
  },
  /**
   * @function addSelectedAttribute - stylizes the attribute item after click
   * @param {string} attribute
   */
  addSelectedAttribute: function(sender, args){
    $('#'+args.name).toggleClass("selected");
  }
}
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
    $(this).children().slideToggle('slow');
  })
  $('#contextList').append($unList);
}
/**
 * @function addAttributeToContextDOM - adds a single attribute element to context list
 * @param {string} attribute
 * @param {string} collection
 * @param {string} context
 */
function addAttributeToContextDOM(attribute, collection, context){
  var $item = $("<li>", {'id': attribute, 'class':'view-attribute-list'});
  $item.css("display", 'none');
  $item.text(attribute);
  $('#'+context).append($item);
}
