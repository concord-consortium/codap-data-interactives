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
  this.selected = {
    context: null,
    attribute: null,
    chartType: null
  };
  this.changeContextCountEvent = new Event(this);
  this.addAttribute = new Event(this);
  this.moveAttribute = new Event(this);
};
ChartModel.prototype = {
  /**
   * @function updateDataContexList - requests context list from CODAP
   *           in order to add new ones and notifies its event listener
   */
  updateDataContextList: function(){
        getData().then((newContextList) => {
          for (var i = 0; i < newContextList.length; i++) {
            if( !this.hasContext(newContextList[i].id) )
              this.addNewContext(newContextList[i]);
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
   * @param  {string} name
   * @param  {title} title
   * @param  {id} id
   */
  addNewContext: function(name, title, id){
    var newContext = new Context(name, title, id);
    this.model_context_list.push( newContext );  /* 1 */
    this.changeContextCountEvent.notify(  {name: name} );  /* 2 */
    this.contextEventHandlers(name);  /* 3 */
    // newContext.initAttributeList();  /* 4 */
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
  }
  getAttributesFromContext: function(context){

  }
};
/**
 * @constructor This creates a context objects in order to track
 *              collections and attributes
 * @param {string} name
 * @param {string} title
 * @param {number} id
 */
var Context = function(name, title, id){
  this.name = name || '';
  this.title = title || '';
  this.id = id || '';
  this.collectionList = [];
  this.attributeList = [];
};
Context.prototype = {
  /**
   * @function initAttributeList - sets the context's collection list
   *           to the list recieved from CODAP
   * @return {this} to allow chainning to attributes
   */

  initAttributeList: function(){
    getData(this.name).then((collectionList) => {
      this.collectionList = collectionList;
      for (i = 0; i < this.collectionList.length; i++) {
        var color = [150, 150, 150+(155*(i/this.collectionList.length)), 1];
        this.getAttributesFromCollection(this.collectionList[i].title, color);
      }
    });
  },
  getAttributesFromCollection: function(collection, color){
    getData(this.name, collection).then((attributeList)=>{
      for (var j = 0; j < attributeList.length; j++) {
        var newAttribute = new Attribute(attributeList[j].name, attributeList[j].id,
                                          collection, color);
        this.attributeList.push(newAttribute);
      }

    }, function(error){console.log(error);});
  }
}

/**
 * @constructor This creates an attribute object in order to track
 *              its collection and properties
 * @param {string} name
 * @param {number} id
 * @param {string} collection
 * @param {number[]} rgba_color
 */
var Attribute = function(name, id, collection, rgba_color){
  this.name = name || '';
  this.id = id || -1;
  this.collection = collection || '';
  this.color = rgba_color || 'white';
};
