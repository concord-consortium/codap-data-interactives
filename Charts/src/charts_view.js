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
    this.contextHandler = this.contextCountHandler.bind(this);
    this.addAttributeHandler = this.addAttributeEventHandler.bind(this);
    return this;
  },
  enable: function(){
    this.model.changeContextCountEvent.attach(this.contextHandler);
    this.model.addAttributeEvent.attach(this.addAttributeHandler);

    return this;
  },
  contextCountHandler: function(sender, args){
    addContextDOM(args.name);
  },
  /**
   * @function addAttributeEventHandler - handles new attribute event
   * @param  {Object} sender
   * @param  {Object} args   information about the new attribute
   */
  addAttributeEventHandler: function(sender, args){
    addAttributeToContextDOM(args.name, args.collection, args.context);
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
  var $item = $("<li>", {'id': attribute, 'class':'view-attribute-list '+collection});
  $item.css("background-color", 'lightblue');
  $item.css("display", 'none');

  $item.hover(
    function(){ $(this).css("background-color", "white"); },
    function(){ $(this).css("background-color", "lightblue"); }
  );
  $item.text(attribute);
  $item.click(function(event){
    event.stopPropagation();

  });
  $('#'+context).append($item);
}
