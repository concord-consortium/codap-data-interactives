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
  this.available_charts =  ['bar', 'pie',];
  /**
   * model_context_list - list of context objects as recieved from CODAP
   * @type {Object}
   */
  this.model_context_list = [];
  this.selected = {
    context: null,
    attributes: [],
    attribute_limit: null,
    chart_type: 'bar', //default chart is bar chart
    cases: {}, //a dictionary where keys are unique attributes labels,
                //and values are a list of case objects that belong to that attribute label
  };
  this.chart_data = {
    type: this.selected.chart_type,
    data: {},
    options: {}
  };

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

  //chart events
  /* 1. types */ this.loadedChartsListEvent = new Event(this);
  /* 1. types */ this.changedChartTypeEvent = new Event(this);

  //error events
  /* 1. invalid data */ this.invalidDataEvent = new Event(this);
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
      //trigger event when loading attributes and contexts
      this.selected.attributes.forEach((att)=>{
        if (att == this.selected.attributes[0]){
          this.selectedAttributeEvent.notify({name: att, type: 'primary'});
        } else {
          this.selectedAttributeEvent.notify({name: att, type: 'secondary'});
        }
      });
      this.selectedContextEvent.notify(state.selected.context);

      //load previous chart type
      this.updateChartType(this.selected.chart_type);

      //update the cases
      if(this.selected.attributes.length != 0){
        var col = this.getAttributeCollection(this.selected.attributes[0], this.selected.context);
        getData(this.selected.context, col,
          this.selected.attributes[0]).then((caseList) => {
           this.calculateChartData();
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
      newContextList.map((context)=>{
        if( !this.hasContext(context.id) ) {
          promises.push(this.addNewContext(context));
        }
      });
      return Promise.all(promises)
    });
  },
  /** @function hasContext
  *   @param {number} context_id
  *   @return {boolean}
  */
  hasContext: function(context_id){
    var contains = false;
    this.model_context_list.map((context)=>{
      if(context.id == context_id)
        contains = true;
    });
    return contains;
  },
  /**
   * getContextByName
   * @param  {string} context_name
   * @return {Object} context_object
   */
  getContextByName: function(context_name){
    var context_object = null;
    this.model_context_list.map((cxt)=>{
      if(cxt.name == context_name)
        context_object = cxt;
    });
    return context_object;
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
        var msg = {};
        msg.name = newList[i].attribute.name;
        if(i==0) msg.after = 'first_item'; else msg.after = newList[i-1].attribute.name;
        this.moveAttributeEvent.notify(msg);
      }
    });
  },
  /**
   * @function selectedAttributeCount - returns number of attribtues are selected
   * @return {number}
   */
  selectedAttributeCount: function(){
    return this.selected.attributes.length;
  },
  /**
   * @function isAttributeSelected - checks if given attribute is selected
   * @param  {Object}  attribute {context, collection, name, id, etc,... }
   * @return {number}  -1 if not in selected.atttributes array or index
   */
  isAttributeSelected: function(attribute){
    return this.selected.attributes.indexOf(attribute);
  },
  /**
   * selectedAttribute - handles the selection of new attribute in order to execute
   *                     appropriate behavior
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
      if(!this.selected.context){ //if no previous context selected
        this.selectedContextEvent.notify(cxt);
      } else{ //if there was a selected context, deselect and select new one
        this.selectedContextEvent.notify(cxt);
        this.deselectedContextEvent.notify(this.selected.context);
      }
      this.selected.attributes = [];
      this.selected.context = cxt;
      this.selected.attributes.push(att);
      this.selectedAttributeEvent.notify({name: att, type: 'primary'});
    } else{ //if same context, then we are either adding or removing a selected attribute
      var index = this.isAttributeSelected(att);
      //if the selected limit is reached and the attribute is not already selected
      if(this.selected.attribute_limit <= this.selected.attributes.length && index==-1){
        //remove the last selected attribute and add new one
        while(!this.selected.attributes.length < this.selected.attribute_limit){
          this.deselectedAttributeEvent.notify(this.selected.attributes[this.selected.attributes.length-1]);
          this.selected.attributes.splice(this.selected.attributes.length-1, 1);
        }

        this.selected.attributes.push(att);
        if(this.selected.attributes.length == 1){
          this.selectedAttributeEvent.notify({name: att, type: 'primary'});
        } else  this.selectedAttributeEvent.notify({name: att, type: 'secondary'});
      }else{ //if limit not reached, then user is either adding or removing attribute
        if(index == -1){
          this.selected.attributes.push(att);
          if(this.selected.attributes.length == 1){
            this.selectedAttributeEvent.notify({name: att, type: 'primary'});
          } else  this.selectedAttributeEvent.notify({name: att, type: 'secondary'});
        } else{
          this.selected.attributes.splice(index, 1);
          this.deselectedAttributeEvent.notify(att);
          if(this.selected.attributes.length == 1){
            var temp = this.selected.attributes[0];
            this.deselectedAttributeEvent.notify(temp);
            this.selectedAttributeEvent.notify({name: temp, type: 'primary'});
          }
        }
      }
    }
    if(this.selected.attributes.length != 0)
      this.calculateChartData();
  },
  //*****************************************************************************
  //
  //                    CHART DATA PACKAGING
  //
  //*****************************************************************************
  /**
   * @function calculateChartData - gets user's Chart data based on attributes selected
   */
  calculateChartData: function(){
    var att = this.selected.attributes[0];
    var col = this.getAttributeCollection(att, this.selected.context);
    //if only one attribute is chosen, then plot its count
    if(this.selected.attributes.length == 1){
      this.getPrimaryAttributeCount();
    }
    //if there are more than two atts, then build datasets
    else if(this.selected.attributes.length == 2){
      getData(this.selected.context, col, att).then((caseList) => {
        var type = caseList[0].values[this.selected.attributes[1]];
        if(isNaN(type)){
          this.getSecondaryAttributeCount(caseList);
        } else{
          this.getMultipleAttributeDatasets(caseList);
        }
      });
    }
    else if(this.selected.attributes.length > 2){
      getData(this.selected.context, col, att).then((caseList) => {
        this.getMultipleAttributeDatasets(caseList);
      });
    }

  },
  getMultipleAttributeDatasets: function(caseList){
    //the first attribute selected will be the categories
    var att = this.selected.attributes[0];
    var col = this.getAttributeCollection(att, this.selected.context);

    /**
     * datasets - an array of objects containing the item and its plot values
     * @type {Objects[]} Object - an array of key-value pair objects
     * @type {Object} key - key is a string representing a value of a categorical attributes
     * @type {Object} value - the value is a list of values pertaining to label attributes
     */
    var datasets = [];
    /**
     * labels_list - a list of attributes
     * @type {string}
     */
    var labels_list = this.selected.attributes.slice(1);

    datasets = caseList.map((case_item)=>{
      var values = [];
      var item = {};
      //for eaceh attribute label, get its value
      labels_list.forEach((label)=>{
        values.push(case_item.values[label]);
      });
      //each item's key is the value of its categorical attribute,
      //  and its value is a list containing the values of the label attributes
      //  (the attribute values that are going to be plotted)
      item[case_item.values[att]] = values;
      return item;
    });
    //get the datasets
    var items = this.getCasesCount(datasets, -1);
    var max_y_axis = 0; //this track max for plotting in bar

    this.resetChartData();
    this.chart_data.data.labels = items;


    var chart_clrs = null; //handle color generator for chart type
    for (var i = 0; i < labels_list.length; i++) {
      var set = this.getCasesCount(datasets, i);
      if(Math.max(...set) > max_y_axis){
        max_y_axis = Math.max(...set);
      }
      if ((this.chart_data.type == 'pie' || this.chart_data.type == 'doughnut') && i == 0){
        chart_clrs = getMultipleColors(set.length).colors;
      }
      else if (this.chart_data.type != 'pie' && this.chart_data.type != 'doughnut'){
         chart_clrs = getSingleColor();
       }
      var dataset = {
        data: set,
        label: labels_list[i],
        backgroundColor: chart_clrs,
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 1,
      }
      this.chart_data.data.datasets.push(dataset);
    }
    //chart options
    this.resetChartOptions();
    max_y_axis += Math.round(max_y_axis/10) + 1;
    if (this.selected.chart_type != 'doughnut' && this.selected.chart_type != 'pie'){
        this.chart_data.options.scales = {
        yAxes: [{
          ticks: {
            beginAtZero: true,
            suggestedMax: max_y_axis,
          },
          scaleLabel: {
            display: true,
            labelString: labels_list.join(", "),
          },
        }],
      }
    }

    this.changedChartDataEvent.notify(this.chart_data);
  },
  /**
   * @function getCasesCount - create a list of values from a list of Objects, where the
   *                            objects contain a list of values
   * @param  {Object[]} cases - cases as contructed in getMultipleAttributeDatasets
   * @param  {number} index - number pertaining to which values are retrived, -1 returns a list
   *                          of keys
   * @return {[type]}       [description]
   */
  getCasesCount: function(cases, index){
    var data = cases.map((c)=>{
      var key = Object.keys(c)[0];
      if(index == -1){
        return key;
      } else
      return c[key][index];
    });
    return data;
  },
  /**
   * @function getPrimaryAttributeCount - plot count for a single attributes
   */
  getPrimaryAttributeCount: function(caseList){
    var att = this.selected.attributes[0];
    var col = this.getAttributeCollection(att, this.selected.context);

    getData(this.selected.context, col, att).then((caseList) => {
      var primary_attributes = this.getAttributeUniqueLabels(caseList, att);
      this.selected.cases = primary_attributes;

      var primary_labels = Object.keys(primary_attributes);
      //track max value
      var dataset = primary_labels.map((label)=>{return primary_attributes[label].length;});
      var max_y_axis = Math.max(...dataset);
      max_y_axis += Math.round(max_y_axis/10) + 1; //round max_y_axis up

      //sort primary labels
      if(!isNaN(primary_labels[0])){
        primary_labels = primary_labels.sort(function(a, b){return a-b});
      } else primary_labels = primary_labels.sort();

      //update data
      this.resetChartData();
      this.chart_data.data.datasets.push({
        data: dataset,
        backgroundColor: getMultipleColors(dataset.length).backgroundColor,
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 1,
      });
      this.chart_data.data.labels = primary_labels;

      //update chart options vary depending on type of chart
      //if its not a doughtnut or pie chart then the axis need to be calculated
      this.resetChartOptions();
      if (this.selected.chart_type != 'doughnut' && this.selected.chart_type != 'pie'){
        this.setBartChartAxis(max_y_axis, "Count", att);
      }
      this.changedChartDataEvent.notify(this.chart_data);
    });
  },
  /**
   * @function getSecondaryAttributesCount - get datasets for a stacked chart
   *                                      with categorical secondary attributes
   */
  getSecondaryAttributeCount: function(caseList){
    var att = this.selected.attributes[0];
    var col = this.getAttributeCollection(att, this.selected.context);

    var primary_attributes = this.getAttributeUniqueLabels(caseList, att);
    this.selected.cases = primary_attributes;

    var primary_labels = Object.keys(primary_attributes);
    //track max value
    var max_y_axis = Math.max(...primary_labels.map((label)=>{return primary_attributes[label].length;}));
    max_y_axis += Math.round(max_y_axis/10) + 1; //round max_y_axis up

    //sort primary labels
    if(!isNaN(primary_labels[0])){
      primary_labels = primary_labels.sort(function(a, b){return a-b});
    } else primary_labels = primary_labels.sort();

    //these are secondary attributes
    var secondary_attributes = this.selected.attributes.slice(1);
    var datasets = this.getDatasets(primary_attributes, primary_labels, secondary_attributes);
    var secondary_labels = Object.keys(datasets);

    //sort secondary labels
    if(isNaN(primary_labels[0])){
      secondary_labels = secondary_labels.sort(function(a, b){return a-b});
    } else secondary_labels = secondary_labels.sort();

    //package datasets for chart.js
    var chart_datasets = secondary_labels.map((label)=>{
      var set = {
        label: label,
        data: datasets[label],
        backgroundColor: getSingleColor(),
        borderColor: 'rgba(0,0,0,1)',
        borderWidth: 1,
      };
      return set;
    });

    //update data
    this.resetChartData();
    this.chart_data.data.datasets = chart_datasets;
    this.chart_data.data.labels = primary_labels;

    //update chart options vary depending on type of chart
    //if its not a doughtnut or pie chart then the axis need to be calculated
    this.resetChartOptions();
    if (this.selected.chart_type != 'doughnut' && this.selected.chart_type != 'pie'){
      this.setBartChartAxis(max_y_axis, "Count", att);
    }
    this.changedChartDataEvent.notify(this.chart_data);
  },
  /**
   * @function setBartChartAxis - calculates axis for chart
   * @param {number} max - max number for bar chart's y-axis
   * @param {string} yLabel
   * @param {string} xLabel
   * @param {string} title
   */
  setBartChartAxis: function(max, yLabel, xLabel, title){
    this.chart_data.options.scales = {
      yAxes: [{
        ticks: {
          beginAtZero: true,
          suggestedMax: max
        },
        stacked: true,
        scaleLabel: {
          display: true,
          labelString: yLabel,
        },
      }],
      xAxes: [{
        stacked: true,
        scaleLabel: {
          display: true,
          labelString: xLabel,
        },
      }]
    }
  },
  /**
   * @function getDatasets
   * @param  {object} cases  as recieved from CODAP
   * @param  {string[]} labels primary attribute labels
   * @param  {values} values secondary attributes
   * @return {Object[]} datasets - key/value items where key is secondary label and
   *                               value is its respective dataset
   */
  getDatasets: function(cases, labels, values){
    var secondary_att_objs = {};
    var secondary_att_keys = [];
    values.forEach((val)=>{
      //each secondary attribute gonna have its own data set with length matching labels
      labels.forEach((label)=>{
        secondary_att_objs[label] = this.getAttributeUniqueLabels(cases[label], val);
        var keys = Object.keys(secondary_att_objs[label]).sort();
        secondary_att_keys = this.appendUniqueKeys(secondary_att_keys,keys);
      });
    });
    var datasets = {}; //key,value object where key is the label(for secondary attribute)
                       //and value is the data array
    secondary_att_keys.forEach((key)=>{
      var data = [];
      labels.forEach((label)=>{
        if(secondary_att_objs[label][key]){
          data.push(secondary_att_objs[label][key].length);
        } else data.push(0);
      });
      datasets[key] = data;
    });
    return datasets;
  },
  /**
   * @function appendUniqueKeys - appends two sorted lists without repeated values
   * @param  {array} first
   * @param  {array} second
   * @return {array} merge - combined array containing first and second without repeated values
   */
  appendUniqueKeys: function(first, second){
    //both keys are sorted, adding to array from newkeys
    var merge = [];
    var i =0 ,j = 0;
    while(i < first.length && j < second.length){
      if(first[i]==second[j]){
        merge.push(first[i]);
        i++;
        j++;
      }
      else if(first[i]<second[j]){
        merge.push(first[i]);
        i++;
      }
      else if(first[i]>second[j]){
        merge.push(second[j]);
        j++;
      }
    }
    while(i < first.length){
      merge.push(first[i]);
      i++;
    }
    while(j < second.length){
      merge.push(second[j]);
      j++;
    }
    return merge;
  },
  /**
   * @function getAttributeUniqueLabels - calculates the count of an attribtues
   * @param  {Object[]} cases  - a list of case objects from CODAP
   * @param  {Object[]} cases.values - attribute values of the case
   * @param  {string} att   - attribute name to calculate count
   * @return {Object} labels - keys are unique attribute and values are the count
   *                         of how many times it appeared
   */
  getAttributeUniqueLabels: function(cases, att){
    var att_vals = {};
    cases.forEach(function(case_item){
      if(!att_vals[case_item.values[att]]){
        att_vals[case_item.values[att]] = [];
      }
      att_vals[case_item.values[att]].push(case_item);
    });
    return att_vals;
  },
  //*****************************************************************************
  //
  //                    CHART DATA RESET
  //
  //*****************************************************************************
  /**
   * @function resetChartData - resets data when it needs to be updated
   */
  resetChartData: function(){
    this.chart_data.data = {
      labels: [],
      datasets: []
    }
  },
  /**
   * @function resetChartOptions - resets the options when a chart type is changed
   */
  resetChartOptions: function(){
    this.chart_data.options = {
      responsive: true,
      maintainAspectRatio: false,
    }
  },
  /**
   * @function resetChartOptions - resets the options when a chart type is changed
   */
  updateChartType: function(type){
    if (type == 'pie' || type=='doughnut'){
      this.selected.attribute_limit = 1;
    } else{
      this.selected.attribute_limit = null;
    }

    this.selected.chart_type = type;
    this.chart_data.type = this.selected.chart_type;
    this.resetChartOptions();
    if(this.selected.attributes.length != 0){
      this.calculateChartData();
    }
    this.changedChartTypeEvent.notify(type);
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
      if(evt.values.result.attrs){
      getContext(context.name).then((newContext)=>{
        //iterate through attribute list
          var att_list = [];
          att_list = evt.values.result.attrs; //if attrs exists then there was a name change
          context.collections.forEach((collection)=>{
            collection.attrs.forEach((att)=>{
              for (var i = 0; i < att_list.length; i++) { //iterate through updated list
                if(att_list[i].id == att.id){
                  if(att_list[i].name != att.name){
                    //delete old
                    this.deleteAttributeByID(context.name, att_list[i].id);
                    this.deleteAttributeEvent.notify( att.name );
                    //add new
                    this.addAttribute(att_list[i].name, collection.name, context.name);
                    //update context
                    context.collections = newContext.collections;
                    console.log(newContext.collections);
                    console.log(context.collections);
                    //move to correct position
                    this.moveAttribute(context);
                  }
                }
              }
            });
          });
        });
      }
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
//******************************************************************************
//
//    Global CODAP and helper functions
//
//******************************************************************************
function getData(context, collection, attribute){
  var src = "";
  switch (arguments.length){
    case 1:
      src = 'dataContext[' + context +'].collectionList';
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
function getContext(context){
  return new Promise(function(resolve, reject){
    codapInterface.sendRequest({
      action: 'get',
      resource: 'dataContext['+context+']',
    }, function(result){
      if (result && result.success){
        resolve(result.values);
      } else {
        resolve([]);
      }
    });
  });
}
function getMultipleColors(amount){
  var colors = [];
  var backgroundColor = [];
  for (var i = 0; i < amount; i++) {
    var r = Math.floor( 200 * Math.random()) + 55;
    var g = Math.floor( 200 * Math.random()) + 55;
    var b = Math.floor( 200 * Math.random()) + 55;
    colors.push('rgba('+r+','+g+ ',' +b+ ',1)');
    backgroundColor.push('rgba('+(r-40)+ ','+(g-40)+ ',' +(b-40)+ ',.8)')
  }
  return {colors: colors, backgroundColor: backgroundColor};
}
function getSingleColor(){
    var r = Math.floor( 200 * Math.random()) + 55;
    var g = Math.floor( 200 * Math.random()) + 55;
    var b = Math.floor( 200 * Math.random()) + 55;
    return 'rgba('+r+','+g+ ',' +b+ ',1)';
}
