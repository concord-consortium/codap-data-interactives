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
  this.available_charts =  ['bar', 'doughnut', 'pie', 'radar', 'line'];
  this.model_context_list = [];
  this.selected = {
    context: null,
    attributes: [],
    attribute_limit: null,
    chart_type: 'bar' //default chart is bar chart
  };
  this.cases = null;
  this.chart_metadata = {};
  this.chart_data = {
    type: this.selected.chart_type,
    data: null,
    options: null,
  }

  /************************************************************/
  //    Events
  /************************************************************/

  //context events
  /*  1.select   */ this.selectedContextEvent = new Event(this);
  /*  2.deselect */ this.deselectedContextEvent = new Event(this);
  /*  3.create   */ this.addNewContextEvent = new Event(this);
  /*  4.disabled */

  //attribute events
  /* 1.add      */ this.addAttributeEvent = new Event(this);
  /* 2.move     */ this.moveAttributeEvent = new Event(this);
  /* 3.delete   */ this.deleteAttributeEvent = new Event(this);
  /* 4.select   */ this.selectedAttributeEvent = new Event(this);
  /* 5.deselect */ this.deselectedAttributeEvent = new Event(this);

  //cases events
  /* 1. data  */ this.changedChartDataEvent = new Event(this);
  /* 2. types */ this.loadedChartsListEvent = new Event(this);

  /************************************************************/

};
ChartModel.prototype = {
  /**
   * @function loadUserState
   * @param {Object} state
   * @param {Object} state.selected
   * @param {string} state.selected.context
   * @param {string} state.selected.chart_type
   * @param {Object[]} state.selected.attributes
   */
  loadUserState: function(state){
    if(!state.selected){
      state.selected = this.selected;
    }else{
      this.selected = state.selected;
      //trigger event when loading attribtues and contexts
      this.selectedAttributeEvent.notify(state.selected.attributes);
      this.selectedContextEvent.notify(state.selected.context);

      //update the cases
      if(this.selected.attributes.length != 0){
        var col = this.getAttributeCollection(this.selected.attributes[0], this.selected.context);
        getData(this.selected.context, col,
          this.selected.attributes[0]).then((caseList) => {
            this.updateCases(caseList, this.selected.attributes[0]);
          });
        }
    }
  },
  /**
  * @function loadAvailableCharts - gets chart types information and triggers event
 */
  loadAvailableCharts: function(){
    this.loadedChartsListEvent.notify(this.available_charts);
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
   *            2. notify addNewContext listeners
   *            4. add context change listeners
   *            3. add Attributes
   * @param  {Object} context - data context object returned from CODAP
   * @return {Object[]} list of attribute objects added to the model
   *                         as represented by the model
   */
  addNewContext: function(context){
    return getContext(context.name).then((newContext)=>{
      this.model_context_list.push( newContext );  /* 1 */
      this.addNewContextEvent.notify( newContext.name );  /* 2 */
      this.addContextChangeListeners( newContext); /* 3 */
      return this.getAttributesFromContext(newContext); /* 4 */
    });
  },
  /**
   * @function getAttributesFromContext - sets the context's collection list
   *           to the list recieved from CODAP
   * @param {Object} context - as recieved from CODAP
   * @return {Object[]} att_list - list of object {attribute, collection, name}
   */
  getAttributesFromContext: function(context){
    return getContext(context.name).then((context_info) => {
      var att_list = [];
      context_info.collections.forEach((collection)=>{
        collection.attrs.forEach((attribute)=>{
          att_list.push(attribute.name);
          this.addAttribute(attribute.name, collection.name, context.name);
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
    var col = cxt.collections.find(function(collection){
      //getting a list of the collection's attribute names
      var names = collection.attrs.map(function(att){return att.name});
      return (names.indexOf(attribute) != -1);
    });
    return col.name;
  },
  /**
   * addAttribute - triggers event
   * @param  {string} attribute  name
   * @param  {string} collection name
   * @param  {string} context    name
   */
  addAttribute: function(attribute, collection, context){
    this.addAttributeEvent.notify( {name:attribute, context: context} );
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
      var cxt = null;
      //find and update context
      context.collections = context_info.collections;
      //new attribute order
      var newList = [];
      context_info.collections.map((col)=>{
        col.attrs.map((att)=>{
          newList.push({attribute:att, collection: col});
        });
      });
      for(var i = 0; i < newList.length; i++){
        var msg = [];
        msg.push(newList[i].attribute.name);
        if(i==0) msg.push('first_item'); else msg.push(newList[i-1].attribute.name);
        this.moveAttributeEvent.notify(msg);
      }
    });
  },
  /**
   * @function isAttributeSelected - checks if given attribute is selected
   * @param  {Object}  attribute {context, collection, name, id, etc,... }
   * @return {number}  -1 if not in selected.atttributes array or index
   */
  isAttributeSelected: function(attribute){
    return this.selected.attributes.indexOf(attribute);
  },
  updateChartType: function(type){
    this.selected.chart_type = type;
  },

  /**
   * changeSelectedAttribute
   * @param  {Object} attribute
   * @param  {string} attribute.name
   * @param  {string} attribute.context
   * @param  {string} attribute.data_type
   */
  selectedAttribute : function(attribute){
    var att = attribute.name;
    var cxt = attribute.context;
    //if its a different context or there is no selected context,
    //      then start from scratch and this is first selection
    if(!this.selected.context || this.selected.context != cxt){
      if(!this.selected.context){
        this.selectedContextEvent.notify(cxt);
      } else{
        this.selectedContextEvent.notify(cxt);
        this.deselectedContextEvent.notify(this.selected.context);
      }
      this.selected.attributes = [];
      this.selected.context = cxt;
      this.selected.attributes.push(att);
      this.selectedAttributeEvent.notify(att);
    } else{ //if same context, then we are either changing, adding, or removing an attribute
      if(true){ //this is the limit, changes based on chart
        var unselected = [];
        //notify of unselections
        this.deselectedAttributeEvent.notify(this.selected.attributes);
        //add selection
        this.selectedAttributeEvent.notify(att);
        this.selected.attributes = [];
        this.selected.attributes.push(att);
      }else{
        var index = this.isAttributeSelected(att);
        if(index == -1){
          this.selected.attributes.push(att);
          this.selectedAttributeEvent.notify(att);
        } else{
          this.selected.attributes.splice(index, 1);
          this.deselectedAttributeEvent.notify(att);
        }
      }
    }
    //update the cases
    if(this.selected.attributes.length != 0){
      var col = this.getAttributeCollection(att, this.selected.context);
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
      var contains = false, index = 0;
      var att = val.values[attribute];
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
    var att_max = Math.max(...attCount);
    att_max += Math.round(att_max/10)+1;

    this.selected.attributeList = attMembers;
    this.selected.data = attCount;
    var clrs = getNewColors(attMembers.length);
    this.changedChartDataEvent.notify(
      {
        type: this.selected.chart_type,
        data: {
          labels: attMembers,
          datasets: [{
            data:attCount,
            backgroundColor: clrs.bg_colors,
            borderColor: clrs.colors,
            borderWidth: 2,
          }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{

            }],
            yAxes: [{
              beginAtZero: true,
                stacked: true,
                ticks: {
                  suggestedMax: att_max,
                }
            }]
          }
        }
      });
  },
  //*****************************************************************************
  //
  //                    CONTEXT EVENT LISTENER
  //
  //*****************************************************************************
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
        this.deleteAttributeEvent.notify( attribute_name );
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
                this.deleteAttributeEvent.notify( att.name );
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
              this.deleteAttributeEvent.notify( old_att_list[i] );
            }
          }
        }
      });
    });
  }
};
