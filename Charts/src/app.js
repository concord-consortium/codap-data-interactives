var info = {
  labels : ["context", "collection", "attribute"],
  graph : ['bar', 'pie', 'doughnut','line', 'radar', 'polarArea','bubble', 'scales'],
  contextList : [],
  collectionList :[],
  attributeList : [],
  data:  [],
  colors: [],
  backgroundColor: [],
  selected : {
    context : null,
    collection : null,
    attribute : null,
    graph : "bar"
  },
  getGraphsList: function(){
    var charts = document.getElementById('select-chart');
    charts.innerHTML = "";
    info.graph.forEach(function (g) {
      charts.innerHTML += '<option value="' + g + '">' + g + "</option>";
    });
  }

};

// initialize the codapInterface
codapInterface.init({
    name: 'Graphs',
    dimensions: {width: 500, height: 400},
    title: 'Graphs',
    version: '0.1',
});
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
  info.contextList.push(context);
  var newItem = document.createElement('ul');
  newItem.className = context;
  newItem.id = context;
  newItem.appendChild(document.createTextNode(context));
  newItem.onclick= function(){
    $(newItem).children().toggle("slow"); //switches display from none to initial
  };
  codapInterface.on('dataContextChangeNotice['+context+']', 'createCollection', function(){updateContextAttribtueList(context)});
  codapInterface.on('dataContextChangeNotice['+context+']', 'deleteCollection', function(){updateContextAttribtueList(context)});
  contextUI.appendChild(newItem);
}
function populateContextFromCollectionList(collectionList, context){
  collectionList.forEach(function(collection){
    getData(context, collection.name).then(function(attributeList){
      attributeList.forEach(function(attribute){
        addAttributesToContext(attribute.name, collection.name, context);
      });
    });
  });
}
function addAttributesToContext(attribute, collection, context){
  var attributeList = document.getElementById(context);
  var newItem = document.createElement('li');
  newItem.className = collection +' hidden';
  newItem.id = attribute;
  newItem.appendChild(document.createTextNode(attribute));
  newItem.onclick = function(){
    getData(context, collection, attribute).then(
      function(caseList){
        populateData(caseList, attribute);
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
      src = 'dataContext[' + context +'].collection['+ collection + '].caseSearch[' + attribute +' != \'\']';
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

function populateData(recieved, attribute){
  var attMembers = [];
  var attCount = [];
  var colors = [];
  var backgroundColor = [];

  recieved.forEach(function(val){
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
      var r = Math.floor( 200 * Math.random()) + 55;
      var g = Math.floor( 200 * Math.random()) + 55;
      var b = Math.floor( 200 * Math.random()) + 55;
      colors.push('rgba('+r+','+g+ ',' +b+ ',.6)');
      backgroundColor.push('rgba('+r+','+g+ ',' +b+ ',1)')
    }
  });
  info.attributeList = attMembers;
  info.data = attCount;
  info.colors = colors;
  info.backgroundColor = backgroundColor;
  chart.draw();

}
function listenToChanges(){
	// codapInterface.on('documentChangeNotice', 'dataContextCountChanged', updateDataContext);
}
//active listeners
/*
dataContext - countchanged
collection - create, delete, update
attribute - create, delete, move, update
cases - update
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
function updateContextAttribtueList(context){
  var contextUI = document.getElementById(context);
  $('#'+context).empty();
  contextUI.appendChild(document.createTextNode(context));
  getData(context).then(function(collectionList){
    populateContextFromCollectionList(collectionList, context);
  });
}
