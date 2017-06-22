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
    chartType: null,
    context: null,
    attributes: [],
    cases: []
  };
  //Event objects
  this.changeContextCountEvent = new Event(this);
  this.addAttributeEvent = new Event(this);
  this.moveAttributeEvent = new Event(this);
  this.deselectAttributesEvent = new Event(this);
  this.deleteAttributeEvent = new Event(this);
  this.updateAttributeEvent = new Event(this);

  this.changeSelectedAttributeEvent = new Event(this);
  this.deselectContextEvent = new Event(this); //to have view reset colors
  this.changeSelectedDataEvent = new Event(this);
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
   *            3. add Attributes
   *            4. add context change listeners
   * @param  {Object} context - data context object returned from CODAP
   */
  addNewContext: function(context){
    this.model_context_list.push( context );  /* 1 */
    this.changeContextCountEvent.notify( {name: context.name} );  /* 2 */
    this.getAttributesFromContext(true, context);
    //adding listeners
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'moveAttribute', (evt)=>{
      this.moveAttribute(context);
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'createCollection', (evt)=>{
      this.moveAttribute(context);
    }); //collections are created by moving an attribute
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'deleteAttributes', (evt)=>{
      var id_list = evt.values.result.attrIDs;
      var attribute_name = null;
      for(var i = 0; i < id_list.length; i++){
        attribute_name = this.deleteAttributeByID(id_list[i]);
      }
      this.deleteAttributeEvent.notify( {attribute: attribute_name} );
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'createAttributes', (evt)=>{
      var id_list = evt.values.result.attrIDs;


      getData(context.name).then((collectionList)=>{
        //go through each collection to find where the attribtue belongs
        collectionList.forEach((collection) => {
          getData(context.name, collection.name).then((attributeList)=>{
            //iterate through list of created attributes
            for(var x = 0; x < id_list.length; x++){
              //iterate through list of collection's attributes
              for(var y = 0; y < attributeList.length; y++){
                if(id_list[x]==attributeList[y].id){
                  //match was found
                  this.addAttribute(false, attributeList[y], collection, context);
                  this.addAttributeEvent.notify(
                    {name: attributeList[y].name, collection: collection.name, context: context.name });
                }
              }
            }
          });
        });
      });
    });
    codapInterface.on('dataContextChangeNotice['+context.name+']', 'updateAttributes', (evt)=>{
      var att_list = evt.values.result.attrs;
      for (var i = 0; i < att_list.length; i++) {
        for (var j = 0; j < this.model_attribute_list.length; j++) {
          if(att_list[i].id == this.model_attribute_list[j].id){
            var att_info = this.model_attribute_list[j];
            // var att = {name: att_list[i].name, id: att_list[i].id, tittle: att_list[i].title};
            //delete
            this.deleteAttributeByID(att_list[i].id);
            console.log(this.model_attribute_list[j].name);
            this.deleteAttributeEvent.notify( {attribute: this.model_attribute_list[j].name} );
            //add
            // this.addAttribute(false, att,
            //                           att_info.collection,
            //                           att_info.context);
            // this.addAttributeEvent.notify({
            //                                name: att_list[i].name,
            //                                collection: att_info.collection.name,
            //                                context: att_info.context.name
            //                              });

            // this.updateAttributeEvent.notify({
            //   previous: this.model_attribute_list[j].name,
            //   new: att_list[i].name
            // });
            //
            // this.model_attribute_list[j].id  = att_list[i];
            // this.model_attribute_list[j].name = att_list[i];
            // this.model_attribute_list[j].title = att_list[i];
          }
        }
      }
      //move to the right place
      this.moveAttribute(context);

    });

  },
  /**
   * @function deleteAttributeByID
   * @param  {number} id of attribute to be deleted
   * @return {string}    name of attribute deleted
   */
  deleteAttributeByID: function(id){
    var to_return = null;
    for (var i = 0; i < this.model_attribute_list.length; i++) {
      if(this.model_attribute_list[i].id == id){
        var name = this.model_attribute_list[i].name;
        this.model_attribute_list.splice(i, 1); //deletes from model
        return name;
      }
    }
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
   * @function moveAttribute
   * @param  {Object} context
   */
  moveAttribute: function(context){
    getData(context.name).then((collectionList)=>{
      var promises = [];
      collectionList.forEach((collection)=>{ promises.push(getData(context.name, collection.name)); });
      Promise.all(promises).then((values)=>{
        return values;
      }).then( (result)=>{
        var newList = [];
        //populate new list
        for (var i = 0; i < result.length; i++) {
          for( var j = 0; j < result[i].length; j++){
            newList.push({ attribute: result[i][j].name, collection: collectionList[i] });
          }
        }
        this.moveAttributeEvent.notify({attribute: newList[0].attribute, after: "first_item_in_list"});
        this.updateAttributeCollection(newList[0].attribute, newList[0].collection);
        for(var i = 1; i < newList.length; i++){
          this.updateAttributeCollection(newList[i].attribute, newList[i].collection);
          this.moveAttributeEvent.notify( {attribute: newList[i].attribute, after: newList[i-1].attribute} );
        }
      });
    });
    // this.getAttributesFromContext(false, context);
  },
  /**
   * @function updateAttributeCollection
   * @param  {String} attribute
   * @param  {Object} collection
   */
  updateAttributeCollection: function(attribute, collection){
    for(var i = 0; i < this.model_attribute_list.length; i++){
      if(this.model_attribute_list[i].name == attribute){
        this.model_attribute_list[i].collection = collection;
      }
    }
  },
  /**
   * @function getAttributesFromContext - sets the context's collection list
   *           to the list recieved from CODAP
   * @param  {boolean} notify - whether it notifies addAttributeEvent or just
   *                          updates its model
   * @param {Object} context - as recieved from CODAP
   */
  getAttributesFromContext: function(notify, context){
    getData(context.name).then((collectionList) => {
      for (i = 0; i < collectionList.length; i++) {
        this.getAttributesFromCollection(notify, context, collectionList[i]);
      }
    });
  },
  /**
   * @function getAttributesFromCollection
   *
   * @param  {boolean} notify - whether it notifies addAttributeEvent or just
   *                          updates its model
   * @param  {Object} context
   * @param  {Object} collection
   */
  getAttributesFromCollection: function(notify, context, collection){
    getData(context.name, collection.name).then((attributeList)=>{
      for (var j = 0; j < attributeList.length; j++) {
        this.addAttribute(notify, attributeList[j], collection, context);
      }
    });
  },
  addAttribute(notify, attribute, collection, context){
    var att = attribute;
    var attObject = {
      name: att.name,
      title: att.title,
      id: att.id,
      context: context,
      collection: collection
    }
    this.model_attribute_list.push(attObject);
    if(notify) this.addAttributeEvent.notify( {name: att.name, collection: collection.name, context: context.name} );
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
    var att = args.name;
    var cxt = args.context;
    //if its a different context or there is no selected context,
    //      then start from scratch and this is first selection
    var attObject = this.getAttributeObject(att);
    if(this.selected.context == null || this.selected.context != cxt){
      if(this.selected.context != null){
        this.deselectContextEvent.notify({
          context: this.selected.context
        });
      }
      this.selected.attributes = [];
      this.selected.context = attObject.context.name;
      this.selected.attributes.push(attObject);

    } else{ //if same context, then we are either changing, adding, or removing an attribute
      //@TODO make sure to finish adding this functionality
      if(true){ //this is the limit, if stacked chart is not selected
        var unselected = [];
        for (var i = 0; i < this.selected.attributes.length; i++) {
          unselected.push(this.selected.attributes[i].name);
        }
        this.deselectAttributesEvent.notify({
          attributes: unselected
        });
        this.selected.attributes = [];
        this.selected.attributes.push(attObject);
      }else{
        var index = this.isAttributeSelected(attObject);
        if(index == -1){
          this.selected.attributes.push(attObject);
        } else{
          this.selected.attributes.splice(index, 1);
        }
      }
    }
    //update the cases
    if(this.selected.attributes.length != 0){
      getData(this.selected.attributes[0].context.name, this.selected.attributes[0].collection.name,
        this.selected.attributes[0].name).then((caseList) => {
          this.updateCases(caseList, this.selected.attributes[0].name);
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
    this.changeSelectedDataEvent.notify({
      labels: attMembers,
      data: attCount,
      colors: clrs.colors,
      background_colors: clrs.bg_colors
    });
  }
};
