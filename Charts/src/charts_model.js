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
 *  @constructor ChartModel - creates a model for the data that needs to be
 *     requested from CODAP.
 *     It talks to CODAP in order to keep the user data updated based on
 *     the user interactions during their session.
 *     It tracks the user selections to have an interactive state.
 *
 */
var ChartModel = function(){
  this.model_context_list = [];
  this.model_attribute_list = [];
  this.selected = {
    context: null,
    attribute: null,
    chartType: null
  };
  //Event objects
  this.changeContextCountEvent = new Event(this);
  this.addAttributeEvent = new Event(this);
  this.moveAttributeEvent = new Event(this);
};
ChartModel.prototype = {
  /**
   * @function updateDataContexList - requests context list from CODAP
   *           in order to add new ones and notifies its event listener
   */
  updateDataContextList: function(){
    getData().then((newContextList) => {
      for (var i = 0; i < newContextList.length; i++) {
        if( !this.hasContext(newContextList[i].id) ) {
          this.addNewContext(newContextList[i]);
        }
      }
    });
  },
  /**
   * @function addNewContext - adds context to the list and notifies event listeners
   *           responsabilities:
   *            1. add new context object to model_context_list
   *            2. notify changeContextCountEvent listeners
   *            3. add Events that listen to context changes
   *            4. add Attributes
   * @param  {Object} context - data context object returned from CODAP
   */
  addNewContext: function(context){
    this.model_context_list.push( context );  /* 1 */
    this.changeContextCountEvent.notify( {name: context.name} );  /* 2 */
    this.getAttributesFromContext(context);
  },
  /** @function hasContext
  *   @param {number} context_id
  *   @return {boolean}
  */
  hasContext: function(context_id){
    for(i = 0; i < this.model_context_list.length; i++){
      if(this.model_context_list[i].id == context_id){
        return true;
      }
    }
    return false;
  },
  contextEventHandlers: function(context){
  },

  /**
   * @function getAttributesFromContext - sets the context's collection list
   *           to the list recieved from CODAP
   * @param {Object} context - as recieved from CODAP
   */
  getAttributesFromContext: function(context){
    getData(context.name).then((collectionList) => {
      for (i = 0; i < collectionList.length; i++) {
        this.getAttributesFromCollection(context, collectionList[i]);
      }
    });
  },
  /**
   * @function getAttributesFromCollection
   * @param  {Object} collection
   */
  getAttributesFromCollection: function(context, collection){
    getData(context.name, collection.name).then((attributeList)=>{
      for (var j = 0; j < attributeList.length; j++) {
        var att = attributeList[j];
        var attObject = {
          name: att.name,
          title: att.title,
          id: att.id,
          context: context,
          collection: collection
        }
        this.model_attribute_list.push(attObject);
        this.addAttributeEvent.notify( {name: att.name, collection: collection.name, context: context.name} );
      }
    });
  }
};
