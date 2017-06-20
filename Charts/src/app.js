``//=================================================================
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

function initCodapInterface(){
  // initialize the codapInterface
  codapInterface.init({
    name: 'Graphs',
    dimensions: {width: 700, height: 500},
    title: 'Graphs',
    version: '0.1',
  }).then(function(iResult){
    // selected = codapInterface.getInteractiveState();
    // if(!selected.graph){
    //   console.log("hre");
    //   selected.graph = "bar";
    // }
    // if(!selected.data || !selected.attributeList){
    //   selected.data = [];
    //   selected.attributeList = [];
    //   initChart();
    // }
    // else{
    //   document.getElementById('select-chart').value = selected.graph;
    //   chart.draw();
    // }
    // loadInitialSettings();
    listenToChanges();
  });
}
function listenToChanges(){
  //when this happens, it should notify the event listeners that a context was created
	// codapInterface.on('documentChangeNotice', 'dataContextCountChanged', updateDataContex);

  //listeners for author information
  var info = document.getElementById('info');
  var modal = document.getElementById('authorinfo');
  info.onclick = function(){
    $(modal).fadeIn("fast");
  };
  var close = document.getElementById('close-author');
  close.onclick = function(){
    $(modal).fadeOut("fast");
  };
}


var selected;

var info = {
  graph : ['bar', 'pie', 'doughnut','line', 'radar', 'polarArea','bubble'],
  getGraphsList: function(){
    var charts = document.getElementById('select-chart');
    charts.innerHTML = "";
    info.graph.forEach(function (g) {
      charts.innerHTML += '<option value="' + g + '">' + g + "</option>";
    });
  }
};



// pulll intiail data from CodapInterface
function getInitialData(){
  var contextUI = document.getElementById('contextList');
  contextUI.innerHTML = "";
  //get list of dataContext from CODAP
  getData().then(function(contextList){
    //for each context populate attributes
    contextList.forEach(function(context){
      addContextToList(context.name);
      getData(context.name).then(function(collectionList){
        populateContextFromCollectionList(collectionList, context.name);
      });
    });
  });
}
function addContextToList(context){
  var contextUI = document.getElementById('contextList');
  var newItem = document.createElement('ul');
  newItem.className = context;
  newItem.id = context;
  newItem.appendChild(document.createTextNode(context));
  newItem.onclick= function(){
    $(newItem).children().toggle("fast"); //switches display from none to initial
  };
  addContextListeners(context);
  contextUI.appendChild(newItem);
}
function addContextListeners(context){
  codapInterface.on('dataContextChangeNotice['+context+']', 'createCollection',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'deleteCollection',
    function(){deleteCollection(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'moveAttribute',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'createAttributes',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'updateAttributes',
    function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'deleteAttributes',
    function(){updateContextAttribtueList(context)});
}
function populateContextFromCollectionList(collectionList, context){
  var count = 0;
  var total = collectionList.length;
  collectionList.forEach(function(collection){
    var color = "rgba(100, 100, 170, "+ (.6-(count/total))+")";
    count+=1;
    getData(context, collection.name).then(function(attributeList){
      attributeList.forEach(function(attribute){
        // addAttributesToContext(attribute.name, collection.name, context);
        addAttributesToContext(attribute.name, collection.name, context, color);
      });
    });
  });
}
function addAttributesToContext(attribute, collection, context, color){
  var attributeList = document.getElementById(context);
  var newItem = document.createElement('li');
  if (selected.context == context){
    newItem.className = collection;
  }else{
    newItem.className = collection +' hidden';
  }
  newItem.id = attribute;
  newItem.appendChild(document.createTextNode(attribute));
  newItem.onclick = function(event){
    event.stopPropagation();
    if(typeof selected.attribute !== 'undefined'){ //revert the last selection to original functionality
      $('#'+selected.attribute.att).mouseleave(function(){$(this).css("background", selected.attribute.clr)});
      $('#'+selected.attribute.att).css("background", selected.attribute.clr);
    }
    $(newItem).mouseleave(function(){$(this).css("background", "white")});

    selected.context = context;
    selected.collection = collection;
    selected.attribute = {
      att: attribute,
      clr: color
    };
    getData(context, collection, attribute).then(
      function(caseList){
        populateData(caseList, attribute);
        getNewColors();
        chart.draw();
    });
    codapInterface.on('dataContextChangeNotice['+context+']', 'updateCases', function(){
      getData(context, collection, attribute).then(
        function(caseList){
          populateData(caseList, attribute);
          chart.draw();
      });
    });
  }
  if(arguments.length == 4){
    newItem.style.backgroundColor = color;
    $(newItem).mouseenter(function() {
      $(this).css("background", "white"); })
              .mouseleave(function() {
      $(this).css("background", color);
    });
  }
  attributeList.appendChild(newItem);
}
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

function populateData(cases, attribute){
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
  selected.attributeList = attMembers;
  selected.data = attCount;
}
function getNewColors(amount){
  var colors = [];
  var backgroundColor = [];
  for (var i = 0; i < amount; i++) {
    var r = Math.floor( 200 * Math.random()) + 55;
    var g = Math.floor( 200 * Math.random()) + 55;
    var b = Math.floor( 200 * Math.random()) + 55;
    colors.push('rgba('+r+','+g+ ',' +b+ ',1)');
    backgroundColor.push('rgba('+(r-40)+ ','+(g-40)+ ',' +(b-40)+ ',.8)')
  }
  return {colors: colors, bg_colors: backgroundColor};
}

/*
  Change listeners
*/
function updateDataContext(){
  getData().then(function(contextList){
    contextList.forEach(function(context){
      if($('#contextList').children("#"+context.name).length == 0){
        addContextToList(context.name);
        getData(context.name).then(function(collectionList){
          populateContextFromCollectionList(collectionList, context.name);
        });
      }
    });
  });
}
function getContextAttributeCount(context){
console.log("attempting count");
  return new Promise(function(resolve, reject){
    var count = 0;
    getData(context).then(function(collectionList){
      collectionList.forEach(function(col){
        getData(context, col.title).then(function(attList){
          count+=attList.length;
          console.log(count);
        });
      });
    });
    resolve(count);
  });
}
function updateContextAttribtueList(context){
  getData(context).then(function(collectionList){
    var contextUI = document.getElementById(context);
    $('#'+context).empty();
    contextUI.appendChild(document.createTextNode(context));
    populateContextFromCollectionList(collectionList, context);
  }, function(error){

  });
}

function deleteCollection(context){
  getContextAttributeCount(context).then(function(total){
    console.log("total "+total);
  });
  // var count = 0;
  // getData(context).then(function(collectionList){
  //   collectionList.forEach(function(col){
  //     getData(context, col.title).then(function(attList){
  //       count+=attList.length;
  //     });
  //   });
  // });
  // getData().then(function(dataContextList){
  //   console.log(dataContextList);
  //   console.log( $('#'+context).children().length );
  //   if(dataContextList.length == $('#'+context).children().length){
  //     //then it was a move attribute and not a delete collection
  //     console.log("move");
  //   }
  //   else{
  //     //an attribute/s was deleted and should check
  //     console.log("deletion");
  //   }
  // })
  // getData(context).then(function(collectionList){
  //   var toDelete = $("#"+context).children();
  //   var newList = collectionList.map(function(col){ return col.title})
  //   for (var i = 0; i < toDelete.length; i++) {
  //     var coll = $(toDelete[i]).attr('class').split(' ')[0];
  //     if(!newList.includes(coll.toString())){
  //       $('.'+coll.toString()).slideUp("slow", function(){$(this).remove()});
  //     }
  //   }
  // });
}
