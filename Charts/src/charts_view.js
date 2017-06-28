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
  this.changeSelectedAttributeEvent = new Event(this);
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
    return this;
  },
  setupHandlers: function(){
    //context events
    this.changeContextCountHandler = this.changeContextCount.bind(this);
    this.toggleContextHandler = this.toggleContext.bind(this);
    //@TODO disable context if it does not exist

    //chart events
    this.changeSelectedChartHandler = this.changeSelectedChart.bind(this);

    //attribute events
    this.addAttributeHandler = this.addAttribute.bind(this);
    this.deleteAttributeHandler = this.deleteAttribute.bind(this);
    this.updateAttributeHandler = this.updateAttribute.bind(this);
    this.moveAttributeHandler = this.moveAttribute.bind(this);

    //user-triggered-attribute events
    this.changeSelectedAttributeHandler = this.changeSelectedAttribute.bind(this);
    this.deselectAttributesHandler = this.deselectAttributes.bind(this);


    return this;
  },
  enable: function(){
    this.model.changeContextCountEvent.attach(this.changeContextCountHandler);
    this.model.addAttributeEvent.attach(this.addAttributeHandler);
    this.model.changedSelectedContextEvent.attach(this.toggleContextHandler);
    this.model.deselectAttributesEvent.attach(this.deselectAttributesHandler);
    this.model.deleteAttributeEvent.attach(this.deleteAttributeHandler);
    this.model.moveAttributeEvent.attach(this.moveAttributeHandler);
    this.model.updateAttributeEvent.attach(this.updateAttributeHandler);

    //Own event listeners
    this.changeSelectedAttributeEvent.attach(this.changeSelectedAttributeHandler);
    return this;
  },
  changeSelectedChart: function(){
    //@TODO get the new chart and notify listener

  },
   /**
   * attributeMove
   * @param  {sender} sender
   * @param  {Object} args   {attribute: name of attribute moved,
   *                         after: name of attribute it is after}
   */
   moveAttribute: function(sender, args){
     $("#"+args.attribute).insertAfter('#'+args.after);
   },
   /**
   * @function changeContextCount - adds context to UI
   * @param  {Object} sender
   * @param  {Object} args   information about the new context
   *                         {name: string}
   */
  changeContextCount: function(sender, args){
    addContextDOM(args.name);
  },
  /**
   * @function addAttribute - handles new attribute event
   * @param  {Object} sender
   * @param  {Object} args   information about the new attribute
   *                         {attribute, collection, context, after(optional)}
   */
  addAttribute: function(sender, args){
    if(args.after){
      addAttributeToContextDOM(args.attribute, args.collection, args.context, args.after);
    } else {
      addAttributeToContextDOM(args.attribute, args.collection, args.context);
    }
    $('#'+args.attribute).on('click', (evt) => {
      evt.stopPropagation();
      this.changeSelectedAttributeEvent.notify(args);
    });
  },
  /**
   * @function changeSelectedAttribute - stylizes the attribute item after click
   * @param  {Object} sender
   * @param {Object} args  information about the new attribute
   *                             {attribute, collection, context}
   */
  changeSelectedAttribute: function(sender, args){
    $('#'+args.attribute).toggleClass("selected");
  },
  /**
   * @function toggleContext - stylize unselected context back to original
   * @param  {Object} sender
   * @param  {Object} args   {context: string}
   */
  toggleContext: function(sender, args){
    $('#'+args.context).find(".selected").toggleClass("selected");
  },
  /**
   * @function deselectAttributes
   * @param  {Object} sender
   * @param  {Object} args   {attributes: []}
   */
  deselectAttributes: function(sender, args){
    var list = args.attributes;
    for (var i =0; i < list.length; i++){
      $('#'+list[i]).toggleClass("selected");
    }
  },
  /**
   * @function deleteAttribute
   * @param  {Object} sender [description]
   * @param  {Object} args   {attribute: name}
   */
  deleteAttribute: function(sender, args){
    $('#'+args.attribute).slideToggle('normal', function(){
      $(this).remove();
    });
  },
  /**
   * @function updateAttribute
   * @param  {object} sender
   * @param  {args} args   {previous: string, new: string}
   */
  updateAttribute: function(sender, args){
    console.log(args);
    $('#'+args.previous).attr('id',args.new);
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
 * @param {string} collection
 * @param {string} context
 */
function addAttributeToContextDOM(attribute, collection, context, attribute_after){
  var $item = $("<li>", {'id': attribute, 'class':'view-attribute-list '+collection});
  var isVisible = $('#'+context).children().is(':visible');
  if(!isVisible){
    $item.css("display", 'none');
  }
  $item.text(attribute);
  if(arguments.length == 4){ //insert after element
    $item.insertAfter('#'+attribute_after);
  }else $('#'+context).append($item);
}
