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
  this.contextList = [];
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
              this.addNewContext(newContextList[i].name, newContextList[i].title, newContextList[i].id);
          }
        });
  },
  /**
   * @function addNewContext - adds context to the list and notifies event listeners
   * @param  {string} name
   * @param  {title} title
   * @param  {id} id
   */
  addNewContext: function(name, title, id){
    this.contextList.push(
      new Context(name, title, id)
    );
    this.changeContextCountEvent.notify(
      {name: name}
    );
  },
  /** @function hasContext
  *   @param {number} context_id
  *   @return {boolean}
  */
  hasContext: function(context_id){
    for(i = 0; i < this.contextList.length; i++){
      if(this.contextList[i].id == context_id){
        return true;
      }
    }
    return false;
  }
};

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
