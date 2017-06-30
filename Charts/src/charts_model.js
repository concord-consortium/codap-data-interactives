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
    attributes: [],
    cases: [],
    attribute_limit: null,
    chart_type: null
  };
  //context events
  //@type {context: string}
  this.changeContextCountEvent = new Event(this);
  //@type {selected: context-string, deselected: context-string}
  this.changedSelectedContextEvent = new Event(this); //to have view selected attributes

  //attribute events
  this.addAttributeEvent = new Event(this);
  this.moveAttributeEvent = new Event(this);
  this.deselectAttributesEvent = new Event(this);
  this.deleteAttributeEvent = new Event(this);
  this.updateAttributeEvent = new Event(this);
  //@type {selected: [{attribute: name, context: name},{}], deselected:  [{attribute: name, context: name},{}]}
  this.changeSelectedAttributeEvent = new Event(this);

  //@TODO cases events
  this.changeSelectedChartEvent = new Event(this);

};
ChartModel.prototype = {
  /**
   * @function loadUserState
   * @param  {Object} state {attributes: name, context: name}
   */
  loadUserState: function(state){
    if(!state.selected){
      state.selected = this.selected;
    }else{
      this.selected = state.selected;
    }
    //trigger event when loading attribtues and contexts
    this.changeSelectedAttributeEvent.notify({
      selected: state.selected.attributes
    });
    this.changedSelectedContextEvent.notify({
      selected: state.selected.context
    });
    //@TODO getData for context
    //update the cases
    if(this.selected.attributes.length != 0){
      var col = this.getAttributeCollection(this.selected.attributes[0], this.selected.context);
      getData(this.selected.context, 'mammals',
        this.selected.attributes[0]).then((caseList) => {
          this.updateCases(caseList, this.selected.attributes[0]);
        });
    }
  },
  /**
   * @function updateDataContexList - requests context list from CODAP
   *           in order to add new ones and notifies its event listener
   * @return {Promise[]} returns addNewContext promises
   */
  updateDataContextList: function(){
    return getData().then((newContextList) => {
      var promises = [];
      for (var i = 0; i < newContextList.length; i++) {
        if( !this.hasContext(newContextList[i].id) ) {
          promises.push(this.addNewContext(newContextList[i]));
        }
      }
      return Promise.all(promises)
    });
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
  /**
   * getContextByName
   * @param  {string} context name
   * @return {Object} context
   */
  getContextByName: function(context){
    for(var i = 0; i < this.model_context_list.length; i++){
      if(this.model_context_list[i].name == context){
        return this.model_context_list[i];
      }
    }
  },
  /**
   * @function addNewContext - adds context to the list and notifies event listeners
   *           responsabilities:
   *            1. add new context object to model_context_list
   *            2. notify changeContextCountEvent listeners
   *            4. add context change listeners
   *            3. add Attributes
   * @param  {Object} context - data context object returned from CODAP
   * @return {Object[]} list of attribute objects added to the model
   *                         as represented by the model
   */
  addNewContext: function(context){
    return getContext(context.name).then((newContext)=>{
      this.model_context_list.push( newContext );  /* 1 */
      this.changeContextCountEvent.notify( {name: newContext.name} );  /* 2 */
      this.addContextChangeListeners( newContext); /* 3 */
      return this.getAttributesFromContext(newContext); /* 4 */
    });
  },
  /**
   * @function getAttributesFromContext - sets the context's collection list
   *           to the list recieved from CODAP
   * @param  {boolean} notify - whether it notifies addAttributeEvent or just
   *                          updates its model
   * @param {Object} context - as recieved from CODAP
   * @return {Object[]} att_list - list of object {attribute, collection, name}
   */
  getAttributesFromContext: function(context){
    return getContext(context.name).then((context_info) => {
      var att_list = [];
      context_info.collections.forEach((collection)=>{
        collection.attrs.forEach((attribute)=>{
          att_list.push( this.addAttribute(attribute.name, collection.name, context.name) );
        });
      });
      return att_list;
    });
  },
  /**
   * @function getAttributeCollection - searches for an attribute
   * @param  {string} attribute
   * @param  {string} context
   * @return {string} collection
   */
  getAttributeCollection: function(attribute, context){
    var cxt = this.model_context_list.find(function(element){
      return element.name == context;
    });
    var col = cxt.collections.find(function(elem){
      var att = elem.attrs.find(function(att){
        return att == attribute;
      });
      console.log(att);
    });
    console.log(col);
  },
  addAttribute: function(attribute, collection, context){
    var attObject = {
      attribute: attribute,
      context: context,
      collection: collection
    }
    this.addAttributeEvent.notify( attObject );
    return attObject;
  },
  /**
   * @function deleteAttributeByID
   * @param  {string} context of attribute to be deleted
   * @param  {number} id of attribute to be deleted
   * @return {string}    name of attribute deleted
   */
  deleteAttributeByID: function(context, id){
    //get the context
    var cxt = this.getContextByName(context);
    var collections = cxt.collections;
    //search through the collections for the right attribute
    for (var j = 0; j < collections.length; j++) {
      var collection = collections[j];
      for(var i = 0; i < collection.attrs.length; i++){
        if(collection.attrs[i].id == id){
          var name = collection.attrs[i].name;
          collection.attrs.splice(i, 1); //deletes from model
          return name;
        }
      }
    };
  },
  /**
   * @function deleteAttributeByID
   * @param  {string} context of attribute to be deleted
   * @param  {number} name of attribute to be deleted
   * @return {string}    name of attribute deleted
   */
  deleteAttributeByName: function(context, name){
    //get the context
    var cxt = this.getContextByName(context);
    var collections = cxt.collections;
    //search through the collections for the right attribute
    for (var j = 0; j < collections.length; j++) {
      var collection = collections[j];
      for(var i = 0; i < collection.attrs.length; i++){
        if(collection.attrs[i].name == name){
          var name = collection.attrs[i].name;
          collection.attrs.splice(i, 1); //deletes from model
          return name;
        }
      }
    };
  },
  /**
   * @function moveAttribute
   * @param  {Object} context
   */
  moveAttribute: function(context){
    getContext(context.name).then((context_info)=>{
      context.collections = context_info.collections; //update collections
      //new attribute order
      var newList = [];
      context_info.collections.map((col)=>{
        col.attrs.map((att)=>{
          newList.push({attribute:att, collection: col});
        });
      });
      for(var i = 0; i < newList.length; i++){
        var msg = {attribute: newList[i].attribute.name}
        if(i==0) msg.after = 'first_item'; else msg.after = newList[i-1].attribute.name;
        this.moveAttributeEvent.notify(msg);
      }
    });
  },
  /**
   * @function getAttributeObject - return attribute object
   * @param  {string} name of attribute
   * @return {Object}      attribute object with context and collection data
   */
  getAttributeObject: function(name){
    for(var i = 0; i < this.model_attribute_list.length; i++){
      if(name == this.model_attribute_list[i].name){
        return this.model_attribute_list[i];
      }
    }
    return null;
  },
  /**
   * @function isAttributeSelected - checks if given attribute is selected
   * @param  {Object}  attribute {context, collection, name, id, etc,... }
   * @return {number}  -1 if not in selected.atttributes array or index
   */
  isAttributeSelected: function(attribute){
    for(var i = 0; i < this.selected.attributes.length; i++)
      if (attribute == this.selected.attributes[i]) return i;
    return (-1);
  },
  /**
   * changeSelectedAttribute
   * @param  {Object} args {name, collection, context}
   */
  changeSelectedAttribute: function(args){
    var att = args.attribute;
    var col = args.collection;
    var cxt = args.context;
    //if its a different context or there is no selected context,
    //      then start from scratch and this is first selection
    if(!this.selected.context || this.selected.context != cxt){
      if(!this.selected.context){
        this.changedSelectedContextEvent.notify({
          selected: cxt,
          deselected: null
        });
      } else{
        this.changedSelectedContextEvent.notify({
          selected: cxt,
          deselected: this.selected.context
        });
      }
      this.selected.attributes = [];
      this.selected.context = cxt;
      this.selected.attributes.push(att);
      this.changeSelectedAttributeEvent.notify({
        selected: att,
      });
    } else{ //if same context, then we are either changing, adding, or removing an attribute
      //@TODO make sure to finish adding this functionality
      if(true){ //this is the limit, changes based on chart
        var unselected = [];
        this.changeSelectedAttributeEvent.notify({
          selected: att,
          deselected: this.selected.attributes
        });
        this.selected.attributes = [];
        this.selected.attributes.push(att);
      }else{
        var index = this.isAttributeSelected(att);
        if(index == -1){
          this.selected.attributes.push(att);
          this.changeSelectedAttributeEvent.notify({
            selected: att,
          });
        } else{
          this.selected.attributes.splice(index, 1);
          this.changeSelectedAttributeEvent.notify({
            deselected: [att],
          });
        }
      }
    }
    //update the cases
    if(this.selected.attributes.length != 0){
      getData(this.selected.context, col,
        this.selected.attributes[0]).then((caseList) => {
          this.updateCases(caseList, this.selected.attributes[0]);
        });
    }
  },
  updateCases: function(cases, attribute){
    var attMembers = [];
    var attCount = [];

    cases.forEach(function(val){
      var att = val.values[attribute];
      var contains = false, index = 0;
      for(i = 0; i < attMembers.length; i++){
        if (att == attMembers[i]){
          contains = true;
          index = i;
        }
      }
      if (contains){
        attCount[index] += 1;
      }
      else {
        attCount.push(1);
        attMembers.push(att);
      }
    });
    this.selected.attributeList = attMembers;
    this.selected.data = attCount;
    var clrs = getNewColors(attMembers.length);
    this.changeSelectedChartEvent.notify({
      labels: attMembers,
      data: attCount,
      colors: clrs.colors,
      background_colors: clrs.bg_colors
    });
  },
  /**
   * addContextChangeListeners
   * @param  {Object} context
   */
  addContextChangeListeners: function(context){
    //adding listeners
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'deleteAttributes', (evt)=>{
      var id_list = evt.values.result.attrIDs;
      for(var i = 0; i < id_list.length; i++){
        var attribute_name = this.deleteAttributeByID(context.name, id_list[i]);
        this.deleteAttributeEvent.notify( {attribute: attribute_name} );
      }
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'createAttributes', (evt)=>{
      var id_list = evt.values.result.attrIDs;
      getContext(context.name).then((newContext)=>{
        context.collections = newContext.collections; //update collections
        newContext.collections.forEach((collection)=>{
          collection.attrs.forEach((att)=>{
            //iterate through list of created attributes
            for(var x = 0; x < id_list.length; x++){
              //iterate through list of collection's attributes
              if(id_list[x]==att.id){
                //match was found
                this.addAttribute(att.name, collection.name, context.name);
                //move to correct position
                this.moveAttribute(context);
              }
            }
          });
        });
      });
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'createCollection', (evt)=>{
      this.moveAttribute(context);
    }); //collections are created by moving an attribute
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'moveAttribute', (evt)=>{
      this.moveAttribute(context);
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'updateAttributes', (evt)=>{
      var att_list = evt.values.result.attrs;
      getContext(context.name).then((newContext)=>{
        //iterate through attribute list
        context.collections.forEach((collection)=>{
          collection.attrs.forEach((att)=>{
            for (var i = 0; i < att_list.length; i++) { //iterate through updated list
              if(att_list[i].id == att.id){
                //delete old
                this.deleteAttributeByID(context.name, att_list[i].id);
                this.deleteAttributeEvent.notify( {attribute: att.name} );
                //add new
                this.addAttribute(att_list[i].name, collection.name, context.name);
              }
            }
          });
        });
        //update context
        context.collections = newContext.collections;
        //move to correct position
        this.moveAttribute(context);
      });
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'deleteCollection', (evt)=>{
      getContext(context.name).then((newContext)=>{
        //get the new count of attributes
        var new_att_list = [];
        newContext.collections.map((collection)=>{
          collection.attrs.map((att)=>{
            new_att_list.push(att.name);
          });
        });
        //get old count of attributes
        var old_att_list = [];
        context.collections.map((collection)=>{
          collection.attrs.map((att)=>{
            old_att_list.push(att.name);
          });
        });
        //if same then attribute was moved
        if(old_att_list.length == new_att_list.length){
          this.moveAttribute(context);
        } else{ //if an old attribute is not in the new list, then delete
          for(var i = 0; i < old_att_list.length; i++){
            var index = new_att_list.indexOf(old_att_list[i]);
            if(index == -1){ //if index is -1 then not in new list
              this.deleteAttributeByName(context.name, old_att_list[i]);
              this.deleteAttributeEvent.notify( {attribute: old_att_list[i]} );
            }
          }
        }
      });
    });
  }
};
